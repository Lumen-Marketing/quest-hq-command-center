-- Two things, both about roles.
--
-- 1. A NEW COMPANY GETS ONE ROLE, NOT TWO.
--
--    create_company_workspace() seeded Owner (`*`) and stopped. Every company in production
--    proves it: ten companies, ten Owner roles, and exactly one Member -- hand-made, in one
--    company, by somebody who noticed. So the first person invited to a brand-new workspace
--    had nothing to be assigned except Owner, which is how a "worker" ends up holding `*`.
--
--    Both defaults are seeded now, from one place, and the Member permission list is the
--    product's own ROLE_PRESETS.member from src/main.js verbatim so the two cannot drift.
--
-- 2. roles.manage WAS A CLIENT-ONLY IDEA.
--
--    The interface checked can('roles.manage'), but the policies on roles and role_permissions
--    checked is_company_admin() -- membership RANK. So the permission could be granted and
--    changed nothing, while an admin could edit roles whether or not they held it. The
--    policies consult the permission now. has_company_permission() still answers true for
--    owner/admin/developer by rank, so nobody loses access today; what changes is that
--    granting roles.manage to a custom role finally does something.
--
--    Which opens an escalation: a role holding roles.manage could grant itself `*`. Two
--    triggers close it -- only an OWNER may hand out `*`, and only an OWNER may alter a
--    system role. Everyone else can build and edit ordinary roles, which is the point.

create or replace function app_private.seed_company_default_roles(
  target_company_id text,
  actor_id uuid default null
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  member_role_id uuid;
  owner_role_id uuid;
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
end;
$$;

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

  if clean_preset not in ('roofing', 'construction', 'generic') then
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
  if base_id = '' then
    base_id := 'company';
  end if;

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

  -- Owner AND Member, from the one helper, so a new workspace has something to assign an
  -- invited person other than `*`.
  perform app_private.seed_company_default_roles(v_company_id, auth.uid());

  select id into owner_role_id
  from public.roles
  where company_id = v_company_id and lower(name) = 'owner'
  limit 1;

  insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
  values (v_company_id, owner_profile_id, owner_role_id, auth.uid())
  on conflict do nothing;

  foreach desired_plugin_id in array desired_plugins loop
    insert into public.company_plugins (company_id, plugin_id, status, installed_by, installed_at, disabled_at, updated_at)
    values (v_company_id, desired_plugin_id, 'installed', auth.uid(), now(), null, now())
    on conflict (company_id, plugin_id) do nothing;
  end loop;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    v_company_id, auth.uid(), 'company.created', 'company', v_company_id,
    jsonb_build_object(
      'name', clean_name, 'access_status', 'pending_review', 'preset_code', clean_preset,
      'plugin_ids', desired_plugins, 'icon_key', clean_icon,
      'owner_profile_id', owner_profile_id, 'owner_email', clean_owner_email
    )
  );

  return v_company_id;
end;
$function$;

-- Every company that predates this gets the Member role it never had. Idempotent, and it
-- leaves a hand-made Member exactly as its owner configured it.
do $$
declare
  c record;
begin
  for c in select id from public.companies loop
    perform app_private.seed_company_default_roles(c.id, null);
  end loop;
end;
$$;

-- ---- roles.manage becomes real ----------------------------------------------------------

drop policy if exists "admins manage roles" on public.roles;
create policy "role managers manage roles"
on public.roles
for all
to authenticated
using (app_private.has_company_permission(company_id, 'roles.manage'))
with check (app_private.has_company_permission(company_id, 'roles.manage'));

drop policy if exists "admins manage role permissions" on public.role_permissions;
create policy "role managers manage role permissions"
on public.role_permissions
for all
to authenticated
using (exists (
  select 1 from public.roles r
  where r.id = role_permissions.role_id
    and app_private.has_company_permission(r.company_id, 'roles.manage')
))
with check (exists (
  select 1 from public.roles r
  where r.id = role_permissions.role_id
    and app_private.has_company_permission(r.company_id, 'roles.manage')
));

-- Somebody holding roles.manage must not be able to write themselves a `*`. That is the
-- whole permission system undone in one insert.
create or replace function app_private.guard_wildcard_permission()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_company text;
begin
  if new.permission_key <> '*' then
    return new;
  end if;
  select r.company_id into v_company from public.roles r where r.id = new.role_id;
  if v_company is null then
    return new;
  end if;
  if app_private.is_company_owner(v_company) or app_private.is_quest_admin() then
    return new;
  end if;
  raise exception 'Only an Owner can grant full access to a role';
end;
$$;

drop trigger if exists role_permissions_guard_wildcard on public.role_permissions;
create trigger role_permissions_guard_wildcard
before insert or update on public.role_permissions
for each row execute function app_private.guard_wildcard_permission();

-- And must not be able to rewrite the Owner role itself, which amounts to the same thing.
create or replace function app_private.guard_system_role()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_row public.roles%rowtype := coalesce(old, new);
begin
  if not coalesce(v_row.is_system, false) then
    return coalesce(new, old);
  end if;
  if app_private.is_company_owner(v_row.company_id) or app_private.is_quest_admin() then
    return coalesce(new, old);
  end if;
  raise exception 'Only an Owner can change a built-in role';
end;
$$;

drop trigger if exists roles_guard_system on public.roles;
create trigger roles_guard_system
before update or delete on public.roles
for each row execute function app_private.guard_system_role();
