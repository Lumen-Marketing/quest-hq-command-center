# Quest HQ Production Hardening Implementation Plan

> Execute from the isolated `agent/production-hardening` worktree. Do not start a local dev or preview server. Validate with tests, production builds, Supabase inspection, Vercel deployments, and the in-app browser against deployed URLs.

**Goal:** Close the security, data-integrity, reliability, deployment-safety, authentication, realtime, and performance gaps found in the July 10 production audit without regressing existing workspace behavior.

**Architecture:** Put multi-step destructive mutations behind PostgreSQL RPC transactions; centralize browser and API error handling in small testable modules; preserve the current vanilla Vite UI and design language; narrow realtime invalidation instead of reloading the entire dataset; add a durable CI/check path before production promotion. Database changes ship before application code that depends on them, with backwards-compatible RPCs and least-privilege grants.

**Stack:** Vite/ES modules, Supabase Auth/Postgres/Storage/Realtime, Vercel Functions and Git deployments, Node test runner, GitHub Actions.

---

## Task 1: Establish the deployed baseline and executable quality gate

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.github/workflows/ci.yml`
- Modify: `scripts/production-smoke.mjs`
- Create: `tests/production-smoke.test.mjs`

1. Install the exact lockfile dependencies with `npm ci` and run the existing 156-test suite and production build at `e0cc12d`.
2. Add a failing behavioral test for the production smoke target and HTML/asset validation; confirm it fails against the stale default URL behavior.
3. Change the smoke default to `https://quest-hq-command-center-gamma.vercel.app`, validate the returned app shell and referenced assets, and support an optional expected commit marker.
4. Add `test`, `check`, and `smoke:prod` scripts and a GitHub Actions workflow that runs `npm ci`, tests, and build on pushes and pull requests.
5. Update only safe patch dependencies within the existing major versions, then rerun the full gate.

## Task 2: Add a least-privilege, atomic Supabase hardening migration

**Files:**
- Create: `supabase/migrations/202607101200_production_security_and_atomic_mutations.sql`
- Create: `tests/production-security-migration.test.mjs`
- Create: `docs/supabase-migration-reconciliation.md`

1. Write failing source-level contract tests for avatar ownership, restricted function grants, recycle-bin visibility, atomic destructive RPCs, automatic expiry cleanup, and indexes used by the new policies/RPCs.
2. Restore avatar INSERT/UPDATE ownership checks using `(select auth.uid())` and the first storage path segment; preserve the product's intended public avatar reads without a broad authenticated listing policy.
3. Revoke `PUBLIC`/`anon` execution from privileged functions; add an explicit authenticated identity/tenant check to `assign_wo_number` and library access.
4. Replace member-wide recycle-bin SELECT with `settings.manage`-equivalent access, and add RPCs for atomic move, restore, permanent deletion bookkeeping, role deletion, and pipeline-stage replacement.
5. Add a bounded purge function for expired recycle-bin rows and a scheduled daily job when `pg_cron` is available; storage objects remain application-deleted and are never silently discarded.
6. Add the high-confidence missing foreign-key and policy indexes used by these paths; do not remove low-usage indexes based on a low-traffic snapshot.
7. Document the observed remote/local migration-history mismatch and a non-destructive reconciliation procedure; do not rewrite production migration metadata blindly.
8. Apply the migration to a Supabase branch if available, run advisors and contract checks, then apply to production and rerun advisors.

## Task 3: Make destructive workflows transactional and recoverable

**Files:**
- Modify: `src/main.js`
- Create: `src/lib/result.js`
- Create: `tests/result.test.mjs`
- Modify: `tests/recycle-bin.test.mjs`

1. Add failing tests for returned Supabase errors (not only thrown exceptions), atomic recycle RPC invocation, storage-delete failure retention, bulk purge UI behavior, and confirmations for roles/stages.
2. Add a small `requireOk`/`resultError` helper and use it before optimistic state is committed.
3. Route live recycle move/restore/permanent-delete through the new RPCs. Delete storage first and abort database deletion if storage removal returns an error.
4. Add `Empty expired items` with an explicit typed/second-step confirmation; keep demo mode behavior local and deterministic.
5. Add confirmation modals for role deletion and pipeline-stage replacement, and use their atomic RPCs in live sessions.
6. Rerun focused tests, the full suite, and build.

## Task 4: Stop silent write failures and placeholder identity leakage

**Files:**
- Modify: `src/main.js`
- Modify: `tests/supabase-writes.test.mjs`

1. Add failing tests around contact save, task toggle, quote conversion, job-task creation, file copy/move, notifications, message reads, comments, role permissions, and pipeline updates.
2. Check every returned `{ error }` before updating local state or navigating; roll back optimistic UI when necessary and show the existing product toast pattern.
3. Remove the `abraham` fallback and require a real authenticated member/user identifier.
4. Make fire-and-forget noncritical writes explicitly logged/observed so failures are diagnosable without interrupting typing.
5. Rerun focused tests, full suite, and build.

## Task 5: Harden public Vercel APIs and Stripe flows

**Files:**
- Create: `api/_lib/http-security.js`
- Create: `api/_lib/rate-limit.js`
- Modify: `api/public-form-submit.js`
- Modify: `api/public-form-file-upload.js`
- Modify: `api/public-form-file-url.js`
- Modify: `api/address-suggestions.js`
- Modify: `api/create-checkout-session.js`
- Modify: `api/stripe-webhook.js`
- Create: `tests/http-security.test.mjs`
- Modify: `tests/public-form-api.test.mjs`

1. Add failing unit/handler tests for body-size limits, normalized client IPs, endpoint quotas, allowed methods/origins, upload constraints, Stripe return URL allowlisting, stable idempotency keys, and signature timestamp tolerance.
2. Centralize safe JSON parsing, method guards, cache/security headers, origin validation, and per-instance token-bucket limiting with clear `429` responses. Treat it as an application layer; keep Vercel Firewall as an additional platform layer.
3. Apply strict quotas to public submission/upload/address endpoints and validate the public-form object path before signed URL creation.
4. Derive Stripe return URLs from an allowlisted deployment origin, derive idempotency from user/company/plan/request identity without `Date.now()`, and verify webhook timestamp plus all `v1` signatures using constant-time comparison.
5. Rerun focused tests, full suite, and build.

## Task 6: Complete password recovery and password safety UX

**Files:**
- Create: `src/auth/password-policy.js`
- Create: `tests/password-policy.test.mjs`
- Modify: `src/main.js`
- Modify: `src/styles.css`

1. Add failing tests for the shared password policy and source contracts for recovery request/update handling.
2. Add show/hide password controls using the existing icon set and form styles.
3. Add `Forgot password?`, neutral account-enumeration-safe success messaging, recovery-link state handling, and authenticated password update.
4. Show concise password requirements and disabled/loading/error states consistent with current auth cards.
5. Enable Supabase leaked-password protection if the project/API exposes a safe supported setting; otherwise document the exact remaining dashboard action rather than pretending it is enabled.
6. Build and verify public auth states on the deployed preview with the in-app browser.

## Task 7: Replace full-dataset realtime reloads with scoped invalidation

**Files:**
- Create: `src/data/realtime-policy.js`
- Create: `tests/realtime-policy.test.mjs`
- Modify: `src/main.js`
- Modify: `supabase/migrations/202607081600_enable_realtime_core_tables.sql`

1. Add failing tests for table-to-domain invalidation, company filtering, modal/edit deferral, debounce batching, and the correct `pricebook_vendor_prices` publication name.
2. Subscribe only to tables the signed-in user can consume and add per-company filters where a table exposes `company_id`.
3. Batch changed domains and refresh only their loaders/state slices; preserve the focused-editor deferral behavior and dedicated messages channel.
4. Correct the source migration's stale table name through the new hardening migration rather than editing already-applied production history.
5. Rerun focused tests, full suite, and build.

## Task 8: Reduce production payload risk and create module boundaries

**Files:**
- Modify: `vite.config.js`
- Modify: `src/main.js`
- Create/Modify: focused modules under `src/` as extracted by Tasks 3-7
- Modify: asset imports as needed

1. Capture the current production bundle manifest and set explicit size budgets in a test/script.
2. Split stable vendors (`supabase`, PDF, ZIP, map) into cacheable chunks and dynamically import heavyweight PDF/ZIP/map code at the call sites where practical.
3. Remove accidental duplicate/dead asset imports and ensure font/image assets are cacheable; preserve the visual system and do not replace icons with ad-hoc assets.
4. Keep extracting testable policy/error/security modules from the 30k-line entry point; do not attempt an unsafe whole-file rewrite.
5. Fail CI on material app-shell regression while allowing documented worker/font assets.
6. Run full tests and production build; compare compressed output with baseline.

## Task 9: Publish through GitHub with production-safe controls

**Files:**
- All intended files from Tasks 1-8 only

1. Inspect `git status` and the full diff; stage only intended worktree files.
2. Run `npm run check` and the migration contract tests one final time.
3. Commit the coherent hardening changes on `agent/production-hardening`, push the branch, and open a draft PR with findings, migrations, rollback notes, and verification.
4. Let GitHub Actions and the Vercel preview complete; fix any failures before production.
5. Merge the verified branch to `main` and protect `main` against force pushes/deletion while preserving the user's direct-deployment workflow. Require the new CI check only if GitHub can do so without making future direct pushes impossible.

## Task 10: Apply, deploy, and verify the complete production story

1. Apply the backwards-compatible Supabase migration before app promotion; capture advisor deltas and verify grants/policies directly.
2. Promote the verified Vercel artifact (or use the existing Git-linked production deployment if promotion is unavailable), then verify the deployment SHA and build status.
3. Run the hardened production smoke script against the gamma domain and scan Vercel runtime logs for errors.
4. Use the in-app browser on the deployed URL to verify sign-in/recovery/create-workspace/invite flows. Ask the user to sign in only when private-screen verification is reached; never reuse credentials without current authorization.
5. Verify key private destructive/realtime flows after sign-in, capture screenshots for UI changes, and rerun Supabase advisors.
6. Report exact commit, production URL/deployment ID, checks, remaining platform-only actions, and rollback path.
