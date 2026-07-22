import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('the calls plugin is registered and maps to the calls module', () => {
  assert.match(main, /\{ id: 'calls', label: 'Calls',[^}]*module_ids: \['calls'\]/);
});

test('the calls module is registered as live behind an already-granted permission', () => {
  assert.match(main, /\{ id: 'calls', group: '[^']+', label: 'Calls'[^}]*status: 'live'[^}]*permission: 'team\.view'/);
});

test('the module reuses an existing permission instead of inventing one', () => {
  // 'calls.view' would need seeding into role_permissions before anyone could
  // open the module.
  assert.doesNotMatch(main, /'calls\.view'/);
});

test('the calls module appears in the Operations navigation group', () => {
  // Deliberately not the Review group: its exact contents are pinned as
  // stakeholder-approved IA by sidebar-navigation-static.test.mjs, and the
  // module registry already files Calls under Operations.
  assert.match(main, /\{ label: 'Operations', ids: \[[^\]]*'calls'\] \}/);
  assert.match(main, /\{ label: 'Review', ids: \['analytics', 'users', 'calendar'\] \}/);
});

test('team.view resolves to the calls plugin in the browser as well as the database', () => {
  assert.match(main, /if \(clean === 'team\.view'\) return \['reporting', 'calls'\];/);
});

test('the router dispatches the calls section', () => {
  assert.match(main, /if \(route\.section === 'calls'\) return renderCallsPage\(route, companyId\);/);
});

test('the page renderer is synchronous, matching every other page renderer', () => {
  // The router does `return renderCallsPage(...)` and expects markup, not a
  // promise. An async renderer would paint "[object Promise]".
  assert.doesNotMatch(main, /async function renderCallsPage/);
  assert.match(main, /^function renderCallsPage\(route, companyId\) \{/m);
});

test('aggregates come from the RPC rather than being counted in the browser', () => {
  assert.match(main, /ringcentral_conversation_stats/);
  assert.doesNotMatch(main, /from\('ringcentral_calls'\)/);
});

test('the live board polls the presence endpoint and can stop itself', () => {
  assert.match(main, /\/api\/ringcentral-presence/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /clearInterval\(callsPresenceTimer\)/);
});

test('polling stops when the user navigates away from the module', () => {
  assert.match(main, /state\.route\?\.section !== 'calls'/);
});

test('the page states the accuracy limit of the status timer', () => {
  assert.match(main, /measured from when this dashboard first saw the status/i);
});

test('a member with no matching extension is told why the table is empty', () => {
  assert.match(main, /couldn't match you to a RingCentral extension/i);
});

test('the sixty second threshold is labelled in the UI, not recomputed in the browser', () => {
  assert.match(main, /Conversations 60s\+/);
  assert.doesNotMatch(main, /duration_seconds >= 60/);
});

test('a non-admin is not shown a broken live board', () => {
  assert.match(main, /forbidden/);
});

test('the module ships styles', () => {
  assert.match(styles, /\.calls-board/);
  assert.match(styles, /\.calls-status-dot/);
});
