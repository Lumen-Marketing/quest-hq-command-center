import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Workspace settings is fetched on demand now; same surface, two files.
const main = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/workspace-settings.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

test('saving workspace settings leaves you where you were', () => {
  // The dialog is reachable from the sidebar rail on every page, so sending people to
  // Settings afterwards is a page change they did not ask for.
  const body = fn('saveOperationalWorkspaceSettings');
  assert.ok(!/navigate\(/.test(body), 'saving must not change route');
  assert.match(body, /showToast\('Workspace settings saved\.'[\s\S]*\n  render\(\);\s*$/, 'a re-render is what shows the saved name');
});

test('the dialog is opened from the rail as well as from Settings', () => {
  // Both entry points share one handler, which is why the route change was wrong for one
  // of them. If the rail button goes away, the assumption above is worth revisiting.
  const rail = main.slice(main.indexOf('class="workspace-rail-settings"'));
  assert.match(rail.slice(0, 400), /data-action="open-edit-operational-workspace-modal"/);
  assert.match(main, /<button class="ows-open" type="button" data-action="open-edit-operational-workspace-modal"/);
});

test('the modal is still closed and its draft cleared', () => {
  const body = fn('saveOperationalWorkspaceSettings');
  assert.match(body, /state\.modal = '';/);
  assert.match(body, /state\.selectedOperationalWorkspaceId = '';/);
  assert.match(body, /state\.operationalWorkspaceModalIcon = null;/);
});

test('archiving the workspace you are in still moves you to the default one', () => {
  // The one piece of state the save legitimately changes; a plain re-render has to pick it up.
  const body = fn('saveOperationalWorkspaceSettings');
  assert.match(body, /if \(saved\.status === 'archived' && state\.activeWorkspaceId === saved\.id\)/);
  assert.match(body, /state\.activeWorkspaceId = defaultOperationalWorkspaceId\(saved\.company_id\);/);
});
