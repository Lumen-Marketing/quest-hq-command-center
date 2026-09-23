import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// profiles.role defaults to 'member', which the task app's own ROLE_PERMISSIONS grants
// nothing -- so an Owner with tasks.manage on every workspace hit
// "Access pending" inside Tasks. The host now passes the workspace task permission as
// ?task_access=, and App.can falls back to it only when the legacy role names no task role.

const constants = readFileSync(new URL('../taskmanagement/js/constants.js', import.meta.url), 'utf8');
const config = readFileSync(new URL('../taskmanagement/js/config.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

function taskApp({ role = 'member', hosted = true, taskAccess = '' } = {}) {
  const App = {};
  const context = { App, window: { App } };
  vm.createContext(context);
  vm.runInContext(constants, context);
  App.currentProfile = { role };
  App.commandCenterIntegration = { hosted, taskAccess };
  return App;
}

// The gate in taskmanagement/js/app.js: anything that fails all three sees "Access pending".
const passesGate = (App) => App.can('app.use') || App.can('clock.use') || App.can('roles.manage');

test('a Questbase member with tasks.manage gets in and can write tasks', () => {
  const App = taskApp({ taskAccess: 'manage' });
  assert.equal(passesGate(App), true);
  assert.equal(App.can('tasks.view'), true);
  assert.equal(App.can('tasks.write'), true);
});

test('tasks.view alone gets in read-only', () => {
  const App = taskApp({ taskAccess: 'view' });
  assert.equal(passesGate(App), true);
  assert.equal(App.can('tasks.view'), true);
  assert.equal(App.can('tasks.write'), false);
});

test('the workspace permission never grants clock, role or task-setup powers', () => {
  const App = taskApp({ taskAccess: 'manage' });
  for (const key of ['clock.use', 'clock.admin', 'roles.manage', 'task-setup.manage', 'time.team', 'reports.view']) {
    assert.equal(App.can(key), false, key);
  }
});

test('with no task permission the member is still gated', () => {
  assert.equal(passesGate(taskApp({ taskAccess: '' })), false);
  assert.equal(passesGate(taskApp({ taskAccess: 'owner' })), false);
});

test('outside Questbase the parameter is ignored', () => {
  assert.equal(passesGate(taskApp({ hosted: false, taskAccess: 'manage' })), false);
});

test('a real legacy role keeps its own permissions', () => {
  const worker = taskApp({ role: 'worker', taskAccess: 'view' });
  assert.equal(worker.can('tasks.write'), true);
  assert.equal(worker.can('clock.use'), true);
  const admin = taskApp({ role: 'admin', taskAccess: '' });
  assert.equal(admin.can('roles.manage'), true);
});

test('config.js accepts only manage or view from the URL', () => {
  assert.match(config, /taskAccess: \['manage', 'view'\]\.includes\(routeParams\.get\('task_access'\)\)/);
});

test('the host passes the workspace task permission into the frame', () => {
  const start = main.indexOf('function renderEmbeddedTasksPage(');
  const body = main.slice(start, main.indexOf('\nfunction ', start + 1));
  assert.match(body, /can\('tasks\.manage', companyId, workspaceId\) \? 'manage'/);
  assert.match(body, /can\('tasks\.view', companyId, workspaceId\) \? 'view'/);
  assert.match(body, /params\.set\('task_access', taskAccess\)/);
});
