import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  FIELD_ID_KEYS, FIELD_ID_LIST_KEYS, PORTABLE_KEYS, describeExtras, portableExtras,
  remapApp, remapChildren, remapConfig, remapExtras,
} from '../src/workspace/app-portability.js';

const ids = () => { let n = 0; return () => `n${(n += 1)}`; };

const APP = {
  id: 'a1',
  name: 'Jobs',
  recordName: 'Job',
  fields: [{ id: 'f1', label: 'Stage' }, { id: 'f2', label: 'Value' }, { id: 'f3', label: 'Due' }],
  items: [{ id: 'i1', values: { f1: 's1' }, children: [{ id: 'c1', collection: 'k1', values: {} }] }],
  automations: [],
  cardFields: ['f1', 'f2'],
  collections: [
    { id: 'k1', name: 'Dailies', recordName: 'Daily', fields: [{ id: 'kf1', label: 'Date', type: 'date' }] },
  ],
  recordLayout: [
    { id: 'b1', type: 'fields', size: 2, config: { fieldIds: ['f1', 'f3'] } },
    { id: 'b2', type: 'collection', size: 4, config: { collectionId: 'k1' } },
  ],
  dashboard: [
    { id: 'w1', type: 'stages', size: 2, config: { fieldId: 'f1' } },
    { id: 'w2', type: 'metric', size: 1, config: { fieldId: 'f2', agg: 'sum' } },
  ],
  views: [
    { id: 'v1', title: 'By stage', fieldId: 'f1', scope: 'team' },
    { id: 'v2', title: 'Everything', fieldId: '', scope: 'team' },
  ],
};

const MAP = { f1: 'F1', f2: 'F2', f3: 'F3' };

// ---- what a download carries ---------------------------------------------------------------

test('every portable structure is named in one place', () => {
  assert.deepEqual(PORTABLE_KEYS, ['recordName', 'cardFields', 'collections', 'recordLayout', 'dashboard', 'views']);
});

test('a download carries the arrangement, not just the fields', () => {
  const extras = portableExtras(APP);
  assert.deepEqual(Object.keys(extras).sort(), PORTABLE_KEYS.slice().sort());
  assert.equal(extras.collections[0].name, 'Dailies');
  assert.equal(extras.views.length, 2);
});

test('an app nobody has arranged produces no empty scaffolding', () => {
  // Emitting nulls would change every existing bundle for no gain.
  assert.deepEqual(portableExtras({ id: 'x', name: 'Bare', fields: [] }), {});
  assert.deepEqual(portableExtras({ recordName: '   ', cardFields: [], views: [] }), {});
  assert.deepEqual(portableExtras(null), {});
});

test('the export is a copy, so editing the bundle cannot reach back into the app', () => {
  const extras = portableExtras(APP);
  extras.collections[0].name = 'Changed';
  extras.cardFields.push('f9');
  assert.equal(APP.collections[0].name, 'Dailies');
  assert.equal(APP.cardFields.length, 2);
});

// ---- remapping on install --------------------------------------------------------------------

test('field references follow the remint, everywhere they appear', () => {
  // This is the whole point: installing remints every field id, so a layout copied verbatim
  // points at fields that no longer exist and renders as an empty card.
  const out = remapExtras(APP, MAP, ids());
  assert.deepEqual(out.cardFields, ['F1', 'F2']);
  assert.deepEqual(out.recordLayout[0].config.fieldIds, ['F1', 'F3']);
  assert.equal(out.dashboard[0].config.fieldId, 'F1');
  assert.equal(out.dashboard[1].config.fieldId, 'F2');
  assert.equal(out.views[0].fieldId, 'F1');
});

test('a reference that does not resolve is dropped, never carried through', () => {
  // A dangling id renders as a blank card with no way to tell why. Absent falls back to the
  // card's own default, which is at least a working screen.
  const out = remapExtras({ ...APP, dashboard: [{ id: 'w', type: 'stages', config: { fieldId: 'gone' } }] }, MAP, ids());
  assert.equal(out.dashboard[0].config.fieldId, '');
});

test('a field list that loses everything becomes "all fields", not "no fields"', () => {
  // null means every field and stays true after a remap; [] would mean an empty card.
  const out = remapExtras({ ...APP, recordLayout: [{ id: 'b', type: 'fields', config: { fieldIds: ['gone'] } }] }, MAP, ids());
  assert.equal(out.recordLayout[0].config.fieldIds, null);
});

test('collections and their fields both get fresh ids', () => {
  // A sub-item field is as much a field as a top-level one; two installs must not share ids.
  const out = remapExtras(APP, MAP, ids());
  assert.notEqual(out.collections[0].id, 'k1');
  assert.notEqual(out.collections[0].fields[0].id, 'kf1');
  assert.equal(out.collections[0].fields[0].label, 'Date', 'everything else is preserved');
  assert.equal(out.collections[0].recordName, 'Daily');
});

test('the record layout points at the NEW collection id', () => {
  const out = remapExtras(APP, MAP, ids());
  const card = out.recordLayout.find((b) => b.type === 'collection');
  assert.equal(card.config.collectionId, out.collections[0].id);
  assert.notEqual(card.config.collectionId, 'k1');
});

test('a sub-items card whose list did not travel is dropped, not installed empty', () => {
  const out = remapExtras({ ...APP, collections: [] }, MAP, ids());
  assert.ok(!out.recordLayout.some((b) => b.type === 'collection'));
  assert.equal(out.recordLayout.length, 1, 'the other card survives');
});

test('every block, widget and view gets a fresh id of its own', () => {
  const out = remapExtras(APP, MAP, ids());
  const all = [...out.recordLayout, ...out.dashboard, ...out.views].map((x) => x.id);
  assert.equal(new Set(all).size, all.length, 'ids must be unique');
  assert.ok(!all.includes('b1') && !all.includes('w1') && !all.includes('v1'));
});

test('a private view is never installed as a team view', () => {
  // Private views live in one browser's storage, so a private one in a bundle came from a
  // hand-edited file. Installing it would publish somebody's private list to a whole company.
  const out = remapExtras({ ...APP, views: [{ id: 'p', title: 'Mine', fieldId: 'f1', scope: 'private' }] }, MAP, ids());
  assert.deepEqual(out.views, []);
});

test('a view whose split field is gone becomes the plain list rather than breaking', () => {
  const out = remapExtras({ ...APP, views: [{ id: 'v', title: 'By gone', fieldId: 'gone', scope: 'team' }] }, MAP, ids());
  assert.equal(out.views[0].fieldId, '');
  assert.equal(out.views[0].title, 'By gone');
});

test('junk in a bundle does not throw', () => {
  assert.deepEqual(remapExtras(null, MAP, ids()), {});
  assert.deepEqual(remapExtras({ collections: [null, undefined], views: 'nope', dashboard: 5 }, MAP, ids()).collections, []);
});

test('remapping does not mutate the bundle it was given', () => {
  const src = JSON.parse(JSON.stringify(APP));
  const before = JSON.stringify(src);
  remapExtras(src, MAP, ids());
  assert.equal(JSON.stringify(src), before);
});

// ---- the key list is kept honest by the real modules -----------------------------------------

test('no config key holding a field id is missing from the remap list', () => {
  // A new card type that stores a field under a name nobody added here would be copied across
  // unremapped and silently point at the source app's field.
  const sources = ['dashboard-widgets', 'record-layout', 'app-views']
    .map((name) => readFileSync(new URL(`../src/workspace/${name}.js`, import.meta.url), 'utf8'))
    .join('\n');
  const known = new Set([...FIELD_ID_KEYS, ...FIELD_ID_LIST_KEYS, 'collectionId']);
  const found = new Set();
  for (const m of sources.matchAll(/config\.([a-zA-Z]*[Ff]ield[a-zA-Z]*)\b/g)) found.add(m[1]);
  for (const key of found) {
    assert.ok(known.has(key), `config.${key} looks like a field reference but is not remapped`);
  }
  assert.ok(found.size > 0, 'the scan must actually find something, or it proves nothing');
});

test('the summary reads as prose, and says nothing when there is nothing', () => {
  assert.deepEqual(describeExtras({}), []);
  const parts = describeExtras(portableExtras(APP));
  assert.ok(parts.includes('1 sub-item list'));
  assert.ok(parts.includes('2 views'));
  assert.ok(parts.includes('a dashboard'));
});

// ---- sub-item records ------------------------------------------------------------------------

test('sub-item records follow their list and its fields', () => {
  // Without this a restored app has the sub-item lists but nothing in them, which looks like
  // data loss because it is.
  const { collectionIdMap, childFieldIdMap } = remapApp(APP, MAP, ids());
  const kids = remapChildren(
    [{ id: 'c1', collection: 'k1', values: { kf1: '2026-08-04' }, createdAt: '2026-08-04' }],
    collectionIdMap, childFieldIdMap, ids(),
  );
  assert.equal(kids.length, 1);
  assert.equal(kids[0].collection, collectionIdMap.k1);
  assert.equal(kids[0].values[childFieldIdMap.kf1], '2026-08-04');
  assert.notEqual(kids[0].id, 'c1', 'the record gets a fresh id too');
  assert.equal(kids[0].createdAt, '2026-08-04', 'when it happened is preserved');
});

test('a child whose list did not travel is dropped, not orphaned', () => {
  const kids = remapChildren([{ id: 'c', collection: 'gone', values: {} }], {}, {}, ids());
  assert.deepEqual(kids, []);
});

test('a value against a field that did not travel is dropped, not carried', () => {
  const kids = remapChildren([{ id: 'c', collection: 'k1', values: { gone: 'x' } }], { k1: 'K1' }, {}, ids());
  assert.deepEqual(kids[0].values, {});
});

test('junk children never throw', () => {
  assert.deepEqual(remapChildren(null, {}, {}, ids()), []);
  assert.deepEqual(remapChildren([null], {}, {}, ids()), []);
});

test('the installer actually calls all of this', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  assert.match(main, /const \{ extras, collectionIdMap, childFieldIdMap \} = remapApp\(src, fieldIdMap, wbUid\);/);
  assert.match(main, /children: remapChildren\(it\.children, collectionIdMap, childFieldIdMap, wbUid\),/);
  assert.match(main, /automations, \.\.\.extras \};/);
});

test('the download bundle carries the extras', () => {
  const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
  assert.match(io, /\.\.\.portableExtras\(app\),/);
  // And says so, rather than reporting fields/records/automations as if nothing else went.
  assert.match(io, /const extras = describeExtras\(bundle\.app\);/);
});
