alter table public.company_memberships
  drop constraint if exists company_memberships_status_check;

alter table public.company_memberships
  add constraint company_memberships_status_check
  check (status in ('active', 'pending', 'disabled', 'left'));

alter table public.company_memberships
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by uuid references public.profiles(id) on delete set null,
  add column if not exists left_at timestamptz,
  add column if not exists last_active_at timestamptz;

create index if not exists company_memberships_active_owner_idx
  on public.company_memberships(company_id, role, status)
  where role = 'owner' and status = 'active';

create index if not exists company_memberships_disabled_by_idx
  on public.company_memberships(disabled_by)
  where disabled_by is not null;

create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  with permission_variants as (
    select permission as permission_key
    union
    select case
      when permission = 'messages.manage' then 'messages.manage_groups'
      when permission = 'messages.manage_groups' then 'messages.manage'
      else permission
    end
  ),
  membership as (
    select cm.role
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = auth.uid()
      and (
        rp.permission_key = '*'
        or rp.permission_key in (select permission_key from permission_variants)
      )
  )
  select
    exists (select 1 from membership where role in ('owner', 'developer'))
    or (
      exists (select 1 from membership)
      and not exists (select 1 from assigned where effect = 'deny')
      and (
        exists (select 1 from assigned where effect = 'allow')
        or permission in ('jobs.view', 'tasks.view', 'files.view', 'forms.view', 'users.view')
      )
    );
$$;

create or replace function app_private.is_company_owner(target_company_id text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'developer')
  );
$$;

create or replace function app_private.prevent_last_owner_loss()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  remaining_owner_count integer;
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' and old.status = 'active' then
      select count(*) into remaining_owner_count
      from public.company_memberships cm
      where cm.company_id = old.company_id
        and cm.profile_id <> old.profile_id
        and cm.role = 'owner'
        and cm.status = 'active';

      if remaining_owner_count = 0 then
        raise exception 'Every company must keep at least one active Owner';
      end if;
    end if;

    return old;
  end if;

  if old.role = 'owner'
     and old.status = 'active'
     and (
       new.role <> 'owner'
       or new.status <> 'active'
       or new.company_id <> old.company_id
       or new.profile_id <> old.profile_id
     ) then
    select count(*) into remaining_owner_count
    from public.company_memberships cm
    where cm.company_id = old.company_id
      and cm.profile_id <> old.profile_id
      and cm.role = 'owner'
      and cm.status = 'active';

    if remaining_owner_count = 0 then
      raise exception 'Every company must keep at least one active Owner';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists company_memberships_prevent_last_owner_loss on public.company_memberships;
create trigger company_memberships_prevent_last_owner_loss
before update or delete on public.company_memberships
for each row execute function app_private.prevent_last_owner_loss();

drop policy if exists "admins insert audit events" on public.audit_events;
create policy "admins insert audit events" on public.audit_events
for insert to authenticated
with check (company_id is not null and app_private.is_company_admin(company_id));

create or replace function public.update_company_member_access(
  target_company_id text,
  target_profile_id uuid,
  target_role text default 'member',
  target_role_id uuid default null,
  target_status text default 'active'
)
returns public.company_memberships
language plpgsql
set search_path = ''
as $$
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

  insert into public.company_memberships (
    company_id,
    profile_id,
    role,
    status,
    disabled_at,
    disabled_by,
    left_at,
    last_active_at
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
      select 1
      from public.roles r
      where r.id = target_role_id
        and r.company_id = target_company_id
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

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id,
    actor_id,
    event_name,
    'membership',
    target_profile_id::text,
    jsonb_build_object(
      'role', clean_role,
      'status', clean_status,
      'role_id', target_role_id,
      'previous_role', old_row.role,
      'previous_status', old_row.status
    )
  );

  return saved_row;
end;
$$;

create or replace function public.leave_company(target_company_id text)
returns public.company_memberships
language plpgsql
set search_path = ''
as $$
begin
  return public.update_company_member_access(target_company_id, auth.uid(), null, null, 'left');
end;
$$;

create or replace function public.promote_company_owner(target_company_id text, target_profile_id uuid)
returns public.company_memberships
language plpgsql
set search_path = ''
as $$
begin
  if not app_private.is_company_owner(target_company_id) then
    raise exception 'Owner access required';
  end if;

  return public.update_company_member_access(target_company_id, target_profile_id, 'owner', null, 'active');
end;
$$;

create or replace function public.review_company_join_request(target_request_id uuid, decision text, target_role_id uuid default null)
returns public.company_join_requests
language plpgsql
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  clean_decision text := lower(trim(coalesce(decision, '')));
  request_row public.company_join_requests%rowtype;
  saved_request public.company_join_requests%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select * into request_row
  from public.company_join_requests
  where id = target_request_id;

  if request_row.id is null then
    raise exception 'Join request not found';
  end if;

  if not app_private.is_company_admin(request_row.company_id) then
    raise exception 'Owner/Admin access required';
  end if;

  if clean_decision not in ('approved', 'rejected') then
    raise exception 'Unsupported join request decision';
  end if;

  update public.company_join_requests
  set status = clean_decision,
      reviewed_by = actor_id,
      updated_at = now()
  where id = request_row.id
  returning * into saved_request;

  if clean_decision = 'approved' then
    perform public.update_company_member_access(request_row.company_id, request_row.profile_id, 'member', target_role_id, 'active');
  end if;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    request_row.company_id,
    actor_id,
    case when clean_decision = 'approved' then 'join.approved' else 'join.rejected' end,
    'join_request',
    request_row.id::text,
    jsonb_build_object('email', request_row.requested_email)
  );

  return saved_request;
end;
$$;

create or replace function public.revoke_company_invite(target_invite_id uuid)
returns public.company_invites
language plpgsql
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  invite_row public.company_invites%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select * into invite_row
  from public.company_invites
  where id = target_invite_id;

  if invite_row.id is null then
    raise exception 'Invite not found';
  end if;

  if not app_private.is_company_admin(invite_row.company_id) then
    raise exception 'Owner/Admin access required';
  end if;

  update public.company_invites
  set status = 'revoked',
      updated_at = now()
  where id = invite_row.id
  returning * into invite_row;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    invite_row.company_id,
    actor_id,
    'invite.revoked',
    'company_invite',
    invite_row.id::text,
    jsonb_build_object('email', invite_row.email)
  );

  return invite_row;
end;
$$;

grant execute on function app_private.is_company_owner(text) to authenticated;
revoke all on function public.update_company_member_access(text, uuid, text, uuid, text) from public, anon;
revoke all on function public.leave_company(text) from public, anon;
revoke all on function public.promote_company_owner(text, uuid) from public, anon;
revoke all on function public.review_company_join_request(uuid, text, uuid) from public, anon;
revoke all on function public.revoke_company_invite(uuid) from public, anon;
grant execute on function public.update_company_member_access(text, uuid, text, uuid, text) to authenticated;
grant execute on function public.leave_company(text) to authenticated;
grant execute on function public.promote_company_owner(text, uuid) to authenticated;
grant execute on function public.review_company_join_request(uuid, text, uuid) to authenticated;
grant execute on function public.revoke_company_invite(uuid) to authenticated;

revoke all on function public.message_touch_conversation() from public, anon, authenticated;
