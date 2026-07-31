-- Index the six foreign keys that have no covering index.
--
-- An unindexed foreign key makes every DELETE or key UPDATE on the PARENT row scan the
-- whole child table to enforce the constraint. That is invisible while tables are small
-- and becomes a lock-holding sequential scan once they are not — deleting a role or a
-- profile is exactly the kind of admin action that would start timing out.
--
-- Derived by comparing pg_constraint against pg_index rather than from the advisor's
-- warning count: the advisor reports 32 findings, but most are other categories (unused
-- indexes, repeated policy evaluation). Only these six are genuinely uncovered.
--
-- Plain CREATE INDEX, not CONCURRENTLY: these tables are small, migrations run in a
-- transaction, and CONCURRENTLY cannot run inside one.

create index if not exists calendar_events_created_by_idx
  on public.calendar_events (created_by);

create index if not exists company_join_requests_profile_id_idx
  on public.company_join_requests (profile_id);

create index if not exists field_permissions_role_id_idx
  on public.field_permissions (role_id);

-- Both sides of the price-book join: a vendor or material delete touches this table.
create index if not exists pricebook_vendor_prices_material_id_idx
  on public.pricebook_vendor_prices (material_id);

create index if not exists pricebook_vendor_prices_vendor_id_idx
  on public.pricebook_vendor_prices (vendor_id);

-- Role deletion and every permission lookup that starts from a role.
create index if not exists user_role_assignments_role_id_idx
  on public.user_role_assignments (role_id);
