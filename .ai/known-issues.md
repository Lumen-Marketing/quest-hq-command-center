# Known issues and risks

Only confirmed, actionable items belong here.

## Main browser bundle remains large

Vite still emits a large-chunk advisory for the primary application bundle. The repository bundle-budget check passes, and Leaflet/PDF.js are lazy-loaded, but src/main.js remains a performance and maintainability risk. Measure production behavior before splitting and retain the budget guard.

## Browser code and styling are monolithic

Most product behavior is concentrated in src/main.js and most styling in src/styles.css. Broad edits can create cross-module regressions, so use focused changes and full checks until module boundaries are deliberately extracted.

## Migration identifiers differ between repository and live ledger

Supabase records provider-generated applied versions, so the repository filenames `202607211200_company_operational_workspaces.sql` and `202607211230_workspace_tenancy_advisor_hardening.sql` appear live as versions `20260721002147` and `20260721002417`. Always verify live objects and migration intent rather than comparing filename timestamps alone.

The live catalog also contains the effects of `202607221400_taskmanagement_phase2_runtime_delta.sql` and `202607221600_taskmanagement_phase3_tenant_hardening.sql` without corresponding ledger entries. Do not replay those historical files during a feature deploy: their shared plugin constraint/function replacements predate the later RingCentral `calls` migration. The independent forward Task workspace-activation migration is applied live as `20260724000851_task_workspace_plugin_activation`; reconcile only the older historical ledger through the documented maintenance procedure.

## Preview database cannot support workspace UAT

Vercel preview deployments use the separate Supabase project `qqvmcsvdxhgjooirznrj`, not production. Live inspection on 2026-07-24 found legacy `companies` and `tasks` tables but no `workspaces`, `workspace_plugins`, or `company_memberships`. A READY preview therefore proves the build artifact, not the workspace/Tasks business flow. Reconcile a staging database or create a reviewed Supabase branch before Rom's exact-candidate UAT; do not point unreviewed preview code at production data.

## Supabase flags intentional authenticated security-definer RPCs

The security advisor reports its generic warning for authenticated `SECURITY DEFINER` routines, including the operational-workspace management RPCs. Those reviewed routines require authenticated app access, use fixed search paths, revoke public/anonymous execution, and perform server-side company/workspace permission checks. Treat a change to those grants or checks as a security-sensitive migration; do not silence the advisor by removing the app's required authenticated execution.

## Planned navigation can look implemented

Tickets and Templates remain future navigation entries. Product or AI work must not report them as shipped without confirming implementation.

## Cron credential visibility is provider-scoped

The recycle-bin purge endpoint expects server-side authorization, but this folder intentionally cannot prove or expose the credential value. Confirm presence in Vercel environment configuration when changing the cron path or authorization behavior.

## Production email credentials and deliverability need one controlled UAT

The `send-company-invite` Edge Function, database delivery ledger, authorization, strict production-origin CORS, and unauthenticated rejection are live and verified. The project connector cannot list secret values, and this rollout intentionally did not email an existing pending invite, so `RESEND_API_KEY`, `EMAIL_FROM`, sender-domain verification, and inbox delivery are not yet proven end to end. Run one controlled invite to a team-owned mailbox before public launch; failure is recoverable because the invite link remains valid and the UI exposes retry/copy actions.

Supabase Auth email (registration, recovery, and verification) is a separate channel from the invite Edge Function. Confirm custom SMTP and branded Auth templates in the Supabase dashboard before public launch so Auth mail is not dependent on development/default sending limits.


## RingCentral status durations are approximate and reset on deploy

RingCentral's Presence API reports what an extension's status *is*, never how long it has
been held. The live board derives the duration from `ringcentral_presence.status_since`,
which the app sets the first time it observes a status change. Two consequences: every
timer restarts at zero the first time the module runs after a deployment or after the
table is cleared, and a status change occurring between two polls is timed from the poll
rather than the actual change. Accurate to roughly the 15-second poll interval. The UI
states this. Do not use these durations for payroll, billing, or any adjudicated purpose.

## The plugin allowlist in the database is ahead of this repository

`company_plugins_known_plugin_check` live contains `tasks`, added by work that is applied
to Supabase but still on the unmerged `feat/task-app-absorption` branch. The newest
allowlist migration in `supabase/migrations` does not. Any migration that rebuilds this
constraint by copying the newest file will silently drop `tasks` — and, because rows
already use it, fail on apply. This bit the RingCentral migration on its first attempt.

Read the live constraint out of `pg_constraint` before rewriting it, not the repository.

## The RingCentral cron interval may exceed the Vercel plan

vercel.json schedules `/api/ringcentral-sync` at `*/15 * * * *`. Sub-daily cron requires a
Vercel Pro plan; the only other cron in the project is daily. If a deployment rejects the
schedule, either coarsen it or trigger the same URL from Supabase `pg_cron` with the
`CRON_SECRET` bearer header. The endpoint, its authorization, and its tests are identical
under either trigger.

## The embedded Tasks iframe restarts on any full re-render

The Tasks route renders the vendored module as `<iframe src="/taskmanagement/app.html">`.
`render()` rebuilds `app.innerHTML` wholesale, so every full re-render destroys and
recreates that iframe, and the module reboots from its splash — losing in-progress edits,
scroll, and open panels. Two triggers are now handled: the auth-event echo (fixed — see
`supabaseSessionSignature` in src/main.js, which was a self-sustaining ~1.4/sec reload
loop that hung the module on its splash) and the boot splash itself (suppressed under
`?embed=1`). But `refreshRealtimeDomains()` and other `render()` callers still recreate the
frame whenever watched data changes underneath the user. The durable fix is to reuse the
existing iframe element across renders (detaching it blanks its document, so preserving the
node — not the innerHTML — is the only option) or to exempt the tasks route from full
re-render. Until then, a background realtime update can bump a user out of a task mid-edit.
