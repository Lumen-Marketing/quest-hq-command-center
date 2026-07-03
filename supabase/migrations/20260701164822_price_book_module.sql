create table if not exists public.pricebook_vendors (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  type text not null default 'supply_house',
  account_ref text,
  color text not null default '#ED4E0D',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, name)
);

create table if not exists public.pricebook_materials (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  category text not null default 'Uncategorized',
  unit text not null default 'each',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, name)
);

create table if not exists public.pricebook_vendor_prices (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  vendor_id uuid not null references public.pricebook_vendors(id) on delete cascade,
  material_id uuid not null references public.pricebook_materials(id) on delete cascade,
  sku text,
  unit_cost numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, vendor_id, material_id)
);

alter table public.pricebook_vendors enable row level security;
alter table public.pricebook_materials enable row level security;
alter table public.pricebook_vendor_prices enable row level security;

drop policy if exists pricebook_vendors_member_access on public.pricebook_vendors;
drop policy if exists pricebook_vendors_member_read on public.pricebook_vendors;
drop policy if exists pricebook_vendors_admin_insert on public.pricebook_vendors;
drop policy if exists pricebook_vendors_admin_update on public.pricebook_vendors;
drop policy if exists pricebook_vendors_admin_delete on public.pricebook_vendors;
create policy pricebook_vendors_member_read on public.pricebook_vendors
  for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'));
create policy pricebook_vendors_admin_insert on public.pricebook_vendors
  for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_vendors_admin_update on public.pricebook_vendors
  for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_vendors_admin_delete on public.pricebook_vendors
  for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));

drop policy if exists pricebook_materials_member_access on public.pricebook_materials;
drop policy if exists pricebook_materials_member_read on public.pricebook_materials;
drop policy if exists pricebook_materials_admin_insert on public.pricebook_materials;
drop policy if exists pricebook_materials_admin_update on public.pricebook_materials;
drop policy if exists pricebook_materials_admin_delete on public.pricebook_materials;
create policy pricebook_materials_member_read on public.pricebook_materials
  for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'));
create policy pricebook_materials_admin_insert on public.pricebook_materials
  for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_materials_admin_update on public.pricebook_materials
  for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_materials_admin_delete on public.pricebook_materials
  for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));

drop policy if exists pricebook_vendor_prices_member_access on public.pricebook_vendor_prices;
drop policy if exists pricebook_vendor_prices_member_read on public.pricebook_vendor_prices;
drop policy if exists pricebook_vendor_prices_admin_insert on public.pricebook_vendor_prices;
drop policy if exists pricebook_vendor_prices_admin_update on public.pricebook_vendor_prices;
drop policy if exists pricebook_vendor_prices_admin_delete on public.pricebook_vendor_prices;
create policy pricebook_vendor_prices_member_read on public.pricebook_vendor_prices
  for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'));
create policy pricebook_vendor_prices_admin_insert on public.pricebook_vendor_prices
  for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_vendor_prices_admin_update on public.pricebook_vendor_prices
  for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));
create policy pricebook_vendor_prices_admin_delete on public.pricebook_vendor_prices
  for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'));

grant select, insert, update, delete on public.pricebook_vendors to authenticated;
grant select, insert, update, delete on public.pricebook_materials to authenticated;
grant select, insert, update, delete on public.pricebook_vendor_prices to authenticated;
