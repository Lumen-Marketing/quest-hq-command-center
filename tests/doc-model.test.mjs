import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_MM, MAX_VERSIONS, addElement, clampElement, colorChannels, docFilled, docFieldRefs,
  elementText, layerElement, moveElement, nextSpot, normalizeColor, normalizeDoc, normalizeElement,
  pageMm, removeElement, removeVersion, resizeElement, restoreVersion, saveVersion, setPage,
  styleElement,
} from '../src/form/doc-model.js';

// The Form field's page: where things sit, in millimetres, and what they say.
//
// Everything here is geometry and resolution, which is exactly the part that is miserable to
// check by hand in a browser: whether a box grabbed by its top-left corner stays put, whether a
// page-size change drags its contents back on, whether a field element reads the record live.

let n = 0;
const id = () => `e${(n += 1)}`;
const doc = (elements = [], rest = {}) => normalizeDoc({ elements, ...rest }, id);
const first = (d) => d.elements[0];

test('a document is a page, what is on it, and what was saved before', () => {
  const d = normalizeDoc({}, id);
  assert.deepEqual(d.elements, []);
  assert.deepEqual(d.versions, []);
  assert.equal(d.upload, null);
  assert.equal(d.source, 'design');
  assert.deepEqual(d.page, { size: 'a4', landscape: false, margin: 12 });
});

test('a page is measured in millimetres, and landscape swaps them', () => {
  assert.deepEqual(pageMm({ size: 'a4' }), [210, 297]);
  assert.deepEqual(pageMm({ size: 'a4', landscape: true }), [297, 210]);
  assert.deepEqual(pageMm({ size: 'letter' }), [216, 279]);
});

// --- what may be on the page --------------------------------------------------------------------

test('an unknown kind, shape or colour falls back rather than reaching the page', () => {
  assert.equal(normalizeElement({ kind: 'iframe' }, id).kind, 'text');
  assert.equal(normalizeElement({ kind: 'shape', shape: 'hexagon' }, id).shape, 'rect');
  assert.equal(normalizeElement({ kind: 'icon', glyph: 'ti-star; drop table' }, id).glyph, 'ti-star');
});

test('a colour is a colour or it is refused, because it is interpolated into markup', () => {
  assert.equal(normalizeColor('#ABCDEF'), '#abcdef');
  assert.equal(normalizeColor('#abc'), '#aabbcc');
  assert.equal(normalizeColor('none'), 'none', 'an unfilled shape is a real answer');
  assert.equal(normalizeColor('red; background:url(x)'), '#111111');
  assert.equal(normalizeColor('javascript:alert(1)', '#000000'), '#000000');
  assert.deepEqual(colorChannels('#ffffff'), [1, 1, 1]);
  assert.deepEqual(colorChannels('#000000'), [0, 0, 0]);
  assert.equal(colorChannels('none'), null, 'nothing to paint is not black');
});

test('a font size and an opacity are bounded', () => {
  assert.equal(normalizeElement({ style: { size: 9999 } }, id).style.size, 96);
  assert.equal(normalizeElement({ style: { size: 0 } }, id).style.size, 5);
  assert.equal(normalizeElement({ style: { opacity: 0 } }, id).style.opacity, 0.05);
});

test('a shape brings its own defaults, since none of them match text', () => {
  const box = normalizeElement({ kind: 'shape', shape: 'rect' }, id);
  assert.equal(box.style.fill, '#e5e7eb');
  const rule = normalizeElement({ kind: 'shape', shape: 'line' }, id);
  assert.equal(rule.style.fill, 'none', 'a line has nothing to fill');
  assert.ok(rule.style.strokeWidth > 0, 'a line with no stroke would be invisible');
});

// --- moving and resizing ------------------------------------------------------------------------

test('an element cannot be dragged off the paper', () => {
  const d = doc([{ kind: 'text', x: 10, y: 10, w: 50, h: 10 }]);
  assert.deepEqual([first(moveElement(d, first(d).id, -40, -40)).x, first(moveElement(d, first(d).id, -40, -40)).y], [0, 0]);
  const far = first(moveElement(d, first(d).id, 500, 500));
  assert.equal(far.x, 210 - 50, 'stopped at the right edge, not past it');
  assert.equal(far.y, 297 - 10);
});

test('an element bigger than the page is shrunk to it', () => {
  const el = clampElement({ kind: 'shape', x: 0, y: 0, w: 900, h: 900 }, { size: 'a4' });
  assert.deepEqual([el.w, el.h], [210, 297]);
});

test('dragging a top-left handle moves the corner and leaves the other one alone', () => {
  // The bug this pins: if x is not adjusted with w, the box appears to leap sideways the moment
  // it is grabbed by its top or left edge. It is the most noticeable thing an editor can get
  // wrong, and it cannot be seen from a unit test of w alone.
  const d = doc([{ kind: 'shape', x: 50, y: 50, w: 40, h: 20 }]);
  const out = first(resizeElement(d, first(d).id, 'nw', -10, -5));
  assert.deepEqual([out.x, out.y, out.w, out.h], [40, 45, 50, 25]);
  // The right and bottom edges have not budged.
  assert.equal(out.x + out.w, 90);
  assert.equal(out.y + out.h, 70);
});

test('dragging a bottom-right handle changes only the size', () => {
  const d = doc([{ kind: 'shape', x: 50, y: 50, w: 40, h: 20 }]);
  const out = first(resizeElement(d, first(d).id, 'se', 10, 5));
  assert.deepEqual([out.x, out.y, out.w, out.h], [50, 50, 50, 25]);
});

test('a resize that would turn the box inside out stops, and stops moving too', () => {
  // Shrinking past zero from the left must not let the box march across the page while keeping
  // the minimum size.
  const d = doc([{ kind: 'shape', x: 50, y: 50, w: 40, h: 20 }]);
  const out = first(resizeElement(d, first(d).id, 'nw', 200, 200));
  assert.equal(out.w, MIN_MM);
  assert.equal(out.h, MIN_MM);
  assert.equal(out.x + out.w, 90, 'the right edge it was dragged towards is where it stopped');
  assert.equal(out.y + out.h, 70);
});

test('a resize cannot push an element past the edge either', () => {
  const d = doc([{ kind: 'shape', x: 180, y: 10, w: 20, h: 20 }]);
  const out = first(resizeElement(d, first(d).id, 'se', 100, 0));
  assert.ok(out.x + out.w <= 210 + 0.01, `${out.x}+${out.w} must fit the page`);
});

// --- style, layers, page ------------------------------------------------------------------------

test('a style patch changes one property and keeps the rest', () => {
  const d = doc([{ kind: 'text', text: 'Hi', style: { size: 20, bold: true, color: '#123456' } }]);
  const out = first(styleElement(d, first(d).id, { style: { italic: true } }));
  assert.equal(out.style.italic, true);
  assert.equal(out.style.bold, true, 'bold was not reset by an unrelated patch');
  assert.equal(out.style.size, 20);
  assert.equal(out.style.color, '#123456');
});

test('a style patch is normalized, so the inspector cannot write nonsense', () => {
  const d = doc([{ kind: 'text', text: 'Hi' }]);
  const out = first(styleElement(d, first(d).id, { style: { color: 'url(evil)' } }));
  assert.equal(out.style.color, '#111111');
});

test('paint order is array order, and layering reorders', () => {
  const d = doc([{ kind: 'shape' }, { kind: 'text' }, { kind: 'icon' }]);
  const [a, b, c] = d.elements.map((el) => el.id);
  assert.deepEqual(layerElement(d, a, 'front').elements.map((el) => el.id), [b, c, a]);
  assert.deepEqual(layerElement(d, c, 'back').elements.map((el) => el.id), [c, a, b]);
  assert.deepEqual(layerElement(d, a, 'forward').elements.map((el) => el.id), [b, a, c]);
  assert.deepEqual(layerElement(d, c, 'backward').elements.map((el) => el.id), [a, c, b]);
  assert.deepEqual(layerElement(d, a, 'backward').elements.map((el) => el.id), [a, b, c], 'already at the back');
});

test('changing the page size drags the contents back onto it', () => {
  // A4 is 297 mm tall and Letter is 279, so this element is off the bottom of the new page. A
  // silently cropped element prints as nothing and nobody knows why, so it is moved instead.
  const d = doc([{ kind: 'text', x: 10, y: 285, w: 50, h: 10 }]);
  const out = setPage(d, { size: 'letter' });
  assert.equal(out.page.size, 'letter');
  assert.equal(first(out).y, 279 - 10);
});

test('rotating to landscape brings a wide element with it', () => {
  const d = doc([{ kind: 'text', x: 200, y: 10, w: 50, h: 10 }]);
  assert.equal(first(setPage(d, { landscape: true })).x, 200, 'still fits the wider page');
  const tall = doc([{ kind: 'text', x: 10, y: 250, w: 20, h: 20 }]);
  assert.equal(first(setPage(tall, { landscape: true })).y, 210 - 20);
});

test('adding and removing', () => {
  const d = addElement(doc(), { kind: 'text', text: 'Hello' }, id);
  assert.equal(d.elements.length, 1);
  assert.equal(removeElement(d, d.elements[0].id).elements.length, 0);
});

test('a new element is placed inside the page, stepped so it does not stack exactly', () => {
  let d = doc();
  const spots = [];
  for (let i = 0; i < 4; i += 1) {
    const spot = nextSpot(d, 60, 10);
    spots.push(`${spot.x},${spot.y}`);
    d = addElement(d, { kind: 'text', ...spot }, id);
  }
  assert.equal(new Set(spots).size, 4, 'four additions must not land on top of each other');
});

// --- what an element says -----------------------------------------------------------------------

const HOST = [
  { id: 'h-name', label: 'Client', type: 'text' },
  { id: 'h-total', label: 'Total', type: 'money' },
];

test('a field element prints the VALUE, and keeps no copy of it', () => {
  // "When I'm importing data like Name, do not include the label on the data, like Name : data.
  // Just the data." A document says what it says in its own words, and whoever wanted a heading
  // has already typed one above the box.
  const el = normalizeElement({ kind: 'field', from: 'h-name' }, id);
  assert.equal(el.withLabel, false, 'the label is opt-IN');
  assert.equal(elementText(el, { fields: HOST, values: { 'h-name': 'Kim' } }), 'Kim');
  assert.equal(elementText(el, { fields: HOST, values: { 'h-name': 'Renamed Ltd' } }), 'Renamed Ltd');
  assert.ok(!('text' in el), 'a field element stores no text of its own');
});

test('a document that already asked for the label keeps it', () => {
  // The default flipped; documents laid out before it did must not silently change what they
  // print, so an element that stored `true` still prints the label.
  const el = normalizeElement({ kind: 'field', from: 'h-name', withLabel: true }, id);
  assert.equal(elementText(el, { fields: HOST, values: { 'h-name': 'Kim' } }), 'Client: Kim');
});

test('the label comes off the record, so renaming the field renames it on the document', () => {
  const el = normalizeElement({ kind: 'field', from: 'h-total', withLabel: true }, id);
  const renamed = [{ id: 'h-total', label: 'Contract value', type: 'money' }];
  assert.equal(elementText(el, { fields: renamed, values: { 'h-total': '$1,000' } }), 'Contract value: $1,000');
});

test('an empty field prints its fallback, or nothing at all', () => {
  const bare = normalizeElement({ kind: 'field', from: 'h-name' }, id);
  assert.equal(elementText(bare, { fields: HOST, values: {} }), '', 'an empty box prints nothing');
  const withFallback = normalizeElement({ kind: 'field', from: 'h-name', fallback: 'TBC' }, id);
  assert.equal(elementText(withFallback, { fields: HOST, values: {} }), 'TBC');
  // And a labelled one still says what is missing.
  const labelled = normalizeElement({ kind: 'field', from: 'h-name', fallback: 'TBC', withLabel: true }, id);
  assert.equal(elementText(labelled, { fields: HOST, values: {} }), 'Client: TBC');
});

test('a field is formatted the way the record shows it, not raw', () => {
  // Money, dates and dropdowns are stored as numbers and ids; a proposal must print what the
  // record page prints, which is why the formatter is passed in rather than reimplemented.
  const el = normalizeElement({ kind: 'field', from: 'h-total' }, id);
  const said = elementText(el, {
    fields: HOST,
    values: { 'h-total': 12500 },
    format: (field, raw) => (field.type === 'money' ? `$${Number(raw).toLocaleString('en-US')}` : String(raw)),
  });
  assert.equal(said, '$12,500');
});

test('a field pointing at nothing does not throw or print undefined', () => {
  const el = normalizeElement({ kind: 'field', from: 'gone' }, id);
  assert.equal(elementText(el, { fields: HOST, values: {} }), '');
  assert.deepEqual(docFieldRefs(doc([{ kind: 'field', from: 'gone' }, { kind: 'text' }])), ['gone']);
});

// --- versions and the uploaded PDF --------------------------------------------------------------

test('a version is a snapshot of the design, and versions never nest', () => {
  let d = doc([{ kind: 'text', text: 'v1' }], { title: 'Proposal' });
  d = saveVersion(d, 'First draft', '2026-08-17T10:00:00Z', 'me', id);
  assert.equal(d.versions.length, 1);
  assert.equal(d.versions[0].name, 'First draft');
  assert.equal(d.versions[0].elements[0].text, 'v1');
  assert.ok(!('versions' in d.versions[0]), 'a version holding versions would square the record');
});

test('the newest version is first, and the list is capped', () => {
  let d = doc([{ kind: 'text', text: 'x' }]);
  for (let i = 0; i < MAX_VERSIONS + 5; i += 1) d = saveVersion(d, `v${i}`, '', '', id);
  assert.equal(d.versions.length, MAX_VERSIONS);
  assert.equal(d.versions[0].name, `v${MAX_VERSIONS + 4}`, 'the one just saved is the one being looked for');
});

test('restoring a version puts it back without losing the version list', () => {
  let d = doc([{ kind: 'text', text: 'original' }]);
  d = saveVersion(d, 'Kept', '', '', id);
  d = { ...d, elements: [normalizeElement({ kind: 'text', text: 'changed since' }, id)] };
  const back = restoreVersion(d, d.versions[0].id);
  assert.equal(back.elements[0].text, 'original');
  assert.equal(back.versions.length, 1, 'restoring must not erase the history it came from');
  assert.equal(restoreVersion(d, 'no-such').elements[0].text, 'changed since', 'an unknown id is a no-op');
});

test('a restored version is a copy, so editing it does not rewrite history', () => {
  let d = doc([{ kind: 'text', text: 'original' }]);
  d = saveVersion(d, 'Kept', '', '', id);
  const back = restoreVersion(d, d.versions[0].id);
  back.elements[0].text = 'edited on the page';
  assert.equal(back.versions[0].elements[0].text, 'original');
});

test('a version can be thrown away', () => {
  let d = saveVersion(doc([{ kind: 'text' }]), 'a', '', '', id);
  d = saveVersion(d, 'b', '', '', id);
  assert.deepEqual(removeVersion(d, d.versions[0].id).versions.map((v) => v.name), ['a']);
});

test('an uploaded PDF sits beside the design rather than replacing it', () => {
  const d = normalizeDoc({
    elements: [{ kind: 'text', text: 'the layout I built' }],
    upload: { name: 'Signed.pdf', src: 'data:application/pdf;base64,AAA', at: '2026-08-17' },
    source: 'upload',
  }, id);
  assert.equal(d.source, 'upload');
  assert.equal(d.upload.name, 'Signed.pdf');
  assert.equal(d.elements.length, 1, 'the design somebody built last month is still here');
});

test('a document cannot point at an upload it has not got', () => {
  const d = normalizeDoc({ source: 'upload' }, id);
  assert.equal(d.source, 'design');
  const gone = normalizeDoc({ source: 'upload', upload: { name: 'x.pdf', src: '' } }, id);
  assert.equal(gone.source, 'design', 'an upload with no bytes is not an upload');
});

test('filled means there is something to open, either way it got there', () => {
  assert.equal(docFilled({}), false);
  assert.equal(docFilled({ elements: [{ kind: 'text' }] }), true);
  assert.equal(docFilled({ upload: { name: 'a.pdf', src: 'data:application/pdf;base64,AA' } }), true);
  assert.equal(docFilled({ title: 'Named but empty' }), false);
});
