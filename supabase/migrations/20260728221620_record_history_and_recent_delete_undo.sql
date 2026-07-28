-- Append-only business-record history and a narrow, same-actor undo path for
-- the existing 30-day Recycle Bin.

create table if not exists public.record_history (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  record_type text not null,
  record_id text not null,
  record_label text not null default '',
  action text not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  changed_fields text[] not null default '{}'::text[],
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint record_history_record_type_check check (record_type in ('contact', 'deal', 'job', 'task')),
  constraint record_history_action_check check (action in ('created', 'updated', 'deleted', 'restored')),
  constraint record_history_changes_object_check check (jsonb_typeof(changes) = 'object')
);

create index if not exists record_history_scope_created_idx
  on public.record_history(company_id, workspace_id, record_type, record_id, created_at desc);

create index if not exists record_history_actor_created_idx
  on public.record_history(actor_profile_id, created_at desc)
  where actor_profile_id is not null;

alter table public.record_history enable row level security;

revoke all on table public.record_history from public, anon, authenticated;
grant select on table public.record_history to authenticated;

drop policy if exists "record history workspace read" on public.record_history;
create policy "record history workspace read" on public.record_history
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = record_history.workspace_id
      and w.company_id = record_history.company_id
      and w.status = 'active'
  )
  and app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(
    workspace_id,
    case record_type
      when 'contact' then 'crm.view'
      when 'deal' then 'crm.view'
      when 'job' then 'jobs.view'
      when 'task' then 'tasks.view'
      else '__denied__'
    end
  )
);

create or replace function app_private.capture_record_history()
returns trigger
language plpgsql
security definer
set search_path = ''
set statement_timeout = '5s'
as $$
declare
  v_actor uuid := (select auth.uid());
  v_old jsonb := '{}'::jsonb;
  v_new jsonb;
  v_fields text[];
  v_field text;
  v_changed_fields text[] := '{}'::text[];
  v_changes jsonb := '{}'::jsonb;
  v_record_type text;
  v_record_label text;
  v_action text;
  v_company_id text;
  v_workspace_id uuid;
  v_record_id text;
begin
  v_new := to_jsonb(new);
  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
  end if;

  case tg_table_name
    when 'contacts' then
      v_record_type := 'contact';
      v_fields := array['name', 'stage', 'owner_name', 'temperature', 'pay_type', 'roof_system', 'source', 'value'];
      v_record_label := coalesce(v_new->>'name', '');
    when 'deals' then
      v_record_type := 'deal';
      v_fields := array['name', 'stage', 'status', 'value', 'probability', 'close_date', 'owner_name'];
      v_record_label := coalesce(v_new->>'name', '');
    when 'jobs' then
      v_record_type := 'job';
      v_fields := array['name', 'stage', 'priority', 'owner_name', 'job_type', 'estimate_total', 'invoice_total'];
      v_record_label := coalesce(v_new->>'name', '');
    when 'tasks' then
      v_record_type := 'task';
      v_fields := array['title', 'status', 'priority', 'due', 'due_time'];
      v_record_label := coalesce(v_new->>'title', '');
    else
      return new;
  end case;

  v_company_id := nullif(v_new->>'company_id', '');
  v_workspace_id := nullif(v_new->>'workspace_id', '')::uuid;
  v_record_id := nullif(v_new->>'id', '');

  if v_company_id is null or v_workspace_id is null or v_record_id is null then
    raise exception 'Record history requires company, workspace, and record identity';
  end if;

  if tg_op = 'INSERT' then
    v_action := 'created';
  elsif (v_old->>'deleted_at') is null and (v_new->>'deleted_at') is not null then
    v_action := 'deleted';
  elsif (v_old->>'deleted_at') is not null and (v_new->>'deleted_at') is null then
    v_action := 'restored';
  else
    v_action := 'updated';
    foreach v_field in array v_fields loop
      if (v_old -> v_field) is distinct from (v_new -> v_field) then
        v_changed_fields := array_append(v_changed_fields, v_field);
        v_changes := v_changes || jsonb_build_object(
          v_field,
          jsonb_build_object('before', v_old -> v_field, 'after', v_new -> v_field)
        );
      end if;
    end loop;
    if cardinality(v_changed_fields) = 0 then return new; end if;
  end if;

  insert into public.record_history (
    company_id,
    workspace_id,
    record_type,
    record_id,
    record_label,
    action,
    actor_profile_id,
    changed_fields,
    changes
  ) values (
    v_company_id,
    v_workspace_id,
    v_record_type,
    v_record_id,
    left(v_record_label, 240),
    v_action,
    v_actor,
    v_changed_fields,
    v_changes
  );

  return new;
end;
$$;

revoke all on function app_private.capture_record_history() from public, anon, authenticated;

drop trigger if exists contacts_capture_record_history on public.contacts;
create trigger contacts_capture_record_history
after insert or update on public.contacts
for each row execute function app_private.capture_record_history();

drop trigger if exists deals_capture_record_history on public.deals;
create trigger deals_capture_record_history
after insert or update on public.deals
for each row execute function app_private.capture_record_history();

drop trigger if exists jobs_capture_record_history on public.jobs;
create trigger jobs_capture_record_history
after insert or update on public.jobs
for each row execute function app_private.capture_record_history();

drop trigger if exists tasks_capture_record_history on public.tasks;
create trigger tasks_capture_record_history
after insert or update on public.tasks
for each row execute function app_private.capture_record_history();

create or replace function public.recycle_undo_item(p_item_id text)
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
  v_permission text;
  v_workspace_id uuid;
  v_workspace_scoped boolean;
  v_rows integer;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select *
    into v_item
    from public.recycle_bin_items
   where id = p_item_id and status = 'active'
   for update;

  if v_item.id is null then raise exception 'recycle item not found'; end if;
  if v_item.deleted_by is distinct from v_uid then
    raise exception 'only the person who deleted this item can undo it';
  end if;
  if v_item.deleted_at < now() - interval '10 minutes' then
    raise exception 'undo window has expired; use Recycle Bin restore';
  end if;
  if v_item.restore_until < now() then raise exception 'restore window has expired'; end if;

  v_meta := app_private.recycle_source_metadata(v_item.source_type);
  v_table := v_meta->>'table';
  v_permission := v_meta->>'permission';
  if v_meta is null or v_table is distinct from v_item.source_table or v_permission is null then
    raise exception 'invalid recycle source';
  end if;

  v_workspace_scoped := v_item.source_type = any (
    array['contact', 'account', 'deal', 'job', 'task', 'file', 'proposal', 'activity']::text[]
  );

  if v_workspace_scoped then
    execute format(
      'select workspace_id from public.%I where id::text = $1 and company_id::text = $2 and deleted_at is not null',
      v_table
    ) into v_workspace_id using v_item.source_id, v_item.company_id;

    if v_workspace_id is null then raise exception 'source item is unavailable for undo'; end if;
    if not app_private.is_workspace_member(v_workspace_id)
      or not app_private.has_workspace_permission(v_workspace_id, v_permission) then
      raise exception 'not permitted to undo this item';
    end if;
  elsif not app_private.has_company_permission(v_item.company_id, v_permission) then
    raise exception 'not permitted to undo this item';
  end if;

  execute format(
    'update public.%I set deleted_at = null, deleted_by = null%s where id::text = $1 and company_id::text = $2 and deleted_at is not null',
    v_table,
    case when coalesce((v_meta->>'updated_at')::boolean, false) then ', updated_at = now()' else '' end
  ) using v_item.source_id, v_item.company_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'source item is unavailable for undo'; end if;

  update public.recycle_bin_items
     set status = 'restored', restored_at = now(), restored_by = v_uid, updated_at = now()
   where id = v_item.id
   returning * into v_item;

  return v_item;
end;
$$;

revoke all on function public.recycle_undo_item(text) from public, anon, authenticated;
grant execute on function public.recycle_undo_item(text) to authenticated;
