import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-file-url.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, headers = { authorization: 'Bearer caller-jwt' }) {
  return { method: 'POST', url: '/api/public-form-file-url', headers: { host: 'app.example.com', ...headers }, body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
}

const OBJECT_PATH = 'co1/form-1/q1/abc-plan.pdf';
const RESPONSE_ROW = {
  id: 'response-1',
  form_id: 'form-1',
  company_id: 'co1',
  answers: { q1: { kind: 'file', object_path: OBJECT_PATH } },
};

function makeStorage() {
  const signed = [];
  return {
    signed,
    auth: { async getUser(token) { return token ? { data: { user: { id: 'u1' } }, error: null } : { data: null, error: new Error('no') }; } },
    storage: {
      from() {
        return {
          async createSignedUrl(objectPath) {
            signed.push(objectPath);
            return { data: { signedUrl: 'https://signed.example/download' }, error: null };
          },
        };
      },
    },
  };
}

const VALID = { response_id: 'response-1', form_id: 'form-1', object_path: OBJECT_PATH, file_name: 'plan.pdf' };

test('happy path: mints a signed URL after the RLS-scoped read succeeds', async () => {
  baseEnv();
  const storage = makeStorage();
  const seen = [];
  const fetchAsUser = async (path, token) => { seen.push({ path, token }); return [RESPONSE_ROW]; };
  const r = res();
  await handler(req(VALID), r, { storage, fetchAsUser });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().signed_url, 'https://signed.example/download');
  assert.equal(seen[0].token, 'caller-jwt', 'the row must be read with the caller JWT, not the service key');
  assert.deepEqual(storage.signed, [OBJECT_PATH]);
});

test('requires a bearer token', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, {}), r, { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 401);
});

test('rejects a disallowed origin', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, { authorization: 'Bearer t', origin: 'https://evil.example' }), r,
    { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 403);
});

test('rejects an object path outside the response prefix', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'other-co/form-9/q1/secret.pdf' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, [], 'no URL may be signed for a foreign path');
});

test('rejects a path containing traversal segments', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'co1/form-1/../../etc/passwd' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('rejects a path not referenced by the stored answers', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'co1/form-1/q1/never-uploaded.pdf' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('rejects an unsupported bucket', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, bucket_id: 'some-other-bucket' }), r,
    { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Unsupported file bucket.');
});

test('returns 404 when RLS hides the response row', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req(VALID), r, { storage, fetchAsUser: async () => [] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('returns 500 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const r = res();
  await handler(req(VALID), r, {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.json().error, 'Public form files are not configured.');
});
