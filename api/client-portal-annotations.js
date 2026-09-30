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

    // `id` is the primary key, so every existing row's id is a uuid. Anything else cannot match
    // an existing row and would be rejected by the column type, so it is refused up front rather
    // than being interpolated into a query. This is what makes the `in.(...)` list below safe:
    // without it a caller-supplied id would be a way to write arbitrary filter syntax.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const enc = (value) => encodeURIComponent(String(value ?? ''));

    // Resolve the ids the caller is trying to write, so ownership is decided from what is
    // actually stored rather than from what the caller asserts.
    //
    // Deliberately NOT filtered by portal: the question being answered is "does this id already
    // exist, and if so who owns it", and an id that exists under a different portal is precisely
    // the case that has to be caught. Filtering by portal first would make that row invisible and
    // the subsequent `on_conflict=id` upsert would then move it into the caller's portal.
    const readByIds = async (ids) => {
      const unique = [...new Set(ids)];
      if (!unique.length) return [];
      const found = [];
      // PostgREST `in.()` lists go in the query string, so they are chunked to stay well inside
      // any URL length limit rather than relying on a single large request.
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100);
        const result = await db(
          `/rest/v1/client_portal_annotations?id=in.(${enc(batch.join(','))})&select=id,portal_id,company_id,payload`,
        );
        if (!result.ok) return null; // caller must not treat this as "the row does not exist"
        const rows = await result.json().catch(() => null);
        if (!Array.isArray(rows)) return null;
        found.push(...rows);
      }
      return found;
    };

    const ownerOf = (row) => (row?.payload && typeof row.payload === 'object'
      ? String(row.payload.guest_id || '')
      : '');

    // A document id is a uuid FK into `client_portal_documents`. Confining annotations to a
    // document that belongs to this session's portal keeps a guest from writing rows against
    // another portal's document, which the FK would otherwise happily accept.
    const assertDocumentInPortal = async (documentId) => {
      const result = await db(
        `/rest/v1/client_portal_documents?id=eq.${enc(documentId)}&portal_id=eq.${enc(session.portal_id)}&company_id=eq.${enc(session.company_id)}&select=id`,
      );
      if (!result.ok) throw new HttpError(503, 'Could not verify this document. Try again.');
      const rows = await result.json().catch(() => null);
      if (!Array.isArray(rows) || !rows.length) throw new HttpError(404, 'Document not found.');
    };

    if (req.method === 'GET') {
      const documentId = String(query.document_id || '').trim();
      const filter = documentId ? `&document_id=eq.${enc(documentId)}` : '';
      const result = await db(`/rest/v1/client_portal_annotations?portal_id=eq.${enc(session.portal_id)}&company_id=eq.${enc(session.company_id)}${filter}&select=id,document_id,page_number,guest_name,annotation_type,payload,resolved_at,created_at,updated_at&order=created_at.asc`);
      if (!result.ok) return jsonResponse(result.status, { annotations: [] });
      const rows = await result.json().catch(() => []);
      // Guests in one portal are meant to see each other's markup — that is what the comment
      // thread is. But `payload.guest_id` is the internal ownership key, and it is the raw
      // material for claiming somebody else's annotation. Every write now resolves ownership
      // server-side, so nothing legitimate needs it; strip it on the way out.
      const annotations = (Array.isArray(rows) ? rows : []).map((row) => {
        if (!row || typeof row !== 'object') return row;
        if (!row.payload || typeof row.payload !== 'object' || !('guest_id' in row.payload)) return row;
        const { guest_id: _internal, ...payload } = row.payload;
        return { ...row, payload };
      });
      return jsonResponse(200, { annotations });
    }

    const guestName = String(session.guest_name || 'Guest').slice(0, 80);

    if (body.action === 'delete') {
      const annotationId = String(body.annotation_id || '').trim();
      if (!annotationId) throw new HttpError(400, 'annotation_id is required.');
      // A session with no guest id (issued before this change, or malformed) owns nothing.
      if (!guestId) return jsonResponse(200, { deleted: false });
      const result = await db(`/rest/v1/client_portal_annotations?id=eq.${enc(annotationId)}&portal_id=eq.${enc(session.portal_id)}${ownedByThisGuest}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
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
      if (!UUID_RE.test(String(body.annotation.id || ''))) throw new HttpError(400, 'Invalid annotation id.');
      await assertDocumentInPortal(documentId);
      const row = sanitize(body.annotation, documentId);

      // Resolve the existing row by id ALONE. A portal-scoped read returns nothing when the id
      // lives in another portal, and the upsert below would then move that row into the caller's
      // portal — so the read has to be able to see across portals in order to refuse.
      const existingRows = await readByIds([row.id]);
      // A failed ownership read must not read as "no such row": that would skip the guard and
      // let the caller take the row. Fail the request instead.
      if (existingRows === null) throw new HttpError(503, 'Could not verify this markup. Try again.');
      const existing = existingRows[0];
      if (existing && String(existing.portal_id || '') !== String(session.portal_id || '')) {
        throw new HttpError(404, 'Annotation not found.');
      }
      // Writing over an id that belongs to a different guest: keep everything that is theirs
      // (including their guest_id, or this would hand ownership to the caller) and accept only
      // the comment thread, which is how a second guest replies to somebody else's markup.
      if (existing && (!guestId || ownerOf(existing) !== guestId)) {
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

    // Without a guest id there is nothing this caller owns, so a bulk save must not be able
    // to clear the document. Refuse rather than fall through to a scope that matches everyone.
    // Checked before the document read so a legacy session gets the same answer as it always
    // did, without spending a round trip.
    if (!guestId) return jsonResponse(200, { annotations: [], saved: false });

    // Every id has to be a real uuid before it can go anywhere near a query. `sanitize` mints
    // one when the caller omits it, so only a supplied id is checked.
    for (const annotation of annotations.slice(0, 500)) {
      const supplied = String(annotation?.id || '');
      if (supplied && !UUID_RE.test(supplied)) throw new HttpError(400, 'Invalid annotation id.');
    }

    await assertDocumentInPortal(documentId);
    const rows = annotations.slice(0, 500).map((annotation) => sanitize(annotation, documentId));
    const scope = `portal_id=eq.${enc(session.portal_id)}&company_id=eq.${enc(session.company_id)}&document_id=eq.${enc(documentId)}${ownedByThisGuest}`;

    // Empty save clears this guest's annotations for the document.
    if (!rows.length) {
      const del = await db(`/rest/v1/client_portal_annotations?${scope}`, { method: 'DELETE' });
      return jsonResponse(del.ok ? 200 : del.status, { annotations: [], saved: del.ok });
    }

    // THIS is the guard the single-annotation path has always had and this one did not.
    //
    // `sanitize` accepts a caller-supplied `id`, and the upsert below is `ON CONFLICT (id) DO
    // UPDATE`, so a bulk save naming somebody else's annotation would overwrite that row — taking
    // `guest_id` with it, which then also satisfies the delete filter below. The GET hands out
    // every guest's annotation ids in the portal, so no id had to be guessed.
    //
    // Resolve every id this save touches and refuse the whole request if any of them belongs to
    // somebody else. Refusing the batch rather than silently dropping the row is deliberate: a
    // save that quietly lost one of the caller's annotations would look like a success.
    const existingRows = await readByIds(rows.map((row) => row.id));
    if (existingRows === null) throw new HttpError(503, 'Could not verify your markup. Try again.');
    for (const existing of existingRows) {
      if (String(existing.portal_id || '') !== String(session.portal_id || '')) {
        throw new HttpError(404, 'Annotation not found.');
      }
      if (ownerOf(existing) !== guestId) {
        throw new HttpError(409, 'One of those comments belongs to another guest.');
      }
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
    const staleRes = await db(`/rest/v1/client_portal_annotations?${scope}&select=id`);
    const staleRows = staleRes.ok ? await staleRes.json().catch(() => []) : [];
    for (const staleId of staleRows.map((row) => row.id).filter((id) => !keep.has(id))) {
      await db(`/rest/v1/client_portal_annotations?id=eq.${enc(staleId)}&${scope}`, { method: 'DELETE' });
    }
    return jsonResponse(200, { annotations: await result.json(), saved: true });
  },
);
