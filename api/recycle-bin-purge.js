import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';

const JOB_FILE_BUCKET = 'quest-job-files';
const BATCH_SIZE = 100;
// Evidence that this ran. Without it a stopped nightly purge looked exactly like a quiet one, and
// this is the job that deletes files and rows for good.
const PURGE_JOB = 'recycle_bin_purge';
const RUN_RETENTION_DAYS = 90;
const RUN_RETENTION_BATCH_SIZE = 500;
const env = (name) => process.env[name] || '';

function authorized(request) {
  const expected = `Bearer ${env('CRON_SECRET')}`;
  const supplied = String(request.headers.authorization || '');
  if (!env('CRON_SECRET') || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function serverClient() {
  return createClient(env('SUPABASE_URL') || env('VITE_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function startRun(client) {
  const started = await client.from('maintenance_job_runs')
    .insert({ job: PURGE_JOB, status: 'started', stage: 'started', selected_count: 0, deleted_count: 0 })
    .select('id')
    .single();
  if (started.error || !started.data?.id) throw new Error('maintenance run start failed');
  return started.data.id;
}

// Counts only: what was selected, what went, and where it stopped. No object paths, company ids or
// item labels -- the same rule the form-upload purge's ledger follows.
//
// It RETURNS the result instead of discarding it. A close that fails leaves the row at 'started'
// for ever, which this job's own tests call indistinguishable from a run still going, so every
// caller checks it and logs a sanitized code -- the shape api/form-upload-purge.js already uses.
async function finishRun(client, id, evidence) {
  if (!id) return { error: null };
  return client.from('maintenance_job_runs')
    .update({
      finished_at: new Date().toISOString(),
      status: evidence.status,
      selected_count: evidence.selected,
      deleted_count: evidence.deleted,
      stage: evidence.stage,
      error_code: evidence.errorCode || null,
    })
    .eq('id', id);
}

// `overrides` is how the tests reach in, the same seam api/form-upload-purge.js offers: this job
// deletes for good, so its evidence is worth exercising rather than reading.
export default async function handler(request, response, overrides = {}) {
  setApiHeaders(response);
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!(env('SUPABASE_URL') || env('VITE_SUPABASE_URL')) || !(env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'))) {
    return response.status(503).json({ error: 'Recycle purge is not configured.' });
  }

  const client = overrides.client || serverClient();
  let runId = null;
  // Hoisted on purpose. These are what the ledger reports if the run breaks AFTER the loop below
  // has already destroyed things -- at either sweep, say. Scoped inside the try they were
  // invisible to the catch, which therefore wrote zeros: a night that deleted somebody's files for
  // good was recorded as having touched nothing, the single outcome this ledger exists to make
  // impossible. They are counts, never identifiers.
  let selected = 0;
  let removedFiles = 0;
  try {
    // Bound the ledger before accepting work, then record that this run started. Fail closed if
    // either fails: deleting people's files with no record that it happened is the one outcome
    // worth refusing the whole run over.
    const retained = await client.rpc('purge_maintenance_job_runs', {
      p_older_than_days: RUN_RETENTION_DAYS,
      p_limit: RUN_RETENTION_BATCH_SIZE,
    });
    if (retained.error) throw retained.error;
    runId = await startRun(client);
  } catch {
    console.error('recycle_bin_purge_ledger_start_failed');
    return response.status(500).json({ error: 'Recycle purge failed.' });
  }

  try {
    const expired = await client
      .from('recycle_bin_items')
      .select('id,snapshot')
      .eq('status', 'active')
      .eq('source_type', 'file')
      .lt('restore_until', new Date().toISOString())
      .order('restore_until', { ascending: true })
      .limit(BATCH_SIZE);
    if (expired.error) throw expired.error;
    // Counted before the loop runs, so a break part-way through still reports what was in hand.
    selected = (expired.data || []).length;

    // Two different failures, kept apart. They used to share one list, so a refused ROW delete was
    // reported as a storage problem and sent whoever read it to the bucket. An item whose file went
    // but whose row would not counts as neither removed nor untouched: the sweep below finishes it.
    const storageFailures = [];
    const rowFailures = [];
    for (const item of expired.data || []) {
      const objectPath = String(item.snapshot?.object_path || '').trim();
      if (objectPath) {
        const removed = await client.storage.from(JOB_FILE_BUCKET).remove([objectPath]);
        if (removed.error) {
          storageFailures.push(item.id);
          continue;
        }
      }
      const deleted = await client.rpc('recycle_permanently_delete_item', { p_item_id: item.id });
      if (deleted.error) rowFailures.push(item.id);
      else removedFiles += 1;
    }
    const failureCount = storageFailures.length + rowFailures.length;

    const purged = await client.rpc('purge_expired_recycle_bin', { p_limit: 500 });
    if (purged.error) throw purged.error;

    // The App Builder bin sweeps here too, not only from pg_cron. Either alone is enough, which
    // is the point: pg_cron is unavailable on some plans, and this endpoint needs a deployment.
    // Both call the same bounded routine, so running twice in a night costs a no-op.
    const purgedRecords = await client.rpc('purge_expired_wb_records', { p_limit: 500 });
    if (purgedRecords.error) throw purgedRecords.error;

    const finished = await finishRun(client, runId, {
      // 'partial' when something refused to go: the run did its work, but not all of it.
      status: failureCount ? 'partial' : 'success',
      selected,
      deleted: removedFiles,
      // Name the bucket only when the bucket is what refused. A failed row delete has no stage of
      // its own -- this ledger's CHECK vocabulary was written for the form-upload purge, which has
      // no such step -- and inventing one is a migration, not a rename, so it reports the honest
      // 'unexpected' rather than the specific untruth it used to. `.ai/known-issues.md` carries
      // what that migration is; `.ai/plans/maintenance-ledger-row-delete-stage.proposed.sql` is it.
      stage: storageFailures.length ? 'storage_remove' : (rowFailures.length ? 'unexpected' : 'completed'),
      errorCode: storageFailures.length ? 'storage_remove_incomplete' : (rowFailures.length ? 'unexpected_failure' : null),
    });
    if (finished.error) console.error('recycle_bin_purge_ledger_finish_failed');
    return response.status(failureCount ? 207 : 200).json({
      removed_file_items: removedFiles,
      purged_database_items: Number(purged.data || 0),
      purged_app_records: Number(purgedRecords.data || 0),
      failed_file_items: storageFailures.length,
      failed_row_deletes: rowFailures.length,
    });
  } catch {
    // The ledger is the only place a failed night is written down, so it is closed before the
    // response even though the work itself is already lost -- and closed with the REAL counts,
    // because by the time we are here the loop may have destroyed a great deal.
    const failed = await finishRun(client, runId, {
      status: 'failed',
      selected,
      deleted: removedFiles,
      stage: 'unexpected',
      errorCode: 'unexpected_failure',
    }).catch(() => ({ error: new Error('finish threw') }));
    if (failed?.error) console.error('recycle_bin_purge_ledger_finish_failed');
    return response.status(500).json({ error: 'Recycle purge failed.' });
  }
}
