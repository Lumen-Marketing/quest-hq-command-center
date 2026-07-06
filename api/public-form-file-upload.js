import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const FORM_FILE_BUCKET = 'quest-form-response-files';
const FORM_FILE_MAX_BYTES = 15 * 1024 * 1024;

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

function safeFileName(name) {
  const cleaned = String(name || 'upload')
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || 'upload';
}

async function ensureFormFileBucket(client) {
  const existing = await client.storage.getBucket(FORM_FILE_BUCKET);
  if (!existing.error) return;
  const created = await client.storage.createBucket(FORM_FILE_BUCKET, {
    public: false,
    fileSizeLimit: FORM_FILE_MAX_BYTES,
  });
  if (created.error && !/already exists/i.test(created.error.message || '')) {
    throw created.error;
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public form files are not configured.' });

  try {
    const body = await readJson(req);
    const formId = String(body.form_id || '').trim();
    const questionId = String(body.question_id || '').trim();
    const fileName = safeFileName(body.file_name);
    const fileType = String(body.file_type || 'application/octet-stream').slice(0, 120);
    const fileSize = Number(body.file_size || 0) || 0;
    if (!formId || !questionId) return res.status(400).json({ error: 'Missing form or question.' });
    if (fileSize <= 0 || fileSize > FORM_FILE_MAX_BYTES) return res.status(413).json({ error: 'File is too large for this form.' });

    const forms = await supabaseGet(`forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,status,questions`);
    const form = forms[0];
    if (!form) return res.status(404).json({ error: 'Form not found or not published.' });
    const question = Array.isArray(form.questions) ? form.questions.find((item) => item.id === questionId) : null;
    if (!question || question.type !== 'file') return res.status(400).json({ error: 'This question does not accept files.' });

    const client = serverClient();
    await ensureFormFileBucket(client);
    const objectPath = `${form.company_id}/${form.id}/${questionId}/${randomUUID()}-${fileName}`;
    const { data, error } = await client.storage
      .from(FORM_FILE_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });
    if (error) throw error;

    return res.status(200).json({
      bucket_id: FORM_FILE_BUCKET,
      object_path: objectPath,
      token: data?.token || '',
      signed_upload_url: data?.signedUrl || '',
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not prepare file upload.' });
  }
}
