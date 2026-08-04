import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  REMIND_CHOICES, addMemo, dueMemos, localDay, memoWhen, memosByDay, memosOf,
  nextDueAt, normalizeMemo, remindAt, removeMemo, updateMemo,
} from '../src/workspace/calendar-memos.js';

const ids = () => { let n = 0; return () => `m${(n += 1)}`; };
const app = (memos) => ({ id: 'a1', memos });

test('a memo needs a date; everything else has a sensible default', () => {
  const m = normalizeMemo({ date: '2026-08-07' }, ids());
  assert.equal(m.title, 'Untitled memo');
  assert.equal(m.time, '');
  assert.equal(m.remindMinutes, null);
  assert.equal(m.done, false);
});

test('a memo with no usable date is refused rather than filed under nothing', () => {
  assert.deepEqual(addMemo(app([]), { title: 'No date' }, ids()), []);
  assert.deepEqual(addMemo(app([]), { title: 'Bad', date: '7 Aug' }, ids()), []);
  assert.equal(addMemo(app([]), { title: 'Fine', date: '2026-08-07' }, ids()).length, 1);
});

test('an all-day memo keeps no time rather than being defaulted to midnight', () => {
  // Midnight is a real time and would fire an alarm at 00:00.
  assert.equal(normalizeMemo({ date: '2026-08-07', time: '' }).time, '');
  assert.equal(normalizeMemo({ date: '2026-08-07', time: '25:00' }).time, '', 'and junk is not kept');
  assert.equal(normalizeMemo({ date: '2026-08-07', time: '09:30' }).time, '09:30');
});

test('"no reminder" and "remind at the time" are different states', () => {
  assert.equal(normalizeMemo({ date: '2026-08-07' }).remindMinutes, null);
  assert.equal(normalizeMemo({ date: '2026-08-07', remindMinutes: 0 }).remindMinutes, 0);
  assert.equal(normalizeMemo({ date: '2026-08-07', remindMinutes: -5 }).remindMinutes, 0, 'never negative');
  assert.equal(normalizeMemo({ date: '2026-08-07', remindMinutes: 'x' }).remindMinutes, null);
});

test('the alarm instant is built from local parts, never parsed from a date string', () => {
  // new Date('2026-08-07') is UTC midnight, which in Arizona is the evening of the 6th. That
  // class of bug has shipped in this repo more than once.
  const at = remindAt({ id: 'x', date: '2026-08-07', time: '09:00', remindMinutes: 0, done: false, notifiedAt: '' });
  assert.equal(at.getFullYear(), 2026);
  assert.equal(at.getMonth(), 7);
  assert.equal(at.getDate(), 7);
  assert.equal(at.getHours(), 9);
  // Comments first: this module's own comment explains why Date.parse is avoided, and a
  // naive scan matches the explanation as if it were the offence.
  const src = readFileSync(new URL('../src/workspace/calendar-memos.js', import.meta.url), 'utf8')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/Date\.parse/.test(src), 'no Date.parse of a date string');
  assert.ok(!/new Date\(`/.test(src), 'no Date built from an interpolated string');
  assert.match(src, /new Date\(y, mo - 1, d, hh, mm/, 'built from parts');
});

test('a lead time can cross midnight backwards', () => {
  const at = remindAt(normalizeMemo({ date: '2026-08-07', time: '00:30', remindMinutes: 60 }));
  assert.equal(at.getDate(), 6);
  assert.equal(at.getHours(), 23);
  assert.equal(at.getMinutes(), 30);
});

test('an all-day memo with a reminder fires in the morning, not at midnight', () => {
  const at = remindAt(normalizeMemo({ date: '2026-08-07', remindMinutes: 0 }));
  assert.equal(at.getHours(), 9);
});

test('no reminder means no alarm instant at all', () => {
  assert.equal(remindAt(normalizeMemo({ date: '2026-08-07', time: '09:00' })), null);
  assert.equal(remindAt(normalizeMemo({})), null);
});

test('a memo is due once its moment has passed', () => {
  const memos = [normalizeMemo({ id: 'a', date: '2026-08-07', time: '09:00', remindMinutes: 0 })];
  assert.equal(dueMemos(app(memos), new Date(2026, 7, 7, 8, 59)).length, 0, 'not yet');
  assert.equal(dueMemos(app(memos), new Date(2026, 7, 7, 9, 0)).length, 1, 'on the minute');
  assert.equal(dueMemos(app(memos), new Date(2026, 7, 7, 9, 1)).length, 1, 'just after');
});

test('a week of missed alarms does not all fire at once on next open', () => {
  // That is noise, not a reminder. The grace window bounds how far back it looks.
  const memos = [normalizeMemo({ id: 'a', date: '2026-08-01', time: '09:00', remindMinutes: 0 })];
  assert.equal(dueMemos(app(memos), new Date(2026, 7, 7, 9, 0)).length, 0);
  assert.equal(dueMemos(app(memos), new Date(2026, 7, 1, 15, 0)).length, 1, 'same day still counts');
});

test('an alarm that has fired does not fire again, and a done memo never does', () => {
  const now = new Date(2026, 7, 7, 10, 0);
  const fired = [normalizeMemo({ id: 'a', date: '2026-08-07', time: '09:00', remindMinutes: 0, notifiedAt: '2026-08-07T09:00' })];
  const done = [normalizeMemo({ id: 'b', date: '2026-08-07', time: '09:00', remindMinutes: 0, done: true })];
  assert.deepEqual(dueMemos(app(fired), now), []);
  assert.deepEqual(dueMemos(app(done), now), []);
});

test('the next alarm ahead is found, so one timer replaces hard polling', () => {
  const memos = [
    normalizeMemo({ id: 'a', date: '2026-08-07', time: '09:00', remindMinutes: 0 }),
    normalizeMemo({ id: 'b', date: '2026-08-07', time: '15:00', remindMinutes: 0 }),
    normalizeMemo({ id: 'c', date: '2026-08-07', time: '11:00', remindMinutes: 0, done: true }),
  ];
  const next = nextDueAt(app(memos), new Date(2026, 7, 7, 9, 30));
  assert.equal(next.getHours(), 15, 'the done one is skipped');
  assert.equal(nextDueAt(app(memos), new Date(2026, 7, 7, 23, 0)), null, 'nothing left today');
  assert.equal(nextDueAt(app([]), new Date()), null);
});

test('a day lists its timed memos first, in clock order', () => {
  const memos = [
    normalizeMemo({ id: 'a', title: 'All day thing', date: '2026-08-07' }),
    normalizeMemo({ id: 'b', title: 'Late', date: '2026-08-07', time: '15:00' }),
    normalizeMemo({ id: 'c', title: 'Early', date: '2026-08-07', time: '09:00' }),
  ];
  assert.deepEqual(memosByDay(app(memos)).get('2026-08-07').map((m) => m.title), ['Early', 'Late', 'All day thing']);
});

test('editing touches one memo and keeps its id', () => {
  const memos = [normalizeMemo({ id: 'a', title: 'One', date: '2026-08-07' }), normalizeMemo({ id: 'b', title: 'Two', date: '2026-08-08' })];
  const out = updateMemo(app(memos), 'a', { title: 'Changed', id: 'hacked' });
  assert.equal(out.find((m) => m.id === 'a').title, 'Changed');
  assert.equal(out.find((m) => m.id === 'b').title, 'Two');
  assert.ok(!out.some((m) => m.id === 'hacked'), 'the id cannot be reassigned by a patch');
});

test('removing takes one and nothing else', () => {
  const memos = [normalizeMemo({ id: 'a', date: '2026-08-07' }), normalizeMemo({ id: 'b', date: '2026-08-08' })];
  assert.deepEqual(removeMemo(app(memos), 'a').map((m) => m.id), ['b']);
  assert.equal(removeMemo(app(memos), 'nope').length, 2);
});

test('an app with no memos never throws', () => {
  assert.deepEqual(memosOf(null), []);
  assert.deepEqual(memosOf({ memos: 'nope' }), []);
  assert.deepEqual(dueMemos(null, new Date()), []);
  assert.equal(memosByDay({}).size, 0);
});

test('the when-line says all day rather than showing a made-up time', () => {
  assert.match(memoWhen(normalizeMemo({ date: '2026-08-07' })), /all day$/);
  assert.match(memoWhen(normalizeMemo({ date: '2026-08-07', time: '09:00' })), /09:00$/);
  assert.equal(memoWhen(normalizeMemo({})), '');
});

test('today is a local day, not a UTC one', () => {
  assert.equal(localDay(new Date(2026, 7, 5, 18, 30)), '2026-08-05');
  assert.equal(localDay(new Date(2026, 0, 1, 23, 59)), '2026-01-01');
});

test('the reminder choices read as prose and start at "at the time"', () => {
  assert.equal(REMIND_CHOICES[0][0], 0);
  assert.ok(REMIND_CHOICES.every(([mins, label]) => Number.isFinite(mins) && label));
});
