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
