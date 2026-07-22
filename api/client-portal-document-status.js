import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

const REVIEW_STATUSES = ['pending', 'approved', 'revision', 'rejected'];

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'portal-session',
    rateLimit: { namespace: 'client-portal-document-status', limit: 60, windowMs: 10 * 60 * 1000 },
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ session, body, db }) => {
    const documentId = String(body.document_id || '').trim();
    const reviewStatus = String(body.review_status || '').trim();
    if (!documentId) throw new HttpError(400, 'document_id is required.');
    if (!REVIEW_STATUSES.includes(reviewStatus)) throw new HttpError(400, 'Invalid review status.');

    const update = await db(`/rest/v1/client_portal_documents?id=eq.${encodeURIComponent(documentId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ review_status: reviewStatus }),
    });
    if (!update.ok) throw new HttpError(update.status, 'Could not update document status.');

    await db('/rest/v1/client_portal_events', {
      method: 'POST',
      body: JSON.stringify({
        company_id: session.company_id,
        portal_id: session.portal_id,
        event_type: 'document.status',
        guest_name: String(session.guest_name || 'Guest').slice(0, 80),
        details: { document_id: documentId, review_status: reviewStatus },
      }),
    });
    return { saved: true };
  },
);
