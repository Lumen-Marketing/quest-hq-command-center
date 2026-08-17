import assert from 'node:assert/strict';
import test from 'node:test';

import { collectFieldConfig, renderFieldConfig } from '../src/workspace/field-config-ui.js';

// The mapping control did nothing: you picked a field on the left and the right select stayed
// on "Pick a field here first" for ever.
//
// The left select carries data-wb-rel-refresh, so choosing a field COLLECTS the panel and
// re-renders it from what was collected. The readback dropped any row without a destination
// yet -- so it threw away the half just chosen, the row came back blank, and the right select,
// which only fills once the left one resolves, never woke up.
//
// This drives the real sequence: render -> choose -> collect -> render.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const F = (id, label, type) => ({
  id, label, type, config: {},
});

const APP1 = {
  id: 'app1',
  name: 'App 1',
  fields: [F('a-name', 'Name', 'text'), F('a-phone', 'Phone', 'phone'), { id: 'a-btn', label: 'Send', type: 'button', config: {} }],
  items: [],
};
const APP2 = {
  id: 'app2', name: 'App 2', fields: [F('b-client', 'Client name', 'text'), F('b-phone', 'Phone', 'phone')], items: [],
};

const CTX = {
  h,
  state: { builderModal: { companyId: 'co1' }, workspaceBuilderDocs: { co1: {} } },
  canonicalCompanyId: (id) => id || 'co1',
  companyName: () => 'Quest',
  wbCompanyApps: () => [{ app: APP1 }, { app: APP2 }],
  wbTargetApp: (c, id) => [APP1, APP2].find((a) => a.id === id) || null,
  companyContactFieldsFor: () => [],
  WB_FIELD_TYPES: { text: { icon: 'ti-letter-case' }, phone: { icon: 'ti-phone' } },
};

const render = (config) => renderFieldConfig({
  id: 'a-btn', label: 'Send', type: 'button', config,
}, APP1, CTX);

/** The options of one select inside a `[data-wb-map-row]`, by its data attribute. */
function mapOptions(html, side) {
  const at = html.indexOf(`data-wb-map-${side}`);
  if (at === -1) return null;
  const body = html.slice(at, html.indexOf('</select>', at));
  return [...body.matchAll(/<option value="([^"]*)"/g)].map(([, v]) => v);
}

/**
 * Collect the panel the way wbCollectModalDraft does, with the left select set to `chose`.
 * Only the map rows matter here, so the rest of the document is the minimum that satisfies
 * collectButtonConfig.
 */
function collect(config, chose) {
  const row = {
    kids: [
      { mark: 'data-wb-map-from', value: chose.from ?? '' },
      { mark: 'data-wb-map-to', value: chose.to ?? '' },
    ],
    querySelector(sel) { const k = sel.replace(/[[\]]/g, ''); return this.kids.find((c) => c.mark === k) || null; },
  };
  const byId = {
    wbBtnAction: { value: 'push' }, wbBtnApp: { value: 'app2' }, wbBtnCompany: { value: 'co1' }, wbBtnAll: { checked: true },
  };
  global.document = {
    getElementById: (id) => byId[id] || null,
    querySelector: () => null,
    querySelectorAll: (sel) => (sel === '[data-wb-map-row]' ? [row] : []),
  };
  const next = { ...config };
  collectFieldConfig('button', next, 'co1');
  return next;
}

test('choosing a field on the left does not throw the row away', () => {
  const config = { action: 'push', targetApp: 'app2', targetCompany: 'co1', map: [{ from: '', to: '' }] };
  const after = collect(config, { from: 'a-name' });
  assert.deepEqual(after.map, [{ from: 'a-name', to: '' }], 'the half-chosen row was dropped');
});

test('and the destination select wakes up on the next render', () => {
  // This is the symptom the user saw: "Pick a field here first", for ever.
  const config = collect(
    { action: 'push', targetApp: 'app2', targetCompany: 'co1', map: [{ from: '', to: '' }] },
    { from: 'a-name' },
  );
  const html = render(config);
  assert.doesNotMatch(html, /Pick a field here first/, 'the right select is still disabled');
  // App 2's text field is offered; its phone field is not, because text cannot become a phone…
  const options = mapOptions(html, 'to');
  assert.ok(options.includes('b-client'), 'the destination list is empty');
});

test('a completed row survives a further collect', () => {
  const after = collect(
    { action: 'push', targetApp: 'app2', targetCompany: 'co1', map: [{ from: 'a-name', to: 'b-client' }] },
    { from: 'a-name', to: 'b-client' },
  );
  assert.deepEqual(after.map, [{ from: 'a-name', to: 'b-client' }]);
});

test('a row nobody has touched at all is not kept', () => {
  const after = collect({ action: 'push', targetApp: 'app2', targetCompany: 'co1', map: [] }, {});
  assert.deepEqual(after.map, []);
});

test('the left select offers this app’s fields, minus the button itself', () => {
  const html = render({ action: 'push', targetApp: 'app2', targetCompany: 'co1', map: [{ from: '', to: '' }] });
  const options = mapOptions(html, 'from');
  assert.deepEqual(options, ['', 'a-name', 'a-phone'], 'the button should not be a source');
});
