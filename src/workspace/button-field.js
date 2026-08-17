// The Button field: a control on a record that moves it on to another app.
//
// "This field is a button, programmable to manipulate the data list. Set its action, and set
// the condition it becomes enabled on -- or no condition, so it is always active. The action
// passes the record to another company > workspace > app, and if that app has not got the
// fields, the system merges them in."
//
// Two jobs, kept apart because they fail differently:
//
//   conditionMet   -- may this button be pressed on this record?
//   planPush       -- what would pressing it do to the target app?
//
// Pure. No DOM, no state, no writes: the plan is data, so the config panel can describe the
// push in words before anybody presses anything, and a test can check the merge rules without
// a browser. Carrying it out lives in ./button-push.js.

import { PULL_FAMILY, canPull } from './relationship-pull.js';

/**
 * Which source type may land in which destination type, on a push.
 *
 * "All fields with the same data types -- string to string. String to int is prohibited, but
 * int to string is allowed."
 *
 * That rule already existed for the relationship copy, as `canPull`, and this reuses it rather
 * than writing a second table: a number reads perfectly well as text, and text written into a
 * number column is not a copy, it is a corruption. Until now the push ignored types entirely --
 * it matched on the label and carried the value whatever the two fields were -- so "Age" as
 * text landed in "Age" as a number and the target read NaN.
 *
 * The one thing the push can do that a copy cannot is MINT. A name in a text field arriving at
 * a Company Contact field is not a string being forced into an id column: the contact is
 * created (or found) and the field is given its id. So that pair is allowed here and stays
 * refused in `canPull`, which has no way to create anything and would write the words where the
 * id belongs -- the exact bug the option copy had.
 */
export const CONTACT_MINT_FROM = new Set(['text', 'textarea', 'email', 'phone', 'url', 'location', 'autonumber']);

/** 'carry' to copy the value across, 'contact' to file it as a contact first, null to refuse. */
export function pushKind(fromField, toField) {
  if (!fromField || !toField) return null;
  if (toField.type === 'company_contact' && fromField.type !== 'company_contact') {
    return CONTACT_MINT_FROM.has(fromField.type) ? 'contact' : null;
  }
  return canPull(fromField.type, toField.type) ? 'carry' : null;
}

const FAMILY_WORD = {
  text: 'text', number: 'a number', date: 'a date', option: 'a choice',
  boolean: 'yes/no', user: 'a person', contact: 'a contact',
};

/** Why a field the target HAS by name still cannot receive this one, in words. */
export function whyNotPushed(fromField, toField) {
  const label = toField?.label || fromField?.label || 'That field';
  if (COMPUTED_TARGETS.has(toField?.type)) {
    return `${label} works itself out over there, so a value sent into it would vanish on the next render`;
  }
  const from = FAMILY_WORD[PULL_FAMILY[fromField?.type]] || 'that';
  const to = FAMILY_WORD[PULL_FAMILY[toField?.type]] || 'that';
  if (from === to) return `${label} cannot take what this one holds`;
  return `${label} is ${to} there and ${from} here — ${from} cannot become ${to}`;
}

/** Refused as a destination because nothing is stored on them. Mirrors COMPUTED_TYPES. */
const COMPUTED_TARGETS = new Set(['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time']);

/** How a button's condition compares a field against its value. */
export const BUTTON_OPS = [
  ['eq', 'is'],
  ['neq', 'is not'],
  ['filled', 'has any value'],
  ['empty', 'is empty'],
  ['gt', 'is greater than'],
  ['lt', 'is less than'],
];

/**
 * Fields that never travel.
 *
 * "Some fields cannot be graduated or pushed to other apps: the button field, and the other
 * auto fields like the auto number, date created and date updated."
 *
 * They hold nothing a record owns. An auto-number belongs to the app that issued it, a created
 * time belongs to the row it stamped, a calculation recomputes from its own formula, and a
 * button is a control rather than a value. Carrying any of them would write a number into the
 * target that means something else there.
 */
export const NEVER_PUSHED = new Set(['button', 'calculation', 'rollup', 'autonumber', 'created_time', 'updated_time']);

/**
 * ...and fields that can be carried, but never CREATED in the target.
 *
 * A relationship points at items in a particular app. Creating one in the target would either
 * point at an app that workspace cannot see, or quietly point at nothing. Where the target
 * already has a relationship of the same name the value travels; where it has not, the field
 * is left behind rather than manufactured broken.
 */
export const NEVER_CREATED = new Set(['relationship']);

/**
 * The Company Contacts directory, addressed as a destination: `cc-<companyId>`.
 *
 * It is a table of its own rather than an app in the builder doc, so nothing that resolves an
 * app id will ever find it and every caller has to recognise the shape. The same id the
 * contacts card mints for its own seat, so a button pointing AT the directory and a button
 * pressed ON it name it identically.
 */
export const isContactsTarget = (id) => /^cc-/.test(String(id || ''));

const key = (value) => String(value ?? '').trim().toLowerCase();
const isBlank = (value) => value === undefined || value === null || value === ''
  || (Array.isArray(value) && !value.length);

/**
 * The fields of `app` this button may carry.
 *
 * `only` is the button's chosen subset -- "pass all the data, or select specific data". An
 * empty or absent list means all of them, because a button that has never been configured
 * should do the obvious thing rather than nothing.
 */
export function pushableFields(app, buttonFieldId = '', only = null) {
  const chosen = Array.isArray(only) && only.length ? new Set(only) : null;
  return (app?.fields || []).filter((field) => field
    && field.id !== buttonFieldId
    && !NEVER_PUSHED.has(field.type)
    && (!chosen || chosen.has(field.id)));
}

/**
 * Is this button live on this record?
 *
 * No condition means always, which is the default: a button that does nothing until it is
 * configured twice is a button people assume is broken.
 */
export function conditionMet(buttonField, item, app) {
  const config = buttonField?.config || {};
  const rules = Array.isArray(config.when) ? config.when : [];
  const live = rules.filter((rule) => rule && rule.field && rule.op);
  if (!live.length) return true;
  // ALL by default: "enabled when the stage is Won and the price is set" is what somebody
  // listing two conditions usually means, and it is what every button written before this
  // meant, so the absent setting has to keep meaning it.
  //
  // ANY is the other thing people write, and until it existed they wrote it as two rules on one
  // field -- "Status is Hot", "Status is Warm" -- which under ALL can never be true, so the
  // button sat disabled with two conditions on screen that both looked right.
  return config.whenMode === 'any'
    ? live.some((rule) => ruleHolds(rule, item, app))
    : live.every((rule) => ruleHolds(rule, item, app));
}

/**
 * Conditions that can never all hold at once.
 *
 * Two `is` rules on one field under ALL is the mistake this exists to name: it is not a rule
 * somebody would write on purpose, and the button is simply dead. Reported rather than
 * silently corrected -- which of the two they meant is not ours to guess.
 */
export function impossibleConditions(config) {
  if (config?.whenMode === 'any') return [];
  const seen = new Map();
  const clash = new Set();
  (Array.isArray(config?.when) ? config.when : []).forEach((rule) => {
    if (!rule?.field || rule.op !== 'eq' || !String(rule.value ?? '').trim()) return;
    const had = seen.get(rule.field);
    if (had !== undefined && key(had) !== key(rule.value)) clash.add(rule.field);
    else seen.set(rule.field, rule.value);
  });
  return [...clash];
}

function ruleHolds(rule, item, app) {
  const field = (app?.fields || []).find((item2) => item2.id === rule.field);
  const raw = item?.values?.[rule.field];
  const value = readable(field, raw);
  const wanted = String(rule.value ?? '').trim();
  switch (rule.op) {
    case 'filled': return !isBlank(raw);
    case 'empty': return isBlank(raw);
    case 'neq': return key(value) !== key(wanted);
    case 'gt': return Number(value) > Number(wanted);
    case 'lt': return Number(value) < Number(wanted);
    case 'eq':
    default: return key(value) === key(wanted);
  }
}

/**
 * A field's value as a person reads it -- which is what a condition is written against.
 *
 * A stage stores an option id; somebody setting "enabled when the stage is Won" typed Won, and
 * comparing that against `opt-3f2a` would never be true.
 */
export function readable(field, raw) {
  if (isBlank(raw)) return '';
  if (field && ['category', 'status', 'tags'].includes(field.type)) {
    const options = field.config?.options || [];
    const ids = Array.isArray(raw) ? raw : [raw];
    return ids.map((id) => options.find((option) => option.id === id)?.label ?? id).join(', ');
  }
  if (field?.type === 'checkbox') return /^(yes|true|1)$/i.test(String(raw)) ? 'yes' : 'no';
  return typeof raw === 'object' ? '' : String(raw);
}

/**
 * What pressing this button would do to the target app.
 *
 * Returns the pairs that will be carried, the fields that have to be MADE in the target first,
 * and the ones that cannot go at all -- so the config panel can say all three out loud rather
 * than surprising somebody after the fact.
 *
 * Matching is by label, case and surrounding space ignored, exactly as "the same field" means
 * to somebody looking at two apps side by side. A field the target already has is reused even
 * when its type differs, because two fields with one name are one field to the person who
 * named them; the value is translated on the way in.
 *
 * A target marked `fixedFields` does not grow. Company Contacts is the one that is: its field
 * list is the COMPANY'S, arranged once in Settings and shared by every contact, and a button
 * that added a column to it on each press would turn one agreed shape into whatever the last
 * app to send happened to be carrying. Fields it has no home for are reported as skipped, so
 * the config panel says which ones stay behind before anybody presses anything.
 */
export function planPush(sourceApp, targetApp, buttonField) {
  const carrying = pushableFields(sourceApp, buttonField?.id, buttonField?.config?.fields);
  const existing = new Map();
  (targetApp?.fields || []).forEach((field) => {
    if (field && !existing.has(key(field.label))) existing.set(key(field.label), field);
  });

  // Hand-written pairs: "this field here goes into that field there". Named by id on both
  // sides, so renaming either afterwards keeps the mapping rather than quietly breaking it --
  // the opposite trade-off to the label match, and the right one for a pair somebody chose.
  const byId = new Map((targetApp?.fields || []).map((field) => [field.id, field]));
  const mapped = new Map();
  (buttonField?.config?.map || []).forEach((row) => {
    if (!row?.from || !row?.to || mapped.has(row.from)) return;
    const destination = byId.get(row.to);
    if (destination) mapped.set(row.from, destination);
  });

  // Every destination an explicit row has spoken for, worked out BEFORE the loop: a field that
  // happens to share a name with one could otherwise reach it first simply by sitting higher in
  // the field list, and which of the two won would depend on the order somebody dragged them.
  const spokenFor = new Set([...mapped.values()].map((field) => field.id));

  const carry = [];
  const create = [];
  const skipped = [];
  const claimed = new Set();
  carrying.forEach((field) => {
    const chosen = mapped.get(field.id);
    if (chosen) {
      const kind = pushKind(field, chosen);
      if (!kind) { skipped.push({ field, why: whyNotPushed(field, chosen) }); return; }
      // Two fields aimed at one destination is a mistake that would otherwise be invisible:
      // both write, the last one wins, and the first looks like it never travelled.
      if (claimed.has(chosen.id)) {
        skipped.push({ field, why: `${chosen.label} is already being filled by another field` });
        return;
      }
      claimed.add(chosen.id);
      carry.push({
        from: field, to: chosen, made: false, kind, mapped: true,
      });
      return;
    }
    const match = existing.get(key(field.label));
    if (match) {
      // A destination an explicit row has claimed is not also filled by whatever happens to
      // share its name. The row is the deliberate instruction; the name match is the default.
      if (spokenFor.has(match.id)) {
        skipped.push({ field, why: `${match.label} is being filled by a field you mapped to it` });
        return;
      }
      // Sharing a name is no longer enough on its own. Two fields called Age are the same field
      // to the person who named them, but if one holds text and the other a number, carrying it
      // writes a value the destination cannot hold -- so the pair is reported as skipped, with
      // the reason, rather than landing as NaN and looking like the button half-worked.
      const kind = pushKind(field, match);
      if (!kind) {
        skipped.push({ field, why: whyNotPushed(field, match) });
        return;
      }
      carry.push({
        from: field, to: match, made: false, kind,
      });
      return;
    }
    if (NEVER_CREATED.has(field.type)) {
      skipped.push({ field, why: `${targetApp?.name || 'That app'} has no ${field.label} to link into` });
      return;
    }
    if (targetApp?.fixedFields) {
      skipped.push({ field, why: `${targetApp?.name || 'That app'} has no ${field.label}` });
      return;
    }
    // A field the target does not have is CLONED, so its type goes with it and the pair is
    // always a plain carry -- there is no type mismatch to resolve against a field that is
    // about to be made in this one's own image.
    create.push(field);
    carry.push({
      from: field, to: field, made: true, kind: 'carry',
    });
  });

  const blocked = (sourceApp?.fields || [])
    .filter((field) => field && field.id !== buttonField?.id && NEVER_PUSHED.has(field.type))
    .map((field) => field.label);

  return { carry, create, skipped, blocked };
}

/**
 * Is this button configured enough to do anything?
 *
 * It depends entirely on which action it is set to, which is what the first version got wrong:
 * readiness was "has a destination app", so every button set to CHANGE FIELDS was disabled for
 * ever -- including one with no condition at all, which is the case somebody would reasonably
 * expect to be live the moment they made it.
 */
export function buttonReady(field) {
  const config = field?.config || {};
  if (config.action === 'set') {
    return !!config.clearAll || (Array.isArray(config.set) && config.set.some((row) => row && row.field));
  }
  if (config.action === 'link') return !!String(config.href || '').trim();
  return !!config.targetApp;
}

/** Why it is not, in words, for the tooltip on a button nobody can press. */
export function buttonNotReady(field) {
  const action = field?.config?.action;
  if (action === 'set') return 'This button has no fields to change yet.';
  if (action === 'link') return 'This button has no link set yet.';
  return 'This button has no destination set yet.';
}

/**
 * The schemes a button may hand to the browser.
 *
 * An allowlist rather than a blocklist: `javascript:` and `data:` are the two that turn a link
 * into script execution, and a blocklist of two is a blocklist somebody will find a third way
 * around. Everything a person could actually mean by "open this" is here.
 */
export const LINK_SCHEMES = new Set(['http:', 'https:', 'tel:', 'mailto:', 'sms:']);

/**
 * {Field label} filled in from the record, so one button can be "Call this person".
 *
 * Matched by LABEL, case and surrounding space ignored -- the same grammar planPush uses to
 * decide two fields are the same field, so somebody who has used one already knows this.
 *
 * Percent-encoded, because the result is a URL: a tel: with spaces in it still dials, and a
 * query parameter does not break on the ampersand in "Smith & Sons". A brace that matches no
 * field is left exactly as typed rather than blanked -- a href reading `tel:{Mobile}` is a
 * visible mistake, where `tel:` is an invisible one.
 */
export function resolveHref(app, item, href) {
  return String(href || '').replace(/\{([^}]+)\}/g, (whole, label) => {
    const field = (app?.fields || []).find((item2) => key(item2.label) === key(label));
    if (!field) return whole;
    return encodeURIComponent(readable(field, item?.values?.[field.id]));
  });
}

/** Is this safe to hand to the browser? Anything that is not a known scheme is refused. */
export function linkIsSafe(url) {
  try { return LINK_SCHEMES.has(new URL(String(url)).protocol); } catch { return false; }
}

/**
 * What a button set to "change fields on this record" would write.
 *
 * "Set control to other selected fields: change its value, or clear the value of selected
 * fields, or all of the fields."
 *
 * Returns [{ field, value }] against the app's real fields, with '' meaning clear. Clearing
 * everything is a switch rather than a row per field, because listing thirty rows to say
 * "empty this record" is a worse way of saying it.
 *
 * Automatic fields are refused for the same reason they are never pushed: a value written to a
 * calculation or a created-time vanishes on the next render, which reads as the button having
 * silently failed.
 */
export function planSet(app, buttonField) {
  const config = buttonField?.config || {};
  const fields = (app?.fields || []).filter((field) => field
    && field.id !== buttonField?.id
    && !NEVER_PUSHED.has(field.type));
  if (config.clearAll) return fields.map((field) => ({ field, value: '' }));
  const rows = Array.isArray(config.set) ? config.set : [];
  const seen = new Set();
  return rows.reduce((out, row) => {
    const field = fields.find((item) => item.id === row?.field);
    // First row wins: two rows writing one field is a rule nobody can see in the UI.
    if (!field || seen.has(field.id)) return out;
    seen.add(field.id);
    out.push({ field, value: row.value === undefined || row.value === null ? '' : String(row.value) });
    return out;
  }, []);
}

/**
 * One of those writes, turned into what the field actually stores.
 *
 * A category is written by LABEL -- somebody setting "Stage to Won" typed Won -- and matched
 * against that field's own options. A label the field has never heard of writes nothing rather
 * than inventing an option a button press would leave behind for ever.
 */
export function setValueFor(field, value) {
  const wanted = String(value ?? '').trim();
  if (['category', 'status', 'tags'].includes(field.type)) {
    if (!wanted) return field.type === 'tags' ? [] : '';
    const match = (field.config?.options || []).find((option) => key(option.label) === key(wanted));
    if (!match) return null;
    return field.type === 'tags' ? [match.id] : match.id;
  }
  if (field.type === 'checkbox') return /^(yes|true|1|on)$/i.test(wanted);
  if (!wanted) return '';
  if (['number', 'money', 'duration', 'rating', 'progress'].includes(field.type)) {
    const numeric = Number(wanted);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return wanted;
}

/**
 * A field to add to the target app, cloned from the source.
 *
 * A fresh id, because ids are per-app and reusing one would collide with whatever already
 * holds it there. The options of a category come along -- a Trade field with no trades in it
 * cannot be filled in -- but nothing that ties it back to the app it came from.
 */
export function fieldToCreate(field, mintId) {
  const config = { ...(field.config || {}) };
  delete config.pull;
  delete config.pullAll;
  delete config.fields;
  delete config.pickFields;
  delete config.when;
  if (Array.isArray(config.options)) config.options = config.options.map((option) => ({ ...option }));
  return {
    id: mintId(),
    type: field.type,
    label: field.label,
    required: false,
    config,
  };
}

/**
 * One value, moved from the source field into the target field.
 *
 * An option id means nothing in another app, so a category travels as its LABEL and is matched
 * -- or added -- in the destination, the same way the contact copy does it. A file travels as
 * its reference: both records then point at one stored object, which is what "copy the file"
 * means without duplicating it in storage.
 */
export function translateValue(fromField, toField, raw, mintId) {
  if (isBlank(raw)) return { value: Array.isArray(raw) ? [] : '', options: null };
  const optionish = ['category', 'status', 'tags'];
  if (optionish.includes(fromField.type) && optionish.includes(toField.type)) {
    const labels = (Array.isArray(raw) ? raw : [raw])
      .map((id) => (fromField.config?.options || []).find((option) => option.id === id)?.label ?? id)
      .filter((label) => !isBlank(label));
    const options = (toField.config?.options || []).map((option) => ({ ...option }));
    const ids = labels.map((label) => {
      const match = options.find((option) => key(option.label) === key(label));
      if (match) return match.id;
      const made = { id: mintId(), label: String(label), color: '#2563eb' };
      options.push(made);
      return made.id;
    });
    return { value: toField.type === 'tags' ? ids : (ids[0] || ''), options };
  }
  // Into a plain field, the readable form travels rather than an id nobody can resolve.
  if (optionish.includes(fromField.type)) return { value: readable(fromField, raw), options: null };
  return { value: raw, options: null };
}
