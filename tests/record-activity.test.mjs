import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACTIVITY_KINDS,
  RECORD_TABS,
  commentThread,
  describeChanges,
  describeChecklist,
  markMentions,
  mentionedMembers,
  recordFeed,
  recordTab,
} from '../src/workspace/record-activity.js';

// "Activity shows who created the record, who updated it and what fields changed, what checklist
// is checked, who opened the spreadsheet, who edited it, with the time log, who commented and the
// latest thread comments. Comments shows pure comments only. Mention any member with @name, and
// the one mentioned is notified."

const app = {
  id: 'a1',
  fields: [
    { id: 'f-name', type: 'text', label: 'Name' },
    { id: 'f-stage', type: 'status', label: 'Stage', config: { options: [{ id: 's1', label: 'To Do' }, { id: 's2', label: 'Done' }] } },
    { id: 'f-num', type: 'autonumber', label: 'Ref' },
    { id: 'f-calc', type: 'calculation', label: 'Total' },
    { id: 'f-made', type: 'created_time', label: 'Created' },
    { id: 'f-list', type: 'checklist', label: 'Steps', config: { items: [{ id: 'c1', label: 'Measure' }, { id: 'c2', label: 'Order' }] } },
  ],
};

// ---- what changed ------------------------------------------------------------------------

test('a change names the field and both sides of it', () => {
  // "Updated" on its own is what this replaces.
  const changes = describeChanges(app, { 'f-name': 'Roof job' }, { 'f-name': 'Roof replacement' });
  assert.deepEqual(changes, [{
    fieldId: 'f-name', label: 'Name', type: 'text', from: 'Roof job', to: 'Roof replacement',
  }]);
});

test('a field nobody touched is not mentioned', () => {
  assert.deepEqual(describeChanges(app, { 'f-name': 'Same' }, { 'f-name': 'Same' }), []);
  assert.deepEqual(describeChanges(app, {}, {}), []);
});

test('the automatic fields are never reported as edits', () => {
  // They change on every save by definition, and saying so buries the edit somebody made.
  const changes = describeChanges(app, { 'f-num': 1, 'f-calc': 10, 'f-made': 'a' }, { 'f-num': 2, 'f-calc': 20, 'f-made': 'b' });
  assert.deepEqual(changes, []);
});

test('a value is described however the caller can describe it', () => {
  // The model does not know that s2 means Done -- the app does. So the label is passed in.
  const label = (field, value) => (field.type === 'status'
    ? (field.config.options.find((o) => o.id === value)?.label || '')
    : String(value ?? ''));
  const changes = describeChanges(app, { 'f-stage': 's1' }, { 'f-stage': 's2' }, label);
  assert.deepEqual(changes, [{ fieldId: 'f-stage', label: 'Stage', type: 'status', from: 'To Do', to: 'Done' }]);
});

test('setting a field for the first time, and clearing one, both read as changes', () => {
  assert.equal(describeChanges(app, {}, { 'f-name': 'New' })[0].to, 'New');
  assert.equal(describeChanges(app, { 'f-name': 'Old' }, {})[0].from, 'Old');
});

// ---- checklists --------------------------------------------------------------------------

test('a checklist says which item was ticked, by name', () => {
  const field = app.fields.find((f) => f.id === 'f-list');
  assert.deepEqual(describeChecklist(field, [], ['c1']), { ticked: ['Measure'], cleared: [] });
  assert.deepEqual(describeChecklist(field, ['c1'], []), { ticked: [], cleared: ['Measure'] });
  // Ticking one and clearing another in the same save reads as both.
  assert.deepEqual(describeChecklist(field, ['c1'], ['c2']), { ticked: ['Order'], cleared: ['Measure'] });
});

// ---- mentions ----------------------------------------------------------------------------

const members = [
  { id: 'u1', name: 'Abraham Maldonado' },
  { id: 'u2', name: 'Ann' },
  { id: 'u3', name: 'Ann Marie' },
];

test('a mention finds the member it names', () => {
  assert.deepEqual(mentionedMembers('@Abraham Maldonado said you can call him', members), [{ id: 'u1', name: 'Abraham Maldonado' }]);
});

test('the longest name wins, so the wrong person is not told', () => {
  // "@Ann" matches inside "@Ann Marie". Checking the longer name first is the whole fix.
  assert.deepEqual(mentionedMembers('ask @Ann Marie about it', members), [{ id: 'u3', name: 'Ann Marie' }]);
  assert.deepEqual(mentionedMembers('ask @Ann about it', members), [{ id: 'u2', name: 'Ann' }]);
});

test('an email address is not a mention', () => {
  assert.deepEqual(mentionedMembers('write to ann@Ann.com', members), []);
  assert.deepEqual(mentionedMembers('no mention here', members), []);
  assert.deepEqual(mentionedMembers('', members), []);
});

test('two people in one comment are both told, once each', () => {
  const hit = mentionedMembers('@Ann and @Abraham Maldonado and @Ann again', members);
  assert.equal(hit.length, 2);
  assert.deepEqual(hit.map((m) => m.id).sort(), ['u1', 'u2']);
});

test('a mention is marked up for display without touching the rest', () => {
  const out = markMentions('hi @Ann, see this', members, (hit) => `<b>${hit}</b>`);
  assert.equal(out, 'hi <b>@Ann</b>, see this');
});

test('marking up a long name does not then mark up the short one inside it', () => {
  // Longest-first is not enough on its own: "@Ann" is still sitting inside the markup just
  // written for "@Ann Marie", and a second pass would wrap it again within the first.
  const out = markMentions('hi @Ann Marie', members, (hit) => `<b>${hit}</b>`);
  assert.equal(out, 'hi <b>@Ann Marie</b>');
  const both = markMentions('@Ann and @Ann Marie', members, (hit) => `<b>${hit}</b>`);
  assert.equal(both, '<b>@Ann</b> and <b>@Ann Marie</b>');
});

// ---- the two tabs ------------------------------------------------------------------------

const workspace = {
  activity: [
    { id: 'a1', ts: '2026-08-14T10:00:00Z', itemId: 'i1', appId: 'a1', kind: 'updated', text: 'Stage → Done', actor: 'Abe' },
    { id: 'a2', ts: '2026-08-14T09:00:00Z', itemId: 'i1', appId: 'a1', kind: 'created', text: 'Created this', actor: 'Ralph' },
    { id: 'a3', ts: '2026-08-14T11:00:00Z', itemId: 'other', appId: 'a1', kind: 'updated', text: 'Not this record' },
    { id: 'a4', ts: '2026-08-14T08:00:00Z', text: 'Workspace renamed' },
  ],
};
const comments = [
  { id: 'c1', ts: '2026-08-14T10:30:00Z', text: 'background and info', author: 'Abraham', authorId: 'u1' },
  { id: 'c2', ts: '2026-08-14T09:30:00Z', text: 'called him', author: 'Ralph', authorId: 'u4' },
];

test('Activity is the history AND the conversation, oldest first', () => {
  // Two separate stores; this is the one place they are read together. A history that omits
  // the comments is not a history of the record.
  const feed = recordFeed(workspace, 'a1', 'i1', comments);
  // Strictly by time and reading DOWNWARDS, so the two stores interleave: 09:00 creation,
  // 09:30 comment, 10:00 edit, 10:30 comment -- and the newest line sits directly above the
  // box the next one is typed into.
  assert.deepEqual(feed.map((e) => e.id), ['a2', 'c2', 'a1', 'c1']);
  assert.deepEqual(feed.map((e) => e.kind), ['created', 'comment', 'updated', 'comment']);
});

test('another record and workspace-level noise stay out of it', () => {
  const feed = recordFeed(workspace, 'a1', 'i1', comments);
  assert.ok(!feed.some((e) => e.id === 'a3'), 'a different record');
  assert.ok(!feed.some((e) => e.id === 'a4'), 'a workspace event belongs to no record');
});

test('every entry carries who and when, which is the log half of the tab', () => {
  const feed = recordFeed(workspace, 'a1', 'i1', comments);
  feed.forEach((entry) => {
    assert.ok(entry.at, `${entry.id} has no timestamp`);
    assert.ok(entry.icon && entry.color, `${entry.id} has nothing to draw`);
  });
  assert.equal(feed.find((e) => e.id === 'c1').actor, 'Abraham');
});

test('Comments is the conversation alone, and reads downwards', () => {
  const thread = commentThread(comments);
  assert.deepEqual(thread.map((c) => c.id), ['c2', 'c1'], 'oldest first: a conversation reads down');
  assert.ok(!thread.some((c) => c.kind === 'updated'), 'no activity at all');
  assert.deepEqual(commentThread([]), []);
});

test('the tab falls back rather than drawing nothing', () => {
  assert.deepEqual(RECORD_TABS, ['activity', 'comments']);
  assert.equal(recordTab('comments'), 'comments');
  assert.equal(recordTab('nonsense'), 'activity');
  assert.equal(recordTab(undefined), 'activity');
});

test('every kind has something to draw with', () => {
  Object.entries(ACTIVITY_KINDS).forEach(([kind, meta]) => {
    assert.match(meta.icon, /^ti-/, `${kind} has no icon`);
    assert.match(meta.color, /^#/, `${kind} has no colour`);
  });
});
