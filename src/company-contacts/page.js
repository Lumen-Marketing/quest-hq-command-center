// Company Contacts: the directory, one contact's card, and the add/edit form.
//
// Fetched on demand -- it is a nav click away, and nothing that paints before that click
// needs it. A factory, because every store and formatter it reads belongs to main.js.
//
// The card is a WINDOW, not a workbench. Every row on it links out to the workspace app that
// owns the record; the only things editable here are the contact's own details. The moment
// records can be worked from this page it becomes a fifth workspace with no owner.

import { optionRow } from '../workspace/option-row.js';
import {
  appsWithContactFields, companyContactFieldsOf, contactUsage, usageBalance, usageSummary,
} from './model.js';
import {
  CALENDAR_VIEWS, calendarSpan, cellKey as calCellKey, contactActivity, contactDates, datesByDay,
  dayKey, entriesForKey, entriesIn, keyTitle, shiftAnchor,
} from './timeline.js';
import { renderSearchCombobox } from '../ui/combobox-menu.js';
// The card's layout model. Pure, and imported directly rather than threaded through ctx: it
// names nothing main.js owns, so there is no binding to keep in step.
import {
  CARD_ANCHORS, CARD_REGIONS, CARD_SPANS, PIN_PRESETS, TILE_CATALOG,
  anchorsInUse, cardElements, cardPinOf, cardRegionOf, cardSpanOf, groupByRegion,
  movePin, normalizeCardSettings, pinFromRects, pinStyle, pinWarnings, pinsByAnchor,
  readingOrder, regionsFor, reorderElements, spanColumns, splitStores,
  CARD_BUTTON_ACTIONS, PANEL_OPTIONS, cardButtonNotReady, cardButtonReady, normalizeCardButton,
} from './card-layout.js';
// The App Builder's button rules, unchanged. A contact reuses them rather than owning a second
// copy -- what makes a button ready, when a condition holds, and what a press would write are
// the same questions here as on a record.
import {
  conditionMet, linkIsSafe, planSet, resolveHref, setValueFor,
} from '../workspace/button-field.js';

// The App Builder's own field UI arrives in ctx alongside everything else: wbRenderFieldInput,
// wbFieldConfigUI and wbCollectFieldConfig are what let a contact carry a rating, a checklist,
// a photo or a sheet without this page owning a second copy of any of them.
//
// saveWorkspaceBuilderDoc is there for the same reason: the card's TILE layout belongs to no
// field, so it rides the builder document, and writing it is that document's own save.
//
// NOTE: no comments inside the destructure below. The ctx-completeness test splits it on commas
// without stripping them, so a comment line there is read as a required key.
export function createCompanyContactsPage(ctx) {
  const {
    activeCompanyId, appHref, can, canonicalCompanyId, companyContactById, companyContactChipField,
    companyContactFieldsFor, companyContactValue, companyContactsFor,
    companyPath, emptyState, createSupabaseClient, h, isLiveSupabaseSession, money, navigate,
    normalizeCompanyContact, normalizeCompanyContactField, render,
    requirePermission, requireMutableWorkspace, showToast, state, supabaseRow, supabaseWrite, timeAgo, wbDoc,
    saveWorkspaceBuilderDoc, wbCompanyApps, wbPlainVal,
    wbFieldBuilderMarkup, wbFileIcon, wbFileValues, wbFmtDuration, wbNameValue, acceptAttr,
    fileTypeKind, formatDate,
    protectedFormDraftAttributes, renderProtectedFormDraftStrip, clearProtectedFormDraft,
    WB_FIELD_TYPES,
    COMPANY_CONTACT_COLS, COMPANY_CONTACT_FIELD_COLS, COMPANY_CONTACT_FIELD_TYPES,
    COMPANY_CONTACT_WB_TYPES, wbRenderFieldInput, wbFieldConfigUI, wbCollectFieldConfig,
    wbMembers, wbMemberById, wbAvatar, wbRatingStars, wbTagsChips, wbAutoNumberText,
    wbProgressDisplayHtml, wbChecklistStats, wbComputeCalc, wbNextContactAutoNumber,
  } = ctx;

  // Types whose value is worked out at read time rather than stored. An auto-number is NOT one
  // of them: it is computed once and then belongs to the contact.
  const CC_DERIVED_TYPES = new Set(['created_time', 'updated_time', 'calculation']);

  async function persistCompanyContact(contact) {
    const payload = normalizeCompanyContact({ ...contact, updated_at: new Date().toISOString() });
    payload.id = payload.id || `cc-${crypto.randomUUID()}`;
    const { ok, data } = await supabaseWrite('company_contacts', supabaseRow(payload, COMPANY_CONTACT_COLS));
    if (!ok) return false;
    const saved = data ? normalizeCompanyContact(data) : payload;
    const index = state.companyContacts.findIndex((item) => item.id === saved.id);
    if (index >= 0) state.companyContacts[index] = saved;
    else state.companyContacts.push(saved);
    return saved;
  }

  async function saveCompanyContactForm(form) {
    const companyId = canonicalCompanyId(form.querySelector('[name="company_id"]')?.value || activeCompanyId());
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || '').trim();
    if (!name) { showToast('A contact needs a name.', 'local', 'Company Contacts'); return; }
    const existing = data.id ? companyContactById(String(data.id)) : null;

    // Everything named field:<id> belongs to a customer-defined field. Read against the
    // field list rather than the form, so a field deleted mid-edit does not linger in the
    // stored values and a field somebody never filled in is simply absent.
    const fields = companyContactFieldsFor(companyId);
    const fieldValues = {};
    fields.forEach((field) => {
      // Worked out, not typed. Created and Last modified read the contact's own timestamps and
      // a calculation is derived on the way out, so storing anything under them would be a
      // stale copy that outlives whatever it was copied from.
      if (CC_DERIVED_TYPES.has(field.type)) return;
      const raw = data[`field:${field.id}`];
      const value = raw === undefined ? '' : String(raw).trim();
      if (value) fieldValues[field.id] = value;
    });

    // An auto-number is stamped once, on the save that creates the contact, and carried
    // untouched from then on -- the number is the contact's identity, and a later save that
    // reassigned it would renumber somebody already quoted it.
    fields.filter((field) => field.type === 'autonumber').forEach((field) => {
      const held = existing?.field_values?.[field.id];
      fieldValues[field.id] = held !== undefined && held !== '' && held !== null
        ? held
        : String(wbNextContactAutoNumber(companyId, field));
    });

    // A category or status value typed rather than picked joins its list, so the next person
    // picks it instead of inventing a second spelling.
    for (const field of fields.filter((item) => item.type === 'category' || item.type === 'status')) {
      const value = fieldValues[field.id];
      if (value) await ensureCompanyContactFieldOption(companyId, field, value);
    }

    const saved = await persistCompanyContact({
      ...(existing || {}), id: data.id || '', company_id: companyId, name, field_values: fieldValues,
    });
    if (!saved) { showToast('Could not save that contact.', 'local', 'Company Contacts'); return; }
    // The recovery copy has done its job the moment the real record exists. Cleared only on a
    // save that actually landed, so a failed write leaves the typing recoverable.
    clearProtectedFormDraft(form);
    state.modal = '';
    state.selectedCompanyContactId = '';
    showToast(existing ? 'Contact updated.' : 'Contact added.', isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    render();
  }

  // A new category value is added to that field's own option list, which lives in the field's
  // config -- the list belongs to the field, not to the company, so two category fields keep
  // their own vocabularies.
  async function ensureCompanyContactFieldOption(companyId, field, label) {
    const clean = String(label || '').trim();
    const options = field.config.options || [];
    if (!clean || options.some((option) => String(option.label).toLowerCase() === clean.toLowerCase())) return;
    const next = normalizeCompanyContactField({
      ...field,
      config: { ...field.config, options: [...options, { id: `cco-${crypto.randomUUID().slice(0, 8)}`, label: clean, color: OPTION_COLORS[options.length % OPTION_COLORS.length] }] },
    });
    const { ok } = await supabaseWrite('company_contact_fields', supabaseRow(next, COMPANY_CONTACT_FIELD_COLS));
    if (!ok) return;
    state.companyContactFields = state.companyContactFields.map((item) => (item.id === next.id ? next : item));
  }

  /**
   * Add a typed value to a contact field's option list, now rather than on save.
   *
   * Clicking "Use ABS" in the suggestion menu is the moment the choice is made, so that is when
   * ABS becomes one of the choices -- the same instant an app's category field mints one. It
   * used to wait for the contact to be saved, which meant opening a second contact and finding
   * the value you had just invented was still not on the list.
   *
   * Idempotent: ensureCompanyContactFieldOption returns untouched when the label is already
   * there in any casing, so clicking a suggestion you have used before writes nothing.
   */
  async function addFieldOptionFromInput(fieldId, label) {
    const companyId = activeCompanyId();
    const field = companyContactFieldsFor(companyId).find((item) => item.id === fieldId);
    if (!field || field.type !== 'category' || !String(label || '').trim()) return;
    if (!can('company_contacts.manage', companyId)) return;
    await ensureCompanyContactFieldOption(companyId, field, label);
  }

  // The X beside a suggestion prunes that field's list. Contacts already carrying the value
  // keep it -- the value stays on the record and simply stops being offered, because clearing
  // it everywhere would be a silent bulk edit nobody asked for.
  async function removeCompanyContactFieldOption(fieldId, label) {
    const field = companyContactFieldsFor(activeCompanyId()).find((item) => item.id === fieldId)
      || state.companyContactFields.find((item) => item.id === fieldId);
    if (!field) return;
    if (!requirePermission('company_contacts.manage', field.company_id)) return;
    const clean = String(label || '').trim().toLowerCase();
    const next = normalizeCompanyContactField({
      ...field,
      config: { ...field.config, options: (field.config.options || []).filter((option) => option.label.toLowerCase() !== clean) },
    });
    const { ok } = await supabaseWrite('company_contact_fields', supabaseRow(next, COMPANY_CONTACT_FIELD_COLS));
    if (!ok) throw new Error('Could not remove that entry.');
    state.companyContactFields = state.companyContactFields.map((item) => (item.id === next.id ? next : item));
    showToast(`Removed "${label}" from ${next.label}.`, isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
  }

  // Create a contact from nothing but a name.
  //
  // Somebody filling in a workspace record types a customer who is not in the directory yet.
  // Refusing the link leaves the record pointing at nobody; stopping to open Company Contacts
  // loses what they were doing. So the name becomes a contact with every other field blank,
  // ready to be filled in later -- which is what "I will manually edit it when the record is
  // created" asks for.
  //
  // An existing contact of the same name is reused rather than duplicated: two Kevin Hendersons
  // created a minute apart is worse than the problem this solves.
  async function createCompanyContactNamed(companyId, name) {
    const target = canonicalCompanyId(companyId);
    const clean = String(name || '').trim();
    if (!clean) return null;
    const existing = companyContactsFor(target)
      .find((contact) => String(contact.name || '').trim().toLowerCase() === clean.toLowerCase());
    if (existing) return existing;
    if (!requirePermission('company_contacts.manage', target)) return null;
    const saved = await persistCompanyContact({ id: '', company_id: target, name: clean, field_values: {} });
    return saved || null;
  }

  /**
   * A record arriving from an App Builder button, filed as a contact.
   *
   * The other half of contactButtonSeat: that one lets a contact push INTO an app, this one
   * lets an app push into the directory. Both keep every storage-shape difference on this side
   * of the boundary -- button-push.js hands over plain words keyed by contact field id and
   * learns nothing about what a contact stores.
   *
   * Which fields arrive was already decided by planPush against the directory's own field list,
   * so anything the company has no field for never reaches here. What is decided HERE is
   * whether each word can be expressed in the field it landed on: setValueFor returns null for
   * an option the field has never heard of or letters in a number box, and that value is
   * dropped rather than invented -- the same rule a "change fields on this contact" button
   * already follows.
   *
   * An existing contact of the same name is FILLED IN rather than duplicated, matching
   * createCompanyContactNamed: pressing the button twice on one record, or on two records about
   * the same person, must not leave the directory with two of them. Filling in is additive --
   * a field the contact already has something in is left alone, because the person who typed it
   * knew more than a record being forwarded does.
   */
  async function receiveContactFromApp(companyId, { name = '', plain = {} } = {}) {
    const target = canonicalCompanyId(companyId);
    const clean = String(name || '').trim();
    if (!clean) return { ok: false, error: 'A contact needs a name.' };
    if (!can('company_contacts.manage', target)) {
      return { ok: false, error: 'Your role cannot add contacts.' };
    }

    const fields = companyContactFieldsFor(target);
    const existing = companyContactsFor(target)
      .find((contact) => String(contact.name || '').trim().toLowerCase() === clean.toLowerCase());
    const values = { ...(existing?.field_values || {}) };
    let landed = 0;
    Object.entries(plain).forEach(([fieldId, text]) => {
      const field = fields.find((entry) => entry.id === fieldId);
      // Worked out rather than typed, so writing one would be a stale copy of something that
      // recomputes itself. An auto-number is stamped below, on the save that creates the row.
      if (!field || CC_DERIVED_TYPES.has(field.type) || field.type === 'autonumber') return;
      if (String(values[field.id] ?? '') !== '') return;
      const next = contactValueFromApp(field, setValueFor(field, text));
      if (next === null || next === '') return;
      values[field.id] = next;
      landed += 1;
    });

    if (!existing) {
      fields.filter((field) => field.type === 'autonumber').forEach((field) => {
        values[field.id] = String(wbNextContactAutoNumber(target, field));
      });
    }

    const saved = await persistCompanyContact({
      ...(existing || {}), id: existing?.id || '', company_id: target, name: clean, field_values: values,
    });
    if (!saved) return { ok: false, error: 'Could not save that contact.' };
    return { ok: true, landed, reused: !!existing, contact: saved };
  }

  // Mint a contact for each pending name, and write the new id back into the form that is
  // still on screen. Sequential rather than parallel: two names that turn out to be the same
  // person must not race each other into two rows.
  // Company Contact pickers holding a name that matched nobody: the name is on screen and the
  // id is empty, which is the state syncCompanyContactPicker leaves behind on purpose so a
  // half-typed name cannot silently keep the previous contact.
  function unlinkedContactNames() {
    return [...document.querySelectorAll('[data-wb-cc-picker]')]
      .map((picker) => ({
        name: String(picker.querySelector('[data-wb-cc-name]')?.value || '').trim(),
        idField: picker.querySelector('[data-wb-cc-id]'),
      }))
      .filter((entry) => entry.name && entry.idField && !entry.idField.value);
  }

  async function createMissingContacts(companyId, entries = unlinkedContactNames()) {
    let made = 0;
    let firstName = '';
    for (const entry of entries) {
      const contact = await createCompanyContactNamed(companyId, entry.name);
      // No permission, or the write failed. Leaving the id empty is the honest outcome: the
      // record saves without a link rather than pointing at something invented.
      if (!contact) continue;
      entry.idField.value = contact.id;
      if (!made) firstName = contact.name;
      made += 1;
    }
    if (made) {
      showToast(`Added ${made === 1 ? firstName : `${made} contacts`} to Company Contacts.`,
        isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    }
    // True even when nothing was made, so the save still goes through with an empty link
    // rather than the modal sitting there having apparently ignored the button.
    return true;
  }

  async function deleteCompanyContact(contactId) {
    const contact = companyContactById(contactId);
    if (!contact) return;
    if (!requirePermission('company_contacts.manage', contact.company_id)) return;
    const { ok } = await supabaseWrite('company_contacts', {
      id: contact.id, company_id: contact.company_id, name: contact.name, deleted_at: new Date().toISOString(),
    });
    if (!ok) throw new Error('Could not delete that contact.');
    state.companyContacts = state.companyContacts.filter((item) => item.id !== contact.id);
    state.modal = '';
    state.selectedCompanyContactId = '';
    showToast('Contact deleted.', isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    navigate(companyPath('company-contacts', {}, contact.company_id));
  }

  /* ---- Picking several at once ------------------------------------------------------------
   *
   * "Add a button Select, then check boxes appear where I can select multiple contacts to
   * delete, and a Clear select appears too together with Delete."
   *
   * Off by default: a directory is read far more often than it is pruned, and a checkbox on
   * every row all the time makes the common case noisier for the rare one. Select turns the
   * column on; Cancel turns it off and forgets the ticks.
   */
  const selectedIds = () => (Array.isArray(state.companyContactSelected) ? state.companyContactSelected : []);

  /**
   * The ticked contacts that still exist in THIS company.
   *
   * A tick is only an id, and between ticking and pressing Delete the row can have been
   * filtered away, deleted in another tab, or the company switched underneath. Resolving
   * against the live list each time means a stale id is dropped rather than sent to the server.
   */
  function selectedContacts(companyId) {
    return selectedIds()
      .map((id) => companyContactById(id))
      .filter((contact) => contact && canonicalCompanyId(contact.company_id) === canonicalCompanyId(companyId));
  }

  function setContactSelectMode(on) {
    state.companyContactSelecting = !!on;
    // Leaving the mode forgets the ticks. Keeping them would mean pressing Select again later
    // silently re-arms a selection made against a list that has since moved on.
    if (!on) state.companyContactSelected = [];
    render();
  }

  function toggleContactSelected(contactId) {
    const id = String(contactId || '');
    if (!id) return;
    const current = selectedIds();
    state.companyContactSelected = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    render();
  }

  /** The header box: tick every row currently on screen, or untick them. */
  function toggleContactSelectAll(companyId) {
    const visible = visibleContacts(companyId).map((contact) => contact.id);
    const current = selectedIds();
    const allOn = visible.length > 0 && visible.every((id) => current.includes(id));
    // Only the rows on screen. A filtered-out contact somebody ticked earlier keeps its tick
    // rather than being silently dropped by a box that says "all".
    state.companyContactSelected = allOn
      ? current.filter((id) => !visible.includes(id))
      : [...new Set([...current, ...visible])];
    render();
  }

  function clearContactSelection() {
    state.companyContactSelected = [];
    render();
  }

  /**
   * Delete every ticked contact.
   *
   * deleteCompanyContact navigates back to the directory when it is done, which is right when
   * you are looking at the card of the contact you just deleted and wrong here -- this already
   * IS the directory. So the write is the same shape and the navigation is not.
   *
   * One failure does not abort the rest: a permission or network error on the third of ten must
   * not leave seven undeleted and unreported. Every row is attempted, and the toast says what
   * actually happened.
   */
  async function deleteSelectedContacts() {
    const companyId = canonicalCompanyId(activeCompanyId());
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const contacts = selectedContacts(companyId);
    if (!contacts.length) { clearContactSelection(); return; }

    // Deleting a contact a record still points at leaves that record showing a broken chip, and
    // in a bulk delete nobody is looking at the cards one at a time to notice. So the count is
    // put in front of them before anything is written.
    const doc = wbDoc(companyId);
    const inUse = contacts.filter((contact) => contactUsage(doc, contact.id, { nameValue: wbNameValue }).length);
    const noun = contacts.length === 1 ? 'contact' : 'contacts';
    const warning = inUse.length
      ? `\n\n${inUse.length} of them ${inUse.length === 1 ? 'is' : 'are'} still named by records in this company. Those records keep the link and will show the contact as missing.`
      : '';
    if (!window.confirm(`Delete ${contacts.length} ${noun}?${warning}`)) return;

    const stamp = new Date().toISOString();
    const settled = await Promise.all(contacts.map((contact) => supabaseWrite('company_contacts', {
      id: contact.id, company_id: contact.company_id, name: contact.name, deleted_at: stamp,
    }).then(({ ok }) => (ok ? contact.id : ''), () => '')));

    const removed = new Set(settled.filter(Boolean));
    if (removed.size) {
      state.companyContacts = state.companyContacts.filter((item) => !removed.has(item.id));
      if (removed.has(state.selectedCompanyContactId)) state.selectedCompanyContactId = '';
    }
    // Whatever could not be deleted stays ticked, so a retry is one press rather than a hunt
    // back through the list for the ones that did not go.
    state.companyContactSelected = selectedIds().filter((id) => !removed.has(id));
    if (!state.companyContactSelected.length) state.companyContactSelecting = false;

    const failed = contacts.length - removed.size;
    const source = isLiveSupabaseSession() ? 'live' : 'local';
    if (!removed.size) showToast(`Could not delete ${failed === 1 ? 'that contact' : `those ${failed} contacts`}.`, 'error', 'Company Contacts');
    else if (failed) showToast(`${removed.size} deleted, ${failed} could not be — still ticked.`, 'error', 'Company Contacts');
    else showToast(`${removed.size} ${removed.size === 1 ? 'contact' : 'contacts'} deleted.`, source, 'Company Contacts');
    render();
  }

  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

  // Chip colours come from the category field's own option list, which is where the company
  // set them. Fields the company deleted simply stop colouring anything.
  const chipOptions = (companyId) => companyContactChipField(companyId)?.config?.options || [];
  const chipColor = (companyId, label) => chipOptions(companyId).find((o) => o.label === label)?.color || '#6b7280';

  // Search reads every field value, not a fixed six. A company that added "License #" expects
  // to find somebody by it -- a search that quietly ignores half the form is worse than none.
  function matchesQuery(contact, query) {
    if (!query) return true;
    if (String(contact.name || '').toLowerCase().includes(query)) return true;
    return Object.values(contact.field_values || {})
      .some((value) => String(value ?? '').toLowerCase().includes(query));
  }

  function visibleContacts(companyId, { ignoreType = false } = {}) {
    const query = String(state.companyContactQuery || '').trim().toLowerCase();
    const type = state.companyContactTypeFilter || 'all';
    const chipField = companyContactChipField(companyId);
    return companyContactsFor(companyId).filter((contact) => {
      if (!matchesQuery(contact, query)) return false;
      if (ignoreType || type === 'all' || !chipField) return true;
      const value = companyContactValue(contact, chipField);
      if (type === 'untyped') return !value;
      return value === type;
    });
  }

  // Counts are taken with the type filter lifted, so picking Subs does not read as "there
  // are zero clients". They still answer to search, so the row describes what is on screen.
  function typeChips(companyId) {
    const chipField = companyContactChipField(companyId);
    const rows = visibleContacts(companyId, { ignoreType: true });
    if (!chipField) return [];
    const countOf = (predicate) => rows.filter(predicate).length;
    const untyped = countOf((contact) => !companyContactValue(contact, chipField));
    return [
      { key: 'all', label: 'All', count: rows.length },
      ...chipOptions(companyId).map((option) => ({
        key: option.label,
        label: option.label,
        color: option.color,
        count: countOf((contact) => companyContactValue(contact, chipField) === option.label),
      })),
      ...(untyped ? [{ key: 'untyped', label: `No ${chipField.label.toLowerCase()}`, count: untyped }] : []),
    ];
  }

  // The first field of a given type, hidden or not.
  //
  // Hiding is a COLUMN setting, and the number under somebody's name is not a column. Filtering
  // it here meant that taking Phone out of the table -- reasonable, since it is already under
  // the name -- silently blanked the line under every name as well.
  function firstFieldOf(companyId, type) {
    return companyContactFieldsFor(companyId).find((field) => field.type === type) || null;
  }

  const fieldText = (contact, field) => (field ? String(companyContactValue(contact, field) || '').trim() : '');

  // One cell, rendered the way that field's type deserves.
  function fieldCell(companyId, contact, field) {
    // Worked out rather than stored, so an empty field_values entry is not an empty cell.
    const auto = autoCellHtml(companyId, contact, field);
    if (auto !== null) return auto;
    const value = companyContactValue(contact, field);
    if (value === '' || value === undefined || value === null) return '<span class="muted-dash">—</span>';
    if (field.type === 'category' || field.type === 'status') {
      const color = (field.config?.options || []).find((option) => option.label === value)?.color || '#6b7280';
      return `<span class="cc-type" style="--cc-type:${h(color)}">${h(value)}</span>`;
    }
    if (field.type === 'file') {
      const files = wbFileValues(value);
      return files.length ? `<span class="cc-cell-files"><i class="ti ti-paperclip"></i>${h(String(files.length))}</span>` : '<span class="muted-dash">—</span>';
    }
    if (field.type === 'money') return `<b>${h(money(Number(value) || 0))}</b>`;
    // The App Builder's own cell renderings, so a rating is stars and a progress is a bar here
    // exactly as it is on a record -- a column of "4" and "60" would be a table of raw storage.
    if (field.type === 'rating') return wbRatingStars(value);
    if (field.type === 'tags') return wbTagsChips(field, tagIds(value));
    if (field.type === 'progress') return wbProgressDisplayHtml(field, Number(value) || 0);
    if (field.type === 'checklist') {
      const stats = wbChecklistStats(value, field);
      return stats.total ? `<span class="cc-cell-check"><i class="ti ti-list-check"></i>${h(`${stats.done}/${stats.total}`)}</span>` : '<span class="muted-dash">—</span>';
    }
    if (field.type === 'image') {
      const image = wbFileValues(value)[0];
      return image?.url ? `<span class="cc-cell-img"><img src="${h(image.url)}" alt="" loading="lazy" /></span>` : '<span class="muted-dash">—</span>';
    }
    if (field.type === 'user') {
      const member = wbMemberById(companyId, String(value));
      return `<span class="cc-cell-user">${wbAvatar(member, 20)}${h(member.name)}</span>`;
    }
    if (field.type === 'url') {
      return `<a class="cc-cell-link" href="${h(value)}" target="_blank" rel="noreferrer noopener">${h(shortUrl(value))}</a>`;
    }
    return h(displayValue(field, value));
  }

  /**
   * The cell for a field nobody types into, or null when the field is not one of those.
   *
   * Created / Last modified read the contact's own timestamps, a calculation is worked out from
   * the other fields, and an auto-number is formatted with its prefix and padding. None of them
   * live in field_values -- except the auto-number, which is written once when the contact is
   * first saved and never again.
   */
  function autoCellHtml(companyId, contact, field) {
    if (field.type === 'created_time') return contact.created_at ? h(formatDate(contact.created_at)) : '<span class="muted-dash">—</span>';
    if (field.type === 'updated_time') return contact.updated_at ? h(timeAgo(contact.updated_at)) : '<span class="muted-dash">—</span>';
    if (field.type === 'calculation') {
      const text = wbComputeCalc(contactsAsApp(companyId), field, contact.field_values || {});
      return text === '—' ? '<span class="muted-dash">—</span>' : h(text);
    }
    if (field.type === 'autonumber') {
      const text = wbAutoNumberText(field, companyContactValue(contact, field));
      return text ? h(text) : '<span class="muted-dash">—</span>';
    }
    return null;
  }

  /**
   * The company's contact fields dressed as an app, for the helpers that expect one.
   *
   * wbComputeCalc resolves {Field name} against `fields` and never touches `items`, which is the
   * only thing a contact directory does not have. Handing it this rather than reimplementing the
   * formula parser is what keeps a calculation on a contact identical to one on a record.
   */
  function contactsAsApp(companyId) {
    // allowMove:false — a contact lives in the directory, not in the app it was sent to, so the
    // config panel withholds "send it and remove it" rather than offering something that would
    // then be refused at press time.
    return {
      id: `cc-${companyId}`, name: 'Company Contacts', allowMove: false,
      fields: companyContactFieldsFor(companyId), items: [],
    };
  }

  // ---- the contact-source adapter ------------------------------------------------------
  //
  // A button on a contact reuses the App Builder's button machinery whole. That machinery
  // expects a RECORD, and a contact is not one -- it disagrees in four places, and every one of
  // them is silent if you get it wrong. All of the knowledge lives here, beside the storage
  // shapes it inverts; nothing in button-field.js or button-push.js learns what a contact is.

  /**
   * The contact's fields, dressed as an app for the button rules.
   *
   * The NAME is deliberately absent. It is not sent as a value at all -- it becomes the target
   * app's Company Contact field, labelled "Contact", holding this contact's id. That link is
   * what displays the name, keeps the record tied to the card that produced it, and is what
   * contactUsage scans to find the record again.
   *
   * Sending the name as text as well would put the same person in the app twice: once as a link
   * that stays correct, and once as a string that goes stale the moment anybody is renamed.
   */
  function contactSourceAppFor(companyId) {
    return {
      id: `cc-${companyId}`,
      name: 'Company Contacts',
      allowMove: false,
      fields: companyContactFieldsFor(companyId),
      items: [],
    };
  }

  /**
   * THE TRAP, in one function.
   *
   * A contact does not store what an app stores, and it differs in three ways:
   *   category / status -- a contact keeps the LABEL, an app keeps the option ID
   *   tags              -- a contact keeps JSON TEXT of ids, an app keeps a real array
   *   checkbox          -- a contact keeps 'yes' / 'no', an app keeps a boolean
   *
   * translateValue() assumes ids and arrays, so without this a multi-select would arrive at the
   * target app as ONE option literally labelled `["cco-ab12","cco-cd34"]`, minted into that
   * field's own option list and left there for good after a single press.
   *
   * Both shapes are accepted for category/status, so a value that was already an id (however it
   * got there) passes through rather than being re-looked-up and lost.
   */
  function contactValueAsApp(field, raw) {
    if (field.type === 'tags') return tagIds(raw);
    if (field.type === 'checkbox') return String(raw) === 'yes';
    if (field.type === 'category' || field.type === 'status') {
      const options = field.config?.options || [];
      if (options.some((option) => option.id === raw)) return raw;
      const key = (value) => String(value ?? '').trim().toLowerCase();
      return options.find((option) => key(option.label) === key(raw))?.id ?? String(raw);
    }
    return raw;
  }

  /**
   * A contact in the shape the button rules expect an item to be.
   *
   * field_values never holds an empty string -- the save path only writes truthy values -- so
   * absent means blank, which is what isBlank() already handles.
   */
  function contactAsItem(companyId, contact) {
    const values = {};
    companyContactFieldsFor(companyId).forEach((field) => {
      const raw = contact.field_values?.[field.id];
      if (raw === undefined || raw === '') return;
      values[field.id] = contactValueAsApp(field, raw);
    });
    return { id: contact.id, values };
  }

  /**
   * The inverse, for a button that changes fields on the contact itself.
   *
   * setValueFor returns APP-shaped values -- an option id, a boolean, a number -- and
   * field_values holds non-empty strings. null means "cannot be expressed here", which keeps
   * the existing skip-rather-than-write rule: a value a field has never heard of writes nothing
   * instead of inventing something the field cannot show.
   */
  function contactValueFromApp(field, next) {
    if (next === null || next === undefined) return null;
    if (field.type === 'tags') return Array.isArray(next) && next.length ? JSON.stringify(next) : '';
    if (field.type === 'checkbox') return next ? 'yes' : 'no';
    if (field.type === 'category' || field.type === 'status') {
      return (field.config?.options || []).find((option) => option.id === next)?.label ?? String(next ?? '');
    }
    return next === '' ? '' : String(next);
  }

  /**
   * Carry out a "change fields on this contact" press.
   *
   * The seated/unseated split the record version makes collapses here: the card is a WINDOW,
   * there is no form to write into, so this always writes and persists.
   */
  async function applyContactSet(companyId, contact, sets) {
    const values = { ...(contact.field_values || {}) };
    let touched = 0;
    sets.forEach(({ field, value }) => {
      const next = contactValueFromApp(field, setValueFor(field, value));
      if (next === null) return;
      if (next === '') delete values[field.id];
      else values[field.id] = next;
      touched += 1;
    });
    if (!touched) return 0;
    const saved = await persistCompanyContact({ ...contact, field_values: values });
    return saved ? touched : 0;
  }

  /**
   * Everything a press needs, resolved from the seat the card wrote onto the button.
   *
   * The seat is `cc|<companyId>|<contactId>` -- three parts, deliberately not four, so the
   * record seat's own split can never mistake one for the other.
   *
   * Two different app shapes come back, and the difference is the point:
   *   sourceApp   -- Name INCLUDED, for a push. The name is the one thing a target app most
   *                  wants, and planPush matches it by label like any other field.
   *   settableApp -- Name EXCLUDED, for a set. A button that silently renames a contact is not
   *                  what anybody meant, and leaving Name out excludes it structurally rather
   *                  than with a guard somebody can delete later.
   */
  function contactButtonSeat(seat) {
    const [kind, rawCompanyId, contactId] = String(seat || '').split('|');
    if (kind !== 'cc' || !contactId) return null;
    const companyId = canonicalCompanyId(rawCompanyId);
    const contact = companyContactById(contactId);
    if (!contact) return null;
    return {
      companyId,
      contact,
      sourceApp: contactSourceAppFor(companyId),
      settableApp: contactsAsApp(companyId),
      item: contactAsItem(companyId, contact),
      // A button is a card object now, so it is looked up in the card settings rather than in
      // the contact's field list -- which no longer contains buttons at all.
      button: (buttonId) => cardSettings(companyId).buttons.find((entry) => entry.id === buttonId) || null,
      applySet: (button) => applyContactSet(companyId, contact, planSet(contactsAsApp(companyId), { id: button.id, config: button })),
      openLink: (button) => openContactLink(companyId, contact, button),
    };
  }

  /**
   * The third action: open a link, place a call, or start an email.
   *
   * Writes nothing, so it needs none of the push machinery. The href may name the contact's own
   * fields in braces -- `tel:{Phone}` -- which is what makes one button work on every contact.
   */
  function openContactLink(companyId, contact, button) {
    const url = resolveHref(contactSourceAppFor(companyId), contactAsItem(companyId, contact), button.href);
    if (!linkIsSafe(url)) {
      showToast('That link cannot be opened.', 'error', 'Company Contacts');
      return false;
    }
    // A web page opens in its own tab; tel:/mailto:/sms: hand off to the device, where a new
    // tab would be an empty window left behind after the dialler takes over.
    if (/^https?:$/.test(new URL(url).protocol)) window.open(url, '_blank', 'noopener,noreferrer');
    else window.location.href = url;
    return true;
  }

  /** A link as somebody reads it: the host and path, without the scheme shouting at them. */
  function shortUrl(value) {
    const raw = String(value || '').trim();
    try { const url = new URL(raw); return `${url.host}${url.pathname === '/' ? '' : url.pathname}`; } catch { return raw; }
  }

  function renderDirectory(companyId) {
    const doc = wbDoc(companyId);
    const rows = visibleContacts(companyId);
    const chips = typeChips(companyId);
    const chipField = companyContactChipField(companyId);
    const phoneField = firstFieldOf(companyId, 'phone');
    const active = state.companyContactTypeFilter || 'all';
    const canManage = can('company_contacts.manage', companyId);

    // Name, Active with us, Open balance and Last touch are this view's own — they are what a
    // directory is for, and no field of yours produces them. Everything between is YOUR fields,
    // one column each, minus the ones hidden in the Fields editor.
    const columns = companyContactFieldsFor(companyId).filter((field) => !field.hidden);
    // The grid is built from the count, because the count is now the company's decision. A
    // fixed six-column rule silently mis-aligned every row the moment a seventh appeared.
    // Picking several at once adds a column, so it has to go into the SAME track list the head
    // and every row share -- a checkbox added to the rows alone would shunt every cell one
    // column left of its heading.
    const selecting = canManage && !!state.companyContactSelecting;
    const ticked = new Set(selecting ? selectedIds() : []);
    const tracks = [...(selecting ? ['34px'] : []), 'minmax(200px, 1.4fr)', ...columns.map(() => 'minmax(130px, .9fr)'),
      'minmax(180px, 1.2fr)', '120px', '110px'].join(' ');
    const minWidth = 610 + columns.length * 130 + (selecting ? 34 : 0);
    const grid = `style="--cc-cols:${tracks};--cc-min:${minWidth}px"`;
    const onScreen = rows.map((contact) => contact.id);
    const allTicked = selecting && onScreen.length > 0 && onScreen.every((id) => ticked.has(id));

    const row = (contact) => {
      const uses = contactUsage(doc, contact.id, { nameValue: wbNameValue });
      const balance = usageBalance(uses);
      const summary = usageSummary(uses);
      const chip = companyContactValue(contact, chipField);
      const phone = fieldText(contact, phoneField);
      // While picking, the row PICKS. Leaving it opening the contact would mean the same click
      // on the same pixel does two different things depending on a mode you cannot see from the
      // row itself -- and every mis-click costs a page load.
      const on = ticked.has(contact.id);
      return `
        <div class="table-row cc-row${selecting ? ' cc-picking' : ''}${on ? ' cc-picked' : ''}" role="button" tabindex="0" ${grid}
          data-action="${selecting ? 'toggle-company-contact-pick' : 'open-company-record'}" data-contact-id="${h(contact.id)}"
          ${selecting ? `aria-pressed="${on}"` : ''}>
          ${selecting ? `<span class="cc-cell-pick">
            <input type="checkbox" tabindex="-1" ${on ? 'checked' : ''} aria-label="${h(`Select ${contact.name}`)}" />
          </span>` : ''}
          <span class="cc-cell-name">
            <span class="cc-avatar" style="background:${h(chipColor(companyId, chip))}">${h(initials(contact.name))}</span>
            <span><strong>${h(contact.name)}</strong><small class="cc-cell-phone">${h(phone || '—')}</small></span>
          </span>
          ${columns.map((field) => `<span class="cc-cell-field">${fieldCell(companyId, contact, field)}</span>`).join('')}
          <span>${summary ? h(summary) : '<span class="muted-dash">—</span>'}</span>
          <span class="cc-cell-money">${balance ? `<b>${h(money(balance))}</b>` : '<span class="muted-dash">—</span>'}</span>
          <span class="cc-cell-touch">${contact.last_activity_at ? h(timeAgo(contact.last_activity_at)) : h(timeAgo(contact.updated_at))}</span>
        </div>`;
    };

    return `
      <section class="panel cc-directory">
        <div class="cc-head">
          <div>
            <span class="cc-eyebrow">Directory — shared by every workspace in this company</span>
            <h2>Company Contacts <span class="cc-count">${rows.length}</span></h2>
          </div>
          <div class="cc-head-actions">
            <label class="cc-search">
              <i class="ti ti-search"></i>
              <input type="search" data-company-contact-search value="${h(state.companyContactQuery || '')}" placeholder="Search every field…" aria-label="Search company contacts" />
            </label>
            ${canManage && (rows.length || selecting) ? `
              <button class="btn ${selecting ? 'btn-primary' : ''}" type="button" data-action="toggle-company-contact-select" aria-pressed="${selecting}">
                <i class="ti ti-${selecting ? 'x' : 'checkbox'}"></i>${selecting ? 'Cancel' : 'Select'}
              </button>` : ''}
            ${canManage ? `
              <button class="btn btn-icon cc-settings-btn" type="button" data-action="open-company-contact-fields" title="Settings — fields and the contact card" aria-label="Company Contacts settings"><i class="ti ti-settings"></i></button>
              <button class="btn btn-primary" type="button" data-action="open-company-record-form" data-mode="new"><i class="ti ti-plus"></i>New contact</button>` : ''}
          </div>
        </div>
        ${selecting ? `
          <div class="cc-pickbar" role="status">
            <span class="cc-pickbar-n">${ticked.size} selected</span>
            ${ticked.size ? `
              <button class="btn btn-sm danger" type="button" data-action="delete-company-contact-picked"><i class="ti ti-trash"></i>Delete ${ticked.size}</button>
              <button class="btn btn-sm" type="button" data-action="clear-company-contact-picked"><i class="ti ti-square-x"></i>Clear selection</button>`
    : '<span class="wb-sub">Tick the contacts you want to delete.</span>'}
          </div>` : ''}
        ${chips.length ? `
          <div class="cc-chips" role="group" aria-label="Filter by ${h(chipField.label)}">
            ${chips.map((chip) => `
              <button class="cc-chip ${active === chip.key ? 'active' : ''}" type="button" data-action="set-company-record-type" data-type="${h(chip.key)}" aria-pressed="${active === chip.key ? 'true' : 'false'}">
                ${chip.color ? `<i class="cc-dot" style="background:${h(chip.color)}"></i>` : ''}${h(chip.label)}<b>${chip.count}</b>
              </button>`).join('')}
          </div>` : ''}
        <div class="data-table cc-table">
          <div class="table-head" ${grid}>
            ${selecting ? `<span class="cc-cell-pick">
              <input type="checkbox" ${allTicked ? 'checked' : ''} data-action="toggle-company-contact-pick-all"
                aria-label="${allTicked ? 'Clear these' : 'Select these'} ${onScreen.length} contacts" title="Select everything on screen" />
            </span>` : ''}
            <span>Name</span>
            ${columns.map((field) => `<span>${h(field.label)}</span>`).join('')}
            <span>Active with us</span>
            <span class="cc-cell-money">Open balance</span><span class="cc-cell-touch">Last touch</span>
          </div>
          ${rows.map(row).join('') || emptyState(state.companyContactQuery
            ? 'No contact matches that search.'
            : 'No company contacts yet. Add one, then point a workspace app at it with a Company Contact field.')}
        </div>
      </section>`;
  }

  // How a stored value reads on the card. The form knows how to collect a type; the card has
  // to know how to show it, or a yes/no reads as the string "yes" and money loses its symbol.
  function displayValue(field, value) {
    if (value === '' || value === undefined || value === null) return '';
    if (field.type === 'checkbox') return String(value) === 'yes' ? 'Yes' : 'No';
    // A file is stored as JSON. Printing that raw is how a card ends up reading
    // {"name":"quote.pdf","url":"https://…"} to somebody who wanted the quote.
    if (field.type === 'file' || field.type === 'image') {
      const files = wbFileValues(value);
      return files.map((file) => file.name).join(', ');
    }
    if (field.type === 'money') return money(Number(value) || 0);
    if (field.type === 'date') return String(value).slice(0, 10);
    // The rest are stored the way the App Builder stores them, which is not the way anybody
    // reads them: ids, minutes and JSON. Each one is turned back into what it means, or the
    // summary line under a contact's name fills up with storage.
    if (field.type === 'tags') {
      const byId = new Map((field.config.options || []).map((option) => [option.id, option.label]));
      return tagIds(value).map((id) => byId.get(id) || '').filter(Boolean).join(', ');
    }
    if (field.type === 'duration') return wbFmtDuration(value);
    if (field.type === 'progress') return `${Math.max(0, Math.min(100, Math.round(Number(value) || 0)))}%`;
    if (field.type === 'rating') return `${Math.max(0, Math.min(5, Math.round(Number(value) || 0)))}/5`;
    if (field.type === 'checklist') { const s = wbChecklistStats(value, field); return s.total ? `${s.done}/${s.total} done` : ''; }
    if (field.type === 'user') return wbMemberById(activeCompanyId(), String(value)).name;
    if (field.type === 'autonumber') return wbAutoNumberText(field, value);
    // A sheet is a whole grid; on a summary line it is its name, which is what it is called
    // everywhere else it is listed.
    if (field.type === 'sheet') {
      try { const sheet = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {}); return String(sheet.title || '').trim() || 'Sheet'; } catch { return 'Sheet'; }
    }
    return String(value);
  }

  // One row per record in flight. It answers "where has this got to?" without opening the
  // record: the stage the app gave it, how long it is booked for, its dates, and when somebody
  // last touched it. Every part is optional -- an app with no status field contributes no
  // stage rather than an empty slot.

  // ---- what has happened, and what is coming ----------------------------------------------

  /** A link to the record an entry belongs to, where the workspace has a route. */
  function entryHref(companyId, entry) {
    return entry.workspaceRouteId
      ? appHref(companyPath('workspaces', {
        workspace: entry.workspaceRouteId, app_id: entry.appId, tab: 'items', item_id: entry.itemId,
      }, companyId))
      : '';
  }

  /**
   * Everything logged against a record this contact is named on.
   *
   * The workspace feed already records what happened to each record; this is that feed read
   * through one person, which is the question somebody on a contact card is actually asking.
   */
  function activityPanel(companyId, doc, contact, cols = 2, show = {}) {
    const all = contactActivity(doc, contact.id, { nameValue: wbNameValue });
    // 0 means every entry, which is what this panel always showed. Otherwise each "Show more"
    // reveals another page of the same size.
    const step = Number(show.limit) > 0 ? Number(show.limit) : 0;
    const cap = step ? step * (1 + (state.ccMore?.activity || 0)) : all.length;
    const entries = all.slice(0, cap);
    return `
      <div class="cc-panel cc-el" style="--cc-span:${cols}">
        <h3><i class="ti ti-activity"></i>Recent updates</h3>
        ${entries.length ? `<div class="cc-feed">${entries.map((entry) => {
    const href = entryHref(companyId, entry);
    // The three facts under each line are each optional. A feed where every entry names the
    // same app is a column of one repeated word, so being able to drop it matters.
    const facts = [
      show.app !== false ? h(entry.appName) : '',
      show.actor !== false && entry.actor ? h(entry.actor) : '',
      show.when !== false ? h(timeAgo(entry.at)) : '',
    ].filter(Boolean).join(' · ');
    const line = `<span class="cc-feed-ic"><i class="ti ${h(entry.icon)}"></i></span>
            <span class="cc-feed-main">
              <span class="cc-feed-text">${entry.text}</span>
              ${facts ? `<small>${facts}</small>` : ''}
            </span>`;
    return href
      ? `<a class="cc-feed-row" href="${h(href)}" data-router>${line}</a>`
      : `<div class="cc-feed-row">${line}</div>`;
  }).join('')}${all.length > entries.length ? `<button class="cc-show-more" type="button" data-action="cc-show-more" data-key="activity">Show ${Math.min(step, all.length - entries.length)} more <span>· ${all.length - entries.length} left</span></button>` : ''}</div>`
    : '<p class="cc-empty">Nothing has happened on their records yet. Edits, stage changes and new records all show up here.</p>'}
      </div>`;
  }

  /**
   * Their diary: every dated field on every record that names them.
   *
   * Only fields somebody CHOSE a day in. Created and Last modified are stamps the system
   * writes, and a calendar full of "this was edited" is a calendar nobody opens -- those are in
   * Recent updates, where they belong.
   */
  function calendarPanel(companyId, doc, contact, cols = 2, show = {}) {
    // The company's chosen starting view, until somebody picks another on this visit. A team
    // that works a week at a time should not have to press Week every time they open a contact.
    const opensOn = CALENDAR_VIEWS.includes(show.view) ? show.view : 'month';
    const view = CALENDAR_VIEWS.includes(state.ccCalView) ? state.ccCalView : opensOn;
    const anchor = state.ccCalAt ? new Date(state.ccCalAt) : new Date();
    const span = calendarSpan(view, anchor);
    const byDay = datesByDay(contactDates(doc, contact.id, { nameValue: wbNameValue }));
    const today = dayKey(new Date());

    const cell = (item) => {
      const entries = entriesIn(item, byDay);
      const key = dayKey(item.date);
      const label = item.month === undefined
        ? String(item.date.getDate())
        : item.date.toLocaleDateString([], { month: 'short' });
      const classes = [
        'cc-cal-cell',
        item.outside ? 'out' : '',
        key === today && item.month === undefined ? 'today' : '',
        entries.length ? 'has' : '',
      ].filter(Boolean).join(' ');
      // Day and week show what is on: the cells are big enough to read, and that is the whole
      // point of looking at a day. Month and year show that something is there.
      const detail = ['day', 'week'].includes(view)
        ? entries.map((entry) => {
          const href = entryHref(companyId, entry);
          const body = `<b>${h(entry.title)}</b><small>${h(entry.label)} · ${h(entry.appName)}</small>`;
          return href ? `<a class="cc-cal-item" href="${h(href)}" data-router>${body}</a>` : `<span class="cc-cal-item">${body}</span>`;
        }).join('')
        : entries.length ? `<span class="cc-cal-dot">${entries.length}</span>` : '';
      const tip = h(entries.map((entry) => `${entry.title} — ${entry.label}`).join('\n'));
      const body = `<span class="cc-cal-num">${h(label)}</span>${detail}`;
      // A count is not something you can read. Where the cell shows only a number -- month and
      // year -- pressing it opens what that number stands for. Day and week already list the
      // entries as links, so the cell is not made pressable there: a link inside a button is
      // both a nested control and two different things to hit in the same place.
      if (entries.length && !['day', 'week'].includes(view)) {
        return `<button type="button" class="${classes} open" data-cc-cal-open="${h(calCellKey(item))}"
          data-cc-cal-for="${h(contact.id)}"
          title="${tip}" aria-label="${h(`${entries.length} on ${keyTitle(calCellKey(item))}`)}">${body}</button>`;
      }
      return `<div class="${classes}" title="${tip}">${body}</div>`;
    };

    const weekdays = view === 'month' || view === 'week'
      ? `<div class="cc-cal-days">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => `<span>${day}</span>`).join('')}</div>`
      : '';

    return `
      <div class="cc-panel cc-cal-panel cc-el" style="--cc-span:${cols}">
        <h3><i class="ti ti-calendar"></i>Calendar</h3>
        <div class="cc-cal-bar">
          <button class="wb-icon-btn" type="button" data-cc-cal-step="-1" aria-label="Previous"><i class="ti ti-chevron-left"></i></button>
          <b class="cc-cal-title">${h(span.title)}</b>
          <button class="wb-icon-btn" type="button" data-cc-cal-step="1" aria-label="Next"><i class="ti ti-chevron-right"></i></button>
          <button class="btn btn-sm" type="button" data-cc-cal-today>Today</button>
          <div class="cc-cal-views">
            ${CALENDAR_VIEWS.map((name) => `<button class="cc-cal-view ${name === view ? 'on' : ''}" type="button" data-cc-cal-view="${name}">${name[0].toUpperCase()}${name.slice(1)}</button>`).join('')}
          </div>
        </div>
        ${weekdays}
        <div class="cc-cal-grid cc-cal-${h(view)}">${span.cells.map(cell).join('')}</div>
        ${byDay.size ? '' : '<p class="cc-empty">No dates yet. A date field on any record that names them shows up here.</p>'}
        ${calDayModal(companyId, byDay, contact)}
      </div>`;
  }

  /**
   * What is on the day somebody pressed.
   *
   * Rendered inside the card rather than through `state.modal`, because this belongs to the
   * calendar and the card is already a lazily-fetched chunk -- routing it through the shell
   * would put it in the entry bundle, which has no room, for a panel most sessions never open.
   *
   * It reads from the SAME byDay map the grid was drawn from, so the modal can never disagree
   * with the count on the cell that opened it.
   */
  // Which day the open dialog was focused for. mountCard runs on EVERY render, so without this
  // the dialog grabs focus back each time -- including from the row somebody is tabbing towards.
  let calFocusedKey = '';

  function calDayModal(companyId, byDay, contact) {
    // Whose day it was. Without this, opening a day on one contact and then walking to another
    // carries the dialog across, where the same key finds nothing and it reads as "nothing on
    // this day" about a day nobody asked to see.
    const key = state.ccCalDayFor === contact.id ? String(state.ccCalDay || '') : '';
    if (!key) return '';
    const entries = entriesForKey(byDay, key);
    // The day emptied under them -- a record was deleted, or its date moved -- so say that
    // rather than drawing an empty dialog.
    const list = entries.length
      ? entries.map((entry) => {
        const href = entryHref(companyId, entry);
        const body = `
          <span class="cc-cal-row-main">
            <b>${h(entry.title)}</b>
            <small><em>${h(entry.label)}</em>${h(entry.appName)}</small>
          </span>
          <span class="cc-cal-row-day">${h(formatDate(entry.at))}</span>`;
        // Without a route there is nowhere to send them; a dead link that looks live is worse
        // than a row that plainly is not one.
        return href
          ? `<a class="cc-cal-row" href="${h(href)}" data-router data-cc-cal-go>${body}<i class="ti ti-chevron-right"></i></a>`
          : `<span class="cc-cal-row is-flat">${body}</span>`;
      }).join('')
      : '<p class="cc-empty">Nothing on this day any more.</p>';

    return `
      <div class="cc-cal-modal" data-cc-cal-backdrop>
        <div class="cc-cal-dialog" role="dialog" aria-modal="true" aria-labelledby="ccCalDayTitle">
          <header>
            <h4 id="ccCalDayTitle"><i class="ti ti-calendar-event"></i>${h(keyTitle(key))}</h4>
            <button class="wb-icon-btn" type="button" data-cc-cal-close aria-label="Close"><i class="ti ti-x"></i></button>
          </header>
          <div class="cc-cal-rows">${list}</div>
        </div>
      </div>`;
  }

  function useRow(companyId, use, item, show = {}, picked = null) {
    const facts = item.facts || {};
    const meta = [];

    // The app's OWN fields, chosen per app in the panel's settings. Rendered first, because
    // somebody who went to the trouble of nominating "Project type" wants to read it before the
    // generic stamps. A field that no longer resolves is skipped rather than rendered blank.
    if (picked?.app && picked.fields?.length) {
      picked.fields.forEach((fieldId) => {
        const field = (picked.app.fields || []).find((item2) => item2.id === fieldId);
        if (!field) return;
        const text = String(wbPlainVal(companyId, picked.workspace, picked.app, field, item.values?.[field.id], item.values) || '').trim();
        if (!text) return;
        // The label is optional. With several fields nominated it is the longest thing on the
        // row, and the value is the part being read -- but it is on by default, because a bare
        // value with nothing to say what it is only reads once you already know the layout.
        const label = show.labels !== false ? `<em>${h(field.label)}</em>` : '';
        meta.push(`<span class="cc-use-fact cc-use-picked">${label}${h(text)}</span>`);
      });
    }
    if (show.duration !== false && facts.duration !== null && facts.duration !== undefined) {
      meta.push(`<span class="cc-use-fact"><i class="ti ti-clock-hour-4"></i>${h(wbFmtDuration(facts.duration))}</span>`);
    }
    // A stamp reads as "8m ago" and a typed date as "Aug 20, 2026": one answers "how long has
    // this been sitting?", the other answers "when is it happening?".
    if (show.dates !== false) {
      (facts.dates || []).forEach((date) => {
        const icon = date.relative ? 'ti-history' : 'ti-calendar';
        const text = date.relative ? timeAgo(date.value) : formatDate(date.value);
        meta.push(`<span class="cc-use-fact"><i class="ti ${icon}"></i>${h(date.label)} ${h(text)}</span>`);
      });
    }
    if (show.edited !== false && facts.updatedAt) {
      meta.push(`<span class="cc-use-fact"><i class="ti ti-pencil"></i>Edited ${h(timeAgo(facts.updatedAt))}</span>`);
    }

    // The row's title. Worked out by itemTitle unless this app names a field for it -- "Case #"
    // reads better than the first text field on an app whose first text field is a note.
    let title = item.title;
    if (picked?.app && picked.title) {
      const field = (picked.app.fields || []).find((item2) => item2.id === picked.title);
      const text = field
        ? String(wbPlainVal(companyId, picked.workspace, picked.app, field, item.values?.[field.id], item.values) || '').trim()
        : '';
      // Falls back rather than showing a blank row: a record with nothing in the chosen field
      // still has to be identifiable enough to click.
      if (text) title = text;
    }

    const body = `
      <span class="cc-use-main">
        <span class="cc-use-title">${h(title)}</span>
        ${show.stage !== false && facts.stage ? `<span class="cc-use-stage" style="--cc-stage:${h(facts.stage.color || '#6b7280')}">${h(facts.stage.label)}</span>` : ''}
      </span>
      ${meta.length ? `<span class="cc-use-meta">${meta.join('')}</span>` : ''}`;

    // A builder-only workspace has no route, so the row stays plain text rather than becoming
    // a link that goes nowhere.
    if (!use.workspaceRouteId) return `<span class="cc-use-row is-flat">${body}</span>`;
    // workspace / app_id / item_id are the parameter names the router reads. The old link used
    // ws / app / item, which it ignores -- so these rows opened the workspaces section and
    // never the record.
    const href = appHref(companyPath('workspaces', {
      workspace: use.workspaceRouteId, app_id: use.appId, tab: 'items', item_id: item.id,
    }, companyId));
    return `
      <a class="cc-use-row" href="${h(href)}" data-router title="Open ${h(item.title)} in ${h(use.appName)}">
        ${body}<i class="ti ti-arrow-right"></i>
      </a>`;
  }

  /**
   * The company's tile layout, off the builder document.
   *
   * A stat tile is not a field -- "Open balance" is computed across every workspace and belongs
   * to no field at all -- so it has nowhere on a field row to live. The builder doc is already
   * localStorage-mirrored, realtime-synced, merged on conflict and in the backup, which is four
   * problems a new table would have had to solve again.
   */
  function cardSettings(companyId) {
    return normalizeCardSettings(wbDoc(companyId)?.contactCard);
  }

  /**
   * One stat tile's value.
   *
   * Every one of these comes out of the usage scan the card already runs, plus the contact's own
   * columns. Nothing here costs a query.
   */
  function tileFacts(companyId, contact, uses, tile) {
    const stamp = contact.last_activity_at || contact.updated_at;
    switch (tile.id) {
      case 'balance': {
        const balance = usageBalance(uses);
        return { value: balance ? money(balance) : '—', sub: 'across every workspace' };
      }
      case 'records': {
        const records = uses.reduce((sum, use) => sum + use.count, 0);
        return { value: String(records), sub: records ? `${uses.length} app${uses.length === 1 ? '' : 's'}` : 'not referenced yet' };
      }
      case 'workspaces':
        return { value: String(new Set(uses.map((use) => use.workspaceId)).size), sub: 'using this contact' };
      case 'touch':
        return { value: stamp ? timeAgo(stamp) : '—', sub: '' };
      case 'apps':
        return { value: String(uses.length), sub: uses.length === 1 ? 'app' : 'apps' };
      case 'quiet': {
        if (!stamp) return { value: '—', sub: '' };
        const days = Math.max(0, Math.floor((Date.now() - new Date(stamp).getTime()) / 86400000));
        return { value: String(days), sub: days === 1 ? 'day' : 'days' };
      }
      case 'stages': {
        const stages = new Set(uses.flatMap((use) => use.items.map((item) => item.facts?.stage?.label)).filter(Boolean));
        return { value: String(stages.size), sub: 'across their records' };
      }
      case 'newest': {
        const newest = uses.flatMap((use) => use.items.map((item) => item.createdAt)).filter(Boolean).sort().pop();
        return { value: newest ? timeAgo(newest) : '—', sub: newest ? 'most recent' : 'nothing yet' };
      }
      case 'first':
        return { value: contact.created_at ? formatDate(contact.created_at) : '—', sub: 'in the directory' };
      default:
        return { value: '—', sub: '' };
    }
  }

  const tileHtml = (label, value, sub, span) => `
    <div class="cc-tile cc-el" style="--cc-span:${span}"><span>${h(label)}</span><strong>${h(value)}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</div>`;

  /**
   * A custom button, wherever it sits.
   *
   * The data-wb-press / data-wb-when / disabled contract is the App Builder's, copied rather
   * than re-derived: the click delegate and syncButtons both read it, and a second version of
   * it here is how the two drift into disagreeing about which buttons are live.
   *
   * draggable="false" is required, not cosmetic: a <button> inside a pointer-drag surface
   * otherwise starts the browser's own drag and the gesture dies halfway.
   */
  function cardButtonHtml(companyId, contact, button, pin, span = 1) {
    const text = String(button.label || '').trim();
    const icon = String(button.icon || '').trim();
    const rules = Array.isArray(button.when) ? button.when : [];
    const ready = cardButtonReady(button);
    const style = pin ? pinStyle(pin) : null;
    const placement = pin
      ? `data-pin-x="${h(style.x)}" data-pin-y="${h(style.y)}" style="--pin-x:${h(style.vars['--pin-x'])};--pin-y:${h(style.vars['--pin-y'])};--pin-z:${h(style.vars['--pin-z'])}"`
      : `style="--cc-span:${span}"`;
    return `<button class="btn btn-primary cc-card-btn cc-el${pin ? ' cc-pin' : ''}" type="button"
      draggable="false"
      data-cc-btn="${h(button.id)}"
      data-wb-press="${h(button.id)}" data-wb-press-ctx="cc|${h(companyId)}|${h(contact.id)}"
      data-wb-when="${h(JSON.stringify(rules))}" ${ready ? '' : 'disabled data-wb-no-target="1"'}
      aria-label="${h(text || 'Action')}"
      title="${h(ready ? '' : cardButtonNotReady(button))}"
      ${placement}>${icon ? `<i class="ti ${h(icon)}"></i>` : ''}${h(text)}</button>`;
  }

  /**
   * One of the four built-in panels.
   *
   * They used to be printed in a fixed order, always all four. They are elements now, so the
   * renderer asks for one by id and the layout decides whether, where and how wide.
   */
  function builtinPanelHtml(companyId, contact, doc, uses, longFields, id, span, config = {}) {
    const box = (inner) => `<div class="cc-panel cc-el" style="--cc-span:${span}">${inner}</div>`;
    if (id === 'inflight') {
      // 0 means all of them. A cap of five was the old hardcoded rule; it is now typed, and
      // "Show more" only appears when something is actually being held back.
      const step = Number(config.limit) > 0 ? Number(config.limit) : 0;
      const meta = (use) => {
        const parts = [];
        if (config.count !== false) parts.push(`${use.count} record${use.count === 1 ? '' : 's'}`);
        if (config.balance !== false && use.balance) parts.push(h(money(use.balance)));
        return parts.join(' · ');
      };
      // Where each connected app actually lives, so a chosen field can be resolved and rendered.
      const byAppId = new Map(appsWithContactFields(doc).map((entry) => [entry.app.id, entry]));
      return box(`
        <h3><i class="ti ti-briefcase"></i>In flight</h3>
        ${uses.length ? uses.map((use) => {
    // Each "Show more" reveals another page of the same size, so choosing 5 gives 5, then 10.
    const moreKey = `inflight:${use.appId}`;
    const cap = step ? step * (1 + (state.ccMore?.[moreKey] || 0)) : use.items.length;
    const shown = use.items.slice(0, cap);
    const facts = meta(use);
    const seat = byAppId.get(use.appId);
    const chosen = (config.apps || {})[use.appId] || { title: '', fields: [] };
    const picked = seat ? { ...seat, ...chosen } : null;
    return `
          <div class="cc-use">
            <div class="cc-use-head">
              <b>${h(use.appName)}</b>
              <span class="cc-ws">${h(use.workspaceName)}</span>
              ${facts ? `<em>${facts}</em>` : ''}
            </div>
            ${shown.map((item) => useRow(companyId, use, item, config, picked)).join('')}
            ${use.count > shown.length ? `<button class="cc-show-more" type="button" data-action="cc-show-more" data-key="${h(moreKey)}">Show ${Math.min(step, use.count - shown.length)} more <span>· ${use.count - shown.length} left</span></button>` : ''}
          </div>`;
  }).join('')
      : '<p class="cc-empty">Nothing references this contact yet. Add a Company Contact field to a workspace app and pick them on a record.</p>'}`);
    }
    if (id === 'notes') {
      return box(`
        <h3><i class="ti ti-note"></i>${h(longFields[0]?.field.label || 'Notes')}</h3>
        ${longFields.length ? longFields.map((element) => `
          <p class="cc-notes">${h(companyContactValue(contact, element.field))}</p>`).join('')
      : '<p class="cc-empty">Nothing written down yet.</p>'}`);
    }
    if (id === 'activity') return activityPanel(companyId, doc, contact, span, config);
    if (id === 'calendar') return calendarPanel(companyId, doc, contact, span, config);
    return '';
  }

  /**
   * The controls that hang on an element while the card is being edited.
   *
   * Rendered INSIDE the element it belongs to, so there is no second coordinate system to keep
   * in step -- the toolbar moves because the element moved. Everything the settings tab can do
   * to an element is here: how wide, which way, and take it off.
   */
  /**
   * The panel-contents editor, when a panel has anything to choose about itself.
   *
   * "In flight" can show a stage, a duration, dates and an edited stamp on every row -- a team
   * that only reads the stage wants the rest gone. The vocabulary lives in card-layout.js, so
   * this draws whatever that declares rather than knowing each panel by name.
   */
  /**
   * Which of each connected app's own fields show on its rows.
   *
   * The list of apps is not a setting -- it is whatever currently references this contact, so it
   * answers "which apps is this person in?" at the same time as it configures them. An app the
   * contact leaves simply stops appearing; its chosen fields stay stored against the app id and
   * come back if they are used again.
   */
  function perAppFieldsHtml(companyId, element) {
    const doc = wbDoc(companyId);
    const seats = appsWithContactFields(doc);
    if (!seats.length) {
      return '<div class="wb-sub">No app references this contact yet. Point a Company Contact field at them on a record and the app will appear here.</div>';
    }
    const chosen = (element.config || {}).apps || {};
    return `
      <div class="cc-app-fields">
        <div class="wb-sub">Beyond the facts above, each app can show its own fields on a row — pick <b>Project type</b> in Estimating and it reads there without the other apps changing.</div>
        ${seats.map(({ workspace, app }) => {
    const entry = chosen[app.id] || { title: '', fields: [] };
    const picked = new Set(entry.fields || []);
    // A button is a control, not a value, so it is never offered. A Company Contact field IS
    // offered: it was excluded on the grounds that it would print the name of the person whose
    // card you are on, but that is only true of the field pointing back at THEM -- an app with a
    // second one (Referred by, Site contact) names somebody else, which is worth reading. The
    // one pointing back is dropped where it is resolved, in itemTitle, which can see the value.
    const offer = (app.fields || []).filter((field) => field.type !== 'button');
    return `
          <div class="cc-app-field-row">
            <b>${h(workspace.name)} › ${h(app.name)}</b>
            <label class="cc-app-title">Row title
              <select class="wb-input" data-action="cc-panel-app-title" data-key="${h(element.key)}" data-app="${h(app.id)}">
                <option value="" ${entry.title ? '' : 'selected'}>Work it out automatically</option>
                ${offer.map((field) => `<option value="${h(field.id)}" ${entry.title === field.id ? 'selected' : ''}>${h(field.label)}</option>`).join('')}
              </select>
              <small>What names each row. Automatic prefers a Company Contact field naming somebody else, then the first text field.</small>
            </label>
            ${offer.length ? `<div class="wb-chip-pick">
              ${offer.map((field) => `
                <button type="button" class="wb-chip ${picked.has(field.id) ? 'on' : ''}" aria-pressed="${picked.has(field.id) ? 'true' : 'false'}"
                  data-action="cc-panel-app-field" data-key="${h(element.key)}" data-app="${h(app.id)}" data-field="${h(field.id)}">${h(field.label)}</button>`).join('')}
            </div>` : '<span class="wb-sub">This app has no fields to show yet.</span>'}
          </div>`;
  }).join('')}
      </div>`;
  }

  /**
   * A button's own settings: its name, its icon, and what it does.
   *
   * One function, used by the settings dialog AND by the editor on the card, so a button is
   * configured the same way wherever you found it. Every control writes straight through --
   * ccBindCardButtons binds them by data attribute, so both places share the wiring too.
   */
  function cardButtonConfigHtml(companyId, button, canManage) {
    const apps = wbCompanyApps(button.targetCompany || companyId);
    const chosen = new Set(button.fields || []);
    // Everything a button could carry. The contact's NAME is not among them -- it travels as
    // the Company Contact link, which is what ties the new record back to this card.
    const sendable = companyContactFieldsFor(companyId).filter((field) => !CC_DERIVED_TYPES.has(field.type));
    return `
      <div class="cc-btn-grid">
        <label>Name
          <input class="wb-input" value="${h(button.label)}" data-cc-btn-label="${h(button.id)}" aria-label="Button name" ${canManage ? '' : 'disabled'} />
        </label>
        <label>Icon
          <input class="wb-input" value="${h(button.icon)}" placeholder="ti-send" data-cc-btn-icon="${h(button.id)}" ${canManage ? '' : 'disabled'} />
          <small>A Tabler name, like <b>ti-send</b>. Blank for text only.</small>
        </label>
        <label>What it does
          <select class="wb-input" data-cc-btn-action="${h(button.id)}" ${canManage ? '' : 'disabled'}>
            ${CARD_BUTTON_ACTIONS.map(([id, label, hint]) => `<option value="${id}" title="${h(hint)}" ${button.action === id ? 'selected' : ''}>${h(label)}</option>`).join('')}
          </select>
        </label>
      </div>

      ${button.action === 'push' ? `
        <div class="cc-btn-grid">
          <label>Send it to
            <select class="wb-input" data-cc-btn-app="${h(button.id)}" ${canManage ? '' : 'disabled'}>
              <option value="">— Choose a workspace app —</option>
              ${apps.map(({ workspace, app }) => `<option value="${h(app.id)}" ${button.targetApp === app.id ? 'selected' : ''}>${h(workspace.name)} › ${h(app.name)}</option>`).join('')}
            </select>
            <small>${apps.length ? 'The record lands here, with a <b>Contact</b> field pointing back at this contact.' : 'No apps in this company yet.'}</small>
          </label>
        </div>
        <div class="wb-field">
          <div class="wb-check-row">
            <label class="wb-switch"><input type="checkbox" data-cc-btn-pick="${h(button.id)}" ${button.pickFields ? 'checked' : ''} ${canManage ? '' : 'disabled'} /><span class="wb-slider"></span></label>
            <div><b>Choose which details to send</b><div class="wb-sub">Off, it sends every field on this contact — matched to the app by name, and created there if it has none. The contact's <b>name</b> always travels, as the Contact link.</div></div>
          </div>
          ${button.pickFields ? `
            <div class="wb-chip-pick">
              ${sendable.map((field) => `
                <button type="button" class="wb-chip ${chosen.has(field.id) ? 'on' : ''}" aria-pressed="${chosen.has(field.id) ? 'true' : 'false'}"
                  data-action="cc-btn-field" data-button="${h(button.id)}" data-field="${h(field.id)}" ${canManage ? '' : 'disabled'}>${h(field.label)}</button>`).join('')}
              ${sendable.length ? '' : '<span class="wb-sub">This contact has no fields to send yet.</span>'}
            </div>` : ''}
        </div>` : ''}

      ${button.action === 'link' ? `
        <label class="cc-btn-full">Where it goes
          <input class="wb-input" value="${h(button.href)}" placeholder="tel:{Phone}" data-cc-btn-href="${h(button.id)}" ${canManage ? '' : 'disabled'} />
          <small>A web address, <b>tel:5551234567</b>, or <b>mailto:someone@example.com</b>. Put a field's name in braces to fill it in — <b>tel:{Phone}</b> dials whoever is open.</small>
        </label>` : ''}

      ${button.action === 'set' ? '<div class="wb-sub">Changing fields on the contact is configured from the Fields tab for now — pick the field there, then set this button to it.</div>' : ''}`;
  }

  function panelSettingsHtml(element) {
    // A button's settings are its own; a panel's are what it shows about itself.
    if (element.kind === 'button') {
      return `<div class="cc-el-settings is-button">${cardButtonConfigHtml(activeCompanyId(), element.button, can('company_contacts.manage', activeCompanyId()))}</div>`;
    }
    const spec = PANEL_OPTIONS[element.panel?.id];
    if (!spec) return '';
    const config = element.config || {};
    return `
      <div class="cc-el-settings">
        ${(spec.toggles || []).map(([key, label]) => `
          <label class="cc-el-toggle">
            <input type="checkbox" data-action="cc-panel-toggle" data-key="${h(element.key)}" data-opt="${h(key)}" ${config[key] !== false ? 'checked' : ''} />
            <span>${h(label)}</span>
          </label>`).join('')}
        ${spec.limit ? `
          <label class="cc-el-choice">${h(spec.limit.label)}
            <input class="wb-input cc-el-num" type="number" min="0" max="999" step="1"
              value="${h(String(config.limit ?? 0))}" data-action="cc-panel-limit" data-key="${h(element.key)}" />
            <small>${h(spec.limit.hint || '')}</small>
          </label>` : ''}
        ${spec.choice ? `
          <label class="cc-el-choice">${h(spec.choice.label)}
            <select class="wb-input" data-action="cc-panel-choice" data-key="${h(element.key)}" data-opt="${h(spec.choice.key)}">
              ${spec.choice.choices.map(([value, label]) => `<option value="${h(value)}" ${config[spec.choice.key] === value ? 'selected' : ''}>${h(label)}</option>`).join('')}
            </select>
          </label>` : ''}
      </div>
      ${spec.perApp ? perAppFieldsHtml(activeCompanyId(), element) : ''}`;
  }

  function elementToolbar(element) {
    const sizeable = !SIZELESS_REGIONS.has(element.region);
    // A panel can choose what it shows; a button can choose its name, icon and function.
    const configurable = !!PANEL_OPTIONS[element.panel?.id] || element.kind === 'button';
    const open = configurable && state.ccPanelSettings === element.key;
    return `
      <div class="cc-el-tools" data-cc-el-tools>
        <span class="cc-el-name">${h(element.label)}</span>
        ${sizeable ? `<span class="cc-el-sizes">${CARD_SPANS.map(([id, label]) => `
          <button type="button" class="cc-el-size ${element.span === id ? 'on' : ''}" aria-pressed="${element.span === id ? 'true' : 'false'}"
            data-action="cc-el-span" data-key="${h(element.key)}" data-span="${id}" title="${h(label)}" aria-label="${h(label)}">${label[0]}</button>`).join('')}</span>` : ''}
        ${configurable ? `<button type="button" class="wb-icon-btn ${open ? 'on' : ''}" data-action="cc-panel-settings" data-key="${h(element.key)}" title="What this panel shows" aria-expanded="${open ? 'true' : 'false'}" aria-label="Choose what ${h(element.label)} shows"><i class="ti ti-adjustments"></i></button>` : ''}
        <button type="button" class="wb-icon-btn" data-action="cc-el-move" data-key="${h(element.key)}" data-dir="up" title="Move earlier" aria-label="Move ${h(element.label)} earlier"><i class="ti ti-chevron-up"></i></button>
        <button type="button" class="wb-icon-btn" data-action="cc-el-move" data-key="${h(element.key)}" data-dir="down" title="Move later" aria-label="Move ${h(element.label)} later"><i class="ti ti-chevron-down"></i></button>
        <button type="button" class="wb-icon-btn" data-action="cc-el-remove" data-key="${h(element.key)}" title="Take off the card — it stays in Add back" aria-label="Take ${h(element.label)} off the card"><i class="ti ti-x"></i></button>
        ${element.kind === 'button' ? `
          <button type="button" class="wb-icon-btn danger" data-action="cc-btn-remove" data-button="${h(element.button.id)}" title="Delete this button for good" aria-label="Delete ${h(element.label)} permanently"><i class="ti ti-trash"></i></button>` : ''}
      </div>
      ${open ? panelSettingsHtml(element) : ''}`;
  }

  /** One placed element, drawn the way its region deserves. */
  function elementHtml(companyId, contact, uses, element, extra = {}) {
    const span = spanColumns(element.span);
    if (element.kind === 'tile') {
      const facts = tileFacts(companyId, contact, uses, element.tile);
      return tileHtml(element.tile.label, facts.value, facts.sub, span);
    }
    if (element.kind === 'panel') {
      return builtinPanelHtml(companyId, contact, extra.doc, uses, extra.longFields || [], element.panel.id, span, element.config || {});
    }
    if (element.kind === 'button') return cardButtonHtml(companyId, contact, element.button, null, span);

    const field = element.field;
    if (element.region === 'tiles') {
      return `<div class="cc-tile cc-el" style="--cc-span:${span}"><span>${h(field.label)}</span><strong>${fieldCell(companyId, contact, field)}</strong></div>`;
    }
    if (element.region === 'panels') {
      return `<div class="cc-panel cc-el" style="--cc-span:${span}"><h3>${h(field.label)}</h3><p class="cc-notes">${h(String(companyContactValue(contact, field) || ''))}</p></div>`;
    }
    if (element.region === 'footer') return `<span class="cc-el" style="--cc-span:${span}">${fieldCell(companyId, contact, field)}</span>`;
    if (element.region === 'summary') {
      // A summary segment reads as one word in a line of them, so it is drawn compactly rather
      // than as a labelled box -- but it IS a block, which is what makes it editable.
      const value = displayValue(field, companyContactValue(contact, field));
      return `<div class="cc-summary-seg cc-el" style="--cc-span:${span}"><span>${h(field.label)}</span><b>${value ? h(value) : '<em>empty</em>'}</b></div>`;
    }
    // Details: the directory's own cell, so a rating is stars here too and a photo is the photo.
    // A card that printed "4" where the table printed stars would read as two different products
    // describing one person.
    return `
      <div class="cc-detail cc-el" style="--cc-span:${span}"><span>${h(field.label)}</span>${field.type === 'file'
        ? `<span class="cc-detail-files">${wbFileValues(companyContactValue(contact, field)).map((file) => (file.url
          ? `<a href="${h(file.url)}" target="_blank" rel="noreferrer"><i class="ti ${h(wbFileIcon(fileTypeKind({ file_name: file.name })))}"></i>${h(file.name)}</a>`
          : `<span><i class="ti ti-file"></i>${h(file.name)}</span>`)).join('')}</span>`
        : `<b>${fieldCell(companyId, contact, field)}</b>`}</div>`;
  }

  /**
   * The pins hanging in one anchor, in reading order.
   *
   * Emitted last inside their anchor and ordered top-to-bottom, so when the phone rule drops
   * positioning entirely they stack in the order the desktop card scans.
   */
  function pinLayer(companyId, contact, list) {
    return readingOrder(list || [])
      .map((element) => cardButtonHtml(companyId, contact, element.button, element.pin))
      .join('');
  }

  function renderCard(companyId, contact) {
    const doc = wbDoc(companyId);
    const uses = contactUsage(doc, contact.id, { nameValue: wbNameValue });
    const canManage = can('company_contacts.manage', companyId);
    const chipField = companyContactChipField(companyId);
    const chip = companyContactValue(contact, chipField);
    const arranging = canManage && state.ccCardArrange === true;

    // Reading a card, a field with nothing in it is noise, so an empty one is left off.
    //
    // ARRANGING it, that rule is exactly wrong: you are laying out the template for every
    // contact, and a field that happens to be blank on THIS person still has to be placeable --
    // otherwise it is invisible in the editor and cannot be moved, sized or taken off at all.
    // That is what made five of six fields unfindable while editing.
    const fields = companyContactFieldsFor(companyId);
    const placeable = fields.filter((field) => field !== chipField && (
      arranging
      || companyContactValue(contact, field) !== ''
      || autoCellHtml(companyId, contact, field) !== null));

    const elements = cardElements(placeable, cardSettings(companyId));
    const groups = groupByRegion(elements);
    const pins = pinsByAnchor(elements);
    const needed = anchorsInUse(elements);

    const meta = groups.summary
      .filter((element) => element.kind === 'field')
      .map((element) => displayValue(element.field, companyContactValue(contact, element.field)))
      .filter(Boolean);
    const longFields = groups.panels.filter((element) => element.kind === 'field' && element.field.type === 'textarea');

    // While editing, every block is wrapped so its own controls hang on it. The wrapper carries
    // the span and the inner block fills it, so the toolbar cannot drift from the thing it
    // edits -- it is inside it.
    const draw = (list, extra = {}) => list.map((element) => {
      const html = elementHtml(companyId, contact, uses, element, extra);
      if (!arranging || !html) return html;
      return `<div class="cc-el cc-el-wrap" style="--cc-span:${spanColumns(element.span)}" data-cc-el="${h(element.key)}">
        ${elementToolbar(element)}
        <div class="cc-el-inner">${html}</div>
      </div>`;
    }).join('');

    /**
     * A region is drawn when it holds something OR when a pin names it.
     *
     * That second half is the whole reason there is no fallback chain, and therefore no
     * teleporting: an anchor a pin names is present on EVERY contact. An empty region wrapper is
     * a zero-height grid, so a button pinned to the tiles row on a contact with no tiles sits
     * exactly where the tiles row would have been, which is the predictable answer.
     */
    const region = (id, cls, inner) => ((inner || needed.has(id))
      ? `<div class="cc-region ${cls}" data-cc-anchor="${id}">${inner}${pinLayer(companyId, contact, pins[id])}</div>`
      : '');

    // Every panel is an element now -- the four built-ins included. They sort and size with
    // everything else, so "put the calendar first and make it full width" is a layout change
    // rather than a code change.
    const panelsInner = draw(
      groups.panels.filter((element) => !(element.kind === 'field' && element.field.type === 'textarea')),
      { doc, longFields },
    );

    // What is off the card, offered back. This is "add tile / add panel" -- nothing was ever
    // deleted, so putting one back is one click and needs no picker dialog.
    const offCard = groups.off.filter((element) => element.kind !== 'field' || element.field.type !== 'button');
    const editor = arranging ? `
      <div class="cc-card-editor" data-cc-card-editor>
        <div class="cc-card-editor-head">
          <b><i class="ti ti-layout-grid"></i>Editing this card</b>
          <span class="cc-card-editor-hint">Resize, reorder or remove any block with the controls on it. Drag a button anywhere — arrow keys nudge, Shift+arrow moves further.</span>
          <button class="btn btn-sm" type="button" data-action="cc-add-button-here"><i class="ti ti-plus"></i>Add button</button>
          <button class="btn btn-sm btn-primary" type="button" data-action="cc-card-arrange"><i class="ti ti-check"></i>Done</button>
        </div>
        ${offCard.length ? `
          <div class="cc-card-add">
            <span>Add back:</span>
            ${offCard.map((element) => {
    // Two things can legitimately share a label -- the built-in Notes PANEL and a field a
    // company also called Notes -- and two identical chips is a coin toss. Only the ones that
    // actually collide get the qualifier, so the common case stays clean.
    const clash = offCard.filter((other) => other.label === element.label).length > 1;
    const kind = element.kind === 'panel' ? 'panel' : element.kind === 'tile' ? 'tile' : element.kind === 'button' ? 'button' : 'field';
    return `
              <button class="btn btn-mini" type="button" data-action="cc-el-add" data-key="${h(element.key)}"><i class="ti ti-plus"></i>${h(element.label)}${clash ? ` <span class="cc-add-kind">${h(kind)}</span>` : ''}</button>`;
  }).join('')}
          </div>` : '<div class="cc-card-add"><span>Everything is on the card.</span></div>'}
      </div>` : '';

    return `
      <div class="cc-card${arranging ? ' is-arranging' : ''}" data-cc-card data-cc-company="${h(companyId)}" data-cc-anchor="card">
        <div class="cc-crumb">
          <!-- A button to get back to the directory, and deliberately still an <a>. It reads and
               behaves as a button, but a real href keeps middle-click, Cmd-click, "open in new
               tab" and "copy link" working -- all of which a <button> with a click handler
               silently drops, and all of which somebody stepping through a list of contacts
               actually uses. -->
          <a class="btn btn-sm cc-crumb-back" href="${h(appHref(companyPath('company-contacts', {}, companyId)))}" data-router
            title="Back to Company Contacts" aria-label="Back to Company Contacts"><i class="ti ti-arrow-left" aria-hidden="true"></i>Company Contacts</a>
          <b class="cc-crumb-here">${h(contact.name)}</b>
          ${canManage ? `
            <span class="cc-crumb-actions">
              <button class="btn btn-sm" type="button" data-action="open-company-record-form" data-mode="edit" data-contact-id="${h(contact.id)}"><i class="ti ti-pencil"></i>Edit info</button>
              <button class="btn btn-sm btn-icon ${arranging ? 'btn-primary' : ''}" type="button" data-action="cc-card-arrange" title="Edit this card — add, resize, reorder and place" aria-label="Edit this card">
                <i class="ti ti-${arranging ? 'check' : 'settings'}"></i>
              </button>
            </span>` : ''}
        </div>

        <header class="cc-profile-head" data-cc-anchor="head">
          <span class="cc-avatar cc-avatar-lg" style="background:${h(chipColor(companyId, chip))}">${h(initials(contact.name))}</span>
          <div>
            <h2>${h(contact.name)}
              ${chip ? `<span class="cc-type" style="--cc-type:${h(chipColor(companyId, chip))}">${h(chip)}</span>` : ''}
            </h2>
            ${arranging
    // While editing, the summary line becomes real blocks. As plain text its fields have no
    // controls and never reach the Add back list, so they read as missing from the card
    // entirely -- which is what "where are the other data" was about.
    ? `<div class="cc-region cc-summary-edit">${draw(groups.summary)}</div>`
    : `<p>${meta.length ? h(meta.join(' · ')) : 'No details on file'}</p>`}
          </div>
          ${groups.header.length ? `<div class="cc-profile-actions">${draw(groups.header)}</div>` : ''}
          ${pinLayer(companyId, contact, pins.head)}
        </header>

        ${editor}

        ${region('tiles', 'cc-tiles', draw(groups.tiles))}
        ${region('detail', 'cc-detail-grid', draw(groups.detail))}
        ${region('panels', 'cc-panels', panelsInner)}

        <div class="cc-card-foot" data-cc-anchor="footer">
          <a class="btn" href="${h(appHref(companyPath('company-contacts', {}, companyId)))}" data-router><i class="ti ti-arrow-left"></i>Back to Company Contacts</a>
          ${draw(groups.footer)}
          ${pinLayer(companyId, contact, pins.footer)}
        </div>
        ${pinLayer(companyId, contact, pins.card)}
      </div>`;
  }

  function renderCompanyContactsPage(route, companyId) {
    const contactId = route.params.get('contact_id');
    if (contactId) {
      const contact = companyContactById(contactId);
      if (contact && contact.company_id === companyId) return renderCard(companyId, contact);
    }
    return renderDirectory(companyId);
  }

  // One input per customer-defined field. Each type gets the control it deserves rather than
  // a text box with a label: a date picks a date, a category picks from the list, money is
  // right-aligned and numeric. Name stays outside the list -- it is the title, and a contact
  // without one cannot be found again.
  function fieldControl(companyId, field, value) {
    const name = `field:${field.id}`;
    const req = field.required ? ' required' : '';
    const label = `<span>${h(field.label)}${field.required ? '<b class="req">*</b>' : ''}</span>`;
    switch (field.type) {
      case 'textarea':
        return `<label class="span-2">${label}<textarea name="${h(name)}" rows="3"${req}>${h(value)}</textarea></label>`;
      case 'number':
        return `<label>${label}<input name="${h(name)}" type="number" step="any" value="${h(value)}"${req} /></label>`;
      case 'money':
        return `<label>${label}<input class="cc-money-input" name="${h(name)}" type="number" step="0.01" inputmode="decimal" value="${h(value)}"${req} /></label>`;
      case 'date':
        return `<label>${label}<input name="${h(name)}" type="date" value="${h(String(value).slice(0, 10))}"${req} /></label>`;
      case 'phone':
        return `<label>${label}<input name="${h(name)}" type="tel" value="${h(value)}" placeholder="555 123 4567" inputmode="tel" autocomplete="tel" data-phone-format${req} /></label>`;
      case 'email':
        return `<label>${label}<input name="${h(name)}" type="email" value="${h(value)}" autocomplete="off"${req} /></label>`;
      case 'checkbox':
        // The hidden input first: an unchecked box sends nothing, and a missing key is
        // indistinguishable from a field somebody deleted.
        return `<label class="cc-check-field">${label}<span class="cc-check"><input type="hidden" name="${h(name)}" value="no" /><input type="checkbox" data-cc-check="${h(name)}" ${String(value) === 'yes' ? 'checked' : ''} /><em>${String(value) === 'yes' ? 'Yes' : 'No'}</em></span></label>`;
      case 'category': {
        const options = (field.config.options || []).map((option) => option.label).filter(Boolean);
        return renderSearchCombobox(h, field.label, name, value, options, {
          placeholder: `Choose ${field.label.toLowerCase()}`, removeKind: field.id,
        });
      }
      case 'file': {
        // The App Builder's file field, markup for markup: click or drop, a progress bar, and
        // the upload mirrored into Company Drive. wbMountFileFields binds it and writes the
        // hidden input, which carries the form name so FormData still collects it.
        const multiple = field.config.multiple === true;
        const drive = JSON.stringify({ root: 'Company Contacts', group: '', field: field.label });
        return `<label class="span-2">${label}
          <div class="wb-file-field" data-wb-file data-wb-file-scope="Company Contacts" data-wb-file-hint="Shared with every workspace" data-wb-file-drive="${h(drive)}" ${multiple ? 'data-wb-file-multi' : ''}>
            <input type="hidden" name="${h(name)}" data-f="${h(field.id)}" value="${h(value)}" />
            <input type="file" hidden accept="${h(acceptAttr('document'))}" data-wb-file-input ${multiple ? 'multiple' : ''} />
            <button type="button" class="wb-file-drop" data-wb-file-open>
              <i class="ti ti-cloud-upload" data-wb-file-ico></i>
              <span class="wb-file-label" data-wb-file-label></span>
            </button>
            ${multiple ? '<ul class="wb-file-list" data-wb-file-list></ul>' : `<div class="wb-file-actions" data-wb-file-actions hidden>
              <a class="btn btn-mini" data-wb-file-view target="_blank" rel="noreferrer"><i class="ti ti-eye"></i>View</a>
              <a class="btn btn-mini" data-wb-file-download><i class="ti ti-download"></i>Download</a>
              <button type="button" class="btn btn-mini danger" data-wb-file-remove><i class="ti ti-x"></i>Remove</button>
            </div>`}
            <div class="wb-file-progress" data-wb-file-progress hidden><div class="wb-file-bar" data-wb-file-bar></div></div>
          </div>
        </label>`;
      }
      case 'location':
        return `<label>${label}
          <div class="address-lookup-control">
            <input name="${h(name)}" value="${h(value)}" data-address-lookup-input autocomplete="street-address" placeholder="Address, city, or place"${req} />
            <button class="address-pin-button" type="button" data-address-map-link data-action="open-location-picker" data-location-kind="input" data-location-field="${h(name)}" title="Find it on a map" aria-label="Find ${h(field.label)} on a map"><i class="ti ti-map-pin"></i><span>Map</span></button>
          </div>
        </label>`;
      // Multi-select is the one type drawn here rather than borrowed. The App Builder can use a
      // native <select multiple> because its modal reads selectedOptions directly; a <form>
      // cannot -- FormData keeps only the last value, and a recovery draft restores only one
      // option. Chips over a single hidden JSON input make it one named value like everything
      // else, and read better than "hold Ctrl to pick several" besides.
      case 'tags': {
        const chosen = tagIds(value);
        const options = field.config.options || [];
        if (!options.length) return `<label class="span-2">${label}<div class="wb-sub">Add some options to this field first — open <b>Fields</b> and configure ${h(field.label)}.</div></label>`;
        return `<label class="span-2">${label}
          <div class="wb-chip-pick" data-wb-tagpick>
            <input type="hidden" name="${h(name)}" data-f="${h(field.id)}" value="${h(chosen.length ? JSON.stringify(chosen) : '')}" />
            ${options.map((option) => {
    const on = chosen.includes(option.id);
    return `<button type="button" class="wb-chip ${on ? 'on' : ''}" data-wb-tag="${h(option.id)}" aria-pressed="${on ? 'true' : 'false'}" style="--chip:${h(option.color || '#6b7280')}">${h(option.label)}</button>`;
  }).join('')}
          </div>
        </label>`;
      }
      default:
        // Everything the App Builder already draws, drawn by the App Builder. The value inputs
        // come back carrying [data-f] and no name; wbNameContactFieldInputs gives them the
        // `field:<id>` name this form saves and restores by, so nothing here has to know which
        // of them is a hidden input, a range or a star row.
        if (COMPANY_CONTACT_WB_TYPES.has(field.type)) {
          const wide = ['sheet', 'checklist', 'image'].includes(field.type) ? ' span-2' : '';
          return `<div class="cc-wb-field${wide}">${wbRenderFieldInput(companyId, '', field, wbValueFor(field, value))}</div>`;
        }
        return `<label>${label}<input name="${h(name)}" value="${h(value)}" autocomplete="off"${req} /></label>`;
    }
  }

  /** Option ids on a multi-select, from the JSON the form stores or a bare single value. */
  function tagIds(value) {
    if (Array.isArray(value)) return value.map(String);
    const raw = String(value || '').trim();
    if (!raw) return [];
    if (raw[0] === '[') { try { const list = JSON.parse(raw); return Array.isArray(list) ? list.map(String) : []; } catch { return []; } }
    return [raw];
  }

  /**
   * A stored contact value in the shape the App Builder's renderer expects.
   *
   * Contacts store every value as a string, because field_values is one JSON object filled from
   * a form. The record form is handed richer values, so the two disagree in exactly two places:
   * a checkbox, which is a boolean there and 'yes'/'no' here, and a multi-select, which is an
   * array there and JSON text here. Everything else -- checklists, sheets, files -- is JSON text
   * on both sides and parses the same.
   */
  function wbValueFor(field, value) {
    if (field.type === 'tags') return tagIds(value);
    if (field.type === 'checkbox') return String(value) === 'yes';
    return value;
  }

  // A contact belongs to the company, not to any one workspace -- so its recovery draft is
  // keyed the same way. Keying it by whichever workspace happened to be open would hide a
  // half-typed contact from the person who switched workspace and came back for it.
  const CC_DRAFT_SCOPE = 'company';

  function renderCompanyContactEditor(companyId, contact) {
    const edit = contact || { id: '', name: '', field_values: {} };
    const fields = companyContactFieldsFor(companyId);
    return `
      <form class="job-editor cc-editor" data-company-record-form ${protectedFormDraftAttributes('company-contact', edit.id || 'new', companyId, CC_DRAFT_SCOPE)}>
        <input type="hidden" name="id" value="${h(edit.id || '')}" />
        <input type="hidden" name="company_id" value="${h(companyId)}" />
        <div class="section-head span-2">
          <div><h2>${contact ? 'Edit contact' : 'New company contact'}</h2>
          <p>Visible in every workspace. Workspace apps point at this record with a Company Contact field.</p></div>
        </div>
        ${renderProtectedFormDraftStrip()}
        <label><span>Name<b class="req">*</b></span><input name="name" value="${h(edit.name)}" required autocomplete="off" /></label>
        ${fields.map((field) => fieldControl(companyId, field, edit.field_values?.[field.id] ?? '')).join('')}
        ${fields.length ? '' : '<p class="cc-empty span-2">No fields beyond the name yet. Add some with <b>Fields</b> on the directory.</p>'}
        <div class="form-actions span-2">
          <button class="btn btn-primary" type="submit">Save contact</button>
          ${contact ? `<button class="btn danger" type="button" data-action="delete-company-record" data-contact-id="${h(contact.id)}">Delete</button>` : ''}
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>`;
  }


  // ---- The field list ------------------------------------------------------
  // "I want this to be fully customize where I can build its Fields just like in the app
  // builder." So it IS the App Builder's field editor -- the same markup, the same drag to
  // reorder, the same palette to drag a type in from. Rebuilding a second, nearly-identical
  // editor would drift from it the first time either one changed.
  //
  // Everything is edited against a draft and written on Save. Adding a field, then changing
  // your mind about it, should cost nothing and leave nothing behind.
  let fieldDraft = null;

  // The App Builder's palette, in the App Builder's order, minus the three types that name an
  // app: relationship, rollup and button. An app lives in one workspace and a contact belongs
  // to the whole company, so there is no answer to "which app" from here.
  //
  // Everything else is offered, because a contact is not a thinner thing than a record -- a sub
  // has a rating and an insurance expiry, a client has a photo and an account manager, a
  // supplier has a price sheet. The list is derived from the same whitelist main.js validates
  // against, so the palette and the normalizer cannot drift into disagreeing about a type.
  const CC_PALETTE = COMPANY_CONTACT_FIELD_TYPES;
  const OPTION_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

  function openCompanyContactFieldEditor(companyId) {
    fieldDraft = {
      companyId,
      removed: [],
      editing: '',
      // A deep-enough copy that editing options in the draft cannot reach the live field.
      fields: companyContactFieldsFor(companyId).map((field) => ({
        ...field, config: { ...field.config, options: [...(field.config.options || [])] },
      })),
      // The card half, drafted alongside the fields so one Save writes everything. It comes
      // from a different store -- the builder doc -- but the person arranging the card is not
      // thinking about two stores, and should not have to press Save twice.
      tiles: cardSettings(companyId).tiles.map((tile) => ({ ...tile })),
      panels: cardSettings(companyId).panels.map((panel) => ({ ...panel })),
      buttons: cardSettings(companyId).buttons.map((button) => ({ ...button })),
    };
  }

  function closeCompanyContactFieldEditor() {
    fieldDraft = null;
  }

  const draftField = (fieldId) => fieldDraft?.fields.find((field) => field.id === fieldId) || null;

  // Read the open config panel back before any action that re-renders. Without this, dragging
  // a row discards the label you just typed into another one -- render() rebuilds the DOM.
  function syncFieldDraft() {
    const field = draftField(fieldDraft?.editing);
    const panel = document.querySelector('[data-cc-field-config]');
    if (!field || !panel) return;
    const label = panel.querySelector('[data-cc-field-label]');
    const required = panel.querySelector('[data-cc-field-required]');
    if (label && label.value.trim()) field.label = label.value.trim();
    if (required) field.required = required.checked;
    const multiple = panel.querySelector('[data-cc-field-multiple]');
    if (multiple) field.config = { ...field.config, multiple: multiple.checked };
    // The option rows are edited in place -- a colour swatch and a label input each -- so
    // they are read back the same way, or renaming a choice and then adding another loses
    // the rename.
    const rows = [...panel.querySelectorAll('.wb-opt-item')];
    if (rows.length) {
      field.config = {
        ...field.config,
        options: rows.map((row) => ({
          id: row.dataset.oid,
          label: row.querySelector('.wb-opt-label')?.value.trim() || 'Option',
          color: row.querySelector('.wb-dot-pick')?.value || '#2563eb',
        })),
      };
    }
    // The borrowed panels are read back by the module that drew them. Their control ids belong
    // to that panel -- a formula box, a step list, a number prefix -- and naming them here is
    // how the two halves drift apart the first time either changes.
    if (COMPANY_CONTACT_WB_TYPES.has(field.type)) {
      const next = { ...field.config };
      wbCollectFieldConfig(field.type, next, fieldDraft.companyId);
      field.config = next;
    }
  }

  // A palette type dropped in, at the row it was dropped on. Labelled from the type and made
  // unique, so two Text fields do not both read "Text" in the directory header.
  function addCompanyContactField(type, index) {
    if (!fieldDraft || !CC_PALETTE.includes(type)) return;
    syncFieldDraft();
    let label = WB_FIELD_TYPES[type]?.label || 'Field';
    if (fieldDraft.fields.some((field) => field.label === label)) {
      let n = 2;
      while (fieldDraft.fields.some((field) => field.label === `${label} ${n}`)) n += 1;
      label = `${label} ${n}`;
    }
    const field = {
      id: `ccf-${fieldDraft.companyId}-${crypto.randomUUID().slice(0, 8)}`,
      company_id: fieldDraft.companyId,
      label, type, required: false, hidden: false,
      // A field whose whole point is a list of choices starts with the list, so its panel opens
      // on an "Add option" button rather than on nothing.
      config: ['category', 'status', 'tags'].includes(type) ? { options: [] } : {},
      position: 0,
    };
    const at = Number.isInteger(index) && index >= 0 && index <= fieldDraft.fields.length ? index : fieldDraft.fields.length;
    fieldDraft.fields.splice(at, 0, field);
    // Straight into its config, because a field called "Text" is not finished, and a category
    // with no choices cannot be filled in at all.
    fieldDraft.editing = field.id;
    render();
  }

  // Removing a field here only stops it being collected. The values already stored on
  // contacts stay in field_values -- adding the field back brings them into view again, which
  // makes a mistaken delete recoverable without a restore.
  function removeCompanyContactField(fieldId) {
    if (!fieldDraft) return;
    syncFieldDraft();
    if (companyContactFieldsFor(fieldDraft.companyId).some((field) => field.id === fieldId)) {
      fieldDraft.removed.push(fieldId);
    }
    fieldDraft.fields = fieldDraft.fields.filter((field) => field.id !== fieldId);
    if (fieldDraft.editing === fieldId) fieldDraft.editing = '';
    render();
  }

  function toggleCompanyContactFieldHidden(fieldId) {
    const field = draftField(fieldId);
    if (!field) return;
    syncFieldDraft();
    field.hidden = !field.hidden;
    render();
  }

  function configureCompanyContactField(fieldId) {
    if (!fieldDraft) return;
    syncFieldDraft();
    fieldDraft.editing = fieldDraft.editing === fieldId ? '' : fieldId;
    render();
  }

  // Drop a row onto another row. Reorder only -- there is one list, so there is nowhere else
  // a field could land.
  function moveCompanyContactField(fromId, toId) {
    if (!fieldDraft || fromId === toId) return;
    syncFieldDraft();
    const from = fieldDraft.fields.findIndex((field) => field.id === fromId);
    const to = fieldDraft.fields.findIndex((field) => field.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = fieldDraft.fields.splice(from, 1);
    fieldDraft.fields.splice(to, 0, moved);
    render();
  }

  const fieldIndexOf = (fieldId) => (fieldDraft ? fieldDraft.fields.findIndex((field) => field.id === fieldId) : -1);

  // A blank row, ready to be typed into -- the App Builder's Add option, not a box you fill
  // in first. The colour cycles so a fresh list is not ten identical dots.
  function addCompanyContactFieldOption(fieldId, label = '') {
    const field = draftField(fieldId);
    if (!field) return;
    syncFieldDraft();
    const options = field.config.options || [];
    const clean = String(label || '').trim();
    if (clean && options.some((option) => option.label.toLowerCase() === clean.toLowerCase())) { render(); return; }
    field.config = {
      ...field.config,
      options: [...options, {
        id: `cco-${crypto.randomUUID().slice(0, 8)}`,
        label: clean,
        color: OPTION_COLORS[options.length % OPTION_COLORS.length],
      }],
    };
    render();
  }

  function removeDraftFieldOption(fieldId, optionId) {
    const field = draftField(fieldId);
    if (!field) return;
    syncFieldDraft();
    field.config = { ...field.config, options: (field.config.options || []).filter((option) => option.id !== optionId) };
    render();
  }

  async function saveCompanyContactFields() {
    if (!fieldDraft) return;
    // Both tabs, whichever is on screen. One Save writes the dialog, so a placement chosen on
    // the card tab and a rename typed on the fields tab land together.
    syncFieldDraft();
    syncCardDraft();
    const companyId = fieldDraft.companyId;
    if (!requirePermission('company_contacts.manage', companyId)) return;

    const unnamed = fieldDraft.fields.find((field) => !String(field.label || '').trim());
    if (unnamed) { showToast('Every field needs a label.', 'local', 'Company Contacts'); return; }
    // A choice somebody added and never typed into is not a choice.
    fieldDraft.fields.forEach((field) => {
      if (field.config.options) field.config = { ...field.config, options: field.config.options.filter((option) => option.label && option.label !== 'Option') };
    });

    // Position is the order on screen, renumbered on every save: dragging a field to the top
    // and having it come back third is the bug that makes reordering not worth using.
    const fields = fieldDraft.fields.map((field, index) => normalizeCompanyContactField({ ...field, position: index + 1 }));
    for (const field of fields) {
      const { ok } = await supabaseWrite('company_contact_fields', supabaseRow(field, COMPANY_CONTACT_FIELD_COLS));
      if (!ok) { showToast(`Could not save "${field.label}".`, 'local', 'Company Contacts'); return; }
    }

    if (fieldDraft.removed.length) {
      const client = createSupabaseClient();
      if (client) {
        const { error } = await client.from('company_contact_fields').delete().in('id', fieldDraft.removed);
        if (error) { showToast(error.message || 'Could not remove that field.', 'local', 'Company Contacts'); return; }
      }
    }

    // The tile half, which lives on the builder document. Written after the fields so a failure
    // there does not leave the card half-arranged, and gated on the permission that store needs
    // -- a role that can manage contacts but not workspaces still saves everything else.
    if (can('workspaces.manage', companyId)) await saveContactCardTiles(companyId);

    const removed = new Set(fieldDraft.removed);
    state.companyContactFields = [
      ...state.companyContactFields.filter((field) => field.company_id !== companyId && !removed.has(field.id)),
      ...fields,
    ];
    fieldDraft = null;
    state.modal = '';
    showToast('Card settings saved.', isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    render();
  }

  // The panel that hangs under the row being configured. Deliberately the App Builder's field
  // dialog, minus everything that only makes sense inside an app -- including its ABSENCE of a
  // type picker: a type is chosen from the palette when the field is added, because changing
  // it afterwards would reinterpret every value already stored under it. Wrong type, delete
  // and drag the right one in.
  function fieldConfigPanel(field) {
    if (!fieldDraft || fieldDraft.editing !== field.id) return '';
    const meta = WB_FIELD_TYPES[field.type] || WB_FIELD_TYPES.text;
    const options = field.config.options || [];
    return `
      <div class="cc-field-config" data-cc-field-config data-field-id="${h(field.id)}">
        <div class="cc-field-config-head">
          <span class="wb-field-ic" style="background:${meta.color}22;color:${meta.color}"><i class="ti ${meta.icon}"></i></span>
          <b>Configure ${h(meta.label)} field</b>
        </div>
        <div class="wb-field">
          <label>Field label</label>
          <input class="wb-input" type="text" data-cc-field-label value="${h(field.label)}" placeholder="${h(meta.label)} field name" />
        </div>
        ${field.type === 'file' ? `
          <div class="wb-check-row">
            <label class="wb-switch"><input type="checkbox" data-cc-field-multiple ${field.config.multiple ? 'checked' : ''} /><span class="wb-slider"></span></label>
            <div><b>Allow multiple files</b><div class="wb-sub">Attach several to one contact. Turning this off later keeps every file already attached — it only stops new ones being added.</div></div>
          </div>` : ''}
        ${field.type === 'category' ? `
          <div class="wb-field">
            <label>Options</label>
            <div class="wb-opt-list">${options.map((option) => optionRow(h, option)).join('')}</div>
            <button class="btn btn-sm" type="button" data-cc-add-option data-field-id="${h(field.id)}"><i class="ti ti-plus"></i>Add option</button>
          </div>` : ''}
        ${COMPANY_CONTACT_WB_TYPES.has(field.type) ? wbFieldConfigUI(field, contactsAsApp(fieldDraft.companyId)) : ''}
        <div class="wb-check-row">
          <label class="wb-switch"><input type="checkbox" data-cc-field-required ${field.required ? 'checked' : ''} /><span class="wb-slider"></span></label>
          <div><b>Required field</b><div class="wb-sub">Contacts can't be saved without it.</div></div>
        </div>
        <div class="cc-field-config-done">
          <button type="button" class="btn btn-primary btn-sm" data-action="configure-company-contact-field" data-field-id="${h(field.id)}"><i class="ti ti-check"></i>Done</button>
        </div>
      </div>`;
  }

  // ---- Settings > Contact card ---------------------------------------------
  //
  // "Inside settings you can customize how the contacts looks in the contact card."
  //
  // Where each field lands, and which one badges the contact. Both are stored on the FIELD's
  // own config rather than in a company-level settings row: there is no such row, and both
  // answers are genuinely about one field. That also means Save writes them through the same
  // path as a rename, so this tab needs no write of its own.
  //
  /**
   * The draft's elements, which is what every row on this tab is one of.
   *
   * All THREE card stores, not just the tiles. Passing only `tiles` let normalizeCardSettings
   * default the rest, so the panels came back at their defaults and the buttons vanished
   * entirely -- the tab would have quietly reset the card on Save.
   */
  function draftElements() {
    return cardElements(fieldDraft.fields, {
      tiles: fieldDraft.tiles,
      panels: fieldDraft.panels,
      buttons: fieldDraft.buttons,
    });
  }

  /** Sizing is meaningless where the region does not lay things out on the grid. */
  const SIZELESS_REGIONS = new Set(['summary', 'header', 'footer', 'pin', 'off']);

  function renderCompanyContactCardSettings(companyId) {
    if (!fieldDraft || fieldDraft.companyId !== companyId) openCompanyContactFieldEditor(companyId);
    const canManage = can('company_contacts.manage', companyId);
    const canTiles = can('workspaces.manage', companyId);
    const badgeable = fieldDraft.fields.filter((field) => field.type === 'category' || field.type === 'status');
    const current = companyContactChipField(companyId);
    const elements = draftElements();
    const warnings = pinWarnings(elements);
    const buttons = elements.filter((element) => element.kind === 'button');

    const sizes = (element) => {
      if (SIZELESS_REGIONS.has(element.region)) return '<span class="cc-card-nosize">—</span>';
      return `<div class="wb-w-sizes" role="group" aria-label="Width of ${h(element.label)}">
        ${CARD_SPANS.map(([id, label]) => `
          <button type="button" class="wb-w-size ${element.span === id ? 'on' : ''}" aria-pressed="${element.span === id ? 'true' : 'false'}"
            data-action="cc-card-span" data-key="${h(element.key)}" data-span="${id}" title="${h(label)}" ${canManage ? '' : 'disabled'}>${label[0]}</button>`).join('')}
      </div>`;
    };

    // One row per element, and the element may be any of four kinds. Only a FIELD has a
    // `.field` -- a tile has `.tile`, a panel has `.panel`, a button has `.button` -- so
    // reaching for element.field.type here is what made this whole tab throw.
    const metaOf = (element) => {
      if (element.kind === 'tile') {
        return { label: element.tile.kind === 'builtin' ? 'Stat tile' : 'Computed', icon: 'ti-chart-bar', color: '#0891b2' };
      }
      if (element.kind === 'panel') return { label: 'Panel', icon: element.panel.icon || 'ti-layout-grid', color: '#7c3aed' };
      if (element.kind === 'button') return { label: 'Button', icon: element.button.icon || 'ti-click', color: '#e0552d' };
      return WB_FIELD_TYPES[element.field?.type] || WB_FIELD_TYPES.text;
    };

    const row = (element) => {
      const meta = metaOf(element);
      // Tiles and panels live on the builder document, which needs a different permission.
      const locked = (element.kind === 'tile' || element.kind === 'panel') && !canTiles;
      return `
        <div class="cc-card-row" data-cc-card-row="${h(element.key)}" draggable="${canManage && !locked ? 'true' : 'false'}">
          <span class="cc-card-grip" aria-hidden="true"><i class="ti ti-grip-vertical"></i></span>
          <span class="wb-field-ic" style="background:${meta.color}22;color:${meta.color}"><i class="ti ${meta.icon}"></i></span>
          <span class="cc-card-row-name"><b>${h(element.label)}</b><small>${h(meta.label)}</small></span>
          <select class="wb-input cc-card-place" data-cc-card-place="${h(element.key)}" aria-label="Where ${h(element.label)} appears" ${canManage && !locked ? '' : 'disabled'}>
            ${regionsFor(element).map(([id, label, hint]) => `<option value="${id}" title="${h(hint)}" ${element.region === id ? 'selected' : ''}>${h(label)}</option>`).join('')}
          </select>
          ${sizes(element)}
          <span class="cc-card-move">
            <button class="wb-icon-btn" type="button" data-action="cc-card-move" data-key="${h(element.key)}" data-dir="up" aria-label="Move ${h(element.label)} up" ${canManage ? '' : 'disabled'}><i class="ti ti-chevron-up"></i></button>
            <button class="wb-icon-btn" type="button" data-action="cc-card-move" data-key="${h(element.key)}" data-dir="down" aria-label="Move ${h(element.label)} down" ${canManage ? '' : 'disabled'}><i class="ti ti-chevron-down"></i></button>
          </span>
        </div>`;
    };

    // The 3x3 pad. Nine one-click placements, so somebody who does not want to drag anything
    // never has to -- and so this works on a keyboard, which a drag never will.
    const pad = (element) => {
      const pin = element.pin || cardPinOf({ type: 'button', config: { card: 'pin' } });
      const at = PIN_PRESETS.findIndex((preset) => preset.x.at === pin.x.at && preset.y.at === pin.y.at);
      return `
        <div class="cc-pin-pad" role="group" aria-label="Reference point for ${h(element.label)}">
          ${PIN_PRESETS.map((preset, index) => `
            <button type="button" class="cc-pin-cell ${index === at ? 'on' : ''}" aria-pressed="${index === at ? 'true' : 'false'}"
              data-action="cc-pin-preset" data-field="${h(button.id)}" data-index="${index}"
              title="${h(preset.label)}" aria-label="${h(preset.label)}" ${canManage ? '' : 'disabled'}></button>`).join('')}
        </div>`;
    };

    const buttonRow = (element) => {
      const button = element.button;
      const pin = element.pin;
      const pinned = element.region === 'pin';
      const mine = warnings.filter((warning) => warning.key.includes(element.key));
      return `
        <div class="cc-btn-row" data-cc-btn-row="${h(button.id)}">
          <div class="cc-btn-head">
            <b>${h(button.label)}</b>
            <span class="cc-btn-spacer"></span>
            <button class="btn btn-sm danger" type="button" data-action="cc-btn-remove" data-button="${h(button.id)}" aria-label="Delete ${h(button.label)}"><i class="ti ti-trash"></i>Delete</button>
          </div>

          ${cardButtonConfigHtml(companyId, button, canManage)}

          ${pinned ? `
            <div class="cc-pin-editor">
              ${pad(element)}
              <div class="cc-pin-numbers">
                <label>Anchor
                  <select class="wb-input" data-cc-pin-anchor="${h(button.id)}" ${canManage ? '' : 'disabled'}>
                    ${CARD_ANCHORS.map(([id, label, hint]) => `<option value="${id}" title="${h(hint)}" ${pin.anchor === id ? 'selected' : ''}>${h(label)}</option>`).join('')}
                  </select>
                </label>
                <label>X <input class="wb-input" type="number" step="1" min="-400" max="400" value="${h(String(pin.x.px))}" data-cc-pin-x="${h(button.id)}" ${canManage ? '' : 'disabled'} /><small>px from the ${h(pin.x.at === 'center' ? 'centre' : `${pin.x.at} edge`)}</small></label>
                <label>Y <input class="wb-input" type="number" step="1" min="-400" max="400" value="${h(String(pin.y.px))}" data-cc-pin-y="${h(button.id)}" ${canManage ? '' : 'disabled'} /><small>px from the ${h(pin.y.at === 'center' ? 'middle' : `${pin.y.at} edge`)}</small></label>
                <label>Layer <input class="wb-input" type="number" step="1" min="1" max="99" value="${h(String(pin.z))}" data-cc-pin-z="${h(button.id)}" ${canManage ? '' : 'disabled'} /></label>
              </div>
            </div>` : '<div class="wb-sub">Set its placement to <b>Pinned</b> above to position it by hand, or drag it on the card itself with <b>Arrange</b>.</div>'}
          ${mine.map((warning) => `<div class="wb-sub cc-pin-warn"><i class="ti ti-alert-triangle"></i>${h(warning.text)}</div>`).join('')}
        </div>`;
    };

    return `
      <div class="cc-card-settings" data-cc-card-settings>
        <p class="ccf-intro">How a contact reads when somebody opens it. Choose what appears, how wide it is, and where your own buttons sit.</p>

        <div class="wb-field">
          <label>Badge beside the name</label>
          ${badgeable.length ? `
            <select class="wb-input" data-cc-card-badge ${canManage ? '' : 'disabled'} style="max-width:320px">
              ${badgeable.map((field) => `<option value="${h(field.id)}" ${current?.id === field.id ? 'selected' : ''}>${h(field.label)}</option>`).join('')}
            </select>
            <div class="wb-sub">Its colour tints the avatar and the chips above the directory. Only a Category or Status field can badge — the pill takes the chosen option's colour, and a date has none.</div>`
            : '<div class="wb-sub">Add a Category or Status field and it can badge every contact.</div>'}
        </div>

        <div class="wb-field">
          <label>What's on the card</label>
          ${canTiles ? '' : '<div class="wb-sub cc-pin-warn"><i class="ti ti-lock"></i>The stat tiles are stored with your workspaces, so arranging them needs <b>Manage workspaces</b>. Your fields and buttons below are unaffected.</div>'}
          <div class="cc-card-list">${elements.length ? elements.map(row).join('') : '<p class="cc-empty">No fields yet — add some on the Fields tab.</p>'}</div>
          <div class="wb-sub">Drag a row, or use the arrows, to reorder. Taking something off the card leaves it on the record and leaves its value stored — this is about what somebody reads at a glance, not about what a contact holds.</div>
        </div>

        <div class="wb-field">
          <label>Buttons</label>
          ${buttons.length
            ? buttons.map(buttonRow).join('')
            : '<div class="wb-sub">No buttons yet. A button can send this contact into a workspace app, change fields on the contact, or place a call.</div>'}
          <button class="btn btn-sm" type="button" data-action="cc-add-button-here" ${canManage ? '' : 'disabled'}><i class="ti ti-plus"></i>Add button</button>
        </div>
      </div>`;
  }

  /**
   * Read the card tab back into the draft.
   *
   * Same contract as syncFieldDraft: anything that re-renders has to call this first, or the
   * placement just chosen is thrown away when the DOM is rebuilt.
   */
  /** A row's key back to the thing it edits: `field:` / `tile:` / `panel:` / `button:`. */
  const draftTile = (id) => fieldDraft?.tiles.find((tile) => tile.id === id) || null;
  const draftPanel = (id) => fieldDraft?.panels.find((panel) => panel.id === id) || null;
  const draftButton = (id) => fieldDraft?.buttons.find((button) => button.id === id) || null;

  function targetOf(key) {
    const [kind, ...rest] = String(key || '').split(':');
    const id = rest.join(':');
    if (kind === 'tile') return { kind, tile: draftTile(id) };
    if (kind === 'panel') return { kind, panel: draftPanel(id) };
    if (kind === 'button') return { kind, button: draftButton(id) };
    return { kind: 'field', field: draftField(id) };
  }

  function syncCardDraft() {
    const panel = document.querySelector('[data-cc-card-settings]');
    if (!fieldDraft || !panel) return;

    panel.querySelectorAll('[data-cc-card-place]').forEach((select) => {
      const target = targetOf(select.dataset.ccCardPlace);
      if (target.tile) target.tile.region = select.value;
      else if (target.panel) target.panel.region = select.value;
      else if (target.button) target.button.card = select.value;
      else if (target.field) target.field.config = { ...target.field.config, card: select.value };
    });

    // A pin's numbers are typed, not dragged, for anybody who wants them exact -- and for
    // anybody on a keyboard, who has no drag at all. Keyed by BUTTON id: a button is a card
    // object now, so draftField would never find it.
    const pinOf = (button) => cardPinOf({ ...button, kind: 'button', card: 'pin' });
    const number = (node, fallback) => {
      const value = Number(node.value);
      return Number.isFinite(value) ? value : fallback;
    };
    panel.querySelectorAll('[data-cc-pin-anchor]').forEach((select) => {
      const button = draftButton(select.dataset.ccPinAnchor);
      if (button) button.pin = { ...pinOf(button), anchor: select.value };
    });
    panel.querySelectorAll('[data-cc-pin-x]').forEach((input) => {
      const button = draftButton(input.dataset.ccPinX);
      if (!button) return;
      const pin = pinOf(button);
      button.pin = { ...pin, x: { ...pin.x, px: number(input, pin.x.px) } };
    });
    panel.querySelectorAll('[data-cc-pin-y]').forEach((input) => {
      const button = draftButton(input.dataset.ccPinY);
      if (!button) return;
      const pin = pinOf(button);
      button.pin = { ...pin, y: { ...pin.y, px: number(input, pin.y.px) } };
    });
    panel.querySelectorAll('[data-cc-pin-z]').forEach((input) => {
      const button = draftButton(input.dataset.ccPinZ);
      if (!button) return;
      button.pin = { ...pinOf(button), z: number(input, pinOf(button).z) };
    });

    const badge = panel.querySelector('[data-cc-card-badge]');
    if (badge) {
      // Exactly one badge. Written to every candidate rather than only to the chosen one, or
      // switching the badge would leave the previous field still claiming it.
      fieldDraft.fields.forEach((field) => {
        if (field.type !== 'category' && field.type !== 'status') return;
        field.config = { ...field.config, badge: field.id === badge.value };
      });
    }
  }

  /** Write one element's size back into whichever store owns it. */
  function setCardSpan(key, span) {
    if (!fieldDraft) return;
    syncCardDraft();
    const target = targetOf(key);
    if (target.tile) target.tile.span = span;
    else if (target.panel) target.panel.span = span;
    else if (target.button) target.button.cardSpan = span;
    else if (target.field) target.field.config = { ...target.field.config, cardSpan: span };
    render();
  }

  /**
   * Move one element in the single ordering both stores share.
   *
   * The list is rebuilt, renumbered and split back apart, so a tile and a field can genuinely
   * interleave -- which is the only reason the ordering can be one list at all.
   */
  function moveCardElement(key, direction) {
    if (!fieldDraft) return;
    syncCardDraft();
    const elements = draftElements();
    const at = elements.findIndex((element) => element.key === key);
    const to = at + (direction === 'up' ? -1 : 1);
    if (at < 0 || to < 0 || to >= elements.length) return;
    commitElements(reorderElements(elements, key, elements[to].key));
    render();
  }

  /** A row dropped onto another row, from the settings list. */
  function dropCardElement(fromKey, toKey) {
    if (!fieldDraft || fromKey === toKey) return;
    syncCardDraft();
    commitElements(reorderElements(draftElements(), fromKey, toKey));
    render();
  }

  /** Put an edited element list back into the two stores it came from. */
  function commitElements(elements) {
    const { fields, tiles, panels: panelRows, buttons } = splitStores(elements);
    fieldDraft.fields.forEach((field) => {
      const placement = fields[field.id];
      if (placement) field.config = { ...field.config, ...placement };
    });
    const merge = (list, incoming) => list.map((entry) => {
      const next = incoming.find((item) => item.id === entry.id);
      return next ? { ...entry, ...next } : entry;
    });
    fieldDraft.tiles = merge(fieldDraft.tiles, tiles);
    fieldDraft.panels = merge(fieldDraft.panels, panelRows);
    fieldDraft.buttons = buttons;
  }

  /** One of the nine pad placements, applied to a button. */
  function setPinPreset(buttonId, index) {
    const button = draftButton(buttonId);
    const preset = PIN_PRESETS[Number(index)];
    if (!button || !preset) return;
    syncCardDraft();
    const pin = cardPinOf({ ...button, kind: 'button', card: 'pin' });
    button.card = 'pin';
    button.pin = { ...pin, x: { ...preset.x }, y: { ...preset.y } };
    render();
  }

  /** Add a button and open its action panel, because a button with no action does nothing. */
  function addCardButton() {
    addCompanyContactField('button');
  }

  /**
   * Write the tile half, which lives on the builder document rather than on any field row.
   *
   * saveWorkspaceBuilderDoc directly rather than wbSave: the companiesToSave fan-out and the
   * app-index invalidation are both about apps, and neither has anything to do with a tile.
   */
  async function saveContactCardTiles(companyId) {
    const doc = wbDoc(companyId);
    if (!doc) return;
    doc.contactCard = {
      v: 1,
      tiles: fieldDraft.tiles.map((tile) => ({ ...tile })),
      panels: fieldDraft.panels.map((panel) => ({ ...panel })),
      buttons: fieldDraft.buttons.map((button) => ({ ...button })),
    };
    await saveWorkspaceBuilderDoc(companyId);
  }

  function renderCompanyContactFieldsEditor(companyId) {
    if (!fieldDraft || fieldDraft.companyId !== companyId) openCompanyContactFieldEditor(companyId);
    const canManage = can('company_contacts.manage', companyId);
    return `
      <div class="cc-field-builder" data-cc-field-builder>
        <p class="ccf-intro">Every contact in this company carries these fields. <b>Name</b> is always there — it is the title in every list and link. Everything below is yours.</p>
        ${wbFieldBuilderMarkup(companyId, fieldDraft.fields, canManage, 'cc', CC_PALETTE, fieldConfigPanel)}
      </div>`;
  }

  /** One step of the calendar, in whatever the current view counts in. */
  function shiftContactCalendar(view, at, direction) {
    return shiftAnchor(CALENDAR_VIEWS.includes(view) ? view : 'month', at || new Date(), direction).toISOString();
  }

  // ---- arrange mode: dragging a button on the card itself --------------------------------
  //
  // The settings tab can place a button with one click on the 3x3 pad, and type its offsets
  // exactly. This is the other half -- putting it where you want it by hand, on the real card,
  // against the real contact.
  //
  // Nothing is measured at pointerdown, and nothing is written until release. The move is a
  // transform on the node and nothing else: no state write, no render(), so a re-render mid-drag
  // cannot fight the gesture. Release re-queries the button by id and re-measures, so an
  // interleaved render is survivable by construction rather than by luck.

  const DRAG_SLOP = 5;

  /** Persist one field's placement, straight through the same write a rename uses. */
  async function persistFieldPlacement(companyId, fieldId, placement) {
    const field = companyContactFieldsFor(companyId).find((item) => item.id === fieldId);
    if (!field) return false;
    if (!requirePermission('company_contacts.manage', companyId)) return false;
    const next = normalizeCompanyContactField({ ...field, config: { ...field.config, ...placement } });
    const { ok } = await supabaseWrite('company_contact_fields', supabaseRow(next, COMPANY_CONTACT_FIELD_COLS));
    if (!ok) { showToast('Could not save that placement.', 'local', 'Company Contacts'); return false; }
    state.companyContactFields = state.companyContactFields.map((item) => (item.id === next.id ? next : item));
    return true;
  }

  /** Where every anchor is, right now, in one coordinate space. */
  function anchorRects(card) {
    return [...card.querySelectorAll('[data-cc-anchor]')].map((node) => {
      const box = node.getBoundingClientRect();
      return {
        id: node.dataset.ccAnchor, left: box.left, top: box.top, width: box.width, height: box.height,
      };
    });
  }

  /**
   * Begin a drag. Returns the handlers main.js binds, so the DOM wiring stays where the rest of
   * the app's event binding lives and the geometry stays here.
   */
  function beginPinDrag(button, event) {
    const card = button.closest('[data-cc-card]');
    if (!card) return null;
    const companyId = card.dataset.ccCompany;
    const fieldId = button.dataset.ccBtn;
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;

    const move = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!moved && Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return;
      if (!moved) {
        moved = true;
        try { button.setPointerCapture(moveEvent.pointerId); } catch { /* capture is a nicety */ }
      }
      // The DOM is the preview. Nothing else happens until release.
      button.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };

    const release = async () => {
      button.style.transform = '';
      if (!moved) return false;
      // Re-query and re-measure: a render may have replaced this node while the pointer was
      // down, and the rect taken at pointerdown would describe a node that no longer exists.
      const liveCard = document.querySelector('[data-cc-card]');
      const liveButton = liveCard?.querySelector(`[data-cc-btn="${CSS.escape(fieldId)}"]`);
      if (!liveCard || !liveButton) { showToast('That button is no longer on the card.', 'local', 'Company Contacts'); return false; }
      const box = liveButton.getBoundingClientRect();
      const pin = pinFromRects(
        { left: box.left, top: box.top, width: box.width, height: box.height },
        anchorRects(liveCard),
      );
      const ok = await persistFieldPlacement(companyId, fieldId, { card: 'pin', pin });
      render();
      return ok;
    };

    return { move, release, moved: () => moved };
  }

  // ---- editing the card in place ---------------------------------------------------------
  //
  // Everything the Contact card settings tab can do, done on the card itself against the real
  // contact. There is no draft here and no Save: the settings dialog has one because it edits
  // fields that are not on screen, and a change made ON the card is already visible, so a Save
  // step would only be a chance to lose it.

  /** The live elements of a company's card, as the card itself builds them. */
  function liveElements(companyId) {
    return cardElements(companyContactFieldsFor(companyId), cardSettings(companyId));
  }

  /**
   * Write an edited element list back to both stores.
   *
   * Only fields whose placement actually CHANGED are written. Nudging one tile would otherwise
   * rewrite every field row on the contact, which is a dozen round trips to move one thing.
   */
  async function persistCardLayout(companyId, elements) {
    // panelRows, not `panels`: the extracted-module-reference guard treats a bare `panels` as a
    // module-level name, and main.js contains the STRING 'Metal panels (PBR / standing seam)'
    // in a price list -- which that guard reads as a call. A false positive, but a one-word
    // rename is cheaper than loosening a check that exists to catch real missing functions.
    const { fields, tiles, panels: panelRows, buttons } = splitStores(elements);
    const doc = wbDoc(companyId);
    if (doc) {
      if (!can('workspaces.manage', companyId)) {
        showToast('Arranging the tiles and panels needs Manage workspaces.', 'local', 'Company Contacts');
      } else {
        doc.contactCard = { v: 1, tiles, panels: panelRows, buttons };
        await saveWorkspaceBuilderDoc(companyId);
      }
    }
    const live = companyContactFieldsFor(companyId);
    for (const field of live) {
      const placement = fields[field.id];
      if (!placement) continue;
      const same = cardRegionOf(field) === placement.card
        && cardSpanOf(field) === placement.cardSpan
        && Number(field.config?.cardOrder ?? 0) === Number(placement.cardOrder);
      if (same) continue;
      // eslint-disable-next-line no-await-in-loop
      if (!await persistFieldPlacement(companyId, field.id, placement)) return false;
    }
    return true;
  }

  /** Apply one change to the live layout and write it. */
  async function editCardLayout(companyId, change) {
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const elements = liveElements(companyId);
    const next = change(elements);
    if (!next) return;
    await persistCardLayout(companyId, next);
    render();
  }

  /**
   * Change what one panel shows about itself.
   *
   * Merged rather than replaced, so ticking one box does not reset the other five to whatever
   * the defaults happen to be.
   */
  function setPanelOption(companyId, key, patch) {
    return editCardLayout(companyId, (elements) => elements.map((element) => (element.key === key
      ? { ...element, config: { ...(element.config || {}), ...patch } }
      : element)));
  }

  /** One panel's current per-app field map, so a caller can merge rather than replace it. */
  function panelAppFields(companyId, key) {
    return liveElements(companyId).find((element) => element.key === key)?.config?.apps || {};
  }

  /** Resize one block on the card. */
  function cardElementSpan(companyId, key, span) {
    return editCardLayout(companyId, (elements) => elements.map((element) => (element.key === key ? { ...element, span } : element)));
  }

  /** Move one block earlier or later in its region. */
  function cardElementMove(companyId, key, direction) {
    return editCardLayout(companyId, (elements) => {
      const region = elements.find((element) => element.key === key)?.region;
      // Reordered against its NEIGHBOURS IN THE SAME REGION. Against the whole flat list, one
      // press would jump a tile past every panel without appearing to move at all.
      const siblings = elements.filter((element) => element.region === region);
      const at = siblings.findIndex((element) => element.key === key);
      const to = at + (direction === 'up' ? -1 : 1);
      if (at < 0 || to < 0 || to >= siblings.length) return null;
      return reorderElements(elements, key, siblings[to].key);
    });
  }

  /** Take a block off the card. Nothing is deleted -- it goes back in the Add list. */
  function cardElementRemove(companyId, key) {
    return editCardLayout(companyId, (elements) => elements.map((element) => (element.key === key ? { ...element, region: 'off' } : element)));
  }

  /** Put a block back, on the shelf its kind belongs to. */
  function cardElementAdd(companyId, key) {
    return editCardLayout(companyId, (elements) => elements.map((element) => {
      if (element.key !== key) return element;
      const region = element.kind === 'panel' ? 'panels'
        : element.kind === 'tile' ? 'tiles'
          : element.kind === 'button' ? 'header'
            : element.field?.type === 'textarea' ? 'panels' : 'detail';
      return { ...element, region };
    }));
  }

  /**
   * Add a button from the card itself.
   *
   * Written straight through rather than drafted: there is no dialog open to press Save in, and
   * a button that appears only after a round trip through Settings is not "add a button here".
   */
  /** Write the card's button list straight to the builder document. */
  async function saveCardButtons(companyId, buttons) {
    const doc = wbDoc(companyId);
    if (!doc) return false;
    if (!can('workspaces.manage', companyId)) {
      showToast('Adding a button to the card needs Manage workspaces.', 'local', 'Company Contacts');
      return false;
    }
    const current = cardSettings(companyId);
    doc.contactCard = { v: 1, tiles: current.tiles, panels: current.panels, buttons };
    await saveWorkspaceBuilderDoc(companyId);
    return true;
  }

  /**
   * Add a button to the card.
   *
   * It is a card object, not a field: nothing is written to company_contact_fields, and no
   * contact gains a column. It opens beside Edit info and needs an action before it will do
   * anything, which is what the settings panel is for.
   */
  async function addCardButtonHere(companyId) {
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const buttons = cardSettings(companyId).buttons;
    let label = 'Button';
    if (buttons.some((button) => button.label === label)) {
      let n = 2;
      while (buttons.some((button) => button.label === `${label} ${n}`)) n += 1;
      label = `${label} ${n}`;
    }
    const made = normalizeCardButton({
      id: `ccb-${crypto.randomUUID().slice(0, 8)}`,
      label,
      action: 'push',
      card: 'header',
      cardOrder: buttons.length + 1,
    }, buttons.length);
    if (!await saveCardButtons(companyId, [...buttons, made])) return;
    showToast(`${label} added — give it an action to make it work.`, isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    render();
  }

  /** Change one button's configuration. */
  async function updateCardButton(companyId, buttonId, patch) {
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const buttons = cardSettings(companyId).buttons;
    const next = buttons.map((button, index) => (button.id === buttonId
      ? normalizeCardButton({ ...button, ...patch }, index)
      : button));
    if (!await saveCardButtons(companyId, next)) return;
    render();
  }

  /** Remove a button from the card. It is a card object, so this really does delete it. */
  async function removeCardButton(companyId, buttonId) {
    if (!requirePermission('company_contacts.manage', companyId)) return;
    const buttons = cardSettings(companyId).buttons.filter((button) => button.id !== buttonId);
    if (!await saveCardButtons(companyId, buttons)) return;
    showToast('Button removed.', isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
    render();
  }

  /** Arrow keys nudge a focused pin: the keyboard path, which a drag can never be. */
  async function nudgePinnedButton(button, dx, dy) {
    const card = button.closest('[data-cc-card]');
    if (!card) return;
    const companyId = card.dataset.ccCompany;
    const fieldId = button.dataset.ccBtn;
    const field = companyContactFieldsFor(companyId).find((item) => item.id === fieldId);
    if (!field || cardRegionOf(field) !== 'pin') return;
    const next = movePin(cardPinOf(field), dx, dy);
    if (await persistFieldPlacement(companyId, fieldId, { card: 'pin', pin: next })) render();
  }

  // ---- the DOM wiring, which lives here rather than in main.js ---------------------------
  //
  // Every one of these only ever runs on a Company Contacts screen, and this module is only
  // fetched when one is open -- so in main.js they were kilobytes of the ENTRY chunk that every
  // session downloads before anything renders, for a page most sessions never visit.
  //
  // That is not hygiene, it is the only lever that works: bundle-budget-lib.mjs records that a
  // statically imported module is bundled into the same chunk, so moving code out of main.js
  // shrinks nothing unless it lands somewhere lazily loaded. This is somewhere lazily loaded.

  /** Bind the card: its calendar, and -- while arranging -- its draggable buttons. */
  function mountCard() {
    const card = document.querySelector('[data-cc-card]');
    if (!card) return;

    const bind = (selector, handler) => card.querySelectorAll(selector)
      .forEach((el) => { el.onclick = (e) => { e.preventDefault(); handler(el, e); }; });

    // State only -- which view, and which week or month it is looking at -- so the card redraws
    // from the same records rather than fetching anything.
    bind('[data-cc-cal-view]', (el) => { state.ccCalView = el.dataset.ccCalView; render(); });
    bind('[data-cc-cal-step]', (el) => {
      state.ccCalAt = shiftContactCalendar(state.ccCalView, state.ccCalAt, Number(el.dataset.ccCalStep));
      render();
    });
    bind('[data-cc-cal-today]', () => { state.ccCalAt = ''; render(); });

    // Opening and closing what is on a day. The KEY is stored, not the entries: they are read
    // back out of the same records on the next draw, so the dialog cannot show a list the grid
    // behind it has stopped agreeing with.
    bind('[data-cc-cal-open]', (el) => {
      state.ccCalDay = el.dataset.ccCalOpen || '';
      state.ccCalDayFor = el.dataset.ccCalFor || '';
      render();
    });
    bind('[data-cc-cal-close]', () => { state.ccCalDay = ''; render(); });
    // Only a press on the backdrop ITSELF closes. Without the identity check every press inside
    // the dialog closes it on the way up, which makes the thing impossible to read.
    bind('[data-cc-cal-backdrop]', (el, event) => {
      if (event.target !== el) return;
      state.ccCalDay = '';
      render();
    });
    // NOT through `bind`: it calls preventDefault on everything it binds, which on a real link
    // is the difference between navigating and doing nothing at all. This only has to bank the
    // closed state on the way past, so the dialog is not still open on the way back.
    card.querySelectorAll('[data-cc-cal-go]').forEach((el) => {
      el.addEventListener('click', () => { state.ccCalDay = ''; });
    });

    // Escape closes it, and the dialog takes focus once so a screen reader reads the day rather
    // than leaving the caret on the cell that has just been covered over.
    const dialog = card.querySelector('.cc-cal-dialog');
    if (!state.ccCalDay) calFocusedKey = '';
    if (dialog) {
      dialog.tabIndex = -1;
      dialog.onkeydown = (event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        state.ccCalDay = '';
        render();
      };
      if (calFocusedKey !== state.ccCalDay) {
        calFocusedKey = state.ccCalDay;
        dialog.focus({ preventScroll: true });
      }
    }

    if (!state.ccCardArrange) return;
    bindCardButtonInputs();

    card.querySelectorAll('[data-cc-btn]').forEach((button) => {
      if (button.dataset.ccDragBound) return;
      button.dataset.ccDragBound = '1';
      button.tabIndex = 0;

      button.onpointerdown = (event) => {
        if (event.button !== 0) return;
        const drag = beginPinDrag(button, event);
        if (!drag) return;
        state.ccPinDrag = button.dataset.ccBtn;

        const move = (moveEvent) => drag.move(moveEvent);
        const release = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', release);
          window.removeEventListener('pointercancel', release);
          state.ccPinDrag = null;
          // Swallow the click this gesture is about to produce. Without it every drag ALSO
          // fires data-wb-press, and letting go of a button would push the contact into an app.
          if (drag.moved()) {
            window.addEventListener('click', (clickEvent) => {
              clickEvent.stopPropagation();
              clickEvent.preventDefault();
            }, { capture: true, once: true });
          }
          drag.release();
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
      };

      // The keyboard path. A drag can never be one, and placement that only works with a mouse
      // is placement half the people cannot use.
      button.onkeydown = (event) => {
        const step = event.shiftKey ? 10 : 1;
        const nudge = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
        if (nudge) {
          event.preventDefault();
          nudgePinnedButton(button, nudge[0], nudge[1]);
          return;
        }
        if (event.key === 'Escape') { state.ccCardArrange = false; render(); }
      };
    });
  }

  /**
   * A card button's own inputs, wherever they are drawn.
   *
   * Bound on `change` rather than `input` so a rename is one write when the box is left, not one
   * per keystroke.
   */
  function bindCardButtonInputs() {
    const companyId = activeCompanyId();
    const on = (selector, key, read) => document.querySelectorAll(selector).forEach((el) => {
      el.onchange = () => updateCardButton(companyId, el.dataset[key], read(el));
    });
    on('[data-cc-btn-label]', 'ccBtnLabel', (el) => ({ label: el.value }));
    on('[data-cc-btn-icon]', 'ccBtnIcon', (el) => ({ icon: el.value.trim() }));
    on('[data-cc-btn-action]', 'ccBtnAction', (el) => ({ action: el.value }));
    on('[data-cc-btn-href]', 'ccBtnHref', (el) => ({ href: el.value }));
    on('[data-cc-btn-pick]', 'ccBtnPick', (el) => ({ pickFields: el.checked }));
    // The app picker also stamps the company, so a button pointing at another workspace's app
    // still resolves when it is pressed.
    on('[data-cc-btn-app]', 'ccBtnApp', (el) => ({ targetApp: el.value, targetCompany: companyId }));
  }

  /**
   * Drag-to-reorder for the Contact card tab's element list.
   *
   * Handlers assigned as properties and the dragged key held in a closure, which is the App
   * Builder's idiom. A gesture inside a modal cannot outlive its mount, and realtime refreshes
   * are already suppressed while one is open, so there is nothing for a state key to survive.
   */
  function mountCardSettings() {
    bindCardButtonInputs();
    const rows = [...document.querySelectorAll('[data-cc-card-row]')];
    if (!rows.length) return;
    let dragKey = '';
    rows.forEach((row) => {
      if (row.getAttribute('draggable') !== 'true') return;
      row.ondragstart = (event) => {
        dragKey = row.dataset.ccCardRow;
        row.classList.add('is-dragging');
        // Firefox ignores a drag that sets no data.
        try { event.dataTransfer.setData('text/plain', dragKey); } catch { /* not essential */ }
        event.dataTransfer.effectAllowed = 'move';
      };
      row.ondragend = () => {
        dragKey = '';
        rows.forEach((other) => other.classList.remove('is-dragging', 'is-over'));
      };
      row.ondragover = (event) => {
        if (!dragKey || dragKey === row.dataset.ccCardRow) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        row.classList.add('is-over');
      };
      row.ondragleave = () => row.classList.remove('is-over');
      row.ondrop = (event) => {
        event.preventDefault();
        row.classList.remove('is-over');
        if (!dragKey || dragKey === row.dataset.ccCardRow) return;
        dropCardElement(dragKey, row.dataset.ccCardRow);
        dragKey = '';
      };
    });
  }

  /**
   * The Fields tab: the shared field builder's palette, its drag gestures, and the option rows.
   *
   * Also purely this page's, and also only reachable when this module is loaded.
   */
  function mountFieldsEditor() {
    mountCardSettings();

    const root = document.querySelector('[data-cc-field-builder]');
    if (!root) return;

    // The scope prefix the shared markup writes in front of every id. Stripped here rather than
    // threaded through, because this editor has exactly one list to put a field in.
    const bare = (raw) => String(raw || '').replace(/^cc:/, '');
    const bind = (selector, handler, event = 'onclick') => root.querySelectorAll(selector)
      .forEach((el) => { el[event] = (e) => { e.preventDefault(); handler(el, e); }; });

    bind('[data-add-type]', (el) => addCompanyContactField(bare(el.dataset.addType)));
    bind('[data-edit-field]', (el) => configureCompanyContactField(bare(el.dataset.editField)));
    bind('[data-hide-field]', (el) => toggleCompanyContactFieldHidden(bare(el.dataset.hideField)));
    bind('[data-del-field]', (el) => removeCompanyContactField(bare(el.dataset.delField)));

    bind('[data-cc-add-option]', (el) => addCompanyContactFieldOption(el.dataset.fieldId));
    bind('[data-wb-del-option]', (el) => removeDraftFieldOption(
      el.closest('[data-cc-field-config]')?.dataset.fieldId, el.closest('.wb-opt-item')?.dataset.oid,
    ));

    // Drag a type out of the palette; drop it on the list to append, or on a row to insert
    // there. The same two gestures the App Builder has.
    let dragId = '';
    let paletteType = '';
    root.querySelectorAll('.wb-palette-item').forEach((item) => {
      item.ondragstart = (event) => {
        paletteType = bare(item.dataset.wbPaletteType);
        item.classList.add('dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'copy';
          try { event.dataTransfer.setData('text/plain', paletteType); } catch { /* ignore */ }
        }
      };
      item.ondragend = () => {
        paletteType = '';
        item.classList.remove('dragging');
        root.querySelectorAll('.drop-target, .wb-drop-active').forEach((el) => el.classList.remove('drop-target', 'wb-drop-active'));
      };
    });

    const zone = root.querySelector('[data-wb-field-dropzone]');
    if (zone) {
      zone.ondragover = (event) => { if (paletteType) { event.preventDefault(); zone.classList.add('wb-drop-active'); } };
      zone.ondragleave = (event) => { if (event.target === zone) zone.classList.remove('wb-drop-active'); };
      zone.ondrop = (event) => {
        if (!paletteType) return;
        event.preventDefault();
        zone.classList.remove('wb-drop-active');
        const type = paletteType;
        paletteType = '';
        addCompanyContactField(type);
      };
    }

    root.querySelectorAll('.wb-field-row[draggable]').forEach((row) => {
      row.ondragstart = () => { dragId = bare(row.dataset.fid); row.classList.add('dragging'); };
      row.ondragend = () => { row.classList.remove('dragging'); root.querySelectorAll('.wb-field-row').forEach((el) => el.classList.remove('drop-target')); };
      row.ondragover = (event) => { event.preventDefault(); row.classList.add('drop-target'); };
      row.ondragleave = () => row.classList.remove('drop-target');
      row.ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        row.classList.remove('drop-target');
        const target = bare(row.dataset.fid);
        // A palette drag lands as an insert at that position; a row drag is a reorder.
        if (paletteType) {
          const type = paletteType;
          paletteType = '';
          addCompanyContactField(type, fieldIndexOf(target));
          return;
        }
        moveCompanyContactField(dragId, target);
      };
    });
  }

  /**
   * Every `cc-` action, dispatched here rather than as fifteen branches in main.js's delegate.
   *
   * Returns true when it handled the action, so main.js keeps one line and this module keeps the
   * fifteen bodies -- which is the point: they are only reachable from a screen this module is
   * loaded for.
   */
  function handleCardAction(action, node, event) {
    const companyId = activeCompanyId();
    const stop = () => event?.preventDefault();

    switch (action) {
      // -- the settings dialog's list
      case 'cc-card-span': stop(); setCardSpan(node.dataset.key, node.dataset.span); return true;
      case 'cc-card-move': {
        stop();
        const key = node.dataset.key;
        moveCardElement(key, node.dataset.dir);
        // Focus follows the row, or a second press with the keyboard moves whatever slid into
        // the place the pointer used to be over.
        requestAnimationFrame(() => {
          document.querySelector(`[data-cc-card-row="${CSS.escape(key)}"] [data-action="cc-card-move"][data-dir="${node.dataset.dir}"]`)?.focus();
        });
        return true;
      }
      case 'cc-pin-preset': stop(); setPinPreset(node.dataset.field, node.dataset.index); return true;

      // -- the editor on the card itself
      case 'cc-el-span': stop(); cardElementSpan(companyId, node.dataset.key, node.dataset.span); return true;
      case 'cc-el-move': stop(); cardElementMove(companyId, node.dataset.key, node.dataset.dir); return true;
      case 'cc-el-remove': stop(); cardElementRemove(companyId, node.dataset.key); return true;
      case 'cc-el-add': stop(); cardElementAdd(companyId, node.dataset.key); return true;

      case 'cc-add-button':
      case 'cc-add-button-here':
        stop();
        if (!requireMutableWorkspace()) return true;
        addCardButtonHere(companyId);
        return true;

      case 'cc-btn-remove': stop(); removeCardButton(companyId, node.dataset.button); return true;
      case 'cc-btn-field': {
        stop();
        // Read off the chips' own pressed state, so the stored list is whatever is lit rather
        // than a parallel copy that can drift. Scoped by data-button, NOT by an ancestor: the
        // same controls open from a button's gear on the card, where no wrapper exists.
        const buttonId = node.dataset.button;
        const chosen = [...document.querySelectorAll(`[data-action="cc-btn-field"][data-button="${CSS.escape(buttonId)}"]`)]
          .filter((chip) => (chip === node ? chip.getAttribute('aria-pressed') !== 'true' : chip.getAttribute('aria-pressed') === 'true'))
          .map((chip) => chip.dataset.field);
        updateCardButton(companyId, buttonId, { fields: chosen });
        return true;
      }

      // -- a panel's own contents
      case 'cc-panel-settings':
        stop();
        // One open at a time: two is two columns of checkboxes and no card left to see them against.
        state.ccPanelSettings = state.ccPanelSettings === node.dataset.key ? '' : node.dataset.key;
        render();
        return true;
      case 'cc-panel-app-field': {
        stop();
        const appId = node.dataset.app;
        const lit = [...document.querySelectorAll(`[data-action="cc-panel-app-field"][data-app="${CSS.escape(appId)}"]`)]
          .filter((chip) => (chip === node ? chip.getAttribute('aria-pressed') !== 'true' : chip.getAttribute('aria-pressed') === 'true'))
          .map((chip) => chip.dataset.field);
        const current = panelAppFields(companyId, node.dataset.key);
        const mine = current[appId] || { title: '', fields: [] };
        setPanelOption(companyId, node.dataset.key, { apps: { ...current, [appId]: { ...mine, fields: lit } } });
        return true;
      }

      case 'cc-show-more': {
        stop();
        // Runtime only: how far somebody expanded a list on this visit is not a company-wide
        // setting, and persisting it would change the card for everybody else.
        const key = node.dataset.key;
        state.ccMore = { ...(state.ccMore || {}), [key]: (state.ccMore?.[key] || 0) + 1 };
        render();
        return true;
      }

      case 'cc-card-arrange':
        stop();
        // A pointer drag is not a data-action, so the read-only guard never sees it. Asked here,
        // once, rather than on every pointermove.
        if (!state.ccCardArrange && !requireMutableWorkspace()) return true;
        state.ccCardArrange = !state.ccCardArrange;
        render();
        return true;

      default: return false;
    }
  }

  /**
   * The panel-contents controls, which report on `change` rather than click.
   *
   * A checkbox, a number box and a select: reading them on click sees the value from BEFORE the
   * browser applied it, and handling them on click as well is what stopped the dropdowns
   * working -- opening one wrote back the value it already had and re-rendered it away.
   */
  function handleCardChange(node) {
    const companyId = activeCompanyId();
    const key = node.dataset.key;
    if (node.dataset.action === 'cc-panel-toggle') { setPanelOption(companyId, key, { [node.dataset.opt]: node.checked }); return true; }
    if (node.dataset.action === 'cc-panel-limit') { setPanelOption(companyId, key, { limit: Number(node.value) }); return true; }
    if (node.dataset.action === 'cc-panel-choice') { setPanelOption(companyId, key, { [node.dataset.opt]: node.value }); return true; }
    if (node.dataset.action === 'cc-panel-app-title') {
      const appId = node.dataset.app;
      const current = panelAppFields(companyId, key);
      const mine = current[appId] || { title: '', fields: [] };
      setPanelOption(companyId, key, { apps: { ...current, [appId]: { ...mine, title: node.value } } });
      return true;
    }
    return false;
  }

  return {
    shiftContactCalendar,
    mountCard, mountCardSettings, mountFieldsEditor, handleCardAction, handleCardChange,
    renderCompanyContactsPage, renderCompanyContactEditor, saveCompanyContactForm,
    deleteCompanyContact, createCompanyContactNamed, createMissingContacts,
    setContactSelectMode, toggleContactSelected, toggleContactSelectAll, clearContactSelection, deleteSelectedContacts,
    renderCompanyContactFieldsEditor, renderCompanyContactCardSettings,
    // Exposed so switching tabs can bank the open panel before the DOM holding it is rebuilt.
    syncCardDraft, syncFieldDraftNow: syncFieldDraft,
    openCompanyContactFieldEditor,
    closeCompanyContactFieldEditor, addCompanyContactField, removeCompanyContactField,
    toggleCompanyContactFieldHidden, configureCompanyContactField,
    moveCompanyContactField, fieldIndexOf, addCompanyContactFieldOption, removeDraftFieldOption,
    removeCompanyContactFieldOption, addFieldOptionFromInput, saveCompanyContactFields,
    // The card's own layout: sizes, ordering, and where a button sits.
    setCardSpan, moveCardElement, dropCardElement, setPinPreset, addCardButton,
    // Arrange mode on the card. The geometry lives here; main.js binds the pointer events.
    beginPinDrag, nudgePinnedButton,
    // Editing the card in place: resize, reorder, remove, add back, add a button. No draft and
    // no Save -- a change made on the card is already visible.
    cardElementSpan, cardElementMove, cardElementRemove, cardElementAdd, addCardButtonHere,
    updateCardButton, removeCardButton, setPanelOption, panelAppFields,
    // Everything a button press needs, resolved from the seat the card wrote onto the button.
    // button-push.js reaches this through ctx and so never learns what a contact stores.
    contactButtonSeat,
    // ...and the other direction: a record pushed from an app, filed as a contact.
    receiveContactFromApp,
  };
}
