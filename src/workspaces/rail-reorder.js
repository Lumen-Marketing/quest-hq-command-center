// Dragging the workspace rail into a different order.
//
// Fetched on demand: only a workspace manager can reorder, the rail paints perfectly well
// without this, and nothing here is needed until somebody actually picks a row up.
//
// The order is company-wide, so the commit goes to the server. `reorder_operational_workspaces`
// is SECURITY DEFINER and re-checks company-admin there -- the markup gate in main.js is a
// convenience, not the permission.

export function createWorkspaceRailReorder(ctx) {
  const {
    activeCompanyId, allowedOperationalWorkspaces, canonicalCompanyId, createSupabaseClient,
    normalizeOperationalWorkspace, render, showToast, state,
  } = ctx;

  // Held here, not on the node: render() replaces the rail and a drag survives that.
  let dragId = '';

  // Move `movedId` to where `targetId` sits, then send the whole list. Sending the full
  // order rather than two positions means the server never has to reconcile a partial move
  // against what it already had.
  function reorderedWorkspaceIds(ids, movedId, targetId) {
    const without = ids.filter((id) => id !== movedId);
    const at = without.indexOf(targetId);
    if (at < 0) return ids;
    // Dropping onto a row below you lands after it, above you lands before it -- which is
    // what the pointer is over at the moment of release.
    const before = ids.indexOf(movedId) < ids.indexOf(targetId);
    without.splice(before ? at + 1 : at, 0, movedId);
    return without;
  }

  async function saveWorkspaceRailOrder(movedId, targetId) {
    const companyId = activeCompanyId();
    const ordered = reorderedWorkspaceIds(allowedOperationalWorkspaces(companyId).map((workspace) => workspace.id), movedId, targetId);
    // Snapshot before touching anything: a rejected reorder has to go back exactly, and
    // re-deriving the old order afterwards would just read the optimistic values.
    const previous = new Map(state.operationalWorkspaces.map((workspace) => [workspace.id, workspace.position]));
    // Painted straight away. A drag that only lands after a network round trip reads as a
    // drag that did not work, and people drop the same row again.
    ordered.forEach((id, index) => {
      const workspace = state.operationalWorkspaces.find((item) => item.id === id);
      if (workspace) workspace.position = index + 1;
    });
    render();
    const client = createSupabaseClient();
    if (!client) return;
    const { data, error } = await client.rpc('reorder_operational_workspaces', {
      target_company_id: canonicalCompanyId(companyId),
      workspace_ids: ordered,
    });
    if (error) {
      // Put it back. Leaving the rail showing an order the server rejected is worse than the
      // drag appearing to fail, because the next reload silently undoes it.
      state.operationalWorkspaces.forEach((workspace) => {
        if (previous.has(workspace.id)) workspace.position = previous.get(workspace.id);
      });
      render();
      throw new Error(error.message || 'Could not save the new order.');
    }
    // The RPC returns the company's rows in their saved order, so take those as
    // authoritative rather than trusting the optimistic guess.
    if (Array.isArray(data) && data.length) {
      const saved = new Map(data.map((row) => [String(row.id), normalizeOperationalWorkspace(row)]));
      state.operationalWorkspaces = state.operationalWorkspaces.map((workspace) => saved.get(workspace.id) || workspace);
      render();
    }
  }

  function mount() {
    const list = document.querySelector('.workspace-rail-list[data-workspace-reorder]');
    if (!list) return;
    const items = [...list.querySelectorAll('.workspace-rail-item[draggable="true"]')];
    if (items.length < 2) return;
    const clear = () => items.forEach((node) => node.classList.remove('dragging', 'drop-target'));
    items.forEach((item) => {
      item.addEventListener('dragstart', (event) => {
        dragId = item.dataset.workspaceId;
        item.classList.add('dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          // Firefox refuses to start a drag unless some data is set.
          try { event.dataTransfer.setData('text/plain', item.dataset.workspaceId); } catch { /* ignore */ }
        }
      });
      item.addEventListener('dragend', () => { dragId = ''; clear(); });
      item.addEventListener('dragover', (event) => {
        if (!dragId || dragId === item.dataset.workspaceId) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        item.classList.add('drop-target');
      });
      item.addEventListener('dragleave', () => item.classList.remove('drop-target'));
      item.addEventListener('drop', (event) => {
        event.preventDefault();
        const from = dragId || event.dataTransfer?.getData('text/plain') || '';
        const to = item.dataset.workspaceId;
        dragId = '';
        clear();
        if (!from || from === to) return;
        saveWorkspaceRailOrder(from, to).catch((error) => showToast(error.message || 'Could not save the new order.', 'local', 'Workspaces'));
      });
    });
  }

  return { mount, reorderedWorkspaceIds, saveWorkspaceRailOrder };
}
