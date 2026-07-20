import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

export default defineEndpoint(
  {
    method: 'GET',
    auth: 'none',
    cacheControl: 'private, no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public forms are not configured.',
    rateLimit: { namespace: 'public-form-open', limit: 120, windowMs: 10 * 60 * 1000 },
  },
  async ({ query, db }) => {
    const formId = String(query.form_id || '').trim();
    if (!formId) throw new HttpError(400, 'Missing form id.');

    const select = 'id,company_id,title,description,type,status,audience,theme_color,background,submit_label,collect_email,require_approval,questions,created_at,updated_at';
    const formRes = await db(`/rest/v1/forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=${select}`, { headers: { Accept: 'application/json' } });
    if (!formRes.ok) throw new HttpError(500, 'Could not open form.');
    const rows = await formRes.json().catch(() => []);
    const form = rows[0];
    if (!form) throw new HttpError(404, 'Form not found or not published.');

    let company = { id: form.company_id, name: 'Quest HQ' };
    // The form is still usable without company decoration.
    const compRes = await db(`/rest/v1/companies?id=eq.${encodeURIComponent(form.company_id)}&select=id,name,icon_key,icon_image`, { headers: { Accept: 'application/json' } }).catch(() => null);
    if (compRes && compRes.ok) {
      const companies = await compRes.json().catch(() => []);
      if (companies[0]) company = companies[0];
    }

    return { form, company };
  },
);
