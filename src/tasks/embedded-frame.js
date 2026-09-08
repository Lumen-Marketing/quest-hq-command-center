const FRAME_SELECTOR = 'iframe.taskapp-frame';
const PLACEHOLDER_SELECTOR = '[data-task-frame-placeholder]';

function frameKey(frame) {
  return String(frame?.dataset?.persistKey || frame?.getAttribute?.('src') || '');
}

/**
 * Render a no-network placeholder when the requested Tasks document is already mounted.
 * The host swaps the existing iframe into this spot after replacing its own markup.
 */
export function embeddedTaskFrameMarkup(root, src, escapeHtml = String) {
  const key = String(src || '');
  const existing = root?.querySelector?.(FRAME_SELECTOR);
  if (existing && frameKey(existing) === key) {
    return `<div class="taskapp-frame" data-task-frame-placeholder data-persist-key="${escapeHtml(key)}" aria-hidden="true"></div>`;
  }
  return `<iframe class="taskapp-frame" src="${escapeHtml(key)}" data-persist-key="${escapeHtml(key)}" title="Task management"></iframe>`;
}

function syncAttributes(target, source) {
  if (!target || !source) return;
  Array.from(target.attributes || []).forEach((attribute) => {
    if (!source.hasAttribute(attribute.name)) target.removeAttribute(attribute.name);
  });
  Array.from(source.attributes || []).forEach((attribute) => {
    target.setAttribute(attribute.name, attribute.value);
  });
}

function replaceSection(currentRoot, nextRoot, selector) {
  const current = currentRoot?.querySelector?.(selector);
  const next = nextRoot?.querySelector?.(selector);
  if (current && next) current.replaceWith(next);
  else if (current && !next) current.remove();
}

/**
 * Paint a fresh Questbase shell without ever disconnecting the live Tasks iframe.
 *
 * Moving an iframe out and back in is not preservation: browsers destroy its browsing
 * context at the first removal. When the next shell asks for the exact same Tasks URL,
 * update only the chrome around the stable work surface and replace root-level overlays.
 * A route/workspace/task change emits a real iframe instead of a placeholder and falls
 * back to the normal full render.
 */
export function renderShellPreservingTaskFrame(root, html) {
  const frame = root?.querySelector?.(FRAME_SELECTOR);
  if (!frame || typeof document === 'undefined') return false;

  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const placeholder = template.content.querySelector(PLACEHOLDER_SELECTOR);
  if (!placeholder || frameKey(placeholder) !== frameKey(frame)) return false;

  const currentApp = frame.closest?.('.quest-app');
  const nextApp = placeholder.closest?.('.quest-app');
  const currentSurface = frame.closest?.('.work-surface');
  const nextSurface = placeholder.closest?.('.work-surface');
  if (!currentApp || !nextApp || !currentSurface || !nextSurface) return false;

  syncAttributes(currentApp, nextApp);
  syncAttributes(currentSurface, nextSurface);
  replaceSection(currentApp, nextApp, ':scope > .topbar');
  replaceSection(currentApp, nextApp, ':scope > .shell-banners');
  replaceSection(currentApp, nextApp, '.app-body > .deck');
  replaceSection(currentApp, nextApp, ':scope > .mobile-tabbar');
  replaceSection(currentApp, nextApp, ':scope > .mobile-more-sheet');

  // Modals, command palette, message dock and diagnostics are siblings of .quest-app.
  // They can be replaced freely because none is an ancestor of the Tasks document.
  Array.from(root.children || []).forEach((child) => {
    if (child !== currentApp) child.remove();
  });
  Array.from(template.content.children || []).forEach((child) => {
    if (child !== nextApp) root.appendChild(child);
  });
  return true;
}
