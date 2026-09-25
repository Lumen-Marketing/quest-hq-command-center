// Task rows store ROSTER ids (team_members.id), while most people pickers list PROFILE ids.
// These tests pin the translation for Team Workload and for every task-creation path that
// starts from a profile-keyed picker. Shapes mirror production on 2026-09-23 (example emails).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolveTaskAssigneeId, taskRosterPeople } from '../src/tasks/task-assignees.js';
import { computeTeamWorkload } from '../src/data/team-workload.js';

// What companyTaskAssignees() returns: one entry per active membership, `id` = roster id.
const ASSIGNEES = [
  { id: 'team', profile_id: 'p-alexia', member_id: 'team', name: 'Alexia Valenzuela', full_name: 'Alexia Valenzuela', email: 'team@example.com' },
  { id: 'admin', profile_id: 'p-abe-admin', member_id: 'admin', name: 'Abraham Maldonado', full_name: 'Abraham Maldonado', email: 'admin@example.com' },
  // Three different logins whose email local part is "info" all resolve to one roster id.
  { id: 'info', profile_id: 'p-abe-info-1', member_id: 'info', name: 'Abraham Maldonado', full_name: 'Abraham Maldonado', email: 'info@roofing.example' },
  { id: 'info', profile_id: 'p-abe-info-2', member_id: 'info', name: 'Abraham Maldonado', full_name: 'Abraham Maldonado', email: 'info@construction.example' },
  { id: 'info', profile_id: 'p-lumen', member_id: 'info', name: 'Lumen Marketing Account', full_name: 'Lumen Marketing Account', email: 'info@agency.example' },
  { id: 'ralph', profile_id: 'p-ralph', member_id: 'ralph', name: 'Ralph', full_name: 'Ralph', email: 'ralph@example.com' },
  { id: 'rom', profile_id: 'p-someone', member_id: 'rom', name: 'Someone Else', full_name: 'Someone Else', email: 'x@example.com' },
  { id: 'eugenio', profile_id: 'p-rom', member_id: 'eugenio', name: 'Rom', full_name: 'Rom', email: 'rom@example.com' },
];

test('a profile id resolves to the roster id the tasks table stores', () => {
  assert.equal(resolveTaskAssigneeId('p-alexia', ASSIGNEES), 'team');
  assert.equal(resolveTaskAssigneeId('p-ralph', ASSIGNEES), 'ralph');
  assert.equal(resolveTaskAssigneeId('p-abe-admin', ASSIGNEES), 'admin');
});

test('a roster id resolves to itself, even when it equals another person\'s display name', () => {
  assert.equal(resolveTaskAssigneeId('team', ASSIGNEES), 'team');
  // "rom" is Someone Else's roster id AND Rom's display name: the id must win.
  assert.equal(resolveTaskAssigneeId('rom', ASSIGNEES), 'rom');
  assert.equal(resolveTaskAssigneeId('Rom', ASSIGNEES), 'rom');
  assert.equal(resolveTaskAssigneeId('p-rom', ASSIGNEES), 'eugenio');
});

test('an unknown value resolves to nothing, never to the raw input', () => {
  assert.equal(resolveTaskAssigneeId('p-nobody', ASSIGNEES), '');
  assert.equal(resolveTaskAssigneeId('', ASSIGNEES), '');
});

test('workload people: one row per roster id, shared ids are not credited to a person', () => {
  const people = taskRosterPeople(ASSIGNEES);
  assert.deepEqual(people.map((p) => p.id), ['team', 'admin', 'info', 'ralph', 'rom', 'eugenio']);
  const info = people.find((p) => p.id === 'info');
  assert.equal(info.shared, true);
  assert.equal(info.accounts, 3);
  assert.doesNotMatch(info.name, /Abraham|Lumen/);
  const abe = people.find((p) => p.id === 'admin');
  assert.equal(abe.shared, false);
  assert.equal(abe.name, 'Abraham Maldonado');
  assert.equal(people.filter((p) => p.name === 'Abraham Maldonado').length, 1);
});

test('Team Workload counts Alexia\'s task and keeps "info" work on the shared row', () => {
  const tasks = [
    { assignee_id: 'team', due: '2026-09-25', status: 'pending' }, // Alexia, Production
    { assignee_id: 'team', due: '2026-09-24', status: 'done' },
    { assignee_id: 'info', due: '2026-08-12', status: 'todo' },
    { assignee_id: 'info', due: '2026-08-14', status: 'todo' },
    { assignee_id: 'ralph', due: '2026-09-30', status: 'todo' },
  ];
  const wl = computeTeamWorkload({ members: taskRosterPeople(ASSIGNEES), tasks, todayIso: '2026-09-23' });
  const row = (id) => wl.rows.find((r) => r.id === id);
  assert.equal(row('team').open, 1);
  assert.equal(row('ralph').open, 1);
  assert.equal(row('info').open, 2);
  assert.equal(row('info').overdue, 2);
  assert.equal(row('admin').open, 0); // no guessing: Abraham's admin identity holds no tasks
  assert.equal(wl.totalOpen, 4);
  assert.equal(wl.unassignedOpen, 0);
});

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const workloadPage = readFileSync(new URL('../src/team/workload-page.js', import.meta.url), 'utf8');
const recordTask = readFileSync(new URL('../src/workspace/record-task.js', import.meta.url), 'utf8');

function between(source, start, end) {
  const at = source.indexOf(start);
  assert.notEqual(at, -1, `Missing source marker: ${start}`);
  const stop = source.indexOf(end, at + start.length);
  assert.notEqual(stop, -1, `Missing source marker: ${end}`);
  return source.slice(at, stop);
}

test('Team Workload is keyed by roster people, not profile ids', () => {
  assert.match(workloadPage, /taskRosterPeople\(companyTaskAssignees\(companyId\)\)/);
  assert.doesNotMatch(workloadPage, /user\.profile_id \|\| user\.member_id/);
});

test('the shared App Builder writer translates the assignee before insert', () => {
  const writer = between(main, 'async function wbCreateTaskFromPost(', '\n}\n');
  assert.match(writer, /taskAssigneeId\(assigneeId, companyId\)/);
  assert.match(writer, /assignee_id: rosterAssigneeId/);
  assert.doesNotMatch(writer, /assignee_id: assigneeId \|\| creatorId/);
});

test('record New task modal creates through the shared writer', () => {
  assert.match(recordTask, /wbCreateTaskFromPost\(companyId, \{\s*title, assigneeId, due/);
});

test('post composer task option creates through the shared writer', () => {
  const composer = between(main, 'async function wbComposerShare(', '\n}\n');
  assert.match(composer, /wbCreateTaskFromPost\(companyId, \{ title: .*assigneeId/);
});

test('activity task modal creates through the shared writer', () => {
  const activity = between(main, 'async function wbCreateTaskFromActivity(', '\n}\n');
  assert.match(activity, /wbCreateTaskFromPost\(companyId, \{/);
  assert.match(activity, /assigneeId,/);
});

test('command palette saves through saveTask, which translates the assignee', () => {
  const palette = between(main, 'async function submitCommandTask(form)', '\n}\n');
  assert.match(palette, /await saveTask\(form\)/);
  const save = between(main, 'async function saveTask(form)', 'const existing = !!previous;');
  assert.match(save, /assignee_id: taskAssigneeId\(formData\.assignee_id, companyId\) \|\| String\(formData\.assignee_id\)/);
});

test('taskAssigneeId delegates to the tested pure resolver', () => {
  const helper = between(main, 'function taskAssigneeId(', '\n}\n');
  assert.match(helper, /resolveTaskAssigneeId\(value, companyTaskAssignees\(companyId\)\)/);
});
