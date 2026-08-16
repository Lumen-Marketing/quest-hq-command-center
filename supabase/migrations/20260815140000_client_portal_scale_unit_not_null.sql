-- Reconcile client_portal_documents.scale_unit with what production actually has.
--
-- 202607041100_client_portal_document_review_fields.sql added the column as a NULLABLE text
-- with `check (scale_unit is null or scale_unit in ('ft','in','cm'))`. Production, however, is
-- NOT NULL DEFAULT 'ft' -- applied out of band, never through a migration in this repo. So a
-- database built from these migrations had a DIFFERENT shape from the one the app talks to,
-- which is the sort of drift that only ever surfaces as a bug nobody can reproduce locally.
--
-- It surfaced on 2026-08-15 as "Upload failed — no documents were saved": the browser sent an
-- explicit `scale_unit: null` on every insert, a column default does not apply to a key that
-- is present-and-null, and so every plan-set upload died on the not-null constraint. The
-- browser side is fixed too (clientPortalDocumentPayload never emits null now) -- both halves
-- are kept because they fail differently: this one stops a bad row reaching the table at all,
-- and the browser one keeps working against either shape.
--
-- Written to MATCH production rather than to undo it. A unit with no scale beside it is inert,
-- 'ft' is the sensible default for a plan set, and NOT NULL is the stricter of the two.
-- Idempotent: production is already in this state, so applying it there changes nothing.

update public.client_portal_documents
set scale_unit = 'ft'
where scale_unit is null;

alter table public.client_portal_documents
  alter column scale_unit set default 'ft';

alter table public.client_portal_documents
  alter column scale_unit set not null;

-- The old constraint's `is null` branch is now unreachable. Replaced rather than left in
-- place, so the column's definition reads as the one rule it actually enforces.
alter table public.client_portal_documents
  drop constraint if exists client_portal_documents_scale_unit_check;

alter table public.client_portal_documents
  add constraint client_portal_documents_scale_unit_check
  check (scale_unit in ('ft', 'in', 'cm'));

comment on column public.client_portal_documents.scale_unit is
  'Unit for `scale`. NOT NULL DEFAULT ''ft'' -- the client must never send an explicit null, as a column default does not apply to a present-but-null key.';
