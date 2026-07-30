import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260730181000_pipeline_stage_seed_repair.sql', import.meta.url),
  'utf8',
);

test('new operational workspaces seed each missing pipeline kind independently', () => {
  assert.match(
    migration,
    /create or replace function public\.create_operational_workspace\(\s*target_company_id text,\s*workspace_name text,\s*preset_code text default 'generic',\s*icon_key text default 'home',\s*icon_image text default null\s*\)/i,
  );
  assert.doesNotMatch(migration, /copied_stage_count/i);
  assert.match(
    migration,
    /where not exists \(\s*select 1\s*from public\.pipeline_stages existing\s*where existing\.workspace_id = new_workspace_id\s*and existing\.kind = seed\.kind\s*\)/i,
  );
});

test('existing active workspaces copy company-specific stages before baseline fallback', () => {
  const companyCopy = migration.indexOf('Repair existing workspaces from their own company default');
  const baselineFallback = migration.indexOf('Fill only pipeline kinds that remain entirely absent');

  assert.ok(companyCopy >= 0, 'company-specific repair should be present');
  assert.ok(baselineFallback > companyCopy, 'baseline fallback must happen after company-specific repair');
  assert.match(
    migration,
    /missing_workspace\.company_id = default_workspace\.company_id[\s\S]*source_stage\.workspace_id = default_workspace\.id/i,
  );
  assert.match(
    migration,
    /existing\.workspace_id = target_workspace\.id\s*and existing\.kind = seed\.kind/i,
  );
});

test('the repaired RPC retains its authentication and grants', () => {
  assert.match(migration, /if \(select auth\.uid\(\)\) is null then raise exception 'Authentication required'; end if;/i);
  assert.match(migration, /app_private\.is_company_admin\(target_company_id\)/i);
  assert.match(
    migration,
    /revoke all on function public\.create_operational_workspace\(text, text, text, text, text\) from public, anon/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.create_operational_workspace\(text, text, text, text, text\) to authenticated, service_role/i,
  );
});
