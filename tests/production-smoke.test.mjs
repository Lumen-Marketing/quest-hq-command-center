import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_PRODUCTION_URL,
  extractAssetUrls,
  parseSmokeArgs,
  validateAppShell,
  validateLegacyRedirect,
} from '../scripts/production-smoke-lib.mjs';

test('smoke CLI accepts an explicit deployment and commit marker', () => {
  assert.deepEqual(parseSmokeArgs(['--base-url', 'https://preview.example', '--expect-sha', 'abc123', '--companies', 'lumen,roofing']), {
    baseUrl: 'https://preview.example',
    expectedSha: 'abc123',
    companies: 'lumen,roofing',
  });
});

test('production smoke defaults to the public production domain', () => {
  assert.equal(DEFAULT_PRODUCTION_URL, 'https://www.questbase.io');
});

test('app shell validation rejects generic SPA 200 responses', () => {
  assert.deepEqual(validateAppShell('<html><body>ok</body></html>'), {
    ok: false,
    reason: 'missing Questbase application marker',
  });
});

test('app shell validation requires the Vite entry assets', () => {
  const html = '<!doctype html><title>Quest HQ Operations Command</title><div id="app"></div>';
  assert.deepEqual(validateAppShell(html), {
    ok: false,
    reason: 'missing built JavaScript entry asset',
  });
});

test('asset extraction returns same-origin built CSS and JavaScript assets', () => {
  const html = `
    <title>Quest HQ Operations Command</title>
    <script type="module" crossorigin src="/assets/index-abc.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-def.css">
  `;
  assert.deepEqual(extractAssetUrls(html, 'https://example.com/login'), [
    'https://example.com/assets/index-abc.js',
    'https://example.com/assets/index-def.css',
  ]);
  assert.deepEqual(validateAppShell(html), { ok: true });
});

test('legacy redirect validation requires the Quest marker and a CSP-safe external redirect', () => {
  assert.deepEqual(validateLegacyRedirect('<title>Opening Quest HQ</title>'), {
    ok: false,
    reason: 'legacy page does not load the CSP-safe redirect',
  });
  assert.deepEqual(validateLegacyRedirect(`
    <title>Opening Quest HQ</title>
    <script src="/legacy-redirect.js?v=abc123" data-legacy-file="jobs.html"></script>
  `), { ok: true });
  assert.deepEqual(validateLegacyRedirect(`
    <title>Opening Quest HQ</title>
    <script>window.location.replace('/company/lumen/jobs')</script>
  `), {
    ok: false,
    reason: 'legacy page does not load the CSP-safe redirect',
  });
});
