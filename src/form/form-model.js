// The Form field: a small document you design once and fill in per record.
//
// Deliberately NOT the Sheet field. A sheet is a grid of anonymous cells addressed A1..Z99; a
// form is a list of NAMED, TYPED fields with a layout of its own. They share only the container
// pattern -- one JSON value in a hidden [data-f] input, edited in a large modal, its modules
// fetched on demand -- and nothing of the grid: no cell addressing, no column sizing, no
// sheet-format reuse. A form that grew cells would just be a worse spreadsheet.
//
// Pure: shapes and arithmetic only, no DOM and no state. The editor renders what these return,
// which is what lets a leap-year date or a broken formula be checked without a browser.

/** What a form field may be. A subset of the App Builder's palette: what a printed document
 *  can actually show, filled in by hand. No relationship, rollup, button or sheet -- each of
 *  those resolves against an app, a record or a grid that a document does not have. */
export const FORM_FIELD_TYPES = [
  'text', 'textarea', 'number', 'money', 'date', 'checkbox',
  'category', 'email', 'phone', 'location', 'calculation',
];

/** Where a field's value comes from. */
export const FORM_SOURCES = ['own', 'record'];

const str = (v) => String(v ?? '').trim();
const key = (v) => str(v).toLowerCase();
const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

/** Page setup a printed document needs, and nothing it does not. */
export const PAGE_SIZES = { a4: [210, 297], letter: [216, 279], legal: [216, 356] };

export function normalizePage(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const size = PAGE_SIZES[raw.size] ? raw.size : 'a4';
  return {
    size,
    landscape: !!raw.landscape,
    // Millimetres, clamped so a margin can never swallow the page it is on.
    margin: Math.min(40, Math.max(0, num(raw.margin, 12))),
  };
}

/**
 * One field of the form.
 *
 * `source` is the half that makes this different from a standalone form builder: `own` means
 * somebody types it here, `record` means it is taken from the record this form sits on. A
 * record-sourced field keeps `from` -- the HOST field's id -- so the document reads live rather
 * than holding a copy that goes stale the moment the record is edited.
 */
export function normalizeFormField(input, makeId) {
  const raw = input && typeof input === 'object' ? input : {};
  const type = FORM_FIELD_TYPES.includes(raw.type) ? raw.type : 'text';
  const source = FORM_SOURCES.includes(raw.source) ? raw.source : 'own';
  return {
    id: str(raw.id) || makeId(),
    label: str(raw.label) || 'Field',
    type,
    // Only meaningful for a record-sourced field; carried either way so toggling back and forth
    // does not lose the pairing somebody already chose.
    source,
    from: str(raw.from),
    config: raw.config && typeof raw.config === 'object' ? { ...raw.config } : {},
  };
}

/**
 * A whole form definition plus the values filled into it.
 *
 * Values are keyed by field id and live beside the definition, because one record holds one
 * filled-in copy of the form: the design is shared, the answers are not.
 */
export function normalizeForm(input, makeId = (() => `f${Math.random().toString(36).slice(2, 8)}`)) {
  const raw = input && typeof input === 'object' ? input : {};
  const fields = (Array.isArray(raw.fields) ? raw.fields : [])
    .filter(Boolean)
    .map((field) => normalizeFormField(field, makeId));
  const ids = new Set(fields.map((field) => field.id));
  const values = {};
  Object.entries(raw.values && typeof raw.values === 'object' ? raw.values : {})
    // A value whose field has been deleted is dropped rather than kept as a ghost that would
    // reappear if a new field ever minted the same id.
    .forEach(([id, value]) => { if (ids.has(id)) values[id] = value; });
  return {
    title: str(raw.title),
    page: normalizePage(raw.page),
    fields,
    values,
    // Blocks come later, from record-layout's model. Absent means "one column, in field order",
    // which is different from "arranged to be empty".
    layout: Array.isArray(raw.layout) ? raw.layout : null,
  };
}

/**
 * The host record's fields this form could pull from, paired with what they would fill.
 *
 * Matched on TYPE, not label: the form's field is already named by whoever designed it, and
 * making them rename it to match the app would defeat the point. A host field that nothing in
 * the form can hold is simply absent from the list.
 */
export function importableFields(form, hostFields) {
  const wanted = new Set(FORM_FIELD_TYPES);
  return (hostFields || []).filter((field) => field && wanted.has(field.type)).map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type,
    // Already claimed by one of the form's own fields, so the editor can show it as taken
    // rather than letting two fields silently read the same source.
    taken: (form?.fields || []).some((entry) => entry.source === 'record' && entry.from === field.id),
  }));
}

/** What one field actually shows: typed in, or read live off the host record. */
export function fieldValue(form, field, hostValues = {}) {
  if (!field) return '';
  if (field.source === 'record') return field.from ? (hostValues[field.from] ?? '') : '';
  return form?.values?.[field.id] ?? '';
}

/**
 * A calculation over the form's own fields.
 *
 * The same `{Label}` grammar the App Builder uses, and the same refusal: only + - * / ( ) and
 * numbers survive the whitelist, so a function name or a stray semicolon renders as nothing
 * rather than being evaluated. A reference to another calculation reads 0 -- calculations hold
 * no stored value -- which is the one mistake that makes a form look right and compute wrong,
 * so it is reported instead.
 */
export function calcRefs(formula) {
  return [...String(formula || '').matchAll(/\{([^}]+)\}/g)].map(([, ref]) => str(ref));
}

export function calcProblems(form) {
  const byLabel = new Map((form?.fields || []).map((field) => [key(field.label), field]));
  const out = [];
  (form?.fields || []).filter((field) => field.type === 'calculation').forEach((field) => {
    calcRefs(field.config?.formula).forEach((ref) => {
      const target = byLabel.get(key(ref));
      if (!target) out.push({ field: field.id, why: `{${ref}} is not a field on this form` });
      else if (target.type === 'calculation') out.push({ field: field.id, why: `{${ref}} is itself a calculation, which reads 0` });
      else if (!['number', 'money'].includes(target.type)) out.push({ field: field.id, why: `{${ref}} is not a number` });
    });
    const bare = String(field.config?.formula || '').replace(/\{[^}]+\}/g, '1');
    if (bare.trim() && !/^[-+*/(). 0-9]+$/.test(bare)) out.push({ field: field.id, why: 'the formula uses something the grammar refuses' });
  });
  return out;
}

/** The number a calculation shows, or null where it cannot be worked out. */
export function calcValue(form, field, hostValues = {}) {
  if (!field || field.type !== 'calculation') return null;
  const byLabel = new Map((form?.fields || []).map((entry) => [key(entry.label), entry]));
  const bare = String(field.config?.formula || '').replace(/\{([^}]+)\}/g, (whole, ref) => {
    const target = byLabel.get(key(ref));

    if (!target || target.type === 'calculation') return '0';
    return String(num(fieldValue(form, target, hostValues), 0));
  });
  // The whitelist runs BEFORE anything is evaluated, so what reaches Function() is digits and
  // + - * / ( ) and nothing else -- the same guard the App Builder's formulas use, and the
  // reason `constructor` or a stray semicolon is refused rather than run.
  if (!bare.trim() || !/^[-+*/(). 0-9]+$/.test(bare)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const out = Function(`"use strict";return (${bare});`)();
    return Number.isFinite(out) ? Math.round(out * 100) / 100 : null;
  } catch { return null; }
}
