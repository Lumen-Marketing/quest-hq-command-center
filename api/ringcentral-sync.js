import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';
import { createRingCentralClient, normalizeCallRecord, normalizeExtension } from './_lib/ringcentral.js';

const BACKFILL_DAYS = 90;
const ROLLING_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const env = (name) => process.env[name] || '';

function authorized(request) {
  const expected = `Bearer ${env('CRON_SECRET')}`;
  const supplied = String(request.headers.authorization || '');
  if (!env('CRON_SECRET') || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function serverClient() {
  return createClient(
    env('SUPABASE_URL') || env('VITE_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Pick the window to fetch. A company that has never been backfilled gets 90
 * days; everyone else gets a rolling three days. The window deliberately
 * overlaps previous runs — upserts make that free, and it means a missed run
 * heals itself instead of leaving a permanent hole.
 */
export function buildSyncWindow(state, now = new Date()) {
  const isBackfill = !state?.backfilled_through;
  const days = isBackfill ? BACKFILL_DAYS : ROLLING_DAYS;
  return {
    isBackfill,
    dateFrom: new Date(now.getTime() - days * DAY_MS).toISOString(),
    dateTo: new Date(now.getTime()).toISOString(),
  };
}

async function recordFailure(client, companyId, message) {
  const existing = await client
    .from('ringcentral_sync_state')
    .select('consecutive_failures')
    .eq('company_id', companyId)
    .maybeSingle();
  const failures = Number(existing.data?.consecutive_failures || 0) + 1;
  await client.from('ringcentral_sync_state').upsert({
    company_id: companyId,
    consecutive_failures: failures,
    last_error: String(message).slice(0, 500),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'company_id' });
}

async function syncCompany(client, account) {
  const companyId = account.company_id;
  const jwt = env(account.credential_key);
  if (!jwt) throw new Error(`Missing credential ${account.credential_key}.`);

  const ringcentral = createRingCentralClient({
    clientId: env('RINGCENTRAL_CLIENT_ID'),
    clientSecret: env('RINGCENTRAL_CLIENT_SECRET'),
    jwt,
    serverUrl: env('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
  });

  // Extensions first: calls are denormalized against them.
  const extensionRecords = await ringcentral.fetchPaged(`/restapi/v1.0/account/${account.rc_account_id}/extension`, { status: 'Enabled' });
  const extensionRows = extensionRecords.map((record) => normalizeExtension(record, companyId)).filter(Boolean);
  if (extensionRows.length) {
    const written = await client
      .from('ringcentral_extensions')
      .upsert(extensionRows.map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: 'company_id,extension_id' });
    if (written.error) throw written.error;
  }

  const extensions = new Map(extensionRows.map((row) => [row.extension_id, row]));

  const state = await client
    .from('ringcentral_sync_state')
    .select('backfilled_through')
    .eq('company_id', companyId)
    .maybeSingle();
  const window = buildSyncWindow(state.data, new Date());

  const callRecords = await ringcentral.fetchPaged(`/restapi/v1.0/account/${account.rc_account_id}/call-log`, {
    view: 'Simple',
    dateFrom: window.dateFrom,
    dateTo: window.dateTo,
  });
  const callRows = callRecords.map((record) => normalizeCallRecord(record, { companyId, extensions })).filter(Boolean);

  if (callRows.length) {
    const written = await client
      .from('ringcentral_calls')
      .upsert(callRows.map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: 'company_id,call_id' });
    if (written.error) throw written.error;
  }

  const now = new Date().toISOString();
  const saved = await client.from('ringcentral_sync_state').upsert({
    company_id: companyId,
    last_sync_at: now,
    backfilled_through: window.isBackfill ? now : (state.data?.backfilled_through || now),
    consecutive_failures: 0,
    last_error: '',
    updated_at: now,
  }, { onConflict: 'company_id' });
  if (saved.error) throw saved.error;

  return { company_id: companyId, extensions: extensionRows.length, calls: callRows.length, backfill: window.isBackfill };
}

export default async function handler(request, response) {
  setApiHeaders(response);
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!env('RINGCENTRAL_CLIENT_ID') || !env('RINGCENTRAL_CLIENT_SECRET')) {
    return response.status(503).json({ error: 'RingCentral is not configured.' });
  }
  // Without this the Supabase client constructor throws and the whole function
  // returns an opaque 500. A missing environment variable should say so.
  if (!(env('SUPABASE_URL') || env('VITE_SUPABASE_URL')) || !(env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'))) {
    return response.status(503).json({ error: 'Supabase is not configured for this environment.' });
  }

  const client = serverClient();
  const accounts = await client
    .from('ringcentral_accounts')
    .select('company_id,rc_account_id,credential_key')
    .eq('status', 'active');
  if (accounts.error) return response.status(500).json({ error: 'Sync failed.' });

  const synced = [];
  const failed = [];
  for (const account of accounts.data || []) {
    try {
      synced.push(await syncCompany(client, account));
    } catch (error) {
      failed.push(account.company_id);
      await recordFailure(client, account.company_id, error?.message || 'Unknown error');
    }
  }

  return response.status(failed.length ? 207 : 200).json({ synced, failed });
}
