import {
  COMPANY_SETUP_BLUEPRINTS,
  WORKSPACE_SETUP_QUESTIONS,
  answersForWorkspaceBlueprint,
  buildWorkspaceSetupPlan,
  filterWorkspaceWorkTypes,
  normalizeCompanySetupAnswers,
  validateWorkspaceSetupPlan,
} from './company-setup-model.js';
import { WORKSPACE_PLUGIN_REGISTRY, pluginDataScopeDetails } from '../workspaces/plugin-catalog.js';
import { renderContentSkeleton } from '../ui/workspace-loading.js';

export const RESET_WORKSPACE_SETUP_COPY = 'This clears the setup answers and reopens the guide for the selected workspace. It keeps the applied configuration and does not delete your company, people, sibling workspaces, customers, jobs, tasks, files, or messages.';
export const RESET_COMPANY_SETUP_COPY = RESET_WORKSPACE_SETUP_COPY;

const ACTIVE_PLUGINS = WORKSPACE_PLUGIN_REGISTRY.filter((plugin) => !plugin.comingSoon);
const EMPTY_ANSWERS = Object.freeze({
  mode: 'guided',
  blueprint: '',
  goal: '',
  workType: '',
  industry: '',
  layout: '',
  teams: [],
  tools: [],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function resumablePlan(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.workspaces)) return null;
  try {
    return validateWorkspaceSetupPlan({
      ...value,
      warnings: (Array.isArray(value.warnings) ? value.warnings : [])
        .map((warning) => (typeof warning === 'string' ? warning : warning?.message))
        .filter(Boolean),
    });
  } catch {
    return clone(value);
  }
}

export function setupStateFromProfile(profile) {
  const row = safeObject(profile);
  const answers = { ...clone(EMPTY_ANSWERS), ...clone(safeObject(row.answers)) };
  if (!answers.workType && answers.industry) {
    answers.workType = normalizeCompanySetupAnswers(answers).workType;
  }
  const appliedPlan = resumablePlan(row.applied_plan);
  const draftPlan = resumablePlan(row.draft_plan);
  const requestedScreen = answers.ui?.screen;
  const requestedQuestion = Number(answers.ui?.questionIndex || 0);

  if (row.status === 'applied' && appliedPlan) {
    return {
      loaded: true,
      loading: false,
      error: '',
      saveError: '',
      applying: false,
      resetting: false,
      screen: 'applied',
      returnScreen: 'applied',
      questionIndex: 0,
      answers,
      plan: appliedPlan,
      profile: row,
    };
  }
  if (draftPlan) {
    return {
      loaded: true,
      loading: false,
      error: '',
      saveError: '',
      applying: false,
      resetting: false,
      screen: 'review',
      returnScreen: 'review',
      questionIndex: Math.max(0, Math.min(WORKSPACE_SETUP_QUESTIONS.length - 1, requestedQuestion)),
      answers,
      plan: draftPlan,
      profile: row,
    };
  }

  const screen = ['question', 'blueprints'].includes(requestedScreen) ? requestedScreen : 'entry';
  return {
    loaded: true,
    loading: false,
    error: '',
    saveError: '',
    applying: false,
    resetting: false,
    screen,
    returnScreen: screen,
    questionIndex: Math.max(0, Math.min(WORKSPACE_SETUP_QUESTIONS.length - 1, requestedQuestion)),
    answers,
    plan: null,
    profile: Object.keys(row).length ? row : null,
  };
}

export function editCompanySetupPlan(plan, change = {}) {
  const next = clone(plan);
  const workspace = next.workspaces?.[Number(change.workspaceIndex)];
  const role = next.roles?.[Number(change.roleIndex)];

  if (change.type === 'workspace-name' && workspace) workspace.name = String(change.value ?? '');
  if (change.type === 'role-name' && role) role.name = String(change.value ?? '');
  if (change.type === 'stages' && workspace) {
    workspace.stages = String(change.value ?? '')
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (change.type === 'plugin' && workspace && ACTIVE_PLUGINS.some((plugin) => plugin.id === change.pluginId)) {
    const ids = new Set(Array.isArray(workspace.pluginIds) ? workspace.pluginIds : []);
    if (change.checked) ids.add(change.pluginId);
    else ids.delete(change.pluginId);
    if (change.checked && change.pluginId === 'crm') ids.delete('crm_2');
    if (change.checked && change.pluginId === 'crm_2') ids.delete('crm');
    workspace.pluginIds = ACTIVE_PLUGINS.map((plugin) => plugin.id).filter((id) => ids.has(id));
  }
  return next;
}

function defaultEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function answerIsSelected(answers, question, value) {
  return question.multiple
    ? (Array.isArray(answers[question.id]) && answers[question.id].includes(value))
    : answers[question.id] === value;
}

function questionAnswered(answers, question) {
  return question.multiple
    ? Array.isArray(answers[question.id]) && answers[question.id].length > 0
    : Boolean(answers[question.id]);
}

const PLUGIN_LABELS = new Map(WORKSPACE_PLUGIN_REGISTRY.map((plugin) => [plugin.id, plugin.label]));

function pluginLabel(pluginId) {
  return PLUGIN_LABELS.get(String(pluginId || '')) || String(pluginId || '');
}

function warningMessage(warning) {
  if (typeof warning === 'string') return warning;
  // The server builds these from plugin IDs, so an owner was told that "crm_2" or
  // "time_clock" was unavailable. Rebuild the sentence from the id it carries.
  if (warning?.code === 'plugin_unavailable' && warning?.plugin_id) {
    return `${pluginLabel(warning.plugin_id)} is switched off for this company, so it was not activated here.`;
  }
  return String(warning?.message || warning?.code || '').trim();
}

/**
 * Apps that cannot be active together, where the plan wants one and the workspace already has
 * the other by hand.
 *
 * apply refuses this with an exception that aborts everything -- the same shape as the
 * reserved role name. The registry already declares the pairs through exclusiveGroup, so the
 * clash is derived rather than hard-coded to CRM: a future exclusive pair is covered for free.
 */
function exclusiveAppClashes(plan, installedIds, previouslyManagedIds) {
  const planned = new Set((plan?.workspaces || []).flatMap((workspace) => workspace.pluginIds || []));
  const installed = new Set((installedIds || []).map(String));
  const managed = new Set((previouslyManagedIds || []).map(String));
  const clashes = [];
  for (const plugin of WORKSPACE_PLUGIN_REGISTRY) {
    if (!plugin.exclusiveGroup || !planned.has(plugin.id)) continue;
    for (const other of WORKSPACE_PLUGIN_REGISTRY) {
      if (other.id === plugin.id || other.exclusiveGroup !== plugin.exclusiveGroup) continue;
      // Setup may replace a variant it installed itself; only a MANUAL one blocks.
      if (installed.has(other.id) && !managed.has(other.id)) {
        clashes.push(`${pluginLabel(other.id)} is already switched on in this workspace and cannot run alongside ${pluginLabel(plugin.id)}. Turn it off in Apps, or remove ${pluginLabel(plugin.id)} from this setup.`);
      }
    }
  }
  return [...new Set(clashes)];
}

/**
 * Which pipelines one stage list is actually written to.
 *
 * A sales or roofing workspace gets this single list applied to BOTH the Contacts and the
 * Quotes pipeline; a delivery workspace gets it applied to Jobs. The editor shows one box
 * either way, so without saying so somebody tunes what they take to be the quote funnel and
 * silently rewrites the contact funnel with it.
 */
function stageScopeNote(pipelineKind) {
  if (pipelineKind === 'blank') return 'One per line';
  if (['roofing', 'sales'].includes(pipelineKind)) return 'One per line - used for both Contacts and Quotes';
  return 'One per line - used for Jobs';
}

function hasAppliedSetup(state) {
  const applied = state?.profile?.applied_plan;
  return Boolean(applied && typeof applied === 'object' && Object.keys(applied).length);
}

export function createWorkspaceSetupPanel({
  createClient = () => null,
  isLive = () => false,
  requestRender = () => {},
  onApplied = async () => {},
  onClose = () => {},
  showToast = () => {},
  h = defaultEscape,
  reservedRoleNames = () => [],
  installedWorkspacePlugins = () => [],
  defer = (callback) => queueMicrotask(callback),
} = {}) {
  const workspaceStates = new Map();
  let draftFlushArmed = false;
  const saveTimers = new Map();
  const draftSaves = new Map();

  /**
   * Role names the plan cannot use, and why.
   *
   * Two ways to lose here, both only discoverable at apply time before this existed:
   *
   *   RESERVED  apply refuses a name held by a built-in role, and aborts the whole operation
   *             to do it. That used to mean "Owner", which nobody types. Every company now
   *             also has a built-in Member -- a name somebody might well choose for a role.
   *
   *   DUPLICATE two generated roles renamed to the same thing do NOT collide loudly: the
   *             second finds the first's row by name and adopts it, so two roles quietly
   *             become one and the last template's permissions win.
   */
  function roleNameIssues(companyId, plan) {
    const reserved = new Set((reservedRoleNames(companyId) || []).map((name) => String(name).trim().toLowerCase()));
    const seen = new Map();
    return (plan?.roles || []).map((role, index) => {
      const name = String(role?.name || '').trim();
      const key = name.toLowerCase();
      if (!name) return 'Give this role a name.';
      if (reserved.has(key)) return `"${name}" is a built-in role. Choose another name.`;
      if (seen.has(key)) return `"${name}" is already used by another role above.`;
      seen.set(key, index);
      return '';
    });
  }

  function firstRoleNameIssue(companyId, plan) {
    return roleNameIssues(companyId, plan).find(Boolean) || '';
  }

  /**
   * Everything that would make apply throw, gathered before the button is offered.
   *
   * apply is one transaction: any of these aborts the whole thing, so none of them should be
   * discoverable by pressing the button and reading the wreckage.
   */
  function applyBlockers(workspaceId, state, plan) {
    // Apps this workspace's own setup installed last time may be replaced; only one somebody
    // switched on by hand blocks.
    const managed = Array.isArray(state?.profile?.applied_plan?.managed_plugins)
      ? state.profile.applied_plan.managed_plugins
      : [];
    return [
      firstRoleNameIssue(state?.companyId, plan),
      ...exclusiveAppClashes(plan, installedWorkspacePlugins(workspaceId), managed),
    ].filter(Boolean);
  }

  function current(workspaceId) {
    return workspaceStates.get(String(workspaceId || ''));
  }

  function setCurrent(workspaceId, value) {
    workspaceStates.set(String(workspaceId || ''), value);
    return value;
  }

  function renderShell(workspaceId, workspaceLabel, body, state) {
    const status = state?.profile?.status === 'applied' ? 'Configured' : 'Setup guide';
    const shell = `
      <article class="panel span-3 company-setup-shell" data-company-setup-root data-company-id="${h(state?.companyId || '')}" data-workspace-id="${h(workspaceId)}">
        <div class="company-setup-heading">
          <div>
            <span class="company-setup-kicker">${h(status)}</span>
            <h2 id="workspaceSetupTitle">Set up ${h(workspaceLabel || 'this workspace')}</h2>
            <p>Questbase will configure this workspace from plain-language choices. You can review its apps, pipeline, and starter roles before applying it. Sibling workspaces stay unchanged.</p>
          </div>
          <div class="company-setup-heading-actions">
            <span class="company-setup-safe"><i class="ti ti-shield-check"></i>Existing records stay safe</span>
            ${state?.presentation === 'modal' && state?.canCancel ? '<button class="btn" type="button" data-action="company-setup-close">Cancel</button>' : ''}
          </div>
        </div>
        ${state?.saveError ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i>${h(state.saveError)}</div>` : ''}
        ${body}
      </article>
    `;
    if (state?.presentation !== 'modal') return shell;
    return `
      <div class="modal-overlay company-setup-modal-overlay">
        <div class="company-setup-modal-frame" role="dialog" aria-modal="true" aria-labelledby="workspaceSetupTitle" tabindex="-1">
          ${shell}
        </div>
      </div>
    `;
  }

  function renderLoading(workspaceId, workspaceLabel, state) {
    return renderShell(workspaceId, workspaceLabel, renderContentSkeleton({
      statusText: 'Loading your setup. Checking for saved answers on this workspace.',
    }), state);
  }

  function renderLoadError(workspaceId, workspaceLabel, state) {
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i><div><strong>Setup could not load</strong><span>${h(state.error || 'Please try again.')}</span></div></div>
      <div class="company-setup-actions"><button class="btn btn-primary" type="button" data-action="company-setup-retry-load">Try again</button></div>
    `, state);
  }

  function renderEntry(workspaceId, workspaceLabel, state) {
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-intro">
        <div><i class="ti ti-wand"></i><strong>About 2 minutes</strong><span>Answer four short questions and get a setup built for this workspace.</span></div>
        <div><i class="ti ti-adjustments"></i><strong>Review first</strong><span>Nothing changes until you press Apply setup.</span></div>
        <div><i class="ti ti-refresh"></i><strong>Change it later</strong><span>The guide stays available in Settings.</span></div>
      </div>
      <div class="company-setup-mode-grid">
        <button type="button" class="company-setup-mode-card featured" data-action="company-setup-guide">
          <span class="company-setup-card-icon"><i class="ti ti-route"></i></span>
          <strong>Guide me</strong>
          <span>Answer a few questions and let Questbase recommend the structure.</span>
          <em>Recommended <i class="ti ti-arrow-right"></i></em>
        </button>
        <button type="button" class="company-setup-mode-card" data-action="company-setup-open-blueprints">
          <span class="company-setup-card-icon"><i class="ti ti-layout-grid"></i></span>
          <strong>Use a ready-made setup</strong>
          <span>Choose a practical starting point, then customize it before applying.</span>
          <em>See setups <i class="ti ti-arrow-right"></i></em>
        </button>
      </div>
      <div class="company-setup-entry-links">
        <button class="company-setup-blank-link" type="button" data-action="company-setup-start-blank"><i class="ti ti-file"></i>Start from scratch</button>
        ${hasAppliedSetup(state) ? '<button class="company-setup-blank-link danger-quiet" type="button" data-action="company-setup-open-reset"><i class="ti ti-refresh"></i>Reset setup answers</button>' : ''}
      </div>
    `, state);
  }

  function renderBlueprints(workspaceId, workspaceLabel, state) {
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-progress-head"><div><span>Ready-made setups</span><strong>Pick a starting point</strong></div><small>You can edit everything on the next screen.</small></div>
      <div class="company-setup-blueprint-grid">
        ${COMPANY_SETUP_BLUEPRINTS.filter((blueprint) => blueprint.id !== 'blank').map((blueprint) => `
          <button type="button" class="company-setup-blueprint-card ${blueprint.id === 'roofing' ? 'featured' : ''}" data-action="company-setup-choose-blueprint" data-blueprint="${h(blueprint.id)}">
            <i class="ti ti-layout-dashboard"></i>
            <strong>${h(blueprint.label)}</strong>
            <span>${h(blueprint.description)}</span>
          </button>
        `).join('')}
      </div>
      <div class="company-setup-actions split">
        <button class="btn" type="button" data-action="company-setup-back-entry"><i class="ti ti-arrow-left"></i>Back</button>
        <button class="company-setup-blank-link" type="button" data-action="company-setup-start-blank">Start from scratch</button>
      </div>
    `, state);
  }

  function renderQuestion(workspaceId, workspaceLabel, state) {
    const question = WORKSPACE_SETUP_QUESTIONS[state.questionIndex] || WORKSPACE_SETUP_QUESTIONS[0];
    const progress = Math.round(((state.questionIndex + 1) / WORKSPACE_SETUP_QUESTIONS.length) * 100);
    const workTypeQuery = question.searchable ? String(state.workTypeQuery || '') : '';
    const matchingWorkTypes = question.searchable
      ? new Set(filterWorkspaceWorkTypes(workTypeQuery).map((item) => item.id))
      : null;
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-progress-head">
        <div><span>Question ${state.questionIndex + 1} of ${WORKSPACE_SETUP_QUESTIONS.length}</span><strong>${h(question.title)}</strong></div>
        <small>${question.multiple ? 'Choose all that apply.' : 'Choose one.'}</small>
      </div>
      <div class="company-setup-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>
      ${state.error ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i>${h(state.error)}</div>` : ''}
      ${question.searchable ? `
        <label class="company-setup-work-type-search">
          <i class="ti ti-search" aria-hidden="true"></i>
          <input type="search" value="${h(workTypeQuery)}" placeholder="Search work types" aria-label="Search work types" data-company-setup-work-type-search autocomplete="off" />
        </label>
      ` : ''}
      <div class="company-setup-option-grid ${question.multiple ? 'multi' : ''}">
        ${question.options.map(([value, label]) => {
          const selected = answerIsSelected(state.answers, question, value);
          const hidden = matchingWorkTypes && !matchingWorkTypes.has(value);
          return `<button type="button" class="company-setup-option ${selected ? 'selected' : ''}" data-action="company-setup-select-option" data-question="${h(question.id)}" data-value="${h(value)}" data-multiple="${question.multiple ? 'true' : 'false'}" ${question.searchable ? 'data-company-setup-work-type-option' : ''} ${hidden ? 'hidden' : ''} aria-pressed="${selected ? 'true' : 'false'}"><span>${h(label)}</span><i class="ti ${selected ? 'ti-circle-check-filled' : 'ti-circle'}"></i></button>`;
        }).join('')}
        ${question.searchable ? `<p class="company-setup-work-type-empty" data-company-setup-work-type-empty ${matchingWorkTypes.size ? 'hidden' : ''}>No work type matches that search. Try a broader word or choose Other type of work.</p>` : ''}
      </div>
      <div class="company-setup-actions split">
        <button class="btn" type="button" data-action="company-setup-question-back"><i class="ti ti-arrow-left"></i>Back</button>
        <div><button class="company-setup-blank-link" type="button" data-action="company-setup-start-blank">Start from scratch</button><button class="btn btn-primary" type="button" data-action="company-setup-question-next">${state.questionIndex === WORKSPACE_SETUP_QUESTIONS.length - 1 ? 'Review setup' : 'Next'}<i class="ti ti-arrow-right"></i></button></div>
      </div>
    `, state);
  }

  function renderWorkspaceEditor(workspace, workspaceIndex) {
    const selected = new Set(workspace.pluginIds || []);
    return `
      <section class="company-setup-review-card" data-company-setup-workspace="${workspaceIndex}">
        <div class="company-setup-review-card-head">
          <span class="company-setup-number">${workspaceIndex + 1}</span>
          <label><span>Workspace name</span><input type="text" value="${h(workspace.name)}" maxlength="64" data-company-setup-workspace-name data-workspace-index="${workspaceIndex}" /></label>
          ${workspaceIndex === 0 ? '<b>Default</b>' : ''}
        </div>
        <div class="company-setup-review-meta"><span><i class="ti ti-filter"></i>${h((workspace.stages || []).length)} pipeline stages</span><span><i class="ti ti-apps"></i>${h(selected.size)} active apps</span></div>
        <details class="company-setup-app-editor">
          <summary>Choose apps for this workspace <span>${h(selected.size)} selected</span></summary>
          <div class="company-setup-app-grid">
            ${ACTIVE_PLUGINS.map((plugin) => {
              const checked = selected.has(plugin.id);
              const scope = pluginDataScopeDetails(plugin.dataScope);
              return `<label class="company-setup-app-option ${checked ? 'selected' : ''}"><input type="checkbox" data-company-setup-plugin data-workspace-index="${workspaceIndex}" data-plugin-id="${h(plugin.id)}" ${checked ? 'checked' : ''} /><i class="ti ${h(plugin.icon)}"></i><span><strong>${h(plugin.label)}</strong><small>${h(scope.label)}</small></span></label>`;
            }).join('')}
          </div>
        </details>
        ${workspace.pipelineKind === 'blank' ? '<p class="company-setup-muted">No pipeline changes are planned for this workspace.</p>' : `
          <label class="company-setup-stage-editor"><span>Pipeline stages <small>${h(stageScopeNote(workspace.pipelineKind))}</small></span><textarea rows="${Math.min(8, Math.max(4, (workspace.stages || []).length))}" data-company-setup-stages data-workspace-index="${workspaceIndex}">${h((workspace.stages || []).join('\n'))}</textarea></label>
        `}
      </section>
    `;
  }

  function renderReview(workspaceId, workspaceLabel, state) {
    const plan = state.plan || buildWorkspaceSetupPlan({ mode: 'blank' }, { id: workspaceId, name: workspaceLabel });
    const roleIssues = roleNameIssues(state.companyId, plan);
    const blockers = applyBlockers(workspaceId, state, plan);
    const blockingIssue = blockers[0] || '';
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-progress-head"><div><span>Review</span><strong>Your recommended Questbase setup</strong></div><small>Edit names, apps, roles, or stages before applying.</small></div>
      <div class="company-setup-alert info"><i class="ti ti-database-heart"></i><div><strong>Safe to change</strong><span>Applying a new setup never deletes existing business records. Pipelines with live contacts, quotes, or jobs are preserved.</span></div></div>
      ${state.error ? `<div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i><div><strong>Setup needs attention</strong><span>${h(state.error)}</span></div></div>` : ''}
      <div class="company-setup-review-layout">
        <div class="company-setup-review-main">
          <h3>This workspace</h3>
          ${plan.workspaces.map(renderWorkspaceEditor).join('')}
        </div>
        <aside class="company-setup-review-side">
          <section>
            <div class="company-setup-side-head"><h3>Role starters</h3><button type="button" data-action="company-setup-edit-answers">Edit teams</button></div>
            ${(plan.roles || []).map((role, roleIndex) => `
              <label class="company-setup-role-editor ${roleIssues[roleIndex] ? 'has-error' : ''}"><span><i class="ti ti-user-shield"></i><small>${h(roleIssues[roleIndex] || role.purpose || 'Non-owner workspace role')}</small></span><input type="text" value="${h(role.name)}" maxlength="64" data-company-setup-role-name data-role-index="${roleIndex}" aria-invalid="${roleIssues[roleIndex] ? 'true' : 'false'}" /></label>
            `).join('') || '<p class="company-setup-muted">No worker roles will be created. Owner access remains unchanged.</p>'}
          </section>
          <section class="company-setup-scope-note"><h3>Data scope</h3><p>Some apps store workspace-specific records; company-wide apps stay shared inside this company. Scope is shown beside every app.</p></section>
        </aside>
      </div>
      <div class="company-setup-actions split sticky">
        <div><button class="btn" type="button" data-action="company-setup-edit-answers"><i class="ti ti-arrow-left"></i>Edit answers</button>${hasAppliedSetup(state) ? '<button class="btn danger-quiet" type="button" data-action="company-setup-open-reset">Reset setup answers</button>' : ''}</div>
        <button class="btn btn-primary" type="button" data-action="company-setup-apply" ${state.applying || blockingIssue ? 'disabled' : ''} ${blockingIssue ? `title="${h(blockingIssue)}"` : ''}>${state.applying ? '<span class="company-setup-button-spinner"></span>Applying safely…' : '<i class="ti ti-wand"></i>Apply setup'}</button>
        ${blockingIssue ? `<span class="company-setup-apply-block">${h(blockingIssue)}</span>` : ''}
      </div>
    `, state);
  }

  function renderApplied(workspaceId, workspaceLabel, state) {
    const plan = state.plan || resumablePlan(state.profile?.applied_plan) || buildWorkspaceSetupPlan({ mode: 'blank' }, { id: workspaceId, name: workspaceLabel });
    const warnings = (state.profile?.applied_plan?.warnings || plan.warnings || []).map(warningMessage).filter(Boolean);
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-complete">
        <span class="company-setup-complete-icon"><i class="ti ti-check"></i></span>
        <div><span>Setup applied</span><h3>${h(workspaceLabel || 'This workspace')} is ready</h3><p>The selected apps and pipeline are configured only for this workspace. ${h(plan.roles.length)} role starter${plan.roles.length === 1 ? ' is' : 's are'} available company-wide.</p></div>
      </div>
      <div class="company-setup-summary-grid">
        ${plan.workspaces.map((workspace) => `<section><i class="ti ti-layout-dashboard"></i><div><strong>${h(workspace.name)}</strong><span>${h((workspace.pluginIds || []).length)} apps · ${h((workspace.stages || []).length)} stages${workspace.isDefault ? ' · Default' : ''}</span></div></section>`).join('')}
      </div>
      ${warnings.length ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i><div><strong>Kept safe</strong><span>${warnings.map((warning) => h(warning)).join(' ')}</span></div></div>` : ''}
      <div class="company-setup-reset-card">
        <div><strong>Need a different setup?</strong><span>You can adjust the current plan, or clear only the answers and run the guide again.</span></div>
        <div><button class="company-setup-blank-link" type="button" data-action="company-setup-start-blank">Start from scratch</button><button class="btn" type="button" data-action="company-setup-adjust"><i class="ti ti-adjustments"></i>Adjust setup</button><button class="btn danger-quiet" type="button" data-action="company-setup-open-reset">Reset setup answers</button></div>
      </div>
    `, state);
  }

  function renderReset(workspaceId, workspaceLabel, state) {
    return renderShell(workspaceId, workspaceLabel, `
      <div class="company-setup-reset-confirm">
        <span class="company-setup-reset-icon"><i class="ti ti-refresh-alert"></i></span>
        <div><span>Reset setup answers</span><h3>Reopen this workspace setup guide?</h3><p>${h(RESET_WORKSPACE_SETUP_COPY)}</p></div>
      </div>
      ${state.error ? `<div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i>${h(state.error)}</div>` : ''}
      <div class="company-setup-preserved-grid">
        ${['Company account', 'People and access', 'Sibling workspaces', 'Applied workspace apps', 'Customers, jobs, and tasks', 'Files and messages'].map((label) => `<span><i class="ti ti-check"></i>${h(label)}</span>`).join('')}
      </div>
      <div class="company-setup-actions split">
        <button class="btn" type="button" data-action="company-setup-cancel-reset">Cancel</button>
        <button class="btn btn-danger" type="button" data-action="company-setup-confirm-reset" ${state.resetting ? 'disabled' : ''}>${state.resetting ? 'Resetting…' : 'Reset answers and reopen guide'}</button>
      </div>
    `, state);
  }

  async function loadWorkspace(workspaceId) {
    const id = String(workspaceId || '');
    const previous = current(id) || setupStateFromProfile(null);
    setCurrent(id, { ...previous, loading: true, loaded: false, error: '' });

    if (!isLive()) {
      setCurrent(id, { ...setupStateFromProfile(null), companyId: previous.companyId, workspaceLabel: previous.workspaceLabel });
      requestRender();
      return;
    }

    try {
      const client = createClient();
      if (!client) throw new Error('Questbase could not connect to workspace setup.');
      const result = await client
        .from('workspace_setup_profiles')
        .select('workspace_id,answers,draft_plan,applied_plan,status,setup_version,revision,reset_count,applied_at,reset_at,updated_at')
        .eq('workspace_id', id)
        .maybeSingle();
      if (result.error) throw result.error;
      const context = current(id) || previous;
      setCurrent(id, { ...setupStateFromProfile(result.data || null), companyId: context.companyId, workspaceLabel: context.workspaceLabel });
    } catch (error) {
      const context = current(id) || previous;
      setCurrent(id, { ...setupStateFromProfile(null), companyId: context.companyId, workspaceLabel: context.workspaceLabel, loaded: true, loading: false, error: error?.message || 'Setup could not load.' });
    }
    requestRender();
  }

  /**
   * Did the server refuse this because somebody else moved the revision on?
   *
   * save/apply/reset all guard on `revision = expected`, raised as 40001. Postgres reports
   * the code through PostgREST, but the shape of that varies by client version, so the
   * message the procedure raises is matched as well rather than trusting one field.
   */
  function isRevisionConflict(error) {
    if (!error) return false;
    return String(error.code || '') === '40001'
      || /changed in another tab or device/i.test(String(error.message || ''));
  }

  /**
   * Re-read the stored row so the local revision matches the server's again.
   *
   * Without this a conflict is permanent: every later call sends the same stale revision and
   * is refused the same way, so the panel sits behind a warning and saves nothing until the
   * page is reloaded by hand.
   */
  async function refreshProfile(workspaceId, state) {
    const client = createClient();
    if (!client) return false;
    const result = await client
      .from('workspace_setup_profiles')
      .select('workspace_id,answers,draft_plan,applied_plan,status,setup_version,revision,reset_count,applied_at,reset_at,updated_at')
      .eq('workspace_id', String(workspaceId || ''))
      .maybeSingle();
    if (result.error) return false;
    state.profile = result.data || null;
    return true;
  }

  async function saveDraft(workspaceId, state) {
    if (!isLive()) return;
    const key = String(workspaceId || '');
    const previous = draftSaves.get(key) || Promise.resolve(true);
    const task = previous.catch(() => false).then(async () => {
      const client = createClient();
      if (!client) return false;
      const answers = {
        ...clone(state.answers),
        ui: { screen: state.screen, questionIndex: state.questionIndex },
      };
      const result = await client.rpc('save_workspace_setup_draft', {
        target_workspace_id: workspaceId,
        p_answers: answers,
        p_draft_plan: state.plan || {},
        p_expected_revision: Number(state.profile?.revision || 0),
      });
      if (result.error) {
        // One transparent retry against the current revision. A draft is the user's own
        // typing -- there is nothing for them to review and nothing to lose by re-sending it.
        if (isRevisionConflict(result.error) && await refreshProfile(workspaceId, state)) {
          const retry = await client.rpc('save_workspace_setup_draft', {
            target_workspace_id: workspaceId,
            p_answers: answers,
            p_draft_plan: state.plan || {},
            p_expected_revision: Number(state.profile?.revision || 0),
          });
          if (!retry.error) {
            state.saveError = '';
            state.profile = {
              ...(state.profile || {}),
              status: 'draft',
              answers,
              draft_plan: state.plan || {},
              revision: Number(retry.data?.revision ?? state.profile?.revision ?? 0),
              updated_at: retry.data?.updated_at || state.profile?.updated_at,
            };
            requestRender();
            return true;
          }
        }
        state.saveError = result.error.message || 'Setup progress could not be saved.';
        requestRender();
        return false;
      }
      state.saveError = '';
      state.profile = {
        ...(state.profile || {}),
        status: 'draft',
        answers,
        draft_plan: state.plan || {},
        revision: Number(result.data?.revision ?? state.profile?.revision ?? 0),
        updated_at: result.data?.updated_at || state.profile?.updated_at,
      };
      return true;
    });
    draftSaves.set(key, task);
    try {
      return await task;
    } finally {
      if (draftSaves.get(key) === task) draftSaves.delete(key);
    }
  }

  function cancelScheduledDraft(workspaceId) {
    const key = String(workspaceId || '');
    const timer = saveTimers.get(key);
    if (timer !== undefined) clearTimeout(timer);
    saveTimers.delete(key);
  }

  function scheduleDraft(workspaceId, state) {
    const key = String(workspaceId || '');
    cancelScheduledDraft(key);
    saveTimers.set(key, setTimeout(() => {
      saveDraft(workspaceId, state).catch(() => {});
      saveTimers.delete(key);
    }, 700));
    armDraftFlush();
  }

  /**
   * Send a pending draft immediately when the tab goes away.
   *
   * The debounce is 700ms, so answering the last question and closing the tab lost that
   * answer. visibilitychange is the one signal that still fires reliably when a tab is hidden,
   * closed or backgrounded on mobile -- unload does not.
   */
  function flushPendingDrafts() {
    for (const [key, timer] of [...saveTimers.entries()]) {
      clearTimeout(timer);
      saveTimers.delete(key);
      const state = current(key);
      if (state) saveDraft(key, state).catch(() => {});
    }
  }

  function armDraftFlush() {
    if (draftFlushArmed || typeof document === 'undefined') return;
    draftFlushArmed = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPendingDrafts();
    });
  }

  async function selectPlan(workspaceId, state, answers) {
    state.answers = answers;
    state.plan = buildWorkspaceSetupPlan(answers, { id: workspaceId, name: state.workspaceLabel });
    state.screen = 'review';
    state.error = '';
    requestRender();
    await saveDraft(workspaceId, state);
  }

  async function applySetup(workspaceId, state) {
    if (!isLive()) {
      state.error = 'A live Questbase account is required to apply workspace setup.';
      requestRender();
      return;
    }
    try {
      state.plan = validateWorkspaceSetupPlan(state.plan);
    } catch (error) {
      state.error = error?.message || 'Review the setup before applying it.';
      requestRender();
      return;
    }
    // Checked again here rather than trusting the disabled button. Apply is one transaction:
    // a name the database refuses aborts the whole thing, so it must not reach the server.
    // Checked again here rather than trusting the disabled button.
    const blocker = applyBlockers(workspaceId, state, state.plan)[0];
    if (blocker) {
      state.error = blocker;
      requestRender();
      return;
    }

    const key = String(workspaceId || '');
    const hadScheduledDraft = saveTimers.has(key);
    cancelScheduledDraft(workspaceId);
    const activeDraft = draftSaves.get(key);
    if (activeDraft && !(await activeDraft)) return;
    if (hadScheduledDraft && !(await saveDraft(workspaceId, state))) return;

    state.applying = true;
    state.error = '';
    requestRender();
    try {
      const client = createClient();
      const result = await client.rpc('apply_workspace_setup', {
        target_workspace_id: workspaceId,
        p_answers: { ...clone(state.answers), ui: { screen: 'applied', questionIndex: state.questionIndex } },
        p_plan: state.plan,
        p_expected_revision: Number(state.profile?.revision || 0),
      });
      if (result.error) throw result.error;
      const applied = safeObject(result.data?.plan);
      state.profile = {
        ...(state.profile || {}),
        status: 'applied',
        answers: state.answers,
        draft_plan: state.plan,
        applied_plan: applied,
        revision: Number(result.data?.revision ?? state.profile?.revision ?? 0),
        updated_at: result.data?.updated_at || state.profile?.updated_at,
      };
      state.plan = resumablePlan(applied) || state.plan;
      state.screen = 'applied';
      state.applying = false;
      await onApplied(state.companyId, workspaceId);
      showToast('Workspace setup applied.', 'live', 'Setup');
    } catch (error) {
      state.applying = false;
      if (isRevisionConflict(error)) {
        // Deliberately not retried. The plan was composed against a picture of this workspace
        // that has since changed, and applying it anyway is how somebody's edit gets undone.
        await refreshProfile(workspaceId, state).catch(() => false);
        state.error = 'This workspace was set up somewhere else while you were reviewing. Nothing was applied. Reload Setup to see the current configuration before applying again.';
        requestRender();
        return;
      }
      state.error = error?.message || 'Setup could not be applied. Nothing was partially deleted; try again.';
    }
    requestRender();
  }

  async function resetSetup(workspaceId, state) {
    if (!isLive()) {
      state.error = 'A live Questbase account is required to reset setup answers.';
      requestRender();
      return;
    }
    const key = String(workspaceId || '');
    cancelScheduledDraft(workspaceId);
    const activeDraft = draftSaves.get(key);
    if (activeDraft) await activeDraft;

    state.resetting = true;
    state.error = '';
    requestRender();
    try {
      const client = createClient();
      const result = await client.rpc('reset_workspace_setup', {
        target_workspace_id: workspaceId,
        p_expected_revision: Number(state.profile?.revision || 0),
      });
      if (result.error) throw result.error;
      const appliedPlan = state.profile?.applied_plan || {};
      const resetState = setupStateFromProfile({
        ...(state.profile || {}),
        status: 'draft',
        answers: {},
        draft_plan: {},
        applied_plan: appliedPlan,
        reset_count: result.data?.reset_count,
        reset_at: result.data?.reset_at,
        revision: Number(result.data?.revision ?? state.profile?.revision ?? 0),
        updated_at: result.data?.updated_at || state.profile?.updated_at,
      });
      resetState.screen = 'entry';
      resetState.plan = null;
      resetState.answers = clone(EMPTY_ANSWERS);
      resetState.companyId = state.companyId;
      resetState.workspaceLabel = state.workspaceLabel;
      setCurrent(workspaceId, resetState);
      showToast('Workspace setup answers reset. Applied configuration and records were preserved.', 'live', 'Setup');
    } catch (error) {
      state.resetting = false;
      if (isRevisionConflict(error)) {
        // Same reasoning as apply: refresh the revision so the button works next time, but
        // do not resend. Nothing was reset.
        await refreshProfile(workspaceId, state).catch(() => false);
        state.error = 'This workspace was changed somewhere else. Nothing was reset. Reload Setup and try again.';
      } else {
        state.error = error?.message || 'Setup answers could not be reset.';
      }
    }
    requestRender();
  }

  function render(workspaceId, {
    companyId = '', companyLabel = 'this company', workspaceLabel = 'this workspace', canManage = true,
    presentation = 'inline', canCancel = false,
  } = {}) {
    const id = String(workspaceId || '');
    let state = current(id);
    if (!state) {
      state = setCurrent(id, {
        ...setupStateFromProfile(null), companyId, companyLabel, workspaceLabel, loaded: false, loading: true,
      });
      defer(() => loadWorkspace(id));
    } else {
      state.companyId = companyId || state.companyId;
      state.companyLabel = companyLabel || state.companyLabel;
      state.workspaceLabel = workspaceLabel || state.workspaceLabel;
    }
    state.presentation = presentation === 'modal' ? 'modal' : 'inline';
    state.canCancel = Boolean(canCancel);
    if (!canManage) {
      return renderShell(id, workspaceLabel, '<div class="company-setup-alert warning"><i class="ti ti-lock"></i>Owner or Admin access is required to change workspace setup.</div>', state);
    }
    if (state.loading || !state.loaded) return renderLoading(id, workspaceLabel, state);
    if (state.error && state.screen === 'entry' && !state.profile) return renderLoadError(id, workspaceLabel, state);

    let html;
    if (state.screen === 'blueprints') html = renderBlueprints(id, workspaceLabel, state);
    else if (state.screen === 'question') html = renderQuestion(id, workspaceLabel, state);
    else if (state.screen === 'review') html = renderReview(id, workspaceLabel, state);
    else if (state.screen === 'applied') html = renderApplied(id, workspaceLabel, state);
    else if (state.screen === 'reset') html = renderReset(id, workspaceLabel, state);
    else html = renderEntry(id, workspaceLabel, state);

    defer(() => mount(id));
    return html;
  }

  function mount(workspaceId) {
    if (typeof document === 'undefined') return;
    const root = document.querySelector(`[data-company-setup-root][data-workspace-id="${CSS.escape(String(workspaceId))}"]`);
    const state = current(workspaceId);
    if (!root || !state || root.dataset.companySetupBound === 'true') return;
    root.dataset.companySetupBound = 'true';

    const workTypeSearch = root.querySelector('[data-company-setup-work-type-search]');
    if (workTypeSearch) {
      workTypeSearch.addEventListener('input', () => {
        state.workTypeQuery = workTypeSearch.value;
        const matches = new Set(filterWorkspaceWorkTypes(workTypeSearch.value).map((item) => item.id));
        root.querySelectorAll('[data-company-setup-work-type-option]').forEach((option) => {
          option.hidden = !matches.has(option.dataset.value);
        });
        const empty = root.querySelector('[data-company-setup-work-type-empty]');
        if (empty) empty.hidden = matches.size > 0;
      });
    }

    root.querySelectorAll('[data-company-setup-workspace-name]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'workspace-name', workspaceIndex: input.dataset.workspaceIndex, value: input.value });
        state.error = '';
        scheduleDraft(workspaceId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-role-name]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'role-name', roleIndex: input.dataset.roleIndex, value: input.value });
        state.error = '';
        scheduleDraft(workspaceId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-stages]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'stages', workspaceIndex: input.dataset.workspaceIndex, value: input.value });
        state.error = '';
        scheduleDraft(workspaceId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-plugin]').forEach((input) => {
      input.addEventListener('change', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'plugin', workspaceIndex: input.dataset.workspaceIndex, pluginId: input.dataset.pluginId, checked: input.checked });
        state.error = '';
        scheduleDraft(workspaceId, state);
        requestRender();
      });
    });
  }

  async function handleAction(action, node) {
    const root = node?.closest?.('[data-company-setup-root]');
    const companyId = String(root?.dataset.companyId || node?.dataset.companyId || '');
    const workspaceId = String(root?.dataset.workspaceId || node?.dataset.workspaceId || '');
    if (!workspaceId) return;
    let state = current(workspaceId);
    if (!state) {
      await loadWorkspace(workspaceId);
      state = current(workspaceId);
    }
    state.companyId = companyId || state.companyId;

    if (action === 'company-setup-retry-load') {
      await loadWorkspace(workspaceId);
      return;
    }
    if (action === 'company-setup-close') {
      if (state.canCancel) onClose(state.companyId, workspaceId);
      return;
    }
    if (action === 'company-setup-guide') {
      state.answers = clone(EMPTY_ANSWERS);
      state.workTypeQuery = '';
      state.screen = 'question';
      state.questionIndex = 0;
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-open-blueprints') {
      state.screen = 'blueprints';
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-back-entry') {
      state.screen = 'entry';
      state.error = '';
      requestRender();
      await saveDraft(workspaceId, state);
      return;
    }
    if (action === 'company-setup-start-blank') {
      state.answers = answersForWorkspaceBlueprint('blank');
      state.plan = buildWorkspaceSetupPlan(state.answers, { id: workspaceId, name: state.workspaceLabel });
      state.error = '';
      await applySetup(workspaceId, state);
      return;
    }
    if (action === 'company-setup-choose-blueprint') {
      await selectPlan(workspaceId, state, answersForWorkspaceBlueprint(node.dataset.blueprint));
      return;
    }
    if (action === 'company-setup-select-option') {
      const questionId = node.dataset.question;
      const value = node.dataset.value;
      const multiple = node.dataset.multiple === 'true';
      if (multiple) {
        const values = new Set(Array.isArray(state.answers[questionId]) ? state.answers[questionId] : []);
        if (values.has(value)) values.delete(value);
        else values.add(value);
        state.answers[questionId] = [...values];
      } else {
        state.answers[questionId] = value;
      }
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-question-back') {
      if (state.questionIndex > 0) state.questionIndex -= 1;
      else state.screen = 'entry';
      state.error = '';
      requestRender();
      await saveDraft(workspaceId, state);
      return;
    }
    if (action === 'company-setup-question-next') {
      const question = WORKSPACE_SETUP_QUESTIONS[state.questionIndex];
      if (!questionAnswered(state.answers, question)) {
        state.error = question.multiple ? 'Choose at least one option to continue.' : 'Choose one option to continue.';
        requestRender();
        return;
      }
      if (state.questionIndex < WORKSPACE_SETUP_QUESTIONS.length - 1) {
        state.questionIndex += 1;
        state.error = '';
        requestRender();
        await saveDraft(workspaceId, state);
        return;
      }
      await selectPlan(workspaceId, state, state.answers);
      return;
    }
    if (action === 'company-setup-edit-answers') {
      state.screen = 'question';
      state.questionIndex = 0;
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-adjust') {
      state.plan = resumablePlan(state.profile?.applied_plan) || state.plan;
      state.screen = 'review';
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-apply') {
      await applySetup(workspaceId, state);
      return;
    }
    if (action === 'company-setup-open-reset') {
      state.returnScreen = state.screen;
      state.screen = 'reset';
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-cancel-reset') {
      state.screen = state.returnScreen || 'applied';
      state.error = '';
      requestRender();
      return;
    }
    if (action === 'company-setup-confirm-reset') await resetSetup(workspaceId, state);
  }

  // roleNameIssues is returned so the rule can be tested directly rather than through a
  // rendered string -- it decides whether Apply is reachable at all.
  // saveDraft is returned so the revision-conflict recovery can be driven directly. It is the
  // one path that retries by itself, and "retries exactly once" is not visible from the
  // rendered output.
  return { render, mount, handleAction, loadWorkspace, roleNameIssues, firstRoleNameIssue, saveDraft };
}

// Kept as an import-compatible alias while callers roll over to workspace naming.
export const createCompanySetupPanel = createWorkspaceSetupPanel;
