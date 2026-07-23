# Per-Person Task Visibility — Design Spec

**Date:** 2026-07-24
**Branch:** feat/task-per-person-visibility (off origin/main)
**Status:** Approved design, ready for implementation plan
**Supersedes:** the earlier `2026-07-24-per-company-task-roles-design.md` written on the
stale `feat/task-app-absorption` worktree, which targeted an obsolete
`profiles.role` model that production no longer uses.

## Context — the live model (verified against project rqundirizvojpzhljtdn)

Production task access is already per-company/per-workspace and role-driven. The
four `tasks` policies (defined in
`supabase/migrations/202607211200_company_operational_workspaces.sql`) gate on:

- `app_private.is_workspace_member(workspace_id)` — active company member who is
  either a company `owner/admin/developer` OR holds an active
  `workspace_memberships` row for that workspace.
- `app_private.has_workspace_permission(workspace_id, 'tasks.view' | 'tasks.manage')`
  — company `owner/admin/developer` get everything; otherwise a workspace-assigned
  role's `role_permissions` (allow/deny), with `tasks.view` in the baseline
  auto-grant set.

Live policy predicates today:

| Policy | Predicate |
|---|---|
| `tasks workspace read`   | `is_workspace_member AND has_workspace_permission(..., 'tasks.view')` |
| `tasks workspace insert` | `is_workspace_member AND has_workspace_permission(..., 'tasks.manage')` |
| `tasks workspace update` | `is_workspace_member AND has_workspace_permission(..., 'tasks.manage')` |
| `tasks workspace delete` | `is_workspace_member AND has_workspace_permission(..., 'tasks.manage')` |

**The gap:** anyone with `tasks.view` on a workspace sees **every** task in it.
There is no per-person filtering — a crew worker sees the whole job's task list,
not just their own. `tasks` carries `assignee_id` and `creator_id` (both `text`,
matching `public.current_member_id()`), and all 14 live tasks have both set, so
the data to filter by exists.

## Goal

Give each person only their slice of a job's tasks:

- **Crew** (workspace `tasks.view` only) — see and update **only** tasks assigned
  to them or created by them.
- **Job lead** (workspace `tasks.manage`) — see and manage **all** tasks on that
  job.
- **Company Owner / Admin / Developer** — see and manage everything (they already
  satisfy `tasks.manage` via `has_workspace_permission`, so this is automatic).
- **Creator always sees a task they created**, even if assigned to someone else.

## Decisions (locked)

1. **Team = the job/workspace.** No `reports_to`, no named teams, no new tables.
2. **Lead vs crew = the existing permission split.** `tasks.manage` ⇒ lead
   (sees/manages all on the job); `tasks.view` only ⇒ crew (own tasks only). A
   lead is designated in Command Center by assigning a role that carries
   `tasks.manage` — no code change for that.
3. **Crew may update their own tasks** (assigned to them or created by them), not
   just view. Creating and deleting remain lead/owner only.
4. **Preserve the outer gates.** `is_workspace_member` and the view/manage
   permission checks stay; the per-person filter is layered strictly on top —
   it can only ever *narrow* access, never widen it, so tenant isolation and the
   permission model are untouched.

## Non-goals (YAGNI)

- No `supervisor_id` / reporting hierarchy (chosen "job = team" instead).
- No changes to `has_workspace_permission`, `is_workspace_member`,
  `workspace_memberships`, `roles`, or `role_permissions`.
- No Command Center UI changes. (Designating a lead uses the existing role
  assignment. The client "My work / Company" toggle keeps working; for crew both
  now resolve to their own tasks because RLS narrows the set.)
- `time_entries` / `active_timers` untouched (already own + company-admin scoped).
- INSERT and DELETE policies unchanged (still `tasks.manage`).

## Change — rewrite two `tasks` policies

New migration file (timestamp after the latest, `202607231200`):
`supabase/migrations/202607241200_per_person_task_visibility.sql`.

### `tasks workspace read` (SELECT)

```sql
drop policy if exists "tasks workspace read" on public.tasks;
create policy "tasks workspace read" on public.tasks for select to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, 'tasks.view')
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')  -- lead / owner / admin -> all
    or assignee_id = public.current_member_id()                          -- crew: own assigned
    or creator_id  = public.current_member_id()                          -- creator always sees own
  )
);
```

### `tasks workspace update` (UPDATE — USING and WITH CHECK identical)

```sql
drop policy if exists "tasks workspace update" on public.tasks;
create policy "tasks workspace update" on public.tasks for update to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')  -- lead / owner / admin -> edit all
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
)
with check (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
);
```

INSERT and DELETE policies are **not** redefined (they remain the live
`tasks.manage` versions from `202607211200`).

### Behavior after the change

| Person on a job | See | Update | Create/Delete |
|---|---|---|---|
| Company Owner/Admin/Developer | all | all | yes |
| Job lead (`tasks.manage`) | all | all | yes |
| Crew (`tasks.view` only) | own assigned + own created | own assigned + own created | no |
| Creator of a task | always their own task | their own task | (delete = lead/owner) |
| Non-member of the job / other company | nothing | nothing | no |

## Testing

Behavioral RLS needs real auth; follow the existing `scripts/*.mjs` +
Supabase-SQL-editor conventions.

1. **Structural verifier** `scripts/verify-per-person-task-visibility.sql` (run in
   the SQL editor after applying): the read + update policies reference
   `current_member_id`; insert/delete still reference `tasks.manage`; four
   `tasks workspace *` policies present.
2. **Behavioral** `scripts/task-visibility-test.mjs` (anon key, real sign-in,
   modeled on `scripts/tenant-leak-test.mjs`), using a crew account C and a lead
   account L in the same workspace:
   - C sees only tasks where C is assignee or creator (a workspace task assigned
     to someone else, not created by C, is NOT visible).
   - C can update a task assigned to C; C cannot update a task assigned to
     someone else.
   - C sees a task C created for another person.
   - L sees all tasks in the workspace.
3. **Regression:** `npm test`, `npm run build`, `npm run check` (includes
   `ai:check`) all green.
4. **Tenant isolation unchanged:** re-run `scripts/tenant-leak-test.mjs`.

## Project-brain updates (required, same change — per .ai/README.md)

- `.ai/decisions.md` — record "job = team; crew see/edit only own tasks; lead =
  `tasks.manage`".
- `.ai/database/*` + `.ai/current-state.md` — refresh the `tasks` RLS description
  from live metadata after applying.
- `.ai/manifest.json` — timestamps / source revisions.

## Rollout

- One migration; applied by the user via their Supabase workflow (the team
  deploys directly; do not run a local/preview server).
- After apply: run the structural verifier, the behavioral test, and re-run the
  tenant leak test; then refresh the `.ai` database map from live metadata and
  verify the production URL.
