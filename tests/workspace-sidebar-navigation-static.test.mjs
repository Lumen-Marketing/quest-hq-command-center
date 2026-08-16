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
  // Anchored on the class, not the whole tag: the list also carries the reorder marker now,
  // and matching the closing bracket made this silently slice nothing and pass on an
  // empty string.
  const rail = source.slice(source.indexOf('<div class="workspace-rail-list"'));
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

// ---- choosing a workspace takes you to that workspace's apps ----------------------------------
//
// "When I select a workspace it will instantly go to the workspace app -- so even when I'm on
// the settings menu and click another workspace, it will direct me to the workspace apps."
//
// It used to carry the current section across, so switching workspace from Settings landed on
// the next workspace's Settings: the same admin screen with a different subject, and nothing on
// it to show the switch had worked.

test('switching workspace lands on its apps, whatever page you were on', () => {
  const at = source.indexOf('function setActiveWorkspace(');
  const body = source.slice(at, source.indexOf('\n}\n', at));
  assert.match(body, /const section = can\('workspaces\.view', workspace\.company_id\) \? 'workspaces' : current;/);
  assert.match(body, /navigate\(companyPath\(section, \{ workspace: workspace\.id \}, workspace\.company_id\)\)/);
  // No app_id in the call itself: the workspace's own home, which is where its apps are listed.
  // Pinning one would open whichever app happened to be named rather than the workspace.
  const call = body.match(/navigate\(companyPath\(section,[^\n]*/)?.[0] || '';
  assert.ok(call && !/app_id/.test(call), 'the workspace home, not one app inside it');
});

test('a role that cannot open Apps is not dumped on a page that refuses it', () => {
  const at = source.indexOf('function setActiveWorkspace(');
  const body = source.slice(at, source.indexOf('\n}\n', at));
  // The section they were already on is the fallback, so the switch still happens.
  assert.match(body, /const current = route\.name === 'company' \? route\.section : 'jobs';/);
});

test('the active workspace is stored before the navigation reads it', () => {
  // The builder page resolves which workspace to draw from state.activeWorkspaceId, so setting
  // it after navigating would render the workspace that was open before the click.
  const at = source.indexOf('function setActiveWorkspace(');
  const body = source.slice(at, source.indexOf('\n}\n', at));
  assert.ok(
    body.indexOf('state.activeWorkspaceId = workspace.id;') < body.indexOf('navigate(companyPath(section'),
    'the id is set first',
  );
});
