// The "knows what this system can do" half of the free assistant — a curated,
// searchable index of what the command center does and where to find it. No LLM:
// answers are hand-written and grounded in the real module set, searched with the
// same matcher the command palette uses.
//
// Answers stay at the "what it's for / where it lives" level on purpose — that's
// what stays true as the product changes. Add a topic here when a capability ships.

export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'daily-work', label: 'Daily work' },
  { id: 'workspace-setup', label: 'Workspace setup' },
  { id: 'team-access', label: 'Team and access' },
  { id: 'account-help', label: 'Account help' },
];

export const HELP_TOPICS = [
  {
    id: 'navigate-questbase',
    title: 'Navigate Questbase',
    keywords: 'navigate navigation sidebar menu my work company mobile more find page module app where',
    answer: 'Use My work for daily activity and Company for workspace tools and administration. On phones, open More to reach the complete allowed module list.',
    category: 'getting-started',
    kind: 'tutorial',
    readingMinutes: 2,
    route: { section: 'dashboard', label: 'Open Home' },
    guide: {
      intro: 'Questbase divides the navigation by purpose so daily work stays separate from workspace and company administration.',
      steps: [
        'Use My work in the left rail for Home, tasks, messages, contacts, jobs, tools, and review screens you use during the day.',
        'Use Company for workspace apps, files, forms, finance, operations, settings, and other account-wide tools your role can access.',
        'Choose an operational workspace from the workspace list before opening a module; the selected workspace controls which pipeline, apps, and records you see.',
        'On a phone, use the bottom tabs for common work and tap More for the complete list of modules your role may open.',
        'Use Search this company or press Ctrl/Cmd+K when you know the record or tool name but not where it lives.',
      ],
      tip: 'If a module is missing, it may be disabled for this workspace or hidden by your role. Ask the workspace owner to check Plugins and Access.',
    },
  },
  {
    id: 'workspace-setup',
    title: 'Set up or reconfigure a workspace',
    keywords: 'workspace setup survey questionnaire guide preset blueprint start scratch reset apps pipeline roles work type',
    answer: 'New workspaces open the guided setup automatically. Owners can reopen it later from Company > Settings > Setup without changing sibling workspaces.',
    category: 'workspace-setup',
    kind: 'tutorial',
    readingMinutes: 3,
    moduleId: 'settings',
    permission: 'settings.manage',
    route: { section: 'settings', params: { tab: 'setup' }, label: 'Open Workspace Setup' },
    guide: {
      intro: 'Setup configures one operational workspace at a time. It recommends apps, pipeline stages, and starter roles without changing another workspace in the company.',
      steps: [
        'When a new company or workspace opens the required setup, choose Guide me, a ready-made setup, or Start from scratch.',
        'For Guide me, search for the kind of work this workspace performs and answer the short workflow questions.',
        'Review the proposed workspace name, active apps, pipeline stages, and starter-role names before applying anything.',
        'Select Apply setup. Existing records and manually configured apps remain protected; Questbase warns before an incompatible setup can be applied.',
        'To revisit the guide later, open Company > Settings > Setup and choose Open setup. This version includes Cancel.',
      ],
      tip: 'Reset setup answers only reopens the questionnaire. It does not delete the workspace, applied apps, workers, customers, jobs, tasks, files, or messages.',
    },
  },
  {
    id: 'invite-team',
    title: 'Invite a worker to Questbase',
    keywords: 'invite worker employee teammate member email code link workspace role join access user',
    answer: 'Open People, create an invite, choose a non-owner role and the operational workspaces the worker should enter, then send or copy the secure link.',
    category: 'team-access',
    kind: 'tutorial',
    readingMinutes: 3,
    moduleId: 'users',
    permission: 'users.manage',
    route: { section: 'users', label: 'Open People' },
    guide: {
      intro: 'An invitation gives a worker company membership plus explicit access to the operational workspaces and non-elevated role you select.',
      steps: [
        'Open People from the Review section and choose Invite teammate.',
        'Enter the worker email address and select a regular or custom role. Invitations cannot grant Owner, Admin, or Developer.',
        'Select every operational workspace the worker needs. A worker sees only assigned workspaces; owners and admins inherit all active workspaces.',
        'Choose Create & send invite. If email delivery fails, the invite remains valid and you can copy its link or code from the invite row.',
        'The worker must register or sign in with the exact invited email, then accept the invitation to join.',
      ],
      tip: 'Promote someone to an elevated company role only after they have joined, using the owner-protected Access controls.',
    },
  },
  {
    id: 'roles-permissions',
    title: 'Understand roles and permissions',
    keywords: 'role permission access owner admin developer member worker allow deny workspace assigned',
    answer: 'Company roles control broad account authority, while assigned workspace roles control what regular workers can reach inside each operational workspace.',
    category: 'team-access',
    kind: 'tutorial',
    readingMinutes: 3,
    moduleId: 'settings',
    permission: 'roles.manage',
    route: { section: 'settings', params: { tab: 'roles' }, label: 'Open Roles' },
    guide: {
      intro: 'Questbase combines company membership, operational-workspace assignment, roles, plugins, and record security. A visible checkbox never bypasses those underlying controls.',
      steps: [
        'Open Company > Settings > Roles to review built-in and custom roles and the tools each role can reach.',
        'Use People > Access to assign a company member to operational workspaces and choose the role used in each workspace.',
        'Owners, Admins, and Developers inherit every active workspace. Regular workers require an explicit active workspace assignment.',
        'If a permission is granted but its plugin is disabled for that workspace, the module remains unavailable until the plugin is enabled.',
        'Use role preview, when available, to verify what the worker sees before asking them to test again.',
      ],
      tip: 'Keep everyday workers on the smallest role that covers their job. Add permissions deliberately instead of making them an owner to solve a navigation problem.',
    },
  },
  {
    id: 'workspace-plugins',
    title: 'Choose apps and plugins for a workspace',
    keywords: 'plugin app enable disable install workspace tools configuration entitlement data scope',
    answer: 'Company plans make plugins available, while each operational workspace independently enables the apps and configuration it needs from Settings > Plugins.',
    category: 'workspace-setup',
    kind: 'tutorial',
    readingMinutes: 2,
    moduleId: 'settings',
    permission: 'settings.manage',
    route: { section: 'settings', params: { tab: 'plugins' }, label: 'Open Plugins' },
    guide: {
      intro: 'Plugins are activated per operational workspace, so a Sales workspace can use different tools from Production inside the same company account.',
      steps: [
        'Select the operational workspace you want to configure from the left workspace list.',
        'Open Company > Settings > Plugins and review the apps available to that company plan.',
        'Enable the apps this workspace needs and read each data-scope label: workspace-only, company-wide, or mixed.',
        'Save the workspace configuration, then return to My work or Company and confirm the allowed navigation modules appear.',
      ],
      tip: 'Disabling a plugin hides the workspace feature but preserves its stored records. Re-enabling it does not require rebuilding the data.',
    },
  },
  {
    id: 'task-setup-back',
    title: 'Return from Task setup to Tasks',
    keywords: 'task setup back return tasks types statuses labels admin stuck navigation',
    answer: 'Use the Back button at the top of Task setup to return to the Tasks view. The left Questbase rail remains available around the embedded task app.',
    category: 'daily-work',
    kind: 'tutorial',
    readingMinutes: 1,
    moduleId: 'tasks',
    route: { section: 'tasks', label: 'Open Tasks' },
    guide: {
      intro: 'Task setup is an administrative view inside the embedded Tasks app for editing task types, statuses, and labels.',
      steps: [
        'Finish or cancel the task-type, status, or label change you are making.',
        'Select Back at the top of the Task setup page.',
        'The Tasks list opens again inside the same Questbase workspace.',
      ],
      tip: 'You can also use My tasks in the Questbase left rail to reload the workspace task surface.',
    },
  },
  {
    id: 'report-problem',
    title: 'Report a problem or suggestion',
    keywords: 'report problem bug issue suggestion support help email broken contact',
    answer: 'Open Help Center from the ? button, scroll to Still need help, and choose Report a problem. Questbase attaches the current page and device context automatically.',
    category: 'account-help',
    kind: 'faq',
    readingMinutes: 1,
  },
  {
    id: 'create-task',
    title: 'Create a task',
    keywords: 'task todo reminder remind assign due follow up',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'tasks',
    route: { section: 'tasks', label: 'Open Tasks' },
    answer: 'Type what you need in this box (e.g. "remind me to call the Hendersons Friday at 2pm") and pick "Create task" — it fills in the title, due date, time and urgency for you to confirm. Or open Tasks / My tasks from the sidebar and add one manually.',
  },
  {
    id: 'contacts',
    title: 'Add or find a contact',
    keywords: 'contact customer client lead crm person account phone email',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'contacts',
    route: { section: 'contacts', label: 'Open Contacts' },
    answer: 'Contacts live under Quest CRM → Contacts. Add a contact there, or jump straight to one by typing their name in this box. Companies you work with are under Accounts.',
  },
  {
    id: 'quotes',
    title: 'Create a quote or estimate',
    keywords: 'quote estimate deal bid price pricing sell proposal',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'deals',
    route: { section: 'deals', label: 'Open Quotes' },
    answer: 'Quotes (deals) are under Quest CRM → Quotes. Open a quote to build pricing; the price book under Finance holds your materials and costs.',
  },
  {
    id: 'proposals',
    title: 'Send a proposal',
    keywords: 'proposal document sign signature client portal send esign',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'proposals',
    route: { section: 'proposals', label: 'Open Proposals' },
    answer: 'Proposals are under Quest CRM → Proposals. Create one, then share the link — the client can review and sign from the portal. Track status back on the Proposals list.',
  },
  {
    id: 'jobs',
    title: 'Manage a job',
    keywords: 'job project work order production install roof build site',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'jobs',
    route: { section: 'jobs', label: 'Open Jobs' },
    answer: 'Jobs are under Quest CRM → Jobs. Each job has a profile with its tasks, files and linked contact. Convert a won quote into a job from the quote itself.',
  },
  {
    id: 'underwriter',
    title: 'Use the Underwriter queue',
    keywords: 'underwriter qualification scope pricing handoff readiness review',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'underwriter',
    route: { section: 'underwriter', label: 'Open Estimator' },
    answer: 'The Underwriter module is a qualification and readiness queue — it walks a lead through scoping, pricing and handoff before it becomes a job.',
  },
  {
    id: 'files',
    title: 'Upload and share files',
    keywords: 'file upload document photo pdf attachment storage drive',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'files',
    route: { section: 'files', label: 'Open Files' },
    answer: 'Files live under the Files module (and on each job). Drag a file in or click to browse; PDFs and images preview inline. Uploads are limited to 25 MB and to document/image types.',
  },
  {
    id: 'forms',
    title: 'Build a form',
    keywords: 'form survey intake questionnaire field question public response',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'forms',
    route: { section: 'forms', label: 'Open Forms' },
    answer: 'Forms are under the Forms module. Build questions in the form builder, share the public link to collect responses, and review submissions on the Responses tab. File answers are stored securely.',
  },
  {
    id: 'finance',
    title: 'Track finance and invoices',
    keywords: 'finance invoice payment expense vendor money billing revenue price book',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'finance',
    route: { section: 'finance', label: 'Open Finance' },
    answer: 'The Finance module covers invoices, payments, expenses and vendors, plus the price book for materials and costs.',
  },
  {
    id: 'calendar',
    title: 'View the calendar',
    keywords: 'calendar schedule event appointment date month agenda',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'calendar',
    route: { section: 'calendar', label: 'Open Meetings' },
    answer: 'The Calendar is under Operations → Calendar. It shows scheduled events; use the arrows to move between months.',
  },
  {
    id: 'time',
    title: 'Clock in and track time',
    keywords: 'time clock in out timer hours timesheet track shift',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'time',
    route: { section: 'time', label: 'Open My Time' },
    answer: 'Track your hours under Operations → My time. Managers can see everyone at once on the Clock dashboard.',
  },
  {
    id: 'approvals',
    title: 'Handle approvals',
    keywords: 'approval approve review request pending sign off',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'approvals',
    route: { section: 'approvals', label: 'Open Approvals' },
    answer: 'Pending items that need sign-off are under Operations → Approvals.',
  },
  {
    id: 'messages',
    title: 'Message your team',
    keywords: 'message chat conversation dm team communication attach',
    category: 'daily-work',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'messages',
    route: { section: 'messages', label: 'Open Inbox' },
    answer: 'Team messaging is under the Messages module. Start a conversation, attach files, and @-mention teammates.',
  },
  {
    id: 'create-workspace',
    title: 'Create a workspace',
    keywords: 'create new workspace company setup start add tenant organization team space',
    category: 'workspace-setup',
    kind: 'tutorial',
    readingMinutes: 3,
    moduleId: 'settings',
    permission: 'settings.manage',
    route: { section: 'settings', params: { tab: 'company', focus: 'create-operational-workspace' }, label: 'Create a Workspace' },
    answer: 'An operational workspace is a configurable child environment inside one company. Owners create one from the plus control beside Workspaces in the left rail.',
    guide: {
      intro: 'A workspace is a self-contained company space — its own contacts, jobs, files, apps and settings. Most people work in one, but you can create more (e.g. for a second business or a demo).',
      steps: [
        'Select the plus control beside Workspaces in the left rail, or open Company > Settings > Company and choose Create workspace.',
        'Enter a workspace name and choose its icon, icon style, and color.',
        'Create the workspace. Questbase opens its required setup guide immediately.',
        'Choose Guide me, a ready-made setup, or Start from scratch.',
        'Review the workspace apps, pipeline stages, and starter roles, then apply the setup.',
      ],
      tip: 'Creating a workspace never creates a second company account. Each workspace can keep different apps, roles, plugins, pipelines, and records inside the same company.',
    },
  },
  {
    id: 'create-app',
    title: 'Create an app (App Builder)',
    keywords: 'create build new app custom no-code builder field record item report design workspace',
    category: 'workspace-setup',
    kind: 'tutorial',
    readingMinutes: 4,
    moduleId: 'workspaces',
    permission: 'workspaces.manage',
    route: { section: 'workspaces', label: 'Open Apps' },
    answer: 'Apps are custom no-code tools you build in Workspaces: design fields, add records, and charts and automations follow.',
    guide: {
      intro: 'Apps are custom, no-code tools you build inside a workspace — a tracker, a pipeline, an onboarding checklist, anything. You design the fields (the columns of data it holds), then add items (the rows), and reports and automations build on top.',
      steps: [
        'Open the Workspaces module (or the Apps tile on your dashboard).',
        'Click Add app (the + on the Apps list).',
        'Give the app a name, an icon, a color, and an optional short description, then Create app.',
        'Design its structure first: from the field palette, add the fields this app should hold (drag to reorder any time). You must add fields before you can add records.',
        'Add items — each item is one record (one client, one job, one applicant), filled in against your fields.',
        'Check Reports — charts appear automatically once the app has fields and a few items.',
        'Add Automations to run rules for you (see "How automations work").',
      ],
      fields: [
        { name: 'Text', desc: 'A single line — names, titles, short labels.' },
        { name: 'Text area', desc: 'Longer notes and paragraphs.' },
        { name: 'Number / Money', desc: 'Numeric values. Money formats as currency.' },
        { name: 'Date', desc: 'A calendar date (start date, due date, launch date).' },
        { name: 'Email / Phone', desc: 'Contact details — shown formatted and clickable.' },
        { name: 'Checkbox', desc: 'A simple yes/no toggle (e.g. "Onboarded").' },
        { name: 'Checklist', desc: 'A list of sub-steps that tracks its own completion.' },
        { name: 'Category', desc: 'A single choice from colored options (e.g. Package: Starter / Growth / Enterprise).' },
        { name: 'Status', desc: 'A workflow stage with colored options (e.g. Kickoff → Contract → Build → Done). Great for pipelines.' },
        { name: 'Progress', desc: 'A computed percentage shown as a ring or bar, driven by another field (like a checklist), with color thresholds.' },
      ],
      tip: 'Start small: three or four fields and one Status field is enough to be useful. You can add more fields any time — existing records just show them blank until filled.',
    },
  },
  {
    id: 'app-automations',
    title: 'How automations work',
    keywords: 'automation automate rule trigger action when then notify set field workflow auto no-code',
    category: 'workspace-setup',
    kind: 'tutorial',
    readingMinutes: 3,
    moduleId: 'workspaces',
    permission: 'workspaces.manage',
    route: { section: 'workspaces', label: 'Open Apps' },
    answer: 'Automations run no-code rules on an app: "When [something happens] → Then [do something]", like set a field or notify the team.',
    guide: {
      intro: 'Automations let an app act on its own — no code. Each automation is one rule with two parts: a trigger (When…) and one or more actions (Then…). They run automatically as items are created and updated.',
      steps: [
        'Open the app and go to its Automations tab.',
        'Add an automation and give it a clear name (e.g. "Mark onboarded at 100%").',
        'Choose the trigger — When: an item is created, or a field reaches a value/stage (e.g. "When Stage is Won", "When Progress ≥ 100").',
        'Add one or more actions — Then: Set a field (e.g. set Stage to Done, tick Onboarded) and/or Notify (post a message to the team).',
        'Make sure the rule is enabled, and save. It now runs by itself whenever the trigger is met.',
      ],
      automations: {
        intro: 'Two real examples from a Client Onboarding app:',
        rules: [
          'When Progress reaches 100% → set Stage to "Done", tick "Onboarded", and notify "Client fully onboarded".',
          'When an item is created → notify "New client onboarding started".',
        ],
      },
      tip: 'Triggers fire on create and on update, so a rule like "When Status is Won → notify" runs the moment someone moves a record into that stage.',
    },
  },
  {
    id: 'dashboard',
    title: 'Customize the dashboard',
    keywords: 'dashboard home widget metric tile overview stats layout',
    category: 'getting-started',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'dashboard',
    route: { section: 'dashboard', label: 'Open Home' },
    answer: 'The Dashboard is your workspace home. Add, remove and rearrange widgets from the widget library to show the metrics and activity you care about.',
  },
  {
    id: 'users',
    title: 'Manage users and permissions',
    keywords: 'user member team invite role permission access admin settings',
    category: 'team-access',
    kind: 'faq',
    readingMinutes: 1,
    moduleId: 'users',
    permission: 'users.manage',
    route: { section: 'users', label: 'Open People' },
    answer: 'Invite teammates and set what they can see under Company → Users, with roles and permissions managed in Settings.',
  },
  {
    id: 'switch-company',
    title: 'Switch workspace / company',
    keywords: 'switch company workspace change tenant organization',
    category: 'getting-started',
    kind: 'faq',
    readingMinutes: 1,
    route: { section: 'dashboard', label: 'Open Home' },
    answer: 'Choose a workspace from the Workspaces list in the left rail. The company stays the same while the selected workspace changes its apps, roles, pipelines, and records.',
  },
  {
    id: 'command-palette',
    title: 'Use the command palette',
    keywords: 'command palette shortcut search keyboard ctrl cmd k jump navigate',
    category: 'getting-started',
    kind: 'faq',
    readingMinutes: 1,
    route: { section: 'dashboard', label: 'Open Home' },
    answer: 'Press Ctrl/⌘ K anywhere to open this box. Search modules, jump to a contact or job by name, run quick actions, or create a task by typing what you need.',
  },
];

// Filler words that carry no topic signal — dropped before matching so a natural
// question ("how do I create a task?") scores on "create" + "task", not "how"/"do"/"i".
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'i', 'my', 'me', 'do', 'does', 'how', 'can', 'could', 'you',
  'please', 'of', 'is', 'it', 'for', 'on', 'in', 'at', 'with', 'and', 'or', 'this', 'that',
  'what', 'where', 'when', 'should', 'need', 'want', 'up', 'out',
]);

function queryWords(query) {
  return String(query || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Rank help topics for a query, best first (empty query → all, in listed order).
 * Word-overlap match: score by how many distinct query words appear in the topic,
 * weighting a title hit above a keyword hit. Findable by title or keywords, and
 * tolerant of full-sentence questions.
 */
export function searchHelp(query) {
  const words = queryWords(query);
  if (!words.length) return HELP_TOPICS.slice();

  return HELP_TOPICS
    .map((topic, index) => {
      const title = topic.title.toLowerCase();
      const keywords = topic.keywords.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 2;
        else if (keywords.includes(w)) score += 1;
      }
      return { topic, index, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((e) => e.topic);
}

export function helpTopicById(id) {
  return HELP_TOPICS.find((topic) => topic.id === String(id || '')) || null;
}

export function filterHelpTopics({ query = '', category = '', canOpenModule = () => true } = {}) {
  return searchHelp(query).filter((topic) => {
    if (category && topic.category !== category) return false;
    return !topic.moduleId || canOpenModule(topic.moduleId, topic.permission || '');
  });
}
