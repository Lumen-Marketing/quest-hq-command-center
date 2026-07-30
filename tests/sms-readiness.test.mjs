import assert from 'node:assert/strict';
import test from 'node:test';

import handler from '../api/sms-readiness.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) { this.headers[key] = value; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function request(contactId = 'contact-1', token = 'token') {
  return {
    method: 'GET',
    url: `/api/sms-readiness?contact_id=${encodeURIComponent(contactId)}`,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      host: 'app.example.com',
    },
  };
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; },
  };
}

function configureEnvironment() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  process.env.SMSBLAST_API_KEY = 'sms-api-key';
  process.env.SMSBLAST_WEBHOOK_TOKEN = 'sms-webhook-token';
}

function makeDb({
  contact = {
    id: 'contact-1',
    company_id: 'company-1',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  },
  companyRole = 'owner',
  workspace = {
    id: '11111111-1111-4111-8111-111111111111',
    company_id: 'company-1',
    status: 'active',
  },
  workspaceMembership = true,
  number = {
    id: 'number-1',
    workspace_id: '11111111-1111-4111-8111-111111111111',
    from_number: '+15551234567',
  },
  numberResponse,
  messagesResponse,
} = {}) {
  const calls = [];
  const db = async (path) => {
    calls.push(path);
    if (path.startsWith('/rest/v1/contacts?')) {
      return jsonResponse(contact ? [contact] : []);
    }
    if (path.startsWith('/rest/v1/company_memberships?')) {
      return jsonResponse(companyRole ? [{ role: companyRole, status: 'active' }] : []);
    }
    if (path.startsWith('/rest/v1/workspaces?')) {
      return jsonResponse(workspace ? [workspace] : []);
    }
    if (path.startsWith('/rest/v1/workspace_memberships?')) {
      return jsonResponse(workspaceMembership ? [{ status: 'active' }] : []);
    }
    if (path.startsWith('/rest/v1/sms_numbers?')) {
      if (numberResponse) return numberResponse;
      const correctlyScoped = path.includes('workspace_id=eq.11111111-1111-4111-8111-111111111111')
        && path.includes('company_id=eq.company-1')
        && path.includes('active=eq.true');
      return jsonResponse(correctlyScoped && number ? [number] : []);
    }
    if (path.startsWith('/rest/v1/sms_messages?')) {
      return messagesResponse || jsonResponse([]);
    }
    return jsonResponse([]);
  };
  return { db, calls };
}

async function run({
  db,
  user = { id: 'profile-1' },
  contactId,
  token,
  workspaceSmsBackendVersion,
} = {}) {
  const res = response();
  const overrides = {
    db,
    getUser: async () => user,
  };
  if (workspaceSmsBackendVersion !== undefined) {
    overrides.workspaceSmsBackendVersion = workspaceSmsBackendVersion;
  }
  await handler(request(contactId, token), res, overrides);
  return res;
}

test('production stays closed until the complete workspace SMS contract is implemented', async () => {
  configureEnvironment();
  const { db, calls } = makeDb();

  const res = await run({ db });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: false,
    status: 'backend_unavailable',
    message: 'Workspace-safe SMS routing is not available yet.',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  });
  assert.ok(!calls.some((path) => path.startsWith('/rest/v1/sms_numbers?')));
  assert.ok(!calls.some((path) => path.startsWith('/rest/v1/sms_messages?')));
});

test('a workspace with provider config, workspace-safe storage, and an active number is ready', async () => {
  configureEnvironment();
  const { db } = makeDb();

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: true,
    status: 'ready',
    message: 'SMS is ready.',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  });
});

test('missing provider credentials return a stable closed readiness state', async () => {
  configureEnvironment();
  delete process.env.SMSBLAST_WEBHOOK_TOKEN;
  const { db } = makeDb();

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: false,
    status: 'provider_unconfigured',
    message: 'SMS provider setup is incomplete.',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  });
});

test('a contact without a workspace returns a stable workspace-required state', async () => {
  configureEnvironment();
  const { db } = makeDb({
    contact: { id: 'contact-1', company_id: 'company-1', workspace_id: null },
  });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: false,
    status: 'workspace_required',
    message: 'Assign this contact to a workspace before using SMS.',
    workspace_id: null,
  });
});

test('an inactive or missing contact workspace cannot become ready', async () => {
  configureEnvironment();
  const { db } = makeDb({ workspace: null });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'workspace_unavailable');
  assert.equal(res.json().ready, false);
});

test('an absent SMS numbers table returns storage-unavailable instead of a generic 500', async () => {
  configureEnvironment();
  const { db } = makeDb({
    numberResponse: jsonResponse({ code: 'PGRST205', message: 'Could not find the table' }, 404),
  });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: false,
    status: 'storage_unavailable',
    message: 'Workspace-safe SMS storage is not available yet.',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  });
});

test('a company-only SMS numbers table fails closed when workspace_id is unavailable', async () => {
  configureEnvironment();
  const { db } = makeDb({
    numberResponse: jsonResponse({ code: '42703', message: 'column workspace_id does not exist' }, 400),
  });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'storage_unavailable');
  assert.equal(res.json().ready, false);
});

test('a missing or old SMS messages table also fails closed', async () => {
  configureEnvironment();
  const { db } = makeDb({
    messagesResponse: jsonResponse({ code: '42703', message: 'column workspace_id does not exist' }, 400),
  });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'storage_unavailable');
  assert.equal(res.json().ready, false);
});

test('a workspace without an assigned active number reports number-unassigned', async () => {
  configureEnvironment();
  const { db } = makeDb({ number: null });

  const res = await run({ db, workspaceSmsBackendVersion: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    ready: false,
    status: 'number_unassigned',
    message: 'No active SMS number is assigned to this workspace.',
    workspace_id: '11111111-1111-4111-8111-111111111111',
  });
});

test('an unauthenticated caller is rejected before readiness details are returned', async () => {
  configureEnvironment();
  const { db } = makeDb();

  const res = await run({ db, user: null, token: '' });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.json(), { error: 'Authentication required.' });
});

test('a caller without an active company membership is rejected', async () => {
  configureEnvironment();
  const { db } = makeDb({ companyRole: null });

  const res = await run({ db });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.json(), { error: 'You do not have access to this contact.' });
});

test('a worker who is not assigned to the contact workspace is rejected', async () => {
  configureEnvironment();
  const { db } = makeDb({ companyRole: 'worker', workspaceMembership: false });

  const res = await run({ db });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.json(), { error: 'You do not have access to this workspace.' });
});
