# Current state

Captured 2026-07-21T00:27:56.075Z. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Production URL: https://quest-hq-command-center-gamma.vercel.app
- Vercel project: prj_0MxrYyGIo61QgLNW2M74fvTxlMRV
- Current ready production deployment: dpl_FiH4yFuPbZEd67NTT38X8QZWH2Ac
- Deployed branch/commit: main at fd6e1cb02e4a766dc48e21413879b274c93f5991 (recurring tasks, automations, contact dedupe shipped; task_recurrence + automations migrations applied live)
- GitHub default branch at capture: fd6e1cb02e4a766dc48e21413879b274c93f5991
- Production Guardian: scheduled every six hours and available by manual dispatch.
- Last explicitly verified Guardian run in this project context: https://github.com/Lumen-Marketing/quest-hq-command-center/actions/runs/29528622459
- Last full production smoke context: 36 of 36 routes and 3 of 3 critical assets passed for `6699c9f4f5ee8915f2226dfc2d67477b4c0e8cec`, with no browser-console or Vercel runtime errors.

## Repository health

- Current branch regression suite: 344 tests passed.
- The production build and bundle-budget check pass without a local application server.
- CI runs npm run check on pushes and pull requests.
- Build output is checked against a bundle budget and copies TaskManagement plus legacy SPA assets.
- Production smoke can assert that the deployed HTML revision matches main.

## Supabase

- Project ref: rqundirizvojpzhljtdn
- Status: ACTIVE_HEALTHY
- Region: us-west-1
- Postgres: 17.6.1.127, engine 17
- Public catalog: 60 relations, 178 foreign-key column links, 190 policies, 59 public functions, and 80 trigger events.
- Storage: 6 buckets cataloged without object data.
- Latest repository migration: 202607231200_ringcentral_calls.sql — **applied live 2026-07-23**
- It adds five `ringcentral_*` tables, five select policies, the
  `public.ringcentral_conversation_stats` function, and widens
  `app_private.permission_plugin_ids` so `team.view` resolves to both `reporting` and
  `calls`. The catalog counts above predate it and have not been re-captured.
- The `lumen` company is seeded: a `ringcentral_accounts` row, the `calls` company plugin,
  and the `calls` workspace plugin on its Main workspace.
- **The live allowlist is ahead of the repository.** `company_plugins_known_plugin_check`
  contains `tasks`, added by work that is applied to the database but still sits on the
  unmerged `feat/task-app-absorption` branch. A migration that rebuilds this constraint
  from the newest file in `supabase/migrations` will drop `tasks` and fail against
  existing rows. Always read the live constraint out of `pg_constraint` first.
- Live tenancy verification: every one of the 3 company accounts has one active default operational workspace; all 11 workspace-owned pipeline tables have non-null workspace ids; zero company/workspace mismatches were found.
- **Repository is ahead of live for task visibility.** Migration `202607241200_per_person_task_visibility.sql` (branch `feat/task-per-person-visibility`) narrows the `tasks workspace read`/`update` RLS to be per person — leads (`tasks.manage`) and owners/admins see and manage all workspace tasks, while `tasks.view`-only crew see and update only tasks they are assigned to or created (creator always sees own). It is committed but **not yet applied to the live project**; until it is applied, any workspace member with `tasks.view` still sees every task in the workspace. INSERT/DELETE stay `tasks.manage`-gated either way.

The repository filename history and Supabase's applied migration versions are not identical because some live migrations were applied/reconciled under provider-generated versions. Compare intent and live schema; do not assume filename equality means deployment status.

## Feature state

The current release candidate separates each customer company account from its configurable operational child workspaces. The command rail groups child workspaces under the company header, highlights the selected workspace, and preserves it in the route. Company settings can create, rename, describe, icon, archive, and manage those children; user access assigns regular workers and a role independently per workspace. Company owners, admins, and developers inherit all active child workspaces. Company plugin records are entitlements, while activation and configuration live per child workspace. Contacts, accounts, sites, quotes, activities, jobs, tasks, pipeline stages, underwriting cases, files, and proposals are isolated by `workspace_id`; record conversions preserve that identity and database constraints reject cross-workspace links.

The public home now uses the approved Modular Quest product direction and the market-facing Questbase.io name. Its interactive workspace preview demonstrates role-focused workspaces while keeping one company record connected. The original mockup's early-access form was not carried into the application: Business login, Start workspace, Join by invite, and session-aware Open workspace actions all use the existing authentication and tenancy flows.

The Underwriter workspace follows the approved Technical Ledger hierarchy: compact metrics and stage filters, a dense two-column estimator workbench with a dedicated decision summary, and a full-width estimate queue. Its primary action is Save decision and the calculator's persistence, permissions, and live recalculation remain intact. The application shell uses a 264px white Quest command rail with IBM Plex Sans and IBM Plex Mono, sidebar search, My work and Company scopes, stakeholder-approved Work/Pipeline/Production/Tools/Review/Build groups, and direct profile/settings access while preserving module permission gates. The Contacts rail follows the standalone nine-step sales lifecycle from Prospects through Lost. Tasks remain the shared "What's next" source across Contacts, Quotes/Deals, and Jobs. Application startup is deferred until top-level module state is initialized so cached direct links render safely.

The implementation includes Dashboard, Workday, Contacts, Quotes/Deals, Proposals, Jobs, Tasks, Files, Forms, Client Portals with document review, Price Book, Finance, Messages, Calendar, Analytics, Users, Team Chart, Team Workload, Knowledge, Time, Approvals, Clock, Calls, Settings, plugins, and Workspace App Builder.

Calls is a company-scoped RingCentral module with exactly two surfaces: a live board showing each extension's status and how long it has held it, and a table of total calls versus calls over 60 seconds per person. It deliberately reproduces nothing that RingCentral Analytics already shows. Historic counts are served by `public.ringcentral_conversation_stats` from synced rows, so the page renders when RingCentral is unreachable; only the live board reaches RingCentral, through `api/ringcentral-presence.js`, which is admin-only and caches upstream calls for ten seconds. `api/ringcentral-sync.js` runs on a Vercel cron, re-fetching a rolling three-day window of the company call log and upserting on `(company_id, call_id)`. The module is gated on the existing `team.view` permission and requires RingCentral credentials in Vercel plus a `ringcentral_accounts` row before it shows data.

Future navigation entries currently include Tickets and Templates. Verify code and product direction before treating a planned page as complete.

Automations is now live: company-scoped trigger -> action rules (e.g. "when a deal reaches Won, create a task") stored in the automations table, gated on settings.manage to edit and membership to read. The matching engine is pure (src/data/automations.js) and fires on the transition into a target state; rules run from persistDeal, setContactStage, and task completion.

The web app is installable. A manifest, maskable icon set, and service worker let Android Chrome install it to the home screen on phones and tablets, running standalone from `/command`. The worker is scoped narrowly on purpose: navigations are network-first, only content-hashed build assets are cached, and the API and all cross-origin traffic are never cached. A signed Trusted Web Activity APK/AAB (package com.questroofing.hq) wraps this PWA for sideload/Play Store; the build workspace and signing keystore live in the git-ignored twa/ folder.

Tasks support recurrence: a task with a rule in tasks.recurrence rolls forward to its next occurrence when completed via the checkbox or a dashboard tile. Rules and date math live in src/data/recurrence.js; the command bar parses cadence phrases into the Repeat control.

## Freshness

The exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.

