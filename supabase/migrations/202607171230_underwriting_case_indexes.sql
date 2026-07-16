create index if not exists underwriting_cases_contact_idx
  on public.underwriting_cases(contact_id);

create index if not exists underwriting_cases_created_by_idx
  on public.underwriting_cases(created_by)
  where created_by is not null;
