import assert from 'node:assert/strict';
import test from 'node:test';
import { sendSms } from '../api/_lib/smsblast.js';

test('sendSms posts form-encoded params to SMSblast', async () => {
  let captured;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, status: 200, async text() { return JSON.stringify({ id: 'msg_1' }); } };
  };
  const result = await sendSms({ apiKey: 'k', from: '+18555945081', to: '+19282310147', message: 'hi' }, fakeFetch);
  assert.equal(captured.url, 'https://app.smsblast.io/api/v2/sms/send');
  assert.equal(captured.opts.method, 'POST');
  const params = new URLSearchParams(captured.opts.body);
  assert.equal(params.get('apiKey'), 'k');
  assert.equal(params.get('from'), '+18555945081');
  assert.equal(params.get('to'), '+19282310147');
  assert.equal(params.get('message'), 'hi');
  assert.deepEqual(result, { ok: true, status: 200, data: { id: 'msg_1' } });
});

test('sendSms surfaces non-JSON error bodies', async () => {
  const fakeFetch = async () => ({ ok: false, status: 402, async text() { return 'Insufficient balance'; } });
  const result = await sendSms({ apiKey: 'k', from: 'f', to: 't', message: 'm' }, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.status, 402);
  assert.deepEqual(result.data, { raw: 'Insufficient balance' });
});
