// Pure rules engine for company-level CRM automations. No DOM, no app state,
// no clock -- callers pass the change event and the reference date, so the same
// inputs always produce the same actions and everything is unit-testable.
//
// A rule:
//   { id, name, enabled, trigger: { object, event, value? }, actions: [...] }
//     object  'deal' | 'contact' | 'task' | 'job'
//     event   'stage_is' | 'status_is' | 'created' | 'completed'
//     value   target stage/status (for stage_is / status_is)
//   actions  [{ type: 'create_task', title, assignee_id?, due_offset_days?, priority? }
//             | { type: 'notify', message }]
//
// A change event (what the app hands in when something mutates):
//   { object, event, before, after }
//     before/after are the record snapshots (before is null on create).
//
// The core rule, mirrored from the App Builder engine: a state trigger fires on
// the TRANSITION into the state (after matches, before did not), never on every
// save while already in it -- so "deal is Won" creates the kickoff work once.

export const AUTOMATION_OBJECTS = ['deal', 'contact', 'task', 'job'];
export const AUTOMATION_EVENTS = ['stage_is', 'status_is', 'created', 'completed'];
export const AUTOMATION_ACTION_TYPES = ['create_task', 'notify'];

// The field each object's stage/status lives on.
const STATE_FIELD = { deal: 'stage', contact: 'stage', task: 'status', job: 'status' };

function norm(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim().toLowerCase();
}

/**
 * Does `rule` fire for `change`? Pure predicate.
 * - object must match
 * - 'created'  : before is null/absent and after exists
 * - 'completed': the record's status/stage became a done-like value (task/job)
 * - 'stage_is' / 'status_is': after equals target AND before did not (transition)
 */
export function automationMatches(rule, change) {
  if (!rule || !rule.enabled || !rule.trigger || !change) return false;
  const t = rule.trigger;
  if (t.object !== change.object) return false;

  const field = STATE_FIELD[t.object];
  const after = change.after || null;
  const before = change.before || null;

  // 'created' fires only on a create (no prior record).
  if (t.event === 'created') return !before && !!after;

  // State triggers evaluate the transition, so they work whether the record was
  // created already in the target state or updated into it. A create has before=null,
  // which never matches the target, so the transition check fires correctly.
  if (!after) return false;
  if (t.event === 'completed') {
    const done = (rec) => ['done', 'complete', 'completed', 'won', 'closed'].includes(norm(rec && rec[field]));
    return done(after) && !done(before);
  }
  if (t.event === 'stage_is' || t.event === 'status_is') {
    const target = norm(t.value);
    if (!target) return false;
    return norm(after[field]) === target && norm(before ? before[field] : undefined) !== target;
  }
  return false;
}

/** All { rule, action } pairs to execute for a change, across enabled rules. */
export function collectAutomationActions(rules, change) {
  const out = [];
  for (const rule of Array.isArray(rules) ? rules : []) {
    if (!automationMatches(rule, change)) continue;
    for (const action of Array.isArray(rule.actions) ? rule.actions : []) {
      if (AUTOMATION_ACTION_TYPES.includes(action && action.type)) out.push({ rule, action });
    }
  }
  return out;
}

function addDaysISO(iso, days) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return iso;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  dt.setUTCDate(dt.getUTCDate() + (Number(days) || 0));
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

// Simple {{token}} substitution from the triggering record, so a task title can
// read "Follow up on {{name}}". Unknown tokens collapse to empty.
export function fillTemplate(text, record) {
  return String(text || '').replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key) => {
    const v = record ? record[key] : '';
    return v === undefined || v === null ? '' : String(v);
  });
}

/**
 * Turn a create_task action into task fields, relative to `todayISO`. Pure --
 * the caller adds ids, company_id, creator, and persists. Returns null for a
 * non-task action or a blank title.
 */
export function buildTaskFromAction(action, record, todayISO) {
  if (!action || action.type !== 'create_task') return null;
  const title = fillTemplate(action.title, record).trim();
  if (!title) return null;
  const offset = Number.isFinite(Number(action.due_offset_days)) ? Number(action.due_offset_days) : 1;
  return {
    title,
    due: addDaysISO(todayISO, offset),
    priority: action.priority || 'medium',
    assignee_id: action.assignee_id || '',
    contact_id: record && record.__contact_id ? record.__contact_id : '',
  };
}

/** Human summary of a rule for the list UI. */
export function describeAutomation(rule) {
  if (!rule || !rule.trigger) return '';
  const t = rule.trigger;
  const obj = t.object || 'record';
  let when = `When a ${obj}`;
  if (t.event === 'created') when += ' is created';
  else if (t.event === 'completed') when += ' is completed';
  else if (t.event === 'stage_is') when += ` reaches "${t.value}"`;
  else if (t.event === 'status_is') when += ` becomes "${t.value}"`;
  const acts = (rule.actions || []).map((a) => (
    // Show the title template literally (tokens intact) -- it reads better than a
    // filled-with-blanks preview, and the real task fills {{name}} at run time.
    a.type === 'create_task' ? `create task "${a.title || ''}"` : a.type === 'notify' ? 'send a notification' : a.type
  ));
  return acts.length ? `${when}, ${acts.join(' and ')}.` : `${when}.`;
}
