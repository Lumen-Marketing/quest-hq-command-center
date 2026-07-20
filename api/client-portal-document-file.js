import { defineEndpoint, fileResponse } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'portal-session',
    rateLimit: { namespace: 'client-portal-document-file', limit: 60, windowMs: 10 * 60 * 1000 },
    notConfiguredMessage: 'Client portal API is not configured.',
  },
  async ({ session, body, db }) => {
    const documentId = String(body.document_id || '').trim();
    if (!documentId) throw new HttpError(400, 'document_id is required.');

    const docResult = await db(`/rest/v1/client_portal_documents?id=eq.${encodeURIComponent(documentId)}&portal_id=eq.${encodeURIComponent(session.portal_id)}&company_id=eq.${encodeURIComponent(session.company_id)}&select=id,bucket_id,object_path,file_name,mime_type`);
    const docs = docResult.ok ? await docResult.json() : [];
    const doc = docs[0];
    if (!doc?.object_path) throw new HttpError(404, 'Document not found.');

    const objectPath = String(doc.object_path || '').split('/').map(encodeURIComponent).join('/');
    const bucketId = encodeURIComponent(doc.bucket_id || 'quest-client-portal-documents');
    const fileResult = await db(`/storage/v1/object/${bucketId}/${objectPath}`);
    if (!fileResult.ok) throw new HttpError(502, 'Document file unavailable.');

    const buffer = Buffer.from(await fileResult.arrayBuffer());
    return fileResponse({ buffer, contentType: doc.mime_type || 'application/octet-stream', fileName: doc.file_name });
  },
);
