import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SPRITE_MARKUP } from '../src/ui/icon-sprite.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const ids = (markup) => [...markup.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]).sort();

test('the fallback carries exactly the same symbols as the document sprite', () => {
  // Two copies that drift apart are worse than one: the fallback would quietly restore an
  // outdated icon set, and only for the people who needed the fallback at all.
  assert.deepEqual(ids(SPRITE_MARKUP), ids(html), 'index.html and the fallback have diverged');
  assert.ok(ids(SPRITE_MARKUP).length >= 29);
});

test('the check runs at boot and only imports the copy when it is needed', () => {
  const fn = main.slice(main.indexOf('function ensureIconSprite('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  // Bailing early on a healthy page is what keeps this free.
  assert.match(body, /if \(document\.getElementById\('q-symbol-jobs'\)\) return;/);
  // Dynamic import: a static one would pull 6 KB of markup into the entry chunk and
  // defeat the reason the sprite was moved to index.html in the first place.
  assert.match(body, /import\('\.\/ui\/icon-sprite\.js'\)/);
  assert.ok(!/^import .*icon-sprite/m.test(main), 'the fallback must not be statically imported');
  assert.match(main, /ensureIconSprite\(\);/);
});

test('a missing sprite is reported rather than silently patched', () => {
  const fn = main.slice(main.indexOf('function ensureIconSprite('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  // Silent recovery hides a real deployment fault; the warning is how anyone finds out.
  assert.match(body, /console\.warn\('Icon sprite missing/);
  assert.match(body, /console\.error\('Icon sprite fallback failed to load'/);
});

test('the injected sprite goes before everything else in the body', () => {
  const fn = main.slice(main.indexOf('function ensureIconSprite('));
  assert.match(fn, /document\.body\.insertBefore\(sprite, document\.body\.firstChild\)/);
});

test('the rail scrollbar is hidden in every engine, without disabling scrolling', () => {
  // 76px of rail cannot spare a fifth of its width for a track. Scrolling itself is
  // untouched — overflow stays auto, so wheel and keyboard still work.
  assert.match(css, /\.deck-scroll \{[^}]*scrollbar-width: none;/s);
  assert.match(css, /\.deck-scroll \{[^}]*-ms-overflow-style: none;/s);
  assert.match(css, /\.deck-scroll::-webkit-scrollbar \{\s*width: 0;\s*height: 0;/);
  assert.match(css, /\.deck-scroll \{[^}]*overflow: auto;/s, 'scrolling must still be possible');
});
