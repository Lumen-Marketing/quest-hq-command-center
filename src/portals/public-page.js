// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createClientPortalPublicPage(ctx) {
  const {
    ensureClientPortalAnnotateState, h, questLogoImage, renderClientPortalAnnotate, renderClientPortalPasswordGate, state,
  } = ctx;

  function renderClientPortalPublicPage(route) {
    const portal = state.clientPortalPublic;
    const token = route.token || '';
    if (!portal?.session || portal.token !== token) {
      if (portal?.token === token && portal.passwordRequired) {
        return renderClientPortalPasswordGate(token, portal);
      }
      return `
        <main class="client-portal-public">
          <section class="client-portal-gate ${portal?.loading ? 'loading' : ''}">
            <div class="client-portal-brand"><span class="side-mark logo-image-mark">${questLogoImage('Quest Client Portal')}</span><span><strong>Quest Client Portal</strong><small>Plan review</small></span></div>
            <h1>${portal?.error ? 'Could not open portal' : 'Opening plan portal'}</h1>
            <p>${portal?.error ? 'This public portal link could not be opened. Ask the workspace team to confirm the link is active.' : 'Checking this link. If no password was set, the plan review will open automatically.'}</p>
            ${portal?.error ? `<div class="form-message error">${h(portal.error)}</div>` : '<div class="client-portal-status">Opening...</div>'}
          </section>
        </main>
      `;
    }
    ensureClientPortalAnnotateState('guest', portal.portal?.id || token, portal.documentId || '');
    return `<main class="client-portal-public open">${renderClientPortalAnnotate('guest')}</main>`;
  }

  return { renderClientPortalPublicPage };
}
