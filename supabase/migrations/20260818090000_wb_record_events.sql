-- Scheduled calls and messages that belong to one App Builder record.
--
-- WHY A TABLE RATHER THAN THE RECORD ITSELF.
--
-- Everything an App Builder record holds lives in public.workspace_builder_state: one row per
-- company, the whole document in `doc jsonb`. Putting a scheduled call in there would mean the
-- entire company's App Builder document is rewritten to move one reminder -- the contention that
-- src/workspace/builder-merge.js already exists to survive -- and nothing outside the browser
-- could read it. A reminder that only a signed-in tab can see is not a reminder.
--
-- Not the workspace activity log either: that log records what HAS happened. These are dated in
-- the FUTURE, and mixing them into a feed sorted by time puts tomorrow's call above this
-- morning's edit.
--
-- So: rows, keyed to the record they were made on. The record itself is a JSON id rather than a
-- foreign key, which is the same limitation wb_intake_submissions is written around -- there is
-- no table of App Builder items to point at.

create table if not exists public.wb_record_events (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_id text not null,
  item_id text not null,
  kind text not null check (kind in ('call', 'sms')),
  -- What it is called on the card. "Follow Up" rather than the number.
  title text not null default '',
  -- A call's notes, or the message an SMS will send. One column: both are the thing that gets
  -- written ahead of time, and two would only differ by name.
  body text not null default '',
  -- Which number it is aimed at, resolved when it was scheduled. Kept rather than looked up
  -- again later: the record's phone field can change, and a reminder must ring the number the
  -- person actually meant.
  to_number text not null default '',
  scheduled_for timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'done', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  -- A done or cancelled event says when it stopped being pending; a scheduled one has not.
  constraint wb_record_events_completed_matches_status check (
    (status = 'scheduled' and completed_at is null) or (status <> 'scheduled')
  )
);

-- The card on a record reads exactly this: everything for one item, soonest first.
create index if not exists wb_record_events_by_item
  on public.wb_record_events (company_id, workspace_id, app_id, item_id, scheduled_for);

-- And a reminder sweep, when there is one, reads across records by when they are due.
create index if not exists wb_record_events_due
  on public.wb_record_events (company_id, status, scheduled_for)
  where status = 'scheduled';

alter table public.wb_record_events enable row level security;

-- Reading one is reading the record it belongs to, so it follows the workspace's view
-- permission. Making, moving or cancelling one is a change to that record's plan, which is the
-- manage permission -- the same split wb_intake_submissions uses.
drop policy if exists "members read record events" on public.wb_record_events;
create policy "members read record events" on public.wb_record_events
for select using (app_private.has_workspace_permission(workspace_id, 'workspaces.view'));

drop policy if exists "managers write record events" on public.wb_record_events;
create policy "managers write record events" on public.wb_record_events
for all using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- anon has no business here: unlike the intake tables there is no public page that reaches
-- these, so there is not even a service-role route to justify a grant.
revoke all on public.wb_record_events from anon;
grant select, insert, update, delete on public.wb_record_events to authenticated;
