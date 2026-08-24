import assert from 'node:assert/strict';
import test from 'node:test';

import { loadInitialDataQueries, safeInitialDataQuery } from '../src/data/initial-data-queries.js';

function queryClient() {
  const started = [];
  const chain = (name) => {
    started.push(name);
    const result = { data: [name], error: null };
    const builder = {
      select: () => builder,
      order: () => builder,
      is: () => builder,
      limit: () => builder,
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  };
  return {
    started,
    from: (table) => chain(table),
    rpc: (name) => chain(`rpc:${name}`),
  };
}

test('every independent first-paint query starts in the same batch', async () => {
  const client = queryClient();
  const pending = loadInitialDataQueries(client, (query) => Promise.resolve(query));

  assert.ok(client.started.length >= 35, 'the complete initial query plan should start before the first result settles');
  assert.ok(client.started.includes('automations'), 'Automations must not wait for the initial batch to finish');
  assert.ok(client.started.includes('company_active_timers'));
  assert.ok(client.started.includes('workspace_builder_state'));

  const results = await pending;
  assert.deepEqual(results.automationsResult, { data: ['automations'], error: null });
  assert.deepEqual(results.companiesResult, { data: ['companies'], error: null });
  assert.deepEqual(results.platformAdminResult, { data: ['rpc:is_platform_admin'], error: null });
});

test('one stalled initial query cannot hold the workspace loader indefinitely', async () => {
  const started = Date.now();
  const result = await safeInitialDataQuery(new Promise(() => {}), { timeoutMs: 20 });

  assert.match(result.error?.message || '', /timed out/i);
  assert.ok(Date.now() - started < 500, 'the timeout should settle promptly');
});
