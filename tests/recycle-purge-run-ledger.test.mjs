// The nightly recycle-bin purge writes down that it ran.
//
// Until the 2026-09-17 audit it wrote nothing: maintenance_job_runs was pinned to one job by a
// CHECK, so a stopped purge and a quiet one looked identical from the database -- and this is the
// job that deletes files and rows for good.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import handler from '../api/recycle-bin-purge.js';

const originalEnv = { ...process.env };
test.beforeEach(() => {
  process.env = {
    ...originalEnv,
    CRON_SECRET: 'cron-secret',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  };
});
test.afterEach(() => { process.env = { ...originalEnv }; });

const req = () => ({ method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
const res = () => ({
  statusCode: 0,
  payload: null,
  setHeader() {},
  status(code) { this.statusCode = code; return this; },
  json(value) { this.payload = value; return this; },
});

/**
 * A database that answers the purge.
 *
 * `expired` are the bin rows it finds, `storageFails` the paths whose file refuses to go,
 * `ledgerStartFails` refuses to record the run at all, and `purgeThrows` breaks the work itself.
 */
function makeClient({ expired = [], storageFails = [], ledgerStartFails = false, purgeThrows = false } = {}) {
  const runs = [];
  const rpcs = [];
  const client = {
    from(table) {
      if (table === 'maintenance_job_runs') {
        return {
          insert(row) {
            runs.push({ ...row });
            return { select: () => ({ single: async () => (ledgerStartFails
              ? { error: new Error('no'), data: null }
              : { error: null, data: { id: 'run-1' } }) }) };
          },
          update(patch) {
            return { eq: async (column, value) => { runs.push({ finished: true, id: value, column, ...patch }); return { error: null }; } };
          },
        };
      }
      if (table === 'recycle_bin_items') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ lt: () => ({ order: () => ({
            limit: async () => (purgeThrows ? { error: new Error('down'), data: null } : { error: null, data: expired }),
          }) }) }) }) }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
    rpc: async (name, args) => {
      rpcs.push({ name, args });
      if (name === 'recycle_permanently_delete_item') return { error: null, data: null };
      return { error: null, data: 0 };
    },
    storage: {
      from: () => ({ remove: async (paths) => (paths.some((p) => storageFails.includes(p))
        ? { error: new Error('storage said no') }
        : { error: null }) }),
    },
  };
  return { client, runs, rpcs, started: () => runs.find((r) => r.status === 'started'), finished: () => runs.find((r) => r.finished) };
}

test('a clean run is written down as a success, with what it selected and removed', async () => {
  const { client, started, finished, rpcs } = makeClient({
    expired: [{ id: 'a', snapshot: { object_path: 'one.pdf' } }, { id: 'b', snapshot: { object_path: 'two.pdf' } }],
  });
  const r = res();
  await handler(req(), r, { client });
  assert.equal(r.statusCode, 200);

  assert.equal(started()?.job, 'recycle_bin_purge', 'the run is recorded under its own job name');
  assert.equal(started()?.stage, 'started');
  const done = finished();
  assert.equal(done.status, 'success');
  assert.equal(done.selected_count, 2);
  assert.equal(done.deleted_count, 2);
  assert.equal(done.stage, 'completed');
  assert.equal(done.error_code, null);
  assert.ok(done.finished_at, 'and when it ended');

  // Bounded before it accepts work, so the evidence cannot grow without limit.
  assert.equal(rpcs[0].name, 'purge_maintenance_job_runs');
  assert.equal(rpcs[0].args.p_older_than_days, 90);
});

test('a file that refuses to go is a partial run, not a silent success', async () => {
  const { client, finished } = makeClient({
    expired: [{ id: 'a', snapshot: { object_path: 'keeps.pdf' } }, { id: 'b', snapshot: { object_path: 'goes.pdf' } }],
    storageFails: ['keeps.pdf'],
  });
  const r = res();
  await handler(req(), r, { client });
  assert.equal(r.statusCode, 207);
  const done = finished();
  assert.equal(done.status, 'partial');
  assert.equal(done.selected_count, 2);
  assert.equal(done.deleted_count, 1);
  assert.equal(done.error_code, 'storage_remove_incomplete');
});

test('a run that breaks mid-way is closed as failed rather than left open', async () => {
  // An open 'started' row with no end is indistinguishable from a run still going. The night is
  // already lost; the record of it should not be.
  const { client, finished } = makeClient({ purgeThrows: true });
  const r = res();
  await handler(req(), r, { client });
  assert.equal(r.statusCode, 500);
  const done = finished();
  assert.equal(done.status, 'failed');
  assert.equal(done.stage, 'unexpected');
  assert.equal(done.error_code, 'unexpected_failure');
});

test('with nowhere to record the run, nothing is deleted', async () => {
  // Fail closed: deleting people's files with no record that it happened is the one outcome worth
  // refusing the whole run over.
  const { client, rpcs } = makeClient({ ledgerStartFails: true, expired: [{ id: 'a', snapshot: {} }] });
  const r = res();
  await handler(req(), r, { client });
  assert.equal(r.statusCode, 500);
  assert.ok(!rpcs.some((call) => call.name === 'recycle_permanently_delete_item'), 'nothing was purged');
  assert.ok(!rpcs.some((call) => call.name === 'purge_expired_recycle_bin'), 'nor swept');
});

test('an unauthenticated call records nothing at all', async () => {
  const { client, runs } = makeClient();
  const r = res();
  await handler({ method: 'GET', headers: {} }, r, { client });
  assert.equal(r.statusCode, 401);
  assert.equal(runs.length, 0);
});

test('the ledger accepts this job, and retention no longer names only the other one', () => {
  const migration = readFileSync(new URL('../supabase/migrations/20260917223000_maintenance_ledger_covers_the_recycle_purge.sql', import.meta.url), 'utf8');
  assert.match(migration, /check \(job in \('form_upload_purge', 'recycle_bin_purge'\)\)/);
  assert.ok(!/where job = 'form_upload_purge'/.test(migration), 'retention prunes whatever the ledger holds');
  // The RingCentral sync is deliberately absent: it already stamps last_sync_at per company, and
  // at a run every fifteen minutes it would be 96 rows a day of evidence that exists elsewhere.
  assert.ok(!migration.includes("'ringcentral_sync'"));
  assert.match(migration, /RingCentral sync is deliberately NOT added/);
});
