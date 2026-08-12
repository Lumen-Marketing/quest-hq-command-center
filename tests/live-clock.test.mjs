import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "Add a running clock on the bottom left so I can see my time, also make the clock dashboard
// realtime." Both numbers were computed once at render and then sat still -- a clock you just
// started read "0m" and stayed there, because formatDuration stops at minutes.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The clock dashboard is a fetched module now; same surface, read as one.
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8')
  + readFileSync(join(root, 'src', 'ops', 'clock-dashboard-page.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

function fn(name) {
  // LAST occurrence: main.js keeps a loader shim of the same name for anything extracted,
  // and the real body is in the fetched module appended after it. indexOf finds the shim,
  // whose body fetches rather than renders.
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}', at) + 2);
}

test('a running clock is shown to the second', () => {
  // formatDuration is right for a timesheet and useless for a timer.
  const body = fn('formatClock');
  assert.match(body, /const seconds = totalSeconds % 60;/);
  assert.match(body, /return hours \? `\$\{hours\}:\$\{mm\}:\$\{ss\}` : `\$\{mm\}:\$\{ss\}`;/);
});

test('one interval drives every live element, and stops when there are none', () => {
  const body = fn('tickLiveClocks');
  assert.match(body, /document\.querySelectorAll\('\[data-live-clock\]'\)/);
  assert.match(body, /if \(!nodes\.length\) \{[\s\S]{0,140}?liveClockTimer = null;/, 'an empty page must not keep ticking');
  // textContent only: re-rendering every second would discard scroll and keyboard focus.
  assert.match(body, /node\.textContent =/);
  assert.ok(!/innerHTML|render\(\)/.test(body), 'the ticker must not re-render');

  const ensure = fn('ensureLiveClocks');
  assert.match(ensure, /if \(typeof document === 'undefined' \|\| liveClockTimer\) return;/);
  assert.match(ensure, /liveClockTimer = setInterval\(tickLiveClocks, 1000\);/);
  // innerHTML replaces the nodes, so the interval has to be re-armed after every paint.
  assert.match(main, /queueMicrotask\(ensureLiveClocks\);/);
});

test('a total that already banks closed entries does not count the running clock twice', () => {
  const body = fn('renderClockDashboardPage');
  assert.match(body, /const todayBanked = totalTimeForCompany\(companyId, todayStart\);/);
  assert.match(body, /data-live-base="\$\{h\(String\(banked\)\)\}"/);
  // The banked totals must NOT already include the running time -- the element adds it.
  assert.ok(
    !/totalTimeForCompany\(companyId, todayStart\) \+ \(active/.test(body),
    'the running clock is added by the ticker, not baked into the total',
  );
  assert.match(body, /data-live-format="duration"/, 'a day total reads in hours and minutes');
});

test('Elapsed ticks in seconds', () => {
  const body = fn('renderClockDashboardPage');
  assert.match(body, /\['Elapsed', markup\(`<span class="clock-elapsed" data-live-clock="\$\{h\(active\.started_at\)\}">/);
});

test('the rail clock appears only while a clock is running', () => {
  const body = fn('renderRailClock');
  assert.match(body, /const timer = activeTimerForCompany\(companyId\);/);
  assert.match(body, /if \(!timer\) return '';/, 'an idle rail must not carry a permanent 00:00');
  assert.match(body, /data-live-clock="\$\{h\(started\)\}"/);
  assert.match(body, /href="\$\{appHref\(companyPath\('clock', \{\}, companyId\)\)\}"/, 'it should lead to the dashboard');
  assert.match(main, /\$\{renderRailClock\(companyId\)\}/, 'and be rendered into the rail');
});

test('the clock digits do not jitter as they change', () => {
  assert.match(styles, /\.rail-clock-body b \{[\s\S]*?font-variant-numeric: tabular-nums;/);
  assert.match(styles, /\.clock-elapsed \{ font-variant-numeric: tabular-nums; \}/);
  // A pulsing dot is decoration; it respects the reduced-motion preference.
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.rail-clock-dot \{ animation:/);
});

test('markup() is the only way past the escaping, and stays opt-in', () => {
  // metricCard and contractRows escape their values. The clock needs a span, so the bypass is
  // explicit and greppable rather than the helpers becoming unsafe by default.
  const cell = fn('cellValue');
  assert.match(cell, /typeof value\.__markup === 'string' \? value\.__markup : h\(value\)/);
  assert.match(main, /function markup\(html\) \{/);
  assert.match(main, /<strong>\$\{cellValue\(value\)\}<\/strong>/);
});

// The clock shipped with `color: inherit`, so on a themed rail the digits came out near-black
// on navy. The stylesheet already records this exact failure happening once before, to the
// product name -- an element that carries its own colour has to be listed in the
// [data-sidebar-theme] rules or it keeps the base one while everything around it themes.

test('the rail clock takes its colour from the rail, never from inherit', () => {
  // Anchored to the start of a line: `[data-sidebar-theme] .rail-clock {` also ends in
  // ".rail-clock {" and sits earlier in the file, so a bare indexOf sliced from there to the
  // hover rule and swept in thousands of lines of unrelated CSS.
  const start = styles.search(/^\.rail-clock \{/m);
  assert.notEqual(start, -1, 'base .rail-clock rule not found');
  const rule = styles.slice(start, styles.indexOf('.rail-clock:hover', start));
  // The DECLARATION, not the word: the comment above the rule explains why inherit was wrong,
  // and a bare substring search matches that explanation instead of the code.
  assert.ok(!/^\s*color:\s*inherit\s*;/m.test(rule), 'inherit is what made it unreadable');
  assert.match(rule, /color: var\(--deck-text, var\(--ink-2\)\)/);
  // The divider and hover follow the rail's surface too, not a hard-coded white wash.
  assert.match(rule, /border-top: 1px solid var\(--deck-hairline/);
  assert.match(styles, /\.rail-clock:hover \{ background: var\(--deck-hover/);
});

test('a custom sidebar theme reaches every part of the clock', () => {
  // Body, headline and secondary line each have their own list in the theme block.
  const themed = styles.slice(styles.indexOf('[data-sidebar-theme] .side-item,'));
  for (const [selector, token] of [
    ['[data-sidebar-theme] .rail-clock', '--deck-text'],
    ['[data-sidebar-theme] .rail-clock-body b', '--deck-strong'],
    ['[data-sidebar-theme] .rail-clock-body small', '--deck-label'],
  ]) {
    const at = themed.indexOf(selector);
    assert.notEqual(at, -1, `${selector} is not themed`);
    const block = themed.slice(at, themed.indexOf('}', at));
    assert.ok(block.includes(token), `${selector} should resolve through ${token}`);
  }
});
