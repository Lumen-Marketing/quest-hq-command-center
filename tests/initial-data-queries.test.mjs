import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadInitialDataQueries,
  loadPaginatedDataQuery,
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
      range: () => builder,
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

test('paged lists cross the API row cap without duplicates or omissions', async () => {
  const source = Array.from({ length: 1205 }, (_, index) => ({ id: `row-${String(index).padStart(4, '0')}` }));
  const ranges = [];
  const makeQuery = () => {
    let result = [];
    return {
      range(from, to) {
        ranges.push([from, to]);
        result = source.slice(from, to + 1);
        return this;
      },
      then(resolve, reject) { return Promise.resolve({ data: result, error: null }).then(resolve, reject); },
    };
  };

  const result = await loadPaginatedDataQuery(makeQuery, (query) => Promise.resolve(query), { pageSize: 500, label: 'Contacts' });
  assert.equal(result.error, null);
  assert.equal(result.data.length, 1205);
  assert.deepEqual(result.data.map((row) => row.id), source.map((row) => row.id));
  assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]]);
});

test('paged lists preserve completed pages when a later page fails', async () => {
  let page = 0;
  const result = await loadPaginatedDataQuery(
    () => ({
      range() { return this; },
      then(resolve, reject) {
        page += 1;
        return Promise.resolve(page === 1
          ? { data: Array.from({ length: 2 }, (_, id) => ({ id })), error: null }
          : { data: null, error: new Error('offline') }).then(resolve, reject);
      },
    }),
    (query) => Promise.resolve(query),
    { pageSize: 2, label: 'Jobs' },
  );
  assert.equal(result.data.length, 2);
  assert.match(result.error.message, /offline/);
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
