# Operations

## Working model

This project deploys directly. Do not run npm run dev or npm run preview, and do not start any other local server. Local commands are for deterministic tests and builds only.

## Safe local checks

- npm ci installs the locked dependency tree.
- npm test runs Node tests without a server.
- npm run ai:check validates this project brain.
- npm run build creates and validates the production bundle without serving it.
- npm run check runs tests, project-brain validation, and the build.

## Delivery path

1. Make a scoped branch or isolated worktree change.
2. Run npm run check.
3. Merge the verified change into main and push main to GitHub. A pull request may be used when review is requested, but is not required by the direct-delivery workflow.
4. Let Vercel's Git integration deploy main directly.
5. Confirm the Vercel deployment is READY and points at the merged commit.
6. Run the production smoke command against the deployed URL and expected main SHA.
7. Confirm the scheduled Production Guardian remains healthy.

Relevant automation lives in [CI](../.github/workflows/ci.yml) and [Production Guardian](../.github/workflows/production-guardian.yml).

## Database changes

1. Inspect the relevant existing migrations and [database map](database/overview.md).
2. Verify live metadata through the Supabase connection.
3. Add a forward-only SQL file under [supabase/migrations](../supabase/migrations).
4. Preserve RLS, company and operational-workspace scope, grants, routines, triggers, storage policy, and rollback/reconciliation intent.
5. Apply through the Supabase migration workflow; do not paste DDL through an ordinary query path.
6. Re-query the live catalog.
7. Refresh database/snapshot.json, generated database pages, current-state.md, and manifest.json.
8. Run npm run ai:check and npm run check.

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
- After deployment, inspect Vercel build/runtime errors and Supabase project health plus security/performance advisors when the change touches those layers.

## Recovery and rollback

- Application rollback: re-point the production alias to the last verified READY Vercel deployment, then rerun production smoke against the restored main expectation.
- Database recovery: prefer a forward corrective migration. Do not rewrite applied migration history or run destructive rollback SQL against production.
- If application and schema versions must move together, restore the compatible application artifact first only when the live schema remains backward compatible; otherwise ship the corrective migration before changing the alias.
