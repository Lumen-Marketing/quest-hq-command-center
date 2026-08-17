import assert from 'node:assert/strict';
import test from 'node:test';
import openHandler from '../api/wb-intake-open.js';
import submitHandler from '../api/wb-intake-submit.js';
import { hashPasscode, makePasscodeSalt } from '../api/_lib/intake.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => {
  resetRateLimits();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
});
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}
const req = (method, { body, url = '', headers = {} } = {}) => ({
  method, url: `/api/wb-intake${url}`, headers: { host: 'app.example.com', ...headers }, body,
});

const SALT = makePasscodeSalt();
const APP = {
  id: 'app-1',
  name: 'Prospects',
  recordName: 'Prospect',
  color: '#64748b',
  fields: [
    { id: 'f1', label: 'Prospect', type: 'text', required: true, config: {} },
    { id: 'f2', label: 'Phone', type: 'phone', config: {} },
    { id: 'f3', label: 'Contact', type: 'company_contact', config: {} },
  ],
};
const LINK = {
  token: 'tok-public', company_id: 'co1', workspace_id: 'ws-1', app_id: 'app-1',
  title: 'Tell us about the job', intro: 'Two minutes.', visibility: 'public',
  passcode_hash: null, passcode_salt: null, field_ids: [], status: 'active',
  submission_count: 0, max_submissions: null, expires_at: null,
  failed_attempts: 0, locked_until: null,
};

function makeDb({ link = LINK, apps = [APP], workspaceId = 'ws-1' } = {}) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/wb_intake_links?')) {
      if ((options.method || 'GET') === 'PATCH') return { ok: true, async json() { return []; } };
      return { ok: true, async json() { return link ? [link] : []; } };
    }
    if (path.startsWith('/rest/v1/workspace_builder_state?')) {
      return { ok: true, async json() { return [{ doc: { workspaces: [{ id: workspaceId, apps }] } }]; } };
    }
    if (path === '/rest/v1/wb_intake_submissions') {
      return { ok: true, async json() { return [{ id: 'sub-1' }]; } };
    }
    return { ok: true, async json() { return []; } };
  };
  return { db, calls };
}

// ---- opening -----------------------------------------------------------------------------------

test('a public link hands over its fields, and nothing about the company', async () => {
  const { db } = makeDb();
  const r = res();
  await openHandler(req('GET', { url: '?token=tok-public' }), r, { db });
  assert.equal(r.statusCode, 200);
  const out = r.json();
  assert.equal(out.link.title, 'Tell us about the job');
  assert.equal(out.link.needsPasscode, false);
  assert.deepEqual(out.fields.map((f) => f.id), ['f1', 'f2'], 'the contact field is not fillable');
  // The response must not carry the tenant, the app id, or the secret.
  const raw = JSON.stringify(out);
  for (const secret of ['co1', 'ws-1', 'app-1', 'passcode_hash']) {
    assert.ok(!raw.includes(secret), `the response leaks ${secret}`);
  }
});

test('a private link says so and returns no fields at all before the passcode', async () => {
  // Field labels describe the business. Handing them over before the gate leaks the shape of
  // the work to anybody who guessed a token.
  const link = { ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT) };
  const { db } = makeDb({ link });
  const r = res();
  await openHandler(req('GET', { url: '?token=tok-public' }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().link.needsPasscode, true);
  assert.deepEqual(r.json().fields, []);
  assert.ok(!r.body.includes('Prospect'), 'a field label escaped before the gate');
});

test('the right passcode opens it; a wrong one does not', async () => {
  const link = { ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT) };
  const good = res();
  await openHandler(req('POST', { body: { token: 'tok-public', passcode: 'ab2cd3' } }), good, { db: makeDb({ link }).db });
  assert.equal(good.statusCode, 200);
  assert.deepEqual(good.json().fields.map((f) => f.id), ['f1', 'f2']);

  const bad = res();
  await openHandler(req('POST', { body: { token: 'tok-public', passcode: 'ZZZZZZ' } }), bad, { db: makeDb({ link }).db });
  assert.equal(bad.statusCode, 401);
  assert.deepEqual(bad.json().fields, undefined);
});

test('a wrong passcode is counted, and the eighth locks the link', async () => {
  const link = {
    ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT),
    failed_attempts: 7,
  };
  const { db, calls } = makeDb({ link });
  const r = res();
  await openHandler(req('POST', { body: { token: 'tok-public', passcode: 'ZZZZZZ' } }), r, { db });
  assert.equal(r.statusCode, 401);
  const patch = calls.find((c) => c.method === 'PATCH');
  assert.ok(patch, 'a failed attempt must be recorded in the database, not only in memory');
  const patched = JSON.parse(patch.body);
  assert.ok(patched.locked_until, 'the eighth failure locks it');
  assert.equal(patched.failed_attempts, 0, 'the counter resets when the lock takes over');
});

test('a locked link refuses even the correct passcode', async () => {
  const link = {
    ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT),
    locked_until: new Date(Date.now() + 60_000).toISOString(),
  };
  const r = res();
  await openHandler(req('POST', { body: { token: 'tok-public', passcode: 'AB2CD3' } }), r, { db: makeDb({ link }).db });
  assert.equal(r.statusCode, 429);
});

test('an unknown, paused, expired or used-up link cannot be opened', async () => {
  const cases = [
    [null, 404],
    [{ ...LINK, status: 'paused' }, 410],
    [{ ...LINK, expires_at: new Date(Date.now() - 60_000).toISOString() }, 410],
    [{ ...LINK, max_submissions: 1, submission_count: 1 }, 410],
  ];
  for (const [link, status] of cases) {
    const r = res();
    await openHandler(req('GET', { url: '?token=tok-public' }), r, { db: makeDb({ link }).db });
    assert.equal(r.statusCode, status, `expected ${status} for ${JSON.stringify(link?.status ?? 'missing')}`);
  }
});

test('a link whose app has been deleted says so rather than 500', async () => {
  const r = res();
  await openHandler(req('GET', { url: '?token=tok-public' }), r, { db: makeDb({ apps: [] }).db });
  assert.equal(r.statusCode, 404);
});

// ---- submitting ----------------------------------------------------------------------------------

test('a submission lands in the staging table and nowhere near the company document', async () => {
  const { db, calls } = makeDb();
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson', f2: '555' } } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { submitted: true });

  const insert = calls.find((c) => c.path === '/rest/v1/wb_intake_submissions');
  assert.ok(insert, 'no submission was stored');
  const row = JSON.parse(insert.body);
  assert.deepEqual(row.values, { f1: 'Henderson', f2: '555' });
  assert.equal(row.status, undefined, 'status is left to the column default of pending');

  // The whole design rests on this: an anonymous request never writes the builder document,
  // because the only write it has is "replace every app in the company".
  const wrote = calls.filter((c) => c.path.startsWith('/rest/v1/workspace_builder_state') && c.method !== 'GET');
  assert.deepEqual(wrote, [], 'an anonymous submission wrote to workspace_builder_state');
});

test('the submission counter only moves after the row is safely in', async () => {
  const { db, calls } = makeDb();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x' } } }), res(), { db });
  const order = calls.map((c) => `${c.method} ${c.path.split('?')[0]}`);
  const insertAt = order.indexOf('POST /rest/v1/wb_intake_submissions');
  const patchAt = order.indexOf('PATCH /rest/v1/wb_intake_links');
  assert.ok(insertAt > -1 && patchAt > insertAt, 'a failed insert must not use up somebody\'s one submission');
  assert.equal(JSON.parse(calls[patchAt].body).submission_count, 1);
});

test('the passcode is enforced on submit too, not only on open', async () => {
  // The page calls open first, but a poster does not have to. Trusting that call would let
  // anybody submit to a private link by skipping it.
  const link = { ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT) };
  const { db, calls } = makeDb({ link });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x' } } }), r, { db });
  assert.equal(r.statusCode, 401);
  assert.ok(!calls.some((c) => c.path === '/rest/v1/wb_intake_submissions'), 'it stored the row anyway');

  const ok = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', passcode: 'AB2CD3', values: { f1: 'x' } } }), ok, { db: makeDb({ link }).db });
  assert.equal(ok.statusCode, 200);
});

test('a submission naming a withheld field is refused', async () => {
  const { db, calls } = makeDb({ link: { ...LINK, field_ids: ['f1'] } });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x', f2: '555' } } }), r, { db });
  assert.equal(r.statusCode, 400);
  assert.ok(!calls.some((c) => c.path === '/rest/v1/wb_intake_submissions'));
});

test('a missing required answer is refused with the field named', async () => {
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f2: '555' } } }), r, { db: makeDb().db });
  assert.equal(r.statusCode, 400);
  assert.match(r.json().error, /Prospect/);
});

test('the honeypot and the too-fast fill are both handled without storing anything', async () => {
  const trap = makeDb();
  const r1 = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', website: 'spam', values: { f1: 'x' } } }), r1, { db: trap.db });
  assert.equal(r1.statusCode, 200, 'a bot must not learn that it was caught');
  assert.ok(!trap.calls.some((c) => c.path === '/rest/v1/wb_intake_submissions'));

  const fast = makeDb();
  const r2 = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', started_at: new Date().toISOString(), values: { f1: 'x' } } }), r2, { db: fast.db });
  assert.equal(r2.statusCode, 429);
  assert.ok(!fast.calls.some((c) => c.path === '/rest/v1/wb_intake_submissions'));
});

test('a disallowed origin is refused before any work happens', async () => {
  const { db, calls } = makeDb();
  const r = res();
  await submitHandler(req('POST', {
    body: { token: 'tok-public', values: { f1: 'x' } },
    headers: { origin: 'https://evil.example' },
  }), r, { db });
  assert.equal(r.statusCode, 403);
  assert.deepEqual(calls, []);
});
