import { randomUUID } from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { createStorageClient } from './_lib/supabase-storage.js';
import { clientIp } from './_lib/http-security.js';
import { consumeDurableRateLimit } from './_lib/rate-limit.js';
import {
  ALLOWED_PUBLIC_FORM_FILE_EXTS,
  ALLOWED_PUBLIC_FORM_FILE_TYPES,
  FORM_FILE_BUCKET,
  FORM_FILE_MAX_BYTES,
  FORM_UPLOAD_INTENT_TTL_MS,
  hasDangerousUploadExtension,
  uploadFileExtension,
} from './_lib/form-files.js';

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
    // Keep the storage-layer MIME allowlist in lockstep with the endpoint validation so a
    // freshly auto-created bucket isn't missing the type backstop the migration provisions.
    allowedMimeTypes: ALLOWED_PUBLIC_FORM_FILE_TYPES,
  });
  if (created.error && !/already exists/i.test(created.error.message || '')) {
    throw created.error;
  }
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public form files are not configured.',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'public-form-file-upload', limit: 20, windowMs: 10 * 60 * 1000, durable: true },
  },
  async (ctx) => {
    const { body, db, req } = ctx;
    const storage = ctx.storage || createStorageClient();

    const formId = String(body.form_id || '').trim();
    const questionId = String(body.question_id || '').trim();
    const fileName = safeFileName(body.file_name);
    const fileType = String(body.file_type || '').toLowerCase().trim().slice(0, 120);
    const fileSize = Number(body.file_size || 0) || 0;

    if (!formId || !questionId) throw new HttpError(400, 'Missing form or question.');
    if (fileSize <= 0 || fileSize > FORM_FILE_MAX_BYTES) throw new HttpError(413, 'File is too large for this form.');
    // Checked against the raw name, before safeFileName() rewrites it.
    if (hasDangerousUploadExtension(body.file_name)) throw new HttpError(415, 'That file type is blocked for security reasons.');
    if (!ALLOWED_PUBLIC_FORM_FILE_EXTS.has(uploadFileExtension(fileName))) throw new HttpError(415, 'Unsupported file extension.');
    if (!ALLOWED_PUBLIC_FORM_FILE_TYPES.has(fileType)) throw new HttpError(415, 'Unsupported file type.');

    const formsRes = await db(`/rest/v1/forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,status,questions`);
    if (!formsRes.ok) throw new HttpError(500, 'Could not prepare file upload.');
    const form = (await formsRes.json().catch(() => []))[0];
    if (!form) throw new HttpError(404, 'Form not found or not published.');

    const question = Array.isArray(form.questions) ? form.questions.find((item) => item.id === questionId) : null;
    if (!question || question.type !== 'file') throw new HttpError(400, 'This question does not accept files.');

    const formQuota = await consumeDurableRateLimit(db, {
      namespace: `public-form-file-upload:${form.id}`,
      ip: clientIp(req),
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (formQuota && !formQuota.allowed) throw new HttpError(429, 'Too many uploads for this form. Please try again shortly.');

    await ensureFormFileBucket(storage);
    const objectPath = `${form.company_id}/${form.id}/${questionId}/${randomUUID()}-${fileName}`;
    const uploadIntentId = randomUUID();
    const intentRes = await db('/rest/v1/form_upload_intents', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: uploadIntentId,
        company_id: form.company_id,
        form_id: form.id,
        question_id: questionId,
        object_path: objectPath,
        expected_name: fileName,
        expected_type: fileType,
        expected_size: fileSize,
        expires_at: new Date(Date.now() + FORM_UPLOAD_INTENT_TTL_MS).toISOString(),
      }),
    });
    if (!intentRes.ok) throw new HttpError(500, 'Could not prepare file upload.');
    const { data, error } = await storage.storage
      .from(FORM_FILE_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });
    if (error) throw new HttpError(500, 'Could not prepare file upload.');

    return {
      bucket_id: FORM_FILE_BUCKET,
      object_path: objectPath,
      upload_intent_id: uploadIntentId,
      token: data?.token || '',
      signed_upload_url: data?.signedUrl || '',
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    };
  },
);
