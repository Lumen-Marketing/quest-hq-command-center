// Moving a LAYOUT from one Form field to another.
//
// The document builder next door lets somebody arrange a page -- a header band, a logo, boxes
// that print the record's own fields -- and that arrangement is work. Rebuilding it by hand in
// the next app is the thing this file exists to stop.
//
// The whole difficulty is one word: `from`. A field element does not store a value, it stores
// the HOST record's field id, and an id means nothing in the app the layout is being carried to.
// So an exported layout writes down the NAME behind every id it uses, and importing looks those
// names up in the app it lands in. Ids travel as a dictionary; labels are what actually travel.
//
// Pure: no DOM, no state, no ids of its own except through the makeId it is handed.

export const DOC_LAYOUT_FORMAT = 'quest-hq-doc-layout';
export const DOC_LAYOUT_VERSION = 1;

const str = (v) => String(v == null ? '' : v);
const key = (label) => str(label).trim().toLowerCase();
const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

/**
 * Every host field a page reads.
 *
 * Both kinds count: a `field` element, which prints the value, and a `shape` filled with a
 * picture from the record's own image field. Missing the second is how a logo band would arrive
 * pointing at an app it had never heard of.
 */
export function layoutFieldRefs(elements) {
  const ids = new Set();
  (elements || []).forEach((el) => { if (el && str(el.from)) ids.add(str(el.from)); });
  return [...ids];
}

/**
 * The file "Export layout" writes.
 *
 * The page and what is on it, and nothing else. Not the saved versions, not an uploaded PDF
 * sitting beside the design, and never the record's values -- a layout is the arrangement, and
 * all of that belongs to the document it came from. It is the same line `buildTemplate` draws,
 * for the same reason: a layout replaces a layout, not a history.
 */
export function buildLayout(doc, hostFields, { from = '', exportedAt = '' } = {}) {
  const byId = new Map((hostFields || []).filter(Boolean).map((f) => [str(f.id), f]));
  const elements = Array.isArray(doc?.elements) ? doc.elements : [];
  return {
    format: DOC_LAYOUT_FORMAT,
    version: DOC_LAYOUT_VERSION,
    exported_at: str(exportedAt),
    source: { from: str(from), title: str(doc?.title) },
    page: clone(doc?.page) || {},
    elements: clone(elements),
    // The dictionary, and the whole reason a layout can travel at all. A field the record has
    // since lost resolves to nothing and is simply left out -- the element that reads it will
    // land unbound either way, which is the honest outcome and the one somebody can fix.
    fields: layoutFieldRefs(elements).map((id) => {
      const f = byId.get(id);
      return f ? { id, label: str(f.label), type: str(f.type) } : null;
    }).filter(Boolean),
  };
}

/**
 * What a chosen file is offering.
 *
 * A layout file, or any object carrying an `elements` array -- a document saved out by hand, a
 * template dumped from the console. Without a dictionary every `from` simply fails to match and
 * lands as an unbound box, which is a worse import but not a broken one.
 */
export function readLayout(parsed) {
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: "That file doesn't look like a Questbase export." };
  const holder = Array.isArray(parsed.elements) ? parsed : (parsed.doc && Array.isArray(parsed.doc.elements) ? parsed.doc : null);
  if (!holder) return { ok: false, error: "That file has no page layout in it — export one from another Form field first." };
  const elements = holder.elements.filter((el) => el && typeof el === 'object');
  if (!elements.length) return { ok: false, error: 'That layout has nothing on the page.' };
  return {
    ok: true,
    source: {
      from: str(parsed.source?.from || ''),
      title: str(parsed.source?.title || ''),
      exportedAt: str(parsed.exported_at || ''),
    },
    page: holder.page && typeof holder.page === 'object' ? clone(holder.page) : {},
    elements: clone(elements),
    fields: Array.isArray(parsed.fields) ? parsed.fields.filter(Boolean) : [],
  };
}

/**
 * Point a layout's field boxes at THIS app's fields, by name.
 *
 * Label, ignoring case and surrounding space -- the same rule the rest of the builder uses to
 * decide two apps mean the same field, down to the first-wins tie-break. An Address box laid out
 * over there finds the Address here without anybody re-picking it.
 *
 * A box whose field this app has not got is NOT dropped. It keeps its place, its size and its
 * styling and comes in unbound, which the editor already draws as a grey "Pick a field" -- so the
 * page arrives whole and the three boxes that need a decision are the three that look like they
 * do. Dropping them would leave holes nobody could explain.
 */
export function adoptLayout(layout, hostFields, makeId) {
  const mine = new Map();
  (hostFields || []).filter(Boolean).forEach((f) => { if (!mine.has(key(f.label))) mine.set(key(f.label), f); });
  const dictionary = new Map((layout?.fields || []).map((f) => [str(f.id), f]));

  const matched = [];
  const unmatched = [];
  const elements = (layout?.elements || []).map((raw) => {
    const el = { ...clone(raw), id: makeId() };
    const from = str(el.from);
    if (!from) return el;
    const was = dictionary.get(from);
    const here = was ? mine.get(key(was.label)) : null;
    if (here) {
      el.from = str(here.id);
      matched.push({ label: str(was.label), type: str(was.type), to: str(here.type) });
    } else {
      el.from = '';
      unmatched.push({ label: was ? str(was.label) : '', kind: str(el.kind) });
    }
    return el;
  });

  return { page: clone(layout?.page) || {}, elements, matched, unmatched };
}

/** The names a page came in wanting and did not find here, each said once. */
export function missingNames(unmatched) {
  return [...new Set((unmatched || []).map((u) => str(u.label)).filter(Boolean))];
}
