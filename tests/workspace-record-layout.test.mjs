import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  BLOCK_TYPES, RECORD_COLUMNS, addBlock, blockFields, defaultLayout, layoutFor, moveBlock,
  normalizeBlock, removeBlock, reorderBlock, resizeBlock, unplacedFields,
} from '../src/workspace/record-layout.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const page = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8');
const model = readFileSync(new URL('../src/workspace/record-layout.js', import.meta.url), 'utf8');

const ids = () => { let n = 0; return () => `b${(n += 1)}`; };
const app = {
  id: 'a1',
  fields: [
    { id: 'f1', type: 'text', label: 'Job' },
    { id: 'f2', type: 'text', label: 'Client' },
    { id: 'f3', type: 'status', label: 'Stage', config: { options: [] } },
  ],
};

test('the layout belongs to the app, so every record shares it', () => {
  // A record page is a form you read. One that changed shape per row would be unreadable.
  assert.match(main, /recordLayout: Array\.isArray\(app\.recordLayout\) \? app\.recordLayout : null,/);
  assert.match(main, /app\.recordLayout = change\(mod\.layoutFor\(app\), mod\);\n\s*wbSave\(companyId\);/);
  assert.match(page, /This layout applies to every record in this app\./);
});

test('never arranged and arranged to be empty are different', () => {
  assert.ok(layoutFor({ ...app, recordLayout: null }, ids()).length > 0);
  assert.deepEqual(layoutFor({ ...app, recordLayout: [] }, ids()), []);
});

test('the default is what the fixed page already showed', () => {
  // Turning this on changes nothing until somebody chooses to change it.
  assert.deepEqual(defaultLayout(app, ids()).map((b) => [b.type, b.size]), [['fields', 2], ['comments', 2]]);
});

test('a block normalises into range rather than disappearing', () => {
  assert.equal(normalizeBlock({ type: 'fields', size: 9 }).size, RECORD_COLUMNS);
  assert.equal(normalizeBlock({ type: 'fields', size: 0 }).size, 1);
  assert.equal(normalizeBlock({ type: 'nonsense' }).type, 'fields');
  assert.ok(normalizeBlock({}).id);
});

// --- which fields a group shows -------------------------------------------------------------

test('a group set to every field picks up fields added later', () => {
  // fieldIds null means "whatever exists", so adding a field does not need a trip back to
  // the layout editor before it shows on any record.
  const block = normalizeBlock({ type: 'fields' });
  assert.equal(block.config.fieldIds, null);
  assert.deepEqual(blockFields(app, block).map((f) => f.id), ['f1', 'f2', 'f3']);
  const withNew = { ...app, fields: [...app.fields, { id: 'f4', label: 'New' }] };
  assert.deepEqual(blockFields(withNew, block).map((f) => f.id), ['f1', 'f2', 'f3', 'f4']);
});

test('an explicit list is honoured, in the app own field order', () => {
  // Not the order they were ticked: the field builder decides the order everywhere else.
  const block = normalizeBlock({ type: 'fields', config: { fieldIds: ['f3', 'f1'] } });
  assert.deepEqual(blockFields(app, block).map((f) => f.id), ['f1', 'f3']);
});

test('a field deleted since is dropped rather than rendering blank', () => {
  const block = normalizeBlock({ type: 'fields', config: { fieldIds: ['f1', 'gone'] } });
  assert.deepEqual(blockFields(app, block).map((f) => f.id), ['f1']);
});

test('a new group starts empty, not holding every field', () => {
  // It is being added alongside one that already shows them; two panels listing the same
  // fields is the confusing outcome, not the helpful one.
  const added = addBlock([], 'fields', app, ids());
  assert.deepEqual(added[0].config.fieldIds, []);
  assert.deepEqual(addBlock([], 'nonsense', app, ids()), []);
});

test('fields nobody placed are reported, so they cannot silently vanish', () => {
  const blocks = [normalizeBlock({ type: 'fields', config: { fieldIds: ['f1'] } })];
  assert.deepEqual(unplacedFields(app, blocks).map((f) => f.id), ['f2', 'f3']);
  // A group set to "all fields" covers everything, so nothing is missing.
  assert.deepEqual(unplacedFields(app, [normalizeBlock({ type: 'fields' })]), []);
  assert.match(page, /Not on the page: /);
});

// --- arranging ---------------------------------------------------------------------------

test('arranging reuses the dashboard functions rather than copying them', () => {
  // They only ever touch id and size, so they work on any arrangement. A second copy would
  // drift the first time one of them was fixed.
  assert.match(model, /import \{ moveWidget, removeWidget, reorderWidget, resizeWidget \} from '\.\/dashboard-widgets\.js';/);
  assert.ok(!/function moveBlock/.test(model));
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(moveBlock(list, 'b', 'up').map((b) => b.id), ['b', 'a', 'c']);
  assert.deepEqual(reorderBlock(list, 'a', 'c').map((b) => b.id), ['b', 'c', 'a']);
  assert.deepEqual(removeBlock(list, 'b').map((b) => b.id), ['a', 'c']);
  assert.deepEqual(resizeBlock([normalizeBlock({ id: 'a', type: 'fields' })], 'a', 3)[0].size, 3);
});

test('every card type the catalogue offers can actually render', () => {
  for (const meta of BLOCK_TYPES) {
    assert.ok(new RegExp(`block\\.type === '${meta.type}'`).test(page) || meta.type === 'fields',
      `${meta.type} is offered but has no body`);
  }
});

// --- wiring ---------------------------------------------------------------------------------

test('the page is fetched on demand and imports its model directly', () => {
  // A pure leaf module, so no cycle back to main.js — and a static import cannot be null the
  // way a fetched one can, which is what the old two-step dance had to guard against.
  assert.ok(!/^import .*workspace\/record-page/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/workspace\/record-page\.js'\)/);
  assert.match(page, /import \* as recordLayout from '\.\/record-layout\.js';/);
  assert.ok(!/questLoader/.test(page), 'nothing to wait for means nothing to show a loader for');
});

test('customising the layout is a write, and checks for it', () => {
  const edit = main.match(/async function wbRecordEdit\([\s\S]*?\n\}/)?.[0] || '';
  assert.match(edit, /if \(!app \|\| !can\('workspaces\.manage', companyId\)\) return;/);
});

test('the record grid drags with the same mount as the dashboard', () => {
  assert.match(main, /mountWbRecordDrag\(companyId, workspaceId, appId\);/);
  assert.match(page, /data-wb-rec-id="\$\{h\(block\.id\)\}" \$\{editing \? 'draggable="true"' : ''\}/);
});
