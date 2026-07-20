import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/sms-inbound.js';

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
function req(body, token) {
  return { method: 'POST', url: `/api/sms-inbound?token=${encodeURIComponent(token || '')}`,
    headers: { host: 'app.example.com' }, body };
}
function env() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.SMSBLAST_WEBHOOK_TOKEN = 'secret-token';
}

test('rejects an invalid webhook token with 401', async () => {
  env();
  const r = res();
  await handler(req({ from: '+19282310147', to: '+18555945081', message: 'hi' }, 'wrong'), r, { db: async () => ({ ok: true, async json() { return []; } }) });
  assert.equal(r.statusCode, 401);
});

test('matches an existing contact and saves an inbound row', async () => {
  env();
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return [{ company_id: 'co1' }]; } };
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return [{ id: 'c1', phone: '928-231-0147' }]; } };
    return { ok: true, async json() { return [{ id: 'x' }]; } };
  };
  const r = res();
  await handler(req({ from: '+19282310147', to: '+18555945081', message: 'yes please' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  const row = JSON.parse(insert.body);
  assert.equal(row.direction, 'inbound');
  assert.equal(row.status, 'received');
  assert.equal(row.contact_id, 'c1');
  assert.equal(row.company_id, 'co1');
  assert.ok(!calls.some((c) => c.path === '/rest/v1/contacts' && c.method === 'POST'), 'does not create a contact');
});

test('auto-creates a contact when the sender is unknown', async () => {
  env();
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return [{ company_id: 'co1' }]; } };
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return []; } };
    if (path === '/rest/v1/contacts') return { ok: true, async json() { return [{ id: 'new1' }]; } };
    return { ok: true, async json() { return [{ id: 'x' }]; } };
  };
  const r = res();
  await handler(req({ from: '+14805551234', to: '+18555945081', message: 'new lead' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  const create = calls.find((c) => c.path === '/rest/v1/contacts' && c.method === 'POST');
  assert.ok(create, 'creates a contact');
  const created = JSON.parse(create.body);
  assert.equal(created.company_id, 'co1');
  assert.equal(created.stage, 'Leads');
  assert.equal(created.phone, '+14805551234');
});

test('unknown destination number is a safe no-op', async () => {
  env();
  const db = async (path) => {
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return []; } };
    return { ok: true, async json() { return []; } };
  };
  const r = res();
  await handler(req({ from: '+19282310147', to: '+15550000000', message: 'hi' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().ok, true);
});
