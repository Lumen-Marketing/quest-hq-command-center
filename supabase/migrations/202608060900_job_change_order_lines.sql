-- Change-order pricing: the lines a price is built from.
--
-- job_change_orders already carries `price` and `cost`. Those are the answer; this table is
-- the working. Without it a change order is a number somebody typed, and there is no way to
-- tell a $3,590 that was priced from a $3,590 that was guessed -- which is exactly where
-- change-order money is lost.
--
-- One table for both labour and materials, because the arithmetic is the same shape:
--
--     amount = qty * days * unit_cost
--
-- Labour reads as "2 guys x 1.5 days x $280/day". Material reads as "14 x 1 x $12.40" -- days
-- is 1 and the row is a quantity. Splitting these into two tables would duplicate every
-- policy and every read for no gain.

create table if not exists public.job_change_order_lines (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  change_order_id uuid not null references public.job_change_orders(id) on delete cascade,
  kind text not null default 'material'
    check (kind in ('labor', 'material', 'hardware', 'equipment')),
  label text not null,
  -- Guys, for labour. Units bought, for everything else.
  qty numeric(12, 2) not null default 1 check (qty >= 0),
  -- Only labour uses this; the rest leave it at a day.
  days numeric(12, 2) not null default 1 check (days >= 0),
  -- Day rate for labour, unit cost for material.
  unit_cost numeric(12, 2) not null default 0,
  -- Where the price came from, when it came from the price book. Kept as a soft link: the
  -- change order is a historical record, so deleting a material must not rewrite what was
  -- quoted. set null, never cascade.
  material_id uuid references public.pricebook_materials(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_change_order_lines_co_idx
  on public.job_change_order_lines (change_order_id, sort_order);

-- How the change order was priced from its lines. A flat fee is a legitimate answer -- some
-- work is quoted as a number, not built up -- so the method is recorded rather than inferred
-- from whether lines exist.
alter table public.job_change_orders
  add column if not exists pricing_method text not null default 'lines'
  check (pricing_method in ('lines', 'flat'));

-- The margin the price was set at, kept so re-opening the wizard restores the slider rather
-- than back-computing it and drifting on rounding.
alter table public.job_change_orders
  add column if not exists margin_pct numeric(5, 2) not null default 0;

-- ---- tenancy ---------------------------------------------------------------------------------
-- Identical to the other production tables: visibility follows the job, writes need manage.
alter table public.job_change_order_lines enable row level security;
revoke all on public.job_change_order_lines from anon;
grant select, insert, update, delete on public.job_change_order_lines to authenticated;

drop policy if exists "job_change_order_lines read" on public.job_change_order_lines;
create policy "job_change_order_lines read" on public.job_change_order_lines for select to authenticated
  using (app_private.can_view_job(job_id));

drop policy if exists "job_change_order_lines insert" on public.job_change_order_lines;
create policy "job_change_order_lines insert" on public.job_change_order_lines for insert to authenticated
  with check (app_private.can_manage_job(job_id));

drop policy if exists "job_change_order_lines update" on public.job_change_order_lines;
create policy "job_change_order_lines update" on public.job_change_order_lines for update to authenticated
  using (app_private.can_manage_job(job_id))
  with check (app_private.can_manage_job(job_id));

drop policy if exists "job_change_order_lines delete" on public.job_change_order_lines;
create policy "job_change_order_lines delete" on public.job_change_order_lines for delete to authenticated
  using (app_private.can_manage_job(job_id));
