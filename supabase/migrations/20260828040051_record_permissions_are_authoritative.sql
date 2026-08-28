-- The four record permissions stop being overridable by the broad key.
--
-- 20260828025112 made `workspaces.manage` satisfy records.create/edit/delete and
-- `workspaces.view` satisfy records.view, so that no role lost access the moment the keys
-- existed. That was the right instinct and the wrong mechanism: it left the four checkboxes
-- non-authoritative. A role with "Create/edit workspace apps" ticked kept every record power
-- no matter what the record boxes said, so unticking "Delete app records" did nothing and the
-- permissions screen told the administrator something untrue.
--
-- Reported from production: a worker with the delete box unticked deleted a record anyway,
-- because the manage box above it was still ticked.
--
-- The compatibility is kept, but as DATA rather than as a rule. Every role that relies on the
-- broad key today is granted the specific keys once, here. After that the four keys are the
-- only thing consulted, so what the screen shows is what the database does.

-- ---------------------------------------------------------------------------------------
-- 1. Grant the specific keys to the roles that currently depend on the broad ones.
-- ---------------------------------------------------------------------------------------
--
-- Only where the role does not already say something about that key -- an administrator who
-- has already unticked a record box must not have it handed back. `on conflict do nothing`
-- is not enough on its own for that, because an explicit `deny` is a row too; the not-exists
-- checks the key rather than the row.

insert into public.role_permissions (role_id, permission_key, effect)
select rp.role_id, k.key, 'allow'
from public.role_permissions rp
cross join lateral (values
  ('workspaces.records.create'),
  ('workspaces.records.edit'),
  ('workspaces.records.delete')
) as k(key)
where rp.permission_key = 'workspaces.manage'
  and rp.effect = 'allow'
  and not exists (
    select 1 from public.role_permissions existing
    where existing.role_id = rp.role_id and existing.permission_key = k.key
  )
on conflict do nothing;

insert into public.role_permissions (role_id, permission_key, effect)
select rp.role_id, 'workspaces.records.view', 'allow'
from public.role_permissions rp
where rp.permission_key = 'workspaces.view'
  and rp.effect = 'allow'
  and not exists (
    select 1 from public.role_permissions existing
    where existing.role_id = rp.role_id and existing.permission_key = 'workspaces.records.view'
  )
on conflict do nothing;

-- A wildcard role ('*') already matches every key and needs nothing.

-- ---------------------------------------------------------------------------------------
-- 2. Stop aliasing them.
-- ---------------------------------------------------------------------------------------
--
-- Identical to the version in 20260828025112 except that the four record lines are gone from
-- permission_variants. Owner/admin/developer still bypass everything, as everywhere else.

create or replace function app_private.has_workspace_permission(target_workspace_id uuid, permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  with permission_variants as (
    select permission as permission_key
  ), workspace_company as (
    select w.company_id
    from public.workspaces w
    where w.id = target_workspace_id and w.status = 'active'
  ), membership as (
    select cm.company_id, cm.role as company_role
    from public.company_memberships cm
    join workspace_company wc on wc.company_id = cm.company_id
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
    limit 1
  ), workspace_access as (
    select wm.role_id
    from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = (select auth.uid())
      and wm.status = 'active'
    limit 1
  ), assigned_roles as (
    select wa.role_id from workspace_access wa where wa.role_id is not null
    union
    select ura.role_id
    from public.user_role_assignments ura
    join membership m on m.company_id = ura.company_id
    where ura.profile_id = (select auth.uid())
      and not exists (select 1 from workspace_access wa where wa.role_id is not null)
  ), effects as (
    select rp.effect
    from assigned_roles ar
    join public.role_permissions rp on rp.role_id = ar.role_id
    where rp.permission_key = '*'
       or rp.permission_key in (select permission_key from permission_variants)
  )
  select
    (select auth.uid()) is not null
    and app_private.workspace_permission_plugin_available(target_workspace_id, permission)
    and (
      exists (select 1 from membership where company_role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and exists (select 1 from workspace_access)
        and not exists (select 1 from effects where effect = 'deny')
        and (
          exists (select 1 from effects where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$function$;
