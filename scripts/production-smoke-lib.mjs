export const DEFAULT_PRODUCTION_URL = 'https://www.questbase.io';

export function parseSmokeArgs(argv = []) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === '--base-url' && argv[index + 1]) values.baseUrl = argv[++index];
    else if (key === '--expect-sha' && argv[index + 1]) values.expectedSha = argv[++index];
    else if (key === '--companies' && argv[index + 1]) values.companies = argv[++index];
  }
  return values;
}

export const DEFAULT_COMPANIES = ['lumen'];

export const MODULE_ROUTES = [
  'dashboard', 'workday', 'jobs', 'tasks', 'files', 'client-portals', 'workspaces', 'forms',
  'analytics', 'crm', 'proposals', 'underwriter', 'finance', 'messages', 'calendar', 'users',
  'settings', 'time', 'approvals', 'clock', 'team-chart',
];

export const LEGACY_ROUTES = [
  '/', '/login', '/crm.html', '/crm', '/underwriter.html', '/underwriter', '/finance.html',
  '/finance', '/messages.html', '/messages', '/calendar.html', '/calendar', '/files.html',
  '/forms.html', '/jobs.html',
];

export function buildProductionRoutes(companies = DEFAULT_COMPANIES) {
  return LEGACY_ROUTES.concat(companies.flatMap((company) => MODULE_ROUTES.map((module) => `/company/${company}/${module}`)));
}

// Both brands are accepted on purpose. The product is being renamed Quest HQ -> Questbase,
// and the smoke check runs against whatever production currently serves — which is the old
// title until the rename deploys, and the new one after. Pinning either single value would
// make deploy verification fail in that window, exactly when it is most needed.
const APP_SHELL_MARKERS = ['Questbase Operations Command', 'Quest HQ Operations Command'];
const LEGACY_REDIRECT_MARKERS = ['Opening Questbase', 'Opening Quest HQ'];

export function validateAppShell(html) {
  const source = String(html || '');
  if (!APP_SHELL_MARKERS.some((marker) => source.includes(marker))) {
    return { ok: false, reason: 'missing Questbase application marker' };
  }
  if (!/<script\b[^>]*\bsrc=["'][^"']*\/assets\/[^"']+\.js["']/i.test(source)) {
    return { ok: false, reason: 'missing built JavaScript entry asset' };
  }
  return { ok: true };
}

export function validateLegacyRedirect(html) {
  const source = String(html || '');
  if (!LEGACY_REDIRECT_MARKERS.some((marker) => source.includes(marker))) {
    return { ok: false, reason: 'missing Questbase legacy redirect marker' };
  }
  if (!/<script\b[^>]*\bsrc=["'][^"']*\/legacy-redirect\.js(?:\?[^"']*)?["'][^>]*><\/script>/i.test(source)) {
    return { ok: false, reason: 'legacy page does not load the CSP-safe redirect' };
  }
  if (/<script\b(?![^>]*\bsrc=)[^>]*>/i.test(source)) {
    return { ok: false, reason: 'legacy page contains an inline script blocked by CSP' };
  }
  return { ok: true };
}

export function extractAssetUrls(html, pageUrl) {
  const matches = String(html || '').matchAll(/(?:src|href)=["']([^"']*\/assets\/[^"']+\.(?:js|css))["']/gi);
  const origin = new URL(pageUrl).origin;
  return [...new Set([...matches]
    .map((match) => new URL(match[1], pageUrl))
    .filter((url) => url.origin === origin)
    .map((url) => url.toString()))];
}

export async function requestText(url, { timeoutMs = 10_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'quest-hq-production-smoke/2' },
    });
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      body: await response.text(),
      url: response.url,
    };
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? 'timeout' : (error?.message || 'request failed') };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkWithRetry(url, retries = 2) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    last = await requestText(url);
    if (last.ok) return last;
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return last;
}
