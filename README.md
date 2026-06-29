# Quest HQ Command Center

Quest HQ is the Lumen Command Center SaaS workspace for company operations. It is a single Vite SPA around jobs, contacts, CRM records, files, finance, team access, and the vendored TaskManagement task engine.

The key product boundary is intentional:

- Quest HQ owns business containers: jobs, clients, CRM records, forms, tickets, files, finance, knowledge base records, automations, dashboards, templates, and admin setup.
- Quest HQ owns the account shell: login, profile/avatar, approval state, role, company access gating, and the session handed into TaskManagement.
- TaskManagement remains the work execution module for tasks, assignments, statuses, time tracking, and task notifications.
- The shared integration contract is `job.id -> task.project_id`.

## Local Setup

Requirements:

- Node.js 20 or newer is recommended for Vite 7.
- npm, included with Node.js.

Install dependencies:

```bash
npm install
```

Start the local app when local verification is explicitly needed:

```bash
npm run dev
```

Vite serves on `http://127.0.0.1:5173` by default unless that port is already in use.

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts Vite locally on `127.0.0.1`. |
| `npm run build` | Creates the Vercel production bundle in `dist/` and copies the TaskManagement runtime plus legacy redirects. |
| `npm run preview` | Serves the production bundle locally for a smoke test. |
| `npm run smoke:prod` | Checks the live production routes configured in `scripts/production-smoke.mjs`. |

## Environment Variables

Vite only exposes client-side variables that start with `VITE_`. Do not put private Supabase service-role keys or other server secrets in Vite environment variables.

Launch defaults use Supabase Auth, a public read-only demo, copy-link invites, and manual workspace approval. Local demo credentials are disabled unless `VITE_LOCAL_LOGIN_ENABLED=true` is set for development.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Required for live TaskManagement auth/data | Browser Supabase client | Public project URL for the Command Center-owned Supabase project. |
| `VITE_SUPABASE_ANON_KEY` | Required for live TaskManagement auth/data | Browser Supabase client | Public anon key protected by Row Level Security policies. |
| `VITE_QUEST_AUTH_ENABLED` | Recommended | Browser app | Keep `true` for launch so Supabase Auth, memberships, and RLS are used. |
| `VITE_LOCAL_LOGIN_ENABLED` | No | Browser app | Keep `false` for production. Local demo credentials are development-only. |
| `VITE_DEMO_MODE_ENABLED` | Recommended | Browser app | Enables the public sample workspace entry point before signup. |
| `VITE_DEMO_READONLY` | Required for production demo | Browser app | Keep `true` so demo users cannot persist create/edit/delete actions. |
| `VITE_BILLING_MODE` | Recommended | Browser app | Use `manual` until Stripe checkout and server secrets are configured. |

Local env files such as `.env.local` are ignored by Git. For Vercel, configure these values in the project dashboard under Environment Variables for Preview and Production.

## TaskManagement Integration Expectations

TaskManagement is vendored into this workspace under `taskmanagement/` and copied into the production bundle as `dist/taskmanagement/`. Quest HQ should not duplicate TaskManagement screens or execution logic.

Expected handoff behavior:

```text
/login
  Supabase sign in, workspace creation, invite-code join, and read-only demo access

Quest HQ Operations Command
  opens /jobs?job_id=<job.id>&tab=tasks

TaskManagement runtime
  runs embedded inside the Job Center task tab from taskmanagement/app.html
  receives project_id from Quest HQ
  filters tasks where task.project_id = project_id
  can still open as a full view for debugging or recovery
```

Required data contract:

- `jobs.id` is the stable Quest HQ job identifier.
- `tasks.project_id` in TaskManagement stores the Quest HQ job id.
- Quest HQ `profiles` stores login approval, display name, avatar, role, and company access for the shared session.
- TaskManagement keeps task execution behavior inside the vendored runtime. Embedded mode is tasks-only; profile, roles, time, team, approvals, and clock dashboard belong to Quest HQ.
- Task rollups shown in Quest HQ should be read from TaskManagement or a shared view, not reimplemented as a separate task system.
- Automations that create tasks should write to TaskManagement and preserve `project_id`.

## Supabase Notes

The production app uses the Quest HQ Supabase project for Auth, profiles, companies, memberships, subscriptions, roles, jobs, tasks, files, CRM, finance, messages, calendar, and audit data. The public demo is bundled sample data in the browser and must remain read-only; it is not backed by writable production tenant rows.

Launch account model:

- `info@lumenmarketingusa.com` is the Lumen platform Owner after signup.
- New signups start neutral unless they create a workspace or accept an invite.
- Workspace creation produces an Owner membership and a `pending_review` subscription.
- Platform approval uses `app_private.platform_admins`, not a global demo developer role.
- Invites are copy-link/code in v1. Automatic email delivery is not active.

File Center notes:

- Supabase Free includes limited storage, so Quest HQ enforces a 1GB presentation cap in the UI.
- Uploaded bytes live in Supabase Storage.
- File metadata lives in `public.job_files`.
- `jobs.file_count` is maintained by a database trigger from active file metadata rows.
- The bucket is private; previews/downloads use short-lived signed URLs.

Recommended production approach:

- Keep Quest HQ and TaskManagement in the same Supabase project when possible so jobs, task rollups, files, and activity can share auth and Row Level Security.
- Use `auth.users` and Quest HQ `profiles` for identity, profile/avatar, approval, roles, and access gating.
- Preserve TaskManagement's refined companies/settings behavior in the task runtime.
- Store public browser configuration in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Keep privileged data migration, admin, webhook, and automation secrets out of the Vite client. Use Supabase Edge Functions or server-side deployment environment variables for those.

## Vercel Deployment

This repository is configured as a static Vite SPA:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: `vercel.json` rewrites all non-file routes to `/index.html`

Before production deployment:

- Keep Supabase client variables pointed at the Quest HQ project.
- Confirm TaskManagement accepts `project_id` and `return_url`.
- Confirm the deployed Quest HQ route can be restored from the `return_url` generated by the app.

## Repository Hygiene

Generated dependencies, build output, local env files, logs, screenshots, and local tool caches are ignored by `.gitignore`. Commit source files, lockfiles, deployment config, Supabase migrations/plans, tests, and human-readable documentation under `docs/`.

`docs/` is source documentation only. It should not contain built app assets, copied TaskManagement runtime files, or deployment output.
