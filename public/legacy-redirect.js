(function redirectLegacyQuestbasePage() {
  'use strict';

  const script = document.currentScript;
  const file = script?.dataset.legacyFile || '';
  let params = new URLSearchParams(window.location.search);
  const company = params.get('company_id')
    || params.get('company')
    || localStorage.getItem('quest-hq-active-company')
    || 'roofing';
  let route = `/company/${encodeURIComponent(company)}/jobs`;
  const workspace = (section) => `/company/${encodeURIComponent(company)}/${section}`;
  const keep = (keys) => {
    const next = new URLSearchParams();
    keys.forEach((key) => {
      if (params.has(key)) next.set(key, params.get(key));
    });
    return next;
  };
  const map = {
    'admin.html': workspace('settings'),
    'automations.html': workspace('automations'),
    'calendar.html': workspace('calendar'),
    'crm.html': workspace('crm'),
    'dashboards.html': workspace('analytics'),
    'files.html': workspace('files'),
    'finance.html': workspace('finance'),
    'forms.html': workspace('forms'),
    'jobs.html': workspace('jobs'),
    'knowledge.html': workspace('knowledge'),
    'login.html': '/login',
    'messages.html': workspace('messages'),
    'templates.html': workspace('templates'),
    'tickets.html': workspace('tickets'),
    'underwriter.html': workspace('underwriter'),
  };

  if (file === 'task-management.html') {
    route = workspace('tasks');
    if (params.has('project_id') && !params.has('job_id')) params.set('job_id', params.get('project_id'));
    if (params.has('workspace_id') && !params.has('workspace')) params.set('workspace', params.get('workspace_id'));
    if (params.get('new') !== '1') params.delete('new');
    if (params.get('edit') !== '1') params.delete('edit');
    params = keep(['job_id', 'workspace', 'task_id', 'new', 'edit']);
  } else {
    route = map[file] || '/command';
    if (file === 'jobs.html') {
      if (params.get('tab') === 'tasks') {
        route = workspace('tasks');
        params = keep(['job_id', 'task_id', 'new', 'edit']);
      } else if (params.get('tab') === 'analytics') {
        route = workspace('analytics');
        params = keep(['job_id']);
      } else if (params.get('tab') === 'files') {
        route = workspace('files');
        params = keep(['job_id', 'folder']);
      } else if (params.get('tab') === 'forms') {
        route = workspace('forms');
        params = keep(['job_id']);
      } else {
        params = keep(['job_id', 'tab']);
      }
    } else if (file === 'files.html') {
      params = keep(['job_id', 'folder']);
    } else if (file === 'forms.html') {
      params = keep(['job_id']);
    } else {
      params = keep([]);
    }
  }

  const base = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'));
  const target = new URL(`${base || ''}${route}`, window.location.origin);
  target.search = params.toString();
  window.location.replace(target.toString());
}());
