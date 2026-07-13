# Current state

Captured 2026-07-13T21:28:30.100Z. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Production URL: https://quest-hq-command-center-gamma.vercel.app
- Vercel project: prj_0MxrYyGIo61QgLNW2M74fvTxlMRV
- Current ready production deployment: dpl_EmvhdT9HzmYgCJ1FhmVnCaBA1uqW
- Deployed branch/commit: main at ba034eb30aa57b28823d28c18f61ee4d275833f2
- GitHub default branch at capture: ba034eb30aa57b28823d28c18f61ee4d275833f2
- Production Guardian: scheduled every six hours and available by manual dispatch.
- Last explicitly verified Guardian run in this project context: https://github.com/Lumen-Marketing/quest-hq-command-center/actions/runs/29278127459
- Last full production smoke context: 36 of 36 routes and 3 of 3 critical assets passed with no runtime errors.

## Repository health

- Baseline before this project-brain change: 222 tests passed.
- This change adds seven project-brain validation tests; the expected suite is 229 tests.
- CI runs npm run check on pushes and pull requests.
- Build output is checked against a bundle budget and copies TaskManagement plus legacy SPA assets.
- Production smoke can assert that the deployed HTML revision matches main.

## Supabase

- Project ref: rqundirizvojpzhljtdn
- Status: ACTIVE_HEALTHY
- Region: us-west-1
- Postgres: 17.6.1.127, engine 17
- Public catalog: 53 tables, 151 foreign-key links, 168 policies, 53 functions, and 40 triggers.
- Storage: 6 buckets cataloged without object data.
- Latest repository migration: 202607111000_harden_file_upload_buckets.sql
- Latest live ledger entry: 20260711051011 harden_finance_attachments_bucket

The repository filename history and Supabase's applied migration versions are not identical because some live migrations were applied/reconciled under provider-generated versions. Compare intent and live schema; do not assume filename equality means deployment status.

## Feature state

The live implementation includes Dashboard, Workday, Contacts, Quotes/Deals, Proposals, Jobs, Tasks, Files, Forms, Client Portals with document review, Price Book, Finance, Messages, Calendar, Analytics, Users, Team Chart, Time, Approvals, Clock, Settings, plugins, and Workspace App Builder.

Future navigation entries currently include Tickets, Knowledge, Automations, Templates, and Team Workload. Verify code and product direction before treating a planned page as complete.

## Freshness

The exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.

