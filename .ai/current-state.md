# Current state

Captured 2026-07-21. This is a point-in-time operational snapshot, not a substitute for live verification.

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
- Public catalog: 56 relations, 157 foreign-key constraints, 176 policies, 53 functions, and 41 triggers.
- Storage: 6 buckets cataloged without object data.
- Latest repository migration: 202607181100_automations.sql
- Latest live ledger entry: 20260716194836 task_deal_next_actions

The repository filename history and Supabase's applied migration versions are not identical because some live migrations were applied/reconciled under provider-generated versions. Compare intent and live schema; do not assume filename equality means deployment status.

## Feature state

The current implementation includes categorized job-card photo upload and durable underwriting cases. The Underwriter workspace follows the approved Technical Ledger hierarchy: compact metrics and stage filters, a dense two-column estimator workbench with a dedicated decision summary, and a full-width estimate queue. Its primary action is Save decision and the calculator's existing persistence, permissions, and live recalculation remain intact. The application shell uses a 264px white Quest command rail with IBM Plex Sans and IBM Plex Mono, sidebar search, My work and Company scopes, stakeholder-approved Work/Pipeline/Production/Tools/Review/Build groups, and direct profile/settings access while preserving module permission gates. The command rail now exposes membership-scoped workspaces as a persistent list above the navigation scope toggle. The active workspace is highlighted, switching reuses `setActiveCompany()` so company-scoped pipeline stages and UI state are reapplied safely, and create/manage actions route to the existing Company settings controls. The Contacts rail follows the standalone nine-step sales lifecycle from Prospects through Lost, uses linked deal state for live counts, and routes each stage to a lifecycle-filtered Contacts view. The live data layer also supports a tenant-safe direct link from tasks to deals; tasks supply the shared "What's next" source across the board, table, and list views for Contacts, Quotes/Deals, and Jobs. Application startup is deferred until top-level module state is initialized so cached direct links can render safely.

The implementation includes Dashboard, Workday, Contacts, Quotes/Deals, Proposals, Jobs, Tasks, Files, Forms, Client Portals with document review, Price Book, Finance, Messages, Calendar, Analytics, Users, Team Chart, Team Workload, Knowledge, Time, Approvals, Clock, Settings, plugins, and Workspace App Builder.

Future navigation entries currently include Tickets and Templates. Verify code and product direction before treating a planned page as complete.

Automations is now live: company-scoped trigger -> action rules (e.g. "when a deal reaches Won, create a task") stored in the automations table, gated on settings.manage to edit and membership to read. The matching engine is pure (src/data/automations.js) and fires on the transition into a target state; rules run from persistDeal, setContactStage, and task completion.

The web app is installable. A manifest, maskable icon set, and service worker let Android Chrome install it to the home screen on phones and tablets, running standalone from `/command`. The worker is scoped narrowly on purpose: navigations are network-first, only content-hashed build assets are cached, and the API and all cross-origin traffic are never cached. A signed Trusted Web Activity APK/AAB (package com.questroofing.hq) wraps this PWA for sideload/Play Store; the build workspace and signing keystore live in the git-ignored twa/ folder.

Tasks support recurrence: a task with a rule in tasks.recurrence rolls forward to its next occurrence when completed via the checkbox or a dashboard tile. Rules and date math live in src/data/recurrence.js; the command bar parses cadence phrases into the Repeat control.

## Freshness

The exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.

