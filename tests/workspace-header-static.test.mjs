import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('workspace headers keep page titles accessible without rendering a large repeated heading', () => {
  assert.match(source, /<h1 class="sr-only">\$\{h\(title\)\}<\/h1>/);
  assert.doesNotMatch(source, /<h1>\$\{h\(title\)\}<\/h1>/);
  assert.match(styles, /\.sr-only\s*\{/);
  assert.match(styles, /\.workspace-head p\s*\{[^}]*margin:\s*2px 0 0;/s);
  assert.match(styles, /\.workspace-head p\s*\{[^}]*font-size:\s*14px;/s);
});
