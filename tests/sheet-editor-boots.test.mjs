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
    matches: () => false, scrollIntoView() {}, insertAdjacentHTML() {},
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

test('a ribbon menu is not clipped by the ribbon it hangs off', async () => {
  // The ribbon scrolls sideways, and `overflow-x: auto` drags `overflow-y` to `auto` with it, so
  // the ribbon clips anything hanging below. An absolutely positioned menu inside it showed 17
  // of its 100 pixels -- one readable row of a three-row menu.
  const { readFileSync } = await import('node:fs');
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const source = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  const declarations = styles.replace(/\/\*[\s\S]*?\*\//g, '');

  const at = declarations.indexOf('.sh-menu {');
  assert.notEqual(at, -1);
  const rule = declarations.slice(at, declarations.indexOf('}', at));
  assert.match(rule, /position: fixed/, 'absolute would be clipped by the ribbon');
  assert.ok(!/position: absolute/.test(rule));

  // Fixed means it has to be TOLD where to go, from the button's own rect, after it is shown --
  // a hidden element has no size to measure.
  assert.match(source, /function placeMenu\(menu, button\)/);
  assert.match(source, /menu\.hidden = false;\s*\n\s*menuButtonEl\.setAttribute\('aria-expanded', 'true'\);\s*\n\s*placeMenu\(menu, menuButtonEl\);/);
  assert.match(source, /getBoundingClientRect\(\)/);
  // And it does not follow its button, so scrolling the ribbon has to close it.
  assert.match(source, /\[data-sh-ribbon\]'\)\?\.addEventListener\('scroll', closeMenus\)/);
});

test('the font and the size are typed into, not only picked from', async () => {
  // A <select> cannot be typed into at all: there was no way to search for a font or to ask for
  // 13pt, which is not on the list. A datalist keeps the suggestions and allows both.
  const { overlay } = await open();
  const html = overlay.innerHTML;
  assert.match(html, /<input class="sh-font" data-sh-set="ff" list="sh-fonts"/);
  assert.match(html, /<input class="sh-size" data-sh-set="fs" list="sh-sizes" type="number" min="6" max="96"/);
  assert.match(html, /<datalist id="sh-fonts">/);
  assert.match(html, /<datalist id="sh-sizes">/);
  assert.ok(!/<select class="sh-font"/.test(html));
  assert.ok(!/<select class="sh-size"/.test(html));

  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  // A typed box commits when it is finished with. Patching per keystroke would apply size 1 on
  // the way to 13 and repaint the grid for each character.
  assert.match(source, /const setter = event\.target\.closest\('select\[data-sh-set\]'\);/);
  assert.match(source, /const setter = event\.target\.closest\('input\[data-sh-set\]'\);/);
  assert.match(source, /event\.key === 'Enter'.*applySetter\(setter\)/s, 'Enter applies without leaving the box');
});

test('a sheet opened as its own tab fills it', async () => {
  // The centred card exists so the record form stays visible behind it. A tab opened FOR the
  // sheet has nothing behind it worth keeping, and every pixel spent on the card is one the
  // grid does not get.
  const { overlay } = await open({ fullScreen: true });
  assert.equal(overlay.className, 'sh-overlay sh-full');
  const plain = await open();
  assert.equal(plain.overlay.className, 'sh-overlay');

  const { readFileSync } = await import('node:fs');
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const at = styles.indexOf('.sh-overlay.sh-full .sh-frame {');
  assert.notEqual(at, -1);
  const rule = styles.slice(at, styles.indexOf('}', at));
  assert.match(rule, /width: 100%/);
  assert.match(rule, /height: 100%/);
  assert.match(rule, /max-width: none/, 'the frame is capped at 1400px otherwise');
  assert.match(rule, /border-radius: 0/);

  const source = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  // Opened from the address bar means this tab IS the sheet, and Open would only make another.
  assert.match(source, /const ownTab = here\.searchParams\.get\('sheet'\) === fieldId;/);
  assert.match(source, /fullScreen: ownTab,/);
  assert.match(source, /openHref: ownTab \? '' : here\.toString\(\),/);
});

test('a sheet can be opened in a window of its own', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  const { overlay } = await open();
  assert.match(overlay.innerHTML, /data-sh-window/);

  // A whole document, not a link: the sheet lives inside a record and has no URL to point at.
  assert.match(source, /function openInWindow\(\)/);
  assert.match(source, /window\.open\('', '_blank'\)/);
  // `noopener` makes window.open return NULL, so there is no handle to write into and the
  // window opens blank. Nothing third-party is loaded here, so there is nothing to open to.
  assert.ok(!/window\.open\('', '_blank', 'noopener'\)/.test(source));
  // Blocked pop-ups are said out loud rather than failing silently.
  assert.match(source, /blocked the new window/);
  // The same markup the printer gets, so the window shows the sheet and not the editor.
  assert.match(source, /\$\{printMarkup\(\)/);
});

test('a sheet that will not parse opens empty instead of throwing', async () => {
  const { overlay } = await open({ read: () => null });
  assert.ok(overlay);
});
