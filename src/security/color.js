const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const DEFAULT_COLOR = '#64748b';
const MAX_DEPTH = 12;

export function safeHexColor(value, fallback = DEFAULT_COLOR) {
  const cleanFallback = typeof fallback === 'string' && HEX_COLOR.test(fallback.trim())
    ? fallback.trim()
    : DEFAULT_COLOR;
  if (typeof value !== 'string') return cleanFallback;
  const candidate = value.trim();
  return HEX_COLOR.test(candidate) ? candidate : cleanFallback;
}

/**
 * Clone imported/persisted field config while validating every property named
 * "color". This covers status options, progress bars, gradient stops, and new
 * nested config added later without allowing raw CSS into inline style sinks.
 */
export function sanitizeColorConfig(value, fallback = DEFAULT_COLOR, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  if (Array.isArray(value)) {
    return value.slice(0, 500).map((item) => sanitizeColorConfig(item, fallback, depth + 1));
  }
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, item] of Object.entries(value).slice(0, 500)) {
    output[key] = key.toLowerCase() === 'color'
      ? safeHexColor(item, fallback)
      : sanitizeColorConfig(item, fallback, depth + 1);
  }
  return output;
}
