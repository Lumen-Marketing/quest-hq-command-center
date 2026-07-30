export const PLUGIN_DATA_SCOPES = Object.freeze({
  WORKSPACE_PRIVATE: 'workspace-private',
  COMPANY_SHARED: 'company-shared',
  HYBRID: 'hybrid',
});

const SCOPE_DETAILS = Object.freeze({
  [PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE]: Object.freeze({
    label: 'Workspace data',
    description: 'Records are limited to this operational workspace.',
  }),
  [PLUGIN_DATA_SCOPES.COMPANY_SHARED]: Object.freeze({
    label: 'Company-wide data',
    description: 'Records are shared across this company, even when the app is enabled here.',
  }),
  [PLUGIN_DATA_SCOPES.HYBRID]: Object.freeze({
    label: 'Mixed data scope',
    description: 'Some records are workspace-specific and some are shared across the company.',
  }),
});

const UNKNOWN_SCOPE_DETAILS = Object.freeze({
  label: 'Scope not verified',
  description: 'Do not assume these records are isolated to this workspace.',
});

export function pluginDataScopeDetails(scope) {
  return SCOPE_DETAILS[scope] || UNKNOWN_SCOPE_DETAILS;
}

export const WORKSPACE_PLUGIN_REGISTRY = [
  { id: 'crm', label: 'CRM', summary: 'Accounts, contacts, quotes, and customer activity.', icon: 'ti-building-community', module_ids: ['crm', 'contacts', 'deals'], permissions: ['crm.view'], exclusiveGroup: 'crm', dataScope: PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE },
  { id: 'crm_2', label: 'Quest CRM', summary: 'Private contacts, quotes, estimates, proposals, and production jobs workspace.', icon: 'ti-id-badge-2', module_ids: ['workday', 'contacts', 'deals', 'proposals', 'jobs'], permissions: ['crm.view'], exclusiveGroup: 'crm', private: true, dataScope: PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE },
  { id: 'tasks', label: 'Tasks', summary: 'Workspace task execution, timers, reminders, and team follow-through.', icon: 'ti-list-check', module_ids: ['tasks'], permissions: ['tasks.view', 'tasks.manage'], dataScope: PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE },
  { id: 'underwriter', label: 'Underwriter', summary: 'Qualification, scope, pricing, and handoff readiness queue.', icon: 'ti-clipboard-check', module_ids: ['underwriter'], permissions: ['underwriter.view', 'underwriter.manage'], recommendedWith: ['crm_2'], dataScope: PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE },
  { id: 'files', label: 'Files', summary: 'Shared files, job folders, and document storage.', icon: 'ti-folder', module_ids: ['files'], permissions: ['files.view', 'files.manage'], dataScope: PLUGIN_DATA_SCOPES.HYBRID },
  { id: 'client_portal', label: 'Client Portal', summary: 'Password-protected plan links, markups, comments, and client review.', icon: 'ti-world-upload', module_ids: ['client-portals'], permissions: ['client_portals.view', 'client_portals.manage'], recommendedWith: ['files'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'workspace_builder', label: 'Workspace App Builder', summary: 'No-code workspaces, custom apps, fields, items, reports, and automations.', icon: 'ti-layout-grid-add', module_ids: ['workspaces'], permissions: ['workspaces.view', 'workspaces.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'price_book', label: 'Price Book', summary: 'Vendor cost catalog for estimating materials, costs, stale pricing, and best-price checks.', icon: 'ti-book', module_ids: ['price-book'], permissions: ['price_book.view', 'price_book.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'forms', label: 'Forms', summary: 'Internal forms, templates, and response capture.', icon: 'ti-clipboard-list', module_ids: ['forms'], permissions: ['forms.view', 'forms.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'finance', label: 'Finance', summary: 'Invoices, payments, expenses, vendors, and AR.', icon: 'ti-receipt-dollar', module_ids: ['finance'], permissions: ['finance.view', 'finance.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'messages', label: 'Messages', summary: 'Company chats, role rooms, direct messages, and attachments.', icon: 'ti-messages', module_ids: ['messages'], permissions: ['messages.view', 'messages.send', 'messages.create_group', 'messages.manage_groups', 'messages.attach_files', 'messages.delete_own', 'messages.delete_any', 'messages.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'calendar', label: 'Calendar', summary: 'Company schedule, task deadlines, and manual events.', icon: 'ti-calendar', module_ids: ['calendar'], permissions: ['calendar.view', 'calendar.manage', 'calendar.view_team'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'time_clock', label: 'Time & clock', summary: 'Personal time queues and clock dashboard.', icon: 'ti-clock-hour-4', module_ids: ['time', 'clock'], permissions: ['time.track', 'clock.manage'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'approvals', label: 'Approvals', summary: 'Review queues for handoffs, forms, and access.', icon: 'ti-user-check', module_ids: ['approvals'], permissions: ['approvals.view', 'approvals.manage'], dataScope: PLUGIN_DATA_SCOPES.HYBRID },
  { id: 'reporting', label: 'Reporting', summary: 'Analytics and team chart views.', icon: 'ti-chart-bar', module_ids: ['analytics', 'team-chart'], permissions: ['team.view'], dataScope: PLUGIN_DATA_SCOPES.HYBRID },
  { id: 'calls', label: 'Calls', summary: 'Live phone status and conversation counts from RingCentral.', icon: 'ti-phone', module_ids: ['calls'], permissions: ['team.view'], dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
  { id: 'tickets', label: 'Tickets', summary: 'Future service and issue tracking module.', icon: 'ti-ticket', module_ids: ['tickets'], permissions: [], comingSoon: true, dataScope: PLUGIN_DATA_SCOPES.WORKSPACE_PRIVATE },
  { id: 'templates', label: 'Templates', summary: 'Future reusable workspace templates.', icon: 'ti-template', module_ids: ['templates'], permissions: [], comingSoon: true, dataScope: PLUGIN_DATA_SCOPES.COMPANY_SHARED },
];

export const WORKSPACE_PLUGIN_PRESETS = Object.freeze({
  roofing: Object.freeze(['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']),
  construction: Object.freeze(['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']),
  generic: Object.freeze(['crm', 'files', 'messages', 'workspace_builder', 'tasks']),
});

export const WORKSPACE_PLUGIN_PRESET_LABELS = Object.freeze({
  roofing: 'Roofing',
  construction: 'Construction',
  generic: 'Generic services',
});
