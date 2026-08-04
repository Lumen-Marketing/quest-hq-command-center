// The Jobs dashboard, rendered from the pure model beside it.
//
// Fetched on demand: you have to navigate to Jobs to see it, and nothing on the dashboard,
// pipeline or record pages needs it to paint.
//
// A factory, because the formatting and permission helpers belong to main.js. The model is
// imported directly -- it is pure, has no dependencies of its own, and importing it here
// creates no cycle.

import {
  activeJobs, dashboardTiles, drawsReady, jobStreak, productionFlags,
} from './dashboard-model.js';

const STREAK_TONE = { good: 'good', ok: 'ok', rough: 'rough', missing: 'missing' };

export function createJobsDashboard(ctx) {
  const {
    h, can, money, emptyState, appHref, companyPath, companyJobs,
    resolvePipelineStage, productionForJob, todayIso,
  } = ctx;

  function renderJobsDashboard(companyId) {
    const jobs = companyJobs(companyId);
    const stageOf = (job) => resolvePipelineStage('jobs', job.stage, companyId);
    const now = Date.now();
    const iso = todayIso();
    const tiles = dashboardTiles(jobs, stageOf, productionForJob, iso, now);
    const live = activeJobs(jobs, stageOf);
    const ready = drawsReady(jobs, productionForJob);
    const flags = productionFlags(jobs, stageOf, productionForJob, iso, now);
    const missing = flags.filter((flag) => flag.kind === 'missing-daily');
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      .format(new Date()).toUpperCase();

    // Four days of production, worst crew of each day winning, exactly as the list shows it.
    const streak = (job) => {
      const days = jobStreak(job, productionForJob);
      if (!days.length) return '<span class="jd-streak jd-streak-none" title="No dailies yet">—</span>';
      return `<span class="jd-streak" aria-label="Last ${days.length} days of production">${days
        .map((day) => `<i class="jd-${h(STREAK_TONE[day] || 'missing')}"></i>`).join('')}</span>`;
    };

    const jobLink = (job) => appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));
    const canBill = can('jobs.manage', companyId);

    return `
      <section class="jd">
        <header class="jd-head">
          <div>
            <p class="jd-eyebrow">Production · ${h(today)}</p>
            <h1>Jobs Dashboard</h1>
          </div>
          <div class="jd-actions">
            <a class="btn" href="${appHref(companyPath('jobs', { tab: 'calendar' }, companyId))}" data-router><i class="ti ti-calendar"></i>Calendar</a>
            <a class="btn" href="${appHref(companyPath('jobs', { tab: 'list' }, companyId))}" data-router>All jobs</a>
            ${canBill ? '<button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>' : ''}
          </div>
        </header>

        <div class="jd-tiles">
          ${tiles.map((tile) => `
            <div class="jd-tile jd-${h(tile.tone)}">
              <span class="jd-tile-label">${h(tile.label)}</span>
              <strong>${tile.money ? h(money(tile.value)) : h(tile.value)}</strong>
              <span class="jd-tile-caption">${h(tile.caption)}</span>
            </div>
          `).join('')}
        </div>

        <div class="jd-panels">
          <article class="jd-panel">
            <h2>Working today</h2>
            ${live.length ? `<ul class="jd-list">${live.slice(0, 8).map((job) => `
              <li>
                <a href="${jobLink(job)}" data-router>
                  <b>${h(job.name)}</b>
                  <small>${h(job.owner_name || 'Unassigned')}</small>
                </a>
                ${streak(job)}
              </li>`).join('')}</ul>
              ${live.length > 8 ? `<a class="jd-more" href="${appHref(companyPath('jobs', { tab: 'list' }, companyId))}" data-router>${live.length - 8} more in the full list</a>` : ''}`
      : emptyState('No jobs are in production right now. Anything scheduled or on site will show here.')}
          </article>

          <article class="jd-panel">
            <h2>Draws ready</h2>
            ${ready.length ? `<ul class="jd-list jd-draws">${ready.slice(0, 8).map(({ job, draw, amount }) => `
              <li>
                <a href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id, jt: 'contract' }, companyId))}" data-router>
                  <b>${h(job.name)}</b><span class="jd-sep">—</span><span class="jd-stage">${h(draw.label)}</span>
                </a>
                <span class="jd-amount">${h(money(amount))}</span>
                ${canBill
      ? `<button class="btn btn-sm btn-primary" type="button" data-action="job-draw-invoice" data-draw-id="${h(draw.id)}">Request</button>`
      : ''}
              </li>`).join('')}</ul>`
      : emptyState('No draws are unlocked. A draw appears here once its milestone is met.')}
            ${missing.length ? `<p class="jd-chase">
              <i class="ti ti-alert-triangle"></i>
              Missing daily yesterday: ${missing.map((flag) => h(flag.job.name)).join(', ')}
              <a href="${jobLink(missing[0].job)}" data-router>open the job</a>
            </p>` : ''}
          </article>
        </div>
      </section>
    `;
  }

  return { renderJobsDashboard };
}
