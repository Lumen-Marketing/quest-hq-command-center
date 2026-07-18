// Rule-based task parser — turns a plain-language instruction into a proposed
// task, with no LLM and no network. Deterministic and pure: pass the reference
// "now" so the same input always yields the same output (and tests don't depend
// on the clock).
//
//   parseTaskInstruction("remind me to call the Hendersons friday", now)
//     → { title: "Call the Hendersons", due: "2026-07-17", due_time: "",
//         urgency: "medium", found: { date: true, time: false, urgency: false } }
//
// The caller (the command palette) shows the result in a confirm card the user
// can edit before it's created — so this errs toward a best guess, and the human
// catches any mis-parse. Fields map 1:1 onto the app's task model:
//   urgency ∈ critical|urgent|high|medium|low   due = YYYY-MM-DD   due_time = HH:MM|""

import { recurrenceFromText, serializeRecurrence } from '../data/recurrence.js';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Priority phrases → urgency. Longer/more-specific phrases first so "high priority"
// wins over a bare "high". Each entry is [regex, urgency].
const URGENCY_RULES = [
  [/\b(critical|emergency)\b/i, 'critical'],
  [/\b(urgent|asap|a\.s\.a\.p\.|right away|immediately)\b/i, 'urgent'],
  [/\b(high[-\s]?priority|important)\b/i, 'high'],
  [/\b(low[-\s]?priority|no rush|whenever|sometime|eventually|someday)\b/i, 'low'],
];

// Leading command phrases we strip so they don't end up in the title. Order matters:
// longer phrases first. Anchored to the start after trimming.
const COMMAND_PREFIXES = [
  /^please\s+/i,
  /^(can you|could you|help me( to)?)\s+/i,
  /^(create|add|make|set up|schedule)\s+(a\s+)?(new\s+)?task\s+(to|for|about)?\s*/i,
  /^(new\s+task|task|to-?do|reminder)\s*[:\-]\s*/i,
  /^remind me( to| that| about)?\s+/i,
  /^(don'?t forget( to)?|remember( to)?)\s+/i,
  /^(i (need|have|want|ought|would like)\s+to|i should|need to|have to)\s+/i,
  /^(to-?do|task)\s+/i,
];

const pad = (n) => String(n).padStart(2, '0');
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Find a date phrase and return { iso, match } or null. `match` is the exact
 * substring to strip from the title. Order of checks = precedence.
 */
function extractDate(text, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // today / tonight / tomorrow
  let m = text.match(/\b(today|tonight)\b/i);
  if (m) return { iso: toISODate(today), match: m[0] };
  m = text.match(/\b(tomorrow|tmrw|tmr)\b/i);
  if (m) return { iso: toISODate(addDays(today, 1)), match: m[0] };

  // "in N days/weeks"
  m = text.match(/\bin\s+(\d+)\s+(day|days|week|weeks)\b/i);
  if (m) {
    const n = Number(m[1]) * (/week/i.test(m[2]) ? 7 : 1);
    return { iso: toISODate(addDays(today, n)), match: m[0] };
  }

  // "next week"
  m = text.match(/\bnext\s+week\b/i);
  if (m) return { iso: toISODate(addDays(today, 7)), match: m[0] };

  // "(next) <weekday>" — soonest upcoming day incl. today; "next" adds a week.
  m = text.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\b/i);
  if (m) {
    const target = WEEKDAYS.findIndex((d) => d.startsWith(m[2].toLowerCase().slice(0, 3)));
    let offset = (target - today.getDay() + 7) % 7;
    if (m[1]) offset += 7;               // "next friday" → the following week
    return { iso: toISODate(addDays(today, offset)), match: m[0] };
  }

  // "jul 17", "july 17th", "17 jul"
  m = text.match(new RegExp(`\\b(${MONTHS.join('|')})[a-z]*\\.?\\s+(\\d{1,2})(st|nd|rd|th)?\\b`, 'i'));
  if (!m) m = text.match(new RegExp(`\\b(\\d{1,2})(st|nd|rd|th)?\\s+(${MONTHS.join('|')})[a-z]*\\b`, 'i'));
  if (m) {
    const monToken = (m[1].match(/[a-z]/i) ? m[1] : m[3]).slice(0, 3).toLowerCase();
    const day = Number(m[1].match(/[a-z]/i) ? m[2] : m[1]);
    const month = MONTHS.indexOf(monToken);
    if (month >= 0 && day >= 1 && day <= 31) {
      let year = now.getFullYear();
      let d = new Date(year, month, day);
      if (d < today) d = new Date(year + 1, month, day); // a past date means next year
      return { iso: toISODate(d), match: m[0] };
    }
  }

  // "7/17" or "7-17" (month/day)
  m = text.match(/\b(\d{1,2})[/\-](\d{1,2})\b/);
  if (m) {
    const month = Number(m[1]) - 1;
    const day = Number(m[2]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      let d = new Date(now.getFullYear(), month, day);
      if (d < today) d = new Date(now.getFullYear() + 1, month, day);
      return { iso: toISODate(d), match: m[0] };
    }
  }

  return null;
}

/** Find a time phrase and return { time: "HH:MM", match } or null. */
function extractTime(text) {
  let m = text.match(/\bnoon\b/i);
  if (m) return { time: '12:00', match: m[0] };
  m = text.match(/\bmidnight\b/i);
  if (m) return { time: '00:00', match: m[0] };

  // "at 3", "3pm", "3:30 pm", "at 3:30" — a bare number only counts as a time
  // when it carries am/pm, a colon, or an "at" lead-in, so "call 3 people" is safe.
  m = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  if (m) {
    let hour = Number(m[1]) % 12;
    if (/p/i.test(m[3])) hour += 12;
    return { time: `${pad(hour)}:${m[2] || '00'}`, match: m[0] };
  }
  m = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\b/i);
  if (m) {
    const hour = Number(m[1]);
    if (hour >= 0 && hour <= 23) return { time: `${pad(hour)}:${m[2] || '00'}`, match: m[0] };
  }

  // parts of day
  m = text.match(/\b(morning)\b/i);
  if (m) return { time: '09:00', match: m[0] };
  m = text.match(/\b(afternoon)\b/i);
  if (m) return { time: '14:00', match: m[0] };
  m = text.match(/\b(evening|tonight)\b/i);
  if (m) return { time: '18:00', match: m[0] };

  return null;
}

function extractUrgency(text) {
  for (const [re, urgency] of URGENCY_RULES) {
    const m = text.match(re);
    if (m) return { urgency, match: m[0] };
  }
  return null;
}

// "assign to Mike", "assigned to Sarah Lee" -> the name to resolve to a member.
// Requires the explicit "assign(ed) to" phrasing to avoid grabbing the "to" in
// "send the estimate to the Petersons".
function extractAssignee(text) {
  const m = text.match(/\bassign(?:ed)?\s+to\s+@?([a-z][a-z.'’-]*(?:\s+[a-z][a-z.'’-]*)?)/i);
  if (m) return { name: m[1].trim(), match: m[0] };
  return null;
}

/**
 * Resolve a spoken name to a person id. `people` is [{ id, name }].
 * Tries exact full-name, then first-name, then a prefix match. Returns '' if no
 * confident match — the caller leaves the assignee unset rather than guessing.
 */
export function matchPerson(query, people) {
  const q = String(query || '').trim().toLowerCase();
  if (!q || !Array.isArray(people)) return '';
  const named = people.filter((p) => p && p.name);
  const exact = named.find((p) => p.name.toLowerCase() === q);
  if (exact) return exact.id;
  const firstName = named.find((p) => p.name.toLowerCase().split(/\s+/)[0] === q);
  if (firstName) return firstName.id;
  const prefix = named.find((p) => p.name.toLowerCase().startsWith(q) || q.startsWith(p.name.toLowerCase().split(/\s+/)[0]));
  return prefix ? prefix.id : '';
}

/**
 * Find a contact whose name appears in the instruction text. `contacts` is
 * [{ id, name }]. Matches on the longest name token of >= 5 chars that appears
 * (so "call the Hendersons" links "Bob Henderson", but a contact named "Bob Call"
 * won't hijack "call the client"). Returns '' when nothing confident matches.
 */
export function matchContactInText(text, contacts) {
  const haystack = ` ${String(text || '').toLowerCase()} `;
  let bestId = '';
  let bestLen = 0;
  for (const contact of contacts || []) {
    const name = String(contact?.name || '').trim().toLowerCase();
    if (!name) continue;
    for (const token of name.split(/\s+/)) {
      if (token.length >= 5 && token.length > bestLen && haystack.includes(token)) {
        bestId = contact.id;
        bestLen = token.length;
      }
    }
  }
  return bestId;
}

function cleanTitle(text) {
  let t = text;
  for (const re of COMMAND_PREFIXES) t = t.replace(re, '');
  t = t
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:.\-]+/, '')
    .replace(/[\s,;:.\-]+$/, '')
    // drop a dangling leading/trailing preposition left after removing a phrase
    .replace(/^(to|on|by|at|for|about|the)\s+/i, (mm, w) => (/^(the)$/i.test(w) ? mm : ''))
    .replace(/\s+(on|by|at|for|to)$/i, '')
    .trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Parse an instruction into a proposed task. `now` is required (a Date) so the
 * result is deterministic. Returns the task fields plus a `found` map telling the
 * UI which parts were explicit vs left to defaults.
 */
export function parseTaskInstruction(instruction, now) {
  const raw = String(instruction || '').trim();
  let working = raw;

  const strip = (match) => {
    // remove the first occurrence of the matched phrase (case-insensitive)
    const i = working.toLowerCase().indexOf(match.toLowerCase());
    if (i >= 0) working = working.slice(0, i) + ' ' + working.slice(i + match.length);
  };

  const urgency = extractUrgency(working);
  if (urgency) strip(urgency.match);

  const assignee = extractAssignee(working);
  if (assignee) strip(assignee.match);

  // Recurrence before the date, so "every friday" is read as a repeat rule
  // rather than a one-off next-Friday date.
  const recur = recurrenceFromText(working);
  if (recur) strip(recur.match);

  const time = extractTime(working);
  if (time) strip(time.match);

  const date = extractDate(working, now);
  if (date) strip(date.match);

  // A weekday rule ("every friday") with no explicit date seeds its first due
  // date to the next occurrence of that weekday.
  let due = date ? date.iso : '';
  if (!due && recur && Number.isInteger(recur.rule.weekday)) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    due = toISODate(addDays(today, (recur.rule.weekday - today.getDay() + 7) % 7));
  }

  // If stripping metadata leaves nothing, the instruction was date/time/urgency
  // only — "New task" is more honest than echoing the leftover date word.
  const title = cleanTitle(working) || 'New task';

  return {
    title,
    due,
    due_time: time ? time.time : '',
    urgency: urgency ? urgency.urgency : 'medium',
    assignee: assignee ? assignee.name : '',
    recurrence: recur ? serializeRecurrence(recur.rule) : '',
    found: { date: !!date, time: !!time, urgency: !!urgency, assignee: !!assignee, recurrence: !!recur },
    raw,
  };
}
