// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

import { calculateUnderwriting } from '../underwriting/calculator.js';

export function createUnderwriterPage(ctx) {
  const {
    activeWorkspaceId, appHref, companyContacts, companyPath, emptyState, h, metricCard, money, pipelineDot, protectedFormDraftAttributes, renderProtectedFormDraftStrip, renderUnderwritingResults, sum, svgIcon, underwriterStageByKey, underwriterStageForContact, underwritingCaseForContact, underwritingDraftForContact, underwritingNumberField, state, CRM2_UNDERWRITER_STAGES,
  } = ctx;

  function renderUnderwriterPage(route, companyId) {
    const requestedStageAliases = { prospect: 'prospects', lead: 'leads', nurturing: 'followup' };
    const requestedStageRaw = route.params.get('stage') || 'all';
    const requestedStage = requestedStageAliases[requestedStageRaw] || requestedStageRaw;
    const stageKeys = new Set(CRM2_UNDERWRITER_STAGES.map((stage) => stage.key));
    const activeStage = stageKeys.has(requestedStage) ? requestedStage : 'all';
    const contacts = companyContacts(companyId)
      .map((contact) => ({ ...contact, underwriter_stage: underwriterStageForContact(contact) }))
      .sort((a, b) => CRM2_UNDERWRITER_STAGES.findIndex((stage) => stage.key === a.underwriter_stage.key) - CRM2_UNDERWRITER_STAGES.findIndex((stage) => stage.key === b.underwriter_stage.key));
    const visible = activeStage === 'all' ? contacts : contacts.filter((contact) => contact.underwriter_stage.key === activeStage);
    const underwriting = contacts.filter((contact) => contact.underwriter_stage.key === 'underwriting');
    const estimates = contacts.filter((contact) => ['estimate', 'negotiating'].includes(contact.underwriter_stage.key));
    const requestedContactId = route.params.get('contact_id') || state.underwritingContactId;
    const selectedContact = contacts.find((contact) => contact.id === requestedContactId) || underwriting[0] || contacts[0] || null;
    state.underwritingContactId = selectedContact?.id || '';
    const draft = underwritingDraftForContact(selectedContact, companyId);
    const calculation = calculateUnderwriting(draft || {});
    return `
      <section class="tool-page underwriter-page underwriter-ledger">
        <section class="metric-grid underwriter-summary">
          ${metricCard('Underwriting', underwriting.length)}
          ${metricCard('Estimate queue', estimates.length)}
          ${metricCard('Pipeline value', money(sum(visible, 'value')))}
          ${metricCard('Quest CRM stage', activeStage === 'all' ? 'All' : underwriterStageByKey(activeStage).name)}
        </section>
        <section class="pipe-toolbar">
          <div class="pipe-chips" role="group" aria-label="Quest CRM underwriter stage">
            <a class="pipe-chip ${activeStage === 'all' ? 'on' : ''}" href="${appHref(companyPath('underwriter', {}, companyId))}" data-router>All<b>${h(String(contacts.length))}</b></a>
            ${CRM2_UNDERWRITER_STAGES.map((stage) => {
              const count = contacts.filter((contact) => contact.underwriter_stage.key === stage.key).length;
              return `<a class="pipe-chip ${activeStage === stage.key ? 'on' : ''}" href="${appHref(companyPath('underwriter', { stage: stage.key }, companyId))}" data-router>${pipelineDot(stage.color)}${h(stage.name)}<b>${h(String(count))}</b></a>`;
            }).join('')}
          </div>
        </section>
        <section class="panel underwriting-calculator underwriter-workbench">
          <div class="section-head">
            <div><h2>Underwriting calculator</h2><p>Price the scope, protect the margin, and save one current case per contact.</p></div>
            ${selectedContact && underwritingCaseForContact(selectedContact.id, companyId) ? '<span class="underwriting-saved"><i class="ti ti-check"></i>Saved case</span>' : ''}
          </div>
          ${selectedContact ? `
            <form id="underwriting-form" data-underwriting-form>
              ${renderProtectedFormDraftStrip(protectedFormDraftAttributes('underwriter', selectedContact.id, companyId, selectedContact.workspace_id || activeWorkspaceId()))}
              <div class="underwriting-form-side">
                <label class="underwriting-field span-2"><span>Contact</span><select name="contact_id" data-underwriting-contact data-draft-ignore>
                  ${contacts.map((contact) => `<option value="${h(contact.id)}" ${contact.id === selectedContact.id ? 'selected' : ''}>${h(contact.name)} - ${h(contact.pay_type || 'Retail')}</option>`).join('')}
                </select></label>
                ${underwritingNumberField('Contract price', 'contractPrice', draft.contractPrice)}
                ${underwritingNumberField('Target margin', 'targetMarginPercent', draft.targetMarginPercent, '%')}
                ${underwritingNumberField('Material', 'materialCost', draft.materialCost)}
                ${underwritingNumberField('Labor', 'laborCost', draft.laborCost)}
                ${underwritingNumberField('Permits and fees', 'permitCost', draft.permitCost)}
                ${underwritingNumberField('Disposal', 'disposalCost', draft.disposalCost)}
                ${underwritingNumberField('Other direct cost', 'otherCost', draft.otherCost)}
                ${underwritingNumberField('Overhead', 'overheadPercent', draft.overheadPercent, '%')}
                ${underwritingNumberField('Commission', 'commissionPercent', draft.commissionPercent, '%')}
                ${underwritingNumberField('Contingency', 'contingencyPercent', draft.contingencyPercent, '%')}
                <label class="underwriting-field span-2"><span>Decision notes</span><textarea name="notes" rows="1" data-underwriting-field placeholder="Scope risks, exclusions, or pricing decision">${h(draft.notes || '')}</textarea></label>
                <div class="form-actions span-2">
                  <span class="form-note">Percent costs are calculated from contract price.</span>
                </div>
              </div>
              <aside class="underwriting-results">
                <div class="underwriting-results-head">
                  <span class="underwriting-results-icon">${svgIcon('q-symbol-crm')}</span>
                  <div><h3>Decision summary</h3><p>Review profitability outcomes before saving your decision.</p></div>
                </div>
                <div data-underwriting-results aria-live="polite">${renderUnderwritingResults(calculation)}</div>
              </aside>
            </form>
          ` : emptyState('Add a contact to start an underwriting case.')}
        </section>
        <section class="panel underwriter-ledger-queue">
          <div class="section-head"><div><h2>Estimate queue</h2><p>${visible.length} contact${visible.length === 1 ? '' : 's'} in this Quest CRM view.</p></div></div>
          <div class="data-table underwriter-table">
            <div class="table-head"><span>Contact</span><span>Stage</span><span>Owner</span><span>Pay type</span><span>Value</span></div>
            ${visible.map(renderUnderwriterQueueRow).join('') || emptyState('No contacts match this underwriter stage.')}
          </div>
        </section>
      </section>
    `;
  }

  return { renderUnderwriterPage };
}
