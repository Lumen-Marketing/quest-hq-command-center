// The Jobs dashboard, rendered from the pure model beside it.
//
// Fetched on demand: you have to navigate to Jobs to see it, and nothing on the dashboard,
// pipeline or record pages needs it to paint.
//
// A factory, because the formatting and permission helpers belong to main.js. The model is
// imported directly -- it is pure, has no dependencies of its own, and importing it here
// creates no cycle.

import { activeJobs, dashboardTiles, needsAttention, stageProgress } from './dashboard-model.js';

export function createJobsDashboard(ctx) {
  const {
    h, can, money, emptyState, appHref, companyPath, companyJobs,
    pipelineStages, pipelineStageColor, resolvePipelineStage,
  } = ctx;

  function renderJobsDashboard(companyId) {
    const jobs = companyJobs(companyId);
    const stages = pipelineStages('jobs', companyId);
    const stageOf = (job) => resolvePipelineStage('jobs', job.stage, companyId);
    const now = Date.now();
    const tiles = dashboardTiles(jobs, stageOf, now);
    const live = activeJobs(jobs, stageOf);
    const flags = needsAttention(jobs, stageOf, now);
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      .format(new Date()).toUpperCase();

    const dots = (job) => {
      const { step, total } = stageProgress(stageOf(job), stages);
      return `<span class="jd-dots" aria-label="Stage ${step} of ${total}">${Array.from({ length: total }, (_, i) =>
        `<i class="${i < step ? 'on' : ''}" style="${i < step ? `background:${h(pipelineStageColor('jobs', stageOf(job), companyId))}` : ''}"></i>`).join('')}</span>`;
    };

    const jobLink = (job) => appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));

    return `
      <section class="jd">
        <header class="jd-head">
          <div>
            <p class="jd-eyebrow">Production · ${h(today)}</p>
            <h1>Jobs Dashboard</h1>
          </div>
          <div class="jd-actions">
            <a class="btn" href="${appHref(companyPath('calendar', {}, companyId))}" data-router><i class="ti ti-calendar"></i>Calendar</a>
            <a class="btn" href="${appHref(companyPath('jobs', { tab: 'list' }, companyId))}" data-router>All jobs</a>
            ${can('jobs.manage', companyId) ? '<button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>' : ''}
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
            <h2>Working now</h2>
            ${live.length ? `<ul class="jd-list">${live.slice(0, 8).map((job) => `
              <li>
                <a href="${jobLink(job)}" data-router>
                  <b>${h(job.name)}</b><span class="jd-sep">—</span><span class="jd-stage">${h(stageOf(job))}</span>
                  <small>${h(job.owner_name || 'Unassigned')}</small>
                </a>
                ${dots(job)}
              </li>`).join('')}</ul>
              ${live.length > 8 ? `<a class="jd-more" href="${appHref(companyPath('jobs', { tab: 'list' }, companyId))}" data-router>${live.length - 8} more in the full list</a>` : ''}`
      : emptyState('No jobs are in production right now. Anything scheduled or on site will show here.')}
          </article>

          <article class="jd-panel">
            <h2>Needs attention</h2>
            ${flags.length ? `<ul class="jd-list jd-flags">${flags.slice(0, 8).map(({ job, idle }) => `
              <li>
                <a href="${jobLink(job)}" data-router>
                  <b>${h(job.name)}</b><span class="jd-sep">—</span><span class="jd-stage">${h(stageOf(job))}</span>
                  <small>no update in ${idle} day${idle === 1 ? '' : 's'}</small>
                </a>
                <span class="jd-amount">${h(money(job.estimate_total))}</span>
                <a class="btn btn-sm" href="${jobLink(job)}" data-router>Open</a>
              </li>`).join('')}</ul>`
      : emptyState('Every live job has been updated recently.')}
          </article>
        </div>
      </section>
    `;
  }

  return { renderJobsDashboard };
}
