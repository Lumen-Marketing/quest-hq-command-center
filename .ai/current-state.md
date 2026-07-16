# Current state

Captured 2026-07-16T19:53:04.024Z. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Production URL: https://quest-hq-command-center-gamma.vercel.app
- Vercel project: prj_0MxrYyGIo61QgLNW2M74fvTxlMRV
- Current ready production deployment: dpl_Dcaoo5V1XjiinYpB7UNKnwj9NNRR
- Deployed branch/commit: main at 3a7597b40166e3de3f59908cab7c1029e53a4314
- GitHub default branch at capture: 3a7597b40166e3de3f59908cab7c1029e53a4314
- Production Guardian: scheduled every six hours and available by manual dispatch.
- Last explicitly verified Guardian run in this project context: https://github.com/Lumen-Marketing/quest-hq-command-center/actions/runs/29528622459
- Last full production smoke context: 36 of 36 routes and 3 of 3 critical assets passed with no runtime errors.

## Repository health

- Current branch regression suite: 324 tests passed.
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
- Latest repository migration: 202607171500_task_deal_next_actions.sql
- Latest live ledger entry: 20260716194836 task_deal_next_actions

The repository filename history and Supabase's applied migration versions are not identical because some live migrations were applied/reconciled under provider-generated versions. Compare intent and live schema; do not assume filename equality means deployment status.

## Feature state

Production includes categorized job-card photo upload and durable underwriting cases. The live data layer also now supports a tenant-safe direct link from tasks to deals; the current release branch uses tasks as the shared "What's next" source across the board, table, and list views for Contacts, Quotes/Deals, and Jobs.

The implementation includes Dashboard, Workday, Contacts, Quotes/Deals, Proposals, Jobs, Tasks, Files, Forms, Client Portals with document review, Price Book, Finance, Messages, Calendar, Analytics, Users, Team Chart, Team Workload, Knowledge, Time, Approvals, Clock, Settings, plugins, and Workspace App Builder.

Future navigation entries currently include Tickets, Automations, and Templates. Verify code and product direction before treating a planned page as complete.

## Freshness

The exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.

