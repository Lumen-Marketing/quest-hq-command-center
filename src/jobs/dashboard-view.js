// The Jobs production figures, rendered from the pure model beside it.
//
// Fetched on demand: only a workspace carrying a Jobs tile needs it, and nothing on the
// pipeline or record pages needs it to paint.
//
// A factory, because the formatting and permission helpers belong to main.js. The model is
// imported directly -- it is pure, has no dependencies of its own, and importing it here
// creates no cycle.

import {
  activeJobs, dashboardTiles, drawsReady, jobStreak,
} from './dashboard-model.js';

const STREAK_TONE = { good: 'good', ok: 'ok', rough: 'rough', missing: 'missing' };

export function createJobsDashboard(ctx) {
  const {
    h, can, money, appHref, companyPath, companyJobs,
    resolvePipelineStage, productionForJob, todayIso,
  } = ctx;

  // The same figures as a workspace tile, showing only the parts the owner ticked. It lives
  // here rather than in main.js so the markup and the arithmetic stay in one file, and so a
  // workspace with no Jobs tile never downloads either.
  function renderJobsTile(companyId, config, defaultParts) {
    if (!can('jobs.view', companyId)) return '<div class="wb-tile-empty">Your role cannot see jobs.</div>';
    const parts = Array.isArray(config?.parts) ? config.parts : defaultParts;
    const has = (key) => parts.includes(key);
    const jobs = companyJobs(companyId);
    const stageOf = (job) => resolvePipelineStage('jobs', job.stage, companyId);
    const figures = dashboardTiles(jobs, stageOf, productionForJob, todayIso(), Date.now())
      .filter((tile) => has(tile.id));
    const live = has('workingList') ? activeJobs(jobs, stageOf).slice(0, 5) : [];
    const ready = has('drawsList') ? drawsReady(jobs, productionForJob).slice(0, 5) : [];
    if (!figures.length && !live.length && !ready.length) {
      return '<div class="wb-tile-empty">Nothing ticked for this tile yet — choose what it shows in its settings.</div>';
    }
    const streak = (job) => {
      const days = jobStreak(job, productionForJob);
      if (!days.length) return '<span class="jd-streak jd-streak-none">—</span>';
      return `<span class="jd-streak">${days.map((day) => `<i class="jd-${h(STREAK_TONE[day] || 'missing')}"></i>`).join('')}</span>`;
    };
    const canBill = can('jobs.manage', companyId);
    const allJobs = appHref(companyPath('jobs', { tab: 'list' }, companyId));
    return `
      ${figures.length ? `<div class="wb-jobs-figs">${figures.map((tile) => `
        <a class="wb-jobs-fig jd-${h(tile.tone)}" href="${allJobs}" data-router>
          <span class="wb-jobs-fig-label">${h(tile.label)}</span>
          <strong>${tile.money ? h(money(tile.value)) : h(tile.value)}</strong>
          <span class="wb-jobs-fig-cap">${h(tile.caption)}</span>
        </a>`).join('')}</div>` : ''}
      ${live.length ? `<div class="wb-jobs-list"><p class="wb-jobs-list-head">Working today</p>${live.map((job) => `
        <a class="wb-jobs-row" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>
          <span class="wb-jobs-row-name">${h(job.name)}</span>${streak(job)}
        </a>`).join('')}</div>` : ''}
      ${ready.length ? `<div class="wb-jobs-list"><p class="wb-jobs-list-head">Draws ready</p>${ready.map(({ job, draw, amount }) => `
        <div class="wb-jobs-row">
          <a class="wb-jobs-row-name" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id, jt: 'contract' }, companyId))}" data-router>${h(job.name)}</a>
          <b class="wb-jobs-row-amt">${h(money(amount))}</b>
          ${canBill ? `<button class="btn btn-sm btn-primary" type="button" data-action="job-draw-invoice" data-draw-id="${h(draw.id)}">Request</button>` : ''}
        </div>`).join('')}</div>` : ''}`;
  }

  return { renderJobsTile };
}
