import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(
  new URL('../supabase/migrations/20260828191625_add_wb_records_created_by_index.sql', import.meta.url),
  'utf8',
);

test('wb_records created_by foreign key has a covering index', () => {
  assert.match(
    sql,
    /create index if not exists wb_records_created_by_idx\s+on public\.wb_records\s*\(created_by\)/i,
  );
});
