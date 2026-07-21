// Authenticate the browser caller: resolve the Supabase user from the bearer
// token, then confirm active company membership. Mirrors the pattern already
// used by api/create-checkout-session.js.

const env = (key) => process.env[key] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');

export async function getUserFromBearer(req, fetchImpl = fetch) {
  const token = String(req?.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const res = await fetchImpl(`${baseUrl()}/auth/v1/user`, {
    headers: { apikey: serviceKey(), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function isActiveMember(db, companyId, profileId) {
  const path = `/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}`
    + `&profile_id=eq.${encodeURIComponent(profileId)}&status=eq.active&select=role`;
  const res = await db(path);
  if (!res.ok) return false;
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}
