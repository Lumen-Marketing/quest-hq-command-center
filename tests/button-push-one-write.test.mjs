import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';

// "button fields takes time or failed to pass a record. those are working before"
//
// They were faster before because they were not finishing: `wbSave` used to return nothing, so
// `await wbSave(...)` awaited `undefined` and the press returned while the write was still in the
// air. That was fixed -- a move whose removal races its own write is a record that comes back --
// and the honest cost of the fix landed on the button.
//
// What the fix should NOT have cost is writing the same document TWICE. wbSave serialises the
// whole company -- every workspace, every app, every record, photos and spreadsheets and laid-out
// pages included -- and pushing from one app to another in the SAME company was doing that once
// for the arrival and once for the removal. Prospect to Leads inside one workspace is the ordinary
// case, so the ordinary case paid double.
//
// It also gave the optimistic-revision check a collision to resolve against a write this same
// function had just made, which is how a press comes back "could not be saved while others are
// editing" with nobody else editing.

const f = (id, label, type) => ({ id, label, type, config: {}, required: false, hidden: false });

function harness({ action = 'move', targetCompany = 'co1' } = {}) {
  const source = {
    id: 'app-prospect',
    name: 'Prospects',
    fields: [f('p-name', 'Name', 'text'), f('p-btn', 'Send', 'button')],
    items: [{ id: 'item-1', values: { 'p-name': 'Kevin' } }],
  };
  const leads = { id: 'app-leads', name: 'Leads', fields: [f('l-n', 'Name', 'text')], items: [] };
  const saved = [];
  let n = 0;

  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: (companyId) => (companyId === targetCompany
      ? { workspaces: [{ id: 'ws-2', name: 'Sales', apps: [leads] }] }
      : { workspaces: [] }),
    wbSave: async (companyId) => { saved.push(companyId); },
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Kevin',
    state: { route: { params: new Map() } },
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, landed: 1, reused: false, contact: null }),
    contactSeat: () => null,
    navigate: () => {},
    companyPath: () => '/',
  });

  const button = { id: 'p-btn', config: { action, targetCompany, targetApp: 'app-leads' } };
  return {
    saved,
    source,
    leads,
    press: () => push.pressButton('co1', source, button, source.items[0], { id: 'ws-1', activity: [] }),
  };
}

test('a move inside one company writes the document once, not twice', async () => {
  const bench = harness();
  assert.equal(await bench.press(), true);

  // Both halves happened.
  assert.equal(bench.source.items.length, 0, 'it left this app');
  assert.equal(bench.leads.items.length, 1, 'and landed in that one');
  // And one write carried both. Two here is the whole company serialised and uploaded twice for
  // one press, which is the wait somebody feels.
  assert.deepEqual(bench.saved, ['co1']);
});

test('a plain copy writes once too', async () => {
  const bench = harness({ action: 'push' });
  assert.equal(await bench.press(), true);
  assert.equal(bench.source.items.length, 1, 'a copy leaves the original alone');
  assert.equal(bench.leads.items.length, 1);
  assert.deepEqual(bench.saved, ['co1']);
});

test('across two companies there really are two documents, in that order', async () => {
  // The ordering the one-document case retires still matters here: the target has to have taken
  // the record before the source lets go of it, or a failed write loses it from both.
  const bench = harness({ targetCompany: 'co2' });
  assert.equal(await bench.press(), true);
  assert.equal(bench.source.items.length, 0);
  assert.equal(bench.leads.items.length, 1);
  assert.deepEqual(bench.saved, ['co2', 'co1'], 'target first, source second');
});

test('the removal happens before the write it rides on', async () => {
  // Not just "once" -- the single write has to CONTAIN the removal. Saving first and removing
  // after would land a document that still holds the record it just sent away.
  const bench = harness();
  let itemsWhenSaved = null;
  const push = bench.press;
  bench.saved.push = function record(companyId) {
    if (itemsWhenSaved === null) itemsWhenSaved = bench.source.items.length;
    return Array.prototype.push.call(this, companyId);
  };
  await push();
  assert.equal(itemsWhenSaved, 0, 'the source had already let go when the write went out');
});
