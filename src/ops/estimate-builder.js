// The estimate builder dialog, fetched on first use. It opens from a button and nothing that
// paints before that click needs any of it.
//
// estimateMetricGrid comes out with it: the modal is its only caller, and the live totals
// preview that also uses it cannot run until the dialog is already open.
//
// A factory, because the draft store and the money formatting belong to main.js.

export function createEstimateBuilder(ctx) {
  const {
    calculateEstimateTotals, currentEstimateContext, emptyState,
    estimateDraftForContext, h, metricCard, money, renderModalShell,
    ESTIMATE_TAX_RATE, ROOF_ESTIMATE_SYSTEMS, ROOF_ESTIMATE_SYSTEM_ORDER,
  } = ctx;

  function estimateMetricGrid(draft, totals) {
    return `
      <div class="estimate-metrics">
        ${metricCard('Quote', money(draft.quote || 0))}
        ${metricCard('Hard cost', money(totals.hardCost))}
        ${metricCard('Net profit', money(totals.netProfit))}
        ${metricCard('Net margin', `${totals.netMargin.toFixed(1)}%`)}
        ${metricCard('Target quote', money(totals.targetQuote))}
        ${metricCard('Payment split', `${money(totals.deposit)} / ${money(totals.materialDrop)} / ${money(totals.completion)}`)}
      </div>
    `;
  }

  function renderEstimateLineRows(kind, lines) {
    return `
      <div class="estimate-line-list">
        ${lines.map((item, index) => `
          <div class="estimate-line-row">
            <input data-estimate-field name="${kind}_name" value="${h(item.name)}" aria-label="${h(kind)} item ${index + 1} name" />
            <input data-estimate-field name="${kind}_quantity" value="${h(String(item.quantity || 0))}" type="number" step="0.01" aria-label="${h(kind)} item ${index + 1} quantity" />
            <input data-estimate-field name="${kind}_unit_price" value="${h(String(item.unitPrice || 0))}" type="number" step="0.01" aria-label="${h(kind)} item ${index + 1} unit price" />
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderEstimateBuilderModal(companyId) {
    const ctx = currentEstimateContext();
    if (!ctx || ctx.company_id !== companyId) return renderModalShell('Questbase', 'Estimate', emptyState('Choose a contact, quote, or job before creating an estimate.'));
    const draft = estimateDraftForContext(ctx);
    const totals = calculateEstimateTotals(draft);
    return renderModalShell('Questbase', `${ctx.label} estimate`, `
      <form class="estimate-builder" data-estimate-builder-form>
        <input type="hidden" name="related_type" value="${h(ctx.type)}" />
        <input type="hidden" name="related_id" value="${h(ctx.id)}" />
        <section class="estimate-hero span-2">
          <div>
            <span>${h(ctx.label)}</span>
            <h3>${h(ctx.title)}</h3>
            <p>${h(ctx.subtitle)}</p>
          </div>
          <div class="estimate-current">
            <span>Current saved value</span>
            <strong>${h(money(ctx.currentTotal || 0))}</strong>
          </div>
        </section>
        <label>
          <span>Estimate name</span>
          <input data-estimate-field name="name" value="${h(draft.name)}" />
        </label>
        <label>
          <span>Roof system</span>
          <select data-estimate-system name="primary">
            ${ROOF_ESTIMATE_SYSTEM_ORDER.map((key) => `<option value="${h(key)}" ${draft.primary === key ? 'selected' : ''}>${h(ROOF_ESTIMATE_SYSTEMS[key].label)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Project type</span>
          <select data-estimate-field name="project_type">
            <option value="rr" selected>R&R</option>
            <option value="new">New construction</option>
          </select>
        </label>
        <label>
          <span>Squares</span>
          <input data-estimate-field name="squares" value="${h(String(draft.squares))}" type="number" step="0.1" />
        </label>
        <label>
          <span>Commission %</span>
          <input data-estimate-field name="commission_rate" value="${h(String(draft.commissionRate))}" type="number" step="0.1" />
        </label>
        <label>
          <span>Target margin %</span>
          <input data-estimate-field name="target_margin" value="${h(String(draft.targetMargin))}" type="number" step="0.1" />
        </label>
        <label class="span-2">
          <span>Customer quote</span>
          <input data-estimate-field name="quote" value="${h(String(draft.quote || ''))}" type="number" step="0.01" placeholder="Enter the sell price or use the target quote" />
        </label>
        <section class="estimate-preview span-2" data-estimate-preview>
          ${estimateMetricGrid(draft, totals)}
        </section>
        <section class="estimate-lines span-2">
          <div class="estimate-lines-head">
            <div><h3>Labor</h3><p>Quantity x unit price</p></div>
            <div class="estimate-line-labels"><span>Item</span><span>Qty</span><span>Unit</span></div>
          </div>
          ${renderEstimateLineRows('labor', draft.labor)}
        </section>
        <section class="estimate-lines span-2">
          <div class="estimate-lines-head">
            <div><h3>Materials</h3><p>Material subtotal includes ${Math.round(ESTIMATE_TAX_RATE * 1000) / 10}% tax.</p></div>
            <div class="estimate-line-labels"><span>Item</span><span>Qty</span><span>Unit</span></div>
          </div>
          ${renderEstimateLineRows('material', draft.materials)}
        </section>
        <label class="span-2">
          <span>Internal notes</span>
          <textarea name="notes" data-estimate-field placeholder="Scope notes, exclusions, insurance details, or proposal reminders."></textarea>
        </label>
        <div class="form-actions span-2">
          <button class="btn btn-primary" type="submit"><i class="ti ti-device-floppy"></i>Save estimate to ${h(ctx.label.toLowerCase())}</button>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `, 'estimate-modal');
  }

  return { renderEstimateBuilderModal, estimateMetricGrid };
}
