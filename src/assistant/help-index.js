// The "knows what this system can do" half of the free assistant — a curated,
// searchable index of what the command center does and where to find it. No LLM:
// answers are hand-written and grounded in the real module set, searched with the
// same matcher the command palette uses.
//
// Answers stay at the "what it's for / where it lives" level on purpose — that's
// what stays true as the product changes. Add a topic here when a capability ships.

export const HELP_TOPICS = [
  {
    id: 'create-task',
    title: 'Create a task',
    keywords: 'task todo reminder remind assign due follow up',
    answer: 'Type what you need in this box (e.g. "remind me to call the Hendersons Friday at 2pm") and pick "Create task" — it fills in the title, due date, time and urgency for you to confirm. Or open Tasks / My tasks from the sidebar and add one manually.',
  },
  {
    id: 'contacts',
    title: 'Add or find a contact',
    keywords: 'contact customer client lead crm person account phone email',
    answer: 'Contacts live under Quest CRM → Contacts. Add a contact there, or jump straight to one by typing their name in this box. Companies you work with are under Accounts.',
  },
  {
    id: 'quotes',
    title: 'Create a quote or estimate',
    keywords: 'quote estimate deal bid price pricing sell proposal',
    answer: 'Quotes (deals) are under Quest CRM → Quotes. Open a quote to build pricing; the price book under Finance holds your materials and costs.',
  },
  {
    id: 'proposals',
    title: 'Send a proposal',
    keywords: 'proposal document sign signature client portal send esign',
    answer: 'Proposals are under Quest CRM → Proposals. Create one, then share the link — the client can review and sign from the portal. Track status back on the Proposals list.',
  },
  {
    id: 'jobs',
    title: 'Manage a job',
    keywords: 'job project work order production install roof build site',
    answer: 'Jobs are under Quest CRM → Jobs. Each job has a profile with its tasks, files and linked contact. Convert a won quote into a job from the quote itself.',
  },
  {
    id: 'underwriter',
    title: 'Use the Underwriter queue',
    keywords: 'underwriter qualification scope pricing handoff readiness review',
    answer: 'The Underwriter module is a qualification and readiness queue — it walks a lead through scoping, pricing and handoff before it becomes a job.',
  },
  {
    id: 'files',
    title: 'Upload and share files',
    keywords: 'file upload document photo pdf attachment storage drive',
    answer: 'Files live under the Files module (and on each job). Drag a file in or click to browse; PDFs and images preview inline. Uploads are limited to 25 MB and to document/image types.',
  },
  {
    id: 'forms',
    title: 'Build a form',
    keywords: 'form survey intake questionnaire field question public response',
    answer: 'Forms are under the Forms module. Build questions in the form builder, share the public link to collect responses, and review submissions on the Responses tab. File answers are stored securely.',
  },
  {
    id: 'finance',
    title: 'Track finance and invoices',
    keywords: 'finance invoice payment expense vendor money billing revenue price book',
    answer: 'The Finance module covers invoices, payments, expenses and vendors, plus the price book for materials and costs.',
  },
  {
    id: 'calendar',
    title: 'View the calendar',
    keywords: 'calendar schedule event appointment date month agenda',
    answer: 'The Calendar is under Operations → Calendar. It shows scheduled events; use the arrows to move between months.',
  },
  {
    id: 'time',
    title: 'Clock in and track time',
    keywords: 'time clock in out timer hours timesheet track shift',
    answer: 'Track your hours under Operations → My time. Managers can see everyone at once on the Clock dashboard.',
  },
  {
    id: 'approvals',
    title: 'Handle approvals',
    keywords: 'approval approve review request pending sign off',
    answer: 'Pending items that need sign-off are under Operations → Approvals.',
  },
  {
    id: 'messages',
    title: 'Message your team',
    keywords: 'message chat conversation dm team communication attach',
    answer: 'Team messaging is under the Messages module. Start a conversation, attach files, and @-mention teammates.',
  },
  {
    id: 'create-workspace',
    title: 'Create a workspace',
    keywords: 'create new workspace company setup start add tenant organization team space',
    answer: 'A workspace is a company space with its own contacts, jobs, apps and data. Create one from the workspace switcher in the top bar.',
    guide: {
      intro: 'A workspace is a self-contained company space — its own contacts, jobs, files, apps and settings. Most people work in one, but you can create more (e.g. for a second business or a demo).',
      steps: [
        'Open the workspace switcher in the top bar (the current company name, top-left).',
        'Choose New workspace.',
        'Enter a Workspace name — usually the company or team name.',
        'Pick a starting preset — a ready-made set of modules and apps to begin with (or choose a blank/minimal preset to start from scratch).',
        'Choose an icon so it is easy to recognize in the switcher.',
        'Create it. You are taken straight into the new workspace, ready to add people and data.',
      ],
      tip: 'You can switch between workspaces any time from the same top-bar switcher, or by typing the workspace name into the command bar (⌘K).',
    },
  },
  {
    id: 'create-app',
    title: 'Create an app (App Builder)',
    keywords: 'create build new app custom no-code builder field record item report design workspace',
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
    answer: 'The Dashboard is your workspace home. Add, remove and rearrange widgets from the widget library to show the metrics and activity you care about.',
  },
  {
    id: 'users',
    title: 'Manage users and permissions',
    keywords: 'user member team invite role permission access admin settings',
    answer: 'Invite teammates and set what they can see under Company → Users, with roles and permissions managed in Settings.',
  },
  {
    id: 'switch-company',
    title: 'Switch workspace / company',
    keywords: 'switch company workspace change tenant organization',
    answer: 'Use the workspace switcher in the top bar, or type a company name in this box to jump to it.',
  },
  {
    id: 'command-palette',
    title: 'Use the command palette',
    keywords: 'command palette shortcut search keyboard ctrl cmd k jump navigate',
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
