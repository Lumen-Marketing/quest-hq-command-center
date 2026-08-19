-- When a scheduled call or message has been announced, so it is announced exactly once.
--
-- "It also alarms when the date and time comes." The alarm is a notification row, raised by
-- whichever open session notices the time has passed -- there is no server job. That means two
-- tabs, or one tab reloaded, would each notice the same event and each raise the same alarm.
--
-- So the noticing is a CLAIM, not a read: an UPDATE that sets notified_at only where it is still
-- null. Postgres settles the race, the update returns the rows this session actually won, and
-- only those are announced. A session that lost gets nothing back and stays quiet.
--
-- Nullable and with no default: null means "not yet announced", which is the state every row
-- already in the table is in, and is what the partial index below is built on.
alter table public.wb_record_events
  add column if not exists notified_at timestamptz;

comment on column public.wb_record_events.notified_at is
  'When the reminder was announced. Claimed by an UPDATE ... where notified_at is null, so the alarm fires once even with several sessions open.';

-- The poller's query, and only it: everything still waiting to be announced. Partial, because a
-- row that has been announced is never looked at again by this path, and the table is expected to
-- be mostly announced rows.
create index if not exists wb_record_events_unnotified
  on public.wb_record_events (company_id, scheduled_for)
  where status = 'scheduled' and notified_at is null;
