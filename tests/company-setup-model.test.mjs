import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPANY_SETUP_BLUEPRINTS,
  COMPANY_SETUP_QUESTIONS,
  WORKSPACE_SETUP_QUESTIONS,
  answersForBlueprint,
  answersForWorkspaceBlueprint,
  buildCompanySetupPlan,
  buildWorkspaceSetupPlan,
  normalizeCompanySetupAnswers,
  validateCompanySetupPlan,
  validateWorkspaceSetupPlan,
} from '../src/onboarding/company-setup-model.js';

test('the setup model exposes the seven approved ready-made choices', () => {
  assert.deepEqual(
    COMPANY_SETUP_BLUEPRINTS.map((item) => item.id),
    ['roofing', 'crm_sales', 'construction', 'home_services', 'internal', 'quick_starter', 'blank'],
  );
  assert.deepEqual(
    COMPANY_SETUP_QUESTIONS.map((item) => item.id),
    ['goal', 'industry', 'layout', 'teams', 'tools'],
  );
});

test('workspace setup removes the company layout question', () => {
  assert.deepEqual(
    WORKSPACE_SETUP_QUESTIONS.map((item) => item.id),
    ['goal', 'industry', 'teams', 'tools'],
  );
});

test('every ready-made workspace setup configures exactly the selected workspace', () => {
  for (const blueprint of COMPANY_SETUP_BLUEPRINTS) {
    const workspace = { id: `workspace-${blueprint.id}`, name: `North ${blueprint.label}` };
    const plan = buildWorkspaceSetupPlan(answersForWorkspaceBlueprint(blueprint.id), workspace);

    assert.equal(plan.workspaces.length, 1, blueprint.id);
    assert.equal(plan.workspaces[0].name, workspace.name, blueprint.id);
    assert.deepEqual(validateWorkspaceSetupPlan(plan), plan, blueprint.id);
  }
});

test('guided workspace answers cannot generate sibling workspaces', () => {
  const plan = buildWorkspaceSetupPlan({
    mode: 'guided',
    goal: 'sales_to_jobs',
    industry: 'roofing',
    layout: 'sales_est_prod',
    teams: ['sales', 'estimating', 'production_projects'],
    tools: ['crm_quotes', 'underwriter_price_book', 'tasks_files'],
  }, { id: 'workspace-roofing', name: 'Roofing' });

  assert.equal(plan.workspaces.length, 1);
  assert.equal(plan.workspaces[0].name, 'Roofing');
  assert.throws(
    () => validateWorkspaceSetupPlan({ ...plan, workspaces: [...plan.workspaces, { ...plan.workspaces[0], key: 'sibling', name: 'CRM' }] }),
    /exactly one workspace/i,
  );
});

test('blank setup keeps only Main with no optional apps, stages, or generated roles', () => {
  const plan = buildCompanySetupPlan({ mode: 'blank' });

  assert.equal(plan.version, 1);
  assert.equal(plan.profile, 'blank');
  assert.deepEqual(plan.workspaces, [{
    key: 'main',
    name: 'Main',
    isDefault: true,
    pluginIds: [],
    pipelineKind: 'blank',
    stages: [],
  }]);
  assert.deepEqual(plan.roles, []);
});

test('roofing blueprint creates sales, estimating, and production without conflicting CRM variants', () => {
  const answers = answersForBlueprint('roofing');
  const plan = buildCompanySetupPlan(answers);

  assert.equal(answers.mode, 'blueprint');
  assert.equal(plan.profile, 'roofing');
  assert.deepEqual(plan.workspaces.map((item) => item.key), ['sales', 'estimating', 'production']);
  assert.equal(plan.workspaces[0].isDefault, true);
  assert.equal(plan.workspaces.slice(1).every((item) => item.isDefault === false), true);
  assert.equal(plan.workspaces.some((item) => item.pluginIds.includes('crm_2')), true);
  assert.equal(plan.workspaces.every((item) => !(item.pluginIds.includes('crm') && item.pluginIds.includes('crm_2'))), true);
  assert.deepEqual(
    plan.roles.map((item) => item.key),
    ['salesperson', 'estimator', 'production_coordinator', 'field_crew', 'office_finance'],
  );
});

test('each ready-made setup expands through the same valid plan model', () => {
  for (const blueprint of COMPANY_SETUP_BLUEPRINTS) {
    const plan = buildCompanySetupPlan(answersForBlueprint(blueprint.id));
    assert.deepEqual(validateCompanySetupPlan(plan), plan, blueprint.id);
  }
});

test('normalization removes unknown values and duplicate team/tool choices', () => {
  assert.deepEqual(normalizeCompanySetupAnswers({
    mode: 'surprise',
    goal: 'crm_sales',
    industry: 'roofing',
    layout: 'custom',
    teams: ['sales', 'sales', 'unknown', 'field_crew'],
    tools: ['crm_quotes', 'crm_quotes', 'unknown', 'time_clock'],
  }), {
    mode: 'guided',
    blueprint: '',
    goal: 'crm_sales',
    industry: 'roofing',
    layout: 'custom',
    teams: ['sales', 'field_crew'],
    tools: ['crm_quotes', 'time_clock'],
  });
});

test('custom layout deduplicates team destinations and never exceeds six workspaces', () => {
  const plan = buildCompanySetupPlan({
    mode: 'guided',
    goal: 'internal_custom',
    industry: 'mixed',
    layout: 'custom',
    teams: ['cold_calling', 'sales', 'estimating', 'production_projects', 'field_crew', 'finance_office'],
    tools: ['tasks_files', 'messages_calendar'],
  });

  assert.deepEqual(
    plan.workspaces.map((item) => item.key),
    ['lead_generation', 'sales', 'estimating', 'production', 'field_operations', 'office'],
  );
  assert.equal(new Set(plan.workspaces.map((item) => item.name.toLowerCase())).size, plan.workspaces.length);
});

test('one-workspace guided setup combines selected tools in Main', () => {
  const plan = buildCompanySetupPlan({
    mode: 'guided',
    goal: 'sales_to_jobs',
    industry: 'construction',
    layout: 'one',
    teams: ['sales', 'production_projects'],
    tools: ['crm_quotes', 'tasks_files', 'messages_calendar', 'forms_approvals', 'finance_reporting'],
  });

  assert.deepEqual(plan.workspaces.map((item) => item.name), ['Main']);
  assert.deepEqual(plan.workspaces[0].pluginIds, [
    'crm', 'tasks', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting',
  ]);
});

test('generated roles are limited to approved non-elevated role keys', () => {
  const plan = buildCompanySetupPlan({
    mode: 'guided',
    teams: ['cold_calling', 'sales', 'estimating', 'production_projects', 'field_crew', 'finance_office'],
  });

  assert.deepEqual(plan.roles.map((item) => item.key), [
    'cold_caller', 'salesperson', 'estimator', 'production_coordinator', 'field_crew', 'office_finance',
  ]);
  assert.equal(plan.roles.some((item) => /owner|admin|developer/i.test(item.key)), false);
});

test('editable plans reject unknown apps, duplicate names, unsafe roles, and excessive stages', () => {
  const base = buildCompanySetupPlan(answersForBlueprint('quick_starter'));

  assert.throws(
    () => validateCompanySetupPlan({
      ...base,
      workspaces: [{ ...base.workspaces[0], pluginIds: ['tasks', 'mystery_app'] }],
    }),
    /unknown app/i,
  );

  assert.throws(
    () => validateCompanySetupPlan({
      ...base,
      workspaces: [
        { ...base.workspaces[0], key: 'first', name: 'Sales' },
        { ...base.workspaces[0], key: 'second', name: ' sales ', isDefault: false },
      ],
    }),
    /workspace names must be unique/i,
  );

  assert.throws(
    () => validateCompanySetupPlan({ ...base, roles: [{ key: 'owner', name: 'Another owner' }] }),
    /unknown role template/i,
  );

  assert.throws(
    () => validateCompanySetupPlan({
      ...base,
      workspaces: [{ ...base.workspaces[0], stages: Array.from({ length: 51 }, (_, index) => `Stage ${index + 1}`) }],
    }),
    /50 stages/i,
  );
});

test('editable plans normalize names, remove duplicate apps and stages, and preserve one default', () => {
  const base = buildCompanySetupPlan(answersForBlueprint('crm_sales'));
  const plan = validateCompanySetupPlan({
    ...base,
    workspaces: base.workspaces.map((workspace, index) => ({
      ...workspace,
      name: `  ${workspace.name}  `,
      isDefault: true,
      pluginIds: [...workspace.pluginIds, ...workspace.pluginIds],
      stages: [...workspace.stages, workspace.stages[0]],
    })),
  });

  assert.equal(plan.workspaces[0].isDefault, true);
  assert.equal(plan.workspaces.slice(1).every((item) => item.isDefault === false), true);
  assert.equal(plan.workspaces.every((item) => item.name === item.name.trim()), true);
  assert.equal(plan.workspaces.every((item) => new Set(item.pluginIds).size === item.pluginIds.length), true);
  assert.equal(plan.workspaces.every((item) => new Set(item.stages.map((stage) => stage.toLowerCase())).size === item.stages.length), true);
});
