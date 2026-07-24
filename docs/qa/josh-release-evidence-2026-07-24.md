# Josh release evidence - 2026-07-24

## Candidate

- Branch: `feat/task-gantt-foundation`
- Tested code candidate: `c1707b964bad97949edcd688c8643a3af92084cc`
- Reconciled with `origin/main`: `119a5a5adf12ebedcb31ed7d1a1b07e435286094`
- Divergence after reconciliation: 0 commits behind `origin/main`
- Latest verified previewed candidate: `7bd752f14cecfaa89d854bcc5ea167c86f89a2d0`

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

## Live Tasks workspace activation

The forward-only migration was first exercised inside a rollback-only transaction. It would insert exactly 4 missing rows, all for active workspaces whose companies already had the installed Tasks entitlement.

It was then applied through the Supabase migration API as `20260724000851_task_workspace_plugin_activation`. Post-apply verification found:

- 6 eligible active workspaces.
- 6 installed Tasks workspace rows.
- 0 missing Tasks workspace rows.
- 0 unexpected non-eligible Tasks rows.
- 0 disabled rows overwritten.

## Scope and remaining gates

This proves live database-level RLS behavior for the tested identities. The password-based `supabase-js` harness was not run because a second tenant password was not available in the release environment.

The following remain shared release gates:

- Complete Shan's Job-to-Task and What's next regression pass.
- Complete Rom's business UAT on the exact candidate.
- Make the team go/no-go decision before enabling native Tasks.

No Vercel production deployment was performed during this evidence run. The forward-only Tasks workspace-activation database migration was applied and verified as described above.

## Preview deployment verification

Vercel built commit `7bd752f14cecfaa89d854bcc5ea167c86f89a2d0` successfully as READY deployment `dpl_GZ2SWDw8kxA914HxnHBprs9UtyiH`. The protected preview loaded the Quest HQ application shell, and its generated Task runtime environment recorded that exact commit.

The preview is not yet valid for workspace/Tasks business UAT. Its isolated Supabase project, `qqvmcsvdxhgjooirznrj`, has legacy `companies` and `tasks` tables but no `workspaces`, `workspace_plugins`, or `company_memberships`. Before Rom's exact-candidate UAT, reconcile a current staging database or create a reviewed Supabase branch. Do not point preview code at production data merely to make the test pass.
