import './styles.css';
import cockpitArtUrl from './assets/quest-secure-workspace-cockpit-tight.png';

const CONFIG = {
  buildId: 'Quest HQ Company Workspace v1',
  questAuthEnabled: import.meta.env.VITE_QUEST_AUTH_ENABLED !== 'false',
  localLoginEnabled: import.meta.env.VITE_LOCAL_LOGIN_ENABLED === 'true',
  demoModeEnabled: import.meta.env.VITE_DEMO_MODE_ENABLED !== 'false',
  demoReadonly: import.meta.env.VITE_DEMO_READONLY !== 'false',
  billingMode: import.meta.env.VITE_BILLING_MODE || 'manual',
  localUsername: import.meta.env.VITE_LOCAL_LOGIN_USERNAME || 'local-demo',
  localPassword: import.meta.env.VITE_LOCAL_LOGIN_PASSWORD || 'local-demo',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://rqundirizvojpzhljtdn.supabase.co',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2WrlRVv2obg2N5g7ifl7Rg_wxGjs29U',
  stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
};

const BASE_PATH = new URL(import.meta.env.BASE_URL || '/', window.location.origin).pathname.replace(/\/$/, '');
const SESSION_KEY = 'quest-hq-local-session';
const PROFILE_KEY = 'quest-hq-local-profile';
const JOB_CACHE_KEY = 'quest-hq-job-cache-v2';
const CONTACT_CACHE_KEY = 'quest-hq-contact-cache-v1';
const ACCOUNT_CACHE_KEY = 'quest-hq-account-cache-v1';
const DEAL_CACHE_KEY = 'quest-hq-deal-cache-v1';
const ACTIVITY_CACHE_KEY = 'quest-hq-activity-cache-v1';
const JOB_STAGES_KEY = 'quest-hq-job-stages-v1';
const CONTACT_STAGES_KEY = 'quest-hq-contact-stages-v3';
const DEAL_STAGES_KEY = 'quest-hq-quote-stages-v2';
const DEAL_BOARD_VIEW_KEY = 'quest-hq-deal-board-view';
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
const PENDING_WORKSPACE_REVIEW_KEY = 'quest-hq-pending-workspace-review-v1';
const TASK_VIEW_KEY = 'quest-hq-task-view';
const DRIVE_VIEW_KEY = 'quest-hq-drive-view';
const SIDEBAR_COLLAPSED_KEY = 'quest-hq-sidebar-collapsed';
const NAV_GROUP_COLLAPSED_KEY = 'quest-hq-nav-groups-collapsed';
const NAV_EXPANDED_KEY = 'quest-hq-nav-expanded-v1';
const JOB_BOARD_VIEW_KEY = 'quest-hq-job-board-view';
const CONTACT_BOARD_VIEW_KEY = 'quest-hq-contact-board-view';
const NOTIFICATION_CACHE_KEY = 'quest-hq-notification-cache-v1';
const MESSAGE_CONVERSATION_CACHE_KEY = 'quest-hq-message-conversation-cache-v1';
const MESSAGE_ACCESS_CACHE_KEY = 'quest-hq-message-access-cache-v1';
const MESSAGE_CACHE_KEY = 'quest-hq-message-cache-v1';
const MESSAGE_READ_CACHE_KEY = 'quest-hq-message-read-cache-v1';
const MESSAGE_ATTACHMENT_CACHE_KEY = 'quest-hq-message-attachment-cache-v1';
const CALENDAR_EVENT_CACHE_KEY = 'quest-hq-calendar-event-cache-v1';

const ROLE_PERMISSIONS = {
  developer: ['*'],
  admin: ['*'],
  owner: ['*'],
  manager: ['jobs.view', 'jobs.manage', 'tasks.view', 'tasks.manage', 'files.view', 'files.manage', 'forms.view', 'forms.manage', 'crm.view', 'underwriter.view', 'underwriter.manage', 'finance.view', 'team.view', 'clock.manage', 'approvals.manage', 'approvals.view', 'calendar.view', 'calendar.manage', 'calendar.view_team', 'users.view', 'settings.view', 'billing.view', 'roles.view', 'messages.view', 'messages.send', 'messages.create_group', 'messages.manage_groups', 'messages.attach_files'],
  member: ['jobs.view', 'tasks.view', 'tasks.manage', 'files.view', 'forms.view', 'time.track', 'approvals.view', 'calendar.view', 'users.view', 'messages.view', 'messages.send', 'messages.attach_files'],
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
  ['underwriter.view', 'View underwriter'],
  ['underwriter.manage', 'Manage underwriter'],
  ['finance.view', 'View finance'],
  ['finance.manage', 'Create/edit finance'],
  ['users.view', 'View users'],
  ['users.manage', 'Invite/manage users'],
  ['roles.view', 'View roles'],
  ['roles.manage', 'Create/edit roles'],
  ['plugins.view', 'View plugins'],
  ['plugins.manage', 'Install/disable plugins'],
  ['billing.view', 'View billing'],
  ['billing.manage', 'Manage subscription'],
  ['settings.view', 'View settings'],
  ['settings.manage', 'Manage settings'],
  ['time.track', 'Track own time'],
  ['clock.manage', 'Manage clock dashboard'],
  ['approvals.view', 'View approvals'],
  ['approvals.manage', 'Manage approvals'],
  ['calendar.view', 'View calendar'],
  ['calendar.manage', 'Create/edit calendar events'],
  ['calendar.view_team', 'View team calendar'],
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

const CORE_MODULE_IDS = new Set(['home', 'jobs', 'tasks', 'users', 'settings']);
const WORKSPACE_PLUGIN_REGISTRY = [
  { id: 'crm', label: 'CRM', summary: 'Accounts, contacts, quotes, and customer activity.', icon: 'ti-building-community', module_ids: ['crm', 'contacts', 'deals'], permissions: ['crm.view'], exclusiveGroup: 'crm' },
  { id: 'crm_2', label: 'CRM 2', summary: 'Contacts, quotes, and production jobs workspace.', icon: 'ti-id-badge-2', module_ids: ['contacts', 'deals', 'jobs'], permissions: ['crm.view'], exclusiveGroup: 'crm' },
  { id: 'underwriter', label: 'Underwriter', summary: 'Qualification, scope, pricing, and handoff readiness queue.', icon: 'ti-clipboard-search', module_ids: ['underwriter'], permissions: ['underwriter.view', 'underwriter.manage'], recommendedWith: ['crm_2'] },
  { id: 'files', label: 'Files', summary: 'Shared files, job folders, and document storage.', icon: 'ti-folder', module_ids: ['files'], permissions: ['files.view', 'files.manage'] },
  { id: 'forms', label: 'Forms', summary: 'Internal forms, templates, and response capture.', icon: 'ti-clipboard-list', module_ids: ['forms'], permissions: ['forms.view', 'forms.manage'] },
  { id: 'finance', label: 'Finance', summary: 'Invoices, payments, expenses, vendors, and AR.', icon: 'ti-receipt-dollar', module_ids: ['finance'], permissions: ['finance.view', 'finance.manage'] },
  { id: 'messages', label: 'Messages', summary: 'Company chats, role rooms, direct messages, and attachments.', icon: 'ti-messages', module_ids: ['messages'], permissions: ['messages.view', 'messages.send', 'messages.create_group', 'messages.manage_groups', 'messages.attach_files', 'messages.delete_own', 'messages.delete_any', 'messages.manage'] },
  { id: 'calendar', label: 'Calendar', summary: 'Company schedule, task deadlines, and manual events.', icon: 'ti-calendar', module_ids: ['calendar'], permissions: ['calendar.view', 'calendar.manage', 'calendar.view_team'] },
  { id: 'time_clock', label: 'Time & clock', summary: 'Personal time queues and clock dashboard.', icon: 'ti-clock-hour-4', module_ids: ['time', 'clock'], permissions: ['time.track', 'clock.manage'] },
  { id: 'approvals', label: 'Approvals', summary: 'Review queues for handoffs, forms, and access.', icon: 'ti-user-check', module_ids: ['approvals'], permissions: ['approvals.view', 'approvals.manage'] },
  { id: 'reporting', label: 'Reporting', summary: 'Analytics and team chart views.', icon: 'ti-chart-bar', module_ids: ['analytics', 'team-chart'], permissions: ['team.view'] },
  { id: 'tickets', label: 'Tickets', summary: 'Future service and issue tracking module.', icon: 'ti-ticket', module_ids: ['tickets'], permissions: [], comingSoon: true },
  { id: 'knowledge', label: 'Knowledge Base', summary: 'Future company knowledge and SOP library.', icon: 'ti-books', module_ids: ['knowledge'], permissions: [], comingSoon: true },
  { id: 'automations', label: 'Automations', summary: 'Future no-code workflow automations.', icon: 'ti-automation', module_ids: ['automations'], permissions: [], comingSoon: true },
  { id: 'templates', label: 'Templates', summary: 'Future reusable workspace templates.', icon: 'ti-template', module_ids: ['templates'], permissions: [], comingSoon: true },
  { id: 'team_workload', label: 'Team workload', summary: 'Future workload planning board.', icon: 'ti-users', module_ids: ['team-workload'], permissions: [], comingSoon: true },
];
const WORKSPACE_PLUGIN_PRESETS = {
  roofing: ['crm_2', 'underwriter', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting'],
  construction: ['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting'],
  generic: ['crm', 'files', 'messages'],
};
const WORKSPACE_PLUGIN_PRESET_LABELS = {
  roofing: 'Roofing',
  construction: 'Construction',
  generic: 'Generic services',
};

const MODULE_REGISTRY = [
  { id: 'home', group: 'Workspace', label: 'Home', icon: 'ti-home', symbol: 'q-logo', status: 'live', permission: '' },
  { id: 'jobs', group: 'Production', label: 'Jobs', icon: 'ti-hammer', symbol: 'q-symbol-jobs', status: 'live', permission: 'jobs.view' },
  { id: 'tasks', group: 'Work', label: 'My tasks', icon: 'ti-list-check', symbol: 'q-symbol-tasks', status: 'live', permission: 'tasks.view' },
  { id: 'files', group: 'Workspace', label: 'Files', icon: 'ti-folder', symbol: 'q-symbol-files', status: 'live', permission: 'files.view' },
  { id: 'forms', group: 'Workspace', label: 'Forms', icon: 'ti-clipboard-list', symbol: 'q-symbol-forms', status: 'live', permission: 'forms.view' },
  { id: 'analytics', group: 'Workspace', label: 'Analytics', icon: 'ti-chart-bar', symbol: 'q-symbol-analytics', status: 'live', permission: 'jobs.view' },
  { id: 'crm', group: 'Workspace', label: 'Accounts', icon: 'ti-building-community', symbol: 'q-symbol-crm', status: 'live', permission: 'crm.view' },
  { id: 'contacts', group: 'Contacts · Top of Funnel', label: 'Contacts', icon: 'ti-id-badge-2', symbol: 'q-symbol-crm', status: 'live', permission: 'crm.view' },
  { id: 'deals', group: 'Quotes · Bottom of Funnel', label: 'Quotes', icon: 'ti-briefcase', symbol: 'q-symbol-jobs', status: 'live', permission: 'crm.view' },
  { id: 'underwriter', group: 'Workspace', label: 'Underwriter', icon: 'ti-clipboard-search', symbol: 'q-symbol-crm', status: 'live', permission: 'underwriter.view' },
  { id: 'tickets', group: 'Workspace', label: 'Tickets', icon: 'ti-ticket', symbol: 'q-symbol-tickets', status: 'planned' },
  { id: 'finance', group: 'Workspace', label: 'Finance', icon: 'ti-receipt-dollar', symbol: 'q-symbol-finance', status: 'live', permission: 'finance.view' },
  { id: 'knowledge', group: 'Workspace', label: 'Knowledge Base', icon: 'ti-books', symbol: 'q-symbol-knowledge', status: 'planned' },
  { id: 'automations', group: 'Workspace', label: 'Automations', icon: 'ti-automation', symbol: 'q-symbol-automations', status: 'planned' },
  { id: 'templates', group: 'Workspace', label: 'Templates', icon: 'ti-template', symbol: 'q-symbol-templates', status: 'planned' },
  { id: 'users', group: 'Company', label: 'Users', icon: 'ti-users', symbol: 'q-symbol-users', status: 'live', permission: 'users.view' },
  { id: 'messages', group: 'Communication', label: 'Messages', icon: 'ti-messages', symbol: 'q-symbol-messages', status: 'live', permission: 'messages.view' },
  { id: 'settings', group: 'Company', label: 'Settings', icon: 'ti-settings', symbol: 'q-symbol-settings', status: 'live', permission: 'settings.view' },
  { id: 'team-chart', group: 'Company', label: 'Team chart', icon: 'ti-hierarchy-3', symbol: 'q-symbol-team-chart', status: 'live', permission: 'team.view' },
  { id: 'time', group: 'Operations', label: 'My time', icon: 'ti-clock', symbol: 'q-symbol-time', status: 'live', permission: 'time.track' },
  { id: 'calendar', group: 'Operations', label: 'Calendar', icon: 'ti-calendar', symbol: 'q-symbol-calendar', status: 'live', permission: 'calendar.view' },
  { id: 'approvals', group: 'Operations', label: 'Approvals', icon: 'ti-user-check', symbol: 'q-symbol-approvals', status: 'live', permission: 'approvals.view' },
  { id: 'team-workload', group: 'Operations', label: 'Team workload', icon: 'ti-users', symbol: 'q-symbol-team-workload', status: 'planned' },
  { id: 'clock', group: 'Operations', label: 'Clock dashboard', icon: 'ti-clock-hour-4', symbol: 'q-symbol-clock', status: 'live', permission: 'clock.manage' },
];

const NAV_GROUPS = [
  { label: 'Work', ids: ['home', 'tasks', 'underwriter'] },
  { label: 'Communication', ids: ['messages', 'calendar'] },
  { label: 'Contacts · Top of Funnel', ids: ['contacts'] },
  { label: 'Quotes · Bottom of Funnel', ids: ['deals'] },
  { label: 'Production', ids: ['jobs'] },
  { label: 'Estimating', ids: ['finance', 'files', 'forms'] },
  { label: 'Review', ids: ['analytics', 'users', 'team-chart', 'time', 'approvals', 'clock'] },
  { label: 'Control', ids: ['settings'] },
  { label: 'Future', ids: ['tickets', 'knowledge', 'automations', 'templates', 'team-workload'] },
];

const LEGACY_ROUTE_SECTIONS = {
  '/admin.html': 'settings',
  '/automations.html': 'automations',
  '/calendar.html': 'calendar',
  '/crm.html': 'crm',
  '/dashboards.html': 'analytics',
  '/files.html': 'files',
  '/finance.html': 'finance',
  '/forms.html': 'forms',
  '/underwriter.html': 'underwriter',
  '/jobs.html': 'jobs',
  '/knowledge.html': 'knowledge',
  '/messages.html': 'messages',
  '/templates.html': 'templates',
  '/tickets.html': 'tickets',
};

// Pipeline stages are customizable placeholder "groups" the client can edit.
// Each stage is { name, color }. Contacts, quotes, and jobs each keep their own
// editable list, persisted to localStorage.
const DEFAULT_JOB_STAGES = [
  { name: 'Unscheduled', color: '#9AA0A8' },
  { name: 'Scheduled', color: '#378ADD' },
  { name: 'Material ordered', color: '#3C7BD0' },
  { name: 'In production', color: '#BA7517' },
  { name: 'QC / punch list', color: '#C08A2B' },
  { name: 'Invoiced', color: '#7F77DD' },
  { name: 'Paid / closed', color: '#639922' },
  { name: 'On hold', color: '#C4C7CC' },
];
const DEFAULT_CONTACT_STAGES = [
  { name: 'Prospects', color: '#9AA0A8' },
  { name: 'Leads', color: '#378ADD' },
  { name: 'Nurturing', color: '#5AB0A6' },
];
const DEFAULT_DEAL_STAGES = [
  { name: 'Underwriting', color: '#BA7517' },
  { name: 'Estimate Sent', color: '#3C7BD0' },
  { name: 'Negotiating', color: '#C08A2B' },
  { name: 'Contract Sent', color: '#7F77DD' },
  { name: 'Waiting to Sign', color: '#7067CF' },
  { name: 'Won', color: '#639922' },
];
const STAGE_COLOR_PALETTE = ['#9AA0A8', '#378ADD', '#BA7517', '#7F77DD', '#639922', '#E24B4A', '#3C7BD0', '#C08A2B', '#5AB0A6', '#C4C7CC'];
const TEMPERATURES = ['Hot', 'Warm', 'Cold'];
const CONTACT_GUIDANCE = [
  { match: /prospect/i, t: 'Work the prospect.', b: ['Where did this lead come from?', 'Best way to reach them — call, text, email?', 'Is there a real project here, or just looking?', 'Get them into a real conversation.'] },
  { match: /contact/i, t: 'Keep the conversation moving.', b: ['Did you reach the decision maker?', 'What is the preferred next touch?', 'Is there enough detail to hand this into estimating?', 'Set the follow-up before you leave the record.'] },
  { match: /lead/i, t: 'Qualify the lead.', b: ['Have you confirmed the decision maker(s)?', 'Is this an insurance claim or retail pay?', "What's the roof age, system, and visible damage?", "What's their timeline to start?"] },
  { match: /nurtur|follow/i, t: 'Keep it warm.', b: ['When did you last touch base?', 'What are they waiting on to move forward?', "Set a follow-up cadence so they don't go cold.", 'Send value — photos, tips, financing options.'] },
  { match: /underwrit/i, t: 'Scope it and price it.', b: ['Is the takeoff / measurements done?', 'If insurance — do you have the carrier scope?', 'Are material selections confirmed?', 'Is the margin target set on the estimate?'] },
  { match: /estimate/i, t: 'Present the estimate.', b: ['Has the proposal been sent?', 'Did you walk them through Standard vs Recommended?', 'What objections came up?', 'Is the follow-up scheduled?'] },
  { match: /negotiat/i, t: 'Close the deal.', b: ['Are all outstanding questions answered?', 'Are all decision makers on board?', 'Do you need a discount or incentive?', 'Ask for the signature.'] },
  { match: /contract|sign/i, t: 'Get it signed.', b: ['Is the contract out for signature?', 'Has the deposit been collected?', 'Is the start date set?', 'Hand off the details to production.'] },
  { match: /won/i, t: 'Won — convert to a job.', b: ['Schedule the build and assign a crew.', 'Order materials from your vendors.', 'Confirm the scope with the customer.', 'Hit Convert to Job to move it to production.'] },
  { match: /lost/i, t: 'Lost — capture why.', b: ['Log the reason this fell through.', 'Is there a future opportunity to nurture later?', 'Anything to learn for the next bid?'] },
];
function guidanceForStage(name) {
  return CONTACT_GUIDANCE.find((g) => g.match.test(String(name || ''))) || { t: 'Move the deal forward.', b: ['Confirm the next step with the customer.', "Set a follow-up so it doesn't go cold."] };
}
// Maps the previous fixed job stage names onto the new default job stages so
// existing job records still land in a real lane after the rework.
const LEGACY_JOB_STAGE_MAP = {
  'Lead': 'Unscheduled',
  'Site Review': 'Scheduled',
  'Estimate': 'Material ordered',
  'Approved': 'In production',
  'Active': 'In production',
  'Closed': 'Paid / closed',
};

function loadStageList(key, defaults) {
  const raw = readJson(key, null);
  if (!Array.isArray(raw) || !raw.length) return defaults.map((stage) => ({ ...stage }));
  return raw
    .map((stage) => ({
      name: String(stage?.name || '').trim(),
      color: /^#[0-9a-fA-F]{3,8}$/.test(String(stage?.color || '')) ? stage.color : '#9AA0A8',
    }))
    .filter((stage) => stage.name);
}

function canonicalContactStageName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const aliases = {
    prospect: 'Prospects',
    prospects: 'Prospects',
    contacted: 'Leads',
    lead: 'Leads',
    leads: 'Leads',
    nurturing: 'Nurturing',
    underwriting: 'Nurturing',
    'estimate sent': 'Nurturing',
    'proposal sent': 'Nurturing',
    negotiating: 'Nurturing',
    negotiation: 'Nurturing',
    'contract out': 'Nurturing',
    'contract sent': 'Nurturing',
    'waiting to sign': 'Nurturing',
    won: 'Nurturing',
    'follow-up': 'Nurturing',
    lost: 'Nurturing',
  };
  return aliases[raw.toLowerCase()] || raw;
}

function normalizeContactStageList(rows, fallback = DEFAULT_CONTACT_STAGES) {
  const defaultsByName = new Map(fallback.map((stage) => [stage.name, stage]));
  const output = [];
  const seen = new Set();
  rows.forEach((row) => {
    const name = canonicalContactStageName(row?.name);
    if (!name || seen.has(name)) return;
    const fallbackStage = defaultsByName.get(name);
    const color = fallbackStage?.color || (/^#[0-9a-fA-F]{3,8}$/.test(String(row?.color || '')) ? row.color : '#9AA0A8');
    output.push({ name, color });
    seen.add(name);
  });
  return output.length ? output : fallback.map((stage) => ({ ...stage }));
}

let JOB_STAGES = loadStageList(JOB_STAGES_KEY, DEFAULT_JOB_STAGES);
let CONTACT_STAGES = loadStageList(CONTACT_STAGES_KEY, DEFAULT_CONTACT_STAGES);
let DEAL_STAGES = loadStageList(DEAL_STAGES_KEY, DEFAULT_DEAL_STAGES);

function jobStages() { return JOB_STAGES; }
function contactStages() { return CONTACT_STAGES; }
function dealStages() { return DEAL_STAGES; }
function jobStageNames() { return JOB_STAGES.map((stage) => stage.name); }
function contactStageNames() { return CONTACT_STAGES.map((stage) => stage.name); }
function dealStageNames() { return DEAL_STAGES.map((stage) => stage.name); }
function jobStageColor(name) { return (JOB_STAGES.find((stage) => stage.name === name) || {}).color || '#9AA0A8'; }
function contactStageColor(name) { return (CONTACT_STAGES.find((stage) => stage.name === name) || {}).color || '#9AA0A8'; }
function dealStageColor(name) { return (DEAL_STAGES.find((stage) => stage.name === name) || {}).color || '#9AA0A8'; }
function pipelineStages(kind) { return kind === 'contacts' ? CONTACT_STAGES : kind === 'deals' ? DEAL_STAGES : JOB_STAGES; }
function pipelineStageColor(kind, name) { return kind === 'contacts' ? contactStageColor(name) : kind === 'deals' ? dealStageColor(name) : jobStageColor(name); }

function resolveJobStage(value) {
  const names = jobStageNames();
  const raw = String(value || '').trim();
  if (names.includes(raw)) return raw;
  if (LEGACY_JOB_STAGE_MAP[raw] && names.includes(LEGACY_JOB_STAGE_MAP[raw])) return LEGACY_JOB_STAGE_MAP[raw];
  return names[0] || 'Unscheduled';
}
function resolveContactStage(value) {
  const names = contactStageNames();
  const raw = String(value || '').trim();
  if (names.includes(raw)) return raw;
  const legacy = canonicalContactStageName(raw);
  if (names.includes(legacy)) return legacy;
  return names[0] || 'Prospects';
}
function resolveDealStage(value) {
  const names = dealStageNames();
  const raw = String(value || '').trim();
  if (names.includes(raw)) return raw;
  const legacy = {
    Prospect: 'Underwriting',
    Qualified: 'Underwriting',
    'Proposal sent': 'Estimate Sent',
    Negotiation: 'Negotiating',
    'Verbal commit': 'Waiting to Sign',
    Won: 'Won',
    Lost: 'Negotiating',
  }[raw];
  if (legacy && names.includes(legacy)) return legacy;
  return names[0] || 'Underwriting';
}

function persistJobStages() { JOB_STAGES = JOB_STAGES.filter((stage) => stage.name); writeJson(JOB_STAGES_KEY, JOB_STAGES); }
function persistContactStages() { CONTACT_STAGES = CONTACT_STAGES.filter((stage) => stage.name); writeJson(CONTACT_STAGES_KEY, CONTACT_STAGES); }
function persistDealStages() { DEAL_STAGES = DEAL_STAGES.filter((stage) => stage.name); writeJson(DEAL_STAGES_KEY, DEAL_STAGES); }

const ACCOUNT_TYPES = ['Customer', 'Prospect', 'Partner', 'Vendor'];
const ACTIVITY_TYPES = ['note', 'call', 'email', 'meeting', 'task', 'stage_change', 'system'];
const JOB_TABS = ['pipeline', 'list', 'profile'];
const TASK_STATUSES = ['todo', 'pending', 'hold', 'review', 'done'];
const TASK_PRIORITIES = ['critical', 'urgent', 'high', 'medium', 'low'];
const TASK_TYPES = ['lead', 'bid', 'admin', 'invoicing', 'ar', 'meeting', 'web_dev'];
const CALENDAR_EVENT_TYPES = ['Company event', 'Job visit / inspection', 'Estimate appointment', 'Install / field work', 'Internal meeting', 'Personal reminder'];
const CALENDAR_FILTER_TYPES = ['Task due', 'Invoice due', 'Approval', 'Time'].concat(CALENDAR_EVENT_TYPES);
const FILE_ICON_ASSET_BASE = 'https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/';
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

const contactsFallback = [
  { id: 'contact-1', company_id: 'roofing', name: 'William Moran', phone: '928-231-0147', email: 'wrmoran@gmail.com', location: 'Future project', stage: 'Prospects', value: 0, owner_name: 'Abraham Flores' },
  { id: 'contact-2', company_id: 'roofing', name: 'Valerie McKenzie', phone: '602-750-5678', email: '', location: '6054 E Blanche Dr, Scottsdale', stage: 'Prospects', value: 0, owner_name: 'Maya Rosales' },
  { id: 'contact-3', company_id: 'roofing', name: 'April Reyes', phone: '480-277-1540', email: '', location: '451 E 10th Ave, Mesa', stage: 'Leads', value: 14500, owner_name: 'Andre Lee' },
  { id: 'contact-4', company_id: 'roofing', name: 'Mario Esquivel', phone: '480-955-4036', email: 'esquivel@residence.com', location: 'Costa Bella Residence', stage: 'Leads', value: 22000, owner_name: 'Maya Rosales' },
  { id: 'contact-5', company_id: 'roofing', name: 'Mike - Maricopa', phone: '503-317-4788', email: '', location: 'Maricopa', stage: 'Nurturing', value: 31000, owner_name: 'Andre Lee' },
  { id: 'contact-6', company_id: 'roofing', name: 'Kumar Residence', phone: '', email: '', location: '16750 E Nicklaus Dr, Fountain Hills', stage: 'Nurturing', value: 47800, owner_name: 'Maya Rosales' },
  { id: 'contact-7', company_id: 'roofing', name: 'Keith Salas', phone: '717-991-7029', email: '', location: '15948 E Sycamore', stage: 'Leads', value: 28900, owner_name: 'Andre Lee' },
  { id: 'contact-8', company_id: 'roofing', name: 'Brad Lundstrom', phone: '602-577-9523', email: 'lundstromdesign@gmail.com', location: '3200 W Wander Ln', stage: 'Nurturing', value: 53200, owner_name: 'Abraham Flores' },
  { id: 'contact-9', company_id: 'roofing', name: 'Rosa Cruz-Blanch', phone: '787-549-0942', email: 'rcruz@natlbtr.com', location: 'W Encanto Blvd', stage: 'Leads', value: 61000, owner_name: 'Maya Rosales' },
  { id: 'contact-10', company_id: 'drafting', name: 'Horizon HVAC', phone: '480-555-0199', email: 'plans@horizonhvac.com', location: 'Chandler, AZ', stage: 'Nurturing', value: 4200, owner_name: 'Noah Park', account_id: 'account-3', title: 'Facilities lead' },
];

const accountsFallback = [
  { id: 'account-1', company_id: 'roofing', name: 'Cruz-Blanch Residence', type: 'Customer', industry: 'Residential', phone: '787-549-0942', email: 'rcruz@natlbtr.com', address: 'W Encanto Blvd, Phoenix AZ', owner_name: 'Maya Rosales', status: 'Active' },
  { id: 'account-2', company_id: 'roofing', name: 'Mesa Storage Partners', type: 'Customer', industry: 'Commercial', phone: '480-555-0140', email: 'ops@mesastorage.com', address: 'Mesa, AZ', owner_name: 'Andre Lee', status: 'Active' },
  { id: 'account-3', company_id: 'drafting', name: 'Horizon HVAC', type: 'Partner', industry: 'HVAC', phone: '480-555-0199', email: 'plans@horizonhvac.com', address: 'Chandler, AZ', owner_name: 'Noah Park', status: 'Active' },
];

const dealsFallback = [
  { id: 'deal-1', company_id: 'roofing', account_id: 'account-1', primary_contact_id: 'contact-9', name: 'Encanto re-roof', stage: 'Waiting to Sign', status: 'open', value: 61000, probability: 80, owner_name: 'Maya Rosales', source: 'Referral' },
  { id: 'deal-2', company_id: 'roofing', account_id: 'account-2', primary_contact_id: '', name: 'Mesa membrane repair', stage: 'Estimate Sent', status: 'open', value: 18400, probability: 50, owner_name: 'Andre Lee', source: 'Website' },
  { id: 'deal-3', company_id: 'roofing', account_id: 'account-1', primary_contact_id: 'contact-7', name: 'Sycamore tear-off', stage: 'Negotiating', status: 'open', value: 28900, probability: 60, owner_name: 'Andre Lee', source: 'Door knock' },
  { id: 'deal-4', company_id: 'drafting', account_id: 'account-3', primary_contact_id: 'contact-10', name: 'Permit drawing package', stage: 'Underwriting', status: 'open', value: 4200, probability: 40, owner_name: 'Noah Park', source: 'Partner' },
];

const activitiesFallback = [
  { id: 'activity-1', company_id: 'roofing', type: 'call', subject: 'Intro call with Rosa', body: 'Discussed scope and timeline for the re-roof.', related_type: 'deal', related_id: 'deal-1', account_id: 'account-1', owner_name: 'Maya Rosales', completed_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'activity-2', company_id: 'roofing', type: 'note', subject: 'Proposal sent', body: 'Emailed membrane repair proposal, awaiting board review.', related_type: 'deal', related_id: 'deal-2', account_id: 'account-2', owner_name: 'Andre Lee', completed_at: new Date(Date.now() - 172800000).toISOString() },
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

const calendarEventsFallback = [
  {
    id: 'calendar-roofing-install',
    company_id: 'roofing',
    title: 'East ridge install window',
    description: 'Crew visit for install prep and materials check.',
    event_type: 'Install / field work',
    starts_at: `${isoDate(1)}T14:00:00.000Z`,
    ends_at: `${isoDate(1)}T17:00:00.000Z`,
    all_day: false,
    visibility: 'company',
    linked_type: 'job',
    linked_id: 'job-east-ridge',
    assigned_profile_id: 'abraham',
    created_by: 'basic-quest-user',
  },
  {
    id: 'calendar-roofing-estimate',
    company_id: 'roofing',
    title: 'Garage roof estimate',
    description: 'Client walkthrough and estimate appointment.',
    event_type: 'Estimate appointment',
    starts_at: `${isoDate(3)}T16:00:00.000Z`,
    ends_at: `${isoDate(3)}T17:00:00.000Z`,
    all_day: false,
    visibility: 'company',
    linked_type: '',
    linked_id: '',
    assigned_profile_id: 'shan',
    created_by: 'basic-quest-user',
  },
  {
    id: 'calendar-drafting-review',
    company_id: 'drafting',
    title: 'Plan review block',
    description: 'Drafting team review for active plan updates.',
    event_type: 'Internal meeting',
    starts_at: `${isoDate(2)}T15:00:00.000Z`,
    ends_at: `${isoDate(2)}T15:45:00.000Z`,
    all_day: false,
    visibility: 'company',
    linked_type: '',
    linked_id: '',
    assigned_profile_id: '',
    created_by: 'basic-quest-user',
  },
  {
    id: 'calendar-lumen-product',
    company_id: 'lumen',
    title: 'Quest HQ product review',
    description: 'Review workspace permissions, messages, and calendar flow.',
    event_type: 'Company event',
    starts_at: `${isoDate(4)}T18:00:00.000Z`,
    ends_at: `${isoDate(4)}T19:00:00.000Z`,
    all_day: false,
    visibility: 'company',
    linked_type: '',
    linked_id: '',
    assigned_profile_id: 'basic-quest-user',
    created_by: 'basic-quest-user',
  },
];

const state = {
  route: null,
  session: readJson(SESSION_KEY, null),
  profileDraft: readJson(PROFILE_KEY, null),
  authReady: !CONFIG.questAuthEnabled,
  authMode: 'signin',
  jobs: readSeededList(JOB_CACHE_KEY, jobsFallback).map(normalizeJob),
  contacts: readSeededList(CONTACT_CACHE_KEY, contactsFallback).map(normalizeContact),
  accounts: readSeededList(ACCOUNT_CACHE_KEY, accountsFallback).map(normalizeAccount),
  deals: readSeededList(DEAL_CACHE_KEY, dealsFallback).map(normalizeDeal),
  activities: readSeededList(ACTIVITY_CACHE_KEY, activitiesFallback).map(normalizeActivity),
  pipelineStages: [],
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
  calendarEvents: readSeededList(CALENDAR_EVENT_CACHE_KEY, calendarEventsFallback).map(normalizeCalendarEvent),
  timeEntries: readJson(TIME_ENTRY_CACHE_KEY, []),
  activeTimer: readJson(ACTIVE_TIMER_KEY, null),
  teamMembers: readSeededList(TEAM_CACHE_KEY, teamMembersFallback).map(normalizeTeamMember),
  memberships: readSeededList(MEMBERSHIP_CACHE_KEY, membershipsFallback),
  profiles: [],
  platformAdmin: false,
  platformCompanies: [],
  platformCompanyMembers: [],
  subscriptions: [],
  workspaceReviews: [],
  roles: [],
  rolePermissions: [],
  roleAssignments: [],
  resourceAcl: [],
  fieldPermissions: [],
  companyInvites: [],
  joinRequests: [],
  auditEvents: [],
  companyPlugins: [],
  pluginLoadFailed: false,
  companies: mergeCompanies(companiesFallback.map(normalizeCompany)),
  activeCompanyId: localStorage.getItem(COMPANY_KEY) || '',
  sidebarCollapsed: localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
  collapsedNavGroups: new Set(readJson(NAV_GROUP_COLLAPSED_KEY, [])),
  expandedNav: new Set(readJson(NAV_EXPANDED_KEY, ['contacts', 'jobs', 'deals'])),
  jobBoardView: localStorage.getItem(JOB_BOARD_VIEW_KEY) || 'board',
  contactBoardView: localStorage.getItem(CONTACT_BOARD_VIEW_KEY) || 'table',
  dealBoardView: localStorage.getItem(DEAL_BOARD_VIEW_KEY) || 'board',
  contactStageFilter: 'all',
  contactQuery: '',
  selectedContactId: '',
  stageFilterDeals: 'all',
  dealQuery: '',
  selectedDealId: '',
  accountQuery: '',
  accountTypeFilter: 'all',
  selectedAccountId: '',
  accountTab: 'overview',
  dealPrefill: null,
  activityPrefill: null,
  contactPrefill: null,
  selectedJobId: '',
  selectedTaskId: '',
  selectedFileId: '',
  selectedFormId: '',
  selectedQuestionId: '',
  selectedFinanceInvoiceId: '',
  selectedFinanceExpenseId: '',
  selectedFinanceVendorId: '',
  selectedCalendarEventId: '',
  inviteLookup: null,
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
  calendarScope: 'company',
  calendarView: 'week',
  calendarQuery: '',
  calendarTypeFilter: 'all',
  calendarCursorDate: isoDate(0),
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
  mobileMenuOpen: false,
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
    resetLiveWorkspaceData();
    state.dataLoaded = false;
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  const profile = await fetchSupabaseProfile(session.user);
  const nextSession = buildSupabaseSession(session, profile);
  const shouldReloadWorkspace = shouldReloadWorkspaceForSession(state.session, nextSession);
  state.session = nextSession;
  if (shouldReloadWorkspace) {
    resetLiveWorkspaceData();
    state.dataLoaded = false;
  }
  writeJson(SESSION_KEY, state.session);
}

function shouldReloadWorkspaceForSession(previousSession, nextSession) {
  if (!previousSession || previousSession.auth !== 'supabase') return true;
  if (!nextSession || nextSession.auth !== 'supabase') return true;
  if (previousSession?.user?.id !== nextSession?.user?.id) return true;
  if (previousSession?.profile?.member_id !== nextSession?.profile?.member_id) return true;
  if (previousSession?.profile?.role !== nextSession?.profile?.role) return true;
  if (previousSession?.profile?.approved !== nextSession?.profile?.approved) return true;
  return JSON.stringify(previousSession?.profile?.company_ids || []) !== JSON.stringify(nextSession?.profile?.company_ids || []);
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

  if (state.route.name === 'home') {
    renderLandingPage(false);
    return;
  }

  if (state.route.name === 'login') {
    renderLandingPage(true);
    return;
  }

  if (needsLocalLogin(state.route)) {
    navigate('/login?return_url=' + encodeURIComponent(currentAppUrl()), { replace: true });
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

function workspacePresetSelect(selected = 'generic') {
  return `
    <label>Company type
      <select name="preset_code">
        ${Object.keys(WORKSPACE_PLUGIN_PRESETS).map((presetCode) => `
          <option value="${h(presetCode)}" ${presetCode === selected ? 'selected' : ''}>${h(WORKSPACE_PLUGIN_PRESET_LABELS[presetCode] || titleCase(presetCode))}</option>
        `).join('')}
      </select>
    </label>
  `;
}

function renderNoCompanyAccess() {
  const busy = /creating|joining|opening/i.test(state.authMessage || '');
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
          <p>Your account exists, but you are not an active member of a company workspace yet. Business owners can create a workspace. Workers need an invite code from their company admin.</p>
        </div>
        <section class="login-lanes no-access-lanes">
          <article class="login-lane-card">
            <div>
              <strong>Business owner</strong>
              <span>Create a company workspace for Quest approval.</span>
            </div>
            <form data-company-create-form>
              <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
              ${workspacePresetSelect()}
              <button class="btn btn-primary full" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Creating workspace...' : 'Create business workspace'}</button>
              ${state.loginError ? `<div class="form-message error">${h(state.loginError)}</div>` : `<div class="form-message">${h(state.authMessage || 'You become Owner, then Quest approves access before live modules open.')}</div>`}
            </form>
          </article>
          <article class="login-lane-card">
            <div>
              <strong>Invited worker</strong>
              <span>Join only with a code from your Owner/Admin.</span>
            </div>
            <form data-existing-invite-code-form>
              <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste invite code" /></label>
              <button class="btn full" type="submit">Join workspace</button>
              <div class="form-message">Worker registration is blocked without an invite.</div>
            </form>
          </article>
        </section>
        <button class="btn full" type="button" data-action="sign-out">Sign out</button>
      </section>
    </main>
  `;
}

function needsLocalLogin(route) {
  if (!CONFIG.questAuthEnabled && !CONFIG.localLoginEnabled) return false;
  if (route.name === 'login' || route.name === 'home') return false;
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
    .catch(async (error) => {
      console.warn('Workspace data load failed', error);
      if (state.session?.auth === 'supabase') {
        await loadSupabaseBootstrapData().catch((bootstrapError) => console.warn('Workspace bootstrap load failed', bootstrapError));
      }
      if (state.sync.mode === 'loading') state.sync = { label: 'Local fallback', mode: 'local' };
    })
    .finally(() => {
      state.dataLoaded = true;
      state.dataLoading = false;
      persistAll();
      render();
    });
}

async function loadSupabaseData() {
  if (state.session?.auth === 'local-basic' || state.session?.auth === 'demo-readonly') {
    state.sync = { label: isReadOnlyDemo() ? 'Read-only demo' : 'Demo mode', mode: 'local' };
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
    calendarEventsResult,
    notificationsResult,
    financeInvoicesResult,
    financePaymentsResult,
    financeExpensesResult,
    financeVendorsResult,
    contactsResult,
    pipelineStagesResult,
    accountsResult,
    dealsResult,
    activitiesResult,
    companyPluginsResult,
    platformAdminResult,
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
    client.from('calendar_events').select('*').order('starts_at', { ascending: true }),
    client.from('notifications').select('*').order('created_at', { ascending: false }).limit(200),
    client.from('finance_invoices').select('*').order('updated_at', { ascending: false }),
    client.from('finance_payments').select('*').order('received_at', { ascending: false }),
    client.from('finance_expenses').select('*').order('spent_at', { ascending: false }),
    client.from('finance_vendors').select('*').order('name', { ascending: true }),
    client.from('contacts').select('*').order('updated_at', { ascending: false }),
    client.from('pipeline_stages').select('*').order('position', { ascending: true }),
    client.from('accounts').select('*').order('name', { ascending: true }),
    client.from('deals').select('*').order('updated_at', { ascending: false }),
    client.from('activities').select('*').order('created_at', { ascending: false }).limit(500),
    safeSupabaseQuery(client.from('company_plugins').select('*')),
    safeSupabaseQuery(client.rpc('is_platform_admin')),
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
  if (!calendarEventsResult.error) state.calendarEvents = (calendarEventsResult.data || []).map(normalizeCalendarEvent);
  if (!notificationsResult.error) state.notifications = (notificationsResult.data || []).map(normalizeNotification);
  if (!financeInvoicesResult.error) {
    state.financeInvoices = (financeInvoicesResult.data || []).map(normalizeFinanceInvoice);
    liveTables += 1;
  }
  if (!financePaymentsResult.error) state.financePayments = (financePaymentsResult.data || []).map(normalizeFinancePayment);
  if (!financeExpensesResult.error) state.financeExpenses = (financeExpensesResult.data || []).map(normalizeFinanceExpense);
  if (!financeVendorsResult.error) state.financeVendors = (financeVendorsResult.data || []).map(normalizeFinanceVendor);
  if (!contactsResult.error) {
    state.contacts = (contactsResult.data || []).map(normalizeContact);
    liveTables += 1;
  }
  if (!pipelineStagesResult.error) {
    state.pipelineStages = pipelineStagesResult.data || [];
    applyPipelineStagesForCompany(activeCompanyId());
  }
  if (!accountsResult.error) {
    state.accounts = (accountsResult.data || []).map(normalizeAccount);
    liveTables += 1;
  }
  if (!dealsResult.error) {
    state.deals = (dealsResult.data || []).map(normalizeDeal);
    liveTables += 1;
  }
  if (!activitiesResult.error) {
    state.activities = (activitiesResult.data || []).map(normalizeActivity);
  }
  if (!companyPluginsResult.error) {
    state.companyPlugins = (companyPluginsResult.data || []).map(normalizeCompanyPlugin);
    state.pluginLoadFailed = false;
  } else {
    state.pluginLoadFailed = true;
  }
  state.platformAdmin = !platformAdminResult.error && platformAdminResult.data === true;

  if (state.platformAdmin) {
    const [platformCompaniesResult, platformMembersResult] = await Promise.all([
      safeSupabaseQuery(client.rpc('list_platform_companies')),
      safeSupabaseQuery(client.rpc('list_platform_company_members', { target_company_id: null })),
    ]);
    if (!platformCompaniesResult.error) {
      state.platformCompanies = (platformCompaniesResult.data || []).map(normalizePlatformCompany);
      state.workspaceReviews = state.platformCompanies.map(normalizeWorkspaceReview);
      state.companies = mergeCompanies(state.companies.concat(state.platformCompanies.map((company) => normalizeCompany({
        id: company.company_id,
        name: company.company_name,
        short_name: company.short_name || company.company_name,
        color: company.color,
        label: company.label,
        pill: company.pill,
      }))));
      state.subscriptions = mergeSubscriptions(state.subscriptions.concat(state.platformCompanies.map(normalizeSubscription)));
    }
    if (!platformMembersResult.error) {
      state.platformCompanyMembers = (platformMembersResult.data || []).map(normalizePlatformCompanyMember);
    }
  }

  if (isQuestDeveloper() && !state.platformCompanies.length) {
    const reviewsResult = await safeSupabaseQuery(client.rpc('list_workspace_reviews'));
    if (!reviewsResult.error) {
      state.workspaceReviews = (reviewsResult.data || []).map(normalizeWorkspaceReview);
      const reviewCompanies = state.workspaceReviews.map((review) => normalizeCompany({
        id: review.company_id,
        name: review.company_name,
        short_name: review.company_name,
      }));
      const reviewSubscriptions = state.workspaceReviews.map((review) => normalizeSubscription({
        company_id: review.company_id,
        status: review.status,
        plan_code: review.plan_code,
        amount_cents: review.amount_cents,
        currency: review.currency,
        trial_ends_at: review.trial_ends_at,
        current_period_end: review.current_period_end,
        grace_ends_at: review.grace_ends_at,
      }));
      state.companies = mergeCompanies(state.companies.concat(reviewCompanies));
      state.subscriptions = mergeSubscriptions(state.subscriptions.concat(reviewSubscriptions));
    }
  }

  state.sync = liveTables ? { label: 'Quest Supabase live', mode: 'live' } : { label: 'Local fallback', mode: 'local' };
}

async function loadSupabaseBootstrapData() {
  if (state.session?.auth !== 'supabase') return;
  const client = createSupabaseClient();
  if (!client) return;
  const profile = activeSession().profile;
  const [membershipsResult, profileResult, platformAdminResult] = await Promise.all([
    safeSupabaseQuery(client.from('company_memberships').select('*').eq('profile_id', profile.id)),
    safeSupabaseQuery(client.from('profiles').select('*').eq('id', profile.id).maybeSingle()),
    safeSupabaseQuery(client.rpc('is_platform_admin')),
  ]);
  if (!profileResult.error && profileResult.data) {
    const nextProfile = normalizeProfile(profileResult.data, profile);
    state.session = { ...activeSession(), profile: nextProfile };
    writeJson(SESSION_KEY, state.session);
  }
  if (!membershipsResult.error) {
    const ownMemberships = (membershipsResult.data || []).map(normalizeMembership);
    state.memberships = ownMemberships.concat(state.memberships.filter((item) => item.profile_id !== profile.id));
  }
  state.platformAdmin = !platformAdminResult.error && platformAdminResult.data === true;
  const companyIds = compactUnique(state.memberships
    .filter((item) => item.profile_id === activeSession().profile.id && item.status === 'active')
    .map((item) => item.company_id)
    .concat(activeSession().profile.company_ids || []));
  if (companyIds.length) {
    const [companiesResult, subscriptionsResult, rolesResult, rolePermissionsResult, roleAssignmentsResult, companyPluginsResult] = await Promise.all([
      safeSupabaseQuery(client.from('companies').select('*').in('id', companyIds)),
      safeSupabaseQuery(client.from('company_subscriptions').select('*').in('company_id', companyIds)),
      safeSupabaseQuery(client.from('roles').select('*').in('company_id', companyIds)),
      safeSupabaseQuery(client.from('role_permissions').select('*')),
      safeSupabaseQuery(client.from('user_role_assignments').select('*').in('company_id', companyIds)),
      safeSupabaseQuery(client.from('company_plugins').select('*').in('company_id', companyIds)),
    ]);
    if (!companiesResult.error) state.companies = mergeCompanies(state.companies.concat((companiesResult.data || []).map(normalizeCompany)));
    if (!subscriptionsResult.error) state.subscriptions = mergeSubscriptions(state.subscriptions.concat((subscriptionsResult.data || []).map(normalizeSubscription)));
    if (!rolesResult.error) state.roles = mergeRoles(state.roles.concat((rolesResult.data || []).map(normalizeRole)));
    if (!rolePermissionsResult.error) state.rolePermissions = (rolePermissionsResult.data || []).map(normalizeRolePermission);
    if (!roleAssignmentsResult.error) state.roleAssignments = (roleAssignmentsResult.data || []).map(normalizeRoleAssignment);
    if (!companyPluginsResult.error) {
      state.companyPlugins = mergeCompanyPlugins(state.companyPlugins.concat((companyPluginsResult.data || []).map(normalizeCompanyPlugin)));
      state.pluginLoadFailed = false;
    } else {
      state.pluginLoadFailed = true;
    }
  }
  if (state.platformAdmin) {
    const [platformCompaniesResult, platformMembersResult] = await Promise.all([
      safeSupabaseQuery(client.rpc('list_platform_companies')),
      safeSupabaseQuery(client.rpc('list_platform_company_members', { target_company_id: null })),
    ]);
    if (!platformCompaniesResult.error) {
      state.platformCompanies = (platformCompaniesResult.data || []).map(normalizePlatformCompany);
      state.companies = mergeCompanies(state.companies.concat(state.platformCompanies.map((company) => normalizeCompany({
        id: company.company_id,
        name: company.company_name,
        short_name: company.short_name || company.company_name,
        color: company.color,
        label: company.label,
        pill: company.pill,
      }))));
      state.subscriptions = mergeSubscriptions(state.subscriptions.concat(state.platformCompanies.map(normalizeSubscription)));
    }
    if (!platformMembersResult.error) state.platformCompanyMembers = (platformMembersResult.data || []).map(normalizePlatformCompanyMember);
  }
  state.sync = { label: 'Quest Supabase limited', mode: 'live' };
}

function createSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  if (!supabaseClientCache) {
    supabaseClientCache = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }
  return supabaseClientCache;
}

function safeSupabaseQuery(query) {
  return Promise.resolve(query).catch((error) => ({ error }));
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
  state.calendarEvents = [];
  state.timeEntries = [];
  state.activeTimer = null;
  state.teamMembers = [];
  state.memberships = [];
  state.profiles = [];
  state.platformAdmin = false;
  state.platformCompanies = [];
  state.platformCompanyMembers = [];
  state.subscriptions = [];
  state.workspaceReviews = [];
  state.roles = [];
  state.rolePermissions = [];
  state.roleAssignments = [];
  state.resourceAcl = [];
  state.fieldPermissions = [];
  state.companyInvites = [];
  state.joinRequests = [];
  state.auditEvents = [];
  state.companyPlugins = [];
  state.pluginLoadFailed = false;
  state.companies = [];
  state.sync = { label: 'Loading secure workspace...', mode: 'loading' };
}

function resetDemoWorkspaceData() {
  const readDemoList = isReadOnlyDemo() ? ((_key, fallback) => (Array.isArray(fallback) ? fallback : [])) : readSeededList;
  const readDemoJson = isReadOnlyDemo() ? ((_key, fallback) => fallback) : readJson;
  state.jobs = readDemoList(JOB_CACHE_KEY, jobsFallback).map(normalizeJob);
  state.contacts = readDemoList(CONTACT_CACHE_KEY, contactsFallback).map(normalizeContact);
  state.accounts = readDemoList(ACCOUNT_CACHE_KEY, accountsFallback).map(normalizeAccount);
  state.deals = readDemoList(DEAL_CACHE_KEY, dealsFallback).map(normalizeDeal);
  state.activities = readDemoList(ACTIVITY_CACHE_KEY, activitiesFallback).map(normalizeActivity);
  state.tasks = readDemoList(TASK_CACHE_KEY, tasksFallback).map(normalizeTask);
  state.files = readDemoList(FILE_CACHE_KEY, filesFallback).map(normalizeFile);
  state.driveFolders = readDemoList(DRIVE_FOLDER_CACHE_KEY, []).map(normalizeDriveFolder);
  state.forms = readDemoList(FORM_CACHE_KEY, formsFallback).map(normalizeForm);
  state.formResponses = readDemoList(FORM_RESPONSE_CACHE_KEY, formResponsesFallback).map(normalizeFormResponse);
  state.financeInvoices = readDemoList(FINANCE_INVOICE_CACHE_KEY, financeInvoicesFallback).map(normalizeFinanceInvoice);
  state.financePayments = readDemoList(FINANCE_PAYMENT_CACHE_KEY, financePaymentsFallback).map(normalizeFinancePayment);
  state.financeExpenses = readDemoList(FINANCE_EXPENSE_CACHE_KEY, financeExpensesFallback).map(normalizeFinanceExpense);
  state.financeVendors = readDemoList(FINANCE_VENDOR_CACHE_KEY, financeVendorsFallback).map(normalizeFinanceVendor);
  state.notifications = readDemoList(NOTIFICATION_CACHE_KEY, notificationsFallback).map(normalizeNotification);
  state.messageConversations = readDemoList(MESSAGE_CONVERSATION_CACHE_KEY, messageConversationsFallback).map(normalizeMessageConversation);
  state.messageAccess = readDemoList(MESSAGE_ACCESS_CACHE_KEY, messageAccessFallback).map(normalizeMessageAccess);
  state.messages = readDemoList(MESSAGE_CACHE_KEY, messagesFallback).map(normalizeMessage);
  state.messageReads = readDemoList(MESSAGE_READ_CACHE_KEY, messageReadsFallback).map(normalizeMessageRead);
  state.messageAttachments = readDemoList(MESSAGE_ATTACHMENT_CACHE_KEY, messageAttachmentsFallback).map(normalizeMessageAttachment);
  state.calendarEvents = readDemoList(CALENDAR_EVENT_CACHE_KEY, calendarEventsFallback).map(normalizeCalendarEvent);
  state.timeEntries = readDemoJson(TIME_ENTRY_CACHE_KEY, []);
  state.activeTimer = readDemoJson(ACTIVE_TIMER_KEY, null);
  state.teamMembers = readDemoList(TEAM_CACHE_KEY, teamMembersFallback).map(normalizeTeamMember);
  state.memberships = readDemoList(MEMBERSHIP_CACHE_KEY, membershipsFallback);
  state.profiles = [];
  state.platformAdmin = false;
  state.platformCompanies = [];
  state.platformCompanyMembers = [];
  state.subscriptions = [];
  state.workspaceReviews = [];
  state.roles = [];
  state.rolePermissions = [];
  state.roleAssignments = [];
  state.resourceAcl = [];
  state.fieldPermissions = [];
  state.companyInvites = [];
  state.joinRequests = [];
  state.auditEvents = [];
  state.companyPlugins = demoCompanyPluginRows();
  state.pluginLoadFailed = false;
  state.companies = mergeCompanies(companiesFallback.map(normalizeCompany));
  state.sync = { label: isReadOnlyDemo() ? 'Read-only demo' : 'Demo mode', mode: 'local' };
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
      <symbol id="q-symbol-calendar" viewBox="0 0 24 24">
        <path d="M5 5.5h14v14H5v-14Z" />
        <path d="M8 3.5v4M16 3.5v4M5 9.5h14M8.5 13h2M13.5 13h2M8.5 16h2" />
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

function renderCompanySwitch(companyId, extraClass = '') {
  const companies = allowedCompanies();
  const current = companies.find((company) => company.id === companyId) || companyById(companyId) || companies[0] || {};
  const className = ['company-switch', extraClass, companies.length <= 1 ? 'single-company' : ''].filter(Boolean).join(' ');
  if (companies.length <= 1) {
    return `
      <div class="${h(className)}" aria-label="Active company">
        ${svgIcon('q-company')}
        <strong>${h(companyLabel(current))}</strong>
      </div>
    `;
  }
  return `
    <label class="${h(className)}">
      ${svgIcon('q-company')}
      <select data-company-switch aria-label="Active company">
        ${companies.map((company) => `<option value="${h(company.id)}" ${company.id === companyId ? 'selected' : ''}>${h(companyLabel(company))}</option>`).join('')}
      </select>
    </label>
  `;
}

function shellTemplate(route, workspace) {
  const session = activeSession();
  const companyId = activeCompanyId();
  const emailVerified = isSessionEmailVerified(session);
  return `
    <div class="quest-app ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}" data-route="${h(route.name)}" data-section="${h(route.section || '')}">
      ${renderSvgSprite()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${appHref(companyPath('home', {}, companyId))}" data-router aria-label="Quest HQ workspace">
            ${svgIcon('q-logo', 'brand-symbol')}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${h(CONFIG.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          ${renderCompanySwitch(companyId)}
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
      ${renderMobileStatusRail(companyId)}
      ${renderReadOnlyDemoBanner()}
      ${renderRolePreviewBanner(companyId)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${renderDeck(route)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${workspace}
        </main>
      </div>
      ${renderMobileTabbar(route, companyId)}
      ${renderMobileMoreSheet(route, companyId)}
    </div>
    ${renderActiveModal(route, session)}
    ${renderToast()}
  `;
}

function renderMobileStatusRail(companyId) {
  const activeUsers = companyAccessUsers(companyId).filter((user) => user.status === 'active').length;
  const overdueTasks = companyTasks(companyId).filter((task) => task.status !== 'done' && task.due && new Date(task.due) < startOfToday()).length;
  const health = subscriptionAllowsCompany(companyId) ? 'Good' : 'Pending';
  return `
    <div class="mobile-status-rail" aria-label="Workspace status">
      <a href="${appHref(companyPath('settings', { tab: 'billing' }, companyId))}" data-router>
        ${svgIcon('q-symbol-approvals')}<span>${h(subscriptionLabel(companyId))}</span>
      </a>
      <a href="${appHref(companyPath('users', {}, companyId))}" data-router>
        ${svgIcon('q-symbol-users')}<span>${h(String(activeUsers))} active</span>
      </a>
      <a href="${appHref(companyPath('tasks', {}, companyId))}" data-router>
        ${svgIcon('q-symbol-tasks')}<span>${h(String(overdueTasks))} overdue</span>
      </a>
      <a href="${appHref(companyPath('settings', {}, companyId))}" data-router>
        ${svgIcon('q-symbol-settings')}<span>Health: ${h(health)}</span>
      </a>
    </div>
  `;
}

function renderMobileTabbar(route, companyId) {
  const showMessages = isModuleInstalled('messages', companyId) && can('messages.view', companyId);
  const showFiles = isModuleInstalled('files', companyId) && can('files.view', companyId);
  const unreadMessages = showMessages ? companyMessageUnreadCount(companyId) : 0;
  const files = showFiles ? companyFiles(companyId).length : '';
  const workBadge = companyJobs(companyId).length + companyTasks(companyId).filter((task) => task.status !== 'done').length;
  const workSections = installedModulesForMobileWork(companyId);
  return `
    <nav class="mobile-tabbar" aria-label="Mobile workspace navigation">
      ${mobileTabItem(route, companyPath('home', {}, companyId), 'ti-home', 'Home', '', ['home'])}
      ${mobileTabItem(route, companyPath('jobs', {}, companyId), 'ti-layout-grid', 'Work', workBadge, workSections)}
      ${showMessages ? mobileTabItem(route, companyPath('messages', {}, companyId), 'ti-message-circle', 'Messages', unreadMessages, ['messages']) : ''}
      ${showFiles ? mobileTabItem(route, companyPath('files', {}, companyId), 'ti-folder', 'Files', files, ['files']) : ''}
      <button class="${state.mobileMenuOpen ? 'active' : ''}" type="button" data-action="toggle-mobile-menu" aria-haspopup="true" aria-expanded="${state.mobileMenuOpen ? 'true' : 'false'}" aria-label="More navigation">
        <i class="ti ti-dots"></i>
        <span>More</span>
      </button>
    </nav>
  `;
}

function renderMobileMoreSheet(route, companyId) {
  const modulesById = new Map(MODULE_REGISTRY.map((module) => [module.id, module]));
  const groups = NAV_GROUPS.map((group) => {
    const items = group.ids
      .map((id) => modulesById.get(id))
      .filter((module) => module && module.status !== 'planned' && canViewModule(module, companyId))
      .map((module) => {
        const path = companyPath(module.id, {}, companyId);
        const active = isActiveNav(route, path);
        const count = moduleBadgeCount(module.id, companyId);
        return `
          <a class="more-sheet-item ${active ? 'active' : ''}" href="${appHref(path)}" data-router>
            ${svgIcon(module.symbol)}
            <span>${h(module.label)}</span>
            ${count !== '' ? `<b>${h(String(count))}</b>` : ''}
          </a>
        `;
      });
    if (!items.length) return '';
    return `
      <div class="more-sheet-group">
        <div class="more-sheet-label">${h(group.label)}</div>
        <div class="more-sheet-items">${items.join('')}</div>
      </div>
    `;
  }).join('');
  return `
    <div class="mobile-more ${state.mobileMenuOpen ? 'open' : ''}">
      <button class="mobile-more-backdrop" type="button" data-action="toggle-mobile-menu" aria-label="Close menu"></button>
      <div class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="More navigation">
        <div class="mobile-more-head">
          <strong>Menu</strong>
          <button class="mobile-more-close" type="button" data-action="toggle-mobile-menu" aria-label="Close menu"><i class="ti ti-x"></i></button>
        </div>
        <div class="mobile-more-scroll">${groups}</div>
      </div>
    </div>
  `;
}

function mobileTabItem(route, path, icon, label, count, sections) {
  const active = route.name === 'company' && sections.includes(route.section);
  return `
    <a class="${active ? 'active' : ''}" href="${appHref(path)}" data-router>
      <i class="ti ${h(icon)}"></i>
      ${count ? `<b>${h(String(Math.min(Number(count) || 0, 99)))}</b>` : ''}
      <span>${h(label)}</span>
    </a>
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
          ${notifications.slice(0, 12).map((item) => renderNotificationItem(item)).join('') || emptyState('No notifications yet.')}
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
        <small>${h(notificationTypeLabel(item.type))} - ${h(item.title)} - ${h(timeAgo(item.created_at))}</small>
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

function renderReadOnlyDemoBanner() {
  if (!isReadOnlyDemo()) return '';
  return `
    <div class="readonly-demo-banner">
      <i class="ti ti-eye"></i>
      <div>
        <strong>Read-only sample workspace</strong>
        <small>Create your own workspace to save leads, quotes, jobs, files, forms, billing, or team changes.</small>
      </div>
      <button class="btn" type="button" data-action="open-auth-modal" data-auth-mode="register">Create workspace</button>
    </div>
  `;
}

function renderDeck(route) {
  const companyId = activeCompanyId();
  const session = activeSession();
  const modulesById = new Map(MODULE_REGISTRY.map((module) => [module.id, module]));
  const showWorkspaceSwitcherCue = allowedCompanies().length > 1;
  return `
    <div class="deck-brand">
      <a class="logo" href="${appHref(companyPath('home', {}, companyId))}" data-router aria-label="Quest HQ home">
        ${svgIcon('q-logo', 'brand-symbol')}
      </a>
      <span><strong>Quest HQ</strong><small>Command Center</small></span>
      <button class="deck-toggle" type="button" data-action="toggle-sidebar" aria-label="${state.sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}" aria-expanded="${state.sidebarCollapsed ? 'false' : 'true'}">
        <i class="ti ${state.sidebarCollapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-left-collapse'}"></i>
      </button>
    </div>
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${h(companyColor(companyId))}">${svgIcon('q-company')}</span>
      <div>
        <strong>${h(companyName(companyId))}</strong>
        <small>${h(roleForCompany(companyId))} workspace</small>
      </div>
    </div>
    <div class="deck-scroll">
      ${NAV_GROUPS.map((group) => {
        const items = group.ids
          .map((id) => modulesById.get(id))
          .filter((module) => module && canViewModule(module, companyId))
          .map((module) => {
            if (module.status === 'planned') return plannedNavItem(module.symbol, module.label);
            if (module.id === 'jobs' || module.id === 'contacts' || module.id === 'deals') return navItemPipeline(route, module, companyId);
            return navItem(route, companyPath(module.id, {}, companyId), module.symbol, module.label, moduleBadgeCount(module.id, companyId));
          });
        return navGroup(group.label, items);
      }).join('')}
    </div>
    <div class="deck-footer">
      <a class="deck-company-switch" href="${appHref(companyPath('settings', { tab: 'company' }, companyId))}" data-router>
        ${svgIcon('q-company')}
        <span><strong>${h(companyName(companyId))}</strong><small>Workspace</small></span>
        ${showWorkspaceSwitcherCue ? '<i class="ti ti-chevron-down"></i>' : ''}
      </a>
      <button class="deck-user-card" type="button" data-action="open-profile">
        ${renderAvatar(session.profile, 'avatar small')}
        <span><strong>${h(session.profile.full_name)}</strong><small>${h(roleForCompany(companyId))}</small></span>
        <i class="ti ti-dots-vertical"></i>
      </button>
    </div>
  `;
}

function navGroup(label, items) {
  if (!items.length) return '';
  const collapsed = state.collapsedNavGroups.has(label);
  return `
    <section class="side-group ${collapsed ? 'collapsed' : ''}">
      <button class="side-label" type="button" data-action="toggle-nav-group" data-group="${h(label)}" aria-expanded="${collapsed ? 'false' : 'true'}" title="${collapsed ? 'Expand' : 'Collapse'} ${h(label)}">
        <span>${h(label)}</span>
        <i class="ti ti-chevron-down side-label-chevron" aria-hidden="true"></i>
      </button>
      <div class="side-items">${items.join('')}</div>
    </section>
  `;
}

function navItem(route, path, symbol, label, count = '') {
  const active = isActiveNav(route, path);
  return `
    <a class="side-item ${active ? 'active' : ''}" href="${appHref(path)}" data-router title="${h(label)}" aria-label="${h(label)}">
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      ${count !== '' ? `<b>${h(String(count))}</b>` : ''}
    </a>
  `;
}

function pipelineStageCounts(kind, companyId = activeCompanyId()) {
  const rows = kind === 'contacts' ? companyContacts(companyId) : kind === 'deals' ? companyDeals(companyId) : companyJobs(companyId);
  const counts = {};
  rows.forEach((row) => { counts[row.stage] = (counts[row.stage] || 0) + 1; });
  return counts;
}

function navItemPipeline(route, module, companyId) {
  const kind = module.id;
  const path = companyPath(kind, {}, companyId);
  const active = isActiveNav(route, path);
  const expanded = state.expandedNav.has(kind);
  const count = moduleBadgeCount(kind, companyId);
  const onSection = route.name === 'company' && route.section === kind;
  const filter = kind === 'contacts' ? state.contactStageFilter : kind === 'deals' ? state.stageFilterDeals : state.stageFilter;
  const stages = pipelineStages(kind);
  const counts = pipelineStageCounts(kind, companyId);
  return `
    <div class="side-pipe ${expanded ? 'expanded' : ''}">
      <div class="side-pipe-head">
        <a class="side-item ${active ? 'active' : ''}" href="${appHref(path)}" data-router data-action="pipeline-open" data-module="${kind}" title="${h(module.label)}" aria-label="${h(module.label)}">
          ${svgIcon(module.symbol)}
          <span>${h(module.label)}</span>
          ${count !== '' ? `<b>${h(String(count))}</b>` : ''}
        </a>
        <button class="side-pipe-toggle" type="button" data-action="toggle-nav-expand" data-module="${kind}" aria-expanded="${expanded ? 'true' : 'false'}" aria-label="${expanded ? 'Collapse' : 'Expand'} ${h(module.label)} stages">
          <i class="ti ti-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
      ${expanded ? `
        <div class="side-sub">
          <button class="side-sub-link ${onSection && filter === 'all' ? 'active' : ''}" type="button" data-action="pipeline-stage" data-module="${kind}" data-stage="all">
            <span class="side-sub-dot all"></span>
            <span class="side-sub-name">All ${h(module.label.toLowerCase())}</span>
            <span class="side-sub-ct">${h(String(count || 0))}</span>
          </button>
          ${stages.map((stage) => `
            <button class="side-sub-link ${onSection && filter === stage.name ? 'active' : ''}" type="button" data-action="pipeline-stage" data-module="${kind}" data-stage="${h(stage.name)}">
              <span class="side-sub-dot" style="background:${h(stage.color)}"></span>
              <span class="side-sub-name">${h(stage.name)}</span>
              <span class="side-sub-ct">${h(String(counts[stage.name] || 0))}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function plannedNavItem(symbol, label) {
  return `
    <button class="side-item planned" type="button" disabled aria-disabled="true" title="${h(label)}" aria-label="${h(label)}">
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      <b>Planned</b>
    </button>
  `;
}

function pluginById(pluginId) {
  return WORKSPACE_PLUGIN_REGISTRY.find((plugin) => plugin.id === pluginId) || null;
}

function availableWorkspacePlugins() {
  return WORKSPACE_PLUGIN_REGISTRY.filter((plugin) => !plugin.comingSoon);
}

function demoCompanyPluginRows() {
  return companiesFallback.flatMap((company) => availableWorkspacePlugins().map((plugin) => normalizeCompanyPlugin({
    company_id: company.id,
    plugin_id: plugin.id,
    status: 'installed',
  })));
}

function pluginsForModule(moduleId) {
  return WORKSPACE_PLUGIN_REGISTRY.filter((plugin) => plugin.module_ids.includes(moduleId));
}

function pluginForModule(moduleId) {
  return pluginsForModule(moduleId)[0] || null;
}

function moduleById(moduleId) {
  return MODULE_REGISTRY.find((module) => module.id === moduleId) || null;
}

function companyPluginRows(companyId = activeCompanyId()) {
  const canonical = canonicalCompanyId(companyId);
  return state.companyPlugins.filter((row) => row.company_id === canonical);
}

function companyPluginStatus(companyId, pluginId) {
  const plugin = pluginById(pluginId);
  if (!plugin) return 'available';
  if (plugin.comingSoon) return 'coming_soon';
  if (state.session?.auth !== 'supabase' || isReadOnlyDemo() || state.pluginLoadFailed) return 'installed';
  const row = companyPluginRows(companyId).find((item) => item.plugin_id === pluginId);
  return row?.status || 'available';
}

function isPluginInstalled(companyId, pluginId) {
  return companyPluginStatus(companyId, pluginId) === 'installed';
}

function isModuleInstalled(moduleId, companyId = activeCompanyId()) {
  if (CORE_MODULE_IDS.has(moduleId)) return true;
  const plugins = pluginsForModule(moduleId);
  if (!plugins.length) return true;
  return plugins.some((plugin) => isPluginInstalled(companyId, plugin.id));
}

function installedLiveModules(companyId) {
  return MODULE_REGISTRY.filter((module) => module.status === 'live' && isModuleInstalled(module.id, companyId));
}

function installedModulesForMobileWork(companyId) {
  return ['jobs', 'tasks', 'underwriter', 'calendar', 'crm', 'contacts', 'deals', 'finance', 'forms', 'users', 'time', 'approvals', 'clock', 'team-chart']
    .filter((moduleId) => isModuleInstalled(moduleId, companyId));
}

function permissionPluginIds(permission) {
  const clean = String(permission || '');
  if (clean.startsWith('crm.')) return ['crm', 'crm_2'];
  if (clean.startsWith('underwriter.')) return ['underwriter'];
  if (clean.startsWith('files.')) return ['files'];
  if (clean.startsWith('forms.')) return ['forms'];
  if (clean.startsWith('finance.')) return ['finance'];
  if (clean.startsWith('messages.')) return ['messages'];
  if (clean.startsWith('calendar.')) return ['calendar'];
  if (['time.track', 'clock.manage'].includes(clean)) return ['time_clock'];
  if (clean.startsWith('approvals.')) return ['approvals'];
  if (clean === 'team.view') return ['reporting'];
  return [];
}

function permissionPluginId(permission) {
  return permissionPluginIds(permission)[0] || '';
}

function permissionAvailableForCompany(permission, companyId = activeCompanyId()) {
  const pluginIds = permissionPluginIds(permission);
  return !pluginIds.length || pluginIds.some((pluginId) => isPluginInstalled(companyId, pluginId));
}

function canViewModule(module, companyId = activeCompanyId()) {
  if (module.id === 'home') return true;
  if (module.status === 'planned') return false;
  if (!isModuleInstalled(module.id, companyId)) return false;
  if (!subscriptionAllowsCompany(companyId) && !['settings', 'users'].includes(module.id)) return false;
  return can(module.permission || `${module.id}.view`, companyId);
}

function moduleBadgeCount(moduleId, companyId = activeCompanyId()) {
  if (moduleId === 'jobs') return companyJobs(companyId).length;
  if (moduleId === 'tasks') return companyTasks(companyId).length;
  if (moduleId === 'files') return companyFiles(companyId).length;
  if (moduleId === 'forms') return companyForms(companyId).length;
  if (moduleId === 'crm') return companyAccounts(companyId).length;
  if (moduleId === 'contacts') return companyContacts(companyId).length;
  if (moduleId === 'deals') return companyDeals(companyId).filter((deal) => deal.status === 'open').length;
  if (moduleId === 'underwriter') return companyContacts(companyId).filter((contact) => underwriterStageForContact(contact).key === 'underwriting').length;
  if (moduleId === 'finance') return companyFinanceInvoices(companyId).length;
  if (moduleId === 'users') return companyAccessUsers(companyId).filter((user) => user.status === 'active').length;
  if (moduleId === 'messages') {
    const unread = companyMessageUnreadCount(companyId);
    return unread || companyMessageConversations(companyId).length;
  }
  if (moduleId === 'calendar') return calendarUpcomingItems(companyId).length;
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
  if (route.section === 'home') return renderCompanyHomePage(companyId);
  if (moduleMeta?.status !== 'planned') {
    if (!subscriptionAllowsCompany(companyId) && route.section !== 'settings') return renderSubscriptionBlockedPage(companyId);
    if (!isModuleInstalled(route.section, companyId)) return renderPluginBlockedPage(companyId, moduleMeta);
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
  if (route.section === 'contacts') return renderContactsPage(route, companyId);
  if (route.section === 'deals') return renderDealsPage(route, companyId);
  if (route.section === 'underwriter') return renderUnderwriterPage(route, companyId);
  if (route.section === 'finance') return renderFinancePage(route, companyId);
  if (route.section === 'messages') return renderMessagesPage(route, companyId);
  if (route.section === 'team-chart') return renderTeamChartPage(companyId);
  if (route.section === 'time' || route.section === 'calendar' || route.section === 'approvals' || route.section === 'clock') return renderOperationsPage(route, companyId);
  return renderPlannedPage(route.section);
}

function renderSubscriptionBlockedPage(companyId) {
  const pendingReview = subscriptionNeedsReview(companyId);
  return `
    ${workspaceHeader(pendingReview ? 'Workspace awaiting approval' : 'Subscription required', pendingReview ? 'Your company workspace is created. Quest needs to approve billing/access before live company data opens.' : 'This company workspace needs an active subscription before paid modules can open.', `
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${appHref(companyPath('settings', { tab: 'billing' }, companyId))}" data-router><i class="ti ti-credit-card"></i>${pendingReview ? 'Review status' : 'Billing'}</a>
    `)}
    <section class="panel">
      ${contractRows([
        ['Company', companyName(companyId)],
        ['Subscription', subscriptionLabel(companyId)],
        ['Allowed area', 'Settings, profile, and sign out remain available'],
        ['Next step', pendingReview ? 'Quest approval / billing activation' : 'Restore billing access'],
      ])}
    </section>
  `;
}

function renderPluginBlockedPage(companyId, moduleMeta) {
  const plugins = pluginsForModule(moduleMeta?.id || '');
  const plugin = plugins[0] || null;
  const canManagePlugins = can('plugins.manage', companyId);
  const installablePlugins = plugins.filter((item) => !item.comingSoon);
  return `
    ${workspaceHeader(`${plugin?.label || moduleMeta?.label || 'Plugin'} not installed`, 'This workspace has not enabled the plugin required for this module.', `
      <a class="btn" href="${appHref(companyPath('settings', { tab: 'plugins' }, companyId))}" data-router><i class="ti ti-plug"></i>${canManagePlugins ? 'Manage plugins' : 'View plugins'}</a>
      ${canManagePlugins ? installablePlugins.map((item) => `<button class="btn btn-primary" type="button" data-action="set-company-plugin" data-plugin-id="${h(item.id)}" data-status="installed"><i class="ti ti-download"></i>Install ${h(item.label)}</button>`).join('') : ''}
    `)}
    <section class="panel">
      ${contractRows([
        ['Company', companyName(companyId)],
        ['Requested module', moduleMeta?.label || moduleMeta?.id || 'Unknown'],
        ['Required plugin', plugins.length ? plugins.map((item) => item.label).join(' or ') : 'Unknown'],
        ['Current status', plugins.length ? plugins.map((item) => `${item.label}: ${titleCase(companyPluginStatus(companyId, item.id).replace('_', ' '))}`).join(' / ') : 'Unavailable'],
        ['Data policy', 'Existing plugin data is preserved while the plugin is disabled'],
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
  return renderCompanyHomePage(companyId);
}

function renderCompanyHomePage(companyId) {
  const messagesModule = moduleById('messages');
  const filesModule = moduleById('files');
  const reportingModule = moduleById('analytics');
  const showMessages = messagesModule && canViewModule(messagesModule, companyId);
  const showFiles = filesModule && canViewModule(filesModule, companyId);
  const showReporting = reportingModule && canViewModule(reportingModule, companyId);
  const jobs = companyJobs(companyId);
  const tasks = companyTasks(companyId);
  const openTasks = tasks.filter((task) => task.status !== 'done');
  const overdueTasks = openTasks.filter((task) => task.due && new Date(task.due) < startOfToday());
  const unreadMessages = showMessages ? companyMessageUnreadCount(companyId) : 0;
  const files = showFiles ? companyFiles(companyId) : [];
  const forms = companyForms(companyId);
  const users = companyAccessUsers(companyId);
  const activeUsers = users.filter((user) => user.status === 'active');
  const pendingUsers = users.filter((user) => user.status === 'pending');
  const recentActivity = homeRecentActivity(companyId, companyNotifications(companyId).slice(0, 4));
  const healthItems = homeHealthItems(companyId);
  const customRoles = companyRoles(companyId).filter((role) => !role.is_system).length;
  const activePermissions = new Set(companyRoles(companyId).flatMap((role) => role.permissions || [])).size;
  const accessGoverned = can('users.view', companyId) || can('settings.view', companyId);
  return `
    <section class="home-cockpit">
      <div class="home-hero">
        <div>
          <h1>Good ${h(dayPart())}, <span>${h(firstName(activeSession().profile.full_name) || 'Quest Admin')}</span></h1>
          <p>Here is what is happening across your workspace.</p>
        </div>
        <div class="home-hero-actions">
          ${renderCompanySwitch(companyId, 'home-company-switch')}
          <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
            <i class="ti ti-bell"></i>
            ${unreadMessages ? `<b>${h(String(Math.min(unreadMessages, 99)))}</b>` : ''}
          </button>
          ${renderAvatar(activeSession().profile, 'avatar')}
        </div>
      </div>
      <section class="home-metric-grid">
        ${homeMetricCard('q-symbol-approvals', 'Company access', subscriptionLabel(companyId), subscriptionNeedsReview(companyId) ? 'Approval required before full access.' : 'Workspace modules are available.', companyPath('settings', { tab: 'billing' }, companyId), 'View status', subscriptionAllowsCompany(companyId) ? 'good' : 'warning')}
        ${homeMetricCard('q-symbol-users', 'Active users', activeUsers.length, `${activeUsers.length} active / ${pendingUsers.length} pending`, companyPath('users', {}, companyId), 'Manage users')}
        ${homeMetricCard('q-symbol-tasks', 'Open tasks', openTasks.length, `${overdueTasks.length} overdue`, companyPath('tasks', {}, companyId), 'View tasks', overdueTasks.length ? 'warning' : '')}
        ${showMessages ? homeMetricCard('q-symbol-messages', 'Unread messages', unreadMessages, 'Across team chats', companyPath('messages', {}, companyId), 'Open inbox') : ''}
        ${homeMetricCard('q-symbol-settings', 'Workspace health', subscriptionAllowsCompany(companyId) ? 'Good' : 'Pending', subscriptionAllowsCompany(companyId) ? 'All core systems operational' : 'Approval or billing still needs attention.', companyPath('settings', {}, companyId), 'See details', subscriptionAllowsCompany(companyId) ? 'good' : 'warning')}
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
            ${showReporting ? `<a class="btn" href="${appHref(companyPath('analytics', {}, companyId))}" data-router>All activity</a>` : ''}
          </div>
          <div class="home-activity-list">
            ${recentActivity.map(renderHomeActivity).join('') || emptyState('No recent activity yet.')}
          </div>
        </article>
        ${showMessages ? `<article class="panel home-message-panel">
          <div class="section-head">
            <div><h2>Unread messages</h2><p>Team conversations needing attention.</p></div>
            <a href="${appHref(companyPath('messages', {}, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-message-list">
            ${homeUnreadMessages(companyId).map(renderHomeMessage).join('') || emptyState('No unread messages.')}
          </div>
        </article>` : ''}
        <article class="panel home-next-panel">
          <div class="section-head">
            <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
            <a href="${appHref(companyPath('tasks', {}, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-next-list">
            ${homeNextTasks(companyId).map(renderHomeNextTask).join('') || emptyState('No open tasks.')}
          </div>
        </article>
        <article class="panel home-team-panel">
          <div class="section-head">
            <div><h2>Team access</h2><p>Active people in this workspace.</p></div>
            <a href="${appHref(companyPath('users', {}, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-team-list">
            ${activeUsers.slice(0, 4).map(renderHomeTeamUser).join('') || emptyState('No active users yet.')}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Workspace health</h2><p>Access, billing, and operating signals.</p></div></div>
          <div class="home-health-body">
            <div class="home-orbit" aria-hidden="true"><span>${svgIcon('q-logo', 'brand-symbol')}</span></div>
            <div class="home-health-list">
              ${healthItems.map((item) => `<div class="${h(item.state)}"><i class="ti ${h(item.icon)}"></i><span>${h(item.label)}</span></div>`).join('')}
            </div>
          </div>
        </article>
        <article class="panel home-access-panel">
          <div class="section-head">
            <div><h2>Access control</h2><p>Roles, permissions, protected data, and audit trail.</p></div>
            <a href="${appHref(companyPath('settings', { tab: 'roles' }, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-access-grid">
            <div><i class="ti ti-user-shield"></i><strong>${h(customRoles || companyRoles(companyId).length)}</strong><span>Custom roles</span></div>
            <div><i class="ti ti-shield-lock"></i><strong>${h(activePermissions || PERMISSION_KEYS.length)}</strong><span>Active rules</span></div>
            <div><i class="ti ti-lock"></i><strong>${h(accessGoverned ? '100%' : 'Basic')}</strong><span>Protected data</span></div>
            <div><i class="ti ti-clipboard-check"></i><strong>${h(companyAuditEvents(companyId).length)}</strong><span>Audit events</span></div>
          </div>
        </article>
      </section>
      <section class="home-shortcuts panel">
        ${homeShortcut('files', 'q-symbol-files', 'Files', files.length, companyId)}
        ${homeShortcut('crm', 'q-symbol-crm', 'CRM', crmAccounts(companyId).length, companyId)}
        ${homeShortcut('finance', 'q-symbol-finance', 'Finance', companyFinanceInvoices(companyId).length, companyId)}
        ${homeShortcut('calendar', 'q-symbol-calendar', 'Calendar', calendarUpcomingItems(companyId).length, companyId)}
        ${homeShortcut('users', 'q-symbol-users', 'Users', activeUsers.length, companyId)}
        ${homeShortcut('forms', 'q-symbol-forms', 'Forms', forms.length, companyId)}
        ${homeShortcut('analytics', 'q-symbol-analytics', 'Reports', jobs.length + tasks.length, companyId)}
      </section>
    </section>
  `;
}

function homeMetricCard(symbol, label, value, detail, path, action, tone = '') {
  return `
    <article class="home-metric-card ${h(tone)}">
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      <strong>${h(value)}</strong>
      <small>${h(detail)}</small>
      <a href="${appHref(path)}" data-router>${h(action)} <i class="ti ti-arrow-right"></i></a>
    </article>
  `;
}

function homeShortcut(section, symbol, label, count, companyId) {
  const module = MODULE_REGISTRY.find((item) => item.id === section);
  if (module && !canViewModule(module, companyId)) return '';
  return `
    <a class="home-shortcut" href="${appHref(companyPath(section, {}, companyId))}" data-router>
      ${svgIcon(symbol)}
      <span>${h(label)}</span>
      ${count !== '' && count !== undefined ? `<b>${h(String(count))}</b>` : ''}
    </a>
  `;
}

function homeRecentActivity(companyId, notifications = []) {
  const notificationItems = notifications.map((item) => ({
    icon: 'ti-bell',
    title: item.body || item.title,
    meta: notificationTypeLabel(item.type),
    time: item.created_at,
    href: item.href || companyPath('home', {}, companyId),
    avatar: activeSession().profile,
  }));
  const taskItems = companyTasks(companyId).slice(0, 3).map((task) => ({
    icon: 'ti-circle-check',
    title: `${task.title} was updated`,
    meta: 'Tasks',
    time: task.updated_at || task.due,
    href: companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, companyId),
    avatar: { full_name: memberName(task.assignee_id) },
  }));
  const fileItems = can('files.view', companyId) ? companyFiles(companyId).slice(0, 2).map((file) => ({
    icon: 'ti-folder',
    title: `${file.name} was uploaded`,
    meta: 'Files',
    time: file.updated_at || file.created_at,
    href: companyPath('files', file.job_id ? { job_id: file.job_id } : {}, companyId),
    avatar: { full_name: memberName(file.owner_id || file.created_by) },
  })) : [];
  return notificationItems.concat(taskItems, fileItems)
    .sort((a, b) => Date.parse(b.time || 0) - Date.parse(a.time || 0))
    .slice(0, 5);
}

function renderHomeActivity(item) {
  return `
    <a class="home-activity-row" href="${appHref(item.href)}" data-router>
      <span class="home-activity-icon"><i class="ti ${h(item.icon)}"></i></span>
      <span><strong>${h(item.title)}</strong><small>${h(item.meta)}</small></span>
      ${renderAvatar(item.avatar || {}, 'avatar small')}
      <em>${h(timeAgo(item.time))}</em>
    </a>
  `;
}

function homeUnreadMessages(companyId) {
  if (!can('messages.view', companyId)) return [];
  return companyMessageConversations(companyId)
    .filter((conversation) => conversationUnreadCount(conversation.id) > 0)
    .slice(0, 4)
    .map((conversation) => {
      const latest = conversationMessages(conversation.id).slice(-1)[0];
      return {
        id: conversation.id,
        title: latest?.body || conversation.title,
        meta: `${conversation.title} - ${timeAgo(latest?.created_at || conversation.updated_at || conversation.created_at)}`,
        href: companyPath('messages', { conversation: conversation.id }, companyId),
        count: conversationUnreadCount(conversation.id),
        avatar: { full_name: latest ? memberName(latest.sender_profile_id) : conversation.title },
      };
    });
}

function renderHomeMessage(item) {
  return `
    <a class="home-message-row" href="${appHref(item.href)}" data-router>
      ${renderAvatar(item.avatar || {}, 'avatar small')}
      <span><strong>${h(item.title)}</strong><small>${h(item.meta)}</small></span>
      <b>${h(item.count)}</b>
    </a>
  `;
}

function homeNextTasks(companyId) {
  return companyTasks(companyId)
    .filter((task) => task.status !== 'done')
    .sort(taskSortForOperations)
    .slice(0, 4);
}

function renderHomeNextTask(task) {
  return `
    <a class="home-next-row" href="${appHref(companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, task.company_id))}" data-router>
      <i class="ti ti-circle"></i>
      <span><strong>${h(task.title)}</strong><small>${h(jobById(task.project_id)?.name || taskTypeLabel(task.type))}</small></span>
      ${taskPriorityPill(task.priority)}
      <em>${h(task.due ? formatDate(task.due) : 'Open')}</em>
    </a>
  `;
}

function renderHomeTeamUser(user) {
  return `
    <a class="home-team-row" href="${appHref(companyPath('users', {}, activeCompanyId()))}" data-router>
      ${renderAvatar({ full_name: user.name, email: user.email, avatar_url: user.avatar_url }, 'avatar small')}
      <span><strong>${h(user.name)}</strong><small>${h(user.email || user.role_label)}</small></span>
      <b>${h(user.role_label)}</b>
    </a>
  `;
}

function homeHealthItems(companyId) {
  return [
    { label: 'Company created', icon: 'ti-circle-check', state: 'good' },
    { label: subscriptionAllowsCompany(companyId) ? 'Access approved' : 'Pending approval', icon: subscriptionAllowsCompany(companyId) ? 'ti-circle-check' : 'ti-clock', state: subscriptionAllowsCompany(companyId) ? 'good' : 'warning' },
    { label: 'Billing connected', icon: 'ti-link', state: subscriptionAllowsCompany(companyId) ? 'good' : 'muted' },
    { label: subscriptionAllowsCompany(companyId) ? 'Payment active' : 'Payment not active', icon: 'ti-credit-card', state: subscriptionAllowsCompany(companyId) ? 'good' : 'muted' },
    { label: 'Full access enabled', icon: 'ti-shield-check', state: subscriptionAllowsCompany(companyId) ? 'good' : 'muted' },
  ];
}

function dayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function firstName(value) {
  return String(value || '').trim().split(/\s+/)[0] || '';
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

const CRM2_UNDERWRITER_STAGES = [
  { key: 'prospect', name: 'Prospect', color: '#9AA0A8' },
  { key: 'lead', name: 'Lead', color: '#378ADD' },
  { key: 'nurturing', name: 'Nurturing', color: '#2F9E8F' },
  { key: 'underwriting', name: 'Underwriting', color: '#BA7517' },
  { key: 'estimate', name: 'Estimate Sent', color: '#378ADD' },
  { key: 'negotiating', name: 'Negotiating', color: '#BA7517' },
  { key: 'won', name: 'Won', color: '#639922' },
];

const CRM2_UNDERWRITER_GUIDANCE = {
  prospect: { title: 'Work the prospect.', lines: ['Confirm source and best contact method.', 'Decide if there is a real project.', 'Move them into a real conversation.'] },
  lead: { title: 'Qualify the lead.', lines: ['Confirm the decision maker.', 'Capture roof age, visible damage, and timeline.', 'Separate retail pay from insurance work.'] },
  nurturing: { title: 'Keep it warm.', lines: ['Set a follow-up cadence.', 'Send value before they go cold.', 'Capture the next decision needed.'] },
  underwriting: { title: 'Scope it and price it.', lines: ['Confirm takeoff and measurements.', 'Attach the carrier scope when insurance is involved.', 'Confirm material selections and margin target.'] },
  estimate: { title: 'Present the estimate.', lines: ['Confirm proposal delivery.', 'Walk through Standard versus Recommended.', 'Schedule the next follow-up.'] },
  negotiating: { title: 'Close the deal.', lines: ['Resolve open questions.', 'Confirm all decision makers.', 'Move toward signature and deposit.'] },
  won: { title: 'Won - convert to a job.', lines: ['Schedule production.', 'Order materials.', 'Confirm scope before handoff.'] },
};

function renderUnderwriterPage(route, companyId) {
  const requestedStage = route.params.get('stage') || 'all';
  const stageKeys = new Set(CRM2_UNDERWRITER_STAGES.map((stage) => stage.key));
  const activeStage = stageKeys.has(requestedStage) ? requestedStage : 'all';
  const contacts = companyContacts(companyId)
    .map((contact) => ({ ...contact, underwriter_stage: underwriterStageForContact(contact) }))
    .sort((a, b) => CRM2_UNDERWRITER_STAGES.findIndex((stage) => stage.key === a.underwriter_stage.key) - CRM2_UNDERWRITER_STAGES.findIndex((stage) => stage.key === b.underwriter_stage.key));
  const visible = activeStage === 'all' ? contacts : contacts.filter((contact) => contact.underwriter_stage.key === activeStage);
  const underwriting = contacts.filter((contact) => contact.underwriter_stage.key === 'underwriting');
  const estimates = contacts.filter((contact) => ['estimate', 'negotiating'].includes(contact.underwriter_stage.key));
  const canManageUnderwriter = can('underwriter.manage', companyId);
  const guide = activeStage === 'all' ? CRM2_UNDERWRITER_GUIDANCE.underwriting : CRM2_UNDERWRITER_GUIDANCE[activeStage];
  return `
    <section class="tool-page underwriter-page">
      ${workspaceHeader('Underwriter', 'CRM 2 workspace for qualification, scope, pricing, and quote handoff readiness.', `
        ${can('crm.view', companyId) ? `<a class="btn" href="${appHref(companyPath('contacts', {}, companyId))}" data-router><i class="ti ti-id-badge-2"></i>Open contacts</a>` : ''}
        ${canManageUnderwriter && can('crm.view', companyId) ? `<button class="btn btn-primary" type="button" data-action="open-contact-form" data-mode="new"><i class="ti ti-plus"></i>Add contact</button>` : ''}
      `)}
      <section class="metric-grid">
        ${metricCard('Underwriting', underwriting.length)}
        ${metricCard('Estimate queue', estimates.length)}
        ${metricCard('Pipeline value', money(sum(visible, 'value')))}
        ${metricCard('CRM 2 stage', activeStage === 'all' ? 'All' : underwriterStageByKey(activeStage).name)}
      </section>
      <section class="pipe-toolbar">
        <div class="pipe-chips" role="group" aria-label="CRM 2 underwriter stage">
          <a class="pipe-chip ${activeStage === 'all' ? 'on' : ''}" href="${appHref(companyPath('underwriter', {}, companyId))}" data-router>All<b>${h(String(contacts.length))}</b></a>
          ${CRM2_UNDERWRITER_STAGES.map((stage) => {
            const count = contacts.filter((contact) => contact.underwriter_stage.key === stage.key).length;
            return `<a class="pipe-chip ${activeStage === stage.key ? 'on' : ''}" href="${appHref(companyPath('underwriter', { stage: stage.key }, companyId))}" data-router>${pipelineDot(stage.color)}${h(stage.name)}<b>${h(String(count))}</b></a>`;
          }).join('')}
        </div>
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head"><div><h2>Underwriter queue</h2><p>${visible.length} contact${visible.length === 1 ? '' : 's'} in this CRM 2 view.</p></div></div>
          <div class="data-table underwriter-table">
            <div class="table-head"><span>Contact</span><span>Stage</span><span>Owner</span><span>Pay type</span><span>Value</span></div>
            ${visible.map(renderUnderwriterQueueRow).join('') || emptyState('No contacts match this underwriter stage.')}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Guidance</h2><p>${h(activeStage === 'all' ? 'Default underwriting guidance.' : underwriterStageByKey(activeStage).name)}</p></div></div>
          <div class="home-health-list">
            <div class="good"><i class="ti ti-clipboard-search"></i><span>${h(guide.title)}</span></div>
            ${guide.lines.map((line) => `<div><i class="ti ti-point"></i><span>${h(line)}</span></div>`).join('')}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderUnderwriterQueueRow(lead) {
  return `
    <button class="table-row" type="button" data-action="open-contact" data-contact-id="${h(lead.id)}">
      <span class="cell-lead">${pipelineDot(lead.underwriter_stage.color)}<span><strong>${h(lead.name)}</strong><small>${h(lead.location || lead.phone || lead.email || 'No details')}</small></span></span>
      <span>${underwriterStageTag(lead.underwriter_stage)}</span>
      <span>${h(lead.owner_name || 'Unassigned')}</span>
      <span>${h(lead.pay_type || 'Retail')}</span>
      <span>${lead.value ? money(lead.value) : '<span class="muted-dash">-</span>'}</span>
    </button>
  `;
}

function underwriterStageByKey(key) {
  return CRM2_UNDERWRITER_STAGES.find((stage) => stage.key === key) || CRM2_UNDERWRITER_STAGES[1];
}

function underwriterStageTag(stage) {
  return `<span class="stage-tag">${pipelineDot(stage.color)}${h(stage.name)}</span>`;
}

function underwriterStageForContact(contact) {
  const stage = String(contact.stage || '').toLowerCase();
  if (stage.includes('prospect')) return underwriterStageByKey('prospect');
  if (stage.includes('nurtur')) return underwriterStageByKey('nurturing');
  if (stage.includes('underwrit')) return underwriterStageByKey('underwriting');
  if (stage.includes('estimate') || stage.includes('proposal')) return underwriterStageByKey('estimate');
  if (stage.includes('negotiat')) return underwriterStageByKey('negotiating');
  if (stage.includes('won')) return underwriterStageByKey('won');
  return underwriterStageByKey('lead');
}

// ---- Pipeline (stages) shared building blocks -----------------------------
function pipelineDot(color) {
  return `<span class="pipe-dot" style="background:${h(color || '#9AA0A8')}"></span>`;
}

function stageTagPipe(kind, name) {
  if (!name) return '<span class="muted-dash">—</span>';
  return `<span class="stage-tag">${pipelineDot(pipelineStageColor(kind, name))}${h(name)}</span>`;
}

function pipelineToolbar(kind, companyId) {
  const stages = pipelineStages(kind);
  const counts = pipelineStageCounts(kind, companyId);
  const total = kind === 'contacts' ? companyContacts(companyId).length : kind === 'deals' ? companyDeals(companyId).length : companyJobs(companyId).length;
  const filter = kind === 'contacts' ? state.contactStageFilter : kind === 'deals' ? state.stageFilterDeals : state.stageFilter;
  const view = kind === 'contacts' ? state.contactBoardView : kind === 'deals' ? state.dealBoardView : state.jobBoardView;
  return `
    <section class="pipe-toolbar">
      <div class="pipe-chips" role="group" aria-label="Filter by stage">
        <button class="pipe-chip ${filter === 'all' ? 'on' : ''}" type="button" data-action="pipeline-stage" data-module="${kind}" data-stage="all">All<b>${h(String(total))}</b></button>
        ${stages.map((stage) => `
          <button class="pipe-chip ${filter === stage.name ? 'on' : ''}" type="button" data-action="pipeline-stage" data-module="${kind}" data-stage="${h(stage.name)}">
            ${pipelineDot(stage.color)}${h(stage.name)}<b>${h(String(counts[stage.name] || 0))}</b>
          </button>
        `).join('')}
      </div>
      <div class="segmented" role="group" aria-label="View">
        <button class="${view === 'table' ? 'active' : ''}" type="button" data-action="set-pipeline-view" data-module="${kind}" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${view === 'board' ? 'active' : ''}" type="button" data-action="set-pipeline-view" data-module="${kind}" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `;
}

// ---- Contacts (top-of-funnel pipeline) ------------------------------------
function renderContactsPage(route, companyId) {
  const contactId = route.params.get('contact_id');
  if (contactId) {
    const contact = contactById(contactId);
    if (contact && contact.company_id === companyId) return renderContactRecord(companyId, contact);
  }
  const stageParam = route.params.get('stage');
  if (stageParam) state.contactStageFilter = contactStageNames().includes(stageParam) ? stageParam : 'all';
  return `
    ${workspaceHeader('Contacts', 'Top-of-funnel contacts before quote handoff.', `
      <button class="btn" type="button" data-action="open-stage-manager" data-module="contacts"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-contact-form" data-mode="new"><i class="ti ti-plus"></i>Add contact</button>
    `)}
    ${pipelineToolbar('contacts', companyId)}
    ${state.contactBoardView === 'board' ? renderContactBoard(companyId) : renderContactTable(companyId)}
  `;
}

function renderContactTable(companyId) {
  const rows = filteredContacts(companyId);
  return `
    <section class="panel">
      <div class="section-head"><div><h2>Contacts</h2><p>${rows.length} visible contact${rows.length === 1 ? '' : 's'}</p></div></div>
      <div class="data-table contacts-table">
        <div class="table-head"><span>Client</span><span>Phone</span><span>Email</span><span>Location</span><span>Stage</span><span>Value</span></div>
        ${rows.map((contact) => `
          <button class="table-row ${contact.id === state.selectedContactId ? 'active' : ''}" type="button" data-action="open-contact" data-contact-id="${h(contact.id)}">
            <span class="cell-lead">${pipelineDot(contactStageColor(contact.stage))}<span><strong>${h(contact.name)}</strong><small>${h(contact.owner_name || 'Unassigned')}</small></span></span>
            <span>${contact.phone ? h(contact.phone) : '<span class="muted-dash">—</span>'}</span>
            <span>${contact.email ? h(contact.email) : '<span class="muted-dash">—</span>'}</span>
            <span>${contact.location ? h(contact.location) : '<span class="muted-dash">—</span>'}</span>
            <span>${stageTagPipe('contacts', contact.stage)}</span>
            <span>${contact.value ? money(contact.value) : '<span class="muted-dash">—</span>'}</span>
          </button>
        `).join('') || emptyState('No contacts in this view yet.')}
      </div>
    </section>
  `;
}

function renderContactBoard(companyId) {
  const rows = filteredContacts(companyId, true);
  const filter = state.contactStageFilter;
  const lanes = filter === 'all' ? contactStages() : contactStages().filter((stage) => stage.name === filter);
  return `
    <section class="pipe-board">
      ${lanes.map((stage) => {
        const cards = rows.filter((contact) => contact.stage === stage.name);
        return `
          <article class="pipe-lane">
            <header class="pipe-lane-head">${pipelineDot(stage.color)}<span>${h(stage.name)}</span><b>${cards.length}</b></header>
            <div class="pipe-lane-body">
              ${cards.map((contact) => contactCard(contact)).join('') || '<div class="lane-empty">No contacts</div>'}
            </div>
          </article>
        `;
      }).join('')}
    </section>
  `;
}

function contactCard(contact) {
  return `
    <button class="pipe-card ${contact.id === state.selectedContactId ? 'active' : ''}" type="button" data-action="open-contact" data-contact-id="${h(contact.id)}">
      <strong>${h(contact.name)}</strong>
      <span>${h(contact.location || contact.phone || contact.email || 'No details')}</span>
      <em>${contact.value ? money(contact.value) : '—'}</em>
    </button>
  `;
}

function renderContactRecord(companyId, contact) {
  const stages = contactStages();
  const ci = stages.findIndex((s) => s.name === contact.stage);
  const g = guidanceForStage(contact.stage);
  const tempColor = contact.temperature === 'Hot' ? '#C2410C' : contact.temperature === 'Warm' ? '#B07A12' : '#2E72B8';
  const activeTab = state.contactActivityTab || 'Email';
  const tasks = tasksForContact(contact.id);
  const feed = activitiesFor('contact', contact.id);

  const ed = (key, opts = {}) => {
    const display = (contact[key] === '' || contact[key] == null) ? '—' : contact[key];
    const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : ''].filter(Boolean).join(' ');
    return `<span class="${cls}" data-contact-edit="${h(key)}" data-contact-id="${h(contact.id)}" title="Click to edit">${h(String(display))}</span>`;
  };
  const fieldRow = (label, content) => `<div class="sf-field"><div class="sf-field-label">${h(label)}<i class="ti ti-pencil sf-pencil"></i></div><div class="sf-field-value">${content}</div></div>`;

  const headerActions = [['Follow', 'ti-plus'], ['New Task', 'ti-checkbox'], ['Log a Call', 'ti-phone'], ['New Estimate', 'ti-calculator'], ['Edit', 'ti-pencil']];
  const quickTiles = [['Task', 'ti-checkbox'], ['Meeting', 'ti-calendar'], ['Estimate', 'ti-calculator'], ['Proposal', 'ti-file-text'], ['Note', 'ti-note'], ['Call Log', 'ti-phone']];
  const activityTabs = [['Email', 'ti-mail'], ['New Task', 'ti-checkbox'], ['New Event', 'ti-calendar'], ['Log a Call', 'ti-phone']];

  return `
    <div class="sf-record">
      <div class="sf-object-tabs">
        <a class="sf-object-tab" href="${appHref(companyPath('home', {}, companyId))}" data-router>Home</a>
        <a class="sf-object-tab" href="${appHref(companyPath('contacts', {}, companyId))}" data-router>All Contacts <span class="sf-tab-kind">| Contacts</span></a>
        <span class="sf-object-tab on">${h(contact.name)} <span class="sf-tab-kind">| Contact</span></span>
      </div>

      <div class="sf-record-head">
        <span class="sf-record-icon"><i class="ti ti-user"></i></span>
        <div><div class="sf-record-label">Contact</div><div class="sf-record-name">${h(contact.name)}</div></div>
        <div class="sf-actions">
          ${headerActions.map(([label, ico]) => label === 'Edit'
            ? `<button class="sf-btn" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${h(contact.id)}"><i class="ti ${ico}"></i>${label}</button>`
            : `<button class="sf-btn" type="button" data-action="contact-quick" data-kind="${h(label)}" data-contact-id="${h(contact.id)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}
        </div>
      </div>

      <div class="sf-path-wrap">
        <div class="sf-path-row">
          <div class="sf-stage-track">
            ${stages.map((s, i) => {
              const cls = i < ci ? 'done' : i === ci ? 'current' : 'future';
              return `<button class="sf-stage ${cls}" type="button" data-action="set-contact-stage" data-contact-id="${h(contact.id)}" data-stage="${h(s.name)}" title="Move to ${h(s.name)}">${i < ci ? '<i class="ti ti-check"></i>' : h(s.name)}</button>`;
            }).join('')}
          </div>
          <button class="sf-mark-btn" type="button" data-action="contact-mark-next" data-contact-id="${h(contact.id)}">Mark as Current Stage</button>
        </div>
        <div class="sf-guidance">
          <div class="sf-guidance-label">Guidance for Success</div>
          <div class="sf-guidance-title">${h(g.t)}</div>
          <div class="sf-guidance-lines">${g.b.map((x) => `<div>— ${h(x)}</div>`).join('')}</div>
        </div>
      </div>

      <div class="sf-three-col">
        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>About</div><div class="sf-card-body">
            ${fieldRow('Phone', ed('phone'))}
            ${fieldRow('Email', ed('email', { blue: true }))}
            ${fieldRow('Location', ed('location'))}
            ${fieldRow('Job Type', `<span class="sf-pill">${h(contact.title || '—')}</span>`)}
            ${fieldRow('Owner', ed('owner_name', { blue: true }))}
            ${fieldRow('Source', ed('source'))}
          </div></div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
            ${fieldRow('Stage', `<span>${h(contact.stage)}</span>`)}
            ${fieldRow('Est. Value', `<span class="sf-money"><span class="sf-edit mono" data-contact-edit="value" data-contact-id="${h(contact.id)}" title="Click to edit">${money(contact.value || 0)}</span></span>`)}
            ${fieldRow('Temperature', `<span class="sf-edit" data-contact-edit="temperature" data-contact-id="${h(contact.id)}" style="color:${tempColor}" title="Click to edit">${h(contact.temperature)}</span>`)}
            ${fieldRow('Pay Type', ed('pay_type'))}
            ${fieldRow('Roof System', ed('roof_system'))}
          </div></div>
        </div>

        <div class="sf-col">
          <div class="sf-card">
            <div class="sf-activity-tabs">${activityTabs.map(([label, ico]) => `<button class="sf-activity-tab ${activeTab === label ? 'active' : ''}" type="button" data-action="contact-activity-tab" data-tab="${h(label)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}</div>
            <form class="sf-note-box" data-contact-note-form autocomplete="off">
              <input type="hidden" name="contact_id" value="${h(contact.id)}" />
              <input name="body" placeholder="Write a note or @mention…" />
              <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
            </form>
            <div class="sf-filters">Filters: Within 2 months · All activities · All types</div>
            <div class="sf-feed">
              ${feed.length ? feed.map((a) => sfFeedItem(a)).join('') : '<div class="sf-feed-empty">No activity yet. Log a note, call, or meeting.</div>'}
            </div>
          </div>
        </div>

        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
            <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => `<button class="sf-quick-tile" type="button" data-action="contact-quick" data-kind="${h(label)}" data-contact-id="${h(contact.id)}"><i class="ti ${ico}"></i><span>${label}</span></button>`).join('')}</div>
            <button class="sf-convert-btn" type="button" data-action="contact-convert-job" data-contact-id="${h(contact.id)}"><i class="ti ti-arrow-right"></i>Convert to Job</button>
          </div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
            <div class="sf-tasks">
              ${tasks.map((t) => `<div class="sf-task-row ${t.status === 'done' ? 'done' : ''}"><button class="sf-check" type="button" data-action="toggle-contact-task" data-task-id="${h(t.id)}" aria-label="Toggle task">${t.status === 'done' ? '<i class="ti ti-check"></i>' : ''}</button><span class="sf-task-title">${h(t.title)}</span>${t.due ? `<span class="sf-due">${h(formatDate(t.due))}</span>` : ''}</div>`).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
            </div>
            <form class="sf-task-add" data-contact-task-form autocomplete="off"><input type="hidden" name="contact_id" value="${h(contact.id)}" /><i class="ti ti-plus"></i><input name="title" placeholder="Add a task…" /></form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function sfFeedItem(a) {
  const owner = String(a.owner_name || 'Quest').trim();
  const initials = owner.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'Q';
  const typeColors = { call: ['#0176D3', 'rgba(1,118,211,.12)'], email: ['#2E844A', 'rgba(46,132,74,.12)'], meeting: ['#7F77DD', 'rgba(127,119,221,.14)'], note: ['#706E6B', '#EEF0F3'], stage_change: ['#ED4E0D', 'rgba(237,78,13,.12)'], system: ['#706E6B', '#EEF0F3'] };
  const [tc, tb] = typeColors[a.type] || typeColors.note;
  const text = a.subject ? (a.subject + (a.body ? ' — ' + a.body : '')) : (a.body || titleCase(a.type || 'note'));
  return `
    <div class="sf-feed-item">
      <span class="sf-feed-avatar" style="background:${tc}">${h(initials)}</span>
      <div class="sf-feed-main">
        <div class="sf-feed-top"><span class="sf-feed-name">${h(owner)}</span><span class="sf-feed-tag" style="color:${tc};background:${tb}">${h(String(a.type || 'note').replace('_', ' '))}</span><span class="sf-feed-time">${h(timeAgo(a.completed_at || a.created_at))}</span></div>
        <div class="sf-feed-text">${h(text)}</div>
      </div>
    </div>`;
}

function patchContactField(contactId, key, raw) {
  const contact = contactById(contactId);
  if (!contact) return;
  let value;
  if (key === 'value') value = Number(String(raw).replace(/[^0-9.]/g, '')) || 0;
  else if (key === 'temperature') value = resolveTemperature(raw);
  else value = String(raw).trim();
  if (contact[key] === value) { render(); return; }
  persistContact({ ...contact, [key]: value });
}

function beginContactInlineEdit(span) {
  const key = span.dataset.contactEdit;
  const contactId = span.dataset.contactId;
  const contact = contactById(contactId);
  if (!contact) return;
  const input = document.createElement('input');
  input.className = 'sf-edit-input';
  input.value = key === 'value' ? (contact.value || 0) : (contact[key] || '');
  span.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = () => { if (done) return; done = true; patchContactField(contactId, key, input.value); };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { done = true; render(); }
  });
}

async function createContactTask(contactId, title) {
  const companyId = activeCompanyId();
  const clean = String(title || '').trim();
  if (!clean) return;
  const payload = normalizeTask({
    id: `task-${crypto.randomUUID()}`,
    company_id: companyId,
    title: clean,
    contact_id: contactId,
    creator_id: activeSession().profile.member_id || companyMembers(companyId)[0]?.id || 'abraham',
    status: 'todo',
    due: isoDate(1),
  });
  upsertTask(payload);
  render();
  const client = createSupabaseClient();
  if (client) {
    try {
      const result = await client.from('tasks').insert(taskPayload(payload)).select().single();
      if (!result.error && result.data) { upsertTask(normalizeTask(result.data)); render(); }
    } catch (error) { console.warn('Contact task sync failed', error); }
  }
}

async function logContactActivity(contactId, type, subject, body = '') {
  const contact = contactById(contactId);
  if (!contact) return;
  await logActivity({ type, subject, body, related_type: 'contact', related_id: contactId, account_id: contact.account_id });
  render();
}

function contactQuickCreate(contactId, kind) {
  if (kind === 'Task' || kind === 'New Task') return createContactTask(contactId, 'New task');
  if (kind === 'Note') return logContactActivity(contactId, 'note', 'Note added');
  if (kind === 'Call Log' || kind === 'Log a Call') return logContactActivity(contactId, 'call', 'Logged a call');
  if (kind === 'Meeting' || kind === 'New Event') return logContactActivity(contactId, 'meeting', 'Meeting scheduled');
  if (kind === 'Follow') return showToast('Following this contact.', 'local', 'Contacts');
  return showToast(`${kind} isn't set up yet.`, 'local', 'Contacts');
}

async function postContactNote(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const text = String(data.body || '').trim();
  const contactId = String(data.contact_id || '');
  if (!text) return;
  const tab = state.contactActivityTab || 'Email';
  if (tab === 'New Task') return createContactTask(contactId, text);
  const typeMap = { Email: 'email', 'Log a Call': 'call', 'New Event': 'meeting' };
  await logContactActivity(contactId, typeMap[tab] || 'note', '', text);
}

async function convertContactToJob(contactId) {
  const contact = contactById(contactId);
  if (!contact) return;
  const companyId = contact.company_id;
  if (!requirePermission('jobs.manage', companyId, 'Your role cannot create jobs.', 'Jobs')) return;
  const account = accountById(contact.account_id);
  const job = normalizeJob({
    id: '',
    company_id: companyId,
    name: `${contact.name}${contact.title ? ' — ' + contact.title : ''}`,
    client_name: account?.name || contact.name,
    contact_name: contact.name,
    site_address: contact.location || account?.address || '',
    owner_name: contact.owner_name,
    estimate_total: contact.value,
    stage: jobStageNames()[0],
    account_id: contact.account_id,
    scope: contact.notes,
  });
  job.id = crypto.randomUUID();
  job.updated_at = new Date().toISOString();
  const jobRow = supabaseRow(job, ['id', 'company_id', 'name', 'client_name', 'contact_name', 'site_address', 'job_type', 'stage', 'priority', 'owner_name', 'scope', 'notes', 'estimate_total', 'invoice_total', 'account_id', 'deal_id', 'updated_at']);
  emptyToNull(jobRow, ['account_id', 'deal_id']);
  const { ok, data } = await supabaseWrite('jobs', jobRow);
  upsertJob(ok && data ? normalizeJob(data) : job);
  const wonStage = contactStageNames().find((name) => /win|won/i.test(name)) || contact.stage;
  await persistContact({ ...contact, stage: wonStage });
  await logActivity({ type: 'system', subject: 'Contact converted -> Job created', body: contact.name, related_type: 'contact', related_id: contact.id, account_id: contact.account_id });
  state.selectedJobId = job.id;
  showToast('Contact converted to job.', ok ? 'live' : 'local', 'Contacts');
  navigate(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));
}

function tasksForContact(contactId) {
  return companyTasks().filter((task) => task.contact_id === contactId)
    .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || String(a.due).localeCompare(String(b.due)));
}

function tasksForDeal(deal) {
  if (!deal) return [];
  return companyTasks(deal.company_id)
    .filter((task) => task.contact_id === deal.primary_contact_id || task.account_id === deal.account_id)
    .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || String(a.due).localeCompare(String(b.due)));
}

async function persistContact(contact) {
  const payload = { ...contact, updated_at: new Date().toISOString() };
  upsertContact(payload);
  render();
  const client = createSupabaseClient();
  if (client) {
    try {
      const record = emptyToNull(supabaseRow(payload, CONTACT_COLS), ['account_id']);
      const result = await client.from('contacts').upsert(record).select().single();
      if (!result.error && result.data) {
        upsertContact(normalizeContact(result.data));
        render();
      }
    } catch (error) {
      console.warn('Contact update sync failed', error);
    }
  }
}

async function setContactStage(contactId, stage) {
  const contact = contactById(contactId);
  if (!contact || !stage || contact.stage === stage) return;
  await persistContact({ ...contact, stage });
  await logActivity({ type: 'stage_change', subject: `Stage → ${stage}`, related_type: 'contact', related_id: contactId, account_id: contact.account_id });
  render();
}

function setContactTemperature(contactId, temp) {
  const contact = contactById(contactId);
  if (!contact || contact.temperature === temp) return;
  persistContact({ ...contact, temperature: resolveTemperature(temp) });
}

function addContactTask(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  createContactTask(String(data.contact_id || ''), String(data.title || ''));
}

async function toggleContactTask(taskId) {
  const task = taskById(taskId);
  if (!task) return;
  const status = task.status === 'done' ? 'todo' : 'done';
  upsertTask({ ...task, status, updated_at: new Date().toISOString() });
  render();
  const client = createSupabaseClient();
  if (client) {
    try { await client.from('tasks').update({ status }).eq('id', taskId); } catch (error) { console.warn('Task toggle sync failed', error); }
  }
}

function jobSupabaseRow(job) {
  return emptyToNull(supabaseRow(job, ['id', 'company_id', 'name', 'client_name', 'contact_name', 'site_address', 'job_type', 'stage', 'priority', 'owner_name', 'scope', 'notes', 'estimate_total', 'invoice_total', 'account_id', 'deal_id', 'updated_at']), ['account_id', 'deal_id']);
}

async function persistJob(job, label = 'Job saved locally') {
  const payload = normalizeJob({ ...job, updated_at: new Date().toISOString() });
  upsertJob(payload);
  state.sync = { label, mode: 'local' };
  render();
  const { ok, data } = await supabaseWrite('jobs', jobSupabaseRow(payload));
  if (ok && data) {
    upsertJob(normalizeJob(data));
    state.sync = { label: 'Quest Supabase live', mode: 'live' };
    render();
  }
  return payload;
}

async function setJobStage(jobId, stage) {
  const job = jobById(jobId);
  if (!job || !jobStageNames().includes(stage)) return;
  if (!requirePermission('jobs.manage', job.company_id, 'Your role cannot update jobs.', 'Jobs')) return;
  if (job.stage === stage) { render(); return; }
  await persistJob({ ...job, stage }, 'Job stage saved locally');
  await logJobActivity(job.id, 'stage_change', `Stage -> ${stage}`);
}

function markJobNextStage(jobId) {
  const job = jobById(jobId);
  const names = jobStageNames();
  const idx = job ? names.indexOf(job.stage) : -1;
  if (!job || idx < 0 || idx >= names.length - 1) return;
  setJobStage(job.id, names[idx + 1]);
}

async function logJobActivity(jobId, type, subject, body = '') {
  const job = jobById(jobId);
  if (!job) return;
  await logActivity({ type, subject, body, related_type: 'job', related_id: jobId, account_id: job.account_id });
  render();
}

async function createJobTask(jobId, title) {
  const job = jobById(jobId);
  const clean = String(title || '').trim();
  if (!job || !clean) return;
  if (!requirePermission('tasks.manage', job.company_id, 'Your role cannot create tasks.', 'Tasks')) return;
  const payload = normalizeTask({
    id: `task-${crypto.randomUUID()}`,
    company_id: job.company_id,
    project_id: job.id,
    title: clean,
    type: 'lead',
    status: 'todo',
    priority: job.priority === 'Urgent' ? 'urgent' : 'medium',
    due: isoDate(1),
    creator_id: activeSession().profile.member_id || companyMembers(job.company_id)[0]?.id || 'abraham',
  });
  upsertTask(payload);
  render();
  const client = createSupabaseClient();
  if (client) {
    try {
      const result = await client.from('tasks').insert(taskPayload(payload)).select().single();
      if (!result.error && result.data) { upsertTask(normalizeTask(result.data)); render(); }
    } catch (error) { console.warn('Job task sync failed', error); }
  }
}

function jobQuickCreate(jobId, kind) {
  const job = jobById(jobId);
  if (!job) return;
  if (kind === 'Task' || kind === 'New Task') return createJobTask(jobId, 'New job task');
  if (kind === 'Note' || kind === 'Add Note') return logJobActivity(jobId, 'note', 'Note added');
  if (kind === 'Log a Call') return logJobActivity(jobId, 'call', 'Logged a call');
  if (kind === 'New Event') return logJobActivity(jobId, 'meeting', 'Meeting scheduled');
  if (['Files', 'Open Files'].includes(kind) && !can('files.view', job.company_id)) return showToast('Files is not available for this workspace.', 'local', 'Plugins');
  if (kind === 'Form' && !can('forms.view', job.company_id)) return showToast('Forms is not available for this workspace.', 'local', 'Plugins');
  if (kind === 'Invoice' && !can('finance.view', job.company_id)) return showToast('Finance is not available for this workspace.', 'local', 'Plugins');
  if (kind === 'Analytics' && !can('team.view', job.company_id)) return showToast('Reporting is not available for this workspace.', 'local', 'Plugins');
  if (kind === 'Files' || kind === 'Open Files') return navigate(companyPath('files', { folder: 'jobs', job_id: job.id }, job.company_id));
  if (kind === 'Form') return navigate(companyPath('forms', { job_id: job.id }, job.company_id));
  if (kind === 'Invoice') return navigate(companyPath('finance', {}, job.company_id));
  if (kind === 'Analytics') return navigate(companyPath('analytics', { job_id: job.id }, job.company_id));
  return showToast(`${kind} isn't set up yet.`, 'local', 'Jobs');
}

async function postJobNote(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const text = String(data.body || '').trim();
  const jobId = String(data.job_id || '');
  if (!text) return;
  const tab = state.jobActivityTab || 'Note';
  if (tab === 'New Task') return createJobTask(jobId, text);
  const typeMap = { Note: 'note', 'Log a Call': 'call', 'New Event': 'meeting' };
  await logJobActivity(jobId, typeMap[tab] || 'note', tab === 'Note' ? '' : tab, text);
}

function patchJobField(jobId, key, raw) {
  const job = jobById(jobId);
  if (!job) return;
  let value;
  if (key === 'estimate_total' || key === 'invoice_total') value = Number(String(raw).replace(/[^0-9.]/g, '')) || 0;
  else value = String(raw).trim();
  if (job[key] === value) { render(); return; }
  persistJob({ ...job, [key]: value }, 'Job field saved locally');
}

function beginJobInlineEdit(span) {
  const key = span.dataset.jobEdit;
  const jobId = span.dataset.jobId;
  const job = jobById(jobId);
  if (!job) return;
  const input = document.createElement('input');
  input.className = 'sf-edit-input';
  input.value = (key === 'estimate_total' || key === 'invoice_total') ? (job[key] || 0) : (job[key] || '');
  span.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = () => { if (done) return; done = true; patchJobField(jobId, key, input.value); };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { done = true; render(); }
  });
}

function renderContactFormModal(companyId, contact) {
  return renderModalShell('Contacts', contact ? 'Edit contact' : 'Add contact', renderContactEditor(companyId, contact), 'wide-modal');
}

function renderContactEditor(companyId, contact) {
  const edit = contact || blankContact(companyId);
  return `
    <form class="job-editor" data-contact-form>
      <input type="hidden" name="id" value="${h(edit.id || '')}" />
      <div class="section-head span-2">
        <div><h2>${contact ? 'Edit contact' : 'New contact'}</h2><p>Contacts move through Prospects, Leads, and Nurturing before quote handoff.</p></div>
      </div>
      ${field('Name', 'name', edit.name, true)}
      ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
      ${selectField('Account', 'account_id', edit.account_id, [['', '— None —']].concat(companyAccounts(companyId).map((account) => [account.id, account.name])))}
      ${field('Title', 'title', edit.title)}
      ${field('Phone', 'phone', edit.phone)}
      ${field('Email', 'email', edit.email, false, 'email')}
      ${field('Location', 'location', edit.location, false, 'text', 'span-2')}
      ${selectField('Stage', 'stage', edit.stage || contactStageNames()[0], contactStageNames().map((stage) => [stage, stage]))}
      ${field('Owner', 'owner_name', edit.owner_name)}
      ${field('Estimated value', 'value', edit.value || 0, false, 'number')}
      ${selectField('Temperature', 'temperature', edit.temperature || 'Warm', TEMPERATURES.map((t) => [t, t]))}
      ${field('Pay type', 'pay_type', edit.pay_type)}
      ${field('Roof system', 'roof_system', edit.roof_system)}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save contact</button>
        ${contact ? `<button class="btn danger" type="button" data-action="delete-contact" data-contact-id="${h(contact.id)}">Delete</button>` : ''}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;
}

function blankContact(companyId = activeCompanyId()) {
  const pf = state.contactPrefill || {};
  return normalizeContact({ id: '', company_id: companyId, name: '', stage: contactStageNames()[0], value: 0, account_id: pf.account_id || '' });
}

async function saveContact(form) {
  const formData = Object.fromEntries(new FormData(form).entries());
  const payload = normalizeContact(formData);
  payload.id = payload.id || `contact-${crypto.randomUUID()}`;
  payload.updated_at = new Date().toISOString();
  const client = createSupabaseClient();
  if (client) {
    const record = emptyToNull(supabaseRow(payload, CONTACT_COLS), ['account_id']);
    try {
      const result = await client.from('contacts').upsert(record).select().single();
      if (!result.error && result.data) {
        upsertContact(normalizeContact(result.data));
        state.selectedContactId = payload.id;
        state.modal = '';
        showToast(`${payload.name} saved.`, 'live', 'Contacts');
        render();
        return;
      }
    } catch (error) {
      console.warn('Contact save sync failed', error);
    }
  }
  upsertContact(payload);
  state.selectedContactId = payload.id;
  state.modal = '';
  showToast(`${payload.name} saved.`, 'local', 'Contacts');
  render();
}

async function deleteContact(id) {
  if (!id) return;
  const client = createSupabaseClient();
  if (client) {
    try {
      await client.from('contacts').delete().eq('id', id);
    } catch (error) {
      console.warn('Contact delete sync failed', error);
    }
  }
  state.contacts = state.contacts.filter((contact) => contact.id !== id);
  persistContacts();
  if (state.selectedContactId === id) state.selectedContactId = '';
  state.modal = '';
  render();
}

// ---- Stage manager (create / rename / recolor / delete) -------------------
function renderStageManagerModal(kind) {
  const stages = pipelineStages(kind);
  const title = kind === 'contacts' ? 'Contact pipeline stages' : kind === 'deals' ? 'Quote pipeline stages' : 'Job pipeline stages';
  const body = `
    <form class="stage-manager" data-stage-form data-kind="${kind}">
      <p class="stage-manager-hint">Stages are your pipeline columns - the placeholder groups your team can shape. Rename or recolor any stage and your records keep their place; add new stages for any workflow.</p>
      <div class="stage-rows">
        ${stages.map((stage, i) => `
          <div class="stage-row">
            <span class="stage-row-handle">${pipelineDot(stage.color)}</span>
            <input type="text" name="name_${i}" value="${h(stage.name)}" placeholder="Stage name" />
            <input type="hidden" name="orig_${i}" value="${h(stage.name)}" />
            <input class="stage-color" type="color" name="color_${i}" value="${h(/^#[0-9a-fA-F]{6}$/.test(stage.color) ? stage.color : '#9aa0a8')}" aria-label="Stage color" />
            <button class="btn danger stage-del" type="button" data-action="delete-stage" data-module="${kind}" data-index="${i}" aria-label="Delete stage"><i class="ti ti-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <button class="btn add-stage-btn" type="button" data-action="add-stage" data-module="${kind}"><i class="ti ti-plus"></i>Add stage</button>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save stages</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;
  return renderModalShell('Pipeline', title, body, 'wide-modal');
}

function parseStageForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const stages = [];
  const renameMap = {};
  let i = 0;
  while (data[`name_${i}`] !== undefined) {
    const name = String(data[`name_${i}`] || '').trim();
    const color = /^#[0-9a-fA-F]{3,8}$/.test(String(data[`color_${i}`] || '')) ? data[`color_${i}`] : '#9aa0a8';
    const orig = data[`orig_${i}`] !== undefined ? String(data[`orig_${i}`]) : '';
    if (name) {
      stages.push({ name, color });
      if (orig && orig !== name) renameMap[orig] = name;
    }
    i += 1;
  }
  return { stages, renameMap };
}

function captureStageFormInto(kind) {
  const form = document.querySelector('[data-stage-form]');
  if (!form) return;
  const { stages } = parseStageForm(form);
  if (!stages.length) return;
  if (kind === 'contacts') CONTACT_STAGES = stages;
  else if (kind === 'deals') DEAL_STAGES = stages;
  else JOB_STAGES = stages;
}

function stageListForKind(kind) {
  return kind === 'contacts' ? CONTACT_STAGES : kind === 'deals' ? DEAL_STAGES : JOB_STAGES;
}
function persistStagesForKind(kind) {
  if (kind === 'contacts') persistContactStages();
  else if (kind === 'deals') persistDealStages();
  else persistJobStages();
}

function addPipelineStage(kind) {
  captureStageFormInto(kind);
  const list = stageListForKind(kind);
  const color = STAGE_COLOR_PALETTE[list.length % STAGE_COLOR_PALETTE.length];
  list.push({ name: `New stage ${list.length + 1}`, color });
  persistStagesForKind(kind);
  syncPipelineStagesToSupabase(kind);
  render();
}

function deletePipelineStage(kind, index) {
  captureStageFormInto(kind);
  const list = stageListForKind(kind);
  if (list.length <= 1) {
    showToast('Keep at least one stage in the pipeline.', 'local', 'Stages');
    return;
  }
  if (Number.isInteger(index) && index >= 0 && index < list.length) list.splice(index, 1);
  persistStagesForKind(kind);
  syncPipelineStagesToSupabase(kind);
  render();
}

// Reflect the active company's Supabase pipeline stages into the in-memory
// JOB_STAGES / CONTACT_STAGES the rest of the UI reads from.
function applyPipelineStagesForCompany(companyId) {
  if (!Array.isArray(state.pipelineStages) || !state.pipelineStages.length) return;
  const forKind = (kind, fallback) => {
    const rows = state.pipelineStages
      .filter((row) => row.company_id === companyId && row.kind === kind)
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((row) => ({ name: String(row.name || '').trim(), color: /^#[0-9a-fA-F]{3,8}$/.test(String(row.color || '')) ? row.color : '#9aa0a8' }))
      .filter((row) => row.name);
    return rows.length ? rows : fallback.map((stage) => ({ ...stage }));
  };
  JOB_STAGES = forKind('jobs', DEFAULT_JOB_STAGES);
  CONTACT_STAGES = normalizeContactStageList(forKind('contacts', DEFAULT_CONTACT_STAGES), DEFAULT_CONTACT_STAGES);
  DEAL_STAGES = forKind('deals', DEFAULT_DEAL_STAGES);
  // Clamp active stage filters to the current company's stage names.
  if (state.stageFilter !== 'all' && !jobStageNames().includes(state.stageFilter)) state.stageFilter = 'all';
  if (state.contactStageFilter !== 'all' && !contactStageNames().includes(state.contactStageFilter)) state.contactStageFilter = 'all';
  if (state.stageFilterDeals !== 'all' && !dealStageNames().includes(state.stageFilterDeals)) state.stageFilterDeals = 'all';
}

// Replace the active company's stage set for a kind in Supabase (delete + insert).
async function syncPipelineStagesToSupabase(kind) {
  const client = createSupabaseClient();
  if (!client) return;
  const companyId = activeCompanyId();
  const list = stageListForKind(kind);
  const rows = list.map((stage, index) => ({ company_id: companyId, kind, name: stage.name, color: stage.color, position: index }));
  try {
    await client.from('pipeline_stages').delete().eq('company_id', companyId).eq('kind', kind);
    if (rows.length) await client.from('pipeline_stages').insert(rows);
    state.pipelineStages = (Array.isArray(state.pipelineStages) ? state.pipelineStages : [])
      .filter((row) => !(row.company_id === companyId && row.kind === kind))
      .concat(rows);
  } catch (error) {
    console.warn('Pipeline stage sync failed', error);
  }
}

function saveStageEdits(form) {
  const kind = ['contacts', 'deals'].includes(form.dataset.kind) ? form.dataset.kind : 'jobs';
  const { stages, renameMap } = parseStageForm(form);
  if (!stages.length) {
    showToast('Add at least one stage before saving.', 'local', 'Stages');
    return;
  }
  const validNames = new Set(stages.map((stage) => stage.name));
  const fallback = stages[0].name;
  if (kind === 'contacts') {
    CONTACT_STAGES = stages;
    persistContactStages();
    state.contacts.forEach((contact) => {
      if (renameMap[contact.stage]) contact.stage = renameMap[contact.stage];
      if (!validNames.has(contact.stage)) contact.stage = fallback;
    });
    persistContacts();
    if (state.contactStageFilter !== 'all' && !validNames.has(state.contactStageFilter)) state.contactStageFilter = 'all';
  } else if (kind === 'deals') {
    DEAL_STAGES = stages;
    persistDealStages();
    state.deals.forEach((deal) => {
      if (renameMap[deal.stage]) deal.stage = renameMap[deal.stage];
      if (!validNames.has(deal.stage)) deal.stage = fallback;
    });
    writeJson(DEAL_CACHE_KEY, state.deals);
    if (state.stageFilterDeals !== 'all' && !validNames.has(state.stageFilterDeals)) state.stageFilterDeals = 'all';
  } else {
    JOB_STAGES = stages;
    persistJobStages();
    state.jobs.forEach((job) => {
      if (renameMap[job.stage]) job.stage = renameMap[job.stage];
      if (!validNames.has(job.stage)) job.stage = fallback;
    });
    writeJson(JOB_CACHE_KEY, state.jobs);
    if (state.stageFilter !== 'all' && !validNames.has(state.stageFilter)) state.stageFilter = 'all';
  }
  syncPipelineStagesToSupabase(kind);
  syncStageRenamesToSupabase(kind, renameMap);
  state.modal = '';
  showToast('Pipeline stages updated.', 'local', 'Stages');
  render();
}

// Best-effort: carry stage renames onto the existing records in Supabase so
// jobs/contacts/deals keep their place after a stage is renamed.
async function syncStageRenamesToSupabase(kind, renameMap) {
  const client = createSupabaseClient();
  if (!client || !renameMap || !Object.keys(renameMap).length) return;
  const companyId = activeCompanyId();
  const table = kind === 'contacts' ? 'contacts' : kind === 'deals' ? 'deals' : 'jobs';
  for (const [oldName, newName] of Object.entries(renameMap)) {
    try {
      await client.from(table).update({ stage: newName }).eq('company_id', companyId).eq('stage', oldName);
    } catch (error) {
      console.warn('Stage rename sync failed', error);
    }
  }
}

function renderJobsPage(route, companyId) {
  const tab = normalizeJobTab(route.params.get('tab'));
  const stageParam = route.params.get('stage');
  if (stageParam) state.stageFilter = jobStageNames().includes(stageParam) ? stageParam : 'all';
  const job = selectedJob();
  const showFiles = can('files.view', companyId);
  return `
    ${workspaceHeader('Jobs', 'Production pipeline - every job type, from intake to paid.', `
      ${showFiles ? `<a class="btn" href="${appHref(companyPath('files', job ? { job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-folder"></i>Drive</a>` : ''}
      <button class="btn" type="button" data-action="open-stage-manager" data-module="jobs"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <nav class="tabbar" aria-label="Job sections">
      ${JOB_TABS.map((item) => `<a class="${item === tab ? 'active' : ''}" href="${appHref(companyPath('jobs', { tab: item, ...(job ? { job_id: job.id } : {}) }, companyId))}" data-router>${h(labelForTab(item))}</a>`).join('')}
    </nav>
    ${renderJobPanel(tab, companyId, job)}
  `;
}

function renderJobPanel(tab, companyId, job) {
  if (tab === 'pipeline') return renderPipeline(companyId);
  if (tab === 'list') return renderJobList(companyId);
  if (tab === 'profile') return renderJobRecord(companyId, job);
  return renderPipeline(companyId);
}

function renderPipeline(companyId) {
  return `
    ${pipelineToolbar('jobs', companyId)}
    ${state.jobBoardView === 'board' ? renderJobBoard(companyId) : renderJobList(companyId)}
  `;
}

function renderJobBoard(companyId) {
  const rows = filteredJobs(companyId, true);
  const filter = state.stageFilter;
  const lanes = filter === 'all' ? jobStages() : jobStages().filter((stage) => stage.name === filter);
  return `
    <section class="pipe-board">
      ${lanes.map((stage) => {
        const cards = rows.filter((job) => job.stage === stage.name);
        return `
          <article class="pipe-lane">
            <header class="pipe-lane-head">${pipelineDot(stage.color)}<span>${h(stage.name)}</span><b>${cards.length}</b></header>
            <div class="pipe-lane-body">
              ${cards.map((job) => jobCard(job)).join('') || '<div class="lane-empty">No jobs</div>'}
            </div>
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
      <div class="section-head"><div><h2>Jobs</h2><p>${rows.length} visible job${rows.length === 1 ? '' : 's'}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
        ${rows.map((job) => `
          <button class="table-row ${job.id === state.selectedJobId ? 'active' : ''}" type="button" data-select-job="${h(job.id)}">
            <span class="cell-lead">${pipelineDot(jobStageColor(job.stage))}<span><strong>${h(job.name)}</strong><small>${h(job.client_name || 'No client')} - ${h(job.site_address || 'No address')}</small></span></span>
            <span>${h(job.job_type || '—')}</span>
            <span>${stageTagPipe('jobs', job.stage)}</span>
            <span>${priorityPill(job.priority)}</span>
            <span>${h(job.owner_name || 'Unassigned')}</span>
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
          ${can('files.view', companyId) ? miniLink(companyPath('files', { job_id: job.id }, companyId), 'ti-folder', 'Files', `${fileCountForJob(job.id)} files`) : ''}
          ${can('forms.view', companyId) ? miniLink(companyPath('forms', { job_id: job.id }, companyId), 'ti-clipboard-list', 'Forms', 'Inspections and surveys') : ''}
          ${can('team.view', companyId) ? miniLink(companyPath('analytics', { job_id: job.id }, companyId), 'ti-chart-bar', 'Dashboard', 'Job health') : ''}
        </div>
      </article>
    </section>
  `;
}

function guidanceForJobStage(name) {
  const stage = String(name || '').toLowerCase();
  if (/unscheduled|lead|intake/.test(stage)) return { t: 'Get the job ready to schedule.', b: ['Confirm scope, address, and decision maker.', 'Assign an owner for the next move.', 'Add missing tasks before this sits idle.'] };
  if (/scheduled|site|review/.test(stage)) return { t: 'Lock the field plan.', b: ['Confirm date, crew, and customer availability.', 'Make sure photos and measurements are attached.', 'Check permit or access constraints.'] };
  if (/material|order/.test(stage)) return { t: 'Protect the production date.', b: ['Confirm material list and vendor status.', 'Attach purchase details or delivery notes.', 'Flag shortages before the crew is blocked.'] };
  if (/production|active|install/.test(stage)) return { t: 'Run the work cleanly.', b: ['Keep crew tasks current.', 'Log field notes, photos, and blockers.', 'Watch cost, schedule, and customer updates.'] };
  if (/qc|punch|quality/.test(stage)) return { t: 'Close the field loop.', b: ['Capture punch list items.', 'Confirm cleanup and customer walkthrough.', 'Prepare invoice and closeout docs.'] };
  if (/invoice/.test(stage)) return { t: 'Move from work complete to paid.', b: ['Confirm invoice total and job scope.', 'Send the invoice and record due date.', 'Follow up on payment status.'] };
  if (/paid|closed|complete/.test(stage)) return { t: 'Archive the win.', b: ['Confirm payment is recorded.', 'Make sure files and forms are complete.', 'Capture lessons learned for the next job.'] };
  if (/hold/.test(stage)) return { t: 'Unblock or document the hold.', b: ['Write the blocker clearly.', 'Assign an owner for the next decision.', 'Set a follow-up date.'] };
  return { t: 'Move the job forward.', b: ['Confirm the next operational step.', 'Assign the responsible person.', 'Log the latest customer or field update.'] };
}

function renderJobRecord(companyId, job) {
  if (!job) return emptyState('Create a job to see the record workspace.');
  const stages = jobStages();
  const ci = stages.findIndex((stage) => stage.name === job.stage);
  const currentIndex = ci >= 0 ? ci : 0;
  const g = guidanceForJobStage(job.stage);
  const activeTab = state.jobActivityTab || 'Note';
  const feed = activitiesFor('job', job.id);
  const tasks = state.tasks
    .filter((task) => task.project_id === job.id)
    .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || String(a.due).localeCompare(String(b.due)));
  const account = accountById(job.account_id);
  const deal = dealById(job.deal_id);
  const showCrm = can('crm.view', companyId);
  const fieldRow = (label, content) => `<div class="sf-field"><div class="sf-field-label">${h(label)}<i class="ti ti-pencil sf-pencil"></i></div><div class="sf-field-value">${content}</div></div>`;
  const ed = (key, opts = {}) => {
    const display = (job[key] === '' || job[key] == null) ? '-' : job[key];
    const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : ''].filter(Boolean).join(' ');
    return `<span class="${cls}" data-job-edit="${h(key)}" data-job-id="${h(job.id)}" title="Click to edit">${h(String(display))}</span>`;
  };
  const headerActions = [
    ['New Task', 'ti-checkbox'],
    ['Log a Call', 'ti-phone'],
    ['Add Note', 'ti-note'],
    ...(can('files.view', companyId) ? [['Open Files', 'ti-folder']] : []),
    ['Edit', 'ti-pencil'],
  ];
  const activityTabs = [['Note', 'ti-note'], ['New Task', 'ti-checkbox'], ['New Event', 'ti-calendar'], ['Log a Call', 'ti-phone']];
  const quickTiles = [
    ['Task', 'ti-checkbox'],
    ...(can('files.view', companyId) ? [['Files', 'ti-folder']] : []),
    ...(can('forms.view', companyId) ? [['Form', 'ti-clipboard-list']] : []),
    ...(can('finance.view', companyId) ? [['Invoice', 'ti-receipt-dollar']] : []),
    ['Note', 'ti-note'],
    ...(can('team.view', companyId) ? [['Analytics', 'ti-chart-bar']] : []),
  ];

  return `
    <div class="sf-record job-record">
      <div class="sf-object-tabs">
        <a class="sf-object-tab" href="${appHref(companyPath('home', {}, companyId))}" data-router>Home</a>
        <a class="sf-object-tab" href="${appHref(companyPath('jobs', {}, companyId))}" data-router>All Jobs <span class="sf-tab-kind">| Jobs</span></a>
        <span class="sf-object-tab on">${h(job.name)} <span class="sf-tab-kind">| Job</span></span>
      </div>

      <div class="sf-record-head">
        <span class="sf-record-icon"><i class="ti ti-briefcase"></i></span>
        <div><div class="sf-record-label">Job</div><div class="sf-record-name">${h(job.name)}</div></div>
        <div class="sf-actions">
          ${headerActions.map(([label, ico]) => label === 'Edit'
            ? `<button class="sf-btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i>${label}</button>`
            : `<button class="sf-btn" type="button" data-action="job-quick" data-kind="${h(label)}" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}
        </div>
      </div>

      <div class="sf-path-wrap">
        <div class="sf-path-row">
          <div class="sf-stage-track">
            ${stages.map((stage, i) => {
              const cls = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future';
              return `<button class="sf-stage ${cls}" type="button" data-action="set-job-stage" data-job-id="${h(job.id)}" data-stage="${h(stage.name)}" title="Move to ${h(stage.name)}">${i < currentIndex ? '<i class="ti ti-check"></i>' : h(stage.name)}</button>`;
            }).join('')}
          </div>
          <button class="sf-mark-btn" type="button" data-action="job-mark-next" data-job-id="${h(job.id)}">Mark as Current Stage</button>
        </div>
        <div class="sf-guidance">
          <div class="sf-guidance-label">Guidance for Success</div>
          <div class="sf-guidance-title">${h(g.t)}</div>
          <div class="sf-guidance-lines">${g.b.map((line) => `<div>- ${h(line)}</div>`).join('')}</div>
        </div>
      </div>

      <div class="sf-three-col">
        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>Job Details</div><div class="sf-card-body">
            ${fieldRow('Client', ed('client_name', { blue: true }))}
            ${fieldRow('Contact', ed('contact_name', { blue: true }))}
            ${fieldRow('Site Address', ed('site_address'))}
            ${fieldRow('Job Type', `<span class="sf-pill">${h(job.job_type || '-')}</span>`)}
            ${fieldRow('Owner', ed('owner_name', { blue: true }))}
            ${fieldRow('Priority', `<span class="sf-pill">${h(job.priority || 'Medium')}</span>`)}
          </div></div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
            ${fieldRow('Stage', `<span>${h(job.stage)}</span>`)}
            ${fieldRow('Estimate Total', `<span class="sf-money"><span class="sf-edit mono" data-job-edit="estimate_total" data-job-id="${h(job.id)}" title="Click to edit">${money(job.estimate_total || 0)}</span></span>`)}
            ${fieldRow('Invoice Total', `<span class="sf-money"><span class="sf-edit mono" data-job-edit="invoice_total" data-job-id="${h(job.id)}" title="Click to edit">${money(job.invoice_total || 0)}</span></span>`)}
            ${fieldRow('Account', account ? (showCrm ? `<button class="link-button" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(account.name)}</button>` : `<span>${h(account.name)}</span>`) : '<span>-</span>')}
            ${fieldRow('Deal', deal ? (showCrm ? `<button class="link-button" type="button" data-action="open-deal" data-deal-id="${h(deal.id)}">${h(deal.name)}</button>` : `<span>${h(deal.name)}</span>`) : '<span>-</span>')}
          </div></div>
        </div>

        <div class="sf-col">
          <div class="sf-card">
            <div class="sf-activity-tabs">${activityTabs.map(([label, ico]) => `<button class="sf-activity-tab ${activeTab === label ? 'active' : ''}" type="button" data-action="job-activity-tab" data-tab="${h(label)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}</div>
            <form class="sf-note-box" data-job-note-form autocomplete="off">
              <input type="hidden" name="job_id" value="${h(job.id)}" />
              <input name="body" placeholder="Write a note or @mention..." />
              <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
              <button class="sf-btn" type="submit">Post</button>
            </form>
            <div class="sf-filters">Filters: This job - All activities - All types</div>
            <div class="sf-feed">
              ${feed.length ? feed.map((a) => sfFeedItem(a)).join('') : '<div class="sf-feed-empty">No job activity yet. Log a note, call, or meeting.</div>'}
            </div>
          </div>
        </div>

        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
            <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => `<button class="sf-quick-tile" type="button" data-action="job-quick" data-kind="${h(label)}" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i><span>${h(label)}</span></button>`).join('')}</div>
          </div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-apps"></i>Linked Workspace</div>
            <div class="sf-quick-grid">
              <a class="sf-quick-tile" href="${appHref(companyPath('tasks', { job_id: job.id }, companyId))}" data-router><i class="ti ti-checkbox"></i><span>Open Tasks</span></a>
              ${can('files.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('files', { folder: 'jobs', job_id: job.id }, companyId))}" data-router><i class="ti ti-folder"></i><span>Files</span></a>` : ''}
              ${can('forms.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('forms', { job_id: job.id }, companyId))}" data-router><i class="ti ti-clipboard-list"></i><span>Forms</span></a>` : ''}
              ${can('team.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('analytics', { job_id: job.id }, companyId))}" data-router><i class="ti ti-chart-bar"></i><span>Analytics</span></a>` : ''}
            </div>
          </div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
            <div class="sf-tasks">
              ${tasks.map((task) => `<div class="sf-task-row ${task.status === 'done' ? 'done' : ''}"><button class="sf-check" type="button" data-select-task="${h(task.id)}" aria-label="Open task">${task.status === 'done' ? '<i class="ti ti-check"></i>' : ''}</button><span class="sf-task-title">${h(task.title)}</span>${task.due ? `<span class="sf-due">${h(formatDate(task.due))}</span>` : ''}</div>`).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
            </div>
          </div>
        </div>
      </div>
    </div>
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
      ${selectField('Stage', 'stage', resolveJobStage(edit.stage), jobStageNames().map((stage) => [stage, stage]))}
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
  const canManageFiles = can('files.manage', companyId);
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
            ${canManageFiles ? `
              <button class="btn" type="button" data-action="open-folder-form"><i class="ti ti-folder-plus"></i>New folder</button>
              <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
            ` : ''}
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
      <span class="drive-folder-icon">${folderIconAsset(folder, folder.name)}</span>
      <strong>${h(folder.name)}</strong>
      <em>${h(folder.countLabel || '0 items')}</em>
    </a>
  `;
}

function renderFolderRow(folder) {
  return `
    <a class="explorer-row folder-row-live" href="${h(folder.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${folderIconAsset(folder, folder.name)}</span><strong>${h(folder.name)}</strong></span>
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
      ${fileIconAsset(file, fileTypeLabel(file))}
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
  const canManageFiles = can('files.manage', companyId);
  if (!file) {
    return `
      <div class="file-detail-preview"><span class="file-doc-icon large">${folderIconAsset({ id: 'home', name: companyName(companyId) }, 'Company drive')}</span></div>
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
      ${canManageFiles ? `<button class="btn danger" type="button" data-action="delete-file" data-file-id="${h(file.id)}"><i class="ti ti-trash"></i>Delete</button>` : ''}
    </div>
  `;
}

function renderFileViewer(file, companyId) {
  const canManageFiles = can('files.manage', companyId);
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
          ${canManageFiles ? `<button class="btn danger" type="button" data-action="delete-file" data-file-id="${h(file.id)}"><i class="ti ti-trash"></i>Delete</button>` : ''}
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
  const settingsTabs = [
    [companyPath('settings', { tab: 'company' }, companyId), 'Company', 'company'],
    [companyPath('settings', { tab: 'billing' }, companyId), 'Billing', 'billing'],
    [companyPath('settings', { tab: 'plugins' }, companyId), 'Plugins', 'plugins'],
    [companyPath('settings', { tab: 'roles' }, companyId), 'Roles', 'roles'],
    [companyPath('settings', { tab: 'access' }, companyId), 'Access', 'access'],
    [companyPath('settings', { tab: 'team' }, companyId), 'Workers', 'team'],
  ];
  if (isQuestDeveloper()) settingsTabs.push([companyPath('settings', { tab: 'master' }, companyId), 'Master', 'master']);
  const allowedTabs = settingsTabs.map((item) => item[2]);
  const tab = allowedTabs.includes(route.params.get('tab')) ? route.params.get('tab') : 'company';
  return `
    ${workspaceHeader('Settings', 'Company settings, roles, approvals, and admin controls.', '')}
    ${compactTabs('Settings sections', settingsTabs.map(([href, label, id]) => [href, label, tab === id]))}
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
      ${tab === 'plugins' ? renderPluginsSettings(companyId) : ''}
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
      ${tab === 'master' && isQuestDeveloper() ? renderPlatformMasterPanel(companyId) : ''}
    </section>
  `;
}

function renderPluginsSettings(companyId) {
  const canManagePlugins = can('plugins.manage', companyId);
  const installedCount = availableWorkspacePlugins().filter((plugin) => isPluginInstalled(companyId, plugin.id)).length;
  return `
    <article class="panel span-3 plugins-settings-panel">
      <div class="section-head">
        <div><h2>Workspace plugins</h2><p>${installedCount} active plugin${installedCount === 1 ? '' : 's'} for ${h(companyName(companyId))}. Core work modules stay on for every company.</p></div>
      </div>
      <div class="plugin-preset-row">
        ${Object.entries(WORKSPACE_PLUGIN_PRESETS).map(([presetCode, pluginIds]) => `
          <button class="btn" type="button" data-action="apply-plugin-preset" data-preset-code="${h(presetCode)}" ${canManagePlugins ? '' : 'disabled'}>
            <i class="ti ti-layout-grid-add"></i>${h(WORKSPACE_PLUGIN_PRESET_LABELS[presetCode] || titleCase(presetCode))}
            <small>${pluginIds.length} plugins</small>
          </button>
        `).join('')}
      </div>
      <div class="plugin-card-grid">
        ${WORKSPACE_PLUGIN_REGISTRY.map((plugin) => renderPluginCard(companyId, plugin, canManagePlugins)).join('')}
      </div>
    </article>
  `;
}

function renderPluginCard(companyId, plugin, canManagePlugins) {
  const status = companyPluginStatus(companyId, plugin.id);
  const installed = status === 'installed';
  const disabled = status === 'disabled';
  const available = status === 'available';
  const comingSoon = status === 'coming_soon';
  const prerequisiteNote = pluginPrerequisiteNote(companyId, plugin);
  const conflictIds = conflictingPluginIds(companyId, plugin.id, 'installed');
  const conflictLabels = conflictIds.map((conflictId) => pluginById(conflictId)?.label || conflictId).join(', ');
  const moduleLabels = plugin.module_ids
    .map((moduleId) => MODULE_REGISTRY.find((module) => module.id === moduleId)?.label || titleCase(moduleId))
    .join(', ');
  return `
    <article class="plugin-card ${installed ? 'installed' : disabled ? 'disabled' : comingSoon ? 'coming-soon' : 'available'}">
      <div class="plugin-card-icon"><i class="ti ${h(plugin.icon)}"></i></div>
      <div class="plugin-card-copy">
        <strong>${h(plugin.label)}</strong>
        <span>${h(plugin.summary)}</span>
        <small>${h(moduleLabels)}</small>
        ${prerequisiteNote ? `<small class="plugin-card-note">${h(prerequisiteNote)}</small>` : ''}
        ${conflictLabels && !installed ? `<small class="plugin-card-note warning">Installing ${h(plugin.label)} disables ${h(conflictLabels)}.</small>` : ''}
      </div>
      <b class="status-pill ${installed ? 'active' : comingSoon ? 'muted' : disabled ? 'pending' : ''}">${h(pluginStatusLabel(status))}</b>
      <div class="plugin-card-actions">
        ${installed ? `<button class="btn" type="button" data-action="set-company-plugin" data-plugin-id="${h(plugin.id)}" data-status="disabled" ${canManagePlugins ? '' : 'disabled'}><i class="ti ti-power"></i>Disable</button>` : ''}
        ${available || disabled ? `<button class="btn btn-primary" type="button" data-action="set-company-plugin" data-plugin-id="${h(plugin.id)}" data-status="installed" ${canManagePlugins ? '' : 'disabled'}><i class="ti ti-download"></i>${disabled ? 'Reinstall' : 'Install'}</button>` : ''}
        ${comingSoon ? '<button class="btn" type="button" disabled><i class="ti ti-clock"></i>Coming soon</button>' : ''}
      </div>
    </article>
  `;
}

function conflictingPluginIds(companyId, pluginId, nextStatus) {
  const plugin = pluginById(pluginId);
  if (nextStatus !== 'installed' || !plugin?.exclusiveGroup) return [];
  return availableWorkspacePlugins()
    .filter((item) => item.id !== plugin.id && item.exclusiveGroup === plugin.exclusiveGroup && isPluginInstalled(companyId, item.id))
    .map((item) => item.id);
}

function pluginPrerequisiteNote(companyId, plugin) {
  if (plugin.id === 'underwriter' && !isPluginInstalled(companyId, 'crm_2')) return 'Underwriter connects best when CRM 2 is installed.';
  if (!plugin.recommendedWith?.length) return '';
  const recommended = plugin.recommendedWith
    .filter((pluginId) => !isPluginInstalled(companyId, pluginId))
    .map((pluginId) => pluginById(pluginId)?.label || pluginId);
  return recommended.length ? `${plugin.label} works best with ${recommended.join(', ')}.` : '';
}

function pluginStatusLabel(status) {
  if (status === 'installed') return 'Installed';
  if (status === 'disabled') return 'Disabled';
  if (status === 'coming_soon') return 'Coming soon';
  return 'Available';
}

function renderBillingSettings(companyId) {
  const subscription = companySubscription(companyId);
  const pendingReview = subscriptionNeedsReview(companyId);
  const manualBilling = CONFIG.billingMode === 'manual';
  const buttonLabel = manualBilling ? 'Manual approval' : pendingReview ? 'Billing pending' : 'Start subscription';
  return `
    <article class="panel">
      <div class="section-head">
        <div><h2>${pendingReview ? 'Workspace awaiting approval' : 'Subscription'}</h2><p>${manualBilling ? 'Manual approval is active for launch week. Lumen activates workspaces after review.' : pendingReview ? 'Quest needs to approve billing/access before live company data opens.' : '$300/month company workspace billing gate.'}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${pendingReview || manualBilling ? 'disabled' : ''}><i class="ti ti-credit-card"></i>${buttonLabel}</button>
      </div>
      ${contractRows([
        ['Plan', '$300/month company workspace'],
        ['Status', subscriptionLabel(companyId)],
        ['Billing mode', manualBilling ? 'Manual approval' : 'Stripe checkout'],
        ['Stripe customer', subscription?.stripe_customer_id || 'Not connected'],
        ['Approval', pendingReview || manualBilling ? 'Waiting for Lumen review' : 'Ready'],
        ['Renewal / trial', subscription?.current_period_end || subscription?.trial_ends_at ? formatDate(subscription.current_period_end || subscription.trial_ends_at) : 'Pending'],
      ])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${contractRows([
        ['Workspace access', subscriptionAllowsCompany(companyId) ? 'Allowed' : 'Suspended'],
        ['Finance/files privacy', CONFIG.questAuthEnabled ? 'Requires Auth + RLS' : 'Demo only'],
        ['Seat billing', 'Tracked later; not charged in v1'],
      ])}
    </article>
    ${isQuestDeveloper() ? renderWorkspaceApprovalConsole(companyId) : ''}
  `;
}

function renderWorkspaceApprovalConsole(companyId) {
  const reviews = workspaceReviewRows();
  const pending = reviews.filter((review) => review.status === 'pending_review').length;
  return `
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${pending} workspace${pending === 1 ? '' : 's'} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${reviews.map((review) => renderWorkspaceReviewRow(review, companyId)).join('') || emptyState('No workspace reviews found.')}
      </div>
    </article>
  `;
}

function renderWorkspaceReviewRow(review, currentCompanyId) {
  const active = ['active', 'trialing', 'past_due', 'grace'].includes(review.status);
  const isCurrent = review.company_id === currentCompanyId;
  return `
    <article class="workspace-review-row ${review.status === 'pending_review' ? 'pending' : ''}">
      <span>
        <strong>${h(review.company_name || companyName(review.company_id))}${isCurrent ? ' / current' : ''}</strong>
        <small>${h(review.company_id)} / ${h(review.owner_email || 'No owner email')} / ${formatDate(review.created_at)}</small>
      </span>
      <b class="status-pill ${active ? 'active' : review.status === 'pending_review' ? 'pending' : 'muted'}">${h(subscriptionLabelForStatus(review.status, review))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="active" ${active ? 'disabled' : ''}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="pending_review" ${review.status === 'pending_review' ? 'disabled' : ''}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="suspended" ${review.status === 'suspended' ? 'disabled' : ''}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="canceled" ${review.status === 'canceled' ? 'disabled' : ''}>Reject</button>
      </div>
    </article>
  `;
}

function renderPlatformMasterPanel(currentCompanyId) {
  const companies = platformCompanyRows();
  const totals = companies.reduce((acc, company) => {
    acc.members += number(company.member_count);
    acc.pending += company.status === 'pending_review' ? 1 : 0;
    acc.active += ['active', 'trialing', 'past_due', 'grace'].includes(company.status) ? 1 : 0;
    acc.suspended += ['suspended', 'canceled'].includes(company.status) ? 1 : 0;
    return acc;
  }, { members: 0, pending: 0, active: 0, suspended: 0 });
  return `
    <article class="panel span-3 platform-master-panel">
      <div class="section-head">
        <div>
          <h2>Master panel</h2>
          <p>Platform-owner view of companies, members, and workspace access.</p>
        </div>
        <button class="btn" type="button" data-action="refresh-data"><i class="ti ti-refresh"></i>Refresh</button>
      </div>
      <section class="metric-grid platform-master-metrics">
        ${metricCard('Companies', companies.length)}
        ${metricCard('Active', totals.active)}
        ${metricCard('Pending', totals.pending)}
        ${metricCard('Members', totals.members)}
      </section>
      <div class="platform-company-list">
        ${companies.map((company) => renderPlatformCompanyRow(company, currentCompanyId)).join('') || emptyState('No companies found for platform review.')}
      </div>
    </article>
  `;
}

function renderPlatformCompanyRow(company, currentCompanyId) {
  const active = ['active', 'trialing', 'past_due', 'grace'].includes(company.status);
  const pending = company.status === 'pending_review';
  const suspended = ['suspended', 'canceled'].includes(company.status);
  const isPlatformCompany = company.company_id === 'lumen';
  const members = platformMembersForCompany(company.company_id);
  const statusClass = active ? 'active' : pending ? 'pending' : suspended ? 'muted' : 'hold';
  return `
    <article class="platform-company-card ${pending ? 'pending' : suspended ? 'suspended' : ''}">
      <div class="platform-company-main">
        <span class="company-dot" style="--company-color:${h(company.color || companyColor(company.company_id))}"></span>
        <div>
          <strong>${h(company.company_name || companyName(company.company_id))}${company.company_id === currentCompanyId ? ' / current' : ''}</strong>
          <small>${h(company.company_id)} / Owner: ${h(company.owner_email || company.owner_name || 'No owner yet')}</small>
        </div>
      </div>
      <div class="platform-company-stats">
        <b class="status-pill ${statusClass}">${h(subscriptionLabelForStatus(company.status, company))}</b>
        <span>${h(String(number(company.active_member_count)))} active</span>
        <span>${h(String(number(company.pending_member_count)))} pending</span>
        <span>${h(String(number(company.disabled_member_count)))} disabled</span>
      </div>
      ${renderPlatformPluginStrip(company.company_id)}
      <div class="platform-company-actions">
        <button class="btn btn-primary" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="approve" ${active ? 'disabled' : ''}>Approve</button>
        <button class="btn" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="suspend" ${suspended || isPlatformCompany ? 'disabled' : ''}>Suspend</button>
        <button class="btn" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="reactivate" ${active ? 'disabled' : ''}>Reactivate</button>
        <button class="btn danger" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="archive" ${isPlatformCompany || company.status === 'canceled' ? 'disabled' : ''}>Archive</button>
      </div>
      <details class="platform-members" ${pending ? 'open' : ''}>
        <summary>${members.length} member${members.length === 1 ? '' : 's'}</summary>
        <div class="platform-member-list">
          ${members.map(renderPlatformMemberRow).join('') || emptyState('No members found for this company.')}
        </div>
      </details>
    </article>
  `;
}

function renderPlatformPluginStrip(companyId) {
  const installed = availableWorkspacePlugins().filter((plugin) => isPluginInstalled(companyId, plugin.id));
  return `
    <details class="platform-plugins">
      <summary>${installed.length}/${availableWorkspacePlugins().length} plugins installed</summary>
      <div class="platform-plugin-list">
        ${availableWorkspacePlugins().map((plugin) => {
          const active = isPluginInstalled(companyId, plugin.id);
          return `
            <span class="${active ? 'active' : 'muted'}">
              <b>${h(plugin.label)}</b>
              <button class="btn" type="button" data-action="set-company-plugin" data-company-id="${h(companyId)}" data-plugin-id="${h(plugin.id)}" data-status="${active ? 'disabled' : 'installed'}">
                ${active ? 'Disable' : 'Install'}
              </button>
            </span>
          `;
        }).join('')}
      </div>
    </details>
  `;
}

function renderPlatformMemberRow(member) {
  return `
    <article class="platform-member-row ${member.status !== 'active' ? 'muted' : ''}">
      ${renderAvatar({ full_name: member.name, email: member.email }, 'avatar small')}
      <span>
        <strong>${h(member.name || member.email || shortUserId(member.profile_id))}</strong>
        <small>${h(member.email || member.profile_id)} / ${h(member.role_label)} / ${h(titleCase(member.status))}</small>
      </span>
      <b class="status-pill ${member.status === 'active' ? 'active' : member.status === 'pending' ? 'pending' : 'muted'}">${h(titleCase(member.status))}</b>
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
  const liveModules = installedLiveModules(companyId);
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
        ${PERMISSION_KEYS.filter(([key]) => permissionAvailableForCompany(key, companyId)).map(([key, label]) => `
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
  return renderModalShell('Users', 'Create invite code', `
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${h(companyId)}" />
      ${field('Email', 'email', '', true, 'email')}
      ${selectField('Role', 'role_id', defaultInviteRoleId(companyId), options)}
      <div class="form-message span-2">Quest creates an invite code and link for you to copy. Automatic invite email delivery is not active in v1.</div>
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

// ===========================================================================
// CRM: Accounts (real entity), Deals pipeline, Activities timeline
// ===========================================================================
function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || '?';
}

function accountTypePill(type) {
  const tone = { Customer: 'tone-green', Prospect: 'tone-blue', Partner: 'tone-purple', Vendor: 'tone-amber' }[type] || 'tone-gray';
  return `<span class="crm-pill ${tone}">${h(type || 'Customer')}</span>`;
}

function dealStatusPill(status) {
  const tone = { open: 'tone-blue', won: 'tone-green', lost: 'tone-red' }[status] || 'tone-gray';
  const label = { open: 'Open', won: 'Won', lost: 'Lost' }[status] || status;
  return `<span class="crm-pill ${tone}">${h(label)}</span>`;
}

function renderCrmPage(route, companyId) {
  const accountId = route.params.get('account_id');
  if (accountId) {
    const account = accountById(accountId);
    if (account && account.company_id === companyId) return renderAccountDetail(companyId, account);
  }
  return renderAccountList(companyId);
}

function renderAccountList(companyId) {
  const rows = filteredAccounts(companyId);
  const all = companyAccounts(companyId);
  const openDeals = companyDeals(companyId).filter((deal) => deal.status === 'open');
  return `
    ${workspaceHeader('Accounts', 'Organizations and customers - the hub for contacts, quotes, and jobs.', `
      <button class="btn btn-primary" type="button" data-action="open-account-form" data-mode="new"><i class="ti ti-plus"></i>Add account</button>
    `)}
    <section class="metric-grid crm-metrics">
      ${metricCard('Accounts', all.length)}
      ${metricCard('Contacts', companyContacts(companyId).length)}
      ${metricCard('Open quotes', openDeals.length)}
      ${metricCard('Quote pipeline', money(sum(openDeals, 'value')))}
    </section>
    <section class="pipe-toolbar">
      <label class="crm-search"><i class="ti ti-search"></i><input data-account-search value="${h(state.accountQuery)}" placeholder="Search accounts" /></label>
      <div class="pipe-chips" role="group" aria-label="Filter by type">
        <button class="pipe-chip ${state.accountTypeFilter === 'all' ? 'on' : ''}" type="button" data-action="account-type" data-type="all">All<b>${all.length}</b></button>
        ${ACCOUNT_TYPES.map((type) => `<button class="pipe-chip ${state.accountTypeFilter === type ? 'on' : ''}" type="button" data-action="account-type" data-type="${h(type)}">${h(type)}<b>${all.filter((account) => account.type === type).length}</b></button>`).join('')}
      </div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>Accounts</h2><p>${rows.length} visible</p></div></div>
      <div class="data-table accounts-table">
        <div class="table-head"><span>Account</span><span>Type</span><span>Owner</span><span>Contacts</span><span>Open quotes</span><span>Pipeline</span></div>
        ${rows.map((account) => {
          const deals = dealsForAccount(account.id).filter((deal) => deal.status === 'open');
          return `
          <button class="table-row" type="button" data-action="open-account" data-account-id="${h(account.id)}">
            <span class="cell-lead"><span class="account-avatar">${h(initials(account.name))}</span><span><strong>${h(account.name)}</strong><small>${h(account.industry || account.email || '—')}</small></span></span>
            <span>${accountTypePill(account.type)}</span>
            <span>${h(account.owner_name || 'Unassigned')}</span>
            <span>${contactsForAccount(account.id).length}</span>
            <span>${deals.length}</span>
            <span class="cell-mono">${money(sum(deals, 'value'))}</span>
          </button>`;
        }).join('') || emptyState('No accounts yet. Add your first account to start the CRM.')}
      </div>
    </section>
  `;
}

function renderAccountDetail(companyId, account) {
  const tab = ['overview', 'contacts', 'deals', 'jobs', 'activity'].includes(state.accountTab) ? state.accountTab : 'overview';
  const contacts = contactsForAccount(account.id);
  const deals = dealsForAccount(account.id);
  const jobs = jobsForAccount(account.id);
  const openDeals = deals.filter((deal) => deal.status === 'open');
  const tabs = [
    ['overview', 'Overview', ''],
    ['contacts', 'Contacts', contacts.length],
    ['deals', 'Quotes', deals.length],
    ['jobs', 'Jobs', jobs.length],
    ['activity', 'Activity', activitiesForAccount(account.id).length],
  ];
  return `
    ${workspaceHeader(account.name, `${account.type}${account.industry ? ' - ' + account.industry : ''}`, `
      <a class="btn" href="${appHref(companyPath('crm', {}, companyId))}" data-router><i class="ti ti-arrow-left"></i>Accounts</a>
      <button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${h(account.id)}" data-account-id="${h(account.id)}"><i class="ti ti-note"></i>Log activity</button>
      <button class="btn" type="button" data-action="open-deal-form" data-mode="new" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>New quote</button>
      <button class="btn" type="button" data-action="open-account-form" data-mode="edit" data-account-id="${h(account.id)}"><i class="ti ti-pencil"></i>Edit</button>
    `)}
    <section class="metric-grid crm-metrics">
      ${metricCard('Open quotes', openDeals.length)}
      ${metricCard('Quote pipeline', money(sum(openDeals, 'value')))}
      ${metricCard('Won', money(sum(deals.filter((deal) => deal.status === 'won'), 'value')))}
      ${metricCard('Jobs', jobs.length)}
    </section>
    <nav class="tabbar" aria-label="Account sections">
      ${tabs.map(([id, label, count]) => `<button class="${id === tab ? 'active' : ''}" type="button" data-action="set-account-tab" data-tab="${id}">${h(label)}${count !== '' ? ` <b class="tab-count">${h(String(count))}</b>` : ''}</button>`).join('')}
    </nav>
    ${renderAccountTab(companyId, account, tab, { contacts, deals, jobs })}
  `;
}

function renderAccountTab(companyId, account, tab, data) {
  if (tab === 'contacts') {
    return `<section class="panel">
      <div class="section-head"><div><h2>Contacts</h2><p>People at ${h(account.name)}</p></div><button class="btn" type="button" data-action="open-contact-form" data-mode="new" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Add contact</button></div>
      <div class="data-table contacts-table">
        <div class="table-head"><span>Name</span><span>Title</span><span>Phone</span><span>Email</span><span>Owner</span><span></span></div>
        ${data.contacts.map((contact) => `
          <button class="table-row" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${h(contact.id)}">
            <span class="cell-lead"><span class="account-avatar sm">${h(initials(contact.name))}</span><span><strong>${h(contact.name)}</strong></span></span>
            <span>${h(contact.title || '—')}</span>
            <span>${h(contact.phone || '—')}</span>
            <span>${contact.email ? h(contact.email) : '<span class="muted-dash">—</span>'}</span>
            <span>${h(contact.owner_name || 'Unassigned')}</span>
            <span></span>
          </button>`).join('') || emptyState('No contacts linked to this account yet.')}
      </div>
    </section>`;
  }
  if (tab === 'deals') {
    return `<section class="panel">
      <div class="section-head"><div><h2>Quotes</h2><p>Bottom-of-funnel opportunities for ${h(account.name)}</p></div><button class="btn" type="button" data-action="open-deal-form" data-mode="new" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>New quote</button></div>
      <div class="data-table deals-table">
        <div class="table-head"><span>Deal</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
        ${data.deals.map((deal) => dealRow(deal)).join('') || emptyState('No quotes for this account yet.')}
      </div>
    </section>`;
  }
  if (tab === 'jobs') {
    return `<section class="panel">
      <div class="section-head"><div><h2>Jobs</h2><p>Production work for ${h(account.name)}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
        ${data.jobs.map((job) => `
          <a class="table-row" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>
            <span class="cell-lead">${pipelineDot(jobStageColor(job.stage))}<span><strong>${h(job.name)}</strong><small>${h(job.site_address || 'No address')}</small></span></span>
            <span>${h(job.job_type || '—')}</span>
            <span>${stageTagPipe('jobs', job.stage)}</span>
            <span>${priorityPill(job.priority)}</span>
            <span>${h(job.owner_name || 'Unassigned')}</span>
            <span>${money(job.estimate_total)}</span>
          </a>`).join('') || emptyState('No jobs linked to this account yet. Win a deal to create one.')}
      </div>
    </section>`;
  }
  if (tab === 'activity') {
    return `<section class="panel">
      <div class="section-head"><div><h2>Activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${h(account.id)}" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Log activity</button></div>
      ${renderActivityTimeline('account', account.id)}
    </section>`;
  }
  // overview
  return `
    <section class="crm-detail-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Details</h2></div></div>
        ${contractRows([
          ['Type', account.type],
          ['Industry', account.industry || '—'],
          ['Owner', account.owner_name || 'Unassigned'],
          ['Phone', account.phone || '—'],
          ['Email', account.email || '—'],
          ['Website', account.website || '—'],
          ['Address', account.address || '—'],
          ['Status', account.status],
        ])}
        ${account.notes ? `<p class="crm-notes">${h(account.notes)}</p>` : ''}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Recent activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${h(account.id)}" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Log</button></div>
        ${renderActivityTimeline('account', account.id, '', 6)}
      </article>
    </section>
  `;
}

function blankAccount(companyId = activeCompanyId()) {
  return normalizeAccount({ id: '', company_id: companyId, name: '', type: 'Customer' });
}
function renderAccountFormModal(companyId, account) {
  return renderModalShell('Accounts', account ? 'Edit account' : 'New account', renderAccountEditor(companyId, account), 'wide-modal');
}
function renderAccountEditor(companyId, account) {
  const edit = account || blankAccount(companyId);
  return `
    <form class="job-editor" data-account-form>
      <input type="hidden" name="id" value="${h(edit.id || '')}" />
      <div class="section-head span-2"><div><h2>${account ? 'Edit account' : 'New account'}</h2><p>Accounts group the contacts, quotes, and jobs for one organization.</p></div></div>
      ${field('Account name', 'name', edit.name, true)}
      ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
      ${selectField('Type', 'type', edit.type, ACCOUNT_TYPES.map((type) => [type, type]))}
      ${field('Industry', 'industry', edit.industry)}
      ${field('Owner', 'owner_name', edit.owner_name)}
      ${field('Phone', 'phone', edit.phone)}
      ${field('Email', 'email', edit.email, false, 'email')}
      ${field('Website', 'website', edit.website)}
      ${selectField('Status', 'status', edit.status, [['Active', 'Active'], ['Inactive', 'Inactive']])}
      ${field('Address', 'address', edit.address, false, 'text', 'span-2')}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save account</button>
        ${account ? `<button class="btn danger" type="button" data-action="delete-account" data-account-id="${h(account.id)}">Delete</button>` : ''}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`;
}

// ---- Deals (pipeline) -----------------------------------------------------
function dealRow(deal) {
  return `
    <button class="table-row ${deal.id === state.selectedDealId ? 'active' : ''}" type="button" data-action="open-deal" data-deal-id="${h(deal.id)}">
      <span class="cell-lead">${pipelineDot(dealStageColor(deal.stage))}<span><strong>${h(deal.name)}</strong><small>${h(accountName(deal.account_id) || 'No account')}</small></span></span>
      <span>${stageTagPipe('deals', deal.stage)}</span>
      <span>${dealStatusPill(deal.status)}</span>
      <span class="cell-mono">${money(deal.value)}</span>
      <span>${h(deal.owner_name || 'Unassigned')}</span>
      <span>${deal.close_date ? formatDate(deal.close_date) : '<span class="muted-dash">—</span>'}</span>
    </button>`;
}

function dealKpiRow(companyId) {
  const deals = companyDeals(companyId);
  const open = deals.filter((deal) => deal.status === 'open');
  const weighted = open.reduce((total, deal) => total + (deal.value * (deal.probability || 0)) / 100, 0);
  const won = deals.filter((deal) => deal.status === 'won');
  return `
    <section class="metric-grid crm-metrics">
      ${metricCard('Open quotes', open.length)}
      ${metricCard('Open value', money(sum(open, 'value')))}
      ${metricCard('Weighted', money(Math.round(weighted)))}
      ${metricCard('Won value', money(sum(won, 'value')))}
    </section>`;
}

function renderDealsPage(route, companyId) {
  const dealId = route.params.get('deal_id');
  if (dealId) {
    const deal = dealById(dealId);
    if (deal && deal.company_id === companyId) return renderDealDetail(companyId, deal);
  }
  const stageParam = route.params.get('stage');
  if (stageParam) state.stageFilterDeals = dealStageNames().includes(stageParam) ? stageParam : 'all';
  return `
    ${workspaceHeader('Quotes', 'Bottom-of-funnel estimates and contracts moving to won work.', `
      <button class="btn" type="button" data-action="open-stage-manager" data-module="deals"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-deal-form" data-mode="new"><i class="ti ti-plus"></i>New quote</button>
    `)}
    ${dealKpiRow(companyId)}
    <section class="pipe-toolbar deals-search-row">
      <label class="crm-search"><i class="ti ti-search"></i><input data-deal-search value="${h(state.dealQuery)}" placeholder="Search quotes" /></label>
    </section>
    ${pipelineToolbar('deals', companyId)}
    ${state.dealBoardView === 'board' ? renderDealBoard(companyId) : renderDealTable(companyId)}
  `;
}

function renderDealBoard(companyId) {
  const rows = filteredDeals(companyId, true);
  const filter = state.stageFilterDeals;
  const lanes = filter === 'all' ? dealStages() : dealStages().filter((stage) => stage.name === filter);
  return `
    <section class="pipe-board">
      ${lanes.map((stage) => {
        const cards = rows.filter((deal) => deal.stage === stage.name);
        return `
          <article class="pipe-lane">
            <header class="pipe-lane-head">${pipelineDot(stage.color)}<span>${h(stage.name)}</span><b>${cards.length}</b></header>
            <div class="pipe-lane-sub">${money(sum(cards, 'value'))}</div>
            <div class="pipe-lane-body">
              ${cards.map((deal) => dealCard(deal)).join('') || '<div class="lane-empty">No quotes</div>'}
            </div>
          </article>`;
      }).join('')}
    </section>`;
}

function dealCard(deal) {
  return `
    <button class="pipe-card ${deal.id === state.selectedDealId ? 'active' : ''}" type="button" data-action="open-deal" data-deal-id="${h(deal.id)}">
      <strong>${h(deal.name)}</strong>
      <span>${h(accountName(deal.account_id) || 'No account')}</span>
      <em>${money(deal.value)}${deal.probability ? ` · ${deal.probability}%` : ''}</em>
    </button>`;
}

function renderDealTable(companyId) {
  const rows = filteredDeals(companyId);
  return `
    <section class="panel">
      <div class="section-head"><div><h2>Quotes</h2><p>${rows.length} visible</p></div></div>
      <div class="data-table deals-table">
        <div class="table-head"><span>Quote</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
        ${rows.map((deal) => dealRow(deal)).join('') || emptyState('No quotes match this view.')}
      </div>
    </section>`;
}

function renderDealDetail(companyId, deal) {
  const account = accountById(deal.account_id);
  const contact = contactById(deal.primary_contact_id);
  const job = deal.job_id ? jobById(deal.job_id) : null;
  const stages = dealStages();
  const ci = stages.findIndex((s) => s.name === deal.stage);
  const g = guidanceForStage(deal.stage);
  const activeTab = state.dealActivityTab || 'Email';
  const feed = activitiesFor('deal', deal.id);
  const tasks = tasksForDeal(deal);
  const ed = (key, opts = {}) => {
    const display = (deal[key] === '' || deal[key] == null) ? '—' : deal[key];
    const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : ''].filter(Boolean).join(' ');
    return `<span class="${cls}" data-deal-edit="${h(key)}" data-deal-id="${h(deal.id)}" title="Click to edit">${h(String(display))}</span>`;
  };
  const fieldRow = (label, content) => `<div class="sf-field"><div class="sf-field-label">${h(label)}<i class="ti ti-pencil sf-pencil"></i></div><div class="sf-field-value">${content}</div></div>`;
  const headerActions = [['Follow', 'ti-plus'], ['New Task', 'ti-checkbox'], ['Log a Call', 'ti-phone'], ['New Estimate', 'ti-calculator'], ['Edit', 'ti-pencil']];
  const quickTiles = [['Task', 'ti-checkbox'], ['Meeting', 'ti-calendar'], ['Estimate', 'ti-calculator'], ['Proposal', 'ti-file-text'], ['Note', 'ti-note'], ['Call Log', 'ti-phone']];
  const activityTabs = [['Email', 'ti-mail'], ['New Task', 'ti-checkbox'], ['New Event', 'ti-calendar'], ['Log a Call', 'ti-phone']];
  return `
    <div class="sf-record">
      <div class="sf-object-tabs">
        <a class="sf-object-tab" href="${appHref(companyPath('home', {}, companyId))}" data-router>Home</a>
        <a class="sf-object-tab" href="${appHref(companyPath('deals', {}, companyId))}" data-router>All Quotes <span class="sf-tab-kind">| Quotes</span></a>
        <span class="sf-object-tab on">${h(deal.name)} <span class="sf-tab-kind">| Quote</span></span>
      </div>

      <div class="sf-record-head">
        <span class="sf-record-icon"><i class="ti ti-briefcase"></i></span>
        <div><div class="sf-record-label">Quote</div><div class="sf-record-name">${h(deal.name)}</div></div>
        <div class="sf-actions">
          ${headerActions.map(([label, ico]) => label === 'Edit'
            ? `<button class="sf-btn" type="button" data-action="open-deal-form" data-mode="edit" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i>${label}</button>`
            : `<button class="sf-btn" type="button" data-action="deal-quick" data-kind="${h(label)}" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}
        </div>
      </div>

      <div class="sf-path-wrap">
        <div class="sf-path-row">
          <div class="sf-stage-track">
            ${stages.map((s, i) => {
              const cls = i < ci ? 'done' : i === ci ? 'current' : 'future';
              return `<button class="sf-stage ${cls}" type="button" data-action="set-deal-stage" data-deal-id="${h(deal.id)}" data-stage="${h(s.name)}" title="Move to ${h(s.name)}">${i < ci ? '<i class="ti ti-check"></i>' : h(s.name)}</button>`;
            }).join('')}
          </div>
          <button class="sf-mark-btn" type="button" data-action="deal-mark-next" data-deal-id="${h(deal.id)}">Mark as Current Stage</button>
        </div>
        <div class="sf-guidance">
          <div class="sf-guidance-label">Guidance for Success</div>
          <div class="sf-guidance-title">${h(g.t)}</div>
          <div class="sf-guidance-lines">${g.b.map((x) => `<div>— ${h(x)}</div>`).join('')}</div>
        </div>
      </div>

      <div class="sf-three-col">
        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>About</div><div class="sf-card-body">
            ${fieldRow('Phone', contact?.phone ? h(contact.phone) : '<span class="muted-dash">—</span>')}
            ${fieldRow('Email', contact?.email ? `<span class="sf-edit blue">${h(contact.email)}</span>` : '<span class="muted-dash">—</span>')}
            ${fieldRow('Location', account?.address ? h(account.address) : '<span class="muted-dash">—</span>')}
            ${fieldRow('Job Type', `<span class="sf-pill">${h(deal.source || 'Re-roof')}</span>`)}
            ${fieldRow('Owner', ed('owner_name', { blue: true }))}
            ${fieldRow('Account', account ? `<button class="link-button" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(account.name)}</button>` : '<span class="muted-dash">—</span>')}
          </div></div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
            ${fieldRow('Funnel', '<span>Quotes (bottom of funnel)</span>')}
            ${fieldRow('Stage', `<span>${h(deal.stage)}</span>`)}
            ${fieldRow('Est. Value', `<span class="sf-money"><span class="sf-edit mono" data-deal-edit="value" data-deal-id="${h(deal.id)}" title="Click to edit">${money(deal.value || 0)}</span></span>`)}
            ${fieldRow('Probability', `<span class="sf-edit mono" data-deal-edit="probability" data-deal-id="${h(deal.id)}" title="Click to edit">${h(String(deal.probability || 0))}</span>%`)}
            ${fieldRow('Pay Type', `<span>${h(deal.status === 'won' ? 'Won' : 'Retail')}</span>`)}
            ${fieldRow('Linked Job', job ? `<a class="link-button" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>${h(job.name)}</a>` : '<span class="muted-dash">—</span>')}
          </div></div>
        </div>

        <div class="sf-col">
          <div class="sf-card">
            <div class="sf-activity-tabs">${activityTabs.map(([label, ico]) => `<button class="sf-activity-tab ${activeTab === label ? 'active' : ''}" type="button" data-action="deal-activity-tab" data-tab="${h(label)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}</div>
            <form class="sf-note-box" data-deal-note-form autocomplete="off">
              <input type="hidden" name="deal_id" value="${h(deal.id)}" />
              <input name="body" placeholder="Write a note or @mention..." />
              <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
            </form>
            <div class="sf-filters">Filters: Within 2 months · All activities · All types</div>
            <div class="sf-feed">
              ${feed.length ? feed.map((a) => sfFeedItem(a)).join('') : '<div class="sf-feed-empty">No activity yet. Log a note, call, or meeting.</div>'}
            </div>
          </div>
        </div>

        <div class="sf-col">
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
            <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => `<button class="sf-quick-tile" type="button" data-action="deal-quick" data-kind="${h(label)}" data-deal-id="${h(deal.id)}"><i class="ti ${ico}"></i><span>${label}</span></button>`).join('')}</div>
            <button class="sf-convert-btn" type="button" data-action="convert-deal" data-deal-id="${h(deal.id)}"><i class="ti ti-arrow-right"></i>Convert to Job</button>
          </div>
          <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
            <div class="sf-tasks">
              ${tasks.map((t) => `<div class="sf-task-row ${t.status === 'done' ? 'done' : ''}"><button class="sf-check" type="button" data-action="toggle-contact-task" data-task-id="${h(t.id)}" aria-label="Toggle task">${t.status === 'done' ? '<i class="ti ti-check"></i>' : ''}</button><span class="sf-task-title">${h(t.title)}</span>${t.due ? `<span class="sf-due">${h(formatDate(t.due))}</span>` : ''}</div>`).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
function blankDeal(companyId = activeCompanyId()) {
  const pf = state.dealPrefill || {};
  return normalizeDeal({ id: '', company_id: companyId, name: '', stage: pf.stage || dealStageNames()[0], account_id: pf.account_id || '', primary_contact_id: pf.primary_contact_id || '' });
}
function renderDealFormModal(companyId, deal) {
  return renderModalShell('Quotes', deal ? 'Edit quote' : 'New quote', renderDealEditor(companyId, deal), 'wide-modal');
}
function renderDealEditor(companyId, deal) {
  const edit = deal || blankDeal(companyId);
  const accounts = companyAccounts(companyId);
  const contacts = companyContacts(companyId);
  return `
    <form class="job-editor" data-deal-form>
      <input type="hidden" name="id" value="${h(edit.id || '')}" />
      <div class="section-head span-2"><div><h2>${deal ? 'Edit quote' : 'New quote'}</h2><p>A priced opportunity moving through the bottom-of-funnel quote path.</p></div></div>
      ${field('Quote name', 'name', edit.name, true)}
      ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
      ${selectField('Account', 'account_id', edit.account_id, [['', '— None —']].concat(accounts.map((account) => [account.id, account.name])))}
      ${selectField('Primary contact', 'primary_contact_id', edit.primary_contact_id, [['', '— None —']].concat(contacts.map((contact) => [contact.id, contact.name])))}
      ${selectField('Stage', 'stage', resolveDealStage(edit.stage), dealStageNames().map((stage) => [stage, stage]))}
      ${selectField('Status', 'status', edit.status, [['open', 'Open'], ['won', 'Won'], ['lost', 'Lost']])}
      ${field('Value', 'value', edit.value || 0, false, 'number')}
      ${field('Probability %', 'probability', edit.probability || 0, false, 'number')}
      ${field('Expected close', 'close_date', edit.close_date, false, 'date')}
      ${field('Owner', 'owner_name', edit.owner_name)}
      ${field('Source', 'source', edit.source)}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save quote</button>
        ${deal && deal.status !== 'won' ? `<button class="btn" type="button" data-action="convert-deal" data-deal-id="${h(deal.id)}"><i class="ti ti-briefcase"></i>Convert to job</button>` : ''}
        ${deal ? `<button class="btn danger" type="button" data-action="delete-deal" data-deal-id="${h(deal.id)}">Delete</button>` : ''}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`;
}

// ---- Activities (timeline) ------------------------------------------------
function activityIcon(type) {
  return { note: 'ti-note', call: 'ti-phone', email: 'ti-mail', meeting: 'ti-calendar-event', task: 'ti-checkbox', stage_change: 'ti-arrow-right-circle', system: 'ti-bolt' }[type] || 'ti-point';
}
function renderActivityTimeline(relatedType, relatedId, accountId = '', limit = 0) {
  let items = relatedType === 'account' ? activitiesForAccount(relatedId) : activitiesFor(relatedType, relatedId);
  if (limit) items = items.slice(0, limit);
  if (!items.length) return emptyState('No activity yet. Log a note, call, or meeting.');
  return `<ul class="activity-timeline">${items.map((activity) => `
    <li class="activity-item">
      <span class="activity-ico activity-${h(activity.type)}"><i class="ti ${activityIcon(activity.type)}"></i></span>
      <div class="activity-main">
        <div class="activity-top"><strong>${h(activity.subject || titleCase(activity.type))}</strong><span class="activity-meta">${activity.owner_name ? h(activity.owner_name) + ' · ' : ''}${h(timeAgo(activity.completed_at || activity.created_at))}</span></div>
        ${activity.body ? `<p>${h(activity.body)}</p>` : ''}
      </div>
      <button class="activity-del" type="button" data-action="delete-activity" data-activity-id="${h(activity.id)}" aria-label="Delete activity"><i class="ti ti-x"></i></button>
    </li>`).join('')}</ul>`;
}
function renderActivityFormModal(companyId) {
  const pf = state.activityPrefill || {};
  return renderModalShell('Activity', 'Log activity', `
    <form class="job-editor" data-activity-form>
      <input type="hidden" name="related_type" value="${h(pf.related_type || '')}" />
      <input type="hidden" name="related_id" value="${h(pf.related_id || '')}" />
      <input type="hidden" name="account_id" value="${h(pf.account_id || '')}" />
      <div class="section-head span-2"><div><h2>Log activity</h2><p>Capture a note, call, email, or meeting.</p></div></div>
      ${selectField('Type', 'type', pf.type || 'note', [['note', 'Note'], ['call', 'Call'], ['email', 'Email'], ['meeting', 'Meeting'], ['task', 'Task']])}
      ${field('Subject', 'subject', '', false, 'text', 'span-2')}
      ${textareaField('Details', 'body', '', 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save activity</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`, 'wide-modal');
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
        ${can('files.view', companyId) ? metricCard('Files', account.fileCount) : ''}
        ${can('forms.view', companyId) ? metricCard('Forms', account.formCount) : ''}
        ${metricCard('Tasks', account.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${latestJob ? `<a class="btn btn-primary" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-briefcase"></i>Open job</a>` : ''}
        ${latestJob ? `<a class="btn" href="${appHref(companyPath('tasks', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-list-check"></i>Tasks</a>` : ''}
        ${latestJob && can('files.view', companyId) ? `<a class="btn" href="${appHref(companyPath('files', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-folder"></i>Files</a>` : ''}
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
            <div class="messenger-list-head">
              <div><h2>Chats</h2><p>${h(String(conversations.length))} conversations</p></div>
              <div>
                <button class="icon-button" type="button" data-action="new-message-group" title="New group"><i class="ti ti-message-plus"></i></button>
                <button class="icon-button" type="button" data-action="new-direct-message" title="Direct message"><i class="ti ti-user-plus"></i></button>
              </div>
            </div>
            <div class="message-list-top">
              <label class="message-search-field">
                <i class="ti ti-search"></i>
                <input data-message-search value="${h(state.messageQuery)}" placeholder="Find chats or messages" />
              </label>
              <button class="btn btn-compact" type="button" data-action="message-search-results"><i class="ti ti-adjustments-horizontal"></i>Filter</button>
            </div>
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
        <section class="messages-thread-panel panel">
          ${selected ? renderMessageThread(companyId, selected) : renderNoConversationState(companyId)}
        </section>
        ${selected ? renderMessageDetailsRail(companyId, selected) : ''}
      </section>
      ${state.session?.auth === 'local-basic' ? renderMessageScenarioButton(companyId) : ''}
    </section>
  `;
}

function renderConversationRow(conversation, companyId, active) {
  const last = conversationMessages(conversation.id).at(-1);
  const unread = conversationUnreadCount(conversation.id);
  const sender = last ? messageSenderProfile(last.sender_profile_id) : null;
  const attachments = conversationAttachments(conversation.id).length;
  const initials = messageWorkspaceInitials(conversation, companyId);
  return `
    <a class="conversation-row ${active ? 'active' : ''}" href="${appHref(companyPath('messages', { conversation: conversation.id }, companyId))}" data-router>
      <span class="conversation-unread-dot ${unread ? 'active' : ''}"></span>
      ${renderAvatar(sender || { full_name: conversation.title }, 'avatar conversation-avatar')}
      <span class="message-workspace-chip">${h(initials)}</span>
      <span class="conversation-copy">
        <strong>${h(conversation.title)}</strong>
        <small>${h(messageConversationPreview(last, conversation))}</small>
      </span>
      <span class="conversation-meta">
        <em>${last ? timeAgo(last.created_at) : ''}</em>
        ${attachments ? `<small><i class="ti ti-paperclip"></i>${attachments}</small>` : ''}
      </span>
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

function renderMessageContextRail(companyId, conversation) {
  return `
    <aside class="message-context-rail messages-thread-panel">
      <section class="message-preview-card panel">
        ${renderMessageThread(companyId, conversation)}
      </section>
      ${renderChatAccessCard(companyId, conversation)}
      ${renderSharedFilesCard(conversation)}
      ${renderMessageActionItemsCard(companyId, conversation)}
    </aside>
  `;
}

function renderMessageDetailsRail(companyId, conversation) {
  return `
    <aside class="message-details-rail">
      <section class="messenger-profile-card panel">
        ${renderAvatar({ full_name: conversation.title }, 'avatar messenger-profile-avatar')}
        <h3>${h(conversation.title)}</h3>
        <p>${h(accessSummary(conversation))}</p>
        <div class="messenger-profile-actions">
          <button class="icon-button" type="button" data-action="message-search-results" title="Search chat"><i class="ti ti-search"></i></button>
          <button class="icon-button" type="button" data-action="message-details" data-conversation-id="${h(conversation.id)}" title="Chat details"><i class="ti ti-info-circle"></i></button>
          <button class="icon-button" type="button" data-action="manage-message-chat" data-conversation-id="${h(conversation.id)}" title="Manage access" ${can('messages.manage_groups', companyId) || can('messages.manage', companyId) ? '' : 'disabled'}><i class="ti ti-users"></i></button>
        </div>
      </section>
      ${renderChatAccessCard(companyId, conversation)}
      ${renderSharedFilesCard(conversation)}
      ${renderMessageActionItemsCard(companyId, conversation)}
    </aside>
  `;
}

function renderChatAccessCard(companyId, conversation) {
  const members = conversationParticipants(conversation).slice(0, 6);
  return `
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Chat access</h3><p>Members (${conversationParticipants(conversation).length || 'company'})</p></div>
        <button class="link-button" type="button" data-action="manage-message-chat" data-conversation-id="${h(conversation.id)}" ${can('messages.manage_groups', companyId) || can('messages.manage', companyId) ? '' : 'disabled'}>Manage</button>
      </div>
      <div class="message-member-stack">
        ${members.map((profile) => renderAvatar(profile, 'avatar mini-avatar')).join('')}
        ${conversationParticipants(conversation).length > members.length ? `<span class="member-more">+${conversationParticipants(conversation).length - members.length}</span>` : ''}
      </div>
    </section>
  `;
}

function renderSharedFilesCard(conversation) {
  const files = conversationAttachments(conversation.id).slice(-4).reverse();
  return `
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Shared files</h3><p>${files.length ? `${files.length} recent` : 'No files yet'}</p></div>
        <button class="link-button" type="button" data-action="message-details" data-conversation-id="${h(conversation.id)}">View all</button>
      </div>
      <div class="shared-file-list">
        ${files.map((file) => `
          <button class="shared-file-row" type="button" data-action="open-message-attachment" data-attachment-id="${h(file.id)}">
            <span><i class="ti ${h(file.mime_type.startsWith('image/') ? 'ti-photo' : 'ti-file-text')}"></i></span>
            <strong>${h(file.file_name)}</strong>
            <small>${h(fileSize(file.size_bytes))}</small>
          </button>
        `).join('') || emptyState('No shared files yet.')}
      </div>
    </section>
  `;
}

function renderMessageActionItemsCard(companyId, conversation) {
  const tasks = companyTasks(companyId)
    .filter((task) => ['todo', 'pending', 'review', 'hold'].includes(task.status))
    .slice(0, 3);
  return `
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Action items</h3><p>From this conversation</p></div>
        <a class="link-button" href="${appHref(companyPath('tasks', {}, companyId))}" data-router>View all</a>
      </div>
      <div class="message-action-list">
        ${tasks.map((task) => `
          <a class="message-action-row" href="${appHref(companyPath('tasks', { task_id: task.id }, companyId))}" data-router>
            <span></span>
            <strong>${h(task.title)}</strong>
            <small>${h(profileName(task.assignee_id)) || 'Unassigned'} · ${h(formatDate(task.due))}</small>
          </a>
        `).join('') || emptyState('No action items linked yet.')}
      </div>
    </section>
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
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${can('messages.attach_files', conversation.company_id) ? '' : 'disabled'} />
      </label>
      <input name="body" placeholder="Message ${h(conversation.title)}" autocomplete="off" />
      <button class="icon-button btn-primary" type="submit" title="Send"><i class="ti ti-send"></i></button>
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

function messageKpiCard(icon, label, value, detail) {
  return `
    <article class="message-kpi-card">
      <span><i class="ti ${h(icon)}"></i>${h(label)}</span>
      <strong>${h(String(value))}</strong>
      <small>${h(detail)}</small>
    </article>
  `;
}

function messageInboxStats(companyId, conversations) {
  const allMessages = conversations.flatMap((conversation) => conversationMessages(conversation.id));
  const unread = conversations.reduce((sum, conversation) => sum + conversationUnreadCount(conversation.id), 0);
  const mentions = allMessages.filter((message) => message.body.includes(`@${activeSession().profile.full_name?.split(/\s+/)[0] || ''}`)).length;
  const files = conversations.reduce((sum, conversation) => sum + conversationAttachments(conversation.id).length, 0);
  const waiting = companyTasks(companyId).filter((task) => ['todo', 'pending', 'review', 'hold'].includes(task.status)).length;
  const groups = conversations.filter((conversation) => conversation.type !== 'direct').length;
  return {
    unread,
    mentions,
    files,
    waiting,
    groups,
    unreadDelta: unread ? '+2 since yesterday' : 'All caught up',
    mentionsDelta: mentions ? '+1 since yesterday' : 'No new mentions',
    filesDelta: files ? '+2 since yesterday' : 'No files shared',
    waitingDelta: waiting ? `${waiting} active items` : 'Nothing waiting',
  };
}

function messageWorkspaceInitials(conversation, companyId) {
  const name = companyName(conversation.company_id || companyId);
  return String(name || 'QH').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'QH';
}

function messageConversationPreview(last, conversation) {
  if (!last) return accessSummary(conversation) || 'No messages yet';
  const sender = profileName(last.sender_profile_id);
  const prefix = sender ? `${sender}: ` : '';
  return `${prefix}${last.body || (messageAttachments(last.id).length ? 'Shared an attachment' : 'Sent a message')}`;
}

function conversationParticipants(conversation) {
  const ids = conversationNotificationRecipients(conversation);
  return ids.map((id) => messageSenderProfile(id));
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
  const canManageFinance = can('finance.manage', companyId);
  return `
    <section class="tool-page finance-page">
      ${workspaceHeader('Finance', 'Invoices, payments, expenses, vendors, and job-linked money in one company view.', `
        ${canManageFinance ? `
          <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
          <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
          <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        ` : ''}
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
      ${!canManageFinance ? `<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>` : ''}
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
        ${can('finance.manage', companyId) ? `
          <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${h(invoice.id)}"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${h(invoice.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ` : ''}
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
        ${can('finance.manage', companyId) ? `<button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${h(expense.id)}"><i class="ti ti-pencil"></i>Edit expense</button>` : ''}
        ${job && can('files.view', companyId) ? `<a class="btn" href="${appHref(companyPath('files', { job_id: job.id }, companyId))}" data-router><i class="ti ti-folder"></i>Job files</a>` : ''}
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
        ${can('finance.manage', companyId) ? `
          <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${h(vendor.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
          <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${h(vendor.id)}"><i class="ti ti-receipt"></i>Add expense</button>
        ` : ''}
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
  if (route.section === 'calendar') return renderCalendarPage(route, companyId);
  if (route.section === 'approvals') return renderApprovalsPage(companyId);
  return renderTimePage(companyId);
}

function renderOperationsTabs(companyId, active) {
  const tabs = [
    can('time.track', companyId) ? [companyPath('time', {}, companyId), 'My time', active === 'time'] : null,
    can('calendar.view', companyId) ? [companyPath('calendar', {}, companyId), 'Calendar', active === 'calendar'] : null,
    can('approvals.view', companyId) ? [companyPath('approvals', {}, companyId), 'Approvals', active === 'approvals'] : null,
    can('clock.manage', companyId) ? [companyPath('clock', {}, companyId), 'Clock dashboard', active === 'clock'] : null,
  ].filter(Boolean);
  return `
    ${tabs.length > 1 ? compactTabs('Operations sections', tabs) : ''}
  `;
}

function renderCalendarPage(route, companyId) {
  const items = filteredCalendarItems(companyId);
  const allItems = calendarItems(companyId);
  const todayItems = items.filter((item) => item.dateKey === isoDate(0));
  const mineItems = allItems.filter((item) => item.mine);
  const sourceCount = allItems.filter((item) => item.source !== 'manual').length;
  const canCreate = can('calendar.manage', companyId);
  return `
    <section class="tool-page operations-page calendar-page">
      ${workspaceHeader('Calendar', 'Company schedule built from tasks, approvals, finance due dates, time context, and manual events.', `
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${renderOperationsTabs(companyId, 'calendar')}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${metricCard('Today', todayItems.length)}
        ${metricCard('This week', calendarItemsThisWeek(items).length)}
        ${metricCard('Mine', mineItems.length)}
        ${metricCard('From modules', sourceCount)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${state.calendarScope === 'company' ? 'active' : ''}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${state.calendarScope === 'me' ? 'active' : ''}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${['month', 'week', 'list'].map((view) => `<button class="${state.calendarView === view ? 'active' : ''}" type="button" data-action="set-calendar-view" data-view="${h(view)}">${h(titleCase(view))}</button>`).join('')}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${h(state.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${CALENDAR_FILTER_TYPES.map((type) => `<option value="${h(type)}" ${state.calendarTypeFilter === type ? 'selected' : ''}>${h(type)}</option>`).join('')}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${h(calendarRangeLabel())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${state.calendarView === 'month' ? renderCalendarMonth(companyId, items) : ''}
          ${state.calendarView === 'week' ? renderCalendarWeek(companyId, items) : ''}
          ${state.calendarView === 'list' ? renderCalendarList(companyId, items) : ''}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${items.slice(0, 9).map(renderCalendarAgendaItem).join('') || emptyState('No calendar items match this view.')}
          </div>
        </aside>
      </section>
      ${!canCreate ? `<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>` : ''}
    </section>
  `;
}

function renderCalendarMonth(companyId, items) {
  const days = calendarMonthDays(state.calendarCursorDate);
  const currentMonth = new Date(`${state.calendarCursorDate}T00:00:00`).getMonth();
  return `
    <div class="calendar-grid calendar-month-grid">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="calendar-weekday">${day}</div>`).join('')}
      ${days.map((day) => {
        const dayItems = calendarItemsForDate(items, day.key);
        return `
          <div class="calendar-day ${day.month === currentMonth ? '' : 'muted'} ${day.key === isoDate(0) ? 'today' : ''}">
            <div class="calendar-day-head"><b>${day.label}</b><span>${dayItems.length || ''}</span></div>
            ${dayItems.slice(0, 3).map(renderCalendarPill).join('')}
            ${dayItems.length > 3 ? `<small class="calendar-more">+${dayItems.length - 3} more</small>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCalendarWeek(companyId, items) {
  const days = calendarWeekDays(state.calendarCursorDate);
  return `
    <div class="calendar-grid calendar-week-grid">
      ${days.map((day) => {
        const dayItems = calendarItemsForDate(items, day.key);
        return `
          <div class="calendar-day ${day.key === isoDate(0) ? 'today' : ''}">
            <div class="calendar-day-head"><b>${h(day.name)}</b><span>${h(day.shortDate)}</span></div>
            ${dayItems.map(renderCalendarPill).join('') || '<small class="calendar-empty-day">Open</small>'}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCalendarList(companyId, items) {
  const groups = groupByDate(items);
  const entries = Object.entries(groups).slice(0, 18);
  return `
    <div class="calendar-list">
      ${entries.map(([dateKey, dateItems]) => `
        <section class="calendar-list-day">
          <h3>${h(formatDate(dateKey))}</h3>
          ${dateItems.map(renderCalendarAgendaItem).join('')}
        </section>
      `).join('') || emptyState('No scheduled work or events.')}
    </div>
  `;
}

function renderCalendarPill(item) {
  return `
    <button class="calendar-pill ${h(calendarTypeClass(item.type))}" type="button" data-action="open-calendar-event" data-event-id="${h(item.id)}">
      <span>${h(calendarTimeLabel(item))}</span>
      <strong>${h(item.title)}</strong>
    </button>
  `;
}

function renderCalendarAgendaItem(item) {
  return `
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${h(item.id)}">
      <i class="ti ${h(calendarTypeIcon(item.type))}"></i>
      <span><strong>${h(item.title)}</strong><small>${h(`${formatDate(item.dateKey)} · ${calendarTimeLabel(item)} · ${item.type}`)}</small></span>
    </button>
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

function renderLandingPage(forceAuthModal = false) {
  document.title = 'Quest HQ | Company operations workspace';
  const route = state.route || getRoute();
  const returnUrl = safeReturnUrl(route.params.get('return_url') || appHref(companyPath('jobs', {}, defaultCompanyId())));
  const authEnabled = CONFIG.questAuthEnabled;
  const inviteToken = String(route.params.get('invite') || '').trim();
  const authParam = String(route.params.get('auth') || '').trim();
  const requestedMode = normalizeAuthMode(route.params.get('mode') || authParam, inviteToken);
  if (requestedMode && state.authMode !== requestedMode) state.authMode = requestedMode;
  if (inviteToken && !['signin', 'register'].includes(state.authMode)) state.authMode = 'register';
  const showAuthModal = forceAuthModal || Boolean(inviteToken || authParam);
  const session = state.session;
  app.innerHTML = `
    <main class="landing-shell">
      <nav class="landing-nav">
        <a class="login-brand landing-brand" href="${appHref('/')}" data-router>
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Workplace Center</small></span>
        </a>
        <div class="landing-nav-links" aria-label="Landing navigation">
          ${[
            ['Why Quest HQ', 'why-quest-hq'],
            ['Security', 'security'],
            ['Platform', 'platform'],
            ['Access', 'platform'],
            ['Company', 'why-quest-hq'],
          ].map(([item, target]) => `<a href="#${h(target)}">${h(item)}</a>`).join('')}
        </div>
        <div class="landing-nav-actions">
          ${session ? `<a class="btn" href="${appHref(companyPath('jobs', {}, activeCompanyId()))}" data-router>Open workspace</a>` : ''}
          <button class="btn landing-login-btn" type="button" data-action="open-auth-modal" data-auth-mode="signin"><i class="ti ti-lock"></i>Business login</button>
        </div>
      </nav>
      <section class="landing-hero">
        <div class="landing-hero-bg" aria-hidden="true"></div>
        <div class="landing-hero-copy">
          <div class="landing-pill"><i class="ti ti-shield-lock"></i>Secure. Controlled. Built for business.</div>
          <h1>Run your entire company workspace from one secure command center</h1>
          <p>Quest HQ brings your teams, projects, files, messages, finance, and customer follow-ups into one place with invite-only access and clear role controls.</p>
          <div class="landing-hero-actions">
            <button class="btn btn-primary" type="button" data-action="open-auth-modal" data-auth-mode="register">Start business workspace<i class="ti ti-arrow-right"></i></button>
            <button class="btn landing-ghost-btn" type="button" data-action="open-auth-modal" data-auth-mode="invite"><i class="ti ti-users-plus"></i>Join by invite</button>
          </div>
          <div class="landing-security-line"><i class="ti ti-circle-check"></i>Invite-only workspaces <i class="ti ti-circle-check"></i>Role-based access <i class="ti ti-circle-check"></i>Audit every action</div>
        </div>
        <div class="landing-console" aria-label="Quest HQ workspace command center preview">
          <img class="landing-console-art" src="${h(cockpitArtUrl)}" alt="Generated Quest HQ secure workspace cockpit preview showing company access, tasks, messages, finance, files, users, reports, and audit controls." />
          <aside class="landing-console-rail" aria-hidden="true">
            <span class="console-mark">Q</span>
            ${[
              ['ti-home', 'Home', true],
              ['ti-list-check', 'Tasks'],
              ['ti-calendar', 'Calendar'],
              ['ti-users', 'CRM'],
              ['ti-lock-dollar', 'Finance'],
              ['ti-folder', 'Files'],
              ['ti-forms', 'Forms'],
              ['ti-message-circle', 'Messages', false, '3'],
              ['ti-user-cog', 'Users'],
              ['ti-report-analytics', 'Reports'],
              ['ti-settings', 'Settings'],
              ['ti-clipboard-check', 'Audit'],
            ].map(([icon, label, active, badge]) => `
              <span class="${active ? 'active' : ''}"><i class="ti ${h(icon)}"></i><em>${h(label)}</em>${badge ? `<b>${h(badge)}</b>` : ''}</span>
            `).join('')}
          </aside>
          <div class="landing-console-main">
            <div class="landing-console-top">
              <div>
                <strong>Good morning, Quest Admin</strong>
                <span>Here is what is happening across your workspace.</span>
              </div>
              <button type="button"><i class="ti ti-building"></i>Acme Global<i class="ti ti-chevron-down"></i></button>
              <span class="landing-avatar">QA</span>
            </div>
            <div class="landing-console-stats">
              ${[
                ['ti-shield-check', 'Company access', 'Pending approval', 'Approval required before modules open.', 'View status'],
                ['ti-user-check', 'Active users', '24', '18 active · 6 pending', 'Manage users'],
                ['ti-circle-check', 'Open tasks', '42', '12 overdue', 'View tasks'],
                ['ti-message-circle', 'Unread messages', '8', 'Across team chats', 'Open inbox'],
              ].map(([icon, label, value, body, action], index) => `
                <article class="${index === 0 ? 'warning' : ''}">
                  <i class="ti ${h(icon)}"></i>
                  <span>${h(label)}</span>
                  <strong>${h(value)}</strong>
                  <small>${h(body)}</small>
                  <button type="button">${h(action)}</button>
                </article>
              `).join('')}
            </div>
            <div class="landing-console-grid">
              <article class="landing-activity">
                <strong>Recent activity</strong>
                ${[
                  ['ti-file-dollar', 'Invoice #INV-1024 was created', 'Finance', '10m ago'],
                  ['ti-forms', 'Shan submitted a form response', 'Forms', '25m ago'],
                  ['ti-alert-circle', 'Leak inspection task was assigned', 'Tasks', '1h ago'],
                  ['ti-file-upload', 'Permit packet.pdf was uploaded', 'Files', '2h ago'],
                  ['ti-user-plus', 'Abraham joined the workspace', 'Users', '3h ago'],
                ].map(([icon, title, label, time]) => `
                  <div><i class="ti ${h(icon)}"></i><span><b>${h(title)}</b><small>${h(label)}</small></span><em>${h(time)}</em></div>
                `).join('')}
              </article>
              <article class="landing-health">
                <strong>Workspace health</strong>
                ${[
                  ['ti-circle-check', 'Company created', 'ok'],
                  ['ti-clock', 'Pending approval', 'wait'],
                  ['ti-link', 'Billing connected', 'muted'],
                  ['ti-shield-lock', 'Payment active', 'muted'],
                  ['ti-users', 'Full access enabled', 'muted'],
                ].map(([icon, label, tone]) => `<div class="${h(tone)}"><i class="ti ${h(icon)}"></i>${h(label)}</div>`).join('')}
                <span class="landing-watermark">Q</span>
              </article>
            </div>
            <div class="landing-quick-access">
              ${[
                ['ti-folder', 'Files'],
                ['ti-users', 'CRM'],
                ['ti-currency-dollar', 'Finance'],
                ['ti-calendar', 'Calendar'],
                ['ti-user-cog', 'Users'],
                ['ti-clipboard-check', 'Audit'],
              ].map(([icon, label]) => `<span><i class="ti ${h(icon)}"></i>${h(label)}</span>`).join('')}
            </div>
          </div>
        </div>
      </section>
      <section class="landing-command-panels" id="security">
        <article class="landing-trust-card">
          <div>
            <div class="eyebrow">Trusted & secure</div>
            <p>Every workspace is isolated. You stay in control of who can see what.</p>
          </div>
          <div class="landing-trust-grid">
            ${[
              ['ti-shield-check', 'SOC 2', 'Type II path'],
              ['ti-lock', 'AES-256', 'Encryption'],
              ['ti-database-lock', 'RLS', 'Row-level security'],
              ['ti-clock-check', '99.9%', 'Uptime target'],
              ['ti-clipboard-list', 'Audit', 'Every action'],
              ['ti-key', 'Private', 'By default'],
            ].map(([icon, title, body]) => `<span><i class="ti ${h(icon)}"></i><strong>${h(title)}</strong><small>${h(body)}</small></span>`).join('')}
          </div>
          <small class="landing-boundary"><i class="ti ti-lock"></i>Your data never leaves your company boundary.</small>
        </article>
        <article class="landing-access-card" id="platform">
          <div class="landing-access-head">
            <div class="eyebrow">Access model</div>
            <p>The right access for the right people. No shortcuts. No guesswork.</p>
          </div>
          <div class="landing-role-flow">
            ${[
              ['ti-crown', 'Owner', 'Full access · Billing · Invites · Transfer ownership'],
              ['ti-user-shield', 'Admin', 'Manage users · Roles · Module access'],
              ['ti-user', 'Worker', 'Assigned access · Own tasks · Team collaboration'],
              ['ti-shield-x', 'Finance denied', 'Finance hidden · No billing · No payments'],
              ['ti-hourglass', 'Pending approval', 'Workspace created · Modules locked'],
            ].map(([icon, title, body], index) => `
              <div class="${index === 4 ? 'pending' : ''}">
                <i class="ti ${h(icon)}"></i>
                <strong>${h(title)}</strong>
                <span>${h(body)}</span>
              </div>
            `).join('')}
          </div>
        </article>
      </section>
      <section class="landing-proof" id="why-quest-hq">
        ${[
          ['ti-cube', 'One workspace', 'Everything connected'],
          ['ti-user-shield', 'Role-based access', 'Built-in guardrails'],
          ['ti-calendar-user', 'Company control', 'You decide who sees what'],
          ['ti-shield-check', 'Audit & accountability', 'Every action tracked'],
          ['ti-chart-arrows', 'Scale with confidence', 'Built for growth'],
        ].map(([icon, title, body]) => `
          <article>
            <i class="ti ${h(icon)}"></i>
            <span><strong>${h(title)}</strong><small>${h(body)}</small></span>
          </article>
        `).join('')}
        <blockquote>"Quest HQ lets our team work from one clean place without giving everyone access to everything."</blockquote>
      </section>
      ${showAuthModal ? renderAuthModal(returnUrl, inviteToken, authEnabled) : ''}
      ${renderToast()}
    </main>
  `;
}

function renderAuthModal(returnUrl, inviteToken, authEnabled) {
  const inviteLookup = inviteLookupForToken(inviteToken);
  return `
    <div class="modal-overlay">
      <div class="modal-panel landing-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div class="modal-head landing-auth-head">
          <div>
            <div class="eyebrow">${authEnabled ? 'Tenant access' : 'Local access'}</div>
            <h2 id="auth-modal-title">${inviteToken ? 'Join workspace' : 'Quest HQ'}</h2>
          </div>
          <button class="btn" type="button" data-action="close-auth-modal">Close</button>
        </div>
        <div class="landing-auth-body">
          <div class="auth-modal-note">${authEnabled ? 'Owners create workspaces. Workers join by invite.' : 'Supabase auth is switched off while the company workspace foundation is stabilized.'}</div>
          ${inviteToken ? `
            <div class="invite-banner">
              <strong>${inviteLookup ? `Invite found for ${h(inviteLookup.company_name || 'workspace')}` : 'Workspace invite'}</strong>
              <span>${inviteLookup ? `${h(inviteLookup.email)} can create an account or sign in to join.` : 'Create an account with the invited email, or sign in if that email already has a Quest HQ account.'}</span>
            </div>
          ` : ''}
          ${authEnabled ? `
            ${renderAuthLanePicker(inviteToken)}
            ${renderSupabaseAuthForm(returnUrl)}
          ` : ''}
          ${renderDemoModeLauncher(returnUrl)}
          ${CONFIG.localLoginEnabled && authEnabled ? `
            <details class="demo-login-details">
              <summary>Legacy demo credentials</summary>
              ${renderLocalLoginForm(returnUrl)}
            </details>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function normalizeAuthMode(value, inviteToken = '') {
  const mode = String(value || '').toLowerCase().trim();
  if (inviteToken && !mode) return 'register';
  if (['signin', 'register', 'invite', 'request'].includes(mode)) return mode;
  if (mode === 'business') return 'register';
  if (mode === 'worker') return inviteToken ? 'register' : 'invite';
  return '';
}

function renderAuthLanePicker(inviteToken = '') {
  const active = state.authMode;
  const options = inviteToken
    ? [
      ['signin', 'Sign in'],
      ['register', 'Create invited account'],
    ]
    : [
      ['signin', 'Sign in'],
      ['register', 'Create workspace'],
      ['invite', 'Join with invite'],
    ];
  return `
    <nav class="auth-mode-bar" aria-label="Account access">
      ${options.map(([mode, label]) => `
        <button class="${active === mode ? 'active' : ''}" type="button" data-action="set-auth-mode" data-auth-mode="${h(mode)}">${h(label)}</button>
      `).join('')}
    </nav>
  `;
}

function renderDemoModeLauncher(returnUrl) {
  if (!CONFIG.demoModeEnabled) return '';
  return `
    <details class="demo-mode-details">
      <summary>Demo mode</summary>
      <section class="demo-mode-box">
        <div>
          <strong>Read-only sample workspace</strong>
          <span>Explore sample contacts, quotes, jobs, files, forms, approvals, and billing without saving changes.</span>
        </div>
        <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${h(returnUrl)}">Open read-only demo</button>
      </section>
    </details>
  `;
}

function renderSupabaseAuthForm(returnUrl) {
  const inviteToken = String(state.route?.params?.get('invite') || '').trim();
  if (state.authMode === 'register') {
    return `
      <form class="auth-form-compact" data-auth-register-form>
        <div class="auth-form-title">
          <strong>${inviteToken ? 'Create invited worker account' : 'Create business workspace'}</strong>
          <span>${inviteToken ? 'Email must match the invite.' : 'Workspace opens after Quest approval.'}</span>
        </div>
        <label>${inviteToken ? 'Display name / username' : 'Full name'}<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        ${inviteToken ? '' : `<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>${workspacePresetSelect()}`}
        <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        <button class="btn btn-primary full" type="submit">${inviteToken ? 'Create account and join' : 'Create secure workspace'}</button>
        ${authStatusMessage(inviteToken ? 'Workers cannot create access without a valid invite code.' : 'You become Owner, then Quest approves billing/access before the workspace opens.')}
        ${inviteToken ? '<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">I already have an account</button>' : ''}
      </form>
    `;
  }
  if (state.authMode === 'invite') {
    return `
      <form class="auth-form-compact" data-auth-invite-code-form>
        <div class="auth-form-title">
          <strong>Join with invite code</strong>
          <span>Workers need a code from their company admin.</span>
        </div>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${authStatusMessage('Invite codes are shared by your Owner/Admin. No email delivery required.')}
      </form>
    `;
  }
  if (state.authMode === 'request') {
    return `
      <form class="auth-form-compact" data-auth-request-form>
        <div class="auth-form-title">
          <strong>Request access</strong>
          <span>This is for existing accounts only. New workers should use an admin invite.</span>
        </div>
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
    <form class="auth-form-compact" data-auth-sign-in-form>
      <div class="auth-form-title">
        <strong>${inviteToken ? 'Sign in and accept invite' : 'Sign in'}</strong>
        <span>${inviteToken ? 'Use the invited email account.' : 'Use your company account.'}</span>
      </div>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
      <input type="hidden" name="return_url" value="${h(returnUrl)}" />
      <button class="btn btn-primary full" type="submit">${inviteToken ? 'Sign in and join' : 'Sign in'}</button>
      ${authStatusMessage(inviteToken ? 'If you do not have an account yet, create an invited worker account.' : 'Business owners and workers use the same sign in after access is created.')}
      ${inviteToken ? '<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>' : ''}
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
      ${state.loginError ? `<div class="form-message error">${h(state.loginError)}</div>` : `<div class="form-message">Use the configured local demo credentials.</div>`}
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
            ${renderAvatar(profile, 'avatar large', { id: 'profile-avatar-preview' })}
            <div><strong>${h(profile.full_name)}</strong><span>${h(profile.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${h(profile.full_name)}" /></label>
          <input type="hidden" name="avatar_url" value="${h(profile.avatar_url || '')}" />
          <input type="hidden" name="avatar_cropped_url" value="" data-profile-cropped-avatar />
          <label class="profile-upload-field">
            <span>Profile picture</span>
            <input name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp" data-profile-avatar-file />
            <small>PNG, JPG, or WebP. Live accounts support up to 2 MB.</small>
          </label>
          <section class="profile-cropper" data-profile-cropper hidden>
            <div class="profile-crop-frame">
              <canvas width="256" height="256" data-profile-crop-canvas aria-label="Profile picture crop preview"></canvas>
            </div>
            <div class="profile-crop-controls">
              <label>Zoom<input type="range" min="1" max="3" step="0.01" value="1" data-profile-crop-zoom /></label>
              <label>Horizontal<input type="range" min="-100" max="100" step="1" value="0" data-profile-crop-x /></label>
              <label>Vertical<input type="range" min="-100" max="100" step="1" value="0" data-profile-crop-y /></label>
            </div>
          </section>
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
  if (state.modal === 'contact-new') return renderContactFormModal(activeCompanyId(), null);
  if (state.modal === 'contact-edit') return renderContactFormModal(activeCompanyId(), selectedContact());
  if (state.modal === 'account-new') return renderAccountFormModal(activeCompanyId(), null);
  if (state.modal === 'account-edit') return renderAccountFormModal(activeCompanyId(), selectedAccount());
  if (state.modal === 'deal-new') return renderDealFormModal(activeCompanyId(), null);
  if (state.modal === 'deal-edit') return renderDealFormModal(activeCompanyId(), selectedDeal());
  if (state.modal === 'activity-new') return renderActivityFormModal(activeCompanyId());
  if (state.modal === 'stages-jobs') return renderStageManagerModal('jobs');
  if (state.modal === 'stages-contacts') return renderStageManagerModal('contacts');
  if (state.modal === 'stages-deals') return renderStageManagerModal('deals');
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
  if (state.modal === 'calendar-event-detail') return renderCalendarEventDetailModal(activeCompanyId());
  if (state.modal === 'calendar-event-new') return renderCalendarEventFormModal(activeCompanyId(), null);
  if (state.modal === 'calendar-event-edit') return renderCalendarEventFormModal(activeCompanyId(), manualCalendarEventById(state.selectedCalendarEventId));
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

function renderCalendarEventDetailModal(companyId) {
  const item = calendarEventByKey(state.selectedCalendarEventId, companyId);
  if (!item) return '';
  const manual = item.source === 'manual' ? manualCalendarEventById(item.sourceId) : null;
  const actions = [
    item.href ? `<a class="btn btn-primary" href="${appHref(item.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>` : '',
    manual && item.editable ? `<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${h(manual.id)}"><i class="ti ti-pencil"></i>Edit</button>` : '',
    manual && item.editable ? `<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${h(manual.id)}"><i class="ti ti-trash"></i>Delete</button>` : '',
  ].filter(Boolean).join('');
  return renderModalShell('Calendar', item.title, `
    <div class="calendar-detail">
      ${contractRows([
        ['Type', item.type],
        ['When', item.allDay ? formatDate(item.dateKey) : `${formatDateTime(item.startsAt)}${item.endsAt && item.endsAt !== item.startsAt ? ` - ${formatDateTime(item.endsAt)}` : ''}`],
        ['Assigned', item.owner || 'Unassigned'],
        ['Source', item.source === 'manual' ? 'Manual event' : titleCase(item.source)],
        ['Linked', item.linkLabel || 'None'],
      ])}
      ${item.description ? `<p>${h(item.description)}</p>` : ''}
      <div class="modal-actions">${actions || '<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `, 'calendar-modal');
}

function renderCalendarEventFormModal(companyId, event) {
  const next = event || blankCalendarEvent(companyId);
  const jobValue = next.linked_type === 'job' ? next.linked_id : '';
  return renderModalShell('Calendar', event ? 'Edit event' : 'New event', `
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${h(event?.id || '')}" />
      ${field('Title', 'title', event ? next.title : '', true)}
      ${selectField('Type', 'event_type', next.event_type, CALENDAR_EVENT_TYPES.map((type) => [type, type]))}
      ${field('Starts', 'starts_at', dateTimeLocalValue(next.starts_at), true, 'datetime-local')}
      ${field('Ends', 'ends_at', dateTimeLocalValue(next.ends_at || next.starts_at), true, 'datetime-local')}
      <label class="check-row"><input type="checkbox" name="all_day" ${next.all_day ? 'checked' : ''} /> All day</label>
      ${selectField('Visibility', 'visibility', next.visibility, [['company', 'Company'], ['private', 'Private / assigned']])}
      ${selectField('Assigned to', 'assigned_profile_id', next.assigned_profile_id, calendarAssigneeOptions(companyId))}
      ${selectField('Linked job', 'linked_job_id', jobValue, [['', 'No linked job']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${h(next.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `, 'calendar-form-modal');
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

  const editSpan = event.target.closest('[data-contact-edit]');
  if (editSpan) {
    event.preventDefault();
    beginContactInlineEdit(editSpan);
    return;
  }

  const jobEditSpan = event.target.closest('[data-job-edit]');
  if (jobEditSpan) {
    event.preventDefault();
    beginJobInlineEdit(jobEditSpan);
    return;
  }

  const dealEditSpan = event.target.closest('[data-deal-edit]');
  if (dealEditSpan) {
    event.preventDefault();
    beginDealInlineEdit(dealEditSpan);
    return;
  }

  const link = event.target.closest('a[href][data-router]');
  if (!link) {
    if (closeAccountMenu || closeNotificationMenu) render();
    return;
  }
  if (link.target || link.hasAttribute('download')) return;
  event.preventDefault();
  state.mobileMenuOpen = false;
  navigate(link.getAttribute('href'));
}

function handleAction(event, node) {
  const action = node.dataset.action;
  if (isReadOnlyDemo() && isMutableAction(action)) {
    event.preventDefault();
    requireMutableWorkspace();
    return;
  }
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
  if (action === 'toggle-mobile-menu') {
    event.preventDefault();
    state.mobileMenuOpen = !state.mobileMenuOpen;
    state.accountMenuOpen = false;
    state.notificationMenuOpen = false;
    render();
    return;
  }
  if (action === 'toggle-sidebar') {
    event.preventDefault();
    state.sidebarCollapsed = !state.sidebarCollapsed;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(state.sidebarCollapsed));
    render();
    return;
  }
  if (action === 'toggle-nav-group') {
    event.preventDefault();
    const group = node.dataset.group;
    if (group) {
      if (state.collapsedNavGroups.has(group)) state.collapsedNavGroups.delete(group);
      else state.collapsedNavGroups.add(group);
      writeJson(NAV_GROUP_COLLAPSED_KEY, [...state.collapsedNavGroups]);
      render();
    }
    return;
  }
  if (action === 'toggle-nav-expand') {
    event.preventDefault();
    const module = node.dataset.module;
    if (module) {
      if (state.expandedNav.has(module)) state.expandedNav.delete(module);
      else state.expandedNav.add(module);
      writeJson(NAV_EXPANDED_KEY, [...state.expandedNav]);
      render();
    }
    return;
  }
  if (action === 'pipeline-open') {
    event.preventDefault();
    const module = node.dataset.module;
    setPipelineStage(module, 'all', true);
    return;
  }
  if (action === 'pipeline-stage') {
    event.preventDefault();
    const module = node.dataset.module;
    setPipelineStage(module, node.dataset.stage || 'all', false);
    return;
  }
  if (action === 'mark-all-notifications-read') {
    event.preventDefault();
    markAllNotificationsRead(activeCompanyId()).catch((error) => console.warn('Notification read sync failed', error));
    return;
  }
  if (action === 'open-notification') {
    event.preventDefault();
    openNotification(node.dataset.notificationId).catch((error) => console.warn('Notification open sync failed', error));
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
  if (action === 'open-auth-modal') {
    event.preventDefault();
    const mode = normalizeAuthMode(node.dataset.authMode || 'signin') || 'signin';
    state.authMode = mode;
    state.loginError = '';
    state.authMessage = '';
    navigate(`/?auth=${encodeURIComponent(mode)}`);
    return;
  }
  if (action === 'close-auth-modal') {
    event.preventDefault();
    state.loginError = '';
    state.authMessage = '';
    navigate('/');
    return;
  }
  if (action === 'set-auth-mode') {
    event.preventDefault();
    const nextMode = ['signin', 'register', 'invite', 'request'].includes(node.dataset.authMode) ? node.dataset.authMode : 'signin';
    state.authMode = nextMode;
    state.loginError = '';
    state.authMessage = '';
    if (state.route?.name === 'home' || state.route?.name === 'login') {
      const params = new URLSearchParams(state.route.params);
      if (state.route.name === 'home') {
        params.set('auth', nextMode);
        params.delete('mode');
      } else {
        params.set('mode', nextMode);
        params.delete('auth');
      }
      const search = params.toString();
      navigate(`${state.route.path}${search ? `?${search}` : ''}`, { replace: true });
      return;
    }
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
    if (!requirePermission('roles.manage', activeCompanyId(), 'Your role cannot manage roles.', 'Roles')) return;
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
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot invite or manage users.', 'Users')) return;
    state.modal = 'invite-new';
    render();
    return;
  }
  if (action === 'set-company-plugin') {
    event.preventDefault();
    const targetCompanyId = canonicalCompanyId(node.dataset.companyId || activeCompanyId());
    if (!isQuestDeveloper() && !requirePermission('plugins.manage', targetCompanyId, 'Your role cannot manage workspace plugins.', 'Plugins')) return;
    setCompanyPlugin(targetCompanyId, node.dataset.pluginId, node.dataset.status).catch((error) => {
      state.sync = { label: error.message || 'Plugin update failed', mode: 'local' };
      render();
    });
    return;
  }
  if (action === 'apply-plugin-preset') {
    event.preventDefault();
    const targetCompanyId = canonicalCompanyId(node.dataset.companyId || activeCompanyId());
    if (!isQuestDeveloper() && !requirePermission('plugins.manage', targetCompanyId, 'Your role cannot manage workspace plugins.', 'Plugins')) return;
    applyCompanyPluginPreset(targetCompanyId, node.dataset.presetCode).catch((error) => {
      state.sync = { label: error.message || 'Plugin preset failed', mode: 'local' };
      render();
    });
    return;
  }
  if (action === 'new-message-group') {
    event.preventDefault();
    if (!requirePermission('messages.create_group', activeCompanyId(), 'Your role cannot create group chats.', 'Messages')) return;
    state.modal = 'message-group-new';
    render();
    return;
  }
  if (action === 'new-direct-message') {
    event.preventDefault();
    if (!requirePermission('messages.send', activeCompanyId(), 'Your role cannot start direct messages.', 'Messages')) return;
    state.modal = 'message-direct-new';
    render();
    return;
  }
  if (action === 'manage-message-chat') {
    event.preventDefault();
    if (!requirePermission('messages.manage_groups', activeCompanyId(), 'Your role cannot manage chat access.', 'Messages')) return;
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
  if (action === 'set-calendar-scope') {
    event.preventDefault();
    state.calendarScope = node.dataset.scope === 'me' ? 'me' : 'company';
    render();
    return;
  }
  if (action === 'set-calendar-view') {
    event.preventDefault();
    state.calendarView = ['month', 'week', 'list'].includes(node.dataset.view) ? node.dataset.view : 'week';
    render();
    return;
  }
  if (action === 'calendar-prev') {
    event.preventDefault();
    moveCalendarCursor(-1);
    render();
    return;
  }
  if (action === 'calendar-next') {
    event.preventDefault();
    moveCalendarCursor(1);
    render();
    return;
  }
  if (action === 'calendar-today') {
    event.preventDefault();
    state.calendarCursorDate = isoDate(0);
    render();
    return;
  }
  if (action === 'open-calendar-event') {
    event.preventDefault();
    state.selectedCalendarEventId = node.dataset.eventId || '';
    state.modal = 'calendar-event-detail';
    render();
    return;
  }
  if (action === 'open-calendar-event-form') {
    event.preventDefault();
    if (!can('calendar.manage', activeCompanyId())) {
      showToast('Your role can view the calendar but cannot create company events.', 'local', 'Calendar');
      return;
    }
    state.selectedCalendarEventId = '';
    state.modal = 'calendar-event-new';
    render();
    return;
  }
  if (action === 'edit-calendar-event') {
    event.preventDefault();
    const target = manualCalendarEventById(node.dataset.eventId);
    if (!target || !canEditCalendarEvent(target)) {
      showToast('This event cannot be edited from Calendar.', 'local', 'Calendar');
      return;
    }
    state.selectedCalendarEventId = target.id;
    state.modal = 'calendar-event-edit';
    render();
    return;
  }
  if (action === 'delete-calendar-event') {
    event.preventDefault();
    deleteCalendarEvent(node.dataset.eventId);
    return;
  }
  if (action === 'copy-invite-link') {
    event.preventDefault();
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot view invite links.', 'Users')) return;
    copyInviteLink(node.dataset.inviteId);
    return;
  }
  if (action === 'copy-invite-code') {
    event.preventDefault();
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot view invite codes.', 'Users')) return;
    copyInviteCode(node.dataset.inviteId);
    return;
  }
  if (action === 'revoke-invite') {
    event.preventDefault();
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot revoke invites.', 'Users')) return;
    revokeInvite(node.dataset.inviteId);
    return;
  }
  if (action === 'approve-join-request') {
    event.preventDefault();
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot approve access requests.', 'Users')) return;
    updateJoinRequest(node.dataset.requestId, 'approved');
    return;
  }
  if (action === 'reject-join-request') {
    event.preventDefault();
    if (!requirePermission('users.manage', activeCompanyId(), 'Your role cannot reject access requests.', 'Users')) return;
    updateJoinRequest(node.dataset.requestId, 'rejected');
    return;
  }
  if (action === 'start-checkout') {
    event.preventDefault();
    startCheckout();
    return;
  }
  if (action === 'review-workspace') {
    event.preventDefault();
    reviewWorkspace(node.dataset.companyId, node.dataset.status);
    return;
  }
  if (action === 'platform-company-action') {
    event.preventDefault();
    managePlatformCompany(node.dataset.companyId, node.dataset.platformAction);
    return;
  }
  if (action === 'open-file-upload') {
    event.preventDefault();
    if (!requirePermission('files.manage', activeCompanyId(), 'Your role can view files but cannot upload.', 'Files')) return;
    state.modal = 'file-upload';
    render();
    return;
  }
  if (action === 'open-folder-form') {
    event.preventDefault();
    if (!requirePermission('files.manage', activeCompanyId(), 'Your role can view files but cannot create folders.', 'Files')) return;
    state.modal = 'folder-new';
    render();
    return;
  }
  if (action === 'open-job-form') {
    event.preventDefault();
    if (!requirePermission('jobs.manage', activeCompanyId(), 'Your role can view jobs but cannot create or edit them.', 'Jobs')) return;
    const jobId = node.dataset.jobId || '';
    if (jobId) state.selectedJobId = jobId;
    state.modal = node.dataset.mode === 'edit' ? 'job-edit' : 'job-new';
    render();
    return;
  }
  if (action === 'open-contact-form') {
    event.preventDefault();
    const contactId = node.dataset.contactId || '';
    if (contactId) state.selectedContactId = contactId;
    state.contactPrefill = { account_id: node.dataset.accountId || '' };
    state.modal = node.dataset.mode === 'edit' ? 'contact-edit' : 'contact-new';
    render();
    return;
  }
  if (action === 'delete-contact') {
    event.preventDefault();
    deleteContact(node.dataset.contactId);
    return;
  }
  if (action === 'open-account-form') {
    event.preventDefault();
    if (node.dataset.accountId) state.selectedAccountId = node.dataset.accountId;
    state.modal = node.dataset.mode === 'edit' ? 'account-edit' : 'account-new';
    render();
    return;
  }
  if (action === 'delete-account') {
    event.preventDefault();
    deleteAccount(node.dataset.accountId);
    return;
  }
  if (action === 'open-account') {
    event.preventDefault();
    state.selectedAccountId = node.dataset.accountId || '';
    state.accountTab = 'overview';
    navigate(companyPath('crm', { account_id: node.dataset.accountId }, activeCompanyId()));
    return;
  }
  if (action === 'set-account-tab') {
    event.preventDefault();
    state.accountTab = node.dataset.tab || 'overview';
    render();
    return;
  }
  if (action === 'account-type') {
    event.preventDefault();
    state.accountTypeFilter = node.dataset.type || 'all';
    updateWorkspaceOnly();
    return;
  }
  if (action === 'open-deal-form') {
    event.preventDefault();
    if (node.dataset.dealId) state.selectedDealId = node.dataset.dealId;
    state.dealPrefill = { account_id: node.dataset.accountId || '', primary_contact_id: node.dataset.contactId || '', stage: node.dataset.stage || '' };
    state.modal = node.dataset.mode === 'edit' ? 'deal-edit' : 'deal-new';
    render();
    return;
  }
  if (action === 'delete-deal') {
    event.preventDefault();
    deleteDeal(node.dataset.dealId);
    return;
  }
  if (action === 'open-deal') {
    event.preventDefault();
    state.selectedDealId = node.dataset.dealId || '';
    navigate(companyPath('deals', { deal_id: node.dataset.dealId }, activeCompanyId()));
    return;
  }
  if (action === 'set-deal-stage') {
    event.preventDefault();
    setDealStage(node.dataset.dealId, node.dataset.stage);
    return;
  }
  if (action === 'deal-mark-next') {
    event.preventDefault();
    markDealNextStage(node.dataset.dealId);
    return;
  }
  if (action === 'deal-quick') {
    event.preventDefault();
    dealQuickCreate(node.dataset.dealId, node.dataset.kind);
    return;
  }
  if (action === 'deal-activity-tab') {
    event.preventDefault();
    state.dealActivityTab = node.dataset.tab || 'Email';
    render();
    return;
  }
  if (action === 'open-contact') {
    event.preventDefault();
    state.selectedContactId = node.dataset.contactId || '';
    navigate(companyPath('contacts', { contact_id: node.dataset.contactId }, activeCompanyId()));
    return;
  }
  if (action === 'set-contact-stage') {
    event.preventDefault();
    setContactStage(node.dataset.contactId, node.dataset.stage);
    return;
  }
  if (action === 'set-contact-temp') {
    event.preventDefault();
    setContactTemperature(node.dataset.contactId, node.dataset.temp);
    return;
  }
  if (action === 'toggle-contact-task') {
    event.preventDefault();
    toggleContactTask(node.dataset.taskId);
    return;
  }
  if (action === 'contact-quick') {
    event.preventDefault();
    contactQuickCreate(node.dataset.contactId, node.dataset.kind);
    return;
  }
  if (action === 'contact-mark-next') {
    event.preventDefault();
    {
      const contact = contactById(node.dataset.contactId);
      const names = contactStageNames();
      const idx = contact ? names.indexOf(contact.stage) : -1;
      if (contact && idx >= 0 && idx < names.length - 1) setContactStage(contact.id, names[idx + 1]);
    }
    return;
  }
  if (action === 'contact-activity-tab') {
    event.preventDefault();
    state.contactActivityTab = node.dataset.tab;
    render();
    return;
  }
  if (action === 'contact-convert-job') {
    event.preventDefault();
    convertContactToJob(node.dataset.contactId);
    return;
  }
  if (action === 'set-job-stage') {
    event.preventDefault();
    setJobStage(node.dataset.jobId, node.dataset.stage);
    return;
  }
  if (action === 'job-mark-next') {
    event.preventDefault();
    markJobNextStage(node.dataset.jobId);
    return;
  }
  if (action === 'job-quick') {
    event.preventDefault();
    jobQuickCreate(node.dataset.jobId, node.dataset.kind);
    return;
  }
  if (action === 'job-activity-tab') {
    event.preventDefault();
    state.jobActivityTab = node.dataset.tab || 'Note';
    render();
    return;
  }
  if (action === 'convert-deal') {
    event.preventDefault();
    convertDealToJob(node.dataset.dealId);
    return;
  }
  if (action === 'open-activity-form') {
    event.preventDefault();
    state.activityPrefill = {
      related_type: node.dataset.relatedType || '',
      related_id: node.dataset.relatedId || '',
      account_id: node.dataset.accountId || '',
      type: node.dataset.type || 'note',
    };
    state.modal = 'activity-new';
    render();
    return;
  }
  if (action === 'delete-activity') {
    event.preventDefault();
    deleteActivity(node.dataset.activityId);
    return;
  }
  if (action === 'set-pipeline-view') {
    event.preventDefault();
    const module = node.dataset.module;
    const view = node.dataset.view === 'board' ? 'board' : 'table';
    if (module === 'contacts') {
      state.contactBoardView = view;
      localStorage.setItem(CONTACT_BOARD_VIEW_KEY, view);
    } else if (module === 'deals') {
      state.dealBoardView = view;
      localStorage.setItem(DEAL_BOARD_VIEW_KEY, view);
    } else {
      state.jobBoardView = view;
      localStorage.setItem(JOB_BOARD_VIEW_KEY, view);
    }
    render();
    return;
  }
  if (action === 'open-stage-manager') {
    event.preventDefault();
    const module = ['contacts', 'deals'].includes(node.dataset.module) ? node.dataset.module : 'jobs';
    state.modal = `stages-${module}`;
    render();
    return;
  }
  if (action === 'add-stage') {
    event.preventDefault();
    addPipelineStage(['contacts', 'deals'].includes(node.dataset.module) ? node.dataset.module : 'jobs');
    return;
  }
  if (action === 'delete-stage') {
    event.preventDefault();
    deletePipelineStage(['contacts', 'deals'].includes(node.dataset.module) ? node.dataset.module : 'jobs', Number(node.dataset.index));
    return;
  }
  if (action === 'open-forms-tools') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role can view forms but cannot create or edit them.', 'Forms')) return;
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
    if (!requirePermission('files.manage', activeCompanyId(), 'Your role cannot delete files.', 'Files')) return;
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
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role can view forms but cannot create them.', 'Forms')) return;
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
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    selectForm(node.dataset.formId, false);
    state.formsTab = 'builder';
    state.formEditorTab = 'questions';
    state.modal = '';
    render();
    return;
  }
  if (action === 'save-form') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    saveFormsState('Form saved locally');
    render();
    return;
  }
  if (action === 'publish-form') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot publish forms.', 'Forms')) return;
    setFormStatus(node.dataset.formId, 'Published');
    return;
  }
  if (action === 'archive-form') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot archive forms.', 'Forms')) return;
    setFormStatus(node.dataset.formId, 'Archived');
    return;
  }
  if (action === 'duplicate-form') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot duplicate forms.', 'Forms')) return;
    duplicateForm(node.dataset.formId);
    return;
  }
  if (action === 'delete-form') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot delete forms.', 'Forms')) return;
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
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceInvoiceId = '';
    state.modal = 'finance-invoice-new';
    render();
    return;
  }
  if (action === 'edit-finance-invoice') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceInvoiceId = node.dataset.invoiceId || '';
    state.modal = 'finance-invoice-edit';
    render();
    return;
  }
  if (action === 'new-finance-payment') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceInvoiceId = node.dataset.invoiceId || state.route?.params?.get('invoice') || '';
    state.modal = 'finance-payment-new';
    render();
    return;
  }
  if (action === 'new-finance-expense') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceExpenseId = '';
    state.selectedFinanceVendorId = node.dataset.vendorId || '';
    state.modal = 'finance-expense-new';
    render();
    return;
  }
  if (action === 'edit-finance-expense') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceExpenseId = node.dataset.expenseId || '';
    state.modal = 'finance-expense-edit';
    render();
    return;
  }
  if (action === 'new-finance-vendor') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceVendorId = '';
    state.modal = 'finance-vendor-new';
    render();
    return;
  }
  if (action === 'edit-finance-vendor') {
    event.preventDefault();
    if (!can('finance.manage', activeCompanyId())) return showToast('Your role cannot manage finance records.', 'local', 'Finance');
    state.selectedFinanceVendorId = node.dataset.vendorId || '';
    state.modal = 'finance-vendor-edit';
    render();
    return;
  }
  if (action === 'add-question') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    addQuestion(node.dataset.questionType || 'multiple');
    return;
  }
  if (action === 'duplicate-question') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    duplicateQuestion(node.dataset.questionId);
    return;
  }
  if (action === 'delete-question') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    deleteQuestion(node.dataset.questionId);
    return;
  }
  if (action === 'move-question') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    moveQuestion(node.dataset.questionId, Number(node.dataset.direction || 0));
    return;
  }
  if (action === 'add-question-option') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    addQuestionOption(node.dataset.questionId);
    return;
  }
  if (action === 'remove-question-option') {
    event.preventDefault();
    if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot edit forms.', 'Forms')) return;
    removeQuestionOption(node.dataset.questionId, Number(node.dataset.optionIndex || -1));
    return;
  }
  if (action === 'delete-job') {
    event.preventDefault();
    if (!requirePermission('jobs.manage', activeCompanyId(), 'Your role cannot delete jobs.', 'Jobs')) return;
    deleteJob(node.dataset.jobId);
    return;
  }
  if (action === 'delete-task') {
    event.preventDefault();
    if (!requirePermission('tasks.manage', activeCompanyId(), 'Your role cannot delete tasks.', 'Tasks')) return;
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
  if (route.params?.get('account') === 'profile') {
    const params = new URLSearchParams(route.params);
    params.delete('account');
    const search = params.toString();
    navigate(`${route.path}${search ? `?${search}` : ''}`, { replace: true });
    return;
  }
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
  if (isReadOnlyDemo() && isMutableFormSubmit(event.target)) {
    event.preventDefault();
    requireMutableWorkspace();
    return;
  }

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

  if (event.target.matches('[data-existing-invite-code-form]')) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target).entries());
    const inviteCode = String(form.invite_code || '').trim();
    if (!inviteCode) {
      state.loginError = 'Invite code is required.';
      render();
      return;
    }
    acceptCompanyInvite(inviteCode).catch((error) => {
      state.loginError = error.message || 'Unable to accept invite.';
      state.authMessage = '';
      render();
    });
    return;
  }

  if (event.target.matches('[data-auth-request-form]')) {
    event.preventDefault();
    requestCompanyAccess(event.target);
    return;
  }

  if (event.target.matches('[data-company-create-form]')) {
    event.preventDefault();
    createWorkspaceForCurrentUser(event.target).catch((error) => {
      state.loginError = error.message || 'Workspace setup failed.';
      state.authMessage = '';
      render();
    });
    return;
  }

  if (event.target.matches('[data-profile-form]')) {
    event.preventDefault();
    saveProfile(event.target).catch((error) => {
      showToast(error.message || 'Profile save failed.', 'local', 'Profile');
    });
    return;
  }

  if (event.target.matches('[data-job-form]')) {
    event.preventDefault();
    saveJob(event.target);
    return;
  }

  if (event.target.matches('[data-contact-form]')) {
    event.preventDefault();
    saveContact(event.target);
    return;
  }

  if (event.target.matches('[data-contact-task-form]')) {
    event.preventDefault();
    addContactTask(event.target);
    return;
  }

  if (event.target.matches('[data-contact-note-form]')) {
    event.preventDefault();
    postContactNote(event.target);
    return;
  }

  if (event.target.matches('[data-job-note-form]')) {
    event.preventDefault();
    postJobNote(event.target);
    return;
  }

  if (event.target.matches('[data-deal-note-form]')) {
    event.preventDefault();
    postDealNote(event.target);
    return;
  }

  if (event.target.matches('[data-account-form]')) {
    event.preventDefault();
    saveAccount(event.target);
    return;
  }

  if (event.target.matches('[data-deal-form]')) {
    event.preventDefault();
    saveDeal(event.target);
    return;
  }

  if (event.target.matches('[data-activity-form]')) {
    event.preventDefault();
    saveActivityForm(event.target);
    return;
  }

  if (event.target.matches('[data-stage-form]')) {
    event.preventDefault();
    saveStageEdits(event.target);
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

  if (event.target.matches('[data-calendar-event-form]')) {
    event.preventDefault();
    saveCalendarEvent(event.target);
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
  state.session = buildDemoSession();
  resetDemoWorkspaceData();
  state.activeCompanyId = activeCompanyId();
  localStorage.setItem(COMPANY_KEY, state.activeCompanyId);
  writeJson(SESSION_KEY, state.session);
  state.dataLoaded = false;
  state.dataLoading = false;
  navigate(safeReturnUrl(returnUrl || appHref(companyPath('jobs', {}, activeCompanyId()))), { replace: true });
}

async function saveProfile(formNode) {
  const data = new FormData(formNode);
  const current = activeSession().profile;
  const file = formNode.elements.avatar_file?.files?.[0] || null;
  const croppedUrl = String(data.get('avatar_cropped_url') || '').trim();
  let avatarUrl = String(data.get('avatar_url') || current.avatar_url || '').trim();
  if (croppedUrl.startsWith('data:image/')) {
    const croppedFile = dataUrlToFile(croppedUrl, `avatar-${Date.now()}.png`);
    const uploadResult = await saveProfileAvatar(croppedFile);
    if (!uploadResult.ok) return;
    avatarUrl = uploadResult.url;
  } else if (file && file.size) {
    const uploadResult = await saveProfileAvatar(file);
    if (!uploadResult.ok) return;
    avatarUrl = uploadResult.url;
  }
  let next = normalizeProfile({
    ...current,
    full_name: String(data.get('full_name') || '').trim() || current.full_name || 'Quest user',
    avatar_url: avatarUrl,
  }, current);
  if (state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (!client) {
      showToast('Profile upload needs Supabase to be available.', 'local', 'Profile');
      return;
    }
    const result = await client
      .from('profiles')
      .update({ full_name: next.full_name, avatar_url: next.avatar_url })
      .eq('id', current.id)
      .select()
      .single();
    if (result.error) {
      showToast(result.error.message || 'Profile save failed.', 'local', 'Profile');
      return;
    }
    next = normalizeProfile(result.data, next);
    if (client.auth?.updateUser) {
      await client.auth.updateUser({ data: { full_name: next.full_name, avatar_url: next.avatar_url } });
    }
    state.profiles = [next].concat(state.profiles.filter((profile) => profile.id !== next.id));
    if (next.member_id) {
      state.teamMembers = state.teamMembers.map((member) => (member.id === next.member_id ? { ...member, full_name: next.full_name, name: next.full_name, avatar_url: next.avatar_url } : member));
    }
  } else {
    writeJson(PROFILE_KEY, next);
    state.profileDraft = next;
  }
  state.session = { ...activeSession(), profile: next };
  writeJson(SESSION_KEY, state.session);
  state.modal = '';
  showToast('Profile saved.', state.session?.auth === 'supabase' ? 'live' : 'local', 'Profile');
}

async function prepareProfileAvatarCrop(formNode) {
  if (!formNode) return;
  const file = formNode.elements.avatar_file?.files?.[0] || null;
  const hidden = formNode.querySelector('[data-profile-cropped-avatar]');
  if (hidden) hidden.value = '';
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error('Use a PNG, JPG, or WebP image for your profile picture.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Profile pictures must be 2 MB or smaller.');
  const dataUrl = await fileToDataUrl(file);
  if (!dataUrl) throw new Error('Could not read that image file.');
  const image = await loadImage(dataUrl);
  const cropper = formNode.querySelector('[data-profile-cropper]');
  if (cropper) cropper.hidden = false;
  formNode._profileCropImage = image;
  formNode.querySelector('[data-profile-crop-zoom]').value = '1';
  formNode.querySelector('[data-profile-crop-x]').value = '0';
  formNode.querySelector('[data-profile-crop-y]').value = '0';
  updateProfileAvatarCrop(formNode);
}

function updateProfileAvatarCrop(formNode) {
  if (!formNode?._profileCropImage) return;
  const canvas = formNode.querySelector('[data-profile-crop-canvas]');
  const hidden = formNode.querySelector('[data-profile-cropped-avatar]');
  if (!canvas || !hidden) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const image = formNode._profileCropImage;
  const zoom = Math.max(1, Number(formNode.querySelector('[data-profile-crop-zoom]')?.value || 1));
  const offsetX = Number(formNode.querySelector('[data-profile-crop-x]')?.value || 0) / 100;
  const offsetY = Number(formNode.querySelector('[data-profile-crop-y]')?.value || 0) / 100;
  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (drawWidth - size) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - size) / 2);
  const drawX = (size - drawWidth) / 2 + offsetX * maxOffsetX;
  const drawY = (size - drawHeight) / 2 + offsetY * maxOffsetY;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  hidden.value = canvas.toDataURL('image/png');
  const preview = formNode.querySelector('#profile-avatar-preview');
  if (preview) preview.innerHTML = `<img src="${h(hidden.value)}" alt="" />`;
  if (preview) preview.classList.add('has-image');
}

async function saveProfileAvatar(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    showToast('Use a PNG, JPG, or WebP image for your profile picture.', 'local', 'Profile');
    return { ok: false, url: '' };
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Profile pictures must be 2 MB or smaller.', 'local', 'Profile');
    return { ok: false, url: '' };
  }
  if (state.session?.auth !== 'supabase') {
    const url = await fileToDataUrl(file);
    if (!url) {
      showToast('Could not read that image file.', 'local', 'Profile');
      return { ok: false, url: '' };
    }
    return { ok: true, url };
  }
  const client = createSupabaseClient();
  const profileId = activeSession().profile.id;
  const ext = avatarFileExtension(file);
  const objectPath = `${profileId}/avatar-${Date.now()}.${ext}`;
  const upload = await client.storage
    .from('avatars')
    .upload(objectPath, file, { cacheControl: '3600', upsert: true, contentType: file.type });
  if (upload.error) {
    showToast(upload.error.message || 'Profile picture upload failed.', 'local', 'Profile');
    return { ok: false, url: '' };
  }
  const publicResult = client.storage.from('avatars').getPublicUrl(objectPath);
  const publicUrl = publicResult.data?.publicUrl ? `${publicResult.data.publicUrl}?v=${Date.now()}` : '';
  if (!publicUrl) {
    showToast('Profile picture uploaded, but no public URL was returned.', 'local', 'Profile');
    return { ok: false, url: '' };
  }
  return { ok: true, url: publicUrl };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load that image.'));
    image.src = src;
  });
}

function dataUrlToFile(dataUrl, fileName) {
  const [header, payload] = String(dataUrl || '').split(',');
  const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png';
  const binary = atob(payload || '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], fileName, { type: mime });
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

async function submitInviteCode(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const inviteCode = String(form.invite_code || '').trim();
  if (!inviteCode) {
    state.loginError = 'Invite code is required.';
    render();
    return;
  }
  state.loginError = '';
  state.authMessage = 'Checking invite code...';
  state.authMode = 'register';
  render();
  const lookup = await lookupInviteCode(inviteCode);
  if (lookup?.missing) {
    state.loginError = 'Invite code was not found or is no longer pending.';
    state.authMessage = '';
    state.authMode = 'invite';
    render();
    return;
  }
  if (lookup?.status && lookup.status !== 'pending') {
    state.loginError = `This invite is ${lookup.status}. Ask your company admin for a new code.`;
    state.authMessage = '';
    state.authMode = 'invite';
    render();
    return;
  }
  if (lookup?.expires_at && Date.parse(lookup.expires_at) <= Date.now()) {
    state.loginError = 'This invite code expired. Ask your company admin for a new code.';
    state.authMessage = '';
    state.authMode = 'invite';
    render();
    return;
  }
  if (lookup) {
    state.inviteLookup = lookup;
    state.authMessage = `Invite found for ${lookup.email}.`;
  } else {
    state.authMessage = '';
  }
  const params = new URLSearchParams({ invite: inviteCode });
  const returnUrl = safeReturnUrl(form.return_url || '');
  if (returnUrl) params.set('return_url', returnUrl);
  params.set('mode', 'register');
  navigate(`/login?${params.toString()}`, { replace: true });
}

async function lookupInviteCode(inviteCode) {
  const token = String(inviteCode || '').trim();
  const client = createSupabaseClient();
  if (!token || !client) return null;
  const result = await safeSupabaseQuery(client.rpc('lookup_company_invite', { invite_token: token }));
  if (result.error) return null;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row) return { missing: true };
  return {
    token,
    company_id: canonicalCompanyId(row.company_id || ''),
    company_name: String(row.company_name || row.company_id || '').trim(),
    email: String(row.email || '').trim(),
    status: String(row.status || '').trim(),
    expires_at: row.expires_at || '',
  };
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
  const presetCode = WORKSPACE_PLUGIN_PRESETS[form.preset_code] ? form.preset_code : 'generic';
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
    const duplicateAccount = /already|registered|exists/i.test(signUp.error.message || '');
    state.loginError = duplicateAccount && inviteToken
      ? 'That email already has a Quest HQ account. Sign in with the invited email to accept this invite.'
      : signUp.error.message || 'Unable to create account.';
    if (duplicateAccount && inviteToken) state.authMode = 'signin';
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
  const workspace = await client.rpc('create_company_workspace', { company_name: companyName, preset_code: presetCode });
  if (workspace.error) {
    state.loginError = workspace.error.message || 'Account created, but workspace setup failed.';
    state.authMessage = '';
    render();
    return;
  }
  applyCreatedWorkspace(workspace.data, companyName);
  applyPluginPresetLocal(state.activeCompanyId, presetCode);
  state.authMessage = '';
  navigate(companyPath('settings', { tab: 'billing' }, state.activeCompanyId), { replace: true });
}

async function createWorkspaceForCurrentUser(formNode) {
  const form = Object.fromEntries(new FormData(formNode).entries());
  const client = createSupabaseClient();
  const companyName = String(form.company_name || '').trim();
  const presetCode = WORKSPACE_PLUGIN_PRESETS[form.preset_code] ? form.preset_code : 'generic';
  if (!client || !companyName) {
    state.loginError = 'Company workspace name is required.';
    state.authMessage = '';
    render();
    return;
  }
  state.loginError = '';
  state.authMessage = 'Creating workspace...';
  render();
  const workspace = await safeSupabaseQuery(client.rpc('create_company_workspace', { company_name: companyName, preset_code: presetCode }));
  if (workspace.error) {
    state.loginError = workspace.error.message || 'Workspace setup failed.';
    state.authMessage = '';
    render();
    return;
  }
  applyCreatedWorkspace(workspace.data, companyName);
  applyPluginPresetLocal(state.activeCompanyId, presetCode);
  state.authMessage = 'Opening workspace...';
  navigate(companyPath('settings', { tab: 'billing' }, state.activeCompanyId), { replace: true });
}

function applyCreatedWorkspace(workspaceId, requestedName = '') {
  const companyId = canonicalCompanyId(workspaceId || defaultCompanyId());
  const cleanName = String(requestedName || companyName(companyId) || companyId).trim();
  const existingSubscription = companySubscription(companyId);
  state.activeCompanyId = companyId;
  state.companies = mergeCompanies(state.companies.concat(normalizeCompany({
    id: companyId,
    name: cleanName,
    short_name: cleanName,
    color: companyColor(companyId),
  })));
  state.memberships = state.memberships
    .filter((membership) => !(membership.company_id === companyId && membership.profile_id === activeSession().profile.id))
    .concat(normalizeMembership({
      company_id: companyId,
      profile_id: activeSession().profile.id,
      member_id: activeSession().profile.member_id,
      role: 'owner',
      status: 'active',
    }));
  state.subscriptions = mergeSubscriptions(state.subscriptions.concat(normalizeSubscription({
    ...(existingSubscription || {}),
    company_id: companyId,
    status: existingSubscription?.status || 'pending_review',
  })));
  const profile = normalizeProfile({
    ...activeSession().profile,
    company_ids: compactUnique((activeSession().profile.company_ids || []).concat(companyId)),
    approved: true,
    role: activeSession().profile.role === 'member' ? 'admin' : activeSession().profile.role,
  });
  state.session = { ...activeSession(), profile };
  writeJson(SESSION_KEY, state.session);
  const subscription = companySubscription(companyId);
  if (subscription?.status === 'pending_review') markWorkspacePendingReview(companyId);
  else clearWorkspacePendingReview(companyId);
  localStorage.setItem(COMPANY_KEY, companyId);
  state.dataLoaded = false;
}

function applyPluginPresetLocal(companyId, presetCode) {
  const cleanPreset = WORKSPACE_PLUGIN_PRESETS[presetCode] ? presetCode : 'generic';
  const pluginIds = WORKSPACE_PLUGIN_PRESETS[cleanPreset];
  availableWorkspacePlugins().forEach((plugin) => {
    upsertCompanyPluginLocal(companyId, plugin.id, pluginIds.includes(plugin.id) ? 'installed' : 'disabled');
  });
}

function upsertCompanyPluginLocal(companyId, pluginId, status) {
  const row = normalizeCompanyPlugin({
    company_id: companyId,
    plugin_id: pluginId,
    status,
    installed_by: status === 'installed' ? activeSession().profile.id : '',
    installed_at: status === 'installed' ? new Date().toISOString() : '',
    disabled_at: status === 'disabled' ? new Date().toISOString() : '',
    updated_at: new Date().toISOString(),
  });
  state.companyPlugins = mergeCompanyPlugins(state.companyPlugins
    .filter((item) => !(item.company_id === row.company_id && item.plugin_id === row.plugin_id))
    .concat(row));
}

async function setCompanyPlugin(companyId, pluginId, status) {
  const plugin = pluginById(pluginId);
  const nextStatus = status === 'disabled' ? 'disabled' : 'installed';
  if (!plugin || plugin.comingSoon) {
    showToast('That plugin is not available yet.', 'local', 'Plugins');
    return;
  }
  const conflictIds = conflictingPluginIds(companyId, plugin.id, nextStatus);
  if (conflictIds.length) {
    const conflictLabels = conflictIds.map((conflictId) => pluginById(conflictId)?.label || conflictId).join(', ');
    if (!window.confirm(`Installing ${plugin.label} will disable ${conflictLabels}. Continue?`)) return;
  }
  state.sync = { label: 'Updating plugin...', mode: 'loading' };
  render();
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const result = await safeSupabaseQuery(client.rpc('set_company_plugin', {
      target_company_id: companyId,
      target_plugin_id: plugin.id,
      next_status: nextStatus,
    }));
    if (result.error) throw new Error(result.error.message || 'Plugin update failed.');
  }
  conflictIds.forEach((conflictId) => upsertCompanyPluginLocal(companyId, conflictId, 'disabled'));
  upsertCompanyPluginLocal(companyId, plugin.id, nextStatus);
  state.sync = { label: `${plugin.label} ${nextStatus === 'installed' ? 'installed' : 'disabled'}`, mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  showToast(`${plugin.label} ${nextStatus === 'installed' ? 'installed' : 'disabled'}.`, state.session?.auth === 'supabase' ? 'live' : 'local', 'Plugins');
  render();
}

async function applyCompanyPluginPreset(companyId, presetCode) {
  const cleanPreset = WORKSPACE_PLUGIN_PRESETS[presetCode] ? presetCode : 'generic';
  const pluginIds = WORKSPACE_PLUGIN_PRESETS[cleanPreset];
  state.sync = { label: 'Applying plugin preset...', mode: 'loading' };
  render();
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const result = await safeSupabaseQuery(client.rpc('apply_company_plugin_preset', {
      target_company_id: companyId,
      preset_code: cleanPreset,
    }));
    if (result.error) throw new Error(result.error.message || 'Plugin preset failed.');
  }
  applyPluginPresetLocal(companyId, cleanPreset);
  state.sync = { label: `${WORKSPACE_PLUGIN_PRESET_LABELS[cleanPreset]} plugins applied`, mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  showToast(`${WORKSPACE_PLUGIN_PRESET_LABELS[cleanPreset]} plugin preset applied.`, state.session?.auth === 'supabase' ? 'live' : 'local', 'Plugins');
  render();
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
  if (CONFIG.billingMode === 'manual') {
    state.sync = { label: 'Manual approval active', mode: 'local' };
    showToast('Manual approval is active for launch week. Lumen will activate billing after review.', 'local', 'Billing');
    render();
    return;
  }
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

async function reviewWorkspace(companyId, status) {
  const targetCompanyId = canonicalCompanyId(companyId);
  const nextStatus = normalizeSubscriptionStatus(status);
  if (!targetCompanyId || !nextStatus || !isQuestDeveloper()) {
    showToast('Platform owner access is required to review workspaces.', 'local', 'Workspace review');
    return;
  }
  const client = createSupabaseClient();
  state.sync = { label: 'Updating workspace review...', mode: 'loading' };
  render();
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.rpc('review_company_workspace', {
      target_company_id: targetCompanyId,
      next_status: nextStatus,
      review_note: `Marked ${nextStatus} from Quest HQ approval console`,
    });
    if (result.error) {
      state.sync = { label: result.error.message || 'Workspace review failed', mode: 'local' };
      showToast(result.error.message || 'Workspace review failed.', 'local', 'Workspace review');
      render();
      return;
    }
  }
  applyWorkspaceReviewStatus(targetCompanyId, nextStatus);
  await recordAuditEvent(targetCompanyId, 'workspace.reviewed', 'company_subscription', targetCompanyId, { status: nextStatus }, state.session?.auth === 'supabase');
  state.sync = { label: `Workspace marked ${subscriptionLabelForStatus(nextStatus).toLowerCase()}`, mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  showToast(`Workspace marked ${subscriptionLabelForStatus(nextStatus).toLowerCase()}.`, state.session?.auth === 'supabase' ? 'live' : 'local', 'Workspace review');
  render();
}

async function managePlatformCompany(companyId, platformAction) {
  const targetCompanyId = canonicalCompanyId(companyId);
  const action = String(platformAction || '').toLowerCase().trim();
  const nextStatus = platformActionStatus(action);
  if (!targetCompanyId || !nextStatus || !isQuestDeveloper()) {
    showToast('Platform owner access is required to manage companies.', 'local', 'Master panel');
    return;
  }
  if (targetCompanyId === 'lumen' && ['suspend', 'archive', 'delete', 'cancel'].includes(action)) {
    showToast('The Lumen platform workspace cannot be suspended or archived from the panel.', 'local', 'Master panel');
    return;
  }
  const client = createSupabaseClient();
  state.sync = { label: 'Updating company access...', mode: 'loading' };
  render();
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.rpc('manage_platform_company', {
      target_company_id: targetCompanyId,
      platform_action: action,
      review_note: `Platform master panel marked ${targetCompanyId} as ${nextStatus}`,
    });
    if (result.error) {
      state.sync = { label: result.error.message || 'Company update failed', mode: 'local' };
      showToast(result.error.message || 'Company update failed.', 'local', 'Master panel');
      render();
      return;
    }
  }
  applyPlatformCompanyStatus(targetCompanyId, nextStatus);
  await recordAuditEvent(targetCompanyId, `platform.company.${action}`, 'company', targetCompanyId, { action, status: nextStatus }, state.session?.auth === 'supabase');
  state.sync = { label: `${companyName(targetCompanyId)} marked ${subscriptionLabelForStatus(nextStatus).toLowerCase()}`, mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  showToast(`${companyName(targetCompanyId)} marked ${subscriptionLabelForStatus(nextStatus).toLowerCase()}.`, state.session?.auth === 'supabase' ? 'live' : 'local', 'Master panel');
  if (state.session?.auth === 'supabase') state.dataLoaded = false;
  render();
}

function applyWorkspaceReviewStatus(companyId, status) {
  const subscription = normalizeSubscription({
    ...(companySubscription(companyId) || {}),
    company_id: companyId,
    status,
  });
  state.subscriptions = mergeSubscriptions(state.subscriptions.filter((item) => item.company_id !== companyId).concat(subscription));
  const review = normalizeWorkspaceReview({
    ...(state.workspaceReviews.find((item) => item.company_id === companyId) || {}),
    company_id: companyId,
    company_name: companyName(companyId),
    status,
    plan_code: subscription.plan_code,
    amount_cents: subscription.amount_cents,
    currency: subscription.currency,
    created_at: new Date().toISOString(),
  });
  state.workspaceReviews = state.workspaceReviews.filter((item) => item.company_id !== companyId).concat(review);
  if (status === 'pending_review') markWorkspacePendingReview(companyId);
  else clearWorkspacePendingReview(companyId);
}

function applyPlatformCompanyStatus(companyId, status) {
  applyWorkspaceReviewStatus(companyId, status);
  const index = state.platformCompanies.findIndex((company) => company.company_id === companyId);
  const current = index >= 0 ? state.platformCompanies[index] : platformCompanyRows().find((company) => company.company_id === companyId) || normalizePlatformCompany({
    company_id: companyId,
    company_name: companyName(companyId),
  });
  const next = normalizePlatformCompany({
    ...current,
    status,
    updated_at: new Date().toISOString(),
  });
  if (index >= 0) state.platformCompanies[index] = next;
  else state.platformCompanies.push(next);
}

async function saveRole(formNode) {
  const companyId = activeCompanyId();
  if (!requirePermission('roles.manage', companyId, 'Your role cannot manage roles.', 'Roles')) return;
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
  if (!requirePermission('users.manage', companyId, 'Your role cannot invite users.', 'Users')) return;
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
  state.inviteLookup = null;
  state.authMessage = '';
  state.loginError = '';
  state.dataLoaded = false;
  navigate(companyPath('jobs', {}, companyId), { replace: true });
}

async function copyInviteLink(inviteId) {
  const invite = state.companyInvites.find((item) => item.id === inviteId);
  if (invite && !requirePermission('users.manage', invite.company_id, 'Your role cannot view invite links.', 'Users')) return;
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
  if (invite && !requirePermission('users.manage', invite.company_id, 'Your role cannot view invite codes.', 'Users')) return;
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
  if (!requirePermission('users.manage', invite.company_id, 'Your role cannot revoke invites.', 'Users')) return;
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
  if (!requirePermission('users.manage', companyId, 'Your role cannot manage user access.', 'Users')) return;
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

  notifyLocalEvent('access.role', 'User access updated', `${actorName()} set ${profileName(profileId)} to ${role.name} / ${titleCase(status)}.`, companyPath('settings', { tab: 'access' }, companyId), 'membership', profileId, companyId, [profileId].concat(usersWithAnyPermission(companyId, ['users.manage', 'settings.manage'])));
  recordAuditEvent(companyId, membershipAuditEventType(previousMembership, membership), 'membership', profileId, { role: role.name, status });
  render();
}

async function updateJoinRequest(requestId, status) {
  const request = state.joinRequests.find((item) => item.id === requestId);
  if (!request || !['approved', 'rejected'].includes(status)) return;
  if (!requirePermission('users.manage', request.company_id, 'Your role cannot manage access requests.', 'Users')) return;
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
  notifyLocalEvent('access.request', status === 'approved' ? 'Access approved' : 'Access rejected', `${actorName()} ${status === 'approved' ? 'approved' : 'rejected'} ${request.requested_email || 'a join request'}.`, companyPath('settings', { tab: 'access' }, request.company_id), 'join_request', request.id, request.company_id, [request.profile_id].concat(usersWithAnyPermission(request.company_id, ['users.manage', 'settings.manage'])));
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
  notifyLocalEvent('message.group', 'Group chat created', `${actorName()} created ${conversation.title}.`, companyPath('messages', { conversation: conversation.id }, companyId), 'message_conversation', conversation.id, companyId, conversationNotificationRecipients(conversation));
  navigate(companyPath('messages', { conversation: conversation.id }, companyId), { replace: true });
}

async function saveDirectMessage(form) {
  const companyId = activeCompanyId();
  if (!requirePermission('messages.send', companyId, 'Your role cannot start direct messages.', 'Messages')) return;
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
  notifyLocalEvent('message.direct', 'Direct message started', `${actorName()} started a direct message with ${conversation.title}.`, companyPath('messages', { conversation: conversation.id }, companyId), 'message_conversation', conversation.id, companyId, [targetId]);
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
  const previousRecipients = conversationNotificationRecipients(conversation);
  const saved = await persistConversation(next, accessRows, true);
  if (!saved) return;
  const addedRecipients = conversationNotificationRecipients(next).filter((profileId) => !previousRecipients.includes(profileId));
  if (addedRecipients.length) {
    notifyLocalEvent('message.group', 'Added to chat', `${actorName()} added you to ${next.title}.`, companyPath('messages', { conversation: next.id }, companyId), 'message_conversation', next.id, companyId, addedRecipients);
  }
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

async function saveCalendarEvent(form) {
  const companyId = activeCompanyId();
  const fields = Object.fromEntries(new FormData(form).entries());
  const existing = fields.id ? manualCalendarEventById(String(fields.id)) : null;
  if (!existing && !can('calendar.manage', companyId)) {
    showToast('Your role cannot create or edit calendar events.', 'local', 'Calendar');
    return;
  }
  if (existing && !canEditCalendarEvent(existing)) {
    showToast('This event cannot be edited from Calendar.', 'local', 'Calendar');
    return;
  }
  const linkedJobId = String(fields.linked_job_id || '').trim();
  const now = new Date().toISOString();
  let eventRecord = normalizeCalendarEvent({
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    company_id: companyId,
    title: String(fields.title || '').trim() || 'Calendar event',
    description: String(fields.description || '').trim(),
    event_type: CALENDAR_EVENT_TYPES.includes(fields.event_type) ? String(fields.event_type) : 'Company event',
    starts_at: localDateTimeToIso(fields.starts_at),
    ends_at: localDateTimeToIso(fields.ends_at || fields.starts_at),
    all_day: fields.all_day === 'on',
    visibility: fields.visibility === 'private' ? 'private' : 'company',
    linked_type: linkedJobId ? 'job' : '',
    linked_id: linkedJobId,
    assigned_profile_id: String(fields.assigned_profile_id || ''),
    created_by: existing?.created_by || activeSession().profile.id,
    created_at: existing?.created_at || now,
    updated_at: now,
  });
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const payload = calendarEventPayload(eventRecord);
    if (existing) delete payload.id;
    const result = existing
      ? await client.from('calendar_events').update({ ...payload, updated_at: now }).eq('id', existing.id).select().single()
      : await client.from('calendar_events').insert(payload).select().single();
    if (result.error) {
      showToast(result.error.message || 'Calendar event save failed.', 'local', 'Calendar');
      return;
    }
    eventRecord = normalizeCalendarEvent(result.data);
  }
  state.calendarEvents = [eventRecord].concat(state.calendarEvents.filter((item) => item.id !== eventRecord.id));
  persistCalendarEvents();
  notifyLocalEvent('calendar.event', existing ? 'Calendar event updated' : 'Calendar event created', `${actorName()} ${existing ? 'updated' : 'created'} ${eventRecord.title}.`, companyPath('calendar', {}, companyId), 'calendar_event', eventRecord.id, companyId);
  state.selectedCalendarEventId = `manual:${eventRecord.id}`;
  state.modal = 'calendar-event-detail';
  render();
}

async function deleteCalendarEvent(eventId) {
  const eventRecord = manualCalendarEventById(eventId);
  if (!eventRecord || !canEditCalendarEvent(eventRecord)) {
    showToast('This event cannot be deleted from Calendar.', 'local', 'Calendar');
    return;
  }
  const client = createSupabaseClient();
  if (state.session?.auth === 'supabase' && client) {
    const result = await client.from('calendar_events').delete().eq('id', eventRecord.id);
    if (result.error) {
      showToast(result.error.message || 'Calendar event delete failed.', 'local', 'Calendar');
      return;
    }
  }
  state.calendarEvents = state.calendarEvents.filter((item) => item.id !== eventRecord.id);
  persistCalendarEvents();
  notifyLocalEvent('calendar.event', 'Calendar event deleted', `${actorName()} deleted ${eventRecord.title}.`, companyPath('calendar', {}, eventRecord.company_id), 'calendar_event', eventRecord.id, eventRecord.company_id);
  state.selectedCalendarEventId = '';
  state.modal = '';
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
  if (event.target.matches('[data-account-search]')) {
    state.accountQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-deal-search]')) {
    state.dealQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-message-search]')) {
    state.messageQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-calendar-search]')) {
    state.calendarQuery = event.target.value;
    updateWorkspaceOnly();
    return;
  }
  if (event.target.matches('[data-message-access-filter]')) {
    filterMessagePeopleList(event.target);
    return;
  }
  if (event.target.matches('[data-profile-crop-zoom], [data-profile-crop-x], [data-profile-crop-y]')) {
    updateProfileAvatarCrop(event.target.closest('[data-profile-form]'));
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
  if (event.target.matches('[data-calendar-type-filter]')) {
    state.calendarTypeFilter = event.target.value || 'all';
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
  if (event.target.matches('[data-profile-avatar-file]')) {
    prepareProfileAvatarCrop(event.target.closest('[data-profile-form]')).catch((error) => {
      showToast(error.message || 'Could not preview that profile picture.', 'local', 'Profile');
    });
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
  if (!requirePermission('jobs.manage', payload.company_id, 'Your role can view jobs but cannot create or edit them.', 'Jobs')) return;
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
  if (!requirePermission('jobs.manage', companyId, 'Your role cannot delete jobs.', 'Jobs')) return;
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
  if (!requirePermission('tasks.manage', companyId, 'Your role can view tasks but cannot create or edit them.', 'Tasks')) return;
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
  if (!requirePermission('tasks.manage', companyId, 'Your role cannot delete tasks.', 'Tasks')) return;
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
  if (!requirePermission('files.manage', companyId, 'Your role can view files but cannot upload.', 'Files')) return;
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
  const companyId = canonicalCompanyId(fields.company_id || activeCompanyId());
  if (!requirePermission('files.manage', companyId, 'Your role can view files but cannot create folders.', 'Files')) return;
  const name = String(fields.name || '').trim();
  if (!name) {
    state.sync = { label: 'Folder name is required', mode: 'local' };
    render();
    return;
  }
  const folder = normalizeDriveFolder({
    id: `folder-${crypto.randomUUID()}`,
    company_id: companyId,
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

async function saveFinanceInvoice(form) {
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
  const persisted = await persistFinanceRow('finance_invoices', invoicePayload(invoice), 'Invoice save failed');
  if (!persisted) return;
  upsertFinanceInvoice(invoice);
  if (previous?.job_id && previous.job_id !== invoice.job_id) syncJobInvoiceTotal(previous.job_id);
  syncJobInvoiceTotal(invoice.job_id);
  state.modal = '';
  state.sync = { label: state.session?.auth === 'supabase' ? 'Invoice saved securely' : 'Finance saved locally', mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  notifyLocalEvent('finance.invoice', previous ? 'Invoice updated' : 'Invoice created', `${actorName()} ${previous ? 'updated' : 'created'} ${invoice.invoice_number}.`, companyPath('finance', { invoice: invoice.id }, companyId), 'invoice', invoice.id, companyId);
  navigate(companyPath('finance', { invoice: invoice.id }, companyId), { replace: true });
}

async function saveFinancePayment(form) {
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
  const persistedPayment = await persistFinanceRow('finance_payments', paymentPayload(payment), 'Payment save failed');
  if (!persistedPayment) return;
  invoice.status = invoiceBalance(invoice.id) - payment.amount <= 0 ? 'Paid' : 'Partially paid';
  invoice.updated_at = new Date().toISOString();
  const persistedInvoice = await persistFinanceRow('finance_invoices', invoicePayload(invoice), 'Invoice status update failed');
  if (!persistedInvoice) return;
  state.financePayments.unshift(payment);
  syncJobInvoiceTotal(invoice.job_id);
  persistAll();
  state.modal = '';
  state.sync = { label: state.session?.auth === 'supabase' ? 'Payment recorded securely' : 'Payment recorded locally', mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  notifyLocalEvent('finance.payment', 'Payment recorded', `${actorName()} recorded ${money(payment.amount)} for ${invoice.invoice_number}.`, companyPath('finance', { invoice: payment.invoice_id }, companyId), 'payment', payment.id, companyId);
  navigate(companyPath('finance', payment.invoice_id ? { invoice: payment.invoice_id } : {}, companyId), { replace: true });
}

async function saveFinanceExpense(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const expense = normalizeFinanceExpense({
    ...fields,
    id: String(fields.id || '').trim() || `expense-${crypto.randomUUID()}`,
    company_id: companyId,
    updated_at: new Date().toISOString(),
  });
  const persisted = await persistFinanceRow('finance_expenses', expensePayload(expense), 'Expense save failed');
  if (!persisted) return;
  upsertFinanceExpense(expense);
  state.modal = '';
  state.sync = { label: state.session?.auth === 'supabase' ? 'Expense saved securely' : 'Expense saved locally', mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  notifyLocalEvent('finance.expense', 'Expense saved', `${actorName()} saved a ${money(expense.amount)} ${expense.category} expense.`, companyPath('finance', { expense: expense.id }, companyId), 'expense', expense.id, companyId);
  navigate(companyPath('finance', { expense: expense.id }, companyId), { replace: true });
}

async function saveFinanceVendor(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const companyId = activeCompanyId();
  const vendor = normalizeFinanceVendor({
    ...fields,
    id: String(fields.id || '').trim() || `vendor-${crypto.randomUUID()}`,
    company_id: companyId,
    updated_at: new Date().toISOString(),
  });
  const persisted = await persistFinanceRow('finance_vendors', vendorPayload(vendor), 'Vendor save failed');
  if (!persisted) return;
  upsertFinanceVendor(vendor);
  state.modal = '';
  state.sync = { label: state.session?.auth === 'supabase' ? 'Vendor saved securely' : 'Vendor saved locally', mode: state.session?.auth === 'supabase' ? 'live' : 'local' };
  notifyLocalEvent('finance.vendor', 'Vendor saved', `${actorName()} saved vendor ${vendor.name}.`, companyPath('finance', { vendor: vendor.id }, companyId), 'vendor', vendor.id, companyId);
  navigate(companyPath('finance', { vendor: vendor.id }, companyId), { replace: true });
}

async function persistFinanceRow(table, payload, fallbackLabel) {
  if (state.session?.auth !== 'supabase') return true;
  const client = createSupabaseClient();
  if (!client) {
    state.sync = { label: 'Supabase is unavailable', mode: 'local' };
    render();
    return false;
  }
  if (!can('finance.manage', payload.company_id)) {
    state.sync = { label: 'Your role cannot manage finance records', mode: 'local' };
    render();
    return false;
  }
  const result = await client.from(table).upsert(payload, { onConflict: 'id' }).select().single();
  if (result.error) {
    state.sync = { label: result.error.message || fallbackLabel, mode: 'local' };
    showToast(result.error.message || fallbackLabel, 'local', 'Finance');
    render();
    return false;
  }
  return true;
}

function invoicePayload(invoice) {
  return {
    id: invoice.id,
    company_id: invoice.company_id,
    job_id: invoice.job_id || null,
    client_name: invoice.client_name,
    invoice_number: invoice.invoice_number,
    status: invoice.status,
    issue_date: invoice.issue_date || null,
    due_date: invoice.due_date || null,
    subtotal: number(invoice.subtotal),
    tax: number(invoice.tax),
    total: number(invoice.total),
    notes: invoice.notes || '',
    created_by: activeSession().profile.id || null,
    updated_at: new Date().toISOString(),
  };
}

function paymentPayload(payment) {
  return {
    id: payment.id,
    company_id: payment.company_id,
    invoice_id: payment.invoice_id,
    amount: number(payment.amount),
    method: payment.method,
    received_at: payment.received_at || null,
    reference: payment.reference || '',
    notes: payment.notes || '',
    created_by: activeSession().profile.id || null,
    updated_at: new Date().toISOString(),
  };
}

function expensePayload(expense) {
  return {
    id: expense.id,
    company_id: expense.company_id,
    job_id: expense.job_id || null,
    vendor_id: expense.vendor_id || null,
    category: expense.category,
    amount: number(expense.amount),
    status: expense.status,
    spent_at: expense.spent_at || null,
    notes: expense.notes || '',
    created_by: activeSession().profile.id || null,
    updated_at: new Date().toISOString(),
  };
}

function vendorPayload(vendor) {
  return {
    id: vendor.id,
    company_id: vendor.company_id,
    name: vendor.name,
    contact_name: vendor.contact_name || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    category: vendor.category,
    status: vendor.status,
    notes: vendor.notes || '',
    created_by: activeSession().profile.id || null,
    updated_at: new Date().toISOString(),
  };
}

async function downloadFile(id) {
  const file = state.files.find((item) => item.id === id);
  if (file && !requirePermission('files.view', file.company_id, 'Your role cannot view this file.', 'Files')) return;
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
  if (!requirePermission('files.manage', file.company_id, 'Your role cannot delete files.', 'Files')) return;
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
  if (path === '/') return { name: 'home', path, params, section: '', companyId: '', jobId: '' };
  if (path === '/command') return { name: 'command', path, params, section: 'dashboard', companyId: activeCompanyId(), jobId: params.get('job_id') || '' };
  const companyMatch = path.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (companyMatch) {
    const section = companyMatch[2] || 'home';
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
    '/index.html': '/',
    '/command.html': companyPath('home', {}, companyId),
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
  if (path === '/underwriter') target = companyPath('underwriter', copyParams(params, ['stage']), companyId);
  if (path === '/finance') target = companyPath('finance', copyParams(params, ['invoice', 'expense', 'vendor', 'report']), companyId);
  if (path === '/messages') target = companyPath('messages', copyParams(params, ['conversation']), companyId);
  if (path === '/calendar') target = companyPath('calendar', {}, companyId);
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
  if (route.section === 'home' && /^\/company\/[^/]+\/?$/.test(route.path)) {
    return companyPath('home', {}, route.companyId);
  }
  const allowed = allowedCompanyIds();
  if (state.session?.auth === 'supabase' && !allowed.length) return null;
  if (!allowed.includes(route.companyId)) {
    if (state.session?.auth === 'supabase') return '';
    return companyPath(route.section || 'jobs', Object.fromEntries(route.params.entries()), allowed[0] || defaultCompanyId());
  }
  const validSections = MODULE_REGISTRY.map((module) => module.id);
  if (!validSections.includes(route.section)) return companyPath('home', {}, route.companyId);
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
  if (route.name === 'home') return 'Quest HQ';
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
  applyPipelineStagesForCompany(state.activeCompanyId);
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
  applyPipelineStagesForCompany(next);
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
  state.selectedCalendarEventId = '';
  state.query = '';
  state.fileQuery = '';
  state.formQuery = '';
  state.crmQuery = '';
  state.contactQuery = '';
  state.selectedContactId = '';
  state.contactStageFilter = 'all';
  state.dealQuery = '';
  state.selectedDealId = '';
  state.stageFilterDeals = 'all';
  state.accountQuery = '';
  state.selectedAccountId = '';
  state.accountTypeFilter = 'all';
  state.accountTab = 'overview';
  state.stageFilter = 'all';
  state.crmStageFilter = 'all';
  state.crmOwnerFilter = 'all';
  state.taskStatusFilter = 'all';
  state.taskPriorityFilter = 'all';
  state.calendarQuery = '';
  state.calendarTypeFilter = 'all';
  state.calendarScope = 'company';
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

function calendarItems(companyId = activeCompanyId()) {
  const manual = state.calendarEvents
    .filter((event) => event.company_id === companyId && canAccessCalendarEvent(event))
    .map(calendarManualItem);
  const tasks = companyTasks(companyId)
    .filter((task) => task.due && task.status !== 'done')
    .filter((task) => can('calendar.view_team', companyId) || taskAssignedToMe(task.assignee_id) || task.creator_id === activeSession().profile.member_id)
    .map(calendarTaskItem);
  const finance = can('finance.view', companyId)
    ? companyFinanceInvoices(companyId)
      .filter((invoice) => invoice.due_date && invoiceBalance(invoice.id) > 0)
      .map(calendarInvoiceItem)
    : [];
  const approvals = approvalItems(companyId)
    .filter((item) => item.type !== 'Access request' || can('users.manage', companyId))
    .map((item) => calendarApprovalItem(item, companyId));
  const timer = activeTimerForCompany(companyId);
  const time = timer && (can('calendar.view_team', companyId) || calendarPersonMatchesMe(timer.user_id)) ? [calendarTimerItem(timer)] : [];
  return manual.concat(tasks, finance, approvals, time).sort((a, b) => Date.parse(a.startsAt || 0) - Date.parse(b.startsAt || 0));
}

function filteredCalendarItems(companyId = activeCompanyId()) {
  const query = state.calendarQuery.trim().toLowerCase();
  return calendarItems(companyId)
    .filter((item) => state.calendarScope === 'company' || item.mine)
    .filter((item) => state.calendarTypeFilter === 'all' || item.type === state.calendarTypeFilter)
    .filter((item) => {
      if (!query) return true;
      return [item.title, item.description, item.type, item.owner, item.linkLabel]
        .some((value) => String(value || '').toLowerCase().includes(query));
    })
    .filter((item) => state.calendarView === 'list' || calendarItemInVisibleRange(item));
}

function calendarUpcomingItems(companyId = activeCompanyId()) {
  const now = Date.now();
  return calendarItems(companyId)
    .filter((item) => Date.parse(item.endsAt || item.startsAt || 0) >= now)
    .slice(0, 9);
}

function calendarManualItem(event) {
  const job = event.linked_type === 'job' ? jobById(event.linked_id) : null;
  return {
    id: `manual:${event.id}`,
    source: 'manual',
    sourceId: event.id,
    companyId: event.company_id,
    title: event.title,
    description: event.description,
    type: event.event_type,
    startsAt: event.starts_at,
    endsAt: event.ends_at || event.starts_at,
    allDay: event.all_day,
    dateKey: calendarDateKey(event.starts_at),
    owner: calendarPersonName(event.assigned_profile_id || event.created_by),
    mine: calendarPersonMatchesMe(event.assigned_profile_id) || event.created_by === activeSession().profile.id,
    href: calendarLinkedHref(event),
    linkLabel: job?.name || '',
    editable: canEditCalendarEvent(event),
  };
}

function calendarTaskItem(task) {
  const startsAt = task.due_time ? `${task.due}T${task.due_time}:00` : `${task.due}T12:00:00`;
  return {
    id: `task:${task.id}`,
    source: 'task',
    sourceId: task.id,
    companyId: task.company_id,
    title: task.title,
    description: task.description || taskTypeLabel(task.type),
    type: 'Task due',
    startsAt,
    endsAt: startsAt,
    allDay: !task.due_time,
    dateKey: task.due,
    owner: memberName(task.assignee_id),
    mine: taskAssignedToMe(task.assignee_id),
    href: companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, task.company_id),
    linkLabel: jobById(task.project_id)?.name || 'Company task',
    editable: false,
  };
}

function calendarInvoiceItem(invoice) {
  return {
    id: `invoice:${invoice.id}`,
    source: 'invoice',
    sourceId: invoice.id,
    companyId: invoice.company_id,
    title: `${invoice.invoice_number} due`,
    description: `${money(invoiceBalance(invoice.id))} outstanding for ${invoice.client_name || 'client'}.`,
    type: 'Invoice due',
    startsAt: `${invoice.due_date}T12:00:00`,
    endsAt: `${invoice.due_date}T12:00:00`,
    allDay: true,
    dateKey: invoice.due_date,
    owner: invoice.client_name || 'Finance',
    mine: can('finance.view', invoice.company_id),
    href: companyPath('finance', { invoice: invoice.id }, invoice.company_id),
    linkLabel: invoice.client_name || 'Finance',
    editable: false,
  };
}

function calendarApprovalItem(item, companyId = activeCompanyId()) {
  const dateKey = String(item.updatedAt || isoDate(0)).slice(0, 10);
  return {
    id: `approval:${item.id}`,
    source: 'approval',
    sourceId: item.id,
    companyId,
    title: item.title,
    description: item.meta,
    type: 'Approval',
    startsAt: `${dateKey}T12:00:00`,
    endsAt: `${dateKey}T12:00:00`,
    allDay: true,
    dateKey,
    owner: item.owner,
    mine: true,
    href: item.href,
    linkLabel: item.status,
    editable: false,
  };
}

function calendarTimerItem(timer) {
  const dateKey = calendarDateKey(timer.started_at);
  return {
    id: `timer:${timer.id}`,
    source: 'timer',
    sourceId: timer.id,
    companyId: timer.company_id,
    title: timer.task_title || 'Active timer',
    description: 'Current clock session.',
    type: 'Time',
    startsAt: timer.started_at,
    endsAt: new Date().toISOString(),
    allDay: false,
    dateKey,
    owner: memberName(timer.user_id),
    mine: calendarPersonMatchesMe(timer.user_id),
    href: companyPath('time', {}, timer.company_id),
    linkLabel: 'My time',
    editable: false,
  };
}

function canAccessCalendarEvent(event) {
  if (!event || !can('calendar.view', event.company_id)) return false;
  if (event.visibility !== 'private') return true;
  return can('calendar.view_team', event.company_id) || canEditCalendarEvent(event) || calendarPersonMatchesMe(event.assigned_profile_id);
}

function canEditCalendarEvent(event) {
  if (!event) return false;
  return can('calendar.manage', event.company_id) || event.created_by === activeSession().profile.id;
}

function calendarLinkedHref(event) {
  if (event.linked_type === 'job' && event.linked_id && can('jobs.view', event.company_id)) return companyPath('jobs', { tab: 'profile', job_id: event.linked_id }, event.company_id);
  if (event.linked_type === 'task' && event.linked_id && can('tasks.view', event.company_id)) return companyPath('tasks', { task_id: event.linked_id }, event.company_id);
  if (event.linked_type === 'form' && event.linked_id && can('forms.view', event.company_id)) return companyPath('forms', { form_id: event.linked_id }, event.company_id);
  if (event.linked_type === 'invoice' && event.linked_id && can('finance.view', event.company_id)) return companyPath('finance', { invoice: event.linked_id }, event.company_id);
  return '';
}

function calendarEventByKey(key, companyId = activeCompanyId()) {
  return calendarItems(companyId).find((item) => item.id === key) || null;
}

function manualCalendarEventById(id) {
  return state.calendarEvents.find((event) => event.id === id) || null;
}

function taskAssignedToMe(assigneeId) {
  return String(assigneeId || '') === String(activeSession().profile.member_id || activeSession().profile.id || '');
}

function calendarPersonMatchesMe(value) {
  const profile = activeSession().profile;
  return [profile.id, profile.member_id, profile.email].filter(Boolean).map(String).includes(String(value || ''));
}

function calendarPersonName(value) {
  if (!value) return 'Unassigned';
  return profileById(value)?.full_name || memberName(value) || String(value);
}

function calendarDateKey(value) {
  if (!value) return isoDate(0);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function calendarItemsForDate(items, dateKey) {
  return items.filter((item) => item.dateKey === dateKey).sort((a, b) => Date.parse(a.startsAt || 0) - Date.parse(b.startsAt || 0));
}

function calendarItemsThisWeek(items) {
  const start = startOfWeekDate(new Date());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return items.filter((item) => {
    const time = Date.parse(item.startsAt || item.dateKey || 0);
    return time >= start.getTime() && time < end.getTime();
  });
}

function calendarItemInVisibleRange(item) {
  const date = new Date(`${item.dateKey}T00:00:00`);
  if (state.calendarView === 'month') {
    const cursor = new Date(`${state.calendarCursorDate}T00:00:00`);
    return date.getFullYear() === cursor.getFullYear() && date.getMonth() === cursor.getMonth();
  }
  const start = startOfWeekDate(new Date(`${state.calendarCursorDate}T00:00:00`));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function calendarMonthDays(value) {
  const cursor = new Date(`${value}T00:00:00`);
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { key: localDateKey(date), label: String(date.getDate()), month: date.getMonth() };
  });
}

function calendarWeekDays(value) {
  const start = startOfWeekDate(new Date(`${value}T00:00:00`));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: localDateKey(date),
      name: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      shortDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
    };
  });
}

function calendarRangeLabel() {
  const cursor = new Date(`${state.calendarCursorDate}T00:00:00`);
  if (state.calendarView === 'month') return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(cursor);
  if (state.calendarView === 'week') {
    const days = calendarWeekDays(state.calendarCursorDate);
    return `${formatDate(days[0].key)} - ${formatDate(days[6].key)}`;
  }
  return 'Upcoming';
}

function startOfWeekDate(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function moveCalendarCursor(direction) {
  const date = new Date(`${state.calendarCursorDate}T00:00:00`);
  if (state.calendarView === 'month') date.setMonth(date.getMonth() + direction);
  else date.setDate(date.getDate() + direction * 7);
  state.calendarCursorDate = localDateKey(date);
}

function groupByDate(items) {
  return items.reduce((groups, item) => {
    groups[item.dateKey] = groups[item.dateKey] || [];
    groups[item.dateKey].push(item);
    return groups;
  }, {});
}

function calendarTimeLabel(item) {
  if (item.allDay) return 'All day';
  const start = new Date(item.startsAt);
  if (Number.isNaN(start.getTime())) return 'Timed';
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(start);
}

function calendarTypeClass(type) {
  return `calendar-type-${slugify(type || 'event')}`;
}

function calendarTypeIcon(type) {
  if (type === 'Task due') return 'ti-list-check';
  if (type === 'Invoice due') return 'ti-file-dollar';
  if (type === 'Approval') return 'ti-user-check';
  if (type === 'Time') return 'ti-clock';
  if (type.includes('Install')) return 'ti-hammer';
  if (type.includes('Estimate')) return 'ti-calendar-dollar';
  if (type.includes('Personal')) return 'ti-user';
  return 'ti-calendar-event';
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
  if (state.session?.auth !== 'supabase') {
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
  }
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

function filteredJobs(companyId = activeCompanyId(), ignoreStage = false) {
  const q = state.query.trim().toLowerCase();
  return companyJobs(companyId).filter((job) => {
    if (!ignoreStage && state.stageFilter !== 'all' && job.stage !== state.stageFilter) return false;
    if (!q) return true;
    return [job.name, job.client_name, job.contact_name, job.owner_name, job.site_address, job.job_type, companyName(job.company_id)]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}

function companyContacts(companyId = activeCompanyId()) {
  return state.contacts.filter((contact) => contact.company_id === companyId);
}

function filteredContacts(companyId = activeCompanyId(), ignoreStage = false) {
  const q = state.contactQuery.trim().toLowerCase();
  return companyContacts(companyId).filter((contact) => {
    if (!ignoreStage && state.contactStageFilter !== 'all' && contact.stage !== state.contactStageFilter) return false;
    if (!q) return true;
    return [contact.name, contact.phone, contact.email, contact.location, contact.owner_name, contact.stage]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}

function contactById(id) {
  return state.contacts.find((contact) => contact.id === id) || null;
}

function selectedContact() {
  return contactById(state.selectedContactId);
}

function persistContacts() {
  writeJson(CONTACT_CACHE_KEY, state.contacts);
}

function upsertContact(contact) {
  const index = state.contacts.findIndex((item) => item.id === contact.id);
  if (index >= 0) state.contacts[index] = contact;
  else state.contacts.push(contact);
  persistContacts();
}

function pipelineStageRouteParams(stage) {
  return stage && stage !== 'all' ? { stage } : {};
}

function isPipelineDetailRoute(route, kind) {
  if (!route || route.name !== 'company' || route.section !== kind) return false;
  if (kind === 'contacts') return route.params.has('contact_id');
  if (kind === 'deals') return route.params.has('deal_id');
  if (kind === 'jobs') return route.params.has('job_id');
  return false;
}

function setPipelineStage(kind, stage, forceNav) {
  if (!['contacts', 'jobs', 'deals'].includes(kind)) return;
  const nextStage = stage || 'all';
  if (kind === 'contacts') state.contactStageFilter = nextStage;
  else if (kind === 'deals') state.stageFilterDeals = nextStage;
  else state.stageFilter = nextStage;
  const route = state.route;
  const onSection = route?.name === 'company' && route.section === kind;
  if (forceNav || !onSection || isPipelineDetailRoute(route, kind)) {
    navigate(companyPath(kind, pipelineStageRouteParams(nextStage), activeCompanyId()));
  }
  else render();
}

// ---- CRM getters + CRUD: accounts / deals / activities --------------------
function companyAccounts(companyId = activeCompanyId()) {
  return state.accounts.filter((account) => account.company_id === companyId);
}
function accountById(id) {
  return id ? state.accounts.find((account) => account.id === id) || null : null;
}
function accountName(id) {
  return accountById(id)?.name || '';
}
function selectedAccount() {
  return accountById(state.selectedAccountId);
}
function filteredAccounts(companyId = activeCompanyId()) {
  const q = state.accountQuery.trim().toLowerCase();
  return companyAccounts(companyId).filter((account) => {
    if (state.accountTypeFilter !== 'all' && account.type !== state.accountTypeFilter) return false;
    if (!q) return true;
    return [account.name, account.industry, account.email, account.phone, account.owner_name, account.address]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}

function companyDeals(companyId = activeCompanyId()) {
  return state.deals.filter((deal) => deal.company_id === companyId);
}
function dealById(id) {
  return id ? state.deals.find((deal) => deal.id === id) || null : null;
}
function selectedDeal() {
  return dealById(state.selectedDealId);
}
function filteredDeals(companyId = activeCompanyId(), ignoreStage = false) {
  const q = state.dealQuery.trim().toLowerCase();
  return companyDeals(companyId).filter((deal) => {
    if (!ignoreStage && state.stageFilterDeals !== 'all' && deal.stage !== state.stageFilterDeals) return false;
    if (!q) return true;
    return [deal.name, deal.owner_name, deal.source, deal.stage, accountName(deal.account_id), contactById(deal.primary_contact_id)?.name]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });
}
function dealsForAccount(accountId) {
  return state.deals.filter((deal) => deal.account_id === accountId);
}
function contactsForAccount(accountId) {
  return state.contacts.filter((contact) => contact.account_id === accountId);
}
function jobsForAccount(accountId) {
  return state.jobs.filter((job) => job.account_id === accountId);
}

function companyActivities(companyId = activeCompanyId()) {
  return state.activities.filter((activity) => activity.company_id === companyId);
}
function activitiesFor(relatedType, relatedId) {
  if (!relatedId) return [];
  return state.activities
    .filter((activity) => activity.related_type === relatedType && activity.related_id === relatedId)
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}
function activitiesForAccount(accountId) {
  if (!accountId) return [];
  return state.activities
    .filter((activity) => activity.account_id === accountId || (activity.related_type === 'account' && activity.related_id === accountId))
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

function persistAccounts() { writeJson(ACCOUNT_CACHE_KEY, state.accounts); }
function persistDeals() { writeJson(DEAL_CACHE_KEY, state.deals); }
function persistActivities() { writeJson(ACTIVITY_CACHE_KEY, state.activities); }

function upsertAccount(account) {
  const index = state.accounts.findIndex((item) => item.id === account.id);
  if (index >= 0) state.accounts[index] = account;
  else state.accounts.push(account);
  persistAccounts();
}
function upsertDeal(deal) {
  const index = state.deals.findIndex((item) => item.id === deal.id);
  if (index >= 0) state.deals[index] = deal;
  else state.deals.push(deal);
  persistDeals();
}
function upsertActivity(activity) {
  const index = state.activities.findIndex((item) => item.id === activity.id);
  if (index >= 0) state.activities[index] = activity;
  else state.activities.unshift(activity);
  persistActivities();
}

// Strip app-only/derived keys before sending a row to Supabase.
function supabaseRow(payload, allowed) {
  const row = {};
  allowed.forEach((key) => { if (payload[key] !== undefined) row[key] = payload[key]; });
  return row;
}

async function supabaseWrite(table, row, { onConflict = 'id' } = {}) {
  const client = createSupabaseClient();
  if (!client) return { ok: false, data: null, error: null };
  try {
    const result = await client.from(table).upsert(row, { onConflict }).select().single();
    if (!result.error && result.data) return { ok: true, data: result.data, error: null };
    if (result.error) console.warn(`${table} write rejected:`, result.error.message || result.error, result.error.details || '');
    return { ok: false, data: null, error: result.error };
  } catch (error) {
    console.warn(`${table} save sync failed`, error);
    return { ok: false, data: null, error };
  }
}

async function supabaseDelete(table, id) {
  const client = createSupabaseClient();
  if (!client) return;
  try {
    await client.from(table).delete().eq('id', id);
  } catch (error) {
    console.warn(`${table} delete sync failed`, error);
  }
}

const ACCOUNT_COLS = ['id', 'company_id', 'name', 'type', 'industry', 'website', 'phone', 'email', 'address', 'owner_name', 'status', 'notes', 'updated_at'];
const DEAL_COLS = ['id', 'company_id', 'account_id', 'primary_contact_id', 'name', 'stage', 'status', 'value', 'probability', 'close_date', 'owner_name', 'source', 'job_id', 'notes', 'updated_at'];
const ACTIVITY_COLS = ['id', 'company_id', 'type', 'subject', 'body', 'related_type', 'related_id', 'account_id', 'due_at', 'completed_at', 'owner_name', 'updated_at'];
const CONTACT_COLS = ['id', 'company_id', 'name', 'phone', 'email', 'location', 'stage', 'value', 'owner_name', 'account_id', 'title', 'source', 'temperature', 'pay_type', 'roof_system', 'last_activity_at', 'notes', 'updated_at'];

function emptyToNull(row, keys) {
  keys.forEach((key) => { if (row[key] === '') row[key] = null; });
  return row;
}

async function saveAccount(form) {
  const payload = normalizeAccount(Object.fromEntries(new FormData(form).entries()));
  payload.id = payload.id || `account-${crypto.randomUUID()}`;
  payload.updated_at = new Date().toISOString();
  const { ok, data } = await supabaseWrite('accounts', supabaseRow(payload, ACCOUNT_COLS));
  upsertAccount(ok && data ? normalizeAccount(data) : payload);
  state.selectedAccountId = payload.id;
  state.modal = '';
  showToast(`${payload.name} saved.`, ok ? 'live' : 'local', 'Accounts');
  render();
}

async function deleteAccount(id) {
  if (!id) return;
  await supabaseDelete('accounts', id);
  state.accounts = state.accounts.filter((account) => account.id !== id);
  persistAccounts();
  if (state.selectedAccountId === id) state.selectedAccountId = '';
  state.modal = '';
  navigate(companyPath('crm', {}, activeCompanyId()), { replace: true });
}

async function saveDeal(form) {
  const payload = normalizeDeal(Object.fromEntries(new FormData(form).entries()));
  payload.id = payload.id || `deal-${crypto.randomUUID()}`;
  // Keep status in sync with terminal stage names so KPIs / badges stay correct.
  if (/^won/i.test(payload.stage)) payload.status = 'won';
  else if (/^lost/i.test(payload.stage)) payload.status = 'lost';
  else if (payload.status !== 'open' && !/^won|^lost/i.test(payload.stage)) payload.status = 'open';
  payload.updated_at = new Date().toISOString();
  const previous = dealById(payload.id);
  const row = emptyToNull(supabaseRow(payload, DEAL_COLS), ['account_id', 'primary_contact_id', 'close_date', 'job_id']);
  const { ok, data } = await supabaseWrite('deals', row);
  upsertDeal(ok && data ? normalizeDeal(data) : payload);
  if (previous && previous.stage !== payload.stage) {
    logActivity({ type: 'stage_change', subject: `Stage → ${payload.stage}`, related_type: 'deal', related_id: payload.id, account_id: payload.account_id });
  }
  state.selectedDealId = payload.id;
  state.modal = '';
  showToast(`${payload.name} saved.`, ok ? 'live' : 'local', 'Quotes');
  render();
}

async function persistDeal(deal, label = 'Quote saved.') {
  const payload = normalizeDeal({ ...deal, updated_at: new Date().toISOString() });
  if (/^won/i.test(payload.stage)) payload.status = 'won';
  else if (/^lost/i.test(payload.stage)) payload.status = 'lost';
  else if (payload.status !== 'open' && !/^won|^lost/i.test(payload.stage)) payload.status = 'open';
  const row = emptyToNull(supabaseRow(payload, DEAL_COLS), ['account_id', 'primary_contact_id', 'close_date', 'job_id']);
  const { ok, data } = await supabaseWrite('deals', row);
  upsertDeal(ok && data ? normalizeDeal(data) : payload);
  showToast(label, ok ? 'live' : 'local', 'Quotes');
  render();
  return payload;
}

async function setDealStage(dealId, stage) {
  const deal = dealById(dealId);
  if (!deal || !stage || deal.stage === stage) return;
  await persistDeal({ ...deal, stage }, 'Quote stage saved.');
  await logActivity({ type: 'stage_change', subject: `Stage → ${stage}`, related_type: 'deal', related_id: dealId, account_id: deal.account_id });
}

function markDealNextStage(dealId) {
  const deal = dealById(dealId);
  const names = dealStageNames();
  const idx = deal ? names.indexOf(deal.stage) : -1;
  if (!deal || idx < 0 || idx >= names.length - 1) return;
  setDealStage(deal.id, names[idx + 1]);
}

function patchDealField(dealId, key, raw) {
  const deal = dealById(dealId);
  if (!deal) return;
  let value;
  if (key === 'value' || key === 'probability') value = Number(String(raw).replace(/[^0-9.]/g, '')) || 0;
  else value = String(raw).trim();
  if (deal[key] === value) { render(); return; }
  persistDeal({ ...deal, [key]: value }, 'Quote field saved.');
}

function beginDealInlineEdit(span) {
  const key = span.dataset.dealEdit;
  const dealId = span.dataset.dealId;
  const deal = dealById(dealId);
  if (!deal) return;
  const input = document.createElement('input');
  input.className = 'sf-edit-input';
  input.value = (key === 'value' || key === 'probability') ? (deal[key] || 0) : (deal[key] || '');
  span.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = () => { if (done) return; done = true; patchDealField(dealId, key, input.value); };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { done = true; render(); }
  });
}

async function createDealTask(dealId, title) {
  const deal = dealById(dealId);
  const clean = String(title || '').trim();
  if (!deal || !clean) return;
  const payload = normalizeTask({
    id: `task-${crypto.randomUUID()}`,
    company_id: deal.company_id,
    title: clean,
    contact_id: deal.primary_contact_id,
    creator_id: activeSession().profile.member_id || companyMembers(deal.company_id)[0]?.id || 'abraham',
    status: 'todo',
    due: isoDate(1),
  });
  upsertTask(payload);
  render();
  const client = createSupabaseClient();
  if (client) {
    try {
      const result = await client.from('tasks').insert(taskPayload(payload)).select().single();
      if (!result.error && result.data) { upsertTask(normalizeTask(result.data)); render(); }
    } catch (error) { console.warn('Quote task sync failed', error); }
  }
}

async function logDealActivity(dealId, type, subject, body = '') {
  const deal = dealById(dealId);
  if (!deal) return;
  await logActivity({ type, subject, body, related_type: 'deal', related_id: dealId, account_id: deal.account_id });
  render();
}

function dealQuickCreate(dealId, kind) {
  if (kind === 'Task' || kind === 'New Task') return createDealTask(dealId, 'New quote task');
  if (kind === 'Note') return logDealActivity(dealId, 'note', 'Note added');
  if (kind === 'Call Log' || kind === 'Log a Call') return logDealActivity(dealId, 'call', 'Logged a call');
  if (kind === 'Meeting' || kind === 'New Event') return logDealActivity(dealId, 'meeting', 'Meeting scheduled');
  if (kind === 'Follow') return showToast('Following this quote.', 'local', 'Quotes');
  return showToast(`${kind} isn't set up yet.`, 'local', 'Quotes');
}

async function postDealNote(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const text = String(data.body || '').trim();
  const dealId = String(data.deal_id || '');
  if (!text) return;
  const tab = state.dealActivityTab || 'Email';
  if (tab === 'New Task') return createDealTask(dealId, text);
  const typeMap = { Email: 'email', 'Log a Call': 'call', 'New Event': 'meeting' };
  await logDealActivity(dealId, typeMap[tab] || 'note', '', text);
}

async function deleteDeal(id) {
  if (!id) return;
  await supabaseDelete('deals', id);
  state.deals = state.deals.filter((deal) => deal.id !== id);
  persistDeals();
  if (state.selectedDealId === id) state.selectedDealId = '';
  state.modal = '';
  navigate(companyPath('deals', {}, activeCompanyId()), { replace: true });
}

async function logActivity(input) {
  // Resolve a real account_id: explicit, valid, or derived from the related record.
  let accountId = accountById(input.account_id) ? input.account_id : '';
  if (!accountId) {
    if (input.related_type === 'account') accountId = input.related_id;
    else if (input.related_type === 'deal') accountId = dealById(input.related_id)?.account_id || '';
    else if (input.related_type === 'contact') accountId = contactById(input.related_id)?.account_id || '';
    else if (input.related_type === 'job') accountId = jobById(input.related_id)?.account_id || '';
  }
  if (!accountById(accountId)) accountId = '';
  const payload = normalizeActivity({
    ...input,
    id: input.id || `activity-${crypto.randomUUID()}`,
    company_id: activeCompanyId(),
    account_id: accountId,
    owner_name: input.owner_name || activeSession().profile.full_name || '',
    completed_at: input.completed_at || (input.type === 'note' || input.type === 'stage_change' ? new Date().toISOString() : input.completed_at),
  });
  payload.updated_at = new Date().toISOString();
  const row = emptyToNull(supabaseRow(payload, ACTIVITY_COLS), ['account_id', 'due_at', 'completed_at']);
  const { ok, data } = await supabaseWrite('activities', row);
  upsertActivity(ok && data ? normalizeActivity(data) : payload);
  // Stamp last_activity_at on a related contact.
  if (input.related_type === 'contact') {
    const contact = contactById(input.related_id);
    if (contact) {
      const updated = { ...contact, last_activity_at: payload.completed_at || payload.created_at, updated_at: new Date().toISOString() };
      upsertContact(updated);
      supabaseWrite('contacts', emptyToNull(supabaseRow(updated, CONTACT_COLS), ['account_id']));
    }
  }
  return payload;
}

async function saveActivityForm(form) {
  const formData = Object.fromEntries(new FormData(form).entries());
  await logActivity({
    type: formData.type,
    subject: formData.subject,
    body: formData.body,
    related_type: formData.related_type,
    related_id: formData.related_id,
    account_id: formData.account_id,
  });
  state.modal = '';
  showToast('Activity logged.', 'local', 'CRM');
  render();
}

async function deleteActivity(id) {
  if (!id) return;
  await supabaseDelete('activities', id);
  state.activities = state.activities.filter((activity) => activity.id !== id);
  persistActivities();
  render();
}

// Convert a won deal into a production Job (interconnect CRM -> Jobs).
async function convertDealToJob(dealId) {
  const deal = dealById(dealId);
  if (!deal) return;
  const companyId = deal.company_id;
  if (!requirePermission('jobs.manage', companyId, 'Your role cannot create jobs.', 'Jobs')) return;
  const account = accountById(deal.account_id);
  const contact = contactById(deal.primary_contact_id);
  const job = normalizeJob({
    id: '',
    company_id: companyId,
    name: deal.name,
    client_name: account?.name || '',
    contact_name: contact?.name || '',
    site_address: account?.address || '',
    owner_name: deal.owner_name,
    estimate_total: deal.value,
    stage: jobStageNames()[0],
    account_id: deal.account_id,
    deal_id: deal.id,
    scope: deal.notes,
  });
  job.id = crypto.randomUUID();
  job.updated_at = new Date().toISOString();
  const jobRow = supabaseRow(job, ['id', 'company_id', 'name', 'client_name', 'contact_name', 'site_address', 'job_type', 'stage', 'priority', 'owner_name', 'scope', 'notes', 'estimate_total', 'invoice_total', 'account_id', 'deal_id', 'updated_at']);
  emptyToNull(jobRow, ['account_id', 'deal_id']);
  const { ok, data } = await supabaseWrite('jobs', jobRow);
  upsertJob(ok && data ? normalizeJob(data) : job);
  // mark the deal won + link the job
  const wonStage = dealStageNames().find((name) => /win|won/i.test(name)) || deal.stage;
  const updatedDeal = normalizeDeal({ ...deal, status: 'won', stage: wonStage, job_id: job.id, updated_at: new Date().toISOString() });
  const dealRes = await supabaseWrite('deals', emptyToNull(supabaseRow(updatedDeal, DEAL_COLS), ['account_id', 'primary_contact_id', 'close_date', 'job_id']));
  upsertDeal(updatedDeal);
  logActivity({ type: 'system', subject: 'Quote converted → Job created', body: deal.name, related_type: 'deal', related_id: deal.id, account_id: deal.account_id });
  state.selectedJobId = job.id;
  state.modal = '';
  const live = ok && dealRes.ok;
  showToast('Quote converted to job.', live ? 'live' : 'local', 'Quotes');
  navigate(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId));
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
  if (!requirePermission('time.track', companyId, 'Your role cannot track time in this workspace.', 'Time')) return;
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
  if (!permissionAvailableForCompany(permission, companyId)) return false;
  const previewRole = rolePreviewForCompany(companyId);
  if (previewRole) return roleAllowsPermission(previewRole, permission);
  const variants = permissionVariants(permission);
  const profile = activeSession().profile;
  if (state.session?.auth === 'supabase') {
    const membership = membershipForProfile(companyId, profile.id);
    const trustedProfileCompany = (profile.company_ids || []).map(canonicalCompanyId).includes(canonicalCompanyId(companyId));
    if (!membership && trustedProfileCompany && ['owner', 'admin', 'developer'].includes(String(profile.role || '').toLowerCase())) return true;
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

function requirePermission(permission, companyId = activeCompanyId(), message = 'Your role cannot perform that action.', title = 'Access') {
  if (can(permission, companyId)) return true;
  showToast(message, 'local', title);
  return false;
}

function isReadOnlyDemo() {
  return state.session?.auth === 'demo-readonly' && CONFIG.demoReadonly;
}

function requireMutableWorkspace(message = 'Demo is read-only. Create a workspace to save changes.', title = 'Read-only demo') {
  if (!isReadOnlyDemo()) return true;
  showToast(message, 'local', title);
  return false;
}

function isMutableAction(action = '') {
  const clean = String(action || '');
  if (!clean) return false;
  const safeActions = new Set([
    'refresh-data',
    'sign-out',
    'toggle-account-menu',
    'toggle-notifications',
    'toggle-mobile-menu',
    'toggle-sidebar',
    'toggle-nav-group',
    'toggle-nav-expand',
    'pipeline-open',
    'pipeline-stage',
    'open-notification',
    'verify-email',
    'start-demo-mode',
    'open-auth-modal',
    'close-auth-modal',
    'set-auth-mode',
    'open-profile',
    'view-as-role',
    'exit-role-preview',
    'message-details',
    'message-search-results',
    'set-message-filter',
    'set-calendar-scope',
    'set-calendar-view',
    'calendar-prev',
    'calendar-next',
    'calendar-today',
    'open-calendar-event',
    'copy-invite-link',
    'copy-invite-code',
    'open-account',
    'set-account-tab',
    'account-type',
    'open-deal',
    'open-contact',
    'contact-activity-tab',
    'job-activity-tab',
    'set-pipeline-view',
    'open-form-actions',
    'open-form-preview',
    'set-form-start-tab',
    'select-form-start-template',
    'close-modal',
    'set-task-view',
    'set-drive-view',
    'select-file',
    'download-file',
    'set-forms-tab',
    'set-form-editor-tab',
    'select-form',
    'toggle-form-card',
    'copy-form-link',
    'export-forms',
  ]);
  if (safeActions.has(clean)) return false;
  if (/^(new|edit|delete|save|publish|archive|duplicate|revoke|approve|reject)-/.test(clean)) return true;
  if (/^open-/.test(clean) && /(form|upload|tools|stage-manager)/.test(clean)) return true;
  return [
    'mark-all-notifications-read',
    'delete-message',
    'run-message-scenario',
    'reset-message-demo',
    'manage-message-chat',
    'set-company-plugin',
    'apply-plugin-preset',
    'start-checkout',
    'review-workspace',
    'platform-company-action',
    'set-contact-stage',
    'set-contact-temp',
    'toggle-contact-task',
    'contact-quick',
    'contact-mark-next',
    'contact-convert-job',
    'set-job-stage',
    'job-mark-next',
    'job-quick',
    'convert-deal',
    'add-stage',
    'delete-stage',
    'clock-in',
    'clock-out',
  ].includes(clean);
}

function isMutableFormSubmit(formNode) {
  if (!formNode || !formNode.matches('form')) return false;
  if (formNode.matches('[data-login-form], [data-auth-sign-in-form], [data-auth-register-form], [data-auth-invite-code-form], [data-auth-request-form]')) return false;
  return Object.keys(formNode.dataset || {}).some((key) => key.toLowerCase().includes('form'));
}

function allowedCompanyIds() {
  const profile = activeSession().profile;
  const allIds = state.companies.map((company) => company.id);
  const fallbackIds = companiesFallback.map((company) => canonicalCompanyId(company.id));
  if (state.session?.auth === 'supabase') {
    const membershipIds = state.memberships
      .filter((item) => item.profile_id === profile.id && item.status === 'active')
      .map((item) => canonicalCompanyId(item.company_id));
    const profileIds = Array.isArray(profile.company_ids) ? profile.company_ids.map(canonicalCompanyId) : [];
    return compactUnique(membershipIds.concat(profileIds)).filter((id) => allIds.includes(id) || fallbackIds.includes(id));
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

function workspaceReviewRows() {
  const fromRpc = state.workspaceReviews.map(normalizeWorkspaceReview);
  const fromSubscriptions = state.subscriptions
    .filter((subscription) => ['pending_review', 'active', 'trialing', 'suspended', 'canceled'].includes(subscription.status))
    .map((subscription) => normalizeWorkspaceReview({
      company_id: subscription.company_id,
      company_name: companyName(subscription.company_id),
      status: subscription.status,
      plan_code: subscription.plan_code,
      amount_cents: subscription.amount_cents,
      currency: subscription.currency,
      trial_ends_at: subscription.trial_ends_at,
      current_period_end: subscription.current_period_end,
      grace_ends_at: subscription.grace_ends_at,
      created_at: subscription.created_at || '',
    }));
  const fromLocalPending = pendingReviewCompanyIds().map((companyId) => normalizeWorkspaceReview({
    company_id: companyId,
    company_name: companyName(companyId),
    status: 'pending_review',
  }));
  const byCompany = new Map();
  fromSubscriptions.concat(fromLocalPending, fromRpc).forEach((review) => {
    if (review.company_id) byCompany.set(review.company_id, { ...(byCompany.get(review.company_id) || {}), ...review });
  });
  return Array.from(byCompany.values()).sort((a, b) => {
    if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
    if (a.status !== 'pending_review' && b.status === 'pending_review') return 1;
    return String(a.company_name).localeCompare(String(b.company_name));
  });
}

function platformCompanyRows() {
  const fromPlatform = state.platformCompanies.map(normalizePlatformCompany);
  const fromCompanies = state.companies.map((company) => {
    const subscription = companySubscription(company.id);
    const members = companyAccessUsers(company.id);
    return normalizePlatformCompany({
      company_id: company.id,
      company_name: company.name,
      short_name: company.short_name,
      color: company.color,
      label: company.label,
      pill: company.pill,
      status: subscription?.status || (pendingReviewCompanyIds().includes(company.id) ? 'pending_review' : 'active'),
      plan_code: subscription?.plan_code || (company.id === 'lumen' ? 'manual_platform' : 'manual'),
      amount_cents: subscription?.amount_cents || 0,
      currency: subscription?.currency || 'usd',
      owner_email: members.find((member) => member.role === 'owner')?.email || '',
      owner_name: members.find((member) => member.role === 'owner')?.name || '',
      member_count: members.length,
      active_member_count: members.filter((member) => member.status === 'active').length,
      pending_member_count: members.filter((member) => member.status === 'pending').length,
      disabled_member_count: members.filter((member) => ['disabled', 'left'].includes(member.status)).length,
      created_at: subscription?.created_at || '',
    });
  });
  const byCompany = new Map();
  fromCompanies.concat(fromPlatform).forEach((company) => {
    if (!company.company_id) return;
    byCompany.set(company.company_id, { ...(byCompany.get(company.company_id) || {}), ...company });
  });
  return Array.from(byCompany.values()).sort(platformCompanySort);
}

function platformCompanySort(a, b) {
  const weight = { pending_review: 0, active: 1, trialing: 2, suspended: 3, canceled: 4 };
  return (weight[a.status] ?? 5) - (weight[b.status] ?? 5) || String(a.company_name).localeCompare(String(b.company_name));
}

function platformMembersForCompany(companyId) {
  const liveMembers = state.platformCompanyMembers.filter((member) => member.company_id === companyId);
  if (liveMembers.length) return liveMembers.sort(platformMemberSort);
  return companyAccessUsers(companyId).map((member) => normalizePlatformCompanyMember({
    company_id: companyId,
    profile_id: member.profile_id,
    member_id: member.member_id,
    full_name: member.name,
    email: member.email,
    role: member.role,
    role_label: member.role_label,
    role_id: member.role_id,
    status: member.status,
  })).sort(platformMemberSort);
}

function platformMemberSort(a, b) {
  return (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || String(a.name).localeCompare(String(b.name));
}

function platformActionStatus(action) {
  return {
    approve: 'active',
    activate: 'active',
    reactivate: 'active',
    suspend: 'suspended',
    disable: 'suspended',
    archive: 'canceled',
    delete: 'canceled',
    cancel: 'canceled',
    pending: 'pending_review',
  }[String(action || '').toLowerCase().trim()] || '';
}

function subscriptionAllowsCompany(companyId = activeCompanyId()) {
  if (state.session?.auth !== 'supabase') return true;
  if (subscriptionNeedsReview(companyId)) return false;
  const subscription = companySubscription(companyId);
  if (!subscription) return true;
  if (['trialing', 'active', 'past_due', 'grace'].includes(subscription.status)) return true;
  if (subscription.grace_ends_at && Date.parse(subscription.grace_ends_at) > Date.now()) return true;
  return false;
}

function subscriptionNeedsReview(companyId = activeCompanyId()) {
  const subscription = companySubscription(companyId);
  if (subscription?.status === 'pending_review') return true;
  if (['active', 'past_due', 'grace'].includes(subscription?.status)) return false;
  return pendingReviewCompanyIds().includes(canonicalCompanyId(companyId));
}

function pendingReviewCompanyIds() {
  return readJson(PENDING_WORKSPACE_REVIEW_KEY, []).map(canonicalCompanyId).filter(Boolean);
}

function markWorkspacePendingReview(companyId) {
  const id = canonicalCompanyId(companyId);
  if (!id) return;
  const next = Array.from(new Set(pendingReviewCompanyIds().concat(id)));
  writeJson(PENDING_WORKSPACE_REVIEW_KEY, next);
}

function clearWorkspacePendingReview(companyId) {
  const id = canonicalCompanyId(companyId);
  if (!id) return;
  writeJson(PENDING_WORKSPACE_REVIEW_KEY, pendingReviewCompanyIds().filter((item) => item !== id));
}

function inviteLookupForToken(token) {
  const clean = String(token || '').trim();
  if (!clean || state.inviteLookup?.token !== clean) return null;
  return state.inviteLookup;
}

function subscriptionLabel(companyId = activeCompanyId()) {
  const subscription = companySubscription(companyId);
  if (!subscription) return state.session?.auth === 'supabase' ? 'Approval pending' : 'Demo mode';
  return subscriptionLabelForStatus(subscription.status, subscription);
}

function subscriptionLabelForStatus(status, subscription = {}) {
  const clean = normalizeSubscriptionStatus(status) || String(status || '');
  if (clean === 'pending_review') return 'Awaiting Quest approval';
  if (clean === 'trialing') return `Trial - ${formatDate(subscription.trial_ends_at)}`;
  if (clean === 'active') return 'Active subscription';
  if (clean === 'past_due') return 'Past due grace';
  if (clean === 'grace') return `Grace - ${formatDate(subscription.grace_ends_at)}`;
  if (clean === 'suspended') return 'Suspended';
  if (clean === 'canceled') return 'Rejected';
  return titleCase(clean || 'Unknown');
}

function normalizeSubscriptionStatus(status) {
  const clean = String(status || '').toLowerCase().trim();
  return ['pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete'].includes(clean) ? clean : '';
}

function isQuestDeveloper() {
  if (state.session?.auth === 'supabase') return state.platformAdmin === true;
  return String(activeSession().profile?.role || '').toLowerCase() === 'developer';
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

function mergeSubscriptions(subscriptions) {
  const seen = new Map();
  subscriptions.map(normalizeSubscription).forEach((subscription) => {
    if (!subscription.company_id) return;
    seen.set(subscription.company_id, { ...(seen.get(subscription.company_id) || {}), ...subscription });
  });
  return Array.from(seen.values());
}

function mergeRoles(roles) {
  const seen = new Map();
  roles.map(normalizeRole).forEach((role) => {
    if (!role.id) return;
    seen.set(role.id, { ...(seen.get(role.id) || {}), ...role });
  });
  return Array.from(seen.values());
}

function mergeCompanyPlugins(rows) {
  const seen = new Map();
  rows.map(normalizeCompanyPlugin).forEach((row) => {
    if (!row.company_id || !row.plugin_id) return;
    seen.set(`${row.company_id}:${row.plugin_id}`, { ...(seen.get(`${row.company_id}:${row.plugin_id}`) || {}), ...row });
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
    pill: String(input.pill || ''),
  };
}

function normalizeCompanyPlugin(input) {
  const pluginId = String(input.plugin_id || input.id || '').trim();
  const status = String(input.status || 'installed').toLowerCase() === 'disabled' ? 'disabled' : 'installed';
  return {
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    plugin_id: pluginId,
    status,
    installed_by: String(input.installed_by || ''),
    installed_at: input.installed_at || '',
    disabled_at: input.disabled_at || '',
    updated_at: input.updated_at || input.installed_at || input.disabled_at || new Date().toISOString(),
    config: input.config || {},
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
    stage: resolveJobStage(input.stage),
    priority: ['Low', 'Medium', 'High', 'Urgent'].includes(input.priority) ? input.priority : 'Medium',
    owner_name: String(input.owner_name || '').trim(),
    account_id: input.account_id ? String(input.account_id) : '',
    deal_id: input.deal_id ? String(input.deal_id) : '',
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

function normalizeContact(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    name: String(input.name || '').trim() || 'Untitled contact',
    phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(),
    location: String(input.location || '').trim(),
    stage: resolveContactStage(input.stage),
    value: number(input.value),
    owner_name: String(input.owner_name || '').trim(),
    account_id: input.account_id ? String(input.account_id) : '',
    title: String(input.title || '').trim(),
    source: String(input.source || '').trim(),
    temperature: resolveTemperature(input.temperature),
    pay_type: String(input.pay_type || '').trim(),
    roof_system: String(input.roof_system || '').trim(),
    last_activity_at: input.last_activity_at || null,
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}

function resolveTemperature(value) {
  const v = String(value || '').trim();
  return TEMPERATURES.includes(v) ? v : 'Warm';
}

function normalizeAccount(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    name: String(input.name || '').trim() || 'Untitled account',
    type: ACCOUNT_TYPES.includes(input.type) ? input.type : 'Customer',
    industry: String(input.industry || '').trim(),
    website: String(input.website || '').trim(),
    phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(),
    address: String(input.address || '').trim(),
    owner_name: String(input.owner_name || '').trim(),
    status: ['Active', 'Inactive'].includes(input.status) ? input.status : 'Active',
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}

function normalizeDeal(input) {
  const status = ['open', 'won', 'lost'].includes(String(input.status || '').toLowerCase()) ? String(input.status).toLowerCase() : 'open';
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    account_id: input.account_id ? String(input.account_id) : '',
    primary_contact_id: input.primary_contact_id ? String(input.primary_contact_id) : '',
    name: String(input.name || '').trim() || 'Untitled deal',
    stage: resolveDealStage(input.stage),
    status,
    value: number(input.value),
    probability: Math.max(0, Math.min(100, Math.round(number(input.probability)))),
    close_date: input.close_date ? String(input.close_date).slice(0, 10) : '',
    owner_name: String(input.owner_name || '').trim(),
    source: String(input.source || '').trim(),
    job_id: input.job_id ? String(input.job_id) : '',
    notes: String(input.notes || '').trim(),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}

function normalizeActivity(input) {
  return {
    id: String(input.id || ''),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    type: ACTIVITY_TYPES.includes(input.type) ? input.type : 'note',
    subject: String(input.subject || '').trim(),
    body: String(input.body || '').trim(),
    related_type: ['account', 'contact', 'deal', 'job'].includes(input.related_type) ? input.related_type : '',
    related_id: input.related_id ? String(input.related_id) : '',
    account_id: input.account_id ? String(input.account_id) : '',
    due_at: input.due_at || null,
    completed_at: input.completed_at || null,
    owner_name: String(input.owner_name || '').trim(),
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
    contact_id: String(input.contact_id || ''),
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
    status: normalizeSubscriptionStatus(input.status) || 'pending_review',
    plan_code: String(input.plan_code || 'quest_company_300'),
    amount_cents: number(input.amount_cents || 30000),
    currency: String(input.currency || 'usd'),
    stripe_customer_id: String(input.stripe_customer_id || ''),
    stripe_subscription_id: String(input.stripe_subscription_id || ''),
    current_period_end: input.current_period_end || '',
    trial_ends_at: input.trial_ends_at || '',
    grace_ends_at: input.grace_ends_at || '',
    created_at: input.created_at || '',
  };
}

function normalizeWorkspaceReview(input) {
  return {
    company_id: canonicalCompanyId(input.company_id || ''),
    company_name: String(input.company_name || input.name || input.short_name || input.company_id || '').trim(),
    short_name: String(input.short_name || input.company_name || input.name || input.company_id || '').trim(),
    color: String(input.color || '#f0b23b'),
    label: String(input.label || input.short_name || input.company_name || input.name || input.company_id || '').trim(),
    pill: String(input.pill || ''),
    status: normalizeSubscriptionStatus(input.status) || 'pending_review',
    plan_code: String(input.plan_code || 'quest_company_300'),
    amount_cents: number(input.amount_cents || 30000),
    currency: String(input.currency || 'usd'),
    owner_profile_id: String(input.owner_profile_id || ''),
    owner_name: String(input.owner_name || ''),
    owner_email: String(input.owner_email || ''),
    member_count: number(input.member_count),
    active_member_count: number(input.active_member_count),
    pending_member_count: number(input.pending_member_count),
    disabled_member_count: number(input.disabled_member_count),
    current_period_end: input.current_period_end || '',
    trial_ends_at: input.trial_ends_at || '',
    grace_ends_at: input.grace_ends_at || '',
    created_at: input.created_at || '',
    updated_at: input.updated_at || '',
  };
}

function normalizePlatformCompany(input) {
  return normalizeWorkspaceReview(input);
}

function normalizePlatformCompanyMember(input) {
  return {
    company_id: canonicalCompanyId(input.company_id || ''),
    profile_id: String(input.profile_id || ''),
    member_id: String(input.member_id || ''),
    name: String(input.full_name || input.name || input.email || input.profile_id || '').trim(),
    email: String(input.email || '').trim(),
    role: String(input.role || 'member'),
    role_label: String(input.role_label || titleCase(input.role || 'member')),
    role_id: String(input.role_id || ''),
    status: ['active', 'pending', 'disabled', 'left'].includes(String(input.status)) ? String(input.status) : 'active',
    created_at: input.created_at || '',
    updated_at: input.updated_at || '',
    disabled_at: input.disabled_at || '',
    left_at: input.left_at || '',
    last_active_at: input.last_active_at || '',
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

function normalizeCalendarEvent(input) {
  const startsAt = input.starts_at || new Date().toISOString();
  const eventType = CALENDAR_EVENT_TYPES.includes(input.event_type) ? input.event_type : 'Company event';
  const visibility = ['company', 'private'].includes(input.visibility) ? input.visibility : 'company';
  const linkedType = ['', 'job', 'task', 'form', 'invoice'].includes(input.linked_type) ? input.linked_type : '';
  return {
    id: String(input.id || `calendar-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || defaultCompanyId()),
    title: String(input.title || 'Calendar event').trim() || 'Calendar event',
    description: String(input.description || '').trim(),
    event_type: eventType,
    starts_at: startsAt,
    ends_at: input.ends_at || startsAt,
    all_day: input.all_day === true || input.all_day === 'true' || input.all_day === 'on',
    visibility,
    linked_type: linkedType,
    linked_id: String(input.linked_id || ''),
    assigned_profile_id: String(input.assigned_profile_id || ''),
    created_by: String(input.created_by || ''),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || input.created_at || new Date().toISOString(),
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

function calendarEventPayload(event) {
  return {
    id: isUuid(event.id) ? event.id : undefined,
    company_id: event.company_id,
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    starts_at: event.starts_at,
    ends_at: event.ends_at || event.starts_at,
    all_day: event.all_day,
    visibility: event.visibility,
    linked_type: event.linked_type || '',
    linked_id: event.linked_id || '',
    assigned_profile_id: event.assigned_profile_id || '',
    created_by: isUuid(event.created_by) ? event.created_by : activeSession().profile.id,
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

function blankCalendarEvent(companyId = activeCompanyId()) {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);
  return normalizeCalendarEvent({
    id: '',
    company_id: companyId,
    title: '',
    description: '',
    event_type: 'Company event',
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    all_day: false,
    visibility: 'company',
    linked_type: '',
    linked_id: '',
    assigned_profile_id: activeSession().profile.member_id || activeSession().profile.id,
    created_by: activeSession().profile.id,
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
    contact_id: task.contact_id || null,
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
    email: 'local-demo@quest-hq.local',
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

function buildDemoSession() {
  const profile = {
    id: 'demo-readonly-user',
    email: 'demo@quest-hq.local',
    full_name: 'Demo Visitor',
    role: 'owner',
    role_label: 'Demo',
    member_id: 'demo-visitor',
    company_ids: ['roofing'],
    avatar_url: '',
    email_verified: true,
  };
  return {
    auth: 'demo-readonly',
    user: { id: profile.id, username: 'demo', email: profile.email },
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
  const legacyBody = stripHtmlText(input.html || input.meta || '');
  const readAt = input.read_at || (input.read === true ? input.created_at || new Date().toISOString() : '');
  return {
    id: String(input.id || `notification-${crypto.randomUUID()}`),
    company_id: canonicalCompanyId(input.company_id || ''),
    recipient_profile_id: String(input.recipient_profile_id || input.profile_id || input.member_id || 'basic-quest-user'),
    type: String(input.type || (input.task_id ? 'task.notification' : 'general')),
    title: String(input.title || input.meta || 'Notification'),
    body: String(input.body || legacyBody || ''),
    href: String(input.href || ''),
    source_type: String(input.source_type || (input.task_id ? 'task' : '')),
    source_id: String(input.source_id || input.task_id || ''),
    read_at: String(readAt || ''),
    created_at: String(input.created_at || new Date().toISOString()),
  };
}

function stripHtmlText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSessionEmailVerified(session = activeSession()) {
  if (session.auth !== 'supabase') return true;
  return session.user?.email_verified === true || !!session.user?.email_confirmed_at || session.profile?.email_verified === true;
}

function isNoticeWorkspaceHeader(title, summary) {
  return [
    'Access denied',
    'Company access denied',
    'Subscription required',
    'Workspace awaiting approval',
  ].includes(title) || String(summary || '').startsWith('This module will use');
}

function workspaceHeader(title, summary, actions = '') {
  if (!isNoticeWorkspaceHeader(title, summary)) {
    return actions ? `
      <section class="workspace-head workspace-head-actions-only">
        <div class="head-actions">${actions}</div>
      </section>
    ` : '';
  }
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

function renderAvatar(profile, className, attrs = {}) {
  const attrText = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${h(key)}="${h(String(value))}"`)
    .join(' ');
  if (profile.avatar_url) return `<span class="${h(`${className} has-image`)}" ${attrText}><img src="${h(profile.avatar_url)}" alt="" /></span>`;
  const initials = String(profile.full_name || profile.email || 'QB').trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'QB';
  return `<span class="${h(className)}" ${attrText}>${h(initials)}</span>`;
}

function calendarAssigneeOptions(companyId = activeCompanyId()) {
  const rows = companyAccessUsers(companyId)
    .filter((user) => user.status === 'active')
    .map((user) => [user.profile_id || user.member_id, user.name || user.email || user.member_id]);
  return [['', 'Unassigned']].concat(rows);
}

function dateTimeLocalValue(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function localDateTimeToIso(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
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
  if (isReadOnlyDemo()) return;
  if (state.session?.auth === 'supabase') return;
  writeJson(JOB_CACHE_KEY, state.jobs);
  writeJson(CONTACT_CACHE_KEY, state.contacts);
  writeJson(ACCOUNT_CACHE_KEY, state.accounts);
  writeJson(DEAL_CACHE_KEY, state.deals);
  writeJson(ACTIVITY_CACHE_KEY, state.activities);
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
  writeJson(CALENDAR_EVENT_CACHE_KEY, state.calendarEvents);
}

function persistTimeState() {
  if (isReadOnlyDemo()) return;
  if (state.session?.auth === 'supabase') return;
  writeJson(TIME_ENTRY_CACHE_KEY, state.timeEntries);
  writeJson(ACTIVE_TIMER_KEY, state.activeTimer);
}

function persistNotifications() {
  if (isReadOnlyDemo()) return;
  if (state.session?.auth === 'supabase') return;
  writeJson(NOTIFICATION_CACHE_KEY, state.notifications);
}

function persistCalendarEvents() {
  if (isReadOnlyDemo()) return;
  if (state.session?.auth === 'supabase') return;
  writeJson(CALENDAR_EVENT_CACHE_KEY, state.calendarEvents);
}

function persistMessages() {
  if (isReadOnlyDemo()) return;
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
  const href = companyPath('messages', { conversation: conversation.id }, conversation.company_id);
  const senderName = profileName(message.sender_profile_id);
  const participants = conversationNotificationRecipients(conversation)
    .filter((profileId) => profileId !== notificationProfileId(conversation.company_id, message.sender_profile_id));
  const mentioned = mentionedProfileIds(message.body, conversation.company_id)
    .filter((profileId) => profileId !== notificationProfileId(conversation.company_id, message.sender_profile_id));
  if (conversation.type === 'direct') {
    notifyLocalEvent('message.direct', 'New direct message', `${senderName} sent a direct message in ${conversation.title}.`, href, 'message', message.id, conversation.company_id, participants);
  }
  mentioned.forEach((profileId) => {
    notifyEvent({
      company_id: conversation.company_id,
      recipients: [profileId],
      type: 'message.mention',
      title: 'Mentioned in chat',
      body: `${senderName} mentioned you in ${conversation.title}.`,
      href,
      sourceType: 'message',
      sourceId: message.id,
    }).catch((error) => console.warn('Message mention notification failed', error));
  });
  if (attachments.length) {
    notifyLocalEvent('message.attachment', 'Attachment shared', `${senderName} shared ${attachments.length} attachment${attachments.length === 1 ? '' : 's'} in ${conversation.title}.`, href, 'message', message.id, conversation.company_id, participants);
  }
}

function mentionedProfileIds(body = '', companyId = activeCompanyId()) {
  const lower = String(body || '').toLowerCase();
  if (!lower.includes('@')) return [];
  return companyAccessUsers(companyId)
    .filter((user) => lower.includes(`@${String(user.name || '').split(/\s+/)[0].toLowerCase()}`) || lower.includes(`@${String(user.name || '').toLowerCase()}`))
    .map((user) => notificationProfileId(companyId, user.profile_id || user.member_id))
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

function notificationPayload(notification) {
  return {
    id: notification.id,
    company_id: notification.company_id,
    recipient_profile_id: notification.recipient_profile_id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    source_type: notification.source_type,
    source_id: notification.source_id,
    read_at: notification.read_at || null,
    created_at: notification.created_at,
  };
}

function notificationTypeLabel(type = '') {
  const root = String(type || '').split('.')[0];
  return {
    access: 'Access',
    approval: 'Approval',
    calendar: 'Calendar',
    file: 'Files',
    finance: 'Finance',
    form: 'Forms',
    message: 'Messages',
    task: 'Tasks',
  }[root] || 'Inbox';
}

async function notifyEvent(input) {
  const companyId = canonicalCompanyId(input.companyId || input.company_id || activeCompanyId());
  const recipients = notificationRecipientIds(companyId, input.recipients, {
    excludeActor: input.excludeActor === true,
    type: input.type,
    href: input.href,
  });
  if (!recipients.length) return [];

  const now = new Date().toISOString();
  const rows = recipients.map((recipientId) => normalizeNotification({
    id: `notification-${crypto.randomUUID()}`,
    company_id: companyId,
    recipient_profile_id: recipientId,
    type: input.type || 'general',
    title: input.title || 'Notification',
    body: input.body || '',
    href: input.href || '',
    source_type: input.sourceType || input.source_type || '',
    source_id: input.sourceId || input.source_id || '',
    created_at: now,
  }));

  if (state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (!client) return [];
    const result = await client.from('notifications').insert(rows.map(notificationPayload)).select();
    if (result.error) {
      console.warn('Notification insert failed', result.error);
      return [];
    }
    const saved = (result.data || []).map(normalizeNotification);
    mergeNotifications(saved);
    render();
    return saved;
  }

  mergeNotifications(rows);
  persistNotifications();
  render();
  return rows;
}

function mergeNotifications(rows) {
  if (!rows.length) return;
  const next = new Map();
  rows.concat(state.notifications).forEach((item) => next.set(item.id, item));
  state.notifications = [...next.values()]
    .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0))
    .slice(0, 200);
}

function notificationRecipientIds(companyId, recipients = [], options = {}) {
  const requested = Array.isArray(recipients) ? recipients : [recipients];
  let ids = requested.map((item) => notificationProfileId(companyId, item)).filter(Boolean);
  if (!ids.length) ids = notificationDefaultRecipients(companyId, options.type || '', '', '');
  ids = compactUnique(ids);
  if (state.session?.auth !== 'supabase' && !ids.includes(activeSession().profile.id)) ids.push(activeSession().profile.id);
  if (options.excludeActor) ids = ids.filter((id) => id !== notificationActorProfileId());
  return ids.filter((profileId) => activeNotificationProfile(companyId, profileId) && notificationRecipientCanOpen(companyId, profileId, options.type, options.href));
}

function notificationProfileId(companyId, value) {
  if (!value) return '';
  const raw = typeof value === 'object'
    ? String(value.profile_id || value.id || value.member_id || value.target_id || '').trim()
    : String(value).trim();
  if (!raw) return '';
  if (profileById(raw) || membershipForProfile(companyId, raw)) return raw;
  const sessionProfile = activeSession().profile;
  if (raw === sessionProfile.id || raw === sessionProfile.member_id || raw === sessionProfile.email) return sessionProfile.id;
  const user = companyAccessUsers(companyId).find((item) => [item.profile_id, item.member_id, item.email, item.name].filter(Boolean).includes(raw));
  if (user?.profile_id) return user.profile_id;
  const profile = state.profiles.find((item) => item.member_id === raw || item.email === raw || item.full_name === raw);
  if (profile?.id) return profile.id;
  return state.session?.auth === 'supabase' ? '' : raw;
}

function activeNotificationProfile(companyId, profileId) {
  if (!profileId) return false;
  if (profileId === activeSession().profile.id && state.session?.auth !== 'supabase') return true;
  const membership = membershipForProfile(companyId, profileId);
  if (membership) return membership.status === 'active';
  const user = companyAccessUsers(companyId).find((item) => item.profile_id === profileId || item.member_id === profileId);
  return state.session?.auth !== 'supabase' ? true : user?.status === 'active';
}

function notificationActorProfileId() {
  return activeSession().profile.id || activeSession().profile.member_id || '';
}

function notificationRecipientCanOpen(companyId, profileId, type = '', href = '') {
  const permission = notificationPermissionForType(type, href);
  if (!permission) return true;
  return profileHasPermission(companyId, profileId, permission);
}

function notificationPermissionForType(type = '', href = '') {
  const value = `${type} ${href}`;
  if (value.includes('finance')) return 'finance.view';
  if (value.includes('message')) return 'messages.view';
  if (value.includes('calendar')) return 'calendar.view';
  if (value.includes('file')) return 'files.view';
  if (value.includes('approval')) return 'approvals.view';
  if (value.includes('form')) return 'forms.view';
  if (value.includes('task')) return 'tasks.view';
  return '';
}

function profileHasPermission(companyId, profileId, permission) {
  if (!permission) return true;
  if (profileId === activeSession().profile.id) return can(permission, companyId);
  const membership = membershipForProfile(companyId, profileId);
  if (state.session?.auth === 'supabase' && (!membership || membership.status !== 'active')) return false;
  const roleName = String(membership?.role || companyAccessUsers(companyId).find((item) => item.profile_id === profileId)?.role || 'member').toLowerCase();
  if (['owner', 'admin', 'developer'].includes(roleName)) return true;
  const variants = permissionVariants(permission);
  const assignedRoleIds = state.roleAssignments
    .filter((item) => item.company_id === companyId && item.profile_id === profileId)
    .map((item) => item.role_id);
  const explicit = state.rolePermissions.filter((item) => assignedRoleIds.includes(item.role_id));
  if (explicit.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'deny')) return false;
  if (explicit.some((item) => (variants.includes(item.permission_key) || item.permission_key === '*') && item.effect === 'allow')) return true;
  const fallback = ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS.member;
  return fallback.includes('*') || variants.some((variant) => fallback.includes(variant));
}

function notificationDefaultRecipients(companyId, type = '', sourceType = '', sourceId = '') {
  const root = String(type || '').split('.')[0];
  if (root === 'finance') return usersWithAnyPermission(companyId, ['finance.view']);
  if (root === 'message') return usersWithAnyPermission(companyId, ['messages.view']);
  if (root === 'calendar') return calendarEventRecipients(sourceId).concat(usersWithAnyPermission(companyId, ['calendar.manage']));
  if (root === 'file') return usersWithAnyPermission(companyId, ['files.view']).concat(jobNotificationRecipients(companyId, sourceId));
  if (root === 'form') return usersWithAnyPermission(companyId, ['forms.view', 'forms.manage']);
  if (root === 'approval') return usersWithAnyPermission(companyId, ['approvals.view', 'approvals.manage']);
  if (root === 'access') return usersWithAnyPermission(companyId, ['users.manage', 'settings.manage']);
  return [notificationActorProfileId()];
}

function usersWithAnyPermission(companyId, permissions) {
  return compactUnique(companyAccessUsers(companyId)
    .filter((user) => user.status === 'active')
    .map((user) => notificationProfileId(companyId, user.profile_id || user.member_id))
    .filter((profileId) => permissions.some((permission) => profileHasPermission(companyId, profileId, permission))));
}

function taskNotificationRecipients(task, includeCreator = true) {
  if (!task) return [];
  return compactUnique([
    task.assignee_id,
    includeCreator ? task.creator_id : '',
    ...(Array.isArray(task.watchers) ? task.watchers : []),
  ].map((id) => notificationProfileId(task.company_id, id)).filter(Boolean));
}

function jobNotificationRecipients(companyId, jobId) {
  if (!jobId) return [];
  return compactUnique(state.tasks
    .filter((task) => task.company_id === companyId && task.project_id === jobId)
    .flatMap((task) => taskNotificationRecipients(task)));
}

function calendarEventRecipients(eventId) {
  const event = state.calendarEvents.find((item) => item.id === eventId);
  if (!event) return [];
  return compactUnique([event.assigned_profile_id, event.created_by]
    .map((id) => notificationProfileId(event.company_id, id))
    .filter(Boolean));
}

function conversationNotificationRecipients(conversation) {
  if (!conversation) return [];
  const rows = conversationAccessRows(conversation.id);
  const ids = rows.flatMap((row) => {
    if (row.target_type === 'all_company') return usersWithAnyPermission(conversation.company_id, ['messages.view']);
    if (row.target_type === 'profile') return [notificationProfileId(conversation.company_id, row.target_id)];
    if (row.target_type === 'role') {
      return companyAccessUsers(conversation.company_id)
        .filter((user) => user.status === 'active' && (user.role_id === row.target_id || roleIdForName(conversation.company_id, user.role) === row.target_id))
        .map((user) => notificationProfileId(conversation.company_id, user.profile_id || user.member_id));
    }
    return [];
  });
  return compactUnique(ids.filter(Boolean));
}

async function markAllNotificationsRead(companyId = activeCompanyId()) {
  const now = new Date().toISOString();
  const profileId = activeSession().profile.id;
  const ids = state.notifications
    .filter((item) => item.company_id === companyId && item.recipient_profile_id === profileId && !item.read_at)
    .map((item) => item.id);
  if (!ids.length) return;
  state.notifications = state.notifications.map((item) => (
    item.company_id === companyId && item.recipient_profile_id === profileId && !item.read_at
      ? { ...item, read_at: now }
      : item
  ));
  persistNotifications();
  render();
  if (state.session?.auth === 'supabase') {
    const client = createSupabaseClient();
    if (client) await client.from('notifications').update({ read_at: now }).in('id', ids).eq('recipient_profile_id', profileId);
  }
}

async function openNotification(notificationId) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (!notification) return;
  const now = new Date().toISOString();
  state.notifications = state.notifications.map((item) => (
    item.id === notification.id ? { ...item, read_at: item.read_at || now } : item
  ));
  state.notificationMenuOpen = false;
  persistNotifications();
  render();
  if (state.session?.auth === 'supabase' && !notification.read_at) {
    const client = createSupabaseClient();
    if (client) await client.from('notifications').update({ read_at: now }).eq('id', notification.id).eq('recipient_profile_id', activeSession().profile.id);
  }
  if (notification.href) navigate(notification.href);
}

function notifyTaskChange(task, previous = null) {
  const href = companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, task.company_id);
  const assignee = memberName(task.assignee_id);
  if (!previous) {
    notifyEvent({
      companyId: task.company_id,
      recipients: [task.assignee_id],
      type: 'task.assigned',
      title: 'Task assigned',
      body: `${actorName()} assigned ${task.title} to ${assignee}.`,
      href,
      sourceType: 'task',
      sourceId: task.id,
    }).catch((error) => console.warn('Task notification failed', error));
    return;
  }
  if (previous.assignee_id !== task.assignee_id) {
    notifyEvent({
      companyId: task.company_id,
      recipients: [task.assignee_id],
      type: 'task.assigned',
      title: 'Task reassigned',
      body: `${actorName()} reassigned ${task.title} to ${assignee}.`,
      href,
      sourceType: 'task',
      sourceId: task.id,
    }).catch((error) => console.warn('Task notification failed', error));
  }
  if (previous.priority !== task.priority) {
    notifyEvent({
      companyId: task.company_id,
      recipients: taskNotificationRecipients(task),
      excludeActor: true,
      type: 'task.priority',
      title: 'Task priority changed',
      body: `${actorName()} set priority to ${titleCase(task.priority)} on ${task.title}.`,
      href,
      sourceType: 'task',
      sourceId: task.id,
    }).catch((error) => console.warn('Task notification failed', error));
  }
  if (previous.status !== task.status) {
    notifyEvent({
      companyId: task.company_id,
      recipients: taskNotificationRecipients(task),
      excludeActor: true,
      type: 'task.status',
      title: 'Task status changed',
      body: `${actorName()} moved ${task.title} to ${statusLabel(task.status)}.`,
      href,
      sourceType: 'task',
      sourceId: task.id,
    }).catch((error) => console.warn('Task notification failed', error));
  }
}

function notifyLocalEvent(type, title, body, href, sourceType = '', sourceId = '', companyId = activeCompanyId(), recipients = null) {
  notifyEvent({
    companyId,
    recipients: recipients || notificationDefaultRecipients(companyId, type, sourceType, sourceId),
    type,
    title,
    body,
    href,
    sourceType,
    sourceId,
  }).catch((error) => console.warn('Notification event failed', error));
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
  const labels = {
    pdf: 'PDF',
    image: 'Image',
    archive: 'Archive',
    sheet: 'Excel',
    doc: 'Word',
    presentation: 'PowerPoint',
    text: 'Text',
    video: 'Video',
    audio: 'Audio',
    code: 'Code',
    data: 'Data',
    design: 'Design',
    cad: 'CAD',
    email: 'Email',
  };
  const kind = fileTypeKind(file);
  if (labels[kind]) return labels[kind];
  const ext = fileExtension(file);
  return ext ? ext.toUpperCase() : folderLabel(file.folder);
}

function fileTypeKind(file) {
  const type = String(file.mime_type || '').toLowerCase();
  const ext = fileExtension(file);
  if (type.includes('pdf') || ext === 'pdf') return 'pdf';
  if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tif', 'tiff', 'heic', 'ico'].includes(ext)) return 'image';
  if (type.includes('zip') || type.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2'].includes(ext)) return 'archive';
  if (type.includes('spreadsheet') || type.includes('excel') || ['xls', 'xlsx', 'xlsm', 'ods', 'csv'].includes(ext)) return 'sheet';
  if (type.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'doc';
  if (type.includes('presentation') || ['ppt', 'pptx', 'pps', 'odp'].includes(ext)) return 'presentation';
  if (type.includes('video') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v'].includes(ext)) return 'video';
  if (type.includes('audio') || ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'].includes(ext)) return 'audio';
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'yml', 'yaml', 'md', 'sql', 'py', 'rb', 'php', 'java', 'cs', 'cpp', 'c', 'go', 'rs', 'sh', 'ps1'].includes(ext)) return 'code';
  if (['txt', 'log'].includes(ext) || type.includes('text')) return 'text';
  if (['ai', 'psd', 'sketch', 'fig'].includes(ext)) return 'design';
  if (['dwg', 'dxf', 'rvt', 'ifc', 'step', 'stp'].includes(ext)) return 'cad';
  if (['eml', 'msg'].includes(ext)) return 'email';
  if (['db', 'sqlite', 'bak'].includes(ext)) return 'data';
  return 'file';
}

function fileTypeClass(file) {
  return fileTypeKind(file);
}

function fileExtension(file) {
  return String(file.file_name || '').split('.').pop()?.toLowerCase() || '';
}

function avatarFileExtension(file) {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function fileThumb(file, large = false) {
  if (file.signed_url && fileTypeKind(file) === 'image') return `<img src="${h(file.signed_url)}" alt="" />`;
  return `<span class="file-doc-icon ${h(fileTypeClass(file))} ${large ? 'large' : ''}">${fileIconAsset(file, fileTypeLabel(file))}<small>${h(fileTypeShortLabel(file))}</small></span>`;
}

function fileTypeShortLabel(file) {
  const label = fileTypeLabel(file);
  const ext = fileExtension(file);
  if (label === 'Image') return ext && ext.length <= 4 ? ext.toUpperCase() : 'IMG';
  if (label === 'Archive') return ext && ext.length <= 3 ? ext.toUpperCase() : 'ZIP';
  if (label === 'Excel') return ext === 'csv' ? 'CSV' : 'XLS';
  if (label === 'Word') return 'DOC';
  if (label === 'PowerPoint') return 'PPT';
  if (label === 'Video') return 'VID';
  if (label === 'Audio') return 'AUD';
  if (label === 'Code') return ext && ext.length <= 4 ? ext.toUpperCase() : 'CODE';
  if (label === 'Design') return ext && ext.length <= 4 ? ext.toUpperCase() : 'DES';
  if (label === 'CAD') return ext && ext.length <= 4 ? ext.toUpperCase() : 'CAD';
  if (label === 'Email') return ext && ext.length <= 4 ? ext.toUpperCase() : 'MAIL';
  if (label === 'Data') return ext && ext.length <= 4 ? ext.toUpperCase() : 'DATA';
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
  if (!requirePermission('forms.manage', companyId, 'Your role cannot create forms.', 'Forms')) return null;
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
  if (!requirePermission('forms.manage', activeCompanyId(), 'Your role cannot create forms.', 'Forms')) return;
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
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot update forms.', 'Forms')) return;
  form.status = FORM_STATUSES.includes(status) ? status : 'Draft';
  state.selectedFormId = form.id;
  saveFormsState(`${form.status} locally`);
  render();
}

function duplicateForm(id) {
  const form = formById(id || state.selectedFormId);
  if (!form) return;
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot duplicate forms.', 'Forms')) return;
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
  const form = formById(formId);
  if (form && !requirePermission('forms.manage', form.company_id, 'Your role cannot delete forms.', 'Forms')) return;
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
  if (!can('forms.manage', form.company_id)) return;
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
  if (!can('forms.manage', form.company_id)) return;
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
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
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
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
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
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
  form.questions = form.questions.filter((question) => question.id !== id);
  state.selectedQuestionId = form.questions[0]?.id || '';
  saveFormsState('Question deleted');
  render();
}

function moveQuestion(id, direction) {
  const form = selectedFormMutable();
  if (!form || !direction) return;
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
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
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
  question.options = question.options || [];
  question.options.push(`Option ${question.options.length + 1}`);
  saveFormsState('Option added');
  render();
}

function removeQuestionOption(id, index) {
  const form = selectedFormMutable();
  const question = form?.questions.find((item) => item.id === id);
  if (!question || index < 0) return;
  if (!requirePermission('forms.manage', form.company_id, 'Your role cannot edit forms.', 'Forms')) return;
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

function folderIconAsset(folder, label = 'Folder') {
  return iconAsset('default_folder.svg', label || 'Folder');
}

function fileIconAsset(file, label = 'File') {
  return iconAsset(fileIconAssetName(file), label || fileTypeLabel(file));
}

function iconAsset(asset, label) {
  return `<img class="asset-icon" src="${h(FILE_ICON_ASSET_BASE + asset)}" alt="${h(label)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`;
}

function fileIconAssetName(file) {
  const ext = fileExtension(file);
  const exact = {
    pdf: 'file_type_pdf.svg',
    doc: 'file_type_word.svg',
    docx: 'file_type_word.svg',
    odt: 'file_type_word.svg',
    rtf: 'file_type_word.svg',
    xls: 'file_type_excel.svg',
    xlsx: 'file_type_excel.svg',
    xlsm: 'file_type_excel.svg',
    ods: 'file_type_excel.svg',
    csv: 'file_type_excel.svg',
    ppt: 'file_type_powerpoint.svg',
    pptx: 'file_type_powerpoint.svg',
    pps: 'file_type_powerpoint.svg',
    odp: 'file_type_powerpoint.svg',
    zip: 'file_type_zip.svg',
    rar: 'file_type_zip.svg',
    '7z': 'file_type_zip.svg',
    tar: 'file_type_zip.svg',
    gz: 'file_type_zip.svg',
    tgz: 'file_type_zip.svg',
    txt: 'file_type_text.svg',
    log: 'file_type_text.svg',
    md: 'file_type_markdown.svg',
    json: 'file_type_json.svg',
    html: 'file_type_html.svg',
    htm: 'file_type_html.svg',
    css: 'file_type_css.svg',
    scss: 'file_type_css.svg',
    js: 'file_type_js.svg',
    jsx: 'file_type_js.svg',
    ts: 'file_type_js.svg',
    tsx: 'file_type_js.svg',
    xml: 'file_type_xml.svg',
    yml: 'file_type_yaml.svg',
    yaml: 'file_type_yaml.svg',
    svg: 'file_type_svg.svg',
    ai: 'file_type_ai.svg',
    psd: 'file_type_photoshop.svg',
  };
  if (exact[ext]) return exact[ext];
  const kind = fileTypeKind(file);
  if (kind === 'image') return 'file_type_image.svg';
  if (kind === 'video') return 'file_type_video.svg';
  if (kind === 'audio') return 'file_type_audio.svg';
  if (kind === 'text') return 'file_type_text.svg';
  if (kind === 'code') return 'file_type_js.svg';
  if (kind === 'archive') return 'file_type_zip.svg';
  return 'default_file.svg';
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
  if (isReadOnlyDemo() && key !== SESSION_KEY) return;
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
