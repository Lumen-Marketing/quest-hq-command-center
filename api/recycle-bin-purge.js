import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';

const JOB_FILE_BUCKET = 'quest-job-files';
const BATCH_SIZE = 100;
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

export default async function handler(request, response) {
  setApiHeaders(response);
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!(env('SUPABASE_URL') || env('VITE_SUPABASE_URL')) || !(env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'))) {
    return response.status(503).json({ error: 'Recycle purge is not configured.' });
  }

  try {
    const client = serverClient();
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
    return response.status(failures.length ? 207 : 200).json({
      removed_file_items: removedFiles,
      purged_database_items: Number(purged.data || 0),
      purged_app_records: Number(purgedRecords.data || 0),
      failed_file_items: failures.length,
    });
  } catch {
    return response.status(500).json({ error: 'Recycle purge failed.' });
  }
}
