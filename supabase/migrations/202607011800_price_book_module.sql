-- Price Book (Estimating): tenant-scoped vendor cost catalog. See app for full app-layer docs.
-- Cost only — sell price never lives here (margin tiers apply downstream in the Estimator).
-- (Applied to the live project via Supabase MCP on 2026-07-01; this file mirrors it for source tracking.)

create table if not exists public.pricebook_vendors (
  id             uuid primary key default gen_random_uuid(),
  company_id     text not null references public.companies(id) on delete cascade,
  name           text not null,
  type           text not null default 'supply_house'
                   check (type in ('supply_house','lumber_yard','distributor','manufacturer')),
  account_ref    text,
  color          text default '#ED4E0D',
  last_synced_at timestamptz,
  created_by     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.pricebook_materials (
  id         uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  name       text not null,
  category   text,
  unit       text not null default 'each',
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

create table if not exists public.pricebook_vendor_prices (
  id          uuid primary key default gen_random_uuid(),
  company_id  text not null references public.companies(id) on delete cascade,
  material_id uuid not null references public.pricebook_materials(id) on delete cascade,
  vendor_id   uuid not null references public.pricebook_vendors(id) on delete cascade,
  sku         text,
  unit_cost   numeric(12,2) not null check (unit_cost >= 0),
  updated_at  timestamptz not null default now(),
  unique (company_id, vendor_id, material_id)
);

create index if not exists pricebook_prices_material_idx on public.pricebook_vendor_prices (company_id, material_id);
create index if not exists pricebook_prices_vendor_idx   on public.pricebook_vendor_prices (company_id, vendor_id);
create index if not exists pricebook_materials_cat_idx    on public.pricebook_materials (company_id, category);

create or replace view public.v_pricebook_material_best as
select distinct on (vp.company_id, vp.material_id)
  vp.company_id, vp.material_id, vp.vendor_id, vp.unit_cost, vp.updated_at
from public.pricebook_vendor_prices vp
order by vp.company_id, vp.material_id, vp.unit_cost asc;

alter table public.pricebook_vendors enable row level security;
alter table public.pricebook_materials enable row level security;
alter table public.pricebook_vendor_prices enable row level security;

create policy "members read pricebook vendors" on public.pricebook_vendors for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'::text));
create policy "managers insert pricebook vendors" on public.pricebook_vendors for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers update pricebook vendors" on public.pricebook_vendors for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers delete pricebook vendors" on public.pricebook_vendors for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));

create policy "members read pricebook materials" on public.pricebook_materials for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'::text));
create policy "managers insert pricebook materials" on public.pricebook_materials for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers update pricebook materials" on public.pricebook_materials for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers delete pricebook materials" on public.pricebook_materials for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));

create policy "members read pricebook prices" on public.pricebook_vendor_prices for select to authenticated
  using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.view'::text));
create policy "managers insert pricebook prices" on public.pricebook_vendor_prices for insert to authenticated
  with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers update pricebook prices" on public.pricebook_vendor_prices for update to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text))
  with check (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
create policy "managers delete pricebook prices" on public.pricebook_vendor_prices for delete to authenticated
  using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'price_book.manage'::text));
