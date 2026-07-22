// Supabase admin access seam. Owns base-URL resolution and the service-key
// header logic that every server function needs, so no handler re-declares it.
//
// Header rule preserves the client-portal convention exactly: only the new
// `sb_secret_` keys are sent as `apikey` alone; every other key (including a
// legacy service-role JWT) also carries `Authorization: Bearer`, which the
// Supabase Storage endpoints require.

const env = (key) => process.env[key] || '';

export const supabaseBaseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
export const supabaseServiceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
export const isSupabaseConfigured = () => Boolean(supabaseBaseUrl() && supabaseServiceKey());

// Alias kept for the public-* endpoints (public-invite-lookup,
// public-proposal-open, public-proposal-respond), which import this name.
// Same predicate; drop it once those handlers move onto the endpoint module.
export const supabaseConfigured = isSupabaseConfigured;

export function isSupabaseSecretKey() {
  return supabaseServiceKey().startsWith('sb_secret_');
}

export function supabaseHeaders(hasBody = false) {
  return {
    apikey: supabaseServiceKey(),
    ...(isSupabaseSecretKey() ? {} : { Authorization: `Bearer ${supabaseServiceKey()}` }),
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  };
}

// Returns a bound admin fetch: `db(path, options)` where `path` is a full
// PostgREST or Storage path (e.g. `/rest/v1/...`, `/storage/v1/...`).
export function createAdminFetch() {
  return async function supabaseAdminFetch(path, options = {}) {
    return fetch(`${supabaseBaseUrl()}${path}`, {
      ...options,
      headers: {
        ...supabaseHeaders(!!options.body),
        ...(options.headers || {}),
      },
    });
  };
}

// UNRESOLVED DIVERGENCE — needs a decision before this is relied on.
// The public-* endpoints arrived with a different secret-key predicate than the
// seam's: they also treat a legacy `eyJ...` service-role JWT as secret-style and
// therefore send `apikey` with NO `Authorization` header, whereas the seam sends
// `Authorization: Bearer` for that same key. Both are in production today via
// different call paths. This merge deliberately preserves each side's existing
// behaviour rather than picking a winner, so nothing changes at deploy time.
// Unify onto supabaseHeaders() once someone confirms which rule the deployed
// SUPABASE_SERVICE_ROLE_KEY actually needs.
const isSecretStyleKey = (key) => /^sb_secret_/i.test(key) || /^eyJ/i.test(key);

function rpcHeaders() {
  const key = supabaseServiceKey();
  return {
    apikey: key,
    ...(isSecretStyleKey(key) ? {} : { Authorization: `Bearer ${key}` }),
    'Content-Type': 'application/json',
  };
}

/**
 * Call a Postgres function via PostgREST as the service role.
 * Throws an Error with `.status` set to the RPC's own status on failure, so the
 * caller can pass a real error through instead of a blanket 500 (e.g. a
 * "Proposal is no longer open" business error should surface, not be masked).
 */
export async function supabaseRpc(fn, args) {
  const response = await fetch(`${supabaseBaseUrl()}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: rpcHeaders(),
    body: JSON.stringify(args || {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data && (data.message || data.error || data.hint)) || 'Request failed.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}
