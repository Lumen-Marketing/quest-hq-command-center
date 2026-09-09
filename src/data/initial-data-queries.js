import { WORKSPACE_BACKUP_METADATA_COLUMNS } from './workspace-backups.js';

export function safeInitialDataQuery(query, { timeoutMs = 15000, label = '', signal: parentSignal = null } = {}) {
  const waitMs = Math.max(1, Number(timeoutMs) || 15000);
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const abort = () => controller?.abort();
  if (parentSignal?.aborted) abort();
  parentSignal?.addEventListener?.('abort', abort, { once: true });
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
      abort();
      resolve({ data: null, error: timeoutError });
    }, waitMs);
  });
  return Promise.race([settledQuery, timeout]).finally(() => {
    clearTimeout(timer);
    parentSignal?.removeEventListener?.('abort', abort);
    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const durationMs = Math.max(0, Math.round(endedAt - startedAt));
    if (label && durationMs >= 2000 && typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quest:slow-operation', {
        detail: { label: 'Slow data request', context: String(label).slice(0, 120), durationMs },
      }));
    }
  });
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

/**
 * Read a complete, stably ordered PostgREST list instead of trusting the project's
 * server-side row cap. The caller supplies a fresh query for every inclusive range;
 * reusing a settled Supabase builder can repeat filters or abort signals.
 */
export async function loadPaginatedDataQuery(makeQuery, safeQuery = safeInitialDataQuery, {
  pageSize = 500,
  maxPages = 100,
  label = 'Paged data',
  deadlineMs = 15000,
} = {}) {
  const size = Math.max(1, Math.min(1000, Number(pageSize) || 500));
  const waitMs = Math.max(1, Number(deadlineMs) || 15000);
  const rows = [];
  const seen = new Set();
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let deadlineError = null;
  let timeout = null;
  const deadline = new Promise((resolve) => {
    timeout = setTimeout(() => {
      deadlineError = new Error(`${label} did not complete within ${waitMs}ms.`);
      controller?.abort();
      resolve({ data: null, error: deadlineError });
    }, waitMs);
  });
  const remainingMs = () => Math.max(1, waitMs - ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt));
  try {
    for (let page = 0; page < maxPages; page += 1) {
      const from = page * size;
      const query = makeQuery().range(from, from + size - 1);
    // Each page gets only the time left in the one operation-wide budget. Racing here also
    // protects callers that provide a lightweight custom safeQuery: an ignored abort signal
    // cannot keep the next page (or the caller) alive after the overall deadline.
      const result = await Promise.race([
        Promise.resolve().then(() => safeQuery(query, {
          label: page === 0 ? label : `${label} page ${page + 1}`,
          timeoutMs: remainingMs(),
          signal: controller?.signal,
        })),
        deadline,
      ]);
      if (result?.error) {
        if (!deadlineError && /timed out/i.test(String(result.error?.message || ''))) {
          deadlineError = new Error(`${label} did not complete within ${waitMs}ms.`);
          controller?.abort();
        }
        return { data: rows.length ? rows : null, error: deadlineError || result.error };
      }
      const batch = Array.isArray(result?.data) ? result.data : [];
      batch.forEach((row) => {
        const key = row && row.id != null ? `id:${row.id}` : `row:${JSON.stringify(row)}`;
        if (!seen.has(key)) { seen.add(key); rows.push(row); }
      });
      if (batch.length < size) return { data: rows, error: null };
    }
    return { data: rows, error: new Error(`${label} exceeded the ${maxPages * size} row safety limit.`) };
  } catch (error) {
    controller?.abort();
    return { data: rows.length ? rows : null, error };
  } finally {
    clearTimeout(timeout);
  }
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
    // Newest 500, not oldest 500. Ascending order with a cap returned the FIRST 500 rows a
    // workspace ever wrote, so once a busy account crossed that line no new message could
    // ever load. Fetch descending and put the list back in ascending order for display.
    messagesResult: client.from('messages').select('*').order('created_at', { ascending: false }).limit(500),
    messageAttachmentsResult: client.from('message_attachments').select('*').order('created_at', { ascending: false }).limit(500),
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
    // The export/import ledger. Its own table rather than the builder document, because a role
    // that may only export cannot write that document -- so its exports would be the ones that
    // went unrecorded. Bounded: the feed shows the most recent, not the whole history.
    wbTransfersResult: client.from('wb_data_transfers').select('*').order('created_at', { ascending: false }).limit(200),
    platformAdminResult: client.rpc('is_platform_admin'),
    // The shell paints an active-clock badge on first render.
    activeTimerResult: client.from('company_active_timers').select('*'),
    // This used to start only after every query above settled, adding a full round trip.
    automationsResult: client.from('automations').select('*'),
  };
  // These are the core record lists whose sidebar counts, search and cross-links must be
  // complete. Every factory has a deterministic secondary id order, so adjacent ranges do
  // not overlap merely because two rows share the same updated/name value.
  const pagedQueries = {
    companiesResult: () => client.from('companies').select('*').order('name', { ascending: true }).order('id', { ascending: true }),
    jobsResult: () => client.from('jobs').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }),
    tasksResult: () => client.from('tasks').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }),
    filesResult: () => client.from('job_files').select('*').is('deleted_at', null).order('created_at', { ascending: false }).order('id', { ascending: true }),
    teamResult: () => client.from('team_members').select('*').order('name', { ascending: true }).order('id', { ascending: true }),
    membershipsResult: () => client.from('company_memberships').select('*').order('company_id', { ascending: true }).order('profile_id', { ascending: true }),
    profilesResult: () => client.from('profiles').select('*').order('id', { ascending: true }),
    subscriptionsResult: () => client.from('company_subscriptions').select('*').order('company_id', { ascending: true }),
    rolesResult: () => client.from('roles').select('*').order('priority', { ascending: false }).order('id', { ascending: true }),
    rolePermissionsResult: () => client.from('role_permissions').select('*').order('role_id', { ascending: true }).order('permission_key', { ascending: true }),
    roleAssignmentsResult: () => client.from('user_role_assignments').select('*').order('company_id', { ascending: true }).order('profile_id', { ascending: true }).order('role_id', { ascending: true }),
    resourceAclResult: () => client.from('resource_acl').select('*').order('id', { ascending: true }),
    fieldPermissionsResult: () => client.from('field_permissions').select('*').order('id', { ascending: true }),
    invitesResult: () => client.from('company_invites').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }),
    joinRequestsResult: () => client.from('company_join_requests').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }),
    messageConversationsResult: () => client.from('message_conversations').select('*').order('last_message_at', { ascending: false }).order('id', { ascending: true }),
    messageAccessResult: () => client.from('message_conversation_access').select('*').order('id', { ascending: true }),
    messageReadsResult: () => client.from('message_reads').select('*').order('conversation_id', { ascending: true }).order('profile_id', { ascending: true }),
    calendarEventsResult: () => client.from('calendar_events').select('*').order('starts_at', { ascending: true }).order('id', { ascending: true }),
    contactsResult: () => client.from('contacts').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }),
    companyContactsResult: () => client.from('company_contacts').select('*').order('name', { ascending: true }).order('id', { ascending: true }),
    companyContactFieldsResult: () => client.from('company_contact_fields').select('*').order('position', { ascending: true }).order('id', { ascending: true }),
    pipelineStagesResult: () => client.from('pipeline_stages').select('*').order('position', { ascending: true }).order('id', { ascending: true }),
    accountsResult: () => client.from('accounts').select('*').order('name', { ascending: true }).order('id', { ascending: true }),
    dealsResult: () => client.from('deals').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }),
    sitesResult: () => client.from('crm_sites').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }),
    workspacesResult: () => client.from('workspaces').select('*').order('name', { ascending: true }).order('id', { ascending: true }),
    companyPluginsResult: () => client.from('company_plugins').select('*').order('company_id', { ascending: true }).order('plugin_id', { ascending: true }),
    workspaceMembershipsResult: () => client.from('workspace_memberships').select('*').order('workspace_id', { ascending: true }).order('profile_id', { ascending: true }),
    workspacePluginsResult: () => client.from('workspace_plugins').select('*').order('workspace_id', { ascending: true }).order('plugin_id', { ascending: true }),
    activeTimerResult: () => client.from('company_active_timers').select('*').order('profile_id', { ascending: true }),
    automationsResult: () => client.from('automations').select('*').order('id', { ascending: true }),
    wbRecordsResult: () => client.from('wb_records').select('*').order('id', { ascending: true }),
  };
  Object.keys(pagedQueries).forEach((key) => delete queries[key]);
  const keys = Object.keys(queries);
  const pagedKeys = Object.keys(pagedQueries);
  const [values, pagedValues] = await Promise.all([
    Promise.all(keys.map((key) => safeQuery(queries[key], { label: initialResultLabel(key) }))),
    Promise.all(pagedKeys.map((key) => loadPaginatedDataQuery(pagedQueries[key], safeQuery, { label: initialResultLabel(key) }))),
  ]);
  return {
    ...Object.fromEntries(keys.map((key, index) => [key, values[index]])),
    ...Object.fromEntries(pagedKeys.map((key, index) => [key, pagedValues[index]])),
  };
}
