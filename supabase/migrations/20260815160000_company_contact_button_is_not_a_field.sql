-- A button on a contact card is not a FIELD.
--
-- "What button I want in the contact cards is not a field but a button to be configured."
--
-- 20260815120000 briefly allowed type = 'button' on company_contact_fields. That was the wrong
-- shape and this takes it back out. A field is something a contact HOLDS: it has a value, a
-- place on the add/edit form, and a column in the directory. A button has none of those -- it
-- stores nothing and can never be filled in -- so making it a field gave every contact in the
-- company a column that could not contain anything.
--
-- Where it lives now: `contactCard.buttons` on the workspace_builder_state document, beside the
-- card's tiles and panels. Company-scoped jsonb, already realtime-synced, merged and backed up,
-- and no column of its own is needed. See src/company-contacts/card-layout.js normalizeCardButton.
--
-- WHAT A BUTTON DOES, recorded here because it is the reason the shape matters: pressing one
-- creates a record in a chosen Workspace > App carrying the contact's chosen fields, matched to
-- that app by label and created there if missing. The contact's NAME is not sent as a value --
-- the target app gets a Company Contact field labelled "Contact" holding the contact's id, so
-- the new record stays tied to the card that produced it and contactUsage can find it again.
--
-- Safe: verified 2026-08-15 that exactly one row had type='button', unconfigured
-- ({"card":"header","text":"Button"}), created while testing. It is removed below -- nothing is
-- lost, because a button field never held a value on any contact by construction.

delete from public.company_contact_fields
where type = 'button';

alter table public.company_contact_fields
  drop constraint if exists company_contact_fields_type_check;

alter table public.company_contact_fields
  add constraint company_contact_fields_type_check check (type in (
    -- the original eleven
    'text', 'textarea', 'number', 'money', 'phone', 'email',
    'location', 'file', 'category', 'checkbox', 'date',
    -- values a contact holds on its own
    'url', 'status', 'tags', 'rating', 'duration', 'progress',
    'checklist', 'image', 'sheet',
    -- people inside the company
    'user',
    -- worked out rather than typed
    'calculation', 'autonumber', 'created_time', 'updated_time'
  ));

comment on column public.company_contact_fields.type is
  'App Builder field type. Excludes relationship / rollup (they resolve implicitly against the app they live in), company_contact (circular from a contact; that type stays in the app palette), and button (not a value a contact holds -- card buttons live in contactCard.buttons on the builder document).';
