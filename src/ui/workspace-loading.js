function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderWorkspaceSkeleton({
  brandMarkup = '',
  statusText = 'Loading workspace data...',
} = {}) {
  return `
    <main class="workspace-skeleton-layout" data-workspace-loading-skeleton role="status" aria-live="polite" aria-busy="true">
      <span class="sr-only">${escapeHtml(statusText)}</span>
      <aside class="workspace-skeleton-rail" aria-hidden="true">
        <div class="workspace-skeleton-brand">
          <span class="workspace-skeleton-brand-mark logo-image-mark">${brandMarkup}</span>
          <span><strong>Questbase</strong><small>workspace</small></span>
        </div>
        <div class="workspace-skeleton-switch workspace-skeleton-block"></div>
        <div class="workspace-skeleton-nav">
          <div class="workspace-skeleton-block is-nav is-wide"></div>
          <div class="workspace-skeleton-block is-nav"></div>
          <div class="workspace-skeleton-block is-nav is-medium"></div>
          <div class="workspace-skeleton-block is-nav is-wide"></div>
          <div class="workspace-skeleton-block is-nav"></div>
          <div class="workspace-skeleton-block is-nav is-short"></div>
        </div>
      </aside>
      <header class="workspace-skeleton-topbar" aria-hidden="true">
        <div class="workspace-skeleton-block is-search"></div>
        <div class="workspace-skeleton-actions">
          <div class="workspace-skeleton-block is-action"></div>
          <div class="workspace-skeleton-block is-action"></div>
          <div class="workspace-skeleton-block is-avatar"></div>
        </div>
      </header>
      <section class="workspace-skeleton-content" aria-hidden="true">
        <div class="workspace-skeleton-block is-eyebrow"></div>
        <div class="workspace-skeleton-block is-title"></div>
        <div class="workspace-skeleton-stat-grid">
          <div class="workspace-skeleton-block is-stat"></div>
          <div class="workspace-skeleton-block is-stat"></div>
          <div class="workspace-skeleton-block is-stat"></div>
          <div class="workspace-skeleton-block is-stat"></div>
        </div>
        <div class="workspace-skeleton-panels">
          <div class="workspace-skeleton-panel">
            <div class="workspace-skeleton-block is-panel-title"></div>
            <div class="workspace-skeleton-block is-row"></div>
            <div class="workspace-skeleton-block is-row"></div>
            <div class="workspace-skeleton-block is-row"></div>
            <div class="workspace-skeleton-block is-row"></div>
          </div>
          <div class="workspace-skeleton-panel">
            <div class="workspace-skeleton-block is-panel-title"></div>
            <div class="workspace-skeleton-block is-card"></div>
            <div class="workspace-skeleton-block is-card"></div>
          </div>
        </div>
      </section>
    </main>
  `;
}
