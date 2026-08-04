// The production calendar: which job is on site, when, and who is on it.
//
// Fetched on demand. Month shows the shape of the next few weeks; week shows one row per
// crew, which is the view that answers "who is free on Wednesday".
//
// A job with no dates is not drawn. It is listed underneath instead, because an unscheduled
// job is the thing most worth seeing on a calendar and hiding it would make the screen lie.

import { tradeColor } from './production-model.js';

const DAY_MS = 86400000;

/** Monday-first weekday index, because a construction week does not start on Sunday. */
export function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - mondayIndex(d));
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export const iso = (date) => new Date(date).toISOString().slice(0, 10);

/** The six-week grid a month view needs, always starting on a Monday. */
export function monthGrid(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
}

/**
 * Where a job's bar sits in one week, or null if it does not touch that week.
 * Clamped to the week so a three-week job draws as three bars rather than overflowing.
 */
export function barForWeek(job, weekStart) {
  if (!job.starts_on) return null;
  const start = new Date(`${job.starts_on}T00:00:00`);
  const end = new Date(`${job.ends_on || job.starts_on}T00:00:00`);
  const weekEnd = addDays(weekStart, 6);
  if (end < weekStart || start > weekEnd) return null;
  const from = start < weekStart ? weekStart : start;
  const to = end > weekEnd ? weekEnd : end;
  const offset = Math.round((from - weekStart) / DAY_MS);
  const span = Math.round((to - from) / DAY_MS) + 1;
  return { offset, span, clippedStart: start < weekStart, clippedEnd: end > weekEnd };
}

export function createJobCalendar(ctx) {
  const {
    h, can, emptyState, appHref, companyPath, filteredJobs, state,
  } = ctx;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const jobHref = (job, companyId) => appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));

  function bar(job, companyId, { offset, span, clippedStart, clippedEnd }, row) {
    const colour = tradeColor(job.job_type);
    return `<a class="jc-bar" href="${jobHref(job, companyId)}" data-router
      style="--jc-offset:${offset};--jc-span:${span};--jc-row:${row};border-left-color:${h(colour)};background:${h(colour)}1a"
      title="${h(job.name)}">
      ${clippedStart ? '<span class="jc-clip">‹</span>' : ''}${h(job.name)}${clippedEnd ? '<span class="jc-clip">›</span>' : ''}
    </a>`;
  }

  function monthView(companyId, anchor, scheduled) {
    const weeks = monthGrid(anchor);
    const month = anchor.getMonth();
    const today = iso(new Date());
    return `
      <div class="jc-month">
        <div class="jc-dow">${DOW.map((d) => `<span>${d}</span>`).join('')}</div>
        ${weeks.map((week) => {
    // One row per job in this week, so overlapping jobs stack instead of colliding.
    const bars = scheduled
      .map((job) => ({ job, place: barForWeek(job, week[0]) }))
      .filter((x) => x.place);
    const height = 30 + bars.length * 22;
    return `
          <div class="jc-week" style="min-height:${height}px">
            ${week.map((d) => `
              <div class="jc-day ${d.getMonth() === month ? '' : 'jc-dim'} ${iso(d) === today ? 'jc-today' : ''}">
                <span class="jc-daynum">${d.getDate()}</span>
              </div>`).join('')}
            ${bars.map((x, i) => bar(x.job, companyId, x.place, i)).join('')}
          </div>`;
  }).join('')}
      </div>`;
  }

  function weekView(companyId, anchor, scheduled) {
    const week = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
    const today = iso(new Date());
    // Grouped by whoever is on it. Unassigned last, because that is the row you act on.
    const crews = [...new Set(scheduled.map((j) => (j.owner_name || '').trim() || 'Unassigned'))]
      .sort((a, b) => (a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b)));
    return `
      <div class="jc-week-view">
        <div class="jc-week-head">
          <span></span>
          <div class="jc-week-days">${days.map((d) => `
            <span class="${iso(d) === today ? 'jc-today-label' : ''}">${DOW[mondayIndex(d)]} ${d.getDate()}</span>`).join('')}</div>
        </div>
        ${crews.map((crew) => {
    const bars = scheduled
      .filter((j) => ((j.owner_name || '').trim() || 'Unassigned') === crew)
      .map((job) => ({ job, place: barForWeek(job, week) }))
      .filter((x) => x.place);
    return `
          <div class="jc-crew-row">
            <span class="jc-crew-name ${crew === 'Unassigned' ? 'jc-unassigned' : ''}">${h(crew)}</span>
            <div class="jc-crew-lane" style="min-height:${Math.max(34, bars.length * 26 + 8)}px">
              ${bars.map((x, i) => bar(x.job, companyId, x.place, i)).join('')}
            </div>
          </div>`;
  }).join('') || emptyState('Nothing scheduled this week.')}
      </div>`;
  }

  function renderJobCalendar(companyId) {
    const mode = state.jobCalendarMode === 'week' ? 'week' : 'month';
    const anchor = state.jobCalendarAnchor ? new Date(`${state.jobCalendarAnchor}T00:00:00`) : new Date();
    const jobs = filteredJobs(companyId);
    const scheduled = jobs.filter((job) => job.starts_on);
    const unscheduled = jobs.filter((job) => !job.starts_on);
    const title = mode === 'month'
      ? `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
      : `Week of ${MONTHS[startOfWeek(anchor).getMonth()].slice(0, 3)} ${startOfWeek(anchor).getDate()}`;

    return `
      <section class="jc">
        <header class="jl-head">
          <div>
            <p class="jf-eyebrow">Production · calendar</p>
            <h1>${h(title)}</h1>
          </div>
          <div class="jl-head-actions">
            <button class="btn btn-compact" type="button" data-action="jobs-cal-move" data-step="-1">Back</button>
            <button class="btn btn-compact" type="button" data-action="jobs-cal-move" data-step="0">Today</button>
            <button class="btn btn-compact" type="button" data-action="jobs-cal-move" data-step="1">Next</button>
            <button class="btn btn-compact ${mode === 'week' ? 'btn-primary' : ''}" type="button" data-action="jobs-cal-mode" data-mode="week">Week</button>
            <button class="btn btn-compact ${mode === 'month' ? 'btn-primary' : ''}" type="button" data-action="jobs-cal-mode" data-mode="month">Month</button>
          </div>
        </header>

        ${scheduled.length
    ? (mode === 'month' ? monthView(companyId, anchor, scheduled) : weekView(companyId, anchor, scheduled))
    : emptyState('No job has dates yet. Set a start and end on a job and it appears here.')}

        ${unscheduled.length ? `
          <!-- Listed rather than hidden: an unscheduled job is the thing most worth seeing on
               a calendar, and leaving it off would make the screen look fully booked. -->
          <article class="jc-unscheduled">
            <h3>Not scheduled <span class="jf-sub">${unscheduled.length}</span></h3>
            <div class="jc-unscheduled-list">
              ${unscheduled.slice(0, 12).map((job) => `
                <a href="${jobHref(job, companyId)}" data-router>
                  <i style="background:${h(tradeColor(job.job_type))}"></i>${h(job.name)}
                </a>`).join('')}
              ${unscheduled.length > 12 ? `<span class="jf-sub">and ${unscheduled.length - 12} more</span>` : ''}
            </div>
            ${can('jobs.manage', companyId) ? '<p class="jf-sub">Open a job and use Edit job to give it dates.</p>' : ''}
          </article>` : ''}
      </section>`;
  }

  return { renderJobCalendar };
}
