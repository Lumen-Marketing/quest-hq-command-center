import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Leaving a chat asked through window.confirm, which is stamped with the origin
// ("127.0.0.1:5173 says"), blocks the page, and cannot explain what stays behind. The
// confirmation is an in-app dialog now.
//
// It also used to be the ONLY exit: one button both cleared the conversation and dropped you
// out of the group. Those are two different intentions and are separate actions now, so the
// dialog has to say which one it is about to do.

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

test('either button opens the dialog rather than acting straight away', () => {
  assert.match(main, /if \(action === 'leave-conversation' \|\| action === 'clear-conversation'\) \{/);
  assert.match(main, /state\.leavingConversationId = node\.dataset\.conversationId \|\| '';/);
  assert.match(main, /state\.chatExitMode = action === 'clear-conversation' \? 'clear' : 'leave';/);
  assert.match(main, /state\.modal = 'chat-leave-confirm';/);
});

test('the confirm button honours which of the two was asked for', () => {
  const at = main.indexOf("action === 'confirm-leave-conversation'");
  assert.notEqual(at, -1);
  const branch = main.slice(at, at + 320);
  assert.match(branch, /if \(state\.chatExitMode === 'clear'\) clearConversation\(node\.dataset\.conversationId \|\| ''\);/);
  assert.match(branch, /else leaveConversation\(node\.dataset\.conversationId \|\| ''\);/);
});

test('cancel goes back to the details it was opened from', () => {
  const at = main.indexOf("action === 'cancel-leave-conversation'");
  assert.notEqual(at, -1);
  const branch = main.slice(at, at + 260);
  assert.match(branch, /state\.modal = 'message-details';/);
  assert.ok(!/leaveConversation\(|clearConversation\(/.test(branch), 'cancel must not do either one');
});

test('the dialog is routed and both state keys are declared', () => {
  assert.match(main, /if \(state\.modal === 'chat-leave-confirm'\) return renderLeaveConversationModal\(activeCompanyId\(\), state\.leavingConversationId\);/);
  assert.match(main, /^\s{2}leavingConversationId: '',$/m, 'an undeclared state key never persists');
  assert.match(main, /^\s{2}chatExitMode: 'leave',$/m);
});

test('the dialog describes a clear as keeping you in the chat', () => {
  const at = modals.indexOf('function renderLeaveConversationModal(companyId, conversationId)');
  assert.notEqual(at, -1);
  const fn = modals.slice(at, modals.indexOf('\n  function ', at + 10));
  assert.match(fn, /const clearing = state\.chatExitMode === 'clear';/);
  assert.match(fn, /You stay in this chat and keep receiving new messages\./);
  assert.match(fn, /Nothing is deleted for anybody but you/);
  // The one genuinely irreversible part has to be stated, not buried.
  assert.match(fn, /cannot be brought back/);
});

test('the dialog describes a leave as an archive that stops receiving', () => {
  const at = modals.indexOf('function renderLeaveConversationModal(companyId, conversationId)');
  const fn = modals.slice(at, modals.indexOf('\n  function ', at + 10));
  assert.match(fn, /keeps the chat and every message in it/);
  assert.match(fn, /stays readable under Archived/);
  assert.match(fn, /You stop receiving messages here/);
  // A group and a one-to-one are different promises, so the wording differs.
  assert.match(fn, /const isDirect = conversation\.type === 'direct';/);
  assert.match(fn, /Message them again and a fresh chat starts/);
  assert.match(fn, /You will need to be added back to rejoin/);
  assert.match(fn, /data-action="confirm-leave-conversation"/);
  assert.match(fn, /data-action="cancel-leave-conversation"/);
});

test('chat details offers both, and neither once the chat is archived', () => {
  const at = modals.indexOf('function renderMessageDetailsModal(companyId, conversationId)');
  const fn = modals.slice(at, modals.indexOf('\n  function ', at + 10));
  assert.match(fn, /data-action="clear-conversation"/);
  assert.match(fn, /data-action="leave-conversation"/);
  assert.match(fn, /You stay in the chat, and the next message brings it back\./);
  assert.match(fn, /Moves it to Archived and stops new messages reaching you\./);
  // Leaving twice is meaningless, and a clear on an archive would hide the archive.
  assert.match(fn, /isConversationArchived\(conversation\.id\) \? `/);
});
