-- Customer-defined fields for Company Contacts.
--
-- The form was seven fixed columns. A roofing company wants a COI expiry on a sub; a property
-- manager wants a door code. So the shape becomes theirs: a field list per company, and the
-- values on a contact keyed by field id.
--
-- Named field_values, not values: VALUES is a reserved word, so every raw-SQL reference
-- would need quoting and one forgotten pair of quotes parses as something else entirely.
--
-- `name` stays a real column. Every contact needs one, it is the title in every list and
-- link, and it is what search sorts on -- making it a custom field would let somebody delete
-- the only thing that identifies a row.
--
-- The old columns (contact_type, organization, phone, email, location, notes) are left in
-- place and their data is copied into `values` below, so nothing is lost and a rollback is a
-- code change rather than a data recovery. They can be dropped once this has settled.

alter table public.company_contacts
  add column if not exists field_values jsonb not null default '{}'::jsonb;

create table if not exists public.company_contact_fields (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  label text not null,
  -- Validated here as well as in the browser: an unknown type renders as nothing, and a
  -- typo would be invisible until somebody opened the form.
  type text not null check (type in (
    'text', 'textarea', 'number', 'money', 'phone', 'email',
    'location', 'file', 'category', 'checkbox', 'date'
  )),
  config jsonb not null default '{}'::jsonb,
  required boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_contact_fields_company_idx
  on public.company_contact_fields (company_id, position);

alter table public.company_contact_fields enable row level security;

drop policy if exists "company contact fields read" on public.company_contact_fields;
create policy "company contact fields read" on public.company_contact_fields
for select using (app_private.is_company_member(company_id));

drop policy if exists "company contact fields write" on public.company_contact_fields;
create policy "company contact fields write" on public.company_contact_fields
for all using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

-- Seed every company with the form it already had, so nothing changes on the day this ships
-- and the defaults are a starting point rather than a decision.
insert into public.company_contact_fields (id, company_id, label, type, position, config)
select
  'ccf-' || c.id || '-' || f.slug,
  c.id,
  f.label,
  f.type,
  f.position,
  case when f.slug = 'type'
    then jsonb_build_object('options', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label, 'color', o.color) order by o.position)
      from public.company_contact_options o
      where o.company_id = c.id and o.kind = 'type'
    ), '[]'::jsonb))
    else '{}'::jsonb
  end
from public.companies c
cross join (values
  ('type', 'Type', 'category', 1),
  ('organization', 'Company', 'text', 2),
  ('phone', 'Phone', 'phone', 3),
  ('email', 'Email', 'email', 4),
  ('location', 'Location', 'location', 5),
  ('notes', 'Notes', 'textarea', 6)
) as f(slug, label, type, position)
where not exists (
  select 1 from public.company_contact_fields existing where existing.company_id = c.id
)
on conflict do nothing;

-- Carry the existing column data across, keyed by the seeded field ids. Only where the
-- contact has no values yet, so a re-run cannot overwrite something edited since.
update public.company_contacts c
set field_values = jsonb_strip_nulls(jsonb_build_object(
  'ccf-' || c.company_id || '-type',         nullif(c.contact_type, ''),
  'ccf-' || c.company_id || '-organization', nullif(c.organization, ''),
  'ccf-' || c.company_id || '-phone',        nullif(c.phone, ''),
  'ccf-' || c.company_id || '-email',        nullif(c.email, ''),
  'ccf-' || c.company_id || '-location',     nullif(c.location, ''),
  'ccf-' || c.company_id || '-notes',        nullif(c.notes, '')
))
where c.field_values = '{}'::jsonb;

comment on table public.company_contact_fields is
  'Customer-defined fields for Company Contacts. Values live in company_contacts.field_values, keyed by field id.';
