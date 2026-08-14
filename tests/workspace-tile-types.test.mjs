import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "When I add a clock it just adds a Note. I don't need notes, I need a clock."
//
// normalizeWorkspaceTile falls back to 'text' for a type it does not recognise, and 'text' is
// the Note tile. The clock shipped without being added to WB_TILE_TYPES, so picking Time & date
// quietly produced a Note -- no error, no warning, just the wrong tile.
//
// The normalizer is RUN against every type the picker offers. A list checked against itself
// would have passed while the bug was live.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const modal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');

const at = main.indexOf('const WB_TILE_TYPES =');
assert.notEqual(at, -1);
const end = main.indexOf('\n}\n', main.indexOf('function normalizeWorkspaceTile'));
const normalizeWorkspaceTile = new Function('wbUid', `${main.slice(at, end + 2)}; return normalizeWorkspaceTile;`)(() => 'id1');

// The catalog entries are [type, icon, title, description].
const offered = [...modal.matchAll(/\['([a-z]+)', 'ti-[a-z0-9-]+', '/g)].map((m) => m[1]);

test('the picker offers the tiles it looks like it offers', () => {
  assert.ok(offered.length >= 10, `only found ${offered.length} catalog entries`);
  assert.ok(offered.includes('clock'), 'Time & date is on the menu');
});

test('every tile the picker offers comes back as itself', () => {
  const wrong = offered
    .map((type) => [type, normalizeWorkspaceTile({ type, config: {} }).type])
    .filter(([type, got]) => got !== type);
  assert.deepEqual(wrong, [], `these silently became something else: ${wrong.map(([t, g]) => `${t}->${g}`).join(', ')}`);
});

test('a clock is a clock, and it keeps its own configuration', () => {
  const tile = normalizeWorkspaceTile({ type: 'clock', config: { tz: 'Asia/Manila', hour12: false, seconds: true } });
  assert.equal(tile.type, 'clock');
  assert.deepEqual(tile.config, { tz: 'Asia/Manila', hour12: false, seconds: true });
  assert.ok(tile.id, 'and it gets an id');
});

test('a type nobody recognises still falls back rather than throwing', () => {
  // The fallback is right; being SILENT about a type the picker offers is what was wrong.
  assert.equal(normalizeWorkspaceTile({ type: 'nonsense', config: {} }).type, 'text');
  assert.equal(normalizeWorkspaceTile(null).type, 'text');
});

test('the clock tile can be drawn and configured once it exists', () => {
  // A type in the list that nothing renders would be a blank box, which is the same bug wearing
  // a different hat.
  assert.match(main, /case 'clock': return wbTileClock\(tile\);/);
  assert.match(main, /case 'clock': return \{ title: tile\.config\.title \|\| wbClockPlace\(tile\), icon: 'ti-clock', config: true \};/);
  assert.match(main, /else if \(tile\.type === 'clock'\) \{/, 'and its config panel saves');
});
