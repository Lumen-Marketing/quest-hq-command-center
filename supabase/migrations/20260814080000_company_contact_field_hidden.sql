-- Company Contact fields get the App Builder's "hidden" flag.
--
-- The field editor is now the App Builder's own: a field list you drag to reorder, and a
-- palette of types you drag in. That editor has always offered three things per field --
-- hide, configure, delete -- and hide had nowhere to live here.
--
-- It means the same thing it does in an app: hidden from the directory's columns and the
-- card's details, still on the form and still stored. Somebody's date of birth belongs on the
-- record without being a column everyone reads.
--
-- A real column rather than a key in `config`, to match `required`: both are properties of
-- the field itself, not of the type it happens to be.

alter table public.company_contact_fields
  add column if not exists hidden boolean not null default false;

comment on column public.company_contact_fields.hidden is
  'Hidden from the directory table and the contact card, still collected on the form.';
