import crypto from 'node:crypto';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
};

const env = (key) => process.env[key] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function verifySession(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', env('CLIENT_PORTAL_SESSION_SECRET') || serviceKey()).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function supabaseFetch(path, options = {}) {
  return fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      ...(options.body ? { 'Content-Type': 'application/json', Prefer: 'return=representation' } : {}),
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

  const documentId = String(body.document_id || '').trim();
  const annotations = Array.isArray(body.annotations) ? body.annotations : [];
  if (!documentId) return json(response, 400, { error: 'document_id is required.' });
  const rows = annotations.slice(0, 500).map((annotation) => ({
    company_id: session.company_id,
    portal_id: session.portal_id,
    document_id: documentId,
    page_number: Number(annotation.page_number || annotation.page || 1) || 1,
    guest_name: String(annotation.guest_name || session.guest_name || 'Guest').slice(0, 80),
    annotation_type: String(annotation.annotation_type || annotation.type || 'markup').slice(0, 40),
    payload: annotation.payload && typeof annotation.payload === 'object' ? annotation.payload : annotation,
  }));

  await supabaseFetch(`/rest/v1/client_portal_annotations?portal_id=eq.${encodeURIComponent(session.portal_id)}&document_id=eq.${encodeURIComponent(documentId)}&guest_name=eq.${encodeURIComponent(session.guest_name || 'Guest')}`, { method: 'DELETE' });
  if (!rows.length) return json(response, 200, { annotations: [] });
  const result = await supabaseFetch('/rest/v1/client_portal_annotations', { method: 'POST', body: JSON.stringify(rows) });
  return json(response, result.ok ? 200 : result.status, { annotations: result.ok ? await result.json() : [], saved: result.ok });
}
