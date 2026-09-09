export function loadRealtimeQueryBatch(client, domain, paged, safe, options = {}) {
  if (domain === 'production') return Promise.all([
    paged(() => client.from('job_dailies').select('*').order('report_date', { ascending: false }).order('id', { ascending: true }), 'Job dailies'),
    paged(() => client.from('job_cost_buckets').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }), 'Job cost buckets'),
    paged(() => client.from('job_draws').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }), 'Job draws'),
    paged(() => client.from('job_change_orders').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Job change orders'),
    paged(() => client.from('job_change_order_lines').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }), 'Change-order lines'),
    paged(() => client.from('job_plans').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Job plans'),
  ]);
  if (domain === 'operations') return Promise.all([
    paged(() => client.from('jobs').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Jobs'),
    paged(() => client.from('tasks').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Tasks'),
    paged(() => client.from('calendar_events').select('*').order('starts_at', { ascending: true }).order('id', { ascending: true }), 'Calendar events'),
  ]);
  if (domain === 'crm') return Promise.all([
    paged(() => client.from('contacts').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Contacts'),
    paged(() => client.from('pipeline_stages').select('*').order('position', { ascending: true }).order('id', { ascending: true }), 'Pipeline stages'),
    paged(() => client.from('accounts').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Accounts'),
    paged(() => client.from('deals').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Deals'),
    paged(() => client.from('crm_sites').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Sites'),
    paged(() => client.from('proposal_documents').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Proposals'),
    safe(client.from('activities').select('*').order('created_at', { ascending: false }).limit(500)),
  ]);
  if (domain === 'files') return paged(() => client.from('job_files').select('*').is('deleted_at', null).order('created_at', { ascending: false }).order('id', { ascending: true }), 'Files');
  if (domain === 'forms') return Promise.all([
    paged(() => client.from('forms').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Forms'),
    paged(() => client.from('form_responses').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Form responses'),
  ]);
  if (domain === 'finance') return Promise.all([
    paged(() => client.from('finance_invoices').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Invoices'),
    paged(() => client.from('finance_payments').select('*').order('received_at', { ascending: false }).order('id', { ascending: true }), 'Payments'),
    paged(() => client.from('finance_expenses').select('*').order('spent_at', { ascending: false }).order('id', { ascending: true }), 'Expenses'),
    paged(() => client.from('finance_vendors').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Finance vendors'),
  ]);
  if (domain === 'portals') return Promise.all([
    paged(() => client.from('client_portals').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Client portals'),
    paged(() => client.from('client_portal_documents').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Portal documents'),
    paged(() => client.from('client_portal_annotations').select('*').order('created_at', { ascending: true }).order('id', { ascending: true }), 'Portal annotations'),
    safe(client.from('client_portal_events').select('*').order('created_at', { ascending: false }).limit(500)),
  ]);
  if (domain === 'pricebook') return Promise.all([
    paged(() => client.from('pricebook_vendors').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Price Book vendors'),
    paged(() => client.from('pricebook_materials').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Price Book materials'),
    paged(() => client.from('pricebook_vendor_prices').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Vendor prices'),
  ]);
  if (domain === 'labels') return Promise.all([
    paged(() => client.from('contact_labels').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Contact labels'),
    paged(() => client.from('contact_label_assignments').select('*').order('contact_id', { ascending: true }).order('label_id', { ascending: true }), 'Contact label assignments'),
  ]);
  if (domain === 'underwriting') return Promise.all([
    paged(() => client.from('underwriting_cases').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Underwriting cases'),
    paged(() => client.from('underwriting_calculators').select('*').order('position', { ascending: true }).order('id', { ascending: true }), 'Underwriting calculators'),
  ]);
  if (domain === 'proposals') return paged(() => client.from('proposal_documents').select('*').order('updated_at', { ascending: false }).order('id', { ascending: true }), 'Proposals');
  if (domain === 'recycle') return paged(() => client.from('recycle_bin_items').select('*').order('deleted_at', { ascending: false }).order('id', { ascending: true }), 'Recycle Bin');
  if (domain === 'notifications') return client.from('notifications').select('*').order('created_at', { ascending: false }).limit(200);
  if (domain === 'time') return paged(() => client.from('company_time_entries').select('*').order('started_at', { ascending: false }).order('id', { ascending: true }), 'Time entries');
  if (domain === 'audit') return safe(client.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100));
  if (domain === 'workspace') return Promise.all([
    paged(() => client.from('workspace_backups').select(options.workspaceBackupColumns).order('created_at', { ascending: false }).order('id', { ascending: true }), 'Workspace backups'),
    paged(() => client.from('workspace_builder_state').select('*').order('company_id', { ascending: true }), 'Workspace builder'),
    paged(() => client.from('wb_records').select('*').order('id', { ascending: true }), 'Workspace records'),
    safe(client.from('wb_data_transfers').select('*').order('created_at', { ascending: false }).limit(200)),
  ]);
  if (domain === 'messages') return Promise.all([
    paged(() => client.from('message_conversations').select('*').order('last_message_at', { ascending: false }).order('id', { ascending: true }), 'Message conversations'),
    paged(() => client.from('message_conversation_access').select('*').order('id', { ascending: true }), 'Message access'),
    client.from('messages').select('*').order('created_at', { ascending: false }).limit(500),
    client.from('message_attachments').select('*').order('created_at', { ascending: false }).limit(500),
    paged(() => client.from('message_reads').select('*').order('conversation_id', { ascending: true }).order('profile_id', { ascending: true }), 'Message reads'),
  ]);
  if (domain === 'access') return Promise.all([
    paged(() => client.from('companies').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Companies'),
    paged(() => client.from('team_members').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Team members'),
    paged(() => client.from('company_memberships').select('*').order('company_id', { ascending: true }).order('profile_id', { ascending: true }), 'Company memberships'),
    paged(() => client.from('profiles').select('*').order('id', { ascending: true }), 'Profiles'),
    paged(() => client.from('company_subscriptions').select('*').order('company_id', { ascending: true }), 'Subscriptions'),
    paged(() => client.from('roles').select('*').order('priority', { ascending: false }).order('id', { ascending: true }), 'Roles'),
    paged(() => client.from('role_permissions').select('*').order('role_id', { ascending: true }).order('permission_key', { ascending: true }), 'Role permissions'),
    paged(() => client.from('user_role_assignments').select('*').order('company_id', { ascending: true }).order('profile_id', { ascending: true }).order('role_id', { ascending: true }), 'Role assignments'),
    paged(() => client.from('resource_acl').select('*').order('id', { ascending: true }), 'Resource access'),
    paged(() => client.from('field_permissions').select('*').order('id', { ascending: true }), 'Field permissions'),
    paged(() => client.from('company_invites').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Company invites'),
    paged(() => client.from('company_join_requests').select('*').order('created_at', { ascending: false }).order('id', { ascending: true }), 'Join requests'),
    paged(() => client.from('company_plugins').select('*').order('company_id', { ascending: true }).order('plugin_id', { ascending: true }), 'Company plugins'),
    paged(() => client.from('workspaces').select('*').order('name', { ascending: true }).order('id', { ascending: true }), 'Workspaces'),
    paged(() => client.from('workspace_memberships').select('*').order('workspace_id', { ascending: true }).order('profile_id', { ascending: true }), 'Workspace memberships'),
    paged(() => client.from('workspace_plugins').select('*').order('workspace_id', { ascending: true }).order('plugin_id', { ascending: true }), 'Workspace plugins'),
  ]);
  throw new Error(`Unknown realtime query domain: ${domain}`);
}
