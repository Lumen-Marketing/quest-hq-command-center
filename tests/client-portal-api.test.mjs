import assert from 'node:assert/strict';
import test from 'node:test';

import annotationsHandler from '../api/client-portal-annotations.js';
import documentUrlHandler from '../api/client-portal-document-url.js';
import exportEventHandler from '../api/client-portal-export-event.js';

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
