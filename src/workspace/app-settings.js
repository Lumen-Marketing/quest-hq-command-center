// The app's Settings tab: its name, icon, record wording, sub-item lists and where it is
// installed.
//
// Fetched on demand. It is one of seven tabs and the least-visited of them, and it was five
// kilobytes of markup sitting in the entry bundle for every session that never opened it.
// The body is unchanged from where it lived in main.js; everything it calls arrives as ctx
// under the original names, so this is a move rather than a rewrite.

export function createAppSettings(ctx) {
  const {
    h, state, can, wbDoc, singularize, addRecordLabel, wbAppIconGrid,
    wbInstallToWorkspaceField, wbCollectionsSettings, WB_PALETTE,
  } = ctx;

  function wbViewAppSettings(companyId, workspace, app, appLinked = false) {
    const canManage = can('workspaces.manage', companyId);
    const isCustomColor = !WB_PALETTE.includes(app.color);
    // Unsaved edits, so a render triggered by something else on this page does not discard
    // them. Cleared once Save writes them through.
    const draft = state.wbSettingsDraft?.[app.id] || {};
    // A linked app is a live mirror installed from another workspace. Its fields,
    // records, name and icon belong to the source and are managed there; here we
    // only explain the link and offer to remove it from this workspace.
    if (appLinked) {
      const entry = (workspace.apps || []).find((a) => a.id === app.id && a.linked);
      const src = wbDoc(companyId)?.workspaces.find((w) => w.id === entry?.linkedFromWs);
      return `<div class="wb-settings card">
        <h3 class="wb-settings-title"><i class="ti ti-link" aria-hidden="true"></i> Linked app</h3>
        <div class="wb-field">
          <div class="wb-linked-note"><i class="ti ti-link"></i><div><b>${h(app.name)}</b> is installed here from <b>${h(src?.name || 'another workspace')}</b>. Its fields and records are <b>shared</b> — edits from either workspace sync both ways in real time.</div></div>
        </div>
        ${canManage ? `<div class="wb-settings-actions"><button class="btn danger" data-wb-remove-linked><i class="ti ti-unlink"></i>Remove from this workspace</button></div><div class="wb-sub" style="margin-top:8px">Removing only takes it out of this workspace. The original app and its data are untouched.</div>` : '<div class="wb-sub">Ask a workspace manager to remove this linked app.</div>'}
      </div>`;
    }
    return `<div class="wb-settings card">
      <h3 class="wb-settings-title">App settings</h3>
      <div class="wb-field"><label>App name</label><input class="wb-input" id="wbSetName" data-wb-setting="name" value="${h(draft.name ?? app.name)}" ${canManage ? '' : 'disabled'}></div>
      <div class="wb-field"><label>What one record is called</label><input class="wb-input" id="wbSetRecordName" data-wb-setting="recordName" value="${h(draft.recordName ?? app.recordName ?? '')}" placeholder="${h(singularize(app.name))}" ${canManage ? '' : 'disabled'}><small class="wb-hint">Names the buttons — "${h(addRecordLabel(app))}". Left blank it follows the app name.</small></div>
      <div class="wb-field"><label>Description</label><textarea class="wb-input" id="wbSetDesc" data-wb-setting="description" ${canManage ? '' : 'disabled'}>${h(draft.description ?? app.description ?? '')}</textarea></div>
      <div class="wb-field"><label>Type</label><input class="wb-input" id="wbSetType" data-wb-setting="type" value="${h(draft.type ?? app.type ?? '')}" placeholder="e.g. Contacts, Tasks, Projects" ${canManage ? '' : 'disabled'}></div>
      <div class="wb-field"><label>Icon &amp; color</label>
        <div class="wb-emoji-pick" id="wbSetIcons">${wbAppIconGrid(app.icon)}</div>
        <div class="wb-swatches" id="wbSetColors">${WB_PALETTE.map((color) => `<button class="wb-swatch ${app.color === color ? 'sel' : ''}" data-color="${color}" style="background:${color}"></button>`).join('')}<label class="wb-swatch wb-swatch-custom ${isCustomColor ? 'sel' : ''}" data-color="${h(app.color)}" title="Custom color"${isCustomColor ? ` style="background:${h(app.color)}"` : ''}><input type="color" id="wbSetCustomColor" value="${h(isCustomColor ? app.color : '#000000')}" aria-label="Custom color" ${canManage ? '' : 'disabled'}><i class="ti ${isCustomColor ? 'ti-check' : 'ti-plus'}"></i></label></div>
      </div>
      <div class="wb-field"><label>Portability</label>
        <div class="wb-sub">Download this app as a <code>.questapp.json</code> file — its fields, ${app.items.length} record${app.items.length === 1 ? '' : 's'}, ${app.automations.length} automation${app.automations.length === 1 ? '' : 's'}, and how it is arranged: card layout, sub-item lists, record layout, dashboard and saved views. Back it up, or install it into another workspace.</div>
        <div class="wb-settings-actions" style="margin-top:10px"><button class="btn" data-wb-download-app><i class="ti ti-download"></i>Download app</button></div>
      </div>
      ${canManage ? wbInstallToWorkspaceField(companyId, workspace, app) : ''}
      <div class="wb-field"><label>Quest App Market</label>
        <div class="wb-sub">${app.shared ? 'This app is <b>shared</b> — anyone on Questbase can install its structure from the Quest App Market: fields, automations, sub-item lists, and how the record, dashboard and views are laid out. Your records are never shared.' : 'Share this app so anyone on Questbase can install its structure from the Quest App Market: fields, automations, sub-item lists, and how the record, dashboard and views are laid out. Your records are never shared.'}</div>
        ${canManage ? `<div class="wb-settings-actions" style="margin-top:10px"><button class="btn ${app.shared ? 'wb-shared-on' : ''}" data-wb-share-app><i class="ti ti-${app.shared ? 'circle-check' : 'share'}"></i>${app.shared ? 'App shared' : 'Share this app'}</button></div>` : ''}
      </div>
      ${canManage ? `<div class="wb-settings-actions"><button class="btn btn-primary" data-save-app><i class="ti ti-device-floppy"></i>Save changes</button><button class="btn danger" data-del-app><i class="ti ti-trash"></i>Delete app</button></div>` : ''}
    </div>
    ${wbCollectionsSettings(companyId, app, canManage)}`;
  }

  return { wbViewAppSettings };
}
