create or replace function public.apply_company_plugin_preset(
  target_company_id text,
  preset_code text
)
returns text[]
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  desired_plugins text[] := app_private.plugin_ids_for_preset(preset_code);
  desired_plugin_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Plugin admin access required';
  end if;

  update public.company_plugins cp
  set status = 'disabled',
      disabled_at = now(),
      updated_at = now()
  where cp.company_id = clean_company_id
    and cp.plugin_id <> all(desired_plugins)
    and cp.status = 'installed';

  foreach desired_plugin_id in array desired_plugins loop
    insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
    values (clean_company_id, desired_plugin_id, 'installed', auth.uid(), now(), null, now())
    on conflict (company_id, plugin_id) do update
      set status = 'installed',
          installed_by = coalesce(public.company_plugins.installed_by, auth.uid()),
          installed_at = coalesce(public.company_plugins.installed_at, now()),
          disabled_at = null,
          updated_at = now();
  end loop;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    'plugin.preset_applied',
    'company',
    clean_company_id,
    jsonb_build_object('preset_code', lower(trim(coalesce(preset_code, 'generic'))), 'plugin_ids', desired_plugins)
  );

  return desired_plugins;
end;
$$;

revoke all on function public.apply_company_plugin_preset(text, text) from public, anon;
grant execute on function public.apply_company_plugin_preset(text, text) to authenticated;

create or replace function public.create_company_workspace(company_name text, preset_code text default 'generic')
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_name text := trim(coalesce(company_name, ''));
  clean_preset text := lower(trim(coalesce(preset_code, 'generic')));
  base_id text;
  v_company_id text;
  existing_company_id text;
  owner_role_id uuid;
  desired_plugins text[] := app_private.plugin_ids_for_preset(clean_preset);
  desired_plugin_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select cm.company_id
    into existing_company_id
  from public.company_memberships cm
  left join public.company_subscriptions cs on cs.company_id = cm.company_id
  where cm.profile_id = auth.uid()
    and cm.status = 'active'
  order by
    case
      when cm.company_id = 'lumen' then 0
      when cs.status in ('active', 'trialing', 'past_due', 'grace') then 1
      when cs.status = 'pending_review' then 2
      else 3
    end,
    cm.created_at asc
  limit 1;

  if existing_company_id is not null then
    foreach desired_plugin_id in array desired_plugins loop
      insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
      values (existing_company_id, desired_plugin_id, 'installed', auth.uid(), now(), null, now())
      on conflict (company_id, plugin_id) do nothing;
    end loop;
    return existing_company_id;
  end if;

  if clean_name = '' then
    raise exception 'Company name is required';
  end if;

  base_id := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if base_id = '' then
    base_id := 'company';
  end if;

  v_company_id := base_id;
  while exists (select 1 from public.companies c where c.id = v_company_id) loop
    v_company_id := base_id || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  insert into public.companies (id, name, short_name, color, label, pill)
  values (v_company_id, clean_name, clean_name, '#f0b23b', clean_name, 'pill-' || v_company_id);

  insert into public.company_subscriptions (company_id, status)
  values (v_company_id, 'pending_review')
  on conflict (company_id) do update
    set status = 'pending_review',
        updated_at = now();

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (v_company_id, auth.uid(), 'owner', 'active')
  on conflict (company_id, profile_id) do update
    set role = 'owner',
        status = 'active',
        updated_at = now();

  update public.profiles p
  set approved = true,
      role = case when p.role = 'member' then 'admin' else p.role end,
      company_ids = array(
        select distinct unnest(coalesce(p.company_ids, '{}'::text[]) || array[v_company_id])
      )
  where p.id = auth.uid();

  insert into public.roles (company_id, name, color, priority, is_system, created_by)
  values (v_company_id, 'Owner', '#f0b23b', 1000, true, auth.uid())
  returning id into owner_role_id;

  insert into public.role_permissions (role_id, permission_key, effect)
  values (owner_role_id, '*', 'allow')
  on conflict (role_id, permission_key) do nothing;

  insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
  values (v_company_id, auth.uid(), owner_role_id, auth.uid())
  on conflict do nothing;

  foreach desired_plugin_id in array desired_plugins loop
    insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
    values (v_company_id, desired_plugin_id, 'installed', auth.uid(), now(), null, now())
    on conflict (company_id, plugin_id) do nothing;
  end loop;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    v_company_id,
    auth.uid(),
    'company.created',
    'company',
    v_company_id,
    jsonb_build_object('name', clean_name, 'access_status', 'pending_review', 'preset_code', clean_preset, 'plugin_ids', desired_plugins)
  );

  return v_company_id;
end;
$$;

revoke all on function public.create_company_workspace(text, text) from public, anon;
grant execute on function public.create_company_workspace(text, text) to authenticated;
