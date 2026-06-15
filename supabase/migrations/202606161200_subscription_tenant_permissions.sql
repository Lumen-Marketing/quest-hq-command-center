create extension if not exists pgcrypto;

create table if not exists public.company_subscriptions (
  company_id text primary key references public.companies(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trialing',
  plan_code text not null default 'quest_company_300',
  amount_cents integer not null default 30000,
  currency text not null default 'usd',
  current_period_end timestamptz,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  grace_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_subscriptions_status_check check (
    status in ('trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete')
  )
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  color text not null default '#f0b23b',
  priority integer not null default 0,
  is_system boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_key text not null,
  effect text not null default 'allow',
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key),
  constraint role_permissions_effect_check check (effect in ('allow', 'deny'))
);

create table if not exists public.user_role_assignments (
  company_id text not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (company_id, profile_id, role_id)
);

create table if not exists public.resource_acl (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  resource_type text not null,
  resource_id text not null,
  principal_type text not null,
  principal_id text not null,
  permission_key text not null,
  effect text not null default 'allow',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, resource_type, resource_id, principal_type, principal_id, permission_key),
  constraint resource_acl_principal_type_check check (principal_type in ('profile', 'role')),
  constraint resource_acl_effect_check check (effect in ('allow', 'deny'))
);

create table if not exists public.field_permissions (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  resource_type text not null,
  field_key text not null,
  role_id uuid references public.roles(id) on delete cascade,
  visibility text not null default 'visible',
  editable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, resource_type, field_key, role_id),
  constraint field_permissions_visibility_check check (visibility in ('visible', 'masked', 'hidden'))
);

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  token text not null default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending',
  expires_at timestamptz not null default (now() + interval '14 days'),
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email, status),
  constraint company_invites_status_check check (status in ('pending', 'accepted', 'revoked', 'expired'))
);

create table if not exists public.company_join_requests (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  requested_email text,
  status text not null default 'pending',
  message text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, profile_id),
  constraint company_join_requests_status_check check (status in ('pending', 'approved', 'rejected', 'canceled'))
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  company_id text references public.companies(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.company_memberships
  drop constraint if exists company_memberships_role_check;

alter table public.company_memberships
  add constraint company_memberships_role_check check (
    role in ('owner', 'member', 'worker', 'sales', 'supervisor', 'admin', 'developer', 'construction_supervisor')
  );

create index if not exists roles_company_priority_idx on public.roles(company_id, priority desc, name);
create unique index if not exists roles_company_lower_name_idx on public.roles(company_id, lower(name));
create index if not exists role_permissions_permission_idx on public.role_permissions(permission_key);
create index if not exists user_role_assignments_profile_idx on public.user_role_assignments(profile_id);
create index if not exists resource_acl_lookup_idx on public.resource_acl(company_id, resource_type, resource_id, principal_type, principal_id);
create index if not exists field_permissions_lookup_idx on public.field_permissions(company_id, resource_type, field_key);
create index if not exists company_invites_token_idx on public.company_invites(token);
create index if not exists company_join_requests_status_idx on public.company_join_requests(company_id, status);
create index if not exists audit_events_company_created_idx on public.audit_events(company_id, created_at desc);

drop trigger if exists company_subscriptions_set_updated_at on public.company_subscriptions;
create trigger company_subscriptions_set_updated_at before update on public.company_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists resource_acl_set_updated_at on public.resource_acl;
create trigger resource_acl_set_updated_at before update on public.resource_acl
for each row execute function public.set_updated_at();

drop trigger if exists field_permissions_set_updated_at on public.field_permissions;
create trigger field_permissions_set_updated_at before update on public.field_permissions
for each row execute function public.set_updated_at();

drop trigger if exists company_invites_set_updated_at on public.company_invites;
create trigger company_invites_set_updated_at before update on public.company_invites
for each row execute function public.set_updated_at();

drop trigger if exists company_join_requests_set_updated_at on public.company_join_requests;
create trigger company_join_requests_set_updated_at before update on public.company_join_requests
for each row execute function public.set_updated_at();

create schema if not exists app_private;

create or replace function app_private.is_company_member(target_company_id text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function app_private.is_company_admin(target_company_id text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'developer', 'construction_supervisor')
  );
$$;

create or replace function app_private.subscription_allows_access(target_company_id text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select coalesce((
    select cs.status in ('trialing', 'active', 'past_due', 'grace')
      or (cs.grace_ends_at is not null and cs.grace_ends_at > now())
    from public.company_subscriptions cs
    where cs.company_id = target_company_id
  ), true);
$$;

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
    exists (select 1 from membership where role in ('owner', 'developer'))
    or (
      exists (select 1 from membership)
      and not exists (select 1 from assigned where effect = 'deny')
      and (
        exists (select 1 from assigned where effect = 'allow')
        or permission in ('jobs.view', 'tasks.view', 'files.view', 'forms.view', 'users.view')
      )
    );
$$;

grant usage on schema app_private to authenticated;
revoke all on function app_private.is_company_member(text) from public, anon;
revoke all on function app_private.is_company_admin(text) from public, anon;
revoke all on function app_private.subscription_allows_access(text) from public, anon;
revoke all on function app_private.has_company_permission(text, text) from public, anon;
grant execute on function app_private.is_company_member(text) to authenticated;
grant execute on function app_private.is_company_admin(text) to authenticated;
grant execute on function app_private.subscription_allows_access(text) to authenticated;
grant execute on function app_private.has_company_permission(text, text) to authenticated;

create or replace function public.create_company_workspace(company_name text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_name text := trim(coalesce(company_name, ''));
  base_id text;
  company_id text;
  owner_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if clean_name = '' then
    raise exception 'Company name is required';
  end if;

  base_id := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if base_id = '' then
    base_id := 'company';
  end if;

  company_id := base_id;
  while exists (select 1 from public.companies c where c.id = company_id) loop
    company_id := base_id || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  insert into public.companies (id, name, short_name, color)
  values (company_id, clean_name, clean_name, '#f0b23b');

  insert into public.company_subscriptions (company_id, status)
  values (company_id, 'trialing')
  on conflict (company_id) do nothing;

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (company_id, auth.uid(), 'owner', 'active')
  on conflict (company_id, profile_id) do update set role = 'owner', status = 'active', updated_at = now();

  update public.profiles
  set approved = true,
      role = case when role = 'member' then 'admin' else role end,
      company_ids = array(select distinct unnest(coalesce(company_ids, '{}'::text[]) || array[company_id]))
  where id = auth.uid();

  insert into public.roles (company_id, name, color, priority, is_system, created_by)
  values (company_id, 'Owner', '#f0b23b', 1000, true, auth.uid())
  returning id into owner_role_id;

  insert into public.role_permissions (role_id, permission_key, effect)
  values (owner_role_id, '*', 'allow')
  on conflict (role_id, permission_key) do nothing;

  insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
  values (company_id, auth.uid(), owner_role_id, auth.uid())
  on conflict do nothing;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (company_id, auth.uid(), 'company.created', 'company', company_id, jsonb_build_object('name', clean_name));

  return company_id;
end;
$$;

revoke all on function public.create_company_workspace(text) from public, anon;
grant execute on function public.create_company_workspace(text) to authenticated;

create or replace function public.request_company_access(target_company_id text, request_message text default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  request_id uuid;
  request_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select email into request_email from public.profiles where id = auth.uid();

  insert into public.company_join_requests (company_id, profile_id, requested_email, status, message)
  values (target_company_id, auth.uid(), request_email, 'pending', request_message)
  on conflict (company_id, profile_id) do update
  set status = 'pending',
      message = excluded.message,
      updated_at = now()
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.request_company_access(text, text) from public, anon;
grant execute on function public.request_company_access(text, text) to authenticated;

alter table public.company_subscriptions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.resource_acl enable row level security;
alter table public.field_permissions enable row level security;
alter table public.company_invites enable row level security;
alter table public.company_join_requests enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "members read subscriptions" on public.company_subscriptions;
create policy "members read subscriptions" on public.company_subscriptions
for select to authenticated using (app_private.is_company_member(company_id));

drop policy if exists "members read roles" on public.roles;
create policy "members read roles" on public.roles
for select to authenticated using (app_private.is_company_member(company_id));

drop policy if exists "admins manage roles" on public.roles;
create policy "admins manage roles" on public.roles
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "members read role permissions" on public.role_permissions;
create policy "members read role permissions" on public.role_permissions
for select to authenticated using (
  exists (select 1 from public.roles r where r.id = role_id and app_private.is_company_member(r.company_id))
);

drop policy if exists "admins manage role permissions" on public.role_permissions;
create policy "admins manage role permissions" on public.role_permissions
for all to authenticated
using (exists (select 1 from public.roles r where r.id = role_id and app_private.is_company_admin(r.company_id)))
with check (exists (select 1 from public.roles r where r.id = role_id and app_private.is_company_admin(r.company_id)));

drop policy if exists "members read role assignments" on public.user_role_assignments;
create policy "members read role assignments" on public.user_role_assignments
for select to authenticated using (app_private.is_company_member(company_id));

drop policy if exists "admins manage role assignments" on public.user_role_assignments;
create policy "admins manage role assignments" on public.user_role_assignments
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "members read resource acl" on public.resource_acl;
create policy "members read resource acl" on public.resource_acl
for select to authenticated using (app_private.is_company_member(company_id));

drop policy if exists "admins manage resource acl" on public.resource_acl;
create policy "admins manage resource acl" on public.resource_acl
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "members read field permissions" on public.field_permissions;
create policy "members read field permissions" on public.field_permissions
for select to authenticated using (app_private.is_company_member(company_id));

drop policy if exists "admins manage field permissions" on public.field_permissions;
create policy "admins manage field permissions" on public.field_permissions
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "admins manage invites" on public.company_invites;
create policy "admins manage invites" on public.company_invites
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "requesters read own join requests" on public.company_join_requests;
create policy "requesters read own join requests" on public.company_join_requests
for select to authenticated using (profile_id = auth.uid() or app_private.is_company_admin(company_id));

drop policy if exists "admins manage join requests" on public.company_join_requests;
create policy "admins manage join requests" on public.company_join_requests
for update to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "members read audit events" on public.audit_events;
create policy "members read audit events" on public.audit_events
for select to authenticated using (company_id is not null and app_private.is_company_admin(company_id));

drop policy if exists "role users can read companies" on public.companies;
create policy "role users can read companies" on public.companies
for select to authenticated
using (app_private.is_company_member(id));

drop policy if exists "subscription members read jobs" on public.jobs;
create policy "subscription members read jobs" on public.jobs
for select to authenticated
using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'jobs.view'));

drop policy if exists "subscription members insert jobs" on public.jobs;
create policy "subscription members insert jobs" on public.jobs
for insert to authenticated
with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'jobs.manage'));

drop policy if exists "subscription members update jobs" on public.jobs;
create policy "subscription members update jobs" on public.jobs
for update to authenticated
using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'jobs.manage'))
with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'jobs.manage'));

drop policy if exists "subscription members delete jobs" on public.jobs;
create policy "subscription members delete jobs" on public.jobs
for delete to authenticated
using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'jobs.manage'));

drop policy if exists "subscription members read job files" on public.job_files;
create policy "subscription members read job files" on public.job_files
for select to authenticated
using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'files.view'));

drop policy if exists "subscription members insert job files" on public.job_files;
create policy "subscription members insert job files" on public.job_files
for insert to authenticated
with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'files.manage'));

drop policy if exists "subscription members update job files" on public.job_files;
create policy "subscription members update job files" on public.job_files
for update to authenticated
using (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'files.manage'))
with check (app_private.is_company_member(company_id) and app_private.subscription_allows_access(company_id) and app_private.has_company_permission(company_id, 'files.manage'));

drop policy if exists "subscription members delete job files" on public.job_files;
create policy "subscription members delete job files" on public.job_files
for delete to authenticated
using (app_private.is_company_member(company_id) and app_private.has_company_permission(company_id, 'files.manage'));

grant usage on schema public to authenticated;
grant select on public.companies, public.company_memberships, public.company_subscriptions, public.roles, public.role_permissions, public.user_role_assignments, public.resource_acl, public.field_permissions, public.company_invites, public.company_join_requests, public.audit_events to authenticated;
grant insert, update, delete on public.roles, public.role_permissions, public.user_role_assignments, public.resource_acl, public.field_permissions, public.company_invites to authenticated;
grant insert, update on public.company_join_requests to authenticated;
