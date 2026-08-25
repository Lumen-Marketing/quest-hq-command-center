import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "share link in the workspace app is not working"
//
// It was rendering. It just was not on screen: the markup used a bare .modal-backdrop and .modal,
// and NEITHER of those carries any positioning -- between them they are a background colour, a
// radius and a shadow. Every other dialog in the app is wrapped in .modal-overlay, which is what
// supplies position:fixed, inset:0, a z-index and place-items:center.
//
// So the panel was appended as two ordinary blocks at the foot of the document, below everything
// else, and pressing Share link looked exactly like pressing nothing.

globalThis.document = globalThis.document || { addEventListener() {}, querySelector() { return null; } };

const { open, renderIntakeManage } = await import('../src/intake/manage.js');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const draw = () => {
  open('co1', 'ws-1', 'app-1', {
    wbFind: () => ({ app: { id: 'app-1', name: 'Leads', fields: [{ id: 'f1', label: 'Name', type: 'text', config: {} }] } }),
    setIntakeView: () => {},
    render: () => {},
    createSupabaseClient: () => null,
    isLiveSupabaseSession: () => false,
    showToast: () => {},
    wbSave: async () => {},
    wbUid: () => 'x',
  });
  return renderIntakeManage();
};

test('the dialog is wrapped in the overlay that actually positions it', () => {
  const html = draw();
  assert.match(html, /class="modal-overlay intake-overlay"/);
  assert.ok(!html.includes('modal-backdrop'), 'the unpositioned backdrop is gone; the overlay paints the scrim');
});

test('and the overlay is the one carrying the positioning', () => {
  const at = css.indexOf('.modal-overlay {');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /position: fixed/);
  assert.match(rule, /inset: 0/);
  assert.match(rule, /z-index:/);
  assert.match(rule, /place-items: center/);
});

test('closing does not ride on the overlay', () => {
  // data-intake-close is matched with closest(), so an overlay carrying it would be found by a
  // click on any control inside the dialog -- and it would shut on its own buttons.
  const html = draw();
  const overlayTag = html.slice(html.indexOf('<div class="modal-overlay'), html.indexOf('>', html.indexOf('<div class="modal-overlay')));
  assert.ok(!overlayTag.includes('data-intake-close'), 'no close action on the overlay');
  assert.match(html, /data-intake-close/, 'but the header button still closes it');
});

test('the markup is balanced after the extra wrapper', () => {
  // The wrapper adds one <div>, and a missing </div> would swallow whatever the shell renders
  // after the modal layer.
  const html = draw();
  assert.equal((html.match(/<div/g) || []).length, (html.match(/<\/div>/g) || []).length);
});

test('a long list scrolls inside the dialog', () => {
  // min-height:0 as well as overflow-y: a flex child will not shrink below its content without
  // it, so the links would push the dialog past the bottom of the window.
  const at = css.indexOf('.intake-manage .modal-body {');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /overflow-y: auto/);
  assert.match(rule, /min-height: 0/);
});

test('a module that fails to load says so', () => {
  // It is reached from one click and nothing else. Without this, a failed fetch is a button that
  // does nothing and explains nothing -- which is what the report looked like from the outside.
  const fn = main.slice(main.indexOf('function openIntakeManage('));
  assert.match(fn.slice(0, 900), /\.catch\(\(error\) => \{/);
  assert.match(fn.slice(0, 900), /Could not open the share link panel/);
});
