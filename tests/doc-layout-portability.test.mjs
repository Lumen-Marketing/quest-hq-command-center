import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  DOC_LAYOUT_FORMAT, adoptLayout, buildLayout, layoutFieldRefs, missingNames, readLayout,
} from '../src/form/doc-portability.js';
import { normalizeDoc } from '../src/form/doc-model.js';

// "in the fields FORM i want to export the layout I made there ... If I can export this, I can
// import it too to other App with Form Field."
//
// The header band, the logo, the boxes that print the record's own fields -- that arrangement is
// work, and rebuilding it by hand in the next app is what this stops. The whole difficulty is one
// word: `from`. A field element stores the HOST record's field id, and an id means nothing in the
// app the layout is carried to. So the file writes down the NAME behind every id, and importing
// looks those names up where it lands.

const editor = readFileSync(new URL('../src/form/doc-editor.js', import.meta.url), 'utf8');

let n = 0;
const makeId = () => `new${++n}`;
test.beforeEach(() => { n = 0; });

const SOURCE_FIELDS = [
  { id: 'f-name', label: 'Client name', type: 'text' },
  { id: 'f-addr', label: 'Site address', type: 'location' },
  { id: 'f-logo', label: 'Photo', type: 'image' },
  { id: 'f-gone', label: 'Deleted field', type: 'text' },
];

const layoutDoc = () => normalizeDoc({
  title: 'Profile',
  page: { size: 'a4', landscape: false, margin: 12 },
  elements: [
    { id: 'e1', kind: 'text', x: 10, y: 10, w: 80, h: 12, text: 'PROPOSAL' },
    { id: 'e2', kind: 'field', x: 10, y: 30, w: 80, h: 10, from: 'f-name' },
    { id: 'e3', kind: 'field', x: 10, y: 45, w: 80, h: 10, from: 'f-addr' },
    { id: 'e4', kind: 'shape', shape: 'rect', x: 10, y: 60, w: 40, h: 40, from: 'f-logo' },
  ],
});

/* ---- what travels ------------------------------------------------------------------------ */

test('an export carries the page, the elements, and the NAME behind every field it prints', () => {
  const bundle = buildLayout(layoutDoc(), SOURCE_FIELDS, { from: 'Profile', exportedAt: '2026-08-19T00:00:00.000Z' });
  assert.equal(bundle.format, DOC_LAYOUT_FORMAT);
  assert.equal(bundle.page.margin, 12);
  assert.equal(bundle.elements.length, 4);
  // The dictionary is the whole reason a layout can travel. Ids alone would land pointing at
  // nothing in the app it is carried to.
  assert.deepEqual(bundle.fields, [
    { id: 'f-name', label: 'Client name', type: 'text' },
    { id: 'f-addr', label: 'Site address', type: 'location' },
    { id: 'f-logo', label: 'Photo', type: 'image' },
  ]);
});

test('a picture-filled shape counts as a field box too', () => {
  // Missing this is how a logo band arrives pointing at an app it has never heard of: the shape
  // holds `from` exactly the way a field element does.
  assert.deepEqual(layoutFieldRefs(layoutDoc().elements).sort(), ['f-addr', 'f-logo', 'f-name']);
});

test('the versions, the uploaded PDF and the record\'s values stay behind', () => {
  // A layout is the arrangement. The same line buildTemplate draws, for the same reason.
  const doc = normalizeDoc({
    elements: [{ kind: 'text', text: 'Hi' }],
    versions: [{ id: 'v1', name: 'Last week', elements: [] }],
    upload: { name: 'signed.pdf', src: 'data:application/pdf;base64,AAA' },
    source: 'upload',
  });
  const bundle = buildLayout(doc, []);
  assert.ok(!('versions' in bundle) && !('upload' in bundle) && !('source' in bundle.page));
});

test('a field the source record has since lost is left out of the dictionary', () => {
  const doc = normalizeDoc({ elements: [{ kind: 'field', from: 'f-vanished' }] });
  assert.deepEqual(buildLayout(doc, SOURCE_FIELDS).fields, []);
});

/* ---- what arrives ------------------------------------------------------------------------ */

test('a box finds its field again by NAME in the app it lands in', () => {
  const bundle = buildLayout(layoutDoc(), SOURCE_FIELDS);
  const here = [
    { id: 'z-9', label: 'client NAME ', type: 'text' },
    { id: 'z-4', label: 'Site address', type: 'text' },
    { id: 'z-7', label: 'Photo', type: 'image' },
  ];
  const taken = adoptLayout(readLayout(bundle), here, makeId);

  const from = taken.elements.map((el) => el.from || null);
  assert.deepEqual(from, [null, 'z-9', 'z-4', 'z-7']);
  assert.equal(taken.unmatched.length, 0);
  assert.equal(taken.matched.length, 3);
});

test('a box whose field this app has not got keeps its place and comes in unbound', () => {
  // NOT dropped. The editor already draws an unbound box as a grey "Pick a field", so the page
  // arrives whole and the boxes needing a decision are the ones that look like they do.
  // Dropping them would leave holes nobody could explain.
  const bundle = buildLayout(layoutDoc(), SOURCE_FIELDS);
  const taken = adoptLayout(readLayout(bundle), [{ id: 'z-9', label: 'Client name', type: 'text' }], makeId);

  assert.equal(taken.elements.length, 4, 'every element still arrives');
  const orphan = taken.elements[2];
  assert.equal(orphan.from, '');
  assert.deepEqual([orphan.x, orphan.y, orphan.w, orphan.h], [10, 45, 80, 10], 'it keeps its box');
  assert.deepEqual(missingNames(taken.unmatched), ['Site address', 'Photo']);
});

test('elements arrive with fresh ids', () => {
  const taken = adoptLayout(readLayout(buildLayout(layoutDoc(), SOURCE_FIELDS)), [], makeId);
  assert.deepEqual(taken.elements.map((el) => el.id), ['new1', 'new2', 'new3', 'new4']);
});

test('the layout is copied, not shared with the document it came from', () => {
  const doc = layoutDoc();
  const taken = adoptLayout(readLayout(buildLayout(doc, SOURCE_FIELDS)), [], makeId);
  taken.elements[0].text = 'EDITED';
  taken.page.margin = 40;
  assert.equal(doc.elements[0].text, 'PROPOSAL');
  assert.equal(doc.page.margin, 12);
});

test('a file with no page in it says so rather than blanking the document', () => {
  assert.equal(readLayout(null).ok, false);
  assert.equal(readLayout({ hello: 'world' }).ok, false);
  assert.match(readLayout({ elements: [] }).error, /nothing on the page/);
  // A whole document saved out by hand still reads as a layout; without a dictionary every box
  // simply lands unbound, which is a worse import but not a broken one.
  const bare = readLayout({ page: { margin: 8 }, elements: [{ kind: 'field', from: 'x' }] });
  assert.equal(bare.ok, true);
  assert.equal(adoptLayout(bare, [{ id: 'a', label: 'Anything' }], makeId).unmatched.length, 1);
});

/* ---- the surface it hangs off ------------------------------------------------------------- */

test('both buttons are in the rail, where starting a page already happens', () => {
  // Not the toolbar. PDF and Image up there export the finished DOCUMENT; this is the design,
  // and the rail is the part of the editor about where a page comes from.
  assert.match(editor, /data-fd-layout-export/);
  assert.match(editor, /data-fd-layout-import/);
  assert.match(editor, /<div class="fd-group-t">Reuse this layout<\/div>/);
  // Nothing on the page is nothing to export.
  assert.match(editor, /data-fd-layout-export \$\{doc\.elements\.length \? '' : 'disabled'\}/);
});

test('importing replaces the page the way a template does, and Undo covers it', () => {
  // Merging two layouts would stack one page on top of another. The document's own name, its
  // saved versions and any uploaded PDF are the document's, not the layout's.
  assert.match(editor, /commit\(\{ \.\.\.doc, page: taken\.page, elements: taken\.elements \}\);/);
  assert.match(editor, /Undo takes the whole thing back/);
});

test('a box can only be pointed at a field it could actually draw', () => {
  // `fields`, not `hostFields`: placeableFields already drops Button and Form, and matching a
  // name onto one of those would bind a box to something it cannot print.
  assert.match(editor, /const taken = adoptLayout\(found, fields, \(\) => uid\('e'\)\);/);
});
