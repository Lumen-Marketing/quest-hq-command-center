import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const migrations = readdirSync(new URL('../supabase/migrations/', import.meta.url));
const migrationName = migrations.find((name) => /record_history_and_recent_delete_undo/.test(name));
const migrationUrl = new URL(`../supabase/migrations/${migrationName || 'missing.sql'}`, import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';
const undoFunction = migration.match(/create or replace function public\.recycle_undo_item[\s\S]*?\$\$;/i)?.[0] || '';
const captureFunction = migration.match(/create or replace function app_private\.capture_record_history[\s\S]*?\$\$;/i)?.[0] || '';

test('creates an append-only workspace-scoped record history ledger', () => {
  assert.ok(existsSync(migrationUrl), 'record history migration should exist');
  assert.match(migration, /create table(?: if not exists)? public\.record_history/i);
  assert.match(migration, /company_id text not null references public\.companies\(id\)/i);
  assert.match(migration, /workspace_id uuid not null references public\.workspaces\(id\)/i);
  assert.match(migration, /record_type text not null/i);
  assert.match(migration, /record_id text not null/i);
  assert.match(migration, /actor_profile_id uuid references public\.profiles\(id\) on delete set null/i);
  assert.match(migration, /changed_fields text\[\] not null default '\{\}'::text\[\]/i);
  assert.match(migration, /changes jsonb not null default '\{\}'::jsonb/i);
  assert.match(migration, /record_history_record_type_check check \(record_type in \('contact', 'deal', 'job', 'task'\)\)/i);
  assert.match(migration, /record_history_action_check check \(action in \('created', 'updated', 'deleted', 'restored'\)\)/i);
  assert.match(migration, /record_history_scope_created_idx[\s\S]*company_id, workspace_id, record_type, record_id, created_at desc/i);
  assert.match(migration, /alter table public\.record_history enable row level security/i);
  assert.match(migration, /revoke all on table public\.record_history from public, anon, authenticated/i);
  assert.match(migration, /grant select on table public\.record_history to authenticated/i);
  assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete|all)[^;]*record_history[^;]*authenticated/i);
});

test('history read policy requires membership and the matching workspace view permission', () => {
  assert.match(migration, /create policy "record history workspace read" on public\.record_history/i);
  assert.match(migration, /app_private\.is_workspace_member\(workspace_id\)/i);
  assert.match(migration, /app_private\.has_workspace_permission\(\s*workspace_id,\s*case record_type/i);
  assert.match(migration, /when 'contact' then 'crm\.view'/i);
  assert.match(migration, /when 'deal' then 'crm\.view'/i);
  assert.match(migration, /when 'job' then 'jobs\.view'/i);
  assert.match(migration, /when 'task' then 'tasks\.view'/i);
  assert.match(migration, /from public\.workspaces w[\s\S]*w\.id = record_history\.workspace_id[\s\S]*w\.company_id = record_history\.company_id/i);
});

test('a private fixed-search-path trigger captures only whitelisted business changes', () => {
  assert.match(captureFunction, /returns trigger/i);
  assert.match(captureFunction, /security definer/i);
  assert.match(captureFunction, /set search_path = ''/i);
  assert.match(captureFunction, /v_actor uuid := \(select auth\.uid\(\)\)/i);
  assert.match(captureFunction, /when 'contacts' then/i);
  assert.match(captureFunction, /when 'deals' then/i);
  assert.match(captureFunction, /when 'jobs' then/i);
  assert.match(captureFunction, /when 'tasks' then/i);
  assert.match(captureFunction, /jsonb_build_object\('before', v_old -> v_field, 'after', v_new -> v_field\)/i);
  assert.match(captureFunction, /if cardinality\(v_changed_fields\) = 0 then return new/i);
  assert.doesNotMatch(captureFunction, /'phone'|'email'|'location'|'address'|'notes'|'description'/i);
  assert.match(migration, /revoke all on function app_private\.capture_record_history\(\) from public, anon, authenticated/i);
});

test('all four source tables capture inserts updates deletes and restores', () => {
  for (const table of ['contacts', 'deals', 'jobs', 'tasks']) {
    assert.match(
      migration,
      new RegExp(`create trigger ${table}_capture_record_history\\s+after insert or update on public\\.${table}\\s+for each row execute function app_private\\.capture_record_history\\(\\)`, 'i'),
    );
  }
  assert.match(captureFunction, /v_action := 'created'/i);
  assert.match(captureFunction, /v_action := 'deleted'/i);
  assert.match(captureFunction, /v_action := 'restored'/i);
  assert.match(captureFunction, /v_action := 'updated'/i);
});

test('recent-delete undo is same-actor time-limited and server-authorized', () => {
  assert.match(undoFunction, /returns public\.recycle_bin_items/i);
  assert.match(undoFunction, /security definer/i);
  assert.match(undoFunction, /set search_path = ''/i);
  assert.match(undoFunction, /v_uid uuid := \(select auth\.uid\(\)\)/i);
  assert.match(undoFunction, /where id = p_item_id and status = 'active'\s+for update/i);
  assert.match(undoFunction, /v_item\.deleted_by is distinct from v_uid/i);
  assert.match(undoFunction, /v_item\.deleted_at < now\(\) - interval '10 minutes'/i);
  assert.match(undoFunction, /v_item\.restore_until < now\(\)/i);
  assert.match(undoFunction, /app_private\.recycle_source_metadata\(v_item\.source_type\)/i);
  assert.match(undoFunction, /v_table is distinct from v_item\.source_table/i);
  assert.match(undoFunction, /app_private\.is_workspace_member\(v_workspace_id\)/i);
  assert.match(undoFunction, /app_private\.has_workspace_permission\(v_workspace_id, v_permission\)/i);
  assert.match(undoFunction, /app_private\.has_company_permission\(v_item\.company_id, v_permission\)/i);
  assert.match(undoFunction, /set status = 'restored', restored_at = now\(\), restored_by = v_uid/i);
  assert.match(migration, /revoke all on function public\.recycle_undo_item\(text\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.recycle_undo_item\(text\) to authenticated/i);
});
