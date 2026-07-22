// Public form file constants, shared by the submit, upload and signed-URL
// endpoints so the bucket name cannot drift between them.

export const FORM_FILE_BUCKET = 'quest-form-response-files';
export const FORM_FILE_MAX_BYTES = 15 * 1024 * 1024;

// Kept in lockstep with the client `formfile` policy (src/security/upload-policy.js).
// ZIP-based office formats are intentionally excluded ("drop anything ZIP") — do
// not re-add application/msword, the OOXML types, or application/vnd.ms-excel
// here without revisiting that decision.
export const ALLOWED_PUBLIC_FORM_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
]);

export const ALLOWED_PUBLIC_FORM_FILE_EXTS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv']);

// Belt-and-braces blocklist checked against every segment of the original file
// name, so `invoice.pdf.exe` and `logo.svg` are rejected even though the MIME
// type the browser reports may look benign. svg/html are here because this is a
// public, unauthenticated endpoint and both are stored-XSS vectors.
const DANGEROUS_UPLOAD_EXTS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif', 'sh', 'bash', 'ps1', 'vbs', 'js', 'mjs',
  'jse', 'wsf', 'jar', 'app', 'apk', 'dmg', 'deb', 'rpm', 'html', 'htm', 'xhtml', 'svg',
  'php', 'phtml', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl', 'dll', 'so', 'bin', 'lnk', 'reg',
  'hta', 'cpl', 'zip',
]);

export function uploadFileExtension(name) {
  const clean = String(name || '').toLowerCase();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1) : '';
}

export function hasDangerousUploadExtension(name) {
  return String(name || '')
    .toLowerCase()
    .split('.')
    .slice(1)
    .some((part) => DANGEROUS_UPLOAD_EXTS.has(part.trim()));
}
