import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorageClient } from '../api/_lib/supabase-storage.js';
import { FORM_FILE_BUCKET, FORM_FILE_MAX_BYTES } from '../api/_lib/form-files.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

test('createStorageClient builds a client from the shared admin env logic', () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key';
  const client = createStorageClient();
  assert.equal(typeof client.storage.from, 'function');
});

test('createStorageClient falls back to VITE_ and SECRET_ env names', () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.VITE_SUPABASE_URL = 'https://fallback.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_key';
  const client = createStorageClient();
  assert.equal(typeof client.storage.from, 'function');
});

test('form file constants are shared, not re-declared', () => {
  assert.equal(FORM_FILE_BUCKET, 'quest-form-response-files');
  assert.equal(FORM_FILE_MAX_BYTES, 15 * 1024 * 1024);
});
