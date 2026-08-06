// The Messages detail and search dialogs, fetched on first use: both sit behind a button in
// the chat header and nothing that paints before that click needs them.
//
// A factory, because every lookup, formatter and presence helper belongs to main.js.

export function createChatModals(ctx) {
  const {
    contractRows, conversationAccessRows, conversationAttachments, conversationMessages,
    emptyState, formatDate, h, messageSenderProfile, profileIsOnline, profileName,
    renderModalShell, roleById, timeAgo, titleCase, withPresenceRing,
    directMessageCandidates, renderAvatar,
    appHref, companyMessageConversations, companyPath, state,
  } = ctx;

  /**
   * The people in a chat, each with their live presence.
   *
   * The details panel used to print the same flat comma list of names as the header, which
   * answered "who can see this" but not "who is here right now" -- the thing you actually want
   * before you type. Roles and whole-company access have no presence of their own, so they stay
   * summarised; only named people get a status.
   */
  function conversationPeopleList(conversation) {
    const rows = conversationAccessRows(conversation.id);
    if (conversation.type === 'company' || rows.some((row) => row.target_type === 'all_company')) {
      return `<p class="chat-people-note">${h('Everyone in this company can see this chat.')}</p>`;
    }
    const roles = rows.filter((row) => row.target_type === 'role')
      .map((row) => roleById(conversation.company_id, row.target_id)?.name || 'Role');
    const people = rows.filter((row) => row.target_type === 'profile').map((row) => {
      const profile = messageSenderProfile(row.target_id);
      return {
        id: row.target_id,
        name: profile.full_name || profile.email || profileName(row.target_id),
        online: profileIsOnline(row.target_id),
        profile,
      };
    });
    // Online first, then by name, so the answer to "who is here" is the top of the list.
    people.sort((a, b) => (Number(b.online) - Number(a.online)) || a.name.localeCompare(b.name));
    const onlineCount = people.filter((person) => person.online).length;
    if (!people.length && !roles.length) return `<p class="chat-people-note">${h('Private chat.')}</p>`;
    return `
      ${people.length ? `<p class="chat-people-note">${h(`${onlineCount} of ${people.length} online`)}</p>` : ''}
      <div class="chat-people">
        ${people.map((person) => `
          <div class="chat-person">
            ${withPresenceRing(renderAvatar(person.profile, 'avatar chat-person-avatar'), person.id)}
            <span class="chat-person-name">${h(person.name)}</span>
            <span class="chat-person-status ${person.online ? 'is-online' : ''}">${h(person.online ? 'Online' : 'Offline')}</span>
          </div>`).join('')}
      </div>
      ${roles.length ? `<p class="chat-people-note">${h(`Also open to: ${roles.join(', ')}`)}</p>` : ''}`;
  }

  function renderMessageDetailsModal(companyId, conversationId) {
    const conversation = state.messageConversations.find((item) => item.id === conversationId);
    if (!conversation) return renderModalShell('Messages', 'Chat details', emptyState('Conversation not found.'));
    return renderModalShell('Messages', conversation.title, `
      ${conversationPeopleList(conversation)}
      ${contractRows([
        ['Type', titleCase(conversation.type)],
        ['Messages', String(conversationMessages(conversation.id).length)],
        ['Attachments', String(conversationAttachments(conversation.id).length)],
        ['Last message', formatDate(conversation.last_message_at)],
      ])}
      <div class="chat-leave">
        <button class="btn danger" type="button" data-action="leave-conversation" data-conversation-id="${h(conversation.id)}">
          <i class="ti ti-trash"></i>${h(conversation.type === 'direct' ? 'Delete this chat for me' : 'Leave and delete for me')}
        </button>
        <p class="chat-people-note">Removes it from your list only. Everyone else keeps the chat and its messages.</p>
      </div>
    `, 'message-modal');
  }

  function renderMessageSearchModal(companyId) {
    const query = state.messageQuery.trim().toLowerCase();
    const rows = companyMessageConversations(companyId).flatMap((conversation) => conversationMessages(conversation.id)
      .filter((message) => !query || message.body.toLowerCase().includes(query))
      .map((message) => ({ conversation, message })));
    return renderModalShell('Messages', 'Search results', `
      <div class="queue-list">
        ${rows.slice(0, 30).map(({ conversation, message }) => `
          <a class="queue-row" href="${appHref(companyPath('messages', { conversation: conversation.id }, companyId))}" data-router>
            <span><strong>${h(conversation.title)}</strong><small>${h(message.body || 'Attachment')}</small></span>
            <em>${timeAgo(message.created_at)}</em>
          </a>
        `).join('') || emptyState('No matching messages. Type in the Messages search box first.')}
      </div>
    `, 'message-modal');
  }

  function renderDirectMessageModal(companyId) {
    const { query, matches } = directMessageCandidates(companyId);
    const idOf = (user) => user.profile_id || user.member_id;
    // Keep the pick only while it is still in the visible results, so the hidden field
    // can never submit someone the user has since filtered away.
    const selectedId = matches.some((user) => idOf(user) === state.directMessageTargetId)
      ? state.directMessageTargetId
      : (matches.length === 1 ? idOf(matches[0]) : '');
    return renderModalShell('Messages', 'New direct message', `
      <form class="message-modal-form" data-direct-message-form>
        <input type="hidden" name="profile_id" value="${h(selectedId)}" />
        <label class="dm-person-field">
          <span>Person</span>
          <span class="dm-person-search">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input type="search" value="${h(query)}" placeholder="Search by name, email, or role"
              data-direct-message-search aria-label="Search people" autocomplete="off" />
          </span>
        </label>
        <div class="dm-person-results" role="listbox" aria-label="People">
          ${matches.slice(0, 8).map((user) => `
            <button class="dm-person ${idOf(user) === selectedId ? 'active' : ''}" type="button" role="option"
              aria-selected="${idOf(user) === selectedId ? 'true' : 'false'}"
              data-action="select-direct-message-person" data-profile-id="${h(idOf(user))}">
              ${renderAvatar({ ...user, full_name: user.name }, 'avatar tiny')}
              <span class="dm-person-copy">
                <strong>${h(user.name || 'Teammate')}</strong>
                <small>${h(user.email || user.role_label || user.role || '')}</small>
              </span>
              <i class="ti ti-check dm-person-check" aria-hidden="true"></i>
            </button>
          `).join('') || `<p class="dm-person-empty">No one matches "${h(query)}".</p>`}
        </div>
        ${matches.length > 8 ? `<p class="dm-person-more">${matches.length - 8} more — keep typing to narrow.</p>` : ''}
        <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Start chat</button>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `, 'message-modal');
  }

  return { renderDirectMessageModal, renderMessageDetailsModal, renderMessageSearchModal };
}
