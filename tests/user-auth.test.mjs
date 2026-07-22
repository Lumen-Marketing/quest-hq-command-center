import assert from 'node:assert/strict';
import test from 'node:test';
import { getUserFromBearer, isActiveMember } from '../api/_lib/user-auth.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

test('getUserFromBearer returns null without a token', async () => {
  const user = await getUserFromBearer({ headers: {} }, async () => { throw new Error('should not fetch'); });
  assert.equal(user, null);
});

test('getUserFromBearer resolves the user from Supabase auth', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  const fakeFetch = async (url, opts) => {
    assert.match(url, /\/auth\/v1\/user$/);
    assert.equal(opts.headers.Authorization, 'Bearer user-token');
    return { ok: true, async json() { return { id: 'u1', email: 'a@b.com' }; } };
  };
  const user = await getUserFromBearer({ headers: { authorization: 'Bearer user-token' } }, fakeFetch);
  assert.deepEqual(user, { id: 'u1', email: 'a@b.com' });
});

test('isActiveMember is true when an active membership row exists', async () => {
  const db = async (path) => {
    assert.match(path, /company_memberships/);
    assert.match(path, /status=eq\.active/);
    return { ok: true, async json() { return [{ role: 'admin' }]; } };
  };
  assert.equal(await isActiveMember(db, 'co1', 'u1'), true);
});

test('isActiveMember is false when no row exists', async () => {
  const db = async () => ({ ok: true, async json() { return []; } });
  assert.equal(await isActiveMember(db, 'co1', 'u1'), false);
});
