import assert from 'node:assert/strict';
import test from 'node:test';

// The editor, CONSTRUCTED rather than read.
//
// `menuButton` shipped as a `const` arrow that `ribbon()` calls while overlay.innerHTML is being
// built -- before that line has run. Every one of the 2,973 tests passed against an editor that
// threw "Cannot access 'menuButton' before initialization" the instant it opened, because none of
// them called it. This one does, under the smallest DOM that gets through the constructor.
//
// It is deliberately shallow: it proves the thing opens and draws, not that any button works.
// The buttons are checked against the pure model in sheet-format.test.mjs, and in a browser.

const stub = () => {
  const node = {
    className: '', innerHTML: '', textContent: '', value: '', tabIndex: 0, hidden: false,
    style: {}, dataset: {}, files: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute() {}, getAttribute: () => null, removeAttribute() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
    appendChild() {}, remove() {}, focus() {}, blur() {}, closest: () => null,
    matches: () => false, scrollIntoView() {},
    querySelector: () => stub(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
    isConnected: true,
  };
  return node;
};

async function open(options = {}) {
  const created = [];
  globalThis.document = {
    createElement: () => { const node = stub(); created.push(node); return node; },
    body: { appendChild() {}, classList: { add() {}, remove() {} } },
    addEventListener() {}, removeEventListener() {},
    querySelector: () => null,
  };
  globalThis.CSS = { escape: (value) => value };
  const { openSheetEditor } = await import('../src/sheet/sheet-editor.js');
  const overlay = openSheetEditor({
    read: () => ({ rows: 4, cols: 3, cells: { A1: 'Item', B1: '2', C1: '=B1*3' } }),
    write: () => {},
    ...options,
  });
  return { overlay, created };
}

test('opening the editor does not throw', async () => {
  const { overlay } = await open();
  assert.ok(overlay, 'the overlay is returned');
  assert.equal(overlay.className, 'sh-overlay');
});

test('the ribbon is built, with every group and the menus inside it', async () => {
  const { overlay } = await open();
  const html = overlay.innerHTML;
  ['Font', 'Alignment', 'Number', 'Cells'].forEach((group) => {
    assert.ok(html.includes(`<small>${group}</small>`), `no ${group} group`);
  });
  // The menus are built by a function called from inside the ribbon template, which is the
  // exact path the temporal-dead-zone bug was on.
  ['borders', 'insert', 'delete', 'format'].forEach((name) => {
    assert.ok(html.includes(`data-sh-menu="${name}"`), `no ${name} button`);
    assert.ok(html.includes(`data-sh-menu-for="${name}"`), `no ${name} menu`);
  });
  assert.ok(html.includes('data-sh-do="ins:row:above"'));
  assert.ok(html.includes('data-sh-do="del:col"'));
  assert.ok(html.includes('data-sh-do="bd:outer"'));
  assert.ok(html.includes('data-sh-do="merge"'));
});

test('a read-only sheet gets no ribbon and no import', async () => {
  // Nothing on it edits anything, so drawing it would be an invitation with no follow-through.
  const { overlay } = await open({ readOnly: true });
  assert.ok(!overlay.innerHTML.includes('sh-ribbon'));
  assert.ok(!overlay.innerHTML.includes('data-sh-file'));
  assert.ok(overlay.innerHTML.includes('data-sh-export'), 'but it can still be exported');
});

test('a sheet that will not parse opens empty instead of throwing', async () => {
  const { overlay } = await open({ read: () => null });
  assert.ok(overlay);
});
