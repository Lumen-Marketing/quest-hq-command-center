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

test('outbound SMS stays closed even when credentials and database hooks exist', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  process.env.VERCEL_URL = 'app.example.com';
  process.env.SMSBLAST_API_KEY = 'configured-but-not-authoritative';
  let touched = false;
  const r = res();
  await handler({
    method: 'POST', url: '/api/sms-send',
    headers: { authorization: 'Bearer t', host: 'app.example.com', origin: 'https://app.example.com' },
    body: { contact_id: 'c1', body: 'Hello' },
  }, r, {
    db: async () => { touched = true; return { ok: true, async json() { return []; } }; },
    smsSend: async () => { touched = true; return { ok: true }; },
  });
  assert.equal(r.statusCode, 501);
  assert.match(r.json().error, /intentionally disabled/i);
  assert.equal(touched, false);
});
