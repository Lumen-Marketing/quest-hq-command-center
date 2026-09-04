import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

// How long an upload is allowed to sit unclaimed. A public form is filled in one sitting,
// so two days is generous; it exists so a slow submission is never swept out from under
// somebody mid-form.
const ABANDONED_AFTER_HOURS = 48;
const BATCH_SIZE = 200;
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
    return response.status(503).json({ error: 'Form upload purge is not configured.' });
  }

  try {
    const client = serverClient();
    const abandoned = await client.rpc('abandoned_form_uploads', {
      p_older_than_hours: ABANDONED_AFTER_HOURS,
      p_limit: BATCH_SIZE,
    });
    if (abandoned.error) throw abandoned.error;

    const paths = (abandoned.data || []).map((row) => String(row.object_path || '').trim()).filter(Boolean);
    if (!paths.length) return response.status(200).json({ removed_uploads: 0 });

    // Through the storage API, so the object leaves the bucket and not just the table.
    const removed = await client.storage.from(FORM_FILE_BUCKET).remove(paths);
    if (removed.error) throw removed.error;

    return response.status(200).json({ removed_uploads: (removed.data || []).length });
  } catch {
    return response.status(500).json({ error: 'Form upload purge failed.' });
  }
}
