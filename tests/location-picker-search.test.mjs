import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocationPickerModal } from '../src/crm/location-picker-modal.js';

function pickerContext(overrides = {}) {
  return {
    activeCompanyId: () => 'company-1',
    contactAddressOptions: () => [],
    h: (value) => String(value ?? ''),
    loadLeaflet: async () => null,
    locationPickerDefaultPin: () => ({ lat: 33.4484, lng: -112.074 }),
    refreshAddressSuggestions: async () => {},
    renderModalShell: (_eyebrow, _title, body) => body,
    showToast: () => {},
    state: { locationPicker: { address: '20165 East Mayfield Road' } },
    ...overrides,
  };
}

test('searching an address closes suggestions and prevents a late result from reopening them', async (t) => {
  const priorDocument = globalThis.document;
  const priorFetch = globalThis.fetch;
  const priorWindow = globalThis.window;
  t.after(() => {
    globalThis.document = priorDocument;
    globalThis.fetch = priorFetch;
    globalThis.window = priorWindow;
  });

  const requestId = 'pending-address-request';
  const menu = { hidden: false, innerHTML: '<button>Old suggestion</button>' };
  const status = { textContent: '' };
  const input = {
    value: '20165 East Mayfield Road',
    dataset: {
      addressSuggestRequest: requestId,
      addressSuggestTimer: '41',
    },
    closest: () => ({
      querySelector: (selector) => selector === '.address-suggestions-menu' ? menu : null,
    }),
  };
  globalThis.document = {
    querySelector(selector) {
      if (selector === '[data-location-picker-search]') return input;
      if (selector === '[data-location-picker-status]') return status;
      return null;
    },
  };
  globalThis.window = { clearTimeout: () => {} };
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => [{
      display_name: '20165 East Mayfield Road, Florence, Arizona, United States',
      lat: '33.0001',
      lon: '-111.0001',
    }],
  });

  const picker = createLocationPickerModal(pickerContext());
  await picker.searchLocationPickerAddress();

  // Model the address-suggestion request already in flight when Search was clicked.
  if (input.dataset.addressSuggestRequest === requestId) {
    menu.hidden = false;
    menu.innerHTML = '<button>Late suggestion</button>';
  }

  assert.equal(menu.hidden, true, 'the suggestion list remained visible after Search');
  assert.equal(menu.innerHTML, '', 'a stale request repainted the dismissed suggestion list');
  assert.equal(input.value, '20165 East Mayfield Road, Florence, Arizona, United States');
});

test('the map picker keeps one exit in the shell instead of rendering a duplicate Cancel action', () => {
  const html = createLocationPickerModal(pickerContext()).renderLocationPickerModal();

  assert.match(html, /Save exact pin/);
  assert.doesNotMatch(html, />\s*Cancel\s*</, 'Close and Cancel perform the same exit');
});
