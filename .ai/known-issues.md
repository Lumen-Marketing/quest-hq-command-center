# Known issues and risks

## questbase.io signs a returning visitor in with no prompt (needs owner/device verification)

Reported 2026-09-22 by Abraham: typing questbase.io and hitting enter logged him straight in,
with no credential prompt. Found by reading, not reproduced.

`createSupabaseClient()` (src/main.js) calls `createSupabaseJsClient(CONFIG.supabaseUrl,
CONFIG.supabaseKey)` with no auth options, so it runs on supabase-js defaults:
`persistSession: true`, `autoRefreshToken: true`, session stored in `localStorage`.
`initializeAuth()` calls `client.auth.getSession()` on every load and silently restores any
valid, unexpired session it finds there — this is standard "stay signed in" behavior, not a
custom bypass. No demo/bypass code path was found in `signInWithPassword`, `signInWithOAuth`,
or the OAuth redirect handling; the only non-Supabase auth mode is the explicit `local-basic`
demo session, unrelated unless that is what was active.

This is very likely a persisted session on a device Abraham has signed into before, which is
expected behavior, not a hole — but that has not been confirmed. Do not change session
persistence, token lifetime, or add a "remember me" gate until it is confirmed whether this
happened on a device/browser he had genuinely never signed into. If so, this becomes a
security-posture product decision (shorter session/refresh-token lifetime, or an opt-in
persistence toggle), not a quick patch.

To settle it: ask whether it was his own previously-used browser/device and whether he had
ever clicked Sign out there. No code change should be proposed until that is answered.

## Typing into a field can silently wipe what was just typed (code-grounded, not yet live-reproduced)

Reported 2026-09-22 by Abraham. Found by reading; matches an already-fixed bug class in this
same codebase, not reproduced live.

The app does a wholesale re-render (`render()` rebuilds `app.innerHTML` from state) on many
triggers; anything mid-typing lives only in the DOM, so a re-render at the wrong moment erases
it silently. This exact failure was already found and fixed twice — `src/main.js` around
`shouldDeferRealtimeRefresh` / `renderWouldInterrupt` / `anEditableIsFocused` (lines
45637–45797) names the symptom verbatim: "a colleague opening the app in another tab used to
wipe whatever was typed into an open form... the field I entered suddenly disappeared... it
looked random." The fix defers the render (retrying ~1.5s later) whenever
`document.activeElement` is an `INPUT`/`TEXTAREA`/content-editable. It is applied at exactly
two call sites: the presence-channel handler and the realtime-domain-refresh handler
(`src/main.js`, `src/data/realtime-policy.js`).

It is **not** applied in `src/workspace/record-events.js`, the reminder/notification poller
run every 60 seconds by `wbEventsPoll`. Both its `render()` calls — line 144 (first data load)
and line 210 (a due reminder fires) — are unconditional, with no `anEditableIsFocused()` check.
This fits the "random"-feeling report: it only surfaces when the poll finds something to
announce while the user happens to be typing, an intermittent overlap rather than a
consistent repro.

Files inspected: `src/workspace/record-page.js`, `src/main.js` (`shouldDeferRealtimeRefresh`,
`renderWouldInterrupt`, `anEditableIsFocused`), `src/data/realtime-policy.js`,
`src/workspace/record-events.js`.

To reproduce: create a `wb_record_events` row due within the next minute for a test company,
open any record, and type continuously into any field for 60+ seconds without clicking away;
if the field clears or reverts mid-type, that confirms this path.

Safe fix path: wrap both `render()` calls in `record-events.js` with the same
`renderWouldInterrupt()` gate already used in `main.js` (defer and retry ~1.5s if an editable
element is focused), passed into the module the same way `render` already is. Small and
directly precedented by the two existing fixes — recommended branch:
`fix/record-events-render-guard`. Not applied here; this entry is diagnosis only.

If the eventual live repro doesn't match (different field, different timing), the next
suspect is another still-unguarded `render()` call site elsewhere in the app rather than this
one.

## The in-app company delete may abort on the system-role guard (unverified)

Found by reading, not reproduced. `delete_company_workspace` deletes the company row and lets
`roles` and `company_memberships` cascade. `app_private.guard_system_role` refuses to delete the
Owner and Member system roles unless `is_company_owner()` holds for the caller — and that reads the
caller's active owner **membership**. If the membership rows cascade away before the roles do, the
guard sees no owner and raises *"Owner and Member are the roles every company starts with and
cannot be deleted"*, rolling the whole delete back.

Whether that happens depends on the order Postgres fires the two cascades, which was not checked:
the catalog query to confirm it was declined on 2026-09-15. The routine was written in July, before
the guard existed, so it was never exercised against it. When company `111` was deleted the same
day, the roles were removed explicitly first to avoid the question.

To settle it: as an Owner of a disposable company with no business data, press Delete company in
the app. If it fails with that message, delete `roles` for the company before the `companies` row
inside the routine, while the owner membership still exists.

## The purge ledger has no stage for a failed row delete

Narrowed on 2026-09-19. The nightly recycle-bin purge removes an item's file, then deletes its row.
Those are two different failures, and until that date both were reported as `storage_remove` /
`storage_remove_incomplete` -- naming a bucket that was fine. `api/recycle-bin-purge.js` now keeps
the two apart and reports `unexpected` / `unexpected_failure` when the row is the half that refused,
which is vague but true, and the response carries `failed_row_deletes` separately from
`failed_file_items`.

What remains is the accurate value. `maintenance_job_runs` was written for the form-upload purge,
which never deletes a row, so its CHECK vocabulary has nothing that means one refused to. Adding
`row_delete` and `row_delete_incomplete` is a migration, and `npm run tenancy:check` refuses any
migration dated after `database/snapshot.json`'s capture (2026-09-17) while refreshing that snapshot
needs live catalog access. The migration is written and waiting at
[maintenance-ledger-row-delete-stage.proposed.sql](plans/maintenance-ledger-row-delete-stage.proposed.sql),
with its apply order: it is additive, so it lands before the client that writes the new values.

The item itself does not linger in a half state: `purge_expired_recycle_bin` skips a file item while
its object still exists and purges the row once it is gone, so the sweep in the same run clears it.

## Physical form-upload removal still needs a controlled fixture

Rechecked 2026-09-10 (QB-RV-07): Vercel runtime logs confirm a scheduled GET returned 200.
The bucket, upload-intent ledger and 48-hour candidate query currently contain zero entries.
The new service-only maintenance ledger provides selected/deleted counts and sanitized outcomes;
its grants and bounded retention, including interrupted runs, passed rollback-only live probes.
Nine runtime tests exercise exact-path, partial-result and error behavior. Production credential
exports were empty in this session, so the opt-in physical Storage fixture could not run. Do not
describe an empty-bucket run as proof of real removal. The scoped fixture script is
`scripts/verify-form-upload-purge-storage-fixture.mjs`; it requires `--live-storage-fixture`, the
verified project and a server-only key. No customer object is a test fixture.

## Contacts merged before 2026-09-05 may have stranded rows

Rechecked on 2026-09-10: eight contacts archived before September 5 still exist. References
include nine jobs, one task, five deals, three proposals, six sites and two underwriting cases;
activities have 98 contact-column references and 18 related-record references (these may overlap).
These counts do not prove that the contacts were merged rather than intentionally archived.
No merge event identifies their intended survivors. Only two archived contacts have a current
same-workspace email/phone candidate, which is not enough to authorize relinking history.
The rows remain intact. Repair requires an explicit survivor mapping; do not choose by name,
email or phone alone. Previously purged cascading data cannot be reconstructed from this audit.

## Recent-activity feeds remain intentionally bounded

Full record directories and selected chat history now page beyond the API row cap. The feeds
that explicitly present recent activity remain bounded: activities and client-portal events at
500, notifications and workspace-transfer history at 200, and audit events at 100. If any of
those surfaces becomes an archive rather than a recency feed, it needs a dated/cursor history
view rather than silently raising the global startup cost.

Only confirmed, actionable items belong here. Resolved findings live in `current-state.md` and
`decisions.md`, not in this list.

## Legacy trash recovery is complete; stale clients may reintroduce old copies

QB-RV-06 recovery applied 2026-09-10: 91 document entries were proved before removal: 86 exact
archived-row copies and five distinct snapshots. The five received new recoverable IDs, raw
source-stamp provenance and at least 30 more days in the bin. All 156 existing records remained
byte-for-byte unchanged, including 62 live records; trash rows increased from 94 to 99. The
repeat dry-run found no remaining eligible document entries. No record was purged.

An older open client can later resave a stale document. The service-only reconciliation function
can safely recheck it using exact payloads and the recovery map; it is not an automatic trigger.
If a mapped recovered row has subsequently changed, been restored or been purged, reconciliation
preserves the unmatched document entry for review instead of guessing or creating another copy.

## Leaked-password protection cannot be enabled on the free plan

The security advisor reports `auth_leaked_password_protection` as a WARN, and it cannot be cleared
from where the project is today. Supabase gates the setting behind Pro ("Leaked password
protection is available on the Pro Plan and above"), and the `Lumen` organization is on `free`, so
it is absent from the dashboard and rejected by the Management API alike. Confirmed 2026-09-09.

Nothing in the repository can fix it and no migration will. Either upgrade the organization, in
which case enable it under Authentication and the advisor clears, or accept the finding knowingly.
It is recorded here so the next person auditing production does not spend time hunting for a
toggle that is not there.

Backup and restore coverage is a separate operational check. A plan change alone is not proof
that point-in-time recovery has been enabled or that a restore has been tested.

## A schema-current staging database does not exist

Production project `rqundirizvojpzhljtdn` has no development branch. The older preview project
`qqvmcsvdxhgjooirznrj` is not schema-current and cannot prove workspace business flows. A fresh
Supabase branch costs $0.01344/hour at the value quoted on 2026-09-03 and requires explicit cost
confirmation before creation. Until then, preview deployments prove the build artifact only.

## Production email delivery still needs controlled inbox UAT

Deferred by the user on 2026-09-10 (QB-RV-08); no test emails were sent in that pass.

The invite/support Edge Functions, database delivery ledger, authorization, CORS, retry and copy
fallbacks are live. Supabase Auth registration/recovery mail is a separate channel. Final inbox
arrival, sender-domain reputation, custom SMTP and spam placement require designated team-owned
recipient mailboxes; no existing customer or pending invite should be used as a probe.

## The main JavaScript and stylesheet remain large

The entry bundle budget passes. On 2026-09-03, contact dedupe and CSV parsing moved behind the
controls that use them, reducing the entry from 363.21 KiB to 362.93 KiB gzip. `src/main.js` and
`src/styles.css` remain performance and maintainability risks. Continue measured, route-scoped
extractions and keep the bundle guard; do not trade a smaller entry for an eager request waterfall.

## Native Tasks remains feature-flagged and the vendored app has separate work

The host preserves the same embedded Tasks iframe through full Questbase shell renders without
removing or reparenting it, so host notifications, clocks and preference changes do not reboot
its browsing context. The feature-flagged native
store is still not wired as the default. The AI assistant endpoint and any draft loss caused by a
reload inside the vendored Tasks application must be fixed in that separate application.

## Workspace SMS is intentionally unavailable

Outbound and inbound endpoints now return 501 before authentication, database access or provider
calls. Provider credentials alone cannot revive the old company-only routing model. Enabling SMS
later requires a chosen provider plus workspace-bound numbers, messages, contact resolution,
policies, delivery state and end-to-end tests. Until that coordinated release exists, the UI and
both endpoints remain fail-closed.

## Authenticated SECURITY DEFINER advisor findings are deliberate but sensitive

The security advisor reports authenticated SECURITY DEFINER routines. Reviewed Questbase RPCs
pin their search paths, revoke anonymous/public execution where appropriate and perform server-side
company/workspace checks. Do not silence this broad advisor category by removing required app
execution. Any new or changed routine still needs an individual owner, grant, search-path and
authorization review.

## Migration identifiers do not always match repository filenames

Supabase records provider-generated apply timestamps, so an applied ledger version may differ from
its repository filename. Compare migration names and live object shape, not timestamps alone. Two
historical Task delta migrations also have live effects without matching ledger rows; do not replay
them into production.

## Remote branches need owner decisions, not automated deletion

Audited 2026-09-03 after `git fetch --prune`: 22 named remote branches exist besides `main`.
Nineteen are fully merged. Three retain commits not on `main` and were deliberately preserved:

- `docs/code-review-d050fd9`: 1 unique documentation commit.
- `feat/task-setup-back-button`: 1 unique UI commit.
- `quest-hq-command-center-for-deployment`: 3 unique commits from the older deployment line.

No remote branch was deleted. Archive merged branches only as an explicit repository-maintenance
operation, and review the three unique lines before any deletion.

## Appearance choices intentionally stop at the embedded-app boundary

Theme and accent propagate to the same-origin Tasks app. Background uploads/patterns and card
solid/glass styling remain host-only because Tasks owns its internal surfaces. A few older dark-mode
subsystems still redeclare the orange token locally and therefore have reduced accent reach.

## RingCentral status durations are approximate

Presence reports current status, not the moment it changed. Questbase derives duration from the
first poll that sees a status and resets that observation after deployment/table cleanup. Accuracy
is roughly the poll interval and must not be used for payroll, billing or adjudication.

## Some permission aliases remain intentionally broad

`messages.manage`, `company_contacts.manage` and `settings.manage` still satisfy documented
narrow permissions. This means unticking a narrow permission does not remove it while its broad
parent remains granted. If product wants every narrow checkbox authoritative, use a data migration
that grants explicit keys before removing the alias; do not change only the client check.

## The historical portal sign-in report has no reproducible account residue

The reported “Invalid login credentials” after invite registration could not be matched to an
unconfirmed or never-signed-in Auth user. Error wording was corrected because Supabase uses the
same message for several causes. If it recurs, capture the account email and exact time so Auth
audit rows can identify the real branch.

## Historical suspicious clock rows require human review

New sub-minute sessions are discarded and new sessions over sixteen hours require confirmation.
Existing suspicious rows are flagged but not rewritten because the correct timestamps cannot be
reconstructed safely. Corrections belong in an audited owner workflow.
