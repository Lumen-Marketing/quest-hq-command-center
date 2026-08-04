// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createContactTable(ctx) {
  const {
    CONTACT_SORT_OPTIONS,
    QUEST_SALES_LIFECYCLE_STAGES,
    accountName, contactStageColor, emptyState, filteredContacts, h, personOwnerDisplayName, pipelineDot, renderContactFilterBar, renderPipelineNextAction, sortedContacts, timeAgo, state,
  } = ctx;

  function renderContactTable(companyId) {
    const rows = sortedContacts(filteredContacts(companyId));
    const sort = CONTACT_SORT_OPTIONS.find((option) => option.id === state.contactSort) || CONTACT_SORT_OPTIONS[0];
    const lifecycleStage = QUEST_SALES_LIFECYCLE_STAGES.find((stage) => stage.key === state.contactLifecycleFilter);
    const listLabel = lifecycleStage?.name || (state.contactStageFilter === 'all' ? 'All Contacts' : `${state.contactStageFilter} Contacts`);
    const lastUpdated = rows[0]?.updated_at ? timeAgo(rows[0].updated_at) : 'no recent updates';
    const selected = new Set((state.selectedContactIds || []).filter((id) => rows.some((r) => r.id === id)));
    const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
    const selCount = selected.size;
    const headerSort = (label, sortId) => `
      <button class="contact-header-sort ${state.contactSort === sortId ? 'active' : ''}" type="button" data-action="set-contact-sort" data-sort="${h(sortId)}">
        ${h(label)} <i class="ti ${state.contactSort === sortId ? 'ti-chevron-up' : 'ti-chevron-down'}"></i>
      </button>
    `;
    return `
      <section class="panel contact-list-view">
        <div class="contact-list-head">
          <div class="contact-list-title">
            <span class="contact-object-icon"><i class="ti ti-id-badge-2"></i></span>
            <div>
              <span class="contact-object-label">Contacts</span>
              <h2>${h(listLabel)} <i class="ti ti-chevron-down"></i></h2>
              <p>${rows.length} item${rows.length === 1 ? '' : 's'} - Sorted by ${h(sort.label)} - Filtered by ${h(listLabel)} - Updated ${h(lastUpdated)}</p>
            </div>
          </div>
          <div class="contact-list-actions">
            ${selCount ? `<span class="contact-sel-count">${selCount} selected</span><button class="btn btn-compact" type="button" data-action="contacts-clear-selection"><i class="ti ti-x"></i>Clear</button>` : ''}
            <button class="btn btn-compact" type="button" data-action="contacts-import"><i class="ti ti-upload"></i>Import</button>
            <button class="btn btn-compact" type="button" data-action="contacts-dedupe"><i class="ti ti-git-merge"></i>Find duplicates</button>
            <button class="btn btn-compact" type="button" data-action="contacts-campaign"><i class="ti ti-speakerphone"></i>Add to Campaign</button>
            <button class="btn btn-compact danger" type="button" data-action="contacts-delete"><i class="ti ti-trash"></i>Delete</button>
            <button class="btn btn-compact" type="button" data-action="contacts-email"><i class="ti ti-mail"></i>Send Email</button>
            <button class="btn btn-compact btn-primary" type="button" data-action="open-contact-form" data-mode="new"><i class="ti ti-plus"></i>New</button>
            <button class="btn btn-compact" type="button" data-action="contacts-label"><i class="ti ti-tag"></i>Assign Label</button>
          </div>
        </div>
        <div class="contact-list-toolbar">
          <label class="contact-list-search">
            <i class="ti ti-search"></i>
            <input type="search" data-contact-search value="${h(state.contactQuery)}" placeholder="Search this list..." aria-label="Search this list" />
          </label>
          <div class="contact-list-tools">
            <button class="icon-btn ${state.contactBoardView === 'table' ? 'active' : ''}" type="button" data-action="set-pipeline-view" data-module="contacts" data-view="table" title="Table view" aria-label="Table view"><i class="ti ti-table"></i></button>
            <button class="icon-btn ${state.contactBoardView === 'board' ? 'active' : ''}" type="button" data-action="set-pipeline-view" data-module="contacts" data-view="board" title="Board view" aria-label="Board view"><i class="ti ti-layout-kanban"></i></button>
            <button class="icon-btn" type="button" data-action="open-stage-manager" data-module="contacts" title="Manage stages" aria-label="Manage stages"><i class="ti ti-adjustments-horizontal"></i></button>
            <button class="icon-btn" type="button" data-action="refresh-data" title="Refresh" aria-label="Refresh contacts"><i class="ti ti-refresh"></i></button>
          </div>
        </div>
        ${renderContactFilterBar(companyId)}
        <div class="data-table contacts-table">
          <div class="table-head">
            <span class="select-cell" data-action="toggle-contact-select-all"><input type="checkbox" ${allSelected ? 'checked' : ''} aria-label="Select all contacts" /></span>
            <span>${headerSort('Name', 'name')}</span>
            <span>What's next</span>
            <span>${headerSort('Account Name', 'owner')}</span>
            <span>${headerSort('Title', 'stage')}</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Contact Owner Alias</span>
            <span></span>
          </div>
          ${rows.map((contact) => `
            <div class="table-row ${selected.has(contact.id) ? 'selected ' : ''}${contact.id === state.selectedContactId ? 'active' : ''}" role="button" tabindex="0" data-action="open-contact" data-contact-id="${h(contact.id)}">
              <span class="select-cell" data-action="toggle-contact-select" data-contact-id="${h(contact.id)}"><input type="checkbox" ${selected.has(contact.id) ? 'checked' : ''} aria-label="Select ${h(contact.name)}" /></span>
              <span class="cell-lead">${pipelineDot(contactStageColor(contact.stage))}<span><strong>${h(contact.name)}</strong><small>${h(contact.stage || 'No stage')}</small></span></span>
              ${renderPipelineNextAction('contact', contact, { compact: true })}
              <span>${contact.account_id ? h(accountName(contact.account_id) || '-') : '<span class="muted-dash">-</span>'}</span>
              <span>${contact.title ? h(contact.title) : '<span class="muted-dash">-</span>'}</span>
              <span>${contact.phone ? h(contact.phone) : '<span class="muted-dash">-</span>'}</span>
              <span>${contact.email ? h(contact.email) : '<span class="muted-dash">-</span>'}</span>
              <span>${personOwnerDisplayName(contact.owner_name, companyId) ? h(personOwnerDisplayName(contact.owner_name, companyId)) : '<span class="muted-dash">-</span>'}</span>
              <span class="row-menu"><i class="ti ti-dots"></i></span>
            </div>
          `).join('') || emptyState('No contacts in this view yet.')}
        </div>
      </section>
    `;
  }

  return { renderContactTable };
}
