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
// linkUrl reads window.location.origin to show the link it just made.
globalThis.window = globalThis.window || { location: { origin: 'https://www.questbase.io' } };

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

test('the created link is not squashed under the form below it', () => {
  // "Link created." -- the URL, the copy button and, on a private link, the ONE showing of the
  // passcode -- sat under the form card, unreachable.
  //
  // The body is a flex column with a height to fit in, and such a column SHRINKS its children
  // before it scrolls them. .form-message carries a min-height of 20px and nothing else, so the
  // block was compressed from about 90px to 20px; text cannot shrink, so it spilled out of the
  // box while the form was laid out where the squashed box ended -- on top of it.
  const at = css.indexOf('.intake-manage .modal-body > * {');
  assert.ok(at > -1, 'the children of the scrolling body must keep their own height');
  assert.match(css.slice(at, css.indexOf('}', at)), /flex-shrink: 0/);
});

test('the new link, and the passcode on a private one, are rendered above the form', () => {
  let captured = null;
  open('co1', 'ws-1', 'app-1', {
    wbFind: () => ({ app: { id: 'app-1', name: 'Leads', fields: [] } }),
    setIntakeView: (next) => { captured = next; },
    render: () => {},
    createSupabaseClient: () => null,
    isLiveSupabaseSession: () => false,
    showToast: () => {},
    wbSave: async () => {},
    wbUid: () => 'x',
  });
  captured.justMade = { token: 'tok-1', passcode: 'AB2CD3' };
  const html = renderIntakeManage();
  const made = html.indexOf('intake-made');
  const form = html.indexOf('intake-create');
  assert.ok(made > -1, 'the created link is rendered');
  assert.ok(form > made, 'and it reads above the form that made it');
  // The passcode is shown exactly once and only its hash is stored, so a copy hidden behind
  // the form is a passcode the person never gets.
  assert.ok(html.includes('Passcode <b>AB2CD3</b>'), 'the one showing of the passcode is in the markup');
  // Nothing here is positioned out of flow: overlap was a layout fault, not a stacking one,
  // and a z-index laid over the top would only have hidden it.
  assert.doesNotMatch(html, /position:s*absolute/);
});

// ---- the passcode on a private link ----------------------------------------------------------
//
// "there is no passcode input box". There was none to find: a private link generated one and
// showed it once, in the block the layout fault above had buried. It is a box now, and an
// optional one -- type a passcode or leave it empty and get a generated one.

const manage = readFileSync(new URL('../src/intake/manage.js', import.meta.url), 'utf8');

test('choosing Private offers a passcode box, and says it may be left empty', () => {
  const html = draw();
  assert.match(html, /name="passcode"/);
  assert.ok(html.includes('Passcode <span class="intake-unit">(optional)</span>'), 'the box is marked optional');
  assert.match(html, /Leave it empty and we will make one for you/);
  // Only the hash is kept, so this is the single showing. Saying so is part of the feature.
  assert.match(html, /only its hash is stored/);
});

test('the box belongs to Private, and appears without a re-render', () => {
  const at = css.indexOf('.intake-create:not(:has(input[name="visibility"][value="private"]:checked)) .intake-pass');
  assert.ok(at > -1, 'the passcode box is revealed by the Private radio');
  assert.match(css.slice(at, css.indexOf('}', at)), /display: none/);
  // A re-render to reveal it would discard anything already typed into the fields above.
  assert.ok(!manage.includes('onchange'), 'nothing re-renders the form to reveal it');
});

test('a typed passcode is normalized and hashed like a generated one, and a short one is refused', () => {
  const fn = manage.slice(manage.indexOf('async function createLink('), manage.indexOf('async function setStatus('));
  // Normalized first: the public gate normalizes what the visitor types, so a passcode stored
  // any other way would never match what they are asked for.
  assert.ok(fn.includes('const wanted = normalizePasscode(chosen);'), 'the typed passcode is normalized');
  assert.ok(fn.includes('wanted.length < PASSCODE_LENGTH'), 'a passcode shorter than the generated ones is refused');
  assert.ok(fn.includes('passcode = wanted || generatePasscode();'), 'empty means generate');
  // One hashing path for both, so a chosen passcode cannot be stored in a weaker shape.
  assert.ok(fn.includes('row.passcode_hash = await hashPasscode(passcode, row.passcode_salt);'), 'one hashing path for both');
  assert.ok(manage.includes("passcode: read('passcode'),"), 'and the form actually hands it over');
});
