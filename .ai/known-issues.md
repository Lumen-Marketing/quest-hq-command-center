# Known issues and risks

Only confirmed, actionable items belong here. Resolved findings live in `current-state.md` and
`decisions.md`, not in this list.

## Supabase leaked-password protection still needs an owner session

The security advisor still reports `auth_leaked_password_protection`. Questbase already checks
new passwords against Have I Been Pwned with the k-anonymity range API, but the Supabase platform
control is separate and cannot be changed by a database migration. The connected Supabase tools
do not expose Auth configuration, and the available dashboard browser is signed out. A project
owner must enable the control under Authentication → Attack Protection, then rerun the security
advisor.

## A schema-current staging database does not exist

Production project `rqundirizvojpzhljtdn` has no development branch. The older preview project
`qqvmcsvdxhgjooirznrj` is not schema-current and cannot prove workspace business flows. A fresh
Supabase branch costs $0.01344/hour at the value quoted on 2026-09-03 and requires explicit cost
confirmation before creation. Until then, preview deployments prove the build artifact only.

## Production email delivery still needs controlled inbox UAT

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

The host now preserves the same embedded Tasks iframe through full Questbase shell renders, so
host notifications, clocks and preference changes no longer reboot it. The feature-flagged native
store is still not wired as the default. The AI assistant endpoint and any draft loss caused by a
reload inside the vendored Tasks application must be fixed in that separate application.

## Workspace SMS is intentionally unavailable

Outbound and inbound endpoints now return 501 before authentication, database access or provider
calls. Provider credentials alone cannot revive the old company-only routing model. Enabling SMS
later requires a chosen provider plus workspace-bound numbers, messages, contact resolution,
policies, delivery state and end-to-end tests. Until that coordinated release exists, the UI and
both endpoints remain fail-closed.

## Authenticated SECURITY DEFINER advisor findings are deliberate but sensitive

The security advisor reports 59 authenticated SECURITY DEFINER routines. Reviewed Questbase RPCs
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
