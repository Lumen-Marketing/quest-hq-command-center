-- A quote prices one roof, so the GAF measurements belong to the quote.
--
-- They are deliberately not on the contact: the Sales pipeline opens one deal per trade per
-- address, so a single customer can carry a re-roof and a repair at once, each with its own
-- report. Storing the measurements against the contact would have the second quote open on
-- the first one's roof.

alter table public.deals
  add column if not exists takeoff jsonb not null default '{}'::jsonb;

comment on column public.deals.takeoff is
  'GAF report measurements this quote was priced from: { calculator_id, measurements }.';
