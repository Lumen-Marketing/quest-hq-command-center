import assert from 'node:assert/strict';
import test from 'node:test';

import { createDataIO } from '../src/workspace/data-io.js';

// "These records are from an import — I want an activity on each record saying it was imported
// from file blah blah."
//
// The import logged one workspace-level line: "Imported 11 items into 1". Right for the feed
// and useless on a record, because an entry with no itemId shows on no record at all — opening
// any imported row said "Nothing yet", as though somebody had typed it by hand.

// The real escaper, not an identity stub — otherwise the escaping test checks the harness.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const F = (id, label, type) => ({
  id, label, type, config: {},
});

function run(csv, fileName) {
  const app = {
    id: 'app1',
    name: '1',
    fields: [F('f-name', 'Name', 'text'), F('f-phone', 'Phone', 'phone')],
    items: [],
  };
  const workspace = { id: 'ws1', name: 'Main', apps: [app], activity: [] };
  const logged = [];
  let n = 0;
  const io = createDataIO({
    h: esc,
    wbFind: () => ({ workspace, app }),
    wbUid: () => `i${(n += 1)}`,
    wbSave: () => {},
    render: () => {},
    showToast: () => {},
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: (ws, entry) => { logged.push(entry); ws.activity.unshift(entry); },
    wbAssignAutoNumbers: () => {},
    guardUpload: async () => true,
    state: {},
  });
  io.wbImportCsvText('co1', 'ws1', 'app1', csv, fileName);
  return { app, logged };
}

const CSV = 'Name,Phone\nkim,555-123-4577\nsherry,555-123-4576\n';

test('every imported record gets its own activity entry', () => {
  const { app, logged } = run(CSV, 'leads-august.csv');
  assert.equal(app.items.length, 2);
  app.items.forEach((item) => {
    const mine = logged.filter((e) => e.appId === 'app1' && e.itemId === item.id);
    assert.equal(mine.length, 1, `record ${item.id} has no history`);
    assert.match(mine[0].text, /Imported from <b>leads-august\.csv<\/b>/);
  });
});

test('the entry is keyed to the record, or it shows on none of them', () => {
  // recordFeed drops anything whose itemId does not match, which is why the one workspace-level
  // line was invisible on every row it described.
  const { logged } = run(CSV, 'x.csv');
  const perRecord = logged.filter((e) => e.itemId);
  assert.equal(perRecord.length, 2);
  perRecord.forEach((e) => {
    assert.ok(e.appId, 'an entry with no appId is not a record entry');
    assert.equal(e.kind, 'created', 'an import IS the beginning of this record');
  });
});

test('the workspace still gets its one summary line, now naming the file', () => {
  const { logged } = run(CSV, 'leads-august.csv');
  const summary = logged.filter((e) => !e.itemId);
  assert.equal(summary.length, 1);
  assert.match(summary[0].text, /Imported <b>2<\/b> items into 1 from <b>leads-august\.csv<\/b>/);
});

test('a file with no name still says where the record came from', () => {
  const { logged } = run(CSV, '');
  assert.match(logged.find((e) => e.itemId).text, /Imported from a CSV file/);
});

test('the file name is escaped', () => {
  const { logged } = run(CSV, '<img src=x onerror=alert(1)>.csv');
  assert.doesNotMatch(logged.find((e) => e.itemId).text, /<img/);
});

test('a row that imports nothing gets no entry', () => {
  const { app, logged } = run('Name,Phone\n,\nkim,555\n', 'x.csv');
  assert.equal(app.items.length, 1);
  assert.equal(logged.filter((e) => e.itemId).length, 1);
});

test('the picker hands the file NAME on, not just its text', async () => {
  // Everything above calls wbImportCsvText directly, so none of it notices if the file picker
  // stops passing the name — every import would quietly say "a CSV file" instead.
  const seen = [];
  const input = { onchange: null, click() {}, files: null };
  global.document = { createElement: () => input };
  const io = createDataIO({
    h: esc,
    wbFind: () => ({ workspace: { id: 'ws1', apps: [], activity: [] }, app: null }),
    wbUid: () => 'x',
    wbSave: () => {},
    render: () => {},
    showToast: () => {},
    activeSession: () => ({ profile: {} }),
    wbLogActivity: () => {},
    wbAssignAutoNumbers: () => {},
    guardUpload: async () => true,
    state: {},
  });
  io.wbImportCsvPrompt('co1', 'ws1', 'app1');
  input.files = [{ name: 'leads-august.csv', text: async () => { seen.push('read'); return 'Name\nkim\n'; } }];
  await input.onchange();
  // wbFind returns no app so the import stops early — what matters is that the name travelled.
  assert.deepEqual(seen, ['read']);
  assert.match(String(io.wbImportCsvText), /fileName = ''/);
  const src = String(io.wbImportCsvPrompt);
  assert.match(src, /wbImportCsvText\([^)]*file\.name\)/, 'the picker dropped the file name');
});
