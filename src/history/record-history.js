const RECORD_TYPES = new Set(['contact', 'deal', 'job', 'task']);
const HISTORY_ACTIONS = new Set(['created', 'updated', 'deleted', 'restored']);

const FIELD_LABELS = {
  contact: {
    name: 'Name',
    stage: 'Stage',
    owner_name: 'Owner',
    temperature: 'Temperature',
    pay_type: 'Pay type',
    roof_system: 'Roof system',
    source: 'Source',
    value: 'Estimated value',
  },
  deal: {
    name: 'Quote name',
    stage: 'Stage',
    status: 'Status',
    value: 'Value',
    probability: 'Probability',
    close_date: 'Close date',
    owner_name: 'Owner',
  },
  job: {
    name: 'Job name',
    stage: 'Stage',
    priority: 'Priority',
    owner_name: 'Owner',
    job_type: 'Job type',
    estimate_total: 'Estimate total',
    invoice_total: 'Invoice total',
  },
  task: {
    title: 'Task title',
    status: 'Status',
    priority: 'Priority',
    due: 'Due date',
    due_time: 'Due time',
  },
};

function cleanString(value) {
  return value == null ? '' : String(value);
}

function cleanChangedFields(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((field) => typeof field === 'string' && field.trim()).map((field) => field.trim()))];
}

function cleanChanges(value, changedFields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return changedFields.reduce((result, field) => {
    const change = value[field];
    if (!change || typeof change !== 'object' || Array.isArray(change)) return result;
    if (!Object.hasOwn(change, 'before') || !Object.hasOwn(change, 'after')) return result;
    result[field] = {
      before: change.before,
      after: change.after,
    };
    return result;
  }, {});
}

export function normalizeRecordHistoryEvent(input = {}) {
  const changedFields = cleanChangedFields(input.changed_fields);
  return {
    id: cleanString(input.id),
    company_id: cleanString(input.company_id),
    workspace_id: cleanString(input.workspace_id),
    record_type: RECORD_TYPES.has(input.record_type) ? input.record_type : '',
    record_id: cleanString(input.record_id),
    record_label: cleanString(input.record_label),
    action: HISTORY_ACTIONS.has(input.action) ? input.action : 'updated',
    actor_profile_id: cleanString(input.actor_profile_id),
    changed_fields: changedFields,
    changes: cleanChanges(input.changes, changedFields),
    created_at: cleanString(input.created_at),
  };
}

export function recordHistoryFor(events, scope = {}) {
  const companyId = cleanString(scope.companyId);
  const workspaceId = cleanString(scope.workspaceId);
  const recordType = cleanString(scope.recordType);
  const recordId = cleanString(scope.recordId);
  return (Array.isArray(events) ? events : [])
    .map(normalizeRecordHistoryEvent)
    .filter((event) => (
      event.company_id === companyId
      && event.workspace_id === workspaceId
      && event.record_type === recordType
      && event.record_id === recordId
    ))
    .sort((a, b) => {
      const right = Date.parse(b.created_at);
      const left = Date.parse(a.created_at);
      return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
    });
}

export function historyFieldLabel(recordType, field) {
  const cleanType = cleanString(recordType);
  const cleanField = cleanString(field);
  if (FIELD_LABELS[cleanType]?.[cleanField]) return FIELD_LABELS[cleanType][cleanField];
  const words = cleanField.replace(/[_-]+/g, ' ').toLowerCase();
  return words ? `${words[0].toUpperCase()}${words.slice(1)}` : '';
}

export function describeRecordHistoryEvent(input) {
  const event = normalizeRecordHistoryEvent(input);
  const type = event.record_type || 'record';
  if (event.action === 'created') return `Created ${type}`;
  if (event.action === 'deleted') return 'Moved to Recycle Bin';
  if (event.action === 'restored') return 'Restored from Recycle Bin';
  const labels = event.changed_fields.map((field) => historyFieldLabel(type, field));
  if (!labels.length) return `Updated ${type}`;
  if (labels.length === 1) return `Updated ${labels[0]}`;
  return `Updated ${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`;
}

export function formatHistoryValue(value) {
  if (value == null || value === '') return 'Empty';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return new Intl.NumberFormat('en-US').format(value);
  if (Array.isArray(value)) return value.map(formatHistoryValue).join(', ');
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return 'Structured value';
    }
  }
  return String(value);
}
