-- The covering index for wb_records.deleted_by.
--
-- Third time this gap has appeared, and the same shape each time: a migration adds a profile
-- foreign key, nothing indexes it, and the live performance advisor reports it. 20260828191625
-- did it for wb_records.created_by and 20260902192917 for wb_data_transfers.created_by. This one
-- is from 20260904012407_wb_records_soft_delete, which added deleted_by.
--
-- What an unindexed FK actually costs here: deleting or reassigning a profile has to sequentially
-- scan wb_records to prove no row still references it, and so does any incident-response lookup
-- of "what did this person delete". The table is small today (156 rows), so this is cheap
-- insurance rather than a fix for observed slowness -- which is the right time to add it, because
-- the scan grows with the table and the delete path is not one anybody watches.
--
-- Plain CREATE INDEX rather than CONCURRENTLY, matching the two migrations above: at 400 kB the
-- exclusive lock is measured in milliseconds, and CONCURRENTLY cannot run inside the transaction
-- the migration runner wraps this in.
create index if not exists wb_records_deleted_by_idx
  on public.wb_records(deleted_by);
