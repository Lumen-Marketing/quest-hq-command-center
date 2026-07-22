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

-- ============================================================
-- B. Register the tasks module as a per-workspace plugin
-- ============================================================
-- Locked decision 5: tasks is ON for every workspace at launch (it can become a
-- paid add-on later by flipping rows in company_plugins). Preset arrays below are
-- reproduced verbatim from 20260701170157_price_book_plugin_allowlist.sql with
-- 'tasks' appended — do not re-order or drop entries, a stale copy would silently
-- remove modules from newly created workspaces.

alter table public.company_plugins
  drop constraint if exists company_plugins_known_plugin_check;

alter table public.company_plugins
  add constraint company_plugins_known_plugin_check check (
    plugin_id in (
      'crm',
      'crm_2',
      'underwriter',
      'files',
      'client_portal',
      'workspace_builder',
      'price_book',
      'forms',
      'finance',
      'messages',
      'calendar',
      'time_clock',
      'approvals',
      'reporting',
      'tasks'
    )
  );

create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case lower(trim(coalesce(preset_code, 'generic')))
    when 'roofing' then array['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']::text[]
    when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']::text[]
    else array['crm', 'files', 'messages', 'workspace_builder', 'tasks']::text[]
  end;
$$;

revoke all on function app_private.plugin_ids_for_preset(text) from public, anon;
grant execute on function app_private.plugin_ids_for_preset(text) to authenticated;

-- Backfill every existing workspace so current tenants get the module too.
insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
select c.id, 'tasks', 'installed', now(), now()
from public.companies c
on conflict (company_id, plugin_id) do update
set status = 'installed', updated_at = now();

-- ============================================================
-- C. Seed default task taxonomy for newly created workspaces
-- ============================================================
-- Phase 2 seeded taxonomy for companies that already existed. New tenants need
-- the same defaults or their task module opens with no types/statuses/labels.
--
-- Implemented as an AFTER INSERT trigger on public.companies rather than by
-- editing public.create_company_workspace: the trigger is additive (no 150-line
-- function reproduced, nothing to drift out of sync) and it covers EVERY path
-- that creates a workspace, including admin/platform-side inserts that don't go
-- through the RPC. Row shapes mirror 202607221400 section on task taxonomy.

create or replace function app_private.seed_company_task_taxonomy(target_company_id text)
returns void
language sql
security definer
set search_path = public, app_private, pg_temp
as $$
  with seeded_types as (
    insert into public.task_types (company_id, key, label, sort_order)
    select target_company_id, t.key, t.label, t.ord
    from (values
      ('lead','Lead',0),('bid','Bid / Estimate',1),('admin','Admin',2),
      ('invoicing','Invoicing',3),('ar','AR',4),('meeting','Meeting',5),
      ('web_dev','Web development',6)
    ) t(key,label,ord)
    on conflict (company_id, key) do nothing
    returning 1
  ), seeded_statuses as (
    insert into public.task_type_statuses (company_id, type_key, key, label, color, sort_order, is_done, is_default)
    select target_company_id, ty.key, s.key, s.label, s.color, s.ord, s.is_done, s.is_default
    from (values ('lead'),('bid'),('admin'),('invoicing'),('ar'),('meeting'),('web_dev')) ty(key)
    cross join (values
      ('todo','Working on it','#3E7BF2',0,false,true),
      ('pending','Pending','#8F867B',1,false,false),
      ('hold','Stuck','#E0484D',2,false,false),
      ('review','In review','#ED9A3A',3,false,false),
      ('done','Done','#2E9E6B',4,true,false)
    ) s(key,label,color,ord,is_done,is_default)
    on conflict (company_id, type_key, key) do nothing
    returning 1
  )
  insert into public.task_labels (company_id, key, label, sort_order)
  select target_company_id, l.key, l.label, l.ord
  from (values ('roof','Roof',0),('roof_framing','Roof & Framing',1),('framing','Framing',2)) l(key,label,ord)
  on conflict (company_id, key) do nothing;
$$;

revoke all on function app_private.seed_company_task_taxonomy(text) from public, anon, authenticated;

create or replace function app_private.companies_seed_task_taxonomy()
returns trigger
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
begin
  perform app_private.seed_company_task_taxonomy(new.id);
  return new;
end;
$$;

drop trigger if exists companies_seed_task_taxonomy on public.companies;
create trigger companies_seed_task_taxonomy
after insert on public.companies
for each row execute function app_private.companies_seed_task_taxonomy();
