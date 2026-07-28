import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrations = readdirSync(new URL('../supabase/migrations/', import.meta.url));
const recycleMigrationName = migrations.find((name) => /recycle_bin_safe_delete/.test(name));
const recycleMigration = recycleMigrationName ? readFileSync(new URL(`../supabase/migrations/${recycleMigrationName}`, import.meta.url), 'utf8') : '';
const hardeningMigration = readFileSync(new URL('../supabase/migrations/202607101200_production_security_and_atomic_mutations.sql', import.meta.url), 'utf8');
const historyMigrationName = migrations.find((name) => /record_history_and_recent_delete_undo/.test(name));
const historyMigration = historyMigrationName ? readFileSync(new URL(`../supabase/migrations/${historyMigrationName}`, import.meta.url), 'utf8') : '';

test('settings exposes a recycle bin for 30 day safe deletes', () => {
  assert.match(source, /const RECYCLE_BIN_RETENTION_DAYS = 30;/);
  assert.match(source, /const RECYCLE_BIN_CACHE_KEY = 'quest-hq-recycle-bin-cache-v1';/);
  assert.match(source, /recycleBinItems: readSeededList\(RECYCLE_BIN_CACHE_KEY, \[\]\)\.map\(normalizeRecycleBinItem\)/);
  assert.match(source, /\[companyPath\('settings', \{ tab: 'recycle-bin' \}, companyId\), 'Recycle Bin', 'recycle-bin'\]/);
  assert.match(source, /tab === 'recycle-bin' \? renderRecycleBinSettings\(companyId\) : ''/);
  assert.match(source, /function renderRecycleBinSettings\(companyId\)/);
  assert.match(source, /data-recycle-filter="type"/);
  assert.match(source, /data-recycle-filter="status"/);
  assert.match(source, /data-action="restore-recycle-item"/);
  assert.match(source, /data-action="open-permanent-delete-recycle-item"/);
  assert.match(styles, /\.recycle-bin-panel/);
  assert.match(styles, /\.recycle-row/);
});

test('normal deletes open a shared recycle confirmation instead of hard deleting immediately', () => {
  assert.match(source, /function openRecycleDeleteModal\(config\)/);
  assert.match(source, /function renderRecycleDeleteModal\(\)/);
  assert.match(source, /function confirmRecycleDelete\(\)/);
  assert.match(source, /This moves the item to Recycle Bin for 30 days/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'contact', id: node\.dataset\.contactId \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'deal', id: node\.dataset\.dealId \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'job', id: node\.dataset\.jobId \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'task', id: node\.dataset\.taskId, options: \{ stayOnPage: node\.dataset\.taskReturn === 'record' \} \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'file', id: node\.dataset\.fileId \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'form', id: node\.dataset\.formId \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'form_response', id: node\.dataset\.responseId \|\| '' \}\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'client_portal', id: node\.dataset\.portalId \}\)/);
});

test('recycle helpers soft delete restore and permanently delete from recycle bin', () => {
  assert.match(source, /const RECYCLE_BIN_TYPES = \{/);
  assert.match(source, /contact: \{[\s\S]*table: 'contacts'[\s\S]*stateKey: 'contacts'/);
  assert.match(source, /form_response: \{[\s\S]*table: 'form_responses'[\s\S]*stateKey: 'formResponses'/);
  assert.match(source, /file: \{[\s\S]*table: 'job_files'[\s\S]*stateKey: 'files'/);
  assert.match(source, /function buildRecycleBinItem\(record, config\)/);
  assert.match(source, /async function recycleDeleteRecord\(config\)/);
  assert.match(source, /client\.rpc\('recycle_move_item', \{ p_item: row \}\)/);
  assert.match(source, /async function restoreRecycleBinItem\(itemId\)/);
  assert.match(source, /client\.rpc\('recycle_restore_item', \{ p_item_id: item\.id \}\)/);
  assert.match(source, /async function permanentlyDeleteRecycleBinItem\(itemId, options = \{\}\)/);
  assert.match(source, /client\.rpc\('recycle_permanently_delete_item', \{ p_item_id: item\.id \}\)/);
  assert.match(source, /Delete forever/);
  assert.match(source, /This permanently deletes the original record and cannot be undone/);
});

test('normal file deletes keep storage bytes until permanent delete', () => {
  assert.match(source, /async function softDeleteRecycleSource\(typeConfig, record, item\)/);
  assert.match(source, /typeConfig\.type === 'file'/);
  const deleteFileStart = source.indexOf('async function deleteFile(id)');
  const deleteFileEnd = source.indexOf('function upsertJob(job)', deleteFileStart);
  const deleteFileBody = source.slice(deleteFileStart, deleteFileEnd);
  assert.doesNotMatch(deleteFileBody, /storage\.from\('quest-job-files'\)\.remove/);
  assert.match(source, /async function permanentlyDeleteRecycleBinItem\(itemId, options = \{\}\)[\s\S]*const storageResult = await client\.storage\.from\('quest-job-files'\)\.remove\(\[snapshot\.object_path\]\)/);
  assert.match(source, /if \(storageResult\.error\)[\s\S]*return;/);
});

test('expired recycle items can be cleared in bulk with explicit confirmation', () => {
  assert.match(source, /data-action="open-empty-expired-recycle-bin"/);
  assert.match(source, /function renderRecycleEmptyExpiredModal\(\)/);
  assert.match(source, /async function emptyExpiredRecycleBin\(\)/);
  assert.match(source, /type="text"[\s\S]*name="confirmation"[\s\S]*DELETE EXPIRED/);
});

test('supabase migration creates an RLS protected recycle bin ledger', () => {
  assert.ok(existsSync(new URL(`../supabase/migrations/${recycleMigrationName || 'missing.sql'}`, import.meta.url)), 'recycle bin migration should exist');
  assert.match(recycleMigration, /create table if not exists public\.recycle_bin_items/);
  assert.match(recycleMigration, /restore_until timestamptz not null/);
  assert.match(recycleMigration, /snapshot jsonb not null default '\{\}'::jsonb/);
  assert.match(recycleMigration, /alter table public\.recycle_bin_items enable row level security/);
  assert.match(recycleMigration, /grant select, insert, update, delete on public\.recycle_bin_items to authenticated/);
  assert.match(recycleMigration, /create policy "members read recycle bin"/);
  assert.match(recycleMigration, /create policy "admins manage recycle bin"/);
  assert.match(recycleMigration, /alter table public\.contacts add column if not exists deleted_at timestamptz/);
  assert.match(recycleMigration, /alter table public\.proposal_documents add column if not exists deleted_at timestamptz/);
  assert.match(recycleMigration, /alter table public\.job_files add column if not exists deleted_by uuid/);
  assert.match(hardeningMigration, /drop policy if exists "members read recycle bin"/);
  assert.match(hardeningMigration, /create or replace function public\.recycle_move_item/);
  assert.match(historyMigration, /create or replace function public\.recycle_undo_item/);
});
