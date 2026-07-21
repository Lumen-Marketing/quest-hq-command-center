import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allowedWorkspaces,
  recordBelongsToWorkspace,
  workspaceForRoute,
  workspacePluginStatus,
} from '../src/workspaces/model.js';

const workspaces = [
  { id: 'ws-main', company_id: 'lumen', name: 'Main', is_default: true, status: 'active' },
  { id: 'ws-sales', company_id: 'lumen', name: 'Sales', is_default: false, status: 'active' },
  { id: 'ws-old', company_id: 'lumen', name: 'Old', is_default: false, status: 'archived' },
  { id: 'ws-other', company_id: 'other', name: 'Other', is_default: true, status: 'active' },
];

const memberships = [
  { workspace_id: 'ws-sales', profile_id: 'worker-1', status: 'active', role_id: 'sales-role' },
  { workspace_id: 'ws-old', profile_id: 'worker-1', status: 'active', role_id: 'old-role' },
  { workspace_id: 'ws-main', profile_id: 'disabled-worker', status: 'disabled', role_id: 'staff-role' },
];

test('Owners and Admins can enter every active workspace in their company', () => {
  for (const companyRole of ['owner', 'admin']) {
    assert.deepEqual(
      allowedWorkspaces({ companyId: 'lumen', workspaces, memberships, profileId: 'owner-1', companyRole }).map((item) => item.id),
      ['ws-main', 'ws-sales'],
    );
  }
});

test('Members see only explicitly assigned active workspaces', () => {
  assert.deepEqual(
    allowedWorkspaces({ companyId: 'lumen', workspaces, memberships, profileId: 'worker-1', companyRole: 'member' }).map((item) => item.id),
    ['ws-sales'],
  );
  assert.deepEqual(
    allowedWorkspaces({ companyId: 'lumen', workspaces, memberships, profileId: 'disabled-worker', companyRole: 'member' }),
    [],
  );
});

test('route workspace wins, then stored workspace, then the default allowed workspace', () => {
  const base = { companyId: 'lumen', workspaces, memberships, profileId: 'owner-1', companyRole: 'owner' };
  assert.equal(workspaceForRoute({ ...base, workspaceParam: 'ws-sales', storedWorkspaceId: 'ws-main' }).id, 'ws-sales');
  assert.equal(workspaceForRoute({ ...base, workspaceParam: 'not-allowed', storedWorkspaceId: 'ws-sales' }).id, 'ws-sales');
  assert.equal(workspaceForRoute({ ...base, workspaceParam: '', storedWorkspaceId: '' }).id, 'ws-main');
});

test('a Member cannot select a workspace merely by putting its id in the URL', () => {
  const selected = workspaceForRoute({
    companyId: 'lumen',
    workspaceParam: 'ws-main',
    storedWorkspaceId: '',
    workspaces,
    memberships,
    profileId: 'worker-1',
    companyRole: 'member',
  });
  assert.equal(selected.id, 'ws-sales');
});

test('legacy records without workspace ids belong only to the default workspace', () => {
  assert.equal(recordBelongsToWorkspace({ workspace_id: 'ws-sales' }, 'ws-sales', 'ws-main'), true);
  assert.equal(recordBelongsToWorkspace({ workspace_id: 'ws-sales' }, 'ws-main', 'ws-main'), false);
  assert.equal(recordBelongsToWorkspace({ workspace_id: '' }, 'ws-main', 'ws-main'), true);
  assert.equal(recordBelongsToWorkspace({ workspace_id: null }, 'ws-sales', 'ws-main'), false);
});

test('workspace plugin state cannot exceed the company entitlement', () => {
  const workspacePlugins = [
    { workspace_id: 'ws-main', plugin_id: 'crm_2', status: 'installed' },
    { workspace_id: 'ws-main', plugin_id: 'finance', status: 'disabled' },
  ];
  assert.equal(workspacePluginStatus({ workspaceId: 'ws-main', pluginId: 'crm_2', workspacePlugins, companyEntitled: true }), 'installed');
  assert.equal(workspacePluginStatus({ workspaceId: 'ws-main', pluginId: 'finance', workspacePlugins, companyEntitled: true }), 'disabled');
  assert.equal(workspacePluginStatus({ workspaceId: 'ws-main', pluginId: 'forms', workspacePlugins, companyEntitled: true }), 'available');
  assert.equal(workspacePluginStatus({ workspaceId: 'ws-main', pluginId: 'crm_2', workspacePlugins, companyEntitled: false }), 'available');
});
