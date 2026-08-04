// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createClientPortalsPage(ctx) {
  const {
    can, clientPortalById, emptyState, ensureClientPortalAnnotateState, filteredClientPortals, h, renderClientPortalAnnotate, renderClientPortalDetail, renderClientPortalListItem, workspaceHeader, state,
  } = ctx;

  function renderClientPortalsPage(route, companyId) {
    // Owner annotate sub-view: ?portal_id=…&document_id=…&annotate=1
    if (route.params.get('annotate') === '1' && route.params.get('portal_id')) {
      const portalId = route.params.get('portal_id');
      if (clientPortalById(portalId)) {
        ensureClientPortalAnnotateState('owner', portalId, route.params.get('document_id') || '');
        return renderClientPortalAnnotate('owner');
      }
    }
    state.clientPortalAnnotate = null;
    const portals = filteredClientPortals(companyId);
    const selectedId = route.params.get('portal_id') || portals[0]?.id || '';
    const selected = clientPortalById(selectedId);
    const canManagePortals = can('client_portals.manage', companyId);
    return `
      <section class="tool-page client-portals-page">
        ${workspaceHeader('Client portals', 'Share plan sets with password-protected markup links.', `
          ${canManagePortals ? `<button class="btn btn-primary" type="button" data-action="open-client-portal-form"><i class="ti ti-world-plus"></i>New portal</button>` : ''}
        `)}
        <section class="client-portal-layout">
          <aside class="panel client-portal-list-panel">
            <label class="crm-search"><i class="ti ti-search"></i><input data-client-portal-search value="${h(state.clientPortalQuery)}" placeholder="Search portals" /></label>
            <div class="client-portal-list">
              ${portals.map((portal) => renderClientPortalListItem(portal, portal.id === selectedId)).join('') || emptyState('No client portals yet.')}
            </div>
          </aside>
          <section class="panel client-portal-detail-panel">
            ${selected ? renderClientPortalDetail(selected, canManagePortals) : emptyState('Create a portal to share PDF plans and markups.')}
          </section>
        </section>
      </section>
    `;
  }

  return { renderClientPortalsPage };
}
