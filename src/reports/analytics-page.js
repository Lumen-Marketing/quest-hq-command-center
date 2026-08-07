// The Reports page, fetched on first use. It is one nav click away and nothing that paints
// before that click reads any of it.
//
// A factory, because every store and formatting helper it uses belongs to main.js.

export function createAnalyticsPage(ctx) {
  const {
    analyticsJobChoiceLabel, appHref, companyFiles, companyForms, companyJobs,
    companyName, companyPath, companyTasks, emptyState, fileCountForJob, h, jobById,
    money, percent, percentNumber, priorityRank, startOfToday, statusLabel, sum,
    TASK_STATUSES, taskCountForJob, taskQueueRow,
  } = ctx;

  function renderAnalyticsPage(route, companyId) {
    const scopedJob = route.jobId ? jobById(route.jobId) : null;
    const jobs = scopedJob ? [scopedJob] : companyJobs(companyId);
    const tasks = companyTasks(companyId).filter((task) => !scopedJob || task.project_id === scopedJob.id);
    const files = companyFiles(companyId).filter((file) => !scopedJob || file.job_id === scopedJob.id);
    const forms = companyForms(companyId).filter((form) => !scopedJob || form.linked_job_id === scopedJob.id);
    const openTasks = tasks.filter((task) => task.status !== 'done');
    const lateTasks = tasks.filter((task) => task.status !== 'done' && task.due && new Date(task.due) < startOfToday());
    const activeValue = sum(jobs, 'estimate_total');
    return `
      <section class="analytics-workspace">
        <section class="analytics-toolbar panel">
          <div>
            <strong>Reports</strong>
            <span>${h(scopedJob ? scopedJob.name : companyName(companyId))}</span>
          </div>
          <label>
            <span>Job</span>
            <select data-analytics-job-filter>
              <option value="">All jobs</option>
              ${companyJobs(companyId).map((job) => `<option value="${h(job.id)}" ${scopedJob?.id === job.id ? 'selected' : ''}>${h(analyticsJobChoiceLabel(job))}</option>`).join('')}
            </select>
          </label>
          <a class="btn" href="${appHref(companyPath('jobs', scopedJob ? { tab: 'profile', job_id: scopedJob.id } : {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
        </section>
        <section class="analytics-grid">
          <article class="panel analytics-score">
            <span>Open work</span>
            <strong>${h(openTasks.length)}</strong>
            <small>${h(lateTasks.length)} overdue / ${h(tasks.filter((task) => task.priority === 'urgent' || task.priority === 'critical').length)} urgent</small>
          </article>
          <article class="panel analytics-score">
            <span>Pipeline value</span>
            <strong>${h(money(activeValue))}</strong>
            <small>${h(jobs.length)} visible job${jobs.length === 1 ? '' : 's'}</small>
          </article>
          <article class="panel analytics-score">
            <span>Drive and forms</span>
            <strong>${h(files.length + forms.length)}</strong>
            <small>${h(files.length)} files / ${h(forms.length)} forms</small>
          </article>
          <article class="panel analytics-score">
            <span>Completion</span>
            <strong>${h(percent(tasks.filter((task) => task.status === 'done').length, tasks.length))}</strong>
            <small>${h(tasks.filter((task) => task.status === 'done').length)} done of ${h(tasks.length)}</small>
          </article>
          <article class="panel analytics-main">
            <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
            <div class="analytics-table">
              <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
              ${jobs.map((job) => `
                <a class="analytics-row" href="${appHref(companyPath('analytics', { job_id: job.id }, companyId))}" data-router>
                  <span><strong>${h(job.name)}</strong><small>${h(job.client_name || companyName(companyId))}</small></span>
                  <span>${h(job.stage)}</span>
                  <span>${h(taskCountForJob(job.id))}</span>
                  <span>${h(fileCountForJob(job.id))}</span>
                  <span>${h(money(job.estimate_total))}</span>
                </a>
              `).join('') || emptyState('No jobs to analyze yet.')}
            </div>
          </article>
          <article class="panel analytics-side">
            <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
            <div class="stage-bars">
              ${TASK_STATUSES.map((status) => {
                const count = tasks.filter((task) => task.status === status).length;
                return `<div><span>${h(statusLabel(status))}</span><b><i style="width:${h(percentNumber(count, tasks.length))}%"></i></b><strong>${h(count)}</strong></div>`;
              }).join('')}
            </div>
          </article>
          <article class="panel span-3">
            <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
            <div class="queue-list">
              ${tasks
                .filter((task) => task.status !== 'done')
                .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
                .slice(0, 8)
                .map((task) => taskQueueRow(task))
                .join('') || emptyState('No open tasks in this scope.')}
            </div>
          </article>
        </section>
      </section>
    `;
  }

  return { renderAnalyticsPage };
}
