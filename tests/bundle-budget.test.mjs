import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { checkBundleBudget } from '../scripts/bundle-budget-lib.mjs';

const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const vite = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');

test('bundle budget reports individual and total initial JavaScript regressions', () => {
  const manifest = {
    'src/main.js': { file: 'assets/app.js', isEntry: true, imports: ['supabase.js'], css: ['assets/app.css'] },
    'supabase.js': { file: 'assets/supabase.js' },
  };
  const sizes = { 'assets/app.js': 300, 'assets/supabase.js': 150, 'assets/app.css': 100 };
  assert.deepEqual(checkBundleBudget({ manifest, gzipSizes: sizes, limits: { entryJs: 350, initialJs: 500, entryCss: 120 } }), []);
  assert.ok(checkBundleBudget({ manifest, gzipSizes: sizes, limits: { entryJs: 250, initialJs: 400, entryCss: 90 } }).length >= 3);
});

test('map runtime is lazy and stable vendors have explicit chunk boundaries', () => {
  assert.doesNotMatch(app, /from ['"]leaflet['"]/);
  assert.match(app, /import\(['"]leaflet['"]\)/);
  assert.match(vite, /manualChunks/);
  assert.match(vite, /manifest:\s*true/);
});
