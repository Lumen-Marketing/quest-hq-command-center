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

test('GET annotations accepts a portal session in the Authorization header', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  const session = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_id: 'guest_1',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const calls = [];
  const fakeDb = async (path) => {
    calls.push(path);
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };
  const request = {
    method: 'GET',
    headers: { host: 'localhost', authorization: `Bearer ${session}` },
    url: '/api/client-portal-annotations?document_id=doc_1',
  };
  const response = createJsonResponse();

  await annotationsHandler(request, response, { db: fakeDb });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { annotations: [] });
  assert.ok(calls.some((path) => path.includes('document_id=eq.doc_1')));
  assert.doesNotMatch(request.url, /[?&]session=/);
});

test('GET annotations rejects a portal session supplied in the URL', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';

  const session = signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_id: 'guest_1',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const response = createJsonResponse();
  const request = {
    method: 'GET',
    headers: { host: 'localhost' },
    url: `/api/client-portal-annotations?session=${encodeURIComponent(session)}&document_id=doc_1`,
  };

  await annotationsHandler(request, response, {
    db: async () => { throw new Error('URL credentials must be rejected before database access'); },
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), { error: 'Portal session expired.' });
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

// ---- Annotation ownership on the write paths --------------------------------
//
// A portal guest reads every annotation in their portal, so annotation ids belonging to other
// guests are handed out by GET. `sanitize` accepts a caller-supplied `id` and the write is
// `ON CONFLICT (id) DO UPDATE`, so a write naming somebody else's id would take that row over —
// `guest_id` included, which then also satisfies the delete filter. These tests pin both write
// paths against that.

const VICTIM_ID = '11111111-2222-4333-8444-555555555555';
const ATTACKER_ID = '99999999-8888-4777-8666-555555555555';
const DOC_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

function portalEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';
}

function signGuest(guestId) {
  return signPortalSession({
    portal_id: 'portal_1',
    company_id: 'company_1',
    guest_id: guestId,
    guest_name: 'Guest',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
}

// A fake db that answers the session check, the document check, and the ownership lookup, and
// records every write. `existing` is what the ownership read returns.
function annotationsDb({ existing = [], document = true } = {}) {
  const calls = [];
  const db = async (path, options = {}) => {
    const method = options.method || 'GET';
    calls.push({ path, method, body: options.body });
    if (path.includes('client_portals?')) {
      return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
    }
    if (path.includes('client_portal_documents')) {
      return { ok: true, status: 200, async json() { return document ? [{ id: DOC_ID }] : []; } };
    }
    if (path.includes('id=in.(')) {
      return { ok: true, status: 200, async json() { return existing; } };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };
  return { db, calls };
}

test('a bulk save naming another guest\'s annotation is refused', async () => {
  portalEnv();
  // The victim's row, exactly as the ownership read would find it: same portal, different guest.
  const { db, calls } = annotationsDb({
    existing: [{ id: VICTIM_ID, portal_id: 'portal_1', company_id: 'company_1', payload: { guest_id: 'guest-victim' } }],
  });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotations: [{ id: VICTIM_ID, annotation_type: 'markup', page_number: 1, payload: {} }],
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 409);
  assert.deepEqual(calls.filter((call) => call.method === 'POST'), [], 'nothing may be upserted');
  assert.deepEqual(calls.filter((call) => call.method === 'DELETE'), [], 'nothing may be deleted');
});

test('a bulk save naming an annotation in another portal is refused', async () => {
  portalEnv();
  const { db, calls } = annotationsDb({
    existing: [{ id: VICTIM_ID, portal_id: 'portal_other', company_id: 'company_other', payload: { guest_id: 'guest-x' } }],
  });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotations: [{ id: VICTIM_ID, annotation_type: 'markup', payload: {} }],
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), []);
});

test('a bulk save of the caller\'s own annotations still succeeds', async () => {
  portalEnv();
  // The caller re-saving its own annotation, which is what the client actually does.
  const { db, calls } = annotationsDb({
    existing: [{ id: VICTIM_ID, portal_id: 'portal_1', company_id: 'company_1', payload: { guest_id: 'guest-attacker' } }],
  });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotations: [{ id: VICTIM_ID, annotation_type: 'markup', page_number: 1, payload: {} }],
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().saved, true);
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1, 'the upsert should run');
});

test('a bulk save is refused when the ownership read fails, rather than treated as empty', async () => {
  portalEnv();
  // A transient database error on the ownership lookup. Treating it as "no such rows" would skip
  // the guard entirely and let the caller claim the row.
  const calls = [];
  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotations: [{ id: VICTIM_ID, annotation_type: 'markup', payload: {} }],
    }),
    response,
    {
      db: async (path, options = {}) => {
        const method = options.method || 'GET';
        calls.push({ path, method });
        if (path.includes('client_portals?')) {
          return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
        }
        if (path.includes('client_portal_documents')) {
          return { ok: true, status: 200, async json() { return [{ id: DOC_ID }]; } };
        }
        if (path.includes('id=in.(')) return { ok: false, status: 500, async json() { return []; } };
        return { ok: true, status: 200, async json() { return []; } };
      },
    },
  );

  assert.equal(response.statusCode, 503);
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), [], 'a failed check must write nothing');
});

test('a single save naming an annotation in another portal is refused', async () => {
  portalEnv();
  const { db, calls } = annotationsDb({
    existing: [{ id: VICTIM_ID, portal_id: 'portal_other', company_id: 'company_other', payload: { guest_id: 'guest-victim' } }],
  });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotation: { id: VICTIM_ID, annotation_type: 'markup', payload: {} },
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), [], 'a cross-portal row must not be moved');
});

test('a single save still preserves another guest\'s markup and only adds the thread', async () => {
  portalEnv();
  // The legitimate second case: a second guest replying to somebody else's comment. Their
  // guest_id, name, type and page must survive; only the incoming thread is accepted.
  const { db, calls } = annotationsDb({
    existing: [{
      id: VICTIM_ID,
      portal_id: 'portal_1',
      company_id: 'company_1',
      guest_name: 'Victim',
      annotation_type: 'comment',
      page_number: 4,
      payload: { guest_id: 'guest-victim', text: 'original' },
    }],
  });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotation: {
        id: VICTIM_ID,
        annotation_type: 'markup',
        page_number: 99,
        guest_name: 'Attacker',
        payload: { text: 'overwritten', thread: [{ id: 'm1', text: 'a reply' }] },
      },
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 200);
  const written = JSON.parse(calls.find((call) => call.method === 'POST').body);
  assert.equal(written.guest_name, 'Victim', 'the original author name is preserved');
  assert.equal(written.annotation_type, 'comment');
  assert.equal(written.page_number, 4);
  assert.equal(written.payload.text, 'original', 'the original comment is not overwritten');
  assert.deepEqual(written.payload.thread, [{ id: 'm1', text: 'a reply' }]);
});

test('annotations cannot be written against a document outside the session portal', async () => {
  portalEnv();
  const { db, calls } = annotationsDb({ existing: [], document: false });

  for (const payload of [
    { document_id: DOC_ID, annotations: [{ id: ATTACKER_ID, payload: {} }] },
    { document_id: DOC_ID, annotation: { id: ATTACKER_ID, payload: {} } },
  ]) {
    const response = createJsonResponse();
    await annotationsHandler(
      createJsonRequest({ session: signGuest('guest-attacker'), ...payload }),
      response,
      { db },
    );
    assert.equal(response.statusCode, 404);
  }
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), [], 'nothing may be written');
});

test('a non-uuid annotation id is refused before it reaches a query', async () => {
  portalEnv();
  const { db, calls } = annotationsDb({ existing: [] });

  const response = createJsonResponse();
  await annotationsHandler(
    createJsonRequest({
      session: signGuest('guest-attacker'),
      document_id: DOC_ID,
      annotations: [{ id: 'x) or 1=1--', payload: {} }],
    }),
    response,
    { db },
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(calls.filter((call) => call.method !== 'GET'), []);
});

test('GET does not hand out the internal ownership id', async () => {
  portalEnv();
  // Guests are meant to see each other's markup, but `payload.guest_id` is the key that decides
  // who may change it. No legitimate client reads it, so it is not returned.
  const response = createJsonResponse();
  await annotationsHandler(
    {
      method: 'GET',
      headers: { host: 'localhost', authorization: `Bearer ${signGuest('guest-a')}` },
      url: `/api/client-portal-annotations?document_id=${DOC_ID}`,
    },
    response,
    {
      db: async (path) => {
        if (path.includes('client_portals?')) {
          return { ok: true, status: 200, async json() { return [{ id: 'portal_1' }]; } };
        }
        return {
          ok: true,
          status: 200,
          async json() {
            return [{ id: VICTIM_ID, payload: { guest_id: 'guest-victim', text: 'hello' } }];
          },
        };
      },
    },
  );

  assert.equal(response.statusCode, 200);
  const [annotation] = response.json().annotations;
  assert.equal(annotation.payload.text, 'hello', 'the markup itself is still returned');
  assert.ok(!('guest_id' in annotation.payload), 'the internal ownership id is stripped');
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
