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
    id: 'workspaces',
    title: 'Build a custom app (workspaces)',
    keywords: 'workspace app builder custom board no-code tool template widget',
    answer: 'Workspaces let you build custom apps — records, fields, reports and automations — without code, under the Workspaces module.',
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
