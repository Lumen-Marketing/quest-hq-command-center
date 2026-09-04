import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const dataIO = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
const redirect = readFileSync(new URL('../public/legacy-redirect.js', import.meta.url), 'utf8');

test('fatal recovery and print actions do not rely on CSP-blocked inline JavaScript', () => {
  assert.doesNotMatch(main, /onclick=["']location\.reload\(\)["']/);
  assert.match(main, /data-fatal-reload/);
  assert.match(main, /querySelector\('\[data-fatal-reload\]'\)\?\.addEventListener\('click'/);
  assert.doesNotMatch(dataIO, /<script>[^<]*window\.print/);
  assert.match(dataIO, /win\.addEventListener\('load', print, \{ once: true \}\)/);
});

test('legacy redirects run from a same-origin external script', () => {
  assert.match(redirect, /window\.location\.replace\(target\.toString\(\)\)/);
  assert.doesNotMatch(redirect, /innerHTML|document\.write/);
});
