import assert from 'node:assert/strict';
import test from 'node:test';
import { defineEndpoint } from '../api/_lib/endpoint.js';

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

test('overrides beyond db are forwarded onto ctx', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  const handler = defineEndpoint({ method: 'POST', auth: 'none' }, async (ctx) => ({ got: ctx.marker }));
  const r = res();
  await handler({ method: 'POST', headers: {}, url: '/x' }, r, { marker: 'hello', db: async () => ({ ok: true }) });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { got: 'hello' });
});
