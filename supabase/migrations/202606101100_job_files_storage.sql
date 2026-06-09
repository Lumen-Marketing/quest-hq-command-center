create extension if not exists pgcrypto;

create table if not exists public.job_files (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete restrict,
  job_id uuid not null references public.jobs(id) on delete cascade,
  bucket_id text not null default 'quest-job-files',
  object_path text not null unique,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  category text not null default 'Other',
  uploaded_by_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists job_files_job_id_created_at_idx on public.job_files(job_id, created_at desc);
create index if not exists job_files_company_id_idx on public.job_files(company_id);
create index if not exists job_files_deleted_at_idx on public.job_files(deleted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_files_set_updated_at on public.job_files;
create trigger job_files_set_updated_at
before update on public.job_files
for each row execute function public.set_updated_at();

create or replace function public.refresh_job_file_count(target_job_id uuid)
returns void
language sql
set search_path = public
as $$
  update public.jobs
  set file_count = (
    select count(*)::integer
    from public.job_files
    where job_id = target_job_id
      and deleted_at is null
  )
  where id = target_job_id;
$$;

create or replace function public.job_files_refresh_job_count()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_job_file_count(old.job_id);
    return old;
  end if;

  perform public.refresh_job_file_count(new.job_id);

  if tg_op = 'UPDATE' and old.job_id is distinct from new.job_id then
    perform public.refresh_job_file_count(old.job_id);
  end if;

  return new;
end;
$$;

drop trigger if exists job_files_refresh_job_count on public.job_files;
create trigger job_files_refresh_job_count
after insert or update or delete on public.job_files
for each row execute function public.job_files_refresh_job_count();

alter table public.job_files enable row level security;

drop policy if exists "demo_read_job_files" on public.job_files;
create policy "demo_read_job_files" on public.job_files
for select to anon, authenticated
using (true);

drop policy if exists "demo_insert_job_files" on public.job_files;
create policy "demo_insert_job_files" on public.job_files
for insert to anon, authenticated
with check (true);

drop policy if exists "demo_update_job_files" on public.job_files;
create policy "demo_update_job_files" on public.job_files
for update to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo_delete_job_files" on public.job_files;
create policy "demo_delete_job_files" on public.job_files
for delete to anon, authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit)
values ('quest-job-files', 'quest-job-files', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "demo_read_quest_job_files_objects" on storage.objects;
create policy "demo_read_quest_job_files_objects" on storage.objects
for select to anon, authenticated
using (bucket_id = 'quest-job-files');

drop policy if exists "demo_insert_quest_job_files_objects" on storage.objects;
create policy "demo_insert_quest_job_files_objects" on storage.objects
for insert to anon, authenticated
with check (bucket_id = 'quest-job-files');

drop policy if exists "demo_update_quest_job_files_objects" on storage.objects;
create policy "demo_update_quest_job_files_objects" on storage.objects
for update to anon, authenticated
using (bucket_id = 'quest-job-files')
with check (bucket_id = 'quest-job-files');

drop policy if exists "demo_delete_quest_job_files_objects" on storage.objects;
create policy "demo_delete_quest_job_files_objects" on storage.objects
for delete to anon, authenticated
using (bucket_id = 'quest-job-files');

select public.refresh_job_file_count(id)
from public.jobs;
