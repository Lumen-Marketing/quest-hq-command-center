# Current state

Captured 2026-07-29T05:16:33+08:00. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Product: Questbase, formerly Quest HQ Command Center.
- Canonical public domains: https://questbase.io and https://www.questbase.io.
- Stable Vercel URL: https://quest-hq-command-center-gamma.vercel.app.
- Vercel project: `prj_0MxrYyGIo61QgLNW2M74fvTxlMRV`.
- Ready production deployment: `dpl_K6SmLSVJwnnbAcDsmvNB3tWoq9cZ`.
- Deployed application revision: `02bdb021392ca94198e7dca8ff866d85e0bd768f` from `main`.
- Production smoke passed for the exact revision: 36 of 36 routes and 3 of 3 entry assets.
- Signed-in browser verification passed for the production Job form's local draft lifecycle: an unfinished edit autosaved, reopening offered Restore or Discard, Restore recovered the exact field value, Discard removed the temporary QA draft, no job record was created, and the browser reported no console errors.
- Signed-in browser verification passed for the Dashboard account menu and Help & support dialog. The production dialog exposed the in-product guide, bug/problem/suggestion form, 2,000-character limit, enabled submit action, and support-email fallback with no browser-console errors. The verification did not submit a report.
- Signed-in browser verification also passed for the production Tasks route: the same-origin TaskManagement surface loaded as one embedded frame with no browser-console errors. Background realtime refreshes now update host state without rebuilding an already-mounted embedded Tasks frame, so they no longer discard the task user's active scroll, panels, or edit state.
- Production Guardian remains scheduled every six hours and available by manual dispatch.

## Repository health

- GitHub repository: `Lumen-Marketing/quest-hq-command-center`.
- Default branch at capture: `main` at `02bdb021392ca94198e7dca8ff866d85e0bd768f`.
- `npm run check` passes: 640 tests, AI/project-state validation, production build, and bundle-budget gate.
- `npm audit --audit-level=high` reports zero vulnerabilities after the locked PostCSS/Nanoid transitive dependency update.
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
- The `send-company-invite` Edge Function is live and active as version 3. It manually validates the caller JWT, requires an active Owner, Admin, or Developer membership in the invite's company, and sends matching HTML and plain-text invite content.
- The `report-problem` Edge Function is live and active as version 7. It manually validates the caller JWT before accepting a report.
- Both functions use built-in Questbase production origins plus optional configured origins. Live preflight from `https://www.questbase.io` returned an exact matching allow-origin header; an unrelated origin received no allow-origin header.
- Live unauthenticated `send-company-invite` calls return 401.
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

Invited workers now land on the permission-neutral Dashboard after acceptance. Owners and other workspace managers see a state-derived first-run checklist until they have a workspace, at least one active app, a teammate, a customer, and a task. Completed companies and read-only demo sessions do not receive the checklist.

## Feature state

- Company and operational-workspace separation is production state.
- Workspaces independently activate entitled plugins and preserve workspace identity through CRM, pipeline, underwriting, job, file, proposal, and task records.
- Pipeline stages are stored and replaced per operational workspace rather than hardcoded globally.
- The account menu now exposes a lazy-loaded Help & support dialog with Ctrl+K guidance, an email fallback, and an authenticated report form backed by `report-problem`.
- Pilot onboarding rehearsal, support response, and provider handoff procedures are documented under `docs/operations`.
- The compact Quest command rail, Modular Quest landing direction, IBM Plex typography, Technical Ledger underwriter, Contacts lifecycle, Dashboard, Workday, Jobs, Tasks, Messages, Files, Forms, Client Portals, Price Book, Calls, Automations, Analytics, Users, and Workspace App Builder are present.
- The embedded Tasks surface is protected from host-shell replacement during background realtime refreshes. Explicit host renders can still recreate the frame and remain tracked as a narrower follow-up risk.
- Shared CSV parsing now preserves empty columns and supports quoted commas, quotes, and newlines.
- Imported and persisted Workspace App Builder colors are constrained to CSS hex values before reaching style sinks.
- An injectable task write store (src/tasks/task-store.js, src/tasks/task-shape.js) with unit tests exists as the write engine for the flag-on native Tasks surface. It is not yet wired into src/main.js; the default embed surface is unaffected (see ADR-0001).
- Appearance (theme mode, accent, background preset, card styling) follows the signed-in user across devices via `profiles.appearance_prefs` and the `update_own_appearance` RPC. Owners/Admins can additionally save the current look as the company default (`companies.appearance_prefs`, `update_company_appearance`); members without their own saved appearance inherit it, and anyone who sets their own keeps it. A custom uploaded background image is excluded by design and stays browser-local. Requires migrations `202607291200_profile_appearance_sync.sql` and `202607291400_company_appearance_default.sql`; until it is applied the RPC call fails soft and appearance stays per browser.
- Accent-tinted chrome derives from the `--orange` token throughout, so the accent picker recolours hovers, active rows, focus rings, and primary-button hover states. Guarded by tests/accent-theme-static.test.mjs.
- Archived companies (subscription status `canceled`) are hidden from the company switcher, company pickers, and both platform company lists; the lists expose search, a status filter including Archived, and 25-per-page navigation (src/platform-directory.js, unit tested).
- Contacts, Jobs, Quotes, and Underwriter forms protect unfinished work with browser-local autosave, explicit Restore or Discard recovery, seven-day expiry, and profile/company/workspace/record scoping. Sensitive credential-like fields and files are excluded, drafts survive failed saves, successful saves clear them, and sign-out purges the departing profile's drafts. This recovery is browser-local by design and does not require a database migration.

## Remaining controlled launch configuration

- Payments remain intentionally out of this change set.
- Before public onboarding, run one invite to a designated team-owned mailbox to prove the configured Resend API key, verified sender/domain, and inbox delivery. The code, authorization, database delivery ledger, retry path, and manual fallback are live, but no existing teammate was emailed during this rollout.
- Supabase Auth registration, verification, and recovery email use a separate channel. Confirm custom SMTP and branded Auth templates in the Supabase dashboard before public launch.
- Complete the documented two-user pilot rehearsal with a company owner and newly invited worker before opening public registration.
- Owner-side launch decisions still include the bank/payment provider, final prices and limits, legal text, refund rules, and the public billing/support contacts.

## Freshness

Exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.
