// The New/Edit task form.
//
// Fetched on demand: it is the body of one modal, raised from the Tasks section and from Quick
// Create on a record, and every session that never opens it was carrying 2.9 KB of selects in
// the entry bundle for nothing.
//
// ctx rather than imports, like every other panel lifted out of main.js: it reads `state` for
// the route, and reuses main.js's own field/selectField builders so this form keeps looking
// like every other form in the product rather than growing a second set.

export function createTaskForm(ctx) {
  const {
    TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES,
    blankTask, companyContacts, companyDeals, companyJobs, companyTaskAssignees, field, h,
    isoDate, recurrenceSelectOptions, selectField, state, statusLabel, taskTypeLabel,
    textareaField, titleCase,
  } = ctx;

  function renderTaskForm(companyId, job, task) {
    // A NEW task can arrive pre-filled. Quick Create on a record sends the record's name as the
    // title and its contact as the link, so the task says what it is about and who it is for
    // without anybody retyping it. Ignored when editing: an existing task has its own.
    const params = state.route?.params;
    // Only the ones actually sent: a blank parameter must not overwrite what blankTask worked
    // out from the job, and an existing task keeps its own.
    const seed = task ? {} : Object.fromEntries(['title', 'contact_id']
      .map((key) => [key, params?.get(key) || '']).filter(([, value]) => value));
    const edit = task || { ...blankTask(companyId, job?.id || ''), ...seed };
    const returnContactId = params?.get('return_contact_id') || '';
    return `
      <form class="task-form" data-task-form>
        <input type="hidden" name="id" value="${h(task ? edit.id : '')}" />
        <input type="hidden" name="return_contact_id" value="${h(returnContactId)}" />
        <div class="section-head">
          <div><h2>${task ? 'Edit task' : 'New task'}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
        </div>
        ${field('Task title', 'title', edit.title, true)}
        ${selectField('Job', 'project_id', edit.project_id || '', [['', 'Company-level task']].concat(companyJobs(companyId).map((item) => [item.id, item.name])))}
        ${selectField('Contact', 'contact_id', edit.contact_id || returnContactId, [['', 'No linked contact']].concat(companyContacts(companyId).map((item) => [item.id, item.name])))}
        ${selectField('Quote', 'deal_id', edit.deal_id || '', [['', 'No linked quote']].concat(companyDeals(companyId).map((item) => [item.id, item.name])))}
        ${selectField('Status', 'status', edit.status, TASK_STATUSES.map((item) => [item, statusLabel(item)]))}
        ${selectField('Priority', 'priority', edit.priority, TASK_PRIORITIES.map((item) => [item, titleCase(item)]))}
        ${selectField('Type', 'type', edit.type, TASK_TYPES.map((item) => [item, taskTypeLabel(item)]))}
        ${selectField('Assignee', 'assignee_id', edit.assignee_id, companyTaskAssignees(companyId).map((item) => [item.id, item.name]))}
        ${field('Due date', 'due', edit.due || isoDate(1), true, 'date')}
        ${field('Due time', 'due_time', edit.due_time || '', false, 'time')}
        ${selectField('Repeat', 'recurrence', edit.recurrence || '', recurrenceSelectOptions(edit.recurrence))}
        ${textareaField('Description', 'description', edit.description)}
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Save task</button>
          ${task ? `<button class="btn danger" type="button" data-action="delete-task" data-task-id="${h(task.id)}">Delete</button>` : ''}
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `;
  }

  return { renderTaskForm };
}
