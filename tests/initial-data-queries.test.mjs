import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadInitialDataQueries,
  safeInitialDataQuery,
  summarizeInitialDataFailures,
} from '../src/data/initial-data-queries.js';

function queryClient() {
  const started = [];
  const selected = {};
  const chain = (name) => {
    started.push(name);
    const result = { data: [name], error: null };
    const builder = {
      select: (columns = '*') => {
        selected[name] = columns;
        return builder;
      },
      order: () => builder,
      is: () => builder,
      limit: () => builder,
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  };
  return {
    started,
    selected,
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

test('startup requests carry human-readable timing labels', async () => {
  const client = queryClient();
  const labels = [];
  await loadInitialDataQueries(client, (query, options) => {
    labels.push(options?.label);
    return Promise.resolve(query);
  });
  assert.ok(labels.includes('Companies'));
  assert.ok(labels.includes('Workspace builder'));
  assert.ok(labels.every(Boolean));
});

test('one stalled initial query cannot hold the workspace loader indefinitely', async () => {
  const started = Date.now();
  const result = await safeInitialDataQuery(new Promise(() => {}), { timeoutMs: 20 });

  assert.match(result.error?.message || '', /timed out/i);
  assert.ok(Date.now() - started < 500, 'the timeout should settle promptly');
});

test('timing out an initial query aborts the network request behind it', async () => {
  let signal = null;
  const query = {
    abortSignal(nextSignal) {
      signal = nextSignal;
      return this;
    },
    then() {
      return new Promise(() => {});
    },
  };

  const result = await safeInitialDataQuery(query, { timeoutMs: 20 });

  assert.match(result.error?.message || '', /timed out/i);
  assert.ok(signal, 'the Supabase builder should receive an AbortSignal');
  assert.equal(signal.aborted, true, 'the request should be cancelled when the deadline is reached');
});

test('workspace backup startup query loads metadata without every saved payload', async () => {
  const client = queryClient();

  await loadInitialDataQueries(client, (query) => Promise.resolve(query));

  assert.notEqual(client.selected.workspace_backups, '*');
  assert.doesNotMatch(client.selected.workspace_backups, /\bpayload\b/);
  assert.match(client.selected.workspace_backups, /\bsize_bytes\b/);
  assert.match(client.selected.workspace_backups, /\brecord_counts\b/);
});

test('partial startup failures are summarized for the workspace shell', () => {
  const failures = summarizeInitialDataFailures({
    companiesResult: { data: [], error: null },
    tasksResult: { data: null, error: new Error('offline') },
    workspaceBackupsResult: { data: null, error: new Error('timeout') },
  });

  assert.deepEqual(failures, ['Tasks', 'Workspace backups']);
});
