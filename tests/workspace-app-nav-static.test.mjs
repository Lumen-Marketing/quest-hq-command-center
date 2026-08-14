import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { boardColumns, pipelineField } from '../src/workspace/pipeline-core.js';

// Apps built in the App Builder appear in the deck under Workspace, with the options of
// their own status field nested underneath. The grouping itself is pipeline-core's, already
// tested; what is checked here is that the deck reuses it rather than counting again, and
// that navigation stays read-only.

// The Items tab, where the deck stage narrows the rows, is its own fetched-on-demand module
// now. The behaviour pinned below has not moved, only the file it lives in.
const main = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/workspace/items-view.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const slice = (name) => main.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0] || '';

test('apps sit directly beneath the Workspaces row that built them', () => {
  // The deck reads the way the product does: the builder, then what it produced. Appending
  // them put an app seven rows down, below every unrelated module in the group.
  assert.match(main, /const at = visible\.findIndex\(\(module\) => module\.id === 'workspaces'\);/);
  assert.match(main, /items\.splice\(at \+ 1, 0, \.\.\.navItemsForApps\(route, companyId\)\);/);
  assert.match(main, /\{ label: 'Workspace', ids: \['workspaces',/);
});

test('a hidden Workspaces row does not send apps to a negative index', () => {
  // findIndex returns -1 when the builder itself is not visible. -1 + 1 = 0 puts the apps
  // first; splice(-1) would instead drop them in before the LAST item.
  assert.match(main, /-1 \+ 1 = 0/, 'the fallback deserves saying out loud');
  const items = ['a', 'b', 'c'];
  items.splice(-1 + 1, 0, 'app');
  assert.deepEqual(items, ['app', 'a', 'b', 'c']);
});

test('the deck never writes to the document it is describing', () => {
  // wbCompanyWorkspace() pushes an entry and renames it. The deck paints on every route, so
  // calling it there would create and rename workspace entries as a side effect of drawing
  // navigation.
  const source = slice('navItemsForApps');
  assert.match(source, /wbCompanyWorkspacePeek\(companyId\)/);
  assert.ok(!/wbCompanyWorkspace\(/.test(source), 'the mutating lookup must not be used from nav');
  const peek = slice('wbCompanyWorkspacePeek');
  assert.ok(!/push\(|\.name =/.test(peek), 'the peek must not create or rename anything');
});

test('the deck lists the apps that have a tile on the workspace home', () => {
  // One control in the place you are already arranging things, rather than a second list to
  // keep in step by hand. Add the tile, the app appears in the deck; remove it, it goes.
  const source = slice('navItemsForApps');
  assert.match(source, /wbSidebarTiles\(workspace\)/);
  assert.match(source, /\.filter\(\(tile\) => tile\.type === 'app'\)/);
  assert.match(source, /byId\.get\(tile\.config\?\.appId\)/);
});

test('a tile pointing at a deleted app, or two tiles pointing at one app, do not break the deck', () => {
  const source = slice('navItemsForApps');
  assert.match(source, /\.filter\(\(app\) => app && !seen\.has\(app\.id\) && seen\.add\(app\.id\)\)/);
  // Sanity-check the idiom itself: Set.add returns the set, which is truthy.
  const seen = new Set();
  const apps = [{ id: 'a' }, null, { id: 'a' }, { id: 'b' }];
  assert.deepEqual(
    apps.filter((app) => app && !seen.has(app.id) && seen.add(app.id)).map((a) => a.id),
    ['a', 'b'],
  );
});

test('the deck does not trigger a fetch to decide what to draw', () => {
  const source = slice('navItemsForApps');
  assert.match(source, /const doc = wbDoc\(companyId\);/);
  assert.match(source, /if \(!workspace\) return \[\];/);
  assert.ok(!/ensureWorkspaceBuilderLoaded|loadWorkspaceBuilderState/.test(source));
});

test('apps are hidden from someone who cannot view them', () => {
  assert.match(slice('navItemsForApps'), /if \(!can\('workspaces\.view', companyId\)\) return \[\];/);
});

test('the stage rows come from the app own status field, not a second list', () => {
  const source = slice('navItemApp');
  assert.match(source, /const field = pipelineField\(app\);/);
  assert.match(source, /boardColumns\(app\.items \|\| \[\], field, null\)/);
});

test('an app with no status field gets a row but no disclosure', () => {
  const source = slice('navItemApp');
  // The chevron is conditional on there being columns, so it cannot open onto nothing.
  assert.match(source, /\$\{columns\.length \? `<button class="side-pipe-toggle"/);
  assert.match(source, /\$\{expanded && columns\.length \?/);
});

test('a stale stage in the url cannot empty an unrelated app', () => {
  const source = slice('wbNavStage');
  assert.match(source, /if \(route\.params\?\.get\('app_id'\) !== app\.id\) return '';/);
});

test('the deck stage narrows the app filters rather than replacing them', () => {
  // Clicking back to "All items" has to restore whatever the user had configured.
  assert.match(main, /const navStage = wbNavStage\(app\);\n\s*if \(navStage\) rows = rows\.filter\(\(it\) => wbItemInNavStage\(app, it, navStage\)\);/);
  const before = main.indexOf('let rows = ui.filters.length');
  const after = main.indexOf('const navStage = wbNavStage(app);');
  assert.ok(before !== -1 && after > before, 'the nav stage must apply on top of the saved filters');
});

test('an empty stage says which stage, and offers the way out', () => {
  assert.match(main, /Nothing in this app is at <b>\$\{h\(navStageLabel\)\}<\/b> right now\./);
  assert.match(main, /Show all items/);
});

// --- the bucket semantics the deck depends on ------------------------------------------------

const app = {
  id: 'a1',
  items: [],
  fields: [{ id: 'f1', type: 'status', config: { options: [
    { id: 's1', label: 'Available', color: '#16a34a' },
    { id: 's2', label: 'In repair', color: '#d9a441' },
  ] } }],
};
const withItems = (values) => ({ ...app, items: values.map((v, i) => ({ id: `i${i}`, values: { f1: v } })) });

test('every record lands in exactly one bucket, so the counts sum to the total', () => {
  const subject = withItems(['s1', 's1', 's2', '', null, 'deleted-stage']);
  const columns = boardColumns(subject.items, pipelineField(subject), null);
  assert.equal(columns.reduce((n, c) => n + c.count, 0), subject.items.length);
});

test('unset and deleted stages share the no-stage bucket rather than disappearing', () => {
  // A record pointing at a stage somebody deleted must stay reachable from the deck, or the
  // app total stops matching the number of records that exist.
  const subject = withItems(['', null, 'deleted-stage']);
  const columns = boardColumns(subject.items, pipelineField(subject), null);
  const none = columns.find((c) => c.id === null);
  assert.equal(none.count, 3);
});
