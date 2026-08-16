import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PRESENCE_STALE_MS, isOnline, onlineProfileIds, presenceChannelName, presenceRing, selfPresence,
} from '../src/messaging/presence.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const NOW = 1_700_000_000_000;
const at = (offset) => NOW - offset;

test('presence state flattens to the set of people online', () => {
  const online = onlineProfileIds({
    'p1': [{ profile_id: 'p1', at: at(0) }],
    'p2': [{ profile_id: 'p2', at: at(1000) }],
  }, NOW);
  assert.deepEqual([...online].sort(), ['p1', 'p2']);
});

test('several tabs are one person, not three', () => {
  const online = onlineProfileIds({
    'p1': [{ profile_id: 'p1', at: at(0) }, { profile_id: 'p1', at: at(50) }, { profile_id: 'p1', at: at(90) }],
  }, NOW);
  assert.equal(online.size, 1);
});

// Realtime drops entries on disconnect, but a sleeping laptop can leave one behind until
// the socket times out. Showing someone as online when they are not is worse than showing
// them offline a little early.
test('a stale entry is not counted as online', () => {
  const state = { 'p1': [{ profile_id: 'p1', at: at(PRESENCE_STALE_MS + 1000) }] };
  assert.equal(onlineProfileIds(state, NOW).size, 0);
  const fresh = { 'p1': [{ profile_id: 'p1', at: at(PRESENCE_STALE_MS - 1000) }] };
  assert.equal(onlineProfileIds(fresh, NOW).size, 1);
});

test('an entry with no usable timestamp still counts, because the socket is open', () => {
  assert.equal(onlineProfileIds({ 'p1': [{ profile_id: 'p1' }] }, NOW).size, 1);
  assert.equal(onlineProfileIds({ 'p1': [{ profile_id: 'p1', at: 'nonsense' }] }, NOW).size, 1);
});

test('malformed or empty presence state never throws', () => {
  assert.equal(onlineProfileIds(null).size, 0);
  assert.equal(onlineProfileIds({}).size, 0);
  assert.equal(onlineProfileIds({ p1: null }).size, 0);
  assert.equal(onlineProfileIds({ p1: [null, {}, { at: 1 }] }).size, 0);
});

test('what this client publishes is an id and a time, nothing else', () => {
  // A presence channel is readable by anyone who joins it, so it must not carry a name,
  // an email or anything else about the person.
  const payload = selfPresence('p1', NOW);
  assert.deepEqual(Object.keys(payload).sort(), ['at', 'profile_id']);
  assert.equal(payload.profile_id, 'p1');
});

test('presence is scoped per company, so you only see colleagues', () => {
  assert.equal(presenceChannelName('acme'), 'quest-presence-acme');
  assert.notEqual(presenceChannelName('acme'), presenceChannelName('other'));
});

test('your own avatar reads as online without waiting for the round trip', () => {
  const online = new Set(['p2']);
  assert.equal(isOnline(online, 'me', 'me'), true, 'you are demonstrably here');
  assert.equal(isOnline(online, 'p2', 'me'), true);
  assert.equal(isOnline(online, 'p3', 'me'), false);
  assert.equal(isOnline(online, '', 'me'), false);
});

test('the ring reports a label, not just a colour', () => {
  assert.deepEqual(presenceRing(true), { className: 'is-online', label: 'Online' });
  assert.deepEqual(presenceRing(false), { className: 'is-offline', label: 'Offline' });
});

// --- wiring -------------------------------------------------------------------

test('presence rides the existing realtime connection and is torn down with it', () => {
  // A last_seen_at column would mean every client writing to the database every few
  // seconds, forever. Check for an actual write, not the word — it appears in the comment
  // explaining why this approach was not taken.
  assert.ok(
    !/update\(\{[^}]*last_seen_at|last_seen_at:\s/.test(main),
    'presence should cost no periodic writes',
  );
  assert.match(main, /ensurePresenceChannel\(activeCompanyId\(\)\);/);
  const teardown = main.slice(main.indexOf('function teardownGlobalRealtime()'));
  assert.match(teardown.slice(0, teardown.indexOf('\n}\n')), /teardownPresence\(\);/);
});

test('a presence event only re-renders when the set actually changed', () => {
  const fn = main.slice(main.indexOf('function ensurePresenceChannel('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  // sync fires on every join and leave anywhere in the company.
  assert.match(body, /const changed = next\.size !== state\.onlineProfileIds\.size/);
  assert.match(body, /if \(!changed\) return;/);
  assert.match(body, /channel\.track\(selfPresence\(profileId\)\)/);
});

test('a presence change never re-renders over somebody who is typing', () => {
  // A render rebuilds the page from state, and a half-filled form lives in the DOM. A colleague
  // opening the app in another tab used to wipe whatever was typed into an open form -- which
  // nothing the typist did could explain, so it read as random.
  const fn = main.slice(main.indexOf('function ensurePresenceChannel('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  // The same terms the realtime refresh already defers on, rather than a second opinion.
  assert.match(body, /if \(renderWouldInterrupt\(\)\)/);
  const shared = main.slice(main.indexOf('function renderWouldInterrupt()'));
  assert.match(shared.slice(0, shared.indexOf('\n}\n')), /editableFocused: anEditableIsFocused\(\)/);
  assert.match(body, /state\.presenceRetry = setTimeout\(applyState, 1500\)/);
  // The set must NOT be committed on the deferred path: leaving the old one in place is what
  // keeps `changed` true, so the retry still has something to do rather than going quiet.
  const deferred = body.slice(body.indexOf('shouldDeferRealtimeRefresh'), body.indexOf('state.onlineProfileIds = next;'));
  assert.ok(!/state\.onlineProfileIds = next/.test(deferred), 'the new set is committed only when it is actually rendered');
  // And the pending retry dies with the channel.
  const teardown = main.slice(main.indexOf('function teardownPresence()'));
  assert.match(teardown.slice(0, teardown.indexOf('\n}\n')), /clearTimeout\(state\.presenceRetry\)/);
});

test('the ring appears on direct chats and on message senders', () => {
  assert.match(main, /withPresenceRing\(renderAvatar\(messageSenderProfile\(counterpartId\)[\s\S]{0,80}counterpartId\)/);
  assert.match(main, /withPresenceRing\(renderAvatar\(sender, 'avatar message-avatar'\), message\.sender_profile_id\)/);
});

test('a group conversation gets no ring, because one ring cannot describe several people', () => {
  const fn = main.slice(main.indexOf('function renderConversationIcon('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  const groupBranch = body.slice(0, body.indexOf('const counterpartId'));
  assert.ok(!/withPresenceRing/.test(groupBranch));
});

test('the ring does not change the avatar box, and does not rely on colour alone', () => {
  // box-shadow rather than border: a border would resize the element and shove the
  // surrounding layout every time someone connects or disconnects.
  assert.match(css, /\.presence-ring\.is-online \{[^}]*box-shadow:/s);
  assert.match(css, /\.presence-ring\.is-offline \{[^}]*box-shadow:/s);
  assert.ok(!/\.presence-ring\.is-online \{[^}]*border:/s.test(css));
  // A corner dot for anyone who cannot separate green from grey.
  assert.match(css, /\.presence-ring\.is-online::after \{/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.presence-ring \{ transition: none; \}/);
});
