// Moving a FIELD SETUP from one app into another.
//
// ./app-portability.js next door moves a whole app -- records, automations, card layout,
// dashboard, saved views -- into a BRAND NEW app. This is the other half of the same idea and
// deliberately not the same thing: an app that already exists, already has records in it, and
// wants the field list somebody built next door. Nothing here touches records. The fields land
// beside whatever the target already had, so importing can add columns but can never empty one.
//
// Pure: no DOM, no state, no ids of its own except through the makeId it is handed.

export const FIELD_SET_FORMAT = 'quest-hq-fields';
export const FIELD_SET_VERSION = 1;

const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
const str = (v) => String(v == null ? '' : v);
const key = (label) => str(label).trim().toLowerCase();
const isArray = Array.isArray;

/**
 * The file "Export fields" writes.
 *
 * Field definitions only -- no records, no automations, no arrangement. The whole-app download
 * already carries all of that, and a file that quietly brought three hundred records with it
 * would be the wrong answer to "let me reuse this layout".
 *
 * Source ids are kept as they are. They are never installed as-is (see adoptFields), but they
 * are what the references INSIDE the set point at, so stripping them here would break every
 * rollup and button in the file.
 */
export function buildFieldSet(app, fields, { workspaceName = '', exportedAt = '' } = {}) {
  return {
    format: FIELD_SET_FORMAT,
    version: FIELD_SET_VERSION,
    exported_at: str(exportedAt),
    source: { app: str(app?.name), workspace: str(workspaceName) },
    fields: (fields || []).filter(Boolean).map((f) => ({
      id: str(f.id),
      label: str(f.label),
      type: str(f.type),
      required: !!f.required,
      hidden: !!f.hidden,
      config: clone(f.config && typeof f.config === 'object' ? f.config : {}),
    })),
  };
}

/**
 * What a chosen file is offering.
 *
 * A fields file AND a whole .questapp.json are both accepted, because an app bundle already
 * carries a field list: somebody holding last month's backup of an app should not have to
 * install the whole thing -- records and all -- to reuse its five fields.
 *
 * `isKnownType` is passed in rather than imported so this module never has to know the field
 * catalogue. A type this build has never heard of is DROPPED and counted, not coerced to text:
 * a "Signature" field arriving silently as an empty text box is a worse lie than a gap.
 */
export function readFieldSet(parsed, isKnownType = () => true) {
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: "That file doesn't look like a Questbase export." };
  const holder = isArray(parsed.fields)
    ? parsed
    : (parsed.app && isArray(parsed.app.fields) ? parsed.app : null);
  if (!holder) return { ok: false, error: "That file has no field list in it — export one from another app's Fields tab first." };

  const raw = holder.fields.filter((f) => f && typeof f === 'object' && str(f.type));
  const fields = raw.filter((f) => isKnownType(str(f.type))).map((f) => ({
    id: str(f.id),
    label: str(f.label).trim() || 'Field',
    type: str(f.type),
    required: !!f.required,
    hidden: !!f.hidden,
    config: f.config && typeof f.config === 'object' ? clone(f.config) : {},
  }));
  const dropped = raw.length - fields.length;
  if (!fields.length) {
    return {
      ok: false,
      error: dropped
        ? 'None of the fields in that file are types this version knows about.'
        : 'That file has no fields in it.',
    };
  }
  return {
    ok: true,
    dropped,
    source: {
      app: str(parsed.source?.app || holder.name || ''),
      workspace: str(parsed.source?.workspace || ''),
      exportedAt: str(parsed.exported_at || ''),
    },
    fields,
  };
}

/**
 * Which incoming fields the target app ALREADY has, matched on LABEL.
 *
 * "if other field types with the same label is not present or does not exist let it be ... ignore
 * fields that do not match the current." A second Amount landing beside the Amount already
 * holding values is not reuse, it is a mess to clean up. So what an import offers by default is
 * what this app is MISSING, and a field it already has arrives unticked.
 *
 * Label, ignoring case and surrounding space, is what "the same field" means to somebody looking
 * at two apps -- ids are per-app and would match nothing. It is the rule matchedFields already
 * uses to decide what a relationship copies across, down to the first-wins tie-break where the
 * target itself holds two fields sharing a name.
 *
 * Nothing is filtered here: one entry per incoming field, the target's field or null. The dialog
 * needs the whole list so it can SAY what it is leaving out, and so somebody can still bring one
 * in deliberately -- which matters where the labels match but the TYPES do not. An Amount that is
 * text here and money there is a judgement only the person importing can make.
 */
export function presentIn(incoming, existingFields) {
  const mine = new Map();
  (existingFields || []).filter(Boolean).forEach((f) => {
    if (!mine.has(key(f.label))) mine.set(key(f.label), f);
  });
  return (incoming || []).map((f) => {
    const found = f ? mine.get(key(f.label)) : null;
    return found ? { label: str(found.label), type: str(found.type) } : null;
  });
}

/**
 * Config keys that name a field IN THE SAME APP, by field type.
 *
 * This is the whole reason a field set cannot be copied across verbatim. Every id below is
 * about to be reminted, and a reference carried over unchanged would point at the SOURCE app's
 * field -- a rollup that totals nothing, a button whose condition can never come true.
 *
 *   progress         config.source        a checklist here, or link:<relField here>:<field there>
 *   rollup           config.relField      the relationship field here that it aggregates across
 *   button           config.set[].field   fields on this record the button writes
 *                    config.when[].field  fields on this record the button is conditional on
 *                    config.fields[]      fields on this record that travel when it pushes
 *                    config.map[].from    the near half of a hand-written push pair
 *   relationship     config.pull[].to     the near half of a copy-across pair
 *   company_contact  config.pull[].to     same, from the directory
 *   calculation      config.formula       by LABEL, not by id -- {Amount} + {Tax}
 *
 * Everything else in a config names something in ANOTHER app -- targetApp, targetCompany,
 * displayField, identifyField, fixedItem, targetField, pull[].from, map[].to -- and is left
 * exactly as it was. Those still resolve when a layout is reused inside the same account, which
 * is what reusing a layout usually means; where they do not, the builder already says
 * "(no target)" rather than pretending.
 */
export const OWN_FIELD_REFS = {
  progress: ['config.source'],
  rollup: ['config.relField'],
  button: ['config.set[].field', 'config.when[].field', 'config.fields[]', 'config.map[].from'],
  relationship: ['config.pull[].to'],
  company_contact: ['config.pull[].to'],
  calculation: ['config.formula (by label)'],
};

/** Rows whose near half survived, pointed at the new id. */
const keepRows = (rows, prop, own) => (isArray(rows)
  ? rows.filter((row) => row && own(row[prop])).map((row) => ({ ...row, [prop]: own(row[prop]) }))
  : rows);

/**
 * Rewrite a calculation formula for fields that had to be renamed.
 *
 * Formulas name their inputs by LABEL, so a field that arrived as "Amount 2" -- because the
 * target app already had an Amount -- leaves {Amount} reading the target's field instead of the
 * one it came with, which is a total quietly taken over the wrong column. Matching ignores case
 * and surrounding space, the same way the evaluator resolves them.
 */
function rewriteFormula(formula, labelMap) {
  return str(formula).replace(/\{([^}]*)\}/g, (whole, name) => {
    const next = labelMap[key(name)];
    return next ? `{${next}}` : whole;
  });
}

function remapOwnRefs(type, config, own, labelMap) {
  const cfg = { ...(config || {}) };

  if (type === 'progress' && typeof cfg.source === 'string' && cfg.source) {
    if (cfg.source.startsWith('link:')) {
      // link:<relationship field here>:<progress field over there>. Only the near half is
      // reminted; the far half belongs to whatever app the relationship points at.
      const [, relId, linkedId] = cfg.source.split(':');
      const rel = own(relId);
      cfg.source = rel ? `link:${rel}:${str(linkedId)}` : '';
    } else {
      cfg.source = own(cfg.source);
    }
  }
  if (type === 'rollup') cfg.relField = own(cfg.relField);
  if (type === 'calculation' && cfg.formula) cfg.formula = rewriteFormula(cfg.formula, labelMap);
  if (type === 'relationship' || type === 'company_contact') cfg.pull = keepRows(cfg.pull, 'to', own);
  if (type === 'button') {
    cfg.set = keepRows(cfg.set, 'field', own);
    cfg.when = keepRows(cfg.when, 'field', own);
    cfg.map = keepRows(cfg.map, 'from', own);
    if (isArray(cfg.fields)) {
      cfg.fields = cfg.fields.map(own).filter(Boolean);
      // An empty list already means "push everything" to planPush. Leaving the switch on
      // "only these" over a list of none would show a rule the button does not follow.
      if (!cfg.fields.length) cfg.pickFields = false;
    }
  }
  return cfg;
}

/**
 * Prepare a chosen set of fields to be added to an app that already exists.
 *
 * Three things happen, and all three are what stops an import from being a copy-paste:
 *
 *  - Every field gets a FRESH id. Two apps must not share one, and importing the same file
 *    twice has to produce two fields rather than one field twice.
 *  - A label the target already uses is numbered ("Amount 2"), so an import can never silently
 *    merge with a field that only happens to share a name.
 *  - References between the imported fields are re-pointed at the new ids (see OWN_FIELD_REFS).
 *    One that does not resolve -- because that field was left unticked -- is DROPPED rather
 *    than carried across, for the same reason a dangling id is dropped everywhere else: it
 *    renders as a control with nothing in it and no way to tell why.
 */
export function adoptFields(incoming, existingFields, { makeId, sanitizeConfig = (c) => c } = {}) {
  const taken = new Set((existingFields || []).filter(Boolean).map((f) => key(f.label)));
  const idMap = Object.create(null);
  const labelMap = Object.create(null);
  const renamed = [];

  const fields = (incoming || []).filter(Boolean).map((f) => {
    const id = makeId();
    idMap[str(f.id)] = id;
    const wanted = str(f.label).trim() || 'Field';
    let label = wanted;
    if (taken.has(key(label))) {
      let n = 2;
      while (taken.has(key(`${wanted} ${n}`))) n += 1;
      label = `${wanted} ${n}`;
      renamed.push({ from: wanted, to: label });
    }
    taken.add(key(label));
    // Keyed on what it was CALLED in the source app, which is how a formula names it.
    labelMap[key(wanted)] = label;
    return {
      id,
      label,
      type: str(f.type),
      required: !!f.required,
      hidden: !!f.hidden,
      config: sanitizeConfig(f.config && typeof f.config === 'object' ? clone(f.config) : {}),
    };
  });

  // Second pass: every new id exists by now, which is what a reference between two imported
  // fields needs before it can be re-pointed.
  const own = (v) => idMap[str(v)] || '';
  fields.forEach((field) => { field.config = remapOwnRefs(field.type, field.config, own, labelMap); });

  return { fields, renamed };
}
