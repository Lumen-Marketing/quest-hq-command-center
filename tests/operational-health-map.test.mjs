import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The owner's snapshot: one container per workspace with a health level, so where work stands
// is visible without reading every task. Existing task fields only.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const registry = readFileSync(new URL('../src/home/widget-registry.js', import.meta.url), 'utf8');
const start = main.indexOf('function operationalHealth(');
const operationalHealth = new Function(`${main.slice(start, main.indexOf('\nfunction ', start + 1))}\nreturn operationalHealth;`)();

const TODAY = '2026-09-23';
const dateKey = (ts) => String(ts).slice(0, 10);
const fresh = { created_at: '2026-09-20T10:00:00Z', activity: [{ at: '2026-09-23T15:00:00Z' }], due: '2026-09-30', priority: 'medium' };
const score = (tasks) => operationalHealth(tasks, TODAY, dateKey);

test('levels follow Stuck > Urgent > Needs review > Watch > Good', () => {
  assert.equal(score([{ ...fresh, status: 'hold' }, { ...fresh, status: 'todo', due: '2026-09-01' }]).level, 'stuck');
  assert.equal(score([{ ...fresh, status: 'todo', stuck: { reason: 'x' } }]).level, 'stuck', 'the "I\'m stuck" flag counts');
  assert.equal(score([{ ...fresh, status: 'todo', due: '2026-09-01' }]).level, 'urgent', 'overdue');
  assert.equal(score([{ ...fresh, status: 'todo', priority: 'critical' }]).level, 'urgent', 'critical priority');
  assert.equal(score([{ ...fresh, status: 'review' }]).level, 'review');
  assert.equal(score([{ ...fresh, status: 'todo', due: TODAY }]).level, 'watch', 'due today');
  assert.equal(score([{ ...fresh, status: 'todo', activity: [{ at: '2026-09-22T15:00:00Z' }] }]).level, 'watch', 'no update today');
  assert.equal(score([{ ...fresh, status: 'todo' }]).level, 'good');
  assert.equal(score([{ ...fresh, status: 'done' }]).level, 'quiet', 'done work is not open work');
  assert.equal(score([]).level, 'quiet');
});

test('counts ignore done and cleared tasks', () => {
  const h = score([
    { ...fresh, status: 'hold' },
    { ...fresh, status: 'review', due: TODAY },
    { ...fresh, status: 'done', due: '2026-09-01' },
    { ...fresh, status: 'todo', cleared_at: '2026-09-22T00:00:00Z' },
  ]);
  assert.deepEqual({ open: h.open, stuck: h.stuck, overdue: h.overdue, review: h.review, dueToday: h.dueToday }, { open: 2, stuck: 1, overdue: 0, review: 1, dueToday: 1 });
});

test('the health map sits high on the Executive and Operations dashboards and drills into each workspace', () => {
  // Second, after Calls (which leads by an earlier decision). Saved dashboards get it at the top
  // through the new-widget introduction path.
  assert.match(main, /exec: \['calls', 'health', /);
  assert.match(main, /ops: \['calls', 'health', /);
  assert.match(registry, /health: \{\s+title: 'Operational health map',/);
  assert.match(main, /companyPath\('tasks', \{ workspace: workspace\.id \}, companyId\)/);
  // The host keeps the task app's stuck flag but never writes it back.
  assert.match(main, /stuck: input\.stuck && typeof input\.stuck === 'object' \? input\.stuck : null,/);
  const payload = main.slice(main.indexOf('function taskPayload('), main.indexOf('\nfunction ', main.indexOf('function taskPayload(') + 1));
  assert.doesNotMatch(payload, /stuck/);
});
