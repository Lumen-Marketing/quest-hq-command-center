// The two-sided card on a record: Activity, and Comments.
//
// "Click Activity and it shows who created the record, who updated it and what fields changed,
// what checklist is checked, who opened the spreadsheet, who edited it, with the time log on it,
// who commented and the latest thread comments. Click Comments and it flips to pure comments
// only, with no activities."
//
// Fetched on demand: the panel only exists on an open record, and the markup for two tabs, a
// merged feed and a mention-aware composer is not something every session should carry.
//
// The reading of the data is record-activity.js, which is pure. This is the drawing.

import {
  ACTIVITY_KINDS, checklistDone, commentThread, markMentions, readableValue, recordFeed, recordTab,
} from './record-activity.js';
import { attachmentsHtml, createAttachments } from './attachments.js';

/**
 * What each entry on the attach menu takes, what it says while it is taking it, and what it
 * looks like.
 *
 * They are separate entries rather than one "attach" because they are separate intentions and
 * they take different things: a 40 MB roof video has no business going through the allowlist a
 * contract PDF goes through, and vice versa.
 */
const PICKERS = {
  file: {
    policyKey: 'document',
    icon: 'ti-file-text',
    tone: '#3b82f6',
    label: 'Document',
    title: 'PDF, Word, Excel, PowerPoint, text or a zip',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.png,.jpg,.jpeg,.webp,.gif',
  },
  media: {
    policyKey: 'media',
    icon: 'ti-photo',
    tone: '#8b5cf6',
    label: 'Photos & videos',
    title: 'An image or a clip from this device',
    accept: '.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.m4v,image/*,video/*',
  },
  camera: {
    policyKey: 'media',
    icon: 'ti-camera',
    tone: '#ec4899',
    label: 'Camera',
    title: 'Take a photo now',
    accept: 'image/*',
    // What turns the picker into the camera on a phone. Ignored on a desktop, which is why the
    // entry is not offered there -- see cameraLikely().
    capture: 'environment',
  },
};

/** The order they are offered in: the two that work anywhere, then the one that needs a camera. */
const MENU_ORDER = ['file', 'media', 'camera'];

/**
 * Whether "Camera" means anything here.
 *
 * `capture` is ignored by desktop browsers, so the entry would open the same file dialog as
 * Photos & videos -- an option that lies about what it does. A coarse pointer is the closest
 * honest proxy for "this is a phone or a tablet", and it is what the rest of the product uses
 * to decide touch layout.
 */
function cameraLikely() {
  try { return !!globalThis.matchMedia?.('(pointer: coarse)')?.matches; } catch { return false; }
}

/**
 * How tall a box has to be for what is typed in it, and whether it has run out of room.
 *
 * Pure, because the arithmetic is the part that goes wrong: `scrollHeight` excludes the border
 * on a border-box element, so a box sized straight from it loses two pixels on every keystroke
 * and creeps. `chrome` is that border, measured by the caller as offsetHeight - clientHeight.
 */
export function grownHeight(scrollHeight, chrome, max) {
  const wanted = Math.max(0, Number(scrollHeight) || 0) + Math.max(0, Number(chrome) || 0);
  const cap = Number(max);
  const capped = Number.isFinite(cap) && cap > 0 ? Math.min(wanted, cap) : wanted;
  return { height: capped, scrolls: wanted > capped };
}

export function createRecordPanel(ctx) {
  const {
    h, state, wbAvatar, wbDoc, wbMemberById, wbMembers, wbTimeAgo, activeProfileId,
    activeCompanyId, render, showToast, addComment,
  } = ctx;
  const attachments = createAttachments(ctx);

  /** Files picked but not sent yet. On state, so a render between picking and sending keeps them. */
  const pending = () => {
    if (!Array.isArray(state.wbCommentFiles)) state.wbCommentFiles = [];
    return state.wbCommentFiles;
  };

  /**
   * Pick, then upload, then repaint.
   *
   * The input is made here and thrown away rather than sitting in the markup: it would be
   * rebuilt by every render anyway, and a file input that survives a repaint is one that can
   * still be holding last week's choice.
   */
  function pickAttachments(which) {
    const picker = PICKERS[which] || PICKERS.file;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = picker.accept;
    if (picker.capture) input.capture = picker.capture;
    input.hidden = true;
    input.onchange = async () => {
      const files = [...(input.files || [])];
      input.remove();
      if (!files.length) return;
      const composer = document.querySelector('[data-wb-comment-add]');
      // Said out loud, because a 30 MB clip takes long enough that a silent button reads as a
      // broken one and gets pressed again.
      if (composer) composer.classList.add('busy');
      try {
        const done = await attachments.uploadAll(activeCompanyId(), files, {
          policyKey: picker.policyKey, folder: 'workspace-comment', scope: 'Workspaces',
        });
        if (done.length) pending().push(...done);
      } catch (error) {
        showToast?.(error.message || 'That file could not be attached.', 'error', 'Workspaces');
      }
      if (composer) composer.classList.remove('busy');
      render?.();
    };
    document.body.appendChild(input);
    input.click();
  }

  /**
   * Enter sends the comment; Alt+Enter breaks the line.
   *
   * "When I hit enter after I type a comment it automatically comments, so to enable a new line
   * you have to press alt+enter." Shift+Enter breaks the line too -- every chat box in the world
   * has already trained people to press it, and refusing it would be pedantry.
   *
   * Two guards against the @-mention list, for the reason the feed's own box documents: both
   * listeners sit on the same element and either can run first, so the flag catches the picker
   * having handled the key (and closed the list), and the hidden check catches this running
   * before the picker.
   *
   * @returns {boolean} whether the key was taken, so the host can stop looking at it
   */
  function commentKey(event) {
    if (!event.target?.matches?.('[data-wb-send-on-enter]')) return false;
    // Mid-word in an IME, Enter is choosing a character, not finishing a sentence.
    if (event.isComposing || event.mentionHandled) return false;
    const results = event.target.closest('[data-wb-mention-wrap]')?.querySelector('[data-wb-mention-results]');
    if (results && !results.hidden) return false;
    // Shift+Enter is left to the browser, which already breaks the line. Alt+Enter has no
    // default behaviour at all, so the break is typed in by hand -- at the caret and over any
    // selection, which is what the key it stands in for does.
    if (event.altKey) {
      event.preventDefault();
      const box = event.target;
      const from = box.selectionStart ?? box.value.length;
      const to = box.selectionEnd ?? from;
      box.value = `${box.value.slice(0, from)}\n${box.value.slice(to)}`;
      box.setSelectionRange(from + 1, from + 1);
      box.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    if (event.shiftKey) return false;
    event.preventDefault();
    // Sending with the menu still open would leave it standing over the comment it just posted.
    state.wbCommentMenu = false;
    Promise.resolve(addComment?.()).catch((error) => showToast?.(error.message || 'Comment save failed.', 'error', 'Workspaces'));
    return true;
  }

  /** The one action attribute the composer's chips speak, so the host binds a single branch. */
  function attachAction(payload) {
    const [action, arg] = String(payload || '').split(':');
    if (action === 'menu') { state.wbCommentMenu = !state.wbCommentMenu; render?.(); return; }
    if (action === 'close') { state.wbCommentMenu = false; render?.(); return; }
    // Closed before the dialog opens, not after it returns: the file dialog can sit there for a
    // minute, and a menu left standing under it is still on screen when it does.
    if (action === 'pick') { state.wbCommentMenu = false; pickAttachments(arg); render?.(); return; }
    if (action === 'drop') {
      const at = Number(arg);
      if (Number.isFinite(at)) state.wbCommentFiles = pending().filter((_, i) => i !== at);
      render?.();
    }
  }

  /**
   * The workspace and app a record belongs to.
   *
   * Found here rather than passed in: only this card needs it, and a scan every session carries
   * for a lookup most of them never make is the sort of thing the budget is spent on by accident.
   */
  function ownerOf(companyId, itemId) {
    for (const workspace of wbDoc(companyId)?.workspaces || []) {
      for (const app of workspace.apps || []) {
        if (!app || app.linked) continue;
        if ((app.items || []).some((entry) => entry.id === itemId)) return { workspace, app };
      }
    }
    return { workspace: null, app: null };
  }

  /** The author as they are NOW, so a later rename shows on every comment they ever left. */
  function person(companyId, id, fallbackName) {
    const member = id ? wbMemberById(companyId, id) : null;
    const live = member && member.name && member.name !== 'Unknown' ? member : null;
    return {
      id,
      name: live ? live.name : (fallbackName || 'User'),
      color: live ? live.color : '#6b7280',
      avatar_url: live?.avatar_url || '',
    };
  }

  /** A comment's text: escaped first, then its mentions marked, so neither can forge the other. */
  function commentBody(companyId, body) {
    return markMentions(h(body), wbMembers(companyId), (hit) => `<span class="wb-at">${hit}</span>`);
  }

  function commentRow(companyId, entry, { editable }) {
    const who = person(companyId, entry.authorId, entry.author);
    const mine = editable && !!entry.authorId && entry.authorId === activeProfileId();
    const avatar = wbAvatar(who, 26);
    if (mine && state.wbEditingCommentId === entry.id) {
      return `<div class="wb-comment">${avatar}<div class="wb-comment-body">
        <textarea class="wb-input" id="wbEditComment-${h(entry.id)}" data-wb-autogrow rows="2">${h(entry.text)}</textarea>
        <div class="wb-comment-edit-acts">
          <button class="btn btn-primary btn-sm" type="button" data-wb-comment-save="${h(entry.id)}"><i class="ti ti-check"></i>Save</button>
          <button class="btn btn-sm" type="button" data-wb-comment-cancel>Cancel</button>
        </div></div></div>`;
    }
    const acts = mine
      ? `<span class="wb-comment-acts">
          <button class="wb-comment-act" type="button" data-wb-comment-edit="${h(entry.id)}" title="Edit"><i class="ti ti-pencil"></i></button>
          <button class="wb-comment-act danger" type="button" data-wb-comment-del="${h(entry.id)}" title="Delete"><i class="ti ti-trash"></i></button>
        </span>`
      : '';
    return `<div class="wb-comment">${avatar}<div class="wb-comment-body">
      <div class="wb-comment-head"><b>${h(who.name)}</b><span>${h(wbTimeAgo(entry.ts))}${entry.editedAt ? ' · edited' : ''}</span>${acts}</div>
      ${entry.text ? `<div class="wb-comment-text">${commentBody(companyId, entry.text)}</div>` : ''}
      ${attachmentsHtml(entry.files, { h })}
    </div></div>`;
  }

  /**
   * One line of history.
   *
   * A change carries what it changed, so the row reads "Stage · To Do → Done" rather than
   * "updated" -- which is the difference between a log and a receipt.
   */
  function activityRow(companyId, entry) {
    const who = person(companyId, entry.actorId, entry.actor);
    const meta = ACTIVITY_KINDS[entry.kind] || ACTIVITY_KINDS.other;
    if (entry.kind === 'comment') {
      return `<div class="wb-act-line is-comment">
        ${wbAvatar(who, 24)}
        <div class="wb-act-main">
          <div class="wb-act-who"><b>${h(who.name)}</b><span>${h(wbTimeAgo(entry.at))}</span></div>
          ${entry.body ? `<div class="wb-act-said">${commentBody(companyId, entry.body)}</div>` : ''}
          ${attachmentsHtml(entry.files, { h })}
        </div></div>`;
    }
    const changes = (entry.changes || []).map((change) => {
      // A checklist reads as the steps that are TICKED, struck through -- which is what a
      // checklist means. Printed whole it is counts, a percentage and every step somebody has
      // NOT done, to report the one they just did.
      const list = change.type === 'checklist' ? checklistDone(change.to) : null;
      if (list) {
        return `<span class="wb-act-change">
        <em>${h(change.label)}</em>
        ${list.done.length
    ? `<span class="wb-act-ticks">${list.done.map((label) => `<s class="wb-act-tick">${h(label)}</s>`).join('')}</span>`
    : '<span class="wb-act-cleared">nothing ticked</span>'}
        <span class="wb-act-of">${list.done.length}/${list.total}</span>
      </span>`;
      }
      // Read on the way OUT, not just on the way in. An entry written before file values were
      // understood still holds the whole array -- names, signed URLs, tokens -- and the history is
      // the part worth keeping, so it is made readable here rather than rewritten or thrown away.
      const from = readableValue(change.from);
      const to = readableValue(change.to);
      return `<span class="wb-act-change">
        <em>${h(change.label)}</em>
        ${from ? `<s>${h(from)}</s>` : ''}
        <b>${h(to) || '<span class="wb-act-cleared">cleared</span>'}</b>
      </span>`;
    }).join('');
    return `<div class="wb-act-line">
      <span class="wb-act-dot" style="background:${h(entry.color || meta.color)}"><i class="ti ${h(entry.icon || meta.icon)}"></i></span>
      <div class="wb-act-main">
        <div class="wb-act-who"><b>${h(who.name || 'Someone')}</b><span>${h(wbTimeAgo(entry.at))}</span></div>
        <div class="wb-act-said">${entry.html}</div>
        ${changes ? `<div class="wb-act-changes">${changes}</div>` : ''}
      </div></div>`;
  }

  /**
   * What is attached, offered by name.
   *
   * Two bare icons said nothing about what each one took, and the answer -- one is for the
   * contract, the other for the photo -- is not something an icon can carry. One `+`, and the
   * choices written out.
   */
  function attachMenu() {
    const rows = MENU_ORDER
      .filter((which) => which !== 'camera' || cameraLikely())
      .map((which) => {
        const picker = PICKERS[which];
        // One line per entry. The name already answers which takes the contract and which takes
        // the photo; the detail ("PDF, Word, Excel…") stays as the row's tooltip rather than a
        // second line under every name, which is what the asked-for look does.
        return `<button type="button" role="menuitem" data-wb-att="pick:${which}" title="${h(picker.title)}">
          <span class="wb-attach-ic" style="color:${h(picker.tone)}"><i class="ti ${h(picker.icon)}"></i></span>
          <span class="wb-attach-label">${h(picker.label)}</span>
        </button>`;
      }).join('');
    return `<div class="wb-attach-menu" role="menu" aria-label="Attach to this comment">${rows}</div>`;
  }

  /**
   * The @-mention composer, shared by both tabs so the box is the same wherever it appears.
   *
   * The box grows downward as it is typed into (mountComposer), so a long comment is written in
   * a box the size of the comment rather than through a two-line slot. It is capped and then
   * scrolls: a box that grows without limit pushes the thread it is a reply to off the screen.
   */
  function composer(canWrite) {
    if (!canWrite) return '';
    const waiting = pending();
    const open = !!state.wbCommentMenu;
    // The box gets the whole width and the buttons go under it. Beside it they took about two
    // hundred pixels of a panel that is already the narrow half of a record, which left a
    // comment box you could not see a sentence in.
    return `<div class="wb-comment-add" data-wb-comment-add>
      ${attachmentsHtml(waiting, { h, drop: true })}
      <div class="wb-mention-wrap" data-wb-mention-wrap>
        <textarea class="wb-input" id="wbCommentInput" data-wb-mention data-wb-send-on-enter data-wb-autogrow rows="2" placeholder="Add a comment — @ to mention someone"></textarea>
        <div class="wb-mention-results" data-wb-mention-results role="listbox" hidden></div>
      </div>
      <div class="wb-comment-tools">
        <span class="wb-attach">
          <button type="button" class="wb-comment-clip${open ? ' on' : ''}" data-wb-att="menu"
            aria-haspopup="menu" aria-expanded="${open}" title="Attach a file"
            aria-label="Attach a file"><i class="ti ti-plus"></i></button>
          ${open ? attachMenu() : ''}
        </span>
        <button class="btn btn-primary btn-sm" type="button" data-wb-add-comment title="Enter sends · Alt+Enter for a new line"><i class="ti ti-send"></i>Comment</button>
      </div>
    </div>`;
  }

  /**
   * Size a box to what is in it.
   *
   * Height is cleared first: measuring `scrollHeight` while the box is already tall reports the
   * height it HAS, not the height it needs, so a box that has grown could never shrink again.
   */
  function growBox(box) {
    if (!box?.style) return;
    box.style.height = 'auto';
    const chrome = (box.offsetHeight || 0) - (box.clientHeight || 0);
    const max = parseFloat(globalThis.getComputedStyle?.(box)?.maxHeight);
    const { height, scrolls } = grownHeight(box.scrollHeight, chrome, max);
    box.style.height = `${height}px`;
    // Hidden rather than auto while it still fits: `auto` reserves nothing, but a scrollbar
    // flickering in and out on the line where the text wraps is worse than the pixel it saves.
    box.style.overflowY = scrolls ? 'auto' : 'hidden';
  }

  /**
   * After every paint: grow the boxes, and put back what was being typed.
   *
   * The panel is redrawn whole by any state change -- attaching a file, opening this menu -- and
   * a redrawn textarea comes back empty. Before the draft was banked, uploading a photo threw
   * away the sentence somebody had already written to go with it.
   */
  function mountComposer(root) {
    const scope = root || (typeof document === 'undefined' ? null : document);
    scope?.querySelectorAll?.('[data-wb-autogrow]').forEach((box) => {
      const composing = box.id === 'wbCommentInput';
      if (composing && !box.value && state.wbCommentDraft) {
        box.value = state.wbCommentDraft;
        const end = box.value.length;
        box.setSelectionRange?.(end, end);
      }
      // A property, not addEventListener: this runs after every paint, and on a box that
      // survived one, listeners would stack up a copy per render.
      box.oninput = () => {
        if (composing) state.wbCommentDraft = box.value;
        growBox(box);
      };
      growBox(box);
    });
  }

  /**
   * The composer belongs to the record it is drawn on.
   *
   * Both the draft and the tray of uploaded files live on `state`, because a render between
   * picking and sending has to keep them. Stepping to the next record with 4 of 5 in the pager
   * would otherwise carry them along, and the next Comment would file somebody else's photos
   * against the wrong job.
   */
  function claimComposer(itemId) {
    if (state.wbComposerFor === itemId) return;
    state.wbComposerFor = itemId;
    state.wbCommentFiles = [];
    state.wbCommentDraft = '';
    state.wbCommentMenu = false;
  }

  /**
   * The card.
   *
   * @param {object} where  { companyId, item, canWrite }
   */
  function recordPanel({ companyId, item, canWrite = true }) {
    claimComposer(item.id);
    // The panel mounts itself. This runs while the markup is still a string, so the microtask
    // lands after the host has put it in the page -- the same order every mount in main.js uses,
    // and one fewer line in the entry bundle than asking the host to make the call.
    queueMicrotask(mountComposer);
    const { workspace, app } = ownerOf(companyId, item.id);
    const comments = Array.isArray(item.comments) ? item.comments : [];
    const tab = recordTab(state.wbRecordTab);
    const feed = tab === 'activity'
      ? recordFeed(workspace, app?.id, item.id, comments)
      : [];
    const thread = tab === 'comments' ? commentThread(comments) : [];

    const body = tab === 'activity'
      ? (feed.length
        ? `<div class="wb-act-feed">${feed.map((entry) => activityRow(companyId, entry)).join('')}</div>`
        : '<div class="wb-sub">Nothing yet. Edits, checklists, spreadsheets and comments all show up here.</div>')
      : (thread.length
        ? `<div class="wb-comment-list">${thread.map((entry) => commentRow(companyId, entry, { editable: canWrite })).join('')}</div>`
        : '<div class="wb-sub">No comments yet — start the conversation.</div>');

    const tabButton = (name, label, count) => `<button type="button" class="wb-rec-tab ${tab === name ? 'on' : ''}" data-wb-rec-tab="${name}" aria-selected="${tab === name}">${label}${count ? `<span class="wb-rec-count">${count}</span>` : ''}</button>`;

    return `<div class="wb-rec-panel" data-wb-rec-panel>
      <div class="wb-rec-tabs" role="tablist">
        ${tabButton('activity', 'Activity', 0)}
        ${tabButton('comments', 'Comments', comments.length)}
      </div>
      <div class="wb-rec-body">${body}</div>
      ${composer(canWrite)}
    </div>`;
  }

  /**
   * Shutting the attach menu, owned here rather than by the host.
   *
   * Both listeners live in this chunk because the entry bundle is measured in bytes and had 33
   * of them left -- a branch there for a menu most sessions never open is the wrong place to
   * spend them. Bound once, when the chunk loads, which is the first time a record is opened.
   *
   * The press is taken on the way UP, after the host has acted on it: closing during capture
   * re-renders the page under a click the host has not handled yet. Escape is taken on the way
   * DOWN, because the host's next stop for that key is "dismiss the record", and closing a menu
   * must not close the record behind it.
   */
  const closeMenu = () => { state.wbCommentMenu = false; render?.(); };
  const listen = (name, handler, capture) => (typeof document === 'undefined'
    ? null
    : document.addEventListener?.(name, handler, capture));
  listen('click', (event) => {
    // The + and every row of the menu carry [data-wb-att], and the host acts on those already.
    if (state.wbCommentMenu && !event.target?.closest?.('[data-wb-att]')) closeMenu();
  }, false);
  listen('keydown', (event) => {
    if (event.key !== 'Escape' || !state.wbCommentMenu) return;
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
  }, true);

  return { recordPanel, attachAction, commentKey, mountComposer };
}
