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
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!baseUrl() || !serviceKey()) return json(response, 501, { error: 'Client portal API is not configured.' });
  const body = await readJson(request).catch(() => ({}));
  const session = verifySession(body.session);
  if (!session) return json(response, 401, { error: 'Portal session expired.' });
  const details = body.details && typeof body.details === 'object' ? body.details : {};
  const result = await supabaseFetch('/rest/v1/client_portal_events', {
    method: 'POST',
    body: JSON.stringify({
      company_id: session.company_id,
      portal_id: session.portal_id,
      event_type: String(body.event_type || 'portal.exported').slice(0, 80),
      guest_name: String(session.guest_name || 'Guest').slice(0, 80),
      details,
    }),
  });
  return json(response, result.ok ? 200 : result.status, { saved: result.ok });
}
