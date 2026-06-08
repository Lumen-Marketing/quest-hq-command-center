import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const buildId = 'Static HTML Systems v8';
const targets = ['.', 'dist', 'docs'];

const nav = [
  ['index.html', 'Command Center', 'CC'],
  ['jobs.html', 'Jobs', 'JB'],
  ['task-management.html', 'TaskManagement', 'TM'],
  ['crm.html', 'CRM', 'CR'],
  ['forms.html', 'Forms & Surveys', 'FS'],
  ['tickets.html', 'Tickets', 'TK'],
  ['files.html', 'Files', 'FL'],
  ['finance.html', 'Finance', 'FN'],
  ['knowledge.html', 'Knowledge Base', 'KB'],
  ['automations.html', 'Automations', 'AU'],
  ['dashboards.html', 'Dashboards', 'DB'],
  ['templates.html', 'Templates', 'TP'],
  ['admin.html', 'Admin', 'AD']
];

const jobs = [
  ['Mesa Storage Roof Repair', 'Roofing', 'Production', 'High', '$46K'],
  ['Queen Creek Leak Follow-up', 'Roofing', 'Inspection', 'Urgent', '$8K'],
  ['Drafting Permit Package', 'Drafting', 'QA Review', 'Medium', '$14K'],
  ['Lumen Campaign Setup', 'Lumen', 'Estimate Approved', 'Medium', '$22K']
];

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
    eyebrow: 'Dashboards',
    title: 'Dashboard Studio',
    summary: 'Saved views for active jobs, stuck work, workload, time, AR, tickets, survey results, and client activity.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    metrics: [['Saved views', '9'], ['Pinned', '3'], ['Widgets', '24'], ['Filters', '11']],
    tabs: [
      ['Studio', dashboardStudio()],
      ['Saved Views', cards('Saved Views', ['Roofing weekly ops', 'Finance and AR', 'My work', 'Ticket SLA watch'])],
      ['View Editor', recordSystem('dashboards')]
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
    <link rel="stylesheet" href="assets/quest-hq.css" />
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
          ${nav.map(([href, label, icon]) => `<a class="nav-item ${href === file ? 'active' : ''}" href="${href}"><span>${icon}</span>${label}</a>`).join('')}
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
    <script src="assets/quest-hq.js" defer></script>
  </body>
</html>`;
}

function commandPage() {
  const content = `<section class="workspace">
    <div class="page-heading">
      <div><div class="eyebrow">Command Center</div><h1>Company-wide operating picture</h1><p>Local-first presentation build with real static HTML pages.</p></div>
      <a class="primary-button" href="jobs.html">Open Jobs</a>
    </div>
    <div class="metric-grid">
      ${metric('Active jobs', '18')}${metric('Open tickets', '9')}${metric('Outstanding AR', '$38K')}${metric('Tracked hours', '126h')}
    </div>
    <div class="command-grid">
      <section class="panel wide-panel"><h2>Presentation Flow</h2><div class="timeline">${['Command Center', 'Jobs', 'TaskManagement bridge', 'CRM', 'Tickets', 'Files', 'Finance'].map((item) => `<a href="${slugPage(item)}">${item}<span>Open</span></a>`).join('')}</div></section>
      <section class="panel"><h2>Local Saving</h2><p class="muted">Each module editor saves records to browser localStorage. Backend work stays deferred for the first presentation.</p></section>
    </div>
  </section>`;
  return shell({ file: 'index.html', title: 'Command Center', content });
}

function jobsPage() {
  const content = `<section class="workspace">
    <div class="page-heading"><div><div class="eyebrow">Jobs</div><h1>Job Center</h1><p>Jobs are parent containers for client, site, scope, files, forms, estimates, invoices, and linked tasks.</p></div><button class="primary-button" data-add-record>Add Job</button></div>
    <div class="metric-grid">${metric('Active', '18')}${metric('Urgent', '3')}${metric('Linked tasks', '64')}${metric('Revenue', '$126K')}</div>
    <div class="tabs" role="tablist"><button class="active" data-tab="list">Job List</button><button data-tab="profile">Profile</button><button data-tab="editor">Job Editor</button></div>
    <section class="tab-panel active" data-panel="list"><div class="panel"><h2>Job Pipeline</h2><div class="table">${jobs.map((job) => `<div><strong>${job[0]}</strong><span>${job[1]}</span><span>${job[2]}</span><span>${job[3]}</span><span>${job[4]}</span></div>`).join('')}</div></div></section>
    <section class="tab-panel" data-panel="profile"><div class="hero-card" style="background-image:url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80')"><strong>Mesa Storage Roof Repair</strong><span>Client, scope, site, files, forms, finance, and TaskManagement link.</span></div></section>
    <section class="tab-panel" data-panel="editor">${recordSystem('jobs')}</section>
  </section>`;
  return shell({
    file: 'jobs.html',
    title: 'Jobs',
    moduleId: 'jobs',
    content,
    seed: jobs.map((job) => ({ title: job[0], status: job[2], owner: job[1], job: job[4], notes: `${job[3]} priority job.` }))
  });
}

function taskManagementPage() {
  const content = `<section class="workspace">
    <div class="page-heading"><div><div class="eyebrow">TaskManagement</div><h1>Work Execution Bridge</h1><p>Quest HQ does not duplicate tasks. Jobs link to TaskManagement through the shared project relationship.</p></div><a class="primary-button" href="https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main">Open Repo</a></div>
    <div class="bridge-card"><code>job.id</code><span>maps to</span><code>task.project_id</code></div>
    <div class="command-grid"><section class="panel wide-panel"><h2>Related Task Rollup</h2><div class="table">${jobs.map((job, index) => `<div><strong>${job[0]}</strong><span>${8 + index} tasks</span><span>${index + 1} overdue</span><span>${12 + index * 3}h tracked</span></div>`).join('')}</div></section><section class="panel"><h2>Next Integration</h2><p class="muted">When backend work starts, Vercel routes can read the TaskManagement app by job/project ID.</p></section></div>
  </section>`;
  return shell({ file: 'task-management.html', title: 'TaskManagement', content });
}

function modulePage(module) {
  const content = `<section class="workspace module-page">
    <div class="page-heading"><div><div class="eyebrow">${module.eyebrow}</div><h1>${module.title}</h1><p>${module.summary}</p></div><button class="primary-button" data-add-record>Create Record</button></div>
    <div class="metric-grid">${module.metrics.map(([label, value]) => metric(label, value)).join('')}</div>
    <div class="hero-card" style="background-image:url('${module.image}')"><strong>${module.title}</strong><span>${module.summary}</span></div>
    <div class="tabs" role="tablist">${module.tabs.map(([label], index) => `<button class="${index === 0 ? 'active' : ''}" data-tab="${slug(label)}">${label}</button>`).join('')}</div>
    ${module.tabs.map(([label, body], index) => `<section class="tab-panel ${index === 0 ? 'active' : ''}" data-panel="${slug(label)}">${body}</section>`).join('')}
  </section>`;
  return shell({ file: module.file, title: module.title, moduleId: module.file.replace('.html', ''), content, seed: module.seed });
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

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
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
  return cards('Folder Groups', ['Job photos', 'Client documents', 'Permits', 'Contracts', 'Estimates', 'Invoices', 'Drawings', 'Marketing assets']);
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

function dashboardStudio() {
  return `<div class="dashboard-grid">${[['Active Jobs', '18'], ['Open Tickets', '9'], ['Outstanding AR', '$38K'], ['Tracked Hours', '126h']].map(([label, value]) => `<article class="chart-card"><span>${label}</span><strong>${value}</strong><div></div></article>`).join('')}</div>`;
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

const js = `(() => {
  const storageKey = (moduleId) => 'quest-hq-static-' + moduleId;
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  document.querySelectorAll('.tabs').forEach((tabs) => {
    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;
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

async function writeTarget(target) {
  const absolute = path.resolve(target);
  if (target !== '.') await rm(absolute, { recursive: true, force: true });
  await mkdir(path.join(absolute, 'assets'), { recursive: true });
  await writeFile(path.join(absolute, 'assets', 'quest-hq.css'), css);
  await writeFile(path.join(absolute, 'assets', 'quest-hq.js'), js);
  await writeFile(path.join(absolute, 'index.html'), commandPage());
  await writeFile(path.join(absolute, 'jobs.html'), jobsPage());
  await writeFile(path.join(absolute, 'task-management.html'), taskManagementPage());
  for (const module of Object.values(modules)) {
    await writeFile(path.join(absolute, module.file), modulePage(module));
  }
  if (target === 'docs') await writeFile(path.join(absolute, '.nojekyll'), '');
}

for (const target of targets) {
  await writeTarget(target);
}
