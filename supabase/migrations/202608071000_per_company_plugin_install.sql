-- Per-company plugin installation, and a platform master who can actually act on any company.
--
-- Two problems, both in the authorization of the workspace-level switch.
--
-- 1. set_company_plugin already lets a platform admin grant an entitlement to any company,
--    but a plugin only becomes usable once workspace_plugins carries an 'installed' row, and
--    set_workspace_plugin gates on has_workspace_permission(), which requires a
--    company_memberships row for the caller. A master who is not a member of the target
--    company is refused, so the entitlement they just granted could never be switched on.
--    Granting entitlement without being able to activate it is not a useful power, so the
--    company-level switch now cascades to that company's active workspaces, and the
--    workspace-level switch accepts a platform admin the same way the company one does.
--
-- 2. A company could not take a plugin it needed. The card read "Company entitlement
--    required" and only the platform could clear it. A company admin may now install any
--    plugin the platform has not explicitly withheld -- withheld meaning an existing
--    company_plugins row with status 'disabled', which still refuses. Absence of a row now
--    means "nobody has decided", not "no".

create or replace function public.set_company_plugin(target_company_id text, target_plugin_id text, next_status text)
returns text
language plpgsql
security definer
set search_path to 'public', 'app_private', 'pg_temp'
as $function$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_plugin_id text := lower(trim(coalesce(target_plugin_id, '')));
  clean_status text := lower(trim(coalesce(next_status, '')));
  conflict_plugin_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Plugin admin access required';
  end if;

  if clean_plugin_id not in (
    'crm', 'crm_2', 'underwriter', 'files', 'client_portal', 'workspace_builder',
    'price_book', 'forms', 'finance', 'messages', 'calendar', 'time_clock',
    'approvals', 'reporting'
  ) then
    raise exception 'Unsupported plugin';
  end if;

  if clean_status not in ('installed', 'disabled') then
    raise exception 'Unsupported plugin status';
  end if;

  if clean_status = 'installed' and clean_plugin_id in ('crm', 'crm_2') then
    foreach conflict_plugin_id in array array['crm', 'crm_2']::text[] loop
      if conflict_plugin_id <> clean_plugin_id then
        insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
        values (clean_company_id, conflict_plugin_id, 'disabled', null, null, now(), now())
        on conflict (company_id, plugin_id) do update
          set status = 'disabled',
              disabled_at = now(),
              updated_at = now();

        update public.workspace_plugins wp
        set status = 'disabled', disabled_at = now(), updated_at = now()
        where wp.plugin_id = conflict_plugin_id
          and wp.status = 'installed'
          and wp.workspace_id in (
            select w.id from public.workspaces w
            where w.company_id = clean_company_id and w.status = 'active'
          );
      end if;
    end loop;
  end if;

  insert into public.company_plugins (
    company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at
  )
  values (
    clean_company_id,
    clean_plugin_id,
    clean_status,
    case when clean_status = 'installed' then auth.uid() else null end,
    case when clean_status = 'installed' then now() else null end,
    case when clean_status = 'disabled' then now() else null end,
    now()
  )
  on conflict (company_id, plugin_id) do update
    set status = excluded.status,
        installed_by = case when excluded.status = 'installed' then auth.uid() else public.company_plugins.installed_by end,
        installed_at = case when excluded.status = 'installed' then coalesce(public.company_plugins.installed_at, now()) else public.company_plugins.installed_at end,
        disabled_at = case when excluded.status = 'disabled' then now() else null end,
        updated_at = now();

  -- The company switch is what the platform panel presents, so it has to be the thing that
  -- takes effect. Without this the master toggled a row nothing read and the screen never
  -- changed -- which is exactly how the bug was reported.
  insert into public.workspace_plugins (workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at)
  select w.id,
         clean_plugin_id,
         clean_status,
         coalesce((select cp.config from public.company_plugins cp
                   where cp.company_id = clean_company_id and cp.plugin_id = clean_plugin_id), '{}'::jsonb),
         case when clean_status = 'installed' then auth.uid() else null end,
         case when clean_status = 'installed' then now() else null end,
         case when clean_status = 'disabled' then now() else null end
  from public.workspaces w
  where w.company_id = clean_company_id and w.status = 'active'
  on conflict (workspace_id, plugin_id) do update
    set status = excluded.status,
        installed_by = case when excluded.status = 'installed' then auth.uid() else public.workspace_plugins.installed_by end,
        installed_at = case when excluded.status = 'installed' then coalesce(public.workspace_plugins.installed_at, now()) else public.workspace_plugins.installed_at end,
        disabled_at = case when excluded.status = 'disabled' then now() else null end,
        updated_at = now();

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    case when clean_status = 'installed' then 'plugin.installed' else 'plugin.disabled' end,
    'company_plugin',
    clean_plugin_id,
    jsonb_build_object('plugin_id', clean_plugin_id, 'status', clean_status, 'cascaded_to_workspaces', true)
  );

  return clean_status;
end;
$function$;

create or replace function public.set_workspace_plugin(target_workspace_id uuid, target_plugin_id text, next_status text)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  clean_plugin text := lower(btrim(coalesce(target_plugin_id, '')));
  clean_status text := lower(btrim(coalesce(next_status, '')));
  target_company_id text;
  entitlement_status text;
  entitlement_config jsonb;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if clean_plugin = '' then raise exception 'Plugin is required'; end if;
  if clean_status not in ('installed', 'disabled') then raise exception 'Unsupported plugin status'; end if;

  select w.company_id into target_company_id from public.workspaces w where w.id = target_workspace_id;
  if target_company_id is null then raise exception 'Workspace not found'; end if;

  -- A platform admin is not a member of most companies, so has_workspace_permission() can
  -- never be true for them. They are exactly the person who is supposed to be able to do
  -- this, so they are accepted directly.
  if not (
    app_private.has_workspace_permission(target_workspace_id, 'plugins.manage')
    or app_private.is_quest_admin()
  ) then
    raise exception 'Workspace plugin manager access required';
  end if;

  select cp.status, cp.config into entitlement_status, entitlement_config
  from public.company_plugins cp
  where cp.company_id = target_company_id and cp.plugin_id = clean_plugin;

  if clean_status = 'installed' then
    if entitlement_status = 'disabled' then
      -- An explicit platform decision. Self-service does not override it.
      raise exception 'This plugin has been withheld for this company';
    end if;

    if entitlement_status is null then
      -- Nobody has decided. A company admin may take the plugin their company needs
      -- instead of waiting on the platform to grant it first.
      if not (
        app_private.is_company_admin(target_company_id)
        or app_private.is_quest_admin()
      ) then
        raise exception 'Company plugin entitlement required';
      end if;

      insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
      values (target_company_id, clean_plugin, 'installed', (select auth.uid()), now(), null, now())
      on conflict (company_id, plugin_id) do update
        set status = 'installed', disabled_at = null, updated_at = now();
      entitlement_config := '{}'::jsonb;

      insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
      values (
        target_company_id, (select auth.uid()), 'plugin.installed', 'company_plugin', clean_plugin,
        jsonb_build_object('plugin_id', clean_plugin, 'status', 'installed', 'self_service', true)
      );
    end if;
  end if;

  if clean_status = 'installed' and clean_plugin in ('crm', 'crm_2') then
    update public.workspace_plugins wp
    set status = 'disabled', disabled_at = now(), updated_at = now()
    where wp.workspace_id = target_workspace_id
      and wp.plugin_id in ('crm', 'crm_2')
      and wp.plugin_id <> clean_plugin
      and wp.status = 'installed';
  end if;

  insert into public.workspace_plugins (
    workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  ) values (
    target_workspace_id, clean_plugin, clean_status, coalesce(entitlement_config, '{}'::jsonb),
    case when clean_status = 'installed' then (select auth.uid()) else null end,
    case when clean_status = 'installed' then now() else null end,
    case when clean_status = 'disabled' then now() else null end
  )
  on conflict (workspace_id, plugin_id) do update
  set status = excluded.status,
      config = case when excluded.status = 'installed' then excluded.config else public.workspace_plugins.config end,
      installed_by = case when excluded.status = 'installed' then (select auth.uid()) else public.workspace_plugins.installed_by end,
      installed_at = case when excluded.status = 'installed' then coalesce(public.workspace_plugins.installed_at, now()) else public.workspace_plugins.installed_at end,
      disabled_at = case when excluded.status = 'disabled' then now() else null end,
      updated_at = now();

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id, (select auth.uid()), 'workspace.plugin_changed', 'workspace_plugin',
    target_workspace_id::text || ':' || clean_plugin,
    jsonb_build_object('workspace_id', target_workspace_id, 'plugin_id', clean_plugin, 'status', clean_status)
  );
  return clean_status;
end;
$function$;
