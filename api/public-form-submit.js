import { randomUUID } from 'node:crypto';
import { HttpError, readJsonBody, requireAllowedOrigin, setApiHeaders } from './_lib/http-security.js';
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

function cleanAnswerValue(value, { form, question }) {
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => cleanAnswerValue(item, { form, question }));
  if (value && typeof value === 'object') {
    const expectedPrefix = `${form.company_id}/${form.id}/${question.id}/`;
    const bucketId = String(value.bucket_id || '').slice(0, 120);
    const objectPath = String(value.object_path || '').slice(0, 800);
    if (value.kind === 'file' && (question.type !== 'file' || bucketId !== FORM_FILE_BUCKET || !objectPath.startsWith(expectedPrefix))) {
      throw new HttpError(400, 'Invalid form file reference.');
    }
    const file = {
      kind: value.kind === 'file' ? 'file' : undefined,
      name: String(value.name || '').slice(0, 240),
      size: Number(value.size || 0) || 0,
      type: String(value.type || '').slice(0, 120),
      lastModified: Number(value.lastModified || 0) || 0,
      data_url: String(value.data_url || '').length <= 500_000 ? String(value.data_url || '') : '',
      bucket_id: bucketId,
      object_path: objectPath,
      uploaded_at: String(value.uploaded_at || '').slice(0, 80),
    };
    return Object.fromEntries(Object.entries(file).filter(([, item]) => item !== undefined && item !== ''));
  }
  return String(value || '').slice(0, 10000);
}

function cleanAnswers(input, form) {
  const source = input && typeof input === 'object' ? input : {};
  const allowedQuestions = new Map((Array.isArray(form.questions) ? form.questions : []).map((question) => [String(question.id), question]));
  if (Object.keys(source).length > 200) throw new HttpError(400, 'Too many answers.');
  const answers = {};
  for (const [rawKey, value] of Object.entries(source)) {
    const key = String(rawKey).slice(0, 160);
    const question = allowedQuestions.get(key);
    if (!question) throw new HttpError(400, 'Answer references an unknown question.');
    answers[key] = cleanAnswerValue(value, { form, question });
  }
  for (const question of allowedQuestions.values()) {
    const value = answers[String(question.id)];
    if (question.required && (value === undefined || value === '' || (Array.isArray(value) && !value.length))) {
      throw new HttpError(400, 'A required answer is missing.');
    }
  }
  return answers;
}

export default async function handler(req, res) {
  setApiHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public forms are not configured.' });
  if (!enforceRateLimit(req, res, { namespace: 'public-form-submit', limit: 12, windowMs: 10 * 60 * 1000 })) return;

  try {
    requireAllowedOrigin(req);
    const body = await readJsonBody(req, { maxBytes: 1024 * 1024 });
    if (String(body.website || '').trim()) return res.status(200).json({ response: null });
    const startedAt = Date.parse(String(body.started_at || ''));
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) throw new HttpError(429, 'Please wait a moment before submitting.');
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
      answers: cleanAnswers(body.answers, form),
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ response });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({ error: status >= 500 ? 'Could not submit form response.' : error.message });
  }
}
