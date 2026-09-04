-- The person who binned a record is the person who called, and nobody else.
--
-- 20260904120000 gave wb_trash_records an optional `p_actor`, defaulting to auth.uid(). It was
-- never passed -- the browser calls it with p_ids alone -- and it should never have been offered:
-- the routine is SECURITY DEFINER and executable by `authenticated`, so anyone with
-- `workspaces.records.delete` in a workspace could bin a record and stamp somebody else's id on
-- it. The bin renders `deleted_by` as "who sent it", so the only thing the parameter could
-- change was the answer to that question, in the direction of a lie.
--
-- No privilege was gained by it and nothing was lost, which is why this is a small file rather
-- than an incident. It is still worth removing on the day it was added: a forgeable attribution
-- on a destructive action is the kind of thing that is only ever noticed later, by someone
-- trying to work out who emptied a list.
--
-- The two-argument form is dropped rather than left beside the new one. Leaving it would keep
-- the hole open under an older signature, and PostgREST would happily route to it.

drop function if exists public.wb_trash_records(text[], uuid);

create or replace function public.wb_trash_records(p_ids text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
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

revoke execute on function public.wb_trash_records(text[]) from public, anon;
grant execute on function public.wb_trash_records(text[]) to authenticated;

comment on function public.wb_trash_records(text[]) is
  'Moves App Builder records to the app recycle bin, 30 days ahead of purge. Checks workspaces.records.delete per row, because setting deleted_at is an UPDATE and the table policy would only ask for records.edit. The actor is always the caller.';
