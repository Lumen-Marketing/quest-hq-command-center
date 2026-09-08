import { randomUUID } from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { clientIp, HttpError } from './_lib/http-security.js';
import { consumeDurableRateLimit } from './_lib/rate-limit.js';
import { createStorageClient } from './_lib/supabase-storage.js';
import { FORM_FILE_BUCKET, FORM_FILE_MAX_BYTES } from './_lib/form-files.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanString(value, limit = 10000) {
  if (typeof value !== 'string') throw new HttpError(400, 'Answer has the wrong type.');
  return value.trim().slice(0, limit);
}

function questionOptions(question) {
  return (Array.isArray(question.options) ? question.options : [])
    .map((option) => String(option || '').trim())
    .filter(Boolean);
}

function cleanChoice(value, question) {
  const answer = cleanString(value, 1000);
  if (answer && !questionOptions(question).includes(answer)) throw new HttpError(400, 'Answer is not one of this question’s choices.');
  return answer;
}

function cleanFileAnswer(value, { form, question }) {
  if (value === '' || value == null) return '';
  if (!value || Array.isArray(value) || typeof value !== 'object' || value.kind !== 'file') {
    throw new HttpError(400, 'Invalid form file reference.');
  }
  const expectedPrefix = `${form.company_id}/${form.id}/${question.id}/`;
  const bucketId = String(value.bucket_id || '').slice(0, 120);
  const objectPath = String(value.object_path || '').slice(0, 800);
  const intentId = String(value.upload_intent_id || '').trim();
  const size = Number(value.size || 0);
  const type = String(value.type || '').toLowerCase().trim().slice(0, 120);
  if (bucketId !== FORM_FILE_BUCKET
      || !objectPath.startsWith(expectedPrefix)
      || !UUID_RE.test(intentId)
      || !Number.isInteger(size)
      || size <= 0
      || size > FORM_FILE_MAX_BYTES
      || !type) {
    throw new HttpError(400, 'Invalid form file reference.');
  }
  return {
    kind: 'file',
    name: String(value.name || '').slice(0, 240),
    size,
    type,
    lastModified: Number(value.lastModified || 0) || 0,
    bucket_id: bucketId,
    object_path: objectPath,
    upload_intent_id: intentId,
    uploaded_at: String(value.uploaded_at || '').slice(0, 80),
  };
}

function cleanAnswerValue(value, { form, question }) {
  const type = String(question.type || 'short');
  if (type === 'file') return cleanFileAnswer(value, { form, question });
  if (type === 'checkbox') {
    const values = Array.isArray(value) ? value : (value === '' || value == null ? [] : [value]);
    if (values.length > 100) throw new HttpError(400, 'Too many choices were selected.');
    return [...new Set(values.map((item) => cleanChoice(item, question)).filter(Boolean))];
  }
  if (Array.isArray(value) || (value && typeof value === 'object')) throw new HttpError(400, 'Answer has the wrong type.');
  if (type === 'multiple' || type === 'dropdown') return cleanChoice(value, question);
  if (type === 'yesno') {
    const answer = cleanString(value, 8);
    if (answer && answer !== 'Yes' && answer !== 'No') throw new HttpError(400, 'Answer must be Yes or No.');
    return answer;
  }
  if (type === 'rating') {
    if (value === '' || value == null) return '';
    const rating = Number(value);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be between 1 and 5.');
    return rating;
  }
  if (type === 'date') {
    const answer = cleanString(value, 10);
    if (answer) {
      const parsed = new Date(`${answer}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(answer) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== answer) {
        throw new HttpError(400, 'Date answer is invalid.');
      }
    }
    return answer;
  }
  return cleanString(value, type === 'short' ? 1000 : 10000);
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

function fileAnswers(answers, form) {
  return (Array.isArray(form.questions) ? form.questions : [])
    .filter((question) => question.type === 'file')
    .map((question) => answers[String(question.id)])
    .filter((value) => value && typeof value === 'object' && value.kind === 'file');
}

async function verifyStoredFiles({ answers, form, db, storage }) {
  const files = fileAnswers(answers, form);
  if (!files.length) return [];
  const ids = files.map((file) => file.upload_intent_id);
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'A file upload was reused.');
  const filter = encodeURIComponent(`(${ids.join(',')})`);
  const intentsRes = await db(`/rest/v1/form_upload_intents?id=in.${filter}&select=id,company_id,form_id,question_id,object_path,expected_type,expected_size,expires_at,claimed_at`);
  if (!intentsRes.ok) throw new HttpError(500, 'Could not verify uploaded files.');
  const intents = await intentsRes.json().catch(() => []);
  const byId = new Map(intents.map((intent) => [String(intent.id), intent]));
  if (byId.size !== files.length) throw new HttpError(400, 'A file upload is invalid or expired.');

  for (const file of files) {
    const intent = byId.get(file.upload_intent_id);
    if (!intent
        || intent.company_id !== form.company_id
        || intent.form_id !== form.id
        || intent.object_path !== file.object_path
        || intent.claimed_at
        || Date.parse(intent.expires_at || '') <= Date.now()
        || Number(intent.expected_size) !== file.size
        || String(intent.expected_type || '').toLowerCase() !== file.type) {
      throw new HttpError(400, 'A file upload is invalid or expired.');
    }
    const { data, error } = await storage.storage.from(FORM_FILE_BUCKET).info(file.object_path);
    const actualSize = Number(data?.size ?? data?.metadata?.size ?? 0);
    const actualType = String(data?.contentType || data?.content_type || data?.metadata?.mimetype || '').toLowerCase();
    if (error || !data || actualSize !== file.size || actualType !== file.type) {
      throw new HttpError(400, 'Uploaded file could not be verified.');
    }
  }
  return ids;
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public forms are not configured.',
    bodyLimitBytes: 1024 * 1024,
    rateLimit: { namespace: 'public-form-submit', limit: 12, windowMs: 10 * 60 * 1000, durable: true },
  },
  async (ctx) => {
    const { body, db, req } = ctx;

    if (String(body.website || '').trim()) return { response: null };
    const startedAt = Date.parse(String(body.started_at || ''));
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) {
      throw new HttpError(429, 'Please wait a moment before submitting.');
    }

    const formId = String(body.form_id || '').trim();
    if (!formId) throw new HttpError(400, 'Missing form id.');

    const formsRes = await db(`/rest/v1/forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,title,status,collect_email,questions`);
    if (!formsRes.ok) throw new HttpError(500, 'Could not submit form response.');
    const form = (await formsRes.json().catch(() => []))[0];
    if (!form) throw new HttpError(404, 'Form not found or not published.');

    const formQuota = await consumeDurableRateLimit(db, {
      namespace: `public-form-submit:${form.id}`,
      ip: clientIp(req),
      limit: 12,
      windowMs: 10 * 60 * 1000,
    });
    if (formQuota && !formQuota.allowed) throw new HttpError(429, 'Too many responses for this form. Please try again shortly.');

    const answers = cleanAnswers(body.answers, form);
    const storage = ctx.storage || (fileAnswers(answers, form).length ? createStorageClient() : null);
    const uploadIntentIds = await verifyStoredFiles({ answers, form, db, storage });
    const responseId = `response-${randomUUID()}`;
    const insertRes = await db('/rest/v1/rpc/submit_public_form_response', {
      method: 'POST',
      body: JSON.stringify({
        p_response_id: responseId,
        p_company_id: form.company_id,
        p_form_id: form.id,
        p_submitted_by: String(body.submitted_by || body.submitter_email || 'Public respondent').slice(0, 240),
        p_submitter_email: String(body.submitter_email || '').slice(0, 240),
        p_answers: answers,
        p_upload_intent_ids: uploadIntentIds,
      }),
    });
    if (!insertRes.ok) throw new HttpError(500, 'Could not submit form response.');
    const response = await insertRes.json().catch(() => null);

    return { response };
  },
);
