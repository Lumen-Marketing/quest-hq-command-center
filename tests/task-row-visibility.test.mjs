import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// A task row should answer "what's blocking it?" and "what changed last?" without opening it.
// Renders the real Table-layout row with a minimal browser stand-in.

const source = readFileSync(new URL('../taskmanagement/js/views/tasklist/TableLayout.js', import.meta.url), 'utf8');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderRow(task) {
  const App = {
    DEFAULT_CLOCK_TASK_ID: 'general-shift',
    PRIORITIES: { medium: { label: 'Medium', cls: 'priority-medium' } },
    can: () => true,
    directory: { person: (id) => ({ kristin: { name: 'Kristin Montes', full: 'Kristin Montes', color: '#123456' } })[id] || null },
    taxonomy: {
      statusLabel: (c, ty, s) => ({ todo: 'Working on it', hold: 'Stuck', done: 'Done' })[s] || s,
      labelLabel: () => '', color: () => '#888', isDone: (t) => t.status === 'done',
    },
    utils: {
      escapeHtml: esc, todayISO: () => '2026-09-23', formatDue: () => ({ text: 'Sep 30', cls: '' }),
      initials: (n) => String(n || '?').slice(0, 2), safeColor: (c) => c, taskAssignees: (t) => [t.assignee],
      timeAgo: () => '2h ago', formatClockTz: (x) => x, avatarHtml: () => '',
    },
  };
  const document = { createElement: () => ({ className: '', dataset: {}, innerHTML: '' }), querySelector: () => null };
  const context = { App, window: { App }, document, console };
  vm.createContext(context);
  vm.runInContext(source, context);
  const view = {
    controller: { isBulkSelected: () => false, uiState: { selectedTaskId: null } },
    currentUser: 'alexia',
    timeModel: { activeFor: () => null },
  };
  return App.TaskListLayouts.table._qtRow(view, { company: 'roofing', type: 'admin', priority: 'medium', due: '2026-09-30', assignee: 'alexia', ...task });
}

test('a task flagged stuck names who it is blocked on, with the reason on hover', () => {
  const row = renderRow({ id: 'a', title: 'Tile price', status: 'todo', stuck: { reason: 'No quote yet', on: 'kristin', at: '2026-09-23T10:00:00Z' } });
  assert.match(row.className, /qt-stuckrow/);
  assert.match(row.innerHTML, /STUCK · blocked on Kristin Montes/);
  assert.match(row.innerHTML, /title="No quote yet"/);
});

test('the Stuck status alone still shows the badge', () => {
  assert.match(renderRow({ id: 'b', title: 'Permit', status: 'hold' }).innerHTML, />STUCK<\/span>/);
});

test('an open task shows its newest change under the title; done work does not', () => {
  const activity = [
    { who: 'Alexia', what: 'created this task', at: '2026-09-22T09:00:00Z' },
    { who: 'Kristin', what: 'uploaded the agreement', at: '2026-09-23T09:00:00Z' },
  ];
  const open = renderRow({ id: 'c', title: 'Agreement', status: 'todo', activity });
  assert.match(open.innerHTML, /class="qt-lastupd"[^>]*><b>Kristin<\/b> uploaded the agreement · 2h ago/);
  assert.doesNotMatch(renderRow({ id: 'd', title: 'Agreement', status: 'done', activity }).innerHTML, /qt-lastupd/);
});
