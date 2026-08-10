import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/plugins-panel.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/team/access-row.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607211200_company_operational_workspaces.sql', import.meta.url), 'utf8');

test('company settings create a child workspace instead of another company account', () => {
  assert.match(source, /data-operational-workspace-create-form/);
  assert.match(source, /async function createOperationalWorkspace\(formNode\)/);
  assert.match(source, /client\.rpc\('create_operational_workspace'/);
  assert.match(source, /target_company_id: companyId/);
  assert.match(source, /state\.operationalWorkspaces = mergeOperationalWorkspaces/);
  const settingsStart = source.indexOf('function renderWorkspaceSettings');
  const settingsEnd = source.indexOf('\nfunction renderPluginsSettings', settingsStart);
  const settings = source.slice(settingsStart, settingsEnd);
  assert.doesNotMatch(settings, /data-company-create-form/);
  assert.doesNotMatch(settings, /open-delete-company/);
});

test('active workspace identity can be renamed or archived without deleting the company', () => {
  assert.match(source, /data-operational-workspace-settings-form/);
  assert.match(source, /async function saveOperationalWorkspaceSettings\(formNode\)/);
  assert.match(source, /client\.rpc\('update_operational_workspace'/);
  assert.match(source, /workspace\.is_default \? 'disabled'/);
  assert.match(source, /Default workspace cannot be archived/);
  assert.match(migration, /create or replace function public\.update_operational_workspace\(/i);
  assert.match(migration, /if saved\.is_default and clean_status = 'archived'/i);
  assert.match(migration, /grant execute on function public\.update_operational_workspace\(uuid, text, text, text, text\) to authenticated;/i);
});

test('user access separates company role from per-workspace role assignments', () => {
  assert.match(source, /class="workspace-access-grid"/);
  assert.match(source, /name="workspace_ids" value="\$\{h\(workspace\.id\)\}"/);
  assert.match(source, /name="workspace_role:\$\{h\(workspace\.id\)\}"/);
  assert.match(source, /data-workspace-assignment/);
  assert.match(source, /client\.rpc\('set_workspace_member'/);
  assert.match(source, /target_workspace_id: workspace\.id/);
  assert.match(source, /target_profile_id: profileId/);
  assert.match(source, /next_status: enabled \? 'active' : 'disabled'/);
  assert.match(styles, /\.workspace-access-grid/);
});

test('workspace administration is gated to company account managers and surfaces live errors', () => {
  assert.match(source, /canManageOperationalWorkspaces\(companyId\)/);
  assert.match(source, /Workspace admin access is required/);
  assert.match(source, /showToast\(result\.error\.message \|\| 'Workspace update failed.'/);
  assert.match(source, /showToast\(result\.error\.message \|\| 'Workspace creation failed.'/);
});

test('every operational workspace opens its own setup survey', () => {
  const modalStart = source.indexOf('function renderOperationalWorkspaceCreateModal');
  const modalEnd = source.indexOf('\nfunction renderOperationalWorkspaceEditModal', modalStart);
  const modal = source.slice(modalStart, modalEnd);
  const createStart = source.indexOf('async function createOperationalWorkspace');
  const createEnd = source.indexOf('\nasync function saveOperationalWorkspaceSettings', createStart);
  const create = source.slice(createStart, createEnd);

  assert.doesNotMatch(modal, /workspacePresetSelect|name="preset_code"/);
  assert.match(create, /preset_code:\s*'blank'/);
  assert.doesNotMatch(create, /form\.preset_code|applyWorkspacePluginPresetLocal\(saved\.id/);
  assert.match(create, /companyPath\('settings', \{ tab: 'setup', workspace: saved\.id \}, companyId\)/);
  assert.match(create, /openWorkspaceSetupModal\(saved\.id, \{ required: true \}\)/);
  assert.match(source, /module\.createWorkspaceSetupPanel\(/);
  assert.match(source, /workspaceLabel:\s*workspace\.name/);
  assert.match(source, /workspaceId:\s*workspace\.id/);
});
