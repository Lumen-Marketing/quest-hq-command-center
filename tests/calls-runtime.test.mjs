import assert from 'node:assert/strict';
import test from 'node:test';

import { createCallsRuntime } from '../src/ops/calls-runtime.js';

function harness({ token = '' } = {}) {
  const state = {
    route: { section: 'dashboard' },
    callsStats: { key: '', rows: [], sync: null, unavailable: false },
    callsPresence: { agents: [], error: '', forbidden: false, notConnected: false },
  };
  const events = { fetches: 0, renders: 0, intervals: 0, clearedIntervals: 0 };
  const runtime = createCallsRuntime({
    activeCompanyId: () => 'company-a',
    activeSession: () => ({ access_token: token }),
    createSupabaseClient: () => null,
    documentRef: { hidden: false, addEventListener() {} },
    emptyState: (message) => `<div>${message}</div>`,
    fetchImpl: async () => { events.fetches += 1; throw new Error('unexpected fetch'); },
    h: String,
    queueMicrotaskImpl: (callback) => callback(),
    render: () => { events.renders += 1; },
    setIntervalImpl: () => { events.intervals += 1; return 1; },
    clearIntervalImpl() { events.clearedIntervals += 1; },
    state,
  });
  return { events, runtime, state };
}

test('a session without an access token becomes not connected instead of loading forever', async () => {
  const { events, runtime, state } = harness();
  await runtime.loadCallsPresence('company-a');

  assert.equal(events.fetches, 0);
  assert.equal(events.renders, 1);
  assert.equal(state.callsPresence.notConnected, true);
  assert.match(runtime.callsBoardMarkup(), /Not connected to RingCentral yet/);
});

test('a terminal not-connected response releases the presence polling interval', async () => {
  const { events, runtime, state } = harness();
  runtime.ensureCallsPresencePolling('company-a');
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(state.callsPresence.notConnected, true);
  assert.equal(events.intervals, 1);
  assert.equal(events.clearedIntervals, 1);
});

test('the custom date key covers both complete calendar days', () => {
  const { runtime } = harness();
  const bounds = runtime.callsRangeBounds('custom:2026-08-01|2026-08-03');
  assert.equal(bounds.from, new Date('2026-08-01T00:00:00').toISOString());
  assert.equal(bounds.to, new Date('2026-08-03T23:59:59.999').toISOString());
});

test('the runtime exposes the page and widget ranges from the lazy module', () => {
  const { runtime } = harness();
  assert.deepEqual(runtime.CALLS_RANGE_OPTIONS.map(([id]) => id), ['today', '7d', '30d']);
  assert.deepEqual(runtime.CALLS_WIDGET_RANGE_OPTIONS.map(([id]) => id), ['today', '7d', '30d', 'custom']);
  assert.equal(runtime.isWidgetRange('30d'), true);
  assert.equal(runtime.isWidgetRange('bogus'), false);
});
