import { contentTypeFor, validateUpload } from '../security/upload-policy.js';

function uploadedFileMetadata(file, bucketId, objectPath, uploadIntentId, uploadedAt) {
  return {
    kind: 'file',
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    data_url: '',
    bucket_id: bucketId,
    object_path: objectPath,
    upload_intent_id: uploadIntentId,
    uploaded_at: uploadedAt,
  };
}

export async function uploadPublicFormFile({
  form,
  question,
  file,
  createSupabaseClient,
  fetchImpl = globalThis.fetch,
  now = () => new Date().toISOString(),
}) {
  const check = await validateUpload(file, 'formfile');
  if (!check.ok) throw new Error(check.reason);

  const contentType = contentTypeFor(file);
  const response = await fetchImpl('/api/public-form-file-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form_id: form.id,
      question_id: question.id,
      file_name: file.name,
      file_type: contentType,
      file_size: file.size,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Could not prepare file upload.');

  const client = createSupabaseClient();
  if (!client) throw new Error('File upload is not available in this session.');
  const upload = await client.storage
    .from(payload.bucket_id)
    .uploadToSignedUrl(payload.object_path, payload.token, file, { contentType });
  if (upload.error) throw upload.error;

  return uploadedFileMetadata(file, payload.bucket_id, payload.object_path, payload.upload_intent_id, now());
}
