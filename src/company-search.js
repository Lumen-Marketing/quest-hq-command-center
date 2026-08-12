function joinedText(...values) {
  return values
    .flat()
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function routeParams(record, params) {
  const workspaceId = String(record?.workspace_id || '').trim();
  return workspaceId ? { ...params, workspace: workspaceId } : params;
}

function recordHint(record, workspaceNames, ...details) {
  const workspaceId = String(record?.workspace_id || '').trim();
  const workspaceName = workspaceNames?.[workspaceId] || '';
  return [workspaceName, ...details]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' · ');
}

/**
 * Turn the five company-wide business sources into route-ready search records.
 * The caller passes only rows from operational workspaces the user may access.
 */
export function buildCompanySearchRecords({
  contacts = [],
  quotes = [],
  jobs = [],
  tasks = [],
  files = [],
  proposals = [],
  appItems = [],
  workspaceNames = {},
} = {}) {
  const records = [];

  for (const contact of contacts) {
    records.push({
      id: `contact-${contact.id}`,
      group: 'Contacts',
      icon: 'ti-user',
      label: contact.name || 'Unnamed contact',
      hint: recordHint(contact, workspaceNames, contact.stage || contact.owner_name),
      keywords: joinedText(
        contact.email,
        contact.phone,
        contact.location,
        contact.site_address,
        contact.owner_name,
        contact.stage,
        'contact',
      ),
      section: 'contacts',
      params: routeParams(contact, { contact_id: contact.id }),
    });
  }

  for (const quote of quotes) {
    records.push({
      id: `deal-${quote.id}`,
      group: 'Quotes',
      icon: 'ti-briefcase',
      label: quote.name || 'Quote',
      hint: recordHint(quote, workspaceNames, quote.stage || quote.owner_name),
      keywords: joinedText(
        quote.contact_name,
        quote.client_name,
        quote.owner_name,
        quote.stage,
        quote.description,
        quote.notes,
        quote.amount,
        quote.value,
        'quote deal estimate',
      ),
      section: 'deals',
      params: routeParams(quote, { tab: 'profile', deal_id: quote.id }),
    });
  }

  for (const job of jobs) {
    const client = job.client_name || job.contact_name || '';
    records.push({
      id: `job-${job.id}`,
      group: 'Jobs',
      icon: 'ti-hammer',
      label: job.name || client || 'Job',
      hint: recordHint(job, workspaceNames, client && client !== job.name ? client : (job.stage || job.status)),
      keywords: joinedText(
        client,
        job.site_address,
        job.owner_name,
        job.job_type,
        job.stage,
        job.status,
        job.scope,
        job.notes,
        'job project',
      ),
      section: 'jobs',
      params: routeParams(job, { tab: 'profile', job_id: job.id }),
    });
  }

  for (const task of tasks) {
    records.push({
      id: `task-${task.id}`,
      group: 'Tasks',
      icon: 'ti-list-check',
      label: task.title || task.name || 'Task',
      hint: recordHint(task, workspaceNames, task.due || task.status || task.assignee_name),
      keywords: joinedText(
        task.description,
        task.type,
        task.status,
        task.priority,
        task.due,
        task.due_time,
        task.assignee_name,
        task.context_label,
        'task todo assignment',
      ),
      section: 'tasks',
      params: routeParams(task, {
        task_id: task.id,
        ...(task.project_id ? { job_id: task.project_id } : {}),
      }),
    });
  }

  for (const file of files) {
    records.push({
      id: `file-${file.id}`,
      group: 'Files',
      icon: 'ti-file',
      label: file.file_name || file.name || 'File',
      hint: recordHint(file, workspaceNames, file.category || file.job_name),
      keywords: joinedText(
        file.category,
        file.uploaded_by_label,
        file.notes,
        file.object_path,
        file.job_name,
        file.mime_type,
        'file document attachment',
      ),
      section: 'files',
      params: routeParams(file, {
        folder: file.folder || (file.job_id ? 'jobs' : 'home'),
        ...(file.job_id ? { job_id: file.job_id } : {}),
        file_id: file.id,
      }),
    });
  }

  for (const proposal of proposals) {
    records.push({
      id: `proposal-${proposal.id}`,
      group: 'Proposals',
      icon: 'ti-file-dollar',
      label: proposal.title || proposal.proposal_no || 'Proposal',
      hint: recordHint(proposal, workspaceNames, proposal.proposal_no),
      keywords: joinedText(proposal.proposal_no, proposal.status, 'proposal document'),
      section: 'proposals',
      params: routeParams(proposal, { proposal_id: proposal.id }),
    });
  }

  // Records built in the workspace app builder, and the sub-items under them. These are the
  // only searchable things a customer defines themselves, so the group is the app's own name
  // -- "Roof Quote & Job Tracker", not a generic "Workspace" -- because that is what the
  // person searching calls it.
  for (const entry of appItems) {
    records.push({
      id: entry.subOf ? `wbchild-${entry.appId}-${entry.itemId}-${entry.id}` : `wbitem-${entry.appId}-${entry.id}`,
      group: entry.appName || 'Apps',
      icon: entry.icon || 'ti-layout-grid',
      label: entry.label || 'Untitled',
      hint: recordHint(entry, workspaceNames, entry.subOf ? `in ${entry.subOf}` : ''),
      keywords: joinedText(entry.text, entry.appName, entry.subOf, 'app record'),
      section: 'workspaces',
      // A sub-item has no page of its own, so it opens the record that holds it.
      params: routeParams(entry, { app_id: entry.appId, tab: 'items', item_id: entry.itemId || entry.id }),
    });
  }

  return records;
}

/**
 * Every app record and sub-item the viewer may reach, flattened for the index.
 *
 * Values are stringified rather than formatted: the point is to match what somebody types,
 * and a raw phone number or option id is as likely a search term as its rendered label.
 * Arrays and objects are flattened too, so a relationship or a checklist still contributes.
 */
export function buildWorkspaceAppSearchEntries({ doc, allowedWorkspaceIds, itemTitle }) {
  const entries = [];
  const flatten = (value, depth = 0) => {
    if (value == null || depth > 2) return '';
    if (Array.isArray(value)) return value.map((v) => flatten(v, depth + 1)).join(' ');
    if (typeof value === 'object') return Object.values(value).map((v) => flatten(v, depth + 1)).join(' ');
    return String(value);
  };

  for (const workspace of doc?.workspaces || []) {
    // ws-<operational id> is how a builder workspace keys to one somebody can be a member
    // of. Anything else has no route to open and no access rule to check it against.
    const workspaceId = /^ws-/.test(workspace.id || '') ? workspace.id.slice(3) : '';
    if (!workspaceId || !allowedWorkspaceIds.has(workspaceId)) continue;
    for (const app of workspace.apps || []) {
      // Linked copies resolve to the same records; indexing both lists every hit twice.
      if (app.linked) continue;
      for (const item of app.items || []) {
        entries.push({
          id: item.id,
          appId: app.id,
          appName: app.name,
          icon: app.icon,
          workspace_id: workspaceId,
          label: itemTitle(app, item),
          text: flatten(item.values),
        });
        for (const child of item.children || []) {
          const collection = (app.collections || []).find((c) => c.id === child.collection);
          const childText = flatten(child.values);
          entries.push({
            id: child.id,
            itemId: item.id,
            appId: app.id,
            appName: app.name,
            icon: app.icon,
            workspace_id: workspaceId,
            subOf: collection?.name || 'Sub-items',
            label: childText.slice(0, 80) || 'Sub-item',
            // The parent's title too, so searching the record finds its sub-items with it.
            text: `${childText} ${itemTitle(app, item)}`,
          });
        }
      }
    }
  }
  return entries;
}

export function buildCompanySearchRecordsFromState({
  state,
  companyId,
  workspaces,
  canAccess,
  memberName,
  workspaceAppEntries = [],
}) {
  const fallbackWorkspaceId = workspaces.find((workspace) => workspace.is_default)?.id || '';
  const allowedWorkspaceIds = new Set(workspaces.map((workspace) => workspace.id));
  const workspaceNames = Object.fromEntries(workspaces.map((workspace) => [workspace.id, workspace.name]));
  const scope = (rows, permission, moduleId) => (rows || [])
    .filter((record) => record?.company_id === companyId)
    .map((record) => ({ ...record, workspace_id: record.workspace_id || fallbackWorkspaceId }))
    .filter((record) => allowedWorkspaceIds.has(record.workspace_id)
      && canAccess(permission, moduleId, record.workspace_id));
  const contacts = scope(state.contacts, 'crm.view', 'contacts');
  const quotes = scope(state.deals, 'crm.view', 'deals');
  const jobs = scope(state.jobs, 'jobs.view', 'jobs');
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const tasks = scope(state.tasks, 'tasks.view', 'tasks').map((task) => ({
    ...task,
    assignee_name: memberName(task.assignee_id),
    context_label: jobsById.get(task.project_id)?.name || '',
  }));
  const files = scope(state.files, 'files.view', 'files')
    .map((file) => ({ ...file, job_name: jobsById.get(file.job_id)?.name || '' }));
  const proposals = scope(state.proposals, 'crm.view', 'proposals');
  return buildCompanySearchRecords({
    contacts, quotes, jobs, tasks, files, proposals, workspaceNames,
    // Re-checked here rather than trusted: the entries were built against the same set, but
    // this function is the one place every source passes an access filter.
    appItems: workspaceAppEntries.filter((entry) => allowedWorkspaceIds.has(entry.workspace_id)),
  });
}
