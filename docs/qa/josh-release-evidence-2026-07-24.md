# Josh release evidence - 2026-07-24

## Candidate

- Branch: `feat/task-gantt-foundation`
- Tested code candidate: `c1707b964bad97949edcd688c8643a3af92084cc`
- Reconciled with `origin/main`: `119a5a5adf12ebedcb31ed7d1a1b07e435286094`
- Divergence after reconciliation: 7 commits ahead, 0 commits behind `origin/main`

## Local non-server verification

- Pre-merge branch baseline: 566 tests passed.
- Targeted native Tasks/workspace suite: 59 of 59 passed.
- Reconciled full suite: 574 of 574 passed.
- `npm run ai:check`: passed.
- Production build: passed.
- Bundle budget: passed.
- No local application or preview server was started.

## Live Supabase RLS evidence

Project: `rqundirizvojpzhljtdn`

The checks used two distinct, existing, non-platform authenticated identities. The SQL session assumed the normal `authenticated` role and supplied each identity's JWT claims so live RLS policies executed. No service-role bypass was used for the policy probes.

Both identities:

- Could see their own company and operational workspaces.
- Saw zero rows from a foreign tenant across companies, memberships, operational workspaces, workspace memberships, company plugins, workspace plugins, and tasks.
- Saw zero foreign contacts, deals, jobs, job files, proposals, forms, form responses, underwriting cases, workspace-builder state, conversations, or messages.
- Updated zero foreign task rows and zero foreign contact rows.
- Were denied task deletion at the authenticated table-grant layer.

The messaging tables had no durable rows, so each identity was tested against a rollback-only foreign conversation and message fixture. Both saw zero rows. The transaction was rolled back, and the live tables were rechecked at zero rows afterward.

The live per-person Task policy verification also passed all five structural assertions:

1. Read policy contains the current-member filter.
2. Update policy contains the current-member filter in both `USING` and `WITH CHECK`.
3. Read and update retain the workspace permission gate.
4. Insert and delete remain `tasks.manage`-only.
5. All four workspace Task policies remain present.

## Scope and remaining gates

This proves live database-level RLS behavior for the tested identities. The password-based `supabase-js` harness was not run because a second tenant password was not available in the release environment.

The following are not Josh's completed test work and remain shared release gates:

- Review and apply the forward Tasks workspace-plugin activation migration.
- Verify the live missing activation count changes from 4 to 0.
- Complete Shan's Job-to-Task and What's next regression pass.
- Complete Rom's business UAT on the exact candidate.
- Make the team go/no-go decision before enabling native Tasks.

No production deployment or database migration was performed during this evidence run.
