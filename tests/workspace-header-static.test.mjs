import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('standard workspace headers collapse to actions only while notices keep readable copy', () => {
  assert.match(source, /function isNoticeWorkspaceHeader\s*\(/);
  assert.match(source, /if \(!isNoticeWorkspaceHeader\(title,\s*summary\)\)\s*\{/);
  assert.match(source, /<section class="workspace-head workspace-head-actions-only">/);
  assert.match(source, /return actions \? `[\s\S]*workspace-head-actions-only[\s\S]*` : '';/);
  assert.match(source, /<h1>\$\{h\(title\)\}<\/h1>/);
  assert.match(styles, /\.sr-only\s*\{/);
  assert.match(styles, /\.workspace-head-actions-only\s*\{/);
  assert.match(styles, /\.workspace-head-actions-only\s*\{[^}]*border-bottom:\s*0;/s);
  assert.match(styles, /\.workspace-head-actions-only\s+\.head-actions\s*\{/);
});
