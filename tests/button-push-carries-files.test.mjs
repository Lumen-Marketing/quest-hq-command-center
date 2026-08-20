import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';
import { planPush } from '../src/workspace/button-field.js';

// "I tried to upload multiple files using file field, and multiple images using image field, but
// when i move it using the button field move function, the file and the images are gone."
//
// canPull refuses any type with no entry in PULL_FAMILY, and file, image, checklist, tags, sheet
// and form all had none -- so planPush put every one of them in `skipped` and the value never
// travelled. On a COPY that is a field that quietly did not fill in. On a MOVE the record is
// removed from the app it left, so what did not travel is gone.

const f = (id, label, type) => ({ id, label, type, config: {}, required: false, hidden: false });

const PHOTOS = [
  { name: 'roof-before.webp', url: 'https://x/storage/roof-before.webp' },
  { name: 'roof-after.webp', url: 'https://x/storage/roof-after.webp' },
];
const DOCS = [{ name: 'APN 300-06-027A FLOOR PLAN.pdf', url: 'https://x/storage/apn.pdf' }];

function harness({ action = 'move', targetHasFields = true } = {}) {
  const fields = [
    f('p-name', 'Name', 'text'),
    f('p-photos', 'Photos', 'image'),
    f('p-files', 'Plans', 'file'),
    f('p-steps', 'Steps', 'checklist'),
    f('p-btn', 'Send', 'button'),
  ];
  const source = {
    id: 'app-prospect',
    name: 'Prospects',
    fields,
    items: [{
      id: 'item-1',
      values: {
        'p-name': 'Kevin',
        'p-photos': PHOTOS,
        'p-files': DOCS,
        'p-steps': [true, false],
      },
    }],
  };
  const leads = {
    id: 'app-leads',
    name: 'Leads',
    fields: targetHasFields
      ? [f('l-n', 'Name', 'text'), f('l-p', 'Photos', 'image'), f('l-f', 'Plans', 'file'), f('l-s', 'Steps', 'checklist')]
      : [f('l-n', 'Name', 'text')],
    items: [],
  };
  let n = 0;

  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws-2', name: 'Sales', apps: [leads] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Kevin',
    state: { route: { params: new Map() } },
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, landed: 0, reused: false, contact: null }),
    contactSeat: () => null,
    navigate: () => {},
    companyPath: () => '/',
  });

  const button = { id: 'p-btn', config: { action, targetCompany: 'co1', targetApp: 'app-leads' } };
  return {
    source,
    leads,
    button,
    press: () => push.pressButton('co1', source, button, source.items[0], { id: 'ws-1', activity: [] }),
  };
}

test('the plan carries the photos, the files and the checklist', () => {
  const bench = harness();
  const plan = planPush(bench.source, bench.leads, bench.button);
  const carried = plan.carry.map((pair) => pair.from.label).sort();
  assert.deepEqual(carried, ['Name', 'Photos', 'Plans', 'Steps']);
  assert.deepEqual(plan.skipped, [], 'nothing is left behind');
});

test('a MOVE arrives with every photo and file still on it', () => {
  // The one that lost data: the record leaves this app either way, so a value that does not
  // travel is not "not copied", it is destroyed.
  const bench = harness();
  return bench.press().then(() => {
    assert.equal(bench.source.items.length, 0, 'it left');
    const [landed] = bench.leads.items;
    assert.ok(landed, 'and arrived');
    assert.deepEqual(landed.values['l-p'], PHOTOS, 'both photos');
    assert.deepEqual(landed.values['l-f'], DOCS, 'and the plan set');
    assert.deepEqual(landed.values['l-s'], [true, false], 'and the checklist');
  });
});

test('a target that has none of those fields is given them, with the values', () => {
  // planPush creates a missing field in the target, so the config travels with it -- which is
  // what makes carrying a checklist into a brand-new checklist safe.
  const bench = harness({ targetHasFields: false });
  return bench.press().then(() => {
    const made = bench.leads.fields.filter((one) => ['image', 'file', 'checklist'].includes(one.type));
    assert.deepEqual(made.map((one) => one.label).sort(), ['Photos', 'Plans', 'Steps']);
    const [landed] = bench.leads.items;
    const by = Object.fromEntries(bench.leads.fields.map((one) => [one.label, one.id]));
    assert.deepEqual(landed.values[by.Photos], PHOTOS);
    assert.deepEqual(landed.values[by.Plans], DOCS);
  });
});

test('a copy leaves the original holding its own files', () => {
  const bench = harness({ action: 'push' });
  return bench.press().then(() => {
    assert.deepEqual(bench.source.items[0].values['p-photos'], PHOTOS, 'the source keeps them');
    assert.deepEqual(bench.leads.items[0].values['l-p'], PHOTOS, 'and the copy has them too');
  });
});
