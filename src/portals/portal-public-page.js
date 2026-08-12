// Portal, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createPortalPublicPage(ctx) {
  const {
    loadRenderClientPortalPublicPage, questLoader, render, renderClientPortalPublicPageModule,
  } = ctx;

  function renderClientPortalPublicPage(route) {
    if (renderClientPortalPublicPageModule) return renderClientPortalPublicPageModule.renderClientPortalPublicPage(route);
    loadRenderClientPortalPublicPage().then(() => render()).catch((error) => console.error('renderClientPortalPublicPage failed to load', error));
    return questLoader('Loading');
  }

  return { renderClientPortalPublicPage };
}
