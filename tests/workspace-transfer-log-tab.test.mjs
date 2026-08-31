import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createTransferLog } from '../src/workspace/transfer-log.js';

// The log existed and nothing showed it where the buttons are: Export sits inside the app, the
// workspace feed sits outside it, and "where is the log" was the reaction. It has its own tab
// now, between Recycle bin and Settings.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const ctx = (rows, allowed = true) => ({
  h: (v) => String(v ?? ''),
  can: () => allowed,
  state: { wbTransfers: rows },
  wbMemberById: (_c, id) => (id === 'p1' ? { name: 'Rom' } : null),
  wbTimeAgo: () => '2h ago',
});
const APP = { id: 'app-1', name: 'Prospects' };
const row = (over = {}) => ({
  id: 'r1', app_id: 'app-1', direction: 'export', format: 'csv',
  record_count: 98, file_name: 'Prospect.csv', created_by: 'p1', created_at: '2026-08-31', ...over,
});

test('the tab sits between Recycle bin and Settings', () => {
  const order = main.match(/const WB_ALL_TABS = \[([^\]]+)\]/)[1].split(',').map((s) => s.trim().replace(/'/g, ''));
  assert.deepEqual(order.slice(-3), ['trash', 'transfers', 'settings']);
});

test('an app whose tabs were chosen before this existed still gets it', () => {
  // Forced like settings. A log you cannot reach is not a log.
  const fn = main.slice(main.indexOf('function wbAppTabs'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /'transfers', 'settings'/);
  assert.match(body, /tab !== 'settings' && tab !== 'transfers'/);
});

test('it lists what left and what arrived, with who and when', () => {
  const { wbViewTransfers } = createTransferLog(ctx([row(), row({ id: 'r2', direction: 'import', record_count: 1 })]));
  const html = wbViewTransfers('co', {}, APP);
  assert.match(html, /Export/);
  assert.match(html, /Import/);
  assert.match(html, /98 records/);
  assert.match(html, /1 record</, 'one record is singular');
  assert.match(html, /Prospect\.csv/);
  assert.match(html, /Rom/);
  assert.match(html, /2h ago/);
  assert.match(html, /CSV file/);
});

test('only this app’s rows', () => {
  const { wbViewTransfers } = createTransferLog(ctx([row(), row({ id: 'r2', app_id: 'other-app', file_name: 'Elsewhere.csv' })]));
  const html = wbViewTransfers('co', {}, APP);
  assert.doesNotMatch(html, /Elsewhere\.csv/);
});

test('an author who has left is said in words, not left blank', () => {
  const { wbViewTransfers } = createTransferLog(ctx([row({ created_by: 'gone' })]));
  assert.match(wbViewTransfers('co', {}, APP), /Somebody no longer here/);
});

test('nothing yet says so, and says what will appear', () => {
  const { wbViewTransfers } = createTransferLog(ctx([]));
  const html = wbViewTransfers('co', {}, APP);
  assert.match(html, /Nothing has moved yet/);
  assert.match(html, /Export, Print, Download app and Import/);
});

test('reading the log needs permission to read the records', () => {
  // The table's SELECT policy asks for the same thing; this is the paint matching the gate.
  const { wbViewTransfers } = createTransferLog(ctx([row()], false));
  const html = wbViewTransfers('co', {}, APP);
  assert.match(html, /Not your log to read/);
  assert.doesNotMatch(html, /Prospect\.csv/, 'and shows nothing it was asked to hide');
});

test('the tab body is lazily loaded, like the recycle bin beside it', () => {
  assert.match(main, /import\('\.\/workspace\/transfer-log\.js'\)/);
  assert.match(main, /else if \(tab === 'transfers'\) body = wbViewTransfers\(companyId, workspace, app\);/);
});
