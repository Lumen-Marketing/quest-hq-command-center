import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "On the app builder activity page, can you separate the scrolling of these two? The tiles
// and the feed."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

// The rule block, so a later `.wb-dash` rule elsewhere in the sheet cannot satisfy these by
// accident -- there are two unrelated `.wb-dash` uses in this stylesheet.
const rule = (selector) => {
  const at = styles.indexOf(selector);
  assert.notEqual(at, -1, `no rule for ${selector}`);
  const open = styles.indexOf('{', at);
  return styles.slice(open, styles.indexOf('}', open));
};

test('the activity page marks itself as the split, and nothing else does', () => {
  // `.wb-dash` alone is not enough to key off: the analytics dashboard uses the same class
  // for a completely different layout, and making its surface a flex column would break it.
  assert.match(main, /<div class="wb-dash wb-dash-split">/);
  assert.equal(styles.split('wb-dash-split').length - 1 > 0, true);
  assert.equal((main.match(/wb-dash-split/g) || []).length, 1, 'one page owns the split');
});

test('the surface hands its height to the split instead of scrolling itself', () => {
  // One scrollbar for both columns means reaching the end of the tiles by scrolling past the
  // whole feed. The surface has to stop being the scrollport for the two panes to become one.
  const surface = rule('.work-surface:has(> .wb-dash-split)');
  assert.match(surface, /display: flex/);
  assert.match(surface, /flex-direction: column/);
  assert.match(surface, /overflow: hidden/);
  const split = rule('.work-surface:has(> .wb-dash-split) > .wb-dash-split');
  assert.match(split, /flex: 1 1 auto/);
  // Without this the panes are sized by their content and overflow the surface instead of
  // scrolling -- it is the single declaration the whole layout turns on.
  assert.match(split, /min-height: 0/);
  assert.match(split, /align-items: stretch/, 'both panes take the full height, not just their content');
});

test('each pane scrolls on its own and keeps its scroll to itself', () => {
  const panes = rule('.wb-dash-split > .wb-dash-main,\n.wb-dash-split > .wb-dash-side');
  assert.match(panes, /overflow-y: auto/);
  assert.match(panes, /min-height: 0/);
  // Reaching the end of the tiles must not then start scrolling whatever is behind them.
  assert.match(panes, /overscroll-behavior: contain/);
  // The bar appears only once there is something to scroll; reserving it stops the cards
  // jumping sideways the moment one more post arrives.
  assert.match(panes, /scrollbar-gutter: stable/);
});

test('stacked on a narrow screen, the surface takes its scroll back', () => {
  // Below 900px the two columns are one column. Two nested scrollports inside a page that
  // also scrolls is a trap on a phone.
  // The sheet has many `max-width: 900px` blocks; this wants the one the split is undone in,
  // not whichever comes first.
  const undo = styles.indexOf('.work-surface:has(> .wb-dash-split) { display: block');
  assert.notEqual(undo, -1, 'the split is never undone');
  const at = styles.lastIndexOf('@media (max-width: 900px)', undo);
  assert.notEqual(at, -1, 'the undo is not inside a narrow-screen block');
  const block = styles.slice(at, styles.indexOf('\n}', undo));
  assert.match(block, /\.work-surface:has\(> \.wb-dash-split\) \{ display: block; overflow: auto; \}/);
  assert.match(block, /overflow: visible/);
});

test('a comment box is never focused flush against the edge its menu opens into', () => {
  // The @mention list is absolutely positioned ABOVE its input, so an input at the very top
  // of the feed pane has nowhere to draw it. The work surface clipped it the same way before
  // the split, only from higher up; the scroll padding keeps focus away from that edge.
  assert.match(styles, /bottom: calc\(100% \+ 4px\)/, 'the menu still opens upward');
  assert.match(rule('.wb-dash-split > .wb-dash-main { scroll-padding-top'), /scroll-padding-top: 240px/);
});
