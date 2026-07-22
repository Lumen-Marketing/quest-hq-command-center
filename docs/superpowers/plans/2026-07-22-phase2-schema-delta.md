# Phase 2 Schema Delta Report — task app absorption

Date: 2026-07-22. Research only — nothing here has been applied.

**Sources of truth used**
- CC schema: `C:\Users\tagal\quest-hq-command-center\supabase\migrations\*.sql` (61 files, filename order). Key files: `202606121100_taskmanagement_runtime.sql` (7 task tables), `202606181700_live_inbox_notifications.sql` (notifications extension), `202606241700_launch_readiness_saas.sql` (tasks RLS rewrite), `202607081000_recycle_bin_safe_delete.sql:95-96` (tasks.deleted_at/deleted_by).
- Upstream live column shapes: `mcp list_tables` (verbose) against project `qqvmcsvdxhgjooirznrj`, public schema, on 2026-07-22.
- Upstream constraints/RLS intent: `C:\Users\tagal\TaskManagementQuest-upstream\supabase\sql\*.sql` (003–071; note there is **no 069** — see the task_label_sops finding).
- Frontend usage: vendored copy `C:\Users\tagal\quest-hq-command-center\taskmanagement\js` (identical to upstream `9976c4d` for these files).
- CC tenancy helpers (locked decision 1): `app_private.is_company_member(text)` / `is_company_admin(text)` (`202606161200_subscription_tenant_permissions.sql:166-196`), `is_quest_admin()` (`202606241700_launch_readiness_saas.sql:9-21`).

---

## 1. Per-table delta — the 7 shared tables

Legend: **ADD** = additive alter in the draft migration. **SKIP** = belongs to retired approval/role machinery or is unused. **CONFLICT** = human decision needed. "CC-only" columns are kept as-is (they never block the task app: every extra NOT NULL column has a default).

### tasks

| Delta | Detail | Verdict |
| --- | --- | --- |
| Upstream-only column `focus_seq` real, null | Focus-list ordering (upstream 050) | **ADD** |
| Upstream-only column `completed_at` timestamptz, null | upstream 052 | **ADD** |
| Upstream-only column `assignee_ids` text[] not null default `{}` | multi-assignee (upstream 060); lead mirrored into `assignee_id` | **ADD** |
| Upstream-only column `wo_number` int, null | work-order number (upstream 061) | **ADD** |
| Upstream-only column `reminder_offset` text, null | upstream 062 | **ADD** |
| Upstream-only column `stuck` jsonb, null | upstream 063 | **ADD** |
| Upstream FK `tasks_project_id_fkey` → projects(id) **on delete set null** (upstream 055:28-30); CC `project_id` has no FK (projects table absent) | | **ADD** (after creating projects) |
| CC-only columns `deleted_at`, `deleted_by` (recycle bin, `202607081000:95-96`) | Task app selects `*` and never writes them — harmless | keep |
| CC CHECKs `tasks_type_check`, `tasks_label_check`, `tasks_status_check` (`202606121100:81-85`); upstream **dropped** these in `058_task_taxonomy_drop_checks.sql` because type/status/label became per-company data (task_types etc.) | Keeping them breaks the Settings→Task setup CRUD the moment a custom type/status/label is created; dropping them loosens validation to “whatever taxonomy rows exist”. Draft migration includes the drops behind a loud comment. | **CONFLICT** (open question 1) |

All six new columns are written on **every task insert/update** (`taskmanagement/js/services/SupabaseDataStore.js:383-425` `_taskRow`), so without them the first save fails with an unknown-column PostgREST error. Loads are unaffected (`select('*')`).

### profiles

| Delta | Detail | Verdict |
| --- | --- | --- |
| Upstream-only column `position` text, null (upstream 065) | In the frontend's explicit profile column list (`SupabaseDataStore.js:9` `_profileColumns`), selected during **boot** for anyone with `roles.manage`/`team.view` (`:170-172`) — missing column = select error = boot failure for admins | **ADD** (boot blocker) |
| CC-only: `onboarded`, `updated_at`, wider `profiles_role_check` (adds 'member', 'construction_supervisor') | superset, harmless | keep |
| Upstream `approved` default true + its approval trigger/policy web (006, 014, 017, 024, 029, 030, 033…) | CC owns identity/approval (locked decision 2) | **SKIP** |

### team_members

| Delta | Detail | Verdict |
| --- | --- | --- |
| Upstream-only column `position` text, null (upstream 065) | directory/profile UI reads it; `select('*')` tolerant | **ADD** |
| Upstream-only column `role` text, null (upstream 066) | same | **ADD** |
| Upstream color-format / avatar-url CHECKs on live DB | cosmetic hardening; CC lacks them; not required by the app | not carried (note only) |

### time_entries — column-for-column identical (id, user_id, task_id, start_at, end_at, duration_ms + check, note, created_at). **No change.**

### active_timers — column-for-column identical (user_id PK, task_id, started_at, task_title, task_company, updated_at). **No change.**

### notifications

| Delta | Detail | Verdict |
| --- | --- | --- |
| CC-only columns from `202606181700:1-16`: `company_id` (FK companies), `recipient_profile_id`, `type`, `title`, `body`, `href`, `source_type`, `source_id`, `read_at`; `member_id` made nullable | All CC extras have defaults, so the task app's inserts (id, member_id, task_id, meta, html, read) succeed unchanged. CC rows without `member_id` are simply invisible to the task app's `.eq('member_id', …)` read (`SupabaseDataStore.js:168`). | no schema change |
| Phase-3 note | task-app-inserted rows have `company_id` null → review in the RLS pass | — |

### companies — CC is a strict superset (`name`, `short_name`, `color`, `icon_key`, `icon_image` + upstream's `label`, `pill`, both added by `202606121100:3-15`). Frontend only reads `label`/`pill`. **No change.**

---

## 2. New-table inventory

Boot path: `SupabaseDataStore.load()` (`taskmanagement/js/services/SupabaseDataStore.js:152-188`) hard-throws on `projects`, `task_types`, `task_type_statuses`, `task_labels` errors (`:184-187`). Everything else is lazy or failure-tolerant.

| Table | Live column shape (verbose list_tables) | Source SQL | Frontend file(s) | Boots without it? |
| --- | --- | --- | --- | --- |
| **projects** | id text PK, company_id text NN→companies, name text NN, address text NN dflt '', status text NN dflt 'active' + check (lead/active/hold/complete/cancelled), budget numeric, start_date date, due_date date, color text NN dflt '#8f867b', client text, created_at, updated_at | 006:1-13, 055:8-9 | SupabaseDataStore.js:173 (boot), 431, 456, 466, 1042 | **NO** — throw at :184 |
| **task_types** | id uuid PK, company_id text NN→companies cascade, key, label, color dflt '#8f867b', sort_order float8, active bool, created_at; unique(company_id,key) | 056:9-18 | SupabaseDataStore.js:176 (boot), 478, 515, 520 | **NO** — throw at :185 |
| **task_type_statuses** | id uuid PK, company_id NN→companies cascade, type_key, key, label, color, sort_order, is_done, is_default, active, created_at; unique(company_id,type_key,key); partial uniques one-done/one-default (056:47-48) | 056:19-30 | SupabaseDataStore.js:177 (boot), 479, 526, 531 | **NO** — throw at :186 |
| **task_labels** | id uuid PK, company_id NN→companies cascade, key, label, color, sort_order, active, created_at; unique(company_id,key) | 056:31-40 | SupabaseDataStore.js:178 (boot), 480, 537, 542 | **NO** — throw at :187 |
| **task_comments** | id uuid PK, task_id text NN, author_id text NN, body text NN, mentions text[] NN dflt {}, kind text NN dflt 'comment' + check(comment/note/call), created_at | 053, 064:15-28 | SupabaseDataStore.js:87, 100, 110 (task-detail drawer, lazy) | yes |
| **comment_reactions** | id uuid PK, comment_id uuid NN→task_comments cascade, member_id text NN, emoji text NN, created_at; unique(comment_id,member_id,emoji) | 064:31-38 | SupabaseDataStore.js:129, 139 (lazy) | yes |
| **wo_counters** (+ RPC `assign_wo_number`) | company_id text PK, next_val int NN dflt 1 | 061 | SupabaseDataStore.js:439-449 (task create; **failure-tolerant** — warns, task stays unnumbered) | yes |
| **bug_reports** | id uuid PK, reporter_id uuid→profiles set null, reporter_name, reporter_email, type + check(bug/problem/suggestion), description NN + nonblank check, context jsonb, status + check(open/resolved), created_at, resolved_at | 059_bug_reports | SupabaseDataStore.js:837, 847 (developer triage panel, lazy); submissions go through `report-problem` edge fn (Phase 4) | yes |
| **checkin_settings** | singleton: id int PK dflt 1 + check(id=1), morning/eod/stalled toggles, stalled_days, eod_idle_minutes, updated_by, updated_at | 070 | SupabaseDataStore.js:492-512 (admin-only CheckinSettingsView, lazy) | yes |
| **checkin_log** | PK(kind,subject,period), sent_at; service-role-only ledger, RLS deny-all | 071 | none (edge fn `checkins`, Phase 4) | yes |
| **reminder_log** | PK(task_id,kind), sent_at; service-role-only ledger, RLS deny-all | 054 | none (edge fn `due-reminders`, Phase 4) | yes |
| **schedules** | id text PK, title, project_id, task_id, assigned_to, starts_at, ends_at, recurrence_rule, notes, created_at, updated_at | 006:15-27 | **none** — zero references in `taskmanagement/js` | yes — **SKIP entirely** (dead upstream feature; do not port) |

### The task_label_sops mystery — resolved

- The live DB has **no** `task_label_sops` table (confirmed by verbose list_tables) and upstream has **no** `069_*.sql` — the numbering jumps 068 → 070.
- `069_task_label_sops.sql` was a *planned* migration owned by a concurrent session that never landed: `TaskManagementQuest-upstream\docs\superpowers\plans\2026-07-15-ai-proactive-checkins.md:20` explicitly reserves the number for it.
- The client shipped its DataStore plumbing anyway, defensively: `_optionalSelect('task_label_sops')` (`SupabaseDataStore.js:179, 228-241, 481`) returns `[]` instead of throwing, so boot degrades cleanly.
- **Bonus finding:** the rest of the SOP feature is missing from the release commit. `NewTaskPageView.js:588` calls `App.taxonomy.activeSop(...)` and `:590` calls `App.utils.mergeSopSteps(...)`, but neither is defined anywhere in the repo at `9976c4d` (grep of all JS, both vendored and upstream clone). `_applySop()` runs whenever the New Task page's company or label changes (`NewTaskPageView.js:402, 522, 639, 843`), so selecting a label should throw a TypeError in this build. Worth a quick manual repro; either way, Phase 2/3 should guard or strip the SOP code path.
- **Verdict: SKIP the table** — there is no schema anywhere to copy (no SQL file, no live table), and the only consumers are the orphaned CRUD methods `createSopStep/updateSopStep/deleteSopStep` (`SupabaseDataStore.js:551-564`) that nothing reachable calls. Listed as open question 3.

---

## 3. Draft additive migration SQL

Suggested filename: `supabase/migrations/202607221200_taskmanagement_phase2_schema.sql`. **Not written into `supabase/migrations/` yet — draft only.** Style follows `202607010900_forms_shared_data.sql` (create-if-not-exists, drop-policy-then-create, `public.set_updated_at()` triggers, explicit grants). All policies use only `app_private.is_company_member / is_company_admin / is_quest_admin` + `auth.uid()` per locked decisions 1–2.

```sql
-- Phase 2: task app schema reconciliation (additive).
-- Shared-table deltas + 11 new tables. Fresh start: no data migration
-- (locked decision 3). Seed rows: default task taxonomy per existing
-- company (optional — client falls back to constants; see report §5 Q5).

-- ============================================================
-- A. Shared-table additive alters
-- ============================================================

alter table public.tasks
  add column if not exists focus_seq real,
  add column if not exists completed_at timestamptz,
  add column if not exists assignee_ids text[] not null default '{}'::text[],
  add column if not exists wo_number int,
  add column if not exists reminder_offset text,
  add column if not exists stuck jsonb;

comment on column public.tasks.focus_seq is
  'Execution-order sort key for the assignee''s Focus list. NULL = not in Focus.';

-- !!! CONFLICT — human sign-off required (report §1 tasks, §5 Q1) !!!
-- Upstream dropped these in 058 because type/status/label became per-company
-- data (task_types / task_type_statuses / task_labels). Keeping them breaks
-- custom-taxonomy CRUD. Delete these three lines to keep the checks instead.
alter table public.tasks drop constraint if exists tasks_type_check;
alter table public.tasks drop constraint if exists tasks_label_check;
alter table public.tasks drop constraint if exists tasks_status_check;

alter table public.profiles
  add column if not exists position text;

alter table public.team_members
  add column if not exists position text,
  add column if not exists role text;

-- ============================================================
-- B. projects (+ tasks.project_id FK, on delete set null per upstream 055)
-- ============================================================

create table if not exists public.projects (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  address text not null default '',
  status text not null default 'active',
  budget numeric(12,2),
  start_date date,
  due_date date,
  color text not null default '#8f867b',
  client text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check check (status in ('lead', 'active', 'hold', 'complete', 'cancelled'))
);

create index if not exists projects_company_idx on public.projects(company_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tasks_project_id_fkey' and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_project_id_fkey
      foreign key (project_id) references public.projects(id) on delete set null;
  end if;
end $$;

alter table public.projects enable row level security;

drop policy if exists "company members read projects" on public.projects;
create policy "company members read projects" on public.projects
for select to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members insert projects" on public.projects;
create policy "company members insert projects" on public.projects
for insert to authenticated
with check (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members update projects" on public.projects;
create policy "company members update projects" on public.projects
for update to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin())
with check (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members delete projects" on public.projects;
create policy "company members delete projects" on public.projects
for delete to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin());

-- ============================================================
-- C. Task taxonomy: task_types / task_type_statuses / task_labels
--    (upstream 056; read = member, write = company admin)
-- ============================================================

create table if not exists public.task_types (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create table if not exists public.task_type_statuses (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  type_key text not null,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  is_done boolean not null default false,
  is_default boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, type_key, key)
);

create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create index if not exists task_types_company_idx on public.task_types (company_id);
create index if not exists task_type_statuses_company_type_idx on public.task_type_statuses (company_id, type_key);
create index if not exists task_labels_company_idx on public.task_labels (company_id);
create unique index if not exists task_status_one_done on public.task_type_statuses (company_id, type_key) where is_done;
create unique index if not exists task_status_one_default on public.task_type_statuses (company_id, type_key) where is_default;

alter table public.task_types enable row level security;
alter table public.task_type_statuses enable row level security;
alter table public.task_labels enable row level security;

do $$
declare t text;
begin
  foreach t in array array['task_types', 'task_type_statuses', 'task_labels'] loop
    execute format('drop policy if exists "company members read %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company members read %1$s" on public.%1$I
      for select to authenticated
      using (app_private.is_company_member(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins insert %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins insert %1$s" on public.%1$I
      for insert to authenticated
      with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins update %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins update %1$s" on public.%1$I
      for update to authenticated
      using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
      with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins delete %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins delete %1$s" on public.%1$I
      for delete to authenticated
      using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
  end loop;
end $$;

-- Optional seed: default taxonomy for EXISTING companies (mirrors upstream 057
-- values). The client falls back to js/constants.js when these tables are empty
-- (taxonomy.js:71 seedFromConstants), so this seed is convenience, not boot-
-- critical. New-workspace seeding belongs in Phase 3's create_workspace work.
insert into public.task_types (company_id, key, label, sort_order)
select c.id, t.key, t.label, t.ord
from public.companies c
cross join (values
  ('lead','Lead',0),('bid','Bid / Estimate',1),('admin','Admin',2),
  ('invoicing','Invoicing',3),('ar','AR',4),('meeting','Meeting',5),
  ('web_dev','Web development',6)
) t(key,label,ord)
on conflict (company_id, key) do nothing;

insert into public.task_type_statuses (company_id, type_key, key, label, color, sort_order, is_done, is_default)
select c.id, ty.key, s.key, s.label, s.color, s.ord, s.is_done, s.is_default
from public.companies c
cross join (values ('lead'),('bid'),('admin'),('invoicing'),('ar'),('meeting'),('web_dev')) ty(key)
cross join (values
  ('todo','Working on it','#3E7BF2',0,false,true),
  ('pending','Pending','#8F867B',1,false,false),
  ('hold','Stuck','#E0484D',2,false,false),
  ('review','In review','#ED9A3A',3,false,false),
  ('done','Done','#2E9E6B',4,true,false)
) s(key,label,color,ord,is_done,is_default)
on conflict (company_id, type_key, key) do nothing;

insert into public.task_labels (company_id, key, label, sort_order)
select c.id, l.key, l.label, l.ord
from public.companies c
cross join (values ('roof','Roof',0),('roof_framing','Roof & Framing',1),('framing','Framing',2)) l(key,label,ord)
on conflict (company_id, key) do nothing;

-- ============================================================
-- D. task_comments + comment_reactions
--    Tenant scope rides the parent-task chain: tasks.company_id.
--    "Act as yourself" = auth.uid()'s profile.member_id matches.
-- ============================================================

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references public.tasks(id) on delete cascade,
  author_id text not null,
  body text not null,
  mentions text[] not null default '{}'::text[],
  kind text not null default 'comment',
  created_at timestamptz not null default now(),
  constraint task_comments_kind_check check (kind in ('comment', 'note', 'call'))
);

create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);

alter table public.task_comments enable row level security;

drop policy if exists "company members read task_comments" on public.task_comments;
create policy "company members read task_comments" on public.task_comments
for select to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and (app_private.is_company_member(t.company_id) or app_private.is_quest_admin())
  )
);

drop policy if exists "company members insert own task_comments" on public.task_comments;
create policy "company members insert own task_comments" on public.task_comments
for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = task_comments.author_id
  )
  and exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and app_private.is_company_member(t.company_id)
  )
);

drop policy if exists "authors and admins delete task_comments" on public.task_comments;
create policy "authors and admins delete task_comments" on public.task_comments
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = task_comments.author_id
  )
  or exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())
  )
);

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.task_comments(id) on delete cascade,
  member_id text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, member_id, emoji)
);

create index if not exists comment_reactions_comment_idx on public.comment_reactions (comment_id);

alter table public.comment_reactions enable row level security;

drop policy if exists "company members read comment_reactions" on public.comment_reactions;
create policy "company members read comment_reactions" on public.comment_reactions
for select to authenticated
using (
  exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and (app_private.is_company_member(t.company_id) or app_private.is_quest_admin())
  )
);

drop policy if exists "company members insert own comment_reactions" on public.comment_reactions;
create policy "company members insert own comment_reactions" on public.comment_reactions
for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = comment_reactions.member_id
  )
  and exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and app_private.is_company_member(t.company_id)
  )
);

drop policy if exists "owners and admins delete comment_reactions" on public.comment_reactions;
create policy "owners and admins delete comment_reactions" on public.comment_reactions
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = comment_reactions.member_id
  )
  or exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())
  )
);

-- ============================================================
-- E. wo_counters + assign_wo_number RPC (upstream 061, tenant-guarded)
-- ============================================================

create table if not exists public.wo_counters (
  company_id text primary key references public.companies(id) on delete cascade,
  next_val int not null default 1
);

alter table public.wo_counters enable row level security;
-- RLS on, no policies: only the security-definer RPC below touches this table.

create or replace function public.assign_wo_number(company text)
returns int
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  assigned int;
begin
  -- Tenant guard (CC addition vs upstream 061): only members of the company
  -- may advance its counter.
  if not (app_private.is_company_member(company) or app_private.is_quest_admin()) then
    raise exception 'not a member of company %', company;
  end if;

  insert into public.wo_counters as c (company_id, next_val)
    values (company, 2)
  on conflict (company_id)
    do update set next_val = c.next_val + 1
    returning (c.next_val - 1) into assigned;
  return coalesce(assigned, 1);
end;
$$;

revoke all on function public.assign_wo_number(text) from public, anon;
grant execute on function public.assign_wo_number(text) to authenticated;

-- ============================================================
-- F. bug_reports (platform-level support inbox; writes only via the
--    report-problem edge function — service role bypasses RLS)
-- ============================================================

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text,
  reporter_email text,
  type text not null default 'bug',
  description text not null,
  context jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint bug_reports_type_check check (type in ('bug', 'problem', 'suggestion')),
  constraint bug_reports_description_check check (length(btrim(description)) > 0),
  constraint bug_reports_status_check check (status in ('open', 'resolved'))
);

create index if not exists bug_reports_reporter_created_idx on public.bug_reports (reporter_id, created_at desc);
create index if not exists bug_reports_created_idx on public.bug_reports (created_at desc);

alter table public.bug_reports enable row level security;

drop policy if exists "quest admins read bug_reports" on public.bug_reports;
create policy "quest admins read bug_reports" on public.bug_reports
for select to authenticated using (app_private.is_quest_admin());

drop policy if exists "quest admins update bug_reports" on public.bug_reports;
create policy "quest admins update bug_reports" on public.bug_reports
for update to authenticated
using (app_private.is_quest_admin()) with check (app_private.is_quest_admin());

drop policy if exists "quest admins delete bug_reports" on public.bug_reports;
create policy "quest admins delete bug_reports" on public.bug_reports
for delete to authenticated using (app_private.is_quest_admin());

-- ============================================================
-- G. Check-ins (feature ships dark until Phase 4 ports the edge fns)
--    checkin_settings is PER-COMPANY here, not upstream's global singleton
--    (report §5 Q2 — needs sign-off + a two-line frontend patch).
-- ============================================================

create table if not exists public.checkin_settings (
  company_id text primary key references public.companies(id) on delete cascade,
  morning_enabled boolean not null default false,
  eod_enabled boolean not null default false,
  stalled_enabled boolean not null default false,
  stalled_days integer not null default 3,
  eod_idle_minutes integer not null default 90,
  updated_by text,
  updated_at timestamptz not null default now()
);

drop trigger if exists checkin_settings_set_updated_at on public.checkin_settings;
create trigger checkin_settings_set_updated_at
before update on public.checkin_settings
for each row execute function public.set_updated_at();

alter table public.checkin_settings enable row level security;

drop policy if exists "company admins read checkin_settings" on public.checkin_settings;
create policy "company admins read checkin_settings" on public.checkin_settings
for select to authenticated
using (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

drop policy if exists "company admins insert checkin_settings" on public.checkin_settings;
create policy "company admins insert checkin_settings" on public.checkin_settings
for insert to authenticated
with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

drop policy if exists "company admins update checkin_settings" on public.checkin_settings;
create policy "company admins update checkin_settings" on public.checkin_settings
for update to authenticated
using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

create table if not exists public.checkin_log (
  kind text not null,
  subject text not null,
  period text not null,
  sent_at timestamptz not null default now(),
  primary key (kind, subject, period)
);

alter table public.checkin_log enable row level security;
-- RLS on, no policies: service-role-only dedupe ledger (upstream 071).

-- ============================================================
-- H. reminder_log (service-role-only dedupe ledger for due-reminders, upstream 054)
-- ============================================================

create table if not exists public.reminder_log (
  task_id text not null,
  kind text not null,
  sent_at timestamptz not null default now(),
  primary key (task_id, kind)
);

alter table public.reminder_log enable row level security;
-- RLS on, no policies: service-role-only.

-- ============================================================
-- I. Grants
-- ============================================================

grant select, insert, update, delete on
  public.projects,
  public.task_types,
  public.task_type_statuses,
  public.task_labels,
  public.task_comments,
  public.comment_reactions
to authenticated;

grant select, update, delete on public.bug_reports to authenticated;
grant select, insert, update on public.checkin_settings to authenticated;
-- wo_counters, checkin_log, reminder_log: no grants — RPC / service role only.
```

### Retired upstream policies and machinery (intentionally NOT carried over)

| Upstream item | Where | Why retired |
| --- | --- | --- |
| `p.approved is true` gates in every policy | 006:111-123, 053:37, 064:73-76, and most others | CC owns approval; membership status='active' inside `is_company_member` replaces it (locked decision 2) |
| `public.current_profile_role()` role ladder (worker/sales/supervisor/admin/developer) and `developer` god-mode | 055:38-58, 056:54-75, 059_bug_reports:34-45, 070:25-29 | Translated: member → `is_company_member`, admin-ish → `is_company_admin`, developer → `is_quest_admin` |
| checkin_settings global-singleton admin policies | 070:25-29 | Replaced by per-company shape (pending Q2) |
| `schedules` table + its four "approved users" policies | 006:15-27, 108-123 | Zero frontend references at release `9976c4d` — dead feature, not ported |
| supervisor-hierarchy read grants inside comment/reaction delete policies | 053:46, 064:86 | Supervisor concept lives in CC's membership roles now; company admin covers the moderation case |
| upstream `handle_new_user` / approval triggers / `create-user` + `delete-user` edge fns | 006:125-152, 029, functions/ | CC bootstrap (`202606121100:232-309`) and CC invite flow own these (Phase 3 retires app screens) |
| upstream avatar/color CHECK hardening on profiles/team_members | live DB only | Cosmetic; CC can adopt later if wanted, not needed for parity |

---

## 4. Boot-blocker list (minimal "boot" migration)

`SupabaseDataStore.load()` throws (and the app shows the error wall) without:

1. `public.projects` table — `SupabaseDataStore.js:173` + `_throwIfError` at `:184`.
2. `public.task_types` — `:176` / `:185`.
3. `public.task_type_statuses` — `:177` / `:186`.
4. `public.task_labels` — `:178` / `:187` (empty tables are fine — `taxonomy.js:71` falls back to constants; the tables just have to exist).
5. `profiles.position` column — in the explicit select list `SupabaseDataStore.js:9`, boot-fatal at `:183` for any user with `roles.manage`/`team.view` (i.e. every admin).

**First-save blockers** (boot succeeds, but creating/updating any task fails): the six `tasks` columns (`focus_seq`, `completed_at`, `assignee_ids`, `wo_number`, `reminder_offset`, `stuck`) — all present in every write payload (`SupabaseDataStore.js:383-425`). Recommend treating sections A+B+C of the draft as the "boot" migration; D–H can ship in a second "full-feature" migration (comments drawer, reactions, WO numbers, bug triage, check-ins degrade gracefully: comments drawer errors on open, `assignWoNumber` warns and returns null at `:443-447`).

Everything else (task_comments, comment_reactions, wo_counters, bug_reports, checkin_*, reminder_log) is lazy or failure-tolerant.

---

## 5. Open questions (decision-ready)

1. **Drop the three `tasks` CHECKs** (`tasks_type_check`, `tasks_label_check`, `tasks_status_check`)? Required for the customizable taxonomy the frontend ships (upstream did it in 058). Alternative: keep them and hide the taxonomy Settings UI until Phase 3. Recommendation: drop.
2. **checkin_settings tenancy**: drafted as per-company (PK `company_id`), which needs a two-line frontend patch in `SupabaseDataStore.js:492-512` (`.eq('id', 1)` → `.eq('company_id', <company>)` and an upsert). Alternative: keep upstream's global singleton gated to `is_quest_admin()` and defer per-tenant check-ins. Recommendation: per-company, patched in Phase 2 since the feature ships dark anyway.
3. **task_label_sops / SOP feature**: no table exists anywhere (planned migration 069 never landed) and the release commit also lacks `App.taxonomy.activeSop` / `App.utils.mergeSopSteps`, which `NewTaskPageView.js:588-590` calls — a likely runtime TypeError on label/company change in the New Task page. Strip the SOP plumbing (recommended) or design the table + finish the feature?
4. **bug_reports scope**: drafted as platform-global (quest-admin inbox, no `company_id`) matching upstream intent. If tenant workspaces should see their own reports later, add `company_id` then. OK as global?
5. **Default taxonomy seeding for future workspaces**: the draft seeds existing companies only. New workspaces get the constants fallback until seeded. Fold per-workspace seeding into Phase 3's `create_workspace` update (where the `'tasks'` plugin backfill already lives)?
