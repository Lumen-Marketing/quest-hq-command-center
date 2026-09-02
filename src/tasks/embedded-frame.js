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

/**
 * Detach the live iframe before the host replaces its innerHTML, then return a one-shot
 * restorer. If the new route asks for a different Tasks URL, the old frame stays discarded.
 */
export function retainEmbeddedTaskFrame(root) {
  const frame = root?.querySelector?.(FRAME_SELECTOR);
  if (!frame) return () => false;

  const key = frameKey(frame);
  frame.remove();

  return () => {
    const placeholders = Array.from(root?.querySelectorAll?.(PLACEHOLDER_SELECTOR) || []);
    const target = placeholders.find((node) => frameKey(node) === key);
    if (!target) return false;
    target.replaceWith(frame);
    return true;
  };
}
