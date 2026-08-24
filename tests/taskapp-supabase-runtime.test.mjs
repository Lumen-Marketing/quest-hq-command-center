import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const appHtml = readFileSync(new URL('../taskmanagement/app.html', import.meta.url), 'utf8');
const assetSync = readFileSync(new URL('../scripts/sync-spa-assets.mjs', import.meta.url), 'utf8');
const sdkLoader = readFileSync(new URL('../taskmanagement/js/sdk-loader.js', import.meta.url), 'utf8');
const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

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

test('the embedded Tasks app retries a transient Supabase SDK asset failure', async () => {
  const appended = [];
  const firstScript = { getAttribute: () => 'vendor/supabase/supabase.js?v=release-1' };
  const window = { App: { basePath: '/taskmanagement/' }, location: { href: 'https://www.questbase.io/taskmanagement/app.html' } };
  const document = {
    querySelector: () => firstScript,
    createElement: () => ({}),
    head: {
      append(script) {
        appended.push(script.src);
        window.supabase = { createClient() {} };
        queueMicrotask(() => script.onload());
      },
    },
  };
  vm.runInNewContext(sdkLoader, {
    window,
    document,
    URL,
    Date,
    Promise,
    Error,
    setTimeout,
    clearTimeout,
    queueMicrotask,
  });

  await window.App.loadSupabaseSdk({ timeoutMs: 100 });

  assert.equal(appended.length, 1);
  assert.match(appended[0], /vendor\/supabase\/supabase\.js\?v=release-1&retry=\d+/);
  assert.equal(typeof window.supabase.createClient, 'function');
});

test('versioned Tasks runtime assets are cacheable without caching app or environment HTML', () => {
  assert.match(assetSync, /versionTaskStaticReferences/);
  assert.match(assetSync, /VERCEL_GIT_COMMIT_SHA/);

  const immutableSources = vercelConfig.headers
    .filter((rule) => rule.headers?.some((header) => /immutable/.test(header.value)))
    .map((rule) => rule.source);
  assert.ok(immutableSources.includes('/taskmanagement/js/(.*)'));
  assert.ok(immutableSources.includes('/taskmanagement/css/(.*)'));
  assert.ok(immutableSources.includes('/taskmanagement/vendor/(.*)'));
  assert.ok(!immutableSources.includes('/taskmanagement/app.html'));
  assert.ok(!immutableSources.includes('/taskmanagement/env.json'));
});
