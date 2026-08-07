-- The clock lived entirely in localStorage, and persistTimeState() returned early for every
-- signed-in session, so a real user's running timer was never written anywhere at all. A
-- refresh reloaded state from Supabase, found no clock tables, and cleared it -- which is the
-- "timer resets on refresh" report, and also why the Clock dashboard only ever knew about the
-- one browser it was opened in.
--
-- Two tables, both private to the person they belong to:
--
--   company_time_entries  -- one closed shift or task stretch
--   company_active_timers -- the single running clock, keyed on the PERSON, not the company,
--                            because startClock() already stops any other timer before it
--                            starts a new one. One clock per person is the existing rule; the
--                            primary key just makes the database agree with it.
--
-- Deliberately NOT the public.time_entries / public.active_timers pair from the vendored task
-- app: those require a task_id (Questbase records general shifts with no task at all), key
-- user_id to team_members rather than to the auth identity, and carry no company_id. Both are
-- empty in production, so nothing is being migrated or orphaned here.
--
-- Scope: a person sees their OWN time. Team-wide time reporting is a separate feature and is
-- not being invented here -- a policy that quietly widened the Clock dashboard into a team
-- view would be a surprise, not a fix.

create table if not exists public.company_time_entries (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- No foreign key to tasks on purpose: deleting a task must not erase the hours somebody
  -- worked on it. The title is stored as it read at the time for the same reason.
  task_id text not null default '',
  task_title text not null default '',
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_ms bigint not null default 0 check (duration_ms >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists company_time_entries_owner_idx
  on public.company_time_entries(company_id, profile_id, started_at desc);

create table if not exists public.company_active_timers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  company_id text not null references public.companies(id) on delete cascade,
  task_id text not null default '',
  task_title text not null default '',
  started_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists company_active_timers_company_idx
  on public.company_active_timers(company_id);

drop trigger if exists set_company_active_timers_updated_at on public.company_active_timers;
create trigger set_company_active_timers_updated_at
before update on public.company_active_timers
for each row execute function public.set_updated_at();

alter table public.company_time_entries enable row level security;
alter table public.company_active_timers enable row level security;

drop policy if exists "own time entries" on public.company_time_entries;
create policy "own time entries"
on public.company_time_entries
for select
to authenticated
using (
  profile_id = (select auth.uid())
  and app_private.is_company_member(company_id)
);

drop policy if exists "log own time" on public.company_time_entries;
create policy "log own time"
on public.company_time_entries
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'time.track')
);

-- A logged shift can be corrected or removed by the person who logged it, and by nobody else.
drop policy if exists "correct own time" on public.company_time_entries;
create policy "correct own time"
on public.company_time_entries
for update
to authenticated
using (profile_id = (select auth.uid()) and app_private.is_company_member(company_id))
with check (profile_id = (select auth.uid()) and app_private.is_company_member(company_id));

drop policy if exists "drop own time" on public.company_time_entries;
create policy "drop own time"
on public.company_time_entries
for delete
to authenticated
using (profile_id = (select auth.uid()) and app_private.is_company_member(company_id));

drop policy if exists "own running clock" on public.company_active_timers;
create policy "own running clock"
on public.company_active_timers
for select
to authenticated
using (profile_id = (select auth.uid()));

drop policy if exists "start own clock" on public.company_active_timers;
create policy "start own clock"
on public.company_active_timers
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'time.track')
);

drop policy if exists "move own clock" on public.company_active_timers;
create policy "move own clock"
on public.company_active_timers
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (
  profile_id = (select auth.uid())
  and app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'time.track')
);

drop policy if exists "stop own clock" on public.company_active_timers;
create policy "stop own clock"
on public.company_active_timers
for delete
to authenticated
using (profile_id = (select auth.uid()));

grant select, insert, update, delete on public.company_time_entries to authenticated;
grant select, insert, update, delete on public.company_active_timers to authenticated;

-- time.track was only ever granted to two hand-made roles. Owner, admin and developer pass
-- has_company_permission by rank, but a named Manager or Staff role did not, so clocking in
-- would have been refused by the database for exactly the people who clock in most.
insert into public.role_permissions (role_id, permission_key, effect)
select id, 'time.track', 'allow'
from public.roles
where lower(name) in ('owner', 'admin', 'manager', 'staff', 'member', 'worker')
on conflict (role_id, permission_key) do nothing;
