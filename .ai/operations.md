# Operations

## Working model

This project deploys directly. Do not run npm run dev or npm run preview, and do not start any other local server. Local commands are for deterministic tests and builds only.

## Safe local checks

- npm ci installs the locked dependency tree.
- npm test runs Node tests without a server.
- npm run ai:check validates this project brain.
- npm run build creates and validates the production bundle without serving it.
- npm run check runs tests, project-brain validation, and the build.
- npm run clean:check refuses to continue while tracked files differ from HEAD.
- npm run deploy:prod is clean:check, then check, then `vercel --prod`. Use it instead of calling vercel by hand.

## Delivery path

For the 2026-09-10 review follow-ups, email delivery checks are explicitly deferred by the user.
Do not send invitation, reset or support messages as an incidental release probe. Database probes
under `supabase/probes` must be reviewed and run transactionally with their final ROLLBACK intact;
they are not production cleanup commands. Legacy trash recovery has a service-only dry-run mode
and must prove preservation before applying its forward-only migration. Never infer contact
merge survivors from matching names, email addresses or phone numbers.

1. Make a scoped branch or isolated worktree change.
2. Run npm run check.
3. Merge the verified change into main and push main to GitHub. A pull request may be used when review is requested, but is not required by the direct-delivery workflow.
4. Let Vercel's Git integration deploy main directly.
5. Confirm the Vercel deployment is READY and points at the merged commit.
6. Run the production smoke command against the deployed URL and expected main SHA.
7. Confirm the scheduled Production Guardian remains healthy.

Relevant automation lives in [CI](../.github/workflows/ci.yml) and [Production Guardian](../.github/workflows/production-guardian.yml).

### Deploying from a laptop

A local `vercel --prod` uploads the WORKING TREE, not a commit. Production has been deployed
that way with uncommitted changes in it, which leaves a build nobody can reproduce: the SHA
the bundle reports names the last commit, and what actually shipped was whatever was on one
machine at one moment. Rolling back to that SHA restores different software than the one
serving traffic.

So: commit first, then `npm run deploy:prod`. It refuses on a dirty tree and says which files
are in the way. Untracked files are allowed through -- vercel honours .gitignore, and a stray
report is not a code change. Deploying from CI or the Git integration is better still, because
neither has a working tree to be dirty.

## Pilot launch rehearsal

- Follow [Pilot onboarding rehearsal](../docs/operations/pilot-onboarding-rehearsal.md) with two team-owned accounts before public registration.
- Record each observed result rather than marking a step complete from code inspection alone.
- Use the manual invite-link fallback if delivery fails; do not invalidate a valid invite while diagnosing the mail provider.
- Use [Provider handoff](../docs/operations/provider-handoff.md) for the owner-controlled email, payment, pricing, legal, and support inputs.

## Support and invite functions

- `send-company-invite` and `report-problem` are Supabase Edge Functions with custom bearer-token validation, so their provider `verify_jwt` setting remains disabled intentionally.
- Both functions must keep strict production-origin handling. `https://questbase.io`, `https://www.questbase.io`, and the stable Vercel application URL are built in; additional origins are explicit configuration.
- A release check may verify preflight behavior and unauthenticated rejection without creating an invite or report. A real end-to-end delivery test must use a designated team-owned mailbox and be recorded as controlled UAT.

## Database changes

1. Inspect the relevant existing migrations and [database map](database/overview.md).
2. Verify live metadata through the Supabase connection.
3. Add a forward-only SQL file under [supabase/migrations](../supabase/migrations).
4. Preserve RLS, company and operational-workspace scope, grants, routines, triggers, storage policy, and rollback/reconciliation intent.
5. Apply through the Supabase migration workflow; do not paste DDL through an ordinary query path.
6. Re-query the live catalog.
7. Refresh database/snapshot.json by running [database/snapshot-refresh.sql](database/snapshot-refresh.sql)
   and writing its single result to that file, then update the generated database pages,
   current-state.md, and manifest.json.
8. Run npm run ai:check and npm run check.

Step 7 is not optional bookkeeping. `npm run tenancy:check` refuses to certify the tenant
matrix while a migration is dated after the snapshot's `captured_at`, because a snapshot that
predates the schema cannot describe it. Adding a migration without refreshing the snapshot will
fail the build; refresh it rather than relaxing the gate.

Supabase's 2026 API hardening means new tables must be deliberately exposed and granted; never assume a created table is automatically reachable from the Data API.

## Environment and secrets

- Browser-safe settings use VITE-prefixed variables.
- Service-role, Stripe, database, and cron credentials stay in Supabase/Vercel/GitHub secret stores.
- Never print or commit secret values.
- Do not put user records, table rows, storage object paths, or access tokens into the project brain.

## Monitoring

- Vercel deployment and runtime status are the source for hosting health.
- GitHub CI protects branch changes.
- Production Guardian runs the production smoke check every six hours and creates/reopens an incident issue on failure.
- The daily recycle-bin purge endpoint is configured in vercel.json; Supabase also catalogs scheduled database work.
- `/api/form-upload-purge` runs daily from the same file and sweeps public-form uploads older than 48 hours that no submission references. It needs `CRON_SECRET` and the service-role key, and it removes objects through the storage API so nothing is left behind in the bucket.
- RingCentral cron health is confirmed from `ringcentral_sync_state.last_sync_at` and `consecutive_failures`; an absence of request-log entries alone is not proof that the scheduled sync stopped.
- After deployment, inspect Vercel build/runtime errors and Supabase project health plus security/performance advisors when the change touches those layers.
- After changing CSP or framing headers, verify the same-origin Tasks frame, PDF/document tooling, authentication, and one narrow-screen signed-in route in the deployed browser before declaring the release healthy.

## Recovery and rollback

- Application rollback: re-point the production alias to the last verified READY Vercel deployment, then rerun production smoke against the restored main expectation.
- Database recovery: prefer a forward corrective migration. Do not rewrite applied migration history or run destructive rollback SQL against production.
- If application and schema versions must move together, restore the compatible application artifact first only when the live schema remains backward compatible; otherwise ship the corrective migration before changing the alias.
