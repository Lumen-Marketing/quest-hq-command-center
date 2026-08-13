-- Company Contacts: one directory of people, shared across every workspace in a company.
--
-- WHY A NEW TABLE RATHER THAN REUSING public.contacts. `contacts` is workspace-private by
-- design -- its RLS is is_workspace_member + crm.view -- and it belongs to the CRM plugin's
-- own pipeline, carrying stage, temperature, pay type and roof system. This is a different
-- object: a company-wide address book that custom workspace apps point at, with no pipeline
-- position of its own. Widening `contacts` to company scope would have meant relaxing a
-- workspace boundary that other modules depend on.
--
-- The intended end state is that a company uses ONE of the two. A company building its
-- pipeline out of App Builder apps uses these; a company on the packaged CRM plugin uses
-- `contacts`. Running both as first-class is how you end up with two of every customer.
--
-- READ IS EVERY ACTIVE MEMBER, deliberately. The whole point is that a foreman in Production
-- and a closer in Sales are looking at the same person. Writing is gated on
-- company_contacts.manage, which owners, admins and developers hold implicitly.

create table if not exists public.company_contacts (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  -- Free text, validated against company_contact_types in the browser rather than by a
  -- constraint: the type list is customer-editable, and a check constraint would turn every
  -- new label into a migration.
  contact_type text not null default '',
  organization text not null default '',
  phone text not null default '',
  email text not null default '',
  location text not null default '',
  notes text not null default '',
  last_activity_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null
);

create index if not exists company_contacts_company_idx on public.company_contacts (company_id) where deleted_at is null;
create index if not exists company_contacts_company_name_idx on public.company_contacts (company_id, lower(name));

-- The customer's own words for what a contact is. Client / GC / Sub / Vendor are only the
-- seed: a landscaper wants Homeowner and Property Manager instead.
create table if not exists public.company_contact_types (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  label text not null,
  color text not null default '#6b7280',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, label)
);

create index if not exists company_contact_types_company_idx on public.company_contact_types (company_id, position);

alter table public.company_contacts enable row level security;
alter table public.company_contact_types enable row level security;

drop policy if exists "company contacts read" on public.company_contacts;
create policy "company contacts read" on public.company_contacts
for select using (app_private.is_company_member(company_id));

drop policy if exists "company contacts insert" on public.company_contacts;
create policy "company contacts insert" on public.company_contacts
for insert with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

drop policy if exists "company contacts update" on public.company_contacts;
create policy "company contacts update" on public.company_contacts
for update using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

drop policy if exists "company contacts delete" on public.company_contacts;
create policy "company contacts delete" on public.company_contacts
for delete using (app_private.has_company_permission(company_id, 'company_contacts.manage'));

drop policy if exists "company contact types read" on public.company_contact_types;
create policy "company contact types read" on public.company_contact_types
for select using (app_private.is_company_member(company_id));

drop policy if exists "company contact types write" on public.company_contact_types;
create policy "company contact types write" on public.company_contact_types
for all using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

-- Map the new permission onto its plugin. Without this the plugin gate returns an empty
-- array, which permission_plugin_available reads as "no plugin required" -- so the module
-- would stay reachable for a company that had uninstalled it.
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

-- company_plugins whitelists known plugin ids, so a new one has to be named there before it
-- can be installed. Widened rather than dropped: the constraint is what stops a typo in a
-- plugin id from silently granting nothing.
alter table public.company_plugins drop constraint if exists company_plugins_known_plugin_check;
alter table public.company_plugins add constraint company_plugins_known_plugin_check
  check (plugin_id = any (array[
    'crm', 'crm_2', 'company_contacts', 'underwriter', 'files', 'client_portal',
    'workspace_builder', 'price_book', 'forms', 'finance', 'messages', 'calendar',
    'time_clock', 'approvals', 'reporting', 'tasks', 'calls'
  ]));

-- Baseline: every existing company gets it, or the gate above locks out the very owners the
-- module is for. New companies are covered by the client's baseline plugin list.
insert into public.company_plugins (company_id, plugin_id, status, installed_at)
select c.id, 'company_contacts', 'installed', now()
from public.companies c
on conflict (company_id, plugin_id) do nothing;

-- Seed each company's type list with the four that cover most trades. Editable afterwards,
-- and only inserted where a company has none, so a re-run cannot resurrect a deleted label.
insert into public.company_contact_types (id, company_id, label, color, position)
select
  'cct-' || c.id || '-' || t.slug,
  c.id,
  t.label,
  t.color,
  t.position
from public.companies c
cross join (values
  ('client', 'Client', '#16a34a', 1),
  ('gc', 'GC', '#2563eb', 2),
  ('sub', 'Sub', '#7c3aed', 3),
  ('vendor', 'Vendor', '#d97706', 4)
) as t(slug, label, color, position)
where not exists (
  select 1 from public.company_contact_types existing where existing.company_id = c.id
)
on conflict do nothing;

comment on table public.company_contacts is
  'Company-wide contact directory. Shared by every workspace; App Builder company_contact fields point at these rows.';
