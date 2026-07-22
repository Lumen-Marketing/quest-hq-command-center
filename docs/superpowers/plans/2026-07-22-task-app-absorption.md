# Task App Absorption — Master Plan (Phase 1 detailed)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Absorb the live task.questroofing.com frontend into Quest HQ Command Center as its tenant-safe Tasks module, replacing the placeholder tasks page.

**Architecture:** The task app remains a self-contained static folder (`taskmanagement/`) vendored inside the Command Center repo, touching Command Center only at two thin seams: URL params (`project_id`, `embed`, `return_url`) and the shared Supabase project (`lpzotcznihwyyudxycmd`). Tenancy rides on Command Center's existing model: `companies` (text id) + `company_memberships` + `app_private.is_company_member()/is_company_admin()` RLS helpers + the `company_plugins` registry.

**Tech Stack:** Vanilla JS static app (no build step) inside a Vite-built SPA; Supabase (Postgres + RLS + Edge Functions); Vercel static hosting.

## Locked Decisions (from 2026-07-22 grilling session)

1. Absorb frontend into Command Center — no APIs/connectors/iframes between separate systems.
2. Multi-tenant SaaS launch: task module must be tenant-safe **before** outside businesses see it; Command Center may launch without tasks if the clock wins.
3. Harden inside Command Center (against its real workspace model), not in the old home.
4. Quest becomes tenant #1 — a normal workspace, no hardcoded special cases.
5. Tasks plugin ON for every workspace at launch (paid tier later if desired).
6. Fresh start — no data migration from old Supabase `qqvmcsvdxhgjooirznrj`. Export tasks + time entries to spreadsheet as keepsake before shutdown.
7. Command Center owns ALL membership (invites, approvals, roles). Task app's approval screens and `delete-user` edge function are **retired**, replaced by Command Center's remove-from-workspace.
8. `notify-email` edge function ports before launch; every template reviewed for cross-tenant leakage (blocking checkbox).
9. task.questroofing.com: stays up as safety net during build, then becomes a redirect; redirect kept for months.
10. Two-tenant leak test (see Phase 5) gates the task module's exposure to outside tenants. Any single failure blocks.

**Open item (not blocking this plan):** Command Center's own production domain.

## Global Constraints

- Old Supabase project `qqvmcsvdxhgjooirznrj` is READ-ONLY reference. Never run migrations against it. Never push to the upstream repo `ShanIngrid1207/TaskManagementQuest`.
- Live database work happens only against Quest HQ Supabase `lpzotcznihwyyudxycmd`.
- Browser code ships only the publishable/anon key — never `sb_secret_` / service_role (config.js already enforces this; keep the guard).
- The task app folder stays dependency-free and build-free; Command Center's build only copies it (`scripts/sync-spa-assets.mjs:26`).
- `taskmanagement/` and `src/main.js` never share code — integration is URL params + shared DB only.
- All work on a feature branch off the repo's mainline; commit at every task boundary.
- Frontend changes are verified with headless Chrome screenshots (house rule).
- Do not run `next build`-style production builds while the dev server is live (house rule); stop `npm run dev` before `npm run build`.

## Phase Roadmap

| Phase | Deliverable | Plan status |
| --- | --- | --- |
| **1. Frontend refresh** (this document) | Live app's current frontend vendored into `taskmanagement/`, integration layer re-applied, renders in dev, build passes | **Detailed below** |
| **2. Rewire auth + data** | `App.authEnabled = true`; task app uses Command Center's Supabase + shared login session; additive migration reconciling live app's schema deltas against existing tables | Own plan — written after Phase 1's delta report reveals the live schema/code diffs |
| **3. Tenant hardening** | `'tasks'` in plugin allowlist (SQL seed in Appendix A); company list driven by `company_memberships` not hardcoded ids; `team_members`/`time_entries`/`active_timers`/`notifications` RLS reviewed per-tenant; approval screens + delete-user paths removed from task app | Own plan |
| **4. Swap-in + email** | Sidebar `tasks` module (src/main.js:958) opens `taskmanagement/app.html?project_id=…&embed=1` instead of `renderTasksPage` (src/main.js:9291); placeholder deleted; `notify-email` ported with tenant-reviewed templates | Own plan |
| **5. Leak test + cutover** | Q10 checklist executed against 3 workspaces (Quest + 2 dummies via public signup); keepsake export; task.questroofing.com redirect | Own plan |

Phases 2–5 each get their own detailed plan **after the preceding phase lands**, because their exact code depends on artifacts the earlier phase produces (the upstream diff, the reconciled schema). Writing their step-level code now would be guessing.

---

## Phase 1 Tasks

### Task 1: Branch + clone the upstream repo + pin the deployed commit

**Files:**
- Create: `C:\Users\tagal\TaskManagementQuest-upstream\` (clone, outside the CC repo)
- No CC files modified yet

**Interfaces:**
- Produces: local clone at `C:\Users\tagal\TaskManagementQuest-upstream` checked out at the exact commit the live site runs (`9976c4d0122949ae245cbbb20b5bf20d65ee4df1`, from the live site's `env.json` `release` field). Tasks 2–3 read from this path.

- [ ] **Step 1: Create the feature branch in the CC repo**

```bash
cd /c/Users/tagal/quest-hq-command-center
git checkout -b feat/task-app-absorption
```

- [ ] **Step 2: Clone upstream (read-only)**

```bash
git clone https://github.com/ShanIngrid1207/TaskManagementQuest.git /c/Users/tagal/TaskManagementQuest-upstream
```

Expected: clone succeeds. If auth is required, stop and ask the user to run the clone (house rule: user runs the main commands).

- [ ] **Step 3: Verify the deployed release commit exists and check it out**

```bash
cd /c/Users/tagal/TaskManagementQuest-upstream
git cat-file -t 9976c4d0122949ae245cbbb20b5bf20d65ee4df1
git checkout 9976c4d0122949ae245cbbb20b5bf20d65ee4df1
```

Expected: `commit`, then detached-HEAD checkout. If the commit is missing, the live deploy is ahead of the repo — STOP and report; do not proceed on a mismatched base.

- [ ] **Step 4: Confirm the upstream layout and locate the edge functions**

```bash
ls
ls supabase/functions 2>/dev/null || echo "NO supabase/functions dir - record where notify-email lives"
```

Expected: an app folder containing `app.html`, `js/`, plus (hopefully) `supabase/functions/notify-email` and `supabase/functions/delete-user`. Record the actual paths in the Task 2 delta report — Phase 4 consumes them.

### Task 2: Produce the integration delta report

**Files:**
- Create: `docs/superpowers/plans/2026-07-22-task-app-delta.md` (in the CC repo)

**Interfaces:**
- Consumes: `C:\Users\tagal\TaskManagementQuest-upstream` (Task 1)
- Produces: a delta report with three exact lists that Task 3 and the Phase 2 plan consume: **(A)** files that exist only in the CC vendored copy (the integration layer), **(B)** upstream files that changed vs the vendored copy, **(C)** upstream schema/edge-function facts (tables referenced by `SupabaseDataStore.js`, function names invoked, `env.json` keys).

- [ ] **Step 1: Diff the trees**

```bash
cd /c/Users/tagal
diff -rq quest-hq-command-center/taskmanagement TaskManagementQuest-upstream --exclude=.git > /c/Users/tagal/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad/tm-delta-raw.txt; true
wc -l /c/Users/tagal/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad/tm-delta-raw.txt
```

(If upstream nests the app in a subfolder, diff against that subfolder instead — use the layout recorded in Task 1 Step 4.)

- [ ] **Step 2: Extract the integration-layer inventory (known members, verify all present in list A)**

The CC-only integration layer, per current vendored code — every item must appear in the report with its re-application note:

| Item | Where | What it does |
| --- | --- | --- |
| `js/command-center-host.js` | CC-only file | Shows host bar, job-scope label, return link when `App.commandCenterIntegration.hosted` |
| Hosted-mode block in `js/config.js` | CC edit | Derives `App.basePath` from `/taskmanagement/` mount; builds `App.commandCenterIntegration {hosted, embedded, basePath, projectId, returnUrl}` from URL params; same-origin guard on `return_url`; routes login/profile to host app |
| `App.authEnabled = false` | `js/config.js:2` | Demo mode until Phase 2 flips it |
| Host bar markup (`#commandCenterHostBar`, `#commandCenterProjectLabel`, `#commandCenterReturnLink`) | `app.html` | The visible "you're inside a job" bar |
| `App.defaultSupabaseConfig` pointing at `lpzotcznihwyyudxycmd` | `js/config.js` | CC's project, not upstream's |
| No `login.html` in vendored copy | folder-level | CC owns login; upstream's login page is intentionally not vendored |

- [ ] **Step 3: Write the report and commit**

Write the three lists (A/B/C) into `docs/superpowers/plans/2026-07-22-task-app-delta.md` with exact file paths, then:

```bash
cd /c/Users/tagal/quest-hq-command-center
git add docs/superpowers/plans/2026-07-22-task-app-delta.md
git commit -m "docs: taskmanagement upstream delta report (base 9976c4d)"
```

### Task 3: Refresh the vendored folder + re-apply the integration layer

**Files:**
- Modify: everything under `quest-hq-command-center/taskmanagement/` (wholesale refresh)
- Preserve/re-apply: `taskmanagement/js/command-center-host.js`, hosted-mode edits in `taskmanagement/js/config.js`, host-bar markup in `taskmanagement/app.html`

**Interfaces:**
- Consumes: upstream clone (Task 1), delta report lists A/B (Task 2)
- Produces: `taskmanagement/` = upstream `9976c4d` app files + the integration layer, with `App.authEnabled = false` and `App.commandCenterIntegration` behaving exactly as before (same property names — `hosted`, `embedded`, `basePath`, `projectId`, `returnUrl` — Phase 4's link-swap depends on them).

- [ ] **Step 1: Snapshot the current integration layer to the scratchpad**

```bash
SCRATCH=/c/Users/tagal/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad
mkdir -p "$SCRATCH/tm-integration"
cd /c/Users/tagal/quest-hq-command-center
cp taskmanagement/js/command-center-host.js "$SCRATCH/tm-integration/"
cp taskmanagement/js/config.js "$SCRATCH/tm-integration/config.cc.js"
cp taskmanagement/app.html "$SCRATCH/tm-integration/app.cc.html"
```

- [ ] **Step 2: Replace the folder with upstream app files**

```bash
cd /c/Users/tagal/quest-hq-command-center
git rm -r --cached taskmanagement >/dev/null
rm -rf taskmanagement
mkdir taskmanagement
# copy the upstream app files (adjust source path to the layout recorded in Task 1 Step 4):
cp -r /c/Users/tagal/TaskManagementQuest-upstream/app.html \
      /c/Users/tagal/TaskManagementQuest-upstream/js \
      /c/Users/tagal/TaskManagementQuest-upstream/*.css \
      /c/Users/tagal/TaskManagementQuest-upstream/vendor \
      /c/Users/tagal/TaskManagementQuest-upstream/favicon.svg \
      taskmanagement/
```

Deliberately NOT copied: `login.html` + login assets (CC owns login), `env.json`/`env.example.json` secrets (CC ships its own), any service-worker/manifest that would hijack the CC origin (`manifest.webmanifest`, `sw.js` — the PWA identity belongs to Command Center, not the module; list any found in the delta report).

- [ ] **Step 3: Re-apply the integration layer**

1. Copy `command-center-host.js` back into `taskmanagement/js/`.
2. Merge the hosted-mode block into the NEW upstream `js/config.js` (use `$SCRATCH/tm-integration/config.cc.js` as the reference): basePath detection for `/taskmanagement/` mounts, `App.commandCenterIntegration` construction with the same-origin `return_url` guard, login/profile routes pointing at the host app, `App.defaultSupabaseConfig` = `lpzotcznihwyyudxycmd` project, and `App.authEnabled = false` as the first config line. Keep every upstream addition (e.g. `App.isRecoveryLanding`, theme boot) unless it belongs to the retired login flow.
3. Re-add the host-bar markup block to the new `app.html` (copy the `#commandCenterHostBar` block from `$SCRATCH/tm-integration/app.cc.html`) and a `<script src="js/command-center-host.js"></script>` tag in the same load order as before (after `config.js`).
4. If upstream `app.html` references `login.html` or files not copied, point them at CC equivalents per the config routes — record each such edit in the delta report.

- [ ] **Step 4: Grep-verify nothing points at the old world**

```bash
cd /c/Users/tagal/quest-hq-command-center
grep -rn "qqvmcsvdxhgjooirznrj\|task.questroofing.com\|login.html" taskmanagement/ && echo "FIX THE ABOVE" || echo "CLEAN"
```

Expected: `CLEAN` (or fix each hit until clean).

### Task 4: Verify visually + build + commit

**Files:**
- Test: dev-server render of `taskmanagement/app.html`; `npm test`; `npm run build`

**Interfaces:**
- Consumes: refreshed `taskmanagement/` (Task 3)
- Produces: green build with `dist/taskmanagement/` present; screenshot evidence; the Phase 1 commit that Phase 2 branches from.

- [ ] **Step 1: Dev-server screenshot (demo mode)**

```bash
cd /c/Users/tagal/quest-hq-command-center
npm run dev &
sleep 4
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --screenshot=/c/Users/tagal/AppData/Local/Temp/claude/C--Users-tagal/2a3124dc-a209-4807-9818-c74b893d5ed6/scratchpad/tm-phase1.png \
  --window-size=1440,900 "http://127.0.0.1:5173/taskmanagement/app.html"
```

Read the screenshot. Expected: the task app UI renders (demo mode, no Supabase) with no blank page / console-error wall. Also capture `http://127.0.0.1:5173/taskmanagement/app.html?project_id=test-job&embed=1` and confirm the host bar shows "Job Center scope: test-job".

- [ ] **Step 2: Stop dev server, run tests + build**

```bash
# stop the dev server first (house rule), then:
npm test
npm run build
ls dist/taskmanagement/app.html
```

Expected: tests pass, build passes bundle budget, `dist/taskmanagement/app.html` exists.

- [ ] **Step 3: Commit**

```bash
git add -A taskmanagement docs/superpowers/plans/2026-07-22-task-app-delta.md
git commit -m "feat: refresh vendored taskmanagement to upstream 9976c4d with CC integration layer"
```

---

## Appendix A — Phase 3 seed: tasks plugin allowlist migration

The current allowlist lives in `supabase/migrations/20260701170157_price_book_plugin_allowlist.sql`. Phase 3's migration re-adds the constraint with `'tasks'` included (full current list + one addition):

```sql
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
```

Per locked decision 5, Phase 3 also updates `app_private.plugin_ids_for_preset` (same migration file pattern) so **every** preset array includes `'tasks'`, and backfills `company_plugins` rows (`status = 'installed'`) for existing workspaces.

## Appendix B — Facts already verified (don't re-derive)

- `public.tasks` already carries `company_id` → `companies(id)` and has RLS policies (rewritten in `202606241700_launch_readiness_saas.sql`) — Phase 3 reviews, not creates.
- `public.team_members` uses global text ids + `company_ids text[]` — the weakest tenancy link; Phase 3's top review target.
- Tenancy helpers: `app_private.is_company_member(company_id)`, `is_company_admin(company_id)`, `is_quest_admin()`, `company_has_plugin(company_id, plugin_id)`.
- Live site has NO Vercel API routes (probed: 404); frontend calls Supabase directly plus edge functions `notify-email` (Phase 4: port) and `delete-user` (Phase 3: retire).
- Placeholder to delete in Phase 4: `renderTasksPage` (src/main.js:9291), routed at src/main.js:4176, sidebar module id `tasks` at src/main.js:958.
- Old `/task-management.html` redirect handling exists at src/main.js:25687 — Phase 4 repoints it at the vendored app.
