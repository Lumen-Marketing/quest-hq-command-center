import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { answersForBlueprint, buildCompanySetupPlan } from '../src/onboarding/company-setup-model.js';
import {
  RESET_COMPANY_SETUP_COPY,
  RESET_WORKSPACE_SETUP_COPY,
  createCompanySetupPanel,
  createWorkspaceSetupPanel,
  editCompanySetupPlan,
  setupStateFromProfile,
} from '../src/onboarding/company-setup-panel.js';

const mainPath = fileURLToPath(new URL('../src/main.js', import.meta.url));
const authPath = fileURLToPath(new URL('../src/ui/auth-form.js', import.meta.url));
const runtimePath = fileURLToPath(new URL('../src/onboarding/company-setup-runtime.js', import.meta.url));
const main = readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n');
const auth = readFileSync(authPath, 'utf8').replace(/\r\n/g, '\n');
const runtime = readFileSync(runtimePath, 'utf8').replace(/\r\n/g, '\n');
const panelSource = readFileSync(fileURLToPath(new URL('../src/onboarding/company-setup-panel.js', import.meta.url)), 'utf8').replace(/\r\n/g, '\n');

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} must exist`);
  const tail = source.slice(start + 1);
  const nextMatch = /\n(?:async\s+)?function\s+/.exec(tail);
  const next = nextMatch ? start + 1 + nextMatch.index : -1;
  return source.slice(start, next < 0 ? source.length : next);
}

test('company creation no longer asks owners to choose a technical company type', () => {
  assert.doesNotMatch(auth, /workspacePresetSelect|Company type/);
  assert.doesNotMatch(functionBody(main, 'renderNoCompanyAccess'), /workspacePresetSelect|Company type/);

  const register = functionBody(main, 'registerWorkspace');
  const create = functionBody(main, 'createWorkspaceForCurrentUser');
  assert.match(register, /preset_code:\s*'blank'/);
  assert.match(create, /preset_code:\s*'blank'/);
  assert.doesNotMatch(register, /form\.preset_code/);
  assert.doesNotMatch(create, /form\.preset_code/);
});

test('new owners see required setup over their workspace rather than being stranded in Settings', () => {
  const register = functionBody(main, 'registerWorkspace');
  const create = functionBody(main, 'createWorkspaceForCurrentUser');

  for (const body of [register, create]) {
    assert.match(body, /companyPath\('workspaces'/);
    assert.match(body, /openWorkspaceSetupModal\([^)]*required:\s*true/);
    assert.doesNotMatch(body, /companyPath\('settings', \{ tab: 'setup' \}/);
    assert.doesNotMatch(body, /companyPath\('settings', \{ tab: 'billing' \}/);
    assert.doesNotMatch(body, /applyPluginPresetLocal/);
  }
});

test('Setup > Workspaces opens the dismissible setup modal and still lazy-loads its interface', () => {
  assert.match(main, /import\('\.\/onboarding\/company-setup-runtime\.js'\)/);
  assert.match(runtime, /import '\.\/company-setup\.css'/);
  assert.match(runtime, /from '\.\/company-setup-panel\.js'/);
  assert.match(main, /companyPath\('setup', \{ tab: 'workspaces' \}/);
  assert.match(main, /renderCompanySetupSettings\(companyId, route\)/);
  assert.match(main, /data-action="open-workspace-setup"/);
  assert.match(main, /state\.modal = required \? 'workspace-setup-required' : 'workspace-setup'/);
  assert.match(main, /companySetupPanelModule\.render\(workspace\.id,[\s\S]*presentation:\s*'modal'/);
  assert.match(main, /action\.startsWith\('company-setup-'\)/);
  assert.match(main, /companySetupPanelModule\.handleAction/);
});

test('setup modal is mandatory after creation and cancellable only when reopened from Settings', async () => {
  let closes = 0;
  const panel = createWorkspaceSetupPanel({
    createClient: () => fakeClient(null, async () => ({ data: { status: 'draft' }, error: null })),
    isLive: () => true,
    onClose: () => { closes += 1; },
  });
  const workspaceId = '11111111-1111-4111-8111-111111111111';
  const node = fakeActionNode('company-a', workspaceId);
  await panel.loadWorkspace(workspaceId);

  const required = panel.render(workspaceId, {
    companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales', presentation: 'modal', canCancel: false,
  });
  assert.match(required, /role="dialog"/);
  assert.match(required, /Start from scratch/);
  assert.doesNotMatch(required, /data-action="company-setup-close"/);
  await panel.handleAction('company-setup-close', node);
  assert.equal(closes, 0, 'a synthetic close action must not bypass required setup');

  const optional = panel.render(workspaceId, {
    companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales', presentation: 'modal', canCancel: true,
  });
  assert.match(optional, /data-action="company-setup-close"[^>]*>Cancel</);
  await panel.handleAction('company-setup-close', node);
  assert.equal(closes, 1);
});

test('the work-type question renders a search field and the expanded job catalog', async () => {
  const panel = createWorkspaceSetupPanel({
    createClient: () => fakeClient(null, async () => ({ data: { status: 'draft' }, error: null })),
    isLive: () => true,
  });
  const workspaceId = '11111111-1111-4111-8111-111111111111';
  const node = fakeActionNode('company-a', workspaceId);
  await panel.loadWorkspace(workspaceId);
  panel.render(workspaceId, { companyId: 'company-a', workspaceLabel: 'Sales' });
  await panel.handleAction('company-setup-guide', node);
  await panel.handleAction('company-setup-select-option', fakeActionNode('company-a', workspaceId, {
    question: 'goal', value: 'sales_to_jobs', multiple: 'false',
  }));
  await panel.handleAction('company-setup-question-next', node);
  const html = panel.render(workspaceId, { companyId: 'company-a', workspaceLabel: 'Sales' });
  assert.match(html, /data-company-setup-work-type-search/);
  assert.match(html, /placeholder="Search work types"/);
  assert.match(html, /Plumbing/);
  assert.match(html, /Healthcare/);
});

test('Escape and generic close cannot dismiss required setup', () => {
  assert.match(functionBody(main, 'closeActiveModal'), /workspace-setup-required/);
  assert.match(functionBody(main, 'closeActiveModal'), /workspace-setup-required'\) return false/);
  assert.match(functionBody(main, 'dismissTopModal'), /closeActiveModal\(\) !== false/);
  assert.match(functionBody(main, 'closeAppliedWorkspaceSetupModal'), /state\.modal = 'workspace-setup'/);
});

test('setup state resumes a saved review and distinguishes an applied setup', () => {
  const answers = answersForBlueprint('roofing');
  const plan = buildCompanySetupPlan(answers);

  assert.equal(setupStateFromProfile(null).screen, 'entry');
  assert.equal(setupStateFromProfile({ status: 'draft', answers, draft_plan: plan }).screen, 'review');
  assert.equal(setupStateFromProfile({ status: 'applied', answers, applied_plan: plan }).screen, 'applied');
});

test('review editing supports workspace names, apps, role labels, and stages', () => {
  const original = buildCompanySetupPlan(answersForBlueprint('roofing'));
  const renamed = editCompanySetupPlan(original, { type: 'workspace-name', workspaceIndex: 0, value: 'Revenue' });
  const withApp = editCompanySetupPlan(renamed, { type: 'plugin', workspaceIndex: 0, pluginId: 'calls', checked: true });
  const withoutApp = editCompanySetupPlan(withApp, { type: 'plugin', workspaceIndex: 0, pluginId: 'tasks', checked: false });
  const role = editCompanySetupPlan(withoutApp, { type: 'role-name', roleIndex: 0, value: 'Roofing Sales' });
  const stages = editCompanySetupPlan(role, { type: 'stages', workspaceIndex: 0, value: 'Lead\nQualified\nWon' });

  assert.equal(stages.workspaces[0].name, 'Revenue');
  assert.equal(stages.workspaces[0].pluginIds.includes('calls'), true);
  assert.equal(stages.workspaces[0].pluginIds.includes('tasks'), false);
  assert.equal(stages.roles[0].name, 'Roofing Sales');
  assert.deepEqual(stages.workspaces[0].stages, ['Lead', 'Qualified', 'Won']);
  assert.equal(original.workspaces[0].name, 'Sales', 'edits must not mutate the last valid plan');
});

test('reset wording names both the cleared state and preserved records', () => {
  assert.match(RESET_COMPANY_SETUP_COPY, /clears the setup answers and reopens the guide/i);
  for (const noun of ['company', 'people', 'workspaces', 'customers', 'jobs', 'tasks', 'files', 'messages']) {
    assert.match(RESET_COMPANY_SETUP_COPY, new RegExp(noun, 'i'));
  }
  assert.match(RESET_COMPANY_SETUP_COPY, /does not delete/i);
});

test('setup state maps legacy industry answers into the searchable work-type question', () => {
  const state = setupStateFromProfile({
    status: 'draft',
    answers: { industry: 'roofing', ui: { screen: 'question', questionIndex: 1 } },
  });
  assert.equal(state.screen, 'question');
  assert.equal(state.answers.workType, 'roofing');
});

test('workspace reset wording protects sibling workspaces and the applied configuration', () => {
  assert.match(RESET_WORKSPACE_SETUP_COPY, /selected workspace/i);
  assert.match(RESET_WORKSPACE_SETUP_COPY, /sibling workspaces/i);
  assert.match(RESET_WORKSPACE_SETUP_COPY, /applied configuration/i);
});

function fakeActionNode(companyId, workspaceId, dataset = {}) {
  return {
    dataset,
    closest: () => ({ dataset: { companyId, workspaceId } }),
  };
}

function fakeClient(profile, rpcHandler) {
  return {
    from: () => ({
      select() { return this; },
      eq() { return this; },
      async maybeSingle() { return { data: profile, error: null }; },
    }),
    rpc: rpcHandler,
  };
}

test('controller applies a reviewed workspace blueprint through draft then apply RPCs', async () => {
  const calls = [];
  const blankPlan = buildCompanySetupPlan({ mode: 'blank' });
  const client = fakeClient(null, async (name, args) => {
    calls.push({ name, args });
    if (name === 'apply_workspace_setup') return { data: { status: 'applied', plan: blankPlan, warnings: [] }, error: null };
    return { data: { status: 'draft' }, error: null };
  });
  const panel = createWorkspaceSetupPanel({ createClient: () => client, isLive: () => true });
  const workspaceId = '11111111-1111-4111-8111-111111111111';
  const node = fakeActionNode('company-a', workspaceId, { blueprint: 'quick_starter' });

  await panel.loadWorkspace(workspaceId);
  panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales' });
  await panel.handleAction('company-setup-choose-blueprint', node);
  await panel.handleAction('company-setup-apply', node);

  assert.deepEqual(calls.map((call) => call.name), ['save_workspace_setup_draft', 'apply_workspace_setup']);
  assert.equal(calls[0].args.p_expected_revision, 0);
  assert.equal(calls[1].args.p_expected_revision, 0);
  assert.match(panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales' }), /Sales is ready/);
});

test('controller reset calls only the non-destructive reset RPC and returns to entry', async () => {
  const calls = [];
  const plan = buildCompanySetupPlan(answersForBlueprint('roofing'));
  const profile = { status: 'applied', answers: answersForBlueprint('roofing'), draft_plan: plan, applied_plan: plan };
  const client = fakeClient(profile, async (name, args) => {
    calls.push({ name, args });
    return { data: { status: 'draft', reset_count: 1 }, error: null };
  });
  const panel = createWorkspaceSetupPanel({ createClient: () => client, isLive: () => true });
  const workspaceId = '11111111-1111-4111-8111-111111111111';
  const node = fakeActionNode('company-a', workspaceId);

  await panel.loadWorkspace(workspaceId);
  panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Roofing' });
  await panel.handleAction('company-setup-open-reset', node);
  assert.match(panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Roofing' }), /Reopen this workspace setup guide/);
  await panel.handleAction('company-setup-confirm-reset', node);

  assert.deepEqual(calls.map((call) => call.name), ['reset_workspace_setup']);
  assert.equal(calls[0].args.p_expected_revision, 0);
  assert.match(panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Roofing' }), /Guide me/);
});

test('workspace controller loads by workspace id and Start from scratch applies immediately', async () => {
  const calls = [];
  const filters = [];
  const blankPlan = buildCompanySetupPlan({ mode: 'blank' });
  const client = {
    from(table) {
      filters.push({ table });
      return {
        select() { return this; },
        eq(column, value) { filters.at(-1).column = column; filters.at(-1).value = value; return this; },
        async maybeSingle() { return { data: null, error: null }; },
      };
    },
    async rpc(name, args) {
      calls.push({ name, args });
      return { data: { status: 'applied', plan: blankPlan, warnings: [] }, error: null };
    },
  };
  const panel = createWorkspaceSetupPanel({ createClient: () => client, isLive: () => true });
  const node = {
    dataset: {},
    closest: () => ({ dataset: { companyId: 'company-a', workspaceId: '11111111-1111-4111-8111-111111111111' } }),
  };

  await panel.loadWorkspace('11111111-1111-4111-8111-111111111111');
  panel.render('11111111-1111-4111-8111-111111111111', {
    companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Roofing',
  });
  await panel.handleAction('company-setup-start-blank', node);

  assert.deepEqual(filters, [{
    table: 'workspace_setup_profiles', column: 'workspace_id', value: '11111111-1111-4111-8111-111111111111',
  }]);
  assert.deepEqual(calls.map((call) => call.name), ['apply_workspace_setup']);
  assert.equal(calls[0].args.p_expected_revision, 0);
  assert.equal(calls[0].args.target_workspace_id, '11111111-1111-4111-8111-111111111111');
  assert.match(panel.render('11111111-1111-4111-8111-111111111111', {
    companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Roofing',
  }), /Roofing/);
});

test('blank setup is only the small direct Start from scratch action', async () => {
  const client = fakeClient(null, async () => ({ data: { status: 'draft', revision: 1 }, error: null }));
  const panel = createWorkspaceSetupPanel({ createClient: () => client, isLive: () => true });
  const workspaceId = '11111111-1111-4111-8111-111111111111';
  const node = fakeActionNode('company-a', workspaceId);

  await panel.loadWorkspace(workspaceId);
  panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales' });
  await panel.handleAction('company-setup-open-blueprints', node);
  const html = panel.render(workspaceId, { companyId: 'company-a', companyLabel: 'Acme', workspaceLabel: 'Sales' });

  assert.match(html, /Start from scratch/);
  assert.doesNotMatch(html, /data-blueprint="blank"/);
});

test('apply and reset cancel delayed draft saves and use server revisions', () => {
  assert.match(panelSource, /function cancelScheduledDraft\(workspaceId\)/);
  assert.match(functionBody(panelSource, 'applySetup'), /cancelScheduledDraft\(workspaceId\)/);
  assert.match(functionBody(panelSource, 'resetSetup'), /cancelScheduledDraft\(workspaceId\)/);
  assert.match(functionBody(panelSource, 'saveDraft'), /p_expected_revision:/);
  assert.match(functionBody(panelSource, 'applySetup'), /p_expected_revision:/);
  assert.match(functionBody(panelSource, 'resetSetup'), /p_expected_revision:/);
});
