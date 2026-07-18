-- Company-level CRM automations: trigger -> action rules ("when a deal reaches
-- Won, create a kickoff task"). Company-scoped and RLS-protected.
--
-- Read is open to any company member because every client evaluates the rules
-- locally when a CRM record changes, so it must be able to load them. Managing
-- the rules (create / edit / delete) is admin config, gated on settings.manage.
-- The rule engine lives in src/data/automations.js.

create table if not exists public.automations (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null default 'Automation',
  enabled boolean not null default true,
  trigger jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  creator_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists automations_company_idx
  on public.automations(company_id, created_at desc);

alter table public.automations enable row level security;

drop policy if exists "members read company automations" on public.automations;
create policy "members read company automations" on public.automations
for select to authenticated
using (
  app_private.is_company_member(company_id)
);

drop policy if exists "admins create company automations" on public.automations;
create policy "admins create company automations" on public.automations
for insert to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'settings.manage')
);

drop policy if exists "admins update company automations" on public.automations;
create policy "admins update company automations" on public.automations
for update to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'settings.manage')
)
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'settings.manage')
);

drop policy if exists "admins delete company automations" on public.automations;
create policy "admins delete company automations" on public.automations
for delete to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'settings.manage')
);

grant select, insert, update, delete on public.automations to authenticated;
