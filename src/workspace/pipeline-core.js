// Pipeline stages for App Builder records.
//
// A pipeline is not a new concept bolted on: it is an existing `status` field read as an
// ordered sequence. The field's options ARE the stages, in the order they are listed, so
// the board, the table, filters, automations and the status pill all describe the same
// thing. Introducing a parallel "stages" structure would have meant two sources of truth
// that drift the first time someone edits the field.
//
// A stage keeps the option shape exactly — `{ id, label, color }` — so everything already
// reading status options keeps working, and an app that had a status field before any of
// this existed is already a pipeline with no migration.
//
// Pure and dependency-free: every function takes the data it needs and returns new values
// rather than mutating, so callers stay in control of when a change is saved.

export const STAGE_FIELD_TYPES = ['status'];

/** Fields that can drive a board. Status only: a category is a label, not a sequence. */
export function pipelineFields(app) {
  return (app?.fields || []).filter((f) => STAGE_FIELD_TYPES.includes(f.type));
}

/**
 * The field the board should use. Honours an explicit choice, but falls back rather than
 * showing nothing when that field has since been deleted or its type changed.
 */
export function pipelineField(app, preferredId) {
  const candidates = pipelineFields(app);
  if (!candidates.length) return null;
  return candidates.find((f) => f.id === preferredId) || candidates[0];
}

/** The stages of a pipeline field, in board order. */
export function stagesOf(field) {
  return (field?.config?.options || []).filter(Boolean);
}

/**
 * The field whose values are totalled at the top of each column. Money first, because a
 * pipeline is usually counted in money; an explicit choice wins.
 */
export function summaryField(app, preferredId) {
  const numeric = (app?.fields || []).filter((f) => ['money', 'number'].includes(f.type));
  if (!numeric.length) return null;
  return numeric.find((f) => f.id === preferredId) || numeric.find((f) => f.type === 'money') || numeric[0];
}

/**
 * Group records into board columns.
 *
 * Records whose stage is unset — or points at a stage that has since been deleted — are
 * collected into a leading column with a null id rather than dropped. A board that
 * silently omits records is worse than one with an untidy first column: the count at the
 * top of the screen stops matching the number of records that exist.
 */
export function boardColumns(rows, field, sumField) {
  const stages = stagesOf(field);
  const byId = new Map(stages.map((s) => [s.id, { id: s.id, label: s.label, color: s.color || '#6b7280', items: [] }]));
  const unplaced = { id: null, label: 'No stage', color: '#9ca3af', items: [] };
  for (const item of rows || []) {
    const key = item.values?.[field?.id];
    const col = (key != null && key !== '' && byId.get(key)) || unplaced;
    col.items.push(item);
  }
  const columns = [...(unplaced.items.length ? [unplaced] : []), ...stages.map((s) => byId.get(s.id))];
  return columns.map((col) => ({
    ...col,
    count: col.items.length,
    // null rather than 0 so a board with no numeric field shows no total line at all,
    // instead of every column claiming "$0".
    total: sumField ? col.items.reduce((sum, it) => sum + (Number(it.values?.[sumField.id]) || 0), 0) : null,
  }));
}

/** Whether a record can be dropped on a stage — i.e. the stage still exists. */
export function canDropOn(field, stageId) {
  if (stageId === null || stageId === '') return true;
  return stagesOf(field).some((s) => s.id === stageId);
}

// --- editing the stage list -------------------------------------------------------
// Each returns a NEW options array. None of them touch records; moving records off a
// deleted stage is `removeStage`'s separate return value, so the caller decides.

export function addStage(field, label, color, makeId) {
  const stages = stagesOf(field);
  const name = String(label || '').trim() || `Stage ${stages.length + 1}`;
  return [...stages, { id: makeId(), label: name, color: color || '#6b7280' }];
}

export function renameStage(field, stageId, label) {
  const name = String(label || '').trim();
  // An empty name would render an unclickable blank column, so the old one stands.
  return stagesOf(field).map((s) => (s.id === stageId && name ? { ...s, label: name } : s));
}

export function recolorStage(field, stageId, color) {
  return stagesOf(field).map((s) => (s.id === stageId ? { ...s, color: color || '#6b7280' } : s));
}

/** Move a stage by `delta` places. Out-of-range moves are no-ops, not wraps. */
export function moveStage(field, stageId, delta) {
  const stages = stagesOf(field);
  const from = stages.findIndex((s) => s.id === stageId);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= stages.length) return stages;
  const next = stages.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/**
 * Delete a stage, and say what happens to the records standing on it.
 *
 * Returns `{ options, moved }` where `moved` is the ids of records to reassign to
 * `reassignToId` — or to clear, when that is null. Deleting a stage without answering
 * this question is how records disappear from a board: they keep a stage id nothing
 * resolves, and every view that groups by stage stops showing them.
 */
export function removeStage(field, stageId, items, reassignToId = null) {
  const options = stagesOf(field).filter((s) => s.id !== stageId);
  const target = reassignToId && options.some((s) => s.id === reassignToId) ? reassignToId : null;
  const moved = (items || []).filter((it) => it.values?.[field.id] === stageId).map((it) => it.id);
  return { options, moved, reassignTo: target };
}

/** How many records stand on each stage — shown next to it before you delete it. */
export function stageCounts(field, items) {
  const counts = new Map(stagesOf(field).map((s) => [s.id, 0]));
  for (const it of items || []) {
    const key = it.values?.[field.id];
    if (counts.has(key)) counts.set(key, counts.get(key) + 1);
  }
  return counts;
}
