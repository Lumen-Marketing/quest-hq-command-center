# Per-Workspace Setup Survey Design

**Approved behavior:** The user's 2026-08-11 instruction explicitly approves a setup survey for every operational workspace, including the automatically created first workspace, with a small **Start from scratch** skip.

## Goal

Let one company contain unrelated operational workspace types—such as Roofing, CRM and Sales, Construction, and Internal Operations—without one setup rewriting the others.

## Chosen approach

Questbase will replace the company-scoped setup screen with a workspace-scoped setup screen. A new `workspace_setup_profiles` record stores answers, draft plan, applied plan, and reset history for exactly one `workspaces.id`. The existing `company_setup_profiles` table and RPCs remain untouched for rollout compatibility, but the active product UI stops calling them.

This is preferred over keeping both a company wizard and a workspace wizard because two active setup systems could disagree about plugins, roles, pipelines, and workspace ownership. It is also preferred over storing survey state in a plugin config because setup state spans apps, pipelines, workspace identity, and company roles.

## User flow

### Company creation

1. The existing company RPC creates the company and its required default workspace.
2. Questbase selects that workspace.
3. The browser opens **Settings → Setup** for that workspace.
4. The owner chooses **Guide me**, a ready-made setup, or the small **Start from scratch** action.

### Later workspace creation

1. **Add workspace** asks only for the workspace name and icon.
2. The workspace is created with no active workspace plugins.
3. Questbase selects it and opens its setup screen.
4. The same setup choices are available. Applying this workspace never changes a sibling workspace.

### Existing workspace

Owners and Admins can open **Settings → Setup** for the currently selected workspace at any time. A workspace with no profile sees the entry choices. A configured workspace sees its applied summary, adjustment action, and safe reset.

## Survey and presets

The guided path asks four workspace-specific questions:

1. What the workspace organizes.
2. Its business/operation type.
3. Which teams work in it.
4. Which tools it needs first.

Ready-made choices remain Roofing, CRM and Sales, Construction Operations, Home Services, Internal Operations, and Quick Starter. Every generated plan contains exactly one workspace. The review screen lets an administrator edit that workspace's name, apps, stages, and starter role names before applying.

**Start from scratch** is a small skip action, not another long wizard. It immediately records a blank setup for the selected workspace and leaves the owner free to configure apps, roles, and stages manually.

## Data and safety

- `workspace_setup_profiles.workspace_id` is the primary key and cascades only when that workspace itself is deleted.
- Authenticated users receive SELECT only; draft, apply, and reset writes go through fixed-search-path, server-authorized RPCs.
- Every RPC derives the company from `workspaces`, requires an active workspace, and calls the existing company-admin authorization helper.
- Applying a setup installs missing company entitlements unless an entitlement was explicitly disabled.
- Applying affects only the targeted workspace's plugin activations and pipeline stages.
- A setup re-apply disables only plugins previously managed by that workspace's setup profile. Manually activated plugins are preserved.
- Pipelines with Contacts, Quotes, or Jobs are preserved and returned as a warning.
- Existing matching custom roles may be reused, but their permissions are not overwritten. Only roles created and tracked by the same workspace setup may be updated by a later apply.
- Reset clears only that workspace's answers and draft, increments its reset counter, and reopens the guide. It does not remove the applied configuration or any company, people, workspace, customer, job, task, file, message, or sibling-workspace data.
- The legacy company setup table and functions are not dropped.

## UI and routing

The setup module stays lazy-loaded to protect the entry bundle. Settings passes both the company and selected workspace into the panel. The panel state cache is keyed by workspace UUID. Copy consistently says “workspace setup,” names the selected workspace, and explains that sibling workspaces remain unchanged.

After creating a later operational workspace, navigation changes from the Company tab to the company Settings route with `tab=setup` and the newly saved workspace UUID in the `workspace` query parameter.

Company registration already opens Setup; it will now resolve and show the newly created default workspace.

## Verification

- Model tests prove every preset and guided answer produces exactly one workspace.
- Panel tests prove drafts and apply/reset calls are workspace-scoped and Start from scratch skips directly to a blank applied state.
- Migration tests prove RLS, grants, fixed search paths, target-workspace authorization, plugin preservation, pipeline preservation, role safety, reset safety, and the blank creation preset.
- A rollback-only live database test creates a synthetic company/workspace, saves a draft, applies twice, resets, and proves no test rows survive.
- The full repository check, exact-commit production smoke, and signed-in Settings verification must pass before completion.
