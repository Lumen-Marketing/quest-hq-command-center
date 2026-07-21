-- Phase 2: task app schema reconciliation (additive).
-- Shared-table deltas + 11 new tables. Fresh start: no data migration
-- (locked decision 3). Seed rows: default task taxonomy per existing
-- company (optional — client falls back to constants; see report §5 Q5).

-- ============================================================
-- A. Shared-table additive alters
-- ============================================================

alter table public.tasks
  add column if not exists focus_seq real,
  add column if not exists completed_at timestamptz,
  add column if not exists assignee_ids text[] not null default '{}'::text[],
  add column if not exists wo_number int,
  add column if not exists reminder_offset text,
  add column if not exists stuck jsonb;

comment on column public.tasks.focus_seq is
  'Execution-order sort key for the assignee''s Focus list. NULL = not in Focus.';

-- !!! CONFLICT — human sign-off required (report §1 tasks, §5 Q1) !!!
-- Upstream dropped these in 058 because type/status/label became per-company
-- data (task_types / task_type_statuses / task_labels). Keeping them breaks
-- custom-taxonomy CRUD. Delete these three lines to keep the checks instead.
alter table public.tasks drop constraint if exists tasks_type_check;
alter table public.tasks drop constraint if exists tasks_label_check;
alter table public.tasks drop constraint if exists tasks_status_check;

alter table public.profiles
  add column if not exists position text;

alter table public.team_members
  add column if not exists position text,
  add column if not exists role text;

-- ============================================================
-- B. projects (+ tasks.project_id FK, on delete set null per upstream 055)
-- ============================================================

create table if not exists public.projects (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  address text not null default '',
  status text not null default 'active',
  budget numeric(12,2),
  start_date date,
  due_date date,
  color text not null default '#8f867b',
  client text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check check (status in ('lead', 'active', 'hold', 'complete', 'cancelled'))
);

create index if not exists projects_company_idx on public.projects(company_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tasks_project_id_fkey' and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_project_id_fkey
      foreign key (project_id) references public.projects(id) on delete set null;
  end if;
end $$;

alter table public.projects enable row level security;

drop policy if exists "company members read projects" on public.projects;
create policy "company members read projects" on public.projects
for select to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members insert projects" on public.projects;
create policy "company members insert projects" on public.projects
for insert to authenticated
with check (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members update projects" on public.projects;
create policy "company members update projects" on public.projects
for update to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin())
with check (app_private.is_company_member(company_id) or app_private.is_quest_admin());

drop policy if exists "company members delete projects" on public.projects;
create policy "company members delete projects" on public.projects
for delete to authenticated
using (app_private.is_company_member(company_id) or app_private.is_quest_admin());

-- ============================================================
-- C. Task taxonomy: task_types / task_type_statuses / task_labels
--    (upstream 056; read = member, write = company admin)
-- ============================================================

create table if not exists public.task_types (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create table if not exists public.task_type_statuses (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  type_key text not null,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  is_done boolean not null default false,
  is_default boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, type_key, key)
);

create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null default '#8f867b',
  sort_order double precision not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create index if not exists task_types_company_idx on public.task_types (company_id);
create index if not exists task_type_statuses_company_type_idx on public.task_type_statuses (company_id, type_key);
create index if not exists task_labels_company_idx on public.task_labels (company_id);
create unique index if not exists task_status_one_done on public.task_type_statuses (company_id, type_key) where is_done;
create unique index if not exists task_status_one_default on public.task_type_statuses (company_id, type_key) where is_default;

alter table public.task_types enable row level security;
alter table public.task_type_statuses enable row level security;
alter table public.task_labels enable row level security;

do $$
declare t text;
begin
  foreach t in array array['task_types', 'task_type_statuses', 'task_labels'] loop
    execute format('drop policy if exists "company members read %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company members read %1$s" on public.%1$I
      for select to authenticated
      using (app_private.is_company_member(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins insert %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins insert %1$s" on public.%1$I
      for insert to authenticated
      with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins update %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins update %1$s" on public.%1$I
      for update to authenticated
      using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
      with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
    execute format('drop policy if exists "company admins delete %1$s" on public.%1$I', t);
    execute format($f$
      create policy "company admins delete %1$s" on public.%1$I
      for delete to authenticated
      using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
    $f$, t);
  end loop;
end $$;

-- Optional seed: default taxonomy for EXISTING companies (mirrors upstream 057
-- values). The client falls back to js/constants.js when these tables are empty
-- (taxonomy.js:71 seedFromConstants), so this seed is convenience, not boot-
-- critical. New-workspace seeding belongs in Phase 3's create_workspace work.
insert into public.task_types (company_id, key, label, sort_order)
select c.id, t.key, t.label, t.ord
from public.companies c
cross join (values
  ('lead','Lead',0),('bid','Bid / Estimate',1),('admin','Admin',2),
  ('invoicing','Invoicing',3),('ar','AR',4),('meeting','Meeting',5),
  ('web_dev','Web development',6)
) t(key,label,ord)
on conflict (company_id, key) do nothing;

insert into public.task_type_statuses (company_id, type_key, key, label, color, sort_order, is_done, is_default)
select c.id, ty.key, s.key, s.label, s.color, s.ord, s.is_done, s.is_default
from public.companies c
cross join (values ('lead'),('bid'),('admin'),('invoicing'),('ar'),('meeting'),('web_dev')) ty(key)
cross join (values
  ('todo','Working on it','#3E7BF2',0,false,true),
  ('pending','Pending','#8F867B',1,false,false),
  ('hold','Stuck','#E0484D',2,false,false),
  ('review','In review','#ED9A3A',3,false,false),
  ('done','Done','#2E9E6B',4,true,false)
) s(key,label,color,ord,is_done,is_default)
on conflict (company_id, type_key, key) do nothing;

insert into public.task_labels (company_id, key, label, sort_order)
select c.id, l.key, l.label, l.ord
from public.companies c
cross join (values ('roof','Roof',0),('roof_framing','Roof & Framing',1),('framing','Framing',2)) l(key,label,ord)
on conflict (company_id, key) do nothing;

-- ============================================================
-- D. task_comments + comment_reactions
--    Tenant scope rides the parent-task chain: tasks.company_id.
--    "Act as yourself" = auth.uid()'s profile.member_id matches.
-- ============================================================

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references public.tasks(id) on delete cascade,
  author_id text not null,
  body text not null,
  mentions text[] not null default '{}'::text[],
  kind text not null default 'comment',
  created_at timestamptz not null default now(),
  constraint task_comments_kind_check check (kind in ('comment', 'note', 'call'))
);

create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);

alter table public.task_comments enable row level security;

drop policy if exists "company members read task_comments" on public.task_comments;
create policy "company members read task_comments" on public.task_comments
for select to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and (app_private.is_company_member(t.company_id) or app_private.is_quest_admin())
  )
);

drop policy if exists "company members insert own task_comments" on public.task_comments;
create policy "company members insert own task_comments" on public.task_comments
for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = task_comments.author_id
  )
  and exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and app_private.is_company_member(t.company_id)
  )
);

drop policy if exists "authors and admins delete task_comments" on public.task_comments;
create policy "authors and admins delete task_comments" on public.task_comments
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = task_comments.author_id
  )
  or exists (
    select 1 from public.tasks t
    where t.id = task_comments.task_id
      and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())
  )
);

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.task_comments(id) on delete cascade,
  member_id text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, member_id, emoji)
);

create index if not exists comment_reactions_comment_idx on public.comment_reactions (comment_id);

alter table public.comment_reactions enable row level security;

drop policy if exists "company members read comment_reactions" on public.comment_reactions;
create policy "company members read comment_reactions" on public.comment_reactions
for select to authenticated
using (
  exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and (app_private.is_company_member(t.company_id) or app_private.is_quest_admin())
  )
);

drop policy if exists "company members insert own comment_reactions" on public.comment_reactions;
create policy "company members insert own comment_reactions" on public.comment_reactions
for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = comment_reactions.member_id
  )
  and exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and app_private.is_company_member(t.company_id)
  )
);

drop policy if exists "owners and admins delete comment_reactions" on public.comment_reactions;
create policy "owners and admins delete comment_reactions" on public.comment_reactions
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.member_id = comment_reactions.member_id
  )
  or exists (
    select 1
    from public.task_comments c
    join public.tasks t on t.id = c.task_id
    where c.id = comment_reactions.comment_id
      and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())
  )
);

-- ============================================================
-- E. wo_counters + assign_wo_number RPC (upstream 061, tenant-guarded)
-- ============================================================

create table if not exists public.wo_counters (
  company_id text primary key references public.companies(id) on delete cascade,
  next_val int not null default 1
);

alter table public.wo_counters enable row level security;
-- RLS on, no policies: only the security-definer RPC below touches this table.

create or replace function public.assign_wo_number(company text)
returns int
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  assigned int;
begin
  -- Tenant guard (CC addition vs upstream 061): only members of the company
  -- may advance its counter.
  if not (app_private.is_company_member(company) or app_private.is_quest_admin()) then
    raise exception 'not a member of company %', company;
  end if;

  insert into public.wo_counters as c (company_id, next_val)
    values (company, 2)
  on conflict (company_id)
    do update set next_val = c.next_val + 1
    returning (c.next_val - 1) into assigned;
  return coalesce(assigned, 1);
end;
$$;

revoke all on function public.assign_wo_number(text) from public, anon;
grant execute on function public.assign_wo_number(text) to authenticated;

-- ============================================================
-- F. bug_reports (platform-level support inbox; writes only via the
--    report-problem edge function — service role bypasses RLS)
-- ============================================================

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text,
  reporter_email text,
  type text not null default 'bug',
  description text not null,
  context jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint bug_reports_type_check check (type in ('bug', 'problem', 'suggestion')),
  constraint bug_reports_description_check check (length(btrim(description)) > 0),
  constraint bug_reports_status_check check (status in ('open', 'resolved'))
);

create index if not exists bug_reports_reporter_created_idx on public.bug_reports (reporter_id, created_at desc);
create index if not exists bug_reports_created_idx on public.bug_reports (created_at desc);

alter table public.bug_reports enable row level security;

drop policy if exists "quest admins read bug_reports" on public.bug_reports;
create policy "quest admins read bug_reports" on public.bug_reports
for select to authenticated using (app_private.is_quest_admin());

drop policy if exists "quest admins update bug_reports" on public.bug_reports;
create policy "quest admins update bug_reports" on public.bug_reports
for update to authenticated
using (app_private.is_quest_admin()) with check (app_private.is_quest_admin());

drop policy if exists "quest admins delete bug_reports" on public.bug_reports;
create policy "quest admins delete bug_reports" on public.bug_reports
for delete to authenticated using (app_private.is_quest_admin());

-- ============================================================
-- G. Check-ins (feature ships dark until Phase 4 ports the edge fns)
--    checkin_settings is PER-COMPANY here, not upstream's global singleton
--    (report §5 Q2 — needs sign-off + a two-line frontend patch).
-- ============================================================

create table if not exists public.checkin_settings (
  company_id text primary key references public.companies(id) on delete cascade,
  morning_enabled boolean not null default false,
  eod_enabled boolean not null default false,
  stalled_enabled boolean not null default false,
  stalled_days integer not null default 3,
  eod_idle_minutes integer not null default 90,
  updated_by text,
  updated_at timestamptz not null default now()
);

drop trigger if exists checkin_settings_set_updated_at on public.checkin_settings;
create trigger checkin_settings_set_updated_at
before update on public.checkin_settings
for each row execute function public.set_updated_at();

alter table public.checkin_settings enable row level security;

drop policy if exists "company admins read checkin_settings" on public.checkin_settings;
create policy "company admins read checkin_settings" on public.checkin_settings
for select to authenticated
using (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

drop policy if exists "company admins insert checkin_settings" on public.checkin_settings;
create policy "company admins insert checkin_settings" on public.checkin_settings
for insert to authenticated
with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

drop policy if exists "company admins update checkin_settings" on public.checkin_settings;
create policy "company admins update checkin_settings" on public.checkin_settings
for update to authenticated
using (app_private.is_company_admin(company_id) or app_private.is_quest_admin())
with check (app_private.is_company_admin(company_id) or app_private.is_quest_admin());

create table if not exists public.checkin_log (
  kind text not null,
  subject text not null,
  period text not null,
  sent_at timestamptz not null default now(),
  primary key (kind, subject, period)
);

alter table public.checkin_log enable row level security;
-- RLS on, no policies: service-role-only dedupe ledger (upstream 071).

-- ============================================================
-- H. reminder_log (service-role-only dedupe ledger for due-reminders, upstream 054)
-- ============================================================

create table if not exists public.reminder_log (
  task_id text not null,
  kind text not null,
  sent_at timestamptz not null default now(),
  primary key (task_id, kind)
);

alter table public.reminder_log enable row level security;
-- RLS on, no policies: service-role-only.

-- ============================================================
-- I. Grants
-- ============================================================

grant select, insert, update, delete on
  public.projects,
  public.task_types,
  public.task_type_statuses,
  public.task_labels,
  public.task_comments,
  public.comment_reactions
to authenticated;

grant select, update, delete on public.bug_reports to authenticated;
grant select, insert, update on public.checkin_settings to authenticated;
-- wo_counters, checkin_log, reminder_log: no grants — RPC / service role only.
