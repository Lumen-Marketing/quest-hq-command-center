import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const api = readFileSync(new URL('../api/recycle-bin-purge.js', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('recycle purge cron is authenticated and removes file objects before database rows', () => {
  assert.match(api, /CRON_SECRET/);
  assert.match(api, /quest-job-files/);
  assert.match(api, /storage\.from\(JOB_FILE_BUCKET\)\.remove/);
  assert.match(api, /recycle_permanently_delete_item/);
  assert.match(api, /purge_expired_recycle_bin/);
});

test('Vercel invokes recycle purge on a daily schedule', () => {
  assert.ok(vercel.crons?.some((job) => job.path === '/api/recycle-bin-purge' && job.schedule === '20 3 * * *'));
});
