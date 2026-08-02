// The App Builder's board (kanban) view: one column per pipeline stage, records dragged
// between them.
//
// Fetched on demand, like the reports charts, because a board needs a click on the view
// switch to reach and nothing on the path to first paint calls it.
//
// The card markup is NOT built here. It is passed in as `cardHtml`, so a record looks
// identical whether you are looking at it in Cards or on the board, and the two cannot
// drift apart. This module's job is the columns, the drop targets and the column headers.

function h(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * @param columns  from `boardColumns` — already grouped, counted and totalled
 * @param cardHtml (item) => string, the shared record card
 * @param canManage whether records may be dragged, and stages managed
 * @param formatTotal (n) => string, or null to hide the total line
 * @param dragKind  the value paired with `data-drag-kind`, matched on drop
 */
export function renderBoard(columns, { cardHtml, canManage = false, formatTotal = null, dragKind = 'wb-item' } = {}) {
  const lanes = columns.map((col) => {
    const cards = col.items.map((item) => `<div class="wb-board-card" ${canManage ? 'draggable="true"' : ''} data-drag-kind="${h(dragKind)}" data-drag-id="${h(item.id)}">${cardHtml(item)}</div>`).join('');
    // The empty column still has to be a drop target, or a stage can never receive its
    // first record -- the one moment a board is most likely to be empty.
    const body = cards || `<div class="wb-board-empty">${canManage ? 'Drop a record here' : 'Nothing here yet'}</div>`;
    const total = (formatTotal && col.total != null) ? `<span class="wb-board-total">${h(formatTotal(col.total))}</span>` : '';
    // A null id is the "no stage" column. It is a real drop target: clearing a record's
    // stage has to be possible, or a record dropped there by mistake is stuck forever.
    return `<section class="wb-board-col${col.id === null ? ' wb-board-unplaced' : ''}" data-drop-stage="${h(col.id ?? '')}" data-drag-kind="${h(dragKind)}" aria-label="${h(col.label)}, ${col.count} record${col.count === 1 ? '' : 's'}">
      <header class="wb-board-head" style="--wb-stage:${h(col.color)}">
        <span class="wb-board-dot" aria-hidden="true"></span>
        <b class="wb-board-name" title="${h(col.label)}">${h(col.label)}</b>
        <span class="wb-board-count">${col.count}</span>
        ${total}
      </header>
      <div class="wb-board-cards" data-stage-key="${h(col.id ?? '__none')}">${body}</div>
    </section>`;
  }).join('');
  return `<div class="wb-board" role="list">${lanes}</div>`;
}

/**
 * The stage-management panel: rename, recolour, reorder and delete, with the number of
 * records on each stage shown next to it so the cost of deleting one is visible before
 * the click rather than after it.
 */
export function renderStageManager(stages, counts, { fieldLabel = 'Stage' } = {}) {
  if (!stages.length) {
    return `<div class="wb-sub">No stages yet. Add the first one below — records will land in <b>No stage</b> until you do.</div>`;
  }
  const rows = stages.map((s, i) => {
    const n = counts.get(s.id) || 0;
    return `<div class="wb-stage-row" data-stage-id="${h(s.id)}">
      <div class="wb-stage-order">
        <button class="wb-icon-btn" type="button" data-wb-stage-move="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move ${h(s.label)} earlier"><i class="ti ti-chevron-up"></i></button>
        <button class="wb-icon-btn" type="button" data-wb-stage-move="1" ${i === stages.length - 1 ? 'disabled' : ''} aria-label="Move ${h(s.label)} later"><i class="ti ti-chevron-down"></i></button>
      </div>
      <input type="color" class="wb-dot-pick" value="${h(s.color || '#6b7280')}" data-wb-stage-color aria-label="Colour for ${h(s.label)}">
      <input class="wb-input wb-stage-label" value="${h(s.label)}" data-wb-stage-label placeholder="Stage name" aria-label="Name of stage ${i + 1}">
      <span class="wb-stage-count" title="${n} record${n === 1 ? '' : 's'} on this stage">${n}</span>
      <button class="wb-icon-btn danger" type="button" data-wb-stage-del aria-label="Delete ${h(s.label)}"><i class="ti ti-trash"></i></button>
    </div>`;
  }).join('');
  return `<div class="wb-stage-list" aria-label="${h(fieldLabel)} stages">${rows}</div>`;
}

/**
 * Asked before a stage holding records is deleted. Offering "clear the stage" as well as
 * a destination matters: with only a destination, deleting the last stage would be
 * impossible.
 */
export function renderStageDeletePrompt(stage, count, others) {
  const options = others.map((s) => `<option value="${h(s.id)}">${h(s.label)}</option>`).join('');
  return `<div class="wb-stage-confirm">
    <p><b>${h(stage.label)}</b> has ${count} record${count === 1 ? '' : 's'}. Where should ${count === 1 ? 'it' : 'they'} go?</p>
    <label class="wb-field"><span>Move to</span>
      <select class="wb-input" data-wb-stage-reassign>
        ${options}
        <option value="">No stage</option>
      </select>
    </label>
    <div class="wb-sub">The records are kept either way — only the stage is deleted.</div>
  </div>`;
}
