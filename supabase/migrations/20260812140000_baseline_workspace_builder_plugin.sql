-- The Workspace App Builder is baseline, not a preset choice.
--
-- Creating a workspace sends you into the workspace app. That module is not core
-- (CORE_MODULE_IDS is dashboard/jobs/users/settings/automations), so canViewModule ->
-- isModuleInstalled('workspaces') requires the workspace_builder plugin to be installed in
-- that workspace. Without it the module is invisible and the redirect lands on nothing.
--
-- WHY IT WAS MISSING. Both creation paths take their plugin list from one function,
-- app_private.plugin_ids_for_preset:
--
--   'blank'        -> array[]           <-- what the client passes for BOTH
--                                           create_company_workspace and
--                                           create_operational_workspace
--   'roofing'      -> 11 plugins, no workspace_builder
--   'construction' ->  9 plugins, no workspace_builder
--   else/'generic' -> includes workspace_builder
--
-- So only the generic preset ever installed it. In production most workspaces have no
-- workspace_builder row at all, and several have no plugin rows whatsoever.
--
-- 'blank' means no BUSINESS modules, not no workspace. The builder is how a blank
-- workspace becomes anything, so it belongs in every preset including that one.

create or replace function app_private.baseline_plugin_ids()
returns text[]
language sql
immutable
set search_path to ''
as $$
  -- Named rather than inlined so the two callers below cannot drift apart.
  select array['workspace_builder']::text[];
$$;

create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path to ''
as $$
  select array(
    select distinct unnest(
      app_private.baseline_plugin_ids() ||
      case lower(trim(coalesce(preset_code, 'generic')))
        when 'blank' then array[]::text[]
        when 'roofing' then array['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']::text[]
        when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']::text[]
        else array['crm', 'files', 'messages', 'workspace_builder', 'tasks']::text[]
      end
    )
    -- Deterministic, because create_company_workspace records this list in audit_events.
    order by 1
  );
$$;

-- create_operational_workspace installs the intersection of the preset list and what the
-- COMPANY is entitled to. Companies created before this (or through a path that never
-- entitled it) have no workspace_builder row in company_plugins, so the intersection stays
-- empty however the preset is fixed. The baseline is therefore guaranteed at the company
-- level first, inside the same transaction.
--
-- Unchanged from the deployed definition apart from that one added block.
create or replace function public.create_operational_workspace(
  target_company_id text,
  workspace_name text,
  preset_code text default 'generic',
  icon_key text default 'home',
  icon_image text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  clean_name text := btrim(coalesce(workspace_name, ''));
  clean_slug text;
  clean_icon text := left(regexp_replace(lower(btrim(coalesce(icon_key, 'home'))), '[^a-z0-9-]+', '-', 'g'), 40);
  clean_icon_image text := btrim(coalesce(icon_image, ''));
  new_workspace_id uuid;
  default_workspace_id uuid;
  owner_role_id uuid;
  desired_plugins text[];
  baseline_plugin_id text;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_company_admin(target_company_id) then raise exception 'Workspace admin access required'; end if;
  if clean_name = '' then raise exception 'Workspace name is required'; end if;
  if clean_icon_image <> '' and (
    pg_column_size(clean_icon_image) > 330000
    or clean_icon_image !~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
  ) then
    raise exception 'Invalid workspace icon image';
  end if;

  clean_slug := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if clean_slug = '' then clean_slug := 'workspace'; end if;
  while exists (select 1 from public.workspaces w where w.company_id = target_company_id and w.slug = clean_slug) loop
    clean_slug := left(clean_slug, 48) || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  select w.id into default_workspace_id
  from public.workspaces w
  where w.company_id = target_company_id and w.is_default and w.status = 'active'
  limit 1;

  insert into public.workspaces (
    company_id, slug, name, icon_key, icon_image, color, status, is_default, created_by
  )
  select
    c.id, clean_slug, left(clean_name, 120), coalesce(nullif(clean_icon, ''), 'home'),
    clean_icon_image, coalesce(nullif(c.color, ''), '#f0b23b'), 'active',
    (default_workspace_id is null), (select auth.uid())
  from public.companies c
  where c.id = target_company_id
  returning id into new_workspace_id;

  if new_workspace_id is null then raise exception 'Company not found'; end if;

  select r.id into owner_role_id
  from public.roles r
  where r.company_id = target_company_id
  order by case when lower(r.name) = 'owner' then 0 else 1 end, r.priority desc
  limit 1;

  insert into public.workspace_memberships (
    workspace_id, profile_id, role_id, status, assigned_by
  )
  values (new_workspace_id, (select auth.uid()), owner_role_id, 'active', (select auth.uid()))
  on conflict (workspace_id, profile_id) do update
  set role_id = excluded.role_id,
      status = 'active',
      assigned_by = excluded.assigned_by,
      updated_at = now();

  -- ADDED: the company must be entitled before the workspace can install it. Only ever
  -- creates a missing row -- a company that deliberately DISABLED the builder keeps that
  -- choice, because do nothing does not revive a disabled row.
  foreach baseline_plugin_id in array app_private.baseline_plugin_ids() loop
    insert into public.company_plugins (
      company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at
    )
    values (target_company_id, baseline_plugin_id, 'installed', (select auth.uid()), now(), null, now())
    on conflict (company_id, plugin_id) do nothing;
  end loop;

  desired_plugins := app_private.plugin_ids_for_preset(preset_code);
  insert into public.workspace_plugins (
    workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  )
  select
    new_workspace_id, cp.plugin_id, 'installed', cp.config, (select auth.uid()), now(), null
  from public.company_plugins cp
  where cp.company_id = target_company_id
    and cp.status = 'installed'
    and cp.plugin_id = any(desired_plugins)
  on conflict (workspace_id, plugin_id) do update
  set status = 'installed',
      config = excluded.config,
      installed_by = excluded.installed_by,
      installed_at = coalesce(public.workspace_plugins.installed_at, now()),
      disabled_at = null,
      updated_at = now();

  insert into public.pipeline_stages (workspace_id, company_id, kind, name, color, position)
  select new_workspace_id, target_company_id, source_stage.kind, source_stage.name, source_stage.color, source_stage.position
  from public.pipeline_stages source_stage
  where source_stage.workspace_id = default_workspace_id
  on conflict (workspace_id, kind, name) do nothing;

  insert into public.pipeline_stages (workspace_id, company_id, kind, name, color, position)
  select new_workspace_id, target_company_id, seed.kind, seed.name, seed.color, seed.position
  from (values
    ('contacts', 'Prospects', '#9AA0A8', 0), ('contacts', 'Leads', '#378ADD', 1),
    ('contacts', 'Underwriting', '#BA7517', 2), ('contacts', 'Estimate sent', '#3C7BD0', 3),
    ('contacts', 'Negotiating', '#C08A2B', 4), ('contacts', 'Contract out', '#7F77DD', 5),
    ('contacts', 'Won', '#639922', 6), ('contacts', 'Follow-up', '#C4C7CC', 7),
    ('contacts', 'Lost', '#E24B4A', 8),
    ('deals', 'Prospect', '#9AA0A8', 0), ('deals', 'Qualified', '#378ADD', 1),
    ('deals', 'Proposal sent', '#3C7BD0', 2), ('deals', 'Negotiation', '#C08A2B', 3),
    ('deals', 'Verbal commit', '#7F77DD', 4), ('deals', 'Won', '#639922', 5),
    ('deals', 'Lost', '#E24B4A', 6),
    ('jobs', 'Unscheduled', '#9AA0A8', 0), ('jobs', 'Scheduled', '#378ADD', 1),
    ('jobs', 'Material ordered', '#3C7BD0', 2), ('jobs', 'In production', '#BA7517', 3),
    ('jobs', 'QC / punch list', '#C08A2B', 4), ('jobs', 'Invoiced', '#7F77DD', 5),
    ('jobs', 'Paid / closed', '#639922', 6), ('jobs', 'On hold', '#C4C7CC', 7)
  ) as seed(kind, name, color, position)
  where not exists (
    select 1
    from public.pipeline_stages existing
    where existing.workspace_id = new_workspace_id
      and existing.kind = seed.kind
  )
  on conflict (workspace_id, kind, name) do nothing;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id,
    (select auth.uid()),
    'workspace.created',
    'workspace',
    new_workspace_id::text,
    jsonb_build_object(
      'workspace_id', new_workspace_id,
      'name', clean_name,
      'preset_code', lower(btrim(coalesce(preset_code, 'generic'))),
      'icon', case when clean_icon_image = '' then clean_icon else 'uploaded' end
    )
  );

  return new_workspace_id;
end;
$$;

revoke all on function public.create_operational_workspace(text, text, text, text, text) from public, anon;
grant execute on function public.create_operational_workspace(text, text, text, text, text) to authenticated;
