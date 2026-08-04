import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  addChild, addCollection, childCount, childrenOf, collectionsFor, findCollection,
  normalizeCollection, orphanedChildren, removeChild, removeCollection, renameCollection,
  setChildValue, toggleChildStep, updateChild,
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

test('child values are formatted against the COLLECTION field list, not the parent app', () => {
  // This used to be a separate formatter here, to keep the parent's fields out of it. The
  // separation was the bug: anything the local one had not been taught fell through to
  // String(value), so a User field printed the member's raw UUID as the row title.
  //
  // Only three types ever actually needed the parent kept out -- calculation, rollup and
  // progress read config.source out of app.fields -- so the app handed to the shared
  // formatter carries the collection's fields. User and relationship resolve through
  // companyId and the field's own config, and were never affected.
  assert.match(page, /app: \{ \.\.\.app, fields: cols \}/);
  assert.ok(!/function childValueText\(/.test(page), 'the second formatter must be gone');
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
  const handler = main.match(/bind\('\[data-wb-collection-open\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.match(handler, /const on = opening && node\.dataset\.wbCollection === id;/, 'every other one closes');
  assert.match(handler, /state\.wbCollectionOpen = opening \? id : '';/);
});

test('opening a list does not re-render the page', () => {
  // Every builder is already in the DOM; opening one is a visibility flip. Re-rendering a
  // long settings page is what threw you back to the top each time.
  const handler = main.match(/bind\('\[data-wb-collection-open\]'[\s\S]*?\n {4}\}\);/)?.[0] || '';
  assert.ok(!/render\(\)/.test(handler), 'no render, so nothing can jump');
  assert.match(handler, /\.wb-collection-body'\)\.hidden = !on;/);
  assert.match(main, /<div class="wb-collection-body" id="wbCol-\$\{h\(c\.id\)\}"/);
  // And it stays announced correctly for a screen reader.
  assert.match(handler, /toggle\.setAttribute\('aria-expanded', on \? 'true' : 'false'\)/);
  assert.match(main, /aria-controls="wbCol-\$\{h\(c\.id\)\}"/);
});

// --- the settings page ------------------------------------------------------------------------

test('unsaved settings text survives a render somebody else caused', () => {
  // The form only commits on "Save changes", so any render before that threw the typing
  // away — and adding a sub-item list, adding a field to one, and expanding one all render.
  assert.match(main, /const draft = state\.wbSettingsDraft\?\.\[app\.id\] \|\| \{\};/);
  for (const key of ['name', 'recordName', 'description', 'type']) {
    assert.match(main, new RegExp(`data-wb-setting="${key}"`), `${key} must read through the draft`);
  }
  assert.match(main, /value="\$\{h\(draft\.name \?\? app\.name\)\}"/);
});

test('recording a keystroke does not itself re-render', () => {
  // The point is to survive somebody else's render, not to cause one per character.
  const handler = main.match(/bind\('\[data-wb-setting\]'[\s\S]*?'oninput'\);/)?.[0] || '';
  assert.match(handler, /state\.wbSettingsDraft\[appId\] = \{ \.\.\./);
  assert.ok(!/render\(\)/.test(handler), 'no render per keystroke');
});

test('saving clears the draft, so the saved value is what shows next', () => {
  assert.match(main, /if \(state\.wbSettingsDraft\) delete state\.wbSettingsDraft\[appId\];/);
});

test('the field builder is not squeezed into the settings column', () => {
  // It is a two-column layout itself; inside a 560px card it loses two thirds of its width.
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(main, /<\/div>\n\s*\$\{wbCollectionsSettings\(companyId, app, canManage\)\}/, 'it renders below the card');
  assert.match(styles, /\.wb-settings\.card \{ max-width: 560px/);
  assert.match(styles, /\.wb-collections \{ margin-top: 18px; max-width: 1100px; \}/);
  assert.match(styles, /\.wb-collection \.wb-builder-grid \{ grid-template-columns: minmax\(0, 1fr\) 260px/);
});

// --- drag and drop, and the jump ------------------------------------------------------------

test('every builder on the page gets its dropzone bound, not just the first', () => {
  // The settings page carries one per sub-item list. querySelector left every other inert,
  // which is what "drag and drop is not working" was.
  assert.match(main, /document\.querySelectorAll\('\[data-wb-field-dropzone\]'\)\.forEach\(\(dropzone\) => \{/);
  assert.match(main, /const scope = dropzone\.getAttribute\('data-wb-field-dropzone'\) \|\| '';/);
});

test('a dragged field lands in the list it was dragged in, not in the app', () => {
  assert.match(main, /function wbAddFieldInstant\(companyId, workspaceId, appId, type, index, collectionId = ''\)/);
  assert.match(main, /const owner = collectionId \? \(app\.collections \|\| \[\]\)\.find\(\(c\) => c\.id === collectionId\) : app;/);
  assert.match(main, /owner\.fields\.splice\(at, 0, field\);/);
  assert.ok(!/app\.fields\.splice\(at, 0, field\)/.test(main), 'it must not write to the app regardless of scope');
});

test('reordering moves a field within its own owner', () => {
  const drop = main.match(/row\.ondrop = \(e\) => \{[\s\S]*?\n {4}\};/)?.[0] || '';
  assert.match(drop, /const owner = target\.scope \? \(app\.collections \|\| \[\]\)\.find\(\(c\) => c\.id === target\.scope\) : app;/);
  assert.match(drop, /owner\.fields\.splice\(from, 1\); owner\.fields\.splice\(to, 0, moved\);/);
});

test('a field cannot be dragged from one list into another', () => {
  // They are different shapes of record, and the values already stored under it have
  // nowhere to go.
  const drop = main.match(/row\.ondrop = \(e\) => \{[\s\S]*?\n {4}\};/)?.[0] || '';
  assert.match(drop, /if \(source\.scope !== target\.scope\) return;/);
});

test('opening a dialog does not scroll the page behind it', () => {
  // Focusing an element makes the browser scroll it into view, and what moves is the page
  // BEHIND the modal — so opening one from halfway down threw that page to the top.
  const sync = main.match(/function syncModalFocus\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(sync, /panel\.focus\(\{ preventScroll: true \}\)/);
  assert.match(sync, /first\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(sync, /document\.querySelector\(selector\)\?\.focus\(\{ preventScroll: true \}\)/);
  assert.ok(!/\.focus\(\);/.test(sync), 'no bare focus() may remain');
});

test('focus is not handed back to a control behind an open modal', () => {
  // It breaks the dialog's focus trap and scrolls the page under it.
  assert.match(main, /if \(!restoreFocus \|\| !kept\.selector \|\| activeModalOverlay\(\)\) return;/);
});

// --- getting a Sub-items card onto a record ---------------------------------------------------

test('a Sub-items card lands pointing at a list, not at nothing', () => {
  // Otherwise it renders "pick a list in settings" and needs a second trip before it is
  // anything at all — which reads as the feature not working.
  const layout = readFileSync(new URL('../src/workspace/record-layout.js', import.meta.url), 'utf8');
  assert.match(layout, /if \(type === 'collection'\) config\.collectionId = \(app\?\.collections \|\| \[\]\)\[0\]\?\.id \|\| '';/);
});

test('the card is offered as blocked when the app has no lists yet', () => {
  const layout = readFileSync(new URL('../src/workspace/record-layout.js', import.meta.url), 'utf8');
  assert.match(layout, /export function blockSupported\(app, type\)/);
  assert.match(main, /supported: mod\.blockSupported\(app, meta\.type\),/);
  assert.match(main, /Add a sub-item list in this app's Settings first/);
  // And the catalogue actually honours it rather than rendering a dead button.
  assert.match(main, /class="wb-catalog-item \$\{opt\.supported \? '' : 'blocked'\}" type="button" \$\{opt\.supported \? `data-wb-rec-pick/);
  assert.match(main, /\$\{opt\.supported \? h\(opt\.desc\) : h\(opt\.blocked\)\}/);
});

test('its settings pick a list, not a set of fields', () => {
  // It used to fall through to the FIELD checkbox list, which cannot pick a list at all.
  assert.match(main, /if \(block\.type === 'collection'\) \{/);
  assert.match(main, /<select class="wb-input" data-wb-reccfg="collectionId">/);
  assert.match(main, /collections: \(app\.collections \|\| \[\]\)\.map\(\(c\) => \(\{ id: c\.id, name: c\.name \}\)\),/);
});

test('with no lists the settings dialog says so instead of offering an empty select', () => {
  assert.match(main, /This app has no sub-item lists yet\. Add one in Settings, then come back\./);
});

// ---- Ticking, on the record page rather than in a dialog ---------------------------------

const ticked = () => ({
  children: [
    { id: 'c1', collection: 'k1', values: { name: 'Needs attention', done: false, steps: [
      { id: 's1', label: 'Call Kevin', done: false },
      { id: 's2', label: 'Order 2x6', done: true },
    ] } },
    { id: 'c2', collection: 'k1', values: { name: 'Other', done: true } },
  ],
});

test('setting one field leaves the rest of the sub-item alone', () => {
  // updateChild REPLACES values. Routing an inline tick through it would have blanked the
  // name and the steps every time someone checked a box.
  const out = setChildValue(ticked(), 'c1', 'done', true);
  const c1 = out.find((c) => c.id === 'c1');
  assert.equal(c1.values.done, true);
  assert.equal(c1.values.name, 'Needs attention');
  assert.equal(c1.values.steps.length, 2);
  // And no other sub-item moves.
  assert.deepEqual(out.find((c) => c.id === 'c2').values, { name: 'Other', done: true });
});

test('a tick stamps the sub-item as edited', () => {
  assert.match(setChildValue(ticked(), 'c1', 'done', true).find((c) => c.id === 'c1').updatedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test('toggling a step flips that step and only that step', () => {
  const out = toggleChildStep(ticked(), 'c1', 'steps', 's1');
  const steps = out.find((c) => c.id === 'c1').values.steps;
  assert.equal(steps.find((s) => s.id === 's1').done, true);
  assert.equal(steps.find((s) => s.id === 's2').done, true, 's2 was already done and must stay done');
  // Order is what the user sees; a toggle must not reshuffle the list under their cursor.
  assert.deepEqual(steps.map((s) => s.id), ['s1', 's2']);
});

test('toggling an unchecked step back off works too', () => {
  assert.equal(
    toggleChildStep(ticked(), 'c1', 'steps', 's2').find((c) => c.id === 'c1').values.steps.find((s) => s.id === 's2').done,
    false,
  );
});

test('a step that is not there changes nothing', () => {
  // Stale markup from a render that raced a delete must not stamp updatedAt for no change.
  const item = ticked();
  assert.equal(toggleChildStep(item, 'c1', 'steps', 'gone'), item.children);
  assert.equal(toggleChildStep(item, 'nope', 'steps', 's1'), item.children);
});

test('a checklist opens out into tickable steps, never [object Object]', () => {
  // A checklist value is an array of {id, label, done}, so a plain join printed
  // "[object Object], [object Object], [object Object]".
  assert.doesNotMatch(page, /value\.join\(', '\)/);
  assert.match(page, /if \(f\.type === 'checklist'\) return checklistBlock\(f\);/);
  assert.match(page, /data-wb-child-step=/);
});

test('a sub-item is a card of labelled lines, not a row with a promoted title', () => {
  // One-line rows had to promote a field to a title, and two sub-items sharing that field's
  // value became indistinguishable -- two Dailies both reading "Lumen Marketing Account".
  assert.match(page, /<ul class="wb-child-list">/);
  assert.ok(!/wb-child-table|<thead>/.test(page), 'the table markup must be gone');
  assert.ok(!/childTitleField|CHILD_TITLE_TYPES/.test(page), 'nothing picks a title any more');
  assert.match(page, /class="wb-child-field"><span class="wb-child-flabel">/);
});


test('one checkbox becomes the row tick; several stay labelled in the meta line', () => {
  // Two checkboxes is a form, not a checklist — a bare tick would not say which one it was.
  assert.match(page, /const box = boxes\.length === 1 \? boxes\[0\] : null;/);
});

test('the ticks are wired to the model, and are dead for a viewer', () => {
  assert.match(page, /data-wb-child-check="\$\{h\(collection\.id\)\}:\$\{h\(child\.id\)\}:\$\{h\(box\.id\)\}"/);
  assert.match(page, /data-wb-child-step="\$\{h\(collection\.id\)\}:\$\{h\(child\.id\)\}:\$\{h\(f\.id\)\}:\$\{h\(s\.id\)\}"/);
  assert.match(page, /\$\{canManage \? '' : ' disabled'\}/);
  assert.match(main, /bind\('\[data-wb-child-check\]'/);
  assert.match(main, /bind\('\[data-wb-child-step\]'/);
  assert.match(main, /mod\.toggleChildStep\(item, childId, fieldId, stepId\)/);
  assert.match(main, /mod\.setChildValue\(item, childId, fieldId, !on\)/);
});

test('the sub-item dialog mounts its field controls', () => {
  // It rendered a checklist field's steps but bound nothing to them, so the boxes in the
  // dialog could not be ticked at all — and file, duration and progress were just as inert.
  const branch = main.slice(main.indexOf("if (m.kind === 'child-item') {"));
  const body = branch.slice(0, branch.indexOf('[data-wb-child-submit]'));
  for (const mount of ['wbMountFileFields', 'wbMountDurationFields', 'wbMountProgressFields', 'wbMountChecklistFields']) {
    assert.ok(body.includes(`${mount}(overlay);`), `${mount} must run for a sub-item too`);
  }
});

test('sub-item lists are one strip of tabs, not a stack of cards', () => {
  // Stacked, a record with three lists was three headings and three Add buttons deep before
  // the first row. The job file reads them as tabs because that is how they are used: one
  // list at a time, switching between them.
  assert.match(page, /<nav class="wb-child-tabs" aria-label="Sub-item lists">/);
  assert.match(page, /data-wb-child-tab="\$\{h\(c\.id\)\}"/);
  assert.match(main, /bind\('\[data-wb-child-tab\]'/);
});

test('the strip is drawn once, however many collection cards are placed', () => {
  // Two sub-item cards on a layout must not draw two identical strips.
  assert.match(page, /if \(placed\.length && placed\[0\]\.id !== block\.id\) return '';/);
});

test('an absorbed card takes no space, except while arranging', () => {
  // An empty bordered box reads as a broken card -- but in customise mode it has to stay, or
  // there is no way to move or remove it.
  assert.match(page, /if \(!body && !editing\) return '';/);
});

test('each tab carries its own count, and the Add button follows the selected one', () => {
  assert.match(page, /const n = children\.childCount\(item, c\.id\);/);
  assert.match(page, /data-wb-child-add="\$\{h\(collection\.id\)\}"><i class="ti ti-plus"><\/i>Add \$\{h\(one\)\}/);
});

test('a remembered tab that no longer exists falls back rather than showing nothing', () => {
  // Deleting a list while it is selected must not leave the strip pointing at a ghost.
  assert.match(page, /tabs\.some\(\(c\) => c\.id === state\.wbChildTab\) \? state\.wbChildTab : tabs\[0\]\.id/);
});
