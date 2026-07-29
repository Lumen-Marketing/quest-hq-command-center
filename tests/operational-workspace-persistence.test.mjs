import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202607301100_operational_workspace_persistence.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';

test('operational workspace uploaded icons are stored and constrained server-side', () => {
  assert.ok(migration, 'Expected the operational workspace persistence migration');
  assert.match(migration, /alter table public\.workspaces\s+add column if not exists icon_image text not null default ''/i);
  assert.match(migration, /pg_column_size\(icon_image\) <= 330000/i);
  assert.match(migration, /icon_image ~ '\^data:image\/\(png\|jpeg\|webp\);base64,/i);
  assert.match(migration, /create_operational_workspace\([\s\S]*icon_image text default null/i);
  assert.match(migration, /update_operational_workspace\([\s\S]*icon_image text default null/i);
  assert.match(migration, /insert into public\.workspaces \([\s\S]*icon_image/i);
  assert.match(migration, /icon_image = coalesce\(clean_icon_image, w\.icon_image\)/i);

  assert.match(source, /client\.rpc\('create_operational_workspace', \{[\s\S]*icon_image: iconImage/);
  assert.match(source, /client\.rpc\('update_operational_workspace', \{[\s\S]*icon_image: iconImage/);
});

test('setting a default workspace is an authenticated atomic server operation', () => {
  assert.ok(migration, 'Expected the operational workspace persistence migration');
  assert.match(migration, /create or replace function public\.set_default_operational_workspace\(/i);
  assert.match(migration, /if \(select auth\.uid\(\)\) is null then raise exception 'Authentication required'/i);
  assert.match(migration, /app_private\.is_workspace_admin\(target_workspace_id\)/i);
  assert.match(migration, /if saved\.status <> 'active' then raise exception 'Archived workspaces cannot be set as default'/i);
  assert.match(migration, /set is_default = false[\s\S]*set is_default = true/i);
  assert.match(migration, /'workspace\.default_changed'/i);
  assert.match(migration, /revoke all on function public\.set_default_operational_workspace\(uuid\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.set_default_operational_workspace\(uuid\) to authenticated/i);

  assert.match(source, /async function setDefaultOperationalWorkspace\(workspaceId\)/);
  assert.match(source, /client\.rpc\('set_default_operational_workspace', \{ target_workspace_id: target\.id \}\)/);
  assert.match(source, /if \(result\.error\) \{[\s\S]*Default workspace update failed/);
});
