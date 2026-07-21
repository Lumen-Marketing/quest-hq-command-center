import crypto from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { signPortalSession } from './_lib/portal-session.js';

const sha256 = (value) => crypto.createHash('sha256').update(String(value || '')).digest('hex');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), String(salt || ''), 120000, 32, 'sha256').toString('hex');
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    rateLimit: { namespace: 'client-portal-open', limit: 10, windowMs: 10 * 60 * 1000 },
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ body, db }) => {
    const token = String(body.token || '').trim();
    const password = String(body.password || '');
    const guestName = String(body.guest_name || 'Guest').trim().slice(0, 80) || 'Guest';
    if (!token) throw new HttpError(400, 'Portal token is required.');

    const tokenHash = sha256(token);
    const portalResult = await db(`/rest/v1/client_portals?token_hash=eq.${encodeURIComponent(tokenHash)}&status=eq.active&select=id,company_id,job_id,title,client_name,client_email,status,password_hash,password_salt`);
    const portals = portalResult.ok ? await portalResult.json() : [];
    const portal = portals[0];
    if (!portal) throw new HttpError(404, 'Portal link is invalid or revoked.');

    if (portal.password_hash) {
      if (!password) throw new HttpError(401, 'Password required.', { password_required: true });
      const nextHash = hashPassword(password, portal.password_salt);
      if (!crypto.timingSafeEqual(Buffer.from(nextHash), Buffer.from(portal.password_hash))) {
        throw new HttpError(401, 'Incorrect portal password.', { password_required: true });
      }
    }

    await db(`/rest/v1/client_portals?id=eq.${encodeURIComponent(portal.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ last_opened_at: new Date().toISOString() }),
    }).catch(() => null);
    await db('/rest/v1/client_portal_events', {
      method: 'POST',
      body: JSON.stringify({
        company_id: portal.company_id,
        portal_id: portal.id,
        event_type: 'portal.opened',
        guest_name: guestName,
        details: {},
      }),
    }).catch(() => null);

    const docsResult = await db(`/rest/v1/client_portal_documents?portal_id=eq.${encodeURIComponent(portal.id)}&is_current=eq.true&select=id,company_id,portal_id,file_name,mime_type,size_bytes,page_count,version_group_id,version_number,is_current,review_status,scale,scale_unit,created_at&order=created_at.asc`);
    const documents = docsResult.ok ? await docsResult.json() : [];

    const session = signPortalSession({
      portal_id: portal.id,
      company_id: portal.company_id,
      guest_name: guestName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
    });

    return {
      session,
      portal: {
        id: portal.id,
        company_id: portal.company_id,
        job_id: portal.job_id,
        title: portal.title,
        client_name: portal.client_name,
        client_email: portal.client_email,
        password_required: !!portal.password_hash,
      },
      documents,
    };
  },
);
