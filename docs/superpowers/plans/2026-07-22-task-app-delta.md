# TaskManagement Upstream Delta Report

Base: upstream `ShanIngrid1207/TaskManagementQuest` @ `9976c4d0122949ae245cbbb20b5bf20d65ee4df1`
("revert: remove misplaced command center workspace work" — the deployed release per task.questroofing.com env.json)
Compared against: vendored `taskmanagement/` (stale snapshot) on 2026-07-22.
Upstream layout: the app lives at the **repo root** (no subfolder).

## A. CC-only integration layer (must survive the refresh)

| Item | Disposition |
| --- | --- |
| `js/command-center-host.js` | Copy back verbatim |
| Hosted-mode block in `js/config.js` (basePath from `/taskmanagement/` mount, `App.commandCenterIntegration {hosted, embedded, basePath, projectId, returnUrl}`, same-origin `return_url` guard, host login/profile routes, `App.defaultSupabaseConfig` → `lpzotcznihwyyudxycmd`, `App.authEnabled = false`) | Merge into new upstream `config.js` |
| Host-bar markup `#commandCenterHostBar` / `#commandCenterProjectLabel` / `#commandCenterReturnLink` in `app.html` | Re-add to new `app.html`, plus `<script src="js/command-center-host.js">` after `config.js` |
| `js/views/NewTaskModalView.js` (CC-only) | **Drop** — upstream replaced it with `js/views/NewTaskPageView.js` |
| No `login.html` vendored | Keep policy: CC owns login (upstream login = `index.html` + `login.css` + `js/login-fx.js`, not vendored) |
| `App.authEnabled === false` demo-session block in `js/auth-guard.js` (discovered during refresh — was an inline CC edit, not a separate file) | Re-applied into upstream `auth-guard.js` after `await App.configReady` |
| Host-bar CSS (was inlined in old `taskmanagement.css`) | Extracted to new CC-only file `css/command-center-host.css`, linked from `app.html` |

## B. Upstream changes vs snapshot

- **Every shared JS/HTML file differs** (34 files) — wholesale replace, no per-file merging except `config.js` and `app.html` (integration layer).
- **New dirs/files to vendor:** `css/` (`mobile.css`, `newtask.css`, `taskdetail.css`, `tasks.css`), many new `js/` modules: `TourSteps.js`, `UiStatePolicy.js`, `directory.js`, `taxonomy.js`, `theme-boot.js`, `js/ui/`, `js/utils/`, services (`BriefingClient`, `ChatClient`, `CsvExport`, `DigestClient`, `PersistenceEngine`, `RollupClient`, `TaskDraftClient`, `VoiceCapture`), views (`BottomNavView`, `BulkActionsView`, `ChatDrawerView`, `CheckinSettingsView`, `DateTimePickerView`, `FocusWidgetView`, `HomeView`, `LoaderView`, `NewFolderView`, `NewTaskPageView`, `PermissionsAdminView`, …), `vendor/tabler-icons/tabler-icons-subset.css` + subset woff2.
- **Deliberately NOT vendored:** `index.html`/`login.css`/`js/login-fx.js` (CC owns login); `sw.js` + `js/register-sw.js` + `manifest.webmanifest` + `icons/` (PWA identity belongs to CC — matching head links and script tag stripped from vendored `app.html`); `*-preview.html`, `tests/`, `tools/`, `docs/`, `playwright.config.js`, `package*.json`, `vercel.json`, `supabase/` (functions referenced from upstream clone in Phase 4), `.github/`, `PASTE-INTO-SUPABASE-DASHBOARD.ts`, `CONTEXT.md`, `skills-lock.json`, `.gitleaksignore`, `.vercelignore`, `env.example.json`.

## C. Schema / backend facts (Phase 2 + Phase 4 consume this)

**Tables referenced by upstream `SupabaseDataStore.js`:**
`tasks`, `profiles`, `team_members`, `projects`, `time_entries`, `active_timers`, `notifications`, plus **9 tables the CC database does not have yet**: `task_comments`, `comment_reactions`, `task_labels`, `task_label_sops`, `task_types`, `task_type_statuses`, `checkin_settings`, `bug_reports` (and `projects` exists upstream but not in CC's runtime migration).
→ Phase 2's additive migration is substantially larger than the original snapshot suggested.

**Edge functions (upstream `supabase/functions/`): SEVEN, not two.**

| Function | Invoked from frontend? | Phase disposition |
| --- | --- | --- |
| `notify-email` | yes | Phase 4: port + tenant template review (locked decision 8) |
| `delete-user` | yes | Phase 3: retire (locked decision 7) |
| `create-user` | yes | Phase 3: retire/replace — CC invite flow owns user creation (decision 7) |
| `ai-assistant` | yes | Phase 4 decision needed: port (needs its AI provider secret) or defer |
| `report-problem` | yes | Phase 4 decision needed: port or route to CC support channel |
| `checkins` | no (cron/scheduled?) | Phase 4: inspect trigger mechanism before porting |
| `due-reminders` | no (cron/scheduled?) | Phase 4: inspect — likely scheduled; pairs with ReminderEngine |

**env.json keys (unchanged shape):** `supabaseUrl`, `supabaseAnonKey`, `sentryDsn`, `release`, `turnstileSiteKey`.

**Plan impact:** Phase 2 (9 new tables to design tenant-safe from day one) and Phase 4 (5 extra functions to disposition) both grew. Phase 1 scope unchanged.
