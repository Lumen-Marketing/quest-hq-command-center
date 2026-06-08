const DEFAULT_TASK_MANAGEMENT_URL = '/TaskManagementQuest/app.html';

export function taskManagementUrl(jobId) {
  const baseUrl = import.meta.env.VITE_TASK_MANAGEMENT_URL || DEFAULT_TASK_MANAGEMENT_URL;
  const params = new URLSearchParams({ project_id: jobId });

  if (typeof window !== 'undefined') {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set('job_id', jobId);
    params.set('return_url', returnUrl.toString());
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
}

export function copyText(value) {
  if (!navigator.clipboard) return Promise.reject(new Error('Clipboard is not available.'));
  return navigator.clipboard.writeText(value);
}
