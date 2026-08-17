// The public form page, moved out of main.js and fetched on demand.
//
// It is behind a URL nobody signed in ever visits (/form/<id>), so every session that is NOT a
// member of the public filling in a form was carrying it for nothing. The bodies are unchanged
// from where they lived; only the surrounding factory is new.
//
// ctx rather than imports: these read `state`, render through main.js's `render`, and reuse the
// question renderer the forms BUILDER also uses -- which has to stay in the entry chunk because
// the builder is reachable from a signed-in session. Injecting keeps this module free of a
// static import back into main.js, which is what would put it back in the entry chunk.

export function createPublicFormPage(ctx) {
  const {
    collectFormAnswers, companyById, companyName, emptyState, formById, h, normalizeForm,
    questLogoImage, render, renderPreviewQuestion, state,
  } = ctx;

  function renderPublicFormPage(route) {
    const formId = route.token || '';
    const current = state.publicForm;
    const form = current?.formId === formId ? current.form : null;
    const company = current?.company || {};
    if (current?.formId === formId && current.submitted) {
      return `
        <main class="form-public-shell">
          <section class="form-public-card complete">
            <div class="client-portal-brand"><span class="side-mark logo-image-mark">${questLogoImage('Quest Form')}</span><span><strong>Quest Forms</strong><small>${h(company.name || 'Submission received')}</small></span></div>
            <h1>Thanks, we received it.</h1>
            <p>Your response was sent to the workspace team.</p>
          </section>
        </main>
      `;
    }
    if (!form) {
      return `
        <main class="form-public-shell">
          <section class="form-public-card ${current?.loading ? 'loading' : ''}">
            <div class="client-portal-brand"><span class="side-mark logo-image-mark">${questLogoImage('Quest Form')}</span><span><strong>Quest Forms</strong><small>Secure response</small></span></div>
            <h1>${current?.error ? 'Could not open form' : 'Opening form'}</h1>
            <p>${current?.error ? 'This form link is unavailable or no longer published.' : 'Checking this public form link.'}</p>
            ${current?.error ? `<div class="form-message error">${h(current.error)}</div>` : '<div class="client-portal-status">Opening...</div>'}
          </section>
        </main>
      `;
    }
    return `
      <main class="form-public-shell">
        <form class="form-public-card response-form" data-public-form-response data-form-id="${h(form.id)}" style="--form-accent:${h(form.theme_color || company.color || '#f45d22')}">
          <div class="client-portal-brand"><span class="side-mark logo-image-mark">${questLogoImage('Quest Form')}</span><span><strong>${h(company.name || 'Quest Forms')}</strong><small>${h(form.audience || 'Response')}</small></span></div>
          <div class="designed-form-header">
            <span>${h(company.name || 'Questbase')}</span>
            <h1>${h(form.title)}</h1>
            <p>${h(form.description || 'Complete this form and send it to the workspace team.')}</p>
          </div>
          <label class="form-honeypot" aria-hidden="true"><span>Website</span><input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
          ${form.collect_email ? `<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>` : ''}
          ${form.questions.map((question) => renderPreviewQuestion(question)).join('') || emptyState('This form has no questions yet.')}
          ${current?.error ? `<div class="form-message error">${h(current.error)}</div>` : ''}
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">${h(form.submit_label || 'Submit')}</button>
          </div>
        </form>
      </main>
    `;
  }

  async function ensurePublicFormOpen(formId) {
    if (!formId) throw new Error('Missing form link.');
    if (state.publicForm?.formId === formId && (state.publicForm.form || state.publicForm.error || state.publicForm.loading)) return state.publicForm;
    const openedAt = new Date().toISOString();
    const local = formById(formId);
    if (local && local.status === 'Published') {
      state.publicForm = { formId, form: local, company: companyById(local.company_id) || { name: companyName(local.company_id) }, openedAt };
      render();
      return state.publicForm;
    }
    state.publicForm = { formId, loading: true, openedAt };
    render();
    const response = await fetch('/api/public-form-open?form_id=' + encodeURIComponent(formId));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Could not open form.');
    state.publicForm = {
      formId,
      form: normalizeForm(payload.form || {}),
      company: payload.company || {},
      openedAt,
    };
    render();
    return state.publicForm;
  }

  async function submitPublicFormResponse(formEl) {
    const formId = formEl.dataset.formId || state.publicForm?.form?.id || '';
    const form = state.publicForm?.form?.id === formId ? state.publicForm.form : null;
    if (!form) throw new Error('Form is not loaded.');
    const data = new FormData(formEl);
    const answers = await collectFormAnswers(form, data, { publicUpload: true });
    const response = await fetch('/api/public-form-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_id: form.id,
        submitter_email: String(data.get('submitter_email') || ''),
        submitted_by: String(data.get('submitter_email') || 'Public respondent'),
        answers,
        website: String(data.get('website') || ''),
        started_at: state.publicForm.openedAt,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Could not submit this response.');
    state.publicForm = { ...state.publicForm, submitted: true, response: payload.response };
    render();
  }

  return { renderPublicFormPage, ensurePublicFormOpen, submitPublicFormResponse };
}
