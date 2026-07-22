import assert from 'node:assert/strict';
import test from 'node:test';
import { toE164 } from '../api/_lib/phone.js';

test('toE164 normalizes US phone formats', () => {
  assert.equal(toE164('928-231-0147'), '+19282310147');
  assert.equal(toE164('(602) 750-5678'), '+16027505678');
  assert.equal(toE164('16027505678'), '+16027505678');
  assert.equal(toE164('+1 855 594 5081'), '+18555945081');
});

test('toE164 returns null for empty or invalid input', () => {
  assert.equal(toE164(''), null);
  assert.equal(toE164(null), null);
  assert.equal(toE164('123'), null);
  assert.equal(toE164('not a phone'), null);
});

test('toE164 passes through valid international + numbers', () => {
  assert.equal(toE164('+639171234567'), '+639171234567');
});
