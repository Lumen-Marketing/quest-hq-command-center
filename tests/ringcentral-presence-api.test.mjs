import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolveCompanyAdmin } from '../api/_lib/user-auth.js';
import presenceHandler, { reconcilePresence } from '../api/ringcentral-presence.js';

const SUPABASE = { supabaseUrl: 'https://project.supabase.co', serviceKey: 'service-key' };

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function requestWithToken(token) {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} };
}

function vercelResponse() {
  const result = { statusCode: 200, body: null, headers: new Map() };
  return {
    result,
    setHeader(name, value) { result.headers.set(name, value); },
    status(statusCode) { result.statusCode = statusCode; return this; },
    json(body) { result.body = body; return body; },
  };
}

test('a request with no bearer token is rejected with 401', async () => {
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken(''), { ...SUPABASE, companyId: 'quest', fetchImpl: async () => jsonResponse({}) }),
    (error) => { assert.equal(error.statusCode, 401); return true; },
  );
});

test('a token Supabase rejects is surfaced as 401', async () => {
  const fetchImpl = async () => jsonResponse({ message: 'bad jwt' }, 401);
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('nope'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 401); return true; },
  );
});

test('a valid token from a non-member is rejected with 403', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'Nobody@Quest.com' });
    return jsonResponse([]);
  };
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 403); return true; },
  );
});

test('an active member is resolved with a lowercased email and isAdmin false', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'Rep@Quest.com' });
    return jsonResponse([{ role: 'worker', status: 'active' }]);
  };
  const result = await resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl });
  assert.deepEqual(result, { profileId: 'profile-1', email: 'rep@quest.com', isAdmin: false });
});

test('an owner, admin, developer, or construction supervisor is an admin', async () => {
  for (const role of ['owner', 'admin', 'developer', 'construction_supervisor']) {
    const fetchImpl = async (url) => {
      if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'boss@quest.com' });
      return jsonResponse([{ role, status: 'active' }]);
    };
    const result = await resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl });
    assert.equal(result.isAdmin, true, `${role} should be an admin`);
  }
});

test('a disabled membership does not authorize the caller', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'ex@quest.com' });
    return jsonResponse([]);
  };
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 403); return true; },
  );
});

test('the membership lookup is scoped to the company, the profile, and active status', async () => {
  const seen = [];
  const fetchImpl = async (url) => {
    seen.push(String(url));
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'rep@quest.com' });
    return jsonResponse([{ role: 'worker', status: 'active' }]);
  };
  await resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl });

  const membershipUrl = seen.find((url) => url.includes('company_memberships'));
  assert.match(membershipUrl, /company_id=eq\.quest/);
  assert.match(membershipUrl, /profile_id=eq\.profile-1/);
  assert.match(membershipUrl, /status=eq\.active/);
});

const presenceSource = readFileSync(new URL('../api/ringcentral-presence.js', import.meta.url), 'utf8');
const NOW = new Date('2026-07-23T12:00:00.000Z');

test('an unchanged status keeps its original status_since', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const live = [{ extension_id: '201', display_status: 'available' }];

  const { rows, changed } = reconcilePresence(previous, live, NOW);

  assert.equal(rows[0].status_since, '2026-07-23T11:00:00.000Z');
  assert.equal(changed.length, 0, 'nothing changed, so nothing is written');
});

test('a changed status resets status_since to now', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const live = [{ extension_id: '201', display_status: 'on_call' }];

  const { rows, changed } = reconcilePresence(previous, live, NOW);

  assert.equal(rows[0].display_status, 'on_call');
  assert.equal(rows[0].status_since, '2026-07-23T12:00:00.000Z');
  assert.equal(changed.length, 1);
});

test('an extension seen for the first time starts its clock now', () => {
  const { rows, changed } = reconcilePresence([], [{ extension_id: '202', display_status: 'busy' }], NOW);

  assert.equal(rows[0].status_since, '2026-07-23T12:00:00.000Z');
  assert.equal(changed.length, 1);
});

test('an extension that disappears from the live payload is dropped', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const { rows } = reconcilePresence(previous, [], NOW);
  assert.equal(rows.length, 0);
});

test('the presence endpoint requires authentication and admin rights', () => {
  assert.match(presenceSource, /resolveCompanyAdmin/);
  assert.match(presenceSource, /isAdmin/);
  assert.match(presenceSource, /status\(403\)/);
});

test('the presence endpoint caches upstream calls', () => {
  assert.match(presenceSource, /CACHE_TTL_MS/);
  assert.match(presenceSource, /detailedTelephonyState/);
});

test('the presence endpoint never exposes RingCentral credentials to the browser', () => {
  assert.doesNotMatch(presenceSource, /VITE_RINGCENTRAL/);
  assert.doesNotMatch(presenceSource, /access_token/);
});

test('a company without a RingCentral account is a normal disconnected state, not a server failure', async () => {
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = SUPABASE.supabaseUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE.serviceKey;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'profile-1', email: 'boss@quest.com' }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url.includes('/rest/v1/company_memberships')) return new Response(JSON.stringify([{ role: 'owner', status: 'active' }]), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url.includes('/rest/v1/ringcentral_accounts')) return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const response = vercelResponse();
    await presenceHandler({ method: 'GET', query: { company_id: 'quest' }, headers: { authorization: 'Bearer good' } }, response);
    assert.equal(response.result.statusCode, 200);
    assert.deepEqual(response.result.body, { connected: false, agents: [], stale: false });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test('a RingCentral failure serves stored status instead of an error', () => {
  // A 429 or outage must degrade to last-known data, never a visible error,
  // and cache it briefly so we back off the upstream that is refusing us.
  assert.match(presenceSource, /STALE_CACHE_TTL_MS/);
  assert.match(presenceSource, /catch \(upstreamError\)/);
  assert.match(presenceSource, /stale = true/);
  // The stored-data fallback path must not surface the upstream error to the client.
  const handlerStart = presenceSource.indexOf('let rows;');
  const handlerBody = presenceSource.slice(handlerStart, presenceSource.indexOf('return response.status(200).json(payload);', handlerStart));
  assert.ok(handlerBody.includes('stored.data'), 'fallback must read stored presence');
});
