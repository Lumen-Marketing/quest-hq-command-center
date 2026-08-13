-- Company Records: the App Builder, at company scope.
--
-- Company Contacts shipped this morning as a fixed set of columns. It is really one instance
-- of a more useful thing -- a record type you define once and every workspace can point at.
-- Contacts, suppliers, properties, insurance carriers: same directory, different fields.
--
-- WHY ITS OWN STORAGE RATHER THAN A CORNER OF workspace_builder_state. That row's read policy
-- is `is_company_member AND subscription_allows_access AND has_company_permission
-- ('workspaces.view')`. A foreman who should see the directory may hold none of workspaces.*,
-- and widening that policy to let him would expose every workspace app's data to somebody who
-- cannot open a workspace. So: same document shape, different table, company-scoped policy.
--
-- The field ENGINE is not duplicated -- src/workspace/field-config-ui.js is already a factory
-- over a ctx, so Company Records reuses it and inherits all of its field types.

create table if not exists public.company_records_state (
  company_id text primary key references public.companies(id) on delete cascade,
  -- { records: [ { id, name, icon, color, description, titleFieldId, chipFieldId,
  --                fields: [...], items: [...] } ] }
  -- Deliberately the same app/field/item shape the workspace builder uses, so one set of
  -- renderers serves both and neither drifts.
  doc jsonb not null default '{"records": []}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.company_records_state enable row level security;

-- Read is every active member: a directory nobody outside one workspace can see is the exact
-- problem this replaces.
drop policy if exists "members read company records" on public.company_records_state;
create policy "members read company records" on public.company_records_state
for select using (app_private.is_company_member(company_id));

drop policy if exists "managers write company records" on public.company_records_state;
create policy "managers write company records" on public.company_records_state
for all using (app_private.has_company_permission(company_id, 'company_records.manage'))
with check (app_private.has_company_permission(company_id, 'company_records.manage'));

-- ---- Renames -----------------------------------------------------------------
-- All in one migration so nothing is left pointing at a name that no longer exists.

-- Drop, rename, then re-add. Adding the narrowed constraint first fails: the rows still say
-- company_contacts at that point, and the check is validated against them immediately.
alter table public.company_plugins drop constraint if exists company_plugins_known_plugin_check;

update public.company_plugins set plugin_id = 'company_records' where plugin_id = 'company_contacts';

alter table public.company_plugins add constraint company_plugins_known_plugin_check
  check (plugin_id = any (array[
    'crm', 'crm_2', 'company_records', 'underwriter', 'files', 'client_portal',
    'workspace_builder', 'price_book', 'forms', 'finance', 'messages', 'calendar',
    'time_clock', 'approvals', 'reporting', 'tasks', 'calls'
  ]));

-- Any role that was granted the old permission keeps the equivalent one, so a company that
-- had already handed it to a worker does not silently lose it.
update public.role_permissions
set permission_key = replace(permission_key, 'company_contacts.', 'company_records.')
where permission_key like 'company_contacts.%';

create or replace function app_private.permission_plugin_ids(permission text)
returns text[]
language sql
stable
set search_path = 'public', 'app_private', 'pg_temp'
as $$
  select case
    when permission like 'crm.%' then array['crm', 'crm_2']::text[]
    when permission like 'company_records.%' then array['company_records']::text[]
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

-- The App Builder field type follows the module's name. Rewritten inside the stored document
-- rather than left as an alias, because normalizeWorkspaceBuilderDoc silently coerces an
-- unrecognised type to `text` -- an alias that was ever missed would eat the field's values.
-- Matched on the value alone. jsonb::text renders a space after the colon, so a compact
-- `"type":"company_contact"` pattern matches nothing -- and the value cannot collide, since
-- no label or stored value in the document is the bare string "company_contact".
update public.workspace_builder_state
set doc = replace(doc::text, '"company_contact"', '"company_record"')::jsonb,
    updated_at = now()
where doc::text like '%"company_contact"%';

-- company_contacts and company_contact_options are left in place, unused. They hold no
-- contacts -- only the seeded label lists, which the first-run template regenerates -- and
-- dropping a table is the one step here that cannot be undone. They can go once this has
-- been used in anger for a week.

comment on table public.company_records_state is
  'Company-scoped record types and their items. Same document shape as workspace_builder_state, readable by every company member.';
