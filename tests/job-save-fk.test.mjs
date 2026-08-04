import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

// jobs.account_id, contact_id, deal_id and site_id are TEXT columns with foreign keys, not
// uuid. Postgres therefore accepts '' as a value and reads it as a link to a row whose id is
// the empty string -- so a job saved without a client failed on jobs_account_id_fkey rather
// than being stored with no account. Every write has to go through jobSupabaseRow, which is
// where those four are turned into null.

test('jobSupabaseRow nulls every link column, not just some', () => {
  const body = fn('jobSupabaseRow');
  // The two date columns are here for the same reason as the ids: '' is not a valid date,
  // and a job left unscheduled would fail the write rather than save with no dates.
  assert.match(body, /emptyToNull\(supabaseRow\(job, JOB_COLS\), \['account_id', 'contact_id', 'deal_id', 'site_id', 'starts_on', 'ends_on'\]\)/);
});

test('saveJob writes the prepared row, never the raw payload', () => {
  // This is the bug: insert(payload) sent account_id: '' straight to Postgres.
  const body = fn('saveJob');
  assert.match(body, /const row = jobSupabaseRow\(payload\);/);
  assert.match(body, /client\.from\('jobs'\)\.update\(row\)/);
  assert.match(body, /client\.from\('jobs'\)\.insert\(row\)/);
  assert.ok(!/\.insert\(payload\)/.test(body), 'raw payload must not reach the table');
  assert.ok(!/\.update\(payload\)/.test(body), 'raw payload must not reach the table');
});

test('a new job really does start with empty link ids', () => {
  // If normalizeJob defaulted these to null instead, the bug would not exist -- but '' is
  // what the rest of the app compares against, so the conversion belongs at the boundary.
  const body = fn('normalizeJob');
  for (const key of ['account_id', 'contact_id', 'deal_id', 'site_id']) {
    assert.match(body, new RegExp(`${key}: input\\.${key} \\? String\\(input\\.${key}\\) : ''`));
  }
});

test('no path writes to jobs without going through jobSupabaseRow', () => {
  const writes = [...main.matchAll(/from\('jobs'\)\.(insert|update|upsert)\(([^)]*)\)/g)];
  assert.ok(writes.length, 'expected to find job writes');
  for (const [, verb, arg] of writes) {
    assert.equal(arg.trim(), 'row', `from('jobs').${verb}(${arg}) should write a jobSupabaseRow result`);
  }
  // The two other job writers, for completeness.
  assert.match(fn('persistJob'), /supabaseWrite\('jobs', jobSupabaseRow\(payload\)\)/);
  assert.match(main, /p_job: jobSupabaseRow\(job\)/);
});
