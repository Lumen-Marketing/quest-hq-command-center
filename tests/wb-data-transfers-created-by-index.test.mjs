import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260902192917_add_wb_data_transfers_created_by_index.sql', import.meta.url),
  'utf8',
);

test('wb_data_transfers covers its created_by foreign key', () => {
  assert.match(
    migration,
    /create index if not exists wb_data_transfers_created_by_idx\s+on public\.wb_data_transfers\s*\(created_by\)/i,
  );
});
