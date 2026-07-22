# Phase 3: Tenant Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the task module safe for outside tenants: close the cross-tenant RLS leaks in the legacy task tables, register `tasks` as a per-workspace plugin, drive company identity from data instead of hardcoded Quest companies, and retire the task app's own membership machinery.

**Architecture:** One migration file fixes RLS + plugin registration + new-workspace seeding, using only CC's existing helpers (`app_private.is_company_member/is_company_admin/is_quest_admin`). Frontend changes are surgical: hydrate `App.COMPANIES` from the database at boot (constants become fallback, exactly like `App.taxonomy` already works) and switch off the approval/permissions/user-CRUD entry points.

**Tech Stack:** Postgres/Supabase migration SQL; vanilla JS in `taskmanagement/`.

**Parent plan:** `2026-07-22-task-app-absorption.md` (Phase 3 of 5). Prior: `2026-07-22-phase2-rewire-auth-data.md`.

## Research findings (verified inline 2026-07-22)

### 🔴 RLS audit — four real cross-tenant leaks

CC's task tables still carry the **pre-multi-tenant** policies from `202606121100_taskmanagement_runtime.sql`. They gate on *global role*, not company membership. Under multi-tenant SaaS these are data leaks:

| # | Table / policy | Predicate (file:line) | Verdict |
| --- | --- | --- | --- |
| L1 | `team_members` SELECT — "role users can read team_members" | `current_profile_role() in ('admin','developer','construction_supervisor','supervisor','worker')` (202606121100:322-324) | **LEAK** — any authenticated worker of ANY tenant reads every tenant's roster |
| L2 | `team_members` INSERT/UPDATE/DELETE — "managers can …" | `can_manage_roles()` = global role in ('admin','developer','construction_supervisor') (202606121100:327-333, fn 200-208) | **LEAK** — Acme's admin can edit/delete Bravo's members |
| L3 | `time_entries` SELECT/INSERT/UPDATE/DELETE | `current_profile_role() in (…)` global escape hatch OR `user_id = current_member_id()` (202606121100:484-501) | **LEAK** — Acme's admin reads/writes Bravo's labor records |
| L4 | `companies` SELECT — "role users can read companies" | `using (true)` (202606121100:319) | **LEAK** — every authenticated user enumerates every tenant business on the platform |
| P1 | `active_timers` SELECT | `user_id = current_member_id()` OR global `developer` OR (role in (…) AND `task_company = any(current_company_ids())`) (202606121100:505-514) | **PARTIAL** — company-scoped for supervisors, but global `developer` bypass + `task_company is null` rows visible |
| ✅ | `notifications` (all four) | `recipient_profile_id = auth.uid() AND app_private.is_company_member(company_id)` (202606181700:79-131) | **PASS** — already CC-model correct |
| ✅ | `tasks`, `profiles` | rewritten in `202606241700_launch_readiness_saas.sql` | **PASS** (spot-checked; the leak test in Phase 5 is the real proof) |

Fix pattern for all of them: replace global-role predicates with `app_private.is_company_member(company_id)` / `is_company_admin(company_id)`, keeping `is_quest_admin()` as the only platform-wide bypass.

**`team_members` structural note:** it has global text ids and `company_ids text[]` with no FK to `companies`. Verdict: **array-overlap predicates suffice for launch** (`company_ids && array(select company_id from company_memberships where profile_id = auth.uid() and status='active')`). A junction table is the cleaner end state but is a data-model migration — not launch-week work, and the leak test doesn't require it.

### Frontend findings

| Finding | Detail |
| --- | --- |
| `App.COMPANIES` is hardcoded | `taskmanagement/js/constants.js:12-21` — Roofing/Drafting/Lumen + `overall`. Consumed in 13 files via `App.directory.companies()` (directory.js:23-24), TaskModel.js:271, taxonomy.js:81, validate.js:111, FilterBarView.js:50, NewTaskPageView.js:85, TaskDetailView.js:870, tasklist/TableLayout.js:31,215, ApprovalView.js:88,201, AppController.js:143 |
| Hydration precedent exists | `App.taxonomy` already hydrates from DB rows with `seedFromConstants()` as fallback (taxonomy.js:76-95). Same pattern applies to companies — one boot-time fetch, constants become the offline fallback. |
| `profiles.company_ids` is safe to keep reading | CC's own workspace creation maintains it (`202606251230_idempotent_workspace_creation.sql:71-72`; also written at src/main.js:22059). No query rewrite needed in Phase 3. |
| Retirement targets are concentrated | `ApprovalView.js` owns BOTH `deleteProfile` (line 180) and `createUser` (line 261) — the two retired edge functions' only callers. Entry points: TopbarView.js:158 (`approvals` nav item), TopbarView.js:441-443,519-523 (`admin:permissions` menu item → `PermissionsAdminView`). Views are constructed in app.js:222-227. |
| `App.PEOPLE` hardcodes Quest staff | constants.js:3-10 (abraham/alkeith/kristine/jesus/andres/adrian with @questroofing.com emails) — fallback-only (real people come from `team_members`), but it is tenant identity in shipped code. Treat as demo-data removal. |

## Global Constraints

- All SQL goes in ONE new migration file, committed but **NOT applied** — the user batches every migration into a single Supabase-dashboard run after the code phases (their standing decision). Never apply migrations from this session.
- RLS policies use ONLY `app_private.is_company_member/is_company_admin/is_quest_admin` + `auth.uid()`. No `current_profile_role()`, no `can_manage_roles()` — those are the retired upstream model.
- Never write to old project `qqvmcsvdxhgjooirznrj`; never push to the upstream repo.
- Frontend: surgical guards over deletions (Phase 1–2 style). Keep `taskmanagement/` build-free.
- Stop `npm run dev` before `npm run build`. Verify with headless Chrome (`--dump-dom` for embed mode).
- Branch: continue `feat/task-app-absorption`; commit per task.

---

### Task 1: Migration — close the RLS leaks

**Files:**
- Create: `supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql`

**Interfaces:**
- Produces: replacement policies for L1–L4 + P1, all built from CC helpers. Later tasks append to this same file.

- [ ] **Step 1: Write the RLS section**

```sql
-- Phase 3 · Section A — close cross-tenant leaks in the legacy task tables.
-- These policies date from the single-tenant era (202606121100) and gate on
-- GLOBAL role, so any tenant's admin/worker could read or edit another
-- tenant's rows. Replaced with CC's company-membership helpers.

-- L4: companies were world-readable to any authenticated user (tenant enumeration).
drop policy if exists "role users can read companies" on public.companies;
create policy "members read their companies" on public.companies
for select to authenticated
using (app_private.is_company_member(id) or app_private.is_quest_admin());

-- L1: team_members roster was readable across every tenant.
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

-- L2: any global manager could insert/update/delete another tenant's members.
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

-- L3: time_entries had a global-role escape hatch on every verb.
-- Own rows always; company admins see their own company's labor only.
drop policy if exists "role users can read time_entries" on public.time_entries;
create policy "own or company-admin read time_entries" on public.time_entries
for select to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);

drop policy if exists "role users can insert time_entries" on public.time_entries;
create policy "own insert time_entries" on public.time_entries
for insert to authenticated
with check (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);

drop policy if exists "role users can update time_entries" on public.time_entries;
create policy "own or company-admin update time_entries" on public.time_entries
for update to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
)
with check (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);

drop policy if exists "role users can delete time_entries" on public.time_entries;
create policy "own or company-admin delete time_entries" on public.time_entries
for delete to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);

-- P1: active_timers had a global 'developer' bypass and exposed null-company rows.
drop policy if exists "role users can read active_timers" on public.active_timers;
create policy "own or company-admin read active_timers" on public.active_timers
for select to authenticated
using (
  user_id = public.current_member_id()
  or app_private.is_quest_admin()
  or (task_company is not null and app_private.is_company_admin(task_company))
);
```

**Note on `time_entries.task_company` / `active_timers.task_company`:** verify the column exists before writing this section — `grep -n "task_company" supabase/migrations/202606121100_taskmanagement_runtime.sql`. It is referenced by the existing active_timers policy (line 512), so it exists on `active_timers`; **if `time_entries` lacks it**, add `alter table public.time_entries add column if not exists task_company text references public.companies(id);` at the top of Section A and note that historical rows are null (fresh start — no historical rows).

- [ ] **Step 2: Verify no retired helpers remain in the new file**

```bash
cd /c/Users/tagal/quest-hq-command-center
grep -n "current_profile_role\|can_manage_roles" supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql
```

Expected: no hits (only `is_company_member/is_company_admin/is_quest_admin/current_member_id`).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql
git commit -m "feat: phase-3 RLS hardening — close 4 cross-tenant leaks in task tables"
```

### Task 2: Migration — register `tasks` as a workspace plugin

**Files:**
- Modify: `supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql` (append Section B)

**Interfaces:**
- Consumes: Task 1's file. Produces: `'tasks'` in the plugin allowlist, in every preset, backfilled onto every existing company, and included for every future workspace via `create_company_workspace`.

- [ ] **Step 1: Append Section B** — allowlist (full current list from `20260701170157_price_book_plugin_allowlist.sql` + `'tasks'`), then every branch of `app_private.plugin_ids_for_preset` gains `'tasks'`, then the backfill:

```sql
-- Phase 3 · Section B — register the tasks module as a per-workspace plugin.
alter table public.company_plugins
  drop constraint if exists company_plugins_known_plugin_check;

alter table public.company_plugins
  add constraint company_plugins_known_plugin_check check (
    plugin_id in (
      'crm', 'crm_2', 'underwriter', 'files', 'client_portal',
      'workspace_builder', 'price_book', 'forms', 'finance', 'messages',
      'calendar', 'time_clock', 'approvals', 'reporting',
      'tasks'
    )
  );

-- Locked decision 5: tasks is ON for every workspace at launch.
create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case lower(trim(coalesce(preset_code, 'generic')))
    when 'roofing' then array['crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']::text[]
    when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']::text[]
    else array['crm', 'files', 'messages', 'tasks']::text[]
  end;
$$;

revoke all on function app_private.plugin_ids_for_preset(text) from public, anon;
grant execute on function app_private.plugin_ids_for_preset(text) to authenticated;

-- Backfill every existing workspace.
insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
select c.id, 'tasks', 'installed', now(), now()
from public.companies c
on conflict (company_id, plugin_id) do update
set status = 'installed', updated_at = now();
```

**Before writing:** re-read `20260701170157_price_book_plugin_allowlist.sql` and the CURRENT `plugin_ids_for_preset` body (latest definition wins — check `202606261130_workspace_icon_expansion.sql` and anything newer) so the rewritten function preserves every existing preset entry. Copying a stale preset list would silently remove modules from new workspaces.

- [ ] **Step 2: Verify the preset function didn't lose entries** — diff the array contents against the latest prior definition; every previously-present plugin id must still appear.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql
git commit -m "feat: register tasks plugin for all presets and backfill existing workspaces"
```

### Task 3: Migration — seed task taxonomy for new workspaces

**Files:**
- Modify: `supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql` (append Section C)

**Interfaces:**
- Consumes: Phase 2's seed shapes (`202607221400…sql` — `insert into public.task_types (company_id, key, label, sort_order)` at ~line 188, `task_type_statuses` at ~198, and the `task_labels` insert below it). Produces: `public.create_company_workspace` also seeding default task types/statuses/labels for the new company, so a brand-new tenant's task module isn't empty.

- [ ] **Step 1: Read the current function** — `sed -n '140,290p' supabase/migrations/202606261130_workspace_icon_expansion.sql` (the newest `create or replace function public.create_company_workspace`, plus check for any later redefinition). Copy it wholesale as the base; do not hand-write a new one.

- [ ] **Step 2: Append Section C** — the full `create or replace function public.create_company_workspace(...)` reproduced from Step 1, with a taxonomy seed block added after its existing `insert into public.company_plugins` (~line 253), inserting the same default rows Phase 2 seeds for existing companies, scoped to `v_company_id`, each with `on conflict do nothing`. Keep the signature, permissions, and every existing statement byte-identical apart from the added block.

- [ ] **Step 3: Verify** — `grant`/`revoke` lines and the function signature match the original; `grep -c "create or replace function public.create_company_workspace"` in the new file returns 1.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/202607221600_taskmanagement_phase3_tenant_hardening.sql
git commit -m "feat: seed default task taxonomy for newly created workspaces"
```

### Task 4: Frontend — hydrate companies from the database

**Files:**
- Modify: `taskmanagement/js/services/SupabaseDataStore.js` (the parallel load block, ~line 170-186, and its return object)
- Modify: `taskmanagement/js/app.js` (boot hydration, near where taxonomy hydrates)
- Modify: `taskmanagement/js/constants.js` (comment only — constants become the documented fallback)

**Interfaces:**
- Consumes: `public.companies` (id, label, pill, name, short_name, color) — now RLS-scoped to the caller's companies by Task 1's L4 fix, so a plain `select *` returns exactly the tenant's own companies.
- Produces: `App.COMPANIES` rebuilt at boot as `{ [id]: { id, label, pill } }` from DB rows, preserving the synthetic `overall` entry (`all: true`) that 13 call sites depend on. Constants remain the offline/empty fallback — identical contract to `App.taxonomy`'s `seedFromConstants()`.

- [ ] **Step 1: Add the companies fetch** to the existing `Promise.all([...])` in the load block and surface it in the returned object as `companies: companiesRes.data || []`, with a `this._throwIfError(companiesRes, 'companies')` alongside the neighbours.

- [ ] **Step 2: Hydrate at boot** — where the app hands taxonomy rows to `App.taxonomy.hydrate(...)`, add a companies hydration that rebuilds `App.COMPANIES` from the rows:

```javascript
  // Tenant identity comes from the database (RLS returns only this user's
  // companies). Hardcoded App.COMPANIES in constants.js is the offline fallback
  // only — same contract as App.taxonomy's seedFromConstants().
  if (Array.isArray(data.companies) && data.companies.length) {
    const next = {};
    data.companies.forEach((row) => {
      next[row.id] = {
        id: row.id,
        label: row.label || row.short_name || row.name || row.id,
        pill: row.pill || `pill-${row.id}`,
      };
    });
    // 'overall' is a synthetic spans-all sentinel, never a real company row.
    next.overall = { id: 'overall', label: 'Overall', pill: 'pill-overall', all: true };
    App.COMPANIES = next;
    if (App.EventBus && App.EventBus.emit) App.EventBus.emit('companies:changed');
  }
```

Place it **before** the taxonomy hydration call, because `taxonomy.js:81`'s fallback path reads `App.COMPANIES`.

- [ ] **Step 3: Verify no call site breaks** — every consumer reads `.id`, `.label`, `.pill`, or `.all` (confirmed across the 13 files in the research table); the rebuilt shape supplies all four.

```bash
node --check taskmanagement/js/services/SupabaseDataStore.js
node --check taskmanagement/js/app.js
```

- [ ] **Step 4: Commit**

```bash
git add taskmanagement/js/services/SupabaseDataStore.js taskmanagement/js/app.js taskmanagement/js/constants.js
git commit -m "feat: hydrate App.COMPANIES from database; constants become offline fallback"
```

### Task 5: Frontend — retire the membership machinery

**Files:**
- Modify: `taskmanagement/js/views/TopbarView.js` (nav entry line ~158; permissions menu item lines ~441-443, 519-523)
- Modify: `taskmanagement/js/app.js` (view construction lines ~222-227)
- Modify: `taskmanagement/js/services/SupabaseDataStore.js` (`deleteProfile` ~898-928, `createUser` ~930-945)

**Interfaces:**
- Produces: no reachable UI path to approvals, permissions admin, user creation, or user deletion inside the task app; the two retired edge functions (`create-user`, `delete-user`) have no live callers. `ApprovalView.js` / `PermissionsAdminView.js` files stay on disk (unreferenced) so the diff is reviewable — deletion is Phase 4 cleanup.

- [ ] **Step 1: Remove the entry points** — drop the `approvals` push at TopbarView.js:158 and the permissions menu item + its click handler (TopbarView.js:441-443, 519-523), each replaced by a one-line comment naming Command Center as the owner (locked decision 7).

- [ ] **Step 2: Stop constructing the retired views** — comment out the `new App.ApprovalView(...)` and `new App.PermissionsAdminView(...)` lines in app.js:222,227 with the same comment. (Leave `CheckinSettingsView` alone — Phase 2 kept it.)

- [ ] **Step 3: Neutralize the datastore methods** — make `deleteProfile` and `createUser` throw immediately instead of invoking the retired functions:

```javascript
  /* RETIRED (Phase 3, locked decision 7): Command Center owns membership.
     Worker removal = remove from workspace in CC; account creation = CC invite. */
  async deleteProfile() {
    throw new Error('User deletion is managed in Command Center.');
  }

  async createUser() {
    throw new Error('User creation is managed in Command Center.');
  }
```

- [ ] **Step 4: Verify nothing live still calls the retired functions**

```bash
grep -rn "functions.invoke('create-user'\|functions.invoke('delete-user'" taskmanagement/js --include=*.js
grep -rn "ApprovalView\|PermissionsAdminView" taskmanagement/js --include=*.js
node --check taskmanagement/js/views/TopbarView.js && node --check taskmanagement/js/app.js && node --check taskmanagement/js/services/SupabaseDataStore.js
```

Expected: first grep returns nothing; second returns only the commented-out construction lines and the (now unreachable) view files themselves.

- [ ] **Step 5: Commit**

```bash
git add taskmanagement/js
git commit -m "feat: retire task-app approval/permissions/user-CRUD paths (CC owns membership)"
```

### Task 6: Remove hardcoded Quest staff from shipped constants

**Files:**
- Modify: `taskmanagement/js/constants.js` (`App.PEOPLE`, lines 3-10)

**Interfaces:**
- Produces: `App.PEOPLE = {}` with a comment explaining real people come from `team_members`. Fallback-only data today, but it ships real Quest names/emails to every tenant's browser.

- [ ] **Step 1: Empty it**

```javascript
// Real people come from the team_members table (RLS-scoped to the caller's
// companies). This fallback shipped Quest staff names/emails to every tenant's
// browser, so it is intentionally empty in the multi-tenant build.
App.PEOPLE = {};
```

- [ ] **Step 2: Check consumers tolerate empty** — `grep -rn "App.PEOPLE" taskmanagement/js --include=*.js`; each hit must already handle a missing person (they read from loaded `people` rows in normal operation). If any hit would throw on empty, guard it in this task and note it in the commit.

- [ ] **Step 3: Commit**

```bash
git add taskmanagement/js/constants.js
git commit -m "chore: drop hardcoded Quest staff from shipped constants"
```

### Task 7: Verify + phase close

- [ ] **Step 1: Static checks**

```bash
cd /c/Users/tagal/quest-hq-command-center
for f in $(git diff --name-only main...HEAD -- 'taskmanagement/js/*.js' 'taskmanagement/js/**/*.js'); do node --check "$f" || echo "SYNTAX FAIL $f"; done
```

- [ ] **Step 2: Signed-out redirect still works** (the only runtime check available before the migrations run — the app can't boot signed-in until then):

```bash
npm run dev   # note the port
SCRATCH="$HOME/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$SCRATCH/chrome-p3" --screenshot="$SCRATCH/p3-unauth.png" --window-size=1440,900 \
  --virtual-time-budget=12000 --timeout=30000 "http://127.0.0.1:<PORT>/taskmanagement/app.html"
```

Expected: Command Center's sign-in screen (same as Phase 2's verification).

- [ ] **Step 3: Tests + build** (stop dev server first)

```bash
npm test        # expect 214+ pass, 0 fail
npm run build   # expect bundle budget pass
```

- [ ] **Step 4: Commit the phase marker**

```bash
git add -A
git commit -m "feat: phase 3 complete — tenant-hardened task module"
```

---

## Deferred to Phase 4/5 (tracked)

- Swap CC's placeholder tasks page for the real module; delete `renderTasksPage` (src/main.js:9291) and repoint the sidebar module (src/main.js:958) and the legacy `/task-management.html` redirect (src/main.js:25687).
- Port `notify-email` + tenant-review every template; disposition `ai-assistant`, `report-problem`, `checkins`, `due-reminders`.
- Delete the now-unreferenced `ApprovalView.js` / `PermissionsAdminView.js` files.
- `team_members` junction-table refactor (structural; array-overlap RLS covers launch).
- The two-tenant leak test (Phase 5) is what proves Task 1's fixes actually hold — these policy rewrites are the *claim*, the leak test is the *evidence*.

## Open questions

1. **Product branding**: the task app says "Quest HQ" throughout (title, login mesh panel, loader). Outside tenants will see it. Keep as the product name (like "Salesforce"), or make it workspace-branded? Not blocking Phase 3 — flagging before outsiders sign up.
2. **`time_entries.task_company`**: if the column doesn't exist, Task 1 adds it. Confirm no CC feature computes labor cost off a different column first.
