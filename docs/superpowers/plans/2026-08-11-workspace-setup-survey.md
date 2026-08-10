# Per-Workspace Setup Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the setup survey and reset belong to each operational workspace, including the first workspace created with a company.

**Architecture:** Keep the existing lazy setup surface, but key its model, UI state, persistence, and mutations by `workspace_id`. Add forward-only Supabase routines that apply one validated plan to one active workspace while preserving sibling workspaces, business records, manual plugins, and manually maintained roles.

**Tech Stack:** Vite, vanilla JavaScript modules, Node test runner, Supabase Postgres/RLS/RPC, Vercel Git deployment.

## Global Constraints

- Do not start a local or preview server.
- Every setup plan contains exactly one workspace.
- Company creation opens setup for its automatically created default workspace.
- Every later workspace creation opens the same setup flow.
- **Start from scratch** is a small direct skip action.
- Reset never deletes or reverts business data or the last applied configuration.
- Existing company setup database objects remain available for backward compatibility.
- Preserve company/workspace tenancy, RLS, fixed search paths, explicit grants, and atomic mutations.

---

### Task 1: Workspace-scoped planning model

**Files:**
- Modify: `src/onboarding/company-setup-model.js`
- Test: `tests/company-setup-model.test.mjs`

**Interfaces:**
- Consumes: existing blueprint, plugin, pipeline, and role catalogs.
- Produces: `WORKSPACE_SETUP_QUESTIONS`, `answersForWorkspaceBlueprint(code)`, `buildWorkspaceSetupPlan(answers, workspace)`, and `validateWorkspaceSetupPlan(plan)`.

- [ ] **Step 1: Write failing model tests**

Add literal expectations proving Roofing and CRM presets each return one workspace whose supplied name is retained, guided answers cannot produce sibling workspaces, and malformed multi-workspace plans are rejected.

- [ ] **Step 2: Run the focused model tests and verify RED**

```powershell
node --test tests/company-setup-model.test.mjs
```

Expected: failures because the four workspace-scoped exports do not exist.

- [ ] **Step 3: Implement the one-workspace adapter**

Add workspace-specific questions, force `layout: 'one'`, carry the selected workspace name, and reject any plan whose `workspaces.length !== 1`.

- [ ] **Step 4: Run the focused model tests and verify GREEN**

```powershell
node --test tests/company-setup-model.test.mjs
```

Expected: all company compatibility tests and new workspace tests pass.

### Task 2: Workspace-scoped persistence and atomic apply

**Files:**
- Create: `supabase/migrations/20260810173743_workspace_setup_profiles.sql`
- Modify: `tests/company-setup-migration.test.mjs`

**Interfaces:**
- Consumes: `app_private.is_company_admin(text)`, `app_private.company_setup_role_permissions(text)`, `workspaces`, `workspace_plugins`, `company_plugins`, `pipeline_stages`, and `roles`.
- Produces: `workspace_setup_profiles`, `save_workspace_setup_draft(uuid,jsonb,jsonb)`, `apply_workspace_setup(uuid,jsonb,jsonb)`, and `reset_workspace_setup(uuid)`.

- [ ] **Step 1: Generate the migration filename**

```powershell
npx.cmd supabase migration new workspace_setup_profiles
```

- [ ] **Step 2: Write failing migration contract tests**

Assert the table is workspace-keyed with RLS; authenticated users receive SELECT but no table writes; all RPCs have fixed search paths and explicit grants; apply derives the company from the target workspace; reset preserves `applied_plan`; plugin removal is limited to prior setup-managed IDs; and `plugin_ids_for_preset('blank')` returns an empty array.

- [ ] **Step 3: Run the migration tests and verify RED**

```powershell
node --test tests/company-setup-migration.test.mjs
```

Expected: failures because the generated migration is empty and workspace RPCs do not exist.

- [ ] **Step 4: Implement the migration**

Create the table, RLS policy, indexes, three authenticated RPCs, audit event, role-reuse protection, record-aware pipeline preservation, and the blank preset branch. Revoke public/anonymous execution and keep `search_path = ''` on privileged routines.

- [ ] **Step 5: Run the migration tests and verify GREEN**

```powershell
node --test tests/company-setup-migration.test.mjs
```

Expected: all setup migration tests pass.

### Task 3: Convert the lazy setup panel to the selected workspace

**Files:**
- Modify: `src/onboarding/company-setup-panel.js`
- Modify: `src/onboarding/company-setup-runtime.js`
- Modify: `src/onboarding/company-setup.css`
- Modify: `src/main.js`
- Test: `tests/company-setup-panel.test.mjs`
- Test: `tests/company-setup-role-fixes.test.mjs`

**Interfaces:**
- Consumes: Task 1 model exports and Task 2 RPC names.
- Produces: `createWorkspaceSetupPanel`, workspace-keyed rendering/actions, and selected-workspace Settings integration.

- [ ] **Step 1: Write failing panel tests**

Prove profile reads filter by `workspace_id`; draft/apply/reset use `target_workspace_id`; headings name the workspace; sibling-workspace copy is present; and **Start from scratch** invokes blank apply without presenting the review step.

- [ ] **Step 2: Run the focused panel tests and verify RED**

```powershell
node --test tests/company-setup-panel.test.mjs tests/company-setup-role-fixes.test.mjs
```

Expected: failures because the panel is still company-scoped.

- [ ] **Step 3: Implement the panel conversion**

Key cached state and timers by workspace UUID, pass company/workspace labels separately, use workspace RPCs, render a single workspace editor, update reset safety copy, and preserve the lazy import boundary.

- [ ] **Step 4: Run the focused panel tests and verify GREEN**

```powershell
node --test tests/company-setup-panel.test.mjs tests/company-setup-role-fixes.test.mjs
```

Expected: all setup panel tests pass.

### Task 4: Route every workspace creation through setup

**Files:**
- Modify: `src/main.js`
- Modify: `tests/workspace-management-static.test.mjs`
- Modify: `tests/workspace-creation-static.test.mjs`
- Modify: `tests/workspace-plugins-static.test.mjs`

**Interfaces:**
- Consumes: selected workspace state and the `blank` operational-workspace preset.
- Produces: a creation modal without the old Company type select and navigation whose `workspace` query value is the newly saved workspace UUID.

- [ ] **Step 1: Write failing routing tests**

Assert later workspace creation sends `preset_code: 'blank'`, removes the preset dropdown, selects the returned workspace, and navigates to its Setup tab. Assert self-service company creation still opens Setup for the automatic default workspace.

- [ ] **Step 2: Run the routing tests and verify RED**

```powershell
node --test tests/workspace-management-static.test.mjs tests/workspace-creation-static.test.mjs tests/workspace-plugins-static.test.mjs
```

Expected: failures because later workspace creation still accepts the old preset and opens the Company tab.

- [ ] **Step 3: Implement unified routing**

Remove the operational-workspace preset field, call the creation RPC with `blank`, and navigate to the selected workspace's setup route. Keep platform-created companies on the master flow.

- [ ] **Step 4: Run the routing tests and verify GREEN**

```powershell
node --test tests/workspace-management-static.test.mjs tests/workspace-creation-static.test.mjs tests/workspace-plugins-static.test.mjs
```

Expected: all routing tests pass.

### Task 5: Live database, project brain, release, and production proof

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/architecture.md`
- Modify: `.ai/decisions.md`
- Modify: `.ai/database/overview.md`
- Modify: `.ai/database/schema.md`
- Modify: `.ai/database/relationships.md`
- Modify: `.ai/database/functions.md`
- Modify: `.ai/database/security.md`
- Modify: `.ai/database/snapshot.json`
- Modify: `.ai/manifest.json`

**Interfaces:**
- Consumes: the reviewed migration and repository release commands.
- Produces: live workspace setup state, refreshed metadata, a tested `main` commit, and a verified production deployment.

- [ ] **Step 1: Apply and test the migration**

Apply the forward migration through the connected Supabase migration workflow. Run a rollback-only transaction that creates a synthetic company/workspace, saves, applies twice, resets, verifies sibling isolation and retained configuration, then rolls back and proves zero synthetic rows remain.

- [ ] **Step 2: Refresh live metadata and advisors**

Regenerate the metadata-only project brain snapshot, update database pages and manifest markers, and run Supabase security/performance advisors.

- [ ] **Step 3: Run the full release gate**

```powershell
npm.cmd run check
git diff --check
```

Expected: zero test failures, project-brain validation passes, tenancy matrix passes, build passes, bundle budget passes, and the bundle boots.

- [ ] **Step 4: Sync once more and publish**

```powershell
git fetch origin --prune
git rebase origin/main
git push origin HEAD:main
```

Only push when `origin/main` is an ancestor of the tested branch after the final rebase.

- [ ] **Step 5: Verify the exact production commit**

```powershell
$publishedSha = git rev-parse HEAD
npm.cmd run smoke:prod -- --base-url https://www.questbase.io --expect-sha $publishedSha
```

Expected: the expected SHA is present, 36/36 production routes pass, and 4/4 entry assets are available. Complete one signed-in, non-destructive browser check of the selected workspace Setup page and confirm no console errors.
