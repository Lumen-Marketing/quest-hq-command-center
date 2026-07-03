-- Delete an entire company workspace (tenant), owner-only.
--
-- Deleting a company must remove its final owner membership, which the
-- prevent_last_owner_loss trigger normally blocks. We add a transaction-local
-- bypass GUC so only this trusted, owner-verified delete can remove the last
-- owner, then clear the ON DELETE RESTRICT child tables (jobs and friends)
-- before deleting the company row, which cascades everything else.

-- 1) Teach the owner-guard trigger to honour a trusted bypass flag.
create or replace function app_private.prevent_last_owner_loss()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  remaining_owner_count integer;
begin
  -- Trusted server-side workspace deletion may remove the final owner.
  if coalesce(current_setting('app.bypass_owner_guard', true), 'off') = 'on' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.role = 'owner' and old.status = 'active' then
      select count(*) into remaining_owner_count
      from public.company_memberships cm
      where cm.company_id = old.company_id
        and cm.profile_id <> old.profile_id
        and cm.role = 'owner'
        and cm.status = 'active';

      if remaining_owner_count = 0 then
        raise exception 'Every company must keep at least one active Owner';
      end if;
    end if;

    return old;
  end if;

  if old.role = 'owner'
     and old.status = 'active'
     and (
       new.role <> 'owner'
       or new.status <> 'active'
       or new.company_id <> old.company_id
       or new.profile_id <> old.profile_id
     ) then
    select count(*) into remaining_owner_count
    from public.company_memberships cm
    where cm.company_id = old.company_id
      and cm.profile_id <> old.profile_id
      and cm.role = 'owner'
      and cm.status = 'active';

    if remaining_owner_count = 0 then
      raise exception 'Every company must keep at least one active Owner';
    end if;
  end if;

  return new;
end;
$$;

-- 2) Owner-only cascade delete of an entire company workspace.
create or replace function public.delete_company_workspace(target_company_id text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if clean_company_id = '' then
    raise exception 'Workspace id is required';
  end if;

  -- Caller must be an active owner of this workspace.
  if not exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = clean_company_id
      and cm.profile_id = auth.uid()
      and cm.role = 'owner'
      and cm.status = 'active'
  ) then
    raise exception 'Only an active owner can delete this workspace';
  end if;

  -- Allow removing the final owner for this transaction only.
  perform set_config('app.bypass_owner_guard', 'on', true);

  -- Company FKs that are ON DELETE RESTRICT must be cleared first,
  -- children before parents. Guarded so a missing table never aborts the delete.
  if to_regclass('public.tasks') is not null then
    delete from public.tasks where company_id = clean_company_id;
  end if;
  if to_regclass('public.job_files') is not null then
    delete from public.job_files where company_id = clean_company_id;
  end if;
  if to_regclass('public.job_attributes') is not null then
    delete from public.job_attributes where company_id = clean_company_id;
  end if;
  if to_regclass('public.audit_events') is not null then
    delete from public.audit_events where company_id = clean_company_id;
  end if;
  if to_regclass('public.jobs') is not null then
    delete from public.jobs where company_id = clean_company_id;
  end if;

  -- Everything else (memberships, subscriptions, roles, contacts, deals,
  -- finance, messages, calendar, plugins, portals, price book, workspace docs,
  -- notifications, …) cascades from the company row.
  delete from public.companies where id = clean_company_id;

  perform set_config('app.bypass_owner_guard', 'off', true);

  return clean_company_id;
end;
$$;

grant execute on function public.delete_company_workspace(text) to authenticated;
