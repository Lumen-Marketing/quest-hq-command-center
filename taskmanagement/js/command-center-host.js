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

    const bar = document.getElementById('commandCenterHostBar');
    const label = document.getElementById('commandCenterProjectLabel');
    const returnLink = document.getElementById('commandCenterReturnLink');

    if (bar) bar.classList.remove('hidden');
    if (label) {
      label.textContent = integration.projectId
        ? `Job scope: ${integration.projectId}`
        : 'No job selected; showing task scope allowed by your account';
    }
    if (returnLink && integration.returnUrl) returnLink.href = integration.returnUrl;
  });
})();
