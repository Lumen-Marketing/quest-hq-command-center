import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const header = source.match(/function wbWorkspaceHeader\([\s\S]*?\n\}/)[0];

// The strip used to be a pager: it sliced the app list and re-rendered, so reaching a
// later app meant clicking an arrow and there was nothing to swipe on a phone.
test('every app is rendered, not a page of them', () => {
  assert.match(header, /const appTabs = apps\.map\(/);
  assert.doesNotMatch(header, /perPage/, 'paging state must be gone');
  assert.doesNotMatch(header, /apps\.slice\(/, 'the strip must not slice the app list');
});

test('the track scrolls horizontally and can be swiped', () => {
  const rule = styles.match(/\.wb-topbar-apps \{[^}]*\}/)[0];
  // overflow-x: hidden would silently kill touch swiping.
  assert.match(rule, /overflow-x: auto;/);
  assert.doesNotMatch(rule, /overflow: hidden;/);
  assert.match(rule, /-webkit-overflow-scrolling: touch;/);
  assert.match(rule, /overscroll-behavior-x: contain;/);
});

test('the arrows stay, but now scroll the same track', () => {
  assert.match(header, /data-wb-topbar-scroll="-1"/);
  assert.match(header, /data-wb-topbar-scroll="1"/);
  assert.match(source, /function wbScrollTopbar\(direction\)/);
  assert.match(source, /bind\('\[data-wb-topbar-scroll\]'/);
  assert.doesNotMatch(source, /data-wb-topbar-page/, 'the old pager binding must be gone');
});

test('arrows are hidden unless the strip actually overflows', () => {
  // Overflow depends on measured width, so the markup ships hidden and JS reveals it.
  assert.match(header, /data-wb-topbar-nav hidden/);
  assert.match(source, /const overflowing = track\.scrollWidth - track\.clientWidth > 1;/);
  assert.match(source, /nav\.hidden = !overflowing;/);
});

test('the open app is scrolled into view, but only when it is not already', () => {
  assert.match(header, /data-wb-topbar-active/);
  assert.match(source, /scrollIntoView\(\{ block: 'nearest', inline: 'nearest', behavior: 'smooth' \}\)/);
  // Correcting a position that was already fine is what made the strip appear to jump on
  // every click, so the correction is now conditional on the tab being out of view.
  assert.match(source, /if \(left < viewLeft \|\| right > viewRight\)/);
});

test('the strip holds its place when opening an app re-renders it', () => {
  // render() replaces the strip's markup, so a position stored on the element is lost
  // with it — which is why clicking an app used to send the strip back to the start.
  assert.match(source, /let wbTopbarScrollLeft = 0;/);
  assert.match(source, /wbTopbarScrollLeft = track\.scrollLeft;/);
  // Restored BEFORE the into-view check, or that check reads a position of zero and
  // scrolls when it should not.
  const mount = source.slice(source.indexOf('function wbMountTopbar('));
  const body = mount.slice(0, mount.indexOf('\n}\n'));
  assert.ok(
    body.indexOf('track.scrollLeft = wbTopbarScrollLeft') < body.indexOf('const active ='),
    'the remembered position must be restored before the active tab is measured',
  );
});

test('the strip pans with the right mouse button held down', () => {
  // The right button on purpose: the left one belongs to the tabs, and a left-drag would
  // either swallow clicks or fire them by accident.
  const fn = source.slice(source.indexOf('function wbBindTopbarDrag('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(event\.button !== 2\) return;/);
  assert.match(body, /track\.scrollLeft = startScroll - dx;/);
  // Capture, or the drag dies the moment the pointer leaves the strip — which it will.
  assert.match(body, /setPointerCapture/);
  assert.match(body, /releasePointerCapture/);
});

test('a plain right-click still opens the context menu', () => {
  // Suppressing it unconditionally would make the menu unreachable on the strip.
  const fn = source.slice(source.indexOf('function wbBindTopbarDrag('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(!moved\) return;\s*\n\s*\/\/[^\n]*\n\s*event\.preventDefault\(\);/);
  assert.match(body, /if \(Math\.abs\(dx\) > 3\) moved = true;/, 'a shaky hand is still a click');
});

test('smooth scrolling is disabled while dragging', () => {
  // Otherwise the strip eases toward each position instead of tracking the pointer.
  assert.match(styles, /\.wb-topbar-apps \{[^}]*scroll-behavior: smooth;/s);
  assert.match(styles, /\.wb-topbar-apps\.wb-topbar-dragging \{[^}]*scroll-behavior: auto;/s);
});

test('listeners are attached once, not on every render', () => {
  // wbMountTopbar runs after each render; rebinding each time would stack listeners.
  assert.match(source, /if \(!track\.dataset\.wbScrollBound\)/);
  assert.match(source, /track\.dataset\.wbScrollBound = '1';/);
});

test('a vertical wheel scrolls the strip sideways without hijacking the page', () => {
  // Only when the gesture is mostly vertical AND the strip actually moved.
  assert.match(source, /if \(Math\.abs\(event\.deltaY\) <= Math\.abs\(event\.deltaX\)\) return;/);
  assert.match(source, /if \(track\.scrollLeft !== before\) event\.preventDefault\(\);/);
});

test('reduced-motion users do not get smooth scrolling', () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{\s*\.wb-topbar-apps \{ scroll-behavior: auto; \}/);
});
