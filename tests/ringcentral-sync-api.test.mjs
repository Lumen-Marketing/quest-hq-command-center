import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSyncWindow } from '../api/ringcentral-sync.js';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../api/ringcentral-sync.js', import.meta.url), 'utf8');

const NOW = new Date('2026-07-23T12:00:00.000Z');

test('a company that has never synced gets the ninety day backfill', () => {
  const window = buildSyncWindow({ backfilled_through: null }, NOW);
  assert.equal(window.isBackfill, true);
  assert.equal(window.dateTo, '2026-07-23T12:00:00.000Z');
  assert.equal(window.dateFrom, '2026-04-24T12:00:00.000Z');
});

test('a company that has synced gets the short rolling window', () => {
  const window = buildSyncWindow({ backfilled_through: '2026-07-01T00:00:00.000Z' }, NOW);
  assert.equal(window.isBackfill, false);
  assert.equal(window.dateFrom, '2026-07-20T12:00:00.000Z', 'three days back');
  assert.equal(window.dateTo, '2026-07-23T12:00:00.000Z');
});

test('the rolling window overlaps itself so a missed run is covered by the next', () => {
  const window = buildSyncWindow({ backfilled_through: '2026-07-01T00:00:00.000Z' }, NOW);
  const spanHours = (new Date(window.dateTo) - new Date(window.dateFrom)) / 3_600_000;
  assert.ok(spanHours >= 72, `window is ${spanHours}h, must be at least 72h to tolerate missed runs`);
});

test('a missing state row is treated as a first sync rather than crashing', () => {
  const window = buildSyncWindow(null, NOW);
  assert.equal(window.isBackfill, true);
});

test('the endpoint is cron authenticated and refuses anything but GET', () => {
  assert.match(source, /CRON_SECRET/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /request\.method !== 'GET'/);
  assert.match(source, /status\(401\)/);
});

test('the endpoint uses the service role key and never a VITE variable for secrets', () => {
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /VITE_RINGCENTRAL/);
});

test('calls are upserted on the company and call id pair', () => {
  assert.match(source, /onConflict: 'company_id,call_id'/);
});

test('one failing company does not abort the others', () => {
  assert.match(source, /catch \(error\)/);
  assert.match(source, /recordFailure/);
});

test('Vercel runs the sync on a schedule', () => {
  const job = vercel.crons?.find((entry) => entry.path === '/api/ringcentral-sync');
  assert.ok(job, 'no cron entry for /api/ringcentral-sync');
  assert.equal(typeof job.schedule, 'string');
  assert.ok(job.schedule.length > 0);
});

test('the existing recycle purge cron survives the change', () => {
  assert.ok(vercel.crons?.some((entry) => entry.path === '/api/recycle-bin-purge' && entry.schedule === '20 3 * * *'));
});
