import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function fn(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

test('the host seeds the Tasks theme before its iframe boots', () => {
  assert.match(source, /const EMBEDDED_TASKS_THEME_KEY = 'questhq:theme';/);
  const sync = fn('syncEmbeddedTasksAppearance');
  assert.match(sync, /localStorage\.setItem\(EMBEDDED_TASKS_THEME_KEY, resolvedTheme\)/);
  assert.match(fn('applyTheme'), /syncEmbeddedTasksAppearance\(\)/);
});

test('a live Tasks frame receives theme and accent changes without a reload', () => {
  const sync = fn('syncEmbeddedTasksAppearance');
  assert.match(sync, /querySelector\('\.taskapp-frame'\)/);
  assert.match(sync, /root\.dataset\.theme = resolvedTheme/);
  assert.match(sync, /root\.style\.setProperty\('--amber'/);
  assert.match(sync, /root\.style\.setProperty\('--accent'/);
  assert.match(sync, /frame\.addEventListener\('load', syncEmbeddedTasksAppearance\)/);
  assert.match(source, /queueMicrotask\(syncEmbeddedTasksAppearance\)/);
});
