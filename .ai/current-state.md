# Current state

Captured 2026-07-22T22:24:26.326Z. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Production URL: https://quest-hq-command-center-gamma.vercel.app
- Vercel project: prj_0MxrYyGIo61QgLNW2M74fvTxlMRV
- Current ready production deployment: dpl_763c8dwqm7M92n5rZ4iTXAhxv4NP
- Deployed branch/commit: main at 070586e86952b2acf358727005d787bc79511322
- GitHub default branch at capture: 070586e86952b2acf358727005d787bc79511322
- Latest deployed Task preview: dpl_9g8NvVhdVxngSoQqZRFVnV7yJWc9 from feat/task-app-absorption at b6ae185; this is not production.
- Latest overall preview is the RingCentral branch at 3416dbe; it is not the Task baseline and is not production.
- Production Guardian: scheduled every six hours and available by manual dispatch.
- Last explicitly verified Guardian run in this project context: https://github.com/Lumen-Marketing/quest-hq-command-center/actions/runs/29528622459
- Last full production smoke context: 36 of 36 routes and 3 of 3 critical assets passed for `6699c9f4f5ee8915f2226dfc2d67477b4c0e8cec`, with no browser-console or Vercel runtime errors.

## Repository health

- Current branch regression suite: 422 tests passed.
- The production build and bundle-budget check pass without a local application server.
- CI runs npm run check on pushes and pull requests.
- Build output is checked against a bundle budget and copies TaskManagement plus legacy SPA assets.
- Production smoke can assert that the deployed HTML revision matches main.

## Supabase

- Project ref: rqundirizvojpzhljtdn
- Status: ACTIVE_HEALTHY
- Region: us-west-1
- Postgres: 17.6.1.127, engine 17
- The catalog-count snapshot remains the 2026-07-21 metadata export; Task/workspace objects below were rechecked live on 2026-07-23.
- Storage: 6 buckets cataloged without object data.
- Latest repository migration: 202607231200_ringcentral_calls.sql — **applied live 2026-07-23**
- It adds five `ringcentral_*` tables, five select policies, the
  `public.ringcentral_conversation_stats` function, and widens
  `app_private.permission_plugin_ids` so `team.view` resolves to both `reporting` and
  `calls`. The catalog counts above predate it and have not been re-captured.
- The `lumen` company is seeded: a `ringcentral_accounts` row, the `calls` company plugin,
  and the `calls` workspace plugin on its Main workspace.
- **The live allowlist is ahead of the older plugin migrations.**
  `company_plugins_known_plugin_check` contains `tasks`; a future migration that rebuilds
  this constraint from a stale allowlist can drop `tasks` and fail against existing rows.
  Always read the live constraint out of `pg_constraint` first.
- Live tenancy verification: every one of the 3 company accounts has one active default operational workspace; all 11 workspace-owned pipeline tables have non-null workspace ids; zero company/workspace mismatches were found.
- Live Task verification: `tasks.workspace_id` is required and existing task RLS is workspace-membership/permission scoped. Companies have the Tasks entitlement, but no Tasks rows existed in `workspace_plugins` at capture; the new forward migration supplies only those missing activations.
- Migration drift: live contains the effects of the Task phase 2/3 migrations without their repository versions in the ledger. Do not replay those historical files; see `docs/supabase-migration-reconciliation.md`.

The repository filename history and Supabase's applied migration versions are not identical because some live migrations were applied/reconciled under provider-generated versions. Compare intent and live schema; do not assume filename equality means deployment status.

## Feature state

The current release branch separates each customer company account from its configurable operational child workspaces. The command rail groups child workspaces under the company header, highlights the selected workspace, and preserves it in the route. Company settings can create, rename, describe, icon, archive, and manage those children; user access assigns regular workers and a role independently per workspace. Company owners, admins, and developers inherit all active child workspaces. Company plugin records are entitlements, while activation and configuration live per child workspace. Contacts, accounts, sites, quotes, activities, jobs, tasks, pipeline stages, underwriting cases, files, and proposals are isolated by `workspace_id`; record conversions preserve that identity and database constraints reject cross-workspace links. The absorbed Task runtime now receives the selected workspace from the host, filters task reads and mutations to it, and is gated by its own per-workspace Tasks plugin activation. These Task foundation changes are not production state until the release branch is published and promoted.

The Underwriter workspace follows the approved Technical Ledger hierarchy: compact metrics and stage filters, a dense two-column estimator workbench with a dedicated decision summary, and a full-width estimate queue. Its primary action is Save decision and the calculator's persistence, permissions, and live recalculation remain intact. The application shell uses a 264px white Quest command rail with IBM Plex Sans and IBM Plex Mono, sidebar search, My work and Company scopes, stakeholder-approved Work/Pipeline/Production/Tools/Review/Build groups, and direct profile/settings access while preserving module permission gates. The Contacts rail follows the standalone nine-step sales lifecycle from Prospects through Lost. Tasks remain the shared "What's next" source across Contacts, Quotes/Deals, and Jobs. Application startup is deferred until top-level module state is initialized so cached direct links render safely.

The implementation includes Dashboard, Workday, Contacts, Quotes/Deals, Proposals, Jobs, Tasks, Files, Forms, Client Portals with document review, Price Book, Finance, Messages, Calendar, Analytics, Users, Team Chart, Team Workload, Knowledge, Time, Approvals, Clock, Calls, Settings, plugins, and Workspace App Builder.

Calls is a company-scoped RingCentral module with exactly two surfaces: a live board showing each extension's status and how long it has held it, and a table of total calls versus calls over 60 seconds per person. It deliberately reproduces nothing that RingCentral Analytics already shows. Historic counts are served by `public.ringcentral_conversation_stats` from synced rows, so the page renders when RingCentral is unreachable; only the live board reaches RingCentral, through `api/ringcentral-presence.js`, which is admin-only and caches upstream calls for ten seconds. `api/ringcentral-sync.js` runs on a Vercel cron, re-fetching a rolling three-day window of the company call log and upserting on `(company_id, call_id)`. The module is gated on the existing `team.view` permission and requires RingCentral credentials in Vercel plus a `ringcentral_accounts` row before it shows data.

Future navigation entries currently include Tickets and Templates. Verify code and product direction before treating a planned page as complete.

Automations is now live: company-scoped trigger -> action rules (e.g. "when a deal reaches Won, create a task") stored in the automations table, gated on settings.manage to edit and membership to read. The matching engine is pure (src/data/automations.js) and fires on the transition into a target state; rules run from persistDeal, setContactStage, and task completion.

The web app is installable. A manifest, maskable icon set, and service worker let Android Chrome install it to the home screen on phones and tablets, running standalone from `/command`. The worker is scoped narrowly on purpose: navigations are network-first, only content-hashed build assets are cached, and the API and all cross-origin traffic are never cached. A signed Trusted Web Activity APK/AAB (package com.questroofing.hq) wraps this PWA for sideload/Play Store; the build workspace and signing keystore live in the git-ignored twa/ folder.

Tasks support recurrence: a task with a rule in tasks.recurrence rolls forward to its next occurrence when completed via the checkbox or a dashboard tile. Rules and date math live in src/data/recurrence.js; the command bar parses cadence phrases into the Repeat control.

## Freshness

The exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.

