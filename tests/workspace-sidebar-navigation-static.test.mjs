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
  // The two footer links ("Create workspace" / "Manage workspaces") were replaced by a
  // "+" on the section heading and a settings control on each row — the same two jobs,
  // but attached to the thing they act on instead of routing to a settings page to hunt
  // for it. The permission gate is what this test is really about, and it still applies
  // to both controls.
  assert.match(source, /const canManageWorkspaces = canManageOperationalWorkspaces\(current\.id\);/);

  const rail = source.slice(source.indexOf('<div class="workspace-rail-head">'));
  const block = rail.slice(0, rail.indexOf('data-action="toggle-workspace-menu"'));

  // Scoped to the rail: "Create workspace" also names the sign-up call to action on the
  // landing page, which is a different control and stays.
  assert.ok(!/workspace-rail-actions/.test(source), 'the footer link container should be gone');
  assert.ok(!/>Manage workspaces</.test(source), 'nothing should route to the settings page for this');
  assert.ok(!/>Create workspace</.test(block), 'the rail footer link should be gone');

  // Adding a workspace: gated, and opens the existing create modal.
  assert.match(block, /\$\{canManageWorkspaces \? `[\s\S]*?data-action="open-create-operational-workspace-modal"/);
  // Editing one: gated, opens the existing edit modal, and says which workspace.
  assert.match(block, /\$\{canManageWorkspaces \? `[\s\S]*?data-action="open-edit-operational-workspace-modal"/);
  assert.match(block, /data-action="open-edit-operational-workspace-modal"[\s\S]{0,160}data-workspace-id="\$\{h\(workspace\.id\)\}"/);
});

test('the row is a container, so the settings control is not nested inside a button', () => {
  // A <button> inside a <button> is invalid, and browsers disagree about which one a
  // click belongs to — so selecting a workspace and opening its settings would fight.
  const rail = source.slice(source.indexOf('<div class="workspace-rail-list">'));
  const row = rail.slice(0, rail.indexOf('.join('));
  assert.match(row, /<div class="workspace-rail-item /);
  assert.match(row, /<button class="workspace-rail-open" type="button" data-action="select-workspace"/);
  assert.match(row, /<button class="workspace-rail-settings" type="button"/);
});

test('both new controls announce that they open a dialog, and name their target', () => {
  const rail = source.slice(source.indexOf('<div class="workspace-rail-head">'));
  const block = rail.slice(0, rail.indexOf('data-action="toggle-workspace-menu"'));
  assert.match(block, /aria-label="Add a workspace"/);
  // An icon-only control repeated per row must say which row it belongs to.
  assert.match(block, /aria-label="Settings for \$\{h\(workspace\.name\)\}"/);
  assert.equal((block.match(/aria-haspopup="dialog"/g) || []).length, 2);
});

test('long child workspace lists stay compact until expanded', () => {
  assert.match(source, /const visibleWorkspaces = state\.workspaceMenuOpen \? workspaces : workspaces\.slice\(0, WORKSPACE_RAIL_VISIBLE_LIMIT\);/);
  assert.match(source, /data-action="toggle-workspace-menu"/);
  assert.match(source, />\$\{state\.workspaceMenuOpen \? 'Show fewer' : 'More workspaces'\}</);
});
