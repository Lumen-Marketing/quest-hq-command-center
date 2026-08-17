import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';

// "Can you add a multiple action — I want it to send records to multiple apps."
//
// The extras always get a COPY and go FIRST; the main destination goes last, because that is
// the one that may be a MOVE and a move deletes the record from here.

const f = (id, label, type) => ({
  id, label, type, config: {}, required: false, hidden: false,
});
const targetApp = (id, name) => ({ id, name, fields: [f(`${id}-n`, 'Name', 'text')], items: [] });

function harness({ action = 'push', also = [], failOn = '' } = {}) {
  const source = {
    id: 'app-prospect',
    name: 'Prospects',
    fields: [f('p-name', 'Name', 'text'), f('p-btn', 'Send', 'button')],
    items: [{ id: 'item-1', values: { 'p-name': 'Kevin' } }],
  };
  const leads = targetApp('app-leads', 'Leads');
  const jobs = targetApp('app-jobs', 'Jobs');
  const sales = targetApp('app-sales', 'Sales');
  const apps = { 'app-leads': leads, 'app-jobs': jobs, 'app-sales': sales };
  const toasts = [];
  let n = 0;
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws-2', name: 'W', apps: Object.values(apps) }] }),
    // A destination that refuses: the save for that company fails.
    wbSave: async (companyId) => { if (failOn && companyId === failOn) throw new Error('nope'); },
    wbUid: () => `u${(n += 1)}`,
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Kevin',
    state: {},
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, contact: { id: 'c-1' } }),
  });
  const button = {
    id: 'p-btn',
    config: {
      action, targetCompany: 'co1', targetApp: 'app-leads', also,
    },
  };
  return {
    push, button, source, leads, jobs, sales, toasts,
  };
}

const press = (h) => h.push.pressButton('co1', h.source, h.button, h.source.items[0], { id: 'ws-1', activity: [] });

test('one press files the record in every named app', async () => {
  const h = harness({ also: [{ company: 'co1', app: 'app-jobs' }, { company: 'co1', app: 'app-sales' }] });
  assert.equal(await press(h), true);
  assert.equal(h.leads.items.length, 1);
  assert.equal(h.jobs.items.length, 1);
  assert.equal(h.sales.items.length, 1);
  [h.leads, h.jobs, h.sales].forEach((appRow) => {
    assert.equal(appRow.items[0].values[`${appRow.id}-n`], 'Kevin');
  });
});

test('with no extras, nothing about a single send changes', async () => {
  const h = harness();
  assert.equal(await press(h), true);
  assert.equal(h.leads.items.length, 1);
  assert.equal(h.jobs.items.length, 0);
});

test('a move copies to the extras and removes from here exactly once', async () => {
  const h = harness({ action: 'move', also: [{ company: 'co1', app: 'app-jobs' }] });
  assert.equal(await press(h), true);
  assert.equal(h.jobs.items.length, 1, 'the extra should have a copy');
  assert.equal(h.leads.items.length, 1, 'the main destination should have it');
  assert.equal(h.source.items.length, 0, 'the record should have left the source');
});

test('the extras are copies even when the button says move', async () => {
  // The record can only be removed once, so "send it and remove it" names where it ENDS UP.
  const h = harness({ action: 'move', also: [{ company: 'co1', app: 'app-jobs' }] });
  await press(h);
  // A move keeps the record's id; a copy gets a new one. The extra must be the copy.
  assert.notEqual(h.jobs.items[0].id, 'item-1');
  assert.equal(h.leads.items[0].id, 'item-1', 'the main destination is the one that moved');
});

test('a failed extra stops the move, so the record is never lost', async () => {
  // Half a fan-out plus a deletion is the one outcome with no way back.
  const h = harness({ action: 'move', also: [{ company: 'co1', app: 'app-jobs' }], failOn: 'co1' });
  assert.equal(await press(h), false);
  assert.equal(h.source.items.length, 1, 'the record was removed despite a failure');
  assert.ok(h.toasts.some((t) => /nothing was removed from here/.test(t)), h.toasts.join(' | '));
});

test('the same app named twice is filed once', async () => {
  const h = harness({ also: [{ company: 'co1', app: 'app-jobs' }, { company: 'co1', app: 'app-jobs' }] });
  await press(h);
  assert.equal(h.jobs.items.length, 1);
});

test('an extra repeating the main destination is ignored', async () => {
  const h = harness({ also: [{ company: 'co1', app: 'app-leads' }] });
  await press(h);
  assert.equal(h.leads.items.length, 1, 'the main destination got it twice');
});

test('an extra pointing back at the source app is refused', async () => {
  // A button that files a record into the app it already lives in is a loop.
  const h = harness({ also: [{ company: 'co1', app: 'app-prospect' }] });
  await press(h);
  assert.equal(h.source.items.length, 1);
  assert.equal(h.leads.items.length, 1);
});

test('a half-written extra row does nothing', async () => {
  const h = harness({ also: [{ company: 'co1', app: '' }] });
  assert.equal(await press(h), true);
  assert.equal(h.leads.items.length, 1);
});

test('each destination reports itself', async () => {
  const h = harness({ also: [{ company: 'co1', app: 'app-jobs' }] });
  await press(h);
  assert.ok(h.toasts.some((t) => /Jobs/.test(t)), h.toasts.join(' | '));
  assert.ok(h.toasts.some((t) => /Leads/.test(t)), h.toasts.join(' | '));
});
