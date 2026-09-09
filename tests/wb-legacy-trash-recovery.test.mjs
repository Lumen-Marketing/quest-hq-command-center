import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260909182840_recover_legacy_wb_trash_snapshots.sql', import.meta.url),
  'utf8',
);
const probe = readFileSync(
  new URL('../supabase/probes/wb_legacy_trash_recovery_rollback.sql', import.meta.url),
  'utf8',
);
const apply = readFileSync(
  new URL('../supabase/probes/wb_legacy_trash_recovery_apply.sql', import.meta.url),
  'utf8',
);

test('legacy trash recovery is service-only, locks documents, and never overwrites a live row', () => {
  assert.match(migration, /create table if not exists public\.wb_legacy_trash_recovery_map/i);
  assert.match(migration, /alter table public\.wb_legacy_trash_recovery_map enable row level security/i);
  assert.match(migration, /revoke all on table public\.wb_legacy_trash_recovery_map from public, anon, authenticated/i);
  assert.match(migration, /wb_legacy_trash_recovery_map_company_id_idx/i);
  assert.match(migration, /wb_legacy_trash_recovery_map_workspace_id_idx/i);
  assert.match(migration, /for update/i, 'the company document must be locked before nested trash is reconciled');
  assert.match(migration, /service role required/i);
  assert.match(migration, /r\.id = v_source_id[\s\S]*r\.data = v_payload[\s\S]*r\.deleted_at = v_deleted_at/i,
    'an old id is accepted only when tenant, app, payload, and deletion timestamp all agree');
  assert.match(migration, /v_payload \|\| jsonb_build_object\('id', v_recovered_id\)/i,
    'a distinct snapshot must get a new row id while preserving its payload');
  assert.doesNotMatch(migration, /update public\.wb_records/i, 'recovery must not mutate existing rows');
  assert.doesNotMatch(migration, /delete from public\.wb_records/i, 'recovery must not remove existing rows');
});

test('legacy trash recovery has durable idempotency and an explicit dry-run path', () => {
  assert.match(migration, /fingerprint text primary key/i);
  assert.match(migration, /source_deleted_by text[\s\S]*source_purge_after text/i,
    'the service-only map retains original legacy trash provenance');
  assert.match(migration, /set timezone = 'UTC'[\s\S]*set statement_timeout = '30s'/i);
  assert.match(migration, /v_app \? 'linked'[\s\S]*not in \('null'::jsonb, 'false'::jsonb/i,
    'linked object references must be skipped just like linked booleans');
  assert.match(migration, /p_dry_run boolean default false/i);
  assert.match(migration, /if v_mapping_recorded then[\s\S]*v_unresolved := v_unresolved \+ 1/i,
    'a broken prior mapping must stop duplicate recovery rather than minting another row');
  assert.doesNotMatch(migration, /select public\.reconcile_legacy_wb_trash_snapshots\(\);/i,
    'the recovery call stays separate so the full migration can be rollback-probed first');
});

test('rollback-only probe proves the known aggregate, live-row preservation, and rerun no-op', () => {
  assert.match(probe, /^begin;/mi);
  assert.match(probe, /exact_existing_removed'\)::integer <> 86/i);
  assert.match(probe, /recovered_rows'\)::integer <> 5/i);
  assert.match(probe, /document_entries_proven'\)::integer <> 91/i);
  assert.match(probe, /after_live <> before_counts\.live_rows/i);
  assert.match(probe, /reconcile_legacy_wb_trash_snapshots\(null, 100, false\).*no-op/is);
  assert.match(probe, /^rollback;/mi);
  assert.match(apply, /reconcile_legacy_wb_trash_snapshots\(null, 100, false\)/i,
    'the reviewed production apply stays generic and contains no production identifiers');
});
