import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderChat, renderDock, renderLauncher, useHelpIndex } from '../src/messaging/dock.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

const TOPICS = [
  { id: 'create-task', title: 'Create a task', answer: 'Open Tasks and add one.' },
  { id: 'quotes', title: 'Create a quote', answer: 'Quotes live under Quest CRM.' },
];
useHelpIndex((q) => TOPICS.filter((t) => t.title.toLowerCase().includes(String(q).toLowerCase())), TOPICS);

const ctx = (over = {}) => ({
  selfId: 'me',
  conversations: () => [{ id: 'c1', title: 'Alkeith', company_id: 'acme' }],
  lastMessage: () => ({ body: 'On my way' }),
  unreadFor: () => 3,
  members: () => [
    { id: 'me', name: 'Me', role: 'owner', color: '#111' },
    { id: 'u2', name: 'Jesus Ramirez', role: 'member', color: '#222' },
  ],
  onlineIds: () => new Set(['u2']),
  conversation: (id) => (id === 'c1' ? { id: 'c1', title: 'Alkeith', company_id: 'acme' } : null),
  messages: () => [
    { body: 'Hi', sender_profile_id: 'u2', created_at: '2026-08-02T10:00:00Z' },
    { body: 'Hello', sender_profile_id: 'me', created_at: '2026-08-02T10:01:00Z' },
  ],
  canSend: () => true,
  fullHref: (id) => `/messages?conversation=${id}`,
  memberName: (id) => (id === 'u2' ? 'Jesus Ramirez' : 'Me'),
  timeAgo: () => '2m ago',
  initials: (n) => n.slice(0, 2).toUpperCase(),
  titleCase: (s) => s,
  ...over,
});
const dock = (over = {}) => ({ open: true, tab: 'recent', peopleQuery: '', guideQuery: '', conversationId: '', ...over });

// --- the three things the launcher offers ------------------------------------------

test('recent conversations can be opened, with their unread count', () => {
  const html = renderDock(dock(), ctx());
  assert.match(html, /data-action="msgdock-open-conversation" data-conversation-id="c1"/);
  assert.match(html, /Alkeith/);
  assert.match(html, /On my way/, 'the last message previews the thread');
  assert.match(html, /msgdock-unread[^>]*>3</);
});

test('a person can be picked to message directly', () => {
  const html = renderDock(dock({ tab: 'people' }), ctx());
  assert.match(html, /data-action="msgdock-message-person" data-profile-id="u2"/);
  assert.match(html, /Jesus Ramirez/);
});

test('you are not offered as someone to message', () => {
  // Messaging yourself has its own entry point; listing it here reads like a mistake.
  const html = renderDock(dock({ tab: 'people' }), ctx());
  assert.ok(!/data-profile-id="me"/.test(html));
});

test('presence shows who is reachable right now', () => {
  assert.match(renderDock(dock({ tab: 'people' }), ctx()), /msgdock-online/);
  // No presence connection yet is not an error — it just means nobody shows as online.
  assert.ok(!/msgdock-online/.test(renderDock(dock({ tab: 'people' }), ctx({ onlineIds: () => new Set() }))));
});

test('searching people filters the list and says so when nothing matches', () => {
  assert.match(renderDock(dock({ tab: 'people', peopleQuery: 'jesus' }), ctx()), /Jesus Ramirez/);
  const none = renderDock(dock({ tab: 'people', peopleQuery: 'zzz' }), ctx());
  assert.ok(!/Jesus Ramirez/.test(none));
  assert.match(none, /Nobody matches/);
});

// --- the guide ---------------------------------------------------------------------

test('the guide suggests topics before anything is typed', () => {
  // An empty box gives no clue what this understands; the topic list is the answer.
  const html = renderDock(dock({ tab: 'guide' }), ctx());
  assert.match(html, /Create a task/);
  assert.match(html, /Ask about anything in Questbase/);
});

test('the guide answers from the curated index', () => {
  const html = renderDock(dock({ tab: 'guide', guideQuery: 'quote' }), ctx());
  assert.match(html, /Quotes live under Quest CRM/);
  assert.ok(!/Create a task/.test(html), 'unrelated topics should drop out');
});

test('no answer is an honest outcome, and it says where answers come from', () => {
  // Grounded, not generative: the failure mode is "nothing on that", never an invented
  // feature. Saying so is what stops someone reading silence as a product gap.
  const html = renderDock(dock({ tab: 'guide', guideQuery: 'teleport' }), ctx());
  assert.match(html, /Nothing on .teleport. yet/);
  assert.match(html, /answers from Questbase’s built-in help/);
});

// --- the floating conversation -----------------------------------------------------

test('an open conversation floats instead of navigating', () => {
  const html = renderDock(dock({ conversationId: 'c1' }), ctx());
  assert.match(html, /msgdock-chat/);
  assert.match(html, /data-action="msgdock-back"/, 'and can return to the launcher');
  // Escalating to the full Messages page stays available.
  assert.match(html, /href="\/messages\?conversation=c1"/);
});

test('your messages are distinguished from theirs', () => {
  const html = renderDock(dock({ conversationId: 'c1' }), ctx());
  assert.match(html, /msgdock-msg mine/);
  assert.match(html, /msgdock-msg-who">Jesus Ramirez/);
  // Your own name above your own message is noise.
  assert.equal((html.match(/msgdock-msg-who/g) || []).length, 1);
});

test('a conversation that vanished falls back to the launcher', () => {
  // Deleted, or access removed, while the dock had it open.
  const html = renderDock(dock({ conversationId: 'gone' }), ctx());
  assert.ok(!/msgdock-chat/.test(html));
  assert.match(html, /msgdock-panel/);
});

test('the composer posts through the app’s own send path', () => {
  // A second send path would be a second set of permission, attachment and double-send
  // rules to keep in step.
  const html = renderDock(dock({ conversationId: 'c1' }), ctx());
  assert.match(html, /data-message-form data-conversation-id="c1"/);
  assert.match(html, /name="body"/);
});

test('someone who cannot send is told, not given a dead box', () => {
  const html = renderDock(dock({ conversationId: 'c1' }), ctx({ canSend: () => false }));
  assert.ok(!/data-message-form/.test(html));
  assert.match(html, /cannot send messages/);
});

test('names and messages from users are escaped', () => {
  const html = renderDock(dock({ conversationId: 'c1' }), ctx({
    messages: () => [{ body: '<img src=x onerror=alert(1)>', sender_profile_id: 'u2', created_at: '' }],
  }));
  assert.ok(!html.includes('<img'), html.slice(0, 200));
});

// --- wiring ------------------------------------------------------------------------

test('only the button is eager; the panel is fetched on demand', () => {
  assert.ok(!/^import .*messaging\/dock\.js/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/messaging\/dock\.js'\)/);
  // The button renders before the module exists, so the dock is reachable immediately.
  const render = fn('renderMessageDock');
  assert.match(render, /msgdock-fab/);
  assert.match(render, /if \(!dock\.open\) return/);
});

test('the guide index is shared with the command palette, not imported twice', () => {
  assert.match(main, /dock\.useHelpIndex\(help\.searchHelp, help\.HELP_TOPICS\)/);
  assert.match(main, /import\('\.\/assistant\/help-index\.js'\)/);
});

test('the dock only appears inside a company workspace', () => {
  // There is nobody to message on the landing, login or public pages.
  assert.match(fn('renderMessageDock'), /if \(!state\.route \|\| state\.route\.name !== 'company'\) return '';/);
});

test('unread is surfaced on the button itself', () => {
  const render = fn('renderMessageDock');
  assert.match(render, /companyMessageUnreadCount\(activeCompanyId\(\)\)/);
  assert.match(render, /msgdock-fab-badge/);
  // Hidden while open, where the list already shows it per conversation.
  assert.match(render, /\$\{!dock\.open && unread \?/);
});

test('closing returns to the launcher rather than reopening a finished conversation', () => {
  const at = main.indexOf("action === 'msgdock-toggle'");
  const body = main.slice(at, at + 700);
  assert.match(body, /open: false, conversationId: ''/);
});

test('starting a DM reuses the app’s own conversation starter', () => {
  // Otherwise the dock would create duplicate threads alongside the Messages page.
  const at = main.indexOf("action === 'msgdock-message-person'");
  const body = main.slice(at, at + 900);
  assert.match(body, /startDirectMessageWithProfile\(activeCompanyId\(\), profileId, \{ navigate: false \}\)/);
  assert.match(body, /requirePermission\('messages\.send'/);
});

test('opening a conversation marks it read', () => {
  const at = main.indexOf("action === 'msgdock-open-conversation'");
  assert.match(main.slice(at, at + 400), /markConversationRead\(node\.dataset\.conversationId\)/);
});

test('the dock is pinned to the corner without blocking the page behind it', () => {
  const block = css.slice(css.indexOf('/* ---- Floating message dock'));
  assert.match(block, /\.msgdock \{[^}]*position: fixed;/s);
  // The wrapper spans the panel, so only its children may catch clicks.
  assert.match(block, /\.msgdock \{[^}]*pointer-events: none;/s);
  assert.match(block, /\.msgdock > \* \{\s*pointer-events: auto;/s);
  // Clears the home indicator on phones.
  assert.match(block, /env\(safe-area-inset-bottom\)/);
});

test('the message launcher clears the mobile bottom navigation', () => {
  const block = css.slice(css.indexOf('/* ---- Floating message dock'));
  assert.match(block, /@media \(max-width: 980px\) \{[\s\S]*?\.msgdock \{[^}]*bottom: calc\(72px \+ env\(safe-area-inset-bottom\)\);/);
});

// --- staying put -------------------------------------------------------------------

const slice = (start, end) => {
  const at = main.indexOf(start);
  assert.notEqual(at, -1, `missing: ${start}`);
  return main.slice(at, main.indexOf(end, at));
};

test('picking someone opens the thread in the dock instead of navigating away', () => {
  // The dock exists so you can message without leaving what you were doing; jumping to
  // the Messages page throws away exactly the surface it was meant to preserve.
  const handler = slice("action === 'msgdock-message-person'", '\n  if (action ===');
  assert.match(handler, /startDirectMessageWithProfile\(activeCompanyId\(\), profileId, \{ navigate: false \}\)/);
  assert.match(handler, /\.then\(\(conversationId\) =>/, 'the id comes back rather than being guessed from state');
  assert.ok(!/navigate\(/.test(handler));
});

test('the starter returns the conversation id on both paths', () => {
  // Existing thread and freshly created one — the caller cannot tell them apart, and
  // should not have to read state.selectedConversationId to find out what happened.
  const fn = slice('async function startDirectMessageWithProfile(', '\nasync function startSelfMessage');
  assert.match(fn, /const goToMessages = options\.navigate !== false;/);
  assert.match(fn, /return existing\.id;/);
  assert.match(fn, /return conversation\.id;/);
  // Both navigations are gated; neither is unconditional any more. (A third path — joining
  // a create already in flight — navigates from openOrCreateDirect, outside this slice.)
  assert.equal((fn.match(/if \(goToMessages\) navigate\(/g) || []).length, 2);
  assert.ok(!/^\s{2}navigate\(companyPath\('messages'/m.test(fn), 'no ungated navigate left');
});

test('creating a group chat still navigates, and knows nothing about goToMessages', () => {
  // A global find-and-replace put the dock's changes in here first: saveMessageGroup has
  // no such variable, so it threw the moment anyone created a group chat.
  // Bounded by the function's own closing brace: messageAccessFromForm is ~10,000 lines
  // further down, so slicing to it would sweep in the DM starter and pass vacuously.
  // saveMessageGroup is now just the double-submit guard; the work moved into
  // createMessageGroup so the guard can wrap it in a try/finally.
  const at = main.indexOf('async function createMessageGroup(form, companyId) {');
  const fn = main.slice(at, main.indexOf('\n}\n', at));
  assert.ok(!/goToMessages/.test(fn), 'this function has no such variable');
  assert.match(fn, /\n  navigate\(companyPath\('messages', \{ conversation: conversation\.id \}, companyId\), \{ replace: true \}\);/);
  assert.match(fn, /if \(!saved\) return;/, 'and returns nothing, as its callers expect');
});

test('the dock hides on Messages, where it would cover the Send button', () => {
  // Its fixed button lands exactly on the conversation composer's send control, and the
  // dock is a shortcut to that page anyway.
  assert.match(fn('renderMessageDock'), /if \(state\.route\.section === 'messages'\) return '';/);
});
