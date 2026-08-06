import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { LUCIDE_ALIASES } from '../scripts/lucide-aliases.mjs';
import { loadUsedIcons } from '../scripts/icon-usage.mjs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const panel = readFileSync(new URL('../src/ui/appearance-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const packCss = readFileSync(new URL('../src/lucide-icons.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const codepoints = JSON.parse(readFileSync(new URL('../node_modules/lucide-static/font/codepoints.json', import.meta.url), 'utf8'));

const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

test('every alias points at a glyph Lucide actually defines', () => {
  // A typo here ships a blank box, which is worse than keeping the Tabler icon.
  const bad = Object.entries(LUCIDE_ALIASES).filter(([, target]) => target && !(target in codepoints));
  assert.deepEqual(bad, [], `not in Lucide: ${bad.map(([k, v]) => `${k} -> ${v}`).join(', ')}`);
});

test('the pack covers essentially every icon the app uses', () => {
  const { used } = loadUsedIcons();
  const rules = new Set([...packCss.matchAll(/\.ti-([a-z0-9-]+):before\{content/g)].map((m) => m[1]));
  const uncovered = [...used.keys()].filter((n) => !rules.has(n));
  // One deliberate exception: `ladder` has no Lucide equivalent and keeps its Tabler glyph
  // rather than being mapped to something ladder-ish that would mislabel the control.
  assert.deepEqual(uncovered, ['ladder'], `unexpectedly uncovered: ${uncovered.join(', ')}`);
});

test('an icon with no equivalent is not switched to the Lucide font', () => {
  // It would render a blank box: the class would take the Lucide family while its
  // codepoint still belongs to Tabler.
  const familyRule = packCss.slice(0, packCss.indexOf('{\n  font-family: "lucide-icons"'));
  assert.ok(!familyRule.includes('.ti-ladder'), 'ladder must keep the Tabler family');
});

test('the generated stylesheet is scoped so the default pack is untouched', () => {
  const selectors = [...packCss.matchAll(/^(\[[^{]+)\{/gm)].map((m) => m[1]);
  assert.ok(selectors.length > 0, 'expected generated rules');
  for (const sel of selectors) {
    assert.match(sel, /\[data-icon-pack="lucide"\]/, `unscoped rule would change the default pack: ${sel.trim().slice(0, 80)}`);
  }
});

test('the font is vendored and subsetted, not fetched from a CDN', () => {
  // Local-only was an explicit decision: it keeps the app working offline and sends
  // nothing about who is using it to a third party.
  assert.ok(!/fonts\.googleapis|cdn\.|unpkg|jsdelivr/i.test(packCss), 'no external font source');
  assert.match(packCss, /url\("\.\/assets\/fonts\/lucide-subset\.woff2"\)/);
  const font = new URL('../src/assets/fonts/lucide-subset.woff2', import.meta.url);
  assert.ok(existsSync(font), 'the subset font should be committed');
  const kb = statSync(font).size / 1024;
  assert.ok(kb < 120, `subset should stay small, got ${kb.toFixed(0)} KB`);
});

test('selecting Quest costs nothing — the pack is imported only when chosen', () => {
  const body = fn('applyIconPack');
  assert.match(body, /if \(clean === 'quest'\) \{\s*delete root\.dataset\.iconPack;/);
  // A table of thunks: the bundler needs literal import paths, so a pack cannot be a
  // computed import.
  assert.match(main, /lucide: \(\) => import\('\.\/lucide-icons\.css'\)/);
  assert.match(main, /phosphor: \(\) => import\('\.\/phosphor-icons\.css'\)/);
  assert.match(main, /remix: \(\) => import\('\.\/remix-icons\.css'\)/);
  assert.match(main, /material: \(\) => import\('\.\/material-icons\.css'\)/);
  // Tabler is deliberately a static import — it is the default set and the fallback for
  // any icon a pack cannot draw, so it is always needed. The selectable packs must not be.
  assert.match(main, /^import '\.\/tabler-icons\.css';/m, 'the default set is always loaded');
  for (const pack of ['lucide', 'phosphor', 'remix', 'material']) {
    assert.ok(!new RegExp(`^import '\\./${pack}-icons\\.css'`, 'm').test(main), `${pack} must not be statically imported`);
  }
});

test('a failed pack load leaves the icons alone rather than half-applied', () => {
  const body = fn('applyIconPack');
  // The attribute is only set after the stylesheet resolves, so a slow or failed import
  // shows Quest icons rather than boxes.
  assert.match(body, /\.then\(\(\) => \{ root\.dataset\.iconPack = clean; \}\)/);
  assert.match(body, /delete iconPackStylesheets\[clean\];/, 'a failure must be retryable');
  assert.match(body, /console\.error\('Icon pack failed to load', error\)/);
});

test('an unknown saved pack falls back instead of leaving a dead attribute', () => {
  assert.match(fn('applyIconPack'), /ICON_PACK_IDS\.includes\(pack\) \? pack : 'quest'/);
  assert.match(fn('getAppearance'), /!ICON_PACK_IDS\.includes\(merged\.iconPack\)\) merged\.iconPack = 'quest'/);
});

test('the setting is offered, and says what each pack is', () => {
  assert.match(panel, /data-action="set-icon-pack"/);
  assert.match(panel, /appearance-section-head[^>]*>.*Icons/s);
  // The description comes from the pack table, so it cannot drift from what shipped.
  assert.match(panel, /ICON_PACKS\.find\(\(\[id\]\) => id === a\.iconPack\)/);
  assert.match(main, /const ICON_PACKS = \[/);
  // Each pack states its licence and any icons it cannot draw.
  for (const pack of ['Lucide', 'Phosphor', 'Remix', 'Google']) assert.ok(main.includes(pack), 'missing pack: ' + pack);
  assert.match(main, /MIT licensed/);
  assert.match(main, /Apache-2.0 licensed/);
  assert.match(main, /keep the Quest glyph, because Remix does not draw them/);
});

test('the choice is per account and rides the existing sync', () => {
  // Google Material is what a new account gets. The pack is vendored, so this default
  // still fetches nothing from Google.
  assert.match(main, /iconPack: 'material',/, 'must be in APPEARANCE_DEFAULTS to sync');
  assert.match(main, /setAppearance\(\{ iconPack: node\.dataset\.iconPack \}\)/);
});

test('the build regenerates every pack together', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts['build:icons'], /build-icon-subset\.mjs/);
  // One builder for every pack now, driven by icon-packs.config.mjs — adding a pack is a
  // table plus a config entry, not another script.
  assert.match(pkg.scripts['build:icons'], /build-icon-packs\.mjs/);
  // Pinned, so an upstream release cannot silently renumber codepoints underneath the
  // generated CSS.
  for (const dep of ['lucide-static', 'remixicon', '@phosphor-icons/web', 'material-icons']) {
    assert.match(pkg.devDependencies[dep], /^\d+\.\d+\.\d+$/, `${dep} must be pinned to an exact version`);
  }
});

// --- every pack, not just the first one ---------------------------------------------

const PACKS = [
  ['lucide', 'lucide-subset.woff2'],
  ['phosphor', 'phosphor-subset.woff2'],
  ['remix', 'remix-subset.woff2'],
  ['material', 'material-subset.woff2'],
];

for (const [id, font] of PACKS) {
  const css = readFileSync(new URL(`../src/${id}-icons.css`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

  test(`${id}: every rule is scoped, so no other pack is affected`, () => {
    const selectors = [...css.matchAll(/^(\[[^{]+)\{/gm)].map((m) => m[1]);
    assert.ok(selectors.length > 0, 'expected generated rules');
    for (const sel of selectors) {
      assert.match(sel, new RegExp(`\\[data-icon-pack="${id}"\\]`), `unscoped: ${sel.trim().slice(0, 70)}`);
    }
  });

  test(`${id}: the font is vendored, never fetched from a CDN`, () => {
    // Local-only was an explicit decision — it keeps the app working offline and sends
    // nothing about who uses it to a third party. That matters most for the Google pack.
    assert.ok(!/fonts\.googleapis|gstatic|cdn\.|unpkg|jsdelivr/i.test(css), 'no external font source');
    assert.ok(css.includes(`./assets/fonts/${font}`), 'should reference the local subset');
    assert.ok(existsSync(new URL(`../src/assets/fonts/${font}`, import.meta.url)), 'subset should be committed');
  });

  test(`${id}: covers the app, and anything it cannot draw keeps Tabler`, () => {
    const { used } = loadUsedIcons();
    const mapped = new Set([...css.matchAll(/\.ti-([a-z0-9-]+):before\{content/g)].map((m) => m[1]));
    const kept = [...used.keys()].filter((n) => !mapped.has(n));
    // A pack is only worth offering if it covers nearly everything; a third of the icons
    // falling back would read as broken rather than as a style.
    assert.ok(mapped.size / used.size > 0.95, `${id} covers only ${Math.round(mapped.size / used.size * 100)}%`);
    // Whatever it cannot draw must NOT take the pack's font-family, or it renders a blank
    // box: the class would use this font while its codepoint still belongs to Tabler.
    const familyRule = css.slice(0, css.indexOf('{\n  font-family:'));
    for (const name of kept) {
      assert.ok(!familyRule.includes(`.ti-${name},`) && !familyRule.endsWith(`.ti-${name}`), `${name} must keep the Tabler family`);
    }
  });
}

// --- the pack must reach every icon, not just the font ones -------------------------

test('sprite symbols switch to the pack too', () => {
  // The sidebar and module chrome use Quest's own SVG sprite. Without this, choosing a
  // pack restyled the page but left every navigation icon unchanged — the setting looked
  // half broken.
  const fn2 = main.slice(main.indexOf('function svgIcon('));
  const body = fn2.slice(0, fn2.indexOf('\n}\n'));
  assert.match(body, /activeIconPack !== 'quest' && SYMBOL_ICON_EQUIVALENT\[id\]/);
  assert.match(body, /<i class="ti \$\{equivalent\}/);
  // Quest keeps its own sprite: it is the shipped look, not a fallback.
  assert.match(body, /<use href="#\$\{h\(id\)\}">/);
});

test('every sprite symbol the app renders has an equivalent', () => {
  // A symbol with no mapping silently keeps the sprite, so the pack would apply to some
  // navigation icons and not others — worse than not applying at all.
  const used = new Set([...main.matchAll(/svgIcon\('([a-z-]+)'/g)].map((m) => m[1]));
  const at = main.indexOf('const SYMBOL_ICON_EQUIVALENT = {');
  const table = main.slice(at, main.indexOf('\n};', at));
  const mapped = new Set([...table.matchAll(/'(q-[a-z-]+)':/g)].map((m) => m[1]));
  // Brand marks are deliberately excluded — an icon set has no opinion about a logo.
  const brand = new Set(['q-logo', 'q-company']);
  const missing = [...used].filter((id) => !mapped.has(id) && !brand.has(id));
  assert.deepEqual(missing, [], `sprite symbols with no pack equivalent: ${missing.join(', ')}`);
});

test('the equivalents are real icons the subset ships', () => {
  const { used } = loadUsedIcons();
  const at = main.indexOf('const SYMBOL_ICON_EQUIVALENT = {');
  const table = main.slice(at, main.indexOf('\n};', at));
  const targets = [...table.matchAll(/'ti-([a-z0-9-]+)'/g)].map((m) => m[1]);
  assert.ok(targets.length > 20, 'expected the equivalence table');
  const missing = targets.filter((n) => !used.has(n));
  assert.deepEqual(missing, [], `not in the icon subset: ${missing.join(', ')}`);
});

test('the active pack is mirrored rather than read per icon', () => {
  // svgIcon runs hundreds of times in one render; reading storage or the DOM each time
  // would be a real cost for a value that changes only when someone picks a pack.
  assert.match(main, /let activeIconPack = 'quest';/);
  assert.match(fn('applyIconPack'), /activeIconPack = clean;/);
});

test('a glyph standing in for a sprite is sized for a font, not an SVG', () => {
  // .symbol-icon sets width/height/stroke/fill, none of which size a glyph — without its
  // own rule the sidebar icons would jump when the pack changed.
  const block = styles.slice(styles.indexOf('/* ---- Sprite symbols rendered as font glyphs'));
  assert.match(block, /i\.symbol-icon \{[^}]*font-size: 19px;/s);
  assert.match(block, /\.side-item i\.symbol-icon \{[^}]*font-size: 17px;/s);
});
