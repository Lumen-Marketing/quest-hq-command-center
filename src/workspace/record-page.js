// One record of an app, laid out however the app says.
//
// Fetched on demand: you have to click a row to get here, and nothing that paints before
// that click needs it. The layout model is imported directly rather than handed in — it is a
// pure leaf module, so there is no cycle back to main.js, and a static import cannot be
// null the way a fetched one can.

import * as recordLayout from './record-layout.js';
import * as children from './child-collections.js';

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
  } = ctx;

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
    const ctx = { companyId, workspace, app, values: item.values, item: null, canManage: false };
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
          ${canManage ? '<p class="wb-record-hint"><i class="ti ti-pencil" aria-hidden="true"></i>Click any value to edit it</p>' : ''}
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
