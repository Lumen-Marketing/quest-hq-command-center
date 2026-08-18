// Making something and attaching it to the record you are looking at.
//
// "In quick create there are special fields that when you create it, it will automatically
// attach to the current opened record and open a modal for it."
//
// The App Builder stores a record's values keyed by field id and has no per-record attachment
// slot, so "attached to this record" can only mean one thing here: the app gains a field of that
// type, and THIS record's value of it is opened. The field is made once and reused, so pressing
// Spreadsheet on a second record opens the same column rather than growing a second one.
//
// Fetched on the first press: a card of four buttons is cheap to draw and this is what makes
// them do something, which most sessions never ask for.

import { placeFieldInLayout, quickCreateField, quickEntry } from './record-layout.js';

/** How the sheet and document editors name a record: one string, four ids. */
const seatOf = ({ companyId, workspaceId, appId, itemId }) => [companyId, workspaceId, appId, itemId].join('|');

/**
 * Open the field's own control on the record page.
 *
 * An image and a file are edited by the cell they live in, not by a modal of their own -- so
 * rather than building a second picker that would drift from the first, the cell that was just
 * created is opened. It exists only after the render that follows the save, and the record page
 * binds its handlers on the way past, so this waits a frame rather than looking immediately.
 */
function openCell(fieldId) {
  requestAnimationFrame(() => {
    const escape = globalThis.CSS?.escape ? globalThis.CSS.escape(fieldId) : fieldId;
    document.querySelector(`[data-wb-inline="${escape}"]`)?.click();
  });
}

/**
 * Press one of the Quick Create buttons.
 *
 * Returns what it did, so a test can read the outcome without a DOM: 'opened' when the field was
 * already there, 'created' when it had to be made first, or a reason it did nothing.
 */
export async function press(key, seat, ctx) {
  const entry = quickEntry(key);
  if (!entry) return 'unknown';
  const {
    can, render, showToast, wbDoc, wbSave, wbUid,
  } = ctx;
  const { companyId, workspaceId, appId, itemId } = seat || {};

  // The button only appears for a manager, but the press is checked as well as the paint: a card
  // left open in a tab somebody has since lost the permission for must not still write.
  if (!can('workspaces.manage', companyId)) {
    showToast('You cannot change this app.', 'local', 'Workspaces');
    return 'refused';
  }
  const workspace = (wbDoc(companyId)?.workspaces || []).find((entry2) => entry2.id === workspaceId);
  const app = (workspace?.apps || []).find((entry2) => entry2.id === appId);
  const item = (app?.items || []).find((entry2) => entry2.id === itemId);
  if (!app || !item) {
    showToast('This record is no longer here.', 'local', 'Workspaces');
    return 'gone';
  }

  const made = quickCreateField(app, entry, wbUid);
  if (!made) return 'unknown';
  if (made.created) {
    app.fields = [...(app.fields || []), made.field];
    // Made AND placed. A `fields` block with an explicit list is honoured exactly, so a field in
    // none of them is invisible on this page with nothing to say why -- which is what pressing
    // Spreadsheet on a customised layout would otherwise look like.
    if (Array.isArray(app.recordLayout)) {
      app.recordLayout = placeFieldInLayout(app.recordLayout, made.field.id);
    }
    await wbSave(companyId);
  }

  if (entry.field === 'sheet') {
    const mod = await import('../sheet/sheet-editor.js');
    mod.openForRecord(made.field.id, seatOf(seat), ctx);
  } else if (entry.field === 'form') {
    const mod = await import('../form/doc-editor.js');
    mod.openForRecord(made.field.id, seatOf(seat), ctx);
  } else {
    // An image or a file: the cell is the control, so the page is drawn and the new cell opened.
    render();
    openCell(made.field.id);
  }
  return made.created ? 'created' : 'opened';
}
