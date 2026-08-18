// One record of an app, laid out however the app says.
//
// Fetched on demand: you have to click a row to get here, and nothing that paints before
// that click needs it. The layout model is imported directly rather than handed in — it is a
// pure leaf module, so there is no cycle back to main.js, and a static import cannot be
// null the way a fetched one can.

import * as recordLayout from './record-layout.js';
import * as children from './child-collections.js';
// Pure leaf modules, like the two above: the stage field so stepping stays inside the deck you
// arrived from, and newest-first so 'next' means the row below the one you opened.
import { pipelineField } from './pipeline-core.js';
import { sortNewestFirst } from '../company-contacts/model.js';

/**
 * One sub-item field, rendered by the APP'S OWN formatter.
 *
 * There used to be a small formatter here that knew about text, money and options. Anything
 * it had not been taught fell through to String(value) -- so a User field printed the
 * member's raw UUID as the row title, and every other id-carrying type would have done the
 * same.
 *
 * The reason it was written separately was that the shared formatter resolves things against
 * the PARENT app's fields. That is true of exactly three computed types -- calculation,
 * rollup and progress, which read config.source and friends out of app.fields -- so the app
 * handed over here carries the COLLECTION's fields instead. User and relationship were never
 * affected: they resolve through companyId and the field's own config.
 *
 * canManage is deliberately NOT passed. The checkbox branch renders a live toggle wired to
 * data-item-id, and a child is not an app item -- that toggle would write to the wrong row.
 */
function childValueHtml(ctxFns, companyId, app, cols, child, field) {
  return ctxFns.wbFmtVal(
    { companyId, app: { ...app, fields: cols }, item: child, values: child.values || {} },
    field,
    child.values?.[field.id],
  );
}

// Whether a field has anything in it. Empty fields are left out of a card rather than shown
// as a dash: a sub-item is usually a partial record, and a column of dashes buries the half
// that was filled in.
const filled = (child, field) => {
  const v = child.values?.[field.id];
  if (v == null || v === '') return false;
  return Array.isArray(v) ? v.length > 0 : String(v).trim() !== '';
};

export function createRecordPage(ctx) {
  const {
    appHref, can, companyPath, emptyState, formatDate, h, wbFieldIsEditable, wbFmtVal,
    wbItemCommentsHtml, wbItemTitle, wbTimeAgo, wbUrlControl, state,
    // The inline editor, moved here from main.js: it is only ever reachable from this page, and
    // 12.8 KB of it was riding in the entry chunk for every session that never opens a record.
    actorName, isValidEmail, render, showToast, wbBindRelationshipPickers, wbBindUrlControls,
    wbFind, wbFieldUiReady, wbLoadFieldUi, wbLogActivity, wbMountChecklistFields,
    wbMountDurationFields, wbMountFileFields, wbMountProgressFields, wbNotifyItem, wbPlainVal,
    wbReadFieldInput, wbRenderFieldInput, wbRunAutomations, wbSave, wbSyncLinkedProgress,
  } = ctx;

  // Quick Create binds itself, here, rather than through main.js's action dispatcher: this
  // module is already fetched whenever a record is on screen, and the entry bundle has no room
  // for another case. One delegated listener for the module's life, so re-rendering the card --
  // which every press does -- never leaves a dead handler behind.
  let quickBound = false;
  function bindQuickCreate() {
    if (quickBound || typeof document === 'undefined') return;
    quickBound = true;
    document.addEventListener('click', (event) => {
      const button = event.target.closest?.('[data-wb-quick]');
      if (!button) return;
      event.preventDefault();
      if (button.disabled) return;
      const [companyId, workspaceId, appId, itemId] = String(
        button.closest('[data-wb-quick-seat]')?.dataset.wbQuickSeat || '',
      ).split('|');
      if (!itemId) return;
      // Held while it works: making a field then opening an editor is two awaits, and a second
      // press in between would make a second field.
      button.disabled = true;
      import('./quick-create.js')
        .then((mod) => mod.press(button.dataset.wbQuick, {
          companyId, workspaceId, appId, itemId,
        }, ctx))
        .catch((error) => ctx.showToast?.(error.message || 'That could not be created.', 'error', 'Workspaces'))
        .finally(() => { button.disabled = false; });
    });
  }
  bindQuickCreate();

  /**
   * Click a value, edit it in place, click away to save.
   *
   * The record page used to be read-only with an Edit button that opened the whole record in
   * a modal: four interactions to change one field, and the record you were reading was
   * replaced by a form. Here the value cell IS the control.
   *
   * The input is the SAME markup the modal used -- wbRenderFieldInput out, wbReadFieldInput
   * back -- so every field type is editable inline with no per-type code, and a type added
   * later works here without being taught to. wbReadFieldInput finds its element by
   * [data-f="<field id>"] anywhere in the document, which is why rendering one input on its
   * own is enough.
   *
   * Committing on focusout rather than on a Save button is the whole point of the request,
   * but "focus left" and "focus moved inside my own control" look identical at the moment the
   * event fires -- a <select>'s dropdown, the relationship picker's results list, a file
   * dialog. So the decision is deferred a tick and then asks where focus actually landed.
   */
  // Where the record's cards actually start, measured from the top of the viewport.
  //
  // This replaces a hand-tallied sum. The panels used to be capped at
  // `100vh - chrome - strip - header`, three numbers that had to add up to whatever was above
  // them -- and the moment the header collapsed from two rows to one, the tally was 56px too
  // big and every card stopped short of the bottom with nothing to say why. Fixing the header
  // half of it left the other half still guessed.
  //
  // One measurement of the grid's own top is exact by construction: it already contains the
  // window chrome, the topbar, the app strip and the record header, whatever any of them
  // happen to be doing today. Nothing left to keep in step.
  let gridSizer = null;
  function measureRecordGrid(scope) {
    const grid = scope.querySelector?.('[data-wb-rec-grid]');
    const shell = grid?.closest?.('.quest-app');
    if (!grid || !shell) return;
    const measure = () => {
      const top = Math.round(grid.getBoundingClientRect().top);
      // Read while the surface is scrolled, `top` is smaller than the resting offset and the cap
      // would grow past the screen. The header is sticky, so the resting value is the true one;
      // a scrolled read is discarded rather than written.
      if (top > 0 && !scrolledAway(grid)) shell.style.setProperty('--wb-record-grid-top', `${top}px`);
    };
    measure();
    if (typeof ResizeObserver !== 'function') return;
    // The node is rebuilt by every render, so the old observer watches an element that has gone.
    gridSizer?.disconnect();
    gridSizer = new ResizeObserver(measure);
    gridSizer.observe(grid);
  }

  /** Whether the surface this grid sits in has been scrolled off its top. */
  function scrolledAway(grid) {
    return (grid.closest('.work-surface')?.scrollTop || 0) > 0;
  }

  function wbBindInlineEdits(root, companyId, workspaceId, appId, itemId) {
    const scope = root || document;
    measureRecordGrid(scope === document ? document : (scope.ownerDocument || document));
    scope.querySelectorAll('[data-wb-inline]').forEach((cell) => {
      if (cell.dataset.bound) return;
      cell.dataset.bound = '1';

      const open = (retried = false) => {
        if (cell.dataset.editing) return;
        const { app } = wbFind(companyId, workspaceId, appId);
        const field = app?.fields.find((f) => f.id === cell.dataset.wbInline);
        const item = app?.items.find((i) => i.id === itemId);
        if (!field || !item) return;

        // wbRenderFieldInput returns an EMPTY STRING until its module has been fetched, and
        // that module is only pulled in by the builder modal. Opening an editor cold blanked
        // the cell, and then focusout read no input, got '' back, and wrote it over the real
        // value. So the fetch is awaited before anything is replaced.
        if (!wbFieldUiReady()) {
          // Exactly one retry. A load that resolves without leaving the module usable would
          // otherwise re-enter here forever and hang on the click.
          if (retried) { showToast('The editor could not be loaded. Reload and try again.', 'error', 'Workspaces'); return; }
          wbLoadFieldUi()
            .then(() => open(true))
            .catch(() => showToast('The editor could not be loaded. Reload and try again.', 'error', 'Workspaces'));
          return;
        }

        cell.dataset.editing = '1';
        // Kept so Escape, and any refused save, can put back exactly what was there.
        cell.dataset.was = cell.innerHTML;
        cell.classList.add('is-editing');
        cell.removeAttribute('tabindex');
        cell.removeAttribute('role');
        cell.innerHTML = `<span class="wb-inline-edit">${wbRenderFieldInput(companyId, workspaceId, field, item.values[field.id])}</span>`;
        // The same binders the modal runs, because it is the same markup. All are idempotent
        // and root-scoped, so running them on one cell is safe.
        // Every binder the modal runs over this same markup. Missing one leaves that field
        // type rendered but dead: the checklist drew its tick boxes, delete buttons and
        // "add a step" row and none of them did anything, because nothing had wired them.
        wbMountFileFields(cell);
        wbMountDurationFields(cell);
        wbMountProgressFields(cell);
        wbMountChecklistFields(cell);
        wbBindUrlControls(cell);
        wbBindRelationshipPickers(cell);

        const input = cell.querySelector('[data-f]');
        if (input) {
          input.focus();
          if (typeof input.select === 'function' && ['text', 'textarea', 'number', 'email', 'phone', 'money'].includes(field.type)) input.select();
          // A Yes/No is a one-click control, and the click that opened the editor IS the click
          // that meant to flip it. Without this the first press only swaps a static "No" for a
          // switch that also reads No -- nothing appears to happen, and clicking away commits
          // no -> no, which is what the history recorded. Flipping it here makes one press mean
          // one change; pressing the switch again before leaving still changes it back.
          if (field.type === 'checkbox') input.checked = !input.checked;
        }

        let done = false;
        const close = (commit) => {
          if (done) return;
          done = true;
          document.removeEventListener('pointerdown', onOutside, true);
          if (commit) wbSaveInlineValue(companyId, workspaceId, appId, itemId, field, cell);
          else { cell.innerHTML = cell.dataset.was; wbResetInlineCell(cell); render(); }
        };

        // "When I click outside the card or data, close the field and save it" -- taken
        // literally, because the focus-based version could not be made to behave.
        //
        // It used to commit on focusout once focus was no longer inside the cell. Controls
        // that redraw themselves break that: the checklist rebuilds its body on every tick,
        // which destroys the button you just clicked, so activeElement fell back to <body>
        // and every tick read as "they left" and closed the editor. A file picker did the
        // same by taking focus out of the document entirely.
        //
        // A pointerdown outside the cell is unambiguous: it cannot be caused by anything the
        // editor does to itself, so ticking, uploading and picking from a dropdown all leave
        // it open, and one click anywhere else saves.
        function onOutside(event) {
          if (done || !cell.isConnected) return;
          if (cell.contains(event.target)) return;
          close(true);
        }
        // Capture phase: a handler that stops propagation on its own control must not also
        // stop this from noticing the click happened elsewhere.
        document.addEventListener('pointerdown', onOutside, true);

        // Tabbing away is leaving too, and relatedTarget says where focus went -- unlike
        // activeElement, it is not disturbed by a redraw.
        cell.addEventListener('focusout', (event) => {
          const to = event.relatedTarget;
          if (to && !cell.contains(to)) close(true);
        });

        cell.addEventListener('keydown', (event) => {
          // The "+ Other" box on a choice-chip field owns both keys: Enter adds the option and
          // Escape backs out of the box. Committing the cell instead would save the record
          // without the option the person was halfway through naming.
          if (event.target.closest?.('[data-wb-chip-new-input]')) return;
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(false); return; }
          // Enter saves, except where a newline is a legitimate part of the value.
          if (event.key === 'Enter' && !event.shiftKey && field.type !== 'textarea' && field.type !== 'checklist') {
            event.preventDefault();
            close(true);
          }
        });
      };

      cell.addEventListener('click', (event) => {
        // Anything already interactive inside the value keeps its own behaviour. The same
        // exclusion the row click uses, and for the same reason: a checklist renders its own
        // tick boxes, delete buttons and "add a step" input, and swapping the whole cell for a
        // field editor the moment one is clicked makes the checklist impossible to use.
        if (event.target.closest('a, button, input, select, textarea, label, .wb-check-toggle')) return;
        open();
      });
      cell.addEventListener('keydown', (event) => {
        if (cell.dataset.editing) return;
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    });
  }

  function wbResetInlineCell(cell) {
    delete cell.dataset.editing;
    delete cell.dataset.was;
    cell.classList.remove('is-editing');
  }

  /**
   * Save one field of one record.
   *
   * Deliberately the same tail as the modal's item branch -- stamp, log, notify, run
   * automations with the previous values, persist -- because a change made here is not a
   * lesser kind of change. An inline edit that skipped automations would be a second, quieter
   * way to edit a record, and the two would drift.
   */
  function wbSaveInlineValue(companyId, workspaceId, appId, itemId, field, cell) {
    const { app } = wbFind(companyId, workspaceId, appId);
    const item = app?.items.find((i) => i.id === itemId);
    if (!item) return;

    const restore = () => { cell.innerHTML = cell.dataset.was; wbResetInlineCell(cell); render(); };
    // No input in this cell means nothing was ever editable here -- a renderer that returned
    // nothing, or markup that failed to mount. wbReadFieldInput cannot tell that apart from a
    // field somebody deliberately cleared: both come back as ''. Checked before reading, so a
    // missing editor can never be mistaken for an instruction to erase the value.
    if (!cell.querySelector('[data-f]')) { restore(); return; }

    const value = wbReadFieldInput(field);
    // Generated fields read back as undefined; they are not offered for editing, so this only
    // catches a field that vanished from the app while its editor was open.
    if (value === undefined) { restore(); return; }

    const outcome = wbCommitFieldValue(companyId, workspaceId, appId, itemId, field, value);
    if (outcome.refusal) { showToast(outcome.refusal, 'local', 'Workspaces'); restore(); return; }
    // Unchanged, or the record went away underneath: put the cell back and say nothing.
    if (!outcome.saved) { restore(); return; }
    wbResetInlineCell(cell);
    showToast(`${field.label} saved.`, 'local', 'Workspaces');
    render();
  }

  /**
   * Write one field on one record, with everything an edit is supposed to do.
   *
   * Split out of wbSaveInlineValue so the map pin can write through exactly the same path. An
   * address dropped on the map has to land in the record's history and fire the same automations
   * as one typed into the box; a second copy of that logic is a second thing to keep in step, and
   * the one that is not being looked at is the one that goes stale.
   *
   * Returns { saved, refusal }. `refusal` is a message to show; an unchanged value and a record
   * that has since gone are both "not saved" with nothing to say about it.
   */
  function wbCommitFieldValue(companyId, workspaceId, appId, itemId, field, value) {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    const item = app?.items.find((i) => i.id === itemId);
    if (!item) return { saved: false, refusal: '' };

    const emptied = value === '' || value == null || (Array.isArray(value) && !value.length);
    if (field.required && emptied) return { saved: false, refusal: `"${field.label}" is required.` };
    if (field.type === 'email' && String(value || '').trim() && !isValidEmail(String(value).trim())) {
      return { saved: false, refusal: `"${field.label}" must be a valid email address, e.g. name@company.com.` };
    }

    // Clicking a value and clicking away without touching it is a normal thing to do, and it
    // must not stamp the record as edited or fire automations at everyone.
    const before = item.values[field.id];
    if (JSON.stringify(before ?? '') === JSON.stringify(value ?? '')) return { saved: false, refusal: '' };

    const prev = { ...item.values };
    const stamp = new Date().toISOString();
    item.values = { ...item.values, [field.id]: value };
    // Derived fields first, automations second -- the order the card path already uses. A
    // progress field linked to a checklist is what an automation like "when progress hits
    // 100%" actually watches, so running the rules before recomputing it means the rule reads
    // the old number and never fires. Ticking the last step on a card worked and ticking it
    // here did not, for exactly this.
    wbSyncLinkedProgress(app, item, field.id);
    item.updatedAt = stamp;
    item.lastActivityAt = stamp;
    wbLogActivity(workspace, {
      kind: 'updated', icon: 'ti-pencil', color: '#2563eb', appId: app.id, itemId: item.id,
      text: `Changed <b>${h(field.label)}</b>`,
      changes: [{
        fieldId: field.id,
        label: String(field.label || 'Field'),
        type: field.type,
        from: wbPlainVal(companyId, workspace, app, field, before, item.values),
        to: wbPlainVal(companyId, workspace, app, field, value, item.values),
      }],
    });
    wbNotifyItem(companyId, workspace, app, item, `Updated: ${wbItemTitle(app, item)}`, `${actorName()} updated ${field.label} on ${wbItemTitle(app, item)} in ${app.name}`);
    wbRunAutomations(companyId, workspace, app, item, 'updated', prev);
    wbSave(companyId);
    return { saved: true, refusal: '' };
  }


  /**
   * One sub-item, as a small card of labelled lines.
   *
   * It used to be a single row: one field promoted to a title, the rest crammed into chips
   * that repeated their own field name. That fell apart the moment two sub-items shared a
   * title -- two Dailies both reading "Lumen Marketing Account" told you nothing and gave you
   * no way to tell them apart -- and it meant guessing which field deserved to be the name.
   *
   * Stacked, there is nothing to guess: every field says what it is and shows its value, the
   * way the fields on the record above already read.
   */
  function childRow(companyId, app, collection, cols, child, one, canManage) {
    const val = (field) => childValueHtml(ctx, companyId, app, cols, child, field);
    // Exactly one checkbox reads as "this sub-item is done", so it also strikes the card
    // through. Two or more is a form, and each keeps its own line.
    const boxes = cols.filter((f) => f.type === 'checkbox');
    const box = boxes.length === 1 ? boxes[0] : null;
    const done = box ? child.values[box.id] === true || child.values[box.id] === 'true' : false;

    const tick = (attr, on, label) => `<button type="button" class="wb-child-tick${on ? ' on' : ''}" role="checkbox"
      aria-checked="${on ? 'true' : 'false'}" aria-label="${h(label)}" title="${h(label)}"
      ${attr}${canManage ? '' : ' disabled'}><i class="ti ti-check"></i></button>`;

    const checklistBlock = (f) => {
      const list = (Array.isArray(child.values?.[f.id]) ? child.values[f.id] : []).filter(Boolean);
      if (!list.length) return '';
      return `<div class="wb-child-steps">
        <div class="wb-child-steps-head">${h(f.label)}<span>${list.filter((s) => s.done).length}/${list.length}</span></div>
        <ul>${list.map((s) => `<li class="${s.done ? 'done' : ''}">
          ${tick(`data-wb-child-step="${h(collection.id)}:${h(child.id)}:${h(f.id)}:${h(s.id)}"`, !!s.done, s.label || 'Step')}
          <span class="wb-child-step-label">${h(s.label || 'Step')}</span>
        </li>`).join('')}</ul>
      </div>`;
    };

    // Empty fields are left out rather than shown as a dash. A sub-item is usually a partial
    // record -- a daily filled in at lunchtime has half its fields blank -- and a column of
    // dashes buries the half that was filled in.
    const lines = cols.map((f) => {
      if (f.type === 'checklist') return checklistBlock(f);
      if (f === box) {
        return `<div class="wb-child-field"><span class="wb-child-flabel">${h(f.label)}</span>
          <span class="wb-child-fval">${tick(`data-wb-child-check="${h(collection.id)}:${h(child.id)}:${h(box.id)}"`, done, box.label)}</span></div>`;
      }
      if (!filled(child, f)) return '';
      return `<div class="wb-child-field"><span class="wb-child-flabel">${h(f.label)}</span>
        <span class="wb-child-fval">${val(f)}</span></div>`;
    }).filter(Boolean).join('');

    return `<li class="wb-child-card${done ? ' done' : ''}">
      ${canManage ? `<span class="wb-child-acts">
        <button class="wb-w-btn" type="button" data-wb-child-edit="${h(collection.id)}:${h(child.id)}" title="Edit" aria-label="Edit"><i class="ti ti-pencil"></i></button>
        <button class="wb-w-btn danger" type="button" data-wb-child-del="${h(collection.id)}:${h(child.id)}" title="Delete" aria-label="Delete"><i class="ti ti-trash"></i></button>
      </span>` : ''}
      ${lines || `<p class="wb-sub">Nothing filled in on this ${h(one.toLowerCase())} yet.</p>`}
    </li>`;
  }

  function wbViewItemPage(route, companyId, workspace, app, item) {
    const canManage = can('workspaces.manage', companyId);
    // Carry the deck stage back with you, so returning lands on the filtered list you left
    // rather than dumping you at the top of everything.
    const stage = route.params.get('stage') || '';
    const backHref = appHref(companyPath('workspaces', {
      app_id: app.id, tab: 'items', ...(stage ? { stage } : {}),
    }, companyId));

    // Walking the list without going back to it.
    //
    // Ordered the way the ITEMS LIST is by default -- newest first -- so "next" means the record
    // below the one you opened, not an arbitrary neighbour in storage order. The stage filter is
    // honoured too: having arrived from a filtered deck, stepping through it must stay inside
    // that deck rather than wandering into records the filter excluded.
    const stageField = stage ? pipelineField(app) : null;
    const siblings = sortNewestFirst(
      stageField
        ? (app.items || []).filter((row) => String(row?.values?.[stageField.id] ?? '') === stage)
        : (app.items || []),
    );
    const at = siblings.findIndex((row) => row.id === item.id);
    const stepHref = (row) => appHref(companyPath('workspaces', {
      app_id: app.id, tab: 'items', item_id: row.id, ...(stage ? { stage } : {}),
    }, companyId));
    const prev = at > 0 ? siblings[at - 1] : null;
    const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;
    // Rendered even at the ends, disabled, so the pair does not shift position as you step
    // through — a control that moves under the pointer is one you misclick.
    const stepper = siblings.length > 1 ? `
      <span class="wb-record-step" role="group" aria-label="Move through ${h(app.name)}">
        ${prev
    ? `<a class="wb-w-btn" href="${stepHref(prev)}" data-router title="Previous — ${h(wbItemTitle(app, prev))}" aria-label="Previous record"><i class="ti ti-chevron-left"></i></a>`
    : '<span class="wb-w-btn is-off" aria-disabled="true" title="This is the first one"><i class="ti ti-chevron-left"></i></span>'}
        <span class="wb-record-step-at">${at + 1} of ${siblings.length}</span>
        ${next
    ? `<a class="wb-w-btn" href="${stepHref(next)}" data-router title="Next — ${h(wbItemTitle(app, next))}" aria-label="Next record"><i class="ti ti-chevron-right"></i></a>`
    : '<span class="wb-w-btn is-off" aria-disabled="true" title="This is the last one"><i class="ti ti-chevron-right"></i></span>'}
      </span>` : '';
    // The item is handed over, not withheld. Created / Last modified fields read their value
    // off item.createdAt and item.updatedAt rather than out of values, so with item: null
    // they rendered a dash on every record. canManage stays false, which is what actually
    // suppresses the live checkbox toggle -- that branch needs BOTH, so passing the item
    // alone changes nothing else on this page.
    const ctx = { companyId, workspace, app, values: item.values, item, canManage: false };
    const count = (item.comments || []).length;
    const editing = canManage && state.wbRecordManage;

    // One arrangement per app, shown on every record of it. A record page is a form you read,
    // and a form that changed shape per row would be unreadable.
    const blocks = recordLayout.layoutFor(app);

    // The value IS the control. Clicking it opens the field's real input in place and moving
    // focus away commits, so there is no Edit button, no modal, and no separate "you are now
    // editing" mode to enter or forget to leave.
    //
    // Computed and generated fields -- calculation, rollup, autonumber, created/updated time
    // -- are not offered. There is no input behind them, and wbReadFieldInput returns
    // undefined rather than a value, so a click would promise an edit that could never save.
    const valueCell = (f) => {
      const shown = f.type === 'url' ? wbUrlControl(item.values[f.id]) : wbFmtVal(ctx, f, item.values[f.id]);
      if (!canManage || !wbFieldIsEditable(f)) return `<span class="wb-view-val">${shown}</span>`;
      return `<span class="wb-view-val wb-inline" data-wb-inline="${h(f.id)}" tabindex="0" role="button"
        title="${h(`Click to edit ${f.label}`)}" aria-label="${h(`Edit ${f.label}`)}">${shown}</span>`;
    };

    const fieldRows = (fields) => (fields.length
      ? fields.map((f) => `<div class="wb-view-row"><span class="wb-view-label">${h(f.label)}</span>${valueCell(f)}</div>`).join('')
      : '<div class="wb-sub">No fields in this group yet.</div>');

    const blockBody = (block) => {
      if (block.type === 'comments') return wbItemCommentsHtml(companyId, item);
      if (block.type === 'note') {
        const text = String(block.config?.text || '').trim();
        return `<div class="wb-w-note">${text ? h(text) : emptyState('Add a note in this card’s settings.')}</div>`;
      }
      if (block.type === 'meta') {
        return `<h3 class="wb-w-title">Details</h3><div class="wb-view-fields">
          <div class="wb-view-row"><span class="wb-view-label">Created</span><span class="wb-view-val">${item.createdAt ? h(formatDate(item.createdAt)) : '—'}</span></div>
          <div class="wb-view-row"><span class="wb-view-label">Last edited</span><span class="wb-view-val">${item.updatedAt ? h(wbTimeAgo(item.updatedAt)) : '—'}</span></div>
          <div class="wb-view-row"><span class="wb-view-label">Comments</span><span class="wb-view-val">${count}</span></div>
        </div>`;
      }
      if (block.type === 'collection') {
        // The lists THIS card was told to show, as one strip of tabs with their counts.
        //
        // They used to be one card per list, each repeating its own heading and Add button, so
        // a record with three lists was three headings deep before the first row. Tabs put the
        // names side by side, which is how the job file reads them and how they are used --
        // one list at a time, switching between them.
        //
        // Reading collectionIds AND the older single collectionId means cards saved before the
        // card could show more than one keep working with no migration.
        const wanted = Array.isArray(block.config?.collectionIds) && block.config.collectionIds.length
          ? block.config.collectionIds
          : [block.config?.collectionId].filter(Boolean);
        const tabs = wanted.map((id) => children.findCollection(app, id)).filter(Boolean);
        if (!tabs.length) {
          return `<h3 class="wb-w-title">Sub-items</h3>${emptyState('Tick which sub-item lists this card shows in its settings.')}`;
        }
        const activeId = tabs.some((c) => c.id === state.wbChildTab) ? state.wbChildTab : tabs[0].id;
        const collection = tabs.find((c) => c.id === activeId);
        const rows = children.childrenOf(item, collection.id);
        const cols = collection.fields;
        const one = collection.recordName || collection.name;
        return `
          ${tabs.length > 1 ? `<nav class="wb-child-tabs" aria-label="Sub-item lists">
            ${tabs.map((c) => {
    const n = children.childCount(item, c.id);
    const on = c.id === activeId;
    return `<button type="button" class="wb-child-tab ${on ? 'on' : ''}" data-wb-child-tab="${h(c.id)}"
              aria-current="${on ? 'page' : 'false'}">${h(c.name)}${n ? `<span class="wb-child-tab-n">${n}</span>` : ''}</button>`;
  }).join('')}
            ${canManage ? `<button class="btn btn-sm btn-primary wb-child-tabs-add" type="button" data-wb-child-add="${h(collection.id)}"><i class="ti ti-plus"></i>Add ${h(one)}</button>` : ''}
          </nav>`
    : `<h3 class="wb-w-title">${h(collection.name)}<span class="wb-w-count">${rows.length}</span>
            ${canManage ? `<button class="btn btn-sm btn-primary" type="button" data-wb-child-add="${h(collection.id)}"><i class="ti ti-plus"></i>Add ${h(one)}</button>` : ''}
          </h3>`}
          ${!cols.length
    ? emptyState(`${collection.name} has no fields yet. Add them in the app's Settings.`)
    : rows.length
      ? `<ul class="wb-child-list">${rows.map((child) => childRow(companyId, app, collection, cols, child, one, canManage)).join('')}</ul>`
      : emptyState(`No ${h(collection.name.toLowerCase())} yet.`)}`;
      }
      if (block.type === 'quick') {
        // Only a manager sees it: every entry either adds a field to the app or opens an editor
        // that writes to the record, and neither is a reader's to do. The press is checked again
        // in quick-create.js -- this is the paint, not the gate.
        if (!canManage) return '';
        const buttons = recordLayout.QUICK_CREATE
          // Proposal is declared in the model but has nothing behind it yet, so it is not drawn.
          // A button that does nothing is worse than one that is not there.
          .filter((entry) => entry.field)
          .map((entry) => `
            <button type="button" class="wb-quick-btn" data-wb-quick="${h(entry.key)}"
              title="${h(entry.desc)}">
              <span class="wb-quick-ic" style="color:${h(entry.tone)}"><i class="ti ${h(entry.icon)}"></i></span>
              <span class="wb-quick-label"><b>${h(entry.label)}</b><small>${h(entry.desc)}</small></span>
            </button>`).join('');
        // The seat rides on the card rather than being closed over: the listener below is bound
        // once for the module's life, so it has to read which record it is on at press time.
        return `<h3 class="wb-w-title">Quick Create</h3>
          <div class="wb-quick-grid" data-wb-quick-seat="${h([companyId, workspace.id, app.id, item.id].join('|'))}">${buttons}</div>`;
      }
      const title = String(block.config?.title || '').trim();
      const fields = recordLayout.blockFields(app, block);
      return `${title ? `<h3 class="wb-w-title">${h(title)}</h3>` : ''}<div class="wb-view-fields">${fieldRows(fields)}</div>`;
    };

    const body = `<div class="wb-dash-grid" data-wb-rec-grid>${blocks.map((block, i) => {
        const meta = recordLayout.blockMeta(block.type);
        const tools = editing ? `
          <div class="wb-w-tools">
            <span class="wb-w-grip" title="Drag to reorder" aria-hidden="true"><i class="ti ti-grip-vertical"></i></span>
            <button class="wb-w-btn" type="button" data-wb-rec-move="${h(block.id)}:up" ${i === 0 ? 'disabled' : ''} title="Move earlier" aria-label="Move earlier"><i class="ti ti-chevron-left"></i></button>
            <button class="wb-w-btn" type="button" data-wb-rec-move="${h(block.id)}:down" ${i === blocks.length - 1 ? 'disabled' : ''} title="Move later" aria-label="Move later"><i class="ti ti-chevron-right"></i></button>
            <span class="wb-w-sizes" role="group" aria-label="Width">
              ${[1, 2, 3, 4].map((n) => `<button class="wb-w-size ${block.size === n ? 'on' : ''}" type="button" data-wb-rec-size="${h(block.id)}:${n}" title="${n} column${n === 1 ? '' : 's'}" aria-pressed="${block.size === n}">${n}</button>`).join('')}
            </span>
            ${meta?.config ? `<button class="wb-w-btn" type="button" data-wb-rec-config="${h(block.id)}" title="Settings" aria-label="Settings"><i class="ti ti-settings"></i></button>` : ''}
            <button class="wb-w-btn danger" type="button" data-wb-rec-remove="${h(block.id)}" title="Remove" aria-label="Remove"><i class="ti ti-x"></i></button>
          </div>` : '';
        return `<section class="wb-w wb-w-${h(block.type)} ${editing ? 'editing' : ''}" style="--w-span:${block.size}" data-wb-rec-id="${h(block.id)}" ${editing ? 'draggable="true"' : ''}>${tools}${blockBody(block)}</section>`;
      }).join('')}</div>`;

    // Fields nobody placed would otherwise just be missing from every record, with no hint.
    const missing = blocks && editing ? recordLayout.unplacedFields(app, blocks) : [];
    // The page says WHICH record it is, the same way a row in the list does.
    //
    // Without it a phone cell here opened the call modal, dialled, and noted nothing: the call
    // handler finds its record with closest('[data-item]'), which a list row carries and this
    // page did not -- so the entry was skipped and the modal asked "Call this contact?" instead
    // of naming the person. Anything else that has to answer "which record am I on" from a cell
    // deep inside the layout reads it here too.
    return `
      <div class="wb-record" data-item="${h(item.id)}">
        <div class="wb-record-top">
        <!-- One row, three zones: who this record is on the left, where it sits in the deck in
             the middle, what you can do to it on the right. It was two stacked rows, which spent
             a second line of a sticky header on a back link and a page count. -->
        <header class="wb-record-bar">
          <div class="wb-record-lead">
            <!-- Icon only. The app's name still travels as the accessible name and the tooltip,
                 so "where does this go" is answered on hover and read out by a screen reader --
                 it is the visual label that goes, not the information. -->
            <a class="wb-record-back" href="${backHref}" data-router
               title="All ${h(app.name)}" aria-label="All ${h(app.name)}"><i class="ti ti-arrow-left"></i></a>
            <div class="wb-record-ic" style="background:${h(app.color)}"><i class="ti ${h(app.icon)}"></i></div>
            <div class="wb-record-title">
              <h1>${h(wbItemTitle(app, item)) || 'Item'}</h1>
              <p class="wb-record-meta">${item.createdAt ? `Created ${h(formatDate(item.createdAt))}` : ''}${item.updatedAt && item.updatedAt !== item.createdAt ? ` · edited ${h(wbTimeAgo(item.updatedAt))}` : ''}${count ? ` · ${count} comment${count === 1 ? '' : 's'}` : ''}</p>
            </div>
          </div>
          ${stepper}
          ${canManage ? `<div class="wb-dash-controls">
            <button class="btn btn-sm ${editing ? 'btn-primary' : ''}" type="button" data-wb-rec-manage>${editing ? '<i class="ti ti-check"></i>Done' : '<i class="ti ti-adjustments"></i>Customize'}</button>
            ${editing ? '<button class="btn btn-sm" type="button" data-wb-rec-add><i class="ti ti-plus"></i>Add card</button><button class="btn btn-sm" type="button" data-wb-rec-reset><i class="ti ti-rotate"></i>Reset</button>' : ''}
          </div>` : ''}
        </header>
        ${editing ? '<p class="wb-rec-note">This layout applies to every record in this app.</p>' : ''}
        </div>
        ${missing.length ? `<p class="wb-cal-setup"><i class="ti ti-alert-triangle"></i><span>Not on the page: ${missing.map((f) => h(f.label)).join(', ')}. Add them to a field group, or they will not show on any record.</span></p>` : ''}
        ${body}
      </div>`;
  }

  return { wbViewItemPage, bindInlineEdits: wbBindInlineEdits, commitFieldValue: wbCommitFieldValue };
}
