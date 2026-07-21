-- Separate the customer company (billing/security tenant) from configurable
-- operational workspaces inside it. The migration is additive and keeps old
-- clients working by assigning omitted workspace ids to the company default.

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  icon_key text not null default 'home',
  color text not null default '#f0b23b',
  status text not null default 'active',
  is_default boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_status_check check (status in ('active', 'archived')),
  constraint workspaces_slug_check check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint workspaces_company_slug_key unique (company_id, slug)
);

create table if not exists public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  status text not null default 'active',
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, profile_id),
  constraint workspace_memberships_status_check check (status in ('active', 'disabled'))
);

create table if not exists public.workspace_plugins (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plugin_id text not null,
  status text not null default 'installed',
  config jsonb not null default '{}'::jsonb,
  installed_by uuid references public.profiles(id) on delete set null,
  installed_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, plugin_id),
  constraint workspace_plugins_status_check check (status in ('installed', 'disabled'))
);

create unique index if not exists workspaces_company_default_key
  on public.workspaces(company_id) where is_default;
create index if not exists workspaces_company_status_idx
  on public.workspaces(company_id, status, name);
create index if not exists workspace_memberships_profile_status_idx
  on public.workspace_memberships(profile_id, status, workspace_id);
create index if not exists workspace_memberships_role_idx
  on public.workspace_memberships(role_id) where role_id is not null;
create index if not exists workspace_plugins_status_idx
  on public.workspace_plugins(workspace_id, status, plugin_id);

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists workspace_memberships_set_updated_at on public.workspace_memberships;
create trigger workspace_memberships_set_updated_at before update on public.workspace_memberships
for each row execute function public.set_updated_at();

drop trigger if exists workspace_plugins_set_updated_at on public.workspace_plugins;
create trigger workspace_plugins_set_updated_at before update on public.workspace_plugins
for each row execute function public.set_updated_at();

-- Every existing company becomes an account with one backward-compatible Main
-- workspace. Existing company identity remains unchanged.
insert into public.workspaces (
  company_id, slug, name, description, icon_key, color, status, is_default, created_by
)
select
  c.id,
  'main',
  'Main',
  'Default workspace created from the existing company data.',
  coalesce(nullif(c.icon_key, ''), 'home'),
  coalesce(nullif(c.color, ''), '#f0b23b'),
  'active',
  true,
  (
    select cm.profile_id
    from public.company_memberships cm
    where cm.company_id = c.id and cm.role = 'owner' and cm.status = 'active'
    order by cm.created_at
    limit 1
  )
from public.companies c
on conflict (company_id, slug) do update
set is_default = true,
    status = 'active',
    updated_at = now();

-- Preserve current access by assigning every active company member to the
-- default workspace. Prefer the person's current custom company role.
insert into public.workspace_memberships (
  workspace_id, profile_id, role_id, status, assigned_by, created_at, updated_at
)
select
  w.id,
  cm.profile_id,
  (
    select ura.role_id
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id and r.company_id = cm.company_id
    where ura.company_id = cm.company_id and ura.profile_id = cm.profile_id
    order by r.priority desc, ura.created_at
    limit 1
  ),
  'active',
  (
    select owner_cm.profile_id
    from public.company_memberships owner_cm
    where owner_cm.company_id = cm.company_id
      and owner_cm.role = 'owner'
      and owner_cm.status = 'active'
    order by owner_cm.created_at
    limit 1
  ),
  cm.created_at,
  now()
from public.company_memberships cm
join public.workspaces w on w.company_id = cm.company_id and w.is_default
where cm.status = 'active'
on conflict (workspace_id, profile_id) do update
set role_id = coalesce(excluded.role_id, public.workspace_memberships.role_id),
    status = 'active',
    updated_at = now();

-- Company plugins are entitlements. Copy their current activation/config into
-- the default workspace, where the per-workspace state now lives.
insert into public.workspace_plugins (
  workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at, created_at, updated_at
)
select
  w.id,
  cp.plugin_id,
  cp.status,
  cp.config,
  cp.installed_by,
  cp.installed_at,
  cp.disabled_at,
  coalesce(cp.installed_at, cp.updated_at, now()),
  cp.updated_at
from public.company_plugins cp
join public.workspaces w on w.company_id = cp.company_id and w.is_default
on conflict (workspace_id, plugin_id) do update
set status = excluded.status,
    config = excluded.config,
    installed_by = excluded.installed_by,
    installed_at = excluded.installed_at,
    disabled_at = excluded.disabled_at,
    updated_at = excluded.updated_at;

-- Add the operational workspace boundary to the complete sales/production
-- chain. Columns are nullable only during this migration's backfill.
alter table public.accounts add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.contacts add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.crm_sites add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.deals add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.activities add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.jobs add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.tasks add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.pipeline_stages add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.underwriting_cases add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.job_files add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.proposal_documents add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;

update public.accounts r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.contacts r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.crm_sites r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.deals r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.activities r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.jobs r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.tasks r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.pipeline_stages r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.underwriting_cases r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.job_files r
set workspace_id = coalesce((select j.workspace_id from public.jobs j where j.id = r.job_id), w.id)
from public.workspaces w
where r.workspace_id is null and w.company_id = r.company_id and w.is_default;
update public.proposal_documents r set workspace_id = w.id from public.workspaces w where r.workspace_id is null and w.company_id = r.company_id and w.is_default;

alter table public.accounts alter column workspace_id set not null;
alter table public.contacts alter column workspace_id set not null;
alter table public.crm_sites alter column workspace_id set not null;
alter table public.deals alter column workspace_id set not null;
alter table public.activities alter column workspace_id set not null;
alter table public.jobs alter column workspace_id set not null;
alter table public.tasks alter column workspace_id set not null;
alter table public.pipeline_stages alter column workspace_id set not null;
alter table public.underwriting_cases alter column workspace_id set not null;
alter table public.job_files alter column workspace_id set not null;
alter table public.proposal_documents alter column workspace_id set not null;

alter table public.pipeline_stages drop constraint if exists pipeline_stages_company_id_kind_name_key;
create unique index if not exists pipeline_stages_workspace_kind_name_key
  on public.pipeline_stages(workspace_id, kind, name);

create index if not exists accounts_workspace_name_idx on public.accounts(workspace_id, name);
create index if not exists contacts_workspace_stage_idx on public.contacts(workspace_id, stage, updated_at desc);
create index if not exists crm_sites_workspace_idx on public.crm_sites(workspace_id, updated_at desc);
create index if not exists deals_workspace_stage_idx on public.deals(workspace_id, stage, updated_at desc);
create index if not exists activities_workspace_created_idx on public.activities(workspace_id, created_at desc);
create index if not exists jobs_workspace_stage_idx on public.jobs(workspace_id, stage, updated_at desc);
create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status, due);
create index if not exists pipeline_stages_workspace_position_idx on public.pipeline_stages(workspace_id, kind, position);
create index if not exists underwriting_cases_workspace_idx on public.underwriting_cases(workspace_id, updated_at desc);
create index if not exists job_files_workspace_idx on public.job_files(workspace_id, created_at desc);
create index if not exists proposal_documents_workspace_idx on public.proposal_documents(workspace_id, updated_at desc);

-- Private membership helpers avoid RLS recursion. They are safe to call from
-- policies because they only answer questions about the current auth.uid().
create or replace function app_private.is_company_admin(target_company_id text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  );
$$;

create or replace function app_private.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.workspaces w
    join public.company_memberships cm on cm.company_id = w.company_id
    where w.id = target_workspace_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer')
  );
$$;

create or replace function app_private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.workspaces w
    join public.company_memberships cm on cm.company_id = w.company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
    left join public.workspace_memberships wm on wm.workspace_id = w.id
      and wm.profile_id = cm.profile_id
      and wm.status = 'active'
    where w.id = target_workspace_id
      and w.status = 'active'
      and (
        cm.role in ('owner', 'admin', 'developer')
        or wm.profile_id is not null
      )
  );
$$;

create or replace function app_private.workspace_has_plugin(target_workspace_id uuid, target_plugin_id text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspaces w
    join public.company_plugins cp on cp.company_id = w.company_id
      and cp.plugin_id = target_plugin_id
      and cp.status = 'installed'
    join public.workspace_plugins wp on wp.workspace_id = w.id
      and wp.plugin_id = cp.plugin_id
      and wp.status = 'installed'
    where w.id = target_workspace_id
      and w.status = 'active'
  );
$$;

create or replace function app_private.workspace_permission_plugin_available(
  target_workspace_id uuid,
  permission text
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select case
    when permission like 'crm.%' then
      app_private.workspace_has_plugin(target_workspace_id, 'crm')
      or app_private.workspace_has_plugin(target_workspace_id, 'crm_2')
    when permission like 'underwriter.%' then app_private.workspace_has_plugin(target_workspace_id, 'underwriter')
    when permission like 'files.%' then app_private.workspace_has_plugin(target_workspace_id, 'files')
    when permission like 'forms.%' then app_private.workspace_has_plugin(target_workspace_id, 'forms')
    when permission like 'finance.%' then app_private.workspace_has_plugin(target_workspace_id, 'finance')
    when permission like 'price_book.%' then app_private.workspace_has_plugin(target_workspace_id, 'price_book')
    when permission like 'client_portals.%' then app_private.workspace_has_plugin(target_workspace_id, 'client_portal')
    when permission like 'messages.%' then app_private.workspace_has_plugin(target_workspace_id, 'messages')
    when permission like 'calendar.%' then app_private.workspace_has_plugin(target_workspace_id, 'calendar')
    when permission in ('time.track', 'clock.manage') then app_private.workspace_has_plugin(target_workspace_id, 'time_clock')
    when permission like 'approvals.%' then app_private.workspace_has_plugin(target_workspace_id, 'approvals')
    when permission = 'team.view' then app_private.workspace_has_plugin(target_workspace_id, 'reporting')
    else true
  end;
$$;

create or replace function app_private.has_workspace_permission(
  target_workspace_id uuid,
  permission text
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  with workspace_company as (
    select w.company_id
    from public.workspaces w
    where w.id = target_workspace_id and w.status = 'active'
  ), membership as (
    select cm.company_id, cm.role as company_role
    from public.company_memberships cm
    join workspace_company wc on wc.company_id = cm.company_id
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
    limit 1
  ), workspace_access as (
    select wm.role_id
    from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = (select auth.uid())
      and wm.status = 'active'
    limit 1
  ), assigned_roles as (
    select wa.role_id from workspace_access wa where wa.role_id is not null
    union
    select ura.role_id
    from public.user_role_assignments ura
    join membership m on m.company_id = ura.company_id
    where ura.profile_id = (select auth.uid())
      and not exists (select 1 from workspace_access wa where wa.role_id is not null)
  ), effects as (
    select rp.effect
    from assigned_roles ar
    join public.role_permissions rp on rp.role_id = ar.role_id
    where rp.permission_key in (permission, '*')
  )
  select
    (select auth.uid()) is not null
    and app_private.workspace_permission_plugin_available(target_workspace_id, permission)
    and (
      exists (select 1 from membership where company_role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and exists (select 1 from workspace_access)
        and not exists (select 1 from effects where effect = 'deny')
        and (
          exists (select 1 from effects where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$$;

grant usage on schema app_private to authenticated;
revoke all on function app_private.is_workspace_admin(uuid) from public, anon;
revoke all on function app_private.is_workspace_member(uuid) from public, anon;
revoke all on function app_private.workspace_has_plugin(uuid, text) from public, anon;
revoke all on function app_private.workspace_permission_plugin_available(uuid, text) from public, anon;
revoke all on function app_private.has_workspace_permission(uuid, text) from public, anon;
grant execute on function app_private.is_workspace_admin(uuid) to authenticated;
grant execute on function app_private.is_workspace_member(uuid) to authenticated;
grant execute on function app_private.workspace_has_plugin(uuid, text) to authenticated;
grant execute on function app_private.workspace_permission_plugin_available(uuid, text) to authenticated;
grant execute on function app_private.has_workspace_permission(uuid, text) to authenticated;

-- Old clients do not send workspace_id. Assign their writes to the default
-- workspace, while the new client supplies the selected workspace explicitly.
create or replace function app_private.assign_default_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.workspace_id is null then
    select w.id into new.workspace_id
    from public.workspaces w
    where w.company_id = new.company_id and w.is_default and w.status = 'active'
    limit 1;
  end if;
  if new.workspace_id is null then
    raise exception 'No active default workspace exists for company';
  end if;
  return new;
end;
$$;

revoke all on function app_private.assign_default_workspace() from public, anon, authenticated;

drop trigger if exists workspace_default_on_insert on public.accounts;
create trigger workspace_default_on_insert before insert on public.accounts for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.contacts;
create trigger workspace_default_on_insert before insert on public.contacts for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.crm_sites;
create trigger workspace_default_on_insert before insert on public.crm_sites for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.deals;
create trigger workspace_default_on_insert before insert on public.deals for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.activities;
create trigger workspace_default_on_insert before insert on public.activities for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.jobs;
create trigger workspace_default_on_insert before insert on public.jobs for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.tasks;
create trigger workspace_default_on_insert before insert on public.tasks for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.pipeline_stages;
create trigger workspace_default_on_insert before insert on public.pipeline_stages for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.underwriting_cases;
create trigger workspace_default_on_insert before insert on public.underwriting_cases for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.job_files;
create trigger workspace_default_on_insert before insert on public.job_files for each row execute function app_private.assign_default_workspace();
drop trigger if exists workspace_default_on_insert on public.proposal_documents;
create trigger workspace_default_on_insert before insert on public.proposal_documents for each row execute function app_private.assign_default_workspace();

create or replace function app_private.validate_workspace_membership_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_company text;
  role_company text;
begin
  if new.role_id is null then return new; end if;
  select w.company_id into workspace_company from public.workspaces w where w.id = new.workspace_id;
  select r.company_id into role_company from public.roles r where r.id = new.role_id;
  if workspace_company is null or role_company is null or workspace_company <> role_company then
    raise exception 'Workspace role must belong to the same company';
  end if;
  return new;
end;
$$;

revoke all on function app_private.validate_workspace_membership_role() from public, anon, authenticated;
drop trigger if exists workspace_membership_role_matches on public.workspace_memberships;
create constraint trigger workspace_membership_role_matches
after insert or update of workspace_id, role_id on public.workspace_memberships
deferrable initially immediate for each row execute function app_private.validate_workspace_membership_role();

create or replace function app_private.protect_workspace_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.company_id <> old.company_id then raise exception 'Workspace company cannot be changed'; end if;
  if old.is_default and (not new.is_default or new.status <> 'active') then
    raise exception 'Default workspace cannot be archived';
  end if;
  return new;
end;
$$;

revoke all on function app_private.protect_workspace_identity() from public, anon, authenticated;
drop trigger if exists workspaces_protect_identity on public.workspaces;
create trigger workspaces_protect_identity before update on public.workspaces
for each row execute function app_private.protect_workspace_identity();

-- Validate that the workspace belongs to the row's company and that linked CRM
-- records stay in that same workspace. This is defense in depth over the UI.
create or replace function app_private.validate_workspace_record_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.workspaces w
    where w.id = new.workspace_id and w.company_id = new.company_id
  ) then
    raise exception 'Workspace does not belong to record company';
  end if;

  if tg_table_name = 'contacts' then
    if new.account_id is not null and not exists (select 1 from public.accounts x where x.id = new.account_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked account belongs to another workspace';
    end if;
  elsif tg_table_name = 'crm_sites' then
    if new.contact_id is not null and not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked contact belongs to another workspace';
    end if;
    if new.account_id is not null and not exists (select 1 from public.accounts x where x.id = new.account_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked account belongs to another workspace';
    end if;
  elsif tg_table_name = 'deals' then
    if new.account_id is not null and not exists (select 1 from public.accounts x where x.id = new.account_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked account belongs to another workspace';
    end if;
    if new.primary_contact_id is not null and not exists (select 1 from public.contacts x where x.id = new.primary_contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked contact belongs to another workspace';
    end if;
    if new.site_id is not null and not exists (select 1 from public.crm_sites x where x.id = new.site_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked site belongs to another workspace';
    end if;
    if new.job_id is not null and not exists (select 1 from public.jobs x where x.id = new.job_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked job belongs to another workspace';
    end if;
  elsif tg_table_name = 'activities' then
    if new.account_id is not null and not exists (select 1 from public.accounts x where x.id = new.account_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked account belongs to another workspace';
    end if;
    if new.contact_id is not null and not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked contact belongs to another workspace';
    end if;
    if new.site_id is not null and not exists (select 1 from public.crm_sites x where x.id = new.site_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked site belongs to another workspace';
    end if;
    if new.deal_id is not null and not exists (select 1 from public.deals x where x.id = new.deal_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked quote belongs to another workspace';
    end if;
    if new.job_id is not null and not exists (select 1 from public.jobs x where x.id = new.job_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked job belongs to another workspace';
    end if;
  elsif tg_table_name = 'jobs' then
    if new.account_id is not null and not exists (select 1 from public.accounts x where x.id = new.account_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked account belongs to another workspace';
    end if;
    if new.contact_id is not null and not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked contact belongs to another workspace';
    end if;
    if new.deal_id is not null and not exists (select 1 from public.deals x where x.id = new.deal_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked quote belongs to another workspace';
    end if;
    if new.site_id is not null and not exists (select 1 from public.crm_sites x where x.id = new.site_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked site belongs to another workspace';
    end if;
  elsif tg_table_name = 'tasks' then
    if nullif(new.project_id, '') is not null and not exists (select 1 from public.jobs x where x.id::text = new.project_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked job belongs to another workspace';
    end if;
    if nullif(new.contact_id, '') is not null and not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked contact belongs to another workspace';
    end if;
    if nullif(new.deal_id, '') is not null and not exists (select 1 from public.deals x where x.id = new.deal_id and x.workspace_id = new.workspace_id) then
      raise exception 'Linked quote belongs to another workspace';
    end if;
  elsif tg_table_name = 'underwriting_cases' then
    if not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Underwriting contact belongs to another workspace';
    end if;
  elsif tg_table_name = 'job_files' then
    if new.job_id is not null and not exists (select 1 from public.jobs x where x.id = new.job_id and x.workspace_id = new.workspace_id) then
      raise exception 'File job belongs to another workspace';
    end if;
  elsif tg_table_name = 'proposal_documents' then
    if new.contact_id is not null and new.contact_id <> '' and not exists (select 1 from public.contacts x where x.id = new.contact_id and x.workspace_id = new.workspace_id) then
      raise exception 'Proposal contact belongs to another workspace';
    end if;
    if new.deal_id is not null and new.deal_id <> '' and not exists (select 1 from public.deals x where x.id = new.deal_id and x.workspace_id = new.workspace_id) then
      raise exception 'Proposal quote belongs to another workspace';
    end if;
    if new.job_id is not null and new.job_id <> '' and not exists (select 1 from public.jobs x where x.id::text = new.job_id and x.workspace_id = new.workspace_id) then
      raise exception 'Proposal job belongs to another workspace';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function app_private.validate_workspace_record_links() from public, anon, authenticated;

drop trigger if exists workspace_record_links_match on public.accounts;
create constraint trigger workspace_record_links_match after insert or update on public.accounts deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.contacts;
create constraint trigger workspace_record_links_match after insert or update on public.contacts deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.crm_sites;
create constraint trigger workspace_record_links_match after insert or update on public.crm_sites deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.deals;
create constraint trigger workspace_record_links_match after insert or update on public.deals deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.activities;
create constraint trigger workspace_record_links_match after insert or update on public.activities deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.jobs;
create constraint trigger workspace_record_links_match after insert or update on public.jobs deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.tasks;
create constraint trigger workspace_record_links_match after insert or update on public.tasks deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.pipeline_stages;
create constraint trigger workspace_record_links_match after insert or update on public.pipeline_stages deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.underwriting_cases;
create constraint trigger workspace_record_links_match after insert or update on public.underwriting_cases deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.job_files;
create constraint trigger workspace_record_links_match after insert or update on public.job_files deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();
drop trigger if exists workspace_record_links_match on public.proposal_documents;
create constraint trigger workspace_record_links_match after insert or update on public.proposal_documents deferrable initially immediate for each row execute function app_private.validate_workspace_record_links();

alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_plugins enable row level security;

drop policy if exists "workspace users read workspaces" on public.workspaces;
create policy "workspace users read workspaces" on public.workspaces
for select to authenticated
using (app_private.is_workspace_member(id) or app_private.is_workspace_admin(id));

drop policy if exists "company admins create workspaces" on public.workspaces;
create policy "company admins create workspaces" on public.workspaces
for insert to authenticated
with check (app_private.is_company_admin(company_id));

drop policy if exists "workspace admins update workspaces" on public.workspaces;
create policy "workspace admins update workspaces" on public.workspaces
for update to authenticated
using (app_private.is_workspace_admin(id))
with check (app_private.is_workspace_admin(id));

drop policy if exists "workspace users read memberships" on public.workspace_memberships;
create policy "workspace users read memberships" on public.workspace_memberships
for select to authenticated
using (app_private.is_workspace_member(workspace_id) or app_private.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins manage memberships" on public.workspace_memberships;
create policy "workspace admins manage memberships" on public.workspace_memberships
for all to authenticated
using (app_private.is_workspace_admin(workspace_id))
with check (app_private.is_workspace_admin(workspace_id));

drop policy if exists "workspace users read plugins" on public.workspace_plugins;
create policy "workspace users read plugins" on public.workspace_plugins
for select to authenticated
using (app_private.is_workspace_member(workspace_id) or app_private.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins manage plugins" on public.workspace_plugins;
create policy "workspace admins manage plugins" on public.workspace_plugins
for all to authenticated
using (app_private.is_workspace_admin(workspace_id))
with check (app_private.is_workspace_admin(workspace_id));

-- Replace older company/profile-based policies for the workspace-scoped sales
-- and production chain. The migration backfilled access before this point.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'accounts', 'contacts', 'crm_sites', 'deals', 'activities', 'jobs', 'tasks',
        'pipeline_stages', 'underwriting_cases', 'job_files', 'proposal_documents'
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end;
$$;

create policy "accounts workspace read" on public.accounts for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "accounts workspace insert" on public.accounts for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "accounts workspace update" on public.accounts for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "accounts workspace delete" on public.accounts for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

create policy "contacts workspace read" on public.contacts for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "contacts workspace insert" on public.contacts for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "contacts workspace update" on public.contacts for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "contacts workspace delete" on public.contacts for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

create policy "crm_sites workspace read" on public.crm_sites for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "crm_sites workspace insert" on public.crm_sites for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "crm_sites workspace update" on public.crm_sites for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "crm_sites workspace delete" on public.crm_sites for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

create policy "deals workspace read" on public.deals for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "deals workspace insert" on public.deals for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "deals workspace update" on public.deals for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "deals workspace delete" on public.deals for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

create policy "activities workspace read" on public.activities for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "activities workspace insert" on public.activities for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "activities workspace update" on public.activities for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "activities workspace delete" on public.activities for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

create policy "jobs workspace read" on public.jobs for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'jobs.view'));
create policy "jobs workspace insert" on public.jobs for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'jobs.manage'));
create policy "jobs workspace update" on public.jobs for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'jobs.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'jobs.manage'));
create policy "jobs workspace delete" on public.jobs for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'jobs.manage'));

create policy "tasks workspace read" on public.tasks for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'tasks.view'));
create policy "tasks workspace insert" on public.tasks for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'tasks.manage'));
create policy "tasks workspace update" on public.tasks for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'tasks.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'tasks.manage'));
create policy "tasks workspace delete" on public.tasks for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'tasks.manage'));

create policy "pipeline_stages workspace read" on public.pipeline_stages for select to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, case when kind = 'jobs' then 'jobs.view' else 'crm.view' end)
);
create policy "pipeline_stages workspace insert" on public.pipeline_stages for insert to authenticated
with check (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, case when kind = 'jobs' then 'jobs.manage' else 'crm.manage' end)
);
create policy "pipeline_stages workspace update" on public.pipeline_stages for update to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, case when kind = 'jobs' then 'jobs.manage' else 'crm.manage' end)
)
with check (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, case when kind = 'jobs' then 'jobs.manage' else 'crm.manage' end)
);
create policy "pipeline_stages workspace delete" on public.pipeline_stages for delete to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, case when kind = 'jobs' then 'jobs.manage' else 'crm.manage' end)
);

create policy "underwriting_cases workspace read" on public.underwriting_cases for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'underwriter.view'));
create policy "underwriting_cases workspace insert" on public.underwriting_cases for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'underwriter.manage'));
create policy "underwriting_cases workspace update" on public.underwriting_cases for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'underwriter.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'underwriter.manage'));
create policy "underwriting_cases workspace delete" on public.underwriting_cases for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'underwriter.manage'));

create policy "job_files workspace read" on public.job_files for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'files.view'));
create policy "job_files workspace insert" on public.job_files for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'files.manage'));
create policy "job_files workspace update" on public.job_files for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'files.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'files.manage'));
create policy "job_files workspace delete" on public.job_files for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'files.manage'));

create policy "proposal_documents workspace read" on public.proposal_documents for select to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.view'));
create policy "proposal_documents workspace insert" on public.proposal_documents for insert to authenticated
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "proposal_documents workspace update" on public.proposal_documents for update to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
with check (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));
create policy "proposal_documents workspace delete" on public.proposal_documents for delete to authenticated
using (app_private.is_workspace_member(workspace_id) and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

grant select, insert, update, delete on public.workspaces, public.workspace_memberships, public.workspace_plugins to authenticated;

create or replace function public.create_operational_workspace(
  target_company_id text,
  workspace_name text,
  preset_code text default 'generic',
  icon_key text default 'home'
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
  new_workspace_id uuid;
  default_workspace_id uuid;
  owner_role_id uuid;
  desired_plugins text[];
  copied_stage_count integer;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_company_admin(target_company_id) then raise exception 'Workspace admin access required'; end if;
  if clean_name = '' then raise exception 'Workspace name is required'; end if;

  clean_slug := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if clean_slug = '' then clean_slug := 'workspace'; end if;
  while exists (select 1 from public.workspaces w where w.company_id = target_company_id and w.slug = clean_slug) loop
    clean_slug := left(clean_slug, 48) || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  select w.id into default_workspace_id
  from public.workspaces w
  where w.company_id = target_company_id and w.is_default
  limit 1;

  insert into public.workspaces (
    company_id, slug, name, icon_key, color, status, is_default, created_by
  )
  select
    c.id, clean_slug, left(clean_name, 120), coalesce(nullif(clean_icon, ''), 'home'),
    coalesce(nullif(c.color, ''), '#f0b23b'), 'active', false, (select auth.uid())
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
  set role_id = excluded.role_id, status = 'active', assigned_by = excluded.assigned_by, updated_at = now();

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
  set status = 'installed', config = excluded.config, installed_by = excluded.installed_by,
      installed_at = coalesce(public.workspace_plugins.installed_at, now()), disabled_at = null, updated_at = now();

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
    target_company_id, (select auth.uid()), 'workspace.created', 'workspace', new_workspace_id::text,
    jsonb_build_object('workspace_id', new_workspace_id, 'name', clean_name, 'preset_code', lower(btrim(coalesce(preset_code, 'generic'))))
  );

  return new_workspace_id;
end;
$$;

create or replace function public.update_operational_workspace(
  target_workspace_id uuid,
  workspace_name text,
  workspace_description text,
  icon_key text,
  next_status text
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
  clean_status text := lower(btrim(coalesce(next_status, 'active')));
  saved public.workspaces%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_workspace_admin(target_workspace_id) then raise exception 'Workspace admin access required'; end if;
  if clean_name = '' then raise exception 'Workspace name is required'; end if;
  if clean_status not in ('active', 'archived') then raise exception 'Unsupported workspace status'; end if;

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
      status = clean_status,
      updated_at = now()
  where w.id = target_workspace_id
  returning * into saved;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    saved.company_id, (select auth.uid()), 'workspace.updated', 'workspace', saved.id::text,
    jsonb_build_object('workspace_id', saved.id, 'name', saved.name, 'status', saved.status)
  );
  return saved;
end;
$$;

create or replace function public.set_workspace_member(
  target_workspace_id uuid,
  target_profile_id uuid,
  target_role_id uuid,
  next_status text
)
returns public.workspace_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_status text := lower(btrim(coalesce(next_status, 'active')));
  target_company_id text;
  saved public.workspace_memberships%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_workspace_admin(target_workspace_id) then raise exception 'Workspace admin access required'; end if;
  if clean_status not in ('active', 'disabled') then raise exception 'Unsupported workspace membership status'; end if;

  select w.company_id into target_company_id from public.workspaces w where w.id = target_workspace_id;
  if not exists (
    select 1 from public.company_memberships cm
    where cm.company_id = target_company_id and cm.profile_id = target_profile_id and cm.status = 'active'
  ) then
    raise exception 'User must be an active company member';
  end if;
  if target_role_id is not null and not exists (
    select 1 from public.roles r where r.id = target_role_id and r.company_id = target_company_id
  ) then
    raise exception 'Workspace role must belong to the same company';
  end if;

  insert into public.workspace_memberships (
    workspace_id, profile_id, role_id, status, assigned_by
  ) values (
    target_workspace_id, target_profile_id, target_role_id, clean_status, (select auth.uid())
  )
  on conflict (workspace_id, profile_id) do update
  set role_id = excluded.role_id,
      status = excluded.status,
      assigned_by = excluded.assigned_by,
      updated_at = now()
  returning * into saved;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id, (select auth.uid()), 'workspace.member_changed', 'workspace_membership',
    target_workspace_id::text || ':' || target_profile_id::text,
    jsonb_build_object('workspace_id', target_workspace_id, 'profile_id', target_profile_id, 'role_id', target_role_id, 'status', clean_status)
  );
  return saved;
end;
$$;

create or replace function public.set_workspace_plugin(
  target_workspace_id uuid,
  target_plugin_id text,
  next_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_plugin text := lower(btrim(coalesce(target_plugin_id, '')));
  clean_status text := lower(btrim(coalesce(next_status, '')));
  target_company_id text;
  entitlement_config jsonb;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.has_workspace_permission(target_workspace_id, 'plugins.manage') then raise exception 'Workspace plugin manager access required'; end if;
  if clean_plugin = '' then raise exception 'Plugin is required'; end if;
  if clean_status not in ('installed', 'disabled') then raise exception 'Unsupported plugin status'; end if;

  select w.company_id into target_company_id from public.workspaces w where w.id = target_workspace_id;
  select cp.config into entitlement_config
  from public.company_plugins cp
  where cp.company_id = target_company_id and cp.plugin_id = clean_plugin and cp.status = 'installed';
  if clean_status = 'installed' and entitlement_config is null then
    raise exception 'Company plugin entitlement required';
  end if;

  if clean_status = 'installed' and clean_plugin in ('crm', 'crm_2') then
    update public.workspace_plugins wp
    set status = 'disabled', disabled_at = now(), updated_at = now()
    where wp.workspace_id = target_workspace_id
      and wp.plugin_id in ('crm', 'crm_2')
      and wp.plugin_id <> clean_plugin
      and wp.status = 'installed';
  end if;

  insert into public.workspace_plugins (
    workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  ) values (
    target_workspace_id, clean_plugin, clean_status, coalesce(entitlement_config, '{}'::jsonb),
    case when clean_status = 'installed' then (select auth.uid()) else null end,
    case when clean_status = 'installed' then now() else null end,
    case when clean_status = 'disabled' then now() else null end
  )
  on conflict (workspace_id, plugin_id) do update
  set status = excluded.status,
      config = case when excluded.status = 'installed' then excluded.config else public.workspace_plugins.config end,
      installed_by = case when excluded.status = 'installed' then (select auth.uid()) else public.workspace_plugins.installed_by end,
      installed_at = case when excluded.status = 'installed' then coalesce(public.workspace_plugins.installed_at, now()) else public.workspace_plugins.installed_at end,
      disabled_at = case when excluded.status = 'disabled' then now() else null end,
      updated_at = now();

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id, (select auth.uid()), 'workspace.plugin_changed', 'workspace_plugin',
    target_workspace_id::text || ':' || clean_plugin,
    jsonb_build_object('workspace_id', target_workspace_id, 'plugin_id', clean_plugin, 'status', clean_status)
  );
  return clean_status;
end;
$$;

create or replace function public.apply_workspace_plugin_preset(
  target_workspace_id uuid,
  preset_code text
)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_company_id text;
  desired_plugins text[] := app_private.plugin_ids_for_preset(preset_code);
  installed_plugins text[];
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.has_workspace_permission(target_workspace_id, 'plugins.manage') then raise exception 'Workspace plugin manager access required'; end if;
  select w.company_id into target_company_id from public.workspaces w where w.id = target_workspace_id;

  update public.workspace_plugins wp
  set status = 'disabled', disabled_at = now(), updated_at = now()
  where wp.workspace_id = target_workspace_id
    and wp.status = 'installed'
    and not (wp.plugin_id = any(desired_plugins));

  insert into public.workspace_plugins (
    workspace_id, plugin_id, status, config, installed_by, installed_at, disabled_at
  )
  select target_workspace_id, cp.plugin_id, 'installed', cp.config, (select auth.uid()), now(), null
  from public.company_plugins cp
  where cp.company_id = target_company_id
    and cp.status = 'installed'
    and cp.plugin_id = any(desired_plugins)
  on conflict (workspace_id, plugin_id) do update
  set status = 'installed', config = excluded.config, installed_by = excluded.installed_by,
      installed_at = coalesce(public.workspace_plugins.installed_at, now()), disabled_at = null, updated_at = now();

  select coalesce(array_agg(wp.plugin_id order by wp.plugin_id), '{}'::text[]) into installed_plugins
  from public.workspace_plugins wp
  where wp.workspace_id = target_workspace_id and wp.status = 'installed';
  return installed_plugins;
end;
$$;

create or replace function public.replace_workspace_pipeline_stages(
  p_workspace_id uuid,
  p_kind text,
  p_stages jsonb,
  p_rename_map jsonb default '{}'::jsonb
)
returns setof public.pipeline_stages
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_company_id text;
  required_permission text;
  stage_count integer;
  unique_count integer;
  in_use integer;
  target_table text;
  old_name text;
  new_name text;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not app_private.is_workspace_member(p_workspace_id) then raise exception 'Workspace access required'; end if;
  if p_kind not in ('jobs', 'contacts', 'deals') then raise exception 'Invalid pipeline kind'; end if;
  required_permission := case when p_kind = 'jobs' then 'jobs.manage' else 'crm.manage' end;
  if not app_private.has_workspace_permission(p_workspace_id, required_permission) then raise exception 'Workspace admin access required'; end if;
  if jsonb_typeof(p_stages) <> 'array' then raise exception 'Stages must be an array'; end if;
  stage_count := jsonb_array_length(p_stages);
  if stage_count < 1 or stage_count > 50 then raise exception 'Pipeline must have between 1 and 50 stages'; end if;
  select count(distinct lower(btrim(stage->>'name'))) into unique_count
  from jsonb_array_elements(p_stages) stage
  where nullif(btrim(stage->>'name'), '') is not null;
  if unique_count <> stage_count then raise exception 'Pipeline stage names must be non-empty and unique'; end if;

  select w.company_id into target_company_id from public.workspaces w where w.id = p_workspace_id;
  target_table := case p_kind when 'contacts' then 'contacts' when 'deals' then 'deals' else 'jobs' end;

  for old_name in
    select existing.name
    from public.pipeline_stages existing
    where existing.workspace_id = p_workspace_id and existing.kind = p_kind
      and not exists (
        select 1 from jsonb_array_elements(p_stages) stage
        where lower(btrim(stage->>'name')) = lower(btrim(existing.name))
      )
      and nullif(btrim(coalesce(p_rename_map->>existing.name, '')), '') is null
  loop
    execute format('select count(*) from public.%I where workspace_id = $1 and stage = $2', target_table)
      into in_use using p_workspace_id, old_name;
    if in_use > 0 then raise exception 'Pipeline stage is still in use: %', old_name; end if;
  end loop;

  delete from public.pipeline_stages where workspace_id = p_workspace_id and kind = p_kind;
  insert into public.pipeline_stages (workspace_id, company_id, kind, name, color, position)
  select p_workspace_id, target_company_id, p_kind, left(btrim(stage->>'name'), 100),
         case when coalesce(stage->>'color', '') ~ '^#[0-9A-Fa-f]{3,8}$' then stage->>'color' else '#9aa0a8' end,
         ordinality - 1
  from jsonb_array_elements(p_stages) with ordinality as rows(stage, ordinality);

  for old_name, new_name in select key, value from jsonb_each_text(coalesce(p_rename_map, '{}'::jsonb))
  loop
    if nullif(btrim(old_name), '') is not null and nullif(btrim(new_name), '') is not null then
      execute format('update public.%I set stage = $1, updated_at = now() where workspace_id = $2 and stage = $3', target_table)
        using new_name, p_workspace_id, old_name;
    end if;
  end loop;

  return query
  select * from public.pipeline_stages ps
  where ps.workspace_id = p_workspace_id and ps.kind = p_kind
  order by ps.position;
end;
$$;

-- Backward-compatible company-scoped entry point: old clients edit only the
-- default workspace instead of touching sibling workspaces.
create or replace function public.replace_pipeline_stages(
  p_company_id text,
  p_kind text,
  p_stages jsonb,
  p_rename_map jsonb default '{}'::jsonb
)
returns setof public.pipeline_stages
language plpgsql
security definer
set search_path = ''
as $$
declare
  default_workspace_id uuid;
begin
  select w.id into default_workspace_id
  from public.workspaces w
  where w.company_id = p_company_id and w.is_default and w.status = 'active'
  limit 1;
  if default_workspace_id is null then raise exception 'No active default workspace exists for company'; end if;
  return query select * from public.replace_workspace_pipeline_stages(default_workspace_id, p_kind, p_stages, p_rename_map);
end;
$$;

revoke all on function public.create_operational_workspace(text, text, text, text) from public, anon;
revoke all on function public.update_operational_workspace(uuid, text, text, text, text) from public, anon;
revoke all on function public.set_workspace_member(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.set_workspace_plugin(uuid, text, text) from public, anon;
revoke all on function public.apply_workspace_plugin_preset(uuid, text) from public, anon;
revoke all on function public.replace_workspace_pipeline_stages(uuid, text, jsonb, jsonb) from public, anon;
revoke all on function public.replace_pipeline_stages(text, text, jsonb, jsonb) from public, anon;
grant execute on function public.create_operational_workspace(text, text, text, text) to authenticated;
grant execute on function public.update_operational_workspace(uuid, text, text, text, text) to authenticated;
grant execute on function public.set_workspace_member(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.set_workspace_plugin(uuid, text, text) to authenticated;
grant execute on function public.apply_workspace_plugin_preset(uuid, text) to authenticated;
grant execute on function public.replace_workspace_pipeline_stages(uuid, text, jsonb, jsonb) to authenticated;
grant execute on function public.replace_pipeline_stages(text, text, jsonb, jsonb) to authenticated;
