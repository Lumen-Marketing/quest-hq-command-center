import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { buildPilotChecklist } from '../src/launch/pilot-readiness.js';

const source = [
  readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/launch/pilot-readiness.js', import.meta.url), 'utf8'),
].join('\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

function checklist(overrides = {}) {
  return buildPilotChecklist({
    hasWorkspace: true,
    installedPluginCount: 2,
    activeMemberCount: 1,
    pendingInviteCount: 0,
    customerRecordCount: 0,
    taskCount: 0,
    ...overrides,
  });
}

test('a new owner sees the three setup actions that still need work', () => {
  const result = checklist();

  assert.deepEqual(result.steps.map((step) => step.id), ['workspace', 'apps', 'team', 'customer', 'task']);
  assert.deepEqual(result.steps.map((step) => step.complete), [true, true, false, false, false]);
  assert.equal(result.completed, 2);
  assert.equal(result.total, 5);
  assert.equal(result.done, false);
});

test('a pending invite counts as starting the teammate setup step', () => {
  const result = checklist({ pendingInviteCount: 1 });

  assert.equal(result.steps.find((step) => step.id === 'team')?.complete, true);
  assert.equal(result.completed, 3);
});

test('the checklist completes from existing company data without a separate onboarding record', () => {
  const result = checklist({
    activeMemberCount: 2,
    customerRecordCount: 1,
    taskCount: 1,
  });

  assert.equal(result.done, true);
  assert.equal(result.completed, 5);
  assert.equal(result.total, 5);
});

test('the owner dashboard renders an actionable checklist from existing company state', () => {
  assert.match(source, /import\('\.\/launch\/pilot-readiness\.js'\)/);
  assert.match(source, /function renderPilotChecklist\(/);
  assert.match(source, /buildPilotChecklist\(input\)/);
  assert.match(source, /workspacePluginRows\(workspaceId\)/);
  assert.match(source, /companyMembers\(companyId\)/);
  assert.match(source, /companyContacts\(companyId\)\.length \+ companyJobs\(companyId\)\.length/);
  assert.match(source, /companyTasks\(companyId\)\.length/);
  assert.match(source, /function renderPilotLaunchChecklist\(companyId\)/);
  assert.match(source, /renderPilotLaunchChecklist\(companyId\)/);
  assert.match(source, /companyPath\('setup', \{ tab: 'workspaces' \}, companyId\)/);
  assert.match(source, /companyPath\('setup', \{ tab: 'modules' \}, companyId\)/);
  assert.match(source, /companyPath\('users', \{\}, companyId\)/);
  assert.match(source, /companyPath\('contacts', \{\}, companyId\)/);
  assert.match(source, /companyPath\('tasks', \{\}, companyId\)/);
  assert.match(styles, /\.pilot-launch-checklist/);
  assert.match(styles, /\.pilot-launch-step\.complete/);
});
