// Find-duplicates and bulk-delete: two dialogs reached from a toolbar button on a list.
//
// Fetched on demand. Neither paints before somebody asks for it, and between them they carry
// enough markup to be worth the split.

import { findDuplicateGroups } from '../data/dedupe.js';

export function createBulkModals(ctx) {
  const {
    activeCompanyId, companyContacts, emptyState, h, isLiveSupabaseSession,
    jobById, money, reauthPasswordField, renderModalShell, selectedJobRows, state,
  } = ctx;

  function renderContactsDedupeModal() {
    const companyId = activeCompanyId();
    const groups = findDuplicateGroups(companyContacts(companyId).map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone })));
    if (!groups.length) {
      return renderModalShell('Contacts', 'Find duplicates',
        `<div class="dedupe-empty">${emptyState('No likely duplicates found. Contacts are matched by email, phone, and name.')}</div>
         <div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Close</button></div>`, '');
    }
    const byId = new Map(companyContacts(companyId).map((c) => [c.id, c]));
    const cards = groups.map((group, gi) => {
      const rows = group.ids.map((id, i) => {
        const c = byId.get(id) || {};
        return `
          <label class="dedupe-row">
            <input type="radio" name="survivor-${gi}" value="${h(id)}" ${i === 0 ? 'checked' : ''} />
            <span class="dedupe-keep-hint">keep</span>
            <span class="dedupe-contact">
              <strong>${h(c.name || 'Unnamed')}</strong>
              <span class="dedupe-meta">${[c.email, c.phone, c.stage].filter(Boolean).map((x) => h(x)).join(' · ') || 'No details'}</span>
            </span>
          </label>`;
      }).join('');
      return `
        <form class="dedupe-group ${group.strong ? '' : 'weak'}" data-dedupe-form data-group="${gi}" data-ids="${h(group.ids.join(','))}">
          <div class="dedupe-group-head">
            <span class="dedupe-reason">${h(group.contacts.length)} possible duplicates · matched by ${h(group.reasons.join(', '))}</span>
            ${group.strong ? '' : '<span class="dedupe-weak-tag">name only — review carefully</span>'}
          </div>
          ${rows}
          <div class="dedupe-group-actions">
            <button class="btn btn-compact btn-primary" type="submit"><i class="ti ti-git-merge"></i>Merge these ${h(group.ids.length)}</button>
          </div>
        </form>`;
    }).join('');
    return renderModalShell('Contacts', `${groups.length} duplicate group${groups.length === 1 ? '' : 's'}`,
      `<p class="modal-lead">Pick the record to keep in each group; the others merge into it (filling any blank fields) and their quotes, tasks, and activity move over.</p>
       <div class="dedupe-list">${cards}</div>
       <div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Done</button></div>`, '');
  }
  function renderJobsBulkDeleteModal() {
    const ctx = state.jobBulkDelete || { count: 0, error: '' };
    const targets = selectedJobRows();
    const n = targets.length;
    const s = n === 1 ? '' : 's';

    // Deletes run one at a time, so there is real progress to show rather than an indefinite
    // spinner that says only "something is happening". The count is the honest version.
    if (ctx.busy) {
      const total = ctx.total || n || 1;
      const done = Math.min(ctx.done || 0, total);
      const pct = Math.round((done / total) * 100);
      return renderModalShell('Jobs', `Deleting ${total} job${total === 1 ? '' : 's'}`, `
        <div class="jobs-delete-progress" role="status" aria-live="polite">
          <div class="jobs-delete-spinner" aria-hidden="true"></div>
          <p class="wb-sub">${ctx.label ? h(ctx.label) : `Moving ${done + 1} of ${total} to the Recycle Bin…`}</p>
          <div class="jobs-delete-bar"><span style="width:${pct}%"></span></div>
          <p class="wb-sub jobs-delete-count">${done} of ${total} done</p>
        </div>
      `, 'wb-modal-sm jobs-delete-busy');
    }

    return renderModalShell('Jobs', `Delete ${n} job${s}`, `
      ${ctx.error ? `<div class="wb-modal-error" role="alert">${h(ctx.error)}</div>` : ''}
      <p class="wb-sub">This moves <b>${n}</b> job${s} to the Recycle Bin, along with what each one carries.</p>
      <ul class="wb-sub jobs-delete-list">${targets.slice(0, 8).map((job) => `<li>${h(job.name)}${job.client_name ? ` — ${h(job.client_name)}` : ''}</li>`).join('')}</ul>
      ${n > 8 ? `<p class="wb-sub">…and ${n - 8} more.</p>` : ''}
      <p class="wb-sub">Deleted jobs can be restored from the Recycle Bin, so this is reversible — but everyone else loses sight of them straight away.</p>
      ${isLiveSupabaseSession() ? reauthPasswordField('jobsDeletePw', 'Confirm your password') : ''}
      <div class="modal-actions">
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
        <button class="btn danger" type="button" data-action="jobs-bulk-delete-confirm" ${n ? '' : 'disabled'}><i class="ti ti-trash"></i>Delete ${n} job${s}</button>
      </div>
    `, 'wb-modal-sm');
  }
  return { renderContactsDedupeModal, renderJobsBulkDeleteModal };
}
