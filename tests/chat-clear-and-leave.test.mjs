import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Deleting a chat and leaving a chat were one action. The single button removed your access
// row, so "clear this conversation for me" also silently dropped you out of the group.
//
//   cleared_at  DELETE CHAT -- hide what was said before now, stay in, keep receiving
//   left_at     LEAVE CHAT  -- stop receiving, keep the rest as a read-only archive
//
// Both are marks on your own access row. Neither touches a message, so nobody else's history
// changes either way.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const modals = readFileSync(join(root, 'src', 'messaging', 'chat-modals.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608081400_chat_clear_and_leave.sql'),
  'utf8',
);

test('the two intentions are two columns, not one delete', () => {
  assert.match(migration, /add column if not exists cleared_at timestamptz/);
  assert.match(migration, /add column if not exists left_at timestamptz/);
  // The old leave deleted the row outright, which could express neither idea.
  assert.ok(
    !/delete from public\.message_conversation_access/.test(migration),
    'nothing here may delete an access row',
  );
});

test('a cleared chat still delivers, and a left chat stops at the moment you left', () => {
  const fn = migration.slice(migration.indexOf('function app_private.chat_message_visible'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /message_created_at > coalesce\(a\.cleared_at, '-infinity'::timestamptz\)/);
  assert.match(body, /message_created_at <= coalesce\(a\.left_at, 'infinity'::timestamptz\)/);
  // bool_or, so being re-added after leaving restores the full view through the fresh row.
  assert.match(body, /select bool_or\(/);
  // No row of your own means access came from all_company, a role, or creating the chat --
  // you have neither cleared nor left it, so everything is visible.
  assert.match(body, /\), true\);/);
});

test('leaving is null while any of your access rows has no left_at', () => {
  const fn = migration.slice(migration.indexOf('function app_private.chat_left_at'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /case when bool_or\(a\.left_at is null\) then null else max\(a\.left_at\) end/);
});

test('the archive is not writable', () => {
  const insert = migration.slice(migration.indexOf('create policy "messages insert senders"'));
  assert.match(insert.slice(0, insert.indexOf(';')), /app_private\.chat_left_at\(conversation_id\) is null/);
  const attach = migration.slice(migration.indexOf('create policy "message attachments insert allowed"'));
  assert.match(attach.slice(0, attach.indexOf(';')), /app_private\.chat_left_at\(conversation_id\) is null/);
});

test('an attachment is judged by its message, not by itself', () => {
  // The two rows are written moments apart; a cleared chat that still listed its photographs
  // would not be cleared.
  const fn = migration.slice(migration.indexOf('function app_private.chat_attachment_visible'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /select m\.created_at from public\.messages m where m\.id = target_message_id/);
  const policy = migration.slice(migration.indexOf('create policy "message attachments select conversation access"'));
  assert.match(policy.slice(0, policy.indexOf(';')), /chat_attachment_visible\(conversation_id, message_id\)/);
});

test('the mark is written even when you never had an access row', () => {
  // Access can come from an all_company row, a role, or from creating the chat. The old
  // delete-the-row leave did nothing at all in those cases.
  const fn = migration.slice(migration.indexOf('function app_private.mark_own_chat_access'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /if v_touched = 0 then/);
  assert.match(body, /insert into public\.message_conversation_access/);
  assert.match(body, /raise exception 'You are not in this conversation'/, 'a stranger cannot mark a chat');
});

test('both procedures are reachable only by a signed-in caller', () => {
  assert.match(migration, /revoke all on function public\.clear_message_conversation\(uuid\) from public, anon;/);
  assert.match(migration, /revoke all on function public\.leave_message_conversation\(uuid\) from public, anon;/);
  assert.match(migration, /grant execute on function public\.clear_message_conversation\(uuid\) to authenticated;/);
  assert.match(migration, /grant execute on function public\.leave_message_conversation\(uuid\) to authenticated;/);
});

test('the client mirrors the same window the database enforces', () => {
  const fn = main.slice(main.indexOf('function messageInMyChatWindow(conversationId, createdAt)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(!rows\.length\) return true;/);
  assert.match(body, /\(!row\.cleared_at \|\| at > Date\.parse\(row\.cleared_at\)\)/);
  assert.match(body, /\(!row\.left_at \|\| at <= Date\.parse\(row\.left_at\)\)/);
  assert.match(body, /rows\.some\(/, 'a re-added member sees everything again');
  assert.match(main, /\.filter\(\(message\) => messageInMyChatWindow\(conversationId, message\.created_at\)\)/);
});

test('a deleted chat leaves the inbox until there is something to show again', () => {
  // Leaving the emptied thread in the list was wrong: "delete chat" means the thread goes.
  // You are still in the group, so the next message brings it back with only that message.
  const fn = main.slice(main.indexOf('function isConversationClearedEmpty(conversationId)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(!rows\.some\(\(row\) => row\.cleared_at\)\) return false;/);
  assert.match(body, /return conversationMessages\(conversationId\)\.length === 0;/);
  assert.match(main, /\.filter\(\(conversation\) => !isConversationHidden\(conversation\.id, Boolean\(query\)\)\)/);
});

test('a chat that was never deleted is not hidden for being empty', () => {
  // A brand-new group has no messages either, and hiding that would hide the thing you
  // just made. The watermark is what distinguishes them.
  const fn = main.slice(main.indexOf('function isConversationClearedEmpty(conversationId)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.ok(
    body.indexOf('cleared_at') < body.indexOf('length === 0'),
    'the delete has to be established before emptiness is even considered',
  );
});

test('searching still finds a deleted chat that is still live', () => {
  // Otherwise a group nobody has posted in since is unreachable: it is not in the list, and
  // there is no other way back to it.
  const fn = main.slice(main.indexOf('function isConversationHidden(conversationId, hasQuery)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(!isConversationClearedEmpty\(conversationId\)\) return false;/);
  assert.match(body, /return !hasQuery;/);
});

test('deleting an archived chat is final, search included', () => {
  // You already left it, so no message can arrive to bring it back, and there is no route
  // into it worth keeping open. A search result that opens an empty archive is just noise.
  const fn = main.slice(main.indexOf('function isConversationHidden(conversationId, hasQuery)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(isConversationArchived\(conversationId\)\) return true;/);
  assert.ok(
    body.indexOf('isConversationArchived') < body.indexOf('return !hasQuery'),
    'the archived case has to be settled before the search escape hatch applies',
  );
});

test('an archived chat can be deleted, and says that it will not come back', () => {
  const at = modals.indexOf('function renderMessageDetailsModal(companyId, conversationId)');
  const fn = modals.slice(at, modals.indexOf('\n  function ', at + 10));
  const archivedBranch = fn.slice(fn.indexOf('isConversationArchived(conversation.id) ? `'), fn.indexOf('` : `'));
  assert.match(archivedBranch, /data-action="clear-conversation"/);
  assert.match(archivedBranch, /Discards the archive\. Nothing can bring this one back/);
  // Leaving twice is meaningless, so that button stays out of the archived branch.
  assert.ok(!/data-action="leave-conversation"/.test(archivedBranch));

  const dialog = modals.slice(modals.indexOf('function renderLeaveConversationModal'));
  assert.match(dialog, /const clearPoints = archived/);
  assert.match(dialog, /This archive disappears for good\./);
  assert.match(dialog, /disappears from Archived\./);
  // The reassuring line would be a lie here.
  const archivedPoints = dialog.slice(dialog.indexOf('const clearPoints = archived'), dialog.indexOf('      : ['));
  assert.ok(!/comes back to your inbox/.test(archivedPoints));
});

test('the toast does not promise a return that cannot happen', () => {
  const fn = main.slice(main.indexOf('async function clearConversation(conversationId)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /isConversationArchived\(conversationId\)\s*[\r\n]?\s*\? 'Archived chat deleted\.'/);
});

test('deleting a chat closes the thread it just removed', () => {
  const fn = main.slice(main.indexOf('async function clearConversation(conversationId)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(state\.selectedConversationId === conversationId\) state\.selectedConversationId = '';/);
  assert.match(body, /it comes back with the next message/);
});

test('an archived chat leaves the working list and stops nagging', () => {
  assert.match(main, /\.filter\(\(conversation\) => \(filter === 'archived'\) === isConversationArchived\(conversation\.id\)\)/);
  assert.match(main, /\['all', 'unread', 'groups', 'direct', 'archived'\]\.map/);
  const unread = main.slice(main.indexOf('function conversationUnreadCount(conversationId'));
  assert.match(unread.slice(0, unread.search(/\r?\n\}/)), /if \(isConversationArchived\(conversationId\)\) return 0;/);
});

test('an archived thread offers no composer', () => {
  const fn = main.slice(main.indexOf('function renderMessageThread(companyId, conversation)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const archived = isConversationArchived\(conversation\.id\);/);
  assert.match(body, /const canSendMessage = can\('messages\.send', companyId\) && !archived;/);
  assert.match(body, /It is kept as an archive of what was said up to then\./);
});

test('the clear and the leave share one write path and differ only in the mark', () => {
  const fn = main.slice(main.indexOf('async function markChatAccess(conversationId, mode)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const rpc = mode === 'clear' \? 'clear_message_conversation' : 'leave_message_conversation';/);
  assert.match(body, /const column = mode === 'clear' \? 'cleared_at' : 'left_at';/);
  // The server's clock, so the local window matches the one RLS will apply.
  assert.match(body, /if \(typeof result\.data === 'string' && result\.data\) at = result\.data;/);
  // A refused call must change nothing locally.
  assert.match(body, /return null;/);
  const clear = main.slice(main.indexOf('async function clearConversation(conversationId)'));
  assert.match(clear.slice(0, clear.search(/\r?\n\}/)), /You are still in it — it comes back with the next message\./);
  const leave = main.slice(main.indexOf('async function leaveConversation(conversationId)'));
  assert.match(leave.slice(0, leave.search(/\r?\n\}/)), /It is in Archived\./);
});
