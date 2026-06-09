(() => {
  const storageKey = (moduleId) => 'quest-hq-static-' + moduleId;
  const seed = JSON.parse(document.getElementById('record-seed')?.textContent || '[]');
  document.querySelectorAll('.tabs').forEach((tabs) => {
    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;
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
  const lanes = ['Lead', 'Inspection', 'Estimate Approved', 'Production', 'QA Review'];
  const fields = ['id','name','company_id','client_name','contact_name','site_address','job_type','stage','priority','owner_name','scope','start_date','due_date','estimate_total','invoice_total','task_count','file_count','notes'];
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nodes = {
    sync: center.querySelector('[data-job-sync]'),
    board: center.querySelector('[data-job-board]'),
    table: center.querySelector('[data-job-table]'),
    count: center.querySelector('[data-job-count]'),
    profile: center.querySelector('[data-job-profile]'),
    sidecar: center.querySelector('[data-job-sidecar]'),
    form: center.querySelector('[data-job-form]'),
    search: center.querySelector('[data-job-search]'),
    stage: center.querySelector('[data-job-stage-filter]')
  };

  let supabaseClient = null;
  let jobs = loadLocal();
  let selectedId = new URLSearchParams(window.location.search).get('job_id') || jobs[0]?.id || null;
  let source = 'local';

  init();

  async function init() {
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
    await refreshFromSupabase();
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
    if (!jobs.length) jobs = loadLocal();
    selectedId = selectedId && jobs.some((job) => job.id === selectedId) ? selectedId : jobs[0]?.id || null;
    saveLocal();
    setSync('Supabase live', 'live');
    render();
  }

  function bindEvents() {
    center.querySelector('[data-job-new]')?.addEventListener('click', () => {
      const job = blankJob();
      jobs.unshift(job);
      selectedId = job.id;
      saveLocal();
      render();
      clickTab('editor');
    });
    center.querySelector('[data-job-refresh]')?.addEventListener('click', () => refreshFromSupabase());
    nodes.search?.addEventListener('input', render);
    nodes.stage?.addEventListener('change', render);
    nodes.board?.addEventListener('click', selectFromClick);
    nodes.table?.addEventListener('click', selectFromClick);
    nodes.form?.addEventListener('submit', saveJob);
    center.querySelector('[data-job-duplicate]')?.addEventListener('click', duplicateJob);
    center.querySelector('[data-job-delete]')?.addEventListener('click', deleteJob);
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      center.querySelector('[data-job-new]')?.click();
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
        setSync('Saved locally', 'error');
      } else {
        const saved = normalizeJob(data);
        if (existingIndex >= 0) jobs[existingIndex] = saved;
        else jobs.unshift(saved);
        selectedId = saved.id;
        source = 'supabase';
        setSync('Supabase live', 'live');
        saveLocal();
        render();
        return;
      }
    }
    if (existingIndex >= 0) jobs[existingIndex] = payload;
    else jobs.unshift(payload);
    selectedId = payload.id;
    saveLocal();
    render();
  }

  async function deleteJob() {
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
  }

  function duplicateJob() {
    const job = selectedJob();
    if (!job) return;
    const copy = { ...job, id: 'local-' + Date.now(), name: job.name + ' Copy', stage: 'Lead' };
    jobs.unshift(copy);
    selectedId = copy.id;
    saveLocal();
    render();
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
    center.querySelector('[data-job-metric="active"]').textContent = String(jobs.filter((job) => job.stage !== 'Complete').length);
    center.querySelector('[data-job-metric="urgent"]').textContent = String(jobs.filter((job) => job.priority === 'Urgent').length);
    center.querySelector('[data-job-metric="tasks"]').textContent = String(sum('task_count'));
    center.querySelector('[data-job-metric="revenue"]').textContent = money.format(sum('estimate_total'));
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
        '<span>' + number(job.task_count) + ' tasks</span>' +
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
      detail('Owner', job.owner_name || 'Unassigned') +
      detail('Site', job.site_address || 'No address') +
      detail('Stage', job.stage || 'Lead') +
      detail('Priority', job.priority || 'Medium') +
      detail('Estimate', money.format(number(job.estimate_total))) +
      detail('Invoice', money.format(number(job.invoice_total))) +
      detail('Due Date', job.due_date || 'Not set') +
      '</div>' +
      linkedPanels(job) +
      activityTimeline(job);
    nodes.sidecar.innerHTML = detail('TaskManagement Link', number(job.task_count) + ' linked tasks') +
      detail('Files', number(job.file_count) + ' files attached') +
      detail('Company', companyLabel(job.company_id)) +
      '<a class="secondary-button" href="' + escapeHtml(bridgeUrl(job)) + '">Open TaskManagement Bridge</a>' +
      '<button class="primary-button" type="button" data-edit-selected>Edit Job</button>';
    nodes.sidecar.querySelector('[data-edit-selected]')?.addEventListener('click', () => clickTab('editor'));
  }

  function linkedPanels(job) {
    const taskOpen = Math.max(number(job.task_count) - completedTasks(job), 0);
    const items = [
      ['TaskManagement', number(job.task_count) + ' tasks', taskOpen + ' open / ' + completedTasks(job) + ' done', bridgeUrl(job)],
      ['Files & Photos', number(job.file_count) + ' files', 'Photos, permits, estimates, invoices', 'files.html'],
      ['Forms & Inspections', inspectionCount(job) + ' records', 'Inspection, approval, walkthrough', 'forms.html'],
      ['Finance', money.format(number(job.invoice_total)) + ' invoiced', money.format(number(job.estimate_total)) + ' estimate', 'finance.html']
    ];
    return '<div class="linked-panel-grid">' + items.map((item) => '<a href="' + escapeHtml(item[3]) + '"><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span><small>' + escapeHtml(item[2]) + '</small></a>').join('') + '</div>';
  }

  function activityTimeline(job) {
    const items = [
      ['Job updated', job.stage + ' stage is current'],
      ['Task rollup synced', number(job.task_count) + ' linked tasks mapped through project_id'],
      ['Files reviewed', number(job.file_count) + ' attached job files available in the file cabinet'],
      ['Finance checked', money.format(number(job.estimate_total)) + ' estimate visible to operations']
    ];
    return '<section class="job-activity-panel"><div class="job-section-heading"><h2>Activity Timeline</h2><span>Demo feed</span></div>' + items.map((item) => '<div><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span></div>').join('') + '</section>';
  }

  function fillForm() {
    const job = selectedJob() || blankJob();
    fields.forEach((field) => {
      if (!nodes.form.elements[field]) return;
      nodes.form.elements[field].value = job[field] ?? '';
    });
  }

  function collectForm() {
    const data = Object.fromEntries(new FormData(nodes.form).entries());
    data.id = data.id || 'local-' + Date.now();
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
      company_id: job.company_id || 'quest-roofing',
      client_name: job.client_name || job.clients?.name || '',
      name: job.name || job.title || 'Untitled Job',
      contact_name: job.contact_name || '',
      site_address: job.site_address || '',
      job_type: job.job_type || 'Roofing',
      stage: job.stage || job.status || 'Lead',
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
      company_id: 'quest-roofing',
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

  function loadLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(localKey) || 'null');
      return Array.isArray(saved) && saved.length ? saved.map(normalizeJob) : seed.map(normalizeJob);
    } catch {
      return seed.map(normalizeJob);
    }
  }

  function saveLocal() {
    localStorage.setItem(localKey, JSON.stringify(jobs));
  }

  function setSync(message, state) {
    nodes.sync.textContent = message;
    nodes.sync.className = 'sync-pill' + (state ? ' ' + state : '');
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
    return ({ 'quest-roofing': 'Quest Roofing', 'quest-drafting': 'Quest Drafting', lumen: 'Lumen' })[id] || id || 'Quest Roofing';
  }

  function bridgeUrl(job) {
    const params = new URLSearchParams({
      project_id: job.id,
      return_url: new URL('jobs.html?job_id=' + encodeURIComponent(job.id) + '&tab=profile', window.location.href).toString()
    });
    return 'task-management.html?' + params.toString();
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
    if (!job) return;
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
    nodes.tasks.innerHTML = demoTasks(job, completed, open, overdue).map((task) => '<div><strong>' + escapeHtml(task.title) + '<span>' + escapeHtml(task.owner) + '</span></strong><span>' + escapeHtml(task.status) + '</span><b class="' + (task.status === 'Overdue' ? 'overdue' : '') + '">' + escapeHtml(task.due) + '</b></div>').join('');
    nodes.contract.innerHTML =
      contractRow('project_id', job.id) +
      contractRow('return_url', nodes.returnLink.href) +
      contractRow('source', mode === 'live' ? 'Quest HQ Supabase project' : 'Local demo fallback') +
      contractRow('future behavior', 'TaskManagement filters tasks where task.project_id matches this job id.');
  }

  function demoTasks(job, completed, open, overdue) {
    return [
      { title: 'Review job scope', owner: job.owner_name || 'Operations', status: completed > 0 ? 'Completed' : 'Open', due: 'Done' },
      { title: 'Attach field files', owner: 'Field Team', status: open > 1 ? 'Open' : 'Completed', due: job.due_date || 'This week' },
      { title: 'Finance handoff', owner: 'Finance', status: job.invoice_total > 0 ? 'Completed' : 'Open', due: 'Next' },
      { title: 'Resolve priority item', owner: job.owner_name || 'Operations', status: overdue ? 'Overdue' : 'Open', due: overdue ? 'Late' : 'Soon' }
    ].slice(0, Math.max(3, Math.min(4, number(job.task_count))));
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
    bridge.querySelector('[data-bridge-metric="' + name + '"]').textContent = String(value);
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
})();