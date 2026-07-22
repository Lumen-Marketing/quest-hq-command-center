import { randomUUID } from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

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

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public forms are not configured.',
    bodyLimitBytes: 1024 * 1024,
    rateLimit: { namespace: 'public-form-submit', limit: 12, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db } = ctx;

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

    const answers = cleanAnswers(body.answers, form);

    const insertRes = await db('/rest/v1/form_responses', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        id: `response-${randomUUID()}`,
        company_id: form.company_id,
        form_id: form.id,
        submitted_by: String(body.submitted_by || body.submitter_email || 'Public respondent').slice(0, 240),
        submitter_email: String(body.submitter_email || '').slice(0, 240),
        answers,
        created_at: new Date().toISOString(),
      }),
    });
    if (!insertRes.ok) throw new HttpError(500, 'Could not submit form response.');
    const response = (await insertRes.json().catch(() => []))[0] || null;

    return { response };
  },
);
