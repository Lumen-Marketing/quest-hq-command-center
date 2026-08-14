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
// Every lookup runs against a comment-free copy. These rules are explained in prose that names
// the selectors and units involved -- including the wrong ones, and why they were wrong -- so
// searching the raw file finds the explanation rather than the declaration.
const declarations = styles.replace(/\/\*[\s\S]*?\*\//g, '');

const rule = (selector) => {
  const at = declarations.indexOf(selector);
  assert.notEqual(at, -1, `no rule for ${selector}`);
  const open = declarations.indexOf('{', at);
  return declarations.slice(open, declarations.indexOf('}', open));
};

test('the activity page marks itself as the split, and nothing else does', () => {
  // `.wb-dash` alone is not enough to key off: the analytics dashboard uses the same class
  // for a completely different layout, and making its surface a flex column would break it.
  assert.match(main, /<div class="wb-dash wb-dash-split">/);
  assert.equal(styles.split('wb-dash-split').length - 1 > 0, true);
  assert.equal((main.match(/wb-dash-split/g) || []).length, 1, 'one page owns the split');
});

test('the selector matches the nesting main.js actually emits', () => {
  // The first version of this rule was `.work-surface:has(> .wb-dash-split)`, and the page
  // renders as .work-surface > section.tool-page.wb-page > .wb-dash-split. It matched nothing,
  // every rule under it was dead, and the test here passed anyway because it only checked that
  // the CSS file contained the selector I had written. Checking a selector against itself
  // proves nothing; this checks it against the markup.
  const wrapped = /<section class="tool-page wb-page">\$\{wbViewCompanyHome\(companyId, workspace\)\}<\/section>/.test(main);
  assert.ok(wrapped, 'the activity page is wrapped in .wb-page');
  assert.ok(
    !/\.work-surface:has\(>\s*\.wb-dash-split\)/.test(styles),
    'a direct-child selector from the surface skips that wrapper and matches nothing',
  );
  // The wrapper is in the chain, so it has to pass the height through rather than be stepped over.
  const page = rule('.work-surface:has(.wb-dash-split) > .wb-page');
  assert.match(page, /display: flex/);
  assert.match(page, /flex: 1 1 auto/);
  assert.match(page, /min-height: 0/);
});

test('the surface hands its height to the split instead of scrolling itself', () => {
  // One scrollbar for both columns means reaching the end of the tiles by scrolling past the
  // whole feed. The surface has to stop being the scrollport for the two panes to become one.
  const surface = rule('.work-surface:has(.wb-dash-split)');
  assert.match(surface, /display: flex/);
  assert.match(surface, /flex-direction: column/);
  assert.match(surface, /overflow: hidden/);
  const split = rule('.wb-page > .wb-dash-split');
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
  const undo = declarations.indexOf('.work-surface:has(.wb-dash-split) { display: block');
  assert.notEqual(undo, -1, 'the split is never undone');
  const at = declarations.lastIndexOf('@media (max-width: 900px)', undo);
  assert.notEqual(at, -1, 'the undo is not inside a narrow-screen block');
  const block = declarations.slice(at, declarations.indexOf('\n}', undo));
  assert.match(block, /\.work-surface:has\(\.wb-dash-split\) \{ display: block; overflow: auto; \}/);
  // The wrapper is flexed on desktop, so it has to be put back too.
  assert.match(block, /> \.wb-page \{ display: block; \}/);
  assert.match(block, /overflow: visible/);
});

// --- down, never sideways -----------------------------------------------------------------

test('the panes scroll down and never sideways', () => {
  // `overflow-x` defaults to `visible`, which computes to `auto` the moment the other axis
  // scrolls -- so making the panes scroll vertically gave them a horizontal bar for free.
  const panes = rule('.wb-dash-split > .wb-dash-main,\n.wb-dash-split > .wb-dash-side');
  assert.match(panes, /overflow-x: hidden/);
});

test('a long unbroken value wraps instead of widening the feed', () => {
  // A sheet field stores its whole grid as one JSON string. Before this, one of those in the
  // feed pushed every card in the column sideways.
  assert.match(rule('.wb-act-text {'), /overflow-wrap: anywhere/);
  // The flex child has to be allowed to go narrower than its longest word, or the wrap never
  // gets the chance to happen.
  assert.match(rule('.wb-act-item > div'), /min-width: 0/);
});

test('the scrollbar shows up when the pointer is in the pane, and nothing moves when it does', () => {
  // Only the THUMB is hidden. Switching `scrollbar-width` to none would take the track away
  // too and reflow the whole column under the pointer, which is worse than a visible bar.
  const base = rule('.wb-dash-split > .wb-dash-main,\n.wb-dash-split > .wb-dash-side { scrollbar-color');
  assert.match(base, /scrollbar-color: transparent transparent/);
  assert.match(rule('.wb-dash-split > .wb-dash-main,\n.wb-dash-split > .wb-dash-side {'), /scrollbar-gutter: stable/,
    'the track stays reserved, so the bar appearing cannot shift the layout');
  const shown = rule('.wb-dash-split > .wb-dash-main:hover,');
  assert.match(shown, /scrollbar-color: var\(--border-strong/);
  // Keyboard scrolling has no pointer to hover with.
  assert.match(declarations, /\.wb-dash-split > \.wb-dash-side:focus-within \{ scrollbar-color: var\(--border-strong/);
});

test('the clock is sized to its tile, not to the window', () => {
  // A tile is a full column on one dashboard and half of one on the next, so a flat size is
  // either cramped or overflowing. Viewport units were the first attempt and were wrong for the
  // same reason: vw tracks the window, which is not what the clock sits in.
  assert.match(rule('.wb-clock-time'), /font-size: clamp\(24px, 15cqw, 46px\)/);
  assert.match(rule('.wb-clock-date'), /font-size: clamp\(/, 'the date is half the point of the tile');
  assert.match(rule('.wb-clock-date'), /overflow-wrap: anywhere/);
  // A cqw with no container silently measures the viewport, so the container has to exist.
  assert.match(rule('.wb-tile {'), /container-type: inline-size/, 'the tile is the container');
  // inline-size only: block size stays content-driven, which is what wbLayoutTiles measures to
  // pack the masonry. `container-type: size` would collapse every tile.
  assert.ok(!/container-type: size/.test(declarations), 'never the two-axis kind');
});

test('a comment box is never focused flush against the edge its menu opens into', () => {
  // The @mention list is absolutely positioned ABOVE its input, so an input at the very top
  // of the feed pane has nowhere to draw it. The work surface clipped it the same way before
  // the split, only from higher up; the scroll padding keeps focus away from that edge.
  assert.match(styles, /bottom: calc\(100% \+ 4px\)/, 'the menu still opens upward');
  assert.match(rule('.wb-dash-split > .wb-dash-main { scroll-padding-top'), /scroll-padding-top: 240px/);
});
