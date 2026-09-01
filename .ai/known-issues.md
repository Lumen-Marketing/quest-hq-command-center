# Known issues and risks

Only confirmed, actionable items belong here.

## Six app_private helpers still carry pg_temp in their search path

Confirmed 2026-08-28, after `20260828004405_revoke_anon_execute_app_private.sql`.

`chat_attachment_visible`, `chat_left_at`, `chat_message_visible`, `guard_system_role`,
`guard_wildcard_permission`, `companies_seed_task_taxonomy` and `seed_company_default_roles`
are SECURITY DEFINER with `search_path = 'public', pg_temp'`. `20260828002845` fixed the same
inconsistency for `is_company_member` and `has_company_permission`, which were safe to rewrite
because every reference in them was already schema-qualified and both are exercised by tests.

These were left alone deliberately. Three are trigger functions and three are RLS helpers; none
has direct test coverage, and rewriting a definer body blind is how a policy quietly starts
returning the wrong answer. `pg_temp` last in the search path is the defensive position rather
than the dangerous one, and anon can no longer execute any of them.

Fix by reading each body, schema-qualifying anything that is not already, and moving it to
`search_path = ''` one function at a time with a live probe between each.

## Rate limiting is durable on the endpoints that need it

RESOLVED 2026-08-28 by `20260828005040_durable_rate_limits.sql`. The in-memory limiter is still
per serverless instance and still resets on a cold start -- that is fine for throttling, and it
remains the only limiter on the endpoints that merely need throttling. The six endpoints where a
secret is guessed now also count in Postgres. See .ai/decisions.md.

The comment in `api/wb-intake-open.js` saying the limiter "cannot be relied on alone" is still
accurate and still the reason the per-link lockout exists; it is simply no longer the only
backstop.

## Two applied migrations have no file in this repository

RESOLVED 2026-08-28: both were recovered verbatim from
`supabase_migrations.schema_migrations.statements` and committed as
`20260826195655_company_contact_field_recycle.sql` and
`20260826195939_company_contact_permission_reconcile.sql`. They are already applied in
production and must not be re-applied there; they exist so a fresh environment rebuilds the
schema production actually has. The original finding is kept below because the CLASS of problem
is not fixed -- DDL can still be applied through a path that does not commit the file.

Confirmed 2026-08-28 against the live migration ledger.

`supabase_migrations.schema_migrations` contains two versions with no counterpart under
`supabase/migrations`:

- `20260826195655_company_contact_field_recycle`
- `20260826195939_company_contact_permission_reconcile`

Their effects are live and visible: `company_contact_fields` now carries `deleted_at` and
`deleted_by`, and its three policies gained a `deleted_at is null` predicate. Rebuilding the
database from this repository would therefore produce a DIFFERENT schema from production —
the field recycle bin would simply not exist, and any migration written against those columns
would fail on a fresh environment.

This is the mirror image of the plugin-allowlist entry below, where the repository was ahead
of live. Both come from the same root cause: DDL applied through a path that does not also
commit the file. Reconcile by exporting both migrations from the live ledger and committing
them with their recorded versions; do not re-apply them.

## The Company Contacts field delete now has a recycle path (entry below is stale)

The "Deleting a Company Contacts field is a hard delete with no undo" section further down
described the state before `20260826195655_company_contact_field_recycle`. Live now has
`deleted_at`/`deleted_by` on `company_contact_fields` and policies that filter on them.
The recovery procedure in that section is still the right one for values orphaned BEFORE the
change; the "no undo" claim is no longer true for deletions made after it. Rewrite that
section once the missing migration file is committed and the UI path has been re-tested.

## The SMS tables do not exist in production

Confirmed 2026-08-28. `sms_messages` and `sms_numbers` are absent from
`information_schema.tables`, while `api/sms-send.js` and `api/sms-inbound.js` both read and
write them. Those endpoints cannot work as written; every call would fail at PostgREST.

This makes the workspace-SMS entry below more dormant than it reads: the feature is not merely
gated by a provider key and a readiness contract, it has no schema. Treat "finish the
workspace-safe SMS migration" as including the base tables, and note that the committed
endpoints are dead code against the current database until it lands.

Separately, and independent of the missing tables: `sms-send` authorizes on company membership
alone (`isActiveMember`), so once those tables exist it would let a member of one workspace
text a contact belonging to another. Fix the authorization at the same time as the schema.

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

## Native Tasks write store concurrency risks are resolved (still unwired)

RESOLVED 2026-09-02 in `src/tasks/task-store.js`. `all()` now returns a copy, and a failed
optimistic write rolls back only its own task instead of restoring a whole-list snapshot that
could erase another completed write. Unit coverage holds one write open, completes a second,
then fails the first and proves the successful task remains saved.

The store is still not wired into `src/main.js`; the default embedded Tasks surface is unchanged.

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

## Appearance customization is per-browser; Tasks receives theme/accent only

Settings → Appearance (theme, accent, background pattern/upload, card solid/glass) stores choices in
`localStorage` and applies them as CSS variables + `data-*` attributes on `<html>`, so they survive
the full `render()` rebuilds without reapplying. The same-origin Task-management iframe now receives
the resolved light/dark theme and accent tokens at boot and whenever either choice changes.

Background patterns/uploads and card solid/glass styling remain host-only by design: the embedded
Tasks document owns a separate layout and applying those surface rules across it would make its
internal panels inconsistent. The accent picker also still has reduced reach on a few host dark-mode
subsystems that locally re-declare `--orange`.

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

## A broad permission must not silently satisfy a narrow one

Reported from production 2026-08-28: a worker with "Delete app records" unticked deleted a
record anyway.

The cause was a compatibility alias. When `workspaces.records.*` was introduced,
`workspaces.manage` was made to satisfy create/edit/delete and `workspaces.view` to satisfy
view, so that no role lost access the moment the keys existed. The intent was right; the
mechanism made the four checkboxes non-authoritative. A role with "Create/edit workspace apps"
still ticked kept every record power whatever the record boxes said, so the permissions screen
showed a state the database did not honour.

`20260828040051` replaced the rule with data: every role that relied on a broad key was granted
the specific keys once, and the aliasing was removed from both
`app_private.has_workspace_permission` and PERMISSION_ALIASES. The screen and the database now
agree.

**The general lesson, which applies to the aliases that remain.** `messages.manage` /
`messages.manage_groups`, the four `company_contacts.*` keys under `company_contacts.manage`,
and `workspaces.settings.manage` under `settings.manage` are all still aliased. Each is
defensible -- `company_contacts.manage` is documented as the deliberate "everything" grant --
but each has the same property: unticking the narrow box does nothing while the broad one is
ticked. If any of those is ever reported the same way, the fix is the same shape, and it is a
data migration rather than a rule change.

A permissions screen is a promise about what the database will do. An alias that survives an
explicit untick breaks that promise quietly.

## Historical suspicious clock rows require human review

Clock entries under one minute or over sixteen hours now carry visible warnings. New sub-minute
sessions are discarded and new long sessions require confirmation, but existing rows are not
automatically altered because the correct timestamps cannot be reconstructed safely. An owner who
confirms an entry is wrong must correct it through an audited time-entry workflow; no bulk rewrite
is part of the 2026-09-01 QA cleanup.
