import assert from 'node:assert/strict';
import test from 'node:test';

import { renderFieldConfig } from '../src/workspace/field-config-ui.js';

// The relationship config panel went blank: Workspace, Linked app, Show field, Identify by and
// Specific record all disappeared at once.
//
// pullConfigUI was added at module scope and called h(...), but h is destructured from ctx
// INSIDE renderFieldConfig. It threw a ReferenceError, which took the whole panel down — the
// controls were never removed, nothing rendered at all.
//
// Every other test of this area matched source text, which a function that throws passes just
// as happily as one that works. So these CALL it. Every field type, because the same mistake
// anywhere in the switch takes out that type's panel the same way.

const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Every field type the builder offers, so the sweep below really is every panel.
const ALL_TYPES = [
  'text', 'textarea', 'number', 'money', 'date', 'category', 'status', 'tags', 'checkbox',
  'email', 'url', 'phone', 'location', 'file', 'image', 'user', 'company_contact', 'rating',
  'duration', 'progress', 'checklist', 'calculation', 'autonumber', 'created_time',
  'updated_time', 'relationship', 'rollup',
];

const TARGET_APP = {
  id: 'app-lead',
  name: 'Lead Gen',
  fields: [
    { id: 'l-contact', type: 'company_contact', label: 'Contact', config: {} },
    { id: 'l-title', type: 'text', label: 'Title', config: {} },
    { id: 'l-phone', type: 'phone', label: 'Phone', config: {} },
  ],
  items: [{ id: 'i1', values: { 'l-title': 'demo' } }, { id: 'i2', values: { 'l-title': 'roofing' } }],
};
const APP = {
  id: 'app-uw',
  name: 'Underwriter',
  fields: [
    { id: 'f-rel', type: 'relationship', label: 'Leads', config: {} },
    { id: 'f-phone', type: 'phone', label: 'Phone', config: {} },
    { id: 'f-notes', type: 'text', label: 'Notes', config: {} },
  ],
  items: [],
};

const ctx = {
  h,
  state: { builderModal: { companyId: 'co', workspaceId: 'ws', appId: 'app-uw' } },
  canonicalCompanyId: (id) => id || 'co',
  companyName: () => 'Quest Roofing',
  wbOptRow: (o) => `<div class="wb-opt-item" data-oid="${h(o.id)}"></div>`,
  wbProgStopRow: () => '',
  wbProgressDisplayHtml: () => '',
  wbRelTargetApp: () => TARGET_APP,
  wbTargetApp: () => TARGET_APP,
  wbCompanyApps: () => [{ app: TARGET_APP }],
  wbRelLabel: (app, item) => String(item?.values?.['l-title'] || 'Untitled'),
  // The real values, not empty arrays: a stub that is emptier than production makes the panel
  // throw for reasons production never would, and hides the ones it would.
  WB_PROGRESS_STOPS_DEFAULT: [
    { upto: 0, color: '#ffffff' }, { upto: 20, color: '#dc2626' }, { upto: 40, color: '#eab308' },
    { upto: 80, color: '#e0552d' }, { upto: 100, color: '#16a34a' },
  ],
  // Every type, with the keys the panels read (a progress panel reads its type's colour as the
  // default bar colour). A stub missing a type throws where production would not.
  WB_FIELD_TYPES: Object.fromEntries(ALL_TYPES.map((type) => [type, { label: type, color: '#2563eb', icon: 'ti-square', desc: type }])),
  WB_PROGRESS_DISPLAYS: [['bar', 'Linear bar'], ['ring', 'Circular ring'], ['segments', 'Segmented bar']],
};

const relationshipField = (config = {}) => ({
  id: 'f-rel', type: 'relationship', label: 'Leads', config: { targetApp: 'app-lead', ...config },
});

test('the relationship panel renders every control it has always had', () => {
  const html = renderFieldConfig(relationshipField(), APP, ctx);
  ['wbRelTarget', 'wbRelDisplay', 'wbRelIdentify', 'wbRelFixed', 'wbRelMulti']
    .forEach((id) => assert.match(html, new RegExp(`id="${id}"`), `${id} is missing from the panel`));
  // The Workspace select appears only where there is more than one to choose between.
  const twoWorkspaces = renderFieldConfig(relationshipField(), APP, {
    ...ctx, wbCompanyApps: (id) => [{ app: { ...TARGET_APP, id: `${TARGET_APP.id}-${id}` } }], wbDoc: () => ({}),
    state: { builderModal: { companyId: 'co', workspaceId: 'ws', appId: 'app-uw' } },
  });
  assert.ok(typeof twoWorkspaces === 'string');
  assert.match(html, /Show field/);
  assert.match(html, /Identify by/);
  assert.match(html, /Specific record/);
  // And the linked app's fields are actually offered in Show field / Identify by.
  assert.match(html, /<option value="l-title"[^>]*>Title<\/option>/);
});

test('the copy-across section renders beside them, not instead of them', () => {
  const html = renderFieldConfig(relationshipField({ pull: [{ from: 'l-phone', to: 'f-phone' }] }), APP, ctx);
  assert.match(html, /Copy from the linked record/);
  assert.match(html, /data-wb-pull-row/);
  assert.match(html, /data-wb-pull-add/);
  // Still there alongside it.
  assert.match(html, /id="wbRelDisplay"/);
  assert.match(html, /id="wbRelFixed"/);
});

test('the copy section is hidden for a multi-link, and the rest still renders', () => {
  const html = renderFieldConfig(relationshipField({ multiple: true }), APP, ctx);
  assert.ok(!/Copy from the linked record/.test(html));
  assert.match(html, /id="wbRelDisplay"/);
  assert.match(html, /id="wbRelMulti"/);
});

test('a relationship with no linked app yet still renders its picker', () => {
  // targetApp is null before an app is chosen — every section guarded on it must cope.
  const html = renderFieldConfig({ id: 'f-rel', type: 'relationship', label: 'Leads', config: {} }, APP,
    { ...ctx, wbTargetApp: () => null, wbRelTargetApp: () => null });
  assert.match(html, /id="wbRelTarget"/);
  assert.ok(!/id="wbRelDisplay"/.test(html), 'nothing to show from an app that is not chosen');
});

test('every field type renders its panel without throwing', () => {
  // The relationship panel broke because one helper reached for a binding it could not see.
  // Nothing about that mistake is specific to relationships.
  const types = ALL_TYPES;
  types.forEach((type) => {
    const field = { id: `f-${type}`, type, label: type, config: type === 'relationship' ? { targetApp: 'app-lead' } : {} };
    assert.doesNotThrow(() => renderFieldConfig(field, APP, ctx), `${type} config panel throws`);
    assert.equal(typeof renderFieldConfig(field, APP, ctx), 'string');
  });
});
