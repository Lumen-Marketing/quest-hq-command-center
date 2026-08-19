import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  BLOCK_TYPES, QUICK_CREATE, blockMeta, blockSupported, layoutFor, normalizeBlock,
  placeFieldInLayout, quickCreateField, quickEntry,
} from '../src/workspace/record-layout.js';

// "Add a new tile Quick Create... special fields that when you create it it will automatically
// attach to the current opened record, and it will open a modal for it."
//
// The App Builder keys a record's values by field id and has no per-record attachment slot, so
// "attached to this record" means: the app gains a field of that type and THIS record's value of
// it is opened. These are the rules that follow from that.

const page = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8');
const quick = readFileSync(new URL('../src/workspace/quick-create.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const ids = () => { let n = 0; return () => `new-${(n += 1)}`; };

// ---- the tile ---------------------------------------------------------------------------------

test('Quick Create is offered as a card like any other', () => {
  const meta = blockMeta('quick');
  assert.ok(meta, 'it must be in BLOCK_TYPES or the Add-a-card dialog never lists it');
  assert.equal(meta.label, 'Quick Create');
  assert.equal(meta.config, false, 'there is nothing to configure on it');
  assert.ok(BLOCK_TYPES.some((entry) => entry.type === 'quick'));
  // Unlike Sub-items it needs nothing to exist first, so it is never offered blocked.
  assert.equal(blockSupported({ collections: [] }, 'quick'), true);
  // And it survives the normalizer rather than falling back to a field group.
  assert.equal(normalizeBlock({ type: 'quick' }, ids()).type, 'quick');
});

// ---- which field it writes into -----------------------------------------------------------------
//
// No TILE makes a field any more -- Spreadsheet, Form, Image and File were removed because each
// one added a column to the APP the first time it was pressed, so a spreadsheet made for one job
// put an empty box on every other record for ever. The helper stays: "New Field" is the tile that
// replaces them, and finding-or-making a field is what it will do. Driven by a literal entry now
// rather than through quickEntry, so these guard the helper rather than a tile that has gone.

const sheetEntry = { key: 'sheet', field: 'sheet', name: 'Spreadsheet' };

test('the field is made once and reused, not once per press', () => {
  const app = { fields: [] };
  const first = quickCreateField(app, sheetEntry, ids());
  assert.equal(first.created, true);
  assert.equal(first.field.type, 'sheet');
  assert.equal(first.field.label, 'Spreadsheet');

  app.fields.push(first.field);
  const second = quickCreateField(app, sheetEntry, ids());
  assert.equal(second.created, false, 'a second press must not grow a second column');
  assert.equal(second.field, first.field);
});

test('it matches on type, so a renamed field is still the same one', () => {
  // Somebody who renames "Spreadsheet" to "Takeoff" has not asked for a second spreadsheet.
  const app = { fields: [{ id: 'f1', label: 'Takeoff', type: 'sheet' }] };
  const found = quickCreateField(app, sheetEntry, ids());
  assert.equal(found.created, false);
  assert.equal(found.field.id, 'f1');
});

test('a hidden field of that type is not reused', () => {
  // Hidden means it is not on the page, so opening it would open nothing anybody can see.
  const app = { fields: [{ id: 'f1', label: 'Spreadsheet', type: 'sheet', hidden: true }] };
  assert.equal(quickCreateField(app, sheetEntry, ids()).created, true);
});

test('no tile makes a field any more', () => {
  QUICK_CREATE.forEach((entry) => {
    assert.ok(entry.key && entry.label, `${entry.key} needs a key and a label`);
    assert.ok(entry.module, `${entry.key} does nothing`);
    assert.equal(entry.field, undefined, `${entry.key} must not add a column to the app`);
  });
  assert.equal(quickEntry('nonsense'), null);
  for (const gone of ['sheet', 'form', 'image', 'file']) {
    assert.equal(quickEntry(gone), null, `${gone} was removed on request`);
  }
});

// ---- a new field has to be visible --------------------------------------------------------------

test('a made field is placed in the layout, or it is invisible on the page', () => {
  // blockFields honours an explicit fieldIds list EXACTLY. A field in none of them renders
  // nowhere, with nothing on screen to say why -- so Quick Create would look broken the first
  // time it was pressed on a customised layout.
  const blocks = [
    { id: 'b1', type: 'fields', config: { fieldIds: ['a'] } },
    { id: 'b2', type: 'fields', config: { fieldIds: ['b'] } },
    { id: 'b3', type: 'comments', config: {} },
  ];
  const out = placeFieldInLayout(blocks, 'new-1');
  assert.deepEqual(out[1].config.fieldIds, ['b', 'new-1'], 'appended to the last group');
  assert.deepEqual(out[0].config.fieldIds, ['a'], 'the others are untouched');
  assert.notEqual(out, blocks, 'the blocks are replaced, not mutated');
});

test('a layout that already shows every field is left alone', () => {
  // fieldIds: null means "whatever fields exist", which is already true of the new one. Pinning
  // it to a list it never had would freeze that group to the fields present today.
  const blocks = [{ id: 'b1', type: 'fields', config: { fieldIds: null } }];
  assert.equal(placeFieldInLayout(blocks, 'new-1'), blocks);
  assert.equal(placeFieldInLayout([], 'new-1').length, 0);
  assert.deepEqual(placeFieldInLayout(null, 'new-1'), []);
});

test('placing the same field twice does not list it twice', () => {
  const blocks = [{ id: 'b1', type: 'fields', config: { fieldIds: ['a', 'new-1'] } }];
  assert.equal(placeFieldInLayout(blocks, 'new-1'), blocks, 'it renders twice if it is listed twice');
});

test('a layout with no field group at all is left alone', () => {
  // Nothing to append to, and inventing a group would be a layout change nobody asked for.
  const blocks = [{ id: 'b1', type: 'quick', config: {} }];
  assert.equal(placeFieldInLayout(blocks, 'new-1'), blocks);
});

// ---- the card ------------------------------------------------------------------------------------

test('the card draws only what actually works', () => {
  // Proposal is declared in the model -- it is next -- but nothing creates one yet, and a button
  // that does nothing is worse than one that is not there.
  //
  // The card selects on the model own `soon` flag rather than on `entry.field`. Selecting on
  // the field dropped Task as well, which is a row in public.tasks rather than a column on the
  // app -- written, tested, and unreachable, with every one of its own tests passing.
  assert.match(page, /\.filter\(\(entry\) => !entry\.soon\)/);
  assert.match(page, /data-wb-quick="\$\{h\(entry\.key\)\}"/);
  assert.ok(QUICK_CREATE.some((entry) => entry.key === 'proposal' && entry.soon));
  assert.ok(QUICK_CREATE.some((entry) => entry.key === 'task' && !entry.soon), 'Task works, so it is drawn');
});

test('only a manager sees the card, and the press is checked again anyway', () => {
  assert.match(page, /if \(block\.type === 'quick'\)[\s\S]{0,400}?if \(!canManage\) return ''/);
  // A card left open in a tab whose permission has since gone must not still write.
  assert.match(quick, /if \(!can\('workspaces\.manage', companyId\)\)/);
});

test('the card carries the record it is on, because the listener outlives the render', () => {
  assert.match(page, /data-wb-quick-seat="\$\{h\(\[companyId, workspace\.id, app\.id, item\.id\]\.join\('\|'\)\)\}"/);
  assert.match(page, /closest\('\[data-wb-quick-seat\]'\)/);
  assert.match(page, /if \(!itemId\) return;/, 'a card with no seat must do nothing, not guess');
});

test('the button is held while it works', () => {
  // Making a field and then opening an editor is two awaits. A second press in between makes a
  // second field.
  assert.match(page, /button\.disabled = true;/);
  assert.match(page, /\.finally\(\(\) => \{ button\.disabled = false; \}\)/);
  assert.match(page, /if \(button\.disabled\) return;/);
});

test('it binds itself rather than adding a case to the entry bundle', () => {
  // The record page module is already fetched whenever a record is on screen, and main.js has no
  // room. One listener for the module's life, so a re-rendered card is never dead.
  assert.match(page, /document\.addEventListener\('click'/);
  assert.match(page, /if \(quickBound \|\| typeof document === 'undefined'\) return;/);
  assert.ok(!/data-wb-quick/.test(main), 'main.js must not learn about the buttons');
});

test('main.js hands over every key the press needs', () => {
  // Missing one is a ReferenceError on the first press and on no earlier code path.
  const at = main.indexOf('createRecordPage({');
  const passed = main.slice(at, main.indexOf('});', at));
  for (const key of ['wbDoc', 'wbSave', 'wbUid', 'render', 'showToast', 'can', 'memberName',
    // The Task tile opens the record's own task modal rather than writing a second one.
    'openRecordTask']) {
    assert.ok(passed.includes(key), `main.js must pass ${key}`);
  }
});

test('the seat is one string of four ids, the shape everything else already takes', () => {
  // Built once on the card and read back at press time; a second shape here would be a second
  // thing to keep in step.
  assert.match(quick, /\[companyId, workspaceId, appId, itemId\]\.join\('\|'\)/);
});

test('the tiles that make a column on every record are gone for good', () => {
  // Spreadsheet, Form, Image and File each added a field to the APP on first press. Pressing one
  // for a single job put an empty box on every other record for ever, so they were removed. If
  // one comes back it must come back deliberately, not by a stray import.
  for (const dead of ['sheet-editor.js', 'doc-editor.js', 'data-wb-inline=']) {
    assert.ok(!quick.includes(dead), `${dead} belongs to a tile that was removed`);
  }
});

test('every class the card uses is styled', () => {
  ['wb-quick-grid', 'wb-quick-btn', 'wb-quick-ic', 'wb-quick-label',
    // ...and the dialog all four tiles now open.
    'wb-quick-modal', 'wb-quick-dialog', 'wb-quick-field', 'wb-quick-row', 'wb-quick-acts',
    'wb-quick-sec', 'wb-quick-now',
    // ...and the icon dropdown the field type is chosen from, which replaced a <select>
    // because a <select> cannot draw an icon inside an <option>.
    'wb-pick', 'wb-pick-btn', 'wb-pick-list', 'wb-pick-opt', 'wb-pick-ic', 'wb-pick-txt',
    'wb-seg', 'wb-seg-btn'].forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  });
});

test('a saved Quick Create card survives a reload', () => {
  const app = { recordLayout: [{ id: 'b1', type: 'quick', size: 2, config: {} }] };
  assert.equal(layoutFor(app, ids())[0].type, 'quick');
});
