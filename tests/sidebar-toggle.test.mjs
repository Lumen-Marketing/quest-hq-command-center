import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const brandRow = (() => {
  const start = main.indexOf('<div class="deck-brand">');
  return main.slice(start, main.indexOf('</div>', start));
})();

test('the toggle lives on the brand row, at the top', () => {
  assert.match(brandRow, /<button class="deck-toggle" type="button" data-action="toggle-sidebar"/);
  // It briefly lived in a row of its own below the brand; that put it in a different place
  // from where it sits collapsed, which is the thing being avoided.
  assert.ok(!/deck-toggle-row/.test(main), 'the separate toggle row should be gone');
  assert.ok(!/deck-toggle-row/.test(css));
});

test('collapsing keeps the chevron beside the logo, not under it', () => {
  // Three earlier rules set a grid template on .deck-brand. Overriding only
  // grid-template-columns left the wordmark's slot in play, so the chevron wrapped to a
  // second implicit row and sat under the logo. Changing the display mode retires all
  // three templates at once, and a flex row simply skips the wordmark while it is
  // display:none — no template to fight.
  const rule = css.slice(css.lastIndexOf('.sidebar-collapsed .deck-brand {'));
  const body = rule.slice(0, rule.indexOf('}'));
  assert.match(body, /display: flex;/, 'a grid template here is overridden by three earlier rules');
  assert.match(body, /align-items: center;/);
  assert.match(body, /justify-content: center;/);
});

test('the toggle animates by mutating the live element, not by re-rendering', () => {
  // This is why no CSS made it move: render() replaces .quest-app with a new node that
  // already carries the collapsed class, so a transition has no previous width to run
  // from. A transition needs one element whose value changes, not two in sequence.
  const handler = main.slice(main.indexOf("if (action === 'toggle-sidebar')"));
  const body = handler.slice(0, handler.indexOf('\n  }'));
  assert.match(body, /shell\.classList\.toggle\('sidebar-collapsed', state\.sidebarCollapsed\)/);
  assert.match(body, /setTimeout\(render, 360\)/, 'the settle render must outlast the .32s transition');
  assert.match(body, /clearTimeout\(state\.sidebarSettleTimer\)/, 'rapid toggles must not stack renders');
  // aria has to be updated by hand now that the markup is not regenerated.
  assert.match(body, /node\.setAttribute\('aria-expanded'/);
  assert.match(body, /node\.setAttribute\('aria-label'/);
});

test('one chevron is rotated rather than two icons swapped', () => {
  // Swapping glyphs pops between two shapes with nothing to animate. Rotating makes the
  // flip itself the transition, and the direction it turns says which way the panel moves.
  assert.match(brandRow, /<i class="ti ti-chevron-left" aria-hidden="true"><\/i>/);
  assert.ok(!/sidebarCollapsed \? 'ti-/.test(brandRow), 'the icon should not be swapped per state');
  // Scoped to the brand row, where the toggle lives. Asserting across all of main.js also
  // caught unrelated uses — the Appearance panel's "Side menu" heading legitimately wants
  // a sidebar glyph, and that has nothing to do with how this button animates.
  assert.ok(!/ti-layout-sidebar/.test(brandRow), 'the old panel glyphs should be gone from the toggle');
  assert.match(css, /\.sidebar-collapsed \.deck-toggle i \{\s*transform: rotate\(180deg\);/);
  assert.match(css, /\.deck-toggle i \{[^}]*transition: transform \.24s/s);
});

test('the panel itself glides between widths', () => {
  // The rail is the animation: 236px to 76px. Without a transition the layout snaps and
  // the chevron rotation is the only thing that moves, which reads as a glitch.
  assert.match(css, /\.quest-app \{\s*transition: grid-template-columns \.32s cubic-bezier/);
  assert.match(css, /\.quest-app\.sidebar-collapsed \{\s*grid-template-columns: 76px/);
});

test('labels fade rather than vanish mid-slide', () => {
  assert.match(css, /\.side-item span,\n\.company-card div \{\s*transition: opacity \.18s ease;/);
  assert.match(css, /\.sidebar-collapsed \.side-item span,\n\.sidebar-collapsed \.company-card div \{\s*opacity: 0;/);
  // The rail clips its contents so labels leave with the panel instead of reflowing.
  assert.match(css, /\.deck \{\s*overflow-x: hidden;/);
});

// Read one @media block by balancing braces. Splitting on the at-rule instead would run
// each "block" on into every unrelated rule that follows it, which is how this test both
// broke on an unrelated rule being appended and then passed against the wrong CSS.
const mediaBlocks = (text, query) => {
  const out = [];
  let from = 0;
  for (;;) {
    const at = text.indexOf(query, from);
    if (at === -1) return out;
    const open = text.indexOf('{', at);
    let depth = 0;
    let i = open;
    for (; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1;
      else if (text[i] === '}' && (depth -= 1) === 0) break;
    }
    out.push(text.slice(open, i + 1));
    from = i + 1;
  }
};

test('the whole transition is skippable for reduced motion', () => {
  const blocks = mediaBlocks(css, '@media (prefers-reduced-motion: reduce)');
  assert.ok(blocks.length, 'expected at least one reduced-motion block');
  const sidebar = blocks.find((b) => /\.quest-app,/.test(b));
  assert.ok(sidebar, 'the collapse transition must be disabled under reduced motion');
  assert.match(sidebar, /transition: none;/);
});

test('the button still says what it does, and takes visible focus', () => {
  // The icon is aria-hidden, so the label on the button is its only accessible name.
  assert.match(brandRow, /aria-label="\$\{state\.sidebarCollapsed \? 'Expand navigation' : 'Collapse navigation'\}"/);
  assert.match(brandRow, /aria-expanded="\$\{state\.sidebarCollapsed \? 'false' : 'true'\}"/);
  assert.match(css, /\.deck-toggle:focus-visible \{[^}]*outline: 2px solid var\(--orange\)/s);
});

test('the hover nudge keeps the rotation rather than cancelling it', () => {
  // transform is one property: a hover rule setting only translateX would wipe the 180deg
  // rotation and flip the arrow the wrong way while hovered.
  assert.match(css, /\.sidebar-collapsed \.deck-toggle:hover i \{ transform: rotate\(180deg\) translateX\(-1px\); \}/);
});
