# Questbase P0 Release Hardening - Batch 1 Implementation Plan

> Source: the P0 section of `questbase-release-readiness-todo-list.pdf`, revalidated against `origin/main` at `91796a5`.

## Task 1: Gate SMS on backend readiness

**Files**

- Create: `api/sms-readiness.js`
- Create: `tests/sms-readiness.test.mjs`
- Create: `src/communications/sms-readiness.js`
- Create: `tests/sms-readiness-ui.test.mjs`
- Modify: `src/main.js`

**TDD sequence**

1. Test missing provider configuration, missing/old tables, missing workspace assignment, unauthorized users, and a ready workspace number.
2. Run the focused tests and confirm they fail because the readiness contract does not exist.
3. Implement the endpoint and pure UI readiness helpers.
4. Wire the contact panel so an unready backend cannot load a thread or submit a message.
5. Run the focused tests and the existing SMS tests.

## Task 2: Canonicalize company and workspace routes

**Files**

- Create: `src/workspaces/tenant-route.js`
- Create: `tests/tenant-route.test.mjs`
- Modify: `src/main.js`
- Modify: `tests/workspace-runtime-static.test.mjs` only if an integration assertion is needed

**TDD sequence**

1. Test an allowed route, stale company, inaccessible workspace, missing workspace, and no-access account with literal expected results.
2. Confirm the tests fail because the resolver does not exist.
3. Implement the pure resolver.
4. Use it in `routeRedirect()` before tenant state is reconciled.
5. Run focused route/workspace tests.

## Task 3: Declare plugin data scope

**Files**

- Create: `src/workspaces/plugin-catalog.js`
- Create: `tests/plugin-data-scope.test.mjs`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**TDD sequence**

1. Test that every catalog entry has a valid scope and that the known workspace-private/company-shared/hybrid boundaries match the approved tenancy design.
2. Confirm failure against the current in-file catalog.
3. Extract the catalog, add scope metadata, and import it into the app.
4. Render a scope badge and explanation on each plugin settings card.
5. Run focused plugin and workspace tests.

## Task 4: Make contact graduation atomic and idempotent

**Files**

- Create with Supabase CLI: `supabase/migrations/<timestamp>_atomic_contact_to_quote.sql`
- Create: `tests/contact-quote-graduation.test.mjs`
- Modify: `src/main.js`
- Modify: `.ai/database/overview.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/decisions.md`

**TDD sequence**

1. Add browser-boundary tests proving live mode calls one RPC and repeated success consumes the returned quote.
2. Add migration contract tests for authorization, locking, link validation, and idempotent lookup.
3. Confirm both focused tests fail.
4. Create the forward-only migration using the Supabase CLI and implement the RPC.
5. Replace the live browser inserts with the RPC while preserving read-only demo behavior.
6. Apply and verify the migration only after the SQL and complete test suite pass.

## Task 5: Verify and publish

1. Run all focused tests.
2. Run `npm run check`.
3. Review the full diff for tenant leaks, secrets, unrelated files, and accidental TaskManagement changes.
4. Commit the scoped Questbase changes.
5. Push and integrate using the repository's direct-deployment workflow.
6. Confirm Vercel READY points at the published commit.
7. Run production smoke plus targeted tenant-route and SMS-gate checks.
8. Report completed PDF checkboxes and the remaining open P0 items without marking the full PDF complete.

