alter table public.company_memberships enable row level security;

drop policy if exists "members read company memberships" on public.company_memberships;
create policy "members read company memberships" on public.company_memberships
for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_company_admin(company_id));

drop policy if exists "admins manage company memberships" on public.company_memberships;
create policy "admins manage company memberships" on public.company_memberships
for all to authenticated
using (app_private.is_company_admin(company_id))
with check (app_private.is_company_admin(company_id));

drop policy if exists "demo_insert_companies" on public.companies;
drop policy if exists "demo_update_companies" on public.companies;
drop policy if exists "demo_delete_companies" on public.companies;
drop policy if exists "demo_read_companies" on public.companies;

drop policy if exists "admins update companies" on public.companies;
create policy "admins update companies" on public.companies
for update to authenticated
using (app_private.is_company_admin(id))
with check (app_private.is_company_admin(id));

drop policy if exists "demo_read_jobs" on public.jobs;
drop policy if exists "demo_insert_jobs" on public.jobs;
drop policy if exists "demo_update_jobs" on public.jobs;
drop policy if exists "demo_delete_jobs" on public.jobs;

drop policy if exists "demo_read_job_files" on public.job_files;
drop policy if exists "demo_insert_job_files" on public.job_files;
drop policy if exists "demo_update_job_files" on public.job_files;
drop policy if exists "demo_delete_job_files" on public.job_files;

drop policy if exists "authenticated can insert profiles" on public.profiles;
drop policy if exists "authenticated can update profiles" on public.profiles;
drop policy if exists "authenticated can delete profiles" on public.profiles;

drop policy if exists "authenticated can insert team_members" on public.team_members;
drop policy if exists "authenticated can update team_members" on public.team_members;
drop policy if exists "authenticated can delete team_members" on public.team_members;

drop policy if exists "authenticated can insert tasks" on public.tasks;
drop policy if exists "authenticated can update tasks" on public.tasks;
drop policy if exists "authenticated can delete tasks" on public.tasks;

drop policy if exists "authenticated can insert time_entries" on public.time_entries;
drop policy if exists "authenticated can update time_entries" on public.time_entries;
drop policy if exists "authenticated can delete time_entries" on public.time_entries;

drop policy if exists "authenticated can insert active_timers" on public.active_timers;
drop policy if exists "authenticated can update active_timers" on public.active_timers;
drop policy if exists "authenticated can delete active_timers" on public.active_timers;

drop policy if exists "authenticated can insert notifications" on public.notifications;
drop policy if exists "authenticated can update notifications" on public.notifications;
drop policy if exists "authenticated can delete notifications" on public.notifications;

drop policy if exists "demo_read_quest_job_files_objects" on storage.objects;
drop policy if exists "demo_insert_quest_job_files_objects" on storage.objects;
drop policy if exists "demo_update_quest_job_files_objects" on storage.objects;
drop policy if exists "demo_delete_quest_job_files_objects" on storage.objects;

drop policy if exists "members read quest job file objects" on storage.objects;
create policy "members read quest job file objects" on storage.objects
for select to authenticated
using (
  bucket_id = 'quest-job-files'
  and app_private.is_company_member(split_part(name, '/', 1))
  and app_private.has_company_permission(split_part(name, '/', 1), 'files.view')
);

drop policy if exists "file managers insert quest job file objects" on storage.objects;
create policy "file managers insert quest job file objects" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'quest-job-files'
  and app_private.is_company_member(split_part(name, '/', 1))
  and app_private.has_company_permission(split_part(name, '/', 1), 'files.manage')
);

drop policy if exists "file managers update quest job file objects" on storage.objects;
create policy "file managers update quest job file objects" on storage.objects
for update to authenticated
using (
  bucket_id = 'quest-job-files'
  and app_private.is_company_member(split_part(name, '/', 1))
  and app_private.has_company_permission(split_part(name, '/', 1), 'files.manage')
)
with check (
  bucket_id = 'quest-job-files'
  and app_private.is_company_member(split_part(name, '/', 1))
  and app_private.has_company_permission(split_part(name, '/', 1), 'files.manage')
);

drop policy if exists "file managers delete quest job file objects" on storage.objects;
create policy "file managers delete quest job file objects" on storage.objects
for delete to authenticated
using (
  bucket_id = 'quest-job-files'
  and app_private.is_company_member(split_part(name, '/', 1))
  and app_private.has_company_permission(split_part(name, '/', 1), 'files.manage')
);
