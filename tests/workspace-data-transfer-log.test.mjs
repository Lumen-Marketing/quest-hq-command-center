import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Export was not gated at all: anyone who could open an app could take every record as CSV, or
// as JSON through Download app, whatever the row-level permissions said. And nothing recorded
// that it had happened -- import wrote a line to the activity feed, export wrote nothing.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL('../supabase/migrations/20260829005613_wb_data_transfers.sql', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('the two transfer permissions are offered in the roles picker', () => {
  assert.match(main, /\['workspaces\.records\.export', 'Export app records'\]/);
  assert.match(main, /\['workspaces\.records\.import', 'Import app records'\]/);
});

test('every path that takes records out is gated on export', () => {
  // CSV, Print and Download app all hand over the whole table. Print counts: it renders every
  // record into a window that saves as a PDF, so leaving it open would make the permission a
  // formality. Download app counts because its bundle carries `items`.
  assert.match(main, /const canExport = can\('workspaces\.records\.export', companyId\);/);
  assert.match(main, /canExport && tab === 'items' && app\.fields\.length\) headBtn \+= `<button class="btn" data-wb-export>/);
  assert.match(main, /canExport && tab === 'items' && app\.items\.length\) headBtn \+= `<button class="btn" data-wb-print-data>/);
  assert.match(main, /can\('workspaces\.records\.export', companyId\)\) headBtn \+= `<button class="btn" data-wb-download-app/);
});

test('import follows its own key, not the create key it used to borrow', () => {
  assert.match(main, /can\('workspaces\.records\.import', companyId\) && tab === 'items'[^\n]*data-wb-import>/);
});

test('the press is checked as well as the paint', () => {
  const at = main.indexOf("bind('[data-wb-export]'");
  const block = main.slice(at, at + 900);
  assert.ok(block.includes("can('workspaces.records.export', companyId)"), 'export re-checked on the press');
  assert.ok(block.includes("refuseTransfer('export')"), 'and refused in words');
  assert.ok(block.includes("can('workspaces.records.import', companyId)"), 'import re-checked on the press');
  assert.ok(block.includes("refuseTransfer('import')"), 'and refused in words');
});

test('every transfer is recorded, in both directions', () => {
  // Matched across lines, because the print entry spans several.
  const calls = [...io.matchAll(/direction: '(export|import)',\s*format: '([a-z]+)'/g)]
    .map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(
    new Set(calls),
    new Set(['export:csv', 'export:questapp', 'export:print', 'import:csv']),
  );
});

test('the log is fire-and-forget, so a failed note never fails the export', () => {
  // The export has already happened by the time the row is written. Failing the download
  // because the note about it did not save would be the wrong trade.
  assert.match(io, /\.then\(null, \(\) => \{\}\)/);
  // A legacy ws-<companyId> document has no workspace row to point at.
  assert.match(io, /if \(!supabase \|\| !isLiveSupabaseSession\?\.\(\) \|\| !workspace\) return;/);
});

test('writing the log needs the same permission as the act it records', () => {
  assert.match(migration, /direction = 'export' and app_private\.has_workspace_permission\(workspace_id, 'workspaces\.records\.export'\)/);
  assert.match(migration, /direction = 'import' and app_private\.has_workspace_permission\(workspace_id, 'workspaces\.records\.import'\)/);
});

test('the log cannot be edited or erased afterwards', () => {
  assert.doesNotMatch(migration, /create policy[^\n]*on public\.wb_data_transfers\s*\nfor (update|delete)/);
  assert.match(migration, /grant select, insert on public\.wb_data_transfers to authenticated;/);
  assert.doesNotMatch(migration, /grant[^\n]*(update|delete)[^\n]*wb_data_transfers/);
});

test('compatibility is granted as data, not as an alias', () => {
  // The lesson from 20260828040051: an alias that makes a broad key satisfy a narrow one leaves
  // the narrow checkbox unable to say no.
  const aliases = main.slice(main.indexOf('const PERMISSION_ALIASES'));
  const block = aliases.slice(0, aliases.indexOf('\n};'));
  assert.doesNotMatch(block, /workspaces\.records\.(export|import)/);
  assert.match(migration, /insert into public\.role_permissions[\s\S]*'workspaces\.records\.export', 'allow'/);
  assert.match(migration, /insert into public\.role_permissions[\s\S]*'workspaces\.records\.import', 'allow'/);
});
