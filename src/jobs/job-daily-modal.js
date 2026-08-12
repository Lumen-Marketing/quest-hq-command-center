// Daily log, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createJobDailyModal(ctx) {
  const {
    companyTaskAssignees, emptyState, formatDate, h, jobById, memberName,
    renderModalShell, state,
  } = ctx;

  function renderJobDailyModal() {
    const draft = state.jobDailyDraft;
    const job = draft ? jobById(draft.jobId) : null;
    if (!job) return renderModalShell('Jobs', 'Daily report', emptyState('That job is no longer available.'), 'wb-modal-sm');
    const crew = companyTaskAssignees(job.company_id).slice(0, 12);
    const pick = (field, value, label, tone = '') => `
      <button class="jd-opt ${draft[field === 'production' ? 'production' : field === 'cleaned' ? 'cleaned' : 'materialsOk'] === (field === 'production' ? value : value === 'yes') ? `on ${tone}` : ''}"
              type="button" data-action="job-daily-set" data-field="${h(field)}" data-value="${h(value)}">${h(label)}</button>`;

    return renderModalShell('Jobs', 'Daily report', `
      <form class="jd-form" data-job-daily-form>
        <p class="jd-job"><b>${h(job.name)}</b><span>${h(formatDate(new Date().toISOString()))}</span></p>
        ${draft.error ? `<div class="wb-modal-error" role="alert">${h(draft.error)}</div>` : ''}

        <p class="jd-q">How was production?</p>
        <div class="jd-seg">
          ${pick('production', 'good', 'Good', 'good')}
          ${pick('production', 'ok', 'OK', 'ok')}
          ${pick('production', 'rough', 'Rough', 'rough')}
        </div>
        ${draft.production && draft.production !== 'good' ? `
          <label class="jd-why">Roughly what happened?
            <input class="wb-input" name="production_note" value="${h(draft.productionNote)}" placeholder="e.g. 80% — concrete crew in the way" />
          </label>` : ''}

        <p class="jd-q">Who was on site?</p>
        <input class="wb-input" name="crew_label" value="${h(draft.crewLabel)}" placeholder="e.g. Alkeith + 4" />
        ${crew.length ? `<div class="jd-crew">${crew.map((m) => `
          <label class="jd-crew-pick"><input type="checkbox" name="crew_names" value="${h(memberName(m) || '')}" /> ${h(memberName(m) || 'Member')}</label>`).join('')}</div>` : ''}

        <div class="jd-row">
          <p class="jd-q">Site cleaned up?</p>
          <div class="jd-yn">${pick('cleaned', 'yes', 'Yes')}${pick('cleaned', 'no', 'No', 'warn')}</div>
        </div>
        <div class="jd-row">
          <p class="jd-q">Enough material to finish?</p>
          <div class="jd-yn">${pick('materials', 'yes', 'Yes')}${pick('materials', 'no', 'No', 'warn')}</div>
        </div>
        ${draft.materialsOk === false ? `
          <label class="jd-why">What is needed?
            <input class="wb-input" name="materials_needed" placeholder="e.g. 2x6 (40), fascia" />
          </label>` : ''}

        <label class="jd-why">Notes
          <textarea class="wb-input" name="notes" rows="3" placeholder="What got done, what is in the way">${h(draft.notes)}</textarea>
        </label>

        <div class="modal-actions">
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" type="submit">Submit daily</button>
        </div>
      </form>
    `, 'wb-modal-sm');
  }

  return { renderJobDailyModal };
}
