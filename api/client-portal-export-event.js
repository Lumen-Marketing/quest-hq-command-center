import { defineEndpoint, jsonResponse } from './_lib/endpoint.js';

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'portal-session',
    rateLimit: { namespace: 'client-portal-export-event', limit: 60, windowMs: 10 * 60 * 1000 },
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ session, body, db }) => {
    const details = body.details && typeof body.details === 'object' ? body.details : {};
    const result = await db('/rest/v1/client_portal_events', {
      method: 'POST',
      body: JSON.stringify({
        company_id: session.company_id,
        portal_id: session.portal_id,
        event_type: String(body.event_type || 'portal.exported').slice(0, 80),
        guest_name: String(session.guest_name || 'Guest').slice(0, 80),
        details,
      }),
    });
    return jsonResponse(result.ok ? 200 : result.status, { saved: result.ok });
  },
);
