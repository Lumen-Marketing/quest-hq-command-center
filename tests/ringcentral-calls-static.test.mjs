import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { WORKSPACE_PLUGIN_REGISTRY } from '../src/workspaces/plugin-catalog.js';

// The calls page and its home widget are fetched on demand now; same surface, read as one.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/ops/calls-page.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/ops/calls-widget.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/home/widget-registry.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('the calls plugin is registered and maps to the calls module', () => {
  const plugin = WORKSPACE_PLUGIN_REGISTRY.find(({ id }) => id === 'calls');
  assert.ok(plugin, 'Expected the calls plugin in the workspace catalog');
  assert.equal(plugin.label, 'Calls');
  assert.deepEqual(plugin.module_ids, ['calls']);
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
  assert.match(main, /\{ label: 'Review', ids: \['calendar'\] \}/);
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

test('polling stops when the user navigates away from both surfaces', () => {
  assert.match(main, /function callsSurfaceVisible\(\)/);
  assert.match(main, /if \(!callsSurfaceVisible\(\)\) \{ stopCallsPresencePolling\(\); return; \}/);
});

test('the dashboard carries a Calls widget on the executive, sales and ops views', () => {
  assert.match(main, /title: 'Phones right now'/);
  assert.match(main, /exec: \['calls',/);
  assert.match(main, /ops: \['calls',/);
  assert.match(main, /render: \(\) => renderCallsWidget\(companyId\)/);
});

test('the Calls widget carries its own date filter with a custom range', () => {
  // The widget no longer borrows the global dashboard range; it has its own
  // Today / Last 7 days / Last 30 days / Custom control.
  assert.match(main, /CALLS_WIDGET_RANGE_OPTIONS = \[\.\.\.CALLS_RANGE_OPTIONS, \['custom', 'Custom'\]\]/);
  assert.match(main, /data-action="calls-widget-range"/);
  assert.match(main, /action === 'calls-widget-range'/);
  // The custom From–To pickers feed state and, when both are set, a real key.
  assert.match(main, /data-calls-widget-custom="from"/);
  assert.match(main, /data-calls-widget-custom="to"/);
  assert.match(main, /`custom:\$\{custom\.from\}\|\$\{custom\.to\}`/);
  // callsRangeBounds must turn that key into real timestamps covering both days.
  assert.match(main, /rangeKey\.startsWith\('custom:'\)/);
  assert.match(main, /T23:59:59\.999/);
});

test('the widget conversations tile shows a real > sign, not a literal &gt;', () => {
  // dashboardMetricTile escapes its label, so the source must pass a plain '>'
  // ('Calls > 60s'); passing 'Calls &gt; 60s' double-escapes to a visible &gt;.
  assert.match(main, /dashboardMetricTile\('ti-message', conversations, 'Calls > 60s'/);
  assert.doesNotMatch(main, /dashboardMetricTile\([^)]*'Calls &gt; 60s'/);
});

test('an unapplied migration reads as not connected, never as zero calls', () => {
  // "No calls" and "the table does not exist" are different facts and must not
  // render the same way.
  assert.match(main, /unavailable: Boolean\(stats\.error\)/);
  assert.match(main, /RingCentral isn't connected yet/);
});

test('a non-JSON response from the presence route is treated as not connected', () => {
  // A plain `vite dev` server answers /api/* with index.html.
  assert.match(main, /response\.status === 503 \|\| !isJson/);
});

test('the page states the accuracy limit of the status timer', () => {
  assert.match(main, /measured from when this dashboard first saw the status/i);
});

test('a member with no matching extension is told why the table is empty', () => {
  assert.match(main, /couldn't match you to a RingCentral extension/i);
});

test('the sixty second threshold is labelled in the UI, not recomputed in the browser', () => {
  assert.match(main, /Calls &gt; 60s|Calls over 60 seconds/);
  assert.doesNotMatch(main, /duration_seconds >= 60/);
});

test('a non-admin is not shown a broken live board', () => {
  assert.match(main, /forbidden/);
});

test('the module ships styles', () => {
  assert.match(styles, /\.calls-board/);
  assert.match(styles, /\.calls-status-dot/);
});

test('a widget added after someone customised their dashboard still surfaces', () => {
  // A saved layout used to replace DASHBOARD_WIDGET_DEFAULTS outright, so every
  // future widget was invisible to existing users.
  assert.match(main, /dashboardSeenWidgets/);
  assert.match(main, /const introductions = fallback\.filter\(\(id\) => !seen\.has\(id\) && !saved\.includes\(id\)\)/);
});

test('removing a widget sticks, because saving records what has been offered', () => {
  assert.match(main, /DASHBOARD_SEEN_WIDGETS_CACHE_KEY/);
  const start = main.indexOf('function saveDashboardWidgetLayout');
  const body = main.slice(start, main.indexOf('\nfunction ', start + 1));
  assert.ok(body.includes('dashboardSeenWidgets'), 'saveDashboardWidgetLayout must record seen widgets');
  assert.ok(body.includes('writeJson(DASHBOARD_SEEN_WIDGETS_CACHE_KEY'), 'seen widgets must be persisted');
});

test('presence is not fetched on every render (guards against the rate-limit loop)', () => {
  // loadCallsPresence calls render(); if ensureCallsData also fetched presence,
  // render -> fetch -> render would hammer the endpoint into 429s. ensureCallsData
  // must only start the poller, never queue its own presence load.
  const start = main.indexOf('function ensureCallsData');
  const body = main.slice(start, main.indexOf('\nfunction ', start + 1));
  assert.ok(!body.includes('loadCallsPresence('), 'ensureCallsData must not call loadCallsPresence directly');
  assert.ok(body.includes('ensureCallsPresencePolling('), 'ensureCallsData must start the poller');
});
