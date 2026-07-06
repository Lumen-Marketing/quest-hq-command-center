import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('recent form cards expand when the card row is clicked', () => {
  assert.match(source, /class="form-card \$\{state\.expandedFormIds\.has\(form\.id\)/);
  assert.match(source, /role="button"/);
  assert.match(source, /tabindex="0"/);
  assert.match(source, /data-action="toggle-form-card"/);
  assert.match(source, /data-card-action="toggle-form-card"/);
  assert.match(source, /function shouldIgnoreCardToggle\(target\)/);
  assert.match(source, /shouldIgnoreCardToggle\(event\.target\)/);
  assert.match(styles, /\.form-card\[role="button"\]/);
});
