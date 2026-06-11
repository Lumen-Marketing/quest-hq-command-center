# TaskManagement Integration Notes

## Source Boundary

- Upstream repo copied locally at: `C:\Users\Joshua\Desktop\Quest roofing\TaskManagementQuest-upstream-copy`
- Upstream GitHub repo: `https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main`
- Upstream Supabase project reference: `qqvmcsvdxhgjooirznrj`
- Do not push to the upstream repo.
- Do not run migrations against the upstream Supabase project.

## Quest HQ Direction

TaskManagement is becoming the Job Center execution layer, not a separate destination. The live flow is:

```text
login.html -> Quest HQ Operations Command -> taskmanagement/app.html
```

Quest HQ owns:

- Login and shared Supabase session gating.
- Profile display name and avatar.
- Approval state.
- Role assignment and access gating before a user enters Quest HQ or TaskManagement.
- Job workspaces.
- Files, forms, finance, analytics, and business context.

TaskManagement contributes:

- Its refined company/settings model for the task runtime.
- Task execution rows.
- Job-scoped task filtering through `tasks.project_id`.
- Time tracking and task notifications.

## Data Mapping

| TaskManagement | Quest HQ Target | Purpose |
| --- | --- | --- |
| `auth.users` | Supabase Auth | Shared login identity |
| `profiles` | Quest HQ profiles | Profile/avatar, approval, role, access gating, member link |
| `team_members` | Quest HQ team roster | Assignee picker, team chart, supervisor hierarchy |
| `companies` | TaskManagement runtime and Quest HQ data | Preserve the team-refined company/settings model while Quest HQ gates access |
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
- Quest HQ now owns `login.html`, account approval, profile display name, avatar upload, role display, and sign out.
- The hosted TaskManagement user menu routes profile edits back to Quest HQ.
- The TaskManagement company/settings/admin model is preserved as the team-refined source for the task runtime.
- Live database work remains limited to the Quest HQ Supabase project `lpzotcznihwyyudxycmd`; the upstream Supabase project stays untouched.
