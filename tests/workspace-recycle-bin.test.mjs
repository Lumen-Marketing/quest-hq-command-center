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
  purgeFieldFromTrash,
  purgeFromTrash,
  restoreFieldFromTrash,
  restoreFromTrash,
  sendFieldsToTrash,
  sendToTrash,
  sendToTrashAndSave,
  trashTotals,
  trashedFieldValueCount,
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

test('a delete does not finish until the updated recycle bin is durably saved', async () => {
  const a = app();
  let release;
  let finished = false;
  const save = () => new Promise((resolve) => { release = resolve; });

  const deleting = sendToTrashAndSave(a, ['i2'], 'me', save).then((moved) => {
    finished = true;
    return moved;
  });

  await Promise.resolve();
  assert.equal(finished, false, 'the UI must not report success while the save is still in flight');
  assert.deepEqual(a.items.map((item) => item.id), ['i1', 'i3']);
  release();
  assert.equal(await deleting, 1);
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

test('the bin is a tab between Automations and Import & export', () => {
  // The default order. An app can hide and reorder its tabs from Settings; this is what it
  // starts with.
  const tabs = main.match(/const WB_ALL_TABS = \[([^\]]*)\]/)[1].split(',').map((t) => t.trim().replace(/'/g, ''));
  assert.deepEqual(tabs.slice(-4), ['automations', 'trash', 'transfers', 'settings'], 'exactly where it was asked for');
  assert.match(main, /trash: `Recycle bin\$\{\(app\.trash \|\| \[\]\)\.length \? ` <b>\$\{app\.trash\.length\}<\/b>` : ''\}`/);
});

test('deleting a record routes into the bin, and no longer promises to destroy it', () => {
  assert.match(main, /wbTrashItems\(companyId, workspace, app, \[c\.itemId\]\)/);
  assert.match(main, /wbTrashItems\(companyId, workspace, app, \[\.\.\.kill\]\)/);
  assert.ok(!main.includes('This record will be permanently removed.'), 'the old wording is gone');
  assert.match(main, /moves to the app’s recycle bin, where it can be restored/);
});

test('the confirmation waits for the recycle-bin write before closing and rendering', () => {
  assert.match(main, /const moved = await wbTrashItems\(companyId, workspace, app, \[c\.itemId\]\)/);
  assert.match(main, /await wbTrashItems\(companyId, workspace, app, \[\.\.\.kill\]\)/);
});

test('bulk-delete activity is included in the same durable save as the deleted records', () => {
  const bulkDelete = main.match(/else if \(c\.op === 'del-items'\) \{([\s\S]*?)\n  \} else if \(c\.op === 'del-auto'\)/)?.[1] || '';
  assert.ok(bulkDelete.indexOf('wbLogActivity(workspace') < bulkDelete.indexOf('await wbTrashItems('));
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

const view = (a, canManage = true, isOwner = true) => createRecycleBin({
  h: (v) => String(v ?? ''),
  can: () => canManage,
  isCompanyOwner: () => isOwner,
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
  const styles = (readFileSync(join(root, 'src', 'styles.css'), 'utf8') + '\n' + readFileSync(join(root, 'src', 'workspace', 'builder.css'), 'utf8'));
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

// ---- deleted FIELDS ----------------------------------------------------------------------
//
// Deleting a field used to run `delete it.values[fieldId]` over every record, destroying the
// column's data with nothing to rebuild from -- no deleted_at, no history table, and automatic
// backups off by default.
//
// That is not hypothetical. On 2026-08-15 the equivalent delete on Company Contacts orphaned 17
// contacts' values, and they were only recovered because THAT table leaves its values behind.
// This one leaves none, so the field and its data go to the bin together.

const appWithField = () => ({
  fields: [
    { id: 'f1', label: 'Project', type: 'text' },
    { id: 'f2', label: 'Budget', type: 'money' },
    { id: 'f3', label: 'Stage', type: 'status' },
  ],
  items: [
    { id: 'i1', values: { f1: 'Roof', f2: 1000, f3: 'open' } },
    { id: 'i2', values: { f1: 'Deck', f3: 'done' } },
    { id: 'i3', values: {} },
  ],
});

test('a binned field takes its data with it, off every record', () => {
  const app = appWithField();
  assert.equal(sendFieldsToTrash(app, ['f1'], 'me'), 1);

  assert.deepEqual(app.fields.map((f) => f.id), ['f2', 'f3'], 'gone from the field list');
  assert.equal(app.items[0].values.f1, undefined, 'and off the records');
  assert.equal(app.items[1].values.f1, undefined);
  // Everything else is untouched -- a delete that took a neighbour with it would be worse.
  assert.equal(app.items[0].values.f2, 1000);
  assert.equal(app.items[0].values.f3, 'open');

  const entry = app.fieldTrash[0];
  assert.equal(entry.field.label, 'Project');
  assert.equal(entry.deletedBy, 'me');
  assert.deepEqual(entry.values, { i1: 'Roof', i2: 'Deck' }, 'only records that had a value');
  assert.equal(trashedFieldValueCount(entry), 2);
});

test('restoring a field brings back the values it held, in its old position', () => {
  const app = appWithField();
  sendFieldsToTrash(app, ['f2']);
  const back = restoreFieldFromTrash(app, 'f2');

  assert.equal(back.label, 'Budget');
  assert.deepEqual(app.fields.map((f) => f.id), ['f1', 'f2', 'f3'],
    'back where it was -- a column reappearing at the end is one somebody has to hunt for');
  assert.equal(app.items[0].values.f2, 1000, 'and the data is back');
  assert.equal(app.fieldTrash.length, 0);
});

test('a record deleted while the field was binned simply has nothing to put back', () => {
  const app = appWithField();
  sendFieldsToTrash(app, ['f1']);
  app.items = app.items.filter((item) => item.id !== 'i2');
  restoreFieldFromTrash(app, 'f1');
  assert.equal(app.items.find((item) => item.id === 'i1').values.f1, 'Roof');
  assert.equal(app.items.length, 2, 'the missing record is not resurrected by a field restore');
});

test('several fields bin and restore independently', () => {
  const app = appWithField();
  assert.equal(sendFieldsToTrash(app, ['f1', 'f3']), 2, 'a bulk delete is one call');
  assert.deepEqual(app.fields.map((f) => f.id), ['f2']);
  restoreFieldFromTrash(app, 'f3');
  assert.deepEqual(app.fields.map((f) => f.id), ['f2', 'f3']);
  assert.equal(app.fieldTrash.length, 1, 'the other one stays in the bin');
});

test('binning nothing reports nothing, rather than claiming a delete', () => {
  const app = appWithField();
  assert.equal(sendFieldsToTrash(app, []), 0);
  assert.equal(sendFieldsToTrash(app, ['nope']), 0);
  assert.equal(app.fields.length, 3, 'and changes nothing');
});

test('a field restored twice does not appear twice', () => {
  const app = appWithField();
  sendFieldsToTrash(app, ['f1']);
  restoreFieldFromTrash(app, 'f1');
  assert.equal(restoreFieldFromTrash(app, 'f1'), null, 'the second restore finds nothing');
  assert.equal(app.fields.filter((f) => f.id === 'f1').length, 1);
});

test('purging a field is the one thing nothing comes back from', () => {
  const app = appWithField();
  sendFieldsToTrash(app, ['f1']);
  assert.equal(purgeFieldFromTrash(app, 'f1'), true);
  assert.equal(app.fieldTrash.length, 0);
  assert.equal(restoreFieldFromTrash(app, 'f1'), null, 'gone for good');
  assert.equal(purgeFieldFromTrash(app, 'f1'), false, 'and says so the second time');
});

test('emptying the bin takes records and fields alike', () => {
  const app = appWithField();
  app.trash = [{ id: 'old', values: {} }];
  sendFieldsToTrash(app, ['f1']);
  assert.deepEqual(trashTotals(app), { records: 1, fields: 1, fieldValues: 2 });
  assert.equal(emptyTrash(app), 2, 'both are counted, so the confirmation can say what it costs');
  assert.deepEqual(trashTotals(app), { records: 0, fields: 0, fieldValues: 0 });
});

// ---- emptying the bin is an owner's decision ---------------------------------------------
//
// "emptying bin requires account owners password."
//
// Two rules, and only both together mean anything. A browser can verify the SIGNED-IN user's own
// password and nobody else's -- there is no server-side verifier for an arbitrary person's, and
// accepting somebody else's credential into the page is not a thing a web app should do. So the
// password proves who is at the keyboard, and the owner check proves they are entitled to be.

test('a non-owner is not offered Empty the bin, and is told why', () => {
  const a = app();
  sendToTrash(a, ['i1']);
  const asOwner = view(a, true, true);
  const asManager = view(a, true, false);

  assert.match(asOwner, /data-wb-trash-empty/, 'an owner gets the button');
  assert.ok(!/data-wb-trash-empty/.test(asManager), 'a manager does not');
  assert.match(asManager, /account owner's decision/, 'and is told why rather than left guessing');
  // The things they CAN still do are unchanged -- this gate is about the irreversible one.
  assert.match(asManager, /data-wb-trash-restore/);
  assert.match(asManager, /data-wb-trash-purge/);
});

test('the gate is re-checked on confirm, not just hidden in the markup', () => {
  // A hidden button is a hint. State can change while a modal is open, and the handler is the
  // only thing that actually decides.
  const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
  assert.match(main, /if \(c\.ownerOnly && !isCompanyOwner\(companyId\)\) \{/);
  assert.match(main, /openWbConfirm\(companyId, 'empty-trash',[\s\S]*?needsPassword: true, ownerOnly: true/);
  // And the password is asked for every time, not only when the bin happens to hold field data.
  assert.match(main, /if \(c\.needsPassword && isLiveSupabaseSession\(\)\) \{[\s\S]*?confirmAccountPassword/);
});
