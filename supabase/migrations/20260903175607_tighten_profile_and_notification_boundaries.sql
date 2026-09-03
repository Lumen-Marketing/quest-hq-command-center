-- Company access is owned by company_memberships and the company-scoped access RPCs.
-- The legacy profiles.role flag is account-wide, so it must never authorize edits or
-- deletion of another person's platform profile.

drop policy if exists "profiles update own or managed" on public.profiles;
drop policy if exists "managers update profiles" on public.profiles;
drop policy if exists "users update own profile name" on public.profiles;

create policy "profiles update own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (app_private.current_profile_row()).role
  and approved = (app_private.current_profile_row()).approved
  and not (supervisor_id is distinct from (app_private.current_profile_row()).supervisor_id)
  and not (company_ids is distinct from (app_private.current_profile_row()).company_ids)
  and not (member_id is distinct from (app_private.current_profile_row()).member_id)
  and not (email is distinct from (app_private.current_profile_row()).email)
);

drop policy if exists "managers delete profiles" on public.profiles;
revoke delete, truncate on table public.profiles from authenticated;

-- Preserve the two supported notification shapes while removing account-wide role
-- bypasses. Modern rows name the company/profile directly. Vendored Tasks can still
-- write its legacy member_id shape, but only to itself or from a task creator to an
-- active member of that same task company.

drop policy if exists "active members insert company notifications" on public.notifications;
drop policy if exists "role users can insert notifications" on public.notifications;

create policy "active members insert company notifications"
on public.notifications
for insert
to authenticated
with check (
  (
    company_id is not null
    and recipient_profile_id is not null
    and app_private.is_company_member(company_id)
    and exists (
      select 1
      from public.company_memberships recipient_membership
      where recipient_membership.company_id = notifications.company_id
        and recipient_membership.profile_id = notifications.recipient_profile_id
        and recipient_membership.status = 'active'
    )
    and (
      member_id is null
      or exists (
        select 1
        from public.profiles recipient_profile
        where recipient_profile.id = notifications.recipient_profile_id
          and recipient_profile.member_id = notifications.member_id
      )
    )
  )
  or (
    member_id = current_member_id()
    and (recipient_profile_id is null or recipient_profile_id = (select auth.uid()))
    and (company_id is null or app_private.is_company_member(company_id))
  )
  or (
    task_id is not null
    and member_id is not null
    and exists (
      select 1
      from public.tasks source_task
      join public.team_members recipient_member
        on recipient_member.id = notifications.member_id
      where source_task.id = notifications.task_id
        and source_task.creator_id = current_member_id()
        and app_private.is_company_member(source_task.company_id)
        and recipient_member.active = true
        and source_task.company_id = any(recipient_member.company_ids)
        and (notifications.company_id is null or notifications.company_id = source_task.company_id)
        and (
          notifications.recipient_profile_id is null
          or exists (
            select 1
            from public.profiles recipient_profile
            join public.company_memberships recipient_membership
              on recipient_membership.profile_id = recipient_profile.id
            where recipient_profile.id = notifications.recipient_profile_id
              and recipient_profile.member_id = notifications.member_id
              and recipient_membership.company_id = source_task.company_id
              and recipient_membership.status = 'active'
          )
        )
    )
  )
);

-- A legacy row owned through member_id may be marked read, but it cannot be
-- rewritten into a second user's modern inbox.
drop policy if exists "notification recipients update own rows" on public.notifications;
drop policy if exists "role users can update notifications" on public.notifications;

create policy "notification recipients update own rows"
on public.notifications
for update
to authenticated
using (
  (
    recipient_profile_id = (select auth.uid())
    and company_id is not null
    and app_private.is_company_member(company_id)
  )
  or member_id = current_member_id()
)
with check (
  (
    recipient_profile_id = (select auth.uid())
    and company_id is not null
    and app_private.is_company_member(company_id)
    and (member_id is null or member_id = current_member_id())
  )
  or (
    member_id = current_member_id()
    and (recipient_profile_id is null or recipient_profile_id = (select auth.uid()))
    and (company_id is null or app_private.is_company_member(company_id))
  )
);
