import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const buildId = 'Quest Auth Runtime Integration v6';
const assetVersion = buildId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const targets = ['.', 'dist', 'docs'];

const nav = [
  ['index.html', 'Command Center', 'home', 'live'],
  ['jobs.html', 'Jobs', 'briefcase', 'live'],
  ['task-management.html', 'TaskManagement', 'kanban', 'live'],
  ['crm.html', 'CRM', 'users', 'planned'],
  ['forms.html', 'Forms & Surveys', 'clipboard', 'live'],
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
  if (['files', 'forms'].includes(moduleId)) continue;
  module.metrics = module.metrics.map(([label]) => [label, '0']);
  module.tabs = module.tabs.map(([label]) => [label, emptyModuleWorkspace(moduleId, label)]);
  module.seed = [];
}

modules.admin.metrics = [['Users', '6'], ['Pending', '1'], ['Companies', 'Live'], ['Roles', '5']];
modules.admin.tabs = [
  ['Companies', adminCompanyManager()],
  ['Users & Roles', adminAccessCenter()],
  ['Approvals', adminApprovalCenter()],
  ['Team Chart', adminTeamChart()]
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
  <body class="auth-loading" data-page="${file}" data-module="${moduleId}">
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="index.html">
          <span class="brand-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Operations Command</small></span>
        </a>
        <div class="build-badge">${buildId}</div>
        <section class="quest-account" data-quest-account hidden>
          <button class="quest-account-main" type="button" data-quest-profile-open>
            <span class="quest-avatar" data-quest-avatar>Q</span>
            <span><strong data-quest-account-name>Loading account</strong><small data-quest-account-role>Checking access</small></span>
          </button>
          <div class="quest-account-actions">
            <button type="button" data-quest-profile-open>Profile</button>
            <button type="button" data-quest-sign-out>Sign out</button>
          </div>
        </section>
        <button class="tour-replay" type="button" data-tour-start>Walkthrough</button>
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
    <div class="modal-overlay" data-quest-profile-modal hidden>
      <section class="modal-panel quest-profile-panel" role="dialog" aria-modal="true" aria-labelledby="quest-profile-title">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Quest Account</span>
            <h2 id="quest-profile-title">Profile</h2>
          </div>
          <button class="secondary-button" type="button" data-quest-profile-close>Close</button>
        </div>
        <form class="quest-profile-form" data-quest-profile-form>
          <div class="quest-profile-preview">
            <span class="quest-avatar large" data-quest-profile-avatar>Q</span>
            <div>
              <strong data-quest-profile-email></strong>
              <span data-quest-profile-access></span>
            </div>
          </div>
          <label>Display name<input name="full_name" autocomplete="name" /></label>
          <label>Avatar image<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" /></label>
          <p class="muted">Quest HQ owns profile, avatar, login, approval, role, and company access. TaskManagement reads that session after launch.</p>
          <div class="form-actions">
            <button class="primary-button" type="submit">Save profile</button>
            <button class="secondary-button" type="button" data-quest-profile-close>Cancel</button>
          </div>
          <div class="quest-auth-message" data-quest-profile-message></div>
        </form>
      </section>
    </div>
    <div class="tour-overlay" data-tour-overlay hidden>
      <div class="tour-spotlight" data-tour-spotlight></div>
      <section class="tour-card" data-tour-card role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <div class="tour-card-head">
          <span data-tour-count></span>
          <button type="button" data-tour-skip>Skip</button>
        </div>
        <div class="tour-progress" data-tour-progress aria-hidden="true"></div>
        <h2 id="tour-title" data-tour-title>Welcome to Quest HQ</h2>
        <p data-tour-body></p>
        <div class="tour-actions">
          <button class="secondary-button" type="button" data-tour-back>Back</button>
          <button class="primary-button" type="button" data-tour-next>Next</button>
        </div>
      </section>
    </div>
    <script type="application/json" id="record-seed">${JSON.stringify(seed)}</script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/quest-hq.js?v=${assetVersion}" defer></script>
  </body>
</html>`;
}

function navItem({ href, label, icon, state, file }) {
  const planned = state === 'planned';
  const classes = ['nav-item', href === file ? 'active' : '', planned ? 'nav-planned' : ''].filter(Boolean).join(' ');
  const attrs = planned ? ' data-nav-state="planned" aria-disabled="true" title="Planned for a later build"' : '';
  return `<a class="${classes}" href="${href}"${attrs}><span class="nav-icon">${iconSvg(icon)}</span><span class="nav-label">${label}</span>${planned ? '<small class="nav-status">Planned</small>' : ''}</a>`;
}

function loginPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login | Quest HQ</title>
    <link rel="stylesheet" href="assets/quest-hq.css?v=${assetVersion}" />
  </head>
  <body class="login-page" data-page="login.html">
    <main class="quest-login-shell" data-quest-login>
      <section class="quest-login-panel">
        <div class="brand">
          <span class="brand-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Operations Command</small></span>
        </div>
        <div>
          <span class="eyebrow">Secure access</span>
          <h1>Sign in to Quest HQ</h1>
          <p class="muted">Use a Quest username or email for the operations command center and TaskManagement.</p>
        </div>
        <div class="quest-auth-tabs">
          <button class="active" type="button" data-auth-mode="signin">Sign in</button>
          <button type="button" data-auth-mode="signup">Create account</button>
        </div>
        <form class="quest-auth-form" data-auth-form="signin">
          <label>Username or email<input name="login" type="text" autocomplete="username" required /></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
          <button class="primary-button" type="submit">Sign in</button>
        </form>
        <form class="quest-auth-form" data-auth-form="signup" hidden>
          <label>Display name<input name="full_name" autocomplete="name" required /></label>
          <label>Username<input name="login" type="text" autocomplete="username" required /></label>
          <label>Password<input name="password" type="password" autocomplete="new-password" required minlength="8" /></label>
          <button class="primary-button" type="submit">Create account</button>
          <p class="muted">No email verification. The first account is approved automatically; later accounts wait for admin approval.</p>
        </form>
        <section class="quest-pending-card" data-auth-pending hidden>
          <h2>Awaiting approval</h2>
          <p class="muted">Your login exists, but a Quest admin still needs to approve your profile and assign access.</p>
          <div class="form-actions">
            <button class="secondary-button" type="button" data-auth-refresh>Check again</button>
            <button class="secondary-button" type="button" data-auth-sign-out>Sign out</button>
          </div>
        </section>
        <div class="quest-auth-message" data-auth-message></div>
      </section>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/quest-hq.js?v=${assetVersion}" defer></script>
  </body>
</html>`;
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
          <a href="task-management.html">TaskManagement<span>Job-scoped execution hub</span></a>
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
    <div class="job-command panel">
      <div class="job-search">
        <span>Search</span>
        <input data-job-search placeholder="Search jobs, clients, owners, addresses" />
      </div>
      <select data-job-stage-filter aria-label="Filter jobs by stage">
        <option value="all">All business statuses</option>
        <option>Lead</option>
        <option>Site Review</option>
        <option>Estimate</option>
        <option>Approved</option>
        <option>Active</option>
        <option>Closed</option>
      </select>
      <span class="sync-pill" data-job-sync>Connecting to Supabase...</span>
      <button class="secondary-button" type="button" data-job-refresh>Refresh</button>
      <button class="primary-button" type="button" data-job-new>Add Job Workspace</button>
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
        <div class="job-section-heading span-2"><h2 data-job-editor-title>Job Workspace</h2><span>Creates the business space for files, forms, finance, and TaskManagement handoff.</span></div>
        <label class="span-2">Workspace Name<input name="name" required placeholder="Client, site, or project name" /></label>
        <label>Company
          <select name="company_id" data-job-company-select></select>
        </label>
        <label>Client<input name="client_name" placeholder="Client or account name" /></label>
        <label>Contact<input name="contact_name" /></label>
        <label>Account Owner<input name="owner_name" placeholder="Internal business owner" /></label>
        <label>Job Type<input name="job_type" /></label>
        <label>Business Status
          <select name="stage">
            <option>Lead</option>
            <option>Site Review</option>
            <option>Estimate</option>
            <option>Approved</option>
            <option>Active</option>
            <option>Closed</option>
          </select>
        </label>
        <label>Client Urgency
          <select name="priority">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </label>
        <label>Estimate Total<input type="number" min="0" step="100" name="estimate_total" /></label>
        <label class="span-2">Site Address<input name="site_address" /></label>
        <label class="span-2">Scope<textarea name="scope" rows="4"></textarea></label>
        <label class="span-2">Notes<textarea name="notes" rows="4"></textarea></label>
        <div class="form-actions span-2">
          <button class="primary-button" type="submit">Save Workspace</button>
          <button class="secondary-button" type="button" data-job-modal-close>Close</button>
          <button class="secondary-button" type="button" data-job-duplicate>Duplicate</button>
          <button class="danger-button" type="button" data-job-delete>Delete</button>
        </div>
      </form>
    </section>
    <div class="modal-overlay" data-job-modal hidden>
      <div class="modal-panel job-modal-panel" role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
        <div class="modal-header">
          <div>
            <div class="eyebrow">Job Center</div>
            <h2 id="job-modal-title" data-job-modal-title>Create Job Workspace</h2>
          </div>
          <button class="secondary-button" type="button" data-job-modal-close>Close</button>
        </div>
        <div data-job-modal-body></div>
      </div>
    </div>
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaskManagement - Quest HQ</title>
  <meta http-equiv="refresh" content="0; url=taskmanagement/app.html" />
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f8fb;color:#172033;font-family:Inter,Arial,sans-serif}
    main{max-width:520px;padding:28px}
    a{color:#f45d22;font-weight:800}
  </style>
</head>
<body>
  <main>
    <h1>Opening TaskManagement</h1>
    <p>Quest HQ is loading the integrated TaskManagement runtime.</p>
    <p><a id="taskRuntimeLink" href="taskmanagement/app.html">Open TaskManagement</a></p>
  </main>
  <script>
    (function () {
      var target = new URL('taskmanagement/app.html', window.location.href);
      var params = new URLSearchParams(window.location.search);
      if (!params.has('return_url')) {
        params.set('return_url', new URL('jobs.html', window.location.href).toString());
      }
      target.search = params.toString();
      var link = document.getElementById('taskRuntimeLink');
      if (link) link.href = target.toString();
      window.location.replace(target.toString());
    })();
  </script>
</body>
</html>`;
}

function filesPage() {
  const content = `<section class="workspace file-center" data-file-center data-supabase-url="https://lpzotcznihwyyudxycmd.supabase.co" data-supabase-key="sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07" data-storage-bucket="quest-job-files" data-storage-limit="1073741824">
    <div class="drive-app panel">
      <div class="drive-header">
        <button class="primary-button" type="button" data-file-open-upload>New</button>
        <label class="drive-search-bar">
          <span>Search</span>
          <input data-file-search placeholder="Search in files" />
        </label>
        <select data-file-category-filter aria-label="Filter files by category">
          <option value="all">All categories</option>
          <option>Photo</option>
          <option>Permit</option>
          <option>Contract</option>
          <option>Estimate</option>
          <option>Invoice</option>
          <option>Drawing</option>
          <option>Other</option>
        </select>
        <span class="sync-pill" data-file-sync>Connecting...</span>
        <button class="secondary-button" type="button" data-file-refresh>Refresh</button>
      </div>

      <div class="drive-body">
        <aside class="drive-sidebar">
          <button class="drive-nav active" type="button" data-drive-filter="job-files">My Drive</button>
          <button class="drive-nav" type="button" data-drive-filter="recent">Recent</button>
          <button class="drive-nav" type="button" data-drive-filter="images">Images</button>
          <button class="drive-nav" type="button" data-drive-filter="documents">Documents</button>
          <div class="drive-storage">
            <strong>Storage</strong>
            <span data-file-capacity-label>0 MB of 1 GB</span>
            <b><i data-file-capacity-bar></i></b>
          </div>
          <div class="drive-job-select">
            <label>Current job space<select data-file-job></select></label>
          </div>
        </aside>

        <main class="drive-content">
          <div class="drive-content-bar">
            <div>
              <div class="drive-crumbs"><button type="button" data-drive-root>My Drive</button><span>/</span><strong data-file-crumb>Job files</strong></div>
              <p class="muted" data-file-context>No job selected.</p>
            </div>
            <div class="drive-view-actions" role="group" aria-label="File view mode">
              <button class="active" type="button" data-file-view="grid">Grid</button>
              <button type="button" data-file-view="list">List</button>
            </div>
          </div>

          <section class="drive-folder-section" data-folder-section>
            <div class="drive-section-heading"><h2>Job folders</h2><span data-file-metric="job">None</span></div>
            <div class="drive-folder-live-grid" data-drive-folders></div>
          </section>

          <section class="drive-files-section">
            <div class="drive-section-heading"><h2>Files</h2><span><strong data-file-metric="count">0</strong> stored / <strong data-file-metric="used">0 MB</strong></span></div>
            <div class="file-grid-live" data-file-grid></div>
            <div class="file-table-live" data-file-table hidden></div>
          </section>
        </main>

        <aside class="drive-details-pane" data-file-detail>
          <div class="empty-state">Select a file to inspect details.</div>
        </aside>
      </div>
    </div>

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
          <button class="secondary-button" type="button" data-file-modal-close>Close</button>
          <button class="secondary-button" type="button" data-file-clear-input>Clear</button>
        </div>
        <div class="file-upload-log span-2" data-file-upload-log></div>
      </form>
    </section>
    <div class="modal-overlay" data-file-modal hidden>
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="file-modal-title">
        <div class="modal-header">
          <div>
            <div class="eyebrow">File Center</div>
            <h2 id="file-modal-title">Upload Files</h2>
          </div>
          <button class="secondary-button" type="button" data-file-modal-close>Close</button>
        </div>
        <div data-file-modal-body></div>
      </div>
    </div>
  </section>`;
  return shell({ file: 'files.html', title: 'Files', moduleId: 'files', content, seed: [] });
}

function formsPage() {
  const content = `<section class="workspace forms-center" data-form-center>
    <div class="forms-command panel">
      <span class="sync-pill live" data-form-state>Local autosafe</span>
      <button class="secondary-button" type="button" data-form-export>Export JSON</button>
      <button class="primary-button" type="button" data-form-new>New Form</button>
    </div>

    <div class="forms-dashboard">
      <div class="metric"><span>Saved Forms</span><strong data-form-metric="forms">0</strong></div>
      <div class="metric"><span>Published</span><strong data-form-metric="published">0</strong></div>
      <div class="metric"><span>Responses</span><strong data-form-metric="responses">0</strong></div>
      <div class="metric"><span>Questions</span><strong data-form-metric="questions">0</strong></div>
    </div>

    <div class="tabs" role="tablist">
      <button class="active" data-tab="library">Library</button>
      <button data-tab="templates">Templates</button>
    </div>

    <section class="tab-panel active" data-panel="library">
      <div class="forms-library-grid">
        <section class="panel forms-library-panel">
          <div class="forms-toolbar">
            <label>Search<input data-form-search placeholder="Search forms, types, owners" /></label>
            <label>Type
              <select data-form-type-filter>
                <option value="all">All types</option>
                <option>Inspection</option>
                <option>Survey</option>
                <option>Approval</option>
                <option>Intake</option>
                <option>Checklist</option>
              </select>
            </label>
          </div>
          <div class="forms-list" data-form-list></div>
        </section>
        <article class="panel forms-summary" data-form-summary hidden></article>
      </div>
    </section>

    <section class="forms-builder-host" data-form-builder-host hidden>
      <div class="forms-builder-grid gform-editor" data-form-editor-mode="questions">
        <div class="gform-editor-tabs" role="tablist" aria-label="Form editor sections">
          <button class="active" type="button" data-form-editor-tab="questions">Questions</button>
          <button type="button" data-form-editor-tab="responses">Responses</button>
          <button type="button" data-form-editor-tab="settings">Settings</button>
        </div>
        <form class="panel forms-settings" data-form-settings>
          <div class="job-section-heading"><h2>Form</h2><span data-form-dirty>Unsaved draft</span></div>
          <label class="span-2">Title<input name="title" required placeholder="Roof inspection checklist" /></label>
          <label class="span-2">Description<textarea name="description" rows="3" placeholder="Purpose, audience, and completion notes"></textarea></label>
          <div class="gform-settings-fields span-2">
            <label>Type
              <select name="type">
                <option>Inspection</option>
                <option>Survey</option>
                <option>Approval</option>
                <option>Intake</option>
                <option>Checklist</option>
              </select>
            </label>
            <label>Status
              <select name="status">
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </label>
            <label>Audience<input name="audience" placeholder="Client, field team, admin, vendor" /></label>
            <label>Linked Job Context<input name="jobContext" placeholder="Optional job/client context" /></label>
            <label>Theme Color<input type="color" name="themeColor" value="#f45d22" /></label>
            <label>Background
              <select name="backgroundStyle">
                <option value="clean">Clean light</option>
                <option value="warm">Warm paper</option>
                <option value="blueprint">Blueprint</option>
                <option value="dark">Dark slate</option>
              </select>
            </label>
            <label class="span-2">Header Image URL<input name="headerImage" placeholder="Optional image URL for the respondent form header" /></label>
            <label>Submit Button Label<input name="buttonLabel" placeholder="Submit" /></label>
            <label class="forms-check"><input type="checkbox" name="collectEmail" /> Collect respondent email</label>
            <label class="forms-check"><input type="checkbox" name="requireApproval" /> Require internal review</label>
          </div>
          <div class="form-actions span-2">
            <button class="primary-button" type="submit">Save Form</button>
            <button class="secondary-button" type="button" data-form-publish>Publish</button>
            <button class="secondary-button" type="button" data-form-archive>Archive</button>
          </div>
        </form>

        <section class="question-workbench">
          <div class="question-canvas">
            <div class="gform-floating-toolbar" aria-label="Builder tools">
              <button type="button" data-question-add title="Add question">+</button>
              <button type="button" data-question-add-type="title" title="Add title block">T</button>
              <button type="button" data-question-add-type="section" title="Add section">=</button>
            </div>
            <div class="question-list" data-question-list></div>
            <button class="gform-add-question" type="button" data-question-add>+ Add question</button>
          </div>
          <div class="question-context-menu" data-question-menu hidden>
            <button type="button" data-menu-action="addBelow">Add question below</button>
            <button type="button" data-menu-action="duplicate">Duplicate</button>
            <button type="button" data-menu-action="moveUp">Move up</button>
            <button type="button" data-menu-action="moveDown">Move down</button>
            <button type="button" data-menu-action="delete">Delete</button>
          </div>
        </section>

        <section class="panel gform-modal-responses" data-form-editor-responses>
          <div class="job-section-heading"><h2>Responses</h2><span data-form-editor-response-count>0 responses</span></div>
          <div data-form-editor-response-list></div>
        </section>
      </div>
    </section>

    <section class="tab-panel" data-panel="preview">
      <div class="forms-preview-grid">
        <form class="panel response-form" data-response-form></form>
        <aside class="panel response-sidecar" data-response-sidecar></aside>
      </div>
    </section>

    <section class="tab-panel" data-panel="responses">
      <div class="forms-response-grid">
        <aside class="panel">
          <div class="job-section-heading"><h2>Response Inbox</h2><span data-response-count>0 responses</span></div>
          <div class="response-list" data-response-list></div>
        </aside>
        <article class="panel response-detail" data-response-detail>
          <div class="empty-state">Select a response to review submitted answers.</div>
        </article>
      </div>
    </section>

    <section class="tab-panel" data-panel="templates">
      <div class="forms-template-grid">
        <button type="button" data-form-template="inspection"><strong>Roof Inspection</strong><span>Photos, condition rating, repair recommendation, signoff.</span></button>
        <button type="button" data-form-template="survey"><strong>Client Survey</strong><span>NPS rating, quality feedback, follow-up permission.</span></button>
        <button type="button" data-form-template="approval"><strong>Estimate Approval</strong><span>Scope acceptance, payment acknowledgement, signature.</span></button>
        <button type="button" data-form-template="intake"><strong>Service Intake</strong><span>Client details, issue category, urgency, requested files.</span></button>
      </div>
    </section>
    <div class="modal-overlay" data-form-modal hidden>
      <div class="modal-panel form-modal-panel" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div class="modal-header">
          <div>
            <div class="eyebrow">Forms & Surveys</div>
            <h2 id="form-modal-title">Create Form</h2>
          </div>
          <button class="secondary-button" type="button" data-form-modal-close>Close</button>
        </div>
        <div class="form-modal-body" data-form-modal-body></div>
      </div>
    </div>
    <div class="modal-overlay" data-form-detail-modal hidden>
      <div class="modal-panel form-detail-modal-panel" role="dialog" aria-modal="true" aria-labelledby="form-detail-modal-title">
        <div class="modal-header">
          <div>
            <div class="eyebrow">Selected Form</div>
            <h2 id="form-detail-modal-title">Form Details</h2>
          </div>
          <button class="secondary-button" type="button" data-form-detail-close>Close</button>
        </div>
        <div class="form-detail-modal-body" data-form-detail-body></div>
      </div>
    </div>
  </section>`;
  return shell({ file: 'forms.html', title: 'Forms & Surveys', moduleId: 'forms', content, seed: [] });
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

function adminAccessCenter() {
  const people = taskManagementPeople();
  return `<div class="identity-admin-grid">
    <section class="panel identity-overview">
      <div class="job-section-heading"><h2>Login and Access Model</h2><span>TaskManagement import</span></div>
      <div class="identity-flow">
        <span><strong>auth.users</strong><small>Supabase account and session</small></span>
        <span><strong>profiles</strong><small>approval, role, company_ids, member_id</small></span>
        <span><strong>team_members</strong><small>task assignee, org chart, active roster</small></span>
        <span><strong>jobs.id</strong><small>feeds tasks.project_id</small></span>
      </div>
    </section>
    <section class="panel identity-table-panel">
      <div class="job-section-heading"><h2>Users and Roles</h2><span>${people.length} profiles</span></div>
      <div class="identity-table">
        ${people.map((person) => `<div>
          <strong>${person.name}<small>${person.email}</small></strong>
          <span>${person.role}</span>
          <span>${person.companies}</span>
          <b class="${person.approved ? 'ok' : 'warn'}">${person.approved ? 'Approved' : 'Pending'}</b>
        </div>`).join('')}
      </div>
    </section>
    <aside class="panel permission-panel">
      <h2>Role Permissions</h2>
      <div class="permission-list">
        ${[
          ['Worker / Sales', 'Own tasks, own time, job-scoped execution'],
          ['Supervisor', 'Team tasks, own time, hierarchy view'],
          ['Admin', 'Approvals, roles, clock admin, all assigned companies'],
          ['Developer', 'Debug access and all-company visibility']
        ].map((row) => `<span><strong>${row[0]}</strong><small>${row[1]}</small></span>`).join('')}
      </div>
    </aside>
  </div>`;
}

function adminApprovalCenter() {
  const approvals = [
    ['Adrian Alegria', 'New account', 'Lumen', 'Awaiting admin approval'],
    ['Andres', 'Company access', 'Drafting', 'Confirm drafting assignment'],
    ['Kristine', 'Supervisor link', 'Roofing', 'Reports to Jesus'],
    ['Sales role', 'Role policy', 'All companies', 'Sales remains worker-equivalent']
  ];
  return `<div class="identity-admin-grid">
    <section class="panel approval-board">
      <div class="job-section-heading"><h2>Approval Queue</h2><span>${approvals.length} items</span></div>
      <div class="approval-list">
        ${approvals.map((item, index) => `<article>
          <span>${String(index + 1).padStart(2, '0')}</span>
          <strong>${item[0]}<small>${item[1]}</small></strong>
          <em>${item[2]}</em>
          <b>${item[3]}</b>
        </article>`).join('')}
      </div>
    </section>
    <aside class="panel approval-policy">
      <h2>Approval Rules</h2>
      <p class="muted">New users can sign up, but they should not enter Job Center or TaskManagement until a profile is approved and assigned to one or more companies.</p>
      <div class="permission-list">
        <span><strong>Pending</strong><small>Can only see waiting screen.</small></span>
        <span><strong>Approved</strong><small>Can access modules allowed by role.</small></span>
        <span><strong>Company scoped</strong><small>Sees only jobs and tasks for assigned companies.</small></span>
      </div>
    </aside>
  </div>`;
}

function adminTeamChart() {
  return `<div class="panel team-chart-panel">
    <div class="job-section-heading"><h2>Team Chart</h2><span>Profiles to team_members</span></div>
    <div class="team-chart">
      <article class="team-node lead"><strong>Abraham Maldonado</strong><span>Admin / All companies</span></article>
      <div class="team-branches">
        <section>
          <article class="team-node"><strong>Alkeith Cabezzas</strong><span>Supervisor / Roofing</span></article>
          <article class="team-node"><strong>Kristine</strong><span>Worker / Roofing</span></article>
        </section>
        <section>
          <article class="team-node"><strong>Jesus</strong><span>Supervisor / Roofing</span></article>
          <article class="team-node"><strong>Andres</strong><span>Worker / Drafting</span></article>
        </section>
        <section>
          <article class="team-node"><strong>Adrian Alegria</strong><span>Pending / Lumen</span></article>
        </section>
      </div>
    </div>
  </div>`;
}

function taskManagementPeople() {
  return [
    { name: 'Abraham Maldonado', email: 'abraham@quest.com', role: 'Admin', companies: 'Roofing, Drafting, Lumen', approved: true },
    { name: 'Alkeith Cabezzas', email: 'alkeith@questroofing.com', role: 'Supervisor', companies: 'Roofing', approved: true },
    { name: 'Kristine', email: 'kristine@questroofing.com', role: 'Worker', companies: 'Roofing', approved: true },
    { name: 'Jesus', email: 'jesus@questroofing.com', role: 'Supervisor', companies: 'Roofing', approved: true },
    { name: 'Andres', email: 'andres@questdrafting.com', role: 'Worker', companies: 'Drafting', approved: true },
    { name: 'Adrian Alegria', email: 'adrian@lumen.com', role: 'Member', companies: 'Lumen', approved: false }
  ];
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

const modalCss = `.modal-overlay[hidden]{display:none}.modal-overlay{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(15,23,42,.58);padding:22px}.modal-panel{width:min(980px,calc(100vw - 44px));max-height:calc(100vh - 44px);overflow:auto;border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 28px 90px rgba(15,23,42,.34)}.modal-header{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid var(--line);background:#fff;padding:16px 18px}.modal-header h2{margin:3px 0 0}.job-modal-panel .job-editor,.file-modal-panel .file-upload-panel{border:0;border-radius:0;box-shadow:none}.job-modal-panel .job-editor>.job-section-heading,.file-modal-panel .file-upload-panel>.job-section-heading{display:none}.job-modal-panel .job-editor .form-actions,.file-modal-panel .file-upload-panel .form-actions{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);padding-top:12px}.job-modal-panel [data-job-modal-close],.file-modal-panel [data-file-modal-close]{display:inline-flex}body.modal-open{overflow:hidden}@media(max-width:760px){.modal-overlay{padding:10px}.modal-panel{width:calc(100vw - 20px);max-height:calc(100vh - 20px)}.modal-header{display:grid}.job-modal-panel .job-editor,.file-modal-panel .file-upload-panel{grid-template-columns:1fr}}`;

const plannedNavCss = `.nav-item.nav-planned,.nav-item.nav-planned:hover,.nav-item.nav-planned.active{background:rgba(148,163,184,.08);color:#7f8fa5;box-shadow:none;cursor:not-allowed;filter:grayscale(1)}.nav-item.nav-planned.active{box-shadow:inset 4px 0 #64748b}.nav-item.nav-planned .nav-icon{color:#6f8198}.nav-item.nav-planned .nav-icon svg{stroke-dasharray:3 3}.nav-item.nav-planned .nav-label{color:#7f8fa5}.nav-status{margin-left:auto;border:1px solid #53657c;border-radius:999px;background:#172234;color:#9fb0c6;padding:3px 7px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0}.nav-item:not(.nav-planned) .nav-status{display:none}@media(max-width:1180px){.nav-status{display:none}}`;

const fileViewerCss = `.drive-viewer{padding:0;overflow:hidden}.drive-topbar{display:grid;grid-template-columns:minmax(220px,1fr) minmax(260px,420px) auto;gap:14px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line);background:#fff}.drive-topbar h2{margin-bottom:3px}.drive-search{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:0 14px;min-height:42px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.drive-search input{border:0;background:transparent;outline:0;color:var(--ink);font-size:14px;text-transform:none;font-weight:650}.drive-shell{display:grid;grid-template-columns:190px minmax(0,1fr) 270px;min-height:560px}.drive-rail{border-right:1px solid var(--line);background:#f8fafc;padding:12px;display:grid;align-content:start;gap:6px}.drive-rail button{display:flex;align-items:center;gap:10px;border:0;border-radius:999px;background:transparent;color:#52627a;padding:10px 12px;text-align:left;font-weight:850;cursor:pointer}.drive-rail button.active,.drive-rail button:hover{background:#e8f0fe;color:#174ea6}.drive-rail-icon{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.drive-main{min-width:0;padding:18px;background:#fff}.drive-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.drive-section-title h3{margin:0;font-size:18px}.drive-section-title span{color:#617089;font-size:13px;font-weight:800}.drive-view-toggle{display:grid;grid-template-columns:repeat(3,5px);gap:4px;border:1px solid var(--line);border-radius:999px;padding:8px 10px}.drive-view-toggle span{width:5px;height:5px;border-radius:50%;background:#617089}.drive-folder-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px}.drive-folder-card{min-height:142px;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px;text-align:left;color:#172033;cursor:pointer;box-shadow:0 8px 24px rgba(24,35,55,.05)}.drive-folder-card:hover,.drive-folder-card.selected{border-color:#f97316;background:#fff8f5}.drive-folder-card.selected{box-shadow:inset 0 0 0 2px #fed7aa}.drive-folder-icon{display:grid;place-items:center;width:48px;height:40px;border-radius:8px;background:#fffbeb;margin-bottom:12px}.folder-glyph{width:34px;height:34px;fill:#fbbf24;stroke:#b45309;stroke-width:1.6;stroke-linejoin:round}.drive-folder-card strong,.drive-folder-card small,.drive-folder-card em{display:block}.drive-folder-card strong{font-size:16px}.drive-folder-card small{color:#617089;margin-top:6px}.drive-folder-card em{color:#52627a;font-style:normal;font-size:12px;font-weight:800;margin-top:10px}.recent-title{margin-top:24px}.drive-file-list{border:1px solid var(--line);border-radius:12px;overflow:hidden}.drive-file-row{display:grid;grid-template-columns:38px minmax(220px,1fr) 140px 90px 90px;gap:12px;align-items:center;width:100%;border:0;border-bottom:1px solid var(--line);background:#fff;padding:11px 12px;text-align:left;cursor:pointer}.drive-file-row:last-child{border-bottom:0}.drive-file-row:hover{background:#f8fafc}.drive-file-row strong{font-size:14px}.drive-file-row span:not(.file-type){color:#617089;font-size:13px;font-weight:750}.file-type{display:grid;place-items:center;width:30px;height:30px;border-radius:7px;background:#e8f0fe;color:#174ea6}.file-type.pdf{background:#fee2e2;color:#b91c1c}.file-type.drawing{background:#ecfdf5;color:#047857}.file-type svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.drive-details{border-left:1px solid var(--line);background:#fbfcfe;padding:18px}.drive-preview-card{display:grid;place-items:center;height:150px;border:1px solid #fde68a;border-radius:14px;background:linear-gradient(180deg,#fffbeb,#fff7ed);margin-bottom:16px}.drive-preview-card .folder-glyph{width:76px;height:76px}.drive-detail-list{display:grid;gap:10px;margin-top:16px}.drive-detail-list span{display:block;border-top:1px solid var(--line);padding-top:10px}.drive-detail-list strong,.drive-detail-list small{display:block}.drive-detail-list strong{font-size:12px;text-transform:uppercase;color:#617089}.drive-detail-list small{font-size:14px;font-weight:850;margin-top:3px}@media(max-width:1240px){.drive-shell{grid-template-columns:170px minmax(0,1fr)}.drive-details{grid-column:1/-1;border-left:0;border-top:1px solid var(--line)}.drive-folder-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}}@media(max-width:820px){.drive-topbar,.drive-shell,.drive-file-row{grid-template-columns:1fr}.drive-rail{border-right:0;border-bottom:1px solid var(--line)}.drive-folder-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.drive-file-row{gap:5px}}@media(max-width:560px){.drive-folder-grid{grid-template-columns:1fr}}`;

const fileCenterCss = `.file-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.file-toolbar{display:grid;grid-template-columns:minmax(210px,.85fr) 170px minmax(260px,1fr) auto auto auto;gap:12px;align-items:end;margin-bottom:18px}.file-toolbar label,.file-upload-panel label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.file-toolbar input,.file-toolbar select,.file-upload-panel input,.file-upload-panel select,.file-upload-panel textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.file-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:18px}.file-browser,.file-detail-pane,.file-detail-full{min-width:0}.file-section-title{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:16px}.file-section-title h2{margin-bottom:4px}.file-capacity{display:grid;gap:6px;min-width:210px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.file-capacity b{display:block;height:10px;border-radius:999px;background:#e2e8f0;overflow:hidden}.file-capacity i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22c55e,#f97316);border-radius:inherit}.file-grid-live{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px;margin-bottom:18px}.file-card-live{display:grid;gap:0;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden;text-align:left;cursor:pointer;box-shadow:0 10px 26px rgba(24,35,55,.06)}.file-card-live:hover,.file-card-live.active{border-color:#f97316;background:#fff8f5}.file-thumb{display:grid;place-items:center;aspect-ratio:4/3;background:#eef2f7;color:#52627a;overflow:hidden}.file-thumb img{width:100%;height:100%;object-fit:cover;display:block}.file-doc-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:14px;background:#e8f0fe;color:#174ea6;font-weight:900}.file-doc-icon.pdf{background:#fee2e2;color:#b91c1c}.file-doc-icon.drawing{background:#ecfdf5;color:#047857}.file-card-live strong,.file-card-live span{display:block;padding:0 12px}.file-card-live strong{padding-top:12px;font-size:14px;line-height:1.25;word-break:break-word}.file-card-live span{padding-bottom:12px;color:#617089;font-size:12px;font-weight:800;margin-top:5px}.file-table-live{border:1px solid var(--line);border-radius:8px;overflow:hidden}.file-row-live{display:grid;grid-template-columns:minmax(220px,1.3fr) 120px 95px 150px 90px;gap:12px;align-items:center;width:100%;border:0;border-bottom:1px solid var(--line);background:#fff;padding:12px;text-align:left;cursor:pointer}.file-row-live:last-child{border-bottom:0}.file-row-live:hover,.file-row-live.active{background:#f8fafc}.file-row-live strong,.file-row-live span{display:block}.file-row-live span{color:#617089;font-size:13px;font-weight:750}.file-detail-preview{display:grid;place-items:center;min-height:210px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;margin-bottom:14px;overflow:hidden}.file-detail-preview img{width:100%;height:100%;max-height:280px;object-fit:contain;background:#111827}.file-detail-preview .file-doc-icon{width:84px;height:84px;font-size:18px}.file-detail-list{display:grid;gap:10px}.file-detail-list div{border-top:1px solid var(--line);padding-top:10px}.file-detail-list strong,.file-detail-list span{display:block}.file-detail-list strong{font-size:12px;text-transform:uppercase;color:#617089}.file-detail-list span{font-size:14px;font-weight:850;margin-top:4px;word-break:break-word}.file-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.file-upload-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.file-policy-note{border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;color:#9a3412;padding:12px}.file-policy-note strong,.file-policy-note span{display:block}.file-policy-note span{margin-top:4px;font-size:13px;line-height:1.45}.file-upload-log{display:grid;gap:8px}.file-upload-log div{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:10px;color:#52627a;font-size:13px;font-weight:750}.file-upload-log .error{border-color:#fecaca;background:#fef2f2;color:#991b1b}.file-upload-log .ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}@media(max-width:1220px){.file-metrics,.file-grid-live{grid-template-columns:repeat(2,minmax(0,1fr))}.file-layout{grid-template-columns:1fr}.file-detail-pane{order:-1}.file-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.file-metrics,.file-toolbar,.file-upload-panel,.file-row-live{grid-template-columns:1fr}.file-grid-live{grid-template-columns:1fr}.file-section-title{display:grid}.file-capacity{min-width:0}}`;

const driveFileCss = `.drive-app{padding:0;overflow:hidden}.drive-header{display:grid;grid-template-columns:auto minmax(280px,1fr) 180px auto auto;gap:12px;align-items:center;border-bottom:1px solid var(--line);background:#fff;padding:14px}.drive-search-bar{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:10px;min-height:42px;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:0 14px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.drive-search-bar input{border:0;background:transparent;outline:0;color:var(--ink);font-size:14px;font-weight:650;text-transform:none}.drive-header select{height:42px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:0 10px;color:var(--ink);font-weight:750}.drive-body{display:grid;grid-template-columns:230px minmax(0,1fr) 320px;min-height:680px}.drive-sidebar{border-right:1px solid var(--line);background:#f8fafc;padding:14px;display:grid;align-content:start;gap:8px}.drive-nav{display:flex;align-items:center;width:100%;min-height:40px;border:0;border-radius:999px;background:transparent;color:#52627a;padding:0 12px;text-align:left;font-weight:850;cursor:pointer}.drive-nav:hover,.drive-nav.active{background:#e8f0fe;color:#174ea6}.drive-storage{display:grid;gap:7px;margin-top:12px;border-top:1px solid var(--line);padding-top:14px;color:#52627a;font-size:13px}.drive-storage strong{color:var(--ink)}.drive-storage b{height:9px;border-radius:999px;background:#e2e8f0;overflow:hidden}.drive-storage i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22c55e,#f97316)}.drive-job-select{margin-top:10px}.drive-job-select label{display:grid;gap:6px;color:#617089;font-size:12px;font-weight:850;text-transform:uppercase}.drive-job-select select{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:10px}.drive-content{min-width:0;background:#fff;padding:18px}.drive-content-bar{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.drive-crumbs{display:flex;align-items:center;gap:8px;font-weight:900}.drive-crumbs button{border:0;background:transparent;color:#174ea6;font-weight:900;cursor:pointer;padding:0}.drive-view-actions{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}.drive-view-actions button{border:0;background:#fff;color:#52627a;min-height:36px;padding:0 12px;font-weight:850;cursor:pointer}.drive-view-actions button.active{background:#111a27;color:#fff}.drive-section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.drive-section-heading h2{font-size:18px;margin:0}.drive-section-heading span{color:#617089;font-size:13px;font-weight:800}.drive-folder-live-grid{display:grid;grid-template-columns:repeat(3,minmax(160px,1fr));gap:12px;margin-bottom:22px}.drive-folder-card-live{display:grid;grid-template-columns:42px minmax(0,1fr);gap:12px;align-items:center;min-height:82px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer;box-shadow:0 8px 20px rgba(24,35,55,.05)}.drive-folder-card-live:hover,.drive-folder-card-live.active{border-color:#f97316;background:#fff8f5}.drive-folder-mark{display:grid;place-items:center;width:42px;height:34px;border-radius:7px;background:#fef3c7;color:#b45309;font-weight:900}.drive-folder-card-live strong,.drive-folder-card-live span{display:block}.drive-folder-card-live span{color:#617089;font-size:13px;margin-top:4px}.drive-files-section{min-width:0}.drive-details-pane{border-left:1px solid var(--line);background:#fbfcfe;padding:18px;min-width:0}.drive-app .file-grid-live{grid-template-columns:repeat(4,minmax(150px,1fr))}.drive-app .file-table-live[hidden],.drive-app .file-grid-live[hidden]{display:none}.drive-app .empty-state{grid-column:1/-1}.drive-app .file-card-live{box-shadow:none}.drive-app .file-row-live{grid-template-columns:38px minmax(220px,1fr) 120px 90px 120px 90px}.drive-app .file-row-live strong{min-width:0}@media(max-width:1280px){.drive-body{grid-template-columns:210px minmax(0,1fr)}.drive-details-pane{grid-column:1/-1;border-left:0;border-top:1px solid var(--line)}.drive-app .file-grid-live{grid-template-columns:repeat(3,minmax(150px,1fr))}}@media(max-width:900px){.drive-header,.drive-body{grid-template-columns:1fr}.drive-sidebar{border-right:0;border-bottom:1px solid var(--line)}.drive-content-bar{display:grid}.drive-folder-live-grid,.drive-app .file-grid-live{grid-template-columns:repeat(2,minmax(0,1fr))}.drive-app .file-row-live{grid-template-columns:1fr}}@media(max-width:560px){.drive-folder-live-grid,.drive-app .file-grid-live{grid-template-columns:1fr}}`;

const jobCenterCss = `.job-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}.sync-pill{display:inline-flex;align-items:center;justify-content:center;min-height:34px;border:1px solid var(--line);border-radius:999px;background:#fff;color:#52627a;padding:0 12px;font-size:12px;font-weight:900;text-transform:uppercase;white-space:nowrap}.sync-pill.live{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.sync-pill.local{border-color:#fed7aa;background:#fff7ed;color:#9a3412}.sync-pill.error{border-color:#fecaca;background:#fef2f2;color:#991b1b}.job-command{display:grid;grid-template-columns:minmax(280px,1fr) 210px auto auto auto;gap:12px;align-items:end;margin-bottom:18px}.job-search{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:0 14px;min-height:42px;color:#617089;font-size:12px;font-weight:900;text-transform:uppercase}.job-search input,.job-command select,.job-editor input,.job-editor textarea,.job-editor select{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.job-search input{border:0;background:transparent;outline:0;text-transform:none;font-size:14px;font-weight:650}.job-board{display:grid;grid-template-columns:repeat(5,minmax(190px,1fr));gap:12px;align-items:start}.job-lane{min-height:340px;background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:12px}.job-lane h2{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:15px;margin-bottom:12px}.job-lane h2 span{display:grid;place-items:center;min-width:25px;height:25px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:12px;color:#52627a}.job-card{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer;box-shadow:0 10px 26px rgba(24,35,55,.06);margin-bottom:10px}.job-card:hover,.job-card.active{border-color:#f97316;background:#fff8f5}.job-card strong,.job-card span,.job-card small{display:block}.job-card strong{font-size:15px}.job-card span{color:#52627a;margin-top:6px}.job-card small{margin-top:10px;color:#617089;font-weight:800}.priority-urgent{box-shadow:inset 4px 0 #dc2626}.priority-high{box-shadow:inset 4px 0 #f97316}.priority-medium{box-shadow:inset 4px 0 #2563eb}.priority-low{box-shadow:inset 4px 0 #16a34a}.job-section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.job-section-heading h2{margin-bottom:0}.job-section-heading span{color:#617089;font-size:13px;font-weight:850}.job-table{display:grid;gap:8px}.job-row{display:grid;grid-template-columns:minmax(220px,1.2fr) 130px 150px 110px 110px 90px;gap:12px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px;text-align:left;cursor:pointer}.job-row:hover,.job-row.active{border-color:#f97316;background:#fff8f5}.job-row strong,.job-row span{display:block}.job-row span{color:#617089;font-size:13px;font-weight:750}.job-profile-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px}.job-profile-hero{min-height:220px;border-radius:8px;background:linear-gradient(90deg,rgba(17,24,39,.9),rgba(17,24,39,.35)),url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80');background-size:cover;background-position:center;color:#fff;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;margin-bottom:16px}.job-profile-hero h2{font-size:30px;margin-bottom:8px}.job-profile-hero p{max-width:820px;color:#e5edf8;margin-bottom:0}.job-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.job-detail-grid div,.job-sidecar div{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.job-detail-grid strong,.job-detail-grid span,.job-sidecar strong,.job-sidecar span{display:block}.job-detail-grid strong,.job-sidecar strong{font-size:12px;text-transform:uppercase;color:#617089}.job-detail-grid span,.job-sidecar span{margin-top:5px;font-weight:850}.job-sidecar{display:grid;gap:10px;align-content:start}.job-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.job-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.job-editor .span-2{grid-column:1/-1}.empty-state{border:1px dashed var(--line);border-radius:8px;padding:24px;background:#fbfcfe;color:#617089;font-weight:800;text-align:center}@media(max-width:1280px){.job-board{grid-template-columns:repeat(3,minmax(190px,1fr))}.job-profile-grid{grid-template-columns:1fr}.job-row{grid-template-columns:minmax(220px,1fr) repeat(3,auto)}}@media(max-width:860px){.job-command,.job-editor,.job-detail-grid,.job-row{grid-template-columns:1fr}.job-board{grid-template-columns:1fr}.job-actions{justify-content:flex-start}}`;

const coreDemoCss = `.ops-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:18px}.ops-job-list,.activity-feed,.quick-action-grid,.bridge-task-list,.bridge-contract>div{display:grid;gap:10px}.ops-job-list a,.quick-action-grid a,.activity-feed div,.bridge-task-list div,.bridge-contract span{display:block;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.ops-job-list a:hover,.quick-action-grid a:hover{border-color:#f97316;background:#fff8f5}.ops-job-list strong,.ops-job-list span,.quick-action-grid strong,.quick-action-grid span,.activity-feed strong,.activity-feed span,.bridge-task-list strong,.bridge-task-list span,.bridge-contract strong,.bridge-contract small{display:block}.ops-job-list span,.quick-action-grid span,.activity-feed span,.bridge-task-list span,.bridge-contract small{color:#617089;font-size:13px;margin-top:5px}.quick-action-grid a{font-weight:900}.linked-panel-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}.linked-panel-grid a{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.linked-panel-grid a:hover{border-color:#f97316;background:#fff8f5}.linked-panel-grid strong,.linked-panel-grid span,.linked-panel-grid small{display:block}.linked-panel-grid span{font-weight:900;margin-top:8px}.linked-panel-grid small{color:#617089;margin-top:4px}.job-activity-panel{margin-top:16px}.job-activity-panel div:not(.job-section-heading){display:grid;grid-template-columns:180px minmax(0,1fr);gap:12px;border-top:1px solid var(--line);padding:11px 0}.job-activity-panel strong,.job-activity-panel span{display:block}.job-activity-panel span{color:#617089}.bridge-hero{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:18px;align-items:center;background:#111a27;color:#fff;margin-bottom:18px}.bridge-hero div{display:grid;gap:8px}.bridge-hero span{color:#aebbd0;font-size:12px;font-weight:900;text-transform:uppercase}.bridge-hero code{display:block;overflow:hidden;text-overflow:ellipsis;background:#fff;color:#111a27;border-radius:8px;padding:12px;font-weight:850}.bridge-hero strong{color:#ffd8c7}.task-bridge-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px}.bridge-task-list div{display:grid;grid-template-columns:minmax(0,1fr) 128px 118px;gap:12px;align-items:center}.bridge-task-list b{display:inline-flex;justify-content:center;white-space:nowrap;border-radius:999px;padding:5px 10px;background:#e8f0fe;color:#174ea6}.bridge-task-list b.overdue{background:#fee2e2;color:#b91c1c}.bridge-contract span{display:grid;gap:4px}.bridge-contract code{display:block;overflow:hidden;text-overflow:ellipsis;border-radius:6px;background:#eef2f7;padding:8px;color:#172033}@media(max-width:1180px){.ops-dashboard-grid,.task-bridge-grid{grid-template-columns:1fr}.linked-panel-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bridge-hero{grid-template-columns:1fr}.bridge-task-list div{grid-template-columns:1fr}}@media(max-width:680px){.linked-panel-grid,.job-activity-panel div:not(.job-section-heading){grid-template-columns:1fr}}`;
const identityIntegrationCss = `.task-hub-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:16px}.task-context-panel{grid-column:1/-1}.bridge-identity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.bridge-identity-grid span,.task-metric-row span,.identity-flow span,.access-flow span,.permission-list span,.approval-mini-list span{display:block;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.bridge-identity-grid strong,.bridge-identity-grid code,.task-metric-row strong,.task-metric-row small,.identity-flow strong,.identity-flow small,.access-flow strong,.access-flow small,.permission-list strong,.permission-list small,.approval-mini-list strong,.approval-mini-list small{display:block}.bridge-identity-grid code{margin-top:6px;overflow:hidden;text-overflow:ellipsis;background:#eef2f7;border-radius:6px;padding:8px;color:#172033}.task-metric-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.task-metric-row strong{font-size:26px}.task-metric-row small,.identity-flow small,.access-flow small,.permission-list small,.approval-mini-list small{color:#617089;margin-top:4px}.task-admin-snapshot,.task-approval-snapshot{align-self:start}.access-flow,.permission-list,.approval-mini-list{display:grid;gap:10px}.task-admin-snapshot .secondary-button{margin-top:12px}.identity-admin-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px}.identity-overview,.identity-table-panel,.approval-board,.team-chart-panel{min-width:0}.identity-overview,.identity-table-panel,.approval-board{grid-column:1}.identity-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.identity-table,.approval-list{display:grid;gap:8px}.identity-table>div{display:grid;grid-template-columns:minmax(220px,1.2fr) 130px minmax(180px,1fr) 108px;gap:10px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.identity-table strong,.identity-table small{display:block}.identity-table small{color:#617089;margin-top:4px;font-weight:700}.identity-table span{color:#27364d;font-weight:800}.identity-table b,.approval-list b{justify-self:start;border-radius:999px;padding:5px 10px;background:#dcfce7;color:#166534;font-size:12px}.identity-table b.warn{background:#fff7ed;color:#9a3412}.permission-panel,.approval-policy{grid-column:2;grid-row:1 / span 2;align-self:start}.approval-list article{display:grid;grid-template-columns:42px minmax(220px,1fr) 120px minmax(160px,.8fr);gap:12px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.approval-list article>span{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:#111827;color:#fff;font-weight:900}.approval-list strong,.approval-list small{display:block}.approval-list small{color:#617089;margin-top:4px}.approval-list em{font-style:normal;color:#52627a;font-weight:850}.team-chart{display:grid;gap:16px}.team-node{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:13px}.team-node.lead{border-color:#f45d22;background:#fff8f5}.team-node strong,.team-node span{display:block}.team-node span{color:#617089;margin-top:4px}.team-branches{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.team-branches section{display:grid;gap:10px;border-top:3px solid #dbe3ed;padding-top:12px}@media(max-width:1180px){.task-hub-grid,.identity-admin-grid{grid-template-columns:1fr}.permission-panel,.approval-policy,.identity-overview,.identity-table-panel,.approval-board{grid-column:auto;grid-row:auto}.identity-flow,.team-branches{grid-template-columns:repeat(2,minmax(0,1fr))}.identity-table>div,.approval-list article{grid-template-columns:1fr}}@media(max-width:760px){.bridge-identity-grid,.task-metric-row,.identity-flow,.team-branches{grid-template-columns:1fr}}`;

const companyAdminCss = `.company-admin{padding:0;overflow:hidden}.company-admin-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:18px;border-bottom:1px solid var(--line);background:#fff}.company-admin-header h2{margin-bottom:4px}.company-admin-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.company-admin-layout{display:grid;grid-template-columns:minmax(320px,.85fr) minmax(360px,1fr);gap:0;min-height:520px}.company-list-wrap{border-right:1px solid var(--line);background:#f8fafc;padding:16px}.company-list{display:grid;gap:10px}.company-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer}.company-card:hover,.company-card.active{border-color:#f97316;background:#fff8f5}.company-card.active{box-shadow:inset 3px 0 var(--orange)}.company-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:8px;color:#fff;font-weight:900}.company-card strong,.company-card span,.company-card small{display:block}.company-card span{color:#617089;font-size:13px;margin-top:4px}.company-card small{font-size:12px;color:#52627a;font-weight:850;text-transform:uppercase}.company-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-content:start;padding:18px;background:#fff}.company-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.company-editor input{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.company-editor input[readonly]{background:#f8fafc;color:#617089}.company-policy-note{border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;color:#9a3412;padding:12px}.company-policy-note strong,.company-policy-note span{display:block}.company-policy-note span{margin-top:4px;font-size:13px;line-height:1.45}@media(max-width:1050px){.company-admin-layout{grid-template-columns:1fr}.company-list-wrap{border-right:0;border-bottom:1px solid var(--line)}}@media(max-width:680px){.company-admin-header,.company-editor{grid-template-columns:1fr}.company-admin-header{display:grid}.company-admin-actions{justify-content:flex-start}.company-card{grid-template-columns:42px minmax(0,1fr)}.company-card small{grid-column:2}.company-editor{grid-template-columns:1fr}}`;

const analyticsCss = `.analytics-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px}.analytics-stage-grid,.analytics-scope-list{display:grid;gap:10px}.analytics-stage-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.analytics-stage-grid span,.analytics-scope-list span{display:block;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.analytics-stage-grid strong,.analytics-stage-grid small,.analytics-scope-list strong,.analytics-scope-list small{display:block}.analytics-stage-grid small,.analytics-scope-list small{color:#617089;margin-top:5px}.analytics-health-table div{grid-template-columns:minmax(120px,.45fr) minmax(0,1fr) 120px}@media(max-width:1100px){.analytics-layout{grid-template-columns:1fr}.analytics-stage-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.analytics-stage-grid{grid-template-columns:1fr}}`;

const formsCenterCss = `.forms-command{display:flex;justify-content:flex-end;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap}.forms-dashboard{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.forms-library-grid,.forms-preview-grid,.forms-response-grid{display:grid;grid-template-columns:360px minmax(0,1fr);gap:18px}.forms-builder-grid{display:grid;grid-template-columns:minmax(320px,.75fr) minmax(320px,.75fr) minmax(360px,1fr);gap:18px;align-items:start}.forms-toolbar{display:grid;grid-template-columns:1fr 150px;gap:10px;margin-bottom:12px}.forms-toolbar label,.forms-settings label,.question-editor label{display:grid;gap:6px;font-size:12px;font-weight:850;text-transform:uppercase;color:#617089}.forms-toolbar input,.forms-toolbar select,.forms-settings input,.forms-settings textarea,.forms-settings select,.question-editor input,.question-editor textarea,.question-editor select,.question-add-row select,.response-form input,.response-form textarea,.response-form select{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:11px}.forms-list,.question-list,.response-list{display:grid;gap:8px}.form-card,.question-card,.response-card{width:100%;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px;text-align:left;cursor:pointer}.form-card:hover,.form-card.active,.question-card:hover,.question-card.active,.response-card:hover,.response-card.active{border-color:#f97316;background:#fff8f5}.form-card strong,.form-card span,.form-card small,.question-card strong,.question-card span,.response-card strong,.response-card span{display:block}.form-card span,.question-card span,.response-card span{color:#617089;font-size:13px;margin-top:5px}.form-card small{margin-top:8px;color:#52627a;font-weight:850}.forms-summary h2,.response-form h2{margin-bottom:6px}.form-status-row,.summary-pill-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}.form-status-row span,.summary-pill-grid span{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.form-status-row strong,.form-status-row small,.summary-pill-grid strong,.summary-pill-grid small{display:block}.form-status-row small,.summary-pill-grid small{color:#617089;margin-top:4px}.forms-settings,.question-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.forms-settings .span-2,.question-editor .span-2{grid-column:1/-1}.forms-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:8px;min-height:42px;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:0 10px;text-transform:none!important;color:#27364d!important}.forms-check input{width:auto!important}.question-add-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-bottom:12px}.question-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}.question-card b{border:1px solid var(--line);border-radius:999px;background:#fff;padding:4px 8px;color:#52627a;font-size:11px;text-transform:uppercase}.question-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.response-form{display:grid;gap:14px}.response-question{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:14px}.response-question strong,.response-question small{display:block}.response-question small{color:#617089;margin-top:4px}.response-options{display:grid;gap:8px;margin-top:10px}.response-options label{display:flex;align-items:center;gap:8px;color:#27364d}.rating-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rating-row label{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--line);border-radius:999px;background:#fff;cursor:pointer}.rating-row input{position:absolute;opacity:0;pointer-events:none}.rating-row label:has(input:checked){background:#111827;color:#fff;border-color:#111827}.response-sidecar{align-self:start}.response-detail-list{display:grid;gap:10px}.response-detail-list div{border-top:1px solid var(--line);padding-top:10px}.response-detail-list strong,.response-detail-list span{display:block}.response-detail-list span{color:#52627a;margin-top:4px;white-space:pre-wrap}.forms-template-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.forms-template-grid button{min-height:170px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:16px;text-align:left;cursor:pointer;box-shadow:var(--shadow)}.forms-template-grid button:hover{border-color:#f97316;background:#fff8f5}.forms-template-grid strong,.forms-template-grid span{display:block}.forms-template-grid strong{font-size:18px}.forms-template-grid span{color:#617089;margin-top:8px;line-height:1.45}.forms-center .empty-state{min-height:140px;display:grid;place-items:center}.form-modal-panel{width:min(1280px,calc(100vw - 44px))}.form-modal-body{padding:18px}.form-modal-body .forms-builder-grid{grid-template-columns:minmax(300px,.7fr) minmax(300px,.7fr) minmax(340px,1fr)}.form-modal-body .forms-settings,.form-modal-body .question-panel,.form-modal-body .question-editor{box-shadow:none}@media(max-width:1280px){.forms-dashboard,.forms-template-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.forms-builder-grid,.forms-library-grid,.forms-preview-grid,.forms-response-grid,.form-modal-body .forms-builder-grid{grid-template-columns:1fr}}@media(max-width:760px){.forms-command,.forms-dashboard,.forms-toolbar,.forms-settings,.question-editor,.question-add-row,.forms-template-grid,.form-status-row,.summary-pill-grid{display:grid;grid-template-columns:1fr}.forms-command{align-items:stretch}.forms-command .sync-pill{justify-content:center}}`;

const googleFormsCss = `.gform-editor{grid-template-columns:minmax(0,1fr)!important;gap:14px}.gform-editor-tabs{grid-column:1/-1;display:flex;justify-content:center;gap:6px;border-bottom:1px solid var(--line);padding-bottom:10px}.gform-editor-tabs button{border:0;border-bottom:3px solid transparent;background:transparent;color:#617089;min-height:38px;padding:0 18px;font-weight:900;cursor:pointer}.gform-editor-tabs button.active{border-color:#f45d22;color:#121826}.gform-editor .forms-settings{grid-column:1/-1;border-top:8px solid #f45d22}.gform-editor .forms-settings h2{font-size:20px}.gform-settings-fields{display:none;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.gform-editor[data-form-editor-mode="settings"] .gform-settings-fields{display:grid}.gform-editor[data-form-editor-mode="settings"] .question-workbench,.gform-editor[data-form-editor-mode="settings"] .gform-modal-responses{display:none}.gform-editor[data-form-editor-mode="questions"] .question-workbench{display:block;grid-column:1/-1}.gform-editor[data-form-editor-mode="questions"] .gform-modal-responses{display:none}.gform-editor[data-form-editor-mode="responses"] .question-workbench{display:none}.gform-editor[data-form-editor-mode="responses"] .gform-modal-responses{display:block;grid-column:1/-1}.gform-modal-responses{display:none}.gform-modal-responses [data-form-editor-response-list]{display:grid;gap:8px}.gform-modal-response-row{border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px}.gform-modal-response-row strong,.gform-modal-response-row span{display:block}.gform-modal-response-row span{color:#617089;margin-top:4px}.question-workbench{position:relative}.question-canvas{width:min(820px,100%);margin:0 auto;position:relative;display:grid;gap:12px}.gform-floating-toolbar{position:absolute;right:-58px;top:0;display:grid;gap:8px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px;box-shadow:var(--shadow)}.gform-floating-toolbar button,.gform-card-icon,.gform-option-remove{width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#27364d;font-weight:950;cursor:pointer}.gform-floating-toolbar button:hover,.gform-card-icon:hover,.gform-option-remove:hover{border-color:#f45d22;color:#f45d22}.gform-add-question{border:1px dashed #b9c5d6;border-radius:8px;background:#fff;color:#52627a;min-height:52px;font-weight:900;cursor:pointer}.gform-add-question:hover{border-color:#f45d22;color:#f45d22;background:#fff8f5}.question-list{display:grid;gap:12px}.question-card{display:block;border:1px solid var(--line);border-left:6px solid transparent;border-radius:8px;background:#fff;padding:0;text-align:left;box-shadow:var(--shadow);cursor:default;overflow:hidden}.question-card.active{border-left-color:#f45d22}.question-card.gform-static-block{border-left-color:#111827}.gform-card-body{display:grid;gap:12px;padding:18px}.gform-question-top{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;align-items:start}.gform-question-input,.gform-help-input,.gform-type-select,.gform-option-input,.gform-scale-input{width:100%;border:0;border-bottom:2px solid #d8e0eb;background:#f8fafc;color:#121826;padding:11px;border-radius:0;font:inherit}.gform-question-input{font-size:18px;font-weight:900}.gform-help-input{resize:vertical;min-height:44px}.gform-type-select{border:1px solid var(--line);border-radius:8px;background:#fff;font-weight:850}.gform-question-input:focus,.gform-help-input:focus,.gform-option-input:focus,.gform-scale-input:focus{outline:none;border-color:#f45d22;background:#fff}.gform-option-list,.gform-grid-editor{display:grid;gap:9px}.gform-option-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center}.gform-option-marker{width:18px;height:18px;border:2px solid #aab7c8;border-radius:999px}.gform-option-marker.square{border-radius:4px}.gform-option-marker.dropdown{display:grid;place-items:center;border:0;color:#617089;font-size:13px}.gform-option-add{width:max-content;border:0;background:transparent;color:#f45d22;font-weight:900;cursor:pointer;padding:6px 0}.gform-card-footer{border-top:1px solid var(--line);padding:10px 18px;display:flex;justify-content:flex-end;gap:10px;align-items:center;flex-wrap:wrap}.gform-required{display:flex;align-items:center;gap:8px;font-weight:850;color:#27364d}.gform-card-menu{display:flex;gap:6px}.gform-context-hint{margin-right:auto;color:#617089;font-size:12px}.question-context-menu{position:fixed;z-index:80;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:6px;width:210px}.question-context-menu button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:10px;border-radius:6px;font-weight:850;color:#27364d;cursor:pointer}.question-context-menu button:hover{background:#fff3ed;color:#f45d22}.gform-scale-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.gform-preview-line{border-bottom:1px dotted #aab7c8;color:#617089;padding:10px 0}.gform-file-preview{border:1px dashed #b9c5d6;border-radius:8px;padding:14px;color:#617089;background:#fbfcfe}.form-modal-panel{background:#f8fafc}.form-modal-body{background:#f8fafc}@media(max-width:980px){.gform-editor{grid-template-columns:1fr!important}.gform-settings-fields,.gform-question-top,.gform-scale-row{grid-template-columns:1fr}.gform-floating-toolbar{position:static;display:flex;width:max-content;margin-left:auto}}`;

const formShareCss = `.share-card{margin-top:14px;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;padding:12px;display:grid;gap:10px}.share-card strong,.share-card input{display:block}.share-card input{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:#27364d;padding:10px;font-size:12px}.designed-form{--form-theme:#f45d22;border-top:8px solid var(--form-theme)!important;box-shadow:0 18px 55px rgba(24,35,55,.12)}.designed-form .primary-button{background:var(--form-theme)}.designed-form-header{display:grid;gap:0;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden}.designed-form-image{min-height:180px;background-size:cover;background-position:center}.designed-form-title{padding:20px}.designed-form-title h2{font-size:30px;margin-bottom:8px}.designed-form .response-options{display:grid;gap:12px;margin-top:14px}.designed-form .response-options label{display:flex;align-items:center;justify-content:flex-start;gap:10px;width:max-content;max-width:100%;min-height:28px;line-height:1.35;cursor:pointer}.designed-form .response-options input[type="radio"],.designed-form .response-options input[type="checkbox"],.designed-form .forms-check input[type="checkbox"]{width:auto!important;min-width:16px;height:16px;flex:0 0 auto;margin:0;padding:0}.designed-form .response-question>select,.designed-form .response-question>input:not([type="radio"]):not([type="checkbox"]),.designed-form .response-question>textarea{margin-top:12px}.public-thank-you{border:1px solid var(--line);border-radius:8px;background:#fff;padding:28px;text-align:center}.form-public-mode{background:#eef2f7}.form-public-mode[data-form-background="warm"]{background:#f8efe3}.form-public-mode[data-form-background="blueprint"]{background:#e8f0fe;background-image:linear-gradient(rgba(66,103,178,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(66,103,178,.08) 1px,transparent 1px);background-size:28px 28px}.form-public-mode[data-form-background="dark"]{background:#111827}.form-public-mode .sidebar,.form-public-mode .tour-overlay,.form-public-mode .forms-command,.form-public-mode .forms-dashboard,.form-public-mode .tabs,.form-public-mode [data-panel="library"],.form-public-mode [data-panel="responses"],.form-public-mode [data-panel="templates"],.form-public-mode [data-form-builder-host],.form-public-mode .response-sidecar{display:none!important}.form-public-mode .main{margin-left:0;padding:34px 16px}.form-public-mode .workspace{max-width:760px}.form-public-mode [data-panel="preview"]{display:block!important}.form-public-mode .forms-preview-grid{display:block}.form-public-mode .response-form{border-radius:10px;padding:0;background:transparent;border:0;box-shadow:none}.form-public-mode .designed-form-header,.form-public-mode .response-question,.form-public-mode .response-form>.form-actions{background:#fff;box-shadow:0 10px 35px rgba(24,35,55,.08)}.form-public-mode .response-question,.form-public-mode .response-form>.form-actions{border-radius:8px;border:1px solid var(--line);padding:18px}.form-public-mode .response-form>.form-actions{justify-content:flex-start}.form-public-mode[data-form-background="dark"] .designed-form-header,.form-public-mode[data-form-background="dark"] .response-question,.form-public-mode[data-form-background="dark"] .response-form>.form-actions,.form-public-mode[data-form-background="dark"] .public-thank-you{background:#172234;color:#eaf1fb;border-color:#334155}.form-public-mode[data-form-background="dark"] .muted,.form-public-mode[data-form-background="dark"] .response-question small{color:#adc7e6}@media(max-width:760px){.designed-form-title h2{font-size:24px}.form-public-mode .main{padding:16px 10px}}`;

const formsLayoutRedoCss = `.forms-center{max-width:1320px}.forms-command.panel{min-height:0;padding:12px 14px;margin-bottom:14px;display:flex;justify-content:flex-end;align-items:center;gap:10px}.forms-command .sync-pill{margin-right:auto}.forms-command .primary-button,.forms-command .secondary-button,.forms-command .danger-button{min-height:38px;padding:0 13px}.forms-dashboard{display:none}.forms-center .tabs{margin-bottom:14px}.forms-library-grid{grid-template-columns:300px minmax(0,1fr);gap:14px}.forms-library-panel{align-self:start;min-height:calc(100vh - 230px);padding:14px}.forms-toolbar{grid-template-columns:1fr;gap:10px}.forms-summary{min-height:calc(100vh - 230px);padding:24px}.forms-summary-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:16px}.forms-summary-head h2{font-size:30px;margin-bottom:6px}.forms-summary-head span{border:1px solid var(--line);border-radius:999px;background:#fbfcfe;color:#52627a;padding:7px 11px;font-size:12px;font-weight:900;text-transform:uppercase}.forms-simple-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.forms-simple-meta span,.forms-simple-meta button{border:1px solid var(--line);border-radius:999px;background:#fbfcfe;color:#52627a;padding:7px 11px;font-size:13px;font-weight:850;line-height:1;cursor:default}.forms-simple-meta button{cursor:pointer}.forms-simple-meta button:hover{border-color:var(--orange);color:var(--orange);background:#fff8f5}.form-status-row,.summary-pill-grid{grid-template-columns:repeat(3,minmax(150px,1fr));gap:10px;margin-top:14px}.forms-summary-share{grid-template-columns:minmax(0,1fr) auto;align-items:end;margin-top:18px;padding:14px;border-left:4px solid var(--orange)}.forms-summary-share strong{grid-column:1/-1}.forms-summary-share input{min-width:0;height:42px;overflow:hidden;text-overflow:ellipsis}.forms-summary-share .form-actions{grid-column:2;display:flex;gap:8px;white-space:nowrap}.forms-summary-actions{margin-top:14px}.form-card{padding:13px 14px}.form-card strong{font-size:17px}.form-card small{font-size:13px}.forms-preview-grid,.forms-response-grid{grid-template-columns:minmax(0,1fr) 320px;gap:14px}.response-detail-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:4px}.response-detail-head h2{margin-bottom:4px}.response-detail-head .danger-button{min-height:38px;white-space:nowrap}@media(max-width:1100px){.forms-library-grid,.forms-preview-grid,.forms-response-grid{grid-template-columns:1fr}.forms-library-panel,.forms-summary{min-height:0}.forms-summary-share{grid-template-columns:1fr}.forms-summary-share .form-actions{grid-column:1;white-space:normal}.form-status-row,.summary-pill-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.forms-command.panel{display:grid;grid-template-columns:1fr 1fr}.forms-command .sync-pill{grid-column:1/-1;margin-right:0;justify-content:center}.forms-command .primary-button,.forms-command .secondary-button,.forms-command .danger-button{width:100%}.forms-summary{padding:16px}.forms-summary-head,.response-detail-head{display:grid}.forms-summary-head h2{font-size:24px}.form-status-row,.summary-pill-grid{grid-template-columns:1fr}}`;
const formsLibraryModalCss = `.forms-center{max-width:1240px}.forms-library-grid{display:block}.forms-library-panel{min-height:calc(100vh - 230px);padding:18px}.forms-toolbar{display:grid;grid-template-columns:minmax(240px,1fr) 220px;gap:12px;align-items:end;margin-bottom:16px}.forms-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}.form-card{min-height:128px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#fff;padding:16px;display:grid;gap:6px;align-content:start;box-shadow:0 12px 30px rgba(15,23,42,.04);transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}.form-card:hover{border-color:#f45d22;box-shadow:0 18px 34px rgba(15,23,42,.09);transform:translateY(-1px)}.form-card.active{background:#fff;border-color:#f45d22;box-shadow:inset 4px 0 0 #f45d22,0 18px 34px rgba(15,23,42,.08)}.form-card strong{font-size:18px;line-height:1.2}.form-card span{color:#52627a;font-size:14px}.form-card small{color:#52627a;font-size:13px;font-weight:850}.forms-summary[hidden]{display:none!important}.form-detail-modal-panel{width:min(780px,calc(100vw - 40px));max-height:min(760px,calc(100vh - 40px));overflow:hidden}.form-detail-modal-body{padding:22px;overflow:auto}.form-detail-modal-body .forms-summary-head{padding-bottom:14px}.form-detail-modal-body .forms-summary-head h2{font-size:30px}.form-detail-modal-body .forms-simple-meta{margin:14px 0 18px}.form-detail-modal-body .forms-summary-share{margin-top:0;background:#fbfcfe;border:1px solid var(--line);border-left:4px solid var(--orange);border-radius:8px}.form-detail-modal-body .forms-summary-actions{display:flex;flex-wrap:wrap;gap:10px}.form-detail-modal-body .forms-summary-actions button{min-height:42px}.form-detail-modal-body .forms-summary-share .form-actions{align-items:end}.forms-center .tab-panel[data-panel="library"]{display:block}.forms-center .tab-panel[data-panel="library"]:not(.active){display:none}@media(max-width:820px){.forms-toolbar{grid-template-columns:1fr}.forms-list{grid-template-columns:1fr}.form-detail-modal-body .forms-summary-share{grid-template-columns:1fr}.form-detail-modal-body .forms-summary-share .form-actions{grid-column:1}.form-detail-modal-body .forms-summary-actions{display:grid;grid-template-columns:1fr 1fr}.form-detail-modal-body .forms-summary-actions button{width:100%}}@media(max-width:560px){.form-detail-modal-body .forms-summary-actions{grid-template-columns:1fr}.form-detail-modal-body .forms-summary-head{display:grid}.form-detail-modal-body .forms-summary-head h2{font-size:24px}}`;

const plannedTabsCss = `.tabs button.tab-planned,.tabs button.tab-planned:hover,.tabs button.tab-planned.active{color:#64748b;background:repeating-linear-gradient(135deg,#eef2f7 0,#eef2f7 8px,#e2e8f0 8px,#e2e8f0 16px);border-color:#94a3b8;box-shadow:none;cursor:not-allowed;opacity:1;filter:grayscale(1)}.tabs button.tab-planned.active{box-shadow:inset 0 -3px #94a3b8}.tabs button.tab-planned small{display:inline-flex;margin-left:8px;border:1px solid #94a3b8;border-radius:999px;background:#f8fafc;padding:2px 7px;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;vertical-align:middle}.tabs button:not(.tab-planned) small{display:none}@media(max-width:620px){.tabs button.tab-planned small{display:none}}`;

const tutorialCss = `.tour-replay{display:inline-flex;align-items:center;justify-content:center;min-height:36px;border:1px solid #324055;border-radius:999px;background:#172234;color:#dbeafe;font-weight:850;cursor:pointer}.tour-replay:hover{border-color:#f45d22;color:#fff;background:#2a1816}.tour-overlay[hidden]{display:none}.tour-overlay{position:fixed;inset:0;z-index:130;background:rgba(15,23,42,.68);pointer-events:auto}.tour-spotlight{position:absolute;border:2px solid #f45d22;border-radius:12px;box-shadow:0 0 0 9999px rgba(15,23,42,.68),0 18px 60px rgba(0,0,0,.32);transition:all .18s ease;background:rgba(255,255,255,.04);pointer-events:none}.tour-card{position:absolute;width:min(440px,calc(100vw - 28px));border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);box-shadow:0 28px 90px rgba(0,0,0,.34);padding:18px}.tour-card-head{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:8px}.tour-card-head span{display:none}.tour-card-head button{border:0;background:transparent;color:#52627a;font-weight:850;cursor:pointer}.tour-progress{display:flex;align-items:center;gap:8px;margin:0 0 16px}.tour-progress span{display:block;width:11px;height:11px;border-radius:50%;background:#dbe3ed;border:2px solid #dbe3ed}.tour-progress span.done{background:#111827;border-color:#111827}.tour-progress span.active{background:#f45d22;border-color:#f45d22;box-shadow:0 0 0 4px #ffedd5}.tour-card h2{font-size:23px;margin:0 0 8px}.tour-card p{color:#52627a;line-height:1.5;margin-bottom:16px}.tour-actions{display:flex;justify-content:space-between;gap:10px}.tour-actions button[disabled]{opacity:.45;cursor:not-allowed}body.tour-open{overflow:hidden}@media(max-width:820px){.tour-overlay{display:grid;place-items:end center;padding:12px}.tour-spotlight{display:none}.tour-card{position:static;width:100%}.tour-replay{width:100%}}`;

const questAuthCss = `body.auth-loading .main,body.auth-loading .nav-list,body.auth-loading .sidebar-card,body.auth-loading .tour-replay{visibility:hidden}body.auth-loading:after{content:"Checking Quest access...";position:fixed;inset:0;display:grid;place-items:center;background:#eef2f7;color:#121826;font-weight:900}.quest-account{display:grid;gap:8px;border:1px solid #324055;border-radius:8px;background:#121d2c;padding:10px}.quest-account-main{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;width:100%;border:0;background:transparent;color:#fff;text-align:left;cursor:pointer;padding:0}.quest-account-main strong,.quest-account-main small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.quest-account-main small{color:#aebbd0;margin-top:2px}.quest-avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#f45d22;color:#fff;font-weight:900;overflow:hidden}.quest-avatar img{width:100%;height:100%;object-fit:cover}.quest-avatar.large{width:72px;height:72px;font-size:24px}.quest-account-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.quest-account-actions button{min-height:34px;border:1px solid #425169;border-radius:8px;background:#172234;color:#dbeafe;font-weight:850;cursor:pointer}.quest-account-actions button:hover{border-color:#f45d22;background:#2a1816;color:#fff}.quest-login-shell{min-height:100vh;display:grid;place-items:center;background:#eef2f7;color:#121826;padding:24px}.quest-login-panel{display:grid;gap:18px;width:min(430px,100%);padding:34px;border:1px solid #d9e0ea;border-top:5px solid #f45d22;border-radius:8px;background:#fff;color:#121826;box-shadow:0 18px 55px rgba(24,35,55,.14)}.quest-login-panel .brand{gap:10px}.quest-login-panel .brand-mark{width:42px;height:42px;border-radius:8px}.quest-login-panel .brand strong{color:#121826;font-size:18px}.quest-login-panel .brand small{color:#617089}.quest-login-panel h1{font-size:30px;line-height:1.12;margin:4px 0 8px}.quest-login-panel .muted{font-size:14px}.quest-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;border:1px solid #d9e0ea;border-radius:8px;background:#f5f7fb;padding:4px}.quest-auth-tabs button{min-height:38px;border:0;border-radius:6px;background:transparent;color:#52627a;font-weight:900;cursor:pointer}.quest-auth-tabs button:hover{color:#121826}.quest-auth-tabs button.active{background:#f45d22;color:#fff;box-shadow:0 7px 16px rgba(244,93,34,.22)}.quest-auth-form,.quest-pending-card,.quest-profile-form{display:grid;gap:14px}.quest-auth-form[hidden],.quest-pending-card[hidden]{display:none!important}.quest-auth-form label,.quest-profile-form label{display:grid;gap:7px;color:#52627a;font-size:12px;font-weight:900;text-transform:uppercase}.quest-auth-form input,.quest-profile-form input{width:100%;min-height:44px;border:1px solid #cfd8e6;border-radius:8px;background:#fff;color:#121826;padding:11px 12px}.quest-auth-form input:focus,.quest-profile-form input:focus{outline:3px solid #ffdacb;border-color:#f45d22}.quest-auth-form .primary-button{width:100%;min-height:46px;margin-top:2px}.quest-pending-card{border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;padding:14px}.quest-pending-card h2{font-size:20px;margin-bottom:2px}.quest-auth-message{min-height:20px;color:#991b1b;font-size:13px;font-weight:850}.quest-auth-message.ok{color:#166534}.quest-profile-panel{width:min(620px,calc(100vw - 44px))}.quest-profile-form{padding:18px}.quest-profile-preview{display:grid;grid-template-columns:72px minmax(0,1fr);gap:14px;align-items:center}.quest-profile-preview strong,.quest-profile-preview span{display:block}.quest-profile-preview span{color:#617089;margin-top:4px}@media(max-width:860px){.quest-account-actions{grid-template-columns:1fr}.quest-profile-preview{grid-template-columns:1fr}}@media(max-width:520px){.quest-login-shell{padding:14px}.quest-login-panel{padding:22px}.quest-login-panel h1{font-size:26px}.quest-auth-tabs{grid-template-columns:1fr}.quest-login-panel .brand strong{font-size:17px}}`;

const js = `(() => {
  const QUEST_AUTH_ENABLED = false;
  const QUEST_SUPABASE_URL = 'https://lpzotcznihwyyudxycmd.supabase.co';
  const QUEST_SUPABASE_KEY = 'sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07';
  const QUEST_LOGIN_STORAGE_KEY = 'quest-hq-last-login';
  const pageName = (document.body.dataset.page || '').split('/').pop();
  const isLoginPage = pageName === 'login.html';
  const returnParam = new URLSearchParams(window.location.search).get('return_url');
  const sameOriginReturn = (() => {
    try {
      const url = returnParam ? new URL(returnParam, window.location.href) : new URL('index.html', window.location.href);
      return url.origin === window.location.origin ? url.toString() : new URL('index.html', window.location.href).toString();
    } catch (error) {
      return new URL('index.html', window.location.href).toString();
    }
  })();
  const questClient = window.supabase && window.supabase.createClient ? window.supabase.createClient(QUEST_SUPABASE_URL, QUEST_SUPABASE_KEY) : null;
  window.QuestAuth = { client: questClient, session: null, user: null, profile: null };
  window.createQuestSupabaseClient = (url, key) => {
    if (window.QuestAuth && window.QuestAuth.client) return window.QuestAuth.client;
    return window.supabase && window.supabase.createClient ? window.supabase.createClient(url, key) : null;
  };

  initQuestAuth();

  async function initQuestAuth() {
    if (!QUEST_AUTH_ENABLED) {
      enterBasicQuestMode();
      return;
    }
    if (!questClient) {
      if (isLoginPage) showAuthMessage('Auth service is unavailable.');
      else window.location.replace('login.html?return_url=' + encodeURIComponent(window.location.href));
      return;
    }
    if (isLoginPage) {
      await initLoginPage();
      return;
    }
    await guardQuestPage();
  }

  function enterBasicQuestMode() {
    const user = {
      id: 'basic-quest-user',
      email: 'basic@quest-hq.local',
      user_metadata: { full_name: 'Quest Basic Mode' }
    };
    const profile = {
      id: user.id,
      email: user.email,
      full_name: 'Quest Basic Mode',
      approved: true,
      role: 'developer',
      member_id: 'abraham',
      company_ids: ['roofing', 'drafting', 'lumen'],
      avatar_url: ''
    };
    window.QuestAuth.session = null;
    window.QuestAuth.user = user;
    window.QuestAuth.profile = profile;
    if (isLoginPage) {
      window.location.replace(sameOriginReturn);
      return;
    }
    paintQuestAccount(user, profile);
    bindQuestAccountControls();
    document.body.classList.remove('auth-loading');
    if (new URLSearchParams(window.location.search).get('account') === 'profile') openQuestProfile();
  }

  async function initLoginPage() {
    document.body.classList.remove('auth-loading');
    bindLoginForms();
    prefillLastLogin();
    const { data } = await questClient.auth.getSession();
    if (!data.session) return;
    const profile = await loadQuestProfile(data.session.user.id);
    if (profile && profile.approved) {
      window.location.replace(sameOriginReturn);
      return;
    }
    showPendingState();
  }

  async function guardQuestPage() {
    const { data } = await questClient.auth.getSession();
    if (!data.session) {
      window.location.replace('login.html?return_url=' + encodeURIComponent(window.location.href));
      return;
    }
    const profile = await loadQuestProfile(data.session.user.id);
    if (!profile || !profile.approved) {
      window.location.replace('login.html?return_url=' + encodeURIComponent(window.location.href));
      return;
    }
    window.QuestAuth.session = data.session;
    window.QuestAuth.user = data.session.user;
    window.QuestAuth.profile = profile;
    paintQuestAccount(data.session.user, profile);
    bindQuestAccountControls();
    document.body.classList.remove('auth-loading');
    if (new URLSearchParams(window.location.search).get('account') === 'profile') openQuestProfile();
    questClient.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.replace('login.html?return_url=' + encodeURIComponent(window.location.href));
    });
  }

  async function loadQuestProfile(userId) {
    const { data, error } = await questClient
      .from('profiles')
      .select('id,email,full_name,approved,role,member_id,company_ids,avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data;
  }

  function normalizeQuestLogin(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) throw new Error('Enter a username or email.');
    if (raw.includes('@')) return raw;
    const username = raw.replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!username || username.length < 2) throw new Error('Use at least 2 letters or numbers for the username.');
    return username + '@quest-hq.local';
  }

  function bindLoginForms() {
    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        switchAuthMode(button.dataset.authMode);
      });
    });
    document.querySelector('[data-auth-form="signin"]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (form.dataset.busy === 'true') return;
      showAuthMessage('Signing in...', true);
      const payload = Object.fromEntries(new FormData(form).entries());
      let email = '';
      try {
        email = normalizeQuestLogin(payload.login);
      } catch (error) {
        return showAuthMessage(error.message || 'Enter a username or email.');
      }
      const password = String(payload.password || '');
      if (!password) return showAuthMessage('Enter your password.');
      setFormBusy(form, true, 'Signing in...');
      try {
        const { data, error } = await questClient.auth.signInWithPassword({ email, password });
        if (error) return showAuthMessage(authMessage(error, 'Could not sign in.'));
        rememberLastLogin(payload.login);
        const profile = await loadQuestProfile(data.user.id);
        if (profile && profile.approved) window.location.replace(sameOriginReturn);
        else showPendingState('Signed in. Waiting for admin approval.');
      } finally {
        setFormBusy(form, false);
      }
    });
    document.querySelector('[data-auth-form="signup"]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (form.dataset.busy === 'true') return;
      showAuthMessage('Creating account...', true);
      const payload = Object.fromEntries(new FormData(form).entries());
      const fullName = String(payload.full_name || '').trim();
      if (!fullName) return showAuthMessage('Enter a display name.');
      let email = '';
      try {
        email = normalizeQuestLogin(payload.login);
      } catch (error) {
        return showAuthMessage(error.message || 'Enter a username.');
      }
      const password = String(payload.password || '');
      if (password.length < 8) return showAuthMessage('Use at least 8 characters for the password.');
      setFormBusy(form, true, 'Creating...');
      try {
        const { data, error } = await questClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, username: String(payload.login || '').trim() } }
        });
        if (error) return showAuthMessage(authMessage(error, 'Could not create account.'));
        rememberLastLogin(payload.login);
        if (data.session && data.user) {
          const profile = await loadQuestProfile(data.user.id);
          if (profile && profile.approved) {
            window.location.replace(sameOriginReturn);
            return;
          }
          showPendingState('Account created. Waiting for admin approval.');
          return;
        }
        switchAuthMode('signin');
        showAuthMessage('Account created. Sign in with your username and password.', true);
      } finally {
        setFormBusy(form, false);
      }
    });
    document.querySelector('[data-auth-refresh]')?.addEventListener('click', async () => {
      showAuthMessage('Checking approval...', true);
      const { data } = await questClient.auth.getSession();
      if (!data.session) return showAuthMessage('Sign in again to check approval.');
      const profile = await loadQuestProfile(data.session.user.id);
      if (profile && profile.approved) window.location.replace(sameOriginReturn);
      else showPendingState('Still pending admin approval.');
    });
    document.querySelector('[data-auth-sign-out]')?.addEventListener('click', async () => {
      await questClient.auth.signOut();
      window.location.replace('login.html?return_url=' + encodeURIComponent(sameOriginReturn));
    });
  }

  function switchAuthMode(mode) {
    const targetMode = mode === 'signup' ? 'signup' : 'signin';
    document.querySelectorAll('[data-auth-mode]').forEach((item) => item.classList.toggle('active', item.dataset.authMode === targetMode));
    document.querySelectorAll('[data-auth-form]').forEach((form) => { form.hidden = form.dataset.authForm !== targetMode; });
    document.querySelector('[data-auth-pending]').hidden = true;
    showAuthMessage('');
    const activeForm = document.querySelector('[data-auth-form="' + targetMode + '"]');
    window.setTimeout(() => activeForm?.querySelector('input')?.focus(), 0);
  }

  function showPendingState(message = 'Account pending admin approval.') {
    document.querySelectorAll('[data-auth-form]').forEach((form) => { form.hidden = true; });
    document.querySelector('[data-auth-pending]').hidden = false;
    showAuthMessage(message, true);
  }

  function showAuthMessage(message, ok = false) {
    const node = document.querySelector('[data-auth-message]');
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('ok', !!ok);
  }

  function authMessage(error, fallback) {
    const message = String(error && error.message || '').toLowerCase();
    if (message.includes('invalid login credentials')) return 'Username or password is incorrect.';
    if (message.includes('already registered') || message.includes('already exists')) return 'That username already exists. Sign in instead.';
    if (message.includes('password')) return error.message;
    return fallback;
  }

  function setFormBusy(form, busy, busyText = '') {
    if (!form) return;
    form.dataset.busy = busy ? 'true' : 'false';
    form.querySelectorAll('input,button').forEach((control) => { control.disabled = !!busy; });
    const submit = form.querySelector('button[type="submit"]');
    if (!submit) return;
    if (!submit.dataset.label) submit.dataset.label = submit.textContent || '';
    submit.textContent = busy ? busyText : submit.dataset.label;
  }

  function rememberLastLogin(value) {
    try { window.localStorage.setItem(QUEST_LOGIN_STORAGE_KEY, String(value || '').trim()); } catch (error) {}
  }

  function prefillLastLogin() {
    let saved = '';
    try { saved = window.localStorage.getItem(QUEST_LOGIN_STORAGE_KEY) || ''; } catch (error) {}
    const input = document.querySelector('[data-auth-form="signin"] input[name="login"]');
    if (input && saved && !input.value) input.value = saved;
    window.setTimeout(() => {
      const field = input && input.value ? document.querySelector('[data-auth-form="signin"] input[name="password"]') : input;
      field?.focus();
    }, 0);
  }

  function paintQuestAccount(user, profile) {
    const account = document.querySelector('[data-quest-account]');
    if (account) account.hidden = false;
    const name = profile.full_name || user.email || 'Quest user';
    const role = profile.role || 'member';
    setText('[data-quest-account-name]', name);
    setText('[data-quest-account-role]', role + ' - Quest HQ');
    setAvatar(document.querySelector('[data-quest-avatar]'), name, profile.avatar_url);
    setText('[data-quest-profile-email]', profile.email || user.email || '');
    setText('[data-quest-profile-access]', role + ' - ' + ((profile.company_ids || []).join(', ') || 'No company access assigned'));
    setAvatar(document.querySelector('[data-quest-profile-avatar]'), name, profile.avatar_url);
    const form = document.querySelector('[data-quest-profile-form]');
    if (form) form.elements.full_name.value = profile.full_name || '';
  }

  function bindQuestAccountControls() {
    document.querySelectorAll('[data-quest-profile-open]').forEach((button) => button.addEventListener('click', openQuestProfile));
    document.querySelectorAll('[data-quest-profile-close]').forEach((button) => button.addEventListener('click', closeQuestProfile));
    document.querySelector('[data-quest-sign-out]')?.addEventListener('click', async () => {
      if (!QUEST_AUTH_ENABLED) {
        window.location.replace('index.html');
        return;
      }
      await questClient.auth.signOut();
      window.location.replace('login.html');
    });
    document.querySelector('[data-quest-profile-form]')?.addEventListener('submit', saveQuestProfile);
  }

  function openQuestProfile() {
    const modal = document.querySelector('[data-quest-profile-modal]');
    if (modal) modal.hidden = false;
  }

  function closeQuestProfile() {
    const modal = document.querySelector('[data-quest-profile-modal]');
    if (modal) modal.hidden = true;
  }

  async function saveQuestProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const msg = document.querySelector('[data-quest-profile-message]');
    const profile = window.QuestAuth.profile;
    const user = window.QuestAuth.user;
    if (!profile || !user) return;
    if (msg) { msg.textContent = 'Saving profile...'; msg.classList.add('ok'); }
    if (!QUEST_AUTH_ENABLED) {
      const fullName = String(form.elements.full_name.value || '').trim() || 'Quest Basic Mode';
      window.QuestAuth.profile = { ...profile, full_name: fullName };
      window.QuestAuth.user = { ...user, email: profile.email };
      paintQuestAccount(window.QuestAuth.user, window.QuestAuth.profile);
      if (msg) { msg.textContent = 'Profile saved for this basic-mode session.'; msg.classList.add('ok'); }
      return;
    }
    let avatarUrl = profile.avatar_url || null;
    const file = form.elements.avatar.files && form.elements.avatar.files[0];
    if (file) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = user.id + '/avatar.' + ext;
      const uploaded = await questClient.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (uploaded.error) {
        if (msg) { msg.textContent = uploaded.error.message || 'Avatar upload failed.'; msg.classList.remove('ok'); }
        return;
      }
      avatarUrl = questClient.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    }
    const fullName = String(form.elements.full_name.value || '').trim();
    const { error } = await questClient
      .from('profiles')
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq('id', profile.id);
    if (error) {
      if (msg) { msg.textContent = error.message || 'Profile save failed.'; msg.classList.remove('ok'); }
      return;
    }
    window.QuestAuth.profile = { ...profile, full_name: fullName, avatar_url: avatarUrl };
    paintQuestAccount(user, window.QuestAuth.profile);
    if (msg) { msg.textContent = 'Profile saved.'; msg.classList.add('ok'); }
  }

  function setAvatar(node, name, url) {
    if (!node) return;
    node.replaceChildren();
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      node.appendChild(img);
      return;
    }
    node.textContent = String(name || 'Q').trim().split(/\\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'Q';
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

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
  const lanes = ['Lead', 'Site Review', 'Estimate', 'Approved', 'Active'];
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
    editorPanel: center.querySelector('[data-panel="editor"]'),
    modal: center.querySelector('[data-job-modal]'),
    modalBody: center.querySelector('[data-job-modal-body]'),
    modalTitle: center.querySelector('[data-job-modal-title]'),
    editorTitle: center.querySelector('[data-job-editor-title]'),
    companySelect: center.querySelector('[data-job-company-select]'),
    search: center.querySelector('[data-job-search]'),
    stage: center.querySelector('[data-job-stage-filter]')
  };

  let companies = defaultCompanies.slice();
  let supabaseClient = null;
  let jobs = seed.map(normalizeJob);
  let selectedId = new URLSearchParams(window.location.search).get('job_id') || jobs[0]?.id || null;
  let source = 'local';
  let formHome = null;
  let lastFocus = null;
  let draftJob = null;

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
    supabaseClient = window.createQuestSupabaseClient(url, key);
    if (!supabaseClient) {
      setSync('Local fallback', 'local');
      return;
    }
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
      draftJob = blankJob();
      fillForm(draftJob);
      openJobModal('Create Job Workspace');
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
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-job-modal-close]')) closeJobModal();
    });
    nodes.modal?.addEventListener('click', (event) => {
      if (event.target === nodes.modal) closeJobModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nodes.modal && !nodes.modal.hidden) closeJobModal();
    });
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      center.querySelector('[data-job-new]')?.click();
      window.history.replaceState({}, '', 'jobs.html');
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
        closeJobModal();
        return;
      }
    }
    if (existingIndex >= 0) jobs[existingIndex] = payload;
    else jobs.unshift(payload);
    selectedId = payload.id;
    saveLocal();
    render();
    closeJobModal();
  }

  async function deleteJob() {
    if (draftJob) {
      closeJobModal();
      return;
    }
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
    closeJobModal();
  }

  function duplicateJob() {
    const job = draftJob || selectedJob();
    if (!job) return;
    const copy = { ...job, id: 'local-' + Date.now(), name: job.name + ' Copy', stage: 'Lead' };
    draftJob = copy;
    fillForm(copy);
    openJobModal('Duplicate Job');
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
        '<span>' + number(job.file_count) + ' files</span>' +
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
      detail('Account Owner', job.owner_name || 'Unassigned') +
      detail('Site', job.site_address || 'No address') +
      detail('Business Status', job.stage || 'Lead') +
      detail('Client Urgency', job.priority || 'Medium') +
      detail('Estimate', money.format(number(job.estimate_total))) +
      detail('TaskManagement Project', job.id) +
      detail('File Space', number(job.file_count) + ' files') +
      '</div>' +
      linkedPanels(job) +
      activityTimeline(job);
    nodes.sidecar.innerHTML = detail('Workspace', 'Business context and records') +
      detail('Files', number(job.file_count) + ' files attached') +
      detail('Company', companyLabel(job.company_id)) +
      '<a class=\"secondary-button\" href=\"' + escapeHtml(bridgeUrl(job)) + '\">Open Task Hub</a>' +
      '<a class=\"secondary-button\" href=\"' + escapeHtml(fileUrl(job)) + '\">Open Files</a>' +
      '<button class=\"primary-button\" type=\"button\" data-edit-selected>Edit Job</button>';
    nodes.sidecar.querySelector('[data-edit-selected]')?.addEventListener('click', () => openJobModal('Edit Job'));
  }

  function linkedPanels(job) {
    const items = [
      ['TaskManagement', 'Open execution hub', 'Tasks are scoped by project_id', bridgeUrl(job)],
      ['Files & Photos', number(job.file_count) + ' files', 'Photos, permits, estimates, invoices', fileUrl(job)],
      ['Forms & Inspections', inspectionCount(job) + ' records', 'Inspection, approval, walkthrough', 'forms.html'],
      ['Finance', money.format(number(job.estimate_total)) + ' estimate', 'Estimate, invoice, payment records', 'finance.html']
    ];
    return '<div class=\"linked-panel-grid\">' + items.map((item) => '<a href=\"' + escapeHtml(item[3]) + '\"><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span><small>' + escapeHtml(item[2]) + '</small></a>').join('') + '</div>';
  }

  function activityTimeline(job) {
    return '<section class=\"job-activity-panel\"><div class=\"job-section-heading\"><h2>Activity Timeline</h2><span>Not connected</span></div><article class=\"empty-state\">No live activity events are connected yet.</article></section>';
  }

  function fillForm(job = null) {
    job = job || draftJob || selectedJob() || blankJob();
    renderCompanyOptions(job.company_id);
    fields.forEach((field) => {
      if (!nodes.form.elements[field]) return;
      nodes.form.elements[field].value = job[field] ?? '';
    });
  }

  function openJobModal(title) {
    if (!nodes.modal || !nodes.modalBody || !nodes.form) {
      clickTab('editor');
      return;
    }
    if (!formHome) {
      formHome = document.createElement('div');
      formHome.hidden = true;
      nodes.form.parentNode.insertBefore(formHome, nodes.form);
    }
    lastFocus = document.activeElement;
    nodes.modalTitle.textContent = title || 'Job Workspace';
    if (nodes.editorTitle) nodes.editorTitle.textContent = title || 'Job Workspace';
    nodes.modalBody.appendChild(nodes.form);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    fillForm();
    requestAnimationFrame(() => nodes.form.elements.name?.focus());
  }

  function closeJobModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (formHome && nodes.form) {
      formHome.parentNode.insertBefore(nodes.form, formHome);
    }
    nodes.modal.hidden = true;
    document.body.classList.remove('modal-open');
    draftJob = null;
    if (nodes.editorTitle) nodes.editorTitle.textContent = 'Job Workspace';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function collectForm() {
    const data = Object.fromEntries(new FormData(nodes.form).entries());
    data.id = data.id || draftJob?.id || 'local-' + Date.now();
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
      stage: normalizeBusinessStatus(job.stage || job.status || 'Lead'),
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

  function normalizeBusinessStatus(value) {
    const status = String(value || 'Lead');
    const map = {
      Inspection: 'Site Review',
      'Estimate Approved': 'Approved',
      Production: 'Active',
      'QA Review': 'Active',
      Complete: 'Closed'
    };
    return map[status] || status;
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
    return 'task-management.html?' + params.toString();
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
    folders: center.querySelector('[data-drive-folders]'),
    folderSection: center.querySelector('[data-folder-section]'),
    crumb: center.querySelector('[data-file-crumb]'),
    context: center.querySelector('[data-file-context]'),
    capacityLabel: center.querySelector('[data-file-capacity-label]'),
    capacityBar: center.querySelector('[data-file-capacity-bar]'),
    uploadForm: center.querySelector('[data-file-upload-form]'),
    fileInput: center.querySelector('[data-file-input]'),
    uploadLog: center.querySelector('[data-file-upload-log]'),
    modal: center.querySelector('[data-file-modal]'),
    modalBody: center.querySelector('[data-file-modal-body]')
  };

  let client = null;
  let jobs = [];
  let allFiles = [];
  let files = [];
  let usageBytes = 0;
  let selectedJobId = requestedJobId || '';
  let selectedFileId = '';
  let driveFilter = 'job-files';
  let viewMode = 'grid';
  let uploadFormHome = null;
  let lastFocus = null;

  init();

  async function init() {
    bindEvents();
    if (!window.supabase || !center.dataset.supabaseUrl || !center.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      renderEmpty('Supabase client is not available on this page.');
      return;
    }
    client = window.createQuestSupabaseClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    if (!client) {
      setSync('Supabase unavailable', 'error');
      renderEmpty('Supabase client is not available on this page.');
      return;
    }
    await refreshAll();
  }

  function bindEvents() {
    nodes.refresh?.addEventListener('click', refreshAll);
    nodes.job?.addEventListener('change', async () => {
      selectedJobId = nodes.job.value;
      selectedFileId = '';
      driveFilter = 'job-files';
      setActiveDriveNav();
      await refreshFiles();
    });
    nodes.category?.addEventListener('change', render);
    nodes.search?.addEventListener('input', render);
    nodes.grid?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    nodes.folders?.addEventListener('click', async (event) => {
      const folder = event.target.closest('[data-drive-job-id]');
      if (!folder) return;
      driveFilter = 'job-files';
      selectedJobId = folder.dataset.driveJobId;
      selectedFileId = '';
      if (nodes.job) nodes.job.value = selectedJobId;
      setActiveDriveNav();
      await refreshFiles();
    });
    center.querySelector('[data-drive-root]')?.addEventListener('click', () => {
      driveFilter = 'job-files';
      setActiveDriveNav();
      render();
    });
    center.querySelectorAll('[data-drive-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        driveFilter = button.dataset.driveFilter || 'job-files';
        selectedFileId = '';
        setActiveDriveNav();
        render();
      });
    });
    center.querySelectorAll('[data-file-view]').forEach((button) => {
      button.addEventListener('click', () => {
        viewMode = button.dataset.fileView || 'grid';
        center.querySelectorAll('[data-file-view]').forEach((item) => item.classList.toggle('active', item === button));
        render();
      });
    });
    center.querySelector('[data-file-open-upload]')?.addEventListener('click', openUploadModal);
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-file-modal-close]')) closeUploadModal();
    });
    nodes.modal?.addEventListener('click', (event) => {
      if (event.target === nodes.modal) closeUploadModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nodes.modal && !nodes.modal.hidden) closeUploadModal();
    });
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
    const { data, error } = await client
      .from('job_files')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Files unavailable', 'error');
      allFiles = [];
      files = [];
      render();
      return;
    }
    allFiles = await withPreviewUrls(data || []);
    files = selectedJobId ? allFiles.filter((file) => file.job_id === selectedJobId) : [];
    const visible = filteredFiles();
    selectedFileId = selectedFileId && visible.some((file) => file.id === selectedFileId) ? selectedFileId : visible[0]?.id || '';
    setSync(jobs.length ? 'Supabase Storage live' : 'No jobs yet', jobs.length ? 'live' : 'local');
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
    let uploadedCount = 0;
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
      uploadedCount += 1;
      logUpload(file.name + ' uploaded.', 'ok');
    }

    nodes.fileInput.value = '';
    await refreshFiles();
    center.querySelector('[data-tab=\"job-files\"]')?.click();
    if (uploadedCount > 0) closeUploadModal();
  }

  function openUploadModal() {
    if (!nodes.modal || !nodes.modalBody || !nodes.uploadForm) {
      return;
    }
    if (!uploadFormHome) {
      uploadFormHome = document.createElement('div');
      uploadFormHome.hidden = true;
      nodes.uploadForm.parentNode.insertBefore(uploadFormHome, nodes.uploadForm);
    }
    lastFocus = document.activeElement;
    nodes.uploadLog.innerHTML = '';
    nodes.modalBody.appendChild(nodes.uploadForm);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => nodes.fileInput?.focus());
  }

  function closeUploadModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (uploadFormHome && nodes.uploadForm) {
      uploadFormHome.parentNode.insertBefore(nodes.uploadForm, uploadFormHome);
    }
    nodes.modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  async function deleteFile(id) {
    const file = allFiles.find((item) => item.id === id);
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
    const file = allFiles.find((item) => item.id === id);
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
    const selected = visible.find((file) => file.id === selectedFileId) || visible[0] || null;
    if (selected) selectedFileId = selected.id;
    center.querySelector('[data-file-metric=\"count\"]').textContent = String(allFiles.length);
    center.querySelector('[data-file-metric=\"used\"]').textContent = formatBytes(usageBytes);
    center.querySelector('[data-file-metric=\"job\"]').textContent = job ? shortText(job.name, 22) : viewLabel();
    nodes.crumb.textContent = driveFilter === 'job-files' ? (job?.name || 'Job files') : viewLabel();
    nodes.context.textContent = driveContext(job, visible.length);
    nodes.capacityLabel.textContent = formatBytes(usageBytes) + ' of ' + formatBytes(storageLimit);
    nodes.capacityBar.style.width = Math.min(100, Math.round((usageBytes / storageLimit) * 100)) + '%';
    nodes.folderSection.hidden = driveFilter !== 'job-files';
    renderFolders();

    nodes.grid.hidden = viewMode !== 'grid';
    nodes.table.hidden = viewMode !== 'list';
    nodes.grid.innerHTML = visible.length ? visible.map(fileCard).join('') : '<div class=\"empty-state\">No files match this Drive view.</div>';
    nodes.table.innerHTML = visible.length ? visible.map(fileRow).join('') : '<div class=\"empty-state\">No files match this Drive view.</div>';
    renderDetails(selected);
  }

  function renderFolders() {
    if (!nodes.folders) return;
    nodes.folders.innerHTML = jobs.length ? jobs.map((job) => {
      const count = allFiles.filter((file) => file.job_id === job.id).length;
      return '<button class=\"drive-folder-card-live ' + (job.id === selectedJobId ? 'active' : '') + '\" type=\"button\" data-drive-job-id=\"' + escapeHtml(job.id) + '\">' +
        '<span class=\"drive-folder-mark\">FL</span>' +
        '<span><strong>' + escapeHtml(job.name) + '</strong><span>' + escapeHtml(job.client_name || 'No client') + ' / ' + count + (count === 1 ? ' file' : ' files') + '</span></span>' +
      '</button>';
    }).join('') : '<div class=\"empty-state\">Create a job workspace to get its file folder.</div>';
  }

  function renderDetails(file) {
    if (!file) {
      const empty = '<div class=\"empty-state\">Select a file to inspect details.</div>';
      nodes.detail.innerHTML = empty;
      return;
    }
    const html = fileDetailHtml(file);
    nodes.detail.innerHTML = html;
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
      '<span class=\"file-type ' + fileTypeClass(file) + '\">' + escapeHtml(fileTypeLabel(file).slice(0, 3).toUpperCase()) + '</span>' +
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
    const source = driveFilter === 'job-files'
      ? files
      : driveFilter === 'recent'
        ? allFiles.slice(0, 40)
        : driveFilter === 'images'
          ? allFiles.filter((file) => isImage(file.mime_type))
          : driveFilter === 'documents'
            ? allFiles.filter((file) => !isImage(file.mime_type))
            : files;
    return source.filter((file) => {
      const categoryMatch = category === 'all' || file.category === category;
      const haystack = [file.file_name, file.mime_type, file.category, file.notes, file.uploaded_by_label].join(' ').toLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
  }

  function setActiveDriveNav() {
    center.querySelectorAll('[data-drive-filter]').forEach((button) => {
      button.classList.toggle('active', button.dataset.driveFilter === driveFilter);
    });
  }

  function viewLabel() {
    const labels = {
      'job-files': 'Job files',
      recent: 'Recent',
      images: 'Images',
      documents: 'Documents'
    };
    return labels[driveFilter] || 'Files';
  }

  function driveContext(job, count) {
    if (driveFilter === 'job-files') {
      return job ? (job.name + ' - ' + (job.client_name || 'No client') + ' - ' + count + (count === 1 ? ' file' : ' files')) : 'Create a job workspace before uploading files.';
    }
    return viewLabel() + ' - ' + count + (count === 1 ? ' file' : ' files');
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

  function fileTypeClass(file) {
    const label = fileTypeLabel(file);
    return label === 'PDF' ? 'pdf' : label === 'Drawing' ? 'drawing' : '';
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
    client = window.createQuestSupabaseClient(admin.dataset.supabaseUrl, admin.dataset.supabaseKey);
    if (!client) {
      setSync('Supabase unavailable', 'error');
      render();
      return;
    }
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
    const client = window.createQuestSupabaseClient(page.dataset.supabaseUrl, page.dataset.supabaseKey);
    if (!client) {
      setSync('Supabase unavailable', 'error');
      render([]);
      return;
    }
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
    const client = window.createQuestSupabaseClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    if (!client) return setSync('Local fallback', 'local');
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
      ['TaskManagement ready', sum(jobs, 'task_count') + ' linked tasks represented through project_id.'],
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
    const client = window.createQuestSupabaseClient(bridge.dataset.supabaseUrl, bridge.dataset.supabaseKey);
    if (!client) return setSync('Local fallback', 'local');
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
      const fallbackReturnUrl = safeReturnUrl('jobs.html?action=new');
      nodes.jobId.textContent = 'No job selected';
      nodes.projectId.textContent = 'No project_id';
      nodes.title.textContent = 'No job selected';
      nodes.stage.textContent = 'Create a job first';
      nodes.returnLink.href = fallbackReturnUrl;
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
    const fallbackReturnUrl = 'jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile';
    nodes.jobId.textContent = job.id;
    nodes.projectId.textContent = job.id;
    nodes.title.textContent = job.name;
    nodes.stage.textContent = job.stage + ' / ' + job.priority;
    nodes.returnLink.href = safeReturnUrl(fallbackReturnUrl);
    setMetric('tasks', number(job.task_count));
    setMetric('open', open);
    setMetric('completed', completed);
    setMetric('overdue', overdue);
    nodes.tasks.innerHTML = taskRows(job, open, completed, overdue);
    nodes.contract.innerHTML =
      contractRow('project_id', job.id) +
      contractRow('return_url', nodes.returnLink.href) +
      contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local demo fallback') +
      contractRow('profile link', 'profiles.member_id -> team_members.id') +
      contractRow('company scope', 'profiles.company_ids controls visible jobs and tasks');
  }

  function pickJob(jobs) {
    return jobs.find((job) => job.id === requestedId) || jobs[0] || null;
  }

  function safeReturnUrl(fallbackPath) {
    try {
      const fallback = new URL(fallbackPath, window.location.href);
      const candidate = new URL(params.get('return_url') || fallback.toString(), window.location.href);
      return candidate.origin === window.location.origin ? candidate.toString() : fallback.toString();
    } catch (error) {
      return new URL(fallbackPath, window.location.href).toString();
    }
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

  function taskRows(job, open, completed, overdue) {
    const total = number(job.task_count);
    if (!total) {
      return '<article class=\"empty-state\">No task rows are linked yet. When TaskManagement data is migrated, tasks with this project_id will appear here.</article>';
    }
    const rows = [
      [job.name + ' execution kickoff', 'Open', job.owner_name || 'Unassigned', 'project_id matched'],
      ['Supervisor review', overdue ? 'Overdue' : 'Review', 'Supervisor', overdue ? 'needs attention' : 'waiting review'],
      ['Field closeout checklist', completed ? 'Done' : 'Open', 'Worker', completed + ' completed'],
      ['Admin handoff', open ? 'Open' : 'Done', 'Admin', open + ' remaining']
    ];
    return rows.map((row) => '<div><strong>' + escapeHtml(row[0]) + '<span>' + escapeHtml(row[3]) + '</span></strong><b class=\"' + (row[1] === 'Overdue' ? 'overdue' : '') + '\">' + escapeHtml(row[1]) + '</b><span>' + escapeHtml(row[2]) + '</span></div>').join('');
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

const formsCenterJs = `(() => {
  const center = document.querySelector('[data-form-center]');
  if (!center) return;

  const formsKey = 'quest-hq-forms-v1';
  const responsesKey = 'quest-hq-form-responses-v1';
  const fieldTypes = {
    short: 'Short answer',
    paragraph: 'Paragraph',
    multiple: 'Multiple choice',
    checkboxes: 'Checkboxes',
    dropdown: 'Dropdown',
    file: 'File upload',
    linear: 'Linear scale',
    grid: 'Multiple choice grid',
    checkboxGrid: 'Checkbox grid',
    date: 'Date',
    time: 'Time',
    title: 'Title and description',
    section: 'Section',
    rating: 'Rating scale',
    yesno: 'Yes / No',
    signature: 'Signature'
  };
  const nodes = {
    state: center.querySelector('[data-form-state]'),
    list: center.querySelector('[data-form-list]'),
    summary: center.querySelector('[data-form-summary]'),
    settings: center.querySelector('[data-form-settings]'),
    dirty: center.querySelector('[data-form-dirty]'),
    search: center.querySelector('[data-form-search]'),
    typeFilter: center.querySelector('[data-form-type-filter]'),
    questionList: center.querySelector('[data-question-list]'),
    questionCount: center.querySelector('[data-question-count]'),
    questionMenu: center.querySelector('[data-question-menu]'),
    responseForm: center.querySelector('[data-response-form]'),
    responseSidecar: center.querySelector('[data-response-sidecar]'),
    responseList: center.querySelector('[data-response-list]'),
    responseCount: center.querySelector('[data-response-count]'),
    responseDetail: center.querySelector('[data-response-detail]'),
    builderPanel: center.querySelector('[data-form-builder-host]'),
    builderGrid: center.querySelector('.forms-builder-grid'),
    modal: center.querySelector('[data-form-modal]'),
    modalBody: center.querySelector('[data-form-modal-body]'),
    detailModal: center.querySelector('[data-form-detail-modal]'),
    detailBody: center.querySelector('[data-form-detail-body]'),
    editorResponseCount: center.querySelector('[data-form-editor-response-count]'),
    editorResponseList: center.querySelector('[data-form-editor-response-list]')
  };
  let builderHome = null;
  let lastFocus = null;
  let forms = read(formsKey, []);
  let responses = read(responsesKey, []);
  let draft = blankForm();
  let selectedId = forms[0]?.id || '';
  let selectedQuestionId = '';
  let selectedResponseId = '';
  let menuQuestionId = '';
  let dirty = false;
  const params = new URLSearchParams(window.location.search);
  const isPublicMode = params.get('public') === '1';
  if (isPublicMode) {
    document.body.classList.add('form-public-mode');
    const shared = readSharedForm(params.get('payload'));
    const byId = params.get('form') ? forms.find((form) => form.id === params.get('form')) : null;
    if (shared) {
      draft = shared;
      selectedId = shared.id || 'shared-form';
    } else if (byId) {
      draft = clone(byId);
      selectedId = byId.id;
    }
    selectedQuestionId = draft.questions?.[0]?.id || '';
  }
  if (!isPublicMode && selectedId) draft = clone(forms.find((form) => form.id === selectedId));
  if (isPublicMode && !draft.questions) draft = blankForm();

  bind();
  render();

  function bind() {
    center.querySelector('[data-form-new]')?.addEventListener('click', () => {
      selectedId = '';
      selectedQuestionId = '';
      selectedResponseId = '';
      draft = blankForm();
      dirty = true;
      render();
      openFormModal();
    });
    nodes.settings.addEventListener('input', () => {
      applySettings();
      dirty = true;
      renderLite();
    });
    nodes.settings.addEventListener('submit', (event) => {
      event.preventDefault();
      saveDraft();
      if (!nodes.modal.hidden) closeFormModal();
    });
    center.querySelector('[data-form-publish]')?.addEventListener('click', () => {
      draft.status = 'Published';
      saveDraft();
    });
    center.querySelector('[data-form-archive]')?.addEventListener('click', () => {
      draft.status = 'Archived';
      saveDraft();
    });
    center.querySelector('[data-form-duplicate]')?.addEventListener('click', duplicateForm);
    center.querySelector('[data-form-delete]')?.addEventListener('click', deleteForm);
    center.querySelector('[data-form-export]')?.addEventListener('click', exportForm);
    center.querySelectorAll('[data-form-editor-tab]').forEach((button) => {
      button.addEventListener('click', () => setEditorMode(button.dataset.formEditorTab || 'questions'));
    });
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-form-modal-close]')) closeFormModal();
      if (event.target.closest('[data-form-detail-close]')) closeFormDetailModal();
      if (event.target === nodes.modal) closeFormModal();
      if (event.target === nodes.detailModal) closeFormDetailModal();
      const copyLink = event.target.closest('[data-form-copy-link]');
      if (copyLink) {
        copyPublicLink();
        return;
      }
      const openPublic = event.target.closest('[data-form-open-public]');
      if (openPublic) {
        window.open(publicFormUrl(), '_blank', 'noopener,noreferrer');
        return;
      }
      const jump = event.target.closest('[data-tab-jump]');
      if (jump) {
        closeFormDetailModal();
        switchTab(jump.dataset.tabJump);
        return;
      }
      if (event.target.closest('[data-form-delete]')) {
        deleteForm();
        closeFormDetailModal();
        return;
      }
      if (event.target.closest('[data-form-duplicate]')) {
        duplicateForm();
        openFormDetailModal();
        return;
      }
      if (event.target.closest('[data-form-edit]')) {
        closeFormDetailModal();
        openFormModal();
      }
    });
    nodes.search?.addEventListener('input', renderLibrary);
    nodes.typeFilter?.addEventListener('change', renderLibrary);
    nodes.list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-form-id]');
      if (!button) return;
      selectForm(button.dataset.formId);
      openFormDetailModal();
    });
    nodes.summary.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-tab-jump]');
      if (jump) {
        switchTab(jump.dataset.tabJump);
        return;
      }
      if (event.target.closest('[data-form-delete]')) {
        deleteForm();
        return;
      }
      if (event.target.closest('[data-form-duplicate]')) {
        duplicateForm();
        return;
      }
      if (!event.target.closest('[data-form-edit]')) return;
      openFormModal();
    });
    center.querySelectorAll('[data-question-add]').forEach((button) => {
      button.addEventListener('click', () => addQuestion('multiple'));
    });
    center.querySelectorAll('[data-question-add-type]').forEach((button) => {
      button.addEventListener('click', () => addQuestion(button.dataset.questionAddType || 'multiple'));
    });
    nodes.questionList.addEventListener('click', (event) => {
      const card = event.target.closest('[data-question-id]');
      if (!card) return;
      selectedQuestionId = card.dataset.questionId;
      const actionButton = event.target.closest('[data-question-action]');
      const action = actionButton?.dataset.questionAction;
      if (action) {
        event.preventDefault();
        runQuestionAction(action, selectedQuestionId, actionButton);
        return;
      }
      nodes.questionList.querySelectorAll('.question-card').forEach((item) => item.classList.toggle('active', item.dataset.questionId === selectedQuestionId));
    });
    nodes.questionList.addEventListener('input', (event) => {
      updateQuestionFromInput(event.target);
    });
    nodes.questionList.addEventListener('change', (event) => {
      updateQuestionFromInput(event.target);
    });
    nodes.questionList.addEventListener('contextmenu', (event) => {
      const card = event.target.closest('[data-question-id]');
      if (!card || !nodes.questionMenu) return;
      event.preventDefault();
      selectedQuestionId = card.dataset.questionId;
      menuQuestionId = selectedQuestionId;
      renderQuestions();
      nodes.questionMenu.hidden = false;
      nodes.questionMenu.style.left = Math.min(event.clientX, window.innerWidth - 230) + 'px';
      nodes.questionMenu.style.top = Math.min(event.clientY, window.innerHeight - 230) + 'px';
    });
    nodes.questionMenu?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-menu-action]');
      if (!button) return;
      runQuestionAction(button.dataset.menuAction, menuQuestionId, button);
      nodes.questionMenu.hidden = true;
    });
    document.addEventListener('click', (event) => {
      if (!nodes.questionMenu || nodes.questionMenu.hidden || event.target.closest('[data-question-menu]')) return;
      nodes.questionMenu.hidden = true;
    });
    nodes.responseForm.addEventListener('submit', saveResponse);
    nodes.responseList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-response-id]');
      if (!button) return;
      selectedResponseId = button.dataset.responseId;
      renderResponses();
    });
    nodes.responseDetail.addEventListener('click', (event) => {
      if (!event.target.closest('[data-response-delete]')) return;
      deleteResponse();
    });
    center.querySelectorAll('[data-form-template]').forEach((button) => {
      button.addEventListener('click', () => {
        draft = templateForm(button.dataset.formTemplate);
        selectedId = '';
        selectedQuestionId = draft.questions[0]?.id || '';
        dirty = true;
        render();
        openFormModal();
      });
    });
  }

  function openFormModal() {
    if (!nodes.modal || !nodes.modalBody || !nodes.builderGrid) return;
    lastFocus = document.activeElement;
    builderHome = document.createComment('form-builder-home');
    nodes.builderGrid.parentNode.insertBefore(builderHome, nodes.builderGrid);
    nodes.modalBody.appendChild(nodes.builderGrid);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    setEditorMode('questions');
    nodes.modal.querySelector('[data-form-modal-close]')?.focus();
  }

  function closeFormModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (builderHome && nodes.builderGrid) {
      builderHome.parentNode.insertBefore(nodes.builderGrid, builderHome);
      builderHome.remove();
      builderHome = null;
    }
    nodes.modal.hidden = true;
    if (!nodes.detailModal || nodes.detailModal.hidden) document.body.classList.remove('modal-open');
    lastFocus?.focus?.();
    render();
  }

  function openFormDetailModal() {
    if (!nodes.detailModal || !nodes.detailBody) return;
    nodes.detailBody.innerHTML = formDetailHtml();
    nodes.detailModal.hidden = false;
    document.body.classList.add('modal-open');
    nodes.detailModal.querySelector('[data-form-detail-close]')?.focus();
  }

  function closeFormDetailModal() {
    if (!nodes.detailModal || nodes.detailModal.hidden) return;
    nodes.detailModal.hidden = true;
    if (!nodes.modal || nodes.modal.hidden) document.body.classList.remove('modal-open');
  }

  function saveDraft() {
    applySettings();
    if (!draft.title.trim()) {
      setState('Title required', 'error');
      return;
    }
    const now = new Date().toISOString();
    draft.updatedAt = now;
    if (!draft.id) draft.id = 'form-' + Date.now();
    if (!draft.createdAt) draft.createdAt = now;
    const existing = forms.findIndex((form) => form.id === draft.id);
    if (existing >= 0) forms[existing] = clone(draft);
    else forms.unshift(clone(draft));
    selectedId = draft.id;
    dirty = false;
    write(formsKey, forms);
    setState('Saved locally', 'live');
    render();
  }

  function selectForm(id) {
    const form = forms.find((item) => item.id === id);
    if (!form) return;
    selectedId = id;
    draft = clone(form);
    selectedQuestionId = draft.questions[0]?.id || '';
    selectedResponseId = responses.find((item) => item.formId === id)?.id || '';
    dirty = false;
    render();
  }

  function duplicateForm() {
    if (!draft.title.trim()) return;
    const copy = clone(draft);
    copy.id = 'form-' + Date.now();
    copy.title = copy.title + ' Copy';
    copy.status = 'Draft';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    forms.unshift(copy);
    selectedId = copy.id;
    draft = clone(copy);
    dirty = false;
    write(formsKey, forms);
    render();
  }

  function deleteForm() {
    if (!selectedId) {
      draft = blankForm();
      selectedQuestionId = '';
      dirty = false;
      render();
      return;
    }
    forms = forms.filter((form) => form.id !== selectedId);
    responses = responses.filter((response) => response.formId !== selectedId);
    write(formsKey, forms);
    write(responsesKey, responses);
    selectedId = forms[0]?.id || '';
    draft = selectedId ? clone(forms.find((form) => form.id === selectedId)) : blankForm();
    selectedQuestionId = draft.questions[0]?.id || '';
    selectedResponseId = '';
    dirty = false;
    render();
  }

  function exportForm() {
    const data = JSON.stringify({ form: draft, responses: responses.filter((item) => item.formId === draft.id) }, null, 2);
    navigator.clipboard?.writeText(data).then(() => setState('Copied JSON', 'live')).catch(() => {
      setState('Export ready in console', 'local');
      console.log(data);
    });
  }

  function applySettings() {
    const data = new FormData(nodes.settings);
    draft.title = String(data.get('title') || '');
    draft.description = String(data.get('description') || '');
    draft.type = String(data.get('type') || 'Inspection');
    draft.status = String(data.get('status') || 'Draft');
    draft.audience = String(data.get('audience') || '');
    draft.jobContext = String(data.get('jobContext') || '');
    draft.themeColor = String(data.get('themeColor') || '#f45d22');
    draft.backgroundStyle = String(data.get('backgroundStyle') || 'clean');
    draft.headerImage = String(data.get('headerImage') || '');
    draft.buttonLabel = String(data.get('buttonLabel') || 'Submit');
    draft.collectEmail = data.has('collectEmail');
    draft.requireApproval = data.has('requireApproval');
  }

  function addQuestion(type = 'multiple', afterId = '') {
    const question = blankQuestion(type);
    const index = afterId ? draft.questions.findIndex((item) => item.id === afterId) : -1;
    if (index >= 0) draft.questions.splice(index + 1, 0, question);
    else draft.questions.push(question);
    selectedQuestionId = question.id;
    dirty = true;
    render();
  }

  function updateQuestionFromInput(target) {
    const card = target.closest('[data-question-id]');
    if (!card) return;
    const question = draft.questions.find((item) => item.id === card.dataset.questionId);
    if (!question) return;
    selectedQuestionId = question.id;
    if (target.matches('[data-question-label]')) question.label = target.value;
    else if (target.matches('[data-question-help]')) question.help = target.value;
    else if (target.matches('[data-question-type-select]')) {
      question.type = target.value;
      normalizeQuestion(question);
      dirty = true;
      renderQuestions();
      renderPreview();
      renderLite();
      return;
    } else if (target.matches('[data-question-required]')) question.required = target.checked;
    else if (target.matches('[data-question-review]')) question.reviewFlag = target.checked;
    else if (target.matches('[data-question-option]')) question.options[number(target.dataset.optionIndex)] = target.value;
    else if (target.matches('[data-question-row]')) question.rows[number(target.dataset.rowIndex)] = target.value;
    else if (target.matches('[data-question-column]')) question.columns[number(target.dataset.columnIndex)] = target.value;
    else if (target.matches('[data-question-scale-min]')) question.scaleMin = number(target.value, 1);
    else if (target.matches('[data-question-scale-max]')) question.scaleMax = number(target.value, 5);
    dirty = true;
    renderPreview();
    renderLite();
  }

  function runQuestionAction(action, id = selectedQuestionId, actionEl = null) {
    selectedQuestionId = id;
    if (action === 'addBelow') return addQuestion('multiple', id);
    if (action === 'duplicate') return duplicateQuestion(id);
    if (action === 'delete') return deleteQuestion(id);
    if (action === 'moveUp') return moveQuestion(-1, id);
    if (action === 'moveDown') return moveQuestion(1, id);
    if (action === 'addOption') return addQuestionOption(id);
    if (action === 'removeOption') return removeQuestionOption(id, number(actionEl?.dataset.optionIndex, -1));
    if (action === 'addRow') return addGridItem(id, 'rows');
    if (action === 'addColumn') return addGridItem(id, 'columns');
    if (action === 'removeRow') return removeGridItem(id, 'rows', number(actionEl?.dataset.rowIndex, -1));
    if (action === 'removeColumn') return removeGridItem(id, 'columns', number(actionEl?.dataset.columnIndex, -1));
  }

  function addQuestionOption(id) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    question.options = question.options || [];
    question.options.push('Option ' + (question.options.length + 1));
    dirty = true;
    render();
  }

  function removeQuestionOption(id, index) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question || index < 0) return;
    question.options.splice(index, 1);
    if (!question.options.length) question.options.push('Option 1');
    dirty = true;
    render();
  }

  function addGridItem(id, key) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    question[key] = question[key] || [];
    question[key].push((key === 'rows' ? 'Row ' : 'Column ') + (question[key].length + 1));
    dirty = true;
    render();
  }

  function removeGridItem(id, key, index) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question || index < 0) return;
    question[key].splice(index, 1);
    if (!question[key].length) question[key].push(key === 'rows' ? 'Row 1' : 'Column 1');
    dirty = true;
    render();
  }

  function deleteQuestion(id = selectedQuestionId) {
    draft.questions = draft.questions.filter((question) => question.id !== id);
    selectedQuestionId = draft.questions[0]?.id || '';
    dirty = true;
    render();
  }

  function duplicateQuestion(id = selectedQuestionId) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    const copy = { ...clone(question), id: 'q-' + Date.now(), label: question.label + ' Copy' };
    const index = draft.questions.findIndex((item) => item.id === question.id);
    draft.questions.splice(index + 1, 0, copy);
    selectedQuestionId = copy.id;
    dirty = true;
    render();
  }

  function moveQuestion(direction, id = selectedQuestionId) {
    const index = draft.questions.findIndex((question) => question.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= draft.questions.length) return;
    const [question] = draft.questions.splice(index, 1);
    draft.questions.splice(next, 0, question);
    dirty = true;
    render();
  }

  function saveResponse(event) {
    event.preventDefault();
    if (!draft.questions.length) {
      setState('Add questions first', 'local');
      return;
    }
    const data = new FormData(nodes.responseForm);
    const values = {};
    draft.questions.forEach((question) => {
      if (question.type === 'checkboxes') values[question.id] = data.getAll(question.id);
      else if (question.type === 'grid' || question.type === 'checkboxGrid') {
        values[question.id] = (question.rows || []).map((row, index) => ({
          row,
          value: question.type === 'checkboxGrid' ? data.getAll(question.id + '-' + index) : data.get(question.id + '-' + index)
        }));
      }
      else values[question.id] = data.get(question.id) || '';
    });
    const response = {
      id: 'response-' + Date.now(),
      formId: draft.id || 'unsaved-draft',
      formTitle: draft.title || 'Unsaved form',
      submittedAt: new Date().toISOString(),
      values
    };
    responses.unshift(response);
    selectedResponseId = response.id;
    write(responsesKey, responses);
    setState('Response saved', 'live');
    nodes.responseForm.reset();
    if (isPublicMode) {
      nodes.responseForm.innerHTML = '<div class=\"public-thank-you\"><h2>Response submitted</h2><p class=\"muted\">Thank you. Your response was saved on this device for the presentation mockup.</p></div>';
      return;
    }
    render();
    switchTab('responses');
  }

  function render() {
    if (isPublicMode) setPublicLayout();
    renderMetrics();
    renderSettings();
    renderLibrary();
    renderSummary();
    renderQuestions();
    renderPreview();
    renderResponses();
    renderEditorResponses();
    renderLite();
  }

  function renderLite() {
    nodes.dirty.textContent = dirty ? 'Unsaved changes' : (selectedId ? 'Saved locally' : 'Unsaved draft');
  }

  function renderMetrics() {
    setMetric('forms', forms.length);
    setMetric('published', forms.filter((form) => form.status === 'Published').length);
    setMetric('responses', responses.length);
    setMetric('questions', forms.reduce((sum, form) => sum + form.questions.length, 0));
  }

  function renderSettings() {
    nodes.settings.elements.title.value = draft.title || '';
    nodes.settings.elements.description.value = draft.description || '';
    nodes.settings.elements.type.value = draft.type || 'Inspection';
    nodes.settings.elements.status.value = draft.status || 'Draft';
    nodes.settings.elements.audience.value = draft.audience || '';
    nodes.settings.elements.jobContext.value = draft.jobContext || '';
    nodes.settings.elements.themeColor.value = draft.themeColor || '#f45d22';
    nodes.settings.elements.backgroundStyle.value = draft.backgroundStyle || 'clean';
    nodes.settings.elements.headerImage.value = draft.headerImage || '';
    nodes.settings.elements.buttonLabel.value = draft.buttonLabel || 'Submit';
    nodes.settings.elements.collectEmail.checked = !!draft.collectEmail;
    nodes.settings.elements.requireApproval.checked = !!draft.requireApproval;
  }

  function renderLibrary() {
    const query = (nodes.search?.value || '').toLowerCase();
    const filter = nodes.typeFilter?.value || 'all';
    const visible = forms.filter((form) => {
      const haystack = [form.title, form.type, form.audience, form.jobContext].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (filter === 'all' || form.type === filter);
    });
    nodes.list.innerHTML = visible.length ? visible.map((form) => {
      const count = responses.filter((response) => response.formId === form.id).length;
      return '<button type=\"button\" class=\"form-card ' + (form.id === selectedId ? 'active' : '') + '\" data-form-id=\"' + escapeHtml(form.id) + '\"><strong>' + escapeHtml(form.title) + '</strong><span>' + escapeHtml(form.type) + ' / ' + escapeHtml(form.status) + '</span><small>' + form.questions.length + ' questions / ' + count + ' responses</small></button>';
    }).join('') : '<div class=\"empty-state\">No saved forms yet. Use New Form or apply a template.</div>';
  }

  function renderSummary() {
    if (!selectedId && !draft.title) {
      nodes.summary.innerHTML = '';
      return;
    }
    nodes.summary.innerHTML = '';
    if (nodes.detailModal && !nodes.detailModal.hidden && nodes.detailBody) nodes.detailBody.innerHTML = formDetailHtml();
  }

  function formDetailHtml() {
    const count = responses.filter((response) => response.formId === draft.id).length;
    const publicUrl = publicFormUrl();
    return '<div class=\"forms-summary-head\"><div><h2>' + escapeHtml(draft.title || 'Unsaved form') + '</h2><p class=\"muted\">' + escapeHtml(draft.description || 'No description yet.') + '</p></div><span>' + escapeHtml(draft.status || 'Draft') + '</span></div>' +
      '<div class=\"forms-simple-meta\"><span>' + escapeHtml(draft.type || 'Inspection') + '</span><button type=\"button\" data-tab-jump=\"responses\">' + count + ' responses</button><span>' + draft.questions.length + ' questions</span></div>' +
      '<div class=\"share-card forms-summary-share\"><strong>Respondent link</strong><input readonly value=\"' + escapeHtml(publicUrl) + '\"><div class=\"form-actions\"><button class=\"primary-button\" type=\"button\" data-form-open-public>Open</button><button class=\"secondary-button\" type=\"button\" data-form-copy-link>Copy</button></div></div>' +
      '<div class=\"form-actions forms-summary-actions\"><button class=\"primary-button\" type=\"button\" data-form-edit>Edit Form</button><button class=\"secondary-button\" type=\"button\" data-tab-jump=\"preview\">Preview</button><button class=\"secondary-button\" type=\"button\" data-tab-jump=\"responses\">Responses</button><button class=\"secondary-button\" type=\"button\" data-form-duplicate>Duplicate</button><button class=\"danger-button\" type=\"button\" data-form-delete>Delete Form</button></div>';
  }

  function renderQuestions() {
    const countLabel = draft.questions.length + (draft.questions.length === 1 ? ' question' : ' questions');
    if (nodes.questionCount) nodes.questionCount.textContent = countLabel;
    nodes.questionList.innerHTML = draft.questions.length ? draft.questions.map(questionCard).join('') : '<div class=\"empty-state\">Add a question to start building the form.</div>';
  }

  function questionCard(question, index) {
    normalizeQuestion(question);
    const active = question.id === selectedQuestionId ? ' active' : '';
    const staticBlock = ['title', 'section'].includes(question.type) ? ' gform-static-block' : '';
    return '<article class=\"question-card' + active + staticBlock + '\" data-question-id=\"' + escapeHtml(question.id) + '\">' +
      '<div class=\"gform-card-body\">' +
        '<div class=\"gform-question-top\">' +
          '<input class=\"gform-question-input\" data-question-label value=\"' + escapeHtml(question.label || '') + '\" placeholder=\"Question\">' +
          '<select class=\"gform-type-select\" data-question-type-select>' + questionTypeOptions(question.type) + '</select>' +
        '</div>' +
        '<textarea class=\"gform-help-input\" data-question-help rows=\"2\" placeholder=\"Description or help text\">' + escapeHtml(question.help || '') + '</textarea>' +
        questionBuilderFields(question) +
      '</div>' +
      '<div class=\"gform-card-footer\">' +
        '<span class=\"gform-context-hint\">Right-click for card actions</span>' +
        '<label class=\"gform-required\"><input type=\"checkbox\" data-question-required ' + (question.required ? 'checked' : '') + '> Required</label>' +
        '<label class=\"gform-required\"><input type=\"checkbox\" data-question-review ' + (question.reviewFlag ? 'checked' : '') + '> Review</label>' +
        '<div class=\"gform-card-menu\">' +
          '<button class=\"gform-card-icon\" type=\"button\" data-question-action=\"moveUp\" title=\"Move up\">Up</button>' +
          '<button class=\"gform-card-icon\" type=\"button\" data-question-action=\"moveDown\" title=\"Move down\">Dn</button>' +
          '<button class=\"gform-card-icon\" type=\"button\" data-question-action=\"duplicate\" title=\"Duplicate\">Cp</button>' +
          '<button class=\"gform-card-icon\" type=\"button\" data-question-action=\"delete\" title=\"Delete\">X</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function questionTypeOptions(selected) {
    return Object.entries(fieldTypes).map(([value, label]) => '<option value=\"' + value + '\" ' + (selected === value ? 'selected' : '') + '>' + escapeHtml(label) + '</option>').join('');
  }

  function questionBuilderFields(question) {
    if (['multiple', 'checkboxes', 'dropdown'].includes(question.type)) return choiceEditor(question);
    if (['grid', 'checkboxGrid'].includes(question.type)) return gridEditor(question);
    if (['linear', 'rating'].includes(question.type)) return scaleEditor(question);
    if (question.type === 'paragraph') return '<div class=\"gform-preview-line\">Long answer text</div>';
    if (question.type === 'short') return '<div class=\"gform-preview-line\">Short answer text</div>';
    if (question.type === 'date') return '<div class=\"gform-preview-line\">Month, day, year</div>';
    if (question.type === 'time') return '<div class=\"gform-preview-line\">Time</div>';
    if (question.type === 'file') return '<div class=\"gform-file-preview\">Respondents will provide a file link in this mockup. Supabase Storage upload can attach here later.</div>';
    if (question.type === 'yesno') return choiceEditor({ ...question, options: ['Yes', 'No'] });
    if (question.type === 'signature') return '<div class=\"gform-file-preview\">Acknowledgement checkbox shown in preview.</div>';
    return '<div class=\"gform-preview-line\">Text block</div>';
  }

  function choiceEditor(question) {
    const markerClass = question.type === 'checkboxes' ? 'square' : question.type === 'dropdown' ? 'dropdown' : '';
    return '<div class=\"gform-option-list\">' + (question.options || []).map((option, index) =>
      '<div class=\"gform-option-row\"><span class=\"gform-option-marker ' + markerClass + '\">' + (question.type === 'dropdown' ? (index + 1) : '') + '</span><input class=\"gform-option-input\" data-question-option data-option-index=\"' + index + '\" value=\"' + escapeHtml(option) + '\" placeholder=\"Option\"><button class=\"gform-option-remove\" type=\"button\" data-question-action=\"removeOption\" data-option-index=\"' + index + '\" title=\"Remove option\">X</button></div>'
    ).join('') + '<button class=\"gform-option-add\" type=\"button\" data-question-action=\"addOption\">Add option</button></div>';
  }

  function gridEditor(question) {
    return '<div class=\"gform-grid-editor\"><strong>Rows</strong>' + (question.rows || []).map((row, index) =>
      '<div class=\"gform-option-row\"><span class=\"gform-option-marker square\"></span><input class=\"gform-option-input\" data-question-row data-row-index=\"' + index + '\" value=\"' + escapeHtml(row) + '\"><button class=\"gform-option-remove\" type=\"button\" data-question-action=\"removeRow\" data-row-index=\"' + index + '\">X</button></div>'
    ).join('') + '<button class=\"gform-option-add\" type=\"button\" data-question-action=\"addRow\">Add row</button><strong>Columns</strong>' + (question.columns || []).map((column, index) =>
      '<div class=\"gform-option-row\"><span class=\"gform-option-marker\"></span><input class=\"gform-option-input\" data-question-column data-column-index=\"' + index + '\" value=\"' + escapeHtml(column) + '\"><button class=\"gform-option-remove\" type=\"button\" data-question-action=\"removeColumn\" data-column-index=\"' + index + '\">X</button></div>'
    ).join('') + '<button class=\"gform-option-add\" type=\"button\" data-question-action=\"addColumn\">Add column</button></div>';
  }

  function scaleEditor(question) {
    return '<div class=\"gform-scale-row\"><label>Scale min<input class=\"gform-scale-input\" type=\"number\" min=\"0\" max=\"10\" data-question-scale-min value=\"' + escapeHtml(question.scaleMin ?? 1) + '\"></label><label>Scale max<input class=\"gform-scale-input\" type=\"number\" min=\"1\" max=\"10\" data-question-scale-max value=\"' + escapeHtml(question.scaleMax ?? 5) + '\"></label></div>';
  }

  function renderPreview() {
    if (!draft.title && !draft.questions.length) {
      nodes.responseForm.innerHTML = isPublicMode ? '<div class=\"empty-state\">This form link is empty or expired.</div>' : '<div class=\"empty-state\">Build or select a form to preview it.</div>';
      if (nodes.responseSidecar) nodes.responseSidecar.innerHTML = '<h2>Collector Settings</h2><p class=\"muted\">No form selected.</p>';
      return;
    }
    nodes.responseForm.classList.add('designed-form');
    nodes.responseForm.style.setProperty('--form-theme', themeColor());
    document.body.dataset.formBackground = draft.backgroundStyle || 'clean';
    nodes.responseForm.innerHTML = respondentHeader() +
      (draft.collectEmail ? '<label>Email<input type=\"email\" name=\"respondent_email\" placeholder=\"name@example.com\"></label>' : '') +
      (draft.questions.length ? draft.questions.map(responseField).join('') : '<div class=\"empty-state\">No questions yet.</div>') +
      '<div class=\"form-actions\"><button class=\"primary-button\" type=\"submit\">' + escapeHtml(draft.buttonLabel || 'Submit') + '</button>' + (isPublicMode ? '' : '<button class=\"secondary-button\" type=\"reset\">Clear</button>') + '</div>';
    const saved = draft.id ? responses.filter((response) => response.formId === draft.id).length : 0;
    if (nodes.responseSidecar) {
      nodes.responseSidecar.innerHTML = '<h2>Share & Collect</h2><p class=\"muted\">This generated link opens a dedicated respondent form without the Quest HQ sidebar.</p>' +
        '<div class=\"share-card\"><strong>Public form link</strong><input readonly value=\"' + escapeHtml(publicFormUrl()) + '\"><div class=\"form-actions\"><button class=\"primary-button\" type=\"button\" data-form-open-public>Open</button><button class=\"secondary-button\" type=\"button\" data-form-copy-link>Copy</button></div></div>' +
        '<div class=\"summary-pill-grid\">' + pill('Status', draft.status) + pill('Responses', saved) + pill('Email', draft.collectEmail ? 'Collected' : 'Off') + '</div>';
    }
  }

  function renderResponses() {
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    nodes.responseCount.textContent = current.length + (current.length === 1 ? ' response' : ' responses');
    nodes.responseList.innerHTML = current.length ? current.map((response) =>
      '<button type=\"button\" class=\"response-card ' + (response.id === selectedResponseId ? 'active' : '') + '\" data-response-id=\"' + escapeHtml(response.id) + '\"><strong>' + escapeHtml(response.formTitle) + '</strong><span>' + formatDate(response.submittedAt) + '</span></button>'
    ).join('') : '<div class=\"empty-state\">No responses for this form yet.</div>';
    const response = responses.find((item) => item.id === selectedResponseId) || current[0];
    if (!response) {
      nodes.responseDetail.innerHTML = '<div class=\"empty-state\">Select a response to review submitted answers.</div>';
      return;
    }
    selectedResponseId = response.id;
    nodes.responseDetail.innerHTML = '<div class=\"response-detail-head\"><div><h2>Response Detail</h2><p class=\"muted\">Submitted ' + formatDate(response.submittedAt) + '</p></div><button class=\"danger-button\" type=\"button\" data-response-delete>Delete Response</button></div><div class=\"response-detail-list\">' +
      draft.questions.map((question) => '<div><strong>' + escapeHtml(question.label || 'Untitled question') + '</strong><span>' + escapeHtml(formatAnswer(response.values[question.id])) + '</span></div>').join('') +
      '</div>';
  }

  function deleteResponse() {
    if (!selectedResponseId) return;
    responses = responses.filter((response) => response.id !== selectedResponseId);
    write(responsesKey, responses);
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    selectedResponseId = current[0]?.id || '';
    setState('Response deleted', 'live');
    render();
  }

  function renderEditorResponses() {
    if (!nodes.editorResponseCount || !nodes.editorResponseList) return;
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    nodes.editorResponseCount.textContent = current.length + (current.length === 1 ? ' response' : ' responses');
    nodes.editorResponseList.innerHTML = current.length ? current.slice(0, 6).map((response) =>
      '<div class=\"gform-modal-response-row\"><strong>' + escapeHtml(response.formTitle) + '</strong><span>' + formatDate(response.submittedAt) + '</span></div>'
    ).join('') : '<div class=\"empty-state\">No responses yet. Use Preview & Collect to submit a test response.</div>';
  }

  function responseField(question) {
    const required = question.required ? ' required' : '';
    const help = question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '';
    const label = '<strong>' + escapeHtml(question.label || 'Untitled question') + (question.required ? ' *' : '') + '</strong>' + help;
    const options = (question.options || ['Option 1', 'Option 2']);
    if (question.type === 'paragraph') return '<label class=\"response-question\">' + label + '<textarea name=\"' + question.id + '\" rows=\"4\"' + required + '></textarea></label>';
    if (question.type === 'multiple') return '<div class=\"response-question\">' + label + '<div class=\"response-options\">' + options.map((option) => '<label><input type=\"radio\" name=\"' + question.id + '\" value=\"' + escapeHtml(option) + '\"' + required + '> ' + escapeHtml(option) + '</label>').join('') + '</div></div>';
    if (question.type === 'checkboxes') return '<div class=\"response-question\">' + label + '<div class=\"response-options\">' + options.map((option) => '<label><input type=\"checkbox\" name=\"' + question.id + '\" value=\"' + escapeHtml(option) + '\"> ' + escapeHtml(option) + '</label>').join('') + '</div></div>';
    if (question.type === 'dropdown') return '<label class=\"response-question\">' + label + '<select name=\"' + question.id + '\"' + required + '><option value=\"\">Select...</option>' + options.map((option) => '<option>' + escapeHtml(option) + '</option>').join('') + '</select></label>';
    if (question.type === 'rating') {
      const min = number(question.scaleMin, 1);
      const max = number(question.scaleMax, 5);
      const scale = Array.from({ length: Math.max(max - min + 1, 1) }, (_, index) => min + index);
      return '<div class=\"response-question\">' + label + '<div class=\"rating-row\">' + scale.map((value) => '<label><input type=\"radio\" name=\"' + question.id + '\" value=\"' + value + '\"' + required + '>' + value + '</label>').join('') + '</div></div>';
    }
    if (question.type === 'linear') {
      const min = number(question.scaleMin, 1);
      const max = number(question.scaleMax, 5);
      const scale = Array.from({ length: Math.max(max - min + 1, 1) }, (_, index) => min + index);
      return '<div class=\"response-question\">' + label + '<div class=\"rating-row\">' + scale.map((value) => '<label><input type=\"radio\" name=\"' + question.id + '\" value=\"' + value + '\"' + required + '>' + value + '</label>').join('') + '</div></div>';
    }
    if (question.type === 'grid' || question.type === 'checkboxGrid') {
      return '<div class=\"response-question\">' + label + '<div class=\"response-detail-list\">' + (question.rows || ['Row 1']).map((row, rowIndex) => '<div><strong>' + escapeHtml(row) + '</strong><div class=\"response-options\">' + (question.columns || ['Column 1']).map((column, columnIndex) => '<label><input type=\"' + (question.type === 'checkboxGrid' ? 'checkbox' : 'radio') + '\" name=\"' + question.id + '-' + rowIndex + '\" value=\"' + escapeHtml(column) + '\"> ' + escapeHtml(column) + '</label>').join('') + '</div></div>').join('') + '</div></div>';
    }
    if (question.type === 'date') return '<label class=\"response-question\">' + label + '<input type=\"date\" name=\"' + question.id + '\"' + required + '></label>';
    if (question.type === 'time') return '<label class=\"response-question\">' + label + '<input type=\"time\" name=\"' + question.id + '\"' + required + '></label>';
    if (question.type === 'title') return '<div class=\"response-question\"><strong>' + escapeHtml(question.label || 'Untitled title') + '</strong>' + (question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '') + '</div>';
    if (question.type === 'section') return '<div class=\"response-question\"><strong>' + escapeHtml(question.label || 'Section') + '</strong>' + (question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '') + '</div>';
    if (question.type === 'yesno') return '<div class=\"response-question\">' + label + '<div class=\"response-options\"><label><input type=\"radio\" name=\"' + question.id + '\" value=\"Yes\"' + required + '> Yes</label><label><input type=\"radio\" name=\"' + question.id + '\" value=\"No\"' + required + '> No</label></div></div>';
    if (question.type === 'signature') return '<label class=\"response-question forms-check\"><input type=\"checkbox\" name=\"' + question.id + '\" value=\"Acknowledged\"' + required + '> ' + escapeHtml(question.label || 'I acknowledge this form') + '</label>';
    if (question.type === 'file') return '<label class=\"response-question\">' + label + '<input type=\"text\" name=\"' + question.id + '\" placeholder=\"File name or Quest HQ Files link\"' + required + '></label>';
    return '<label class=\"response-question\">' + label + '<input name=\"' + question.id + '\"' + required + '></label>';
  }

  function setPublicLayout() {
    center.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === 'preview'));
    center.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === 'preview'));
  }

  function respondentHeader() {
    const image = String(draft.headerImage || '').trim();
    return '<div class=\"designed-form-header\">' +
      (image ? '<div class=\"designed-form-image\" style=\"background-image:url(' + cssUrl(image) + ')\"></div>' : '') +
      '<div class=\"designed-form-title\"><h2>' + escapeHtml(draft.title || 'Untitled form') + '</h2><p class=\"muted\">' + escapeHtml(draft.description || 'No description yet.') + '</p></div>' +
    '</div>';
  }

  function publicFormUrl() {
    const form = clone(draft);
    if (!form.id) form.id = 'shared-form';
    const savedForm = form.id && forms.some((item) => item.id === form.id);
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, 'forms.html');
    url.search = savedForm
      ? '?public=1&form=' + encodeURIComponent(form.id)
      : '?public=1&payload=' + encodeURIComponent(encodePayload(form));
    url.hash = '';
    return url.toString();
  }

  function copyPublicLink() {
    if (!draft.title.trim()) {
      setState('Title required before sharing', 'error');
      return;
    }
    saveDraft();
    const url = publicFormUrl();
    navigator.clipboard?.writeText(url).then(() => setState('Public link copied', 'live')).catch(() => {
      setState('Copy failed. Link is visible.', 'error');
    });
  }

  function encodePayload(value) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  }

  function readSharedForm(payload) {
    if (!payload) return null;
    try {
      const form = JSON.parse(decodeURIComponent(escape(atob(payload))));
      return form && Array.isArray(form.questions) ? form : null;
    } catch {
      return null;
    }
  }

  function themeColor() {
    const color = String(draft.themeColor || '#f45d22');
    return /^#[0-9a-f]{6}$/i.test(color) ? color : '#f45d22';
  }

  function cssUrl(value) {
    return '\\'' + String(value).replace(/[\\\\']/g, '') + '\\'';
  }

  function blankForm() {
    return { id: '', title: '', description: '', type: 'Inspection', status: 'Draft', audience: '', jobContext: '', themeColor: '#f45d22', backgroundStyle: 'clean', headerImage: '', buttonLabel: 'Submit', collectEmail: false, requireApproval: false, createdAt: '', updatedAt: '', questions: [] };
  }

  function blankQuestion(type) {
    const question = { id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000), type: type || 'multiple', label: fieldTypes[type] || 'Question', help: '', required: false, reviewFlag: false, options: ['Option 1', 'Option 2'], rows: ['Row 1'], columns: ['Column 1'], scaleMin: 1, scaleMax: 5 };
    normalizeQuestion(question);
    return question;
  }

  function normalizeQuestion(question) {
    if (!question.type || !fieldTypes[question.type]) question.type = 'multiple';
    if (!Array.isArray(question.options) || !question.options.length) question.options = ['Option 1', 'Option 2'];
    if (!Array.isArray(question.rows) || !question.rows.length) question.rows = ['Row 1'];
    if (!Array.isArray(question.columns) || !question.columns.length) question.columns = ['Column 1'];
    if (question.scaleMin === undefined || question.scaleMin === null || question.scaleMin === '') question.scaleMin = 1;
    if (question.scaleMax === undefined || question.scaleMax === null || question.scaleMax === '') question.scaleMax = 5;
    if (question.type === 'yesno') question.options = ['Yes', 'No'];
  }

  function templateForm(name) {
    const form = blankForm();
    const templates = {
      inspection: ['Roof Inspection', 'Field inspection checklist with ratings, notes, photos, and signoff.', 'Inspection', [
        ['short', 'Site or roof section inspected'],
        ['rating', 'Overall condition rating'],
        ['checkboxes', 'Observed issues', ['Leak evidence', 'Damaged flashing', 'Missing shingles', 'Soft decking']],
        ['file', 'Photo set or Files link'],
        ['signature', 'Inspector acknowledgement']
      ]],
      survey: ['Client Satisfaction Survey', 'Client feedback after a completed service or milestone.', 'Survey', [
        ['rating', 'How satisfied are you with the service?'],
        ['multiple', 'Would you recommend us?', ['Yes', 'Maybe', 'No']],
        ['paragraph', 'What should we improve?'],
        ['yesno', 'May we contact you for follow-up?']
      ]],
      approval: ['Estimate Approval', 'Client approval for scope, estimate, and next step authorization.', 'Approval', [
        ['short', 'Approver name'],
        ['multiple', 'Approval decision', ['Approved', 'Approved with changes', 'Rejected']],
        ['paragraph', 'Requested changes or notes'],
        ['signature', 'I confirm this approval']
      ]],
      intake: ['Service Intake', 'Capture a new request before it becomes a job workspace.', 'Intake', [
        ['short', 'Client or company name'],
        ['dropdown', 'Request type', ['Roof leak', 'Inspection', 'Estimate', 'Repair', 'Other']],
        ['multiple', 'Urgency', ['Low', 'Medium', 'High', 'Urgent']],
        ['paragraph', 'Describe the request'],
        ['file', 'Photos or documents']
      ]]
    };
    const selected = templates[name] || templates.inspection;
    form.title = selected[0];
    form.description = selected[1];
    form.type = selected[2];
    form.questions = selected[3].map((item) => {
      const question = blankQuestion(item[0]);
      question.label = item[1];
      if (item[2]) question.options = item[2];
      question.required = ['short', 'multiple', 'signature'].includes(item[0]);
      return question;
    });
    return form;
  }

  function selectedQuestion() {
    return draft.questions.find((question) => question.id === selectedQuestionId) || null;
  }

  function setMetric(name, value) {
    const node = center.querySelector('[data-form-metric=\"' + name + '\"]');
    if (node) node.textContent = String(value);
  }

  function setState(message, state) {
    nodes.state.textContent = message;
    nodes.state.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function switchTab(name) {
    center.querySelector('[data-tab=\"' + name + '\"]')?.click();
  }

  function setEditorMode(mode) {
    if (!nodes.builderGrid) return;
    nodes.builderGrid.dataset.formEditorMode = mode;
    center.querySelectorAll('[data-form-editor-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.formEditorTab === mode);
    });
  }

  function pill(label, value) {
    return '<span><strong>' + escapeHtml(label) + '</strong><small>' + escapeHtml(value ?? '') + '</small></span>';
  }

  function formatAnswer(value) {
    if (Array.isArray(value)) return value.map((item) => typeof item === 'object' && item ? item.row + ': ' + formatAnswer(item.value) : item).join(', ');
    return value || 'No answer';
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : 'Not saved';
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#039;' }[char]));
  }
})();`;

const tutorialJs = `(() => {
  const overlay = document.querySelector('[data-tour-overlay]');
  if (!overlay) return;

  const storageKey = 'quest-hq-tour-workflow-v15';
  const moduleId = document.body.dataset.module || '';
  const nodes = {
    card: overlay.querySelector('[data-tour-card]'),
    spotlight: overlay.querySelector('[data-tour-spotlight]'),
    count: overlay.querySelector('[data-tour-count]'),
    progress: overlay.querySelector('[data-tour-progress]'),
    title: overlay.querySelector('[data-tour-title]'),
    body: overlay.querySelector('[data-tour-body]'),
    back: overlay.querySelector('[data-tour-back]'),
    next: overlay.querySelector('[data-tour-next]'),
    skip: overlay.querySelector('[data-tour-skip]')
  };
  let index = 0;
  let steps = [];

  const commonSteps = [
    { selector: '.brand', title: 'Quest HQ Command Shell', body: 'Start here: Quest HQ is the business command layer. It owns companies, job workspaces, files, analytics, and the context that TaskManagement needs.' },
    { selector: '.nav-list', title: 'Live vs Planned Modules', body: 'The clickable modules are live for this demo. Grey modules are intentionally marked planned so the presenter can explain the roadmap without showing fake systems.' },
    { selector: '.build-badge', title: 'Presentation Build', body: 'This badge confirms the loaded version. If someone has a stale browser tab, the badge makes cache issues obvious.' }
  ];

  const pageSteps = {
    command: [
      { selector: '.metric-grid', title: 'Operations Snapshot', body: 'These cards roll up real Job Center data: active job workspaces, urgency, linked task counts, and pipeline value. Analytics details are moved to the Analytics page to keep this dashboard clean.' },
      { selector: '.ops-job-list', title: 'Recent Job Workspaces', body: 'Saved jobs appear here as business workspaces. They are not task lists; they are containers for client, site, files, finance, forms, and handoff context.' },
      { selector: '.quick-action-grid', title: 'Start the Workflow', body: 'For the demo path, use Add Job Workspace first, then open Files or Task Bridge from that selected job context.' },
      { selector: '.activity-feed', title: 'Activity Feed', body: 'The feed shows business-level activity from Quest HQ. Detailed execution history remains inside TaskManagement once the bridge is fully connected.' }
    ],
    jobs: [
      { selector: '[data-job-new]', title: 'Create the Workspace', body: 'This button starts a new business workspace. It should feel like creating a client/project space, not creating a task.', action: 'closeJobModal' },
      { selector: '[data-job-modal]', title: 'Creation Opens in Place', body: 'The form opens as a modal so the presenter stays in the Job Center. Clicking Add does not create a card until Save Workspace is pressed.', action: 'openJobModal' },
      { selector: 'input[name=\"name\"]', title: 'Workspace Name', body: 'Name the space after the client, site, or project. Example: "Mesa Storage Roof Repair". This becomes the parent container for everything else.' },
      { selector: 'select[name=\"company_id\"]', title: 'Company Ownership', body: 'Each workspace belongs to a company from Admin. This prevents hard-coded companies and prepares the app for multi-company deployment.' },
      { selector: 'input[name=\"client_name\"]', title: 'Client and Contact Context', body: 'Client, contact, owner, and site fields describe the business relationship. These are not execution tasks; they identify who and what the workspace is for.' },
      { selector: 'select[name=\"stage\"]', title: 'Business Status', body: 'Status is business pipeline state: Lead, Site Review, Estimate, Approved, Active, or Closed. Task status belongs in TaskManagement.' },
      { selector: 'textarea[name=\"scope\"]', title: 'Scope and Notes', body: 'Scope gives the workspace enough context for files, forms, finance, and task handoff. Keep the actual checklist or assignments in TaskManagement.' },
      { selector: '.job-modal-panel .form-actions', title: 'Save Writes to Supabase', body: 'Save Workspace is the write action. After saving, the job appears on the board, gets an id, and that id becomes the integration key for files and TaskManagement.' },
      { selector: '.job-board', title: 'Pipeline Board', body: 'After Save, the card appears in the correct business stage. The board is for operational visibility, not daily task execution.', action: 'closeJobModal' },
      { selector: '[data-tab=\"list\"]', title: 'Searchable Job List', body: 'The list view is for scanning and filtering all saved workspaces. It uses the same Supabase job records as the board.' },
      { selector: '[data-panel=\"profile\"]', title: 'Job Profile', body: 'The profile is the central hub for a selected job. It shows client, site, scope, owner, stage, finance summary, file summary, and handoff context.', action: 'openProfileTab' },
      { selector: '[data-job-profile]', title: 'Connected Panels', body: 'From the profile, Files opens the file cabinet for this job, Finance/Forms stay as demo summaries, and TaskManagement receives the job id as project_id.' },
      { selector: '[data-job-sidecar]', title: 'Business Rollups', body: 'The side panel keeps lightweight rollups visible without turning Quest HQ into a second task manager.' }
    ],
    files: [
      { selector: '.drive-header', title: 'Google Drive-Style File Center', body: 'The File Center behaves like a job-aware drive: search, category filter, refresh, and New upload are always available.' },
      { selector: '.drive-sidebar', title: 'Drive Filters', body: 'My Drive shows job folders. Recent, Images, and Documents let the presenter explain how field photos, permits, contracts, and drawings will be found later.' },
      { selector: '[data-drive-folders]', title: 'Job Folders', body: 'Every saved job workspace becomes a folder. Files should be attached to a job, not dumped into an unstructured bucket.' },
      { selector: '[data-file-open-upload]', title: 'Upload Starts Here', body: 'New opens the upload modal. The upload should feel like adding files into the selected job space.', action: 'closeFileModal' },
      { selector: '[data-file-modal]', title: 'Upload Modal', body: 'The modal keeps upload in context. It does not navigate away from the file browser during the presentation.', action: 'openFileModal' },
      { selector: '[data-file-upload-form] input[type=\"file\"]', title: 'Choose Files', body: 'The presenter can select photos, PDFs, drawings, or other documents. Supabase Storage stores the object, and job_files stores metadata.' },
      { selector: '[data-file-upload-form] select[name=\"category\"]', title: 'Categorize Immediately', body: 'Category drives filtering and thumbnails. Photos render previews; documents render file-type cards.' },
      { selector: '[data-file-upload-form] textarea[name=\"notes\"]', title: 'Add Field Context', body: 'Notes capture inspection angle, permit revision, invoice context, or drawing details so files stay useful after upload.' },
      { selector: '.drive-details-pane', title: 'Preview and Metadata', body: 'Selecting a file shows preview, category, storage path, job link, uploader, and action buttons like download or delete.', action: 'closeFileModal' }
    ],
    forms: [
      { selector: '.forms-command', title: 'Forms Command Bar', body: 'This is a local-first Google Forms style builder for inspections, approvals, surveys, intakes, and checklists.' },
      { selector: '[data-form-new]', title: 'Create Without Saving Junk', body: 'New Form opens a modal draft. It does not create a saved record until Save Form is pressed.' },
      { selector: '[data-form-modal]', title: 'Builder Modal', body: 'The builder opens in place with settings, question list, and question editing so the presenter does not lose the Forms page context.', action: 'openFormModal' },
      { selector: '[data-form-settings]', title: 'Form Settings', body: 'Set title, description, type, status, audience, job context, email capture, and internal review requirements.' },
      { selector: '.question-panel', title: 'Question Builder', body: 'Add short answers, paragraphs, multiple choice, checkboxes, dropdowns, ratings, dates, signatures, and file requests.' },
      { selector: '[data-panel=\"preview\"]', title: 'Preview and Collect', body: 'Preview renders the form as a respondent will see it and can save local test responses for the demo.', action: 'openFormsPreview' },
      { selector: '[data-panel=\"responses\"]', title: 'Response Inbox', body: 'Saved responses appear here for review. Later this can become Supabase-backed with public URLs and auth.', action: 'openFormsResponses' },
      { selector: '[data-panel=\"templates\"]', title: 'Templates', body: 'Templates are quick-start builders, not fake saved data. Applying one creates an unsaved draft that can be edited before saving.', action: 'openFormsTemplates' }
    ],
    dashboards: [
      { selector: '.metric-grid', title: 'Analytics Lives Here', body: 'Instead of bloating every page with metric cards, deeper reporting is centralized here.' },
      { selector: '.analytics-layout', title: 'Live Job Reporting', body: 'This page summarizes jobs by status, urgency, scope, and module health. It is the place to discuss operations performance.' }
    ],
    admin: [
      { selector: '[data-company-admin]', title: 'Company Setup', body: 'Companies are managed here first. Job workspaces reference those company records instead of hard-coded demo companies.' },
      { selector: '[data-company-form]', title: 'Company Creation', body: 'Create or edit companies here, then use them in Job Center. This is the start of the future multi-company access model.' }
    ],
    'task-bridge': [
    { selector: '.task-context-panel', title: 'Why This Is Not Another Task Manager', body: 'Quest HQ keeps the job context. TaskManagement remains where assignments, checklists, and execution happen.' },
      { selector: '.bridge-contract', title: 'Integration Contract', body: 'The important handoff is stable: job.id becomes task.project_id, and return_url brings users back to the Quest HQ job profile.' },
    { selector: '.bridge-task-list', title: 'Execution Rows', body: 'Today this page renders job-scoped task rows from the selected job rollup. Once the database migration is ready, it will read live tasks where task.project_id matches the job id.' }
    ]
  };

  function collectSteps() {
    const all = commonSteps.concat(pageSteps[moduleId] || [
      { selector: '.main', title: 'Module Workspace', body: 'This area shows the current module. Planned modules stay visibly disabled until they receive real implementation.' }
    ]);
    return all.filter((step) => document.querySelector(step.selector));
  }

  function openTour(force) {
    steps = collectSteps();
    if (!steps.length) return;
    if (!force && localStorage.getItem(storageKey) === 'done') return;
    index = 0;
    overlay.hidden = false;
    document.body.classList.add('tour-open');
    renderProgressTrack();
    renderStep();
  }

  function closeTour(saveState) {
    overlay.hidden = true;
    document.body.classList.remove('tour-open');
    if (saveState) localStorage.setItem(storageKey, 'done');
  }

  function renderStep() {
    const step = steps[index];
    if (!step) return closeTour(true);
    prepareStep(step);
    const element = document.querySelector(step.selector);
    if (!element) {
      index = Math.min(index + 1, steps.length);
      return renderStep();
    }
    element.scrollIntoView({ block: 'center', inline: 'nearest' });
    requestAnimationFrame(() => {
      placeSpotlight(element);
      placeCard(element);
    });
    nodes.count.textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
    updateProgressTrack();
    nodes.title.textContent = step.title;
    nodes.body.textContent = step.body;
    nodes.back.disabled = index === 0;
    nodes.next.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
  }

  function renderProgressTrack() {
    if (!nodes.progress) return;
    nodes.progress.style.setProperty('--tour-steps', steps.length);
    nodes.progress.innerHTML = steps.map((_, stepIndex) => '<span data-tour-progress-step=\"' + stepIndex + '\"></span>').join('');
  }

  function updateProgressTrack() {
    if (!nodes.progress) return;
    nodes.progress.querySelectorAll('[data-tour-progress-step]').forEach((item, stepIndex) => {
      item.classList.toggle('done', stepIndex < index);
      item.classList.toggle('active', stepIndex === index);
    });
  }

  function prepareStep(step) {
    if (step.action === 'openJobModal' && document.querySelector('[data-job-modal]')?.hidden) {
      document.querySelector('[data-job-new]')?.click();
    }
    if (step.action === 'closeJobModal' && !document.querySelector('[data-job-modal]')?.hidden) {
      document.querySelector('[data-job-modal-close]')?.click();
    }
    if (step.action === 'openProfileTab') {
      document.querySelector('[data-tab=\"profile\"]')?.click();
    }
    if (step.action === 'openFileModal' && document.querySelector('[data-file-modal]')?.hidden) {
      document.querySelector('[data-file-open-upload]')?.click();
    }
    if (step.action === 'closeFileModal' && !document.querySelector('[data-file-modal]')?.hidden) {
      document.querySelector('[data-file-modal-close]')?.click();
    }
    if (step.action === 'openFormModal' && document.querySelector('[data-form-modal]')?.hidden) document.querySelector('[data-form-new]')?.click();
    if (step.action === 'openFormsPreview') document.querySelector('[data-tab=\"preview\"]')?.click();
    if (step.action === 'openFormsResponses') document.querySelector('[data-tab=\"responses\"]')?.click();
    if (step.action === 'openFormsTemplates') {
      if (!document.querySelector('[data-form-modal]')?.hidden) document.querySelector('[data-form-modal-close]')?.click();
      document.querySelector('[data-tab=\"templates\"]')?.click();
    }
  }

  function placeSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const pad = 8;
    Object.assign(nodes.spotlight.style, {
      left: Math.max(10, rect.left - pad) + 'px',
      top: Math.max(10, rect.top - pad) + 'px',
      width: Math.min(window.innerWidth - 20, rect.width + pad * 2) + 'px',
      height: Math.min(window.innerHeight - 20, rect.height + pad * 2) + 'px'
    });
  }

  function placeCard(element) {
    if (window.innerWidth <= 820) return;
    const rect = element.getBoundingClientRect();
    const cardWidth = nodes.card.offsetWidth || 420;
    const cardHeight = nodes.card.offsetHeight || 260;
    let left = rect.right + 18;
    let top = rect.top;
    if (left + cardWidth > window.innerWidth - 16) left = rect.left - cardWidth - 18;
    if (left < 16) left = window.innerWidth - cardWidth - 16;
    if (top + cardHeight > window.innerHeight - 16) top = window.innerHeight - cardHeight - 16;
    if (top < 16) top = 16;
    nodes.card.style.left = left + 'px';
    nodes.card.style.top = top + 'px';
  }

  nodes.next.addEventListener('click', () => {
    if (index >= steps.length - 1) return closeTour(true);
    index += 1;
    renderStep();
  });
  nodes.back.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    renderStep();
  });
  nodes.skip.addEventListener('click', () => closeTour(true));
  document.querySelectorAll('[data-tour-start]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem(storageKey);
      openTour(true);
    });
  });
  window.addEventListener('resize', () => {
    if (!overlay.hidden) renderStep();
  });
  window.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') closeTour(true);
    if (event.key === 'ArrowRight') nodes.next.click();
    if (event.key === 'ArrowLeft' && !nodes.back.disabled) nodes.back.click();
  });

  if (new URLSearchParams(window.location.search).get('tour') === '1') {
    setTimeout(() => openTour(true), 650);
  }
})();`;

async function writeTarget(target) {
  const absolute = path.resolve(target);
  if (target !== '.') await rm(absolute, { recursive: true, force: true });
  await mkdir(path.join(absolute, 'assets'), { recursive: true });
  await copyTaskManagementRuntime(target, absolute);
  await writeFile(path.join(absolute, 'assets', 'quest-hq.css'), css + sidebarPolishCss + modalCss + plannedNavCss + fileViewerCss + fileCenterCss + driveFileCss + jobCenterCss + coreDemoCss + identityIntegrationCss + companyAdminCss + analyticsCss + formsCenterCss + googleFormsCss + formShareCss + formsLayoutRedoCss + formsLibraryModalCss + plannedTabsCss + tutorialCss + questAuthCss);
  await writeFile(path.join(absolute, 'assets', 'quest-hq.js'), js + jobCenterJs + fileCenterJs + companyAdminJs + analyticsJs + commandCenterJs + taskBridgeJs + formsCenterJs + tutorialJs);
  await writeFile(path.join(absolute, 'login.html'), loginPage());
  await writeFile(path.join(absolute, 'index.html'), commandPage());
  await writeFile(path.join(absolute, 'jobs.html'), jobsPage());
  await writeFile(path.join(absolute, 'task-management.html'), taskManagementPage());
  await writeFile(path.join(absolute, 'files.html'), filesPage());
  await writeFile(path.join(absolute, 'forms.html'), formsPage());
  for (const module of Object.values(modules)) {
    if (['files.html', 'forms.html'].includes(module.file)) continue;
    await writeFile(path.join(absolute, module.file), modulePage(module));
  }
  if (target === 'docs') await writeFile(path.join(absolute, '.nojekyll'), '');
}

async function copyTaskManagementRuntime(target, absolute) {
  const source = path.resolve('taskmanagement');
  if (target === '.') return;

  const destination = path.join(absolute, 'taskmanagement');
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, {
    recursive: true,
    filter: (sourcePath) => !/[/\\]env\.json$/i.test(sourcePath)
  });

  const env = taskManagementRuntimeEnv();
  if (env) {
    await writeFile(path.join(destination, 'env.json'), JSON.stringify(env, null, 2) + '\n');
  }
}

function taskManagementRuntimeEnv() {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return {
    supabaseUrl,
    supabaseAnonKey,
    sentryDsn: (process.env.VITE_SENTRY_DSN || '').trim(),
    release: (process.env.VERCEL_GIT_COMMIT_SHA || buildId).trim(),
    turnstileSiteKey: (process.env.VITE_TURNSTILE_SITE_KEY || '').trim()
  };
}

for (const target of targets) {
  await writeTarget(target);
}
