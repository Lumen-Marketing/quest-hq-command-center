-- A clear is prepared and performed on the server, not reconstructed from the browser's
-- cached first page of the transfer log.  The request row is deliberately server-only: it
-- contains the immutable list of transfer ids that the manager saw before agreeing to clear.
create table public.wb_transfer_clear_requests (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  transfer_ids uuid[] not null default '{}'::uuid[],
  transfer_count integer not null check (transfer_count >= 0),
  per_app jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  completed_at timestamptz,
  completed_result jsonb,
  created_at timestamptz not null default now(),
  constraint wb_transfer_clear_requests_completed_result_check
    check ((completed_at is null and completed_result is null) or (completed_at is not null and completed_result is not null))
);

comment on table public.wb_transfer_clear_requests is
  'Server-only, short-lived, actor-bound snapshots for atomic App Builder transfer-log clears. '
  'Unfinished expired rows are opportunistically removed; completed rows retain their result so retrying a request is idempotent.';

create index wb_transfer_clear_requests_workspace_expiry_idx
  on public.wb_transfer_clear_requests (workspace_id, expires_at);
create index wb_transfer_clear_requests_company_expiry_idx
  on public.wb_transfer_clear_requests (company_id, expires_at);
create index wb_transfer_clear_requests_actor_expiry_idx
  on public.wb_transfer_clear_requests (actor_id, expires_at);
-- These match the two global, bounded cleanup scans in preview_wb_transfer_clear. Completed
-- results stay for 30 days so a lost response can be retried, rather than becoming permanent
-- request-ledger retention.
create index wb_transfer_clear_requests_pending_expiry_idx
  on public.wb_transfer_clear_requests (expires_at)
  where completed_at is null;
create index wb_transfer_clear_requests_completed_at_idx
  on public.wb_transfer_clear_requests (completed_at)
  where completed_at is not null;

alter table public.wb_transfer_clear_requests enable row level security;
revoke all on table public.wb_transfer_clear_requests from public, anon, authenticated;

-- Browser writes still record real imports and exports, but the author is always the caller.
-- `cleared` is now only emitted by clear_wb_transfer_log below, after it has deleted the exact
-- prepared snapshot in the same transaction.
drop policy if exists "wb transfers insert" on public.wb_data_transfers;
create policy "wb transfers insert" on public.wb_data_transfers
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.workspaces w
    where w.id = wb_data_transfers.workspace_id
      and w.company_id = wb_data_transfers.company_id
  )
  and (
    (direction = 'export' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.export'))
    or (direction = 'import' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.import'))
  )
);

drop policy if exists "wb transfers clear" on public.wb_data_transfers;
revoke delete, update, truncate on public.wb_data_transfers from authenticated;

create or replace function public.preview_wb_transfer_clear(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '1500ms'
as $$
declare
  v_actor uuid := auth.uid();
  v_company text;
  v_ids uuid[];
  v_count integer;
  v_per_app jsonb;
  v_request_id uuid;
  v_expires_at timestamptz := now() + interval '5 minutes';
  v_snapshot_limit constant integer := 10000;
begin
  if v_actor is null then
    raise exception 'Sign in to clear this log.' using errcode = '42501';
  end if;

  select w.company_id into v_company
  from public.workspaces w
  where w.id = p_workspace_id and w.status = 'active';
  if v_company is null then
    raise exception 'That workspace is unavailable.' using errcode = 'P0001';
  end if;
  if not app_private.has_workspace_permission(p_workspace_id, 'workspaces.manage') then
    raise exception 'You cannot clear this workspace log.' using errcode = '42501';
  end if;

  -- No cron is needed for abandoned previews. Each indexed scan is bounded and this function's
  -- statement timeout makes cleanup non-disruptive. Completed results remain replayable for 30
  -- days, then are eligible for the same opportunistic cleanup.
  delete from public.wb_transfer_clear_requests r
  where r.id in (
    select expired.id
    from public.wb_transfer_clear_requests expired
    where expired.completed_at is null and expired.expires_at < now()
    order by expired.expires_at
    limit 100
  );
  delete from public.wb_transfer_clear_requests r
  where r.id in (
    select completed.id
    from public.wb_transfer_clear_requests completed
    where completed.completed_at < now() - interval '30 days'
    order by completed.completed_at
    limit 100
  );

  -- Read at most one extra id in the SAME snapshot that becomes the request. Counting first
  -- and collecting later would let a concurrent arrival make the displayed count diverge from
  -- the immutable ids, or slip past the cap between the two queries.
  select coalesce(array_agg(snapshot.id order by snapshot.id), '{}'::uuid[])
  into v_ids
  from (
    select t.id
    from public.wb_data_transfers t
    where t.workspace_id = p_workspace_id
      and t.direction in ('export', 'import')
    order by t.id
    limit v_snapshot_limit + 1
  ) snapshot;
  v_count := cardinality(v_ids);
  if v_count > v_snapshot_limit then
    raise exception 'This transfer log is too large to clear at once (% entries; limit %).', v_count, v_snapshot_limit
      using errcode = 'P0001';
  end if;

  -- Aggregate from the frozen ids, so every JSON key is unique and the displayed count exactly
  -- matches the ids this request may later remove.
  select coalesce(jsonb_object_agg(t.app_id, t.removed), '{}'::jsonb) into v_per_app
  from (
    select app_id, count(*)::integer as removed
    from public.wb_data_transfers
    where id = any(v_ids)
    group by app_id
  ) t;

  insert into public.wb_transfer_clear_requests
    (company_id, workspace_id, actor_id, transfer_ids, transfer_count, per_app, expires_at)
  values
    (v_company, p_workspace_id, v_actor, v_ids, v_count, v_per_app, v_expires_at)
  returning id into v_request_id;

  return jsonb_build_object(
    'request_id', v_request_id,
    'transfer_count', v_count,
    'per_app', v_per_app,
    'expires_at', v_expires_at
  );
end;
$$;

create or replace function public.clear_wb_transfer_log(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '1500ms'
as $$
declare
  v_actor uuid := auth.uid();
  v_request public.wb_transfer_clear_requests%rowtype;
  v_company text;
  v_result jsonb;
  v_now timestamptz := now();
begin
  if v_actor is null then
    raise exception 'Sign in to clear this log.' using errcode = '42501';
  end if;

  select * into v_request
  from public.wb_transfer_clear_requests
  where id = p_request_id
  for update;
  if not found then
    raise exception 'This clear request was not found. Preview the log again.' using errcode = 'P0001';
  end if;
  if v_request.actor_id <> v_actor then
    raise exception 'This clear request belongs to another account.' using errcode = '42501';
  end if;
  if not app_private.has_workspace_permission(v_request.workspace_id, 'workspaces.manage') then
    raise exception 'You cannot clear this workspace log.' using errcode = '42501';
  end if;
  if v_request.completed_at is not null then
    return v_request.completed_result;
  end if;
  if v_request.expires_at < v_now then
    raise exception 'This clear request expired. Preview the log again.' using errcode = 'P0001';
  end if;

  -- Derive the tenant again from the authoritative workspace at the moment of mutation.
  select w.company_id into v_company
  from public.workspaces w
  where w.id = v_request.workspace_id and w.status = 'active';
  if v_company is null or v_company <> v_request.company_id then
    raise exception 'That workspace is unavailable.' using errcode = 'P0001';
  end if;

  with deleted as (
    delete from public.wb_data_transfers t
    where t.workspace_id = v_request.workspace_id
      and t.id = any(v_request.transfer_ids)
      and t.direction in ('export', 'import')
    returning t.id, t.app_id
  ), per_app as (
    select app_id, count(*)::integer as removed
    from deleted
    group by app_id
  ), tombstones as (
    insert into public.wb_data_transfers
      (company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by)
    select v_company, v_request.workspace_id, app_id, 'cleared', '', removed, '', v_actor
    from per_app
    returning id, company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by, created_at
  )
  select jsonb_build_object(
    'request_id', v_request.id,
    'removed', coalesce((select sum(record_count)::integer from tombstones), 0),
    'removed_ids', coalesce((select jsonb_agg(id order by id) from deleted), '[]'::jsonb),
    'tombstones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'company_id', company_id, 'workspace_id', workspace_id, 'app_id', app_id,
        'direction', direction, 'format', format, 'record_count', record_count,
        'file_name', file_name, 'created_by', created_by, 'created_at', created_at
      ) order by app_id)
      from tombstones
    ), '[]'::jsonb),
    'completed_at', v_now
  ) into v_result;

  update public.wb_transfer_clear_requests
  set completed_at = v_now, completed_result = v_result
  where id = v_request.id;

  return v_result;
end;
$$;

revoke all on function public.preview_wb_transfer_clear(uuid) from public, anon;
revoke all on function public.clear_wb_transfer_log(uuid) from public, anon;
grant execute on function public.preview_wb_transfer_clear(uuid) to authenticated;
grant execute on function public.clear_wb_transfer_log(uuid) to authenticated;
