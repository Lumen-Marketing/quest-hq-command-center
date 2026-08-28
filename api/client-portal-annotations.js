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
    // Ownership is the session's guest id, held inside the annotation's own payload.
    //
    // It used to be `guest_name`, which the caller chooses when they open the portal. Anyone
    // with the link could reopen it as somebody else's name and inherit their annotations —
    // and the bulk save with an empty list would then delete every one of them. The name is
    // still stored, because it is what the team sees on the markup; it just no longer decides
    // who may change it.
    //
    // The id lives in `payload` rather than a column of its own so this needed no migration:
    // payload is already jsonb, already rewritten server-side (see `payload.author` below),
    // and PostgREST can filter it with `payload->>guest_id`. Annotations written before this
    // change carry no id, so they match no guest and can no longer be deleted through the
    // public endpoint at all — the safe direction. Portal managers still reach them through
    // the authenticated path.
    const guestId = String(session.guest_id || '');
    const ownedByThisGuest = guestId ? `&payload->>guest_id=eq.${encodeURIComponent(guestId)}` : '';

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
      // A session with no guest id (issued before this change, or malformed) owns nothing.
      if (!guestId) return jsonResponse(200, { deleted: false });
      const result = await db(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(annotationId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}${ownedByThisGuest}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
      if (!result.ok) return jsonResponse(result.status, { deleted: false });
      const removed = await result.json().catch(() => []);
      // 2xx with an empty body means the id was not this guest's annotation — report honestly.
      return jsonResponse(200, { deleted: Array.isArray(removed) && removed.length > 0 });
    }

    const sanitize = (annotation, documentId) => {
      const payload = annotation.payload && typeof annotation.payload === 'object' ? { ...annotation.payload } : {};
      payload.author = 'guest';
      // Stamped from the session, after the spread, so a caller cannot supply their own.
      payload.guest_id = guestId;
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
      // Writing over an id that belongs to a different guest: keep everything that is theirs
      // (including their guest_id, or this would hand ownership to the caller) and accept only
      // the comment thread, which is how a second guest replies to somebody else's markup.
      const existingGuestId = existing && existing.payload && typeof existing.payload === 'object'
        ? String(existing.payload.guest_id || '')
        : '';
      if (existing && (!guestId || existingGuestId !== guestId)) {
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
    const scope = `portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}&document_id=eq.${encodeURIComponent(documentId)}${ownedByThisGuest}`;

    // Without a guest id there is nothing this caller owns, so a bulk save must not be able
    // to clear the document. Refuse rather than fall through to a scope that matches everyone.
    if (!guestId) return jsonResponse(200, { annotations: [], saved: false });

    // Empty save clears this guest's annotations for the document.
    if (!rows.length) {
      const del = await db(`/rest/v1/client_portal_annotations?${scope}`, { method: 'DELETE' });
      return jsonResponse(del.ok ? 200 : del.status, { annotations: [], saved: del.ok });
    }

    // Upsert the new set FIRST so a failed write can never destroy existing annotations
    // (the previous delete-then-insert wiped everything if the insert failed).
    const result = await db('/rest/v1/client_portal_annotations?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(rows),
    });
    if (!result.ok) return jsonResponse(result.status, { annotations: [], saved: false });

    // Then remove this guest's stale rows for the document (present before, absent now),
    // one exact id at a time so the filter is always URL-safe.
    const keep = new Set(rows.map((row) => row.id));
    const existingRes = await db(`/rest/v1/client_portal_annotations?${scope}&select=id`);
    const existingRows = existingRes.ok ? await existingRes.json().catch(() => []) : [];
    for (const staleId of existingRows.map((row) => row.id).filter((id) => !keep.has(id))) {
      await db(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(staleId)}&${scope}`, { method: 'DELETE' });
    }
    return jsonResponse(200, { annotations: await result.json(), saved: true });
  },
);
