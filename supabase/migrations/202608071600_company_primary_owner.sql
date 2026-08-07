-- The main owner of a company, and the one membership nobody may edit.
--
-- Until now every owner was interchangeable. The only protection was
-- app_private.is_company_owner plus a client-side "don't touch the last remaining owner"
-- check, so any owner could demote any other owner -- including the person whose company it
-- is -- and the company could be taken over by whoever moved first.
--
-- "Main owner" was not recorded anywhere, so it is made explicit here rather than derived at
-- read time. Deriving it from "earliest membership" would silently move if the founder ever
-- left and rejoined, and an authorization rule must not depend on a row's history.
--
-- The rule this establishes:
--   * any active owner may still change any other member, including another owner;
--   * nobody may change the primary owner's role or status -- not another owner, not
--     themselves;
--   * a platform admin can, so support has a way to hand a company over.

alter table public.companies
  add column if not exists primary_owner_profile_id uuid references public.profiles(id) on delete set null;

comment on column public.companies.primary_owner_profile_id is
  'The company''s main owner. Their membership cannot be changed by anyone except a platform admin.';

-- Backfill: the earliest membership. Verified against live data first -- in every existing
-- company that row is an active owner, so this names the founder rather than a guess.
update public.companies c
set primary_owner_profile_id = sub.profile_id
from (
  select distinct on (cm.company_id) cm.company_id, cm.profile_id
  from public.company_memberships cm
  order by cm.company_id, cm.created_at asc
) sub
where sub.company_id = c.id
  and c.primary_owner_profile_id is null;

-- A new company must not be left without one. Rather than patch every creation path, claim
-- the first owner membership as it arrives.
create or replace function app_private.claim_primary_owner()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.role = 'owner' and new.status = 'active' then
    update public.companies c
    set primary_owner_profile_id = new.profile_id
    where c.id = new.company_id
      and c.primary_owner_profile_id is null;
  end if;
  return new;
end;
$function$;

drop trigger if exists company_memberships_claim_primary_owner on public.company_memberships;
create trigger company_memberships_claim_primary_owner
after insert on public.company_memberships
for each row execute function app_private.claim_primary_owner();

create or replace function app_private.is_primary_owner(target_company_id text, target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.companies c
    where c.id = target_company_id
      and c.primary_owner_profile_id is not null
      and c.primary_owner_profile_id = target_profile_id
  );
$function$;

revoke all on function app_private.is_primary_owner(text, uuid) from public;
grant execute on function app_private.is_primary_owner(text, uuid) to authenticated;

-- The access RPC, with the new guard. Everything else is unchanged.
create or replace function public.update_company_member_access(target_company_id text, target_profile_id uuid, target_role text default 'member'::text, target_role_id uuid default null::uuid, target_status text default 'active'::text)
returns company_memberships
language plpgsql
set search_path to ''
as $function$
declare
  actor_id uuid := auth.uid();
  clean_status text := lower(trim(coalesce(target_status, 'active')));
  clean_role text := lower(trim(coalesce(target_role, 'member')));
  old_row public.company_memberships%rowtype;
  saved_row public.company_memberships%rowtype;
  event_name text := 'membership.updated';
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Owner/Admin access required';
  end if;

  if clean_status not in ('active', 'pending', 'disabled', 'left') then
    raise exception 'Unsupported membership status';
  end if;

  if target_role_id is not null then
    select case
      when lower(name) = 'owner' then 'owner'
      when lower(name) = 'admin' then 'admin'
      when lower(name) = 'developer' then 'developer'
      when lower(name) = 'worker' then 'worker'
      when lower(name) = 'sales' then 'sales'
      when lower(name) = 'supervisor' then 'supervisor'
      when lower(name) = 'construction supervisor' then 'construction_supervisor'
      else 'member'
    end
    into clean_role
    from public.roles
    where id = target_role_id
      and company_id = target_company_id;

    if clean_role is null then
      raise exception 'Role does not belong to this company';
    end if;
  end if;

  if clean_role not in ('owner', 'member', 'worker', 'sales', 'supervisor', 'admin', 'developer', 'construction_supervisor') then
    clean_role := 'member';
  end if;

  select * into old_row
  from public.company_memberships
  where company_id = target_company_id
    and profile_id = target_profile_id;

  if (clean_role in ('owner', 'developer') or old_row.role in ('owner', 'developer'))
     and not app_private.is_company_owner(target_company_id) then
    raise exception 'Owner access required to change Owner or Developer membership';
  end if;

  -- The company's main owner is not editable from this screen by anyone in the company.
  -- Only refuse when something would actually change, so re-saving that row to adjust
  -- workspace assignments is not turned into an error.
  if app_private.is_primary_owner(target_company_id, target_profile_id)
     and not app_private.is_quest_admin()
     and (clean_role is distinct from old_row.role or clean_status is distinct from old_row.status) then
    raise exception 'This is the main owner of the company. Their role and status cannot be changed.';
  end if;

  insert into public.company_memberships (
    company_id, profile_id, role, status, disabled_at, disabled_by, left_at, last_active_at
  )
  values (
    target_company_id,
    target_profile_id,
    clean_role,
    clean_status,
    case when clean_status = 'disabled' then now() else null end,
    case when clean_status = 'disabled' then actor_id else null end,
    case when clean_status = 'left' then now() else null end,
    case when clean_status = 'active' then now() else null end
  )
  on conflict (company_id, profile_id) do update
  set role = excluded.role,
      status = excluded.status,
      disabled_at = case when excluded.status = 'disabled' then now() else null end,
      disabled_by = case when excluded.status = 'disabled' then actor_id else null end,
      left_at = case when excluded.status = 'left' then now() else null end,
      last_active_at = case when excluded.status = 'active' then now() else public.company_memberships.last_active_at end,
      updated_at = now()
  returning * into saved_row;

  if target_role_id is not null then
    delete from public.user_role_assignments
    where company_id = target_company_id
      and profile_id = target_profile_id;

    insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
    select target_company_id, target_profile_id, target_role_id, actor_id
    where exists (
      select 1 from public.roles r
      where r.id = target_role_id and r.company_id = target_company_id
    )
    on conflict do nothing;
  end if;

  if clean_status = 'disabled' then
    event_name := 'membership.disabled';
  elsif clean_status = 'left' then
    event_name := 'membership.left';
  elsif old_row.status in ('disabled', 'left', 'pending') and clean_status = 'active' then
    event_name := 'membership.reactivated';
  elsif old_row.role is distinct from clean_role then
    event_name := 'role.changed';
  end if;

  -- Only record an event when something actually changed. Re-saving an unchanged row was
  -- generating duplicate notifications and audit rows.
  if old_row.role is distinct from clean_role or old_row.status is distinct from clean_status then
    insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
    values (
      target_company_id, actor_id, event_name, 'membership', target_profile_id::text,
      jsonb_build_object(
        'role', clean_role, 'status', clean_status, 'role_id', target_role_id,
        'previous_role', old_row.role, 'previous_status', old_row.status
      )
    );
  end if;

  return saved_row;
end;
$function$;
