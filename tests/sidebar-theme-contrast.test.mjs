import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "fix the UI icon of the menu on the side nav bar, make it visible so it turns icon color
// to light if the theme is dark and make the icon and text color to dark when the theme is
// light."
//
// Two separate leaks of the PAGE theme's colours onto a sidebar with its own theme, both
// measured in a browser before and after:
//
//   page light + Midnight menu, hovering a row .... icon  1.21:1 -> 14.46:1
//   page dark  + Light menu, any row .............. text  1.16:1 ->  5.53:1
//   resting row icon, Light menu .................. icon  2.58:1 ->  5.53:1

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

function rule(selector) {
  const at = css.indexOf(selector);
  assert.notEqual(at, -1, `${selector} not found`);
  return css.slice(at, css.indexOf('}', at));
}

test('a chosen menu theme keeps its background in dark mode', () => {
  // :root[data-theme="dark"] .deck is (0,3,0). A bare [data-sidebar-theme] .deck is (0,2,0)
  // and lost, so dark mode threw away the preset's background but kept its text -- which is
  // how the Light menu ended up painting near-black text on the dark deck.
  assert.match(css, /:root\[data-sidebar-theme\] \.deck \{/);
  assert.ok(
    css.indexOf(':root[data-sidebar-theme] .deck {') > css.indexOf(':root[data-theme="dark"] .deck {'),
    'equal specificity means source order decides, so this block must come later',
  );
});

test('hover re-states its colour, not just its wash', () => {
  // .quest-nav-v2 .side-item:hover sets color: var(--ink) -- the PAGE ink. Themed hover set
  // only the background, so the colour fell through to that and went near-black on navy.
  const hover = rule('[data-sidebar-theme] .side-item:hover,');
  assert.match(hover, /background: var\(--deck-hover\);/);
  assert.match(hover, /color: var\(--deck-strong\);/);
});

test('both kinds of row icon are covered on hover', () => {
  // Nav rows from svgIcon() carry .symbol-icon; workspace-app rows carry a bare Tabler <i>
  // with no class, which only inherits -- fixing one and not the other fixes half the menu.
  const iconHover = rule('[data-sidebar-theme] .side-item:hover .symbol-icon,');
  assert.match(iconHover, /\[data-sidebar-theme\] \.side-item:hover > i,/);
  assert.match(iconHover, /color: var\(--deck-strong\);/);
});

test('a resting row icon reads with its label, not with the section heading', () => {
  const icon = rule('[data-sidebar-theme] .side-item .symbol-icon,\n[data-sidebar-theme] .side-item > i {');
  assert.match(icon, /color: var\(--deck-text\);/);
  // It must no longer be grouped with the quietest text, which is where 2.58:1 came from.
  const quietest = rule('[data-sidebar-theme] .side-label,');
  assert.ok(!/symbol-icon/.test(quietest), 'the row icon is not a section heading');
  assert.match(quietest, /color: var\(--deck-label\);/, 'the headings themselves are unchanged');
});

test('the fix stays inside the themed menu', () => {
  // Charcoal is the absence of this block. Its numbers were measured unchanged, and they
  // stay that way only while every rule here is scoped to [data-sidebar-theme].
  for (const selector of [
    ':root[data-sidebar-theme] .deck {',
    '[data-sidebar-theme] .side-item:hover,',
    '[data-sidebar-theme] .side-item:hover .symbol-icon,',
    '[data-sidebar-theme] .side-item .symbol-icon,\n[data-sidebar-theme] .side-item > i {',
  ]) {
    assert.ok(css.includes(selector), `${selector} not found`);
  }
  // The base menu keeps its own page-theme colours for the untouched default.
  assert.match(css, /\.quest-nav-v2 \.side-item:hover \{[^}]*color: var\(--ink\);/);
});
