import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Typing a workspace name and then picking an icon threw the name away: choosing an icon, a
// colour or a pack each calls render(), which rebuilds the dialog, and the name input was
// uncontrolled -- nothing in state had ever been told what was typed.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

test('the typed name is captured before the picker re-renders', () => {
  const at = main.indexOf('function keepWorkspaceFormText(node)');
  assert.notEqual(at, -1);
  const body = main.slice(at, main.indexOf('\n}', at));
  // Read off the DOM, because that is the only place the value exists at that moment.
  assert.match(body, /form\?\.querySelector\('input\[name="workspace_name"\]'\)/);
  assert.match(body, /state\.workspaceNameDraft = input\.value;/);
});

test('all three icon actions capture it, not just the icon', () => {
  // Colour and pack re-render exactly the same way; fixing only the icon would leave two
  // ways to lose the name.
  for (const action of ['select-workspace-icon', 'set-workspace-icon-color', 'set-workspace-icon-pack']) {
    const at = main.indexOf(`action === '${action}'`);
    assert.notEqual(at, -1, `${action} not found`);
    assert.match(main.slice(at, at + 260), /keepWorkspaceFormText\(node\);/, `${action} does not keep the name`);
  }
});

test('the field renders what was kept', () => {
  assert.match(main, /<input name="workspace_name" value="\$\{h\(state\.workspaceNameDraft \|\| ''\)\}"/);
  assert.match(main, /^\s{2}workspaceNameDraft: '',$/m, 'an undeclared state key never persists');
});

test('a fresh dialog is empty, and a created workspace leaves nothing behind', () => {
  const open = main.indexOf("action === 'open-create-operational-workspace-modal'");
  assert.match(main.slice(open, open + 500), /state\.workspaceNameDraft = '';/);
  const create = main.indexOf('async function createOperationalWorkspace');
  const body = main.slice(create, main.indexOf('\n}', create));
  assert.match(body, /state\.workspaceNameDraft = '';/, 'or the next Create opens pre-filled');
});

test('a new workspace opens its Setup, not the app builder', () => {
  const create = main.indexOf('async function createOperationalWorkspace');
  const body = main.slice(create, main.indexOf('\n}', create));
  assert.match(body, /openWorkspaceSetupModal\(saved\.id, \{ required: true \}\)/);
  assert.match(body, /navigate\(companyPath\('settings', \{ tab: 'setup', workspace: saved\.id \}, companyId\)\)/);
});
