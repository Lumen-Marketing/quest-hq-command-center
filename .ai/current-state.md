# Current state

Captured 2026-07-28T03:20:25+08:00. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Product: Questbase, formerly Quest HQ Command Center.
- Canonical public domains: https://questbase.io and https://www.questbase.io.
- Stable Vercel URL: https://quest-hq-command-center-gamma.vercel.app.
- Vercel project: `prj_0MxrYyGIo61QgLNW2M74fvTxlMRV`.
- Ready production deployment: `dpl_AbscXPnJhswTyQfrvGXr7YaowU8M`.
- Deployed application revision: `694518b9906ac9e14115997ba84f60e90ea4fcc7` from `main`.
- Production smoke passed for the exact revision: 36 of 36 routes and 3 of 3 entry assets.
- Signed-in browser verification passed for company/workspace navigation and the new teammate-invite modal. The verification did not create an invite or send email.
- Production Guardian remains scheduled every six hours and available by manual dispatch.

## Repository health

- GitHub repository: `Lumen-Marketing/quest-hq-command-center`.
- Default branch at capture: `main` at `694518b9906ac9e14115997ba84f60e90ea4fcc7`.
- `npm run check` passes: 590 tests, AI/project-state validation, production build, and bundle-budget gate.
- CI runs the same check on pushes and pull requests.
- The main application still emits a Vite advisory for a JavaScript chunk over 500 kB; the repository's explicit bundle budget passes.

## Supabase

- Project ref: `rqundirizvojpzhljtdn`.
- Status: `ACTIVE_HEALTHY`.
- Region: `us-west-1`.
- Postgres: `17.6.1.127`, engine 17.
- Live catalog snapshot captured 2026-07-28 from metadata only: 75 public tables/views, 191 foreign-key column relationships, 223 policies, 60 public functions, 83 triggers, 6 storage buckets, and 81 applied migration records.
- Latest repository migration: `202607281130_company_invite_launch_hardening.sql`.
- The migration is live under provider ledger version `20260727190835` with name `company_invite_launch_hardening`.
- The `send-company-invite` Edge Function is live and active as version 2. It manually validates the caller JWT and requires an active Owner, Admin, or Developer membership in the invite's company.
- Strict CORS is active for the stable Vercel URL and the two Questbase domains. Unknown origins do not receive an allow-origin header.
- Live unauthenticated function calls return 401.
- A rollback-only production proof accepted an intentionally elevated invite candidate and verified that no elevated membership or role assignment survived, the selected workspace membership was created, and the transaction left no data behind.
- Existing legacy pending invites with no selected workspace fall back to the company's default active workspace.
- Supabase security advisor reported no errors after the migration. Its remaining warnings are primarily existing generic `SECURITY DEFINER` notices; authenticated execution of `accept_company_invite` is intentional and protected by token, email, state, expiry, membership, role, and workspace checks.

Repository migration filenames and Supabase provider ledger versions can differ because some live migrations were applied or reconciled under provider-generated timestamps. Compare intent and live schema before replaying historical files.

## Tenancy and onboarding

The market customer and outer security boundary is a company. Each company owns configurable operational workspaces. Owners, Admins, and Developers inherit access to active workspaces; workers and other members require explicit active workspace memberships and can have a separate role in each workspace.

The teammate flow now follows one bounded path:

1. A company manager selects a non-elevated role and one or more active workspaces.
2. Questbase creates a pending company invite.
3. The server-side Edge Function derives the recipient, company, role, workspace names, token, subject, and HTML from that invite.
4. The recipient signs in with the invited email and accepts the token.
5. The database creates the company membership, clears stale custom roles, inserts only a verified non-elevated role, and creates the selected workspace memberships.

Invites cannot grant Owner, Admin, or Developer. Existing active members cannot use another invite to change their access. Elevated promotion remains a separate owner-guarded action after onboarding.

Email delivery is observable and recoverable. Invite rows record `not_sent`, `sent`, or `failed`; a delivery failure does not invalidate the token, and managers can retry or copy the link manually.

## Feature state

- Company and operational-workspace separation is production state.
- Workspaces independently activate entitled plugins and preserve workspace identity through CRM, pipeline, underwriting, job, file, proposal, and task records.
- Pipeline stages are stored and replaced per operational workspace rather than hardcoded globally.
- The compact Quest command rail, Modular Quest landing direction, IBM Plex typography, Technical Ledger underwriter, Contacts lifecycle, Dashboard, Workday, Jobs, Tasks, Messages, Files, Forms, Client Portals, Price Book, Calls, Automations, Analytics, Users, and Workspace App Builder are present.
- Shared CSV parsing now preserves empty columns and supports quoted commas, quotes, and newlines.
- Imported and persisted Workspace App Builder colors are constrained to CSS hex values before reaching style sinks.
- An injectable task write store (src/tasks/task-store.js, src/tasks/task-shape.js) with unit tests exists as the write engine for the flag-on native Tasks surface. It is not yet wired into src/main.js; the default embed surface is unaffected (see ADR-0001).

## Remaining controlled launch configuration

- Payments remain intentionally out of this change set.
- Before public onboarding, run one invite to a designated team-owned mailbox to prove the configured Resend API key, verified sender/domain, and inbox delivery. The code, authorization, database delivery ledger, retry path, and manual fallback are live, but no existing teammate was emailed during this rollout.
- Supabase Auth registration, verification, and recovery email use a separate channel. Confirm custom SMTP and branded Auth templates in the Supabase dashboard before public launch.

## Freshness

Exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.
