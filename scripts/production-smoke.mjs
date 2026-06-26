import https from 'node:https';

const baseUrl = process.env.QUEST_HQ_PROD_URL || 'https://quest-hq-command-center.vercel.app';
const companies = String(process.env.QUEST_HQ_COMPANIES || 'lumen')
  .split(',')
  .map((company) => company.trim())
  .filter(Boolean);
const modules = [
  'jobs',
  'tasks',
  'files',
  'client-portals',
  'workspaces',
  'forms',
  'analytics',
  'crm',
  'underwriter',
  'finance',
  'messages',
  'calendar',
  'users',
  'settings',
  'time',
  'approvals',
  'clock',
  'team-chart',
];
const legacy = [
  '/',
  '/login',
  '/crm.html',
  '/crm',
  '/underwriter.html',
  '/underwriter',
  '/finance.html',
  '/finance',
  '/messages.html',
  '/messages',
  '/calendar.html',
  '/calendar',
  '/files.html',
  '/forms.html',
  '/jobs.html',
];

const routes = legacy.concat(companies.flatMap((company) => modules.map((module) => `/company/${company}/${module}`)));
const results = [];

for (const route of routes) {
  const url = new URL(route, baseUrl).toString();
  const result = await checkWithRetry(url, 2);
  results.push({ route, ...result });
  const label = result.ok ? 'PASS' : 'FAIL';
  console.log(`${label} ${result.status || result.error || 'unknown'} ${route}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} production routes passed.`);
if (failed.length) {
  process.exitCode = 1;
}

async function checkWithRetry(url, retries) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    last = await requestHead(url);
    if (last.ok) return last;
    await delay(250 * (attempt + 1));
  }
  return last;
}

function requestHead(url) {
  return new Promise((resolve) => {
    const request = https.request(url, { method: 'GET', timeout: 8000 }, (response) => {
      response.resume();
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        requestHead(new URL(response.headers.location, url).toString()).then(resolve);
        return;
      }
      resolve({ ok: status >= 200 && status < 400, status });
    });
    request.on('timeout', () => {
      request.destroy(new Error('timeout'));
    });
    request.on('error', (error) => {
      resolve({ ok: false, error: error.message || error.code || 'request failed' });
    });
    request.end();
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
