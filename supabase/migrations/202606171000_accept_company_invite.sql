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

  if invite_row.role_id is not null then
    select case
      when lower(name) = 'owner' then 'owner'
      when lower(name) = 'admin' then 'admin'
      when lower(name) = 'developer' then 'developer'
      else 'member'
    end
    into membership_role
    from public.roles
    where id = invite_row.role_id
      and company_id = invite_row.company_id;
  end if;

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
    jsonb_build_object('email', invite_row.email)
  );

  return invite_row.company_id;
end;
$$;

revoke all on function public.accept_company_invite(text) from public, anon;
grant execute on function public.accept_company_invite(text) to authenticated;
