// Workspace icon dialog, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createWorkspaceIconModal(ctx) {
  const {
    ICON_COLOR_PRESETS, WORKSPACE_ICON_GROUPS, WORKSPACE_ICON_OPTIONS, WORKSPACE_ICON_PACKS,
    h, renderModalShell, state, workspaceById, workspaceIconDraft, workspaceIconMarkup,
    workspaceIconOption, companyById, workspaceIconSvgMarkup,
  } = ctx;

  function renderWorkspaceIconModal(companyId) {
    const draft = workspaceIconDraft(companyId);
    const selectedKey = workspaceIconOption(draft.icon_key).key;
    return renderModalShell('Workspace', 'Change icon', `
      <div class="workspace-icon-modal">
        <section class="workspace-icon-preview-panel">
          ${workspaceIconMarkup({ ...(companyById(companyId) || {}), icon_key: draft.icon_key, icon_image: draft.icon_image, icon_color: draft.icon_color, icon_pack: draft.icon_pack }, 'large')}
          <div>
            <strong>${h(draft.icon_image ? 'Uploaded icon' : workspaceIconOption(selectedKey).label)}</strong>
            <span>${h(draft.icon_image ? 'This image will be saved when you save workspace settings.' : 'Choose an icon or upload a custom image.')}</span>
          </div>
        </section>
        <section class="workspace-icon-upload-card">
          <div>
            <strong>Upload</strong>
            <span>PNG, JPG, or WebP at any size — large images are resized and compressed automatically. Square logos work best.</span>
          </div>
          <input type="file" accept="image/png,image/jpeg,image/webp" data-workspace-icon-upload />
        </section>
        ${draft.icon_image ? '' : `
          <section class="workspace-icon-color-card" aria-label="Icon color">
            <div>
              <strong>Icon color</strong>
              <span>Applies to the chosen icon wherever it appears. Uploaded images keep their own colours.</span>
            </div>
            <div class="icon-color-choices">
              ${ICON_COLOR_PRESETS.map(([value, label]) => `
                <button class="icon-color-swatch ${draft.icon_color === value ? 'active' : ''}" type="button" data-action="set-workspace-icon-color" data-icon-color="${h(value)}" style="--swatch:${h(value)}" title="${h(label)}" aria-label="${h(label)}" aria-pressed="${draft.icon_color === value ? 'true' : 'false'}"></button>
              `).join('')}
              <label class="icon-color-custom" title="Custom color">
                <input type="color" value="${h(draft.icon_color)}" data-workspace-icon-color aria-label="Custom icon color" />
                <i class="ti ti-palette" aria-hidden="true"></i>
              </label>
            </div>
          </section>
          <section class="workspace-icon-pack-row" aria-label="Icon style">
            <strong>Icon style</strong>
            <div class="appearance-seg" role="group" aria-label="Icon style">
              ${WORKSPACE_ICON_PACKS.map(([id, label]) => `
                <button class="${draft.icon_pack === id ? 'active' : ''}" type="button" data-action="set-workspace-icon-pack" data-icon-pack="${h(id)}" aria-pressed="${draft.icon_pack === id ? 'true' : 'false'}">${h(label)}</button>
              `).join('')}
            </div>
            <span class="wb-sub">Both styles ship with Questbase — nothing is fetched from the internet. Solid uses the line version for icons that have no filled variant.</span>
          </section>
        `}
        <section class="workspace-icon-picker modal-icon-picker" aria-label="Workspace icon choices">
          ${WORKSPACE_ICON_GROUPS.map((group) => `
            <h4 class="workspace-icon-group">${h(group)}</h4>
            <div class="workspace-icon-group-grid">
              ${WORKSPACE_ICON_OPTIONS.filter((item) => item.group === group).map((item) => `
                <button class="workspace-icon-choice ${!draft.icon_image && item.key === selectedKey ? 'active' : ''}" type="button" data-action="select-workspace-icon" data-icon-key="${h(item.key)}" title="${h(item.label)}">
                  ${workspaceIconSvgMarkup(item, draft.icon_pack)}
                  <span>${h(item.label)}</span>
                </button>
              `).join('')}
            </div>
          `).join('')}
        </section>
      </div>
    `, 'wide-modal workspace-icon-modal-panel',
    // Done sits in the header beside Close rather than at the foot of the dialog. The icon
    // grid is long enough to scroll, so a footer button was often off-screen — and every
    // choice in here already applies live, which makes Done a way out rather than a submit.
    `<button class="btn btn-primary" type="button" data-action="close-modal"><i class="ti ti-check"></i>Done</button>`);
  }

  return { renderWorkspaceIconModal };
}
