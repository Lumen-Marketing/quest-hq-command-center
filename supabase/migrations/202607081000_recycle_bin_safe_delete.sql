create table if not exists public.recycle_bin_items (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  source_type text not null,
  source_table text not null,
  source_id text not null,
  item_label text not null default '',
  status text not null default 'active',
  deleted_by uuid references public.profiles(id) on delete set null,
  deleted_by_label text not null default '',
  deleted_at timestamptz not null default now(),
  restore_until timestamptz not null default (now() + interval '30 days'),
  restored_at timestamptz,
  restored_by uuid references public.profiles(id) on delete set null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recycle_bin_items_status_check check (status in ('active', 'restored')),
  constraint recycle_bin_items_snapshot_object_check check (jsonb_typeof(snapshot) = 'object')
);

create index if not exists recycle_bin_items_company_status_idx
  on public.recycle_bin_items(company_id, status, restore_until, deleted_at desc);

create index if not exists recycle_bin_items_source_idx
  on public.recycle_bin_items(source_table, source_id);

alter table public.recycle_bin_items enable row level security;

drop policy if exists "members read recycle bin" on public.recycle_bin_items;
create policy "members read recycle bin" on public.recycle_bin_items
for select
to authenticated
using (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = recycle_bin_items.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
  )
);

drop policy if exists "members create recycle bin items" on public.recycle_bin_items;
create policy "members create recycle bin items" on public.recycle_bin_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = recycle_bin_items.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
  )
);

drop policy if exists "admins manage recycle bin" on public.recycle_bin_items;
create policy "admins manage recycle bin" on public.recycle_bin_items
for all
to authenticated
using (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = recycle_bin_items.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  )
  or app_private.has_company_permission(company_id, 'settings.manage')
)
with check (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = recycle_bin_items.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  )
  or app_private.has_company_permission(company_id, 'settings.manage')
);

grant select, insert, update, delete on public.recycle_bin_items to authenticated;

alter table public.contacts add column if not exists deleted_at timestamptz;
alter table public.contacts add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.accounts add column if not exists deleted_at timestamptz;
alter table public.accounts add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.deals add column if not exists deleted_at timestamptz;
alter table public.deals add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.jobs add column if not exists deleted_at timestamptz;
alter table public.jobs add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.tasks add column if not exists deleted_at timestamptz;
alter table public.tasks add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.activities add column if not exists deleted_at timestamptz;
alter table public.activities add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.proposal_documents add column if not exists deleted_at timestamptz;
alter table public.proposal_documents add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.forms add column if not exists deleted_at timestamptz;
alter table public.forms add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.form_responses add column if not exists deleted_at timestamptz;
alter table public.form_responses add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.job_files add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.client_portals add column if not exists deleted_at timestamptz;
alter table public.client_portals add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.client_portal_documents add column if not exists deleted_at timestamptz;
alter table public.client_portal_documents add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.pricebook_vendors add column if not exists deleted_at timestamptz;
alter table public.pricebook_vendors add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.pricebook_materials add column if not exists deleted_at timestamptz;
alter table public.pricebook_materials add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.pricebook_vendor_prices add column if not exists deleted_at timestamptz;
alter table public.pricebook_vendor_prices add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.finance_invoices add column if not exists deleted_at timestamptz;
alter table public.finance_invoices add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.finance_payments add column if not exists deleted_at timestamptz;
alter table public.finance_payments add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.finance_expenses add column if not exists deleted_at timestamptz;
alter table public.finance_expenses add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.finance_vendors add column if not exists deleted_at timestamptz;
alter table public.finance_vendors add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

alter table public.calendar_events add column if not exists deleted_at timestamptz;
alter table public.calendar_events add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists contacts_company_deleted_idx on public.contacts(company_id, deleted_at);
create index if not exists accounts_company_deleted_idx on public.accounts(company_id, deleted_at);
create index if not exists deals_company_deleted_idx on public.deals(company_id, deleted_at);
create index if not exists jobs_company_deleted_idx on public.jobs(company_id, deleted_at);
create index if not exists tasks_company_deleted_idx on public.tasks(company_id, deleted_at);
create index if not exists forms_company_deleted_idx on public.forms(company_id, deleted_at);
create index if not exists form_responses_company_deleted_idx on public.form_responses(company_id, deleted_at);
create index if not exists proposal_documents_company_deleted_idx on public.proposal_documents(company_id, deleted_at);
create index if not exists job_files_company_deleted_idx on public.job_files(company_id, deleted_at);

