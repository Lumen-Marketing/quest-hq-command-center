-- Concise server-only evidence for form-upload purge runs. It deliberately stores no object
-- paths, form/company identifiers, response data, or provider error text.
create table if not exists public.maintenance_job_runs (
  id uuid primary key default gen_random_uuid(),
  job text not null check (job = 'form_upload_purge'),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('started', 'success', 'failed', 'partial')),
  selected_count integer not null default 0 check (selected_count >= 0),
  deleted_count integer not null default 0 check (deleted_count >= 0 and deleted_count <= selected_count),
  stage text not null check (stage in ('started', 'completed', 'expired_intents', 'candidate_query', 'storage_remove', 'storage_confirmation', 'intent_cleanup', 'unexpected')),
  error_code text check (error_code is null or error_code in ('expired_intent_cleanup_failed', 'candidate_query_failed', 'storage_remove_failed', 'storage_remove_incomplete', 'unmatched_storage_response', 'intent_cleanup_failed', 'unexpected_failure')),
  constraint maintenance_job_runs_completion_check check (
    (status = 'started' and finished_at is null and stage = 'started' and error_code is null)
    or (status <> 'started' and finished_at is not null)
  )
);

create index if not exists maintenance_job_runs_retention_idx
  on public.maintenance_job_runs (job, (coalesce(finished_at, started_at)));

alter table public.maintenance_job_runs enable row level security;
revoke all on table public.maintenance_job_runs from public, anon, authenticated;
grant select, insert, update, delete on table public.maintenance_job_runs to service_role;

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
      where job = 'form_upload_purge'
        and coalesce(finished_at, started_at) < now() - make_interval(days => v_days)
      order by coalesce(finished_at, started_at) asc
      limit v_limit
   );
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_maintenance_job_runs(integer, integer) from public, anon, authenticated;
grant execute on function public.purge_maintenance_job_runs(integer, integer) to service_role;

comment on table public.maintenance_job_runs is
  'Service-only concise maintenance evidence; form upload purge stores counts and sanitized statuses only.';
comment on function public.purge_maintenance_job_runs(integer, integer) is
  'Service-only bounded retention for completed maintenance run evidence.';

-- Protect a submitted upload even if a later lifecycle action removes the response that once
-- referenced it. The form-response test remains the primary guard; claimed intent is defence
-- in depth for this service-only candidate selector.
create or replace function public.abandoned_form_uploads(
  p_older_than_hours integer default 48,
  p_limit integer default 200
)
returns table (object_path text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '30s'
as $$
declare
  v_hours integer := least(greatest(coalesce(p_older_than_hours, 48), 1), 24 * 30);
  v_limit integer := least(greatest(coalesce(p_limit, 200), 1), 1000);
  v_cutoff timestamptz := now() - make_interval(hours => v_hours);
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
begin
  if session_user <> 'postgres' and v_role <> 'service_role' then
    raise exception 'service role required';
  end if;

  return query
  with referenced as (
    select distinct jsonb_path_query(fr.answers, '$.**.object_path') #>> '{}' as object_path
      from public.form_responses fr
     where fr.answers is not null
  )
  select o.name::text, o.created_at
    from storage.objects o
   where o.bucket_id = 'quest-form-response-files'
     and o.created_at < v_cutoff
     and not exists (select 1 from referenced r where r.object_path = o.name)
     and not exists (
       select 1
         from public.form_upload_intents fui
        where fui.object_path = o.name
          and fui.claimed_at is not null
     )
   order by o.created_at
   limit v_limit;
end;
$$;

revoke all on function public.abandoned_form_uploads(integer, integer) from public, anon, authenticated;
grant execute on function public.abandoned_form_uploads(integer, integer) to service_role;

comment on function public.abandoned_form_uploads(integer, integer) is
  'Lists unclaimed, unreferenced public-form uploads older than the cutoff. Read-only; service role only.';
