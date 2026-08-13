-- A company builds its own takeoff calculators: the line items it actually buys, at its own
-- prices, with its own formulas over the GAF report measurements. The defaults that ship in
-- the app are a starting point, so nothing is seeded here -- a company with no row of its own
-- gets the built-in calculator until it saves one.
--
-- The whole calculator is one jsonb document rather than a table of lines. It is edited and
-- read as a unit, never queried across, and a line is a row on a page the estimator drags
-- around; a schema per line would buy nothing and cost a migration every time the shape moves.

create table if not exists public.underwriting_calculators (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id text not null default '',
  name text not null default 'Underwriting calculator',
  config jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists underwriting_calculators_company_idx
  on public.underwriting_calculators(company_id, position, created_at);

drop trigger if exists underwriting_calculators_set_updated_at on public.underwriting_calculators;
create trigger underwriting_calculators_set_updated_at
before update on public.underwriting_calculators
for each row execute function public.set_updated_at();

alter table public.underwriting_calculators enable row level security;

drop policy if exists "subscription members read underwriting calculators" on public.underwriting_calculators;
create policy "subscription members read underwriting calculators"
on public.underwriting_calculators for select to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.view')
);

drop policy if exists "subscription members insert underwriting calculators" on public.underwriting_calculators;
create policy "subscription members insert underwriting calculators"
on public.underwriting_calculators for insert to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
);

drop policy if exists "subscription members update underwriting calculators" on public.underwriting_calculators;
create policy "subscription members update underwriting calculators"
on public.underwriting_calculators for update to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
)
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
);

drop policy if exists "subscription members delete underwriting calculators" on public.underwriting_calculators;
create policy "subscription members delete underwriting calculators"
on public.underwriting_calculators for delete to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
);

grant select, insert, update, delete on public.underwriting_calculators to authenticated;
revoke all on public.underwriting_calculators from anon;

-- The measurements belong to the contact being underwritten, not to the calculator: the same
-- calculator prices every roof, and each roof has its own report. They ride along with the
-- case that already holds the decision for that contact.
alter table public.underwriting_cases
  add column if not exists takeoff jsonb not null default '{}'::jsonb;

comment on column public.underwriting_cases.takeoff is
  'GAF report measurements and the calculator they were priced with: { calculator_id, measurements }.';
