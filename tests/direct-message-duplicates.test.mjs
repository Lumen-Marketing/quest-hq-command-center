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
