import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { supabaseBaseUrl } from './_lib/supabase-admin.js';

function absoluteStorageUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${supabaseBaseUrl()}/storage/v1${cleanPath}`;
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'portal-session',
    rateLimit: { namespace: 'client-portal-document-url', limit: 60, windowMs: 10 * 60 * 1000 },
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ session, body, db }) => {
    const documentId = String(body.document_id || '').trim();
    if (!documentId) throw new HttpError(400, 'document_id is required.');

    const docResult = await db(`/rest/v1/client_portal_documents?id=eq.${encodeURIComponent(documentId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}&select=id,bucket_id,object_path,file_name,mime_type`);
    const docs = docResult.ok ? await docResult.json() : [];
    const doc = docs[0];
    if (!doc) throw new HttpError(404, 'Document not found.');

    const objectPath = String(doc.object_path || '').split('/').map(encodeURIComponent).join('/');
    const signResult = await db(`/storage/v1/object/sign/${encodeURIComponent(doc.bucket_id || 'quest-client-portal-documents')}/${objectPath}`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn: 900 }),
    });
    const signed = signResult.ok ? await signResult.json() : {};
    const signedURL = signed.signedURL || signed.signedUrl || signed.url || '';
    if (!signedURL) throw new HttpError(502, 'Could not create signed document URL.');

    return {
      url: absoluteStorageUrl(signedURL),
      document: { id: doc.id, file_name: doc.file_name, mime_type: doc.mime_type },
    };
  },
);
