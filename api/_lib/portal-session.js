// Portal Session seam. A guest opening a Client Portal receives a short-lived
// signed token; every later guest request presents it. Sign lives here, verify
// lives here, and nothing else in the codebase re-implements the HMAC.

import crypto from 'node:crypto';
import { supabaseServiceKey } from './supabase-admin.js';

// Falls back to the service key so a session secret is optional in dev, matching
// the original per-file behavior.
const sessionSecret = () => process.env.CLIENT_PORTAL_SESSION_SECRET || supabaseServiceKey();

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
