import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/sms-inbound.js';

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

test('inbound SMS stays closed and never touches tenant data', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  process.env.SMSBLAST_WEBHOOK_TOKEN = 'configured-but-not-authoritative';
  let touched = false;
  const r = res();
  await handler({
    method: 'POST', url: '/api/sms-inbound?token=x', headers: { host: 'app.example.com' },
    body: { from: '+19282310147', to: '+18555945081', message: 'hi' },
  }, r, { db: async () => { touched = true; return { ok: true }; } });
  assert.equal(r.statusCode, 501);
  assert.match(r.json().error, /intentionally disabled/i);
  assert.equal(touched, false);
});
