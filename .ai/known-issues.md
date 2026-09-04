# Known issues and risks

Only confirmed, actionable items belong here. Resolved findings live in `current-state.md` and
`decisions.md`, not in this list.

## The soft-delete migration is written but not applied, and the tenancy gate is red until it is

`supabase/migrations/20260904120000_wb_records_soft_delete.sql` exists in the tree and the client
is already repointed at it. Nothing has been applied to production, so:

- `npm run tenancy:check` **fails**, correctly: the snapshot was captured 2026-09-03 and one
  migration has landed in the tree since, so a green matrix would be a false assurance. It cannot
  be refreshed until the migration is applied, because the snapshot is read from live metadata.
- `npm test`, `npm run build`, the bundle budget and `npm run ai:check` all pass.

Order to apply, and it matters: the migration COPIES each `app.trash` entry into `wb_records`
rather than moving it, exactly as the 2026-08-28 records migration did, so an old tab open during
the deploy cannot lose anything. Apply the migration, refresh
`.ai/database/snapshot.json` from live, re-run the tenancy gate, then deploy the client — which is
the release that starts stripping `app.trash` from the document.

Two things to verify in production afterwards, both cheap and both destructive if wrong:

- `select count(*) from public.wb_records where deleted_at is not null;` should match the number
  of entries the documents held, and every `purge_after` should be ~30 days out — no backfilled
  row may carry a `purge_after` in the past.
- `select public.purge_expired_wb_records(1);` should return 0 on the day of the deploy.

## The old entry, kept for its reasoning: deleted records outside the workspace boundary

RESOLVED IN THE TREE by the migration above; this stays until that migration is applied, because
until then it is still true of production.

Live records are rows in `wb_records`, gated per workspace by
`has_workspace_permission(workspace_id, 'workspaces.records.view')`. Deleted ones stay in
`app.trash` inside `workspace_builder_state.doc`, whose select policy is company-level:
`is_company_member(company_id) and subscription_allows_access(company_id) and
has_company_permission(company_id, 'workspaces.view')`. `stripDocRecords` and
`docWithoutRecords` blank `app.items` before upload and deliberately do not touch `app.trash`.

So deleting a record widens who may read it: a member of one workspace can read every record ever
deleted from a sibling workspace in the same company, in the document the browser downloads at
sign-in. The equivalent for deleted FIELDS was fixed on 2026-09-04 by leaving their values on the
records; records themselves need one of two decisions, neither of which should be taken silently:

- **Soft-delete in `wb_records`** — a migration adding `deleted_at` / `deleted_by`, plus RPCs for
  bin, restore and purge so that binning keeps needing `workspaces.records.delete` rather than
  becoming an ordinary `records.edit` UPDATE. The correct shape, and a production schema change
  with no schema-current staging database to prove it against.
- **Ids in the document, values in the rows** — no migration: `app.trash` stores
  `{ id, deletedAt, deletedBy }`, the values stay in `wb_records`, and hydration routes trashed
  rows into the bin the same way it already routes live rows into `app.items`. Cheaper and
  reversible, but it changes the in-memory shape of a bin entry and needs a one-time migration of
  the trash already sitting in every company document.

The first was chosen on 2026-09-04: soft-delete in `wb_records`, with a 30-day expiry swept by
`purge_expired_wb_records`. The second is recorded because it remains the cheaper rollback if the
migration proves unwelcome.

Until it is applied, the exposure is unbounded in time as well, because the app bin has no expiry:
`expiredInTrash` reports records older than `TRASH_DAYS` and deliberately never sweeps them, and
`emptyTrash` is account-owner only. Contacts are offered "Recycle Bin for 30 days"; app records
are kept until somebody purges them by hand.

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
