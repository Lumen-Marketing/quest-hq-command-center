// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

import { computeTeamWorkload } from '../data/team-workload.js';
import { taskRosterPeople } from '../tasks/task-assignees.js';

export function createTeamWorkloadPage(ctx) {
  const {
    appHref, companyPath, companyTaskAssignees, companyTasks, emptyState, h, state,
  } = ctx;

  function renderTeamWorkloadPage(companyId) {
    // Task rows name people by ROSTER id (tasks.assignee_id -> team_members.id), so the board is
    // keyed the same way: one row per roster id. Keying by profile id matched nothing and showed
    // everyone at 0. A roster id shared by several logins is one row named for the id, never
    // credited to whichever account is listed first.
    const members = taskRosterPeople(companyTaskAssignees(companyId));
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const wl = computeTeamWorkload({ members, tasks: companyTasks(companyId), todayIso });

    const rows = wl.rows.map((r) => {
      const pct = wl.maxOpen ? Math.max(r.open ? 6 : 0, Math.round((r.open / wl.maxOpen) * 100)) : 0;
      return `
        <div class="tw-row${r.overloaded ? ' overloaded' : ''}">
          <div class="tw-name">${h(r.name)}${r.overloaded ? '<span class="tw-badge over">Overloaded</span>' : ''}</div>
          <div class="tw-bar"><span class="tw-bar-fill" style="width:${pct}%"></span></div>
          <div class="tw-count"><b>${r.open}</b> open${r.overdue ? ` <span class="tw-badge due">${r.overdue} overdue</span>` : ''}</div>
        </div>`;
    }).join('');

    return `
      <section class="tw-page">
        <div class="tw-head">
          <div>
            <h1>Team workload</h1>
            <p class="muted">Open tasks per person right now — busiest first.</p>
          </div>
          <a class="btn" href="${appHref(companyPath('tasks', {}, companyId))}" data-router><i class="ti ti-list-check" aria-hidden="true"></i>Open tasks</a>
        </div>
        <div class="tw-stats">
          <div class="tw-stat"><b>${wl.totalOpen}</b><span>Open tasks</span></div>
          <div class="tw-stat ${wl.totalOverdue ? 'warn' : ''}"><b>${wl.totalOverdue}</b><span>Overdue</span></div>
          <div class="tw-stat ${wl.unassignedOpen ? 'warn' : ''}"><b>${wl.unassignedOpen}</b><span>Unassigned</span></div>
          <div class="tw-stat"><b>${wl.rows.length}</b><span>People</span></div>
        </div>
        ${wl.rows.length ? `<div class="tw-board panel">${rows}</div>` : emptyState('No active team members to show workload for.')}
      </section>`;
  }

  return { renderTeamWorkloadPage };
}
