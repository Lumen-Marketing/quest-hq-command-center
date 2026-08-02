import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const brandBlock = css.slice(css.indexOf('/* ---- Side menu: surfaces that were painted before the icons went plain'));

test('the workspace rail no longer paints a chip behind a chosen icon', () => {
  // The rail set its own light-grey tile and grey glyph, which outranked the plain-icon
  // rule on specificity and so survived it — visibly, as a chip on a navy sidebar.
  assert.match(brandBlock, /\.workspace-rail-item \.workspace-icon:not\(\.has-upload\) \{[^}]*background: none;/s);
  assert.match(brandBlock, /\.workspace-rail-item\.active \.workspace-icon:not\(\.has-upload\) \{[^}]*background: none;/s);
  // And it takes the company's icon colour like every other placement.
  assert.match(brandBlock, /\.workspace-rail-item \.workspace-icon:not\(\.has-upload\) \{[^}]*color: var\(--icon-color, var\(--orange\)\)/s);
});

test('an uploaded rail image keeps its container', () => {
  // Only the glyph case is stripped; a photo still needs its frame and crop.
  for (const rule of brandBlock.split('}').filter((r) => r.includes('{'))) {
    const selector = rule.slice(0, rule.indexOf('{'));
    if (!selector.includes('.workspace-rail-item .workspace-icon')) continue;
    assert.match(selector, /:not\(\.has-upload\)/, selector.trim());
  }
});

test('the My work / Company toggle follows the side menu theme', () => {
  // It was built from --surface / --ink, which are the page's colours rather than the
  // menu's, so on a themed menu it stayed a cream card sitting on navy.
  assert.match(brandBlock, /\[data-sidebar-theme\] \.sidebar-scope-toggle \{[^}]*background: var\(--deck-hover\)/s);
  assert.match(brandBlock, /\[data-sidebar-theme\] \.sidebar-scope-toggle button \{[^}]*color: var\(--deck-label\)/s);
  assert.match(brandBlock, /\[data-sidebar-theme\] \.sidebar-scope-toggle button\.active \{[^}]*background: var\(--deck-active-bg\)/s);
  // Scoped, so an untouched sidebar keeps exactly what it had.
  for (const rule of brandBlock.split('}').filter((r) => r.includes('{'))) {
    const selector = rule.slice(0, rule.indexOf('{'));
    if (!selector.includes('.sidebar-scope-toggle')) continue;
    assert.match(selector, /\[data-sidebar-theme\]/, `unscoped: ${selector.trim()}`);
  }
});

test('the logo has no plate behind it', () => {
  assert.match(brandBlock, /\.deck-brand \.logo\.logo-image-mark \{[^}]*background: none;/s);
  assert.match(brandBlock, /\.deck-brand \.logo\.logo-image-mark \{[^}]*box-shadow: none;/s);
});

test('a light variant of the mark exists and is generated, not hand-edited', () => {
  // The mark's ink is near black, so on a dark menu a transparent logo is a logo you
  // cannot see. The white plate used to hide that.
  assert.ok(existsSync(new URL('../src/assets/questbase-mark-light.png', import.meta.url)), 'light mark missing');
  const script = readFileSync(new URL('../scripts/build-brand-icons.py', import.meta.url), 'utf8');
  assert.match(script, /questbase-mark-light\.png/);
  assert.match(script, /art=dark_art/);
});

test('both marks are rendered and CSS picks one', () => {
  // The markup is written long before anyone knows which theme is active, so swapping a
  // src in JS would mean re-rendering the shell on every theme change.
  assert.match(main, /import questLogoMarkLightUrl from '\.\/assets\/questbase-mark-light\.png';/);
  assert.match(main, /quest-logo-image quest-logo-on-light/);
  assert.match(main, /quest-logo-image quest-logo-on-dark/);
  // One accessible name between them, not two.
  const fn = main.slice(main.indexOf('function questLogoImage('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.equal((body.match(/alt="\$\{h\(alt\)\}"/g) || []).length, 1);
  assert.match(body, /aria-hidden="true"/);
});

test('the light-ink mark shows on every dark side menu, including the untouched default', () => {
  // Themed dark presets carry the surface attribute...
  assert.match(brandBlock, /\[data-sidebar-surface="dark"\] \.deck \.quest-logo-on-dark \{\s*display: block;/s);
  // ...but the shipped sidebar is dark and sets no theme attribute at all, so keying only
  // on [data-sidebar-surface="dark"] would leave the default showing a near-black mark on
  // a near-black background, which is exactly where this started.
  assert.match(brandBlock, /:root:not\(\[data-sidebar-theme\]\) \.deck \.quest-logo-on-dark \{\s*display: block;/s);
  // Everything outside the side menu is a light surface and keeps the dark-ink mark.
  assert.match(brandBlock, /\.quest-logo-on-dark \{\s*display: none;/s);
});

test('the Light preset gets the dark-ink mark, by falling through rather than by a rule', () => {
  // data-sidebar-surface="light" matches neither dark rule, so the global "hide the
  // light-ink mark" default applies. Worth pinning: adding a broad
  // [data-sidebar-theme] .deck rule later would silently break the light preset.
  const darkOnly = [...brandBlock.matchAll(/([^{}]*\.quest-logo-on-dark[^{}]*)\{\s*display: block;/g)].map((m) => m[1]);
  assert.ok(darkOnly.length >= 2, 'expected the dark-surface rules');
  for (const selector of darkOnly) {
    assert.ok(
      /data-sidebar-surface="dark"|:not\(\[data-sidebar-theme\]\)/.test(selector),
      `this would show the light-ink mark on a light sidebar: ${selector.trim()}`,
    );
  }
});
