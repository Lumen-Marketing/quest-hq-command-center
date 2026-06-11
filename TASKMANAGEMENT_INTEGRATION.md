# TaskManagement Integration Notes

## Source Boundary

- Upstream repo copied locally at: `C:\Users\Joshua\Desktop\Quest roofing\TaskManagementQuest-upstream-copy`
- Upstream GitHub repo: `https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main`
- Upstream Supabase project reference: `qqvmcsvdxhgjooirznrj`
- Do not push to the upstream repo.
- Do not run migrations against the upstream Supabase project.

## Quest HQ Direction

TaskManagement is becoming the Job Center execution layer, not a separate destination. Quest HQ owns:

- Companies and company access.
- Job workspaces.
- Files, forms, finance, analytics, and business context.
- User approval, role assignment, and team chart surfaces.
- The login, verification, approval, company, admin, and developer control surfaces.

TaskManagement contributes:

- Task execution rows.
- Job-scoped task filtering through `tasks.project_id`.
- Time tracking and task notifications.

## Data Mapping

| TaskManagement | Quest HQ Target | Purpose |
| --- | --- | --- |
| `auth.users` | Supabase Auth | Login identity |
| `profiles` | Quest HQ profiles | Approval, role, company access, member link |
| `team_members` | Quest HQ team roster | Assignee picker, team chart, supervisor hierarchy |
| `companies` | Quest HQ companies | Operating company scope |
| `tasks.project_id` | `jobs.id` | Job-scoped task execution |
| `notifications` | Quest HQ notifications | Assignment and approval alerts |
| `time_entries` / `active_timers` | Time tracking module | Labor/time rollups by user and job |

## Migration Rule

Do not replay the TaskManagement SQL migrations directly into Quest HQ. The upstream migrations contain production RLS and historical fixes for a different app lifecycle. Quest HQ should receive a clean additive migration that preserves the useful model while respecting the existing `companies`, `jobs`, `job_files`, and demo policies.

## Current Runtime Status

- The actual TaskManagement static runtime is vendored at `taskmanagement/`.
- `task-management.html` is now only a compatibility redirect to `taskmanagement/app.html`.
- The generator copies `taskmanagement/` into `dist/taskmanagement/` and `docs/taskmanagement/`.
- Job Center still provides the integration key: `jobs.id -> tasks.project_id`.
- The vendored TaskManagement runtime reads `project_id` from the URL, filters task queries by `tasks.project_id`, and stamps new tasks with that job id.
- The TaskManagement company/settings/admin model is preserved as the team-refined source for the task runtime.
- Live database work remains limited to the existing Quest HQ Supabase project until a dedicated migration is reviewed.
