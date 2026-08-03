// The form inside a docked activity composer -- the fields that differ per composer kind
// (Note, Call, Task, Email...).
//
// Fetched on demand. Nothing is docked on first paint: renderDockedActivityComposers returns
// '' until someone opens a composer, so this markup cannot be needed to draw a page.
//
// A factory, because every helper it needs belongs to main.js. The body is unchanged from
// where it lived there.

export function createDockFields(ctx) {
  const {
    h, activityRelatedLabel, activityRelatedEmail, activeCompanyId, workdayRecordOwnerId,
    taskAssigneeId, activeTaskCreatorId, companyTaskAssignees, memberName, isoDate,
  } = ctx;

  function renderDockedActivityFields(composer, record, config) {
    const label = activityRelatedLabel(record);
    const subject = `${config.subject}: ${label}`;
    if (config.type === 'email') {
      return `
        <label class="activity-dock-field">
          <span>To</span>
          <input name="email_to" value="${h(activityRelatedEmail(composer.related_type, record))}" placeholder="name@example.com" aria-label="Email to" />
        </label>
        <label class="activity-dock-field">
          <span>Subject</span>
          <input name="subject" value="${h(subject)}" aria-label="Subject" />
        </label>
        <label class="activity-dock-field">
          <span>Email body</span>
          <textarea name="email_body" rows="7" placeholder="Write the email message..." aria-label="Email body"></textarea>
        </label>
        <div class="activity-dock-toolbar" aria-label="Email tools">
          <button type="button" title="Attach file"><i class="ti ti-paperclip"></i></button>
          <button type="button" title="Insert template"><i class="ti ti-template"></i></button>
          <button type="button" title="Add merge field"><i class="ti ti-braces"></i></button>
        </div>
      `;
    }
    if (config.type === 'task') {
      const companyId = record.company_id || activeCompanyId();
      const recordOwnerId = workdayRecordOwnerId(record, companyId);
      const assigneeId = taskAssigneeId(recordOwnerId, companyId) || activeTaskCreatorId(companyId);
      const members = companyTaskAssignees(companyId);
      return `
        <label class="activity-dock-field">
          <span>Subject</span>
          <input name="subject" value="${h(subject)}" aria-label="Subject" />
        </label>
        <div class="activity-dock-grid">
          <label class="activity-dock-field">
            <span>Assigned to</span>
            <select name="assignee_id" aria-label="Assigned to">
              ${members.map((member) => `<option value="${h(member.id)}" ${member.id === assigneeId ? 'selected' : ''}>${h(memberName(member.id))}</option>`).join('')}
            </select>
          </label>
          <label class="activity-dock-field">
            <span>Due date</span>
            <input name="due_date" type="date" value="${h(isoDate(1))}" aria-label="Due date" />
          </label>
          <label class="activity-dock-field">
            <span>Due time</span>
            <input name="due_time" type="time" value="" aria-label="Due time" />
          </label>
          <label class="activity-dock-field">
            <span>Priority</span>
            <select name="priority" aria-label="Priority">
              <option value="medium">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
        <label class="activity-dock-field">
          <span>Task details</span>
          <textarea name="task_notes" rows="5" placeholder="Add task details..." aria-label="Task details"></textarea>
        </label>
      `;
    }
    if (config.type === 'meeting') {
      return `
        <label class="activity-dock-field">
          <span>Subject</span>
          <input name="subject" value="${h(subject)}" aria-label="Subject" />
        </label>
        <div class="activity-dock-grid">
          <label class="activity-dock-field">
            <span>Date</span>
            <input name="event_date" type="date" value="${h(isoDate(1))}" aria-label="Event date" />
          </label>
          <label class="activity-dock-field">
            <span>Start</span>
            <input name="start_time" type="time" value="09:00" aria-label="Start time" />
          </label>
          <label class="activity-dock-field">
            <span>End</span>
            <input name="end_time" type="time" value="09:30" aria-label="End time" />
          </label>
        </div>
        <label class="activity-dock-field">
          <span>Location</span>
          <input name="event_location" value="${h(record.location || record.site_address || '')}" placeholder="Address or call link" aria-label="Event location" />
        </label>
        <label class="activity-dock-field">
          <span>Event notes</span>
          <textarea name="event_notes" rows="4" placeholder="Add meeting details..." aria-label="Event notes"></textarea>
        </label>
      `;
    }
    if (config.type === 'call') {
      return `
        <label class="activity-dock-field">
          <span>Subject</span>
          <input name="subject" value="${h(subject)}" aria-label="Subject" />
        </label>
        <div class="activity-dock-grid">
          <label class="activity-dock-field">
            <span>Outcome</span>
            <select name="call_outcome" aria-label="Call outcome">
              <option>Connected</option>
              <option>Left voicemail</option>
              <option>No answer</option>
              <option>Bad number</option>
            </select>
          </label>
          <label class="activity-dock-field">
            <span>Next step</span>
            <select name="follow_up" aria-label="Follow up">
              <option>None</option>
              <option>Follow up tomorrow</option>
              <option>Schedule meeting</option>
              <option>Send quote</option>
            </select>
          </label>
        </div>
        <label class="activity-dock-field">
          <span>Call notes</span>
          <textarea name="call_notes" rows="5" placeholder="Summarize the call..." aria-label="Call notes"></textarea>
        </label>
      `;
    }
    return `
      <label class="activity-dock-field">
        <span>Subject</span>
        <input name="subject" value="${h(subject)}" aria-label="Subject" />
      </label>
      <label class="activity-dock-field">
        <span>Note</span>
        <textarea name="body" rows="6" placeholder="${h(config.placeholder)}" aria-label="Note"></textarea>
      </label>
    `;
  }

  return { renderDockedActivityFields };
}
