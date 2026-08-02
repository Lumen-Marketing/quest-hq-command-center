import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { LUCIDE_ALIASES } from '../scripts/lucide-aliases.mjs';
import { loadUsedIcons } from '../scripts/icon-usage.mjs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
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
  // Tabler is deliberately a static import — it is the default set and the fallback for
  // any icon a pack cannot draw, so it is always needed. The selectable packs must not be.
  assert.match(main, /^import '\.\/tabler-icons\.css';/m, 'the default set is always loaded');
  for (const pack of ['lucide', 'phosphor', 'remix']) {
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
  for (const pack of ['Lucide', 'Phosphor', 'Remix']) assert.ok(main.includes(pack), 'missing pack: ' + pack);
  assert.match(main, /MIT licensed/);
  assert.match(main, /Apache-2.0 licensed/);
  assert.match(main, /keep the Quest glyph, because Remix does not draw them/);
});

test('the choice is per account and rides the existing sync', () => {
  assert.match(main, /iconPack: 'quest',/, 'must be in APPEARANCE_DEFAULTS to sync');
  assert.match(main, /setAppearance\(\{ iconPack: node\.dataset\.iconPack \}\)/);
});

test('the build regenerates every pack together', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts['build:icons'], /build-icon-subset\.mjs/);
  // One builder for every pack now, driven by icon-packs.config.mjs — adding a pack is a
  // table plus a config entry, not another script.
  assert.match(pkg.scripts['build:icons'], /build-icon-packs\.mjs/);
  // Pinned, so a future Lucide release cannot silently renumber codepoints.
  assert.match(pkg.devDependencies['lucide-static'], /^\d+\.\d+\.\d+$/);
});
