// Minimal server-side Supabase caller for the public endpoints. Uses the
// service-role key (server-only) so a public route can invoke a SECURITY DEFINER
// RPC that anonymous browsers are no longer allowed to call directly. Mirrors the
// header handling already used by the other api/ endpoints.

const env = (name) => process.env[name] || '';

export const supabaseBaseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
export const supabaseServiceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
export const supabaseConfigured = () => Boolean(supabaseBaseUrl() && supabaseServiceKey());

const isSecretStyleKey = (key) => /^sb_secret_/i.test(key) || /^eyJ/i.test(key);

function serviceHeaders() {
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
    headers: serviceHeaders(),
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
