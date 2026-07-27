export function createSupportController({
  state,
  CONFIG,
  h,
  renderModalShell,
  isLiveSupabaseSession,
  createSupabaseClient,
  activeCompanyId,
  render,
  showToast,
}) {
  function emptyReport() {
    return { type: 'problem', description: '', error: '', submitting: false };
  }

  function open() {
    state.supportReport = emptyReport();
    state.modal = 'support';
    render();
  }

  function renderSupportModal() {
    const report = state.supportReport || emptyReport();
    const canSubmit = isLiveSupabaseSession();
    return renderModalShell('Questbase support', 'How can we help?', `
      <div class="support-modal-grid">
        <section class="support-guide-card">
          <div class="support-guide-icon"><i class="ti ti-command"></i></div>
          <div>
            <h3>Get an answer inside Questbase</h3>
            <p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> and ask how to complete a task, find a tool, or use your workspace.</p>
          </div>
          <a class="btn" href="mailto:${encodeURIComponent(CONFIG.supportEmail)}"><i class="ti ti-mail"></i>Email support</a>
          <small>${h(CONFIG.supportEmail)}</small>
        </section>
        <form class="support-report-form" data-support-report-form>
          <div>
            <h3>Send a report</h3>
            <p>Tell the Questbase team what happened. Your current page and device details are attached automatically.</p>
          </div>
          <label>Report type
            <select name="type">
              <option value="bug" ${report.type === 'bug' ? 'selected' : ''}>Bug</option>
              <option value="problem" ${report.type === 'problem' ? 'selected' : ''}>Problem</option>
              <option value="suggestion" ${report.type === 'suggestion' ? 'selected' : ''}>Suggestion</option>
            </select>
          </label>
          <label>Description
            <textarea name="description" rows="7" maxlength="2000" required placeholder="What were you trying to do, and what happened?">${h(report.description || '')}</textarea>
          </label>
          ${report.error ? `<div class="wb-form-error" role="alert">${h(report.error)}</div>` : ''}
          ${canSubmit ? '' : '<p class="form-note">Sign in to a live workspace to send a report. Email support is still available.</p>'}
          <div class="modal-actions">
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
            <button class="btn btn-primary" type="submit" ${canSubmit && !report.submitting ? '' : 'disabled'}>
              <i class="ti ti-send"></i>${report.submitting ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </form>
      </div>
    `, 'support-modal');
  }

  async function submitSupportReport(formNode) {
    const form = Object.fromEntries(new FormData(formNode).entries());
    const type = ['bug', 'problem', 'suggestion'].includes(String(form.type || ''))
      ? String(form.type)
      : 'problem';
    const description = String(form.description || '').trim().slice(0, 2000);
    state.supportReport = { type, description, error: '', submitting: false };
    if (!description) {
      state.supportReport.error = 'Please describe what happened.';
      render();
      return;
    }
    const client = createSupabaseClient();
    if (!isLiveSupabaseSession() || !client?.functions) {
      state.supportReport.error = `Sign in to send this report, or email ${CONFIG.supportEmail}.`;
      render();
      return;
    }
    state.supportReport.submitting = true;
    render();
    const context = {
      view: String(state.route?.section || state.route?.name || '').slice(0, 300),
      company: String(activeCompanyId() || '').slice(0, 300),
      userAgent: String(navigator.userAgent || '').slice(0, 300),
      viewport: `${window.innerWidth}x${window.innerHeight}`.slice(0, 300),
      path: String(`${window.location.pathname}${window.location.search}`).slice(0, 300),
    };
    const { data, error } = await client.functions.invoke('report-problem', {
      body: { type, description, context },
    });
    if (error || data?.ok !== true) {
      state.supportReport.submitting = false;
      state.supportReport.error = data?.error || error?.message || 'The report could not be sent. Please use the email option.';
      render();
      return;
    }
    state.supportReport = emptyReport();
    state.modal = '';
    render();
    showToast('Your report was sent to the Questbase team.', 'success', 'Support');
  }

  function fail(error) {
    state.supportReport.submitting = false;
    state.supportReport.error = error?.message || 'The report could not be sent. Please use the email option.';
    render();
  }

  return { open, renderSupportModal, submitSupportReport, fail };
}
