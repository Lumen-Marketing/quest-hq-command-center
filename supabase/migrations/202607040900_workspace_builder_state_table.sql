-- Capture the workspace_builder_state table that backs the Workspaces app
-- builder. It existed only in the live database (created out-of-band), so a
-- fresh environment provisioned purely from these migrations was missing it,
-- which made every workspace save silently fall back to browser localStorage.
--
-- This mirrors the live schema exactly: one company-scoped JSON document per
-- company, company-permission-gated via the shared app_private helpers.
-- Written idempotently so it is a no-op on the existing live database.

create table if not exists public.workspace_builder_state (
  company_id text primary key,
  doc jsonb not null default '{"workspaces": []}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.workspace_builder_state enable row level security;

drop policy if exists "members read workspace builder" on public.workspace_builder_state;
create policy "members read workspace builder"
  on public.workspace_builder_state for select to authenticated
  using (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'workspaces.view')
  );

drop policy if exists "managers insert workspace builder" on public.workspace_builder_state;
create policy "managers insert workspace builder"
  on public.workspace_builder_state for insert to authenticated
  with check (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'workspaces.manage')
  );

drop policy if exists "managers update workspace builder" on public.workspace_builder_state;
create policy "managers update workspace builder"
  on public.workspace_builder_state for update to authenticated
  using (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'workspaces.manage')
  )
  with check (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'workspaces.manage')
  );
