// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

import { addRecordLabel, newRecordLabel } from './naming.js';
import { acceptAttr } from '../security/upload-policy.js';

export function createBuilderModal(ctx) {
  const {
    WB_WS_ICONS, WB_APP_ICONS, WB_FIELD_TYPES, WB_PALETTE, clearableCount,
    can, fileTypeKind, formatDate, h, isLiveSupabaseSession, questLoader, reauthPasswordField, wbActionCardsUI, wbAppReportOptions, wbAvatar, wbColorSwatches, wbCompanyWorkspace, wbDoc, wbFieldConfigUI, wbFileIcon, wbFind, wbFmtVal, wbIconLabel, wbItemCommentsHtml, wbItemTitle, wbMembers, wbModalShell, wbRenderFieldInput, wbStagesModalBody, wbTileLinkRow, wbTimeAgo, wbTrigCfgUI, wbUrlControl, wbWorkspaceApps, renderDashModal, state,
  } = ctx;

  function renderWorkspaceBuilderModal() {
    const m = state.builderModal;
    if (!m) return '';
    if (m.kind === 'confirm') {
      return wbModalShell('Delete', 'wb-modal-sm', `<div class="wb-modal-ic danger"><i class="ti ti-alert-triangle"></i></div><h3>Confirm delete</h3>`,
        `<p class="wb-sub">${h(m.confirm.message)}</p>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" data-wb-confirm><i class="ti ti-trash"></i>Delete</button>`);
    }
    if (m.kind === 'stages') {
      const deleting = !!m.del;
      return wbModalShell('Pipeline', 'wb-modal-md',
        `<div class="wb-modal-ic" style="background:#7c3aed"><i class="ti ti-layout-kanban"></i></div><h3>${deleting ? 'Delete stage' : 'Manage stages'}</h3>`,
        wbStagesModalBody(),
        deleting
          ? `<button class="btn" type="button" data-wb-stage-del-cancel>Back</button><button class="btn danger" type="button" data-wb-stage-del-confirm><i class="ti ti-trash"></i>Delete stage</button>`
          : `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" type="button" data-wb-stages-save><i class="ti ti-device-floppy"></i>Save stages</button>`);
    }
    if (m.kind === 'file-preview') {
      const url = m.url || '';
      const name = m.name || 'File';
      const isData = url.startsWith('data:');
      const kind = fileTypeKind({ file_name: name });
      // Supabase (and most CDNs) honor a `download` query param to force a
      // save-as; data: URLs download via the anchor's download attribute.
      const dlUrl = isData ? url : `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(name)}`;
      const unsupported = (msg) => `<div class="file-preview-empty"><div class="wb-file-unsupported-ico"><i class="ti ${wbFileIcon(kind)}"></i></div><strong>Preview not available</strong><p>${h(msg)}</p></div>`;
      let stage;
      if (!url) stage = unsupported('This file has no stored content to preview.');
      else if (kind === 'image') stage = `<img class="file-preview-media" src="${h(url)}" alt="${h(name)}" />`;
      else if (kind === 'video') stage = `<video class="file-preview-media file-preview-video" src="${h(url)}" controls playsinline preload="metadata"></video>`;
      else if (kind === 'audio') stage = `<div class="file-preview-audio-wrap"><div class="file-preview-audio-ico"><i class="ti ti-music"></i></div><strong>${h(name)}</strong><audio src="${h(url)}" controls preload="metadata"></audio></div>`;
      else if (kind === 'pdf') stage = `<iframe class="file-preview-frame" src="${h(url)}#toolbar=1&navpanes=0" title="${h(name)}"></iframe>`;
      else if (kind === 'text' || kind === 'code') stage = `<iframe class="file-preview-frame text" src="${h(url)}" title="${h(name)}"></iframe>`;
      // Office docs render through Microsoft's viewer, which needs a public URL
      // (works with Supabase signed URLs, not with embedded data: URLs).
      else if (['doc', 'sheet', 'presentation'].includes(kind) && !isData) stage = `<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}" title="${h(name)}"></iframe>`;
      else stage = unsupported("This file type can't be previewed here — open it in a new tab or download it.");
      return wbModalShell('File', 'wb-modal-file', `<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ${wbFileIcon(kind)}"></i></div><h3>${h(name)}</h3>`,
        `<div class="wb-file-stage">${stage}</div>`,
        `<button class="btn" data-action="wb-modal-close">Close</button>
         <a class="btn" href="${h(url)}" target="_blank" rel="noreferrer"><i class="ti ti-external-link"></i>Open in new tab</a>
         <a class="btn btn-primary" href="${h(dlUrl)}" download="${h(name)}"><i class="ti ti-download"></i>Download</a>`);
    }
    if (m.kind === 'delete-workspace') {
      return wbModalShell('Delete workspace', 'wb-modal-sm', `<div class="wb-modal-ic danger"><i class="ti ti-alert-triangle"></i></div><h3>Delete this workspace</h3>`,
        `<p class="wb-sub">This permanently removes <b>${h(m.workspaceName || 'this workspace')}</b> and all of its apps, fields, records, reports and automations. This cannot be undone.</p>
        <div class="wb-field"><label>Enter your password</label><input class="wb-input" id="wbDelPw1" type="password" autocomplete="off" placeholder="Your account password" autofocus></div>
        <div class="wb-field"><label>Re-enter your password to confirm</label><input class="wb-input" id="wbDelPw2" type="password" autocomplete="off" placeholder="Type it again"></div>
        ${m.error ? `<div class="wb-form-error">${h(m.error)}</div>` : ''}`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" data-wb-delete-ws-confirm><i class="ti ti-trash"></i>Delete workspace</button>`);
    }
    if (m.kind === 'collection-field') {
      return wbModalShell('Add field', 'wb-modal-wide',
        `<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-plus"></i></div><h3>Field on ${h(m.collectionName)}</h3>`,
        `<div class="wb-field"><label>Label</label><input class="wb-input" id="wbColFieldLabel" placeholder="e.g. Report date" autofocus></div>
        <div class="wb-field"><label>Type</label><select class="wb-input" id="wbColFieldType">
          ${m.types.map((t) => `<option value="${h(t.type)}">${h(t.label)}</option>`).join('')}
        </select></div>
        <label class="wb-check-row"><input type="checkbox" id="wbColFieldReq"> <span>Required</span></label>
        <p class="wb-sub">Options for a Status or Category field are added after it exists, the same way app fields work.</p>`,
        '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-collection-field-save><i class="ti ti-check"></i>Add field</button>');
    }
    if (m.kind === 'child-item') {
      // Built from the COLLECTION's fields, not the app's — a daily has a date and a crew, and
      // knows nothing about the job's trade or value.
      const body = m.fields.length
        ? m.fields.map((f) => wbRenderFieldInput(m.companyId, m.workspaceId, f, m.draft.values[f.id])).join('')
        : `<div class="wb-sub">${h(m.collectionName)} has no fields yet. Add them in the app's Settings.</div>`;
      return wbModalShell('Sub-item', 'wb-modal-wide',
        `<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-list-check"></i></div><h3>${m.childId ? h(m.recordName) : `New ${h(m.recordName)}`}</h3>`,
        `<div id="wbChildForm">${body}</div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button>${m.fields.length ? `<button class="btn btn-primary" data-wb-child-submit><i class="ti ti-check"></i>${m.childId ? 'Save' : `Add ${h(m.recordName)}`}</button>` : ''}`);
    }
    if (m.kind === 'delete-child') {
      return wbModalShell('Delete', 'wb-modal-sm',
        '<div class="wb-modal-ic danger"><i class="ti ti-alert-triangle"></i></div><h3>Delete this sub-item</h3>',
        '<p class="wb-sub">This removes it from this record. It cannot be undone.</p>',
        '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" data-wb-child-del-confirm><i class="ti ti-trash"></i>Delete</button>');
    }
    if (m.kind === 'memo') {
      const d = m.draft || {};
      // A memo with no reminder is a note on a day, which is a legitimate thing to want. The
      // reminder is opt-in rather than a default, so nothing starts alarming by surprise.
      const remind = d.remindMinutes;
      return wbModalShell('Memo', 'wb-modal-sm',
        `<div class="wb-modal-ic" style="background:#d97706"><i class="ti ti-bell"></i></div><h3>${m.memoId ? 'Edit memo' : 'New memo'}</h3>`,
        `<div class="wb-field"><label>What is it</label>
          <input class="wb-input" data-wb-memo-field="title" value="${h(d.title || '')}" placeholder="e.g. Call the inspector" autofocus />
        </div>
        <div class="wb-field"><label>Note <span class="wb-sub">(optional)</span></label>
          <textarea class="wb-input" rows="2" data-wb-memo-field="note" placeholder="Anything worth remembering">${h(d.note || '')}</textarea>
        </div>
        <div class="wb-row2">
          <div class="wb-field"><label>Date</label>
            <input class="wb-input" type="date" data-wb-memo-field="date" value="${h(d.date || '')}" />
          </div>
          <div class="wb-field"><label>Time <span class="wb-sub">(optional)</span></label>
            <input class="wb-input" type="time" data-wb-memo-field="time" value="${h(d.time || '')}" />
          </div>
        </div>
        <div class="wb-field"><label>Remind me</label>
          <select class="wb-input" data-wb-memo-field="remindMinutes">
            <option value="" ${remind == null ? 'selected' : ''}>Don't remind me</option>
            ${m.remindChoices.map(([mins, label]) => `<option value="${mins}" ${String(remind) === String(mins) ? 'selected' : ''}>${h(label)}</option>`).join('')}
          </select>
        </div>
        <p class="wb-sub">A reminder shows while Questbase is open in a tab, and as a desktop
          notification if you allow it. Nothing is sent by email or push.</p>
        ${d.done ? '<p class="wb-sub"><b>Marked done.</b></p>' : ''}`,
        `${m.memoId ? '<button class="btn danger" data-wb-memo-delete><i class="ti ti-trash"></i>Delete</button>' : ''}
         <button class="btn" data-action="wb-modal-close">Cancel</button>
         ${m.memoId && !d.done ? '<button class="btn" data-wb-memo-done><i class="ti ti-check"></i>Mark done</button>' : ''}
         <button class="btn btn-primary" data-wb-memo-save><i class="ti ti-check"></i>${m.memoId ? 'Save' : 'Add memo'}</button>`);
    }
    if (m.kind === 'record-add') {
      return wbModalShell('Add card', 'wb-modal-wide',
        '<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-list-details"></i></div><h3>Add a card to every record</h3>',
        `<div class="wb-catalog">${m.options.map((opt) => `
          <button class="wb-catalog-item ${opt.supported ? '' : 'blocked'}" type="button" ${opt.supported ? `data-wb-rec-pick="${h(opt.type)}"` : 'disabled'}>
            <i class="ti ${h(opt.icon)}"></i>
            <span><b>${h(opt.label)}</b><small>${opt.supported ? h(opt.desc) : h(opt.blocked)}</small></span>
          </button>`).join('')}</div>`,
        '<button class="btn" data-action="wb-modal-close">Close</button>');
    }
    if (m.kind === 'record-config') {
      const block = m.block;
      const cfg = block.config || {};
      if (block.type === 'collection') {
        // Without this the card fell through to the FIELD checkbox list below, which cannot
        // pick a sub-item list and offers something else entirely.
        return wbModalShell('Card settings', '',
          '<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-settings"></i></div><h3>Sub-items</h3>',
          m.collections.length
            ? `<div class="wb-field"><label>Which lists to show</label>
                <div class="wb-check-list">
                  ${m.collections.map((c) => `<label class="wb-check-row"><input type="checkbox" data-wb-reccfg-collection="${h(c.id)}" ${m.chosenCollections.includes(c.id) ? 'checked' : ''}> <span>${h(c.name)}</span></label>`).join('')}
                </div>
                <p class="wb-sub">Each ticked list becomes a tab on this card. Untick them all and
                  the card shows nothing, so leave at least one.</p></div>`
            : '<p class="wb-sub">This app has no sub-item lists yet. Add one in Settings, then come back.</p>',
          `<button class="btn" data-action="wb-modal-close">Cancel</button>${m.collections.length ? '<button class="btn btn-primary" data-wb-reccfg-save><i class="ti ti-check"></i>Save</button>' : ''}`);
      }
      if (block.type === 'note') {
        return wbModalShell('Card settings', '',
          '<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-settings"></i></div><h3>Note</h3>',
          `<div class="wb-field"><label>Text shown on every record</label><textarea class="wb-input" data-wb-reccfg="text" rows="3">${h(cfg.text || '')}</textarea></div>`,
          '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-reccfg-save><i class="ti ti-check"></i>Save</button>');
      }
      // null means "every field", so a field added later shows up without anyone revisiting
      // the layout. Ticking any box turns that into an explicit list.
      const all = !Array.isArray(cfg.fieldIds);
      const chosen = new Set(Array.isArray(cfg.fieldIds) ? cfg.fieldIds : m.fields.map((f) => f.id));
      return wbModalShell('Card settings', '',
        '<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-settings"></i></div><h3>Field group</h3>',
        `<div class="wb-field"><label>Heading (optional)</label><input class="wb-input" data-wb-reccfg="title" value="${h(cfg.title || '')}" placeholder="e.g. Client details"></div>
        <div class="wb-field"><label>Fields in this group</label>
          <label class="wb-check-row"><input type="checkbox" data-wb-reccfg-all ${all ? 'checked' : ''}> <span>Every field, including ones added later</span></label>
          <div class="wb-check-list" ${all ? 'hidden' : ''}>
            ${m.fields.map((f) => `<label class="wb-check-row"><input type="checkbox" data-wb-reccfg-field="${h(f.id)}" ${chosen.has(f.id) ? 'checked' : ''}> <span>${h(f.label)}</span></label>`).join('') || '<p class="wb-sub">This app has no fields yet.</p>'}
          </div>
        </div>`,
        '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-reccfg-save><i class="ti ti-check"></i>Save</button>');
    }
    if (m.kind === 'delete-view') {
      // No typing the name and no password, unlike deleting an app: a view holds no records,
      // and rebuilding one is a name and a dropdown. The confirmation exists because the X sat
      // next to the row you click to use the view, not because the loss is grave.
      return wbModalShell('Delete view', 'wb-modal-sm',
        '<div class="wb-modal-ic danger"><i class="ti ti-alert-triangle"></i></div><h3>Delete this view</h3>',
        `<p class="wb-sub">This removes <b>${h(m.viewTitle || 'this view')}</b>${m.viewScope === 'team' ? ' for everybody on the team' : ' from this browser'}. Your records are not touched.</p>`,
        '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" data-wb-delete-view-confirm><i class="ti ti-trash"></i>Delete view</button>');
    }
    if (m.kind === 'delete-app') {
      return wbModalShell('Delete app', 'wb-modal-sm', `<div class="wb-modal-ic danger"><i class="ti ti-alert-triangle"></i></div><h3>Delete this app</h3>`,
        `<p class="wb-sub">This permanently removes <b>${h(m.appName || 'this app')}</b> and all ${m.itemCount || 0} record(s), plus its fields, reports and automations. This cannot be undone.</p>
        <div class="wb-field"><label>Type the app name to confirm</label><input class="wb-input" id="wbDelAppName" type="text" autocomplete="off" placeholder="${h(m.appName || '')}" autofocus></div>
        <div class="wb-field"><label>Enter your password</label><input class="wb-input" id="wbDelAppPw1" type="password" autocomplete="off" placeholder="Your account password"></div>
        <div class="wb-field"><label>Re-enter your password to confirm</label><input class="wb-input" id="wbDelAppPw2" type="password" autocomplete="off" placeholder="Type it again"></div>
        ${m.error ? `<div class="wb-form-error">${h(m.error)}</div>` : ''}`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" data-wb-delete-app-confirm><i class="ti ti-trash"></i>Delete app</button>`);
    }
    if (m.kind === 'members') {
      const ws = wbFind(m.companyId, m.workspaceId).workspace;
      return wbModalShell('Members', '', `<div class="wb-modal-ic" style="background:${h(ws.color)}"><i class="ti ti-users"></i></div><h3>Members · ${h(ws.name)}</h3>`,
        `<div class="wb-field"><label>Workspace members</label><div class="wb-member-pick">${wbMembers(m.companyId).map((member) => `<button class="wb-member-opt ${ws.members.includes(member.id) ? 'on' : ''}" data-wb-toggle-member="${h(member.id)}">${wbAvatar(member, 32)}<div class="wb-mo-info"><b>${h(member.name)}</b><span>${h(member.role)} · ${h(member.email)}</span></div><span class="wb-ck"><i class="ti ti-check"></i></span></button>`).join('') || '<div class="wb-sub">No company members found.</div>'}</div><div class="wb-sub">Toggle people in or out of this workspace.</div></div>`,
        `<button class="btn" data-action="wb-modal-close">Done</button>`);
    }
    if (m.kind === 'workspace') {
      const editing = m.editId ? wbFind(m.companyId, m.editId).workspace : null;
      return wbModalShell(editing ? 'Edit workspace' : 'Create workspace', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:${h(m.draft.color)}"><i class="ti ${h(m.draft.icon)}"></i></div><h3>${editing ? 'Edit workspace' : 'Create workspace'}</h3>`,
        `<div class="wb-field"><label>Workspace name</label><input class="wb-input" id="wbWsName" value="${h(m.draft.name ?? editing?.name ?? '')}" placeholder="e.g. Marketing, Field Operations" autofocus></div>
        <div class="wb-field"><label>Description <span class="wb-opt">(optional)</span></label><textarea class="wb-input" id="wbWsDesc" placeholder="What is this workspace for?">${h(m.draft.description ?? editing?.description ?? '')}</textarea></div>
        <div class="wb-row2"><div class="wb-field"><label>Icon</label><div class="wb-emoji-pick">${WB_WS_ICONS.map((icon) => `<button class="wb-emoji-opt ${icon === m.draft.icon ? 'sel' : ''}" type="button" data-wb-pick-icon="${icon}" aria-pressed="${icon === m.draft.icon}" aria-label="Icon ${h(wbIconLabel(icon))}"><i class="ti ${icon}"></i></button>`).join('')}</div></div>
        <div class="wb-field"><label>Color</label>${wbColorSwatches(m.draft.color)}</div></div>
        <div class="wb-field"><label>${editing ? 'Members' : 'Invite members'} <span class="wb-opt">(who collaborates here)</span></label><div class="wb-member-pick">${wbMembers(m.companyId).map((member) => `<button class="wb-member-opt ${m.draft.members.includes(member.id) ? 'on' : ''}" data-wb-toggle-member="${h(member.id)}">${wbAvatar(member, 30)}<div class="wb-mo-info"><b>${h(member.name)}</b><span>${h(member.role)} · ${h(member.email)}</span></div><span class="wb-ck"><i class="ti ti-check"></i></span></button>`).join('') || '<div class="wb-sub">No company members found.</div>'}</div></div>
        ${editing && can('workspaces.manage', m.companyId) ? `
          <div class="wb-field wb-danger-field">
            <label>Activity log</label>
            <div class="wb-sub">This workspace has ${clearableCount(editing)} logged ${clearableCount(editing) === 1 ? 'action' : 'actions'}. Clearing removes them and leaves one entry recording that you did it.</div>
            <div class="wb-sub wb-danger-note"><i class="ti ti-info-circle" aria-hidden="true"></i> Posts and files in the feed are kept, and so is the company audit trail — this only clears this workspace's action log.</div>
            <div class="wb-settings-actions" style="margin-top:10px">
              <button class="btn danger" type="button" data-wb-clear-activity ${clearableCount(editing) ? '' : 'disabled'}><i class="ti ti-eraser"></i>Clear activity log</button>
            </div>
          </div>
        ` : ''}
  `,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-submit><i class="ti ti-check"></i>${editing ? 'Save changes' : 'Create workspace'}</button>`);
    }
    if (m.kind === 'clear-activity') {
      const ws = wbFind(m.companyId, m.workspaceId).workspace;
      const count = clearableCount(ws);
      return wbModalShell('Workspace', 'wb-modal-sm',
        `<div class="wb-modal-ic danger"><i class="ti ti-eraser"></i></div><h3>Clear activity log</h3>`,
        `${m.error ? `<div class="wb-modal-error" role="alert">${h(m.error)}</div>` : ''}
        <p class="wb-sub">This removes <b>${count}</b> logged ${count === 1 ? 'action' : 'actions'} from <b>${h(ws?.name || 'this workspace')}</b>. It cannot be undone.</p>
        <p class="wb-sub">One entry is kept, recording that you cleared the log and how many entries went. Posts and files in the feed are not touched, and neither is the company audit trail.</p>
        ${isLiveSupabaseSession() ? reauthPasswordField('wbClearPw') : ''}`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn danger" type="button" data-wb-confirm-clear-activity><i class="ti ti-eraser"></i>Clear log</button>`);
    }
    if (m.kind === 'app-chooser') {
      if (m.step === 'detail') {
        const entry = (state.wbAppLibrary || []).find((e) => e.app && e.app.id === m.detailAppId);
        if (!entry) { m.step = 'library'; }
        else {
          const a = entry.app;
          const fieldsHtml = (a.fields || []).map((f) => {
            const meta = WB_FIELD_TYPES[f.type] || { label: f.type, icon: 'ti-square', color: '#6b7280' };
            let extra = '';
            if ((f.type === 'category' || f.type === 'status') && f.config && f.config.options) extra = ` · ${f.config.options.length} options`;
            else if (f.type === 'calculation' && f.config && f.config.formula) extra = ` · ${h(f.config.formula)}`;
            else if (f.type === 'relationship') extra = ' · linked record';
            return `<div class="wb-info-row"><span class="wb-info-ic" style="background:${meta.color}22;color:${meta.color}"><i class="ti ${meta.icon}"></i></span><span class="wb-info-label">${h(f.label)}${f.required ? '<span class="wb-req">*</span>' : ''}${f.hidden ? ' <span class="wb-hidden-tag"><i class="ti ti-eye-off"></i>Hidden</span>' : ''}</span><span class="wb-info-type">${h(meta.label)}${extra}</span></div>`;
          }).join('') || '<div class="wb-sub">No fields.</div>';
          const autoHtml = (a.automations || []).length ? a.automations.map((au) => `<div class="wb-info-auto"><i class="ti ti-bolt"></i><b>${h(au.name || 'Automation')}</b>${au.enabled === false ? ' <span class="wb-sub">· off</span>' : ''}</div>`).join('') : '<div class="wb-sub">No automations.</div>';
          return wbModalShell('Add app', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:${h(a.color || '#0891b2')}"><i class="ti ${h(a.icon || 'ti-apps')}"></i></div><h3>${h(a.name)}</h3>`,
            `<div class="wb-info-head">
              <div class="wb-info-source"><i class="ti ti-building"></i>${h(entry.companyLabel)} · ${h(entry.workspaceName)}${a.type ? ` · ${h(a.type)}` : ''}</div>
              ${a.description ? `<p class="wb-info-desc">${h(a.description)}</p>` : ''}
            </div>
            <h4 class="wb-info-title"><i class="ti ti-forms"></i>Fields <span>${(a.fields || []).length}</span></h4>
            <div class="wb-info-fields">${fieldsHtml}</div>
            <h4 class="wb-info-title"><i class="ti ti-bolt"></i>Automations <span>${(a.automations || []).length}</span></h4>
            <div class="wb-info-autos">${autoHtml}</div>
            <div class="wb-sub" style="margin-top:14px">Installing copies these fields &amp; automations into your workspace. Records are not copied.</div>`,
            `<button class="btn" type="button" data-wb-detail-back><i class="ti ti-arrow-left"></i>Back</button><button class="btn" data-action="wb-modal-close">Close</button><button class="btn btn-primary" type="button" data-wb-lib-install data-app-id="${h(a.id)}"><i class="ti ti-download"></i>Install app</button>`);
        }
      }
      if (m.step === 'library') {
        const loading = state.wbAppLibrary === undefined || state.wbAppLibraryLoading;
        const q = (m.q || '').trim().toLowerCase();
        const all = state.wbAppLibrary || [];
        const apps = q ? all.filter((e) => `${e.app.name} ${e.app.description || ''} ${e.app.type || ''} ${e.companyLabel} ${e.workspaceName}`.toLowerCase().includes(q)) : all;
        const cards = loading
          ? '<div class="wb-sub" style="padding:24px;text-align:center"><i class="ti ti-loader"></i> Loading apps…</div>'
          : (apps.map((e) => {
            const meta = { icon: e.app.icon || WB_APP_ICONS[0], color: e.app.color || WB_PALETTE[1] };
            return `<div class="wb-lib-card">
              <div class="wb-lib-ic" style="background:${h(meta.color)}"><i class="ti ${h(meta.icon)}"></i></div>
              <div class="wb-lib-body">
                <b>${h(e.app.name)}</b>
                <div class="wb-lib-meta"><i class="ti ti-forms"></i>${(e.app.fields || []).length} fields · <i class="ti ti-bolt"></i>${(e.app.automations || []).length} automations · <i class="ti ti-building"></i>${h(e.companyLabel)}</div>
              </div>
              <div class="wb-lib-actions"><button class="btn btn-sm" type="button" data-wb-lib-info data-app-id="${h(e.app.id)}"><i class="ti ti-info-circle"></i>More info</button><button class="btn btn-sm btn-primary" type="button" data-wb-lib-install data-app-id="${h(e.app.id)}"><i class="ti ti-download"></i>Install</button></div>
            </div>`;
          }).join('') || `<div class="wb-empty wb-empty-inline"><i class="ti ti-package"></i><h3>No apps yet</h3><p>${q ? 'No shared apps match your search.' : 'No apps have been shared to the market yet. Share one from an app\'s Settings.'}</p></div>`);
        return wbModalShell('Add app', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:#0891b2"><i class="ti ti-building-store"></i></div><h3>Quest App Market</h3>`,
          `<div class="wb-sub" style="margin-bottom:12px">Install apps shared by anyone on Questbase. Installing copies its <b>fields and automations</b> into this workspace — records are not copied.</div>
           <div class="wb-search-box" style="max-width:none;margin-bottom:14px"><i class="ti ti-search"></i><input type="text" class="wb-search-input" data-wb-lib-search value="${h(m.q || '')}" placeholder="Search the app market…"></div>
           <div class="wb-lib-grid" id="wbLibGrid">${cards}</div>`,
          `<button class="btn" type="button" data-wb-chooser-back><i class="ti ti-arrow-left"></i>Back</button><button class="btn" data-action="wb-modal-close">Close</button>`);
      }
      const opt = (key, icon, color, title, desc) => `<button class="wb-chooser-opt" type="button" data-wb-choose="${key}"><span class="wb-chooser-ic" style="background:${color}"><i class="ti ${icon}"></i></span><span class="wb-chooser-text"><b>${h(title)}</b><small>${h(desc)}</small></span><i class="ti ti-chevron-right wb-chooser-arrow"></i></button>`;
      return wbModalShell('Add app', '', `<div class="wb-modal-ic" style="background:#e0552d"><i class="ti ti-apps"></i></div><h3>Add an app</h3>`,
        `<div class="wb-chooser">
          ${opt('create', 'ti-pencil-plus', '#e0552d', 'Create your own app', 'Start from a blank canvas and design fields, reports and automations.')}
          ${opt('file', 'ti-file-import', '#16a34a', 'Install from a file', 'Upload a .questapp.json you downloaded to recreate that app here.')}
          ${opt('library', 'ti-building-store', '#0891b2', 'Quest App Market', 'Browse apps shared by anyone on Questbase and copy one into this workspace.')}
        </div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button>`);
    }
    if (m.kind === 'app') {
      return wbModalShell('Add app', '', `<div class="wb-modal-ic" style="background:${h(m.draft.color)}"><i class="ti ${h(m.draft.icon)}"></i></div><h3>Add app</h3>`,
        `<div class="wb-field"><label>App name</label><input class="wb-input" id="wbApName" value="${h(m.draft.name || '')}" placeholder="e.g. Leads, Projects, Inspections" autofocus></div>
        <div class="wb-field"><label>Description <span class="wb-opt">(optional)</span></label><textarea class="wb-input" id="wbApDesc" placeholder="What does this app track?">${h(m.draft.description || '')}</textarea></div>
        <div class="wb-field"><label>App type <span class="wb-opt">(optional)</span></label><select class="wb-input" id="wbApType"><option value="">— Select a type —</option>${['Contacts', 'Tasks', 'Projects', 'Records', 'Inventory', 'Documents', 'Calendar', 'Tickets', 'Invoices', 'Custom'].map((t) => `<option ${m.draft.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="wb-field"><label>Icon</label>
          <div class="wb-search-box wb-icon-search"><i class="ti ti-search"></i><input type="text" class="wb-search-input" data-wb-icon-search value="${h(m.iconQuery || '')}" placeholder="Search icons…"></div>
          <div class="wb-emoji-pick wb-icon-grid" id="wbAppIcons">${WB_APP_ICONS.map((icon) => `<button class="wb-emoji-opt ${icon === m.draft.icon ? 'sel' : ''}" type="button" aria-pressed="${icon === m.draft.icon}" aria-label="Icon ${h(wbIconLabel(icon))}" data-wb-pick-icon="${icon}" data-icon-name="${h(icon.replace('ti-', '').replace(/-/g, ' '))}"><i class="ti ${icon}"></i></button>`).join('')}</div>
        </div>
        <div class="wb-field"><label>Color</label>${wbColorSwatches(m.draft.color)}</div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-submit><i class="ti ti-plus"></i>Create app</button>`);
    }
    if (m.kind === 'field') {
      const { app } = wbFind(m.companyId, m.workspaceId, m.appId);
      const meta = WB_FIELD_TYPES[m.draft.type];
      return wbModalShell('Field', '', `<div class="wb-modal-ic" style="background:${meta.color}"><i class="ti ${meta.icon}"></i></div><h3>${m.editId ? 'Configure' : 'Add'} ${h(meta.label)} field</h3>`,
        `<div class="wb-field"><label>Field label <span class="wb-opt">(optional)</span></label><input class="wb-input" id="wbFLabel" value="${h(m.draft.label)}" placeholder="${h(meta.label)} field name" autofocus></div>
        <div id="wbFConfig">${wbFieldConfigUI(m.draft, app)}</div>
        <div class="wb-check-row"><label class="wb-switch"><input type="checkbox" id="wbFReq" ${m.draft.required ? 'checked' : ''}><span class="wb-slider"></span></label><div><b>Required field</b><div class="wb-sub">Items can't be saved without it.</div></div></div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-submit><i class="ti ti-check"></i>${m.editId ? 'Save field' : 'Add field'}</button>`);
    }
    if (m.kind === 'item') {
      const { workspace, app } = wbFind(m.companyId, m.workspaceId, m.appId);
      const canManage = can('workspaces.manage', m.companyId);
      const item = m.editId ? app.items.find((i) => i.id === m.editId) : null;
      const cCount = (item?.comments || []).length;
      const meta = item ? `<div class="wb-item-meta">${item.createdAt ? `Created ${h(formatDate(item.createdAt))}` : ''}${item.updatedAt && item.updatedAt !== item.createdAt ? ` · edited ${h(wbTimeAgo(item.updatedAt))}` : ''}${cCount ? ` · ${cCount} comment${cCount === 1 ? '' : 's'}` : ''}</div>` : '';
      const comments = item ? wbItemCommentsHtml(m.companyId, item) : '';
      const header = `<div class="wb-modal-ic" style="background:${h(app.color)}"><i class="ti ${h(app.icon)}"></i></div><h3>${m.editId ? (h(wbItemTitle(app, item)) || 'Item') : h(newRecordLabel(app))}</h3>`;
      // View mode: read-only field list + comment thread. Edit only on request.
      if (m.mode === 'view' && item) {
        const ctx = { companyId: m.companyId, workspace, app, values: item.values, item: null, canManage: false };
        const rows = app.fields.length ? app.fields.map((f) => `<div class="wb-view-row"><span class="wb-view-label">${h(f.label)}</span><span class="wb-view-val">${f.type === 'url' ? wbUrlControl(item.values[f.id]) : wbFmtVal(ctx, f, item.values[f.id])}</span></div>`).join('') : '<div class="wb-sub">This app has no fields yet.</div>';
        return wbModalShell('Item', 'wb-modal-wide', header,
          `<div class="wb-view-fields">${rows}</div>${meta}${comments}`,
          `<button class="btn" data-action="wb-modal-close">Close</button>${canManage ? '<button class="btn btn-primary" data-wb-item-edit><i class="ti ti-pencil"></i>Edit</button>' : ''}`);
      }
      const body = app.fields.map((f) => wbRenderFieldInput(m.companyId, m.workspaceId, f, m.draft.values[f.id])).join('') || '<div class="wb-sub">This app has no fields yet.</div>';
      return wbModalShell('Item', 'wb-modal-wide', header,
        `<div class="wb-field-hint">Every field below is editable — change anything and press Save.</div><div id="wbItemForm">${body}</div>${meta}${comments}`,
        `<button class="btn" ${m.editId ? 'data-wb-item-view' : 'data-action="wb-modal-close"'}>Cancel</button><button class="btn btn-primary" data-wb-submit><i class="ti ti-check"></i>${m.editId ? 'Save' : h(addRecordLabel(app))}</button>`);
    }
    // The two dashboard dialogs are drawn by ./workspace/app-views.js. They only open from
    // the dashboard tab, which has already fetched that module, so their markup rides along
    // with it instead of sitting in the entry chunk for everyone.
    if (m.kind === 'dash-add' || m.kind === 'dash-config') {
      return renderDashModal(m);
    }
    if (m.kind === 'automation') {
      const { app } = wbFind(m.companyId, m.workspaceId, m.appId);
      return wbModalShell('Automation', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:#7c3aed"><i class="ti ti-bolt"></i></div><h3>${m.editId ? 'Edit' : 'New'} automation</h3>`,
        `<div class="wb-field"><label>Automation name</label><input class="wb-input" id="wbAuName" value="${h(m.draft.name)}" placeholder="e.g. Notify owner when deal is Won" autofocus></div>
        <div class="wb-field"><label>When… (trigger)</label><select class="wb-input" id="wbAuEvent" data-wb-auto-event>
          <option value="created" ${m.draft.trigger.event === 'created' ? 'selected' : ''}>An item is created</option>
          <option value="updated" ${m.draft.trigger.event === 'updated' ? 'selected' : ''}>An item is updated</option>
          <option value="field_is" ${m.draft.trigger.event === 'field_is' ? 'selected' : ''}>A field changes to a specific value</option>
          <option value="stage_moves" ${m.draft.trigger.event === 'stage_moves' ? 'selected' : ''}>A record moves between pipeline stages</option>
        </select><div id="wbAuTrigCfg">${wbTrigCfgUI(m.draft, app)}</div></div>
        <div class="wb-field"><label>Then… (actions)</label><div class="wb-action-builder">${wbActionCardsUI(m.companyId, m.draft, app)}</div><button class="btn btn-sm" data-wb-auto-add-action><i class="ti ti-plus"></i>Add action</button></div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-submit><i class="ti ti-check"></i>${m.editId ? 'Save automation' : 'Create automation'}</button>`);
    }
    if (m.kind === 'tile-add') {
      const catalog = [
        ['app', 'ti-layout-grid', 'App records', 'Latest records from an app, paginated'],
        ['report', 'ti-chart-bar', 'Report / Chart', 'A pinned summary chart from an app'],
        ['tasks', 'ti-checklist', 'Workspace tasks', 'Open tasks across the workspace'],
        ['calendar', 'ti-calendar', 'Calendar', 'Upcoming events and due dates'],
        ['contacts', 'ti-address-book', 'Contacts', 'Directory of company contacts'],
        ['jobs', 'ti-hammer', 'Jobs production', 'The production figures, and which of them you want'],
        ['apps', 'ti-apps', 'Apps list', 'Quick links to every app'],
        ['text', 'ti-align-left', 'Text / Banner', 'A custom note or greeting'],
        ['image', 'ti-photo', 'Image', 'A logo or graphic (opens in a lightbox)'],
        ['links', 'ti-link', 'Links', 'Pinned bookmarks and URLs'],
      ];
      return wbModalShell('Add tile', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:#e0552d"><i class="ti ti-layout-board-split"></i></div><h3>Add a dashboard tile</h3>`,
        `<div class="wb-tile-catalog">${catalog.map(([type, icon, title, desc]) => `<button class="wb-tile-cat" type="button" data-wb-tile-pick="${h(type)}"><span class="wb-tile-cat-ic"><i class="ti ${icon}"></i></span><span class="wb-tile-cat-main"><b>${h(title)}</b><span>${h(desc)}</span></span></button>`).join('')}</div>`,
        `<button class="btn" data-action="wb-modal-close">Cancel</button>`);
    }
    if (m.kind === 'tile-config') {
      const workspace = wbCompanyWorkspace(m.companyId);
      const tile = workspace ? (workspace.tiles || []).find((t) => t.id === m.tileId) : null;
      if (!tile) return '';
      // Offer linked apps too -- they are as much a part of this workspace as its own,
      // and excluding them made a linked app impossible to put on a tile.
      const apps = wbWorkspaceApps(wbDoc(m.companyId), workspace).map((r) => r.app);
      const appSelect = (selected) => `<select class="wb-input" data-wb-tilecfg-app>${apps.length ? apps.map((a) => `<option value="${h(a.id)}" ${a.id === selected ? 'selected' : ''}>${h(a.name)}</option>`).join('') : '<option value="">No apps yet</option>'}</select>`;
      let form = '';
      if (tile.type === 'app') form = `<div class="wb-field"><label>Show records from</label>${appSelect(m.draft.appId)}</div>`;
      else if (tile.type === 'report') {
        const app = apps.find((a) => a.id === (m.draft.appId || apps[0]?.id));
        const reportOpts = app ? wbAppReportOptions(app) : [];
        form = `<div class="wb-field"><label>App</label>${appSelect(m.draft.appId || apps[0]?.id)}</div>
          <div class="wb-field"><label>Report</label><select class="wb-input" data-wb-tilecfg-report>${reportOpts.map(([id, label]) => `<option value="${h(id)}" ${id === m.draft.reportId ? 'selected' : ''}>${h(label)}</option>`).join('')}</select><div class="wb-sub">Change the app and reopen to see its reports.</div></div>`;
      } else if (tile.type === 'jobs') {
        // The Jobs dashboard was a fixed page. Here it is parts you tick, so the tile shows
        // what you actually watch rather than everything anyone might.
        const chosen = Array.isArray(m.draft.parts) ? m.draft.parts : m.jobsDefaultParts;
        form = `<div class="wb-field"><label>Title <span class="wb-opt">(optional)</span></label>
            <input class="wb-input" data-wb-tilecfg-title value="${h(m.draft.title || '')}" placeholder="e.g. Production"></div>
          <div class="wb-field"><label>What this tile shows</label>
            <div class="wb-check-list">
              ${m.jobsParts.map(([key, label, why]) => `<label class="wb-check-row">
                <input type="checkbox" data-wb-tilecfg-part="${h(key)}" ${chosen.includes(key) ? 'checked' : ''}>
                <span><b>${h(label)}</b><br><span class="wb-sub">${h(why)}</span></span>
              </label>`).join('')}
            </div>
            <p class="wb-sub">Untick everything and the tile says so rather than rendering an empty box.</p>
          </div>`;
      } else if (tile.type === 'text') form = `<div class="wb-field"><label>Title <span class="wb-opt">(optional)</span></label><input class="wb-input" data-wb-tilecfg-title value="${h(m.draft.title || '')}" placeholder="e.g. Welcome"></div><div class="wb-field"><label>Text</label><textarea class="wb-input" data-wb-tilecfg-body rows="5" placeholder="Write a note, greeting, or announcement…">${h(m.draft.body || '')}</textarea></div>`;
      else if (tile.type === 'image') {
        const uploaded = !!m.draft.objectPath || String(m.draft.url || '').startsWith('data:');
        const previewSrc = m.draft._preview || (String(m.draft.url || '').startsWith('data:') ? m.draft.url : '');
        const preview = previewSrc
          ? `<div class="wb-tilecfg-preview"><img src="${h(previewSrc)}" alt="Image preview"></div>`
          : (uploaded ? `<div class="wb-tilecfg-uploaded"><i class="ti ti-photo-check"></i>Image uploaded</div>` : '');
        form = `
          <div class="wb-field"><label>Upload an image</label>
            <label class="wb-file-drop"><input type="file" hidden accept="${acceptAttr('tileimage')}" data-wb-tilecfg-image><i class="ti ti-photo-up" aria-hidden="true"></i><span>${uploaded ? 'Replace image' : 'Choose an image file (PNG, JPG, WebP, GIF · up to 25 MB)'}</span></label>
          </div>
          ${preview}
          ${uploaded
            ? `<button type="button" class="btn btn-sm" data-wb-tilecfg-image-clear><i class="ti ti-x"></i>Remove uploaded image</button>`
            : `<div class="wb-field"><label>…or paste an image URL <span class="wb-opt">(optional)</span></label><input class="wb-input" data-wb-tilecfg-url type="url" value="${h(m.draft.url || '')}" placeholder="https://…/logo.png"></div>`}
          <div class="wb-field"><label>Caption <span class="wb-opt">(optional)</span></label><input class="wb-input" data-wb-tilecfg-caption value="${h(m.draft.caption || '')}" placeholder="Shown under the image"></div>`;
      }
      else if (tile.type === 'links') {
        const links = (m.draft.links && m.draft.links.length) ? m.draft.links : [{ label: '', url: '' }];
        form = `<div class="wb-field"><label>Title <span class="wb-opt">(optional)</span></label><input class="wb-input" data-wb-tilecfg-title value="${h(m.draft.title || '')}" placeholder="e.g. Resources"></div>
          <div class="wb-field"><label>Links</label><div data-wb-tilecfg-links>${links.map((l) => wbTileLinkRow(l)).join('')}</div><button class="btn btn-sm" type="button" data-wb-tilecfg-addlink><i class="ti ti-plus"></i>Add link</button></div>`;
      }
      return wbModalShell('Configure tile', 'wb-modal-wide', `<div class="wb-modal-ic" style="background:#e0552d"><i class="ti ti-settings"></i></div><h3>Configure tile</h3>`,
        form || '<div class="wb-sub">This tile has no options.</div>',
        `<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" type="button" data-wb-tile-save><i class="ti ti-check"></i>Save tile</button>`);
    }
    return '';
  }

  return { renderWorkspaceBuilderModal };
}
