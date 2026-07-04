create table if not exists public.workspace_backups (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  label text not null,
  kind text not null default 'manual',
  status text not null default 'active',
  interval_key text not null default 'manual',
  payload jsonb not null default '{}'::jsonb,
  size_bytes bigint not null default 0,
  record_counts jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_by_label text,
  source text not null default 'settings',
  imported_from_backup_id text,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_backups_kind_check check (kind in ('manual', 'automatic', 'import', 'restore')),
  constraint workspace_backups_status_check check (status in ('active', 'deleted'))
);

create index if not exists workspace_backups_company_status_idx
  on public.workspace_backups(company_id, status, created_at desc);

create table if not exists public.workspace_backup_copies (
  id text primary key,
  backup_id text references public.workspace_backups(id) on delete set null,
  company_id text not null references public.companies(id) on delete cascade,
  company_name text,
  owner_profile_id uuid,
  owner_email text,
  created_by uuid references public.profiles(id) on delete set null,
  created_by_label text,
  kind text not null default 'manual',
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  size_bytes bigint not null default 0,
  record_counts jsonb not null default '{}'::jsonb,
  source_table text not null default 'workspace_backups',
  original_created_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_backup_copies_kind_check check (kind in ('manual', 'automatic', 'import', 'restore', 'mirror')),
  constraint workspace_backup_copies_status_check check (status in ('active', 'deleted'))
);

create index if not exists workspace_backup_copies_company_status_idx
  on public.workspace_backup_copies(company_id, status, created_at desc);
create index if not exists workspace_backup_copies_created_by_idx
  on public.workspace_backup_copies(created_by, created_at desc);

alter table public.workspace_backups enable row level security;
alter table public.workspace_backup_copies enable row level security;

drop policy if exists "members read company backups" on public.workspace_backups;
create policy "members read company backups" on public.workspace_backups
for select
to authenticated
using (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = workspace_backups.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
  )
);

drop policy if exists "admins manage company backups" on public.workspace_backups;
create policy "admins manage company backups" on public.workspace_backups
for all
to authenticated
using (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = workspace_backups.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  )
)
with check (
  exists (
    select 1 from public.company_memberships cm
    where cm.company_id = workspace_backups.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  )
);

drop policy if exists "platform admins read backup copies" on public.workspace_backup_copies;
create policy "platform admins read backup copies" on public.workspace_backup_copies
for select
to authenticated
using (app_private.is_quest_admin());

drop policy if exists "platform admins manage backup copies" on public.workspace_backup_copies;
create policy "platform admins manage backup copies" on public.workspace_backup_copies
for all
to authenticated
using (app_private.is_quest_admin())
with check (app_private.is_quest_admin());

grant select, insert, update on public.workspace_backups to authenticated;
grant select, insert, update, delete on public.workspace_backup_copies to authenticated;

create or replace function public.list_platform_backup_copies(
  filter_company_id text default null,
  filter_status text default null,
  filter_kind text default null
)
returns table (
  id text,
  backup_id text,
  company_id text,
  company_name text,
  owner_profile_id uuid,
  owner_email text,
  created_by uuid,
  created_by_label text,
  kind text,
  status text,
  size_bytes bigint,
  record_counts jsonb,
  source_table text,
  original_created_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company text := nullif(trim(coalesce(filter_company_id, '')), '');
  clean_status text := nullif(lower(trim(coalesce(filter_status, ''))), '');
  clean_kind text := nullif(lower(trim(coalesce(filter_kind, ''))), '');
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;

  return query
  select
    c.id,
    c.backup_id,
    c.company_id,
    c.company_name,
    c.owner_profile_id,
    c.owner_email,
    c.created_by,
    c.created_by_label,
    c.kind,
    c.status,
    c.size_bytes,
    c.record_counts,
    c.source_table,
    c.original_created_at,
    c.deleted_at,
    c.deleted_by,
    c.created_at,
    c.updated_at
  from public.workspace_backup_copies c
  where (clean_company is null or c.company_id = clean_company)
    and (clean_status is null or c.status = clean_status)
    and (clean_kind is null or c.kind = clean_kind)
  order by c.created_at desc;
end;
$$;

revoke all on function public.list_platform_backup_copies(text, text, text) from public, anon;
grant execute on function public.list_platform_backup_copies(text, text, text) to authenticated;

create or replace function public.mark_platform_backup_copy_deleted(copy_id text)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_id text := trim(coalesce(copy_id, ''));
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;
  if clean_id = '' then
    raise exception 'Backup copy is required';
  end if;

  update public.workspace_backup_copies
  set status = 'deleted',
      deleted_at = coalesce(deleted_at, now()),
      deleted_by = coalesce(deleted_by, auth.uid()),
      updated_at = now()
  where id = clean_id;

  return 'deleted';
end;
$$;

revoke all on function public.mark_platform_backup_copy_deleted(text) from public, anon;
grant execute on function public.mark_platform_backup_copy_deleted(text) to authenticated;

create or replace function public.permanently_delete_platform_backup_copy(copy_id text)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_id text := trim(coalesce(copy_id, ''));
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;
  if clean_id = '' then
    raise exception 'Backup copy is required';
  end if;

  delete from public.workspace_backup_copies where id = clean_id;
  return 'permanently_deleted';
end;
$$;

revoke all on function public.permanently_delete_platform_backup_copy(text) from public, anon;
grant execute on function public.permanently_delete_platform_backup_copy(text) to authenticated;

create or replace function public.mirror_workspace_backup_copy()
returns trigger
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  workspace_name text;
  owner_id uuid;
  owner_mail text;
begin
  select c.name
    into workspace_name
  from public.companies c
  where c.id = new.company_id;

  select cm.profile_id, p.email
    into owner_id, owner_mail
  from public.company_memberships cm
  left join public.profiles p on p.id = cm.profile_id
  where cm.company_id = new.company_id
    and cm.status = 'active'
    and cm.role = 'owner'
  order by cm.created_at asc
  limit 1;

  insert into public.workspace_backup_copies (
    id,
    backup_id,
    company_id,
    company_name,
    owner_profile_id,
    owner_email,
    created_by,
    created_by_label,
    kind,
    status,
    payload,
    size_bytes,
    record_counts,
    source_table,
    original_created_at,
    deleted_at,
    deleted_by,
    created_at,
    updated_at
  )
  values (
    'copy-' || new.id,
    new.id,
    new.company_id,
    workspace_name,
    owner_id,
    owner_mail,
    new.created_by,
    new.created_by_label,
    new.kind,
    new.status,
    new.payload,
    new.size_bytes,
    new.record_counts,
    'workspace_backups',
    new.created_at,
    new.deleted_at,
    new.deleted_by,
    now(),
    now()
  )
  on conflict (id) do update
    set company_name = excluded.company_name,
        owner_profile_id = excluded.owner_profile_id,
        owner_email = excluded.owner_email,
        created_by = excluded.created_by,
        created_by_label = excluded.created_by_label,
        kind = excluded.kind,
        status = excluded.status,
        payload = excluded.payload,
        size_bytes = excluded.size_bytes,
        record_counts = excluded.record_counts,
        original_created_at = excluded.original_created_at,
        deleted_at = excluded.deleted_at,
        deleted_by = excluded.deleted_by,
        updated_at = now();

  return new;
end;
$$;

revoke all on function public.mirror_workspace_backup_copy() from public, anon, authenticated;

drop trigger if exists trg_mirror_workspace_backup_copy on public.workspace_backups;
create trigger trg_mirror_workspace_backup_copy
after insert or update on public.workspace_backups
for each row execute function public.mirror_workspace_backup_copy();
