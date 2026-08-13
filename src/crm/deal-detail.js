// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

import { createTakeoffCard } from '../underwriting/takeoff-card.js';

export function createDealDetail(ctx) {
  const {
    accountById, activeWorkspaceId, activitiesFor, appHref, companyPath, contactById, filteredActivitiesFor, googleMapsPlaceSearchUrl, guidanceForStage, h, jobById, money, pipelineStages, renderActivityFilterBar, renderDealLineItems, renderSfTaskRow, resolvePipelineStage, sfFeedItem, tasksForDeal, state, EMPTY_FIELD_PLACEHOLDER, dealById, persistDeal, showToast,
  } = ctx;

  // The same calculator as the Underwriter page, attached to this quote. Pricing a roof is a
  // quote's own work -- the measurements are this address's, not the contact's, because one
  // customer can have a quote per trade -- so they are stored on the deal and saved from here.
  const takeoff = createTakeoffCard({
    ...ctx,
    takeoffPermission: 'crm.manage',
    saveRecordLabel: 'Save to this quote',
    saveTakeoffToRecord: async (scope, payload, totals) => {
      const deal = dealById(String(scope).replace('deal:', ''));
      if (!deal) return;
      // A takeoff that prices nothing must not wipe a value somebody typed by hand.
      const setsValue = totals.contractPrice > 0;
      await persistDeal(
        { ...deal, takeoff: payload, value: setsValue ? totals.contractPrice : deal.value },
        setsValue ? `Takeoff saved. Quote value set to ${money(totals.contractPrice)}.` : 'Takeoff saved.',
      );
    },
  });

  function renderDealDetail(companyId, deal) {
    const account = accountById(deal.account_id);
    const contact = contactById(deal.primary_contact_id);
    const job = deal.job_id ? jobById(deal.job_id) : null;
    const quoteAddress = job?.site_address || account?.address || contact?.location || '';
    const stages = pipelineStages('deals', companyId);
    const currentStage = resolvePipelineStage('deals', deal.stage, companyId);
    const ci = stages.findIndex((s) => s.name === currentStage);
    const g = guidanceForStage(currentStage);
    const activeTab = state.dealActivityTab || 'Email';
    const totalFeed = activitiesFor('deal', deal.id);
    const feed = filteredActivitiesFor('deal', deal.id);
    const tasks = tasksForDeal(deal);
    const ed = (key, opts = {}) => {
      const isEmpty = deal[key] === '' || deal[key] == null;
      const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : '', isEmpty ? 'sf-empty' : ''].filter(Boolean).join(' ');
      const inner = isEmpty ? EMPTY_FIELD_PLACEHOLDER : h(String(deal[key]));
      return `<span class="${cls}" data-deal-edit="${h(key)}" data-deal-id="${h(deal.id)}" title="Click to edit">${inner}</span>`;
    };
    const fieldRow = (label, content, editKey = '') => `
      <div class="sf-field">
        <div class="sf-field-label">
          ${h(label)}
          ${editKey
            ? `<button class="sf-pencil" type="button" data-deal-edit="${h(editKey)}" data-deal-id="${h(deal.id)}" aria-label="Edit ${h(label)}"><i class="ti ti-pencil"></i></button>`
            : `<button class="sf-pencil" type="button" data-action="open-deal-form" data-mode="edit" data-deal-id="${h(deal.id)}" aria-label="Edit ${h(label)}"><i class="ti ti-pencil"></i></button>`}
        </div>
        <div class="sf-field-value">${content}</div>
      </div>
    `;
    const headerActions = [['Follow', 'ti-plus'], ['New Task', 'ti-checkbox'], ['Log a Call', 'ti-phone'], ['New Estimate', 'ti-calculator'], ['Edit', 'ti-pencil']];
    const quickTiles = [['Task', 'ti-checkbox'], ['Meeting', 'ti-calendar'], ['Estimate', 'ti-calculator'], ['Proposal', 'ti-file-text'], ['Note', 'ti-note'], ['Call Log', 'ti-phone']];
    const activityTabs = [['Email', 'ti-mail'], ['New Task', 'ti-checkbox'], ['New Event', 'ti-calendar'], ['Log a Call', 'ti-phone']];
    return `
      <div class="sf-record">
        <div class="sf-object-tabs">
          <a class="sf-object-tab" href="${appHref(companyPath('dashboard', {}, companyId))}" data-router>Dashboard</a>
          <a class="sf-object-tab" href="${appHref(companyPath('deals', {}, companyId))}" data-router>All Quotes <span class="sf-tab-kind">| Quotes</span></a>
          <span class="sf-object-tab on">${h(deal.name)} <span class="sf-tab-kind">| Quote</span></span>
        </div>

        <div class="sf-record-head">
          <span class="sf-record-icon"><i class="ti ti-briefcase"></i></span>
          <div><div class="sf-record-label">Quote</div><div class="sf-record-name">${h(deal.name)}</div></div>
          <div class="sf-actions">
            <button class="sf-btn" type="button" data-action="open-record-history" data-record-type="deal" data-record-id="${h(deal.id)}" data-record-label="${h(deal.name)}" data-company-id="${h(deal.company_id || companyId)}" data-workspace-id="${h(deal.workspace_id || activeWorkspaceId())}"><i class="ti ti-history"></i>History</button>
            ${headerActions.map(([label, ico]) => label === 'Edit'
              ? `<button class="sf-btn" type="button" data-action="open-deal-form" data-mode="edit" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i>${label}</button>`
              : `<button class="sf-btn" type="button" data-action="deal-quick" data-kind="${h(label)}" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}
          </div>
        </div>

        <div class="sf-path-wrap">
          <div class="sf-path-row">
            <div class="sf-stage-track">
              ${stages.map((s, i) => {
                const cls = i < ci ? 'done' : i === ci ? 'current' : 'future';
                return `<button class="sf-stage ${cls}" type="button" data-action="set-deal-stage" data-deal-id="${h(deal.id)}" data-stage="${h(s.name)}" title="Move to ${h(s.name)}">${i < ci ? '<i class="ti ti-check"></i>' : h(s.name)}</button>`;
              }).join('')}
            </div>
            <button class="sf-mark-btn" type="button" data-action="deal-mark-next" data-deal-id="${h(deal.id)}">Mark as Current Stage</button>
          </div>
          <div class="sf-guidance">
            <div class="sf-guidance-label">Guidance for Success</div>
            <div class="sf-guidance-title">${h(g.t)}</div>
            <div class="sf-guidance-lines">${g.b.map((x) => `<div><span class="sf-guidance-bullet">•</span> ${h(x)}</div>`).join('')}</div>
          </div>
        </div>

        <div class="sf-three-col">
          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>About</div><div class="sf-card-body">
              ${fieldRow('Phone', contact?.phone ? h(contact.phone) : '<span class="muted-dash">—</span>')}
              ${fieldRow('Email', contact?.email ? `<span class="sf-edit blue">${h(contact.email)}</span>` : '<span class="muted-dash">—</span>')}
              ${fieldRow('Location', quoteAddress ? `${h(quoteAddress)}<a class="sf-field-action" href="${h(googleMapsPlaceSearchUrl(quoteAddress))}" target="_blank" rel="noreferrer"><i class="ti ti-map-pin"></i>Map pin</a>` : '<span class="muted-dash">—</span>')}
              ${fieldRow('Job Type', `<span class="sf-pill">${h(deal.source || 'Re-roof')}</span>`)}
              ${fieldRow('Owner', ed('owner_name', { blue: true }), 'owner_name')}
              ${fieldRow('Account', account ? `<button class="link-button" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(account.name)}</button>` : '<span class="muted-dash">—</span>')}
            </div></div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
              ${fieldRow('Funnel', '<span>Quotes (bottom of funnel)</span>')}
              ${fieldRow('Stage', `<span>${h(deal.stage)}</span>`, 'stage')}
              ${fieldRow('Est. Value', `<span class="sf-money"><span class="sf-edit mono" data-deal-edit="value" data-deal-id="${h(deal.id)}" title="Click to edit">${money(deal.value || 0)}</span></span>`, 'value')}
              ${fieldRow('Probability', `<span class="sf-edit mono" data-deal-edit="probability" data-deal-id="${h(deal.id)}" title="Click to edit">${h(String(deal.probability || 0))}</span>%`, 'probability')}
              ${fieldRow('Pay Type', `<span>${h(deal.status === 'won' ? 'Won' : 'Retail')}</span>`)}
              ${fieldRow('Linked Job', job ? `<a class="link-button" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>${h(job.name)}</a>` : '<span class="muted-dash">—</span>')}
            </div></div>
          </div>

          <div class="sf-col">
            ${renderDealLineItems(deal, companyId)}
            <div class="sf-card">
              <div class="sf-activity-tabs">${activityTabs.map(([label, ico]) => `<button class="sf-activity-tab ${activeTab === label ? 'active' : ''}" type="button" data-action="open-docked-activity" data-related-type="deal" data-related-id="${h(deal.id)}" data-kind="${h(label)}" data-tab="${h(label)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}</div>
              <form class="sf-note-box" data-deal-note-form autocomplete="off">
                <input type="hidden" name="deal_id" value="${h(deal.id)}" />
                <input name="body" placeholder="Write a note or @mention..." />
                <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
              </form>
              ${renderActivityFilterBar(totalFeed.length, feed.length)}
              <div class="sf-feed">
                ${feed.length ? feed.map((a) => sfFeedItem(a)).join('') : `<div class="sf-feed-empty">${totalFeed.length ? 'No activity matches this filter.' : 'No activity yet. Log a note, call, or meeting.'}</div>`}
              </div>
            </div>
          </div>

          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
              <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => `<button class="sf-quick-tile" type="button" data-action="deal-quick" data-kind="${h(label)}" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i><span>${label}</span></button>`).join('')}</div>
              <button class="sf-convert-btn" type="button" data-action="convert-deal" data-deal-id="${h(deal.id)}"><i class="ti ti-arrow-right"></i>Convert to Job</button>
            </div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
              <div class="sf-tasks">
                ${tasks.map((t) => renderSfTaskRow(t)).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
              </div>
            </div>
          </div>
        </div>

        ${takeoff.renderTakeoffCard(companyId, deal.takeoff, { scope: `deal:${deal.id}` })}
      </div>
    `;
  }

  return { renderDealDetail };
}
