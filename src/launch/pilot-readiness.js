const STEP_DEFINITIONS = [
  ['workspace', 'Create your first workspace'],
  ['apps', 'Choose the apps this workspace needs'],
  ['team', 'Invite your first teammate'],
  ['customer', 'Add your first contact or job'],
  ['task', 'Create your first task'],
];

function positiveCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function buildPilotChecklist(input = {}) {
  const completion = {
    workspace: input.hasWorkspace === true,
    apps: positiveCount(input.installedPluginCount) > 0,
    team: positiveCount(input.activeMemberCount) > 1 || positiveCount(input.pendingInviteCount) > 0,
    customer: positiveCount(input.customerRecordCount) > 0,
    task: positiveCount(input.taskCount) > 0,
  };
  const steps = STEP_DEFINITIONS.map(([id, label]) => ({
    id,
    label,
    complete: completion[id],
  }));
  const completed = steps.filter((step) => step.complete).length;
  return {
    steps,
    completed,
    total: steps.length,
    done: completed === steps.length,
  };
}

export function renderPilotChecklist({ input, links, href, escapeHtml }) {
  const checklist = buildPilotChecklist(input);
  if (checklist.done) return '';
  const h = escapeHtml;
  const remaining = checklist.total - checklist.completed;
  const progress = Math.round((checklist.completed / checklist.total) * 100);
  return `
    <section class="pilot-launch-checklist panel" aria-label="Questbase setup checklist">
      <div class="pilot-launch-summary">
        <span class="pilot-launch-icon"><i class="ti ti-rocket"></i></span>
        <div>
          <div class="eyebrow">Pilot setup</div>
          <h2>Finish setting up Questbase</h2>
          <p>${h(String(remaining))} step${remaining === 1 ? '' : 's'} left before your team is ready for a live pilot.</p>
        </div>
        <strong>${h(String(checklist.completed))}/${h(String(checklist.total))}</strong>
      </div>
      <div class="pilot-launch-progress" aria-label="${h(String(progress))}% complete"><i style="width:${h(String(progress))}%"></i></div>
      <div class="pilot-launch-steps">
        ${checklist.steps.map((step) => `
          <a class="pilot-launch-step ${step.complete ? 'complete' : ''}" href="${href(links[step.id])}" data-router>
            <i class="ti ${step.complete ? 'ti-circle-check-filled' : 'ti-circle'}" aria-hidden="true"></i>
            <span>${h(step.label)}</span>
            <i class="ti ti-chevron-right" aria-hidden="true"></i>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}
