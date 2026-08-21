import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appHtml = readFileSync(new URL('../taskmanagement/app.html', import.meta.url), 'utf8');
const assetSync = readFileSync(new URL('../scripts/sync-spa-assets.mjs', import.meta.url), 'utf8');

test('the embedded Tasks app loads Supabase from the Questbase origin', () => {
  assert.match(
    appHtml,
    /<script defer src="vendor\/supabase\/supabase\.js"><\/script>/,
    'Tasks must use a same-origin Supabase SDK so the production CSP cannot block auth',
  );
  assert.doesNotMatch(
    appHtml,
    /<script[^>]+src="https?:\/\//i,
    'Tasks must not depend on a third-party script host at runtime',
  );
});

test('the production asset sync ships the local Supabase browser bundle', () => {
  assert.match(assetSync, /@supabase['"`]\s*,\s*['"`]supabase-js['"`]\s*,\s*['"`]dist['"`]\s*,\s*['"`]umd['"`]\s*,\s*['"`]supabase\.js['"`]/);
  assert.match(assetSync, /taskRuntimeTarget\s*,\s*['"`]vendor['"`]\s*,\s*['"`]supabase['"`]\s*,\s*['"`]supabase\.js['"`]/);
});
