import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  appCoverage,
  buildPermissionDependencies,
  coverageSummary,
  unreachablePermissions,
} from '../src/team/permission-coverage.js';

// Both cases below are real, taken from the live database during the workspace audit.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

function catalogueKeys() {
  const at = main.indexOf('const PERMISSION_KEYS = [');
  const block = main.slice(at, main.indexOf('];', at));
  return [...block.matchAll(/\['([a-z_]+\.[a-z_]+)', '/g)].map((m) => m[1]);
}

test('dependencies are derived from the catalogue, not hand-listed', () => {
  const deps = buildPermissionDependencies(catalogueKeys());
  assert.equal(deps.get('crm.manage'), 'crm.view');
  assert.equal(deps.get('messages.send'), 'messages.view');
  assert.equal(deps.get('roles.manage'), 'roles.view');
  assert.equal(deps.get('calendar.view_team'), 'calendar.view');
  // A .view depends on nothing, and neither does a key whose group has no .view.
  assert.equal(deps.get('crm.view'), undefined);
  assert.equal(deps.get('time.track'), undefined, 'there is no time.view to depend on');
});

test('a group with no .view in the catalogue produces no dependency', () => {
  const deps = buildPermissionDependencies(['alpha.manage', 'beta.view', 'beta.manage']);
  assert.equal(deps.get('alpha.manage'), undefined);
  assert.equal(deps.get('beta.manage'), 'beta.view');
});

test('the live role that could send messages but not open them is caught', () => {
  // rom/member, exactly as stored: three messaging permissions and no messages.view.
  const deps = buildPermissionDependencies(catalogueKeys());
  const gaps = unreachablePermissions([
    'time.track', 'jobs.view', 'tasks.view', 'files.view', 'crm.view', 'users.manage',
    'messages.send', 'messages.manage_groups', 'messages.delete_own', 'workspaces.view',
  ], deps);
  const keys = gaps.map((gap) => gap.key);
  // Four, not the three the messaging permissions made obvious: users.manage without
  // users.view is the same defect and was missed reading the row by eye.
  assert.deepEqual(keys,
    ['messages.delete_own', 'messages.manage_groups', 'messages.send', 'users.manage']);
  assert.equal(gaps.find((gap) => gap.key === 'users.manage').requires, 'users.view');
  // A permission simply not held is not a gap -- only a held one that cannot act is.
  assert.ok(!keys.includes('messages.view'));
});

test('a coherent set reports nothing', () => {
  const deps = buildPermissionDependencies(catalogueKeys());
  assert.deepEqual(unreachablePermissions(['crm.view', 'crm.manage', 'tasks.view'], deps), []);
});

test('an app is open when any one of its modules is', () => {
  // Reporting is Analytics (jobs.view) plus Team chart (team.view); either one opens it.
  const gates = new Map([
    ['reporting', ['jobs.view', 'team.view']],
    ['crm', ['crm.view']],
    ['workspace_builder', []],
  ]);
  const coverage = appCoverage(['reporting', 'crm', 'workspace_builder'], gates, ['jobs.view']);
  assert.deepEqual(coverage.open, ['reporting', 'workspace_builder'], 'a gateless app is open to everyone');
  assert.deepEqual(coverage.closed, ['crm']);
});

test('the live worker who could open half a workspace is measured', () => {
  // laptop/worker in the "sales" workspace: 14 apps installed, 7 reachable.
  const gates = new Map([
    ['approvals', ['approvals.view']], ['calendar', ['calendar.view']],
    ['client_portal', ['client_portals.view']], ['crm', ['crm.view']],
    ['files', ['files.view']], ['finance', ['finance.view']], ['forms', ['forms.view']],
    ['messages', ['messages.view']], ['price_book', ['price_book.view']],
    ['reporting', ['jobs.view', 'team.view']], ['tasks', ['tasks.view']],
    ['time_clock', ['time.track']], ['underwriter', ['underwriter.view']],
    ['workspace_builder', ['workspaces.view']],
  ]);
  const worker = ['time.track', 'client_portals.view', 'workspaces.view', 'jobs.view',
    'files.view', 'tasks.view', 'forms.view'];
  const coverage = appCoverage([...gates.keys()], gates, worker);
  assert.equal(coverage.total, 14);
  assert.equal(coverage.open.length, 7);
  assert.deepEqual(coverage.closed,
    ['approvals', 'calendar', 'crm', 'finance', 'messages', 'price_book', 'underwriter']);
  assert.equal(coverageSummary(coverage), 'Opens 7 of 14 apps here');
});

test('full coverage says so, and an empty workspace says nothing at all', () => {
  const gates = new Map([['tasks', ['tasks.view']]]);
  assert.equal(coverageSummary(appCoverage(['tasks'], gates, ['tasks.view'])), 'Opens all 1 apps here');
  assert.equal(coverageSummary(appCoverage([], gates, [])), '', 'no apps is not a warning');
});
