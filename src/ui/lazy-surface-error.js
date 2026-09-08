export function showLazySurfaceFailure({ label, error, domain = '', escapeHtml, document, app }) {
  const targets = document.querySelectorAll('.quest-content-skeleton');
  const target = targets[targets.length - 1];
  const detail = error?.message || 'Please check your connection and try again.';
  const markup = `<section class="card lazy-surface-error" role="alert"><div><strong>${escapeHtml(label || 'This section could not load.')}</strong><p>${escapeHtml(detail)}</p></div><button class="btn btn-primary" type="button" data-action="retry-lazy-surface"${domain ? ` data-domain="${escapeHtml(domain)}"` : ''}>Try again</button></section>`;
  if (target) target.outerHTML = markup;
  else (document.querySelector('.work-surface') || app)?.insertAdjacentHTML('afterbegin', markup);
}
