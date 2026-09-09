import assert from 'node:assert/strict';
import test from 'node:test';
import handler, { runFormUploadPurge } from '../api/form-upload-purge.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

function makeClient({ candidates = [], candidateError = null, expiredError = null, storage = {}, intentError = null } = {}) {
  const calls = { expired: 0, storage: [], intentCleanup: [] };
  let intentDeleteCount = 0;
  const client = {
    from(table) {
      assert.equal(table, 'form_upload_intents');
      intentDeleteCount += 1;
      return {
        delete() {
          const filters = [];
          return {
            is(column, value) { filters.push(['is', column, value]); return this; },
            lt: async (column, value) => {
              filters.push(['lt', column, value]);
              calls.expired += 1;
              return { error: expiredError };
            },
            in: async (column, values) => {
              filters.push(['in', column, values]);
              calls.intentCleanup.push({ filters });
              return { error: intentError };
            },
          };
        },
      };
    },
    rpc: async (name) => {
      assert.equal(name, 'abandoned_form_uploads');
      return { data: candidates, error: candidateError };
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'quest-form-response-files');
        return {
          remove: async (paths) => {
            calls.storage.push(paths);
            return {
              data: storage.data ?? paths.map((name) => ({ name })),
              error: storage.error ?? null,
            };
          },
        };
      },
    },
  };
  return { client, calls, getIntentDeleteCount: () => intentDeleteCount };
}

const clock = () => new Date('2026-09-10T00:00:00.000Z');

test('cleans only unclaimed abandoned candidates and records exact confirmed paths', async () => {
  const old = 'company-a/form-a/question-a/orphan.pdf';
  const other = 'company-b/form-b/question-b/orphan.png';
  const claimed = 'company-a/form-a/question-a/submitted.pdf';
  const { client, calls } = makeClient({
    candidates: [
      { object_path: old },
      { object_path: claimed, claimed_at: '2026-09-09T00:00:00.000Z' },
      { object_path: other },
      { object_path: old },
      { object_path: '   ' },
    ],
  });

  const result = await runFormUploadPurge(client, { now: clock });
  assert.deepEqual(result, { status: 'success', selected: 2, deleted: 2, stage: 'completed', errorCode: null });
  assert.deepEqual(calls.storage, [[old, other]], 'claimed uploads never reach Storage removal');
  assert.deepEqual(calls.intentCleanup[0].filters, [
    ['is', 'claimed_at', null],
    ['in', 'object_path', [old, other]],
  ], 'only Storage-confirmed paths get intent cleanup');
});

test('fails cleanly when the abandoned candidate query is refused', async () => {
  const { client, calls } = makeClient({ candidateError: new Error('service role required') });
  await assert.rejects(
    runFormUploadPurge(client, { now: clock }),
    (error) => error.stage === 'candidate_query' && error.errorCode === 'candidate_query_failed',
  );
  assert.deepEqual(calls.storage, []);
  assert.deepEqual(calls.intentCleanup, []);
});

test('fails cleanly on a Storage API error without deleting intent evidence', async () => {
  const path = 'company-a/form-a/question-a/orphan.pdf';
  const { client, calls } = makeClient({
    candidates: [{ object_path: path }],
    storage: { error: new Error('storage unavailable') },
  });
  await assert.rejects(
    runFormUploadPurge(client, { now: clock }),
    (error) => error.stage === 'storage_remove' && error.selected === 1,
  );
  assert.deepEqual(calls.storage, [[path]]);
  assert.deepEqual(calls.intentCleanup, []);
});

test('treats a basename-only Storage response as partial and never guesses its path', async () => {
  const full = 'company-a/form-a/question-a/confirmed.pdf';
  const basenameOnly = 'unmatchable.pdf';
  const { client, calls } = makeClient({
    candidates: [{ object_path: full }, { object_path: `company-a/form-a/question-a/${basenameOnly}` }],
    storage: { data: [{ name: full }, { name: basenameOnly }] },
  });
  const result = await runFormUploadPurge(client, { now: clock });
  assert.deepEqual(result, {
    status: 'partial', selected: 2, deleted: 1,
    stage: 'storage_confirmation', errorCode: 'unmatched_storage_response',
  });
  assert.deepEqual(calls.intentCleanup[0].filters.at(-1), ['in', 'object_path', [full]]);
});

test('treats a partial Storage success as partial and clears only returned full paths', async () => {
  const first = 'company-a/form-a/question-a/one.pdf';
  const second = 'company-a/form-a/question-a/two.pdf';
  const { client, calls } = makeClient({
    candidates: [{ object_path: first }, { object_path: second }],
    storage: { data: [{ name: first }] },
  });
  const result = await runFormUploadPurge(client, { now: clock });
  assert.equal(result.status, 'partial');
  assert.equal(result.errorCode, 'storage_remove_incomplete');
  assert.deepEqual(calls.intentCleanup[0].filters.at(-1), ['in', 'object_path', [first]]);
});

test('does not call Storage or follow-up intent cleanup when there are no candidates', async () => {
  const { client, calls } = makeClient();
  const result = await runFormUploadPurge(client, { now: clock });
  assert.deepEqual(result, { status: 'success', selected: 0, deleted: 0, stage: 'completed', errorCode: null });
  assert.deepEqual(calls.storage, []);
  assert.deepEqual(calls.intentCleanup, []);
});

test('the HTTP handler refuses an unauthenticated request before any cleanup client is created', async () => {
  process.env.CRON_SECRET = 'cron-secret';
  const response = {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return body; },
  };
  await handler({ method: 'GET', headers: {} }, response, {
    client: { from() { throw new Error('must not be called'); } },
  });
  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { error: 'Unauthorized.' });
});

test('the cron handler writes started and completed evidence around a no-candidate run', async () => {
  process.env.CRON_SECRET = 'cron-secret';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  const evidence = { started: null, finished: null };
  const client = {
    rpc: async (name) => {
      if (name === 'purge_maintenance_job_runs') return { data: 0, error: null };
      assert.equal(name, 'abandoned_form_uploads');
      return { data: [], error: null };
    },
    from(table) {
      if (table === 'maintenance_job_runs') {
        return {
          insert(row) {
            evidence.started = row;
            return { select: () => ({ single: async () => ({ data: { id: 'run-1' }, error: null }) }) };
          },
          update(row) {
            evidence.finished = row;
            return { eq: async () => ({ error: null }) };
          },
        };
      }
      assert.equal(table, 'form_upload_intents');
      return {
        delete() {
          return {
            is() { return this; },
            lt: async () => ({ error: null }),
          };
        },
      };
    },
  };
  const response = {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return body; },
  };
  await handler({ method: 'GET', headers: { authorization: 'Bearer cron-secret' } }, response, { client, now: clock });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { removed_uploads: 0, selected_uploads: 0, status: 'success' });
  assert.deepEqual(evidence.started, {
    job: 'form_upload_purge', started_at: '2026-09-10T00:00:00.000Z', status: 'started',
    selected_count: 0, deleted_count: 0, stage: 'started', error_code: null,
  });
  assert.deepEqual(evidence.finished, {
    finished_at: '2026-09-10T00:00:00.000Z', status: 'success',
    selected_count: 0, deleted_count: 0, stage: 'completed', error_code: null,
  });
});

test('the cron handler records a sanitized failure when expired intent cleanup is refused', async () => {
  process.env.CRON_SECRET = 'cron-secret';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  let finished;
  const client = {
    rpc: async (name) => {
      assert.equal(name, 'purge_maintenance_job_runs');
      return { data: 0, error: null };
    },
    from(table) {
      if (table === 'maintenance_job_runs') {
        return {
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'run-1' }, error: null }) }) }),
          update(row) { finished = row; return { eq: async () => ({ error: null }) }; },
        };
      }
      assert.equal(table, 'form_upload_intents');
      return {
        delete() {
          return {
            is() { return this; },
            lt: async () => ({ error: new Error('database detail must not enter ledger') }),
          };
        },
      };
    },
  };
  const response = {
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return body; },
  };
  await handler({ method: 'GET', headers: { authorization: 'Bearer cron-secret' } }, response, { client, now: clock });
  assert.equal(response.statusCode, 500);
  assert.deepEqual(finished, {
    finished_at: '2026-09-10T00:00:00.000Z', status: 'failed',
    selected_count: 0, deleted_count: 0, stage: 'expired_intents', error_code: 'expired_intent_cleanup_failed',
  });
});
