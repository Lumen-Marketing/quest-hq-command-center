-- Phase 3 · Tenant hardening for the task module.
--
-- Section A closes four cross-tenant leaks inherited from the single-tenant era
-- (202606121100_taskmanagement_runtime.sql). Those policies gate on GLOBAL role
-- (current_profile_role / can_manage_roles), so under multi-tenant SaaS any
-- tenant's admin — or in two cases any authenticated user at all — could read or
-- edit another tenant's rows. Every replacement below gates on CC's company
-- membership helpers instead: app_private.is_company_member / is_company_admin,
-- with is_quest_admin() as the only platform-wide bypass.
--
-- Sections B and C register the tasks module as a per-workspace plugin and seed
-- default task taxonomy for newly created workspaces.

-- ============================================================
-- A. Close cross-tenant leaks
-- ============================================================

-- L4 — companies was readable by every authenticated user (`using (true)`),
-- letting anyone enumerate every business on the platform.
drop policy if exists "role users can read companies" on public.companies;
create policy "members read their companies" on public.companies
for select to authenticated
using (app_private.is_company_member(id) or app_private.is_quest_admin());

-- L1 — team_members roster was readable by anyone holding any role, across
-- every tenant. Scoped to companies the caller actively belongs to.
drop policy if exists "role users can read team_members" on public.team_members;
create policy "members read own company roster" on public.team_members
for select to authenticated
using (
  app_private.is_quest_admin()
  or company_ids && array(
    select cm.company_id from public.company_memberships cm
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
  )
);

-- L2 — can_manage_roles() is a GLOBAL role check, so an admin of tenant A could
-- insert/update/delete tenant B's members. Now every touched company must be one
-- the caller administers.
drop policy if exists "managers can insert team_members" on public.team_members;
create policy "company admins insert own roster" on public.team_members
for insert to authenticated
with check (
  app_private.is_quest_admin()
  or (
    array_length(company_ids, 1) is not null
    and not exists (
      select 1 from unnest(company_ids) as cid
      where not app_private.is_company_admin(cid)
    )
  )
);

drop policy if exists "managers can update team_members" on public.team_members;
create policy "company admins update own roster" on public.team_members
for update to authenticated
using (
  app_private.is_quest_admin()
  or company_ids && array(
    select cm.company_id from public.company_memberships cm
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
      and cm.role in ('admin', 'developer')
  )
)
with check (
  app_private.is_quest_admin()
  or company_ids && array(
    select cm.company_id from public.company_memberships cm
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
      and cm.role in ('admin', 'developer')
  )
);

drop policy if exists "managers can delete team_members" on public.team_members;
create policy "company admins delete own roster" on public.team_members
for delete to authenticated
using (
  app_private.is_quest_admin()
  or company_ids && array(
    select cm.company_id from public.company_memberships cm
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
      and cm.role in ('admin', 'developer')
  )
);

-- L3 — time_entries had a global-role escape hatch on all four verbs, exposing
-- every tenant's labor records to any tenant's admin. time_entries has no
-- company column of its own, so tenancy is derived through tasks.company_id
-- (deliberately NOT denormalized: a new column would need frontend writes and
-- could drift out of sync with the task it belongs to).
drop policy if exists "role users can read time_entries" on public.time_entries;
create policy "own or company-admin read time_entries" on public.time_entries
for select to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = time_entries.task_id
      and app_private.is_company_admin(t.company_id)
  )
);

drop policy if exists "role users can insert time_entries" on public.time_entries;
create policy "own insert time_entries" on public.time_entries
for insert to authenticated
with check (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = time_entries.task_id
      and app_private.is_company_admin(t.company_id)
  )
);

drop policy if exists "role users can update time_entries" on public.time_entries;
create policy "own or company-admin update time_entries" on public.time_entries
for update to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = time_entries.task_id
      and app_private.is_company_admin(t.company_id)
  )
)
with check (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = time_entries.task_id
      and app_private.is_company_admin(t.company_id)
  )
);

drop policy if exists "role users can delete time_entries" on public.time_entries;
create policy "own or company-admin delete time_entries" on public.time_entries
for delete to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = time_entries.task_id
      and app_private.is_company_admin(t.company_id)
  )
);

-- P1 — active_timers was company-scoped for supervisors but carried a global
-- 'developer' bypass and exposed rows whose task_company is null.
drop policy if exists "role users can read active_timers" on public.active_timers;
create policy "own or company-admin read active_timers" on public.active_timers
for select to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);
