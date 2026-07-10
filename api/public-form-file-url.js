import { createClient } from '@supabase/supabase-js';
import { errorResponse, readJsonBody, requireAllowedOrigin, setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';

const FORM_FILE_BUCKET = 'quest-form-response-files';

const env = (name) => process.env[name] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
const isSupabaseSecretKey = () => /^sb_secret_/i.test(serviceKey()) || /^eyJ/i.test(serviceKey());

function supabaseHeaders(extra = {}) {
  const key = serviceKey();
  return {
    apikey: key,
    ...(isSupabaseSecretKey() ? {} : { Authorization: `Bearer ${key}` }),
    ...extra,
  };
}

function serverClient() {
  return createClient(baseUrl(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function supabaseGetAsUser(path, token) {
  const response = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(Array.isArray(data) ? 'Supabase request failed.' : data.message || 'Supabase request failed.');
  return data;
}

function containsObjectPath(value, objectPath) {
  if (Array.isArray(value)) return value.some((item) => containsObjectPath(item, objectPath));
  if (!value || typeof value !== 'object') return false;
  if (value.kind === 'file' && value.object_path === objectPath) return true;
  return Object.values(value).some((item) => containsObjectPath(item, objectPath));
}

export default async function handler(req, res) {
  setApiHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public form files are not configured.' });

  try {
    if (!enforceRateLimit(req, res, { namespace: 'public-form-file-url', limit: 60, windowMs: 10 * 60 * 1000 })) return;
    requireAllowedOrigin(req);
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return res.status(401).json({ error: 'Authentication required.' });
    const client = serverClient();
    const authenticated = await client.auth.getUser(token);
    if (authenticated.error || !authenticated.data?.user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const body = await readJsonBody(req, { maxBytes: 16 * 1024 });
    const responseId = String(body.response_id || '').trim();
    const formId = String(body.form_id || '').trim();
    const bucketId = String(body.bucket_id || FORM_FILE_BUCKET).trim();
    const objectPath = String(body.object_path || '').trim();
    const fileName = String(body.file_name || 'form-upload').slice(0, 240);
    if (!responseId || !formId || !objectPath) return res.status(400).json({ error: 'Missing file reference.' });
    if (bucketId !== FORM_FILE_BUCKET) return res.status(400).json({ error: 'Unsupported file bucket.' });

    // Query with the caller JWT so form_responses RLS enforces active
    // membership and forms.view before any service-role signed URL is minted.
    const rows = await supabaseGetAsUser(`form_responses?id=eq.${encodeURIComponent(responseId)}&form_id=eq.${encodeURIComponent(formId)}&select=id,form_id,company_id,answers`, token);
    const response = rows[0];
    const expectedPrefix = response ? `${response.company_id}/${response.form_id}/` : '';
    if (!response || !objectPath.startsWith(expectedPrefix) || objectPath.includes('..') || !containsObjectPath(response.answers, objectPath)) {
      return res.status(404).json({ error: 'File reference not found.' });
    }
    const { data, error } = await client
      .storage
      .from(FORM_FILE_BUCKET)
      .createSignedUrl(objectPath, 60 * 60, { download: fileName });
    if (error) throw error;

    return res.status(200).json({ signed_url: data?.signedUrl || '' });
  } catch (error) {
    return errorResponse(res, error, 'Could not open form file.');
  }
}
