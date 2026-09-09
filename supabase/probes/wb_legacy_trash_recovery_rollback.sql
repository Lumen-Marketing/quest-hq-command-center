-- REVIEW-ONLY verification for 20260909182840_recover_legacy_wb_trash_snapshots.sql.
--
-- Run only against a schema-current clone that still has the 91 legacy entries, after the
-- migration has installed its function and before the separate generic apply step.
-- It writes inside this transaction and always ends in ROLLBACK.

begin;

create temporary table qb_rv06_before as
select
  count(*)::integer as total_rows,
  count(*) filter (where deleted_at is null)::integer as live_rows,
  count(*) filter (where deleted_at is not null)::integer as trashed_rows
from public.wb_records;

create temporary table qb_rv06_live_before as
select id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_by, purge_after
from public.wb_records
where deleted_at is null;

create temporary table qb_rv06_dry as
select public.reconcile_legacy_wb_trash_snapshots(null, 100, true) as result;

do $$
declare v jsonb;
begin
  select result into v from qb_rv06_dry;
  if (v->>'exact_existing_removed')::integer <> 86
     or (v->>'recovered_rows')::integer <> 5
     or (v->>'document_entries_proven')::integer <> 91
     or (v->>'unresolved_entries')::integer <> 0
     or (v->>'dry_run')::boolean is not true then
    raise exception 'unexpected RV06 dry-run aggregate: %', v;
  end if;
end $$;

create temporary table qb_rv06_apply as
select public.reconcile_legacy_wb_trash_snapshots(null, 100, false) as result;

do $$
declare v jsonb;
begin
  select result into v from qb_rv06_apply;
  if (v->>'exact_existing_removed')::integer <> 86
     or (v->>'recovered_rows')::integer <> 5
     or (v->>'document_entries_removed')::integer <> 91
     or (v->>'unresolved_entries')::integer <> 0
     or (v->>'dry_run')::boolean is not false then
    raise exception 'unexpected RV06 recovery aggregate: %', v;
  end if;
end $$;

-- Every recovered mapping must point at the same binned snapshot the reconciler just proved.
do $$
begin
  if (select count(*) from public.wb_legacy_trash_recovery_map) <> 5
     or exists (
       select 1
         from public.wb_legacy_trash_recovery_map m
         left join public.wb_records r on r.id = m.recovered_record_id
        where r.id is null
           or r.company_id <> m.company_id
           or r.workspace_id <> m.workspace_id
           or r.app_id <> m.app_id
           or r.deleted_at <> m.payload_deleted_at
           or r.data->>'id' <> m.recovered_record_id
           or r.purge_after < now() + interval '29 days'
     ) then
    raise exception 'RV06 recovered mapping did not preserve the binned snapshot';
  end if;
end $$;

-- Count equality is not enough: every original live row, including its payload, must remain
-- byte-for-byte unchanged. New recovery rows are all binned and therefore cannot appear here.
do $$
begin
  if exists (
    (
      select id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_by, purge_after
      from qb_rv06_live_before
      except
      select id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_by, purge_after
      from public.wb_records where deleted_at is null
    )
    union all
    (
      select id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_by, purge_after
      from public.wb_records where deleted_at is null
      except
      select id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_by, purge_after
      from qb_rv06_live_before
    )
  ) then
    raise exception 'RV06 changed an existing live wb_records row';
  end if;
end $$;

-- Existing live rows are never moved, rewritten, or deleted. Recovery adds five binned rows.
do $$
declare before_counts record; after_total integer; after_live integer; after_trash integer;
begin
  select * into before_counts from qb_rv06_before;
  select count(*)::integer,
         count(*) filter (where deleted_at is null)::integer,
         count(*) filter (where deleted_at is not null)::integer
    into after_total, after_live, after_trash
    from public.wb_records;
  if after_total <> before_counts.total_rows + 5
     or after_live <> before_counts.live_rows
     or after_trash <> before_counts.trashed_rows + 5 then
    raise exception 'RV06 changed live rows or added the wrong count: before %, after %/%/%',
      row(before_counts.total_rows, before_counts.live_rows, before_counts.trashed_rows),
      after_total, after_live, after_trash;
  end if;
end $$;

-- The document now has no eligible legacy entries. A second pass must be a no-op.
do $$
declare v jsonb;
begin
  select public.reconcile_legacy_wb_trash_snapshots(null, 100, false) into v;
  if (v->>'document_entries_removed')::integer <> 0
     or (v->>'recovered_rows')::integer <> 0
     or (v->>'mapped_rows_removed')::integer <> 0 then
    raise exception 'RV06 repeat was not a no-op: %', v;
  end if;
end $$;

rollback;
