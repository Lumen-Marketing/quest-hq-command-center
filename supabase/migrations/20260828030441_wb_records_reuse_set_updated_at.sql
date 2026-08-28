-- Drop the redundant touch function wb_records_table introduced.
--
-- public.set_updated_at() already existed and is what every other table's *_set_updated_at
-- trigger calls. wb_records_table declared a second function doing exactly the same thing:
-- one more definition to keep in step for no gain, and it picked up the default PUBLIC execute
-- grant, adding a fourth anon-executable function to the catalog for nothing.
--
-- 20260828025112 has been corrected to use the shared function directly, so a fresh
-- environment never creates the duplicate and this migration is a no-op there.

drop trigger if exists wb_records_set_updated_at on public.wb_records;
create trigger wb_records_set_updated_at
before update on public.wb_records
for each row execute function public.set_updated_at();

drop function if exists public.touch_wb_records_updated_at();
