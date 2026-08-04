// One record of an app, laid out however the app says.
//
// Fetched on demand: you have to click a row to get here, and nothing that paints before
// that click needs it. The layout model is imported directly rather than handed in — it is a
// pure leaf module, so there is no cycle back to main.js, and a static import cannot be
// null the way a fetched one can.

import * as recordLayout from './record-layout.js';

export function createRecordPage(ctx) {
  const {
    appHref, can, companyPath, emptyState, formatDate, h, wbFmtVal, wbItemCommentsHtml,
    wbItemTitle, wbTimeAgo, wbUrlControl, state,
  } = ctx;

  function wbViewItemPage(route, companyId, workspace, app, item) {
    const canManage = can('workspaces.manage', companyId);
    // Carry the deck stage back with you, so returning lands on the filtered list you left
    // rather than dumping you at the top of everything.
    const stage = route.params.get('stage') || '';
    const backHref = appHref(companyPath('workspaces', {
      app_id: app.id, tab: 'items', ...(stage ? { stage } : {}),
    }, companyId));
    const ctx = { companyId, workspace, app, values: item.values, item: null, canManage: false };
    const count = (item.comments || []).length;
    const editing = canManage && state.wbRecordManage;

    // One arrangement per app, shown on every record of it. A record page is a form you read,
    // and a form that changed shape per row would be unreadable.
    const blocks = recordLayout.layoutFor(app);

    const fieldRows = (fields) => (fields.length
      ? fields.map((f) => `<div class="wb-view-row"><span class="wb-view-label">${h(f.label)}</span><span class="wb-view-val">${f.type === 'url' ? wbUrlControl(item.values[f.id]) : wbFmtVal(ctx, f, item.values[f.id])}</span></div>`).join('')
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
    return `
      <div class="wb-record">
        <a class="wb-record-back" href="${backHref}" data-router><i class="ti ti-arrow-left"></i>All ${h(app.name)}</a>
        <header class="wb-record-head">
          <div class="wb-record-ic" style="background:${h(app.color)}"><i class="ti ${h(app.icon)}"></i></div>
          <div class="wb-record-title">
            <h1>${h(wbItemTitle(app, item)) || 'Item'}</h1>
            <p class="wb-record-meta">${item.createdAt ? `Created ${h(formatDate(item.createdAt))}` : ''}${item.updatedAt && item.updatedAt !== item.createdAt ? ` · edited ${h(wbTimeAgo(item.updatedAt))}` : ''}${count ? ` · ${count} comment${count === 1 ? '' : 's'}` : ''}</p>
          </div>
          ${canManage ? `<button class="btn btn-primary" type="button" data-wb-record-edit="${h(item.id)}"><i class="ti ti-pencil"></i>Edit</button>` : ''}
        </header>
        ${canManage ? `<div class="wb-dash-controls">
          <button class="btn btn-sm ${editing ? 'btn-primary' : ''}" type="button" data-wb-rec-manage>${editing ? '<i class="ti ti-check"></i>Done' : '<i class="ti ti-adjustments"></i>Customize layout'}</button>
          ${editing ? '<button class="btn btn-sm" type="button" data-wb-rec-add><i class="ti ti-plus"></i>Add card</button><button class="btn btn-sm" type="button" data-wb-rec-reset><i class="ti ti-rotate"></i>Reset</button>' : ''}
          ${editing ? '<span class="wb-rec-note">This layout applies to every record in this app.</span>' : ''}
        </div>` : ''}
        ${missing.length ? `<p class="wb-cal-setup"><i class="ti ti-alert-triangle"></i><span>Not on the page: ${missing.map((f) => h(f.label)).join(', ')}. Add them to a field group, or they will not show on any record.</span></p>` : ''}
        ${body}
      </div>`;
  }

  return { wbViewItemPage };
}
