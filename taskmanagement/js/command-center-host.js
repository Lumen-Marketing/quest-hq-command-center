window.App = window.App || {};

(function () {
  const integration = App.commandCenterIntegration || {};
  if (!integration.hosted) return;

  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  onReady(() => {
    document.body.classList.add('hosted-by-command-center');
    if (integration.embedded) document.body.classList.add('embedded-in-job-center');

    const bar = document.getElementById('commandCenterHostBar');
    const label = document.getElementById('commandCenterProjectLabel');
    const returnLink = document.getElementById('commandCenterReturnLink');

    if (bar) bar.classList.remove('hidden');
    if (label) {
      if (integration.embedded && integration.projectId) {
        label.textContent = `Workspace ${integration.workspaceId} / job ${integration.projectId}`;
      } else if (integration.embedded) {
        label.textContent = `Workspace scope: ${integration.workspaceId}`;
      } else if (integration.projectId) {
        label.textContent = `Workspace ${integration.workspaceId} / job ${integration.projectId}`;
      } else {
        label.textContent = `Workspace scope: ${integration.workspaceId}`;
      }
    }
    if (returnLink && integration.returnUrl) returnLink.href = integration.returnUrl;
  });
})();
