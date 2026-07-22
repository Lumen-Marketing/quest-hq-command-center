-- Post-migration verification. Read-only: changes nothing.
-- Paste into the Supabase SQL Editor for project rqundirizvojpzhljtdn and Run.
-- Every row should say PASS.

with checks as (
  -- Phase 2: the 11 new tables
  select 'P2 new tables (expect 11)' as check_name,
         count(*)::text as found,
         '11' as expected,
         (count(*) = 11) as ok
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('projects','task_types','task_type_statuses','task_labels',
                       'task_comments','comment_reactions','checkin_settings',
                       'checkin_log','bug_reports','reminder_log','wo_counters')

  union all
  -- Phase 2: the 6 new task columns
  select 'P2 new tasks columns (expect 6)',
         count(*)::text, '6', (count(*) = 6)
  from information_schema.columns
  where table_schema = 'public' and table_name = 'tasks'
    and column_name in ('focus_seq','completed_at','assignee_ids','wo_number','reminder_offset','stuck')

  union all
  -- Phase 2: the 3 legacy CHECK constraints must be GONE (taxonomy unlock)
  select 'P2 legacy tasks CHECKs removed (expect 0)',
         count(*)::text, '0', (count(*) = 0)
  from pg_constraint
  where conrelid = 'public.tasks'::regclass
    and conname in ('tasks_type_check','tasks_label_check','tasks_status_check')

  union all
  -- Phase 2: NO foreign key on tasks.project_id (CC points it at jobs)
  select 'P2 no tasks.project_id FK (expect 0)',
         count(*)::text, '0', (count(*) = 0)
  from pg_constraint
  where conrelid = 'public.tasks'::regclass and conname = 'tasks_project_id_fkey'

  union all
  -- Phase 3: old leaky policies must be GONE
  select 'P3 leaky policies removed (expect 0)',
         count(*)::text, '0', (count(*) = 0)
  from pg_policies
  where schemaname = 'public'
    and policyname in ('role users can read companies',
                       'role users can read team_members',
                       'managers can insert team_members',
                       'managers can update team_members',
                       'managers can delete team_members',
                       'role users can read time_entries',
                       'role users can insert time_entries',
                       'role users can update time_entries',
                       'role users can delete time_entries',
                       'role users can read active_timers')

  union all
  -- Phase 3: new tenant-scoped policies present
  select 'P3 tenant-scoped policies (expect 10)',
         count(*)::text, '10', (count(*) = 10)
  from pg_policies
  where schemaname = 'public'
    and policyname in ('members read their companies',
                       'members read own company roster',
                       'company admins insert own roster',
                       'company admins update own roster',
                       'company admins delete own roster',
                       'own or company-admin read time_entries',
                       'own insert time_entries',
                       'own or company-admin update time_entries',
                       'own or company-admin delete time_entries',
                       'own or company-admin read active_timers')

  union all
  -- Phase 3: every existing workspace got the tasks module
  select 'P3 workspaces without tasks plugin (expect 0)',
         count(*)::text, '0', (count(*) = 0)
  from public.companies c
  where not exists (
    select 1 from public.company_plugins cp
    where cp.company_id = c.id and cp.plugin_id = 'tasks' and cp.status = 'installed'
  )

  union all
  -- Phase 3: new-workspace taxonomy seeding trigger installed
  select 'P3 taxonomy seed trigger (expect 1)',
         count(*)::text, '1', (count(*) = 1)
  from pg_trigger
  where tgname = 'companies_seed_task_taxonomy' and not tgisinternal

  union all
  -- RLS switched on for every new table
  select 'RLS enabled on new tables (expect 11)',
         count(*)::text, '11', (count(*) = 11)
  from pg_tables
  where schemaname = 'public' and rowsecurity = true
    and tablename in ('projects','task_types','task_type_statuses','task_labels',
                      'task_comments','comment_reactions','checkin_settings',
                      'checkin_log','bug_reports','reminder_log','wo_counters')
)
select case when ok then 'PASS' else '*** FAIL ***' end as result,
       check_name,
       found,
       expected
from checks
order by ok, check_name;
