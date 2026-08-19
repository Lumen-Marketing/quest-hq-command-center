// Making something from the record you are looking at.
//
// Four tiles, and not one of them adds a column to the app -- Spreadsheet, Form, Image and File
// did, and were removed for it: a spreadsheet made for one job put an empty box on every other
// record for ever.
//
// What is left either makes something ELSEWHERE and points it at this record (a task, a
// scheduled call, a scheduled message) or changes the app deliberately (New Field). Each opens a
// dialog, because all four need something typed before anything can happen.
//
// State is `state.wbQuick`: which dialog, on which record, and whatever has been typed. On state
// rather than in the DOM, because the record page redraws for reasons of its own -- a save, a
// toast, a background sync -- and a half-written message must survive that.
//
// Fetched on the first press: most sessions never open one of these.

import {
  ensureBlock, placeFieldInLayout, quickCreateField, quickEntry,
} from './record-layout.js';
import { opsWorkspaceId } from './ops-workspace-id.js';

// ---- the dialogs ---------------------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0');

/** Tomorrow morning, as the two values a date and a time input want. */
function defaultWhen(now = new Date()) {
  const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: '09:00' };
}

/** Every phone field on the app that this record actually has a number in. */
export function phoneChoices(app, item) {
  return (app?.fields || [])
    .filter((field) => field.type === 'phone' && !field.hidden)
    .map((field) => ({ id: field.id, label: field.label, value: String(item?.values?.[field.id] || '').trim() }))
    .filter((one) => one.value);
}

/**
 * The fields a new one can sit next to, in the order the record shows them.
 *
 * Before/After and WHICH field are two questions now, not one list of every combination. That
 * list was every field twice -- "Before Name", "After Name", "Before Trade", "After Trade" --
 * so an app with twenty fields offered forty options to read through to make one choice.
 */
export function fieldTargets(app) {
  return (app?.fields || []).map((field) => ({ value: field.id, label: field.label, type: field.type }));
}

/** The one string insertFieldAt takes, from the two controls that now choose it. */
export function positionOf(v) {
  // No field to sit next to -- an app with none, or a target that has since been deleted -- is
  // the end rather than a refusal: the field is still wanted, and `end` is where it can go.
  if (!v || v.dir === 'end' || !v.target) return 'end';
  return `${v.dir}:${v.target}`;
}

/** The field list with `made` inserted where `position` says. Pure, so the ordering is testable. */
export function insertFieldAt(fields, made, position) {
  const list = [...(fields || [])];
  const [where, id] = String(position || 'end').split(':');
  const at = id ? list.findIndex((field) => field.id === id) : -1;
  // A position naming a field that has gone falls back to the end rather than to index 0, which
  // is what a bare -1 would do -- silently putting the new field first.
  if (at < 0) { list.push(made); return list; }
  list.splice(where === 'before' ? at : at + 1, 0, made);
  return list;
}

/**
 * The types this dialog can finish.
 *
 * Five are deliberately absent, and they are the ones that arrive DEAD without something the
 * dialog cannot ask for: `calculation` needs a formula, `rollup` and `relationship` need another
 * app to point at, `button` needs a destination in a workspace this dialog has no picker for, and
 * a sourced `progress` needs a checklist to fill from. A field that renders but can never hold a
 * value is worse than one that was not offered -- it looks configured and is not. Those are still
 * made the way they always were, in the app's own field editor.
 */
export const NEW_FIELD_TYPES = [
  'text', 'textarea', 'number', 'money', 'duration', 'checklist', 'date', 'category', 'status',
  'tags', 'rating', 'user', 'company_contact', 'email', 'phone', 'url', 'location', 'file',
  'image', 'sheet', 'form', 'checkbox', 'autonumber', 'created_time', 'updated_time',
];

const CHOICE_TYPES = new Set(['category', 'status', 'tags']);

// Distinct enough to tell apart at a glance, and stable per position so two people typing the
// same list get the same colours.
const OPTION_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#e0552d', '#0891b2', '#64748b', '#E24B4A'];

/**
 * "One per line" rather than a row-per-option editor.
 *
 * The colours are assigned rather than chosen: picking eight of them is not what somebody opening
 * this dialog came to do, and a category whose options are all the same colour reads as one blob.
 * They are editable afterwards in the field editor like any other option.
 */
export function parseOptions(text, makeId = () => Math.random().toString(36).slice(2)) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    // The same label twice would give two options nothing can tell apart, and a formula or a
    // button that names one by label would silently take the first.
    .filter((label, at, all) => all.findIndex((other) => other.toLowerCase() === label.toLowerCase()) === at)
    .map((label, at) => ({ id: makeId(), label, color: OPTION_COLORS[at % OPTION_COLORS.length] }));
}

/** The config a new field needs, from what the dialog collected. */
export function configFor(type, values, makeId) {
  if (CHOICE_TYPES.has(type)) return { options: parseOptions(values.options, makeId) };
  if (type === 'money') return { currency: String(values.currency || '$').trim() || '$' };
  if (type === 'number') return { unit: String(values.unit || '').trim() };
  if (type === 'checklist') {
    const steps = String(values.options || '').split('\n').map((line) => line.trim()).filter(Boolean);
    return steps.length ? { steps } : {};
  }
  return {};
}

/** Why this field cannot be made yet, or ''. */
export function fieldRefusal(type, label, config) {
  if (!String(label || '').trim()) return 'Give the field a name.';
  // A category with no options cannot be filled in at all -- it renders a dropdown with nothing
  // in it, on every record, for ever.
  if (CHOICE_TYPES.has(type) && !(config.options || []).length) return 'A choice field needs at least one option.';
  return '';
}

export const needsOptions = (type) => CHOICE_TYPES.has(type) || type === 'checklist';

/** What is on screen, or null. */
const view = (ctx) => ctx.state.wbQuick || null;

const esc = (h, v) => h(v ?? '');

function shell(h, title, icon, body, busy) {
  return `
    <div class="wb-quick-modal" data-wb-quick-backdrop>
      <div class="wb-quick-dialog" role="dialog" aria-modal="true" aria-labelledby="wbQuickTitle">
        <header>
          <h4 id="wbQuickTitle"><i class="ti ${h(icon)}"></i>${h(title)}</h4>
          <button class="wb-icon-btn" type="button" data-wb-quick-close aria-label="Close"><i class="ti ti-x"></i></button>
        </header>
        <form data-wb-quick-form>${body}
          <div class="wb-quick-acts">
            <button class="btn" type="button" data-wb-quick-close>Cancel</button>
            <button class="btn btn-primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>`;
}

const whenRows = (h, v) => `
  <div class="wb-quick-row">
    <label>Date<input class="wb-input" type="date" name="date" value="${esc(h, v.date)}" required></label>
    <label>Time<input class="wb-input" type="time" name="time" value="${esc(h, v.time)}" required></label>
  </div>`;

/**
 * A dropdown that can show an icon, which a native <select> cannot.
 *
 * Open state lives on `state.wbQuick.open` rather than in the DOM, because the record page
 * redraws for reasons of its own and a list that shut on every repaint could not be used. The
 * chosen value rides on a hidden input, so the dialog still submits as one FormData like
 * everything else here rather than needing a reader of its own.
 */
function picker(h, key, name, value, options, open) {
  const now = options.find((one) => one.value === value) || options[0];
  if (!now) return '';
  const face = (one) => `
    <span class="wb-pick-ic" style="color:${h(one.color || '#64748b')}"><i class="ti ${h(one.icon || 'ti-square')}"></i></span>
    <span class="wb-pick-txt"><b>${h(one.label)}</b>${one.desc ? `<small>${h(one.desc)}</small>` : ''}</span>`;
  return `<div class="wb-pick${open ? ' is-open' : ''}">
    <button type="button" class="wb-pick-btn" data-wb-quick-set="open|${open ? '' : h(key)}"
      aria-haspopup="listbox" aria-expanded="${open ? 'true' : 'false'}">
      ${face(now)}<i class="ti ti-chevron-down wb-pick-arrow"></i>
    </button>
    ${open ? `<div class="wb-pick-list" role="listbox">${options.map((one) => `
      <button type="button" class="wb-pick-opt${one.value === now.value ? ' is-on' : ''}" role="option"
        aria-selected="${one.value === now.value ? 'true' : 'false'}" data-wb-quick-set="${h(key)}|${h(one.value)}">
        ${face(one)}${one.value === now.value ? '<i class="ti ti-check wb-pick-tick"></i>' : ''}
      </button>`).join('')}</div>` : ''}
    <input type="hidden" name="${h(name)}" value="${h(now.value)}">
  </div>`;
}

/** Before / After / At the end, as three buttons: it is one choice of three, not a list. */
const WHERE = [['before', 'Before'], ['after', 'After'], ['end', 'At the end']];

const whereSeg = (h, v) => `<div class="wb-seg" role="group" aria-label="Where it goes">${WHERE.map(([value, label]) => `
  <button type="button" class="wb-seg-btn${v.dir === value ? ' is-on' : ''}" data-wb-quick-set="dir|${value}"
    aria-pressed="${v.dir === value ? 'true' : 'false'}">${h(label)}</button>`).join('')}</div>`;

/** The open dialog, or ''. Rendered by the record page at the end of the Quick Create card. */
export function renderQuickModal(ctx) {
  const v = view(ctx);
  if (!v) return '';
  const { h } = ctx;
  const err = v.error ? `<div class="form-message error">${h(v.error)}</div>` : '';

  if (v.kind === 'field') {
    const types = ctx.WB_FIELD_TYPES || {};
    // Only the ones this dialog can finish. A calculation with no formula or a relationship with
    // no target renders and can never hold a value, which looks configured and is not.
    const typeOpts = NEW_FIELD_TYPES.filter((key) => types[key]).map((key) => ({
      value: key, label: types[key].label, desc: types[key].desc, icon: types[key].icon, color: types[key].color,
    }));
    // The field you are inserting next to, wearing its own type's icon -- the point of a picture
    // here is telling Address from Adjuster at a glance, which two lines of text do not.
    const targetOpts = (v.targets || []).map((one) => ({
      value: one.value, label: one.label, icon: types[one.type]?.icon, color: types[one.type]?.color,
    }));
    const extra = needsOptions(v.type)
      ? `<label class="wb-quick-field">${v.type === 'checklist' ? 'Steps' : 'Options'}<small class="wb-sub">One per line.</small>
          <textarea class="wb-input" name="options" rows="4" placeholder="${v.type === 'checklist' ? 'Measure the roof' : 'Roofing'}">${esc(h, v.options)}</textarea>
        </label>`
      : v.type === 'money'
        ? `<label class="wb-quick-field">Currency<input class="wb-input" name="currency" value="${esc(h, v.currency || '$')}" maxlength="4"></label>`
        : v.type === 'number'
          ? `<label class="wb-quick-field">Unit <small class="wb-sub">Optional — shown after the number.</small><input class="wb-input" name="unit" value="${esc(h, v.unit)}" placeholder="%"></label>`
          : '';
    // Asked in the order it was asked for: what the field IS, then where it goes, then what it
    // is called. `position` is composed rather than chosen, so insertFieldAt still takes the one
    // string it always has.
    return shell(h, 'Add a field to every record', 'ti-plus', `
      ${err}
      <div class="wb-quick-field"><span>Field type</span>
        ${picker(h, 'type', 'type', v.type, typeOpts, v.open === 'type')}
      </div>
      ${extra}
      <div class="wb-quick-field"><span>Where it goes</span>${whereSeg(h, v)}</div>
      ${v.dir === 'end' || !targetOpts.length ? '' : `<div class="wb-quick-field"><span>Which field</span>
        ${picker(h, 'target', 'target', v.target, targetOpts, v.open === 'target')}
      </div>`}
      <label class="wb-quick-field">Field name<input class="wb-input" name="label" value="${esc(h, v.label)}" placeholder="Site visit" required></label>
      <input type="hidden" name="position" value="${h(positionOf(v))}">
      <p class="wb-sub">It is added to this app, so every record gets it — blank until it is filled in. Options, formulas and the rest are set in the field's own editor afterwards.</p>`, v.busy);
  }

  if (v.kind === 'call') {
    const phones = v.phones || [];
    const picked = phones.find((one) => one.value === v.to) || phones[0];
    return shell(h, 'Call', 'ti-phone', `
      ${err}
      ${numberPicker(h, v, phones)}
      ${picked ? `<div class="wb-quick-now">
        <button type="button" class="btn btn-primary" data-wb-call="${h(picked.tel)}" data-wb-call-shown="${h(picked.value)}">
          <i class="ti ti-phone"></i>Call now
        </button>
      </div>` : ''}
      <div class="wb-quick-sec"><b>Or set one for later</b>
        <label class="wb-quick-field">Title<input class="wb-input" name="title" value="${esc(h, v.title)}" placeholder="Follow up" required></label>
        ${whenRows(h, v)}
        <label class="wb-quick-field">Notes<textarea class="wb-input" name="body" rows="3" placeholder="What this call is for">${esc(h, v.body)}</textarea></label>
        <p class="wb-sub">Kept on the record so it shows on the Calls &amp; messages card. Nothing rings
          on its own yet — there is no reminder job — so it is a note of when, not an alarm.</p>
      </div>`, v.busy);
  }


  const phones = v.phones || [];
  return shell(h, 'SMS', 'ti-message-2', `
    ${err}
    <label class="wb-quick-field">Title<input class="wb-input" name="title" value="${esc(h, v.title)}" placeholder="Arrival window" required></label>
    ${numberPicker(h, v, phones, true)}
    <label class="wb-quick-field">Message<textarea class="wb-input" name="body" rows="4" placeholder="Write the message" required>${esc(h, v.body)}</textarea></label>
    ${whenRows(h, v)}
    <p class="wb-sub">Scheduled only. Sending straight away is off until the workspace SMS routing
      is enabled — a Send button now would do nothing in production, so there is not one.</p>`, v.busy);
}

/**
 * Which number, when there is a choice.
 *
 * One picker rather than a control per number: a record with a mobile and an office line is asking
 * WHICH, not asking for two ways to press. With one number there is nothing to choose, so it is
 * stated rather than offered.
 *
 * A message can go to all of them; a call cannot, which is why `all` is asked for rather than
 * assumed.
 */
export const ALL_NUMBERS = '*';

function numberPicker(h, v, phones, all = false) {
  if (!phones.length) return '<p class="wb-sub">This record has no phone number.</p>';
  if (phones.length === 1) return `<p class="wb-sub">To <b>${h(phones[0].value)}</b> (${h(phones[0].label)})</p>`;
  const rows = phones.map((one) => `<option value="${h(one.value)}" ${v.to === one.value ? 'selected' : ''}>${h(one.value)} — ${h(one.label)}</option>`).join('');
  return `<label class="wb-quick-field">Number
    <select class="wb-input" name="to">
      ${all ? `<option value="${ALL_NUMBERS}" ${v.to === ALL_NUMBERS ? 'selected' : ''}>All ${phones.length} numbers</option>` : ''}
      ${rows}
    </select>
  </label>`;
}

/** Open one of the dialogs. Everything it needs is resolved now, not at save time. */
function openQuick(kind, seat, app, item, ctx) {
  const when = defaultWhen();
  const phones = phoneChoices(app, item).map((one) => ({ ...one, tel: `tel:${one.value.replace(/[^\d+]/g, '')}` }));
  const contactField = (app.fields || []).find((one) => one.type === 'company_contact');
  ctx.state.wbQuick = {
    kind,
    seat,
    ...when,
    error: '',
    busy: false,
    ...(kind === 'field' ? {
      type: 'text', label: '', options: '', currency: '$', unit: '',
      // Defaults to AFTER the last field, which is where a new one goes unless somebody says
      // otherwise -- and says it in the words the dialog asks in rather than a separate 'end'.
      dir: (app.fields || []).length ? 'after' : 'end',
      target: (app.fields || []).at(-1)?.id || '',
      targets: fieldTargets(app),
      open: '',
    } : {
      phones,
      to: phones[0]?.value || '',
      // A call made from a record is nearly always the follow-up, so the title is filled in and
      // can be typed over rather than thought up.
      title: kind === 'call' ? 'Follow up' : '',
      body: '',
    }),
  };
  ctx.render();
  return kind;
}

export function closeQuick(ctx) {
  ctx.state.wbQuick = null;
  ctx.render();
}

/**
 * The plain inputs the dialogs own.
 *
 * Everything here is typed into a box and does not reach `state.wbQuick` until Save -- so a
 * redraw, which draws from state, wipes it. Pressing a picker causes a redraw. That is the whole
 * bug: a name typed in, then a type chosen, and the name is gone.
 *
 * A list rather than the whole form because the form also carries `type`, `target` and the
 * composed `position`, and those must lose to the press being handled rather than put back the
 * value that was just changed.
 */
const TYPED = ['label', 'options', 'currency', 'unit', 'title', 'body', 'to', 'date', 'time'];

const keepTyped = (typed) => (typed
  ? Object.fromEntries(TYPED.filter((key) => key in typed).map((key) => [key, typed[key]]))
  : {});

/** Change the type mid-dialog, keeping everything already typed. */
export function setQuickType(type, ctx, typed) {
  const v = view(ctx);
  if (!v || v.kind !== 'field') return;
  ctx.state.wbQuick = { ...v, ...keepTyped(typed), type, open: '', error: '' };
  ctx.render();
}

/**
 * Every control in the New Field dialog that is not a plain input, through one handler.
 *
 * One `data-wb-quick-set="key|value"` attribute rather than an attribute and a listener per
 * control: the record page binds these once for the module's life, and each new pair would be
 * another branch there that can only be reached from markup written here.
 */
export function setQuickValue(pair, ctx, typed) {
  const now = view(ctx);
  const cut = String(pair || '').indexOf('|');
  if (!now || cut < 0) return '';
  const key = pair.slice(0, cut);
  const value = pair.slice(cut + 1);
  // Whatever is in the boxes goes back on before anything is changed, because the redraw this
  // press causes would otherwise wipe it.
  const v = { ...now, ...keepTyped(typed) };
  // `open` carries which list is showing, and an empty value shuts the one that is.
  if (key === 'open') { ctx.state.wbQuick = { ...v, open: value }; ctx.render(); return 'open'; }
  if (key === 'type') { setQuickType(value, ctx, typed); return 'type'; }
  if (key !== 'dir' && key !== 'target') return '';
  // Choosing shuts the list: leaving it open hides the rest of the form behind what was just
  // answered, and the answer is already on the button.
  ctx.state.wbQuick = { ...v, [key]: value, open: '', error: '' };
  ctx.render();
  return key;
}

function find(ctx, seat) {
  const workspace = (ctx.wbDoc(seat.companyId)?.workspaces || []).find((one) => one.id === seat.workspaceId);
  const app = (workspace?.apps || []).find((one) => one.id === seat.appId);
  // The workspace comes back as well as the app: the activity log is stored ON it, and every
  // one of these actions is something that happened to the record you are looking at.
  return { workspace, app, item: (app?.items || []).find((one) => one.id === seat.itemId) };
}

/**
 * Say on the record that this happened.
 *
 * Quick Create makes things that live elsewhere -- a field on the app, a row in
 * wb_record_events -- so without a line here the record shows no sign of what was done from it.
 * `recordFeed` selects on itemId, which is why every entry carries one.
 */
function note(ctx, workspace, appId, itemId, icon, color, text) {
  if (!workspace) return;
  ctx.wbLogActivity?.(workspace, { icon, color, appId, itemId, text });
}

/** Which numbers a scheduled message is aimed at. One row each, so a sender has nothing to parse. */
export function targetNumbers(to, phones) {
  if (to === ALL_NUMBERS) return (phones || []).map((one) => one.value);
  const picked = String(to || '').trim();
  if (picked) return [picked];
  return phones?.[0] ? [phones[0].value] : [];
}

/**
 * Press one of the Quick Create tiles.
 *
 * Returns what it did, so a test can read the outcome without a DOM.
 */
export async function press(key, seat, ctx) {
  const entry = quickEntry(key);
  if (!entry) return 'unknown';
  const {
    can, render, showToast, wbDoc, wbSave, wbUid,
  } = ctx;
  const { companyId, workspaceId, appId, itemId } = seat || {};

  // The tiles only show for a manager, but the press is checked as well as the paint: a card left
  // open in a tab somebody has since lost the permission for must not still write.
  if (!can('workspaces.manage', companyId)) {
    showToast('You cannot change this app.', 'local', 'Workspaces');
    return 'refused';
  }
  const { app, item } = find(ctx, seat || {});
  if (!app || !item) {
    showToast('This record is no longer here.', 'local', 'Workspaces');
    return 'gone';
  }
  // A task is not made here. main.js already has a modal over the record that writes through the
  // one shared task writer -- the permission check, the creator stamp, the contact link and the
  // notification that tells the assignee. A dialog of our own would be a second writer missing
  // some of those, and a task nobody hears about is worse than no task.
  if (entry.module === 'task') {
    const contactField = (app.fields || []).find((one) => one.type === 'company_contact');
    ctx.openRecordTask({
      companyId,
      // The seat travels with it so the modal can say on THIS record that a task was made here.
      workspaceId,
      appId,
      itemId,
      appName: app.name || 'this record',
      title: ctx.wbItemTitle?.(app, item) || '',
      contactId: contactField ? String(item.values?.[contactField.id] || '') : '',
    });
    return 'task';
  }
  if (['field', 'call', 'sms'].includes(entry.module)) {
    return openQuick(entry.module, { companyId, workspaceId, appId, itemId }, app, item, ctx);
  }
  return 'unknown';
}

/**
 * Save whatever dialog is open.
 *
 * A field is written into the app document, which this browser owns. A call or a message is a
 * row in public.wb_record_events: dated in the future, and readable by something other than this
 * tab, which the App Builder's own storage cannot offer.
 *
 * Task is not here: it opens the record's own task modal, which already writes through the one
 * shared task writer that notifies the assignee.
 */
export async function saveQuick(values, ctx) {
  const v = view(ctx);
  if (!v || v.busy) return 'idle';
  const { companyId, workspaceId, appId, itemId } = v.seat;
  const { workspace, app, item } = find(ctx, v.seat);
  if (!app || !item) {
    ctx.state.wbQuick = { ...v, error: 'This record is no longer here.' };
    ctx.render();
    return 'gone';
  }

  if (v.kind === 'field') {
    const label = String(values.label || '').trim();
    const type = values.type || 'text';
    const config = configFor(type, values, ctx.wbUid);
    const refusal = fieldRefusal(type, label, config);
    if (refusal) { ctx.state.wbQuick = { ...v, ...values, error: refusal }; ctx.render(); return 'invalid'; }
    const made = {
      id: ctx.wbUid(), label, type, required: false, hidden: false, config,
    };
    app.fields = insertFieldAt(app.fields, made, values.position);
    // Made AND placed. A `fields` block with an explicit list is honoured exactly, so a field in
    // none of them is invisible on this page with nothing to say why.
    if (Array.isArray(app.recordLayout)) app.recordLayout = placeFieldInLayout(app.recordLayout, made.id);
    note(ctx, workspace, appId, itemId, 'ti-plus', '#2563eb',
      `Added the field <b>${ctx.h(label)}</b> (${ctx.h(ctx.WB_FIELD_TYPES?.[type]?.label || type)}) to <b>${ctx.h(app.name || 'this app')}</b>`);
    await ctx.wbSave(companyId);
    ctx.state.wbQuick = null;
    ctx.showToast(`${label} added.`, 'local', 'Workspaces');
    ctx.render();
    return 'field';
  }

  const at = new Date(`${values.date}T${values.time || '09:00'}`);
  if (Number.isNaN(at.getTime())) { ctx.state.wbQuick = { ...v, ...values, error: 'That is not a date and time.' }; ctx.render(); return 'invalid'; }
  const body = String(values.body || '').trim();
  if (v.kind === 'sms' && !body) { ctx.state.wbQuick = { ...v, ...values, error: 'Write the message first.' }; ctx.render(); return 'invalid'; }
  const numbers = targetNumbers(values.to, v.phones);
  if (v.kind === 'sms' && !numbers.length) { ctx.state.wbQuick = { ...v, ...values, error: 'This record has no number to send to.' }; ctx.render(); return 'invalid'; }

  ctx.state.wbQuick = { ...v, busy: true, error: '' };
  ctx.render();
  // The doc keys its workspaces as `ws-<uuid>`; the column is that uuid, and it is also what
  // the row's permission is decided from. A legacy document keying the company instead has no
  // workspace row to point at, so it is refused here rather than at the database.
  const ws = opsWorkspaceId(workspaceId);
  if (!ws) {
    ctx.state.wbQuick = { ...v, ...values, busy: false, error: 'This workspace cannot hold a scheduled call or message yet.' };
    ctx.render();
    return 'invalid';
  }
  const base = {
    company_id: companyId,
    workspace_id: ws,
    app_id: appId,
    item_id: itemId,
    kind: v.kind,
    title: String(values.title || (v.kind === 'sms' ? 'Message' : 'Call')).trim(),
    body,
    scheduled_for: at.toISOString(),
  };
  // One row per number, so a sender has a list of messages rather than a field to parse. A call
  // is always to one number -- you cannot ring two at once.
  const rows = (v.kind === 'sms' ? numbers : numbers.slice(0, 1)).map((to) => ({ ...base, to_number: to }));

  const supabase = ctx.createSupabaseClient?.();
  if (!supabase || !ctx.isLiveSupabaseSession?.()) {
    ctx.state.wbQuick = { ...v, ...values, busy: false, error: 'A scheduled call or message needs a signed-in Questbase session.' };
    ctx.render();
    return 'offline';
  }
  const { error } = await supabase.from('wb_record_events').insert(rows);
  if (error) {
    // Said rather than swallowed: a silent failure here looks exactly like a save that worked.
    ctx.state.wbQuick = { ...v, ...values, busy: false, error: error.message || 'That could not be saved.' };
    ctx.render();
    return 'failed';
  }

  // The card goes on the record the first time something is scheduled, so what was just saved is
  // visible without going to Customize to find out where it went. Adding it again is a no-op.
  const put = ensureBlock(app.recordLayout, 'events', ctx.wbUid);
  if (put.added) app.recordLayout = put.blocks;
  const aimed = rows.length > 1 ? `${rows.length} numbers` : (rows[0]?.to_number || 'this record');
  note(ctx, workspace, appId, itemId,
    v.kind === 'sms' ? 'ti-message-2' : 'ti-phone',
    v.kind === 'sms' ? '#d97706' : '#0891b2',
    `Scheduled ${v.kind === 'sms' ? 'a message' : 'a call'} to <b>${ctx.h(aimed)}</b> — <b>${ctx.h(base.title)}</b>`
    + ` for ${ctx.h(ctx.formatDate?.(values.date) || values.date)} at ${ctx.h(values.time || '09:00')}`);
  // Saved whether or not the card was added: the line above is in the document too.
  await ctx.wbSave(companyId);
  // Drop the cached rows for this record so the card re-reads them, and the company-wide set
  // the calendars draw from -- a reminder that does not appear until a reload reads as lost.
  if (ctx.state.wbEvents) delete ctx.state.wbEvents[companyId];
  // Drop the cached rows for this record so the card re-reads them.
  const key = [companyId, workspaceId, appId, itemId].join('|');
  if (ctx.state.wbEventRows) delete ctx.state.wbEventRows[key];

  ctx.state.wbQuick = null;
  ctx.showToast(v.kind === 'sms'
    ? `Message scheduled${rows.length > 1 ? ` to ${rows.length} numbers` : ''}.`
    : 'Call scheduled.', 'live', 'Workspaces');
  ctx.render();
  return v.kind;
}
