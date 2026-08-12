// Delete portal, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createPortalDeleteModal(ctx) {
  const {
    clientPortalAnnotationsForPortal, emptyState, h, portalDocumentGroups, renderModalShell,
  } = ctx;

  function renderClientPortalDeleteModal(companyId, portal) {
    if (!portal) return renderModalShell('Client Portal', 'Delete portal', emptyState('Portal not found.'));
    const docs = portalDocumentGroups(portal.id).length;
    const marks = clientPortalAnnotationsForPortal(portal.id).length;
    return renderModalShell('Client Portal', 'Delete portal', `
      <form class="compact-tool-form" data-client-portal-delete-form>
        <input type="hidden" name="portal_id" value="${h(portal.id)}" />
        <div class="form-message error">
          <strong>This permanently deletes "${h(portal.title)}".</strong>
          <span>${docs} plan${docs === 1 ? '' : 's'} and ${marks} markup${marks === 1 ? '' : 's'} will be removed for everyone. This cannot be undone.</span>
        </div>
        <label><span>Type <b>${h(portal.title)}</b> to confirm</span><input name="confirm_name" autocomplete="off" placeholder="${h(portal.title)}" /></label>
        <div class="form-actions">
          <button class="btn danger" type="submit"><i class="ti ti-trash"></i>Delete portal</button>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `, 'task-modal');
  }

  return { renderClientPortalDeleteModal };
}
