-- One list store for both of the Company Contacts dropdowns.
--
-- Type shipped this morning with its own table. Company/organization needs exactly the same
-- behaviour -- type-ahead against what exists, auto-add when you use something new, and the
-- ability to remove an entry from the list -- so rather than a second near-identical table,
-- the existing one grows a `kind` and becomes the options store for both.
--
-- Renaming rather than adding a sibling because the table is hours old, holds only the
-- seeded Client/GC/Sub/Vendor labels, and a name that says "types" while holding companies
-- is the kind of small lie that costs an afternoon in six months.
--
-- Organizations are deliberately NOT seeded. A type list has sensible defaults for a trade;
-- a company's customer list does not, and it fills itself the first time somebody types one.

alter table if exists public.company_contact_types rename to company_contact_options;

alter table public.company_contact_options
  add column if not exists kind text not null default 'type';

alter table public.company_contact_options
  drop constraint if exists company_contact_types_company_id_label_key;

-- Scoped by kind: a customer can have a "Vendor" type and a company called Vendor without
-- one blocking the other.
create unique index if not exists company_contact_options_unique
  on public.company_contact_options (company_id, kind, lower(label));

drop index if exists company_contact_types_company_idx;
create index if not exists company_contact_options_company_idx
  on public.company_contact_options (company_id, kind, position);

alter table public.company_contact_options
  drop constraint if exists company_contact_options_kind_check;
alter table public.company_contact_options
  add constraint company_contact_options_kind_check check (kind in ('type', 'organization'));

-- Policies follow the table through the rename but keep their old names; recreated so the
-- names describe what they now guard.
drop policy if exists "company contact types read" on public.company_contact_options;
drop policy if exists "company contact types write" on public.company_contact_options;
drop policy if exists "company contact options read" on public.company_contact_options;
drop policy if exists "company contact options write" on public.company_contact_options;

create policy "company contact options read" on public.company_contact_options
for select using (app_private.is_company_member(company_id));

create policy "company contact options write" on public.company_contact_options
for all using (app_private.has_company_permission(company_id, 'company_contacts.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.manage'));

-- Backfill the organizations already implied by existing contacts, so the list starts out
-- agreeing with the data rather than looking empty next to populated records.
insert into public.company_contact_options (id, company_id, kind, label, color, position)
select
  'cco-' || c.company_id || '-org-' || md5(lower(c.organization)),
  c.company_id,
  'organization',
  min(c.organization),
  '#6b7280',
  0
from public.company_contacts c
where c.deleted_at is null
  and btrim(coalesce(c.organization, '')) <> ''
group by c.company_id, lower(c.organization)
on conflict do nothing;

comment on table public.company_contact_options is
  'Customer-editable dropdown lists for Company Contacts. kind = type | organization.';
