import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';

// "When I move the record to another app it's gone from my view — can you make it go together
// with me, so I'm moved too?"
//
// A move takes the record out of the app it was in. Somebody sitting on its RECORD PAGE was left
// looking at "This record is gone" — an accurate message about a record they had just sent
// themselves, with the copy that does exist one app away and nothing pointing at it.
//
// Pressed and followed, rather than grepped: where a press leaves the reader is behaviour, and
// the interesting cases are the ones where it must NOT move them.

const f = (id, label, type) => ({ id, label, type, config: {}, required: false, hidden: false });

function harness({ action = 'move', onRecordPage = true, appId = 'app-prospect', contacts = false } = {}) {
  const source = {
    id: 'app-prospect',
    name: 'Prospects',
    fields: [f('p-name', 'Name', 'text'), f('p-btn', 'Send', 'button')],
    items: [{ id: 'item-1', values: { 'p-name': 'Kevin' } }],
  };
  const leads = { id: 'app-leads', name: 'Leads', fields: [f('l-n', 'Name', 'text')], items: [] };
  const went = [];
  let n = 0;
  // What the router would have been asked for. A record page carries app_id and item_id; a list
  // row carries neither, which is how "am I reading this record" is answered.
  const params = new Map(onRecordPage ? [['app_id', appId], ['item_id', 'item-1']] : []);

  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws-2', name: 'Sales', apps: [leads] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => { went.push('render'); },
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Kevin',
    state: { route: { params } },
    contactsApp: () => (contacts ? { id: 'cc-directory', name: 'Company Contacts', fields: [f('c-n', 'Name', 'text')], items: [] } : null),
    contactIntake: async () => ({ ok: true, landed: 1, reused: false, contact: { id: 'c-9', company_id: 'co1' } }),
    contactSeat: () => null,
    navigate: (path) => { went.push(path); },
    companyPath: (section, query, companyId) => `/company/${companyId}/${section}?${new URLSearchParams(query)}`,
  });

  const button = {
    id: 'p-btn',
    config: { action, targetCompany: 'co1', targetApp: contacts ? 'cc-directory' : 'app-leads' },
  };
  const press = () => push.pressButton('co1', source, button, source.items[0], { id: 'ws-1', activity: [] });
  return {
    press, source, leads, went,
  };
}

test('moving the record you are reading takes you with it', async () => {
  const h = harness();
  assert.equal(await h.press(), true);
  assert.equal(h.source.items.length, 0, 'it left this app');
  assert.equal(h.leads.items.length, 1, 'and landed in that one');

  const [where] = h.went;
  assert.ok(where?.startsWith('/company/co1/workspaces'), `expected a workspaces route, got ${where}`);
  const q = new URLSearchParams(where.split('?')[1]);
  assert.equal(q.get('workspace'), 'ws-2', 'the destination workspace, not the one left behind');
  assert.equal(q.get('app_id'), 'app-leads');
  assert.equal(q.get('tab'), 'items');
  // A move KEEPS the record's id -- it went somewhere else, it did not stop existing and start
  // again -- so the link that was open stays valid and simply points into the new app.
  assert.equal(q.get('item_id'), h.leads.items[0].id);
  assert.equal(q.get('item_id'), 'item-1', 'a move keeps the id; only a copy mints a new one');
});

test('a press from the list leaves the reader where they are', async () => {
  // No app_id/item_id on the route: they are looking at the deck, not at this record. Moving
  // them would be the button doing something it was not asked to.
  const h = harness({ onRecordPage: false });
  assert.equal(await h.press(), true);
  assert.deepEqual(h.went, ['render'], 'it must redraw, not navigate');
});

test('reading a DIFFERENT record of the same app does not drag you off it', async () => {
  const h = harness({ appId: 'app-somewhere-else' });
  assert.equal(await h.press(), true);
  assert.deepEqual(h.went, ['render']);
});

test('a copy leaves you on the record, because it is still here', async () => {
  // Only a move empties the page being read. A push files a copy and changes nothing here.
  const h = harness({ action: 'push' });
  assert.equal(await h.press(), true);
  assert.equal(h.source.items.length, 1, 'the record stayed');
  assert.deepEqual(h.went, ['render']);
});

test('moved into the directory, you follow it to the contact card', async () => {
  const h = harness({ contacts: true });
  assert.equal(await h.press(), true);
  const [where] = h.went;
  assert.ok(where?.startsWith('/company/co1/company-contacts'), `expected the directory, got ${where}`);
  assert.equal(new URLSearchParams(where.split('?')[1]).get('contact_id'), 'c-9');
});

test('filed into the directory without moving, you stay put', async () => {
  const h = harness({ contacts: true, action: 'push' });
  assert.equal(await h.press(), true);
  assert.deepEqual(h.went, ['render'], 'the record is still here to read');
});
