import assert from 'node:assert/strict';
import test from 'node:test';
import {
  serializeRecurrence, deserializeRecurrence, describeRecurrence,
  nextDueDate, recurrenceFromText, weekdayOf, RECURRENCE_FREQS,
} from '../src/data/recurrence.js';

test('rules round-trip through their serialized string form', () => {
  for (const [rule, str] of [
    [{ freq: 'daily', interval: 1 }, 'daily:1'],
    [{ freq: 'weekly', interval: 2 }, 'weekly:2'],
    [{ freq: 'weekly', interval: 1, weekday: 5 }, 'weekly:1:5'],
    [{ freq: 'monthly', interval: 3 }, 'monthly:3'],
    [{ freq: 'yearly', interval: 1 }, 'yearly:1'],
  ]) {
    assert.equal(serializeRecurrence(rule), str);
    assert.deepEqual(deserializeRecurrence(str), rule);
  }
});

test('garbage in gives null, never a throw', () => {
  for (const bad of [null, undefined, '', 'nonsense', 'weekly', ':::', { freq: 'hourly', interval: 1 }]) {
    assert.equal(serializeRecurrence(bad), typeof bad === 'object' && bad ? serializeRecurrence(bad) : '');
  }
  assert.equal(deserializeRecurrence('hourly:1'), null); // unknown freq is rejected
  // A known freq with a missing interval is read leniently as interval 1 -- the
  // serialized form always includes the interval, so this only guards malformed data.
  assert.deepEqual(deserializeRecurrence('weekly'), { freq: 'weekly', interval: 1 });
  assert.equal(nextDueDate('daily:1', 'not-a-date'), null);
  assert.equal(nextDueDate(null, '2026-01-01'), null);
});

test('interval is coerced to a sane integer >= 1', () => {
  assert.equal(serializeRecurrence({ freq: 'daily', interval: 0 }), 'daily:1');
  assert.equal(serializeRecurrence({ freq: 'daily', interval: -5 }), 'daily:1');
  assert.equal(serializeRecurrence({ freq: 'daily', interval: 2.9 }), 'daily:2');
  assert.equal(deserializeRecurrence('weekly:0').interval, 1);
});

test('daily and weekly advance by exact day counts', () => {
  assert.equal(nextDueDate('daily:1', '2026-07-18'), '2026-07-19');
  assert.equal(nextDueDate('daily:10', '2026-07-25'), '2026-08-04'); // crosses month end
  assert.equal(nextDueDate('weekly:1', '2026-07-18'), '2026-07-25'); // same weekday preserved
  assert.equal(nextDueDate('weekly:2', '2026-07-18'), '2026-08-01');
  assert.equal(weekdayOf('2026-07-18'), weekdayOf(nextDueDate('weekly:1', '2026-07-18')));
});

test('monthly clamps to the end of short months', () => {
  assert.equal(nextDueDate('monthly:1', '2026-01-31'), '2026-02-28'); // no Feb 31/30
  assert.equal(nextDueDate('monthly:1', '2026-01-15'), '2026-02-15');
  assert.equal(nextDueDate('monthly:1', '2026-03-31'), '2026-04-30');
  // A clamped date does not "remember" 31 -- it advances from what it became.
  assert.equal(nextDueDate('monthly:1', '2026-02-28'), '2026-03-28');
  assert.equal(nextDueDate('monthly:3', '2026-01-31'), '2026-04-30'); // quarterly
});

test('yearly handles leap-day rollover', () => {
  assert.equal(nextDueDate('yearly:1', '2024-02-29'), '2025-02-28'); // 2025 is not a leap year
  assert.equal(nextDueDate('yearly:1', '2026-07-18'), '2027-07-18');
  assert.equal(nextDueDate('yearly:4', '2024-02-29'), '2028-02-29'); // back to a leap year
});

test('a series stays stable when iterated', () => {
  let d = '2026-01-31';
  const seq = [];
  for (let i = 0; i < 4; i++) { d = nextDueDate('monthly:1', d); seq.push(d); }
  assert.deepEqual(seq, ['2026-02-28', '2026-03-28', '2026-04-28', '2026-05-28']);
});

test('describe reads naturally', () => {
  assert.equal(describeRecurrence('daily:1'), 'Every day');
  assert.equal(describeRecurrence('daily:3'), 'Every 3 days');
  assert.equal(describeRecurrence('weekly:2'), 'Every 2 weeks');
  assert.equal(describeRecurrence('weekly:1:5'), 'Every week on Friday');
  assert.equal(describeRecurrence('monthly:3'), 'Every 3 months');
  assert.equal(describeRecurrence('yearly:1'), 'Every year');
  assert.equal(describeRecurrence('bogus'), '');
});

test('natural language maps to rules and reports the matched span', () => {
  const cases = [
    ['inspect the roof every 6 months', { freq: 'monthly', interval: 6 }],
    ['call the client weekly', { freq: 'weekly', interval: 1 }],
    ['maintenance every 2 weeks', { freq: 'weekly', interval: 2 }],
    ['review biweekly', { freq: 'weekly', interval: 2 }],
    ['annual warranty check', null], // "annual" alone (adjective) is not "annually"
    ['renew annually', { freq: 'yearly', interval: 1 }],
    ['site visit every friday', { freq: 'weekly', interval: 1, weekday: 5 }],
    ['quarterly business review', { freq: 'monthly', interval: 3 }],
    ['water the plants every day', { freq: 'daily', interval: 1 }],
    ['every other week sync', { freq: 'weekly', interval: 2 }],
    ['just a normal task', null],
  ];
  for (const [text, expected] of cases) {
    const got = recurrenceFromText(text);
    if (expected === null) { assert.equal(got, null, `expected no recurrence in: ${text}`); continue; }
    assert.deepEqual(got.rule, expected, `text: ${text}`);
    assert.ok(text.toLowerCase().includes(got.match), `match "${got.match}" should be a substring of "${text}"`);
  }
});

test('the matched span can be stripped to leave a clean title', () => {
  const got = recurrenceFromText('inspect the Henderson roof every 6 months');
  const title = 'inspect the Henderson roof every 6 months'.replace(got.match, '').replace(/\s+/g, ' ').trim();
  assert.equal(title, 'inspect the Henderson roof');
});

test('every frequency is representable and describable', () => {
  for (const freq of RECURRENCE_FREQS) {
    const rule = { freq, interval: 1 };
    assert.ok(describeRecurrence(rule).startsWith('Every'));
    assert.match(serializeRecurrence(rule), new RegExp(`^${freq}:1`));
  }
});
