-- Security fix: close two self-service privilege escalation paths.
--
-- Path A — three inserts, no invite needed.
--   `is_company_admin` included 'construction_supervisor', and that function
--   gates the RLS policies on public.roles, public.role_permissions and
--   public.user_role_assignments. Anyone holding that role could therefore:
--     1. create a role in their own company,
--     2. give it permission_key = '*', effect = 'allow',
--     3. assign it to themselves,
--   after which app_private.has_company_permission returns true for every
--   permission, because it honours any assigned 'allow'. Full read/write over
--   the workspace, including finance and client data.
--
-- Path B — self-invite with an elevated role name.
--   The same roles could INSERT into public.company_invites. accept_company_invite
--   mapped the invite's role *by name* ('owner' -> owner, 'developer' -> developer),
--   and the email guard does not help when the attacker invites their own address.
--   Because the membership insert used `on conflict ... do update set role`, an
--   existing membership was upgraded in place. The owner-only guard in
--   update_company_member_access never ran, since this path writes
--   public.company_memberships directly.
--
-- Fixes:
--   1. construction_supervisor is no longer a workspace administrator. It keeps
--      its job and task work but can no longer invite people, edit roles, or
--      change permissions. An owner can restore a specific person by making
--      them an admin.
--   2. An invite can never confer owner, developer or admin. Those roles come
--      only from update_company_member_access / promote_company_owner, which are
--      owner-guarded. The invite row is entirely attacker-controlled — including
--      invited_by, which RLS does not validate — so no field on it can be trusted
--      to authorise an elevated role.

-- 1. Remove construction_supervisor from the workspace-administrator check. ----

create or replace function app_private.is_company_admin(target_company_id text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  );
$$;

revoke all on function app_private.is_company_admin(text) from public, anon;
grant execute on function app_private.is_company_admin(text) to authenticated;

-- 2. An invite may never confer an elevated membership role. ------------------

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
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if trim(coalesce(invite_token, '')) = '' then
    raise exception 'Invite token is required';
  end if;

  select *
  into invite_row
  from public.company_invites
  where token = trim(invite_token)
    and status = 'pending'
  limit 1;

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

  select lower(email)
  into profile_email
  from public.profiles
  where id = auth.uid();

  invite_email := lower(invite_row.email);

  if profile_email is null or profile_email <> invite_email then
    raise exception 'Invite was sent to a different email address';
  end if;

  -- Elevated roles are deliberately absent from this mapping. An invite naming
  -- 'owner', 'developer' or 'admin' now lands the invitee on 'member'; it fails
  -- closed rather than refusing the invite, so legitimate onboarding still
  -- completes and an owner can promote afterwards through the guarded path.
  if invite_row.role_id is not null then
    select case
      when lower(name) in ('owner', 'developer', 'admin') then 'member'
      when lower(name) = 'worker' then 'worker'
      when lower(name) = 'sales' then 'sales'
      when lower(name) = 'supervisor' then 'supervisor'
      when lower(name) = 'construction supervisor' then 'construction_supervisor'
      else 'member'
    end
    into membership_role
    from public.roles
    where id = invite_row.role_id
      and company_id = invite_row.company_id;
  end if;

  membership_role := coalesce(membership_role, 'member');

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (invite_row.company_id, auth.uid(), membership_role, 'active')
  on conflict (company_id, profile_id) do update
  set role = excluded.role,
      status = 'active',
      updated_at = now();

  if invite_row.role_id is not null then
    delete from public.user_role_assignments
    where company_id = invite_row.company_id
      and profile_id = auth.uid();

    insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
    select invite_row.company_id, auth.uid(), invite_row.role_id, invite_row.invited_by
    where exists (
      select 1
      from public.roles r
      where r.id = invite_row.role_id
        and r.company_id = invite_row.company_id
    )
    on conflict do nothing;
  end if;

  update public.company_invites
  set status = 'accepted',
      accepted_by = auth.uid(),
      updated_at = now()
  where id = invite_row.id;

  update public.profiles
  set approved = true,
      company_ids = array(
        select distinct unnest(coalesce(company_ids, '{}'::text[]) || array[invite_row.company_id])
      )
  where id = auth.uid();

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    invite_row.company_id,
    auth.uid(),
    'invite.accepted',
    'company_invite',
    invite_row.id::text,
    jsonb_build_object('email', invite_row.email, 'granted_role', membership_role)
  );

  return invite_row.company_id;
end;
$$;

revoke all on function public.accept_company_invite(text) from public, anon;
grant execute on function public.accept_company_invite(text) to authenticated;
