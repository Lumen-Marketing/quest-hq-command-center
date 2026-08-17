// The app dashboard as an arrangement the user owns.
//
// Every widget reads the app's own fields, the same way the fixed dashboard did — a status
// field is the stages, a money field is the total, a date field is the calendar. What
// changes here is that WHICH widgets appear, in what order, and at what width is stored on
// the app instead of hardcoded.
//
// Pure and dependency-free: shapes and arithmetic only, no markup and no DOM. The view
// renders what these return, which is what makes the arrangement testable without a browser.

/** Columns in the dashboard grid. A widget spans 1..4 of them. */
export const DASH_COLUMNS = 4;

/**
 * What can go on a dashboard.
 *
 * `needs` names the kind of field a widget cannot work without, so the catalogue can say
 * "add a Date field first" instead of offering something that renders empty.
 */
export const WIDGET_TYPES = [
  { type: 'metric', label: 'Number', icon: 'ti-number-9', desc: 'One figure — a count, or a total of a field', size: 1, config: true },
  { type: 'stages', label: 'By stage', icon: 'ti-chart-bar', desc: 'A bar per option, with counts', size: 2, config: true, needs: 'option' },
  { type: 'records', label: 'Record list', icon: 'ti-list', desc: 'Records, optionally filtered to one stage', size: 2, config: true },
  { type: 'recent', label: 'Recently active', icon: 'ti-activity', desc: 'What has been touched lately', size: 2, config: true },
  { type: 'calendar', label: 'Calendar', icon: 'ti-calendar', desc: 'This month, from a date field', size: 2, config: true, needs: 'date' },
  { type: 'clock', label: 'Date & time', icon: 'ti-clock-hour-4', desc: "Today's date and a live clock", size: 1, config: false },
  { type: 'note', label: 'Note', icon: 'ti-note', desc: 'A line of text you write', size: 2, config: true },
];

const TYPE_BY_NAME = new Map(WIDGET_TYPES.map((t) => [t.type, t]));
export const widgetMeta = (type) => TYPE_BY_NAME.get(type) || null;

/** Fields whose values are a bounded list, so one bar or chip each stays readable. */
export const OPTION_FIELD_TYPES = ['status', 'category', 'user', 'checkbox'];
export const optionFields = (app) => (app?.fields || []).filter((f) => OPTION_FIELD_TYPES.includes(f.type));
export const dateFieldsOf = (app) => (app?.fields || []).filter((f) => f.type === 'date');
export const numberFields = (app) => (app?.fields || []).filter((f) => ['money', 'number'].includes(f.type));

/**
 * A sub-item field, addressed from the app.
 *
 * A number card totals ONE field, and the field can now live on a sub-item list rather than
 * on the record -- an app whose money is all in its Dailies had nothing to total otherwise.
 * The two live in different id spaces, so a collection field is addressed by a composite key
 * rather than by a bare id that could collide with one of the app's own.
 */
export const COLLECTION_FIELD_PREFIX = 'col:';

export function parseTotalField(id) {
  const raw = String(id || '');
  if (!raw.startsWith(COLLECTION_FIELD_PREFIX)) return { collectionId: '', fieldId: raw };
  const [, collectionId = '', fieldId = ''] = raw.split(':');
  return { collectionId, fieldId };
}

/** Everything a number card can total: the app's own number fields, then every list's. */
export function totalableFields(app) {
  const own = numberFields(app).map((f) => ({ id: f.id, label: f.label }));
  const sub = (app?.collections || []).flatMap((c) => (c.fields || [])
    .filter((f) => ['money', 'number'].includes(f.type))
    .map((f) => ({ id: `${COLLECTION_FIELD_PREFIX}${c.id}:${f.id}`, label: `${c.name} · ${f.label}` })));
  return [...own, ...sub];
}

/** Whether the app has what this widget needs to show anything. */
export function widgetSupported(app, type) {
  const meta = widgetMeta(type);
  if (!meta?.needs) return true;
  if (meta.needs === 'date') return dateFieldsOf(app).length > 0;
  if (meta.needs === 'option') return optionFields(app).length > 0;
  return true;
}

let seq = 0;
const nextId = () => `w${(seq += 1)}${Math.abs(Date.now() % 100000)}`;

/**
 * A widget with every field present and in range.
 *
 * Size is clamped rather than rejected: a hand-edited or older document holding size 9 should
 * render full width, not disappear.
 */
export function normalizeWidget(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  const meta = widgetMeta(raw.type);
  const type = meta ? raw.type : 'metric';
  const size = Number(raw.size);
  return {
    id: String(raw.id || makeId()),
    type,
    size: Math.min(DASH_COLUMNS, Math.max(1, Number.isFinite(size) ? Math.round(size) : (widgetMeta(type)?.size || 1))),
    config: raw.config && typeof raw.config === 'object' ? { ...raw.config } : {},
  };
}

export function normalizeDashboard(list, makeId = nextId) {
  return Array.isArray(list) ? list.map((w) => normalizeWidget(w, makeId)) : null;
}

/**
 * What an app shows before anybody arranges it.
 *
 * Deliberately the same four figures and two panels the fixed dashboard had, so turning this
 * on changes nothing until somebody chooses to change it. Widgets whose field is missing are
 * left out rather than added empty.
 */
export function defaultDashboard(app, makeId = nextId) {
  const money = numberFields(app)[0];
  const stage = optionFields(app).find((f) => f.type === 'status') || optionFields(app)[0];
  const widgets = [
    { type: 'metric', size: 1, config: { metric: 'count' } },
    ...(money ? [{ type: 'metric', size: 1, config: { metric: 'sum', fieldId: money.id } }] : []),
    { type: 'metric', size: 1, config: { metric: 'added' } },
    { type: 'metric', size: 1, config: { metric: 'touched' } },
    ...(stage ? [{ type: 'stages', size: 2, config: { fieldId: stage.id } }] : []),
    { type: 'recent', size: 2, config: { limit: 6 } },
  ];
  return widgets.map((w) => normalizeWidget(w, makeId));
}

/** The arrangement to render: the app's own, or the default when it has never been changed. */
export function dashboardFor(app, makeId = nextId) {
  return Array.isArray(app?.dashboard) ? app.dashboard.map((w) => normalizeWidget(w, makeId)) : defaultDashboard(app, makeId);
}

// ---- arrangement -------------------------------------------------------------------------

/** Move a widget one place earlier or later. Returns a new array; out of range is a no-op. */
export function moveWidget(widgets, id, direction) {
  const list = [...widgets];
  const at = list.findIndex((w) => w.id === id);
  const to = at + (direction === 'up' ? -1 : 1);
  if (at === -1 || to < 0 || to >= list.length) return list;
  [list[at], list[to]] = [list[to], list[at]];
  return list;
}

/**
 * Move a widget to where another one sits — what a drag-and-drop does.
 *
 * A move, not a swap: dragging a card past three others should leave those three in order,
 * shifted by one. Swapping would scramble them, which is only invisible when the two cards
 * happen to be neighbours.
 */
export function reorderWidget(widgets, id, targetId) {
  const list = [...widgets];
  if (id === targetId) return list;
  const from = list.findIndex((w) => w.id === id);
  const to = list.findIndex((w) => w.id === targetId);
  if (from === -1 || to === -1) return list;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return list;
}

/**
 * Resize one card. Touches `size` and nothing else.
 *
 * It deliberately does NOT re-normalize. This function is shared with the record layout, whose
 * types -- fields, comments, meta, collection -- are not widget types at all. normalizeWidget
 * did not recognise them and rewrote `type` to 'metric'; the record page's own normalizeBlock
 * then did not recognise 'metric' either and rewrote it again to 'fields'. So resizing a
 * Comments card turned it into a field group, and a Sub-items card lost its list. Only 'note'
 * survived, because it is the one name in both tables, and 'fields' survived by luck by
 * round-tripping through the two fallbacks.
 *
 * moveWidget, reorderWidget and removeWidget were always safe to share -- they touch order and
 * identity only. This one claimed to and did not.
 *
 * A size that is not a number leaves the card as it was, rather than snapping it to a default
 * width belonging to a type table this function must not consult.
 */
export function resizeWidget(widgets, id, size) {
  const next = Math.round(Number(size));
  return widgets.map((w) => (w.id === id
    ? { ...w, size: Number.isFinite(next) ? Math.min(DASH_COLUMNS, Math.max(1, next)) : w.size }
    : w));
}

export function removeWidget(widgets, id) {
  return widgets.filter((w) => w.id !== id);
}

export function addWidget(widgets, type, app, makeId = nextId) {
  const meta = widgetMeta(type);
  if (!meta) return widgets;
  const config = {};
  // Seed the config with the obvious field so a new widget shows something immediately
  // rather than landing blank and needing a second trip through the settings.
  if (type === 'stages') config.fieldId = (optionFields(app).find((f) => f.type === 'status') || optionFields(app)[0])?.id || '';
  if (type === 'calendar') config.fieldId = dateFieldsOf(app)[0]?.id || '';
  if (type === 'metric') config.metric = 'count';
  if (type === 'recent') config.limit = 6;
  if (type === 'records') config.limit = 6;
  return [...widgets, normalizeWidget({ type, size: meta.size, config }, makeId)];
}

// ---- the figures ---------------------------------------------------------------------------

const dayOf = (value) => String(value || '').slice(0, 10);

/** The number a metric widget shows, plus how to label it. */
export function metricValue(app, config = {}, todayIso = '') {
  const items = app?.items || [];
  const since = (days) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(todayIso)) return '';
    const d = new Date(`${todayIso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
  };
  switch (config.metric) {
    case 'sum': {
      const { collectionId, fieldId } = parseTotalField(config.fieldId);
      if (collectionId) {
        // Every sub-item of that list, across every record -- the caption says how many, so a
        // total of zero can be told apart from a list nobody has filled in.
        const collection = (app?.collections || []).find((c) => c.id === collectionId);
        const field = (collection?.fields || []).find((f) => f.id === fieldId);
        let total = 0;
        let rows = 0;
        items.forEach((it) => (Array.isArray(it.children) ? it.children : []).forEach((child) => {
          if (!child || child.collection !== collectionId) return;
          rows += 1;
          total += Number(child.values?.[fieldId]) || 0;
        }));
        const name = collection ? `${collection.name} · ${field?.label || 'Total'}` : 'Total';
        return { value: total, money: true, label: name, caption: `across ${rows} ${rows === 1 ? 'sub-item' : 'sub-items'}` };
      }
      const field = (app?.fields || []).find((f) => f.id === fieldId);
      const total = items.reduce((n, it) => n + (Number(it.values?.[fieldId]) || 0), 0);
      return { value: total, money: true, label: field?.label || 'Total', caption: `across ${items.length} record${items.length === 1 ? '' : 's'}` };
    }
    case 'added': {
      const cut = since(7);
      const n = cut ? items.filter((it) => dayOf(it.createdAt) >= cut).length : 0;
      return { value: n, label: 'Added this week', caption: 'in the last seven days' };
    }
    case 'touched': {
      const cut = since(7);
      const n = cut ? items.filter((it) => dayOf(it.lastActivityAt || it.updatedAt) >= cut).length : 0;
      return { value: n, label: 'Touched this week', caption: 'edited in the last seven days' };
    }
    default:
      return { value: items.length, label: 'Records', caption: `in ${app?.name || 'this app'}` };
  }
}

/**
 * The records a list widget shows.
 *
 * An empty `value` means every record; a value narrows to one option, which is the
 * "records at this stage" case. Newest-touched first, because a list on a dashboard is
 * answering "what is happening" rather than "what exists".
 */
export function widgetRecords(app, config = {}) {
  const { fieldId = '', value = '', limit = 6 } = config;
  const all = app?.items || [];
  const matched = fieldId && value
    ? all.filter((it) => String(it.values?.[fieldId] ?? '') === String(value))
    : all;
  const sorted = [...matched].sort((a, b) => String(b.lastActivityAt || b.updatedAt || b.createdAt || '')
    .localeCompare(String(a.lastActivityAt || a.updatedAt || a.createdAt || '')));
  const cap = Math.max(1, Math.min(50, Number(limit) || 6));
  return { rows: sorted.slice(0, cap), total: matched.length };
}
