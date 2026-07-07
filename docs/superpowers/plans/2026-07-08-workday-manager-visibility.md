# Workday Manager Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Manager View to Workday so owners and managers can see team activity, rep workload, and records needing attention without leaving Quest CRM.

**Architecture:** Extend the existing `workday` route instead of adding a new page. Keep current My Queue behavior intact, add derived manager helper functions in `src/main.js`, render a second Workday mode, and style it in `src/styles.css`. Use existing CRM data, task data, activity data, and navigation helpers; do not add Supabase tables.

**Tech Stack:** Vite SPA, vanilla JavaScript in `src/main.js`, CSS in `src/styles.css`, static Node tests in `tests/workday-crm-static.test.mjs`.

## Global Constraints

- Current `main` remains the source of truth.
- No new database tables for this pass.
- No destructive database work.
- Do not start a local dev server.
- Existing Workday My Queue, Contacts, Quotes, Jobs, Forms, Tasks, Proposals, and Activity behavior must keep working.
- Manager View must feel like a dispatch board, not a gamified scoreboard.

---

### Task 1: Manager Visibility Static Contract

**Files:**
- Modify: `tests/workday-crm-static.test.mjs`

**Interfaces:**
- Consumes: existing `src/main.js`, `src/styles.css`, and `scripts/production-smoke.mjs`.
- Produces: failing test coverage for Manager View state, helper functions, render functions, actions, and CSS.

- [x] **Step 1: Add failing tests**

Append these tests to `tests/workday-crm-static.test.mjs`:

```js
test('Workday exposes a manager view mode beside the rep queue', () => {
  assert.match(source, /workdayMode: 'queue'/);
  assert.match(source, /selectedWorkdayManagerRepId: ''/);
  assert.match(source, /workdayManagerAlertFilter: 'all'/);
  assert.match(source, /function renderWorkdayModeTabs\(/);
  assert.match(source, /My Queue/);
  assert.match(source, /Manager View/);
  assert.match(source, /data-action="set-workday-mode"/);
});

test('Workday manager helpers derive team visibility from existing CRM data', () => {
  assert.match(source, /function workdayRepVisibilityRows\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /function workdayManagerAlertItems\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /callsToday/);
  assert.match(source, /touchesToday/);
  assert.match(source, /openTasks/);
  assert.match(source, /overdueTasks/);
  assert.match(source, /noNextStep/);
  assert.match(source, /lastActivityAt/);
  assert.match(source, /Unassigned/);
});

test('Workday manager view renders team pulse rep visibility and attention alerts', () => {
  assert.match(source, /function renderWorkdayManagerView\(companyId\)/);
  assert.match(source, /Team Pulse/);
  assert.match(source, /Rep Visibility/);
  assert.match(source, /Needs Attention/);
  assert.match(source, /data-action="open-workday-rep"/);
  assert.match(source, /data-action="open-workday-alert"/);
  assert.match(source, /data-action="filter-workday-alerts"/);
});

test('Workday manager detail panel can focus one rep workload', () => {
  assert.match(source, /function renderWorkdayRepDetailPanel\(repRow, companyId\)/);
  assert.match(source, /Open workload/);
  assert.match(source, /Overdue follow-ups/);
  assert.match(source, /Records with no next step/);
});

test('Workday manager view has responsive non-overflow styling', () => {
  assert.match(styles, /\.workday-mode-tabs/);
  assert.match(styles, /\.workday-manager-view/);
  assert.match(styles, /\.workday-rep-table/);
  assert.match(styles, /\.workday-alert-list/);
  assert.match(styles, /\.workday-rep-detail/);
  assert.match(styles, /@media \(max-width: 980px\) \{[\s\S]*?\.workday-manager-view/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/workday-crm-static.test.mjs
```

Expected: FAIL with missing `workdayMode`, manager helper, renderer, action, and CSS assertions.

### Task 2: Add Manager State And Data Helpers

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `companyMembers(companyId)`, `companyActivities(companyId)`, `companyTasks(companyId)`, `companyContacts(companyId)`, `companyDeals(companyId)`, `companyJobs(companyId)`, `companyFormResponses(companyId)`, `workdayHasOpenNextStep(type, id)`, `workdayRecordUrl(record)`.
- Produces:
  - `state.workdayMode: 'queue' | 'manager'`
  - `state.selectedWorkdayManagerRepId: string`
  - `state.workdayManagerAlertFilter: string`
  - `workdayRepVisibilityRows(companyId = activeCompanyId()): Array<object>`
  - `workdayManagerAlertItems(companyId = activeCompanyId()): Array<object>`

- [x] **Step 1: Add state fields**

In the existing `state` object near `selectedWorkdayItemId`, add:

```js
  workdayMode: 'queue',
  selectedWorkdayManagerRepId: '',
  workdayManagerAlertFilter: 'all',
```

- [x] **Step 2: Add helper functions after `workdayManagerMetrics`**

Add:

```js
function workdayMemberKey(value) {
  return value || 'unassigned';
}

function workdayMemberLabel(memberId, companyId = activeCompanyId()) {
  if (!memberId || memberId === 'unassigned') return 'Unassigned';
  return memberName(memberId) || companyMembers(companyId).find((member) => member.id === memberId || member.profile_id === memberId)?.name || 'Unassigned';
}

function workdayActivityMemberId(activity, companyId = activeCompanyId()) {
  return workdayMemberKey(activity.member_id || activity.owner_id || activity.created_by || activeSession().profile.member_id || companyMembers(companyId)[0]?.id || '');
}

function workdayTaskMemberId(task) {
  return workdayMemberKey(task.assignee_id || task.creator_id || '');
}

function workdayRecordOwnerId(record, companyId = activeCompanyId()) {
  if (!record) return 'unassigned';
  const ownerName = String(record.owner_name || '').trim().toLowerCase();
  const member = companyMembers(companyId).find((item) => {
    return item.id === record.owner_id || item.profile_id === record.owner_id || String(item.name || '').trim().toLowerCase() === ownerName;
  });
  return workdayMemberKey(member?.id || record.owner_id || '');
}

function workdayRecordLastActivity(type, id) {
  return activitiesFor(type, id)[0]?.created_at || '';
}
```

- [x] **Step 3: Add rep visibility rows**

Add:

```js
function workdayRepVisibilityRows(companyId = activeCompanyId()) {
  const members = companyMembers(companyId).map((member) => ({
    id: member.id,
    name: member.name || member.email || 'Team member',
    email: member.email || '',
  }));
  const memberIds = new Set(members.map((member) => member.id));
  const rows = new Map(members.map((member) => [member.id, {
    ...member,
    callsToday: 0,
    emailsToday: 0,
    notesToday: 0,
    touchesToday: 0,
    completedTasksToday: 0,
    openTasks: 0,
    overdueTasks: 0,
    noNextStep: 0,
    lastActivityAt: '',
    status: 'Quiet',
    workload: [],
  }]));
  const ensureRow = (memberId) => {
    const key = workdayMemberKey(memberId);
    if (!rows.has(key)) {
      rows.set(key, {
        id: key,
        name: workdayMemberLabel(key, companyId),
        email: '',
        callsToday: 0,
        emailsToday: 0,
        notesToday: 0,
        touchesToday: 0,
        completedTasksToday: 0,
        openTasks: 0,
        overdueTasks: 0,
        noNextStep: 0,
        lastActivityAt: '',
        status: 'Quiet',
        workload: [],
      });
    }
    return rows.get(key);
  };

  companyActivities(companyId).forEach((activity) => {
    const row = ensureRow(workdayActivityMemberId(activity, companyId));
    if (isTodayDate(activity.completed_at || activity.created_at)) {
      if (activity.type === 'call') row.callsToday += 1;
      if (activity.type === 'email') row.emailsToday += 1;
      if (activity.type === 'note') row.notesToday += 1;
      row.touchesToday += 1;
    }
    if (!row.lastActivityAt || Date.parse(activity.created_at || 0) > Date.parse(row.lastActivityAt || 0)) row.lastActivityAt = activity.created_at || '';
  });

  companyTasks(companyId).forEach((task) => {
    const row = ensureRow(workdayTaskMemberId(task));
    if (isOpenTask(task)) {
      row.openTasks += 1;
      if (daysUntil(task.due) < 0) row.overdueTasks += 1;
      row.workload.push({ type: 'task', id: task.id, title: task.title, reason: task.due ? `Due ${formatDate(task.due)}` : 'Open task' });
    } else if (isTodayDate(task.updated_at || task.completed_at)) {
      row.completedTasksToday += 1;
    }
  });

  const ownedRecords = [
    ...companyContacts(companyId).map((record) => ({ type: 'contact', record })),
    ...companyDeals(companyId).filter((record) => record.status === 'open').map((record) => ({ type: 'deal', record })),
    ...companyJobs(companyId).map((record) => ({ type: 'job', record })),
  ];
  ownedRecords.forEach(({ type, record }) => {
    const row = ensureRow(workdayRecordOwnerId(record, companyId));
    if (!workdayHasOpenNextStep(type, record.id)) {
      row.noNextStep += 1;
      row.workload.push({ type, id: record.id, title: workdayRecordLabel(record, type), reason: 'No open next step' });
    }
  });

  return Array.from(rows.values())
    .filter((row) => memberIds.has(row.id) || row.openTasks || row.overdueTasks || row.noNextStep || row.touchesToday)
    .map((row) => ({
      ...row,
      status: row.overdueTasks ? 'Needs help' : row.touchesToday ? 'Active' : row.openTasks || row.noNextStep ? 'Watch' : 'Quiet',
    }))
    .sort((a, b) => b.overdueTasks - a.overdueTasks || b.noNextStep - a.noNextStep || b.touchesToday - a.touchesToday || a.name.localeCompare(b.name));
}
```

- [x] **Step 4: Add manager alert items**

Add:

```js
function workdayManagerAlertItems(companyId = activeCompanyId()) {
  const alerts = [];
  companyTasks(companyId).filter((task) => isOpenTask(task) && daysUntil(task.due) < 0).forEach((task) => {
    alerts.push({
      id: `overdue:${task.id}`,
      type: 'overdue',
      severity: 100,
      title: task.title || 'Overdue task',
      owner: workdayMemberLabel(workdayTaskMemberId(task), companyId),
      reason: `Past due since ${formatDate(task.due)}`,
      record: { ...task, type: 'task' },
    });
  });
  companyContacts(companyId).filter((contact) => ['Hot', 'Warm'].includes(contact.temperature) && !workdayHasOpenNextStep('contact', contact.id)).forEach((contact) => {
    alerts.push({
      id: `contact-next:${contact.id}`,
      type: 'no_next_step',
      severity: contact.temperature === 'Hot' ? 92 : 78,
      title: contact.name || 'Contact',
      owner: workdayMemberLabel(workdayRecordOwnerId(contact, companyId), companyId),
      reason: `${contact.temperature} contact has no next step`,
      record: { ...contact, type: 'contact' },
    });
  });
  companyDeals(companyId).filter((deal) => deal.status === 'open' && !workdayHasOpenNextStep('deal', deal.id)).forEach((deal) => {
    alerts.push({
      id: `deal-next:${deal.id}`,
      type: 'no_next_step',
      severity: 74,
      title: deal.name || 'Quote',
      owner: workdayMemberLabel(workdayRecordOwnerId(deal, companyId), companyId),
      reason: 'Open quote has no next task',
      record: { ...deal, type: 'deal' },
    });
  });
  companyJobs(companyId).filter((job) => !workdayHasOpenNextStep('job', job.id)).forEach((job) => {
    alerts.push({
      id: `job-next:${job.id}`,
      type: 'no_next_step',
      severity: 66,
      title: job.name || job.client_name || 'Job',
      owner: workdayMemberLabel(workdayRecordOwnerId(job, companyId), companyId),
      reason: 'Production job has no next step',
      record: { ...job, type: 'job' },
    });
  });
  companyFormResponses(companyId).forEach((response) => {
    alerts.push({
      id: `response:${response.id}`,
      type: 'new_response',
      severity: 70,
      title: formById(response.form_id)?.title || 'Form response',
      owner: response.submitter_email || 'Customer',
      reason: 'Response needs CRM action',
      record: { ...response, type: 'form_response' },
    });
  });
  return alerts.sort((a, b) => b.severity - a.severity || a.title.localeCompare(b.title));
}
```

- [x] **Step 5: Run focused test**

Run:

```powershell
node --test tests/workday-crm-static.test.mjs
```

Expected: still FAIL because rendering and CSS are not implemented yet.

### Task 3: Render Manager View

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `workdayManagerMetrics(companyId)`, `workdayRepVisibilityRows(companyId)`, `workdayManagerAlertItems(companyId)`.
- Produces:
  - `renderWorkdayModeTabs(): string`
  - `renderWorkdayManagerView(companyId): string`
  - `renderWorkdayRepRow(row): string`
  - `renderWorkdayManagerAlert(alert): string`
  - `renderWorkdayRepDetailPanel(repRow, companyId): string`

- [x] **Step 1: Add mode tabs**

Add before `renderWorkdayPage`:

```js
function renderWorkdayModeTabs() {
  return `
    <div class="workday-mode-tabs" role="tablist" aria-label="Workday view">
      <button class="${state.workdayMode === 'queue' ? 'active' : ''}" type="button" data-action="set-workday-mode" data-mode="queue">My Queue</button>
      <button class="${state.workdayMode === 'manager' ? 'active' : ''}" type="button" data-action="set-workday-mode" data-mode="manager">Manager View</button>
    </div>
  `;
}
```

- [x] **Step 2: Update `renderWorkdayPage`**

Inside `renderWorkdayPage(companyId)`, render the tabs after `workspaceHeader(...)` and before the existing content. Wrap the existing queue UI in:

```js
${renderWorkdayModeTabs()}
${state.workdayMode === 'manager' ? renderWorkdayManagerView(companyId) : `
  <div class="workday-manager-grid">
    ...
  </div>
  <div class="workday-shell">
    ...
  </div>
`}
```

Keep the existing `My Queue` HTML unchanged inside the queue branch.

- [x] **Step 3: Add manager view renderer**

Add:

```js
function renderWorkdayManagerView(companyId) {
  const metrics = workdayManagerMetrics(companyId);
  const rows = workdayRepVisibilityRows(companyId);
  const alerts = workdayManagerAlertItems(companyId);
  const filter = state.workdayManagerAlertFilter || 'all';
  const visibleAlerts = filter === 'all' ? alerts : alerts.filter((alert) => alert.type === filter);
  const selectedRow = rows.find((row) => row.id === state.selectedWorkdayManagerRepId) || rows[0] || null;
  if (selectedRow && state.selectedWorkdayManagerRepId !== selectedRow.id) state.selectedWorkdayManagerRepId = selectedRow.id;
  return `
    <section class="workday-manager-view">
      <div class="workday-manager-grid">
        ${workdayMetricCard('Calls today', metrics.callsToday, 'Logged call activity', 'ti-phone-call')}
        ${workdayMetricCard('Touched today', metrics.touchedToday, 'Records worked today', 'ti-activity')}
        ${workdayMetricCard('Overdue follow-ups', metrics.overdueFollowups, 'Open tasks past due', 'ti-alert-circle')}
        ${workdayMetricCard('No next step', metrics.noNextStep, 'Records missing an open task', 'ti-route')}
        ${workdayMetricCard('Form responses', metrics.formResponsesNeedingAction, 'Need CRM action', 'ti-clipboard-list')}
      </div>
      <div class="workday-manager-layout">
        <section class="panel">
          <div class="section-head"><div><h2>Rep Visibility</h2><p>${rows.length} active workspace member${rows.length === 1 ? '' : 's'}</p></div></div>
          <div class="workday-rep-table">
            ${rows.map(renderWorkdayRepRow).join('') || emptyState('No team activity yet today.')}
          </div>
        </section>
        ${renderWorkdayRepDetailPanel(selectedRow, companyId)}
        <section class="panel">
          <div class="section-head"><div><h2>Needs Attention</h2><p>${visibleAlerts.length} alert${visibleAlerts.length === 1 ? '' : 's'}</p></div></div>
          <div class="workday-alert-filters">
            ${[
              ['all', 'All'],
              ['overdue', 'Overdue'],
              ['no_next_step', 'No next step'],
              ['new_response', 'Responses'],
            ].map(([id, label]) => `<button class="${filter === id ? 'active' : ''}" type="button" data-action="filter-workday-alerts" data-filter="${h(id)}">${h(label)}</button>`).join('')}
          </div>
          <div class="workday-alert-list">
            ${visibleAlerts.map(renderWorkdayManagerAlert).join('') || emptyState('No manager alerts for this filter.')}
          </div>
        </section>
      </div>
    </section>
  `;
}
```

- [x] **Step 4: Add row and alert renderers**

Add:

```js
function renderWorkdayRepRow(row) {
  return `
    <button class="workday-rep-row ${state.selectedWorkdayManagerRepId === row.id ? 'active' : ''}" type="button" data-action="open-workday-rep" data-rep-id="${h(row.id)}">
      <span><strong>${h(row.name)}</strong><small>${h(row.status)}</small></span>
      <span>${h(String(row.callsToday))}<small>Calls</small></span>
      <span>${h(String(row.touchesToday))}<small>Touches</small></span>
      <span>${h(String(row.openTasks))}<small>Tasks</small></span>
      <span>${h(String(row.overdueTasks))}<small>Overdue</small></span>
      <span>${h(row.lastActivityAt ? relativeTime(row.lastActivityAt) : 'No activity')}<small>Last activity</small></span>
    </button>
  `;
}

function renderWorkdayManagerAlert(alert) {
  return `
    <button class="workday-alert-item" type="button" data-action="open-workday-alert" data-alert-id="${h(alert.id)}">
      <span class="workday-kind">${h(alert.type.replaceAll('_', ' '))}</span>
      <span><strong>${h(alert.title)}</strong><small>${h(alert.reason)}</small></span>
      <span class="workday-owner">${h(alert.owner)}</span>
    </button>
  `;
}
```

- [x] **Step 5: Add rep detail panel**

Add:

```js
function renderWorkdayRepDetailPanel(repRow, companyId) {
  if (!repRow) return `<section class="workday-rep-detail panel">${emptyState('Select a rep to see workload.')}</section>`;
  const overdue = repRow.workload.filter((item) => item.type === 'task' && /due/i.test(item.reason || ''));
  const noNextStep = repRow.workload.filter((item) => item.reason === 'No open next step');
  return `
    <section class="workday-rep-detail panel">
      <div class="section-head"><div><h2>${h(repRow.name)}</h2><p>Open workload</p></div></div>
      <div class="workday-rep-detail-grid">
        <span><strong>${h(String(repRow.callsToday))}</strong><small>Calls today</small></span>
        <span><strong>${h(String(repRow.touchesToday))}</strong><small>Touches today</small></span>
        <span><strong>${h(String(repRow.openTasks))}</strong><small>Open tasks</small></span>
        <span><strong>${h(String(repRow.noNextStep))}</strong><small>No next step</small></span>
      </div>
      <h3>Overdue follow-ups</h3>
      <div class="workday-mini-list">${overdue.slice(0, 5).map((item) => `<button type="button" data-action="open-workday-rep-workload" data-record-type="${h(item.type)}" data-record-id="${h(item.id)}">${h(item.title)}<small>${h(item.reason)}</small></button>`).join('') || '<div class="sf-task-empty">No overdue follow-ups.</div>'}</div>
      <h3>Records with no next step</h3>
      <div class="workday-mini-list">${noNextStep.slice(0, 5).map((item) => `<button type="button" data-action="open-workday-rep-workload" data-record-type="${h(item.type)}" data-record-id="${h(item.id)}">${h(item.title)}<small>${h(item.reason)}</small></button>`).join('') || '<div class="sf-task-empty">No missing next steps.</div>'}</div>
    </section>
  `;
}
```

- [x] **Step 6: Run focused test**

Run:

```powershell
node --test tests/workday-crm-static.test.mjs
```

Expected: still FAIL until actions and CSS are added.

### Task 4: Wire Manager Actions

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Consumes: manager view DOM actions from Task 3.
- Produces:
  - `openWorkdayManagerAlert(alertId): void`
  - `openWorkdayRepWorkload(type, id): void`

- [x] **Step 1: Add action helpers**

Add near `workdayOpenRecord`:

```js
function openWorkdayManagerAlert(alertId) {
  const alert = workdayManagerAlertItems(activeCompanyId()).find((item) => item.id === alertId);
  if (!alert?.record) return;
  navigate(workdayRecordUrl(alert.record));
}

function openWorkdayRepWorkload(type, id) {
  if (type === 'task') return navigate(workdayRecordUrl({ ...taskById(id), type: 'task' }));
  if (type === 'contact') return navigate(workdayRecordUrl({ ...contactById(id), type: 'contact' }));
  if (type === 'deal') return navigate(workdayRecordUrl({ ...dealById(id), type: 'deal' }));
  if (type === 'job') return navigate(workdayRecordUrl({ ...jobById(id), type: 'job' }));
}
```

- [x] **Step 2: Add action handlers in `handleAction`**

Add near the existing Workday action handlers:

```js
  if (action === 'set-workday-mode') {
    event.preventDefault();
    state.workdayMode = node.dataset.mode === 'manager' ? 'manager' : 'queue';
    render();
    return;
  }
  if (action === 'open-workday-rep') {
    event.preventDefault();
    state.selectedWorkdayManagerRepId = node.dataset.repId || '';
    state.workdayMode = 'manager';
    render();
    return;
  }
  if (action === 'filter-workday-alerts') {
    event.preventDefault();
    state.workdayManagerAlertFilter = node.dataset.filter || 'all';
    state.workdayMode = 'manager';
    render();
    return;
  }
  if (action === 'open-workday-alert') {
    event.preventDefault();
    openWorkdayManagerAlert(node.dataset.alertId || '');
    return;
  }
  if (action === 'open-workday-rep-workload') {
    event.preventDefault();
    openWorkdayRepWorkload(node.dataset.recordType || '', node.dataset.recordId || '');
    return;
  }
```

- [x] **Step 3: Run focused test**

Run:

```powershell
node --test tests/workday-crm-static.test.mjs
```

Expected: still FAIL only on CSS assertions.

### Task 5: Manager View Styling And Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `docs/superpowers/plans/2026-07-08-workday-manager-visibility.md`

**Interfaces:**
- Consumes: classes from Tasks 3 and 4.
- Produces: responsive manager view layout with no horizontal overflow.

- [x] **Step 1: Add CSS**

Add after existing Workday CSS:

```css
.workday-mode-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  padding: 5px;
  width: fit-content;
}

.workday-mode-tabs button,
.workday-alert-filters button {
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-weight: 900;
  padding: 9px 12px;
}

.workday-mode-tabs button.active,
.workday-alert-filters button.active {
  background: var(--orange);
  color: #fff;
}

.workday-manager-view {
  display: grid;
  gap: 16px;
}

.workday-manager-layout {
  display: grid;
  grid-template-columns: minmax(420px, 1.25fr) minmax(300px, .85fr);
  gap: 16px;
  align-items: start;
}

.workday-manager-layout > .panel:last-child {
  grid-column: 1 / -1;
}

.workday-rep-table,
.workday-alert-list,
.workday-mini-list {
  display: grid;
  gap: 8px;
}

.workday-rep-row {
  display: grid;
  grid-template-columns: minmax(180px, 1.4fr) repeat(5, minmax(78px, .7fr));
  gap: 8px;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--ink);
  padding: 10px;
  text-align: left;
}

.workday-rep-row.active {
  border-color: var(--orange);
  box-shadow: inset 3px 0 0 var(--orange);
}

.workday-rep-row span,
.workday-rep-detail-grid span,
.workday-alert-item span,
.workday-mini-list button {
  min-width: 0;
  overflow-wrap: anywhere;
}

.workday-rep-row strong,
.workday-rep-row small,
.workday-alert-item strong,
.workday-alert-item small,
.workday-mini-list small {
  display: block;
}

.workday-rep-row small,
.workday-alert-item small,
.workday-mini-list small {
  color: var(--muted);
  font-size: 12px;
}

.workday-rep-detail {
  display: grid;
  gap: 12px;
}

.workday-rep-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(70px, 1fr));
  gap: 8px;
}

.workday-rep-detail-grid span {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  padding: 10px;
}

.workday-alert-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.workday-alert-item,
.workday-mini-list button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--ink);
  padding: 10px;
  text-align: left;
}

@media (max-width: 980px) {
  .workday-manager-view,
  .workday-manager-layout {
    grid-template-columns: 1fr;
  }

  .workday-rep-row,
  .workday-alert-item,
  .workday-mini-list button {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .workday-rep-detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [x] **Step 2: Run focused Workday test**

Run:

```powershell
node --test tests/workday-crm-static.test.mjs
```

Expected: PASS.

- [x] **Step 3: Run full static suite**

Run:

```powershell
node --test tests/*.mjs
```

Expected: all tests PASS.

- [x] **Step 4: Run production build**

Run:

```powershell
npm run build
```

Expected: Vite build completes successfully.

- [x] **Step 5: Commit**

Run:

```powershell
git add -- src/main.js src/styles.css tests/workday-crm-static.test.mjs docs/superpowers/plans/2026-07-08-workday-manager-visibility.md
git commit -m "Expand Workday manager visibility"
```

- [ ] **Step 6: Deploy and smoke test**

Run:

```powershell
git push origin main
npx vercel --prod --yes
npm run smoke:prod
```

Expected: production deploy is READY and smoke test reports `/company/lumen/workday` as `PASS 200`.

## Self-Review

- Spec coverage: covered mode switch, Team Pulse, Rep Visibility, Needs Attention, rep detail, alert navigation, CSS, tests, build, deploy, and smoke.
- Placeholder scan: no unresolved placeholder language.
- Type consistency: plan uses `workdayMode`, `selectedWorkdayManagerRepId`, `workdayManagerAlertFilter`, `workdayRepVisibilityRows`, `workdayManagerAlertItems`, `renderWorkdayManagerView`, and handler names consistently.
