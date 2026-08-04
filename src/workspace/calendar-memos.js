// Memos on an app's calendar: a note pinned to a date and time, with an optional reminder.
//
// Pure. No DOM, no timers, no Notification API -- it answers "what is on this day" and "what
// is due by now", and the caller decides what to do about it.
//
// A memo is NOT a record. Records are the app's data and have fields, layouts and a record
// page; a memo is a sticky note on the calendar. Making them records would have meant every
// app growing a hidden "Memo" field set nobody asked for.

const pad = (n) => String(n).padStart(2, '0');

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Minutes before the memo that the reminder fires. 0 means "at the time". */
export const REMIND_CHOICES = [
  [0, 'At the time'],
  [5, '5 minutes before'],
  [15, '15 minutes before'],
  [30, '30 minutes before'],
  [60, '1 hour before'],
  [1440, 'The day before'],
];

let seq = 0;
const nextId = () => `memo-${Date.now().toString(36)}-${(seq += 1).toString(36)}`;

export function normalizeMemo(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  const date = DATE_RE.test(String(raw.date || '')) ? String(raw.date) : '';
  // An all-day memo has no time. It is a real state, not a missing value, so it stays ''
  // rather than being defaulted to midnight -- which would fire an alarm at 00:00.
  const time = TIME_RE.test(String(raw.time || '')) ? String(raw.time) : '';
  const remind = Number(raw.remindMinutes);
  return {
    id: String(raw.id || makeId()),
    title: String(raw.title || '').trim() || 'Untitled memo',
    note: String(raw.note || '').trim(),
    date,
    time,
    // No reminder at all is null, which is different from 0 ("at the time").
    remindMinutes: raw.remindMinutes == null || !Number.isFinite(remind) ? null : Math.max(0, Math.round(remind)),
    done: raw.done === true,
    // When the alarm actually fired, so it fires once and not on every tick after.
    notifiedAt: String(raw.notifiedAt || ''),
    createdAt: String(raw.createdAt || ''),
  };
}

export const memosOf = (app) => (Array.isArray(app?.memos) ? app.memos.map((m) => normalizeMemo(m)) : []);

export function addMemo(app, memo, makeId = nextId) {
  const next = normalizeMemo({ ...memo, createdAt: memo?.createdAt || new Date().toISOString() }, makeId);
  if (!next.date) return memosOf(app);
  return [...memosOf(app), next];
}

export const updateMemo = (app, id, patch) => memosOf(app)
  .map((m) => (m.id === id ? normalizeMemo({ ...m, ...patch, id: m.id }) : m));

export const removeMemo = (app, id) => memosOf(app).filter((m) => m.id !== id);

/** Memos keyed by their day, each day sorted so timed ones lead in clock order. */
export function memosByDay(app) {
  const byDay = new Map();
  memosOf(app).forEach((memo) => {
    if (!memo.date) return;
    if (!byDay.has(memo.date)) byDay.set(memo.date, []);
    byDay.get(memo.date).push(memo);
  });
  for (const list of byDay.values()) {
    // All-day memos sort last: a memo with a time is an appointment and reads first.
    list.sort((a, b) => (a.time === b.time ? a.title.localeCompare(b.title) : (a.time ? -1 : 1) || a.time.localeCompare(b.time)));
  }
  return byDay;
}

/**
 * The instant a memo's alarm should fire, as a local Date.
 *
 * Built from date parts rather than Date.parse of an ISO string: "2026-08-05T09:00" parses
 * as local, but "2026-08-05" alone parses as UTC, which in Arizona is the previous evening.
 * Returns null when there is nothing to fire.
 */
export function remindAt(memo) {
  const m = memo && memo.id ? memo : normalizeMemo(memo);
  if (!m.date || m.remindMinutes == null) return null;
  const [y, mo, d] = m.date.split('-').map(Number);
  const [hh, mm] = m.time ? m.time.split(':').map(Number) : [9, 0];
  const at = new Date(y, mo - 1, d, hh, mm, 0, 0);
  at.setMinutes(at.getMinutes() - m.remindMinutes);
  return at;
}

/**
 * Memos whose alarm is due and has not already fired.
 *
 * `graceMs` bounds how far back it will look. Without it, opening the app after a week away
 * would fire every alarm missed in that week at once -- which is noise, not a reminder.
 */
export function dueMemos(app, now = new Date(), graceMs = 12 * 60 * 60 * 1000) {
  const stamp = now.getTime();
  return memosOf(app).filter((memo) => {
    if (memo.done || memo.notifiedAt) return false;
    const at = remindAt(memo);
    if (!at) return false;
    const delta = stamp - at.getTime();
    return delta >= 0 && delta <= graceMs;
  });
}

/** The next alarm still ahead of `now`, for scheduling one timer instead of polling hard. */
export function nextDueAt(app, now = new Date()) {
  const ahead = memosOf(app)
    .filter((m) => !m.done && !m.notifiedAt)
    .map((m) => remindAt(m))
    .filter((at) => at && at.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return ahead[0] || null;
}

/** "Fri, Aug 7 · 09:00" — what the alarm and the list both say. */
export function memoWhen(memo, formatDate = (d) => d) {
  const m = memo && memo.id ? memo : normalizeMemo(memo);
  if (!m.date) return '';
  return m.time ? `${formatDate(m.date)} · ${m.time}` : `${formatDate(m.date)} · all day`;
}

/** Today, in local parts. Never toISOString: from an afternoon in Arizona that is tomorrow. */
export const localDay = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
