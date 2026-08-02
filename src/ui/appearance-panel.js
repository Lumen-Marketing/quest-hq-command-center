// The Appearance panel in Settings: theme, accent, background, side menu and card style.
//
// Fetched on demand. It renders only on a settings page, so none of it is needed to
// paint the app, and the picker previews plus six preset definitions are not small.
//
// A factory so the panel and its swatch can keep calling each other by name, with the
// main.js helpers and constant tables closed over once instead of threaded through
// every call. The bodies are unchanged from where they lived in main.js.
//
// renderAccountThemeControls is NOT here: the account popover renders it on first paint,
// so it has to stay eager. It is passed in, and the panel embeds it.

export function createAppearancePanel(ctx) {
  const {
    h, getAppearance, canManageCompanyAppearance, sidebarThemeVars, renderAccountThemeControls,
    APPEARANCE_BG_PRESETS, SIDEBAR_THEMES,
  } = ctx;

  function sidebarThemeSwatch(vars) {
    const v = vars || { bg: 'linear-gradient(180deg,#0c0d10 0%,#08090b 100%)', text: 'rgba(255,248,232,.42)', activeBg: 'rgba(224,85,45,.22)', activeText: '#e0552d' };
    return `<span class="appearance-side-mini" style="background:${h(v.bg)}" aria-hidden="true">
        <i style="background:${h(v.text)}"></i>
        <i class="on" style="background:${h(v.activeBg)};box-shadow:inset 2px 0 ${h(v.activeText)}"></i>
        <i style="background:${h(v.text)}"></i>
      </span>`;
  }

  function renderAppearanceControls() {
    const a = getAppearance();
    const bgIs = (type, preset) => a.bgType === type && (type !== 'preset' || a.bgPreset === preset);
    return `
      <div class="appearance-controls">
        ${renderAccountThemeControls()}
        <div class="appearance-section">
          <div class="appearance-section-head"><i class="ti ti-photo"></i><span>Background</span></div>
          <div class="appearance-bg-grid">
            <button class="appearance-bg-chip ${a.bgType === 'default' ? 'active' : ''}" type="button" data-action="set-appearance-bg" data-bg-type="default">
              <span class="appearance-bg-swatch bg-default"></span>Default
            </button>
            ${APPEARANCE_BG_PRESETS.map(([key, label]) => `
              <button class="appearance-bg-chip ${bgIs('preset', key) ? 'active' : ''}" type="button" data-action="set-appearance-bg" data-bg-type="preset" data-bg-preset="${h(key)}">
                <span class="appearance-bg-swatch bg-${h(key)}"></span>${h(label)}
              </button>
            `).join('')}
            <button class="appearance-bg-chip ${a.bgType === 'image' ? 'active' : ''}" type="button" data-action="open-appearance-bg-upload">
              <span class="appearance-bg-swatch bg-upload"${a.bgType === 'image' && a.bgImage ? ` style="background-image:url('${h(a.bgImage)}');background-size:cover;background-position:center"` : ''}><i class="ti ti-upload"></i></span>${a.bgType === 'image' ? 'Uploaded' : 'Upload image'}
            </button>
            <input type="file" accept="image/png,image/jpeg,image/webp" data-appearance-bg-upload hidden />
          </div>
        </div>
        <div class="appearance-section">
          <div class="appearance-section-head"><i class="ti ti-layout-sidebar-left-collapse"></i><span>Side menu</span></div>
          <div class="appearance-side-grid">
            ${SIDEBAR_THEMES.map(([id, label, vars]) => `
              <button class="appearance-side-chip ${a.sidebarTheme === id ? 'active' : ''}" type="button" data-action="set-sidebar-theme" data-sidebar-theme="${h(id)}" aria-pressed="${a.sidebarTheme === id ? 'true' : 'false'}">
                ${sidebarThemeSwatch(vars)}<span>${h(label)}</span>
              </button>
            `).join('')}
            <button class="appearance-side-chip ${a.sidebarTheme === 'custom' ? 'active' : ''}" type="button" data-action="set-sidebar-theme" data-sidebar-theme="custom" aria-pressed="${a.sidebarTheme === 'custom' ? 'true' : 'false'}">
              ${sidebarThemeSwatch(sidebarThemeVars({ ...a, sidebarTheme: 'custom' }))}<span>Custom</span>
            </button>
          </div>
          ${a.sidebarTheme === 'custom' ? `
            <label class="appearance-field"><span>Menu color</span><input type="color" value="${h(a.sidebarBg)}" data-appearance-sidebar-bg /></label>
            <label class="appearance-field"><span>Highlight color</span><input type="color" value="${h(a.sidebarAccent)}" data-appearance-sidebar-accent /></label>
          ` : ''}
          ${a.sidebarTheme !== 'default' ? `
            <label class="appearance-field">
              <span>Text color</span>
              <span class="appearance-field-pair">
                <input type="color" value="${h(a.sidebarText || '#ffffff')}" data-appearance-sidebar-text />
                ${a.sidebarText ? '<button class="btn btn-sm" type="button" data-action="clear-sidebar-text">Auto</button>' : ''}
              </span>
            </label>
            <div class="appearance-hint">${a.sidebarText
    ? 'Using your chosen color. Switch back to <b>Auto</b> to let each preset pick light or dark text to suit its background.'
    : 'Set automatically — each preset picks light or dark text to suit its background. Pick a color here to override it.'}</div>
          ` : ''}
        </div>
        <div class="appearance-section">
          <div class="appearance-section-head"><i class="ti ti-square-rounded"></i><span>Cards</span></div>
          <div class="appearance-seg" role="group" aria-label="Card style">
            ${[['default', 'Default'], ['solid', 'Solid'], ['glass', 'Glass']].map(([id, label]) => `
              <button class="${a.cardStyle === id ? 'active' : ''}" type="button" data-action="set-appearance-card-style" data-card-style="${id}" aria-pressed="${a.cardStyle === id ? 'true' : 'false'}">${h(label)}</button>
            `).join('')}
          </div>
          ${a.cardStyle === 'solid' ? `
            <label class="appearance-field"><span>Card color</span><input type="color" value="${h(a.cardColor)}" data-appearance-card-color /></label>
          ` : ''}
          ${a.cardStyle === 'glass' ? `
            <label class="appearance-field"><span>Tint color</span><input type="color" value="${h(a.cardColor)}" data-appearance-card-color /></label>
            <label class="appearance-range"><span>Opacity <b data-appearance-out="opacity">${a.cardOpacity}%</b></span><input type="range" min="20" max="100" step="1" value="${a.cardOpacity}" data-appearance-range="cardOpacity" /></label>
            <label class="appearance-range"><span>Blur <b data-appearance-out="blur">${a.cardBlur}px</b></span><input type="range" min="0" max="40" step="1" value="${a.cardBlur}" data-appearance-range="cardBlur" /></label>
          ` : ''}
        </div>
        <div class="appearance-actions">
          <button class="btn appearance-reset" type="button" data-action="reset-appearance"><i class="ti ti-rotate-2"></i>Reset to default</button>
          ${canManageCompanyAppearance() ? `
            <button class="btn btn-primary" type="button" data-action="save-company-appearance"><i class="ti ti-building-community"></i>Set as company default</button>
          ` : ''}
        </div>
        ${canManageCompanyAppearance()
          ? '<p class="appearance-note">Members who have not chosen their own theme will use the company default. Anyone who sets their own keeps it.</p>'
          : ''}
      </div>
    `;
  }

  return renderAppearanceControls;
}
