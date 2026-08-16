// Where everything on a contact card sits, and how wide it is.
//
// "The ability to select exactly which details and tiles are displayed, along with the option to
// resize them" -- and, separately, "the option to add, rename, and freely position a custom
// button anywhere on the card's screen."
//
// Those are two different requests and they get two different mechanisms, deliberately:
//
//   CONTENT -- tiles, details, the summary line, the panels -- keeps a REGION and a SPAN. The
//     card's shape is the card's: a header that identifies somebody, a row of numbers, their
//     details, the panels that read their work. Content files onto a shelf.
//
//   A BUTTON is an affordance rather than content, so it gets a seventh region, 'pin': an
//     ANCHOR, a reference point, and a pixel offset. That is what "anywhere on the card" means
//     without the card becoming a free canvas that anybody can arrange into nonsense.
//
// THE IDEA THAT MAKES PINNING SAFE: a pinned button is rendered INSIDE its anchor, not into a
// card-level overlay. The header is `position: relative` and a button pinned to it is
// `position: absolute; right: 12px; top: 12px`. Everything that would otherwise be hard falls
// out of that for free -- it cannot drift when the window resizes, because it is IN the thing it
// is measured against; it needs no measure-then-paint pass, because CSS resolves it; and it
// cannot teleport when a contact has no records and the card is half the height, because it was
// never positioned against the card's height in the first place.
//
// Pure. No DOM, no state, no writes: the settings tab and the card itself both build their
// picture from here, so what the settings tab promises and what the card draws cannot drift.
// The renderer resolves each element to HTML; this only ever says what goes where.
//
// TWO STORES, because the two kinds of element are owned by different things:
//
//   a FIELD's placement lives on the field's own config (config.card / cardSpan / cardOrder /
//   pin), which is why moving a field to the tiles row is written by the same Save that renames
//   it;
//
//   a TILE is not a field -- "Open balance" is computed across every workspace and belongs to no
//   field at all -- so tile placement lives on the builder document, under `contactCard`.
//
// splitStores() puts a single edited list back into both.

/**
 * The shelves of the card, top to bottom, in the order they are drawn.
 *
 * 'pin' is last before 'off' because it is not a shelf at all: it means "this one was placed by
 * hand, ask its pin where it goes".
 */
export const CARD_REGIONS = [
  ['summary', 'Summary line', 'The · separated line under the name'],
  ['header', 'Header actions', 'Beside Edit info, at the top of the card'],
  ['tiles', 'Stat tiles', 'The row of big numbers'],
  ['detail', 'Details', 'A labelled row in the grid'],
  ['panels', 'Panels', 'Full width, below the details'],
  ['footer', 'Footer', 'The bar at the bottom of the card'],
  ['pin', 'Pinned', 'Placed by hand, anywhere on the card'],
  ['off', 'Not on the card', 'Still on the record and still stored'],
];

const REGION_IDS = CARD_REGIONS.map(([id]) => id);

/** Regions a tile can sit in. A stat tile is a number in a box; it is never pinned. */
const TILE_REGIONS = new Set(['tiles', 'detail', 'off']);

/** Regions a button can sit in -- everywhere something clickable makes sense, plus by hand. */
const BUTTON_REGIONS = new Set(['pin', 'header', 'tiles', 'detail', 'panels', 'footer', 'off']);

/**
 * How wide, on the card's four-column grid.
 *
 * Four presets rather than a drag handle. The grid already collapses on a narrow screen, and a
 * pixel width chosen on a desktop is a broken card on a phone -- a span survives that, because
 * it is a proportion rather than a measurement.
 */
export const CARD_SPANS = [
  ['sm', 'Small', 1],
  ['md', 'Medium', 2],
  ['lg', 'Wide', 3],
  ['xl', 'Full width', 4],
];

const SPAN_IDS = CARD_SPANS.map(([id]) => id);

export const CARD_COLUMNS = 4;

/**
 * The boxes a pin may be glued to.
 *
 * A FROZEN VOCABULARY. Every id here is emitted by renderCard as `data-cc-anchor`, and stored
 * pins name them. Renaming one orphans every placement that used it, exactly the way renaming a
 * database column does -- so these are ids, and the words beside them are the label.
 */
export const CARD_ANCHORS = [
  ['card', 'The whole card', 'Anywhere on the card'],
  ['head', 'The header', 'Beside the name and Edit info'],
  ['tiles', 'The tiles row', 'Over the row of numbers'],
  ['detail', 'The details', 'Over the details grid'],
  ['panels', 'The panels', 'Over In flight, Notes, Activity and the calendar'],
  ['footer', 'The footer bar', 'Beside Back to Company Contacts'],
];

const ANCHOR_IDS = CARD_ANCHORS.map(([id]) => id);

export const PIN_X = [['left', 'Left edge'], ['center', 'Centre'], ['right', 'Right edge']];
export const PIN_Y = [['top', 'Top edge'], ['center', 'Middle'], ['bottom', 'Bottom edge']];

const PIN_X_IDS = PIN_X.map(([id]) => id);
const PIN_Y_IDS = PIN_Y.map(([id]) => id);

/**
 * How far a pin may sit from its reference point. Wide enough to cross a card, bounded so a
 * corrupt blob cannot park a button two screens away where nobody can find it to drag back.
 */
export const PIN_MAX_OFFSET = 400;

/** Drop snapping, in px. 8 is the grid unit the rest of the app already packs on. */
export const PIN_SNAP = 8;

/** Within this of a reference point the offset is zeroed, so a hand-dragged button lines up. */
export const PIN_MAGNET = 6;

/** The four the card has always drawn, computed across every workspace rather than from a field. */
export const BUILTIN_TILES = [
  ['balance', 'Open balance', 'across every workspace'],
  ['records', 'Active records', 'how many are in flight'],
  ['workspaces', 'Workspaces', 'using this contact'],
  ['touch', 'Last touch', 'when anything last moved'],
];

/**
 * Numbers the card can already work out but has never shown.
 *
 * Every one is derived from the usage scan the card runs anyway, so none of them costs a query.
 * They are offered rather than added: four tiles is a row, nine is a wall.
 */
export const COMPUTED_TILES = [
  ['apps', 'Apps in use', 'distinct apps, not records'],
  ['quiet', 'Days quiet', 'since anything last moved'],
  ['stages', 'Stages in play', 'distinct stages across their records'],
  ['newest', 'Newest record', 'when the most recent one started'],
  ['first', 'First seen', 'when they joined the directory'],
];

/** Every non-field tile, keyed by id, with the kind kept so the renderer knows what to compute. */
export const TILE_CATALOG = [
  ...BUILTIN_TILES.map(([id, label, hint]) => ({ id, label, hint, kind: 'builtin' })),
  ...COMPUTED_TILES.map(([id, label, hint]) => ({ id, label, hint, kind: 'computed' })),
];

const TILE_BY_ID = new Map(TILE_CATALOG.map((tile) => [tile.id, tile]));

/**
 * The four panels the card has always drawn, now arrangeable like everything else.
 *
 * They were hardcoded in the renderer, in a fixed order, always all four. A contact directory
 * that never uses the calendar had no way to take it off, and somebody who reads Recent updates
 * first had no way to put it first. They are elements now: ordered, resized and removed the same
 * way a tile is.
 */
export const PANEL_CATALOG = [
  { id: 'inflight', label: 'In flight', hint: 'their records, grouped by app', icon: 'ti-briefcase' },
  { id: 'notes', label: 'Notes', hint: 'the long-text field, in full', icon: 'ti-note' },
  { id: 'activity', label: 'Recent updates', hint: 'what has happened on their records', icon: 'ti-activity' },
  { id: 'calendar', label: 'Calendar', hint: 'every dated field on their records', icon: 'ti-calendar' },
];

const PANEL_BY_ID = new Map(PANEL_CATALOG.map((panel) => [panel.id, panel]));

/** A panel is a wide box. It belongs in the panels region or nowhere -- never in a tile slot. */
const PANEL_REGIONS = new Set(['panels', 'off']);

/**
 * The panels as the card has always drawn them: all four, in this order, two to a row.
 *
 * `md` is two of the four columns, which is exactly the two-up arrangement they already had --
 * so nobody's card changes on the day this ships.
 */
export const DEFAULT_PANEL_LAYOUT = PANEL_CATALOG.map((panel, index) => ({
  id: panel.id, region: 'panels', span: 'md', order: index + 1,
}));

/**
 * What each panel lets you choose about its own contents.
 *
 * A panel is not just a box that is on or off -- "In flight" can show a stage, a duration, dates
 * and an edited stamp on every row, and a company that only cares about the stage wants the rest
 * gone. This is that vocabulary, declared once so the settings UI and the renderer read the same
 * list and cannot drift.
 *
 * `toggles` are on unless switched off. `limit` is how many rows before "+N more", where 0 means
 * all of them. `choice` is a single pick.
 */
export const PANEL_OPTIONS = {
  inflight: {
    toggles: [
      ['stage', 'Stage pill'],
      ['duration', 'Duration'],
      ['dates', 'Dates'],
      ['edited', 'Last edited'],
      ['count', 'Record count'],
      ['balance', 'Balance'],
      // Off, a nominated field shows its value alone. Worth having: once several apps each
      // nominate two or three fields, the labels are the longest thing on every row and the
      // values -- the part anybody is actually reading -- are what gets squeezed.
      ['labels', 'Field names'],
    ],
    limit: { label: 'Records per app', hint: '0 shows every one' },
    // Each connected app can also nominate which of ITS OWN fields show on a record row. The
    // built-in facts above are generic; this is how an Estimating row shows Project type and a
    // Production row shows the crew, without either app knowing about the contact card.
    perApp: true,
  },
  activity: {
    toggles: [
      ['app', 'App name'],
      ['actor', 'Who did it'],
      ['when', 'When'],
    ],
    limit: { label: 'Entries shown', hint: '0 shows every one' },
  },
  calendar: {
    choice: {
      key: 'view',
      label: 'Opens on',
      choices: [['month', 'Month'], ['week', 'Week'], ['day', 'Day'], ['year', 'Year']],
    },
  },
};

/** Defaults, chosen so a panel nobody has configured draws exactly what it always drew. */
const PANEL_LIMIT_DEFAULT = { inflight: 5, activity: 0 };

/**
 * One panel's content settings, made safe.
 *
 * Absent means "everything on", because that is what every card showed before this setting
 * existed -- so opening the panel editor and closing it again changes nothing.
 */
export function panelConfigOf(entry) {
  const id = String(entry?.id || '');
  const spec = PANEL_OPTIONS[id];
  if (!spec) return {};
  const raw = entry?.config && typeof entry.config === 'object' ? entry.config : {};
  const out = {};
  (spec.toggles || []).forEach(([key]) => { out[key] = raw[key] !== false; });
  if (spec.limit) {
    // Any whole number the person types, not a fixed menu -- 7 is as reasonable an answer as 5.
    // 0 means every one, and a negative or nonsense value falls back rather than showing nothing.
    const limit = Math.round(Number(raw.limit));
    out.limit = Number.isFinite(limit) && limit >= 0 ? Math.min(limit, 999) : (PANEL_LIMIT_DEFAULT[id] ?? 0);
  }
  if (spec.choice) {
    const allowed = spec.choice.choices.map(([value]) => value);
    const picked = String(raw[spec.choice.key] || '');
    out[spec.choice.key] = allowed.includes(picked) ? picked : allowed[0];
  }
  if (spec.perApp) {
    // Which of each connected app's OWN fields to show on a record row, keyed by app id.
    //
    // Not validated against a catalogue, because there is none to validate against: the apps
    // and their fields belong to the workspaces, are invented by the company, and can be
    // renamed or deleted at any time. A field id that no longer resolves simply renders
    // nothing, which is the same outcome as a field somebody emptied.
    const apps = raw.apps && typeof raw.apps === 'object' && !Array.isArray(raw.apps) ? raw.apps : {};
    out.apps = Object.fromEntries(Object.entries(apps)
      .map(([appId, entry]) => {
        // A bare array is the older shape, from before a row's TITLE could be chosen too.
        // Read rather than discarded: somebody's chosen fields should survive the upgrade.
        if (Array.isArray(entry)) return [String(appId), { title: '', fields: entry.map(String) }];
        if (!entry || typeof entry !== 'object') return null;
        return [String(appId), {
          // '' means "work it out" -- itemTitle's own rule, which is what every row used before
          // this setting existed.
          title: String(entry.title || ''),
          fields: Array.isArray(entry.fields) ? entry.fields.map(String) : [],
        }];
      })
      .filter(Boolean));
  }
  return out;
}

/** What a card button can do. */
export const CARD_BUTTON_ACTIONS = [
  ['push', 'Send this contact to an app', 'Creates a record, linked back to this contact'],
  ['set', 'Change fields on this contact', 'Writes or clears values here'],
  ['link', 'Open a link, call or email', 'tel:{Phone}, mailto:{Email}, or a web address'],
];

const ACTION_IDS = CARD_BUTTON_ACTIONS.map(([id]) => id);

/**
 * A button on the contact card.
 *
 * NOT a field. A button is not something a contact HOLDS -- it stores no value, it has no place
 * on the add/edit form, and putting it in the field list meant every contact carried a column
 * that could never contain anything. It is a card object, stored beside the tiles and panels.
 *
 * The contact's NAME is not sent as a value either. It becomes the target app's Company Contact
 * field -- labelled "Contact" -- holding this contact's id, which is what keeps the new record
 * tied to the card that produced it. Sending the name as text as well would put the same person
 * in the app twice: once as a link that works, once as a string that goes stale the moment
 * anybody is renamed.
 */
export function normalizeCardButton(input, index = 0) {
  const raw = input && typeof input === 'object' ? input : {};
  const action = ACTION_IDS.includes(String(raw.action)) ? String(raw.action) : 'push';
  const region = BUTTON_REGIONS.has(String(raw.card)) ? String(raw.card) : 'header';
  return {
    id: String(raw.id || ''),
    label: String(raw.label || '').trim() || 'Button',
    icon: /^ti-[a-z0-9-]+$/.test(String(raw.icon || '')) ? String(raw.icon) : '',
    action,
    targetCompany: String(raw.targetCompany || ''),
    targetApp: String(raw.targetApp || ''),
    // An empty list means EVERY field, because a button that has never been narrowed should do
    // the obvious thing rather than nothing.
    pickFields: raw.pickFields === true,
    fields: Array.isArray(raw.fields) ? raw.fields.map(String) : [],
    clearAll: raw.clearAll === true,
    set: Array.isArray(raw.set) ? raw.set.filter((row) => row && row.field) : [],
    href: String(raw.href || '').trim(),
    when: Array.isArray(raw.when) ? raw.when.filter((rule) => rule && rule.field && rule.op) : [],
    card: region,
    cardSpan: SPAN_IDS.includes(String(raw.cardSpan)) ? String(raw.cardSpan) : 'sm',
    cardOrder: clampOrder(raw.cardOrder, index + 1),
    ...(region === 'pin' ? { pin: raw.pin } : {}),
  };
}

/**
 * Is this button configured enough to press?
 *
 * Mirrors the App Builder's rule, asked of a card button's own shape rather than a field config.
 */
export function cardButtonReady(button) {
  if (button?.action === 'set') return button.clearAll === true || (button.set || []).some((row) => row && row.field);
  if (button?.action === 'link') return !!String(button?.href || '').trim();
  return !!button?.targetApp;
}

/** Why it is not, for the tooltip on a button nobody can press. */
export function cardButtonNotReady(button) {
  if (button?.action === 'set') return 'This button has no fields to change yet.';
  if (button?.action === 'link') return 'This button has no link set yet.';
  return 'This button has no destination app yet.';
}

/**
 * The card as it was before any of this existed.
 *
 * The four built-ins on, in their old order, each one small -- which on a four-column grid is
 * the row of four the card already drew. Nobody's card changes on the day this ships; the
 * settings simply become editable.
 */
export const DEFAULT_TILE_LAYOUT = BUILTIN_TILES.map(([id], index) => ({
  id, region: 'tiles', span: 'sm', order: index + 1,
}));

/** The nine one-click placements the settings pad offers, at a comfortable inset. */
export const PIN_PRESETS = PIN_Y.flatMap(([yAt, yLabel]) => PIN_X.map(([xAt, xLabel]) => ({
  label: `${yLabel} ${xLabel.toLowerCase()}`,
  x: { at: xAt, px: xAt === 'center' ? 0 : 12 },
  y: { at: yAt, px: yAt === 'center' ? 0 : 12 },
})));

const clampOrder = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

const clampOffset = (value) => {
  const px = Math.round(Number(value));
  if (!Number.isFinite(px)) return 0;
  return Math.max(-PIN_MAX_OFFSET, Math.min(PIN_MAX_OFFSET, px));
};

/**
 * A stored settings blob, made safe to read.
 *
 * An unknown tile id is dropped rather than kept: it is a tile this build does not know how to
 * compute, and carrying it forward would render an empty box. A known tile that is ABSENT gets
 * its default back, so a blob written by an older build gains the new tiles switched off rather
 * than losing the ones it had.
 */
export function normalizeCardSettings(input) {
  const raw = input && typeof input === 'object' ? input : {};

  const read = (list, catalog, allowed, defaults, fallbackSpan) => {
    const stored = Array.isArray(list) ? list : [];
    const byId = new Map(catalog.map((entry) => [entry.id, entry]));
    const seen = new Map();
    stored.forEach((entry, index) => {
      const id = String(entry?.id || '');
      if (!byId.has(id) || seen.has(id)) return;
      seen.set(id, {
        id,
        region: allowed.has(String(entry?.region)) ? String(entry.region) : defaults[0].region,
        span: SPAN_IDS.includes(String(entry?.span)) ? String(entry.span) : fallbackSpan,
        order: clampOrder(entry?.order, index + 1),
        // Carried verbatim; panelConfigOf sanitizes on the way out, where the vocabulary lives.
        ...(entry?.config && typeof entry.config === 'object' ? { config: entry.config } : {}),
      });
    });
    // Anything the blob never mentioned. Something that has always been on the card gets its
    // place back; something new defaults to off, because no card has ever shown it.
    catalog.forEach((entry, index) => {
      if (seen.has(entry.id)) return;
      const fallback = defaults.find((item) => item.id === entry.id);
      seen.set(entry.id, fallback
        ? { ...fallback }
        : { id: entry.id, region: 'off', span: fallbackSpan, order: 100 + index });
    });
    return [...seen.values()];
  };

  return {
    v: 1,
    tiles: read(raw.tiles, TILE_CATALOG, TILE_REGIONS, DEFAULT_TILE_LAYOUT, 'sm'),
    panels: read(raw.panels, PANEL_CATALOG, PANEL_REGIONS, DEFAULT_PANEL_LAYOUT, 'md'),
    // Buttons have no catalogue -- the company invents them -- so they are read as they are,
    // minus anything with no id, which could never be edited or pressed again.
    buttons: (Array.isArray(raw.buttons) ? raw.buttons : [])
      .map((button, index) => normalizeCardButton(button, index))
      .filter((button) => button.id),
  };
}

/**
 * Where a field sits. Absent means the behaviour every card already had.
 *
 * Long text has always had its own panel rather than a slot in the summary line, and a button
 * opens in the header, beside Edit info -- which is where somebody looks for something to press,
 * and means a new button is useful before anybody has dragged anything.
 */
/**
 * Placement reads the same off a field and off a button.
 *
 * A FIELD keeps its placement under `config`, because that is the jsonb column it is stored in.
 * A BUTTON is not a field and has no config column -- it is a card object, so its placement sits
 * at the top level. One accessor rather than two sets of helpers.
 */
const placementOf = (item) => (item?.config && typeof item.config === 'object' ? item.config : item || {});

export function cardRegionOf(field) {
  const place = String(placementOf(field).card || '');
  if (REGION_IDS.includes(place)) return place;
  if (field?.kind === 'button') return 'header';
  return field?.type === 'textarea' ? 'detail' : 'summary';
}

/**
 * How wide a field is. Absent means the width its region has always drawn.
 *
 * Long text fills the row, because a paragraph in a quarter-width box is a column of single
 * words. A pinned element is out of the flow entirely, so a span would mean nothing.
 */
export function cardSpanOf(field) {
  if (cardRegionOf(field) === 'pin') return 'sm';
  const span = String(placementOf(field).cardSpan || '');
  if (SPAN_IDS.includes(span)) return span;
  return field?.type === 'textarea' ? 'xl' : 'sm';
}

const cardOrderOf = (field, index) => clampOrder(placementOf(field).cardOrder, index + 1);

/**
 * A field's stored pin, made safe. null unless the field is actually pinned.
 *
 * Every part falls back rather than rejecting the pin: a blob with a misspelt anchor should put
 * the button somewhere findable, not drop it off the card where nobody can drag it back.
 */
export function cardPinOf(field) {
  if (cardRegionOf(field) !== 'pin') return null;
  const raw = placementOf(field).pin;
  const pin = raw && typeof raw === 'object' ? raw : {};
  const z = Math.round(Number(pin.z));
  return {
    anchor: ANCHOR_IDS.includes(String(pin.anchor)) ? String(pin.anchor) : 'card',
    x: {
      at: PIN_X_IDS.includes(String(pin.x?.at)) ? String(pin.x.at) : 'left',
      px: clampOffset(pin.x?.px),
    },
    y: {
      at: PIN_Y_IDS.includes(String(pin.y?.at)) ? String(pin.y.at) : 'top',
      px: clampOffset(pin.y?.px),
    },
    z: Number.isFinite(z) ? Math.max(1, Math.min(99, z)) : 1,
  };
}

/** The columns a span is worth, for the renderer's inline custom property. */
export function spanColumns(span) {
  return CARD_SPANS.find(([id]) => id === span)?.[2] || 1;
}

/** Which regions this element is allowed in, so the settings tab cannot offer a nonsense one. */
export function regionsFor(entry) {
  if (entry.kind === 'tile') return CARD_REGIONS.filter(([id]) => TILE_REGIONS.has(id));
  if (entry.kind === 'panel') return CARD_REGIONS.filter(([id]) => PANEL_REGIONS.has(id));
  if (entry.kind === 'button') return CARD_REGIONS.filter(([id]) => BUTTON_REGIONS.has(id));
  // A plain field is never pinned: content belongs on a shelf, so the card keeps a shape.
  return CARD_REGIONS.filter(([id]) => id !== 'pin');
}

/**
 * Every element of the card, in one flat list, ready to be grouped.
 *
 * Fields and tiles are interleaved by `order` within a region, which is what lets a rating tile
 * sit between two built-ins: they are one list once they are here, and where they are STORED
 * stops mattering the moment they are read.
 */
export function cardElements(fields, settings) {
  const safe = normalizeCardSettings(settings);
  const list = [];
  (fields || []).forEach((field, index) => {
    if (!field) return;
    list.push({
      key: `field:${field.id}`,
      kind: 'field',
      field,
      label: String(field.label || ''),
      region: cardRegionOf(field),
      span: cardSpanOf(field),
      order: cardOrderOf(field, index),
    });
  });
  safe.buttons.forEach((button, index) => {
    // `kind` on the button itself, so cardRegionOf can tell it from a field without being handed
    // a type it does not have.
    const shaped = { ...button, kind: 'button' };
    list.push({
      key: `button:${button.id}`,
      kind: 'button',
      button,
      label: button.label,
      region: cardRegionOf(shaped),
      span: cardSpanOf(shaped),
      order: cardOrderOf(shaped, index),
      pin: cardPinOf(shaped),
    });
  });
  safe.tiles.forEach((entry) => {
    const tile = TILE_BY_ID.get(entry.id);
    if (!tile) return;
    list.push({
      key: `tile:${entry.id}`,
      kind: 'tile',
      tile,
      label: tile.label,
      region: entry.region,
      span: entry.span,
      order: entry.order,
    });
  });
  safe.panels.forEach((entry) => {
    const panel = PANEL_BY_ID.get(entry.id);
    if (!panel) return;
    list.push({
      key: `panel:${entry.id}`,
      kind: 'panel',
      panel,
      label: panel.label,
      region: entry.region,
      span: entry.span,
      order: entry.order,
      config: panelConfigOf(entry),
    });
  });
  return list;
}

/**
 * The card, grouped by region and sorted the way it will be drawn.
 *
 * Every region is present even when empty, so a renderer can walk them without checking -- an
 * empty region draws nothing, which is the correct outcome for a card somebody stripped back
 * to a name and a phone number.
 */
export function groupByRegion(elements) {
  const out = {};
  REGION_IDS.forEach((id) => { out[id] = []; });
  elements.forEach((element) => {
    const region = REGION_IDS.includes(element.region) ? element.region : 'off';
    out[region].push(element);
  });
  REGION_IDS.forEach((id) => {
    out[id].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  });
  return out;
}

/** The whole card in one call, which is what the renderer and the settings preview both want. */
export function buildCardLayout(fields, settings) {
  return groupByRegion(cardElements(fields, settings));
}

/**
 * Which anchors at least one live pin names.
 *
 * This is the whole reason no fallback chain is needed. An anchor a pin names is ALWAYS emitted
 * by renderCard, on every contact -- so a button pinned to the details grid does not teleport to
 * the footer the moment somebody opens a contact who has no details filled in. The alternative,
 * a chain of "if the anchor is missing, try the next one", is how a button ends up somewhere
 * nobody put it.
 */
export function anchorsInUse(elements) {
  const used = new Set();
  elements.forEach((element) => {
    if (element.kind !== 'button' || element.region !== 'pin') return;
    used.add(element.pin?.anchor || 'card');
  });
  return used;
}

/**
 * Pins grouped by the anchor they hang in, sorted the way they will paint.
 *
 * Every anchor key present even when empty, so the renderer can ask for one without checking.
 */
export function pinsByAnchor(elements) {
  const out = {};
  ANCHOR_IDS.forEach((id) => { out[id] = []; });
  elements.forEach((element) => {
    if (element.kind !== 'button' || element.region !== 'pin') return;
    const anchor = ANCHOR_IDS.includes(element.pin?.anchor) ? element.pin.anchor : 'card';
    out[anchor].push(element);
  });
  ANCHOR_IDS.forEach((id) => {
    out[id].sort((a, b) => (a.pin?.z || 1) - (b.pin?.z || 1)
      || a.order - b.order
      || a.label.localeCompare(b.label));
  });
  return out;
}

/**
 * The inline custom properties a pinned button carries.
 *
 * Deliberately returns NO left/top/position. Which inset each value lands on is decided in CSS,
 * by attribute selectors against data-pin-x / data-pin-y -- which is what lets one media query
 * switch the entire mechanism off with `position: static` on a narrow screen. Inline positioning
 * could not be turned off that way without !important stacking.
 */
export function pinStyle(pin) {
  const safe = pin && typeof pin === 'object' ? pin : {};
  const x = PIN_X_IDS.includes(String(safe.x?.at)) ? String(safe.x.at) : 'left';
  const y = PIN_Y_IDS.includes(String(safe.y?.at)) ? String(safe.y.at) : 'top';
  const z = Number.isFinite(Number(safe.z)) ? Math.max(1, Math.min(99, Math.round(Number(safe.z)))) : 1;
  return {
    vars: {
      '--pin-x': `${clampOffset(safe.x?.px)}px`,
      '--pin-y': `${clampOffset(safe.y?.px)}px`,
      '--pin-z': String(z),
    },
    x,
    y,
  };
}

/**
 * Nudge a pin by a pointer delta, in CSS px, in SCREEN direction.
 *
 * The sign flips for a right- or bottom-anchored pin, because its offset is an INSET from that
 * edge: without this, dragging a right-anchored button to the right would send it left, which
 * is the single most disorienting thing a drag can do.
 *
 * Returns a NEW pin; never mutates.
 */
export function movePin(pin, dx, dy) {
  const safe = cardPinOf({ type: 'button', config: { card: 'pin', pin } });
  const stepX = Number(dx) || 0;
  const stepY = Number(dy) || 0;
  return {
    ...safe,
    x: { ...safe.x, px: clampOffset(safe.x.px + (safe.x.at === 'right' ? -stepX : stepX)) },
    y: { ...safe.y, px: clampOffset(safe.y.px + (safe.y.at === 'bottom' ? -stepY : stepY)) },
  };
}

const areaOf = (rect) => Math.max(0, Number(rect?.width) || 0) * Math.max(0, Number(rect?.height) || 0);
const centreOf = (rect) => ({
  x: (Number(rect?.left) || 0) + (Number(rect?.width) || 0) / 2,
  y: (Number(rect?.top) || 0) + (Number(rect?.height) || 0) / 2,
});

/**
 * What a drop MEANS: anchor, reference point and offset, derived from geometry.
 *
 * The user never chooses an anchor -- they drag a button to a place, and this works out what
 * that place was. Gluing it to the smallest box that contains it is what makes the result
 * survive: a button dropped in the top-right of the header is anchored to the HEADER, so it
 * stays in the header's top-right on a contact whose card is twice as tall.
 *
 * INVERTIBLE against the CSS: feeding this output through pinStyle paints the button where it
 * was dropped. That round trip is the load-bearing unit test.
 */
export function pinFromRects(pinRect, anchorRects, opts = {}) {
  const snap = Number(opts.snap) > 0 ? Number(opts.snap) : PIN_SNAP;
  const magnet = Number(opts.magnet) >= 0 ? Number(opts.magnet) : PIN_MAGNET;
  const rects = (anchorRects || []).filter((rect) => rect && ANCHOR_IDS.includes(String(rect.id)));
  const centre = centreOf(pinRect);

  const contains = rects.filter((rect) => centre.x >= rect.left && centre.x <= rect.left + rect.width
    && centre.y >= rect.top && centre.y <= rect.top + rect.height);
  let anchor = contains.sort((a, b) => areaOf(a) - areaOf(b))[0];
  if (!anchor) {
    // Degenerate input only -- 'card' contains everything on a real card. Nearest by centre,
    // so a pin dropped just outside still lands somewhere sensible rather than nowhere.
    anchor = [...rects].sort((a, b) => {
      const ca = centreOf(a);
      const cb = centreOf(b);
      return ((ca.x - centre.x) ** 2 + (ca.y - centre.y) ** 2)
        - ((cb.x - centre.x) ** 2 + (cb.y - centre.y) ** 2);
    })[0];
  }
  if (!anchor) return cardPinOf({ type: 'button', config: { card: 'pin', pin: {} } });

  const settle = (px) => (Math.abs(px) < magnet ? 0 : Math.round(px / snap) * snap);

  const third = (value, start, size) => {
    if (!size) return 'left';
    const ratio = (value - start) / size;
    if (ratio < 1 / 3) return 'left';
    return ratio < 2 / 3 ? 'center' : 'right';
  };

  const xAt = third(centre.x, anchor.left, anchor.width);
  const yAtRatio = third(centre.y, anchor.top, anchor.height);
  const yAt = yAtRatio === 'left' ? 'top' : yAtRatio === 'right' ? 'bottom' : 'center';

  const pinLeft = Number(pinRect?.left) || 0;
  const pinTop = Number(pinRect?.top) || 0;
  const pinRight = pinLeft + (Number(pinRect?.width) || 0);
  const pinBottom = pinTop + (Number(pinRect?.height) || 0);

  const xPx = xAt === 'left'
    ? pinLeft - anchor.left
    : xAt === 'right'
      ? (anchor.left + anchor.width) - pinRight
      : centre.x - centreOf(anchor).x;
  const yPx = yAt === 'top'
    ? pinTop - anchor.top
    : yAt === 'bottom'
      ? (anchor.top + anchor.height) - pinBottom
      : centre.y - centreOf(anchor).y;

  return cardPinOf({
    type: 'button',
    config: {
      card: 'pin',
      pin: {
        anchor: String(anchor.id),
        x: { at: xAt, px: settle(xPx) },
        y: { at: yAt, px: settle(yPx) },
        z: Number(opts.z) || 1,
      },
    },
  });
}

/**
 * Advisory warnings for the settings tab. NEVER blocking -- freestyle means freestyle.
 *
 * Somebody may genuinely want two buttons stacked, or one over the name. These say so out loud
 * so it is a choice rather than a surprise, and then get out of the way.
 */
export function pinWarnings(elements) {
  const out = [];
  const pinned = elements.filter((element) => element.kind === 'button' && element.region === 'pin');

  pinned.forEach((a, index) => {
    pinned.slice(index + 1).forEach((b) => {
      if (a.pin?.anchor !== b.pin?.anchor) return;
      if (a.pin?.x.at !== b.pin?.x.at || a.pin?.y.at !== b.pin?.y.at) return;
      if (Math.abs(a.pin.x.px - b.pin.x.px) > PIN_SNAP) return;
      if (Math.abs(a.pin.y.px - b.pin.y.px) > PIN_SNAP) return;
      out.push({ key: `overlap:${a.key}:${b.key}`, text: `${a.label} and ${b.label} are on top of each other.` });
    });
  });

  pinned.forEach((element) => {
    const pin = element.pin;
    if (pin?.anchor === 'head' && pin.y.at === 'center' && (pin.x.at === 'left' || pin.x.at === 'center')) {
      out.push({ key: `overname:${element.key}`, text: `${element.label} sits over the contact's name.` });
    }
  });

  return out;
}

/**
 * Reading order for the narrow-screen fallback: top to bottom, then left to right.
 *
 * Banded, so two pins three pixels apart vertically are treated as one row rather than as two.
 * The renderer emits pins in this order, which means the phone layout -- where CSS stops
 * positioning entirely -- reads the same way the desktop card scans.
 */
export function readingOrder(pins) {
  const anchorRank = (pin) => {
    const at = ANCHOR_IDS.indexOf(pin?.anchor);
    return at < 0 ? 0 : at;
  };
  // Bottom-anchored sorts last, centre in the middle: the offset alone cannot say which, because
  // 12px from the top and 12px from the bottom are opposite ends of the same box.
  const yRank = (pin) => {
    const px = Number(pin?.y?.px) || 0;
    if (pin?.y?.at === 'bottom') return 10000 - px;
    if (pin?.y?.at === 'center') return 5000 + px;
    return px;
  };
  const xRank = (pin) => {
    const px = Number(pin?.x?.px) || 0;
    if (pin?.x?.at === 'right') return 10000 - px;
    if (pin?.x?.at === 'center') return 5000 + px;
    return px;
  };
  return [...(pins || [])].sort((a, b) => anchorRank(a.pin) - anchorRank(b.pin)
    || Math.round(yRank(a.pin) / 40) - Math.round(yRank(b.pin) / 40)
    || xRank(a.pin) - xRank(b.pin)
    || String(a.label).localeCompare(String(b.label)));
}

/**
 * Move an element to a new position in the flat ordering.
 *
 * Reordering writes a fresh 1..n sequence across the whole list rather than nudging one number.
 * Gaps and ties are how a drag lands a row somewhere it visibly did not go, and a renumber on
 * every move is cheap when the list is a dozen rows.
 */
export function reorderElements(elements, fromKey, toKey) {
  const from = elements.findIndex((element) => element.key === fromKey);
  const to = elements.findIndex((element) => element.key === toKey);
  if (from < 0 || to < 0 || from === to) return elements;
  const next = [...elements];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((element, index) => ({ ...element, order: index + 1 }));
}

/**
 * A reordered/edited element list, split back into the two stores it came from.
 *
 * The counterpart to cardElements, and the answer to "one flat list, two stores": the settings
 * tab edits one list because that is the only way the ordering can interleave a tile and a
 * field, and this is what puts each half back where it is written from.
 *
 * `fields` is keyed by field id and carries only the placement keys, so a caller merges it into
 * each field's existing config rather than replacing one.
 */
export function splitStores(elements) {
  const fields = {};
  const tiles = [];
  // panelRows, not `panels`: a bare `panels` here is picked up by the extracted-module-reference
  // guard as a module-level name and collides with something main.js calls.
  const panelRows = [];
  const buttons = [];
  elements.forEach((element) => {
    if (element.kind === 'tile') {
      tiles.push({
        id: element.tile.id,
        region: TILE_REGIONS.has(element.region) ? element.region : 'off',
        span: SPAN_IDS.includes(element.span) ? element.span : 'sm',
        order: clampOrder(element.order, tiles.length + 1),
      });
      return;
    }
    if (element.kind === 'panel') {
      panelRows.push({
        id: element.panel.id,
        region: PANEL_REGIONS.has(element.region) ? element.region : 'off',
        span: SPAN_IDS.includes(element.span) ? element.span : 'md',
        order: clampOrder(element.order, panelRows.length + 1),
        ...(element.config && Object.keys(element.config).length ? { config: element.config } : {}),
      });
      return;
    }
    if (element.kind === 'button') {
      const region = BUTTON_REGIONS.has(element.region) ? element.region : 'header';
      buttons.push(normalizeCardButton({
        ...element.button,
        card: region,
        cardSpan: SPAN_IDS.includes(element.span) ? element.span : 'sm',
        cardOrder: clampOrder(element.order, buttons.length + 1),
        // A pin is written only when it IS the live placement, so moving a button back onto a
        // shelf leaves no coordinates behind to surprise whoever pins it again later.
        ...(region === 'pin' ? { pin: cardPinOf({ kind: 'button', card: 'pin', pin: element.pin }) } : { pin: undefined }),
      }, buttons.length));
      return;
    }
    if (!element.field?.id) return;
    const region = REGION_IDS.includes(element.region) && element.region !== 'pin' ? element.region : 'summary';
    fields[element.field.id] = {
      card: region,
      cardSpan: SPAN_IDS.includes(element.span) ? element.span : 'sm',
      cardOrder: clampOrder(element.order, 1),
    };
  });
  return { fields, tiles, panels: panelRows, buttons };
}
