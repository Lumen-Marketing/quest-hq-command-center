import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-submit.js';
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
    url: '/api/public-form-submit',
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
  title: 'Contact us',
  status: 'Published',
  collect_email: true,
  questions: [{ id: 'q1', type: 'text', required: true }],
};

function makeDb({ form = FORM } = {}) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/forms?')) {
      return { ok: true, async json() { return form ? [form] : []; } };
    }
    if (path === '/rest/v1/form_responses') {
      return { ok: true, async json() { return [{ id: 'response-1' }]; } };
    }
    return { ok: true, async json() { return []; } };
  };
  return { db, calls };
}

test('happy path: stores the response and returns it', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', answers: { q1: 'hello' } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { response: { id: 'response-1' } });
  const insert = calls.find((call) => call.path === '/rest/v1/form_responses');
  assert.ok(insert, 'expected an insert into form_responses');
  assert.equal(JSON.parse(insert.body).company_id, 'co1');
});

test('rejects a disallowed origin before doing any work', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1' }, { origin: 'https://evil.example' }), r, { db });
  assert.equal(r.statusCode, 403);
  assert.equal(r.json().error, 'Origin is not allowed.');
  assert.equal(calls.length, 0, 'no Supabase call should happen for a bad origin');
});

test('honeypot submissions are silently accepted and never stored', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', website: 'spam' }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { response: null });
  assert.equal(calls.length, 0);
});

test('submissions faster than 1500ms are rejected', async () => {
  baseEnv();
  const { db } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', started_at: new Date().toISOString() }), r, { db });
  assert.equal(r.statusCode, 429);
});

test('an answer referencing an unknown question is rejected', async () => {
  baseEnv();
  const { db } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', answers: { nope: 'x' } }), r, { db });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Answer references an unknown question.');
});

test('a file answer pointing outside the form prefix is rejected', async () => {
  baseEnv();
  const form = { ...FORM, questions: [{ id: 'q1', type: 'file', required: false }] };
  const { db } = makeDb({ form });
  const r = res();
  await handler(req({
    form_id: 'form-1',
    answers: { q1: { kind: 'file', bucket_id: 'quest-form-response-files', object_path: 'other-co/other-form/q1/x.pdf' } },
  }), r, { db });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Invalid form file reference.');
});

test('an unpublished or missing form returns 404', async () => {
  baseEnv();
  const { db } = makeDb({ form: null });
  const r = res();
  await handler(req({ form_id: 'nope', answers: {} }), r, { db });
  assert.equal(r.statusCode, 404);
});

test('returns 500 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const r = res();
  await handler(req({ form_id: 'form-1' }), r, {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.json().error, 'Public forms are not configured.');
});

test('GET is not allowed', async () => {
  baseEnv();
  const r = res();
  await handler({ method: 'GET', url: '/api/public-form-submit', headers: {} }, r, {});
  assert.equal(r.statusCode, 405);
});
