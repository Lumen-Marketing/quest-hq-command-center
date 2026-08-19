import assert from 'node:assert/strict';
import test from 'node:test';

import { press, saveQuick } from '../src/workspace/quick-create.js';
import { createRecordTask } from '../src/workspace/record-task.js';
import { recordFeed } from '../src/workspace/record-activity.js';

// "Quick Create also has an activity log on the activity card."
//
// Everything Quick Create makes lives somewhere ELSE -- a field on the app, a row in
// wb_record_events, a row in public.tasks -- so without a line written back, the record it was
// all done from shows no sign of any of it. The Activity card is the record's answer to "what
// has been done about this", and these were missing from it.
//
// Asserted through recordFeed, the same reader the card draws from, rather than against the raw
// log: an entry stored with no itemId is stored and invisible, which is the failure worth
// catching.

const ESC = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const WS = 'ws-42959c90-a8e6-4ec4-af78-82036849dba7';

function harness() {
  const app = {
    id: 'app-1',
    name: 'Prospects',
    fields: [
      { id: 'f-name', label: 'Name', type: 'text', config: {} },
      { id: 'f-tel', label: 'Phone', type: 'phone', config: {} },
    ],
    items: [{ id: 'item-1', values: { 'f-name': '58th Pl', 'f-tel': '555 111 2222' } }],
    recordLayout: null,
  };
  const workspace = { id: WS, apps: [app], activity: [] };
  const inserted = [];
  const saves = [];
  const ctx = {
    h,
    state: {},
    can: () => true,
    render: () => {},
    showToast: () => {},
    wbDoc: () => ({ workspaces: [workspace] }),
    wbSave: async (companyId) => { saves.push(companyId); },
    wbUid: () => `id-${workspace.activity.length + 1}`,
    wbItemTitle: () => '58th Pl',
    formatDate: (v) => `[${v}]`,
    WB_FIELD_TYPES: { text: { label: 'Text' }, money: { label: 'Money' } },
    // The one real logger's shape: it stamps the actor and unshifts onto the workspace.
    wbLogActivity: (ws, entry) => {
      ws.activity.unshift({ id: `a-${ws.activity.length}`, ts: '2026-08-19T10:00:00Z', ...entry });
    },
    createSupabaseClient: () => ({
      from: () => ({
        insert: async (rows) => { inserted.push(...[].concat(rows)); return { error: null }; },
      }),
    }),
    isLiveSupabaseSession: () => true,
  };
  const seat = {
    companyId: 'co1', workspaceId: WS, appId: 'app-1', itemId: 'item-1',
  };
  return {
    ctx,
    app,
    workspace,
    seat,
    inserted,
    saves,
    feed: () => recordFeed(workspace, 'app-1', 'item-1'),
  };
}

test('adding a field says so on the record it was added from', async () => {
  const bench = harness();
  await press('field', bench.seat, bench.ctx);
  await saveQuick({
    type: 'money', label: 'Deposit', position: 'end', currency: '$',
  }, bench.ctx);

  const feed = bench.feed();
  assert.equal(feed.length, 1, 'nothing was written to the record');
  assert.match(feed[0].html, /Added the field <b>Deposit<\/b>/);
  assert.match(feed[0].html, /Money/, 'the type it arrived as');
  assert.match(feed[0].html, /Prospects/, 'and which app now has it');
  assert.equal(feed[0].icon, 'ti-plus');
});

test('a scheduled call says who it is to and when', async () => {
  const bench = harness();
  await press('call', bench.seat, bench.ctx);
  await saveQuick({
    title: 'Follow up', to: '555 111 2222', body: '', date: '2026-09-01', time: '09:30',
  }, bench.ctx);

  const feed = bench.feed();
  assert.equal(feed.length, 1);
  assert.match(feed[0].html, /Scheduled a call to <b>555 111 2222<\/b>/);
  assert.match(feed[0].html, /<b>Follow up<\/b>/);
  assert.match(feed[0].html, /\[2026-09-01\] at 09:30/, 'a date with no time is half a plan');
  assert.equal(feed[0].icon, 'ti-phone');
  // The line is in the document, so it has to be saved whether or not the card was added.
  assert.ok(bench.saves.includes('co1'), 'the log was left in memory');
});

test('a message to every number says how many, not the first one', async () => {
  const bench = harness();
  bench.app.fields.push({ id: 'f-tel2', label: 'Office', type: 'phone', config: {} });
  bench.app.items[0].values['f-tel2'] = '555 333 4444';
  await press('sms', bench.seat, bench.ctx);
  await saveQuick({
    title: 'Arrival', to: '*', body: 'On my way', date: '2026-09-01', time: '08:00',
  }, bench.ctx);

  assert.equal(bench.inserted.length, 2);
  assert.match(bench.feed()[0].html, /Scheduled a message to <b>2 numbers<\/b>/);
  assert.equal(bench.feed()[0].icon, 'ti-message-2');
});

test('nothing is written when the save was refused', async () => {
  // A line saying it happened, for something that did not, is worse than no line.
  const bench = harness();
  bench.ctx.createSupabaseClient = () => ({
    from: () => ({ insert: async () => ({ error: { message: 'nope' } }) }),
  });
  await press('call', bench.seat, bench.ctx);
  assert.equal(await saveQuick({
    title: 'Follow up', to: '555 111 2222', date: '2026-09-01', time: '09:30',
  }, bench.ctx), 'failed');
  assert.deepEqual(bench.feed(), []);
});

test('the field line escapes what was typed', async () => {
  // The log text is MARKUP -- every writer builds it with <b> in it -- so a field named with a
  // tag in it would put that tag on the card.
  const bench = harness();
  await press('field', bench.seat, bench.ctx);
  await saveQuick({ type: 'text', label: '<img src=x onerror=alert(1)>', position: 'end' }, bench.ctx);
  const { html } = bench.feed()[0];
  assert.ok(!html.includes('<img'), 'the name was written as markup');
  assert.match(html, /&lt;img/);
});

// ---- and the task, which is written by a different module -------------------------------------

function taskBench({ saved = true } = {}) {
  const app = {
    id: 'app-1', name: 'Prospects', fields: [], items: [{ id: 'item-1', values: {} }],
  };
  const workspace = { id: WS, apps: [app], activity: [] };
  const state = {};
  const saves = [];
  const mod = createRecordTask({
    h,
    state,
    activeCompanyId: () => 'co1',
    field: () => '',
    isLiveSupabaseSession: () => true,
    render: () => {},
    renderModalShell: (_a, _b, body) => body,
    showToast: () => {},
    wbCreateTaskFromPost: async () => saved,
    wbDoc: () => ({ workspaces: [workspace] }),
    wbLogActivity: (ws, entry) => {
      ws.activity.unshift({ id: 'a-1', ts: '2026-08-19T10:00:00Z', ...entry });
    },
    wbMembers: () => [{ id: 'm-1', name: 'Abe' }],
    wbSave: async (companyId) => { saves.push(companyId); },
  });
  return {
    mod, state, workspace, saves, feed: () => recordFeed(workspace, 'app-1', 'item-1'),
  };
}

test('a task made from a record is on that record', async () => {
  const bench = taskBench();
  bench.mod.openRecordTaskModal({
    companyId: 'co1',
    workspaceId: WS,
    appId: 'app-1',
    itemId: 'item-1',
    title: '58th Pl',
    appName: 'Prospects',
  });
  await bench.mod.createTaskFromRecord('co1', {
    title: 'Measure the roof', assigneeId: 'm-1', due: '2026-09-01',
  });

  const feed = bench.feed();
  assert.equal(feed.length, 1, 'the task left no trace on the record it was made from');
  assert.match(feed[0].html, /Created the task <b>Measure the roof<\/b>/);
  assert.match(feed[0].html, /for <b>Abe<\/b>/, 'who has to do it is the point of assigning it');
  assert.ok(bench.saves.includes('co1'));
});

test('an unassigned task says only what it is', async () => {
  const bench = taskBench();
  bench.mod.openRecordTaskModal({
    companyId: 'co1', workspaceId: WS, appId: 'app-1', itemId: 'item-1',
  });
  await bench.mod.createTaskFromRecord('co1', { title: 'Call the adjuster', assigneeId: '', due: '' });
  assert.match(bench.feed()[0].html, /Created the task <b>Call the adjuster<\/b>$/);
});

test('a task refused by the writer leaves no line and closes nothing', async () => {
  const bench = taskBench({ saved: false });
  bench.mod.openRecordTaskModal({
    companyId: 'co1', workspaceId: WS, appId: 'app-1', itemId: 'item-1',
  });
  await bench.mod.createTaskFromRecord('co1', { title: 'x', assigneeId: '', due: '' });
  assert.deepEqual(bench.feed(), []);
  assert.equal(bench.state.modal, 'wb-record-task', 'the form must stay up to be corrected');
});

test('a task raised from somewhere that is not a record logs nowhere', async () => {
  // The same modal is reachable without a seat. There is no record to write to, and writing to
  // the workspace anyway would put a line on a record that had nothing to do with it.
  const bench = taskBench();
  bench.mod.openRecordTaskModal({ companyId: 'co1', title: 'Something' });
  await bench.mod.createTaskFromRecord('co1', { title: 'Something', assigneeId: '', due: '' });
  assert.deepEqual(bench.workspace.activity, []);
  assert.deepEqual(bench.saves, [], 'nothing changed, so nothing is written');
});
