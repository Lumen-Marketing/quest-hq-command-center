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
// The follow-up that made the rows clearable. Read alongside the original rather than instead of
// it: the two together are the current rule, and asserting only against the newer file would let
// a re-added UPDATE policy in the older one pass unnoticed.
const clearable = readFileSync(
  new URL('../supabase/migrations/20260909120000_wb_data_transfers_clearable.sql', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');
const atomicClear = readFileSync(
  new URL('../supabase/migrations/20260909181650_wb_transfer_clear_atomic.sql', import.meta.url),
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

test('the log cannot be edited, by anyone, ever', () => {
  // UPDATE is the half of the append-only rule that never relaxed. A row that can be rewritten
  // is a row that can be made to say an export was smaller or was somebody else's.
  for (const sql of [migration, clearable]) {
    assert.doesNotMatch(sql, /create policy[^\n]*on public\.wb_data_transfers\s*\nfor update/);
    assert.doesNotMatch(sql, /grant[^\n]*\bupdate\b[^\n]*wb_data_transfers to/);
  }
  assert.match(clearable, /revoke update, truncate on public\.wb_data_transfers from authenticated;/);
});

test('TRUNCATE is revoked, because it is the one command RLS cannot see', () => {
  // The 2026-08-29 migration only ever ADDED grants, so `authenticated` still held the TRUNCATE
  // the table was created with -- verified against live. Truncate bypasses row level security
  // entirely, so the `direction <> 'cleared'` clause that protects the tombstones does not apply
  // to it, and a truncate would leave a table indistinguishable from one nobody ever used.
  assert.match(clearable, /revoke update, truncate on public\.wb_data_transfers from authenticated;/);
  // And the reason is written down, because "why is TRUNCATE in this list" is the question
  // somebody will have when they next touch these grants.
  assert.match(clearable, /bypasses row\n-- level security/);
});

test('the newer atomic clear revokes browser DELETE and uses a manager-authorized RPC', () => {
  assert.match(atomicClear, /drop policy if exists "wb transfers clear"/);
  assert.match(atomicClear, /revoke delete, update, truncate on public\.wb_data_transfers from authenticated/);
  assert.match(atomicClear, /create or replace function public\.clear_wb_transfer_log/);
  assert.match(atomicClear, /app_private\.has_workspace_permission\(v_request\.workspace_id, 'workspaces\.manage'\)/);
});

test('a browser cannot forge a tombstone', () => {
  const insertPolicy = atomicClear.slice(atomicClear.indexOf('create policy "wb transfers insert"'));
  assert.doesNotMatch(insertPolicy.slice(0, insertPolicy.indexOf(');')), /direction = 'cleared'/);
  assert.match(atomicClear, /insert into public\.wb_data_transfers[\s\S]*'cleared'/);
});

test('ordinary transfer logging survives but binds created_by to the caller', () => {
  assert.match(atomicClear, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(atomicClear, /direction = 'export' and app_private\.has_workspace_permission\(workspace_id, 'workspaces\.records\.export'\)/);
  assert.match(atomicClear, /direction = 'import' and app_private\.has_workspace_permission\(workspace_id, 'workspaces\.records\.import'\)/);
});

test('the direction constraint admits the tombstone, or every insert would fail', () => {
  assert.match(clearable, /check \(direction in \('export', 'import', 'cleared'\)\)/);
  // Dropped by name first: the original was an inline CHECK, so Postgres named it for us.
  assert.match(clearable, /drop constraint if exists wb_data_transfers_direction_check/);
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

test('transfers reach the activity feed, so the log is something you can see', () => {
  // The rows existed before this and nothing rendered them: an export produced a ledger entry
  // no screen displayed. Reading them from the table rather than the document is what lets an
  // export by a role with no document write access still appear.
  assert.match(main, /function wbTransferActivity\(companyId, workspace\)/);
  assert.match(main, /const transfers = view === 'posts' \? \[\] : wbTransferActivity\(companyId, workspace\)/);
  assert.match(main, /posts\.concat\(acts, transfers\)/);
  assert.match(main, /state\.wbTransfers/);
});

test('the feed names both directions in plain words', () => {
  const fn = main.slice(main.indexOf('function wbTransferActivity'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /Exported \$\{records\} from/);
  assert.match(body, /Imported \$\{records\} into/);
  // An app somebody has since deleted has nothing left to name.
  assert.match(body, /if \(!name\) return null;/);
  // Only this workspace's rows.
  assert.match(body, /String\(row\.workspace_id\) === opsId/);
});

test('an import is not logged twice', () => {
  // It used to write a workspace-level activity line AND a transfer row, so the feed showed it
  // twice -- and the activity line needed workspaces.manage, which an importer may not have.
  assert.doesNotMatch(io, /Imported <b>\$\{added\}<\/b> item/);
  // The per-record provenance line stays: it is what you want when opening a row you did not type.
  assert.match(io, /Imported from <b>\$\{h\(fileName\)\}<\/b>/);
});
