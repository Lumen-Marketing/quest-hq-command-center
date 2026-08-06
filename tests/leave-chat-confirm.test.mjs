import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Leaving a chat asked through window.confirm, which is stamped with the origin
// ("127.0.0.1:5173 says"), blocks the page, and cannot explain what stays behind. The
// confirmation is an in-app dialog now.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const modals = readFileSync(join(root, 'src', 'messaging', 'chat-modals.js'), 'utf8');

test('leaving a chat no longer goes through the browser dialog', () => {
  const at = main.indexOf('async function leaveConversation(conversationId)');
  assert.notEqual(at, -1);
  const fn = main.slice(at, main.indexOf('\nasync function ', at + 10));
  assert.ok(!/window\.confirm/.test(fn), 'the native prompt must be gone');
  assert.ok(!/const question =/.test(fn), 'and the string it used with it');
});

test('the button opens the dialog rather than leaving straight away', () => {
  assert.match(main, /state\.leavingConversationId = node\.dataset\.conversationId \|\| '';/);
  assert.match(main, /state\.modal = 'chat-leave-confirm';/);
  // Only the confirm button actually leaves.
  assert.match(main, /action === 'confirm-leave-conversation'[\s\S]{0,140}?leaveConversation\(node\.dataset\.conversationId \|\| ''\)/);
});

test('cancel goes back to the details it was opened from', () => {
  const at = main.indexOf("action === 'cancel-leave-conversation'");
  assert.notEqual(at, -1);
  const branch = main.slice(at, at + 260);
  assert.match(branch, /state\.modal = 'message-details';/);
  assert.ok(!/leaveConversation\(/.test(branch), 'cancel must not leave anything');
});

test('the dialog is routed and its state key is declared', () => {
  assert.match(main, /if \(state\.modal === 'chat-leave-confirm'\) return renderLeaveConversationModal\(activeCompanyId\(\), state\.leavingConversationId\);/);
  assert.match(main, /^\s{2}leavingConversationId: '',$/m, 'an undeclared state key never persists');
});

test('the dialog says what happens and what does not', () => {
  const at = modals.indexOf('function renderLeaveConversationModal(companyId, conversationId)');
  assert.notEqual(at, -1);
  const fn = modals.slice(at, modals.indexOf('\n  function ', at + 10));
  // The reassurance is the whole point of replacing the native prompt.
  assert.match(fn, /Nothing is deleted for anybody but you/);
  assert.match(fn, /keeps the chat and every message in it/);
  // A group and a one-to-one are different promises, so the wording differs.
  assert.match(fn, /const isDirect = conversation\.type === 'direct';/);
  assert.match(fn, /Message them again and a fresh chat starts/);
  assert.match(fn, /You will need to be added back to rejoin/);
  assert.match(fn, /data-action="confirm-leave-conversation"/);
  assert.match(fn, /data-action="cancel-leave-conversation"/);
});
