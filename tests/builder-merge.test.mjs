import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { deepEqual, describeConflicts, mergeBuilderDocs } from '../src/workspace/builder-merge.js';

// Normalised: the working tree is CRLF, so a bare \n boundary would silently slice
// past the end of the function and assert against unrelated code.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const clone = (value) => JSON.parse(JSON.stringify(value));
const app = (id, name, extra = {}) => ({ id, name, fields: [], items: [], ...extra });
const ws = (id, name, apps = []) => ({ id, name, apps, members: [] });
const doc = (...workspaces) => ({ workspaces });

test('edits to different apps both survive — the common case needs no user involvement', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a2', 'Punchlist')]));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Roof Inspections'), app('a2', 'Punchlist')]));
  const theirs = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a2', 'Punch List')]));

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps.map((a) => a.name), ['Roof Inspections', 'Punch List']);
  assert.equal(conflicts.length, 0);
});

test('an app added remotely is not erased by a local save', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'Inspections')]));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a2', 'Mine')]));
  const theirs = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a3', 'Theirs')]));

  const { doc: merged } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps.map((a) => a.id), ['a1', 'a2', 'a3']);
});

test('records added to the same app by two people are both kept', () => {
  const withItems = (items) => doc(ws('w1', 'Ops', [app('a1', 'Inspections', { items })]));
  const base = withItems([{ id: 'i1', values: { name: 'One' } }]);
  const mine = withItems([{ id: 'i1', values: { name: 'One' } }, { id: 'i2', values: { name: 'Mine' } }]);
  const theirs = withItems([{ id: 'i1', values: { name: 'One' } }, { id: 'i3', values: { name: 'Theirs' } }]);

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps[0].items.map((i) => i.id), ['i1', 'i2', 'i3']);
  assert.equal(conflicts.length, 0);
});

test('two people editing different columns of one record both land', () => {
  const withItem = (values) => doc(ws('w1', 'Ops', [app('a1', 'Inspections', { items: [{ id: 'i1', values }] })]));
  const base = withItem({ status: 'open', owner: 'Manny' });
  const mine = withItem({ status: 'closed', owner: 'Manny' });
  const theirs = withItem({ status: 'open', owner: 'Jesus' });

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps[0].items[0].values, { status: 'closed', owner: 'Jesus' });
  assert.equal(conflicts.length, 0);
});

test('a deletion is honoured when the other side left the entry alone', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a2', 'Punchlist')]));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Inspections')]));
  const theirs = doc(ws('w1', 'Ops', [app('a1', 'Inspections'), app('a2', 'Punchlist')]));

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps.map((a) => a.id), ['a1']);
  assert.equal(conflicts.length, 0);
});

test('work edited locally is not destroyed by a remote delete — it comes back, and is reported', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'Inspections')]));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Inspections', { items: [{ id: 'i1', values: { note: 'hours of work' } }] })]));
  const theirs = doc(ws('w1', 'Ops', []));

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps[0].items[0].values, { note: 'hours of work' });
  assert.equal(conflicts[0].kind, 'deleted-remotely-edited-locally');
});

test('the same field changed on both sides keeps the local value and reports it', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'Inspections')]));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Roof Inspections')]));
  const theirs = doc(ws('w1', 'Ops', [app('a1', 'Site Inspections')]));

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.equal(merged.workspaces[0].apps[0].name, 'Roof Inspections');
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, 'both-edited');
  assert.equal(conflicts[0].theirs, 'Site Inspections');
  assert.equal(describeConflicts(conflicts, merged), 'Ops / Roof Inspections');
});

test('field definitions added concurrently to one app both survive', () => {
  const withFields = (fields) => doc(ws('w1', 'Ops', [app('a1', 'Inspections', { fields })]));
  const base = withFields([{ id: 'f1', label: 'Address', type: 'text' }]);
  const mine = withFields([{ id: 'f1', label: 'Address', type: 'text' }, { id: 'f2', label: 'Roof pitch', type: 'text' }]);
  const theirs = withFields([{ id: 'f1', label: 'Address', type: 'text' }, { id: 'f3', label: 'Squares', type: 'number' }]);

  const { doc: merged } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps[0].fields.map((f) => f.label), ['Address', 'Roof pitch', 'Squares']);
});

test('a local reorder is preserved rather than reverted to the server order', () => {
  const base = doc(ws('w1', 'Ops', [app('a1', 'A'), app('a2', 'B'), app('a3', 'C')]));
  const mine = doc(ws('w1', 'Ops', [app('a3', 'C'), app('a1', 'A'), app('a2', 'B')]));
  const theirs = doc(ws('w1', 'Ops', [app('a1', 'A'), app('a2', 'B'), app('a3', 'C')]));

  const { doc: merged } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps.map((a) => a.id), ['a3', 'a1', 'a2']);
});

test('a whole workspace added remotely is kept when the local copy never saw it', () => {
  const base = doc(ws('w1', 'Ops'));
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Mine')]));
  const theirs = doc(ws('w1', 'Ops'), ws('w2', 'Sales'));

  const { doc: merged } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces.map((w) => w.id), ['w1', 'w2']);
  assert.equal(merged.workspaces[0].apps.length, 1);
});

test('without a common ancestor nothing is deleted — an unknown base keeps both sides', () => {
  const mine = doc(ws('w1', 'Ops', [app('a1', 'Mine')]));
  const theirs = doc(ws('w1', 'Ops', [app('a2', 'Theirs')]));

  const { doc: merged } = mergeBuilderDocs(null, mine, theirs);
  assert.deepEqual(merged.workspaces[0].apps.map((a) => a.id), ['a1', 'a2']);
});

test('merging identical documents changes nothing and reports nothing', () => {
  const only = doc(ws('w1', 'Ops', [app('a1', 'Inspections', { items: [{ id: 'i1', values: { a: 1 } }] })]));
  const { doc: merged, conflicts } = mergeBuilderDocs(only, clone(only), clone(only));
  assert.deepEqual(merged, only);
  assert.equal(conflicts.length, 0);
});

test('member lists and other plain arrays fall back to the local value on a genuine clash', () => {
  const base = doc({ ...ws('w1', 'Ops'), members: ['a'] });
  const mine = doc({ ...ws('w1', 'Ops'), members: ['a', 'b'] });
  const theirs = doc({ ...ws('w1', 'Ops'), members: ['a', 'c'] });

  const { doc: merged, conflicts } = mergeBuilderDocs(base, mine, theirs);
  assert.deepEqual(merged.workspaces[0].members, ['a', 'b']);
  assert.equal(conflicts.length, 1);
});

test('deepEqual ignores key order, which JSONB does not preserve', () => {
  assert.ok(deepEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 1, b: 2 }));
  assert.ok(!deepEqual([1, 2], [2, 1]));
});

// --- wiring: the merge is worthless if the save still overwrites blindly ---------

test('the builder save is a guarded update, not a blind upsert', () => {
  const save = main.slice(main.indexOf('async function saveWorkspaceBuilderDoc'));
  const body = save.slice(0, save.indexOf('\n}\n'));
  assert.ok(!/\.upsert\(/.test(body), 'saveWorkspaceBuilderDoc must not blind-upsert the shared doc');
  assert.ok(/\.eq\('updated_at'/.test(body), 'the write must be conditional on the version it was based on');
});

test('a lost update is detected rather than assumed impossible', () => {
  assert.ok(main.includes('wbDocBase'), 'the last-synced document must be retained as the merge ancestor');
  assert.ok(main.includes('mergeBuilderDocs'), 'a detected collision must merge, not discard');
});
