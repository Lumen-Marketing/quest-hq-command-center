import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRealtimeBatcher,
  realtimeDomainForTable,
  realtimeSubscriptions,
  shouldAcceptRealtimePayload,
  shouldDeferRealtimeRefresh,
} from '../src/data/realtime-policy.js';

test('tables invalidate only their owning data domain', () => {
  assert.equal(realtimeDomainForTable('jobs'), 'operations');
  assert.equal(realtimeDomainForTable('contacts'), 'crm');
  assert.equal(realtimeDomainForTable('pricebook_vendor_prices'), 'pricebook');
  assert.equal(realtimeDomainForTable('messages'), 'messages');
  assert.equal(realtimeDomainForTable('unknown_table'), '');
});

test('subscriptions use explicit tables and company filters where supported', () => {
  const subscriptions = realtimeSubscriptions(['roofing', 'lumen']);
  assert.ok(subscriptions.some((item) => item.table === 'jobs' && item.filter === 'company_id=eq.roofing'));
  assert.ok(subscriptions.some((item) => item.table === 'jobs' && item.filter === 'company_id=eq.lumen'));
  assert.ok(subscriptions.some((item) => item.table === 'profiles' && !item.filter));
  assert.ok(!subscriptions.some((item) => !item.table));
});

test('payload filtering rejects rows outside the signed-in companies', () => {
  assert.equal(shouldAcceptRealtimePayload({ table: 'tasks', new: { company_id: 'roofing' } }, ['roofing']), true);
  assert.equal(shouldAcceptRealtimePayload({ table: 'tasks', new: { company_id: 'other' } }, ['roofing']), false);
  assert.equal(shouldAcceptRealtimePayload({ table: 'messages', new: { company_id: 'roofing' } }, ['roofing']), false);
});

test('modal and editing state defer realtime refreshes', () => {
  assert.equal(shouldDeferRealtimeRefresh({ editableFocused: true }), true);
  assert.equal(shouldDeferRealtimeRefresh({ modal: 'profile' }), true);
  assert.equal(shouldDeferRealtimeRefresh({ dataLoading: true }), true);
  assert.equal(shouldDeferRealtimeRefresh({}), false);
});

test('batcher coalesces burst domains into one flush', () => {
  let scheduled;
  const calls = [];
  const batcher = createRealtimeBatcher({
    onFlush: (domains) => calls.push(domains),
    schedule: (fn) => { scheduled = fn; return 1; },
    cancel: () => {},
  });
  batcher.push('crm');
  batcher.push('operations');
  batcher.push('crm');
  scheduled();
  assert.deepEqual(calls, [['crm', 'operations']]);
});
