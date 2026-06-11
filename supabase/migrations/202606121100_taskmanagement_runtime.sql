create extension if not exists pgcrypto;

alter table public.companies
  add column if not exists label text,
  add column if not exists pill text;

update public.companies
set
  label = coalesce(label, short_name, name, id),
  pill = coalesce(pill, 'pill-' || replace(id, '-', '-'))
where label is null or pill is null;

alter table public.companies
  alter column label set default '',
  alter column pill set default '';

insert into public.companies (id, name, short_name, color, label, pill)
values
  ('roofing', 'Roofing', 'Roofing', '#f45d22', 'Roofing', 'pill-roof'),
  ('drafting', 'Drafting', 'Drafting', '#2563eb', 'Drafting', 'pill-draft'),
  ('lumen', 'Lumen', 'Lumen', '#7c3aed', 'Lumen', 'pill-lumen')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  color = excluded.color,
  label = excluded.label,
  pill = excluded.pill;

create table if not exists public.team_members (
  id text primary key,
  name text not null,
  full_name text not null,
  email text not null,
  color text not null,
  avatar_url text,
  active boolean not null default true,
  company_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  approved boolean not null default false,
  role text not null default 'member',
  email_verified boolean not null default false,
  member_id text references public.team_members(id),
  supervisor_id text references public.team_members(id),
  company_ids text[] not null default '{}'::text[],
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('member', 'worker', 'sales', 'supervisor', 'admin', 'developer', 'construction_supervisor'))
);

create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  type text not null default 'admin',
  label text,
  bid_status text,
  company_id text not null references public.companies(id) on delete restrict,
  creator_id text not null references public.team_members(id) on delete restrict,
  assignee_id text not null references public.team_members(id) on delete restrict,
  project_id text,
  due date not null,
  due_time text,
  reminder_at text,
  priority text not null default 'medium',
  urgency text not null default 'medium',
  status text not null default 'todo',
  watchers jsonb not null default '[]'::jsonb,
  subtasks jsonb not null default '[]'::jsonb,
  activity jsonb not null default '[]'::jsonb,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_type_check check (type in ('lead', 'bid', 'admin', 'invoicing', 'ar', 'meeting', 'web_dev')),
  constraint tasks_label_check check (label is null or label in ('roof', 'roof_framing', 'framing')),
  constraint tasks_priority_check check (priority in ('critical', 'urgent', 'high', 'medium', 'low')),
  constraint tasks_urgency_check check (urgency in ('critical', 'urgent', 'high', 'medium', 'low', 'chill')),
  constraint tasks_status_check check (status in ('todo', 'pending', 'hold', 'review', 'done'))
);

create table if not exists public.time_entries (
  id text primary key,
  user_id text not null references public.team_members(id) on delete restrict,
  task_id text not null references public.tasks(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_ms bigint not null check (duration_ms >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.active_timers (
  user_id text primary key references public.team_members(id) on delete restrict,
  task_id text not null references public.tasks(id) on delete cascade,
  started_at timestamptz not null,
  task_title text,
  task_company text,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  member_id text not null references public.team_members(id) on delete restrict,
  task_id text references public.tasks(id) on delete cascade,
  meta text not null default '',
  html text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_html_safe check (
    html !~* '<\s*script'
    and html !~* 'javascript:'
    and html !~* '\son[a-z]+\s*='
  )
);

create index if not exists profiles_member_id_idx on public.profiles(member_id);
create index if not exists profiles_supervisor_id_idx on public.profiles(supervisor_id);
create index if not exists profiles_company_ids_idx on public.profiles using gin (company_ids);
create index if not exists team_members_company_ids_idx on public.team_members using gin (company_ids);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists tasks_creator_idx on public.tasks(creator_id);
create index if not exists tasks_company_idx on public.tasks(company_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_due_idx on public.tasks(due);
create index if not exists time_entries_user_idx on public.time_entries(user_id);
create index if not exists time_entries_task_idx on public.time_entries(task_id);
create index if not exists notifications_member_idx on public.notifications(member_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.slugify_member_id(input text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'member')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  with profile_role as (
    select coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'member') as role_raw
  )
  select case when role_raw = 'sales' then 'worker' else role_raw end
  from profile_role;
$$;

create or replace function public.current_member_id()
returns text
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select (select p.member_id from public.profiles p where p.id = auth.uid());
$$;

create or replace function public.current_company_ids()
returns text[]
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select coalesce((select p.company_ids from public.profiles p where p.id = auth.uid()), '{}'::text[]);
$$;

create or replace function public.can_manage_roles()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select public.current_profile_role() in ('admin', 'developer', 'construction_supervisor');
$$;

create or replace function public.can_view_team()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select public.current_profile_role() in ('admin', 'developer', 'construction_supervisor', 'supervisor');
$$;

revoke all on function public.slugify_member_id(text) from public, anon, authenticated;
revoke all on function public.current_profile_role() from public, anon;
revoke all on function public.current_member_id() from public, anon;
revoke all on function public.current_company_ids() from public, anon;
revoke all on function public.can_manage_roles() from public, anon;
revoke all on function public.can_view_team() from public, anon;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_member_id() to authenticated;
grant execute on function public.current_company_ids() to authenticated;
grant execute on function public.can_manage_roles() to authenticated;
grant execute on function public.can_view_team() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member_id text := coalesce(nullif(public.slugify_member_id(split_part(new.email, '@', 1)), ''), 'member-' || left(new.id::text, 8));
  v_full_name text := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1));
begin
  insert into public.team_members (id, name, full_name, email, color, active, company_ids)
  values (v_member_id, split_part(v_full_name, ' ', 1), v_full_name, new.email, '#' || substr(md5(new.email), 1, 6), false, '{}'::text[])
  on conflict (id) do update set
    name = excluded.name,
    full_name = excluded.full_name,
    email = excluded.email;

  insert into public.profiles (id, email, full_name, approved, role, email_verified, member_id, company_ids)
  values (new.id, new.email, v_full_name, false, 'member', false, v_member_id, '{}'::text[])
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    member_id = excluded.member_id;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.sync_team_member_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    update public.team_members
    set active = false
    where id = old.member_id;
    return old;
  end if;

  if new.member_id is not null then
    insert into public.team_members (id, name, full_name, email, color, avatar_url, active, company_ids)
    values (
      new.member_id,
      split_part(coalesce(nullif(new.full_name, ''), split_part(new.email, '@', 1)), ' ', 1),
      coalesce(nullif(new.full_name, ''), split_part(new.email, '@', 1)),
      new.email,
      '#' || substr(md5(new.email), 1, 6),
      new.avatar_url,
      new.approved is true,
      coalesce(new.company_ids, '{}'::text[])
    )
    on conflict (id) do update set
      name = excluded.name,
      full_name = excluded.full_name,
      email = excluded.email,
      avatar_url = excluded.avatar_url,
      active = excluded.active,
      company_ids = excluded.company_ids;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_team_member_from_profile on public.profiles;
create trigger sync_team_member_from_profile
after insert or update of full_name, email, avatar_url, approved, company_ids, member_id or delete on public.profiles
for each row execute function public.sync_team_member_from_profile();

drop trigger if exists on_auth_user_created_taskmanagement on auth.users;
create trigger on_auth_user_created_taskmanagement
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.team_members enable row level security;
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.time_entries enable row level security;
alter table public.active_timers enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "role users can read companies" on public.companies;
create policy "role users can read companies" on public.companies for select to authenticated using (true);

drop policy if exists "role users can read team_members" on public.team_members;
create policy "role users can read team_members" on public.team_members
for select to authenticated
using (public.current_profile_role() in ('admin', 'developer', 'construction_supervisor', 'supervisor', 'worker'));

drop policy if exists "managers can insert team_members" on public.team_members;
create policy "managers can insert team_members" on public.team_members for insert to authenticated with check (public.can_manage_roles());

drop policy if exists "managers can update team_members" on public.team_members;
create policy "managers can update team_members" on public.team_members for update to authenticated using (public.can_manage_roles()) with check (public.can_manage_roles());

drop policy if exists "managers can delete team_members" on public.team_members;
create policy "managers can delete team_members" on public.team_members for delete to authenticated using (public.can_manage_roles());

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "team viewers read profiles" on public.profiles;
create policy "team viewers read profiles" on public.profiles
for select to authenticated
using (public.can_view_team() and (approved is true or public.can_manage_roles()));

drop policy if exists "managers update profiles" on public.profiles;
create policy "managers update profiles" on public.profiles for update to authenticated using (public.can_manage_roles()) with check (public.can_manage_roles());

drop policy if exists "users update own profile name" on public.profiles;
create policy "users update own profile name" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select p.role from public.profiles p where p.id = auth.uid())
  and approved = (select p.approved from public.profiles p where p.id = auth.uid())
  and supervisor_id is not distinct from (select p.supervisor_id from public.profiles p where p.id = auth.uid())
  and company_ids is not distinct from (select p.company_ids from public.profiles p where p.id = auth.uid())
  and member_id is not distinct from (select p.member_id from public.profiles p where p.id = auth.uid())
  and email is not distinct from (select p.email from public.profiles p where p.id = auth.uid())
);

drop policy if exists "managers delete profiles" on public.profiles;
create policy "managers delete profiles" on public.profiles for delete to authenticated using (public.can_manage_roles() and id <> auth.uid());

drop policy if exists "role users can read tasks" on public.tasks;
create policy "role users can read tasks" on public.tasks
for select to authenticated
using (
  public.current_profile_role() = 'developer'
  or (
    (company_id = any(public.current_company_ids()) or id = 'general-shift')
    and (
      public.current_profile_role() in ('admin', 'construction_supervisor')
      or (
        public.current_profile_role() = 'supervisor'
        and (
          assignee_id = public.current_member_id()
          or creator_id = public.current_member_id()
          or exists (
            select 1 from public.profiles p
            where p.member_id = public.tasks.assignee_id
              and p.supervisor_id = public.current_member_id()
          )
        )
      )
      or (
        public.current_profile_role() = 'worker'
        and (assignee_id = public.current_member_id() or creator_id = public.current_member_id() or id = 'general-shift')
      )
    )
  )
);

drop policy if exists "role users can insert tasks" on public.tasks;
create policy "role users can insert tasks" on public.tasks
for insert to authenticated
with check (
  public.current_profile_role() = 'developer'
  or (
    company_id = any(public.current_company_ids())
    and (
      public.current_profile_role() in ('admin', 'supervisor', 'construction_supervisor')
      or (
        public.current_profile_role() = 'worker'
        and creator_id = public.current_member_id()
        and exists (
          select 1 from public.profiles p
          where p.member_id = public.tasks.assignee_id
            and p.approved is true
            and public.tasks.company_id = any(p.company_ids)
        )
      )
    )
  )
);

drop policy if exists "role users can update tasks" on public.tasks;
create policy "role users can update tasks" on public.tasks
for update to authenticated
using (
  public.current_profile_role() = 'developer'
  or (
    (company_id = any(public.current_company_ids()) or id = 'general-shift')
    and (
      public.current_profile_role() in ('admin', 'construction_supervisor')
      or (
        public.current_profile_role() = 'supervisor'
        and (
          assignee_id = public.current_member_id()
          or creator_id = public.current_member_id()
          or exists (
            select 1 from public.profiles p
            where p.member_id = public.tasks.assignee_id
              and p.supervisor_id = public.current_member_id()
          )
        )
      )
      or (
        public.current_profile_role() = 'worker'
        and (assignee_id = public.current_member_id() or creator_id = public.current_member_id() or id = 'general-shift')
      )
    )
  )
)
with check (
  public.current_profile_role() = 'developer'
  or (
    (company_id = any(public.current_company_ids()) or id = 'general-shift')
    and (
      public.current_profile_role() in ('admin', 'construction_supervisor')
      or (
        public.current_profile_role() = 'supervisor'
        and (
          assignee_id = public.current_member_id()
          or creator_id = public.current_member_id()
          or exists (
            select 1 from public.profiles p
            where p.member_id = public.tasks.assignee_id
              and p.supervisor_id = public.current_member_id()
          )
        )
      )
      or (
        public.current_profile_role() = 'worker'
        and (assignee_id = public.current_member_id() or creator_id = public.current_member_id() or id = 'general-shift')
      )
    )
  )
);

drop policy if exists "role users can delete tasks" on public.tasks;
create policy "role users can delete tasks" on public.tasks
for delete to authenticated
using (
  public.current_profile_role() = 'developer'
  or (
    company_id = any(public.current_company_ids())
    and (
      public.current_profile_role() in ('admin', 'supervisor', 'construction_supervisor')
      or (public.current_profile_role() = 'worker' and creator_id = public.current_member_id())
    )
  )
);

drop policy if exists "role users can read time_entries" on public.time_entries;
create policy "role users can read time_entries" on public.time_entries
for select to authenticated
using (public.current_profile_role() in ('admin', 'developer', 'construction_supervisor', 'supervisor') or user_id = public.current_member_id());

drop policy if exists "role users can insert time_entries" on public.time_entries;
create policy "role users can insert time_entries" on public.time_entries
for insert to authenticated
with check (user_id = public.current_member_id() or public.current_profile_role() in ('admin', 'developer', 'construction_supervisor'));

drop policy if exists "role users can update time_entries" on public.time_entries;
create policy "role users can update time_entries" on public.time_entries
for update to authenticated
using (user_id = public.current_member_id() or public.current_profile_role() in ('admin', 'developer', 'construction_supervisor'))
with check (user_id = public.current_member_id() or public.current_profile_role() in ('admin', 'developer', 'construction_supervisor'));

drop policy if exists "role users can delete time_entries" on public.time_entries;
create policy "role users can delete time_entries" on public.time_entries
for delete to authenticated
using (user_id = public.current_member_id() or public.current_profile_role() in ('admin', 'developer', 'construction_supervisor'));

drop policy if exists "role users can read active_timers" on public.active_timers;
create policy "role users can read active_timers" on public.active_timers
for select to authenticated
using (
  user_id = public.current_member_id()
  or public.current_profile_role() = 'developer'
  or (
    public.current_profile_role() in ('admin', 'construction_supervisor', 'supervisor')
    and (task_company is null or task_company = any(public.current_company_ids()))
  )
);

drop policy if exists "role users can insert active_timers" on public.active_timers;
create policy "role users can insert active_timers" on public.active_timers for insert to authenticated with check (user_id = public.current_member_id());

drop policy if exists "role users can update active_timers" on public.active_timers;
create policy "role users can update active_timers" on public.active_timers for update to authenticated using (user_id = public.current_member_id()) with check (user_id = public.current_member_id());

drop policy if exists "role users can delete active_timers" on public.active_timers;
create policy "role users can delete active_timers" on public.active_timers for delete to authenticated using (user_id = public.current_member_id());

drop policy if exists "role users can read notifications" on public.notifications;
create policy "role users can read notifications" on public.notifications for select to authenticated using (member_id = public.current_member_id());

drop policy if exists "role users can insert notifications" on public.notifications;
create policy "role users can insert notifications" on public.notifications
for insert to authenticated
with check (
  member_id = public.current_member_id()
  or public.current_profile_role() in ('admin', 'developer', 'construction_supervisor', 'supervisor')
  or exists (
    select 1 from public.tasks t
    where t.id = notifications.task_id
      and t.creator_id = public.current_member_id()
  )
);

drop policy if exists "role users can update notifications" on public.notifications;
create policy "role users can update notifications" on public.notifications for update to authenticated using (member_id = public.current_member_id()) with check (member_id = public.current_member_id());

drop policy if exists "role users can delete notifications" on public.notifications;
create policy "role users can delete notifications" on public.notifications for delete to authenticated using (member_id = public.current_member_id());

grant usage on schema public to anon, authenticated;
grant select on public.companies to anon, authenticated;
grant select, insert, update, delete on public.team_members, public.profiles, public.tasks, public.time_entries, public.active_timers, public.notifications to authenticated;

insert into public.team_members (id, name, full_name, email, color, active, company_ids)
values
  ('abraham', 'Abraham', 'Abraham Maldonado', 'abraham@quest.com', '#E8A03A', true, array['roofing', 'drafting', 'lumen']),
  ('alkeith', 'Alkeith', 'Alkeith Cabezzas', 'alkeith@questroofing.com', '#993C1D', true, array['roofing']),
  ('kristine', 'Kristine', 'Kristine', 'kristine@questroofing.com', '#185FA5', true, array['roofing']),
  ('jesus', 'Jesus', 'Jesus', 'jesus@questroofing.com', '#BA7517', true, array['roofing']),
  ('andres', 'Andres', 'Andres', 'andres@questdrafting.com', '#3B6D11', true, array['drafting']),
  ('adrian', 'Adrian', 'Adrian Alegria', 'adrian@lumen.com', '#6E430A', true, array['lumen'])
on conflict (id) do update set
  name = excluded.name,
  full_name = excluded.full_name,
  email = excluded.email,
  color = excluded.color,
  active = excluded.active,
  company_ids = excluded.company_ids;

insert into public.tasks (id, title, description, type, label, company_id, creator_id, assignee_id, project_id, due, priority, urgency, status)
values ('general-shift', 'General shift', 'Clock-in bucket for workers without a specific task assignment.', 'admin', null, 'roofing', 'abraham', 'abraham', null, current_date, 'low', 'low', 'todo')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();
