# Known issues and risks

## `tests/task-assignee-identity.test.mjs` fails on any Windows checkout (line endings)

Five of its twelve tests fail wherever `src/main.js` is checked out with CRLF, which is every
Windows clone: `core.autocrlf=true` is set and the repository has no `.gitattributes` to override
it. The tests locate code with `between(main, 'async function wbCreateTaskFromPost(', '\n}\n')`,
and `\n}\n` cannot occur in CRLF text, so `indexOf` returns -1 and the assertion reports
*"Missing source marker"* rather than anything about assignees. Reproduced on `origin/main` at
4b5eb14 (2026-09-26), so it arrived with PR #25, and it passes CI because CI checks out LF.

Consequence: `npm test` and therefore `npm run check` are red on Windows and green on CI for
reasons unrelated to the change under review. Nothing else in the suite is affected — the full
5276 tests pass under an LF checkout. Two ways out, both small: add a `.gitattributes` marking
`*.js text eol=lf` so the working tree is normalized regardless of `core.autocrlf`, or make the
`between()` helper match `/\r?\n}\r?\n/`. The first is the better fix because it also stops the
same class of bug appearing in future source-scanning tests, but it touches every file in the
repository and should be its own change. Until then, do not read a Windows `npm test` failure in
this file as a real regression.

## Task identity: one roster id can belong to several logins (structural, migration pending)

`tasks.assignee_id` / `creator_id`, the task RLS policies (`current_member_id()`), comments,
reactions, timers and notifications all key a person by `profiles.member_id` -> `team_members.id`,
a slug of the email local part. Production's `handle_new_user` has no collision suffix and no
unique index guards `profiles.member_id`, so every `info@` login shares `info` (verified
2026-09-23: `info@questroofing.com`, `info@questconstruction.com` and
`info@lumenmarketingusa.com`), and `sync_team_member_from_profile` lets the last-updated profile
overwrite the shared roster row's name, email, `active` and `company_ids`. Those logins can read
and edit each other's tasks inside shared workspaces. The UI stabilization of 2026-09-23 counts
work under a shared id on one "Shared login" row rather than crediting a person, and translates
profile ids to roster ids before writing; it does not fix the model. The fix is a trigger change,
a split of the shared id, then a unique index — each needs explicit approval. Record history
(`record_history.actor_profile_id`) is profile-keyed and is the evidence for attributing any
historical `info` row: all three `info` tasks in Quest Roofing were created by the Lumen login.

## "Needs review" means status only; the review/approval contract is undefined

Documented, deliberately unchanged. Three surfaces use three definitions:
- Task app **Needs review** view (#21): open tasks whose status is `review` (In review).
- Operational **health map**: counts `review` only.
- Questbase **Approvals** (`approvalItems`) and the operations task metrics: `review` **and**
  `pending`. `pending` is the default status, so every new task appears there as "Task review".
None of them records who must review, who approved, when, or against what evidence. Do not widen
or narrow any of them until the product defines the review/approval contract (reviewer, approver,
decision owner, required proof, outcome).

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

## Embedded Tasks access comes from Questbase only at the entry gate

Since 2026-09-22 a `'member'` legacy profile gets into embedded Tasks through the workspace's
`tasks.manage` / `tasks.view` (`task_access`). The app's role-name checks still use the legacy
role. So such a user sees every task RLS returns (not the worker-only filter), and never sees the
Delete button, although RLS lets `tasks.manage` delete. The host's `can()` answers at company
level while RLS checks the workspace, so a mismatch can show a control the database then refuses.
Nothing leaks either way; this closes when roles move off `profiles.role` entirely.

## Preview deployments point at the old standalone task database

Checked 2026-09-22 from each deployment's public `taskmanagement/env.json`: production
(`www.questbase.io`) serves `rqundirizvojpzhljtdn`, but the latest Vercel Preview deployment serves
`qqvmcsvdxhgjooirznrj`, the retired standalone TaskManagement project that must not be used or
mutated. The Preview environment's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` evidently still
name the old project, and both the host and the embedded Tasks app read those variables. So a
preview cannot sign in Questbase accounts, and anything tested there reads and writes the old
task data. Do not use previews for Questbase task or auth testing until someone with access to the
`abetheclosers-projects` Vercel team points the Preview variables at the Questbase project.

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

## TaskManagement email dispatch follow-up

Status: Known follow-up, not blocking Task Management V1 usability.

Context:
- Task Management V1 is usable.
- Test task creation, detail view, refresh persistence, and public.tasks persistence were confirmed.
- In-app notification worked.
- Email dispatch showed “Email not sent.”

Known source:
- Toast source: `taskmanagement/js/controllers/AppController.js:2058`
- The toast appears when email delivery returns a real failure, not when email is simply skipped.

Follow-up:
- Check the `notify-email` Supabase function logs.
- Check email provider settings in the Questbase Supabase project.
- Look for console line: `[notify] email delivery failed: …`
- HQ operations notes indicate email delivery checks were deferred on 2026-09-10.
