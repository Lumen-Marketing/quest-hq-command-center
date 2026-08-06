import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVE_STAGES, activeJobs, dashboardTiles, daysSince, needsAttention, stageProgress,
} from '../src/jobs/dashboard-model.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const view = readFileSync(new URL('../src/jobs/dashboard-view.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const modelSrc = readFileSync(new URL('../src/jobs/dashboard-model.js', import.meta.url), 'utf8');

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

// Villa Ct reported yesterday. 209th last reported four days ago and so has missed one.
// Onyx has never reported at all, which is a different thing.
const TODAY = '2026-08-04';
const PRODUCTION = {
  1: {
    dailies: [{ report_date: '2026-08-03', production: 'good', crew_label: 'A' }],
    buckets: [{ spent: 3200, expected: 4000, status: 'open' }],
    draws: [{ id: 'd1', label: 'Completion', amount: 8400, status: 'unlocked' }],
  },
  2: {
    dailies: [{ report_date: '2026-07-31', production: 'ok', crew_label: 'Sub' }],
    buckets: [{ spent: 1400, expected: 1400, status: 'final' }],
    draws: [{ id: 'd2', label: 'Start', amount: 5000, status: 'paid' }],
  },
  3: { dailies: [], buckets: [], draws: [] },
};
const production = (id) => PRODUCTION[id] || { dailies: [], buckets: [], draws: [] };
const tilesNow = (jobs, prod = production) => Object.fromEntries(
  dashboardTiles(jobs, stageOf, prod, TODAY, NOW).map((t) => [t.id, t]),
);

test('the tiles report what they say they report', () => {
  const by = tilesNow(JOBS);
  assert.equal(by.working.value, '3 jobs');
  assert.equal(by.working.caption, '2 own crew · 1 unassigned');
  assert.equal(by.draws.value, 8400, 'only the unlocked draw');
  assert.equal(by.spend.value, 4600, 'spend on live jobs, from their buckets');
  assert.equal(by.health.value, '1 flag');
  assert.match(by.health.caption, /missing daily · 209th Ave/);
});

test('a sub crew is counted separately from our own', () => {
  // "Who is actually mine today" is the first thing this screen has to answer.
  const jobs = [{ ...JOBS[0], owner_name: 'Sub crew' }, { ...JOBS[1], owner_name: 'Alkeith' }];
  assert.equal(tilesNow(jobs).working.caption, '1 own crew · 1 sub');
});

test('an empty company reads as empty, not as broken', () => {
  const by = tilesNow([]);
  assert.equal(by.working.value, '0 jobs');
  assert.equal(by.working.caption, 'nothing in production');
  assert.equal(by.draws.caption, 'nothing unlocked');
  assert.equal(by.health.caption, 'every live job is current');
  assert.equal(by.health.tone, 'good', 'no flags is good news, not a warning');
});

test('singular and plural are both handled', () => {
  const by = tilesNow([JOBS[0]]);
  assert.equal(by.working.value, '1 job');
  assert.match(by.draws.caption, /1 draw unlocked/);
  assert.match(by.spend.caption, /across 1 live job\b/);
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

test('the spend tile is not labelled as a week', () => {
  // Dailies, buckets and draws are real tables now, so the model may cite them -- but spend
  // is a running total on a bucket with no date on it. There is no dated expense ledger to
  // take a week out of, so "spent this week" would be a wrong number in a confident font.
  const labels = [...model.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
  assert.ok(labels.includes('Spent to date'), 'the label must say what the figure is');
  for (const label of labels) {
    assert.doesNotMatch(label, /this week|weekly|today's spend/i, `"${label}" claims a window the data has not got`);
  }
});

test('the tiles are the four the production team asked for, in order', () => {
  const ids = dashboardTiles(JOBS, stageOf, production, TODAY, NOW).map((t) => t.id);
  assert.deepEqual(ids, ['working', 'draws', 'spend', 'health']);
});

// --- wiring ---------------------------------------------------------------------------------

test('the list is the default Jobs tab, and an old dashboard link still lands somewhere', () => {
  // The dashboard is a workspace tile now, so it is no longer a tab at all. A bookmark
  // pointing at ?tab=dashboard has to fall through to the list rather than render nothing.
  assert.match(main, /const JOB_TABS = \['list', 'calendar', 'pipeline', 'profile'\];/);
  assert.match(main, /return JOB_TABS\.includes\(value\) \? value : 'list';/);
  assert.ok(!/renderJobsDashboard/.test(main), 'the page renderer went with the tab');
});

test('the Jobs sub-menu stays open and offers only the calendar', () => {
  // Production is the section people live in; collapsing its one sub-view behind a chevron
  // was a click for nothing. The dashboard row left when the tile replaced it.
  assert.match(main, /const alwaysOpen = kind === 'jobs';/);
  assert.match(main, /const expanded = alwaysOpen \|\| state\.expandedNav\.has\(kind\);/);
  const nav = main.slice(main.indexOf('function jobsNavViews'), main.indexOf('function navItemPipeline'));
  assert.ok(nav.includes("tab: 'calendar'"), 'Calendar stays');
  assert.ok(!nav.includes("tab: 'dashboard'"), 'Dashboard does not');
});

const model = readFileSync(new URL('../src/jobs/dashboard-model.js', import.meta.url), 'utf8');
const registry = readFileSync(new URL('../src/home/widget-registry.js', import.meta.url), 'utf8');
const modal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');

test('the parts are defined once, beside the arithmetic that produces them', () => {
  assert.match(modelSrc, /export const JOB_TILE_PARTS = \[/);
  for (const key of ['working', 'draws', 'spend', 'health', 'workingList', 'drawsList']) {
    assert.ok(modelSrc.includes(`'${key}'`), `missing part: ${key}`);
  }
  // Two hand-kept copies would drift the first time a figure was added.
  assert.ok(!/const WB_JOBS_PARTS = \[/.test(main), 'main.js must not keep its own copy');
  assert.match(modal, /import \{ JOB_TILE_PARTS \} from '\.\.\/jobs\/dashboard-model\.js'/);
  assert.match(registry, /import \{ JOB_TILE_PARTS \} from '\.\.\/jobs\/dashboard-model\.js'/);
});

test('the tile is offered in the workspace catalogue and configured by tick-box', () => {
  assert.match(modal, /\['jobs', 'ti-hammer', 'Jobs'/, 'you have to be able to add it');
  assert.match(modal, /tile\.type === 'jobs'/, 'and choose what it shows');
  assert.match(modal, /data-wb-tilecfg-part=/);
  // Saving has to read those boxes back, or every tile keeps the defaults forever.
  assert.match(main, /\[\.\.\.document\.querySelectorAll\('\[data-wb-tilecfg-part\]'\)\]/);
});

test('the same figures are a widget on the company home dashboard', () => {
  // The workspace tile is not the home dashboard. This is the one the user asked for: it has
  // to appear in Add widget, carry the settings cog, and persist what was ticked.
  assert.match(registry, /jobsProduction: \{/);
  assert.match(registry, /configurable: true,/);
  assert.match(registry, /render: \(\) => renderDashboardJobsWidget\(companyId\)/);
  assert.match(registry, /function renderJobsConfigModal\(companyId\)/);
  assert.match(registry, /data-action="dashboard-jobs-widget-part"/);
  // The cog routes to the parts picker rather than the app-report picker.
  assert.match(main, /if \(id === 'jobsProduction'\) \{ state\.modal = 'dashboard-jobs-widget-config'/);
  assert.match(main, /action === 'dashboard-jobs-widget-part'/);
  assert.match(main, /function toggleDashboardJobsPart\(companyId, part\)/);
  // Ticking a box has to survive a reload, so it goes through the persisted widget store.
  assert.match(main, /saveDashboardAppWidgetConfig\(companyId, JOBS_WIDGET_KEY, \{ parts: next \}\)/);
});

test('both surfaces render the one tile function, not two lookalikes', () => {
  assert.match(main, /function renderJobsFigures\(companyId, config\)/);
  assert.match(main, /function wbTileJobs\(companyId, tile\) \{\n\s*return renderJobsFigures\(companyId, tile\.config\);/);
  assert.match(main, /return renderJobsFigures\(companyId, \{ parts: dashboardJobsParts\(companyId\) \}\)/);
});

test('it is fetched on use, not carried by every page', () => {
  assert.ok(!/^import .*jobs\/dashboard-view/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/jobs\/dashboard-view\.js'\)/);
  assert.match(main, /jobsDashboardPending = null;/, 'a failed fetch must be retryable');
});

test('the tile respects both job permissions', () => {
  assert.match(view, /can\('jobs\.view', companyId\)/, 'a role without Jobs sees no figures');
  assert.match(view, /const canBill = can\('jobs\.manage', companyId\);/);
  // Requesting a draw sends an invoice. It must not render for a viewer.
  assert.match(view, /\$\{canBill \? `<button[^`]*data-action="job-draw-invoice"/);
});

test('the tile shows production days, not pipeline position', () => {
  // The stage is already on the row and in the deck. Four days of dailies is the thing you
  // cannot get anywhere else on this screen.
  assert.match(view, /jobStreak\(job, productionForJob\)/);
  assert.ok(!view.includes('pipelineStageColor'), 'the progress dots were replaced, not doubled up');
});
