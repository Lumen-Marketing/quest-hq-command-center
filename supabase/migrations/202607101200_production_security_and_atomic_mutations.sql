-- July 2026 production hardening: storage ownership, least-privilege RPCs,
-- atomic destructive mutations, bounded recycle retention, and FK indexes.

-- Avatar objects are public to read through the public bucket URL, but only the
-- profile owner may create, replace, or delete objects below their UUID prefix.
drop policy if exists "authenticated insert avatar objects" on storage.objects;
drop policy if exists "authenticated update avatar objects" on storage.objects;
drop policy if exists "authenticated read avatar objects" on storage.objects;
drop policy if exists "users insert own avatar objects" on storage.objects;
drop policy if exists "users update own avatar objects" on storage.objects;

create policy "users insert own avatar objects" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "users update own avatar objects" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "users delete own avatar objects" on storage.objects;
create policy "users delete own avatar objects" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create or replace function public.update_own_profile(p_full_name text, p_avatar_url text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
     set full_name = coalesce(nullif(btrim(p_full_name), ''), full_name),
         avatar_url = coalesce(p_avatar_url, avatar_url)
   where id = (select auth.uid())
   returning * into v_row;

  if v_row.id is null then
    raise exception 'profile not found';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.update_own_profile(text, text) from public, anon;
grant execute on function public.update_own_profile(text, text) to authenticated;

create or replace function public.assign_wo_number(company text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assigned integer;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  if not app_private.is_company_member(company) then
    raise exception 'not permitted for workspace';
  end if;

  insert into public.wo_counters as counter (company_id, next_val)
  values (company, 2)
  on conflict (company_id)
  do update set next_val = counter.next_val + 1
  returning counter.next_val - 1 into v_assigned;

  return coalesce(v_assigned, 1);
end;
$$;

revoke execute on function public.assign_wo_number(text) from public, anon;
grant execute on function public.assign_wo_number(text) to authenticated;

drop policy if exists "company members read wo counters" on public.wo_counters;
create policy "company members read wo counters" on public.wo_counters
  for select to authenticated
  using ((select app_private.is_company_member(company_id)));
revoke insert, update, delete on public.wo_counters from authenticated;
grant select on public.wo_counters to authenticated;

create or replace function public.list_workspace_app_library()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(entry), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'company_id', s.company_id,
      'company_name', coalesce(c.name, s.company_id),
      'workspace_name', ws->>'name',
      'app', (a - 'items')
    ) as entry
    from public.workspace_builder_state s
    left join public.companies c on c.id::text = s.company_id::text
    cross join lateral jsonb_array_elements(coalesce(s.doc->'workspaces', '[]'::jsonb)) as ws
    cross join lateral jsonb_array_elements(coalesce(ws->'apps', '[]'::jsonb)) as a
    where (select auth.uid()) is not null
      and coalesce(a->>'name', '') <> ''
      and coalesce(a->>'shared', 'false') = 'true'
  ) library_entries;
$$;

revoke execute on function public.list_workspace_app_library() from public, anon;
grant execute on function public.list_workspace_app_library() to authenticated;

revoke execute on function public.wb_add_item_comment(text, text, text, text, jsonb) from public, anon;
grant execute on function public.wb_add_item_comment(text, text, text, text, jsonb) to authenticated;
revoke execute on function public.wb_modify_item_comment(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.wb_modify_item_comment(text, text, text, text, text, text, text) to authenticated;

-- Recycle-bin rows contain complete record snapshots. Reading and direct table
-- mutation are restricted to workspace settings managers; normal deletes use
-- the RPC below so source mutation and ledger insertion share one transaction.
drop policy if exists "members read recycle bin" on public.recycle_bin_items;
drop policy if exists "members create recycle bin items" on public.recycle_bin_items;
revoke insert, update, delete on public.recycle_bin_items from authenticated;
grant select on public.recycle_bin_items to authenticated;

create unique index if not exists recycle_bin_items_one_active_source_idx
  on public.recycle_bin_items(company_id, source_table, source_id)
  where status = 'active';

create index if not exists recycle_bin_items_deleted_by_idx
  on public.recycle_bin_items(deleted_by) where deleted_by is not null;
create index if not exists recycle_bin_items_restored_by_idx
  on public.recycle_bin_items(restored_by) where restored_by is not null;

create or replace function app_private.recycle_source_metadata(p_type text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case p_type
    when 'contact' then jsonb_build_object('table', 'contacts', 'permission', 'crm.view', 'updated_at', true)
    when 'account' then jsonb_build_object('table', 'accounts', 'permission', 'crm.view', 'updated_at', true)
    when 'deal' then jsonb_build_object('table', 'deals', 'permission', 'crm.view', 'updated_at', true)
    when 'job' then jsonb_build_object('table', 'jobs', 'permission', 'jobs.manage', 'updated_at', true)
    when 'task' then jsonb_build_object('table', 'tasks', 'permission', 'tasks.manage', 'updated_at', true)
    when 'file' then jsonb_build_object('table', 'job_files', 'permission', 'files.manage', 'updated_at', true)
    when 'form' then jsonb_build_object('table', 'forms', 'permission', 'forms.manage', 'updated_at', true)
    when 'form_response' then jsonb_build_object('table', 'form_responses', 'permission', 'forms.manage', 'updated_at', false)
    when 'proposal' then jsonb_build_object('table', 'proposal_documents', 'permission', 'crm.view', 'updated_at', true)
    when 'client_portal' then jsonb_build_object('table', 'client_portals', 'permission', 'client_portals.manage', 'updated_at', true)
    when 'pricebook_vendor' then jsonb_build_object('table', 'pricebook_vendors', 'permission', 'price_book.manage', 'updated_at', true)
    when 'pricebook_material' then jsonb_build_object('table', 'pricebook_materials', 'permission', 'price_book.manage', 'updated_at', true)
    when 'pricebook_price' then jsonb_build_object('table', 'pricebook_vendor_prices', 'permission', 'price_book.manage', 'updated_at', true)
    when 'finance_invoice' then jsonb_build_object('table', 'finance_invoices', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_payment' then jsonb_build_object('table', 'finance_payments', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_expense' then jsonb_build_object('table', 'finance_expenses', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_vendor' then jsonb_build_object('table', 'finance_vendors', 'permission', 'finance.manage', 'updated_at', true)
    when 'calendar_event' then jsonb_build_object('table', 'calendar_events', 'permission', 'calendar.manage', 'updated_at', true)
    when 'activity' then jsonb_build_object('table', 'activities', 'permission', 'crm.view', 'updated_at', true)
    else null
  end;
$$;

revoke execute on function app_private.recycle_source_metadata(text) from public, anon, authenticated;

create or replace function public.recycle_move_item(p_item jsonb)
returns public.recycle_bin_items
language plpgsql
security definer
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_uid uuid := (select auth.uid());
  v_company text := nullif(btrim(p_item->>'company_id'), '');
  v_type text := nullif(btrim(p_item->>'source_type'), '');
  v_source_id text := nullif(btrim(p_item->>'source_id'), '');
  v_meta jsonb;
  v_table text;
  v_permission text;
  v_now timestamptz := now();
  v_rows integer;
  v_item public.recycle_bin_items;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  v_meta := app_private.recycle_source_metadata(v_type);
  if v_company is null or v_source_id is null or v_meta is null then raise exception 'invalid recycle item'; end if;
  v_table := v_meta->>'table';
  v_permission := v_meta->>'permission';
  if nullif(p_item->>'source_table', '') is distinct from v_table then raise exception 'source table mismatch'; end if;
  if not app_private.has_company_permission(v_company, v_permission) then raise exception 'not permitted to delete this item'; end if;

  insert into public.recycle_bin_items (
    id, company_id, source_type, source_table, source_id, item_label, status,
    deleted_by, deleted_by_label, deleted_at, restore_until, snapshot, created_at, updated_at
  ) values (
    coalesce(nullif(p_item->>'id', ''), 'recycle-' || gen_random_uuid()::text),
    v_company, v_type, v_table, v_source_id, left(coalesce(p_item->>'item_label', ''), 240), 'active',
    v_uid, left(coalesce(p_item->>'deleted_by_label', ''), 160), v_now, v_now + interval '30 days',
    coalesce(p_item->'snapshot', '{}'::jsonb), v_now, v_now
  ) returning * into v_item;

  execute format(
    'update public.%I set deleted_at = $1, deleted_by = $2%s where id::text = $3 and company_id::text = $4 and deleted_at is null',
    v_table,
    case when coalesce((v_meta->>'updated_at')::boolean, false) then ', updated_at = $1' else '' end
  ) using v_now, v_uid, v_source_id, v_company;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'source item not found or already deleted'; end if;

  return v_item;
end;
$$;

revoke execute on function public.recycle_move_item(jsonb) from public, anon;
grant execute on function public.recycle_move_item(jsonb) to authenticated;

create or replace function public.recycle_restore_item(p_item_id text)
returns public.recycle_bin_items
language plpgsql
security definer
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_uid uuid := (select auth.uid());
  v_item public.recycle_bin_items;
  v_meta jsonb;
  v_table text;
  v_rows integer;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_item from public.recycle_bin_items where id = p_item_id and status = 'active' for update;
  if v_item.id is null then raise exception 'recycle item not found'; end if;
  if v_item.restore_until < now() then raise exception 'restore window has expired'; end if;
  if not app_private.has_company_permission(v_item.company_id, 'settings.manage') then raise exception 'not permitted to restore this item'; end if;
  v_meta := app_private.recycle_source_metadata(v_item.source_type);
  v_table := v_meta->>'table';
  if v_meta is null or v_table is distinct from v_item.source_table then raise exception 'invalid recycle source'; end if;

  execute format(
    'update public.%I set deleted_at = null, deleted_by = null%s where id::text = $1 and company_id::text = $2 and deleted_at is not null',
    v_table,
    case when coalesce((v_meta->>'updated_at')::boolean, false) then ', updated_at = now()' else '' end
  ) using v_item.source_id, v_item.company_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'source item is unavailable for restore'; end if;

  update public.recycle_bin_items
     set status = 'restored', restored_at = now(), restored_by = v_uid, updated_at = now()
   where id = v_item.id
   returning * into v_item;
  return v_item;
end;
$$;

revoke execute on function public.recycle_restore_item(text) from public, anon;
grant execute on function public.recycle_restore_item(text) to authenticated;

create or replace function public.recycle_permanently_delete_item(p_item_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_item public.recycle_bin_items;
  v_meta jsonb;
  v_table text;
  v_object_path text;
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
begin
  select * into v_item from public.recycle_bin_items where id = p_item_id and status = 'active' for update;
  if v_item.id is null then raise exception 'recycle item not found'; end if;
  if v_role <> 'service_role' and not app_private.has_company_permission(v_item.company_id, 'settings.manage') then
    raise exception 'not permitted to permanently delete this item';
  end if;
  v_meta := app_private.recycle_source_metadata(v_item.source_type);
  v_table := v_meta->>'table';
  if v_meta is null or v_table is distinct from v_item.source_table then raise exception 'invalid recycle source'; end if;

  if v_item.source_type = 'file' then
    v_object_path := nullif(v_item.snapshot->>'object_path', '');
    if v_object_path is not null and exists (
      select 1 from storage.objects where bucket_id = 'quest-job-files' and name = v_object_path
    ) then
      raise exception 'storage object must be removed before permanent deletion';
    end if;
  end if;

  execute format('delete from public.%I where id::text = $1 and company_id::text = $2', v_table)
    using v_item.source_id, v_item.company_id;
  delete from public.recycle_bin_items where id = v_item.id;
  return true;
end;
$$;

revoke execute on function public.recycle_permanently_delete_item(text) from public, anon;
grant execute on function public.recycle_permanently_delete_item(text) to authenticated, service_role;

create or replace function public.purge_expired_recycle_bin(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
set statement_timeout = '30s'
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 500);
  v_item public.recycle_bin_items;
  v_meta jsonb;
  v_table text;
  v_object_path text;
  v_count integer := 0;
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
begin
  if session_user <> 'postgres' and v_role <> 'service_role' then raise exception 'service role required'; end if;
  for v_item in
    select * from public.recycle_bin_items
     where status = 'active' and restore_until < now()
     order by restore_until
     limit v_limit
     for update skip locked
  loop
    v_meta := app_private.recycle_source_metadata(v_item.source_type);
    v_table := v_meta->>'table';
    if v_meta is null or v_table is distinct from v_item.source_table then continue; end if;
    if v_item.source_type = 'file' then
      v_object_path := nullif(v_item.snapshot->>'object_path', '');
      if v_object_path is not null and exists (
        select 1 from storage.objects where bucket_id = 'quest-job-files' and name = v_object_path
      ) then continue; end if;
    end if;
    execute format('delete from public.%I where id::text = $1 and company_id::text = $2', v_table)
      using v_item.source_id, v_item.company_id;
    delete from public.recycle_bin_items where id = v_item.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke execute on function public.purge_expired_recycle_bin(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_recycle_bin(integer) to service_role;

-- Role rows and permission rows now commit or roll back together.
create or replace function public.save_company_role(p_role jsonb, p_permissions text[] default '{}'::text[])
returns public.roles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_company text := nullif(btrim(p_role->>'company_id'), '');
  v_id uuid;
  v_role public.roles;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_company is null or not app_private.has_company_permission(v_company, 'roles.manage') then raise exception 'not permitted to manage roles'; end if;
  if nullif(p_role->>'id', '') is not null then v_id := (p_role->>'id')::uuid; end if;

  if v_id is null then
    insert into public.roles(company_id, name, color, priority, is_system, created_by)
    values (v_company, left(nullif(btrim(p_role->>'name'), ''), 100), coalesce(nullif(p_role->>'color', ''), '#f0b23b'), coalesce((p_role->>'priority')::integer, 0), false, v_uid)
    returning * into v_role;
  else
    update public.roles
       set name = left(nullif(btrim(p_role->>'name'), ''), 100),
           color = coalesce(nullif(p_role->>'color', ''), color),
           priority = coalesce((p_role->>'priority')::integer, priority),
           updated_at = now()
     where id = v_id and company_id = v_company
     returning * into v_role;
    if v_role.id is null then raise exception 'role not found'; end if;
  end if;

  delete from public.role_permissions where role_id = v_role.id;
  insert into public.role_permissions(role_id, permission_key, effect)
  select v_role.id, permission_key, 'allow'
  from (select distinct nullif(btrim(value), '') as permission_key from unnest(coalesce(p_permissions, '{}'::text[])) as value) permissions
  where permission_key is not null;
  return v_role;
end;
$$;

revoke execute on function public.save_company_role(jsonb, text[]) from public, anon;
grant execute on function public.save_company_role(jsonb, text[]) to authenticated;

create or replace function public.delete_company_role(p_role_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.roles;
begin
  if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
  select * into v_role from public.roles where id = p_role_id for update;
  if v_role.id is null then raise exception 'role not found'; end if;
  if not app_private.has_company_permission(v_role.company_id, 'roles.manage') then raise exception 'not permitted to manage roles'; end if;
  if v_role.is_system then raise exception 'system roles cannot be deleted'; end if;
  if exists (select 1 from public.user_role_assignments where role_id = v_role.id) then raise exception 'reassign members before deleting this role'; end if;
  delete from public.roles where id = v_role.id;
  return true;
end;
$$;

revoke execute on function public.delete_company_role(uuid) from public, anon;
grant execute on function public.delete_company_role(uuid) to authenticated;

create or replace function public.replace_pipeline_stages(
  p_company_id text,
  p_kind text,
  p_stages jsonb,
  p_rename_map jsonb default '{}'::jsonb
)
returns setof public.pipeline_stages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_unique integer;
  v_table text;
  v_old text;
  v_new text;
begin
  if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
  if not app_private.has_company_permission(p_company_id, 'settings.manage') then raise exception 'not permitted to manage pipeline stages'; end if;
  if p_kind not in ('jobs', 'contacts', 'deals') then raise exception 'invalid pipeline kind'; end if;
  if jsonb_typeof(p_stages) <> 'array' then raise exception 'stages must be an array'; end if;
  v_count := jsonb_array_length(p_stages);
  if v_count < 1 or v_count > 50 then raise exception 'pipeline must have between 1 and 50 stages'; end if;
  select count(distinct lower(btrim(stage->>'name'))) into v_unique from jsonb_array_elements(p_stages) stage where nullif(btrim(stage->>'name'), '') is not null;
  if v_unique <> v_count then raise exception 'pipeline stage names must be non-empty and unique'; end if;

  delete from public.pipeline_stages where company_id = p_company_id and kind = p_kind;
  insert into public.pipeline_stages(company_id, kind, name, color, position)
  select p_company_id, p_kind, left(btrim(stage->>'name'), 100),
         case when coalesce(stage->>'color', '') ~ '^#[0-9A-Fa-f]{3,8}$' then stage->>'color' else '#9aa0a8' end,
         ordinality - 1
  from jsonb_array_elements(p_stages) with ordinality as rows(stage, ordinality);

  v_table := case p_kind when 'contacts' then 'contacts' when 'deals' then 'deals' else 'jobs' end;
  for v_old, v_new in select key, value from jsonb_each_text(coalesce(p_rename_map, '{}'::jsonb))
  loop
    if nullif(btrim(v_old), '') is not null and nullif(btrim(v_new), '') is not null then
      execute format('update public.%I set stage = $1, updated_at = now() where company_id = $2 and stage = $3', v_table)
        using v_new, p_company_id, v_old;
    end if;
  end loop;

  return query select * from public.pipeline_stages where company_id = p_company_id and kind = p_kind order by position;
end;
$$;

revoke execute on function public.replace_pipeline_stages(text, text, jsonb, jsonb) from public, anon;
grant execute on function public.replace_pipeline_stages(text, text, jsonb, jsonb) to authenticated;

-- Publish only the explicit tables consumed by the scoped realtime client. The
-- original migration also referenced obsolete pricebook_prices/sites names.
do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array[
      'companies','profiles','team_members','company_memberships','company_subscriptions',
      'roles','role_permissions','user_role_assignments','resource_acl','field_permissions',
      'company_invites','company_join_requests','company_plugins','jobs','tasks','calendar_events',
      'contacts','accounts','deals','pipeline_stages','crm_sites','proposal_documents','activities',
      'job_files','forms','form_responses','finance_invoices','finance_payments','finance_expenses',
      'finance_vendors','client_portals','client_portal_documents','client_portal_annotations',
      'client_portal_events','pricebook_vendors','pricebook_materials','pricebook_vendor_prices',
      'notifications','recycle_bin_items','workspace_backups','workspace_builder_state'
    ] loop
      if exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = v_table
      ) and not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pricebook_prices'
  ) then
    execute 'alter publication supabase_realtime drop table public.pricebook_prices';
  end if;
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sites'
  ) then
    execute 'alter publication supabase_realtime drop table public.sites';
  end if;
end;
$$;

-- PostgreSQL does not automatically index foreign keys. Add only missing FK
-- indexes, preserving every existing index and using deterministic names.
do $$
declare
  v_fk record;
  v_index_name text;
begin
  for v_fk in
    select con.oid, ns.nspname, rel.relname, con.conname,
           string_agg(quote_ident(att.attname), ', ' order by key_columns.ordinality) as columns
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    cross join lateral unnest(con.conkey) with ordinality as key_columns(attnum, ordinality)
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = key_columns.attnum
    where con.contype = 'f'
      and ns.nspname = 'public'
      and not exists (
        select 1 from pg_index idx
        where idx.indrelid = con.conrelid
          and con.conkey <@ (idx.indkey::smallint[])
      )
    group by con.oid, ns.nspname, rel.relname, con.conname
  loop
    v_index_name := left('idx_fk_' || v_fk.relname || '_' || substr(md5(v_fk.conname), 1, 8), 63);
    execute format('create index if not exists %I on %I.%I (%s)', v_index_name, v_fk.nspname, v_fk.relname, v_fk.columns);
  end loop;
end;
$$;

-- Schedule bounded database cleanup. File rows whose storage object still
-- exists are intentionally skipped until the authenticated Vercel cron removes
-- the object first.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

do $$
declare
  v_job_id bigint;
begin
  for v_job_id in select jobid from cron.job where jobname = 'quest-hq-recycle-bin-purge'
  loop
    perform cron.unschedule(v_job_id);
  end loop;
  perform cron.schedule(
    'quest-hq-recycle-bin-purge',
    '15 3 * * *',
    'select public.purge_expired_recycle_bin(200);'
  );
end;
$$;
