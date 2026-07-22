// The public API's security properties are proven by executing the handlers
// (see public-form-submit / -file-upload / -file-url / create-checkout-session
// test files). What remains here is the one property no behavioural test can
// assert: that these endpoints are still *on* the seam, and so still inherit
// the pipeline rather than hand-rolling it.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (name) => readFileSync(new URL(`../api/${name}`, import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const SEAM_ENDPOINTS = [
  'public-form-submit.js',
  'public-form-file-upload.js',
  'public-form-file-url.js',
  'create-checkout-session.js',
];

test('public mutation endpoints stay on the endpoint seam', () => {
  for (const name of SEAM_ENDPOINTS) {
    const source = read(name);
    assert.match(source, /defineEndpoint\(/, `${name} must be built with defineEndpoint`);
    assert.match(source, /requireOrigin: true/, `${name} must require an allowed origin`);
    assert.match(source, /rateLimit: \{/, `${name} must declare a rate limit`);
    assert.doesNotMatch(source, /res\.status\(|response\.status\(/, `${name} must not write responses directly`);
  }
});

test('no endpoint re-declares the Supabase admin header logic', () => {
  for (const name of SEAM_ENDPOINTS) {
    const source = read(name);
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/, `${name} must resolve the key via _lib`);
    assert.doesNotMatch(source, /function supabaseHeaders/, `${name} must not copy supabaseHeaders`);
  }
});

test('the app sends the caller access token when opening form files', () => {
  assert.match(app, /Authorization: `Bearer \$\{activeSession\(\)\.access_token\}`/);
});

test('the public form posts the honeypot and timing fields', () => {
  assert.match(app, /name="website"/);
  assert.match(app, /started_at: state\.publicForm\.openedAt/);
});
