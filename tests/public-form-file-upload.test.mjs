import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-file-upload.js';
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

function req(body, extraHeaders = {}) {
  return {
    method: 'POST',
    url: '/api/public-form-file-upload',
    headers: { host: 'app.example.com', ...extraHeaders },
    body,
  };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
}

const FORM = {
  id: 'form-1',
  company_id: 'co1',
  status: 'Published',
  questions: [{ id: 'q1', type: 'file' }, { id: 'q2', type: 'text' }],
};

function makeDb({ form = FORM } = {}) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (path.startsWith('/rest/v1/forms?')) {
      return { ok: true, async json() { return form ? [form] : []; } };
    }
    return { ok: true, async json() { return []; } };
  };
  db.calls = calls;
  return db;
}

function makeStorage() {
  const created = [];
  return {
    created,
    storage: {
      async getBucket() { return { data: { name: 'quest-form-response-files' }, error: null }; },
      async createBucket() { return { data: null, error: null }; },
      from() {
        return {
          async createSignedUploadUrl(objectPath) {
            created.push(objectPath);
            return { data: { token: 'tok', signedUrl: 'https://signed.example/upload' }, error: null };
          },
        };
      },
    },
  };
}

const VALID = { form_id: 'form-1', question_id: 'q1', file_name: 'plan.pdf', file_type: 'application/pdf', file_size: 1024 };

test('happy path: returns a signed upload URL scoped to company/form/question', async () => {
  baseEnv();
  const storage = makeStorage();
  const db = makeDb();
  const r = res();
  await handler(req(VALID), r, { db, storage });
  assert.equal(r.statusCode, 200);
  const payload = r.json();
  assert.equal(payload.bucket_id, 'quest-form-response-files');
  assert.equal(payload.signed_upload_url, 'https://signed.example/upload');
  assert.ok(payload.object_path.startsWith('co1/form-1/q1/'), `unexpected path ${payload.object_path}`);
  assert.match(payload.upload_intent_id, /^[0-9a-f-]{36}$/i);
  const intent = db.calls.find((call) => call.path === '/rest/v1/form_upload_intents');
  assert.ok(intent, 'the upload must create a durable intent before returning the signed URL');
  assert.equal(JSON.parse(intent.body).object_path, payload.object_path);
});

test('rejects a disallowed origin', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, { origin: 'https://evil.example' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 403);
});

test('rejects an unsupported file type with 415', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_type: 'application/x-msdownload' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 415);
  assert.equal(r.json().error, 'Unsupported file type.');
});

test('rejects an oversized file with 413', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_size: 16 * 1024 * 1024 }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 413);
});

test('rejects a zero-size file with 413', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_size: 0 }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 413);
});

test('rejects uploads to a non-file question with 400', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, question_id: 'q2' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'This question does not accept files.');
});

test('rejects a missing form with 404', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb({ form: null }), storage: makeStorage() });
  assert.equal(r.statusCode, 404);
});

test('a hostile file name cannot inject directories into the object path', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, file_name: '../../etc/pa ss wd.pdf' }), r, { db: makeDb(), storage });
  assert.equal(r.statusCode, 200);
  const path = r.json().object_path;
  assert.ok(path.startsWith('co1/form-1/q1/'), `escaped its prefix: ${path}`);
  // safeFileName keeps dots but strips slashes, so ".." survives as literal
  // text inside the file name and can never become a path segment. Four
  // segments exactly: company / form / question / file.
  assert.equal(path.split('/').length, 4, `injected a directory: ${path}`);
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
