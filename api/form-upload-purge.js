import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

// How long an upload is allowed to sit unclaimed. A public form is filled in one sitting,
// so two days is generous; it exists so a slow submission is never swept out from under
// somebody mid-form.
const ABANDONED_AFTER_HOURS = 48;
const BATCH_SIZE = 200;
const RUN_RETENTION_DAYS = 90;
const RUN_RETENTION_BATCH_SIZE = 500;
const PURGE_JOB = 'form_upload_purge';
const env = (name) => process.env[name] || '';

class FormUploadPurgeError extends Error {
  constructor(stage, errorCode, { selected = 0, deleted = 0 } = {}) {
    super(errorCode);
    this.stage = stage;
    this.errorCode = errorCode;
    this.selected = selected;
    this.deleted = deleted;
  }
}

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

function candidatePaths(rows) {
  const paths = new Set();
  for (const row of rows || []) {
    // The SQL routine already excludes submitted answers. Keep this defensive check so a
    // future broadened RPC result cannot make a claimed upload eligible in this caller.
    if (row?.claimed_at || row?.response_id) continue;
    const path = String(row?.object_path || '').trim();
    if (path) paths.add(path);
  }
  return [...paths];
}

function confirmedRemovalPaths(returned, requested) {
  const requestedSet = new Set(requested);
  const confirmed = new Set();
  let unmatchable = false;

  for (const item of Array.isArray(returned) ? returned : []) {
    const path = typeof item === 'string'
      ? item
      : (typeof item?.name === 'string' ? item.name : item?.path);
    if (!requestedSet.has(path)) {
      unmatchable = true;
      continue;
    }
    confirmed.add(path);
  }

  return { paths: [...confirmed], unmatchable };
}

// Kept injectable so the safety contract is covered with mocked Storage responses rather
// than inferred from source text. It deliberately treats a successful HTTP response with an
// incomplete or ambiguous item list as partial: only exact returned paths are subsequently
// cleared from the short-lived intent ledger.
export async function runFormUploadPurge(client, { now = () => new Date(), skipExpiredIntentCleanup = false } = {}) {
  if (!skipExpiredIntentCleanup) {
    const expiredIntents = await client.from('form_upload_intents')
      .delete()
      .is('claimed_at', null)
      .lt('expires_at', now().toISOString());
    if (expiredIntents.error) throw new FormUploadPurgeError('expired_intents', 'expired_intent_cleanup_failed');
  }

  const abandoned = await client.rpc('abandoned_form_uploads', {
    p_older_than_hours: ABANDONED_AFTER_HOURS,
    p_limit: BATCH_SIZE,
  });
  if (abandoned.error) throw new FormUploadPurgeError('candidate_query', 'candidate_query_failed');

  const paths = candidatePaths(abandoned.data);
  if (!paths.length) return { status: 'success', selected: 0, deleted: 0, stage: 'completed', errorCode: null };

  const removed = await client.storage.from(FORM_FILE_BUCKET).remove(paths);
  if (removed.error) {
    throw new FormUploadPurgeError('storage_remove', 'storage_remove_failed', { selected: paths.length });
  }

  const confirmed = confirmedRemovalPaths(removed.data, paths);
  if (confirmed.paths.length) {
    const cleared = await client.from('form_upload_intents')
      .delete()
      .is('claimed_at', null)
      .in('object_path', confirmed.paths);
    if (cleared.error) {
      throw new FormUploadPurgeError('intent_cleanup', 'intent_cleanup_failed', {
        selected: paths.length,
        deleted: confirmed.paths.length,
      });
    }
  }

  const partial = confirmed.unmatchable || confirmed.paths.length !== paths.length;
  return {
    status: partial ? 'partial' : 'success',
    selected: paths.length,
    deleted: confirmed.paths.length,
    stage: partial ? 'storage_confirmation' : 'completed',
    errorCode: partial
      ? (confirmed.unmatchable ? 'unmatched_storage_response' : 'storage_remove_incomplete')
      : null,
  };
}

async function startRun(client, now) {
  const started = await client.from('maintenance_job_runs')
    .insert({
      job: PURGE_JOB,
      started_at: now().toISOString(),
      status: 'started',
      selected_count: 0,
      deleted_count: 0,
      stage: 'started',
      error_code: null,
    })
    .select('id')
    .single();
  if (started.error || !started.data?.id) throw new Error('maintenance run start failed');
  return started.data.id;
}

async function finishRun(client, id, evidence, now) {
  return client.from('maintenance_job_runs')
    .update({
      finished_at: now().toISOString(),
      status: evidence.status,
      selected_count: evidence.selected,
      deleted_count: evidence.deleted,
      stage: evidence.stage,
      error_code: evidence.errorCode,
    })
    .eq('id', id);
}

function failureEvidence(error) {
  return {
    status: 'failed',
    selected: Number.isSafeInteger(error?.selected) ? error.selected : 0,
    deleted: Number.isSafeInteger(error?.deleted) ? error.deleted : 0,
    stage: error?.stage || 'unexpected',
    errorCode: error?.errorCode || 'unexpected_failure',
  };
}

export default async function handler(request, response, overrides = {}) {
  setApiHeaders(response);
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!(env('SUPABASE_URL') || env('VITE_SUPABASE_URL')) || !(env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'))) {
    return response.status(503).json({ error: 'Form upload purge is not configured.' });
  }

  try {
    const client = overrides.client || serverClient();
    const now = overrides.now || (() => new Date());

    // Keep the maintenance ledger bounded before accepting new work. If evidence cannot be
    // retained, fail closed rather than delete uploads without a durable run record.
    const retained = await client.rpc('purge_maintenance_job_runs', {
      p_older_than_days: RUN_RETENTION_DAYS,
      p_limit: RUN_RETENTION_BATCH_SIZE,
    });
    if (retained.error) {
      console.error('form_upload_purge_ledger_retention_failed');
      return response.status(500).json({ error: 'Form upload purge failed.' });
    }

    let runId;
    try {
      runId = await startRun(client, now);
    } catch {
      console.error('form_upload_purge_ledger_start_failed');
      return response.status(500).json({ error: 'Form upload purge failed.' });
    }

    let outcome;
    try {
      outcome = await runFormUploadPurge(client, { now });
    } catch (error) {
      try {
        const failed = await finishRun(client, runId, failureEvidence(error), now);
        if (failed.error) console.error('form_upload_purge_ledger_finish_failed');
      } catch {
        console.error('form_upload_purge_ledger_finish_failed');
      }
      return response.status(500).json({ error: 'Form upload purge failed.' });
    }

    let finished;
    try {
      finished = await finishRun(client, runId, outcome, now);
    } catch {
      console.error('form_upload_purge_ledger_finish_failed');
      return response.status(500).json({ error: 'Form upload purge failed.' });
    }
    if (finished.error) {
      console.error('form_upload_purge_ledger_finish_failed');
      return response.status(500).json({ error: 'Form upload purge failed.' });
    }

    return response.status(outcome.status === 'partial' ? 207 : 200).json({
      removed_uploads: outcome.deleted,
      selected_uploads: outcome.selected,
      status: outcome.status,
    });
  } catch {
    console.error('form_upload_purge_unexpected_failure');
    return response.status(500).json({ error: 'Form upload purge failed.' });
  }
}
