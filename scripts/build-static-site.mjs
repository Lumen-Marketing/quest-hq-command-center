import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const buildId = 'Supabase Files v13';
const assetVersion = buildId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const targets = ['.', 'dist', 'docs'];

const nav = [
  ['index.html', 'Command Center', 'home', 'live'],
  ['jobs.html', 'Jobs', 'briefcase', 'live'],
  ['https://task-management-quest.vercel.app', 'TaskManagement', 'kanban', 'live'],
  ['crm.html', 'CRM', 'users', 'planned'],
  ['forms.html', 'Forms & Surveys', 'clipboard', 'planned'],
  ['tickets.html', 'Tickets', 'ticket', 'planned'],
  ['files.html', 'Files', 'folder', 'live'],
  ['finance.html', 'Finance', 'receipt', 'planned'],
  ['knowledge.html', 'Knowledge Base', 'library', 'planned'],
  ['automations.html', 'Automations', 'workflow', 'planned'],
  ['dashboards.html', 'Analytics', 'bar-chart', 'live'],
  ['templates.html', 'Templates', 'layers', 'planned'],
  ['admin.html', 'Admin', 'settings', 'live']
];

const jobSeed = [];

const modules = {
  crm: {
    file: 'crm.html',
    eyebrow: 'CRM',
    title: 'Relationship Pipeline',
    summary: 'Leads, contacts, clients, opportunities, and follow-up ownership live here before they become jobs.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Open leads', '14'], ['Follow-ups due', '5'], ['Clients', '12'], ['Pipeline value', '$81K']],
    tabs: [
      ['Pipeline', pipeline(['New Lead', 'Qualified', 'Estimate Sent', 'Won'], ['Queen Creek referral', 'Arroyo Vista HOA', 'Casa Azul Remodel', 'Horizon HVAC'])],
      ['Client Directory', directory(['Maya Rosales', 'Arroyo Vista HOA', 'Mesa Storage Partners', 'Horizon HVAC'])],
      ['Record Editor', recordSystem('crm')]
    ],
    seed: [
      { title: 'Queen Creek referral', status: 'New Lead', owner: 'Maya Rosales', job: 'Not linked', notes: 'Storm damage lead. Needs inspection scheduling.' },
      { title: 'Arroyo Vista HOA', status: 'Qualified', owner: 'Andre Lee', job: 'Mesa Storage Roof Repair', notes: 'Board wants estimate and permit packet.' }
    ]
  },
  forms: {
    file: 'forms.html',
    eyebrow: 'Forms & Surveys',
    title: 'Form Builder and Response Center',
    summary: 'Inspection checklists, approvals, surveys, intake forms, and response review are separated from task execution.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Templates', '6'], ['Responses', '28'], ['Pending review', '4'], ['Avg rating', '4.6']],
    tabs: [
      ['Builder', formBuilder()],
      ['Responses', cards('Response Inbox', ['Roof inspection checklist', 'Client approval form', 'Final walkthrough survey', 'Internal request intake'])],
      ['Form Editor', recordSystem('forms')]
    ],
    seed: [
      { title: 'Roof inspection checklist', status: 'Published', owner: 'Maya Rosales', job: 'Queen Creek Leak Follow-up', notes: 'Includes photo upload, signature, and safety fields.' },
      { title: 'Client approval form', status: 'Review', owner: 'Andre Lee', job: 'Mesa Storage Roof Repair', notes: 'Waiting on legal language before publishing.' }
    ]
  },
  tickets: {
    file: 'tickets.html',
    eyebrow: 'Tickets',
    title: 'Request and Issue System',
    summary: 'Client requests, repairs, admin issues, and internal asks get triaged before becoming TaskManagement work.',
    image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Open tickets', '9'], ['Urgent', '2'], ['SLA due today', '3'], ['Converted', '5']],
    tabs: [
      ['Triage Desk', ticketDesk()],
      ['Conversions', conversionDesk()],
      ['Ticket Editor', recordSystem('tickets')]
    ],
    seed: [
      { title: 'Roof leak follow-up', status: 'Urgent', owner: 'Maya Rosales', job: 'Queen Creek Leak Follow-up', notes: 'Client reported active leak after storm.' },
      { title: 'Permit revision request', status: 'Triaged', owner: 'Noah Park', job: 'Drafting Permit Package', notes: 'Needs conversion to drafting task after review.' }
    ]
  },
  files: {
    file: 'files.html',
    eyebrow: 'Files',
    title: 'Visual File Cabinet',
    summary: 'Photos, permits, contracts, estimates, invoices, drawings, and job documents get thumbnails and metadata.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Files', '48'], ['Photos', '19'], ['Permits', '7'], ['Unlinked', '4']],
    tabs: [
      ['Library', fileLibrary()],
      ['Folders', folderGrid()],
      ['File Details', recordSystem('files')]
    ],
    seed: [
      { title: 'Mesa roof photo set', status: 'Tagged', owner: 'Field Team', job: 'Mesa Storage Roof Repair', notes: 'Before photos and close-ups saved locally.' },
      { title: 'Permit packet draft', status: 'Review', owner: 'Noah Park', job: 'Drafting Permit Package', notes: 'Drawings and permit notes ready for review.' }
    ]
  },
  finance: {
    file: 'finance.html',
    eyebrow: 'Finance',
    title: 'Estimate, Invoice, and AR System',
    summary: 'Estimate approval, invoice status, payment tracking, overdue AR, and job profitability are managed here.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Open AR', '$38K'], ['Estimates sent', '8'], ['Invoices due', '5'], ['Paid this week', '$12K']],
    tabs: [
      ['Ledger', ledger()],
      ['Billing', cards('Billing Controls', ['Estimate builder', 'Invoice list', 'Payment records', 'Overdue AR'])],
      ['Finance Editor', recordSystem('finance')]
    ],
    seed: [
      { title: 'Mesa roof estimate', status: 'Sent', owner: 'Andre Lee', job: 'Mesa Storage Roof Repair', notes: 'Materials and labor included. Waiting approval.' },
      { title: 'Queen Creek emergency invoice', status: 'Overdue', owner: 'Maya Rosales', job: 'Queen Creek Leak Follow-up', notes: 'Deposit invoice due today.' }
    ]
  },
  knowledge: {
    file: 'knowledge.html',
    eyebrow: 'Knowledge Base',
    title: 'SOP and Training Library',
    summary: 'Company SOPs, roofing procedures, drafting guidelines, training, FAQs, and templates stay searchable.',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Articles', '32'], ['Training', '8'], ['Needs review', '6'], ['Pinned SOPs', '5']],
    tabs: [
      ['Articles', knowledgeList()],
      ['Training', cards('Training Tracks', ['Roof inspection SOP', 'Client follow-up script', 'Permit package checklist', 'Invoice handoff guide'])],
      ['Article Editor', recordSystem('knowledge')]
    ],
    seed: [
      { title: 'Roof inspection SOP', status: 'Published', owner: 'Maya Rosales', job: 'All roofing jobs', notes: 'Standard inspection and photo capture process.' },
      { title: 'Permit package checklist', status: 'Review', owner: 'Noah Park', job: 'Drafting Permit Package', notes: 'Drafting requirements before submission.' }
    ]
  },
  automations: {
    file: 'automations.html',
    eyebrow: 'Automations',
    title: 'Rule Builder and Run Log',
    summary: 'Local triggers, conditions, actions, enablement, and run logs show how backend automations will behave later.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Enabled', '7'], ['Paused', '2'], ['Runs today', '18'], ['Failures', '0']],
    tabs: [
      ['Rules', automationRules()],
      ['Run Log', cards('Recent Runs', ['New roofing job created default checklist', 'Low survey rating created follow-up ticket', 'Invoice overdue notified admin'])],
      ['Rule Editor', recordSystem('automations')]
    ],
    seed: [
      { title: 'New roofing job checklist', status: 'Enabled', owner: 'System', job: 'Roofing jobs', notes: 'Creates default inspection and estimate tasks later.' },
      { title: 'Overdue invoice alert', status: 'Enabled', owner: 'Admin', job: 'Finance', notes: 'Notifies admin when invoice status becomes overdue.' }
    ]
  },
  dashboards: {
    file: 'dashboards.html',
    eyebrow: 'Analytics',
    title: 'Analytics Center',
    summary: 'Centralized reporting for active jobs, urgent work, pipeline value, task counts, finance, tickets, and module adoption.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Active Jobs', '0'], ['Urgent', '0'], ['Linked Tasks', '0'], ['Pipeline', '$0']],
    tabs: [
      ['Overview', analyticsOverview()],
      ['Module Health', analyticsModuleHealth()],
      ['Saved Views', emptyModuleWorkspace('dashboards', 'Saved Views')]
    ],
    seed: [
      { title: 'Roofing weekly ops', status: 'Pinned', owner: 'Andre Lee', job: 'Roofing', notes: 'Active jobs, overdue tasks, open tickets, AR, and tracked time.' },
      { title: 'Finance and AR', status: 'Saved', owner: 'Admin', job: 'All companies', notes: 'Invoices due, paid this week, and overdue balances.' }
    ]
  },
  templates: {
    file: 'templates.html',
    eyebrow: 'Templates',
    title: 'Template Application System',
    summary: 'Repeatable job, task, form, survey, inspection, estimate, email, SOP, and automation templates live here.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Templates', '18'], ['Applied', '7'], ['Job packs', '5'], ['SOP packs', '4']],
    tabs: [
      ['Catalog', templateCatalog()],
      ['Apply', cards('Application Preview', ['Roofing repair job pack', 'Roof replacement job pack', 'Drafting project pack', 'Internal admin pack'])],
      ['Template Editor', recordSystem('templates')]
    ],
    seed: [
      { title: 'Roofing repair job pack', status: 'Applied', owner: 'Maya Rosales', job: 'Queen Creek Leak Follow-up', notes: 'Inspection, estimate, scheduling, and final walkthrough.' },
      { title: 'Drafting project pack', status: 'Saved', owner: 'Noah Park', job: 'Drafting Permit Package', notes: 'Permit checklist, drawing QA, and client approval form.' }
    ]
  },
  admin: {
    file: 'admin.html',
    eyebrow: 'Admin',
    title: 'Users, Roles, and Settings',
    summary: 'User profiles, roles, permissions, company access, approvals, statuses, templates, and notification settings.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Users', '11'], ['Pending', '2'], ['Companies', '3'], ['Roles', '5']],
    tabs: [
      ['Users', adminUsers()],
      ['Settings', cards('System Settings', ['Job stages', 'Ticket statuses', 'Lead statuses', 'Notification rules'])],
      ['Access Editor', recordSystem('admin')]
    ],
    seed: [
      { title: 'Maya Rosales', status: 'Approved', owner: 'Owner', job: 'Roofing', notes: 'Supervisor access for roofing jobs and CRM.' },
      { title: 'Noah Park', status: 'Pending', owner: 'Admin', job: 'Drafting', notes: 'Needs approval for drafting project files.' }
    ]
  }
};

for (const [moduleId, module] of Object.entries(modules)) {
  if (moduleId === 'files') continue;
  module.metrics = module.metrics.map(([label]) => [label, '0']);
  module.tabs = module.tabs.map(([label]) => [label, emptyModuleWorkspace(moduleId, label)]);
  module.seed = [];
}

modules.admin.metrics = [['Users', '0'], ['Pending', '0'], ['Companies', 'Live'], ['Roles', '0']];
modules.admin.tabs = [
  ['Companies', adminCompanyManager()],
  ['Users', emptyModuleWorkspace('admin', 'Users')],
  ['Settings', emptyModuleWorkspace('admin', 'Settings')]
];

modules.dashboards.metrics = [['Active Jobs', '0'], ['Urgent', '0'], ['Linked Tasks', '0'], ['Pipeline', '$0']];
modules.dashboards.tabs = [
  ['Overview', analyticsOverview()],
  ['Module Health', analyticsModuleHealth()],
  ['Saved Views', emptyModuleWorkspace('dashboards', 'Saved Views')]
];

function shell({ file, title, content, seed = [], moduleId = '' }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>${title} | Quest HQ</title>
    <link rel="stylesheet" href="assets/quest-hq.css?v=${assetVersion}" />
  </head>
  <body data-page="${file}" data-module="${moduleId}">
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="index.html">
          <span class="brand-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Operations Command</small></span>
        </a>
        <div class="build-badge">${buildId}</div>
        <nav class="nav-list" aria-label="Main navigation">
          ${nav.map(([href, label, icon, state]) => navItem({ href, label, icon, state, file })).join('')}
        </nav>
        <div class="sidebar-card">
          <strong>Work Execution</strong>
          <p>TaskManagement remains the task engine. Quest HQ owns jobs, clients, files, forms, finance, and operations context.</p>
        </div>
      </aside>
      <main class="main">
        ${content}
      </main>
    </div>
    <script type="application/json" id="record-seed">${JSON.stringify(seed)}</script>
${['command', 'jobs', 'task-bridge', 'admin', 'dashboards', 'files'].includes(moduleId) ? '    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    ' : '    '}<script src="assets/quest-hq.js?v=${assetVersion}" defer></script>
  </body>
</html>`;
}

function navItem({ href, label, icon, state, file }) {
  const planned = state === 'planned';
  const classes = ['nav-item', href === file ? 'active' : '', planned ? 'nav-planned' : ''].filter(Boolean).join(' ');
  const attrs = planned ? ' data-nav-state="planned" aria-disabled="true" title="Planned for a later build"' : '';
  return `<a class="${classes}" href="${href}"${attrs}><span class="nav-icon">${iconSvg(icon)}</span><span class="nav-label">${label}</span>${planned ? '<small class="nav-status">Planned</small>' : ''}</a>`;
}

function iconSvg(name) {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
    briefcase: '<path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 13h18"/><path d="M9 13v2h6v-2"/>',
    kanban: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 8v8"/><path d="M15 8v4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    ticket: '<path d="M2 9a3 3 0 0 0 0 6v3h20v-3a3 3 0 0 0 0-6V6H2Z"/><path d="M13 6v12"/><path d="M7 12h2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2H3Z"/><path d="M3 11h18l-2 8H5Z"/>',
    receipt: '<path d="M4 3v18l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V3Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    library: '<path d="M4 19V5"/><path d="M8 19V5"/><path d="M12 19V5"/><path d="m17 18-4-13"/><path d="m20 17-4-13"/>',
    workflow: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a4 4 0 0 1 4 4v6"/><path d="M6 8v4a4 4 0 0 0 4 4h6"/>',
    'bar-chart': '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.1.35.3.7.6 1 .3.25.7.4 1.1.4H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.6Z"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function commandPage() {
  const content = `<section class="workspace command-center" data-command-center data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07">
    <div class="page-heading">
      <div><div class="eyebrow">Command Center</div><h1>Operations dashboard</h1><p>Today view for active jobs, urgent work, revenue, task handoff, and recent operating activity.</p></div>
      <div class="job-actions"><span class="sync-pill" data-command-sync>Loading jobs...</span><a class="primary-button" href="jobs.html?action=new">Add Job</a></div>
    </div>
    <div class="metric-grid command-metrics">
      <div class="metric"><span>Active Jobs</span><strong data-command-metric="active">0</strong></div>
      <div class="metric"><span>Urgent Work</span><strong data-command-metric="urgent">0</strong></div>
      <div class="metric"><span>Pipeline Value</span><strong data-command-metric="revenue">$0</strong></div>
      <div class="metric"><span>Task Rollup</span><strong data-command-metric="tasks">0</strong></div>
    </div>
    <div class="ops-dashboard-grid">
      <section class="panel wide-panel">
        <div class="job-section-heading"><h2>Priority Job Queue</h2><span data-command-count>0 jobs</span></div>
        <div class="ops-job-list" data-command-jobs></div>
      </section>
      <section class="panel">
        <h2>Quick Actions</h2>
        <div class="quick-action-grid">
          <a href="jobs.html?action=new">Create job<span>Supabase job record</span></a>
          <a href="jobs.html">Open Job Center<span>Pipeline, list, profile, editor</span></a>
          <a href="task-management.html">Task bridge<span>project_id handoff preview</span></a>
          <a href="files.html">Files viewer<span>File cabinet workspace</span></a>
        </div>
      </section>
      <section class="panel wide-panel">
        <div class="job-section-heading"><h2>Recent Operating Activity</h2><span>Live summary</span></div>
        <div class="activity-feed" data-command-activity></div>
      </section>
      <section class="panel">
        <h2>Current Scope</h2>
        <p class="muted">Jobs and companies are live in Supabase. Analytics is centralized; files, CRM, forms, finance, and tickets remain empty workspaces until real records are connected.</p>
      </section>
    </div>
  </section>`;
  return shell({ file: 'index.html', title: 'Command Center', moduleId: 'command', content, seed: jobSeed });
}

function jobsPage() {
  const content = `<section class="workspace job-center" data-job-center data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07">
    <div class="page-heading">
      <div>
        <div class="eyebrow">Jobs</div>
        <h1>Job Center</h1>
        <p>Jobs are the parent container for client, site, scope, files, forms, finance, and TaskManagement handoff.</p>
      </div>
      <div class="job-actions">
        <span class="sync-pill" data-job-sync>Connecting to Supabase...</span>
        <button class="primary-button" type="button" data-job-new>Add Job</button>
      </div>
    </div>
    <div class="job-command panel">
      <div class="job-search">
        <span>Search</span>
        <input data-job-search placeholder="Search jobs, clients, owners, addresses" />
      </div>
      <select data-job-stage-filter aria-label="Filter jobs by stage">
        <option value="all">All stages</option>
        <option>Lead</option>
        <option>Inspection</option>
        <option>Estimate Approved</option>
        <option>Production</option>
        <option>QA Review</option>
        <option>Complete</option>
      </select>
      <button class="secondary-button" type="button" data-job-refresh>Refresh</button>
    </div>
    <div class="tabs" role="tablist">
      <button class="active" data-tab="pipeline">Pipeline</button>
      <button data-tab="list">Job List</button>
      <button data-tab="profile">Profile</button>
      <button data-tab="editor">Job Editor</button>
    </div>
    <section class="tab-panel active" data-panel="pipeline">
      <div class="job-board" data-job-board></div>
    </section>
    <section class="tab-panel" data-panel="list">
      <div class="panel job-list-panel">
        <div class="job-section-heading"><h2>Job List</h2><span data-job-count>0 jobs</span></div>
        <div class="job-table" data-job-table></div>
      </div>
    </section>
    <section class="tab-panel" data-panel="profile">
      <div class="job-profile-grid">
        <article class="panel job-profile" data-job-profile></article>
        <aside class="panel job-sidecar" data-job-sidecar></aside>
      </div>
    </section>
    <section class="tab-panel" data-panel="editor">
      <form class="panel job-editor" data-job-form>
        <input type="hidden" name="id" />
        <div class="job-section-heading span-2"><h2>Job Editor</h2><span>Saved to Supabase when available, local fallback otherwise.</span></div>
        <label class="span-2">Job Name<input name="name" required /></label>
        <label>Company
          <select name="company_id" data-job-company-select></select>
        </label>
        <label>Client<input name="client_name" placeholder="Client or account name" /></label>
        <label>Contact<input name="contact_name" /></label>
        <label>Owner<input name="owner_name" /></label>
        <label>Job Type<input name="job_type" /></label>
        <label>Stage
          <select name="stage">
            <option>Lead</option>
            <option>Inspection</option>
            <option>Estimate Approved</option>
            <option>Production</option>
            <option>QA Review</option>
            <option>Complete</option>
          </select>
        </label>
        <label>Priority
          <select name="priority">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </label>
        <label>Start Date<input type="date" name="start_date" /></label>
        <label>Due Date<input type="date" name="due_date" /></label>
        <label>Estimate Total<input type="number" min="0" step="100" name="estimate_total" /></label>
        <label>Invoice Total<input type="number" min="0" step="100" name="invoice_total" /></label>
        <label>Task Count<input type="number" min="0" step="1" name="task_count" /></label>
        <label>File Count<input type="number" min="0" step="1" name="file_count" /></label>
        <label class="span-2">Site Address<input name="site_address" /></label>
        <label class="span-2">Scope<textarea name="scope" rows="4"></textarea></label>
        <label class="span-2">Notes<textarea name="notes" rows="4"></textarea></label>
        <div class="form-actions span-2">
          <button class="primary-button" type="submit">Save Job</button>
          <button class="secondary-button" type="button" data-job-duplicate>Duplicate</button>
          <button class="danger-button" type="button" data-job-delete>Delete</button>
        </div>
      </form>
    </section>
  </section>`;
  return shell({
    file: 'jobs.html',
    title: 'Jobs',
    moduleId: 'jobs',
    content,
    seed: jobSeed
  });
}

function taskManagementPage() {
  const content = `<section class="workspace task-bridge-page" data-task-bridge data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07">
    <div class="page-heading">
      <div><div class="eyebrow">TaskManagement Bridge</div><h1>Work execution handoff</h1><p>Integration bridge for TaskManagement. Quest HQ keeps job context; TaskManagement owns execution.</p></div>
      <div class="job-actions"><span class="sync-pill" data-bridge-sync>Loading job...</span><a class="primary-button" data-bridge-return href="jobs.html">Return to Job</a></div>
    </div>
    <div class="bridge-hero panel">
      <div><span>Quest HQ job id</span><code data-bridge-job-id>pending</code></div>
      <strong>maps to</strong>
      <div><span>TaskManagement project_id</span><code data-bridge-project-id>pending</code></div>
    </div>
    <div class="task-bridge-grid">
      <section class="panel wide-panel">
        <div class="job-section-heading"><h2 data-bridge-title>Selected Job</h2><span data-bridge-stage>Stage</span></div>
        <div class="bridge-task-list" data-bridge-tasks></div>
      </section>
      <aside class="panel bridge-contract">
        <h2>Handoff Contract</h2>
        <div data-bridge-contract></div>
        <a class="secondary-button" href="https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main">View TaskManagement Repo</a>
      </aside>
    </div>
  </section>`;
  return shell({ file: 'task-management.html', title: 'TaskManagement', moduleId: 'task-bridge', content, seed: jobSeed });
}

function filesPage() {
  const content = `<section class="workspace file-center" data-file-center data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07" data-storage-bucket="quest-job-files" data-storage-limit="1073741824">
    <div class="page-heading">
      <div>
        <div class="eyebrow">Files</div>
        <h1>Job File Center</h1>
        <p>Supabase-backed file storage for job photos, documents, permits, estimates, drawings, and field uploads.</p>
      </div>
      <div class="job-actions">
        <span class="sync-pill" data-file-sync>Connecting to Supabase...</span>
        <button class="primary-button" type="button" data-file-open-upload>Upload Files</button>
      </div>
    </div>

    <div class="file-metrics">
      <div class="metric"><span>Stored Files</span><strong data-file-metric="count">0</strong></div>
      <div class="metric"><span>Storage Used</span><strong data-file-metric="used">0 MB</strong></div>
      <div class="metric"><span>Demo Limit</span><strong data-file-metric="limit">1 GB</strong></div>
      <div class="metric"><span>Selected Job</span><strong data-file-metric="job">None</strong></div>
    </div>

    <div class="file-toolbar panel">
      <label>Job
        <select data-file-job></select>
      </label>
      <label>Category
        <select data-file-category-filter>
          <option value="all">All categories</option>
          <option>Photo</option>
          <option>Permit</option>
          <option>Contract</option>
          <option>Estimate</option>
          <option>Invoice</option>
          <option>Drawing</option>
          <option>Other</option>
        </select>
      </label>
      <label>Search
        <input data-file-search placeholder="Search file names, notes, types" />
      </label>
      <button class="secondary-button" type="button" data-file-refresh>Refresh</button>
    </div>

    <div class="tabs" role="tablist">
      <button class="active" data-tab="job-files">Job Files</button>
      <button data-tab="upload-queue">Upload Queue</button>
      <button data-tab="file-details">File Details</button>
    </div>

    <section class="tab-panel active" data-panel="job-files">
      <div class="file-layout">
        <section class="panel file-browser">
          <div class="file-section-title">
            <div><h2>Files</h2><p class="muted" data-file-context>No job selected.</p></div>
            <div class="file-capacity"><span data-file-capacity-label>0 MB of 1 GB</span><b><i data-file-capacity-bar></i></b></div>
          </div>
          <div class="file-grid-live" data-file-grid></div>
          <div class="file-table-live" data-file-table></div>
        </section>
        <aside class="panel file-detail-pane" data-file-detail>
          <div class="empty-state">Select a file to inspect details.</div>
        </aside>
      </div>
    </section>

    <section class="tab-panel" data-panel="upload-queue">
      <form class="panel file-upload-panel" data-file-upload-form>
        <div class="job-section-heading span-2">
          <h2>Upload to Selected Job</h2>
          <span>Public demo write mode</span>
        </div>
        <label class="span-2">Files
          <input type="file" data-file-input multiple />
        </label>
        <label>Category
          <select name="category">
            <option>Photo</option>
            <option>Permit</option>
            <option>Contract</option>
            <option>Estimate</option>
            <option>Invoice</option>
            <option>Drawing</option>
            <option>Other</option>
          </select>
        </label>
        <label>Uploaded By
          <input name="uploaded_by_label" value="Quest HQ Demo" />
        </label>
        <label class="span-2">Notes
          <textarea name="notes" rows="4" placeholder="Inspection angle, permit revision, invoice context, or drawing notes"></textarea>
        </label>
        <div class="file-policy-note span-2">
          <strong>Demo storage note</strong>
          <span>This uses Supabase Storage with a 1GB presentation cap. Current browser write policies are temporary and must be replaced with Supabase Auth before real customer data.</span>
        </div>
        <div class="form-actions span-2">
          <button class="primary-button" type="submit">Upload Selected Files</button>
          <button class="secondary-button" type="button" data-file-clear-input>Clear</button>
        </div>
        <div class="file-upload-log span-2" data-file-upload-log></div>
      </form>
    </section>

    <section class="tab-panel" data-panel="file-details">
      <div class="panel file-detail-full" data-file-detail-full>
        <div class="empty-state">Select a file from Job Files to view its deployment metadata.</div>
      </div>
    </section>
  </section>`;
  return shell({ file: 'files.html', title: 'Files', moduleId: 'files', content, seed: [] });
}

function modulePage(module) {
  const metrics = module.file === 'dashboards.html'
    ? `<div class="metric-grid analytics-metrics">${module.metrics.map(([label, value]) => metric(label, value)).join('')}</div>`
    : '';
  const action = module.file === 'dashboards.html'
    ? '<a class="primary-button" href="jobs.html">Open Job Center</a>'
    : '<button class="primary-button" data-add-record>Create Record</button>';
  const tabButtons = module.tabs.map(([label, body], index) => {
    const planned = isPlannedTab(body);
    const classes = [index === 0 ? 'active' : '', planned ? 'tab-planned' : ''].filter(Boolean).join(' ');
    const state = planned ? ' data-tab-state="planned" aria-disabled="true" title="Planned for a later build"' : '';
    return `<button class="${classes}" data-tab="${slug(label)}"${state}>${label}${planned ? '<small>Planned</small>' : ''}</button>`;
  }).join('');
  const content = `<section class="workspace module-page">
    <div class="page-heading"><div><div class="eyebrow">${module.eyebrow}</div><h1>${module.title}</h1><p>${module.summary}</p></div>${action}</div>
    ${metrics}
    <div class="hero-card" style="background-image:url('${module.image}')"><strong>${module.title}</strong><span>${module.summary}</span></div>
    <div class="tabs" role="tablist">${tabButtons}</div>
    ${module.tabs.map(([label, body], index) => `<section class="tab-panel ${index === 0 ? 'active' : ''}" data-panel="${slug(label)}">${body}</section>`).join('')}
  </section>`;
  return shell({ file: module.file, title: module.title, moduleId: module.file.replace('.html', ''), content, seed: module.seed });
}

function isPlannedTab(body) {
  return String(body).includes('data-empty-module=');
}

function recordSystem(moduleId) {
  return `<div class="record-system panel" data-record-system="${moduleId}">
    <div class="record-toolbar"><h2>Local ${titleCase(moduleId)} Records</h2><button class="secondary-button" data-add-record>Add</button></div>
    <div class="record-layout">
      <div class="record-list" data-record-list></div>
      <form class="record-editor" data-record-editor>
        <label>Title<input name="title" /></label>
        <label>Status<input name="status" /></label>
        <label>Owner<input name="owner" /></label>
        <label>Job / Context<input name="job" /></label>
        <label class="span-2">Notes<textarea name="notes" rows="6"></textarea></label>
        <div class="form-actions"><button class="primary-button" type="submit">Save Locally</button><button class="secondary-button" type="button" data-duplicate-record>Duplicate</button><button class="danger-button" type="button" data-delete-record>Delete</button></div>
      </form>
    </div>
  </div>`;
}

function emptyModuleWorkspace(moduleId, label) {
  const copy = {
    crm: ['No leads or clients yet', 'Create a lead or client record when real CRM data is ready.'],
    forms: ['No forms or responses yet', 'Build inspection forms and surveys when real templates are approved.'],
    tickets: ['No tickets yet', 'Incoming requests will appear here after the intake flow is connected.'],
    files: ['No files yet', 'Upload job documents after file storage is connected.'],
    finance: ['No finance records yet', 'Estimates, invoices, payments, and AR will appear when real records exist.'],
    knowledge: ['No articles yet', 'Add SOPs and training material after the content is approved.'],
    automations: ['No automation rules yet', 'Create rules after triggers and actions are confirmed.'],
    dashboards: ['No analytics records yet', 'Analytics will populate as real module data is connected.'],
    templates: ['No templates yet', 'Reusable job, form, finance, and SOP templates can be added later.'],
    admin: ['No users configured yet', 'Add users, roles, and company access after authentication is in scope.']
  };
  const [title, summary] = copy[moduleId] || ['No records yet', 'Create records when this system is ready for real data.'];
  return `<div class="panel empty-workspace" data-empty-module="${moduleId}">
    <div>
      <span>${titleCase(label)}</span>
      <h2>${title}</h2>
      <p class="muted">${summary}</p>
    </div>
    <div class="empty-actions">
      <a class="secondary-button" href="jobs.html">Link to Job Center</a>
    </div>
  </div>`;
}

function adminCompanyManager() {
  return `<div class="panel company-admin" data-company-admin data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07">
    <div class="company-admin-header">
      <div>
        <h2>Companies</h2>
        <p class="muted">Create and manage operating companies used by Job Center. Changes are saved to Supabase for this demo.</p>
      </div>
      <div class="company-admin-actions">
        <span class="sync-pill" data-company-sync>Connecting...</span>
        <button class="secondary-button" type="button" data-company-refresh>Refresh</button>
      </div>
    </div>
    <div class="company-admin-layout">
      <section class="company-list-wrap" aria-label="Companies">
        <div class="company-list" data-company-list></div>
      </section>
      <form class="company-editor" data-company-form>
        <input type="hidden" name="editing_id" />
        <div class="job-section-heading span-2"><h2 data-company-form-title>New Company</h2><span>Public demo write mode</span></div>
        <label class="span-2">Company ID<input name="id" required placeholder="quest-roofing" pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
        <label>Company Name<input name="name" required placeholder="Quest Roofing" /></label>
        <label>Short Name<input name="short_name" required placeholder="Roofing" /></label>
        <label>Brand Color<input name="color" type="color" value="#f45d22" /></label>
        <div class="company-policy-note span-2">
          <strong>Demo security note</strong>
          <span>Company writes are intentionally open for today&apos;s public mockup. Lock this behind auth before production.</span>
        </div>
        <div class="form-actions span-2">
          <button class="primary-button" type="submit">Save Company</button>
          <button class="secondary-button" type="button" data-company-new>New</button>
          <button class="danger-button" type="button" data-company-delete>Delete</button>
        </div>
      </form>
    </div>
  </div>`;
}

function metric(label, value) {
  const analyticsKey = {
    'Active Jobs': 'active',
    Urgent: 'urgent',
    'Linked Tasks': 'tasks',
    Pipeline: 'pipeline'
  }[label];
  const data = analyticsKey ? ` data-analytics-metric="${analyticsKey}"` : '';
  return `<div class="metric"><span>${label}</span><strong${data}>${value}</strong></div>`;
}

function pipeline(lanes, items) {
  return `<div class="pipeline">${lanes.map((lane, index) => `<section><h3>${lane}</h3><button>${items[index]}<span>${index + 1} records</span></button></section>`).join('')}</div>`;
}

function directory(items) {
  return `<div class="card-grid">${items.map((item) => `<article class="panel"><h2>${item}</h2><p class="muted">Client profile, contacts, jobs, files, invoices, and notes.</p></article>`).join('')}</div>`;
}

function cards(title, items) {
  return `<div class="panel"><h2>${title}</h2><div class="card-grid">${items.map((item) => `<article class="mini-card"><strong>${item}</strong><span>Saved locally for presentation mode.</span></article>`).join('')}</div></div>`;
}

function formBuilder() {
  return `<div class="builder-grid"><section class="panel"><h2>Question Palette</h2>${['Short text', 'Long text', 'Multiple choice', 'Rating', 'File upload', 'Signature'].map((item) => `<button class="chip">${item}</button>`).join('')}</section><section class="panel wide-panel"><h2>Form Canvas</h2><div class="form-preview"><strong>Roof Inspection Checklist</strong><span>Photo upload, damage notes, rating, and signature fields.</span></div></section></div>`;
}

function ticketDesk() {
  return `<div class="ticket-grid"><section class="panel urgent"><h2>Urgent / Due</h2><article class="ticket-card"><strong>Roof leak follow-up</strong><span>Maya Rosales - due today</span><b>Urgent</b></article></section><section class="panel wide-panel"><h2>SLA Board</h2><div class="pipeline">${['New', 'Triaged', 'Urgent', 'Converted'].map((item) => `<section><h3>${item}</h3><strong>${item === 'Urgent' ? 2 : 3}</strong></section>`).join('')}</div></section></div>`;
}

function conversionDesk() {
  return `<div class="builder-grid"><section class="panel"><h2>Conversion Rules</h2><button class="primary-button">Convert to Task</button><button class="secondary-button">Convert to Job</button></section><section class="panel wide-panel"><h2>Ready for TaskManagement</h2><p class="muted">Only approved requests should become executable tasks through project_id.</p></section></div>`;
}

function fileLibrary() {
  return `<div class="file-grid">${['Job photos', 'Permits', 'Contracts', 'Estimates', 'Invoices', 'Drawings'].map((item) => `<article class="file-tile"><img src="${fileImage(item)}" alt=""><strong>${item}</strong><span>Thumbnail folder</span></article>`).join('')}</div>`;
}

function folderGrid() {
  const folders = [
    ['Job photos', '19 files', 'Field Team', 'Updated today', 'photo'],
    ['Client documents', '8 files', 'Admin', 'Updated Jun 8', 'doc'],
    ['Permits', '7 files', 'Drafting', 'Updated Jun 7', 'permit'],
    ['Contracts', '5 files', 'Admin', 'Updated Jun 6', 'doc'],
    ['Estimates', '6 files', 'Finance', 'Updated Jun 5', 'sheet'],
    ['Invoices', '4 files', 'Finance', 'Updated Jun 4', 'sheet'],
    ['Drawings', '3 files', 'Drafting', 'Updated Jun 2', 'drawing'],
    ['Marketing assets', '2 files', 'Lumen', 'Updated May 31', 'image']
  ];
  const recents = [
    ['Mesa roof before photo.jpg', 'Job photos', 'Image', 'Today'],
    ['Queen Creek deposit invoice.pdf', 'Invoices', 'PDF', 'Today'],
    ['Permit packet revision.dwg', 'Drawings', 'Drawing', 'Yesterday'],
    ['Client approval signed.pdf', 'Client documents', 'PDF', 'Jun 8']
  ];
  return `<div class="drive-viewer panel">
    <div class="drive-topbar">
      <div>
        <h2>My Drive</h2>
        <p class="muted">Drive-style file viewer for folders, job attachments, shared documents, and recent uploads.</p>
      </div>
      <label class="drive-search">
        <span>Search</span>
        <input value="" placeholder="Search in Quest HQ files" />
      </label>
      <button class="primary-button" type="button">New</button>
    </div>

    <div class="drive-shell">
      <aside class="drive-rail" aria-label="Drive sections">
        ${[
          ['My Drive', 'drive'],
          ['Shared with me', 'shared'],
          ['Recent', 'clock'],
          ['Starred', 'star'],
          ['Needs review', 'alert']
        ].map((item, index) => `<button class="${index === 0 ? 'active' : ''}" type="button">${driveRailIcon(item[1])}<span>${item[0]}</span></button>`).join('')}
      </aside>

      <section class="drive-main" aria-label="Drive files">
        <div class="drive-section-title">
          <h3>Folders</h3>
          <div class="drive-view-toggle"><span></span><span></span><span></span></div>
        </div>
        <div class="drive-folder-grid">
          ${folders.map((folder, index) => `<button class="drive-folder-card ${index === 0 ? 'selected' : ''}" type="button">
            <span class="drive-folder-icon">${folderGlyph()}</span>
            <strong>${folder[0]}</strong>
            <small>${folder[1]} - ${folder[2]}</small>
            <em>${folder[3]}</em>
          </button>`).join('')}
        </div>

        <div class="drive-section-title recent-title">
          <h3>Recent files</h3>
          <span>Owner / type / modified</span>
        </div>
        <div class="drive-file-list">
          ${recents.map((file) => `<button class="drive-file-row" type="button">
            <span class="file-type ${file[2].toLowerCase()}">${fileIcon(file[2])}</span>
            <strong>${file[0]}</strong>
            <span>${file[1]}</span>
            <span>${file[2]}</span>
            <span>${file[3]}</span>
          </button>`).join('')}
        </div>
      </section>

      <aside class="drive-details">
        <div class="drive-preview-card">
          ${folderGlyph()}
        </div>
        <h3>Job photos</h3>
        <p class="muted">19 image files attached to active roofing jobs. This preview panel is local-only until cloud storage is connected.</p>
        <div class="drive-detail-list">
          <span><strong>Owner</strong><small>Field Team</small></span>
          <span><strong>Location</strong><small>Quest HQ / Files / Job photos</small></span>
          <span><strong>Linked job</strong><small>Mesa Storage Roof Repair</small></span>
          <span><strong>Sharing</strong><small>Internal team only</small></span>
        </div>
      </aside>
    </div>
  </div>`;
}

function folderGlyph() {
  return '<svg class="folder-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.2l2 2H19a2 2 0 0 1 2 2v1H3Z"/><path d="M3 10h18l-2 8.5A2 2 0 0 1 17 20H6.4a2 2 0 0 1-2-1.6Z"/></svg>';
}

function driveRailIcon(type) {
  const icons = {
    drive: '<path d="M4 7h7l2 2h7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M4 7a2 2 0 0 1 2-2h4l2 2"/>',
    shared: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M17 10h4"/><path d="M19 8v4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
    star: '<path d="m12 3 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9Z"/>',
    alert: '<path d="M12 3 2.5 20h19Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
  };
  return `<svg class="drive-rail-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.drive}</svg>`;
}

function fileIcon(type) {
  if (type === 'Image') return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m4 16 4-4 4 4 3-3 5 5"/><circle cx="15" cy="9" r="1.5"/></svg>';
  if (type === 'Drawing') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><path d="m7 16 9-9 3 3-9 9H7Z"/><path d="m14 9 3 3"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h5"/></svg>';
}

function ledger() {
  return `<div class="panel"><h2>Finance Ledger</h2><div class="table">${[['Mesa roof estimate', 'Sent', '$46K', '$0'], ['Queen Creek invoice', 'Overdue', '$8K', '$2K'], ['Drafting packet', 'Draft', '$14K', '$0']].map((row) => `<div>${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}</div></div>`;
}

function knowledgeList() {
  return cards('Article Library', ['Roof inspection SOP', 'Permit package checklist', 'Client follow-up script', 'Invoice handoff guide', 'Final walkthrough SOP']);
}

function automationRules() {
  return `<div class="pipeline">${['Trigger', 'Condition', 'Action', 'Log'].map((item) => `<section><h3>${item}</h3><button>${item === 'Trigger' ? 'New job created' : item === 'Condition' ? 'Company is Roofing' : item === 'Action' ? 'Create checklist' : 'Run saved'}</button></section>`).join('')}</div>`;
}

function analyticsOverview() {
  return `<div class="analytics-layout" data-analytics-page data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07">
    <section class="panel wide-panel">
      <div class="job-section-heading"><h2>Live Job Analytics</h2><span class="sync-pill" data-analytics-sync>Connecting...</span></div>
      <div class="analytics-breakdown" data-analytics-breakdown>
        <article class="empty-state">No Job Center records are in Supabase yet.</article>
      </div>
    </section>
    <section class="panel">
      <h2>Reporting Scope</h2>
      <div class="analytics-scope-list">
        <span><strong>Live today</strong><small>Jobs and companies from Supabase.</small></span>
        <span><strong>Moved here</strong><small>Top-level KPI cards are centralized instead of repeated on every workflow page.</small></span>
        <span><strong>Later</strong><small>Finance, tickets, forms, files, and task telemetry after those modules have real tables.</small></span>
      </div>
    </section>
  </div>`;
}

function analyticsModuleHealth() {
  const rows = [
    ['Jobs', 'Live Supabase table', 'Connected'],
    ['Companies', 'Admin-managed Supabase table', 'Connected'],
    ['TaskManagement', 'Bridge contract only', 'Planned'],
    ['Files, Forms, Finance, Tickets', 'No production tables yet', 'Not connected']
  ];
  return `<div class="panel"><h2>Module Health</h2><div class="table analytics-health-table">${rows.map((row) => `<div>${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}</div></div>`;
}

function templateCatalog() {
  return cards('Template Catalog', ['Roofing repair job pack', 'Roof replacement job pack', 'Drafting project pack', 'Lumen marketing pack', 'Internal admin pack']);
}

function adminUsers() {
  return `<div class="panel"><h2>User Access</h2><div class="table">${[['Maya Rosales', 'Supervisor', 'Roofing', 'Approved'], ['Noah Park', 'Worker', 'Drafting', 'Pending'], ['Andre Lee', 'Admin', 'All companies', 'Approved']].map((row) => `<div>${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}</div></div>`;
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function slugPage(value) {
  const key = slug(value);
  if (key === 'command-center') return 'index.html';
  if (key === 'taskmanagement-bridge') return 'task-management.html';
  return `${key}.html`;
}

function titleCase(value) {
  return String(value).split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function fileImage(category) {
  const map = {
    'Job photos': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    Permits: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80',
    Contracts: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    Estimates: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=80',
    Invoices: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
    Drawings: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
  };
  return map[category] || map['Job photos'];
}

const css = `:root{--ink:#121826;--muted:#617089;--line:#d9e0ea;--soft:#f5f7fb;--surface:#fff;--orange:#f45d22;--red:#dc2626;--shadow:0 18px 50px rgba(24,35,55,.08)}*{box-sizing:border-box}body{margin:0;background:#eef2f7;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}button,input,textarea{font:inherit}.app-shell{display:block;min-height:100vh}.sidebar{position:fixed;inset:0 auto 0 0;width:300px;height:100dvh;overflow-y:auto;background:#111a27;color:#eaf1fb;padding:18px;display:flex;flex-direction:column;gap:14px;z-index:20}.brand{display:flex;gap:12px;align-items:center;flex:0 0 auto}.brand-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:8px;background:var(--orange);font-weight:900}.brand strong,.brand small{display:block}.brand small,.sidebar-card p{color:#aebbd0}.build-badge{flex:0 0 auto;border:1px solid #324055;border-radius:999px;padding:8px 10px;color:#ffd8c7;font-size:12px;font-weight:800}.nav-list{display:grid;gap:6px;flex:0 0 auto}.nav-item{display:flex;align-items:center;gap:10px;border-radius:8px;padding:11px 12px;color:#cfe0f5}.nav-item span{display:grid;place-items:center;flex:0 0 auto;width:24px;height:24px;border:1px solid #425169;border-radius:6px;font-size:12px}.nav-item.active,.nav-item:hover{background:#2a1816;color:#fff;box-shadow:inset 3px 0 var(--orange)}.sidebar-card{margin-top:auto;border:1px solid #29384c;border-radius:8px;padding:14px;background:#121d2c;color:#eaf1fb}.main{min-width:0;min-height:100vh;margin-left:300px;padding:28px}.workspace{max-width:1440px;margin:0 auto}.page-heading{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.eyebrow{color:var(--orange);font-size:12px;font-weight:900;text-transform:uppercase}h1{font-size:34px;margin:4px 0 8px}h2,h3,p{margin-top:0}.muted,.page-heading p{color:var(--muted);line-height:1.5}.primary-button,.secondary-button,.danger-button{display:inline-flex;align-items:center;justify-content:center;border-radius:8px;min-height:42px;padding:0 14px;font-weight:850;cursor:pointer}.primary-button{border:0;background:var(--orange);color:#fff}.secondary-button{border:1px solid var(--line);background:#fff;color:#27364d}.danger-button{border:1px solid #fecaca;background:#fff;color:var(--red)}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.metric,.panel,.mini-card,.file-tile,.chart-card{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:16px}.metric span{display:block;color:var(--muted);font-size:12px;font-weight:850;text-transform:uppercase}.metric strong{display:block;margin-top:8px;font-size:28px}.command-grid,.builder-grid,.ticket-grid,.module-support-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:18px}.wide-panel{min-width:0}.timeline{display:grid;gap:10px}.timeline a,.table div,.record-list button{display:grid;grid-template-columns:minmax(0,1fr) repeat(4,auto);gap:12px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px;text-align:left}.hero-card{position:relative;min-height:220px;border-radius:8px;overflow:hidden;margin-bottom:18px;padding:26px;color:#fff;background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:var(--shadow)}.hero-card:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.86),rgba(15,23,42,.26))}.hero-card>*{position:relative}.hero-card strong{font-size:30px}.hero-card span{max-width:760px;color:#e5edf8;font-size:18px;line-height:1.45}.tabs{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;border-bottom:1px solid var(--line);margin-bottom:18px}.tabs button{white-space:nowrap;border:1px solid transparent;border-bottom:0;border-radius:8px 8px 0 0;background:transparent;min-height:42px;padding:0 16px;font-weight:900;color:var(--muted);cursor:pointer}.tabs button.active,.tabs button:hover{background:#fff;border-color:var(--line);color:var(--ink);box-shadow:0 -2px 0 var(--orange) inset}.tab-panel{display:none}.tab-panel.active{display:block}.pipeline,.card-grid,.file-grid,.dashboard-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.pipeline section{background:#fbfcfe;border:1px solid var(--line);border-radius:8px;padding:14px;min-height:150px}.pipeline button,.chip{display:block;width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;font-weight:800}.pipeline span,.mini-card span,.file-tile span{display:block;color:var(--muted);font-size:13px;margin-top:6px}.urgent{background:#fff7ed}.ticket-card{border:1px solid #fb923c;border-radius:8px;background:#fff;padding:14px}.ticket-card strong,.ticket-card span,.ticket-card b{display:block}.ticket-card b{margin-top:8px;color:var(--red)}.file-tile{padding:0;overflow:hidden}.file-tile img{width:100%;height:150px;object-fit:cover;display:block}.file-tile strong,.file-tile span{display:block;padding:0 14px}.file-tile strong{padding-top:12px}.file-tile span{padding-bottom:14px}.chart-card div{height:90px;margin-top:14px;border-radius:8px;background:linear-gradient(180deg,#fed7aa,#f45d22)}.bridge-card{display:flex;align-items:center;justify-content:center;gap:18px;background:#111a27;color:#fff;border-radius:8px;padding:34px;margin-bottom:18px}.bridge-card code{background:#fff;color:#111a27;border-radius:8px;padding:12px 16px}.record-layout{display:grid;grid-template-columns:minmax(260px,.45fr) minmax(0,1fr);gap:16px}.record-toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px}.record-list{display:grid;gap:8px}.record-list button{grid-template-columns:1fr auto;cursor:pointer}.record-list button.active{border-color:var(--orange);background:#fff8f5}.record-list strong,.record-list span{display:block}.record-list span{color:var(--muted);font-size:13px}.record-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.record-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:var(--muted)}.record-editor input,.record-editor textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:11px;background:#fff;color:var(--ink)}.span-2,.form-actions{grid-column:1/-1}.form-actions{display:flex;gap:10px;flex-wrap:wrap}@media(max-width:1180px){.metric-grid,.pipeline,.card-grid,.file-grid,.dashboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.command-grid,.builder-grid,.ticket-grid,.record-layout{grid-template-columns:1fr}}@media(max-width:820px){.sidebar{position:static;width:auto;height:auto;max-height:none}.main{margin-left:0;padding:16px}.sidebar-card{margin-top:0}.page-heading{display:grid}.metric-grid,.pipeline,.card-grid,.file-grid,.dashboard-grid,.command-grid,.builder-grid,.ticket-grid,.record-layout,.record-editor{grid-template-columns:1fr}.table div,.timeline a{grid-template-columns:1fr}.hero-card strong{font-size:24px}}`;

const sidebarPolishCss = `.sidebar{width:292px;padding:22px 16px 18px}.main{margin-left:292px}.brand{gap:12px;margin-bottom:6px}.brand-mark{width:46px;height:46px;border-radius:9px;font-size:23px}.brand strong{font-size:24px;line-height:1.05;color:#fff}.brand small{font-size:14px;margin-top:4px;color:#adc7e6}.build-badge{align-self:flex-start;border-color:#f45d22;background:#3a211f;color:#fff3ec;padding:8px 12px;font-size:13px}.nav-list{gap:7px;margin-top:6px}.nav-item{min-height:47px;gap:12px;border-radius:8px;padding:0 12px;font-size:18px;line-height:1;color:#cfe6ff}.nav-item .nav-icon{display:grid;place-items:center;flex:0 0 20px;width:20px;height:20px;border:0;border-radius:0;color:#b8c7dc}.nav-item .nav-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.nav-item .nav-label{display:block;width:auto;height:auto;border:0;border-radius:0;color:inherit;font-size:inherit}.nav-item.active{background:#3a211f;color:#fff;box-shadow:inset 4px 0 var(--orange)}.nav-item.active .nav-icon{color:#fff}.sidebar-card{font-size:14px;line-height:1.35}@media(max-width:820px){.sidebar{position:static;width:auto;height:auto;max-height:none;padding:18px}.main{margin-left:0;padding:16px}.brand strong{font-size:23px}.nav-item{font-size:18px}}`;

const plannedNavCss = `.nav-item.nav-planned,.nav-item.nav-planned:hover,.nav-item.nav-planned.active{background:rgba(148,163,184,.08);color:#7f8fa5;box-shadow:none;cursor:not-allowed;filter:grayscale(1)}.nav-item.nav-planned.active{box-shadow:inset 4px 0 #64748b}.nav-item.nav-planned .nav-icon{color:#6f8198}.nav-item.nav-planned .nav-icon svg{stroke-dasharray:3 3}.nav-item.nav-planned .nav-label{color:#7f8fa5}.nav-status{margin-left:auto;border:1px solid #53657c;border-radius:999px;background:#172234;color:#9fb0c6;padding:3px 7px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0}.nav-item:not(.nav-planned) .nav-status{display:none}@media(max-width:1180px){.nav-status{display:none}}`;

const fileViewerCss = `.drive-viewer{padding:0;overflow:hidden}.drive-topbar{display:grid;grid-template-columns:minmax(220px,1fr) minmax(260px,420px) auto;gap:14px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line);background:#fff}.drive-topbar h2{margin-bottom:3px}.drive-search{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:0 14px;min-height:42px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.drive-search input{border:0;background:transparent;outline:0;color:var(--ink);font-size:14px;text-transform:none;font-weight:650}.drive-shell{display:grid;grid-template-columns:190px minmax(0,1fr) 270px;min-height:560px}.drive-rail{border-right:1px solid var(--line);background:#f8fafc;padding:12px;display:grid;align-content:start;gap:6px}.drive-rail button{display:flex;align-items:center;gap:10px;border:0;border-radius:999px;background:transparent;color:#52627a;padding:10px 12px;text-align:left;font-weight:850;cursor:pointer}.drive-rail button.active,.drive-rail button:hover{background:#e8f0fe;color:#174ea6}.drive-rail-icon{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.drive-main{min-width:0;padding:18px;background:#fff}.drive-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.drive-section-title h3{margin:0;font-size:18px}.drive-section-title span{color:#617089;font-size:13px;font-weight:800}.drive-view-toggle{display:grid;grid-template-columns:repeat(3,5px);gap:4px;border:1px solid var(--line);border-radius:999px;padding:8px 10px}.drive-view-toggle span{width:5px;height:5px;border-radius:50%;background:#617089}.drive-folder-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px}.drive-folder-card{min-height:142px;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px;text-align:left;color:#172033;cursor:pointer;box-shadow:0 8px 24px rgba(24,35,55,.05)}.drive-folder-card:hover,.drive-folder-card.selected{border-color:#f97316;background:#fff8f5}.drive-folder-card.selected{box-shadow:inset 0 0 0 2px #fed7aa}.drive-folder-icon{display:grid;place-items:center;width:48px;height:40px;border-radius:8px;background:#fffbeb;margin-bottom:12px}.folder-glyph{width:34px;height:34px;fill:#fbbf24;stroke:#b45309;stroke-width:1.6;stroke-linejoin:round}.drive-folder-card strong,.drive-folder-card small,.drive-folder-card em{display:block}.drive-folder-card strong{font-size:16px}.drive-folder-card small{color:#617089;margin-top:6px}.drive-folder-card em{color:#52627a;font-style:normal;font-size:12px;font-weight:800;margin-top:10px}.recent-title{margin-top:24px}.drive-file-list{border:1px solid var(--line);border-radius:12px;overflow:hidden}.drive-file-row{display:grid;grid-template-columns:38px minmax(220px,1fr) 140px 90px 90px;gap:12px;align-items:center;width:100%;border:0;border-bottom:1px solid var(--line);background:#fff;padding:11px 12px;text-align:left;cursor:pointer}.drive-file-row:last-child{border-bottom:0}.drive-file-row:hover{background:#f8fafc}.drive-file-row strong{font-size:14px}.drive-file-row span:not(.file-type){color:#617089;font-size:13px;font-weight:750}.file-type{display:grid;place-items:center;width:30px;height:30px;border-radius:7px;background:#e8f0fe;color:#174ea6}.file-type.pdf{background:#fee2e2;color:#b91c1c}.file-type.drawing{background:#ecfdf5;color:#047857}.file-type svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.drive-details{border-left:1px solid var(--line);background:#fbfcfe;padding:18px}.drive-preview-card{display:grid;place-items:center;height:150px;border:1px solid #fde68a;border-radius:14px;background:linear-gradient(180deg,#fffbeb,#fff7ed);margin-bottom:16px}.drive-preview-card .folder-glyph{width:76px;height:76px}.drive-detail-list{display:grid;gap:10px;margin-top:16px}.drive-detail-list span{display:block;border-top:1px solid var(--line);padding-top:10px}.drive-detail-list strong,.drive-detail-list small{display:block}.drive-detail-list strong{font-size:12px;text-transform:uppercase;color:#617089}.drive-detail-list small{font-size:14px;font-weight:850;margin-top:3px}@media(max-width:1240px){.drive-shell{grid-template-columns:170px minmax(0,1fr)}.drive-details{grid-column:1/-1;border-left:0;border-top:1px solid var(--line)}.drive-folder-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}}@media(max-width:820px){.drive-topbar,.drive-shell,.drive-file-row{grid-template-columns:1fr}.drive-rail{border-right:0;border-bottom:1px solid var(--line)}.drive-folder-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.drive-file-row{gap:5px}}@media(max-width:560px){.drive-folder-grid{grid-template-columns:1fr}}`;

const fileCenterCss = `.file-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.file-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 180px minmax(260px,1fr) auto;gap:12px;align-items:end;margin-bottom:18px}.file-toolbar label,.file-upload-panel label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.file-toolbar input,.file-toolbar select,.file-upload-panel input,.file-upload-panel select,.file-upload-panel textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.file-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:18px}.file-browser,.file-detail-pane,.file-detail-full{min-width:0}.file-section-title{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:16px}.file-section-title h2{margin-bottom:4px}.file-capacity{display:grid;gap:6px;min-width:210px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.file-capacity b{display:block;height:10px;border-radius:999px;background:#e2e8f0;overflow:hidden}.file-capacity i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22c55e,#f97316);border-radius:inherit}.file-grid-live{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px;margin-bottom:18px}.file-card-live{display:grid;gap:0;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden;text-align:left;cursor:pointer;box-shadow:0 10px 26px rgba(24,35,55,.06)}.file-card-live:hover,.file-card-live.active{border-color:#f97316;background:#fff8f5}.file-thumb{display:grid;place-items:center;aspect-ratio:4/3;background:#eef2f7;color:#52627a;overflow:hidden}.file-thumb img{width:100%;height:100%;object-fit:cover;display:block}.file-doc-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:14px;background:#e8f0fe;color:#174ea6;font-weight:900}.file-doc-icon.pdf{background:#fee2e2;color:#b91c1c}.file-doc-icon.drawing{background:#ecfdf5;color:#047857}.file-card-live strong,.file-card-live span{display:block;padding:0 12px}.file-card-live strong{padding-top:12px;font-size:14px;line-height:1.25;word-break:break-word}.file-card-live span{padding-bottom:12px;color:#617089;font-size:12px;font-weight:800;margin-top:5px}.file-table-live{border:1px solid var(--line);border-radius:8px;overflow:hidden}.file-row-live{display:grid;grid-template-columns:minmax(220px,1.3fr) 120px 95px 150px 90px;gap:12px;align-items:center;width:100%;border:0;border-bottom:1px solid var(--line);background:#fff;padding:12px;text-align:left;cursor:pointer}.file-row-live:last-child{border-bottom:0}.file-row-live:hover,.file-row-live.active{background:#f8fafc}.file-row-live strong,.file-row-live span{display:block}.file-row-live span{color:#617089;font-size:13px;font-weight:750}.file-detail-preview{display:grid;place-items:center;min-height:210px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;margin-bottom:14px;overflow:hidden}.file-detail-preview img{width:100%;height:100%;max-height:280px;object-fit:contain;background:#111827}.file-detail-preview .file-doc-icon{width:84px;height:84px;font-size:18px}.file-detail-list{display:grid;gap:10px}.file-detail-list div{border-top:1px solid var(--line);padding-top:10px}.file-detail-list strong,.file-detail-list span{display:block}.file-detail-list strong{font-size:12px;text-transform:uppercase;color:#617089}.file-detail-list span{font-size:14px;font-weight:850;margin-top:4px;word-break:break-word}.file-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.file-upload-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.file-policy-note{border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;color:#9a3412;padding:12px}.file-policy-note strong,.file-policy-note span{display:block}.file-policy-note span{margin-top:4px;font-size:13px;line-height:1.45}.file-upload-log{display:grid;gap:8px}.file-upload-log div{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:10px;color:#52627a;font-size:13px;font-weight:750}.file-upload-log .error{border-color:#fecaca;background:#fef2f2;color:#991b1b}.file-upload-log .ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}@media(max-width:1220px){.file-metrics,.file-grid-live{grid-template-columns:repeat(2,minmax(0,1fr))}.file-layout{grid-template-columns:1fr}.file-detail-pane{order:-1}.file-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.file-metrics,.file-toolbar,.file-upload-panel,.file-row-live{grid-template-columns:1fr}.file-grid-live{grid-template-columns:1fr}.file-section-title{display:grid}.file-capacity{min-width:0}}`;

const jobCenterCss = `.job-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}.sync-pill{display:inline-flex;align-items:center;min-height:34px;border:1px solid var(--line);border-radius:999px;background:#fff;color:#52627a;padding:0 12px;font-size:12px;font-weight:900;text-transform:uppercase}.sync-pill.live{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.sync-pill.local{border-color:#fed7aa;background:#fff7ed;color:#9a3412}.sync-pill.error{border-color:#fecaca;background:#fef2f2;color:#991b1b}.job-command{display:grid;grid-template-columns:minmax(280px,1fr) 210px auto;gap:12px;align-items:center;margin-bottom:18px}.job-search{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:0 14px;min-height:42px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.job-search input,.job-command select,.job-editor input,.job-editor textarea,.job-editor select{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.job-search input{border:0;background:transparent;outline:0;text-transform:none;font-size:14px;font-weight:650}.job-board{display:grid;grid-template-columns:repeat(5,minmax(190px,1fr));gap:12px;align-items:start}.job-lane{min-height:340px;background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:12px}.job-lane h2{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:15px;margin-bottom:12px}.job-lane h2 span{display:grid;place-items:center;min-width:25px;height:25px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:12px;color:#52627a}.job-card{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer;box-shadow:0 10px 26px rgba(24,35,55,.06);margin-bottom:10px}.job-card:hover,.job-card.active{border-color:#f97316;background:#fff8f5}.job-card strong,.job-card span,.job-card small{display:block}.job-card strong{font-size:15px}.job-card span{color:#52627a;margin-top:6px}.job-card small{margin-top:10px;color:#617089;font-weight:800}.priority-urgent{box-shadow:inset 4px 0 #dc2626}.priority-high{box-shadow:inset 4px 0 #f97316}.priority-medium{box-shadow:inset 4px 0 #2563eb}.priority-low{box-shadow:inset 4px 0 #16a34a}.job-section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.job-section-heading h2{margin-bottom:0}.job-section-heading span{color:#617089;font-size:13px;font-weight:850}.job-table{display:grid;gap:8px}.job-row{display:grid;grid-template-columns:minmax(220px,1.2fr) 130px 150px 110px 110px 90px;gap:12px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px;text-align:left;cursor:pointer}.job-row:hover,.job-row.active{border-color:#f97316;background:#fff8f5}.job-row strong,.job-row span{display:block}.job-row span{color:#617089;font-size:13px;font-weight:750}.job-profile-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px}.job-profile-hero{min-height:220px;border-radius:8px;background:linear-gradient(90deg,rgba(17,24,39,.9),rgba(17,24,39,.35)),url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80');background-size:cover;background-position:center;color:#fff;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;margin-bottom:16px}.job-profile-hero h2{font-size:30px;margin-bottom:8px}.job-profile-hero p{max-width:820px;color:#e5edf8;margin-bottom:0}.job-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.job-detail-grid div,.job-sidecar div{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.job-detail-grid strong,.job-detail-grid span,.job-sidecar strong,.job-sidecar span{display:block}.job-detail-grid strong,.job-sidecar strong{font-size:12px;text-transform:uppercase;color:#617089}.job-detail-grid span,.job-sidecar span{margin-top:5px;font-weight:850}.job-sidecar{display:grid;gap:10px;align-content:start}.job-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.job-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.job-editor .span-2{grid-column:1/-1}.empty-state{border:1px dashed var(--line);border-radius:8px;padding:24px;background:#fbfcfe;color:#617089;font-weight:800;text-align:center}@media(max-width:1280px){.job-board{grid-template-columns:repeat(3,minmax(190px,1fr))}.job-profile-grid{grid-template-columns:1fr}.job-row{grid-template-columns:minmax(220px,1fr) repeat(3,auto)}}@media(max-width:860px){.job-command,.job-editor,.job-detail-grid,.job-row{grid-template-columns:1fr}.job-board{grid-template-columns:1fr}.job-actions{justify-content:flex-start}}`;

const coreDemoCss = `.ops-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:18px}.ops-job-list,.activity-feed,.quick-action-grid,.bridge-task-list,.bridge-contract>div{display:grid;gap:10px}.ops-job-list a,.quick-action-grid a,.activity-feed div,.bridge-task-list div,.bridge-contract span{display:block;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.ops-job-list a:hover,.quick-action-grid a:hover{border-color:#f97316;background:#fff8f5}.ops-job-list strong,.ops-job-list span,.quick-action-grid strong,.quick-action-grid span,.activity-feed strong,.activity-feed span,.bridge-task-list strong,.bridge-task-list span,.bridge-contract strong,.bridge-contract small{display:block}.ops-job-list span,.quick-action-grid span,.activity-feed span,.bridge-task-list span,.bridge-contract small{color:#617089;font-size:13px;margin-top:5px}.quick-action-grid a{font-weight:900}.linked-panel-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}.linked-panel-grid a{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.linked-panel-grid a:hover{border-color:#f97316;background:#fff8f5}.linked-panel-grid strong,.linked-panel-grid span,.linked-panel-grid small{display:block}.linked-panel-grid span{font-weight:900;margin-top:8px}.linked-panel-grid small{color:#617089;margin-top:4px}.job-activity-panel{margin-top:16px}.job-activity-panel div:not(.job-section-heading){display:grid;grid-template-columns:180px minmax(0,1fr);gap:12px;border-top:1px solid var(--line);padding:11px 0}.job-activity-panel strong,.job-activity-panel span{display:block}.job-activity-panel span{color:#617089}.bridge-hero{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:18px;align-items:center;background:#111a27;color:#fff;margin-bottom:18px}.bridge-hero div{display:grid;gap:8px}.bridge-hero span{color:#aebbd0;font-size:12px;font-weight:900;text-transform:uppercase}.bridge-hero code{display:block;overflow:hidden;text-overflow:ellipsis;background:#fff;color:#111a27;border-radius:8px;padding:12px;font-weight:850}.bridge-hero strong{color:#ffd8c7}.task-bridge-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px}.bridge-task-list div{display:grid;grid-template-columns:minmax(0,1fr) 128px 118px;gap:12px;align-items:center}.bridge-task-list b{display:inline-flex;justify-content:center;white-space:nowrap;border-radius:999px;padding:5px 10px;background:#e8f0fe;color:#174ea6}.bridge-task-list b.overdue{background:#fee2e2;color:#b91c1c}.bridge-contract span{display:grid;gap:4px}.bridge-contract code{display:block;overflow:hidden;text-overflow:ellipsis;border-radius:6px;background:#eef2f7;padding:8px;color:#172033}@media(max-width:1180px){.ops-dashboard-grid,.task-bridge-grid{grid-template-columns:1fr}.linked-panel-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bridge-hero{grid-template-columns:1fr}.bridge-task-list div{grid-template-columns:1fr}}@media(max-width:680px){.linked-panel-grid,.job-activity-panel div:not(.job-section-heading){grid-template-columns:1fr}}`;

const companyAdminCss = `.company-admin{padding:0;overflow:hidden}.company-admin-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:18px;border-bottom:1px solid var(--line);background:#fff}.company-admin-header h2{margin-bottom:4px}.company-admin-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.company-admin-layout{display:grid;grid-template-columns:minmax(320px,.85fr) minmax(360px,1fr);gap:0;min-height:520px}.company-list-wrap{border-right:1px solid var(--line);background:#f8fafc;padding:16px}.company-list{display:grid;gap:10px}.company-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer}.company-card:hover,.company-card.active{border-color:#f97316;background:#fff8f5}.company-card.active{box-shadow:inset 3px 0 var(--orange)}.company-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:8px;color:#fff;font-weight:900}.company-card strong,.company-card span,.company-card small{display:block}.company-card span{color:#617089;font-size:13px;margin-top:4px}.company-card small{font-size:12px;color:#52627a;font-weight:850;text-transform:uppercase}.company-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-content:start;padding:18px;background:#fff}.company-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.company-editor input{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.company-editor input[readonly]{background:#f8fafc;color:#617089}.company-policy-note{border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;color:#9a3412;padding:12px}.company-policy-note strong,.company-policy-note span{display:block}.company-policy-note span{margin-top:4px;font-size:13px;line-height:1.45}@media(max-width:1050px){.company-admin-layout{grid-template-columns:1fr}.company-list-wrap{border-right:0;border-bottom:1px solid var(--line)}}@media(max-width:680px){.company-admin-header,.company-editor{grid-template-columns:1fr}.company-admin-header{display:grid}.company-admin-actions{justify-content:flex-start}.company-card{grid-template-columns:42px minmax(0,1fr)}.company-card small{grid-column:2}.company-editor{grid-template-columns:1fr}}`;

const analyticsCss = `.analytics-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px}.analytics-stage-grid,.analytics-scope-list{display:grid;gap:10px}.analytics-stage-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.analytics-stage-grid span,.analytics-scope-list span{display:block;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.analytics-stage-grid strong,.analytics-stage-grid small,.analytics-scope-list strong,.analytics-scope-list small{display:block}.analytics-stage-grid small,.analytics-scope-list small{color:#617089;margin-top:5px}.analytics-health-table div{grid-template-columns:minmax(120px,.45fr) minmax(0,1fr) 120px}@media(max-width:1100px){.analytics-layout{grid-template-columns:1fr}.analytics-stage-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.analytics-stage-grid{grid-template-columns:1fr}}`;

const plannedTabsCss = `.tabs button.tab-planned,.tabs button.tab-planned:hover,.tabs button.tab-planned.active{color:#64748b;background:repeating-linear-gradient(135deg,#eef2f7 0,#eef2f7 8px,#e2e8f0 8px,#e2e8f0 16px);border-color:#94a3b8;box-shadow:none;cursor:not-allowed;opacity:1;filter:grayscale(1)}.tabs button.tab-planned.active{box-shadow:inset 0 -3px #94a3b8}.tabs button.tab-planned small{display:inline-flex;margin-left:8px;border:1px solid #94a3b8;border-radius:999px;background:#f8fafc;padding:2px 7px;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;vertical-align:middle}.tabs button:not(.tab-planned) small{display:none}@media(max-width:620px){.tabs button.tab-planned small{display:none}}`;

const js = `(() => {
  const storageKey = (moduleId) => 'quest-hq-static-' + moduleId;
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  document.querySelectorAll('[data-nav-state=\"planned\"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
  document.querySelectorAll('.tabs').forEach((tabs) => {
    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;
      if (button.dataset.tabState === 'planned') return;
      const name = button.dataset.tab;
      tabs.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === button));
      tabs.parentElement.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === name));
    });
  });
  document.querySelectorAll('[data-record-system]').forEach((system) => {
    const moduleId = system.dataset.recordSystem;
    const list = system.querySelector('[data-record-list]');
    const form = system.querySelector('[data-record-editor]');
    const key = storageKey(moduleId);
    let records = JSON.parse(localStorage.getItem(key) || 'null') || seed;
    let selected = 0;
    const save = () => localStorage.setItem(key, JSON.stringify(records));
    const render = () => {
      if (!records.length) records = [{ title: 'New record', status: 'Draft', owner: '', job: '', notes: '' }];
      selected = Math.min(selected, records.length - 1);
      list.innerHTML = records.map((record, index) => '<button type="button" class="' + (index === selected ? 'active' : '') + '" data-index="' + index + '"><span><strong>' + escapeHtml(record.title || 'Untitled') + '</strong><span>' + escapeHtml(record.status || 'Draft') + ' - ' + escapeHtml(record.job || 'No job linked') + '</span></span><b>Open</b></button>').join('');
      const record = records[selected];
      ['title','status','owner','job','notes'].forEach((name) => { form.elements[name].value = record[name] || ''; });
      save();
    };
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-index]');
      if (!button) return;
      selected = Number(button.dataset.index);
      render();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      records[selected] = Object.fromEntries(new FormData(form).entries());
      render();
    });
    system.querySelectorAll('[data-add-record]').forEach((button) => button.addEventListener('click', () => {
      records.unshift({ title: 'New ' + moduleId + ' record', status: 'Draft', owner: '', job: '', notes: '' });
      selected = 0;
      render();
    }));
    system.querySelector('[data-duplicate-record]')?.addEventListener('click', () => {
      records.splice(selected + 1, 0, { ...records[selected], title: records[selected].title + ' copy' });
      selected += 1;
      render();
    });
    system.querySelector('[data-delete-record]')?.addEventListener('click', () => {
      records.splice(selected, 1);
      selected = 0;
      render();
    });
    render();
  });
  document.querySelectorAll('[data-add-record]').forEach((button) => {
    if (button.closest('[data-record-system]')) return;
    button.addEventListener('click', () => {
      const system = document.querySelector('[data-record-system]');
      const editorTab = document.querySelector('[data-tab$="editor"], [data-tab="job-editor"], [data-tab="file-details"], [data-tab="ticket-editor"], [data-tab="record-editor"], [data-tab="access-editor"], [data-tab="view-editor"], [data-tab="rule-editor"], [data-tab="article-editor"], [data-tab="finance-editor"], [data-tab="template-editor"], [data-tab="form-editor"]');
      editorTab?.click();
      system?.querySelector('[data-add-record]')?.click();
    });
  });
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();`;

const jobCenterJs = `(() => {
  const center = document.querySelector('[data-job-center]');
  if (!center) return;

  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  const localKey = 'quest-hq-job-center';
  const lanes = ['Lead', 'Inspection', 'Estimate Approved', 'Production', 'QA Review'];
  const fields = ['id','name','company_id','client_name','contact_name','site_address','job_type','stage','priority','owner_name','scope','start_date','due_date','estimate_total','invoice_total','task_count','file_count','notes'];
  const defaultCompanies = [
    { id: 'quest-roofing', name: 'Quest Roofing', short_name: 'Roofing', color: '#f45d22' },
    { id: 'quest-drafting', name: 'Quest Drafting', short_name: 'Drafting', color: '#2563eb' },
    { id: 'lumen', name: 'Lumen', short_name: 'Lumen', color: '#7c3aed' }
  ];
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-job-sync]'),
    board: center.querySelector('[data-job-board]'),
    table: center.querySelector('[data-job-table]'),
    count: center.querySelector('[data-job-count]'),
    profile: center.querySelector('[data-job-profile]'),
    sidecar: center.querySelector('[data-job-sidecar]'),
    form: center.querySelector('[data-job-form]'),
    companySelect: center.querySelector('[data-job-company-select]'),
    search: center.querySelector('[data-job-search]'),
    stage: center.querySelector('[data-job-stage-filter]')
  };

  let companies = defaultCompanies.slice();
  let supabaseClient = null;
  let jobs = seed.map(normalizeJob);
  let selectedId = new URLSearchParams(window.location.search).get('job_id') || jobs[0]?.id || null;
  let source = 'local';

  init();

  async function init() {
    renderCompanyOptions();
    bindEvents();
    render();
    await connect();
    applyInitialRoute();
  }

  async function connect() {
    const url = center.dataset.supabaseUrl;
    const key = center.dataset.supabaseKey;
    if (!window.supabase || !url || !key) {
      setSync('Local fallback', 'local');
      return;
    }
    supabaseClient = window.supabase.createClient(url, key);
    await refreshCompanies();
    await refreshFromSupabase();
  }

  async function refreshCompanies() {
    if (!supabaseClient) {
      renderCompanyOptions();
      return;
    }
    const { data, error } = await supabaseClient
      .from('companies')
      .select('id,name,short_name,color')
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      companies = defaultCompanies.slice();
    } else {
      companies = Array.isArray(data) && data.length ? data : defaultCompanies.slice();
    }
    renderCompanyOptions();
  }

  async function refreshFromSupabase() {
    if (!supabaseClient) return;
    setSync('Syncing...', '');
    const { data, error } = await supabaseClient
      .from('jobs')
      .select('*, clients(name)')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      render();
      return;
    }
    source = 'supabase';
    jobs = (data || []).map(normalizeJob);
    selectedId = selectedId && jobs.some((job) => job.id === selectedId) ? selectedId : jobs[0]?.id || null;
    clearLocal();
    setSync('Supabase live', 'live');
    render();
  }

  function bindEvents() {
    center.querySelector('[data-job-new]')?.addEventListener('click', () => {
      const job = blankJob();
      jobs.unshift(job);
      selectedId = job.id;
      saveLocal();
      render();
      clickTab('editor');
    });
    center.querySelector('[data-job-refresh]')?.addEventListener('click', async () => {
      await refreshCompanies();
      await refreshFromSupabase();
    });
    nodes.search?.addEventListener('input', render);
    nodes.stage?.addEventListener('change', render);
    nodes.board?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    nodes.form?.addEventListener('submit', saveJob);
    center.querySelector('[data-job-duplicate]')?.addEventListener('click', duplicateJob);
    center.querySelector('[data-job-delete]')?.addEventListener('click', deleteJob);
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      center.querySelector('[data-job-new]')?.click();
      return;
    }
    if (params.get('tab')) clickTab(params.get('tab'));
  }

  function selectFromClick(event) {
    const item = event.target.closest('[data-job-id]');
    if (!item) return;
    selectedId = item.dataset.jobId;
    render();
    if (item.dataset.openProfile === 'true') clickTab('profile');
  }

  async function saveJob(event) {
    event.preventDefault();
    const payload = collectForm();
    const existingIndex = jobs.findIndex((job) => job.id === payload.id);
    if (supabaseClient) {
      setSync('Saving...', '');
      const savePayload = toDatabasePayload(payload);
      const isLocal = !payload.id || String(payload.id).startsWith('local-');
      const request = isLocal
        ? supabaseClient.from('jobs').insert(savePayload).select().single()
        : supabaseClient.from('jobs').update(savePayload).eq('id', payload.id).select().single();
      const { data, error } = await request;
      if (error) {
        console.error(error);
        setSync('Local fallback', 'error');
      } else {
        const saved = normalizeJob(data);
        if (existingIndex >= 0) jobs[existingIndex] = saved;
        else jobs.unshift(saved);
        selectedId = saved.id;
        source = 'supabase';
        setSync('Supabase live', 'live');
        clearLocal();
        render();
        return;
      }
    }
    if (existingIndex >= 0) jobs[existingIndex] = payload;
    else jobs.unshift(payload);
    selectedId = payload.id;
    saveLocal();
    render();
  }

  async function deleteJob() {
    const job = selectedJob();
    if (!job) return;
    if (supabaseClient && job.id && !String(job.id).startsWith('local-')) {
      setSync('Deleting...', '');
      const { error } = await supabaseClient.from('jobs').delete().eq('id', job.id);
      if (error) {
        console.error(error);
        setSync('Delete failed', 'error');
        return;
      }
      setSync('Supabase live', 'live');
    }
    jobs = jobs.filter((item) => item.id !== job.id);
    selectedId = jobs[0]?.id || null;
    saveLocal();
    render();
  }

  function duplicateJob() {
    const job = selectedJob();
    if (!job) return;
    const copy = { ...job, id: 'local-' + Date.now(), name: job.name + ' Copy', stage: 'Lead' };
    jobs.unshift(copy);
    selectedId = copy.id;
    saveLocal();
    render();
  }

  function render() {
    const visible = filteredJobs();
    if (selectedId && !jobs.some((job) => job.id === selectedId)) selectedId = jobs[0]?.id || null;
    renderMetrics();
    renderBoard(visible);
    renderTable(visible);
    renderProfile();
    fillForm();
  }

  function renderMetrics() {
    setOptionalMetric('active', jobs.filter((job) => job.stage !== 'Complete').length);
    setOptionalMetric('urgent', jobs.filter((job) => job.priority === 'Urgent').length);
    setOptionalMetric('tasks', sum('task_count'));
    setOptionalMetric('revenue', money.format(sum('estimate_total')));
  }

  function renderBoard(visible) {
    const boardLanes = lanes.map((lane) => {
      const items = visible.filter((job) => job.stage === lane);
      return '<section class=\"job-lane\"><h2>' + escapeHtml(lane) + '<span>' + items.length + '</span></h2>' +
        (items.length ? items.map(jobCard).join('') : '<div class=\"empty-state\">No jobs</div>') +
        '</section>';
    });
    nodes.board.innerHTML = boardLanes.join('');
  }

  function renderTable(visible) {
    nodes.count.textContent = visible.length + (visible.length === 1 ? ' job' : ' jobs');
    nodes.table.innerHTML = visible.length ? visible.map((job) => {
      return '<button type=\"button\" class=\"job-row ' + activeClass(job) + '\" data-job-id=\"' + escapeHtml(job.id) + '\" data-open-profile=\"true\">' +
        '<strong>' + escapeHtml(job.name) + '<span>' + escapeHtml(job.client_name || 'No client') + '</span></strong>' +
        '<span>' + escapeHtml(job.job_type || 'Job') + '</span>' +
        '<span>' + escapeHtml(job.stage || 'Lead') + '</span>' +
        '<span>' + escapeHtml(job.priority || 'Medium') + '</span>' +
        '<span>' + money.format(number(job.estimate_total)) + '</span>' +
        '<span>' + number(job.task_count) + ' tasks</span>' +
      '</button>';
    }).join('') : '<div class=\"empty-state\">No jobs match this view.</div>';
  }

  function renderProfile() {
    const job = selectedJob();
    if (!job) {
      nodes.profile.innerHTML = '<div class=\"empty-state\">Select or create a job.</div>';
      nodes.sidecar.innerHTML = '';
      return;
    }
    nodes.profile.innerHTML = '<div class=\"job-profile-hero\"><h2>' + escapeHtml(job.name) + '</h2><p>' + escapeHtml(job.scope || job.notes || 'No scope added yet.') + '</p></div>' +
      '<div class=\"job-detail-grid\">' +
      detail('Client', job.client_name || 'Unassigned') +
      detail('Contact', job.contact_name || 'Not set') +
      detail('Owner', job.owner_name || 'Unassigned') +
      detail('Site', job.site_address || 'No address') +
      detail('Stage', job.stage || 'Lead') +
      detail('Priority', job.priority || 'Medium') +
      detail('Estimate', money.format(number(job.estimate_total))) +
      detail('Invoice', money.format(number(job.invoice_total))) +
      detail('Due Date', job.due_date || 'Not set') +
      '</div>' +
      linkedPanels(job) +
      activityTimeline(job);
    nodes.sidecar.innerHTML = detail('TaskManagement Link', number(job.task_count) + ' linked tasks') +
      detail('Files', number(job.file_count) + ' files attached') +
      detail('Company', companyLabel(job.company_id)) +
      '<a class=\"secondary-button\" href=\"' + escapeHtml(bridgeUrl(job)) + '\">Open TaskManagement</a>' +
      '<a class=\"secondary-button\" href=\"' + escapeHtml(fileUrl(job)) + '\">Open Files</a>' +
      '<button class=\"primary-button\" type=\"button\" data-edit-selected>Edit Job</button>';
    nodes.sidecar.querySelector('[data-edit-selected]')?.addEventListener('click', () => clickTab('editor'));
  }

  function linkedPanels(job) {
    const taskOpen = Math.max(number(job.task_count) - completedTasks(job), 0);
    const items = [
      ['TaskManagement', number(job.task_count) + ' tasks', taskOpen + ' open / ' + completedTasks(job) + ' done', bridgeUrl(job)],
      ['Files & Photos', number(job.file_count) + ' files', 'Photos, permits, estimates, invoices', fileUrl(job)],
      ['Forms & Inspections', inspectionCount(job) + ' records', 'Inspection, approval, walkthrough', 'forms.html'],
      ['Finance', money.format(number(job.invoice_total)) + ' invoiced', money.format(number(job.estimate_total)) + ' estimate', 'finance.html']
    ];
    return '<div class=\"linked-panel-grid\">' + items.map((item) => '<a href=\"' + escapeHtml(item[3]) + '\"><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span><small>' + escapeHtml(item[2]) + '</small></a>').join('') + '</div>';
  }

  function activityTimeline(job) {
    return '<section class=\"job-activity-panel\"><div class=\"job-section-heading\"><h2>Activity Timeline</h2><span>Not connected</span></div><article class=\"empty-state\">No live activity events are connected yet.</article></section>';
  }

  function fillForm() {
    const job = selectedJob() || blankJob();
    renderCompanyOptions(job.company_id);
    fields.forEach((field) => {
      if (!nodes.form.elements[field]) return;
      nodes.form.elements[field].value = job[field] ?? '';
    });
  }

  function collectForm() {
    const data = Object.fromEntries(new FormData(nodes.form).entries());
    data.id = data.id || 'local-' + Date.now();
    ['estimate_total','invoice_total','task_count','file_count'].forEach((field) => data[field] = number(data[field]));
    return normalizeJob(data);
  }

  function toDatabasePayload(job) {
    return {
      company_id: job.company_id || 'quest-roofing',
      client_name: job.client_name || null,
      name: job.name || 'Untitled Job',
      contact_name: job.contact_name || null,
      site_address: job.site_address || null,
      job_type: job.job_type || 'Roofing',
      stage: job.stage || 'Lead',
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || null,
      scope: job.scope || null,
      start_date: job.start_date || null,
      due_date: job.due_date || null,
      estimate_total: number(job.estimate_total),
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count),
      file_count: number(job.file_count),
      notes: job.notes || null
    };
  }

  function filteredJobs() {
    const query = (nodes.search?.value || '').trim().toLowerCase();
    const stage = nodes.stage?.value || 'all';
    return jobs.filter((job) => {
      const stageMatch = stage === 'all' || job.stage === stage;
      const haystack = [job.name, job.client_name, job.owner_name, job.site_address, job.job_type, job.priority, job.stage].join(' ').toLowerCase();
      return stageMatch && (!query || haystack.includes(query));
    });
  }

  function selectedJob() {
    return jobs.find((job) => job.id === selectedId) || jobs[0] || null;
  }

  function jobCard(job) {
    return '<button type=\"button\" class=\"job-card ' + priorityClass(job.priority) + ' ' + activeClass(job) + '\" data-job-id=\"' + escapeHtml(job.id) + '\">' +
      '<strong>' + escapeHtml(job.name) + '</strong>' +
      '<span>' + escapeHtml(job.client_name || 'No client') + '</span>' +
      '<small>' + escapeHtml(job.priority || 'Medium') + ' / ' + money.format(number(job.estimate_total)) + '</small>' +
      '</button>';
  }

  function detail(label, value) {
    return '<div><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value) + '</span></div>';
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      company_id: job.company_id || companies[0]?.id || 'quest-roofing',
      client_name: job.client_name || job.clients?.name || '',
      name: job.name || job.title || 'Untitled Job',
      contact_name: job.contact_name || '',
      site_address: job.site_address || '',
      job_type: job.job_type || 'Roofing',
      stage: job.stage || job.status || 'Lead',
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || job.owner || '',
      scope: job.scope || '',
      start_date: job.start_date || '',
      due_date: job.due_date || job.end_date || '',
      estimate_total: number(job.estimate_total),
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count),
      file_count: number(job.file_count),
      notes: job.notes || ''
    };
  }

  function blankJob() {
    return normalizeJob({
      id: 'local-' + Date.now(),
      name: 'New Job',
      company_id: companies[0]?.id || 'quest-roofing',
      client_name: '',
      job_type: 'Roofing',
      stage: 'Lead',
      priority: 'Medium',
      owner_name: '',
      estimate_total: 0,
      invoice_total: 0,
      task_count: 0,
      file_count: 0
    });
  }

  function saveLocal() {
    localStorage.setItem(localKey, JSON.stringify(jobs));
  }

  function clearLocal() {
    localStorage.removeItem(localKey);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function setOptionalMetric(name, value) {
    const node = center.querySelector('[data-job-metric=\"' + name + '\"]');
    if (node) node.textContent = String(value);
  }

  function clickTab(name) {
    center.querySelector('[data-tab=\"' + name + '\"]')?.click();
  }

  function sum(field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function companyLabel(id) {
    const company = companies.find((item) => item.id === id);
    return company?.name || id || companies[0]?.name || 'Quest Roofing';
  }

  function renderCompanyOptions(selectedValue = nodes.companySelect?.value) {
    if (!nodes.companySelect) return;
    const list = companies.length ? companies : defaultCompanies;
    const exists = list.some((company) => company.id === selectedValue);
    const options = list.map((company) => '<option value=\"' + escapeHtml(company.id) + '\">' + escapeHtml(company.name) + '</option>');
    if (selectedValue && !exists) options.push('<option value=\"' + escapeHtml(selectedValue) + '\">' + escapeHtml(selectedValue) + '</option>');
    nodes.companySelect.innerHTML = options.join('');
    nodes.companySelect.value = selectedValue && (exists || selectedValue) ? selectedValue : list[0]?.id || '';
  }

  function bridgeUrl(job) {
    const params = new URLSearchParams({
      project_id: job.id,
      return_url: new URL('jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile', window.location.href).toString()
    });
    return 'https://task-management-quest.vercel.app?' + params.toString();
  }

  function fileUrl(job) {
    return 'files.html?job_id=' + encodeURIComponent(job.id);
  }

  function completedTasks(job) {
    return Math.min(Math.floor(number(job.task_count) * 0.58), number(job.task_count));
  }

  function inspectionCount(job) {
    return Math.max(1, Math.ceil(number(job.file_count) / 3));
  }

  function activeClass(job) {
    return job.id === selectedId ? 'active' : '';
  }

  function priorityClass(priority) {
    return 'priority-' + String(priority || 'medium').toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const fileCenterJs = `(() => {
  const center = document.querySelector('[data-file-center]');
  if (!center) return;

  const bucket = center.dataset.storageBucket || 'quest-job-files';
  const storageLimit = number(center.dataset.storageLimit || 1073741824);
  const requestedJobId = new URLSearchParams(window.location.search).get('job_id');
  const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-file-sync]'),
    job: center.querySelector('[data-file-job]'),
    category: center.querySelector('[data-file-category-filter]'),
    search: center.querySelector('[data-file-search]'),
    refresh: center.querySelector('[data-file-refresh]'),
    grid: center.querySelector('[data-file-grid]'),
    table: center.querySelector('[data-file-table]'),
    detail: center.querySelector('[data-file-detail]'),
    detailFull: center.querySelector('[data-file-detail-full]'),
    context: center.querySelector('[data-file-context]'),
    capacityLabel: center.querySelector('[data-file-capacity-label]'),
    capacityBar: center.querySelector('[data-file-capacity-bar]'),
    uploadForm: center.querySelector('[data-file-upload-form]'),
    fileInput: center.querySelector('[data-file-input]'),
    uploadLog: center.querySelector('[data-file-upload-log]')
  };

  let client = null;
  let jobs = [];
  let files = [];
  let usageBytes = 0;
  let selectedJobId = requestedJobId || '';
  let selectedFileId = '';

  init();

  async function init() {
    bindEvents();
    if (!window.supabase || !center.dataset.supabaseUrl || !center.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      renderEmpty('Supabase client is not available on this page.');
      return;
    }
    client = window.supabase.createClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    await refreshAll();
  }

  function bindEvents() {
    nodes.refresh?.addEventListener('click', refreshAll);
    nodes.job?.addEventListener('change', async () => {
      selectedJobId = nodes.job.value;
      selectedFileId = '';
      await refreshFiles();
    });
    nodes.category?.addEventListener('change', render);
    nodes.search?.addEventListener('input', render);
    nodes.grid?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    center.querySelector('[data-file-open-upload]')?.addEventListener('click', () => center.querySelector('[data-tab=\"upload-queue\"]')?.click());
    center.querySelector('[data-file-clear-input]')?.addEventListener('click', () => {
      nodes.fileInput.value = '';
      nodes.uploadLog.innerHTML = '';
    });
    nodes.uploadForm?.addEventListener('submit', uploadSelected);
  }

  async function refreshAll() {
    setSync('Syncing...', '');
    await loadJobs();
    await refreshFiles();
  }

  async function loadJobs() {
    const { data, error } = await client
      .from('jobs')
      .select('id,name,client_name,company_id,stage,priority,file_count')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Jobs unavailable', 'error');
      jobs = [];
      renderJobOptions();
      return;
    }
    jobs = data || [];
    if (!jobs.some((job) => job.id === selectedJobId)) selectedJobId = jobs[0]?.id || '';
    renderJobOptions();
  }

  async function refreshFiles() {
    if (!client) return;
    await refreshUsage();
    if (!selectedJobId) {
      files = [];
      setSync('No jobs yet', 'local');
      render();
      return;
    }
    const { data, error } = await client
      .from('job_files')
      .select('*')
      .eq('job_id', selectedJobId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Files unavailable', 'error');
      files = [];
      render();
      return;
    }
    files = await withPreviewUrls(data || []);
    selectedFileId = selectedFileId && files.some((file) => file.id === selectedFileId) ? selectedFileId : files[0]?.id || '';
    setSync('Supabase Storage live', 'live');
    render();
  }

  async function refreshUsage() {
    const { data, error } = await client
      .from('job_files')
      .select('size_bytes')
      .is('deleted_at', null);
    if (error) {
      console.error(error);
      usageBytes = 0;
      return;
    }
    usageBytes = (data || []).reduce((total, file) => total + number(file.size_bytes), 0);
  }

  async function withPreviewUrls(items) {
    return Promise.all(items.map(async (file) => {
      if (!isImage(file.mime_type)) return file;
      const { data, error } = await client.storage.from(bucket).createSignedUrl(file.object_path, 3600);
      if (error) {
        console.error(error);
        return file;
      }
      return { ...file, preview_url: data.signedUrl };
    }));
  }

  async function uploadSelected(event) {
    event.preventDefault();
    const selectedJob = currentJob();
    const selectedFiles = Array.from(nodes.fileInput.files || []);
    if (!selectedJob) return logUpload('Create or select a job before uploading.', 'error');
    if (!selectedFiles.length) return logUpload('Choose at least one file.', 'error');

    const form = new FormData(nodes.uploadForm);
    const category = String(form.get('category') || 'Other');
    const uploadedBy = String(form.get('uploaded_by_label') || 'Quest HQ Demo');
    const notes = String(form.get('notes') || '');
    let workingUsage = usageBytes;
    nodes.uploadLog.innerHTML = '';
    setSync('Uploading...', '');

    for (const file of selectedFiles) {
      if (workingUsage + file.size > storageLimit) {
        logUpload(file.name + ' would exceed the 1GB demo limit.', 'error');
        continue;
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : 'file-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      const objectPath = 'companies/' + safeSegment(selectedJob.company_id || 'company') + '/jobs/' + safeSegment(selectedJob.id) + '/' + id + '-' + safeFileName(file.name);
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(objectPath, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream' });
      if (uploadError) {
        console.error(uploadError);
        logUpload(file.name + ': upload failed - ' + uploadError.message, 'error');
        continue;
      }

      const payload = {
        id,
        company_id: selectedJob.company_id || 'quest-roofing',
        job_id: selectedJob.id,
        bucket_id: bucket,
        object_path: objectPath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        category,
        uploaded_by_label: uploadedBy,
        notes
      };
      const { error: insertError } = await client.from('job_files').insert(payload);
      if (insertError) {
        console.error(insertError);
        await client.storage.from(bucket).remove([objectPath]);
        logUpload(file.name + ': metadata save failed - ' + insertError.message, 'error');
        continue;
      }
      workingUsage += file.size;
      logUpload(file.name + ' uploaded.', 'ok');
    }

    nodes.fileInput.value = '';
    await refreshFiles();
    center.querySelector('[data-tab=\"job-files\"]')?.click();
  }

  async function deleteFile(id) {
    const file = files.find((item) => item.id === id);
    if (!file) return;
    if (!confirm('Delete ' + file.file_name + '?')) return;
    setSync('Deleting...', '');
    const { error: storageError } = await client.storage.from(bucket).remove([file.object_path]);
    if (storageError) console.error(storageError);
    const { error } = await client.from('job_files').update({ deleted_at: new Date().toISOString() }).eq('id', file.id);
    if (error) {
      console.error(error);
      setSync('Delete failed', 'error');
      return;
    }
    selectedFileId = '';
    await refreshFiles();
  }

  async function downloadFile(id) {
    const file = files.find((item) => item.id === id);
    if (!file) return;
    const { data, error } = await client.storage.from(bucket).createSignedUrl(file.object_path, 3600, { download: file.file_name });
    if (error) {
      console.error(error);
      setSync('Download failed', 'error');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  function renderJobOptions() {
    if (!nodes.job) return;
    nodes.job.innerHTML = jobs.length
      ? jobs.map((job) => '<option value=\"' + escapeHtml(job.id) + '\">' + escapeHtml(job.name) + ' - ' + escapeHtml(job.client_name || 'No client') + '</option>').join('')
      : '<option value=\"\">No jobs available</option>';
    nodes.job.value = selectedJobId;
  }

  function render() {
    const visible = filteredFiles();
    const job = currentJob();
    const selected = files.find((file) => file.id === selectedFileId) || visible[0] || null;
    if (selected) selectedFileId = selected.id;
    center.querySelector('[data-file-metric=\"count\"]').textContent = String(files.length);
    center.querySelector('[data-file-metric=\"used\"]').textContent = formatBytes(usageBytes);
    center.querySelector('[data-file-metric=\"limit\"]').textContent = formatBytes(storageLimit);
    center.querySelector('[data-file-metric=\"job\"]').textContent = job ? shortText(job.name, 18) : 'None';
    nodes.context.textContent = job ? (job.name + ' - ' + (job.client_name || 'No client')) : 'Create a job before uploading files.';
    nodes.capacityLabel.textContent = formatBytes(usageBytes) + ' of ' + formatBytes(storageLimit);
    nodes.capacityBar.style.width = Math.min(100, Math.round((usageBytes / storageLimit) * 100)) + '%';

    nodes.grid.innerHTML = visible.length ? visible.map(fileCard).join('') : '<div class=\"empty-state\">No files match this job view.</div>';
    nodes.table.innerHTML = visible.length ? visible.map(fileRow).join('') : '<div class=\"empty-state\">Upload job files to populate this table.</div>';
    renderDetails(selected);
  }

  function renderDetails(file) {
    if (!file) {
      const empty = '<div class=\"empty-state\">Select a file to inspect details.</div>';
      nodes.detail.innerHTML = empty;
      nodes.detailFull.innerHTML = empty;
      return;
    }
    const html = fileDetailHtml(file);
    nodes.detail.innerHTML = html;
    nodes.detailFull.innerHTML = html;
    center.querySelectorAll('[data-file-download]').forEach((button) => button.addEventListener('click', () => downloadFile(button.dataset.fileDownload)));
    center.querySelectorAll('[data-file-delete]').forEach((button) => button.addEventListener('click', () => deleteFile(button.dataset.fileDelete)));
  }

  function fileCard(file) {
    return '<button type=\"button\" class=\"file-card-live ' + activeClass(file) + '\" data-file-id=\"' + escapeHtml(file.id) + '\">' +
      '<span class=\"file-thumb\">' + thumb(file) + '</span>' +
      '<strong>' + escapeHtml(file.file_name) + '</strong>' +
      '<span>' + escapeHtml(file.category || fileTypeLabel(file)) + ' / ' + formatBytes(file.size_bytes) + '</span>' +
    '</button>';
  }

  function fileRow(file) {
    return '<button type=\"button\" class=\"file-row-live ' + activeClass(file) + '\" data-file-id=\"' + escapeHtml(file.id) + '\">' +
      '<strong>' + escapeHtml(file.file_name) + '<span>' + escapeHtml(file.notes || file.object_path) + '</span></strong>' +
      '<span>' + escapeHtml(file.category || 'Other') + '</span>' +
      '<span>' + formatBytes(file.size_bytes) + '</span>' +
      '<span>' + formatDate(file.created_at) + '</span>' +
      '<span>' + escapeHtml(fileTypeLabel(file)) + '</span>' +
    '</button>';
  }

  function fileDetailHtml(file) {
    return '<div class=\"file-detail-preview\">' + thumb(file, true) + '</div>' +
      '<h2>' + escapeHtml(file.file_name) + '</h2>' +
      '<p class=\"muted\">' + escapeHtml(file.notes || 'No notes saved for this file.') + '</p>' +
      '<div class=\"file-detail-list\">' +
        detail('Category', file.category || 'Other') +
        detail('Size', formatBytes(file.size_bytes)) +
        detail('MIME type', file.mime_type || 'application/octet-stream') +
        detail('Uploaded by', file.uploaded_by_label || 'Unknown') +
        detail('Uploaded', formatDate(file.created_at)) +
        detail('Storage path', file.object_path) +
      '</div>' +
      '<div class=\"file-detail-actions\">' +
        '<button class=\"primary-button\" type=\"button\" data-file-download=\"' + escapeHtml(file.id) + '\">Download</button>' +
        '<button class=\"danger-button\" type=\"button\" data-file-delete=\"' + escapeHtml(file.id) + '\">Delete</button>' +
      '</div>';
  }

  function selectFromClick(event) {
    const button = event.target.closest('[data-file-id]');
    if (!button) return;
    selectedFileId = button.dataset.fileId;
    render();
  }

  function filteredFiles() {
    const query = (nodes.search?.value || '').trim().toLowerCase();
    const category = nodes.category?.value || 'all';
    return files.filter((file) => {
      const categoryMatch = category === 'all' || file.category === category;
      const haystack = [file.file_name, file.mime_type, file.category, file.notes, file.uploaded_by_label].join(' ').toLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
  }

  function currentJob() {
    return jobs.find((job) => job.id === selectedJobId) || null;
  }

  function renderEmpty(message) {
    nodes.grid.innerHTML = '<div class=\"empty-state\">' + escapeHtml(message) + '</div>';
    nodes.table.innerHTML = '';
  }

  function thumb(file, large = false) {
    if (isImage(file.mime_type) && file.preview_url) return '<img src=\"' + escapeHtml(file.preview_url) + '\" alt=\"\">';
    const label = fileTypeLabel(file);
    const cls = label === 'PDF' ? 'pdf' : label === 'Drawing' ? 'drawing' : '';
    return '<span class=\"file-doc-icon ' + cls + '\">' + escapeHtml(large ? label : label.slice(0, 3).toUpperCase()) + '</span>';
  }

  function detail(label, value) {
    return '<div><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value || 'Not set') + '</span></div>';
  }

  function fileTypeLabel(file) {
    const mime = String(file.mime_type || '');
    const name = String(file.file_name || '').toLowerCase();
    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
    if (mime.startsWith('image/')) return 'Image';
    if (name.endsWith('.dwg') || name.endsWith('.dxf')) return 'Drawing';
    if (mime.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'Sheet';
    if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'Doc';
    return 'File';
  }

  function isImage(mime) {
    return String(mime || '').startsWith('image/');
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function logUpload(message, state) {
    nodes.uploadLog.insertAdjacentHTML('beforeend', '<div class=\"' + escapeHtml(state || '') + '\">' + escapeHtml(message) + '</div>');
  }

  function activeClass(file) {
    return file.id === selectedFileId ? 'active' : '';
  }

  function safeSegment(value) {
    return String(value || 'item').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  }

  function safeFileName(value) {
    return String(value || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
  }

  function shortText(value, max) {
    const text = String(value || '');
    return text.length > max ? text.slice(0, max - 1) + '...' : text;
  }

  function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }

  function formatBytes(value) {
    const bytes = number(value);
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 * 1024 ? 0 : 1) + ' GB';
    if (bytes >= 1024 * 1024) return money.format(bytes / 1024 / 1024) + ' MB';
    if (bytes >= 1024) return money.format(bytes / 1024) + ' KB';
    return money.format(bytes) + ' B';
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const companyAdminJs = `(() => {
  const admin = document.querySelector('[data-company-admin]');
  if (!admin) return;

  const builtInIds = new Set(['quest-roofing', 'quest-drafting', 'lumen']);
  const nodes = {
    sync: admin.querySelector('[data-company-sync]'),
    list: admin.querySelector('[data-company-list]'),
    form: admin.querySelector('[data-company-form]'),
    title: admin.querySelector('[data-company-form-title]'),
    refresh: admin.querySelector('[data-company-refresh]'),
    createNew: admin.querySelector('[data-company-new]'),
    deleteButton: admin.querySelector('[data-company-delete]')
  };

  let client = null;
  let companies = [];
  let selectedId = null;

  init();

  async function init() {
    bindEvents();
    if (!window.supabase || !admin.dataset.supabaseUrl || !admin.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      render();
      return;
    }
    client = window.supabase.createClient(admin.dataset.supabaseUrl, admin.dataset.supabaseKey);
    await loadCompanies();
  }

  function bindEvents() {
    nodes.refresh?.addEventListener('click', loadCompanies);
    nodes.createNew?.addEventListener('click', newCompany);
    nodes.deleteButton?.addEventListener('click', deleteCompany);
    nodes.form?.addEventListener('submit', saveCompany);
    nodes.form?.elements.name?.addEventListener('input', () => {
      const editing = nodes.form.elements.editing_id.value;
      const idInput = nodes.form.elements.id;
      if (!editing && !idInput.dataset.touched) idInput.value = slugify(nodes.form.elements.name.value);
    });
    nodes.form?.elements.id?.addEventListener('input', (event) => {
      event.currentTarget.dataset.touched = 'true';
      event.currentTarget.value = slugify(event.currentTarget.value);
    });
    nodes.list?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-company-id]');
      if (!button) return;
      selectedId = button.dataset.companyId;
      fillForm(selectedCompany());
      render();
    });
  }

  async function loadCompanies() {
    if (!client) return;
    setSync('Loading...', '');
    const { data, error } = await client.from('companies').select('id,name,short_name,color,created_at').order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      setSync('Load failed', 'error');
      render();
      return;
    }
    companies = data || [];
    selectedId = selectedId && companies.some((company) => company.id === selectedId) ? selectedId : companies[0]?.id || null;
    setSync('Supabase live', 'live');
    render();
    if (selectedId) fillForm(selectedCompany());
    else newCompany();
  }

  async function saveCompany(event) {
    event.preventDefault();
    if (!client) return;
    const form = nodes.form;
    const editingId = form.elements.editing_id.value;
    const payload = {
      id: slugify(form.elements.id.value),
      name: form.elements.name.value.trim(),
      short_name: form.elements.short_name.value.trim(),
      color: form.elements.color.value || '#f45d22'
    };
    if (!payload.id || !payload.name || !payload.short_name) {
      setSync('Missing fields', 'error');
      return;
    }
    setSync('Saving...', '');
    const request = editingId
      ? client.from('companies').update({ name: payload.name, short_name: payload.short_name, color: payload.color }).eq('id', editingId).select().single()
      : client.from('companies').insert(payload).select().single();
    const { data, error } = await request;
    if (error) {
      console.error(error);
      setSync('Save failed', 'error');
      return;
    }
    selectedId = data.id;
    await loadCompanies();
  }

  async function deleteCompany() {
    if (!client) return;
    const company = selectedCompany();
    if (!company) return;
    if (builtInIds.has(company.id)) {
      setSync('Built-in protected', 'local');
      return;
    }
    setSync('Deleting...', '');
    const { error } = await client.from('companies').delete().eq('id', company.id);
    if (error) {
      console.error(error);
      setSync('Delete blocked', 'error');
      return;
    }
    selectedId = null;
    await loadCompanies();
  }

  function newCompany() {
    selectedId = null;
    nodes.form.reset();
    nodes.form.elements.editing_id.value = '';
    nodes.form.elements.id.readOnly = false;
    delete nodes.form.elements.id.dataset.touched;
    nodes.form.elements.color.value = '#f45d22';
    nodes.title.textContent = 'New Company';
    nodes.deleteButton.disabled = true;
    render();
  }

  function fillForm(company) {
    if (!company) return newCompany();
    nodes.form.elements.editing_id.value = company.id;
    nodes.form.elements.id.value = company.id;
    nodes.form.elements.id.readOnly = true;
    nodes.form.elements.name.value = company.name || '';
    nodes.form.elements.short_name.value = company.short_name || '';
    nodes.form.elements.color.value = company.color || '#f45d22';
    nodes.title.textContent = 'Edit Company';
    nodes.deleteButton.disabled = builtInIds.has(company.id);
  }

  function render() {
    if (!companies.length) {
      nodes.list.innerHTML = '<div class=\"empty-state\">No companies yet. Create the first company on the right.</div>';
      return;
    }
    nodes.list.innerHTML = companies.map((company) => {
      const active = company.id === selectedId ? ' active' : '';
      const type = builtInIds.has(company.id) ? 'Built-in' : 'Custom';
      return '<button class=\"company-card' + active + '\" type=\"button\" data-company-id=\"' + escapeHtml(company.id) + '\">' +
        '<span class=\"company-logo\" style=\"background:' + escapeHtml(company.color || '#f45d22') + '\">' + escapeHtml(initials(company.name)) + '</span>' +
        '<span><strong>' + escapeHtml(company.name) + '</strong><span>' + escapeHtml(company.short_name || company.id) + '</span></span>' +
        '<small>' + type + '</small>' +
      '</button>';
    }).join('');
  }

  function selectedCompany() {
    return companies.find((company) => company.id === selectedId) || null;
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function initials(value) {
    const parts = String(value || 'Q').trim().split(/\\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'Q';
  }

  function slugify(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const analyticsJs = `(() => {
  const page = document.querySelector('[data-analytics-page]');
  if (!page) return;

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: page.querySelector('[data-analytics-sync]'),
    breakdown: page.querySelector('[data-analytics-breakdown]')
  };

  init();

  async function init() {
    if (!window.supabase || !page.dataset.supabaseUrl || !page.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      render([]);
      return;
    }
    const client = window.supabase.createClient(page.dataset.supabaseUrl, page.dataset.supabaseKey);
    const { data, error } = await client.from('jobs').select('id,name,stage,priority,estimate_total,task_count').order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Load failed', 'error');
      render([]);
      return;
    }
    render((data || []).map(normalizeJob));
    setSync('Supabase live', 'live');
  }

  function render(jobs) {
    setMetric('active', jobs.filter((job) => job.stage !== 'Complete').length);
    setMetric('urgent', jobs.filter((job) => job.priority === 'Urgent').length);
    setMetric('tasks', sum(jobs, 'task_count'));
    setMetric('pipeline', money.format(sum(jobs, 'estimate_total')));
    const byStage = ['Lead', 'Inspection', 'Estimate Approved', 'Production', 'QA Review', 'Complete'].map((stage) => {
      const count = jobs.filter((job) => job.stage === stage).length;
      return '<span><strong>' + escapeHtml(stage) + '</strong><small>' + count + ' jobs</small></span>';
    }).join('');
    nodes.breakdown.innerHTML = jobs.length
      ? '<div class=\"analytics-stage-grid\">' + byStage + '</div>'
      : '<article class=\"empty-state\">No Job Center records are in Supabase yet.</article>';
  }

  function setMetric(name, value) {
    const node = document.querySelector('[data-analytics-metric=\"' + name + '\"]');
    if (node) node.textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function normalizeJob(job) {
    return {
      stage: job.stage || 'Lead',
      priority: job.priority || 'Medium',
      estimate_total: number(job.estimate_total),
      task_count: number(job.task_count)
    };
  }

  function sum(jobs, field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const commandCenterJs = `(() => {
  const center = document.querySelector('[data-command-center]');
  if (!center) return;

  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]').map(normalizeJob);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-command-sync]'),
    jobs: center.querySelector('[data-command-jobs]'),
    activity: center.querySelector('[data-command-activity]'),
    count: center.querySelector('[data-command-count]')
  };

  init();

  async function init() {
    render(seed, 'local');
    if (!window.supabase) return setSync('Local fallback', 'local');
    const client = window.supabase.createClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    const { data, error } = await client.from('jobs').select('*').order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      return;
    }
    render((data || []).map(normalizeJob), 'live');
    setSync('Supabase live', 'live');
  }

  function render(jobs, mode) {
    const active = jobs.filter((job) => job.stage !== 'Complete');
    const urgent = jobs.filter((job) => job.priority === 'Urgent');
    setMetric('active', active.length);
    setMetric('urgent', urgent.length);
    setMetric('revenue', money.format(sum(jobs, 'estimate_total')));
    setMetric('tasks', sum(jobs, 'task_count'));
    nodes.count.textContent = active.length + (active.length === 1 ? ' active job' : ' active jobs');
    nodes.jobs.innerHTML = active.slice(0, 5).map((job) => {
      return '<a href=\"jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile\">' +
        '<strong>' + escapeHtml(job.name) + '</strong>' +
        '<span>' + escapeHtml(job.client_name || 'No client') + ' / ' + escapeHtml(job.stage || 'Lead') + ' / ' + money.format(number(job.estimate_total)) + '</span>' +
      '</a>';
    }).join('') || '<div class=\"empty-state\">No active jobs found.</div>';
    nodes.activity.innerHTML = buildActivity(jobs, mode).map((item) => '<div><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span></div>').join('');
  }

  function buildActivity(jobs, mode) {
    const first = jobs[0];
    return [
      ['Supabase status', mode === 'live' ? 'Live jobs loaded from Quest HQ project.' : 'Using local demo jobs.'],
      ['Priority review', (jobs.find((job) => job.priority === 'Urgent')?.name || first?.name || 'No urgent job') + ' is first in the operations queue.'],
      ['Task bridge ready', sum(jobs, 'task_count') + ' linked tasks represented through project_id.'],
      ['Demo boundary', 'Jobs are live; adjacent modules remain linked demo workspaces today.']
    ];
  }

  function setMetric(name, value) {
    center.querySelector('[data-command-metric=\"' + name + '\"]').textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      name: job.name || job.title || 'Untitled Job',
      client_name: job.client_name || job.clients?.name || '',
      stage: job.stage || job.status || 'Lead',
      priority: job.priority || 'Medium',
      estimate_total: number(job.estimate_total),
      task_count: number(job.task_count)
    };
  }

  function sum(jobs, field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const taskBridgeJs = `(() => {
  const bridge = document.querySelector('[data-task-bridge]');
  if (!bridge) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('project_id');
  const returnUrl = params.get('return_url');
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]').map(normalizeJob);
  const nodes = {
    sync: bridge.querySelector('[data-bridge-sync]'),
    returnLink: bridge.querySelector('[data-bridge-return]'),
    jobId: bridge.querySelector('[data-bridge-job-id]'),
    projectId: bridge.querySelector('[data-bridge-project-id]'),
    title: bridge.querySelector('[data-bridge-title]'),
    stage: bridge.querySelector('[data-bridge-stage]'),
    tasks: bridge.querySelector('[data-bridge-tasks]'),
    contract: bridge.querySelector('[data-bridge-contract]')
  };

  init();

  async function init() {
    render(pickJob(seed), 'local');
    if (!window.supabase) return setSync('Local fallback', 'local');
    const client = window.supabase.createClient(bridge.dataset.supabaseUrl, bridge.dataset.supabaseKey);
    const query = client.from('jobs').select('*');
    const request = requestedId ? query.eq('id', requestedId).limit(1) : query.order('updated_at', { ascending: false }).limit(1);
    const { data, error } = await request;
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      return;
    }
    render(pickJob((data || []).map(normalizeJob)), 'live');
    setSync('Supabase live', 'live');
  }

  function render(job, mode) {
    if (!job) {
      nodes.jobId.textContent = 'No job selected';
      nodes.projectId.textContent = 'No project_id';
      nodes.title.textContent = 'No job selected';
      nodes.stage.textContent = 'Create a job first';
      nodes.returnLink.href = 'jobs.html?action=new';
      setMetric('tasks', 0);
      setMetric('open', 0);
      setMetric('completed', 0);
      setMetric('overdue', 0);
      nodes.tasks.innerHTML = '<article class=\"empty-state\">No job is selected. Create a Job Center record first, then open the bridge from that job profile.</article>';
      nodes.contract.innerHTML =
        contractRow('project_id', 'No job selected') +
        contractRow('return_url', nodes.returnLink.href) +
        contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local fallback') +
        contractRow('future behavior', 'TaskManagement filters tasks when a real job id is provided.');
      return;
    }
    const completed = completedTasks(job);
    const open = Math.max(number(job.task_count) - completed, 0);
    const overdue = overdueTasks(job);
    nodes.jobId.textContent = job.id;
    nodes.projectId.textContent = job.id;
    nodes.title.textContent = job.name;
    nodes.stage.textContent = job.stage + ' / ' + job.priority;
    nodes.returnLink.href = returnUrl || 'jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile';
    setMetric('tasks', number(job.task_count));
    setMetric('open', open);
    setMetric('completed', completed);
    setMetric('overdue', overdue);
    nodes.tasks.innerHTML = '<article class=\"empty-state\">No live TaskManagement task rows are connected yet. This bridge shows the handoff contract and current job rollup only.</article>';
    nodes.contract.innerHTML =
      contractRow('project_id', job.id) +
      contractRow('return_url', nodes.returnLink.href) +
      contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local demo fallback') +
      contractRow('future behavior', 'TaskManagement filters tasks where task.project_id matches this job id.');
  }

  function pickJob(jobs) {
    return jobs.find((job) => job.id === requestedId) || jobs[0] || null;
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      name: job.name || job.title || 'Untitled Job',
      client_name: job.client_name || job.clients?.name || '',
      stage: job.stage || job.status || 'Lead',
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || job.owner || '',
      due_date: job.due_date || '',
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count)
    };
  }

  function contractRow(label, value) {
    return '<span><strong>' + escapeHtml(label) + '</strong><code>' + escapeHtml(value) + '</code></span>';
  }

  function setMetric(name, value) {
    const node = bridge.querySelector('[data-bridge-metric=\"' + name + '\"]');
    if (node) node.textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function completedTasks(job) {
    return Math.min(Math.floor(number(job.task_count) * 0.58), number(job.task_count));
  }

  function overdueTasks(job) {
    return job.priority === 'Urgent' ? 2 : job.priority === 'High' ? 1 : 0;
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

async function writeTarget(target) {
  const absolute = path.resolve(target);
  if (target !== '.') await rm(absolute, { recursive: true, force: true });
  await mkdir(path.join(absolute, 'assets'), { recursive: true });
  await writeFile(path.join(absolute, 'assets', 'quest-hq.css'), css + sidebarPolishCss + plannedNavCss + fileViewerCss + fileCenterCss + jobCenterCss + coreDemoCss + companyAdminCss + analyticsCss + plannedTabsCss);
  await writeFile(path.join(absolute, 'assets', 'quest-hq.js'), js + jobCenterJs + fileCenterJs + companyAdminJs + analyticsJs + commandCenterJs + taskBridgeJs);
  await writeFile(path.join(absolute, 'index.html'), commandPage());
  await writeFile(path.join(absolute, 'jobs.html'), jobsPage());
  await writeFile(path.join(absolute, 'task-management.html'), taskManagementPage());
  await writeFile(path.join(absolute, 'files.html'), filesPage());
  for (const module of Object.values(modules)) {
    if (module.file === 'files.html') continue;
    await writeFile(path.join(absolute, module.file), modulePage(module));
  }
  if (target === 'docs') await writeFile(path.join(absolute, '.nojekyll'), '');
}

for (const target of targets) {
  await writeTarget(target);
}
