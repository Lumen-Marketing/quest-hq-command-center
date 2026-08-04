import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SPLIT_FIELD_TYPES, addView, allViews, normalizeView, partitionViews, removeView,
  renderViewsRail, splitFields, viewGroups, viewTotal,
} from '../src/workspace/saved-views.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  + readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');
const mod = readFileSync(new URL('../src/workspace/saved-views.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const ids = () => { let n = 0; return () => `v${(n += 1)}`; };
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const app = {
  id: 'a1',
  name: 'Jobs',
  fields: [
    { id: 'f1', type: 'text', label: 'Job' },
    { id: 'f2', type: 'status', label: 'Lead Status', config: { options: [
      { id: 's1', label: 'New Untouched', color: '#e0552d' },
      { id: 's2', label: 'Discovery', color: '#7c3aed' },
      { id: 's3', label: 'In Progress', color: '#16a34a' },
    ] } },
    { id: 'f3', type: 'date', label: 'Start' },
  ],
  items: [
    { id: 'i1', values: { f2: 's1' } },
    { id: 'i2', values: { f2: 's1' } },
    { id: 'i3', values: { f2: 's2' } },
    { id: 'i4', values: {} },
  ],
  views: [{ id: 'tv1', title: 'Lead Status', fieldId: 'f2' }],
};

// --- shape ---------------------------------------------------------------------------------

test('only a named, ordered, bounded field can split a view', () => {
  // A date or text field would give one group per record, which is the list again.
  assert.deepEqual(SPLIT_FIELD_TYPES, ['status', 'category']);
  assert.deepEqual(splitFields(app).map((f) => f.id), ['f2']);
  assert.deepEqual(splitFields({ fields: [] }), []);
});

test('a view without a title is not saved', () => {
  assert.deepEqual(addView([], { title: '   ' }, ids()), []);
  assert.equal(addView([], { title: 'Mine' }, ids()).length, 1);
});

test('a view normalises rather than rejecting', () => {
  assert.equal(normalizeView({}).title, 'Untitled view');
  assert.equal(normalizeView({ scope: 'nonsense' }).scope, 'team');
  assert.equal(normalizeView({ title: ' Spaced ' }).title, 'Spaced');
  assert.ok(normalizeView({}).id, 'it must be addressable to be picked or deleted');
});

// --- counts ---------------------------------------------------------------------------------

test('a view splits into one row per value, with counts', () => {
  const groups = viewGroups(app, { fieldId: 'f2' });
  assert.deepEqual(groups.map((g) => [g.label, g.count]), [
    ['No stage', 1], ['New Untouched', 2], ['Discovery', 1], ['In Progress', 0],
  ]);
});

test('the counts add up to the total, so no record is unreachable', () => {
  assert.equal(viewTotal(app, { fieldId: 'f2' }), app.items.length);
});

test('a view with no split, or a deleted field, degrades to a shortcut', () => {
  // Returning null is how the renderer knows to draw a plain row rather than an empty group.
  assert.equal(viewGroups(app, { fieldId: '' }), null);
  assert.equal(viewGroups(app, { fieldId: 'gone' }), null);
  assert.equal(viewTotal(app, { fieldId: 'gone' }), 4, 'it still covers everything');
});

test('counting reuses the board grouping rather than a second implementation', () => {
  assert.match(mod, /import \{ boardColumns, stagesOf \} from '\.\/pipeline-core\.js';/);
  assert.ok(!/function boardColumns/.test(mod), 'a second copy would let counts disagree');
});

// --- team vs private ---------------------------------------------------------------------------

test('team and private views come back together, each tagged with where it lives', () => {
  const list = allViews(app, [{ id: 'pv1', title: 'Mine', fieldId: 'f2', appId: 'a1' }]);
  assert.deepEqual(list.map((v) => [v.title, v.scope]), [['Lead Status', 'team'], ['Mine', 'private']]);
});

test('one browser can hold private views for many apps', () => {
  const list = allViews(app, [
    { id: 'p1', title: 'Mine', appId: 'a1' },
    { id: 'p2', title: 'Someone else app', appId: 'a2' },
  ]);
  assert.deepEqual(list.filter((v) => v.scope === 'private').map((v) => v.title), ['Mine']);
});

test('private views are stored in the browser, not the shared document', () => {
  // The workspace document is one JSON value every member can read. A "private" flag in it
  // would hide a view in the UI while leaving it in plain sight in the data.
  assert.match(main, /const WB_PRIVATE_VIEWS_KEY = 'quest-hq-wb-private-views-v1';/);
  assert.match(main, /function wbPrivateViews\(\) \{\n\s*const saved = readJson\(WB_PRIVATE_VIEWS_KEY, \[\]\);/);
  const save = main.match(/async function saveWbView\(form\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(save, /wbSavePrivateViews\(\[\.\.\.wbPrivateViews\(\), \{ \.\.\.view, appId \}\]\)/);
  // And the UI says so rather than implying a privacy the storage cannot keep.
  assert.match(mod, /Private views are saved in this browser only\./);
});

test('a team view needs the permission to change the app, and falls back rather than refusing', () => {
  const save = main.match(/async function saveWbView\(form\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(save, /data\.scope === 'team' && can\('workspaces\.manage', companyId\) \? 'team' : 'private'/);
});

test('partitioning keeps the scope tag out of what gets stored', () => {
  const split = partitionViews([
    { id: 't', title: 'T', scope: 'team' },
    { id: 'p', title: 'P', scope: 'private' },
  ], 'a1');
  assert.deepEqual(split.team, [{ id: 't', title: 'T' }]);
  assert.deepEqual(split.private, [{ id: 'p', title: 'P', appId: 'a1' }]);
});

test('deleting a view asks first', () => {
  // The X sits beside the row you click to USE the view, so a slip is easy and there is no
  // undo. The dialog is plain — no typing the name, no password, unlike deleting an app —
  // because a view holds no records and rebuilding one is a name and a dropdown.
  const handler = main.match(/bind\('\[data-wb-view-del\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.match(handler, /openWbModal\(\{\n\s*kind: 'delete-view'/);
  assert.ok(!/app\.views = /.test(handler), 'the click must not delete anything itself');
  assert.match(main, /Your records are not touched\./);
});

test('the confirm honours who may delete what', () => {
  const confirm = main.match(/const delViewBtn = overlay\.querySelector[\s\S]*?\n {2}\}/)?.[0] || '';
  assert.match(confirm, /if \(priv\.some\(\(v\) => v\.id === viewId\)\)/, 'private is checked first');
  assert.match(confirm, /else if \(can\('workspaces\.manage', companyId\)\)/);
  assert.match(confirm, /state\.builderModal = null;/, 'and the dialog closes either way');
});

test('the dialog says who loses the view', () => {
  // Deleting a team view takes it from everybody; a private one only from this browser.
  assert.match(main, /m\.viewScope === 'team' \? ' for everybody on the team' : ' from this browser'/);
});

test('what a view splits by is fixed at creation', () => {
  // It is chosen in the Add form and stays chosen. The rows below already name the field's
  // own values, so a label repeating it earned no space — and a control to change it invited
  // editing a decision that was already made.
  assert.ok(!/data-wb-view-split/.test(main), 'no control');
  assert.ok(!/wb-vsplit/.test(mod), 'and no label repeating the field name');
  assert.match(mod, /<option value="">None<\/option>/, 'the choice still lives in the Add form');
});

// --- the rail ------------------------------------------------------------------------------

const rail = (overrides = {}) => renderViewsRail({
  h: esc,
  can: () => true,
  companyId: 'c1',
  app,
  ui: { chipFieldId: '', chipValue: '' },
  state: { wbViewScope: 'team', wbViewAdding: false, wbViewExpanded: {} },
  privateViews: [],
  noneKey: '__none',
  ...overrides,
});

test('the rail renders the view, its rows, and the counts', () => {
  const html = rail();
  assert.ok(html.includes('All Jobs'));
  assert.ok(html.includes('Lead Status'));
  assert.ok(html.includes('New Untouched'));
  assert.ok(!/undefined|NaN|\[object Object\]/.test(html));
  assert.ok(!html.includes('${'), 'a stray placeholder means a template literal broke');
});

test('a long split is capped until Show more', () => {
  const many = { ...app, fields: [{ id: 'f2', type: 'status', label: 'Stage', config: { options: Array.from({ length: 9 }, (_, i) => ({ id: `s${i}`, label: `S${i}` })) } }] };
  const html = rail({ app: { ...many, name: 'Jobs', items: [], views: [{ id: 'v', title: 'Stage', fieldId: 'f2' }] } });
  assert.ok(html.includes('Show more'));
  assert.equal((html.match(/wb-vopt/g) || []).length, 5);
});

test('a view title clears the filter; a value sets it', () => {
  // The heading means "the whole of this view", which is the same as no filter.
  assert.match(rail(), /data-wb-view-pick="tv1:"/);
  assert.match(rail(), /data-wb-view-pick="tv1:s1"/);
  const handler = main.match(/bind\('\[data-wb-view-pick\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.match(handler, /ui\.chipFieldId = value && view\?\.fieldId \? view\.fieldId : '';/);
});

test('picking a view drives the quick-filter state rather than a second filter path', () => {
  // Two filtering paths could disagree about what is on screen.
  const handler = main.match(/bind\('\[data-wb-view-pick\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.match(handler, /wbRememberItemsUI\(appId\)/, 'and it survives a refresh like a chip does');
});

test('a scope with no views says so instead of rendering blank', () => {
  assert.ok(rail({ app: { ...app, views: [] } }).includes('No team views yet'));
});

test('the rail stacks above the list on a narrow screen', () => {
  assert.match(styles, /\.wb-items-layout \{[^}]*grid-template-columns: 232px minmax\(0, 1fr\)/);
  assert.match(styles, /@media \(max-width: 1020px\) \{\s*\.wb-items-layout \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});

test('the rail is fetched with its model, not carried by every page', () => {
  assert.ok(!/^import .*saved-views/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/workspace\/saved-views\.js'\)/);
  assert.match(main, /savedViewsPending = null;/, 'a failed fetch must be retryable');
  assert.match(main, /if \(!savedViewsModule\) \{\n\s*loadSavedViews\(\)/, 'the list must not wait for the rail');
});

// --- which field a view splits by --------------------------------------------------------

test('the chosen field is the field that splits, among several', () => {
  // The complaint that started this: picking Trade and appearing to get the status field.
  const two = {
    id: 'a1',
    name: 'Jobs',
    fields: [
      { id: 'trade', type: 'category', label: 'Trade', config: { options: [{ id: 't1', label: 'Roofing' }, { id: 't2', label: 'Siding' }] } },
      { id: 'stage', type: 'status', label: 'Untitled Status field', config: { options: [{ id: 's1', label: 'Unscheduled' }] } },
    ],
    items: [{ id: 'i1', values: { trade: 't1', stage: 's1' } }, { id: 'i2', values: { trade: 't2', stage: 's1' } }],
  };
  assert.deepEqual(viewGroups(two, { fieldId: 'trade' }).map((g) => g.label), ['Roofing', 'Siding']);
  assert.deepEqual(viewGroups(two, { fieldId: 'stage' }).map((g) => g.label), ['Unscheduled']);
});



test('a field with no options says so instead of rendering a silent blank', () => {
  const bare = {
    id: 'a1', name: 'Jobs',
    fields: [{ id: 'c', type: 'category', label: 'Trade', config: {} }],
    items: [{ id: 'i1', values: {} }],
    views: [{ id: 'v', title: 'By trade', fieldId: 'c' }],
  };
  const html = rail({ app: bare });
  assert.match(html, /has no options yet, so there is nothing to split by/);
});

test('a view whose field was deleted explains itself rather than vanishing', () => {
  const html = rail({ app: { ...app, views: [{ id: 'v', title: 'Old', fieldId: 'gone' }] } });
  assert.match(html, /That field was deleted, so this view now shows everything\./);
});
