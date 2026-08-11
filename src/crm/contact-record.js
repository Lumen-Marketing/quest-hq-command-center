// Contact record, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createContactRecord(ctx) {
  const {
    EMPTY_FIELD_PLACEHOLDER, activeWorkspaceId, activitiesFor, appHref, can, companyDeals,
    companyPath, contactSmsCapabilities, contactStages, field, filteredActivitiesFor, guidanceForStage,
    h, isoDate, money, renderContactLabelStrip, renderContactWorkspacePanel, renderSfTaskRow,
    resolvePipelineStage, state, tasksForContact,
  } = ctx;

  function renderContactRecord(companyId, contact) {
    const stages = contactStages();
    const ci = stages.findIndex((s) => s.name === contact.stage);
    const g = guidanceForStage(contact.stage);
    const tempColor = contact.temperature === 'Hot' ? '#C2410C' : contact.temperature === 'Warm' ? '#B07A12' : '#2E72B8';
    const smsCapabilities = contactSmsCapabilities(contact.id);
    const requestedWorkspaceTab = state.contactWorkspaceTab || 'Notes';
    const activeWorkspaceTab = requestedWorkspaceTab === 'Messages' && !smsCapabilities.canMountThread
      ? 'Notes'
      : requestedWorkspaceTab;
    const tasks = tasksForContact(contact.id);
    const totalFeed = activitiesFor('contact', contact.id);
    const feed = filteredActivitiesFor('contact', contact.id);
    const contactQuotes = companyDeals(companyId)
      .filter((deal) => deal.primary_contact_id === contact.id)
      .sort((a, b) => String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || '')));
    const latestContactQuote = contactQuotes[0] || null;
    const canManageContactQuotes = can('crm.manage', companyId, contact.workspace_id);
    const canGraduateContactToQuote = canManageContactQuotes
      && resolvePipelineStage('contacts', contact.stage, companyId) === 'Nurturing';
    const quoteInFlight = Boolean(state.contactQuoteConversionInFlight?.[contact.id]);

    const ed = (key, opts = {}) => {
      const isEmpty = contact[key] === '' || contact[key] == null;
      const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : '', isEmpty ? 'sf-empty' : ''].filter(Boolean).join(' ');
      const inner = isEmpty ? EMPTY_FIELD_PLACEHOLDER : h(String(contact[key]));
      return `<span class="${cls}" data-contact-edit="${h(key)}" data-contact-id="${h(contact.id)}" title="Click to edit">${inner}</span>`;
    };
    const fieldRow = (label, content, editKey = '') => `
      <div class="sf-field">
        <div class="sf-field-label">
          ${h(label)}
          ${editKey
            ? `<button class="sf-pencil" type="button" data-contact-edit="${h(editKey)}" data-contact-id="${h(contact.id)}" aria-label="Edit ${h(label)}"><i class="ti ti-pencil"></i></button>`
            : ''}
        </div>
        <div class="sf-field-value">${content}</div>
      </div>
    `;

    const workspaceTabs = [['Notes', 'ti-note'], ['Email', 'ti-mail'], ['Messages', 'ti-message'], ['Activity', 'ti-activity']];
    const quickTiles = [['Task', 'ti-checkbox'], ['Meeting', 'ti-calendar'], ['Estimate', 'ti-calculator'], ['Proposal', 'ti-file-text'], ['Email', 'ti-mail'], ['Call Log', 'ti-phone']];

    return `
      <div class="sf-record">
        <div class="sf-object-tabs">
          <a class="sf-object-tab" href="${appHref(companyPath('dashboard', {}, companyId))}" data-router>Dashboard</a>
          <a class="sf-object-tab" href="${appHref(companyPath('contacts', {}, companyId))}" data-router>All Contacts <span class="sf-tab-kind">| Contacts</span></a>
          <span class="sf-object-tab on">${h(contact.name)} <span class="sf-tab-kind">| Contact</span></span>
        </div>

        <div class="sf-record-head">
          <span class="sf-record-icon"><i class="ti ti-user"></i></span>
          <div><div class="sf-record-label">Contact</div><div class="sf-record-name">${h(contact.name)}</div></div>
          <div class="sf-actions">
            ${workspaceTabs.map(([label, ico]) => {
              const smsDisabled = label === 'Messages' && !smsCapabilities.canMountThread;
              return `<button class="sf-btn ${activeWorkspaceTab === label ? 'active' : ''}" type="button" data-action="set-contact-workspace-tab" data-contact-id="${h(contact.id)}" data-tab="${h(label)}"${smsDisabled ? ` disabled aria-disabled="true" title="${h(smsCapabilities.message)}"` : ''}><i class="ti ${ico}"></i>${label}${smsDisabled ? '<i class="ti ti-lock sf-tab-lock" aria-hidden="true"></i>' : ''}</button>`;
            }).join('')}
            <button class="sf-btn" type="button" data-action="open-record-history" data-record-type="contact" data-record-id="${h(contact.id)}" data-record-label="${h(contact.name)}" data-company-id="${h(contact.company_id || companyId)}" data-workspace-id="${h(contact.workspace_id || activeWorkspaceId())}"><i class="ti ti-history"></i>History</button>
            <button class="sf-btn" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${h(contact.id)}"><i class="ti ti-pencil"></i>Edit</button>
          </div>
        </div>

        ${renderContactLabelStrip(companyId, contact)}

        <div class="sf-path-wrap">
          <div class="sf-path-row">
            <div class="sf-stage-track">
              ${stages.map((s, i) => {
                const cls = i < ci ? 'done' : i === ci ? 'current' : 'future';
                return `<button class="sf-stage ${cls}" type="button" data-action="set-contact-stage" data-contact-id="${h(contact.id)}" data-stage="${h(s.name)}" title="Move to ${h(s.name)}">${i < ci ? '<i class="ti ti-check"></i>' : h(s.name)}</button>`;
              }).join('')}
            </div>
            <button class="sf-mark-btn" type="button" data-action="contact-mark-next" data-contact-id="${h(contact.id)}">Mark as Current Stage</button>
            ${canGraduateContactToQuote
              ? latestContactQuote
                ? `<button class="sf-mark-btn sf-graduate-btn" type="button" data-action="open-contact-quote" data-deal-id="${h(latestContactQuote.id)}"><i class="ti ti-file-text"></i>Open latest Quote</button>`
                : `<button class="sf-mark-btn sf-graduate-btn" type="button" data-action="contact-convert-quote" data-contact-id="${h(contact.id)}"${quoteInFlight ? ' disabled' : ''}><i class="ti ti-file-text"></i>${quoteInFlight ? 'Creating Quote…' : 'Graduate to Quote'}</button>`
              : ''}
          </div>
          <div class="sf-guidance">
            <div class="sf-guidance-label">Guidance for Success</div>
            <div class="sf-guidance-title">${h(g.t)}</div>
            <div class="sf-guidance-lines">${g.b.map((x) => `<div><span class="sf-guidance-bullet">•</span> ${h(x)}</div>`).join('')}</div>
          </div>
        </div>

        <div class="sf-three-col">
          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>About</div><div class="sf-card-body">
              ${fieldRow('Phone', ed('phone'), 'phone')}
              ${fieldRow('Email', ed('email', { blue: true }), 'email')}
              ${fieldRow('Location', ed('location'), 'location')}
              ${fieldRow('Job Type', `<span class="sf-pill sf-edit${contact.title ? '' : ' sf-empty'}" data-contact-edit="title" data-contact-id="${h(contact.id)}" title="Click to edit">${contact.title ? h(contact.title) : EMPTY_FIELD_PLACEHOLDER}</span>`, 'title')}
              ${fieldRow('Owner', ed('owner_name', { blue: true }), 'owner_name')}
              ${fieldRow('Source', ed('source'), 'source')}
            </div></div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
              ${fieldRow('Stage', ed('stage'), 'stage')}
              ${fieldRow('Est. Value', `<span class="sf-money"><span class="sf-edit mono" data-contact-edit="value" data-contact-id="${h(contact.id)}" title="Click to edit">${money(contact.value || 0)}</span></span>`, 'value')}
              ${fieldRow('Temperature', `<span class="sf-edit" data-contact-edit="temperature" data-contact-id="${h(contact.id)}" style="color:${tempColor}" title="Click to edit">${h(contact.temperature)}</span>`, 'temperature')}
              ${fieldRow('Pay Type', ed('pay_type'), 'pay_type')}
              ${fieldRow('Roof System', ed('roof_system'), 'roof_system')}
              ${contact.has_multiple_roof_systems || contact.secondary_roof_system ? fieldRow('Second Roof System', ed('secondary_roof_system'), 'secondary_roof_system') : ''}
            </div></div>
          </div>

          <div class="sf-col">
            ${renderContactWorkspacePanel(contact, activeWorkspaceTab, totalFeed, feed, smsCapabilities)}
          </div>

          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
              <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => `<button class="sf-quick-tile" type="button" data-action="contact-quick" data-kind="${h(label)}" data-contact-id="${h(contact.id)}"><i class="ti ${ico}"></i><span>${label}</span></button>`).join('')}</div>
              ${latestContactQuote
                ? `
                  <button class="sf-convert-btn" type="button" data-action="open-contact-quote" data-deal-id="${h(latestContactQuote.id)}"><i class="ti ti-external-link"></i>Open latest Quote</button>
                  ${canManageContactQuotes ? `<button class="sf-convert-btn sf-convert-secondary" type="button" data-action="contact-create-another-quote" data-contact-id="${h(contact.id)}"${quoteInFlight ? ' disabled' : ''}><i class="ti ti-copy"></i>${quoteInFlight ? 'Creating Quote…' : 'Create another Quote'}</button>` : ''}
                `
                : canManageContactQuotes
                  ? `<button class="sf-convert-btn" type="button" data-action="contact-convert-quote" data-contact-id="${h(contact.id)}"${quoteInFlight ? ' disabled' : ''}><i class="ti ti-arrow-right"></i>${quoteInFlight ? 'Creating Quote…' : 'Convert to Quote'}</button>`
                  : ''}
            </div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
              <div class="sf-tasks">
                ${tasks.map((t) => renderSfTaskRow(t)).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
              </div>
              <form class="sf-task-add sf-task-add-rich" data-contact-task-form autocomplete="off">
                <input type="hidden" name="contact_id" value="${h(contact.id)}" />
                <i class="ti ti-plus"></i>
                <input name="title" placeholder="Add a task?" />
                <input name="due" type="date" value="${h(isoDate(1))}" aria-label="Due date" />
                <input name="due_time" type="time" aria-label="Due time" />
                <button type="submit" title="Save task" aria-label="Save task"><i class="ti ti-check"></i></button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return { renderContactRecord };
}
