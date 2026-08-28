-- Managing a workspace becomes its own permission, separate from building apps inside it.
--
-- Before this, the roles editor offered two workspace powers -- view apps and create/edit apps
-- -- and neither covered administering the workspace itself: its name, icon, description,
-- archive state, and which one is the default. The only key that reached those was
-- `settings.manage`, which is the whole company settings area: brand, modules, integrations,
-- pipelines, handoffs, launch. Letting somebody rename a workspace meant handing them all of
-- it. Same bundling problem as `company_contacts.manage`, and the same fix.
--
-- It also closes a real mismatch. `canManageOperationalWorkspaces()` in the browser already
-- accepted `settings.manage`, but every RPC behind that surface checks `is_workspace_admin` or
-- `is_company_admin`, which look only at the company ROLE and ignore permissions entirely. A
-- non-elevated member holding `settings.manage` therefore saw the workspace settings controls
-- enabled and got "Workspace admin access required" on save. The UI promised what the database
-- refused -- exactly what the comment on `can()` warns about.
--
-- SCOPE, deliberately narrow: identity and lifecycle only. Rename, icon, description,
-- archive/restore, create, reorder, and set-default. It does NOT grant workspace membership or
-- module activation. `is_workspace_admin` is left completely alone for that reason: it also
-- guards workspace_memberships and workspace_plugins through RLS, and widening it would have
-- handed over who can see a workspace's records along with the ability to rename it.

-- ---------------------------------------------------------------------------------------
-- 1. The legacy key keeps satisfying the new one.
-- ---------------------------------------------------------------------------------------
--
-- Body is otherwise identical to 20260828002845, including `search_path = ''` and the explicit
-- auth.uid() guard. Only the permission_variants CTE gains a line, so no role assignment has to
-- be rewritten and nobody holding settings.manage loses access.

create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  with permission_variants as (
    select permission as permission_key
    union
    select case
      when permission = 'messages.manage' then 'messages.manage_groups'
      when permission = 'messages.manage_groups' then 'messages.manage'
      when permission = 'company_contacts.create' then 'company_contacts.manage'
      when permission = 'company_contacts.edit' then 'company_contacts.manage'
      when permission = 'company_contacts.delete' then 'company_contacts.manage'
      when permission = 'company_contacts.fields.manage' then 'company_contacts.manage'
      when permission = 'workspaces.settings.manage' then 'settings.manage'
      else permission
    end
  ),
  membership as (
    select cm.role
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = (select auth.uid())
      and (
        rp.permission_key = '*'
        or rp.permission_key in (select permission_key from permission_variants)
      )
  )
  select
    (select auth.uid()) is not null
    and app_private.permission_plugin_available(target_company_id, permission)
    and (
      exists (select 1 from membership where role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and not exists (select 1 from assigned where effect = 'deny')
        and (
          exists (select 1 from assigned where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$function$;

-- ---------------------------------------------------------------------------------------
-- 2. Workspace administration is not an App Builder feature.
-- ---------------------------------------------------------------------------------------
--
-- `workspaces.%` maps to the workspace_builder plugin, which is right for the app keys and
-- wrong for this one: every company has workspaces whether or not the builder is installed,
-- and they still have to be renamed and archived. Without this the new permission would answer
-- false for any company that never installed App Builder. Mirrored by permissionPluginIds()
-- in src/main.js; the two must agree or the browser and the database gate differently.

create or replace function app_private.permission_plugin_ids(permission text)
returns text[]
language sql
stable
set search_path to 'public', 'app_private', 'pg_temp'
as $function$
  select case
    when permission = 'workspaces.settings.manage' then array[]::text[]
    when permission like 'crm.%' then array['crm', 'crm_2']::text[]
    when permission like 'company_contacts.%' then array['company_contacts']::text[]
    when permission like 'underwriter.%' then array['underwriter']::text[]
    when permission like 'files.%' then array['files']::text[]
    when permission like 'client_portals.%' then array['client_portal']::text[]
    when permission like 'workspaces.%' then array['workspace_builder']::text[]
    when permission like 'price_book.%' then array['price_book']::text[]
    when permission like 'forms.%' then array['forms']::text[]
    when permission like 'finance.%' then array['finance']::text[]
    when permission like 'messages.%' then array['messages']::text[]
    when permission like 'calendar.%' then array['calendar']::text[]
    when permission in ('time.track', 'clock.manage') then array['time_clock']::text[]
    when permission like 'approvals.%' then array['approvals']::text[]
    when permission = 'team.view' then array['reporting', 'calls']::text[]
    else array[]::text[]
  end;
$function$;

-- ---------------------------------------------------------------------------------------
-- 3. Two helpers: elevated role OR the new permission.
-- ---------------------------------------------------------------------------------------
--
-- Two shapes because the RPCs come in two shapes -- create and reorder are company-scoped and
-- have no workspace yet, update and set-default name one. Neither is granted to a browser role:
-- they are only ever called from inside SECURITY DEFINER routines, which execute as the owner.

create or replace function app_private.can_manage_company_workspace_settings(target_company_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select app_private.is_company_admin(target_company_id)
     or app_private.has_company_permission(target_company_id, 'workspaces.settings.manage');
$function$;

create or replace function app_private.can_manage_workspace_settings(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select app_private.is_workspace_admin(target_workspace_id)
     or exists (
       select 1
       from public.workspaces w
       where w.id = target_workspace_id
         and app_private.has_company_permission(w.company_id, 'workspaces.settings.manage')
     );
$function$;

revoke all on function app_private.can_manage_company_workspace_settings(text) from public, anon, authenticated;
revoke all on function app_private.can_manage_workspace_settings(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- 4. Point the four settings RPCs at the new check.
-- ---------------------------------------------------------------------------------------
--
-- Done as a checked text substitution on the live definition rather than by restating four
-- bodies here. `create_operational_workspace` alone is 6.6 KB of preset seeding, and retyping
-- it to change one line is how a transcription error gets into an authorization path.
--
-- The substitution asserts. If a guard is not found exactly where it is expected -- because a
-- later migration rewrote it, or it was already changed -- this raises and the migration fails
-- rather than quietly leaving the old role-only check in place.

do $$
declare
  target record;
  definition text;
  patched text;
begin
  for target in
    select * from (values
      ('create_operational_workspace',
       'app_private.is_company_admin(target_company_id)',
       'app_private.can_manage_company_workspace_settings(target_company_id)'),
      ('reorder_operational_workspaces',
       'app_private.is_company_admin(target_company_id)',
       'app_private.can_manage_company_workspace_settings(target_company_id)'),
      ('update_operational_workspace',
       'app_private.is_workspace_admin(target_workspace_id)',
       'app_private.can_manage_workspace_settings(target_workspace_id)'),
      ('set_default_operational_workspace',
       'app_private.is_workspace_admin(target_workspace_id)',
       'app_private.can_manage_workspace_settings(target_workspace_id)')
    ) as t(fn, old_guard, new_guard)
  loop
    select pg_get_functiondef(p.oid) into definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = target.fn;

    if definition is null then
      raise exception 'workspace settings permission: public.% not found', target.fn;
    end if;
    if position(target.old_guard in definition) = 0 then
      raise exception 'workspace settings permission: guard % not found in public.% -- review before rerunning',
        target.old_guard, target.fn;
    end if;

    patched := replace(definition, target.old_guard, target.new_guard);
    if patched = definition then
      raise exception 'workspace settings permission: substitution changed nothing in public.%', target.fn;
    end if;

    execute patched;
  end loop;
end
$$;
