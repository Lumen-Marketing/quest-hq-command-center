-- REVIEW-ONLY live verification for 20260909181650_wb_transfer_clear_atomic.sql.
-- Run as database owner after review. It selects a real active owner/workspace automatically;
-- every probe row, request and tombstone ends in ROLLBACK. No psql variables are required.

begin;

create temporary table qb_transfer_clear_context on commit drop as
select
  w.id as workspace_id,
  owner_member.profile_id as manager_id,
  (
    select other_member.profile_id
    from public.company_memberships other_member
    where other_member.company_id = w.company_id
      and other_member.status = 'active'
      and other_member.profile_id <> owner_member.profile_id
    order by other_member.created_at
    limit 1
  ) as other_actor_id
from public.workspaces w
join public.company_memberships owner_member
  on owner_member.company_id = w.company_id
  and owner_member.status = 'active'
  and owner_member.role = 'owner'
where w.status = 'active'
order by w.created_at
limit 1;
-- The table is created before SET ROLE, so explicitly expose this rollback-only fixture to
-- the authenticated role used by the remainder of the probe.
grant select on qb_transfer_clear_context to authenticated;

do $$
begin
  if not exists (select 1 from qb_transfer_clear_context) then
    raise exception 'no active owner workspace exists for the rollback probe';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', manager_id::text, true) from qb_transfer_clear_context;

do $$
declare v_workspace uuid;
begin
  select workspace_id into v_workspace from qb_transfer_clear_context;
  if not app_private.has_workspace_permission(v_workspace, 'workspaces.manage') then
    raise exception 'selected owner does not currently have workspaces.manage for the probe workspace';
  end if;
end $$;

-- The server-only ledger is neither directly readable nor directly writable by browser roles.
do $$
begin
  perform 1 from public.wb_transfer_clear_requests limit 1;
  raise exception 'request ledger unexpectedly readable by authenticated';
exception when insufficient_privilege then null;
end $$;

-- Seed more than the historic 200-row client page. `created_by` is auth.uid(), proving normal
-- transfer rows remain writable by a permitted caller while the actor cannot be supplied alone.
insert into public.wb_data_transfers
  (company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by)
select w.company_id, w.id, 'qb-rv-probe', 'export', 'csv', 1, '', auth.uid()
from public.workspaces w
join qb_transfer_clear_context c on c.workspace_id = w.id,
generate_series(1, 201);

-- Browser DELETE and forged `cleared` markers must fail before the atomic RPC is used.
do $$
declare v_workspace uuid;
begin
  select workspace_id into v_workspace from qb_transfer_clear_context;
  begin
    delete from public.wb_data_transfers where workspace_id = v_workspace and app_id = 'qb-rv-probe';
    raise exception 'direct transfer delete unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.wb_data_transfers
      (company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by)
    select company_id, id, 'qb-rv-forged', 'cleared', '', 1, '', auth.uid()
    from public.workspaces where id = v_workspace;
    raise exception 'forged cleared marker unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  -- A valid foreign company id must not be taggable onto this workspace either.
  begin
    insert into public.wb_data_transfers
      (company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by)
    select other_company.id, v_workspace, 'qb-rv-cross-tenant', 'export', 'csv', 1, '', auth.uid()
    from public.companies other_company
    where other_company.id <> (select company_id from public.workspaces where id = v_workspace)
    limit 1;
    if found then raise exception 'cross-company transfer tag unexpectedly succeeded'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;

create temporary table qb_transfer_clear_preview on commit drop as
select public.preview_wb_transfer_clear(workspace_id) as preview
from qb_transfer_clear_context;

do $$
declare p jsonb;
begin
  select preview into p from qb_transfer_clear_preview;
  if (p->>'transfer_count')::integer < 201 then
    raise exception 'preview did not include >200 rows: %', p;
  end if;
end $$;

-- If this tenant has a manager deliberately denied record-view, prove that manager can still
-- obtain the RPC count. The browser client never issues a direct .select for this flow.
do $$
declare candidate record; v_workspace uuid; p jsonb; found_fixture boolean := false;
begin
  select workspace_id into v_workspace from qb_transfer_clear_context;
  for candidate in
    select cm.profile_id
    from public.company_memberships cm
    where cm.company_id = (select company_id from public.workspaces where id = v_workspace)
      and cm.status = 'active'
      and cm.profile_id <> (select manager_id from qb_transfer_clear_context)
  loop
    perform set_config('request.jwt.claim.sub', candidate.profile_id::text, true);
    if app_private.has_workspace_permission(v_workspace, 'workspaces.manage')
       and not app_private.has_workspace_permission(v_workspace, 'workspaces.records.view') then
      p := public.preview_wb_transfer_clear(v_workspace);
      if (p->>'transfer_count')::integer < 201 then raise exception 'manage-without-view preview lost rows'; end if;
      found_fixture := true;
      exit;
    end if;
  end loop;
  if not found_fixture then
    raise notice 'no active manage-without-record-view fixture in this tenant; browser unit test covers this path';
  end if;
end $$;

-- Actor binding is tested without psql substitution. The alternate profile may lack manage:
-- actor mismatch is intentionally checked before authorization.
do $$
declare v_other uuid; v_request uuid;
begin
  select other_actor_id into v_other from qb_transfer_clear_context;
  select (preview->>'request_id')::uuid into v_request from qb_transfer_clear_preview;
  if v_other is not null then
    perform set_config('request.jwt.claim.sub', v_other::text, true);
    begin
      perform public.clear_wb_transfer_log(v_request);
      raise exception 'another actor consumed the request';
    exception when insufficient_privilege then null;
    end;
  else
    raise notice 'no second active profile in this tenant; actor-binding fixture skipped';
  end if;
end $$;

-- Restore the owner. An arrival after preview must survive; same request result must replay
-- byte-for-byte, and the outer rollback demonstrates that transfer delete+tombstones+ledger are
-- one transaction.
select set_config('request.jwt.claim.sub', manager_id::text, true) from qb_transfer_clear_context;
insert into public.wb_data_transfers
  (company_id, workspace_id, app_id, direction, format, record_count, file_name, created_by)
select w.company_id, w.id, 'qb-rv-new-arrival', 'import', 'csv', 1, '', auth.uid()
from public.workspaces w join qb_transfer_clear_context c on c.workspace_id = w.id;

create temporary table qb_transfer_clear_result on commit drop as
select public.clear_wb_transfer_log((preview->>'request_id')::uuid) as result
from qb_transfer_clear_preview;

do $$
declare first_result jsonb; second_result jsonb;
begin
  select result into first_result from qb_transfer_clear_result;
  select public.clear_wb_transfer_log((preview->>'request_id')::uuid)
    into second_result from qb_transfer_clear_preview;
  if first_result <> second_result then raise exception 'clear retry was not idempotent'; end if;
  if (first_result->>'removed')::integer < 201 then raise exception 'clear did not remove prepared rows: %', first_result; end if;
  if not exists (
    select 1 from public.wb_data_transfers t join qb_transfer_clear_context c on c.workspace_id = t.workspace_id
    where t.app_id = 'qb-rv-new-arrival' and t.direction = 'import'
  ) then raise exception 'new arrival was deleted with snapshot'; end if;
end $$;

reset role;
rollback;
