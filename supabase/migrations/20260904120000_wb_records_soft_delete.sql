-- The App Builder recycle bin becomes rows, so that deleting a record stops widening who can
-- read it -- and so that a 30-day expiry has something a scheduled job can actually see.
--
-- WHAT WAS WRONG
--
-- Live records moved into public.wb_records on 2026-08-28, gated per workspace by
-- has_workspace_permission(workspace_id, 'workspaces.records.view'). Deleted ones did not move
-- with them: they stayed in `app.trash` inside workspace_builder_state.doc, whose select policy
-- is company-level -- is_company_member + subscription_allows_access +
-- has_company_permission(company_id, 'workspaces.view'). So DELETING a record widened who could
-- read it. A member of one workspace could read every record ever deleted from a sibling
-- workspace, in the document the browser downloads at sign-in.
--
-- The bin also had no expiry. `expiredInTrash` reported records older than 30 days and
-- deliberately never swept them, because there was no scheduled job that could do it honestly
-- and nothing but a document to sweep. Both halves are the same fix: put the bin where the
-- records already are.
--
-- WHAT THIS DOES NOT DO
--
-- It does not remove `trash` from the document. The rows are COPIED, not moved, exactly as the
-- 2026-08-28 migration copied `items` -- so this migration alone changes no behaviour and a tab
-- open during the deploy cannot lose anything. The client is repointed in the same release.

-- ---------------------------------------------------------------------------------------
-- 1. Two facts, two columns.
-- ---------------------------------------------------------------------------------------
--
-- `deleted_at` is WHEN IT WENT, and it is what the bin shows. `purge_after` is WHEN IT WILL BE
-- DESTROYED, and it is what the sweeper reads. They are separate on purpose.
--
-- If one column carried both, the backfill below would be a data-loss event: a record that has
-- sat in a document bin for two hundred days would arrive already expired and be destroyed on
-- the first night, without anyone having been told the rule changed. Every backfilled row
-- therefore gets a full grace period from the migration, while keeping the true date it was
-- deleted -- so the bin can say "deleted 200 days ago, will be destroyed in 30".

alter table public.wb_records
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
  add column if not exists purge_after timestamptz;

comment on column public.wb_records.deleted_at is
  'When the record was moved to the app recycle bin. Null means live. What the bin displays.';
comment on column public.wb_records.purge_after is
  'When the sweeper may destroy this row for good. Set 30 days ahead when binned; separate from deleted_at so a backfilled bin is never destroyed on the day the rule changed.';

-- A row is either binned or not, and half-set is a state nothing knows how to render.
alter table public.wb_records drop constraint if exists wb_records_trash_pair;
alter table public.wb_records add constraint wb_records_trash_pair
  check ((deleted_at is null and purge_after is null) or (deleted_at is not null and purge_after is not null));

-- The list every screen asks for is the LIVE one, so it gets the partial index; the sweeper
-- reads the other side and gets its own.
create index if not exists wb_records_live_idx on public.wb_records (workspace_id, app_id) where deleted_at is null;
create index if not exists wb_records_purge_idx on public.wb_records (purge_after) where purge_after is not null;

-- ---------------------------------------------------------------------------------------
-- 2. Binning keeps needing permission to delete.
-- ---------------------------------------------------------------------------------------
--
-- Setting deleted_at is an UPDATE, and the update policy asks for `workspaces.records.edit`.
-- Left there, a role that may edit but not delete would gain the ability to empty a list into
-- the bin -- a permission change smuggled in as a storage change. So the transition goes
-- through a routine that asks for `workspaces.records.delete`, which is what deleting a record
-- has always needed, and the routine is the only thing that may write these columns.
--
-- Restore asks for the same key: putting something back is the other half of the same
-- capability, and somebody who could not have binned it has no business retrieving it.

create or replace function public.wb_trash_records(p_ids text[], p_actor uuid default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := coalesce(p_actor, (select auth.uid()));
  v_count integer := 0;
begin
  if p_ids is null or array_length(p_ids, 1) is null then return 0; end if;
  if v_uid is null then raise exception 'not signed in' using errcode = '42501'; end if;

  with allowed as (
    select r.id
    from public.wb_records r
    where r.id = any(p_ids)
      and r.deleted_at is null
      and app_private.has_workspace_permission(r.workspace_id, 'workspaces.records.delete')
  )
  update public.wb_records r
     set deleted_at = now(),
         deleted_by = v_uid,
         purge_after = now() + interval '30 days'
    from allowed a
   where r.id = a.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.wb_restore_records(p_ids text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer := 0;
begin
  if p_ids is null or array_length(p_ids, 1) is null then return 0; end if;
  if (select auth.uid()) is null then raise exception 'not signed in' using errcode = '42501'; end if;

  with allowed as (
    select r.id
    from public.wb_records r
    where r.id = any(p_ids)
      and r.deleted_at is not null
      and app_private.has_workspace_permission(r.workspace_id, 'workspaces.records.delete')
  )
  update public.wb_records r
     set deleted_at = null,
         deleted_by = null,
         purge_after = null
    from allowed a
   where r.id = a.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.wb_trash_records(text[], uuid) from public, anon;
revoke execute on function public.wb_restore_records(text[]) from public, anon;
grant execute on function public.wb_trash_records(text[], uuid) to authenticated;
grant execute on function public.wb_restore_records(text[]) to authenticated;

-- Purging by hand stays an ordinary DELETE, which the existing policy already gates on
-- `workspaces.records.delete`. Nothing to add: destroying a row was always that.

-- ---------------------------------------------------------------------------------------
-- 3. The sweeper.
-- ---------------------------------------------------------------------------------------
--
-- Bounded, like purge_expired_recycle_bin beside it, so one long night cannot hold a
-- transaction open across the whole table. Service role only: this destroys data and nothing
-- signed in as a person should be able to call it.

create or replace function public.purge_expired_wb_records(p_limit integer default 200)
returns integer
language plpgsql
security definer
set search_path = ''
set statement_timeout = '30s'
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 200), 1), 1000);
  v_count integer := 0;
begin
  with expired as (
    select id from public.wb_records
    where purge_after is not null and purge_after < now()
    order by purge_after
    limit v_limit
  )
  delete from public.wb_records r using expired e where r.id = e.id;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.purge_expired_wb_records(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_wb_records(integer) to service_role;

comment on function public.purge_expired_wb_records(integer) is
  'Destroys App Builder records whose 30-day bin period has passed. Called nightly by pg_cron and by the authenticated Vercel cron, so the sweep still happens if either is unavailable.';

-- ---------------------------------------------------------------------------------------
-- 4. Copy what is already in the bins, WITHOUT starting their clock.
-- ---------------------------------------------------------------------------------------
--
-- Every app.trash entry in every document becomes a row. The item object is stored verbatim in
-- `data`, exactly as live records are, so the browser reads the same shape from both.
--
-- `purge_after` is 30 days from NOW for all of them, never from the original deletion. A bin
-- that has been accumulating since July must not be emptied by the deploy that gives it an
-- expiry; the people who own those records have not yet been told there is one.
--
-- Rows that already exist are left alone: `on conflict do nothing` means re-running this is
-- safe, and a record whose id is somehow live is not quietly re-binned.

-- Every cast here is guarded, and that is not defensiveness for its own sake. A document holds
-- whatever a browser once wrote: `deletedBy` was a display name before it was a profile id,
-- `createdAt` may be a bare date or absent, and a legacy `ws-<companyId>` id ("ws-lumen") is not
-- a uuid at all. An unguarded ::uuid or ::timestamptz on any one of those aborts the migration
-- for every company, so the workspace is matched AS TEXT and the two timestamps are only cast
-- when they look like timestamps.
--
-- The filtering happens in the CTE and the projection reads its output, so nothing is coerced
-- before it has been checked -- WHERE is not guaranteed to run before the select list.
with bin_entries as (
  select
    s.company_id,
    ws->>'id'   as builder_workspace_id,
    app->>'id'  as app_id,
    entry
  from public.workspace_builder_state s
  cross join lateral jsonb_array_elements(coalesce(s.doc->'workspaces', '[]'::jsonb)) as ws
  cross join lateral jsonb_array_elements(coalesce(ws->'apps', '[]'::jsonb)) as app
  cross join lateral jsonb_array_elements(coalesce(app->'trash', '[]'::jsonb)) as entry
  where jsonb_typeof(coalesce(app->'trash', '[]'::jsonb)) = 'array'
    and jsonb_typeof(entry) = 'object'
    and coalesce(app->>'linked', 'false') <> 'true'
    and nullif(btrim(entry->>'id'), '') is not null
    and nullif(btrim(app->>'id'), '') is not null
)
insert into public.wb_records (id, company_id, workspace_id, app_id, data, created_at, deleted_at, deleted_by, purge_after)
select
  btrim(b.entry->>'id'),
  b.company_id,
  w.id,
  btrim(b.app_id),
  b.entry - 'deletedAt' - 'deletedBy' - 'purgeAfter',
  case when b.entry->>'createdAt' ~ '^\d{4}-\d{2}-\d{2}' then (b.entry->>'createdAt')::timestamptz else now() end,
  case when b.entry->>'deletedAt' ~ '^\d{4}-\d{2}-\d{2}' then (b.entry->>'deletedAt')::timestamptz else now() end,
  p.id,
  now() + interval '30 days'
from bin_entries b
join public.workspaces w
  on w.id::text = nullif(replace(b.builder_workspace_id, 'ws-', ''), '')
 and w.company_id = b.company_id
-- Resolved rather than cast. A `deletedBy` naming somebody who has since left would fail the
-- foreign key and take the whole migration with it; unmatched simply means the row arrives
-- without an author, which is what the bin already renders for a departed colleague.
left join public.profiles p
  on p.id::text = lower(nullif(btrim(b.entry->>'deletedBy'), ''))
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------------------
-- 5. Schedule it beside the bin sweep that already runs.
-- ---------------------------------------------------------------------------------------
--
-- Ten minutes after quest-hq-recycle-bin-purge, so two bounded deletes do not start together.
-- The Vercel cron calls the same routine at 03:20; either one alone is enough, which is the
-- point -- pg_cron is unavailable on some plans and the endpoint needs a deployment.

do $$
declare
  v_job_id bigint;
begin
  if to_regnamespace('cron') is not null then
    for v_job_id in execute 'select jobid from cron.job where jobname = ''quest-hq-wb-records-purge'''
    loop
      execute format('select cron.unschedule(%s)', v_job_id);
    end loop;
    execute $schedule$
      select cron.schedule(
        'quest-hq-wb-records-purge',
        '25 3 * * *',
        'select public.purge_expired_wb_records(500);'
      )
    $schedule$;
  end if;
exception when others then
  raise notice 'pg_cron schedule was skipped: %', sqlerrm;
end;
$$;
