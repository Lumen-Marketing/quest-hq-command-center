import assert from 'node:assert/strict';
import test from 'node:test';
import {
  automationMatches, collectAutomationActions, buildTaskFromAction,
  fillTemplate, describeAutomation, AUTOMATION_OBJECTS,
} from '../src/data/automations.js';

const rule = (over = {}) => ({
  id: 'r1', name: 'Rule', enabled: true,
  trigger: { object: 'deal', event: 'stage_is', value: 'Won' },
  actions: [{ type: 'create_task', title: 'Kick off {{name}}', due_offset_days: 2 }],
  ...over,
});

test('a stage trigger fires only on the transition into the target', () => {
  const r = rule();
  // enters Won -> fires
  assert.equal(automationMatches(r, { object: 'deal', event: 'updated', before: { stage: 'Negotiating' }, after: { stage: 'Won' } }), true);
  // saved again while already Won -> does NOT fire
  assert.equal(automationMatches(r, { object: 'deal', event: 'updated', before: { stage: 'Won' }, after: { stage: 'Won' } }), false);
  // moved to a different stage -> does not fire
  assert.equal(automationMatches(r, { object: 'deal', event: 'updated', before: { stage: 'Won' }, after: { stage: 'Lost' } }), false);
});

test('a record created directly in the target state fires', () => {
  assert.equal(automationMatches(rule(), { object: 'deal', event: 'created', before: null, after: { stage: 'Won' } }), true);
  assert.equal(automationMatches(rule(), { object: 'deal', event: 'created', before: null, after: { stage: 'New' } }), false);
});

test('object mismatch and disabled rules never fire', () => {
  assert.equal(automationMatches(rule(), { object: 'contact', event: 'updated', before: { stage: 'x' }, after: { stage: 'Won' } }), false);
  assert.equal(automationMatches(rule({ enabled: false }), { object: 'deal', event: 'updated', before: {}, after: { stage: 'Won' } }), false);
});

test('matching is case- and whitespace-insensitive', () => {
  const r = rule({ trigger: { object: 'deal', event: 'stage_is', value: '  won  ' } });
  assert.equal(automationMatches(r, { object: 'deal', event: 'updated', before: { stage: 'New' }, after: { stage: 'WON' } }), true);
});

test("'completed' fires on entering any done-like state", () => {
  const r = rule({ trigger: { object: 'task', event: 'completed' } });
  assert.equal(automationMatches(r, { object: 'task', event: 'updated', before: { status: 'todo' }, after: { status: 'done' } }), true);
  assert.equal(automationMatches(r, { object: 'task', event: 'updated', before: { status: 'done' }, after: { status: 'done' } }), false);
  // reopened then re-closed fires again
  assert.equal(automationMatches(r, { object: 'task', event: 'updated', before: { status: 'todo' }, after: { status: 'complete' } }), true);
});

test('an empty target value never matches', () => {
  assert.equal(automationMatches(rule({ trigger: { object: 'deal', event: 'stage_is', value: '' } }), { object: 'deal', event: 'updated', before: {}, after: { stage: 'Won' } }), false);
});

test('collect returns one entry per action of every firing rule', () => {
  const rules = [
    rule({ id: 'a' }),
    rule({ id: 'b', actions: [{ type: 'notify', message: 'hi' }, { type: 'create_task', title: 'X' }] }),
    rule({ id: 'c', enabled: false }),
    rule({ id: 'd', trigger: { object: 'deal', event: 'stage_is', value: 'Lost' } }),
  ];
  const change = { object: 'deal', event: 'updated', before: { stage: 'New' }, after: { stage: 'Won' } };
  const got = collectAutomationActions(rules, change);
  assert.deepEqual(got.map((g) => g.rule.id), ['a', 'b', 'b']); // c disabled, d wrong stage
});

test('unknown action types are dropped', () => {
  const rules = [rule({ actions: [{ type: 'launch_missiles' }, { type: 'create_task', title: 'ok' }] })];
  const got = collectAutomationActions(rules, { object: 'deal', event: 'created', before: null, after: { stage: 'Won' } });
  assert.equal(got.length, 1);
  assert.equal(got[0].action.type, 'create_task');
});

test('buildTaskFromAction fills the template and offsets the due date', () => {
  const t = buildTaskFromAction({ type: 'create_task', title: 'Kick off {{name}}', due_offset_days: 2, priority: 'high' }, { name: 'Ridgeline Reroof' }, '2026-07-18');
  assert.equal(t.title, 'Kick off Ridgeline Reroof');
  assert.equal(t.due, '2026-07-20');
  assert.equal(t.priority, 'high');
});

test('buildTaskFromAction carries workspace and business-record context', () => {
  const t = buildTaskFromAction(
    { type: 'create_task', title: 'Follow up {{name}}' },
    {
      name: 'Ridgeline Reroof',
      __workspace_id: 'workspace-a',
      __project_id: 'job-a',
      __contact_id: 'contact-a',
      __deal_id: 'deal-a',
    },
    '2026-07-18',
  );
  assert.deepEqual({
    workspace_id: t.workspace_id,
    project_id: t.project_id,
    contact_id: t.contact_id,
    deal_id: t.deal_id,
  }, {
    workspace_id: 'workspace-a',
    project_id: 'job-a',
    contact_id: 'contact-a',
    deal_id: 'deal-a',
  });
});

test('buildTaskFromAction defaults the offset to +1 day and ignores non-task actions', () => {
  assert.equal(buildTaskFromAction({ type: 'create_task', title: 'x' }, {}, '2026-07-18').due, '2026-07-19');
  assert.equal(buildTaskFromAction({ type: 'notify', message: 'x' }, {}, '2026-07-18'), null);
  assert.equal(buildTaskFromAction({ type: 'create_task', title: '  ' }, {}, '2026-07-18'), null); // blank title
});

test('template tokens are substituted, unknowns collapse to empty', () => {
  assert.equal(fillTemplate('Follow up on {{name}} ({{missing}})', { name: 'Bob' }), 'Follow up on Bob ()');
});

test('describe reads as a sentence for the list UI', () => {
  assert.equal(describeAutomation(rule()), 'When a deal reaches "Won", create task "Kick off {{name}}".');
  assert.match(describeAutomation(rule({ trigger: { object: 'task', event: 'completed' } })), /When a task is completed/);
});

test('the object set is what the UI offers', () => {
  assert.deepEqual(AUTOMATION_OBJECTS, ['deal', 'contact', 'task', 'job']);
});
