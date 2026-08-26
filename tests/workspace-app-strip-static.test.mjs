import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const shellStyles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const builderStyles = readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8');
const styles = (shellStyles + '\n' + builderStyles);
const drag = readFileSync(new URL('../src/workspace/topbar-drag.js', import.meta.url), 'utf8');
const header = source.match(/function wbWorkspaceHeader\([\s\S]*?\n\}/)[0];

// The strip used to be a pager: it sliced the app list and re-rendered, so reaching a
// later app meant clicking an arrow and there was nothing to swipe on a phone.
test('every app is rendered, not a page of them', () => {
  assert.match(header, /const appTabs = apps\.map\(/);
  assert.doesNotMatch(header, /perPage/, 'paging state must be gone');
  assert.doesNotMatch(header, /apps\.slice\(/, 'the strip must not slice the app list');
});

test('the track scrolls horizontally and can be swiped', () => {
  const rule = styles.match(/\.wb-topbar-apps \{[^}]*overflow-x: auto;[^}]*\}/)[0];
  // overflow-x: hidden would silently kill touch swiping.
  assert.match(rule, /overflow-x: auto;/);
  assert.doesNotMatch(rule, /overflow: hidden;/);
  assert.match(rule, /-webkit-overflow-scrolling: touch;/);
  assert.match(rule, /overscroll-behavior-x: contain;/);
});

test('the horizontal track leaves room for app labels before clipping the y axis', () => {
  // The app strip needs overflow-y clipped so horizontal scrolling does not grow a second
  // scrollport, but that clipping used to shave the labels off the Activity/app tiles.
  const rule = styles.match(/\.wb-topbar-apps \{[^}]*overflow-x: auto;[^}]*\}/)[0];
  assert.match(rule, /min-height:\s*64px;/);
  assert.match(rule, /overflow-y: hidden;/);
});

test('Activity has enough height from the shared shell CSS before builder CSS loads', () => {
  const sharedRule = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar-apps \{[^}]*\}/)?.[0] || '';
  assert.match(sharedRule, /min-height:\s*64px;/);
});

test('Activity app strip layout does not depend on the lazy builder stylesheet', () => {
  const strip = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar\s*\{[^}]*\}/)?.[0] || '';
  const track = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar-apps\s*\{[^}]*\}/)?.[0] || '';
  const tab = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar-tab\s*\{[^}]*\}/)?.[0] || '';
  const icon = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar-ic\s*\{[^}]*\}/)?.[0] || '';
  const label = shellStyles.match(/\.quest-app\[data-section="workspaces"\] \.wb-topbar-label\s*\{[^}]*\}/)?.[0] || '';

  assert.match(strip, /display:\s*flex;/);
  assert.match(track, /display:\s*flex;/);
  assert.match(track, /flex:\s*1 1 auto;/);
  assert.match(track, /overflow-x:\s*auto;/);
  assert.match(tab, /display:\s*flex;/);
  assert.match(tab, /flex-direction:\s*column;/);
  assert.match(icon, /display:\s*grid;/);
  assert.match(label, /-webkit-line-clamp:\s*2;/);
});

test('the shared shell is the single owner of app-strip styling', () => {
  // The lazy builder stylesheet used to arrive after first paint and overwrite the shared
  // strip with older sizes and a one-line label. That made the same navigation change shape
  // depending on which app a person had opened first.
  assert.doesNotMatch(builderStyles, /(^|\})\s*\.wb-topbar[^\{]*\{/m);
  assert.match(shellStyles, /\.wb-topbar-nav\s*\{/);
  assert.match(shellStyles, /\.wb-topbar-arrow\s*\{/);
  assert.match(shellStyles, /\.wb-topbar-tab\.active\s*\{/);
  assert.match(shellStyles, /\.wb-topbar-tab:focus-visible/);
});

test('the app strip is the only flexible region in the topbar', () => {
  assert.match(header, /<div class="wb-topbar-apps"/);
  assert.doesNotMatch(header, /wb-topbar-spacer/, 'a second flex child steals width from the app scroller');
});

test('the lazy builder stylesheet does not clip the topbar strip', () => {
  const builderCss = readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8');
  const rule = builderCss.match(/\.wb-topbar \{[^}]*\}/)?.[0] || '';
  assert.doesNotMatch(rule, /overflow:\s*hidden;/, 'builder.css loads late and must not clip the app strip');
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
  // The strip moves ITSELF. scrollIntoView reveals an element in every scrollable ancestor,
  // and the outermost one is the page — measured at 900px scrolled, it left the page at 0.
  assert.match(source, /if \(left < viewLeft\) track\.scrollLeft = Math\.max\(0, left - pad\);/);
  assert.match(source, /else if \(right > viewRight\) track\.scrollLeft = right - track\.clientWidth \+ pad;/);
  // Correcting a position that was already fine is what made the strip appear to jump on
  // every click, so the correction still only happens when the tab is out of view.
  assert.match(source, /const viewRight = viewLeft \+ track\.clientWidth;/);
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

test('the strip pans while the left button is held', () => {
  const fn = drag.slice(drag.indexOf('export function bindTopbarDrag('));
  const body = fn.slice(0, fn.indexOf("\n}\n"));
  assert.match(body, /if \(event\.button !== 0\) return;/);
  assert.match(body, /track\.scrollLeft = startScroll - dx;/);
  // Capture, or the drag dies the moment the pointer leaves the strip — which it will.
  assert.match(body, /setPointerCapture/);
  assert.match(body, /releasePointerCapture/);
});

test('a drag is told apart from a tab click by distance', () => {
  // The left button also opens apps. Without a threshold every drag would open whichever
  // tab it started on, and without swallowing the click, so would every successful drag.
  const fn = drag.slice(drag.indexOf('export function bindTopbarDrag('));
  const body = fn.slice(0, fn.indexOf("\n}\n"));
  assert.match(body, /const DRAG_SLOP = 5;/);
  assert.match(body, /if \(Math\.abs\(dx\) < DRAG_SLOP\) return;/);
  // Capture phase, so the tab's own handler never sees the click that ended a drag.
  assert.match(body, /addEventListener\('click',[\s\S]{0,220}stopPropagation\(\);[\s\S]{0,60}\}, true\)/);
});

test('releasing mid-movement glides to a stop', () => {
  const fn = drag.slice(drag.indexOf('export function bindTopbarDrag('));
  const body = fn.slice(0, fn.indexOf("\n}\n"));
  assert.match(body, /velocity \*= FRICTION;/);
  assert.match(body, /requestAnimationFrame\(glide\)/);
  // Stop at the ends rather than spinning against the edge.
  assert.match(body, /if \(track\.scrollLeft === before\) \{ stopMomentum\(\); return; \}/);
  // Parking the strip and then letting go should not fling it.
  assert.match(body, /const stale = event\.timeStamp - lastTime > 100;/);
});

test('momentum respects the motion preference', () => {
  // The stylesheet cannot switch off a scroll driven by requestAnimationFrame, so this is
  // the one piece of motion that has to ask in JavaScript.
  assert.match(drag, /function prefersReducedMotion\(\)/);
  assert.match(drag, /!prefersReducedMotion\(\) && Math\.abs\(velocity\) > MIN_VELOCITY/);
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

test('a plain vertical wheel scrolls the page, not the strip', () => {
  // The strip is a narrow band across the top of a long page. Converting every vertical
  // wheel to horizontal movement meant it swallowed the scroll everyone was actually doing,
  // and the page only moved once the strip had run out of travel.
  assert.match(source, /if \(!event\.shiftKey\) return;/);
});

test('horizontal intent still scrolls the strip', () => {
  // Shift+wheel is the long-standing convention for a horizontal region with a mouse; a
  // trackpad's sideways swipe arrives as deltaX and the browser handles it with no handler.
  assert.match(source, /if \(Math\.abs\(event\.deltaY\) <= Math\.abs\(event\.deltaX\)\) return;/);
  assert.match(source, /if \(track\.scrollLeft !== before\) event\.preventDefault\(\);/);
  // Nothing that could only be done by wheel is lost: the arrows and drag-to-pan remain.
  assert.match(source, /data-wb-topbar-scroll/);
});

test('reduced-motion users do not get smooth scrolling', () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{\s*\.wb-topbar-apps \{\s*scroll-behavior: auto;\s*\}/);
});

test('drag is fetched on demand, not carried by every page', () => {
  // The strip already scrolls by arrow, wheel and touch, so drag arriving a moment after
  // first paint is invisible — and keeping it out of the entry chunk is what paid for it.
  assert.match(source, /import\('\.\/workspace\/topbar-drag\.js'\)/);
  assert.ok(!/^import .*topbar-drag/m.test(source), 'a static import would defeat the split');
  // Bound once, inside the same guard as the other listeners.
  const mount = source.slice(source.indexOf('function wbMountTopbar('));
  const body = mount.slice(0, mount.indexOf('\n}\n'));
  assert.ok(
    body.indexOf("import('./workspace/topbar-drag.js')") > body.indexOf('track.dataset.wbScrollBound'),
    'the import must sit inside the bind-once guard, or every render adds another listener set',
  );
});

test('the drag module needs nothing from main.js', () => {
  // No context object means nothing to keep in step — the failure mode that shipped twice
  // in the extracted panels cannot happen here.
  assert.ok(!/\bctx\b/.test(drag), 'it should take no context');
  assert.match(drag, /export function bindTopbarDrag\(track\)/);
});

test('the field palette scrolls itself instead of setting the builder height', () => {
  // It lists every field type, which is taller than most screens. Left unbounded it made the
  // whole builder that tall and pushed everything below it off the page.
  const styles = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8'));
  const rule = styles.match(/\.wb-palette \{([\s\S]*?)\}/)?.[1] || '';
  assert.match(rule, /max-height: calc\(100vh - 140px - var\(--wb-tab-strip/);
  // Sticky, so the types stay reachable however far down the field list you are -- but below
  // the tab strip, which sticks above it. Pinned to the same spot they would overlap, and the
  // palette would sit under the tabs.
  assert.match(rule, /position: sticky; top: calc\(var\(--wb-tab-strip/);
  // The card is the frame and does not scroll: it is a flex column, so the header stays put
  // and only the list below it moves. Scrolling the card itself is what let field types ride
  // up into the gap above "Add a field".
  assert.match(rule, /overflow: hidden/);
  assert.match(rule, /flex-direction: column/);

  // Both halves of the tab row stick: the tabs and the Export / Import / Print / Add buttons
  // beside them are all things you reach for while reading a long list, and scrolling back to
  // the top of two hundred rows to reach them is what makes a list feel like a dead end.
  const tabs = styles.match(/\.wb-tabs-row \{([\s\S]*?)\}/)?.[1] || '';
  assert.match(tabs, /position: sticky/);
  assert.match(tabs, /top: 0/);
  // A transparent strip would let the rows scroll through it.
  assert.match(tabs, /background: var\(--surface-2\)/);
  // Above ordinary content, below the suggestion menus that must open over it.
  const layer = Number(tabs.match(/z-index: (\d+)/)?.[1]);
  assert.ok(layer > 3 && layer < 90, `expected a layer between content and menus, got ${layer}`);
  // The height it covers is named once, so the two sticky things inside the work surface
  // cannot drift apart and pin on top of each other.
  assert.match(styles, /--wb-tab-strip: \d+px;/);

  const list = styles.match(/\.wb-palette-list \{([\s\S]*?)\}/)?.[1] || '';
  assert.match(list, /overflow-y: auto/);
  // A list that can shrink below its content is the whole reason the header keeps its height.
  assert.match(list, /min-height: 0/);
  // And a scroll that reaches its end must not carry on into the page behind it.
  assert.match(list, /overscroll-behavior: contain/);
});

test('a category or status field can be shown as choice chips, and chips can mint a new option', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const fieldUi = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');
  // The config panel offers the choice to a category and a status alike. Tags are excluded:
  // they hold several values at once, so one-at-a-time chips would be the wrong control.
  assert.match(fieldUi, /id="wbCatDisplay"/);
  assert.match(fieldUi, /const chips = t !== 'tags' && fd\.config\.display === 'chips'/);
  assert.match(fieldUi, /const displayRow = t !== 'tags' \?/);
  // Chips write the option ID into the same hidden [data-f] input the dropdown uses, so every
  // reader downstream is unchanged.
  assert.match(fieldUi, /data-wb-chip-pick[\s\S]*?input type="hidden" data-f=/);
  // "+ Other" is the chips' answer to typing an unknown value into the dropdown.
  assert.match(fieldUi, /data-wb-chip-other/);
  assert.match(fieldUi, /data-wb-chip-new-input/);

  // Every route to a brand-new option goes through one minting function -- the dropdown, the
  // chips' "+ Other", and a copy carrying a value this app has no option for -- so they cannot
  // drift apart on casing, colour, or who is allowed to add one.
  const mint = readFileSync(new URL('../src/workspace/option-mint.js', import.meta.url), 'utf8');
  assert.match(mint, /export function createOptionMint/);
  assert.match(mint, /function wbMintOption\(fieldId, rawLabel\)/);
  assert.match(mint, /if \(!can\('workspaces\.manage', companyId\)\) return \{ option: null/);
  const combo = readFileSync(new URL('../src/ui/combobox-menu.js', import.meta.url), 'utf8');
  assert.ok(!/function wbMintOption/.test(combo), 'the combobox uses the shared one, it does not keep a copy');

  // The behaviour rides in the chunk that draws the chips, not the entry bundle: main.js
  // renders nothing at all until field-config-ui has arrived, so a chip on screen is proof
  // the runtime is loaded, and main.js keeps only the event routing.
  const chip = readFileSync(new URL('../src/workspace/chip-field.js', import.meta.url), 'utf8');
  assert.ok(!/import .*chip-field/.test(main), 'not pulled into the entry bundle');
  assert.match(fieldUi, /export \{ createChipRuntime \} from '\.\/chip-field\.js'/);
  // The picked chip has to fire input/change, or the record saves as if nothing was touched.
  const select = chip.match(/function wbChipSelect\(zone, optionId\) \{([\s\S]*?)\n {2}\}/)?.[1] || '';
  assert.match(select, /new Event\('input', \{ bubbles: true \}\)/);
  assert.match(select, /new Event\('change', \{ bubbles: true \}\)/);
  // A copy carrying a label this app has no option for mints it rather than dropping it.
  assert.match(chip, /function wbResolveChipOption\(fieldId, label, zone\)/);

  // Saving the dialog has to record the choice, read back by the panel that drew the control,
  // and defaulting to the dropdown so fields built before this existed keep what they had.
  assert.match(fieldUi, /if \(type === 'category' \|\| type === 'status'\) config\.display = document\.getElementById\('wbCatDisplay'\)\?\.value === 'chips' \? 'chips' : 'dropdown'/);
});
