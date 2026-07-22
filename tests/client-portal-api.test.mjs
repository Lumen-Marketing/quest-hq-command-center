import assert from 'node:assert/strict';
import test from 'node:test';

import annotationsHandler from '../api/client-portal-annotations.js';
import documentUrlHandler from '../api/client-portal-document-url.js';
import exportEventHandler from '../api/client-portal-export-event.js';
import documentStatusHandler from '../api/client-portal-document-status.js';
import { signPortalSession } from '../api/_lib/portal-session.js';

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test('client portal APIs reject malformed sessions with 401 instead of throwing', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  for (const handler of [annotationsHandler, documentUrlHandler, exportEventHandler]) {
    const response = createJsonResponse();
    await assert.doesNotReject(() => handler(createJsonRequest({ session: 'bad.short', document_id: 'doc_1' }), response));
    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), { error: 'Portal session expired.' });
  }
});

test('a valid portal session reaches the handler and drives the injected db', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  const session = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_name: 'Guest',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const calls = [];
  const fakeDb = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    return { ok: true, status: 200, async json() { return []; } };
  };

  const response = createJsonResponse();
  await documentStatusHandler(
    createJsonRequest({ session, document_id: 'doc_1', review_status: 'approved' }),
    response,
    { db: fakeDb },
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { saved: true });
  const patch = calls.find((call) => call.method === 'PATCH');
  assert.ok(patch, 'the handler should PATCH the document status');
  assert.match(patch.path, /client_portal_documents/);
  assert.ok(calls.some((call) => call.path.includes('client_portal_events')), 'status change should be logged');
});

test('a valid session with an invalid review status is rejected before any db write', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  const session = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  let called = false;
  const fakeDb = async () => { called = true; return { ok: true, status: 200, async json() { return []; } }; };

  const response = createJsonResponse();
  await documentStatusHandler(
    createJsonRequest({ session, document_id: 'doc_1', review_status: 'nonsense' }),
    response,
    { db: fakeDb },
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: 'Invalid review status.' });
  assert.equal(called, false, 'no db call should happen for an invalid status');
});

function createJsonRequest(payload) {
  return {
    method: 'POST',
    headers: { host: 'localhost' },
    url: '/api/test',
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(payload));
    },
  };
}

function createJsonResponse() {
  let body = '';
  return {
    statusCode: 0,
    headers: {},
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(value = '') {
      body = String(value);
    },
    json() {
      return body ? JSON.parse(body) : null;
    },
  };
}
