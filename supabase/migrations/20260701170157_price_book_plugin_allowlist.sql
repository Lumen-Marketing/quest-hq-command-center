alter table public.company_plugins
  drop constraint if exists company_plugins_known_plugin_check;

alter table public.company_plugins
  add constraint company_plugins_known_plugin_check check (
    plugin_id in (
      'crm',
      'crm_2',
      'underwriter',
      'files',
      'client_portal',
      'workspace_builder',
      'price_book',
      'forms',
      'finance',
      'messages',
      'calendar',
      'time_clock',
      'approvals',
      'reporting'
    )
  );

create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case lower(trim(coalesce(preset_code, 'generic')))
    when 'roofing' then array['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting']::text[]
    when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting']::text[]
    else array['crm', 'files', 'messages', 'workspace_builder']::text[]
  end;
$$;

revoke all on function app_private.plugin_ids_for_preset(text) from public, anon;
grant execute on function app_private.plugin_ids_for_preset(text) to authenticated;

create or replace function app_private.permission_plugin_ids(permission text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case
    when permission like 'crm.%' then array['crm', 'crm_2']::text[]
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
    when permission = 'team.view' then array['reporting']::text[]
    else array[]::text[]
  end;
$$;

revoke all on function app_private.permission_plugin_ids(text) from public, anon;
grant execute on function app_private.permission_plugin_ids(text) to authenticated;

create or replace function app_private.permission_plugin_id(permission text)
returns text
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select (app_private.permission_plugin_ids(permission))[1];
$$;

revoke all on function app_private.permission_plugin_id(text) from public, anon;
grant execute on function app_private.permission_plugin_id(text) to authenticated;

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
  conflict_plugin_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Plugin admin access required';
  end if;

  if clean_plugin_id not in (
    'crm',
    'crm_2',
    'underwriter',
    'files',
    'client_portal',
    'workspace_builder',
    'price_book',
    'forms',
    'finance',
    'messages',
    'calendar',
    'time_clock',
    'approvals',
    'reporting'
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
      end if;
    end loop;
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

insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
values ('lumen', 'price_book', 'installed', null, now(), null, now())
on conflict (company_id, plugin_id) do update
  set status = 'installed',
      installed_at = coalesce(public.company_plugins.installed_at, now()),
      disabled_at = null,
      updated_at = now();
