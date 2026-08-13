-- Revert the Company Records rename. Back to Company Contacts, as it was.
--
-- The generalisation (a record type you define once, with its own fields) was the right idea
-- and is not what failed -- the module simply stopped being visible, because renaming the
-- plugin in code orphaned the workspace_plugins rows that still carried the old id. Rather
-- than carry a half-built feature under a reverted name, the record-type layer is removed
-- entirely and the working directory comes back.
--
-- Forward again later is cheap: the shape is recorded in .ai/decisions.md, and the one thing
-- to do differently is rename the workspace_plugins rows in the SAME migration as the code.

-- Tables. Data is preserved -- these are the same rows throughout, only the name moved.
alter table if exists public.company_records rename to company_contacts;
alter table if exists public.company_record_options rename to company_contact_options;

drop policy if exists "company records read" on public.company_contacts;
drop policy if exists "company records insert" on public.company_contacts;
drop policy if exists "company records update" on public.company_contacts;
drop policy if exists "company records delete" on public.company_contacts;

create policy "company contacts read" on public.company_contacts
for select using (app_private.is_company_member(company_id));

create policy "company contacts insert" on public.company_contacts
for insert with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

create policy "company contacts update" on public.company_contacts
for update using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

create policy "company contacts delete" on public.company_contacts
for delete using (app_private.has_company_permission(company_id, 'company_contacts.manage'));

drop policy if exists "company record options read" on public.company_contact_options;
drop policy if exists "company record options write" on public.company_contact_options;

create policy "company contact options read" on public.company_contact_options
for select using (app_private.is_company_member(company_id));

create policy "company contact options write" on public.company_contact_options
for all using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

-- Plugin id. Drop the whitelist, move the rows, then re-add it -- adding the narrowed check
-- first fails, because it is validated against rows that still carry the old id.
alter table public.company_plugins drop constraint if exists company_plugins_known_plugin_check;

update public.company_plugins set plugin_id = 'company_contacts' where plugin_id = 'company_records';
update public.workspace_plugins set plugin_id = 'company_contacts' where plugin_id = 'company_records';

alter table public.company_plugins add constraint company_plugins_known_plugin_check
  check (plugin_id = any (array[
    'crm', 'crm_2', 'company_contacts', 'underwriter', 'files', 'client_portal',
    'workspace_builder', 'price_book', 'forms', 'finance', 'messages', 'calendar',
    'time_clock', 'approvals', 'reporting', 'tasks', 'calls'
  ]));

update public.role_permissions
set permission_key = replace(permission_key, 'company_records.', 'company_contacts.')
where permission_key like 'company_records.%';

create or replace function app_private.permission_plugin_ids(permission text)
returns text[]
language sql
stable
set search_path = 'public', 'app_private', 'pg_temp'
as $$
  select case
    when permission like 'crm.%' then array['crm', 'crm_2']::text[]
    when permission like 'company_contacts.%' then array['company_contacts']::text[]
    when permission like 'underwriter.%' then array['underwriter']::text[]
    when permission like 'files.%' then array['files']::text[]
    when permission like 'client_portals.%' then array['client_portal']::text[]
    when permission like 'workspaces.%' then array['workspace_builder']::text[]
    when permission like 'price_book.%' then array['price_book']::text[]
    when permission like 'forms.%' then array['forms']::text[]
    when permission like 'finance.%' then array['finance']::text[]
    when permission like 'messages.%' then array['messages']::text[]
    when permission like 'calendar.%' then array['calendar']::text[]
    when permission in ('time.track', 'clock.manage') then array['time_clock']::text[]
    when permission like 'approvals.%' then array['approvals']::text[]
    when permission = 'team.view' then array['reporting', 'calls']::text[]
    else array[]::text[]
  end;
$$;

-- The App Builder field type follows the module's name back. Matched on the value alone:
-- jsonb::text renders a space after the colon, so a compact "type":"..." pattern matches
-- nothing -- the mistake that left this field dangling the first time.
update public.workspace_builder_state
set doc = replace(doc::text, '"company_record"', '"company_contact"')::jsonb,
    updated_at = now()
where doc::text like '%"company_record"%';

-- Nothing was ever written to it, and leaving an empty table for a feature that no longer
-- exists is the loose end this revert is meant to remove.
drop table if exists public.company_records_state;
