import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');

const fn = (name) => {
  const start = main.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  return main.slice(start, main.indexOf('\n}\n', start) + 2);
};

test('scroll is captured before the render and restored after it', () => {
  // Capturing must read the OLD DOM, so it happens at the top of render, before
  // innerHTML is replaced.
  assert.match(main, /function render\(\) \{\n  const keptScroll = captureScrollForRender\(\);/);
  assert.match(main, /queueMicrotask\(\(\) => restoreScrollAfterRender\(keptScroll\)\);/);
});

// A hard-coded selector fixes one page and leaves every other one jumping — this
// stylesheet has more than 40 scrolling containers, and which one matters depends
// entirely on where the user is.
test('the container to restore is discovered, not hard-coded', () => {
  const scrollers = new Set();
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/overflow(-y)?\s*:\s*(auto|scroll)/.test(m[2])) continue;
    for (const sel of m[1].split(',').map((x) => x.trim())) {
      if (/^\.[a-z-]+$/.test(sel)) scrollers.add(sel);
    }
  }
  assert.ok(scrollers.size > 20, `expected many scrolling containers, found ${scrollers.size}`);
  // A passive capture-phase listener records whichever one the user actually moved.
  const track = fn('trackScrollTargets');
  assert.match(track, /addEventListener\('scroll'/);
  assert.match(track, /capture: true, passive: true/, 'must never delay a scroll');
});

test('an ambiguous selector is never guessed at', () => {
  // Restoring the wrong panel is more disorienting than not restoring at all. Ambiguity
  // is now qualified rather than abandoned, but every candidate still has to resolve to
  // exactly one element before it is used.
  const sel = fn('scrollTargetSelector');
  assert.match(sel, /if \(document\.querySelectorAll\(classes\)\.length === 1\) return classes;/);
  assert.match(sel, /CSS\.escape/);
  const qualified = fn('qualifiedScrollSelector');
  const checks = qualified.match(/querySelectorAll\(candidate\)\.length === 1/g) || [];
  assert.ok(checks.length >= 2, 'each candidate must prove it is unique');
  assert.match(qualified, /return '';/, 'and giving up is still the fallback');
});

test('the recorded position is re-read rather than trusted', () => {
  // Something else may have scrolled the container since the last scroll event.
  const target = fn('lastScrolledTarget');
  assert.match(target, /top: el\.scrollTop/);
  // And there is a sensible answer before any scroll has happened.
  assert.match(target, /document\.querySelector\('\.work-surface'\)/);
});

test('the page scroller is handled as well as inner containers', () => {
  // Both axes. A records table scrolled sideways to reach a Yes/No column snapped back to the
  // first field the moment the toggle re-rendered it, because only scrollTop was remembered.
  assert.ok(fn('lastScrolledTarget').includes("if (window.scrollY || window.scrollX) kept.push({ selector: 'window', top: window.scrollY, left: window.scrollX })"));
  assert.ok(fn('applyKeptScroll').includes('window.scrollTo(x, top)'));
});

test('every scrolled region is restored, not only the most recent one', () => {
  // Remembering one had a reproducible failure: scroll the sidebar nav, scroll it back to
  // the top, scroll the page, press a button. The recorded element was the sidebar with a
  // scrollTop of 0, the restore skips a zero, and the page jumped to the top. Two scrolling
  // regions are on screen at once, so tracking one of them was never going to hold.
  assert.match(main, /const scrolledTargets = new Map\(\);/);
  assert.match(fn('trackScrollTargets'), /scrolledTargets\.set\(selector, true\)/);
  assert.match(fn('lastScrolledTarget'), /for \(const selector of scrolledTargets\.keys\(\)\)/);
  assert.ok(fn('applyKeptScroll').includes('for (const { selector, top, left } of kept.scrolled || [])'));
});

test('a zero scroll position is skipped rather than recorded as a target', () => {
  // Restoring a zero is a no-op, but keeping it in the list was what let one container at
  // the top hide another that was not.
  // Either axis counts now: a table scrolled right sits at scrollTop 0, and testing only the
  // top dropped it from the list as though it had never moved. A container at zero on BOTH is
  // still skipped, which is what this test was always about.
  assert.ok(fn('lastScrolledTarget').includes('if (el && (el.scrollTop || el.scrollLeft)) kept.push'));
});

test('the tracked set is bounded', () => {
  // A long session touching many panels should not grow it without limit.
  assert.match(fn('trackScrollTargets'), /if \(scrolledTargets\.size > 24\) scrolledTargets\.delete/);
});

test('the partial workspace re-render restores its own scroll', () => {
  // Assigning innerHTML empties the element first, so the browser clamps scrollTop to zero
  // before the new content arrives. That path skips the full render's restore entirely.
  const body = fn('updateWorkspaceOnly');
  assert.match(body, /const top = workspace\.scrollTop;/);
  assert.match(body, /if \(top\) workspace\.scrollTop = top;/);
});

test('navigating still starts at the top, with nothing focused', () => {
  // Preserving either on a genuine page change would land you halfway down a page you
  // have never seen. The URL is the discriminator: a checkbox does not change it.
  const capture = fn('captureScrollForRender');
  assert.match(capture, /const samePage = key === lastScrollKey;/);
  assert.match(capture, /if \(!samePage\) return null;/);
  assert.match(fn('currentScrollKey'), /window\.location\.pathname/);
});

// Rendering destroys the node being interacted with. Without this, ticking a checkbox
// drops focus to the body: the next Tab starts from the top of the page, so a keyboard
// user cannot work down a list of them at all.
test('focus survives the render, keyed on what identifies the control', () => {
  const sel = fn('focusSelector');
  assert.match(sel, /attr\.name\.startsWith\('data-'\)/, 'data attributes identify controls here');
  assert.match(sel, /CSS\.escape/);
  const restore = fn('applyKeptScroll');
  assert.match(restore, /next\.focus\(\{ preventScroll: true \}\)/, 'refocusing must not fight the scroll restore');
});

test('a caret position is restored too, so typing continues where it left off', () => {
  assert.match(fn('captureScrollForRender'), /typeof active\.selectionStart === 'number'/);
  assert.match(fn('applyKeptScroll'), /setSelectionRange\(kept\.caret\.start, kept\.caret\.end\)/);
});

test('the other two scroll regions keep their own handling', () => {
  assert.match(main, /function wbKeepModalScroll\(\)/);
  assert.match(main, /SIDEBAR_SCROLL_KEY/);
});

// A kanban board has one scrolling list PER COLUMN, all sharing a class. The unique-
// selector rule discarded every one of them, so moving a card scrolled the column back
// to the top — which is what the rule was supposed to prevent, not cause.
test('a repeated container is qualified rather than given up on', () => {
  const body = fn('scrollTargetSelector');
  assert.match(body, /if \(document\.querySelectorAll\(classes\)\.length === 1\) return classes;/);
  assert.match(body, /return qualifiedScrollSelector\(el, classes\);/);
});

test('the qualifier keys on identity, never on position', () => {
  // nth-child would point at a different column the moment one is added, removed or
  // reordered — and reordering columns is exactly what the stage manager does.
  const body = fn('qualifiedScrollSelector');
  assert.ok(!/nth-child|nth-of-type/.test(body), 'positional selectors do not survive a re-render');
  assert.match(body, /attr\.name\.startsWith\('data-'\)/);
  assert.match(body, /node\.id/);
  assert.match(body, /CSS\.escape/);
});

test('it tries the element itself before walking up', () => {
  // The board labels each column list with its stage key, so no ancestor walk is needed.
  const body = fn('qualifiedScrollSelector');
  const own = body.indexOf('for (const attr of el.attributes)');
  const up = body.indexOf('let node = el.parentElement;');
  assert.ok(own !== -1 && up !== -1 && own < up, 'own attributes should be tried first');
});

test('every data attribute is tried, not just the first', () => {
  // Board columns all carry the same data-drag-kind; the distinguishing attribute is
  // further along the list, so stopping at the first one finds nothing unique.
  const body = fn('qualifiedScrollSelector');
  assert.ok(!/\.find\(\(a\) => a\.name\.startsWith\('data-'\)/.test(body), 'must not stop at the first attribute');
  assert.match(body, /for \(const attr of node\.attributes\)/);
});

test('the board column carries a stable key for it to use', () => {
  const board = readFileSync(new URL('../src/workspace/board-view.js', import.meta.url), 'utf8');
  assert.match(board, /class="wb-board-cards" data-stage-key="\$\{h\(col\.id \?\? '__none'\)\}"/);
});

test('the restore is re-applied after layout, not only before it', () => {
  // A microtask runs before the browser has measured the new DOM. While it is still the size
  // of whatever came before, a scrollTop past the old maximum is CLAMPED, and the clamped
  // value survives once the real content arrives. Any render that briefly shortens the page —
  // a panel that paints on a second pass once its module loads — therefore lands you back at
  // the top, which is exactly what "it goes to top on every click" looks like.
  const restore = main.match(/function restoreScrollAfterRender\(kept\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(restore, /applyKeptScroll\(kept, true\);/);
  assert.match(restore, /requestAnimationFrame\(\(\) => applyKeptScroll\(kept, false\)\);/);
});

test('the second pass does not fight a user who moved focus in between', () => {
  // A frame is long enough for a keystroke. Only the first pass restores focus.
  const apply = main.match(/function applyKeptScroll\(kept, restoreFocus\) \{[\s\S]*?\n\}/)?.[0] || '';
  // …and never into a control that now sits behind an open modal: that breaks the dialog's
  // focus trap and scrolls the page under it.
  assert.match(apply, /if \(!restoreFocus \|\| !kept\.selector \|\| activeModalOverlay\(\)\) return;/);
});

test('the restore writes only when the value actually differs', () => {
  // Assigning an unchanged scrollTop is not free — it can cancel a smooth scroll in progress
  // — and the second pass is a no-op in the common case where the first one worked.
  const apply = main.match(/function applyKeptScroll\(kept, restoreFocus\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(apply.includes('if (window.scrollY !== top || window.scrollX !== x) window.scrollTo(x, top);'));
  assert.ok(apply.includes('if (target.scrollTop !== top) target.scrollTop = top;'));
  assert.ok(apply.includes('if (target.scrollLeft !== x) target.scrollLeft = x;'));
});

test('the app strip scrolls itself, never via scrollIntoView', () => {
  // scrollIntoView asks the browser to reveal an element in EVERY scrollable ancestor, and
  // the outermost one is the page. The app strip sits at the top, so revealing it dragged a
  // scrolled-down page back to the top — on every render of the workspaces section, which
  // is every save: adding a sub-item list, adding a field, opening a dialog.
  //
  // Measured in a browser on the same markup: with the page at 900px, scrollIntoView left it
  // at 0 while assigning scrollLeft left it at 900. Both moved the strip.
  const mount = main.match(/function wbMountTopbar\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(!/\.scrollIntoView\(/.test(mount), 'the strip must move itself');
  assert.match(mount, /if \(left < viewLeft\) track\.scrollLeft = Math\.max\(0, left - pad\);/);
  assert.match(mount, /else if \(right > viewRight\) track\.scrollLeft = right - track\.clientWidth \+ pad;/);
});
