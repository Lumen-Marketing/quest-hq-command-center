// Portal Session seam. A guest opening a Client Portal receives a short-lived
// signed token; every later guest request presents it. Sign lives here, verify
// lives here, and nothing else in the codebase re-implements the HMAC.

import crypto from 'node:crypto';
import { supabaseServiceKey } from './supabase-admin.js';

// The signing secret.
//
// Dev may fall back to the service key so a portal can be opened without extra setup.
// PRODUCTION MAY NOT: that would make the most privileged credential in the system double as
// the portal token signing key, and would tie service-key rotation to invalidating every live
// guest session. Outside development a missing secret is a configuration fault, not a default.
function sessionSecret() {
  const configured = process.env.CLIENT_PORTAL_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CLIENT_PORTAL_SESSION_SECRET is required in production.');
  }
  return supabaseServiceKey();
}

const eq = (value) => `eq.${encodeURIComponent(String(value ?? ''))}`;

/**
 * Is the portal behind this session still open?
 *
 * A signature only proves the session was issued; it says nothing about whether the portal is
 * still meant to be readable. `client-portal-open` checks `status=eq.active` once, at open
 * time, and then hands out a six-hour token — so before this existed, revoking a leaked link
 * did not end the sessions already riding on it. The guest kept downloading job documents for
 * the rest of the token's life and nothing in the product said so.
 *
 * Every session-authenticated request therefore re-reads the portal. One extra round trip
 * against a primary-key filter, in exchange for revocation that actually revokes.
 */
export async function portalSessionStillValid(db, session) {
  const portalId = String(session?.portal_id || '');
  const companyId = String(session?.company_id || '');
  if (!portalId || !companyId) return false;

  const result = await db(
    `/rest/v1/client_portals?id=${eq(portalId)}&company_id=${eq(companyId)}&status=eq.active&select=id`,
  ).catch(() => null);
  if (!result?.ok) return false;

  const rows = await result.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

export function signPortalSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyPortalSession(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
