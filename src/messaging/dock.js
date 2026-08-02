// The floating message dock: a circular button in the bottom-right corner that opens a
// launcher, and a small chat window that floats above the page.
//
// Fetched on demand — the button itself is a few hundred bytes in the shell, and none of
// this renders until someone opens it.
//
// It deliberately does NOT reimplement messaging. Starting a conversation, sending, unread
// counts and permissions all stay with the functions that already own them in main.js and
// arrive through `ctx`; this module owns layout and nothing else. A second send path would
// be a second set of permission checks to keep in step.
//
// The guide tab is grounded, not generative: it searches the curated HELP_TOPICS index
// that already backs the command palette. There is no language model here, so it cannot
// invent a feature that does not exist — the failure mode is "no answer", which is the
// right one for in-product help.

function h(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const TABS = [
  ['recent', 'Recent', 'ti-message-circle'],
  ['people', 'People', 'ti-users'],
  ['guide', 'Guide', 'ti-help-circle'],
];

/** The launcher's three tabs. `dock.tab` is the current one. */
function renderTabs(tab) {
  return `<div class="msgdock-tabs" role="tablist">${TABS.map(([id, label, icon]) => `
    <button class="msgdock-tab ${tab === id ? 'active' : ''}" type="button" role="tab" aria-selected="${tab === id ? 'true' : 'false'}" data-action="msgdock-tab" data-tab="${h(id)}">
      <i class="ti ${icon}" aria-hidden="true"></i><span>${h(label)}</span>
    </button>`).join('')}</div>`;
}

function renderRecent(conversations, unreadFor) {
  if (!conversations.length) {
    return `<div class="msgdock-empty"><i class="ti ti-message-off" aria-hidden="true"></i><p>No conversations yet. Start one from <b>People</b>.</p></div>`;
  }
  return `<ul class="msgdock-list">${conversations.map((c) => {
    const unread = unreadFor(c.id);
    return `<li><button class="msgdock-row" type="button" data-action="msgdock-open-conversation" data-conversation-id="${h(c.id)}">
      <span class="msgdock-row-main">
        <b>${h(c.title)}</b>
        <small>${h(c.preview || 'No messages yet')}</small>
      </span>
      ${unread ? `<span class="msgdock-unread" aria-label="${unread} unread">${unread > 9 ? '9+' : unread}</span>` : ''}
    </button></li>`;
  }).join('')}</ul>`;
}

function renderPeople(people, query) {
  const rows = people.length
    ? `<ul class="msgdock-list">${people.map((p) => `<li>
        <button class="msgdock-row" type="button" data-action="msgdock-message-person" data-profile-id="${h(p.id)}">
          <span class="msgdock-avatar" style="background:${h(p.color || '#6b7280')}" aria-hidden="true">${h(p.initials)}</span>
          <span class="msgdock-row-main"><b>${h(p.name)}</b><small>${h(p.role || 'Member')}</small></span>
          ${p.online ? '<span class="msgdock-online" title="Online"></span>' : ''}
        </button></li>`).join('')}</ul>`
    : `<div class="msgdock-empty"><i class="ti ti-user-search" aria-hidden="true"></i><p>Nobody matches “${h(query)}”.</p></div>`;
  return `<label class="msgdock-search">
      <i class="ti ti-search" aria-hidden="true"></i>
      <input type="search" placeholder="Search people…" value="${h(query)}" data-msgdock-people-search aria-label="Search people" />
    </label>${rows}`;
}

function renderGuide(query, topics, asked) {
  // Before anything is typed the topics ARE the answer: a list of what can be asked is
  // more useful than an empty box that gives no clue what this understands.
  const heading = asked
    ? (topics.length ? `<p class="msgdock-guide-lead">Here’s what I have on that:</p>` : '')
    : `<p class="msgdock-guide-lead">Ask about anything in Questbase — or pick a topic.</p>`;
  const body = topics.length
    ? `<ul class="msgdock-guide-list">${topics.map((t) => `<li class="msgdock-guide-item">
        <b>${h(t.title)}</b>
        <p>${h(t.answer)}</p>
      </li>`).join('')}</ul>`
    : `<div class="msgdock-empty"><i class="ti ti-help-off" aria-hidden="true"></i>
        <p>Nothing on “${h(query)}” yet. Try words like <b>task</b>, <b>quote</b>, <b>contact</b> or <b>workspace</b>.</p>
        <p class="msgdock-guide-note">This guide answers from Questbase’s built-in help, so it only covers what the product actually does.</p>
      </div>`;
  return `<label class="msgdock-search">
      <i class="ti ti-sparkles" aria-hidden="true"></i>
      <input type="search" placeholder="Ask about Questbase…" value="${h(query)}" data-msgdock-guide-search aria-label="Ask about Questbase" />
    </label>${heading}${body}`;
}

/**
 * The dock's whole interior: launcher or open conversation.
 *
 * `ctx` is a set of accessor functions rather than state, so this module cannot reach into
 * the application — every read goes through code that already applies the right access
 * filtering, and shaping the data here keeps it out of the eager bundle.
 */
export function renderDock(dock, ctx) {
  if (dock.conversationId) {
    const conversation = ctx.conversation(dock.conversationId);
    // The conversation can vanish underneath the dock — deleted, or access removed while
    // it was open. Falling back to the launcher beats rendering an empty shell.
    if (conversation) {
      return renderChat(dock, {
        title: conversation.title,
        canSend: ctx.canSend(conversation.company_id),
        fullHref: ctx.fullHref(conversation.id),
        messages: ctx.messages(conversation.id).map((message) => ({
          body: message.body,
          mine: message.sender_profile_id === ctx.selfId,
          author: ctx.memberName(message.sender_profile_id),
          when: ctx.timeAgo(message.created_at),
        })),
      });
    }
  }

  const query = String(dock.peopleQuery || '').trim().toLowerCase();
  const online = ctx.onlineIds();
  return renderLauncher(dock, {
    conversations: ctx.conversations().map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      preview: (ctx.lastMessage(conversation.id) || {}).body || '',
    })),
    unreadFor: ctx.unreadFor,
    people: ctx.members()
      // Messaging yourself has its own entry point; listing it here reads like a mistake.
      .filter((member) => member.id !== ctx.selfId)
      .filter((member) => !query || String(member.name || '').toLowerCase().includes(query))
      .slice(0, 40)
      .map((member) => ({
        id: member.id,
        name: member.name || 'Member',
        role: member.role ? ctx.titleCase(member.role) : '',
        color: member.color,
        initials: ctx.initials(member.name || 'Member'),
        online: online.has(member.id),
      })),
    guideTopics: String(dock.guideQuery || '').trim()
      ? searchGuide(dock.guideQuery).slice(0, 6)
      : allGuideTopics().slice(0, 6),
  });
}

// Bound by the loader in main.js, which imports the help index alongside this module.
let searchGuide = () => [];
let allGuideTopics = () => [];

/** Hands this module the curated help index rather than importing it twice. */
export function useHelpIndex(searchHelp, topics) {
  searchGuide = searchHelp;
  allGuideTopics = () => topics;
}

/**
 * The launcher panel. `ctx` carries only data and already-formatted values — this module
 * never reaches into application state.
 */
export function renderLauncher(dock, ctx) {
  const tab = TABS.some(([id]) => id === dock.tab) ? dock.tab : 'recent';
  let body;
  if (tab === 'people') body = renderPeople(ctx.people, dock.peopleQuery || '');
  else if (tab === 'guide') body = renderGuide(dock.guideQuery || '', ctx.guideTopics, !!(dock.guideQuery || '').trim());
  else body = renderRecent(ctx.conversations, ctx.unreadFor);
  return `<section class="msgdock-panel" role="dialog" aria-label="Messages and help">
      <header class="msgdock-head">
        <b>Messages</b>
        <button class="msgdock-icon" type="button" data-action="msgdock-close" aria-label="Close messages"><i class="ti ti-x" aria-hidden="true"></i></button>
      </header>
      ${renderTabs(tab)}
      <div class="msgdock-body">${body}</div>
    </section>`;
}

/**
 * The floating conversation. Messages come in already resolved to a name, a body and a
 * timestamp label, so this module needs no access to profiles or formatting rules.
 */
export function renderChat(chat, ctx) {
  const lines = ctx.messages.length
    ? ctx.messages.map((m) => `<div class="msgdock-msg ${m.mine ? 'mine' : ''}">
        ${m.mine ? '' : `<span class="msgdock-msg-who">${h(m.author)}</span>`}
        <p>${h(m.body)}</p>
        <time>${h(m.when)}</time>
      </div>`).join('')
    : `<div class="msgdock-empty"><i class="ti ti-message-plus" aria-hidden="true"></i><p>Say hello.</p></div>`;
  // The composer posts through the app's own message form handler, so permissions,
  // attachment rules and the double-send guard all still apply.
  const composer = ctx.canSend
    ? `<form class="msgdock-composer" data-message-form data-conversation-id="${h(chat.conversationId)}">
        <input type="text" name="body" placeholder="Message ${h(ctx.title)}…" autocomplete="off" aria-label="Message" />
        <button class="btn btn-primary msgdock-send" type="submit" aria-label="Send"><i class="ti ti-send" aria-hidden="true"></i></button>
      </form>`
    : `<p class="msgdock-readonly">Your role cannot send messages here.</p>`;
  return `<section class="msgdock-chat" role="dialog" aria-label="Conversation with ${h(ctx.title)}">
      <header class="msgdock-head">
        <button class="msgdock-icon" type="button" data-action="msgdock-back" aria-label="Back to messages"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
        <b>${h(ctx.title)}</b>
        <a class="msgdock-icon" href="${h(ctx.fullHref)}" data-router title="Open in Messages" aria-label="Open in Messages"><i class="ti ti-arrows-diagonal" aria-hidden="true"></i></a>
        <button class="msgdock-icon" type="button" data-action="msgdock-close" aria-label="Close conversation"><i class="ti ti-x" aria-hidden="true"></i></button>
      </header>
      <div class="msgdock-scroll" data-msgdock-scroll>${lines}</div>
      ${composer}
    </section>`;
}
