import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { DASH_COLUMNS, moveWidget, removeWidget, reorderWidget, resizeWidget } from '../src/workspace/dashboard-widgets.js';
import { BLOCK_TYPES, normalizeBlock, resizeBlock } from '../src/workspace/record-layout.js';

// Two bugs in the record layout editor, both from sharing machinery with the dashboard.
//
//   1. Resizing a card rewrote its TYPE. resizeWidget re-normalized through normalizeWidget,
//      which only knows widget types (metric, stages, ...). A record block type it had never
//      heard of became 'metric'; normalizeBlock then read 'metric' as unknown and rewrote it
//      again to 'fields'. So resizing Comments turned it into a field group.
//
//   2. The whole card was draggable="true", so a press on any control inside it began a drag
//      and the click was swallowed. Reordering and click-to-edit fought over one gesture.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

// --- 1. resizing must not change what a card IS ------------------------------------------------

test('every record block type survives being resized', () => {
  for (const { type } of BLOCK_TYPES) {
    const before = { id: 'b1', type, size: 2, config: { collectionId: 'c-1', title: 'Costs', text: 'hi' } };
    const resized = resizeBlock([before], 'b1', 3)[0];
    assert.equal(resized.type, type, `resizing a ${type} card changed it to ${resized.type}`);
    // …and again through the normalizer the record page runs on read, which is where the
    // second rewrite happened. 'fields' and 'note' passed even with the bug — one by luck,
    // one because it is in both tables — so the whole list has to be checked, not a sample.
    const onPage = normalizeBlock(resized);
    assert.equal(onPage.type, type, `a resized ${type} card renders as a ${onPage.type}`);
    assert.equal(onPage.size, 3);
  }
});

test('resizing keeps everything else about the card', () => {
  // A Sub-items card that lost its collectionId would render as an empty panel, and a field
  // group that lost fieldIds would silently show every field in the app.
  const block = { id: 'b1', type: 'collection', size: 4, config: { collectionId: 'c-scope' } };
  assert.deepEqual(resizeBlock([block], 'b1', 2)[0].config, { collectionId: 'c-scope' });
  const group = { id: 'b2', type: 'fields', size: 2, config: { title: 'Costs', fieldIds: ['f1', 'f2'] } };
  assert.deepEqual(resizeBlock([group], 'b2', 1)[0].config, { title: 'Costs', fieldIds: ['f1', 'f2'] });
});

test('resizing still clamps to the grid, and leaves other cards alone', () => {
  const cards = [{ id: 'a', type: 'comments', size: 2 }, { id: 'b', type: 'meta', size: 1 }];
  assert.equal(resizeWidget(cards, 'a', 9)[0].size, DASH_COLUMNS);
  assert.equal(resizeWidget(cards, 'a', 0)[0].size, 1);
  assert.equal(resizeWidget(cards, 'a', 2.6)[0].size, 3);
  assert.equal(resizeWidget(cards, 'a', 3)[1].size, 1, 'the other card was touched');
  // A non-number leaves the card as it was rather than snapping it to some default width.
  assert.equal(resizeWidget(cards, 'a', 'wide')[0].size, 2);
});

test('the widget resize a dashboard does still works', () => {
  const widgets = [{ id: 'w1', type: 'stages', size: 2, config: { fieldId: 'f-stage' } }];
  const out = resizeWidget(widgets, 'w1', 4)[0];
  assert.equal(out.type, 'stages');
  assert.equal(out.size, 4);
  assert.deepEqual(out.config, { fieldId: 'f-stage' });
});

test('the other three shared functions really do only touch order', () => {
  // The claim in record-layout.js was that all four are safe to share. Three were.
  const cards = BLOCK_TYPES.map((b, i) => ({ id: `b${i}`, type: b.type, size: 2, config: {} }));
  const types = (list) => list.map((c) => c.type).sort();
  assert.deepEqual(types(moveWidget(cards, 'b2', 'up')), types(cards));
  assert.deepEqual(types(reorderWidget(cards, 'b0', 'b3')), types(cards));
  assert.deepEqual(types(removeWidget(cards, 'b1')), types(cards.filter((c) => c.id !== 'b1')));
});

// --- 2. the drag starts on the grip ------------------------------------------------------------

/**
 * mountWbGridDrag, run against a real DOM.
 *
 * Cut out of main.js rather than stubbed, so this exercises the shipped body. A source-text
 * assertion could not tell whether a press on a switch still arms the drag.
 */
function mountDrag() {
  const at = main.lastIndexOf('function mountWbGridDrag(');
  assert.notEqual(at, -1, 'mountWbGridDrag has moved');
  const body = main.slice(at, main.indexOf('\n}\n', at) + 3);
  const state = {};
  // eslint-disable-next-line no-eval
  return { mount: eval(`(${body})`), state };
}

class El {
  constructor(cls = '', parent = null) {
    this.className = cls; this.parent = parent; this.kids = []; this.dataset = {};
    this.draggable = false; this.handlers = {};
    this.classList = { add: () => {}, remove: () => {} };
    if (parent) parent.kids.push(this);
  }

  addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }

  closest(sel) {
    const want = sel.replace('.', '');
    for (let n = this; n; n = n.parent) if (String(n.className).split(/\s+/).includes(want)) return n;
    return null;
  }

  querySelectorAll(sel) {
    const out = [];
    const walk = (n) => n.kids.forEach((k) => { if (k.matches(sel)) out.push(k); walk(k); });
    walk(this);
    return out;
  }

  matches(sel) { return sel.startsWith('[') ? sel.slice(1, -1) in this.attrs : String(this.className).includes(sel.replace('.', '')); }

  fire(name, event) { (this.handlers[name] || []).forEach((fn) => fn(event)); }
}

/** A grid holding one card, which holds a grip and a switch. */
function grid() {
  const root = new El('grid');
  root.attrs = {};
  const card = new El('wb-w wb-w-comments', root);
  card.attrs = { 'data-wb-rec-id': '' };
  card.dataset.wbRecId = 'b1';
  card.draggable = true; // what the markup ships
  const grip = new El('wb-w-grip', card);
  grip.attrs = {};
  const value = new El('wb-view-val wb-inline', card);
  value.attrs = {};
  const knob = new El('wb-slider', value);
  knob.attrs = {};
  root.querySelectorAllReal = root.querySelectorAll.bind(root);
  return { root, card, grip, knob };
}

function mountOn({ root, card }) {
  const { mount } = mountDrag();
  // The body opens with document.querySelector(gridSelector); hand it our root instead.
  global.document = { querySelector: () => root };
  global.state = {};
  mount('[data-wb-rec-grid]', 'data-wb-rec-id', 'wbRecId', () => {});
  return card;
}

test('a card is not draggable until the grip is pressed', () => {
  const g = grid();
  mountOn(g);
  assert.equal(g.card.draggable, false, 'the card is armed for dragging before anyone touches the grip');
});

test('pressing the grip arms the drag', () => {
  const g = grid();
  mountOn(g);
  g.card.fire('pointerdown', { target: g.grip });
  assert.equal(g.card.draggable, true, 'the grip no longer starts a drag');
});

test('pressing a control inside the card does NOT arm the drag', () => {
  // This is the bug: pressing the switch began a drag, the pointer moved a pixel, and the
  // click that would have toggled it never happened.
  const g = grid();
  mountOn(g);
  g.card.fire('pointerdown', { target: g.knob });
  assert.equal(g.card.draggable, false, 'pressing a value inside the card still starts a drag');
});

test('the arming is re-decided on every press, so it cannot stick on', () => {
  const g = grid();
  mountOn(g);
  g.card.fire('pointerdown', { target: g.grip });
  g.card.fire('pointerdown', { target: g.knob });
  assert.equal(g.card.draggable, false, 'the card stayed draggable after the grip was released');
});

test('finishing a drag disarms the card', () => {
  const g = grid();
  mountOn(g);
  g.card.fire('pointerdown', { target: g.grip });
  g.card.fire('dragend', {});
  assert.equal(g.card.draggable, false);
});
