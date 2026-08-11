// Contact workspace panel, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createContactWorkspacePanel(ctx) {
  const {
    can, contactSmsCapabilities, filteredActivitiesFor, h, number, renderActivityFilterBar,
    sfFeedItem, smsNormalize, state,
  } = ctx;

  function renderContactWorkspacePanel(contact, activeWorkspaceTab, totalFeed, feed, smsCapabilities = contactSmsCapabilities(contact.id)) {
    const tabs = [
      ['Notes', 'ti-note'],
      ['Email', 'ti-mail'],
      ['Messages', 'ti-message'],
      ['Activity', 'ti-activity'],
    ];
    const tabBar = `<div class="sf-activity-tabs">${tabs.map(([label, ico]) => {
      const smsDisabled = label === 'Messages' && !smsCapabilities.canMountThread;
      const title = smsDisabled ? ` title="${h(smsCapabilities.message)}"` : '';
      return `<button class="sf-activity-tab ${activeWorkspaceTab === label ? 'active' : ''}" type="button" data-action="set-contact-workspace-tab" data-contact-id="${h(contact.id)}" data-tab="${h(label)}"${smsDisabled ? ' disabled aria-disabled="true"' : ''}${title}><i class="ti ${ico}"></i>${label}${smsDisabled ? '<i class="ti ti-lock sf-tab-lock" aria-hidden="true"></i>' : ''}</button>`;
    }).join('')}</div>`;
    const smsSetupNotice = !smsCapabilities.ready && can('plugins.manage', contact.company_id)
      ? `<div class="sf-sms-setup-state" role="status"><i class="ti ti-lock" aria-hidden="true"></i><span><strong>SMS is off</strong>${h(smsCapabilities.message)}</span></div>`
      : '';

    if (activeWorkspaceTab === 'Messages') {
      const textable = smsNormalize(contact.phone);
      const disabled = textable ? '' : 'disabled';
      const hint = textable
        ? `Texting ${h(contact.phone)}`
        : 'Add a valid mobile number to this contact before texting.';
      return `
        <div class="sf-card sf-workspace-card">
          ${tabBar}
          <div class="sf-sms-thread" data-sms-thread data-contact-id="${h(contact.id)}">
            <div class="sf-sms-loading">Loading messages…</div>
          </div>
          <form class="sf-sms-composer" data-sms-form data-contact-id="${h(contact.id)}" autocomplete="off">
            <input name="body" placeholder="Type a text message…" ${disabled} autocomplete="off" />
            <button type="submit" ${disabled} title="Send text" aria-label="Send text"><i class="ti ti-send"></i></button>
          </form>
          <div class="sf-sms-hint">${hint}</div>
        </div>
      `;
    }

    const noteItems = filteredActivitiesFor('contact', contact.id).filter((activity) => activity.type === 'note');
    const emailItems = filteredActivitiesFor('contact', contact.id).filter((activity) => activity.type === 'email');
    const panelFeed = activeWorkspaceTab === 'Notes' ? noteItems : activeWorkspaceTab === 'Email' ? emailItems : feed;
    const composer = activeWorkspaceTab === 'Email'
      ? `
        <div class="sf-email-panel">
          <div>
            <strong>${h(contact.email || 'No email on file')}</strong>
            <small>${contact.email ? 'Send or log customer email from this record.' : 'Add an email address before sending.'}</small>
          </div>
          <button class="sf-primary-mini" type="button" data-action="open-docked-activity" data-related-type="contact" data-related-id="${h(contact.id)}" data-kind="Email"><i class="ti ti-mail"></i>Compose email</button>
        </div>
        <form class="sf-note-box" data-contact-note-form autocomplete="off">
          <input type="hidden" name="contact_id" value="${h(contact.id)}" />
          <input type="hidden" name="activity_type" value="email" />
          <input name="body" placeholder="Log an email summary..." />
          <span class="sf-note-tools"><i class="ti ti-mail"></i></span>
        </form>
      `
      : activeWorkspaceTab === 'Activity'
        ? renderActivityFilterBar(totalFeed.length, feed.length)
        : `
          <form class="sf-note-box" data-contact-note-form autocomplete="off">
            <input type="hidden" name="contact_id" value="${h(contact.id)}" />
            <input type="hidden" name="activity_type" value="note" />
            <input name="body" placeholder="Write a note or @mention..." />
            <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
          </form>
        `;
    const emptyText = activeWorkspaceTab === 'Email'
      ? 'No email history yet.'
      : activeWorkspaceTab === 'Activity'
        ? (totalFeed.length ? 'No activity matches this filter.' : 'No activity yet. Log a note, email, call, meeting, or task.')
        : 'No notes yet.';
    return `
        <div class="sf-card sf-workspace-card">
        ${tabBar}
        ${smsSetupNotice}
        ${composer}
        <div class="sf-feed">
          ${panelFeed.length ? panelFeed.map((a) => sfFeedItem(a)).join('') : `<div class="sf-feed-empty">${emptyText}</div>`}
        </div>
      </div>
    `;
  }

  return { renderContactWorkspacePanel };
}
