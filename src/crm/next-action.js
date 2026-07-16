const PRIORITY_RANK = {
  critical: 5,
  urgent: 4,
  high: 3,
  medium: 2,
  normal: 2,
  low: 1,
};

function taskSchedule(task) {
  const due = String(task?.due || '').trim();
  if (!due) return Number.POSITIVE_INFINITY;
  const time = String(task?.due_time || '').trim() || '23:59';
  const parsed = Date.parse(`${due}T${time}`);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function openTask(task) {
  return !!task
    && String(task.status || '').toLowerCase() !== 'done'
    && !task.cleared_at
    && !task.deleted_at;
}

export function selectNextAction(tasks = []) {
  return tasks
    .filter(openTask)
    .slice()
    .sort((a, b) => {
      const aSchedule = taskSchedule(a);
      const bSchedule = taskSchedule(b);
      if (aSchedule !== bSchedule) return aSchedule < bSchedule ? -1 : 1;
      const priorityDiff = (PRIORITY_RANK[String(b.priority || '').toLowerCase()] || 0)
        - (PRIORITY_RANK[String(a.priority || '').toLowerCase()] || 0);
      if (priorityDiff) return priorityDiff;
      return Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0);
    })[0] || null;
}

export function taskMatchesRecord(task, record = {}) {
  if (!task || !record.id) return false;
  if (record.kind === 'contact') {
    return task.contact_id === record.id && !task.deal_id && !task.project_id;
  }
  if (record.kind === 'deal') {
    if (task.deal_id === record.id) return true;
    return !!record.allowLegacyContactMatch
      && !task.deal_id
      && !task.project_id
      && !!record.contactId
      && task.contact_id === record.contactId;
  }
  if (record.kind === 'job') return task.project_id === record.id;
  return false;
}
