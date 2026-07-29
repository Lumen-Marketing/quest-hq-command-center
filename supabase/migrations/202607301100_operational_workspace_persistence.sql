-- Persist operational-workspace uploaded icons and default selection.
-- Existing four/five-argument RPC callers remain compatible through trailing
-- default parameters on the replacement functions.

alter table public.workspaces
  add column if not exists icon_image text not null default '';

alter table public.workspaces
  drop constraint if exists workspaces_icon_image_size_check;

alter table public.workspaces
  add constraint workspaces_icon_image_size_check
  check (pg_column_size(icon_image) <= 330000);

alter table public.workspaces
  drop constraint if exists workspaces_icon_image_format_check;

alter table public.workspaces
  add constraint workspaces_icon_image_format_check
  check (
    icon_image = ''
    or icon_image ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
  );

drop function if exists public.create_operational_workspace(text, text, text, text);

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
set search_path = ''
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
  copied_stage_count integer;
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
  select new_workspace_id, target_company_id, ps.kind, ps.name, ps.color, ps.position
  from public.pipeline_stages ps
  where ps.workspace_id = default_workspace_id
  on conflict (workspace_id, kind, name) do nothing;
  get diagnostics copied_stage_count = row_count;

  if copied_stage_count = 0 then
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
    on conflict (workspace_id, kind, name) do nothing;
  end if;

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

drop function if exists public.update_operational_workspace(uuid, text, text, text, text);

create or replace function public.update_operational_workspace(
  target_workspace_id uuid,
  workspace_name text,
  workspace_description text,
  icon_key text,
  next_status text,
  icon_image text default null
)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(workspace_name, ''));
  clean_description text := left(btrim(coalesce(workspace_description, '')), 500);
  clean_icon text := left(regexp_replace(lower(btrim(coalesce(icon_key, 'home'))), '[^a-z0-9-]+', '-', 'g'), 40);
  clean_icon_image text := case when icon_image is null then null else btrim(icon_image) end;
  clean_status text := lower(btrim(coalesce(next_status, 'active')));
  saved public.workspaces%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_workspace_admin(target_workspace_id) then raise exception 'Workspace admin access required'; end if;
  if clean_name = '' then raise exception 'Workspace name is required'; end if;
  if clean_status not in ('active', 'archived') then raise exception 'Unsupported workspace status'; end if;
  if clean_icon_image is not null and clean_icon_image <> '' and (
    pg_column_size(clean_icon_image) > 330000
    or clean_icon_image !~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
  ) then
    raise exception 'Invalid workspace icon image';
  end if;

  select * into saved
  from public.workspaces w
  where w.id = target_workspace_id
  for update;
  if saved.id is null then raise exception 'Workspace not found'; end if;
  if saved.is_default and clean_status = 'archived' then raise exception 'Default workspace cannot be archived'; end if;

  update public.workspaces w
  set name = left(clean_name, 120),
      description = clean_description,
      icon_key = coalesce(nullif(clean_icon, ''), 'home'),
      icon_image = coalesce(clean_icon_image, w.icon_image),
      status = clean_status,
      updated_at = now()
  where w.id = target_workspace_id
  returning * into saved;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    saved.company_id,
    (select auth.uid()),
    'workspace.updated',
    'workspace',
    saved.id::text,
    jsonb_build_object(
      'workspace_id', saved.id,
      'name', saved.name,
      'status', saved.status,
      'icon', case when saved.icon_image = '' then saved.icon_key else 'uploaded' end
    )
  );
  return saved;
end;
$$;

create or replace function public.set_default_operational_workspace(
  target_workspace_id uuid
)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved public.workspaces%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_workspace_admin(target_workspace_id) then raise exception 'Workspace admin access required'; end if;

  select * into saved
  from public.workspaces w
  where w.id = target_workspace_id;
  if saved.id is null then raise exception 'Workspace not found'; end if;
  if saved.status <> 'active' then raise exception 'Archived workspaces cannot be set as default'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(saved.company_id, 0));

  select * into saved
  from public.workspaces w
  where w.id = target_workspace_id
  for update;
  if saved.id is null then raise exception 'Workspace not found'; end if;
  if saved.status <> 'active' then raise exception 'Archived workspaces cannot be set as default'; end if;

  update public.workspaces w
  set is_default = false,
      updated_at = now()
  where w.company_id = saved.company_id
    and w.is_default
    and w.id <> target_workspace_id;

  update public.workspaces w
  set is_default = true,
      updated_at = now()
  where w.id = target_workspace_id
  returning * into saved;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    saved.company_id,
    (select auth.uid()),
    'workspace.default_changed',
    'workspace',
    saved.id::text,
    jsonb_build_object('workspace_id', saved.id, 'name', saved.name)
  );

  return saved;
end;
$$;

revoke all on function public.create_operational_workspace(text, text, text, text, text) from public, anon;
revoke all on function public.update_operational_workspace(uuid, text, text, text, text, text) from public, anon;
revoke all on function public.set_default_operational_workspace(uuid) from public, anon;

grant execute on function public.create_operational_workspace(text, text, text, text, text) to authenticated, service_role;
grant execute on function public.update_operational_workspace(uuid, text, text, text, text, text) to authenticated, service_role;
grant execute on function public.set_default_operational_workspace(uuid) to authenticated, service_role;

comment on column public.workspaces.icon_image is
  'Validated compressed workspace icon data URL. Empty string selects icon_key.';
comment on function public.set_default_operational_workspace(uuid) is
  'Atomically changes the active default workspace for a company.';
