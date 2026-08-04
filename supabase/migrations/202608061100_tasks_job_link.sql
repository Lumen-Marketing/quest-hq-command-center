-- Link a task to a job.
--
-- The v1 design's "Needs attention" panel is a checklist on the job with an assignee against
-- each line, marked "synced to My Queue". That sync is not a feature to build -- it is what
-- you get for free if the lines ARE tasks. Anything else means a second list of work that
-- nobody looks at, which is the problem the panel exists to solve.
--
-- tasks.project_id already exists but references public.projects, a different thing entirely.
alter table public.tasks
  add column if not exists job_id uuid references public.jobs(id) on delete cascade;

-- Partial: most tasks are not job tasks, and the job file only ever asks for the ones that are.
create index if not exists tasks_job_idx on public.tasks (job_id) where job_id is not null;
