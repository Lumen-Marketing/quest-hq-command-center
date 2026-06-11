(() => {
  const storageKey = (moduleId) => 'quest-hq-static-' + moduleId;
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  document.querySelectorAll('[data-nav-state="planned"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
  document.querySelectorAll('.tabs').forEach((tabs) => {
    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;
      if (button.dataset.tabState === 'planned') return;
      const name = button.dataset.tab;
      tabs.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === button));
      tabs.parentElement.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === name));
    });
  });
  document.querySelectorAll('[data-record-system]').forEach((system) => {
    const moduleId = system.dataset.recordSystem;
    const list = system.querySelector('[data-record-list]');
    const form = system.querySelector('[data-record-editor]');
    const key = storageKey(moduleId);
    let records = JSON.parse(localStorage.getItem(key) || 'null') || seed;
    let selected = 0;
    const save = () => localStorage.setItem(key, JSON.stringify(records));
    const render = () => {
      if (!records.length) records = [{ title: 'New record', status: 'Draft', owner: '', job: '', notes: '' }];
      selected = Math.min(selected, records.length - 1);
      list.innerHTML = records.map((record, index) => '<button type="button" class="' + (index === selected ? 'active' : '') + '" data-index="' + index + '"><span><strong>' + escapeHtml(record.title || 'Untitled') + '</strong><span>' + escapeHtml(record.status || 'Draft') + ' - ' + escapeHtml(record.job || 'No job linked') + '</span></span><b>Open</b></button>').join('');
      const record = records[selected];
      ['title','status','owner','job','notes'].forEach((name) => { form.elements[name].value = record[name] || ''; });
      save();
    };
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-index]');
      if (!button) return;
      selected = Number(button.dataset.index);
      render();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      records[selected] = Object.fromEntries(new FormData(form).entries());
      render();
    });
    system.querySelectorAll('[data-add-record]').forEach((button) => button.addEventListener('click', () => {
      records.unshift({ title: 'New ' + moduleId + ' record', status: 'Draft', owner: '', job: '', notes: '' });
      selected = 0;
      render();
    }));
    system.querySelector('[data-duplicate-record]')?.addEventListener('click', () => {
      records.splice(selected + 1, 0, { ...records[selected], title: records[selected].title + ' copy' });
      selected += 1;
      render();
    });
    system.querySelector('[data-delete-record]')?.addEventListener('click', () => {
      records.splice(selected, 1);
      selected = 0;
      render();
    });
    render();
  });
  document.querySelectorAll('[data-add-record]').forEach((button) => {
    if (button.closest('[data-record-system]')) return;
    button.addEventListener('click', () => {
      const system = document.querySelector('[data-record-system]');
      const editorTab = document.querySelector('[data-tab$="editor"], [data-tab="job-editor"], [data-tab="file-details"], [data-tab="ticket-editor"], [data-tab="record-editor"], [data-tab="access-editor"], [data-tab="view-editor"], [data-tab="rule-editor"], [data-tab="article-editor"], [data-tab="finance-editor"], [data-tab="template-editor"], [data-tab="form-editor"]');
      editorTab?.click();
      system?.querySelector('[data-add-record]')?.click();
    });
  });
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const center = document.querySelector('[data-job-center]');
  if (!center) return;

  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  const localKey = 'quest-hq-job-center';
  const lanes = ['Lead', 'Site Review', 'Estimate', 'Approved', 'Active'];
  const fields = ['id','name','company_id','client_name','contact_name','site_address','job_type','stage','priority','owner_name','scope','start_date','due_date','estimate_total','invoice_total','task_count','file_count','notes'];
  const defaultCompanies = [
    { id: 'quest-roofing', name: 'Quest Roofing', short_name: 'Roofing', color: '#f45d22' },
    { id: 'quest-drafting', name: 'Quest Drafting', short_name: 'Drafting', color: '#2563eb' },
    { id: 'lumen', name: 'Lumen', short_name: 'Lumen', color: '#7c3aed' }
  ];
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-job-sync]'),
    board: center.querySelector('[data-job-board]'),
    table: center.querySelector('[data-job-table]'),
    count: center.querySelector('[data-job-count]'),
    profile: center.querySelector('[data-job-profile]'),
    sidecar: center.querySelector('[data-job-sidecar]'),
    form: center.querySelector('[data-job-form]'),
    editorPanel: center.querySelector('[data-panel="editor"]'),
    modal: center.querySelector('[data-job-modal]'),
    modalBody: center.querySelector('[data-job-modal-body]'),
    modalTitle: center.querySelector('[data-job-modal-title]'),
    editorTitle: center.querySelector('[data-job-editor-title]'),
    companySelect: center.querySelector('[data-job-company-select]'),
    search: center.querySelector('[data-job-search]'),
    stage: center.querySelector('[data-job-stage-filter]')
  };

  let companies = defaultCompanies.slice();
  let supabaseClient = null;
  let jobs = seed.map(normalizeJob);
  let selectedId = new URLSearchParams(window.location.search).get('job_id') || jobs[0]?.id || null;
  let source = 'local';
  let formHome = null;
  let lastFocus = null;
  let draftJob = null;

  init();

  async function init() {
    renderCompanyOptions();
    bindEvents();
    render();
    await connect();
    applyInitialRoute();
  }

  async function connect() {
    const url = center.dataset.supabaseUrl;
    const key = center.dataset.supabaseKey;
    if (!window.supabase || !url || !key) {
      setSync('Local fallback', 'local');
      return;
    }
    supabaseClient = window.supabase.createClient(url, key);
    await refreshCompanies();
    await refreshFromSupabase();
  }

  async function refreshCompanies() {
    if (!supabaseClient) {
      renderCompanyOptions();
      return;
    }
    const { data, error } = await supabaseClient
      .from('companies')
      .select('id,name,short_name,color')
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      companies = defaultCompanies.slice();
    } else {
      companies = Array.isArray(data) && data.length ? data : defaultCompanies.slice();
    }
    renderCompanyOptions();
  }

  async function refreshFromSupabase() {
    if (!supabaseClient) return;
    setSync('Syncing...', '');
    const { data, error } = await supabaseClient
      .from('jobs')
      .select('*, clients(name)')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      render();
      return;
    }
    source = 'supabase';
    jobs = (data || []).map(normalizeJob);
    selectedId = selectedId && jobs.some((job) => job.id === selectedId) ? selectedId : jobs[0]?.id || null;
    clearLocal();
    setSync('Supabase live', 'live');
    render();
  }

  function bindEvents() {
    center.querySelector('[data-job-new]')?.addEventListener('click', () => {
      draftJob = blankJob();
      fillForm(draftJob);
      openJobModal('Create Job Workspace');
    });
    center.querySelector('[data-job-refresh]')?.addEventListener('click', async () => {
      await refreshCompanies();
      await refreshFromSupabase();
    });
    nodes.search?.addEventListener('input', render);
    nodes.stage?.addEventListener('change', render);
    nodes.board?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    nodes.form?.addEventListener('submit', saveJob);
    center.querySelector('[data-job-duplicate]')?.addEventListener('click', duplicateJob);
    center.querySelector('[data-job-delete]')?.addEventListener('click', deleteJob);
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-job-modal-close]')) closeJobModal();
    });
    nodes.modal?.addEventListener('click', (event) => {
      if (event.target === nodes.modal) closeJobModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nodes.modal && !nodes.modal.hidden) closeJobModal();
    });
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      center.querySelector('[data-job-new]')?.click();
      window.history.replaceState({}, '', 'jobs.html');
      return;
    }
    if (params.get('tab')) clickTab(params.get('tab'));
  }

  function selectFromClick(event) {
    const item = event.target.closest('[data-job-id]');
    if (!item) return;
    selectedId = item.dataset.jobId;
    render();
    if (item.dataset.openProfile === 'true') clickTab('profile');
  }

  async function saveJob(event) {
    event.preventDefault();
    const payload = collectForm();
    const existingIndex = jobs.findIndex((job) => job.id === payload.id);
    if (supabaseClient) {
      setSync('Saving...', '');
      const savePayload = toDatabasePayload(payload);
      const isLocal = !payload.id || String(payload.id).startsWith('local-');
      const request = isLocal
        ? supabaseClient.from('jobs').insert(savePayload).select().single()
        : supabaseClient.from('jobs').update(savePayload).eq('id', payload.id).select().single();
      const { data, error } = await request;
      if (error) {
        console.error(error);
        setSync('Local fallback', 'error');
      } else {
        const saved = normalizeJob(data);
        if (existingIndex >= 0) jobs[existingIndex] = saved;
        else jobs.unshift(saved);
        selectedId = saved.id;
        source = 'supabase';
        setSync('Supabase live', 'live');
        clearLocal();
        render();
        closeJobModal();
        return;
      }
    }
    if (existingIndex >= 0) jobs[existingIndex] = payload;
    else jobs.unshift(payload);
    selectedId = payload.id;
    saveLocal();
    render();
    closeJobModal();
  }

  async function deleteJob() {
    if (draftJob) {
      closeJobModal();
      return;
    }
    const job = selectedJob();
    if (!job) return;
    if (supabaseClient && job.id && !String(job.id).startsWith('local-')) {
      setSync('Deleting...', '');
      const { error } = await supabaseClient.from('jobs').delete().eq('id', job.id);
      if (error) {
        console.error(error);
        setSync('Delete failed', 'error');
        return;
      }
      setSync('Supabase live', 'live');
    }
    jobs = jobs.filter((item) => item.id !== job.id);
    selectedId = jobs[0]?.id || null;
    saveLocal();
    render();
    closeJobModal();
  }

  function duplicateJob() {
    const job = draftJob || selectedJob();
    if (!job) return;
    const copy = { ...job, id: 'local-' + Date.now(), name: job.name + ' Copy', stage: 'Lead' };
    draftJob = copy;
    fillForm(copy);
    openJobModal('Duplicate Job');
  }

  function render() {
    const visible = filteredJobs();
    if (selectedId && !jobs.some((job) => job.id === selectedId)) selectedId = jobs[0]?.id || null;
    renderMetrics();
    renderBoard(visible);
    renderTable(visible);
    renderProfile();
    fillForm();
  }

  function renderMetrics() {
    setOptionalMetric('active', jobs.filter((job) => job.stage !== 'Complete').length);
    setOptionalMetric('urgent', jobs.filter((job) => job.priority === 'Urgent').length);
    setOptionalMetric('tasks', sum('task_count'));
    setOptionalMetric('revenue', money.format(sum('estimate_total')));
  }

  function renderBoard(visible) {
    const boardLanes = lanes.map((lane) => {
      const items = visible.filter((job) => job.stage === lane);
      return '<section class="job-lane"><h2>' + escapeHtml(lane) + '<span>' + items.length + '</span></h2>' +
        (items.length ? items.map(jobCard).join('') : '<div class="empty-state">No jobs</div>') +
        '</section>';
    });
    nodes.board.innerHTML = boardLanes.join('');
  }

  function renderTable(visible) {
    nodes.count.textContent = visible.length + (visible.length === 1 ? ' job' : ' jobs');
    nodes.table.innerHTML = visible.length ? visible.map((job) => {
      return '<button type="button" class="job-row ' + activeClass(job) + '" data-job-id="' + escapeHtml(job.id) + '" data-open-profile="true">' +
        '<strong>' + escapeHtml(job.name) + '<span>' + escapeHtml(job.client_name || 'No client') + '</span></strong>' +
        '<span>' + escapeHtml(job.job_type || 'Job') + '</span>' +
        '<span>' + escapeHtml(job.stage || 'Lead') + '</span>' +
        '<span>' + escapeHtml(job.priority || 'Medium') + '</span>' +
        '<span>' + money.format(number(job.estimate_total)) + '</span>' +
        '<span>' + number(job.file_count) + ' files</span>' +
      '</button>';
    }).join('') : '<div class="empty-state">No jobs match this view.</div>';
  }

  function renderProfile() {
    const job = selectedJob();
    if (!job) {
      nodes.profile.innerHTML = '<div class="empty-state">Select or create a job.</div>';
      nodes.sidecar.innerHTML = '';
      return;
    }
    nodes.profile.innerHTML = '<div class="job-profile-hero"><h2>' + escapeHtml(job.name) + '</h2><p>' + escapeHtml(job.scope || job.notes || 'No scope added yet.') + '</p></div>' +
      '<div class="job-detail-grid">' +
      detail('Client', job.client_name || 'Unassigned') +
      detail('Contact', job.contact_name || 'Not set') +
      detail('Account Owner', job.owner_name || 'Unassigned') +
      detail('Site', job.site_address || 'No address') +
      detail('Business Status', job.stage || 'Lead') +
      detail('Client Urgency', job.priority || 'Medium') +
      detail('Estimate', money.format(number(job.estimate_total))) +
      detail('TaskManagement Project', job.id) +
      detail('File Space', number(job.file_count) + ' files') +
      '</div>' +
      linkedPanels(job) +
      activityTimeline(job);
    nodes.sidecar.innerHTML = detail('Workspace', 'Business context and records') +
      detail('Files', number(job.file_count) + ' files attached') +
      detail('Company', companyLabel(job.company_id)) +
      '<a class="secondary-button" href="' + escapeHtml(bridgeUrl(job)) + '">Open TaskManagement</a>' +
      '<a class="secondary-button" href="' + escapeHtml(fileUrl(job)) + '">Open Files</a>' +
      '<button class="primary-button" type="button" data-edit-selected>Edit Job</button>';
    nodes.sidecar.querySelector('[data-edit-selected]')?.addEventListener('click', () => openJobModal('Edit Job'));
  }

  function linkedPanels(job) {
    const items = [
      ['TaskManagement', 'Open work system', 'Tasks live there, linked by project_id', bridgeUrl(job)],
      ['Files & Photos', number(job.file_count) + ' files', 'Photos, permits, estimates, invoices', fileUrl(job)],
      ['Forms & Inspections', inspectionCount(job) + ' records', 'Inspection, approval, walkthrough', 'forms.html'],
      ['Finance', money.format(number(job.estimate_total)) + ' estimate', 'Estimate, invoice, payment records', 'finance.html']
    ];
    return '<div class="linked-panel-grid">' + items.map((item) => '<a href="' + escapeHtml(item[3]) + '"><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span><small>' + escapeHtml(item[2]) + '</small></a>').join('') + '</div>';
  }

  function activityTimeline(job) {
    return '<section class="job-activity-panel"><div class="job-section-heading"><h2>Activity Timeline</h2><span>Not connected</span></div><article class="empty-state">No live activity events are connected yet.</article></section>';
  }

  function fillForm(job = null) {
    job = job || draftJob || selectedJob() || blankJob();
    renderCompanyOptions(job.company_id);
    fields.forEach((field) => {
      if (!nodes.form.elements[field]) return;
      nodes.form.elements[field].value = job[field] ?? '';
    });
  }

  function openJobModal(title) {
    if (!nodes.modal || !nodes.modalBody || !nodes.form) {
      clickTab('editor');
      return;
    }
    if (!formHome) {
      formHome = document.createElement('div');
      formHome.hidden = true;
      nodes.form.parentNode.insertBefore(formHome, nodes.form);
    }
    lastFocus = document.activeElement;
    nodes.modalTitle.textContent = title || 'Job Workspace';
    if (nodes.editorTitle) nodes.editorTitle.textContent = title || 'Job Workspace';
    nodes.modalBody.appendChild(nodes.form);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    fillForm();
    requestAnimationFrame(() => nodes.form.elements.name?.focus());
  }

  function closeJobModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (formHome && nodes.form) {
      formHome.parentNode.insertBefore(nodes.form, formHome);
    }
    nodes.modal.hidden = true;
    document.body.classList.remove('modal-open');
    draftJob = null;
    if (nodes.editorTitle) nodes.editorTitle.textContent = 'Job Workspace';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function collectForm() {
    const data = Object.fromEntries(new FormData(nodes.form).entries());
    data.id = data.id || draftJob?.id || 'local-' + Date.now();
    ['estimate_total','invoice_total','task_count','file_count'].forEach((field) => data[field] = number(data[field]));
    return normalizeJob(data);
  }

  function toDatabasePayload(job) {
    return {
      company_id: job.company_id || 'quest-roofing',
      client_name: job.client_name || null,
      name: job.name || 'Untitled Job',
      contact_name: job.contact_name || null,
      site_address: job.site_address || null,
      job_type: job.job_type || 'Roofing',
      stage: job.stage || 'Lead',
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || null,
      scope: job.scope || null,
      start_date: job.start_date || null,
      due_date: job.due_date || null,
      estimate_total: number(job.estimate_total),
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count),
      file_count: number(job.file_count),
      notes: job.notes || null
    };
  }

  function filteredJobs() {
    const query = (nodes.search?.value || '').trim().toLowerCase();
    const stage = nodes.stage?.value || 'all';
    return jobs.filter((job) => {
      const stageMatch = stage === 'all' || job.stage === stage;
      const haystack = [job.name, job.client_name, job.owner_name, job.site_address, job.job_type, job.priority, job.stage].join(' ').toLowerCase();
      return stageMatch && (!query || haystack.includes(query));
    });
  }

  function selectedJob() {
    return jobs.find((job) => job.id === selectedId) || jobs[0] || null;
  }

  function jobCard(job) {
    return '<button type="button" class="job-card ' + priorityClass(job.priority) + ' ' + activeClass(job) + '" data-job-id="' + escapeHtml(job.id) + '">' +
      '<strong>' + escapeHtml(job.name) + '</strong>' +
      '<span>' + escapeHtml(job.client_name || 'No client') + '</span>' +
      '<small>' + escapeHtml(job.priority || 'Medium') + ' / ' + money.format(number(job.estimate_total)) + '</small>' +
      '</button>';
  }

  function detail(label, value) {
    return '<div><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value) + '</span></div>';
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      company_id: job.company_id || companies[0]?.id || 'quest-roofing',
      client_name: job.client_name || job.clients?.name || '',
      name: job.name || job.title || 'Untitled Job',
      contact_name: job.contact_name || '',
      site_address: job.site_address || '',
      job_type: job.job_type || 'Roofing',
      stage: normalizeBusinessStatus(job.stage || job.status || 'Lead'),
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || job.owner || '',
      scope: job.scope || '',
      start_date: job.start_date || '',
      due_date: job.due_date || job.end_date || '',
      estimate_total: number(job.estimate_total),
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count),
      file_count: number(job.file_count),
      notes: job.notes || ''
    };
  }

  function blankJob() {
    return normalizeJob({
      id: 'local-' + Date.now(),
      name: 'New Job',
      company_id: companies[0]?.id || 'quest-roofing',
      client_name: '',
      job_type: 'Roofing',
      stage: 'Lead',
      priority: 'Medium',
      owner_name: '',
      estimate_total: 0,
      invoice_total: 0,
      task_count: 0,
      file_count: 0
    });
  }

  function saveLocal() {
    localStorage.setItem(localKey, JSON.stringify(jobs));
  }

  function clearLocal() {
    localStorage.removeItem(localKey);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function setOptionalMetric(name, value) {
    const node = center.querySelector('[data-job-metric="' + name + '"]');
    if (node) node.textContent = String(value);
  }

  function clickTab(name) {
    center.querySelector('[data-tab="' + name + '"]')?.click();
  }

  function sum(field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function companyLabel(id) {
    const company = companies.find((item) => item.id === id);
    return company?.name || id || companies[0]?.name || 'Quest Roofing';
  }

  function normalizeBusinessStatus(value) {
    const status = String(value || 'Lead');
    const map = {
      Inspection: 'Site Review',
      'Estimate Approved': 'Approved',
      Production: 'Active',
      'QA Review': 'Active',
      Complete: 'Closed'
    };
    return map[status] || status;
  }

  function renderCompanyOptions(selectedValue = nodes.companySelect?.value) {
    if (!nodes.companySelect) return;
    const list = companies.length ? companies : defaultCompanies;
    const exists = list.some((company) => company.id === selectedValue);
    const options = list.map((company) => '<option value="' + escapeHtml(company.id) + '">' + escapeHtml(company.name) + '</option>');
    if (selectedValue && !exists) options.push('<option value="' + escapeHtml(selectedValue) + '">' + escapeHtml(selectedValue) + '</option>');
    nodes.companySelect.innerHTML = options.join('');
    nodes.companySelect.value = selectedValue && (exists || selectedValue) ? selectedValue : list[0]?.id || '';
  }

  function bridgeUrl(job) {
    const params = new URLSearchParams({
      project_id: job.id,
      return_url: new URL('jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile', window.location.href).toString()
    });
    return 'https://task-management-quest.vercel.app?' + params.toString();
  }

  function fileUrl(job) {
    return 'files.html?job_id=' + encodeURIComponent(job.id);
  }

  function completedTasks(job) {
    return Math.min(Math.floor(number(job.task_count) * 0.58), number(job.task_count));
  }

  function inspectionCount(job) {
    return Math.max(1, Math.ceil(number(job.file_count) / 3));
  }

  function activeClass(job) {
    return job.id === selectedId ? 'active' : '';
  }

  function priorityClass(priority) {
    return 'priority-' + String(priority || 'medium').toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const center = document.querySelector('[data-file-center]');
  if (!center) return;

  const bucket = center.dataset.storageBucket || 'quest-job-files';
  const storageLimit = number(center.dataset.storageLimit || 1073741824);
  const requestedJobId = new URLSearchParams(window.location.search).get('job_id');
  const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-file-sync]'),
    job: center.querySelector('[data-file-job]'),
    category: center.querySelector('[data-file-category-filter]'),
    search: center.querySelector('[data-file-search]'),
    refresh: center.querySelector('[data-file-refresh]'),
    grid: center.querySelector('[data-file-grid]'),
    table: center.querySelector('[data-file-table]'),
    detail: center.querySelector('[data-file-detail]'),
    folders: center.querySelector('[data-drive-folders]'),
    folderSection: center.querySelector('[data-folder-section]'),
    crumb: center.querySelector('[data-file-crumb]'),
    context: center.querySelector('[data-file-context]'),
    capacityLabel: center.querySelector('[data-file-capacity-label]'),
    capacityBar: center.querySelector('[data-file-capacity-bar]'),
    uploadForm: center.querySelector('[data-file-upload-form]'),
    fileInput: center.querySelector('[data-file-input]'),
    uploadLog: center.querySelector('[data-file-upload-log]'),
    modal: center.querySelector('[data-file-modal]'),
    modalBody: center.querySelector('[data-file-modal-body]')
  };

  let client = null;
  let jobs = [];
  let allFiles = [];
  let files = [];
  let usageBytes = 0;
  let selectedJobId = requestedJobId || '';
  let selectedFileId = '';
  let driveFilter = 'job-files';
  let viewMode = 'grid';
  let uploadFormHome = null;
  let lastFocus = null;

  init();

  async function init() {
    bindEvents();
    if (!window.supabase || !center.dataset.supabaseUrl || !center.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      renderEmpty('Supabase client is not available on this page.');
      return;
    }
    client = window.supabase.createClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    await refreshAll();
  }

  function bindEvents() {
    nodes.refresh?.addEventListener('click', refreshAll);
    nodes.job?.addEventListener('change', async () => {
      selectedJobId = nodes.job.value;
      selectedFileId = '';
      driveFilter = 'job-files';
      setActiveDriveNav();
      await refreshFiles();
    });
    nodes.category?.addEventListener('change', render);
    nodes.search?.addEventListener('input', render);
    nodes.grid?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    nodes.folders?.addEventListener('click', async (event) => {
      const folder = event.target.closest('[data-drive-job-id]');
      if (!folder) return;
      driveFilter = 'job-files';
      selectedJobId = folder.dataset.driveJobId;
      selectedFileId = '';
      if (nodes.job) nodes.job.value = selectedJobId;
      setActiveDriveNav();
      await refreshFiles();
    });
    center.querySelector('[data-drive-root]')?.addEventListener('click', () => {
      driveFilter = 'job-files';
      setActiveDriveNav();
      render();
    });
    center.querySelectorAll('[data-drive-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        driveFilter = button.dataset.driveFilter || 'job-files';
        selectedFileId = '';
        setActiveDriveNav();
        render();
      });
    });
    center.querySelectorAll('[data-file-view]').forEach((button) => {
      button.addEventListener('click', () => {
        viewMode = button.dataset.fileView || 'grid';
        center.querySelectorAll('[data-file-view]').forEach((item) => item.classList.toggle('active', item === button));
        render();
      });
    });
    center.querySelector('[data-file-open-upload]')?.addEventListener('click', openUploadModal);
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-file-modal-close]')) closeUploadModal();
    });
    nodes.modal?.addEventListener('click', (event) => {
      if (event.target === nodes.modal) closeUploadModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nodes.modal && !nodes.modal.hidden) closeUploadModal();
    });
    center.querySelector('[data-file-clear-input]')?.addEventListener('click', () => {
      nodes.fileInput.value = '';
      nodes.uploadLog.innerHTML = '';
    });
    nodes.uploadForm?.addEventListener('submit', uploadSelected);
  }

  async function refreshAll() {
    setSync('Syncing...', '');
    await loadJobs();
    await refreshFiles();
  }

  async function loadJobs() {
    const { data, error } = await client
      .from('jobs')
      .select('id,name,client_name,company_id,stage,priority,file_count')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Jobs unavailable', 'error');
      jobs = [];
      renderJobOptions();
      return;
    }
    jobs = data || [];
    if (!jobs.some((job) => job.id === selectedJobId)) selectedJobId = jobs[0]?.id || '';
    renderJobOptions();
  }

  async function refreshFiles() {
    if (!client) return;
    await refreshUsage();
    const { data, error } = await client
      .from('job_files')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Files unavailable', 'error');
      allFiles = [];
      files = [];
      render();
      return;
    }
    allFiles = await withPreviewUrls(data || []);
    files = selectedJobId ? allFiles.filter((file) => file.job_id === selectedJobId) : [];
    const visible = filteredFiles();
    selectedFileId = selectedFileId && visible.some((file) => file.id === selectedFileId) ? selectedFileId : visible[0]?.id || '';
    setSync(jobs.length ? 'Supabase Storage live' : 'No jobs yet', jobs.length ? 'live' : 'local');
    render();
  }

  async function refreshUsage() {
    const { data, error } = await client
      .from('job_files')
      .select('size_bytes')
      .is('deleted_at', null);
    if (error) {
      console.error(error);
      usageBytes = 0;
      return;
    }
    usageBytes = (data || []).reduce((total, file) => total + number(file.size_bytes), 0);
  }

  async function withPreviewUrls(items) {
    return Promise.all(items.map(async (file) => {
      if (!isImage(file.mime_type)) return file;
      const { data, error } = await client.storage.from(bucket).createSignedUrl(file.object_path, 3600);
      if (error) {
        console.error(error);
        return file;
      }
      return { ...file, preview_url: data.signedUrl };
    }));
  }

  async function uploadSelected(event) {
    event.preventDefault();
    const selectedJob = currentJob();
    const selectedFiles = Array.from(nodes.fileInput.files || []);
    if (!selectedJob) return logUpload('Create or select a job before uploading.', 'error');
    if (!selectedFiles.length) return logUpload('Choose at least one file.', 'error');

    const form = new FormData(nodes.uploadForm);
    const category = String(form.get('category') || 'Other');
    const uploadedBy = String(form.get('uploaded_by_label') || 'Quest HQ Demo');
    const notes = String(form.get('notes') || '');
    let workingUsage = usageBytes;
    let uploadedCount = 0;
    nodes.uploadLog.innerHTML = '';
    setSync('Uploading...', '');

    for (const file of selectedFiles) {
      if (workingUsage + file.size > storageLimit) {
        logUpload(file.name + ' would exceed the 1GB demo limit.', 'error');
        continue;
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : 'file-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      const objectPath = 'companies/' + safeSegment(selectedJob.company_id || 'company') + '/jobs/' + safeSegment(selectedJob.id) + '/' + id + '-' + safeFileName(file.name);
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(objectPath, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream' });
      if (uploadError) {
        console.error(uploadError);
        logUpload(file.name + ': upload failed - ' + uploadError.message, 'error');
        continue;
      }

      const payload = {
        id,
        company_id: selectedJob.company_id || 'quest-roofing',
        job_id: selectedJob.id,
        bucket_id: bucket,
        object_path: objectPath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        category,
        uploaded_by_label: uploadedBy,
        notes
      };
      const { error: insertError } = await client.from('job_files').insert(payload);
      if (insertError) {
        console.error(insertError);
        await client.storage.from(bucket).remove([objectPath]);
        logUpload(file.name + ': metadata save failed - ' + insertError.message, 'error');
        continue;
      }
      workingUsage += file.size;
      uploadedCount += 1;
      logUpload(file.name + ' uploaded.', 'ok');
    }

    nodes.fileInput.value = '';
    await refreshFiles();
    center.querySelector('[data-tab="job-files"]')?.click();
    if (uploadedCount > 0) closeUploadModal();
  }

  function openUploadModal() {
    if (!nodes.modal || !nodes.modalBody || !nodes.uploadForm) {
      return;
    }
    if (!uploadFormHome) {
      uploadFormHome = document.createElement('div');
      uploadFormHome.hidden = true;
      nodes.uploadForm.parentNode.insertBefore(uploadFormHome, nodes.uploadForm);
    }
    lastFocus = document.activeElement;
    nodes.uploadLog.innerHTML = '';
    nodes.modalBody.appendChild(nodes.uploadForm);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => nodes.fileInput?.focus());
  }

  function closeUploadModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (uploadFormHome && nodes.uploadForm) {
      uploadFormHome.parentNode.insertBefore(nodes.uploadForm, uploadFormHome);
    }
    nodes.modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  async function deleteFile(id) {
    const file = allFiles.find((item) => item.id === id);
    if (!file) return;
    if (!confirm('Delete ' + file.file_name + '?')) return;
    setSync('Deleting...', '');
    const { error: storageError } = await client.storage.from(bucket).remove([file.object_path]);
    if (storageError) console.error(storageError);
    const { error } = await client.from('job_files').update({ deleted_at: new Date().toISOString() }).eq('id', file.id);
    if (error) {
      console.error(error);
      setSync('Delete failed', 'error');
      return;
    }
    selectedFileId = '';
    await refreshFiles();
  }

  async function downloadFile(id) {
    const file = allFiles.find((item) => item.id === id);
    if (!file) return;
    const { data, error } = await client.storage.from(bucket).createSignedUrl(file.object_path, 3600, { download: file.file_name });
    if (error) {
      console.error(error);
      setSync('Download failed', 'error');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  function renderJobOptions() {
    if (!nodes.job) return;
    nodes.job.innerHTML = jobs.length
      ? jobs.map((job) => '<option value="' + escapeHtml(job.id) + '">' + escapeHtml(job.name) + ' - ' + escapeHtml(job.client_name || 'No client') + '</option>').join('')
      : '<option value="">No jobs available</option>';
    nodes.job.value = selectedJobId;
  }

  function render() {
    const visible = filteredFiles();
    const job = currentJob();
    const selected = visible.find((file) => file.id === selectedFileId) || visible[0] || null;
    if (selected) selectedFileId = selected.id;
    center.querySelector('[data-file-metric="count"]').textContent = String(allFiles.length);
    center.querySelector('[data-file-metric="used"]').textContent = formatBytes(usageBytes);
    center.querySelector('[data-file-metric="job"]').textContent = job ? shortText(job.name, 22) : viewLabel();
    nodes.crumb.textContent = driveFilter === 'job-files' ? (job?.name || 'Job files') : viewLabel();
    nodes.context.textContent = driveContext(job, visible.length);
    nodes.capacityLabel.textContent = formatBytes(usageBytes) + ' of ' + formatBytes(storageLimit);
    nodes.capacityBar.style.width = Math.min(100, Math.round((usageBytes / storageLimit) * 100)) + '%';
    nodes.folderSection.hidden = driveFilter !== 'job-files';
    renderFolders();

    nodes.grid.hidden = viewMode !== 'grid';
    nodes.table.hidden = viewMode !== 'list';
    nodes.grid.innerHTML = visible.length ? visible.map(fileCard).join('') : '<div class="empty-state">No files match this Drive view.</div>';
    nodes.table.innerHTML = visible.length ? visible.map(fileRow).join('') : '<div class="empty-state">No files match this Drive view.</div>';
    renderDetails(selected);
  }

  function renderFolders() {
    if (!nodes.folders) return;
    nodes.folders.innerHTML = jobs.length ? jobs.map((job) => {
      const count = allFiles.filter((file) => file.job_id === job.id).length;
      return '<button class="drive-folder-card-live ' + (job.id === selectedJobId ? 'active' : '') + '" type="button" data-drive-job-id="' + escapeHtml(job.id) + '">' +
        '<span class="drive-folder-mark">FL</span>' +
        '<span><strong>' + escapeHtml(job.name) + '</strong><span>' + escapeHtml(job.client_name || 'No client') + ' / ' + count + (count === 1 ? ' file' : ' files') + '</span></span>' +
      '</button>';
    }).join('') : '<div class="empty-state">Create a job workspace to get its file folder.</div>';
  }

  function renderDetails(file) {
    if (!file) {
      const empty = '<div class="empty-state">Select a file to inspect details.</div>';
      nodes.detail.innerHTML = empty;
      return;
    }
    const html = fileDetailHtml(file);
    nodes.detail.innerHTML = html;
    center.querySelectorAll('[data-file-download]').forEach((button) => button.addEventListener('click', () => downloadFile(button.dataset.fileDownload)));
    center.querySelectorAll('[data-file-delete]').forEach((button) => button.addEventListener('click', () => deleteFile(button.dataset.fileDelete)));
  }

  function fileCard(file) {
    return '<button type="button" class="file-card-live ' + activeClass(file) + '" data-file-id="' + escapeHtml(file.id) + '">' +
      '<span class="file-thumb">' + thumb(file) + '</span>' +
      '<strong>' + escapeHtml(file.file_name) + '</strong>' +
      '<span>' + escapeHtml(file.category || fileTypeLabel(file)) + ' / ' + formatBytes(file.size_bytes) + '</span>' +
    '</button>';
  }

  function fileRow(file) {
    return '<button type="button" class="file-row-live ' + activeClass(file) + '" data-file-id="' + escapeHtml(file.id) + '">' +
      '<span class="file-type ' + fileTypeClass(file) + '">' + escapeHtml(fileTypeLabel(file).slice(0, 3).toUpperCase()) + '</span>' +
      '<strong>' + escapeHtml(file.file_name) + '<span>' + escapeHtml(file.notes || file.object_path) + '</span></strong>' +
      '<span>' + escapeHtml(file.category || 'Other') + '</span>' +
      '<span>' + formatBytes(file.size_bytes) + '</span>' +
      '<span>' + formatDate(file.created_at) + '</span>' +
      '<span>' + escapeHtml(fileTypeLabel(file)) + '</span>' +
    '</button>';
  }

  function fileDetailHtml(file) {
    return '<div class="file-detail-preview">' + thumb(file, true) + '</div>' +
      '<h2>' + escapeHtml(file.file_name) + '</h2>' +
      '<p class="muted">' + escapeHtml(file.notes || 'No notes saved for this file.') + '</p>' +
      '<div class="file-detail-list">' +
        detail('Category', file.category || 'Other') +
        detail('Size', formatBytes(file.size_bytes)) +
        detail('MIME type', file.mime_type || 'application/octet-stream') +
        detail('Uploaded by', file.uploaded_by_label || 'Unknown') +
        detail('Uploaded', formatDate(file.created_at)) +
        detail('Storage path', file.object_path) +
      '</div>' +
      '<div class="file-detail-actions">' +
        '<button class="primary-button" type="button" data-file-download="' + escapeHtml(file.id) + '">Download</button>' +
        '<button class="danger-button" type="button" data-file-delete="' + escapeHtml(file.id) + '">Delete</button>' +
      '</div>';
  }

  function selectFromClick(event) {
    const button = event.target.closest('[data-file-id]');
    if (!button) return;
    selectedFileId = button.dataset.fileId;
    render();
  }

  function filteredFiles() {
    const query = (nodes.search?.value || '').trim().toLowerCase();
    const category = nodes.category?.value || 'all';
    const source = driveFilter === 'job-files'
      ? files
      : driveFilter === 'recent'
        ? allFiles.slice(0, 40)
        : driveFilter === 'images'
          ? allFiles.filter((file) => isImage(file.mime_type))
          : driveFilter === 'documents'
            ? allFiles.filter((file) => !isImage(file.mime_type))
            : files;
    return source.filter((file) => {
      const categoryMatch = category === 'all' || file.category === category;
      const haystack = [file.file_name, file.mime_type, file.category, file.notes, file.uploaded_by_label].join(' ').toLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
  }

  function setActiveDriveNav() {
    center.querySelectorAll('[data-drive-filter]').forEach((button) => {
      button.classList.toggle('active', button.dataset.driveFilter === driveFilter);
    });
  }

  function viewLabel() {
    const labels = {
      'job-files': 'Job files',
      recent: 'Recent',
      images: 'Images',
      documents: 'Documents'
    };
    return labels[driveFilter] || 'Files';
  }

  function driveContext(job, count) {
    if (driveFilter === 'job-files') {
      return job ? (job.name + ' - ' + (job.client_name || 'No client') + ' - ' + count + (count === 1 ? ' file' : ' files')) : 'Create a job workspace before uploading files.';
    }
    return viewLabel() + ' - ' + count + (count === 1 ? ' file' : ' files');
  }

  function currentJob() {
    return jobs.find((job) => job.id === selectedJobId) || null;
  }

  function renderEmpty(message) {
    nodes.grid.innerHTML = '<div class="empty-state">' + escapeHtml(message) + '</div>';
    nodes.table.innerHTML = '';
  }

  function thumb(file, large = false) {
    if (isImage(file.mime_type) && file.preview_url) return '<img src="' + escapeHtml(file.preview_url) + '" alt="">';
    const label = fileTypeLabel(file);
    const cls = label === 'PDF' ? 'pdf' : label === 'Drawing' ? 'drawing' : '';
    return '<span class="file-doc-icon ' + cls + '">' + escapeHtml(large ? label : label.slice(0, 3).toUpperCase()) + '</span>';
  }

  function detail(label, value) {
    return '<div><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value || 'Not set') + '</span></div>';
  }

  function fileTypeLabel(file) {
    const mime = String(file.mime_type || '');
    const name = String(file.file_name || '').toLowerCase();
    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
    if (mime.startsWith('image/')) return 'Image';
    if (name.endsWith('.dwg') || name.endsWith('.dxf')) return 'Drawing';
    if (mime.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'Sheet';
    if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'Doc';
    return 'File';
  }

  function fileTypeClass(file) {
    const label = fileTypeLabel(file);
    return label === 'PDF' ? 'pdf' : label === 'Drawing' ? 'drawing' : '';
  }

  function isImage(mime) {
    return String(mime || '').startsWith('image/');
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function logUpload(message, state) {
    nodes.uploadLog.insertAdjacentHTML('beforeend', '<div class="' + escapeHtml(state || '') + '">' + escapeHtml(message) + '</div>');
  }

  function activeClass(file) {
    return file.id === selectedFileId ? 'active' : '';
  }

  function safeSegment(value) {
    return String(value || 'item').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  }

  function safeFileName(value) {
    return String(value || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
  }

  function shortText(value, max) {
    const text = String(value || '');
    return text.length > max ? text.slice(0, max - 1) + '...' : text;
  }

  function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }

  function formatBytes(value) {
    const bytes = number(value);
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 * 1024 ? 0 : 1) + ' GB';
    if (bytes >= 1024 * 1024) return money.format(bytes / 1024 / 1024) + ' MB';
    if (bytes >= 1024) return money.format(bytes / 1024) + ' KB';
    return money.format(bytes) + ' B';
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const admin = document.querySelector('[data-company-admin]');
  if (!admin) return;

  const builtInIds = new Set(['quest-roofing', 'quest-drafting', 'lumen']);
  const nodes = {
    sync: admin.querySelector('[data-company-sync]'),
    list: admin.querySelector('[data-company-list]'),
    form: admin.querySelector('[data-company-form]'),
    title: admin.querySelector('[data-company-form-title]'),
    refresh: admin.querySelector('[data-company-refresh]'),
    createNew: admin.querySelector('[data-company-new]'),
    deleteButton: admin.querySelector('[data-company-delete]')
  };

  let client = null;
  let companies = [];
  let selectedId = null;

  init();

  async function init() {
    bindEvents();
    if (!window.supabase || !admin.dataset.supabaseUrl || !admin.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      render();
      return;
    }
    client = window.supabase.createClient(admin.dataset.supabaseUrl, admin.dataset.supabaseKey);
    await loadCompanies();
  }

  function bindEvents() {
    nodes.refresh?.addEventListener('click', loadCompanies);
    nodes.createNew?.addEventListener('click', newCompany);
    nodes.deleteButton?.addEventListener('click', deleteCompany);
    nodes.form?.addEventListener('submit', saveCompany);
    nodes.form?.elements.name?.addEventListener('input', () => {
      const editing = nodes.form.elements.editing_id.value;
      const idInput = nodes.form.elements.id;
      if (!editing && !idInput.dataset.touched) idInput.value = slugify(nodes.form.elements.name.value);
    });
    nodes.form?.elements.id?.addEventListener('input', (event) => {
      event.currentTarget.dataset.touched = 'true';
      event.currentTarget.value = slugify(event.currentTarget.value);
    });
    nodes.list?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-company-id]');
      if (!button) return;
      selectedId = button.dataset.companyId;
      fillForm(selectedCompany());
      render();
    });
  }

  async function loadCompanies() {
    if (!client) return;
    setSync('Loading...', '');
    const { data, error } = await client.from('companies').select('id,name,short_name,color,created_at').order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      setSync('Load failed', 'error');
      render();
      return;
    }
    companies = data || [];
    selectedId = selectedId && companies.some((company) => company.id === selectedId) ? selectedId : companies[0]?.id || null;
    setSync('Supabase live', 'live');
    render();
    if (selectedId) fillForm(selectedCompany());
    else newCompany();
  }

  async function saveCompany(event) {
    event.preventDefault();
    if (!client) return;
    const form = nodes.form;
    const editingId = form.elements.editing_id.value;
    const payload = {
      id: slugify(form.elements.id.value),
      name: form.elements.name.value.trim(),
      short_name: form.elements.short_name.value.trim(),
      color: form.elements.color.value || '#f45d22'
    };
    if (!payload.id || !payload.name || !payload.short_name) {
      setSync('Missing fields', 'error');
      return;
    }
    setSync('Saving...', '');
    const request = editingId
      ? client.from('companies').update({ name: payload.name, short_name: payload.short_name, color: payload.color }).eq('id', editingId).select().single()
      : client.from('companies').insert(payload).select().single();
    const { data, error } = await request;
    if (error) {
      console.error(error);
      setSync('Save failed', 'error');
      return;
    }
    selectedId = data.id;
    await loadCompanies();
  }

  async function deleteCompany() {
    if (!client) return;
    const company = selectedCompany();
    if (!company) return;
    if (builtInIds.has(company.id)) {
      setSync('Built-in protected', 'local');
      return;
    }
    setSync('Deleting...', '');
    const { error } = await client.from('companies').delete().eq('id', company.id);
    if (error) {
      console.error(error);
      setSync('Delete blocked', 'error');
      return;
    }
    selectedId = null;
    await loadCompanies();
  }

  function newCompany() {
    selectedId = null;
    nodes.form.reset();
    nodes.form.elements.editing_id.value = '';
    nodes.form.elements.id.readOnly = false;
    delete nodes.form.elements.id.dataset.touched;
    nodes.form.elements.color.value = '#f45d22';
    nodes.title.textContent = 'New Company';
    nodes.deleteButton.disabled = true;
    render();
  }

  function fillForm(company) {
    if (!company) return newCompany();
    nodes.form.elements.editing_id.value = company.id;
    nodes.form.elements.id.value = company.id;
    nodes.form.elements.id.readOnly = true;
    nodes.form.elements.name.value = company.name || '';
    nodes.form.elements.short_name.value = company.short_name || '';
    nodes.form.elements.color.value = company.color || '#f45d22';
    nodes.title.textContent = 'Edit Company';
    nodes.deleteButton.disabled = builtInIds.has(company.id);
  }

  function render() {
    if (!companies.length) {
      nodes.list.innerHTML = '<div class="empty-state">No companies yet. Create the first company on the right.</div>';
      return;
    }
    nodes.list.innerHTML = companies.map((company) => {
      const active = company.id === selectedId ? ' active' : '';
      const type = builtInIds.has(company.id) ? 'Built-in' : 'Custom';
      return '<button class="company-card' + active + '" type="button" data-company-id="' + escapeHtml(company.id) + '">' +
        '<span class="company-logo" style="background:' + escapeHtml(company.color || '#f45d22') + '">' + escapeHtml(initials(company.name)) + '</span>' +
        '<span><strong>' + escapeHtml(company.name) + '</strong><span>' + escapeHtml(company.short_name || company.id) + '</span></span>' +
        '<small>' + type + '</small>' +
      '</button>';
    }).join('');
  }

  function selectedCompany() {
    return companies.find((company) => company.id === selectedId) || null;
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function initials(value) {
    const parts = String(value || 'Q').trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'Q';
  }

  function slugify(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const page = document.querySelector('[data-analytics-page]');
  if (!page) return;

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: page.querySelector('[data-analytics-sync]'),
    breakdown: page.querySelector('[data-analytics-breakdown]')
  };

  init();

  async function init() {
    if (!window.supabase || !page.dataset.supabaseUrl || !page.dataset.supabaseKey) {
      setSync('Supabase unavailable', 'error');
      render([]);
      return;
    }
    const client = window.supabase.createClient(page.dataset.supabaseUrl, page.dataset.supabaseKey);
    const { data, error } = await client.from('jobs').select('id,name,stage,priority,estimate_total,task_count').order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Load failed', 'error');
      render([]);
      return;
    }
    render((data || []).map(normalizeJob));
    setSync('Supabase live', 'live');
  }

  function render(jobs) {
    setMetric('active', jobs.filter((job) => job.stage !== 'Complete').length);
    setMetric('urgent', jobs.filter((job) => job.priority === 'Urgent').length);
    setMetric('tasks', sum(jobs, 'task_count'));
    setMetric('pipeline', money.format(sum(jobs, 'estimate_total')));
    const byStage = ['Lead', 'Inspection', 'Estimate Approved', 'Production', 'QA Review', 'Complete'].map((stage) => {
      const count = jobs.filter((job) => job.stage === stage).length;
      return '<span><strong>' + escapeHtml(stage) + '</strong><small>' + count + ' jobs</small></span>';
    }).join('');
    nodes.breakdown.innerHTML = jobs.length
      ? '<div class="analytics-stage-grid">' + byStage + '</div>'
      : '<article class="empty-state">No Job Center records are in Supabase yet.</article>';
  }

  function setMetric(name, value) {
    const node = document.querySelector('[data-analytics-metric="' + name + '"]');
    if (node) node.textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function normalizeJob(job) {
    return {
      stage: job.stage || 'Lead',
      priority: job.priority || 'Medium',
      estimate_total: number(job.estimate_total),
      task_count: number(job.task_count)
    };
  }

  function sum(jobs, field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const center = document.querySelector('[data-command-center]');
  if (!center) return;

  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]').map(normalizeJob);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-command-sync]'),
    jobs: center.querySelector('[data-command-jobs]'),
    activity: center.querySelector('[data-command-activity]'),
    count: center.querySelector('[data-command-count]')
  };

  init();

  async function init() {
    render(seed, 'local');
    if (!window.supabase) return setSync('Local fallback', 'local');
    const client = window.supabase.createClient(center.dataset.supabaseUrl, center.dataset.supabaseKey);
    const { data, error } = await client.from('jobs').select('*').order('updated_at', { ascending: false });
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      return;
    }
    render((data || []).map(normalizeJob), 'live');
    setSync('Supabase live', 'live');
  }

  function render(jobs, mode) {
    const active = jobs.filter((job) => job.stage !== 'Complete');
    const urgent = jobs.filter((job) => job.priority === 'Urgent');
    setMetric('active', active.length);
    setMetric('urgent', urgent.length);
    setMetric('revenue', money.format(sum(jobs, 'estimate_total')));
    setMetric('tasks', sum(jobs, 'task_count'));
    nodes.count.textContent = active.length + (active.length === 1 ? ' active job' : ' active jobs');
    nodes.jobs.innerHTML = active.slice(0, 5).map((job) => {
      return '<a href="jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile">' +
        '<strong>' + escapeHtml(job.name) + '</strong>' +
        '<span>' + escapeHtml(job.client_name || 'No client') + ' / ' + escapeHtml(job.stage || 'Lead') + ' / ' + money.format(number(job.estimate_total)) + '</span>' +
      '</a>';
    }).join('') || '<div class="empty-state">No active jobs found.</div>';
    nodes.activity.innerHTML = buildActivity(jobs, mode).map((item) => '<div><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span></div>').join('');
  }

  function buildActivity(jobs, mode) {
    const first = jobs[0];
    return [
      ['Supabase status', mode === 'live' ? 'Live jobs loaded from Quest HQ project.' : 'Using local demo jobs.'],
      ['Priority review', (jobs.find((job) => job.priority === 'Urgent')?.name || first?.name || 'No urgent job') + ' is first in the operations queue.'],
      ['Task bridge ready', sum(jobs, 'task_count') + ' linked tasks represented through project_id.'],
      ['Demo boundary', 'Jobs are live; adjacent modules remain linked demo workspaces today.']
    ];
  }

  function setMetric(name, value) {
    center.querySelector('[data-command-metric="' + name + '"]').textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      name: job.name || job.title || 'Untitled Job',
      client_name: job.client_name || job.clients?.name || '',
      stage: job.stage || job.status || 'Lead',
      priority: job.priority || 'Medium',
      estimate_total: number(job.estimate_total),
      task_count: number(job.task_count)
    };
  }

  function sum(jobs, field) {
    return jobs.reduce((total, job) => total + number(job[field]), 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const bridge = document.querySelector('[data-task-bridge]');
  if (!bridge) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('project_id');
  const returnUrl = params.get('return_url');
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]').map(normalizeJob);
  const nodes = {
    sync: bridge.querySelector('[data-bridge-sync]'),
    returnLink: bridge.querySelector('[data-bridge-return]'),
    jobId: bridge.querySelector('[data-bridge-job-id]'),
    projectId: bridge.querySelector('[data-bridge-project-id]'),
    title: bridge.querySelector('[data-bridge-title]'),
    stage: bridge.querySelector('[data-bridge-stage]'),
    tasks: bridge.querySelector('[data-bridge-tasks]'),
    contract: bridge.querySelector('[data-bridge-contract]')
  };

  init();

  async function init() {
    render(pickJob(seed), 'local');
    if (!window.supabase) return setSync('Local fallback', 'local');
    const client = window.supabase.createClient(bridge.dataset.supabaseUrl, bridge.dataset.supabaseKey);
    const query = client.from('jobs').select('*');
    const request = requestedId ? query.eq('id', requestedId).limit(1) : query.order('updated_at', { ascending: false }).limit(1);
    const { data, error } = await request;
    if (error) {
      console.error(error);
      setSync('Local fallback', 'error');
      return;
    }
    render(pickJob((data || []).map(normalizeJob)), 'live');
    setSync('Supabase live', 'live');
  }

  function render(job, mode) {
    if (!job) {
      nodes.jobId.textContent = 'No job selected';
      nodes.projectId.textContent = 'No project_id';
      nodes.title.textContent = 'No job selected';
      nodes.stage.textContent = 'Create a job first';
      nodes.returnLink.href = 'jobs.html?action=new';
      setMetric('tasks', 0);
      setMetric('open', 0);
      setMetric('completed', 0);
      setMetric('overdue', 0);
      nodes.tasks.innerHTML = '<article class="empty-state">No job is selected. Create a Job Center record first, then open the bridge from that job profile.</article>';
      nodes.contract.innerHTML =
        contractRow('project_id', 'No job selected') +
        contractRow('return_url', nodes.returnLink.href) +
        contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local fallback') +
        contractRow('future behavior', 'TaskManagement filters tasks when a real job id is provided.');
      return;
    }
    const completed = completedTasks(job);
    const open = Math.max(number(job.task_count) - completed, 0);
    const overdue = overdueTasks(job);
    nodes.jobId.textContent = job.id;
    nodes.projectId.textContent = job.id;
    nodes.title.textContent = job.name;
    nodes.stage.textContent = job.stage + ' / ' + job.priority;
    nodes.returnLink.href = returnUrl || 'jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile';
    setMetric('tasks', number(job.task_count));
    setMetric('open', open);
    setMetric('completed', completed);
    setMetric('overdue', overdue);
    nodes.tasks.innerHTML = '<article class="empty-state">No live TaskManagement task rows are connected yet. This bridge shows the handoff contract and current job rollup only.</article>';
    nodes.contract.innerHTML =
      contractRow('project_id', job.id) +
      contractRow('return_url', nodes.returnLink.href) +
      contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local demo fallback') +
      contractRow('future behavior', 'TaskManagement filters tasks where task.project_id matches this job id.');
  }

  function pickJob(jobs) {
    return jobs.find((job) => job.id === requestedId) || jobs[0] || null;
  }

  function normalizeJob(job) {
    return {
      id: String(job.id || 'local-' + Date.now()),
      name: job.name || job.title || 'Untitled Job',
      client_name: job.client_name || job.clients?.name || '',
      stage: job.stage || job.status || 'Lead',
      priority: job.priority || 'Medium',
      owner_name: job.owner_name || job.owner || '',
      due_date: job.due_date || '',
      invoice_total: number(job.invoice_total),
      task_count: number(job.task_count)
    };
  }

  function contractRow(label, value) {
    return '<span><strong>' + escapeHtml(label) + '</strong><code>' + escapeHtml(value) + '</code></span>';
  }

  function setMetric(name, value) {
    const node = bridge.querySelector('[data-bridge-metric="' + name + '"]');
    if (node) node.textContent = String(value);
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function completedTasks(job) {
    return Math.min(Math.floor(number(job.task_count) * 0.58), number(job.task_count));
  }

  function overdueTasks(job) {
    return job.priority === 'Urgent' ? 2 : job.priority === 'High' ? 1 : 0;
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const center = document.querySelector('[data-form-center]');
  if (!center) return;

  const formsKey = 'quest-hq-forms-v1';
  const responsesKey = 'quest-hq-form-responses-v1';
  const fieldTypes = {
    short: 'Short answer',
    paragraph: 'Paragraph',
    multiple: 'Multiple choice',
    checkboxes: 'Checkboxes',
    dropdown: 'Dropdown',
    file: 'File upload',
    linear: 'Linear scale',
    grid: 'Multiple choice grid',
    checkboxGrid: 'Checkbox grid',
    date: 'Date',
    time: 'Time',
    title: 'Title and description',
    section: 'Section',
    rating: 'Rating scale',
    yesno: 'Yes / No',
    signature: 'Signature'
  };
  const nodes = {
    state: center.querySelector('[data-form-state]'),
    list: center.querySelector('[data-form-list]'),
    summary: center.querySelector('[data-form-summary]'),
    settings: center.querySelector('[data-form-settings]'),
    dirty: center.querySelector('[data-form-dirty]'),
    search: center.querySelector('[data-form-search]'),
    typeFilter: center.querySelector('[data-form-type-filter]'),
    questionList: center.querySelector('[data-question-list]'),
    questionCount: center.querySelector('[data-question-count]'),
    questionMenu: center.querySelector('[data-question-menu]'),
    responseForm: center.querySelector('[data-response-form]'),
    responseSidecar: center.querySelector('[data-response-sidecar]'),
    responseList: center.querySelector('[data-response-list]'),
    responseCount: center.querySelector('[data-response-count]'),
    responseDetail: center.querySelector('[data-response-detail]'),
    builderPanel: center.querySelector('[data-form-builder-host]'),
    builderGrid: center.querySelector('.forms-builder-grid'),
    modal: center.querySelector('[data-form-modal]'),
    modalBody: center.querySelector('[data-form-modal-body]'),
    editorResponseCount: center.querySelector('[data-form-editor-response-count]'),
    editorResponseList: center.querySelector('[data-form-editor-response-list]')
  };
  let builderHome = null;
  let lastFocus = null;
  let forms = read(formsKey, []);
  let responses = read(responsesKey, []);
  let draft = blankForm();
  let selectedId = forms[0]?.id || '';
  let selectedQuestionId = '';
  let selectedResponseId = '';
  let menuQuestionId = '';
  let dirty = false;
  const params = new URLSearchParams(window.location.search);
  const isPublicMode = params.get('public') === '1';
  if (isPublicMode) {
    document.body.classList.add('form-public-mode');
    const shared = readSharedForm(params.get('payload'));
    const byId = params.get('form') ? forms.find((form) => form.id === params.get('form')) : null;
    if (shared) {
      draft = shared;
      selectedId = shared.id || 'shared-form';
    } else if (byId) {
      draft = clone(byId);
      selectedId = byId.id;
    }
    selectedQuestionId = draft.questions?.[0]?.id || '';
  }
  if (!isPublicMode && selectedId) draft = clone(forms.find((form) => form.id === selectedId));
  if (isPublicMode && !draft.questions) draft = blankForm();

  bind();
  render();

  function bind() {
    center.querySelector('[data-form-new]')?.addEventListener('click', () => {
      selectedId = '';
      selectedQuestionId = '';
      selectedResponseId = '';
      draft = blankForm();
      dirty = true;
      render();
      openFormModal();
    });
    nodes.settings.addEventListener('input', () => {
      applySettings();
      dirty = true;
      renderLite();
    });
    nodes.settings.addEventListener('submit', (event) => {
      event.preventDefault();
      saveDraft();
      if (!nodes.modal.hidden) closeFormModal();
    });
    center.querySelector('[data-form-publish]')?.addEventListener('click', () => {
      draft.status = 'Published';
      saveDraft();
    });
    center.querySelector('[data-form-archive]')?.addEventListener('click', () => {
      draft.status = 'Archived';
      saveDraft();
    });
    center.querySelector('[data-form-duplicate]')?.addEventListener('click', duplicateForm);
    center.querySelector('[data-form-delete]')?.addEventListener('click', deleteForm);
    center.querySelector('[data-form-export]')?.addEventListener('click', exportForm);
    center.querySelectorAll('[data-form-editor-tab]').forEach((button) => {
      button.addEventListener('click', () => setEditorMode(button.dataset.formEditorTab || 'questions'));
    });
    center.addEventListener('click', (event) => {
      if (event.target.closest('[data-form-modal-close]')) closeFormModal();
      if (event.target === nodes.modal) closeFormModal();
      const copyLink = event.target.closest('[data-form-copy-link]');
      if (copyLink) {
        copyPublicLink();
        return;
      }
      const openPublic = event.target.closest('[data-form-open-public]');
      if (openPublic) {
        window.open(publicFormUrl(), '_blank', 'noopener,noreferrer');
        return;
      }
    });
    nodes.search?.addEventListener('input', renderLibrary);
    nodes.typeFilter?.addEventListener('change', renderLibrary);
    nodes.list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-form-id]');
      if (!button) return;
      selectForm(button.dataset.formId);
    });
    nodes.summary.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-tab-jump]');
      if (jump) {
        switchTab(jump.dataset.tabJump);
        return;
      }
      if (!event.target.closest('[data-form-edit]')) return;
      openFormModal();
    });
    center.querySelectorAll('[data-question-add]').forEach((button) => {
      button.addEventListener('click', () => addQuestion('multiple'));
    });
    center.querySelectorAll('[data-question-add-type]').forEach((button) => {
      button.addEventListener('click', () => addQuestion(button.dataset.questionAddType || 'multiple'));
    });
    nodes.questionList.addEventListener('click', (event) => {
      const card = event.target.closest('[data-question-id]');
      if (!card) return;
      selectedQuestionId = card.dataset.questionId;
      const actionButton = event.target.closest('[data-question-action]');
      const action = actionButton?.dataset.questionAction;
      if (action) {
        event.preventDefault();
        runQuestionAction(action, selectedQuestionId, actionButton);
        return;
      }
      nodes.questionList.querySelectorAll('.question-card').forEach((item) => item.classList.toggle('active', item.dataset.questionId === selectedQuestionId));
    });
    nodes.questionList.addEventListener('input', (event) => {
      updateQuestionFromInput(event.target);
    });
    nodes.questionList.addEventListener('change', (event) => {
      updateQuestionFromInput(event.target);
    });
    nodes.questionList.addEventListener('contextmenu', (event) => {
      const card = event.target.closest('[data-question-id]');
      if (!card || !nodes.questionMenu) return;
      event.preventDefault();
      selectedQuestionId = card.dataset.questionId;
      menuQuestionId = selectedQuestionId;
      renderQuestions();
      nodes.questionMenu.hidden = false;
      nodes.questionMenu.style.left = Math.min(event.clientX, window.innerWidth - 230) + 'px';
      nodes.questionMenu.style.top = Math.min(event.clientY, window.innerHeight - 230) + 'px';
    });
    nodes.questionMenu?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-menu-action]');
      if (!button) return;
      runQuestionAction(button.dataset.menuAction, menuQuestionId, button);
      nodes.questionMenu.hidden = true;
    });
    document.addEventListener('click', (event) => {
      if (!nodes.questionMenu || nodes.questionMenu.hidden || event.target.closest('[data-question-menu]')) return;
      nodes.questionMenu.hidden = true;
    });
    nodes.responseForm.addEventListener('submit', saveResponse);
    nodes.responseList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-response-id]');
      if (!button) return;
      selectedResponseId = button.dataset.responseId;
      renderResponses();
    });
    nodes.responseDetail.addEventListener('click', (event) => {
      if (!event.target.closest('[data-response-delete]')) return;
      deleteResponse();
    });
    center.querySelectorAll('[data-form-template]').forEach((button) => {
      button.addEventListener('click', () => {
        draft = templateForm(button.dataset.formTemplate);
        selectedId = '';
        selectedQuestionId = draft.questions[0]?.id || '';
        dirty = true;
        render();
        openFormModal();
      });
    });
  }

  function openFormModal() {
    if (!nodes.modal || !nodes.modalBody || !nodes.builderGrid) return;
    lastFocus = document.activeElement;
    builderHome = document.createComment('form-builder-home');
    nodes.builderGrid.parentNode.insertBefore(builderHome, nodes.builderGrid);
    nodes.modalBody.appendChild(nodes.builderGrid);
    nodes.modal.hidden = false;
    document.body.classList.add('modal-open');
    setEditorMode('questions');
    nodes.modal.querySelector('[data-form-modal-close]')?.focus();
  }

  function closeFormModal() {
    if (!nodes.modal || nodes.modal.hidden) return;
    if (builderHome && nodes.builderGrid) {
      builderHome.parentNode.insertBefore(nodes.builderGrid, builderHome);
      builderHome.remove();
      builderHome = null;
    }
    nodes.modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.();
    render();
  }

  function saveDraft() {
    applySettings();
    if (!draft.title.trim()) {
      setState('Title required', 'error');
      return;
    }
    const now = new Date().toISOString();
    draft.updatedAt = now;
    if (!draft.id) draft.id = 'form-' + Date.now();
    if (!draft.createdAt) draft.createdAt = now;
    const existing = forms.findIndex((form) => form.id === draft.id);
    if (existing >= 0) forms[existing] = clone(draft);
    else forms.unshift(clone(draft));
    selectedId = draft.id;
    dirty = false;
    write(formsKey, forms);
    setState('Saved locally', 'live');
    render();
  }

  function selectForm(id) {
    const form = forms.find((item) => item.id === id);
    if (!form) return;
    selectedId = id;
    draft = clone(form);
    selectedQuestionId = draft.questions[0]?.id || '';
    selectedResponseId = responses.find((item) => item.formId === id)?.id || '';
    dirty = false;
    render();
  }

  function duplicateForm() {
    if (!draft.title.trim()) return;
    const copy = clone(draft);
    copy.id = 'form-' + Date.now();
    copy.title = copy.title + ' Copy';
    copy.status = 'Draft';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    forms.unshift(copy);
    selectedId = copy.id;
    draft = clone(copy);
    dirty = false;
    write(formsKey, forms);
    render();
  }

  function deleteForm() {
    if (!selectedId) {
      draft = blankForm();
      selectedQuestionId = '';
      dirty = false;
      render();
      return;
    }
    forms = forms.filter((form) => form.id !== selectedId);
    responses = responses.filter((response) => response.formId !== selectedId);
    write(formsKey, forms);
    write(responsesKey, responses);
    selectedId = forms[0]?.id || '';
    draft = selectedId ? clone(forms.find((form) => form.id === selectedId)) : blankForm();
    selectedQuestionId = draft.questions[0]?.id || '';
    selectedResponseId = '';
    dirty = false;
    render();
  }

  function exportForm() {
    const data = JSON.stringify({ form: draft, responses: responses.filter((item) => item.formId === draft.id) }, null, 2);
    navigator.clipboard?.writeText(data).then(() => setState('Copied JSON', 'live')).catch(() => {
      setState('Export ready in console', 'local');
      console.log(data);
    });
  }

  function applySettings() {
    const data = new FormData(nodes.settings);
    draft.title = String(data.get('title') || '');
    draft.description = String(data.get('description') || '');
    draft.type = String(data.get('type') || 'Inspection');
    draft.status = String(data.get('status') || 'Draft');
    draft.audience = String(data.get('audience') || '');
    draft.jobContext = String(data.get('jobContext') || '');
    draft.themeColor = String(data.get('themeColor') || '#f45d22');
    draft.backgroundStyle = String(data.get('backgroundStyle') || 'clean');
    draft.headerImage = String(data.get('headerImage') || '');
    draft.buttonLabel = String(data.get('buttonLabel') || 'Submit');
    draft.collectEmail = data.has('collectEmail');
    draft.requireApproval = data.has('requireApproval');
  }

  function addQuestion(type = 'multiple', afterId = '') {
    const question = blankQuestion(type);
    const index = afterId ? draft.questions.findIndex((item) => item.id === afterId) : -1;
    if (index >= 0) draft.questions.splice(index + 1, 0, question);
    else draft.questions.push(question);
    selectedQuestionId = question.id;
    dirty = true;
    render();
  }

  function updateQuestionFromInput(target) {
    const card = target.closest('[data-question-id]');
    if (!card) return;
    const question = draft.questions.find((item) => item.id === card.dataset.questionId);
    if (!question) return;
    selectedQuestionId = question.id;
    if (target.matches('[data-question-label]')) question.label = target.value;
    else if (target.matches('[data-question-help]')) question.help = target.value;
    else if (target.matches('[data-question-type-select]')) {
      question.type = target.value;
      normalizeQuestion(question);
      dirty = true;
      renderQuestions();
      renderPreview();
      renderLite();
      return;
    } else if (target.matches('[data-question-required]')) question.required = target.checked;
    else if (target.matches('[data-question-review]')) question.reviewFlag = target.checked;
    else if (target.matches('[data-question-option]')) question.options[number(target.dataset.optionIndex)] = target.value;
    else if (target.matches('[data-question-row]')) question.rows[number(target.dataset.rowIndex)] = target.value;
    else if (target.matches('[data-question-column]')) question.columns[number(target.dataset.columnIndex)] = target.value;
    else if (target.matches('[data-question-scale-min]')) question.scaleMin = number(target.value, 1);
    else if (target.matches('[data-question-scale-max]')) question.scaleMax = number(target.value, 5);
    dirty = true;
    renderPreview();
    renderLite();
  }

  function runQuestionAction(action, id = selectedQuestionId, actionEl = null) {
    selectedQuestionId = id;
    if (action === 'addBelow') return addQuestion('multiple', id);
    if (action === 'duplicate') return duplicateQuestion(id);
    if (action === 'delete') return deleteQuestion(id);
    if (action === 'moveUp') return moveQuestion(-1, id);
    if (action === 'moveDown') return moveQuestion(1, id);
    if (action === 'addOption') return addQuestionOption(id);
    if (action === 'removeOption') return removeQuestionOption(id, number(actionEl?.dataset.optionIndex, -1));
    if (action === 'addRow') return addGridItem(id, 'rows');
    if (action === 'addColumn') return addGridItem(id, 'columns');
    if (action === 'removeRow') return removeGridItem(id, 'rows', number(actionEl?.dataset.rowIndex, -1));
    if (action === 'removeColumn') return removeGridItem(id, 'columns', number(actionEl?.dataset.columnIndex, -1));
  }

  function addQuestionOption(id) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    question.options = question.options || [];
    question.options.push('Option ' + (question.options.length + 1));
    dirty = true;
    render();
  }

  function removeQuestionOption(id, index) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question || index < 0) return;
    question.options.splice(index, 1);
    if (!question.options.length) question.options.push('Option 1');
    dirty = true;
    render();
  }

  function addGridItem(id, key) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    question[key] = question[key] || [];
    question[key].push((key === 'rows' ? 'Row ' : 'Column ') + (question[key].length + 1));
    dirty = true;
    render();
  }

  function removeGridItem(id, key, index) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question || index < 0) return;
    question[key].splice(index, 1);
    if (!question[key].length) question[key].push(key === 'rows' ? 'Row 1' : 'Column 1');
    dirty = true;
    render();
  }

  function deleteQuestion(id = selectedQuestionId) {
    draft.questions = draft.questions.filter((question) => question.id !== id);
    selectedQuestionId = draft.questions[0]?.id || '';
    dirty = true;
    render();
  }

  function duplicateQuestion(id = selectedQuestionId) {
    const question = draft.questions.find((item) => item.id === id);
    if (!question) return;
    const copy = { ...clone(question), id: 'q-' + Date.now(), label: question.label + ' Copy' };
    const index = draft.questions.findIndex((item) => item.id === question.id);
    draft.questions.splice(index + 1, 0, copy);
    selectedQuestionId = copy.id;
    dirty = true;
    render();
  }

  function moveQuestion(direction, id = selectedQuestionId) {
    const index = draft.questions.findIndex((question) => question.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= draft.questions.length) return;
    const [question] = draft.questions.splice(index, 1);
    draft.questions.splice(next, 0, question);
    dirty = true;
    render();
  }

  function saveResponse(event) {
    event.preventDefault();
    if (!draft.questions.length) {
      setState('Add questions first', 'local');
      return;
    }
    const data = new FormData(nodes.responseForm);
    const values = {};
    draft.questions.forEach((question) => {
      if (question.type === 'checkboxes') values[question.id] = data.getAll(question.id);
      else if (question.type === 'grid' || question.type === 'checkboxGrid') {
        values[question.id] = (question.rows || []).map((row, index) => ({
          row,
          value: question.type === 'checkboxGrid' ? data.getAll(question.id + '-' + index) : data.get(question.id + '-' + index)
        }));
      }
      else values[question.id] = data.get(question.id) || '';
    });
    const response = {
      id: 'response-' + Date.now(),
      formId: draft.id || 'unsaved-draft',
      formTitle: draft.title || 'Unsaved form',
      submittedAt: new Date().toISOString(),
      values
    };
    responses.unshift(response);
    selectedResponseId = response.id;
    write(responsesKey, responses);
    setState('Response saved', 'live');
    nodes.responseForm.reset();
    if (isPublicMode) {
      nodes.responseForm.innerHTML = '<div class="public-thank-you"><h2>Response submitted</h2><p class="muted">Thank you. Your response was saved on this device for the presentation mockup.</p></div>';
      return;
    }
    render();
    switchTab('responses');
  }

  function render() {
    if (isPublicMode) setPublicLayout();
    renderMetrics();
    renderSettings();
    renderLibrary();
    renderSummary();
    renderQuestions();
    renderPreview();
    renderResponses();
    renderEditorResponses();
    renderLite();
  }

  function renderLite() {
    nodes.dirty.textContent = dirty ? 'Unsaved changes' : (selectedId ? 'Saved locally' : 'Unsaved draft');
  }

  function renderMetrics() {
    setMetric('forms', forms.length);
    setMetric('published', forms.filter((form) => form.status === 'Published').length);
    setMetric('responses', responses.length);
    setMetric('questions', forms.reduce((sum, form) => sum + form.questions.length, 0));
  }

  function renderSettings() {
    nodes.settings.elements.title.value = draft.title || '';
    nodes.settings.elements.description.value = draft.description || '';
    nodes.settings.elements.type.value = draft.type || 'Inspection';
    nodes.settings.elements.status.value = draft.status || 'Draft';
    nodes.settings.elements.audience.value = draft.audience || '';
    nodes.settings.elements.jobContext.value = draft.jobContext || '';
    nodes.settings.elements.themeColor.value = draft.themeColor || '#f45d22';
    nodes.settings.elements.backgroundStyle.value = draft.backgroundStyle || 'clean';
    nodes.settings.elements.headerImage.value = draft.headerImage || '';
    nodes.settings.elements.buttonLabel.value = draft.buttonLabel || 'Submit';
    nodes.settings.elements.collectEmail.checked = !!draft.collectEmail;
    nodes.settings.elements.requireApproval.checked = !!draft.requireApproval;
  }

  function renderLibrary() {
    const query = (nodes.search?.value || '').toLowerCase();
    const filter = nodes.typeFilter?.value || 'all';
    const visible = forms.filter((form) => {
      const haystack = [form.title, form.type, form.audience, form.jobContext].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (filter === 'all' || form.type === filter);
    });
    nodes.list.innerHTML = visible.length ? visible.map((form) => {
      const count = responses.filter((response) => response.formId === form.id).length;
      return '<button type="button" class="form-card ' + (form.id === selectedId ? 'active' : '') + '" data-form-id="' + escapeHtml(form.id) + '"><strong>' + escapeHtml(form.title) + '</strong><span>' + escapeHtml(form.type) + ' / ' + escapeHtml(form.status) + '</span><small>' + form.questions.length + ' questions / ' + count + ' responses</small></button>';
    }).join('') : '<div class="empty-state">No saved forms yet. Use New Form or apply a template.</div>';
  }

  function renderSummary() {
    if (!selectedId && !draft.title) {
      nodes.summary.innerHTML = '<div class="empty-state">Create a form or apply a template to start.</div>';
      return;
    }
    const count = responses.filter((response) => response.formId === draft.id).length;
    const publicUrl = publicFormUrl();
    nodes.summary.innerHTML = '<div class="forms-summary-head"><div><h2>' + escapeHtml(draft.title || 'Unsaved form') + '</h2><p class="muted">' + escapeHtml(draft.description || 'No description yet.') + '</p></div><span>' + escapeHtml(draft.status || 'Draft') + '</span></div>' +
      '<div class="forms-simple-meta"><span>' + escapeHtml(draft.type || 'Inspection') + '</span><button type="button" data-tab-jump="responses">' + count + ' responses</button><span>' + draft.questions.length + ' questions</span></div>' +
      '<div class="share-card forms-summary-share"><strong>Respondent link</strong><input readonly value="' + escapeHtml(publicUrl) + '"><div class="form-actions"><button class="primary-button" type="button" data-form-open-public>Open</button><button class="secondary-button" type="button" data-form-copy-link>Copy</button></div></div>' +
      '<div class="form-actions forms-summary-actions"><button class="primary-button" type="button" data-form-edit>Edit Form</button><button class="secondary-button" type="button" data-tab-jump="preview">Preview</button><button class="secondary-button" type="button" data-tab-jump="responses">Responses</button></div>';
  }

  function renderQuestions() {
    const countLabel = draft.questions.length + (draft.questions.length === 1 ? ' question' : ' questions');
    if (nodes.questionCount) nodes.questionCount.textContent = countLabel;
    nodes.questionList.innerHTML = draft.questions.length ? draft.questions.map(questionCard).join('') : '<div class="empty-state">Add a question to start building the form.</div>';
  }

  function questionCard(question, index) {
    normalizeQuestion(question);
    const active = question.id === selectedQuestionId ? ' active' : '';
    const staticBlock = ['title', 'section'].includes(question.type) ? ' gform-static-block' : '';
    return '<article class="question-card' + active + staticBlock + '" data-question-id="' + escapeHtml(question.id) + '">' +
      '<div class="gform-card-body">' +
        '<div class="gform-question-top">' +
          '<input class="gform-question-input" data-question-label value="' + escapeHtml(question.label || '') + '" placeholder="Question">' +
          '<select class="gform-type-select" data-question-type-select>' + questionTypeOptions(question.type) + '</select>' +
        '</div>' +
        '<textarea class="gform-help-input" data-question-help rows="2" placeholder="Description or help text">' + escapeHtml(question.help || '') + '</textarea>' +
        questionBuilderFields(question) +
      '</div>' +
      '<div class="gform-card-footer">' +
        '<span class="gform-context-hint">Right-click for card actions</span>' +
        '<label class="gform-required"><input type="checkbox" data-question-required ' + (question.required ? 'checked' : '') + '> Required</label>' +
        '<label class="gform-required"><input type="checkbox" data-question-review ' + (question.reviewFlag ? 'checked' : '') + '> Review</label>' +
        '<div class="gform-card-menu">' +
          '<button class="gform-card-icon" type="button" data-question-action="moveUp" title="Move up">Up</button>' +
          '<button class="gform-card-icon" type="button" data-question-action="moveDown" title="Move down">Dn</button>' +
          '<button class="gform-card-icon" type="button" data-question-action="duplicate" title="Duplicate">Cp</button>' +
          '<button class="gform-card-icon" type="button" data-question-action="delete" title="Delete">X</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function questionTypeOptions(selected) {
    return Object.entries(fieldTypes).map(([value, label]) => '<option value="' + value + '" ' + (selected === value ? 'selected' : '') + '>' + escapeHtml(label) + '</option>').join('');
  }

  function questionBuilderFields(question) {
    if (['multiple', 'checkboxes', 'dropdown'].includes(question.type)) return choiceEditor(question);
    if (['grid', 'checkboxGrid'].includes(question.type)) return gridEditor(question);
    if (['linear', 'rating'].includes(question.type)) return scaleEditor(question);
    if (question.type === 'paragraph') return '<div class="gform-preview-line">Long answer text</div>';
    if (question.type === 'short') return '<div class="gform-preview-line">Short answer text</div>';
    if (question.type === 'date') return '<div class="gform-preview-line">Month, day, year</div>';
    if (question.type === 'time') return '<div class="gform-preview-line">Time</div>';
    if (question.type === 'file') return '<div class="gform-file-preview">Respondents will provide a file link in this mockup. Supabase Storage upload can attach here later.</div>';
    if (question.type === 'yesno') return choiceEditor({ ...question, options: ['Yes', 'No'] });
    if (question.type === 'signature') return '<div class="gform-file-preview">Acknowledgement checkbox shown in preview.</div>';
    return '<div class="gform-preview-line">Text block</div>';
  }

  function choiceEditor(question) {
    const markerClass = question.type === 'checkboxes' ? 'square' : question.type === 'dropdown' ? 'dropdown' : '';
    return '<div class="gform-option-list">' + (question.options || []).map((option, index) =>
      '<div class="gform-option-row"><span class="gform-option-marker ' + markerClass + '">' + (question.type === 'dropdown' ? (index + 1) : '') + '</span><input class="gform-option-input" data-question-option data-option-index="' + index + '" value="' + escapeHtml(option) + '" placeholder="Option"><button class="gform-option-remove" type="button" data-question-action="removeOption" data-option-index="' + index + '" title="Remove option">X</button></div>'
    ).join('') + '<button class="gform-option-add" type="button" data-question-action="addOption">Add option</button></div>';
  }

  function gridEditor(question) {
    return '<div class="gform-grid-editor"><strong>Rows</strong>' + (question.rows || []).map((row, index) =>
      '<div class="gform-option-row"><span class="gform-option-marker square"></span><input class="gform-option-input" data-question-row data-row-index="' + index + '" value="' + escapeHtml(row) + '"><button class="gform-option-remove" type="button" data-question-action="removeRow" data-row-index="' + index + '">X</button></div>'
    ).join('') + '<button class="gform-option-add" type="button" data-question-action="addRow">Add row</button><strong>Columns</strong>' + (question.columns || []).map((column, index) =>
      '<div class="gform-option-row"><span class="gform-option-marker"></span><input class="gform-option-input" data-question-column data-column-index="' + index + '" value="' + escapeHtml(column) + '"><button class="gform-option-remove" type="button" data-question-action="removeColumn" data-column-index="' + index + '">X</button></div>'
    ).join('') + '<button class="gform-option-add" type="button" data-question-action="addColumn">Add column</button></div>';
  }

  function scaleEditor(question) {
    return '<div class="gform-scale-row"><label>Scale min<input class="gform-scale-input" type="number" min="0" max="10" data-question-scale-min value="' + escapeHtml(question.scaleMin ?? 1) + '"></label><label>Scale max<input class="gform-scale-input" type="number" min="1" max="10" data-question-scale-max value="' + escapeHtml(question.scaleMax ?? 5) + '"></label></div>';
  }

  function renderPreview() {
    if (!draft.title && !draft.questions.length) {
      nodes.responseForm.innerHTML = isPublicMode ? '<div class="empty-state">This form link is empty or expired.</div>' : '<div class="empty-state">Build or select a form to preview it.</div>';
      if (nodes.responseSidecar) nodes.responseSidecar.innerHTML = '<h2>Collector Settings</h2><p class="muted">No form selected.</p>';
      return;
    }
    nodes.responseForm.classList.add('designed-form');
    nodes.responseForm.style.setProperty('--form-theme', themeColor());
    document.body.dataset.formBackground = draft.backgroundStyle || 'clean';
    nodes.responseForm.innerHTML = respondentHeader() +
      (draft.collectEmail ? '<label>Email<input type="email" name="respondent_email" placeholder="name@example.com"></label>' : '') +
      (draft.questions.length ? draft.questions.map(responseField).join('') : '<div class="empty-state">No questions yet.</div>') +
      '<div class="form-actions"><button class="primary-button" type="submit">' + escapeHtml(draft.buttonLabel || 'Submit') + '</button>' + (isPublicMode ? '' : '<button class="secondary-button" type="reset">Clear</button>') + '</div>';
    const saved = draft.id ? responses.filter((response) => response.formId === draft.id).length : 0;
    if (nodes.responseSidecar) {
      nodes.responseSidecar.innerHTML = '<h2>Share & Collect</h2><p class="muted">This generated link opens a dedicated respondent form without the Quest HQ sidebar.</p>' +
        '<div class="share-card"><strong>Public form link</strong><input readonly value="' + escapeHtml(publicFormUrl()) + '"><div class="form-actions"><button class="primary-button" type="button" data-form-open-public>Open</button><button class="secondary-button" type="button" data-form-copy-link>Copy</button></div></div>' +
        '<div class="summary-pill-grid">' + pill('Status', draft.status) + pill('Responses', saved) + pill('Email', draft.collectEmail ? 'Collected' : 'Off') + '</div>';
    }
  }

  function renderResponses() {
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    nodes.responseCount.textContent = current.length + (current.length === 1 ? ' response' : ' responses');
    nodes.responseList.innerHTML = current.length ? current.map((response) =>
      '<button type="button" class="response-card ' + (response.id === selectedResponseId ? 'active' : '') + '" data-response-id="' + escapeHtml(response.id) + '"><strong>' + escapeHtml(response.formTitle) + '</strong><span>' + formatDate(response.submittedAt) + '</span></button>'
    ).join('') : '<div class="empty-state">No responses for this form yet.</div>';
    const response = responses.find((item) => item.id === selectedResponseId) || current[0];
    if (!response) {
      nodes.responseDetail.innerHTML = '<div class="empty-state">Select a response to review submitted answers.</div>';
      return;
    }
    selectedResponseId = response.id;
    nodes.responseDetail.innerHTML = '<div class="response-detail-head"><div><h2>Response Detail</h2><p class="muted">Submitted ' + formatDate(response.submittedAt) + '</p></div><button class="danger-button" type="button" data-response-delete>Delete Response</button></div><div class="response-detail-list">' +
      draft.questions.map((question) => '<div><strong>' + escapeHtml(question.label || 'Untitled question') + '</strong><span>' + escapeHtml(formatAnswer(response.values[question.id])) + '</span></div>').join('') +
      '</div>';
  }

  function deleteResponse() {
    if (!selectedResponseId) return;
    responses = responses.filter((response) => response.id !== selectedResponseId);
    write(responsesKey, responses);
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    selectedResponseId = current[0]?.id || '';
    setState('Response deleted', 'live');
    render();
  }

  function renderEditorResponses() {
    if (!nodes.editorResponseCount || !nodes.editorResponseList) return;
    const current = responses.filter((response) => response.formId === draft.id || (!draft.id && response.formId === 'unsaved-draft'));
    nodes.editorResponseCount.textContent = current.length + (current.length === 1 ? ' response' : ' responses');
    nodes.editorResponseList.innerHTML = current.length ? current.slice(0, 6).map((response) =>
      '<div class="gform-modal-response-row"><strong>' + escapeHtml(response.formTitle) + '</strong><span>' + formatDate(response.submittedAt) + '</span></div>'
    ).join('') : '<div class="empty-state">No responses yet. Use Preview & Collect to submit a test response.</div>';
  }

  function responseField(question) {
    const required = question.required ? ' required' : '';
    const help = question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '';
    const label = '<strong>' + escapeHtml(question.label || 'Untitled question') + (question.required ? ' *' : '') + '</strong>' + help;
    const options = (question.options || ['Option 1', 'Option 2']);
    if (question.type === 'paragraph') return '<label class="response-question">' + label + '<textarea name="' + question.id + '" rows="4"' + required + '></textarea></label>';
    if (question.type === 'multiple') return '<div class="response-question">' + label + '<div class="response-options">' + options.map((option) => '<label><input type="radio" name="' + question.id + '" value="' + escapeHtml(option) + '"' + required + '> ' + escapeHtml(option) + '</label>').join('') + '</div></div>';
    if (question.type === 'checkboxes') return '<div class="response-question">' + label + '<div class="response-options">' + options.map((option) => '<label><input type="checkbox" name="' + question.id + '" value="' + escapeHtml(option) + '"> ' + escapeHtml(option) + '</label>').join('') + '</div></div>';
    if (question.type === 'dropdown') return '<label class="response-question">' + label + '<select name="' + question.id + '"' + required + '><option value="">Select...</option>' + options.map((option) => '<option>' + escapeHtml(option) + '</option>').join('') + '</select></label>';
    if (question.type === 'rating') {
      const min = number(question.scaleMin, 1);
      const max = number(question.scaleMax, 5);
      const scale = Array.from({ length: Math.max(max - min + 1, 1) }, (_, index) => min + index);
      return '<div class="response-question">' + label + '<div class="rating-row">' + scale.map((value) => '<label><input type="radio" name="' + question.id + '" value="' + value + '"' + required + '>' + value + '</label>').join('') + '</div></div>';
    }
    if (question.type === 'linear') {
      const min = number(question.scaleMin, 1);
      const max = number(question.scaleMax, 5);
      const scale = Array.from({ length: Math.max(max - min + 1, 1) }, (_, index) => min + index);
      return '<div class="response-question">' + label + '<div class="rating-row">' + scale.map((value) => '<label><input type="radio" name="' + question.id + '" value="' + value + '"' + required + '>' + value + '</label>').join('') + '</div></div>';
    }
    if (question.type === 'grid' || question.type === 'checkboxGrid') {
      return '<div class="response-question">' + label + '<div class="response-detail-list">' + (question.rows || ['Row 1']).map((row, rowIndex) => '<div><strong>' + escapeHtml(row) + '</strong><div class="response-options">' + (question.columns || ['Column 1']).map((column, columnIndex) => '<label><input type="' + (question.type === 'checkboxGrid' ? 'checkbox' : 'radio') + '" name="' + question.id + '-' + rowIndex + '" value="' + escapeHtml(column) + '"> ' + escapeHtml(column) + '</label>').join('') + '</div></div>').join('') + '</div></div>';
    }
    if (question.type === 'date') return '<label class="response-question">' + label + '<input type="date" name="' + question.id + '"' + required + '></label>';
    if (question.type === 'time') return '<label class="response-question">' + label + '<input type="time" name="' + question.id + '"' + required + '></label>';
    if (question.type === 'title') return '<div class="response-question"><strong>' + escapeHtml(question.label || 'Untitled title') + '</strong>' + (question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '') + '</div>';
    if (question.type === 'section') return '<div class="response-question"><strong>' + escapeHtml(question.label || 'Section') + '</strong>' + (question.help ? '<small>' + escapeHtml(question.help) + '</small>' : '') + '</div>';
    if (question.type === 'yesno') return '<div class="response-question">' + label + '<div class="response-options"><label><input type="radio" name="' + question.id + '" value="Yes"' + required + '> Yes</label><label><input type="radio" name="' + question.id + '" value="No"' + required + '> No</label></div></div>';
    if (question.type === 'signature') return '<label class="response-question forms-check"><input type="checkbox" name="' + question.id + '" value="Acknowledged"' + required + '> ' + escapeHtml(question.label || 'I acknowledge this form') + '</label>';
    if (question.type === 'file') return '<label class="response-question">' + label + '<input type="text" name="' + question.id + '" placeholder="File name or Quest HQ Files link"' + required + '></label>';
    return '<label class="response-question">' + label + '<input name="' + question.id + '"' + required + '></label>';
  }

  function setPublicLayout() {
    center.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === 'preview'));
    center.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === 'preview'));
  }

  function respondentHeader() {
    const image = String(draft.headerImage || '').trim();
    return '<div class="designed-form-header">' +
      (image ? '<div class="designed-form-image" style="background-image:url(' + cssUrl(image) + ')"></div>' : '') +
      '<div class="designed-form-title"><h2>' + escapeHtml(draft.title || 'Untitled form') + '</h2><p class="muted">' + escapeHtml(draft.description || 'No description yet.') + '</p></div>' +
    '</div>';
  }

  function publicFormUrl() {
    const form = clone(draft);
    if (!form.id) form.id = 'shared-form';
    const payload = encodePayload(form);
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, 'forms.html');
    url.search = '?public=1&payload=' + encodeURIComponent(payload);
    url.hash = '';
    return url.toString();
  }

  function copyPublicLink() {
    if (!draft.title.trim()) {
      setState('Title required before sharing', 'error');
      return;
    }
    saveDraft();
    const url = publicFormUrl();
    navigator.clipboard?.writeText(url).then(() => setState('Public link copied', 'live')).catch(() => {
      setState('Copy failed. Link is visible.', 'error');
    });
  }

  function encodePayload(value) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  }

  function readSharedForm(payload) {
    if (!payload) return null;
    try {
      const form = JSON.parse(decodeURIComponent(escape(atob(payload))));
      return form && Array.isArray(form.questions) ? form : null;
    } catch {
      return null;
    }
  }

  function themeColor() {
    const color = String(draft.themeColor || '#f45d22');
    return /^#[0-9a-f]{6}$/i.test(color) ? color : '#f45d22';
  }

  function cssUrl(value) {
    return '\'' + String(value).replace(/[\\']/g, '') + '\'';
  }

  function blankForm() {
    return { id: '', title: '', description: '', type: 'Inspection', status: 'Draft', audience: '', jobContext: '', themeColor: '#f45d22', backgroundStyle: 'clean', headerImage: '', buttonLabel: 'Submit', collectEmail: false, requireApproval: false, createdAt: '', updatedAt: '', questions: [] };
  }

  function blankQuestion(type) {
    const question = { id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000), type: type || 'multiple', label: fieldTypes[type] || 'Question', help: '', required: false, reviewFlag: false, options: ['Option 1', 'Option 2'], rows: ['Row 1'], columns: ['Column 1'], scaleMin: 1, scaleMax: 5 };
    normalizeQuestion(question);
    return question;
  }

  function normalizeQuestion(question) {
    if (!question.type || !fieldTypes[question.type]) question.type = 'multiple';
    if (!Array.isArray(question.options) || !question.options.length) question.options = ['Option 1', 'Option 2'];
    if (!Array.isArray(question.rows) || !question.rows.length) question.rows = ['Row 1'];
    if (!Array.isArray(question.columns) || !question.columns.length) question.columns = ['Column 1'];
    if (question.scaleMin === undefined || question.scaleMin === null || question.scaleMin === '') question.scaleMin = 1;
    if (question.scaleMax === undefined || question.scaleMax === null || question.scaleMax === '') question.scaleMax = 5;
    if (question.type === 'yesno') question.options = ['Yes', 'No'];
  }

  function templateForm(name) {
    const form = blankForm();
    const templates = {
      inspection: ['Roof Inspection', 'Field inspection checklist with ratings, notes, photos, and signoff.', 'Inspection', [
        ['short', 'Site or roof section inspected'],
        ['rating', 'Overall condition rating'],
        ['checkboxes', 'Observed issues', ['Leak evidence', 'Damaged flashing', 'Missing shingles', 'Soft decking']],
        ['file', 'Photo set or Files link'],
        ['signature', 'Inspector acknowledgement']
      ]],
      survey: ['Client Satisfaction Survey', 'Client feedback after a completed service or milestone.', 'Survey', [
        ['rating', 'How satisfied are you with the service?'],
        ['multiple', 'Would you recommend us?', ['Yes', 'Maybe', 'No']],
        ['paragraph', 'What should we improve?'],
        ['yesno', 'May we contact you for follow-up?']
      ]],
      approval: ['Estimate Approval', 'Client approval for scope, estimate, and next step authorization.', 'Approval', [
        ['short', 'Approver name'],
        ['multiple', 'Approval decision', ['Approved', 'Approved with changes', 'Rejected']],
        ['paragraph', 'Requested changes or notes'],
        ['signature', 'I confirm this approval']
      ]],
      intake: ['Service Intake', 'Capture a new request before it becomes a job workspace.', 'Intake', [
        ['short', 'Client or company name'],
        ['dropdown', 'Request type', ['Roof leak', 'Inspection', 'Estimate', 'Repair', 'Other']],
        ['multiple', 'Urgency', ['Low', 'Medium', 'High', 'Urgent']],
        ['paragraph', 'Describe the request'],
        ['file', 'Photos or documents']
      ]]
    };
    const selected = templates[name] || templates.inspection;
    form.title = selected[0];
    form.description = selected[1];
    form.type = selected[2];
    form.questions = selected[3].map((item) => {
      const question = blankQuestion(item[0]);
      question.label = item[1];
      if (item[2]) question.options = item[2];
      question.required = ['short', 'multiple', 'signature'].includes(item[0]);
      return question;
    });
    return form;
  }

  function selectedQuestion() {
    return draft.questions.find((question) => question.id === selectedQuestionId) || null;
  }

  function setMetric(name, value) {
    const node = center.querySelector('[data-form-metric="' + name + '"]');
    if (node) node.textContent = String(value);
  }

  function setState(message, state) {
    nodes.state.textContent = message;
    nodes.state.className = 'sync-pill' + (state ? ' ' + state : '');
  }

  function switchTab(name) {
    center.querySelector('[data-tab="' + name + '"]')?.click();
  }

  function setEditorMode(mode) {
    if (!nodes.builderGrid) return;
    nodes.builderGrid.dataset.formEditorMode = mode;
    center.querySelectorAll('[data-form-editor-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.formEditorTab === mode);
    });
  }

  function pill(label, value) {
    return '<span><strong>' + escapeHtml(label) + '</strong><small>' + escapeHtml(value ?? '') + '</small></span>';
  }

  function formatAnswer(value) {
    if (Array.isArray(value)) return value.map((item) => typeof item === 'object' && item ? item.row + ': ' + formatAnswer(item.value) : item).join(', ');
    return value || 'No answer';
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : 'Not saved';
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  }
})();(() => {
  const overlay = document.querySelector('[data-tour-overlay]');
  if (!overlay) return;

  const storageKey = 'quest-hq-tour-workflow-v15';
  const moduleId = document.body.dataset.module || '';
  const nodes = {
    card: overlay.querySelector('[data-tour-card]'),
    spotlight: overlay.querySelector('[data-tour-spotlight]'),
    count: overlay.querySelector('[data-tour-count]'),
    progress: overlay.querySelector('[data-tour-progress]'),
    title: overlay.querySelector('[data-tour-title]'),
    body: overlay.querySelector('[data-tour-body]'),
    back: overlay.querySelector('[data-tour-back]'),
    next: overlay.querySelector('[data-tour-next]'),
    skip: overlay.querySelector('[data-tour-skip]')
  };
  let index = 0;
  let steps = [];

  const commonSteps = [
    { selector: '.brand', title: 'Quest HQ Command Shell', body: 'Start here: Quest HQ is the business command layer. It owns companies, job workspaces, files, analytics, and the context that TaskManagement needs.' },
    { selector: '.nav-list', title: 'Live vs Planned Modules', body: 'The clickable modules are live for this demo. Grey modules are intentionally marked planned so the presenter can explain the roadmap without showing fake systems.' },
    { selector: '.build-badge', title: 'Presentation Build', body: 'This badge confirms the loaded version. If someone has a stale browser tab, the badge makes cache issues obvious.' }
  ];

  const pageSteps = {
    command: [
      { selector: '.metric-grid', title: 'Operations Snapshot', body: 'These cards roll up real Job Center data: active job workspaces, urgency, linked task counts, and pipeline value. Analytics details are moved to the Analytics page to keep this dashboard clean.' },
      { selector: '.ops-job-list', title: 'Recent Job Workspaces', body: 'Saved jobs appear here as business workspaces. They are not task lists; they are containers for client, site, files, finance, forms, and handoff context.' },
      { selector: '.quick-action-grid', title: 'Start the Workflow', body: 'For the demo path, use Add Job Workspace first, then open Files or Task Bridge from that selected job context.' },
      { selector: '.activity-feed', title: 'Activity Feed', body: 'The feed shows business-level activity from Quest HQ. Detailed execution history remains inside TaskManagement once the bridge is fully connected.' }
    ],
    jobs: [
      { selector: '[data-job-new]', title: 'Create the Workspace', body: 'This button starts a new business workspace. It should feel like creating a client/project space, not creating a task.', action: 'closeJobModal' },
      { selector: '[data-job-modal]', title: 'Creation Opens in Place', body: 'The form opens as a modal so the presenter stays in the Job Center. Clicking Add does not create a card until Save Workspace is pressed.', action: 'openJobModal' },
      { selector: 'input[name="name"]', title: 'Workspace Name', body: 'Name the space after the client, site, or project. Example: "Mesa Storage Roof Repair". This becomes the parent container for everything else.' },
      { selector: 'select[name="company_id"]', title: 'Company Ownership', body: 'Each workspace belongs to a company from Admin. This prevents hard-coded companies and prepares the app for multi-company deployment.' },
      { selector: 'input[name="client_name"]', title: 'Client and Contact Context', body: 'Client, contact, owner, and site fields describe the business relationship. These are not execution tasks; they identify who and what the workspace is for.' },
      { selector: 'select[name="stage"]', title: 'Business Status', body: 'Status is business pipeline state: Lead, Site Review, Estimate, Approved, Active, or Closed. Task status belongs in TaskManagement.' },
      { selector: 'textarea[name="scope"]', title: 'Scope and Notes', body: 'Scope gives the workspace enough context for files, forms, finance, and task handoff. Keep the actual checklist or assignments in TaskManagement.' },
      { selector: '.job-modal-panel .form-actions', title: 'Save Writes to Supabase', body: 'Save Workspace is the write action. After saving, the job appears on the board, gets an id, and that id becomes the integration key for files and TaskManagement.' },
      { selector: '.job-board', title: 'Pipeline Board', body: 'After Save, the card appears in the correct business stage. The board is for operational visibility, not daily task execution.', action: 'closeJobModal' },
      { selector: '[data-tab="list"]', title: 'Searchable Job List', body: 'The list view is for scanning and filtering all saved workspaces. It uses the same Supabase job records as the board.' },
      { selector: '[data-panel="profile"]', title: 'Job Profile', body: 'The profile is the central hub for a selected job. It shows client, site, scope, owner, stage, finance summary, file summary, and handoff context.', action: 'openProfileTab' },
      { selector: '[data-job-profile]', title: 'Connected Panels', body: 'From the profile, Files opens the file cabinet for this job, Finance/Forms stay as demo summaries, and TaskManagement receives the job id as project_id.' },
      { selector: '[data-job-sidecar]', title: 'Business Rollups', body: 'The side panel keeps lightweight rollups visible without turning Quest HQ into a second task manager.' }
    ],
    files: [
      { selector: '.drive-header', title: 'Google Drive-Style File Center', body: 'The File Center behaves like a job-aware drive: search, category filter, refresh, and New upload are always available.' },
      { selector: '.drive-sidebar', title: 'Drive Filters', body: 'My Drive shows job folders. Recent, Images, and Documents let the presenter explain how field photos, permits, contracts, and drawings will be found later.' },
      { selector: '[data-drive-folders]', title: 'Job Folders', body: 'Every saved job workspace becomes a folder. Files should be attached to a job, not dumped into an unstructured bucket.' },
      { selector: '[data-file-open-upload]', title: 'Upload Starts Here', body: 'New opens the upload modal. The upload should feel like adding files into the selected job space.', action: 'closeFileModal' },
      { selector: '[data-file-modal]', title: 'Upload Modal', body: 'The modal keeps upload in context. It does not navigate away from the file browser during the presentation.', action: 'openFileModal' },
      { selector: '[data-file-upload-form] input[type="file"]', title: 'Choose Files', body: 'The presenter can select photos, PDFs, drawings, or other documents. Supabase Storage stores the object, and job_files stores metadata.' },
      { selector: '[data-file-upload-form] select[name="category"]', title: 'Categorize Immediately', body: 'Category drives filtering and thumbnails. Photos render previews; documents render file-type cards.' },
      { selector: '[data-file-upload-form] textarea[name="notes"]', title: 'Add Field Context', body: 'Notes capture inspection angle, permit revision, invoice context, or drawing details so files stay useful after upload.' },
      { selector: '.drive-details-pane', title: 'Preview and Metadata', body: 'Selecting a file shows preview, category, storage path, job link, uploader, and action buttons like download or delete.', action: 'closeFileModal' }
    ],
    forms: [
      { selector: '.forms-command', title: 'Forms Command Bar', body: 'This is a local-first Google Forms style builder for inspections, approvals, surveys, intakes, and checklists.' },
      { selector: '[data-form-new]', title: 'Create Without Saving Junk', body: 'New Form opens a modal draft. It does not create a saved record until Save Form is pressed.' },
      { selector: '[data-form-modal]', title: 'Builder Modal', body: 'The builder opens in place with settings, question list, and question editing so the presenter does not lose the Forms page context.', action: 'openFormModal' },
      { selector: '[data-form-settings]', title: 'Form Settings', body: 'Set title, description, type, status, audience, job context, email capture, and internal review requirements.' },
      { selector: '.question-panel', title: 'Question Builder', body: 'Add short answers, paragraphs, multiple choice, checkboxes, dropdowns, ratings, dates, signatures, and file requests.' },
      { selector: '[data-panel="preview"]', title: 'Preview and Collect', body: 'Preview renders the form as a respondent will see it and can save local test responses for the demo.', action: 'openFormsPreview' },
      { selector: '[data-panel="responses"]', title: 'Response Inbox', body: 'Saved responses appear here for review. Later this can become Supabase-backed with public URLs and auth.', action: 'openFormsResponses' },
      { selector: '[data-panel="templates"]', title: 'Templates', body: 'Templates are quick-start builders, not fake saved data. Applying one creates an unsaved draft that can be edited before saving.', action: 'openFormsTemplates' }
    ],
    dashboards: [
      { selector: '.metric-grid', title: 'Analytics Lives Here', body: 'Instead of bloating every page with metric cards, deeper reporting is centralized here.' },
      { selector: '.analytics-layout', title: 'Live Job Reporting', body: 'This page summarizes jobs by status, urgency, scope, and module health. It is the place to discuss operations performance.' }
    ],
    admin: [
      { selector: '[data-company-admin]', title: 'Company Setup', body: 'Companies are managed here first. Job workspaces reference those company records instead of hard-coded demo companies.' },
      { selector: '[data-company-form]', title: 'Company Creation', body: 'Create or edit companies here, then use them in Job Center. This is the start of the future multi-company access model.' }
    ],
    'task-bridge': [
      { selector: '.bridge-hero', title: 'Why This Is Not Another Task Manager', body: 'Quest HQ keeps the job context. TaskManagement remains where assignments, checklists, and execution happen.' },
      { selector: '.bridge-contract', title: 'Integration Contract', body: 'The important handoff is stable: job.id becomes task.project_id, and return_url brings users back to the Quest HQ job profile.' },
      { selector: '.bridge-task-list', title: 'Current Bridge Behavior', body: 'Today this page proves the contract and rollup shape. Once the real TaskManagement deployment is connected, it will filter tasks by project_id.' }
    ]
  };

  function collectSteps() {
    const all = commonSteps.concat(pageSteps[moduleId] || [
      { selector: '.main', title: 'Module Workspace', body: 'This area shows the current module. Planned modules stay visibly disabled until they receive real implementation.' }
    ]);
    return all.filter((step) => document.querySelector(step.selector));
  }

  function openTour(force) {
    steps = collectSteps();
    if (!steps.length) return;
    if (!force && localStorage.getItem(storageKey) === 'done') return;
    index = 0;
    overlay.hidden = false;
    document.body.classList.add('tour-open');
    renderProgressTrack();
    renderStep();
  }

  function closeTour(saveState) {
    overlay.hidden = true;
    document.body.classList.remove('tour-open');
    if (saveState) localStorage.setItem(storageKey, 'done');
  }

  function renderStep() {
    const step = steps[index];
    if (!step) return closeTour(true);
    prepareStep(step);
    const element = document.querySelector(step.selector);
    if (!element) {
      index = Math.min(index + 1, steps.length);
      return renderStep();
    }
    element.scrollIntoView({ block: 'center', inline: 'nearest' });
    requestAnimationFrame(() => {
      placeSpotlight(element);
      placeCard(element);
    });
    nodes.count.textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
    updateProgressTrack();
    nodes.title.textContent = step.title;
    nodes.body.textContent = step.body;
    nodes.back.disabled = index === 0;
    nodes.next.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
  }

  function renderProgressTrack() {
    if (!nodes.progress) return;
    nodes.progress.style.setProperty('--tour-steps', steps.length);
    nodes.progress.innerHTML = steps.map((_, stepIndex) => '<span data-tour-progress-step="' + stepIndex + '"></span>').join('');
  }

  function updateProgressTrack() {
    if (!nodes.progress) return;
    nodes.progress.querySelectorAll('[data-tour-progress-step]').forEach((item, stepIndex) => {
      item.classList.toggle('done', stepIndex < index);
      item.classList.toggle('active', stepIndex === index);
    });
  }

  function prepareStep(step) {
    if (step.action === 'openJobModal' && document.querySelector('[data-job-modal]')?.hidden) {
      document.querySelector('[data-job-new]')?.click();
    }
    if (step.action === 'closeJobModal' && !document.querySelector('[data-job-modal]')?.hidden) {
      document.querySelector('[data-job-modal-close]')?.click();
    }
    if (step.action === 'openProfileTab') {
      document.querySelector('[data-tab="profile"]')?.click();
    }
    if (step.action === 'openFileModal' && document.querySelector('[data-file-modal]')?.hidden) {
      document.querySelector('[data-file-open-upload]')?.click();
    }
    if (step.action === 'closeFileModal' && !document.querySelector('[data-file-modal]')?.hidden) {
      document.querySelector('[data-file-modal-close]')?.click();
    }
    if (step.action === 'openFormModal' && document.querySelector('[data-form-modal]')?.hidden) document.querySelector('[data-form-new]')?.click();
    if (step.action === 'openFormsPreview') document.querySelector('[data-tab="preview"]')?.click();
    if (step.action === 'openFormsResponses') document.querySelector('[data-tab="responses"]')?.click();
    if (step.action === 'openFormsTemplates') {
      if (!document.querySelector('[data-form-modal]')?.hidden) document.querySelector('[data-form-modal-close]')?.click();
      document.querySelector('[data-tab="templates"]')?.click();
    }
  }

  function placeSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const pad = 8;
    Object.assign(nodes.spotlight.style, {
      left: Math.max(10, rect.left - pad) + 'px',
      top: Math.max(10, rect.top - pad) + 'px',
      width: Math.min(window.innerWidth - 20, rect.width + pad * 2) + 'px',
      height: Math.min(window.innerHeight - 20, rect.height + pad * 2) + 'px'
    });
  }

  function placeCard(element) {
    if (window.innerWidth <= 820) return;
    const rect = element.getBoundingClientRect();
    const cardWidth = nodes.card.offsetWidth || 420;
    const cardHeight = nodes.card.offsetHeight || 260;
    let left = rect.right + 18;
    let top = rect.top;
    if (left + cardWidth > window.innerWidth - 16) left = rect.left - cardWidth - 18;
    if (left < 16) left = window.innerWidth - cardWidth - 16;
    if (top + cardHeight > window.innerHeight - 16) top = window.innerHeight - cardHeight - 16;
    if (top < 16) top = 16;
    nodes.card.style.left = left + 'px';
    nodes.card.style.top = top + 'px';
  }

  nodes.next.addEventListener('click', () => {
    if (index >= steps.length - 1) return closeTour(true);
    index += 1;
    renderStep();
  });
  nodes.back.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    renderStep();
  });
  nodes.skip.addEventListener('click', () => closeTour(true));
  document.querySelectorAll('[data-tour-start]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem(storageKey);
      openTour(true);
    });
  });
  window.addEventListener('resize', () => {
    if (!overlay.hidden) renderStep();
  });
  window.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') closeTour(true);
    if (event.key === 'ArrowRight') nodes.next.click();
    if (event.key === 'ArrowLeft' && !nodes.back.disabled) nodes.back.click();
  });

  setTimeout(() => openTour(false), 650);
})();