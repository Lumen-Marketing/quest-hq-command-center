# Phase 4: Swap-In + Email Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Command Center's Tasks module opens the real task app (job-scoped, embedded), the placeholder is gone, and task notification emails work without leaking across tenants.

**Architecture:** CC's `tasks` route renders an `<iframe>` pointing at `taskmanagement/app.html?embed=1&project_id=…&return_url=…`. The task app already ships `.embedded-in-job-center` CSS that hides its own topbar in this mode (vendored in Phase 1), and CC already uses iframes for file previews — no new pattern. The email function is ported to CC's Supabase with tenant scoping added.

**Tech Stack:** vanilla JS in `src/main.js`; Deno/TypeScript Supabase Edge Function.

**Parent plan:** `2026-07-22-task-app-absorption.md` (Phase 4 of 5). Prior: Phase 3 `2026-07-22-phase3-tenant-hardening.md`.

## Research findings (verified inline 2026-07-22)

### 🔴 notify-email leaks across tenants (upstream code)

`TaskManagementQuest-upstream/supabase/functions/notify-email/index.ts`:

| Line | Behavior | Problem |
| --- | --- | --- |
| 117-123 | Caller authorized by `profiles.approved` + **global** `role` in `SEND_ROLES` | Not company-scoped — a manager of tenant A passes the gate for any send |
| 196-212 | Recipient allowlist = `adminProbe.from("team_members").select("email")` using the **service-role client** | Bypasses RLS entirely → an admin of Acme can email **Bravo's staff**. This is the single worst finding of Phase 4. |

Port must add: caller's active companies from `company_memberships`, and a recipient filter restricting to `team_members` whose `company_ids` overlap those companies. Locked decision 8's "review every template for tenant leaks" is satisfied by this scoping plus Task 5's checklist.

### Edge function inventory + secrets

Secrets referenced across all functions: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `ALLOWED_ORIGINS`, `GROQ_API_KEY`, `CHECKINS_SECRET`, `REMINDERS_SECRET`, `DEFAULT_NEW_USER_PASSWORD` (+ auto-provided `SUPABASE_*`).

| Function | Disposition | Why |
| --- | --- | --- |
| `notify-email` | **PORT** (Task 4) with tenant scoping | Locked decision 8 |
| `create-user`, `delete-user` | **RETIRED** (done in Phase 3) | CC owns membership |
| `report-problem` | **PORT** — needs `bug_reports` (created by the Phase 2 migration) + Resend | Small, same Resend secret; keeps the in-app bug reporter alive |
| `ai-assistant` | **DEFER** | Needs `GROQ_API_KEY`; a separate product decision, not launch-blocking |
| `checkins` | **DEFER** | Scheduled + Groq + Resend; the settings UI ships dark (Phase 2), so nothing calls it |
| `due-reminders` | **DEFER** | Scheduled; needs `REMINDERS_SECRET` + cron. In-app `ReminderEngine` still fires client-side |

Deferred functions are not deployed; their absence is invisible to users (nothing invokes them from the UI). Record them in the parent plan's Phase 5 notes so they're not silently forgotten.

### Swap-in points (verified on `feat/task-app-absorption`)

| What | Location |
| --- | --- |
| Sidebar module entry | `src/main.js:958` — `{ id: 'tasks', group: 'Work', label: 'My tasks', … permission: 'tasks.view' }` |
| Route → placeholder | `src/main.js:4176` — `if (route.section === 'tasks') return renderTasksPage(route, companyId);` |
| Placeholder renderer | `src/main.js:9291` — `renderTasksPage` (+ helpers `renderTaskToolbar`, `renderTaskBoard`, `renderTaskTable`) |
| Task detail/new-task overlays | `src/main.js:17552`, `src/main.js:20917` — event handlers keyed on `route.section === 'tasks'` |
| Legacy redirect | `src/main.js:25687` — `/task-management.html` → native tasks page |
| iframe precedent | `src/main.js:9688-9691`, `11782-11783` (file previews) |

## Global Constraints

- **The user works in this repo on other branches.** Before ANY test/build/commit, run `git branch --show-current`; if it isn't `feat/task-app-absorption`, work in a git worktree (`git worktree add`, junction `node_modules` via `cmd //c mklink /J`) instead of switching their checkout. A Phase 3 test run was silently invalidated this way.
- All SQL and all Supabase Dashboard actions are **deferred** — the user batches every migration and function deployment in one session later. Write function code to disk; never deploy.
- Never write to old project `qqvmcsvdxhgjooirznrj`; never push upstream.
- Keep `taskmanagement/` build-free; iframe integration must not require the task app to change.
- Stop `npm run dev` before `npm run build`.
- Commit per task on `feat/task-app-absorption`.

---

### Task 1: Render the real task app in the Tasks route

**Files:**
- Modify: `src/main.js` (route at ~4176; new renderer replacing `renderTasksPage`'s body)

**Interfaces:**
- Produces: `renderTasksPage(route, companyId)` returns a workspace header + an `<iframe class="taskapp-frame">` whose `src` is `taskmanagement/app.html?embed=1` plus `project_id` when a job is scoped and `return_url` back to the current CC page. Keeps the existing function name so route/handler call sites are untouched.

- [ ] **Step 1: Replace the renderer body**

```javascript
function renderTasksPage(route, companyId) {
  const job = route.jobId ? jobById(route.jobId) : null;
  // The real task module (vendored at /taskmanagement/) replaces the former
  // native placeholder. It runs embedded: ?embed=1 hides its own topbar via
  // .embedded-in-job-center so CC's chrome is the only chrome. Session is shared
  // automatically (same origin + same Supabase project).
  const params = new URLSearchParams({ embed: '1' });
  if (job) params.set('project_id', job.id);
  params.set('return_url', window.location.href);
  const src = `${window.location.origin}/taskmanagement/app.html?${params.toString()}`;
  return `
    ${workspaceHeader(job ? `${job.name} tasks` : 'Tasks', 'Task execution, timers and reminders.', `
      <a class="btn" href="${appHref(companyPath('jobs', job ? { tab: 'profile', job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
    `)}
    <section class="task-layout task-layout-flat">
      <iframe class="taskapp-frame" src="${h(src)}" title="Task management"></iframe>
    </section>
  `;
}
```

- [ ] **Step 2: Add the frame styling** to `src/styles.css` (match the file-preview frame conventions already there):

```css
.taskapp-frame {
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 520px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}
```

Check the actual custom-property names in `src/styles.css` before writing — copy whatever `.file-preview-frame` uses rather than inventing tokens.

- [ ] **Step 3: Remove the now-dead placeholder helpers** — `renderTaskToolbar`, `renderTaskBoard`, `renderTaskTable` and any helper used ONLY by them. Verify each with `grep -n "renderTaskBoard\|renderTaskTable\|renderTaskToolbar" src/main.js` and delete only those with no remaining callers. If a helper is shared (e.g. by the dashboard's task widgets), leave it.

- [ ] **Step 4: Verify + commit**

```bash
grep -n "renderTaskBoard\|renderTaskTable\|renderTaskToolbar" src/main.js   # expect no hits
node --check src/main.js
git add src/main.js src/styles.css
git commit -m "feat: tasks route renders the embedded task module, replacing the placeholder"
```

### Task 2: Point Job Center and the legacy redirect at the module

**Files:**
- Modify: `src/main.js` (job-card links already route to `companyPath('tasks', { job_id })` — verify; legacy redirect at ~25687)

**Interfaces:**
- Consumes: Task 1's renderer. Produces: every "Open tasks" affordance lands on the tasks route with `job_id`, which Task 1 turns into `project_id` for the iframe. No new URL shapes.

- [ ] **Step 1: Audit the affordances** — `grep -n "companyPath('tasks'" src/main.js`. Each hit should already pass `job_id` where a job is in scope (Phase 1 research confirmed job cards at 9084, 9091, 9243, 9297 do). Fix any that don't.

- [ ] **Step 2: Confirm the legacy redirect still resolves** — `/task-management.html?project_id=X` maps to `companyPath('tasks', { job_id: X })` at ~25687. It needs no change (the route now renders the real app), but re-read it to be sure the param name mapping still holds.

- [ ] **Step 3: Verify the deep-link handlers** — `src/main.js:17552` and `:20917` fire on `route.section === 'tasks'` for `new`/`edit`/`task_id` params. With the placeholder gone these would open CC modals over an iframe that doesn't know about them. Decide per handler: remove it, or convert it to pass the parameter through to the iframe URL. **Recommendation:** remove the CC-side modals — the task app owns task creation/detail now; leaving two "new task" UIs is exactly the duplicate-UI problem this project set out to kill.

- [ ] **Step 4: Verify + commit**

```bash
node --check src/main.js
git add src/main.js
git commit -m "feat: route job task links and legacy redirect into the embedded module"
```

### Task 3: Gate the module on the tasks plugin

**Files:**
- Modify: `src/main.js:958` (module registry entry)

**Interfaces:**
- Consumes: Phase 3's `'tasks'` plugin registration + backfill. Produces: the sidebar entry appears only when the workspace has the `tasks` plugin installed, matching how other modules behave.

- [ ] **Step 1: Read how a peer module declares plugin gating** — inspect the registry entries near line 958 for ones carrying a plugin id (e.g. `client_portal`, `price_book`) and copy that field exactly. If the registry has no plugin field and gating happens elsewhere (`allowedModuleIds`/`companyPluginRows` around lines 4041-4068), wire it there instead.

- [ ] **Step 2: Verify behavior for a workspace without the plugin** — reason it through in the code path and note the expected result in the commit message. (Runtime proof waits for the migrations; Phase 5's leak test covers it.)

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: gate the tasks module on the tasks workspace plugin"
```

### Task 4: Port notify-email with tenant scoping

**Files:**
- Create: `supabase/functions/notify-email/index.ts` (in the CC repo — new directory)

**Interfaces:**
- Consumes: upstream `C:\Users\tagal\TaskManagementQuest-upstream\supabase\functions\notify-email\index.ts` as the base.
- Produces: the same function with two authorization changes, ready for the user to deploy in their batched session.

- [ ] **Step 1: Copy the upstream function verbatim** into the CC repo path, then apply only the changes below (keeping its size caps, sanitizer, CORS handling, and error shapes untouched).

- [ ] **Step 2: Scope the caller check to a company** — after the existing `profiles` lookup, load the caller's active companies:

```typescript
    // Tenant scoping (Phase 4): the caller may only send within companies they
    // actively belong to. Upstream gated on GLOBAL role only, so a manager of one
    // tenant passed the gate for every tenant.
    const { data: callerCompanies } = await adminProbe
      .from("company_memberships")
      .select("company_id, role")
      .eq("profile_id", callerUser.user.id)
      .eq("status", "active");
    const callerCompanyIds = (callerCompanies ?? []).map((r: { company_id: string }) => r.company_id);
    if (callerCompanyIds.length === 0) {
      return json(req, { error: "Not authorized." }, 403);
    }
```

- [ ] **Step 3: Scope the recipient allowlist** — replace the unfiltered `team_members` read (upstream lines ~196-200) with one restricted to the caller's companies:

```typescript
    const { data: members, error: memberErr } = await adminProbe
      .from("team_members")
      .select("email, company_ids")
      .overlaps("company_ids", callerCompanyIds);
```

The downstream `allowed` Set construction stays as-is. This is the fix for the cross-tenant email leak.

- [ ] **Step 4: Add a deploy note** — create `supabase/functions/notify-email/README.md` listing the secrets the user must set when deploying (`RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `ALLOWED_ORIGINS`) and stating that `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` are provided automatically.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/notify-email
git commit -m "feat: port notify-email with tenant-scoped caller and recipient checks"
```

### Task 5: Port report-problem + email tenant-review checklist

**Files:**
- Create: `supabase/functions/report-problem/index.ts`, `supabase/functions/report-problem/README.md`
- Create: `docs/superpowers/plans/2026-07-22-phase4-email-tenant-review.md`

**Interfaces:**
- Consumes: upstream `report-problem/index.ts`; the `bug_reports` table from the Phase 2 migration (platform-global by locked decision — the report body may name a company, which is intended for the quest-admin inbox).
- Produces: the ported function + a written record satisfying locked decision 8's blocking review.

- [ ] **Step 1: Copy report-problem** and check its writes match the Phase 2 `bug_reports` columns exactly (`grep -n -A20 "create table if not exists public.bug_reports" supabase/migrations/202607221400_*.sql`). Adjust column names in the function if they drifted; do NOT change the migration.

- [ ] **Step 2: Write the tenant-review doc** — one row per outbound email type (notify-email assignment/mention/etc., report-problem receipt), recording: who can trigger it, who can receive it, what tenant data the body contains, which link it points at (`APP_URL`), and a PASS/FIX verdict. Any FIX is fixed before the phase closes.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/report-problem docs/superpowers/plans/2026-07-22-phase4-email-tenant-review.md
git commit -m "feat: port report-problem; record email tenant-leak review"
```

### Task 6: Verify + phase close

- [ ] **Step 1: Branch check first** — `git branch --show-current`. If not `feat/task-app-absorption`, use a worktree (see Global Constraints).

- [ ] **Step 2: Static checks** — `node --check src/main.js`; confirm no stray references to deleted helpers.

- [ ] **Step 3: Visual check** — dev server, screenshot `/company/<id>/tasks`. Expected before migrations run: CC chrome with the iframe present; the task app inside will show its data error (tables missing) — that is the expected pre-migration state, not a failure. Confirm CC's own shell renders correctly around it.

- [ ] **Step 4: Tests + build** — `npm test` (expect 214+ pass) and `npm run build`.

- [ ] **Step 5: Commit the phase marker.**

---

## Deferred to Phase 5

- Two-tenant leak test (the evidence for Phases 3-4's claims), including an email-specific case: trigger every email type as Acme and confirm nothing reaches Bravo.
- Keepsake export of the old app's tasks + time entries, then the task.questroofing.com redirect.
- Delete the unreferenced `ApprovalView.js` / `PermissionsAdminView.js`.
- Decide `ai-assistant` / `checkins` / `due-reminders` (deferred here — undeployed and uninvoked).
- Product branding decision ("Quest HQ" visible to outside tenants).
