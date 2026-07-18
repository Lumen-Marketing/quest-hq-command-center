// Pure recurrence math for tasks. No DOM, no app state, no clock of its own --
// every function takes the dates it needs, so it can be unit-tested and reused.
//
// A rule is a small object: { freq, interval, weekday? }
//   freq     'daily' | 'weekly' | 'monthly' | 'yearly'
//   interval integer >= 1  (every N of the unit)
//   weekday  0-6 (Sun..Sat), optional, only meaningful for weekly -- it labels
//            the series and seeds the first date; the advance math never needs
//            it because each next date is anchored to the previous due date.
//
// Serialized form is a short stable string so it round-trips through one text
// column: "daily:1", "weekly:2", "weekly:1:5" (every week on Friday),
// "monthly:3", "yearly:1".

export const RECURRENCE_FREQS = ['daily', 'weekly', 'monthly', 'yearly'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const UNIT_NOUN = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };

function clampInterval(n) {
  const i = Math.floor(Number(n));
  return Number.isFinite(i) && i >= 1 ? i : 1;
}

// --- date helpers, all UTC + date-only to avoid timezone drift ---------------

function toParts(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, mo, d };
}

function fmt(y, mo, d) {
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y, mo) {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate(); // mo is 1-based; day 0 => last day of mo
}

function addDaysISO(iso, days) {
  const p = toParts(iso);
  if (!p) return null;
  const dt = new Date(Date.UTC(p.y, p.mo - 1, p.d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return fmt(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

// Add whole months/years, clamping the day to the target month's length so
// Jan 31 + 1 month is Feb 28/29 rather than spilling into March.
function addMonthsISO(iso, months) {
  const p = toParts(iso);
  if (!p) return null;
  const total = (p.y * 12 + (p.mo - 1)) + months;
  const y = Math.floor(total / 12);
  const mo = (total % 12) + 1;
  const d = Math.min(p.d, daysInMonth(y, mo));
  return fmt(y, mo, d);
}

export function weekdayOf(iso) {
  const p = toParts(iso);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay();
}

// --- rule (de)serialization --------------------------------------------------

export function serializeRecurrence(rule) {
  if (!rule || !RECURRENCE_FREQS.includes(rule.freq)) return '';
  const interval = clampInterval(rule.interval);
  if (rule.freq === 'weekly' && Number.isInteger(rule.weekday) && rule.weekday >= 0 && rule.weekday <= 6) {
    return `weekly:${interval}:${rule.weekday}`;
  }
  return `${rule.freq}:${interval}`;
}

export function deserializeRecurrence(value) {
  if (!value || typeof value !== 'string') return null;
  const [freq, interval, weekday] = value.trim().split(':');
  if (!RECURRENCE_FREQS.includes(freq)) return null;
  const rule = { freq, interval: clampInterval(interval) };
  if (freq === 'weekly' && weekday !== undefined && weekday !== '') {
    const w = Number(weekday);
    if (Number.isInteger(w) && w >= 0 && w <= 6) rule.weekday = w;
  }
  return rule;
}

// --- description -------------------------------------------------------------

export function describeRecurrence(rule) {
  const r = typeof rule === 'string' ? deserializeRecurrence(rule) : rule;
  if (!r) return '';
  const n = clampInterval(r.interval);
  const unit = UNIT_NOUN[r.freq];
  const base = n === 1 ? `Every ${unit}` : `Every ${n} ${unit}s`;
  if (r.freq === 'weekly' && Number.isInteger(r.weekday) && r.weekday >= 0 && r.weekday <= 6) {
    return `${base} on ${WEEKDAY_NAMES[r.weekday]}`;
  }
  return base;
}

// --- advancing the series ----------------------------------------------------

// The next due date strictly after `fromISO`, following `rule`. Anchored to
// fromISO so the weekday / day-of-month is naturally preserved.
export function nextDueDate(rule, fromISO) {
  const r = typeof rule === 'string' ? deserializeRecurrence(rule) : rule;
  if (!r || !toParts(fromISO)) return null;
  const n = clampInterval(r.interval);
  switch (r.freq) {
    case 'daily': return addDaysISO(fromISO, n);
    case 'weekly': return addDaysISO(fromISO, n * 7);
    case 'monthly': return addMonthsISO(fromISO, n);
    case 'yearly': return addMonthsISO(fromISO, n * 12);
    default: return null;
  }
}

// --- natural language --------------------------------------------------------

const WEEKDAY_WORDS = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6,
};
const NUMBER_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, other: 2 };

// Detects a recurrence phrase anywhere in text. Returns { rule, match } or null.
// `match` is the substring consumed, so callers can strip it from a task title.
export function recurrenceFromText(text) {
  const s = String(text || '').toLowerCase();

  // Single-word cadences first.
  const single = [
    [/\b(daily|every ?day)\b/, { freq: 'daily', interval: 1 }],
    [/\b(weekly|every ?week)\b/, { freq: 'weekly', interval: 1 }],
    [/\b(biweekly|fortnightly|every other week)\b/, { freq: 'weekly', interval: 2 }],
    [/\b(monthly|every ?month)\b/, { freq: 'monthly', interval: 1 }],
    [/\b(quarterly|every ?quarter)\b/, { freq: 'monthly', interval: 3 }],
    [/\b(annually|yearly|every ?year)\b/, { freq: 'yearly', interval: 1 }],
  ];

  // "every <n> <unit>" (n as digit or word, e.g. "every 6 months", "every other week").
  const everyN = /\bevery\s+(\d+|a|an|one|two|three|four|five|six|seven|other)?\s*(day|days|week|weeks|month|months|year|years|quarter|quarters)\b/;
  const mN = everyN.exec(s);
  if (mN) {
    const interval = mN[1] ? (NUMBER_WORDS[mN[1]] ?? Number(mN[1])) : 1;
    const unit = mN[2];
    let freq = 'daily';
    if (/week/.test(unit)) freq = 'weekly';
    else if (/month/.test(unit)) freq = 'monthly';
    else if (/year/.test(unit)) freq = 'yearly';
    else if (/quarter/.test(unit)) return { rule: { freq: 'monthly', interval: 3 * clampInterval(interval) }, match: mN[0] };
    return { rule: { freq, interval: clampInterval(interval) }, match: mN[0] };
  }

  // "every <weekday>" / "each friday".
  const dayMatch = /\b(?:every|each)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)s?\b/.exec(s);
  if (dayMatch) {
    return { rule: { freq: 'weekly', interval: 1, weekday: WEEKDAY_WORDS[dayMatch[1]] }, match: dayMatch[0] };
  }

  for (const [re, rule] of single) {
    const m = re.exec(s);
    if (m) return { rule: { ...rule }, match: m[0] };
  }
  return null;
}
