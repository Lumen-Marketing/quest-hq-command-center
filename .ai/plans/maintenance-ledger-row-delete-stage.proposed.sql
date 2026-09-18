-- PROPOSED. Not applied, and deliberately not in supabase/migrations yet.
--
-- `npm run tenancy:check` fails any migration dated after .ai/database/snapshot.json's capture day
-- (2026-09-17), because a snapshot that predates the schema cannot describe it. Refreshing that
-- snapshot needs live catalog access. So this waits here rather than red-lighting the build, in the
-- shape .ai/plans/app-builder-records-as-rows.proposed.sql already uses.
--
-- WHY
--
-- The nightly recycle-bin purge removes an item's file, then deletes its row. Those are two
-- different failures and the ledger can only describe one of them: `maintenance_job_runs` was
-- written for the form-upload purge, whose every stage is a storage or intent stage. There is no
-- step there that deletes a row, so there is no value here that means one refused to.
--
-- Until 2026-09-19 a refused row delete was recorded as 'storage_remove' /
-- 'storage_remove_incomplete', sending whoever read the run to a bucket that was fine.
-- api/recycle-bin-purge.js now reports 'unexpected' / 'unexpected_failure' for that case instead --
-- vague, but true. This replaces the vague value with the accurate one.
--
-- TO APPLY
--
--   1. Move this file to supabase/migrations/<YYYYMMDDHHMMSS>_maintenance_ledger_names_the_row_delete.sql
--   2. Apply it through the Supabase migration workflow (not an ordinary query path).
--   3. Re-query the live catalog, refresh .ai/database/snapshot.json from
--      .ai/database/snapshot-refresh.sql, and update the generated database pages, current-state.md
--      and manifest.json. Record the applied name AND version: they diverge, per
--      .ai/database/migration-names.md.
--   4. In api/recycle-bin-purge.js, change the rowFailures branch from
--      'unexpected' / 'unexpected_failure' to 'row_delete' / 'row_delete_incomplete', and update
--      tests/recycle-purge-run-ledger.test.mjs with it.
--   5. Remove "The purge ledger cannot say that a row delete failed" from .ai/known-issues.md.
--   6. npm run check, then deploy. Steps 3 and 4 ship together: the client must not write a value
--      the live CHECK does not yet allow, so the migration lands first.
--
-- Additive only. Every value either constraint accepts today it still accepts, so the currently
-- deployed client keeps working against the widened CHECKs between step 2 and step 4.

alter table public.maintenance_job_runs drop constraint if exists maintenance_job_runs_stage_check;
alter table public.maintenance_job_runs
  add constraint maintenance_job_runs_stage_check
  check (stage in (
    'started',
    'completed',
    'expired_intents',
    'candidate_query',
    'storage_remove',
    'storage_confirmation',
    'intent_cleanup',
    -- The recycle-bin purge's second half: the file is gone and the row that described it is not.
    'row_delete',
    'unexpected'
  ));

alter table public.maintenance_job_runs drop constraint if exists maintenance_job_runs_error_code_check;
alter table public.maintenance_job_runs
  add constraint maintenance_job_runs_error_code_check
  check (error_code is null or error_code in (
    'expired_intent_cleanup_failed',
    'candidate_query_failed',
    'storage_remove_failed',
    'storage_remove_incomplete',
    'unmatched_storage_response',
    'intent_cleanup_failed',
    -- Some rows survived their files. The sweep in the same run clears them, so this is evidence
    -- that it happened, not an alarm: purge_expired_recycle_bin skips a file item while its object
    -- still exists and purges the row once it is gone.
    'row_delete_incomplete',
    'unexpected_failure'
  ));

comment on table public.maintenance_job_runs is
  'Service-only concise maintenance evidence; counts and sanitized statuses only, for the form-upload and recycle-bin purges.';
