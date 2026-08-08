// The Messages detail and search dialogs, fetched on first use: both sit behind a button in
// the chat header and nothing that paints before that click needs them.
//
// A factory, because every lookup, formatter and presence helper belongs to main.js.

export function createChatModals(ctx) {
  const {
    contractRows, conversationAccessRows, conversationAttachments, conversationMessages,
    emptyState, formatDate, h, messageSenderProfile, profileIsOnline, profileName,
    renderModalShell, roleById, timeAgo, titleCase, withPresenceRing,
    directMessageCandidates, renderAvatar, companyAccessUsers, activeSession,
    can, companyInvites,
    renderMessageGroupIconControl,
    renderMessagePeoplePicker, renderMessageRolePicker,
    appHref, companyMessageConversations, companyPath, state,
    conversationLeftAt, isConversationArchived,
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
      ${isConversationArchived(conversation.id) ? `
        <div class="chat-leave">
          <p class="chat-people-note">${h(`You left this chat on ${formatDate(conversationLeftAt(conversation.id))}. It is kept as an archive of what was said up to then; nothing new arrives here.`)}</p>
        </div>
      ` : `
        <div class="chat-leave">
          <button class="btn" type="button" data-action="clear-conversation" data-conversation-id="${h(conversation.id)}">
            <i class="ti ti-eraser"></i>Delete chat
          </button>
          <p class="chat-people-note">Clears the messages you can see. You stay in the chat and keep receiving new ones.</p>
          <button class="btn danger" type="button" data-action="leave-conversation" data-conversation-id="${h(conversation.id)}">
            <i class="ti ti-door-exit"></i>${h(conversation.type === 'direct' ? 'Leave this chat' : 'Leave chat')}
          </button>
          <p class="chat-people-note">Moves it to Archived and stops new messages reaching you. Nothing is deleted for anybody else either way.</p>
        </div>
      `}
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

  function renderMessageGroupModal(companyId) {
    const users = companyAccessUsers(companyId);
    const activeProfileId = activeSession().profile.id;
    const teammates = users.filter((user) => (user.profile_id || user.member_id) !== activeProfileId && user.status !== 'disabled');
    if (!teammates.length) {
      return renderModalShell('Messages', 'New group chat', `
        <section class="message-modal-solo">
          <span class="message-solo-badge"><i class="ti ti-user-minus"></i></span>
          <h3>It's just you so far</h3>
          <p>A group needs at least one other person. Invite a teammate, then start the chat.</p>
          <div class="message-you-row">
            ${renderAvatar(activeSession().profile, 'avatar message-person-avatar')}
            <span><strong>${h(activeSession().profile.full_name || 'Lumen Marketing')} <b>You</b></strong><small>${h(activeSession().profile.email || '')}</small></span>
          </div>
          <button class="btn btn-primary full" type="button" data-action="open-message-workspace-members"><i class="ti ti-users"></i>Workspace members</button>
          <button class="btn btn-ghost full" type="button" data-action="message-self"><i class="ti ti-notes"></i>Message myself instead</button>
        </section>
      `, 'message-modal message-create-modal');
    }
    return renderModalShell('Messages', 'New group chat', `
      <div class="message-modal-team">
        <form class="message-modal-form" data-message-group-form>
          <label class="message-field">
            <span>Chat name <small>(optional)</small></span>
            <input name="title" placeholder="e.g. Roof crew - Maple St." />
          </label>
          <input type="hidden" name="type" value="custom" />
          ${renderMessageGroupIconControl()}
          ${renderMessagePeoplePicker(teammates, [])}
          <details class="message-role-disclosure">
            <summary data-message-role-toggle>Adding a whole team? Pick by role instead <i class="ti ti-chevron-down"></i></summary>
            ${renderMessageRolePicker(companyId, [])}
          </details>
          <div class="message-modal-foot">
            <span class="foot-note">Add a name and 1 person to start</span>
            <button class="btn btn-ghost" type="button" data-action="close-modal">Cancel</button>
            <button class="btn btn-primary" type="submit">Create group</button>
          </div>
        </form>
      </div>
    `, 'message-modal message-create-modal');
  }

  function renderMessageWorkspaceMembersModal(companyId) {
    const users = companyAccessUsers(companyId);
    const activeProfileId = activeSession().profile.id;
    const activeUsers = users.filter((user) => user.status !== 'disabled' && user.status !== 'left');
    const teammates = activeUsers.filter((user) => (user.profile_id || user.member_id) !== activeProfileId);
    const pendingInvites = companyInvites(companyId).slice(0, 4);
    const canManageUsers = can('users.manage', companyId);
    return renderModalShell('Messages', 'Workspace members', `
      <section class="message-workspace-members">
        <div class="message-member-summary">
          <span class="message-solo-badge"><i class="ti ti-users"></i></span>
          <div>
            <h3>${teammates.length ? `${teammates.length} teammate${teammates.length === 1 ? '' : 's'} available` : 'No teammates available yet'}</h3>
            <p>Messages are for active members of this workspace. Add people from Users, then start direct or group chats here.</p>
          </div>
        </div>
        <div class="message-workspace-member-list">
          ${teammates.map((user) => {
            const userId = user.profile_id || user.member_id;
            return `
              <article class="message-workspace-member-row">
                ${renderAvatar({ full_name: user.name, email: user.email, avatar_url: user.avatar_url }, 'avatar message-person-avatar')}
                <span><strong>${h(user.name || 'Workspace member')}</strong><small>${h(user.email || user.role_label || titleCase(user.role || 'member'))}</small></span>
                <button class="btn btn-primary btn-sm" type="button" data-action="message-direct-member" data-profile-id="${h(userId)}"><i class="ti ti-message"></i>Message</button>
              </article>
            `;
          }).join('') || emptyState('Only you are active in this workspace right now.')}
        </div>
        ${pendingInvites.length ? `
          <div class="message-pending-invites">
            <strong>Pending access</strong>
            ${pendingInvites.map((invite) => `<span>${h(invite.email)} · ${h(titleCase(invite.status))}</span>`).join('')}
          </div>
        ` : ''}
        <div class="message-modal-foot">
          <span class="foot-note">${canManageUsers ? 'Manage invites and roles from Users.' : 'Ask an Owner/Admin to add workspace members.'}</span>
          <button class="btn btn-ghost" type="button" data-action="close-modal">Close</button>
          <button class="btn btn-primary" type="button" data-action="go-workspace-members" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-users-plus"></i>Open Users</button>
        </div>
      </section>
    `, 'message-modal message-create-modal message-workspace-members-modal');
  }

  /**
   * Confirming a clear or a leave, in the app rather than through window.confirm.
   *
   * The browser's own dialog is stamped with the origin ("127.0.0.1:5173 says"), cannot carry
   * the chat's name in the app's own voice, and blocks the page while it is up. This one says
   * plainly what is about to happen and, just as importantly, what is not.
   *
   * One screen, two intentions, chosen by state.chatExitMode. They are spelled out side by
   * side rather than shortened, because "delete" and "leave" are precisely the pair somebody
   * is about to confuse -- and only one of them can be undone by scrolling up.
   */
  function renderLeaveConversationModal(companyId, conversationId) {
    const conversation = state.messageConversations.find((item) => item.id === conversationId);
    if (!conversation) return renderModalShell('Messages', 'Chat', emptyState('Conversation not found.'));
    const isDirect = conversation.type === 'direct';
    const clearing = state.chatExitMode === 'clear';
    const others = isDirect ? 'The other person' : 'Everyone else';
    const points = clearing
      ? [
        ['ti-check', 'You stay in this chat and keep receiving new messages.'],
        ['ti-check', `${others} keeps every message. Nothing is deleted for anybody but you.`],
        ['ti-alert-triangle', 'The messages already here disappear from your view and cannot be brought back.'],
      ]
      : [
        ['ti-check', `${others} keeps the chat and every message in it.`],
        ['ti-check', 'What was said up to now stays readable under Archived.'],
        ['ti-alert-triangle', isDirect ? 'You stop receiving messages here. Message them again and a fresh chat starts.' : 'You stop receiving messages here. You will need to be added back to rejoin.'],
      ];
    return renderModalShell('Messages', clearing ? 'Delete this chat for you' : 'Leave this chat', `
      <p class="chat-leave-lead">${h(clearing
    ? `“${conversation.title}” starts again from empty for you.`
    : `“${conversation.title}” moves to Archived.`)}</p>
      <ul class="chat-leave-points">
        ${points.map(([icon, text]) => `<li><i class="ti ${icon}" aria-hidden="true"></i>${h(text)}</li>`).join('')}
      </ul>
      <div class="modal-actions">
        <button class="btn" type="button" data-action="cancel-leave-conversation">Cancel</button>
        <button class="btn danger" type="button" data-action="confirm-leave-conversation" data-conversation-id="${h(conversation.id)}">
          <i class="ti ${clearing ? 'ti-eraser' : 'ti-door-exit'}"></i>${h(clearing ? 'Delete chat' : 'Leave chat')}
        </button>
      </div>
    `, 'message-modal');
  }

  return { renderLeaveConversationModal, renderMessageWorkspaceMembersModal, renderMessageGroupModal, renderDirectMessageModal, renderMessageDetailsModal, renderMessageSearchModal };
}
