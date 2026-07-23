# Per-Person Task Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the live workspace-permission model, make crew see and edit only their own tasks while job leads and company owners/admins see and manage all — via one migration that rewrites two `tasks` RLS policies.

**Architecture:** Layer a per-person filter on top of the existing `tasks` read/update policies. The outer gates (`app_private.is_workspace_member`, `app_private.has_workspace_permission`) are preserved; the filter can only narrow access. "Lead" = holds `tasks.manage` on the workspace (company owner/admin/developer satisfy this automatically); "crew" = holds only `tasks.view` and is limited to rows where they are `assignee_id` or `creator_id`. No new tables, functions, or UI.

**Tech Stack:** PostgreSQL / Supabase RLS, Node `@supabase/supabase-js` test scripts, Vite build, repo `ai:check` context validator.

## Global Constraints

- Work only in the worktree `.worktrees/task-visibility` on branch
  `feat/task-per-person-visibility` (off `origin/main`). Do NOT use the stale
  `.worktrees/task-app`.
- All DB changes go in ONE new migration:
  `supabase/migrations/202607241200_per_person_task_visibility.sql`
  (timestamp sorts after the latest, `202607231200_ringcentral_calls.sql`).
- Migration is **applied by the user** via their Supabase workflow. Do NOT
  auto-apply, and do NOT start a local/preview server (the team deploys directly).
- Preserve tenant boundaries, RLS, and the permission model: keep
  `is_workspace_member` + `has_workspace_permission` as outer gates on every
  rewritten policy; the per-person filter is strictly additive-narrowing.
- Do NOT modify `has_workspace_permission`, `is_workspace_member`,
  `workspace_memberships`, `roles`, `role_permissions`, or the `tasks` INSERT and
  DELETE policies (they stay `tasks.manage`).
- `tasks.assignee_id` and `tasks.creator_id` are `text` and compare directly to
  `public.current_member_id()` (returns the caller's member id as text).
- Per `.ai/README.md`: any RLS change must refresh `.ai/database/*` +
  `.ai/current-state.md` and record the decision in `.ai/decisions.md` in the
  same change; `npm run check` (runs `ai:check`) must pass.
- Base the DROP/CREATE on the exact live policy names:
  `tasks workspace read`, `tasks workspace update` (defined in
  `supabase/migrations/202607211200_company_operational_workspaces.sql:742-748`).

---

### Task 1: Migration — rewrite `tasks` read + update policies

**Files:**
- Create: `supabase/migrations/202607241200_per_person_task_visibility.sql`

**Interfaces:**
- Consumes (existing, live): `app_private.is_workspace_member(uuid)`,
  `app_private.has_workspace_permission(uuid, text)`,
  `public.current_member_id() returns text`.
- Produces: redefined policies `tasks workspace read` (SELECT) and
  `tasks workspace update` (UPDATE) on `public.tasks`.

- [ ] **Step 1: Write the migration file**

```sql
-- Per-person task visibility.
-- Live model: tasks RLS gates on is_workspace_member + has_workspace_permission,
-- so anyone with tasks.view on a workspace sees EVERY task in it. This narrows
-- that: a "lead" (holds tasks.manage — company owner/admin/developer do so
-- automatically) still sees/edits all tasks on the job; everyone else ("crew",
-- tasks.view only) is limited to tasks they are assigned to or created. The
-- outer gates are unchanged, so tenant isolation and the permission model are
-- preserved — this can only narrow access, never widen it. INSERT and DELETE
-- keep their tasks.manage policies (create/delete stay lead/owner only).

drop policy if exists "tasks workspace read" on public.tasks;
create policy "tasks workspace read" on public.tasks for select to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, 'tasks.view')
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or assignee_id = public.current_member_id()
    or creator_id  = public.current_member_id()
  )
);

drop policy if exists "tasks workspace update" on public.tasks;
create policy "tasks workspace update" on public.tasks for update to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
)
with check (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
);
```

- [ ] **Step 2: Sanity-check the SQL locally (parse, both policies, no accidental insert/delete redefinition)**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('supabase/migrations/202607241200_per_person_task_visibility.sql','utf8');if((s.match(/create policy/g)||[]).length!==2)throw new Error('expected exactly 2 policies');for(const n of ['\"tasks workspace read\"','\"tasks workspace update\"','current_member_id','has_workspace_permission']){if(!s.includes(n))throw new Error('missing '+n);}if(/tasks workspace (insert|delete)/.test(s))throw new Error('must not touch insert/delete policies');console.log('OK: 2 tasks policies rewritten, insert/delete untouched');"`
Expected: `OK: 2 tasks policies rewritten, insert/delete untouched`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202607241200_per_person_task_visibility.sql
git commit -m "feat(tasks): per-person visibility — crew see/edit own; leads manage all"
```

---

### Task 2: Structural verifier SQL

**Files:**
- Create: `scripts/verify-per-person-task-visibility.sql`

**Interfaces:**
- Consumes: the applied migration (Task 1). Produces a SQL-editor script whose
  every row's `ok` column must be `true`.

- [ ] **Step 1: Write the verifier**

```sql
-- Run in the Supabase SQL editor AFTER applying
-- 202607241200_per_person_task_visibility.sql. Every ok must be true.

-- 1. Read policy now filters per person (references current_member_id).
select 'read policy filters per person' as check,
       exists(select 1 from pg_policies
              where schemaname='public' and tablename='tasks'
                and policyname='tasks workspace read'
                and coalesce(qual,'') like '%current_member_id%') as ok;

-- 2. Update policy now filters per person.
select 'update policy filters per person' as check,
       exists(select 1 from pg_policies
              where schemaname='public' and tablename='tasks'
                and policyname='tasks workspace update'
                and coalesce(qual,'') like '%current_member_id%'
                and coalesce(with_check,'') like '%current_member_id%') as ok;

-- 3. Read + update still carry the permission gate (never widened).
select 'read+update keep has_workspace_permission gate' as check,
       count(*) = 2 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname in ('tasks workspace read','tasks workspace update')
  and coalesce(qual,'') like '%has_workspace_permission%';

-- 4. Insert + delete are UNCHANGED (still manage-gated, no per-person filter).
select 'insert+delete unchanged (manage-only, no per-person filter)' as check,
       count(*) = 2 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname in ('tasks workspace insert','tasks workspace delete')
  and coalesce(qual,'') || coalesce(with_check,'') like '%tasks.manage%'
  and coalesce(qual,'') || coalesce(with_check,'') not like '%current_member_id%';

-- 5. All four task policies still present.
select 'four tasks workspace policies present' as check,
       count(*) = 4 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname like 'tasks workspace %';
```

- [ ] **Step 2: Verify the script shape (5 checks)**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('scripts/verify-per-person-task-visibility.sql','utf8');const n=(s.match(/ as ok;/g)||[]).length;if(n!==5)throw new Error('expected 5 checks, got '+n);console.log('OK: verifier has 5 checks');"`
Expected: `OK: verifier has 5 checks`

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-per-person-task-visibility.sql
git commit -m "test(tasks): structural verifier for per-person visibility migration"
```

---

### Task 3: Behavioral role-scope probe

**Files:**
- Create: `scripts/task-visibility-test.mjs`

**Interfaces:**
- Consumes: live project with the migration applied, anon key, and two real
  accounts in the SAME workspace — crew **C** (`tasks.view` only) and lead **L**
  (`tasks.manage`). Fixture: in that workspace, ≥1 task assigned to C, ≥1 task
  assigned to someone else and not created by C, and ≥1 task created by C but
  assigned to another person.
- Produces: `scripts/task-visibility-test.mjs`, run like
  `scripts/tenant-leak-test.mjs`.

- [ ] **Step 1: Write the probe**

```javascript
#!/usr/bin/env node
/* Per-person task visibility test — evidence for 202607241200_per_person_task_visibility.
 *
 * Crew C (tasks.view only) and Lead L (tasks.manage) in the SAME workspace.
 * Confirms C sees/edits only their own tasks, C always sees a task C created,
 * and L sees everything.
 *
 * Fixture in the shared workspace (WORKSPACE_ID):
 *   - >=1 task assigned to C
 *   - >=1 task assigned to someone else, NOT created by C
 *   - >=1 task created by C but assigned to another person
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... WORKSPACE_ID=... \
 *   C_EMAIL=... C_PASSWORD=... C_MEMBER_ID=... \
 *   L_EMAIL=... L_PASSWORD=... \
 *   node scripts/task-visibility-test.mjs
 *
 * Anon key only — a service-role key bypasses RLS and every probe passes falsely.
 */

import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey, WORKSPACE_ID,
  C_EMAIL, C_PASSWORD, C_MEMBER_ID, L_EMAIL, L_PASSWORD,
} = process.env;

if (!url || !anonKey || !WORKSPACE_ID || !C_EMAIL || !C_PASSWORD || !C_MEMBER_ID || !L_EMAIL || !L_PASSWORD) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, WORKSPACE_ID, C_EMAIL, C_PASSWORD, C_MEMBER_ID, L_EMAIL, L_PASSWORD');
  process.exit(2);
}
if (/^sb_secret_|service_role/i.test(anonKey)) {
  console.error('Refusing to run with a service-role key — it bypasses RLS.');
  process.exit(2);
}

const results = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const signIn = async (email, password, label) => {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) { console.error(`Could not sign in ${label} (${email}): ${error.message}`); process.exit(2); }
  return client;
};

const C = await signIn(C_EMAIL, C_PASSWORD, 'crew C');
const L = await signIn(L_EMAIL, L_PASSWORD, 'lead L');

const wsTasks = async (client) => {
  const { data, error } = await client.from('tasks')
    .select('id, assignee_id, creator_id, workspace_id').eq('workspace_id', WORKSPACE_ID);
  if (error) throw new Error(`tasks: ${error.message}`);
  return data ?? [];
};

// Crew sees ONLY own (assigned or created).
const cTasks = await wsTasks(C);
const cLeak = cTasks.filter((t) => t.assignee_id !== C_MEMBER_ID && t.creator_id !== C_MEMBER_ID);
record('Crew sees only own assigned/created tasks', cLeak.length === 0,
  cLeak.length ? `leaked ${cLeak.length}: ${cLeak.map((t) => t.id).join(', ')}` : 'no leak');

// Crew sees a task they created for someone else.
record('Crew sees a task they created for another person',
  cTasks.some((t) => t.creator_id === C_MEMBER_ID && t.assignee_id !== C_MEMBER_ID),
  `own-created-for-other visible in C's set`);

// Lead sees strictly more than crew in the same workspace (sees all).
const lTasks = await wsTasks(L);
record('Lead sees all workspace tasks (superset of crew)',
  lTasks.length > cTasks.length,
  `lead saw ${lTasks.length}, crew saw ${cTasks.length}`);

// Crew CANNOT update a task that is not theirs (RLS blocks -> 0 rows updated).
const foreign = lTasks.find((t) => t.assignee_id !== C_MEMBER_ID && t.creator_id !== C_MEMBER_ID);
if (foreign) {
  const { data: upd } = await C.from('tasks').update({ updated_at: new Date().toISOString() })
    .eq('id', foreign.id).select('id');
  record("Crew cannot update someone else's task", !upd || upd.length === 0,
    upd && upd.length ? `unexpectedly updated ${foreign.id}` : 'update blocked by RLS');
} else {
  record("Crew cannot update someone else's task", false, 'no foreign task available to probe');
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
```

- [ ] **Step 2: Verify the probe parses and guards its inputs**

Run: `node --check scripts/task-visibility-test.mjs && node -e "const fs=require('fs');const s=fs.readFileSync('scripts/task-visibility-test.mjs','utf8');for(const k of ['WORKSPACE_ID','C_MEMBER_ID','L_EMAIL']){if(!s.includes(k))throw new Error('missing env ref '+k);}if(!/service_role/.test(s))throw new Error('missing service-role guard');console.log('OK: probe parses and guards inputs');"`
Expected: `OK: probe parses and guards inputs`

- [ ] **Step 3: Commit**

```bash
git add scripts/task-visibility-test.mjs
git commit -m "test(tasks): behavioral per-person task-visibility probe"
```

---

### Task 4: Project-brain updates + full check

**Files:**
- Modify: `.ai/decisions.md` (append a decision entry)
- Modify: `.ai/current-state.md` (update the tasks-RLS description)
- Modify: `.ai/database/overview.md` (update the `tasks` policy summary)
- Modify: `.ai/manifest.json` (bump the relevant timestamp/source revision)

**Interfaces:**
- Consumes: Tasks 1-3. Produces: a green `npm run check` (test + ai:check + build).

- [ ] **Step 1: Append the decision to `.ai/decisions.md`**

Add this entry (match the file's existing heading/format; put it in date order):

```markdown
## 2026-07-24 — Per-person task visibility

Task visibility is now per person within a workspace. "Team = the job/workspace";
no reporting hierarchy. A **lead** (holds `tasks.manage` — company
owner/admin/developer automatically) sees and manages all tasks on the job; **crew**
(`tasks.view` only) see and update only tasks they are assigned to or created;
the creator always sees their own task. Enforced by narrowing the
`tasks workspace read` and `tasks workspace update` RLS policies
(migration `202607241200_per_person_task_visibility.sql`); `is_workspace_member`
and `has_workspace_permission` gates and the INSERT/DELETE (`tasks.manage`)
policies are unchanged, so tenant isolation and the permission model are preserved.
```

- [ ] **Step 2: Update `.ai/current-state.md` and `.ai/database/overview.md`**

In each file, find the sentence/row describing the `tasks` table RLS (currently
"anyone with `tasks.view` sees all workspace tasks" or equivalent) and replace it
with: "`tasks` read/update are per person — `tasks.manage` holders (leads,
owners, admins) see/manage all workspace tasks; `tasks.view`-only crew see/update
only tasks they are assigned to or created (migration
`202607241200_per_person_task_visibility.sql`). INSERT/DELETE remain
`tasks.manage`-gated." Keep each file's existing formatting.

- [ ] **Step 3: Bump `.ai/manifest.json`**

Update the timestamp/source-revision field(s) that `scripts/check-ai-context.mjs`
tracks for database/migration freshness (mirror how prior migration entries were
recorded — set the latest-migration marker to
`202607241200_per_person_task_visibility.sql`). If `ai:check` reports a specific
stale marker, set exactly that field.

- [ ] **Step 4: Run the full repo check**

Run: `npm run check`
Expected: PASS — `npm test` (all `tests/*.mjs`) green, `ai:check` reports no stale
migration markers / missing files, `build` completes. Exit code 0. If `ai:check`
fails on a specific `.ai` field, fix that field and re-run until green.

- [ ] **Step 5: Commit**

```bash
git add .ai/decisions.md .ai/current-state.md .ai/database/overview.md .ai/manifest.json
git commit -m "docs(ai): record per-person task visibility; refresh tasks RLS + manifest"
```

---

## User-run acceptance (after merge, on the live project rqundirizvojpzhljtdn)

Run by the user via their Supabase/deploy workflow — none can run in CI (they need
real accounts and the live DB).

- [ ] Apply `supabase/migrations/202607241200_per_person_task_visibility.sql`.
- [ ] Run `scripts/verify-per-person-task-visibility.sql` in the SQL editor — every `ok` is `true`.
- [ ] Create the fixture: a crew account C (`tasks.view` only) and a lead account L
      (`tasks.manage`) in one workspace, with the three tasks described in Task 3's header.
- [ ] Run `scripts/task-visibility-test.mjs` with the documented env — 4/4 PASS.
- [ ] Re-run `scripts/tenant-leak-test.mjs` — still all PASS (isolation intact).
- [ ] Refresh the `.ai/database/*` map from live metadata and verify the production URL.
- [ ] Give at least one non-owner the "manage tasks" role so there is a real "lead"
      (otherwise only owners see full lists and everyone else sees only their own).

## Self-Review notes

- **Spec coverage:** crew see own (T1 read) ✓; crew edit own (T1 update) ✓; lead/
  owner see+manage all (T1 `tasks.manage` branch) ✓; creator always sees own
  (T1 `creator_id`) ✓; insert/delete unchanged (T1 leaves them; T2 check 4) ✓;
  outer gates preserved (T1 keeps `is_workspace_member`/`has_workspace_permission`;
  T2 check 3) ✓; brain updates (T4) ✓; structural + behavioral + regression +
  leak tests (T2, T3, T4, acceptance) ✓.
- **No placeholders:** all SQL/JS complete; the only prose steps (T4 Steps 2-3)
  give exact replacement text and the exact marker to set.
- **Type consistency:** policy names `tasks workspace read/update/insert/delete`,
  `current_member_id()`, `has_workspace_permission(workspace_id, '...')` used
  identically across migration, verifier, and probe.
