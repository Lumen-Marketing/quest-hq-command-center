import assert from 'node:assert/strict';
import test from 'node:test';

// The dialog is DRAWN by the record page and OWNED by the lazy module, and the two meet at one
// argument: renderQuickModal(ctx). A static check cannot see which object that name resolves to.
//
// It resolved to the wrong one. A local `const ctx` built for wbFmtVal -- companyId, app, values
// -- sat above the Quick Create block in the same function and shadowed the factory's ctx, so
// the dialog was handed something with no `state` on it and every tile threw
// "Cannot read properties of undefined (reading 'wbQuick')" on its first press.
//
// So this presses a tile for real and reads the page that comes back.

/** Enough document for the record page's listeners; nothing here renders. */
function fakeDom() {
  const listeners = {};
  globalThis.document = {
    addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  return {
    fire: (type, event) => (listeners[type] || []).forEach((fn) => fn(event)),
  };
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/**
 * The real ctx has some forty keys and this page needs almost all of them to paint.
 *
 * Rather than stub each one -- which is a list to keep in step with main.js, and the ctx-key
 * check already owns that job -- anything not named here answers with a function returning ''.
 * The point of this test is which OBJECT the dialog gets, not what any single key does.
 */
function makeCtx(state) {
  const real = {
    state,
    h,
    can: () => true,
    render: () => {},
    showToast: () => {},
    formatDate: () => '1 Jan',
    wbItemTitle: () => 'A record',
    wbFmtVal: () => '',
    wbFieldIsEditable: () => false,
    wbUrlControl: () => '',
    wbItemCommentsHtml: () => '',
    wbTimeAgo: () => 'just now',
    appHref: (p) => p,
    companyPath: () => '/',
    emptyState: () => '',
    wbUid: () => 'id-1',
    // press() looks the record up here before it opens anything.
    wbDoc: () => ({ workspaces: [{ id: 'ws-1', apps: [app] }] }),
    wbFieldUiReady: () => false,
  };
  return new Proxy(real, {
    get: (target, key) => (key in target ? target[key] : () => ''),
    has: () => true,
  });
}

const app = {
  id: 'app-1',
  name: 'Prospects',
  fields: [{ id: 'f-name', label: 'Name', type: 'text', config: {} }],
  items: [{ id: 'item-1', values: { 'f-name': '58th Pl' }, comments: [] }],
  // The card is on the page, and nothing else is -- so what comes back is about this block.
  recordLayout: [{ id: 'b1', type: 'quick', size: 2, config: {} }],
};

async function pressAndRender(kind) {
  const dom = fakeDom();
  const state = {};
  const ctx = makeCtx(state);
  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const page = createRecordPage(ctx);

  const seat = { dataset: { wbQuickSeat: 'co1|ws-1|app-1|item-1' } };
  const button = { dataset: { wbQuick: kind }, disabled: false };
  button.closest = (sel) => (sel === '[data-wb-quick]' ? button
    : (sel === '[data-wb-quick-seat]' ? seat : null));
  dom.fire('click', {
    target: { closest: (sel) => (sel === '[data-wb-quick]' ? button : null) },
    preventDefault: () => {},
  });
  // The press fetches the module, and a dynamic import settles on a real turn of the loop
  // rather than on a microtask -- so this waits the way the browser does.
  for (let i = 0; i < 4; i += 1) await new Promise((done) => { setTimeout(done, 0); });

  const route = { params: new Map() };
  route.params.get = () => '';
  const html = page.wbViewItemPage(route, 'co1', { id: 'ws-1', name: 'Sales' }, app, app.items[0]);
  return { html, state };
}

test('pressing New Field puts the dialog on the page', async () => {
  const { html, state } = await pressAndRender('field');
  assert.ok(state.wbQuick, 'the press never reached the module');
  assert.equal(state.wbQuick.kind, 'field');
  // Drawn, not just recorded in state: this is the half the shadowed ctx broke.
  assert.match(html, /data-wb-quick-form/, 'the dialog was not rendered');
  assert.match(html, /name="label"/);
  assert.match(html, /Where it goes/);
});

test('pressing Call puts its dialog on the page', async () => {
  const { html, state } = await pressAndRender('call');
  assert.equal(state.wbQuick.kind, 'call');
  assert.match(html, /data-wb-quick-form/);
});

test('with nothing open the page draws the tiles and no dialog', async () => {
  const dom = fakeDom();
  const ctx = makeCtx({});
  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const page = createRecordPage(ctx);
  const route = { params: { get: () => '' } };
  const html = page.wbViewItemPage(route, 'co1', { id: 'ws-1', name: 'Sales' }, app, app.items[0]);
  assert.match(html, /data-wb-quick="field"/, 'the tiles are missing');
  assert.ok(!/data-wb-quick-form/.test(html), 'a dialog nobody opened');
  assert.equal(dom.fire('click', { target: { closest: () => null }, preventDefault: () => {} }), undefined);
});
