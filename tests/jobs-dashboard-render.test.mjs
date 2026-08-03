import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createJobsDashboard } from '../src/jobs/dashboard-view.js';

// The other dashboard test checks the model's arithmetic and greps the source for wiring.
// Neither actually runs the view. This does: it builds the real factory with a stub context
// and renders real HTML, which is the only way a missing context key, a bad template literal
// or an unescaped value shows up before a user finds it.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const NOW = Date.now();
const day = (n) => new Date(NOW - n * 86400000).toISOString();

const STAGES = [
  { name: 'Unscheduled', color: '#9AA0A8' },
  { name: 'Scheduled', color: '#378ADD' },
  { name: 'Material ordered', color: '#3C7BD0' },
  { name: 'In production', color: '#BA7517' },
  { name: 'QC / punch list', color: '#C08A2B' },
  { name: 'Invoiced', color: '#7F77DD' },
  { name: 'Paid / closed', color: '#639922' },
];

const JOBS = [
  { id: 'j1', name: 'Villa Ct', stage: 'In production', owner_name: 'Alkeith', estimate_total: 12000, updated_at: day(0) },
  { id: 'j2', name: '209th Ave', stage: 'Scheduled', owner_name: '', estimate_total: 4000, updated_at: day(6) },
  { id: 'j3', name: 'Onyx Ave', stage: 'QC / punch list', owner_name: 'Crew B', estimate_total: 8000, updated_at: day(1) },
  { id: 'j4', name: '58th Pl', stage: 'Invoiced', owner_name: 'Alkeith', estimate_total: 10000, invoice_total: 10500, updated_at: day(2) },
];

const escape = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function build(jobs = JOBS, { canDo = () => true } = {}) {
  const { renderJobsDashboard } = createJobsDashboard({
    h: escape,
    can: canDo,
    money: (n) => `$${Number(n || 0).toLocaleString('en-US')}`,
    emptyState: (msg) => `<div class="empty">${escape(msg)}</div>`,
    appHref: (path) => `#${path}`,
    companyPath: (section, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return `/c/lumen/${section}${q ? `?${q}` : ''}`;
    },
    companyJobs: () => jobs,
    pipelineStages: () => STAGES,
    pipelineStageColor: (kind, name) => (STAGES.find((s) => s.name === name) || {}).color || '#9AA0A8',
    resolvePipelineStage: (kind, value) => value,
  });
  return renderJobsDashboard('lumen');
}

test('it renders without throwing, and produces real markup', () => {
  const html = build();
  assert.ok(html.length > 500, 'expected a full page of markup');
  assert.ok(!/undefined|NaN|\[object Object\]/.test(html), html.match(/.{0,60}(undefined|NaN|\[object Object\]).{0,60}/)?.[0]);
});

test('every template placeholder was substituted', () => {
  // A stray ${...} means a nested template literal lost its backtick.
  const html = build();
  assert.ok(!html.includes('${'), html.slice(Math.max(0, html.indexOf('${') - 80), html.indexOf('${') + 80));
});

test('the four tiles render with their captions', () => {
  const html = build();
  for (const label of ['Working now', 'Ready to invoice', 'Active value', 'Needs attention']) {
    assert.ok(html.includes(label), `missing tile: ${label}`);
  }
  assert.ok(html.includes('3 jobs'), 'three live jobs');
  assert.ok(html.includes('2 assigned · 1 unassigned'));
  assert.ok(html.includes('$10,500'), 'invoice total formatted through money()');
  assert.ok(html.includes('$24,000'), 'live estimate total');
  assert.ok(html.includes('1 flag'));
});

test('live jobs are listed and linked to their record', () => {
  const html = build();
  for (const name of ['Villa Ct', '209th Ave', 'Onyx Ave']) assert.ok(html.includes(name), `missing ${name}`);
  assert.ok(html.includes('tab=profile&amp;job_id=j1') || html.includes('tab=profile&job_id=j1'), 'job link');
  // An invoiced job is not "working now".
  const working = html.slice(html.indexOf('Working now</h2>'), html.indexOf('Needs attention</h2>'));
  assert.ok(!working.includes('58th Pl'));
});

test('the flagged job says how long it has been quiet', () => {
  const html = build();
  const flags = html.slice(html.indexOf('Needs attention</h2>'));
  assert.ok(flags.includes('209th Ave'));
  assert.ok(/no update in 6 days/.test(flags), 'should name the idle time');
});

test('an unassigned job reads as Unassigned rather than blank', () => {
  assert.ok(build().includes('Unassigned'));
});

test('a company with no jobs gets empty states, not a broken page', () => {
  const html = build([]);
  assert.ok(html.includes('No jobs are in production right now'));
  assert.ok(html.includes('Every live job has been updated recently'));
  assert.ok(html.includes('0 jobs'));
  assert.ok(!/undefined|NaN/.test(html));
});

test('job names from users are escaped', () => {
  const evil = [{ id: 'x', name: '<img src=x onerror=alert(1)>', stage: 'In production', owner_name: '"><b>bad', estimate_total: 1, updated_at: day(0) }];
  const html = build(evil);
  assert.ok(!html.includes('<img src=x'), 'job name must be escaped');
  assert.ok(!html.includes('"><b>bad'), 'owner name must be escaped');
});

test('Add job disappears without permission', () => {
  assert.ok(build(JOBS).includes('open-job-form'));
  assert.ok(!build(JOBS, { canDo: () => false }).includes('open-job-form'));
});

test('progress dots are drawn one per stage, filled to the current one', () => {
  const html = build([JOBS[0]]);
  const li = html.slice(html.indexOf('Villa Ct'));
  const dots = li.slice(li.indexOf('jd-dots'), li.indexOf('</span>', li.indexOf('jd-dots')) + 300);
  // "In production" is stage 4 of 7.
  assert.equal((dots.match(/<i /g) || []).length, 7, 'one dot per stage');
  assert.equal((dots.match(/class="on"/g) || []).length, 4, 'filled up to the current stage');
  assert.ok(dots.includes('#BA7517'), 'filled dots take the stage colour');
});

test('the long list is capped and says so', () => {
  const many = Array.from({ length: 12 }, (_, i) => ({
    id: `m${i}`, name: `Job ${i}`, stage: 'In production', owner_name: 'A', estimate_total: 100, updated_at: day(0),
  }));
  const html = build(many);
  assert.ok(html.includes('4 more in the full list'), 'silently truncating would misrepresent the day');
});

test('the tab is labelled properly, not left as a raw id', () => {
  assert.match(main, /dashboard: 'Dashboard',/);
});
