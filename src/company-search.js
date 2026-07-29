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

  return records;
}

export function buildCompanySearchRecordsFromState({
  state,
  companyId,
  workspaces,
  canAccess,
  memberName,
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
  return buildCompanySearchRecords({ contacts, quotes, jobs, tasks, files, proposals, workspaceNames });
}
