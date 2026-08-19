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
 * Where a new field goes.
 *
 * "Before Name" and "After Name" are the two the request named. The list is built from the app's
 * own field order, so it reads the way the record does; `end` is offered because a record with no
 * fields yet has nothing to be before or after.
 */
export function fieldPositions(app) {
  const out = [{ value: 'end', label: 'At the end' }];
  (app?.fields || []).forEach((field) => {
    out.push({ value: `before:${field.id}`, label: `Before ${field.label}` });
    out.push({ value: `after:${field.id}`, label: `After ${field.label}` });
  });
  return out;
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
    const order = NEW_FIELD_TYPES.filter((key) => types[key]);
    const extra = needsOptions(v.type)
      ? `<label class="wb-quick-field">${v.type === 'checklist' ? 'Steps' : 'Options'}<small class="wb-sub">One per line.</small>
          <textarea class="wb-input" name="options" rows="4" placeholder="${v.type === 'checklist' ? 'Measure the roof' : 'Roofing'}">${esc(h, v.options)}</textarea>
        </label>`
      : v.type === 'money'
        ? `<label class="wb-quick-field">Currency<input class="wb-input" name="currency" value="${esc(h, v.currency || '$')}" maxlength="4"></label>`
        : v.type === 'number'
          ? `<label class="wb-quick-field">Unit <small class="wb-sub">Optional — shown after the number.</small><input class="wb-input" name="unit" value="${esc(h, v.unit)}" placeholder="%"></label>`
          : '';
    return shell(h, 'Add a field to every record', 'ti-plus', `
      ${err}
      <label class="wb-quick-field">Field type
        <select class="wb-input" name="type">
          ${order.map((key) => `<option value="${h(key)}" ${v.type === key ? 'selected' : ''}>${h(types[key].label)}</option>`).join('')}
        </select>
      </label>
      <label class="wb-quick-field">Name<input class="wb-input" name="label" value="${esc(h, v.label)}" placeholder="Site visit" required></label>
      ${extra}
      <label class="wb-quick-field">Where it goes
        <select class="wb-input" name="position">
          ${(v.positions || []).map((one) => `<option value="${h(one.value)}" ${v.position === one.value ? 'selected' : ''}>${h(one.label)}</option>`).join('')}
        </select>
      </label>
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
      type: 'text', label: '', position: 'end', positions: fieldPositions(app),
      options: '', currency: '$', unit: '',
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

/** Change the type mid-dialog, keeping everything already typed. */
export function setQuickType(type, ctx) {
  const v = view(ctx);
  if (!v || v.kind !== 'field') return;
  ctx.state.wbQuick = { ...v, type, error: '' };
  ctx.render();
}

function find(ctx, seat) {
  const workspace = (ctx.wbDoc(seat.companyId)?.workspaces || []).find((one) => one.id === seat.workspaceId);
  const app = (workspace?.apps || []).find((one) => one.id === seat.appId);
  return { app, item: (app?.items || []).find((one) => one.id === seat.itemId) };
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
  const { app, item } = find(ctx, v.seat);
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
  const base = {
    company_id: companyId,
    workspace_id: workspaceId,
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
  if (put.added) { app.recordLayout = put.blocks; await ctx.wbSave(companyId); }
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
