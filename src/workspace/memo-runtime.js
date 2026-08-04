// Everything a calendar memo does once it exists: the dialog that edits one, and the alarm
// that makes it go off.
//
// Fetched on demand, and only when a memo exists at all -- most companies have none, and the
// entry bundle should not carry an alarm clock for them.
//
// It runs one timer aimed at the NEXT memo due rather than polling. That matters more than it
// sounds: a poll wakes the tab forever, on every device, to discover nothing has happened.
//
// It can only fire while a tab is open. There is no service worker and no push subscription
// here, so a closed browser gets nothing, and the dialog says so rather than implying
// otherwise.

import {
  DATE_RE, REMIND_CHOICES, addMemo, dueMemos, localDay, memoWhen, memosOf, nextDueAt,
  removeMemo, updateMemo,
} from './calendar-memos.js';

export function createMemoRuntime(ctx) {
  const {
    state, render, showToast, formatDate, wbSave, wbFind, can, openWbModal,
  } = ctx;
  let timer = null;

  /** Every app in every loaded company doc that actually carries memos. */
  function appsWithMemos() {
    const out = [];
    Object.keys(state.workspaceBuilderDocs || {}).forEach((companyId) => {
      (state.workspaceBuilderDocs[companyId]?.workspaces || []).forEach((ws) => {
        (ws.apps || []).forEach((app) => {
          if (Array.isArray(app.memos) && app.memos.length) out.push({ companyId, app });
        });
      });
    });
    return out;
  }

  /** A desktop notification, only when permission is already granted. It never asks here. */
  function desktopNotify(memo, app) {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const note = new Notification(memo.title, {
        body: `${app.name || 'Memo'} · ${memoWhen(memo, formatDate)}${memo.note ? ` — ${memo.note}` : ''}`,
        tag: `quest-memo-${memo.id}`,
      });
      note.onclick = () => { window.focus(); note.close(); };
    } catch (error) {
      // A blocked or unsupported Notification must never take the in-app toast down with it.
      console.warn('Desktop notification failed', error);
    }
  }

  function fireDue() {
    const now = new Date();
    let fired = false;
    appsWithMemos().forEach(({ companyId, app }) => {
      dueMemos(app, now).forEach((memo) => {
        fired = true;
        // Stamped BEFORE it is announced, so a second tick cannot announce it twice.
        app.memos = updateMemo(app, memo.id, { notifiedAt: new Date().toISOString() });
        showToast(`${memo.title} — ${memoWhen(memo, formatDate)}`, 'local', app.name || 'Memo');
        desktopNotify(memo, app);
        wbSave(companyId);
      });
    });
    if (fired) render();
  }

  function schedule() {
    if (timer) { clearTimeout(timer); timer = null; }
    fireDue();
    const now = new Date();
    let soonest = null;
    appsWithMemos().forEach(({ app }) => {
      const next = nextDueAt(app, now);
      if (next && (!soonest || next < soonest)) soonest = next;
    });
    if (!soonest) return;
    // Capped at six hours: setTimeout past ~24.8 days overflows and fires immediately, and
    // re-arming on a cap is cheaper than reasoning about that.
    const wait = Math.min(Math.max(soonest.getTime() - Date.now(), 1000), 6 * 60 * 60 * 1000);
    timer = setTimeout(() => { timer = null; schedule(); }, wait);
  }

  /**
   * Ask for desktop-notification permission at the moment a reminder is chosen.
   *
   * Never on load: an unprompted permission prompt is the thing every browser now penalises,
   * and it is meaningless before the user has expressed any interest in being reminded.
   */
  function requestPermission() {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
      Notification.requestPermission().catch(() => {});
    } catch { /* unsupported; the in-app toast still works */ }
  }

  const stop = () => { if (timer) { clearTimeout(timer); timer = null; } };


  // ---- the dialog -------------------------------------------------------------------------

  function openMemoModal(companyId, workspaceId, appId, memoId, onDate) {
    const { app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    const existing = memoId ? memosOf(app).find((m) => m.id === memoId) : null;
    openWbModal({
      kind: 'memo',
      companyId,
      workspaceId,
      appId,
      memoId: memoId || '',
      remindChoices: REMIND_CHOICES,
      draft: existing
        ? { ...existing }
        : { title: '', note: '', date: onDate || localDay(), time: '', remindMinutes: null, done: false },
    });
  }

  /** Read the dialog back into the draft before anything re-renders it. */
  function collectDraft(overlay) {
    const m = state.builderModal;
    if (!m || m.kind !== 'memo') return;
    (overlay || document).querySelectorAll('[data-wb-memo-field]').forEach((el) => {
      const key = el.dataset.wbMemoField;
      if (key === 'remindMinutes') m.draft[key] = el.value === '' ? null : Number(el.value);
      else m.draft[key] = el.value;
    });
  }

  /** Every memo write goes through one save, so a half-applied one cannot stick. */
  function edit(companyId, workspaceId, appId, change) {
    const { app } = wbFind(companyId, workspaceId, appId);
    if (!app || !can('workspaces.manage', companyId)) return;
    app.memos = change(app);
    wbSave(companyId);
    render();
    schedule();
  }

  function mountMemoModal(overlay) {
    const m = state.builderModal;
    if (!m || m.kind !== 'memo') return;
    // Persist every keystroke into the draft so no background render can wipe half a memo.
    overlay.querySelectorAll('[data-wb-memo-field]').forEach((el) => {
      el.addEventListener('input', () => collectDraft(overlay));
      el.addEventListener('change', () => collectDraft(overlay));
    });
    // Asked for at the moment a reminder is chosen -- the only point where it means anything.
    const remind = overlay.querySelector('[data-wb-memo-field="remindMinutes"]');
    if (remind) remind.addEventListener('change', () => { if (remind.value !== '') requestPermission(); });

    const save = overlay.querySelector('[data-wb-memo-save]');
    if (save) save.onclick = () => {
      collectDraft(overlay);
      const { companyId, workspaceId, appId, memoId, draft } = state.builderModal;
      if (!String(draft.title || '').trim()) { showToast('Give the memo a title.', 'local', 'Workspaces'); return; }
      if (!DATE_RE.test(String(draft.date || ''))) { showToast('Pick a date for the memo.', 'local', 'Workspaces'); return; }
      // Changing when it fires re-arms it: a memo moved to a later time must alarm again.
      const patch = { ...draft, notifiedAt: '' };
      state.builderModal = null;
      edit(companyId, workspaceId, appId, (app) => (memoId ? updateMemo(app, memoId, patch) : addMemo(app, patch)));
    };

    const done = overlay.querySelector('[data-wb-memo-done]');
    if (done) done.onclick = () => {
      const { companyId, workspaceId, appId, memoId } = state.builderModal;
      state.builderModal = null;
      edit(companyId, workspaceId, appId, (app) => updateMemo(app, memoId, { done: true }));
    };

    const del = overlay.querySelector('[data-wb-memo-delete]');
    if (del) del.onclick = () => {
      const { companyId, workspaceId, appId, memoId } = state.builderModal;
      state.builderModal = null;
      edit(companyId, workspaceId, appId, (app) => removeMemo(app, memoId));
    };
  }

  return { schedule, requestPermission, stop, appsWithMemos, openMemoModal, mountMemoModal };
}
