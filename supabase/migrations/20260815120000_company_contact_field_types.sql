-- Company Contacts gets the App Builder's field palette.
--
-- "Can you copy all of the available fields we have in the workspaces app, so I can fully
-- connect the company contacts on the workspace app."
--
-- The original constraint listed eleven types -- the ones that obviously mean something on a
-- person. In practice a contact carries far more than that: a rating for a sub, a checklist of
-- what has been collected from them, a photo, an account manager, a licence expiry, a takeoff
-- sheet. Every one of those types already has a renderer, a config panel and a stored shape in
-- the App Builder, so widening the list here is what stops Company Contacts being the poor
-- relation of an app.
--
-- WHAT IS DELIBERATELY STILL MISSING, and why each one differs:
--
--   relationship, rollup -- both resolve IMPLICITLY against the app they live in. A relationship
--     points at items in a particular app and a rollup aggregates across one, and neither has an
--     app to resolve against from a contact that belongs to the whole company. Left out rather
--     than accepted and rendered as nothing.
--
--   company_contact -- a contact pointing at another contact is circular, and it is the one
--     borrowed type that says nothing about a person. NOTE this is only about the CONTACTS
--     palette: the Company Contact field stays in the APP palette, because that is how a
--     workspace app points at a contact and it is what the contact card is built from.
--
-- WHAT IS NEW HERE: button. It was originally grouped with relationship and rollup on the
-- grounds that it "names an app", but that reasoning does not survive contact with the code. A
-- button resolves its target EXPLICITLY -- config.targetCompany plus config.targetApp -- and
-- src/workspace/button-push.js resolveTarget() walks every workspace in that company to find it.
-- So "which app" has an answer from a contact for exactly the same reason it has one for a
-- button pointing at another workspace's app: the button was told.
--
-- The constraint is validated in the browser too (COMPANY_CONTACT_FIELD_TYPES in main.js).
-- Both are kept because they fail differently: the browser one falls back to text so the value
-- stays readable, and this one stops a bad row reaching the table at all.
--
-- SAFE TO APPLY: every row in company_contact_fields today is one of the original eleven
-- (verified 2026-08-15: category, email, location, phone, textarea, text only), so nothing
-- existing violates the widened list.

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
    -- a control rather than a value: it carries the contact into a workspace app, changes
    -- fields on the contact, or opens a link. Its target is named in its own config.
    'button',
    -- worked out rather than typed
    'calculation', 'autonumber', 'created_time', 'updated_time'
  ));

comment on column public.company_contact_fields.type is
  'App Builder field type. Everything except relationship / rollup (which resolve implicitly against the app they live in) and company_contact (circular from a contact; that type stays in the app palette).';
