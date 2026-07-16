// Pure computation for the Team Workload board — who's carrying how much open
// work, who's overloaded, and how much is unassigned. No DOM, no app state: it
// takes plain members + tasks so it can be unit-tested and reused.

/**
 * @param {{members: Array<{id,name}>, tasks: Array<{assignee_id,due,status}>, todayIso: string}} input
 * @returns {{rows, unassignedOpen, totalOpen, totalOverdue, maxOpen}}
 *   rows: [{ id, name, open, overdue, overloaded }] sorted busiest-first.
 */
export function computeTeamWorkload({ members = [], tasks = [], todayIso = '' } = {}) {
  const openTasks = tasks.filter((t) => t && String(t.status || '').toLowerCase() !== 'done');
  const isOverdue = (t) => t.due && todayIso && String(t.due).slice(0, 10) < todayIso;

  const byMember = new Map();
  for (const m of members) if (m && m.id) byMember.set(m.id, { id: m.id, name: m.name || m.id, open: 0, overdue: 0 });

  let unassignedOpen = 0;
  let totalOverdue = 0;
  for (const t of openTasks) {
    if (isOverdue(t)) totalOverdue += 1;
    const bucket = t.assignee_id && byMember.get(t.assignee_id);
    if (!bucket) { if (!t.assignee_id) unassignedOpen += 1; continue; }
    bucket.open += 1;
    if (isOverdue(t)) bucket.overdue += 1;
  }

  const rows = [...byMember.values()].sort((a, b) => (b.open - a.open) || (b.overdue - a.overdue) || a.name.localeCompare(b.name));
  const maxOpen = rows.reduce((m, r) => Math.max(m, r.open), 0);

  // "Overloaded" = carrying meaningfully more than the team norm. Compared to the
  // average across people who have any open work, with a small floor so a team
  // where everyone has 1–2 tasks doesn't flag anyone.
  const withWork = rows.filter((r) => r.open > 0);
  const avg = withWork.length ? withWork.reduce((s, r) => s + r.open, 0) / withWork.length : 0;
  const threshold = Math.max(4, Math.ceil(avg * 1.5));
  for (const r of rows) r.overloaded = r.open >= threshold;

  return {
    rows,
    unassignedOpen,
    totalOpen: openTasks.length,
    totalOverdue,
    maxOpen,
  };
}
