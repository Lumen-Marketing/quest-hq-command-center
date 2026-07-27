-- Launch hardening for worker onboarding.
--
-- 1. An invite records the operational workspaces the worker should enter.
-- 2. Email delivery is observable and retryable without invalidating the invite.
-- 3. Accepting an invite never retains Owner/Admin/Developer role assignments.

alter table public.company_invites
  add column if not exists workspace_ids uuid[] not null default '{}'::uuid[],
  add column if not exists email_status text not null default 'not_sent',
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_last_error text;

alter table public.company_invites
  drop constraint if exists company_invites_email_status_check,
  add constraint company_invites_email_status_check
    check (email_status in ('not_sent', 'sent', 'failed')),
  drop constraint if exists company_invites_workspace_count_check,
  add constraint company_invites_workspace_count_check
    check (cardinality(workspace_ids) <= 50);

create index if not exists company_invites_delivery_idx
  on public.company_invites(company_id, status, email_status, created_at desc);

-- Keep role/invite administration limited to the three management roles even
-- on environments that never received the earlier branch-only hardening file.
create or replace function app_private.is_company_admin(target_company_id text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  );
$$;

revoke all on function app_private.is_company_admin(text) from public, anon;
grant execute on function app_private.is_company_admin(text) to authenticated;

create or replace function public.accept_company_invite(invite_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_row public.company_invites%rowtype;
  invite_email text;
  profile_email text;
  membership_role text := 'member';
  safe_role_id uuid;
  requested_workspace_count integer := 0;
  selected_workspace_ids uuid[] := '{}'::uuid[];
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if btrim(coalesce(invite_token, '')) = '' then
    raise exception 'Invite token is required';
  end if;

  select *
  into invite_row
  from public.company_invites
  where token = btrim(invite_token)
    and status = 'pending'
  limit 1
  for update;

  if invite_row.id is null then
    raise exception 'Invite was not found or is no longer pending';
  end if;

  if invite_row.expires_at <= now() then
    update public.company_invites
    set status = 'expired',
        updated_at = now()
    where id = invite_row.id;
    raise exception 'Invite has expired';
  end if;

  select lower(p.email)
  into profile_email
  from public.profiles p
  where p.id = (select auth.uid());

  invite_email := lower(invite_row.email);
  if profile_email is null or profile_email <> invite_email then
    raise exception 'Invite was sent to a different email address';
  end if;

  -- Active members already have an owner-controlled access record and cannot
  -- use a second invite as a side door to mutate it.
  if exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = invite_row.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
  ) then
    raise exception 'This user is already an active company member';
  end if;

  -- Elevated names are both explicitly folded down and excluded from
  -- safe_role_id. The latter is essential: a harmless membership role paired
  -- with an Owner role assignment would still inherit wildcard permissions.
  if invite_row.role_id is not null then
    select
      r.id,
      case
        when lower(name) in ('owner', 'developer', 'admin') then 'member'
        when lower(name) = 'worker' then 'worker'
        when lower(name) = 'sales' then 'sales'
        when lower(name) = 'supervisor' then 'supervisor'
        when lower(name) = 'construction supervisor' then 'construction_supervisor'
        else 'member'
      end
    into safe_role_id, membership_role
    from public.roles r
    where r.id = invite_row.role_id
      and r.company_id = invite_row.company_id
      and lower(r.name) not in ('owner', 'admin', 'developer');
  end if;

  membership_role := coalesce(membership_role, 'member');

  requested_workspace_count := coalesce(cardinality(invite_row.workspace_ids), 0);
  if requested_workspace_count = 0 then
    select coalesce(array_agg(w.id order by w.created_at), '{}'::uuid[])
    into selected_workspace_ids
    from public.workspaces w
    where w.company_id = invite_row.company_id
      and w.status = 'active'
      and w.is_default;
  else
    select coalesce(array_agg(distinct w.id), '{}'::uuid[])
    into selected_workspace_ids
    from public.workspaces w
    where w.company_id = invite_row.company_id
      and w.status = 'active'
      and w.id = any(invite_row.workspace_ids);

    if cardinality(selected_workspace_ids) <> requested_workspace_count then
      raise exception 'One or more invite workspaces are invalid';
    end if;
  end if;

  if cardinality(selected_workspace_ids) = 0 then
    raise exception 'The company has no active workspace for this invite';
  end if;

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (invite_row.company_id, (select auth.uid()), membership_role, 'active')
  on conflict (company_id, profile_id) do update
  set role = excluded.role,
      status = 'active',
      updated_at = now();

  -- Always clear previous custom roles when a disabled/left member is
  -- re-invited. Reinsert only the role proven non-elevated above.
  delete from public.user_role_assignments
  where company_id = invite_row.company_id
    and profile_id = (select auth.uid());

  if safe_role_id is not null then
    insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
    values (
      invite_row.company_id,
      (select auth.uid()),
      safe_role_id,
      invite_row.invited_by
    )
    on conflict (company_id, profile_id, role_id) do update
    set assigned_by = excluded.assigned_by;
  end if;

  insert into public.workspace_memberships (
    workspace_id, profile_id, role_id, status, assigned_by
  )
  select
    workspace_id,
    (select auth.uid()),
    safe_role_id,
    'active',
    invite_row.invited_by
  from unnest(selected_workspace_ids) as selected(workspace_id)
  on conflict (workspace_id, profile_id) do update
  set role_id = excluded.role_id,
      status = 'active',
      assigned_by = excluded.assigned_by,
      updated_at = now();

  update public.company_invites
  set status = 'accepted',
      accepted_by = (select auth.uid()),
      updated_at = now()
  where id = invite_row.id;

  update public.profiles
  set approved = true,
      company_ids = array(
        select distinct unnest(coalesce(company_ids, '{}'::text[]) || array[invite_row.company_id])
      )
  where id = (select auth.uid());

  insert into public.audit_events (
    company_id, actor_profile_id, event_type, target_type, target_id, details
  )
  values (
    invite_row.company_id,
    (select auth.uid()),
    'invite.accepted',
    'company_invite',
    invite_row.id::text,
    jsonb_build_object(
      'email', invite_row.email,
      'granted_role', membership_role,
      'workspace_ids', selected_workspace_ids
    )
  );

  return invite_row.company_id;
end;
$$;

revoke all on function public.accept_company_invite(text) from public, anon;
grant execute on function public.accept_company_invite(text) to authenticated;
