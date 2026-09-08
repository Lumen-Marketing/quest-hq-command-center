-- The company foreign key is used by ownership cleanup and incident response queries.
-- Keep it covered independently of the form/expiry indexes so those lookups do not scan
-- the complete public-upload intent ledger.
create index if not exists form_upload_intents_company_id_idx
  on public.form_upload_intents (company_id);
