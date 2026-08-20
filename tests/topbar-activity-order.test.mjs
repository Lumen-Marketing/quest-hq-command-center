import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "make the activity draggable too so i can re arrange its order with the apps"
//
// Activity used to sit OUTSIDE the scrollable track, pinned in front of the apps, so the drag
// module never saw it. It is a tile in the strip now and goes through exactly the same gesture,
// the same drop and the same save the apps use -- the alternative was a second arrangement to
// keep in step with the first.
//
// It is not an app, though, so the order that comes back has to be read in two parts: which apps,
// and where Activity landed among them.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const strip = main.slice(main.indexOf('function wbWorkspaceHeader('), main.indexOf('function wbApplyAppOrder('));
const order = (() => {
  const from = main.indexOf('function wbApplyAppOrder(companyId, ids)');
  return main.slice(from, from + main.slice(from).search(/\r?\n\}/));
})();

test('Activity is inside the track, not pinned in front of it', () => {
  // The track is what the drag module binds to, so anything outside it cannot be dragged.
  assert.ok(!strip.includes('aria-label="Workspace apps">${homeTab}<div class="wb-topbar-apps"'),
    'the home tab no longer sits before the track');
  assert.ok(strip.includes('data-wb-topbar-apps tabindex="0"${canReorderApps ? \' data-wb-reorder="1"\' : \'\'}>${strip}'),
    'the track holds one ordered strip of tiles');
});

test('Activity carries a tile id, and one an app can never mint', () => {
  // Every app id comes from wbUid as `wb-<12 hex>`, so a bare word cannot collide with one.
  assert.match(main, /const WB_ACTIVITY_TILE = 'activity';/);
  assert.ok(strip.includes('data-wb-app-id="${WB_ACTIVITY_TILE}"'));
  assert.ok(strip.includes('draggable="false" data-wb-app-id="${WB_ACTIVITY_TILE}"'),
    'and draggable="false", or the browser\'s own link drag steals the gesture');
});

test('where it sits is remembered, and clamped when it cannot be trusted', () => {
  // An app deleted since the drag leaves an index past the end of the list.
  assert.ok(strip.includes('Math.max(0, Math.min(appTabs.length, Math.round(Number(workspace?.activityAt)) || 0))'));
  assert.ok(strip.includes('[...appTabs.slice(0, activityAt), homeTab, ...appTabs.slice(activityAt)]'));
});

test('the workspace normaliser keeps activityAt', () => {
  // Everything that function does not name is dropped on load, so an index it did not know about
  // would survive the drag and be gone by the next reload.
  assert.match(main, /activityAt: Math\.max\(0, Math\.round\(Number\(ws\.activityAt\)\) \|\| 0\),/);
});

test('the reported order is read as apps plus a position', () => {
  assert.ok(order.includes('const dropped = ids.indexOf(WB_ACTIVITY_TILE);'));
  assert.ok(order.includes('const appIds = ids.filter((id) => id !== WB_ACTIVITY_TILE);'));
  // Clamped on the way in as well as on the way out.
  assert.ok(order.includes('Math.max(0, Math.min(appIds.length, dropped))'));
  assert.ok(order.includes('workspace.activityAt = activityAt;'));
});

test('moving only Activity still counts as a move', () => {
  // The apps are in the same order after dragging Activity from first to last, so a no-op check
  // that only compared them would throw the drop away.
  assert.ok(order.includes('if (activityAt === wasAt && next.every((entry, at) => entry === entries[at])) return;'));
});

test('a strip with one app can still be reordered', () => {
  // It has two tiles now.
  assert.match(main, /const canReorderApps = can\('workspaces\.manage', companyId\) && apps\.length >= 1;/);
});
