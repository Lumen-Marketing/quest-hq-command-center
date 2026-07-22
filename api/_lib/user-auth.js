// Authenticate the browser caller: resolve the Supabase user from the bearer
// token, then confirm active company membership.
//
// Two entry points, kept side by side because they answer different questions
// and have different callers:
//   * getUserFromBearer + isActiveMember — "who is this, and are they a member?"
//     Used by create-checkout-session and sms-send, which then apply their own
//     rules. Returns null / false rather than throwing.
//   * resolveCompanyAdmin — "who is this, and are they an admin here?" in one
//     call, throwing HttpError so the endpoint module can turn it into a
//     response. Used by the RingCentral proxies. Server endpoints that return
//     data RLS never sees (anything proxied from a third party) must call this,
//     because RLS cannot protect what never touches a table.

import { HttpError } from './http-security.js';

const env = (key) => process.env[key] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');

const ADMIN_ROLES = new Set(['owner', 'admin', 'developer', 'construction_supervisor']);

function bearerToken(request) {
  const header = String(request?.headers?.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export async function getUserFromBearer(req, fetchImpl = fetch) {
  const token = bearerToken(req);
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

export async function resolveCompanyAdmin(request, { supabaseUrl, serviceKey: key, companyId, fetchImpl = fetch }) {
  const token = bearerToken(request);
  if (!token) throw new HttpError(401, 'Sign in to continue.');

  const base = String(supabaseUrl || '').replace(/\/$/, '');

  const userResponse = await fetchImpl(`${base}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: key },
  });
  if (!userResponse.ok) throw new HttpError(401, 'Sign in to continue.');

  const user = await userResponse.json();
  const profileId = String(user?.id || '');
  if (!profileId) throw new HttpError(401, 'Sign in to continue.');

  const query = new URLSearchParams({
    select: 'role,status',
    company_id: `eq.${companyId}`,
    profile_id: `eq.${profileId}`,
    status: 'eq.active',
    limit: '1',
  });
  const membershipResponse = await fetchImpl(`${base}/rest/v1/company_memberships?${query.toString()}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key, Accept: 'application/json' },
  });
  if (!membershipResponse.ok) throw new HttpError(403, 'You do not have access to this workspace.');

  const memberships = await membershipResponse.json();
  const membership = Array.isArray(memberships) ? memberships[0] : null;
  if (!membership) throw new HttpError(403, 'You do not have access to this workspace.');

  return {
    profileId,
    email: String(user?.email || '').trim().toLowerCase(),
    isAdmin: ADMIN_ROLES.has(String(membership.role || '').toLowerCase()),
  };
}
