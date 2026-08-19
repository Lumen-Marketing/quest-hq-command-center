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

// `ws-<uuid>`, the shape the App Builder actually keys a workspace by.
const WS_UUID = '42959c90-a8e6-4ec4-af78-82036849dba7';
const WS = `ws-${WS_UUID}`;

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
    wbDoc: () => ({ workspaces: [{ id: WS, apps: [app] }] }),
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

  const seat = { dataset: { wbQuickSeat: `co1|${WS}|app-1|item-1` } };
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
  const html = page.wbViewItemPage(route, 'co1', { id: WS, name: 'Sales' }, app, app.items[0]);
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
  const html = page.wbViewItemPage(route, 'co1', { id: WS, name: 'Sales' }, app, app.items[0]);
  assert.match(html, /data-wb-quick="field"/, 'the tiles are missing');
  assert.ok(!/data-wb-quick-form/.test(html), 'a dialog nobody opened');
  assert.equal(dom.fire('click', { target: { closest: () => null }, preventDefault: () => {} }), undefined);
});

test('the type picker opens and chooses through the record page listener', async () => {
  // The dropdown is buttons and a hidden input, because a <select> cannot show an icon -- so it
  // works only if the record page's click listener knows about it. Drawing it is not enough.
  const dom = fakeDom();
  const state = {};
  const ctx = makeCtx(state);
  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const page = createRecordPage(ctx);

  const seat = { dataset: { wbQuickSeat: `co1|${WS}|app-1|item-1` } };
  const tile = { dataset: { wbQuick: 'field' }, disabled: false };
  tile.closest = (sel) => (sel === '[data-wb-quick]' ? tile
    : (sel === '[data-wb-quick-seat]' ? seat : null));
  dom.fire('click', {
    target: { closest: (sel) => (sel === '[data-wb-quick]' ? tile : null) },
    preventDefault: () => {},
  });
  for (let i = 0; i < 4; i += 1) await new Promise((done) => { setTimeout(done, 0); });

  /** A press on one of the dialog's own controls. */
  const setter = (pair) => {
    const node = { dataset: { wbQuickSet: pair } };
    node.closest = (sel) => (sel === '[data-wb-quick-set]' ? node : null);
    dom.fire('click', {
      target: { closest: (sel) => (sel === '[data-wb-quick-set]' ? node : null) },
      preventDefault: () => {},
    });
  };

  setter('open|type');
  assert.equal(state.wbQuick.open, 'type', 'the picker never opened');
  setter('type|money');
  assert.equal(state.wbQuick.type, 'money');
  assert.equal(state.wbQuick.open, '', 'choosing left the list covering the form');

  // Before/After and the field, and the composed value the form actually submits.
  setter('dir|before');
  const route = { params: { get: () => '' } };
  const html = page.wbViewItemPage(route, 'co1', { id: WS, name: 'Sales' }, app, app.items[0]);
  assert.match(html, /name="position" value="before:f-name"/);
  assert.match(html, /Which field/);
});

test('a name typed into the box survives a press on the pickers', async () => {
  // The whole round trip, because the fix lives in two places: the record page has to READ the
  // form before the redraw, and the module has to put the values back. Either half alone still
  // loses the name.
  const dom = fakeDom();
  const state = {};
  const ctx = makeCtx(state);
  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const page = createRecordPage(ctx);

  const seat = { dataset: { wbQuickSeat: `co1|${WS}|app-1|item-1` } };
  const tile = { dataset: { wbQuick: 'field' }, disabled: false };
  tile.closest = (sel) => (sel === '[data-wb-quick]' ? tile
    : (sel === '[data-wb-quick-seat]' ? seat : null));
  dom.fire('click', {
    target: { closest: (sel) => (sel === '[data-wb-quick]' ? tile : null) },
    preventDefault: () => {},
  });
  for (let i = 0; i < 4; i += 1) await new Promise((done) => { setTimeout(done, 0); });

  // The dialog as the browser would hand it over: what is IN the boxes right now.
  const form = { values: { label: 'Roof age', type: 'text', position: 'after:f-name' } };
  const realFormData = globalThis.FormData;
  globalThis.FormData = class { constructor(f) { this.f = f; } entries() { return Object.entries(this.f.values); } };
  try {
    const press = (pair) => {
      const node = { dataset: { wbQuickSet: pair } };
      node.closest = (sel) => (sel === '[data-wb-quick-set]' ? node
        : (sel === '[data-wb-quick-form]' ? form : null));
      dom.fire('click', {
        target: { closest: (sel) => (sel === '[data-wb-quick-set]' ? node : null) },
        preventDefault: () => {},
      });
    };
    press('open|type');
    assert.equal(state.wbQuick.label, 'Roof age', 'opening the list cleared the box');
    press('type|money');
    assert.equal(state.wbQuick.label, 'Roof age', 'choosing a type cleared the box');
    assert.equal(state.wbQuick.type, 'money', 'the form put the old type back over the press');
  } finally {
    globalThis.FormData = realFormData;
  }

  const route = { params: { get: () => '' } };
  const html = page.wbViewItemPage(route, 'co1', { id: WS, name: 'Sales' }, app, app.items[0]);
  assert.match(html, /name="label" value="Roof age"/, 'the name was not drawn back into the box');
});

test('the Calls & messages card asks for the workspace ROW, not the builder key', async () => {
  // The other half of "invalid input syntax for type uuid". The rows are written with the uuid,
  // so a card that filters on the `ws-` key it read off the document matches nothing -- and being
  // a uuid column, it does not get as far as matching nothing.
  fakeDom();
  const asked = [];
  const chain = {
    select: () => chain,
    eq: (col, val) => { asked.push([col, val]); return chain; },
    order: () => chain,
    then: (ok) => { ok({ data: [] }); return { catch: () => {} }; },
  };
  const state = {};
  const ctx = makeCtx(state);
  ctx.createSupabaseClient = () => ({ from: () => chain });
  ctx.isLiveSupabaseSession = () => true;

  const { createRecordPage } = await import('../src/workspace/record-page.js');
  const page = createRecordPage(ctx);
  const withCard = {
    ...app,
    recordLayout: [{ id: 'b2', type: 'events', size: 2, config: {} }],
  };
  const route = { params: { get: () => '' } };
  page.wbViewItemPage(route, 'co1', { id: WS, name: 'Sales' }, withCard, withCard.items[0]);

  const workspace = asked.find(([col]) => col === 'workspace_id');
  assert.ok(workspace, 'the card never filtered by workspace at all');
  assert.equal(workspace[1], WS_UUID);
});
