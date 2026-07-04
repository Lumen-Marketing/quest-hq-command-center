import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const backupMigrationName = readdirSync(migrationDir).find((name) => /workspace_backup_system/.test(name));
const backupMigration = backupMigrationName ? readFileSync(new URL(`../supabase/migrations/${backupMigrationName}`, import.meta.url), 'utf8') : '';

test('settings exposes backup controls for manual automatic import export and restore', () => {
  assert.match(source, /BACKUP_INTERVAL_OPTIONS/);
  assert.match(source, /WORKSPACE_BACKUP_CACHE_KEY/);
  assert.match(source, /function renderBackupsSettings\(companyId\)/);
  assert.match(source, /async function maybeRunAutomaticBackups\(\)/);
  assert.match(source, /function automaticBackupDue\(companyId/);
  assert.match(source, /createWorkspaceBackup\(companyId, 'automatic'\)/);
  assert.match(source, /last_backup_at/);
  assert.match(source, /data-backup-settings-form/);
  assert.match(source, /data-action="create-workspace-backup"/);
  assert.match(source, /data-workspace-backup-import/);
  assert.match(source, /data-action="download-workspace-backup"/);
  assert.match(source, /data-action="open-restore-backup"/);
  assert.match(source, /data-action="mark-workspace-backup-deleted"/);
  assert.match(source, /companyPath\('settings', \{ tab: 'backups' \}/);
});

test('backup exports are real zip payloads and restore through validated workspace snapshots', () => {
  assert.match(packageJson, /"jszip": "?\^?3\.10\.1"?/);
  assert.match(source, /async function loadJsZip\(\)/);
  assert.match(source, /async function downloadBackupZip\(backup\)/);
  assert.match(source, /zip\.file\('quest-backup\.json'/);
  assert.match(source, /async function importWorkspaceBackupFile\(file\)/);
  assert.match(source, /async function restoreWorkspaceBackup\(backupId\)/);
  assert.match(source, /function buildWorkspaceBackupPayload\(companyId\)/);
  assert.match(source, /pipelineStages: backupPayloadRows\(state\.pipelineStages, companyId\)/);
  assert.match(source, /function applyWorkspaceBackupPayload\(payload\)/);
  assert.match(source, /data\.pipelineStages/);
  assert.match(source, /\['pipeline_stages', data\.pipelineStages/);
  assert.match(source, /payload\.version !== WORKSPACE_BACKUP_VERSION/);
  assert.match(source, /persistAll\(\)/);
});

test('workspace backups have additive supabase schema rls and platform admin rpc controls', () => {
  assert.ok(existsSync(new URL(`../supabase/migrations/${backupMigrationName || 'missing.sql'}`, import.meta.url)), 'backup migration file should exist');
  assert.match(backupMigration, /create table if not exists public\.workspace_backups/);
  assert.match(backupMigration, /create table if not exists public\.workspace_backup_copies/);
  assert.match(backupMigration, /alter table public\.workspace_backups enable row level security/);
  assert.match(backupMigration, /alter table public\.workspace_backup_copies enable row level security/);
  assert.match(backupMigration, /create policy "members read company backups"/);
  assert.match(backupMigration, /create policy "admins manage company backups"/);
  assert.match(backupMigration, /create policy "platform admins read backup copies"/);
  assert.match(backupMigration, /create or replace function public\.list_platform_backup_copies/);
  assert.match(backupMigration, /create or replace function public\.mark_platform_backup_copy_deleted/);
  assert.match(backupMigration, /create or replace function public\.permanently_delete_platform_backup_copy/);
  assert.match(backupMigration, /if not app_private\.is_quest_admin\(\) then/);
  assert.match(backupMigration, /grant select, insert, update on public\.workspace_backups to authenticated/);
});

test('master panel shows backup copy ledger filters states and permanent delete warning', () => {
  assert.match(source, /platformBackupCopies/);
  assert.match(source, /function renderPlatformBackupLedger\(currentCompanyId\)/);
  assert.match(source, /function filteredPlatformBackupCopies\(currentCompanyId\)/);
  assert.match(source, /data-platform-backup-filter/);
  assert.match(source, /data-action="platform-backup-mark-deleted"/);
  assert.match(source, /data-action="open-platform-backup-permanent-delete"/);
  assert.match(source, /function renderPlatformBackupDeleteModal\(copyId\)/);
  assert.match(source, /deletes the original copy and deletes it from the database forever/i);
  assert.match(styles, /\.backup-settings-panel/);
  assert.match(styles, /\.platform-backup-ledger/);
});
