// New form dialog, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createNewFormModal(ctx) {
  const {
    FORM_TYPES, companyColor, companyJobs, formTemplates, h, renderModalShell,
    renderStarterQuestionCard, state,
  } = ctx;

  function renderNewFormModal(companyId) {
    const startTab = state.formStartTab === 'templates' ? 'templates' : 'blank';
    const templates = formTemplates();
    const selectedTemplate = startTab === 'templates'
      ? templates.find((item) => item.id === state.formStartTemplateId) || templates[0] || null
      : null;
    const title = selectedTemplate?.title || '';
    const description = selectedTemplate?.description || '';
    const type = selectedTemplate?.type || 'Internal';
    const starterQuestions = selectedTemplate?.questions || [{ type: 'short', label: 'First question', required: false, options: [] }];
    return renderModalShell('Forms', 'New form builder', `
      <form class="new-form-modal builder-create-modal" data-new-form-form>
        <input type="hidden" name="template_id" value="${h(selectedTemplate?.id || '')}" />
        <div class="form-start-tabs" role="tablist" aria-label="New form start type">
          <button class="${startTab === 'blank' ? 'active' : ''}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
          <button class="${startTab === 'templates' ? 'active' : ''}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
        </div>
        ${startTab === 'templates' ? `
          <div class="new-form-template-grid">
            ${templates.map((template) => `
              <button class="${selectedTemplate?.id === template.id ? 'active' : ''}" type="button" data-action="select-form-start-template" data-template-id="${h(template.id)}">
                <span><i class="ti ti-template"></i></span>
                <strong>${h(template.title)}</strong>
                <small>${h(template.type)} / ${template.questions.length} questions</small>
              </button>
            `).join('')}
          </div>
        ` : `
          <div class="new-form-start">
            <span><i class="ti ti-clipboard-plus"></i></span>
            <div>
              <strong>Blank form</strong>
              <small>Start with a title card and one short-answer question.</small>
            </div>
          </div>
        `}
        <div class="new-form-builder-grid">
          <section class="new-form-builder-main">
            <article class="panel gform-title-card new-form-title-card">
              <div class="gform-accent-strip" style="--form-accent:${h(companyColor(companyId))}"></div>
              <label><span>Form title</span><input name="title" value="${h(title)}" placeholder="Untitled form" required /></label>
              <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${h(description)}</textarea></label>
            </article>
            <div class="new-form-question-list">
              ${starterQuestions.map((question, index) => renderStarterQuestionCard(question, index)).join('')}
            </div>
          </section>
          <aside class="panel new-form-settings-card">
            <div class="section-head"><div><h2>Setup</h2><p>${selectedTemplate ? h(selectedTemplate.title) : 'Blank starter'}</p></div></div>
            <div class="new-form-grid">
              <label><span>Type</span><select name="type">${FORM_TYPES.map((item) => `<option value="${h(item)}" ${item === type ? 'selected' : ''}>${h(item)}</option>`).join('')}</select></label>
              <label><span>Audience</span><input name="audience" value="Internal" /></label>
              <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${companyJobs(companyId).map((job) => `<option value="${h(job.id)}" ${state.route?.jobId === job.id ? 'selected' : ''}>${h(job.name)}</option>`).join('')}</select></label>
              <label><span>Submit button</span><input name="submit_label" value="Submit" /></label>
            </div>
            <div class="new-form-checks">
              <label class="check-row"><input type="checkbox" name="collect_email" checked /> Collect email</label>
              <label class="check-row"><input type="checkbox" name="require_approval" /> Require approval</label>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit">Create form</button>
              <button class="btn" type="button" data-action="close-modal">Cancel</button>
            </div>
          </aside>
        </div>
      </form>
    `, 'form-create-modal builder-modal');
  }

  return { renderNewFormModal };
}
