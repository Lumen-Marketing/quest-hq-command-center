// The Quotes board and table, fetched on first use: reaching them takes a click on Quotes,
// and nothing that paints before that click needs them.
//
// A factory, because every stage, permission and formatting helper belongs to main.js.

export function createDealBoard(ctx) {
  const {
    accountName, can, emptyState, filteredDeals, h, money, pipelineDot, pipelineStages,
    renderPipelineNextAction, resolvePipelineStage, state, sum, dealRow,
  } = ctx;

  function renderDealBoard(companyId) {
    const rows = filteredDeals(companyId, true);
    const filter = state.stageFilterDeals;
    const lanes = filter === 'all' ? pipelineStages('deals', companyId) : pipelineStages('deals', companyId).filter((stage) => stage.name === filter);
    return `
      <section class="pipe-board">
        ${lanes.map((stage) => {
          const cards = rows.filter((deal) => resolvePipelineStage('deals', deal.stage, companyId) === stage.name);
          return `
            <article class="pipe-lane" data-drop-stage="${h(stage.name)}" data-drag-kind="deal">
              <header class="pipe-lane-head">${pipelineDot(stage.color)}<span>${h(stage.name)}</span><b>${cards.length}</b></header>
              <div class="pipe-lane-sub">${money(sum(cards, 'value'))}</div>
              <div class="pipe-lane-body">
                ${cards.map((deal) => dealCard(deal)).join('') || '<div class="lane-empty">No quotes</div>'}
              </div>
            </article>`;
        }).join('')}
      </section>`;
  }

  function dealCard(deal) {
    // Deleting a quote used to exist only inside the edit dialog, so on the board -- where
    // people actually work -- there was no way to remove one. Contacts and jobs both offer it
    // from the record itself, which is why the tester found those and not this.
    const canDelete = can('crm.manage', deal.company_id);
    return `
      <article class="pipe-card ${deal.id === state.selectedDealId ? 'active' : ''}" draggable="true" data-drag-kind="deal" data-drag-id="${h(deal.id)}">
        <button class="pipe-card-main" type="button" data-action="open-deal" data-deal-id="${h(deal.id)}">
          <strong>${h(deal.name)}</strong>
          <span>${h(accountName(deal.account_id) || 'No account')}</span>
          <em>${money(deal.value)}${deal.probability ? ` · ${deal.probability}%` : ''}</em>
        </button>
        ${canDelete ? `<button class="pipe-card-delete" type="button" data-action="delete-deal" data-deal-id="${h(deal.id)}" title="Delete quote" aria-label="Delete ${h(deal.name)}"><i class="ti ti-trash" aria-hidden="true"></i></button>` : ''}
        ${renderPipelineNextAction('deal', deal)}
      </article>`;
  }

  function renderDealTable(companyId) {
    const rows = filteredDeals(companyId);
    return `
      <section class="panel">
        <div class="section-head"><div><h2>Quotes</h2><p>${rows.length} visible</p></div></div>
        <div class="data-table deals-table">
          <div class="table-head"><span>Quote</span><span>What's next</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
          ${rows.map((deal) => dealRow(deal, companyId)).join('') || emptyState('No quotes match this view.')}
        </div>
      </section>`;
  }

  return { renderDealBoard, renderDealTable };
}
