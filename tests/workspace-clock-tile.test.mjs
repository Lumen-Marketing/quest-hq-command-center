import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "Can you add a Time and Date here, where the time and date can also be customised to change
// its time zone."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const modal = readFileSync(join(root, 'src', 'workspace', 'builder-modal.js'), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

// Includes the closing brace, which matters here: two of these are handed to Function() and
// run, and a function body missing its last character is a syntax error rather than a failure.
const slice = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const close = /\n\s{0,2}\}\n/.exec(main.slice(at));
  assert.ok(close, `${name} never closes`);
  return main.slice(at, at + close.index + close[0].length - 1);
};

// The real zone guard, run rather than read.
const wbClockZone = Function(`${slice('wbClockZone')}\nreturn wbClockZone;`)();
const wbClockPlace = Function(`${slice('wbClockPlace')}\nreturn wbClockPlace;`)();

test('the tile is offered alongside the others', () => {
  assert.match(modal, /\['clock', 'ti-clock', 'Time & date',/);
  assert.match(main, /case 'clock': return \{ title: tile\.config\.title \|\| wbClockPlace\(tile\), icon: 'ti-clock', config: true \};/);
  assert.match(main, /case 'clock': return wbTileClock\(tile\);/);
});

test('a zone is only used when this browser really knows it', () => {
  // An unknown zone throws on every tick, and a clock that ticks takes the dashboard with it.
  assert.equal(wbClockZone({ config: { tz: 'Asia/Manila' } }), 'Asia/Manila');
  assert.equal(wbClockZone({ config: { tz: 'Europe/London' } }), 'Europe/London');
  assert.equal(wbClockZone({ config: { tz: 'Mars/Olympus' } }), undefined, 'falls back to the device');
  assert.equal(wbClockZone({ config: { tz: '  ' } }), undefined);
  assert.equal(wbClockZone({ config: {} }), undefined);
});

test('the tile is named for the place, not the database key', () => {
  assert.equal(wbClockPlace({ config: { tz: 'Asia/Manila' } }), 'Manila');
  assert.equal(wbClockPlace({ config: { tz: 'America/New_York' } }), 'New York');
  assert.equal(wbClockPlace({ config: {} }), 'Time & date');
});

test('the zone list comes from the browser, not from a list that goes stale', () => {
  assert.match(modal, /Intl\.supportedValuesOf\('timeZone'\)/);
  assert.match(modal, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  // Leaving it unset follows whoever is looking, which is the sensible default.
  assert.match(modal, /<option value="" \$\{chosen \? '' : 'selected'\}>This device/);
});

test('12-hour, seconds and a title are all settable and all saved', () => {
  assert.match(modal, /data-wb-tilecfg-hour12/);
  assert.match(modal, /data-wb-tilecfg-seconds/);
  // Against the file rather than a slice of the save function: it is a long chain of nested
  // else-ifs, and any slicer that stops at the first closing brace stops inside the first one.
  assert.match(main, /else if \(tile\.type === 'clock'\) \{/);
  assert.match(main, /tile\.config\.tz = val\('\[data-wb-tilecfg-tz\]'\);/);
  assert.match(main, /tile\.config\.hour12 = !!document\.querySelector\('\[data-wb-tilecfg-hour12\]'\)\?\.checked;/);
  assert.match(main, /tile\.config\.seconds = !!document\.querySelector\('\[data-wb-tilecfg-seconds\]'\)\?\.checked;/);
});

test('one timer for the page, cleared before the next paint starts another', () => {
  // A timer per tile, or one that outlives the tile it drew, is how a dashboard ends up
  // ticking in the background of a page nobody is looking at.
  const tick = readFileSync(join(root, 'src', 'workspace', 'clock-tick.js'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(tick, /export function stopClocks\(\) \{\s*\n\s*clearInterval\(timer\);\s*\n\s*timer = null;/);
  assert.match(tick, /startClocks\(\) \{\s*\n\s*stopClocks\(\);/, 'a new run always clears the old one');
  assert.match(tick, /if \(!document\.querySelector\('\[data-wb-tile-clock\]'\)\) return;/);
  // And it stops itself if the tile goes away between ticks.
  assert.match(tick, /if \(!clocks\.length\) \{ stopClocks\(\); return; \}/);
  assert.match(main, /wbBindClocks\(\);/);
});

test('the ticking runtime is fetched only once a clock is on screen', () => {
  // A dashboard with no clock should not carry the ticker. The tile renders its own time
  // server-side, so nothing is missing in the moment before the module arrives.
  const bind = slice('wbBindClocks');
  assert.match(bind, /wbClockTicker\?\.stopClocks\(\);/);
  assert.match(bind, /if \(!document\.querySelector\('\[data-wb-tile-clock\]'\)\) return;/);
  assert.match(bind, /import\('\.\/workspace\/clock-tick\.js'\)/);
  // A paint can remove the clock while the fetch is in flight.
  assert.match(bind, /if \(document\.querySelector\('\[data-wb-tile-clock\]'\)\) mod\.startClocks\(\);/);
});

test('a tick writes only what changed', () => {
  // The whole tile is not redrawn every second: a dashboard that rebuilds itself once a second
  // is one that fights anybody trying to use it.
  const tick = readFileSync(join(root, 'src', 'workspace', 'clock-tick.js'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(tick, /if \(time && time\.textContent !== next\) time\.textContent = next;/);
  assert.match(tick, /if \(date && date\.textContent !== day\) date\.textContent = day;/);
  // The date is written on every tick, so a clock whose tile has just been repainted still
  // carries one -- which is the half of the tile the ticker is easiest to forget.
  assert.match(tick, /weekday: 'long', day: 'numeric', month: 'short'/);
  // And in the SAME format the tile was rendered with, or the date visibly changes on the
  // first tick.
  assert.match(main, /weekday: 'long', day: 'numeric', month: 'short'/);
});

test('the tile and the dashboard clock widget do not share a hook', () => {
  // They did, and it was destructive rather than merely untidy. The app-dashboard clock widget
  // paints with `node.textContent = now` over every `[data-wb-clock]`, and the tile's CONTAINER
  // carried that attribute -- so a second after the tile rendered correctly, its time, date and
  // zone elements were replaced by one bare text node. That is why the tile showed a small
  // unstyled "8:12 PM" with no date, and why the hour was 1-digit: the widget formats with
  // `hour: 'numeric'` where the tile uses '2-digit'.
  const views = readFileSync(join(root, 'src', 'workspace', 'app-views.js'), 'utf8');
  const tick = readFileSync(join(root, 'src', 'workspace', 'clock-tick.js'), 'utf8');

  // The widget keeps the name it has always had.
  assert.match(views, /<strong data-wb-clock>/);
  // The tile has its own, and an attribute selector matches an exact name -- so
  // `[data-wb-clock]` cannot reach `data-wb-tile-clock`.
  assert.match(main, /<div class="wb-clock" data-wb-tile-clock=/);
  assert.ok(!/<div class="wb-clock" data-wb-clock=/.test(main), 'the tile must not carry the widget hook');

  // The widget's painter is the destructive one; it must only ever find its own element.
  const painter = main.slice(main.indexOf('const nodes = document.querySelectorAll(\'[data-wb-clock]\')'));
  assert.match(painter.slice(0, 400), /node\.textContent = now;/, 'it replaces the whole element');

  // And the tile's ticker only ever finds tiles.
  assert.ok(!/\[data-wb-clock\]/.test(tick), 'the tile ticker must not reach the widget');
  assert.match(tick, /\[data-wb-tile-clock\]/);
  assert.match(tick, /node\.dataset\.wbTileClock/);
});

test('every class the tile uses is styled', () => {
  ['wb-clock', 'wb-clock-time', 'wb-clock-date', 'wb-clock-zone'].forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  });
});
