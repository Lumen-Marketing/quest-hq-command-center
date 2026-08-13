-- Follow the module's rename. These two tables are the interim fixed-field store that
-- company_records_state will replace once record types are customizable; until then the
-- client reads them, so their names have to match what it asks for.
--
-- Policies are recreated rather than left to follow the table, so their names describe what
-- they now guard and their permission key matches the renamed one.
alter table if exists public.company_contacts rename to company_records;
alter table if exists public.company_contact_options rename to company_record_options;

drop policy if exists "company contacts read" on public.company_records;
drop policy if exists "company contacts insert" on public.company_records;
drop policy if exists "company contacts update" on public.company_records;
drop policy if exists "company contacts delete" on public.company_records;

create policy "company records read" on public.company_records
for select using (app_private.is_company_member(company_id));

create policy "company records insert" on public.company_records
for insert with check (app_private.has_company_permission(company_id, 'company_records.manage'));

create policy "company records update" on public.company_records
for update using (app_private.has_company_permission(company_id, 'company_records.manage'))
with check (app_private.has_company_permission(company_id, 'company_records.manage'));

create policy "company records delete" on public.company_records
for delete using (app_private.has_company_permission(company_id, 'company_records.manage'));

drop policy if exists "company contact options read" on public.company_record_options;
drop policy if exists "company contact options write" on public.company_record_options;

create policy "company record options read" on public.company_record_options
for select using (app_private.is_company_member(company_id));

create policy "company record options write" on public.company_record_options
for all using (app_private.has_company_permission(company_id, 'company_records.manage'))
with check (app_private.has_company_permission(company_id, 'company_records.manage'));
