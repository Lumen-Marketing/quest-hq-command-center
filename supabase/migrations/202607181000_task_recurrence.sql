-- Recurring tasks: when a task with a recurrence rule is completed, the app
-- spawns the next occurrence. The rule is a compact string (e.g. "weekly:2",
-- "monthly:3", "weekly:1:5") produced and consumed by src/data/recurrence.js.
-- Null means a one-off task, so existing rows are unaffected.

alter table public.tasks
  add column if not exists recurrence text;

comment on column public.tasks.recurrence is
  'Recurrence rule for repeating tasks (e.g. daily:1, weekly:2, monthly:3, weekly:1:5). Null = one-off. Parsed by src/data/recurrence.js.';

-- No new RLS policies: recurrence is an ordinary column on tasks, already
-- covered by the table''s existing tenant policies.
