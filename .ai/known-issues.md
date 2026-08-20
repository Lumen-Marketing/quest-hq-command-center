# Known issues and risks

Only confirmed, actionable items belong here.

## Main browser bundle remains large

Vite still emits a large-chunk advisory for the primary application bundle. The repository bundle-budget check passes, and Leaflet/PDF.js plus the RingCentral calls runtime are lazy-loaded, but src/main.js remains a performance and maintainability risk. Measure production behavior before splitting and retain the budget guard.

## The strict CSP target is still report-only

Production enforces a compatible CSP baseline, but the tighter target remains report-only because
the current PDF/ZIP toolchain needs eval/wasm behavior and Tasks is a same-origin frame. Review
violation reports and replace or reconfigure those dependencies before removing the compatibility
exceptions; tightening the header without verifying those flows can blank Tasks or break document
work.

## Leaked-password protection is an owner dashboard setting

The Supabase security advisor still reports leaked-password protection as disabled. It cannot be
enabled by a repository migration. A project owner must enable it in Supabase Auth settings and
then rerun the security advisor; application code must not claim that control is active first.

## Tasks write store has rollback concurrency footguns (unwired)

src/tasks/task-store.js is not yet wired into src/main.js, so these are latent, but must be resolved before wiring it into the native Tasks surface:

- `all()` returns the internal `tasks` array by reference; `put()` mutates in place while `seed()` and the error rollback reassign (`tasks = snapshot`). A caller holding a cached `all()` reference can keep a phantom optimistic task after a rollback. Fix by returning a copy from `all()` or restoring in place.
- `save()` captures a whole-array `snapshot` per call and rolls back with `tasks = snapshot`. Two overlapping saves (or a save racing a `seed()` refresh) can let a failed save discard another save that already committed. Scope rollback to the affected row, or serialise writes, before relying on it under concurrency.

## Browser code and styling are monolithic

Most product behavior is concentrated in src/main.js and most styling in src/styles.css. Broad edits can create cross-module regressions, so use focused changes and full checks until module boundaries are deliberately extracted.

## Workspace SMS remains intentionally disabled

The committed SMS send and inbound endpoints still use the earlier company-only routing model. The P0 readiness endpoint has a separate code-level backend contract fixed at closed, so provider credentials or partially created workspace columns cannot expose the contact Messages UI. A later coordinated migration must make outbound number selection, inbound number routing, contact resolution, message persistence, policies, and tests workspace-safe before that contract is opened.

## Migration identifiers differ between repository and live ledger

Supabase records provider-generated applied versions, so the repository filenames `202607211200_company_operational_workspaces.sql` and `202607211230_workspace_tenancy_advisor_hardening.sql` appear live as versions `20260721002147` and `20260721002417`. Always verify live objects and migration intent rather than comparing filename timestamps alone.

The live catalog also contains the effects of `202607221400_taskmanagement_phase2_runtime_delta.sql` and `202607221600_taskmanagement_phase3_tenant_hardening.sql` without corresponding ledger entries. Do not replay those historical files during a feature deploy: their shared plugin constraint/function replacements predate the later RingCentral `calls` migration. The independent forward Task workspace-activation migration is applied live as `20260724000851_task_workspace_plugin_activation`; reconcile only the older historical ledger through the documented maintenance procedure.

The EOD Reports migration is now present as `202607301200_eod_reports.sql`, while the provider ledger records the applied version as `20260730175234_eod_reports`. Its trigger helper currently produces a Supabase advisor warning because `touch_eod_report_updated_at()` is SECURITY DEFINER and executable by anon. This predates the P0 migrations and should be reviewed as separate EOD hardening work.

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

## Appearance customization is per-browser and cannot reach the Tasks iframe

Settings → Appearance (theme, accent, background pattern/upload, card solid/glass) stores choices in
`localStorage` and applies them as CSS variables + `data-*` attributes on `<html>`, so they survive
the full `render()` rebuilds without reapplying. Two scope limits: the embedded Task-management view
is an `<iframe>` (a separate document) and cannot inherit the host page's background/card styling; and
the accent picker mainly affects light mode, because the dark-mode palette block re-hardcodes
`--orange` after the `[data-accent]` blocks. Widening either requires, respectively, passing the
appearance into the iframe (URL param / postMessage) and having dark mode derive `--orange` from the
accent rather than hardcoding it.

## Storage buckets need a SELECT policy for uploads to succeed

Profile picture uploads failed for every signed-in user with "new row violates row-level
security policy" (HTTP 400 from storage). The `avatars` bucket had INSERT, UPDATE and
DELETE policies but no SELECT policy. The Storage API reads the object row back as part of
an upload, so that read was denied and the request failed even though the write was
permitted. Fixed in `202607301000_avatar_object_read_policy.sql`.

The multi-recipient Notifications path has the same split visibility: it may insert rows for
other active members, while the caller can SELECT only its own recipient row. It therefore
inserts without `RETURNING`, returns its locally-created rows, and merges only the current
profile's row into the local inbox. When adding a bucket or a table whose rows are written
then read back, check the SELECT path as well as the write path; a public bucket does not
need a SELECT policy for public reads (`/object/public/...` does not consult it) but does
need one for the upload read-back.

## Stale remote branches

Audited 2026-07-31 at revision 972dffa4. Nineteen remote branches exist; seventeen are
fully merged into `main` (zero unmerged commits) and are safe to archive or delete
whenever the owner wants — several date back to June.

Two carry commits that are NOT on `main`, so neither should be deleted without a decision:

- `docs/code-review-d050fd9` — one commit from 2026-06-23 adding `report.md`, a 95-line
  code review of a revision that is now months old. Almost certainly disposable, but it is
  the only copy of that review.
- `quest-hq-command-center-for-deployment` — three commits from early July touching 29
  files (+7,784 / -1,141): dark theme surfaces, CRM/Jobs Kanban, quote line items, an
  activity modal, client portal pan/zoom, Price Book, and a `vercel.json` change. This is
  a substantial parallel line of work. Whether it was superseded by later work on `main`
  or genuinely never landed needs a human to judge; deleting it would discard the only
  copy of that code.

No branch was deleted. Deleting a remote branch is not recoverable from the local clone
once the reflog expires, and the two above are exactly the cases where that would matter.

## The embedded Tasks app cannot be fixed from this repository

Two QA items land inside the vendored task app, not in Questbase:

- The AI assistant endpoint. `ai-assistant` is not in this repository at all.
- A task draft lost when the surface reloads.

Tasks is a same-origin `<iframe>` to a separate application. Nothing in `src/` can change
either behaviour; they need a change in that app and a redeploy of it. They are recorded
here rather than closed so they do not get re-tested against this codebase and re-filed.

## The portal sign-in failure has no reproduction and no residue

Reported as: after registering from an invite link, signing in answers "Invalid login
credentials". Audited 2026-08-08 against live `auth.users`: 11 accounts, zero unconfirmed,
zero that have never signed in, and every one confirmed within two seconds of creation --
the signature of auto-confirm being ON. So the "confirm your email first" path is not the
cause, no account was left in a state that could produce the report, and both the sign-up
and sign-in forms trim the email identically, so there is no case or whitespace asymmetry
between them either.

What was fixed is the wording, which was genuinely wrong: Supabase returns that same
sentence for a wrong password, an unknown address AND an unconfirmed account, and both call
sites passed it through verbatim. The mechanism behind the original report remains unknown.
If it recurs, capture the exact email address and the time, because that is what would let
the `auth.audit_log_entries` rows be matched to it.

## Notifications INSERT is deliberately membership-scoped

The tenant policy audit (see `current-state.md`, `202608081200`) flags one remaining write
policy gated on membership alone: `notifications` INSERT. That is intended. A member may
create a notification addressed to another ACTIVE member of the same company and nobody
else, which is what makes peer notifications work. Do not "fix" it without replacing the
feature.

## Deleting a Company Contacts field is a hard delete with no undo

Confirmed 2026-08-15.

The trash icon on a field row in Settings > Fields marks it in `fieldDraft.removed`, and Save runs
`delete from company_contact_fields where id in (...)`. There is no `deleted_at` on that table and
no recycle-bin entry, so the field definition is gone the moment Save succeeds — including its
label, its type and a category's whole option list.

The CONTACT DATA survives: `company_contacts.field_values` is keyed by field id and is never
touched by the delete. But with the definition gone the values are invisible and unreachable —
the directory has no column for them and the card has no row.

This bit on 2026-08-15: `quest-roofing-az` reached 0 field definitions with 17 contacts still
holding values against 11 distinct field ids. Recovery was possible only because the ids are
deterministic for seeded fields (`ccf-<company>-<slug>`) and the values themselves reveal the
type — re-inserting the definitions with their ORIGINAL ids made all 17 contacts whole again.

**If it happens again:** do not recreate the fields through the UI. A new field gets a new id and
the old values stay orphaned. Instead read the surviving ids out of `field_values`

```sql
select kv.key, count(*), min(left(kv.value #>> '{}', 40))
from public.company_contacts cc, lateral jsonb_each(coalesce(cc.field_values,'{}'::jsonb)) kv
where cc.company_id = '<company>' group by kv.key order by 2 desc;
```

then re-insert `company_contact_fields` rows using those exact ids, inferring the type from the
sample values and rebuilding a category's options from the distinct values in use.

**Worth fixing properly:** the table should carry `deleted_at` and join the recycle bin, the way
records already do. Until then a mis-click plus Save is unrecoverable through the product.
