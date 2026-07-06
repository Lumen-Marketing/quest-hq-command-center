import { randomUUID } from 'node:crypto';

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

async function supabaseInsert(path, row) {
  const response = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    method: 'POST',
    headers: supabaseHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(row),
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(Array.isArray(data) ? 'Supabase insert failed.' : data.message || 'Supabase insert failed.');
  return Array.isArray(data) ? data[0] : data;
}

function cleanAnswerValue(value) {
  if (Array.isArray(value)) return value.map(cleanAnswerValue);
  if (value && typeof value === 'object') {
    const file = {
      kind: value.kind === 'file' ? 'file' : undefined,
      name: String(value.name || '').slice(0, 240),
      size: Number(value.size || 0) || 0,
      type: String(value.type || '').slice(0, 120),
      lastModified: Number(value.lastModified || 0) || 0,
      data_url: String(value.data_url || '').length <= 3_000_000 ? String(value.data_url || '') : '',
    };
    return Object.fromEntries(Object.entries(file).filter(([, item]) => item !== undefined && item !== ''));
  }
  return String(value || '').slice(0, 10000);
}

function cleanAnswers(input) {
  const source = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [String(key).slice(0, 160), cleanAnswerValue(value)]));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public forms are not configured.' });

  try {
    const body = await readJson(req);
    const formId = String(body.form_id || '').trim();
    if (!formId) return res.status(400).json({ error: 'Missing form id.' });
    const forms = await supabaseGet(`forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,title,status,collect_email,questions`);
    const form = forms[0];
    if (!form) return res.status(404).json({ error: 'Form not found or not published.' });

    const response = await supabaseInsert('form_responses', {
      id: `response-${randomUUID()}`,
      company_id: form.company_id,
      form_id: form.id,
      submitted_by: String(body.submitted_by || body.submitter_email || 'Public respondent').slice(0, 240),
      submitter_email: String(body.submitter_email || '').slice(0, 240),
      answers: cleanAnswers(body.answers),
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ response });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not submit form response.' });
  }
}
