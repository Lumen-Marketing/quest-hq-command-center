-- Pin the helper to an empty search path. Its body is schema-independent, so
-- this removes role-controlled name resolution without changing its result.
alter function app_private.company_setup_role_permissions(text)
  set search_path = '';

-- Foreign-key indexes keep parent updates/deletes and tenant-scoped joins from
-- degrading as the currently small production tables grow.
create index if not exists idx_companies_primary_owner_profile_id
  on public.companies (primary_owner_profile_id);

create index if not exists idx_company_contacts_created_by
  on public.company_contacts (created_by);
create index if not exists idx_company_contacts_deleted_by
  on public.company_contacts (deleted_by);

create index if not exists idx_company_time_entries_profile_id
  on public.company_time_entries (profile_id);

create index if not exists idx_job_change_order_lines_company_id
  on public.job_change_order_lines (company_id);
create index if not exists idx_job_change_order_lines_job_id
  on public.job_change_order_lines (job_id);
create index if not exists idx_job_change_order_lines_material_id
  on public.job_change_order_lines (material_id);

create index if not exists idx_job_change_orders_company_id
  on public.job_change_orders (company_id);
create index if not exists idx_job_change_orders_created_by
  on public.job_change_orders (created_by);

create index if not exists idx_job_cost_buckets_company_id
  on public.job_cost_buckets (company_id);

create index if not exists idx_job_dailies_company_id
  on public.job_dailies (company_id);
create index if not exists idx_job_dailies_created_by
  on public.job_dailies (created_by);

create index if not exists idx_job_draws_company_id
  on public.job_draws (company_id);

create index if not exists idx_job_plans_company_id
  on public.job_plans (company_id);

create index if not exists idx_underwriting_calculators_created_by
  on public.underwriting_calculators (created_by);

create index if not exists idx_wb_intake_links_created_by
  on public.wb_intake_links (created_by);
create index if not exists idx_wb_intake_links_workspace_id
  on public.wb_intake_links (workspace_id);

create index if not exists idx_wb_intake_submissions_reviewed_by
  on public.wb_intake_submissions (reviewed_by);
create index if not exists idx_wb_intake_submissions_workspace_id
  on public.wb_intake_submissions (workspace_id);

create index if not exists idx_wb_record_events_created_by
  on public.wb_record_events (created_by);
create index if not exists idx_wb_record_events_workspace_id
  on public.wb_record_events (workspace_id);
