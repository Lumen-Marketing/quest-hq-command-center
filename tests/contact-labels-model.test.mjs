import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  assignmentRow,
  assignmentsToCreate,
  contactsWithLabel,
  describeAssignment,
  findLabel,
  isValidLabelName,
  labelKey,
  labelsForContact,
  newLabelRow,
} from '../src/crm/contact-labels.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const LABELS = [
  { id: 'l1', workspace_id: 'ws1', name: 'VIP' },
  { id: 'l2', workspace_id: 'ws1', name: 'Follow-up' },
  { id: 'l3', workspace_id: 'ws2', name: 'VIP' },
];
const ASSIGNMENTS = [
  { contact_id: 'c1', label_id: 'l1' },
  { contact_id: 'c1', label_id: 'l2' },
  { contact_id: 'c2', label_id: 'l1' },
];

test('label matching ignores case and surrounding space, mirroring the unique index', () => {
  assert.equal(labelKey('  Hot Lead '), 'hot lead');
  assert.equal(findLabel(LABELS, 'ws1', 'vip').id, 'l1');
  assert.equal(findLabel(LABELS, 'ws1', '  VIP  ').id, 'l1');
});

test('a label in another workspace is not a match', () => {
  // l3 is also called VIP but belongs to ws2. Returning it would produce an assignment
  // the row-level policy rejects, and the user would see an unexplained failure.
  assert.equal(findLabel(LABELS, 'ws1', 'VIP').id, 'l1');
  assert.equal(findLabel(LABELS, 'ws3', 'VIP'), null);
});

test('an empty or absent name never matches anything', () => {
  assert.equal(findLabel(LABELS, 'ws1', '   '), null);
  assert.equal(findLabel(LABELS, 'ws1', null), null);
  assert.equal(isValidLabelName(''), false);
  assert.equal(isValidLabelName('   '), false);
  assert.equal(isValidLabelName('VIP'), true);
  assert.equal(isValidLabelName('x'.repeat(61)), false, 'a 61-character label is a paragraph, not a label');
});

test('a contact shows its labels, sorted, with dangling assignments dropped', () => {
  const withGhost = [...ASSIGNMENTS, { contact_id: 'c1', label_id: 'deleted' }];
  assert.deepEqual(labelsForContact(LABELS, withGhost, 'c1').map((l) => l.name), ['Follow-up', 'VIP']);
  assert.deepEqual(labelsForContact(LABELS, withGhost, 'c3'), []);
});

test('contactsWithLabel answers the query a saved segment is', () => {
  assert.deepEqual(contactsWithLabel(ASSIGNMENTS, 'l1'), ['c1', 'c2']);
  assert.deepEqual(contactsWithLabel(ASSIGNMENTS, 'nope'), []);
});

// The primary key is (contact_id, label_id), so re-assigning is a duplicate-key error
// rather than a harmless no-op. A bulk action over a partly-labelled selection has to
// filter first or it fails on the ones already done.
test('assigning skips contacts that already carry the label', () => {
  const todo = assignmentsToCreate({ contactIds: ['c1', 'c2', 'c3'], labelId: 'l1', assignments: ASSIGNMENTS });
  assert.deepEqual(todo, ['c3']);
});

test('assigning collapses repeats within one selection', () => {
  const todo = assignmentsToCreate({ contactIds: ['c9', 'c9', 'c8'], labelId: 'l1', assignments: ASSIGNMENTS });
  assert.deepEqual(todo, ['c9', 'c8']);
});

test('assigning a label nobody has yet returns everyone', () => {
  assert.deepEqual(
    assignmentsToCreate({ contactIds: ['c1', 'c2'], labelId: 'fresh', assignments: ASSIGNMENTS }),
    ['c1', 'c2'],
  );
});

// The policies check the assignment's workspace against the contact's own, so these must
// be the contact's values — not whichever workspace is currently on screen.
test('an assignment row carries the tenancy columns the policy checks', () => {
  const row = assignmentRow({
    contactId: 'c1', labelId: 'l1', workspaceId: 'ws1', companyId: 'acme', profileId: 'p1',
  });
  assert.deepEqual(row, {
    contact_id: 'c1', label_id: 'l1', workspace_id: 'ws1', company_id: 'acme', assigned_by: 'p1',
  });
});

test('an unknown author is null rather than undefined, which PostgREST would drop', () => {
  assert.equal(assignmentRow({ contactId: 'c', labelId: 'l' }).assigned_by, null);
  assert.equal(newLabelRow({ name: 'VIP' }).created_by, null);
});

test('a new label is trimmed and carries a default colour', () => {
  const row = newLabelRow({ name: '  Hot Lead  ', workspaceId: 'ws1', companyId: 'acme' });
  assert.equal(row.name, 'Hot Lead');
  assert.equal(row.color, '#64748b');
  assert.equal(newLabelRow({ name: 'x', color: '#ff0000' }).color, '#ff0000');
});

test('the toast says what actually happened, not just how many were selected', () => {
  assert.equal(describeAssignment({ requested: 3, created: 3, labelName: 'VIP' }), 'Labelled 3 contacts "VIP".');
  assert.equal(describeAssignment({ requested: 1, created: 1, labelName: 'VIP' }), 'Labelled 1 contact "VIP".');
  assert.equal(describeAssignment({ requested: 3, created: 1, labelName: 'VIP' }),
    'Labelled 1 contact "VIP" — 2 already had it.');
  assert.equal(describeAssignment({ requested: 2, created: 0, labelName: 'VIP' }),
    'All 2 already had "VIP".');
});

// --- the defect this replaces -----------------------------------------------------

test('the bulk action no longer overwrites the contact source or writes into notes', () => {
  const fn = main.slice(main.indexOf('function submitContactBulk('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.ok(
    !/persistContact\(\{ \.\.\.c, source: value \}\)/.test(body),
    'writing the campaign name over `source` destroyed where the contact came from',
  );
  assert.ok(
    !/Label: \$\{value\}|`Label: /.test(body),
    'a label appended to notes cannot be renamed, removed, counted or filtered',
  );
  assert.match(body, /applyContactLabel\(/);
});
