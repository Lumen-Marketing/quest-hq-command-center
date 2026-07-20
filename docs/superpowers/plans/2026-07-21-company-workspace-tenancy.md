# Company and Workspace Tenancy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate customer companies from configurable operational workspaces, with workspace-specific membership, roles, plugins, and CRM/production pipelines.

**Architecture:** Supabase Auth continues to identify one person. Company membership controls customer-account authority; new workspace tables control operational access and configuration. Existing companies receive a default workspace, existing pipeline data is backfilled, and legacy company URLs continue to resolve safely.

**Tech Stack:** Vite SPA, vanilla JavaScript modules, Node test runner, Supabase Postgres/Auth/RLS/RPC, Vercel.

## Global Constraints

- Do not run a local application or preview server.
- Preserve the public read-only demo.
- Company remains the billing and top-level tenant boundary.
- Owners/Admins have implicit workspace access; Members require explicit active workspace membership.
- New authorization must not depend on `profiles.role`, `profiles.company_ids`, or user-editable metadata.
- Existing records and URLs must migrate without deletion.
- New public tables require explicit grants and RLS.
- Live writes must surface failures and never report browser-only success.

---

### Task 1: Workspace tenancy model contract

**Files:**
- Create: `src/workspaces/model.js`
- Create: `tests/workspace-tenancy-model.test.mjs`

**Interfaces:**
- Produces: `workspaceForRoute({ companyId, workspaceParam, storedWorkspaceId, workspaces, memberships, profileId, companyRole }) -> workspace|null`
- Produces: `allowedWorkspaces({ companyId, workspaces, memberships, profileId, companyRole }) -> Workspace[]`
- Produces: `recordBelongsToWorkspace(record, workspaceId, defaultWorkspaceId) -> boolean`
- Produces: `workspacePluginStatus({ workspaceId, pluginId, workspacePlugins, companyEntitled }) -> 'installed'|'disabled'|'available'`

- [ ] **Step 1: Write failing pure-model tests**

Cover Owner/Admin implicit access, Member explicit access, disabled/archive filtering, route preference order, legacy record fallback, and entitlement-aware plugin state.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-tenancy-model.test.mjs`

Expected: FAIL because `src/workspaces/model.js` does not exist.

- [ ] **Step 3: Implement the minimal pure model**

Use normalized string comparisons, deterministic ordering (`is_default`, then name), and no browser globals.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/workspace-tenancy-model.test.mjs`

Expected: all workspace tenancy model tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/workspaces/model.js tests/workspace-tenancy-model.test.mjs
git commit -m "feat: add operational workspace model"
```

---

### Task 2: Supabase schema, backfill, and authorization

**Files:**
- Create: `tests/workspace-tenancy-static.test.mjs`
- Create: `supabase/migrations/202607211200_company_operational_workspaces.sql`

**Interfaces:**
- Produces tables: `workspaces`, `workspace_memberships`, `workspace_plugins`
- Produces helpers: `app_private.is_workspace_member(uuid)`, `app_private.is_workspace_admin(uuid)`, `app_private.workspace_has_plugin(uuid,text)`, `app_private.has_workspace_permission(uuid,text)`
- Produces RPCs: `create_operational_workspace(text,text,text,text)`, `set_workspace_member(uuid,uuid,uuid,text)`, `set_workspace_plugin(uuid,text,text)`, `apply_workspace_plugin_preset(uuid,text)`, `replace_workspace_pipeline_stages(uuid,text,jsonb,jsonb)`
- Adds `workspace_id` to: `accounts`, `contacts`, `crm_sites`, `deals`, `activities`, `jobs`, `tasks`, `pipeline_stages`, `underwriting_cases`, `job_files`, `proposal_documents`

- [ ] **Step 1: Write a failing migration contract test**

Assert the migration contains all three tables, explicit authenticated grants, RLS enablement, fixed-search-path helpers, revoked public execution, default-workspace backfill, record backfill, composite indexes, workspace-aware policies, cross-workspace validation, and all five RPCs.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-tenancy-static.test.mjs`

Expected: FAIL because the migration is missing.

- [ ] **Step 3: Add the forward-only migration**

Create default workspaces before adding record constraints. Backfill workspace memberships from active company memberships and role assignments. Copy company plugin entitlements into default workspace plugin configuration. Replace the scoped-table policies only after every row has a valid workspace id. Keep legacy RPCs intact for older clients.

- [ ] **Step 4: Verify GREEN and SQL contract**

Run: `node --test tests/workspace-tenancy-static.test.mjs`

Expected: all workspace tenancy migration contract tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/workspace-tenancy-static.test.mjs supabase/migrations/202607211200_company_operational_workspaces.sql
git commit -m "feat: add workspace tenancy schema"
```

---

### Task 3: Load and reconcile company/workspace identity

**Files:**
- Modify: `src/main.js` near state initialization, live data bootstrap, normalizers, routing helpers, realtime access refresh, and company reconciliation
- Modify: `tests/workspace-sidebar-navigation-static.test.mjs`
- Create: `tests/workspace-runtime-static.test.mjs`

**Interfaces:**
- Consumes the pure model from Task 1 and tables from Task 2.
- Produces app helpers: `activeWorkspaceId()`, `activeWorkspace()`, `allowedOperationalWorkspaces(companyId)`, `setActiveWorkspace(workspaceId)`, `workspaceRoleLabel(workspaceId)`
- `companyPath()` preserves `workspace=<id>`.

- [ ] **Step 1: Write failing runtime/static tests**

Require workspace tables in the initial/access refresh queries, separate `activeCompanyId` and `activeWorkspaceId`, membership-only company discovery for live sessions, legacy route fallback to default workspace, and workspace preservation in `companyPath()`.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-runtime-static.test.mjs tests/workspace-sidebar-navigation-static.test.mjs`

Expected: new assertions fail against company-as-workspace behavior.

- [ ] **Step 3: Implement state, loading, normalizers, and reconciliation**

Load `workspaces`, `workspace_memberships`, and `workspace_plugins`. Remove the live-session `profile.company_ids` authorization fallback from `allowedCompanyIds()`. Resolve active workspace from route, storage, or default allowed workspace. Ensure switching companies chooses an allowed workspace in the destination company.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/workspace-runtime-static.test.mjs tests/workspace-sidebar-navigation-static.test.mjs`

- [ ] **Step 5: Commit**

```bash
git add src/main.js tests/workspace-runtime-static.test.mjs tests/workspace-sidebar-navigation-static.test.mjs
git commit -m "feat: load and reconcile operational workspaces"
```

---

### Task 4: Company header and operational workspace rail

**Files:**
- Modify: `src/main.js` in `renderCompanySwitch()` and related event actions
- Modify: `src/styles.css` in the workspace rail section
- Modify: `tests/workspace-sidebar-navigation-static.test.mjs`

**Interfaces:**
- Consumes `allowedOperationalWorkspaces()` and `setActiveWorkspace()` from Task 3.
- Produces a grouped company account header plus child workspace list.

- [ ] **Step 1: Write failing navigation assertions**

Require a company account header, separate workspace rows keyed by `workspace_id`, active workspace semantics, workspace role labels, and create/manage actions restricted to account managers.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-sidebar-navigation-static.test.mjs`

- [ ] **Step 3: Implement grouped rail and responsive styling**

Keep the existing 264px command rail. Render company name/role once, then visible workspace rows. Preserve scroll state, collapsed rail behavior, keyboard labels, and module navigation below the workspace list.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/workspace-sidebar-navigation-static.test.mjs`

- [ ] **Step 5: Commit**

```bash
git add src/main.js src/styles.css tests/workspace-sidebar-navigation-static.test.mjs
git commit -m "feat: group workspaces under company accounts"
```

---

### Task 5: Workspace management and user assignment

**Files:**
- Modify: `src/main.js` settings and users renderers, modals, form handlers, and local state upserts
- Modify: `src/styles.css`
- Create: `tests/workspace-management-static.test.mjs`

**Interfaces:**
- Consumes Task 2 RPCs.
- Produces UI actions for workspace create, rename, archive, member/role assignment, and status changes.

- [ ] **Step 1: Write failing management tests**

Require `create_operational_workspace` instead of `create_company_workspace` for child workspace creation, separate company role/workspace assignment display, Owner/Admin gating, role selection, default-workspace protection, visible live error feedback, and no self-service privilege selection.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-management-static.test.mjs`

- [ ] **Step 3: Implement workspace settings and user access controls**

Replace “create another company workspace” in company settings with child workspace creation. Keep company creation only in owner onboarding. Add workspace assignment controls to Users and ensure all live mutations use RPCs.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/workspace-management-static.test.mjs`

- [ ] **Step 5: Commit**

```bash
git add src/main.js src/styles.css tests/workspace-management-static.test.mjs
git commit -m "feat: manage workspace access and roles"
```

---

### Task 6: Workspace-specific plugins

**Files:**
- Modify: `src/main.js` plugin lookup, permission availability, settings cards, and plugin mutations
- Modify: `tests/workspace-plugins-static.test.mjs`

**Interfaces:**
- Consumes `workspace_plugins` and Task 2 plugin RPCs.
- `isModuleInstalled(moduleId, companyId, workspaceId)` resolves the active workspace configuration while respecting company entitlement.

- [ ] **Step 1: Write failing plugin assertions**

Require workspace plugin rows, active-workspace module gating, entitlement checks, workspace plugin RPC calls, workspace preset application, and preservation of disabled plugin data.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-plugins-static.test.mjs`

- [ ] **Step 3: Implement workspace plugin resolution and settings**

Use company plugins as entitlements and workspace plugins as activation/configuration. Remove the browser-shipped private plugin password; unavailable/private entitlements must be controlled by server data rather than a client-side secret.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/workspace-plugins-static.test.mjs`

- [ ] **Step 5: Commit**

```bash
git add src/main.js tests/workspace-plugins-static.test.mjs
git commit -m "feat: scope plugins to operational workspaces"
```

---

### Task 7: Separate CRM and production pipelines per workspace

**Files:**
- Modify: `src/main.js` normalizers, company selectors, pipeline loading, persistence payloads, record conversion, task creation, and stage replacement
- Create: `tests/workspace-pipeline-static.test.mjs`
- Modify: `tests/pipeline-stage-navigation-static.test.mjs`
- Modify: `tests/supabase-writes.test.mjs`

**Interfaces:**
- Consumes active workspace state and workspace-aware stage RPC.
- Every scoped normalizer preserves `workspace_id`; every scoped create payload supplies it.

- [ ] **Step 1: Write failing pipeline isolation tests**

Require workspace filtering for accounts, contacts, sites, deals, activities, jobs, tasks, files, proposals, and underwriting cases. Require active workspace ids on writes and `replace_workspace_pipeline_stages` on stage updates.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/workspace-pipeline-static.test.mjs tests/pipeline-stage-navigation-static.test.mjs tests/supabase-writes.test.mjs`

- [ ] **Step 3: Implement workspace-aware selectors and writes**

Use `recordBelongsToWorkspace()` for legacy demo rows and exact `workspace_id` for live data. Reset record selections when changing workspace. Preserve workspace id across contact → quote → job conversion and task creation.

- [ ] **Step 4: Verify GREEN**

Run the same targeted command and confirm zero failures.

- [ ] **Step 5: Commit**

```bash
git add src/main.js tests/workspace-pipeline-static.test.mjs tests/pipeline-stage-navigation-static.test.mjs tests/supabase-writes.test.mjs
git commit -m "feat: isolate pipelines by workspace"
```

---

### Task 8: Project brain, migration validation, and release

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/architecture.md`
- Modify: `.ai/database/overview.md`
- Modify: `.ai/database/schema.md`
- Modify: `.ai/database/relationships.md`
- Modify: `.ai/database/functions.md`
- Modify: `.ai/database/security.md`
- Modify: `.ai/database/snapshot.json`
- Modify: `.ai/decisions.md`
- Modify: `.ai/manifest.json`

**Interfaces:**
- Records the new tenant hierarchy and live migration state.

- [ ] **Step 1: Run focused and full local verification**

Run:

```bash
npm.cmd test
npm.cmd run ai:check
npm.cmd run build
npm.cmd run check
```

Expected: zero test failures and exit code 0 for every command.

- [ ] **Step 2: Apply migration through Supabase**

Apply `202607211200_company_operational_workspaces.sql` to project `rqundirizvojpzhljtdn`, then query catalog-only counts and constraints. Do not print production row data.

- [ ] **Step 3: Run Supabase advisors**

Check both security and performance advisors. Fix any new finding attributable to this migration before release.

- [ ] **Step 4: Refresh the project brain from live metadata**

Update the catalog snapshot and documentation without storing user rows, auth users, secrets, or storage object paths.

- [ ] **Step 5: Re-run complete verification**

Run `npm.cmd run check` after the documentation refresh.

- [ ] **Step 6: Commit release state**

```bash
git add .ai src tests supabase docs
git commit -m "docs: record operational workspace tenancy"
```

- [ ] **Step 7: Integrate and deploy**

Merge the verified feature branch to `main`, push GitHub, confirm the Vercel production deployment is READY at the merged SHA, and run production smoke against `https://quest-hq-command-center-gamma.vercel.app`.

- [ ] **Step 8: Browser acceptance**

Sign in through the deployed UI, verify the Lumen account header, switch between two workspaces, confirm independent pipeline stage lists and records, confirm user access controls and workspace plugins, and leave the verified production page open.
