import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';

// "Does moving a record to another app count as created? I want to set that notification,
// because the moved record can't trigger an automation."
//
// It counted as NOTHING. button-push.js never called wbRunAutomations, so a record that
// arrived by button fired nothing in the receiving app — so in a pipeline, where most records
// arrive rather than get typed in, "when an item is created, notify me" almost never ran.

const f = (id, label, type) => ({
  id, label, type, config: {},
});

function harness({ action = 'push' } = {}) {
  const source = {
    id: 'app1',
    name: 'App 1',
    fields: [f('a-n', 'Name', 'text'), f('a-b', 'Send', 'button')],
    items: [{ id: 'i1', values: { 'a-n': 'kim' } }],
  };
  const target = { id: 'app2', name: 'App 2', fields: [f('b-n', 'Name', 'text')], items: [] };
  const ran = [];
  let n = 0;
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws2', name: 'W', apps: [target] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'kim',
    state: {},
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, contact: { id: 'c' } }),
    wbRunAutomations: (companyId, workspace, app, item, event) => ran.push({ app: app.id, event, item: item?.id }),
  });
  const go = () => push.pressButton('co1', source, {
    id: 'a-b', config: { action, targetCompany: 'co1', targetApp: 'app2' },
  }, source.items[0], { id: 'ws1', activity: [] });
  return { go, ran, target, source };
}

test('a copy that lands fires the receiving app’s automations', async () => {
  const { go, ran, target } = harness();
  await go();
  assert.equal(ran.length, 1, 'nothing fired on arrival');
  assert.equal(ran[0].app, 'app2', 'it must run against the app it landed in');
  assert.equal(ran[0].event, 'created');
  assert.equal(ran[0].item, target.items[0].id, 'it must run on the record that arrived');
});

test('a move fires it too — the record begins here as far as this app is concerned', async () => {
  const { go, ran } = harness({ action: 'move' });
  await go();
  assert.deepEqual(ran.map((r) => r.event), ['created']);
});

test('it never runs against the app the record came from', async () => {
  const { go, ran } = harness({ action: 'move' });
  await go();
  assert.ok(!ran.some((r) => r.app === 'app1'), 'the source app’s rules must not fire');
});

test('the push still works where automations are not wired in', async () => {
  // The ctx key is optional, so an older caller cannot break the press.
  const source = {
    id: 'app1', name: 'App 1', fields: [f('a-n', 'Name', 'text'), f('a-b', 'Send', 'button')], items: [{ id: 'i1', values: { 'a-n': 'kim' } }],
  };
  const target = { id: 'app2', name: 'App 2', fields: [f('b-n', 'Name', 'text')], items: [] };
  let n = 0;
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws2', apps: [target] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'kim',
    state: {},
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, contact: { id: 'c' } }),
  });
  const ok = await push.pressButton('co1', source, {
    id: 'a-b', config: { targetCompany: 'co1', targetApp: 'app2' },
  }, source.items[0], { id: 'ws1', activity: [] });
  assert.equal(ok, true);
  assert.equal(target.items.length, 1);
});
