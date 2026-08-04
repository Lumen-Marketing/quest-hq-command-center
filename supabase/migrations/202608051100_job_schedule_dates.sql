-- The calendar places a job across days, and jobs have never carried dates. Nullable on
-- purpose: an unscheduled job is a real state -- it is the first column of the pipeline --
-- and forcing a date at creation would make every lead look booked.
alter table public.jobs add column if not exists starts_on date;
alter table public.jobs add column if not exists ends_on date;

-- A job cannot finish before it starts. Cheap to enforce, and the alternative is a bar that
-- renders backwards or with a negative width.
alter table public.jobs drop constraint if exists jobs_schedule_order_check;
alter table public.jobs add constraint jobs_schedule_order_check
  check (starts_on is null or ends_on is null or ends_on >= starts_on);

create index if not exists jobs_schedule_idx on public.jobs (company_id, starts_on)
  where starts_on is not null;
