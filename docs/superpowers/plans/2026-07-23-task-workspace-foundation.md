# Task Workspace Foundation Implementation Plan

> Execute the approved Thursday foundation block against current production plus the latest deployed Task preview. Keep production isolated until every release gate passes.

**Goal:** Make the absorbed Tasks module independently activatable and strictly scoped per operational workspace while preserving legacy task links.

**Architecture:** Retain the current production company/workspace shell and merge in the deployed vendored Task runtime. Pass the active workspace through a narrow same-origin host contract, enforce it in Task Supabase queries and writes, and use the existing company-entitlement/workspace-activation plugin model.

**Stack:** Vite, vanilla JavaScript, Node test runner, Supabase/Postgres RLS, Vercel.

---

## Task 1: Integrate the deployed Task runtime onto current production

**Files:**

- Merge: `origin/feat/task-app-absorption`
- Resolve: `src/main.js`
- Verify: `src/styles.css`, `scripts/sync-spa-assets.mjs`, `taskmanagement/**`

1. Merge the latest deployed Task branch into the isolated current-main branch without publishing it.
2. Resolve `src/main.js` by retaining current production's workspace architecture and adding the Task iframe renderer/deep-link behavior from the preview.
3. Run the existing test suite to detect integration regressions before workspace-specific changes.

## Task 2: Write red workspace-foundation contract tests

**Files:**

- Create: `tests/task-workspace-foundation.test.mjs`
- Modify if required: `tests/dashboard-static.test.mjs`
- Modify if required: `tests/workspace-plugins-static.test.mjs`

Cover these contracts:

1. Tasks is not in the core-module bypass and is registered as a workspace plugin with `tasks.view`/`tasks.manage` permissions.
2. All client workspace presets include Tasks.
3. The host iframe supplies `workspace_id`, `project_id`, a safe return URL, and task/new deep links.
4. The vendored config parses `workspace_id` and exposes `workspaceId`.
5. Task reads and mutations constrain `workspace_id`; task rows write it explicitly.
6. Hosted operation fails closed when `workspace_id` is absent.
7. The forward migration backfills only entitled companies and preserves existing workspace-plugin choices.
8. Legacy task URLs preserve workspace and deep-link parameters.

Run the focused test and verify it fails for the missing behavior before implementation.

## Task 3: Implement per-workspace plugin activation

**Files:**

- Modify: `src/main.js`
- Modify: relevant existing static tests

1. Remove `tasks` from `CORE_MODULE_IDS`.
2. Add the Tasks entry to `WORKSPACE_PLUGIN_REGISTRY`.
3. Map `tasks.*` permissions to the Tasks plugin.
4. Add Tasks to each client preset.
5. Preserve the current production workspace-aware plugin status and settings UI.

## Task 4: Implement the host/module workspace contract

**Files:**

- Modify: `src/main.js`
- Modify: `taskmanagement/js/config.js`
- Modify: `taskmanagement/js/services/SupabaseDataStore.js`
- Modify if needed: `taskmanagement/js/controllers/AppController.js`

1. Resolve and validate the active workspace before rendering the embedded module.
2. Pass it as `workspace_id` and preserve it in `return_url`.
3. Parse it into `App.commandCenterIntegration.workspaceId`.
4. Fail closed with a visible message for hosted sessions missing a workspace.
5. Add workspace filters to initial task load, reload/refetch, update lock, delete, and purge paths.
6. Write `workspace_id` in `_taskRow()`.
7. Keep optional job/project filtering nested inside the workspace boundary.

## Task 5: Add the idempotent activation migration

**Files:**

- Create with Supabase CLI: `supabase/migrations/<timestamp>_task_workspace_plugin_activation.sql`
- Modify: `docs/supabase-migration-reconciliation.md`

1. Create the migration with the Supabase CLI.
2. Insert one installed `workspace_plugins.tasks` row for each active workspace whose company has an installed Tasks entitlement.
3. Use `ON CONFLICT (workspace_id, plugin_id) DO NOTHING`.
4. Do not replace the plugin allowlist or preset function.
5. Document that the live Task phase effects are ahead of the migration ledger and require deliberate repair before historical replay.

## Task 6: Preserve legacy task links

**Files:**

- Modify: `src/main.js`
- Verify: `docs/keepsake/old-app-redirect/index.html`

1. Preserve `workspace`/`workspace_id`, job/project id, task id, and new-task intent during legacy normalization.
2. Let `companyPath()` derive the active/default workspace only when no explicit workspace is present.
3. Verify job-specific legacy routes still resolve to the correct company and workspace.

## Task 7: Verify and prepare release

1. Run the focused foundation contract test.
2. Run all Node tests.
3. Run the production build and bundle-budget check.
4. Run static Supabase/RLS checks and the two-tenant leak harness where credentials are available.
5. Inspect the complete branch diff against `origin/main` and confirm no RingCentral/SMS regression or stale plugin allowlist replacement.
6. Only then publish the branch and apply/promote according to the project's deployment workflow.
