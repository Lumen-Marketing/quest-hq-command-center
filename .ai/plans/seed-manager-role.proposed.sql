-- PROPOSED. Deliberately NOT in supabase/migrations/ yet.
--
-- A file in the migrations folder is a promise that it will be applied on the next run.
-- This one lands in the SAME change as the client drift test that pins it, and both need
-- the database map refreshed from live at the moment of apply. This repository has no live
-- catalog access right now, so it lives here until that access exists, exactly like
-- `20260921215615_maintenance_ledger_names_the_row_delete` waited in `plans/`.
-- Move it to supabase/migrations/<timestamp>_seed_manager_role.sql then.
--
-- Area 1 of docs/superpowers/specs/2026-09-24-roles-and-permissions-enhancement.md.
--
-- NOT YET APPLIED. Reviewed first, then applied (see .ai/plans/seed-manager-role.md for
-- the apply order).
--
-- Additive only: this adds one role and its permission rows per company and recreates the
-- existing seeding helper. It touches no existing row except through the helper's own
-- create-only rules, so it is idempotent and every company that already hand-made a
-- `manager` role keeps it exactly as its owner configured it.

-- Every company predates this, and none of the role seeds can be changed once agreed, so
-- the whole function is replaced with the Owner/Member blocks unchanged and a Manager block
-- added. The Manager keys are ROLE_PERMISSIONS.manager from src/main.js verbatim so the two
-- cannot drift (the test pins exactly that).
create or replace function app_private.seed_company_default_roles(
  target_company_id text,
  actor_id uuid default null
)
returns void
language plpgsql
security definer
-- Empty on purpose. 20260901200003_harden_remaining_app_private_search_paths set this
-- function to `search_path = ''`; `create or replace` would otherwise re-apply whatever is
-- written here, and naming a mutable schema in a SECURITY DEFINER function hands that
-- schema's objects to anyone who can create in it. The body below is already
-- schema-qualified (app_private.* and public.*) so nothing needs to be resolvable, and
-- tests/app-private-search-path-hardening.test.mjs pins that hardening.
set search_path = ''
as $$
declare
  member_role_id uuid;
  owner_role_id uuid;
  manager_role_id uuid;
begin
  select id into owner_role_id
  from public.roles
  where company_id = target_company_id and lower(name) = 'owner'
  limit 1;

  if owner_role_id is null then
    insert into public.roles (company_id, name, color, priority, is_system, created_by)
    values (target_company_id, 'Owner', '#f0b23b', 1000, true, actor_id)
    returning id into owner_role_id;

    insert into public.role_permissions (role_id, permission_key, effect)
    values (owner_role_id, '*', 'allow')
    on conflict (role_id, permission_key) do nothing;
  end if;

  select id into member_role_id
  from public.roles
  where company_id = target_company_id and lower(name) = 'member'
  limit 1;

  -- Only a role this function CREATED gets the default permissions. An earlier version topped
  -- up whatever Member it found, and on the one company that already had a hand-made `member`
  -- it granted seven permissions its owner had not chosen. Those were removed again, by the
  -- backfill's own timestamp rather than by re-deriving the list.
  if member_role_id is null then
    insert into public.roles (company_id, name, color, priority, is_system, created_by)
    values (target_company_id, 'Member', '#64748b', 100, true, actor_id)
    returning id into member_role_id;

    -- ROLE_PRESETS.member from src/main.js, unchanged. A member can do the work and talk
    -- about it; they cannot change who anybody is, what anything costs, or what is installed.
    insert into public.role_permissions (role_id, permission_key, effect)
    select member_role_id, key, 'allow'
    from unnest(array[
      'jobs.view', 'tasks.view', 'tasks.manage', 'files.view', 'forms.view', 'time.track',
      'approvals.view', 'calendar.view', 'users.view', 'messages.view', 'messages.send',
      'messages.attach_files'
    ]) as key
    on conflict (role_id, permission_key) do nothing;
  end if;

  select id into manager_role_id
  from public.roles
  where company_id = target_company_id and lower(name) = 'manager'
  limit 1;

  -- Same create-only rule as Member: a company that already built its own `manager` keeps it
  -- exactly as its owner configured it. Manager is elevated by capability, not by rank -- it
  -- inherits nothing from `owner`/`admin`/`developer`, so its 36 keys are exactly what it does.
  -- is_system = true means only an Owner can edit or delete it, the same guard Member has.
  if manager_role_id is null then
    insert into public.roles (company_id, name, color, priority, is_system, created_by)
    values (target_company_id, 'Manager', '#3b82f6', 500, true, actor_id)
    returning id into manager_role_id;

    -- ROLE_PERMISSIONS.manager from src/main.js, unchanged. A manager does the work a member
    -- does and can also run the operation: jobs, tasks, files, forms, CRM, underwriter,
    -- price book and finance read, team visibility, time, clock, approvals, calendar
    -- (including the team calendar), role and workspace building, client portals. It cannot
    -- change billing or people, and never holds `*`.
    -- `time.track` is Member's own-hours key and `clock.manage` is the separate team-wide
    -- dashboard; a Manager needs both, or it could approve the team's time but not log its
    -- own. The two are distinct modules, not elevations of one another.
    insert into public.role_permissions (role_id, permission_key, effect)
    select manager_role_id, key, 'allow'
    from unnest(array[
      'jobs.view', 'jobs.manage', 'tasks.view', 'tasks.manage', 'files.view', 'files.manage',
      'forms.view', 'forms.manage', 'crm.view', 'crm.manage', 'underwriter.view',
      'underwriter.manage', 'finance.view', 'price_book.view', 'price_book.manage', 'team.view',
      'time.track', 'clock.manage', 'approvals.manage', 'approvals.view', 'calendar.view',
      'calendar.manage', 'calendar.view_team', 'users.view', 'settings.view', 'billing.view',
      'roles.view', 'messages.view', 'messages.send', 'messages.create_group',
      'messages.manage_groups', 'messages.attach_files', 'client_portals.view',
      'client_portals.manage', 'workspaces.view', 'workspaces.manage'
    ]) as key
    on conflict (role_id, permission_key) do nothing;
  end if;
end;
$$;

-- Every company that predates this gets the Manager role it never had. Idempotent, and it
-- leaves a hand-made Manager exactly as its owner configured it.
do $$
declare
  c record;
begin
  for c in select id from public.companies loop
    perform app_private.seed_company_default_roles(c.id, null);
  end loop;
end;
$$;

-- No RLS change: roles are read by members and managed via roles.manage, and Manager is not
-- elevated by rank, so no policy and no permission-alias needs to move. The invite flow offers
-- every non-blocked role from the database, so Manager is offerable the moment it exists.