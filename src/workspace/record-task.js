// The New task modal that opens ON a record.
//
// "On Task it opens a modal to create a quick task that is saved in Tasks." Three fields is a
// form, not a page -- a trip to the Tasks section to fill in two of them loses the reader's
// place and brings them back by the browser's back button, if at all.
//
// It does NOT write a task. wbCreateTaskFromPost is the one shared writer -- the tasks.manage
// check, the creator stamp, the single normalizeTask/taskPayload shape ADR-0001 requires, the
// insert, and notifyTaskChange telling the assignee. A second writer missing any of those is a
// task nobody hears about.
//
// Extracted from main.js because it is reachable from one place -- a record page, through Quick
// Create -- and the entry chunk every session downloads was carrying it regardless. That is the
// rule the budget note asks for: pay for new work with an extraction rather than by raising the
// ceiling.

export function createRecordTask(ctx) {
  const {
    activeCompanyId, field, h, isLiveSupabaseSession, render, renderModalShell, showToast, state,
    wbCreateTaskFromPost, wbDoc, wbLogActivity, wbMembers, wbSave,
  } = ctx;

  /** Raise it, holding on to which record it was raised from. */
  function openRecordTaskModal(seed) {
    state.wbRecordTask = {
      companyId: seed?.companyId || activeCompanyId(),
      title: String(seed?.title || ''),
      contactId: String(seed?.contactId || ''),
      appName: String(seed?.appName || ''),
      // Where it was pressed, so the record can say afterwards that it happened. Absent when the
      // modal was raised from somewhere that is not a record, and then nothing is logged.
      workspaceId: String(seed?.workspaceId || ''),
      appId: String(seed?.appId || ''),
      itemId: String(seed?.itemId || ''),
    };
    state.modal = 'wb-record-task';
    render();
  }

  function renderRecordTaskModal(companyId) {
    const seed = state.wbRecordTask || {};
    const members = wbMembers(companyId);
    const about = seed.title ? `${seed.title}${seed.appName ? ` · ${seed.appName}` : ''}` : '';
    return renderModalShell('Workspaces', 'New task', `
      <form class="compact-tool-form" data-wb-record-task-form>
        ${about ? `<p class="form-note">${h(`For ${about}`)}</p>` : ''}
        ${field('Task title', 'title', seed.title || '', true)}
        <label><span>Assign to</span><select name="assignee_id"><option value="">Me</option>${members.map((member) => `<option value="${h(member.id)}">${h(member.name)}</option>`).join('')}</select></label>
        ${field('Due date', 'due', '', false, 'date')}
        <div class="form-actions">
          <button class="btn btn-primary" type="submit"><i class="ti ti-circle-check"></i>Create task</button>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `, 'task-modal');
  }

  /**
   * Say on the record that a task was made from it.
   *
   * The task itself lives in public.tasks, so without this line the record it was made from shows
   * no sign of it -- and "what has been done about this record" is exactly what the Activity card
   * is for. recordFeed selects on itemId, which is why the seat is carried through the modal.
   */
  function noteOnRecord(companyId, seed, title, assigneeId) {
    if (!seed.workspaceId || !seed.itemId) return null;
    const workspace = (wbDoc(companyId)?.workspaces || []).find((one) => one.id === seed.workspaceId);
    if (!workspace) return null;
    const who = assigneeId ? (wbMembers(companyId).find((one) => one.id === assigneeId) || {}).name : '';
    wbLogActivity(workspace, {
      icon: 'ti-checkbox',
      color: '#16a34a',
      appId: seed.appId,
      itemId: seed.itemId,
      text: `Created the task <b>${h(title)}</b>${who ? ` for <b>${h(who)}</b>` : ''}`,
    });
    return workspace;
  }

  async function createTaskFromRecord(companyId, { title, assigneeId, due }) {
    const seed = state.wbRecordTask || {};
    // The record's name rides along as the description as well as the title, because the title is
    // the user's to rewrite and the task should still say where it came from if they do.
    const saved = await wbCreateTaskFromPost(companyId, {
      title, assigneeId, due, contactId: seed.contactId,
      body: seed.title ? `From ${seed.title}${seed.appName ? ` in ${seed.appName}` : ''}` : '',
    });
    // Logged only once the task is real. A line saying a task was created, for a task that was
    // refused, is worse than no line.
    if (!saved) return;
    if (noteOnRecord(companyId, seed, title, assigneeId)) await wbSave(companyId);
    state.modal = '';
    state.wbRecordTask = null;
    showToast('Task created. It is in My Tasks now.', isLiveSupabaseSession() ? 'live' : 'local', 'Tasks');
    render();
  }

  return { openRecordTaskModal, renderRecordTaskModal, createTaskFromRecord };
}
