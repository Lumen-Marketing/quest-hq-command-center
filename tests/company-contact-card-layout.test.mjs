import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  CARD_ANCHORS, CARD_REGIONS, CARD_SPANS, PIN_MAX_OFFSET, PIN_PRESETS, PIN_SNAP,
  TILE_CATALOG, anchorsInUse, buildCardLayout, cardElements, cardPinOf, cardRegionOf,
  cardSpanOf, groupByRegion, movePin, normalizeCardSettings, pinFromRects, pinStyle,
  patchCardButtons, pinWarnings, pinsByAnchor, readingOrder, regionsFor, reorderElements, spanColumns,
  splitStores, panelConfigOf, restoreCardRegion,
} from '../src/company-contacts/card-layout.js';

// The contact card stopped being a fixed shape: which tiles show, how wide each thing is, and
// where a custom button sits are all the company's decision now. This module is the whole model
// -- pure, so the settings tab and the card itself cannot disagree about where something goes.
//
// Everything here is literal fixtures in, plain objects out. No DOM.

const field = (id, type, config = {}, label = id) => ({ id, type, label, config });

// A button is NOT a field. It stores no value, has no place on the add/edit form, and lives in
// the card settings beside the tiles and panels -- so it is built here the way it is stored.
const button = (id, extra = {}) => ({
  id, label: id, action: 'push', targetApp: 'app-1', card: 'header', ...extra,
});
const withButtons = (...list) => ({ buttons: list });
const pinnedAt = (id, pin, extra = {}) => button(id, { card: 'pin', pin, ...extra });

// ---- the no-op guarantee ---------------------------------------------------------------

test('a card with no settings is the card everyone already had', () => {
  const layout = buildCardLayout([], undefined);
  assert.deepEqual(
    layout.tiles.map((element) => element.label),
    ['Open balance', 'Active records', 'Workspaces', 'Last touch'],
    'the four built-ins, in their old order -- a reorder here moves every card in production',
  );
  layout.tiles.forEach((element) => assert.equal(element.span, 'sm'));
  // The five computed tiles exist but are off, because no card has ever shown them.
  assert.equal(layout.off.length, TILE_CATALOG.length - 4);
});

// ---- normalizeCardSettings -------------------------------------------------------------

test('a stored blob is made safe without losing what it had', () => {
  const stored = normalizeCardSettings({
    tiles: [
      { id: 'balance', region: 'detail', span: 'lg', order: 2 },
      { id: 'balance', region: 'tiles', span: 'sm', order: 9 },
      { id: 'not-a-tile', region: 'tiles', span: 'sm', order: 1 },
      { id: 'records', region: 'nonsense', span: 'enormous', order: 3 },
    ],
  });
  const byId = new Map(stored.tiles.map((tile) => [tile.id, tile]));

  assert.equal(byId.get('balance').region, 'detail', 'what was stored is kept');
  assert.equal(byId.get('balance').span, 'lg');
  assert.equal(byId.get('balance').order, 2, 'the duplicate is ignored, not merged');
  assert.ok(!byId.has('not-a-tile'), 'a tile this build cannot compute is dropped, not drawn empty');
  assert.equal(byId.get('records').region, 'tiles', 'a bogus region falls back');
  assert.equal(byId.get('records').span, 'sm', 'a bogus span falls back');
  // An older blob gains the newer tiles switched OFF rather than losing the ones it had.
  assert.equal(byId.get('quiet').region, 'off');
  assert.equal(stored.tiles.length, TILE_CATALOG.length);
});

test('every tile entry is keyed id, so a conflict merges per tile', () => {
  // isIdList/mergeIdLists in builder-merge.js require a string `id`. Keyed `key`, a conflicting
  // save loses the WHOLE array to one side instead of merging tile by tile.
  normalizeCardSettings(undefined).tiles.forEach((tile) => {
    assert.equal(typeof tile.id, 'string');
    assert.ok(!('key' in tile), 'the store is keyed id, never key');
  });
});

[null, undefined, 'nonsense', 42, { tiles: 'not an array' }].forEach((input) => {
  test(`junk settings (${JSON.stringify(input)}) still yield the full default set`, () => {
    assert.equal(normalizeCardSettings(input).tiles.length, TILE_CATALOG.length);
  });
});

// ---- placement defaults ----------------------------------------------------------------

test('placement defaults match the card that existed before this setting did', () => {
  // Cross-checked against the behaviour of the deleted cardPlaceOf: long text got its own
  // panel, everything else read on the summary line. If these drift, every card moves.
  assert.equal(cardRegionOf(field('a', 'textarea')), 'detail');
  assert.equal(cardSpanOf(field('a', 'textarea')), 'xl', 'a paragraph in a quarter-width box is a column of single words');
  assert.equal(cardRegionOf(field('b', 'phone')), 'summary');
  assert.equal(cardSpanOf(field('b', 'phone')), 'sm');
  // A button is useful before anybody drags anything: it opens beside Edit info. Read off a
  // card object rather than a field, because a button is not one.
  assert.equal(cardRegionOf({ kind: 'button' }), 'header');
});

test('an explicit placement wins, and a pin survives the round trip', () => {
  assert.equal(cardRegionOf(field('a', 'phone', { card: 'tiles' })), 'tiles');
  assert.equal(cardRegionOf(field('a', 'button', { card: 'pin' })), 'pin');
  assert.equal(cardSpanOf(field('a', 'button', { card: 'pin', cardSpan: 'xl' })), 'sm',
    'a pinned element is out of flow, so a span would mean nothing');
});

test('regionsFor never offers a nonsense shelf', () => {
  const ids = (entry) => regionsFor(entry).map(([id]) => id);
  const tile = ids({ kind: 'tile' });
  assert.deepEqual(tile, ['tiles', 'detail', 'off']);
  ['summary', 'panels', 'footer', 'pin'].forEach((id) => assert.ok(!tile.includes(id)));

  assert.ok(!ids({ kind: 'field' }).includes('pin'), 'content belongs on a shelf, so the card keeps a shape');
  const button = ids({ kind: 'button' });
  assert.ok(button.includes('pin'));
  assert.ok(!button.includes('summary'), 'a button is not a value on the summary line');
});

// ---- cardPinOf -------------------------------------------------------------------------

test('a pin is only read when the field is actually pinned', () => {
  assert.equal(cardPinOf(field('a', 'button', { card: 'header', pin: { anchor: 'head' } })), null);
  assert.ok(cardPinOf(field('a', 'button', { card: 'pin' })), 'a pinned field always yields a pin');
});

test('a corrupt pin falls back rather than dropping off the card', () => {
  const pin = cardPinOf(field('a', 'button', {
    card: 'pin',
    pin: { anchor: 'nowhere', x: { at: 'sideways', px: '12' }, y: { at: 'top', px: 99999 }, z: 0 },
  }));
  assert.equal(pin.anchor, 'card', 'an unknown anchor still puts it somewhere findable');
  assert.equal(pin.x.at, 'left');
  assert.equal(pin.x.px, 12, 'a numeric string is read as a number');
  assert.equal(pin.y.px, PIN_MAX_OFFSET, 'bounded, so a bad blob cannot park it two screens away');
  assert.equal(pin.z, 1);
});

test('a fractional offset rounds and a NaN offset is zero', () => {
  const px = (value) => cardPinOf(field('a', 'button', { card: 'pin', pin: { x: { at: 'left', px: value } } })).x.px;
  assert.equal(px(12.7), 13);
  assert.equal(px('nonsense'), 0);
  assert.equal(px(-99999), -PIN_MAX_OFFSET);
});

// ---- anchorsInUse / pinsByAnchor --------------------------------------------------------

test('only live pins claim an anchor', () => {
  const elements = cardElements([], withButtons(
    pinnedAt('a', { anchor: 'head' }),
    button('b', { card: 'off', pin: { anchor: 'footer' } }),
    button('c'),
  ));
  const used = anchorsInUse(elements);
  assert.ok(used.has('head'));
  assert.ok(!used.has('footer'), 'a pin on a button that is off the card claims nothing');
  assert.equal(used.size, 1);
});

test('pins paint in a stable order, and every anchor key exists', () => {
  const elements = cardElements([], withButtons(
    pinnedAt('a', { anchor: 'head', z: 5 }, { label: 'Second', cardOrder: 1 }),
    pinnedAt('b', { anchor: 'head', z: 2 }, { label: 'First', cardOrder: 9 }),
    pinnedAt('c', { anchor: 'head', z: 2 }, { label: 'Middle', cardOrder: 3 }),
  ));
  const grouped = pinsByAnchor(elements);
  CARD_ANCHORS.forEach(([id]) => assert.ok(Array.isArray(grouped[id]), `${id} is always present`));
  // z, then order, then label -- the tie-break is what stops two same-z pins swapping between
  // renders, which reads as the card flickering.
  assert.deepEqual(grouped.head.map((element) => element.label), ['Middle', 'First', 'Second']);
});

// ---- the load-bearing round trip --------------------------------------------------------

const CARD_RECT = { id: 'card', left: 0, top: 0, width: 800, height: 1200 };
const HEAD_RECT = { id: 'head', left: 100, top: 40, width: 600, height: 200 };

test('a drop is glued to the smallest box that contains it, not the card', () => {
  // A 120x32 button dropped near the top-right of the header.
  const pinRect = { left: 100 + 600 - 120 - 24, top: 40 + 16, width: 120, height: 32 };
  const pin = pinFromRects(pinRect, [CARD_RECT, HEAD_RECT]);
  assert.equal(pin.anchor, 'head', 'the header contains it and is smaller than the card');
  assert.equal(pin.x.at, 'right');
  assert.equal(pin.y.at, 'top');
  assert.equal(pin.x.px, 24, 'a right offset is the inset from the right edge');
  assert.equal(pin.y.px, 16);
});

test('a drop round-trips: pinFromRects then pinStyle paints the same box', () => {
  // Every reference point, both signs. This is the one thing a source assertion cannot check:
  // whether the number stored actually puts the button back where the pointer left it.
  const cases = [];
  [0, 300, 600].forEach((dx) => [0, 100, 200].forEach((dy) => cases.push({ dx, dy })));
  cases.forEach(({ dx, dy }) => {
    const width = 120;
    const height = 32;
    // Keep the button fully inside the header so the geometry is unambiguous.
    const left = HEAD_RECT.left + Math.min(dx, HEAD_RECT.width - width);
    const top = HEAD_RECT.top + Math.min(dy, HEAD_RECT.height - height);
    const pinRect = { left, top, width, height };
    const pin = pinFromRects(pinRect, [CARD_RECT, HEAD_RECT], { snap: 1, magnet: 0 });
    const style = pinStyle(pin);

    // Resolve the custom properties the way the CSS in §F does, and check we land back.
    const px = (value) => Number(String(value).replace('px', ''));
    const resolvedLeft = pin.x.at === 'left'
      ? HEAD_RECT.left + px(style.vars['--pin-x'])
      : pin.x.at === 'right'
        ? HEAD_RECT.left + HEAD_RECT.width - width - px(style.vars['--pin-x'])
        : HEAD_RECT.left + HEAD_RECT.width / 2 - width / 2 + px(style.vars['--pin-x']);
    const resolvedTop = pin.y.at === 'top'
      ? HEAD_RECT.top + px(style.vars['--pin-y'])
      : pin.y.at === 'bottom'
        ? HEAD_RECT.top + HEAD_RECT.height - height - px(style.vars['--pin-y'])
        : HEAD_RECT.top + HEAD_RECT.height / 2 - height / 2 + px(style.vars['--pin-y']);

    assert.equal(resolvedLeft, left, `x round trip at dx=${dx}`);
    assert.equal(resolvedTop, top, `y round trip at dy=${dy}`);
    assert.equal(style.x, pin.x.at);
    assert.equal(style.y, pin.y.at);
  });
});

test('a drop snaps to the grid, and a near-miss magnets to the edge', () => {
  const near = pinFromRects({ left: HEAD_RECT.left + 3, top: HEAD_RECT.top + 2, width: 120, height: 32 },
    [CARD_RECT, HEAD_RECT]);
  assert.equal(near.x.px, 0, 'within the magnet, a hand-dragged button lines up exactly');
  assert.equal(near.y.px, 0);

  const snapped = pinFromRects({ left: HEAD_RECT.left + 22, top: HEAD_RECT.top + 30, width: 120, height: 32 },
    [CARD_RECT, HEAD_RECT]);
  assert.equal(snapped.x.px % PIN_SNAP, 0, 'offsets land on the grid unit');
  assert.equal(snapped.y.px % PIN_SNAP, 0);
});

test('pinStyle emits custom properties only, never left or top', () => {
  const style = pinStyle({ anchor: 'head', x: { at: 'right', px: 12 }, y: { at: 'bottom', px: 8 }, z: 3 });
  assert.deepEqual(Object.keys(style.vars).sort(), ['--pin-x', '--pin-y', '--pin-z']);
  // Which inset the value lands on is CSS's decision, so one media query can switch the whole
  // mechanism off with `position: static`. Inline positioning could not be turned off that way.
  assert.ok(!('left' in style.vars) && !('top' in style.vars) && !('position' in style.vars));
  assert.equal(style.vars['--pin-z'], '3');
});

// ---- movePin ---------------------------------------------------------------------------

test('dragging right always moves the button right, whichever edge it is anchored to', () => {
  const left = movePin({ anchor: 'head', x: { at: 'left', px: 10 }, y: { at: 'top', px: 10 }, z: 1 }, 20, 5);
  assert.equal(left.x.px, 30, 'a left-anchored offset grows');

  const right = movePin({ anchor: 'head', x: { at: 'right', px: 10 }, y: { at: 'bottom', px: 10 }, z: 1 }, 20, 5);
  assert.equal(right.x.px, -10, 'a right-anchored offset is an INSET, so it shrinks');
  assert.equal(right.y.px, 5, 'and so is a bottom-anchored one');
});

test('movePin clamps and never mutates', () => {
  const pin = { anchor: 'head', x: { at: 'left', px: 0 }, y: { at: 'top', px: 0 }, z: 1 };
  const moved = movePin(pin, 99999, -99999);
  assert.equal(moved.x.px, PIN_MAX_OFFSET);
  assert.equal(moved.y.px, -PIN_MAX_OFFSET);
  assert.equal(pin.x.px, 0, 'the original is untouched');
  assert.notEqual(moved, pin);
});

// ---- warnings and reading order ---------------------------------------------------------

test('warnings are advisory, and only fire on something worth saying', () => {
  const coincident = cardElements([], withButtons(
    pinnedAt('a', { anchor: 'head', x: { at: 'left', px: 10 }, y: { at: 'top', px: 10 } }, { label: 'One' }),
    pinnedAt('b', { anchor: 'head', x: { at: 'left', px: 12 }, y: { at: 'top', px: 12 } }, { label: 'Two' }),
  ));
  const overlap = pinWarnings(coincident);
  assert.equal(overlap.length, 1);
  assert.match(overlap[0].text, /on top of each other/);

  const overName = pinWarnings(cardElements([], withButtons(
    pinnedAt('c', { anchor: 'head', x: { at: 'left', px: 4 }, y: { at: 'center', px: 0 } }, { label: 'Call' }),
  )));
  assert.match(overName[0].text, /over the contact's name/);

  const fine = pinWarnings(cardElements([], withButtons(
    pinnedAt('d', { anchor: 'head', x: { at: 'right', px: 12 }, y: { at: 'top', px: 12 } }, { label: 'Send' }),
  )));
  assert.deepEqual(fine, [], 'a sensible placement says nothing');
});

test('reading order bands rows, so the phone layout scans like the card', () => {
  const pinned = cardElements([], withButtons(
    pinnedAt('a', { anchor: 'head', x: { at: 'left', px: 200 }, y: { at: 'top', px: 10 } }, { label: 'Right' }),
    pinnedAt('b', { anchor: 'head', x: { at: 'left', px: 10 }, y: { at: 'top', px: 14 } }, { label: 'Left' }),
    pinnedAt('c', { anchor: 'head', x: { at: 'left', px: 10 }, y: { at: 'bottom', px: 10 } }, { label: 'Lower' }),
  )).filter((element) => element.region === 'pin');

  assert.deepEqual(
    readingOrder(pinned).map((element) => element.label),
    ['Left', 'Right', 'Lower'],
    '10px and 14px are one band so x decides; a bottom-anchored pin sorts last',
  );
});

// ---- grouping, elements, reorder, split -------------------------------------------------

test('every region key exists even when the card is stripped bare', () => {
  const grouped = groupByRegion([]);
  CARD_REGIONS.forEach(([id]) => assert.deepEqual(grouped[id], [], `${id} is present and empty`));
});

test('a field and a tile interleave by order in one region', () => {
  const elements = cardElements(
    [field('a', 'rating', { card: 'tiles', cardOrder: 2 }, 'Sub rating')],
    { tiles: [{ id: 'balance', region: 'tiles', span: 'sm', order: 1 }, { id: 'records', region: 'tiles', span: 'sm', order: 3 }] },
  );
  const grouped = groupByRegion(elements);
  // The two built-ins this blob never mentioned are back-filled at their defaults and follow,
  // so the assertion is about the interleaving, not about the whole row.
  assert.deepEqual(
    grouped.tiles.slice(0, 3).map((element) => element.label),
    ['Open balance', 'Sub rating', 'Active records'],
    'a field-derived tile sorts between two built-ins -- one list once they are read',
  );
});

test('a settings entry naming an unknown tile produces no element', () => {
  const elements = cardElements([], { tiles: [{ id: 'invented', region: 'tiles', span: 'sm', order: 1 }] });
  assert.ok(!elements.some((element) => element.key === 'tile:invented'));
});

test('reordering renumbers the whole list, and a no-op is the same array', () => {
  const elements = cardElements([
    field('a', 'phone', { cardOrder: 1 }), field('b', 'email', { cardOrder: 2 }), field('c', 'url', { cardOrder: 3 }),
  ], { tiles: [] });
  const moved = reorderElements(elements, 'field:c', 'field:a');
  assert.deepEqual(moved.slice(0, 3).map((element) => element.order), [1, 2, 3], 'a fresh 1..n, never a gap');
  assert.equal(moved[0].key, 'field:c');
  assert.equal(reorderElements(elements, 'field:a', 'field:a'), elements, 'a no-op returns the same reference');
  assert.equal(reorderElements(elements, 'field:zzz', 'field:a'), elements);
});

test('a mixed list splits back into the stores it came from', () => {
  const elements = cardElements([
    field('f1', 'phone', { card: 'detail', cardSpan: 'md', cardOrder: 1 }),
  ], {
    tiles: [{ id: 'balance', region: 'tiles', span: 'lg', order: 3 }],
    buttons: [pinnedAt('b1', { anchor: 'footer', x: { at: 'right', px: 16 }, y: { at: 'bottom', px: 16 } })],
  });

  const { fields, tiles, buttons } = splitStores(elements);
  assert.equal(fields.f1.card, 'detail');
  assert.equal(fields.f1.cardSpan, 'md');
  assert.ok(!('pin' in fields.f1), 'a field is never pinned -- content belongs on a shelf');

  const saved = buttons.find((entry) => entry.id === 'b1');
  assert.equal(saved.card, 'pin');
  assert.equal(saved.pin.anchor, 'footer', 'the pin travels with the button');

  const balance = tiles.find((tile) => tile.id === 'balance');
  assert.equal(balance.span, 'lg');
  assert.ok(!tiles.some((tile) => tile.id === 'f1'), 'a field is never written into the tile store');
  assert.ok(!buttons.some((entry) => entry.id === 'f1'), 'nor into the button store');
});

test('a button moved back onto a shelf leaves no coordinates behind', () => {
  const elements = cardElements([], withButtons(button('b', { pin: { anchor: 'footer' } })));
  const { buttons } = splitStores(elements);
  assert.equal(buttons[0].card, 'header');
  assert.ok(!('pin' in buttons[0]), 'coordinates are dropped, not kept to surprise the next person');
});

test('a button is a card object, never a contact field', () => {
  // It stores no value and has no place on the add/edit form. Putting it in the field list gave
  // every contact a column that could never hold anything.
  const elements = cardElements([], withButtons(button('b1', { label: 'Send to Jobs' })));
  const entry = elements.find((element) => element.kind === 'button');
  assert.equal(entry.key, 'button:b1', 'keyed as a button, not as field:<id>');
  assert.equal(entry.label, 'Send to Jobs');
  assert.ok(!entry.field, 'it carries no field');
});

test('a button with no id is dropped, because it could never be edited again', () => {
  const settings = normalizeCardSettings({ buttons: [{ label: 'Orphan' }, button('ok')] });
  assert.deepEqual(settings.buttons.map((entry) => entry.id), ['ok']);
});

test('an unnarrowed button sends every field, which is the obvious thing', () => {
  const settings = normalizeCardSettings({ buttons: [button('b')] });
  assert.deepEqual(settings.buttons[0].fields, [], 'empty means all');
  assert.equal(settings.buttons[0].pickFields, false);
});

test('taking Location off and adding it back restores its Summary-line placement', () => {
  const location = field('location', 'location', { card: 'summary' }, 'Location');
  const [element] = cardElements([location], {});
  const hidden = { ...element, restoreRegion: element.region, region: 'off' };
  const stored = splitStores([hidden]).fields.location;

  assert.equal(stored.card, 'off');
  assert.equal(stored.cardRestore, 'summary', 'removal remembers the shelf it came from');
  assert.equal(restoreCardRegion({
    ...hidden,
    field: { ...location, config: { ...location.config, ...stored } },
  }), 'summary');
  assert.equal(
    restoreCardRegion({ kind: 'field', field: field('legacy-location', 'location', { card: 'off' }) }),
    'summary',
    'older cards without a remembered shelf use the field type default',
  );
});

test('editing several button controls accumulates into one complete draft', () => {
  let buttons = [button('b', { label: 'Button', icon: '' })];
  buttons = patchCardButtons(buttons, 'b', { label: 'Call client' });
  buttons = patchCardButtons(buttons, 'b', { icon: 'ti-phone' });
  buttons = patchCardButtons(buttons, 'b', { action: 'push' });
  buttons = patchCardButtons(buttons, 'b', { targetCompany: 'co1', targetApp: 'app2' });

  assert.deepEqual(
    {
      label: buttons[0].label,
      icon: buttons[0].icon,
      action: buttons[0].action,
      targetCompany: buttons[0].targetCompany,
      targetApp: buttons[0].targetApp,
    },
    { label: 'Call client', icon: 'ti-phone', action: 'push', targetCompany: 'co1', targetApp: 'app2' },
  );
});

test('button controls inside Contact card settings update its draft, not a competing live save', () => {
  const page = readFileSync(new URL('../src/company-contacts/page.js', import.meta.url), 'utf8');
  assert.match(page, /el\.closest\('\[data-cc-card-settings\]'\)/);
  assert.match(page, /fieldDraft\.buttons = patchCardButtons\(fieldDraft\.buttons, buttonId, patch\)/);
});

// ---- spans and presets ------------------------------------------------------------------

test('spanColumns never yields undefined, because it feeds an inline custom property', () => {
  assert.deepEqual(CARD_SPANS.map(([id]) => spanColumns(id)), [1, 2, 3, 4]);
  [undefined, null, '', 'enormous', 7].forEach((junk) => assert.equal(spanColumns(junk), 1));
});

// ---- what a panel shows about itself ----------------------------------------------------

test('a panel nobody has configured draws exactly what it always drew', () => {
  // The no-op guarantee again: opening the panel editor and closing it must change nothing.
  const inflight = panelConfigOf({ id: 'inflight' });
  ['stage', 'duration', 'dates', 'edited', 'count', 'balance', 'labels'].forEach((key) => {
    assert.equal(inflight[key], true, `${key} is on until somebody turns it off`);
  });
  // Names ON by default: a bare value with nothing saying what it is only reads to somebody who
  // already knows the layout.
  assert.equal(panelConfigOf({ id: 'inflight', config: { labels: false } }).labels, false);
  assert.equal(inflight.limit, 5, 'five per app, which was the old hardcoded cap');

  const activity = panelConfigOf({ id: 'activity' });
  assert.equal(activity.limit, 0, 'every entry, which is what the feed always showed');
  assert.equal(panelConfigOf({ id: 'calendar' }).view, 'month');
});

test('a stored panel setting is honoured, and junk falls back', () => {
  const off = panelConfigOf({ id: 'inflight', config: { stage: false, dates: false, limit: 10 } });
  assert.equal(off.stage, false);
  assert.equal(off.dates, false);
  assert.equal(off.duration, true, 'only what was switched off is off');
  assert.equal(off.limit, 10);

  // Any whole number is honoured now -- 7 is as reasonable an answer as 5, so the count is
  // typed rather than picked from a menu. 0 means every one.
  assert.equal(panelConfigOf({ id: 'inflight', config: { limit: 7 } }).limit, 7);
  assert.equal(panelConfigOf({ id: 'inflight', config: { limit: 0 } }).limit, 0);
  // Nonsense falls back rather than showing nothing at all.
  assert.equal(panelConfigOf({ id: 'inflight', config: { limit: -3 } }).limit, 5);
  assert.equal(panelConfigOf({ id: 'inflight', config: { limit: 'lots' } }).limit, 5);
  assert.equal(panelConfigOf({ id: 'inflight', config: { limit: 99999 } }).limit, 999, 'bounded');
  assert.equal(panelConfigOf({ id: 'calendar', config: { view: 'decade' } }).view, 'month');
  assert.deepEqual(panelConfigOf({ id: 'notes' }), {}, 'a panel with nothing to choose says so');
  assert.deepEqual(panelConfigOf({ id: 'not-a-panel' }), {});
});

test('nothing in the CSS pins a card block to a fixed column span', () => {
  // A resize is `--cc-span` on the element and `.cc-region > .cc-el { grid-column: span … }`.
  // ANY other rule setting grid-column on a card block ties with that on specificity and wins on
  // source order if it comes later -- which is exactly how `.cc-panels > .cc-panel { span 2 }`
  // silently pinned every panel to two columns and made every resize look like it did nothing.
  //
  // It only looked like it worked while editing, because an element being arranged is wrapped
  // and the rule stopped matching. Defaults belong in DEFAULT_PANEL_LAYOUT, not in CSS.
  const styles = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8'));
  const offenders = [...styles.matchAll(/^\s*(\.cc-[^{]*?)\{[^}]*grid-column:\s*span\s*(\d+)/gm)]
    .map((match) => `${match[1].trim()} -> span ${match[2]}`)
    // The one legitimate fixed span: the phone breakpoint, where everything is one column.
    .filter((rule) => !/^\.cc-region > \.cc-el/.test(rule));
  assert.deepEqual(offenders, [], 'a fixed span here overrides every size the user picks');

  // And the rule that DOES size a block reads the element's own variable.
  assert.match(styles, /\.cc-region > \.cc-el \{[\s\S]*?grid-column: span min\(var\(--cc-span, 1\), 4\)/);
});

test('each connected app nominates its own row title and fields', () => {
  const config = {
    apps: {
      'app-estimating': { title: 'f-case-no', fields: ['f-project-type', 'f-notes'] },
      'app-production': { title: '', fields: ['f-crew'] },
    },
  };
  const out = panelConfigOf({ id: 'inflight', config });
  assert.equal(out.apps['app-estimating'].title, 'f-case-no');
  assert.deepEqual(out.apps['app-estimating'].fields, ['f-project-type', 'f-notes']);
  assert.equal(out.apps['app-production'].title, '', 'blank means work the title out, as it always did');
  assert.deepEqual(out.apps['app-production'].fields, ['f-crew'], 'each app keeps its own choice');

  // The older shape was a bare array, from before a row's title could be chosen. Read rather
  // than discarded -- somebody's chosen fields should survive the upgrade.
  const legacy = panelConfigOf({ id: 'inflight', config: { apps: { 'app-1': ['f-a', 'f-b'] } } });
  assert.deepEqual(legacy.apps['app-1'], { title: '', fields: ['f-a', 'f-b'] });

  // No catalogue to validate against -- the apps and their fields belong to the workspaces and
  // can be renamed or deleted at any time. Only the SHAPE is enforced.
  const junk = panelConfigOf({ id: 'inflight', config: { apps: { good: { fields: ['a'] }, bad: 'nope', worse: 7 } } });
  assert.deepEqual(junk.apps, { good: { title: '', fields: ['a'] } });
  assert.deepEqual(panelConfigOf({ id: 'inflight', config: { apps: ['wrong shape'] } }).apps, {});
  assert.deepEqual(panelConfigOf({ id: 'inflight' }).apps, {}, 'nothing nominated by default');

  // Only In flight offers this; the others have no per-app rows to put fields on.
  assert.ok(!('apps' in panelConfigOf({ id: 'activity' })));
  assert.ok(!('apps' in panelConfigOf({ id: 'calendar' })));
});

test('panel settings survive the round trip through both stores', () => {
  const config = { stage: false, limit: 3 };
  const elements = cardElements([], { panels: [{ id: 'inflight', region: 'panels', span: 'lg', order: 1, config }] });
  const entry = elements.find((element) => element.key === 'panel:inflight');
  assert.equal(entry.config.stage, false);
  assert.equal(entry.config.limit, 3);

  const { panels } = splitStores(elements);
  const saved = panels.find((panel) => panel.id === 'inflight');
  assert.equal(saved.config.stage, false, 'what was chosen is written back, not defaulted away');
  assert.equal(saved.config.limit, 3);
});

test('the pad offers nine placements, in reading order', () => {
  assert.equal(PIN_PRESETS.length, 9);
  assert.deepEqual(PIN_PRESETS[0].y, { at: 'top', px: 12 });
  assert.deepEqual(PIN_PRESETS[0].x, { at: 'left', px: 12 });
  // The centre preset sits ON the reference point rather than 12px off it.
  assert.deepEqual(PIN_PRESETS[4].x, { at: 'center', px: 0 });
  assert.deepEqual(PIN_PRESETS[4].y, { at: 'center', px: 0 });
});
