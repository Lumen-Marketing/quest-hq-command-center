import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// The ops cockpit: the reviewer sees what needs review, what nobody has touched today, and what
// was finished recently, without chasing people. Runs the real TaskModel with fixed dates in the
// HQ (Phoenix) timezone.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const TODAY = '2026-09-23';

function model(tasks, commentTouch) {
  const App = {
    HQ_TIMEZONE: 'America/Phoenix',
    DEFAULT_CLOCK_TASK_ID: 'general-shift',
    commentTouch,
    utils: {
      todayISO: (o = 0) => new Date(Date.UTC(2026, 8, 23 + o)).toISOString().slice(0, 10),
      taskInCompany: (t, c) => t.company === c,
      isAssignee: (t, who) => t.assignee === who,
      taskAssignees: (t) => [t.assignee],
    },
    taxonomy: { isDone: (t) => t.status === 'done' },
  };
  const context = { App, window: { App }, console };
  vm.createContext(context);
  vm.runInContext(read('taskmanagement/js/models/TaskModel.js'), context);
  const m = new App.TaskModel();
  m.hydrate(tasks);
  return { App, ids: (view) => m.getFiltered({ view, scope: 'all', searchQuery: '', currentUser: 'alexia', activeFilters: null, currentCompany: 'roofing', role: 'admin', reportMemberIds: null }).map((t) => t.id).sort() };
}

const base = { company: 'roofing', assignee: 'kristin', priority: 'medium', due: '2026-09-30', createdAt: '2026-09-20T15:00:00Z' };
// 2026-09-23 08:00 Phoenix = 15:00Z. 2026-09-22 23:30 Phoenix = 2026-09-23 06:30Z (still "yesterday" in HQ).
const TASKS = [
  { ...base, id: 'review-open', status: 'review', activity: [{ at: '2026-09-23T15:00:00Z' }] },
  { ...base, id: 'touched-today', status: 'todo', activity: [{ at: '2026-09-23T15:00:00Z' }] },
  { ...base, id: 'late-last-night', status: 'todo', activity: [{ at: '2026-09-23T06:30:00Z' }] },
  { ...base, id: 'thread-post-today', status: 'pending', activity: [] },
  { ...base, id: 'never-touched', status: 'pending' },
  { ...base, id: 'done-3-days-ago', status: 'done', completedAt: '2026-09-20T18:00:00Z' },
  { ...base, id: 'done-long-ago', status: 'done', completedAt: '2026-09-01T18:00:00Z' },
  { ...base, id: 'general-shift', status: 'todo' },
];

test('Needs review lists open work in the In review status', () => {
  assert.deepEqual(model(TASKS, {}).ids('review'), ['review-open']);
});

test('No update today uses the HQ day and counts thread posts as updates', () => {
  const { ids } = model(TASKS, { 'thread-post-today': '2026-09-23T16:00:00Z' });
  // late-last-night was touched at 23:30 Phoenix yesterday, so it has no update today.
  assert.deepEqual(ids('noupdate'), ['late-last-night', 'never-touched']);
});

test('Recently completed covers the last 7 days only', () => {
  assert.deepEqual(model(TASKS, {}).ids('recent'), ['done-3-days-ago']);
});

test('hqDateOf reads instants on the Phoenix calendar', () => {
  const { App } = model([], {});
  assert.equal(App.hqDateOf('2026-09-23T06:30:00Z'), '2026-09-22');
  assert.equal(App.hqDateOf('2026-09-23T15:00:00Z'), TODAY);
  assert.equal(App.hqDateOf(''), '');
});

test('the cockpit views are registered with counts and headers', () => {
  const ctrl = read('taskmanagement/js/controllers/AppController.js');
  for (const v of ['review', 'noupdate', 'recent']) assert.match(ctrl, new RegExp(`${v}: count\\('${v}'\\),`));
  assert.match(ctrl, /this\._indexCommentTouch\(this\._recentComments\);/);
  assert.match(read('taskmanagement/js/app.js'), /controller\.loadRecentComments\(\);/);
  const topbar = read('taskmanagement/js/views/TopbarView.js');
  for (const label of ['Needs review', 'No update today', 'Recently completed']) assert.ok(topbar.includes(`label: '${label}'`), label);
  assert.match(topbar, /review: 'Needs review', noupdate: 'No update today', recent: 'Recently completed',/);
  const list = read('taskmanagement/js/views/TaskListView.js');
  assert.match(list, /'review':\s+\{ eyebrow: 'Ops review: verify the update, proof or next step', title: 'Needs review' \}/);
});
