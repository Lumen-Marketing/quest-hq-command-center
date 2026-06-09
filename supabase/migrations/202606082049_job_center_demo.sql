create extension if not exists pgcrypto;

create table if not exists public.companies (
  id text primary key,
  name text not null,
  short_name text not null,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete restrict,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  name text not null,
  contact_name text,
  site_address text,
  job_type text not null default 'Roofing',
  stage text not null default 'Lead',
  priority text not null default 'Medium',
  owner_name text,
  scope text,
  start_date date,
  due_date date,
  estimate_total numeric(12, 2) not null default 0,
  invoice_total numeric(12, 2) not null default 0,
  task_count integer not null default 0,
  file_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_activity (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  source text not null default 'Quest HQ',
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists clients_company_id_idx on public.clients(company_id);
create index if not exists jobs_company_id_idx on public.jobs(company_id);
create index if not exists jobs_client_id_idx on public.jobs(client_id);
create index if not exists jobs_stage_idx on public.jobs(stage);
create index if not exists jobs_priority_idx on public.jobs(priority);
create index if not exists job_activity_job_id_created_at_idx on public.job_activity(job_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.job_activity enable row level security;

drop policy if exists "demo_read_companies" on public.companies;
create policy "demo_read_companies" on public.companies for select to anon, authenticated using (true);

drop policy if exists "demo_read_clients" on public.clients;
create policy "demo_read_clients" on public.clients for select to anon, authenticated using (true);

drop policy if exists "demo_read_jobs" on public.jobs;
create policy "demo_read_jobs" on public.jobs for select to anon, authenticated using (true);

drop policy if exists "demo_insert_jobs" on public.jobs;
create policy "demo_insert_jobs" on public.jobs for insert to anon, authenticated with check (true);

drop policy if exists "demo_update_jobs" on public.jobs;
create policy "demo_update_jobs" on public.jobs for update to anon, authenticated using (true) with check (true);

drop policy if exists "demo_delete_jobs" on public.jobs;
create policy "demo_delete_jobs" on public.jobs for delete to anon, authenticated using (true);

drop policy if exists "demo_read_job_activity" on public.job_activity;
create policy "demo_read_job_activity" on public.job_activity for select to anon, authenticated using (true);

insert into public.companies (id, name, short_name, color) values
  ('quest-roofing', 'Quest Roofing', 'Roofing', '#f45d22'),
  ('quest-drafting', 'Quest Drafting', 'Drafting', '#2563eb'),
  ('lumen', 'Lumen', 'Lumen', '#7c3aed')
on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, color = excluded.color;

with seeded_clients as (
  insert into public.clients (company_id, name, contact_name, email, phone, address)
  values
    ('quest-roofing', 'Mesa Storage Partners', 'Dana Ortiz', 'dana@mesastorage.example', '(480) 555-0188', 'Mesa, AZ'),
    ('quest-roofing', 'Maya Rosales', 'Maya Rosales', 'maya@example.com', '(480) 555-0191', 'Queen Creek, AZ'),
    ('quest-drafting', 'Arroyo Vista HOA', 'Board Office', 'hoa@example.com', '(480) 555-0134', 'Gilbert, AZ'),
    ('lumen', 'Lumen Internal', 'Andre Lee', 'ops@lumen.example', '(480) 555-0160', 'Phoenix, AZ')
  on conflict do nothing
  returning id, name
), all_clients as (
  select id, name from seeded_clients
  union all
  select id, name from public.clients where name in ('Mesa Storage Partners', 'Maya Rosales', 'Arroyo Vista HOA', 'Lumen Internal')
)
insert into public.jobs (company_id, client_id, client_name, name, contact_name, site_address, job_type, stage, priority, owner_name, scope, start_date, due_date, estimate_total, invoice_total, task_count, file_count, notes)
select 'quest-roofing', (select id from all_clients where name = 'Mesa Storage Partners' limit 1), 'Mesa Storage Partners', 'Mesa Storage Roof Repair', 'Dana Ortiz', '1840 S Mesa Industrial Rd, Mesa, AZ', 'Roofing', 'Production', 'High', 'Maya Rosales', 'Repair membrane damage, replace flashing, document photos, and close final inspection.', date '2026-06-03', date '2026-06-14', 46000, 12000, 12, 9, 'Priority commercial roof repair. Keep client updated daily.'
where not exists (select 1 from public.jobs where name = 'Mesa Storage Roof Repair')
union all
select 'quest-roofing', (select id from all_clients where name = 'Maya Rosales' limit 1), 'Maya Rosales', 'Queen Creek Leak Follow-up', 'Maya Rosales', '2138 E Orchard Lane, Queen Creek, AZ', 'Roofing', 'Inspection', 'Urgent', 'Andre Lee', 'Emergency leak follow-up, roof photos, estimate, and deposit invoice.', date '2026-06-08', date '2026-06-09', 8200, 0, 7, 5, 'Client reported active leak after storm.'
where not exists (select 1 from public.jobs where name = 'Queen Creek Leak Follow-up')
union all
select 'quest-drafting', (select id from all_clients where name = 'Arroyo Vista HOA' limit 1), 'Arroyo Vista HOA', 'Drafting Permit Package', 'Board Office', 'Arroyo Vista HOA, Gilbert, AZ', 'Drafting', 'QA Review', 'Medium', 'Noah Park', 'Permit-ready drawings and review packet for city submission.', date '2026-06-01', date '2026-06-18', 14000, 5000, 9, 6, 'Needs QA pass before client approval.'
where not exists (select 1 from public.jobs where name = 'Drafting Permit Package')
union all
select 'lumen', (select id from all_clients where name = 'Lumen Internal' limit 1), 'Lumen Internal', 'Lumen Campaign Setup', 'Andre Lee', 'Remote', 'Lumen', 'Estimate Approved', 'Medium', 'Andre Lee', 'Campaign buildout, assets, automations, and launch dashboard.', date '2026-06-05', date '2026-06-21', 22000, 0, 14, 12, 'Ready for production planning.'
where not exists (select 1 from public.jobs where name = 'Lumen Campaign Setup');
