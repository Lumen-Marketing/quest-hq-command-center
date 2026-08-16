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
  ACTIVITY_KINDS, checklistDone, commentThread, markMentions, recordFeed, recordTab,
} from './record-activity.js';

export function createRecordPanel(ctx) {
  const { h, state, wbAvatar, wbDoc, wbMemberById, wbMembers, wbTimeAgo, activeProfileId } = ctx;

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
        <textarea class="wb-input" id="wbEditComment-${h(entry.id)}" rows="2">${h(entry.text)}</textarea>
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
      <div class="wb-comment-text">${commentBody(companyId, entry.text)}</div>
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
          <div class="wb-act-said">${commentBody(companyId, entry.body)}</div>
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
      return `<span class="wb-act-change">
        <em>${h(change.label)}</em>
        ${change.from ? `<s>${h(change.from)}</s>` : ''}
        <b>${h(change.to) || '<span class="wb-act-cleared">cleared</span>'}</b>
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

  /** The @-mention composer, shared by both tabs so the box is the same wherever it appears. */
  function composer(canWrite) {
    if (!canWrite) return '';
    return `<div class="wb-comment-add">
      <div class="wb-mention-wrap" data-wb-mention-wrap>
        <textarea class="wb-input" id="wbCommentInput" data-wb-mention rows="2" placeholder="Add a comment — @ to mention someone"></textarea>
        <div class="wb-mention-results" data-wb-mention-results role="listbox" hidden></div>
      </div>
      <button class="btn btn-primary btn-sm" type="button" data-wb-add-comment><i class="ti ti-send"></i>Comment</button>
    </div>`;
  }

  /**
   * The card.
   *
   * @param {object} where  { companyId, item, canWrite }
   */
  function recordPanel({ companyId, item, canWrite = true }) {
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

  return { recordPanel };
}
