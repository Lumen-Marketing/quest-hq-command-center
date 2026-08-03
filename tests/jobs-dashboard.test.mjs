import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVE_STAGES, activeJobs, dashboardTiles, daysSince, needsAttention, stageProgress,
} from '../src/jobs/dashboard-model.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const view = readFileSync(new URL('../src/jobs/dashboard-view.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const model = readFileSync(new URL('../src/jobs/dashboard-model.js', import.meta.url), 'utf8');

const NOW = Date.parse('2026-08-04T12:00:00.000Z');
const day = (n) => new Date(NOW - n * 86400000).toISOString();
const stageOf = (job) => job.stage;

const JOBS = [
  { id: '1', name: 'Villa Ct', stage: 'In production', owner_name: 'Alkeith', estimate_total: 12000, updated_at: day(0) },
  { id: '2', name: '209th Ave', stage: 'Scheduled', owner_name: '', estimate_total: 4000, updated_at: day(6) },
  { id: '3', name: 'Onyx Ave', stage: 'QC / punch list', owner_name: 'Crew B', estimate_total: 8000, updated_at: day(1) },
  { id: '4', name: '58th Pl', stage: 'Invoiced', owner_name: 'Alkeith', estimate_total: 10000, invoice_total: 10500, updated_at: day(2) },
  { id: '5', name: 'Old job', stage: 'Paid / closed', owner_name: 'Alkeith', estimate_total: 9000, updated_at: day(90) },
];

// --- what counts as live -------------------------------------------------------------------

test('live means scheduled through punch list, not lead and not finished', () => {
  const live = activeJobs(JOBS, stageOf).map((j) => j.name);
  assert.deepEqual(live, ['Villa Ct', '209th Ave', 'Onyx Ave']);
  // A closed or invoiced job is not "working now", however recently it was touched.
  assert.ok(!live.includes('Old job'));
  assert.ok(!live.includes('58th Pl'));
});

test('both capitalisations of the CRM2 stages are recognised', () => {
  // The two CRM plugins spell these differently ("Material ordered" vs "Material Ordered").
  // Missing one would silently drop those jobs off the dashboard.
  for (const s of ['Material ordered', 'Material Ordered', 'In production', 'In Production']) {
    assert.ok(ACTIVE_STAGES.includes(s), `${s} should count as live`);
  }
});

// --- attention flags --------------------------------------------------------------------------

test('a job that has gone quiet is flagged, worst first', () => {
  const flags = needsAttention(JOBS, stageOf, NOW);
  assert.deepEqual(flags.map((f) => f.job.name), ['209th Ave']);
  assert.equal(flags[0].idle, 6);
});

test('only live jobs can be flagged', () => {
  // A closed job untouched for 90 days is finished, not neglected.
  assert.ok(!needsAttention(JOBS, stageOf, NOW).some((f) => f.job.name === 'Old job'));
});

test('the staleness threshold is a parameter, not a constant', () => {
  // A roofing crew and an estimating desk do not go quiet at the same rate.
  // At one day: 209th (6 idle) and Onyx (1). Villa Ct was touched today, so it never counts.
  assert.deepEqual(needsAttention(JOBS, stageOf, NOW, 1).map((f) => f.job.name), ['209th Ave', 'Onyx Ave']);
  assert.equal(needsAttention(JOBS, stageOf, NOW, 30).length, 0);
});

test('a job with no or unreadable timestamp is not flagged', () => {
  // Better to say nothing than to accuse every legacy row of being neglected.
  const odd = [{ id: 'x', name: 'No date', stage: 'Scheduled', updated_at: '' },
    { id: 'y', name: 'Bad date', stage: 'Scheduled', updated_at: 'not a date' }];
  assert.deepEqual(needsAttention(odd, stageOf, NOW), []);
  assert.equal(daysSince('', NOW), null);
  assert.equal(daysSince('nonsense', NOW), null);
});

// --- the figures ------------------------------------------------------------------------------

test('the tiles report what they say they report', () => {
  const tiles = dashboardTiles(JOBS, stageOf, NOW);
  const by = Object.fromEntries(tiles.map((t) => [t.id, t]));
  assert.equal(by.working.value, '3 jobs');
  assert.equal(by.working.caption, '2 assigned · 1 unassigned');
  // Invoice total wins over estimate when both exist.
  assert.equal(by.billing.value, 10500);
  assert.equal(by.value.value, 24000, 'live estimates only, not the closed or invoiced ones');
  assert.equal(by.health.value, '1 flag');
});

test('an empty company reads as empty, not as broken', () => {
  const tiles = dashboardTiles([], stageOf, NOW);
  const by = Object.fromEntries(tiles.map((t) => [t.id, t]));
  assert.equal(by.working.value, '0 jobs');
  assert.equal(by.working.caption, 'nothing in production');
  assert.equal(by.health.caption, 'every live job is current');
  assert.equal(by.health.tone, 'good', 'no flags is good news, not a warning');
});

test('singular and plural are both handled', () => {
  const one = dashboardTiles([JOBS[0]], stageOf, NOW);
  assert.equal(one[0].value, '1 job');
  assert.match(one[1].caption, /0 jobs at invoicing/);
});

// --- progress dots -----------------------------------------------------------------------------

test('progress is the stage position, so the dots and the board agree', () => {
  const stages = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  assert.deepEqual(stageProgress('B', stages), { step: 2, total: 3 });
  assert.deepEqual(stageProgress('C', stages), { step: 3, total: 3 });
});

test('an unknown stage shows no progress rather than guessing', () => {
  assert.deepEqual(stageProgress('Deleted stage', [{ name: 'A' }, { name: 'B' }]), { step: 0, total: 2 });
});

// --- honesty about what does not exist ------------------------------------------------------

test('the model does not invent figures the data cannot support', () => {
  // There is no cost ledger, draw schedule or daily report table in this product. A tile
  // labelled "spent this week" would be a number with nothing behind it.
  for (const word of ['spend', 'spent', 'draw', 'changeOrder', 'change_order']) {
    assert.ok(!new RegExp(`\\b${word}\\b`, 'i').test(model.replace(/\/\/[^\n]*/g, '')),
      `the model refers to "${word}", which has no data behind it`);
  }
});

// --- wiring ---------------------------------------------------------------------------------

test('the dashboard is the default Jobs tab', () => {
  assert.match(main, /const JOB_TABS = \['dashboard', 'pipeline', 'list', 'profile'\];/);
  assert.match(main, /return JOB_TABS\.includes\(value\) \? value : 'dashboard';/);
});

test('it is fetched on use, not carried by every page', () => {
  assert.ok(!/^import .*jobs\/dashboard-view/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/jobs\/dashboard-view\.js'\)/);
  assert.match(main, /jobsDashboardPending = null;/, 'a failed fetch must be retryable');
});

test('the dashboard renders its own header instead of doubling the page title', () => {
  assert.match(main, /if \(tab === 'dashboard'\) \{\n\s*return `\$\{renderJobsDashboard\(companyId\)\}/);
  assert.match(view, /Jobs Dashboard<\/h1>/);
});

test('Add job is hidden from someone who cannot create one', () => {
  assert.match(view, /can\('jobs\.manage', companyId\) \? '<button[^']*data-action="open-job-form"/);
});

test('the stage colour comes from the pipeline, not a second palette', () => {
  assert.match(view, /pipelineStageColor\('jobs', stageOf\(job\), companyId\)/);
});
