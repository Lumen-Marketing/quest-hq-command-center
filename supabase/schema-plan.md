# Supabase Schema Plan

This is a planning artifact for moving Quest HQ from local fixtures to Supabase while preserving TaskManagement as the execution system.

## Goals

- Make `jobs` the parent business container for Quest HQ.
- Keep TaskManagement as the source of truth for task execution.
- Preserve the integration key `jobs.id -> tasks.project_id`.
- Support multiple Quest business lines: Roofing, Drafting, and Lumen.
- Keep browser-safe configuration separate from server-only secrets.

## Core Tables

### companies

Stores operating companies or business units.

```sql
create table public.companies (
  id text primary key,
  name text not null,
  short_name text not null,
  color text,
  created_at timestamptz not null default now()
);
```

### profiles

App profile for authenticated users. Link to `auth.users` when Supabase Auth is enabled.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text,
  default_company_id text references public.companies(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### clients

Clients can belong to one primary company and own many jobs.

```sql
create table public.clients (
  id text primary key,
  company_id text not null references public.companies(id),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### jobs

Quest HQ's main business container. This table should not store task execution details beyond rollup caches.

```sql
create table public.jobs (
  id text primary key,
  company_id text not null references public.companies(id),
  client_id text references public.clients(id),
  name text not null,
  contact_name text,
  site_address text,
  job_type text,
  stage text not null,
  priority text not null default 'medium',
  owner_profile_id uuid references public.profiles(id),
  scope text,
  start_date date,
  end_date date,
  estimate_total numeric(12, 2) not null default 0,
  invoice_total numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### module_records

Shared shape for early CRM, forms, tickets, files, finance, knowledge, automations, dashboards, and templates records. Mature modules can later split into dedicated tables without breaking the job relationship.

```sql
create table public.module_records (
  id text primary key,
  module_id text not null,
  company_id text references public.companies(id),
  client_id text references public.clients(id),
  job_id text references public.jobs(id) on delete set null,
  title text not null,
  status text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index module_records_module_id_idx on public.module_records(module_id);
create index module_records_job_id_idx on public.module_records(job_id);
create index module_records_client_id_idx on public.module_records(client_id);
```

### job_activity

Cross-module timeline for job-level events, including events emitted by TaskManagement.

```sql
create table public.job_activity (
  id uuid primary key default gen_random_uuid(),
  job_id text not null references public.jobs(id) on delete cascade,
  source text not null,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index job_activity_job_id_created_at_idx on public.job_activity(job_id, created_at desc);
```

## TaskManagement Relationship

TaskManagement should keep its existing tables and own task lifecycle fields. The minimum shared contract is:

```sql
-- In the TaskManagement schema or project:
-- tasks.project_id stores public.jobs.id
create index if not exists tasks_project_id_idx on public.tasks(project_id);
```

Recommended read model for Quest HQ:

```sql
create view public.job_task_rollups as
select
  t.project_id as job_id,
  count(*)::int as task_count,
  count(*) filter (where t.status in ('done', 'completed'))::int as completed_task_count,
  count(*) filter (where t.status not in ('done', 'completed'))::int as open_task_count
from public.tasks t
where t.project_id is not null
group by t.project_id;
```

If TaskManagement lives in a separate Supabase project, expose rollups through an API or scheduled sync table instead of duplicating task management UI in Quest HQ.

## TaskManagement Import Boundary

The TaskManagement source repo has been copied locally for reference only:

```text
C:\Users\Joshua\Desktop\Quest roofing\TaskManagementQuest-upstream-copy
```

Do not edit or push to the upstream TaskManagement repo. Do not run migrations against the upstream Supabase project `qqvmcsvdxhgjooirznrj`.

Quest HQ should absorb the useful identity and operating model into its own Supabase project with a clean migration:

- `auth.users -> profiles`
- `profiles.member_id -> team_members.id`
- `profiles.company_ids -> company access`
- `team_members.supervisor_id -> team chart`
- `jobs.id -> tasks.project_id`
- approvals, notifications, time entries, and active timers as Quest HQ-owned tables or views

Do not replay TaskManagement's historical migrations directly into Quest HQ. They include old policy transitions and table assumptions that should be consolidated before production.

## Row Level Security Strategy

Initial RLS policy direction:

- Authenticated users can read companies, clients, jobs, module records, and activity for companies they belong to.
- Write access should be scoped by membership role and module permissions.
- Task writes from Quest HQ automations should go through a server-side function, not the browser, when elevated permissions are needed.
- The anon key must be safe because RLS is the real security boundary.

Example membership table:

```sql
create table public.company_memberships (
  company_id text not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (company_id, profile_id)
);
```

## Deployment Environment Strategy

Vercel client variables:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: public Command Center Supabase config used by the vendored TaskManagement runtime.
- `VITE_SUPABASE_URL`: public Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: public anon key protected by RLS.

Server-only variables for future Edge Functions, webhooks, or migration jobs:

- `SUPABASE_SERVICE_ROLE_KEY`: never expose to Vite.
- TaskManagement API tokens or webhook signing secrets.

Operational notes:

- Use separate Supabase projects for development and production, or at minimum separate schemas and environment variables.
- Seed static fixture IDs during migration so existing links like `job-arroyo-hoa` remain stable.
- Deploy database migrations before deploying a Quest HQ build that reads from the new tables.
- Validate TaskManagement links in Preview and Production because `return_url` is generated from the live Quest HQ URL.
