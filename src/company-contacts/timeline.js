// Everything that has happened to a contact, and everything in their diary.
//
// "Display the recent updates on a record where his contact is used all over the workspace so
// we can track it... it also has a calendar that has the dates where his name is linked and
// has a date field, with four views: year, month, week or day."
//
// Two readings of the same set of records. contactUsage already finds every record that names
// the contact; this turns that into a feed and a diary.
//
// Pure: dates in, dates out, no DOM and no state, so the grid can draw what it returns and a
// test can check a leap year without a browser.

import { contactUsage } from './model.js';
import { eventDay, eventTime, eventTitle } from '../workspace/record-events.js';

const DATE_FIELDS = ['date', 'created_time', 'updated_time'];

/** Local Y-M-D, not the UTC one. A date field holds a day, and a day belongs to the reader. */
export function dayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Weeks run Monday to Sunday, which is how a work week is read. */
export function startOfWeek(value) {
  const date = startOfDay(value);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return date;
}

/**
 * Everything logged against a record this contact is named on, newest first.
 *
 * The workspace feed records what happened to a record; contactUsage says which records are
 * theirs. An entry that names no record is workspace noise -- somebody renamed an app -- and is
 * left out: this is a feed ABOUT a person, not a feed of everything.
 */
export function contactActivity(doc, contactId, { nameValue = null, limit = 12 } = {}) {
  const uses = contactUsage(doc, contactId, { nameValue });
  if (!uses.length) return [];
  const mine = new Map();
  uses.forEach((use) => use.items.forEach((item) => mine.set(item.id, { use, item })));

  const out = [];
  for (const workspace of doc?.workspaces || []) {
    for (const entry of workspace.activity || []) {
      const owner = entry?.itemId ? mine.get(entry.itemId) : null;
      if (!owner) continue;
      out.push({
        id: entry.id,
        at: entry.ts,
        text: entry.text || '',
        icon: entry.icon || 'ti-activity',
        color: entry.color || '',
        actor: entry.actor || '',
        actorId: entry.actorId || '',
        appName: owner.use.appName,
        title: owner.item.title,
        workspaceRouteId: owner.use.workspaceRouteId,
        appId: owner.use.appId,
        itemId: owner.item.id,
      });
    }
  }
  out.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  return out.slice(0, limit);
}

/**
 * Every dated thing on a record this contact is named on.
 *
 * Only fields that hold a DAY somebody chose. Created and Last modified are stamps the system
 * writes, and a diary full of "this record was edited" is a diary nobody opens -- they are in
 * the feed above, where they belong.
 */
export function contactDates(doc, contactId, { nameValue = null, events = [] } = {}) {
  const uses = contactUsage(doc, contactId, { nameValue });
  const out = [];
  for (const { workspace, app } of appsOf(doc)) {
    const use = uses.find((entry) => entry.appId === app.id && entry.workspaceId === workspace.id);
    if (!use) continue;
    const fields = (app.fields || []).filter((field) => field?.type === 'date');
    if (!fields.length) continue;
    use.items.forEach((item) => {
      fields.forEach((field) => {
        const raw = item?.values?.[field.id];
        const key = dayKey(raw);
        if (!key) return;
        out.push({
          day: key,
          at: raw,
          label: String(field.label || 'Date'),
          title: item.title,
          appName: use.appName,
          workspaceRouteId: use.workspaceRouteId,
          appId: use.appId,
          itemId: item.id,
        });
      });
    });
  }
  // A scheduled call belongs on this contact's calendar too, and it is not a date FIELD -- it is
  // a row on one of their records. Matched by record rather than by contact: the event table has
  // no contact on it, and the doc already knows which records name this person.
  const theirs = new Set(out.map((entry) => entry.itemId));
  (events || []).forEach((row) => {
    if (!theirs.has(row?.item_id)) return;
    const day = eventDay(row);
    if (!day) return;
    const use = uses.find((entry) => entry.appId === row.app_id);
    const time = eventTime(row);
    out.push({
      day,
      at: row.scheduled_for,
      label: row.kind === 'sms' ? 'Message' : 'Call',
      title: `${eventTitle(row)}${time ? ` · ${time}` : ''}`,
      appName: use?.appName || '',
      workspaceRouteId: use?.workspaceRouteId || '',
      appId: row.app_id,
      itemId: row.item_id,
      // What the card keys its icon off: a call is not a date somebody typed into a field.
      kind: row.kind,
    });
  });
  return out.sort((a, b) => a.day.localeCompare(b.day) || a.label.localeCompare(b.label));
}

function* appsOf(doc) {
  for (const workspace of doc?.workspaces || []) {
    for (const app of workspace.apps || []) {
      if (app && !app.linked) yield { workspace, app };
    }
  }
}

/** Dated things grouped by the day they fall on. */
export function datesByDay(dates) {
  const map = new Map();
  (dates || []).forEach((entry) => {
    if (!map.has(entry.day)) map.set(entry.day, []);
    map.get(entry.day).push(entry);
  });
  return map;
}

export const CALENDAR_VIEWS = ['year', 'month', 'week', 'day'];

/**
 * The days a view covers, and what to call it.
 *
 * One shape for all four, so the grid draws a year the same way it draws a day: a title, the
 * span, and the cells. Year is the twelve months rather than 365 cells -- a year of squares is
 * a heat map, not a calendar, and the question it answers is "which months have anything".
 */
export function calendarSpan(view, anchorValue) {
  const anchor = startOfDay(anchorValue || new Date());
  if (view === 'day') {
    return { view, from: anchor, to: anchor, title: fullDate(anchor), cells: [{ date: anchor }] };
  }
  if (view === 'week') {
    const from = startOfWeek(anchor);
    const cells = Array.from({ length: 7 }, (_, at) => ({ date: addDays(from, at) }));
    const to = cells[6].date;
    return { view, from, to, title: `${shortDate(from)} – ${shortDate(to)}`, cells };
  }
  if (view === 'year') {
    const from = new Date(anchor.getFullYear(), 0, 1);
    const to = new Date(anchor.getFullYear(), 11, 31);
    const cells = Array.from({ length: 12 }, (_, month) => ({
      date: new Date(anchor.getFullYear(), month, 1),
      month,
    }));
    return { view, from, to, title: String(anchor.getFullYear()), cells };
  }
  // A month, drawn as whole weeks so the grid is rectangular -- the days either side belong to
  // the neighbouring months and are marked as such rather than left blank.
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const from = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, at) => {
    const date = addDays(from, at);
    return { date, outside: date.getMonth() !== anchor.getMonth() };
  });
  return {
    view,
    from,
    to: cells[41].date,
    title: first.toLocaleDateString([], { month: 'long', year: 'numeric' }),
    cells,
  };
}

/** One step forward or back, in whatever the view counts in. */
export function shiftAnchor(view, anchorValue, direction) {
  const anchor = startOfDay(anchorValue || new Date());
  const step = direction < 0 ? -1 : 1;
  if (view === 'day') return addDays(anchor, step);
  if (view === 'week') return addDays(anchor, 7 * step);
  if (view === 'year') return new Date(anchor.getFullYear() + step, anchor.getMonth(), 1);
  return new Date(anchor.getFullYear(), anchor.getMonth() + step, 1);
}

/** What falls inside a cell: one day, or a whole month when the view is a year. */
export function entriesIn(cell, byDay) {
  if (cell.month === undefined) return byDay.get(dayKey(cell.date)) || [];
  const out = [];
  byDay.forEach((entries, key) => {
    const [year, month] = key.split('-').map(Number);
    if (year === cell.date.getFullYear() && month - 1 === cell.month) out.push(...entries);
  });
  return out;
}

/**
 * The key a cell carries so a click can find its entries again.
 *
 * A day cell keys by its day; a year view's cell is a whole MONTH, so it keys by the month. Two
 * shapes rather than one because that is what the two cells actually mean -- and the key has to
 * survive a re-render in state, which a Date does not.
 */
export function cellKey(cell) {
  if (!cell?.date) return '';
  if (cell.month === undefined) return dayKey(cell.date);
  return `${cell.date.getFullYear()}-${String(cell.month + 1).padStart(2, '0')}`;
}

/** Everything under a stored key: 'YYYY-MM-DD' for a day, 'YYYY-MM' for a month. */
export function entriesForKey(byDay, key) {
  const text = String(key || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return (byDay?.get(text) || []).slice();
  if (!/^\d{4}-\d{2}$/.test(text)) return [];
  const out = [];
  // The trailing dash matters: without it '2026-1' would also swallow '2026-10'. Day keys are
  // zero-padded, so the prefix is exact.
  byDay?.forEach((entries, day) => { if (day.startsWith(`${text}-`)) out.push(...entries); });
  return out.sort((a, b) => a.day.localeCompare(b.day) || a.label.localeCompare(b.label));
}

/** How a stored key reads as a heading. */
export function keyTitle(key) {
  const text = String(key || '');
  const [year, month, day] = text.split('-').map(Number);
  if (!year || !month) return '';
  if (day) return fullDate(new Date(year, month - 1, day));
  return new Date(year, month - 1, 1).toLocaleDateString([], { month: 'long', year: 'numeric' });
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

const fullDate = (date) => date.toLocaleDateString([], {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const shortDate = (date) => date.toLocaleDateString([], { day: 'numeric', month: 'short' });

export { DATE_FIELDS };
