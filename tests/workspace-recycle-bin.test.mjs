import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  TRASH_DAYS,
  createRecycleBin,
  emptyTrash,
  expiredInTrash,
  purgeFromTrash,
  restoreFromTrash,
  sendToTrash,
} from '../src/workspace/recycle-bin.js';

// "Add a recycle bin for the deleted items on the workspace app builder, between Automations
// and Settings, so if records is accidentally deleted we can recover it."
//
// Deleting a record used to drop it out of app.items and that was that.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const app = () => ({
  id: 'app1',
  name: 'Leads',
  fields: [{ id: 'f', type: 'text', label: 'Name', config: {} }],
  items: [
    { id: 'i1', values: { f: 'Kevin' } },
    { id: 'i2', values: { f: 'Ana' } },
    { id: 'i3', values: { f: 'Ben' } },
  ],
});

test('deleting moves a record to the bin instead of destroying it', () => {
  const a = app();
  assert.equal(sendToTrash(a, ['i2'], 'me'), 1);
  assert.deepEqual(a.items.map((i) => i.id), ['i1', 'i3']);
  assert.equal(a.trash.length, 1);
  assert.equal(a.trash[0].values.f, 'Ana', 'with everything it held');
  assert.ok(a.trash[0].deletedAt, 'and when it went');
  assert.equal(a.trash[0].deletedBy, 'me', 'and who sent it');
});

test('deleting several at once puts them all in', () => {
  const a = app();
  assert.equal(sendToTrash(a, ['i1', 'i3']), 2);
  assert.deepEqual(a.items.map((i) => i.id), ['i2']);
  assert.deepEqual(a.trash.map((i) => i.id), ['i1', 'i3']);
});

test('deleting nothing reports nothing, rather than claiming a delete', () => {
  const a = app();
  assert.equal(sendToTrash(a, []), 0);
  assert.equal(sendToTrash(a, ['nope']), 0);
  assert.equal(a.items.length, 3);
});

test('the newest deletion is at the top, which is where somebody looks first', () => {
  const a = app();
  sendToTrash(a, ['i1']);
  sendToTrash(a, ['i3']);
  assert.deepEqual(a.trash.map((i) => i.id), ['i3', 'i1']);
});

test('restoring puts the record back, with what it held', () => {
  const a = app();
  sendToTrash(a, ['i2'], 'me');
  const back = restoreFromTrash(a, 'i2');
  assert.equal(back.values.f, 'Ana');
  assert.equal(a.trash.length, 0);
  assert.deepEqual(a.items.map((i) => i.id), ['i2', 'i1', 'i3'], 'at the top: its old position was never recorded');
  assert.equal(a.items[0].deletedAt, undefined, 'and it is no longer marked as deleted');
  assert.equal(a.items[0].deletedBy, undefined);
});

test('restoring something that is not in the bin changes nothing', () => {
  const a = app();
  assert.equal(restoreFromTrash(a, 'i1'), null);
  assert.equal(a.items.length, 3);
});

test('a restore cannot produce the same record twice', () => {
  const a = app();
  sendToTrash(a, ['i2']);
  a.items.push({ id: 'i2', values: { f: 'a copy that got back somehow' } });
  restoreFromTrash(a, 'i2');
  assert.equal(a.items.filter((i) => i.id === 'i2').length, 1);
});

test('purging one is final, and empties only that one', () => {
  const a = app();
  sendToTrash(a, ['i1', 'i2']);
  assert.equal(purgeFromTrash(a, 'i1'), true);
  assert.deepEqual(a.trash.map((i) => i.id), ['i2']);
  assert.equal(purgeFromTrash(a, 'i1'), false, 'and says so when there is nothing to purge');
  assert.equal(restoreFromTrash(a, 'i1'), null, 'nothing comes back from there');
});

test('emptying the bin reports how many it destroyed', () => {
  const a = app();
  sendToTrash(a, ['i1', 'i2', 'i3']);
  assert.equal(emptyTrash(a), 3);
  assert.deepEqual(a.trash, []);
  assert.equal(emptyTrash(a), 0);
});

test('old records are reported, never swept', () => {
  // A bin that quietly destroys things on a timer is one nobody can rely on -- and there is no
  // scheduled job here to run the sweep honestly anyway.
  const a = app();
  sendToTrash(a, ['i1']);
  a.trash[0].deletedAt = new Date(Date.now() - ((TRASH_DAYS + 1) * 86400000)).toISOString();
  sendToTrash(a, ['i2']);
  assert.deepEqual(expiredInTrash(a).map((i) => i.id), ['i1']);
  assert.equal(a.trash.length, 2, 'both are still there');
});

// ---- the tab, and the way in --------------------------------------------------------------

test('the bin is a tab between Automations and Settings', () => {
  // The default order. An app can hide and reorder its tabs from Settings; this is what it
  // starts with.
  const tabs = main.match(/const WB_ALL_TABS = \[([^\]]*)\]/)[1].split(',').map((t) => t.trim().replace(/'/g, ''));
  assert.deepEqual(tabs.slice(-3), ['automations', 'trash', 'settings'], 'exactly where it was asked for');
  assert.match(main, /trash: `Recycle bin\$\{\(app\.trash \|\| \[\]\)\.length \? ` <b>\$\{app\.trash\.length\}<\/b>` : ''\}`/);
});

test('deleting a record routes into the bin, and no longer promises to destroy it', () => {
  assert.match(main, /wbTrashItems\(companyId, workspace, app, \[c\.itemId\]\)/);
  assert.match(main, /wbTrashItems\(companyId, workspace, app, \[\.\.\.kill\]\)/);
  assert.ok(!main.includes('This record will be permanently removed.'), 'the old wording is gone');
  assert.match(main, /moves to the app’s recycle bin, where it can be restored/);
});

test('the bin survives a save and a reload', () => {
  // The doc normalizer rebuilds every app explicitly, so anything it does not name is dropped
  // on the first round-trip.
  assert.match(main, /trash: Array\.isArray\(app\.trash\) \? app\.trash\.map\(\(item\) => \(\{ \.\.\.normalizeWbItem\(item\), deletedAt:/);
  assert.match(main, /items: Array\.isArray\(app\.items\) \? app\.items\.map\(normalizeWbItem\) : \[\]/);
});

test('a record that arrived by Button keeps saying so', () => {
  // Found while adding the bin: pushedFrom was being stripped by the same normalizer, so the
  // provenance the Button writes never survived the first save.
  assert.match(main, /\.\.\.\(item\.pushedFrom && typeof item\.pushedFrom === 'object' \? \{ pushedFrom: item\.pushedFrom \} : \{\}\)/);
});

// ---- what it looks like ------------------------------------------------------------------

const view = (a, canManage = true) => createRecycleBin({
  h: (v) => String(v ?? ''),
  can: () => canManage,
  wbItemTitle: (_app, item) => item.values.f || 'Untitled',
  wbTimeAgo: () => '2 hours ago',
  formatDate: (v) => String(v),
  memberName: () => 'Abe',
  emptyState: (msg) => `<div class="empty">${msg}</div>`,
}).wbViewRecycleBin('co', {}, a);

test('an empty bin says so rather than showing a bare heading', () => {
  assert.match(view(app()), /Nothing has been deleted from this app/);
});

test('the bin lists what went, when, and who sent it', () => {
  const a = app();
  sendToTrash(a, ['i2'], 'u1');
  const html = view(a);
  assert.match(html, /Ana/);
  assert.match(html, /Deleted 2 hours ago by Abe/);
  assert.match(html, /data-wb-trash-restore="i2"/);
  assert.match(html, /data-wb-trash-purge="i2"/);
  assert.match(html, /data-wb-trash-empty/);
});

test('somebody who cannot manage the workspace can look but not touch', () => {
  const a = app();
  sendToTrash(a, ['i2']);
  const html = view(a, false);
  assert.match(html, /Ana/, 'they can see what is in there');
  assert.ok(!/data-wb-trash-restore/.test(html));
  assert.ok(!/data-wb-trash-purge/.test(html));
  assert.ok(!/data-wb-trash-empty/.test(html));
});

test('a long-sitting record is pointed out, with the rule stated', () => {
  const a = app();
  sendToTrash(a, ['i1']);
  a.trash[0].deletedAt = new Date(Date.now() - ((TRASH_DAYS + 2) * 86400000)).toISOString();
  const html = view(a);
  assert.match(html, new RegExp(`more than ${TRASH_DAYS} days`));
  assert.match(html, /only empties when somebody empties it/);
});

test('every class the bin uses is styled', () => {
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
  const a = app();
  sendToTrash(a, ['i1']);
  a.trash[0].deletedAt = new Date(Date.now() - ((TRASH_DAYS + 2) * 86400000)).toISOString();
  const used = new Set();
  for (const match of view(a).matchAll(/class="([^"]+)"/g)) {
    match[1].split(/\s+/).filter(Boolean).forEach((name) => used.add(name));
  }
  [...used].filter((name) => name.startsWith('wb-trash')).forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} is emitted but has no CSS rule`);
  });
});
