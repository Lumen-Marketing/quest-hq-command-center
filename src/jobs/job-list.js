// All Jobs, in the v1 structure: a trade spine, the client, the stage, how many days it has
// been worked, and how the last four of those days went.
//
// Fetched on demand -- Jobs opens on the dashboard, so this is behind a click.
//
// The point of the row is that it answers "is this job moving" without opening it. The
// streak is the only column that does; everything else is context for it.

import { dailyStreak, daysWorked, missedDaily, tradeColor } from './production-model.js';

export function createJobList(ctx) {
  const {
    h, can, money, emptyState, appHref, companyPath,
    pipelineDot, pipelineStageColor, resolvePipelineStage,
    filteredJobs, selectedJobRows, productionFor, state, todayIso,
    contactById, accountById, companyContacts, companyAccounts,
  } = ctx;

  const RATING_LABEL = { good: 'Good', ok: 'OK', rough: 'Rough' };

  function streakDots(dailies) {
    const streak = dailyStreak(dailies, 4);
    if (!streak.length) return '<span class="jl-dots jl-dots-none">—</span>';
    return `<span class="jl-dots" title="Last ${streak.length} worked days">${streak
      .map((r) => `<i class="jf-dot jf-dot-${h(r)}" title="${h(RATING_LABEL[r])}"></i>`).join('')}</span>`;
  }

  /** Jobs that were reporting and then stopped. The band at the top exists for these. */
  function needsYouFirst(rows) {
    const today = todayIso();
    return rows.filter((job) => missedDaily(productionFor(job.id).dailies, today));
  }

  function renderJobList(companyId) {
    const all = filteredJobs(companyId);
    const trade = String(state.jobTradeFilter || 'all');
    const rows = trade === 'all' ? all : all.filter((job) => (job.job_type || 'Unassigned') === trade);
    const trades = [...new Set(all.map((job) => job.job_type || 'Unassigned'))].sort();
    const selected = new Set(selectedJobRows(companyId).map((job) => job.id));
    const allSelected = rows.length > 0 && rows.every((job) => selected.has(job.id));
    const canManage = can('jobs.manage', companyId);
    const showCrm = can('crm.view', companyId);
    const flagged = needsYouFirst(rows);
    const contacts = companyContacts(companyId);
    const accounts = companyAccounts(companyId);

    const jobHref = (job) => appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));
    const clientCell = (job) => {
      const names = [job.contact_name, job.client_name].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
      const contact = contactById(job.contact_id)
        || contacts.find((item) => names.includes(String(item.name || '').trim().toLowerCase()));
      if (showCrm && contact?.company_id === companyId) {
        return `<a class="jl-data-link" href="${appHref(companyPath('contacts', { contact_id: contact.id }, companyId))}" data-router>${h(job.client_name || contact.name)}</a>`;
      }
      const account = accountById(job.account_id)
        || accounts.find((item) => String(item.name || '').trim().toLowerCase() === String(job.client_name || '').trim().toLowerCase());
      if (showCrm && account?.company_id === companyId) {
        return `<button class="jl-data-link" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(job.client_name || account.name)}</button>`;
      }
      return showCrm && job.client_name
        ? `<a class="jl-data-link" href="${appHref(companyPath('contacts', { q: job.client_name }, companyId))}" data-router>${h(job.client_name)}</a>`
        : h(job.client_name || '—');
    };

    return `
      <section class="jl">
        <header class="jl-head">
          <div>
            <p class="jf-eyebrow">Production</p>
            <h1>${trade === 'all' ? 'All jobs' : h(trade)} <span class="jl-count">${rows.length}</span></h1>
          </div>
          <div class="jl-head-actions">
            ${selected.size ? `
              <span class="jl-selected">${selected.size} selected</span>
              <button class="btn btn-compact" type="button" data-action="jobs-clear-selection">Clear</button>
              ${canManage ? `<button class="btn btn-compact danger" type="button" data-action="jobs-bulk-delete">Delete ${selected.size}</button>` : ''}
            ` : ''}
            ${canManage ? '<button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new">Add job</button>' : ''}
          </div>
        </header>

        <div class="jl-filters">
          <button class="jl-chip ${trade === 'all' ? 'on' : ''}" type="button" data-action="jobs-trade-filter" data-trade="all">All trades <span>${all.length}</span></button>
          ${trades.map((t) => `
            <button class="jl-chip ${trade === t ? 'on' : ''}" type="button" data-action="jobs-trade-filter" data-trade="${h(t)}">
              <i style="background:${h(tradeColor(t))}"></i>${h(t)} <span>${all.filter((job) => (job.job_type || 'Unassigned') === t).length}</span>
            </button>`).join('')}
        </div>

        ${flagged.length ? `
          <div class="jl-band" role="status">
            <b>Needs you first</b>
            ${flagged.slice(0, 3).map((job) => `
              <a href="${jobHref(job)}" data-router><b>${h(job.name)}</b> · no daily since the last one</a>`).join('')}
            ${flagged.length > 3 ? `<span class="jf-sub">and ${flagged.length - 3} more</span>` : ''}
          </div>` : ''}

        ${rows.length ? `
        <div class="jl-table">
          <div class="jl-row jl-header">
            <span></span>
            <span class="jl-select"><input type="checkbox" ${allSelected ? 'checked' : ''} data-action="toggle-job-select-all" aria-label="Select all jobs" /></span>
            <span>Job</span><span>Client</span><span>Trade</span><span>Stage</span><span>Day</span><span>Last 4 days</span><span>Value</span>
          </div>
          ${rows.map((job) => {
    const data = productionFor(job.id);
    const stage = resolvePipelineStage('jobs', job.stage, companyId);
    const worked = daysWorked(data.dailies);
    return `
            <div class="jl-row ${selected.has(job.id) ? 'selected' : ''}">
              <span class="jl-spine" style="background:${h(tradeColor(job.job_type))}"></span>
              <span class="jl-select"><input type="checkbox" ${selected.has(job.id) ? 'checked' : ''} data-action="toggle-job-select" data-job-id="${h(job.id)}" aria-label="Select ${h(job.name)}" /></span>
              <a class="jl-name" href="${jobHref(job)}" data-router>
                <b>${h(job.name)}</b>
                <small>${h(job.site_address || 'No address')}${job.owner_name ? ` · ${h(job.owner_name)}` : ''}</small>
              </a>
              <span class="jl-cell">${clientCell(job)}</span>
              <span class="jl-cell"><button class="jl-data-link" type="button" data-action="jobs-trade-filter" data-trade="${h(job.job_type || 'Unassigned')}">${h(job.job_type || 'Unassigned')}</button></span>
              <span class="jl-cell jl-stage">${pipelineDot(pipelineStageColor('jobs', stage, companyId))}<a class="jl-data-link" href="${appHref(companyPath('jobs', { tab: 'pipeline', stage: stage }, companyId))}" data-router>${h(stage)}</a></span>
              <span class="jl-cell jl-num">${worked || '—'}</span>
              <span class="jl-cell">${streakDots(data.dailies)}</span>
              <span class="jl-cell jl-num">${h(money(job.estimate_total))}</span>
            </div>`;
  }).join('')}
        </div>` : emptyState(trade === 'all'
    ? 'No jobs match this view.'
    : `No ${trade} jobs. Pick another trade above, or clear the filter.`)}
      </section>`;
  }

  return { renderJobList };
}
