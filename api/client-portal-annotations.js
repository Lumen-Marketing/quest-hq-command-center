import crypto from 'node:crypto';
import { defineEndpoint, jsonResponse } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

export default defineEndpoint(
  {
    method: ['GET', 'POST'],
    auth: 'portal-session',
    rateLimit: { namespace: 'client-portal-annotations', limit: 120, windowMs: 10 * 60 * 1000 },
    // Bulk saves carry up to 500 annotations, so the body cap is generous.
    bodyLimitBytes: 2 * 1024 * 1024,
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ req, session, body, query, db }) => {
    if (req.method === 'GET') {
      const documentId = String(query.document_id || '').trim();
      const filter = documentId ? `&document_id=eq.${encodeURIComponent(documentId)}` : '';
      const result = await db(`/rest/v1/client_portal_annotations?portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}${filter}&select=id,document_id,page_number,guest_name,annotation_type,payload,resolved_at,created_at,updated_at&order=created_at.asc`);
      return jsonResponse(result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [] });
    }

    const guestName = String(session.guest_name || 'Guest').slice(0, 80);

    if (body.action === 'delete') {
      const annotationId = String(body.annotation_id || '').trim();
      if (!annotationId) throw new HttpError(400, 'annotation_id is required.');
      const result = await db(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(annotationId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&guest_name=eq.${encodeURIComponent(guestName)}`, { method: 'DELETE' });
      return jsonResponse(result.ok ? 200 : result.status, { deleted: result.ok });
    }

    const sanitize = (annotation, documentId) => {
      const payload = annotation.payload && typeof annotation.payload === 'object' ? { ...annotation.payload } : {};
      payload.author = 'guest';
      return {
        id: String(annotation.id || crypto.randomUUID()),
        company_id: session.company_id,
        portal_id: session.portal_id,
        document_id: documentId,
        page_number: Number(annotation.page_number || annotation.page || 1) || 1,
        guest_name: guestName,
        annotation_type: String(annotation.annotation_type || annotation.type || 'markup').slice(0, 40),
        payload,
      };
    };

    if (body.annotation && typeof body.annotation === 'object') {
      const documentId = String(body.document_id || body.annotation.document_id || '').trim();
      if (!documentId) throw new HttpError(400, 'document_id is required.');
      const row = sanitize(body.annotation, documentId);
      const existingRes = await db(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(row.id)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&select=guest_name,annotation_type,page_number,payload`);
      const existing = existingRes.ok ? (await existingRes.json())[0] : null;
      if (existing && String(existing.guest_name || '') !== guestName) {
        const incomingThread = Array.isArray(row.payload?.thread) ? row.payload.thread : [];
        row.guest_name = existing.guest_name;
        row.annotation_type = existing.annotation_type;
        row.page_number = existing.page_number;
        row.payload = { ...(existing.payload && typeof existing.payload === 'object' ? existing.payload : {}), thread: incomingThread };
      }
      const result = await db('/rest/v1/client_portal_annotations?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(row),
      });
      return jsonResponse(result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [], saved: result.ok });
    }

    const documentId = String(body.document_id || '').trim();
    const annotations = Array.isArray(body.annotations) ? body.annotations : [];
    if (!documentId) throw new HttpError(400, 'document_id is required.');
    const rows = annotations.slice(0, 500).map((annotation) => sanitize(annotation, documentId));
    await db(`/rest/v1/client_portal_annotations?portal_id=eq.${encodeURIComponent(session.portal_id)}&document_id=eq.${encodeURIComponent(documentId)}&guest_name=eq.${encodeURIComponent(guestName)}`, { method: 'DELETE' });
    if (!rows.length) return jsonResponse(200, { annotations: [] });
    const result = await db('/rest/v1/client_portal_annotations', { method: 'POST', body: JSON.stringify(rows) });
    return jsonResponse(result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [], saved: result.ok });
  },
);
