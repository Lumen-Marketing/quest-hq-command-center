-- READ-ONLY verification of the default roles, their permissions, and the default module
-- (plugin) presets that a brand-new company and its Main workspace receive.
--
-- Contract asserted (repository sources, live shape captured 2026-09-09):
--   * app_private.baseline_plugin_ids()
--       -> {workspace_builder}                           20260812140000_baseline_workspace_builder_plugin.sql
--   * app_private.plugin_ids_for_preset(code)            same migration (generic/roofing/construction/blank)
--   * system Owner role  holds `*` / allow               seed_company_default_roles
--   * system Member role holds exactly the ROLE_PRESETS.member list from src/main.js:582,
--     verbatim in 202608082000_default_roles_and_roles_manage.sql
--
-- Checks are sorted-set comparisons, so byte order in the live arrays cannot false-fail.
-- Nothing is written: only SELECT and DO/exception blocks. The transaction always ends in
-- ROLLBACK per .ai/operations.md, so even an accidental write would not persist.
-- Run as database owner (psql, `supabase db query`, or the SQL editor).

begin;

-- 1. Preset contract. A drift here means a NEW company would be entitled to a different
--    set of modules than the product ships, regardless of the stored company rows.
do $$
declare
  v text[];
  expected text[];
begin
  if app_private.baseline_plugin_ids() <> array['workspace_builder']::text[] then
    raise exception 'baseline_plugin_ids() drifted from the repository contract: %',
      app_private.baseline_plugin_ids();
  end if;

  expected := array['workspace_builder']::text[];
  v := app_private.plugin_ids_for_preset('blank');
  if (select array_agg(x order by x) from unnest(v) x) <> (select array_agg(x order by x) from unnest(expected) x) then
    raise exception 'plugin_ids_for_preset(''blank'') drifted: %', v;
  end if;

  expected := array['crm','files','messages','tasks','workspace_builder']::text[];
  v := app_private.plugin_ids_for_preset('generic');
  if (select array_agg(x order by x) from unnest(v) x) <> (select array_agg(x order by x) from unnest(expected) x) then
    raise exception 'plugin_ids_for_preset(''generic'') drifted: %', v;
  end if;
  v := app_private.plugin_ids_for_preset(null);
  if (select array_agg(x order by x) from unnest(v) x) <> (select array_agg(x order by x) from unnest(expected) x) then
    raise exception 'plugin_ids_for_preset(NULL) drifted: %', v;
  end if;

  expected := array['approvals','calendar','crm_2','files','finance','forms','messages',
                     'price_book','reporting','tasks','underwriter','workspace_builder']::text[];
  v := app_private.plugin_ids_for_preset('roofing');
  if (select array_agg(x order by x) from unnest(v) x) <> (select array_agg(x order by x) from unnest(expected) x) then
    raise exception 'plugin_ids_for_preset(''roofing'') drifted: %', v;
  end if;

  expected := array['approvals','calendar','files','finance','forms','messages','reporting',
                     'tasks','time_clock','workspace_builder']::text[];
  v := app_private.plugin_ids_for_preset('construction');
  if (select array_agg(x order by x) from unnest(v) x) <> (select array_agg(x order by x) from unnest(expected) x) then
    raise exception 'plugin_ids_for_preset(''construction'') drifted: %', v;
  end if;
end $$;

-- 2. System-role contract across every company. The seed backfilled all companies and runs
--    on every create, so each company must carry its two system roles with these exact keys.
do $$
declare
  expected_member constant text[] := array[
    'jobs.view', 'tasks.view', 'tasks.manage', 'files.view', 'forms.view', 'time.track',
    'approvals.view', 'calendar.view', 'users.view', 'messages.view', 'messages.send',
    'messages.attach_files'
  ];
  v_bad text;
begin
  select c.id into v_bad
  from public.companies c
  where not exists (
          select 1 from public.roles r
          where r.company_id = c.id and r.is_system and lower(r.name) = 'owner'
        )
     or not exists (
          select 1 from public.roles r
          where r.company_id = c.id and r.is_system and lower(r.name) = 'member'
        )
  limit 1;
  if v_bad is not null then
    raise exception 'company % is missing its system Owner and/or Member role', v_bad;
  end if;

  select r.company_id into v_bad
  from public.roles r
  join public.role_permissions rp on rp.role_id = r.id
  where r.is_system and lower(r.name) = 'owner'
  group by r.id
  having bool_and(rp.permission_key = '*' and rp.effect = 'allow') is not true
  limit 1;
  if v_bad is not null then
    raise exception 'system Owner in company % does not hold exactly `*` / allow', v_bad;
  end if;

  select r.company_id into v_bad
  from public.roles r
  where r.is_system and lower(r.name) = 'member'
    and (select coalesce(array_agg(rp.permission_key order by rp.permission_key), array[]::text[])
         from public.role_permissions rp
         where rp.role_id = r.id and rp.effect = 'allow')
        <> (select array_agg(k order by k) from unnest(expected_member) k)
  limit 1;
  if v_bad is not null then
    raise exception 'system Member in company % drifted from ROLE_PRESETS.member', v_bad;
  end if;
end $$;

-- 3. Live snapshot: what each company is really entitled to and what its active default
--    workspace has activated. The builder-baseline fix only applies on CREATE, so a legacy
--    workspace may legitimately be missing it -- report, do not fail.
select 'company entitlement' as area, cp.company_id,
       count(*) filter (where cp.status = 'installed') as installed,
       count(*) filter (where cp.status = 'disabled') as disabled,
       array_agg(cp.plugin_id order by cp.plugin_id) as plugin_ids
from public.company_plugins cp
group by cp.company_id;

select 'default workspace activation' as area, w.company_id, w.name as workspace,
       (wp.plugin_id is not null) as builder_active
from public.workspaces w
left join public.workspace_plugins wp
  on wp.workspace_id = w.id and wp.plugin_id = 'workspace_builder' and wp.status = 'installed'
where w.is_default and w.status = 'active'
order by w.company_id;

-- 4. The freshest real instance of the contract: the newest company's roles, permission
--    lists, company plugins, and default-workspace plugins.
select 'newest company' as area, c.id as company_id, c.name, c.created_at
from public.companies c
order by c.created_at desc
limit 1;

select 'newest company roles' as area, r.name, r.priority, r.is_system,
       (select array_agg(rp.permission_key order by rp.permission_key)
        from public.role_permissions rp where rp.role_id = r.id) as permission_keys
from public.roles r
where r.company_id = (select id from public.companies order by created_at desc limit 1)
order by r.priority desc, r.name;

select 'newest company plugins' as area, plugin_id, status
from public.company_plugins
where company_id = (select id from public.companies order by created_at desc limit 1)
order by plugin_id;

select 'newest default workspace plugins' as area, w.name as workspace, wp.plugin_id, wp.status
from public.workspaces w
left join public.workspace_plugins wp on wp.workspace_id = w.id
where w.company_id = (select id from public.companies order by created_at desc limit 1)
  and w.is_default
order by wp.plugin_id;

rollback;