import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import openHandler from '../api/wb-intake-open.js';
import submitHandler from '../api/wb-intake-submit.js';
import { MAX_PASSCODE_ATTEMPTS, hashPasscode, makePasscodeSalt } from '../api/_lib/intake.js';
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
// The ids as they really are on both sides: the builder document keys the workspace
// `ws-<uuid>`, and wb_intake_links.workspace_id is a uuid column holding the BARE one. The
// fixture used to put the builder key in the row, which is the shape that let a broken
// lookup pass for real: every public link answered "no longer available".
const WS_UUID = '9f1c7b52-6d3e-4a71-8c2f-15b0d4e9a3c8';
const WS_DOC_ID = `ws-${WS_UUID}`;
const LINK = {
  token: 'tok-public', company_id: 'co1', workspace_id: WS_UUID, app_id: 'app-1',
  title: 'Tell us about the job', intro: 'Two minutes.', visibility: 'public',
  passcode_hash: null, passcode_salt: null, field_ids: [], status: 'active',
  submission_count: 0, max_submissions: null, expires_at: null,
  failed_attempts: 0, locked_until: null,
};

// The link row is mutable here, and PATCH honours its filters, because the counters are now
// compare-and-swap: `?submission_count=eq.3` updates only while the value really is 3, and
// returns an empty representation when it is not. A fake that always answered "updated" would
// hide exactly the race these counters exist to close.
function makeDb({ link = LINK, apps = [APP], workspaceId = WS_DOC_ID, submitFails = false, owner = null, notifyFails = false } = {}) {
  const calls = [];
  const row = link ? { ...link } : null;

  const casFilterHolds = (path) => {
    for (const column of ['submission_count', 'failed_attempts']) {
      const match = new RegExp(`[?&]${column}=eq\\.(\\d+)`).exec(path);
      if (match && Number(row?.[column] ?? 0) !== Number(match[1])) return false;
    }
    return true;
  };

  const db = async (path, options = {}) => {
    const method = options.method || 'GET';
    calls.push({ path, method, body: options.body });

    if (path.startsWith('/rest/v1/wb_intake_links?')) {
      if (method === 'PATCH') {
        if (!row || !casFilterHolds(path)) return { ok: true, async json() { return []; } };
        Object.assign(row, JSON.parse(options.body || '{}'));
        return { ok: true, async json() { return [{ ...row }]; } };
      }
      return { ok: true, async json() { return row ? [{ ...row }] : []; } };
    }
    if (path.startsWith('/rest/v1/workspace_builder_state?')) {
      return { ok: true, async json() { return [{ doc: { workspaces: [{ id: workspaceId, apps }] } }]; } };
    }
    if (path.startsWith('/rest/v1/companies?')) {
      return { ok: true, async json() { return [{ primary_owner_profile_id: owner }]; } };
    }
    if (path === '/rest/v1/notifications') {
      if (notifyFails) return { ok: false, status: 500, async json() { return {}; } };
      return { ok: true, async json() { return [{}]; } };
    }
    if (path === '/rest/v1/wb_intake_submissions') {
      if (submitFails) return { ok: false, status: 500, async json() { return {}; } };
      return { ok: true, async json() { return [{ id: 'sub-1' }]; } };
    }
    return { ok: true, async json() { return []; } };
  };
  return { db, calls, row: () => row };
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
  for (const secret of ['co1', WS_UUID, WS_DOC_ID, 'app-1', 'passcode_hash']) {
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

test('the submission slot is claimed before the row is written', async () => {
  // Reversed deliberately. Counting afterwards meant two posts sent together both passed the
  // cap check and both got in, so a link meant to be filled in once accepted several.
  const { db, calls, row } = makeDb();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x' } } }), res(), { db });
  const order = calls.map((c) => `${c.method} ${c.path.split('?')[0]}`);
  const insertAt = order.indexOf('POST /rest/v1/wb_intake_submissions');
  const patchAt = order.indexOf('PATCH /rest/v1/wb_intake_links');
  assert.ok(patchAt > -1 && insertAt > patchAt, 'the cap must be claimed before the row is stored');
  assert.equal(row().submission_count, 1);
});

test('a failed insert hands the submission slot back', async () => {
  // The property the old ordering protected is kept: a submission that could not be stored
  // must not use up somebody's one submission.
  const { db, row } = makeDb({ submitFails: true });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x' } } }), r, { db });
  assert.equal(r.statusCode, 500);
  assert.equal(row().submission_count, 0, 'a failed insert must not consume the cap');
});

test('concurrent submissions cannot overshoot max_submissions', async () => {
  const { db, calls } = makeDb({ link: { ...LINK, max_submissions: 1 } });
  const posts = [1, 2, 3, 4].map(() => {
    const r = res();
    return submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'x' } } }), r, { db })
      .then(() => r.statusCode);
  });
  const codes = await Promise.all(posts);
  assert.equal(codes.filter((code) => code === 200).length, 1, 'exactly one post may win a one-submission link');
  const stored = calls.filter((c) => c.path === '/rest/v1/wb_intake_submissions');
  assert.equal(stored.length, 1, 'only the winning post may store a row');
});

test('concurrent wrong passcodes still trip the lockout', async () => {
  // Read-modify-write let eight guesses posted together all read 0 and all write 1, so the
  // limit never arrived. The compare-and-swap is what makes the count survive concurrency.
  const link = { ...LINK, visibility: 'private', passcode_salt: SALT, passcode_hash: hashPasscode('AB2CD3', SALT) };
  const { db, row } = makeDb({ link });
  const guesses = Array.from({ length: MAX_PASSCODE_ATTEMPTS }, () => {
    const r = res();
    return openHandler(req('POST', { body: { token: 'tok-public', passcode: 'WRONG1' } }), r, { db })
      .then(() => r.statusCode);
  });
  await Promise.all(guesses);
  assert.ok(row().locked_until, 'the link must lock once the attempts are spent');
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

// ---- somebody is told --------------------------------------------------------------------------
//
// Before this, a submission landed in the staging table and nothing else happened: the only place
// it appeared was the share-link panel of that one app, which somebody had to open on purpose.

const CREATOR = '8f14e45f-ce9a-4c2b-9a4b-2f0d3c1b7e55';
const OWNER = '2b7e1516-28ae-4d2a-a6ab-f7158809cf4f';
const notificationFrom = (calls) => {
  const call = calls.find((c) => c.path === '/rest/v1/notifications');
  return call ? JSON.parse(call.body) : null;
};

test('a submission notifies the member who made the link', async () => {
  const { db, calls } = makeDb({ link: { ...LINK, created_by: CREATOR } });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson', f2: '555' } } }), r, { db });
  assert.equal(r.statusCode, 200);

  const note = notificationFrom(calls);
  assert.ok(note, 'nobody was told');
  assert.equal(note.recipient_profile_id, CREATOR);
  assert.equal(note.type, 'form.intake', 'files under Forms in the inbox');
  assert.equal(note.source_type, 'wb_intake_submission');
  assert.equal(note.source_id, 'sub-1', 'points at the submission that arrived');
  assert.ok(note.href.includes('/workspaces?app_id=app-1&workspace=ws-'), 'opens the app it belongs to');
  assert.match(note.body, /Prospects/, 'names the app');
});

test('the notification carries none of what the visitor typed', async () => {
  // Their answers are already in the submission, behind the workspace permission. A notification
  // row travels further -- a popover now, a digest later -- and does not need to carry them.
  const { db, calls } = makeDb({ link: { ...LINK, created_by: CREATOR } });
  const r = res();
  await submitHandler(req('POST', {
    body: { token: 'tok-public', values: { f1: 'Henderson', f2: '555' }, name: 'Maya Santos', email: 'maya@example.com' },
  }), r, { db });
  const raw = JSON.stringify(notificationFrom(calls));
  for (const secret of ['Henderson', '555', 'Maya Santos', 'maya@example.com']) {
    assert.ok(!raw.includes(secret), 'the notification leaks ' + secret);
  }
});

test('a link made before creators were recorded falls back to the company owner', async () => {
  const { db, calls } = makeDb({ owner: OWNER });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson' } } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.equal(notificationFrom(calls)?.recipient_profile_id, OWNER);
});

test('with nobody to tell, the submission still lands', async () => {
  const { db, calls } = makeDb({ owner: null });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson' } } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { submitted: true });
  assert.equal(notificationFrom(calls), null);
});

test('a notification that cannot be written never fails the submission', async () => {
  // The visitor has already sent their answers and been told so. An error here would invite them
  // to send everything a second time.
  const { db, calls } = makeDb({ link: { ...LINK, created_by: CREATOR }, notifyFails: true });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson' } } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { submitted: true });
  assert.ok(calls.some((c) => c.path === '/rest/v1/wb_intake_submissions'), 'the answers were stored');
});

test('nobody is told about a submission that was refused', async () => {
  const { db, calls } = makeDb({ link: { ...LINK, created_by: CREATOR }, submitFails: true });
  const r = res();
  await submitHandler(req('POST', { body: { token: 'tok-public', values: { f1: 'Henderson' } } }), r, { db });
  assert.equal(r.statusCode, 500);
  assert.equal(notificationFrom(calls), null);
});

test('a new link records who made it, so the right person is told', () => {
  const manage = readFileSync(new URL('../src/intake/manage.js', import.meta.url), 'utf8');
  assert.ok(manage.includes('created_by: auth?.user?.id || null,'), 'the link records its creator');
  assert.ok(manage.includes('supabase.auth.getUser()'), 'read from the signed-in session');
});
