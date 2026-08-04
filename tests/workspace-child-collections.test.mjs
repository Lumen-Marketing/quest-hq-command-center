import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  addChild, addCollection, childCount, childrenOf, collectionsFor, findCollection,
  normalizeCollection, orphanedChildren, removeChild, removeCollection, renameCollection,
  updateChild,
} from '../src/workspace/child-collections.js';

// The builder's dialogs are their own fetched-on-demand module; same surface, two files.
const main = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const page = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8');
const model = readFileSync(new URL('../src/workspace/child-collections.js', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../.ai/plans/app-builder-records-as-rows.md', import.meta.url), 'utf8');

const ids = () => { let n = 0; return () => `x${(n += 1)}`; };

const app = {
  id: 'a1',
  name: 'Jobs',
  collections: [
    { id: 'c1', name: 'Dailies', fields: [{ id: 'd1', label: 'Date', type: 'date' }, { id: 'd2', label: 'Crew', type: 'text' }] },
    { id: 'c2', name: 'Cost buckets', fields: [] },
  ],
};
const item = {
  id: 'i1',
  values: {},
  children: [
    { id: 'k1', collection: 'c1', values: { d1: '2026-08-03', d2: 'Alkeith' }, createdAt: '2026-08-03' },
    { id: 'k2', collection: 'c1', values: { d1: '2026-08-04', d2: 'Crew B' }, createdAt: '2026-08-04' },
    { id: 'k3', collection: 'c2', values: {}, createdAt: '2026-08-01' },
  ],
};

// --- the shape ------------------------------------------------------------------------------

test('the stored shape is the one the rows migration expects', () => {
  // { parent, collection, values } is exactly wb_items. When records become rows these
  // migrate across as a copy rather than a rewrite.
  const [child] = childrenOf(item, 'c1');
  assert.deepEqual(Object.keys(child).sort(), ['collection', 'createdAt', 'createdBy', 'id', 'updatedAt', 'values']);
  assert.match(plan, /collection\s+text not null default ''/, 'the plan still describes this column');
  assert.match(model, /wb_items table/, 'and the model says why it is shaped this way');
});

test('a collection normalises rather than rejecting', () => {
  assert.equal(normalizeCollection({}).name, 'Items');
  assert.equal(normalizeCollection({ name: '  Dailies ' }).name, 'Dailies');
  assert.deepEqual(normalizeCollection({}).fields, []);
  assert.ok(normalizeCollection({}).id);
});

test('collections are declared on the app, children on the record', () => {
  assert.match(main, /collections: Array\.isArray\(app\.collections\) \? app\.collections : \[\],/);
  assert.match(main, /children: Array\.isArray\(item\.children\) \? item\.children : \[\]/);
});

// --- reading -------------------------------------------------------------------------------

test('children come back per collection, newest first', () => {
  assert.deepEqual(childrenOf(item, 'c1').map((c) => c.id), ['k2', 'k1']);
  assert.deepEqual(childrenOf(item, 'c2').map((c) => c.id), ['k3']);
  assert.deepEqual(childrenOf(item, 'gone'), []);
  assert.equal(childCount(item, 'c1'), 2);
});

test('a record with no children at all does not blow up', () => {
  assert.deepEqual(childrenOf({ id: 'x' }, 'c1'), []);
  assert.deepEqual(childrenOf(null, 'c1'), []);
  assert.equal(childCount({}, 'c1'), 0);
});

test('children are one flat list, not a map keyed by collection', () => {
  // A flat list is what a table of rows looks like, so the migration is a copy. It also
  // means deleting a collection cannot orphan children into a key nothing reads.
  assert.match(model, /Stored as one flat list per item/);
  assert.ok(Array.isArray(item.children));
});

// --- writing --------------------------------------------------------------------------------

test('adding keeps every other collection intact', () => {
  const next = addChild(item, 'c1', { d2: 'Sub crew' }, ids());
  assert.equal(next.length, 4);
  assert.equal(next.filter((c) => c.collection === 'c2').length, 1);
});

test('updating touches only the child named, and stamps it', () => {
  const next = updateChild(item, 'k1', { d2: 'Changed' });
  const changed = next.find((c) => c.id === 'k1');
  assert.equal(changed.values.d2, 'Changed');
  assert.ok(changed.updatedAt);
  assert.equal(next.find((c) => c.id === 'k2').values.d2, 'Crew B', 'the sibling is untouched');
});

test('removing takes one child and nothing else', () => {
  assert.deepEqual(removeChild(item, 'k1').map((c) => c.id), ['k2', 'k3']);
  assert.deepEqual(removeChild(item, 'gone').map((c) => c.id), ['k1', 'k2', 'k3']);
});

test('none of the writers mutate what they were given', () => {
  // The caller assigns the result; mutating would change the record before the save.
  const before = JSON.stringify(item.children);
  addChild(item, 'c1', {}, ids());
  updateChild(item, 'k1', { d2: 'x' });
  removeChild(item, 'k1');
  assert.equal(JSON.stringify(item.children), before);
});

// --- collections ------------------------------------------------------------------------------

test('a collection needs a name', () => {
  assert.deepEqual(addCollection([], '   ', ids()), []);
  assert.equal(addCollection([], 'Visits', ids()).length, 1);
  assert.deepEqual(renameCollection(collectionsFor(app), 'c1', '  ').find((c) => c.id === 'c1').name, 'Dailies', 'a blank rename is ignored');
});

test('deleting a collection does not delete its children', () => {
  // That would throw away records nobody asked to lose, from a screen about layout. They
  // are reported instead, so the loss is a decision rather than a side effect.
  const shrunk = { ...app, collections: removeCollection(collectionsFor(app), 'c1') };
  assert.equal(findCollection(shrunk, 'c1'), null);
  assert.deepEqual(orphanedChildren(shrunk, item).map((c) => c.id), ['k1', 'k2']);
  assert.deepEqual(orphanedChildren(app, item), [], 'nothing is orphaned while the collection lives');
});

// --- wiring ---------------------------------------------------------------------------------

test('the sub-items card is offered on the record layout', () => {
  const layout = readFileSync(new URL('../src/workspace/record-layout.js', import.meta.url), 'utf8');
  assert.match(layout, /\{ type: 'collection', label: 'Sub-items'/);
  assert.match(page, /block\.type === 'collection'/);
});

test('the child form is built from the collection fields, not the app', () => {
  // A daily has a date and a crew, and knows nothing about the job's trade or value.
  assert.match(main, /m\.fields\.map\(\(f\) => wbRenderFieldInput\(m\.companyId, m\.workspaceId, f, m\.draft\.values\[f\.id\]\)\)/);
  assert.match(main, /fields: collection\.fields,/);
});

test('the child form reuses the app own field reader', () => {
  // So a child date, money or option behaves exactly like a parent one.
  const submit = main.match(/if \(m\.kind === 'child-item'\) \{[\s\S]*?\n {2}\}/)?.[0] || '';
  assert.match(submit, /const v = wbReadFieldInput\(f\);/);
  assert.match(submit, /if \(f\.required && /, 'and honours required');
});

test('every write to children checks the permission and saves once', () => {
  const edit = main.match(/async function wbChildEdit\([\s\S]*?\n\}/)?.[0] || '';
  assert.match(edit, /if \(!item \|\| !can\('workspaces\.manage', companyId\)\) return;/);
  assert.match(edit, /wbSave\(companyId\);/);
  assert.match(edit, /item\.lastActivityAt = item\.updatedAt;/, 'so the parent surfaces as recently active');
});

test('deleting a sub-item asks first', () => {
  assert.match(main, /kind: 'delete-child'/);
  assert.match(main, /This removes it from this record\. It cannot be undone\./);
});

test('a card pointing at nothing, and a collection with no fields, both explain themselves', () => {
  assert.match(page, /Pick which sub-items this card shows in its settings\./);
  assert.match(page, /has no fields yet\. Add them in the app's Settings\./);
});

test('child values are formatted without the parent app field list', () => {
  // The app's own formatter resolves relationships and members against the PARENT's fields,
  // which a child field is not one of.
  assert.match(page, /function childValueText\(field, value\)/);
  assert.match(page, /\(field\.config\?\.options \|\| \[\]\)\.find\(\(o\) => o\.id === value\)\?\.label/);
});

// --- the field builder, shared ----------------------------------------------------------------

test('a sub-item list gets the real field builder, not a lesser one', () => {
  // The same markup the app's Fields tab uses — palette, drag handles, configure, hide,
  // delete — so there is one builder to learn and one to keep working.
  assert.match(main, /function wbFieldBuilderMarkup\(companyId, fields, canManage, scope = ''\)/);
  assert.match(main, /function wbViewBuilder\(companyId, workspace, app\) \{\n\s*return wbFieldBuilderMarkup\(companyId, app\.fields, can\('workspaces\.manage', companyId\)\);/);
  assert.match(main, /wbFieldBuilderMarkup\(companyId, c\.fields, canManage, c\.id\)/);
});

test('one dialog configures both, so option editors cannot drift apart', () => {
  assert.match(main, /function openWbFieldModal\(companyId, workspaceId, appId, fieldId, fieldType, collectionId = ''\)/);
  assert.match(main, /const owner = collectionId \? \(app\.collections \|\| \[\]\)\.find\(\(c\) => c\.id === collectionId\) : app;/);
  // And the stopgap it replaced is gone rather than left to rot beside it.
  assert.ok(!/kind: 'collection-field'/.test(main));
});

test('a scoped id tells an app field from a sub-item field', () => {
  assert.match(main, /const key = \(id\) => \(scope \? `\$\{scope\}:\$\{id\}` : id\);/);
  const split = main.match(/const splitScope = \(raw\) => \{[\s\S]*?\n {4}\};/)?.[0] || '';
  assert.match(split, /at === -1 \? \{ collectionId: '', id: value \}/, 'a bare id is the app own');
  // Sanity-check the parse itself, including a value that contains no colon.
  const parse = (raw) => { const at = String(raw).indexOf(':'); return at === -1 ? { collectionId: '', id: String(raw) } : { collectionId: String(raw).slice(0, at), id: String(raw).slice(at + 1) }; };
  assert.deepEqual(parse('f1'), { collectionId: '', id: 'f1' });
  assert.deepEqual(parse('c1:f1'), { collectionId: 'c1', id: 'f1' });
});

test('deleting a sub-item field counts the children it will empty, not the records', () => {
  // "and its data in all 5 item(s)" would be wrong: the data lives on the child records,
  // and there can be many per record.
  const handler = main.match(/bind\('\[data-del-field\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.match(handler, /app\.items\.reduce\(\(n, it\) => n \+ \(it\.children \|\| \[\]\)\.filter\(\(c\) => c\.collection === collectionId\)\.length, 0\)/);
  assert.match(handler, /const noun = collectionId \? `\$\{owner\.name\} record` : 'item';/);
});

test('deleting a sub-item field clears it from the children, not the records', () => {
  const del = main.match(/if \(c\.op === 'del-field'\) \{[\s\S]*?\n {2}\}/)?.[0] || '';
  assert.match(del, /if \(child\.collection === c\.collectionId\) delete child\.values\[c\.fieldId\]/);
  assert.match(del, /collection\.fields = \(collection\.fields \|\| \[\]\)\.filter\(\(f\) => f\.id !== c\.fieldId\)/);
  assert.match(del, /app\.fields = app\.fields\.filter/, 'the app path still works');
});

test('only one list opens its builder at a time', () => {
  // Two palettes side by side is a lot of screen for one decision.
  assert.match(main, /state\.wbCollectionOpen = state\.wbCollectionOpen === id \? '' : id;/);
});
