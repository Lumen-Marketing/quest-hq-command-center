import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "when i toggle this it refresh it and go to the first field, pls make it stay where it is"
//
// A records table is wider than the window, so reaching a Yes/No column means scrolling sideways.
// Toggling it re-renders, the render replaces the table's markup, and the scroll preservation put
// back only scrollTop -- so the container came back at scrollLeft 0 and the control you had just
// used scrolled off screen under your own cursor.
//
// The App Builder makes wide tables the ordinary case: seventeen fields on one app in the report.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const fn = (name) => main.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`))?.[0] || '';

/* ---- the two halves have to agree ------------------------------------------------------- */

test('what is captured carries both axes', () => {
  const capture = fn('lastScrolledTarget');
  assert.ok(capture.includes('left: window.scrollX'), 'the page');
  assert.ok(capture.includes('left: el.scrollLeft'), 'and every inner container');
  assert.ok(capture.includes('left: surface.scrollLeft'), 'including the work surface fallback');
});

test('what is restored reads both axes back', () => {
  const apply = fn('applyKeptScroll');
  assert.ok(apply.includes('const { selector, top, left }'), 'left is destructured, not dropped');
  assert.ok(apply.includes('target.scrollLeft = x'), 'and written');
});

test('a container is kept when EITHER axis has moved', () => {
  // The subtle half. A table scrolled right sits at scrollTop 0, so a test on the top alone
  // dropped it from the list entirely -- the value was never captured, so there was nothing to
  // put back and the bug survived a fix to the restore side.
  assert.ok(fn('lastScrolledTarget').includes('(el.scrollTop || el.scrollLeft)'));
  assert.ok(fn('lastScrolledTarget').includes('(window.scrollY || window.scrollX)'));
  assert.ok(fn('lastScrolledTarget').includes('(surface.scrollTop || surface.scrollLeft)'));
});

test('a zero on both axes is still skipped', () => {
  // Keeping a container that has not moved is what let one at the top hide another that was not.
  // Widening to two axes must not quietly retire that.
  const capture = fn('lastScrolledTarget');
  assert.ok(capture.includes('if (el && (el.scrollTop || el.scrollLeft)) kept.push'), 'still guarded');
});

test('nothing is written unless it actually differs', () => {
  // Assigning an unchanged scrollLeft can cancel a smooth scroll in progress, and the restore
  // runs twice on every render by design.
  const apply = fn('applyKeptScroll');
  assert.ok(apply.includes('if (target.scrollLeft !== x) target.scrollLeft = x;'));
  assert.ok(apply.includes('if (window.scrollY !== top || window.scrollX !== x)'));
});

/* ---- the container this is actually about ----------------------------------------------- */

test('the records table is a scroll container the tracker can name', () => {
  // It has to be findable by selector after the render destroys the node.
  assert.match(styles, /\.wb-tbl-wrap \{[^}]*overflow: auto;/);
});
