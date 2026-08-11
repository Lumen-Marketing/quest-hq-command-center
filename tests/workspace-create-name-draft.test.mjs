import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Typing a workspace name and then picking an icon threw the name away: choosing an icon, a
// colour or a pack each calls render(), which rebuilds the dialog, and the name input was
// uncontrolled -- nothing in state had ever been told what was typed.
//
// The first fix named the three actions the icon MODAL uses. The Create dialog renders its
// own icon grid with different action names, so it went on losing the name, and this file
// passed the whole time. The capture now happens once at the handler entry point instead of
// being listed per action, so these tests assert that and not a list of names.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

test('the typed text is captured before the picker re-renders', () => {
  const at = main.indexOf('function keepWorkspaceFormText(node)');
  assert.notEqual(at, -1);
  const body = main.slice(at, main.indexOf('\n}', at));
  // Read off the DOM, because that is the only place the value exists at that moment.
  assert.match(body, /form\.querySelector\('\[name="workspace_name"\]'\)/);
  assert.match(body, /state\.workspaceNameDraft = name\.value;/);
  // The description is on the Configure dialog and is lost by exactly the same re-render.
  assert.match(body, /state\.workspaceDescriptionDraft = description\.value;/);
});

test('the dialog is found even from a control outside its form', () => {
  // The header Save and the icon-upload label sit outside the <form>, so closest() alone
  // finds nothing and the capture silently does not happen.
  const at = main.indexOf('function keepWorkspaceFormText(node)');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /node\?\.closest\?\.\('form\.ows-modal-form'\) \|\| document\.querySelector\('form\.ows-modal-form'\)/);
  assert.match(body, /if \(!form\) return;/, 'no dialog open must be a no-op, not a throw');
});

test('capture happens once for every action, not per named action', () => {
  // Listing action names is what failed: the Create dialog's grid uses
  // set-operational-workspace-modal-icon, which was never on the list.
  const at = main.indexOf('function handleAction(event, node) {');
  assert.notEqual(at, -1);
  const head = main.slice(at, at + 900);
  assert.match(head, /keepWorkspaceFormText\(node\);/);
  // Before the first early return, or the actions that return early skip it.
  assert.ok(
    head.indexOf('keepWorkspaceFormText(node);') < head.indexOf('return;'),
    'the capture must run before any handler can return',
  );
});

test('the upload path captures too, because it is a change event', () => {
  const at = main.indexOf("event.target.matches('[data-operational-workspace-modal-icon-upload]')");
  assert.notEqual(at, -1);
  assert.match(main.slice(at, at + 400), /keepWorkspaceFormText\(event\.target\);/,
    'a change event never reaches handleAction, and this re-renders as well');
});

test('both dialogs render what was kept', () => {
  assert.match(main, /<input name="workspace_name" value="\$\{h\(state\.workspaceNameDraft \|\| ''\)\}"/);
  // Configure falls back to the saved workspace only when nothing has been typed.
  assert.match(main, /field\('Workspace name', 'workspace_name', state\.workspaceNameDraft \?\? workspace\.name/);
  assert.match(main, /\$\{h\(state\.workspaceDescriptionDraft \?\? workspace\.description\)\}/);
});

test('empty is a real value, so untouched is null', () => {
  // With '' as the sentinel, ?? would treat a field someone deliberately cleared as
  // untouched and put the old name back under them.
  assert.match(main, /^\s{2}workspaceNameDraft: null,$/m, 'an undeclared state key never persists');
  assert.match(main, /^\s{2}workspaceDescriptionDraft: null,$/m);
});

test('a fresh dialog is empty, and a created workspace leaves nothing behind', () => {
  for (const action of ['open-create-operational-workspace-modal', 'open-edit-operational-workspace-modal']) {
    const open = main.indexOf(`action === '${action}'`);
    assert.notEqual(open, -1, `${action} not found`);
    const body = main.slice(open, open + 900);
    assert.match(body, /state\.workspaceNameDraft = null;/, `${action} opens with a stale name`);
    assert.match(body, /state\.workspaceDescriptionDraft = null;/, `${action} opens with a stale description`);
  }
  const create = main.indexOf('async function createOperationalWorkspace');
  const body = main.slice(create, main.indexOf('\n}', create));
  assert.match(body, /state\.workspaceNameDraft = null;/, 'or the next Create opens pre-filled');
});

test('a new workspace opens its Setup, not the app builder', () => {
  const create = main.indexOf('async function createOperationalWorkspace');
  const body = main.slice(create, main.indexOf('\n}', create));
  assert.match(body, /openWorkspaceSetupModal\(saved\.id, \{ required: true \}\)/);
  assert.match(body, /navigate\(companyPath\('settings', \{ tab: 'setup', workspace: saved\.id \}, companyId\)\)/);
});
