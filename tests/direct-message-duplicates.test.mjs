import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Clicking a person three times produced three identical direct chats. The "do we already
// have this conversation?" check reads local state, but state does not carry the new
// conversation until persistConversation has finished two network round-trips, so every
// click inside that window found nothing and started another one. Production held three
// conversations with the same pair of profiles, created 21:22:05.9, :06.8 and :07.0.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

function slice(from, to) {
  const at = main.indexOf(from);
  assert.notEqual(at, -1, `missing ${from}`);
  const end = main.indexOf(to, at + from.length);
  assert.notEqual(end, -1, `missing ${to}`);
  return main.slice(at, end);
}

test('a second caller joins the create already running instead of starting another', () => {
  const fn = slice('async function openOrCreateDirect(', '\nasync function startDirectMessageWithProfile');
  assert.match(fn, /const inFlight = directMessageInFlight\.get\(flightKey\);/);
  assert.match(fn, /const existingId = await inFlight;/, 'the joiner waits for the real id');
  assert.match(fn, /directMessageInFlight\.set\(flightKey, create\);/);
  // The slot must be released even when the create throws, or the pair is wedged for the
  // rest of the session and that chat can never be opened again.
  assert.match(fn, /\} finally \{[\s\S]{0,120}?directMessageInFlight\.delete\(flightKey\);/);
});

test('the key is the pair, so it matches whichever way round the two profiles arrive', () => {
  const fn = slice('function directMessagePairKey(', '\n/** Join the create');
  assert.match(fn, /\[String\(profileId\), String\(targetId\)\]\.sort\(\)\.join\('\|'\)/);
  assert.match(fn, /\$\{companyId\}:/, 'two companies must not share a key');
});

test('both starters go through the guard', () => {
  const direct = slice('async function startDirectMessageWithProfile(', '\nasync function createDirectConversation');
  assert.match(direct, /return openOrCreateDirect\(flightKey, companyId, goToMessages, \(\) => \(/);
  // Notes-to-self has the identical lookup-from-state shape, so it had the identical race.
  const self = slice('async function startSelfMessage(', '\nasync function createSelfConversation');
  assert.match(self, /directMessagePairKey\(companyId, profile\.id, profile\.id\)/);
  assert.match(self, /await openOrCreateDirect\(flightKey, companyId, true, \(\) => createSelfConversation\(companyId, profile\)\)/);
});

test('the guard sits after the existing-conversation check, not before it', () => {
  // An already-saved conversation must still short-circuit without touching the map.
  const fn = slice('async function startDirectMessageWithProfile(', '\nasync function createDirectConversation');
  assert.ok(
    fn.indexOf('return existing.id;') < fn.indexOf('openOrCreateDirect('),
    'the cheap local hit has to come first',
  );
});

test('both creators hand back the id so a joining caller can open the same chat', () => {
  const direct = slice('async function createDirectConversation(', '\nasync function startSelfMessage');
  assert.match(direct, /return conversation\.id;/);
  const self = slice('async function createSelfConversation(', '\nasync function saveMessageAccess');
  assert.match(self, /return conversation\.id;/);
});

// The race guard above only stops SIMULTANEOUS creates. A second, separate bug created a
// duplicate minutes later: the "do we already have this chat?" check read
// companyMessageConversations(), which is the DISPLAY list -- it applies state.messageQuery
// (the "Find a chat or person" box) and state.messageFilter (the All/Unread/Groups chips).
// With anything typed, or Unread active, the existing chat was filtered out of the check and
// a brand-new one was created. Production held five direct chats with the same person.

test('the uniqueness check reads every conversation, not the filtered view', () => {
  const direct = slice('async function startDirectMessageWithProfile(', '\nasync function createDirectConversation');
  assert.match(direct, /allCompanyConversations\(companyId\)\.find\(/);
  assert.ok(!/companyMessageConversations\(companyId\)\.find\(/.test(direct), 'the display list must not decide this');

  const self = slice('async function startSelfMessage(', '\nasync function createSelfConversation');
  assert.match(self, /allCompanyConversations\(companyId\)\.find\(/);
  assert.ok(!/companyMessageConversations\(companyId\)\.find\(/.test(self));
});

test('the unfiltered list applies neither the search box nor the filter chips', () => {
  const fn = slice('function allCompanyConversations(', '\nfunction companyMessageConversations');
  assert.match(fn, /conversation\.company_id === companyId && canAccessConversation\(conversation\)/);
  for (const leak of ['messageQuery', 'messageFilter', 'conversationUnreadCount']) {
    assert.ok(!fn.includes(leak), `${leak} would make a uniqueness check depend on the view`);
  }
});

test('the display list still filters, because that is its job', () => {
  const fn = slice('function companyMessageConversations(', '\nfunction companyMessageUnreadCount');
  assert.match(fn, /state\.messageQuery/);
  assert.match(fn, /state\.messageFilter/);
});

test('an unread badge does not change when somebody types in the chat search', () => {
  // Same root cause, smaller blast radius: counts were taken from the filtered view.
  const fn = slice('function companyMessageUnreadCount(', '\n}');
  assert.match(fn, /allCompanyConversations\(companyId\)/);
});

// The New direct message dialog is a THIRD entry point, and the one that was actually
// duplicating: saveDirectMessage built a conversation outright and never looked for an
// existing one, so "Start chat" with the same person always made another chat.

test('Start chat asks the starter instead of creating a conversation itself', () => {
  const fn = slice('async function saveDirectMessage(form)', '\n/**');
  assert.match(fn, /await startDirectMessageWithProfile\(companyId, targetId, \{ navigate: false \}\)/);
  // The tell-tale of the old version: minting an id and access rows right here.
  assert.ok(!/normalizeMessageConversation\(/.test(fn), 'it must not build its own conversation');
  assert.ok(!/normalizeMessageAccess\(/.test(fn), 'nor its own access rows');
  assert.ok(!/persistConversation\(/.test(fn), 'nor persist one directly');
});

test('the first message lands in whichever conversation that turned out to be', () => {
  const fn = slice('async function saveDirectMessage(form)', '\n/**');
  assert.match(fn, /const conversation = state\.messageConversations\.find\(\(item\) => item\.id === conversationId\)/);
  assert.match(fn, /if \(body && conversation\) await createMessageRecord\(conversation, body, \[\]\)/);
  assert.match(fn, /navigate\(companyPath\('messages', \{ conversation: conversationId \}/, 'and you land in it');
});

test('Start chat shows it is working, and a second click does nothing', () => {
  const fn = slice('async function saveDirectMessage(form)', '\n/**');
  assert.match(fn, /const done = beginSubmitting\(form, 'Starting…'\);/);
  // beginSubmitting returns null for an already-disabled button: that is the guard.
  assert.match(fn, /if \(!done\) return;/);
  // Released even when the send throws, or the dialog is stuck on "Starting…" forever.
  assert.match(fn, /\} finally \{[\s\S]{0,60}?done\(\);/);
});
