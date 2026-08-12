// Proposal builder, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createProposalBuilderModal(ctx) {
  const {
    PROPOSAL_TEMPLATES, contactAddressOptions, currentProposalContext, emptyState, field, h,
    money, number, proposalById, proposalDraftForContext, proposalsFor, renderAddressLookupField,
    renderModalShell, renderProposalPreview, renderProposalScopeRows,
  } = ctx;

  function renderProposalBuilderModal(companyId) {
    const ctx = currentProposalContext();
    if (!ctx || ctx.company_id !== companyId) return renderModalShell('Job Center', 'Proposal', emptyState('Choose a contact, quote, or job before creating a proposal.'));
    const draft = proposalDraftForContext(ctx);
    const addressOptions = contactAddressOptions(companyId);
    const saved = proposalsFor(ctx.type, ctx.id);
    const activeProposal = ctx.proposalId ? proposalById(ctx.proposalId) : null;
    const savedPanel = saved.length ? `
      <section class="proposal-history">
        <div><strong>Saved proposals</strong><small>Reuse, edit, or export past versions.</small></div>
        ${saved.slice(0, 5).map((proposal) => `
          <button class="${proposal.id === ctx.proposalId ? 'active' : ''}" type="button" data-action="edit-proposal" data-proposal-id="${h(proposal.id)}">
            <span>${h(proposal.proposal_no || proposal.title)}</span>
            <em>${h(proposal.status)} - ${h(money(proposal.total))}</em>
          </button>
        `).join('')}
      </section>
    ` : '';
    return renderModalShell('Job Center', `${ctx.label} proposal`, `
      <form id="proposal-builder-form" class="proposal-builder" data-proposal-builder-form>
        <input type="hidden" name="proposal_id" value="${h(ctx.proposalId || '')}" />
        <input type="hidden" name="related_type" value="${h(ctx.type)}" />
        <input type="hidden" name="related_id" value="${h(ctx.id)}" />
        <section class="proposal-builder-rail">
          ${savedPanel}
          <label><span>Template</span><select data-proposal-template name="template_id">${PROPOSAL_TEMPLATES.map((template) => `<option value="${h(template.id)}" ${template.id === draft.templateId ? 'selected' : ''}>${h(template.name)}</option>`).join('')}</select></label>
          <label><span>Style</span><select data-proposal-field name="style"><option value="premium" ${draft.style !== 'simple' ? 'selected' : ''}>Premium</option><option value="simple" ${draft.style === 'simple' ? 'selected' : ''}>Simple</option></select></label>
          <label><span>Proposal #</span><input data-proposal-field name="proposal_no" value="${h(draft.proposalNo)}" /></label>
          <div class="proposal-two"><label><span>Issued</span><input data-proposal-field name="issued" type="date" value="${h(draft.issued)}" /></label><label><span>Valid through</span><input data-proposal-field name="valid" type="date" value="${h(draft.valid)}" /></label></div>
          <label><span>Client name</span><input data-proposal-field name="client_name" value="${h(draft.client.name)}" /></label>
          <label><span>Client email</span><input data-proposal-field name="client_email" value="${h(draft.client.email)}" /></label>
          <label><span>Client phone</span><input data-proposal-field name="client_phone" value="${h(draft.client.phone)}" /></label>
          ${renderAddressLookupField('Client address', 'client_address', draft.client.address, addressOptions, '', 'proposal-client-address-options', 'data-proposal-field')}
          <label><span>Job title</span><input data-proposal-field name="job_title" value="${h(draft.jobTitle)}" /></label>
          <label><span>Total</span><input data-proposal-field name="total" type="number" step="0.01" value="${h(String(draft.total || ''))}" /></label>
          <div class="proposal-two"><label><span>Monthly</span><input data-proposal-field name="monthly" value="${h(draft.monthly)}" /></label><label><span>Deposit %</span><input data-proposal-field name="deposit" type="number" step="1" value="${h(String(draft.deposit))}" /></label></div>
          <label><span>Includes row</span><input data-proposal-field name="includes" value="${h(draft.includes)}" /></label>
          <label><span>Warranty</span><input data-proposal-field name="warranty" value="${h(draft.warranty)}" /></label>
          <label><span>Manufacturer warranty</span><input data-proposal-field name="manufacturer_warranty" value="${h(draft.manufacturerWarranty)}" /></label>
          <label><span>Materials</span><textarea data-proposal-field name="materials">${h(draft.materials)}</textarea></label>
          <label><span>Terms</span><textarea data-proposal-field name="terms">${h(draft.terms)}</textarea></label>
          <section class="proposal-scope-editor"><div><strong>Scope lines</strong><small>Asterisk marks featured items.</small></div>${renderProposalScopeRows(draft.items)}</section>
        </section>
        <section class="proposal-builder-preview" data-proposal-preview>${renderProposalPreview(draft)}</section>
      </form>
    `, 'proposal-modal', `
      ${activeProposal ? `<button class="btn" type="button" data-action="export-proposal" data-proposal-id="${h(activeProposal.id)}"><i class="ti ti-download"></i>Export</button>` : ''}
      <button class="btn btn-primary" type="submit" form="proposal-builder-form"><i class="ti ti-file-text"></i>${activeProposal ? 'Update proposal' : 'Save proposal'}</button>
    `);
  }

  return { renderProposalBuilderModal };
}
