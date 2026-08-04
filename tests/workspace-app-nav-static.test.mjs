import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { boardColumns, pipelineField } from '../src/workspace/pipeline-core.js';

// Apps built in the App Builder appear in the deck under Workspace, with the options of
// their own status field nested underneath. The grouping itself is pipeline-core's, already
// tested; what is checked here is that the deck reuses it rather than counting again, and
// that navigation stays read-only.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const slice = (name) => main.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0] || '';

test('apps are listed in the same group as the builder that made them', () => {
  assert.match(main, /if \(group\.label === 'Workspace'\) items\.push\(\.\.\.navItemsForApps\(route, companyId\)\);/);
  assert.match(main, /\{ label: 'Workspace', ids: \['workspaces',/);
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
