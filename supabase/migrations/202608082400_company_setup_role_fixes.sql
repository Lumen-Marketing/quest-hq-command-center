-- Two fixes to the guided setup's generated roles.
--
-- 1. THE OFFICE AND FINANCE ROLE COULD NOT OPEN REPORTING.
--
--    Its template granted `reporting.view`, which is not a permission this application
--    defines anywhere. The Reporting plugin's two modules gate on `team.view` (Team chart)
--    and `jobs.view` (Analytics), so the role advertised as covering "Finance, reporting,
--    approvals, files, and calendars" reached neither. Verified before changing it:
--    `reporting.view` appeared in zero role_permissions rows in production, so nothing had
--    ever been granted by it and there is nothing to backfill.
--
-- 2. THE RESERVED-NAME REFUSAL DID NOT SAY WHICH NAME.
--
--    Apply refuses a generated role whose name collides with a built-in role, and aborts the
--    whole operation to do it. That message named neither the role nor the reason. It matters
--    more now than it did: until this week the only built-in role was Owner, and nobody would
--    name a generated role that. Every company now also has a built-in Member, which is a
--    name somebody might reasonably type while editing the plan.
--
--    The panel checks for the collision before you can apply; this is the backstop, and a
--    backstop that fires should still explain itself.

-- The generated roles' permissions, lifted out of apply_company_setup.
--
-- They lived inline in a 680-line PL/pgSQL body, so correcting a single key meant replacing
-- the whole function. `reporting.view` -- a key this application does not define anywhere --
-- sat there unnoticed for exactly that reason. Out here, the next correction is small.
create or replace function app_private.company_setup_role_permissions(role_key text)
returns text[]
language sql
immutable
as $$
  select case role_key
    when 'cold_caller' then array[
      'crm.view', 'crm.manage', 'tasks.view', 'tasks.manage',
      'messages.view', 'messages.send', 'files.view'
    ]
    when 'salesperson' then array[
      'crm.view', 'crm.manage', 'tasks.view', 'tasks.manage',
      'calendar.view', 'calendar.manage', 'messages.view', 'messages.send', 'files.view'
    ]
    when 'estimator' then array[
      'crm.view', 'underwriter.view', 'underwriter.manage', 'price_book.view',
      'files.view', 'files.manage', 'forms.view', 'forms.manage', 'approvals.view'
    ]
    when 'production_coordinator' then array[
      'jobs.view', 'jobs.manage', 'tasks.view', 'tasks.manage',
      'calendar.view', 'calendar.manage', 'calendar.view_team',
      'files.view', 'files.manage', 'forms.view', 'forms.manage',
      'approvals.view', 'approvals.manage'
    ]
    when 'field_crew' then array[
      'jobs.view', 'tasks.view', 'tasks.manage', 'files.view', 'files.manage',
      'forms.view', 'forms.manage', 'time.track', 'messages.view', 'messages.send'
    ]
    -- team.view and jobs.view, NOT reporting.view: the Reporting plugin's two modules are
    -- Team chart (team.view) and Analytics (jobs.view). The old key matched neither, so the
    -- role advertised as covering reporting could open none of it.
    when 'office_finance' then array[
      'finance.view', 'finance.manage', 'team.view', 'jobs.view',
      'approvals.view', 'approvals.manage', 'files.view', 'files.manage', 'calendar.view'
    ]
    else '{}'::text[]
  end;
$$;

revoke all on function app_private.company_setup_role_permissions(text) from public, anon, authenticated;

create or replace function public.apply_company_setup(
  target_company_id text,
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
  setup_profile public.company_setup_profiles%rowtype;
  previous_applied_plan jsonb := '{}'::jsonb;
  managed_workspaces jsonb := '{}'::jsonb;
  managed_roles jsonb := '{}'::jsonb;
  result_workspaces jsonb := '[]'::jsonb;
  result_roles jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
  final_plan jsonb;
  workspace_item jsonb;
  role_item jsonb;
  workspace_index integer;
  workspace_count integer;
  role_count integer;
  workspace_key text;
  workspace_name text;
  pipeline_kind text;
  unavailable_plugin_id text;
  target_workspace_id uuid;
  default_workspace_id uuid;
  mapped_id_text text;
  base_slug text;
  candidate_slug text;
  owner_role_id uuid;
  installed_plugins jsonb;
  workspace_records bigint;
  pipeline_applied boolean;
  pipeline_db_kinds text[];
  stage_name text;
  seen_workspace_keys text[] := '{}'::text[];
  seen_workspace_names text[] := '{}'::text[];
  seen_stage_names text[];
  seen_role_keys text[] := '{}'::text[];
  role_key text;
  role_name text;
  target_role_id uuid;
  existing_named_role_id uuid;
  existing_named_role_system boolean;
  role_permissions text[];
  managed_key text;
  managed_workspace_id_text text;
  managed_workspace_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;
  if not exists (select 1 from public.companies c where c.id = target_company_id) then
    raise exception 'Company not found';
  end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup answers must be an object';
  end if;
  if octet_length(coalesce(p_answers, '{}'::jsonb)::text) > 32768 then
    raise exception 'Setup answers are too large';
  end if;
  if jsonb_typeof(p_plan) <> 'object' then
    raise exception 'Setup plan must be an object';
  end if;
  if octet_length(p_plan::text) > 131072 then
    raise exception 'Setup plan is too large';
  end if;
  if coalesce((p_plan->>'version')::integer, 0) <> 1 then
    raise exception 'Unsupported setup plan version';
  end if;
  if jsonb_typeof(p_plan->'workspaces') <> 'array' then
    raise exception 'Setup plan workspaces must be an array';
  end if;

  workspace_count := jsonb_array_length(p_plan->'workspaces');
  if workspace_count not between 1 and 6 then
    raise exception 'Setup plan must contain between 1 and 6 workspaces';
  end if;

  if jsonb_typeof(coalesce(p_plan->'roles', '[]'::jsonb)) <> 'array' then
    raise exception 'Setup plan roles must be an array';
  end if;
  role_count := jsonb_array_length(coalesce(p_plan->'roles', '[]'::jsonb));
  if role_count > 6 then raise exception 'Setup plan cannot contain more than 6 generated roles'; end if;

  -- Validate the complete client-editable plan before changing any configuration.
  for workspace_item, workspace_index in
    select item.value, item.ordinality::integer
    from jsonb_array_elements(p_plan->'workspaces') with ordinality as item(value, ordinality)
  loop
    if jsonb_typeof(workspace_item) <> 'object' then
      raise exception 'Every setup workspace must be an object';
    end if;

    workspace_key := btrim(coalesce(workspace_item->>'key', ''));
    workspace_name := btrim(coalesce(workspace_item->>'name', ''));
    pipeline_kind := btrim(coalesce(workspace_item->>'pipelineKind', 'blank'));

    if workspace_key !~ '^[a-z0-9_]{1,40}$' then raise exception 'Invalid setup workspace key'; end if;
    if workspace_key = any(seen_workspace_keys) then raise exception 'Setup workspace keys must be unique'; end if;
    seen_workspace_keys := array_append(seen_workspace_keys, workspace_key);

    if workspace_name = '' or char_length(workspace_name) > 64 then raise exception 'Invalid setup workspace name'; end if;
    if lower(workspace_name) = any(seen_workspace_names) then raise exception 'Setup workspace names must be unique'; end if;
    seen_workspace_names := array_append(seen_workspace_names, lower(workspace_name));

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

    if jsonb_typeof(coalesce(workspace_item->'stages', '[]'::jsonb)) <> 'array' then
      raise exception 'Workspace stages must be an array';
    end if;
    if jsonb_array_length(coalesce(workspace_item->'stages', '[]'::jsonb)) > 50 then
      raise exception 'A workspace cannot contain more than 50 stages';
    end if;
    seen_stage_names := '{}'::text[];
    for stage_name in
      select stage.value
      from jsonb_array_elements_text(coalesce(workspace_item->'stages', '[]'::jsonb)) stage(value)
    loop
      stage_name := btrim(stage_name);
      if stage_name = '' or char_length(stage_name) > 60 then raise exception 'Invalid pipeline stage name'; end if;
      if lower(stage_name) = any(seen_stage_names) then raise exception 'Pipeline stage names must be unique'; end if;
      seen_stage_names := array_append(seen_stage_names, lower(stage_name));
    end loop;
  end loop;

  for role_item in
    select item.value
    from jsonb_array_elements(coalesce(p_plan->'roles', '[]'::jsonb)) item(value)
  loop
    if jsonb_typeof(role_item) <> 'object' then raise exception 'Every generated role must be an object'; end if;
    role_key := btrim(coalesce(role_item->>'key', ''));
    role_name := btrim(coalesce(role_item->>'name', ''));
    if role_key <> all(allowed_role_keys) then raise exception 'Unknown generated role template'; end if;
    if role_key = any(seen_role_keys) then raise exception 'Generated role templates must be unique'; end if;
    seen_role_keys := array_append(seen_role_keys, role_key);
    if role_name = '' or char_length(role_name) > 64 then raise exception 'Invalid generated role name'; end if;
  end loop;

  insert into public.company_setup_profiles (
    company_id,
    answers,
    draft_plan,
    status,
    setup_version,
    updated_at,
    updated_by
  ) values (
    target_company_id,
    p_answers,
    p_plan,
    'applying',
    1,
    now(),
    actor_id
  )
  on conflict (company_id) do nothing;

  select profile.*
    into setup_profile
  from public.company_setup_profiles profile
  where profile.company_id = target_company_id
  for update;

  previous_applied_plan := coalesce(setup_profile.applied_plan, '{}'::jsonb);
  managed_workspaces := coalesce(previous_applied_plan->'managed_workspaces', '{}'::jsonb);
  managed_roles := coalesce(previous_applied_plan->'managed_roles', '{}'::jsonb);

  update public.company_setup_profiles
     set answers = p_answers,
         draft_plan = p_plan,
         status = 'applying',
         setup_version = 1,
         updated_at = now(),
         updated_by = actor_id
   where company_id = target_company_id;

  default_workspace_id := app_private.ensure_default_workspace_for_company(target_company_id, actor_id);

  select r.id
    into owner_role_id
  from public.roles r
  where r.company_id = target_company_id
  order by case when lower(r.name) = 'owner' then 0 else 1 end, r.priority desc
  limit 1;

  for workspace_item, workspace_index in
    select item.value, item.ordinality::integer
    from jsonb_array_elements(p_plan->'workspaces') with ordinality as item(value, ordinality)
  loop
    workspace_key := workspace_item->>'key';
    workspace_name := btrim(workspace_item->>'name');
    pipeline_kind := workspace_item->>'pipelineKind';
    target_workspace_id := null;

    if workspace_index = 1 then
      target_workspace_id := default_workspace_id;
    else
      mapped_id_text := managed_workspaces->>workspace_key;
      if mapped_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
        select w.id
          into target_workspace_id
        from public.workspaces w
        where w.id = mapped_id_text::uuid
          and w.company_id = target_company_id
          and w.id <> default_workspace_id;
      end if;

      if target_workspace_id is null then
        base_slug := left(trim(both '-' from regexp_replace(lower(workspace_name), '[^a-z0-9]+', '-', 'g')), 48);
        if base_slug = '' then base_slug := 'workspace'; end if;
        candidate_slug := base_slug;
        while exists (
          select 1
          from public.workspaces w
          where w.company_id = target_company_id
            and w.slug = candidate_slug
        ) loop
          candidate_slug := left(base_slug, 40) || '-' || left(replace(gen_random_uuid()::text, '-', ''), 6);
        end loop;

        insert into public.workspaces (
          company_id,
          slug,
          name,
          description,
          icon_key,
          color,
          status,
          is_default,
          created_by
        )
        select
          c.id,
          candidate_slug,
          workspace_name,
          'Created by Questbase setup',
          'briefcase',
          coalesce(nullif(c.color, ''), '#f0b23b'),
          'active',
          false,
          actor_id
        from public.companies c
        where c.id = target_company_id
        returning id into target_workspace_id;

        perform app_private.seed_company_setup_pipeline_stages(target_workspace_id, target_company_id);
      end if;
    end if;

    update public.workspaces
       set name = workspace_name,
           status = 'active',
           is_default = (workspace_index = 1),
           updated_at = now()
     where id = target_workspace_id
       and company_id = target_company_id;

    insert into public.workspace_memberships (
      workspace_id,
      profile_id,
      role_id,
      status,
      assigned_by
    ) values (
      target_workspace_id,
      actor_id,
      owner_role_id,
      'active',
      actor_id
    )
    on conflict (workspace_id, profile_id) do update
    set role_id = coalesce(excluded.role_id, public.workspace_memberships.role_id),
        status = 'active',
        assigned_by = excluded.assigned_by,
        updated_at = now();

    managed_workspaces := jsonb_set(
      managed_workspaces,
      array[workspace_key],
      to_jsonb(target_workspace_id::text),
      true
    );

    -- A missing entitlement may be installed by an owner. An explicitly disabled
    -- company entitlement remains a hard wall and is reported back as a warning.
    insert into public.company_plugins (
      company_id,
      plugin_id,
      status,
      config,
      installed_by,
      installed_at,
      disabled_at
    )
    select
      target_company_id,
      requested.value,
      'installed',
      '{}'::jsonb,
      actor_id,
      now(),
      null
    from jsonb_array_elements_text(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) requested(value)
    where not exists (
      select 1
      from public.company_plugins existing
      where existing.company_id = target_company_id
        and existing.plugin_id = requested.value
    )
    on conflict (company_id, plugin_id) do nothing;

    update public.workspace_plugins workspace_plugin
       set status = 'disabled',
           disabled_at = now(),
           updated_at = now()
     where workspace_plugin.workspace_id = target_workspace_id
       and workspace_plugin.status = 'installed'
       and (
         not (coalesce(workspace_item->'pluginIds', '[]'::jsonb) ? workspace_plugin.plugin_id)
         or not exists (
           select 1
           from public.company_plugins company_plugin
           where company_plugin.company_id = target_company_id
             and company_plugin.plugin_id = workspace_plugin.plugin_id
             and company_plugin.status = 'installed'
         )
       );

    insert into public.workspace_plugins (
      workspace_id,
      plugin_id,
      status,
      config,
      installed_by,
      installed_at,
      disabled_at
    )
    select
      target_workspace_id,
      requested.value,
      'installed',
      company_plugin.config,
      actor_id,
      now(),
      null
    from jsonb_array_elements_text(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) requested(value)
    join public.company_plugins company_plugin
      on company_plugin.company_id = target_company_id
     and company_plugin.plugin_id = requested.value
     and company_plugin.status = 'installed'
    on conflict (workspace_id, plugin_id) do update
    set status = 'installed',
        config = excluded.config,
        installed_by = excluded.installed_by,
        installed_at = coalesce(public.workspace_plugins.installed_at, now()),
        disabled_at = null,
        updated_at = now();

    for unavailable_plugin_id in
      select requested.value
      from jsonb_array_elements_text(coalesce(workspace_item->'pluginIds', '[]'::jsonb)) requested(value)
      where not exists (
        select 1
        from public.company_plugins company_plugin
        where company_plugin.company_id = target_company_id
          and company_plugin.plugin_id = requested.value
          and company_plugin.status = 'installed'
      )
    loop
      warnings := warnings || jsonb_build_array(jsonb_build_object(
        'code', 'plugin_unavailable',
        'workspace_key', workspace_key,
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

    pipeline_applied := false;
    if pipeline_kind <> 'blank'
       and jsonb_array_length(coalesce(workspace_item->'stages', '[]'::jsonb)) > 0 then
      if workspace_records > 0 then
        warnings := warnings || jsonb_build_array(jsonb_build_object(
          'code', 'pipeline_preserved',
          'workspace_key', workspace_key,
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

        insert into public.pipeline_stages (
          workspace_id,
          company_id,
          kind,
          name,
          color,
          position
        )
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

    result_workspaces := result_workspaces || jsonb_build_array(
      workspace_item || jsonb_build_object(
        'id', target_workspace_id,
        'isDefault', workspace_index = 1,
        'pluginIds', installed_plugins,
        'pipelineApplied', pipeline_applied
      )
    );
  end loop;

  -- A workspace removed from a later setup remains active when it contains any
  -- business row. Only a truly empty setup-managed workspace may be archived.
  for managed_key, managed_workspace_id_text in
    select entry.key, entry.value
    from jsonb_each_text(managed_workspaces) entry(key, value)
  loop
    if not exists (
      select 1
      from jsonb_array_elements(p_plan->'workspaces') planned(value)
      where planned.value->>'key' = managed_key
    ) and managed_workspace_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      managed_workspace_id := managed_workspace_id_text::uuid;
      if managed_workspace_id <> default_workspace_id
         and exists (
           select 1
           from public.workspaces workspace
           where workspace.id = managed_workspace_id
             and workspace.company_id = target_company_id
         ) then
        if app_private.company_setup_workspace_has_business_records(managed_workspace_id) then
          warnings := warnings || jsonb_build_array(jsonb_build_object(
            'code', 'workspace_preserved',
            'workspace_key', managed_key,
            'message', 'A previous setup workspace was kept active because it contains records.'
          ));
        else
          update public.workspaces
             set status = 'archived',
                 is_default = false,
                 updated_at = now()
           where id = managed_workspace_id
             and company_id = target_company_id;
        end if;
      end if;
    end if;
  end loop;

  for role_item in
    select item.value
    from jsonb_array_elements(coalesce(p_plan->'roles', '[]'::jsonb)) item(value)
  loop
    role_key := role_item->>'key';
    role_name := btrim(role_item->>'name');
    target_role_id := null;
    existing_named_role_id := null;
    existing_named_role_system := null;
    mapped_id_text := managed_roles->>role_key;

    if mapped_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      select role.id
        into target_role_id
      from public.roles role
      where role.id = mapped_id_text::uuid
        and role.company_id = target_company_id
        and not role.is_system;
    end if;

    select role.id, role.is_system
      into existing_named_role_id, existing_named_role_system
    from public.roles role
    where role.company_id = target_company_id
      and lower(role.name) = lower(role_name)
    limit 1;

    if existing_named_role_id is not null and existing_named_role_id is distinct from target_role_id then
      if existing_named_role_system then
        raise exception 'The role name "%" is already used by a built-in role. Choose another name for this role.', role_name
          using errcode = '23505';
      end if;
      target_role_id := existing_named_role_id;
    end if;

    if target_role_id is null then
      insert into public.roles (
        company_id,
        name,
        color,
        priority,
        is_system,
        created_by
      ) values (
        target_company_id,
        role_name,
        '#f0b23b',
        10,
        false,
        actor_id
      )
      returning id into target_role_id;
    else
      update public.roles
         set name = role_name,
             is_system = false,
             updated_at = now()
       where id = target_role_id
         and company_id = target_company_id
         and not is_system;
    end if;

    role_permissions := app_private.company_setup_role_permissions(role_key);

    delete from public.role_permissions
     where role_id = target_role_id;

    insert into public.role_permissions (role_id, permission_key, effect)
    select target_role_id, permission.permission_key, 'allow'
    from unnest(role_permissions) permission(permission_key)
    on conflict (role_id, permission_key) do update
    set effect = 'allow';

    managed_roles := jsonb_set(
      managed_roles,
      array[role_key],
      to_jsonb(target_role_id::text),
      true
    );
    result_roles := result_roles || jsonb_build_array(
      role_item || jsonb_build_object('id', target_role_id)
    );
  end loop;

  final_plan := p_plan || jsonb_build_object(
    'workspaces', result_workspaces,
    'roles', result_roles,
    'warnings', warnings,
    'managed_workspaces', managed_workspaces,
    'managed_roles', managed_roles
  );

  update public.company_setup_profiles
     set answers = p_answers,
         draft_plan = p_plan,
         applied_plan = final_plan,
         status = 'applied',
         setup_version = 1,
         applied_at = now(),
         updated_at = now(),
         updated_by = actor_id
   where company_id = target_company_id;

  insert into public.audit_events (
    company_id,
    actor_profile_id,
    event_type,
    target_type,
    target_id,
    details
  ) values (
    target_company_id,
    actor_id,
    'company.setup_applied',
    'company',
    target_company_id,
    jsonb_build_object(
      'setup_version', 1,
      'workspace_count', workspace_count,
      'generated_role_count', role_count,
      'warning_count', jsonb_array_length(warnings)
    )
  );

  return jsonb_build_object(
    'status', 'applied',
    'plan', final_plan,
    'warnings', warnings
  );
end;
$$;

revoke all on function public.apply_company_setup(text, jsonb, jsonb) from public;
revoke all on function public.apply_company_setup(text, jsonb, jsonb) from anon;
grant execute on function public.apply_company_setup(text, jsonb, jsonb) to authenticated;
grant execute on function public.apply_company_setup(text, jsonb, jsonb) to service_role;

