import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const spriteSymbols = new Set([...html.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));

test('the sprite lives in the document, not in the bundle', () => {
  // It used to be a 5.7 KB template literal re-serialised into innerHTML on every render.
  // Moving it into index.html means the HTML parser paints the icons before any script
  // runs — but it also means the JS no longer carries a copy, so if index.html ever ships
  // without it, every `<use href="#q-…">` in the app resolves to nothing and all sprite
  // icons silently disappear. There is no fallback; this test is the safety net.
  assert.ok(spriteSymbols.size >= 29, `expected the full sprite, found ${spriteSymbols.size} symbols`);
  assert.ok(!/renderSvgSprite/.test(main), 'the JS should not carry a second copy');
});

test('the sprite sits outside #app, so re-rendering cannot wipe it', () => {
  const spriteAt = html.indexOf('<svg class="svg-sprite"');
  const appAt = html.indexOf('id="app"');
  assert.notEqual(spriteAt, -1, 'the sprite should be in index.html');
  assert.ok(spriteAt < appAt, 'the sprite must precede #app, which render() replaces wholesale');
});

test('every symbol the app asks for exists in the sprite', () => {
  // Covers both call shapes: svgIcon('q-thing') and the `symbol:` entries the nav is
  // built from. A missing id is not an error anywhere — it just renders nothing.
  const referenced = new Set([
    ...[...main.matchAll(/svgIcon\('(q-[a-z0-9-]+)'/g)].map((m) => m[1]),
    ...[...main.matchAll(/symbol: '(q-[a-z0-9-]+)'/g)].map((m) => m[1]),
  ]);
  assert.ok(referenced.size > 15, `expected many referenced symbols, found ${referenced.size}`);
  const missing = [...referenced].filter((id) => !spriteSymbols.has(id));
  assert.deepEqual(missing, [], 'these would render as empty space with no error');
});

test('the sprite is hidden without being removed from the accessibility tree wrongly', () => {
  const tag = html.slice(html.indexOf('<svg class="svg-sprite"'));
  assert.match(tag.slice(0, 120), /aria-hidden="true"/);
  assert.match(tag.slice(0, 120), /focusable="false"/);
});
