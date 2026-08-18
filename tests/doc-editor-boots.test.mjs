import assert from 'node:assert/strict';
import test from 'node:test';

// The document builder, CONSTRUCTED and CLICKED rather than read.
//
// The sheet editor shipped throwing "Cannot access 'menuButton' before initialization" the instant
// it opened, and all 2,973 tests passed because none of them called it. A page editor has more of
// that shape than a grid does -- markup built from functions defined further down, an inspector
// that reads the selected element, handlers that fire before the first paint -- so this opens it
// under the smallest DOM that gets through, then drives the buttons through the real listeners.
//
// Deliberately shallow about appearance: it proves the thing opens, that adding and styling reach
// the model, and that an export produces a PDF. What the page LOOKS like is doc-model's and
// doc-pdf's business, and both are checked properly in their own files.

function stubNode() {
  const node = {
    className: '',
    innerHTML: '',
    textContent: '',
    innerText: '',
    value: '',
    tabIndex: 0,
    hidden: false,
    type: '',
    checked: false,
    files: [],
    style: {},
    dataset: {},
    clientWidth: 900,
    isConnected: true,
    isContentEditable: false,
    classList: {
      add() {}, remove() {}, toggle() {}, contains: () => false,
    },
    setAttribute() {}, getAttribute: () => null, removeAttribute() {},
    disabled: false,
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
    appendChild() {}, remove() {}, focus() {}, blur() {}, click() {},
    closest: () => null, matches: () => false, insertAdjacentHTML() {},
    querySelector: () => stubNode(), querySelectorAll: () => [],
    setPointerCapture() {},
    getBoundingClientRect: () => ({
      width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0,
    }),
  };
  return node;
}

const HOST_FIELDS = [
  { id: 'h-client', type: 'text', label: 'Client', config: {} },
  { id: 'h-total', type: 'money', label: 'Contract value', config: {} },
  { id: 'h-btn', type: 'button', label: 'Send', config: {} },
];

/**
 * The smallest DOM the editor gets through, plus a way to drive the handlers it really registers.
 *
 * Built once per test and handed to whichever entry point is being exercised, so a test that opens
 * from a row inspects the editor the row opened -- not one an earlier call left lying around.
 */
function harness() {
  const listeners = {};
  const blobs = [];
  const overlay = stubNode();
  // Real listener capture: the point of this test is to run the handlers the editor actually
  // registers, not stand-ins for them.
  overlay.addEventListener = (type, fn) => { (listeners[type] ||= []).push(fn); };
  // The rails and the page are looked up by selector after innerHTML is set; each gets its own
  // node so writing to one does not read back from another.
  const named = {};
  overlay.querySelector = (selector) => {
    named[selector] ||= stubNode();
    return named[selector];
  };

  // The keydown listener goes on the document, not on the overlay, so it is captured here or
  // the shortcuts cannot be pressed in a test at all.
  const onDoc = {};
  globalThis.document = {
    createElement: () => stubNode(),
    body: { appendChild() {}, classList: { add() {}, remove() {} } },
    addEventListener: (type, fn) => { (onDoc[type] ||= []).push(fn); },
    removeEventListener() {},
    querySelector: () => null,
    activeElement: null,
  };
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle: () => ({ content: '""' }),
    prompt: () => 'A version',
    open: () => null,
    location: {},
  };
  globalThis.CSS = { escape: (value) => value };
  globalThis.URL.createObjectURL = (blob) => { blobs.push(blob); return `blob:${blobs.length}`; };
  globalThis.URL.revokeObjectURL = () => {};

  // The overlay the editor makes is its own; this hands it the stub instead, once.
  const realCreate = globalThis.document.createElement;
  let claimed = false;
  globalThis.document.createElement = (tag) => {
    if (tag === 'div' && !claimed) { claimed = true; return overlay; }
    return realCreate(tag);
  };

  /** Fire a real listener with a target that answers `closest` for one selector only. */
  const fire = (type, selector, dataset = {}, extra = {}) => {
    const node = stubNode();
    Object.assign(node.dataset, dataset);
    const target = {
      closest: (want) => (want === selector ? node : null),
      matches: (want) => want === selector,
      dataset: node.dataset,
    };
    const event = {
      target, preventDefault() {}, stopPropagation() {}, clientX: 0, clientY: 0, pointerId: 1, ...extra,
    };
    return Promise.all((listeners[type] || []).map((fn) => fn(event)));
  };

  /** A key, through the real document-level handler the editor installs. */
  const press = (init) => Promise.all((onDoc.keydown || [])
    .map((fn) => fn({ preventDefault() {}, stopPropagation() {}, ...init })));

  return {
    overlay, fire, press, listeners, blobs, named,
  };
}

async function open(options = {}) {
  const box = harness();
  const mod = await import('../src/form/doc-editor.js');
  const written = [];
  const overlay = mod.openDocEditor({
    name: 'Proposal',
    hostFields: HOST_FIELDS,
    hostValues: { 'h-client': 'Acme Roofing', 'h-total': 42500 },
    helpers: { formatDate: (v) => String(v) },
    read: () => options.doc || {},
    write: (doc) => written.push(doc),
    ...options,
  });
  return { ...box, overlay, written, doc: () => written[written.length - 1] };
}

test('it opens without throwing, and draws the page, the rails and the buttons', async () => {
  const { overlay, named } = await open();
  assert.ok(overlay, 'openDocEditor returned nothing');
  assert.match(overlay.innerHTML, /class="fd-shell"/);
  assert.match(overlay.innerHTML, /data-fd-page/);
  // paint() writes into each of the three, so all three having markup means it ran to the end.
  assert.match(named['[data-fd-rail]'].innerHTML, /data-fd-add="text"/, 'the rail did not draw');
  assert.match(named['[data-fd-side]'].innerHTML, /fd-side-empty/, 'the inspector did not draw');
  assert.match(named['[data-fd-acts]'].innerHTML, /data-fd-download="pdf"/, 'the buttons did not draw');
});

test('it opens on a document that already exists', async () => {
  const { named } = await open({
    doc: {
      title: 'Roof Proposal',
      elements: [
        { id: 'e1', kind: 'text', text: 'Hello', x: 10, y: 10, w: 60, h: 8 },
        { id: 'e2', kind: 'field', from: 'h-client', x: 10, y: 30, w: 80, h: 8 },
        { id: 'e3', kind: 'shape', shape: 'ellipse', x: 10, y: 50, w: 30, h: 30 },
        { id: 'e4', kind: 'icon', glyph: 'ti-star', x: 60, y: 50, w: 16, h: 16 },
        { id: 'e5', kind: 'image', src: 'data:image/png;base64,AA', x: 90, y: 50, w: 30, h: 20 },
      ],
    },
  });
  const page = named['[data-fd-page]'].innerHTML;
  // One node per element, whatever the kind: a kind that throws while drawing takes the page with it.
  ['e1', 'e2', 'e3', 'e4', 'e5'].forEach((id) => assert.ok(page.includes(`data-fd-el="${id}"`), `${id} did not draw`));
  assert.match(page, /Hello/);
  assert.match(page, /Acme Roofing/, 'a field element reads the record it sits on');
});

test('a record field with nothing behind it draws its name, so it can still be arranged', async () => {
  const { named } = await open({
    hostValues: {},
    doc: { elements: [{ id: 'e1', kind: 'field', from: 'h-client', x: 10, y: 10, w: 60, h: 8 }] },
  });
  const page = named['[data-fd-page]'].innerHTML;
  assert.match(page, /ghost/, 'an empty field must not be an invisible box');
  assert.match(page, /Client/);
});

test('only the fields a document can print are offered, and a button never is', async () => {
  const { named } = await open();
  const rail = named['[data-fd-rail]'].innerHTML;
  assert.match(rail, /value="h-client"/);
  assert.match(rail, /value="h-total"/);
  assert.ok(!rail.includes('h-btn'), 'a button holds no value, so it cannot go on a page');
});

// --- the handlers actually reach the model ----------------------------------------------------------

test('adding text writes an element through and selects it', async () => {
  const editor = await open();
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  const doc = editor.doc();
  assert.ok(doc, 'nothing was written');
  assert.equal(doc.elements.length, 1);
  assert.equal(doc.elements[0].kind, 'text');
  // Selected, so the inspector opens on what was just added rather than staying empty.
  assert.match(editor.named['[data-fd-side]'].innerHTML, /Position/);
});

test('adding each shape works, and a line arrives with something to see', async () => {
  const editor = await open();
  for (const shape of ['rect', 'ellipse', 'line']) {
    // eslint-disable-next-line no-await-in-loop
    await editor.fire('click', '[data-fd-add-shape]', { fdAddShape: shape });
  }
  const doc = editor.doc();
  assert.deepEqual(doc.elements.map((el) => el.shape), ['rect', 'ellipse', 'line']);
  const line = doc.elements[2];
  assert.ok(line.style.strokeWidth > 0, 'a line with no stroke would be invisible');
});

test('choosing a field from the rail places it', async () => {
  const editor = await open();
  await editor.fire('change', '[data-fd-add-field]', {}, {
    target: {
      matches: (want) => want === '[data-fd-add-field]',
      closest: () => null,
      value: 'h-total',
      dataset: {},
    },
  });
  const doc = editor.doc();
  assert.equal(doc.elements[0].kind, 'field');
  assert.equal(doc.elements[0].from, 'h-total');
});

test('bold, alignment and layering all reach the document', async () => {
  const editor = await open({
    doc: { elements: [{ id: 'e1', kind: 'text', text: 'Title', x: 10, y: 10, w: 60, h: 8 }, { id: 'e2', kind: 'text', text: 'Second', x: 10, y: 30, w: 60, h: 8 }] },
  });
  // Select the first, then restyle it.
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('click', '[data-fd-toggle]', { fdToggle: 'bold' });
  assert.equal(editor.doc().elements.find((el) => el.id === 'e1').style.bold, true);
  await editor.fire('click', '[data-fd-align]', { fdAlign: 'center' });
  assert.equal(editor.doc().elements.find((el) => el.id === 'e1').style.align, 'center');
  await editor.fire('click', '[data-fd-layer]', { fdLayer: 'front' });
  assert.deepEqual(editor.doc().elements.map((el) => el.id), ['e2', 'e1']);
});

test('removing the selected element writes the removal and empties the inspector', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Gone', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('click', '[data-fd-del]', {});
  assert.equal(editor.doc().elements.length, 0);
  assert.match(editor.named['[data-fd-side]'].innerHTML, /fd-side-empty/);
});

test('a version can be saved and restored through the buttons', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Draft one', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('click', '[data-fd-versions]', {});
  await editor.fire('click', '[data-fd-save-version]', {});
  const saved = editor.doc();
  assert.equal(saved.versions.length, 1);
  assert.equal(saved.versions[0].elements[0].text, 'Draft one');
  // Change it, then put the version back.
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('click', '[data-fd-del]', {});
  assert.equal(editor.doc().elements.length, 0);
  await editor.fire('click', '[data-fd-restore]', { fdRestore: saved.versions[0].id });
  assert.equal(editor.doc().elements[0].text, 'Draft one');
  assert.equal(editor.doc().versions.length, 1, 'restoring must not erase the history it came from');
});

test('the page size and orientation reach the document', async () => {
  const editor = await open();
  await editor.fire('change', '[data-fd-page-size]', {}, {
    target: { matches: (w) => w === '[data-fd-page-size]', closest: () => null, value: 'legal', dataset: {} },
  });
  assert.equal(editor.doc().page.size, 'legal');
  await editor.fire('change', '[data-fd-landscape]', {}, {
    target: { matches: (w) => w === '[data-fd-landscape]', closest: () => null, checked: true, dataset: {} },
  });
  assert.equal(editor.doc().page.landscape, true);
});

test('a read-only document draws, and refuses every change', async () => {
  const editor = await open({
    readOnly: true,
    doc: { elements: [{ id: 'e1', kind: 'text', text: 'Look only', x: 10, y: 10, w: 60, h: 8 }] },
  });
  assert.match(editor.named['[data-fd-rail]'].innerHTML, /not change it/);
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  assert.equal(editor.written.length, 0, 'a read-only document must not be written to');
  // And no handles to grab.
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('fd-grip'));
});

// --- the export -------------------------------------------------------------------------------------

test('the PDF button produces a PDF, through the real writer', async () => {
  const editor = await open({
    doc: {
      title: 'Roof Proposal',
      elements: [
        { id: 'e1', kind: 'text', text: 'Roof Replacement Proposal', x: 14, y: 14, w: 180, h: 12, style: { size: 20, bold: true } },
        { id: 'e2', kind: 'field', from: 'h-total', x: 14, y: 40, w: 90, h: 8 },
        { id: 'e3', kind: 'shape', shape: 'line', x: 14, y: 34, w: 182, h: 1 },
      ],
    },
  });
  await editor.fire('click', '[data-fd-download]', { fdDownload: 'pdf' });
  assert.equal(editor.blobs.length, 1, 'nothing was handed over to download');
  const bytes = new Uint8Array(await editor.blobs[0].arrayBuffer());
  const text = Buffer.from(bytes).toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
  assert.ok(text.includes('(Roof Replacement Proposal) Tj'));
  // The money field went in formatted the way the record shows it -- not 42500 -- and under the
  // record's own name for it, so renaming the field renames it on the proposal.
  assert.ok(
    text.includes('(Contract value: $42,500.00) Tj'),
    `expected a labelled, formatted total: ${text.match(/\([^)]*\) Tj/g)}`,
  );
});

test('an uploaded PDF is handed over untouched rather than redrawn', async () => {
  // Redrawing the design would produce a completely different document from the one somebody
  // uploaded and expects to send.
  const pdf = Buffer.from('%PDF-1.4 pretend\n%%EOF\n', 'latin1').toString('base64');
  const editor = await open({
    doc: {
      elements: [{ id: 'e1', kind: 'text', text: 'the design nobody asked for', x: 10, y: 10, w: 60, h: 8 }],
      upload: { name: 'Signed.pdf', src: `data:application/pdf;base64,${pdf}` },
      source: 'upload',
    },
  });
  await editor.fire('click', '[data-fd-download]', { fdDownload: 'pdf' });
  const text = Buffer.from(new Uint8Array(await editor.blobs.at(-1).arrayBuffer())).toString('latin1');
  assert.match(text, /pretend/);
  assert.ok(!text.includes('the design nobody asked for'));
});

test('an oversized PDF is refused with the size named, not silently dropped', async () => {
  const editor = await open();
  await editor.fire('change', '[data-fd-pdf]', {}, {
    target: {
      matches: (w) => w === '[data-fd-pdf]',
      closest: () => null,
      files: [{ name: 'huge.pdf', size: 40 * 1024 * 1024 }],
      value: '',
      dataset: {},
    },
  });
  assert.equal(editor.written.length, 0);
  assert.match(editor.named['[data-fd-status]'].textContent, /40\.0 MB/);
});

// --- selecting, dragging and typing are three states, not two ---------------------------------------

test('one press both selects and arms the drag', async () => {
  // Requiring a click to select and a second press to move is the most irritating thing an editor
  // can ask for, and it is what the first version of this did.
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Move me', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('pointermove', '[data-fd-el]', { fdEl: 'e1' }, { clientX: 30, clientY: 15 });
  await editor.fire('pointerup', '[data-fd-el]', { fdEl: 'e1' });
  const el = editor.doc()?.elements[0];
  assert.ok(el, 'the drag never committed, so the first press did not arm it');
  assert.ok(el.x > 10, `expected the box to move right, got x=${el.x}`);
  assert.ok(el.y > 10, `expected the box to move down, got y=${el.y}`);
});

test('a press that does not move is a selection and writes nothing', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Just picking', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('pointerup', '[data-fd-el]', { fdEl: 'e1' });
  assert.equal(editor.written.length, 0, 'selecting must not save a document identical to the stored one');
  assert.match(editor.named['[data-fd-side]'].innerHTML, /Position/, 'but it is selected');
});

test('text is only editable while it is being typed into', async () => {
  // An always-editable box swallows the pointer, so the element could then only be dragged by its
  // handles -- never by its middle, which is how everybody moves things.
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Words', x: 10, y: 10, w: 60, h: 8 }] } });
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('contenteditable'), 'not editable before a double-click');
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('contenteditable'), 'selecting is not typing');
  await editor.fire('dblclick', '[data-fd-el]', { fdEl: 'e1' });
  assert.match(editor.named['[data-fd-page]'].innerHTML, /contenteditable="plaintext-only"/, 'a double-click starts typing');
  // Exactly one: two editable boxes at once would put the caret somewhere nobody chose.
  assert.equal((editor.named['[data-fd-page]'].innerHTML.match(/contenteditable/g) || []).length, 1);
});

test('a press that has not moved yet captures nothing', async () => {
  // Capturing the pointer on press retargets the click AND the double-click that follow it to
  // the capturing node. While that node was the overlay, `closest('[data-fd-el]')` found nothing
  // and no text on the page could be typed into at all.
  let captured = 0;
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Words', x: 10, y: 10, w: 60, h: 8 }] } });
  editor.overlay.setPointerCapture = () => { captured += 1; };
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  assert.equal(captured, 0, 'a press is not yet a drag');
  await editor.fire('pointermove', '[data-fd-el]', { fdEl: 'e1' }, { clientX: 40, clientY: 20 });
  assert.equal(captured, 0, 'and when it becomes one, the element is captured -- never the overlay');
});

test('a double-click that lands on the paper still opens the box that was selected', async () => {
  // This is what made every text element permanently unwritable-into. The FIRST click selects,
  // and selecting repaints the page -- so the node that click landed on no longer exists when
  // the second one arrives, and the browser fires the dblclick at their nearest common
  // ancestor, which is the paper. Looking only under the pointer found nothing to type into.
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Words', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('dblclick', '[data-fd-page]', {});
  assert.match(editor.named['[data-fd-page]'].innerHTML, /contenteditable/, 'the caret never got into the box');
});

test('a double-click on bare paper with nothing selected opens nothing', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Words', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('dblclick', '[data-fd-page]', {});
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('contenteditable'));
});

test('a double-click on the rails is not a double-click on the page', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Words', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('dblclick', '[data-fd-margin]', {});
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('contenteditable'));
});

test('a field element and a shape are never editable, whatever is double-clicked', async () => {
  // Their words belong to the record, so typing over them would be a change that vanishes on the
  // next repaint.
  const editor = await open({
    doc: {
      elements: [
        { id: 'e1', kind: 'field', from: 'h-client', x: 10, y: 10, w: 60, h: 8 },
        { id: 'e2', kind: 'shape', shape: 'rect', x: 10, y: 30, w: 30, h: 20 },
      ],
    },
  });
  await editor.fire('dblclick', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('dblclick', '[data-fd-el]', { fdEl: 'e2' });
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('contenteditable'));
});

test('an empty text element being typed into shows nothing, not its placeholder', async () => {
  // Otherwise the first thing anybody has to do is delete the words "Type here".
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: '', x: 10, y: 10, w: 60, h: 8 }] } });
  assert.match(editor.named['[data-fd-page]'].innerHTML, /Type here/, 'an empty box has to be findable');
  await editor.fire('dblclick', '[data-fd-el]', { fdEl: 'e1' });
  assert.ok(!editor.named['[data-fd-page]'].innerHTML.includes('Type here'), 'the placeholder is not text to delete');
});

// --- Save, from the header, without opening anything ------------------------------------------------

test('the header carries a Save button, beside the Versions panel rather than inside it', async () => {
  const editor = await open();
  assert.match(editor.named['[data-fd-acts]'].innerHTML, /data-fd-save\b/, 'Save is not in the header');
  assert.match(editor.named['[data-fd-acts]'].innerHTML, /data-fd-versions/);
});

test('Save saves the document, through whoever opened the editor', async () => {
  // It used to keep a VERSION and nothing else, which read as "saved" and was not: the document
  // was still only in the hidden input it came from, and closing the panel took it with it.
  const saves = [];
  let asked = false;
  const editor = await open({
    doc: { elements: [{ id: 'e1', kind: 'text', text: 'Draft', x: 10, y: 10, w: 60, h: 8 }] },
    onSave: (doc) => { saves.push(doc); return 'Saved to the field.'; },
  });
  globalThis.window.prompt = () => { asked = true; return 'typed'; };
  await editor.fire('click', '[data-fd-save]', {});
  assert.equal(asked, false, 'Save must not stop to ask anything');
  assert.equal(saves.length, 1, 'the host was never told to save');
  assert.equal(saves[0].elements[0].text, 'Draft', 'and it was handed what is on the page');
  assert.match(editor.named['[data-fd-status]'].textContent, /Saved to the field/, 'it says where it went');
  // A version is a different thing, wanted far less often, and has its own button.
  assert.equal((editor.doc().versions || []).length, 0, 'Save must not fill the history with versions');
});

test('a host that cannot say where it went still gets a plain confirmation', async () => {
  const editor = await open({ onSave: () => undefined });
  await editor.fire('click', '[data-fd-save]', {});
  assert.match(editor.named['[data-fd-status]'].textContent, /Saved/);
});

test('a save that throws says so instead of looking like it worked', async () => {
  const editor = await open({ onSave: () => { throw new Error('the network is down'); } });
  await editor.fire('click', '[data-fd-save]', {});
  assert.match(editor.named['[data-fd-status]'].textContent, /the network is down/);
  assert.equal(editor.named['[data-fd-status]'].className, 'fd-status bad');
});

// --- undo and redo ----------------------------------------------------------------------------------

test('undo takes the last change back, and redo puts it on again', async () => {
  const editor = await open();
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  assert.equal(editor.doc().elements.length, 1);
  await editor.fire('click', '[data-fd-undo]', {});
  assert.equal(editor.doc().elements.length, 0, 'undo did not reach the document');
  await editor.fire('click', '[data-fd-redo]', {});
  assert.equal(editor.doc().elements.length, 1, 'redo did not put it back');
});

test('undo is written through, so the record does not keep what was taken back', async () => {
  // The whole point: a document that lives in a hidden input is only ever as good as the last
  // thing written to it.
  const editor = await open();
  await editor.fire('click', '[data-fd-add-shape]', { fdAddShape: 'rect' });
  await editor.fire('click', '[data-fd-undo]', {});
  assert.equal(editor.written.at(-1).elements.length, 0);
});

test('the buttons are offered only when there is something to do with them', async () => {
  const editor = await open();
  assert.match(editor.named['[data-fd-acts]'].innerHTML, /data-fd-undo[^>]*disabled/, 'nothing to undo yet');
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  assert.ok(!/data-fd-undo[^>]*disabled/.test(editor.named['[data-fd-acts]'].innerHTML), 'now there is');
  await editor.fire('click', '[data-fd-undo]', {});
  assert.ok(!/data-fd-redo[^>]*disabled/.test(editor.named['[data-fd-acts]'].innerHTML), 'and something to redo');
});

test('undo with nothing behind it says so rather than doing nothing silently', async () => {
  const editor = await open();
  await editor.fire('click', '[data-fd-undo]', {});
  assert.match(editor.named['[data-fd-status]'].textContent, /Nothing left to undo/);
  assert.equal(editor.written.length, 0, 'and it writes nothing');
});

test('a whole drag is one undo, not one per pointermove', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Move me', x: 10, y: 10, w: 60, h: 8 }] } });
  await editor.fire('pointerdown', '[data-fd-el]', { fdEl: 'e1' });
  await editor.fire('pointermove', '[data-fd-el]', { fdEl: 'e1' }, { clientX: 20, clientY: 10 });
  await editor.fire('pointermove', '[data-fd-el]', { fdEl: 'e1' }, { clientX: 40, clientY: 25 });
  await editor.fire('pointerup', '[data-fd-el]', { fdEl: 'e1' });
  assert.ok(editor.doc().elements[0].x > 10);
  await editor.fire('click', '[data-fd-undo]', {});
  const back = editor.doc().elements[0];
  assert.equal(back.x, 10, 'one undo has to reach all the way back to where the drag started');
  assert.equal(back.y, 10);
});

test('a typed name is one undo, however many letters it took', async () => {
  const editor = await open();
  const type = (value) => editor.fire('input', '[data-fd-title]', {}, {
    target: {
      matches: (want) => want === '[data-fd-title]', closest: () => null, value, dataset: {}, type: 'text',
    },
  });
  await type('R');
  await type('Ro');
  await type('Roof');
  assert.equal(editor.doc().title, 'Roof');
  await editor.fire('click', '[data-fd-undo]', {});
  assert.equal(editor.doc().title, '', 'undoing a name letter by letter is an undo nobody can use');
});

test('a change after an undo abandons the redo branch', async () => {
  const editor = await open();
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  await editor.fire('click', '[data-fd-undo]', {});
  await editor.fire('click', '[data-fd-add-shape]', { fdAddShape: 'ellipse' });
  await editor.fire('click', '[data-fd-redo]', {});
  assert.equal(editor.doc().elements.length, 1);
  assert.equal(editor.doc().elements[0].shape, 'ellipse', 'the branch that was left must not come back');
});

test('Ctrl+Z undoes and Ctrl+Shift+Z redoes, but never while a box has the caret', async () => {
  const editor = await open();
  await editor.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  await editor.press({ key: 'z', ctrlKey: true });
  assert.equal(editor.doc().elements.length, 0);
  await editor.press({ key: 'z', ctrlKey: true, shiftKey: true });
  assert.equal(editor.doc().elements.length, 1);
  // A name half-typed belongs to the browser's own undo, which is undoing letters.
  globalThis.document.activeElement = { tagName: 'INPUT' };
  await editor.press({ key: 'z', ctrlKey: true });
  assert.equal(editor.doc().elements.length, 1, 'the document must not move under somebody typing');
  globalThis.document.activeElement = null;
});

test('a read-only document has no history to walk', async () => {
  const editor = await open({ readOnly: true, doc: { elements: [{ id: 'e1', kind: 'text', text: 'x', x: 10, y: 10, w: 60, h: 8 }] } });
  assert.ok(!editor.named['[data-fd-acts]'].innerHTML.includes('data-fd-undo'), 'nothing changes, so nothing undoes');
  await editor.press({ key: 'z', ctrlKey: true });
  assert.equal(editor.written.length, 0);
});

test('the panel keeps its own named save, and that one does ask', async () => {
  const editor = await open({ doc: { elements: [{ id: 'e1', kind: 'text', text: 'Draft', x: 10, y: 10, w: 60, h: 8 }] } });
  globalThis.window.prompt = () => 'Sent to the client';
  await editor.fire('click', '[data-fd-versions]', {});
  await editor.fire('click', '[data-fd-save-version]', {});
  assert.equal(editor.doc().versions[0].name, 'Sent to the client');
  // Cancelling the prompt saves nothing.
  globalThis.window.prompt = () => null;
  await editor.fire('click', '[data-fd-save-version]', {});
  assert.equal(editor.doc().versions.length, 1);
});

test('a read-only document has no Save button to press', async () => {
  const editor = await open({ readOnly: true, doc: { elements: [{ id: 'e1', kind: 'text', text: 'x', x: 10, y: 10, w: 60, h: 8 }] } });
  assert.ok(!editor.named['[data-fd-acts]'].innerHTML.includes('data-fd-save"'), 'nothing to save');
});

// --- opened from a table row, where there is no hidden input to read --------------------------------

const RECORD_APP = {
  id: 'app-deals',
  fields: [
    { id: 'f-doc', type: 'form', label: 'Proposal', config: { doc: { title: 'Template', elements: [{ id: 't1', kind: 'text', text: 'From the template', x: 10, y: 10, w: 60, h: 8 }] } } },
    { id: 'h-client', type: 'text', label: 'Client', config: {} },
    { id: 'h-mail', type: 'email', label: 'Email', config: {} },
  ],
  items: [
    { id: 'i-blank', values: { 'h-client': 'Acme Roofing', 'h-mail': 'kim@acme.test' } },
    { id: 'i-own', values: { 'f-doc': JSON.stringify({ title: 'This client only', elements: [{ id: 'o1', kind: 'text', text: 'Bespoke', x: 5, y: 5, w: 50, h: 8 }] }) } },
  ],
};

async function openRow(itemId, options = {}) {
  const box = harness();
  const saved = [];
  const rendered = [];
  const mod = await import('../src/form/doc-editor.js');
  // A copy per test: openForRecord writes into the record it was given, which is the point of it.
  const app = JSON.parse(JSON.stringify(RECORD_APP));
  const overlay = mod.openForRecord('f-doc', `co|ws|app-deals|${itemId}`, {
    wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [app] }] }),
    wbSave: (id) => saved.push(id),
    render: () => rendered.push(1),
    can: () => options.canManage !== false,
    formatDate: (v) => String(v),
    memberName: (id) => String(id),
    wbItemTitle: () => 'Linked',
    ...options.ctx,
  });
  return {
    ...box, overlay, app, saved, rendered, item: app.items.find((i) => i.id === itemId),
  };
}

test('a row opens the record\'s own document', async () => {
  const row = await openRow('i-own');
  assert.match(row.named['[data-fd-page]'].innerHTML, /Bespoke/);
  assert.ok(!row.named['[data-fd-page]'].innerHTML.includes('From the template'));
});

test('a row whose record has no document yet starts from the field\'s template', async () => {
  // Without this, clicking a chip that shows a thumbnail would open a blank page.
  const row = await openRow('i-blank');
  assert.match(row.named['[data-fd-page]'].innerHTML, /From the template/);
});

test('a row reads the record it belongs to, so placed fields fill in', async () => {
  const row = await openRow('i-blank');
  assert.match(row.named['[data-fd-rail]'].innerHTML, /value="h-client"/);
  assert.ok(!row.named['[data-fd-rail]'].innerHTML.includes('value="f-doc"'), 'a form cannot hold itself');
});

test('editing from a row writes into the record at once, but saves only on close', async () => {
  // wbSave is a network round trip per company and a drag end, a colour and a nudge are each a
  // commit. The document is in memory the moment it changes, so nothing is lost by saving once.
  const row = await openRow('i-blank');
  await row.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  const held = JSON.parse(row.item.values['f-doc']);
  assert.equal(held.elements.length, 2, 'the change is on the record immediately');
  assert.deepEqual(row.saved, [], 'but it has not been persisted per keystroke');
  assert.deepEqual(row.rendered, [], 'nor has the whole app been repainted underneath');
  await row.fire('click', '[data-fd-close]', {});
  assert.deepEqual(row.saved, ['co'], 'closing persists it, once');
  assert.equal(row.rendered.length, 1, 'and repaints so the chip and the thumbnail catch up');
});

test('closing a row document nobody changed saves nothing', async () => {
  const row = await openRow('i-own');
  await row.fire('click', '[data-fd-close]', {});
  assert.deepEqual(row.saved, [], 'opening and closing is not an edit');
});

test('somebody who cannot manage the app gets it read-only', async () => {
  const row = await openRow('i-own', { canManage: false });
  assert.match(row.named['[data-fd-rail]'].innerHTML, /not change it/);
  await row.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  assert.equal(row.item.values['f-doc'].includes('New text'), false);
});

test('Save from a row persists the record, rather than only keeping a version', async () => {
  const row = await openRow('i-blank');
  await row.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  await row.fire('click', '[data-fd-save]', {});
  assert.deepEqual(row.saved, ['co'], 'Save has to reach the record');
  assert.match(row.named['[data-fd-status]'].textContent, /Saved to the record/);
  // And closing after a save does not save the same thing twice.
  await row.fire('click', '[data-fd-close]', {});
  assert.deepEqual(row.saved, ['co']);
});

// --- the hidden input a form keeps its document in --------------------------------------------------

test('a repaint under the builder does not send the document to a node nobody reads', async () => {
  // The page underneath repaints for all sorts of reasons -- a toast, a save, a refresh -- and a
  // repaint replaces this input with a new one holding the value from before the builder opened.
  // Writing to the node captured on open is how a document came back blank after being saved.
  const box = harness();
  const mod = await import('../src/form/doc-editor.js');
  const before = { ...stubNode(), value: '{}' };
  const after = { ...stubNode(), value: '{}' };
  let onPage = before;
  globalThis.document.querySelector = (selector) => (selector.includes('data-f=') ? onPage : null);
  mod.openFor('f-doc', { state: {}, wbFind: () => ({}) });
  onPage = after;
  await box.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  assert.equal(before.value, '{}', 'the input that is no longer on the page must not be written to');
  assert.match(after.value, /"kind":"text"/, 'the one that is must be');
});

/** A field's own panel, open over the app it belongs to, with the document in a hidden input. */
function openPanel(modal = {}) {
  const box = harness();
  const input = { ...stubNode(), value: '{}' };
  globalThis.document.querySelector = (selector) => (selector.includes('data-f=') ? input : null);
  const app = { id: 'app-deals', fields: [{ id: 'f-doc', type: 'form', label: 'Proposal', config: {} }], collections: [] };
  const saved = [];
  const collected = [];
  const rendered = [];
  const state = {
    builderModal: {
      kind: 'field',
      companyId: 'co',
      workspaceId: 'ws',
      appId: 'app-deals',
      editId: 'f-doc',
      draft: { id: 'f-doc', type: 'form', label: 'Proposal', config: {} },
      ...modal,
    },
  };
  return {
    ...box,
    input,
    app,
    saved,
    collected,
    rendered,
    state,
    open: async () => {
      const mod = await import('../src/form/doc-editor.js');
      return mod.openFor('f-doc', {
        state,
        wbFind: () => ({ app }),
        wbSave: (id) => saved.push(id),
        // The real one reads the hidden input back into the draft; this records that it ran and
        // does the one thing the save depends on.
        wbCollectModalDraft: () => {
          collected.push(1);
          state.builderModal.draft.config = { doc: JSON.parse(input.value || '{}') };
        },
        render: () => rendered.push(1),
        fieldTypeLabel: () => 'Form',
      });
    },
  };
}

test('Save over a field panel writes the document onto the field, without closing the panel', async () => {
  const panel = openPanel();
  await panel.open();
  await panel.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  await panel.fire('click', '[data-fd-save]', {});
  assert.deepEqual(panel.saved, ['co'], 'the app was never saved');
  assert.equal(panel.app.fields[0].config.doc.elements.length, 1, 'the field did not get the document');
  assert.match(panel.named['[data-fd-status]'].textContent, /Saved to the field/);
  assert.ok(panel.state.builderModal, 'the panel underneath stays open to finish');
});

test('a field still being added is told which button finishes the job', async () => {
  // Putting it on the app now would create a field behind the back of somebody who has not
  // pressed Add field.
  const panel = openPanel({ editId: '' });
  await panel.open();
  await panel.fire('click', '[data-fd-save]', {});
  assert.deepEqual(panel.saved, [], 'nothing may be created early');
  assert.match(panel.named['[data-fd-status]'].textContent, /press "Add field"/);
});

test('closing over a field panel redraws it, so the thumbnail catches up', async () => {
  const panel = openPanel();
  await panel.open();
  await panel.fire('click', '[data-fd-add]', { fdAdd: 'text' });
  await panel.fire('click', '[data-fd-close]', {});
  assert.equal(panel.collected.length > 0, true, 'the panel has to be read before it is repainted');
  assert.equal(panel.rendered.length, 1);
});

test('a record form is never repainted from underneath, and says where its Save is', async () => {
  // A record's form is drawn from a draft that does not hold what has been typed into it, so a
  // repaint would take the rest of the form down with it.
  const panel = openPanel();
  panel.state.builderModal = { kind: 'item', companyId: 'co', draft: { values: {} } };
  await panel.open();
  await panel.fire('click', '[data-fd-save]', {});
  await panel.fire('click', '[data-fd-close]', {});
  assert.deepEqual(panel.saved, []);
  assert.deepEqual(panel.rendered, [], 'the form must not be rebuilt under somebody filling it in');
  assert.match(panel.named['[data-fd-status]'].textContent, /press Save on the record/);
});

test('a row pointing at a record that is gone says so instead of throwing at the DOM', async () => {
  await open();
  const mod = await import('../src/form/doc-editor.js');
  assert.throws(
    () => mod.openForRecord('f-doc', 'co|ws|app-deals|deleted', {
      wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [RECORD_APP] }] }),
      wbSave: () => {},
      can: () => true,
    }),
    /no longer here/,
  );
});
