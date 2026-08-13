import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "in the workspace app the location field, I want it when the pin location icon is clicked
// it will open a modal Map to drop a pin, or search a location, or use my current location,
// so it instantly fills the location or the address."
//
// The CRM already has that picker. The whole risk here is the modal swap: an App Builder
// record keeps its unsaved edits in state.builderModal.draft, and renderActiveModal answers
// to builderModal before state.modal -- so showing a map over a record has to carry the
// record, and everything typed into it, through and back.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const fieldUi = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

const fn = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = main.lastIndexOf('\n', at) + 1;
  return main.slice(start, main.indexOf('\n}', at) + 2);
};

// One harness for all three transitions, so they are exercised against the same state the
// way the app runs them, rather than three isolated snapshots.
function harness(initialDraftValues = {}) {
  const calls = { collected: 0, renders: 0, toasts: [] };
  const state = {
    builderModal: {
      kind: 'item',
      companyId: 'co-1',
      workspaceId: 'ws-1',
      appId: 'app-1',
      editId: 'item-1',
      mode: 'edit',
      draft: { values: { ...initialDraftValues } },
    },
    locationPicker: null,
    modal: '',
  };
  const api = new Function(
    'state', 'calls', 'typedIntoOtherFields',
    `
    let locationPickerMap = {}, locationPickerMarker = {};
    const render = () => { calls.renders += 1; };
    const showToast = (msg) => { calls.toasts.push(msg); };
    // Stands in for the real one: it copies what is on screen into the draft. The point of
    // the test is that whatever it captured still exists after the map closes.
    const wbCollectModalDraft = () => {
      calls.collected += 1;
      Object.assign(state.builderModal.draft.values, typedIntoOtherFields);
    };
    const locationPickerDefaultPin = () => ({ lat: 33.4484, lng: -112.074 });
    const document = { querySelector: () => null };
    ${fn('wbOpenLocationPicker')}
    ${fn('wbCloseLocationPicker')}
    ${fn('saveLocationPicker')}
    return { wbOpenLocationPicker, wbCloseLocationPicker, saveLocationPicker };
    `,
  )(state, calls, { name: 'Roman Juan', phone: '+639-565-970762' });
  return { state, calls, ...api };
}

test('the pin captures the rest of the form before the map replaces it', () => {
  // Without this, opening the map is a silent data-loss bug: the DOM holding every other
  // typed field is thrown away by the render that paints the map.
  const h = harness({ loc: '' });
  h.wbOpenLocationPicker('loc');
  assert.equal(h.calls.collected, 1, 'the draft was never captured');
  assert.deepEqual(h.state.builderModal.returnTo.draft.values, {
    loc: '', name: 'Roman Juan', phone: '+639-565-970762',
  });
});

test('the map paints over the record, and the record stays in state underneath', () => {
  const h = harness({ loc: 'Cebu' });
  h.wbOpenLocationPicker('loc');
  assert.equal(h.state.builderModal.kind, 'wb-location');
  assert.equal(h.state.builderModal.returnTo.kind, 'item', 'the record is still there to come back to');
  assert.equal(h.state.builderModal.returnTo.editId, 'item-1');
  assert.equal(h.state.locationPicker.kind, 'wb-field');
  assert.equal(h.state.locationPicker.field, 'loc');
  // Seeded with whatever is already in the field, so the map opens on that place rather
  // than the hardcoded fallback.
  assert.equal(h.state.locationPicker.address, 'Cebu');
});

test('saving writes the address into the draft and hands the record back', async () => {
  const h = harness({ loc: '' });
  h.wbOpenLocationPicker('loc');
  h.state.locationPicker.address = '123 Real Street, Paradise Valley AZ';
  await h.saveLocationPicker();
  assert.equal(h.state.builderModal.kind, 'item', 'back on the record');
  assert.equal(h.state.builderModal.draft.values.loc, '123 Real Street, Paradise Valley AZ');
  // The whole point: the other fields survived the trip through the map.
  assert.equal(h.state.builderModal.draft.values.name, 'Roman Juan');
  assert.equal(h.state.builderModal.draft.values.phone, '+639-565-970762');
  assert.equal(h.state.locationPicker, null);
});

test('a pin is not persisted behind the record\'s back', () => {
  // It lands in the draft. If the person then cancels the record, nothing was written --
  // the record modal owns saving, and this must not become a second write path.
  const body = fn('saveLocationPicker');
  const branch = body.slice(body.indexOf("picker.kind === 'wb-field'"), body.indexOf("picker.kind === 'input'"));
  assert.match(branch, /back\.draft = \{[\s\S]*?values: \{[\s\S]*?\[picker\.field\]: address/);
  // Comments stripped first: prose about not persisting is not a call to persist.
  const code = branch.replace(/\/\/[^\n]*/g, '');
  assert.ok(!/persist|supabaseWrite|wbSave/.test(code), 'the pin branch must not write to storage');
});

test('cancelling returns to the record instead of stranding the person on a map', async () => {
  const h = harness({ loc: 'somewhere' });
  h.wbOpenLocationPicker('loc');
  h.wbCloseLocationPicker();
  assert.equal(h.state.builderModal.kind, 'item');
  assert.equal(h.state.builderModal.draft.values.name, 'Roman Juan', 'cancel keeps the edits too');
  assert.equal(h.state.builderModal.draft.values.loc, 'somewhere', 'and does not clear the field');
  assert.equal(h.state.locationPicker, null);
});

test('Cancel and the shell Close both route through the restore', () => {
  // closeActiveModal only clears state.modal. Reaching it with builderModal still set to
  // 'wb-location' would leave the map painted with nothing able to dismiss it.
  const body = fn('closeActiveModal');
  assert.match(body, /if \(state\.builderModal\?\.kind === 'wb-location'\) \{ wbCloseLocationPicker\(\); return true; \}/);
  assert.ok(
    body.indexOf("kind === 'wb-location'") < body.indexOf("state.modal = ''"),
    'the restore has to come before the generic teardown',
  );
});

test('the picker is dispatched ahead of the builder modal', () => {
  const body = fn('renderActiveModal');
  assert.ok(
    body.indexOf("state.builderModal?.kind === 'wb-location'") < body.indexOf('if (state.builderModal) return renderWorkspaceBuilderModal();'),
    'builderModal answers first, so the map would never paint',
  );
  assert.match(body, /if \(state\.builderModal\?\.kind === 'wb-location'\) return renderLocationPickerModal\(\);/);
});

test('the map instances are dropped with the node they belonged to', () => {
  // render() replaces the DOM. Holding the old Leaflet map means the next open talks to a
  // map that is no longer on the page, and mountLocationPicker's bound-guard is keyed to
  // the node, so it would happily build a second one.
  for (const name of ['wbCloseLocationPicker', 'saveLocationPicker']) {
    const body = fn(name);
    assert.match(body, /locationPickerMap = null;/, `${name} leaks the map`);
    assert.match(body, /locationPickerMarker = null;/, `${name} leaks the marker`);
  }
});

test('the pin is a real button wired to the action', () => {
  // It was a decorative <span>, which is exactly why clicking it did nothing.
  assert.match(fieldUi, /<button class="wb-cur wb-pin-btn" type="button" data-action="wb-location-pin" data-f="\$\{h\(f\.id\)\}"/);
  assert.match(fieldUi, /aria-label="Pick \$\{h\(f\.name \|\| 'location'\)\} on a map"/);
  const at = main.indexOf("action === 'wb-location-pin'");
  assert.notEqual(at, -1, 'the button renders but nothing handles it');
  assert.match(main.slice(at, at + 200), /wbOpenLocationPicker\(node\.dataset\.f\)/);
});

test('opening a map is not treated as a write', () => {
  // Or the read-only demo blocks it, and it writes nothing -- the record's Save does.
  const body = fn('isMutableAction');
  assert.match(body, /'wb-location-pin',/);
});

test('the button is styled as a control, not left with browser chrome', () => {
  assert.match(styles, /\.wb-pin-btn \{[\s\S]*?cursor: pointer;/);
  assert.match(styles, /\.wb-pin-btn:focus-visible \{/, 'keyboard users need to see it');
  // .wb-cur sets colour on the same element; the later rule is what decides.
  assert.ok(styles.lastIndexOf('.wb-pin-btn {') > styles.lastIndexOf('.wb-cur {'), 'source order decides');
});

test('the map picker it reuses really does offer all three ways in', () => {
  // The request was drop a pin, search, or use my location. This wires to the existing
  // picker rather than building a second one -- so those three have to be in it.
  // The markup moved into its own on-demand module to pay the bundle budget; main.js keeps
  // only a loader shim of the same name, so slicing that would assert against nothing.
  const modal = readFileSync(join(root, 'src', 'crm', 'location-picker-modal.js'), 'utf8');
  assert.match(modal, /data-action="location-picker-search"/);
  assert.match(modal, /data-action="location-picker-current"/);
  assert.match(modal, /data-location-map/);
  // The map runtime moved into the same on-demand module as the markup; main.js keeps only
  // a shim, so assert against the module or this checks nothing.
  assert.match(modal, /locationPickerMarker\.on\('dragend'/);
  assert.match(modal, /locationPickerMap\.on\('click'/);
  assert.match(modal, /navigator\.geolocation\.getCurrentPosition/);
});
