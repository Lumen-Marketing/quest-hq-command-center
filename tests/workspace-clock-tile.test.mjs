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
  const bind = slice('wbBindClocks');
  assert.match(bind, /clearInterval\(wbClockTimer\);/);
  assert.match(bind, /if \(!document\.querySelector\('\[data-wb-clock\]'\)\) return;/);
  // And it stops itself if the tile goes away between ticks.
  assert.match(bind, /if \(!clocks\.length\) \{ clearInterval\(wbClockTimer\); wbClockTimer = null; return; \}/);
  assert.match(main, /wbBindClocks\(\);/);
});

test('a tick writes only what changed', () => {
  // The whole tile is not redrawn every second: a dashboard that rebuilds itself once a second
  // is one that fights anybody trying to use it.
  const bind = slice('wbBindClocks');
  assert.match(bind, /if \(time && time\.textContent !== next\) time\.textContent = next;/);
  assert.match(bind, /if \(date && date\.textContent !== day\) date\.textContent = day;/);
});

test('every class the tile uses is styled', () => {
  ['wb-clock', 'wb-clock-time', 'wb-clock-date', 'wb-clock-zone'].forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  });
});
