import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// "What is stuck" is the question the owner otherwise answers by chasing people. The Stuck view
// lists every open task that is either in the Stuck status or flagged "I'm stuck" (task.stuck,
// migration 063), so blockers are one click away instead of scattered across the list.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function taskModel(tasks) {
  const App = {
    DEFAULT_CLOCK_TASK_ID: 'general-shift',
    utils: {
      todayISO: () => '2026-09-23',
      taskInCompany: (t, c) => t.company === c,
      isAssignee: (t, who) => t.assignee === who,
      taskAssignees: (t) => [t.assignee],
    },
    taxonomy: { isDone: (t) => t.status === 'done' },
  };
  const context = { App, window: { App }, console };
  vm.createContext(context);
  vm.runInContext(read('taskmanagement/js/models/TaskModel.js'), context);
  const model = new App.TaskModel();
  model.hydrate(tasks);
  return model;
}

const base = { company: 'roofing', assignee: 'abraham', priority: 'medium', due: '2026-09-30' };
const TASKS = [
  { ...base, id: 'status-stuck', title: 'Waiting on permit', status: 'hold' },
  { ...base, id: 'flagged', title: 'Need tile price', status: 'todo', stuck: { reason: 'No quote', on: 'kristin', at: '2026-09-23T10:00:00Z' } },
  { ...base, id: 'moving', title: 'Order trusses', status: 'todo' },
  { ...base, id: 'done-flagged', title: 'Old blocker', status: 'done', stuck: { reason: 'x', on: 'kristin', at: '2026-09-01T10:00:00Z' } },
];

const ids = (list) => list.map((t) => t.id).sort();

test('the Stuck view lists the Stuck status and "I\'m stuck" flags, never done work', () => {
  const model = taskModel(TASKS.map((t) => ({ ...t })));
  const stuck = model.getFiltered({ view: 'stuck', scope: 'all', searchQuery: '', currentUser: 'abraham', activeFilters: null, currentCompany: 'roofing', role: 'admin', reportMemberIds: null });
  assert.deepEqual(ids(stuck), ['flagged', 'status-stuck']);
});

test('the Stuck view is registered wherever the other quick views are', () => {
  assert.match(read('taskmanagement/js/controllers/AppController.js'), /stuck: count\('stuck'\),/);
  const topbar = read('taskmanagement/js/views/TopbarView.js');
  assert.match(topbar, /\{ view: 'stuck',\s+label: 'Stuck',/);
  assert.match(topbar, /matches: \[[^\]]*'stuck'[^\]]*\]/);
  assert.match(topbar, /stuck: 'Stuck',/);
  assert.match(read('taskmanagement/js/views/SidebarView.js'), /canView\('stuck'\)/);
  assert.match(read('taskmanagement/js/views/BottomNavView.js'), /this\.taskViews = \[[^\]]*'stuck'/);
  assert.match(read('taskmanagement/js/views/TaskListView.js'), /'stuck':\s+\{ eyebrow: 'Blocked: needs help or a decision', title: 'Stuck' \}/);
});
