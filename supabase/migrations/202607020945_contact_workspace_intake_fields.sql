-- Persist the CRM intake fields used by the Quest CRM contact workspace.
-- Additive only: no existing contact data is rewritten or removed.

alter table public.contacts
  add column if not exists source text not null default '',
  add column if not exists pay_type text not null default '',
  add column if not exists roof_system text not null default '',
  add column if not exists secondary_roof_system text not null default '',
  add column if not exists has_multiple_roof_systems boolean not null default false;

create index if not exists contacts_company_source_idx
  on public.contacts(company_id, source);
