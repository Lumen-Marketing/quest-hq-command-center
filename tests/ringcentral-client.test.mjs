import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRingCentralClient,
  RingCentralError,
  CONVERSATION_THRESHOLD_SECONDS,
  normalizeCallRecord,
  deriveDisplayStatus,
  normalizeExtension,
} from '../api/_lib/ringcentral.js';

const CONFIG = {
  clientId: 'cid',
  clientSecret: 'csecret',
  jwt: 'jwt-value',
  serverUrl: 'https://platform.ringcentral.com',
};

function fakeFetch(handlers) {
  const calls = [];
  const impl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const handler = handlers.shift();
    if (!handler) throw new Error(`Unexpected request to ${url}`);
    return handler(String(url), options);
  };
  impl.calls = calls;
  return impl;
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

test('the conversation threshold is sixty seconds', () => {
  assert.equal(CONVERSATION_THRESHOLD_SECONDS, 60);
});

test('getAccessToken posts the JWT bearer grant with basic auth', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ access_token: 'token-1', expires_in: 3600 })]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  const token = await client.getAccessToken();

  assert.equal(token, 'token-1');
  const [request] = fetchImpl.calls;
  assert.equal(request.url, 'https://platform.ringcentral.com/restapi/oauth/token');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(request.options.headers.Authorization, `Basic ${Buffer.from('cid:csecret').toString('base64')}`);
  assert.match(request.options.body, /grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer/);
  assert.match(request.options.body, /assertion=jwt-value/);
});

test('getAccessToken reuses a cached token instead of re-authenticating', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ access_token: 'token-1', expires_in: 3600 })]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  assert.equal(await client.getAccessToken(), 'token-1');
  assert.equal(await client.getAccessToken(), 'token-1');
  assert.equal(fetchImpl.calls.length, 1);
});

test('a failed token exchange raises RingCentralError carrying the status', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ error: 'invalid_grant' }, 400)]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  await assert.rejects(() => client.getAccessToken(), (error) => {
    assert.ok(error instanceof RingCentralError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});

test('fetchPaged follows every page and concatenates records', async () => {
  const fetchImpl = fakeFetch([
    () => jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
    (url) => {
      assert.match(url, /page=1/);
      assert.match(url, /perPage=250/);
      return jsonResponse({ records: [{ id: 'a' }], paging: { page: 1, totalPages: 2 } });
    },
    (url) => {
      assert.match(url, /page=2/);
      return jsonResponse({ records: [{ id: 'b' }], paging: { page: 2, totalPages: 2 } });
    },
  ]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  const records = await client.fetchPaged('/restapi/v1.0/account/~/call-log', { view: 'Simple' });

  assert.deepEqual(records.map((record) => record.id), ['a', 'b']);
});

test('fetchPaged sends the bearer token and surfaces a 429 as RingCentralError', async () => {
  const fetchImpl = fakeFetch([
    () => jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
    (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer token-1');
      return jsonResponse({ message: 'rate limit' }, 429);
    },
  ]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  await assert.rejects(() => client.fetchPaged('/restapi/v1.0/account/~/call-log', {}), (error) => {
    assert.equal(error.statusCode, 429);
    return true;
  });
});

const EXTENSIONS = new Map([
  ['201', { extension_id: '201', extension_number: '103', name: 'Ralph Garcia', email: 'Ralph@Quest.com ' }],
]);

test('normalizeCallRecord flattens a call and denormalizes the extension', () => {
  const row = normalizeCallRecord({
    id: 'call-1',
    sessionId: 'sess-1',
    startTime: '2026-07-20T17:04:05.000Z',
    direction: 'Outbound',
    duration: 95,
    result: 'Call connected',
    from: { phoneNumber: '+16025550101', name: 'Quest' },
    to: { phoneNumber: '+16025550102', name: 'Customer' },
    extension: { id: 201 },
  }, { companyId: 'quest', extensions: EXTENSIONS });

  assert.equal(row.company_id, 'quest');
  assert.equal(row.call_id, 'call-1');
  assert.equal(row.session_id, 'sess-1');
  assert.equal(row.started_at, '2026-07-20T17:04:05.000Z');
  assert.equal(row.direction, 'Outbound');
  assert.equal(row.duration_seconds, 95);
  assert.equal(row.result, 'Call connected');
  assert.equal(row.from_number, '+16025550101');
  assert.equal(row.to_name, 'Customer');
  assert.equal(row.extension_id, '201');
  assert.equal(row.extension_number, '103');
  assert.equal(row.extension_name, 'Ralph Garcia');
  assert.equal(row.extension_email, 'ralph@quest.com', 'email is lowercased and trimmed for matching');
  assert.equal(row.is_conversation, true);
});

test('normalizeCallRecord is inclusive at exactly the threshold and excludes one second under', () => {
  const build = (duration) => normalizeCallRecord(
    { id: `c-${duration}`, startTime: '2026-07-20T17:00:00.000Z', duration, extension: { id: 201 } },
    { companyId: 'quest', extensions: EXTENSIONS },
  );
  assert.equal(build(60).is_conversation, true);
  assert.equal(build(59).is_conversation, false);
  assert.equal(build(0).is_conversation, false);
});

test('normalizeCallRecord tolerates an unknown extension and a missing duration', () => {
  const row = normalizeCallRecord(
    { id: 'call-2', startTime: '2026-07-20T17:00:00.000Z', extension: { id: 999 } },
    { companyId: 'quest', extensions: EXTENSIONS },
  );
  assert.equal(row.extension_id, '999');
  assert.equal(row.extension_name, '');
  assert.equal(row.extension_email, '');
  assert.equal(row.duration_seconds, 0);
  assert.equal(row.is_conversation, false);
});

test('normalizeCallRecord rejects a record with no id or no start time', () => {
  const context = { companyId: 'quest', extensions: EXTENSIONS };
  assert.equal(normalizeCallRecord({ startTime: '2026-07-20T17:00:00.000Z' }, context), null);
  assert.equal(normalizeCallRecord({ id: 'call-3' }, context), null);
});

test('deriveDisplayStatus ranks an active call above every other signal', () => {
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'CallConnected', userStatus: 'Offline', dndStatus: 'DoNotAcceptAnyCalls' }), 'on_call');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'Ringing', userStatus: 'Offline' }), 'ringing');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', dndStatus: 'DoNotAcceptAnyCalls' }), 'dnd');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Offline' }), 'offline');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Busy' }), 'busy');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Available' }), 'available');
  assert.equal(deriveDisplayStatus({}), 'available', 'an empty payload falls back to available');
});

test('deriveDisplayStatus ignores a DND value that means DND is off', () => {
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Available', dndStatus: 'TakeAllCalls' }), 'available');
});

test('normalizeExtension keeps only enabled user extensions', () => {
  const row = normalizeExtension({
    id: 201,
    extensionNumber: '103',
    name: 'Ralph Garcia',
    contact: { email: 'Ralph@Quest.com' },
    status: 'Enabled',
    type: 'User',
  }, 'quest');
  assert.deepEqual(row, {
    company_id: 'quest',
    extension_id: '201',
    extension_number: '103',
    name: 'Ralph Garcia',
    email: 'ralph@quest.com',
    status: 'Enabled',
  });

  assert.equal(normalizeExtension({ id: 5, type: 'Department', status: 'Enabled' }, 'quest'), null);
  assert.equal(normalizeExtension({ type: 'User', status: 'Enabled' }, 'quest'), null);
});
