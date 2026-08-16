// The app's Settings tab: its name, icon, record wording, sub-item lists and where it is
// installed.
//
// Fetched on demand. It is one of seven tabs and the least-visited of them, and it was five
// kilobytes of markup sitting in the entry bundle for every session that never opened it.
// The body is unchanged from where it lived in main.js; everything it calls arrives as ctx
// under the original names, so this is a move rather than a rewrite.

export function createAppSettings(ctx) {
  const {
    h, state, can, wbDoc, singularize, addRecordLabel, wbAppIconGrid, wbAppTabs, WB_ALL_TABS,
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
    // Three cards, each answering one question, rather than one column of fourteen fields.
    //
    // WHAT IT IS -- its name, wording, icon and colour.
    // WHERE IT GOES -- download, install, share, which tabs it shows.
    // WHAT LIVES INSIDE IT -- sub-item lists.
    //
    // Each card is two columns on a wide screen and one on a narrow one, so the icon grid sits
    // beside the name it belongs to rather than pushing everything below it a screen down.
    return `<div class="wb-settings card wb-settings-identity">
      <h3 class="wb-settings-title">App settings</h3>
      <div class="wb-settings-cols">
        <div class="wb-settings-col">
          <div class="wb-field"><label>App name</label><input class="wb-input" id="wbSetName" data-wb-setting="name" value="${h(draft.name ?? app.name)}" ${canManage ? '' : 'disabled'}></div>
          <div class="wb-field"><label>What one record is called</label><input class="wb-input" id="wbSetRecordName" data-wb-setting="recordName" value="${h(draft.recordName ?? app.recordName ?? '')}" placeholder="${h(singularize(app.name))}" ${canManage ? '' : 'disabled'}><small class="wb-hint">Names the buttons — "${h(addRecordLabel(app))}". Left blank it follows the app name.</small></div>
          <div class="wb-field"><label>Description</label><textarea class="wb-input" id="wbSetDesc" data-wb-setting="description" ${canManage ? '' : 'disabled'}>${h(draft.description ?? app.description ?? '')}</textarea></div>
          <div class="wb-field"><label>Type</label><input class="wb-input" id="wbSetType" data-wb-setting="type" value="${h(draft.type ?? app.type ?? '')}" placeholder="e.g. Contacts, Tasks, Projects" ${canManage ? '' : 'disabled'}></div>
        </div>
        <div class="wb-settings-col">
          <div class="wb-field"><label>Icon &amp; color</label>
            <div class="wb-search-box wb-icon-search"><i class="ti ti-search"></i><input type="text" class="wb-search-input" id="wbSetIconSearch" data-wb-app-icon-search placeholder="Search icons…" aria-label="Search icons" ${canManage ? '' : 'disabled'}></div>
            <div class="wb-emoji-pick wb-icon-grid" id="wbSetIcons">${wbAppIconGrid(app.icon)}</div>
            <p class="wb-sub wb-icon-none" id="wbSetIconNone" hidden>No icon matches that.</p>
            <div class="wb-swatches" id="wbSetColors">${WB_PALETTE.map((color) => `<button class="wb-swatch ${app.color === color ? 'sel' : ''}" data-color="${color}" style="background:${color}"></button>`).join('')}<label class="wb-swatch wb-swatch-custom ${isCustomColor ? 'sel' : ''}" data-color="${h(app.color)}" title="Custom color"${isCustomColor ? ` style="background:${h(app.color)}"` : ''}><input type="color" id="wbSetCustomColor" value="${h(isCustomColor ? app.color : '#000000')}" aria-label="Custom color" ${canManage ? '' : 'disabled'}><i class="ti ${isCustomColor ? 'ti-check' : 'ti-plus'}"></i></label></div>
          </div>
        </div>
      </div>
    </div>
    <div class="wb-settings card wb-settings-portability">
      <div class="wb-settings-cols">
        <div class="wb-settings-col">
          <div class="wb-field"><label>Portability</label>
            <div class="wb-sub">Download this app as a <code>.questapp.json</code> file — its fields, ${app.items.length} record${app.items.length === 1 ? '' : 's'}, ${app.automations.length} automation${app.automations.length === 1 ? '' : 's'}, and how it is arranged: card layout, sub-item lists, record layout, dashboard and saved views. Back it up, or install it into another workspace.</div>
            <div class="wb-settings-actions" style="margin-top:10px"><button class="btn" data-wb-download-app><i class="ti ti-download"></i>Download app</button></div>
          </div>
          ${canManage ? wbInstallToWorkspaceField(companyId, workspace, app) : ''}
          <div class="wb-field"><label>Quest App Market</label>
            <div class="wb-sub">${app.shared ? 'This app is <b>shared</b> — anyone on Questbase can install its structure from the Quest App Market: fields, automations, sub-item lists, and how the record, dashboard and views are laid out. Your records are never shared.' : 'Share this app so anyone on Questbase can install its structure from the Quest App Market: fields, automations, sub-item lists, and how the record, dashboard and views are laid out. Your records are never shared.'}</div>
            ${canManage ? `<div class="wb-settings-actions" style="margin-top:10px"><button class="btn ${app.shared ? 'wb-shared-on' : ''}" data-wb-share-app><i class="ti ti-${app.shared ? 'circle-check' : 'share'}"></i>${app.shared ? 'App shared' : 'Share this app'}</button></div>` : ''}
          </div>
        </div>
        <div class="wb-settings-col">
          ${canManage ? tabsField(app) : ''}
          ${canManage ? viewsRailField(app) : ''}
        </div>
      </div>
      ${canManage ? `<div class="wb-settings-actions wb-settings-save"><button class="btn btn-primary" data-save-app><i class="ti ti-device-floppy"></i>Save changes</button><button class="btn danger" data-del-app><i class="ti ti-trash"></i>Delete app</button></div>` : ''}
    </div>
    ${wbCollectionsSettings(companyId, app, canManage)}`;
  }

  // Which tabs this app shows, and in what order.
  //
  // Checkboxes and up/down rather than drag-and-drop: eight rows do not need a drop zone, and
  // arrows work on a phone where dragging a list inside a scrolling page fights the scroll.
  // The save reads the rows in the order they are drawn, so moving one and ticking one are the
  // same action.
  //
  // Settings itself is listed but cannot be moved or hidden. It is the only way back to this
  // setting, and an app that has hidden the door is one somebody has to be dug out of.
  const TAB_NAMES = {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    items: 'Items',
    fields: 'Fields',
    reports: 'Reports',
    automations: 'Automations',
    trash: 'Recycle bin',
    settings: 'Settings',
  };

  function tabsField(app) {
    const showing = wbAppTabs(app);
    // The ones it shows, in its own order, then the ones it does not, so nothing is lost.
    const ordered = [...showing.filter((tab) => tab !== 'settings'),
      ...WB_ALL_TABS.filter((tab) => tab !== 'settings' && !showing.includes(tab))];
    const row = (tab) => `
      <div class="wb-tab-row" data-wb-tab-row="${h(tab)}">
        <label class="wb-tab-show">
          <input type="checkbox" ${showing.includes(tab) ? 'checked' : ''} aria-label="Show ${h(TAB_NAMES[tab])}">
          <span>${h(TAB_NAMES[tab])}</span>
        </label>
        <button type="button" class="wb-icon-btn" data-wb-tab-move="up" title="Move up" aria-label="Move ${h(TAB_NAMES[tab])} up"><i class="ti ti-chevron-up"></i></button>
        <button type="button" class="wb-icon-btn" data-wb-tab-move="down" title="Move down" aria-label="Move ${h(TAB_NAMES[tab])} down"><i class="ti ti-chevron-down"></i></button>
      </div>`;
    return `
      <div class="wb-field"><label>Tabs</label>
        <div class="wb-tab-list">${ordered.map(row).join('')}</div>
        <div class="wb-tab-row wb-tab-fixed" data-wb-tab-row="settings">
          <label class="wb-tab-show"><input type="checkbox" checked disabled aria-label="Settings is always shown"><span>Settings</span></label>
          <span class="wb-sub">Always last</span>
        </div>
        <div class="wb-sub">Untick a tab to hide it, and use the arrows to put them in the order you want. Hiding a tab hides the tab, not the data — Save changes to apply it.</div>
      </div>`;
  }

  // Whether the saved-views panel sits beside the Items list.
  //
  // Hiding it is a layout choice, not a delete: the views stay on the app and come back with
  // the panel. It lives here rather than as a collapse arrow on the panel itself because an
  // app that never groups its records wants the width back permanently, not per visit --
  // which is the same reason the tab strip above is a setting and not a per-session toggle.
  function viewsRailField(app) {
    return `
      <div class="wb-field"><label>Views panel</label>
        <div class="wb-tab-list">
          <div class="wb-tab-row">
            <label class="wb-tab-show">
              <input type="checkbox" id="wbSetViewsRail" ${app.hideViews ? '' : 'checked'}>
              <span>Show the Views panel beside the Items list</span>
            </label>
          </div>
        </div>
        <div class="wb-sub">Untick to give the list the full width. Your saved views are kept — tick it back on and they are all still there. Save changes to apply it.</div>
      </div>`;
  }

  return { wbViewAppSettings };
}
