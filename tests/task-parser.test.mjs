import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTaskInstruction } from '../src/assistant/task-parser.js';

// Fixed reference: Wednesday, 15 July 2026, 09:00 local. All relative-date
// expectations below are computed from this anchor.
const NOW = new Date(2026, 6, 15, 9, 0, 0);
const parse = (text) => parseTaskInstruction(text, NOW);

test('strips the command prefix and keeps the real task title', () => {
  assert.equal(parse('remind me to call the Hendersons').title, 'Call the Hendersons');
  assert.equal(parse('create a task to send the invoice').title, 'Send the invoice');
  assert.equal(parse('todo: order shingles').title, 'Order shingles');
  assert.equal(parse('I need to follow up with Maria').title, 'Follow up with Maria');
});

test('resolves relative dates against the reference "now"', () => {
  assert.equal(parse('do it today').due, '2026-07-15');
  assert.equal(parse('do it tomorrow').due, '2026-07-16');
  assert.equal(parse('in 3 days').due, '2026-07-18');
  assert.equal(parse('in 2 weeks').due, '2026-07-29');
  assert.equal(parse('next week').due, '2026-07-22');
});

test('resolves weekday names to the soonest upcoming day', () => {
  // Wed 15th → this Friday is the 17th; Monday is the 20th.
  assert.equal(parse('call them friday').due, '2026-07-17');
  assert.equal(parse('call them monday').due, '2026-07-20');
  // "next friday" jumps a week → the 24th.
  assert.equal(parse('next friday').due, '2026-07-24');
});

test('parses explicit calendar dates', () => {
  assert.equal(parse('due jul 20').due, '2026-07-20');
  assert.equal(parse('due july 20th').due, '2026-07-20');
  assert.equal(parse('on 7/20').due, '2026-07-20');
  // A date already past this year rolls to next year.
  assert.equal(parse('on jan 5').due, '2027-01-05');
});

test('parses times into 24h HH:MM', () => {
  assert.equal(parse('meet at 3pm').due_time, '15:00');
  assert.equal(parse('call at 3:30pm').due_time, '15:30');
  assert.equal(parse('review at 9').due_time, '09:00');
  assert.equal(parse('lunch at noon').due_time, '12:00');
  assert.equal(parse('ship it in the morning').due_time, '09:00');
});

test('a bare number that is not a time is left in the title', () => {
  const r = parse('call 3 people about the roof');
  assert.equal(r.due_time, '');
  assert.match(r.title, /3 people/);
});

test('"at <place>" is not mistaken for a time', () => {
  const r = parse('fix the leak at the Johnson site');
  assert.equal(r.due_time, '');
  assert.match(r.title, /Johnson site/);
});

test('detects urgency keywords and maps them to the task enum', () => {
  assert.equal(parse('urgent: fix the roof leak').urgency, 'urgent');
  assert.equal(parse('this is critical, tarp the roof').urgency, 'critical');
  assert.equal(parse('high priority: send the quote').urgency, 'high');
  assert.equal(parse('order more nails whenever').urgency, 'low');
  assert.equal(parse('email the client back').urgency, 'medium'); // default
});

test('composes date + time + urgency + title from one instruction', () => {
  const r = parse('remind me to send the proposal to Maria tomorrow at 2pm, urgent');
  assert.equal(r.title, 'Send the proposal to Maria');
  assert.equal(r.due, '2026-07-16');
  assert.equal(r.due_time, '14:00');
  assert.equal(r.urgency, 'urgent');
  assert.deepEqual(r.found, { date: true, time: true, urgency: true });
});

test('reports which fields were explicit vs defaulted', () => {
  const r = parse('call the roofer');
  assert.equal(r.due, '');
  assert.equal(r.due_time, '');
  assert.deepEqual(r.found, { date: false, time: false, urgency: false });
});

test('an internal "to" (send X to Y) is preserved, not stripped as a prefix', () => {
  assert.equal(parse('send the estimate to the Petersons').title, 'Send the estimate to the Petersons');
});

test('never returns an empty title', () => {
  assert.equal(parse('tomorrow').title, 'New task');
  assert.equal(parse('   ').title, 'New task');
});
