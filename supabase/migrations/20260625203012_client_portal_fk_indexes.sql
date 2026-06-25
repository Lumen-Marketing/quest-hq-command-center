create index if not exists client_portals_job_idx
  on public.client_portals(job_id)
  where job_id is not null;

create index if not exists client_portals_created_by_idx
  on public.client_portals(created_by)
  where created_by is not null;

create index if not exists client_portal_documents_company_idx
  on public.client_portal_documents(company_id);

create index if not exists client_portal_documents_uploaded_by_idx
  on public.client_portal_documents(uploaded_by)
  where uploaded_by is not null;

create index if not exists client_portal_annotations_company_idx
  on public.client_portal_annotations(company_id);

create index if not exists client_portal_annotations_document_idx
  on public.client_portal_annotations(document_id)
  where document_id is not null;

create index if not exists client_portal_events_company_idx
  on public.client_portal_events(company_id);
