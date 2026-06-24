create table if not exists public.company_plugins (
  company_id text not null references public.companies(id) on delete cascade,
  plugin_id text not null,
  status text not null default 'installed',
  installed_by uuid references public.profiles(id) on delete set null,
  installed_at timestamptz,
  disabled_at timestamptz,
  updated_at timestamptz not null default now(),
  config jsonb not null default '{}'::jsonb,
  primary key (company_id, plugin_id),
  constraint company_plugins_status_check check (status in ('installed', 'disabled')),
  constraint company_plugins_known_plugin_check check (
    plugin_id in ('crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting')
  )
);

create index if not exists company_plugins_company_status_idx
  on public.company_plugins(company_id, status);

drop trigger if exists company_plugins_set_updated_at on public.company_plugins;
create trigger company_plugins_set_updated_at before update on public.company_plugins
for each row execute function public.set_updated_at();

alter table public.company_plugins enable row level security;

drop policy if exists "members read company plugins" on public.company_plugins;
create policy "members read company plugins" on public.company_plugins
for select to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "admins manage company plugins" on public.company_plugins;
create policy "admins manage company plugins" on public.company_plugins
for all to authenticated
using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

grant select, insert, update on public.company_plugins to authenticated;

create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case lower(trim(coalesce(preset_code, 'generic')))
    when 'roofing' then array['crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting']::text[]
    when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting']::text[]
    else array['crm', 'files', 'messages']::text[]
  end;
$$;

revoke all on function app_private.plugin_ids_for_preset(text) from public, anon;
grant execute on function app_private.plugin_ids_for_preset(text) to authenticated;

create or replace function app_private.company_has_plugin(target_company_id text, target_plugin_id text)
returns boolean
language sql
security definer
set search_path = public, app_private, pg_temp
stable
as $$
  select exists (
    select 1
    from public.company_plugins cp
    where cp.company_id = target_company_id
      and cp.plugin_id = target_plugin_id
      and cp.status = 'installed'
  );
$$;

revoke all on function app_private.company_has_plugin(text, text) from public, anon;
grant execute on function app_private.company_has_plugin(text, text) to authenticated;

create or replace function app_private.permission_plugin_id(permission text)
returns text
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case
    when permission like 'crm.%' then 'crm'
    when permission like 'files.%' then 'files'
    when permission like 'forms.%' then 'forms'
    when permission like 'finance.%' then 'finance'
    when permission like 'messages.%' then 'messages'
    when permission like 'calendar.%' then 'calendar'
    when permission in ('time.track', 'clock.manage') then 'time_clock'
    when permission like 'approvals.%' then 'approvals'
    when permission = 'team.view' then 'reporting'
    else null
  end;
$$;

revoke all on function app_private.permission_plugin_id(text) from public, anon;
grant execute on function app_private.permission_plugin_id(text) to authenticated;

create or replace function app_private.permission_plugin_available(target_company_id text, permission text)
returns boolean
language sql
security definer
set search_path = public, app_private, pg_temp
stable
as $$
  with plugin as (
    select app_private.permission_plugin_id(permission) as plugin_id
  )
  select plugin_id is null or app_private.company_has_plugin(target_company_id, plugin_id)
  from plugin;
$$;

revoke all on function app_private.permission_plugin_available(text, text) from public, anon;
grant execute on function app_private.permission_plugin_available(text, text) to authenticated;

create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  with membership as (
    select cm.role
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = auth.uid()
      and (rp.permission_key = permission or rp.permission_key = '*')
  )
  select
    app_private.permission_plugin_available(target_company_id, permission)
    and (
      exists (select 1 from membership where role in ('owner', 'developer'))
      or (
        exists (select 1 from membership)
        and not exists (select 1 from assigned where effect = 'deny')
        and (
          exists (select 1 from assigned where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$$;

revoke all on function app_private.has_company_permission(text, text) from public, anon;
grant execute on function app_private.has_company_permission(text, text) to authenticated;

create or replace function public.set_company_plugin(
  target_company_id text,
  target_plugin_id text,
  next_status text
)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_plugin_id text := lower(trim(coalesce(target_plugin_id, '')));
  clean_status text := lower(trim(coalesce(next_status, '')));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Plugin admin access required';
  end if;

  if clean_plugin_id not in ('crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting') then
    raise exception 'Unsupported plugin';
  end if;

  if clean_status not in ('installed', 'disabled') then
    raise exception 'Unsupported plugin status';
  end if;

  insert into public.company_plugins (
    company_id,
    plugin_id,
    status,
    installed_by,
    installed_at,
    disabled_at,
    updated_at
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

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    case when clean_status = 'installed' then 'plugin.installed' else 'plugin.disabled' end,
    'company_plugin',
    clean_plugin_id,
    jsonb_build_object('plugin_id', clean_plugin_id, 'status', clean_status)
  );

  return clean_status;
end;
$$;

revoke all on function public.set_company_plugin(text, text, text) from public, anon;
grant execute on function public.set_company_plugin(text, text, text) to authenticated;

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
  plugin_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Plugin admin access required';
  end if;

  update public.company_plugins
  set status = 'disabled',
      disabled_at = now(),
      updated_at = now()
  where company_id = clean_company_id
    and plugin_id <> all(desired_plugins)
    and status = 'installed';

  foreach plugin_id in array desired_plugins loop
    insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
    values (clean_company_id, plugin_id, 'installed', auth.uid(), now(), null, now())
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

drop function if exists public.create_company_workspace(text);

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
  plugin_id text;
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
    foreach plugin_id in array desired_plugins loop
      insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
      values (existing_company_id, plugin_id, 'installed', auth.uid(), now(), null, now())
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

  foreach plugin_id in array desired_plugins loop
    insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
    values (v_company_id, plugin_id, 'installed', auth.uid(), now(), null, now())
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

insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, updated_at)
select 'lumen', plugin_id, 'installed', null, now(), now()
from unnest(array['crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting']::text[]) as plugin_id
on conflict (company_id, plugin_id) do update
  set status = 'installed',
      disabled_at = null,
      updated_at = now();
