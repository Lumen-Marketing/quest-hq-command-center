import { WORKSPACE_BACKUP_METADATA_COLUMNS } from './workspace-backups.js';

export function safeInitialDataQuery(query, { timeoutMs = 15000 } = {}) {
  const waitMs = Math.max(1, Number(timeoutMs) || 15000);
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const abortableQuery = controller && typeof query?.abortSignal === 'function'
    ? query.abortSignal(controller.signal)
    : query;
  let timer = null;
  let timeoutError = null;
  const settledQuery = Promise.resolve(abortableQuery).catch((error) => ({
    data: null,
    error: timeoutError || error,
  }));
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      timeoutError = new Error(`Initial workspace request timed out after ${waitMs}ms.`);
      controller?.abort();
      resolve({ data: null, error: timeoutError });
    }, waitMs);
  });
  return Promise.race([settledQuery, timeout]).finally(() => clearTimeout(timer));
}

function initialResultLabel(key) {
  const words = String(key || '')
    .replace(/Result$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : 'Workspace data';
}

export function summarizeInitialDataFailures(results = {}) {
  return Object.entries(results)
    .filter(([, result]) => Boolean(result?.error))
    .map(([key]) => initialResultLabel(key));
}

export async function loadInitialDataQueries(client, safeQuery = safeInitialDataQuery) {
  const queries = {
    companiesResult: client.from('companies').select('*').order('name', { ascending: true }),
    jobsResult: client.from('jobs').select('*').order('updated_at', { ascending: false }),
    tasksResult: client.from('tasks').select('*').order('updated_at', { ascending: false }),
    filesResult: client.from('job_files').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    teamResult: client.from('team_members').select('*').order('name', { ascending: true }),
    membershipsResult: client.from('company_memberships').select('*'),
    profilesResult: client.from('profiles').select('*'),
    subscriptionsResult: client.from('company_subscriptions').select('*'),
    rolesResult: client.from('roles').select('*').order('priority', { ascending: false }),
    rolePermissionsResult: client.from('role_permissions').select('*'),
    roleAssignmentsResult: client.from('user_role_assignments').select('*'),
    resourceAclResult: client.from('resource_acl').select('*'),
    fieldPermissionsResult: client.from('field_permissions').select('*'),
    invitesResult: client.from('company_invites').select('*').order('created_at', { ascending: false }),
    joinRequestsResult: client.from('company_join_requests').select('*').order('created_at', { ascending: false }),
    messageConversationsResult: client.from('message_conversations').select('*').order('last_message_at', { ascending: false }),
    messageAccessResult: client.from('message_conversation_access').select('*'),
    messagesResult: client.from('messages').select('*').order('created_at', { ascending: true }).limit(500),
    messageAttachmentsResult: client.from('message_attachments').select('*').order('created_at', { ascending: true }).limit(500),
    messageReadsResult: client.from('message_reads').select('*'),
    calendarEventsResult: client.from('calendar_events').select('*').order('starts_at', { ascending: true }),
    notificationsResult: client.from('notifications').select('*').order('created_at', { ascending: false }).limit(200),
    contactsResult: client.from('contacts').select('*').order('updated_at', { ascending: false }),
    // Names are resolved on App Builder grids, so delaying these would briefly expose raw ids.
    companyContactsResult: client.from('company_contacts').select('*').order('name', { ascending: true }),
    companyContactFieldsResult: client.from('company_contact_fields').select('*').order('position', { ascending: true }),
    pipelineStagesResult: client.from('pipeline_stages').select('*').order('position', { ascending: true }),
    accountsResult: client.from('accounts').select('*').order('name', { ascending: true }),
    dealsResult: client.from('deals').select('*').order('updated_at', { ascending: false }),
    sitesResult: client.from('crm_sites').select('*').order('updated_at', { ascending: false }),
    activitiesResult: client.from('activities').select('*').order('created_at', { ascending: false }).limit(500),
    companyPluginsResult: client.from('company_plugins').select('*'),
    workspacesResult: client.from('workspaces').select('*').order('name', { ascending: true }),
    workspaceMembershipsResult: client.from('workspace_memberships').select('*'),
    workspacePluginsResult: client.from('workspace_plugins').select('*'),
    workspaceBackupsResult: client.from('workspace_backups').select(WORKSPACE_BACKUP_METADATA_COLUMNS).order('created_at', { ascending: false }),
    workspaceBuilderResult: client.from('workspace_builder_state').select('*'),
    // App Builder records moved out of the builder document into rows, so that the four
    // workspaces.records.* permissions have something to attach to. Loaded alongside the
    // document rather than after it: they are hydrated onto app.items before first render.
    wbRecordsResult: client.from('wb_records').select('*'),
    platformAdminResult: client.rpc('is_platform_admin'),
    // The shell paints an active-clock badge on first render.
    activeTimerResult: client.from('company_active_timers').select('*'),
    timeEntriesResult: client.from('company_time_entries').select('*').order('started_at', { ascending: false }).limit(500),
    // This used to start only after every query above settled, adding a full round trip.
    automationsResult: client.from('automations').select('*'),
  };
  const keys = Object.keys(queries);
  const values = await Promise.all(Object.values(queries).map((query) => safeQuery(query)));
  return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}
