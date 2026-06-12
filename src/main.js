import './styles.css';

const CONFIG = {
  buildId: 'Quest HQ Company Workspace v1',
  questAuthEnabled: false,
  localLoginEnabled: true,
  localUsername: 'lumen123',
  localPassword: 'lumen123',
  supabaseUrl: 'https://lpzotcznihwyyudxycmd.supabase.co',
  supabaseKey: 'sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07',
};

const BASE_PATH = new URL(import.meta.env.BASE_URL || '/', window.location.origin).pathname.replace(/\/$/, '');
const SESSION_KEY = 'quest-hq-local-session';
const PROFILE_KEY = 'quest-hq-local-profile';
const JOB_CACHE_KEY = 'quest-hq-job-cache-v2';
const TASK_CACHE_KEY = 'quest-hq-task-cache-v1';
const FILE_CACHE_KEY = 'quest-hq-file-cache-v1';
const TEAM_CACHE_KEY = 'quest-hq-team-cache-v1';
const MEMBERSHIP_CACHE_KEY = 'quest-hq-company-membership-cache-v1';
const FORM_CACHE_KEY = 'quest-hq-company-form-cache-v1';
const FORM_RESPONSE_CACHE_KEY = 'quest-hq-company-form-response-cache-v1';
const COMPANY_KEY = 'quest-hq-active-company';
const TASK_VIEW_KEY = 'quest-hq-task-view';
const DRIVE_VIEW_KEY = 'quest-hq-drive-view';
const DRIVE_FILTER_KEY = 'quest-hq-drive-filter';

const STAGES = ['Lead', 'Site Review', 'Estimate', 'Approved', 'Active', 'Closed'];
const JOB_TABS = ['pipeline', 'list', 'profile', 'editor'];
const TASK_STATUSES = ['todo', 'pending', 'hold', 'review', 'done'];
const TASK_PRIORITIES = ['critical', 'urgent', 'high', 'medium', 'low'];
const TASK_TYPES = ['lead', 'bid', 'admin', 'invoicing', 'ar', 'meeting', 'web_dev'];
const FILE_CATEGORIES = ['All categories', 'Shared', 'Jobs', 'Forms', 'Photos', 'Permits', 'Contracts', 'Archive'];
const DRIVE_FILTERS = [
  ['my-drive', 'My Drive', 'ti-folder'],
  ['recent', 'Recent', 'ti-clock'],
  ['images', 'Images', 'ti-photo'],
  ['documents', 'Documents', 'ti-file-description'],
];
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
  { id: 'abraham', name: 'Abraham', full_name: 'Abraham Flores', email: 'abraham@quest-hq.local', color: '#f0b23b', active: true, company_ids: ['roofing', 'drafting'] },
  { id: 'maya', name: 'Maya', full_name: 'Maya Rosales', email: 'maya@quest-hq.local', color: '#60a5fa', active: true, company_ids: ['roofing'] },
  { id: 'andre', name: 'Andre', full_name: 'Andre Lee', email: 'andre@quest-hq.local', color: '#f97316', active: true, company_ids: ['roofing'] },
  { id: 'noah', name: 'Noah', full_name: 'Noah Park', email: 'noah@quest-hq.local', color: '#a78bfa', active: true, company_ids: ['drafting'] },
  { id: 'lumen-ops', name: 'Lumen Ops', full_name: 'Lumen Operations', email: 'ops@lumen.local', color: '#7c3aed', active: true, company_ids: ['lumen'] },
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

const state = {
  route: null,
  session: readJson(SESSION_KEY, null),
  profileDraft: readJson(PROFILE_KEY, null),
  jobs: readSeededList(JOB_CACHE_KEY, jobsFallback).map(normalizeJob),
  tasks: readSeededList(TASK_CACHE_KEY, tasksFallback).map(normalizeTask),
  files: readSeededList(FILE_CACHE_KEY, filesFallback).map(normalizeFile),
  forms: readSeededList(FORM_CACHE_KEY, formsFallback).map(normalizeForm),
  formResponses: readSeededList(FORM_RESPONSE_CACHE_KEY, formResponsesFallback).map(normalizeFormResponse),
  teamMembers: readSeededList(TEAM_CACHE_KEY, teamMembersFallback).map(normalizeTeamMember),
  memberships: readSeededList(MEMBERSHIP_CACHE_KEY, membershipsFallback),
  companies: companiesFallback,
  activeCompanyId: localStorage.getItem(COMPANY_KEY) || '',
  selectedJobId: '',
  selectedTaskId: '',
  selectedFileId: '',
  selectedFormId: '',
  selectedQuestionId: '',
  query: '',
  fileQuery: '',
  formQuery: '',
  stageFilter: 'all',
  taskStatusFilter: 'all',
  taskPriorityFilter: 'all',
  fileCategoryFilter: 'All categories',
  formTypeFilter: 'all',
  formsTab: 'library',
  formEditorTab: 'questions',
  taskView: localStorage.getItem(TASK_VIEW_KEY) || 'table',
  driveFolder: 'home',
  driveView: localStorage.getItem(DRIVE_VIEW_KEY) || 'grid',
  driveFilter: localStorage.getItem(DRIVE_FILTER_KEY) || 'my-drive',
  sync: { label: 'Loading workspace...', mode: 'loading' },
  dataLoaded: false,
  dataLoading: false,
  loginError: '',
  modal: '',
};

const app = document.getElementById('app');
init();

function init() {
  normalizeLegacyLocation();
  window.addEventListener('popstate', render);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('submit', onDocumentSubmit);
  document.addEventListener('input', onDocumentInput);
  document.addEventListener('change', onDocumentChange);
  render();
}

function render() {
  state.route = getRoute();

  if (needsLocalLogin(state.route)) {
    navigate('/login?return_url=' + encodeURIComponent(currentAppUrl()), { replace: true });
    return;
  }

  if (state.route.name === 'login') {
    renderLogin();
    return;
  }

  ensureDataLoad();
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

function needsLocalLogin(route) {
  if (!CONFIG.localLoginEnabled) return false;
  if (route.name === 'login') return false;
  return !state.session;
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
  const client = createSupabaseClient();
  if (!client) {
    state.sync = { label: 'Supabase unavailable', mode: 'local' };
    return;
  }

  const [companiesResult, jobsResult, tasksResult, filesResult, teamResult, membershipsResult] = await Promise.all([
    client.from('companies').select('*').order('name', { ascending: true }),
    client.from('jobs').select('*').order('updated_at', { ascending: false }),
    client.from('tasks').select('*').order('updated_at', { ascending: false }),
    client.from('job_files').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    client.from('team_members').select('*').order('name', { ascending: true }),
    client.from('company_memberships').select('*'),
  ]);

  let liveTables = 0;
  if (!companiesResult.error) {
    state.companies = companiesResult.data?.length ? companiesResult.data.map(normalizeCompany) : companiesFallback;
    liveTables += 1;
  }
  if (!jobsResult.error) {
    if (jobsResult.data?.length) state.jobs = jobsResult.data.map(normalizeJob);
    liveTables += 1;
  }
  if (!tasksResult.error) {
    if (tasksResult.data?.length) state.tasks = tasksResult.data.map(normalizeTask);
    liveTables += 1;
  }
  if (!filesResult.error) {
    if (filesResult.data?.length) state.files = filesResult.data.map(normalizeFile);
    liveTables += 1;
  }
  if (!teamResult.error) {
    if (teamResult.data?.length) state.teamMembers = teamResult.data.map(normalizeTeamMember);
    liveTables += 1;
  }
  if (!membershipsResult.error) {
    if (membershipsResult.data?.length) state.memberships = membershipsResult.data.map(normalizeMembership);
    liveTables += 1;
  }

  state.sync = liveTables ? { label: 'Quest Supabase live', mode: 'live' } : { label: 'Local fallback', mode: 'local' };
}

function createSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  return window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

function shellTemplate(route, workspace) {
  const session = activeSession();
  const companyId = activeCompanyId();
  return `
    <div class="quest-app" data-route="${h(route.name)}">
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${appHref(companyPath('jobs', {}, companyId))}" data-router aria-label="Quest HQ workspace">
            <i class="ti ti-bolt"></i>
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${h(CONFIG.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            <i class="ti ti-building"></i>
            <select data-company-switch aria-label="Active company">
              ${allowedCompanies().map((company) => `<option value="${h(company.id)}" ${company.id === companyId ? 'selected' : ''}>${h(companyLabel(company))}</option>`).join('')}
            </select>
          </label>
          <label class="global-search">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input data-global-search value="${h(state.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${h(state.sync.mode)}" data-sync-state>${h(state.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          <a class="btn btn-primary" href="${appHref(companyPath('tasks', { new: '1' }, companyId))}" data-router><i class="ti ti-plus"></i>New task</a>
          <div class="account-menu">
            <button class="avatar-button" type="button" data-action="open-profile" aria-label="Open Quest profile">
              ${renderAvatar(session.profile, 'avatar')}
            </button>
            <div class="account-popover">
              <strong>${h(session.profile.full_name)}</strong>
              <span>${h(session.profile.role_label)} - ${h(companyName(companyId))}</span>
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${renderDeck(route)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${workspace}
        </main>
      </div>
    </div>
    ${state.modal === 'profile' ? renderProfileModal(session.profile) : ''}
    ${state.modal === 'file-upload' ? renderFileUploadModal() : ''}
  `;
}

function renderDeck(route) {
  const companyId = activeCompanyId();
  const jobs = companyJobs(companyId);
  const tasks = companyTasks(companyId);
  const files = companyFiles(companyId);
  const forms = companyForms(companyId);
  const users = companyMembers(companyId);
  return `
    <div class="company-card">
      <span style="background:${h(companyColor(companyId))}"></span>
      <strong>${h(companyName(companyId))}</strong>
      <small>${h(roleForCompany(companyId))} workspace</small>
    </div>
    ${navGroup('Workspace', [
      navItem(route, companyPath('jobs', {}, companyId), 'ti-briefcase', 'Jobs', jobs.length),
      navItem(route, companyPath('tasks', {}, companyId), 'ti-list-check', 'Tasks', tasks.length),
      navItem(route, companyPath('files', {}, companyId), 'ti-folder', 'Files', files.length),
      navItem(route, companyPath('forms', {}, companyId), 'ti-clipboard-list', 'Forms', forms.length),
      navItem(route, companyPath('analytics', {}, companyId), 'ti-chart-bar', 'Dashboard'),
    ])}
    ${navGroup('Company', [
      navItem(route, companyPath('users', {}, companyId), 'ti-users', 'Users', users.length),
      navItem(route, companyPath('settings', {}, companyId), 'ti-settings', 'Settings'),
    ])}
    ${navGroup('Operations', [
      navItem(route, companyPath('time', {}, companyId), 'ti-clock', 'My time', '3.3h'),
      navItem(route, companyPath('approvals', {}, companyId), 'ti-user-check', 'Approvals', 0),
    ])}
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

function navItem(route, path, icon, label, count = '') {
  const active = isActiveNav(route, path);
  return `
    <a class="side-item ${active ? 'active' : ''}" href="${appHref(path)}" data-router>
      <i class="ti ${h(icon)}"></i>
      <span>${h(label)}</span>
      ${count !== '' ? `<b>${h(String(count))}</b>` : ''}
    </a>
  `;
}

function renderWorkspace(route) {
  if (route.name === 'command') return renderCompanyDashboard(activeCompanyId());
  if (route.name !== 'company') return renderPlannedPage(route.name);
  const companyId = route.companyId;
  if (route.section === 'jobs') return renderJobsPage(route, companyId);
  if (route.section === 'tasks') return renderTasksPage(route, companyId);
  if (route.section === 'files') return renderFilesPage(route, companyId);
  if (route.section === 'users') return renderUsersPage(companyId);
  if (route.section === 'settings') return renderSettingsPage(companyId);
  if (route.section === 'forms') return renderFormsPage(companyId);
  if (route.section === 'analytics') return renderCompanyDashboard(companyId);
  if (route.section === 'time' || route.section === 'approvals') return renderOperationsPage(route.section, companyId);
  return renderPlannedPage(route.section);
}

function renderCompanyDashboard(companyId) {
  const jobs = companyJobs(companyId);
  const tasks = companyTasks(companyId);
  const urgent = tasks.filter((task) => ['critical', 'urgent'].includes(task.priority));
  const files = companyFiles(companyId);
  return `
    ${workspaceHeader('Company dashboard', 'Live context for this company workspace.', `
      <a class="btn" href="${appHref(companyPath('files', {}, companyId))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${appHref(companyPath('tasks', { new: '1' }, companyId))}" data-router><i class="ti ti-plus"></i>New task</a>
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

function renderJobsPage(route, companyId) {
  const tab = normalizeJobTab(route.params.get('tab'));
  const job = selectedJob();
  return `
    ${workspaceHeader('Jobs', 'Company job records, clients, scope, and linked work.', `
      <a class="btn" href="${appHref(companyPath('files', job ? { job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <a class="btn btn-primary" href="${appHref(companyPath('jobs', { tab: 'editor', ...(job ? { job_id: job.id } : {}) }, companyId))}" data-router><i class="ti ti-plus"></i>Add job</a>
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
  if (tab === 'editor') return renderJobEditor(companyId, job);
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
          <a class="btn" href="${appHref(companyPath('jobs', { tab: 'editor', job_id: job.id }, companyId))}" data-router>Edit job</a>
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
    <form class="panel job-editor" data-job-form>
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
      ${field('Site address', 'site_address', edit.site_address, false, 'text', 'span-2')}
      ${textareaField('Scope', 'scope', edit.scope, 'span-2')}
      ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${job ? `<button class="btn danger" type="button" data-action="delete-job" data-job-id="${h(job.id)}">Delete</button>` : ''}
      </div>
    </form>
  `;
}

function renderTasksPage(route, companyId) {
  const job = route.jobId ? jobById(route.jobId) : null;
  const taskId = route.params.get('task_id') || state.selectedTaskId;
  const task = taskId ? taskById(taskId) : filteredTasks(companyId, job?.id)[0] || null;
  const editing = route.params.get('new') === '1' || route.params.get('edit') === '1';
  const tasks = filteredTasks(companyId, job?.id);
  return `
    ${workspaceHeader(job ? `${job.name} tasks` : 'Tasks', 'Native Quest task execution backed by the company task table.', `
      <a class="btn" href="${appHref(companyPath('jobs', job ? { tab: 'profile', job_id: job.id } : {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${appHref(companyPath('tasks', { ...(job ? { job_id: job.id } : {}), new: '1' }, companyId))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${renderTaskToolbar(companyId, job)}
    <section class="task-layout ${editing ? 'editing' : ''}">
      <article class="panel task-main">
        ${state.taskView === 'board' ? renderTaskBoard(companyId, tasks) : renderTaskTable(companyId, tasks)}
      </article>
      <aside class="panel detail-panel">
        ${editing ? renderTaskForm(companyId, job, route.params.get('edit') === '1' ? task : null) : renderTaskDetail(companyId, task)}
      </aside>
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
        <a class="btn" href="${appHref(companyPath('tasks', { ...(edit.project_id ? { job_id: edit.project_id } : {}) }, companyId))}" data-router>Cancel</a>
      </div>
    </form>
  `;
}

function renderFilesPage(route, companyId) {
  const folder = route.params.get('folder') || state.driveFolder || 'home';
  const job = route.jobId ? jobById(route.jobId) : null;
  const files = filteredDriveFiles(companyId, folder, job?.id || '');
  const selected = selectedDriveFile(files);
  const metrics = driveMetrics(companyId);
  return `
    <section class="tool-page drive-page">
      <div class="tool-strip">
        <div>
          <div class="context-line"><span>${h(companyName(companyId))}</span><b>${h(job ? job.name : driveViewLabel())}</b></div>
          <h1>Company Drive</h1>
        </div>
        <div class="head-actions">
          <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
          <a class="btn btn-primary" href="${appHref(companyPath('jobs', {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
        </div>
      </div>
      <section class="file-metrics">
        ${metricCard('Files', metrics.count, 'Company records')}
        ${metricCard('Used', formatBytes(metrics.bytes), 'Tracked storage')}
        ${metricCard('Job folders', companyJobs(companyId).length, 'Workspace folders')}
        ${metricCard('Visible', files.length, job ? 'Job scoped' : driveViewLabel())}
      </section>
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div>
            <h2>${h(job ? job.name : 'Drive browser')}</h2>
            <p>${h(job ? `${job.client_name || companyName(companyId)} file workspace` : 'Company folders, shared files, job packets, photos, and forms.')}</p>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${h(state.fileQuery)}" placeholder="Search drive" />
          </label>
          <button class="btn" type="button" data-action="refresh-data"><i class="ti ti-refresh"></i>Refresh</button>
        </header>
        <div class="drive-shell">
          <aside class="drive-rail">
            ${DRIVE_FILTERS.map(([id, label, icon]) => driveFilterButton(id, label, icon)).join('')}
            <div class="drive-rail-block">
              <span>Job folder</span>
              <select data-file-job-filter>
                <option value="">All jobs</option>
                ${companyJobs(companyId).map((item) => `<option value="${h(item.id)}" ${job?.id === item.id ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
              </select>
            </div>
            <div class="drive-capacity">
              <span>${formatBytes(metrics.bytes)} of 1 GB</span>
              <b><i style="width:${h(String(Math.min(100, Math.round((metrics.bytes / 1073741824) * 100))))}%"></i></b>
            </div>
          </aside>
          <div class="drive-main">
            <section class="file-toolbar">
              <label>
                <span>Folder</span>
                <select data-file-folder-filter>
                  <option value="home" ${folder === 'home' ? 'selected' : ''}>Home</option>
                  ${DRIVE_FOLDERS.map(([id, label]) => `<option value="${h(id)}" ${folder === id ? 'selected' : ''}>${h(label)}</option>`).join('')}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select data-file-category-filter>
                  ${FILE_CATEGORIES.map((category) => `<option value="${h(category)}" ${state.fileCategoryFilter === category ? 'selected' : ''}>${h(category)}</option>`).join('')}
                </select>
              </label>
              <nav class="breadcrumbs" aria-label="Drive location">
                <a href="${appHref(companyPath('files', {}, companyId))}" data-router>${h(companyName(companyId))}</a>
                ${folder !== 'home' ? `<span>/</span><a href="${appHref(companyPath('files', { folder }, companyId))}" data-router>${h(folderLabel(folder))}</a>` : ''}
                ${job ? `<span>/</span><strong>${h(job.name)}</strong>` : ''}
              </nav>
              <div class="segmented" role="group" aria-label="Drive view">
                <button class="${state.driveView === 'grid' ? 'active' : ''}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Grid</button>
                <button class="${state.driveView === 'list' ? 'active' : ''}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list"></i>List</button>
              </div>
            </section>
            ${folder === 'home' && state.driveFilter === 'my-drive' && !job ? renderDriveHome(companyId) : ''}
            ${renderDriveFiles(companyId, files)}
          </div>
          <aside class="drive-details">
            ${renderFileDetails(selected, companyId)}
          </aside>
        </div>
      </section>
    </section>
  `;
}

function renderDriveHome(companyId) {
  const jobs = companyJobs(companyId);
  return `
    <section class="drive-section-title">
      <div><h3>Company folders</h3><span>Folders are scoped to ${h(companyName(companyId))}</span></div>
    </section>
    <section class="drive-folder-grid">
      ${DRIVE_FOLDERS.map(([id, label, text, icon]) => `
        <a class="drive-folder-card" href="${appHref(companyPath('files', { folder: id }, companyId))}" data-router>
          <span class="drive-folder-icon"><i class="ti ${h(icon)}"></i></span>
          <strong>${h(label)}</strong>
          <small>${h(text)}</small>
          <em>${h(filteredDriveFiles(companyId, id).length)} files</em>
        </a>
      `).join('')}
    </section>
    <section class="drive-section-title recent-title">
      <div><h3>Job folders</h3><span>Each job has a linked drive folder.</span></div>
    </section>
    <section class="drive-folder-grid">
      ${jobs.map((job) => `
        <a class="drive-folder-card" href="${appHref(companyPath('files', { folder: 'jobs', job_id: job.id }, companyId))}" data-router>
          <span class="drive-folder-icon"><i class="ti ti-folder"></i></span>
          <strong>${h(job.name)}</strong>
          <small>${h(job.client_name || companyName(companyId))}</small>
          <em>${fileCountForJob(job.id)} files</em>
        </a>
      `).join('') || emptyState('Create a job workspace to get its file folder.')}
    </section>
  `;
}

function renderDriveFiles(companyId, files) {
  const title = state.driveFilter === 'my-drive' ? 'Files' : driveViewLabel();
  return `
    <section class="drive-section-title recent-title">
      <div><h3>${h(title)}</h3><span>${files.length} visible file${files.length === 1 ? '' : 's'}</span></div>
    </section>
    ${state.driveView === 'list' ? `
      <div class="file-table-live">
        ${files.map((file) => `
          <button type="button" class="file-row-live ${file.id === state.selectedFileId ? 'active' : ''}" data-action="select-file" data-file-id="${h(file.id)}">
            <span class="file-type ${h(fileTypeClass(file))}">${h(fileTypeLabel(file).slice(0, 3).toUpperCase())}</span>
            <strong>${h(file.file_name)}<span>${h(file.notes || file.object_path || folderLabel(file.folder))}</span></strong>
            <span>${h(file.category || folderLabel(file.folder))}</span>
            <span>${h(jobById(file.job_id)?.name || 'Company shared')}</span>
            <span>${formatBytes(file.size_bytes)}</span>
          </button>
        `).join('') || emptyState('No files match this Drive view.')}
      </div>
    ` : `
      <div class="file-grid-live">
        ${files.map((file) => `
          <button type="button" class="file-card-live ${file.id === state.selectedFileId ? 'active' : ''}" data-action="select-file" data-file-id="${h(file.id)}">
            <span class="file-thumb">${fileThumb(file)}</span>
            <strong>${h(file.file_name)}</strong>
            <span>${h(file.category || folderLabel(file.folder))} / ${formatBytes(file.size_bytes)}</span>
          </button>
        `).join('') || emptyState('No files match this Drive view.')}
      </div>
    `}
  `;
}

function renderFileDetails(file, companyId) {
  if (!file) {
    return `
      <div class="file-detail-preview"><span class="file-doc-icon"><i class="ti ti-folder-open"></i></span></div>
      <h3>${h(companyName(companyId))} Drive</h3>
      <p>Pick a file to see metadata, job context, storage path, and actions.</p>
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

function renderFileUploadModal() {
  const companyId = activeCompanyId();
  const folder = state.driveFolder === 'home' ? 'shared' : state.driveFolder;
  return `
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">Company Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${selectField('Folder', 'folder', folder, DRIVE_FOLDERS.map(([id, label]) => [id, label]))}
          ${selectField('Job', 'job_id', state.route?.jobId || '', [['', 'Company shared file']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
          ${selectField('Category', 'category', folderLabel(folder), FILE_CATEGORIES.filter((item) => item !== 'All categories').map((item) => [item, item]))}
          ${field('Uploaded by', 'uploaded_by_label', activeSession().profile.full_name || 'Quest HQ')}
          ${textareaField('Notes', 'notes', '', 'span-2')}
          <div class="form-actions span-2">
            <button class="btn btn-primary" type="submit">Upload to drive</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderUsersPage(companyId) {
  const members = companyMembers(companyId);
  return `
    ${workspaceHeader('Users', 'Company members, roles, workers, and access context.', `
      <a class="btn btn-primary" href="${appHref(companyPath('settings', {}, companyId))}" data-router><i class="ti ti-settings"></i>Settings</a>
    `)}
    <section class="users-grid">
      ${members.map((member) => `
        <article class="user-card">
          ${renderAvatar({ full_name: member.full_name, avatar_url: member.avatar_url }, 'avatar')}
          <div>
            <strong>${h(member.full_name)}</strong>
            <span>${h(member.email)}</span>
            <small>${h(roleForMember(companyId, member.id))}</small>
          </div>
        </article>
      `).join('') || emptyState('No users assigned to this company yet.')}
    </section>
    <section class="panel top-gap">
      <div class="section-head"><div><h2>Membership model</h2><p>company_memberships is the canonical table; legacy company_ids remain as backfill fields.</p></div></div>
      ${contractRows([
        ['Tenant key', 'company_id on jobs, tasks, files, forms, users, settings'],
        ['Privacy status', CONFIG.questAuthEnabled ? 'RLS can enforce membership' : 'Client-filtered only while auth is disabled'],
        ['Active role', roleForCompany(companyId)],
      ])}
    </section>
  `;
}

function renderSettingsPage(companyId) {
  const company = companyById(companyId);
  return `
    ${workspaceHeader('Settings', 'Company settings, roles, approvals, and admin controls.', '')}
    <section class="dashboard-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${contractRows([
          ['Name', companyName(companyId)],
          ['Company ID', companyId],
          ['Color', company?.color || companyColor(companyId)],
          ['Visible jobs', companyJobs(companyId).length],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Prepared for Supabase Auth and RLS.</p></div></div>
        ${contractRows([
          ['Auth switch', CONFIG.questAuthEnabled ? 'Enabled' : 'Disabled'],
          ['Local login', CONFIG.localLoginEnabled ? 'Enabled' : 'Disabled'],
          ['Isolation', CONFIG.questAuthEnabled ? 'Server-enforced' : 'Client-filtered only'],
          ['Memberships', String(state.memberships.filter((item) => item.company_id === companyId).length)],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Approvals</h2><p>Quest-owned access approval queue.</p></div></div>
        ${emptyState('No pending company approvals.')}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${companyMembers(companyId).map((member) => `<div><strong>${h(member.full_name)}</strong><span>${h(roleForMember(companyId, member.id))}</span></div>`).join('') || emptyState('No workers assigned.')}
        </div>
      </article>
    </section>
  `;
}

function renderFormsPage(companyId) {
  const forms = filteredForms(companyId);
  const current = selectedForm(companyId);
  const responses = companyFormResponses(companyId);
  const job = state.route?.jobId ? jobById(state.route.jobId) : null;
  return `
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      <div class="tool-strip">
        <div>
          <div class="context-line"><span>${h(companyName(companyId))}</span><b>${h(job ? job.name : `${forms.length} visible forms`)}</b></div>
          <h1>Forms</h1>
        </div>
        <div class="forms-mini-search">
          <label>
            <span>Search</span>
            <input data-form-search value="${h(state.formQuery)}" placeholder="Find form, audience, or job" />
          </label>
          <label>
            <span>Type</span>
            <select data-form-type-filter>
              <option value="all" ${state.formTypeFilter === 'all' ? 'selected' : ''}>All types</option>
              ${FORM_TYPES.map((type) => `<option value="${h(type)}" ${state.formTypeFilter === type ? 'selected' : ''}>${h(type)}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>
      <section class="forms-dashboard">
        ${metricCard('Forms', companyForms(companyId).length, 'Company library')}
        ${metricCard('Published', companyForms(companyId).filter((form) => form.status === 'Published').length, 'Live forms')}
        ${metricCard('Responses', responses.length, 'Local response queue')}
        ${metricCard('Templates', formTemplates().length, 'Reusable starts')}
      </section>
      <nav class="tabbar forms-tabs" aria-label="Forms workspace">
        ${['library', 'builder', 'responses', 'templates'].map((tab) => `
          <button class="${state.formsTab === tab ? 'active' : ''}" type="button" data-action="set-forms-tab" data-tab="${h(tab)}">${h(titleCase(tab))}</button>
        `).join('')}
      </nav>
      ${state.formsTab === 'library' ? renderFormsLibrary(companyId, forms, current) : ''}
      ${state.formsTab === 'builder' ? renderFormsBuilder(companyId, current) : ''}
      ${state.formsTab === 'responses' ? renderFormsResponses(companyId, current) : ''}
      ${state.formsTab === 'templates' ? renderFormsTemplates(companyId) : ''}
    </section>
  `;
}

function renderFormsLibrary(companyId, forms, current) {
  return `
    <section class="forms-library-grid">
      <article class="forms-library-panel panel">
        <div class="forms-list">
          ${forms.map((form) => `
            <button class="form-card ${current?.id === form.id ? 'active' : ''}" type="button" data-action="select-form" data-form-id="${h(form.id)}">
              <strong>${h(form.title)}</strong>
              <span>${h(form.description || 'No description yet.')}</span>
              <small>${h(form.type)} / ${h(form.status)} / ${formQuestionCount(form)} questions</small>
            </button>
          `).join('') || emptyState('No forms match this company view.')}
        </div>
      </article>
      <aside class="forms-summary panel">
        ${current ? renderFormSummary(companyId, current) : emptyState('Create a form or choose a template.')}
      </aside>
    </section>
  `;
}

function renderFormSummary(companyId, form) {
  const responses = responsesForForm(form.id);
  const job = jobById(form.linked_job_id);
  return `
    <div class="forms-summary-head">
      <div>
        <h2>${h(form.title)}</h2>
        <p>${h(form.description || 'No description yet.')}</p>
      </div>
      <span>${h(form.status)}</span>
    </div>
    <div class="forms-simple-meta">
      <span>${h(form.type)}</span>
      <span>${h(form.audience || 'Internal')}</span>
      <span>${h(job?.name || 'Company level')}</span>
      <span>${formQuestionCount(form)} questions</span>
      <span>${responses.length} responses</span>
    </div>
    <div class="summary-pill-grid">
      ${metricCard('Updated', formatDate(form.updated_at), 'Last edit')}
      ${metricCard('Approval', form.require_approval ? 'Required' : 'Not required', 'Review flow')}
      ${metricCard('Email', form.collect_email ? 'Collected' : 'Optional', 'Submitter identity')}
    </div>
    <div class="forms-summary-share">
      <strong>Shareable preview URL</strong>
      <input readonly value="${h(`${window.location.origin}${appHref(companyPath('forms', { form_id: form.id }, companyId))}`)}" />
      <div class="form-actions">
        <button class="btn" type="button" data-action="copy-form-link" data-form-id="${h(form.id)}">Copy</button>
        <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${h(form.id)}">Edit</button>
      </div>
    </div>
    <div class="forms-summary-actions">
      <button class="btn" type="button" data-action="duplicate-form" data-form-id="${h(form.id)}"><i class="ti ti-copy"></i>Duplicate</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${h(form.id)}"><i class="ti ti-world-upload"></i>Publish</button>
      <button class="btn" type="button" data-action="archive-form" data-form-id="${h(form.id)}"><i class="ti ti-archive"></i>Archive</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${h(form.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
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
  return `
    <section class="forms-builder-grid">
      <aside class="panel form-settings-panel">
        <div class="section-head"><div><h2>Settings</h2><p>${h(form.status)} / ${h(form.type)}</p></div></div>
        ${formInput('Title', 'title', form.title, true)}
        ${formTextarea('Description', 'description', form.description)}
        ${formSelect('Type', 'type', form.type, FORM_TYPES.map((type) => [type, type]))}
        ${formSelect('Status', 'status', form.status, FORM_STATUSES.map((status) => [status, status]))}
        ${formInput('Audience', 'audience', form.audience)}
        ${formSelect('Linked job', 'linked_job_id', form.linked_job_id || '', [['', 'Company level']].concat(companyJobs(companyId).map((job) => [job.id, job.name])))}
        ${formInput('Theme color', 'theme_color', form.theme_color || companyColor(companyId), false, 'color')}
        ${formSelect('Background', 'background', form.background || 'clean', [['clean', 'Clean'], ['paper', 'Paper'], ['grid', 'Grid'], ['dark', 'Dark']])}
        ${formInput('Submit button', 'submit_label', form.submit_label || 'Submit')}
        <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${form.collect_email ? 'checked' : ''} /> Collect email</label>
        <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${form.require_approval ? 'checked' : ''} /> Require approval</label>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${h(form.id)}">Save</button>
          <button class="btn" type="button" data-action="publish-form" data-form-id="${h(form.id)}">Publish</button>
        </div>
      </aside>
      <article class="panel question-workbench">
        <div class="section-head">
          <div><h2>Questions</h2><p>${formQuestionCount(form)} question${formQuestionCount(form) === 1 ? '' : 's'}</p></div>
          <div class="question-add-menu">
            ${QUESTION_TYPES.slice(0, 5).map(([type, label]) => `<button class="btn" type="button" data-action="add-question" data-question-type="${h(type)}">${h(label)}</button>`).join('')}
          </div>
        </div>
        <div class="question-list">
          ${form.questions.map((question, index) => renderQuestionCard(question, index)).join('') || emptyState('Add the first question.')}
        </div>
      </article>
      <aside class="panel forms-preview-panel">
        <div class="section-head"><div><h2>Preview</h2><p>Submits into the local company response queue.</p></div></div>
        ${renderFormPreview(companyId, form)}
      </aside>
    </section>
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

function renderFormsTemplates(companyId) {
  return `
    <section class="forms-template-grid">
      ${formTemplates().map((template) => `
        <article class="template-card panel">
          <strong>${h(template.title)}</strong>
          <p>${h(template.description)}</p>
          <div class="forms-simple-meta">
            <span>${h(template.type)}</span>
            <span>${template.questions.length} questions</span>
          </div>
          <button class="btn btn-primary" type="button" data-action="use-form-template" data-template-id="${h(template.id)}">Use template</button>
        </article>
      `).join('')}
    </section>
  `;
}

function renderOperationsPage(name, companyId) {
  const labels = {
    time: ['My time', 'Personal time and shift context inside the company workspace.'],
    approvals: ['Approvals', 'Company access approvals and role requests.'],
  };
  const [title, summary] = labels[name] || labels.time;
  return `
    ${workspaceHeader(title, summary, '')}
    <section class="dashboard-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Summary</h2><p>Quest-owned operational surface.</p></div></div>
        ${contractRows([
          ['Company', companyName(companyId)],
          ['Visible jobs', companyJobs(companyId).length],
          ['Open tasks', companyTasks(companyId).filter((task) => task.status !== 'done').length],
          ['Mode', CONFIG.questAuthEnabled ? 'Supabase auth' : 'Local basic mode'],
        ])}
      </article>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Workload queue</h2><p>Sorted by active company and urgency.</p></div></div>
        <div class="queue-list">${companyTasks(companyId).slice(0, 8).map((task) => taskQueueRow(task)).join('') || emptyState('No tasks found.')}</div>
      </article>
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
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Company Workspace</small></span>
        </div>
        <div>
          <div class="eyebrow">Local access</div>
          <h1>Sign in to Quest HQ</h1>
          <p>Supabase auth is switched off while the company workspace foundation is stabilized.</p>
        </div>
        <form data-login-form>
          <label>Username<input name="username" value="${h(CONFIG.localUsername)}" autocomplete="username" /></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" /></label>
          <input type="hidden" name="return_url" value="${h(returnUrl)}" />
          <button class="btn btn-primary full" type="submit">Sign in</button>
          ${state.loginError ? `<div class="form-message error">${h(state.loginError)}</div>` : `<div class="form-message">Temporary credentials: lumen123 / lumen123</div>`}
        </form>
      </section>
    </main>
  `;
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

function onDocumentClick(event) {
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
  if (!link) return;
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
    localStorage.removeItem(SESSION_KEY);
    state.session = null;
    navigate('/login', { replace: true });
    return;
  }
  if (action === 'open-profile') {
    event.preventDefault();
    state.modal = 'profile';
    render();
    return;
  }
  if (action === 'open-file-upload') {
    event.preventDefault();
    state.modal = 'file-upload';
    render();
    return;
  }
  if (action === 'close-modal') {
    event.preventDefault();
    state.modal = '';
    render();
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
  if (action === 'set-drive-filter') {
    event.preventDefault();
    state.driveFilter = node.dataset.filter || 'my-drive';
    localStorage.setItem(DRIVE_FILTER_KEY, state.driveFilter);
    state.selectedFileId = '';
    render();
    return;
  }
  if (action === 'select-file') {
    event.preventDefault();
    state.selectedFileId = node.dataset.fileId || '';
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
    state.formsTab = node.dataset.tab || 'library';
    render();
    return;
  }
  if (action === 'new-form') {
    event.preventDefault();
    createForm(activeCompanyId());
    return;
  }
  if (action === 'select-form') {
    event.preventDefault();
    selectForm(node.dataset.formId);
    return;
  }
  if (action === 'edit-form') {
    event.preventDefault();
    selectForm(node.dataset.formId);
    state.formsTab = 'builder';
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
  if (action === 'use-form-template') {
    event.preventDefault();
    useFormTemplate(activeCompanyId(), node.dataset.templateId);
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
    state.session = buildLocalSession();
    writeJson(SESSION_KEY, state.session);
    navigate(safeReturnUrl(form.return_url || appHref(companyPath('jobs', {}, defaultCompanyId()))), { replace: true });
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

  if (event.target.matches('[data-file-form]')) {
    event.preventDefault();
    saveFileRecord(event.target);
    return;
  }

  if (event.target.matches('[data-form-preview-response]')) {
    event.preventDefault();
    saveFormResponse(event.target);
  }
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
      navigate(companyPath('jobs', { tab: 'profile', job_id: result.data.id }, payload.company_id), { replace: true });
      return;
    }
    state.sync = { label: 'Saved locally', mode: 'local' };
  }

  upsertJob(payload);
  navigate(companyPath('jobs', { tab: 'profile', job_id: payload.id }, payload.company_id), { replace: true });
}

async function deleteJob(id) {
  if (!id) return;
  const companyId = activeCompanyId();
  const client = createSupabaseClient();
  if (client) await client.from('jobs').delete().eq('id', id);
  state.jobs = state.jobs.filter((job) => job.id !== id);
  state.selectedJobId = companyJobs(companyId)[0]?.id || '';
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

  const existing = state.tasks.some((task) => task.id === payload.id);
  const client = createSupabaseClient();
  if (client) {
    const savePayload = taskPayload(payload);
    const result = existing
      ? await client.from('tasks').update(savePayload).eq('id', payload.id).select().single()
      : await client.from('tasks').insert(savePayload).select().single();
    if (!result.error && result.data) {
      upsertTask(normalizeTask(result.data));
      state.sync = { label: 'Quest Supabase live', mode: 'live' };
      navigate(companyPath('tasks', { ...(payload.project_id ? { job_id: payload.project_id } : {}), task_id: payload.id }, companyId), { replace: true });
      return;
    }
    state.sync = { label: 'Task saved locally', mode: 'local' };
  }

  upsertTask(payload);
  navigate(companyPath('tasks', { ...(payload.project_id ? { job_id: payload.project_id } : {}), task_id: payload.id }, companyId), { replace: true });
}

async function deleteTask(id) {
  if (!id) return;
  const companyId = activeCompanyId();
  const client = createSupabaseClient();
  if (client) await client.from('tasks').delete().eq('id', id);
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.selectedTaskId = '';
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
  state.modal = '';
  navigate(companyPath('files', { folder: fields.folder || 'shared', ...(fields.job_id ? { job_id: fields.job_id } : {}) }, companyId), { replace: true });
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
  const map = {
    '/index.html': companyPath('jobs', {}, companyId),
    '/command.html': companyPath('jobs', {}, companyId),
    '/admin.html': companyPath('settings', {}, companyId),
    '/automations.html': companyPath('settings', {}, companyId),
    '/crm.html': companyPath('users', {}, companyId),
    '/dashboards.html': companyPath('analytics', {}, companyId),
    '/files.html': companyPath('files', {}, companyId),
    '/finance.html': companyPath('analytics', {}, companyId),
    '/forms.html': companyPath('forms', {}, companyId),
    '/jobs.html': companyPath('jobs', {}, companyId),
    '/knowledge.html': companyPath('files', { folder: 'shared' }, companyId),
    '/login.html': '/login',
    '/templates.html': companyPath('forms', {}, companyId),
    '/tickets.html': companyPath('tasks', {}, companyId),
  };

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
  if (path === '/admin') target = companyPath('settings', {}, companyId);
  if (path === '/time') target = companyPath('time', {}, companyId);
  if (path === '/team') target = companyPath('users', {}, companyId);
  if (path === '/approvals') target = companyPath('approvals', {}, companyId);
  if (path === '/clock') target = companyPath('settings', {}, companyId);
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
  if (!allowed.includes(route.companyId)) {
    return companyPath(route.section || 'jobs', Object.fromEntries(route.params.entries()), allowed[0] || defaultCompanyId());
  }
  const validSections = ['jobs', 'tasks', 'files', 'forms', 'analytics', 'users', 'settings', 'time', 'approvals'];
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
  return `/company/${encodeURIComponent(companyId || defaultCompanyId())}/${section}${search.toString() ? `?${search.toString()}` : ''}`;
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
    editor: 'Editor',
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
  const next = allowed.includes(companyId) ? companyId : allowed[0] || defaultCompanyId();
  state.activeCompanyId = next;
  localStorage.setItem(COMPANY_KEY, next);
  const route = state.route || getRoute();
  const section = route.name === 'company' ? route.section : 'jobs';
  navigate(companyPath(section, {}, next));
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

function companyFiles(companyId = activeCompanyId()) {
  return state.files.filter((file) => file.company_id === companyId);
}

function companyMembers(companyId = activeCompanyId()) {
  return state.teamMembers.filter((member) => Array.isArray(member.company_ids) && member.company_ids.includes(companyId));
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

function allowedCompanyIds() {
  const profile = activeSession().profile;
  const allIds = state.companies.map((company) => company.id);
  if (['developer', 'admin'].includes(profile.role)) return allIds.length ? allIds : companiesFallback.map((company) => company.id);
  const membershipIds = state.memberships
    .filter((item) => item.profile_id === profile.id && item.status !== 'disabled')
    .map((item) => item.company_id);
  const ids = membershipIds.length ? membershipIds : profile.company_ids || [];
  return ids.filter((id) => allIds.includes(id));
}

function activeCompanyId() {
  const allowed = allowedCompanyIds();
  if (allowed.includes(state.activeCompanyId)) return state.activeCompanyId;
  return allowed[0] || defaultCompanyId();
}

function defaultCompanyId() {
  return companiesFallback[0].id;
}

function companyById(id) {
  return state.companies.find((item) => item.id === id) || companiesFallback.find((item) => item.id === id) || null;
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
  return state.jobs.find((job) => job.id === jobId)?.company_id || '';
}

function roleForCompany(companyId) {
  const profile = activeSession().profile;
  if (['developer', 'admin'].includes(profile.role)) return titleCase(profile.role);
  return titleCase(state.memberships.find((item) => item.company_id === companyId && item.profile_id === profile.id)?.role || profile.role || 'member');
}

function roleForMember(companyId, memberId) {
  const membership = state.memberships.find((item) => item.company_id === companyId && (item.member_id === memberId || item.profile_id === memberId));
  return titleCase(membership?.role || 'member');
}

function memberName(id) {
  const member = state.teamMembers.find((item) => item.id === id);
  return member?.full_name || member?.name || id || 'Unassigned';
}

function taskCountForJob(jobId) {
  return state.tasks.filter((task) => task.project_id === jobId).length;
}

function fileCountForJob(jobId) {
  return state.files.filter((file) => file.job_id === jobId).length;
}

function normalizeCompany(input) {
  return {
    id: String(input.id || '').trim(),
    name: String(input.name || input.short_name || input.id || '').trim(),
    short_name: String(input.short_name || input.label || input.name || input.id || '').trim(),
    color: String(input.color || '#f0b23b'),
    label: String(input.label || input.short_name || input.name || input.id || '').trim(),
  };
}

function normalizeJob(input) {
  return {
    id: String(input.id || ''),
    company_id: String(input.company_id || defaultCompanyId()),
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
    company_id: String(input.company_id || defaultCompanyId()),
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
    company_id: String(input.company_id || defaultCompanyId()),
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

function normalizeForm(input) {
  const questions = Array.isArray(input.questions) ? input.questions.map(normalizeQuestion) : [];
  const type = FORM_TYPES.includes(input.type) ? input.type : 'Internal';
  const status = FORM_STATUSES.includes(input.status) ? input.status : 'Draft';
  return {
    id: String(input.id || `form-${crypto.randomUUID()}`),
    company_id: String(input.company_id || defaultCompanyId()),
    title: String(input.title || 'Untitled form').trim() || 'Untitled form',
    description: String(input.description || '').trim(),
    type,
    status,
    audience: String(input.audience || 'Internal').trim(),
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
    company_id: String(input.company_id || defaultCompanyId()),
    form_id: String(input.form_id || input.formId || ''),
    submitted_by: String(input.submitted_by || input.submitter_email || 'Anonymous'),
    submitter_email: String(input.submitter_email || ''),
    answers: input.answers && typeof input.answers === 'object' ? input.answers : {},
    created_at: input.created_at || new Date().toISOString(),
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
    company_ids: Array.isArray(input.company_ids) ? input.company_ids : [],
  };
}

function normalizeMembership(input) {
  return {
    company_id: String(input.company_id || ''),
    profile_id: String(input.profile_id || input.member_id || ''),
    member_id: input.member_id ? String(input.member_id) : '',
    role: String(input.role || 'member'),
    status: String(input.status || 'active'),
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
    ...(state.profileDraft || {}),
  };
  return {
    auth: CONFIG.questAuthEnabled ? 'supabase' : 'local-basic',
    user: { id: profile.id, username: CONFIG.localUsername, email: profile.email },
    profile,
  };
}

function workspaceHeader(title, summary, actions = '') {
  return `
    <section class="workspace-head">
      <div>
        <div class="context-line"><span>${h(companyName(activeCompanyId()))}</span><b>${h(roleForCompany(activeCompanyId()))}</b></div>
        <h1>${h(title)}</h1>
        <p>${h(summary)}</p>
      </div>
      ${actions ? `<div class="head-actions">${actions}</div>` : ''}
    </section>
  `;
}

function metricGrid(items) {
  return `<section class="metric-grid">${items.map(([label, value]) => `<article class="metric"><span>${h(label)}</span><strong>${h(value)}</strong></article>`).join('')}</section>`;
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

function renderAvatar(profile, className) {
  if (profile.avatar_url) return `<span class="${h(className)}"><img src="${h(profile.avatar_url)}" alt="" /></span>`;
  const initials = String(profile.full_name || profile.email || 'QB').trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'QB';
  return `<span class="${h(className)}">${h(initials)}</span>`;
}

function emptyState(text) {
  return `<div class="empty-state">${h(text)}</div>`;
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
  writeJson(JOB_CACHE_KEY, state.jobs);
  writeJson(TASK_CACHE_KEY, state.tasks);
  writeJson(FILE_CACHE_KEY, state.files);
  writeJson(FORM_CACHE_KEY, state.forms);
  writeJson(FORM_RESPONSE_CACHE_KEY, state.formResponses);
  writeJson(TEAM_CACHE_KEY, state.teamMembers);
  writeJson(MEMBERSHIP_CACHE_KEY, state.memberships);
}

function metricCard(label, value, text = '') {
  return `<article class="metric"><span>${h(label)}</span><strong>${h(value)}</strong>${text ? `<small>${h(text)}</small>` : ''}</article>`;
}

function detailRow(label, value) {
  return `<div><strong>${h(label)}</strong><span>${h(value)}</span></div>`;
}

function driveFilterButton(id, label, icon) {
  return `
    <button class="${state.driveFilter === id ? 'active' : ''}" type="button" data-action="set-drive-filter" data-filter="${h(id)}">
      <i class="ti ${h(icon)}"></i>
      <span>${h(label)}</span>
    </button>
  `;
}

function driveViewLabel() {
  return DRIVE_FILTERS.find(([id]) => id === state.driveFilter)?.[1] || 'My Drive';
}

function driveMetrics(companyId = activeCompanyId()) {
  const files = companyFiles(companyId);
  return { count: files.length, bytes: sum(files, 'size_bytes') };
}

function selectedDriveFile(files) {
  const visible = files || [];
  const selected = visible.find((file) => file.id === state.selectedFileId) || visible[0] || null;
  state.selectedFileId = selected?.id || '';
  return selected;
}

function filteredDriveFiles(companyId = activeCompanyId(), folder = 'home', jobId = '') {
  const query = (state.fileQuery || state.query || '').trim().toLowerCase();
  const category = state.fileCategoryFilter;
  let files = companyFiles(companyId);
  if (jobId) {
    files = files.filter((file) => file.job_id === jobId);
  } else if (state.driveFilter === 'images') {
    files = files.filter((file) => file.mime_type.includes('image') || file.folder === 'photos');
  } else if (state.driveFilter === 'documents') {
    files = files.filter((file) => !file.mime_type.includes('image') && file.folder !== 'photos');
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
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('image')) return 'Image';
  if (type.includes('zip')) return 'Zip';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'Sheet';
  if (type.includes('word') || type.includes('document')) return 'Doc';
  return folderLabel(file.folder);
}

function fileTypeClass(file) {
  const label = fileTypeLabel(file).toLowerCase();
  if (label === 'pdf') return 'pdf';
  if (label === 'image') return 'image';
  if (label === 'sheet') return 'sheet';
  return 'doc';
}

function fileThumb(file, large = false) {
  const icon = fileIcon(file);
  if (file.signed_url) return `<img src="${h(file.signed_url)}" alt="" />`;
  return `<span class="file-doc-icon ${h(fileTypeClass(file))} ${large ? 'large' : ''}"><i class="ti ${h(icon)}"></i></span>`;
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

function createForm(companyId) {
  const form = blankForm(companyId);
  state.forms.unshift(form);
  state.selectedFormId = form.id;
  state.selectedQuestionId = form.questions[0]?.id || '';
  state.formsTab = 'builder';
  saveFormsState('New form created');
  render();
}

function selectForm(id) {
  const form = formById(id);
  if (!form) return;
  state.selectedFormId = form.id;
  state.selectedQuestionId = form.questions[0]?.id || '';
  render();
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

function useFormTemplate(companyId, templateId) {
  const template = formTemplates().find((item) => item.id === templateId);
  if (!template) return;
  const form = normalizeForm({
    ...template,
    id: `form-${crypto.randomUUID()}`,
    company_id: companyId,
    status: 'Draft',
    audience: 'Internal',
    linked_job_id: state.route?.jobId || '',
    theme_color: companyColor(companyId),
    background: 'clean',
    submit_label: 'Submit',
    questions: template.questions.map((question) => ({ ...clone(question), id: `q-${crypto.randomUUID()}` })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  state.forms.unshift(form);
  state.selectedFormId = form.id;
  state.selectedQuestionId = form.questions[0]?.id || '';
  state.formsTab = 'builder';
  saveFormsState('Template added');
  render();
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
  saveFormsState('Preview response saved');
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
  return DRIVE_FOLDERS.find(([folderId]) => folderId === id)?.[1] || titleCase(id || 'Shared');
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
  if (file.mime_type.includes('image')) return 'ti-photo';
  if (file.mime_type.includes('pdf')) return 'ti-file-type-pdf';
  if (file.mime_type.includes('zip')) return 'ti-file-zip';
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

function formatBytes(value) {
  const bytes = number(value);
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
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
