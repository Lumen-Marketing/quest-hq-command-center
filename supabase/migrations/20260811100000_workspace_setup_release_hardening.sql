-- Release hardening for per-workspace guided setup.
--
-- 1. A new company's first workspace is allowed to start truly blank.
-- 2. Existing manual workspace apps keep their ownership and configuration.
-- 3. Draft/apply/reset mutations use optimistic revisions so an older tab cannot
--    overwrite a newer setup decision.

alter table public.workspace_setup_profiles
  add column if not exists revision integer not null default 0
  check (revision >= 0);

-- Keep the already-reviewed mutation bodies as private cores. Public callers use
-- the revision-aware wrappers below.
alter function public.save_workspace_setup_draft(uuid, jsonb, jsonb)
  set schema app_private;
alter function app_private.save_workspace_setup_draft(uuid, jsonb, jsonb)
  rename to workspace_setup_save_draft_v1;

alter function public.apply_workspace_setup(uuid, jsonb, jsonb)
  set schema app_private;
alter function app_private.apply_workspace_setup(uuid, jsonb, jsonb)
  rename to workspace_setup_apply_core;

alter function public.reset_workspace_setup(uuid)
  set schema app_private;
alter function app_private.reset_workspace_setup(uuid)
  rename to workspace_setup_reset_core;

revoke all on function app_private.workspace_setup_save_draft_v1(uuid, jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function app_private.workspace_setup_apply_core(uuid, jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function app_private.workspace_setup_reset_core(uuid)
  from public, anon, authenticated;

create or replace function public.save_workspace_setup_draft(
  target_workspace_id uuid,
  p_answers jsonb,
  p_draft_plan jsonb,
  p_expected_revision integer
)
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
  if coalesce(p_expected_revision, -1) < 0 then
    raise exception 'A valid setup revision is required';
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
    workspace_id, answers, draft_plan, status, setup_version,
    revision, updated_at, updated_by
  )
  select
    target_workspace_id, coalesce(p_answers, '{}'::jsonb),
    coalesce(p_draft_plan, '{}'::jsonb), 'draft', 1, 1, now(), actor_id
  where p_expected_revision = 0
  on conflict (workspace_id) do update
  set answers = excluded.answers,
      draft_plan = excluded.draft_plan,
      status = 'draft',
      setup_version = 1,
      revision = public.workspace_setup_profiles.revision + 1,
      updated_at = now(),
      updated_by = actor_id
  where public.workspace_setup_profiles.revision = p_expected_revision
  returning public.workspace_setup_profiles.* into result_row;

  if result_row.workspace_id is null then
    raise exception 'Workspace setup changed in another tab or device. Reload Setup before saving again.'
      using errcode = '40001';
  end if;

  return jsonb_build_object(
    'status', result_row.status,
    'workspace_id', result_row.workspace_id,
    'revision', result_row.revision,
    'updated_at', result_row.updated_at
  );
end;
$$;

revoke all on function public.save_workspace_setup_draft(uuid, jsonb, jsonb, integer)
  from public, anon;
grant execute on function public.save_workspace_setup_draft(uuid, jsonb, jsonb, integer)
  to authenticated, service_role;

create or replace function public.apply_workspace_setup(
  target_workspace_id uuid,
  p_answers jsonb,
  p_plan jsonb,
  p_expected_revision integer
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
  current_revision integer;
  previous_managed_plugins text[] := '{}'::text[];
  requested_plugins text[] := '{}'::text[];
  manual_plugin_ids text[] := '{}'::text[];
  corrected_managed_plugins text[] := '{}'::text[];
  manual_plugin_snapshot jsonb := '[]'::jsonb;
  core_result jsonb;
  corrected_plan jsonb;
  result_revision integer;
  result_updated_at timestamptz;
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
  if coalesce(p_expected_revision, -1) < 0 then
    raise exception 'A valid setup revision is required';
  end if;

  -- Establish and lock the revision row before invoking the existing transactional core.
  -- This also makes two first-time applies serialize correctly.
  insert into public.workspace_setup_profiles (workspace_id, updated_by, revision)
  values (target_workspace_id, actor_id, 0)
  on conflict (workspace_id) do nothing;

  select profile.revision
    into current_revision
  from public.workspace_setup_profiles profile
  where profile.workspace_id = target_workspace_id
  for update;

  if current_revision is distinct from p_expected_revision then
    raise exception 'Workspace setup changed in another tab or device. Reload Setup before applying.'
      using errcode = '40001';
  end if;

  select coalesce(array_agg(plugin.value), '{}'::text[])
    into previous_managed_plugins
  from jsonb_array_elements_text(coalesce(
    (select profile.applied_plan->'managed_plugins'
     from public.workspace_setup_profiles profile
     where profile.workspace_id = target_workspace_id),
    '[]'::jsonb
  )) plugin(value);

  select coalesce(array_agg(plugin.value), '{}'::text[])
    into requested_plugins
  from jsonb_array_elements_text(coalesce(p_plan->'workspaces'->0->'pluginIds', '[]'::jsonb)) plugin(value);

  -- Snapshot only preexisting manual workspace apps requested by this plan. The core
  -- may upsert them, but setup must not take ownership or replace their configuration.
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'plugin_id', workspace_plugin.plugin_id,
      'config', workspace_plugin.config,
      'installed_by', workspace_plugin.installed_by,
      'installed_at', workspace_plugin.installed_at
    )), '[]'::jsonb),
    coalesce(array_agg(workspace_plugin.plugin_id), '{}'::text[])
    into manual_plugin_snapshot, manual_plugin_ids
  from public.workspace_plugins workspace_plugin
  where workspace_plugin.workspace_id = target_workspace_id
    and workspace_plugin.status = 'installed'
    and workspace_plugin.plugin_id = any(requested_plugins)
    and workspace_plugin.plugin_id <> all(previous_managed_plugins);

  -- crm and crm_2 are mutually exclusive. Setup may replace the variant it
  -- previously managed, but it must never silently replace or coexist with a
  -- manually active competing variant.
  if 'crm_2' = any(requested_plugins) and exists (
    select 1
    from public.workspace_plugins workspace_plugin
    where workspace_plugin.workspace_id = target_workspace_id
      and workspace_plugin.plugin_id = 'crm'
      and workspace_plugin.status = 'installed'
      and workspace_plugin.plugin_id <> all(previous_managed_plugins)
  ) then
    raise exception 'This workspace already has the manually installed CRM app. Disable it before applying a setup that uses Quest CRM.';
  end if;

  if 'crm' = any(requested_plugins) and exists (
    select 1
    from public.workspace_plugins workspace_plugin
    where workspace_plugin.workspace_id = target_workspace_id
      and workspace_plugin.plugin_id = 'crm_2'
      and workspace_plugin.status = 'installed'
      and workspace_plugin.plugin_id <> all(previous_managed_plugins)
  ) then
    raise exception 'This workspace already has the manually installed Quest CRM app. Disable it before applying a setup that uses CRM.';
  end if;

  core_result := app_private.workspace_setup_apply_core(
    target_workspace_id,
    p_answers,
    p_plan
  );

  -- Restore preexisting manual workspace apps exactly as they were before setup.
  update public.workspace_plugins workspace_plugin
     set config = manual.config,
         installed_by = manual.installed_by,
         installed_at = manual.installed_at,
         updated_at = now()
  from jsonb_to_recordset(manual_plugin_snapshot) as manual(
    plugin_id text,
    config jsonb,
    installed_by uuid,
    installed_at timestamptz
  )
  where workspace_plugin.workspace_id = target_workspace_id
    and workspace_plugin.plugin_id = manual.plugin_id;

  -- Own only requested apps that are now genuinely active at both entitlement
  -- and workspace level. An explicitly disabled entitlement is not claimed by
  -- setup, so enabling it manually later cannot make a future setup disable it.
  select coalesce(array_agg(requested.plugin_id order by requested.plugin_id), '{}'::text[])
    into corrected_managed_plugins
  from unnest(requested_plugins) requested(plugin_id)
  join public.workspace_plugins workspace_plugin
    on workspace_plugin.workspace_id = target_workspace_id
   and workspace_plugin.plugin_id = requested.plugin_id
   and workspace_plugin.status = 'installed'
  join public.company_plugins entitlement
    on entitlement.company_id = target_company_id
   and entitlement.plugin_id = requested.plugin_id
   and entitlement.status = 'installed'
  where requested.plugin_id <> all(manual_plugin_ids);

  corrected_plan := coalesce(core_result->'plan', '{}'::jsonb);
  corrected_plan := jsonb_set(
    corrected_plan,
    '{managed_plugins}',
    to_jsonb(corrected_managed_plugins),
    true
  );
  corrected_plan := jsonb_set(
    corrected_plan,
    '{workspaces,0,managedPlugins}',
    to_jsonb(corrected_managed_plugins),
    true
  );

  update public.workspace_setup_profiles profile
     set applied_plan = corrected_plan,
         revision = profile.revision + 1,
         updated_at = now(),
         updated_by = actor_id
   where profile.workspace_id = target_workspace_id
  returning profile.revision, profile.updated_at
       into result_revision, result_updated_at;

  return jsonb_set(
    jsonb_set(
      jsonb_set(core_result, '{plan}', corrected_plan, true),
      '{revision}', to_jsonb(result_revision), true
    ),
    '{updated_at}', to_jsonb(result_updated_at), true
  );
end;
$$;

revoke all on function public.apply_workspace_setup(uuid, jsonb, jsonb, integer)
  from public, anon;
grant execute on function public.apply_workspace_setup(uuid, jsonb, jsonb, integer)
  to authenticated, service_role;

create or replace function public.reset_workspace_setup(
  target_workspace_id uuid,
  p_expected_revision integer
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
  current_revision integer;
  core_result jsonb;
  result_revision integer;
  result_updated_at timestamptz;
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
  if coalesce(p_expected_revision, -1) < 0 then
    raise exception 'A valid setup revision is required';
  end if;

  insert into public.workspace_setup_profiles (workspace_id, updated_by, revision)
  values (target_workspace_id, actor_id, 0)
  on conflict (workspace_id) do nothing;

  select profile.revision
    into current_revision
  from public.workspace_setup_profiles profile
  where profile.workspace_id = target_workspace_id
  for update;

  if current_revision is distinct from p_expected_revision then
    raise exception 'Workspace setup changed in another tab or device. Reload Setup before resetting.'
      using errcode = '40001';
  end if;

  core_result := app_private.workspace_setup_reset_core(target_workspace_id);

  update public.workspace_setup_profiles profile
     set revision = profile.revision + 1,
         updated_at = now(),
         updated_by = actor_id
   where profile.workspace_id = target_workspace_id
  returning profile.revision, profile.updated_at
       into result_revision, result_updated_at;

  return jsonb_set(
    jsonb_set(core_result, '{revision}', to_jsonb(result_revision), true),
    '{updated_at}', to_jsonb(result_updated_at), true
  );
end;
$$;

revoke all on function public.reset_workspace_setup(uuid, integer)
  from public, anon;
grant execute on function public.reset_workspace_setup(uuid, integer)
  to authenticated, service_role;

-- The questionnaire, not a hidden generic bundle, determines the first workspace's apps.
-- Platform-created workspaces can still explicitly request roofing/construction/generic.
create or replace function public.create_company_workspace(
  company_name text,
  preset_code text default 'generic',
  icon_key text default 'home',
  owner_email text default null
)
returns text
language plpgsql
security definer
set search_path to 'public', 'app_private', 'pg_temp'
as $function$
declare
  clean_name text := trim(coalesce(company_name, ''));
  clean_preset text := lower(trim(coalesce(preset_code, 'generic')));
  clean_icon text := app_private.normalize_workspace_icon_key(icon_key);
  clean_owner_email text := lower(trim(coalesce(owner_email, '')));
  base_id text;
  v_company_id text;
  owner_profile_id uuid := auth.uid();
  owner_role_id uuid;
  desired_plugins text[] := app_private.plugin_ids_for_preset(clean_preset);
  desired_plugin_id text;
  creator_is_platform_admin boolean := app_private.is_quest_admin();
  owned_workspace_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if clean_name = '' then
    raise exception 'Company name is required';
  end if;

  if clean_preset not in ('roofing', 'construction', 'generic', 'blank') then
    clean_preset := 'generic';
    desired_plugins := app_private.plugin_ids_for_preset(clean_preset);
  end if;

  if clean_owner_email <> '' and not creator_is_platform_admin then
    raise exception 'Platform admin access required to create for another owner';
  end if;

  if clean_owner_email <> '' then
    select p.id into owner_profile_id
    from public.profiles p
    where lower(p.email) = clean_owner_email
    limit 1;

    if owner_profile_id is null then
      raise exception 'Owner profile not found';
    end if;
  end if;

  select count(distinct cm.company_id)::integer into owned_workspace_count
  from public.company_memberships cm
  where cm.profile_id = owner_profile_id
    and cm.role = 'owner'
    and cm.status = 'active';

  if not creator_is_platform_admin and owned_workspace_count >= 3 then
    raise exception 'Workspace limit reached'
      using detail = 'Users can own up to 3 workspaces.';
  end if;

  base_id := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if base_id = '' then base_id := 'company'; end if;

  v_company_id := base_id;
  while exists (select 1 from public.companies c where c.id = v_company_id) loop
    v_company_id := base_id || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  insert into public.companies (id, name, short_name, color, label, pill, icon_key)
  values (v_company_id, clean_name, clean_name, '#f0b23b', clean_name, 'pill-' || v_company_id, clean_icon);

  insert into public.company_subscriptions (company_id, status)
  values (v_company_id, 'pending_review')
  on conflict (company_id) do update
    set status = 'pending_review', updated_at = now();

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (v_company_id, owner_profile_id, 'owner', 'active')
  on conflict (company_id, profile_id) do update
    set role = 'owner', status = 'active', updated_at = now();

  update public.profiles p
  set approved = true,
      role = case when p.role = 'member' then 'admin' else p.role end,
      company_ids = array(
        select distinct unnest(coalesce(p.company_ids, '{}'::text[]) || array[v_company_id])
      )
  where p.id = owner_profile_id;

  perform app_private.seed_company_default_roles(v_company_id, auth.uid());

  select id into owner_role_id
  from public.roles
  where company_id = v_company_id and lower(name) = 'owner'
  limit 1;

  insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
  values (v_company_id, owner_profile_id, owner_role_id, auth.uid())
  on conflict do nothing;

  foreach desired_plugin_id in array desired_plugins loop
    insert into public.company_plugins (
      company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at
    )
    values (v_company_id, desired_plugin_id, 'installed', auth.uid(), now(), null, now())
    on conflict (company_id, plugin_id) do nothing;
  end loop;

  insert into public.audit_events (
    company_id, actor_profile_id, event_type, target_type, target_id, details
  )
  values (
    v_company_id, auth.uid(), 'company.created', 'company', v_company_id,
    jsonb_build_object(
      'name', clean_name,
      'access_status', 'pending_review',
      'preset_code', clean_preset,
      'plugin_ids', desired_plugins,
      'icon_key', clean_icon,
      'owner_profile_id', owner_profile_id,
      'owner_email', clean_owner_email
    )
  );

  return v_company_id;
end;
$function$;

revoke all on function public.create_company_workspace(text, text, text, text)
  from public, anon;
grant execute on function public.create_company_workspace(text, text, text, text)
  to authenticated;
