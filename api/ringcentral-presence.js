import { createClient } from '@supabase/supabase-js';
import { setApiHeaders, errorResponse, HttpError } from './_lib/http-security.js';
import { resolveCompanyAdmin } from './_lib/user-auth.js';
import { createRingCentralClient, deriveDisplayStatus } from './_lib/ringcentral.js';

const CACHE_TTL_MS = 10_000;
// When RingCentral is refusing us (rate limit / outage), serve the stored
// snapshot and hold it a little longer so we stop poking an upstream that is
// already saying no.
const STALE_CACHE_TTL_MS = 30_000;

const env = (name) => process.env[name] || '';
const cache = new Map(); // companyId -> { expiresAt, payload }

function serverClient() {
  return createClient(
    env('SUPABASE_URL') || env('VITE_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * RingCentral reports what a status IS, never how long it has been held, so we
 * keep the clock ourselves: carry `status_since` forward while the status is
 * unchanged, reset it the moment it differs. `changed` is what needs writing —
 * an idle team produces zero writes.
 */
export function reconcilePresence(previousRows, liveRows, now = new Date()) {
  const stamp = new Date(now).toISOString();
  const previous = new Map((previousRows || []).map((row) => [String(row.extension_id), row]));
  const rows = [];
  const changed = [];

  for (const live of liveRows || []) {
    const extensionId = String(live.extension_id);
    const before = previous.get(extensionId);
    const unchanged = before && before.display_status === live.display_status;
    const row = {
      extension_id: extensionId,
      display_status: live.display_status,
      status_since: unchanged ? before.status_since : stamp,
    };
    rows.push(row);
    if (!unchanged) changed.push(row);
  }

  return { rows, changed };
}

export default async function handler(request, response) {
  setApiHeaders(response);
  try {
    if (request.method !== 'GET') throw new HttpError(405, 'Method not allowed.');

    const companyId = String(request.query?.company_id || '').trim();
    if (!companyId) throw new HttpError(400, 'company_id is required.');

    const supabaseUrl = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
    const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
    if (!supabaseUrl || !serviceKey) throw new HttpError(503, 'Presence is not configured.');

    const caller = await resolveCompanyAdmin(request, { supabaseUrl, serviceKey, companyId });
    if (!caller.isAdmin) return response.status(403).json({ error: 'Only workspace admins can view the live board.' });

    const cached = cache.get(companyId);
    if (cached && cached.expiresAt > Date.now()) return response.status(200).json(cached.payload);

    const client = serverClient();
    const account = await client
      .from('ringcentral_accounts')
      .select('rc_account_id,credential_key')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .maybeSingle();
    if (account.error) throw new HttpError(503, 'Could not check the RingCentral connection.');
    if (!account.data) {
      return response.status(200).json({ connected: false, agents: [], stale: false });
    }

    const jwt = env(account.data.credential_key);
    if (!jwt) throw new HttpError(503, 'RingCentral is not configured.');

    const ringcentral = createRingCentralClient({
      clientId: env('RINGCENTRAL_CLIENT_ID'),
      clientSecret: env('RINGCENTRAL_CLIENT_SECRET'),
      jwt,
      serverUrl: env('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
    });

    const [directory, stored] = await Promise.all([
      client.from('ringcentral_extensions').select('extension_id,extension_number,name').eq('company_id', companyId),
      client.from('ringcentral_presence').select('extension_id,display_status,status_since').eq('company_id', companyId),
    ]);
    const names = new Map((directory.data || []).map((row) => [String(row.extension_id), row]));

    // Try live presence, but never let a RingCentral hiccup or rate-limit turn
    // into a visible "can't reach RingCentral" error. If the upstream call
    // fails we serve the last-known statuses from the database instead, and
    // cache that briefly so a burst of requests backs off RingCentral rather
    // than hammering it while it is already refusing us.
    let rows;
    let stale = false;
    try {
      const records = await ringcentral.fetchPaged(
        `/restapi/v1.0/account/${account.data.rc_account_id}/presence`,
        { detailedTelephonyState: 'true' },
      );
      const live = records
        .map((record) => ({
          extension_id: String(record?.extension?.id || ''),
          display_status: deriveDisplayStatus(record),
        }))
        .filter((row) => row.extension_id && names.has(row.extension_id));

      const reconciled = reconcilePresence(stored.data || [], live, new Date());
      rows = reconciled.rows;
      if (reconciled.changed.length) {
        await client.from('ringcentral_presence').upsert(
          reconciled.changed.map((row) => ({ ...row, company_id: companyId, updated_at: new Date().toISOString() })),
          { onConflict: 'company_id,extension_id' },
        );
      }
    } catch (upstreamError) {
      stale = true;
      rows = (stored.data || [])
        .map((row) => ({ extension_id: String(row.extension_id), display_status: row.display_status, status_since: row.status_since }))
        .filter((row) => names.has(row.extension_id));
    }

    const payload = {
      connected: true,
      agents: rows.map((row) => ({
        extension_id: row.extension_id,
        extension_number: names.get(row.extension_id)?.extension_number || '',
        name: names.get(row.extension_id)?.name || '',
        status: row.display_status,
        since: row.status_since,
      })),
      fetched_at: new Date().toISOString(),
      stale,
    };
    cache.set(companyId, { expiresAt: Date.now() + (stale ? STALE_CACHE_TTL_MS : CACHE_TTL_MS), payload });

    return response.status(200).json(payload);
  } catch (error) {
    return errorResponse(response, error, 'Could not load live status.');
  }
}
