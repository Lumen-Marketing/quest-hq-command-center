import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { createStorageClient } from './_lib/supabase-storage.js';
import { supabaseBaseUrl, supabaseServiceKey } from './_lib/supabase-admin.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

// Query with the caller JWT so form_responses RLS enforces active membership
// and forms.view before any service-role signed URL is minted. One caller, so
// this stays local rather than becoming a seam of its own; it is injectable
// only so the RLS-scoped read can be faked in tests.
async function supabaseGetAsUser(path, token) {
  const response = await fetch(`${supabaseBaseUrl()}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseServiceKey(),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new HttpError(500, 'Could not open form file.');
  return data;
}

function containsObjectPath(value, objectPath) {
  if (Array.isArray(value)) return value.some((item) => containsObjectPath(item, objectPath));
  if (!value || typeof value !== 'object') return false;
  if (value.kind === 'file' && value.object_path === objectPath) return true;
  return Object.values(value).some((item) => containsObjectPath(item, objectPath));
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public form files are not configured.',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'public-form-file-url', limit: 60, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, req } = ctx;
    const storage = ctx.storage || createStorageClient();
    const fetchAsUser = ctx.fetchAsUser || supabaseGetAsUser;

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) throw new HttpError(401, 'Authentication required.');
    const authenticated = await storage.auth.getUser(token);
    if (authenticated.error || !authenticated.data?.user?.id) throw new HttpError(401, 'Authentication required.');

    const responseId = String(body.response_id || '').trim();
    const formId = String(body.form_id || '').trim();
    const bucketId = String(body.bucket_id || FORM_FILE_BUCKET).trim();
    const objectPath = String(body.object_path || '').trim();
    const fileName = String(body.file_name || 'form-upload').slice(0, 240);

    if (!responseId || !formId || !objectPath) throw new HttpError(400, 'Missing file reference.');
    if (bucketId !== FORM_FILE_BUCKET) throw new HttpError(400, 'Unsupported file bucket.');

    const rows = await fetchAsUser(
      `form_responses?id=eq.${encodeURIComponent(responseId)}&form_id=eq.${encodeURIComponent(formId)}&select=id,form_id,company_id,answers`,
      token,
    );
    const response = rows[0];
    const expectedPrefix = response ? `${response.company_id}/${response.form_id}/` : '';
    if (!response || !objectPath.startsWith(expectedPrefix) || objectPath.includes('..') || !containsObjectPath(response.answers, objectPath)) {
      throw new HttpError(404, 'File reference not found.');
    }

    const { data, error } = await storage.storage
      .from(FORM_FILE_BUCKET)
      .createSignedUrl(objectPath, 60 * 60, { download: fileName });
    if (error) throw new HttpError(500, 'Could not open form file.');

    return { signed_url: data?.signedUrl || '' };
  },
);
