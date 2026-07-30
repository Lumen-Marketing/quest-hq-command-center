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
`canceled`. Add one additive Supabase migration that expands the status constraint and
replaces the affected platform functions. Do not blindly rewrite historical canceled
rows.

## Task 3: Insert-return and Storage contracts

Audit the seven non-task TaskManagement `insert(...).select(...)` sites. Keep only sites
whose INSERT condition implies immediate SELECT visibility; remove the dead
`task_label_sops` mutators because the table and callers do not exist. Add a locked audit
test so new unaudited sites fail CI. Fix any proven insert-return mismatch discovered
during the audit. Add a security-contract test proving form-response files stay on the
server-only Storage route; the private bucket must not gain anon/authenticated object
policies.

## Task 4: Live verification, publishing, and checked PDF

Apply the database migration, rerun focused and full checks, inspect Supabase advisors,
publish the branch/main update, deploy, and run production smoke checks. Generate, render,
and visually inspect the final plain-language PDF checklist.
