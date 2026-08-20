// Copying a field across a relationship.
//
// "On the relationship field add an option where I can copy the data inputted on the other
// field so it will automatically input on it." Picking a linked record fills fields on this
// record from it. The relationship itself still shows whatever its Show field says -- the link
// decides what is DISPLAYED, this mapping decides what is COPIED. They are separate jobs and
// were being asked of one setting.
//
// Pure: types and lists only, no DOM and no state. The config panel uses it to offer sensible
// destinations, and a test can check the compatibility rules without a browser.
//
// Imported ONLY by the lazily-fetched field config UI. readPullRows lives in ./pull-rows.js
// instead, because main.js reads the rows off the DOM synchronously -- importing this module
// there would pull the whole compatibility table into the entry bundle for one small helper.

/**
 * What kind of value a field holds, for deciding what may be copied into what.
 *
 * Grouped by what the value IS rather than by field type, so Phone into Text works (both are
 * a line of text) and Date into Money does not (one is not the other, and copying it would
 * write "2026-08-20" into a currency column).
 */
export const PULL_FAMILY = {
  text: 'text',
  textarea: 'text',
  email: 'text',
  phone: 'text',
  url: 'text',
  location: 'text',
  autonumber: 'text',

  number: 'number',
  money: 'number',
  duration: 'number',
  progress: 'number',
  rating: 'number',
  calculation: 'number',
  rollup: 'number',

  date: 'date',
  created_time: 'date',
  updated_time: 'date',

  status: 'option',
  category: 'option',

  checkbox: 'boolean',
  user: 'user',
  company_contact: 'contact',

  // Everything below had NO family, and a type with no family is refused by canPull -- silently,
  // and by a rule written for a different question. On a copy that meant a field quietly did not
  // fill in. On a MOVE it meant data loss: the record is removed from the app it left, so the
  // photos, the files, the checklist and the spreadsheet went with it and did not arrive.
  //
  // Each of these travels to its OWN kind and to nothing else, which is the whole reason they can
  // travel at all. A file is an object -- or a list of them -- not a string, so widening it into
  // text would write JSON into a text field, which is the shape of bug the activity feed just had.
  file: 'file',
  // A picture is a file that happens to be a picture: the same stored shape, so the two are one
  // family and a photo can land in a File field and the other way about.
  image: 'file',
  checklist: 'checklist',
  sheet: 'sheet',
  form: 'doc',
  // Tags are already handled as "optionish" by translateValue, which maps the labels across and
  // mints any the destination has not got -- that branch was simply unreachable without this line.
  tags: 'option',
};

/**
 * Fields that cannot receive a copy, because nothing is stored on them.
 *
 * A calculation recomputes from its formula and a created-time is stamped by the system, so
 * writing to either is a value that vanishes on the next render -- which reads as the copy
 * having silently failed.
 */
export const COMPUTED_TYPES = ['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time'];

/** A number can land in a text field; text cannot land in a number one. */
const ACCEPTS = {
  text: ['text', 'number', 'date', 'option', 'boolean', 'user', 'contact'],
  number: ['number'],
  date: ['date'],
  option: ['option'],
  boolean: ['boolean'],
  user: ['user'],
  contact: ['contact'],
  // Their own kind only. There is no readable form to widen any of these into: what they store is
  // structure, and structure written into a text field is JSON on somebody's screen.
  file: ['file'],
  checklist: ['checklist'],
  sheet: ['sheet'],
  doc: ['doc'],
};

export function canPull(fromType, toType) {
  const from = PULL_FAMILY[fromType];
  const to = PULL_FAMILY[toType];
  if (!from || !to) return false;
  if (COMPUTED_TYPES.includes(toType)) return false;
  return (ACCEPTS[to] || []).includes(from);
}

/**
 * The fields on `app` that a value from `fromField` could be copied into.
 *
 * The relationship field itself is excluded -- copying a link into its own picker is a loop,
 * not a mapping.
 */
export function pullTargets(app, fromField, relationshipFieldId = '') {
  if (!fromField) return [];
  return (app?.fields || []).filter((field) => field
    && field.id !== relationshipFieldId
    && canPull(fromField.type, field.type));
}

/**
 * Every field the two apps have in common, matched by name.
 *
 * "I want to get all the item/data too with the same fields that I have on my current app."
 * Mapping twelve fields by hand when both apps call them the same thing is work the app can do
 * itself: a Sales deal and a Job both have a Contact, an Address, a Trade and a Contract value,
 * and picking the deal should fill all four.
 *
 * Matched on the LABEL, because that is what "the same field" means to somebody looking at two
 * apps -- ids are per-app and would match nothing. Case and surrounding space are ignored, so
 * "Contract Value" and "contract value " are the same field.
 *
 * A pair is only offered when the value can actually survive the trip, so a Trade category
 * into a Trade text field works and a Start date into a Budget does not.
 */
export function matchedFields(app, targetApp, relationshipFieldId = '') {
  const key = (field) => String(field?.label || '').trim().toLowerCase();
  const mine = new Map();
  // First wins: two fields sharing a label is already ambiguous, and picking the later one
  // would differ from every other place that resolves a field by name.
  (app?.fields || []).forEach((field) => {
    if (!field || field.id === relationshipFieldId) return;
    if (!mine.has(key(field))) mine.set(key(field), field);
  });

  const pairs = [];
  const used = new Set();
  (targetApp?.fields || []).forEach((from) => {
    const to = mine.get(key(from));
    if (!from || !to || used.has(to.id)) return;
    if (!canPull(from.type, to.type)) return;
    used.add(to.id);
    pairs.push({ from: from.id, to: to.id, label: to.label });
  });
  return pairs;
}

/**
 * The mapping actually applied: every shared field, then the hand-written rows on top.
 *
 * Explicit beats automatic. Somebody who wrote a row saying "their Site address into my
 * Address" means it, even where a field called Address exists on both sides.
 */
export function effectivePull(app, targetApp, field) {
  const manual = Array.isArray(field?.config?.pull) ? field.config.pull.filter((p) => p && p.from && p.to) : [];
  if (!field?.config?.pullAll) return manual;
  const taken = new Set(manual.map((pair) => pair.to));
  const auto = matchedFields(app, targetApp, field.id).filter((pair) => !taken.has(pair.to));
  return [...auto.map(({ from, to }) => ({ from, to })), ...manual];
}

/**
 * The Company Contacts directory, shaped like an app so the matching above can read it.
 *
 * A contact's name is not one of the company's configurable fields -- it is the column the
 * directory is built around -- but to somebody looking at the two side by side it is simply a
 * field called Name, and an app field called Name should get it.
 */
export function contactSourceApp(contactFields) {
  return {
    name: 'Company Contacts',
    fields: [{ id: 'name', label: 'Name', type: 'text' }, ...(contactFields || []).filter(Boolean)],
  };
}

/**
 * Which of this app's fields a chosen contact fills in, as [contactFieldId, appFieldId] pairs.
 *
 * "When you select an item on it, it fetches all of the data of that contact with the same
 * field to automatically fill other fields on this app. Fields the contact doesn't have will
 * be left blank."
 *
 * On unless it has been turned off, which is the one way this differs from a relationship. A
 * relationship exists to link two records and copying is an extra thing you might ask it for;
 * a contact picker on a record is already saying "this record is about that person", so having
 * to find a switch before it fills anything in would be a setting for its own sake.
 */
export function contactPullMap(app, contactFields, field) {
  const manual = Array.isArray(field?.config?.pull) ? field.config.pull.filter((p) => p && p.from && p.to) : [];
  const taken = new Set(manual.map((pair) => pair.to));
  const auto = field?.config?.pullAll === false
    ? []
    : matchedFields(app, contactSourceApp(contactFields), field?.id).filter((pair) => !taken.has(pair.to));
  return [...auto, ...manual].map(({ from, to }) => [from, to]);
}
