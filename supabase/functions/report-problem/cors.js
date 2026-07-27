export const QUESTBASE_PRODUCTION_ORIGINS = [
  'https://quest-hq-command-center-gamma.vercel.app',
  'https://questbase.io',
  'https://www.questbase.io',
];

export function corsHeadersForOrigin(origin = '', configuredOrigins = '') {
  const headers = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  const allowedOrigins = new Set([
    ...QUESTBASE_PRODUCTION_ORIGINS,
    ...String(configuredOrigins)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  const cleanOrigin = String(origin || '').trim();
  if (cleanOrigin && allowedOrigins.has(cleanOrigin)) {
    headers['Access-Control-Allow-Origin'] = cleanOrigin;
  }
  return headers;
}
