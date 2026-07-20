import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/sms-send.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}
function req(body) {
  return { method: 'POST', url: '/api/sms-send',
    headers: { authorization: 'Bearer t', host: 'app.example.com' },
    body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.SMSBLAST_API_KEY = 'k';
}

function makeDb({ contact, number }) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return contact ? [contact] : []; } };
    if (path.startsWith('/rest/v1/company_memberships?')) return { ok: true, async json() { return [{ role: 'admin' }]; } };
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return number ? [number] : []; } };
    if (path === '/rest/v1/sms_messages') return { ok: true, async json() { return [{ id: 'm1', status: 'sent' }]; } };
    return { ok: true, async json() { return []; } };
  };
  return { db, calls };
}

test('happy path: sends via SMSblast and returns the saved row', async () => {
  baseEnv();
  const { db, calls } = makeDb({
    contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147', name: 'Will' },
    number: { from_number: '+18555945081' },
  });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'Hello there' }), r, {
    db,
    getUser: async () => ({ id: 'u1', email: 'a@b.com' }),
    smsSend: async ({ to, from, message }) => {
      assert.equal(to, '+19282310147'); assert.equal(from, '+18555945081'); assert.equal(message, 'Hello there');
      return { ok: true, status: 200, data: { id: 'prov_1' } };
    },
  });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { message: { id: 'm1', status: 'sent' } });
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  assert.ok(insert, 'inserts an sms_messages row');
  const row = JSON.parse(insert.body);
  assert.equal(row.direction, 'outbound');
  assert.equal(row.status, 'sent');
  assert.equal(row.provider_message_id, 'prov_1');
});

test('unauthenticated caller is rejected 401', async () => {
  baseEnv();
  const { db } = makeDb({ contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147' }, number: { from_number: '+1' } });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => null, smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 401);
});

test('non-member is rejected 403', async () => {
  baseEnv();
  const db = async (path) => {
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return [{ id: 'c1', company_id: 'co1', phone: '928-231-0147' }]; } };
    if (path.startsWith('/rest/v1/company_memberships?')) return { ok: true, async json() { return []; } };
    return { ok: true, async json() { return []; } };
  };
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => ({ id: 'u1' }), smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 403);
});

test('invalid contact phone is rejected 400', async () => {
  baseEnv();
  const { db } = makeDb({ contact: { id: 'c1', company_id: 'co1', phone: '' }, number: { from_number: '+18555945081' } });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => ({ id: 'u1' }), smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 400);
});

test('provider failure persists a failed row and returns 502', async () => {
  baseEnv();
  const { db, calls } = makeDb({
    contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147' },
    number: { from_number: '+18555945081' },
  });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, {
    db, getUser: async () => ({ id: 'u1' }),
    smsSend: async () => ({ ok: false, status: 402, data: { error: 'Insufficient balance' } }),
  });
  assert.equal(r.statusCode, 502);
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  const row = JSON.parse(insert.body);
  assert.equal(row.status, 'failed');
  assert.equal(row.error, 'Insufficient balance');
});
