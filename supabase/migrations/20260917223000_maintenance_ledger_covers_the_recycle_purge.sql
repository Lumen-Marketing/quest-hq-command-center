-- The run ledger was built for one job and pinned to it by a CHECK, so the nightly recycle-bin
-- purge wrote nothing at all. That job permanently deletes files and rows, and a stopped one was
-- indistinguishable from a quiet one: the 2026-09-17 audit could confirm only that the form-upload
-- purge had run. This widens the ledger to cover it.
--
-- The RingCentral sync is deliberately NOT added. It already leaves a trace of its own -- every
-- company it syncs carries last_sync_at, consecutive_failures and last_error in
-- ringcentral_sync_state -- and it runs every fifteen minutes, which is 96 rows a day for evidence
-- that already exists somewhere better.
--
-- Nothing else about the table changes. The stage vocabulary already carries 'started', 'completed'
-- and 'unexpected', and 'unexpected_failure' is already an allowed error code, which is all the
-- purge reports. Reads and writes stay service-role only.

alter table public.maintenance_job_runs drop constraint if exists maintenance_job_runs_job_check;
alter table public.maintenance_job_runs
  add constraint maintenance_job_runs_job_check
  check (job in ('form_upload_purge', 'recycle_bin_purge'));

-- Retention named the one job too, so rows from any other would have been kept for ever. It now
-- prunes by age across whatever the ledger holds; the caller's arguments are unchanged, and both
-- jobs run it before they accept work.
create or replace function public.purge_maintenance_job_runs(
  p_older_than_days integer default 90,
  p_limit integer default 500
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_days integer := least(greatest(coalesce(p_older_than_days, 90), 1), 3650);
  v_limit integer := least(greatest(coalesce(p_limit, 500), 1), 5000);
  v_deleted integer;
begin
  delete from public.maintenance_job_runs
   where id in (
     select id
       from public.maintenance_job_runs
      where coalesce(finished_at, started_at) < now() - make_interval(days => v_days)
      order by coalesce(finished_at, started_at) asc
      limit v_limit
   );
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_maintenance_job_runs(integer, integer) from public, anon, authenticated;
grant execute on function public.purge_maintenance_job_runs(integer, integer) to service_role;
