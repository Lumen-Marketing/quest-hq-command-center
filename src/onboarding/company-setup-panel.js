import {
  COMPANY_SETUP_BLUEPRINTS,
  COMPANY_SETUP_QUESTIONS,
  answersForBlueprint,
  buildCompanySetupPlan,
  validateCompanySetupPlan,
} from './company-setup-model.js';
import { WORKSPACE_PLUGIN_REGISTRY, pluginDataScopeDetails } from '../workspaces/plugin-catalog.js';

export const RESET_COMPANY_SETUP_COPY = 'This clears the setup answers and reopens the guide. It does not delete your company, people, workspaces, customers, jobs, tasks, files, or messages.';

const ACTIVE_PLUGINS = WORKSPACE_PLUGIN_REGISTRY.filter((plugin) => !plugin.comingSoon);
const EMPTY_ANSWERS = Object.freeze({
  mode: 'guided',
  blueprint: '',
  goal: '',
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
    return validateCompanySetupPlan({
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
      questionIndex: Math.max(0, Math.min(COMPANY_SETUP_QUESTIONS.length - 1, requestedQuestion)),
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
    questionIndex: Math.max(0, Math.min(COMPANY_SETUP_QUESTIONS.length - 1, requestedQuestion)),
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

function warningMessage(warning) {
  if (typeof warning === 'string') return warning;
  return String(warning?.message || warning?.code || '').trim();
}

function hasAppliedSetup(state) {
  const applied = state?.profile?.applied_plan;
  return Boolean(applied && typeof applied === 'object' && Object.keys(applied).length);
}

export function createCompanySetupPanel({
  createClient = () => null,
  isLive = () => false,
  requestRender = () => {},
  onApplied = async () => {},
  showToast = () => {},
  h = defaultEscape,
  defer = (callback) => queueMicrotask(callback),
} = {}) {
  const companyStates = new Map();
  const saveTimers = new Map();

  function current(companyId) {
    return companyStates.get(String(companyId || ''));
  }

  function setCurrent(companyId, value) {
    companyStates.set(String(companyId || ''), value);
    return value;
  }

  function renderShell(companyId, companyLabel, body, state) {
    const status = state?.profile?.status === 'applied' ? 'Configured' : 'Setup guide';
    return `
      <article class="panel span-3 company-setup-shell" data-company-setup-root data-company-id="${h(companyId)}">
        <div class="company-setup-heading">
          <div>
            <span class="company-setup-kicker">${h(status)}</span>
            <h2>Set up ${h(companyLabel || 'this company')}</h2>
            <p>Questbase will build a starting structure from plain-language choices. You can review every workspace, app, pipeline, and role before applying it.</p>
          </div>
          <span class="company-setup-safe"><i class="ti ti-shield-check"></i>Existing records stay safe</span>
        </div>
        ${state?.saveError ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i>${h(state.saveError)}</div>` : ''}
        ${body}
      </article>
    `;
  }

  function renderLoading(companyId, companyLabel, state) {
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-loading" role="status">
        <span class="company-setup-spinner" aria-hidden="true"></span>
        <strong>Loading your setup</strong>
        <span>Checking for saved answers on this company.</span>
      </div>
    `, state);
  }

  function renderLoadError(companyId, companyLabel, state) {
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i><div><strong>Setup could not load</strong><span>${h(state.error || 'Please try again.')}</span></div></div>
      <div class="company-setup-actions"><button class="btn btn-primary" type="button" data-action="company-setup-retry-load">Try again</button></div>
    `, state);
  }

  function renderEntry(companyId, companyLabel, state) {
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-intro">
        <div><i class="ti ti-wand"></i><strong>About 2 minutes</strong><span>Answer five short questions and get a setup built around your operation.</span></div>
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

  function renderBlueprints(companyId, companyLabel, state) {
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-progress-head"><div><span>Ready-made setups</span><strong>Pick a starting point</strong></div><small>You can edit everything on the next screen.</small></div>
      <div class="company-setup-blueprint-grid">
        ${COMPANY_SETUP_BLUEPRINTS.map((blueprint) => `
          <button type="button" class="company-setup-blueprint-card ${blueprint.id === 'roofing' ? 'featured' : ''}" data-action="company-setup-choose-blueprint" data-blueprint="${h(blueprint.id)}">
            <i class="ti ${blueprint.id === 'blank' ? 'ti-file' : 'ti-layout-dashboard'}"></i>
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

  function renderQuestion(companyId, companyLabel, state) {
    const question = COMPANY_SETUP_QUESTIONS[state.questionIndex] || COMPANY_SETUP_QUESTIONS[0];
    const progress = Math.round(((state.questionIndex + 1) / COMPANY_SETUP_QUESTIONS.length) * 100);
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-progress-head">
        <div><span>Question ${state.questionIndex + 1} of ${COMPANY_SETUP_QUESTIONS.length}</span><strong>${h(question.title)}</strong></div>
        <small>${question.multiple ? 'Choose all that apply.' : 'Choose one.'}</small>
      </div>
      <div class="company-setup-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>
      ${state.error ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i>${h(state.error)}</div>` : ''}
      <div class="company-setup-option-grid ${question.multiple ? 'multi' : ''}">
        ${question.options.map(([value, label]) => {
          const selected = answerIsSelected(state.answers, question, value);
          return `<button type="button" class="company-setup-option ${selected ? 'selected' : ''}" data-action="company-setup-select-option" data-question="${h(question.id)}" data-value="${h(value)}" data-multiple="${question.multiple ? 'true' : 'false'}" aria-pressed="${selected ? 'true' : 'false'}"><span>${h(label)}</span><i class="ti ${selected ? 'ti-circle-check-filled' : 'ti-circle'}"></i></button>`;
        }).join('')}
      </div>
      <div class="company-setup-actions split">
        <button class="btn" type="button" data-action="company-setup-question-back"><i class="ti ti-arrow-left"></i>Back</button>
        <div><button class="company-setup-blank-link" type="button" data-action="company-setup-start-blank">Start from scratch</button><button class="btn btn-primary" type="button" data-action="company-setup-question-next">${state.questionIndex === COMPANY_SETUP_QUESTIONS.length - 1 ? 'Review setup' : 'Next'}<i class="ti ti-arrow-right"></i></button></div>
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
          <label class="company-setup-stage-editor"><span>Pipeline stages <small>One per line</small></span><textarea rows="${Math.min(8, Math.max(4, (workspace.stages || []).length))}" data-company-setup-stages data-workspace-index="${workspaceIndex}">${h((workspace.stages || []).join('\n'))}</textarea></label>
        `}
      </section>
    `;
  }

  function renderReview(companyId, companyLabel, state) {
    const plan = state.plan || buildCompanySetupPlan({ mode: 'blank' });
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-progress-head"><div><span>Review</span><strong>Your recommended Questbase setup</strong></div><small>Edit names, apps, roles, or stages before applying.</small></div>
      <div class="company-setup-alert info"><i class="ti ti-database-heart"></i><div><strong>Safe to change</strong><span>Applying a new setup never deletes existing business records. Pipelines with live contacts, quotes, or jobs are preserved.</span></div></div>
      ${state.error ? `<div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i><div><strong>Setup needs attention</strong><span>${h(state.error)}</span></div></div>` : ''}
      <div class="company-setup-review-layout">
        <div class="company-setup-review-main">
          <h3>Workspaces</h3>
          ${plan.workspaces.map(renderWorkspaceEditor).join('')}
        </div>
        <aside class="company-setup-review-side">
          <section>
            <div class="company-setup-side-head"><h3>Role starters</h3><button type="button" data-action="company-setup-edit-answers">Edit teams</button></div>
            ${(plan.roles || []).map((role, roleIndex) => `
              <label class="company-setup-role-editor"><span><i class="ti ti-user-shield"></i><small>${h(role.purpose || 'Non-owner workspace role')}</small></span><input type="text" value="${h(role.name)}" maxlength="64" data-company-setup-role-name data-role-index="${roleIndex}" /></label>
            `).join('') || '<p class="company-setup-muted">No worker roles will be created. Owner access remains unchanged.</p>'}
          </section>
          <section class="company-setup-scope-note"><h3>Data scope</h3><p>Some apps store workspace-specific records; company-wide apps stay shared inside this company. Scope is shown beside every app.</p></section>
        </aside>
      </div>
      <div class="company-setup-actions split sticky">
        <div><button class="btn" type="button" data-action="company-setup-edit-answers"><i class="ti ti-arrow-left"></i>Edit answers</button>${hasAppliedSetup(state) ? '<button class="btn danger-quiet" type="button" data-action="company-setup-open-reset">Reset setup answers</button>' : ''}</div>
        <button class="btn btn-primary" type="button" data-action="company-setup-apply" ${state.applying ? 'disabled' : ''}>${state.applying ? '<span class="company-setup-button-spinner"></span>Applying safely…' : '<i class="ti ti-wand"></i>Apply setup'}</button>
      </div>
    `, state);
  }

  function renderApplied(companyId, companyLabel, state) {
    const plan = state.plan || resumablePlan(state.profile?.applied_plan) || buildCompanySetupPlan({ mode: 'blank' });
    const warnings = (state.profile?.applied_plan?.warnings || plan.warnings || []).map(warningMessage).filter(Boolean);
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-complete">
        <span class="company-setup-complete-icon"><i class="ti ti-check"></i></span>
        <div><span>Setup applied</span><h3>Your Questbase structure is ready</h3><p>${h(plan.workspaces.length)} workspace${plan.workspaces.length === 1 ? '' : 's'}, ${h(plan.roles.length)} role starter${plan.roles.length === 1 ? '' : 's'}, and the selected apps are configured.</p></div>
      </div>
      <div class="company-setup-summary-grid">
        ${plan.workspaces.map((workspace) => `<section><i class="ti ti-layout-dashboard"></i><div><strong>${h(workspace.name)}</strong><span>${h((workspace.pluginIds || []).length)} apps · ${h((workspace.stages || []).length)} stages${workspace.isDefault ? ' · Default' : ''}</span></div></section>`).join('')}
      </div>
      ${warnings.length ? `<div class="company-setup-alert warning"><i class="ti ti-alert-triangle"></i><div><strong>Kept safe</strong><span>${warnings.map((warning) => h(warning)).join(' ')}</span></div></div>` : ''}
      <div class="company-setup-reset-card">
        <div><strong>Need a different setup?</strong><span>You can adjust the current plan, or clear only the answers and run the guide again.</span></div>
        <div><button class="btn" type="button" data-action="company-setup-adjust"><i class="ti ti-adjustments"></i>Adjust setup</button><button class="btn danger-quiet" type="button" data-action="company-setup-open-reset">Reset setup answers</button></div>
      </div>
    `, state);
  }

  function renderReset(companyId, companyLabel, state) {
    return renderShell(companyId, companyLabel, `
      <div class="company-setup-reset-confirm">
        <span class="company-setup-reset-icon"><i class="ti ti-refresh-alert"></i></span>
        <div><span>Reset setup answers</span><h3>Reopen the company setup guide?</h3><p>${h(RESET_COMPANY_SETUP_COPY)}</p></div>
      </div>
      ${state.error ? `<div class="company-setup-alert danger"><i class="ti ti-alert-circle"></i>${h(state.error)}</div>` : ''}
      <div class="company-setup-preserved-grid">
        ${['Company account', 'People and access', 'Workspaces', 'Customers and quotes', 'Jobs and tasks', 'Files and messages'].map((label) => `<span><i class="ti ti-check"></i>${h(label)}</span>`).join('')}
      </div>
      <div class="company-setup-actions split">
        <button class="btn" type="button" data-action="company-setup-cancel-reset">Cancel</button>
        <button class="btn btn-danger" type="button" data-action="company-setup-confirm-reset" ${state.resetting ? 'disabled' : ''}>${state.resetting ? 'Resetting…' : 'Reset answers and reopen guide'}</button>
      </div>
    `, state);
  }

  async function loadCompany(companyId) {
    const id = String(companyId || '');
    const previous = current(id) || setupStateFromProfile(null);
    setCurrent(id, { ...previous, loading: true, loaded: false, error: '' });

    if (!isLive()) {
      setCurrent(id, setupStateFromProfile(null));
      requestRender();
      return;
    }

    try {
      const client = createClient();
      if (!client) throw new Error('Questbase could not connect to company setup.');
      const result = await client
        .from('company_setup_profiles')
        .select('company_id,answers,draft_plan,applied_plan,status,setup_version,reset_count,applied_at,reset_at,updated_at')
        .eq('company_id', id)
        .maybeSingle();
      if (result.error) throw result.error;
      setCurrent(id, setupStateFromProfile(result.data || null));
    } catch (error) {
      setCurrent(id, { ...setupStateFromProfile(null), loaded: true, loading: false, error: error?.message || 'Setup could not load.' });
    }
    requestRender();
  }

  async function saveDraft(companyId, state) {
    if (!isLive()) return;
    const client = createClient();
    if (!client) return;
    const answers = {
      ...clone(state.answers),
      ui: { screen: state.screen, questionIndex: state.questionIndex },
    };
    const result = await client.rpc('save_company_setup_draft', {
      target_company_id: companyId,
      p_answers: answers,
      p_draft_plan: state.plan || {},
    });
    if (result.error) {
      state.saveError = result.error.message || 'Setup progress could not be saved.';
      requestRender();
      return;
    }
    state.saveError = '';
    state.profile = { ...(state.profile || {}), status: 'draft', answers, draft_plan: state.plan || {} };
  }

  function scheduleDraft(companyId, state) {
    clearTimeout(saveTimers.get(companyId));
    saveTimers.set(companyId, setTimeout(() => {
      saveDraft(companyId, state).catch(() => {});
      saveTimers.delete(companyId);
    }, 700));
  }

  async function selectPlan(companyId, state, answers) {
    state.answers = answers;
    state.plan = buildCompanySetupPlan(answers);
    state.screen = 'review';
    state.error = '';
    requestRender();
    await saveDraft(companyId, state);
  }

  async function applySetup(companyId, state) {
    if (!isLive()) {
      state.error = 'A live Questbase account is required to apply company setup.';
      requestRender();
      return;
    }
    try {
      state.plan = validateCompanySetupPlan(state.plan);
    } catch (error) {
      state.error = error?.message || 'Review the setup before applying it.';
      requestRender();
      return;
    }

    state.applying = true;
    state.error = '';
    requestRender();
    try {
      const client = createClient();
      const result = await client.rpc('apply_company_setup', {
        target_company_id: companyId,
        p_answers: { ...clone(state.answers), ui: { screen: 'applied', questionIndex: state.questionIndex } },
        p_plan: state.plan,
      });
      if (result.error) throw result.error;
      const applied = safeObject(result.data?.plan);
      state.profile = {
        ...(state.profile || {}),
        status: 'applied',
        answers: state.answers,
        draft_plan: state.plan,
        applied_plan: applied,
      };
      state.plan = resumablePlan(applied) || state.plan;
      state.screen = 'applied';
      state.applying = false;
      await onApplied(companyId);
      showToast('Company setup applied.', 'live', 'Setup');
    } catch (error) {
      state.applying = false;
      state.error = error?.message || 'Setup could not be applied. Nothing was partially deleted; try again.';
    }
    requestRender();
  }

  async function resetSetup(companyId, state) {
    if (!isLive()) {
      state.error = 'A live Questbase account is required to reset setup answers.';
      requestRender();
      return;
    }
    state.resetting = true;
    state.error = '';
    requestRender();
    try {
      const client = createClient();
      const result = await client.rpc('reset_company_setup', { target_company_id: companyId });
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
      });
      resetState.screen = 'entry';
      resetState.plan = null;
      resetState.answers = clone(EMPTY_ANSWERS);
      setCurrent(companyId, resetState);
      showToast('Setup answers reset. Your company records were preserved.', 'live', 'Setup');
    } catch (error) {
      state.resetting = false;
      state.error = error?.message || 'Setup answers could not be reset.';
    }
    requestRender();
  }

  function render(companyId, { companyLabel = 'this company', canManage = true } = {}) {
    const id = String(companyId || '');
    let state = current(id);
    if (!state) {
      state = setCurrent(id, { ...setupStateFromProfile(null), loaded: false, loading: true });
      defer(() => loadCompany(id));
    }
    if (!canManage) {
      return renderShell(id, companyLabel, '<div class="company-setup-alert warning"><i class="ti ti-lock"></i>Owner or Admin access is required to change company setup.</div>', state);
    }
    if (state.loading || !state.loaded) return renderLoading(id, companyLabel, state);
    if (state.error && state.screen === 'entry' && !state.profile) return renderLoadError(id, companyLabel, state);

    let html;
    if (state.screen === 'blueprints') html = renderBlueprints(id, companyLabel, state);
    else if (state.screen === 'question') html = renderQuestion(id, companyLabel, state);
    else if (state.screen === 'review') html = renderReview(id, companyLabel, state);
    else if (state.screen === 'applied') html = renderApplied(id, companyLabel, state);
    else if (state.screen === 'reset') html = renderReset(id, companyLabel, state);
    else html = renderEntry(id, companyLabel, state);

    defer(() => mount(id));
    return html;
  }

  function mount(companyId) {
    if (typeof document === 'undefined') return;
    const root = document.querySelector(`[data-company-setup-root][data-company-id="${CSS.escape(String(companyId))}"]`);
    const state = current(companyId);
    if (!root || !state || root.dataset.companySetupBound === 'true') return;
    root.dataset.companySetupBound = 'true';

    root.querySelectorAll('[data-company-setup-workspace-name]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'workspace-name', workspaceIndex: input.dataset.workspaceIndex, value: input.value });
        state.error = '';
        scheduleDraft(companyId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-role-name]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'role-name', roleIndex: input.dataset.roleIndex, value: input.value });
        state.error = '';
        scheduleDraft(companyId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-stages]').forEach((input) => {
      input.addEventListener('input', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'stages', workspaceIndex: input.dataset.workspaceIndex, value: input.value });
        state.error = '';
        scheduleDraft(companyId, state);
      });
    });
    root.querySelectorAll('[data-company-setup-plugin]').forEach((input) => {
      input.addEventListener('change', () => {
        state.plan = editCompanySetupPlan(state.plan, { type: 'plugin', workspaceIndex: input.dataset.workspaceIndex, pluginId: input.dataset.pluginId, checked: input.checked });
        state.error = '';
        scheduleDraft(companyId, state);
        requestRender();
      });
    });
  }

  async function handleAction(action, node) {
    const root = node?.closest?.('[data-company-setup-root]');
    const companyId = String(root?.dataset.companyId || node?.dataset.companyId || '');
    if (!companyId) return;
    let state = current(companyId);
    if (!state) {
      await loadCompany(companyId);
      state = current(companyId);
    }

    if (action === 'company-setup-retry-load') {
      await loadCompany(companyId);
      return;
    }
    if (action === 'company-setup-guide') {
      state.answers = clone(EMPTY_ANSWERS);
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
      await saveDraft(companyId, state);
      return;
    }
    if (action === 'company-setup-start-blank') {
      await selectPlan(companyId, state, answersForBlueprint('blank'));
      return;
    }
    if (action === 'company-setup-choose-blueprint') {
      await selectPlan(companyId, state, answersForBlueprint(node.dataset.blueprint));
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
      await saveDraft(companyId, state);
      return;
    }
    if (action === 'company-setup-question-next') {
      const question = COMPANY_SETUP_QUESTIONS[state.questionIndex];
      if (!questionAnswered(state.answers, question)) {
        state.error = question.multiple ? 'Choose at least one option to continue.' : 'Choose one option to continue.';
        requestRender();
        return;
      }
      if (state.questionIndex < COMPANY_SETUP_QUESTIONS.length - 1) {
        state.questionIndex += 1;
        state.error = '';
        requestRender();
        await saveDraft(companyId, state);
        return;
      }
      await selectPlan(companyId, state, state.answers);
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
      await applySetup(companyId, state);
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
    if (action === 'company-setup-confirm-reset') await resetSetup(companyId, state);
  }

  return { render, mount, handleAction, loadCompany };
}
