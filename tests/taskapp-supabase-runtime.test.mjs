import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const appHtml = readFileSync(new URL('../taskmanagement/app.html', import.meta.url), 'utf8');
const assetSync = readFileSync(new URL('../scripts/sync-spa-assets.mjs', import.meta.url), 'utf8');
const sdkLoader = readFileSync(new URL('../taskmanagement/js/sdk-loader.js', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
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

test('the dev server serves the two Tasks files only the build generates', () => {
  // fd6e704 pointed app.html at vendor/supabase/supabase.js. Nothing commits that file --
  // sync-spa-assets writes it into dist -- and `vite dev` serves the SOURCE tree, so Tasks
  // died on localhost with "Configuration unavailable: Supabase SDK retry failed" while the
  // same commit was healthy in production. env.json has the same shape of problem: it is
  // generated, so dev fell back to the baked-in defaults and would silently ignore a
  // VITE_SUPABASE_* override the host app was honouring.
  assert.match(viteConfig, /apply:\s*['"`]serve['"`]/, 'the shim must be dev-only');
  assert.match(viteConfig, /['"`]\/taskmanagement\/vendor\/supabase\/supabase\.js['"`]/);
  assert.match(viteConfig, /['"`]\/taskmanagement\/env\.json['"`]/);

  // Served from the SAME definitions the build uses. Restating the project URL or key here
  // would let dev and production resolve different Supabase projects, and because they share
  // an origin that means two different sessions and an endless bounce to the host login.
  assert.match(viteConfig, /from '\.\/scripts\/sync-spa-assets\.mjs'/);
  assert.match(viteConfig, /TASK_SUPABASE_SDK_SOURCE/);
  assert.match(viteConfig, /buildTaskRuntimeEnv/);
  assert.match(assetSync, /export const TASK_SUPABASE_SDK_SOURCE/);
  assert.match(assetSync, /export function buildTaskRuntimeEnv/);
  assert.ok(
    !/supabaseAnonKey\s*:/.test(viteConfig),
    'vite.config must not keep its own copy of the task runtime config',
  );

  // sync-spa-assets runs its sync on import unless guarded, and vite.config now imports it.
  assert.match(assetSync, /process\.argv\[1\] && import\.meta\.url === pathToFileURL/);
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
