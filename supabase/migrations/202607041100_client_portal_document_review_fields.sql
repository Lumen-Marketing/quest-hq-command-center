alter table public.client_portal_documents
  add column if not exists version_group_id uuid,
  add column if not exists version_number integer not null default 1,
  add column if not exists is_current boolean not null default true,
  add column if not exists review_status text not null default 'pending',
  add column if not exists scale numeric,
  add column if not exists scale_unit text;

update public.client_portal_documents
set version_group_id = id
where version_group_id is null;

alter table public.client_portal_documents
  alter column version_group_id set default gen_random_uuid(),
  alter column version_group_id set not null;

alter table public.client_portal_documents
  drop constraint if exists client_portal_documents_review_status_check;

alter table public.client_portal_documents
  add constraint client_portal_documents_review_status_check
  check (review_status in ('pending', 'approved', 'revision', 'rejected'));

alter table public.client_portal_documents
  drop constraint if exists client_portal_documents_scale_unit_check;

alter table public.client_portal_documents
  add constraint client_portal_documents_scale_unit_check
  check (scale_unit is null or scale_unit in ('ft', 'in', 'cm'));

create index if not exists client_portal_documents_current_idx
  on public.client_portal_documents(portal_id, is_current, created_at);

create index if not exists client_portal_documents_version_group_idx
  on public.client_portal_documents(version_group_id, version_number desc);

alter table public.client_portal_annotations
  add column if not exists author_profile_id uuid;
