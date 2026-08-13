// Company Contacts: the directory, one contact's card, and the add/edit form.
//
// Fetched on demand -- it is a nav click away, and nothing that paints before that click
// needs it. A factory, because every store and formatter it reads belongs to main.js.
//
// The card is a WINDOW, not a workbench. Every row on it links out to the workspace app that
// owns the record; the only things editable here are the contact's own details. The moment
// records can be worked from this page it becomes a fifth workspace with no owner.

import { contactUsage, usageBalance, usageSummary } from './model.js';
import { renderSearchCombobox } from '../ui/combobox-menu.js';

export function createCompanyContactsPage(ctx) {
  const {
    activeCompanyId, appHref, can, canonicalCompanyId, companyContactById, companyContactChipField,
    companyContactFieldsFor, companyContactValue, companyContactsFor,
    companyPath, emptyState, createSupabaseClient, h, isLiveSupabaseSession, money, navigate,
    normalizeCompanyContact, normalizeCompanyContactField, render,
    requirePermission, showToast, state, supabaseRow, supabaseWrite, timeAgo, wbDoc,
    wbFieldBuilderMarkup, wbFileIcon, wbFileValues, wbOptRow, acceptAttr, fileTypeKind,
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

  // The first field of a given type that the company has not hidden. Every directory column
  // is "whatever they called it", so nothing here names a column.
  function firstFieldOf(companyId, type) {
    return companyContactFieldsFor(companyId).find((field) => field.type === type && !field.hidden) || null;
  }

  const fieldText = (contact, field) => (field ? String(companyContactValue(contact, field) || '').trim() : '');

  function renderDirectory(companyId) {
    const doc = wbDoc(companyId);
    const rows = visibleContacts(companyId);
    const chips = typeChips(companyId);
    const chipField = companyContactChipField(companyId);
    const companyField = firstFieldOf(companyId, 'text');
    const phoneField = firstFieldOf(companyId, 'phone');
    const active = state.companyContactTypeFilter || 'all';
    const canManage = can('company_contacts.manage', companyId);

    const row = (contact) => {
      const uses = contactUsage(doc, contact.id);
      const balance = usageBalance(uses);
      const summary = usageSummary(uses);
      const chip = companyContactValue(contact, chipField);
      const company = fieldText(contact, companyField);
      const phone = fieldText(contact, phoneField);
      return `
        <div class="table-row cc-row" role="button" tabindex="0" data-action="open-company-record" data-contact-id="${h(contact.id)}">
          <span class="cc-cell-name">
            <span class="cc-avatar" style="background:${h(chipColor(companyId, chip))}">${h(initials(contact.name))}</span>
            <span><strong>${h(contact.name)}</strong><small class="cc-cell-phone">${h(phone || '—')}</small></span>
          </span>
          <span class="cc-cell-company">${company ? `<b>${h(company)}</b>` : '<span class="muted-dash">—</span>'}</span>
          <span>${chip
            ? `<span class="cc-type" style="--cc-type:${h(chipColor(companyId, chip))}">${h(chip)}</span>`
            : '<span class="muted-dash">—</span>'}</span>
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
          <div class="table-head">
            <span>Name</span><span>${h(companyField ? companyField.label : 'Company')}</span>
            <span>${h(chipField ? chipField.label : 'Type')}</span><span>Active with us</span>
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

  function renderCard(companyId, contact) {
    const doc = wbDoc(companyId);
    const uses = contactUsage(doc, contact.id);
    const balance = usageBalance(uses);
    const records = uses.reduce((sum, use) => sum + use.count, 0);
    const canManage = can('company_contacts.manage', companyId);
    const chipField = companyContactChipField(companyId);
    const chip = companyContactValue(contact, chipField);

    // Long-form fields get their own panel; the short ones read as a summary line under the
    // name, which is how somebody scans a card they opened to answer one question.
    const fields = companyContactFieldsFor(companyId);
    const filled = fields.filter((field) => field !== chipField && !field.hidden && companyContactValue(contact, field) !== '');
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
                ${use.items.slice(0, 5).map((item) => `
                  <a class="cc-use-row" href="${h(appHref(companyPath('workspaces', { ws: use.workspaceId, app: use.appId, item: item.id }, companyId)))}" data-router>
                    <span>${h(item.title)}</span><i class="ti ti-arrow-right"></i>
                  </a>`).join('')}
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
        </div>

        <p class="cc-window-note"><i class="ti ti-pin"></i>
          A window, not a workbench. Every row links out to the workspace that owns the record — the work happens there. Only the contact's own details are edited here.</p>
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

  return {
    renderCompanyContactsPage, renderCompanyContactEditor, saveCompanyContactForm,
    deleteCompanyContact, renderCompanyContactFieldsEditor, openCompanyContactFieldEditor,
    closeCompanyContactFieldEditor, addCompanyContactField, removeCompanyContactField,
    toggleCompanyContactFieldHidden, configureCompanyContactField,
    moveCompanyContactField, fieldIndexOf, addCompanyContactFieldOption, removeDraftFieldOption,
    removeCompanyContactFieldOption, saveCompanyContactFields,
  };
}
