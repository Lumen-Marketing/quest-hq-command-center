-- The production records a job file is made of.
--
-- Abe's Jobs structure needs five things the product has never stored: what happened on site
-- each day, where the money is going, what the client owes and when, what changed after the
-- contract was signed, and which drawing is current. Everything else in that design is a
-- view over these.
--
-- All five hang off a job and inherit its tenancy. Rather than repeat the join into jobs in
-- twenty policies -- five tables times four commands -- there are two helpers, so the next
-- child table has one place to hook and the rules cannot drift apart table by table.

create or replace function app_private.can_view_job(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select exists (
    select 1 from public.jobs j
    where j.id = p_job_id
      and app_private.is_workspace_member(j.workspace_id)
      and app_private.has_workspace_permission(j.workspace_id, 'jobs.view')
  );
$$;

create or replace function app_private.can_manage_job(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select exists (
    select 1 from public.jobs j
    where j.id = p_job_id
      and app_private.is_workspace_member(j.workspace_id)
      and app_private.has_workspace_permission(j.workspace_id, 'jobs.manage')
  );
$$;

revoke all on function app_private.can_view_job(uuid) from public, anon;
revoke all on function app_private.can_manage_job(uuid) from public, anon;
grant execute on function app_private.can_view_job(uuid) to authenticated;
grant execute on function app_private.can_manage_job(uuid) to authenticated;

-- ---- what happened on site --------------------------------------------------------------
-- One per crew per day. The foreman's view of the job and the only thing that answers "is
-- this job actually moving": the streak of good/ok/rough days, and the flag when one does
-- not arrive.
create table if not exists public.job_dailies (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  report_date date not null default current_date,
  crew_label text not null default '',
  crew_names text[] not null default '{}',
  -- Deliberately three words, not a number. A foreman answers "good / ok / rough" honestly;
  -- asked for a percentage first they round to something flattering.
  production text not null check (production in ('good', 'ok', 'rough')),
  -- Only asked for when the day was not good, which is when the reason is worth having.
  production_note text not null default '',
  site_cleaned boolean,
  materials_ok boolean,
  materials_needed text[] not null default '{}',
  notes text not null default '',
  photo_count integer not null default 0 check (photo_count >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One daily per crew per job per day. A second submission is an edit, not another day.
create unique index if not exists job_dailies_one_per_crew_day
  on public.job_dailies (job_id, report_date, crew_label);
create index if not exists job_dailies_job_date_idx on public.job_dailies (job_id, report_date desc);

-- ---- where the money goes ----------------------------------------------------------------
-- expected vs spent, per bucket. `status` is the important column: a bucket still open is a
-- guess, a bucket marked final is a fact, and the projected net firms up as they close.
create table if not exists public.job_cost_buckets (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  expected numeric(12, 2) not null default 0,
  spent numeric(12, 2) not null default 0,
  status text not null default 'open' check (status in ('open', 'final', 'later')),
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_cost_buckets_job_idx on public.job_cost_buckets (job_id, sort_order);

-- ---- what the client owes, and when ------------------------------------------------------
create table if not exists public.job_draws (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null default 0,
  -- locked: milestone not reached. unlocked: earned, invoice it. paid: money in.
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'paid')),
  invoiced_at timestamptz,
  paid_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_draws_job_idx on public.job_draws (job_id, sort_order);

-- ---- what changed after signing -----------------------------------------------------------
-- The steps are the point. Most change-order money is lost between "client asked" and "crew
-- built it", so each stage is recorded rather than inferred.
create table if not exists public.job_change_orders (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  description text not null default '',
  price numeric(12, 2) not null default 0,
  cost numeric(12, 2) not null default 0,
  step text not null default 'requested'
    check (step in ('requested', 'priced', 'sent', 'accepted', 'acknowledged')),
  requested_by text not null default '',
  asked_via text not null default '' check (asked_via in ('', 'in_person', 'text', 'email', 'phone')),
  sent_via text not null default '' check (sent_via in ('', 'text', 'email', 'docusign')),
  execute_when text not null default 'on_acceptance' check (execute_when in ('on_acceptance', 'after_payment')),
  accepted_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_change_orders_job_idx on public.job_change_orders (job_id, created_at desc);

-- ---- which drawing is current --------------------------------------------------------------
create table if not exists public.job_plans (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  version text not null default 'v1',
  is_current boolean not null default false,
  file_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Exactly one current plan per job: "build to this" cannot be ambiguous.
create unique index if not exists job_plans_one_current
  on public.job_plans (job_id) where is_current;
create index if not exists job_plans_job_idx on public.job_plans (job_id, created_at desc);

-- ---- tenancy ---------------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['job_dailies', 'job_cost_buckets', 'job_draws', 'job_change_orders', 'job_plans']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format($p$drop policy if exists "%1$s read" on public.%1$I$p$, t);
    execute format($p$create policy "%1$s read" on public.%1$I for select to authenticated
                     using (app_private.can_view_job(job_id))$p$, t);

    execute format($p$drop policy if exists "%1$s insert" on public.%1$I$p$, t);
    execute format($p$create policy "%1$s insert" on public.%1$I for insert to authenticated
                     with check (app_private.can_manage_job(job_id))$p$, t);

    execute format($p$drop policy if exists "%1$s update" on public.%1$I$p$, t);
    execute format($p$create policy "%1$s update" on public.%1$I for update to authenticated
                     using (app_private.can_manage_job(job_id))
                     with check (app_private.can_manage_job(job_id))$p$, t);

    execute format($p$drop policy if exists "%1$s delete" on public.%1$I$p$, t);
    execute format($p$create policy "%1$s delete" on public.%1$I for delete to authenticated
                     using (app_private.can_manage_job(job_id))$p$, t);
  end loop;
end $$;
