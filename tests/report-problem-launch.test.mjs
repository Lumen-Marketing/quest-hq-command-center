import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  QUESTBASE_PRODUCTION_ORIGINS,
  corsHeadersForOrigin,
} from '../supabase/functions/report-problem/cors.js';

const source = [
  readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/help/help-center-page.js', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/support/reporting.js', import.meta.url), 'utf8'),
].join('\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('report-problem CORS allows every production Questbase origin', () => {
  assert.deepEqual(QUESTBASE_PRODUCTION_ORIGINS, [
    'https://quest-hq-command-center-gamma.vercel.app',
    'https://questbase.io',
    'https://www.questbase.io',
  ]);

  for (const origin of QUESTBASE_PRODUCTION_ORIGINS) {
    const headers = corsHeadersForOrigin(origin);
    assert.equal(headers['Access-Control-Allow-Origin'], origin);
    assert.equal(headers.Vary, 'Origin');
  }
});

test('report-problem CORS accepts configured pilot origins and rejects unrelated sites', () => {
  assert.equal(
    corsHeadersForOrigin('https://pilot.example.com', 'https://preview.example.com, https://pilot.example.com')['Access-Control-Allow-Origin'],
    'https://pilot.example.com',
  );
  assert.equal(corsHeadersForOrigin('https://evil.example')['Access-Control-Allow-Origin'], undefined);
});

test('the Help Center exposes a bounded support report with an email fallback', () => {
  assert.match(source, /supportEmail:\s*import\.meta\.env\.VITE_SUPPORT_EMAIL \|\| 'info@lumenmarketingusa\.com'/);
  assert.match(source, /data-action="open-support"/);
  assert.match(source, /import\('\.\/support\/reporting\.js'\)/);
  assert.match(source, /function renderSupportModal\(\)/);
  assert.match(source, /data-support-report-form/);
  assert.match(source, /name="type"[\s\S]*?<option value="bug"[^>]*>Bug<\/option>/);
  assert.match(source, /name="description"[\s\S]*?maxlength="2000"/);
  assert.match(source, /client\.functions\.invoke\('report-problem'/);
  assert.match(source, /mailto:\$\{encodeURIComponent\(CONFIG\.supportEmail\)\}/);
  assert.match(styles, /\.support-modal-grid/);
  assert.match(styles, /\.support-report-form/);
});
