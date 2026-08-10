export const COMPANY_SETUP_VERSION = 1;

const MODES = new Set(['guided', 'blueprint', 'blank']);
const GOALS = new Set(['crm_sales', 'sales_to_jobs', 'jobs_delivery', 'internal_custom']);
const INDUSTRIES = new Set(['roofing', 'construction', 'home_services', 'sales_agency', 'mixed']);
const LAYOUTS = new Set(['one', 'sales_ops', 'sales_est_prod', 'custom']);
const TEAM_IDS = ['cold_calling', 'sales', 'estimating', 'production_projects', 'field_crew', 'finance_office'];
const TOOL_IDS = [
  'crm_quotes',
  'tasks_files',
  'messages_calendar',
  'underwriter_price_book',
  'forms_approvals',
  'finance_reporting',
  'time_clock',
];

const TEAM_SET = new Set(TEAM_IDS);
const TOOL_SET = new Set(TOOL_IDS);

export const COMPANY_SETUP_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'goal',
    title: 'What do you mainly need Questbase to organize?',
    multiple: false,
    options: Object.freeze([
      ['crm_sales', 'CRM and sales'],
      ['sales_to_jobs', 'Sales through completed jobs'],
      ['jobs_delivery', 'Jobs and project delivery'],
      ['internal_custom', 'Internal or custom work'],
    ]),
  }),
  Object.freeze({
    id: 'industry',
    title: 'What kind of company is this?',
    multiple: false,
    options: Object.freeze([
      ['roofing', 'Roofing'],
      ['construction', 'General construction'],
      ['home_services', 'Home service or trade'],
      ['sales_agency', 'Sales or agency'],
      ['mixed', 'Other or mixed'],
    ]),
  }),
  Object.freeze({
    id: 'layout',
    title: 'How should the work be separated?',
    multiple: false,
    options: Object.freeze([
      ['one', 'One workspace'],
      ['sales_ops', 'Sales and Operations'],
      ['sales_est_prod', 'Sales, Estimating, and Production'],
      ['custom', 'Build workspaces from my teams'],
    ]),
  }),
  Object.freeze({
    id: 'teams',
    title: 'Which teams use Questbase?',
    multiple: true,
    options: Object.freeze([
      ['cold_calling', 'Cold calling or lead generation'],
      ['sales', 'Sales'],
      ['estimating', 'Estimating'],
      ['production_projects', 'Production or projects'],
      ['field_crew', 'Field crew or technicians'],
      ['finance_office', 'Finance or office'],
    ]),
  }),
  Object.freeze({
    id: 'tools',
    title: 'Which tools are needed first?',
    multiple: true,
    options: Object.freeze([
      ['crm_quotes', 'CRM and quotes'],
      ['tasks_files', 'Tasks and files'],
      ['messages_calendar', 'Messages and calendar'],
      ['underwriter_price_book', 'Underwriter and price book'],
      ['forms_approvals', 'Forms and approvals'],
      ['finance_reporting', 'Finance and reporting'],
      ['time_clock', 'Time clock'],
    ]),
  }),
]);

export const WORKSPACE_SETUP_QUESTIONS = Object.freeze(
  COMPANY_SETUP_QUESTIONS
    .filter((question) => question.id !== 'layout')
    .map((question) => Object.freeze({
      ...question,
      title: question.id === 'industry' ? 'What kind of work is this workspace for?' : question.title,
    })),
);

const BLUEPRINT_ANSWERS = Object.freeze({
  roofing: Object.freeze({
    goal: 'sales_to_jobs',
    industry: 'roofing',
    layout: 'sales_est_prod',
    teams: ['sales', 'estimating', 'production_projects', 'field_crew', 'finance_office'],
    tools: TOOL_IDS,
  }),
  crm_sales: Object.freeze({
    goal: 'crm_sales',
    industry: 'sales_agency',
    layout: 'one',
    teams: ['cold_calling', 'sales'],
    tools: ['crm_quotes', 'tasks_files', 'messages_calendar', 'finance_reporting'],
  }),
  construction: Object.freeze({
    goal: 'jobs_delivery',
    industry: 'construction',
    layout: 'sales_ops',
    teams: ['sales', 'production_projects', 'field_crew', 'finance_office'],
    tools: ['crm_quotes', 'tasks_files', 'messages_calendar', 'forms_approvals', 'finance_reporting', 'time_clock'],
  }),
  home_services: Object.freeze({
    goal: 'sales_to_jobs',
    industry: 'home_services',
    layout: 'sales_ops',
    teams: ['sales', 'production_projects', 'field_crew', 'finance_office'],
    tools: ['crm_quotes', 'tasks_files', 'messages_calendar', 'forms_approvals', 'finance_reporting', 'time_clock'],
  }),
  internal: Object.freeze({
    goal: 'internal_custom',
    industry: 'mixed',
    layout: 'one',
    teams: ['finance_office'],
    tools: ['tasks_files', 'messages_calendar', 'forms_approvals', 'finance_reporting'],
  }),
  quick_starter: Object.freeze({
    goal: 'internal_custom',
    industry: 'mixed',
    layout: 'one',
    teams: [],
    tools: ['tasks_files', 'messages_calendar'],
  }),
  blank: Object.freeze({
    goal: 'internal_custom',
    industry: 'mixed',
    layout: 'one',
    teams: [],
    tools: [],
  }),
});

export const COMPANY_SETUP_BLUEPRINTS = Object.freeze([
  Object.freeze({ id: 'roofing', label: 'Roofing company', description: 'Sales, estimating, production, field work, and office reporting.' }),
  Object.freeze({ id: 'crm_sales', label: 'CRM and sales', description: 'Lead generation, follow-up, quotes, and sales activity.' }),
  Object.freeze({ id: 'construction', label: 'Construction operations', description: 'Sales handoff, project delivery, crews, files, and approvals.' }),
  Object.freeze({ id: 'home_services', label: 'Home services', description: 'Lead intake, scheduling, dispatch, field work, and follow-up.' }),
  Object.freeze({ id: 'internal', label: 'Internal operations', description: 'Tasks, files, forms, approvals, and company reporting.' }),
  Object.freeze({ id: 'quick_starter', label: 'Quick starter', description: 'One workspace with tasks, files, messages, and calendar.' }),
  Object.freeze({ id: 'blank', label: 'Blank', description: 'Only the Main workspace. Choose every app and role yourself.' }),
]);

const BLUEPRINT_IDS = new Set(COMPANY_SETUP_BLUEPRINTS.map((item) => item.id));

const PLUGIN_ORDER = [
  'crm',
  'crm_2',
  'tasks',
  'underwriter',
  'files',
  'client_portal',
  'workspace_builder',
  'price_book',
  'forms',
  'finance',
  'messages',
  'calendar',
  'time_clock',
  'approvals',
  'reporting',
  'calls',
];
const PLUGIN_SET = new Set(PLUGIN_ORDER);

const TOOL_PLUGINS = Object.freeze({
  crm_quotes: ['crm'],
  tasks_files: ['tasks', 'files'],
  messages_calendar: ['messages', 'calendar'],
  underwriter_price_book: ['underwriter', 'price_book'],
  forms_approvals: ['forms', 'approvals'],
  finance_reporting: ['finance', 'reporting'],
  time_clock: ['time_clock'],
});

const WORKSPACE_DEFINITIONS = Object.freeze({
  main: Object.freeze({ key: 'main', name: 'Main' }),
  lead_generation: Object.freeze({ key: 'lead_generation', name: 'Lead Generation' }),
  sales: Object.freeze({ key: 'sales', name: 'Sales' }),
  estimating: Object.freeze({ key: 'estimating', name: 'Estimating' }),
  operations: Object.freeze({ key: 'operations', name: 'Operations' }),
  production: Object.freeze({ key: 'production', name: 'Production' }),
  field_operations: Object.freeze({ key: 'field_operations', name: 'Field Operations' }),
  office: Object.freeze({ key: 'office', name: 'Office' }),
});

const TEAM_WORKSPACES = Object.freeze({
  cold_calling: 'lead_generation',
  sales: 'sales',
  estimating: 'estimating',
  production_projects: 'production',
  field_crew: 'field_operations',
  finance_office: 'office',
});

const ROLE_TEMPLATES = Object.freeze({
  cold_calling: Object.freeze({ key: 'cold_caller', name: 'Cold Caller', purpose: 'Lead outreach, follow-up tasks, messages, and shared files.' }),
  sales: Object.freeze({ key: 'salesperson', name: 'Sales Representative', purpose: 'Contacts, quotes, follow-ups, calendar, messages, and files.' }),
  estimating: Object.freeze({ key: 'estimator', name: 'Estimator', purpose: 'Estimating, price book, forms, approvals, and job documents.' }),
  production_projects: Object.freeze({ key: 'production_coordinator', name: 'Production Coordinator', purpose: 'Jobs, tasks, schedules, files, forms, and approvals.' }),
  field_crew: Object.freeze({ key: 'field_crew', name: 'Field Crew', purpose: 'Assigned jobs, tasks, photos, forms, time, and messages.' }),
  finance_office: Object.freeze({ key: 'office_finance', name: 'Office and Finance', purpose: 'Finance, reporting, approvals, files, and calendars.' }),
});
const ROLE_TEMPLATE_KEYS = new Set(Object.values(ROLE_TEMPLATES).map((item) => item.key));

const PIPELINE_PROFILES = Object.freeze({
  roofing: Object.freeze(['Prospect', 'Qualified', 'Inspection', 'Estimate sent', 'Negotiating', 'Contracted', 'Production', 'Won', 'Lost']),
  sales: Object.freeze(['Prospect', 'Contacted', 'Qualified', 'Proposal sent', 'Negotiating', 'Won', 'Lost']),
  projects: Object.freeze(['New', 'Scheduled', 'In progress', 'Quality check', 'Complete', 'Cancelled']),
  home_services: Object.freeze(['New lead', 'Scheduled', 'Dispatched', 'In progress', 'Follow-up', 'Complete', 'Cancelled']),
  blank: Object.freeze([]),
});

const PLUGIN_WORKSPACES = Object.freeze({
  crm: new Set(['main', 'lead_generation', 'sales', 'estimating']),
  crm_2: new Set(['main', 'lead_generation', 'sales', 'estimating']),
  underwriter: new Set(['main', 'estimating']),
  price_book: new Set(['main', 'estimating']),
  finance: new Set(['main', 'operations', 'production', 'office']),
  time_clock: new Set(['main', 'operations', 'production', 'field_operations']),
});

function uniqueAllowed(values, allowed) {
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    if (!allowed.has(value) || result.includes(value)) continue;
    result.push(value);
  }
  return result;
}

export function normalizeCompanySetupAnswers(raw = {}) {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    mode: MODES.has(input.mode) ? input.mode : 'guided',
    blueprint: BLUEPRINT_IDS.has(input.blueprint) ? input.blueprint : '',
    goal: GOALS.has(input.goal) ? input.goal : 'internal_custom',
    industry: INDUSTRIES.has(input.industry) ? input.industry : 'mixed',
    layout: LAYOUTS.has(input.layout) ? input.layout : 'one',
    teams: uniqueAllowed(input.teams, TEAM_SET),
    tools: uniqueAllowed(input.tools, TOOL_SET),
  };
}

export function answersForBlueprint(code) {
  if (!BLUEPRINT_IDS.has(code)) throw new TypeError(`Unknown company setup blueprint: ${String(code)}`);
  return normalizeCompanySetupAnswers({
    ...BLUEPRINT_ANSWERS[code],
    mode: code === 'blank' ? 'blank' : 'blueprint',
    blueprint: code,
  });
}

export function answersForWorkspaceBlueprint(code) {
  return { ...answersForBlueprint(code), layout: 'one' };
}

function answersWithBlueprintDefaults(raw) {
  if (!raw || raw.mode !== 'blueprint' || !BLUEPRINT_IDS.has(raw.blueprint)) {
    return normalizeCompanySetupAnswers(raw);
  }
  return normalizeCompanySetupAnswers({ ...BLUEPRINT_ANSWERS[raw.blueprint], ...raw });
}

function workspaceDefinitionsFor(answers) {
  if (answers.layout === 'sales_ops') return [WORKSPACE_DEFINITIONS.sales, WORKSPACE_DEFINITIONS.operations];
  if (answers.layout === 'sales_est_prod') {
    return [WORKSPACE_DEFINITIONS.sales, WORKSPACE_DEFINITIONS.estimating, WORKSPACE_DEFINITIONS.production];
  }
  if (answers.layout === 'custom') {
    const keys = [];
    for (const team of answers.teams) {
      const key = TEAM_WORKSPACES[team];
      if (key && !keys.includes(key)) keys.push(key);
    }
    return (keys.length ? keys : ['main']).slice(0, 6).map((key) => WORKSPACE_DEFINITIONS[key]);
  }
  return [WORKSPACE_DEFINITIONS.main];
}

function selectedPluginsFor(answers) {
  const crmId = answers.industry === 'roofing' ? 'crm_2' : 'crm';
  const selected = [];
  for (const tool of answers.tools) {
    for (const pluginId of TOOL_PLUGINS[tool]) {
      const resolved = pluginId === 'crm' ? crmId : pluginId;
      if (!selected.includes(resolved)) selected.push(resolved);
    }
  }
  return PLUGIN_ORDER.filter((pluginId) => selected.includes(pluginId));
}

function distributePlugins(workspaceDefinitions, answers) {
  const selected = selectedPluginsFor(answers);
  if (workspaceDefinitions.length === 1) return [selected];

  const lists = workspaceDefinitions.map((workspace) => selected.filter((pluginId) => {
    const allowed = PLUGIN_WORKSPACES[pluginId];
    return !allowed || allowed.has(workspace.key);
  }));

  for (const pluginId of selected) {
    if (!lists.some((list) => list.includes(pluginId))) lists[0].push(pluginId);
  }

  return lists.map((list) => PLUGIN_ORDER.filter((pluginId) => list.includes(pluginId)));
}

function pipelineKindFor(workspaceKey, answers) {
  if (answers.mode === 'blank') return 'blank';
  if (['lead_generation', 'sales', 'estimating'].includes(workspaceKey)) {
    return answers.industry === 'roofing' ? 'roofing' : 'sales';
  }
  if (['operations', 'production', 'field_operations', 'office'].includes(workspaceKey)) {
    return answers.industry === 'home_services' ? 'home_services' : 'projects';
  }
  if (answers.industry === 'roofing') return 'roofing';
  if (answers.industry === 'home_services') return 'home_services';
  return answers.goal === 'jobs_delivery' ? 'projects' : 'sales';
}

function rolesFor(answers) {
  return answers.teams.map((team) => ROLE_TEMPLATES[team]).filter(Boolean).map((role) => ({ ...role }));
}

function blankPlan() {
  return {
    version: COMPANY_SETUP_VERSION,
    profile: 'blank',
    workspaces: [{ key: 'main', name: 'Main', isDefault: true, pluginIds: [], pipelineKind: 'blank', stages: [] }],
    roles: [],
    warnings: [],
  };
}

function cleanText(value, label, maxLength) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.length > maxLength) throw new TypeError(`${label} must be between 1 and ${maxLength} characters.`);
  return text;
}

function uniqueTextList(values, label, maxLength) {
  const result = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const text = cleanText(value, label, maxLength);
    const normalized = text.toLocaleLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(text);
  }
  return result;
}

export function validateCompanySetupPlan(rawPlan) {
  if (!rawPlan || typeof rawPlan !== 'object' || Array.isArray(rawPlan)) {
    throw new TypeError('Company setup plan must be an object.');
  }
  if (Number(rawPlan.version) !== COMPANY_SETUP_VERSION) {
    throw new TypeError(`Company setup plan version must be ${COMPANY_SETUP_VERSION}.`);
  }
  if (!Array.isArray(rawPlan.workspaces) || rawPlan.workspaces.length < 1 || rawPlan.workspaces.length > 6) {
    throw new TypeError('Company setup plan must include between 1 and 6 workspaces.');
  }

  const seenKeys = new Set();
  const seenNames = new Set();
  const workspaces = rawPlan.workspaces.map((workspace, index) => {
    if (!workspace || typeof workspace !== 'object' || Array.isArray(workspace)) {
      throw new TypeError('Every workspace plan must be an object.');
    }
    const key = typeof workspace.key === 'string' ? workspace.key.trim() : '';
    if (!/^[a-z0-9_]{1,40}$/.test(key) || seenKeys.has(key)) {
      throw new TypeError('Workspace keys must be unique lowercase identifiers.');
    }
    seenKeys.add(key);

    const name = cleanText(workspace.name, 'Workspace name', 64);
    const normalizedName = name.toLocaleLowerCase();
    if (seenNames.has(normalizedName)) throw new TypeError('Workspace names must be unique.');
    seenNames.add(normalizedName);

    const pluginIds = [];
    for (const pluginId of Array.isArray(workspace.pluginIds) ? workspace.pluginIds : []) {
      if (!PLUGIN_SET.has(pluginId)) throw new TypeError(`Unknown app in company setup plan: ${String(pluginId)}`);
      if (!pluginIds.includes(pluginId)) pluginIds.push(pluginId);
    }
    if (pluginIds.includes('crm') && pluginIds.includes('crm_2')) {
      throw new TypeError('A workspace cannot activate both CRM variants.');
    }

    const stages = uniqueTextList(workspace.stages, 'Pipeline stage name', 60);
    if (stages.length > 50 || (Array.isArray(workspace.stages) && workspace.stages.length > 50)) {
      throw new TypeError('A workspace cannot contain more than 50 stages.');
    }
    const pipelineKind = ['roofing', 'sales', 'projects', 'home_services', 'blank'].includes(workspace.pipelineKind)
      ? workspace.pipelineKind
      : 'blank';

    return {
      key,
      name,
      isDefault: index === 0,
      pluginIds: PLUGIN_ORDER.filter((pluginId) => pluginIds.includes(pluginId)),
      pipelineKind,
      stages,
    };
  });

  const seenRoles = new Set();
  const roles = (Array.isArray(rawPlan.roles) ? rawPlan.roles : []).map((role) => {
    if (!role || typeof role !== 'object' || !ROLE_TEMPLATE_KEYS.has(role.key)) {
      throw new TypeError(`Unknown role template in company setup plan: ${String(role?.key || '')}`);
    }
    if (seenRoles.has(role.key)) throw new TypeError('Role templates must be unique.');
    seenRoles.add(role.key);
    const template = Object.values(ROLE_TEMPLATES).find((item) => item.key === role.key);
    return {
      key: role.key,
      name: cleanText(role.name, 'Role name', 64),
      purpose: typeof role.purpose === 'string' && role.purpose.trim()
        ? role.purpose.trim().slice(0, 180)
        : template.purpose,
    };
  });

  const profile = ['roofing', 'construction', 'home_services', 'sales_agency', 'mixed', 'blank'].includes(rawPlan.profile)
    ? rawPlan.profile
    : 'mixed';
  const warnings = uniqueTextList(rawPlan.warnings, 'Plan warning', 240).slice(0, 12);

  return { version: COMPANY_SETUP_VERSION, profile, workspaces, roles, warnings };
}

export function buildCompanySetupPlan(rawAnswers = {}) {
  const answers = answersWithBlueprintDefaults(rawAnswers);
  if (answers.mode === 'blank') return blankPlan();

  const definitions = workspaceDefinitionsFor(answers);
  const pluginLists = distributePlugins(definitions, answers);
  const workspaces = definitions.map((workspace, index) => {
    const pipelineKind = pipelineKindFor(workspace.key, answers);
    return {
      key: workspace.key,
      name: workspace.name,
      isDefault: index === 0,
      pluginIds: pluginLists[index],
      pipelineKind,
      stages: [...PIPELINE_PROFILES[pipelineKind]],
    };
  });

  return validateCompanySetupPlan({
    version: COMPANY_SETUP_VERSION,
    profile: answers.industry,
    workspaces,
    roles: rolesFor(answers),
    warnings: [],
  });
}

export function validateWorkspaceSetupPlan(rawPlan) {
  if (!rawPlan || !Array.isArray(rawPlan.workspaces) || rawPlan.workspaces.length !== 1) {
    throw new TypeError('Workspace setup plan must include exactly one workspace.');
  }
  const plan = validateCompanySetupPlan(rawPlan);
  if (plan.workspaces.length !== 1) {
    throw new TypeError('Workspace setup plan must include exactly one workspace.');
  }
  return plan;
}

export function buildWorkspaceSetupPlan(rawAnswers = {}, workspace = {}) {
  const plan = buildCompanySetupPlan({ ...safeWorkspaceAnswers(rawAnswers), layout: 'one' });
  const name = typeof workspace?.name === 'string' && workspace.name.trim()
    ? workspace.name.trim()
    : plan.workspaces[0].name;
  return validateWorkspaceSetupPlan({
    ...plan,
    workspaces: [{ ...plan.workspaces[0], key: 'workspace', name, isDefault: true }],
  });
}

function safeWorkspaceAnswers(rawAnswers) {
  return rawAnswers && typeof rawAnswers === 'object' && !Array.isArray(rawAnswers) ? rawAnswers : {};
}
