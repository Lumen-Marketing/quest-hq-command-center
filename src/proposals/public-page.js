// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createProposalPublicPage(ctx) {
  const {
    emptyState, formatDate, h, money, proposalDraftFromRecord, questLogoImage, renderProposalPreview, state,
  } = ctx;

  function renderProposalPublicPage(route) {
    const proposal = state.proposalPublic?.proposal;
    const error = state.proposalPublic?.error;
    const draft = proposal ? proposalDraftFromRecord(proposal) : null;
    return `
      <main class="proposal-public-shell">
        <section class="proposal-public-brand">
          <span class="side-mark logo-image-mark">${questLogoImage()}</span>
          <span><strong>Quest Roofing</strong><small>Customer proposal</small></span>
        </section>
        ${error ? `
          <section class="panel proposal-public-card">${emptyState(error)}</section>
        ` : !proposal ? `
          <section class="panel proposal-public-card">${emptyState('Opening proposal...')}</section>
        ` : `
          <section class="proposal-public-layout">
            <div class="proposal-public-preview">${renderProposalPreview(draft)}</div>
            <aside class="proposal-acceptance-panel panel">
              <span class="eyebrow">${h(proposal.status)}</span>
              <h1>${h(proposal.title)}</h1>
              <p>${h(proposal.client.name || 'Customer')} - ${h(money(proposal.total))}</p>
              ${proposal.status === 'Accepted' ? `<div class="form-message success">Accepted by ${h(proposal.accepted_by || 'customer')} on ${h(formatDate(proposal.accepted_at))}.</div>` : ''}
              ${proposal.status === 'Declined' ? `<div class="form-message error">This proposal was declined on ${h(formatDate(proposal.declined_at))}.</div>` : ''}
              ${['Accepted', 'Declined'].includes(proposal.status) ? `
                <button class="btn full" type="button" data-action="export-public-proposal"><i class="ti ti-download"></i>Download PDF</button>
              ` : `
                <form class="proposal-public-form" data-proposal-public-form>
                  <input type="hidden" name="token" value="${h(route.token || '')}" />
                  <label><span>Your name</span><input name="signer_name" required autocomplete="name" /></label>
                  <label><span>Email</span><input name="signer_email" type="email" value="${h(proposal.client.email || '')}" autocomplete="email" /></label>
                  <button class="btn btn-primary full" type="submit" name="decision" value="accept"><i class="ti ti-signature"></i>Approve proposal</button>
                  <button class="btn full" type="submit" name="decision" value="decline">Decline</button>
                </form>
              `}
            </aside>
          </section>
        `}
      </main>
    `;
  }

  return { renderProposalPublicPage };
}
