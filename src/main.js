import './styles.css';

const CONFIG = {
  buildId: 'Quest HQ Company Workspace v1',
  questAuthEnabled: import.meta.env.VITE_QUEST_AUTH_ENABLED !== 'false',
  localLoginEnabled: import.meta.env.VITE_LOCAL_LOGIN_ENABLED === 'true',
  localUsername: import.meta.env.VITE_LOCAL_LOGIN_USERNAME || 'lumen123',
  localPassword: import.meta.env.VITE_LOCAL_LOGIN_PASSWORD || 'lumen123',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://lpzotcznihwyyudxycmd.supabase.co',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07',
  stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
};

const BASE_PATH = new URL(import.meta.env.BASE_URL || '/', window.location.origin).pathname.replace(/\/$/, '');
const SESSION_KEY = 'quest-hq-local-session';
const PROFILE_KEY = 'quest-hq-local-profile';
const JOB_CACHE_KEY = 'quest-hq-job-cache-v2';
const TASK_CACHE_KEY = 'quest-hq-task-cache-v1';
const FILE_CACHE_KEY = 'quest-hq-file-cache-v1';
const DRIVE_FOLDER_CACHE_KEY = 'quest-hq-drive-folder-cache-v1';
const TEAM_CACHE_KEY = 'quest-hq-team-cache-v1';
const MEMBERSHIP_CACHE_KEY = 'quest-hq-company-membership-cache-v1';
const FORM_CACHE_KEY = 'quest-hq-company-form-cache-v1';
const FORM_RESPONSE_CACHE_KEY = 'quest-hq-company-form-response-cache-v1';
const FINANCE_INVOICE_CACHE_KEY = 'quest-hq-finance-invoice-cache-v1';
const FINANCE_PAYMENT_CACHE_KEY = 'quest-hq-finance-payment-cache-v1';
const FINANCE_EXPENSE_CACHE_KEY = 'quest-hq-finance-expense-cache-v1';
const FINANCE_VENDOR_CACHE_KEY = 'quest-hq-finance-vendor-cache-v1';
const TIME_ENTRY_CACHE_KEY = 'quest-hq-time-entry-cache-v1';
const ACTIVE_TIMER_KEY = 'quest-hq-active-timer-v1';
const COMPANY_KEY = 'quest-hq-active-company';
const TASK_VIEW_KEY = 'quest-hq-task-view';
const DRIVE_VIEW_KEY = 'quest-hq-drive-view';
const NOTIFICATION_CACHE_KEY = 'quest-hq-notification-cache-v1';
const MESSAGE_CONVERSATION_CACHE_KEY = 'quest-hq-message-conversation-cache-v1';
const MESSAGE_ACCESS_CACHE_KEY = 'quest-hq-message-access-cache-v1';
const MESSAGE_CACHE_KEY = 'quest-hq-message-cache-v1';
const MESSAGE_READ_CACHE_KEY = 'quest-hq-message-read-cache-v1';
const MESSAGE_ATTACHMENT_CACHE_KEY = 'quest-hq-message-attachment-cache-v1';

const ROLE_PERMISSIONS = {
  developer: ['*'],
  admin: ['*'],
  owner: ['*'],
  manager: ['jobs.view', 'jobs.manage', 'tasks.view', 'tasks.manage', 'files.view', 'files.manage', 'forms.view', 'forms.manage', 'finance.view', 'team.view', 'clock.manage', 'approvals.manage', 'approvals.view', 'users.view', 'settings.view', 'billing.view', 'roles.view', 'messages.view', 'messages.send', 'messages.create_group', 'messages.manage_groups', 'messages.attach_files'],
  member: ['jobs.view', 'tasks.view', 'tasks.manage', 'files.view', 'forms.view', 'time.track', 'approvals.view', 'users.view', 'messages.view', 'messages.send', 'messages.attach_files'],
};

const PERMISSION_KEYS = [
  ['jobs.view', 'View jobs'],
  ['jobs.manage', 'Create/edit jobs'],
  ['tasks.view', 'View tasks'],
  ['tasks.manage', 'Create/edit tasks'],
  ['files.view', 'View files'],
  ['files.manage', 'Upload/delete files'],
  ['forms.view', 'View forms'],
  ['forms.manage', 'Create/edit forms'],
  ['crm.view', 'View CRM'],
  ['finance.view', 'View finance'],
  ['finance.manage', 'Create/edit finance'],
  ['users.view', 'View users'],
  ['users.manage', 'Invite/manage users'],
  ['roles.view', 'View roles'],
  ['roles.manage', 'Create/edit roles'],
  ['billing.view', 'View billing'],
  ['billing.manage', 'Manage subscription'],
  ['settings.view', 'View settings'],
  ['settings.manage', 'Manage settings'],
  ['time.track', 'Track own time'],
  ['clock.manage', 'Manage clock dashboard'],
  ['approvals.view', 'View approvals'],
  ['approvals.manage', 'Manage approvals'],
  ['messages.view', 'View messages'],
  ['messages.send', 'Send messages'],
  ['messages.create_group', 'Create group chats'],
  ['messages.manage_groups', 'Manage group chats'],
  ['messages.attach_files', 'Attach files/images'],
  ['messages.delete_own', 'Delete own messages'],
  ['messages.delete_any', 'Delete any messages'],
  ['messages.manage', 'Manage messages (compatibility)'],
];

const PERMISSION_ALIASES = {
  'messages.manage': ['messages.manage_groups'],
  'messages.manage_groups': ['messages.manage'],
};

const MODULE_REGISTRY = [
  { id: 'jobs', group: 'Workspace', label: 'Jobs', icon: 'ti-briefcase', symbol: 'q-symbol-jobs', status: 'live', permission: 'jobs.view' },
  { id: 'tasks', group: 'Workspace', label: 'Tasks', icon: 'ti-list-check', symbol: 'q-symbol-tasks', status: 'live', permission: 'tasks.view' },
  { id: 'files', group: 'Workspace', label: 'Files', icon: 'ti-folder', symbol: 'q-symbol-files', status: 'live', permission: 'files.view' },
  { id: 'forms', group: 'Workspace', label: 'Forms', icon: 'ti-clipboard-list', symbol: 'q-symbol-forms', status: 'live', permission: 'forms.view' },
  { id: 'analytics', group: 'Workspace', label: 'Analytics', icon: 'ti-chart-bar', symbol: 'q-symbol-analytics', status: 'live', permission: 'jobs.view' },
  { id: 'crm', group: 'Workspace', label: 'CRM', icon: 'ti-users-group', symbol: 'q-symbol-crm', status: 'live', permission: 'crm.view' },
  { id: 'tickets', group: 'Workspace', label: 'Tickets', icon: 'ti-ticket', symbol: 'q-symbol-tickets', status: 'planned' },
  { id: 'finance', group: 'Workspace', label: 'Finance', icon: 'ti-receipt-dollar', symbol: 'q-symbol-finance', status: 'live', permission: 'finance.view' },
  { id: 'knowledge', group: 'Workspace', label: 'Knowledge Base', icon: 'ti-books', symbol: 'q-symbol-knowledge', status: 'planned' },
  { id: 'automations', group: 'Workspace', label: 'Automations', icon: 'ti-automation', symbol: 'q-symbol-automations', status: 'planned' },
  { id: 'templates', group: 'Workspace', label: 'Templates', icon: 'ti-template', symbol: 'q-symbol-templates', status: 'planned' },
  { id: 'users', group: 'Company', label: 'Users', icon: 'ti-users', symbol: 'q-symbol-users', status: 'live', permission: 'users.view' },
  { id: 'messages', group: 'Company', label: 'Messages', icon: 'ti-messages', symbol: 'q-symbol-messages', status: 'live', permission: 'messages.view' },
  { id: 'settings', group: 'Company', label: 'Settings', icon: 'ti-settings', symbol: 'q-symbol-settings', status: 'live', permission: 'settings.view' },
  { id: 'team-chart', group: 'Company', label: 'Team chart', icon: 'ti-hierarchy-3', symbol: 'q-symbol-team-chart', status: 'live', permission: 'team.view' },
  { id: 'time', group: 'Operations', label: 'My time', icon: 'ti-clock', symbol: 'q-symbol-time', status: 'live', permission: 'time.track' },
  { id: 'approvals', group: 'Operations', label: 'Approvals', icon: 'ti-user-check', symbol: 'q-symbol-approvals', status: 'live', permission: 'approvals.view' },
  { id: 'team-workload', group: 'Operations', label: 'Team workload', icon: 'ti-users', symbol: 'q-symbol-team-workload', status: 'planned' },
  { id: 'clock', group: 'Operations', label: 'Clock dashboard', icon: 'ti-clock-hour-4', symbol: 'q-symbol-clock', status: 'live', permission: 'clock.manage' },
];

const LEGACY_ROUTE_SECTIONS = {
  '/admin.html': 'settings',
  '/automations.html': 'automations',
  '/crm.html': 'crm',
  '/dashboards.html': 'analytics',
  '/files.html': 'files',
  '/finance.html': 'finance',
  '/forms.html': 'forms',
  '/jobs.html': 'jobs',
  '/knowledge.html': 'knowledge',
  '/messages.html': 'messages',
  '/templates.html': 'templates',
  '/tickets.html': 'tickets',
};

const STAGES = ['Lead', 'Site Review', 'Estimate', 'Approved', 'Active', 'Closed'];
const JOB_TABS = ['pipeline', 'list', 'profile'];
const TASK_STATUSES = ['todo', 'pending', 'hold', 'review', 'done'];
const TASK_PRIORITIES = ['critical', 'urgent', 'high', 'medium', 'low'];
const TASK_TYPES = ['lead', 'bid', 'admin', 'invoicing', 'ar', 'meeting', 'web_dev'];
const FILE_CATEGORIES = ['All categories', 'Shared', 'Jobs', 'Forms', 'Photos', 'Permits', 'Contracts', 'Archive'];
const DRIVE_FOLDERS = [
  ['jobs', 'Jobs', 'Job-linked folders and deliverables', 'ti-folders'],
  ['shared', 'Shared', 'Company-wide files', 'ti-folder-share'],
  ['forms', 'Forms', 'Completed forms and templates', 'ti-clipboard-list'],
  ['photos', 'Photos', 'Site photos and field media', 'ti-photo'],
  ['permits', 'Permits', 'Permit packets and approvals', 'ti-file-certificate'],
  ['contracts', 'Contracts', 'Signed agreements and estimates', 'ti-file-dollar'],
  ['archive', 'Archive', 'Closed or historical files', 'ti-archive'],
];
const FORM_TYPES = ['Inspection', 'Client approval', 'Intake', 'Survey', 'Safety', 'Internal'];
const FORM_STATUSES = ['Draft', 'Published', 'Archived'];
const INVOICE_STATUSES = ['Draft', 'Sent', 'Partially paid', 'Paid', 'Overdue', 'Void'];
const EXPENSE_STATUSES = ['Pending', 'Approved', 'Paid', 'Rejected'];
const VENDOR_STATUSES = ['Active', 'On hold', 'Inactive'];
const PAYMENT_METHODS = ['ACH', 'Check', 'Card', 'Cash', 'Wire', 'Other'];
const EXPENSE_CATEGORIES = ['Materials', 'Labor', 'Subcontractor', 'Permit', 'Equipment', 'Marketing', 'Software', 'Travel', 'Other'];
const MESSAGE_TYPES = ['company', 'role', 'custom', 'direct'];
const QUESTION_TYPES = [
  ['short', 'Short answer'],
  ['paragraph', 'Paragraph'],
  ['multiple', 'Multiple choice'],
  ['checkbox', 'Checkboxes'],
  ['dropdown', 'Dropdown'],
  ['date', 'Date'],
  ['rating', 'Rating'],
  ['yesno', 'Yes / No'],
  ['file', 'File upload'],
];

const companiesFallback = [
  { id: 'roofing', name: 'Quest Roofing', short_name: 'Roofing', color: '#f0b23b' },
  { id: 'drafting', name: 'Quest Drafting', short_name: 'Drafting', color: '#60a5fa' },
  { id: 'lumen', name: 'Lumen Marketing', short_name: 'Lumen', color: '#a78bfa' },
];

const jobsFallback = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    company_id: 'roofing',
    name: 'Queen Creek Leak Follow-up',
    client_name: 'Rosales Residence',
    contact_name: 'Maya Rosales',
    site_address: 'Queen Creek, AZ',
    job_type: 'Roofing repair',
    stage: 'Active',
    priority: 'Urgent',
    owner_name: 'Andre Lee',
    scope: 'Emergency leak inspection, dry-in, and repair proposal.',
    notes: 'Client reported active leak after monsoon storm.',
    estimate_total: 6800,
    invoice_total: 0,
    task_count: 4,
    file_count: 5,
    updated_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    company_id: 'roofing',
    name: 'Mesa Storage Roof Repair',
    client_name: 'Mesa Storage Partners',
    contact_name: 'D. Harris',
    site_address: 'Mesa, AZ',
    job_type: 'Commercial repair',
    stage: 'Estimate',
    priority: 'High',
    owner_name: 'Maya Rosales',
    scope: 'Inspect roof membrane, prepare repair estimate, and attach permit packet.',
    notes: 'Board wants estimate and permit notes before approval.',
    estimate_total: 18400,
    invoice_total: 0,
    task_count: 3,
    file_count: 4,
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    company_id: 'drafting',
    name: 'Drafting Permit Package',
    client_name: 'Horizon HVAC',
    contact_name: 'Noah Park',
    site_address: 'Chandler, AZ',
    job_type: 'Drafting',
    stage: 'Site Review',
    priority: 'Medium',
    owner_name: 'Noah Park',
    scope: 'Prepare drawing package and client approval form.',
    notes: 'Waiting on latest measurements.',
    estimate_total: 4200,
    invoice_total: 0,
    task_count: 2,
    file_count: 3,
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const teamMembersFallback = [
  { id: 'abraham', name: 'Abraham', full_name: 'Abraham Flores', email: 'abraham@quest-hq.local', color: '#f0b23b', active: true, company_ids: ['roofing', 'drafting'], supervisor_id: '' },
  { id: 'maya', name: 'Maya', full_name: 'Maya Rosales', email: 'maya@quest-hq.local', color: '#60a5fa', active: true, company_ids: ['roofing'], supervisor_id: 'abraham' },
  { id: 'andre', name: 'Andre', full_name: 'Andre Lee', email: 'andre@quest-hq.local', color: '#f97316', active: true, company_ids: ['roofing'], supervisor_id: 'maya' },
  { id: 'noah', name: 'Noah', full_name: 'Noah Park', email: 'noah@quest-hq.local', color: '#a78bfa', active: true, company_ids: ['drafting'], supervisor_id: 'abraham' },
  { id: 'lumen-ops', name: 'Lumen Ops', full_name: 'Lumen Operations', email: 'ops@lumen.local', color: '#7c3aed', active: true, company_ids: ['lumen'], supervisor_id: '' },
];

const membershipsFallback = [
  { company_id: 'roofing', profile_id: 'basic-quest-user', role: 'developer', status: 'active' },
  { company_id: 'drafting', profile_id: 'basic-quest-user', role: 'developer', status: 'active' },
  { company_id: 'lumen', profile_id: 'basic-quest-user', role: 'developer', status: 'active' },
];

const tasksFallback = [
  {
    id: 'task-roofing-leak-1',
    title: 'Call client and confirm active leak area',
    description: 'Confirm access window, roof area, and whether temporary dry-in is still holding.',
    type: 'lead',
    company_id: 'roofing',
    project_id: '11111111-1111-4111-8111-111111111111',
    creator_id: 'abraham',
    assignee_id: 'maya',
    due: isoDate(0),
    priority: 'urgent',
    urgency: 'urgent',
    status: 'todo',
  },
  {
    id: 'task-roofing-leak-2',
    title: 'Upload inspection photos',
    description: 'Attach site photos to the company drive and tag the Queen Creek job folder.',
    type: 'admin',
    company_id: 'roofing',
    project_id: '11111111-1111-4111-8111-111111111111',
    creator_id: 'maya',
    assignee_id: 'andre',
    due: isoDate(1),
    priority: 'high',
    urgency: 'high',
    status: 'pending',
  },
  {
    id: 'task-roofing-mesa-1',
    title: 'Prepare repair estimate packet',
    description: 'Draft scope, estimate total, and permit notes for board review.',
    type: 'bid',
    company_id: 'roofing',
    project_id: '22222222-2222-4222-8222-222222222222',
    creator_id: 'abraham',
    assignee_id: 'maya',
    due: isoDate(3),
    priority: 'high',
    urgency: 'high',
    status: 'review',
  },
  {
    id: 'task-drafting-package-1',
    title: 'Request final measurements',
    description: 'Get latest field measurements before starting permit drawings.',
    type: 'admin',
    company_id: 'drafting',
    project_id: '33333333-3333-4333-8333-333333333333',
    creator_id: 'abraham',
    assignee_id: 'noah',
    due: isoDate(2),
    priority: 'medium',
    urgency: 'medium',
    status: 'hold',
  },
  {
    id: 'task-lumen-ops-1',
    title: 'Create client onboarding checklist',
    description: 'Internal Lumen setup task to prove company workspace isolation.',
    type: 'meeting',
    company_id: 'lumen',
    project_id: '',
    creator_id: 'abraham',
    assignee_id: 'lumen-ops',
    due: isoDate(5),
    priority: 'medium',
    urgency: 'medium',
    status: 'todo',
  },
];

const filesFallback = [
  {
    id: 'file-roofing-1',
    company_id: 'roofing',
    job_id: '11111111-1111-4111-8111-111111111111',
    folder: 'photos',
    file_name: 'queen-creek-leak-photos.zip',
    mime_type: 'application/zip',
    size_bytes: 18400000,
    category: 'Photos',
    uploaded_by_label: 'Maya Rosales',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'file-roofing-2',
    company_id: 'roofing',
    job_id: '22222222-2222-4222-8222-222222222222',
    folder: 'permits',
    file_name: 'mesa-storage-permit-notes.pdf',
    mime_type: 'application/pdf',
    size_bytes: 860000,
    category: 'Permits',
    uploaded_by_label: 'Andre Lee',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'file-drafting-1',
    company_id: 'drafting',
    job_id: '33333333-3333-4333-8333-333333333333',
    folder: 'contracts',
    file_name: 'horizon-hvac-drawing-agreement.pdf',
    mime_type: 'application/pdf',
    size_bytes: 420000,
    category: 'Contracts',
    uploaded_by_label: 'Noah Park',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'file-lumen-1',
    company_id: 'lumen',
    job_id: '',
    folder: 'shared',
    file_name: 'lumen-shared-brand-assets.zip',
    mime_type: 'application/zip',
    size_bytes: 3200000,
    category: 'Shared',
    uploaded_by_label: 'Lumen Operations',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const formsFallback = [
  {
    id: 'form-roofing-inspection',
    company_id: 'roofing',
    title: 'Roof Inspection Checklist',
    description: 'Field checklist for leak calls, roof condition notes, photos, and repair recommendations.',
    type: 'Inspection',
    status: 'Published',
    audience: 'Field team',
    creator_id: 'abraham',
    linked_job_id: '11111111-1111-4111-8111-111111111111',
    theme_color: '#f0b23b',
    background: 'paper',
    submit_label: 'Submit inspection',
    collect_email: true,
    require_approval: false,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      { id: 'q-roof-1', type: 'short', label: 'Inspection address', help: 'Confirm the address before submitting.', required: true },
      { id: 'q-roof-2', type: 'multiple', label: 'Primary roof condition', help: '', required: true, options: ['Active leak', 'Storm damage', 'Aged underlayment', 'Maintenance issue'] },
      { id: 'q-roof-3', type: 'paragraph', label: 'Recommended scope', help: 'Write the repair or estimate recommendation.', required: true },
      { id: 'q-roof-4', type: 'file', label: 'Attach inspection photos', help: 'Upload photos into the company drive after submit.', required: false },
    ],
  },
  {
    id: 'form-roofing-estimate-approval',
    company_id: 'roofing',
    title: 'Estimate Approval',
    description: 'Client-facing approval form for estimate review and signature follow-up.',
    type: 'Client approval',
    status: 'Draft',
    audience: 'Client',
    creator_id: 'maya',
    linked_job_id: '22222222-2222-4222-8222-222222222222',
    theme_color: '#f45d22',
    background: 'clean',
    submit_label: 'Approve estimate',
    collect_email: true,
    require_approval: true,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    questions: [
      { id: 'q-est-1', type: 'short', label: 'Client name', required: true },
      { id: 'q-est-2', type: 'yesno', label: 'Do you approve the attached estimate?', required: true },
      { id: 'q-est-3', type: 'paragraph', label: 'Questions or requested changes', required: false },
    ],
  },
  {
    id: 'form-drafting-intake',
    company_id: 'drafting',
    title: 'Drafting Permit Intake',
    description: 'Collect measurements, equipment details, and permit packet requirements.',
    type: 'Intake',
    status: 'Published',
    audience: 'Client',
    creator_id: 'noah',
    linked_job_id: '33333333-3333-4333-8333-333333333333',
    theme_color: '#60a5fa',
    background: 'grid',
    submit_label: 'Send intake',
    collect_email: true,
    require_approval: false,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    questions: [
      { id: 'q-draft-1', type: 'short', label: 'Project address', required: true },
      { id: 'q-draft-2', type: 'paragraph', label: 'Permit notes', required: false },
      { id: 'q-draft-3', type: 'date', label: 'Needed by', required: true },
    ],
  },
  {
    id: 'form-lumen-onboarding',
    company_id: 'lumen',
    title: 'Client Onboarding Intake',
    description: 'Initial Lumen setup form for client goals, assets, users, and launch timing.',
    type: 'Intake',
    status: 'Draft',
    audience: 'Client',
    creator_id: 'lumen-ops',
    linked_job_id: '',
    theme_color: '#a78bfa',
    background: 'clean',
    submit_label: 'Submit onboarding',
    collect_email: true,
    require_approval: false,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    questions: [
      { id: 'q-lumen-1', type: 'short', label: 'Company name', required: true },
      { id: 'q-lumen-2', type: 'checkbox', label: 'Needed services', required: true, options: ['Website', 'SEO', 'Paid ads', 'CRM setup'] },
      { id: 'q-lumen-3', type: 'paragraph', label: 'Launch goals', required: false },
    ],
  },
];

const formResponsesFallback = [
  {
    id: 'response-roofing-1',
    company_id: 'roofing',
    form_id: 'form-roofing-inspection',
    submitted_by: 'Maya Rosales',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    answers: {
      'q-roof-1': 'Queen Creek, AZ',
      'q-roof-2': 'Active leak',
      'q-roof-3': 'Dry-in held. Prepare repair estimate and photo packet.',
    },
  },
];

const financeVendorsFallback = [
  {
    id: 'vendor-roofing-materials',
    company_id: 'roofing',
    name: 'Valley Roofing Supply',
    contact_name: 'Elena Ortiz',
    email: 'orders@valleyroofingsupply.local',
    phone: '(480) 555-0190',
    category: 'Materials',
    status: 'Active',
    notes: 'Primary tile, flashing, and underlayment vendor.',
    created_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'vendor-roofing-dryin',
    company_id: 'roofing',
    name: 'Monsoon Dry-In Crew',
    contact_name: 'R. Alvarez',
    email: 'dispatch@monsoondryin.local',
    phone: '(602) 555-0144',
    category: 'Subcontractor',
    status: 'Active',
    notes: 'Emergency dry-in support during storm calls.',
    created_at: new Date(Date.now() - 1036800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'vendor-drafting-permits',
    company_id: 'drafting',
    name: 'Permit Runner AZ',
    contact_name: 'Sofia Chen',
    email: 'permits@runneraz.local',
    phone: '(602) 555-0171',
    category: 'Permit',
    status: 'Active',
    notes: 'Permit filing support for drafting packets.',
    created_at: new Date(Date.now() - 864000000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'vendor-lumen-software',
    company_id: 'lumen',
    name: 'Lumen SaaS Stack',
    contact_name: 'Ops Billing',
    email: 'billing@lumenstack.local',
    phone: '',
    category: 'Software',
    status: 'Active',
    notes: 'Internal software subscriptions for client onboarding.',
    created_at: new Date(Date.now() - 777600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

const financeInvoicesFallback = [
  {
    id: 'invoice-roofing-queen-creek',
    company_id: 'roofing',
    job_id: '11111111-1111-4111-8111-111111111111',
    client_name: 'Rosales Residence',
    invoice_number: 'QR-1007',
    status: 'Partially paid',
    issue_date: isoDate(-10),
    due_date: isoDate(5),
    subtotal: 6800,
    tax: 0,
    total: 6800,
    notes: 'Emergency leak repair billing with deposit received.',
    created_at: new Date(Date.now() - 864000000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'invoice-roofing-mesa-storage',
    company_id: 'roofing',
    job_id: '22222222-2222-4222-8222-222222222222',
    client_name: 'Mesa Storage Partners',
    invoice_number: 'QR-1008',
    status: 'Sent',
    issue_date: isoDate(-18),
    due_date: isoDate(-2),
    subtotal: 18400,
    tax: 0,
    total: 18400,
    notes: 'Estimate packet sent to board for approval.',
    created_at: new Date(Date.now() - 1555200000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'invoice-drafting-horizon',
    company_id: 'drafting',
    job_id: '33333333-3333-4333-8333-333333333333',
    client_name: 'Horizon HVAC',
    invoice_number: 'QD-2031',
    status: 'Sent',
    issue_date: isoDate(-7),
    due_date: isoDate(14),
    subtotal: 4200,
    tax: 0,
    total: 4200,
    notes: 'Drafting permit package milestone invoice.',
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'invoice-lumen-onboarding',
    company_id: 'lumen',
    job_id: '',
    client_name: 'Lumen Internal Launch',
    invoice_number: 'LM-3004',
    status: 'Draft',
    issue_date: isoDate(-3),
    due_date: isoDate(27),
    subtotal: 3200,
    tax: 0,
    total: 3200,
    notes: 'Demo onboarding package used for finance workspace.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const financePaymentsFallback = [
  {
    id: 'payment-roofing-queen-creek-deposit',
    company_id: 'roofing',
    invoice_id: 'invoice-roofing-queen-creek',
    amount: 2500,
    method: 'ACH',
    received_at: isoDate(-4),
    reference: 'ACH-4421',
    notes: 'Deposit received after dry-in visit.',
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'payment-drafting-horizon-retainer',
    company_id: 'drafting',
    invoice_id: 'invoice-drafting-horizon',
    amount: 1000,
    method: 'Check',
    received_at: isoDate(-1),
    reference: 'CHK-117',
    notes: 'Retainer collected before permit packet completion.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const financeExpensesFallback = [
  {
    id: 'expense-roofing-queen-creek-materials',
    company_id: 'roofing',
    job_id: '11111111-1111-4111-8111-111111111111',
    vendor_id: 'vendor-roofing-materials',
    category: 'Materials',
    amount: 1850,
    status: 'Approved',
    spent_at: isoDate(-6),
    notes: 'Underlayment, flashing, and tile replacement materials.',
    created_at: new Date(Date.now() - 518400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'expense-roofing-mesa-permit',
    company_id: 'roofing',
    job_id: '22222222-2222-4222-8222-222222222222',
    vendor_id: 'vendor-roofing-materials',
    category: 'Permit',
    amount: 620,
    status: 'Pending',
    spent_at: isoDate(-2),
    notes: 'Permit and document prep allowance.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'expense-drafting-horizon-runner',
    company_id: 'drafting',
    job_id: '33333333-3333-4333-8333-333333333333',
    vendor_id: 'vendor-drafting-permits',
    category: 'Permit',
    amount: 480,
    status: 'Approved',
    spent_at: isoDate(-3),
    notes: 'Permit runner package review.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'expense-lumen-software-stack',
    company_id: 'lumen',
    job_id: '',
    vendor_id: 'vendor-lumen-software',
    category: 'Software',
    amount: 540,
    status: 'Paid',
    spent_at: isoDate(-5),
    notes: 'Client onboarding software stack.',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const notificationsFallback = [
  {
    id: 'notification-roofing-task-assigned',
    company_id: 'roofing',
    recipient_profile_id: 'basic-quest-user',
    type: 'task.assigned',
    title: 'Task assigned',
    body: 'Abraham assigned Leak inspection photos to you.',
    href: '/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1',
    source_type: 'task',
    source_id: 'task-roofing-leak-1',
    read_at: '',
    created_at: new Date(Date.now() - 7 * 60000).toISOString(),
  },
  {
    id: 'notification-roofing-task-priority',
    company_id: 'roofing',
    recipient_profile_id: 'basic-quest-user',
    type: 'task.priority',
    title: 'Task priority changed',
    body: 'Shan set priority to Urgent on HOA board approval package.',
    href: '/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1',
    source_type: 'task',
    source_id: 'task-roofing-mesa-1',
    read_at: '',
    created_at: new Date(Date.now() - 19 * 60000).toISOString(),
  },
  {
    id: 'notification-roofing-approval',
    company_id: 'roofing',
    recipient_profile_id: 'basic-quest-user',
    type: 'approval.ready',
    title: 'Approval needs review',
    body: 'Estimate approval is waiting in the company review queue.',
    href: '/company/roofing/approvals',
    source_type: 'form',
    source_id: 'form-roofing-estimate-approval',
    read_at: new Date(Date.now() - 5 * 60000).toISOString(),
    created_at: new Date(Date.now() - 44 * 60000).toISOString(),
  },
  {
    id: 'notification-drafting-task-review',
    company_id: 'drafting',
    recipient_profile_id: 'basic-quest-user',
    type: 'task.status',
    title: 'Task moved to review',
    body: 'Drawing package QA is ready for review.',
    href: '/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1',
    source_type: 'task',
    source_id: 'task-drafting-package-1',
    read_at: '',
    created_at: new Date(Date.now() - 63 * 60000).toISOString(),
  },
  {
    id: 'notification-lumen-finance',
    company_id: 'lumen',
    recipient_profile_id: 'basic-quest-user',
    type: 'finance.invoice',
    title: 'Invoice drafted',
    body: 'Lumen onboarding invoice is ready for payment tracking.',
    href: '/company/lumen/finance?invoice=invoice-lumen-onboarding',
    source_type: 'invoice',
    source_id: 'invoice-lumen-onboarding',
    read_at: '',
    created_at: new Date(Date.now() - 92 * 60000).toISOString(),
  },
];

const messageConversationsFallback = [
  {
    id: 'msg-conv-roofing-all',
    company_id: 'roofing',
    title: 'Roofing dispatch',
    type: 'company',
    created_by: 'basic-quest-user',
    last_message_at: new Date(Date.now() - 16 * 60000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 60000).toISOString(),
  },
  {
    id: 'msg-conv-roofing-crew',
    company_id: 'roofing',
    title: 'Roofing crew',
    type: 'role',
    created_by: 'basic-quest-user',
    last_message_at: new Date(Date.now() - 52 * 60000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 52 * 60000).toISOString(),
  },
  {
    id: 'msg-conv-roofing-direct-shan',
    company_id: 'roofing',
    title: 'Shan Kumar',
    type: 'direct',
    created_by: 'basic-quest-user',
    last_message_at: new Date(Date.now() - 8 * 60000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'msg-conv-drafting-all',
    company_id: 'drafting',
    title: 'Drafting review',
    type: 'company',
    created_by: 'basic-quest-user',
    last_message_at: new Date(Date.now() - 74 * 60000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 74 * 60000).toISOString(),
  },
  {
    id: 'msg-conv-lumen-product',
    company_id: 'lumen',
    title: 'Lumen launch room',
    type: 'custom',
    created_by: 'basic-quest-user',
    last_message_at: new Date(Date.now() - 38 * 60000).toISOString(),
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date(Date.now() - 38 * 60000).toISOString(),
  },
];

const messageAccessFallback = [
  { id: 'msg-access-roofing-all', conversation_id: 'msg-conv-roofing-all', company_id: 'roofing', target_type: 'all_company', target_id: 'all' },
  { id: 'msg-access-roofing-crew-role', conversation_id: 'msg-conv-roofing-crew', company_id: 'roofing', target_type: 'role', target_id: 'staff-roofing' },
  { id: 'msg-access-roofing-direct-basic', conversation_id: 'msg-conv-roofing-direct-shan', company_id: 'roofing', target_type: 'profile', target_id: 'basic-quest-user' },
  { id: 'msg-access-roofing-direct-shan', conversation_id: 'msg-conv-roofing-direct-shan', company_id: 'roofing', target_type: 'profile', target_id: 'shan' },
  { id: 'msg-access-drafting-all', conversation_id: 'msg-conv-drafting-all', company_id: 'drafting', target_type: 'all_company', target_id: 'all' },
  { id: 'msg-access-lumen-basic', conversation_id: 'msg-conv-lumen-product', company_id: 'lumen', target_type: 'profile', target_id: 'basic-quest-user' },
  { id: 'msg-access-lumen-role', conversation_id: 'msg-conv-lumen-product', company_id: 'lumen', target_type: 'role', target_id: 'admin-lumen' },
];

const messagesFallback = [
  {
    id: 'msg-roofing-all-1',
    conversation_id: 'msg-conv-roofing-all',
    company_id: 'roofing',
    sender_profile_id: 'abraham',
    body: 'Morning check: Mesa HOA estimate needs photos before noon.',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 48 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60000).toISOString(),
  },
  {
    id: 'msg-roofing-all-2',
    conversation_id: 'msg-conv-roofing-all',
    company_id: 'roofing',
    sender_profile_id: 'basic-quest-user',
    body: 'Got it. I am linking the job files now.',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 16 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 60000).toISOString(),
  },
  {
    id: 'msg-roofing-crew-1',
    conversation_id: 'msg-conv-roofing-crew',
    company_id: 'roofing',
    sender_profile_id: 'shan',
    body: '@Joshua bring the permit packet when you head to Arroyo.',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 52 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 52 * 60000).toISOString(),
  },
  {
    id: 'msg-roofing-direct-1',
    conversation_id: 'msg-conv-roofing-direct-shan',
    company_id: 'roofing',
    sender_profile_id: 'shan',
    body: 'Can you confirm the roof access photo uploaded correctly?',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'msg-drafting-all-1',
    conversation_id: 'msg-conv-drafting-all',
    company_id: 'drafting',
    sender_profile_id: 'abraham',
    body: 'Horizon package QA is ready. Please keep notes in this thread.',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 74 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 74 * 60000).toISOString(),
  },
  {
    id: 'msg-lumen-product-1',
    conversation_id: 'msg-conv-lumen-product',
    company_id: 'lumen',
    sender_profile_id: 'basic-quest-user',
    body: 'Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.',
    message_type: 'text',
    deleted_at: '',
    created_at: new Date(Date.now() - 38 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 38 * 60000).toISOString(),
  },
];

const messageAttachmentsFallback = [
  {
    id: 'msg-attachment-roofing-photo',
    conversation_id: 'msg-conv-roofing-crew',
    message_id: 'msg-roofing-crew-1',
    company_id: 'roofing',
    bucket_id: 'quest-message-attachments',
    object_path: '',
    file_name: 'roof-access-photo.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 184000,
    preview_url: '',
    created_at: new Date(Date.now() - 52 * 60000).toISOString(),
  },
];

const messageReadsFallback = [
  { conversation_id: 'msg-conv-roofing-all', company_id: 'roofing', profile_id: 'basic-quest-user', last_read_at: new Date(Date.now() - 10 * 60000).toISOString() },
  { conversation_id: 'msg-conv-roofing-crew', company_id: 'roofing', profile_id: 'basic-quest-user', last_read_at: '' },
  { conversation_id: 'msg-conv-roofing-direct-shan', company_id: 'roofing', profile_id: 'basic-quest-user', last_read_at: '' },
  { conversation_id: 'msg-conv-drafting-all', company_id: 'drafting', profile_id: 'basic-quest-user', last_read_at: '' },
  { conversation_id: 'msg-conv-lumen-product', company_id: 'lumen', profile_id: 'basic-quest-user', last_read_at: '' },
];

const state = {
  route: null,
  session: readJson(SESSION_KEY, null),
  profileDraft: readJson(PROFILE_KEY, null),
  authReady: !CONFIG.questAuthEnabled,
  authMode: 'signin',
  jobs: readSeededList(JOB_CACHE_KEY, jobsFallback).map(normalizeJob),
  tasks: readSeededList(TASK_CACHE_KEY, tasksFallback).map(normalizeTask),
  files: readSeededList(FILE_CACHE_KEY, filesFallback).map(normalizeFile),
  driveFolders: readSeededList(DRIVE_FOLDER_CACHE_KEY, []).map(normalizeDriveFolder),
  forms: readSeededList(FORM_CACHE_KEY, formsFallback).map(normalizeForm),
  formResponses: readSeededList(FORM_RESPONSE_CACHE_KEY, formResponsesFallback).map(normalizeFormResponse),
  financeInvoices: readSeededList(FINANCE_INVOICE_CACHE_KEY, financeInvoicesFallback).map(normalizeFinanceInvoice),
  financePayments: readSeededList(FINANCE_PAYMENT_CACHE_KEY, financePaymentsFallback).map(normalizeFinancePayment),
  financeExpenses: readSeededList(FINANCE_EXPENSE_CACHE_KEY, financeExpensesFallback).map(normalizeFinanceExpense),
  financeVendors: readSeededList(FINANCE_VENDOR_CACHE_KEY, financeVendorsFallback).map(normalizeFinanceVendor),
  notifications: readSeededList(NOTIFICATION_CACHE_KEY, notificationsFallback).map(normalizeNotification),
  messageConversations: readSeededList(MESSAGE_CONVERSATION_CACHE_KEY, messageConversationsFallback).map(normalizeMessageConversation),
  messageAccess: readSeededList(MESSAGE_ACCESS_CACHE_KEY, messageAccessFallback).map(normalizeMessageAccess),
  messages: readSeededList(MESSAGE_CACHE_KEY, messagesFallback).map(normalizeMessage),
  messageReads: readSeededList(MESSAGE_READ_CACHE_KEY, messageReadsFallback).map(normalizeMessageRead),
  messageAttachments: readSeededList(MESSAGE_ATTACHMENT_CACHE_KEY, messageAttachmentsFallback).map(normalizeMessageAttachment),
  timeEntries: readJson(TIME_ENTRY_CACHE_KEY, []),
  activeTimer: readJson(ACTIVE_TIMER_KEY, null),
  teamMembers: readSeededList(TEAM_CACHE_KEY, teamMembersFallback).map(normalizeTeamMember),
  memberships: readSeededList(MEMBERSHIP_CACHE_KEY, membershipsFallback),
  profiles: [],
  subscriptions: [],
  roles: [],
  rolePermissions: [],
  roleAssignments: [],
  resourceAcl: [],
  fieldPermissions: [],
  companyInvites: [],
  joinRequests: [],
  auditEvents: [],
  companies: mergeCompanies(companiesFallback.map(normalizeCompany)),
  activeCompanyId: localStorage.getItem(COMPANY_KEY) || '',
  selectedJobId: '',
  selectedTaskId: '',
  selectedFileId: '',
  selectedFormId: '',
  selectedQuestionId: '',
  selectedFinanceInvoiceId: '',
  selectedFinanceExpenseId: '',
  selectedFinanceVendorId: '',
  expandedFormIds: new Set(),
  formStartTemplateId: '',
  formStartTab: 'blank',
  query: '',
  fileQuery: '',
  formQuery: '',
  crmQuery: '',
  stageFilter: 'all',
  crmStageFilter: 'all',
  crmOwnerFilter: 'all',
  messageQuery: '',
  messageFilter: 'all',
  selectedConversationId: '',
  messageRealtimeChannel: null,
  messageRealtimeKey: '',
  taskStatusFilter: 'all',
  taskPriorityFilter: 'all',
  fileCategoryFilter: 'All categories',
  formTypeFilter: 'all',
  formsTab: 'library',
  formEditorTab: 'questions',
  taskView: localStorage.getItem(TASK_VIEW_KEY) || 'table',
  driveFolder: 'home',
  driveView: localStorage.getItem(DRIVE_VIEW_KEY) || 'list',
  sync: { label: 'Loading workspace...', mode: 'loading' },
  dataLoaded: false,
  dataLoading: false,
  loginError: '',
  authMessage: '',
  toast: null,
  toastTimer: null,
  modal: '',
  accountMenuOpen: false,
  notificationMenuOpen: false,
  rolePreview: null,
};

const app = document.getElementById('app');
let supabaseClientCache = null;
init();

function init() {
  normalizeLegacyLocation();
  window.addEventListener('popstate', render);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('submit', onDocumentSubmit);
  document.addEventListener('input', onDocumentInput);
  document.addEventListener('change', onDocumentChange);
  initializeAuth();
  render();
}

async function initializeAuth() {
  if (state.session?.auth === 'local-basic') {
    resetDemoWorkspaceData();
    state.authReady = true;
    return;
  }
  if (!CONFIG.questAuthEnabled) {
    state.authReady = true;
    return;
  }
  const client = createSupabaseClient();
  if (!client?.auth) {
    state.authReady = true;
    state.loginError = 'Supabase auth is unavailable in this browser session.';
    return;
  }
  try {
    const { data } = await client.auth.getSession();
    await setSupabaseSession(data?.session || null);
    client.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session || null).finally(() => {
        state.dataLoaded = false;
        render();
      });
    });
  } catch (error) {
    state.loginError = error.message || 'Unable to initialize Supabase auth.';
  } finally {
    state.authReady = true;
    render();
  }
}

async function setSupabaseSession(session) {
  if (!CONFIG.questAuthEnabled) return;
  if (!session?.user) {
    state.session = null;
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  const profile = await fetchSupabaseProfile(session.user);
  state.session = buildSupabaseSession(session, profile);
  resetLiveWorkspaceData();
  writeJson(SESSION_KEY, state.session);
}

async function fetchSupabaseProfile(user) {
  const fallback = {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || user.email || 'Quest user',
    role: 'member',
    role_label: 'Member',
    member_id: '',
    company_ids: [],
    avatar_url: '',
    approved: false,
    email_verified: !!user.email_confirmed_at,
  };
  const client = createSupabaseClient();
  if (!client) return fallback;
  const result = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (result.error || !result.data) return fallback;
  return normalizeProfile(result.data, fallback);
}

function render() {
  state.route = getRoute();

  if (CONFIG.questAuthEnabled && !state.authReady) {
    renderAuthLoading();
    return;
  }

  if (needsLocalLogin(state.route)) {
    navigate('/login?return_url=' + encodeURIComponent(currentAppUrl()), { replace: true });
    return;
  }

  if (state.route.name === 'login') {
    renderLogin();
    return;
  }

  ensureDataLoad();
  if (state.session?.auth === 'supabase' && state.dataLoaded && !allowedCompanyIds().length) {
    renderNoCompanyAccess();
    return;
  }
  const redirect = routeRedirect(state.route);
  if (redirect) {
    navigate(redirect, { replace: true });
    return;
  }

  reconcileCompany(state.route);
  reconcileSelection(state.route);
  if (state.route.params.get('account') === 'profile') state.modal = 'profile';
  document.title = `${routeTitle(state.route)} | ${companyName(activeCompanyId())} | Quest HQ`;
  app.innerHTML = shellTemplate(state.route, renderWorkspace(state.route));
}

function renderNoCompanyAccess() {
  document.title = 'Company access pending | Quest HQ';
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Access pending</small></span>
        </div>
        <div>
          <div class="eyebrow">Tenant security</div>
          <h1>No active company access</h1>
          <p>Your account exists, but you are not an active member of a company workspace yet. Create your own workspace or request access from an existing company.</p>
        </div>
        <form data-company-create-form>
          <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
          <button class="btn btn-primary full" type="submit">Create company workspace</button>
          <div class="form-message">You will become the Owner for this workspace.</div>
        </form>
        <button class="btn full" type="button" data-action="sign-out">Sign out</button>
      </section>
    </main>
  `;
}

function needsLocalLogin(route) {
  if (!CONFIG.questAuthEnabled && !CONFIG.localLoginEnabled) return false;
  if (route.name === 'login') return false;
  return !state.session;
}

function renderAuthLoading() {
  document.title = 'Loading | Quest HQ';
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${emptyState('Checking secure session...')}
      </section>
    </main>
  `;
}

function ensureDataLoad() {
  if (state.dataLoaded || state.dataLoading) return;
  state.dataLoading = true;
  loadSupabaseData()
    .catch(() => {
      state.sync = { label: 'Local fallback', mode: 'local' };
    })
    .finally(() => {
      state.dataLoaded = true;
      state.dataLoading = false;
      persistAll();
      render();
    });
}

async function loadSupabaseData() {
  if (state.session?.auth === 'local-basic') {
    state.sync = { label: 'Demo mode', mode: 'local' };
    return;
  }
  const client = createSupabaseClient();
  if (!client) {
    state.sync = { label: 'Supabase unavailable', mode: 'local' };
    return;
  }

  const [
    companiesResult,
    jobsResult,
    tasksResult,
    filesResult,
    teamResult,
    membershipsResult,
    profilesResult,
    subscriptionsResult,
    rolesResult,
    rolePermissionsResult,
    roleAssignmentsResult,
    resourceAclResult,
    fieldPermissionsResult,
    invitesResult,
    joinRequestsResult,
    auditEventsResult,
    messageConversationsResult,
    messageAccessResult,
    messagesResult,
    messageAttachmentsResult,
    messageReadsResult,
  ] = await Promise.all([
    client.from('companies').select('*').order('name', { ascending: true }),
    client.from('jobs').select('*').order('updated_at', { ascending: false }),
    client.from('tasks').select('*').order('updated_at', { ascending: false }),
    client.from('job_files').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    client.from('team_members').select('*').order('name', { ascending: true }),
    client.from('company_memberships').select('*'),
    client.from('profiles').select('*'),
    client.from('company_subscriptions').select('*'),
    client.from('roles').select('*').order('priority', { ascending: false }),
    client.from('role_permissions').select('*'),
    client.from('user_role_assignments').select('*'),
    client.from('resource_acl').select('*'),
    client.from('field_permissions').select('*'),
    client.from('company_invites').select('*').order('created_at', { ascending: false }),
    client.from('company_join_requests').select('*').order('created_at', { ascending: false }),
    client.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
    client.from('message_conversations').select('*').order('last_message_at', { ascending: false }),
    client.from('message_conversation_access').select('*'),
    client.from('messages').select('*').order('created_at', { ascending: true }).limit(500),
    client.from('message_attachments').select('*').order('created_at', { ascending: true }).limit(500),
    client.from('message_reads').select('*'),
  ]);

  let liveTables = 0;
  if (!companiesResult.error) {
    state.companies = (companiesResult.data || []).map(normalizeCompany);
    liveTables += 1;
  }
  if (!jobsResult.error) {
    state.jobs = (jobsResult.data || []).map(normalizeJob);
    liveTables += 1;
  }
  if (!tasksResult.error) {
    state.tasks = (tasksResult.data || []).map(normalizeTask);
    liveTables += 1;
  }
  if (!filesResult.error) {
    state.files = (filesResult.data || []).map(normalizeFile);
    liveTables += 1;
  }
  if (!teamResult.error) {
    state.teamMembers = (teamResult.data || []).map(normalizeTeamMember);
    liveTables += 1;
  }
  if (!membershipsResult.error) {
    state.memberships = (membershipsResult.data || []).map(normalizeMembership);
    liveTables += 1;
  }
  if (!profilesResult.error) {
    state.profiles = (profilesResult.data || []).map((profile) => normalizeProfile(profile));
    liveTables += 1;
  }
  if (!subscriptionsResult.error) {
    state.subscriptions = (subscriptionsResult.data || []).map(normalizeSubscription);
    liveTables += 1;
  }
  if (!rolesResult.error) {
    state.roles = (rolesResult.data || []).map(normalizeRole);
    liveTables += 1;
  }
  if (!rolePermissionsResult.error) state.rolePermissions = (rolePermissionsResult.data || []).map(normalizeRolePermission);
  if (!roleAssignmentsResult.error) state.roleAssignments = (roleAssignmentsResult.data || []).map(normalizeRoleAssignment);
  if (!resourceAclResult.error) state.resourceAcl = (resourceAclResult.data || []).map(normalizeResourceAcl);
  if (!fieldPermissionsResult.error) state.fieldPermissions = (fieldPermissionsResult.data || []).map(normalizeFieldPermission);
  if (!invitesResult.error) state.companyInvites = (invitesResult.data || []).map(normalizeCompanyInvite);
  if (!joinRequestsResult.error) state.joinRequests = (joinRequestsResult.data || []).map(normalizeJoinRequest);
  if (!auditEventsResult.error) state.auditEvents = auditEventsResult.data || [];
  if (!messageConversationsResult.error) state.messageConversations = (messageConversationsResult.data || []).map(normalizeMessageConversation);
  if (!messageAccessResult.error) state.messageAccess = (messageAccessResult.data || []).map(normalizeMessageAccess);
  if (!messagesResult.error) state.messages = (messagesResult.data || []).map(normalizeMessage);
  if (!messageAttachmentsResult.error) state.messageAttachments = (messageAttachmentsResult.data || []).map(normalizeMessageAttachment);
  if (!messageReadsResult.error) state.messageReads = (messageReadsResult.data || []).map(normalizeMessageRead);

  state.sync = liveTables ? { label: 'Quest Supabase live', mode: 'live' } : { label: 'Local fallback', mode: 'local' };
}

function createSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  if (!supabaseClientCache) {
    supabaseClientCache = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }
  return supabaseClientCache;
}

function resetLiveWorkspaceData() {
  state.jobs = [];
  state.tasks = [];
  state.files = [];
  state.driveFolders = [];
  state.forms = [];
  state.formResponses = [];
  state.financeInvoices = [];
  state.financePayments = [];
  state.financeExpenses = [];
  state.financeVendors = [];
  state.notifications = [];
  state.messageConversations = [];
  state.messageAccess = [];
  state.messages = [];
  state.messageReads = [];
  state.messageAttachments = [];
  state.timeEntries = [];
  state.activeTimer = null;
  state.teamMembers = [];
  state.memberships = [];
  state.profiles = [];
  state.subscriptions = [];
  state.roles = [];
  state.rolePermissions = [];
  state.roleAssignments = [];
  state.resourceAcl = [];
  state.fieldPermissions = [];
  state.companyInvites = [];
  state.joinRequests = [];
  state.auditEvents = [];
  state.companies = [];
  state.sync = { label: 'Loading secure workspace...', mode: 'loading' };
}

function resetDemoWorkspaceData() {
  state.jobs = readSeededList(JOB_CACHE_KEY, jobsFallback).map(normalizeJob);
  state.tasks = readSeededList(TASK_CACHE_KEY, tasksFallback).map(normalizeTask);
  state.files = readSeededList(FILE_CACHE_KEY, filesFallback).map(normalizeFile);
  state.driveFolders = readSeededList(DRIVE_FOLDER_CACHE_KEY, []).map(normalizeDriveFolder);
  state.forms = readSeededList(FORM_CACHE_KEY, formsFallback).map(normalizeForm);
  state.formResponses = readSeededList(FORM_RESPONSE_CACHE_KEY, formResponsesFallback).map(normalizeFormResponse);
  state.financeInvoices = readSeededList(FINANCE_INVOICE_CACHE_KEY, financeInvoicesFallback).map(normalizeFinanceInvoice);
  state.financePayments = readSeededList(FINANCE_PAYMENT_CACHE_KEY, financePaymentsFallback).map(normalizeFinancePayment);
  state.financeExpenses = readSeededList(FINANCE_EXPENSE_CACHE_KEY, financeExpensesFallback).map(normalizeFinanceExpense);
  state.financeVendors = readSeededList(FINANCE_VENDOR_CACHE_KEY, financeVendorsFallback).map(normalizeFinanceVendor);
  state.notifications = readSeededList(NOTIFICATION_CACHE_KEY, notificationsFallback).map(normalizeNotification);
  state.messageConversations = readSeededList(MESSAGE_CONVERSATION_CACHE_KEY, messageConversationsFallback).map(normalizeMessageConversation);
  state.messageAccess = readSeededList(MESSAGE_ACCESS_CACHE_KEY, messageAccessFallback).map(normalizeMessageAccess);
  state.messages = readSeededList(MESSAGE_CACHE_KEY, messagesFallback).map(normalizeMessage);
  state.messageReads = readSeededList(MESSAGE_READ_CACHE_KEY, messageReadsFallback).map(normalizeMessageRead);
  state.messageAttachments = readSeededList(MESSAGE_ATTACHMENT_CACHE_KEY, messageAttachmentsFallback).map(normalizeMessageAttachment);
  state.timeEntries = readJson(TIME_ENTRY_CACHE_KEY, []);
  state.activeTimer = readJson(ACTIVE_TIMER_KEY, null);
  state.teamMembers = readSeededList(TEAM_CACHE_KEY, teamMembersFallback).map(normalizeTeamMember);
  state.memberships = readSeededList(MEMBERSHIP_CACHE_KEY, membershipsFallback);
  state.profiles = [];
  state.subscriptions = [];
  state.roles = [];
  state.rolePermissions = [];
  state.roleAssignments = [];
  state.resourceAcl = [];
  state.fieldPermissions = [];
  state.companyInvites = [];
  state.joinRequests = [];
  state.auditEvents = [];
  state.companies = mergeCompanies(companiesFallback.map(normalizeCompany));
  state.sync = { label: 'Demo mode', mode: 'local' };
}

function renderSvgSprite() {
  return `
    <svg class="svg-sprite" aria-hidden="true" focusable="false">
      <symbol id="q-logo" viewBox="0 0 32 32">
        <path d="M4 25V12.8L16 5l12 7.8V25h-6.2v-9.2H10.2V25H4Z" />
        <path d="M10.2 15.8 16 11.9l5.8 3.9" />
        <path d="M12 21h8" />
      </symbol>
      <symbol id="q-company" viewBox="0 0 24 24">
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M8 20v-7h8v7" />
        <path d="M9 9h.1M12 8h.1M15 9h.1" />
      </symbol>
      <symbol id="q-search" viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.3 4.3" />
      </symbol>
      <symbol id="q-empty" viewBox="0 0 24 24">
        <path d="M5 18.5V7.7L12 4l7 3.7v10.8" />
        <path d="M8 12h8M9.5 15h5" />
      </symbol>
      <symbol id="q-symbol-jobs" viewBox="0 0 24 24">
        <path d="M5 20V8h14v12H5Z" />
        <path d="M9 8V5h6v3M8 12h8M8 16h5" />
      </symbol>
      <symbol id="q-symbol-tasks" viewBox="0 0 24 24">
        <path d="M6 7h12M6 12h12M6 17h12" />
        <path d="m4 7 .9.9L6.4 6.4M4 12l.9.9 1.5-1.5M4 17l.9.9 1.5-1.5" />
      </symbol>
      <symbol id="q-symbol-files" viewBox="0 0 24 24">
        <path d="M4 19.5V6h6l2 2h8v11.5H4Z" />
        <path d="M4 10h16" />
      </symbol>
      <symbol id="q-symbol-forms" viewBox="0 0 24 24">
        <path d="M7 4h10v16H7V4Z" />
        <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
      </symbol>
      <symbol id="q-symbol-analytics" viewBox="0 0 24 24">
        <path d="M5 19V5" />
        <path d="M5 19h14" />
        <path d="M8 16v-4M12 16V8M16 16v-6" />
      </symbol>
      <symbol id="q-symbol-crm" viewBox="0 0 24 24">
        <circle cx="9" cy="9" r="3" />
        <path d="M3.8 19c.8-3 2.5-4.5 5.2-4.5s4.4 1.5 5.2 4.5" />
        <path d="M15.5 8.2a2.7 2.7 0 1 1 0 5.4M16.8 15.2c1.8.6 3 1.9 3.6 3.8" />
      </symbol>
      <symbol id="q-symbol-tickets" viewBox="0 0 24 24">
        <path d="M4 8.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3Z" />
        <path d="M9 9v10" />
      </symbol>
      <symbol id="q-symbol-finance" viewBox="0 0 24 24">
        <path d="M6 4h12v16H6V4Z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
        <path d="M15.5 14.5c0 1.4-1 2.5-3.2 2.5" />
      </symbol>
      <symbol id="q-symbol-knowledge" viewBox="0 0 24 24">
        <path d="M5 5.5c2.8-.8 5-.4 7 1.2 2-1.6 4.2-2 7-1.2V19c-2.8-.8-5-.4-7 1.2-2-1.6-4.2-2-7-1.2V5.5Z" />
        <path d="M12 6.7v13.5" />
      </symbol>
      <symbol id="q-symbol-automations" viewBox="0 0 24 24">
        <path d="M7 8a4 4 0 0 1 8 0c0 3-4 3.5-4 7" />
        <path d="M9 20h4M10 17h2M16.5 13.5l3 3M20 13l-3.5 3.5" />
      </symbol>
      <symbol id="q-symbol-templates" viewBox="0 0 24 24">
        <path d="M5 5h14v14H5V5Z" />
        <path d="M5 10h14M10 10v9" />
      </symbol>
      <symbol id="q-symbol-users" viewBox="0 0 24 24">
        <circle cx="8.5" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.5" />
        <path d="M3.8 19c.8-3 2.3-4.5 4.7-4.5s3.9 1.5 4.7 4.5M13.4 15.3c2.6 0 4.2 1.2 4.8 3.7" />
      </symbol>
      <symbol id="q-symbol-messages" viewBox="0 0 24 24">
        <path d="M4.5 6.5h15v9.5h-8l-4.5 3v-3H4.5v-9.5Z" />
        <path d="M8 10h8M8 13h5" />
      </symbol>
      <symbol id="q-symbol-company-chat" viewBox="0 0 24 24">
        <path d="M4 18V7l8-4 8 4v11" />
        <path d="M8 18v-6h8v6" />
        <path d="M6.5 21h11M8 8h.1M12 7h.1M16 8h.1" />
      </symbol>
      <symbol id="q-symbol-role-chat" viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3.8 18c.8-3 2.2-4.5 4.2-4.5s3.4 1.5 4.2 4.5M13 14.5c2.8.1 4.5 1.6 5.2 4.5" />
      </symbol>
      <symbol id="q-symbol-direct-chat" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20c1-4 3.1-6 6.5-6s5.5 2 6.5 6" />
      </symbol>
      <symbol id="q-message-file" viewBox="0 0 24 24">
        <path d="M7 3.5h7l3 3V20H7V3.5Z" />
        <path d="M14 3.5V7h3M9.5 12h5M9.5 15h4" />
      </symbol>
      <symbol id="q-message-image" viewBox="0 0 24 24">
        <path d="M4.5 6h15v12h-15V6Z" />
        <circle cx="9" cy="10" r="1.4" />
        <path d="m6.8 16 3.6-3.5 2.3 2.1 2.1-2.7 2.8 4.1" />
      </symbol>
      <symbol id="q-symbol-settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.8v2.4M12 17.8v2.4M4.9 6l1.7 1.7M17.4 16.3l1.7 1.7M3.8 12h2.4M17.8 12h2.4M4.9 18l1.7-1.7M17.4 7.7 19.1 6" />
      </symbol>
      <symbol id="q-symbol-team-chart" viewBox="0 0 24 24">
        <path d="M12 5v5M7 15v4M17 15v4M7 15h10M12 10h-5v5M12 10h5v5" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="7" cy="20" r="2" />
        <circle cx="17" cy="20" r="2" />
      </symbol>
      <symbol id="q-symbol-time" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5V12l3 2" />
      </symbol>
      <symbol id="q-symbol-approvals" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <path d="M5 5h14v14H5V5Z" />
      </symbol>
      <symbol id="q-symbol-team-workload" viewBox="0 0 24 24">
        <path d="M4 18c.7-2.7 2.1-4 4.2-4s3.5 1.3 4.2 4M12.5 18c.7-2.7 2.1-4 4.2-4s3.5 1.3 4.2 4" />
        <circle cx="8.2" cy="9" r="3" />
        <circle cx="16.7" cy="9" r="3" />
      </symbol>
      <symbol id="q-symbol-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 6.8v5.4l3.7 2.1" />
        <path d="M5 4.8 3.5 6.3M19 4.8l1.5 1.5" />
      </symbol>
    </svg>
  `;
}

function svgIcon(id, className = 'symbol-icon') {
  return `<svg class="${h(className)}" aria-hidden="true" focusable="false"><use href="#${h(id)}"></use></svg>`;
}

function moduleSymbol(section = state.route?.section || 'jobs') {
  return MODULE_REGISTRY.find((module) => module.id === section)?.symbol || 'q-empty';
}

function metricSymbol(label) {
  const value = String(label || '').toLowerCase();
  if (value.includes('job') || value.includes('pipeline')) return 'q-symbol-jobs';
  if (value.includes('task') || value.includes('review')) return 'q-symbol-tasks';
  if (value.includes('file')) return 'q-symbol-files';
  if (value.includes('form')) return 'q-symbol-forms';
  if (value.includes('account') || value.includes('customer') || value.includes('member') || value.includes('user') || value.includes('lead')) return 'q-symbol-crm';
  if (value.includes('invoice') || value.includes('collected') || value.includes('expense') || value.includes('net') || value.includes('outstanding')) return 'q-symbol-finance';
  if (value.includes('time') || value.includes('today') || value.includes('days') || value.includes('timer') || value.includes('entries')) return 'q-symbol-clock';
  if (value.includes('approval') || value.includes('access')) return 'q-symbol-approvals';
  return moduleSymbol();
}

function shellTemplate(route, workspace) {
  const session = activeSession();
  const companyId = activeCompanyId();
  const emailVerified = isSessionEmailVerified(session);
  return `
    <div class="quest-app" data-route="${h(route.name)}">
      ${renderSvgSprite()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${appHref(companyPath('jobs', {}, companyId))}" data-router aria-label="Quest HQ workspace">
            ${svgIcon('q-logo', 'brand-symbol')}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${h(CONFIG.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${svgIcon('q-company')}
            <select data-company-switch aria-label="Active company">
              ${allowedCompanies().map((company) => `<option value="${h(company.id)}" ${company.id === companyId ? 'selected' : ''}>${h(companyLabel(company))}</option>`).join('')}
            </select>
          </label>
          <label class="global-search">
            ${svgIcon('q-search')}
            <input data-global-search value="${h(state.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${h(state.sync.mode)}" data-sync-state>${h(state.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${renderNotificationCenter(companyId)}
          <div class="account-menu ${state.accountMenuOpen ? 'open' : ''}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${state.accountMenuOpen ? 'true' : 'false'}">
              ${renderAvatar(session.profile, 'avatar')}
            </button>
            <div class="account-popover">
              <strong>${h(session.profile.full_name)}</strong>
              <span>${h(session.profile.role_label)} - ${h(companyName(companyId))}</span>
              ${!emailVerified ? `
                <div class="account-status warning">
                  <b>Email unverified</b>
                  <button type="button" data-action="verify-email">Click here to verify</button>
                </div>
              ` : ''}
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      ${renderRolePreviewBanner(companyId)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${renderDeck(route)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${workspace}
        </main>
      </div>
    </div>
    ${renderActiveModal(route, session)}
    ${renderToast()}
  `;
}

function renderNotificationCenter(companyId) {
  const notifications = companyNotifications(companyId);
  const unreadCount = notifications.filter((item) => !item.read_at).length;
  return `
    <div class="notification-center ${state.notificationMenuOpen ? 'open' : ''}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${state.notificationMenuOpen ? 'true' : 'false'}">
        <i class="ti ti-bell"></i>
        ${unreadCount ? `<b>${h(String(Math.min(unreadCount, 99)))}</b>` : ''}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${h(companyName(companyId))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${unreadCount ? '' : 'disabled'}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${notifications.slice(0, 12).map((item) => renderNotificationItem(item)).join('') || emptyState(state.session?.auth === 'supabase' ? 'No live notifications yet. Supabase inbox persistence comes after RLS.' : 'No notifications yet.')}
        </div>
      </div>
    </div>
  `;
}

function renderNotificationItem(item) {
  return `
    <button class="notification-item ${item.read_at ? 'read' : 'unread'}" type="button" data-action="open-notification" data-notification-id="${h(item.id)}">
      <span></span>
      <div>
        <small>${h(item.title)} - ${h(timeAgo(item.created_at))}</small>
        <strong>${h(item.body)}</strong>
      </div>
    </button>
  `;
}

function renderRolePreviewBanner(companyId) {
  const role = rolePreviewForCompany(companyId);
  if (!role) return '';
  return `
    <div class="role-preview-banner" style="--role-color:${h(role.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${h(role.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `;
}

function renderDeck(route) {
  const companyId = activeCompanyId();
  return `
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${h(companyColor(companyId))}">${svgIcon('q-company')}</span>
      <div>
        <strong>${h(companyName(companyId))}</strong>
        <small>${h(roleForCompany(companyId))} workspace</small>
      </div>
    </div>
    ${['Workspace', 'Company', 'Operations'].map((group) => navGroup(
      group,
      MODULE_REGISTRY
        .filter((module) => module.group === group && canViewModule(module, companyId))
        .map((module) => module.status === 'planned'
          ? plannedNavItem(module.symbol, module.label)
          : navItem(route, companyPath(module.id, {}, companyId), module.symbol, module.label, moduleBadgeCount(module.id, companyId))),
    )).join('')}
  `;
}

function navGroup(label, items) {
  return `
    <section class="side-group">
      <div class="side-label">${h(label)}</div>
      <div class="side-items">${items.join('')}</div>
    </section>
  `;
}

function navItem(route, path, symbol, label, count = '') {
  const active = isActiveNav(route, path);
  return `
    <a class="side-item ${active ? 'active' : ''}" href="${appHref(path)}" data-router>
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      ${count !== '' ? `<b>${h(String(count))}</b>` : ''}
    </a>
  `;
}

function plannedNavItem(symbol, label) {
  return `
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      <b>Planned</b>
    </button>
  `;
}

function canViewModule(module, companyId = activeCompanyId()) {
  if (module.status === 'planned') return true;
  if (!subscriptionAllowsCompany(companyId) && !['settings', 'users'].includes(module.id)) return false;
  return can(module.permission || `${module.id}.view`, companyId);
}

function moduleBadgeCount(moduleId, companyId = activeCompanyId()) {
  if (moduleId === 'jobs') return companyJobs(companyId).length;
  if (moduleId === 'tasks') return companyTasks(companyId).length;
  if (moduleId === 'files') return companyFiles(companyId).length;
  if (moduleId === 'forms') return companyForms(companyId).length;
  if (moduleId === 'crm') return crmAccounts(companyId).length;
  if (moduleId === 'finance') return companyFinanceInvoices(companyId).length;
  if (moduleId === 'users') return companyAccessUsers(companyId).filter((user) => user.status === 'active').length;
  if (moduleId === 'messages') {
    const unread = companyMessageUnreadCount(companyId);
    return unread || companyMessageConversations(companyId).length;
  }
  if (moduleId === 'time') return timeSummary(companyId).focus.length;
  if (moduleId === 'approvals') return approvalItems(companyId).length;
  if (moduleId === 'clock') return activeTimerForCompany(companyId) ? 'On' : '';
  return '';
}

function compactTabs(label, items) {
  return `
    <nav class="tabbar compact-tabbar" aria-label="${h(label)}">
      ${items.map(([path, text, active]) => `<a class="${active ? 'active' : ''}" href="${appHref(path)}" data-router>${h(text)}</a>`).join('')}
    </nav>
  `;
}

function renderWorkspace(route) {
  if (route.name === 'command') return renderCompanyDashboard(activeCompanyId());
  if (route.name !== 'company') return renderPlannedPage(route.name);
  const companyId = route.companyId;
  if (state.session?.auth === 'supabase' && !allowedCompanyIds().includes(companyId)) {
    return renderCompanyAccessDeniedPage(companyId);
  }
  const moduleMeta = MODULE_REGISTRY.find((module) => module.id === route.section);
  if (moduleMeta?.status !== 'planned') {
    if (!subscriptionAllowsCompany(companyId) && !['settings', 'users'].includes(route.section)) return renderSubscriptionBlockedPage(companyId);
    if (moduleMeta?.permission && !can(moduleMeta.permission, companyId)) return renderPermissionBlockedPage(companyId, moduleMeta.permission);
  }
  if (route.section === 'jobs') return renderJobsPage(route, companyId);
  if (route.section === 'tasks') return renderTasksPage(route, companyId);
  if (route.section === 'files') return renderFilesPage(route, companyId);
  if (route.section === 'users') return renderUsersPage(route, companyId);
  if (route.section === 'settings') return renderSettingsPage(route, companyId);
  if (route.section === 'forms') return renderFormsPage(companyId);
  if (route.section === 'analytics') return renderAnalyticsPage(route, companyId);
  if (route.section === 'crm') return renderCrmPage(route, companyId);
  if (route.section === 'finance') return renderFinancePage(route, companyId);
  if (route.section === 'messages') return renderMessagesPage(route, companyId);
  if (route.section === 'team-chart') return renderTeamChartPage(companyId);
  if (route.section === 'time' || route.section === 'approvals' || route.section === 'clock') return renderOperationsPage(route, companyId);
  return renderPlannedPage(route.section);
}

function renderSubscriptionBlockedPage(companyId) {
  return `
    ${workspaceHeader('Subscription required', 'This company workspace needs an active or trialing subscription before paid modules can open.', `
      <a class="btn btn-primary" href="${appHref(companyPath('settings', { tab: 'billing' }, companyId))}" data-router><i class="ti ti-credit-card"></i>Billing</a>
    `)}
    <section class="panel">
      ${contractRows([
        ['Company', companyName(companyId)],
        ['Subscription', subscriptionLabel(companyId)],
        ['Allowed area', 'Billing and settings remain available to owners/admins'],
      ])}
    </section>
  `;
}

function renderPermissionBlockedPage(companyId, permission) {
  return `
    ${workspaceHeader('Access denied', 'Your role does not include the permission required for this module.', `
      <a class="btn" href="${appHref(companyPath('settings', { tab: 'roles' }, companyId))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${contractRows([
        ['Company', companyName(companyId)],
        ['Required permission', permission],
        ['Your role', roleForCompany(companyId)],
      ])}
    </section>
  `;
}

function renderCompanyAccessDeniedPage(companyId) {
  return `
    ${workspaceHeader('Company access denied', 'This workspace is not in your active company memberships.', `
      <a class="btn" href="${appHref(companyPath('jobs', {}, activeCompanyId()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${appHref('/login?mode=request')}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${contractRows([
        ['Requested company', companyName(companyId)],
        ['Access rule', 'Active company membership required'],
        ['Your status', membershipForProfile(companyId, activeSession().profile.id)?.status ? titleCase(membershipForProfile(companyId, activeSession().profile.id).status) : 'No active membership'],
      ])}
    </section>
  `;
}

function renderCompanyDashboard(companyId) {
  const jobs = companyJobs(companyId);
  const tasks = companyTasks(companyId);
  const urgent = tasks.filter((task) => ['critical', 'urgent'].includes(task.priority));
  const files = companyFiles(companyId);
  return `
    ${workspaceHeader('Company dashboard', 'Live context for this company workspace.', `
      <a class="btn" href="${appHref(companyPath('files', {}, companyId))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${appHref(companyPath('jobs', {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${metricGrid([
      ['Jobs', jobs.length],
      ['Open tasks', tasks.filter((task) => task.status !== 'done').length],
      ['Urgent tasks', urgent.length],
      ['Drive files', files.length],
    ])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${appHref(companyPath('tasks', {}, companyId))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${tasks.slice(0, 6).map((task) => taskQueueRow(task)).join('') || emptyState('No tasks in this company yet.')}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${contractRows([
          ['Company', companyName(companyId)],
          ['Visible users', companyMembers(companyId).length],
          ['Auth mode', CONFIG.questAuthEnabled ? 'Supabase auth' : 'Local basic gate'],
          ['RLS status', CONFIG.questAuthEnabled ? 'Ready for enforcement' : 'Prepared, not enforced'],
        ])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${jobs.slice(0, 8).map((job) => jobQueueRow(job)).join('') || emptyState('No jobs in this company yet.')}
        </div>
      </article>
    </section>
  `;
}

function renderAnalyticsPage(route, companyId) {
  const scopedJob = route.jobId ? jobById(route.jobId) : null;
  const jobs = scopedJob ? [scopedJob] : companyJobs(companyId);
  const tasks = companyTasks(companyId).filter((task) => !scopedJob || task.project_id === scopedJob.id);
  const files = companyFiles(companyId).filter((file) => !scopedJob || file.job_id === scopedJob.id);
  const forms = companyForms(companyId).filter((form) => !scopedJob || form.linked_job_id === scopedJob.id);
  const openTasks = tasks.filter((task) => task.status !== 'done');
  const lateTasks = tasks.filter((task) => task.status !== 'done' && task.due && new Date(task.due) < startOfToday());
  const activeValue = sum(jobs, 'estimate_total');
  return `
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${h(scopedJob ? scopedJob.name : companyName(companyId))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${companyJobs(companyId).map((job) => `<option value="${h(job.id)}" ${scopedJob?.id === job.id ? 'selected' : ''}>${h(job.name)}</option>`).join('')}
          </select>
        </label>
        <a class="btn" href="${appHref(companyPath('jobs', scopedJob ? { tab: 'profile', job_id: scopedJob.id } : {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${h(openTasks.length)}</strong>
          <small>${h(lateTasks.length)} overdue / ${h(tasks.filter((task) => task.priority === 'urgent' || task.priority === 'critical').length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${h(money(activeValue))}</strong>
          <small>${h(jobs.length)} visible job${jobs.length === 1 ? '' : 's'}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${h(files.length + forms.length)}</strong>
          <small>${h(files.length)} files / ${h(forms.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${h(percent(tasks.filter((task) => task.status === 'done').length, tasks.length))}</strong>
          <small>${h(tasks.filter((task) => task.status === 'done').length)} done of ${h(tasks.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${jobs.map((job) => `
              <a class="analytics-row" href="${appHref(companyPath('analytics', { job_id: job.id }, companyId))}" data-router>
                <span><strong>${h(job.name)}</strong><small>${h(job.client_name || companyName(companyId))}</small></span>
                <span>${h(job.stage)}</span>
                <span>${h(taskCountForJob(job.id))}</span>
                <span>${h(fileCountForJob(job.id))}</span>
                <span>${h(money(job.estimate_total))}</span>
              </a>
            `).join('') || emptyState('No jobs to analyze yet.')}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${TASK_STATUSES.map((status) => {
              const count = tasks.filter((task) => task.status === status).length;
              return `<div><span>${h(statusLabel(status))}</span><b><i style="width:${h(percentNumber(count, tasks.length))}%"></i></b><strong>${h(count)}</strong></div>`;
            }).join('')}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${tasks
              .filter((task) => task.status !== 'done')
              .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
              .slice(0, 8)
              .map((task) => taskQueueRow(task))
              .join('') || emptyState('No open tasks in this scope.')}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderJobsPage(route, companyId) {
  const tab = normalizeJobTab(route.params.get('tab'));
  const job = selectedJob();
  return `
    ${workspaceHeader('Jobs', 'Company job records, clients, scope, and linked work.', `
      <a class="btn" href="${appHref(companyPath('files', job ? { job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${['all'].concat(STAGES).map((stage) => `<option value="${h(stage)}" ${state.stageFilter === stage ? 'selected' : ''}>${h(stage === 'all' ? 'All stages' : stage)}</option>`).join('')}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${job ? h(job.name) : 'No job selected'}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${JOB_TABS.map((item) => `<a class="${item === tab ? 'active' : ''}" href="${appHref(companyPath('jobs', { tab: item, ...(job ? { job_id: job.id } : {}) }, companyId))}" data-router>${h(labelForTab(item))}</a>`).join('')}
    </nav>
    ${renderJobPanel(tab, companyId, job)}
  `;
}

function renderJobPanel(tab, companyId, job) {
  if (tab === 'pipeline') return renderPipeline(companyId);
  if (tab === 'list') return renderJobList(companyId);
  if (tab === 'profile') return renderJobProfile(companyId, job);
  return renderPipeline(companyId);
}

function renderPipeline(companyId) {
  const visible = filteredJobs(companyId);
  return `
    <section class="job-board">
      ${STAGES.map((stage) => {
        const jobs = visible.filter((job) => job.stage === stage);
        return `
          <article class="job-lane">
            <h2><span>${h(stage)}</span><b>${jobs.length}</b></h2>
            ${jobs.map((job) => jobCard(job)).join('') || `<div class="lane-empty">No jobs</div>`}
          </article>
        `;
      }).join('')}
    </section>
  `;
}

function renderJobList(companyId) {
  const rows = filteredJobs(companyId);
  return `
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${rows.length} visible job${rows.length === 1 ? '' : 's'}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${rows.map((job) => `
          <button class="table-row ${job.id === state.selectedJobId ? 'active' : ''}" type="button" data-select-job="${h(job.id)}">
            <span><strong>${h(job.name)}</strong><small>${h(job.client_name || 'No client')} - ${h(job.site_address || 'No address')}</small></span>
            <span>${h(job.stage)}</span>
            <span>${priorityPill(job.priority)}</span>
            <span>${h(job.owner_name || 'Unassigned')}</span>
            <span>${h(taskCountForJob(job.id))}</span>
            <span>${money(job.estimate_total)}</span>
          </button>
        `).join('') || emptyState('No jobs match this view.')}
      </div>
    </section>
  `;
}

function renderJobProfile(companyId, job) {
  if (!job) return emptyState('Create a job to see the profile workspace.');
  return `
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${h(companyName(companyId))} - ${h(job.job_type)}</span>
          <h2>${h(job.name)}</h2>
          <p>${h(job.scope || 'No scope written yet.')}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${contractRows([
          ['Client', job.client_name || 'No client'],
          ['Contact', job.contact_name || 'No contact'],
          ['Owner', job.owner_name || 'Unassigned'],
          ['Stage', job.stage],
          ['Priority', job.priority],
          ['Estimate', money(job.estimate_total)],
        ])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${appHref(companyPath('tasks', { job_id: job.id }, companyId))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(job.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${miniLink(companyPath('tasks', { job_id: job.id }, companyId), 'ti-list-check', 'Tasks', `${taskCountForJob(job.id)} linked tasks`)}
          ${miniLink(companyPath('files', { job_id: job.id }, companyId), 'ti-folder', 'Files', `${fileCountForJob(job.id)} files`)}
          ${miniLink(companyPath('forms', { job_id: job.id }, companyId), 'ti-clipboard-list', 'Forms', 'Inspections and surveys')}
          ${miniLink(companyPath('analytics', { job_id: job.id }, companyId), 'ti-chart-bar', 'Dashboard', 'Job health')}
        </div>
      </article>
    </section>
  `;
}

function renderJobEditor(companyId, job) {
  const edit = job || blankJob(companyId);
  return `
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${h(edit.id || '')}" />
      <div class="section-head span-2">
        <div><h2>${job ? 'Edit job' : 'Create job'}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${field('Workspace name', 'name', edit.name, true)}
      ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
      ${field('Client', 'client_name', edit.client_name)}
      ${field('Contact', 'contact_name', edit.contact_name)}
      ${field('Account owner', 'owner_name', edit.owner_name)}
      ${field('Job type', 'job_type', edit.job_type || 'Roofing')}
      ${selectField('Business status', 'stage', edit.stage || 'Lead', STAGES.map((stage) => [stage, stage]))}
      ${selectField('Client urgency', 'priority', edit.priority || 'Medium', ['Low', 'Medium', 'High', 'Urgent'].map((item) => [item, item]))}
      ${field('Estimate total', 'estimate_total', edit.estimate_total || 0, false, 'number')}
      ${field('Invoice total', 'invoice_total', edit.invoice_total || 0, false, 'number')}
      ${field('Site address', 'site_address', edit.site_address, false, 'text', 'span-2')}
      ${textareaField('Scope', 'scope', edit.scope, 'span-2')}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${job ? `<button class="btn danger" type="button" data-action="delete-job" data-job-id="${h(job.id)}">Delete</button>` : ''}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;
}

function renderTasksPage(route, companyId) {
  const job = route.jobId ? jobById(route.jobId) : null;
  const tasks = filteredTasks(companyId, job?.id);
  return `
    ${workspaceHeader(job ? `${job.name} tasks` : 'Tasks', 'Native Quest task execution backed by the company task table.', `
      <a class="btn" href="${appHref(companyPath('jobs', job ? { tab: 'profile', job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${appHref(companyPath('tasks', { ...(job ? { job_id: job.id } : {}), new: '1' }, companyId))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${renderTaskToolbar(companyId, job)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${state.taskView === 'board' ? renderTaskBoard(companyId, tasks) : renderTaskTable(companyId, tasks)}
      </article>
    </section>
  `;
}

function renderTaskToolbar(companyId, job) {
  const jobs = companyJobs(companyId);
  return `
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${jobs.map((item) => `<option value="${h(item.id)}" ${job?.id === item.id ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${['all'].concat(TASK_STATUSES).map((status) => `<option value="${h(status)}" ${state.taskStatusFilter === status ? 'selected' : ''}>${h(status === 'all' ? 'All statuses' : statusLabel(status))}</option>`).join('')}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${['all'].concat(TASK_PRIORITIES).map((priority) => `<option value="${h(priority)}" ${state.taskPriorityFilter === priority ? 'selected' : ''}>${h(priority === 'all' ? 'All priorities' : titleCase(priority))}</option>`).join('')}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${state.taskView === 'table' ? 'active' : ''}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${state.taskView === 'board' ? 'active' : ''}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `;
}

function renderTaskTable(companyId, tasks) {
  return `
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${tasks.map((task) => `
        <button class="table-row ${task.id === state.selectedTaskId ? 'active' : ''}" type="button" data-select-task="${h(task.id)}">
          <span><strong>${h(task.title)}</strong><small>${h(task.description || taskTypeLabel(task.type))}</small></span>
          <span>${h(jobById(task.project_id)?.name || 'Company task')}</span>
          <span>${h(memberName(task.assignee_id))}</span>
          <span>${taskPriorityPill(task.priority)}</span>
          <span>${taskStatusPill(task.status)}</span>
          <span>${formatDate(task.due)}</span>
        </button>
      `).join('') || emptyState('No tasks match this workspace view.')}
    </div>
  `;
}

function renderTaskBoard(companyId, tasks) {
  return `
    <div class="task-board">
      ${TASK_STATUSES.map((status) => {
        const column = tasks.filter((task) => task.status === status);
        return `
          <section class="task-column">
            <h2><span>${h(statusLabel(status))}</span><b>${column.length}</b></h2>
            ${column.map((task) => `
              <button class="task-card priority-${h(task.priority)}" type="button" data-select-task="${h(task.id)}">
                <strong>${h(task.title)}</strong>
                <span>${h(jobById(task.project_id)?.name || companyName(companyId))}</span>
                <small>${h(memberName(task.assignee_id))} - ${formatDate(task.due)}</small>
              </button>
            `).join('') || `<div class="lane-empty">No tasks</div>`}
          </section>
        `;
      }).join('')}
    </div>
  `;
}

function renderTaskDetail(companyId, task) {
  if (!task) {
    return `
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${emptyState('No task selected.')}
    `;
  }
  return `
    <div class="section-head">
      <div><h2>${h(task.title)}</h2><p>${h(jobById(task.project_id)?.name || companyName(companyId))}</p></div>
      <a class="btn" href="${appHref(companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id, edit: '1' }, companyId))}" data-router>Edit</a>
    </div>
    ${contractRows([
      ['Status', statusLabel(task.status)],
      ['Priority', titleCase(task.priority)],
      ['Type', taskTypeLabel(task.type)],
      ['Assignee', memberName(task.assignee_id)],
      ['Due', formatDate(task.due)],
      ['Company ID', task.company_id],
      ['Project ID', task.project_id || 'Company-level task'],
    ])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${h(task.description || 'No description yet.')}</p>
    </div>
  `;
}

function renderTaskForm(companyId, job, task) {
  const edit = task || blankTask(companyId, job?.id || '');
  return `
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${h(task ? edit.id : '')}" />
      <div class="section-head">
        <div><h2>${task ? 'Edit task' : 'New task'}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${field('Task title', 'title', edit.title, true)}
      ${selectField('Job', 'project_id', edit.project_id || '', [['', 'Company-level task']].concat(companyJobs(companyId).map((item) => [item.id, item.name])))}
      ${selectField('Status', 'status', edit.status, TASK_STATUSES.map((item) => [item, statusLabel(item)]))}
      ${selectField('Priority', 'priority', edit.priority, TASK_PRIORITIES.map((item) => [item, titleCase(item)]))}
      ${selectField('Type', 'type', edit.type, TASK_TYPES.map((item) => [item, taskTypeLabel(item)]))}
      ${selectField('Assignee', 'assignee_id', edit.assignee_id, companyMembers(companyId).map((item) => [item.id, memberName(item.id)]))}
      ${field('Due date', 'due', edit.due || isoDate(1), true, 'date')}
      ${textareaField('Description', 'description', edit.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${task ? `<button class="btn danger" type="button" data-action="delete-task" data-task-id="${h(task.id)}">Delete</button>` : ''}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;
}

function renderFilesPage(route, companyId) {
  const folder = route.params.get('folder') || state.driveFolder || 'home';
  state.driveFolder = folder;
  const job = route.jobId ? jobById(route.jobId) : null;
  const files = filteredDriveFiles(companyId, folder, job?.id || '');
  return `
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${h(job ? job.name : 'Company Drive')}</strong>
              <small>${h(job ? `${job.client_name || companyName(companyId)} file workspace` : `${companyName(companyId)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${h(state.fileQuery)}" placeholder="Search drive" />
          </label>
          <div class="drive-actions">
            <button class="btn" type="button" data-action="open-folder-form"><i class="ti ti-folder-plus"></i>New folder</button>
            <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
            <button class="btn icon-only" type="button" data-action="refresh-data" title="Refresh" aria-label="Refresh"><i class="ti ti-refresh"></i></button>
          </div>
        </header>
        <div class="drive-shell drive-shell-compact">
          <div class="drive-main">
            <section class="drive-crumb-row">
              <nav class="breadcrumbs" aria-label="Drive location">
                <a href="${appHref(companyPath('files', {}, companyId))}" data-router>${h(companyName(companyId))}</a>
                ${folder !== 'home' ? driveBreadcrumbTrail(companyId, folder, job) : ''}
                ${job ? `<span>/</span><strong>${h(job.name)}</strong>` : ''}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${state.driveView === 'grid' ? 'active' : ''}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${state.driveView === 'list' ? 'active' : ''}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${renderDriveExplorer(companyId, folder, job, files)}
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderDriveExplorer(companyId, folder, job, files) {
  const folders = driveExplorerFolders(companyId, folder, job);
  const items = folders.map((item) => ({ kind: 'folder', ...item })).concat(files.map((file) => ({ kind: 'file', file })));
  const title = job ? job.name : folder === 'home' ? 'This folder' : folderLabel(folder);
  return `
    <section class="drive-section-title">
      <div><h3>${h(title)}</h3><span>${folders.length} folder${folders.length === 1 ? '' : 's'} / ${files.length} file${files.length === 1 ? '' : 's'}</span></div>
    </section>
    ${state.driveView === 'list' ? renderExplorerDetails(items) : renderExplorerIcons(items)}
  `;
}

function renderExplorerDetails(items) {
  return `
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${items.map((item) => item.kind === 'folder' ? renderFolderRow(item) : renderFileRow(item.file)).join('') || emptyState('This folder is empty.')}
    </div>
  `;
}

function renderExplorerIcons(items) {
  return `
    <section class="drive-folder-grid explorer-grid">
      ${items.map((item) => item.kind === 'folder' ? renderFolderTile(item) : renderFileTile(item.file)).join('') || emptyState('This folder is empty.')}
    </section>
  `;
}

function renderFolderTile(folder) {
  return `
    <a class="drive-folder-card explorer-folder" href="${h(folder.href)}" data-router>
      <span class="drive-folder-icon"><i class="ti ${h(folder.icon || 'ti-folder')}"></i></span>
      <strong>${h(folder.name)}</strong>
      <em>${h(folder.countLabel || '0 items')}</em>
    </a>
  `;
}

function renderFolderRow(folder) {
  return `
    <a class="explorer-row folder-row-live" href="${h(folder.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder"><i class="ti ${h(folder.icon || 'ti-folder')}"></i></span><strong>${h(folder.name)}</strong></span>
      <span>${h(folder.updatedLabel || '')}</span>
      <span>Folder</span>
      <span>${h(folder.countLabel || '')}</span>
    </a>
  `;
}

function renderFileRow(file) {
  return `
    <button type="button" class="explorer-row ${file.id === state.selectedFileId ? 'active' : ''}" data-action="select-file" data-file-id="${h(file.id)}" role="row">
      <span class="explorer-name">${fileTypeBadge(file)}<strong>${h(file.file_name)}</strong></span>
      <span>${formatDate(file.updated_at || file.created_at)}</span>
      <span>${h(fileTypeLabel(file))}</span>
      <span>${formatBytes(file.size_bytes)}</span>
    </button>
  `;
}

function fileTypeBadge(file) {
  return `
    <span class="file-type ${h(fileTypeClass(file))}">
      <i class="ti ${h(fileIcon(file))}"></i>
      <small>${h(fileTypeShortLabel(file))}</small>
    </span>
  `;
}

function renderFileTile(file) {
  return `
    <button type="button" class="file-card-live ${file.id === state.selectedFileId ? 'active' : ''}" data-action="select-file" data-file-id="${h(file.id)}">
      <span class="file-thumb">${fileThumb(file)}</span>
      <strong>${h(file.file_name)}</strong>
      <span>${h(fileTypeLabel(file))} / ${formatBytes(file.size_bytes)}</span>
    </button>
  `;
}

function renderFileDetails(file, companyId) {
  if (!file) {
    return `
      <div class="file-detail-preview"><span class="file-doc-icon"><i class="ti ti-folder-open"></i></span></div>
      <h3>${h(companyName(companyId))} Drive</h3>
      <p>Pick a file to see metadata, job context, storage path, and actions.</p>
      <div class="file-detail-list">
        ${detailRow('Company folders', DRIVE_FOLDERS.length)}
        ${detailRow('Job folders', companyJobs(companyId).length)}
        ${detailRow('Visible files', filteredDriveFiles(companyId, state.driveFolder).length)}
      </div>
    `;
  }
  return `
    <div class="file-detail-preview">${fileThumb(file, true)}</div>
    <h3>${h(file.file_name)}</h3>
    <p>${h(file.notes || jobById(file.job_id)?.name || folderLabel(file.folder))}</p>
    <div class="file-detail-list">
      ${detailRow('Category', file.category || folderLabel(file.folder))}
      ${detailRow('Job', jobById(file.job_id)?.name || 'Company shared')}
      ${detailRow('Uploaded by', file.uploaded_by_label || 'Quest HQ')}
      ${detailRow('Uploaded', formatDate(file.created_at))}
      ${detailRow('Size', formatBytes(file.size_bytes))}
      ${detailRow('Storage path', file.object_path || 'Metadata only')}
    </div>
    <div class="file-detail-actions">
      <button class="btn" type="button" data-action="download-file" data-file-id="${h(file.id)}"><i class="ti ti-download"></i>Download</button>
      <button class="btn danger" type="button" data-action="delete-file" data-file-id="${h(file.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `;
}

function renderFileViewer(file, companyId) {
  return `
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${renderFilePreview(file)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${fileThumb(file)}
          <div>
            <strong>${h(file.file_name)}</strong>
            <span>${h(fileTypeLabel(file))} / ${formatBytes(file.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${detailRow('Location', folderLabel(file.folder))}
          ${detailRow('Job', jobById(file.job_id)?.name || 'Company shared')}
          ${detailRow('Uploaded by', file.uploaded_by_label || 'Quest HQ')}
          ${detailRow('Modified', formatDate(file.updated_at || file.created_at))}
          ${detailRow('Storage', file.object_path || 'Metadata only')}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${h(file.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn danger" type="button" data-action="delete-file" data-file-id="${h(file.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      </aside>
    </section>
  `;
}

function renderFilePreview(file) {
  const type = fileTypeClass(file);
  if (file.signed_url && type === 'image') return `<img class="file-preview-media" src="${h(file.signed_url)}" alt="" />`;
  if (file.signed_url && type === 'pdf') return `<iframe class="file-preview-frame" src="${h(file.signed_url)}" title="${h(file.file_name)}"></iframe>`;
  if (file.signed_url && type === 'text') return `<iframe class="file-preview-frame text" src="${h(file.signed_url)}" title="${h(file.file_name)}"></iframe>`;
  if (['doc', 'sheet'].includes(type) && file.signed_url) {
    return `<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.signed_url)}" title="${h(file.file_name)}"></iframe>`;
  }
  return `
    <div class="file-preview-empty">
      ${fileThumb(file, true)}
      <strong>${h(fileTypeLabel(file))} preview</strong>
      <p>${h(file.object_path ? 'Preview will load when a signed file URL is available.' : 'This is a metadata-only file record. Upload the actual file object to preview it here.')}</p>
      ${file.notes ? `<pre>${h(file.notes)}</pre>` : ''}
    </div>
  `;
}

function renderNewFolderModal() {
  const companyId = activeCompanyId();
  const route = state.route || getRoute();
  const folder = route.params.get('folder') || state.driveFolder || 'home';
  const job = route.jobId ? jobById(route.jobId) : null;
  return renderModalShell('Drive', 'New folder', `
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${h(companyId)}" />
      <input type="hidden" name="parent_key" value="${h(driveParentKey(folder, job))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${h(folder === 'home' ? companyName(companyId) : job?.name || folderLabel(folder))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'task-modal');
}

function renderFileUploadModal() {
  const companyId = activeCompanyId();
  const folder = state.route?.params?.get('folder') || (state.driveFolder === 'home' ? 'shared' : state.driveFolder);
  const jobId = state.route?.jobId || '';
  return `
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${h(companyName(companyId))} Drive</div><h2 id="upload-title">Upload files</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="file-upload-panel" data-file-form>
          <div class="file-policy-note span-2">
            <strong>Company-scoped storage</strong>
            <span>Files are written under the active company. If Supabase Storage is blocked by policy, Quest keeps the file record locally instead of losing the entry.</span>
          </div>
          <label class="span-2">
            <span>Files</span>
            <input name="files" type="file" multiple />
          </label>
          ${field('Metadata-only file name', 'file_name', '')}
          ${selectField('Folder', 'folder', folder, driveFolderOptions(companyId))}
          ${selectField('Job', 'job_id', jobId, [['', 'Company shared file']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
          ${selectField('Category', 'category', folderLabel(folder), FILE_CATEGORIES.filter((item) => item !== 'All categories').map((item) => [item, item]))}
          ${field('Uploaded by', 'uploaded_by_label', activeSession().profile.full_name || 'Quest HQ')}
          ${textareaField('Notes', 'notes', '', 'span-2')}
          <div class="form-actions span-2">
            <button class="btn btn-primary" type="submit">Upload to drive</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
            <button class="btn" type="reset">Clear</button>
          </div>
          <div class="file-upload-log span-2">
            <strong>Upload target</strong>
            <span>${h(companyId)}/${h(jobId ? `jobs/${jobId}` : folder)}</span>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderUsersPage(route, companyId) {
  const users = companyAccessUsers(companyId);
  const tab = ['members', 'access'].includes(route.params.get('tab')) ? route.params.get('tab') : 'members';
  const pendingRequests = state.joinRequests.filter((item) => item.company_id === companyId && item.status === 'pending');
  const canManageUsers = can('users.manage', companyId);
  const activeUsers = users.filter((user) => user.status === 'active');
  const inactiveUsers = users.filter((user) => user.status !== 'active');
  return `
    ${workspaceHeader('Users', 'Company members, roles, workers, and access context.', `
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${appHref(companyPath('settings', { tab: 'roles' }, companyId))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${appHref(companyPath('settings', { tab: 'access' }, companyId))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${compactTabs('Users sections', [
      [companyPath('users', { tab: 'members' }, companyId), 'Members', tab === 'members'],
      [companyPath('users', { tab: 'access' }, companyId), 'Access', tab === 'access'],
    ])}
    ${tab === 'members' ? `
      <section class="metric-grid operations-metrics">
        ${metricCard('Active users', activeUsers.length)}
        ${metricCard('Pending', users.filter((user) => user.status === 'pending').length + pendingRequests.length)}
        ${metricCard('Disabled/left', inactiveUsers.filter((user) => user.status !== 'pending').length)}
        ${metricCard('Roles', companyRoles(companyId).length)}
      </section>
      <section class="users-grid">
        ${users.map((user) => `
          <article class="user-card ${user.status !== 'active' ? 'muted' : ''}">
            ${renderAvatar({ full_name: userDisplayName(user), email: user.email, avatar_url: user.avatar_url }, 'avatar')}
            <div>
              <strong>${h(userDisplayName(user))}</strong>
              <span>${h(userDisplayMeta(user))}</span>
              <small>${h(user.role_label)} / ${h(titleCase(user.status))}</small>
            </div>
          </article>
        `).join('') || emptyState('No users assigned to this company yet.')}
      </section>
    ` : `
    <section class="dashboard-grid compact-settings-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Member access</h2><p>Assign roles and confirm each user's company status.</p></div>
        </div>
        <div class="access-user-list">
          ${users.map((user) => renderUserAccessRow(companyId, user, canManageUsers)).join('') || emptyState('No users assigned to this company yet.')}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${companyInvites(companyId).map((invite) => renderInviteRow(invite, canManageUsers)).join('') || emptyState('No pending invites.')}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${pendingRequests.map((request) => renderJoinRequestRow(request, canManageUsers)).join('') || emptyState('No pending join requests.')}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${contractRows([
          ['Tenant key', 'company_id on jobs, tasks, files, forms, users, settings'],
          ['Privacy status', CONFIG.questAuthEnabled ? 'Supabase Auth + RLS' : 'Client-filtered demo only'],
          ['Your role', roleForCompany(companyId)],
          ['Can manage users', canManageUsers ? 'Yes' : 'No'],
        ])}
      </article>
    </section>
    `}
  `;
}

function renderUserAccessRow(companyId, user, canManageUsers) {
  const roles = companyRoles(companyId);
  const selectedRoleId = user.role_id || roleIdForName(companyId, user.role) || roles[0]?.id || '';
  const isProtectedOwner = user.profile_id && isLastActiveOwner(companyId, user.profile_id);
  const canEditUser = canManageUsers && user.profile_id && !isProtectedOwner;
  return `
    <article class="access-user-row ${user.status !== 'active' ? 'muted' : ''}">
      ${renderAvatar({ full_name: userDisplayName(user), email: user.email, avatar_url: user.avatar_url }, 'avatar')}
      <div class="access-user-main">
        <strong>${h(userDisplayName(user))}</strong>
        <span>${h(userDisplayMeta(user))} / ${h(titleCase(user.status))}</span>
        ${isProtectedOwner ? '<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>' : ''}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${h(companyId)}" />
        <input type="hidden" name="profile_id" value="${h(user.profile_id)}" />
        <select name="role_id" ${canEditUser ? '' : 'disabled'}>
          ${roles.map((role) => `<option value="${h(role.id)}" ${role.id === selectedRoleId ? 'selected' : ''}>${h(role.name)}</option>`).join('')}
        </select>
        <select name="membership_status" ${canEditUser ? '' : 'disabled'}>
          ${['active', 'pending', 'disabled', 'left'].map((status) => `<option value="${h(status)}" ${status === user.status ? 'selected' : ''}>${h(titleCase(status))}</option>`).join('')}
        </select>
        <button class="btn" type="submit" ${canEditUser ? '' : 'disabled'}>Save</button>
      </form>
    </article>
  `;
}

function renderJoinRequestRow(request, canManageUsers) {
  const title = request.requested_email || profileById(request.profile_id)?.email || request.profile_id || 'Requester';
  return `
    <article class="access-request-row">
      <div>
        <strong>${h(title)}</strong>
        <span>${h(request.message || 'Access request')} / ${formatDate(request.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${h(request.id)}" ${canManageUsers ? '' : 'disabled'}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${h(request.id)}" ${canManageUsers ? '' : 'disabled'}>Reject</button>
      </div>
    </article>
  `;
}

function renderInviteRow(invite, canManageUsers) {
  const role = roleById(invite.company_id, invite.role_id);
  const expired = invite.expires_at && Date.parse(invite.expires_at) < Date.now();
  return `
    <article class="access-invite-row ${expired ? 'muted' : ''}">
      <div>
        <strong>${h(invite.email)}</strong>
        <span>${h(role?.name || 'Member')} / ${expired ? 'Expired' : `Expires ${formatDate(invite.expires_at)}`}</span>
        ${invite.token ? `<code class="invite-code">${h(invite.token)}</code>` : ''}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${h(invite.id)}" ${canManageUsers && invite.token ? '' : 'disabled'}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${h(invite.id)}" ${canManageUsers && invite.token ? '' : 'disabled'}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${h(invite.id)}" ${canManageUsers ? '' : 'disabled'}>Revoke</button>
      </div>
    </article>
  `;
}

function userDisplayName(user) {
  const rawName = String(user.name || '').trim();
  const rawEmail = String(user.email || '').trim();
  if (rawName && !isOpaqueUserId(rawName)) return rawName;
  if (rawEmail && !isOpaqueUserId(rawEmail)) return rawEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const role = String(user.role || '').toLowerCase();
  if (role === 'owner') return 'Workspace owner';
  if (role === 'admin') return 'Workspace admin';
  if (role === 'developer') return 'Developer';
  return `${user.role_label || 'Workspace'} user`;
}

function userDisplayMeta(user) {
  const email = String(user.email || '').trim();
  if (email && !isOpaqueUserId(email)) return email;
  const id = String(user.profile_id || user.member_id || '').trim();
  return id ? `ID ${shortUserId(id)}` : 'No email on profile';
}

function renderTeamChartPage(companyId) {
  const members = companyMembers(companyId);
  const roots = members.filter((member) => !member.supervisor_id || !members.some((item) => item.id === member.supervisor_id));
  return `
    <section class="tool-page team-chart-page">
      ${workspaceHeader('Team chart', 'Reporting lines, roles, and company coverage for this workspace.', `
        <a class="btn" href="${appHref(companyPath('users', {}, companyId))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${appHref(companyPath('settings', { tab: 'team' }, companyId))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${metricCard('Members', members.length)}
        ${metricCard('Leads', roots.length)}
        ${metricCard('Open tasks', companyTasks(companyId).filter(isOpenTask).length)}
        ${metricCard('Active timer', activeTimerForCompany(companyId) ? 'Yes' : 'No')}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${roots.map((member) => renderTeamNode(companyId, member, members)).join('') || emptyState('No workers assigned.')}
        </div>
      </section>
    </section>
  `;
}

function renderTeamNode(companyId, member, members, depth = 0) {
  const reports = members.filter((item) => item.supervisor_id === member.id);
  return `
    <article class="team-node" style="--depth:${depth}">
      <div class="team-node-card">
        ${renderAvatar({ full_name: member.full_name, avatar_url: member.avatar_url }, 'avatar')}
        <span><strong>${h(member.full_name)}</strong><small>${h(roleForMember(companyId, member.id))}</small></span>
        <b>${companyTasks(companyId).filter((task) => task.assignee_id === member.id && isOpenTask(task)).length} open</b>
      </div>
      ${reports.length ? `<div class="team-node-children">${reports.map((report) => renderTeamNode(companyId, report, members, depth + 1)).join('')}</div>` : ''}
    </article>
  `;
}

function renderSettingsPage(route, companyId) {
  const company = companyById(companyId);
  const tab = ['company', 'billing', 'roles', 'access', 'team'].includes(route.params.get('tab')) ? route.params.get('tab') : 'company';
  return `
    ${workspaceHeader('Settings', 'Company settings, roles, approvals, and admin controls.', '')}
    ${compactTabs('Settings sections', [
      [companyPath('settings', { tab: 'company' }, companyId), 'Company', tab === 'company'],
      [companyPath('settings', { tab: 'billing' }, companyId), 'Billing', tab === 'billing'],
      [companyPath('settings', { tab: 'roles' }, companyId), 'Roles', tab === 'roles'],
      [companyPath('settings', { tab: 'access' }, companyId), 'Access', tab === 'access'],
      [companyPath('settings', { tab: 'team' }, companyId), 'Workers', tab === 'team'],
    ])}
    <section class="dashboard-grid compact-settings-grid">
      ${tab === 'company' ? `
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${contractRows([
          ['Name', companyName(companyId)],
          ['Company ID', companyId],
          ['Color', company?.color || companyColor(companyId)],
          ['Visible jobs', companyJobs(companyId).length],
        ])}
      </article>
      ` : ''}
      ${tab === 'billing' ? renderBillingSettings(companyId) : ''}
      ${tab === 'roles' ? renderRolesSettings(companyId) : ''}
      ${tab === 'access' ? `
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${contractRows([
          ['Auth switch', CONFIG.questAuthEnabled ? 'Enabled' : 'Disabled'],
          ['Local login', CONFIG.localLoginEnabled ? 'Enabled' : 'Disabled'],
          ['Isolation', CONFIG.questAuthEnabled ? 'Server-enforced when migration is applied' : 'Client-filtered only'],
          ['Active memberships', String(state.memberships.filter((item) => item.company_id === companyId && item.status === 'active').length)],
          ['Disabled/left', String(state.memberships.filter((item) => item.company_id === companyId && ['disabled', 'left'].includes(item.status)).length)],
          ['Invites', String(state.companyInvites.filter((item) => item.company_id === companyId && item.status === 'pending').length)],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${state.joinRequests.filter((item) => item.company_id === companyId).map((request) => compactFinanceRow(request.requested_email || request.profile_id, request.message || 'Access request', titleCase(request.status), request.created_at)).join('') || emptyState('No pending company approvals.')}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${companyAuditEvents(companyId).slice(0, 8).map(renderAuditEventRow).join('') || emptyState('No access audit events yet.')}
        </div>
      </article>
      ` : ''}
      ${tab === 'team' ? `
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${companyMembers(companyId).map((member) => `<div><strong>${h(member.full_name)}</strong><span>${h(roleForMember(companyId, member.id))}</span></div>`).join('') || emptyState('No workers assigned.')}
        </div>
      </article>
      ` : ''}
    </section>
  `;
}

function renderBillingSettings(companyId) {
  const subscription = companySubscription(companyId);
  return `
    <article class="panel">
      <div class="section-head">
        <div><h2>Subscription</h2><p>$300/month company workspace billing gate.</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout"><i class="ti ti-credit-card"></i>Start subscription</button>
      </div>
      ${contractRows([
        ['Plan', '$300/month company workspace'],
        ['Status', subscriptionLabel(companyId)],
        ['Stripe customer', subscription?.stripe_customer_id || 'Not connected'],
        ['Renewal / trial', subscription?.current_period_end || subscription?.trial_ends_at ? formatDate(subscription.current_period_end || subscription.trial_ends_at) : 'Pending'],
      ])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules remain available only for trialing, active, past_due, or grace status.</p></div></div>
      ${contractRows([
        ['Workspace access', subscriptionAllowsCompany(companyId) ? 'Allowed' : 'Suspended'],
        ['Finance/files privacy', CONFIG.questAuthEnabled ? 'Requires Auth + RLS' : 'Demo only'],
        ['Seat billing', 'Tracked later; not charged in v1'],
      ])}
    </article>
  `;
}

function renderRolesSettings(companyId) {
  const roles = companyRoles(companyId);
  const previewRole = rolePreviewForCompany(companyId);
  return `
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${roles.map((role) => {
          const permissionCount = state.rolePermissions.filter((item) => item.role_id === role.id && item.effect === 'allow').length;
          const userCount = state.roleAssignments.filter((item) => item.company_id === companyId && item.role_id === role.id).length;
          const viewing = previewRole?.id === role.id;
          return `
            <article class="role-row" style="--role-color:${h(role.color)}">
              <span></span>
              <div><strong>${h(role.name)}</strong><small>${permissionCount || 'All'} permissions / ${userCount} users / priority ${role.priority}</small></div>
              <div class="role-row-actions">
                <b>${role.is_system ? 'System' : 'Custom'}</b>
                <button class="btn" type="button" data-action="view-as-role" data-role-id="${h(role.id)}" ${viewing ? 'disabled' : ''}>
                  <i class="ti ${viewing ? 'ti-eye-check' : 'ti-eye'}"></i>${viewing ? 'Viewing' : 'View as role'}
                </button>
              </div>
            </article>
          `;
        }).join('') || emptyState('No custom roles yet.')}
      </div>
    </article>
    <article class="panel">
      ${previewRole ? renderRoleAccessPreview(companyId, previewRole) : `
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${emptyState('No role preview selected.')}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${state.fieldPermissions.filter((item) => item.company_id === companyId).map((rule) => compactFinanceRow(rule.field_key, rule.resource_type, rule.visibility, '')).join('') || emptyState('No field permission overrides yet.')}
      </div>
    </article>
  `;
}

function renderRoleAccessPreview(companyId, role) {
  const liveModules = MODULE_REGISTRY.filter((module) => module.status === 'live');
  const allowedModules = liveModules.filter((module) => roleAllowsPermission(role, module.permission || `${module.id}.view`));
  const deniedModules = liveModules.filter((module) => !roleAllowsPermission(role, module.permission || `${module.id}.view`));
  return `
    <div class="section-head">
      <div><h2>Access preview</h2><p>${h(role.name)} sees ${allowedModules.length} of ${liveModules.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${contractRows([
      ['Preview role', role.name],
      ['Allowed modules', allowedModules.map((module) => module.label).join(', ') || 'None'],
      ['Hidden modules', deniedModules.map((module) => module.label).join(', ') || 'None'],
    ])}
  `;
}

function renderRoleFormModal(companyId) {
  return renderModalShell('Settings', 'New role', `
    <form class="role-form" data-role-form>
      ${field('Role name', 'name', '')}
      ${field('Color', 'color', '#f0b23b', false, 'color')}
      ${field('Priority', 'priority', '100', false, 'number')}
      <div class="permission-grid span-2">
        ${PERMISSION_KEYS.map(([key, label]) => `
          <label><input type="checkbox" name="permissions" value="${h(key)}" /> <span>${h(label)}</span></label>
        `).join('')}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-modal');
}

function renderInviteFormModal(companyId) {
  const roles = companyRoles(companyId).filter((role) => role.name.toLowerCase() !== 'owner');
  const options = [['', 'Member']].concat(roles.map((role) => [role.id, role.name]));
  return renderModalShell('Users', 'Invite user', `
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${h(companyId)}" />
      ${field('Email', 'email', '', true, 'email')}
      ${selectField('Role', 'role_id', defaultInviteRoleId(companyId), options)}
      <div class="form-message span-2">Quest creates an invite code you can copy. Email delivery comes after the Resend/SMTP setup.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-modal');
}

function renderFormsPage(companyId) {
  const forms = filteredForms(companyId);
  const current = selectedForm(companyId);
  const activeTab = state.formsTab === 'builder' && current ? 'builder' : state.formsTab === 'responses' ? 'responses' : 'library';
  return `
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <label>
          <span>Search</span>
          <input data-form-search value="${h(state.formQuery)}" placeholder="Find form, audience, or job" />
        </label>
        <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      ${activeTab === 'builder' ? '' : `
        <nav class="tabbar forms-tabs" aria-label="Forms workspace">
          ${['library', 'responses'].map((tab) => `
            <button class="${activeTab === tab ? 'active' : ''}" type="button" data-action="set-forms-tab" data-tab="${h(tab)}">${h(titleCase(tab))}</button>
          `).join('')}
        </nav>
      `}
      ${activeTab === 'library' ? renderFormsLibrary(companyId, forms, current) : ''}
      ${activeTab === 'builder' ? renderFormsBuilder(companyId, current) : ''}
      ${activeTab === 'responses' ? renderFormsResponses(companyId, current) : ''}
    </section>
  `;
}

function renderFormsLibrary(companyId, forms, current) {
  return `
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${forms.length} visible form${forms.length === 1 ? '' : 's'} in ${h(companyName(companyId))}</span>
          </div>
        </div>
        <div class="forms-list forms-list-cards">
          ${forms.map((form) => `
            <article class="form-card ${state.expandedFormIds.has(form.id) ? 'expanded' : ''} ${current?.id === form.id ? 'active' : ''}">
              <span class="form-card-top">
                <i class="ti ti-clipboard-list"></i>
              </span>
              <span class="form-card-main">
                <strong>${h(form.title)}</strong>
                <span>Created by ${h(formCreatorLabel(form))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${h(form.id)}" aria-expanded="${state.expandedFormIds.has(form.id) ? 'true' : 'false'}">
                <i class="ti ${state.expandedFormIds.has(form.id) ? 'ti-chevron-up' : 'ti-chevron-down'}"></i>
                ${state.expandedFormIds.has(form.id) ? 'Less' : 'Details'}
              </button>
              <span class="form-card-meta">
                <small>${h(form.type)} / ${h(form.audience || 'Internal')}</small>
                <small>${formQuestionCount(form)} questions</small>
                <em>${responsesForForm(form.id).length} responses</em>
                <em>Updated ${formatDate(form.updated_at)}</em>
                <em>${h(form.status)}</em>
              </span>
              ${state.expandedFormIds.has(form.id) ? `
                <div class="form-card-detail">
                  <p>${h(form.description || 'No description yet.')}</p>
                  <div class="form-actions">
                    <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${h(form.id)}"><i class="ti ti-pencil"></i>Open builder</button>
                    <button class="btn" type="button" data-action="open-form-preview" data-form-id="${h(form.id)}"><i class="ti ti-eye"></i>Preview</button>
                  </div>
                </div>
              ` : ''}
            </article>
          `).join('') || emptyState('No forms match this company view.')}
        </div>
      </article>
    </section>
  `;
}

function renderFormsBuilder(companyId, form) {
  if (!form) {
    return `
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${emptyState('Create a form or choose a template to open the builder.')}
      </section>
    `;
  }
  const mode = ['questions', 'responses', 'settings'].includes(state.formEditorTab) ? state.formEditorTab : 'questions';
  return `
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${h(mode)}">
      ${renderFormEditorTabs(form, mode)}
      ${mode === 'questions' ? `
        ${renderFormIdentityPanel(companyId, form)}
        ${renderQuestionWorkbench(form)}
      ` : ''}
      ${mode === 'settings' ? `
        <article class="panel form-settings-panel forms-settings-wide">
          ${renderFormSettingsEditor(companyId, form)}
        </article>
      ` : ''}
      ${mode === 'responses' ? renderFormResponseEditor(companyId, form) : ''}
    </section>
  `;
}

function renderFormEditorTabs(form, mode) {
  const responses = responsesForForm(form.id);
  return `
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${h(form.title)}</strong>
        <span>${h(form.status)} / ${formQuestionCount(form)} questions / ${responses.length} responses</span>
      </div>
      ${['questions', 'responses', 'settings'].map((tab) => `
        <button class="${mode === tab ? 'active' : ''}" type="button" data-action="set-form-editor-tab" data-tab="${h(tab)}">
          ${tab === 'questions' ? '<i class="ti ti-list-details"></i>' : tab === 'responses' ? '<i class="ti ti-inbox"></i>' : '<i class="ti ti-settings"></i>'}
          ${h(titleCase(tab))}
        </button>
      `).join('')}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${h(form.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${h(form.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${h(form.id)}">Save</button>
    </div>
  `;
}

function renderFormIdentityPanel(companyId, form) {
  return `
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${h(form.theme_color || companyColor(companyId))}"></div>
      ${formInput('Form title', 'title', form.title, true)}
      ${formTextarea('Form description', 'description', form.description)}
      <div class="forms-simple-meta">
        <span>${h(form.status)}</span>
        <span>${h(form.type)}</span>
        <span>${h(form.audience || 'Internal')}</span>
        <span>${h(jobById(form.linked_job_id)?.name || 'Company level')}</span>
        <span>${h(companyName(companyId))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${h(form.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${h(form.id)}">Publish</button>
      </div>
    </article>
  `;
}

function renderQuestionWorkbench(form) {
  return `
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${QUESTION_TYPES.map(([type, label]) => `<button type="button" data-action="add-question" data-question-type="${h(type)}" title="${h(label)}" aria-label="Add ${h(label)} question"><i class="ti ${h(questionTypeIcon(type))}"></i></button>`).join('')}
        </div>
        <div class="question-list">
          ${form.questions.map((question, index) => renderQuestionCard(question, index)).join('') || emptyState('Add the first question.')}
        </div>
      </div>
    </article>
  `;
}

function renderFormSettingsEditor(companyId, form) {
  return `
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${formInput('Title', 'title', form.title, true)}
      ${formSelect('Status', 'status', form.status, FORM_STATUSES.map((status) => [status, status]))}
      ${formTextarea('Description', 'description', form.description)}
      ${formSelect('Type', 'type', form.type, FORM_TYPES.map((type) => [type, type]))}
      ${formInput('Audience', 'audience', form.audience)}
      ${formSelect('Linked job', 'linked_job_id', form.linked_job_id || '', [['', 'Company level']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
      ${formInput('Theme color', 'theme_color', form.theme_color || companyColor(companyId), false, 'color')}
      ${formSelect('Background', 'background', form.background || 'clean', [['clean', 'Clean'], ['paper', 'Paper'], ['grid', 'Grid'], ['dark', 'Dark']])}
      ${formInput('Submit button', 'submit_label', form.submit_label || 'Submit')}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${form.collect_email ? 'checked' : ''} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${form.require_approval ? 'checked' : ''} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${h(form.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${h(form.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${h(form.id)}">Delete</button>
    </div>
  `;
}

function renderFormResponseEditor(companyId, form) {
  const responses = responsesForForm(form.id);
  const selected = responses[0] || null;
  return `
    <article class="panel response-list-panel forms-response-editor">
      <div class="section-head">
        <div><h2>Response inbox</h2><p>${responses.length} captured response${responses.length === 1 ? '' : 's'} for this form.</p></div>
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="questions"><i class="ti ti-list-details"></i>Questions</button>
      </div>
      <div class="response-list">
        ${responses.map((response) => `
          <button type="button" class="response-card">
            <strong>${h(response.submitted_by || response.submitter_email || 'Anonymous')}</strong>
            <span>${h(form.title)}</span>
            <small>${formatDate(response.created_at)}</small>
          </button>
        `).join('') || emptyState('No responses yet. Submit a preview response from the builder.')}
      </div>
    </article>
    <aside class="panel response-detail">
      ${selected ? renderResponseDetail(selected) : emptyState('No response selected.')}
    </aside>
  `;
}

function renderQuestionCard(question, index) {
  const typeOptions = QUESTION_TYPES.map(([id, label]) => `<option value="${h(id)}" ${question.type === id ? 'selected' : ''}>${h(label)}</option>`).join('');
  return `
    <article class="question-card ${state.selectedQuestionId === question.id ? 'active' : ''}" data-question-id="${h(question.id)}">
      <div class="question-card-head">
        <span>${index + 1}</span>
        <select data-question-field="type">${typeOptions}</select>
        <div class="question-actions">
          <button type="button" data-action="move-question" data-direction="-1" data-question-id="${h(question.id)}"><i class="ti ti-arrow-up"></i></button>
          <button type="button" data-action="move-question" data-direction="1" data-question-id="${h(question.id)}"><i class="ti ti-arrow-down"></i></button>
          <button type="button" data-action="duplicate-question" data-question-id="${h(question.id)}"><i class="ti ti-copy"></i></button>
          <button type="button" data-action="delete-question" data-question-id="${h(question.id)}"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <label><span>Question</span><input data-question-field="label" value="${h(question.label)}" /></label>
      <label><span>Help text</span><input data-question-field="help" value="${h(question.help || '')}" /></label>
      <label class="check-row"><input type="checkbox" data-question-field="required" ${question.required ? 'checked' : ''} /> Required</label>
      ${questionHasOptions(question) ? `
        <div class="question-options">
          ${(question.options || []).map((option, optionIndex) => `
            <label>
              <span>Option ${optionIndex + 1}</span>
              <input data-question-option="${optionIndex}" value="${h(option)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${h(question.id)}" data-option-index="${optionIndex}"><i class="ti ti-x"></i></button>
            </label>
          `).join('')}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${h(question.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      ` : ''}
    </article>
  `;
}

function renderFormPreview(companyId, form) {
  return `
    <form class="response-form" data-form-preview-response data-form-id="${h(form.id)}" style="--form-accent:${h(form.theme_color || companyColor(companyId))}">
      <div class="designed-form-header">
        <span>${h(companyName(companyId))}</span>
        <h2>${h(form.title)}</h2>
        <p>${h(form.description || 'Preview this form before sending it out.')}</p>
      </div>
      ${form.collect_email ? `<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>` : ''}
      ${form.questions.map((question) => renderPreviewQuestion(question)).join('') || emptyState('No questions yet.')}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${h(form.submit_label || 'Submit')}</button>
      </div>
    </form>
  `;
}

function renderPreviewQuestion(question) {
  const name = `answer:${question.id}`;
  const required = question.required ? 'required' : '';
  if (question.type === 'paragraph') return previewWrap(question, `<textarea name="${h(name)}" rows="3" ${required}></textarea>`);
  if (question.type === 'date') return previewWrap(question, `<input name="${h(name)}" type="date" ${required} />`);
  if (question.type === 'file') return previewWrap(question, `<input name="${h(name)}" type="file" ${required} />`);
  if (question.type === 'yesno') return previewWrap(question, `<select name="${h(name)}" ${required}><option value="">Choose</option><option>Yes</option><option>No</option></select>`);
  if (question.type === 'rating') return previewWrap(question, `<input name="${h(name)}" type="range" min="1" max="5" value="3" ${required} />`);
  if (question.type === 'dropdown') {
    return previewWrap(question, `<select name="${h(name)}" ${required}><option value="">Choose</option>${(question.options || []).map((option) => `<option>${h(option)}</option>`).join('')}</select>`);
  }
  if (question.type === 'checkbox') {
    return previewWrap(question, `<div class="choice-stack">${(question.options || []).map((option) => `<label><input name="${h(name)}" type="checkbox" value="${h(option)}" /> ${h(option)}</label>`).join('')}</div>`);
  }
  if (question.type === 'multiple') {
    return previewWrap(question, `<div class="choice-stack">${(question.options || []).map((option) => `<label><input name="${h(name)}" type="radio" value="${h(option)}" ${required} /> ${h(option)}</label>`).join('')}</div>`);
  }
  return previewWrap(question, `<input name="${h(name)}" ${required} />`);
}

function renderFormsResponses(companyId, form) {
  const responses = form ? responsesForForm(form.id) : companyFormResponses(companyId);
  const selected = responses[0] || null;
  return `
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${responses.length} response${responses.length === 1 ? '' : 's'}</p></div></div>
        <div class="response-list">
          ${responses.map((response) => `
            <button type="button" class="response-card">
              <strong>${h(formById(response.form_id)?.title || 'Unknown form')}</strong>
              <span>${h(response.submitted_by || response.submitter_email || 'Anonymous')}</span>
              <small>${formatDate(response.created_at)}</small>
            </button>
          `).join('') || emptyState('No responses yet. Submit a preview response from the builder.')}
        </div>
      </article>
      <aside class="panel response-detail">
        ${selected ? renderResponseDetail(selected) : emptyState('No response selected.')}
      </aside>
    </section>
  `;
}

function renderCrmPage(route, companyId) {
  const accounts = filteredCrmAccounts(companyId);
  const allAccounts = crmAccounts(companyId);
  const openTasks = companyTasks(companyId).filter((task) => task.status !== 'done').length;
  const activeValue = sum(companyJobs(companyId), 'estimate_total');
  const owners = crmOwnerOptions(companyId);
  return `
    <section class="tool-page crm-page">
      ${workspaceHeader('CRM', 'Customers, contacts, and follow-ups built from company jobs.', `
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${metricCard('Accounts', allAccounts.length)}
        ${metricCard('Open jobs', companyJobs(companyId).filter((job) => job.stage !== 'Closed').length)}
        ${metricCard('Open tasks', openTasks)}
        ${metricCard('Pipeline value', money(activeValue))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${h(state.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${['all'].concat(STAGES).map((stage) => `<option value="${h(stage)}" ${state.crmStageFilter === stage ? 'selected' : ''}>${h(stage === 'all' ? 'All stages' : stage)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${state.crmOwnerFilter === 'all' ? 'selected' : ''}>All owners</option>
            ${owners.map((owner) => `<option value="${h(owner)}" ${state.crmOwnerFilter === owner ? 'selected' : ''}>${h(owner)}</option>`).join('')}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${accounts.length} visible account${accounts.length === 1 ? '' : 's'} in ${h(companyName(companyId))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${accounts.map((account) => `
            <a class="table-row crm-account-row" href="${appHref(companyPath('crm', { account: account.key }, companyId))}" data-router>
              <span><strong>${h(account.name)}</strong><small>${h(account.subtitle)}</small></span>
              <span>${h(account.primaryContact)}</span>
              <span>${h(account.stage)}</span>
              <span>${h(account.owner)}</span>
              <span>${h(account.jobs.length)}</span>
              <span>${money(account.estimateTotal)}</span>
              <span>${formatDate(account.updatedAt)}</span>
            </a>
          `).join('') || emptyState('No CRM accounts match this view. Add a customer job to start the list.')}
        </div>
      </section>
    </section>
  `;
}

function renderCrmAccountModal(companyId, accountKey) {
  const account = crmAccountByKey(companyId, accountKey);
  if (!account) {
    return renderModalShell('CRM', 'Customer account', emptyState('This customer is not visible in the current company view.'));
  }
  const latestJob = account.latestJob;
  const openTasks = account.tasks.filter((task) => task.status !== 'done');
  return renderModalShell('CRM', account.name, `
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${h(account.name)}</h2>
            <p>${h(account.subtitle)}</p>
          </div>
          ${priorityPill(account.priority)}
        </div>
        ${contractRows([
          ['Primary contact', account.primaryContact],
          ['Owner', account.owner],
          ['Current stage', account.stage],
          ['Pipeline value', money(account.estimateTotal)],
          ['Open tasks', String(openTasks.length)],
          ['Last updated', formatDate(account.updatedAt)],
        ])}
      </section>
      <section class="crm-rollup-grid">
        ${metricCard('Jobs', account.jobs.length)}
        ${metricCard('Files', account.fileCount)}
        ${metricCard('Forms', account.formCount)}
        ${metricCard('Tasks', account.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${latestJob ? `<a class="btn btn-primary" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-briefcase"></i>Open job</a>` : ''}
        ${latestJob ? `<a class="btn" href="${appHref(companyPath('tasks', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-list-check"></i>Tasks</a>` : ''}
        ${latestJob ? `<a class="btn" href="${appHref(companyPath('files', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-folder"></i>Files</a>` : ''}
        ${latestJob ? `<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(latestJob.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>` : ''}
        <button class="btn" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Linked jobs</h2><p>Customer workspaces connected to this account.</p></div></div>
        <div class="data-table crm-linked-jobs">
          <div class="table-head"><span>Job</span><span>Stage</span><span>Owner</span><span>Value</span></div>
          ${account.jobs.map((job) => `
            <a class="table-row" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>
              <span><strong>${h(job.name)}</strong><small>${h(job.site_address || 'No address')}</small></span>
              <span>${h(job.stage)}</span>
              <span>${h(job.owner_name || 'Unassigned')}</span>
              <span>${money(job.estimate_total)}</span>
            </a>
          `).join('') || emptyState('No linked jobs yet.')}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${openTasks.slice(0, 6).map((task) => taskQueueRow(task)).join('') || emptyState('No open follow-ups for this customer.')}
        </div>
      </section>
    </div>
  `, 'crm-modal');
}

function renderMessagesPage(route, companyId) {
  const conversations = companyMessageConversations(companyId);
  const selected = selectedConversation(companyId);
  if (selected && state.selectedConversationId !== selected.id) state.selectedConversationId = selected.id;
  const mobileThread = Boolean(selected && route.params.get('conversation'));
  subscribeToMessageRealtime(companyId, selected?.id || '');
  if (selected) markConversationRead(selected.id, false);
  return `
    <section class="tool-page messages-page ${mobileThread ? 'thread-open' : ''}">
      ${workspaceHeader('Messages', 'Company chats, role rooms, direct messages, and file sharing.', `
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="messages-shell">
        <aside class="messages-list-panel panel">
          <div class="messages-tools">
            <label>
              <span>Search</span>
              <input data-message-search value="${h(state.messageQuery)}" placeholder="Find chats or messages" />
            </label>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${['all', 'unread', 'company', 'role', 'custom', 'direct'].map((filter) => `
                <button type="button" data-action="set-message-filter" data-filter="${h(filter)}" class="${state.messageFilter === filter ? 'active' : ''}">${h(filter === 'all' ? 'All' : titleCase(filter))}</button>
              `).join('')}
            </div>
          </div>
          <div class="conversation-list">
            ${conversations.map((conversation) => renderConversationRow(conversation, companyId, selected?.id === conversation.id)).join('') || emptyState('No conversations match this view.')}
          </div>
        </aside>
        <main class="messages-thread-panel panel">
          ${selected ? renderMessageThread(companyId, selected) : renderNoConversationState(companyId)}
        </main>
      </section>
      ${state.session?.auth === 'local-basic' ? renderMessageScenarioButton(companyId) : ''}
    </section>
  `;
}

function renderConversationRow(conversation, companyId, active) {
  const last = conversationMessages(conversation.id).at(-1);
  const unread = conversationUnreadCount(conversation.id);
  return `
    <a class="conversation-row ${active ? 'active' : ''}" href="${appHref(companyPath('messages', { conversation: conversation.id }, companyId))}" data-router>
      <span class="conversation-mark">${svgIcon(messageTypeSymbol(conversation.type))}</span>
      <span>
        <strong>${h(conversation.title)}</strong>
        <small>${h(last?.body || accessSummary(conversation) || 'No messages yet')}</small>
      </span>
      <em>${last ? timeAgo(last.created_at) : ''}</em>
      ${unread ? `<b>${unread}</b>` : ''}
    </a>
  `;
}

function renderMessageThread(companyId, conversation) {
  const messages = conversationMessages(conversation.id);
  const canSendMessage = can('messages.send', companyId);
  return `
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${appHref(companyPath('messages', {}, companyId))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${svgIcon(messageTypeSymbol(conversation.type))}</span>
        <div>
          <h2>${h(conversation.title)}</h2>
          <p>${h(accessSummary(conversation))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${h(conversation.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${h(conversation.id)}" ${can('messages.manage_groups', companyId) || can('messages.manage', companyId) ? '' : 'disabled'}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${messages.map((message) => renderMessageBubble(message)).join('') || emptyState('No messages yet. Start the thread with a short update.')}
    </div>
    ${canSendMessage ? renderMessageComposer(conversation) : emptyState('Your role can view this chat but cannot send messages.')}
  `;
}

function renderMessageBubble(message) {
  const own = message.sender_profile_id === activeSession().profile.id;
  const sender = messageSenderProfile(message.sender_profile_id);
  const attachments = messageAttachments(message.id);
  return `
    <article class="message-bubble ${own ? 'own' : ''}">
      ${renderAvatar(sender, 'avatar message-avatar')}
      <div class="message-card">
        <div class="message-meta">
          <strong>${h(sender.full_name || sender.email || profileName(message.sender_profile_id))}</strong>
          <span>${timeAgo(message.created_at)}</span>
          ${(own && can('messages.delete_own', message.company_id)) || can('messages.delete_any', message.company_id) ? `<button type="button" data-action="delete-message" data-message-id="${h(message.id)}"><i class="ti ti-trash"></i></button>` : ''}
        </div>
        ${message.body ? `<p>${linkifyMentions(message.body)}</p>` : ''}
        ${attachments.length ? `<div class="message-attachments">${attachments.map(renderMessageAttachment).join('')}</div>` : ''}
      </div>
    </article>
  `;
}

function renderMessageAttachment(attachment) {
  const isImage = attachment.mime_type.startsWith('image/');
  return `
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${h(attachment.id)}">
      ${attachment.preview_url && isImage ? `<img src="${h(attachment.preview_url)}" alt="" />` : svgIcon(isImage ? 'q-message-image' : 'q-message-file')}
      <span><strong>${h(attachment.file_name)}</strong><small>${h(fileSize(attachment.size_bytes))}</small></span>
    </button>
  `;
}

function renderMessageComposer(conversation) {
  return `
    <form class="message-composer" data-message-form data-conversation-id="${h(conversation.id)}">
      <input name="body" placeholder="Message ${h(conversation.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${can('messages.attach_files', conversation.company_id) ? '' : 'disabled'} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `;
}

function renderNoConversationState(companyId) {
  return `
    <div class="messages-empty-panel">
      ${svgIcon('q-symbol-messages')}
      <h2>No chat selected</h2>
      <p>Create a group chat, direct message a teammate, or pick a conversation from the list.</p>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      </div>
    </div>
  `;
}

function renderMessageScenarioButton(companyId) {
  return `
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `;
}

function renderMessageGroupModal(companyId) {
  const users = companyAccessUsers(companyId);
  return renderModalShell('Messages', 'New group chat', `
    <form class="message-modal-form" data-message-group-form>
      ${field('Chat name', 'title', '', true)}
      ${selectField('Type', 'type', 'custom', [['company', 'Company-wide'], ['role', 'Role-based'], ['custom', 'Custom group']])}
      ${renderMessageRolePicker(companyId, [])}
      ${renderMessagePeoplePicker(users, [])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'message-modal');
}

function renderDirectMessageModal(companyId) {
  const users = companyAccessUsers(companyId).filter((user) => (user.profile_id || user.member_id) !== activeSession().profile.id);
  return renderModalShell('Messages', 'New direct message', `
    <form class="message-modal-form" data-direct-message-form>
      ${selectField('Person', 'profile_id', users[0]?.profile_id || users[0]?.member_id || '', users.map((user) => [user.profile_id || user.member_id, user.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'message-modal');
}

function renderMessageAccessModal(companyId, conversationId) {
  const conversation = state.messageConversations.find((item) => item.id === conversationId);
  if (!conversation) return renderModalShell('Messages', 'Chat access', emptyState('Conversation not found.'));
  const rows = conversationAccessRows(conversation.id);
  const selectedRoles = rows.filter((row) => row.target_type === 'role').map((row) => row.target_id);
  const selectedProfiles = rows.filter((row) => row.target_type === 'profile').map((row) => row.target_id);
  return renderModalShell('Messages', 'Chat access', `
    <form class="message-modal-form" data-message-access-form data-conversation-id="${h(conversation.id)}">
      ${field('Chat name', 'title', conversation.title, true)}
      ${selectField('Type', 'type', conversation.type, [['company', 'Company-wide'], ['role', 'Role-based'], ['custom', 'Custom group'], ['direct', 'Direct message']])}
      ${renderMessageRolePicker(companyId, selectedRoles)}
      ${renderMessagePeoplePicker(companyAccessUsers(companyId), selectedProfiles)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'message-modal');
}

function renderMessageRolePicker(companyId, selectedRoleIds = []) {
  const selected = new Set(selectedRoleIds);
  return `
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${companyRoles(companyId).map((role) => `
          <label class="message-role-option" style="--role-color:${h(role.color)}">
            <input type="checkbox" name="role_ids" value="${h(role.id)}" ${selected.has(role.id) ? 'checked' : ''} />
            <span></span>
            <strong>${h(role.name)}</strong>
          </label>
        `).join('')}
      </div>
    </section>
  `;
}

function renderMessagePeoplePicker(users, selectedProfileIds = []) {
  const selected = new Set(selectedProfileIds);
  const sorted = users.slice().sort((a, b) => accessUserName(a).localeCompare(accessUserName(b)));
  return `
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>People</strong>
        <small>${sorted.length} member${sorted.length === 1 ? '' : 's'} available. Search instead of scrolling huge teams.</small>
      </div>
      <label class="message-member-search">
        <span>Find person</span>
        <input data-message-access-filter placeholder="Search name, email, or role" />
      </label>
      <div class="message-picker-count" data-message-filter-count>${sorted.length} member${sorted.length === 1 ? '' : 's'}</div>
      <div class="message-selected-strip">
        ${sorted.filter((user) => selected.has(user.profile_id || user.member_id)).slice(0, 8).map((user) => `
          <span>${renderAvatar(accessUserProfile(user), 'avatar tiny-avatar')} ${h(accessUserName(user))}</span>
        `).join('') || '<small>No individual people selected.</small>'}
      </div>
      <div class="message-people-list">
        ${sorted.map((user) => {
          const id = user.profile_id || user.member_id;
          return `
            <label class="message-person-row" data-message-person-row data-filter-text="${h([accessUserName(user), user.email, user.role_label, user.role].join(' ').toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${h(id)}" ${selected.has(id) ? 'checked' : ''} />
              ${renderAvatar(accessUserProfile(user), 'avatar message-person-avatar')}
              <span>
                <strong>${h(accessUserName(user))}</strong>
                <small>${h(accessUserMeta(user))}</small>
              </span>
            </label>
          `;
        }).join('') || emptyState('No people available in this company yet.')}
      </div>
    </section>
  `;
}

function renderMessageDetailsModal(companyId, conversationId) {
  const conversation = state.messageConversations.find((item) => item.id === conversationId);
  if (!conversation) return renderModalShell('Messages', 'Chat details', emptyState('Conversation not found.'));
  return renderModalShell('Messages', conversation.title, `
    ${contractRows([
      ['Type', titleCase(conversation.type)],
      ['Access', accessSummary(conversation)],
      ['Messages', String(conversationMessages(conversation.id).length)],
      ['Attachments', String(conversationAttachments(conversation.id).length)],
      ['Last message', formatDate(conversation.last_message_at)],
    ])}
  `, 'message-modal');
}

function renderMessageSearchModal(companyId) {
  const query = state.messageQuery.trim().toLowerCase();
  const rows = companyMessageConversations(companyId).flatMap((conversation) => conversationMessages(conversation.id)
    .filter((message) => !query || message.body.toLowerCase().includes(query))
    .map((message) => ({ conversation, message })));
  return renderModalShell('Messages', 'Search results', `
    <div class="queue-list">
      ${rows.slice(0, 30).map(({ conversation, message }) => `
        <a class="queue-row" href="${appHref(companyPath('messages', { conversation: conversation.id }, companyId))}" data-router>
          <span><strong>${h(conversation.title)}</strong><small>${h(message.body || 'Attachment')}</small></span>
          <em>${timeAgo(message.created_at)}</em>
        </a>
      `).join('') || emptyState('No matching messages. Type in the Messages search box first.')}
    </div>
  `, 'message-modal');
}

function renderFinancePage(route, companyId) {
  const summary = financeSummary(companyId);
  const invoices = companyFinanceInvoices(companyId);
  const payments = companyFinancePayments(companyId).slice().sort(dateDesc('received_at')).slice(0, 5);
  const expenses = companyFinanceExpenses(companyId).slice().sort(dateDesc('spent_at')).slice(0, 5);
  const vendors = companyFinanceVendors(companyId).slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 5);
  return `
    <section class="tool-page finance-page">
      ${workspaceHeader('Finance', 'Invoices, payments, expenses, vendors, and job-linked money in one company view.', `
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${appHref(companyPath('finance', { report: 'summary' }, companyId))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${metricCard('Estimated pipeline', money(summary.pipeline))}
        ${metricCard('Invoiced', money(summary.invoiced))}
        ${metricCard('Collected', money(summary.collected))}
        ${metricCard('Outstanding', money(summary.outstanding))}
        ${metricCard('Expenses', money(summary.expenses))}
        ${metricCard('Net position', money(summary.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[
            ['Current', summary.aging.current],
            ['1-30', summary.aging.thirty],
            ['31-60', summary.aging.sixty],
            ['61+', summary.aging.overSixty],
          ].map(([label, value]) => `<div><span>${h(label)}</span><strong>${money(value)}</strong></div>`).join('')}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${invoices.length} billing record${invoices.length === 1 ? '' : 's'} for ${h(companyName(companyId))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${invoices.map((invoice) => `
            <a class="table-row" href="${appHref(companyPath('finance', { invoice: invoice.id }, companyId))}" data-router>
              <span><strong>${h(invoice.invoice_number)}</strong><small>${h(invoice.client_name || jobById(invoice.job_id)?.client_name || 'No client')}</small></span>
              <span>${financeStatusPill(invoiceStatus(invoice))}</span>
              <span>${h(jobById(invoice.job_id)?.name || 'Company level')}</span>
              <span>${formatDate(invoice.due_date)}</span>
              <span>${money(invoice.total)}</span>
              <span>${money(invoicePaid(invoice.id))}</span>
              <span>${money(invoiceBalance(invoice.id))}</span>
            </a>
          `).join('') || emptyState('No invoices yet. Create one from a job or customer record.')}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${payments.map((payment) => compactFinanceRow(financeInvoiceById(payment.invoice_id)?.invoice_number || 'Payment', payment.method, money(payment.amount), payment.received_at)).join('') || emptyState('No payments recorded.')}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${expenses.map((expense) => compactFinanceRow(financeVendorName(expense.vendor_id), expense.category, money(expense.amount), expense.spent_at, companyPath('finance', { expense: expense.id }, companyId))).join('') || emptyState('No expenses recorded.')}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${vendors.map((vendor) => compactFinanceRow(vendor.name, vendor.category, vendor.status, vendor.updated_at, companyPath('finance', { vendor: vendor.id }, companyId))).join('') || emptyState('No vendors recorded.')}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderFinanceRouteModal(route, companyId) {
  if (route.params.get('invoice')) return renderInvoiceDetailModal(companyId, route.params.get('invoice'));
  if (route.params.get('expense')) return renderExpenseDetailModal(companyId, route.params.get('expense'));
  if (route.params.get('vendor')) return renderVendorDetailModal(companyId, route.params.get('vendor'));
  if (route.params.get('report') === 'summary') return renderFinanceReportModal(companyId);
  return '';
}

function renderInvoiceDetailModal(companyId, id) {
  const invoice = financeInvoiceById(id);
  if (!invoice || invoice.company_id !== companyId) return renderModalShell('Finance', 'Invoice', emptyState('Invoice not found.'));
  const payments = paymentsForInvoice(invoice.id);
  const job = jobById(invoice.job_id);
  return renderModalShell('Finance', invoice.invoice_number, `
    <div class="finance-detail-modal">
      ${contractRows([
        ['Client', invoice.client_name || job?.client_name || 'No client'],
        ['Status', invoiceStatus(invoice)],
        ['Job', job?.name || 'Company level'],
        ['Issued', formatDate(invoice.issue_date)],
        ['Due', formatDate(invoice.due_date)],
        ['Total', money(invoice.total)],
        ['Collected', money(invoicePaid(invoice.id))],
        ['Balance', money(invoiceBalance(invoice.id))],
      ])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${h(invoice.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${h(invoice.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${job ? `<a class="btn" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router><i class="ti ti-briefcase"></i>Open job</a>` : ''}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${payments.length} payment${payments.length === 1 ? '' : 's'} applied.</p></div></div>
        <div class="finance-compact-list">
          ${payments.map((payment) => compactFinanceRow(payment.reference || payment.method, payment.method, money(payment.amount), payment.received_at)).join('') || emptyState('No payments yet.')}
        </div>
      </section>
      ${invoice.notes ? `<p class="finance-note">${h(invoice.notes)}</p>` : ''}
    </div>
  `, 'finance-modal');
}

function renderExpenseDetailModal(companyId, id) {
  const expense = financeExpenseById(id);
  if (!expense || expense.company_id !== companyId) return renderModalShell('Finance', 'Expense', emptyState('Expense not found.'));
  const job = jobById(expense.job_id);
  return renderModalShell('Finance', `${financeVendorName(expense.vendor_id)} expense`, `
    <div class="finance-detail-modal">
      ${contractRows([
        ['Vendor', financeVendorName(expense.vendor_id)],
        ['Category', expense.category],
        ['Status', expense.status],
        ['Job', job?.name || 'Company level'],
        ['Spent', formatDate(expense.spent_at)],
        ['Amount', money(expense.amount)],
      ])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${h(expense.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${job ? `<a class="btn" href="${appHref(companyPath('files', { job_id: job.id }, companyId))}" data-router><i class="ti ti-folder"></i>Job files</a>` : ''}
      </div>
      ${expense.notes ? `<p class="finance-note">${h(expense.notes)}</p>` : ''}
    </div>
  `, 'finance-modal');
}

function renderVendorDetailModal(companyId, id) {
  const vendor = financeVendorById(id);
  if (!vendor || vendor.company_id !== companyId) return renderModalShell('Finance', 'Vendor', emptyState('Vendor not found.'));
  const expenses = companyFinanceExpenses(companyId).filter((expense) => expense.vendor_id === vendor.id);
  return renderModalShell('Finance', vendor.name, `
    <div class="finance-detail-modal">
      ${contractRows([
        ['Contact', vendor.contact_name || 'No contact'],
        ['Email', vendor.email || 'No email'],
        ['Phone', vendor.phone || 'No phone'],
        ['Category', vendor.category],
        ['Status', vendor.status],
        ['Spend', money(sum(expenses, 'amount'))],
      ])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${h(vendor.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${h(vendor.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${vendor.notes ? `<p class="finance-note">${h(vendor.notes)}</p>` : ''}
    </div>
  `, 'finance-modal');
}

function renderFinanceReportModal(companyId) {
  const summary = financeSummary(companyId);
  return renderModalShell('Finance', 'Summary report', `
    <div class="finance-report-modal">
      ${contractRows([
        ['Company', companyName(companyId)],
        ['Estimated pipeline', money(summary.pipeline)],
        ['Invoiced', money(summary.invoiced)],
        ['Collected', money(summary.collected)],
        ['Outstanding', money(summary.outstanding)],
        ['Expenses', money(summary.expenses)],
        ['Net position', money(summary.net)],
      ])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${money(summary.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${money(summary.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${money(summary.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${money(summary.aging.overSixty)}</strong></div>
      </div>
    </div>
  `, 'finance-modal');
}

function renderFinanceInvoiceFormModal(companyId, invoice = null) {
  const edit = invoice || blankFinanceInvoice(companyId);
  return renderModalShell('Finance', invoice ? 'Edit invoice' : 'New invoice', `
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${h(edit.id)}" />
      ${field('Invoice number', 'invoice_number', edit.invoice_number, true)}
      ${selectField('Linked job', 'job_id', edit.job_id || '', [['', 'Company level']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
      ${field('Client', 'client_name', edit.client_name, true)}
      ${selectField('Status', 'status', edit.status, INVOICE_STATUSES.map((status) => [status, status]))}
      ${field('Issue date', 'issue_date', edit.issue_date, false, 'date')}
      ${field('Due date', 'due_date', edit.due_date, false, 'date')}
      ${field('Subtotal', 'subtotal', edit.subtotal, false, 'number')}
      ${field('Tax', 'tax', edit.tax, false, 'number')}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-form-modal');
}

function renderFinancePaymentFormModal(companyId, invoiceId = '') {
  const edit = blankFinancePayment(companyId, invoiceId);
  const invoiceOptions = companyFinanceInvoices(companyId)
    .map((invoice) => [invoice.id, `${invoice.invoice_number} - ${invoice.client_name || jobById(invoice.job_id)?.client_name || 'No client'}`]);
  return renderModalShell('Finance', 'Record payment', `
    <form class="finance-form" data-finance-payment-form>
      ${selectField('Invoice', 'invoice_id', edit.invoice_id, invoiceOptions.length ? invoiceOptions : [['', 'Create an invoice first']])}
      ${field('Amount', 'amount', edit.amount, true, 'number')}
      ${selectField('Method', 'method', edit.method, PAYMENT_METHODS.map((method) => [method, method]))}
      ${field('Received', 'received_at', edit.received_at, false, 'date')}
      ${field('Reference', 'reference', edit.reference)}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-form-modal');
}

function renderFinanceExpenseFormModal(companyId, expense = null, vendorId = '') {
  const edit = expense || blankFinanceExpense(companyId, vendorId);
  const vendorOptions = companyFinanceVendors(companyId).map((vendor) => [vendor.id, vendor.name]);
  return renderModalShell('Finance', expense ? 'Edit expense' : 'Add expense', `
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${h(edit.id)}" />
      ${selectField('Vendor', 'vendor_id', edit.vendor_id, vendorOptions.length ? vendorOptions : [['', 'No vendor yet']])}
      ${selectField('Linked job', 'job_id', edit.job_id || '', [['', 'Company level']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
      ${selectField('Category', 'category', edit.category, EXPENSE_CATEGORIES.map((category) => [category, category]))}
      ${selectField('Status', 'status', edit.status, EXPENSE_STATUSES.map((status) => [status, status]))}
      ${field('Amount', 'amount', edit.amount, true, 'number')}
      ${field('Spent date', 'spent_at', edit.spent_at, false, 'date')}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-form-modal');
}

function renderFinanceVendorFormModal(companyId, vendor = null) {
  const edit = vendor || blankFinanceVendor(companyId);
  return renderModalShell('Finance', vendor ? 'Edit vendor' : 'Add vendor', `
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${h(edit.id)}" />
      ${field('Vendor name', 'name', edit.name, true)}
      ${field('Contact', 'contact_name', edit.contact_name)}
      ${field('Email', 'email', edit.email, false, 'email')}
      ${field('Phone', 'phone', edit.phone)}
      ${selectField('Category', 'category', edit.category, EXPENSE_CATEGORIES.map((category) => [category, category]))}
      ${selectField('Status', 'status', edit.status, VENDOR_STATUSES.map((status) => [status, status]))}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'finance-form-modal');
}

function renderOperationsPage(route, companyId) {
  if (route.section === 'clock') return renderClockDashboardPage(companyId);
  if (route.section === 'approvals') return renderApprovalsPage(companyId);
  return renderTimePage(companyId);
}

function renderOperationsTabs(companyId, active) {
  return `
    ${compactTabs('Operations sections', [
      [companyPath('time', {}, companyId), 'My time', active === 'time'],
      [companyPath('approvals', {}, companyId), 'Approvals', active === 'approvals'],
      [companyPath('clock', {}, companyId), 'Clock dashboard', active === 'clock'],
    ])}
  `;
}

function renderTimePage(companyId) {
  const summary = timeSummary(companyId);
  const active = activeTimerForCompany(companyId);
  return `
    <section class="tool-page operations-page">
      ${workspaceHeader('My time', "A compact personal work queue built from this company's tasks.", `
        <a class="btn" href="${appHref(companyPath('tasks', {}, companyId))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${active ? 'clock-out' : 'clock-in'}"><i class="ti ${active ? 'ti-player-stop-filled' : 'ti-player-play-filled'}"></i>${active ? 'Clock out' : 'Clock in'}</button>
      `)}
      ${renderOperationsTabs(companyId, 'time')}
      <section class="metric-grid operations-metrics">
        ${metricCard('Due today', summary.dueToday.length)}
        ${metricCard('Overdue', summary.overdue.length)}
        ${metricCard('Open work', summary.open.length)}
        ${metricCard('In review', summary.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${summary.focus.slice(0, 8).map((task) => taskQueueRow(task)).join('') || emptyState('No time-sensitive tasks for this company.')}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${contractRows([
            ['Company', companyName(companyId)],
            ['Assigned to you', String(summary.assignedToMe.length)],
            ['Due this week', String(summary.thisWeek.length)],
            ['Completed', String(summary.done.length)],
          ])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${summary.thisWeek.slice(0, 8).map((task) => `
              <a class="table-row" href="${appHref(companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, companyId))}" data-router>
                <span><strong>${h(task.title)}</strong><small>${h(task.description || taskTypeLabel(task.type))}</small></span>
                <span>${h(jobById(task.project_id)?.name || 'Company task')}</span>
                <span>${h(memberName(task.assignee_id))}</span>
                <span>${formatDate(task.due)}</span>
                <span>${taskStatusPill(task.status)}</span>
              </a>
            `).join('') || emptyState('No upcoming tasks this week.')}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderClockDashboardPage(companyId) {
  const entries = timeEntriesForCompany(companyId);
  const active = activeTimerForCompany(companyId);
  const todayStart = startOfToday().getTime();
  const weekStart = todayStart - 6 * 86400000;
  const todayMs = totalTimeForCompany(companyId, todayStart) + (active ? Date.now() - Date.parse(active.started_at) : 0);
  const weekMs = totalTimeForCompany(companyId, weekStart) + (active ? Date.now() - Date.parse(active.started_at) : 0);
  return `
    <section class="tool-page operations-page clock-page">
      ${workspaceHeader('Clock dashboard', 'Local basic-mode clock tracking for the active company.', `
        <button class="btn btn-primary" type="button" data-action="${active ? 'clock-out' : 'clock-in'}"><i class="ti ${active ? 'ti-player-stop-filled' : 'ti-player-play-filled'}"></i>${active ? 'Clock out' : 'Clock in'}</button>
      `)}
      ${renderOperationsTabs(companyId, 'clock')}
      <section class="metric-grid operations-metrics">
        ${metricCard('Today', formatDuration(todayMs))}
        ${metricCard('Last 7 days', formatDuration(weekMs))}
        ${metricCard('Entries', entries.length)}
        ${metricCard('Status', active ? 'Clocked in' : 'Off clock')}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${active ? contractRows([
            ['User', memberName(active.user_id)],
            ['Started', formatDateTime(active.started_at)],
            ['Task', active.task_title || 'General shift'],
            ['Elapsed', formatDuration(Date.now() - Date.parse(active.started_at))],
          ]) : emptyState('Nobody is clocked in on this device.')}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${entries.slice(0, 10).map((entry) => `
              <div class="table-row">
                <span><strong>${h(entry.task_title || 'General shift')}</strong><small>${h(entry.notes || 'Clock entry')}</small></span>
                <span>${h(memberName(entry.user_id))}</span>
                <span>${formatDateTime(entry.started_at)}</span>
                <span>${formatDuration(entry.duration_ms)}</span>
              </div>
            `).join('') || emptyState('No clock entries yet.')}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderApprovalsPage(companyId) {
  const items = approvalItems(companyId);
  const formItems = items.filter((item) => item.type === 'Form approval');
  const taskItems = items.filter((item) => item.type === 'Task review');
  const accessItems = items.filter((item) => item.type === 'Access request');
  return `
    <section class="tool-page operations-page">
      ${workspaceHeader('Approvals', 'Company review queue for forms, task handoffs, and access requests.', `
        <a class="btn" href="${appHref(companyPath('forms', {}, companyId))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${appHref(companyPath('tasks', {}, companyId))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${renderOperationsTabs(companyId, 'approvals')}
      <section class="metric-grid operations-metrics">
        ${metricCard('Open approvals', items.length)}
        ${metricCard('Forms', formItems.length)}
        ${metricCard('Task reviews', taskItems.length)}
        ${metricCard('Access', accessItems.length)}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Approval queue</h2><p>One calm list instead of a heavy dashboard.</p></div></div>
        <div class="data-table approval-table">
          <div class="table-head"><span>Item</span><span>Type</span><span>Owner</span><span>Status</span><span>Updated</span></div>
          ${items.map((item) => `
            <a class="table-row" href="${appHref(item.href)}" data-router>
              <span><strong>${h(item.title)}</strong><small>${h(item.meta)}</small></span>
              <span>${h(item.type)}</span>
              <span>${h(item.owner)}</span>
              <span>${h(item.status)}</span>
              <span>${formatDate(item.updatedAt)}</span>
            </a>
          `).join('') || emptyState('No approvals need attention right now.')}
        </div>
      </section>
    </section>
  `;
}

function renderPlannedPage(name) {
  return `
    ${workspaceHeader(titleCase(name || 'workspace'), 'This module will use the same company workspace shell when wired.', '')}
    <section class="panel">
      ${emptyState('Module data model pending.')}
    </section>
  `;
}

function renderLogin() {
  document.title = 'Sign in | Quest HQ';
  const returnUrl = safeReturnUrl(state.route.params.get('return_url') || appHref(companyPath('jobs', {}, defaultCompanyId())));
  const authEnabled = CONFIG.questAuthEnabled;
  const inviteToken = String(state.route.params.get('invite') || '').trim();
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>${authEnabled ? 'Secure company workspace' : 'Company Workspace'}</small></span>
        </div>
        <div>
          <div class="eyebrow">${authEnabled ? 'Tenant access' : 'Local access'}</div>
          <h1>Sign in to Quest HQ</h1>
          <p>${authEnabled ? 'Each company workspace is isolated by Supabase Auth, memberships, subscription state, and role permissions.' : 'Supabase auth is switched off while the company workspace foundation is stabilized.'}</p>
        </div>
        ${inviteToken ? `<div class="invite-banner"><strong>Workspace invite</strong><span>Sign in or create an account with the invited email to join the company.</span></div>` : ''}
        ${authEnabled ? `
          <div class="auth-mode-tabs">
            <button class="${state.authMode === 'signin' ? 'active' : ''}" type="button" data-action="set-auth-mode" data-auth-mode="signin">Sign in</button>
            <button class="${state.authMode === 'register' ? 'active' : ''}" type="button" data-action="set-auth-mode" data-auth-mode="register">${inviteToken ? 'Create account' : 'Create workspace'}</button>
            <button class="${state.authMode === 'invite' ? 'active' : ''}" type="button" data-action="set-auth-mode" data-auth-mode="invite">Invite code</button>
            <button class="${state.authMode === 'request' ? 'active' : ''}" type="button" data-action="set-auth-mode" data-auth-mode="request">Request access</button>
          </div>
          ${renderSupabaseAuthForm(returnUrl)}
        ` : ''}
        ${renderDemoModeLauncher(returnUrl)}
        ${CONFIG.localLoginEnabled && authEnabled ? `
          <details class="demo-login-details">
            <summary>Legacy demo credentials</summary>
            ${renderLocalLoginForm(returnUrl)}
          </details>
        ` : ''}
      </section>
    </main>
  `;
}

function renderDemoModeLauncher(returnUrl) {
  return `
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${h(returnUrl)}">Open demo mode</button>
    </section>
  `;
}

function renderSupabaseAuthForm(returnUrl) {
  const inviteToken = String(state.route?.params?.get('invite') || '').trim();
  if (state.authMode === 'register') {
    return `
      <form data-auth-register-form>
        <label>${inviteToken ? 'Name / username' : 'Full name'}<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        ${inviteToken ? '' : '<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>'}
        <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        <button class="btn btn-primary full" type="submit">${inviteToken ? 'Create account and join' : 'Create secure workspace'}</button>
        ${authStatusMessage(inviteToken ? 'The invite email must match this account email.' : 'Owner role, trial subscription, and workspace isolation are created automatically.')}
      </form>
    `;
  }
  if (state.authMode === 'invite') {
    return `
      <form data-auth-invite-code-form>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${authStatusMessage('Invite codes are shared by your Owner/Admin. No email delivery required.')}
      </form>
    `;
  }
  if (state.authMode === 'request') {
    return `
      <form data-auth-request-form>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${authStatusMessage('Requests stay pending until a company Owner/Admin approves them.')}
      </form>
    `;
  }
  return `
    <form data-auth-sign-in-form>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
      <input type="hidden" name="return_url" value="${h(returnUrl)}" />
      <button class="btn btn-primary full" type="submit">Sign in</button>
      ${authStatusMessage('Use the company workspace account your Owner/Admin invited.')}
    </form>
  `;
}

function renderLocalLoginForm(returnUrl) {
  return `
    <form data-login-form>
      <label>Username<input name="username" value="${h(CONFIG.localUsername)}" autocomplete="username" /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" /></label>
      <input type="hidden" name="return_url" value="${h(returnUrl)}" />
      <button class="btn btn-primary full" type="submit">Sign in to demo</button>
      ${state.loginError ? `<div class="form-message error">${h(state.loginError)}</div>` : `<div class="form-message">Temporary demo credentials: lumen123 / lumen123</div>`}
    </form>
  `;
}

function authStatusMessage(defaultText) {
  if (state.loginError) return `<div class="form-message error">${h(state.loginError)}</div>`;
  return `<div class="form-message">${h(state.authMessage || defaultText)}</div>`;
}

function renderProfileModal(profile) {
  return `
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${renderAvatar(profile, 'avatar large')}
            <div><strong>${h(profile.full_name)}</strong><span>${h(profile.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${h(profile.full_name)}" /></label>
          <label>Avatar URL<input name="avatar_url" value="${h(profile.avatar_url || '')}" placeholder="https://..." /></label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Save profile</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderActiveModal(route, session) {
  if (state.modal === 'profile') return renderProfileModal(session.profile);
  if (state.modal === 'file-upload') return renderFileUploadModal();
  if (state.modal === 'folder-new') return renderNewFolderModal();
  if (state.modal === 'file-detail') return renderFileDetailModal(activeCompanyId());
  if (state.modal === 'forms-tools') return renderFormsToolsModal(activeCompanyId());
  if (state.modal === 'form-actions') return renderFormActionsModal(activeCompanyId(), selectedForm(activeCompanyId()));
  if (state.modal === 'form-new') return renderNewFormModal(activeCompanyId());
  if (state.modal === 'form-preview') return renderFormPreviewModal(activeCompanyId(), selectedForm(activeCompanyId()));
  if (state.modal === 'job-new') return renderJobFormModal(activeCompanyId(), null);
  if (state.modal === 'job-edit') return renderJobFormModal(activeCompanyId(), selectedJob());
  if (state.modal === 'finance-invoice-new') return renderFinanceInvoiceFormModal(activeCompanyId(), null);
  if (state.modal === 'finance-invoice-edit') return renderFinanceInvoiceFormModal(activeCompanyId(), financeInvoiceById(state.selectedFinanceInvoiceId));
  if (state.modal === 'finance-payment-new') return renderFinancePaymentFormModal(activeCompanyId(), state.selectedFinanceInvoiceId);
  if (state.modal === 'finance-expense-new') return renderFinanceExpenseFormModal(activeCompanyId(), null, state.selectedFinanceVendorId);
  if (state.modal === 'finance-expense-edit') return renderFinanceExpenseFormModal(activeCompanyId(), financeExpenseById(state.selectedFinanceExpenseId));
  if (state.modal === 'finance-vendor-new') return renderFinanceVendorFormModal(activeCompanyId(), null);
  if (state.modal === 'finance-vendor-edit') return renderFinanceVendorFormModal(activeCompanyId(), financeVendorById(state.selectedFinanceVendorId));
  if (state.modal === 'role-new') return renderRoleFormModal(activeCompanyId());
  if (state.modal === 'invite-new') return renderInviteFormModal(activeCompanyId());
  if (state.modal === 'message-group-new') return renderMessageGroupModal(activeCompanyId());
  if (state.modal === 'message-direct-new') return renderDirectMessageModal(activeCompanyId());
  if (state.modal === 'message-access') return renderMessageAccessModal(activeCompanyId(), state.selectedConversationId);
  if (state.modal === 'message-details') return renderMessageDetailsModal(activeCompanyId(), state.selectedConversationId);
  if (state.modal === 'message-search') return renderMessageSearchModal(activeCompanyId());
  if (route.name === 'company' && route.section === 'crm' && route.params.get('account')) {
    return renderCrmAccountModal(route.companyId, route.params.get('account'));
  }
  if (route.name === 'company' && route.section === 'finance') {
    const financeModal = renderFinanceRouteModal(route, route.companyId);
    if (financeModal) return financeModal;
  }

  if (route.name === 'company' && route.section === 'jobs' && route.params.get('tab') === 'editor') {
    return renderJobFormModal(route.companyId, route.jobId ? jobById(route.jobId) : selectedJob());
  }
  if (route.name === 'company' && route.section === 'tasks') {
    return renderTaskRouteModal(route, route.companyId);
  }
  return '';
}

function renderToast() {
  if (!state.toast) return '';
  return `
    <div class="app-toast ${h(state.toast.mode || 'local')}" role="status" aria-live="polite">
      <strong>${h(state.toast.title || 'Quest HQ')}</strong>
      <span>${h(state.toast.message || '')}</span>
    </div>
  `;
}

function showToast(message, mode = 'local', title = 'Not available yet') {
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toast = { title, message, mode };
  render();
  state.toastTimer = setTimeout(() => {
    state.toast = null;
    state.toastTimer = null;
    render();
  }, 4200);
}

function renderModalShell(eyebrow, title, content, className = '') {
  return `
    <div class="modal-overlay">
      <div class="modal-panel ${h(className)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${h(eyebrow)}</div><h2>${h(title)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    </div>
  `;
}

function renderDrawerShell(eyebrow, title, content) {
  return `
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${h(eyebrow)}</div><h2>${h(title)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${content}</div>
      </aside>
    </div>
  `;
}

function renderJobFormModal(companyId, job) {
  return renderModalShell('Jobs', job ? 'Edit job' : 'Create job', renderJobEditor(companyId, job), 'wide-modal');
}

function renderTaskRouteModal(route, companyId) {
  const job = route.jobId ? jobById(route.jobId) : null;
  const taskId = route.params.get('task_id') || '';
  const task = taskId ? taskById(taskId) : null;
  if (route.params.get('new') === '1') {
    return renderModalShell('Tasks', 'New task', renderTaskForm(companyId, job, null), 'task-modal');
  }
  if (route.params.get('edit') === '1' && task) {
    return renderModalShell('Tasks', 'Edit task', renderTaskForm(companyId, job, task), 'task-modal');
  }
  if (task) {
    return renderDrawerShell('Task detail', task.title, renderTaskDetail(companyId, task));
  }
  return '';
}

function renderFileDetailModal(companyId) {
  const file = state.selectedFileId ? state.files.find((item) => item.id === state.selectedFileId) : null;
  if (!file) return '';
  return renderModalShell('Open file', file.file_name, renderFileViewer(file, companyId), 'file-viewer-modal');
}

function renderFormsToolsModal(companyId) {
  return renderModalShell('Forms', 'Tools', `
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${state.formTypeFilter === 'all' ? 'selected' : ''}>All types</option>
          ${FORM_TYPES.map((type) => `<option value="${h(type)}" ${state.formTypeFilter === type ? 'selected' : ''}>${h(type)}</option>`).join('')}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `);
}

function renderNewFormModal(companyId) {
  const startTab = state.formStartTab === 'templates' ? 'templates' : 'blank';
  const templates = formTemplates();
  const selectedTemplate = startTab === 'templates'
    ? templates.find((item) => item.id === state.formStartTemplateId) || templates[0] || null
    : null;
  const title = selectedTemplate?.title || '';
  const description = selectedTemplate?.description || '';
  const type = selectedTemplate?.type || 'Internal';
  const starterQuestions = selectedTemplate?.questions || [{ type: 'short', label: 'First question', required: false, options: [] }];
  return renderModalShell('Forms', 'New form builder', `
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${h(selectedTemplate?.id || '')}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${startTab === 'blank' ? 'active' : ''}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${startTab === 'templates' ? 'active' : ''}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${startTab === 'templates' ? `
        <div class="new-form-template-grid">
          ${templates.map((template) => `
            <button class="${selectedTemplate?.id === template.id ? 'active' : ''}" type="button" data-action="select-form-start-template" data-template-id="${h(template.id)}">
              <span><i class="ti ti-template"></i></span>
              <strong>${h(template.title)}</strong>
              <small>${h(template.type)} / ${template.questions.length} questions</small>
            </button>
          `).join('')}
        </div>
      ` : `
        <div class="new-form-start">
          <span><i class="ti ti-clipboard-plus"></i></span>
          <div>
            <strong>Blank form</strong>
            <small>Start with a title card and one short-answer question.</small>
          </div>
        </div>
      `}
      <div class="new-form-builder-grid">
        <section class="new-form-builder-main">
          <article class="panel gform-title-card new-form-title-card">
            <div class="gform-accent-strip" style="--form-accent:${h(companyColor(companyId))}"></div>
            <label><span>Form title</span><input name="title" value="${h(title)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${h(description)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${starterQuestions.map((question, index) => renderStarterQuestionCard(question, index)).join('')}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${selectedTemplate ? h(selectedTemplate.title) : 'Blank starter'}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${FORM_TYPES.map((item) => `<option value="${h(item)}" ${item === type ? 'selected' : ''}>${h(item)}</option>`).join('')}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${companyJobs(companyId).map((job) => `<option value="${h(job.id)}" ${state.route?.jobId === job.id ? 'selected' : ''}>${h(job.name)}</option>`).join('')}</select></label>
            <label><span>Submit button</span><input name="submit_label" value="Submit" /></label>
          </div>
          <div class="new-form-checks">
            <label class="check-row"><input type="checkbox" name="collect_email" checked /> Collect email</label>
            <label class="check-row"><input type="checkbox" name="require_approval" /> Require approval</label>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Create form</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </aside>
      </div>
    </form>
  `, 'form-create-modal builder-modal');
}

function renderStarterQuestionCard(question, index) {
  const options = questionHasOptions(question) ? `
    <div class="starter-options">
      ${(question.options || ['Option 1', 'Option 2']).map((option) => `<span>${h(option)}</span>`).join('')}
    </div>
  ` : '';
  return `
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${index + 1}</span>
        <strong>${h(questionTypeLabel(question.type))}</strong>
      </div>
      <label><span>Question</span><input value="${h(question.label || 'Untitled question')}" readonly /></label>
      ${question.help ? `<small>${h(question.help)}</small>` : ''}
      ${options}
      <label class="check-row"><input type="checkbox" ${question.required ? 'checked' : ''} disabled /> Required</label>
    </article>
  `;
}

function renderFormPreviewModal(companyId, form) {
  if (!form) return renderModalShell('Forms', 'Preview form', emptyState('Choose a form first.'));
  return renderModalShell('Forms', 'Preview form', `
    <div class="form-preview-modal-body">
      ${renderFormPreview(companyId, form)}
    </div>
  `, 'form-preview-modal');
}

function renderFormActionsModal(companyId, form) {
  if (!form) return renderModalShell('Forms', 'Manage form', emptyState('Choose a form first.'));
  return renderModalShell('Forms', 'Manage form', `
    <div class="forms-summary-share compact">
      <strong>Shareable preview URL</strong>
      <input readonly value="${h(`${window.location.origin}${appHref(companyPath('forms', { form_id: form.id }, companyId))}`)}" />
      <button class="btn" type="button" data-action="copy-form-link" data-form-id="${h(form.id)}">Copy link</button>
    </div>
    <div class="modal-action-grid">
      <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${h(form.id)}"><i class="ti ti-edit"></i>Edit builder</button>
      <button class="btn" type="button" data-action="duplicate-form" data-form-id="${h(form.id)}"><i class="ti ti-copy"></i>Duplicate</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${h(form.id)}"><i class="ti ti-world-upload"></i>Publish</button>
      <button class="btn" type="button" data-action="archive-form" data-form-id="${h(form.id)}"><i class="ti ti-archive"></i>Archive</button>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export library</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${h(form.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `);
}

function onDocumentClick(event) {
  const closeAccountMenu = state.accountMenuOpen && !event.target.closest('.account-menu');
  const closeNotificationMenu = state.notificationMenuOpen && !event.target.closest('.notification-center');
  if (closeAccountMenu) state.accountMenuOpen = false;
  if (closeNotificationMenu) state.notificationMenuOpen = false;

  const action = event.target.closest('[data-action]');
  if (action) {
    handleAction(event, action);
    return;
  }

  const selectJob = event.target.closest('[data-select-job]');
  if (selectJob) {
    event.preventDefault();
    setSelectedJob(selectJob.dataset.selectJob);
    return;
  }

  const selectTask = event.target.closest('[data-select-task]');
  if (selectTask) {
    event.preventDefault();
    setSelectedTask(selectTask.dataset.selectTask);
    return;
  }

  const link = event.target.closest('a[href][data-router]');
  if (!link) {
    if (closeAccountMenu || closeNotificationMenu) render();
    return;
  }
  if (link.target || link.hasAttribute('download')) return;
  event.preventDefault();
  navigate(link.getAttribute('href'));
}

function handleAction(event, node) {
  const action = node.dataset.action;
  if (action === 'refresh-data') {
    event.preventDefault();
    state.dataLoaded = false;
    state.sync = { label: 'Refreshing...', mode: 'loading' };
    render();
    return;
  }
  if (action === 'sign-out') {
    event.preventDefault();
    state.accountMenuOpen = false;
    signOut();
    return;
  }
  if (action === 'toggle-account-menu') {
    event.preventDefault();
    state.accountMenuOpen = !state.accountMenuOpen;
    state.notificationMenuOpen = false;
    render();
    return;
  }
  if (action === 'toggle-notifications') {
    event.preventDefault();
    state.notificationMenuOpen = !state.notificationMenuOpen;
    state.accountMenuOpen = false;
    render();
    return;
  }
  if (action === 'mark-all-notifications-read') {
    event.preventDefault();
    markAllNotificationsRead(activeCompanyId());
    render();
    return;
  }
  if (action === 'open-notification') {
    event.preventDefault();
    openNotification(node.dataset.notificationId);
    render();
    return;
  }
  if (action === 'verify-email') {
    event.preventDefault();
    state.accountMenuOpen = false;
    showToast('Email verification is not implemented yet. Account access is not blocked right now.', 'local');
    return;
  }
  if (action === 'start-demo-mode') {
    event.preventDefault();
    startDemoMode(node.dataset.returnUrl || '');
    return;
  }
  if (action === 'set-auth-mode') {
    event.preventDefault();
    state.authMode = ['signin', 'register', 'invite', 'request'].includes(node.dataset.authMode) ? node.dataset.authMode : 'signin';
    state.loginError = '';
    state.authMessage = '';
    render();
    return;
  }
  if (action === 'open-profile') {
    event.preventDefault();
    state.accountMenuOpen = false;
    state.modal = 'profile';
    render();
    return;
  }
  if (action === 'open-role-form') {
    event.preventDefault();
    state.modal = 'role-new';
    render();
    return;
  }
  if (action === 'view-as-role') {
    event.preventDefault();
    const companyId = activeCompanyId();
    const role = roleById(companyId, node.dataset.roleId);
    if (!role) {
      showToast('That role is no longer available.', 'local', 'Role preview');
      return;
    }
    state.rolePreview = { company_id: companyId, role_id: role.id };
    showToast(`Viewing the workspace as ${role.name}.`, 'local', 'Role preview');
    return;
  }
  if (action === 'exit-role-preview') {
    event.preventDefault();
    state.rolePreview = null;
    showToast('Role preview ended.', 'live', 'Role preview');
    return;
  }
  if (action === 'open-invite-form') {
    event.preventDefault();
    state.modal = 'invite-new';
    render();
    return;
  }
  if (action === 'new-message-group') {
    event.preventDefault();
    state.modal = 'message-group-new';
    render();
    return;
  }
  if (action === 'new-direct-message') {
    event.preventDefault();
    state.modal = 'message-direct-new';
    render();
    return;
  }
  if (action === 'manage-message-chat') {
    event.preventDefault();
    state.selectedConversationId = node.dataset.conversationId || state.selectedConversationId;
    state.modal = 'message-access';
    render();
    return;
  }
  if (action === 'message-details') {
    event.preventDefault();
    state.selectedConversationId = node.dataset.conversationId || state.selectedConversationId;
    state.modal = 'message-details';
    render();
    return;
  }
  if (action === 'message-search-results') {
    event.preventDefault();
    state.modal = 'message-search';
    render();
    return;
  }
  if (action === 'set-message-filter') {
    event.preventDefault();
    state.messageFilter = ['all', 'unread', ...MESSAGE_TYPES].includes(node.dataset.filter) ? node.dataset.filter : 'all';
    render();
    return;
  }
  if (action === 'delete-message') {
    event.preventDefault();
    deleteMessage(node.dataset.messageId);
    return;
  }
  if (action === 'open-message-attachment') {
    event.preventDefault();
    openMessageAttachment(node.dataset.attachmentId);
    return;
  }
  if (action === 'run-message-scenario') {
    event.preventDefault();
    runMessageScenario(activeCompanyId());
    return;
  }
  if (action === 'reset-message-demo') {
    event.preventDefault();
    resetMessageDemo();
    return;
  }
  if (action === 'copy-invite-link') {
    event.preventDefault();
    copyInviteLink(node.dataset.inviteId);
    return;
  }
  if (action === 'copy-invite-code') {
    event.preventDefault();
    copyInviteCode(node.dataset.inviteId);
    return;
  }
  if (action === 'revoke-invite') {
    event.preventDefault();
    revokeInvite(node.dataset.inviteId);
    return;
  }
  if (action === 'approve-join-request') {
    event.preventDefault();
    updateJoinRequest(node.dataset.requestId, 'approved');
    return;
  }
  if (action === 'reject-join-request') {
    event.preventDefault();
    updateJoinRequest(node.dataset.requestId, 'rejected');
    return;
  }
  if (action === 'start-checkout') {
    event.preventDefault();
    startCheckout();
    return;
  }
  if (action === 'open-file-upload') {
    event.preventDefault();
    state.modal = 'file-upload';
    render();
    return;
  }
  if (action === 'open-folder-form') {
    event.preventDefault();
    state.modal = 'folder-new';
    render();
    return;
  }
  if (action === 'open-job-form') {
    event.preventDefault();
    const jobId = node.dataset.jobId || '';
    if (jobId) state.selectedJobId = jobId;
    state.modal = node.dataset.mode === 'edit' ? 'job-edit' : 'job-new';
    render();
    return;
  }
  if (action === 'open-forms-tools') {
    event.preventDefault();
    state.modal = 'forms-tools';
    render();
    return;
  }
  if (action === 'open-form-actions') {
    event.preventDefault();
    selectForm(node.dataset.formId, false);
    state.modal = 'form-actions';
    render();
    return;
  }
  if (action === 'open-form-preview') {
    event.preventDefault();
    selectForm(node.dataset.formId, false);
    state.modal = 'form-preview';
    render();
    return;
  }
  if (action === 'set-form-start-tab') {
    event.preventDefault();
    state.formStartTab = node.dataset.tab === 'templates' ? 'templates' : 'blank';
    if (state.formStartTab === 'blank') state.formStartTemplateId = '';
    if (state.formStartTab === 'templates' && !state.formStartTemplateId) state.formStartTemplateId = formTemplates()[0]?.id || '';
    render();
    return;
  }
  if (action === 'select-form-start-template') {
    event.preventDefault();
    state.formStartTab = 'templates';
    state.formStartTemplateId = node.dataset.templateId || formTemplates()[0]?.id || '';
    render();
    return;
  }
  if (action === 'close-modal') {
    event.preventDefault();
    closeActiveModal();
    return;
  }
  if (action === 'set-task-view') {
    event.preventDefault();
    state.taskView = node.dataset.view === 'board' ? 'board' : 'table';
    localStorage.setItem(TASK_VIEW_KEY, state.taskView);
    render();
    return;
  }
  if (action === 'set-drive-view') {
    event.preventDefault();
    state.driveView = node.dataset.view === 'list' ? 'list' : 'grid';
    localStorage.setItem(DRIVE_VIEW_KEY, state.driveView);
    render();
    return;
  }
  if (action === 'clock-in') {
    event.preventDefault();
    startClock(activeCompanyId(), node.dataset.taskId || state.route?.params?.get('task_id') || '');
    return;
  }
  if (action === 'clock-out') {
    event.preventDefault();
    stopClock();
    return;
  }
  if (action === 'select-file') {
    event.preventDefault();
    state.selectedFileId = node.dataset.fileId || '';
    state.modal = 'file-detail';
    render();
    return;
  }
  if (action === 'download-file') {
    event.preventDefault();
    downloadFile(node.dataset.fileId);
    return;
  }
  if (action === 'delete-file') {
    event.preventDefault();
    deleteFile(node.dataset.fileId);
    return;
  }
  if (action === 'set-forms-tab') {
    event.preventDefault();
    state.formsTab = node.dataset.tab === 'responses' ? 'responses' : 'library';
    render();
    return;
  }
  if (action === 'set-form-editor-tab') {
    event.preventDefault();
    state.formEditorTab = node.dataset.tab || 'questions';
    render();
    return;
  }
  if (action === 'new-form') {
    event.preventDefault();
    state.formStartTemplateId = node.dataset.templateId || '';
    state.formStartTab = node.dataset.startTab === 'templates' || state.formStartTemplateId ? 'templates' : 'blank';
    if (state.formStartTab === 'templates' && !state.formStartTemplateId) state.formStartTemplateId = formTemplates()[0]?.id || '';
    state.modal = 'form-new';
    render();
    return;
  }
  if (action === 'select-form') {
    event.preventDefault();
    selectForm(node.dataset.formId);
    return;
  }
  if (action === 'toggle-form-card') {
    event.preventDefault();
    const id = node.dataset.formId || '';
    if (state.expandedFormIds.has(id)) state.expandedFormIds.delete(id);
    else state.expandedFormIds.add(id);
    render();
    return;
  }
  if (action === 'edit-form') {
    event.preventDefault();
    selectForm(node.dataset.formId, false);
    state.formsTab = 'builder';
    state.formEditorTab = 'questions';
    state.modal = '';
    render();
    return;
  }
  if (action === 'save-form') {
    event.preventDefault();
    saveFormsState('Form saved locally');
    render();
    return;
  }
  if (action === 'publish-form') {
    event.preventDefault();
    setFormStatus(node.dataset.formId, 'Published');
    return;
  }
  if (action === 'archive-form') {
    event.preventDefault();
    setFormStatus(node.dataset.formId, 'Archived');
    return;
  }
  if (action === 'duplicate-form') {
    event.preventDefault();
    duplicateForm(node.dataset.formId);
    return;
  }
  if (action === 'delete-form') {
    event.preventDefault();
    deleteForm(node.dataset.formId);
    return;
  }
  if (action === 'copy-form-link') {
    event.preventDefault();
    copyFormLink(node.dataset.formId);
    return;
  }
  if (action === 'export-forms') {
    event.preventDefault();
    exportForms(activeCompanyId());
    return;
  }
  if (action === 'new-finance-invoice') {
    event.preventDefault();
    state.selectedFinanceInvoiceId = '';
    state.modal = 'finance-invoice-new';
    render();
    return;
  }
  if (action === 'edit-finance-invoice') {
    event.preventDefault();
    state.selectedFinanceInvoiceId = node.dataset.invoiceId || '';
    state.modal = 'finance-invoice-edit';
    render();
    return;
  }
  if (action === 'new-finance-payment') {
    event.preventDefault();
    state.selectedFinanceInvoiceId = node.dataset.invoiceId || state.route?.params?.get('invoice') || '';
    state.modal = 'finance-payment-new';
    render();
    return;
  }
  if (action === 'new-finance-expense') {
    event.preventDefault();
    state.selectedFinanceExpenseId = '';
    state.selectedFinanceVendorId = node.dataset.vendorId || '';
    state.modal = 'finance-expense-new';
    render();
    return;
  }
  if (action === 'edit-finance-expense') {
    event.preventDefault();
    state.selectedFinanceExpenseId = node.dataset.expenseId || '';
    state.modal = 'finance-expense-edit';
    render();
    return;
  }
  if (action === 'new-finance-vendor') {
    event.preventDefault();
    state.selectedFinanceVendorId = '';
    state.modal = 'finance-vendor-new';
    render();
    return;
  }
  if (action === 'edit-finance-vendor') {
    event.preventDefault();
    state.selectedFinanceVendorId = node.dataset.vendorId || '';
    state.modal = 'finance-vendor-edit';
    render();
    return;
  }
  if (action === 'add-question') {
    event.preventDefault();
    addQuestion(node.dataset.questionType || 'multiple');
    return;
  }
  if (action === 'duplicate-question') {
    event.preventDefault();
    duplicateQuestion(node.dataset.questionId);
    return;
  }
  if (action === 'delete-question') {
    event.preventDefault();
    deleteQuestion(node.dataset.questionId);
    return;
  }
  if (action === 'move-question') {
    event.preventDefault();
    moveQuestion(node.dataset.questionId, Number(node.dataset.direction || 0));
    return;
  }
  if (action === 'add-question-option') {
    event.preventDefault();
    addQuestionOption(node.dataset.questionId);
    return;
  }
  if (action === 'remove-question-option') {
    event.preventDefault();
    removeQuestionOption(node.dataset.questionId, Number(node.dataset.optionIndex || -1));
    return;
  }
  if (action === 'delete-job') {
    event.preventDefault();
    deleteJob(node.dataset.jobId);
    return;
  }
  if (action === 'delete-task') {
    event.preventDefault();
    deleteTask(node.dataset.taskId);
  }
}

function closeActiveModal() {
  const route = state.route || getRoute();
  state.modal = '';
  state.formStartTemplateId = '';
  state.formStartTab = 'blank';
  state.selectedFinanceInvoiceId = '';
  state.selectedFinanceExpenseId = '';
  state.selectedFinanceVendorId = '';
  if (route.name === 'company' && route.section === 'tasks' && (route.params.get('new') || route.params.get('edit') || route.params.get('task_id'))) {
    navigate(companyPath('tasks', route.jobId ? { job_id: route.jobId } : {}, route.companyId), { replace: true });
    return;
  }
  if (route.name === 'company' && route.section === 'jobs' && route.params.get('tab') === 'editor') {
    const job = route.jobId ? jobById(route.jobId) : selectedJob();
    navigate(companyPath('jobs', { tab: job ? 'profile' : 'pipeline', ...(job ? { job_id: job.id } : {}) }, route.companyId), { replace: true });
    return;
  }
  if (route.name === 'company' && route.section === 'crm' && route.params.get('account')) {
    navigate(companyPath('crm', {}, route.companyId), { replace: true });
    return;
  }
  if (route.name === 'company' && route.section === 'finance' && (route.params.get('invoice') || route.params.get('expense') || route.params.get('vendor') || route.params.get('report'))) {
    navigate(companyPath('finance', {}, route.companyId), { replace: true });
    return;
  }
  render();
}

function onDocumentSubmit(event) {
  if (event.target.matches('[data-login-form]')) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target).entries());
    const ok = String(form.username || '').trim() === CONFIG.localUsername && String(form.password || '') === CONFIG.localPassword;
    if (!ok) {
      state.loginError = 'Invalid temporary credentials.';
      render();
      return;
    }
    state.loginError = '';
    startDemoMode(form.return_url || appHref(companyPath('jobs', {}, defaultCompanyId())));
    return;
  }

  if (event.target.matches('[data-auth-sign-in-form]')) {
    event.preventDefault();
    signInWithSupabase(event.target);
    return;
  }

  if (event.target.matches('[data-auth-register-form]')) {
    event.preventDefault();
    registerWorkspace(event.target);
    return;
  }

  if (event.target.matches('[data-auth-invite-code-form]')) {
    event.preventDefault();
    submitInviteCode(event.target);
    return;
  }

  if (event.target.matches('[data-auth-request-form]')) {
    event.preventDefault();
    requestCompanyAccess(event.target);
    return;
  }

  if (event.target.matches('[data-company-create-form]')) {
    event.preventDefault();
    createWorkspaceForCurrentUser(event.target);
    return;
  }

  if (event.target.matches('[data-profile-form]')) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target).entries());
    const next = {
      ...activeSession().profile,
      full_name: String(form.full_name || '').trim() || 'Quest Basic Mode',
      avatar_url: String(form.avatar_url || '').trim(),
    };
    writeJson(PROFILE_KEY, next);
    state.profileDraft = next;
    state.session = { ...activeSession(), profile: next };
    writeJson(SESSION_KEY, state.session);
    state.modal = '';
    render();
    return;
  }

  if (event.target.matches('[data-job-form]')) {
    event.preventDefault();
    saveJob(event.target);
    return;
  }

  if (event.target.matches('[data-task-form]')) {
    event.preventDefault();
    saveTask(event.target);
    return;
  }

  if (event.target.matches('[data-new-form-form]')) {
    event.preventDefault();
    createFormFromModal(event.target);
    return;
  }

  if (event.target.matches('[data-file-form]')) {
    event.preventDefault();
    saveFileRecord(event.target);
    return;
  }

  if (event.target.matches('[data-folder-form]')) {
    event.preventDefault();
    createDriveFolder(event.target);
    return;
  }

  if (event.target.matches('[data-finance-invoice-form]')) {
    event.preventDefault();
    saveFinanceInvoice(event.target);
    return;
  }

  if (event.target.matches('[data-finance-payment-form]')) {
    event.preventDefault();
    saveFinancePayment(event.target);
    return;
  }

  if (event.target.matches('[data-finance-expense-form]')) {
    event.preventDefault();
    saveFinanceExpense(event.target);
    return;
  }

  if (event.target.matches('[data-finance-vendor-form]')) {
    event.preventDefault();
    saveFinanceVendor(event.target);
    return;
  }

  if (event.target.matches('[data-role-form]')) {
    event.preventDefault();
    saveRole(event.target);
    return;
  }

  if (event.target.matches('[data-invite-form]')) {
    event.preventDefault();
    saveInvite(event.target);
    return;
  }

  if (event.target.matches('[data-message-group-form]')) {
    event.preventDefault();
    saveMessageGroup(event.target);
    return;
  }

  if (event.target.matches('[data-direct-message-form]')) {
    event.preventDefault();
    saveDirectMessage(event.target);
    return;
  }

  if (event.target.matches('[data-message-access-form]')) {
    event.preventDefault();
    saveMessageAccess(event.target);
    return;
  }

  if (event.target.matches('[data-message-form]')) {
    event.preventDefault();
    sendMessage(event.target);
    return;
  }

  if (event.target.matches('[data-user-role-form]')) {
    event.preventDefault();
    saveUserAccess(event.target);
    return;
  }

  if (event.target.matches('[data-form-preview-response]')) {
    event.preventDefault();
    saveFormResponse(event.target);
  }
}

async function signOut() {
  if (state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (CONFIG.questAuthEnabled && client?.auth) await client.auth.signOut();
  }
  localStorage.removeItem(SESSION_KEY);
  state.session = null;
  state.dataLoaded = false;
  navigate('/login', { replace: true });
}

function startDemoMode(returnUrl = '') {
  state.loginError = '';
  state.authMessage = '';
  state.session = buildLocalSession();
  resetDemoWorkspaceData();
  state.activeCompanyId = activeCompanyId();
  localStorage.setItem(COMPANY_KEY, state.activeCompanyId);
  writeJson(SESSION_KEY, state.session);
  state.dataLoaded = false;
  state.dataLoading = false;
  navigate(safeReturnUrl(returnUrl || appHref(companyPath('jobs', {}, activeCompanyId()))), { replace: true });
}

async function signInWithSupabase(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const client = createSupabaseClient();
  if (!client?.auth) {
    state.loginError = 'Supabase auth is unavailable.';
    render();
    return;
  }
  state.loginError = '';
  state.authMessage = 'Signing in...';
  render();
  const result = await client.auth.signInWithPassword({
    email: String(form.email || '').trim(),
    password: String(form.password || ''),
  });
  if (result.error) {
    state.loginError = result.error.message || 'Unable to sign in.';
    state.authMessage = '';
    render();
    return;
  }
  await setSupabaseSession(result.data.session);
  if (form.invite_token) {
    await acceptCompanyInvite(form.invite_token, form.return_url);
    return;
  }
  state.authMessage = '';
  state.dataLoaded = false;
  navigate(safeReturnUrl(form.return_url || appHref(companyPath('jobs', {}, defaultCompanyId()))), { replace: true });
}

function submitInviteCode(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const inviteCode = String(form.invite_code || '').trim();
  if (!inviteCode) {
    state.loginError = 'Invite code is required.';
    render();
    return;
  }
  state.loginError = '';
  state.authMessage = '';
  state.authMode = 'register';
  const params = new URLSearchParams({ invite: inviteCode });
  const returnUrl = safeReturnUrl(form.return_url || '');
  if (returnUrl) params.set('return_url', returnUrl);
  navigate(`/login?${params.toString()}`, { replace: true });
}

async function registerWorkspace(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const client = createSupabaseClient();
  if (!client?.auth) {
    state.loginError = 'Supabase auth is unavailable.';
    render();
    return;
  }
  const email = String(form.email || '').trim();
  const password = String(form.password || '');
  const fullName = String(form.full_name || '').trim();
  const inviteToken = String(form.invite_token || '').trim();
  const companyName = String(form.company_name || '').trim();
  if (!email || !password || !fullName || (!inviteToken && !companyName)) {
    state.loginError = inviteToken ? 'Name, email, and password are required.' : 'Name, email, password, and company workspace are required.';
    render();
    return;
  }
  state.loginError = '';
  state.authMessage = inviteToken ? 'Creating account and accepting invite...' : 'Creating secure workspace...';
  render();
  const signUp = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (signUp.error) {
    state.loginError = signUp.error.message || 'Unable to create account.';
    state.authMessage = '';
    render();
    return;
  }
  let session = signUp.data.session;
  if (!session) {
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      state.loginError = 'Account created. Please sign in to finish workspace setup.';
      state.authMode = 'signin';
      state.authMessage = '';
      render();
      return;
    }
    session = signIn.data.session;
  }
  await setSupabaseSession(session);
  if (inviteToken) {
    await acceptCompanyInvite(inviteToken, form.return_url);
    return;
  }
  const workspace = await client.rpc('create_company_workspace', { company_name: companyName });
  if (workspace.error) {
    state.loginError = workspace.error.message || 'Account created, but workspace setup failed.';
    state.authMessage = '';
    render();
    return;
  }
  state.activeCompanyId = canonicalCompanyId(workspace.data || defaultCompanyId());
  localStorage.setItem(COMPANY_KEY, state.activeCompanyId);
  state.dataLoaded = false;
  state.authMessage = '';
  navigate(companyPath('settings', { tab: 'billing' }, state.activeCompanyId), { replace: true });
}

async function createWorkspaceForCurrentUser(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const client = createSupabaseClient();
  const companyName = String(form.company_name || '').trim();
  if (!client || !companyName) {
    state.loginError = 'Company workspace name is required.';
    render();
    return;
  }
  const workspace = await client.rpc('create_company_workspace', { company_name: companyName });
  if (workspace.error) {
    state.loginError = workspace.error.message || 'Workspace setup failed.';
    render();
    return;
  }
  state.activeCompanyId = canonicalCompanyId(workspace.data || defaultCompanyId());
  localStorage.setItem(COMPANY_KEY, state.activeCompanyId);
  state.dataLoaded = false;
  navigate(companyPath('settings', { tab: 'billing' }, state.activeCompanyId), { replace: true });
}

async function requestCompanyAccess(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const client = createSupabaseClient();
  if (!client?.auth) {
    state.loginError = 'Supabase auth is unavailable.';
    render();
    return;
  }
  const email = String(form.email || '').trim();
  const password = String(form.password || '');
  const companyId = canonicalCompanyId(form.company_id || '');
  state.loginError = '';
  state.authMessage = 'Submitting access request...';
  render();
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    state.loginError = signIn.error.message || 'Sign in first to request access.';
    state.authMessage = '';
    render();
    return;
  }
  await setSupabaseSession(signIn.data.session);
  const request = await client.rpc('request_company_access', {
    target_company_id: companyId,
    request_message: String(form.message || '').trim() || null,
  });
  if (request.error) {
    state.loginError = request.error.message || 'Unable to request access.';
    state.authMessage = '';
    render();
    return;
  }
  state.authMessage = 'Access request sent. An Owner/Admin must approve it.';
  state.loginError = '';
  state.authMode = 'signin';
  render();
}

async function startCheckout() {
  const companyId = activeCompanyId();
  state.sync = { label: 'Opening billing...', mode: 'loading' };
  render();
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeSession().access_token ? { Authorization: `Bearer ${activeSession().access_token}` } : {}),
      },
      body: JSON.stringify({
        company_id: companyId,
        return_url: `${window.location.origin}${appHref(companyPath('settings', { tab: 'billing' }, companyId))}`,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(payload.error || 'Billing is not configured yet.');
    window.location.href = payload.url;
  } catch (error) {
    state.sync = { label: error.message || 'Billing unavailable', mode: 'local' };
    render();
  }
}

async function saveRole(formNode) {
  const companyId = activeCompanyId();
  const data = new FormData(formNode);
  const role = normalizeRole({
    id: crypto.randomUUID(),
    company_id: companyId,
    name: data.get('name'),
    color: data.get('color') || '#f0b23b',
    priority: data.get('priority') || 100,
    is_system: false,
    created_by: activeSession().profile.id,
  });
  const permissions = data.getAll('permissions').map((permission) => String(permission || '')).filter(Boolean);
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const roleResult = await client.from('roles').insert(role).select().single();
    if (roleResult.error) {
      state.sync = { label: roleResult.error.message || 'Role save failed', mode: 'local' };
      render();
      return;
    }
    const savedRole = normalizeRole(roleResult.data);
    const rows = permissions.map((permission_key) => ({ role_id: savedRole.id, permission_key, effect: 'allow' }));
    if (rows.length) await client.from('role_permissions').insert(rows);
    state.roles.unshift(savedRole);
    state.rolePermissions = rows.concat(state.rolePermissions).map(normalizeRolePermission);
    state.sync = { label: 'Role saved', mode: 'live' };
  } else {
    state.roles.unshift(role);
    state.rolePermissions = permissions.map((permission_key) => normalizeRolePermission({ role_id: role.id, permission_key, effect: 'allow' })).concat(state.rolePermissions);
    state.sync = { label: 'Role saved locally', mode: 'local' };
  }
  state.modal = '';
  render();
}

async function saveInvite(formNode) {
  const data = new FormData(formNode);
  const companyId = canonicalCompanyId(data.get('company_id') || activeCompanyId());
  const email = String(data.get('email') || '').trim().toLowerCase();
  const roleId = String(data.get('role_id') || '').trim();
  if (!email) {
    state.sync = { label: 'Invite email is required', mode: 'local' };
    render();
    return;
  }

  const invite = normalizeCompanyInvite({
    id: crypto.randomUUID(),
    company_id: companyId,
    email,
    role_id: isUuid(roleId) ? roleId : '',
    token: generateInviteCode(),
    status: 'pending',
    invited_by: activeSession().profile.id,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  });
  const client = createSupabaseClient();

  if (state.session?.auth === 'supabase' && client) {
    const payload = {
      company_id: invite.company_id,
      email: invite.email,
      role_id: invite.role_id || null,
      token: invite.token,
      status: 'pending',
      invited_by: activeSession().profile.id,
    };
    const result = await client.from('company_invites').insert(payload).select().single();
    if (result.error) {
      state.sync = { label: result.error.message || 'Invite save failed', mode: 'local' };
      render();
      return;
    }
    state.companyInvites.unshift(normalizeCompanyInvite(result.data));
    await recordAuditEvent(invite.company_id, 'invite.created', 'company_invite', result.data.id, { email: invite.email }, true);
    state.sync = { label: 'Invite code created. Copy it for the new user.', mode: 'live' };
  } else {
    state.companyInvites.unshift(invite);
    recordAuditEvent(invite.company_id, 'invite.created', 'company_invite', invite.id, { email: invite.email });
    state.sync = { label: 'Invite code created locally', mode: 'local' };
  }

  notifyLocalEvent('access.invite', 'Invite code created', `${actorName()} created an invite code for ${invite.email}.`, companyPath('settings', { tab: 'access' }, invite.company_id), 'invite', invite.id, invite.company_id);
  state.modal = '';
  render();
}

async function acceptCompanyInvite(token, fallbackReturnUrl = '') {
  const client = createSupabaseClient();
  if (!client) {
    state.loginError = 'Supabase auth is unavailable.';
    state.authMessage = '';
    render();
    return;
  }
  state.authMessage = 'Accepting workspace invite...';
  render();
  const result = await client.rpc('accept_company_invite', { invite_token: String(token || '').trim() });
  if (result.error) {
    state.loginError = result.error.message || 'Unable to accept invite.';
    state.authMessage = '';
    render();
    return;
  }
  const companyId = canonicalCompanyId(result.data || defaultCompanyId());
  state.activeCompanyId = companyId;
  localStorage.setItem(COMPANY_KEY, companyId);
  state.authMessage = '';
  state.loginError = '';
  state.dataLoaded = false;
  navigate(companyPath('jobs', {}, companyId), { replace: true });
}

async function copyInviteLink(inviteId) {
  const invite = state.companyInvites.find((item) => item.id === inviteId);
  if (!invite?.token) {
    state.sync = { label: 'Invite link is unavailable', mode: 'local' };
    render();
    return;
  }
  try {
    await navigator.clipboard.writeText(inviteLink(invite));
    state.sync = { label: 'Invite link copied', mode: 'live' };
  } catch {
    state.sync = { label: 'Copy failed', mode: 'local' };
  }
  render();
}

async function copyInviteCode(inviteId) {
  const invite = state.companyInvites.find((item) => item.id === inviteId);
  if (!invite?.token) {
    state.sync = { label: 'Invite code is unavailable', mode: 'local' };
    render();
    return;
  }
  try {
    await navigator.clipboard.writeText(invite.token);
    state.sync = { label: 'Invite code copied', mode: 'live' };
  } catch {
    state.sync = { label: 'Copy failed', mode: 'local' };
  }
  render();
}

async function revokeInvite(inviteId) {
  const invite = state.companyInvites.find((item) => item.id === inviteId);
  if (!invite) return;
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.rpc('revoke_company_invite', { target_invite_id: invite.id });
    if (result.error) {
      state.sync = { label: result.error.message || 'Invite revoke failed', mode: 'local' };
      render();
      return;
    }
    state.sync = { label: 'Invite revoked', mode: 'live' };
  } else {
    state.sync = { label: 'Invite revoked locally', mode: 'local' };
  }
  state.companyInvites = state.companyInvites.map((item) => (item.id === invite.id ? normalizeCompanyInvite({ ...item, status: 'revoked' }) : item));
  recordAuditEvent(invite.company_id, 'invite.revoked', 'company_invite', invite.id, { email: invite.email });
  notifyLocalEvent('access.invite', 'Invite revoked', `${actorName()} revoked the invite for ${invite.email}.`, companyPath('settings', { tab: 'access' }, invite.company_id), 'invite', invite.id, invite.company_id);
  persistAll();
  render();
}

async function saveUserAccess(formNode) {
  const data = new FormData(formNode);
  const companyId = canonicalCompanyId(data.get('company_id') || activeCompanyId());
  const profileId = String(data.get('profile_id') || '').trim();
  const roleId = String(data.get('role_id') || '').trim();
  const status = ['active', 'pending', 'disabled', 'left'].includes(String(data.get('membership_status'))) ? String(data.get('membership_status')) : 'active';
  const role = roleById(companyId, roleId);
  if (!profileId || !role) {
    state.sync = { label: 'Select a user and role', mode: 'local' };
    render();
    return;
  }
  const validationMessage = validateMembershipChange(companyId, profileId, role, status);
  if (validationMessage) {
    state.sync = { label: validationMessage, mode: 'local' };
    render();
    return;
  }

  const membership = normalizeMembership({
    company_id: companyId,
    profile_id: profileId,
    role: membershipRoleForRole(role),
    status,
  });
  const previousMembership = membershipForProfile(companyId, profileId);
  const assignment = normalizeRoleAssignment({
    company_id: companyId,
    profile_id: profileId,
    role_id: role.id,
    assigned_by: activeSession().profile.id,
  });
  const client = createSupabaseClient();

  if (state.session?.auth === 'supabase' && client) {
    const canPersistRoleAssignment = isUuid(role.id);
    const membershipResult = await client.rpc('update_company_member_access', {
      target_company_id: companyId,
      target_profile_id: profileId,
      target_role: membership.role,
      target_role_id: canPersistRoleAssignment ? role.id : null,
      target_status: status,
    });
    if (membershipResult.error) {
      state.sync = { label: membershipResult.error.message || 'Access update failed', mode: 'local' };
      render();
      return;
    }
    upsertMembership(normalizeMembership(membershipResult.data || membership));
    if (canPersistRoleAssignment) replaceRoleAssignment(assignment);
    state.sync = { label: canPersistRoleAssignment ? 'User access saved' : 'Membership saved; create a role to assign permissions', mode: 'live' };
  } else {
    upsertMembership(membership);
    replaceRoleAssignment(assignment);
    state.sync = { label: 'User access saved locally', mode: 'local' };
  }

  notifyLocalEvent('access.role', 'User access updated', `${actorName()} set ${profileName(profileId)} to ${role.name} / ${titleCase(status)}.`, companyPath('settings', { tab: 'access' }, companyId), 'membership', profileId, companyId);
  recordAuditEvent(companyId, membershipAuditEventType(previousMembership, membership), 'membership', profileId, { role: role.name, status });
  render();
}

async function updateJoinRequest(requestId, status) {
  const request = state.joinRequests.find((item) => item.id === requestId);
  if (!request || !['approved', 'rejected'].includes(status)) return;
  const client = createSupabaseClient();
  const nextRequest = normalizeJoinRequest({ ...request, status });
  const membership = normalizeMembership({
    company_id: request.company_id,
    profile_id: request.profile_id,
    role: 'member',
    status: status === 'approved' ? 'active' : 'disabled',
  });

  if (state.session?.auth === 'supabase' && client) {
    const requestResult = await client.rpc('review_company_join_request', {
      target_request_id: request.id,
      decision: status,
      target_role_id: null,
    });
    if (requestResult.error) {
      state.sync = { label: requestResult.error.message || 'Request update failed', mode: 'local' };
      render();
      return;
    }
    if (status === 'approved') upsertMembership(membership);
    state.sync = { label: status === 'approved' ? 'Access approved' : 'Request rejected', mode: 'live' };
  } else {
    if (status === 'approved') upsertMembership(membership);
    state.sync = { label: status === 'approved' ? 'Access approved locally' : 'Request rejected locally', mode: 'local' };
  }

  state.joinRequests = state.joinRequests.map((item) => (item.id === request.id ? nextRequest : item));
  recordAuditEvent(request.company_id, status === 'approved' ? 'join.approved' : 'join.rejected', 'join_request', request.id, { email: request.requested_email });
  notifyLocalEvent('access.request', status === 'approved' ? 'Access approved' : 'Access rejected', `${actorName()} ${status === 'approved' ? 'approved' : 'rejected'} ${request.requested_email || 'a join request'}.`, companyPath('settings', { tab: 'access' }, request.company_id), 'join_request', request.id, request.company_id);
  persistAll();
  render();
}

async function saveMessageGroup(form) {
  const companyId = activeCompanyId();
  if (!can('messages.create_group', companyId)) {
    showToast('Your role cannot create group chats.', 'local', 'Messages');
    return;
  }
  const data = new FormData(form);
  const type = ['company', 'role', 'custom'].includes(data.get('type')) ? String(data.get('type')) : 'custom';
  const conversation = normalizeMessageConversation({
    id: crypto.randomUUID(),
    company_id: companyId,
    title: String(data.get('title') || '').trim() || 'New group chat',
    type,
    created_by: activeSession().profile.id,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const accessRows = messageAccessFromForm(data, conversation, type);
  if (!accessRows.some((row) => row.target_type === 'profile' && row.target_id === activeSession().profile.id) && type !== 'company') {
    accessRows.push(normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: conversation.id, target_type: 'profile', target_id: activeSession().profile.id }));
  }
  const saved = await persistConversation(conversation, accessRows);
  if (!saved) return;
  state.selectedConversationId = conversation.id;
  state.modal = '';
  notifyLocalEvent('message.group', 'Group chat created', `${actorName()} created ${conversation.title}.`, companyPath('messages', { conversation: conversation.id }, companyId), 'message_conversation', conversation.id, companyId);
  navigate(companyPath('messages', { conversation: conversation.id }, companyId), { replace: true });
}

async function saveDirectMessage(form) {
  const companyId = activeCompanyId();
  const data = new FormData(form);
  const targetId = String(data.get('profile_id') || '').trim();
  if (!targetId) {
    showToast('Choose a person first.', 'local', 'Messages');
    return;
  }
  const conversation = normalizeMessageConversation({
    id: crypto.randomUUID(),
    company_id: companyId,
    title: profileName(targetId),
    type: 'direct',
    created_by: activeSession().profile.id,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const accessRows = [
    normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: conversation.id, target_type: 'profile', target_id: activeSession().profile.id }),
    normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: conversation.id, target_type: 'profile', target_id: targetId }),
  ];
  const saved = await persistConversation(conversation, accessRows);
  if (!saved) return;
  state.selectedConversationId = conversation.id;
  state.modal = '';
  const body = String(data.get('body') || '').trim();
  if (body) await createMessageRecord(conversation, body, []);
  notifyLocalEvent('message.direct', 'Direct message started', `${actorName()} started a direct message with ${conversation.title}.`, companyPath('messages', { conversation: conversation.id }, companyId), 'message_conversation', conversation.id, companyId);
  navigate(companyPath('messages', { conversation: conversation.id }, companyId), { replace: true });
}

async function saveMessageAccess(form) {
  const companyId = activeCompanyId();
  if (!can('messages.manage_groups', companyId) && !can('messages.manage', companyId)) {
    showToast('Your role cannot manage chat access.', 'local', 'Messages');
    return;
  }
  const conversation = state.messageConversations.find((item) => item.id === form.dataset.conversationId);
  if (!conversation) return;
  const data = new FormData(form);
  const next = normalizeMessageConversation({
    ...conversation,
    title: String(data.get('title') || '').trim() || conversation.title,
    type: MESSAGE_TYPES.includes(data.get('type')) ? String(data.get('type')) : conversation.type,
    updated_at: new Date().toISOString(),
  });
  const accessRows = messageAccessFromForm(data, next, next.type);
  if (next.type !== 'company' && !accessRows.some((row) => row.target_type === 'profile' && row.target_id === activeSession().profile.id)) {
    accessRows.push(normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: next.id, target_type: 'profile', target_id: activeSession().profile.id }));
  }
  const saved = await persistConversation(next, accessRows, true);
  if (!saved) return;
  state.modal = '';
  showToast('Chat access saved.', state.session?.auth === 'supabase' ? 'live' : 'local', 'Messages');
  render();
}

async function sendMessage(form) {
  const conversation = state.messageConversations.find((item) => item.id === form.dataset.conversationId);
  if (!conversation) return;
  if (!can('messages.send', conversation.company_id)) {
    showToast('Your role cannot send messages.', 'local', 'Messages');
    return;
  }
  const data = new FormData(form);
  const body = String(data.get('body') || '').trim();
  const files = Array.from(form.elements.attachments?.files || []);
  if (!body && !files.length) {
    showToast('Type a message or attach a file.', 'local', 'Messages');
    return;
  }
  if (files.length && !can('messages.attach_files', conversation.company_id)) {
    showToast('Your role cannot attach files.', 'local', 'Messages');
    return;
  }
  await createMessageRecord(conversation, body, files);
  form.reset();
  render();
}

async function createMessageRecord(conversation, body, files) {
  const now = new Date().toISOString();
  const message = normalizeMessage({
    id: crypto.randomUUID(),
    conversation_id: conversation.id,
    company_id: conversation.company_id,
    sender_profile_id: activeSession().profile.id,
    body,
    message_type: files.length ? 'attachment' : 'text',
    created_at: now,
    updated_at: now,
  });
  const client = createSupabaseClient();
  let savedMessage = message;
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.from('messages').insert(messagePayload(message)).select().single();
    if (result.error) {
      showToast(result.error.message || 'Message send failed.', 'local', 'Messages');
      return null;
    }
    savedMessage = normalizeMessage(result.data);
  }
  state.messages = state.messages.concat(savedMessage);
  const attachments = await saveMessageAttachments(savedMessage, files);
  const updatedConversation = { ...conversation, last_message_at: savedMessage.created_at, updated_at: savedMessage.created_at };
  state.messageConversations = state.messageConversations.map((item) => (item.id === conversation.id ? updatedConversation : item));
  if (state.session?.auth === 'supabase' && client) {
    await client.from('message_conversations').update({ last_message_at: savedMessage.created_at, updated_at: savedMessage.created_at }).eq('id', conversation.id);
  }
  markConversationRead(conversation.id, false);
  notifyMessageEvents(updatedConversation, savedMessage, attachments);
  persistMessages();
  return savedMessage;
}

async function saveMessageAttachments(message, files) {
  const client = createSupabaseClient();
  const saved = [];
  for (const file of files) {
    const id = crypto.randomUUID();
    const objectPath = `${message.company_id}/${message.conversation_id}/${id}-${slugify(file.name || 'attachment')}`;
    let previewUrl = '';
    let objectSaved = '';
    if (state.session?.auth === 'supabase' && client) {
      const upload = await client.storage
        .from('quest-message-attachments')
        .upload(objectPath, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream' });
      if (upload.error) {
        showToast(upload.error.message || 'Attachment upload failed.', 'local', 'Messages');
        continue;
      }
      objectSaved = objectPath;
    } else if (file.type?.startsWith('image/') && file.size <= 220000) {
      previewUrl = await fileToDataUrl(file);
    }
    const attachment = normalizeMessageAttachment({
      id,
      conversation_id: message.conversation_id,
      message_id: message.id,
      company_id: message.company_id,
      bucket_id: 'quest-message-attachments',
      object_path: objectSaved,
      file_name: file.name || 'attachment',
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size || 0,
      preview_url: previewUrl,
      created_at: new Date().toISOString(),
    });
    if (state.session?.auth === 'supabase' && client) {
      const result = await client.from('message_attachments').insert(messageAttachmentPayload(attachment)).select().single();
      if (result.error) {
        showToast(result.error.message || 'Attachment record failed.', 'local', 'Messages');
        if (objectSaved) await client.storage.from('quest-message-attachments').remove([objectSaved]);
        continue;
      }
      saved.push(normalizeMessageAttachment(result.data));
    } else {
      saved.push(attachment);
    }
  }
  state.messageAttachments = state.messageAttachments.concat(saved);
  return saved;
}

async function persistConversation(conversation, accessRows, update = false) {
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const conversationResult = update
      ? await client.from('message_conversations').update(messageConversationPayload(conversation)).eq('id', conversation.id).select().single()
      : await client.from('message_conversations').insert(messageConversationPayload(conversation)).select().single();
    if (conversationResult.error) {
      showToast(conversationResult.error.message || 'Conversation save failed.', 'local', 'Messages');
      return false;
    }
    await client.from('message_conversation_access').delete().eq('conversation_id', conversation.id);
    if (accessRows.length) {
      const accessResult = await client.from('message_conversation_access').insert(accessRows.map(messageAccessPayload));
      if (accessResult.error) {
        showToast(accessResult.error.message || 'Conversation access save failed.', 'local', 'Messages');
        return false;
      }
    }
    conversation = normalizeMessageConversation(conversationResult.data);
    state.sync = { label: 'Quest Supabase live', mode: 'live' };
  }
  state.messageConversations = [conversation].concat(state.messageConversations.filter((item) => item.id !== conversation.id));
  state.messageAccess = accessRows.concat(state.messageAccess.filter((item) => item.conversation_id !== conversation.id));
  markConversationRead(conversation.id, false);
  persistMessages();
  return true;
}

async function deleteMessage(messageId) {
  const message = state.messages.find((item) => item.id === messageId);
  if (!message) return;
  const own = message.sender_profile_id === activeSession().profile.id;
  if (!((own && can('messages.delete_own', message.company_id)) || can('messages.delete_any', message.company_id))) {
    showToast('Your role cannot delete this message.', 'local', 'Messages');
    return;
  }
  const deletedAt = new Date().toISOString();
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.from('messages').update({ deleted_at: deletedAt, updated_at: deletedAt }).eq('id', message.id);
    if (result.error) {
      showToast(result.error.message || 'Message delete failed.', 'local', 'Messages');
      return;
    }
  }
  state.messages = state.messages.map((item) => (item.id === message.id ? { ...item, deleted_at: deletedAt, updated_at: deletedAt } : item));
  persistMessages();
  render();
}

async function openMessageAttachment(attachmentId) {
  const attachment = state.messageAttachments.find((item) => item.id === attachmentId);
  if (!attachment) return;
  if (attachment.preview_url) {
    window.open(attachment.preview_url, '_blank', 'noopener,noreferrer');
    return;
  }
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client && attachment.object_path) {
    const result = await client.storage.from(attachment.bucket_id || 'quest-message-attachments').createSignedUrl(attachment.object_path, 900, { download: attachment.file_name });
    if (!result.error && result.data?.signedUrl) {
      window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }
  showToast('This demo attachment is metadata-only.', 'local', 'Messages');
}

function onDocumentInput(event) {
  if (event.target.matches('[data-global-search]')) {
    state.query = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-file-search]')) {
    state.fileQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-form-search]')) {
    state.formQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-crm-search]')) {
    state.crmQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-message-search]')) {
    state.messageQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-message-access-filter]')) {
    filterMessagePeopleList(event.target);
    return;
  }
  if (event.target.matches('[data-form-field]')) {
    updateFormField(event.target);
    return;
  }
  if (event.target.matches('[data-question-field]') || event.target.matches('[data-question-option]')) {
    updateQuestionField(event.target);
  }
}

function onDocumentChange(event) {
  if (event.target.matches('[data-company-switch]')) {
    const nextCompanyId = event.target.value || defaultCompanyId();
    setActiveCompany(nextCompanyId);
    return;
  }
  if (event.target.matches('[data-stage-filter]')) {
    state.stageFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-crm-stage-filter]')) {
    state.crmStageFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-crm-owner-filter]')) {
    state.crmOwnerFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-task-status-filter]')) {
    state.taskStatusFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-task-priority-filter]')) {
    state.taskPriorityFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-task-job-filter]')) {
    const jobId = event.target.value;
    navigate(companyPath('tasks', jobId ? { job_id: jobId } : {}, activeCompanyId()));
    return;
  }
  if (event.target.matches('[data-analytics-job-filter]')) {
    const jobId = event.target.value;
    navigate(companyPath('analytics', jobId ? { job_id: jobId } : {}, activeCompanyId()));
    return;
  }
  if (event.target.matches('[data-file-category-filter]')) {
    state.fileCategoryFilter = event.target.value || 'All categories';
    render();
    return;
  }
  if (event.target.matches('[data-file-folder-filter]')) {
    const folder = event.target.value === 'home' ? '' : event.target.value;
    const jobId = state.route?.jobId || '';
    navigate(companyPath('files', { ...(folder ? { folder } : {}), ...(jobId ? { job_id: jobId } : {}) }, activeCompanyId()));
    return;
  }
  if (event.target.matches('[data-file-job-filter]')) {
    const jobId = event.target.value;
    navigate(companyPath('files', { ...(jobId ? { folder: 'jobs', job_id: jobId } : {}) }, activeCompanyId()));
    return;
  }
  if (event.target.matches('[data-form-type-filter]')) {
    state.formTypeFilter = event.target.value || 'all';
    render();
    return;
  }
  if (event.target.matches('[data-form-field]')) {
    updateFormField(event.target);
    return;
  }
  if (event.target.matches('[data-question-field]') || event.target.matches('[data-question-option]')) {
    updateQuestionField(event.target);
  }
}

async function saveJob(form) {
  const payload = normalizeJob(Object.fromEntries(new FormData(form).entries()));
  payload.id = payload.id || crypto.randomUUID();
  payload.company_id = payload.company_id || activeCompanyId();
  payload.estimate_total = Number(payload.estimate_total || 0);
  payload.invoice_total = Number(payload.invoice_total || 0);
  payload.updated_at = new Date().toISOString();

  const existing = state.jobs.some((job) => job.id === payload.id);
  const client = createSupabaseClient();

  if (client) {
    const result = existing
      ? await client.from('jobs').update(payload).eq('id', payload.id).select().single()
      : await client.from('jobs').insert(payload).select().single();
    if (!result.error && result.data) {
      upsertJob(normalizeJob(result.data));
      state.sync = { label: 'Quest Supabase live', mode: 'live' };
      state.modal = '';
      navigate(companyPath('jobs', { tab: 'profile', job_id: result.data.id }, payload.company_id), { replace: true });
      return;
    }
    state.sync = { label: 'Saved locally', mode: 'local' };
  }

  upsertJob(payload);
  state.modal = '';
  navigate(companyPath('jobs', { tab: 'profile', job_id: payload.id }, payload.company_id), { replace: true });
}

async function deleteJob(id) {
  if (!id) return;
  const companyId = activeCompanyId();
  const client = createSupabaseClient();
  if (client) await client.from('jobs').delete().eq('id', id);
  state.jobs = state.jobs.filter((job) => job.id !== id);
  state.selectedJobId = companyJobs(companyId)[0]?.id || '';
  state.modal = '';
  persistAll();
  navigate(companyPath('jobs', { tab: 'list' }, companyId), { replace: true });
}

async function saveTask(form) {
  const companyId = activeCompanyId();
  const formData = Object.fromEntries(new FormData(form).entries());
  const payload = normalizeTask({
    ...formData,
    id: String(formData.id || '').trim() || `task-${crypto.randomUUID()}`,
    company_id: companyId,
    creator_id: activeSession().profile.member_id || companyMembers(companyId)[0]?.id || 'abraham',
    urgency: formData.priority || 'medium',
    watchers: [],
    subtasks: [],
    activity: [],
    updated_at: new Date().toISOString(),
  });

  const previous = taskById(payload.id);
  const existing = !!previous;
  const client = createSupabaseClient();
  if (client) {
    const savePayload = taskPayload(payload);
    const result = existing
      ? await client.from('tasks').update(savePayload).eq('id', payload.id).select().single()
      : await client.from('tasks').insert(savePayload).select().single();
    if (!result.error && result.data) {
      const savedTask = normalizeTask(result.data);
      upsertTask(savedTask);
      notifyTaskChange(savedTask, previous);
      state.sync = { label: 'Quest Supabase live', mode: 'live' };
      state.modal = '';
      navigate(companyPath('tasks', { ...(payload.project_id ? { job_id: payload.project_id } : {}), task_id: payload.id }, companyId), { replace: true });
      return;
    }
    state.sync = { label: 'Task saved locally', mode: 'local' };
  }

  upsertTask(payload);
  notifyTaskChange(payload, previous);
  state.modal = '';
  navigate(companyPath('tasks', { ...(payload.project_id ? { job_id: payload.project_id } : {}), task_id: payload.id }, companyId), { replace: true });
}

async function deleteTask(id) {
  if (!id) return;
  const companyId = activeCompanyId();
  const client = createSupabaseClient();
  if (client) await client.from('tasks').delete().eq('id', id);
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.selectedTaskId = '';
  state.modal = '';
  persistAll();
  navigate(companyPath('tasks', {}, companyId), { replace: true });
}

async function saveFileRecord(form) {
  const companyId = activeCompanyId();
  const formData = new FormData(form);
  const fields = Object.fromEntries(formData.entries());
  const selectedFiles = Array.from(form.elements.files?.files || []);
  const metadataName = String(fields.file_name || '').trim();
  const uploadList = selectedFiles.length ? selectedFiles : (metadataName ? [null] : []);
  if (!uploadList.length) {
    state.sync = { label: 'Choose a file or enter a file name', mode: 'local' };
    render();
    return;
  }
  const client = createSupabaseClient();
  let liveSaved = 0;
  for (const item of uploadList) {
    const fileId = crypto.randomUUID();
    const fileName = item?.name || metadataName;
    const folder = String(fields.folder || 'shared');
    const objectPath = `${companyId}/${fields.job_id ? `jobs/${fields.job_id}` : folder}/${fileId}-${slugify(fileName)}`;
    let uploaded = false;
    if (client && item) {
      const storageResult = await client.storage
        .from('quest-job-files')
        .upload(objectPath, item, { cacheControl: '3600', upsert: false, contentType: item.type || 'application/octet-stream' });
      uploaded = !storageResult.error;
    }
    const payload = normalizeFile({
      id: fileId,
      company_id: companyId,
      job_id: fields.job_id || '',
      folder,
      file_name: fileName,
      mime_type: item?.type || 'application/octet-stream',
      size_bytes: item?.size || Number(fields.size_bytes || 0),
      category: fields.category || folderLabel(folder),
      notes: fields.notes || '',
      uploaded_by_label: fields.uploaded_by_label || activeSession().profile.full_name,
      bucket_id: 'quest-job-files',
      object_path: uploaded || !item ? objectPath : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (client) {
      const result = await client.from('job_files').insert(filePayload(payload)).select().single();
      if (!result.error && result.data) {
        upsertFile(normalizeFile(result.data));
        liveSaved += 1;
        continue;
      }
      if (uploaded) await client.storage.from('quest-job-files').remove([objectPath]);
    }
    upsertFile(payload);
  }

  state.sync = liveSaved === uploadList.length
    ? { label: 'Quest Supabase live', mode: 'live' }
    : { label: liveSaved ? 'Some files saved locally' : 'File record saved locally', mode: liveSaved ? 'loading' : 'local' };
  notifyLocalEvent(
    'file.added',
    uploadList.length > 1 ? 'Files added' : 'File added',
    `${actorName()} added ${uploadList.length} file${uploadList.length === 1 ? '' : 's'} to ${folderLabel(fields.folder || 'shared')}.`,
    companyPath('files', { folder: fields.folder || 'shared', ...(fields.job_id ? { job_id: fields.job_id } : {}) }, companyId),
    'file',
    fields.job_id || '',
    companyId,
  );
  state.modal = '';
  navigate(companyPath('files', { folder: fields.folder || 'shared', ...(fields.job_id ? { job_id: fields.job_id } : {}) }, companyId), { replace: true });
}

function createDriveFolder(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const name = String(fields.name || '').trim();
  if (!name) {
    state.sync = { label: 'Folder name is required', mode: 'local' };
    render();
    return;
  }
  const folder = normalizeDriveFolder({
    id: `folder-${crypto.randomUUID()}`,
    company_id: activeCompanyId(),
    name,
    parent_key: fields.parent_key || 'home',
    created_by_label: activeSession().profile.full_name || 'Quest HQ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  state.driveFolders.unshift(folder);
  state.modal = '';
  state.sync = { label: 'Folder created locally', mode: 'local' };
  notifyLocalEvent('file.folder', 'Folder created', `${actorName()} created ${folder.name}.`, companyPath('files', { folder: folder.id }, folder.company_id), 'folder', folder.id, folder.company_id);
  persistAll();
  render();
}

function saveFinanceInvoice(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const linkedJob = jobById(fields.job_id);
  const previous = String(fields.id || '').trim() ? financeInvoiceById(String(fields.id).trim()) : null;
  const invoice = normalizeFinanceInvoice({
    ...fields,
    id: String(fields.id || '').trim() || `invoice-${crypto.randomUUID()}`,
    company_id: companyId,
    client_name: String(fields.client_name || linkedJob?.client_name || '').trim(),
    total: number(fields.subtotal) + number(fields.tax),
    updated_at: new Date().toISOString(),
  });
  upsertFinanceInvoice(invoice);
  if (previous?.job_id && previous.job_id !== invoice.job_id) syncJobInvoiceTotal(previous.job_id);
  syncJobInvoiceTotal(invoice.job_id);
  state.modal = '';
  state.sync = { label: 'Finance saved locally', mode: 'local' };
  notifyLocalEvent('finance.invoice', previous ? 'Invoice updated' : 'Invoice created', `${actorName()} ${previous ? 'updated' : 'created'} ${invoice.invoice_number}.`, companyPath('finance', { invoice: invoice.id }, companyId), 'invoice', invoice.id, companyId);
  navigate(companyPath('finance', { invoice: invoice.id }, companyId), { replace: true });
}

function saveFinancePayment(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const invoice = financeInvoiceById(fields.invoice_id);
  if (!invoice || invoice.company_id !== companyId) {
    state.sync = { label: 'Create an invoice before recording a payment', mode: 'local' };
    render();
    return;
  }
  const payment = normalizeFinancePayment({
    ...fields,
    id: `payment-${crypto.randomUUID()}`,
    company_id: companyId,
    created_at: new Date().toISOString(),
  });
  state.financePayments.unshift(payment);
  invoice.status = invoiceBalance(invoice.id) <= 0 ? 'Paid' : 'Partially paid';
  invoice.updated_at = new Date().toISOString();
  syncJobInvoiceTotal(invoice.job_id);
  persistAll();
  state.modal = '';
  state.sync = { label: 'Payment recorded locally', mode: 'local' };
  notifyLocalEvent('finance.payment', 'Payment recorded', `${actorName()} recorded ${money(payment.amount)} for ${invoice.invoice_number}.`, companyPath('finance', { invoice: payment.invoice_id }, companyId), 'payment', payment.id, companyId);
  navigate(companyPath('finance', payment.invoice_id ? { invoice: payment.invoice_id } : {}, companyId), { replace: true });
}

function saveFinanceExpense(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const expense = normalizeFinanceExpense({
    ...fields,
    id: String(fields.id || '').trim() || `expense-${crypto.randomUUID()}`,
    company_id: companyId,
    updated_at: new Date().toISOString(),
  });
  upsertFinanceExpense(expense);
  state.modal = '';
  state.sync = { label: 'Expense saved locally', mode: 'local' };
  notifyLocalEvent('finance.expense', 'Expense saved', `${actorName()} saved a ${money(expense.amount)} ${expense.category} expense.`, companyPath('finance', { expense: expense.id }, companyId), 'expense', expense.id, companyId);
  navigate(companyPath('finance', { expense: expense.id }, companyId), { replace: true });
}

function saveFinanceVendor(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const vendor = normalizeFinanceVendor({
    ...fields,
    id: String(fields.id || '').trim() || `vendor-${crypto.randomUUID()}`,
    company_id: companyId,
    updated_at: new Date().toISOString(),
  });
  upsertFinanceVendor(vendor);
  state.modal = '';
  state.sync = { label: 'Vendor saved locally', mode: 'local' };
  notifyLocalEvent('finance.vendor', 'Vendor saved', `${actorName()} saved vendor ${vendor.name}.`, companyPath('finance', { vendor: vendor.id }, companyId), 'vendor', vendor.id, companyId);
  navigate(companyPath('finance', { vendor: vendor.id }, companyId), { replace: true });
}

async function downloadFile(id) {
  const file = state.files.find((item) => item.id === id);
  if (!file?.object_path) {
    state.sync = { label: 'No stored object for this file', mode: 'local' };
    render();
    return;
  }
  const client = createSupabaseClient();
  if (!client) return;
  const result = await client.storage.from(file.bucket_id || 'quest-job-files').createSignedUrl(file.object_path, 3600, { download: file.file_name });
  if (result.error || !result.data?.signedUrl) {
    state.sync = { label: 'Download failed', mode: 'local' };
    render();
    return;
  }
  window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer');
}

async function deleteFile(id) {
  const file = state.files.find((item) => item.id === id);
  if (!file) return;
  const client = createSupabaseClient();
  if (client) {
    if (file.object_path) await client.storage.from(file.bucket_id || 'quest-job-files').remove([file.object_path]);
    await client.from('job_files').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  }
  state.files = state.files.filter((item) => item.id !== id);
  state.selectedFileId = '';
  state.modal = '';
  persistAll();
  render();
}

function upsertJob(job) {
  const index = state.jobs.findIndex((item) => item.id === job.id);
  if (index >= 0) state.jobs[index] = job;
  else state.jobs.unshift(job);
  state.selectedJobId = job.id;
  persistAll();
}

function upsertTask(task) {
  const index = state.tasks.findIndex((item) => item.id === task.id);
  if (index >= 0) state.tasks[index] = task;
  else state.tasks.unshift(task);
  state.selectedTaskId = task.id;
  persistAll();
}

function upsertFile(file) {
  const index = state.files.findIndex((item) => item.id === file.id);
  if (index >= 0) state.files[index] = file;
  else state.files.unshift(file);
  persistAll();
}

function upsertFinanceInvoice(invoice) {
  const index = state.financeInvoices.findIndex((item) => item.id === invoice.id);
  if (index >= 0) state.financeInvoices[index] = invoice;
  else state.financeInvoices.unshift(invoice);
  persistAll();
}

function upsertFinanceExpense(expense) {
  const index = state.financeExpenses.findIndex((item) => item.id === expense.id);
  if (index >= 0) state.financeExpenses[index] = expense;
  else state.financeExpenses.unshift(expense);
  persistAll();
}

function upsertFinanceVendor(vendor) {
  const index = state.financeVendors.findIndex((item) => item.id === vendor.id);
  if (index >= 0) state.financeVendors[index] = vendor;
  else state.financeVendors.unshift(vendor);
  persistAll();
}

function upsertMembership(membership) {
  const index = state.memberships.findIndex((item) => item.company_id === membership.company_id && item.profile_id === membership.profile_id);
  if (index >= 0) state.memberships[index] = membership;
  else state.memberships.unshift(membership);
  persistAll();
}

function replaceRoleAssignment(assignment) {
  state.roleAssignments = state.roleAssignments.filter((item) => item.company_id !== assignment.company_id || item.profile_id !== assignment.profile_id);
  if (assignment.role_id) state.roleAssignments.unshift(assignment);
}

function membershipPayload(membership) {
  return {
    company_id: membership.company_id,
    profile_id: membership.profile_id,
    role: membership.role,
    status: membership.status,
  };
}

function syncJobInvoiceTotal(jobId) {
  if (!jobId) return;
  const job = jobById(jobId);
  if (!job) return;
  job.invoice_total = sum(companyFinanceInvoices(job.company_id).filter((invoice) => invoice.job_id === jobId), 'total');
  job.updated_at = new Date().toISOString();
  upsertJob(job);
}

function updateWorkspaceOnly() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  reconcileSelection(state.route);
  workspace.innerHTML = renderWorkspace(state.route);
}

function getRoute() {
  const path = appPathname();
  const params = new URLSearchParams(window.location.search);
  if (path === '/login') return { name: 'login', path, params, section: '', companyId: '', jobId: '' };
  if (path === '/' || path === '/command') return { name: 'command', path, params, section: 'dashboard', companyId: activeCompanyId(), jobId: params.get('job_id') || '' };
  const companyMatch = path.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (companyMatch) {
    const section = companyMatch[2] || 'jobs';
    return {
      name: 'company',
      path,
      params,
      companyId: decodeURIComponent(companyMatch[1]),
      section,
      jobId: params.get('job_id') || '',
    };
  }
  return { name: path.replace(/^\//, '') || 'command', path, params, section: '', companyId: activeCompanyId(), jobId: params.get('job_id') || '' };
}

function normalizeLegacyLocation() {
  const path = appPathname();
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get('company_id') || params.get('company') || companyIdForJob(params.get('job_id') || params.get('project_id')) || localStorage.getItem(COMPANY_KEY) || defaultCompanyId();
  const map = Object.fromEntries(Object.entries(LEGACY_ROUTE_SECTIONS).map(([legacyPath, section]) => [legacyPath, companyPath(section, {}, companyId)]));
  Object.assign(map, {
    '/index.html': companyPath('jobs', {}, companyId),
    '/command.html': companyPath('jobs', {}, companyId),
    '/login.html': '/login',
  });

  let target = map[path];
  if (path === '/jobs') {
    const tab = params.get('tab');
    if (tab === 'tasks') target = companyPath('tasks', copyParams(params, ['job_id', 'task_id', 'new', 'edit']), companyId);
    else if (tab === 'files') target = companyPath('files', copyParams(params, ['job_id', 'folder']), companyId);
    else if (tab === 'forms') target = companyPath('forms', copyParams(params, ['job_id']), companyId);
    else if (tab === 'analytics') target = companyPath('analytics', copyParams(params, ['job_id']), companyId);
    else target = companyPath('jobs', copyParams(params, ['job_id', 'tab']), companyId);
  }
  if (path === '/files') target = companyPath('files', copyParams(params, ['job_id', 'folder']), companyId);
  if (path === '/forms') target = companyPath('forms', copyParams(params, ['job_id']), companyId);
  if (path === '/analytics') target = companyPath('analytics', copyParams(params, ['job_id']), companyId);
  if (path === '/crm') target = companyPath('crm', copyParams(params, ['account']), companyId);
  if (path === '/finance') target = companyPath('finance', copyParams(params, ['invoice', 'expense', 'vendor', 'report']), companyId);
  if (path === '/messages') target = companyPath('messages', copyParams(params, ['conversation']), companyId);
  if (path === '/admin') target = companyPath('settings', {}, companyId);
  if (path === '/time') target = companyPath('time', {}, companyId);
  if (path === '/team') target = companyPath('team-chart', {}, companyId);
  if (path === '/team-chart') target = companyPath('team-chart', {}, companyId);
  if (path === '/approvals') target = companyPath('approvals', {}, companyId);
  if (path === '/clock') target = companyPath('clock', {}, companyId);
  if (path === '/task-management.html') {
    const jobId = params.get('project_id') || params.get('job_id') || '';
    target = companyPath('tasks', jobId ? { job_id: jobId } : {}, companyIdForJob(jobId) || companyId);
  }
  const jobTaskMatch = path.match(/^\/jobs\/([^/]+)\/tasks\/?$/);
  if (jobTaskMatch) {
    const jobId = decodeURIComponent(jobTaskMatch[1]);
    target = companyPath('tasks', { job_id: jobId }, companyIdForJob(jobId) || companyId);
  }

  if (!target) return;
  window.history.replaceState({}, '', appHref(target));
}

function routeRedirect(route) {
  if (route.name !== 'company') return '';
  const allowed = allowedCompanyIds();
  if (state.session?.auth === 'supabase' && !allowed.length) return null;
  if (!allowed.includes(route.companyId)) {
    if (state.session?.auth === 'supabase') return '';
    return companyPath(route.section || 'jobs', Object.fromEntries(route.params.entries()), allowed[0] || defaultCompanyId());
  }
  const validSections = MODULE_REGISTRY.map((module) => module.id);
  if (!validSections.includes(route.section)) return companyPath('jobs', {}, route.companyId);
  const jobCompanyId = route.jobId ? companyIdForJob(route.jobId) : '';
  if (jobCompanyId && jobCompanyId !== route.companyId && allowed.includes(jobCompanyId)) {
    return companyPath(route.section, Object.fromEntries(route.params.entries()), jobCompanyId);
  }
  return '';
}

function appPathname() {
  let path = window.location.pathname || '/';
  if (BASE_PATH && path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length) || '/';
  if (!path.startsWith('/')) path = '/' + path;
  return path.replace(/\/+$/, '') || '/';
}

function appHref(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const [rawPath, rawSearch = ''] = String(path || '/').split('?');
  const normalized = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
  return `${BASE_PATH}${normalized}${rawSearch ? `?${rawSearch}` : ''}` || '/';
}

function navigate(path, options = {}) {
  const href = /^https?:\/\//i.test(path) || path.startsWith(BASE_PATH + '/') || (BASE_PATH === '' && path.startsWith('/')) ? path : appHref(path);
  if (options.replace) window.history.replaceState({}, '', href);
  else window.history.pushState({}, '', href);
  render();
}

function currentAppUrl() {
  return `${appPathname()}${window.location.search}`;
}

function safeReturnUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return appHref(companyPath('jobs', {}, defaultCompanyId()));
    return `${url.pathname}${url.search}`;
  } catch {
    return appHref(companyPath('jobs', {}, defaultCompanyId()));
  }
}

function companyPath(section = 'jobs', params = {}, companyId = activeCompanyId()) {
  const search = new URLSearchParams(params);
  for (const [key, value] of [...search.entries()]) {
    if (value === undefined || value === null || value === '') search.delete(key);
  }
  return `/company/${encodeURIComponent(canonicalCompanyId(companyId || defaultCompanyId()))}/${section}${search.toString() ? `?${search.toString()}` : ''}`;
}

function routeTitle(route) {
  if (route.name === 'company') return titleCase(route.section);
  if (route.name === 'command') return 'Company Dashboard';
  if (route.name === 'login') return 'Sign in';
  return titleCase(route.name || 'Workspace');
}

function isActiveNav(route, path) {
  const [targetPath] = path.split('?');
  const target = targetPath.match(/^\/company\/([^/]+)\/([^/]+)/);
  if (!target || route.name !== 'company') return false;
  return route.companyId === decodeURIComponent(target[1]) && route.section === target[2];
}

function normalizeJobTab(value) {
  return JOB_TABS.includes(value) ? value : 'pipeline';
}

function labelForTab(tab) {
  return {
    pipeline: 'Pipeline',
    list: 'List',
    profile: 'Profile',
  }[tab] || tab;
}

function reconcileCompany(route) {
  const target = route.companyId || state.activeCompanyId || defaultCompanyId();
  const allowed = allowedCompanyIds();
  state.activeCompanyId = allowed.includes(target) ? target : allowed[0] || defaultCompanyId();
  localStorage.setItem(COMPANY_KEY, state.activeCompanyId);
}

function reconcileSelection(route) {
  const companyId = activeCompanyId();
  if (route.jobId && companyJobs(companyId).some((job) => job.id === route.jobId)) state.selectedJobId = route.jobId;
  if (!state.selectedJobId || !companyJobs(companyId).some((job) => job.id === state.selectedJobId)) {
    state.selectedJobId = companyJobs(companyId)[0]?.id || '';
  }
  const taskId = route.params.get('task_id');
  if (taskId && companyTasks(companyId).some((task) => task.id === taskId)) state.selectedTaskId = taskId;
  if (route.section !== 'tasks') state.selectedTaskId = '';
  state.driveFolder = route.params.get('folder') || 'home';
}

function setActiveCompany(companyId) {
  const allowed = allowedCompanyIds();
  const target = canonicalCompanyId(companyId);
  const next = allowed.includes(target) ? target : allowed[0] || defaultCompanyId();
  state.activeCompanyId = next;
  localStorage.setItem(COMPANY_KEY, next);
  resetScopedUiState();
  const route = state.route || getRoute();
  const section = route.name === 'company' ? route.section : 'jobs';
  navigate(companyPath(section, {}, next));
}

function resetScopedUiState() {
  state.modal = '';
  state.selectedJobId = '';
  state.selectedTaskId = '';
  state.selectedFileId = '';
  state.selectedFormId = '';
  state.selectedQuestionId = '';
  state.selectedFinanceInvoiceId = '';
  state.selectedFinanceExpenseId = '';
  state.selectedFinanceVendorId = '';
  state.query = '';
  state.fileQuery = '';
  state.formQuery = '';
  state.crmQuery = '';
  state.stageFilter = 'all';
  state.crmStageFilter = 'all';
  state.crmOwnerFilter = 'all';
  state.taskStatusFilter = 'all';
  state.taskPriorityFilter = 'all';
  state.fileCategoryFilter = 'All categories';
  state.formTypeFilter = 'all';
  state.formsTab = 'library';
  state.driveFolder = 'home';
}

function setSelectedJob(id) {
  const job = jobById(id);
  if (!job) return;
  state.selectedJobId = id;
  navigate(companyPath('jobs', { tab: 'profile', job_id: id }, job.company_id));
}

function setSelectedTask(id) {
  const task = taskById(id);
  if (!task) return;
  state.selectedTaskId = id;
  navigate(companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: id }, task.company_id));
}

function selectedJob() {
  return jobById(state.selectedJobId) || companyJobs(activeCompanyId())[0] || null;
}

function jobById(id) {
  return state.jobs.find((job) => job.id === id) || null;
}

function taskById(id) {
  return state.tasks.find((task) => task.id === id) || null;
}

function companyJobs(companyId = activeCompanyId()) {
  return state.jobs.filter((job) => job.company_id === companyId);
}

function companyTasks(companyId = activeCompanyId()) {
  return state.tasks.filter((task) => task.company_id === companyId);
}

function companyNotifications(companyId = activeCompanyId()) {
  const profileId = activeSession().profile.id;
  return state.notifications
    .filter((item) => item.company_id === companyId && item.recipient_profile_id === profileId)
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

function companyMessageConversations(companyId = activeCompanyId()) {
  const query = state.messageQuery.trim().toLowerCase();
  const filter = state.messageFilter || 'all';
  return state.messageConversations
    .filter((conversation) => conversation.company_id === companyId && canAccessConversation(conversation))
    .filter((conversation) => filter === 'all' || conversation.type === filter || (filter === 'unread' && conversationUnreadCount(conversation.id) > 0))
    .filter((conversation) => {
      if (!query) return true;
      const messageMatch = conversationMessages(conversation.id).some((message) => message.body.toLowerCase().includes(query));
      return conversation.title.toLowerCase().includes(query) || messageMatch;
    })
    .sort((a, b) => Date.parse(b.last_message_at || b.updated_at || b.created_at || 0) - Date.parse(a.last_message_at || a.updated_at || a.created_at || 0));
}

function companyMessageUnreadCount(companyId = activeCompanyId()) {
  return companyMessageConversations(companyId).reduce((sum, conversation) => sum + conversationUnreadCount(conversation.id), 0);
}

function selectedConversation(companyId = activeCompanyId()) {
  const visible = companyMessageConversations(companyId);
  const routeId = state.route?.params?.get('conversation') || '';
  const candidate = routeId || state.selectedConversationId;
  return visible.find((conversation) => conversation.id === candidate) || visible[0] || null;
}

function conversationMessages(conversationId) {
  return state.messages
    .filter((message) => message.conversation_id === conversationId && !message.deleted_at)
    .sort((a, b) => Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0));
}

function conversationAttachments(conversationId) {
  return state.messageAttachments.filter((attachment) => attachment.conversation_id === conversationId);
}

function messageAttachments(messageId) {
  return state.messageAttachments.filter((attachment) => attachment.message_id === messageId);
}

function conversationAccessRows(conversationId) {
  return state.messageAccess.filter((access) => access.conversation_id === conversationId);
}

function conversationRead(conversationId, profileId = activeSession().profile.id) {
  return state.messageReads.find((read) => read.conversation_id === conversationId && read.profile_id === profileId) || null;
}

function conversationUnreadCount(conversationId, profileId = activeSession().profile.id) {
  const readAt = Date.parse(conversationRead(conversationId, profileId)?.last_read_at || 0);
  return conversationMessages(conversationId).filter((message) => message.sender_profile_id !== profileId && Date.parse(message.created_at || 0) > readAt).length;
}

function canAccessConversation(conversation) {
  if (!conversation || !can('messages.view', conversation.company_id)) return false;
  const profile = activeSession().profile;
  const rows = conversationAccessRows(conversation.id);
  if (conversation.type === 'company' || rows.some((row) => row.target_type === 'all_company')) return true;
  const profileKeys = new Set([profile.id, profile.member_id, profile.email].filter(Boolean).map(String));
  if (rows.some((row) => row.target_type === 'profile' && profileKeys.has(row.target_id))) return true;
  const roleIds = [roleIdForName(conversation.company_id, roleForCompany(conversation.company_id)), ...state.roleAssignments.filter((item) => item.company_id === conversation.company_id && item.profile_id === profile.id).map((item) => item.role_id)];
  return rows.some((row) => row.target_type === 'role' && roleIds.includes(row.target_id));
}

function companyFiles(companyId = activeCompanyId()) {
  return state.files.filter((file) => file.company_id === companyId);
}

function companyDriveFolders(companyId = activeCompanyId()) {
  return state.driveFolders.filter((folder) => folder.company_id === companyId);
}

function companyMembers(companyId = activeCompanyId()) {
  return state.teamMembers.filter((member) => Array.isArray(member.company_ids) && member.company_ids.includes(companyId));
}

function companyAccessUsers(companyId = activeCompanyId()) {
  const byId = new Map();
  companyMembers(companyId).forEach((member) => {
    byId.set(member.id, {
      profile_id: '',
      member_id: member.id,
      name: member.full_name || member.name,
      email: member.email,
      avatar_url: member.avatar_url,
      role: roleForMember(companyId, member.id).toLowerCase(),
      role_label: roleForMember(companyId, member.id),
      role_id: '',
      status: member.active ? 'active' : 'disabled',
    });
  });
  state.memberships
    .filter((membership) => membership.company_id === companyId)
    .forEach((membership) => {
      const profile = profileById(membership.profile_id);
      const member = membership.member_id ? state.teamMembers.find((item) => item.id === membership.member_id) : null;
      const assignment = state.roleAssignments.find((item) => item.company_id === companyId && item.profile_id === membership.profile_id);
      const role = assignment ? roleById(companyId, assignment.role_id) : null;
      const id = membership.profile_id || membership.member_id;
      byId.set(id, {
        profile_id: membership.profile_id,
        member_id: membership.member_id,
        name: profile?.full_name || member?.full_name || profile?.email || member?.name || id || 'User',
        email: profile?.email || member?.email || '',
        avatar_url: profile?.avatar_url || member?.avatar_url || '',
        role: membership.role,
        role_label: role?.name || titleCase(membership.role),
        role_id: assignment?.role_id || roleIdForName(companyId, membership.role),
        status: membership.status || 'active',
      });
    });
  const sessionProfile = activeSession().profile;
  if (state.session?.auth === 'supabase' && sessionProfile?.id && !byId.has(sessionProfile.id)) {
    const membership = membershipForProfile(companyId, sessionProfile.id);
    if (membership) {
      byId.set(sessionProfile.id, {
        profile_id: sessionProfile.id,
        member_id: sessionProfile.member_id || '',
        name: sessionProfile.full_name || sessionProfile.email,
        email: sessionProfile.email,
        avatar_url: sessionProfile.avatar_url,
        role: membership.role,
        role_label: titleCase(membership.role),
        role_id: roleIdForName(companyId, membership.role),
        status: membership.status || 'active',
      });
    }
  }
  return [...byId.values()].sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || a.name.localeCompare(b.name));
}

function companyInvites(companyId = activeCompanyId()) {
  return state.companyInvites
    .filter((invite) => invite.company_id === companyId && invite.status === 'pending')
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

function companyAuditEvents(companyId = activeCompanyId()) {
  return state.auditEvents
    .filter((event) => event.company_id === companyId)
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

function renderAuditEventRow(event) {
  const profile = profileById(event.actor_profile_id);
  const actor = profile?.full_name || profile?.email || shortUserId(event.actor_profile_id || 'system');
  return `
    <article class="access-audit-row">
      ${renderAvatar({ full_name: actor, email: profile?.email || '' }, 'avatar small')}
      <span>
        <strong>${h(titleCase(String(event.event_type || 'access.event').replace(/[._-]+/g, ' ')))}</strong>
        <small>${h(actor)} / ${formatDate(event.created_at)}</small>
      </span>
    </article>
  `;
}

function companyRoles(companyId = activeCompanyId()) {
  const custom = state.roles.filter((role) => role.company_id === companyId);
  if (custom.length) return custom.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
  return [
    normalizeRole({ id: `owner-${companyId}`, company_id: companyId, name: 'Owner', color: '#f0b23b', priority: 1000, is_system: true }),
    normalizeRole({ id: `admin-${companyId}`, company_id: companyId, name: 'Admin', color: '#60a5fa', priority: 800, is_system: true }),
    normalizeRole({ id: `staff-${companyId}`, company_id: companyId, name: 'Staff', color: '#15803d', priority: 100, is_system: true }),
  ];
}

function roleById(companyId, roleId) {
  return companyRoles(companyId).find((role) => role.id === roleId) || null;
}

function rolePreviewForCompany(companyId = activeCompanyId()) {
  if (!state.rolePreview || state.rolePreview.company_id !== companyId) return null;
  return roleById(companyId, state.rolePreview.role_id);
}

function roleAllowsPermission(role, permission) {
  if (!permission) return true;
  const normalizedName = String(role?.name || '').toLowerCase();
  if (['owner', 'admin', 'developer'].includes(normalizedName)) return true;
  const variants = permissionVariants(permission);
  const explicit = state.rolePermissions.filter((item) => item.role_id === role?.id);
  if (explicit.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'deny')) return false;
  if (explicit.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'allow')) return true;
  if (explicit.length) return false;
  const fallbackRole = membershipRoleForRole(role);
  const fallbackPermissions = ROLE_PERMISSIONS[fallbackRole] || ROLE_PERMISSIONS.member;
  return fallbackPermissions.includes('*') || variants.some((variant) => fallbackPermissions.includes(variant));
}

function permissionVariants(permission) {
  return compactUnique([permission, ...(PERMISSION_ALIASES[permission] || [])]);
}

function roleIdForName(companyId, roleName) {
  const normalized = String(roleName || '').toLowerCase();
  return companyRoles(companyId).find((role) => role.name.toLowerCase() === normalized || role.id.toLowerCase() === normalized)?.id || '';
}

function defaultInviteRoleId(companyId = activeCompanyId()) {
  const roles = companyRoles(companyId).filter((role) => role.name.toLowerCase() !== 'owner');
  return roles.find((role) => role.name.toLowerCase() === 'staff')?.id || roles.find((role) => role.name.toLowerCase() === 'member')?.id || roles[0]?.id || '';
}

function generateInviteCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `QH-${Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').toUpperCase()}`;
}

function inviteLink(invite) {
  const url = new URL(appHref('/login'), window.location.origin);
  url.searchParams.set('invite', invite.token);
  return url.toString();
}

function membershipRoleForRole(role) {
  const normalized = String(role?.name || '').toLowerCase().replace(/\s+/g, '_');
  const allowed = ['owner', 'member', 'worker', 'sales', 'supervisor', 'admin', 'developer', 'construction_supervisor'];
  if (allowed.includes(normalized)) return normalized;
  if (normalized === 'staff') return 'member';
  return 'member';
}

function profileById(profileId) {
  return state.profiles.find((profile) => profile.id === profileId) || (activeSession().profile.id === profileId ? activeSession().profile : null);
}

function filteredJobs(companyId = activeCompanyId()) {
  const q = state.query.trim().toLowerCase();
  return companyJobs(companyId).filter((job) => {
    if (state.stageFilter !== 'all' && job.stage !== state.stageFilter) return false;
    if (!q) return true;
    return [job.name, job.client_name, job.contact_name, job.owner_name, job.site_address, job.job_type, companyName(job.company_id)]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}

function crmAccounts(companyId = activeCompanyId()) {
  const groups = new Map();
  companyJobs(companyId).forEach((job) => {
    const accountName = String(job.client_name || '').trim() || 'Unassigned customer';
    const key = `account-${slugify(accountName.toLowerCase()) || 'unassigned'}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: accountName,
        jobs: [],
      });
    }
    groups.get(key).jobs.push(job);
  });

  return Array.from(groups.values()).map((account) => {
    const jobs = account.jobs
      .slice()
      .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
    const latestJob = jobs[0] || null;
    const jobIds = jobs.map((job) => job.id);
    const tasks = companyTasks(companyId).filter((task) => jobIds.includes(task.project_id));
    const forms = companyForms(companyId).filter((form) => jobIds.includes(form.linked_job_id));
    const files = companyFiles(companyId).filter((file) => jobIds.includes(file.job_id));
    const contacts = compactUnique(jobs.map((job) => job.contact_name));
    const owners = compactUnique(jobs.map((job) => job.owner_name));
    const addresses = compactUnique(jobs.map((job) => job.site_address));
    const priority = jobs
      .map((job) => job.priority || 'Medium')
      .sort((a, b) => priorityRank(b) - priorityRank(a))[0] || 'Medium';

    return {
      ...account,
      jobs,
      tasks,
      latestJob,
      contacts,
      owners,
      addresses,
      forms,
      files,
      primaryContact: contacts[0] || 'No contact',
      owner: owners[0] || 'Unassigned',
      stage: latestJob?.stage || 'Lead',
      priority,
      estimateTotal: sum(jobs, 'estimate_total'),
      fileCount: files.length,
      formCount: forms.length,
      updatedAt: latestJob?.updated_at || latestJob?.created_at || new Date().toISOString(),
      subtitle: addresses[0] || `${jobs.length} linked job${jobs.length === 1 ? '' : 's'}`,
    };
  }).sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0));
}

function filteredCrmAccounts(companyId = activeCompanyId()) {
  const query = state.crmQuery.trim().toLowerCase();
  return crmAccounts(companyId).filter((account) => {
    if (state.crmStageFilter !== 'all' && !account.jobs.some((job) => job.stage === state.crmStageFilter)) return false;
    if (state.crmOwnerFilter !== 'all' && !account.owners.includes(state.crmOwnerFilter)) return false;
    if (!query) return true;
    return [
      account.name,
      account.primaryContact,
      account.owner,
      account.stage,
      ...account.addresses,
      ...account.contacts,
      ...account.jobs.map((job) => job.name),
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });
}

function crmAccountByKey(companyId, key) {
  return crmAccounts(companyId).find((account) => account.key === key) || null;
}

function crmOwnerOptions(companyId = activeCompanyId()) {
  return compactUnique(companyJobs(companyId).map((job) => job.owner_name)).sort((a, b) => a.localeCompare(b));
}

function timeSummary(companyId = activeCompanyId()) {
  const memberId = activeSession().profile.member_id || '';
  const tasks = companyTasks(companyId).slice().sort(taskSortForOperations);
  const open = tasks.filter(isOpenTask);
  const dueToday = open.filter((task) => task.due === isoDate(0));
  const overdue = open.filter((task) => daysUntil(task.due) < 0);
  const thisWeek = open.filter((task) => {
    const days = daysUntil(task.due);
    return days >= 0 && days <= 7;
  });
  const assignedToMe = open.filter((task) => task.assignee_id === memberId);
  const review = open.filter((task) => ['review', 'pending'].includes(task.status));
  const done = tasks.filter((task) => task.status === 'done');
  const focus = compactUnique(overdue.concat(dueToday, assignedToMe, review, thisWeek).map((task) => task.id))
    .map((id) => tasks.find((task) => task.id === id))
    .filter(Boolean)
    .sort(taskSortForOperations);
  return { tasks, open, dueToday, overdue, thisWeek, assignedToMe, review, done, focus };
}

function approvalItems(companyId = activeCompanyId()) {
  const formApprovals = companyForms(companyId)
    .filter((form) => (form.require_approval || form.type === 'Client approval') && !['Archived', 'Closed', 'Approved'].includes(form.status))
    .map((form) => ({
      id: `form:${form.id}`,
      title: form.title,
      meta: jobById(form.linked_job_id)?.name || form.description || 'Company form',
      type: 'Form approval',
      owner: memberName(form.creator_id),
      status: form.status,
      updatedAt: form.updated_at || form.created_at,
      href: companyPath('forms', { form_id: form.id }, companyId),
    }));
  const taskApprovals = companyTasks(companyId)
    .filter((task) => ['review', 'pending'].includes(task.status))
    .map((task) => ({
      id: `task:${task.id}`,
      title: task.title,
      meta: jobById(task.project_id)?.name || task.description || 'Company task',
      type: 'Task review',
      owner: memberName(task.assignee_id),
      status: statusLabel(task.status),
      updatedAt: task.updated_at || task.due,
      href: companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, companyId),
    }));
  const accessApprovals = state.memberships
    .filter((membership) => membership.company_id === companyId && membership.status !== 'active')
    .map((membership) => ({
      id: `access:${membership.profile_id || membership.member_id}`,
      title: memberName(membership.member_id || membership.profile_id),
      meta: `${titleCase(membership.role)} access request`,
      type: 'Access request',
      owner: 'Quest admin',
      status: titleCase(membership.status),
      updatedAt: new Date().toISOString(),
      href: companyPath('settings', { tab: 'access' }, companyId),
    }));
  return formApprovals.concat(taskApprovals, accessApprovals)
    .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0));
}

function activeTimerForCompany(companyId = activeCompanyId()) {
  const timer = state.activeTimer;
  if (!timer || timer.company_id !== companyId) return null;
  return timer;
}

function timeEntriesForCompany(companyId = activeCompanyId()) {
  return state.timeEntries
    .filter((entry) => entry.company_id === companyId)
    .sort((a, b) => Date.parse(b.started_at || 0) - Date.parse(a.started_at || 0));
}

function totalTimeForCompany(companyId = activeCompanyId(), sinceMs = 0) {
  return timeEntriesForCompany(companyId)
    .filter((entry) => Date.parse(entry.started_at || 0) >= sinceMs)
    .reduce((total, entry) => total + number(entry.duration_ms), 0);
}

function startClock(companyId = activeCompanyId(), taskId = '') {
  if (state.activeTimer) stopClock(false);
  const task = taskId ? taskById(taskId) : null;
  state.activeTimer = {
    id: `timer-${crypto.randomUUID()}`,
    company_id: companyId,
    user_id: activeSession().profile.member_id || activeSession().profile.id,
    task_id: task?.company_id === companyId ? task.id : '',
    task_title: task?.company_id === companyId ? task.title : '',
    started_at: new Date().toISOString(),
  };
  persistTimeState();
  state.sync = { label: 'Clock started locally', mode: 'local' };
  render();
}

function stopClock(shouldRender = true) {
  const timer = state.activeTimer;
  if (!timer) return;
  const endedAt = new Date().toISOString();
  const durationMs = Math.max(0, Date.parse(endedAt) - Date.parse(timer.started_at || endedAt));
  state.timeEntries.unshift({
    id: `time-${crypto.randomUUID()}`,
    company_id: timer.company_id,
    user_id: timer.user_id,
    task_id: timer.task_id || '',
    task_title: timer.task_title || '',
    started_at: timer.started_at,
    ended_at: endedAt,
    duration_ms: durationMs,
    notes: timer.task_title ? 'Task timer' : 'General shift',
  });
  state.activeTimer = null;
  persistTimeState();
  state.sync = { label: 'Clock stopped locally', mode: 'local' };
  if (shouldRender) render();
}

function isOpenTask(task) {
  return task.status !== 'done';
}

function taskSortForOperations(a, b) {
  const dateDiff = Date.parse(a.due || 0) - Date.parse(b.due || 0);
  if (dateDiff) return dateDiff;
  return priorityRank(b.priority) - priorityRank(a.priority);
}

function companyFinanceInvoices(companyId = activeCompanyId()) {
  return state.financeInvoices
    .filter((invoice) => invoice.company_id === companyId)
    .sort(dateDesc('updated_at'));
}

function companyFinancePayments(companyId = activeCompanyId()) {
  return state.financePayments.filter((payment) => payment.company_id === companyId);
}

function companyFinanceExpenses(companyId = activeCompanyId()) {
  return state.financeExpenses
    .filter((expense) => expense.company_id === companyId)
    .sort(dateDesc('updated_at'));
}

function companyFinanceVendors(companyId = activeCompanyId()) {
  return state.financeVendors.filter((vendor) => vendor.company_id === companyId);
}

function financeInvoiceById(id) {
  return state.financeInvoices.find((invoice) => invoice.id === id) || null;
}

function financeExpenseById(id) {
  return state.financeExpenses.find((expense) => expense.id === id) || null;
}

function financeVendorById(id) {
  return state.financeVendors.find((vendor) => vendor.id === id) || null;
}

function financeVendorName(id) {
  return financeVendorById(id)?.name || 'No vendor';
}

function paymentsForInvoice(invoiceId) {
  return state.financePayments.filter((payment) => payment.invoice_id === invoiceId).sort(dateDesc('received_at'));
}

function invoicePaid(invoiceId) {
  return sum(paymentsForInvoice(invoiceId), 'amount');
}

function invoiceBalance(invoiceId) {
  const invoice = financeInvoiceById(invoiceId);
  return Math.max(0, number(invoice?.total) - invoicePaid(invoiceId));
}

function invoiceStatus(invoice) {
  const balance = invoiceBalance(invoice.id);
  if (balance <= 0 && number(invoice.total) > 0) return 'Paid';
  if (balance < number(invoice.total)) return 'Partially paid';
  if (invoice.status === 'Sent' && daysPastDue(invoice.due_date) > 0) return 'Overdue';
  return invoice.status;
}

function financeSummary(companyId = activeCompanyId()) {
  const invoices = companyFinanceInvoices(companyId);
  const payments = companyFinancePayments(companyId);
  const expenses = companyFinanceExpenses(companyId).filter((expense) => ['Approved', 'Paid'].includes(expense.status));
  const aging = { current: 0, thirty: 0, sixty: 0, overSixty: 0 };
  invoices.forEach((invoice) => {
    const balance = invoiceBalance(invoice.id);
    if (!balance) return;
    const days = daysPastDue(invoice.due_date);
    if (days <= 0) aging.current += balance;
    else if (days <= 30) aging.thirty += balance;
    else if (days <= 60) aging.sixty += balance;
    else aging.overSixty += balance;
  });
  const collected = sum(payments, 'amount');
  const expenseTotal = sum(expenses, 'amount');
  return {
    pipeline: sum(companyJobs(companyId), 'estimate_total'),
    invoiced: sum(invoices, 'total'),
    collected,
    outstanding: invoices.reduce((total, invoice) => total + invoiceBalance(invoice.id), 0),
    expenses: expenseTotal,
    net: collected - expenseTotal,
    aging,
  };
}

function filteredTasks(companyId = activeCompanyId(), jobId = '') {
  const q = state.query.trim().toLowerCase();
  return companyTasks(companyId).filter((task) => {
    if (jobId && task.project_id !== jobId) return false;
    if (state.taskStatusFilter !== 'all' && task.status !== state.taskStatusFilter) return false;
    if (state.taskPriorityFilter !== 'all' && task.priority !== state.taskPriorityFilter) return false;
    if (!q) return true;
    return [task.title, task.description, taskTypeLabel(task.type), memberName(task.assignee_id), jobById(task.project_id)?.name]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}

function allowedCompanies() {
  const ids = allowedCompanyIds();
  return state.companies.filter((company) => ids.includes(company.id));
}

function can(permission, companyId = activeCompanyId()) {
  if (!permission) return true;
  const previewRole = rolePreviewForCompany(companyId);
  if (previewRole) return roleAllowsPermission(previewRole, permission);
  const variants = permissionVariants(permission);
  const profile = activeSession().profile;
  if (state.session?.auth === 'supabase') {
    const membership = membershipForProfile(companyId, profile.id);
    if (!membership || membership.status !== 'active') return false;
    if (['owner', 'developer'].includes(String(membership.role).toLowerCase())) return true;
    const assignedRoleIds = state.roleAssignments
      .filter((item) => item.company_id === companyId && item.profile_id === profile.id)
      .map((item) => item.role_id);
    const permissions = state.rolePermissions.filter((item) => assignedRoleIds.includes(item.role_id));
    if (permissions.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'deny')) return false;
    if (permissions.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'allow')) return true;
  }
  const role = String(membershipForProfile(companyId, profile.id)?.role || profile.role || 'member').toLowerCase();
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member;
  return permissions.includes('*') || variants.some((variant) => permissions.includes(variant));
}

function allowedCompanyIds() {
  const profile = activeSession().profile;
  const allIds = state.companies.map((company) => company.id);
  if (state.session?.auth === 'supabase') {
    const membershipIds = state.memberships
      .filter((item) => item.profile_id === profile.id && item.status === 'active')
      .map((item) => canonicalCompanyId(item.company_id));
    return compactUnique(membershipIds).filter((id) => allIds.includes(id));
  }
  if (['developer', 'admin'].includes(profile.role)) return compactUnique(allIds.length ? allIds : companiesFallback.map((company) => canonicalCompanyId(company.id)));
  const membershipIds = state.memberships
    .filter((item) => item.profile_id === profile.id && item.status === 'active')
    .map((item) => canonicalCompanyId(item.company_id));
  const ids = membershipIds.length ? membershipIds : profile.company_ids || [];
  return compactUnique(ids.map(canonicalCompanyId)).filter((id) => allIds.includes(id));
}

function activeCompanyId() {
  const allowed = allowedCompanyIds();
  if (allowed.includes(state.activeCompanyId)) return state.activeCompanyId;
  return allowed[0] || state.activeCompanyId || defaultCompanyId();
}

function defaultCompanyId() {
  return canonicalCompanyId(companiesFallback[0].id);
}

function companyById(id) {
  const canonical = canonicalCompanyId(id);
  return state.companies.find((item) => item.id === canonical) || companiesFallback.map(normalizeCompany).find((item) => item.id === canonical) || null;
}

function companyName(id) {
  const company = companyById(id);
  return company ? companyLabel(company) : id || 'Company';
}

function companyLabel(company) {
  return company.short_name || company.label || company.name || company.id;
}

function companyColor(id) {
  return companyById(id)?.color || '#f0b23b';
}

function companyIdForJob(jobId) {
  return canonicalCompanyId(state.jobs.find((job) => job.id === jobId)?.company_id || '');
}

function roleForCompany(companyId) {
  const previewRole = rolePreviewForCompany(companyId);
  if (previewRole) return `Preview: ${previewRole.name}`;
  const profile = activeSession().profile;
  if (state.session?.auth !== 'supabase' && ['developer', 'admin'].includes(profile.role)) return titleCase(profile.role);
  return titleCase(membershipForProfile(companyId, profile.id)?.role || profile.role || 'member');
}

function roleForMember(companyId, memberId) {
  const membership = state.memberships.find((item) => item.company_id === companyId && (item.member_id === memberId || item.profile_id === memberId));
  return titleCase(membership?.role || 'member');
}

function membershipForProfile(companyId, profileId) {
  return state.memberships.find((item) => item.company_id === companyId && item.profile_id === profileId) || null;
}

function activeOwnerMemberships(companyId = activeCompanyId()) {
  return state.memberships.filter((item) => item.company_id === companyId && item.role === 'owner' && item.status === 'active');
}

function isLastActiveOwner(companyId, profileId) {
  const owners = activeOwnerMemberships(companyId);
  return owners.length === 1 && owners[0].profile_id === profileId;
}

function validateMembershipChange(companyId, profileId, role, status) {
  const current = membershipForProfile(companyId, profileId);
  const nextRole = membershipRoleForRole(role);
  if (current?.role === 'owner' && current.status === 'active' && (nextRole !== 'owner' || status !== 'active') && isLastActiveOwner(companyId, profileId)) {
    return 'Promote another active Owner before changing the last Owner.';
  }
  const actorMembership = membershipForProfile(companyId, activeSession().profile.id);
  const actorGlobalRole = String(activeSession().profile.role || '').toLowerCase();
  if (['owner', 'developer'].includes(current?.role) || ['owner', 'developer'].includes(nextRole)) {
    if (!['owner', 'developer'].includes(String(actorMembership?.role || actorGlobalRole).toLowerCase())) {
      return 'Only an Owner can change Owner or Developer access.';
    }
  }
  return '';
}

function companySubscription(companyId = activeCompanyId()) {
  return state.subscriptions.find((item) => item.company_id === companyId) || null;
}

function subscriptionAllowsCompany(companyId = activeCompanyId()) {
  if (state.session?.auth !== 'supabase') return true;
  const subscription = companySubscription(companyId);
  if (!subscription) return true;
  if (['trialing', 'active', 'past_due', 'grace'].includes(subscription.status)) return true;
  if (subscription.grace_ends_at && Date.parse(subscription.grace_ends_at) > Date.now()) return true;
  return false;
}

function subscriptionLabel(companyId = activeCompanyId()) {
  const subscription = companySubscription(companyId);
  if (!subscription) return state.session?.auth === 'supabase' ? 'Trial pending' : 'Demo mode';
  if (subscription.status === 'trialing') return `Trial - ${formatDate(subscription.trial_ends_at)}`;
  if (subscription.status === 'active') return 'Active subscription';
  if (subscription.status === 'past_due') return 'Past due grace';
  if (subscription.status === 'grace') return `Grace - ${formatDate(subscription.grace_ends_at)}`;
  return titleCase(subscription.status);
}

function memberName(id) {
  const member = state.teamMembers.find((item) => item.id === id);
  return member?.full_name || member?.name || id || 'Unassigned';
}

function profileName(id) {
  const profile = profileById(id);
  return profile?.full_name || profile?.email || memberName(id);
}

function taskCountForJob(jobId) {
  return state.tasks.filter((task) => task.project_id === jobId).length;
}

function fileCountForJob(jobId) {
  return state.files.filter((file) => file.job_id === jobId).length;
}

function canonicalCompanyId(id) {
  return {
    'quest-roofing': 'roofing',
    'quest-drafting': 'drafting',
  }[String(id || '').trim()] || String(id || '').trim();
}

function mergeCompanies(companies) {
  const seen = new Map();
  companies.map(normalizeCompany).forEach((company) => {
    if (!company.id || seen.has(company.id)) return;
    seen.set(company.id, company);
  });
  return Array.from(seen.values());
}

function normalizeCompany(input) {
  const id = canonicalCompanyId(input.id || '');
  return {
    id,
    name: String(input.name || input.short_name || input.id || '').trim(),
    short_name: String(input.short_name || input.label || input.name || input.id || '').trim(),
    color: String(input.color || '#f0b23b'),
    label: String(input.label || input.short_name || input.name || input.id || '').trim(),
  };
}

function normalizeJob(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    name: String(input.name || '').trim() || 'Untitled Job',
    client_name: String(input.client_name || '').trim(),
    contact_name: String(input.contact_name || '').trim(),
    site_address: String(input.site_address || '').trim(),
    job_type: String(input.job_type || 'Roofing').trim(),
    stage: STAGES.includes(input.stage) ? input.stage : 'Lead',
    priority: ['Low', 'Medium', 'High', 'Urgent'].includes(input.priority) ? input.priority : 'Medium',
    owner_name: String(input.owner_name || '').trim(),
    scope: String(input.scope || '').trim(),
    notes: String(input.notes || '').trim(),
    estimate_total: number(input.estimate_total),
    invoice_total: number(input.invoice_total),
    task_count: number(input.task_count),
    file_count: number(input.file_count),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}

function normalizeTask(input) {
  const priority = TASK_PRIORITIES.includes(String(input.priority || '').toLowerCase()) ? String(input.priority).toLowerCase() : 'medium';
  const status = TASK_STATUSES.includes(String(input.status || '').toLowerCase()) ? String(input.status).toLowerCase() : 'todo';
  return {
    id: String(input.id || ''),
    title: String(input.title || '').trim() || 'Untitled task',
    description: String(input.description || '').trim(),
    type: TASK_TYPES.includes(input.type) ? input.type : 'admin',
    label: input.label || null,
    bid_status: input.bid_status || null,
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    creator_id: String(input.creator_id || 'abraham'),
    assignee_id: String(input.assignee_id || input.creator_id || 'abraham'),
    project_id: String(input.project_id || ''),
    due: String(input.due || isoDate(1)).slice(0, 10),
    due_time: input.due_time || null,
    reminder_at: input.reminder_at || null,
    priority,
    urgency: TASK_PRIORITIES.includes(String(input.urgency || '').toLowerCase()) ? String(input.urgency).toLowerCase() : priority,
    status,
    watchers: Array.isArray(input.watchers) ? input.watchers : [],
    subtasks: Array.isArray(input.subtasks) ? input.subtasks : [],
    activity: Array.isArray(input.activity) ? input.activity : [],
    cleared_at: input.cleared_at || null,
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}

function normalizeFile(input) {
  const category = String(input.category || input.folder || 'Shared');
  return {
    id: String(input.id || crypto.randomUUID()),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    job_id: String(input.job_id || ''),
    folder: String(input.folder || folderIdFromCategory(category)),
    file_name: String(input.file_name || input.name || 'Untitled file'),
    mime_type: String(input.mime_type || 'application/octet-stream'),
    size_bytes: number(input.size_bytes),
    category,
    bucket_id: input.bucket_id || 'quest-job-files',
    object_path: input.object_path || '',
    uploaded_by_label: String(input.uploaded_by_label || 'Quest HQ'),
    notes: String(input.notes || ''),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeDriveFolder(input) {
  return {
    id: String(input.id || `folder-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    name: String(input.name || 'New folder').trim() || 'New folder',
    parent_key: String(input.parent_key || 'home'),
    created_by_label: String(input.created_by_label || 'Quest HQ'),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeForm(input) {
  const questions = Array.isArray(input.questions) ? input.questions.map(normalizeQuestion) : [];
  const type = FORM_TYPES.includes(input.type) ? input.type : 'Internal';
  const status = FORM_STATUSES.includes(input.status) ? input.status : 'Draft';
  return {
    id: String(input.id || `form-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    title: String(input.title || 'Untitled form').trim() || 'Untitled form',
    description: String(input.description || '').trim(),
    type,
    status,
    audience: String(input.audience || 'Internal').trim(),
    creator_id: String(input.creator_id || input.created_by || input.created_by_id || ''),
    linked_job_id: String(input.linked_job_id || input.job_id || ''),
    theme_color: String(input.theme_color || '#f0b23b'),
    background: String(input.background || 'clean'),
    submit_label: String(input.submit_label || 'Submit').trim() || 'Submit',
    collect_email: input.collect_email !== false,
    require_approval: input.require_approval === true,
    questions,
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeQuestion(input) {
  const type = QUESTION_TYPES.some(([id]) => id === input.type) ? input.type : 'short';
  const question = {
    id: String(input.id || `q-${crypto.randomUUID()}`),
    type,
    label: String(input.label || 'Untitled question').trim() || 'Untitled question',
    help: String(input.help || '').trim(),
    required: input.required === true,
    options: Array.isArray(input.options) ? input.options.map((item) => String(item || '').trim()).filter(Boolean) : [],
  };
  if (questionHasOptions(question) && !question.options.length) question.options = ['Option 1', 'Option 2'];
  return question;
}

function normalizeFormResponse(input) {
  return {
    id: String(input.id || `response-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    form_id: String(input.form_id || input.formId || ''),
    submitted_by: String(input.submitted_by || input.submitter_email || 'Anonymous'),
    submitter_email: String(input.submitter_email || ''),
    answers: input.answers && typeof input.answers === 'object' ? input.answers : {},
    created_at: input.created_at || new Date().toISOString(),
  };
}

function normalizeFinanceInvoice(input) {
  const subtotal = number(input.subtotal);
  const tax = number(input.tax);
  const total = number(input.total) || subtotal + tax;
  return {
    id: String(input.id || `invoice-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    job_id: String(input.job_id || ''),
    client_name: String(input.client_name || '').trim(),
    invoice_number: String(input.invoice_number || `INV-${Date.now()}`).trim(),
    status: INVOICE_STATUSES.includes(input.status) ? input.status : 'Draft',
    issue_date: String(input.issue_date || isoDate(0)).slice(0, 10),
    due_date: String(input.due_date || isoDate(30)).slice(0, 10),
    subtotal,
    tax,
    total,
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeFinancePayment(input) {
  return {
    id: String(input.id || `payment-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    invoice_id: String(input.invoice_id || ''),
    amount: number(input.amount),
    method: PAYMENT_METHODS.includes(input.method) ? input.method : 'ACH',
    received_at: String(input.received_at || isoDate(0)).slice(0, 10),
    reference: String(input.reference || '').trim(),
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
  };
}

function normalizeFinanceExpense(input) {
  return {
    id: String(input.id || `expense-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    job_id: String(input.job_id || ''),
    vendor_id: String(input.vendor_id || ''),
    category: EXPENSE_CATEGORIES.includes(input.category) ? input.category : 'Other',
    amount: number(input.amount),
    status: EXPENSE_STATUSES.includes(input.status) ? input.status : 'Pending',
    spent_at: String(input.spent_at || isoDate(0)).slice(0, 10),
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeFinanceVendor(input) {
  return {
    id: String(input.id || `vendor-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    name: String(input.name || 'New vendor').trim() || 'New vendor',
    contact_name: String(input.contact_name || '').trim(),
    email: String(input.email || '').trim(),
    phone: String(input.phone || '').trim(),
    category: EXPENSE_CATEGORIES.includes(input.category) ? input.category : 'Other',
    status: VENDOR_STATUSES.includes(input.status) ? input.status : 'Active',
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeTeamMember(input) {
  return {
    id: String(input.id || ''),
    name: String(input.name || input.full_name || '').trim(),
    full_name: String(input.full_name || input.name || '').trim(),
    email: String(input.email || '').trim(),
    color: String(input.color || '#f0b23b'),
    avatar_url: String(input.avatar_url || ''),
    active: input.active !== false,
    supervisor_id: String(input.supervisor_id || input.manager_id || ''),
    company_ids: Array.isArray(input.company_ids) ? compactUnique(input.company_ids.map(canonicalCompanyId)) : [],
  };
}

function normalizeMembership(input) {
  const status = ['active', 'pending', 'disabled', 'left'].includes(String(input.status)) ? String(input.status) : 'active';
  return {
    company_id: canonicalCompanyId(input.company_id || ''),
    profile_id: String(input.profile_id || input.member_id || ''),
    member_id: input.member_id ? String(input.member_id) : '',
    role: String(input.role || 'member'),
    status,
    disabled_at: input.disabled_at || '',
    disabled_by: String(input.disabled_by || ''),
    left_at: input.left_at || '',
    last_active_at: input.last_active_at || '',
  };
}

function normalizeSubscription(input) {
  return {
    company_id: canonicalCompanyId(input.company_id || ''),
    status: String(input.status || 'trialing'),
    plan_code: String(input.plan_code || 'quest_company_300'),
    amount_cents: number(input.amount_cents || 30000),
    currency: String(input.currency || 'usd'),
    stripe_customer_id: String(input.stripe_customer_id || ''),
    stripe_subscription_id: String(input.stripe_subscription_id || ''),
    current_period_end: input.current_period_end || '',
    trial_ends_at: input.trial_ends_at || '',
    grace_ends_at: input.grace_ends_at || '',
  };
}

function normalizeRole(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    name: String(input.name || 'Role').trim() || 'Role',
    color: String(input.color || '#f0b23b'),
    priority: number(input.priority),
    is_system: input.is_system === true,
    created_by: String(input.created_by || ''),
  };
}

function normalizeRolePermission(input) {
  return {
    role_id: String(input.role_id || ''),
    permission_key: String(input.permission_key || ''),
    effect: String(input.effect || 'allow') === 'deny' ? 'deny' : 'allow',
  };
}

function normalizeRoleAssignment(input) {
  return {
    company_id: canonicalCompanyId(input.company_id || ''),
    profile_id: String(input.profile_id || ''),
    role_id: String(input.role_id || ''),
    assigned_by: String(input.assigned_by || ''),
  };
}

function normalizeResourceAcl(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    resource_type: String(input.resource_type || ''),
    resource_id: String(input.resource_id || ''),
    principal_type: String(input.principal_type || ''),
    principal_id: String(input.principal_id || ''),
    permission_key: String(input.permission_key || ''),
    effect: String(input.effect || 'allow') === 'deny' ? 'deny' : 'allow',
  };
}

function normalizeFieldPermission(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    resource_type: String(input.resource_type || ''),
    field_key: String(input.field_key || ''),
    role_id: String(input.role_id || ''),
    visibility: ['visible', 'masked', 'hidden'].includes(input.visibility) ? input.visibility : 'visible',
    editable: input.editable !== false,
  };
}

function normalizeCompanyInvite(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    email: String(input.email || ''),
    role_id: String(input.role_id || ''),
    token: String(input.token || ''),
    status: String(input.status || 'pending'),
    expires_at: input.expires_at || '',
    invited_by: String(input.invited_by || ''),
    accepted_by: String(input.accepted_by || ''),
    created_at: input.created_at || '',
  };
}

function normalizeJoinRequest(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    profile_id: String(input.profile_id || ''),
    requested_email: String(input.requested_email || ''),
    status: String(input.status || 'pending'),
    message: String(input.message || ''),
    reviewed_by: String(input.reviewed_by || ''),
    created_at: input.created_at || '',
  };
}

function normalizeMessageConversation(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    title: String(input.title || 'Messages').trim() || 'Messages',
    type: MESSAGE_TYPES.includes(input.type) ? input.type : 'custom',
    created_by: String(input.created_by || ''),
    last_message_at: input.last_message_at || input.updated_at || input.created_at || '',
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeMessageAccess(input) {
  return {
    id: String(input.id || ''),
    conversation_id: String(input.conversation_id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    target_type: ['all_company', 'role', 'profile'].includes(input.target_type) ? input.target_type : 'profile',
    target_id: String(input.target_id || ''),
    created_at: input.created_at || '',
  };
}

function normalizeMessage(input) {
  return {
    id: String(input.id || ''),
    conversation_id: String(input.conversation_id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    sender_profile_id: String(input.sender_profile_id || input.created_by || ''),
    body: String(input.body || ''),
    message_type: String(input.message_type || 'text'),
    deleted_at: input.deleted_at || '',
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
  };
}

function normalizeMessageAttachment(input) {
  return {
    id: String(input.id || ''),
    conversation_id: String(input.conversation_id || ''),
    message_id: String(input.message_id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    bucket_id: String(input.bucket_id || 'quest-message-attachments'),
    object_path: String(input.object_path || ''),
    file_name: String(input.file_name || 'attachment'),
    mime_type: String(input.mime_type || 'application/octet-stream'),
    size_bytes: number(input.size_bytes),
    preview_url: String(input.preview_url || ''),
    created_at: input.created_at || new Date().toISOString(),
  };
}

function normalizeMessageRead(input) {
  return {
    conversation_id: String(input.conversation_id || ''),
    company_id: canonicalCompanyId(input.company_id || ''),
    profile_id: String(input.profile_id || ''),
    last_read_at: input.last_read_at || '',
    updated_at: input.updated_at || input.last_read_at || '',
  };
}

function messageConversationPayload(conversation) {
  return {
    id: conversation.id,
    company_id: conversation.company_id,
    title: conversation.title,
    type: conversation.type,
    created_by: conversation.created_by || activeSession().profile.id,
    last_message_at: conversation.last_message_at || null,
  };
}

function messageAccessPayload(access) {
  return {
    conversation_id: access.conversation_id,
    company_id: access.company_id,
    target_type: access.target_type,
    target_id: access.target_id,
  };
}

function messagePayload(message) {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    company_id: message.company_id,
    sender_profile_id: message.sender_profile_id,
    body: message.body,
    message_type: message.message_type,
    deleted_at: message.deleted_at || null,
  };
}

function messageAttachmentPayload(attachment) {
  return {
    id: attachment.id,
    conversation_id: attachment.conversation_id,
    message_id: attachment.message_id,
    company_id: attachment.company_id,
    bucket_id: attachment.bucket_id,
    object_path: attachment.object_path,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    size_bytes: attachment.size_bytes,
  };
}

function messageReadPayload(read) {
  return {
    conversation_id: read.conversation_id,
    company_id: read.company_id,
    profile_id: read.profile_id,
    last_read_at: read.last_read_at || new Date().toISOString(),
  };
}

function blankJob(companyId = activeCompanyId()) {
  return normalizeJob({
    id: '',
    company_id: companyId,
    name: '',
    stage: 'Lead',
    priority: 'Medium',
    job_type: 'Roofing',
  });
}

function blankTask(companyId = activeCompanyId(), jobId = '') {
  return normalizeTask({
    id: '',
    title: '',
    company_id: companyId,
    project_id: jobId,
    assignee_id: companyMembers(companyId)[0]?.id || 'abraham',
    creator_id: activeSession().profile.member_id || 'abraham',
    due: isoDate(1),
    priority: 'medium',
    status: 'todo',
    type: 'admin',
  });
}

function blankFinanceInvoice(companyId = activeCompanyId()) {
  const job = selectedJob();
  return normalizeFinanceInvoice({
    id: '',
    company_id: companyId,
    job_id: job?.company_id === companyId ? job.id : '',
    client_name: job?.company_id === companyId ? job.client_name : '',
    invoice_number: nextInvoiceNumber(companyId),
    status: 'Draft',
    issue_date: isoDate(0),
    due_date: isoDate(30),
    subtotal: job?.company_id === companyId ? job.estimate_total : 0,
    tax: 0,
    notes: '',
  });
}

function blankFinancePayment(companyId = activeCompanyId(), invoiceId = '') {
  const candidate = invoiceId ? financeInvoiceById(invoiceId) : companyFinanceInvoices(companyId).find((item) => invoiceBalance(item.id) > 0);
  const invoice = candidate?.company_id === companyId ? candidate : null;
  return normalizeFinancePayment({
    id: '',
    company_id: companyId,
    invoice_id: invoice?.id || '',
    amount: invoice ? invoiceBalance(invoice.id) : 0,
    method: 'ACH',
    received_at: isoDate(0),
    reference: '',
    notes: '',
  });
}

function blankFinanceExpense(companyId = activeCompanyId(), vendorId = '') {
  return normalizeFinanceExpense({
    id: '',
    company_id: companyId,
    job_id: selectedJob()?.company_id === companyId ? selectedJob().id : '',
    vendor_id: vendorId || companyFinanceVendors(companyId)[0]?.id || '',
    category: 'Materials',
    status: 'Pending',
    amount: 0,
    spent_at: isoDate(0),
    notes: '',
  });
}

function blankFinanceVendor(companyId = activeCompanyId()) {
  return normalizeFinanceVendor({
    id: '',
    company_id: companyId,
    name: '',
    category: 'Materials',
    status: 'Active',
  });
}

function taskPayload(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    label: task.label,
    bid_status: task.bid_status,
    company_id: task.company_id,
    creator_id: task.creator_id,
    assignee_id: task.assignee_id,
    project_id: task.project_id || null,
    due: task.due,
    due_time: task.due_time,
    reminder_at: task.reminder_at,
    priority: task.priority,
    urgency: task.urgency,
    status: task.status,
    watchers: task.watchers,
    subtasks: task.subtasks,
    activity: task.activity,
    cleared_at: task.cleared_at,
  };
}

function filePayload(file) {
  return {
    company_id: file.company_id,
    job_id: file.job_id || null,
    bucket_id: file.bucket_id,
    object_path: file.object_path,
    file_name: file.file_name,
    mime_type: file.mime_type,
    size_bytes: file.size_bytes,
    category: file.category,
    folder: file.folder,
    uploaded_by_label: file.uploaded_by_label,
    notes: file.notes,
  };
}

function activeSession() {
  if (state.session) {
    if (state.session.auth === 'supabase') return state.session;
    return {
      ...state.session,
      profile: {
        ...buildLocalSession().profile,
        ...(state.session.profile || {}),
        ...(state.profileDraft || {}),
      },
    };
  }
  return buildLocalSession();
}

function buildSupabaseSession(session, profile) {
  const emailVerified = !!(session.user.email_confirmed_at || session.user.confirmed_at);
  return {
    auth: 'supabase',
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: {
      id: session.user.id,
      email: session.user.email || '',
      email_confirmed_at: session.user.email_confirmed_at || session.user.confirmed_at || '',
      email_verified: emailVerified,
    },
    profile: normalizeProfile(profile || {}, {
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name || session.user.email || 'Quest user',
      role: 'member',
      role_label: 'Member',
      member_id: '',
      company_ids: [],
      avatar_url: '',
      approved: false,
      email_verified: emailVerified,
    }),
  };
}

function buildLocalSession() {
  const profile = {
    id: 'basic-quest-user',
    email: 'lumen123@quest-hq.local',
    full_name: 'Quest Basic Mode',
    role: 'developer',
    role_label: 'Developer',
    member_id: 'abraham',
    company_ids: ['roofing', 'drafting', 'lumen'],
    avatar_url: '',
    email_verified: true,
    ...(state.profileDraft || {}),
  };
  return {
    auth: 'local-basic',
    user: { id: profile.id, username: CONFIG.localUsername, email: profile.email },
    profile,
  };
}

function normalizeProfile(input, fallback = {}) {
  const role = String(input.role || fallback.role || 'member').toLowerCase();
  const emailVerified = typeof input.email_verified === 'boolean' ? input.email_verified : fallback.email_verified === true;
  return {
    id: String(input.id || fallback.id || ''),
    email: String(input.email || fallback.email || ''),
    full_name: String(input.full_name || fallback.full_name || input.email || fallback.email || 'Quest user'),
    role,
    role_label: titleCase(role),
    member_id: String(input.member_id || fallback.member_id || ''),
    company_ids: Array.isArray(input.company_ids) ? compactUnique(input.company_ids.map(canonicalCompanyId)) : (fallback.company_ids || []),
    avatar_url: String(input.avatar_url || fallback.avatar_url || ''),
    approved: input.approved !== false,
    email_verified: emailVerified,
    supervisor_id: String(input.supervisor_id || fallback.supervisor_id || ''),
  };
}

function normalizeNotification(input) {
  return {
    id: String(input.id || `notification-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || ''),
    recipient_profile_id: String(input.recipient_profile_id || 'basic-quest-user'),
    type: String(input.type || 'general'),
    title: String(input.title || 'Notification'),
    body: String(input.body || ''),
    href: String(input.href || ''),
    source_type: String(input.source_type || ''),
    source_id: String(input.source_id || ''),
    read_at: String(input.read_at || ''),
    created_at: String(input.created_at || new Date().toISOString()),
  };
}

function isSessionEmailVerified(session = activeSession()) {
  if (session.auth !== 'supabase') return true;
  return session.user?.email_verified === true || !!session.user?.email_confirmed_at || session.profile?.email_verified === true;
}

function workspaceHeader(title, summary, actions = '') {
  const symbol = moduleSymbol();
  return `
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${svgIcon(symbol)}</span>
        <div>
          <div class="context-line"><span>${h(companyName(activeCompanyId()))}</span><b>${h(roleForCompany(activeCompanyId()))}</b></div>
          <h1>${h(title)}</h1>
          <p>${h(summary)}</p>
        </div>
      </div>
      ${actions ? `<div class="head-actions">${actions}</div>` : ''}
    </section>
  `;
}

function metricGrid(items) {
  return `<section class="metric-grid">${items.map(([label, value]) => `<article class="metric">${svgIcon(metricSymbol(label), 'metric-symbol')}<span>${h(label)}</span><strong>${h(value)}</strong></article>`).join('')}</section>`;
}

function jobQueueRow(job) {
  return `
    <button class="queue-row" type="button" data-select-job="${h(job.id)}">
      <span><strong>${h(job.name)}</strong><small>${h(job.client_name || companyName(job.company_id))}</small></span>
      ${priorityPill(job.priority)}
      <b>${h(job.stage)}</b>
    </button>
  `;
}

function taskQueueRow(task) {
  return `
    <button class="queue-row" type="button" data-select-task="${h(task.id)}">
      <span><strong>${h(task.title)}</strong><small>${h(jobById(task.project_id)?.name || companyName(task.company_id))}</small></span>
      ${taskPriorityPill(task.priority)}
      <b>${h(statusLabel(task.status))}</b>
    </button>
  `;
}

function jobCard(job) {
  return `
    <button class="job-card priority-${h(job.priority.toLowerCase())} ${job.id === state.selectedJobId ? 'active' : ''}" type="button" data-select-job="${h(job.id)}">
      <strong>${h(job.name)}</strong>
      <span>${h(job.client_name || 'No client')}</span>
      <small>${h(companyName(job.company_id))} - ${h(job.owner_name || 'Unassigned')}</small>
      <em>${h(taskCountForJob(job.id))} tasks</em>
    </button>
  `;
}

function miniLink(path, icon, title, text) {
  return `
    <a class="mini-link" href="${appHref(path)}" data-router>
      <i class="ti ${h(icon)}"></i>
      <span><strong>${h(title)}</strong><small>${h(text)}</small></span>
    </a>
  `;
}

function contractRows(rows) {
  return `<div class="contract-rows">${rows.map(([label, value]) => `<div><span>${h(label)}</span><strong>${h(value)}</strong></div>`).join('')}</div>`;
}

function field(label, name, value = '', required = false, type = 'text', className = '') {
  return `<label class="${h(className)}"><span>${h(label)}</span><input name="${h(name)}" type="${h(type)}" value="${h(value)}" ${required ? 'required' : ''} /></label>`;
}

function textareaField(label, name, value = '', className = '') {
  return `<label class="${h(className)}"><span>${h(label)}</span><textarea name="${h(name)}" rows="4">${h(value)}</textarea></label>`;
}

function selectField(label, name, value, options) {
  return `
    <label><span>${h(label)}</span><select name="${h(name)}">
      ${options.map(([id, text]) => `<option value="${h(id)}" ${String(id) === String(value) ? 'selected' : ''}>${h(text)}</option>`).join('')}
    </select></label>
  `;
}

function priorityPill(priority) {
  return `<span class="priority ${h(String(priority).toLowerCase())}">${h(priority)}</span>`;
}

function taskPriorityPill(priority) {
  return `<span class="priority ${h(priority)}">${h(titleCase(priority))}</span>`;
}

function taskStatusPill(status) {
  return `<span class="status-pill ${h(status)}">${h(statusLabel(status))}</span>`;
}

function financeStatusPill(status) {
  return `<span class="finance-status ${h(slugify(status))}">${h(status)}</span>`;
}

function renderAvatar(profile, className) {
  if (profile.avatar_url) return `<span class="${h(className)}"><img src="${h(profile.avatar_url)}" alt="" /></span>`;
  const initials = String(profile.full_name || profile.email || 'QB').trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'QB';
  return `<span class="${h(className)}">${h(initials)}</span>`;
}

function emptyState(text) {
  return `<div class="empty-state">${svgIcon('q-empty', 'empty-symbol')}<span>${h(text)}</span></div>`;
}

function copyParams(params, keys) {
  const next = {};
  keys.forEach((key) => {
    const value = params.get(key);
    if (value) next[key] = value;
  });
  return next;
}

function persistAll() {
  if (state.session?.auth === 'supabase') return;
  writeJson(JOB_CACHE_KEY, state.jobs);
  writeJson(TASK_CACHE_KEY, state.tasks);
  writeJson(FILE_CACHE_KEY, state.files);
  writeJson(DRIVE_FOLDER_CACHE_KEY, state.driveFolders);
  writeJson(FORM_CACHE_KEY, state.forms);
  writeJson(FORM_RESPONSE_CACHE_KEY, state.formResponses);
  writeJson(FINANCE_INVOICE_CACHE_KEY, state.financeInvoices);
  writeJson(FINANCE_PAYMENT_CACHE_KEY, state.financePayments);
  writeJson(FINANCE_EXPENSE_CACHE_KEY, state.financeExpenses);
  writeJson(FINANCE_VENDOR_CACHE_KEY, state.financeVendors);
  writeJson(TIME_ENTRY_CACHE_KEY, state.timeEntries);
  writeJson(ACTIVE_TIMER_KEY, state.activeTimer);
  writeJson(TEAM_CACHE_KEY, state.teamMembers);
  writeJson(MEMBERSHIP_CACHE_KEY, state.memberships);
  writeJson(NOTIFICATION_CACHE_KEY, state.notifications);
  writeJson(MESSAGE_CONVERSATION_CACHE_KEY, state.messageConversations);
  writeJson(MESSAGE_ACCESS_CACHE_KEY, state.messageAccess);
  writeJson(MESSAGE_CACHE_KEY, state.messages);
  writeJson(MESSAGE_READ_CACHE_KEY, state.messageReads);
  writeJson(MESSAGE_ATTACHMENT_CACHE_KEY, state.messageAttachments);
}

function persistTimeState() {
  if (state.session?.auth === 'supabase') return;
  writeJson(TIME_ENTRY_CACHE_KEY, state.timeEntries);
  writeJson(ACTIVE_TIMER_KEY, state.activeTimer);
}

function persistNotifications() {
  if (state.session?.auth === 'supabase') return;
  writeJson(NOTIFICATION_CACHE_KEY, state.notifications);
}

function persistMessages() {
  if (state.session?.auth === 'supabase') return;
  writeJson(MESSAGE_CONVERSATION_CACHE_KEY, state.messageConversations);
  writeJson(MESSAGE_ACCESS_CACHE_KEY, state.messageAccess);
  writeJson(MESSAGE_CACHE_KEY, state.messages);
  writeJson(MESSAGE_READ_CACHE_KEY, state.messageReads);
  writeJson(MESSAGE_ATTACHMENT_CACHE_KEY, state.messageAttachments);
}

function messageAccessFromForm(data, conversation, type) {
  if (type === 'company') {
    return [normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: conversation.company_id, conversation_id: conversation.id, target_type: 'all_company', target_id: 'all' })];
  }
  const rows = [];
  data.getAll('role_ids').forEach((roleId) => {
    if (roleId) rows.push(normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: conversation.company_id, conversation_id: conversation.id, target_type: 'role', target_id: roleId }));
  });
  data.getAll('profile_ids').forEach((profileId) => {
    if (profileId) rows.push(normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: conversation.company_id, conversation_id: conversation.id, target_type: 'profile', target_id: profileId }));
  });
  return rows.length ? rows : [normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: conversation.company_id, conversation_id: conversation.id, target_type: 'profile', target_id: activeSession().profile.id })];
}

function markConversationRead(conversationId, sync = true) {
  if (!conversationId) return;
  const conversation = state.messageConversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  const now = new Date().toISOString();
  const profileId = activeSession().profile.id;
  const read = normalizeMessageRead({ conversation_id: conversationId, company_id: conversation.company_id, profile_id: profileId, last_read_at: now });
  state.messageReads = [read].concat(state.messageReads.filter((item) => item.conversation_id !== conversationId || item.profile_id !== profileId));
  persistMessages();
  if (sync && state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (client) client.from('message_reads').upsert(messageReadPayload(read), { onConflict: 'conversation_id,profile_id' });
  }
}

function notifyMessageEvents(conversation, message, attachments = []) {
  if (!canStoreLocalNotifications() || message.sender_profile_id !== activeSession().profile.id) return;
  const href = companyPath('messages', { conversation: conversation.id }, conversation.company_id);
  const mentioned = mentionedProfileIds(message.body);
  if (conversation.type === 'direct') {
    notifyLocalEvent('message.direct', 'New direct message', `${actorName()} sent a direct message in ${conversation.title}.`, href, 'message', message.id, conversation.company_id);
  }
  mentioned.forEach((profileId) => {
    createNotification({
      company_id: conversation.company_id,
      recipient_profile_id: profileId,
      type: 'message.mention',
      title: 'Mentioned in chat',
      body: `${actorName()} mentioned you in ${conversation.title}.`,
      href,
      source_type: 'message',
      source_id: message.id,
    });
  });
  if (attachments.length) {
    notifyLocalEvent('message.attachment', 'Attachment shared', `${actorName()} shared ${attachments.length} attachment${attachments.length === 1 ? '' : 's'} in ${conversation.title}.`, href, 'message', message.id, conversation.company_id);
  }
}

function mentionedProfileIds(body = '') {
  const lower = String(body || '').toLowerCase();
  if (!lower.includes('@')) return [];
  return companyAccessUsers(activeCompanyId())
    .filter((user) => lower.includes(`@${String(user.name || '').split(/\s+/)[0].toLowerCase()}`) || lower.includes(`@${String(user.name || '').toLowerCase()}`))
    .map((user) => user.profile_id || user.member_id)
    .filter(Boolean);
}

function messageSenderProfile(profileId) {
  const profile = profileById(profileId);
  if (profile) return profile;
  const member = state.teamMembers.find((item) => item.id === profileId);
  return {
    id: profileId,
    full_name: member?.full_name || member?.name || profileId || 'Quest user',
    email: member?.email || '',
    avatar_url: member?.avatar_url || '',
  };
}

function accessUserName(user) {
  const name = String(user?.name || '').trim();
  if (name && !isOpaqueUserId(name)) return name;
  const email = String(user?.email || '').trim();
  if (email) return email.split('@')[0] || email;
  return 'Workspace user';
}

function accessUserMeta(user) {
  const parts = compactUnique([user?.email, user?.role_label || titleCase(user?.role || ''), titleCase(user?.status || '')]);
  return parts.join(' / ') || 'Company member';
}

function accessUserProfile(user) {
  return {
    id: user?.profile_id || user?.member_id || '',
    full_name: accessUserName(user),
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  };
}

function filterMessagePeopleList(input) {
  const query = String(input.value || '').trim().toLowerCase();
  const modal = input.closest('.message-modal-form');
  const rows = Array.from(modal?.querySelectorAll('[data-message-person-row]') || []);
  let visible = 0;
  rows.forEach((row) => {
    const checked = row.querySelector('input[type="checkbox"]')?.checked;
    const match = !query || String(row.dataset.filterText || '').includes(query);
    const show = checked || match;
    row.hidden = !show;
    if (show) visible += 1;
  });
  const count = modal?.querySelector('[data-message-filter-count]');
  if (count) count.textContent = query ? `${visible} match${visible === 1 ? '' : 'es'}` : `${rows.length} member${rows.length === 1 ? '' : 's'}`;
}

function messageTypeSymbol(type) {
  return {
    company: 'q-symbol-company-chat',
    role: 'q-symbol-role-chat',
    custom: 'q-symbol-messages',
    direct: 'q-symbol-direct-chat',
  }[type] || 'q-symbol-messages';
}

function accessSummary(conversation) {
  const rows = conversationAccessRows(conversation.id);
  if (conversation.type === 'company' || rows.some((row) => row.target_type === 'all_company')) return 'Everyone in this company';
  const roles = rows.filter((row) => row.target_type === 'role').map((row) => roleById(conversation.company_id, row.target_id)?.name || 'Role');
  const profiles = rows.filter((row) => row.target_type === 'profile').map((row) => profileName(row.target_id));
  return roles.concat(profiles).slice(0, 5).join(', ') || 'Private chat';
}

function linkifyMentions(body) {
  return h(body).replace(/(^|\s)@([\w.-]+)/g, '$1<strong>@$2</strong>');
}

function fileSize(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function subscribeToMessageRealtime(companyId, conversationId) {
  const client = createSupabaseClient();
  if (state.session?.auth !== 'supabase' || !client?.channel || !conversationId) return;
  const key = `${companyId}:${conversationId}`;
  if (state.messageRealtimeKey === key) return;
  if (state.messageRealtimeChannel) client.removeChannel(state.messageRealtimeChannel);
  state.messageRealtimeKey = key;
  state.messageRealtimeChannel = client
    .channel(`quest-messages-${conversationId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => {
      state.dataLoaded = false;
      render();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'message_attachments', filter: `conversation_id=eq.${conversationId}` }, () => {
      state.dataLoaded = false;
      render();
    })
    .subscribe();
}

function runMessageScenario(companyId) {
  const scenarios = [
    () => saveScenarioConversation(companyId, 'Crew weather delay', 'role', 'Manager posted a weather delay update.', true),
    () => saveScenarioConversation(companyId, 'Permit questions', 'custom', 'A permit packet PDF was shared.', false, true),
    () => saveScenarioConversation(companyId, 'Shan Kumar', 'direct', 'Can you jump on this when you are back?', true),
    () => saveScenarioMessage(companyId, '@Joshua you were mentioned in the launch room.'),
  ];
  const index = Math.floor(Math.random() * scenarios.length);
  scenarios[index]();
}

function saveScenarioConversation(companyId, title, type, body, unread = false, attachment = false) {
  const now = new Date().toISOString();
  const conversation = normalizeMessageConversation({ id: `msg-conv-${crypto.randomUUID()}`, company_id: companyId, title, type, created_by: 'basic-quest-user', last_message_at: now, created_at: now, updated_at: now });
  const accessRows = type === 'direct'
    ? [
        normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: conversation.id, target_type: 'profile', target_id: 'basic-quest-user' }),
        normalizeMessageAccess({ id: `msg-access-${crypto.randomUUID()}`, company_id: companyId, conversation_id: conversation.id, target_type: 'profile', target_id: 'shan' }),
      ]
    : messageAccessFromForm(new FormData(), conversation, type === 'role' ? 'role' : 'company');
  state.messageConversations.unshift(conversation);
  state.messageAccess = accessRows.concat(state.messageAccess);
  const message = normalizeMessage({ id: `msg-${crypto.randomUUID()}`, conversation_id: conversation.id, company_id: companyId, sender_profile_id: unread ? 'shan' : 'basic-quest-user', body, created_at: now, updated_at: now, message_type: attachment ? 'attachment' : 'text' });
  state.messages.push(message);
  if (attachment) {
    state.messageAttachments.push(normalizeMessageAttachment({ id: `msg-attachment-${crypto.randomUUID()}`, conversation_id: conversation.id, message_id: message.id, company_id: companyId, file_name: 'permit-packet.pdf', mime_type: 'application/pdf', size_bytes: 420000, created_at: now }));
  }
  if (!unread) markConversationRead(conversation.id, false);
  state.selectedConversationId = conversation.id;
  persistMessages();
  showToast('Demo message scenario added.', 'local', 'Messages');
  navigate(companyPath('messages', { conversation: conversation.id }, companyId), { replace: true });
}

function saveScenarioMessage(companyId, body) {
  const conversation = selectedConversation(companyId) || companyMessageConversations(companyId)[0];
  if (!conversation) return saveScenarioConversation(companyId, 'Demo chat', 'company', body, true);
  const now = new Date().toISOString();
  const message = normalizeMessage({ id: `msg-${crypto.randomUUID()}`, conversation_id: conversation.id, company_id: companyId, sender_profile_id: 'shan', body, created_at: now, updated_at: now });
  state.messages.push(message);
  state.messageConversations = state.messageConversations.map((item) => (item.id === conversation.id ? { ...item, last_message_at: now, updated_at: now } : item));
  notifyMessageEvents(conversation, message, []);
  persistMessages();
  showToast('Demo mention added.', 'local', 'Messages');
  render();
}

function resetMessageDemo() {
  state.messageConversations = messageConversationsFallback.map(normalizeMessageConversation);
  state.messageAccess = messageAccessFallback.map(normalizeMessageAccess);
  state.messages = messagesFallback.map(normalizeMessage);
  state.messageReads = messageReadsFallback.map(normalizeMessageRead);
  state.messageAttachments = messageAttachmentsFallback.map(normalizeMessageAttachment);
  state.selectedConversationId = '';
  persistMessages();
  showToast('Demo messages reset.', 'local', 'Messages');
  render();
}

function canStoreLocalNotifications() {
  return state.session?.auth !== 'supabase';
}

function createNotification(input) {
  if (!canStoreLocalNotifications()) return null;
  const notification = normalizeNotification({
    id: `notification-${crypto.randomUUID()}`,
    company_id: activeCompanyId(),
    recipient_profile_id: activeSession().profile.id,
    created_at: new Date().toISOString(),
    ...input,
  });
  state.notifications = [notification]
    .concat(state.notifications.filter((item) => item.id !== notification.id))
    .slice(0, 100);
  persistNotifications();
  return notification;
}

function markAllNotificationsRead(companyId = activeCompanyId()) {
  const now = new Date().toISOString();
  const profileId = activeSession().profile.id;
  state.notifications = state.notifications.map((item) => (
    item.company_id === companyId && item.recipient_profile_id === profileId && !item.read_at
      ? { ...item, read_at: now }
      : item
  ));
  persistNotifications();
}

function openNotification(notificationId) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (!notification) return;
  state.notifications = state.notifications.map((item) => (
    item.id === notification.id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item
  ));
  state.notificationMenuOpen = false;
  persistNotifications();
  if (notification.href) navigate(notification.href);
}

function notifyTaskChange(task, previous = null) {
  if (!canStoreLocalNotifications()) return;
  const href = companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, task.company_id);
  const assignee = memberName(task.assignee_id);
  if (!previous) {
    createNotification({
      company_id: task.company_id,
      type: 'task.assigned',
      title: 'Task assigned',
      body: `${actorName()} assigned ${task.title} to ${assignee}.`,
      href,
      source_type: 'task',
      source_id: task.id,
    });
    return;
  }
  if (previous.assignee_id !== task.assignee_id) {
    createNotification({
      company_id: task.company_id,
      type: 'task.assigned',
      title: 'Task reassigned',
      body: `${actorName()} reassigned ${task.title} to ${assignee}.`,
      href,
      source_type: 'task',
      source_id: task.id,
    });
  }
  if (previous.priority !== task.priority) {
    createNotification({
      company_id: task.company_id,
      type: 'task.priority',
      title: 'Task priority changed',
      body: `${actorName()} set priority to ${titleCase(task.priority)} on ${task.title}.`,
      href,
      source_type: 'task',
      source_id: task.id,
    });
  }
  if (previous.status !== task.status) {
    createNotification({
      company_id: task.company_id,
      type: 'task.status',
      title: 'Task status changed',
      body: `${actorName()} moved ${task.title} to ${statusLabel(task.status)}.`,
      href,
      source_type: 'task',
      source_id: task.id,
    });
  }
}

function notifyLocalEvent(type, title, body, href, sourceType = '', sourceId = '', companyId = activeCompanyId()) {
  createNotification({
    company_id: companyId,
    type,
    title,
    body,
    href,
    source_type: sourceType,
    source_id: sourceId,
  });
}

async function recordAuditEvent(companyId, eventType, targetType, targetId, details = {}, persistLive = false) {
  const event = {
    id: `audit-${crypto.randomUUID()}`,
    company_id: companyId,
    actor_profile_id: activeSession().profile.id,
    event_type: eventType,
    target_type: targetType,
    target_id: targetId,
    details,
    created_at: new Date().toISOString(),
  };
  state.auditEvents.unshift(event);
  if (persistLive && state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (client) {
      try {
        await client.from('audit_events').insert({
          company_id: companyId,
          actor_profile_id: activeSession().profile.id,
          event_type: eventType,
          target_type: targetType,
          target_id: targetId,
          details,
        });
      } catch {
        // Audit UI already has the local event; server audit persistence can retry on the next action.
      }
    }
  }
}

function membershipAuditEventType(previous, next) {
  if (next.status === 'disabled') return 'membership.disabled';
  if (next.status === 'left') return 'membership.left';
  if (previous && ['disabled', 'left', 'pending'].includes(previous.status) && next.status === 'active') return 'membership.reactivated';
  if (previous && previous.role !== next.role) return 'role.changed';
  return 'membership.updated';
}

function actorName() {
  return activeSession().profile.full_name || activeSession().profile.email || 'Quest HQ';
}

function metricCard(label, value, text = '') {
  return `<article class="metric">${svgIcon(metricSymbol(label), 'metric-symbol')}<span>${h(label)}</span><strong>${h(value)}</strong>${text ? `<small>${h(text)}</small>` : ''}</article>`;
}

function detailRow(label, value) {
  return `<div><strong>${h(label)}</strong><span>${h(value)}</span></div>`;
}

function compactFinanceRow(title, meta, amount, date, href = '') {
  const inner = `
    <span><strong>${h(title)}</strong><small>${h(meta || 'Finance record')}</small></span>
    <b>${h(amount)}</b>
    <em>${formatDate(date)}</em>
  `;
  if (href) return `<a class="finance-compact-row" href="${appHref(href)}" data-router>${inner}</a>`;
  return `<div class="finance-compact-row">${inner}</div>`;
}

function driveFolderCount(companyId, folder) {
  const files = companyFiles(companyId);
  if (folder === 'jobs') return files.filter((file) => file.job_id).length;
  return files.filter((file) => file.folder === folder).length;
}

function driveParentKey(folder = 'home', job = null) {
  if (job?.id) return `job:${job.id}`;
  return folder || 'home';
}

function driveExplorerFolders(companyId, folder = 'home', job = null) {
  const parentKey = driveParentKey(folder, job);
  const custom = companyDriveFolders(companyId)
    .filter((item) => item.parent_key === parentKey)
    .map((item) => customFolderModel(companyId, item));
  if (job) return custom;
  if (folder === 'home') {
    const fixed = DRIVE_FOLDERS.map(([id, label, text, icon]) => ({
      id,
      name: label,
      caption: text,
      icon,
      href: appHref(companyPath('files', { folder: id }, companyId)),
      countLabel: `${driveFolderCount(companyId, id)} file${driveFolderCount(companyId, id) === 1 ? '' : 's'}`,
      updatedLabel: '',
    }));
    return fixed.concat(custom);
  }
  if (folder === 'jobs') {
    const jobs = companyJobs(companyId).map((jobItem) => ({
      id: `job:${jobItem.id}`,
      name: jobItem.name,
      caption: jobItem.client_name || companyName(companyId),
      icon: 'ti-folder',
      href: appHref(companyPath('files', { folder: 'jobs', job_id: jobItem.id }, companyId)),
      countLabel: `${fileCountForJob(jobItem.id)} file${fileCountForJob(jobItem.id) === 1 ? '' : 's'}`,
      updatedLabel: formatDate(jobItem.updated_at),
    }));
    return jobs.concat(custom);
  }
  return custom;
}

function customFolderModel(companyId, folder) {
  const childCount = companyDriveFolders(companyId).filter((item) => item.parent_key === folder.id).length;
  const fileCount = companyFiles(companyId).filter((file) => file.folder === folder.id).length;
  const itemCount = childCount + fileCount;
  return {
    id: folder.id,
    name: folder.name,
    caption: 'Custom folder',
    icon: 'ti-folder',
    href: appHref(companyPath('files', { folder: folder.id }, companyId)),
    countLabel: `${itemCount} item${itemCount === 1 ? '' : 's'}`,
    updatedLabel: formatDate(folder.updated_at),
  };
}

function driveBreadcrumbTrail(companyId, folder, job = null) {
  if (job) return `<span>/</span><a href="${appHref(companyPath('files', { folder: 'jobs' }, companyId))}" data-router>Jobs</a>`;
  const custom = companyDriveFolders(companyId).find((item) => item.id === folder);
  if (!custom) return `<span>/</span><strong>${h(folderLabel(folder))}</strong>`;
  const crumbs = [];
  let cursor = custom;
  const guard = new Set();
  while (cursor && !guard.has(cursor.id)) {
    guard.add(cursor.id);
    crumbs.unshift(cursor);
    cursor = companyDriveFolders(companyId).find((item) => item.id === cursor.parent_key);
  }
  const root = custom.parent_key && !custom.parent_key.startsWith('folder-') && custom.parent_key !== 'home'
    ? `<span>/</span><a href="${appHref(companyPath('files', { folder: custom.parent_key }, companyId))}" data-router>${h(folderLabel(custom.parent_key))}</a>`
    : '';
  return `${root}${crumbs.map((item, index) => {
    const isLast = index === crumbs.length - 1;
    return `<span>/</span>${isLast ? `<strong>${h(item.name)}</strong>` : `<a href="${appHref(companyPath('files', { folder: item.id }, companyId))}" data-router>${h(item.name)}</a>`}`;
  }).join('')}`;
}

function driveMetrics(companyId = activeCompanyId()) {
  const files = companyFiles(companyId);
  return { count: files.length, bytes: sum(files, 'size_bytes') };
}

function filteredDriveFiles(companyId = activeCompanyId(), folder = 'home', jobId = '') {
  const query = (state.fileQuery || state.query || '').trim().toLowerCase();
  const category = state.fileCategoryFilter;
  let files = companyFiles(companyId);
  if (jobId) {
    files = files.filter((file) => file.job_id === jobId);
  } else if (folder && folder !== 'home') {
    if (folder === 'jobs') files = files.filter((file) => file.job_id);
    else files = files.filter((file) => file.folder === folder);
  }
  if (category && category !== 'All categories') {
    files = files.filter((file) => String(file.category || folderLabel(file.folder)).toLowerCase() === category.toLowerCase());
  }
  if (query) {
    files = files.filter((file) => [file.file_name, file.category, file.uploaded_by_label, file.notes, file.object_path, jobById(file.job_id)?.name]
      .some((value) => String(value || '').toLowerCase().includes(query)));
  }
  return files.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function fileTypeLabel(file) {
  const type = String(file.mime_type || '').toLowerCase();
  const ext = fileExtension(file);
  if (type.includes('pdf')) return 'PDF';
  if (ext === 'pdf') return 'PDF';
  if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'Image';
  if (type.includes('zip') || ['zip', 'rar', '7z'].includes(ext)) return 'Archive';
  if (type.includes('spreadsheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel';
  if (type.includes('word') || ['doc', 'docx'].includes(ext)) return 'Word';
  if (type.includes('text') || ['txt', 'md', 'json', 'csv', 'log'].includes(ext)) return 'Text';
  if (type.includes('presentation') || ['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
  return ext ? ext.toUpperCase() : folderLabel(file.folder);
}

function fileTypeClass(file) {
  const label = fileTypeLabel(file).toLowerCase();
  if (label === 'pdf') return 'pdf';
  if (label === 'image') return 'image';
  if (label === 'excel') return 'sheet';
  if (label === 'text') return 'text';
  if (['word', 'powerpoint'].includes(label)) return 'doc';
  if (label === 'archive') return 'zip';
  return 'doc';
}

function fileExtension(file) {
  return String(file.file_name || '').split('.').pop()?.toLowerCase() || '';
}

function fileThumb(file, large = false) {
  const icon = fileIcon(file);
  if (file.signed_url) return `<img src="${h(file.signed_url)}" alt="" />`;
  return `<span class="file-doc-icon ${h(fileTypeClass(file))} ${large ? 'large' : ''}"><i class="ti ${h(icon)}"></i></span>`;
}

function fileTypeShortLabel(file) {
  const label = fileTypeLabel(file);
  const ext = fileExtension(file);
  if (label === 'Image') return ext && ext.length <= 4 ? ext.toUpperCase() : 'IMG';
  if (label === 'Archive') return ext && ext.length <= 3 ? ext.toUpperCase() : 'ZIP';
  if (label === 'Excel') return ext === 'csv' ? 'CSV' : 'XLS';
  if (label === 'Word') return 'DOC';
  if (label === 'PowerPoint') return 'PPT';
  if (label === 'Text') return ext && ext.length <= 4 ? ext.toUpperCase() : 'TXT';
  return label.length <= 4 ? label.toUpperCase() : (ext || 'FILE').slice(0, 4).toUpperCase();
}

function companyForms(companyId = activeCompanyId()) {
  return state.forms.filter((form) => form.company_id === companyId);
}

function filteredForms(companyId = activeCompanyId()) {
  const query = state.formQuery.trim().toLowerCase();
  const jobId = state.route?.jobId || '';
  return companyForms(companyId).filter((form) => {
    if (jobId && form.linked_job_id !== jobId) return false;
    if (state.formTypeFilter !== 'all' && form.type !== state.formTypeFilter) return false;
    if (!query) return true;
    return [form.title, form.description, form.type, form.status, form.audience, jobById(form.linked_job_id)?.name]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });
}

function selectedForm(companyId = activeCompanyId()) {
  const jobId = state.route?.jobId || '';
  const forms = companyForms(companyId).filter((form) => !jobId || form.linked_job_id === jobId);
  const routeFormId = state.route?.params?.get('form_id') || '';
  if (routeFormId && forms.some((form) => form.id === routeFormId)) state.selectedFormId = routeFormId;
  if (!forms.length) {
    state.selectedFormId = '';
    state.selectedQuestionId = '';
    return null;
  }
  let form = forms.find((item) => item.id === state.selectedFormId) || forms[0];
  state.selectedFormId = form.id;
  if (!state.selectedQuestionId || !form.questions.some((question) => question.id === state.selectedQuestionId)) {
    state.selectedQuestionId = form.questions[0]?.id || '';
  }
  return form;
}

function formById(id) {
  return state.forms.find((form) => form.id === id) || null;
}

function selectedFormMutable() {
  return formById(state.selectedFormId) || selectedForm(activeCompanyId());
}

function companyFormResponses(companyId = activeCompanyId()) {
  return state.formResponses.filter((response) => response.company_id === companyId);
}

function responsesForForm(formId) {
  return state.formResponses.filter((response) => response.form_id === formId);
}

function formQuestionCount(form) {
  return Array.isArray(form?.questions) ? form.questions.length : 0;
}

function formCreatorLabel(form) {
  const creatorId = String(form?.creator_id || '');
  const profile = activeSession().profile;
  if (!creatorId) return form?.created_by_label || profile.full_name || 'Quest HQ';
  if (creatorId && (creatorId === profile.member_id || creatorId === profile.id)) return profile.full_name || 'Quest Basic Mode';
  return memberName(creatorId) || form?.created_by_label || 'Quest HQ';
}

function formInput(label, key, value = '', required = false, type = 'text') {
  return `<label><span>${h(label)}</span><input data-form-field="${h(key)}" type="${h(type)}" value="${h(value)}" ${required ? 'required' : ''} /></label>`;
}

function formTextarea(label, key, value = '') {
  return `<label><span>${h(label)}</span><textarea data-form-field="${h(key)}" rows="3">${h(value)}</textarea></label>`;
}

function formSelect(label, key, value, options) {
  return `
    <label><span>${h(label)}</span><select data-form-field="${h(key)}">
      ${options.map(([id, text]) => `<option value="${h(id)}" ${String(id) === String(value) ? 'selected' : ''}>${h(text)}</option>`).join('')}
    </select></label>
  `;
}

function questionHasOptions(question) {
  return ['multiple', 'checkbox', 'dropdown'].includes(question.type);
}

function questionTypeIcon(type) {
  return {
    short: 'ti-letter-t',
    paragraph: 'ti-align-left',
    multiple: 'ti-circle-dot',
    checkbox: 'ti-checkbox',
    dropdown: 'ti-select',
    date: 'ti-calendar',
    rating: 'ti-star',
    yesno: 'ti-circle-check',
    file: 'ti-paperclip',
  }[type] || 'ti-plus';
}

function questionTypeLabel(type) {
  return QUESTION_TYPES.find(([id]) => id === type)?.[1] || titleCase(type || 'Question');
}

function previewWrap(question, control) {
  return `
    <div class="response-question">
      <label>
        <span>${h(question.label)}${question.required ? ' *' : ''}</span>
        ${question.help ? `<small>${h(question.help)}</small>` : ''}
        ${control}
      </label>
    </div>
  `;
}

function renderResponseDetail(response) {
  const form = formById(response.form_id);
  const answerRows = Object.entries(response.answers || {}).map(([questionId, value]) => {
    const question = form?.questions.find((item) => item.id === questionId);
    const printable = Array.isArray(value) ? value.join(', ') : value;
    return detailRow(question?.label || questionId, printable || 'No answer');
  }).join('');
  return `
    <div class="response-detail-head">
      <div><h2>${h(form?.title || 'Response')}</h2><p>${h(response.submitted_by || response.submitter_email || 'Anonymous')} / ${formatDate(response.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${answerRows || detailRow('Response', 'No answers captured.')}</div>
  `;
}

function formTemplates() {
  return [
    {
      id: 'roof-inspection',
      title: 'Roof Inspection',
      description: 'Leak source, condition, photo handoff, and recommended repair scope.',
      type: 'Inspection',
      questions: [
        blankQuestion('short', 'Inspection address'),
        blankQuestion('multiple', 'Primary finding', ['Active leak', 'Damaged flashing', 'Storm damage', 'Maintenance']),
        blankQuestion('paragraph', 'Recommended scope'),
        blankQuestion('file', 'Photos'),
      ],
    },
    {
      id: 'client-approval',
      title: 'Client Approval',
      description: 'Approval, client notes, signature follow-up, and change request capture.',
      type: 'Client approval',
      questions: [
        blankQuestion('short', 'Client name'),
        blankQuestion('yesno', 'Approved to proceed?'),
        blankQuestion('paragraph', 'Requested changes'),
      ],
    },
    {
      id: 'service-intake',
      title: 'Service Intake',
      description: 'New request triage for company-level or job-linked work.',
      type: 'Intake',
      questions: [
        blankQuestion('short', 'Request title'),
        blankQuestion('dropdown', 'Priority', ['Low', 'Medium', 'High', 'Urgent']),
        blankQuestion('paragraph', 'Details'),
      ],
    },
    {
      id: 'safety-check',
      title: 'Safety Checklist',
      description: 'Crew safety confirmation before field work starts.',
      type: 'Safety',
      questions: [
        blankQuestion('checkbox', 'PPE confirmed', ['Harness', 'Ladder', 'Gloves', 'Eye protection']),
        blankQuestion('yesno', 'Weather safe?'),
        blankQuestion('paragraph', 'Safety notes'),
      ],
    },
  ];
}

function blankForm(companyId = activeCompanyId()) {
  return normalizeForm({
    id: `form-${crypto.randomUUID()}`,
    company_id: companyId,
    title: 'Untitled form',
    description: '',
    type: 'Internal',
    status: 'Draft',
    audience: 'Internal',
    linked_job_id: state.route?.jobId || '',
    theme_color: companyColor(companyId),
    background: 'clean',
    submit_label: 'Submit',
    collect_email: true,
    require_approval: false,
    questions: [blankQuestion('short', 'First question')],
  });
}

function blankQuestion(type = 'short', label = 'Untitled question', options = []) {
  return normalizeQuestion({
    id: `q-${crypto.randomUUID()}`,
    type,
    label,
    required: false,
    options,
  });
}

function createForm(companyId, overrides = {}) {
  const base = blankForm(companyId);
  const form = normalizeForm({
    ...base,
    ...overrides,
    id: overrides.id || `form-${crypto.randomUUID()}`,
    company_id: companyId,
    questions: (overrides.questions || base.questions).map((question) => normalizeQuestion(question)),
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  state.forms.unshift(form);
  state.selectedFormId = form.id;
  state.selectedQuestionId = form.questions[0]?.id || '';
  state.formsTab = 'builder';
  state.formEditorTab = 'questions';
  state.modal = '';
  state.formStartTemplateId = '';
  state.formStartTab = 'blank';
  saveFormsState('New form created');
  render();
  return form;
}

function createFormFromModal(formEl) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  const template = data.template_id ? formTemplates().find((item) => item.id === data.template_id) : null;
  const title = String(data.title || template?.title || 'Untitled form').trim() || 'Untitled form';
  const description = String(data.description || template?.description || '').trim();
  const questions = template
    ? template.questions.map((question) => ({ ...clone(question), id: `q-${crypto.randomUUID()}` }))
    : [blankQuestion('short', 'First question')];
  createForm(activeCompanyId(), {
    title,
    description,
    type: FORM_TYPES.includes(data.type) ? data.type : template?.type || 'Internal',
    audience: String(data.audience || 'Internal').trim() || 'Internal',
    creator_id: activeSession().profile.member_id || activeSession().profile.id || 'basic-quest-user',
    linked_job_id: String(data.linked_job_id || ''),
    theme_color: companyColor(activeCompanyId()),
    background: 'clean',
    submit_label: String(data.submit_label || 'Submit').trim() || 'Submit',
    collect_email: data.collect_email === 'on',
    require_approval: data.require_approval === 'on',
    questions,
  });
}

function selectForm(id, shouldRender = true) {
  const form = formById(id);
  if (!form) return;
  state.selectedFormId = form.id;
  state.selectedQuestionId = form.questions[0]?.id || '';
  if (shouldRender) render();
}

function saveFormsState(label = 'Forms saved locally') {
  const form = selectedFormMutable();
  if (form) form.updated_at = new Date().toISOString();
  writeJson(FORM_CACHE_KEY, state.forms);
  writeJson(FORM_RESPONSE_CACHE_KEY, state.formResponses);
  state.sync = { label, mode: 'live' };
}

function setFormStatus(id, status) {
  const form = formById(id || state.selectedFormId);
  if (!form) return;
  form.status = FORM_STATUSES.includes(status) ? status : 'Draft';
  state.selectedFormId = form.id;
  saveFormsState(`${form.status} locally`);
  render();
}

function duplicateForm(id) {
  const form = formById(id || state.selectedFormId);
  if (!form) return;
  const copy = normalizeForm({
    ...clone(form),
    id: `form-${crypto.randomUUID()}`,
    title: `${form.title} Copy`,
    status: 'Draft',
    questions: form.questions.map((question) => ({ ...clone(question), id: `q-${crypto.randomUUID()}` })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  state.forms.unshift(copy);
  state.selectedFormId = copy.id;
  state.selectedQuestionId = copy.questions[0]?.id || '';
  saveFormsState('Form duplicated');
  render();
}

function deleteForm(id) {
  const formId = id || state.selectedFormId;
  if (!formId) return;
  state.forms = state.forms.filter((form) => form.id !== formId);
  state.formResponses = state.formResponses.filter((response) => response.form_id !== formId);
  state.selectedFormId = companyForms(activeCompanyId())[0]?.id || '';
  state.selectedQuestionId = selectedForm(activeCompanyId())?.questions[0]?.id || '';
  state.modal = '';
  saveFormsState('Form deleted locally');
  render();
}

async function copyFormLink(id) {
  const formId = id || state.selectedFormId;
  const url = `${window.location.origin}${appHref(companyPath('forms', { form_id: formId }, activeCompanyId()))}`;
  try {
    await navigator.clipboard.writeText(url);
    state.sync = { label: 'Form link copied', mode: 'live' };
  } catch {
    state.sync = { label: 'Copy failed', mode: 'local' };
  }
  render();
}

function exportForms(companyId) {
  const payload = JSON.stringify({ company_id: companyId, forms: companyForms(companyId), responses: companyFormResponses(companyId) }, null, 2);
  downloadText(`${companyId}-forms-export.json`, payload, 'application/json');
}

function updateFormField(target) {
  const form = selectedFormMutable();
  if (!form) return;
  const key = target.dataset.formField;
  if (!key) return;
  form[key] = target.type === 'checkbox' ? target.checked : target.value;
  form.updated_at = new Date().toISOString();
  writeJson(FORM_CACHE_KEY, state.forms);
}

function updateQuestionField(target) {
  const form = selectedFormMutable();
  const card = target.closest('[data-question-id]');
  const question = form?.questions.find((item) => item.id === card?.dataset.questionId);
  if (!form || !question) return;
  state.selectedQuestionId = question.id;
  if (target.matches('[data-question-option]')) {
    const index = Number(target.dataset.questionOption);
    question.options[index] = target.value;
  } else {
    const key = target.dataset.questionField;
    if (key === 'required') question.required = target.checked;
    else if (key === 'type') {
      question.type = target.value;
      if (questionHasOptions(question) && !question.options.length) question.options = ['Option 1', 'Option 2'];
      if (!questionHasOptions(question)) question.options = [];
      saveFormsState('Question updated');
      render();
      return;
    } else if (key) {
      question[key] = target.value;
    }
  }
  form.updated_at = new Date().toISOString();
  writeJson(FORM_CACHE_KEY, state.forms);
}

function addQuestion(type = 'multiple') {
  const form = selectedFormMutable();
  if (!form) return;
  const question = blankQuestion(type, QUESTION_TYPES.find(([id]) => id === type)?.[1] || 'New question');
  form.questions.push(question);
  state.selectedQuestionId = question.id;
  saveFormsState('Question added');
  render();
}

function duplicateQuestion(id) {
  const form = selectedFormMutable();
  const question = form?.questions.find((item) => item.id === id);
  if (!form || !question) return;
  const index = form.questions.findIndex((item) => item.id === id);
  const copy = normalizeQuestion({ ...clone(question), id: `q-${crypto.randomUUID()}`, label: `${question.label} Copy` });
  form.questions.splice(index + 1, 0, copy);
  state.selectedQuestionId = copy.id;
  saveFormsState('Question duplicated');
  render();
}

function deleteQuestion(id) {
  const form = selectedFormMutable();
  if (!form) return;
  form.questions = form.questions.filter((question) => question.id !== id);
  state.selectedQuestionId = form.questions[0]?.id || '';
  saveFormsState('Question deleted');
  render();
}

function moveQuestion(id, direction) {
  const form = selectedFormMutable();
  if (!form || !direction) return;
  const index = form.questions.findIndex((question) => question.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= form.questions.length) return;
  const [question] = form.questions.splice(index, 1);
  form.questions.splice(next, 0, question);
  state.selectedQuestionId = id;
  saveFormsState('Question moved');
  render();
}

function addQuestionOption(id) {
  const form = selectedFormMutable();
  const question = form?.questions.find((item) => item.id === id);
  if (!question) return;
  question.options = question.options || [];
  question.options.push(`Option ${question.options.length + 1}`);
  saveFormsState('Option added');
  render();
}

function removeQuestionOption(id, index) {
  const form = selectedFormMutable();
  const question = form?.questions.find((item) => item.id === id);
  if (!question || index < 0) return;
  question.options.splice(index, 1);
  if (!question.options.length) question.options.push('Option 1');
  saveFormsState('Option removed');
  render();
}

function saveFormResponse(formEl) {
  const form = formById(formEl.dataset.formId);
  if (!form) return;
  const data = new FormData(formEl);
  const answers = {};
  form.questions.forEach((question) => {
    const key = `answer:${question.id}`;
    const values = data.getAll(key).filter((value) => value instanceof File ? value.name : String(value || '').trim());
    answers[question.id] = values.length > 1 ? values.map((value) => value instanceof File ? value.name : value) : (values[0] instanceof File ? values[0].name : values[0] || '');
  });
  state.formResponses.unshift(normalizeFormResponse({
    company_id: form.company_id,
    form_id: form.id,
    submitter_email: String(data.get('submitter_email') || ''),
    submitted_by: String(data.get('submitter_email') || activeSession().profile.full_name || 'Preview submitter'),
    answers,
    created_at: new Date().toISOString(),
  }));
  state.formsTab = 'responses';
  state.modal = '';
  saveFormsState('Preview response saved');
  notifyLocalEvent(
    form.require_approval ? 'approval.form' : 'form.response',
    form.require_approval ? 'Form approval ready' : 'Form response saved',
    `${actorName()} saved a response for ${form.title}.`,
    companyPath('forms', { form_id: form.id, tab: 'responses' }, form.company_id),
    'form_response',
    form.id,
    form.company_id,
  );
  render();
}

function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function compactUnique(values) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

function statusLabel(status) {
  return {
    todo: 'To do',
    pending: 'Pending',
    hold: 'On hold',
    review: 'Review',
    done: 'Done',
  }[status] || titleCase(status);
}

function taskTypeLabel(type) {
  return {
    lead: 'Lead',
    bid: 'Bid',
    admin: 'Admin',
    invoicing: 'Invoicing',
    ar: 'AR',
    meeting: 'Meeting',
    web_dev: 'Web dev',
  }[type] || titleCase(type);
}

function folderLabel(id) {
  return DRIVE_FOLDERS.find(([folderId]) => folderId === id)?.[1]
    || state.driveFolders.find((folder) => folder.id === id)?.name
    || titleCase(id || 'Shared');
}

function driveFolderOptions(companyId = activeCompanyId()) {
  return DRIVE_FOLDERS.map(([id, label]) => [id, label])
    .concat(companyDriveFolders(companyId).map((folder) => [folder.id, folder.name]));
}

function folderIdFromCategory(category) {
  const lower = String(category || '').toLowerCase();
  if (lower.includes('photo')) return 'photos';
  if (lower.includes('permit')) return 'permits';
  if (lower.includes('contract')) return 'contracts';
  if (lower.includes('form')) return 'forms';
  if (lower.includes('archive')) return 'archive';
  return 'shared';
}

function fileIcon(file) {
  const label = fileTypeLabel(file);
  if (label === 'Image') return 'ti-photo';
  if (label === 'PDF') return 'ti-file-type-pdf';
  if (label === 'Archive') return 'ti-file-zip';
  if (label === 'Excel') return 'ti-file-spreadsheet';
  if (label === 'Word') return 'ti-file-type-doc';
  if (label === 'PowerPoint') return 'ti-file-type-ppt';
  if (label === 'Text') return 'ti-file-text';
  return 'ti-file-description';
}

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isoDate(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86400000);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatDateTime(value) {
  if (!value) return 'No time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function timeAgo(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'just now';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Math.floor(number(value) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m`;
}

function formatBytes(value) {
  const bytes = number(value);
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function dateDesc(field) {
  return (a, b) => Date.parse(b[field] || b.updated_at || b.created_at || 0) - Date.parse(a[field] || a.updated_at || a.created_at || 0);
}

function daysPastDue(value) {
  if (!value) return 0;
  const due = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  return Math.floor((startOfToday().getTime() - due.getTime()) / 86400000);
}

function daysUntil(value) {
  if (!value) return 999;
  const target = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 999;
  return Math.floor((target.getTime() - startOfToday().getTime()) / 86400000);
}

function nextInvoiceNumber(companyId = activeCompanyId()) {
  const prefix = (companyLabel(companyById(companyId) || { short_name: companyId }) || companyId || 'QH')
    .replace(/[^a-z]/gi, '')
    .slice(0, 2)
    .toUpperCase() || 'QH';
  const count = companyFinanceInvoices(companyId).length + 1;
  return `${prefix}-${String(1000 + count)}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function percent(value, total) {
  return `${percentNumber(value, total)}%`;
}

function percentNumber(value, total) {
  const denominator = number(total);
  if (!denominator) return 0;
  return Math.max(0, Math.min(100, Math.round((number(value) / denominator) * 100)));
}

function priorityRank(priority) {
  return {
    critical: 5,
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[String(priority || '').toLowerCase()] || 0;
}

function slugify(value) {
  return String(value || 'file').toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
}

function sum(items, field) {
  return items.reduce((total, item) => total + number(item[field]), 0);
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function isOpaqueUserId(value) {
  const text = String(value || '').trim();
  return isUuid(text) || /^[0-9a-f]{8,}$/i.test(text) || /^user[_-]?[0-9a-f-]{8,}$/i.test(text);
}

function shortUserId(value) {
  const text = String(value || '').trim();
  return text ? text.slice(0, 8) : '';
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number(value));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readSeededList(key, fallback) {
  const value = readJson(key, fallback);
  return Array.isArray(value) && value.length ? value : fallback;
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* local persistence is best effort */
  }
}

function h(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
