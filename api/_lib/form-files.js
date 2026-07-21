// Public form file constants, shared by the submit, upload and signed-URL
// endpoints so the bucket name cannot drift between them.

export const FORM_FILE_BUCKET = 'quest-form-response-files';
export const FORM_FILE_MAX_BYTES = 15 * 1024 * 1024;

export const ALLOWED_PUBLIC_FORM_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
