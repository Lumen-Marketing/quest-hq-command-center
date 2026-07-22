import assert from 'node:assert/strict';
import test from 'node:test';
import { createRingCentralClient, RingCentralError, CONVERSATION_THRESHOLD_SECONDS } from '../api/_lib/ringcentral.js';

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
