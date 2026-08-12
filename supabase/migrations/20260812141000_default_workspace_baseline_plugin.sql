-- The first workspace of a new account had no plugins at all.
--
-- A new company's "Main" workspace is not made by create_operational_workspace. It is made
-- by the companies_ensure_default_workspace trigger ->
-- app_private.ensure_default_workspace_for_company, which seeds pipeline stages and stops
-- there. Nothing ever inserted a workspace_plugins row for it.
--
-- Both layers are required for a module to count as installed. src/workspaces/model.js:
--
--   if (!companyEntitled) return 'available';   <- company_plugins
--   if (!row) return 'available';               <- workspace_plugins
--
-- create_company_workspace covers the first (its preset list now carries the baseline).
-- This covers the second. In production, production-1bfb93/Main and production/Main are
-- both entitled at company level with zero workspace_plugins rows -- exactly this gap.
--
-- ONLY ON CREATE. The insert sits inside the branch that creates the workspace, not on the
-- repair paths above it that adopt or re-flag an existing one. An existing workspace
-- deliberately left without the builder keeps that shape; this is about what a NEW
-- workspace starts with.

create or replace function app_private.ensure_default_workspace_for_company(
  p_company_id text,
  p_actor uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  target_workspace_id uuid;
  base_slug text := 'main';
  candidate_slug text := 'main';
  company_color text;
  baseline_plugin_id text;
begin
  select w.id
    into target_workspace_id
  from public.workspaces w
  where w.company_id = p_company_id
    and w.is_default
    and w.status = 'active'
  order by w.created_at
  limit 1;

  if target_workspace_id is null then
    -- An archived default still occupies the partial unique index. It is no longer
    -- the active default and can safely lose only that configuration flag.
    update public.workspaces
       set is_default = false,
           updated_at = now()
     where company_id = p_company_id
       and is_default
       and status <> 'active';

    select w.id
      into target_workspace_id
    from public.workspaces w
    where w.company_id = p_company_id
      and w.status = 'active'
    order by w.created_at
    limit 1;

    if target_workspace_id is not null then
      update public.workspaces
         set is_default = true,
             updated_at = now()
       where id = target_workspace_id;
    else
      select coalesce(nullif(c.color, ''), '#f0b23b')
        into company_color
      from public.companies c
      where c.id = p_company_id;

      if company_color is null then
        raise exception 'Company not found';
      end if;

      while exists (
        select 1
        from public.workspaces w
        where w.company_id = p_company_id
          and w.slug = candidate_slug
      ) loop
        candidate_slug := base_slug || '-' || left(replace(gen_random_uuid()::text, '-', ''), 6);
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
      ) values (
        p_company_id,
        candidate_slug,
        'Main',
        'Default operational workspace',
        'home',
        company_color,
        'active',
        true,
        p_actor
      )
      returning id into target_workspace_id;

      -- ADDED, and only here: a workspace this function just created.
      --
      -- Inserted directly rather than as an intersection with company_plugins, because
      -- this runs from a trigger on companies INSERT -- create_company_workspace writes
      -- the company_plugins rows AFTER that returns, so an intersection would find
      -- nothing. The two writes are independent and both land.
      foreach baseline_plugin_id in array app_private.baseline_plugin_ids() loop
        insert into public.workspace_plugins (
          workspace_id, plugin_id, status, installed_by, installed_at, disabled_at
        )
        values (target_workspace_id, baseline_plugin_id, 'installed', p_actor, now(), null)
        on conflict (workspace_id, plugin_id) do nothing;
      end loop;
    end if;
  end if;

  perform app_private.seed_company_setup_pipeline_stages(target_workspace_id, p_company_id);
  return target_workspace_id;
end;
$$;
