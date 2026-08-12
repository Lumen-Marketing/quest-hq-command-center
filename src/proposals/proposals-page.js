// Proposals, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createProposalsPage(ctx) {
  const {
    PROPOSAL_STATUS_OPTIONS, companyContacts, companyDeals, companyJobs, companyProposals, emptyState,
    filteredProposals, formatDate, h, metricCard, money, proposalById,
    proposalStatusBadge, renderProposalDetail, state, sum, workspaceHeader,
  } = ctx;

  function renderProposalsPage(route, companyId) {
    const proposalId = route.params.get('proposal_id') || state.selectedProposalId;
    const selected = proposalId ? proposalById(proposalId) : null;
    if (selected?.company_id === companyId) state.selectedProposalId = selected.id;
    else state.selectedProposalId = companyProposals(companyId)[0]?.id || '';
    const rows = filteredProposals(companyId);
    const active = proposalById(state.selectedProposalId);
    const accepted = companyProposals(companyId).filter((proposal) => proposal.status === 'Accepted');
    const open = companyProposals(companyId).filter((proposal) => !['Accepted', 'Declined'].includes(proposal.status));
    const fallbackDeal = companyDeals(companyId)[0];
    const fallbackContact = companyContacts(companyId)[0];
    const fallbackJob = companyJobs(companyId)[0];
    const newRelatedType = active?.related_type || (fallbackDeal ? 'deal' : fallbackContact ? 'contact' : fallbackJob ? 'job' : 'deal');
    const newRelatedId = active?.related_id || fallbackDeal?.id || fallbackContact?.id || fallbackJob?.id || '';
    return `
      ${workspaceHeader('Proposals', 'Saved customer proposals, approval links, and reusable quote documents.', `
        <button class="btn" type="button" data-action="duplicate-proposal" data-proposal-id="${h(active?.id || '')}" ${active ? '' : 'disabled'}><i class="ti ti-copy"></i>Reuse selected</button>
        <button class="btn btn-primary" type="button" data-action="open-proposal-builder" data-related-type="${h(newRelatedType)}" data-related-id="${h(newRelatedId)}"><i class="ti ti-plus"></i>New proposal</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${metricCard('Open proposals', open.length)}
        ${metricCard('Accepted', accepted.length)}
        ${metricCard('Open value', money(sum(open, 'total')))}
        ${metricCard('Accepted value', money(sum(accepted, 'total')))}
      </section>
      <section class="proposal-workspace">
        <aside class="proposal-list-panel panel">
          <div class="proposal-toolbar">
            <label class="crm-search"><i class="ti ti-search"></i><input data-proposal-search value="${h(state.proposalQuery)}" placeholder="Search proposals" /></label>
            <select data-proposal-status-filter>
              <option value="all" ${state.proposalStatusFilter === 'all' ? 'selected' : ''}>All statuses</option>
              ${PROPOSAL_STATUS_OPTIONS.map((status) => `<option value="${h(status)}" ${state.proposalStatusFilter === status ? 'selected' : ''}>${h(status)}</option>`).join('')}
            </select>
          </div>
          <div class="proposal-list">
            ${rows.map((proposal) => `
              <button class="proposal-row ${proposal.id === state.selectedProposalId ? 'active' : ''}" type="button" data-action="open-proposal" data-proposal-id="${h(proposal.id)}">
                <span><strong>${h(proposal.proposal_no || proposal.title)}</strong><em>${h(proposal.client.name || 'No client')} - ${h(formatDate(proposal.updated_at))}</em></span>
                <b>${h(money(proposal.total))}</b>
                ${proposalStatusBadge(proposal.status)}
              </button>
            `).join('') || emptyState('No proposals saved yet. Create one from a quote, contact, or job.')}
          </div>
        </aside>
        ${active ? renderProposalDetail(active) : `<section class="panel proposal-detail">${emptyState('Select a proposal to review, export, or send for approval.')}</section>`}
      </section>
    `;
  }

  return { renderProposalsPage };
}
