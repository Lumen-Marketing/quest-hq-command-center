import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('sidebar renders the company account separately from its child workspaces', () => {
  assert.match(source, /class="company-account-header"/);
  assert.match(source, /data-company-account-id="\$\{h\(current\.id\)\}"/);
  assert.match(source, />Company account</);
  assert.match(source, /const workspaces = allowedOperationalWorkspaces\(current\.id\);/);
  assert.match(source, /aria-label="\$\{h\(companyLabel\(current\)\)\} workspaces"/);
  assert.match(styles, /\.company-account-header/);
});

test('workspace rows switch by workspace id and expose active semantics', () => {
  assert.match(source, /data-action="select-workspace" data-workspace-id="\$\{h\(workspace\.id\)\}"/);
  assert.match(source, /workspace\.id === currentWorkspaceId \? 'active' : ''/);
  assert.match(source, /aria-current="\$\{workspace\.id === currentWorkspaceId \? 'true' : 'false'\}"/);
  assert.match(source, /workspaceRoleLabel\(workspace\.id\)/);
  assert.match(source, /setActiveWorkspace\(node\.dataset\.workspaceId\)/);
  assert.match(styles, /\.workspace-rail-item\.active/);
});

test('workspace creation and management are restricted to company account managers', () => {
  assert.match(source, /const canManageWorkspaces = canManageOperationalWorkspaces\(current\.id\);/);
  assert.match(source, /\$\{canManageWorkspaces \? `/);
  assert.match(source, />Create workspace</);
  assert.match(source, />Manage workspaces</);
  assert.match(source, /focus: 'create-operational-workspace'/);
});

test('long child workspace lists stay compact until expanded', () => {
  assert.match(source, /const visibleWorkspaces = state\.workspaceMenuOpen \? workspaces : workspaces\.slice\(0, WORKSPACE_RAIL_VISIBLE_LIMIT\);/);
  assert.match(source, /data-action="toggle-workspace-menu"/);
  assert.match(source, />\$\{state\.workspaceMenuOpen \? 'Show fewer' : 'More workspaces'\}</);
});
