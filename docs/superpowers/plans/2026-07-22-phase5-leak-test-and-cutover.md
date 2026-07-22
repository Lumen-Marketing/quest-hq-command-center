# Phase 5: Leak Test + Cutover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the task module cannot leak between tenants, preserve the old app's data as a keepsake, and retire task.questroofing.com.

**Architecture:** Phases 3–4 made *claims* about tenant isolation. This phase produces *evidence*: two dummy businesses created through the public signup flow, then a scripted attempt to break in — through the UI, through forged API calls, and through email. Any single failure blocks the task module's launch (locked decision 10).

**Tech Stack:** SQL probes run as each tenant; a Node script hitting PostgREST with each tenant's session; headless Chrome for the UI passes.

**Parent plan:** `2026-07-22-task-app-absorption.md` (Phase 5 of 5). Prior: Phase 4 `2026-07-22-phase4-swap-in-and-email.md`.

## Split: what can run before vs after the batched database session

| Runs NOW (no database needed) | Runs AFTER the user's batched run |
| --- | --- |
| Task 1 — keepsake export from the old project | Task 4 — create the two dummy tenants |
| Task 2 — delete unreferenced retired view files | Task 5 — execute the leak test |
| Task 3 — build the leak-test harness + redirect page | Task 6 — cutover: redirect the old URL, close the phase |

## Global Constraints

- The user works in this repo on other branches: work in the worktree at `.worktrees/task-app` on `feat/task-app-absorption`; check `git branch --show-current` before trusting any test result.
- Old Supabase project `qqvmcsvdxhgjooirznrj` is **READ-ONLY**. The keepsake export uses read-only queries. Never write to it, never migrate it.
- The user runs all migrations, function deploys, and any destructive/production action themselves.
- **A leak-test failure blocks the task module's launch.** Command Center may still launch without the module; do not weaken a test to make it pass, and never mark a skipped check as passed.

---

### Task 1: Keepsake export from the old app (do now)

**Files:**
- Create: `docs/keepsake/2026-07-22-task-app-export/README.md`
- Create: `docs/keepsake/2026-07-22-task-app-export/tasks.csv`, `time_entries.csv`, `team_members.csv`, `projects.csv`

**Interfaces:**
- Consumes: read-only MCP access to project `qqvmcsvdxhgjooirznrj` (live counts observed 2026-07-22: tasks 77, time_entries 40, team_members 21, projects 11, task_comments 16, notifications 499).
- Produces: committed CSVs so nothing of substance is lost when the old app is retired (locked decision 6 — fresh start, keepsake before shutdown).

- [ ] **Step 1: Export the four tables that hold irreplaceable history** — tasks, time_entries, team_members, projects. Use read-only selects; write each result as CSV under the keepsake folder.

- [ ] **Step 2: Write the README** — row counts, export date, source project ref, and an explicit note that this is an archive for reference only: it is NOT imported anywhere (fresh start), and the CSVs contain staff names/emails so the folder should not be published.

- [ ] **Step 3: Commit** — `git add docs/keepsake && git commit -m "chore: keepsake export of the standalone task app's data"`.

### Task 2: Delete the retired view files (do now)

**Files:**
- Delete: `taskmanagement/js/views/ApprovalView.js`, `taskmanagement/js/views/PermissionsAdminView.js`

**Interfaces:**
- Consumes: Phase 3 already removed their construction and every entry point; they are dead files on disk.

- [ ] **Step 1: Confirm nothing references them** — `grep -rn "ApprovalView\|PermissionsAdminView" taskmanagement/ src/ --include=*.js --include=*.html`. Expect only comments. **If `app.html` still has `<script>` tags for them, remove those tags too** (a 404'd script is harmless but sloppy).

- [ ] **Step 2: Delete, verify, commit** — remove both files, run `npm test` and `npm run build`, then commit.

### Task 3: Leak-test harness + old-URL redirect (build now, run later)

**Files:**
- Create: `scripts/tenant-leak-test.mjs`
- Create: `docs/superpowers/plans/2026-07-22-phase5-leak-test-checklist.md`
- Create: `docs/keepsake/old-app-redirect/index.html`

**Interfaces:**
- Produces: (a) a script that, given two tenants' credentials, attempts every cross-tenant read/write and prints PASS/FAIL per probe; (b) the human checklist for the UI/email passes the script can't cover; (c) a static redirect page to deploy at task.questroofing.com.

- [ ] **Step 1: Write `scripts/tenant-leak-test.mjs`** — takes two sets of credentials from env vars (`ACME_EMAIL`/`ACME_PASSWORD`/`BRAVO_EMAIL`/`BRAVO_PASSWORD`, plus `SUPABASE_URL`/`SUPABASE_ANON_KEY`), signs both in with supabase-js, then runs one probe per row of the matrix below. Each probe asserts an empty result or an error; anything returned is a FAIL printed with the leaking rows. Exit non-zero if any probe fails.

**Probe matrix (as Acme, targeting Bravo):**

| # | Probe | Expected |
| --- | --- | --- |
| 1 | `select * from companies` | Only Acme's companies |
| 2 | `select * from team_members` | Only Acme's roster |
| 3 | `select * from tasks` | Only Acme's tasks |
| 4 | `select * from time_entries` | Only Acme's own/admin rows |
| 5 | `select * from active_timers` | Only Acme's |
| 6 | `select * from notifications` | Only Acme's own |
| 7 | `select * from task_comments` / `comment_reactions` | Only Acme's |
| 8 | `select * from task_types / task_type_statuses / task_labels` | Only Acme's |
| 9 | `select * from projects` | Only Acme's |
| 10 | `select * from checkin_settings` | Only Acme's row |
| 11 | `insert into tasks` with `company_id = <bravo>` | Rejected by RLS |
| 12 | `update tasks set title=… where id = <a Bravo task id>` | 0 rows affected |
| 13 | `delete from tasks where id = <a Bravo task id>` | 0 rows affected |
| 14 | `insert into team_members` with Bravo's company id | Rejected |
| 15 | `select * from bug_reports` | Rejected / empty (platform-global, quest-admin only) |
| 16 | `functions.invoke('notify-email')` naming a Bravo member's email | `422 No recipients are on the team allowlist` |

Bravo's ids/emails are gathered in Task 4 and passed in via env vars so the script contains no hardcoded tenant data.

- [ ] **Step 2: Write the checklist doc** — the human passes the script can't do: UI-level attempts (typing Bravo's job id / task id into the address bar while signed in as Acme; the workspace switcher showing only Acme), worker-scope checks (a worker invited to Acme sees only Acme; the same email later invited to Bravo sees each workspace separately), removal (removing a worker from Acme kills task access but leaves their account), the job bridge (Acme job → tasks shows only that job's tasks; a task created there attaches to that job and workspace), and the email cases from the Phase 4 review doc. Each row gets a PASS/FAIL box and a place to paste evidence.

- [ ] **Step 3: Write the redirect page** — a small self-contained `index.html` that immediately sends visitors to Command Center's tasks URL, with a visible fallback link and a one-line explanation ("The task app now lives inside Quest HQ Command Center"). Leave the destination URL as an obvious placeholder token if Command Center's production domain is still undecided (parent plan's open item).

- [ ] **Step 4: Commit.**

### Task 4: Create the two dummy tenants (after the batched run)

- [ ] **Step 1:** The user (or I, if they hand over credentials) signs up **through the public flow** — not by hand in the dashboard — as "Acme Cabinets" and "Bravo Plumbing", each with its own owner email. Using the real signup path is itself the first test of the new-tenant experience.
- [ ] **Step 2:** In each workspace, create at least: one job, two tasks (one assigned to the owner), one time entry, one task comment. Without data in both, a leak test can pass vacuously.
- [ ] **Step 3:** Record each tenant's company id, a task id, a job id, and a member email into the env file the script reads. Never commit that file — add it to `.git/info/exclude`.

### Task 5: Execute the leak test (after Task 4)

- [ ] **Step 1:** Run `node scripts/tenant-leak-test.mjs`. Paste the full output into the checklist doc — including passes, so the record shows what was actually exercised.
- [ ] **Step 2:** Work the human checklist from Task 3 Step 2, filling in evidence.
- [ ] **Step 3:** **If anything fails:** stop, fix the underlying policy or code, re-run the ENTIRE matrix (not just the failing probe), and record both runs. Do not proceed to Task 6 with a known failure.
- [ ] **Step 4:** Commit the completed checklist as the launch record.

### Task 6: Cutover (after a clean leak test)

- [ ] **Step 1: Quest's own workspace** — confirm Quest exists as a normal tenant (locked decision 4) and its team can sign in and use tasks.
- [ ] **Step 2: Deploy the redirect** — the user points task.questroofing.com at the redirect page from Task 3. Keep it for months; bookmarks die slowly (locked decision 9).
- [ ] **Step 3: Old project stays read-only** — do not delete `qqvmcsvdxhgjooirznrj`. The keepsake CSVs plus the live-but-idle project are the safety net. Revisit deleting it no sooner than a month after cutover.
- [ ] **Step 4: Close the project** — update the parent plan's phase table, and use `superpowers:finishing-a-development-branch` to decide how `feat/task-app-absorption` merges.

---

## Carried-forward open items (not blocking Phase 5)

- Command Center's production domain (needed before outside signups — also determines `APP_URL` for emails and the redirect target).
- Product branding: outside tenants see "Quest HQ" throughout the task module.
- `ai-assistant`, `checkins`, `due-reminders` — undeployed; the latter two send email and need tenant-review rows before any deploy.
- `team_members` junction-table refactor (array-overlap RLS covers launch).
