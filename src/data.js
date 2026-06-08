export const companies = [
  { id: 'roofing', name: 'Quest Roofing', short: 'Roofing', color: '#ED4E0D' },
  { id: 'drafting', name: 'Quest Drafting', short: 'Drafting', color: '#2563EB' },
  { id: 'lumen', name: 'Lumen Marketing', short: 'Lumen', color: '#0F766E' }
];

export const clients = [
  {
    id: 'client-arroyo',
    name: 'Arroyo Vista HOA',
    company: 'roofing',
    contact: 'Maya Rosales',
    email: 'maya@arroyovista.example',
    phone: '(480) 555-0142',
    address: '1840 E Arroyo Vista Dr, Queen Creek, AZ'
  },
  {
    id: 'client-mesa',
    name: 'Mesa Storage Partners',
    company: 'roofing',
    contact: 'Gabe Liu',
    email: 'gabe@mesastorage.example',
    phone: '(602) 555-0188',
    address: '2190 S Signal Butte Rd, Mesa, AZ'
  },
  {
    id: 'client-casa',
    name: 'Casa Azul Remodel',
    company: 'drafting',
    contact: 'Elena Torres',
    email: 'elena@casaazul.example',
    phone: '(480) 555-0199',
    address: '88 W Main St, Gilbert, AZ'
  },
  {
    id: 'client-horizon',
    name: 'Horizon HVAC',
    company: 'lumen',
    contact: 'Nathan Reed',
    email: 'nathan@horizon.example',
    phone: '(602) 555-0163',
    address: 'Remote'
  }
];

export const people = [
  { id: 'abraham', name: 'Abraham', role: 'Owner', company: 'roofing' },
  { id: 'alkeith', name: 'Alkeith', role: 'Co-owner', company: 'roofing' },
  { id: 'kristine', name: 'Kristine', role: 'Admin', company: 'roofing' },
  { id: 'jesus', name: 'Jesus', role: 'Foreman', company: 'roofing' },
  { id: 'andres', name: 'Andres', role: 'Drafting QA', company: 'drafting' },
  { id: 'adrian', name: 'Adrian', role: 'Lumen Lead', company: 'lumen' }
];

export const initialJobs = [
  {
    id: 'job-arroyo-hoa',
    name: 'Arroyo Vista HOA roof inspection',
    company: 'roofing',
    clientId: 'client-arroyo',
    contact: 'Maya Rosales',
    siteAddress: '1840 E Arroyo Vista Dr, Queen Creek, AZ',
    type: 'Roof inspection',
    stage: 'Inspection scheduled',
    priority: 'urgent',
    owner: 'jesus',
    scope: 'Inspect tile roof damage after monsoon wind event. Capture photos, mark repair zones, and prepare estimate.',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    estimateTotal: 8400,
    invoiceTotal: 0,
    fileCount: 12,
    formCount: 1,
    notes: 'Client requested a morning site visit. HOA gate code is in the private client note.'
  },
  {
    id: 'job-mesa-storage',
    name: 'Mesa Storage coating repair',
    company: 'roofing',
    clientId: 'client-mesa',
    contact: 'Gabe Liu',
    siteAddress: '2190 S Signal Butte Rd, Mesa, AZ',
    type: 'Commercial repair',
    stage: 'Estimate approved',
    priority: 'high',
    owner: 'alkeith',
    scope: 'Patch foam roof penetrations, reseal parapet transitions, and apply coating to the affected bay.',
    startDate: '2026-06-14',
    endDate: '2026-06-18',
    estimateTotal: 23600,
    invoiceTotal: 11800,
    fileCount: 27,
    formCount: 2,
    notes: 'Materials need to be ordered before crew assignment is final.'
  },
  {
    id: 'job-casa-drafting',
    name: 'Casa Azul permit drawings',
    company: 'drafting',
    clientId: 'client-casa',
    contact: 'Elena Torres',
    siteAddress: '88 W Main St, Gilbert, AZ',
    type: 'Drafting',
    stage: 'QA review',
    priority: 'medium',
    owner: 'andres',
    scope: 'Finalize roof framing sheets and response notes for permit correction cycle.',
    startDate: '2026-06-03',
    endDate: '2026-06-11',
    estimateTotal: 3200,
    invoiceTotal: 1600,
    fileCount: 9,
    formCount: 1,
    notes: 'Waiting on one dimension confirmation from homeowner.'
  },
  {
    id: 'job-horizon-lumen',
    name: 'Horizon HVAC lead engine',
    company: 'lumen',
    clientId: 'client-horizon',
    contact: 'Nathan Reed',
    siteAddress: 'Remote',
    type: 'Marketing campaign',
    stage: 'Production',
    priority: 'medium',
    owner: 'adrian',
    scope: 'Build service pages, call tracking, and reporting dashboard for HVAC summer campaign.',
    startDate: '2026-06-06',
    endDate: '2026-06-21',
    estimateTotal: 6200,
    invoiceTotal: 3100,
    fileCount: 18,
    formCount: 0,
    notes: 'Client wants first reporting snapshot by Friday.'
  }
];

export const taskRollups = [
  { id: 't-arroyo-1', projectId: 'job-arroyo-hoa', title: 'Confirm inspection access', assignee: 'kristine', status: 'done', due: '2026-06-09', priority: 'high' },
  { id: 't-arroyo-2', projectId: 'job-arroyo-hoa', title: 'Roof photo packet', assignee: 'jesus', status: 'todo', due: '2026-06-10', priority: 'urgent' },
  { id: 't-arroyo-3', projectId: 'job-arroyo-hoa', title: 'Prepare repair estimate', assignee: 'abraham', status: 'todo', due: '2026-06-12', priority: 'high' },
  { id: 't-mesa-1', projectId: 'job-mesa-storage', title: 'Order coating materials', assignee: 'kristine', status: 'todo', due: '2026-06-11', priority: 'high' },
  { id: 't-mesa-2', projectId: 'job-mesa-storage', title: 'Schedule crew', assignee: 'alkeith', status: 'review', due: '2026-06-13', priority: 'high' },
  { id: 't-mesa-3', projectId: 'job-mesa-storage', title: 'Invoice deposit', assignee: 'abraham', status: 'done', due: '2026-06-08', priority: 'medium' },
  { id: 't-casa-1', projectId: 'job-casa-drafting', title: 'QA roof framing sheets', assignee: 'andres', status: 'review', due: '2026-06-09', priority: 'medium' },
  { id: 't-casa-2', projectId: 'job-casa-drafting', title: 'Send correction response', assignee: 'abraham', status: 'todo', due: '2026-06-11', priority: 'medium' },
  { id: 't-horizon-1', projectId: 'job-horizon-lumen', title: 'Publish AC repair page', assignee: 'adrian', status: 'todo', due: '2026-06-10', priority: 'medium' },
  { id: 't-horizon-2', projectId: 'job-horizon-lumen', title: 'Connect call tracking', assignee: 'adrian', status: 'hold', due: '2026-06-13', priority: 'high' }
];

export const timeEntries = [
  { id: 'time-1', taskId: 't-arroyo-2', projectId: 'job-arroyo-hoa', member: 'jesus', hours: 1.5, date: '2026-06-08' },
  { id: 'time-2', taskId: 't-mesa-2', projectId: 'job-mesa-storage', member: 'alkeith', hours: 2.25, date: '2026-06-08' },
  { id: 'time-3', taskId: 't-casa-1', projectId: 'job-casa-drafting', member: 'andres', hours: 3.0, date: '2026-06-08' },
  { id: 'time-4', taskId: 't-horizon-1', projectId: 'job-horizon-lumen', member: 'adrian', hours: 2.75, date: '2026-06-08' }
];

export const activity = [
  { id: 'a1', jobId: 'job-mesa-storage', type: 'estimate', text: 'Estimate approved by Mesa Storage Partners.', time: 'Today, 8:40 AM' },
  { id: 'a2', jobId: 'job-arroyo-hoa', type: 'form', text: 'Inspection request form attached to Arroyo Vista HOA job.', time: 'Yesterday, 4:12 PM' },
  { id: 'a3', jobId: 'job-casa-drafting', type: 'task', text: 'QA task moved to review in TaskManagement.', time: 'Yesterday, 2:30 PM' },
  { id: 'a4', jobId: 'job-horizon-lumen', type: 'file', text: 'Campaign kickoff notes uploaded.', time: 'Jun 7, 11:09 AM' }
];

export const moduleRoadmap = [
  { id: 'command', label: 'Command Center', status: 'active', detail: 'Home, alerts, quick actions, activity' },
  { id: 'jobs', label: 'Jobs', status: 'active', detail: 'Profiles, stages, owners, related work' },
  { id: 'task-management', label: 'TaskManagement', status: 'connected', detail: 'Execution module via project_id' },
  { id: 'crm', label: 'CRM', status: 'ready', detail: 'Leads, clients, contacts' },
  { id: 'forms', label: 'Forms & Surveys', status: 'ready', detail: 'Builder and responses' },
  { id: 'tickets', label: 'Tickets', status: 'ready', detail: 'Requests and conversions' },
  { id: 'files', label: 'Files', status: 'ready', detail: 'Job and client documents' },
  { id: 'finance', label: 'Finance', status: 'ready', detail: 'Estimates, invoices, AR' },
  { id: 'kb', label: 'Knowledge Base', status: 'ready', detail: 'SOPs and templates' },
  { id: 'automations', label: 'Automations', status: 'ready', detail: 'Triggers, conditions, actions' },
  { id: 'dashboards', label: 'Dashboards', status: 'ready', detail: 'Pipeline, time, finance, workload' },
  { id: 'templates', label: 'Templates', status: 'ready', detail: 'Reusable job, form, finance, SOP, and automation patterns' },
  { id: 'admin', label: 'Admin', status: 'ready', detail: 'Users, companies, settings' }
];
