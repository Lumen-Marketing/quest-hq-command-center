import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('sidebar exposes a persistent accessible workspace list', () => {
  assert.match(source, /class="workspace-rail workspace-menu/);
  assert.match(source, /class="workspace-rail-item \$\{company\.id === companyId \? 'active' : ''\}"/);
  assert.match(source, /aria-current="\$\{company\.id === companyId \? 'true' : 'false'\}"/);
  assert.match(source, /data-action="select-workspace"/);
  assert.match(source, /data-company-id="\$\{h\(company\.id\)\}"/);
  assert.match(styles, /\.workspace-rail-item\.active/);
});

test('sidebar exposes create and manage workspace actions', () => {
  assert.match(source, /workspace-rail-actions/);
  assert.match(source, />Create workspace</);
  assert.match(source, />Manage workspaces</);
  assert.match(source, /companyPath\('settings', \{ tab: 'company', focus: 'create-workspace' \}, companyId\)/);
});

test('long workspace lists stay compact until the user expands them', () => {
  assert.match(source, /const visibleCompanies = state\.workspaceMenuOpen \? menuCompanies : menuCompanies\.slice\(0, WORKSPACE_RAIL_VISIBLE_LIMIT\);/);
  assert.match(source, /data-action="toggle-workspace-menu"/);
  assert.match(source, />\$\{state\.workspaceMenuOpen \? 'Show fewer' : 'More workspaces'\}</);
});
