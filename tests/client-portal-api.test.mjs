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
    // Every session-authenticated request re-reads the portal, so the fake has to have one.
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    // A representation PATCH on an existing, in-scope document returns the updated row(s).
    if (path.includes('client_portal_documents') && options.method === 'PATCH') {
      return { ok: true, status: 200, async json() { return [{ id: 'doc_1', review_status: 'approved' }]; } };
    }
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

  const calls = [];
  const fakeDb = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };

  const response = createJsonResponse();
  await documentStatusHandler(
    createJsonRequest({ session, document_id: 'doc_1', review_status: 'nonsense' }),
    response,
    { db: fakeDb },
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: 'Invalid review status.' });
  // The portal read is expected — that is the session check. Nothing may be WRITTEN.
  const writes = calls.filter((call) => call.method !== 'GET');
  assert.deepEqual(writes, [], 'an invalid status must not write anything');
});

test('a revoked portal ends the sessions already open on it', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  // Signed, unexpired, and issued while the portal was open — the exact token a guest keeps
  // holding after the link is revoked. Before the status re-check, this carried on working
  // for the rest of its six hours.
  const session = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_id: 'guest-abc',
    guest_name: 'Guest',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const calls = [];
  // status=eq.active no longer matches, so the portal read comes back empty.
  const revokedDb = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    return { ok: true, status: 200, async json() { return []; } };
  };

  for (const handler of [annotationsHandler, documentUrlHandler, exportEventHandler, documentStatusHandler]) {
    const response = createJsonResponse();
    await handler(
      createJsonRequest({ session, document_id: 'doc_1', review_status: 'approved' }),
      response,
      { db: revokedDb },
    );
    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), { error: 'This portal link is no longer active.' });
  }
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), [], 'a revoked portal must write nothing');
});

test('annotation ownership follows the session guest id, not the typed name', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  // An impostor who reopened the portal and typed somebody else's display name. Same portal,
  // same name, different guest id — which is now the only thing ownership reads.
  const impostor = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_id: 'guest-impostor',
    guest_name: 'Sarah',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const calls = [];
  const fakeDb = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({ session: impostor, action: 'delete', annotation_id: 'anno_1' }),
    response,
    { db: fakeDb },
  );

  const del = calls.find((call) => call.method === 'DELETE');
  assert.ok(del, 'the delete should still be attempted');
  assert.match(del.path, /payload->>guest_id=eq\.guest-impostor/, 'scoped to the session guest id');
  assert.doesNotMatch(del.path, /guest_name=eq\./, 'the typed name must not scope a delete');
});

test('a bulk save from a session with no guest id cannot clear the document', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  // A session minted before guest ids existed. It owns nothing, so an empty save must not
  // fall through to a scope that matches every guest's annotations.
  const legacy = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_name: 'Sarah',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const calls = [];
  const fakeDb = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({ session: legacy, document_id: 'doc_1', annotations: [] }),
    response,
    { db: fakeDb },
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { annotations: [], saved: false });
  assert.deepEqual(calls.filter((call) => call.method === 'DELETE'), [], 'nothing may be deleted');
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
