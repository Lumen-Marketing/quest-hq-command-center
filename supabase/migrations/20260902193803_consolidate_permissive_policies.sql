-- The advisor reported overlapping permissive policies on notifications and profiles.
-- Preserve every existing authorization path, but express each command as one policy so
-- Postgres evaluates one OR expression instead of multiple policies for the same role/action.

drop policy if exists "notification recipients delete own rows" on public.notifications;
drop policy if exists "role users can delete notifications" on public.notifications;
create policy "notification recipients delete own rows"
on public.notifications
for delete
to authenticated
using (
  (
    recipient_profile_id = (select auth.uid())
    and company_id is not null
    and app_private.is_company_member(company_id)
  )
  or member_id = current_member_id()
);

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
  )
  or member_id = current_member_id()
  or current_profile_role() = any (
    array['admin'::text, 'developer'::text, 'construction_supervisor'::text, 'supervisor'::text]
  )
  or exists (
    select 1
    from public.tasks t
    where t.id = notifications.task_id
      and t.creator_id = current_member_id()
  )
);

drop policy if exists "notification recipients read own rows" on public.notifications;
drop policy if exists "role users can read notifications" on public.notifications;
create policy "notification recipients read own rows"
on public.notifications
for select
to authenticated
using (
  (
    recipient_profile_id = (select auth.uid())
    and company_id is not null
    and app_private.is_company_member(company_id)
  )
  or member_id = current_member_id()
);

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
  )
  or member_id = current_member_id()
);

drop policy if exists "managers update profiles" on public.profiles;
drop policy if exists "users update own profile name" on public.profiles;
create policy "profiles update own or managed"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
  or (
    (select auth.uid()) is not null
    and (select auth.uid()) <> id
    and can_manage_roles()
  )
)
with check (
  (
    (select auth.uid()) = id
    and role = (app_private.current_profile_row()).role
    and approved = (app_private.current_profile_row()).approved
    and not (supervisor_id is distinct from (app_private.current_profile_row()).supervisor_id)
    and not (company_ids is distinct from (app_private.current_profile_row()).company_ids)
    and not (member_id is distinct from (app_private.current_profile_row()).member_id)
    and not (email is distinct from (app_private.current_profile_row()).email)
  )
  or (
    (select auth.uid()) is not null
    and (select auth.uid()) <> id
    and can_manage_roles()
  )
);
