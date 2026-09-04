-- Public form uploads that no submission ever claimed.
--
-- A public form uploads each file straight to storage and only then posts the answers.
-- Anyone who attaches a file and abandons the form -- or who calls the upload endpoint
-- and never submits at all -- leaves the object behind forever. Nothing referenced it,
-- nothing removed it.
--
-- This routine only *reports* what is abandoned. The caller deletes through the storage
-- API, the way recycle-bin-purge already does: deleting a storage.objects row directly
-- drops the bookkeeping but can leave the physical object behind in the bucket.

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
  -- Every object_path mentioned anywhere in any surviving answer set, at any depth: a
  -- file answer is an object, and a multi-file answer is an array of them.
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
   order by o.created_at
   limit v_limit;
end;
$$;

revoke all on function public.abandoned_form_uploads(integer, integer) from public, anon, authenticated;
grant execute on function public.abandoned_form_uploads(integer, integer) to service_role;

comment on function public.abandoned_form_uploads(integer, integer) is
  'Lists public-form upload objects older than the cutoff that no form_responses answer references. Read-only; the caller removes them through the storage API. Service role only.';
