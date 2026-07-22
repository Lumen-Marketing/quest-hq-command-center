import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCompanyAdmin } from '../api/_lib/user-auth.js';

const SUPABASE = { supabaseUrl: 'https://project.supabase.co', serviceKey: 'service-key' };

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function requestWithToken(token) {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} };
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
