export function createJobEditor(ctx) {
  const {
    h, blankJob, contactAddressOptions, protectedFormDraftAttributes, activeWorkspaceId,
    renderProtectedFormDraftStrip, field, selectField, allowedCompanies, companyLabel,
    renderSearchCombobox, contactOwnerOptions, resolveJobStage, jobStageNames,
    renderAddressLookupField, textareaField, formatCurrencyDraft,
  } = ctx;

  const ownerField = (value, companyId) => renderSearchCombobox(
    'Account owner',
    'owner_name',
    value,
    contactOwnerOptions(companyId, value).slice(1).map(([owner]) => owner),
    { placeholder: 'Search account owners', allowCustom: false },
  );
  const currencyField = (label, name, value) => `<label><span>${h(label)}</span><input name="${h(name)}" type="text" value="${h(formatCurrencyDraft(value))}" inputmode="decimal" autocomplete="off" data-currency-input /></label>`;

  function renderJobEditor(companyId, job) {
    const edit = job || blankJob(companyId);
    const addressOptions = contactAddressOptions(companyId);
    return `
      <form class="job-editor" data-job-form ${protectedFormDraftAttributes('job', edit.id || 'new', companyId, edit.workspace_id || activeWorkspaceId())}>
        <input type="hidden" name="id" value="${h(edit.id || '')}" />
        <div class="section-head span-2">
          <div><h2>${job ? 'Edit job' : 'Create job'}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
        </div>
        ${renderProtectedFormDraftStrip()}
        ${field('Workspace name', 'name', edit.name, true)}
        ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
        ${field('Client', 'client_name', edit.client_name)}
        ${field('Contact', 'contact_name', edit.contact_name)}
        ${ownerField(edit.owner_name, companyId)}
        ${field('Job type', 'job_type', edit.job_type || 'Roofing')}
        ${selectField('Stage', 'stage', resolveJobStage(edit.stage), jobStageNames().map((stage) => [stage, stage]))}
        ${selectField('Client urgency', 'priority', edit.priority || 'Medium', ['Low', 'Medium', 'High', 'Urgent'].map((item) => [item, item]))}
        ${currencyField('Estimate total', 'estimate_total', edit.estimate_total || 0)}
        ${currencyField('Invoice total', 'invoice_total', edit.invoice_total || 0)}
        ${renderAddressLookupField('Site address', 'site_address', edit.site_address, addressOptions, 'span-2', 'job-site-address-options')}
        ${textareaField('Scope', 'scope', edit.scope, 'span-2')}
        ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
        <div class="form-actions span-2">
          <button class="btn btn-primary" type="submit">Save job</button>
          ${job ? `<button class="btn danger" type="button" data-action="delete-job" data-job-id="${h(job.id)}">Delete</button>` : ''}
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `;
  }

  return { renderJobEditor };
}
