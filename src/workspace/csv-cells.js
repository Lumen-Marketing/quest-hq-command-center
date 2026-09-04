// What a CSV cell means for a field that does not hold a plain string.
//
// Export renders every cell through the display formatter, so a Tags cell leaves as
// "Roofing, Urgent" and a Checklist as "2/3 (67%): [x] Measure; [ ] Quote". Import used to name
// thirteen of the thirty field types and let the other seventeen fall through to `return s` --
// which is right for text, email, phone and url, and structurally wrong for everything that
// holds an array, an id or a document. A Tags field would end up holding the string
// "Roofing, Urgent" where the renderer asks `Array.isArray` and gets false, so the record read
// as empty while looking populated.
//
// PURE. Text in, stored value out. The awkward part is not the parsing, it is deciding which
// fields a CSV cell may speak for at all -- and that is a list, stated here, rather than a
// default nobody chose.

/**
 * Fields the product works out for itself.
 *
 * A value in the file for one of these is not an input, whatever it looks like. `calculation`
 * was already refused for exactly this reason; the other four are computed the same way and were
 * being written to, which is how an autonumber ends up holding the string "7" and a
 * created-time holds a date somebody typed.
 */
export const COMPUTED_FIELD_TYPES = new Set([
  'calculation', 'rollup', 'autonumber', 'created_time', 'updated_time',
]);

/**
 * Fields a single CSV cell cannot honestly carry.
 *
 * A relationship and a company contact are ids; the export prints the NAME, and a name is not a
 * link -- storing it back produces a reference pointing at nobody. A file, an image, a sheet and
 * a form are documents. A button is a control, not a value.
 *
 * Refusing costs nothing an import could otherwise have kept: an import only ever CREATES
 * records, so there is no existing link being cleared -- only a wrong one not being made.
 */
export const UNIMPORTABLE_FIELD_TYPES = new Set([
  'relationship', 'file', 'image', 'button', 'sheet', 'form', 'company_contact',
]);

/** True when a column matched a real field that still cannot take a value from a CSV. */
export function fieldTakesCsvValue(type) {
  return !COMPUTED_FIELD_TYPES.has(type) && !UNIMPORTABLE_FIELD_TYPES.has(type);
}

/** Split a cell that holds several things. Semicolons first, because the checklist uses them. */
function splitCell(text, separator) {
  return String(text ?? '').split(separator).map((part) => part.trim()).filter(Boolean);
}

/**
 * "Roofing, Urgent" back into the option ids a tags field stores.
 *
 * Matched against the option LABELS, because that is what the file holds -- an id is accepted
 * too, so a hand-written file can use either. A label the field does not offer is dropped rather
 * than minted: importing records is not the moment to invent a new option on a field, and a
 * silent new option is worse than a missing tag somebody can see is missing.
 */
export function parseTagsCell(text, options) {
  const list = Array.isArray(options) ? options : [];
  const byLabel = new Map();
  for (const option of list) {
    const label = String(option?.label ?? '').trim().toLowerCase();
    if (label && !byLabel.has(label)) byLabel.set(label, String(option.id));
  }
  const ids = new Set(list.map((option) => String(option?.id)));
  const out = [];
  for (const part of splitCell(text, ',')) {
    const id = ids.has(part) ? part : byLabel.get(part.toLowerCase());
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

// The counted prefix the exporter puts in front: "2/3 (67%): ". It is a summary of the steps
// that follow, so reading it back would be reading the same fact twice.
const CHECKLIST_PREFIX = /^\s*\d+\s*\/\s*\d+\s*(?:\(\s*\d+\s*%\s*\))?\s*:\s*/;

/**
 * "2/3 (67%): [x] Measure; [ ] Quote" back into the steps a checklist stores.
 *
 * Semicolons separate the steps, which is what the exporter writes; a file that uses commas is
 * read too, since that is what a person types. A step with no box in front of it is an unticked
 * step -- somebody adding a line by hand in a spreadsheet should not have to know the notation.
 */
export function parseChecklistCell(text, makeId) {
  const body = String(text ?? '').replace(CHECKLIST_PREFIX, '');
  const parts = body.includes(';') ? splitCell(body, ';') : splitCell(body, ',');
  const id = typeof makeId === 'function' ? makeId : () => '';
  return parts.map((part) => {
    const box = /^\[\s*([xX✓]?)\s*\]\s*/.exec(part);
    return {
      id: id(),
      label: box ? part.slice(box[0].length).trim() : part,
      done: !!(box && box[1]),
    };
  }).filter((step) => step.label);
}

/** A star rating: a whole number, clamped to what the field offers. */
export function parseRatingCell(text, field) {
  const max = Number(field?.config?.max) || 5;
  const n = Math.round(Number(String(text ?? '').replace(/[^0-9.\-]/g, '')));
  if (!Number.isFinite(n) || n <= 0) return '';
  return Math.min(n, max);
}
