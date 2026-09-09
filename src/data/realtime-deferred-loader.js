import { WORKSPACE_BACKUP_METADATA_COLUMNS } from './workspace-backups.js';

// This module is fetched only when a deferred surface needs data. Its positional bridge
// keeps the first-paint entry from carrying a long object-key payload; the names below are
// intentionally explicit because Vite minifies the loaded chunk independently.
export async function loadDeferredRealtimeDomain(dependencies) {
  const [client, domain, loadEpoch, state, query, requireQueries, activeRows, applyWorkspaceBuilderRows, mergeRowsById, activeCompanyId, applyPipelineStagesForCompany, wbReconstructAppDriveFolders] = dependencies;
  const [, , , , , , , , , , , , normalizeDaily, normalizeCostBucket, normalizeDraw, normalizeChangeOrder, normalizeChangeOrderLine, normalizePlan, normalizeJob, normalizeTask, normalizeCalendarEvent, normalizeContact, normalizeAccount, normalizeDeal, normalizeCrmSite, normalizeActivity, normalizeFile, normalizeForm, normalizeFormResponse, normalizeFinanceInvoice, normalizeFinancePayment, normalizeFinanceExpense, normalizeFinanceVendor, normalizeClientPortal, normalizeClientPortalDocument, normalizeClientPortalAnnotation, normalizeClientPortalEvent, normalizePricebookVendor, normalizePricebookMaterial, normalizePricebookPrice, normalizeNotification, normalizeTimeEntry, normalizeProposal, normalizeRecycleBinItem, normalizeUnderwritingCase, normalizeWorkspaceBackup] = dependencies;
  const [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , normalizeMessageConversation, normalizeMessageAccess, normalizeMessage, normalizeMessageAttachment, normalizeMessageRead, normalizeCompany, normalizeTeamMember, normalizeMembership, normalizeProfile, normalizeSubscription, normalizeRole, normalizeRolePermission, normalizeRoleAssignment, normalizeResourceAcl, normalizeFieldPermission, normalizeCompanyInvite, normalizeJoinRequest, normalizeCompanyPlugin, normalizeOperationalWorkspace, normalizeWorkspaceMembership, normalizeWorkspacePlugin] = dependencies;
  const stale = () => state.workspaceLoadEpoch !== loadEpoch;
  const replaceRows = (result, key, normalize, filterActive = false) => {
    if (!result.error) state[key] = (filterActive ? activeRows(result.data || []) : (result.data || [])).map((row) => normalize(row));
  };

  if (domain === 'production') {
    const [dailies, buckets, draws, changeOrders, changeOrderLines, plans] = await query(client, domain);
    if (stale()) return;
    replaceRows(dailies, 'jobDailies', normalizeDaily);
    replaceRows(buckets, 'jobCostBuckets', normalizeCostBucket);
    replaceRows(draws, 'jobDraws', normalizeDraw);
    replaceRows(changeOrders, 'jobChangeOrders', normalizeChangeOrder);
    replaceRows(changeOrderLines, 'jobChangeOrderLines', normalizeChangeOrderLine);
    replaceRows(plans, 'jobPlans', normalizePlan);
    return requireQueries(dailies, buckets, draws, changeOrders, changeOrderLines, plans);
  }
  if (domain === 'operations') {
    const [jobs, tasks, calendar] = await query(client, domain);
    if (stale()) return;
    replaceRows(jobs, 'jobs', normalizeJob, true);
    replaceRows(tasks, 'tasks', normalizeTask, true);
    replaceRows(calendar, 'calendarEvents', normalizeCalendarEvent, true);
    return;
  }
  if (domain === 'crm') {
    const [contacts, stages, accounts, deals, sites, proposals, activities] = await query(client, domain);
    if (stale()) return;
    replaceRows(contacts, 'contacts', normalizeContact, true);
    if (!stages.error) { state.pipelineStages = stages.data || []; applyPipelineStagesForCompany(activeCompanyId()); }
    replaceRows(accounts, 'accounts', normalizeAccount, true);
    replaceRows(deals, 'deals', normalizeDeal, true);
    replaceRows(sites, 'sites', normalizeCrmSite);
    replaceRows(proposals, 'proposals', normalizeProposal, true);
    replaceRows(activities, 'activities', normalizeActivity, true);
    return;
  }
  if (domain === 'files') {
    const files = await query(client, domain);
    if (stale()) return;
    if (!files.error) { replaceRows(files, 'files', normalizeFile); wbReconstructAppDriveFolders(); }
    return;
  }
  if (domain === 'forms') {
    const [forms, responses] = await query(client, domain);
    if (stale()) return;
    replaceRows(forms, 'forms', normalizeForm, true);
    replaceRows(responses, 'formResponses', normalizeFormResponse, true);
    return requireQueries(forms, responses);
  }
  if (domain === 'finance') {
    const [invoices, payments, expenses, vendors] = await query(client, domain);
    if (stale()) return;
    replaceRows(invoices, 'financeInvoices', normalizeFinanceInvoice, true);
    replaceRows(payments, 'financePayments', normalizeFinancePayment, true);
    replaceRows(expenses, 'financeExpenses', normalizeFinanceExpense, true);
    replaceRows(vendors, 'financeVendors', normalizeFinanceVendor, true);
    return requireQueries(invoices, payments, expenses, vendors);
  }
  if (domain === 'portals') {
    const [portals, documents, annotations, events] = await query(client, domain);
    if (stale()) return;
    replaceRows(portals, 'clientPortals', normalizeClientPortal, true);
    replaceRows(documents, 'clientPortalDocuments', normalizeClientPortalDocument, true);
    replaceRows(annotations, 'clientPortalAnnotations', normalizeClientPortalAnnotation);
    replaceRows(events, 'clientPortalEvents', normalizeClientPortalEvent);
    return requireQueries(portals, documents, annotations, events);
  }
  if (domain === 'pricebook') {
    const [vendors, materials, prices] = await query(client, domain);
    if (stale()) return;
    replaceRows(vendors, 'pricebookVendors', normalizePricebookVendor, true);
    replaceRows(materials, 'pricebookMaterials', normalizePricebookMaterial, true);
    replaceRows(prices, 'pricebookPrices', normalizePricebookPrice, true);
    return requireQueries(vendors, materials, prices);
  }
  if (domain === 'notifications') {
    const notifications = await query(client, domain);
    if (stale()) return;
    replaceRows(notifications, 'notifications', normalizeNotification);
    return;
  }
  if (domain === 'time') {
    const timeEntries = await query(client, domain);
    if (stale()) return;
    replaceRows(timeEntries, 'timeEntries', normalizeTimeEntry);
    return requireQueries(timeEntries);
  }
  if (domain === 'audit') {
    const auditEvents = await query(client, domain);
    if (stale()) return;
    if (!auditEvents.error) state.auditEvents = auditEvents.data || [];
    return requireQueries(auditEvents);
  }
  if (domain === 'proposals') {
    const proposals = await query(client, domain);
    if (stale()) return;
    replaceRows(proposals, 'proposals', normalizeProposal, true);
    return requireQueries(proposals);
  }
  if (domain === 'recycle') {
    const recycled = await query(client, domain);
    if (stale()) return;
    replaceRows(recycled, 'recycleBinItems', normalizeRecycleBinItem);
    return requireQueries(recycled);
  }
  if (domain === 'labels') {
    const [labels, assignments] = await query(client, domain);
    if (stale()) return;
    if (!labels.error) state.contactLabels = labels.data || [];
    if (!assignments.error) state.contactLabelAssignments = assignments.data || [];
    return requireQueries(labels, assignments);
  }
  if (domain === 'underwriting') {
    const [cases, calculators] = await query(client, domain);
    if (stale()) return;
    replaceRows(cases, 'underwritingCases', normalizeUnderwritingCase, true);
    if (!calculators.error) state.underwritingCalculators = calculators.data || [];
    return requireQueries(cases, calculators);
  }
  if (domain === 'workspace') {
    const [backups, builder, records, transfers] = await query(client, domain, { workspaceBackupColumns: WORKSPACE_BACKUP_METADATA_COLUMNS });
    if (stale()) return;
    replaceRows(backups, 'workspaceBackups', normalizeWorkspaceBackup);
    if (!builder.error) applyWorkspaceBuilderRows(builder.data, records.error ? null : (records.data || []));
    if (!transfers.error) state.wbTransfers = transfers.data || [];
    return requireQueries(backups, builder, records, transfers);
  }
  if (domain === 'messages') {
    const [conversations, conversationAccess, messages, attachments, reads] = await query(client, domain);
    if (stale()) return;
    replaceRows(conversations, 'messageConversations', normalizeMessageConversation);
    replaceRows(conversationAccess, 'messageAccess', normalizeMessageAccess);
    if (!messages.error) state.messages = mergeRowsById(state.messages, (messages.data || []).slice().reverse(), normalizeMessage);
    if (!attachments.error) state.messageAttachments = mergeRowsById(state.messageAttachments, (attachments.data || []).slice().reverse(), normalizeMessageAttachment);
    replaceRows(reads, 'messageReads', normalizeMessageRead);
    return;
  }
  if (domain === 'access') {
    const [companies, team, memberships, profiles, subscriptions, roles, permissions, assignments, acl, fields, invites, requests, plugins, workspaces, workspaceMemberships, workspacePlugins] = await query(client, domain);
    if (stale()) return;
    replaceRows(companies, 'companies', normalizeCompany);
    replaceRows(team, 'teamMembers', normalizeTeamMember);
    replaceRows(memberships, 'memberships', normalizeMembership);
    replaceRows(profiles, 'profiles', normalizeProfile);
    replaceRows(subscriptions, 'subscriptions', normalizeSubscription);
    replaceRows(roles, 'roles', normalizeRole);
    replaceRows(permissions, 'rolePermissions', normalizeRolePermission);
    replaceRows(assignments, 'roleAssignments', normalizeRoleAssignment);
    replaceRows(acl, 'resourceAcl', normalizeResourceAcl);
    replaceRows(fields, 'fieldPermissions', normalizeFieldPermission);
    replaceRows(invites, 'companyInvites', normalizeCompanyInvite);
    replaceRows(requests, 'joinRequests', normalizeJoinRequest);
    if (!plugins.error) { state.companyPlugins = (plugins.data || []).map(normalizeCompanyPlugin); state.pluginLoadFailed = false; }
    replaceRows(workspaces, 'operationalWorkspaces', normalizeOperationalWorkspace);
    replaceRows(workspaceMemberships, 'workspaceMemberships', normalizeWorkspaceMembership);
    replaceRows(workspacePlugins, 'workspacePlugins', normalizeWorkspacePlugin);
  }
}
