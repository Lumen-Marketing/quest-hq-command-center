# Quest HQ Command Center

Quest HQ is the operations shell for Quest Roofing, Quest Drafting, and Lumen Marketing. It is currently built as a Vite-served static HTML/CSS/vanilla JS command center around jobs, clients, module records, and the existing TaskManagement app.

The key product boundary is intentional:

- Quest HQ owns business containers: jobs, clients, CRM records, forms, tickets, files, finance, knowledge base records, automations, dashboards, templates, and admin setup.
- TaskManagement remains the work execution module for tasks, assignments, statuses, time tracking, notifications, roles, hierarchy, and approvals.
- The shared integration contract is `job.id -> task.project_id`.

## Local Setup

Requirements:

- Node.js 20 or newer is recommended for Vite 7.
- npm, included with Node.js.

Install dependencies:

```bash
npm install
```

Start the local app:

```bash
npm run dev
```

Vite serves on `http://127.0.0.1:5173` by default unless that port is already in use.

Create a production build:

```bash
npm run build
```

Create the GitHub Pages build:

```bash
npm run build:pages
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts Vite locally on `127.0.0.1`. |
| `npm run build` | Creates the static production bundle in `dist/`. |
| `npm run build:pages` | Creates the GitHub Pages bundle in `docs/` with the repository base path. |
| `npm run preview` | Serves the production bundle locally for a smoke test. |

## Environment Variables

Vite only exposes client-side variables that start with `VITE_`. Do not put private Supabase service-role keys or other server secrets in Vite environment variables.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `VITE_TASK_MANAGEMENT_URL` | Production recommended | TaskManagement handoff links | URL for the existing TaskManagement app. Defaults locally to `/TaskManagementQuest/app.html`. Quest HQ appends `project_id=<job.id>` and `return_url=<current Quest HQ URL>`. |
| `VITE_SUPABASE_URL` | Future Supabase integration | Browser Supabase client | Public project URL. Add when data moves from fixtures to Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Future Supabase integration | Browser Supabase client | Public anon key protected by Row Level Security policies. |

Local env files such as `.env.local` are ignored by Git. For Vercel, configure these values in the project dashboard under Environment Variables for Preview and Production.

## TaskManagement Integration Expectations

TaskManagement should be deployed either as a separate Vercel project or as a routed sibling app. Quest HQ should not duplicate TaskManagement screens or execution logic.

Expected handoff behavior:

```text
Quest HQ Job Profile
  opens VITE_TASK_MANAGEMENT_URL?project_id=<job.id>&return_url=<quest-hq-url-with-job_id>

TaskManagement
  filters tasks where task.project_id = project_id
  can use return_url to navigate back to the originating Quest HQ job context
```

Required data contract:

- `jobs.id` is the stable Quest HQ job identifier.
- `tasks.project_id` in TaskManagement stores the Quest HQ job id.
- Task rollups shown in Quest HQ should be read from TaskManagement or a shared view, not reimplemented as a separate task system.
- Automations that create tasks should write to TaskManagement and preserve `project_id`.

## Supabase Notes

The current demo uses Supabase for the Jobs module only. Other modules remain local/mock presentation workspaces until the next backend phase. The broader planned model is documented in [supabase/schema-plan.md](supabase/schema-plan.md).

Current demo project:

- Project ref: `lpzotcznihwyyudxycmd`
- Public URL: `https://lpzotcznihwyyudxycmd.supabase.co`
- Live table used by the browser today: `public.jobs`
- Reproducible migration: `supabase/migrations/202606082049_job_center_demo.sql`

The public Vercel demo intentionally allows browser writes to `public.jobs` so the presentation can demonstrate create, edit, duplicate, and delete behavior. Treat this as temporary demo RLS only; production must add Supabase Auth, company memberships, and scoped write policies before real customer data is entered.

Recommended production approach:

- Keep Quest HQ and TaskManagement in the same Supabase project when possible so jobs, task rollups, files, and activity can share auth and Row Level Security.
- Use `auth.users` for identity and app-level `profiles`, `companies`, and memberships for authorization.
- Store public browser configuration in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Keep privileged data migration, admin, webhook, and automation secrets out of the Vite client. Use Supabase Edge Functions or server-side deployment environment variables for those.

## Vercel Deployment

This repository is configured as a static Vite app:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: `vercel.json` rewrites all routes to `/index.html`

Before production deployment:

- Set `VITE_TASK_MANAGEMENT_URL` to the deployed TaskManagement URL.
- Add future Supabase client variables after the database integration lands.
- Confirm TaskManagement accepts `project_id` and `return_url`.
- Confirm the deployed Quest HQ route can be restored from the `return_url` generated by the app.

## GitHub Pages Deployment

GitHub Pages is used for the first presentation link. The repository publishes from the `main` branch using the `/docs` folder.

Build Pages assets before pushing presentation updates:

```bash
npm run build:pages
```

Expected Pages URL:

```text
https://asiandoescodin.github.io/quest-hq-command-center/
```

## Repository Hygiene

Generated dependencies, local env files, logs, and local tool caches are ignored by `.gitignore`. Commit source files, lockfiles, deployment config, documentation, Supabase planning artifacts, and the intentional `docs/` GitHub Pages bundle.
