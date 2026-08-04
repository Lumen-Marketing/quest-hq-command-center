import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CO_STEPS, bucketProgress, coStepIndex, dailyStreak, daysWorked, drawTotals, isStruggling,
  missedDaily,
  previousDay, normalizeChangeOrder, normalizeDaily, normalizeDraw, projectedNet, sortDailies,
  stalledChangeOrders, ticketWithChangeOrders,
} from '../src/jobs/production-model.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const daily = (report_date, production, extra = {}) => normalizeDaily({
  id: `${report_date}-${production}`, job_id: 'j1', report_date, production, crew_label: 'A', ...extra,
});

// --- normalizing ---------------------------------------------------------------------------

test('an unanswered question stays unanswered', () => {
  // null and false are different: nobody asked, versus they said no. Only the second is worth
  // chasing, so collapsing them to a boolean would invent a problem.
  const untouched = normalizeDaily({ production: 'good' });
  assert.equal(untouched.site_cleaned, null);
  assert.equal(untouched.materials_ok, null);
  assert.equal(normalizeDaily({ production: 'good', site_cleaned: false }).site_cleaned, false);
});

test('a bad rating falls back rather than reaching the database', () => {
  // The column has a check constraint; sending junk would fail the write instead of the field.
  assert.equal(normalizeDaily({ production: 'excellent' }).production, 'good');
  assert.equal(normalizeDraw({ status: 'whatever' }).status, 'locked');
  assert.equal(normalizeChangeOrder({ step: 'nope' }).step, 'requested');
});

// --- the streak -----------------------------------------------------------------------------

test('the streak is by day, not by crew', () => {
  // Two crews on one job is one day of progress. Counting rows would show four dots for a
  // two-day job and make a struggling job look busy.
  const dailies = [
    daily('2026-08-01', 'good', { crew_label: 'A' }),
    daily('2026-08-01', 'rough', { crew_label: 'B' }),
    daily('2026-08-02', 'good', { crew_label: 'A' }),
  ];
  assert.deepEqual(dailyStreak(dailies), ['rough', 'good']);
  assert.equal(daysWorked(dailies), 2);
});

test('the worst crew of the day is the one that shows', () => {
  // A job that went badly for one crew did not have a good day.
  const dailies = [daily('2026-08-01', 'good', { crew_label: 'A' }), daily('2026-08-01', 'ok', { crew_label: 'B' })];
  assert.deepEqual(dailyStreak(dailies), ['ok']);
});

test('the streak is oldest first and capped', () => {
  const dailies = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05']
    .map((d, i) => daily(d, i === 0 ? 'rough' : 'good'));
  const streak = dailyStreak(dailies, 4);
  assert.equal(streak.length, 4);
  assert.ok(!streak.includes('rough'), 'the oldest day falls off the end');
});

test('two poor days in a row is the signal, one is not', () => {
  assert.equal(isStruggling([daily('2026-08-01', 'good'), daily('2026-08-02', 'rough')]), false);
  assert.equal(isStruggling([daily('2026-08-01', 'ok'), daily('2026-08-02', 'rough')]), true);
  assert.equal(isStruggling([daily('2026-08-01', 'rough')]), false, 'one day is not a run');
});

test('a job with no dailies at all is not reported as having missed one', () => {
  // It may not have started. Only a job that was reporting and then stopped is a flag.
  assert.equal(missedDaily([], '2026-08-05'), false);
  assert.equal(missedDaily([daily('2026-08-05', 'good')], '2026-08-05'), false);
});

test('the missing-daily line is measured against yesterday, not today', () => {
  // Today is not over. Measuring against today would flag every running job every morning
  // until its crew knocked off, which is an alarm nobody would keep reading.
  assert.equal(missedDaily([daily('2026-08-04', 'good')], '2026-08-05'), false, 'reported yesterday');
  assert.equal(missedDaily([daily('2026-08-03', 'good')], '2026-08-05'), true, 'skipped yesterday');
});

test('yesterday is computed across month and year boundaries', () => {
  assert.equal(previousDay('2026-08-01'), '2026-07-31');
  assert.equal(previousDay('2026-01-01'), '2025-12-31');
  assert.equal(previousDay('2028-03-01'), '2028-02-29', 'leap year');
  assert.equal(previousDay('not a date'), 'not a date', 'garbage in, no crash out');
});

test('dailies sort newest first', () => {
  const sorted = sortDailies([daily('2026-08-01', 'good'), daily('2026-08-03', 'good'), daily('2026-08-02', 'good')]);
  assert.deepEqual(sorted.map((d) => d.report_date), ['2026-08-03', '2026-08-02', '2026-08-01']);
});

// --- the money ---------------------------------------------------------------------------------

const bucket = (name, expected, spent, status) => ({ name, expected, spent, status });

test('an open bucket counts at whichever is higher, expected or spent', () => {
  // Taking expected alone lets an overspent bucket flatter the net until the day it closes,
  // which is the day it is too late to do anything about it.
  const net = projectedNet(20000, [bucket('Labor', 9000, 11000, 'open')]);
  assert.equal(net.projected, 11000);
  assert.equal(net.net, 9000);
});

test('a final bucket counts at what was actually spent', () => {
  const net = projectedNet(20000, [bucket('Hardware', 2000, 1500, 'final')]);
  assert.equal(net.projected, 1500, 'under budget and closed means the saving is real');
  assert.equal(net.net, 18500);
});

test('the net is only called firm when every bucket is closed', () => {
  const mixed = projectedNet(20000, [bucket('A', 100, 100, 'final'), bucket('B', 100, 0, 'open')]);
  assert.equal(mixed.firm, false);
  assert.equal(mixed.finals, 1);
  const all = projectedNet(20000, [bucket('A', 100, 100, 'final'), bucket('B', 100, 90, 'final')]);
  assert.equal(all.firm, true);
});

test('a job with no buckets does not divide by zero', () => {
  const net = projectedNet(0, []);
  assert.equal(net.margin, 0);
  assert.equal(net.firm, false, 'no buckets is not the same as every bucket closed');
});

test('spend with nothing budgeted is called out', () => {
  const { unbudgeted, pct } = bucketProgress({ expected: 0, spent: 480 });
  assert.equal(unbudgeted, true);
  assert.equal(pct, 100);
});

test('an overspent bucket reports over rather than a bar past 100%', () => {
  const { over, pct } = bucketProgress({ expected: 1000, spent: 1400 });
  assert.equal(over, true);
  assert.equal(pct, 100);
});

// --- draws and change orders ----------------------------------------------------------------------

test('only unlocked draws are billable right now', () => {
  const totals = drawTotals([
    normalizeDraw({ amount: 7500, status: 'paid' }),
    normalizeDraw({ amount: 10000, status: 'unlocked' }),
    normalizeDraw({ amount: 5000, status: 'locked' }),
  ]);
  assert.equal(totals.readyTotal, 10000);
  assert.equal(totals.paidTotal, 7500);
  assert.equal(totals.contract, 22500);
});

test('the change-order steps are in the order the work happens', () => {
  assert.deepEqual(CO_STEPS, ['requested', 'priced', 'sent', 'accepted', 'acknowledged']);
  assert.equal(coStepIndex('sent'), 2);
  assert.equal(coStepIndex('nonsense'), -1);
});

test('the stalled ones are those waiting on us, not on the client', () => {
  // Priced but not sent, and accepted but not acknowledged -- the second is the one that gets
  // built wrong because the crew never heard.
  const cos = CO_STEPS.map((step) => normalizeChangeOrder({ step, title: step }));
  assert.deepEqual(stalledChangeOrders(cos).map((c) => c.step), ['priced', 'accepted']);
});

test('accepted change orders raise what the job is worth', () => {
  const job = { estimate_total: 20000 };
  const cos = [
    normalizeChangeOrder({ price: 3590, step: 'accepted' }),
    normalizeChangeOrder({ price: 1000, step: 'sent' }),
  ];
  assert.equal(ticketWithChangeOrders(job, cos), 23590, 'a sent-but-unaccepted one is not money yet');
});

// --- wiring ------------------------------------------------------------------------------------

test('the records load on demand, not at bootstrap', () => {
  // Every daily for every job is the largest query the app could make, for its least-seen
  // screen. It waits until a job is opened.
  assert.match(main, /'labels', 'production'\]/);
  assert.match(main, /if \(domain === 'production'\) \{/);
  assert.match(main, /if \(!ensureDomainLoaded\('production'\)\) return questLoader\('Loading job'\)/);
});

test('the job file is fetched on use', () => {
  assert.ok(!/^import .*jobs\/job-file/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/jobs\/job-file\.js'\)/);
  assert.match(main, /jobFilePending = null;/, 'a failed fetch must be retryable');
});

test('a second daily for the same crew and day is an edit', () => {
  // The unique index makes it one; the client has to upsert or it would just fail.
  assert.match(main, /onConflict: 'job_id,report_date,crew_label'/);
});

test('every write checks jobs.manage first', () => {
  for (const fn of ['submitJobDaily', 'setCostBucketFinal', 'requestJobDraw', 'advanceChangeOrder']) {
    const at = main.indexOf(`function ${fn}(`);
    assert.notEqual(at, -1, `${fn} should exist`);
    const body = main.slice(at, main.indexOf('\n}\n', at));
    assert.match(body, /requirePermission\('jobs\.manage'/, `${fn} must be permission-checked`);
  }
});
