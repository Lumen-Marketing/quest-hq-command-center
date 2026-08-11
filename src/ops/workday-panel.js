// Workday panel, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createWorkdayPanel(ctx) {
  const {
    activitiesFor, companyTasks, emptyState, h, isOpenTask, renderSfTaskRow,
    sfFeedItem, tasksForContact, tasksForDeal, workdayQueueActionHint, workdayQueueIcon, workdayQueueTone,
    workdayRecordFromItem, workdayRecordLabel, workdayRelatedRecord,
  } = ctx;

  function renderWorkdayPanel(item, companyId) {
    if (!item) return `<section class="workday-panel panel">${emptyState('No queue item selected.')}</section>`;
    const related = workdayRelatedRecord(item);
    const record = related?.record || workdayRecordFromItem(item);
    const type = related?.type || item.recordType;
    const recent = ['contact', 'deal', 'job'].includes(type) ? activitiesFor(type, record.id).slice(0, 5) : [];
    const tasks = type === 'contact' ? tasksForContact(record.id).filter(isOpenTask)
      : type === 'deal' ? tasksForDeal(record).filter(isOpenTask)
        : type === 'job' ? companyTasks(companyId).filter((task) => task.project_id === record.id && isOpenTask(task))
          : [];
    const canQuick = ['contact', 'deal', 'job'].includes(type);
    const tone = workdayQueueTone(item);
    return `
      <section class="workday-panel panel tone-${h(tone)}">
        <div class="workday-panel-head">
          <span class="workday-panel-icon"><i class="ti ${type === 'deal' ? 'ti-briefcase' : type === 'job' ? 'ti-hammer' : type === 'form_response' ? 'ti-clipboard-list' : 'ti-user'}"></i></span>
          <div>
            <small>${h(item.kind)} / ${h(item.owner)}</small>
            <h2>${h(workdayRecordLabel(record, type))}</h2>
            <p>${h(item.reason)}</p>
          </div>
          <button class="btn" type="button" data-action="workday-open-record" data-workday-item-id="${h(item.id)}"><i class="ti ti-external-link"></i>Open record</button>
        </div>
        <div class="workday-panel-summary">
          <span><strong>${h(workdayQueueActionHint(item))}</strong><small>Next best action</small></span>
          <span><strong>${h(String(item.priority))}</strong><small>Queue priority</small></span>
          <span><strong>${h(type.replaceAll('_', ' '))}</strong><small>Record type</small></span>
        </div>
        ${canQuick ? `
          <div class="workday-panel-action-head">
            <div><h3>Work this record</h3><p>Choose the next move and keep the activity trail current.</p></div>
            <span class="workday-status-pill tone-${h(tone === 'critical' ? 'critical' : tone === 'warning' ? 'warning' : tone === 'success' ? 'success' : 'neutral')}"><i class="ti ${h(workdayQueueIcon(item))}"></i>${h(item.kind)}</span>
          </div>
          <div class="workday-action-grid">
            ${['Log a Call', 'Email', 'Note', 'New Task', 'New Event', 'Estimate', 'Proposal'].map((kind) => `
              <button type="button" data-action="workday-quick-action" data-workday-item-id="${h(item.id)}" data-kind="${h(kind)}">
                <i class="ti ${kind === 'Log a Call' ? 'ti-phone' : kind === 'Email' ? 'ti-mail' : kind === 'Note' ? 'ti-note' : kind === 'New Task' ? 'ti-checkbox' : kind === 'New Event' ? 'ti-calendar' : kind === 'Estimate' ? 'ti-calculator' : 'ti-file-text'}"></i>
                <span>${h(kind)}</span>
              </button>
            `).join('')}
          </div>
        ` : type === 'form_response' ? `
          <div class="workday-panel-action-head">
            <div><h3>Create from response</h3><p>Turn the submitted form into a live CRM record or follow-up.</p></div>
            <span class="workday-status-pill tone-success"><i class="ti ti-clipboard-list"></i>${h(item.kind)}</span>
          </div>
          <div class="workday-action-grid">
            <button type="button" data-action="response-create-contact" data-response-id="${h(record.id)}"><i class="ti ti-id-badge-2"></i><span>Create contact</span></button>
            <button type="button" data-action="response-create-job" data-response-id="${h(record.id)}"><i class="ti ti-hammer"></i><span>Create job</span></button>
            <button type="button" data-action="response-create-task" data-response-id="${h(record.id)}"><i class="ti ti-checkbox"></i><span>Create task</span></button>
          </div>
        ` : `
          <div class="workday-panel-action-head">
            <div><h3>Finish the follow-up</h3><p>Open the task or mark it handled when it is complete.</p></div>
            <span class="workday-status-pill tone-${h(tone === 'critical' ? 'critical' : tone === 'warning' ? 'warning' : 'neutral')}"><i class="ti ${h(workdayQueueIcon(item))}"></i>${h(item.kind)}</span>
          </div>
          <div class="workday-action-grid">
            <button type="button" data-action="workday-open-record" data-workday-item-id="${h(item.id)}"><i class="ti ti-checkbox"></i><span>Open task</span></button>
            <button type="button" data-action="workday-complete-item" data-workday-item-id="${h(item.id)}"><i class="ti ti-check"></i><span>Done for now</span></button>
          </div>
        `}
        <div class="workday-panel-grid">
          <section>
            <h3>Open next steps</h3>
            <div class="sf-tasks">${tasks.length ? tasks.slice(0, 5).map((task) => renderSfTaskRow(task)).join('') : '<div class="sf-task-empty">No open next step.</div>'}</div>
          </section>
          <section>
            <h3>Recent activity</h3>
            <div class="sf-feed">${recent.length ? recent.map((activity) => sfFeedItem(activity)).join('') : '<div class="sf-feed-empty">No recent activity.</div>'}</div>
          </section>
        </div>
        <div class="workday-panel-foot">
          <button class="btn btn-primary" type="button" data-action="workday-complete-item" data-workday-item-id="${h(item.id)}"><i class="ti ti-check"></i>Done for now</button>
        </div>
      </section>
    `;
  }

  return { renderWorkdayPanel };
}
