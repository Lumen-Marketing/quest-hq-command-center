import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  findBrokenMarkdownLinks,
  findSensitiveContent,
  latestMigrationFilename,
  validateAdapterSources,
  validateDatabaseSnapshot,
  validateManifest,
  validateProjectBrain,
} from '../scripts/ai-context-lib.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('manifest validation requires sources, timestamps, and the latest repository migration', () => {
  const now = new Date().toISOString();
  const manifest = {
    schema_version: 1,
    generated_at: now,
    generated_from_commit: 'abc1234',
    repository: { latest_migration: '202607111000_harden_file_upload_buckets.sql' },
    live: {
      supabase_verified_at: now,
      vercel_verified_at: now,
      github_verified_at: now,
    },
  };

  assert.deepEqual(validateManifest(manifest, '202607111000_harden_file_upload_buckets.sql'), []);
  assert.match(validateManifest({ ...manifest, generated_at: 'not-a-date' }, manifest.repository.latest_migration).join('\n'), /generated_at/);
  assert.match(validateManifest({ ...manifest, generated_from_commit: 'not-a-commit' }, manifest.repository.latest_migration).join('\n'), /commit/i);
  assert.match(validateManifest({
    ...manifest,
    live: { ...manifest.live, supabase_verified_at: '2000-01-01T00:00:00.000Z' },
  }, manifest.repository.latest_migration).join('\n'), /stale/i);
  assert.match(validateManifest(manifest, '202607121000_new_change.sql').join('\n'), /latest migration/);
});

test('adapter validation requires every supported AI entry point to use the canonical README', () => {
  const valid = Object.fromEntries([
    'AGENTS.md',
    'CLAUDE.md',
    'GEMINI.md',
    '.github/copilot-instructions.md',
  ].map((name) => [name, 'Read `.ai/README.md` before making changes.']));

  assert.deepEqual(validateAdapterSources(valid), []);
  assert.match(validateAdapterSources({ ...valid, 'CLAUDE.md': 'Use README.md' }).join('\n'), /CLAUDE\.md/);
});

test('markdown link validation rejects missing local targets and permits anchors and web links', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'quest-ai-links-'));
  mkdirSync(path.join(root, '.ai'), { recursive: true });
  writeFileSync(path.join(root, '.ai', 'context.md'), '# Context\n');
  const source = '[Context](context.md) [Titled](context.md "Context") [Section](#section) [Web](https://example.com) [Missing](missing.md)';

  assert.deepEqual(findBrokenMarkdownLinks(source, path.join(root, '.ai', 'README.md'), root), ['.ai/missing.md']);
});

test('secret scanning catches credentials without flagging ordinary security documentation', () => {
  assert.deepEqual(findSensitiveContent([{ path: '.ai/security.md', content: 'Never expose the service_role key.' }]), []);
  assert.match(findSensitiveContent([{ path: '.ai/bad.md', content: 'STRIPE_SECRET_KEY=sk_live_1234567890abcdef' }]).join('\n'), /STRIPE_SECRET_KEY/);
  assert.match(findSensitiveContent([{ path: '.ai/bad.md', content: 'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnop' }]).join('\n'), /GitHub/i);
  assert.match(findSensitiveContent([{ path: '.ai/bad.md', content: 'VERCEL_TOKEN=1234567890abcdefghijklmnop' }]).join('\n'), /Vercel/i);
  assert.match(findSensitiveContent([{ path: '.ai/bad.md', content: '-----BEGIN PRIVATE KEY-----' }]).join('\n'), /private key/i);
});

test('database snapshot validation accepts catalog metadata and rejects row payloads', () => {
  const valid = {
    schema_version: 1,
    captured_at: '2026-07-14T00:00:00.000Z',
    source: { project_ref: 'rqundirizvojpzhljtdn', postgres_version: '17.6' },
    tables: [{ schema: 'public', name: 'companies', rls_enabled: true, columns: [] }],
    relationships: [],
    policies: [],
    functions: [],
    triggers: [],
    buckets: [],
    extensions: [],
    cron_jobs: [],
    migrations: [],
  };

  assert.deepEqual(validateDatabaseSnapshot(valid), []);
  assert.match(validateDatabaseSnapshot({ ...valid, tables: {} }).join('\n'), /tables must be an array/i);
  assert.match(validateDatabaseSnapshot({ ...valid, rows: [{ email: 'private@example.com' }] }).join('\n'), /row payload/i);
  assert.match(validateDatabaseSnapshot({ ...valid, data: [{ email: 'private@example.com' }] }).join('\n'), /unexpected catalog field/i);
  assert.match(
    validateDatabaseSnapshot({
      ...valid,
      tables: [{ ...valid.tables[0], data: [{ email: 'private@example.com' }] }],
    }).join('\n'),
    /unexpected catalog field/i,
  );
  assert.match(validateDatabaseSnapshot({ ...valid, tables: [{ schema: 'auth', name: 'users', columns: [] }] }).join('\n'), /auth\.users/);
});

test('latest migration selection follows the repository timestamp convention', () => {
  assert.equal(latestMigrationFilename([
    '202607081000_recycle_bin_safe_delete.sql',
    'README.md',
    '202607111000_harden_file_upload_buckets.sql',
  ]), '202607111000_harden_file_upload_buckets.sql');
});

test('the committed project brain is complete and wired into the repository check', () => {
  const result = validateProjectBrain(repoRoot);
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.required_files, 21);

  const packageJson = JSON.parse(result.files.get('package.json'));
  assert.equal(packageJson.scripts['ai:check'], 'node scripts/check-ai-context.mjs');
  assert.match(packageJson.scripts.check, /npm run ai:check/);
});
