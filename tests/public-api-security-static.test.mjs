import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (name) => readFileSync(new URL(`../api/${name}`, import.meta.url), 'utf8');
const submit = read('public-form-submit.js');
const upload = read('public-form-file-upload.js');
const fileUrl = read('public-form-file-url.js');
const address = read('address-suggestions.js');
const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('public mutation APIs have bounded bodies, allowed-origin checks, and endpoint limits', () => {
  for (const source of [submit, upload, fileUrl]) {
    assert.match(source, /readJsonBody/);
    assert.match(source, /requireAllowedOrigin/);
    assert.match(source, /enforceRateLimit/);
    assert.match(source, /setApiHeaders/);
  }
  assert.match(address, /enforceRateLimit/);
});

test('public form submissions validate question IDs and owned file paths', () => {
  assert.match(submit, /allowedQuestions/);
  assert.match(submit, /expectedPrefix/);
  assert.match(submit, /body\.website/);
  assert.match(submit, /body\.started_at/);
  assert.match(app, /name="website"/);
  assert.match(app, /started_at: state\.publicForm\.openedAt/);
});

test('public form uploads restrict content types and signed URL paths', () => {
  assert.match(upload, /ALLOWED_PUBLIC_FORM_FILE_TYPES/);
  assert.match(upload, /Unsupported file type/);
  assert.match(fileUrl, /expectedPrefix/);
  assert.match(fileUrl, /response\.company_id/);
  assert.match(fileUrl, /auth\.getUser/);
  assert.match(fileUrl, /supabaseGetAsUser/);
  assert.match(fileUrl, /form_responses RLS enforces active/);
  assert.match(fileUrl, /Authorization: `Bearer \$\{token\}`/);
  assert.match(app, /Authorization: `Bearer \$\{activeSession\(\)\.access_token\}`/);
});

test('address provider calls are rate limited and cached', () => {
  assert.match(address, /suggestionCache/);
  assert.match(address, /address-suggestions/);
  assert.match(address, /limit: 60/);
});
