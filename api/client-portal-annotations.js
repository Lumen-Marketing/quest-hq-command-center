import crypto from 'node:crypto';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
};

const env = (key) => process.env[key] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
function isSupabaseSecretKey() {
  return serviceKey().startsWith('sb_secret_');
}
function supabaseHeaders(hasBody = false) {
  return {
    apikey: serviceKey(),
    ...(isSupabaseSecretKey() ? {} : { Authorization: `Bearer ${serviceKey()}` }),
    ...(hasBody ? { 'Content-Type': 'application/json', Prefer: 'return=representation' } : {}),
  };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function verifySession(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', env('CLIENT_PORTAL_SESSION_SECRET') || serviceKey()).update(body).digest('base64url');
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

async function supabaseFetch(path, options = {}) {
  return fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders(!!options.body),
      ...(options.headers || {}),
    },
  });
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') : {};
}

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return json(response, 405, { error: 'Method not allowed' });
  if (!baseUrl() || !serviceKey()) return json(response, 501, { error: 'Client portal API is not configured.' });
  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const body = request.method === 'POST' ? await readJson(request).catch(() => ({})) : {};
  const session = verifySession(body.session || url.searchParams.get('session'));
  if (!session) return json(response, 401, { error: 'Portal session expired.' });

  if (request.method === 'GET') {
    const documentId = String(url.searchParams.get('document_id') || '').trim();
    const filter = documentId ? `&document_id=eq.${encodeURIComponent(documentId)}` : '';
    const result = await supabaseFetch(`/rest/v1/client_portal_annotations?portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}${filter}&select=id,document_id,page_number,guest_name,annotation_type,payload,resolved_at,created_at,updated_at&order=created_at.asc`);
    return json(response, result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [] });
  }

  const guestName = String(session.guest_name || 'Guest').slice(0, 80);

  // Delete a single annotation (guest may only remove their own markups).
  if (body.action === 'delete') {
    const annotationId = String(body.annotation_id || '').trim();
    if (!annotationId) return json(response, 400, { error: 'annotation_id is required.' });
    const result = await supabaseFetch(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(annotationId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&guest_name=eq.${encodeURIComponent(guestName)}`, { method: 'DELETE' });
    return json(response, result.ok ? 200 : result.status, { deleted: result.ok });
  }

  const sanitize = (annotation, documentId) => {
    const payload = annotation.payload && typeof annotation.payload === 'object' ? { ...annotation.payload } : {};
    payload.author = 'guest'; // server-enforced attribution for public link
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

  // Upsert a single annotation (create, move, or thread reply) without disturbing
  // markups authored by staff or other guests.
  if (body.annotation && typeof body.annotation === 'object') {
    const documentId = String(body.document_id || body.annotation.document_id || '').trim();
    if (!documentId) return json(response, 400, { error: 'document_id is required.' });
    const row = sanitize(body.annotation, documentId);
    // If this markup already exists and belongs to staff or another guest, only the
    // thread may change — never the original author, name, position, or type. This lets
    // a client reply to / edit replies on a drafting-team comment without hijacking it.
    const existingRes = await supabaseFetch(`/rest/v1/client_portal_annotations?id=eq.${encodeURIComponent(row.id)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&select=guest_name,annotation_type,page_number,payload`);
    const existing = existingRes.ok ? (await existingRes.json())[0] : null;
    if (existing && String(existing.guest_name || '') !== guestName) {
      const incomingThread = Array.isArray(row.payload?.thread) ? row.payload.thread : [];
      row.guest_name = existing.guest_name;
      row.annotation_type = existing.annotation_type;
      row.page_number = existing.page_number;
      row.payload = { ...(existing.payload && typeof existing.payload === 'object' ? existing.payload : {}), thread: incomingThread };
    }
    const result = await supabaseFetch('/rest/v1/client_portal_annotations?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(row),
    });
    return json(response, result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [], saved: result.ok });
  }

  // Bulk replace (legacy "Save markups") — replaces this guest's markups on a document.
  const documentId = String(body.document_id || '').trim();
  const annotations = Array.isArray(body.annotations) ? body.annotations : [];
  if (!documentId) return json(response, 400, { error: 'document_id is required.' });
  const rows = annotations.slice(0, 500).map((annotation) => sanitize(annotation, documentId));
  await supabaseFetch(`/rest/v1/client_portal_annotations?portal_id=eq.${encodeURIComponent(session.portal_id)}&document_id=eq.${encodeURIComponent(documentId)}&guest_name=eq.${encodeURIComponent(guestName)}`, { method: 'DELETE' });
  if (!rows.length) return json(response, 200, { annotations: [] });
  const result = await supabaseFetch('/rest/v1/client_portal_annotations', { method: 'POST', body: JSON.stringify(rows) });
  return json(response, result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [], saved: result.ok });
}
