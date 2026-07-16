create table if not exists public.underwriting_cases (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  contact_id text not null references public.contacts(id) on delete cascade,
  contract_price numeric(14,2) not null default 0 check (contract_price >= 0),
  material_cost numeric(14,2) not null default 0 check (material_cost >= 0),
  labor_cost numeric(14,2) not null default 0 check (labor_cost >= 0),
  permit_cost numeric(14,2) not null default 0 check (permit_cost >= 0),
  disposal_cost numeric(14,2) not null default 0 check (disposal_cost >= 0),
  other_cost numeric(14,2) not null default 0 check (other_cost >= 0),
  overhead_percent numeric(5,2) not null default 10 check (overhead_percent between 0 and 100),
  commission_percent numeric(5,2) not null default 5 check (commission_percent between 0 and 100),
  contingency_percent numeric(5,2) not null default 2 check (contingency_percent between 0 and 100),
  target_margin_percent numeric(5,2) not null default 30 check (target_margin_percent between 0 and 100),
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, contact_id)
);

create index if not exists underwriting_cases_company_updated_idx
  on public.underwriting_cases(company_id, updated_at desc);

drop trigger if exists underwriting_cases_set_updated_at on public.underwriting_cases;
create trigger underwriting_cases_set_updated_at
before update on public.underwriting_cases
for each row execute function public.set_updated_at();

alter table public.underwriting_cases enable row level security;

drop policy if exists "subscription members read underwriting cases" on public.underwriting_cases;
create policy "subscription members read underwriting cases"
on public.underwriting_cases for select to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.view')
);

drop policy if exists "subscription members insert underwriting cases" on public.underwriting_cases;
create policy "subscription members insert underwriting cases"
on public.underwriting_cases for insert to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
  and exists (
    select 1 from public.contacts c
    where c.id = underwriting_cases.contact_id
      and c.company_id = underwriting_cases.company_id
  )
);

drop policy if exists "subscription members update underwriting cases" on public.underwriting_cases;
create policy "subscription members update underwriting cases"
on public.underwriting_cases for update to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
)
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
  and exists (
    select 1 from public.contacts c
    where c.id = underwriting_cases.contact_id
      and c.company_id = underwriting_cases.company_id
  )
);

drop policy if exists "subscription members delete underwriting cases" on public.underwriting_cases;
create policy "subscription members delete underwriting cases"
on public.underwriting_cases for delete to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'underwriter.manage')
);

grant select, insert, update, delete on public.underwriting_cases to authenticated;
revoke all on public.underwriting_cases from anon;
