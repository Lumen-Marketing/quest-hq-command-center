-- Follow-up to 202607311200_foreign_key_indexes.sql.
--
-- That migration tried to index calendar_events(created_by) as
-- `calendar_events_created_by_idx`, but an index of that NAME already existed on
-- (company_id, created_by). `create index if not exists` matches on the name, so it
-- silently did nothing — and a composite index only covers a foreign key when the FK
-- columns are a leading prefix. (company_id, created_by) does not cover created_by alone,
-- so the constraint was still enforced by a sequential scan.
--
-- A distinct name is the fix. Worth remembering generally: `if not exists` on an index
-- name is not a guarantee that the index you wanted exists, only that the NAME is taken.
create index if not exists calendar_events_created_by_fk_idx
  on public.calendar_events (created_by);
