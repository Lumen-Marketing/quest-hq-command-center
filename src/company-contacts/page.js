// Company Contacts: the directory, one contact's card, and the add/edit form.
//
// Fetched on demand -- it is a nav click away, and nothing that paints before that click
// needs it. A factory, because every store and formatter it reads belongs to main.js.
//
// The card is a WINDOW, not a workbench. Every row on it links out to the workspace app that
// owns the record; the only things editable here are the contact's own details. The moment
// records can be worked from this page it becomes a fifth workspace with no owner.

import { contactUsage, usageBalance, usageSummary } from './model.js';
import {
  CALENDAR_VIEWS, calendarSpan, contactActivity, contactDates, datesByDay, dayKey, entriesIn,
  shiftAnchor,
} from './timeline.js';
import { renderSearchCombobox } from '../ui/combobox-menu.js';

export function createCompanyContactsPage(ctx) {
  const {
    activeCompanyId, appHref, can, canonicalCompanyId, companyContactById, companyContactChipField,
    companyContactFieldsFor, companyContactValue, companyContactsFor,
    companyPath, emptyState, createSupabaseClient, h, isLiveSupabaseSession, money, navigate,
    normalizeCompanyContact, normalizeCompanyContactField, render,
    requirePermission, showToast, state, supabaseRow, supabaseWrite, timeAgo, wbDoc,
    wbFieldBuilderMarkup, wbFileIcon, wbFileValues, wbFmtDuration, wbNameValue, wbOptRow, acceptAttr,
    fileTypeKind, formatDate,
    WB_FIELD_TYPES,
    COMPANY_CONTACT_COLS, COMPANY_CONTACT_FIELD_COLS, COMPANY_CONTACT_FIELD_TYPES,
  } = ctx;

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
      const raw = data[`field:${field.id}`];
      const value = raw === undefined ? '' : String(raw).trim();
      if (value) fieldValues[field.id] = value;
    });

    // A category value typed rather than picked joins its list, so the next person picks it
    // instead of inventing a second spelling.
    for (const field of fields.filter((item) => item.type === 'category')) {
      const value = fieldValues[field.id];
      if (value) await ensureCompanyContactFieldOption(companyId, field, value);
    }

    const saved = await persistCompanyContact({
      ...(existing || {}), id: data.id || '', company_id: companyId, name, field_values: fieldValues,
    });
    if (!saved) { showToast('Could not save that contact.', 'local', 'Company Contacts'); return; }
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
    const value = companyContactValue(contact, field);
    if (value === '' || value === undefined || value === null) return '<span class="muted-dash">—</span>';
    if (field.type === 'category') {
      const color = (field.config?.options || []).find((option) => option.label === value)?.color || '#6b7280';
      return `<span class="cc-type" style="--cc-type:${h(color)}">${h(value)}</span>`;
    }
    if (field.type === 'file') {
      const files = wbFileValues(value);
      return files.length ? `<span class="cc-cell-files"><i class="ti ti-paperclip"></i>${h(String(files.length))}</span>` : '<span class="muted-dash">—</span>';
    }
    if (field.type === 'money') return `<b>${h(money(Number(value) || 0))}</b>`;
    return h(displayValue(field, value));
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
    const tracks = ['minmax(200px, 1.4fr)', ...columns.map(() => 'minmax(130px, .9fr)'),
      'minmax(180px, 1.2fr)', '120px', '110px'].join(' ');
    const minWidth = 610 + columns.length * 130;
    const grid = `style="--cc-cols:${tracks};--cc-min:${minWidth}px"`;

    const row = (contact) => {
      const uses = contactUsage(doc, contact.id, { nameValue: wbNameValue });
      const balance = usageBalance(uses);
      const summary = usageSummary(uses);
      const chip = companyContactValue(contact, chipField);
      const phone = fieldText(contact, phoneField);
      return `
        <div class="table-row cc-row" role="button" tabindex="0" ${grid} data-action="open-company-record" data-contact-id="${h(contact.id)}">
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
            ${canManage ? `
              <button class="btn" type="button" data-action="open-company-contact-fields"><i class="ti ti-adjustments"></i>Fields</button>
              <button class="btn btn-primary" type="button" data-action="open-company-record-form" data-mode="new"><i class="ti ti-plus"></i>New contact</button>` : ''}
          </div>
        </div>
        ${chips.length ? `
          <div class="cc-chips" role="group" aria-label="Filter by ${h(chipField.label)}">
            ${chips.map((chip) => `
              <button class="cc-chip ${active === chip.key ? 'active' : ''}" type="button" data-action="set-company-record-type" data-type="${h(chip.key)}" aria-pressed="${active === chip.key ? 'true' : 'false'}">
                ${chip.color ? `<i class="cc-dot" style="background:${h(chip.color)}"></i>` : ''}${h(chip.label)}<b>${chip.count}</b>
              </button>`).join('')}
          </div>` : ''}
        <div class="data-table cc-table">
          <div class="table-head" ${grid}>
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
    if (field.type === 'file') {
      const files = wbFileValues(value);
      return files.map((file) => file.name).join(', ');
    }
    if (field.type === 'money') return money(Number(value) || 0);
    if (field.type === 'date') return String(value).slice(0, 10);
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
  function activityPanel(companyId, doc, contact) {
    const entries = contactActivity(doc, contact.id, { nameValue: wbNameValue });
    return `
      <div class="cc-panel">
        <h3><i class="ti ti-activity"></i>Recent updates</h3>
        ${entries.length ? `<div class="cc-feed">${entries.map((entry) => {
    const href = entryHref(companyId, entry);
    const line = `<span class="cc-feed-ic"><i class="ti ${h(entry.icon)}"></i></span>
            <span class="cc-feed-main">
              <span class="cc-feed-text">${entry.text}</span>
              <small>${h(entry.appName)}${entry.actor ? ` · ${h(entry.actor)}` : ''} · ${h(timeAgo(entry.at))}</small>
            </span>`;
    return href
      ? `<a class="cc-feed-row" href="${h(href)}" data-router>${line}</a>`
      : `<div class="cc-feed-row">${line}</div>`;
  }).join('')}</div>`
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
  function calendarPanel(companyId, doc, contact) {
    const view = CALENDAR_VIEWS.includes(state.ccCalView) ? state.ccCalView : 'month';
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
      return `<div class="${classes}" title="${h(entries.map((entry) => `${entry.title} — ${entry.label}`).join('\n'))}">
        <span class="cc-cal-num">${h(label)}</span>${detail}
      </div>`;
    };

    const weekdays = view === 'month' || view === 'week'
      ? `<div class="cc-cal-days">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => `<span>${day}</span>`).join('')}</div>`
      : '';

    return `
      <div class="cc-panel cc-cal-panel">
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
      </div>`;
  }

  function useRow(companyId, use, item) {
    const facts = item.facts || {};
    const meta = [];
    if (facts.duration !== null && facts.duration !== undefined) {
      meta.push(`<span class="cc-use-fact"><i class="ti ti-clock-hour-4"></i>${h(wbFmtDuration(facts.duration))}</span>`);
    }
    // A stamp reads as "8m ago" and a typed date as "Aug 20, 2026": one answers "how long has
    // this been sitting?", the other answers "when is it happening?".
    (facts.dates || []).forEach((date) => {
      const icon = date.relative ? 'ti-history' : 'ti-calendar';
      const text = date.relative ? timeAgo(date.value) : formatDate(date.value);
      meta.push(`<span class="cc-use-fact"><i class="ti ${icon}"></i>${h(date.label)} ${h(text)}</span>`);
    });
    if (facts.updatedAt) {
      meta.push(`<span class="cc-use-fact"><i class="ti ti-pencil"></i>Edited ${h(timeAgo(facts.updatedAt))}</span>`);
    }

    const body = `
      <span class="cc-use-main">
        <span class="cc-use-title">${h(item.title)}</span>
        ${facts.stage ? `<span class="cc-use-stage" style="--cc-stage:${h(facts.stage.color || '#6b7280')}">${h(facts.stage.label)}</span>` : ''}
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

  function renderCard(companyId, contact) {
    const doc = wbDoc(companyId);
    const uses = contactUsage(doc, contact.id, { nameValue: wbNameValue });
    const balance = usageBalance(uses);
    const records = uses.reduce((sum, use) => sum + use.count, 0);
    const canManage = can('company_contacts.manage', companyId);
    const chipField = companyContactChipField(companyId);
    const chip = companyContactValue(contact, chipField);

    // Long-form fields get their own panel; the short ones read as a summary line under the
    // name, which is how somebody scans a card they opened to answer one question.
    const fields = companyContactFieldsFor(companyId);
    // Every field with something in it, hidden ones included: hiding is about the directory's
    // columns, and a card that quietly omitted details would be a card you cannot trust.
    const filled = fields.filter((field) => field !== chipField && companyContactValue(contact, field) !== '');
    const longFields = filled.filter((field) => field.type === 'textarea');
    const shortFields = filled.filter((field) => field.type !== 'textarea');
    const meta = shortFields.map((field) => displayValue(field, companyContactValue(contact, field)));

    const tile = (label, value, sub = '') => `
      <div class="cc-tile"><span>${h(label)}</span><strong>${h(value)}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</div>`;

    return `
      <div class="cc-card">
        <div class="cc-crumb">
          <a href="${h(appHref(companyPath('company-contacts', {}, companyId)))}" data-router>Company Contacts</a>
          <span>/</span><b>${h(contact.name)}</b>
        </div>

        <header class="cc-profile-head">
          <span class="cc-avatar cc-avatar-lg" style="background:${h(chipColor(companyId, chip))}">${h(initials(contact.name))}</span>
          <div>
            <h2>${h(contact.name)}
              ${chip ? `<span class="cc-type" style="--cc-type:${h(chipColor(companyId, chip))}">${h(chip)}</span>` : ''}
            </h2>
            <p>${meta.length ? h(meta.join(' · ')) : 'No details on file'}</p>
          </div>
          ${canManage ? `
            <div class="cc-profile-actions">
              <button class="btn" type="button" data-action="open-company-record-form" data-mode="edit" data-contact-id="${h(contact.id)}"><i class="ti ti-pencil"></i>Edit info</button>
            </div>` : ''}
        </header>

        <div class="cc-tiles">
          ${tile('Open balance', balance ? money(balance) : '—', 'across every workspace')}
          ${tile('Active records', String(records), records ? `${uses.length} app${uses.length === 1 ? '' : 's'}` : 'not referenced yet')}
          ${tile('Workspaces', String(new Set(uses.map((use) => use.workspaceId)).size), 'using this contact')}
          ${tile('Last touch', contact.last_activity_at ? timeAgo(contact.last_activity_at) : timeAgo(contact.updated_at))}
        </div>

        ${shortFields.length ? `
          <div class="cc-detail-grid">
            ${shortFields.map((field) => `
              <div class="cc-detail"><span>${h(field.label)}</span>${field.type === 'file'
                ? `<span class="cc-detail-files">${wbFileValues(companyContactValue(contact, field)).map((file) => (file.url
                  ? `<a href="${h(file.url)}" target="_blank" rel="noreferrer"><i class="ti ${h(wbFileIcon(fileTypeKind({ file_name: file.name })))}"></i>${h(file.name)}</a>`
                  : `<span><i class="ti ti-file"></i>${h(file.name)}</span>`)).join('')}</span>`
                : `<b>${h(displayValue(field, companyContactValue(contact, field)))}</b>`}</div>`).join('')}
          </div>` : ''}

        <div class="cc-panels">
          <div class="cc-panel">
            <h3><i class="ti ti-briefcase"></i>In flight</h3>
            ${uses.length ? uses.map((use) => `
              <div class="cc-use">
                <div class="cc-use-head">
                  <b>${h(use.appName)}</b>
                  <span class="cc-ws">${h(use.workspaceName)}</span>
                  <em>${use.count} record${use.count === 1 ? '' : 's'}${use.balance ? ` · ${h(money(use.balance))}` : ''}</em>
                </div>
                ${use.items.slice(0, 5).map((item) => useRow(companyId, use, item)).join('')}
                ${use.count > 5 ? `<span class="cc-use-more">+${use.count - 5} more</span>` : ''}
              </div>`).join('')
              : '<p class="cc-empty">Nothing references this contact yet. Add a Company Contact field to a workspace app and pick them on a record.</p>'}
          </div>
          <div class="cc-panel">
            <h3><i class="ti ti-note"></i>${h(longFields[0]?.label || 'Notes')}</h3>
            ${longFields.length ? longFields.map((field) => `
              <p class="cc-notes">${h(companyContactValue(contact, field))}</p>`).join('')
              : '<p class="cc-empty">Nothing written down yet.</p>'}
          </div>
          ${activityPanel(companyId, doc, contact)}
          ${calendarPanel(companyId, doc, contact)}
        </div>

        <div class="cc-card-foot">
          <a class="btn" href="${h(appHref(companyPath('company-contacts', {}, companyId)))}" data-router><i class="ti ti-arrow-left"></i>Back to Company Contacts</a>
        </div>
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
      default:
        return `<label>${label}<input name="${h(name)}" value="${h(value)}" autocomplete="off"${req} /></label>`;
    }
  }

  function renderCompanyContactEditor(companyId, contact) {
    const edit = contact || { id: '', name: '', field_values: {} };
    const fields = companyContactFieldsFor(companyId);
    return `
      <form class="job-editor cc-editor" data-company-record-form>
        <input type="hidden" name="id" value="${h(edit.id || '')}" />
        <input type="hidden" name="company_id" value="${h(companyId)}" />
        <div class="section-head span-2">
          <div><h2>${contact ? 'Edit contact' : 'New company contact'}</h2>
          <p>Visible in every workspace. Workspace apps point at this record with a Company Contact field.</p></div>
        </div>
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

  // The App Builder offers rollups over another app's records and auto-numbers scoped to one.
  // A contact has neither, so the palette is the basics: what a person or a company IS.
  const CC_PALETTE = ['text', 'textarea', 'number', 'money', 'date', 'category', 'checkbox', 'email', 'phone', 'location', 'file'];
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
      config: type === 'category' ? { options: [] } : {},
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
    syncFieldDraft();
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

    const removed = new Set(fieldDraft.removed);
    state.companyContactFields = [
      ...state.companyContactFields.filter((field) => field.company_id !== companyId && !removed.has(field.id)),
      ...fields,
    ];
    fieldDraft = null;
    state.modal = '';
    showToast('Fields saved.', isLiveSupabaseSession() ? 'live' : 'local', 'Company Contacts');
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
            <div class="wb-opt-list">${options.map((option) => wbOptRow(option)).join('')}</div>
            <button class="btn btn-sm" type="button" data-cc-add-option data-field-id="${h(field.id)}"><i class="ti ti-plus"></i>Add option</button>
          </div>` : ''}
        <div class="wb-check-row">
          <label class="wb-switch"><input type="checkbox" data-cc-field-required ${field.required ? 'checked' : ''} /><span class="wb-slider"></span></label>
          <div><b>Required field</b><div class="wb-sub">Contacts can't be saved without it.</div></div>
        </div>
        <div class="cc-field-config-done">
          <button type="button" class="btn btn-primary btn-sm" data-action="configure-company-contact-field" data-field-id="${h(field.id)}"><i class="ti ti-check"></i>Done</button>
        </div>
      </div>`;
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

  return {
    shiftContactCalendar,
    renderCompanyContactsPage, renderCompanyContactEditor, saveCompanyContactForm,
    deleteCompanyContact, createCompanyContactNamed, createMissingContacts,
    renderCompanyContactFieldsEditor,
    openCompanyContactFieldEditor,
    closeCompanyContactFieldEditor, addCompanyContactField, removeCompanyContactField,
    toggleCompanyContactFieldHidden, configureCompanyContactField,
    moveCompanyContactField, fieldIndexOf, addCompanyContactFieldOption, removeDraftFieldOption,
    removeCompanyContactFieldOption, saveCompanyContactFields,
  };
}
