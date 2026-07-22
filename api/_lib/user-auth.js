// Turns a browser bearer token into an identity plus a company-admin answer.
// Server endpoints that return data RLS never sees (anything proxied from a
// third party) must call this, because RLS cannot protect what never touches a
// table.

import { HttpError } from './http-security.js';

const ADMIN_ROLES = new Set(['owner', 'admin', 'developer', 'construction_supervisor']);

function bearerToken(request) {
  const header = String(request?.headers?.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export async function resolveCompanyAdmin(request, { supabaseUrl, serviceKey, companyId, fetchImpl = fetch }) {
  const token = bearerToken(request);
  if (!token) throw new HttpError(401, 'Sign in to continue.');

  const base = String(supabaseUrl || '').replace(/\/$/, '');

  const userResponse = await fetchImpl(`${base}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
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
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Accept: 'application/json' },
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
