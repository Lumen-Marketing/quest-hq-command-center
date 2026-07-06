import { createClient } from '@supabase/supabase-js';

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

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}

async function supabaseGet(path) {
  const response = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    headers: supabaseHeaders({ Accept: 'application/json' }),
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
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public form files are not configured.' });

  try {
    const body = await readJson(req);
    const responseId = String(body.response_id || '').trim();
    const formId = String(body.form_id || '').trim();
    const bucketId = String(body.bucket_id || FORM_FILE_BUCKET).trim();
    const objectPath = String(body.object_path || '').trim();
    const fileName = String(body.file_name || 'form-upload').slice(0, 240);
    if (!responseId || !formId || !objectPath) return res.status(400).json({ error: 'Missing file reference.' });
    if (bucketId !== FORM_FILE_BUCKET) return res.status(400).json({ error: 'Unsupported file bucket.' });

    const rows = await supabaseGet(`form_responses?id=eq.${encodeURIComponent(responseId)}&form_id=eq.${encodeURIComponent(formId)}&select=id,form_id,answers`);
    const response = rows[0];
    if (!response || !containsObjectPath(response.answers, objectPath)) return res.status(404).json({ error: 'File reference not found.' });

    const { data, error } = await serverClient()
      .storage
      .from(FORM_FILE_BUCKET)
      .createSignedUrl(objectPath, 60 * 60, { download: fileName });
    if (error) throw error;

    return res.status(200).json({ signed_url: data?.signedUrl || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not open form file.' });
  }
}
