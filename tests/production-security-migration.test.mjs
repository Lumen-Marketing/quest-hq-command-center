import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(new URL('../supabase/migrations/202607101200_production_security_and_atomic_mutations.sql', import.meta.url), 'utf8');

test('avatar writes are owner scoped and broad authenticated listing is removed', () => {
  assert.match(migration, /split_part\s*\(\s*name\s*,\s*'\/'\s*,\s*1\s*\)\s*=\s*\(select auth\.uid\(\)\)::text/i);
  assert.match(migration, /drop policy if exists "authenticated read avatar objects"/i);
  assert.doesNotMatch(migration, /create policy "authenticated read avatar objects"/i);
});

test('security definer entry points are least privilege', () => {
  for (const name of ['assign_wo_number', 'list_workspace_app_library', 'update_own_profile', 'wb_add_item_comment', 'wb_modify_item_comment']) {
    assert.match(migration, new RegExp(`revoke execute on function public\\.${name}\\([^;]*from public, anon`, 'i'));
  }
  assert.match(migration, /if\s+\(select auth\.uid\(\)\)\s+is null[\s\S]*not authenticated/i);
});

test('recycle bin snapshots are admin-only and mutations are atomic RPCs', () => {
  assert.match(migration, /drop policy if exists "members read recycle bin"/i);
  assert.match(migration, /create or replace function public\.recycle_move_item/i);
  assert.match(migration, /create or replace function public\.recycle_restore_item/i);
  assert.match(migration, /create or replace function public\.recycle_permanently_delete_item/i);
  assert.match(migration, /create unique index if not exists recycle_bin_items_one_active_source_idx/i);
});

test('role and pipeline replacements are transactional RPCs', () => {
  assert.match(migration, /create or replace function public\.save_company_role/i);
  assert.match(migration, /create or replace function public\.delete_company_role/i);
  assert.match(migration, /create or replace function public\.replace_pipeline_stages/i);
  assert.match(migration, /jsonb_array_elements\(p_stages\)/i);
});

test('expired recycle rows have a bounded purge path and realtime uses the live price table', () => {
  assert.match(migration, /create or replace function public\.purge_expired_recycle_bin/i);
  assert.match(migration, /least\(greatest\(coalesce\(p_limit/i);
  assert.match(migration, /pricebook_vendor_prices/i);
  assert.match(migration, /crm_sites/i);
  assert.match(migration, /workspace_backups/i);
  assert.doesNotMatch(migration, /alter publication[^;]*add table public\.pricebook_prices\b/i);
  assert.doesNotMatch(migration, /alter publication[^;]*add table public\.sites\b/i);
});
