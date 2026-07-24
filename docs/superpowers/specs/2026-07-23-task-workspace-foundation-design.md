# Task Workspace Foundation Design

**Date:** 2026-07-23
**Gantt block:** Thursday — Foundation
**Owner:** Josh
**Status:** Approved for implementation by the instruction to continue the agreed Gantt

## Outcome

The absorbed Task application will behave as a true operational-workspace module inside Questbase. A company remains the billing and security tenant. Each operational workspace independently activates the Tasks plugin, and the embedded Task application reads and writes only the active workspace.

The implementation combines two sources deliberately:

- current production `main` (`070586e`) supplies the authoritative company/workspace shell, plugin model, navigation, and recent tenancy work;
- the latest deployed Task preview (`feat/task-app-absorption` at `b6ae185`) supplies the vendored Task execution UI and its Command Center integration.

Neither source is safe to ship alone for this goal. Production still renders the older native Tasks page, while the Task preview is company-scoped but does not pass or enforce the active operational workspace.

## Tenant and plugin contract

```text
authenticated user
  -> company membership (customer/billing tenant)
     -> workspace membership (operational access)
        -> company_plugins.tasks = installed (company entitlement)
           -> workspace_plugins.tasks = installed (workspace activation)
              -> Tasks navigation and embedded runtime are available
```

- Company entitlement is necessary but not sufficient.
- Workspace activation decides whether Tasks appears and opens in that workspace.
- Owners and admins keep the existing implicit workspace-access behavior; workers remain limited by workspace membership and permission policies.
- Disabling Tasks in one workspace must not disable it in another workspace or remove the company entitlement.

## Host-to-module interface

The host opens `/taskmanagement/app.html` with same-origin query parameters:

| Parameter | Required | Meaning |
| --- | --- | --- |
| `embed=1` | Yes | Hides duplicate Task application chrome. |
| `workspace_id=<uuid>` | Yes | Operational workspace boundary for all task reads and writes. |
| `project_id=<uuid>` | No | Optional job/project filter inside the active workspace. |
| `return_url=<same-origin URL>` | Yes | Safe route back to the host, preserving company and workspace. |
| URL hash | No | `#/task/<id>` or `#/new` for task deep links. |

The vendored module exposes the parsed value as `App.commandCenterIntegration.workspaceId`. Hosted operation without a workspace id fails closed with a clear message instead of falling back to company-wide data. Standalone/non-hosted development behavior is preserved.

## Data boundary

The existing `tasks.workspace_id NOT NULL` column and workspace RLS policies remain authoritative. No task-schema redesign is included.

The vendored Supabase store will:

- add `workspace_id = activeWorkspaceId` to task inserts and updates;
- filter task list, task refetch, delete, and expired-task purge queries by the active workspace;
- retain `project_id` as an optional filter inside that workspace;
- rely on existing relationship policies for dependent records such as time entries.

RLS remains the final security boundary. Client filters are defense in depth and necessary product behavior; they are not a replacement for RLS.

## Activation and migration behavior

- Tasks moves out of the host's `CORE_MODULE_IDS` bypass and becomes a registered workspace plugin.
- Tasks is included in the Roofing, Construction, and Generic preset definitions for newly created workspaces.
- A forward-only migration backfills `workspace_plugins` with an installed Tasks row only where the company already has the Tasks entitlement.
- The backfill uses `ON CONFLICT DO NOTHING`, preserving any explicit workspace-level disabled or installed choice.
- The migration must not rebuild the global plugin allowlist or replace the preset SQL function with a stale list; live Supabase already includes later RingCentral `calls` changes.

Live Supabase contains the effects of the Task phase migrations but lacks their migration-ledger entries. Those historical files must not be blindly replayed. This Thursday branch adds a separate idempotent workspace-activation migration and records the drift for controlled reconciliation.

## Legacy-link contract

- `/task-management.html` continues to redirect into the host Tasks route.
- `workspace` or `workspace_id` is retained when supplied; otherwise the host derives the company's active/default workspace through `companyPath()`.
- `project_id`/`job_id`, `task_id`, and `new` are retained where applicable.
- `/jobs/<job-id>/tasks` continues to derive the owning company and its valid workspace route.
- Return URLs are same-origin only.

## Release safety

- The vendored Task runtime is retained as the rollback/fallback asset; this work does not delete it or rewrite its broader feature set.
- Cross-workspace leakage, writes to the wrong workspace, missing plugin gating, or broken legacy deep links are hard release blockers.
- Production deployment and live migration happen only after focused contract tests, the full test suite, the production build, and the two-tenant leak checks pass.

## Out of scope

- A new task schema or taxonomy redesign.
- Company-to-company data sharing.
- A new permission/role model.
- RingCentral, SMS, billing, or marketplace work.
- Reworking the Task application's broader UI.
