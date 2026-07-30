# Additional Command Center hardening implementation plan

## Task 1: Permission and authoritative company IDs

Record the latest `main` baseline, verify the already-landed permission and alias work,
then close any remaining parity gaps. Browser and SQL permission aliases must match with
deny taking precedence. A company ID returned by Supabase or a creation RPC is
authoritative and must not be rewritten merely because the ID also appears in the legacy
URL-alias table. Add regression tests for initial load and creation, not only pre-populated
state.

## Task 2: Distinct terminal lifecycle states

Add failing regression tests and then update browser lifecycle mapping, filters, labels,
inactive-company handling, and the task module's company visibility rules. Archive must
write `archived`, Reject must write `rejected`, and Stripe cancellation must remain
`canceled` as effective statuses. Implement them as an expand/contract migration:
legacy `status` remains `canceled` for every terminal row, nullable `terminal_status`
stores the distinction, v1 list RPCs retain the legacy projection, and v2 list RPCs serve
the current client. Translate legacy Reject input, preserve manual terminal state across
non-canceled Stripe events, let Stripe cancellation supersede it, and clear terminal state
only on the permitted reactivation path. Backfill only audit-proven outcomes and add
old-client plus transition-matrix regressions.

## Task 3: Insert-return and Storage contracts

Audit the seven non-task TaskManagement `insert(...).select(...)` sites. Keep only sites
whose INSERT condition implies immediate SELECT visibility; remove the dead
`task_label_sops` mutators because the table and callers do not exist. Add a locked audit
test so new unaudited sites fail CI. Fix any proven insert-return mismatch discovered
during the audit. Add a security-contract test proving form-response files stay on the
server-only Storage route; the private bucket must not gain anon/authenticated object
policies.

## Task 4: Live verification, publishing, and checked PDF

Apply the compatibility database migration first, verify v1 and v2 RPC behavior, then deploy
the lifecycle-v2 client. Rerun focused and full checks, inspect Supabase advisors, publish
the branch/main update, and run production smoke checks for old and current client paths.
Generate, render, and visually inspect the final plain-language PDF checklist.
