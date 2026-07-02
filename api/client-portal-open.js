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
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), String(salt || ''), 120000, 32, 'sha256').toString('hex');
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', env('CLIENT_PORTAL_SESSION_SECRET') || serviceKey()).update(body).digest('base64url');
  return `${body}.${sig}`;
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
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!baseUrl() || !serviceKey()) return json(response, 501, { error: 'Client portal API is not configured.' });

  const body = await readJson(request).catch(() => ({}));
  const token = String(body.token || '').trim();
  const password = String(body.password || '');
  const guestName = String(body.guest_name || 'Guest').trim().slice(0, 80) || 'Guest';
  if (!token) return json(response, 400, { error: 'Portal token is required.' });

  const tokenHash = sha256(token);
  const portalResult = await supabaseFetch(`/rest/v1/client_portals?token_hash=eq.${encodeURIComponent(tokenHash)}&status=eq.active&select=id,company_id,job_id,title,client_name,client_email,status,password_hash,password_salt`);
  const portals = portalResult.ok ? await portalResult.json() : [];
  const portal = portals[0];
  if (!portal) return json(response, 404, { error: 'Portal link is invalid or revoked.' });

  if (portal.password_hash) {
    if (!password) return json(response, 401, { error: 'Password required.', password_required: true });
    const nextHash = hashPassword(password, portal.password_salt);
    if (!crypto.timingSafeEqual(Buffer.from(nextHash), Buffer.from(portal.password_hash))) {
      return json(response, 401, { error: 'Incorrect portal password.', password_required: true });
    }
  }

  await supabaseFetch(`/rest/v1/client_portals?id=eq.${encodeURIComponent(portal.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_opened_at: new Date().toISOString() }),
  }).catch(() => null);
  await supabaseFetch('/rest/v1/client_portal_events', {
    method: 'POST',
    body: JSON.stringify({
      company_id: portal.company_id,
      portal_id: portal.id,
      event_type: 'portal.opened',
      guest_name: guestName,
      details: {},
    }),
  }).catch(() => null);

  const docsResult = await supabaseFetch(`/rest/v1/client_portal_documents?portal_id=eq.${encodeURIComponent(portal.id)}&is_current=eq.true&select=id,company_id,portal_id,file_name,mime_type,size_bytes,page_count,version_group_id,version_number,is_current,review_status,scale,created_at&order=created_at.asc`);
  const documents = docsResult.ok ? await docsResult.json() : [];
  const session = signSession({
    portal_id: portal.id,
    company_id: portal.company_id,
    guest_name: guestName,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
  });

  return json(response, 200, {
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
  });
}
