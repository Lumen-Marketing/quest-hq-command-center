import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('waiting screens show a loader, not a static empty-state icon', () => {
  assert.match(main, /\$\{questLoader\('Loading workspace data\.\.\.'\)\}/);
  assert.match(main, /\$\{questLoader\('Checking secure session\.\.\.'\)\}/);
  // An empty list is not a thing in progress, so ordinary empty states keep their icon.
  assert.match(main, /function emptyState\(text\) \{/);
});

test('the loader announces itself to assistive tech', () => {
  const fn = main.slice(main.indexOf('function questLoader('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  // Without a live region, a screen reader gets silence while the app waits.
  assert.match(body, /role="status"/);
  assert.match(body, /aria-live="polite"/);
  // The decorative artwork must not be announced alongside the text.
  assert.match(body, /<svg class="quest-loader-mark" viewBox="0 0 48 48" aria-hidden="true">/);
});

test('the rings turn at different speeds and opposite directions', () => {
  // Two rings turning together read as one ring; the contrast is what makes it look like
  // something working rather than something merely spinning.
  // Match the declarations directly. Matching `.quest-loader-inner {` would find the
  // shared transform-origin rule first, where that selector is simply the last in a list.
  assert.match(css, /\.quest-loader-outer \{[^}]*animation: quest-loader-spin 1\.6s linear infinite;/s);
  assert.match(css, /\.quest-loader-inner \{[^}]*animation: quest-loader-spin 2\.4s linear infinite reverse;/s);
  assert.match(css, /@keyframes quest-loader-spin \{\s*to \{ transform: rotate\(360deg\); \}/);
});

test('rotation is anchored to the artwork centre, not the box corner', () => {
  // Without transform-origin an SVG group rotates about (0,0) and swings off screen.
  assert.match(css, /\.quest-loader-outer,\s*\n\.quest-loader-inner \{\s*transform-origin: 24px 24px;/);
  assert.match(css, /\.quest-loader-dot \{[^}]*transform-origin: 24px 24px;/s);
});

test('it uses brand colour tokens rather than hard-coded hexes', () => {
  assert.match(css, /\.quest-loader-outer \{[^}]*stroke: var\(--orange\);/s);
  assert.match(css, /\.quest-loader-inner \{[^}]*stroke: var\(--ink\);/s);
  assert.match(css, /\.quest-loader-dot \{[^}]*fill: var\(--orange\);/s);
});

test('reduced motion stops the spin instead of only slowing it', () => {
  // A loading screen is the one thing you cannot look away from, so continuous rotation
  // is a real problem for vestibular disorders. The shape holds still and fades.
  const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce) {\n  .quest-loader-outer'));
  assert.match(block, /animation: quest-loader-fade/);
  assert.ok(!/quest-loader-spin/.test(block.slice(0, block.indexOf('}\n}'))), 'no rotation under reduced motion');
});

// The bug found alongside this: every empty state rendered a solid black blob.
test('outline symbols keep their stroke even with a custom class', () => {
  // svgIcon(id, className) REPLACES the default `symbol-icon` class rather than adding to
  // it, so a custom class inherits none of the stroke setup — and an outline path with no
  // stroke falls back to fill:black.
  const rule = css.match(/\.empty-symbol \{[^}]*\}/s)[0];
  assert.match(rule, /fill: none;/);
  assert.match(rule, /stroke: currentColor;/);
  assert.match(rule, /stroke-width: 1\.9;/);
});

test('q-empty is still the only symbol given a custom class', () => {
  // If another call site starts passing one, it needs the same treatment — this is the
  // check that surfaces it rather than another black blob in production.
  const custom = [...main.matchAll(/svgIcon\('([a-z0-9-]+)',\s*'([a-z0-9-]+)'\)/g)];
  assert.deepEqual(custom.map((m) => `${m[1]} -> ${m[2]}`), ['q-empty -> empty-symbol']);
});
