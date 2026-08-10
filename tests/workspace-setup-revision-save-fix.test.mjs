import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const migrationsDir = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const migrationName = readdirSync(migrationsDir).find((name) => /_workspace_setup_revision_save_fix\.sql$/.test(name));

test('revision save correction is a forward migration', () => {
  assert.ok(migrationName, 'revision save correction migration must exist');
});

const sql = migrationName
  ? readFileSync(`${migrationsDir}/${migrationName}`, 'utf8').replace(/\r\n/g, '\n')
  : '';

test('existing profiles update by revision instead of using an empty insert source', () => {
  assert.match(sql, /if p_expected_revision = 0 then/i);
  assert.match(sql, /else[\s\S]*update public\.workspace_setup_profiles profile/i);
  assert.match(sql, /where profile\.workspace_id = target_workspace_id[\s\S]*profile\.revision = p_expected_revision/i);
  assert.match(sql, /revision = profile\.revision \+ 1/i);
  assert.match(sql, /Workspace setup changed in another tab or device/i);
});
