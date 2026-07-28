# Known issues and risks

Only confirmed, actionable items belong here.

## Main browser bundle remains large

Vite still emits a large-chunk advisory for the primary application bundle. The repository bundle-budget check passes, and Leaflet/PDF.js are lazy-loaded, but src/main.js remains a performance and maintainability risk. Measure production behavior before splitting and retain the budget guard.

## Tasks write store has rollback concurrency footguns (unwired)

src/tasks/task-store.js is not yet wired into src/main.js, so these are latent, but must be resolved before wiring it into the native Tasks surface:

- `all()` returns the internal `tasks` array by reference; `put()` mutates in place while `seed()` and the error rollback reassign (`tasks = snapshot`). A caller holding a cached `all()` reference can keep a phantom optimistic task after a rollback. Fix by returning a copy from `all()` or restoring in place.
- `save()` captures a whole-array `snapshot` per call and rolls back with `tasks = snapshot`. Two overlapping saves (or a save racing a `seed()` refresh) can let a failed save discard another save that already committed. Scope rollback to the affected row, or serialise writes, before relying on it under concurrency.

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

The `send-company-invite` version 3 and `report-problem` version 7 Edge Functions, database delivery ledger, custom authorization, strict production-origin CORS, and unauthenticated invite rejection are live and verified. Invite messages now include HTML and plain-text bodies. The project connector cannot list secret values, and this rollout intentionally did not email an existing pending invite or submit a support report, so `RESEND_API_KEY`, `EMAIL_FROM`, sender-domain verification, inbox delivery, and the final report notification path are not yet proven end to end. Run one controlled invite and one controlled support report using team-owned accounts before public launch; invite failure is recoverable because the link remains valid and the UI exposes retry/copy actions.

Supabase Auth email (registration, recovery, and verification) is a separate channel from the invite Edge Function. Confirm custom SMTP and branded Auth templates in the Supabase dashboard before public launch so Auth mail is not dependent on development/default sending limits.

## Owner-controlled commercial launch inputs remain open

The software-side pilot preparation does not choose the company's bank/payment provider, prices and included limits, refund rules, legal text, billing contact, or public support promises. Capture those decisions through `docs/operations/provider-handoff.md` before enabling paid public onboarding.


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

## Explicit full host renders can still restart the embedded Tasks iframe

The Tasks route renders the vendored module as `<iframe src="/taskmanagement/app.html">`.
`render()` rebuilds `app.innerHTML` wholesale, so every full re-render destroys and
recreates that iframe, and the module reboots from its splash — losing in-progress edits,
scroll, and open panels. Three high-frequency triggers are now handled: the auth-event echo (fixed — see
`supabaseSessionSignature` in src/main.js, which was a self-sustaining ~1.4/sec reload
loop that hung the module on its splash), the boot splash itself (suppressed under
`?embed=1`), and background realtime refreshes. `refreshRealtimeDomains()` still loads and
persists fresh host state, but now skips the full-shell render when the embedded frame is
already mounted. Explicit `render()` callers can still recreate the frame while the user
remains on Tasks. The durable end state is to reuse a persistent iframe host across shell
renders or finish the native Tasks migration; until then, review new asynchronous render
callers for whether they can fire while Tasks is open.

## Operational-workspace default and uploaded icon do not persist in live mode

The Company-settings "Workspace directory" lets an admin **set a default workspace** and **upload a
custom workspace icon/image** (in addition to picking a built-in icon). Both take effect immediately
in session state and persist under the local fallback, but the live RPCs
`create_operational_workspace` and `update_operational_workspace` accept only `icon_key` and
`status` — there is no column or parameter for an uploaded image or a set-default action. On a live
Supabase session these two changes therefore do **not** survive a reload. A reviewed migration adding
a `workspaces.icon_image` column and a `set_default_operational_workspace` RPC (plus threading
`icon_image` through the create/update RPCs) is required before they persist for the team. The client
already stores `icon_image` on the normalized workspace and applies the default flag optimistically.

## Appearance customization is per-browser and cannot reach the Tasks iframe

Settings → Appearance (theme, accent, background pattern/upload, card solid/glass) stores choices in
`localStorage` and applies them as CSS variables + `data-*` attributes on `<html>`, so they survive
the full `render()` rebuilds without reapplying. Two scope limits: the embedded Task-management view
is an `<iframe>` (a separate document) and cannot inherit the host page's background/card styling; and
the accent picker mainly affects light mode, because the dark-mode palette block re-hardcodes
`--orange` after the `[data-accent]` blocks. Widening either requires, respectively, passing the
appearance into the iframe (URL param / postMessage) and having dark mode derive `--orange` from the
accent rather than hardcoding it.
