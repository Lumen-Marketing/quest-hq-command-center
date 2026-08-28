import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  WORKSPACE_BACKUP_METADATA_COLUMNS,
  hasWorkspaceBackupPayload,
  hydrateWorkspaceBackupPayload,
  workspaceBackupsForCache,
} from '../src/data/workspace-backups.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('the backup list projection deliberately excludes the large payload column', () => {
  assert.doesNotMatch(WORKSPACE_BACKUP_METADATA_COLUMNS, /\bpayload\b/);
  assert.match(WORKSPACE_BACKUP_METADATA_COLUMNS, /\bid\b/);
  assert.match(WORKSPACE_BACKUP_METADATA_COLUMNS, /\bcreated_at\b/);
});

test('a backup payload is only considered hydrated when it has snapshot data', () => {
  assert.equal(hasWorkspaceBackupPayload({ payload: null }, 1), false);
  assert.equal(hasWorkspaceBackupPayload({ payload: {} }, 1), false);
  assert.equal(hasWorkspaceBackupPayload({ payload: { version: 1, data: {} } }, 1), true);
});

test('live backup cache rows keep metadata but drop heavyweight snapshots', () => {
  const rows = workspaceBackupsForCache([{ id: 'one', label: 'Nightly', payload: { version: 1, data: { jobs: [{ id: 1 }] } } }]);

  assert.deepEqual(rows, [{ id: 'one', label: 'Nightly', payload: null }]);
});

test('every workspace-backup cache write goes through the payload-stripping helper', () => {
  const directWrites = [...main.matchAll(/writeJson\(WORKSPACE_BACKUP_CACHE_KEY,/g)];

  assert.equal(directWrites.length, 1, 'only persistWorkspaceBackupCache may write this cache');
  assert.match(main, /function persistAll\(\)[\s\S]*?persistWorkspaceBackupCache\(\);/);
});

test('a metadata-only backup hydrates its exact saved payload on demand', async () => {
  let selected = '';
  const savedPayload = { version: 1, data: { jobs: [{ id: 'job-1' }] } };
  const builder = {
    select(columns) { selected = columns; return this; },
    eq() { return this; },
    maybeSingle() { return Promise.resolve({ data: { payload: savedPayload }, error: null }); },
  };
  const client = { from: () => builder };

  const hydrated = await hydrateWorkspaceBackupPayload(
    { id: 'backup-1', company_id: 'company-1', payload: null },
    { client, safeQuery: (query) => Promise.resolve(query), version: 1 },
  );

  assert.equal(selected, 'payload');
  assert.equal(hydrated.payload, savedPayload);
});
