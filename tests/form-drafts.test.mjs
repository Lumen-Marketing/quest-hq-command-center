import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createFormDraftManager,
  createFormDraftContext,
  createDraftStore,
  draftStatusView,
  draftStorageKey,
  formDraftContextFromDataset,
  restoreDraftControls,
  serializeDraftControls,
} from '../src/drafts/form-drafts.js';

function createMemoryStorage() {
  const entries = new Map();
  return {
    get length() { return entries.size; },
    key(index) { return [...entries.keys()][index] ?? null; },
    getItem(key) { return entries.has(key) ? entries.get(key) : null; },
    setItem(key, value) { entries.set(key, String(value)); },
    removeItem(key) { entries.delete(key); },
  };
}

test('serializes editable values without sensitive, file, or ignored controls', () => {
  const values = serializeDraftControls([
    { name: 'name', type: 'text', value: 'Acme Roofing', dataset: {} },
    { name: 'notes', type: 'textarea', value: 'Call before arrival', dataset: {} },
    { name: 'urgent', type: 'checkbox', checked: true, dataset: {} },
    { name: 'channel', type: 'radio', value: 'email', checked: false, dataset: {} },
    { name: 'channel', type: 'radio', value: 'sms', checked: true, dataset: {} },
    { name: 'password', type: 'password', value: 'hidden', dataset: {} },
    { name: 'invite_token', type: 'hidden', value: 'secret', dataset: {} },
    { name: 'photos', type: 'file', value: 'roof.jpg', dataset: {} },
    { name: 'temporary', type: 'text', value: 'ignore me', dataset: { draftIgnore: '' } },
    { name: '', type: 'text', value: 'unnamed', dataset: {} },
  ]);

  assert.deepEqual(values, {
    name: { kind: 'value', value: 'Acme Roofing' },
    notes: { kind: 'value', value: 'Call before arrival' },
    urgent: { kind: 'checkbox', checked: true },
    channel: { kind: 'radio', value: 'sms' },
  });
});

test('restores text, select, checkbox, and radio values without touching sensitive controls', () => {
  const controls = [
    { name: 'name', type: 'text', value: 'Old name', dataset: {} },
    { name: 'stage', type: 'select-one', value: 'Prospect', dataset: {} },
    { name: 'urgent', type: 'checkbox', checked: false, dataset: {} },
    { name: 'channel', type: 'radio', value: 'email', checked: true, dataset: {} },
    { name: 'channel', type: 'radio', value: 'sms', checked: false, dataset: {} },
    { name: 'password', type: 'password', value: 'leave me', dataset: {} },
  ];

  restoreDraftControls(controls, {
    name: { kind: 'value', value: 'Recovered name' },
    stage: { kind: 'value', value: 'Lead' },
    urgent: { kind: 'checkbox', checked: true },
    channel: { kind: 'radio', value: 'sms' },
    password: { kind: 'value', value: 'replace me' },
  });

  assert.equal(controls[0].value, 'Recovered name');
  assert.equal(controls[1].value, 'Lead');
  assert.equal(controls[2].checked, true);
  assert.equal(controls[3].checked, false);
  assert.equal(controls[4].checked, true);
  assert.equal(controls[5].value, 'leave me');
});

test('isolates draft keys across profile, company, workspace, form, and record boundaries', () => {
  const base = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'job',
    recordId: 'job-a',
  });
  const baseKey = draftStorageKey(base);
  const variants = [
    { ...base, profileId: 'person-b' },
    { ...base, companyId: 'company-b' },
    { ...base, workspaceId: 'workspace-b' },
    { ...base, formType: 'quote' },
    { ...base, recordId: 'job-b' },
  ];

  assert.match(baseKey, /^questbase\.form-draft\.v1:/);
  variants.forEach((variant) => assert.notEqual(draftStorageKey(variant), baseKey));
});

test('stores current drafts and removes them after the configured lifetime', () => {
  const storage = createMemoryStorage();
  let currentTime = 1_000;
  const store = createDraftStore({
    storage,
    now: () => currentTime,
    ttlMs: 100,
  });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'job',
    recordId: 'new',
  });
  const values = { name: { kind: 'value', value: 'Roof replacement' } };

  assert.equal(store.write(context, values).ok, true);
  assert.deepEqual(store.read(context).draft.values, values);

  currentTime = 1_101;
  assert.equal(store.read(context).draft, null);
  assert.equal(storage.getItem(draftStorageKey(context)), null);
});

test('ignores and removes a malformed draft without disabling draft protection', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'contact',
    recordId: 'contact-a',
  });
  storage.setItem(draftStorageKey(context), '{not-json');

  const result = store.read(context);

  assert.equal(result.ok, true);
  assert.equal(result.draft, null);
  assert.equal(storage.getItem(draftStorageKey(context)), null);
});

test('purges only the signing-out profile draft namespace', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const context = (profileId, companyId) => createFormDraftContext({
    profileId,
    companyId,
    workspaceId: 'workspace-a',
    formType: 'job',
    recordId: 'new',
  });
  const personACompanyA = context('person-a', 'company-a');
  const personACompanyB = context('person-a', 'company-b');
  const personBCompanyA = context('person-b', 'company-a');

  store.write(personACompanyA, {});
  store.write(personACompanyB, {});
  store.write(personBCompanyA, {});

  assert.deepEqual(store.purgeProfile('person-a'), { ok: true, removed: 2 });
  assert.equal(store.read(personACompanyA).draft, null);
  assert.equal(store.read(personACompanyB).draft, null);
  assert.notEqual(store.read(personBCompanyA).draft, null);
});

test('debounces repeated captures and flushes the latest values on demand', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const timers = new Map();
  let nextTimerId = 1;
  const manager = createFormDraftManager({
    store,
    delayMs: 800,
    setTimer(callback) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
    },
  });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'quote',
    recordId: 'new',
  });

  manager.capture(context, [{ name: 'name', type: 'text', value: 'First', dataset: {} }]);
  manager.capture(context, [{ name: 'name', type: 'text', value: 'Latest', dataset: {} }]);

  assert.equal(timers.size, 1);
  const [timerId, timerCallback] = [...timers.entries()][0];
  timers.delete(timerId);
  timerCallback();
  assert.equal(manager.read(context).draft.values.name.value, 'Latest');

  manager.capture(context, [{ name: 'name', type: 'text', value: 'Flushed', dataset: {} }]);
  assert.equal(manager.flush(context).ok, true);
  assert.equal(timers.size, 0);
  assert.equal(manager.read(context).draft.values.name.value, 'Flushed');
});

test('clearing a draft removes both its stored copy and queued write', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const timers = new Map();
  let nextTimerId = 1;
  const manager = createFormDraftManager({
    store,
    setTimer(callback) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
    },
  });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'contact',
    recordId: 'new',
  });

  store.write(context, { name: { kind: 'value', value: 'Stored' } });
  manager.capture(context, [{ name: 'name', type: 'text', value: 'Queued', dataset: {} }]);

  assert.equal(manager.clear(context).ok, true);
  assert.equal(timers.size, 0);
  assert.equal(manager.read(context).draft, null);
});

test('flushes every queued form before the page is hidden', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const manager = createFormDraftManager({
    store,
    setTimer() { return Symbol('timer'); },
    clearTimer() {},
  });
  const contactContext = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'contact',
    recordId: 'new',
  });
  const jobContext = { ...contactContext, formType: 'job' };

  manager.capture(contactContext, [{ name: 'name', type: 'text', value: 'Contact draft', dataset: {} }]);
  manager.capture(jobContext, [{ name: 'title', type: 'text', value: 'Job draft', dataset: {} }]);

  const result = manager.flushAll();

  assert.equal(result.ok, true);
  assert.equal(manager.read(contactContext).draft.values.name.value, 'Contact draft');
  assert.equal(manager.read(jobContext).draft.values.title.value, 'Job draft');
});

test('restores a stored draft into the current form controls', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const manager = createFormDraftManager({ store });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'underwriter',
    recordId: 'contact-a',
  });
  const controls = [
    { name: 'insurance_company', type: 'text', value: '', dataset: {} },
    { name: 'roof_type', type: 'select-one', value: 'Shingle', dataset: {} },
  ];
  store.write(context, {
    insurance_company: { kind: 'value', value: 'Recovery Insurance' },
    roof_type: { kind: 'value', value: 'Tile' },
  });

  const result = manager.restore(context, controls);

  assert.equal(result.ok, true);
  assert.equal(result.draft.values.roof_type.value, 'Tile');
  assert.equal(controls[0].value, 'Recovery Insurance');
  assert.equal(controls[1].value, 'Tile');
});

test('purging a profile removes stored drafts and cancels that profile queued writes', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const timers = new Map();
  let nextTimerId = 1;
  const manager = createFormDraftManager({
    store,
    setTimer(callback) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
    },
  });
  const context = (profileId) => createFormDraftContext({
    profileId,
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'job',
    recordId: 'new',
  });
  const personA = context('person-a');
  const personB = context('person-b');

  store.write(personA, { title: { kind: 'value', value: 'Stored A' } });
  manager.capture(personA, [{ name: 'title', type: 'text', value: 'Queued A', dataset: {} }]);
  manager.capture(personB, [{ name: 'title', type: 'text', value: 'Queued B', dataset: {} }]);

  const result = manager.purgeProfile('person-a');

  assert.deepEqual(result, { ok: true, removed: 1 });
  assert.equal(timers.size, 1);
  assert.equal(manager.read(personA).draft, null);
  assert.equal(manager.flush(personB).ok, true);
  assert.equal(manager.read(personB).draft.values.title.value, 'Queued B');
});

test('builds a scoped draft context from protected form data attributes', () => {
  const context = formDraftContextFromDataset({
    draftCompanyId: 'company-a',
    draftWorkspaceId: 'workspace-a',
    draftType: 'quote',
    draftRecordId: 'quote-a',
  }, 'person-a');

  assert.deepEqual(context, {
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'quote',
    recordId: 'quote-a',
  });
});

test('maps draft lifecycle states to concise user-facing status text', () => {
  assert.deepEqual(draftStatusView('idle'), {
    label: 'Drafts save automatically',
    tone: 'idle',
  });
  assert.deepEqual(draftStatusView('saving'), {
    label: 'Saving draft…',
    tone: 'saving',
  });
  assert.deepEqual(draftStatusView('saved', '2:30 PM'), {
    label: 'Draft saved locally · 2:30 PM',
    tone: 'saved',
  });
  assert.deepEqual(draftStatusView('restored'), {
    label: 'Local draft restored',
    tone: 'restored',
  });
  assert.deepEqual(draftStatusView('discarded'), {
    label: 'Local draft discarded',
    tone: 'idle',
  });
  assert.deepEqual(draftStatusView('unavailable'), {
    label: 'Local draft saving unavailable',
    tone: 'unavailable',
  });
});
