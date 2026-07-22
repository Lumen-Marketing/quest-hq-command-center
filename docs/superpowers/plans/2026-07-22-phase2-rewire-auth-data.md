# Phase 2: Rewire Auth + Data — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The vendored task app runs live against Command Center's Supabase with the shared CC login session, backed by a complete tenant-safe task-runtime schema.

**Architecture:** One additive migration (drafted and reviewed in the Phase 2 schema-delta report) brings CC's database up to the live app's needs; two small frontend patches close a crash bug and a single-tenant leftover; then `App.authEnabled` flips to true and the demo mode retires. Session sharing is automatic: both apps use supabase-js defaults on the same origin + project, so the login token in localStorage is shared with zero code.

**Tech Stack:** Postgres/Supabase migration SQL (CC conventions), vanilla JS edits in `taskmanagement/`, no new dependencies.

**Parent plan:** `2026-07-22-task-app-absorption.md` (Phase 2 of 5). **Schema source:** `2026-07-22-phase2-schema-delta.md` (the report's §3 draft migration is the reviewed SQL this plan installs).

## Decisions locked for this phase (2026-07-22, with user)

- Drop CC's three legacy `tasks` CHECK constraints (`tasks_type_check`, `tasks_label_check`, `tasks_status_check`) — per-company customizable taxonomy wins.
- `checkin_settings` becomes per-company now (PK `company_id`), with the small datastore patch.
- Strip/guard the dead SOP plumbing (missing `App.taxonomy.activeSop`/`App.utils.mergeSopSteps` — crash risk on the New Task page).
- `bug_reports` stays platform-global (quest-admin inbox). Per-workspace taxonomy seeding for FUTURE workspaces is Phase 3 scope (rides with the `create_workspace`/plugin backfill work).

## Global Constraints

- Old Supabase project `qqvmcsvdxhgjooirznrj` is READ-ONLY reference; never write to it. Never push to `ShanIngrid1207/TaskManagementQuest`.
- All DB changes target CC's project `lpzotcznihwyyudxycmd` **only**, via one migration file committed to `supabase/migrations/`. The connected MCP account cannot reach this project — the **user applies the migration** through the Supabase Dashboard SQL editor (they run the main commands; house rule).
- RLS on every new table, built only from `app_private.is_company_member/is_company_admin/is_quest_admin` + `auth.uid()`. No upstream approval/role-ladder policies (retired by decision 7).
- Browser ships only publishable keys (config.js guard stays).
- Stop `npm run dev` before `npm run build` (house rule). Frontend verified by headless Chrome (screenshot or `--dump-dom`; NOTE: `--virtual-time-budget` hangs on this app's embed mode — use `--dump-dom` there).
- Branch: continue on `feat/task-app-absorption`; commit per task.

---

### Task 1: Install the Phase 2 migration file

**Files:**
- Create: `supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql`
- Source: `docs/superpowers/plans/2026-07-22-phase2-schema-delta.md` §3 (lines 94–611)

**Interfaces:**
- Produces: the committed migration adding — 6 `tasks` columns (`focus_seq`, `completed_at`, `assignee_ids`, `wo_number`, `reminder_offset`, `stuck`), `profiles.position`, `team_members.position`/`role`, the three CHECK drops, and 11 new tables (`projects`, `task_types`, `task_type_statuses`, `task_labels`, `task_comments`, `comment_reactions`, `checkin_settings` (per-company), `checkin_log`, `bug_reports`, `reminder_log`, `wo_counters`) with RLS, grants, triggers, the guarded `assign_wo_number` RPC, and the existing-companies taxonomy seed. `schedules` intentionally omitted (dead upstream table).

- [ ] **Step 1: Create the migration file** — copy §3's single SQL code block from the schema-delta report **verbatim** into the new file. No edits: the draft was already written to CC conventions and reflects every locked decision (CHECK drops included behind their marked comment; per-company `checkin_settings`; no SOP table).

- [ ] **Step 2: Sanity-scan the result** (no DB yet):

```bash
cd /c/Users/tagal/quest-hq-command-center
grep -c "create table if not exists" supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql   # expect 11
grep -c "enable row level security" supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql    # expect 11
grep -n "qqvmcsvdxhgjooirznrj\|task_label_sops\|schedules" supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql  # expect NO hits
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql
git commit -m "feat: phase-2 task-runtime schema delta (11 tables, tasks columns, taxonomy unlock)"
```

### Task 2: Guard the dead SOP plumbing

**Files:**
- Modify: `taskmanagement/js/views/NewTaskPageView.js` (the `_applySop` method, ~line 582)

**Interfaces:**
- Consumes: nothing new. Produces: `_applySop()` that no-ops when the SOP helpers don't exist, so label/company changes on the New Task page can't throw. (`SupabaseDataStore`'s `task_label_sops` reads already tolerate the missing table via `_optionalSelect` — no datastore change needed.)

- [ ] **Step 1: Add the guard** — in `_applySop()`, immediately after the method opens:

```javascript
  _applySop() {
    // SOP feature never shipped (no task_label_sops table; App.taxonomy.activeSop /
    // App.utils.mergeSopSteps were never implemented in this release). Guarded to a
    // no-op so label/company changes can't throw. Revisit if the SOP feature lands.
    if (!App.taxonomy || typeof App.taxonomy.activeSop !== 'function'
      || !App.utils || typeof App.utils.mergeSopSteps !== 'function') return;
    const label = this.S.label || null;
```

(The `const label` line already exists — the guard slots in above it; keep the rest of the method untouched.)

- [ ] **Step 2: Verify no other unguarded callers**

```bash
grep -rn "activeSop\|mergeSopSteps" taskmanagement/js --include=*.js
```

Expected: hits only inside `_applySop` (now guarded) and comments/`_optionalSelect` plumbing in `SupabaseDataStore.js` (safe by design).

- [ ] **Step 3: Commit**

```bash
git add taskmanagement/js/views/NewTaskPageView.js
git commit -m "fix: guard unshipped SOP helpers so New Task label picks can't throw"
```

### Task 3: Per-company check-in settings

**Files:**
- Modify: `taskmanagement/js/services/SupabaseDataStore.js` (`getCheckinSettings` / `saveCheckinSettings`, ~lines 490–512)

**Interfaces:**
- Consumes: migration Task 1 (new `checkin_settings` with PK `company_id`). Produces: both methods scoped to the current profile's first company; `save` upserts (the per-company row may not exist yet). `CheckinSettingsView` calls both with no arguments — signatures stay argument-free so the view needs no changes. Feature remains dark (boss-only view); multi-company selection UI is a Phase 3 item.

- [ ] **Step 1: Replace the two methods** (and their stale comment):

```javascript
  /* Proactive check-ins config — per-company row (PK company_id), scoped to the
     current profile's first company. The scheduled `checkins` Edge Function reads
     the same rows via the service role. Company-admin RLS gates these calls.
     Multi-company selection in the (currently dark) settings UI: Phase 3. */
  _checkinCompanyId() {
    const ids = (App.currentProfile && App.currentProfile.company_ids) || [];
    return ids[0] || null;
  }

  async getCheckinSettings() {
    const companyId = this._checkinCompanyId();
    if (!companyId) throw new Error('No company for check-in settings');
    const { data, error } = await this.supabase
      .from('checkin_settings').select('*').eq('company_id', companyId).maybeSingle();
    if (error) throw error;
    return data || { company_id: companyId, morning_enabled: false, eod_enabled: false, stalled_enabled: false, stalled_days: 3 };
  }

  async saveCheckinSettings(patch) {
    const companyId = this._checkinCompanyId();
    if (!companyId) throw new Error('No company for check-in settings');
    const row = {
      company_id: companyId,
      morning_enabled: !!patch.morning_enabled,
      eod_enabled: !!patch.eod_enabled,
      stalled_enabled: !!patch.stalled_enabled,
      stalled_days: Math.max(1, Math.min(90, parseInt(patch.stalled_days, 10) || 3)),
      updated_by: this.currentUser || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from('checkin_settings').upsert(row, { onConflict: 'company_id' }).select().single();
    if (error) throw error;
    return data;
  }
```

- [ ] **Step 2: Verify nothing else reads the old singleton shape**

```bash
grep -rn "eq('id', 1)\|checkin_settings" taskmanagement/js --include=*.js
```

Expected: only the two rewritten methods (plus `CheckinSettingsView.js` calling them argument-free — unchanged).

- [ ] **Step 3: Commit**

```bash
git add taskmanagement/js/services/SupabaseDataStore.js
git commit -m "feat: per-company check-in settings (tenant-correct, upsert on save)"
```

### Task 4: Flip auth on + harden env.json loading

**Files:**
- Modify: `taskmanagement/js/config.js` (line 2 + the fetch block inside `loadRuntimeConfig`)

**Interfaces:**
- Produces: `App.authEnabled = true` (auth-guard's demo block goes dormant; real session path active). Config survives CC's Vercel rewrite trap: a missing `/taskmanagement/env.json` returns the SPA's **HTML with HTTP 200**, so `res.json()` throws — the loader must fall back to `App.defaultSupabaseConfig` instead of dying.

- [ ] **Step 1: Flip the flag** — line 2: `App.authEnabled = false;` → `App.authEnabled = true;`

- [ ] **Step 2: Harden the env fetch** — replace the two lines that read the response:

```javascript
    const res = await fetch(envUrl, { cache: 'no-store', credentials: 'same-origin' });
    const env = res.ok ? await res.json() : App.defaultSupabaseConfig;
```

with:

```javascript
    // CC's Vercel SPA rewrite serves index.html (HTTP 200, text/html) for ANY
    // missing path — including this env.json. So "res.ok" is not proof of JSON:
    // parse defensively and fall back to the baked-in publishable config.
    const res = await fetch(envUrl, { cache: 'no-store', credentials: 'same-origin' });
    let env = App.defaultSupabaseConfig;
    if (res.ok) {
      try { env = await res.json(); }
      catch (parseError) { env = App.defaultSupabaseConfig; }
    }
```

- [ ] **Step 3: Static check + commit**

```bash
node --check taskmanagement/js/config.js
git add taskmanagement/js/config.js
git commit -m "feat: enable real auth for hosted task app; env.json parse falls back to defaults"
```

### Task 5: USER APPLIES MIGRATION — hard stop

**Files:** none (database action on `lpzotcznihwyyudxycmd`).

- [ ] **Step 1: Hand the user these instructions, then STOP and wait for their confirmation:**

> 1. Open supabase.com → the Quest HQ project (`lpzotcznihwyyudxycmd`) → SQL Editor
> 2. Paste the full contents of `supabase/migrations/202607221400_taskmanagement_phase2_runtime_delta.sql`
> 3. Run. Expected: "Success. No rows returned"
> 4. Then open Advisors → Security and report anything new it flags.

Do not proceed to Task 6 until the user confirms the run succeeded. If the run errors, copy the exact error back into the session and debug the SQL — never ask the user to improvise fixes in the dashboard.

### Task 6: Verify live wiring end-to-end

**Files:**
- Test: dev-server runtime checks + `npm test` + `npm run build`

**Interfaces:**
- Consumes: everything above, migration applied.

- [ ] **Step 1: Unauthenticated redirect check** (no login yet — expect bounce to CC's login):

```bash
cd /c/Users/tagal/quest-hq-command-center
npm run dev   # background; note the port (5173/5174)
SCRATCH="$HOME/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$SCRATCH/chrome-p2" --dump-dom --timeout=20000 \
  "http://127.0.0.1:<PORT>/taskmanagement/app.html" > "$SCRATCH/p2-unauth.html" 2>/dev/null
grep -c "login" "$SCRATCH/p2-unauth.html"
```

Expected: the DOM is CC's login page (redirect fired), NOT the task UI and NOT "Quest Basic Mode".

- [ ] **Step 2: Authenticated smoke test (USER, in their own browser):** log into Command Center dev as their real account, then open `http://127.0.0.1:<PORT>/taskmanagement/app.html` — expected: task app loads signed in (no second login), their name/avatar in the topbar, task list loads (empty is fine — fresh start), creating a task succeeds, and that task also appears in CC's own tasks page (same `tasks` table — the cross-check that both apps truly share one database).

- [ ] **Step 3: Regression + build** (stop dev server first):

```bash
npm test        # expect 214+ pass, 0 fail
npm run build   # expect bundle budget pass, dist/taskmanagement present
```

- [ ] **Step 4: Commit any verification fixes, then the phase marker**

```bash
git add -A
git commit -m "feat: phase 2 complete — task app live on CC Supabase with shared login"
```

---

## Self-review notes

- Spec coverage: migration (T1) ← schema report §3; SOP decision (T2); check-in decision (T3); auth flip + Vercel trap (T4); user-applied DB change + hard stop (T5); shared-session proof + regression (T6). Bug_reports/seeding decisions need no task (they're properties of the §3 draft / Phase 3 scope).
- The §3 SQL is referenced, not duplicated — it is a completed, reviewable artifact in the same directory, copied verbatim by T1 Step 1.
- Deferred to Phase 3 (tracked in parent plan): `'tasks'` plugin allowlist + backfill, per-workspace taxonomy seeding, retiring approval screens/create-user/delete-user, team_members tenancy review, notify-email port.
