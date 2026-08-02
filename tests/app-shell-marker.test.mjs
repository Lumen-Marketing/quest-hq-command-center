import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The production smoke check tells a real page from a redirect, an error shell or an auth
// wall by looking for a marker string in the served HTML. That marker is the <title> in
// index.html — a fact that lived only in the smoke script, so shortening the title to
// "Questbase" failed 28 of 36 production routes while every one of them was serving
// perfectly. Nothing in the test suite noticed, because nothing tied the two together.
//
// This does. The expected value is read out of the smoke library rather than repeated
// here, so the two cannot drift apart in either direction.

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const smokeLib = readFileSync(new URL('../scripts/production-smoke-lib.mjs', import.meta.url), 'utf8');

const markers = (() => {
  const line = smokeLib.match(/const APP_SHELL_MARKERS = \[([^\]]+)\]/);
  assert.ok(line, 'APP_SHELL_MARKERS should exist in the smoke library');
  return [...line[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
})();

test('the smoke check has a marker to look for', () => {
  assert.ok(markers.length > 0, 'expected at least one app-shell marker');
});

test('index.html carries a marker the production smoke check accepts', () => {
  const matched = markers.filter((marker) => html.includes(marker));
  assert.ok(
    matched.length > 0,
    `index.html contains none of the markers production verification looks for.\n`
    + `  expected one of: ${markers.join(' | ')}\n`
    + `  actual <title>:  ${(html.match(/<title>([^<]*)<\/title>/) || [])[1]}\n`
    + '  Every company route will report FAIL while serving correctly.',
  );
});

test('the marker is the page title, where the smoke check reads it from', () => {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  assert.ok(
    markers.some((marker) => title.includes(marker)),
    `the marker must be in <title>, not merely somewhere in the file; got "${title}"`,
  );
});

test('the title says why it must not be shortened', () => {
  // The change that broke this looked entirely harmless in review.
  const before = html.slice(0, html.indexOf('<title>'));
  assert.match(before, /production-smoke/, 'a comment above <title> should explain the constraint');
});
