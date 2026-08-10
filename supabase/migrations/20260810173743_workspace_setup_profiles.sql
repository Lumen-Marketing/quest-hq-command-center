-- Workspace-specific guided setup. One company may contain unrelated workspace
-- types, so answers and mutations are keyed by workspaces.id rather than company_id.

create table public.workspace_setup_profiles (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  draft_plan jsonb not null default '{}'::jsonb,
  applied_plan jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'applying', 'applied')),
  setup_version integer not null default 1 check (setup_version > 0),
  reset_count integer not null default 0 check (reset_count >= 0),
  applied_at timestamptz,
  reset_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

comment on table public.workspace_setup_profiles is
  'Guided setup state for one operational workspace. Reset preserves applied configuration and business data.';

create index workspace_setup_profiles_status_idx
  on public.workspace_setup_profiles(status, updated_at desc);
create index workspace_setup_profiles_updated_by_idx
  on public.workspace_setup_profiles(updated_by)
  where updated_by is not null;

drop trigger if exists workspace_setup_profiles_set_updated_at on public.workspace_setup_profiles;
create trigger workspace_setup_profiles_set_updated_at
before update on public.workspace_setup_profiles
for each row execute function public.set_updated_at();

alter table public.workspace_setup_profiles enable row level security;

revoke all on table public.workspace_setup_profiles from public, anon, authenticated;
grant select on table public.workspace_setup_profiles to authenticated;
grant all on table public.workspace_setup_profiles to service_role;

drop policy if exists workspace_setup_profiles_select_admin on public.workspace_setup_profiles;
create policy workspace_setup_profiles_select_admin
  on public.workspace_setup_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_setup_profiles.workspace_id
        and app_private.is_company_admin(w.company_id)
    )
  );

create or replace function public.save_workspace_setup_draft(
  target_workspace_id uuid,
  p_answers jsonb,
  p_draft_plan jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;

  select w.company_id
    into target_company_id
  from public.workspaces w
  where w.id = target_workspace_id
    and w.status = 'active';

  if target_company_id is null then raise exception 'Active workspace not found'; end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup answers must be an object';
  end if;
  if jsonb_typeof(coalesce(p_draft_plan, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup draft must be an object';
  end if;
  if octet_length(coalesce(p_answers, '{}'::jsonb)::text) > 32768
     or octet_length(coalesce(p_draft_plan, '{}'::jsonb)::text) > 131072 then
    raise exception 'Workspace setup draft is too large';
  end if;

  insert into public.workspace_setup_profiles (
    workspace_id, answers, draft_plan, status, setup_version, updated_at, updated_by
  ) values (
    target_workspace_id, coalesce(p_answers, '{}'::jsonb), coalesce(p_draft_plan, '{}'::jsonb),
    'draft', 1, now(), actor_id
  )
  on conflict (workspace_id) do update
  set answers = excluded.answers,
      draft_plan = excluded.draft_plan,
      status = 'draft',
      setup_version = 1,
      updated_at = now(),
      updated_by = actor_id;

  return jsonb_build_object('status', 'draft', 'workspace_id', target_workspace_id);
end;
$$;

revoke all on function public.save_workspace_setup_draft(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_workspace_setup_draft(uuid, jsonb, jsonb) to authenticated, service_role;

create or replace function public.apply_workspace_setup(
  target_workspace_id uuid,
  p_answers jsonb,
  p_plan jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
  known_plugins text[] := array[
    'crm', 'crm_2', 'underwriter', 'files', 'client_portal',
    'workspace_builder', 'price_book', 'forms', 'finance', 'messages',
    'calendar', 'time_clock', 'approvals', 'reporting', 'tasks', 'calls'
  ];
  allowed_role_keys text[] := array[
    'cold_caller', 'salesperson', 'estimator',
    'production_coordinator', 'field_crew', 'office_finance'
  ];
  pipeline_colors text[] := array[
    '#9AA0A8', '#378ADD', '#BA7517', '#3C7BD0',
    '#C08A2B', '#7F77DD', '#639922', '#E24B4A'
  ];
  setup_profile public.workspace_setup_profiles%rowtype;
  previous_applied_plan jsonb := '{}'::jsonb;
  workspace_item jsonb;
  role_item jsonb;
  final_plan jsonb;
  result_workspace jsonb;
  result_roles jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
  managed_roles jsonb := '{}'::jsonb;
  requested_plugins text[] := '{}'::text[];
  previous_managed_plugins text[] := '{}'::text[];
  installed_plugins jsonb := '[]'::jsonb;
  workspace_name text;
  pipeline_kind text;
  pipeline_db_kinds text[];
  pipeline_applied boolean := false;
  workspace_records bigint := 0;
  stage_name text;
  unavailable_plugin_id text;
  role_key text;
  role_name text;
  role_count integer;
  target_role_id uuid;
  mapped_role_id_text text;
  named_role_id uuid;
  named_role_system boolean;
  role_is_managed boolean;
  role_permissions text[];
  seen_role_keys text[] := '{}'::text[];
  seen_role_names text[] := '{}'::text[];
begin
  if actor_id is null then raise exception 'Authentication required'; end if;

  select w.company_id
    into target_company_id
  from public.workspaces w
  where w.id = target_workspace_id
    and w.status = 'active'
  for update;

  if target_company_id is null then raise exception 'Active workspace not found'; end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup answers must be an object';
  end if;
  if octet_length(coalesce(p_answers, '{}'::jsonb)::text) > 32768 then
    raise exception 'Setup answers are too large';
  end if;
  if jsonb_typeof(p_plan) <> 'object' then raise exception 'Setup plan must be an object'; end if;
  if octet_length(p_plan::text) > 131072 then raise exception 'Setup plan is too large'; end if;
  if coalesce((p_plan->>'version')::integer, 0) <> 1 then
    raise exception 'Unsupported setup plan version';
  end if;
  if jsonb_typeof(p_plan->'workspaces') <> 'array'
     or jsonb_array_length(p_plan->'workspaces') <> 1 then
    raise exception 'Workspace setup plan must contain exactly one workspace';
  end if;

  workspace_item := p_plan->'workspaces'->0;
  if jsonb_typeof(workspace_item) <> 'object' then
    raise exception 'Workspace setup must be an object';
  end if;
  workspace_name := btrim(coalesce(workspace_item->>'name', ''));
  pipeline_kind := btrim(coalesce(workspace_item->>'pipelineKind', 'blank'));
  if workspace_name = '' or char_length(workspace_name) > 64 then
    raise exception 'Invalid workspace name';
  end if;
  if pipeline_kind not in ('roofing', 'sales', 'projects', 'home_services', 'blank') then
    raise exception 'Invalid setup pipeline profile';
  end if;
  if jsonb_typeof(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) <> 'array' then
    raise exception 'Workspace apps must be an array';
  end if;
  if jsonb_array_length(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) > array_length(known_plugins, 1) then
    raise exception 'Too many workspace apps';
  end if;
  if exists (
    select 1
    from jsonb_array_elements_text(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) plugin(value)
    where plugin.value <> all(known_plugins)
  ) then
    raise exception 'Unknown workspace app';
  end if;
  if (workspace_item->'pluginIds') ? 'crm' and (workspace_item->'pluginIds') ? 'crm_2' then
    raise exception 'A workspace cannot activate both CRM variants';
  end if;
  select coalesce(array_agg(distinct plugin.value), '{}'::text[])
    into requested_plugins
  from jsonb_array_elements_text(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) plugin(value);

  if jsonb_typeof(coalesce(workspace_item->'stages', '[]'::jsonb)) <> 'array' then
    raise exception 'Workspace stages must be an array';
  end if;
  if jsonb_array_length(coalesce(workspace_item->'stages', '[]'::jsonb)) > 50 then
    raise exception 'A workspace cannot contain more than 50 stages';
  end if;
  if (
    select count(*) <> count(distinct lower(btrim(stage.value)))
    from jsonb_array_elements_text(coalesce(workspace_item->'stages', '[]'::jsonb)) stage(value)
  ) then
    raise exception 'Workspace stage names must be unique';
  end if;
  for stage_name in
    select btrim(stage.value)
    from jsonb_array_elements_text(coalesce(workspace_item->'stages', '[]'::jsonb)) stage(value)
  loop
    if stage_name = '' or char_length(stage_name) > 60 then
      raise exception 'Invalid pipeline stage name';
    end if;
  end loop;

  if jsonb_typeof(coalesce(p_plan->'roles', '[]'::jsonb)) <> 'array' then
    raise exception 'Setup plan roles must be an array';
  end if;
  role_count := jsonb_array_length(coalesce(p_plan->'roles', '[]'::jsonb));
  if role_count > 6 then raise exception 'Setup plan cannot contain more than 6 generated roles'; end if;
  for role_item in
    select role.value from jsonb_array_elements(coalesce(p_plan->'roles', '[]'::jsonb)) role(value)
  loop
    role_key := btrim(coalesce(role_item->>'key', ''));
    role_name := btrim(coalesce(role_item->>'name', ''));
    if role_key <> all(allowed_role_keys) then raise exception 'Unknown generated role template'; end if;
    if role_key = any(seen_role_keys) then raise exception 'Generated role templates must be unique'; end if;
    if lower(role_name) = any(seen_role_names) then raise exception 'Generated role names must be unique'; end if;
    if role_name = '' or char_length(role_name) > 64 then raise exception 'Invalid generated role name'; end if;
    seen_role_keys := array_append(seen_role_keys, role_key);
    seen_role_names := array_append(seen_role_names, lower(role_name));
  end loop;

  insert into public.workspace_setup_profiles (
    workspace_id, answers, draft_plan, status, setup_version, updated_at, updated_by
  ) values (
    target_workspace_id, p_answers, p_plan, 'applying', 1, now(), actor_id
  )
  on conflict (workspace_id) do nothing;

  select profile.*
    into setup_profile
  from public.workspace_setup_profiles profile
  where profile.workspace_id = target_workspace_id
  for update;

  previous_applied_plan := coalesce(setup_profile.applied_plan, '{}'::jsonb);
  managed_roles := coalesce(previous_applied_plan->'managed_roles', '{}'::jsonb);
  select coalesce(array_agg(plugin.value), '{}'::text[])
    into previous_managed_plugins
  from jsonb_array_elements_text(coalesce(previous_applied_plan->'managed_plugins', '[]'::jsonb)) plugin(value);

  update public.workspace_setup_profiles
     set answers = p_answers,
         draft_plan = p_plan,
         status = 'applying',
         setup_version = 1,
         updated_at = now(),
         updated_by = actor_id
   where workspace_id = target_workspace_id;

  update public.workspaces
     set name = workspace_name,
         updated_at = now()
   where id = target_workspace_id
     and company_id = target_company_id;

  -- Install missing company entitlements. An explicitly disabled entitlement is
  -- never re-enabled by workspace setup.
  insert into public.company_plugins (
    company_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  )
  select target_company_id, requested.plugin_id, 'installed', '{}'::jsonb, actor_id, now(), null
  from unnest(requested_plugins) requested(plugin_id)
  where not exists (
    select 1 from public.company_plugins existing
    where existing.company_id = target_company_id
      and existing.plugin_id = requested.plugin_id
  )
  on conflict (company_id, plugin_id) do nothing;

  -- Only apps previously managed by this workspace's setup may be disabled.
  -- Apps installed manually or by another workflow remain untouched.
  update public.workspace_plugins workspace_plugin
     set status = 'disabled',
         disabled_at = now(),
         updated_at = now()
   where workspace_plugin.workspace_id = target_workspace_id
     and workspace_plugin.plugin_id = any(previous_managed_plugins)
     and workspace_plugin.plugin_id <> all(requested_plugins)
     and workspace_plugin.status = 'installed';

  insert into public.workspace_plugins (
    workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  )
  select target_workspace_id, requested.plugin_id, 'installed', entitlement.config, actor_id, now(), null
  from unnest(requested_plugins) requested(plugin_id)
  join public.company_plugins entitlement
    on entitlement.company_id = target_company_id
   and entitlement.plugin_id = requested.plugin_id
   and entitlement.status = 'installed'
  on conflict (workspace_id, plugin_id) do update
  set status = 'installed',
      config = excluded.config,
      installed_by = excluded.installed_by,
      installed_at = coalesce(public.workspace_plugins.installed_at, now()),
      disabled_at = null,
      updated_at = now();

  for unavailable_plugin_id in
    select requested.plugin_id
    from unnest(requested_plugins) requested(plugin_id)
    where not exists (
      select 1 from public.company_plugins entitlement
      where entitlement.company_id = target_company_id
        and entitlement.plugin_id = requested.plugin_id
        and entitlement.status = 'installed'
    )
  loop
    warnings := warnings || jsonb_build_array(jsonb_build_object(
      'code', 'plugin_unavailable',
      'plugin_id', unavailable_plugin_id,
      'message', unavailable_plugin_id || ' is disabled for this company and was not activated.'
    ));
  end loop;

  select coalesce(jsonb_agg(plugin.plugin_id order by plugin.plugin_id), '[]'::jsonb)
    into installed_plugins
  from public.workspace_plugins plugin
  where plugin.workspace_id = target_workspace_id
    and plugin.status = 'installed';

  select
    (select count(*) from public.contacts contact where contact.workspace_id = target_workspace_id)
    + (select count(*) from public.deals deal where deal.workspace_id = target_workspace_id)
    + (select count(*) from public.jobs job where job.workspace_id = target_workspace_id)
    into workspace_records;

  if pipeline_kind <> 'blank'
     and jsonb_array_length(coalesce(workspace_item->'stages', '[]'::jsonb)) > 0 then
    if workspace_records > 0 then
      warnings := warnings || jsonb_build_array(jsonb_build_object(
        'code', 'pipeline_preserved',
        'message', 'Pipeline stages were preserved because this workspace already contains contacts, quotes, or jobs.'
      ));
    else
      pipeline_db_kinds := case
        when pipeline_kind in ('roofing', 'sales') then array['contacts', 'deals']::text[]
        else array['jobs']::text[]
      end;

      delete from public.pipeline_stages
       where workspace_id = target_workspace_id
         and kind = any(pipeline_db_kinds);

      insert into public.pipeline_stages (workspace_id, company_id, kind, name, color, position)
      select
        target_workspace_id,
        target_company_id,
        pipeline_db_kind.kind,
        btrim(stage.value),
        pipeline_colors[((stage.ordinality::integer - 1) % array_length(pipeline_colors, 1)) + 1],
        stage.ordinality::integer - 1
      from unnest(pipeline_db_kinds) pipeline_db_kind(kind)
      cross join jsonb_array_elements_text(workspace_item->'stages')
        with ordinality as stage(value, ordinality);
      pipeline_applied := true;
    end if;
  end if;

  for role_item in
    select role.value from jsonb_array_elements(coalesce(p_plan->'roles', '[]'::jsonb)) role(value)
  loop
    role_key := role_item->>'key';
    role_name := btrim(role_item->>'name');
    target_role_id := null;
    named_role_id := null;
    named_role_system := null;
    role_is_managed := false;
    mapped_role_id_text := managed_roles->>role_key;

    if mapped_role_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      select role.id
        into target_role_id
      from public.roles role
      where role.id = mapped_role_id_text::uuid
        and role.company_id = target_company_id
        and not role.is_system;
      role_is_managed := target_role_id is not null;
    end if;

    select role.id, role.is_system
      into named_role_id, named_role_system
    from public.roles role
    where role.company_id = target_company_id
      and lower(role.name) = lower(role_name)
    limit 1;

    if named_role_id is not null and named_role_id is distinct from target_role_id then
      if named_role_system then
        raise exception 'The role name "%" is already used by a built-in role. Choose another name for this role.', role_name
          using errcode = '23505';
      end if;
      target_role_id := named_role_id;
      role_is_managed := false;
      warnings := warnings || jsonb_build_array(jsonb_build_object(
        'code', 'role_reused',
        'role_key', role_key,
        'message', role_name || ' already existed, so its permissions were preserved.'
      ));
    end if;

    if target_role_id is null then
      insert into public.roles (company_id, name, color, priority, is_system, created_by)
      values (target_company_id, role_name, '#f0b23b', 10, false, actor_id)
      returning id into target_role_id;
      role_is_managed := true;
    elsif role_is_managed then
      update public.roles
         set name = role_name,
             updated_at = now()
       where id = target_role_id
         and company_id = target_company_id
         and not is_system;
    end if;

    if role_is_managed then
      role_permissions := app_private.company_setup_role_permissions(role_key);
      delete from public.role_permissions where role_id = target_role_id;
      insert into public.role_permissions (role_id, permission_key, effect)
      select target_role_id, permission.permission_key, 'allow'
      from unnest(role_permissions) permission(permission_key)
      on conflict (role_id, permission_key) do update set effect = 'allow';

      managed_roles := jsonb_set(managed_roles, array[role_key], to_jsonb(target_role_id::text), true);
    end if;

    result_roles := result_roles || jsonb_build_array(
      role_item || jsonb_build_object('id', target_role_id, 'managed', role_is_managed)
    );
  end loop;

  result_workspace := workspace_item || jsonb_build_object(
    'id', target_workspace_id,
    'isDefault', (select w.is_default from public.workspaces w where w.id = target_workspace_id),
    'pluginIds', installed_plugins,
    'managedPlugins', to_jsonb(requested_plugins),
    'pipelineApplied', pipeline_applied
  );
  final_plan := p_plan || jsonb_build_object(
    'workspaces', jsonb_build_array(result_workspace),
    'roles', result_roles,
    'warnings', warnings,
    'managed_plugins', to_jsonb(requested_plugins),
    'managed_roles', managed_roles
  );

  update public.workspace_setup_profiles
     set answers = p_answers,
         draft_plan = p_plan,
         applied_plan = final_plan,
         status = 'applied',
         setup_version = 1,
         applied_at = now(),
         updated_at = now(),
         updated_by = actor_id
   where workspace_id = target_workspace_id;

  insert into public.audit_events (
    company_id, actor_profile_id, event_type, target_type, target_id, details
  ) values (
    target_company_id,
    actor_id,
    'workspace.setup_applied',
    'workspace',
    target_workspace_id::text,
    jsonb_build_object(
      'setup_version', 1,
      'plugin_count', cardinality(requested_plugins),
      'generated_role_count', role_count,
      'warning_count', jsonb_array_length(warnings)
    )
  );

  return jsonb_build_object('status', 'applied', 'plan', final_plan, 'warnings', warnings);
end;
$$;

revoke all on function public.apply_workspace_setup(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.apply_workspace_setup(uuid, jsonb, jsonb) to authenticated, service_role;

create or replace function public.reset_workspace_setup(target_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
  result_row public.workspace_setup_profiles%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;

  select w.company_id
    into target_company_id
  from public.workspaces w
  where w.id = target_workspace_id
    and w.status = 'active';

  if target_company_id is null then raise exception 'Active workspace not found'; end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;

  insert into public.workspace_setup_profiles (workspace_id, updated_by)
  values (target_workspace_id, actor_id)
  on conflict (workspace_id) do nothing;

  update public.workspace_setup_profiles profile
     set answers = '{}'::jsonb,
         draft_plan = '{}'::jsonb,
         status = 'draft',
         reset_count = profile.reset_count + 1,
         reset_at = now(),
         updated_at = now(),
         updated_by = actor_id
   where profile.workspace_id = target_workspace_id
  returning profile.* into result_row;

  insert into public.audit_events (
    company_id, actor_profile_id, event_type, target_type, target_id, details
  ) values (
    target_company_id,
    actor_id,
    'workspace.setup_reset',
    'workspace',
    target_workspace_id::text,
    jsonb_build_object('reset_count', result_row.reset_count, 'configuration_preserved', true)
  );

  return jsonb_build_object(
    'status', result_row.status,
    'reset_count', result_row.reset_count,
    'reset_at', result_row.reset_at
  );
end;
$$;

revoke all on function public.reset_workspace_setup(uuid) from public, anon;
grant execute on function public.reset_workspace_setup(uuid) to authenticated, service_role;

-- Later operational workspaces enter setup empty. Existing company creation
-- continues to use generic, and existing presets retain their current bundles.
create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path = ''
as $$
  select case lower(trim(coalesce(preset_code, 'generic')))
    when 'blank' then array[]::text[]
    when 'roofing' then array['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']::text[]
    when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']::text[]
    else array['crm', 'files', 'messages', 'workspace_builder', 'tasks']::text[]
  end;
$$;

revoke all on function app_private.plugin_ids_for_preset(text) from public, anon, authenticated;
grant execute on function app_private.plugin_ids_for_preset(text) to authenticated, service_role;
