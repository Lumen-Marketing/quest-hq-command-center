import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createJobsDashboard } from '../src/jobs/dashboard-view.js';

// The other dashboard test checks the model's arithmetic and greps the source for wiring.
// Neither actually runs the view. This does: it builds the real factory with a stub context
// and renders real HTML, which is the only way a missing context key, a bad template literal
// or an unescaped value shows up before a user finds it.
//
// The figures are a workspace tile now rather than a page, so every render here goes through
// renderJobsTile with a chosen set of parts.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const NOW = Date.parse('2026-08-04T18:00:00.000Z');
const day = (n) => new Date(NOW - n * 86400000).toISOString();
const TODAY = '2026-08-04';
const dayIso = (n) => new Date(NOW - n * 86400000).toISOString().slice(0, 10);

const JOBS = [
  { id: 'j1', name: 'Villa Ct — Roofing', stage: 'In production', owner_name: 'Alkeith', estimate_total: 12000, updated_at: day(0) },
  { id: 'j2', name: '209th Ave — Roofing', stage: 'Scheduled', owner_name: 'Sub crew', estimate_total: 4000, updated_at: day(6) },
  { id: 'j3', name: 'Onyx Ave — Demo', stage: 'QC / punch list', owner_name: '', estimate_total: 8000, updated_at: day(1) },
  { id: 'j4', name: '58th Pl — Framing', stage: 'Invoiced', owner_name: 'Alkeith', estimate_total: 10000, invoice_total: 10500, updated_at: day(2) },
];

// Villa Ct reported yesterday; 209th last reported three days ago, so it is the missing
// daily. Onyx has never reported at all, which is a different flag.
const PRODUCTION = {
  j1: {
    dailies: [
      { job_id: 'j1', report_date: dayIso(1), crew_label: 'Alkeith', production: 'good' },
      { job_id: 'j1', report_date: dayIso(2), crew_label: 'Alkeith', production: 'ok' },
    ],
    buckets: [{ spent: 3200 }, { spent: 900 }],
    draws: [
      { id: 'd1', label: 'Completion', amount: 8400, status: 'unlocked' },
      { id: 'd2', label: 'Start', amount: 8400, status: 'paid' },
    ],
  },
  j2: {
    dailies: [{ job_id: 'j2', report_date: dayIso(3), crew_label: 'Sub crew', production: 'good' }],
    buckets: [{ spent: 500 }],
    draws: [{ id: 'd3', label: 'Upon completion', amount: 7250, status: 'locked' }],
  },
  j3: { dailies: [], buckets: [], draws: [{ id: 'd4', label: 'Draw 3', amount: 10000, status: 'unlocked' }] },
  j4: { dailies: [], buckets: [{ spent: 9999 }], draws: [{ id: 'd5', label: 'Final', amount: 100, status: 'unlocked' }] },
};

const escape = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ALL_PARTS = ['working', 'draws', 'spend', 'health', 'workingList', 'drawsList'];

function build(jobs = JOBS, { canDo = () => true, production = PRODUCTION, parts = ALL_PARTS } = {}) {
  const { renderJobsTile } = createJobsDashboard({
    h: escape,
    can: canDo,
    money: (n) => `$${Number(n || 0).toLocaleString('en-US')}`,
    appHref: (path) => `#${path}`,
    companyPath: (section, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return `/c/lumen/${section}${q ? `?${q}` : ''}`;
    },
    companyJobs: () => jobs,
    resolvePipelineStage: (kind, value) => value,
    productionForJob: (id) => production[id] || { dailies: [], buckets: [], draws: [] },
    todayIso: () => TODAY,
  });
  return renderJobsTile('lumen', { parts }, ALL_PARTS);
}

test('it renders without throwing, and produces real markup', () => {
  const html = build();
  assert.ok(html.length > 500, 'expected a full tile of markup');
  assert.ok(!/undefined|NaN|\[object Object\]/.test(html), html.match(/.{0,60}(undefined|NaN|\[object Object\]).{0,60}/)?.[0]);
});

test('every template placeholder was substituted', () => {
  // A stray ${...} means a nested template literal lost its backtick.
  const html = build();
  assert.ok(!html.includes('${'), html.slice(Math.max(0, html.indexOf('${') - 80), html.indexOf('${') + 80));
});

test('the four tiles are the ones the production team asked for', () => {
  const html = build();
  for (const label of ['Working today', 'Draws ready', 'Spent to date', 'Production health']) {
    assert.ok(html.includes(label), `missing tile: ${label}`);
  }
  assert.ok(html.includes('3 jobs'), 'three live jobs');
  assert.ok(html.includes('1 own crew · 1 sub · 1 unassigned'), 'the crew split names all three');
  // Only the two unlocked draws on live jobs: 8,400 + 10,000. The invoiced job's draw is
  // still counted -- it is money owed regardless of stage.
  assert.ok(html.includes('$18,500'), 'unlocked draws, summed');
  assert.ok(html.includes('2 draws unlocked') || html.includes('3 draws unlocked'));
  assert.ok(html.includes('$4,600'), 'spend across live jobs only, not the invoiced one');
});

test('a job whose crew went quiet mid-run is flagged by name', () => {
  const html = build();
  assert.ok(html.includes('missing daily · 209th Ave'), 'the tile names the job, not just a count');
});

test('a job that never reported is not called a missing daily', () => {
  // Onyx has no dailies at all. That is "nobody has started reporting", not "a crew was on
  // site and nothing came back" -- conflating them would cry wolf on every new job.
  const html = build();
  assert.ok(!html.includes('missing daily · Onyx'));
});

test('live jobs are listed and linked to their record', () => {
  const html = build();
  for (const name of ['Villa Ct', '209th Ave', 'Onyx Ave']) assert.ok(html.includes(name), `missing ${name}`);
  assert.ok(html.includes('tab=profile&amp;job_id=j1') || html.includes('tab=profile&job_id=j1'), 'job link');
  // An invoiced job is not "working today".
  const working = html.slice(html.indexOf('Working today</p>'), html.indexOf('Draws ready</p>'));
  assert.ok(!working.includes('58th Pl'));
});

test('the draws card offers to bill each one, deep-linked to the contract tab', () => {
  const html = build();
  const draws = html.slice(html.indexOf('Draws ready</p>'));
  assert.ok(draws.includes('data-action="job-draw-invoice"'), 'Request must call the real write path');
  assert.ok(draws.includes('data-draw-id="d1"'), 'and identify which draw');
  assert.ok(/jt=contract/.test(draws), 'the row opens the tab that shows the draw');
  // Richest first: a limited afternoon should spend itself on the biggest one.
  assert.ok(draws.indexOf('$10,000') < draws.indexOf('$8,400'));
});

test('somebody who cannot bill sees the draws but not the buttons', () => {
  const html = build(JOBS, { canDo: (key) => key !== 'jobs.manage' });
  assert.ok(html.includes('Draws ready'));
  assert.ok(!html.includes('job-draw-invoice'), 'the button is a write action');
});

test('production streaks are drawn per day, and absent when nobody has reported', () => {
  const html = build();
  const panel = html.slice(html.indexOf('Working today</p>'), html.indexOf('Draws ready</p>'));
  const villa = panel.slice(panel.indexOf('Villa Ct'), panel.indexOf('209th Ave'));
  assert.ok(villa.includes('jd-good'), 'yesterday was a good day');
  assert.ok(villa.includes('jd-ok'), 'the day before was not');
  const onyx = panel.slice(panel.indexOf('Onyx Ave'));
  assert.ok(onyx.includes('jd-streak-none'), 'a job with no dailies shows a dash, not fake dots');
});

test('a company with no jobs still renders its figures rather than breaking', () => {
  const html = build([]);
  assert.ok(html.includes('0 jobs'));
  assert.ok(html.includes('nothing in production'));
  assert.ok(!/undefined|NaN/.test(html));
});

test('the tile shows only the parts that were ticked', () => {
  const html = build(JOBS, { parts: ['draws'] });
  assert.ok(html.includes('Draws ready'), 'the ticked figure is there');
  assert.ok(!html.includes('Spent to date'), 'an unticked figure is not');
  assert.ok(!html.includes('wb-jobs-list'), 'and neither list was asked for');
});

test('ticking nothing says so rather than drawing an empty box', () => {
  const html = build(JOBS, { parts: [] });
  assert.ok(html.includes('Nothing ticked for this tile yet'));
});

test('a tile with no saved parts falls back to the defaults', () => {
  const html = build(JOBS, { parts: undefined });
  assert.ok(html.includes('Working today'), 'an undefined parts list must not blank the tile');
});

test('somebody who cannot see jobs gets a reason, not figures', () => {
  const html = build(JOBS, { canDo: (key) => key !== 'jobs.view' });
  assert.ok(html.includes('Your role cannot see jobs'));
  assert.ok(!html.includes('Villa Ct'));
});

test('job names from users are escaped', () => {
  const evil = [{ id: 'x', name: '<img src=x onerror=alert(1)>', stage: 'In production', owner_name: '"><b>bad', estimate_total: 1, updated_at: day(0) }];
  const html = build(evil, { production: {} });
  assert.ok(!html.includes('<img src=x'), 'job name must be escaped');
  assert.ok(!html.includes('"><b>bad'), 'owner name must be escaped');
});

test('a draw label from a user is escaped too', () => {
  const jobs = [{ id: 'x', name: 'J', stage: 'In production', owner_name: 'A', updated_at: day(0) }];
  const html = build(jobs, {
    production: { x: { dailies: [], buckets: [], draws: [{ id: '"><script>', label: '<b>boom</b>', amount: 1, status: 'unlocked' }] } },
  });
  assert.ok(!html.includes('<b>boom</b>'), 'draw label must be escaped');
  assert.ok(!html.includes('data-draw-id=""><script>'), 'draw id must be escaped');
});

test('a tile keeps to five rows so it does not swamp the workspace', () => {
  const many = Array.from({ length: 12 }, (_, i) => ({
    id: `m${i}`, name: `Job ${i}`, stage: 'In production', owner_name: 'A', estimate_total: 100, updated_at: day(0),
  }));
  const html = build(many, { production: {} });
  const list = html.slice(html.indexOf('Working today</p>'));
  assert.equal((list.match(/class="wb-jobs-row"/g) || []).length, 5);
});

test('Add job belongs to the Jobs page, not to a workspace tile', () => {
  assert.ok(!build().includes('open-job-form'), 'the tile is a read-out, and links to the list to act');
});

test('today is read in local time, not UTC', () => {
  // toISOString() rolls over to tomorrow from mid-afternoon in Arizona, which would make a
  // daily submitted this afternoon look like it never arrived.
  assert.match(main, /function localIsoDate\(date = new Date\(\)\)/);
  assert.match(main, /todayIso: localIsoDate,/);
  assert.ok(!/todayIso: \(\) => new Date\(\)\.toISOString\(\)/.test(main));
});
