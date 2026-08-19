import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "Make the buttons working."
//
// The tiles and their dialogs are covered by quick-create-tiles.test.mjs, which calls press() and
// saveQuick() directly. What that cannot see is the wiring: the record page binds ONE delegated
// listener for the module's life and reads which record it is on out of the DOM at press time, so
// a button can be drawn correctly, a handler can be written correctly, and nothing happens
// because the two were never connected.
//
// So this fires real events at the real listeners.

/** The smallest DOM the record page's listeners actually touch. */
function fakeDom() {
  const listeners = {};
  globalThis.document = {
    addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const fire = (type, event) => (listeners[type] || []).forEach((fn) => fn(event));
  return { listeners, fire };
}

/** A node whose closest() answers for the selectors these handlers ask about. */
function node(matches, extra = {}) {
  const self = {
    dataset: {}, disabled: false, preventDefault() {}, ...extra,
    closest: (sel) => (matches[sel] === undefined ? null : matches[sel]),
  };
  return self;
}

async function mount({ press = async () => 'ok', saveQuick = () => {}, closeQuick = () => {} } = {}) {
  const dom = fakeDom();
  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const calls = { press: [], save: [], close: 0, toasts: [] };
  // The module the listener fetches. Stubbed by intercepting the import through a ctx the page
  // does not have -- so instead the real import runs and we assert on what it is HANDED.
  const ctx = {
    h: (v) => String(v ?? ''),
    state: {},
    showToast: (m) => calls.toasts.push(m),
    render: () => {},
  };
  const page = createRecordPage(ctx);
  return {
    dom, ctx, calls, page, press, saveQuick, closeQuick,
  };
}

test('the record page binds its Quick Create listeners on construction', async () => {
  const bench = await mount();
  // Both, and once each: a submit listener that was never added leaves a dialog whose Save does
  // nothing, which is exactly the failure a rendered-markup assertion cannot see.
  assert.equal((bench.dom.listeners.click || []).length, 1);
  assert.equal((bench.dom.listeners.submit || []).length, 1);
});

test('pressing a tile reads the record out of the DOM and disables the button', async () => {
  const bench = await mount();
  const seat = node({}, { dataset: { wbQuickSeat: 'co1|ws-1|app-1|item-1' } });
  const button = node({}, { dataset: { wbQuick: 'call' } });
  button.closest = (sel) => (sel === '[data-wb-quick]' ? button : (sel === '[data-wb-quick-seat]' ? seat : null));

  let prevented = false;
  bench.dom.fire('click', {
    target: { closest: (sel) => (sel === '[data-wb-quick]' ? button : null) },
    preventDefault: () => { prevented = true; },
  });
  assert.equal(prevented, true, 'a tile inside a form would submit it otherwise');
  // Held while it works: making a field then opening an editor is two awaits, and a second press
  // in between would make a second field.
  assert.equal(button.disabled, true);
});

test('a press with no record behind it does nothing at all', async () => {
  // The seat rides on the card. Without it there is no record to act on, and going ahead would
  // write to whatever `undefined` resolved to.
  const bench = await mount();
  const button = node({}, { dataset: { wbQuick: 'call' } });
  button.closest = (sel) => (sel === '[data-wb-quick]' ? button : null);
  bench.dom.fire('click', {
    target: { closest: (sel) => (sel === '[data-wb-quick]' ? button : null) },
    preventDefault: () => {},
  });
  assert.equal(button.disabled, false, 'it must not even start');
});

test('a click that is not on a tile is left alone', async () => {
  const bench = await mount();
  let prevented = false;
  bench.dom.fire('click', {
    target: { closest: () => null },
    preventDefault: () => { prevented = true; },
  });
  assert.equal(prevented, false, 'every other click on the page still works');
});

test('the backdrop closes only when the backdrop itself was pressed', async () => {
  // Without the identity check every press inside the dialog closes it on the way up, which makes
  // the thing impossible to fill in.
  const bench = await mount();
  const backdrop = node({});
  const inside = { closest: (sel) => (sel === '[data-wb-quick-backdrop]' ? backdrop : null) };
  let preventedInside = false;
  bench.dom.fire('click', { target: inside, preventDefault: () => { preventedInside = true; } });
  assert.equal(preventedInside, false, 'a press inside the dialog must not close it');
});

test('a submit that is not the dialog form is left alone', async () => {
  const bench = await mount();
  let prevented = false;
  bench.dom.fire('submit', {
    target: { closest: () => null },
    preventDefault: () => { prevented = true; },
  });
  assert.equal(prevented, false, 'the comment box and every other form still submit');
});

test('nothing shadows the ctx the dialog is rendered with', () => {
  // The bug this closes: a local `const ctx = { companyId, app, values, ... }` for wbFmtVal sat
  // above the Quick Create block in the SAME function, so renderQuickModal(ctx) was handed a
  // formatting context with no `state` on it. Every tile then threw "Cannot read properties of
  // undefined (reading 'wbQuick')" on its first press -- the one press that makes quickModule
  // truthy and puts the dialog on screen.
  //
  // Static, because the failure is a name resolving to the wrong object; it renders and reads
  // correctly on both sides of the shadow.
  const src = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8');
  const shadows = src.match(/^\s*(?:const|let|var)\s+ctx\s*=/gm) || [];
  assert.deepEqual(shadows, [], 'ctx is the factory parameter here and must not be redeclared');
});
