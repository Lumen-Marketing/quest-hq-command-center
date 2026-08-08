-- Removing somebody from a company had no implementation at all. The Access tab could change
-- a role and a status, and that was the whole vocabulary: there was no way to take a seat back.
--
-- What "remove" deletes, and what it deliberately does not:
--
--   GONE      the company_memberships row, the user_role_assignments for this company, and
--             the workspace_memberships for this company's workspaces. The seat, in other
--             words -- from the next request onward is_company_member() is false and every
--             policy in the schema stops answering for them.
--
--   KEPT      the profile, and every row they ever wrote: jobs, tasks, messages, files,
--             time entries, audit trail. Their name still resolves everywhere it appears.
--
-- The auth account is NOT deleted, on purpose. A person can hold seats in several companies,
-- and deleting the account because ONE company removed them would sign them out of all the
-- others. It would also orphan every attribution above -- which is precisely the record this
-- is meant to keep. "Removed from the company" is the operation; "the account no longer
-- exists" is a different one and belongs to the person, not to a company that hired them.
--
-- Re-inviting works with no extra step: invites are matched on email, and the only uniqueness
-- rule is one PENDING invite per email per company, so an accepted-then-removed address is
-- free to be invited again.
--
-- Suspension is a separate thing and already exists: status 'disabled', which the interface
-- now calls Suspended. It keeps the seat and every row exactly where they are and simply
-- stops answering is_company_member(), so the person can sign in and reach nothing until
-- somebody sets them back to active.

create or replace function public.remove_company_member(
  target_company_id text,
  target_profile_id uuid
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  old_row public.company_memberships%rowtype;
  target_email text;
  active_owners integer;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Owner/Admin access required';
  end if;

  select * into old_row
  from public.company_memberships
  where company_id = target_company_id
    and profile_id = target_profile_id;

  if old_row.profile_id is null then
    raise exception 'That person is not a member of this company';
  end if;

  -- Removing yourself is not an access decision, it is leaving, and doing it from this screen
  -- is how an owner locks themselves out of their own company by accident.
  if target_profile_id = actor_id then
    raise exception 'You cannot remove yourself. Ask another owner to do it.';
  end if;

  if old_row.role in ('owner', 'developer') and not app_private.is_company_owner(target_company_id) then
    raise exception 'Owner access required to remove an Owner or Developer';
  end if;

  if app_private.is_primary_owner(target_company_id, target_profile_id) and not app_private.is_quest_admin() then
    raise exception 'This is the main owner of the company and cannot be removed.';
  end if;

  if old_row.role = 'owner' and old_row.status = 'active' then
    select count(*) into active_owners
    from public.company_memberships
    where company_id = target_company_id
      and role = 'owner'
      and status = 'active';
    if active_owners <= 1 then
      raise exception 'This is the last active Owner. Promote another Owner first.';
    end if;
  end if;

  -- Captured before the row goes, so the audit entry still says who this was. Without it the
  -- trail records a profile id and nothing a person could read.
  select p.email into target_email from public.profiles p where p.id = target_profile_id;

  delete from public.workspace_memberships wm
  using public.workspaces w
  where wm.workspace_id = w.id
    and w.company_id = target_company_id
    and wm.profile_id = target_profile_id;

  delete from public.user_role_assignments
  where company_id = target_company_id
    and profile_id = target_profile_id;

  delete from public.company_memberships
  where company_id = target_company_id
    and profile_id = target_profile_id;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id, actor_id, 'membership.removed', 'membership', target_profile_id::text,
    jsonb_build_object(
      'email', target_email,
      'previous_role', old_row.role,
      'previous_status', old_row.status,
      'note', 'Seat removed. Profile and authored records kept; the person can be invited again.'
    )
  );

  return true;
end;
$$;

revoke all on function public.remove_company_member(text, uuid) from public, anon;
grant execute on function public.remove_company_member(text, uuid) to authenticated;
