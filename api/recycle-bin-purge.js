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
async function finishRun(client, id, evidence) {
  if (!id) return;
  await client.from('maintenance_job_runs')
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

    let removedFiles = 0;
    const failures = [];
    for (const item of expired.data || []) {
      const objectPath = String(item.snapshot?.object_path || '').trim();
      if (objectPath) {
        const removed = await client.storage.from(JOB_FILE_BUCKET).remove([objectPath]);
        if (removed.error) {
          failures.push(item.id);
          continue;
        }
      }
      const deleted = await client.rpc('recycle_permanently_delete_item', { p_item_id: item.id });
      if (deleted.error) failures.push(item.id);
      else removedFiles += 1;
    }

    const purged = await client.rpc('purge_expired_recycle_bin', { p_limit: 500 });
    if (purged.error) throw purged.error;

    // The App Builder bin sweeps here too, not only from pg_cron. Either alone is enough, which
    // is the point: pg_cron is unavailable on some plans, and this endpoint needs a deployment.
    // Both call the same bounded routine, so running twice in a night costs a no-op.
    const purgedRecords = await client.rpc('purge_expired_wb_records', { p_limit: 500 });
    if (purgedRecords.error) throw purgedRecords.error;

    const selected = (expired.data || []).length;
    await finishRun(client, runId, {
      // 'partial' when a file refused to go: the run did its work, but not all of it.
      status: failures.length ? 'partial' : 'success',
      selected,
      deleted: removedFiles,
      stage: failures.length ? 'storage_remove' : 'completed',
      errorCode: failures.length ? 'storage_remove_incomplete' : null,
    });
    return response.status(failures.length ? 207 : 200).json({
      removed_file_items: removedFiles,
      purged_database_items: Number(purged.data || 0),
      purged_app_records: Number(purgedRecords.data || 0),
      failed_file_items: failures.length,
    });
  } catch {
    // The ledger is the only place a failed night is written down, so it is closed before the
    // response even though the work itself is already lost.
    await finishRun(client, runId, {
      status: 'failed', selected: 0, deleted: 0, stage: 'unexpected', errorCode: 'unexpected_failure',
    }).catch(() => {});
    return response.status(500).json({ error: 'Recycle purge failed.' });
  }
}
