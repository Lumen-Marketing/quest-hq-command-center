import assert from 'node:assert/strict';
import test from 'node:test';
import { computeTeamWorkload } from '../src/data/team-workload.js';

const MEMBERS = [
  { id: 'u1', name: 'Mike' },
  { id: 'u2', name: 'Sarah' },
  { id: 'u3', name: 'Ana' },
];
const TODAY = '2026-07-15';

test('counts open tasks per member and ignores done ones', () => {
  const tasks = [
    { assignee_id: 'u1', due: '2026-07-20', status: 'todo' },
    { assignee_id: 'u1', due: '2026-07-21', status: 'pending' },
    { assignee_id: 'u2', due: '2026-07-20', status: 'todo' },
    { assignee_id: 'u1', due: '2026-07-01', status: 'done' }, // done: not counted
  ];
  const r = computeTeamWorkload({ members: MEMBERS, tasks, todayIso: TODAY });
  const mike = r.rows.find((x) => x.id === 'u1');
  assert.equal(mike.open, 2);
  assert.equal(r.totalOpen, 3);
  assert.equal(r.rows[0].id, 'u1'); // busiest first
});

test('flags overdue open tasks (per member and total)', () => {
  const tasks = [
    { assignee_id: 'u1', due: '2026-07-10', status: 'todo' }, // overdue
    { assignee_id: 'u1', due: '2026-07-20', status: 'todo' },
    { assignee_id: 'u2', due: '2026-07-01', status: 'todo' }, // overdue
    { assignee_id: 'u2', due: '2026-07-05', status: 'done' }, // overdue but done → ignored
  ];
  const r = computeTeamWorkload({ members: MEMBERS, tasks, todayIso: TODAY });
  assert.equal(r.rows.find((x) => x.id === 'u1').overdue, 1);
  assert.equal(r.rows.find((x) => x.id === 'u2').overdue, 1);
  assert.equal(r.totalOverdue, 2);
});

test('separates unassigned open work', () => {
  const tasks = [
    { assignee_id: '', due: '2026-07-20', status: 'todo' },
    { assignee_id: null, due: '2026-07-20', status: 'todo' },
    { assignee_id: 'ghost', due: '2026-07-20', status: 'todo' }, // assignee not a member
    { assignee_id: 'u1', due: '2026-07-20', status: 'todo' },
  ];
  const r = computeTeamWorkload({ members: MEMBERS, tasks, todayIso: TODAY });
  assert.equal(r.unassignedOpen, 2); // '' and null; a non-member assignee is not "unassigned"
});

test('marks a genuinely overloaded member, not an evenly-loaded team', () => {
  const even = MEMBERS.map((m) => ({ assignee_id: m.id, due: '2026-07-20', status: 'todo' }));
  const flat = computeTeamWorkload({ members: MEMBERS, tasks: even, todayIso: TODAY });
  assert.ok(flat.rows.every((r) => !r.overloaded), 'nobody flagged when everyone has 1');

  const skew = [
    ...Array.from({ length: 9 }, () => ({ assignee_id: 'u1', due: '2026-07-20', status: 'todo' })),
    { assignee_id: 'u2', due: '2026-07-20', status: 'todo' },
  ];
  const r = computeTeamWorkload({ members: MEMBERS, tasks: skew, todayIso: TODAY });
  assert.equal(r.rows.find((x) => x.id === 'u1').overloaded, true);
  assert.equal(r.rows.find((x) => x.id === 'u2').overloaded, false);
});

test('every member appears even with no tasks', () => {
  const r = computeTeamWorkload({ members: MEMBERS, tasks: [], todayIso: TODAY });
  assert.equal(r.rows.length, 3);
  assert.ok(r.rows.every((x) => x.open === 0));
  assert.equal(r.maxOpen, 0);
});
