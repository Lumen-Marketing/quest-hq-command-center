// Normalize a raw phone string to E.164. US-first (defaults to +1); already
// international +numbers pass through. Returns null when it cannot be trusted.
export function toE164(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return null;
  const digits = str.replace(/\D/g, '');
  if (!digits) return null;
  if (str.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}
