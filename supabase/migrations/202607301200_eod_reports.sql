-- End-of-day reports as a first-class Operations module.
--
-- Mirrors the format the team already posts in chat (calls, quotes, appointments,
-- follow-ups, hot leads, blockers) so nothing is lost in translation, but with the
-- counts as real columns that can be totalled instead of free text in a message.
--
-- Tenancy follows the same shape as every other company-scoped table: company
-- membership plus subscription plus an explicit permission. Owners and developers get
-- eod.view/eod.manage implicitly through has_company_permission; everyone else needs
-- the permission granted on their role.

create table if not exists public.eod_reports (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  report_date date not null,
  team_member text not null default '',
  calls_made integer not null default 0,
  quotes_sent integer not null default 0,
  appointments_set integer not null default 0,
  follow_ups_completed integer not null default 0,
  hot_leads text not null default '',
  blockers text not null default '',
  status text not null default 'submitted',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eod_reports_status_check check (status in ('draft', 'submitted', 'reviewed')),
  -- Counts are tallies, never negative. Bounded so a typo cannot poison a total.
  constraint eod_reports_counts_check check (
    calls_made between 0 and 100000
    and quotes_sent between 0 and 100000
    and appointments_set between 0 and 100000
    and follow_ups_completed between 0 and 100000
  ),
  constraint eod_reports_text_check check (
    length(team_member) <= 120 and length(hot_leads) <= 4000 and length(blockers) <= 4000
  )
);

create index if not exists eod_reports_company_date_idx
  on public.eod_reports (company_id, report_date desc);
create index if not exists eod_reports_workspace_idx
  on public.eod_reports (workspace_id);
create index if not exists eod_reports_created_by_idx
  on public.eod_reports (created_by);

alter table public.eod_reports enable row level security;

drop policy if exists "eod reports read" on public.eod_reports;
create policy "eod reports read" on public.eod_reports
for select to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'eod.view')
);

-- Anyone who can view may file a report, but only as themselves.
drop policy if exists "eod reports insert" on public.eod_reports;
create policy "eod reports insert" on public.eod_reports
for insert to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and app_private.has_company_permission(company_id, 'eod.view')
  and created_by = (select auth.uid())
);

-- Authors can correct their own numbers; managers can review anyone's.
drop policy if exists "eod reports update" on public.eod_reports;
create policy "eod reports update" on public.eod_reports
for update to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and (created_by = (select auth.uid()) or app_private.has_company_permission(company_id, 'eod.manage'))
)
with check (
  app_private.is_company_member(company_id)
  and app_private.subscription_allows_access(company_id)
  and (created_by = (select auth.uid()) or app_private.has_company_permission(company_id, 'eod.manage'))
);

drop policy if exists "eod reports delete" on public.eod_reports;
create policy "eod reports delete" on public.eod_reports
for delete to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'eod.manage')
);

grant select, insert, update, delete on public.eod_reports to authenticated;

create or replace function public.touch_eod_report_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists eod_reports_touch_updated_at on public.eod_reports;
create trigger eod_reports_touch_updated_at
before update on public.eod_reports
for each row execute function public.touch_eod_report_updated_at();
