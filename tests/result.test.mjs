import assert from 'node:assert/strict';
import test from 'node:test';

import { requireOk, resultError, settleObserved } from '../src/lib/result.js';

test('resultError recognizes returned Supabase errors', () => {
  const error = { message: 'row rejected', code: '42501' };
  assert.equal(resultError({ data: null, error }), error);
  assert.equal(resultError({ data: { id: 1 }, error: null }), null);
});

test('requireOk throws returned errors before optimistic state can commit', () => {
  const error = { message: 'write failed', code: '23505' };
  assert.throws(() => requireOk({ error }, 'Save failed'), /write failed/);
  assert.deepEqual(requireOk({ data: { id: 1 }, error: null }), { id: 1 });
});

test('settleObserved reports both rejected promises and returned errors', async () => {
  const observed = [];
  await settleObserved(Promise.resolve({ error: { message: 'returned failure' } }), (error) => observed.push(error.message));
  await settleObserved(Promise.reject(new Error('thrown failure')), (error) => observed.push(error.message));
  assert.deepEqual(observed, ['returned failure', 'thrown failure']);
});
