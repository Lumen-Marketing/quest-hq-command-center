// The app's Items tab: the toolbar, the saved-view rail, the stage and chip filters, and
// whichever of the five layouts is showing.
//
// Fetched on demand, like the Dashboard and Calendar tabs beside it. Six kilobytes of markup
// for one tab is six kilobytes every session pays for whether or not it opens the app.
//
// The body is unchanged from where it lived in main.js; everything it calls arrives as ctx
// under the original names, so this is a move rather than a rewrite.

import { createSummaryBar } from './summary-bar.js';

export function createItemsView(ctx) {
  const {
    h, can, addRecordLabel, pipelineField, wbItemsUI, wbItemsToolbar, wbEvalFilter,
    wbNavStage, wbItemInNavStage, wbChipField, wbItemsChipBar, wbItemInChip, wbSortItems,
    wbApplyPresetSort, wbNavStageLabel, wbChipOptions, appHref, companyPath,
    wbRenderItemsCards, wbRenderItemsBoard, wbRenderItemsBadges, wbRenderItemsActivity,
    wbRenderItemsTable, wbViewsRail, WB_VIEW_MODES, wbPlainVal,
  } = ctx;

  const { summaryBar } = createSummaryBar({ h, wbPlainVal });

  function wbViewItems(companyId, workspace, app) {
    const canManage = can('workspaces.manage', companyId);
    // Designing the app and working its records are separate permissions now. canManage keeps
    // the two buttons that change the APP -- the field builder and stage setup -- while the
    // record affordances below follow the record keys, so a role granted only
    // workspaces.records.create can actually reach the button that creates one.
    const canCreate = can('workspaces.records.create', companyId);
    const canWriteRecords = can('workspaces.records.edit', companyId);
    const canDeleteRecords = can('workspaces.records.delete', companyId);
    if (!app.fields.length) return `<div class="wb-empty"><i class="ti ti-layout-dashboard"></i><h3>This app has no fields yet</h3><p>Before adding items you need to design the app's structure. Add fields like Text, Status, or Date.</p>${canManage ? '<button class="btn btn-primary" data-tab="fields"><i class="ti ti-tools"></i>Open field builder</button>' : ''}</div>`;
    // The toolbar is not rendered with no records, so this is the only way to reach stage
    // setup on a new app -- which is exactly when you want to lay the pipeline out first.
    if (!app.items.length) return `<div class="wb-empty"><i class="ti ti-inbox"></i><h3>No items yet</h3><p>Add your first record using the form built from your custom fields.</p>${canCreate || canManage ? `<div class="wb-empty-acts">${canCreate ? `<button class="btn btn-primary" data-add-item><i class="ti ti-plus"></i>${h(addRecordLabel(app))}</button>` : ''}${canManage ? `<button class="btn" type="button" data-wb-manage-stages><i class="ti ti-adjustments"></i>${pipelineField(app) ? 'Manage stages' : 'Set up stages'}</button>` : ''}</div>` : ''}</div>`;
    const ui = wbItemsUI(app.id);
    // Hidden fields drop out of the table columns but stay fully editable on each
    // record (the item form iterates every field). Fall back to all fields if the
    // user has hidden every one, so the table never renders empty.
    const visibleCols = app.fields.filter((f) => !f.hidden);
    const cols = visibleCols.length ? visibleCols : app.fields;
    // Drop any selected ids that no longer exist (e.g. deleted since selection).
    if (ui.sel.size) { const live = new Set(app.items.map((i) => i.id)); ui.sel.forEach((id) => { if (!live.has(id)) ui.sel.delete(id); }); }
    const toolbar = wbItemsToolbar(companyId, app, ui, canManage);
    // Filter, then sort. A column-header sort (ui.sort) wins; otherwise the toolbar
    // preset (ui.order) orders by created/edited/activity/title.
    let rows = ui.filters.length ? app.items.filter((it) => ui.filters.every((flt) => wbEvalFilter(companyId, workspace, app, it, flt))) : app.items.slice();
    // A stage picked in the deck narrows the list on top of the app's own filters rather than
    // replacing them, so going back to "All items" restores exactly what the user configured.
    const navStage = wbNavStage(app);
    if (navStage) rows = rows.filter((it) => wbItemInNavStage(app, it, navStage));
    // The chip bar counts what is left after search, filters and the deck stage, then narrows
    // on top of them. Built before the chip is applied so the other chips keep their counts.
    const chipField = wbChipField(app, ui);
    const chipBar = wbItemsChipBar(companyId, app, ui, rows);
    if (chipField && ui.chipValue) rows = rows.filter((it) => wbItemInChip(chipField, it, ui.chipValue));
    if (ui.sort && ui.sort.fieldId) { const sf = app.fields.find((x) => x.id === ui.sort.fieldId); if (sf) rows = wbSortItems(companyId, workspace, app, rows, sf, ui.sort.dir); }
    else rows = wbApplyPresetSort(app, rows, ui.order || 'created_desc');
    const selectable = canWriteRecords || canDeleteRecords;
    const bulkBar = (selectable && ui.sel.size) ? `<div class="wb-bulk-bar">
        <span class="wb-bulk-count"><i class="ti ti-checkbox"></i><b>${ui.sel.size}</b> selected</span>
        <div class="wb-spacer"></div>
        <button class="btn btn-sm" type="button" data-wb-select-all-btn><i class="ti ti-checks"></i>Select all</button>
        <button class="btn btn-sm" type="button" data-wb-clear-sel><i class="ti ti-square-x"></i>Clear</button>
        <button class="btn btn-sm" type="button" data-wb-print-sel><i class="ti ti-printer"></i>Print selected</button>
        ${canDeleteRecords ? '<button class="btn btn-sm danger" type="button" data-wb-del-sel><i class="ti ti-trash"></i>Delete selected</button>' : ''}
      </div>` : '';
    let listBody;
    // Name the stage when one is on: "nothing matches your filters" sends you hunting through
    // a filter panel that is empty, when the real cause is the row you clicked in the deck.
    const navStageLabel = navStage ? wbNavStageLabel(app, navStage) : '';
    const chipLabel = (chipField && ui.chipValue)
      ? (wbChipOptions(companyId, app, chipField, app.items).find((c) => c.id === ui.chipValue)?.label || '')
      : '';
    if (!rows.length) listBody = `<div class="wb-empty wb-empty-inline"><i class="ti ti-filter-search"></i><h3>No items match</h3><p>${chipLabel
      ? `Nothing here is <b>${h(chipLabel)}</b>${navStage ? ` and at <b>${h(navStageLabel)}</b>` : ''} right now.`
      : navStage
        ? `Nothing in this app is at <b>${h(navStageLabel)}</b> right now.`
        : 'No records match your current search or filters. Try adjusting or clearing them.'}</p>${(navStage || chipLabel)
      ? `<div class="wb-empty-acts">${chipLabel ? '<button class="btn" type="button" data-wb-chip=""><i class="ti ti-filter-off"></i>Clear quick filter</button>' : ''}${navStage
        ? `<a class="btn" href="${appHref(companyPath('workspaces', { app_id: app.id, tab: 'items' }, companyId))}" data-router><i class="ti ti-list"></i>Show all items</a>` : ''}</div>` : ''}</div>`;
    else if (ui.view === 'card') listBody = wbRenderItemsCards(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords);
    else if (ui.view === 'board') listBody = wbRenderItemsBoard(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords);
    else if (ui.view === 'badge') listBody = wbRenderItemsBadges(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords);
    else if (ui.view === 'activity') listBody = wbRenderItemsActivity(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords);
    else listBody = wbRenderItemsTable(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords);
    const viewLabel = (WB_VIEW_MODES.find(([v]) => v === ui.view) || [])[1] || 'Table';
    // Settings can turn the saved-views panel off, and then the list takes the whole width.
    // Asked before the rail is called, not after: calling it would fetch the saved-views chunk
    // for a panel nobody is going to see.
    const showRail = !app.hideViews;
    // Below the list and always last, whichever layout is showing: a total that moves around
    // is one you have to go looking for. It reads the SELECTED rows when any are ticked, which
    // is what makes it worth having -- tick four and the total is those four.
    const summary = summaryBar(companyId, workspace, app, rows, ui, canManage);
    return `<div class="wb-items-layout${showRail ? '' : ' wb-items-solo'}">${showRail ? wbViewsRail(companyId, app, ui) : ''}<div class="wb-items-main">${toolbar}${chipBar}${bulkBar}<div id="wbItemsList">${listBody}</div>
      ${summary}
      <div class="wb-table-foot"><span data-wb-items-count>${rows.length} item${rows.length === 1 ? '' : 's'}</span>${navStage
      ? ` at <b>${h(navStageLabel)}</b> of ${app.items.length}` : ''} · ${app.fields.length} field${app.fields.length === 1 ? '' : 's'} · ${h(viewLabel)} view</div></div></div>`;
  }

  return { wbViewItems };
}
