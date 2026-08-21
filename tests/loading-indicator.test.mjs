import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const setupPanel = readFileSync(new URL('../src/onboarding/company-setup-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('full bootstrap screens and lazy content share the skeleton loading system', () => {
  const workspaceLoading = main.slice(main.indexOf('function renderWorkspaceLoading('), main.indexOf('function workspacePresetSelect('));
  const authLoading = main.slice(main.indexOf('function renderAuthLoading('), main.indexOf('function ensureDataLoad('));
  assert.match(workspaceLoading, /renderWorkspaceSkeleton\(\{/);
  assert.doesNotMatch(workspaceLoading, /questLoader\(/);
  assert.match(authLoading, /renderWorkspaceSkeleton\(\{/);
  assert.doesNotMatch(authLoading, /questLoader\(/);
  assert.match(main, /return questLoader\('Loading'\);/);
  // An empty list is not a thing in progress, so ordinary empty states keep their icon.
  assert.match(main, /function emptyState\(text\) \{/);
});

test('every legacy loader call now resolves to a content skeleton', () => {
  const fn = main.slice(main.indexOf('function questLoader('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /renderContentSkeleton\(\{/);
  assert.doesNotMatch(body, /<svg|quest-loader-mark/);
});

test('module loading placeholders use page structure and compact safely in dialogs', () => {
  assert.match(css, /\.quest-content-skeleton\s*\{/);
  assert.match(css, /\.quest-content-skeleton-grid\s*\{/);
  assert.match(css, /\.modal-body \.quest-content-skeleton/);
  assert.match(css, /\.work-surface > \.quest-content-skeleton/);
  assert.doesNotMatch(css, /@keyframes quest-loader-spin/);
  assert.match(setupPanel, /renderContentSkeleton\(\{/);
  assert.doesNotMatch(setupPanel, /company-setup-spinner/);
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
