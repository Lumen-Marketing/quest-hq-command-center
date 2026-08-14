import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BUTTON_OPS,
  buttonNotReady,
  buttonReady,
  NEVER_PUSHED,
  conditionMet,
  fieldToCreate,
  planPush,
  planSet,
  pushableFields,
  readable,
  setValueFor,
  translateValue,
} from '../src/workspace/button-field.js';
import { createButtonPush } from '../src/workspace/button-push.js';

// "This field is a button, programmable to manipulate the data list... set the condition it
// becomes enabled on, or no condition so it is always active. The action passes the record to
// another company > workspace > app, and if that app has not got the fields, the system merges
// them in."
//
// The worked example, which the push test below reproduces exactly:
//   App1 (John Doe {name}, 13 {age})  +  App2 (USA {address})
//   press the button → App2 has Name, Age and Address, and a new record carrying John Doe / 13
//   with its Address blank.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let seq = 0;
const mintId = () => `new-${++seq}`;

const APP1 = () => ({
  id: 'app1',
  name: 'App 1',
  fields: [
    { id: 'f-name', type: 'text', label: 'Name', config: {} },
    { id: 'f-age', type: 'number', label: 'Age', config: {} },
    { id: 'f-btn', type: 'button', label: 'Graduate', config: {} },
    { id: 'f-num', type: 'autonumber', label: 'Ref', config: {} },
    { id: 'f-made', type: 'created_time', label: 'Created', config: {} },
    { id: 'f-calc', type: 'calculation', label: 'Twice age', config: { formula: '{Age} * 2' } },
  ],
  items: [{ id: 'i1', values: { 'f-name': 'John Doe', 'f-age': 13, 'f-num': 'A-001' } }],
});

const APP2 = () => ({
  id: 'app2',
  name: 'App 2',
  fields: [{ id: 'g-addr', type: 'location', label: 'Address', config: {} }],
  items: [{ id: 'j1', values: { 'g-addr': 'USA' } }],
});

// ---- which fields may travel ---------------------------------------------------------------

test('the button, and every automatic field, stay behind', () => {
  // "Some fields cannot be graduated: the button field and the other auto fields like the auto
  // number, date created and date updated."
  const carried = pushableFields(APP1(), 'f-btn').map((field) => field.label);
  assert.deepEqual(carried, ['Name', 'Age']);
  ['button', 'autonumber', 'created_time', 'updated_time', 'calculation', 'rollup']
    .forEach((type) => assert.ok(NEVER_PUSHED.has(type), `${type} must never be pushed`));
});

test('a chosen subset is carried, and no choice means all of it', () => {
  // "Pass all the data, or select specific data to pass."
  assert.deepEqual(pushableFields(APP1(), 'f-btn', ['f-age']).map((f) => f.label), ['Age']);
  assert.deepEqual(pushableFields(APP1(), 'f-btn', []).map((f) => f.label), ['Name', 'Age'], 'empty means all');
  assert.deepEqual(pushableFields(APP1(), 'f-btn', null).map((f) => f.label), ['Name', 'Age']);
});

// ---- when the button is live ---------------------------------------------------------------

const stageApp = {
  fields: [
    { id: 's', type: 'status', label: 'Stage', config: { options: [{ id: 'o1', label: 'Won' }, { id: 'o2', label: 'Lost' }] } },
    { id: 't', type: 'text', label: 'Owner', config: {} },
    { id: 'n', type: 'number', label: 'Price', config: {} },
  ],
};
const record = (values) => ({ id: 'x', values });

test('no condition means always active', () => {
  // A button that does nothing until it is configured twice is a button people call broken.
  assert.equal(conditionMet({ config: {} }, record({}), stageApp), true);
  assert.equal(conditionMet({ config: { when: [] } }, record({}), stageApp), true);
  assert.equal(conditionMet({}, record({}), stageApp), true);
});

test('a stage condition is written against the label, not the option id', () => {
  // Somebody setting "enabled when the stage is Won" typed Won. Comparing that against
  // "o1" would never once be true.
  const button = { config: { when: [{ field: 's', op: 'eq', value: 'Won' }] } };
  assert.equal(conditionMet(button, record({ s: 'o1' }), stageApp), true);
  assert.equal(conditionMet(button, record({ s: 'o2' }), stageApp), false);
  assert.equal(conditionMet(button, record({}), stageApp), false);
  assert.equal(readable(stageApp.fields[0], 'o1'), 'Won');
});

test('a text condition ignores case and stray spacing', () => {
  const button = { config: { when: [{ field: 't', op: 'eq', value: 'abe ' }] } };
  assert.equal(conditionMet(button, record({ t: 'Abe' }), stageApp), true);
});

test('every operator does what it says', () => {
  const check = (op, value, held) => conditionMet({ config: { when: [{ field: 'n', op, value }] } }, record({ n: held }), stageApp);
  assert.equal(check('eq', 10, 10), true);
  assert.equal(check('neq', 10, 11), true);
  assert.equal(check('gt', 10, 11), true);
  assert.equal(check('gt', 10, 9), false);
  assert.equal(check('lt', 10, 9), true);
  assert.equal(check('filled', '', 0), true, 'zero is a value somebody entered');
  assert.equal(check('empty', '', ''), true);
  assert.equal(check('filled', '', ''), false);
  // Every operator offered in the panel is one this understands.
  BUTTON_OPS.forEach(([op]) => assert.doesNotThrow(() => check(op, 1, 1), op));
});

test('two conditions both have to hold', () => {
  const button = { config: { when: [{ field: 's', op: 'eq', value: 'Won' }, { field: 'n', op: 'gt', value: 100 }] } };
  assert.equal(conditionMet(button, record({ s: 'o1', n: 500 }), stageApp), true);
  assert.equal(conditionMet(button, record({ s: 'o1', n: 50 }), stageApp), false);
  assert.equal(conditionMet(button, record({ s: 'o2', n: 500 }), stageApp), false);
});

test('a half-written condition is ignored rather than blocking the button', () => {
  // The panel keeps a row while it is being filled in; it must not lock the button meanwhile.
  const button = { config: { when: [{ field: '', op: 'eq', value: 'Won' }] } };
  assert.equal(conditionMet(button, record({}), stageApp), true);
});

// ---- the merge -------------------------------------------------------------------------

test('the plan says what will be carried, made, and left behind', () => {
  const plan = planPush(APP1(), APP2(), { id: 'f-btn', config: {} });
  assert.deepEqual(plan.create.map((field) => field.label), ['Name', 'Age'], 'App 2 has neither');
  assert.deepEqual(plan.carry.map((pair) => pair.from.label), ['Name', 'Age']);
  assert.deepEqual(plan.blocked.sort(), ['Created', 'Ref', 'Twice age'], 'named, so nobody is surprised');
});

test('a field the target already has is reused, never duplicated', () => {
  const target = APP2();
  target.fields.push({ id: 'g-name', type: 'text', label: ' name ', config: {} });
  const plan = planPush(APP1(), target, { id: 'f-btn', config: {} });
  assert.deepEqual(plan.create.map((field) => field.label), ['Age'], 'Name matched, spacing and case ignored');
  assert.equal(plan.carry.find((pair) => pair.from.label === 'Name').to.id, 'g-name');
});

test('a relationship is carried where it fits and left behind where it does not', () => {
  // Creating one would point at an app that workspace may not even see.
  const source = { fields: [{ id: 'r', type: 'relationship', label: 'Deal', config: { targetApp: 'x' } }] };
  const plan = planPush(source, APP2(), { id: 'b', config: {} });
  assert.deepEqual(plan.create, []);
  assert.deepEqual(plan.carry, []);
  assert.equal(plan.skipped.length, 1);
  assert.match(plan.skipped[0].why, /no Deal to link into/);
});

test('a created field is a clone with its own id and none of the source wiring', () => {
  const source = {
    id: 'f-trade', type: 'category', label: 'Trade',
    required: true,
    config: { options: [{ id: 'o1', label: 'Roofing' }], pull: [{ from: 'a', to: 'b' }], pullAll: true, when: [1] },
  };
  const clone = fieldToCreate(source, mintId);
  assert.notEqual(clone.id, 'f-trade', 'ids are per-app and would collide');
  assert.equal(clone.label, 'Trade');
  assert.equal(clone.type, 'category');
  assert.deepEqual(clone.config.options, [{ id: 'o1', label: 'Roofing' }], 'a category with no options cannot be filled in');
  assert.equal(clone.config.pull, undefined, 'no copy rules from the app it left');
  assert.equal(clone.config.pullAll, undefined);
  assert.equal(clone.config.when, undefined);
  assert.equal(clone.required, false, 'a field arriving mid-life must not invalidate every existing record');
  source.config.options[0].label = 'changed';
  assert.equal(clone.config.options[0].label, 'Roofing', 'and it is a copy, not a shared reference');
});

// ---- values on the way across --------------------------------------------------------------

test('a category travels as its label and lands on the target own option', () => {
  const from = { type: 'category', label: 'Trade', config: { options: [{ id: 'a1', label: 'Roofing' }] } };
  const to = { type: 'category', label: 'Trade', config: { options: [{ id: 'b9', label: 'Roofing' }] } };
  const { value, options } = translateValue(from, to, 'a1', mintId);
  assert.equal(value, 'b9', "the destination's own id for the same word");
  assert.equal(options.length, 1, 'nothing added; it was already there');
});

test('an option the target has never seen is added to it', () => {
  const from = { type: 'category', label: 'Trade', config: { options: [{ id: 'a1', label: 'Siding' }] } };
  const to = { type: 'category', label: 'Trade', config: { options: [{ id: 'b9', label: 'Roofing' }] } };
  const { value, options } = translateValue(from, to, 'a1', mintId);
  assert.equal(options.length, 2);
  assert.equal(options.find((option) => option.id === value).label, 'Siding');
});

test('a multi-select carries every option, a single one carries the first', () => {
  const from = { type: 'tags', label: 'T', config: { options: [{ id: 'a1', label: 'One' }, { id: 'a2', label: 'Two' }] } };
  const toTags = { type: 'tags', label: 'T', config: { options: [] } };
  assert.equal(translateValue(from, toTags, ['a1', 'a2'], mintId).value.length, 2);
  const toOne = { type: 'category', label: 'T', config: { options: [] } };
  assert.equal(typeof translateValue(from, toOne, ['a1', 'a2'], mintId).value, 'string');
});

test('a category into a text field arrives as words, not as an id', () => {
  const from = { type: 'status', label: 'Stage', config: { options: [{ id: 'a1', label: 'Won' }] } };
  const to = { type: 'text', label: 'Stage', config: {} };
  assert.equal(translateValue(from, to, 'a1', mintId).value, 'Won');
});

test('a blank stays blank rather than becoming the string "undefined"', () => {
  const from = { type: 'text', label: 'X', config: {} };
  const to = { type: 'text', label: 'X', config: {} };
  [undefined, null, ''].forEach((raw) => assert.equal(translateValue(from, to, raw, mintId).value, ''));
});

test('a file travels as its reference, so both records point at the one stored object', () => {
  const file = [{ name: 'plan.pdf', path: 'co/workspace/plan.pdf', url: 'https://…' }];
  const from = { type: 'file', label: 'Blue Print', config: {} };
  const to = { type: 'file', label: 'Blue Print', config: {} };
  assert.deepEqual(translateValue(from, to, file, mintId).value, file);
});

// ---- pressing it -----------------------------------------------------------------------

const pressed = async ({ canManage = true } = {}) => {
  const app1 = APP1();
  const app2 = APP2();
  const doc = { workspaces: [{ id: 'ws2', apps: [app2] }] };
  const saved = [];
  const toasts = [];
  let ids = 0;
  const push = createButtonPush({
    can: () => canManage,
    wbDoc: (companyId) => (companyId === 'co2' ? doc : null),
    wbSave: async (companyId) => saved.push({ companyId }),
    wbUid: () => `u-${++ids}`,
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
  });
  const button = { id: 'f-btn', config: { targetCompany: 'co2', targetApp: 'app2' } };
  const ok = await push.pressButton('co1', app1, button, app1.items[0]);
  return { ok, app1, app2, saved, toasts };
};

test('the worked example: App 2 grows to fit and gains the record', async () => {
  const { ok, app2, saved } = await pressed();
  assert.equal(ok, true);
  // What arrived comes first, in the order it had at home: App 1 (Name, Age) into App 2
  // (Address) reads Name, Age, Address -- the record as the person sending it thinks of it.
  // A starting order only; the field list is draggable afterwards like any other.
  assert.deepEqual(app2.fields.map((field) => field.label), ['Name', 'Age', 'Address'], 'three fields now');
  assert.equal(app2.items.length, 2, 'the record that was there is still there');

  const arrived = app2.items[0];
  const byLabel = (label) => arrived.values[app2.fields.find((field) => field.label === label).id];
  assert.equal(byLabel('Name'), 'John Doe');
  assert.equal(byLabel('Age'), 13);
  assert.equal(byLabel('Address'), undefined, 'App 1 had no address, so it arrives blank');

  const untouched = app2.items[1];
  assert.equal(untouched.values['g-addr'], 'USA', 'and the record already there keeps everything');
  assert.equal(saved.length, 1);
  assert.equal(saved[0].companyId, 'co2');
});

test('nothing automatic is carried across', async () => {
  const { app2 } = await pressed();
  ['Ref', 'Created', 'Twice age', 'Graduate']
    .forEach((label) => assert.ok(!app2.fields.some((field) => field.label === label), `${label} must not travel`));
});

test('the arrival remembers where it came from', async () => {
  const { app2 } = await pressed();
  assert.deepEqual(app2.items[0].pushedFrom, { companyId: 'co1', appId: 'app1', itemId: 'i1' });
});

test('an app that already has one of the fields keeps its own place in the order', () => {
  // Only the NEW ones are prepended. Moving a field the target already had would rearrange an
  // app somebody else laid out, which is not this button's business.
  const target = APP2();
  target.fields.push({ id: 'g-age', type: 'number', label: 'Age', config: {} });
  const plan = planPush(APP1(), target, { id: 'f-btn', config: {} });
  assert.deepEqual(plan.create.map((field) => field.label), ['Name'], 'only Name is new');
  assert.deepEqual(target.fields.map((field) => field.label), ['Address', 'Age'], 'and planning moves nothing');
});

test('a role that cannot manage the target app changes nothing there', async () => {
  const { ok, app2, saved, toasts } = await pressed({ canManage: false });
  assert.equal(ok, false);
  assert.deepEqual(app2.fields.map((field) => field.label), ['Address'], 'not even the field merge ran');
  assert.equal(app2.items.length, 1);
  assert.equal(saved.length, 0);
  assert.match(toasts[0], /cannot add records/);
});

test('a destination that is gone, or was never set, says so and writes nothing', async () => {
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => ({ workspaces: [] }),
    wbSave: async () => { throw new Error('must not save'); },
    wbUid: () => 'u',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
  });
  assert.match(push.resolveTarget({}).error, /no destination set/);
  assert.match(push.resolveTarget({ targetCompany: 'co2', targetApp: 'gone' }).error, /deleted or moved/);
  assert.equal(await push.pressButton('co1', APP1(), { id: 'f-btn', config: {} }, APP1().items[0]), false);
});

test('a workspace this account cannot load is not a crash', async () => {
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => null,
    wbSave: async () => { throw new Error('must not save'); },
    wbUid: () => 'u',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
  });
  assert.match(push.resolveTarget({ targetCompany: 'other', targetApp: 'a' }).error, /do not have access/);
});

// ---- findable in the palette ----------------------------------------------------------

test('Button is in the palette, and not buried at the bottom of it', () => {
  // It shipped as item 28 of 28, below Checkbox, and the first thing asked was "where is it?".
  // It sits with the fields that connect one app to another, which is what it does.
  const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
  const order = JSON.parse(main.match(/const WB_FIELD_ORDER = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  const at = order.indexOf('button');
  assert.notEqual(at, -1, 'a type absent from WB_FIELD_ORDER cannot be added to any app');
  assert.ok(at < order.length - 1, 'not last');
  assert.deepEqual(order.slice(at - 1, at + 1), ['company_contact', 'button']);
  // And it needs an entry in WB_FIELD_TYPES, or the palette throws reading meta.color.
  assert.match(main, /\n  button: \{ label: 'Button', icon: '([\w-]+)'/);
  // An icon the local set actually has: no CDN, so a missing glyph is an empty square.
  const icon = main.match(/\n  button: \{ label: 'Button', icon: '([\w-]+)'/)[1];
  const font = readFileSync(join(root, 'src', 'tabler-icons.css'), 'utf8');
  assert.ok(font.includes(`.${icon}:`), `${icon} is not in the bundled icon font`);
});

// ---- in the list, not only on the record ---------------------------------------------

const listSetup = () => {
  const app1 = APP1();
  const app2 = APP2();
  app1.fields[2].config = { targetCompany: 'co', targetApp: 'app2', when: [{ field: 'f-name', op: 'eq', value: 'John Doe' }] };
  app1.items.push({ id: 'i2', values: { 'f-name': 'Someone Else', 'f-age': 40 } });
  const toasts = [];
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [app1, app2] }] }),
    wbSave: async () => {},
    wbUid: () => `u-${++seq}`,
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    state: {},
    wbFind: () => ({ app: app1 }),
    wbReadFieldInput: () => undefined,
    activeCompanyId: () => 'co',
  });
  return { push, app1, app2, toasts };
};

const rowButton = (itemId) => ({
  dataset: { wbPress: 'f-btn', wbPressCtx: `co|ws|app1|${itemId}` },
  disabled: false,
  title: '',
  closest: () => null,
});

test('a row in the list presses on its OWN record, not on whatever is open', () => {
  // The list shows many records; a button in one of them must act on the one it sits in.
  const { push, app1, app2 } = listSetup();
  const seat = `co|ws|app1|${app1.items[1].id}`;
  push.press('f-btn', seat);
  const arrived = app2.items[0];
  const name = arrived.values[app2.fields.find((field) => field.label === 'Name').id];
  assert.equal(name, 'Someone Else', 'the second row, which is the one that was pressed');
  assert.equal(arrived.pushedFrom.itemId, 'i2');
});

test('each row is judged on its own values', () => {
  const { push } = listSetup();
  const first = rowButton('i1');
  const second = rowButton('i2');
  const root = { querySelectorAll: () => [first, second] };
  push.syncButtons(root);
  assert.equal(first.disabled, false, 'John Doe matches the condition');
  assert.equal(second.disabled, true, 'Someone Else does not');
});

test('a row button with no destination stays disabled and says why', () => {
  const { push, app1 } = listSetup();
  app1.fields[2].config.targetApp = '';
  const button = rowButton('i1');
  push.syncButtons({ querySelectorAll: () => [button] });
  assert.equal(button.disabled, true);
  assert.match(button.title, /no destination/);
});

test('a seat pointing at a record that is gone falls back rather than throwing', () => {
  const { push } = listSetup();
  assert.doesNotThrow(() => push.syncButtons({ querySelectorAll: () => [rowButton('deleted')] }));
});

test('main.js renders the button in the table and stops the row opening', () => {
  const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
  // The cell has to render before the empty-value guard: a button holds no value at all.
  const at = main.indexOf("if (field.type === 'button') {");
  assert.ok(at !== -1 && at < main.indexOf("if (value === undefined || value === null || value === ''"));
  // The seat is one shared expression now: a sheet in a row has to say which record it
  // belongs to for exactly the same reason a button does.
  assert.match(main, /data-wb-press-ctx="\$\{h\(wbSeat\(ctx\)\)\}"/);
  assert.match(main, /const wbSeat = \(ctx\) => \[ctx\.companyId, ctx\.workspace\?\.id \|\| '', ctx\.app\?\.id \|\| '', ctx\.item\.id\]\.join\('\|'\);/);
  // Pressing a button inside a row must not also open the record that row points at.
  assert.match(main, /event\.stopPropagation\(\);\s*\r?\n\s*wbPressButton/);
});

// ---- the second action: change fields on this record ---------------------------------

test('a button can set fields, and an empty value clears one', () => {
  // "Set control to other selected fields: change its value, or clear the value."
  const app = {
    fields: [
      { id: 'b', type: 'button', label: 'Go', config: {} },
      { id: 't', type: 'text', label: 'Owner', config: {} },
      { id: 'n', type: 'number', label: 'Price', config: {} },
    ],
  };
  const button = { id: 'b', config: { action: 'set', set: [{ field: 't', value: 'Abe' }, { field: 'n', value: '' }] } };
  assert.deepEqual(planSet(app, button).map(({ field, value }) => [field.label, value]), [['Owner', 'Abe'], ['Price', '']]);
});

test('clear-everything is a switch, not thirty rows', () => {
  const app = {
    fields: [
      { id: 'b', type: 'button', label: 'Go', config: {} },
      { id: 't', type: 'text', label: 'Owner', config: {} },
      { id: 'a', type: 'autonumber', label: 'Ref', config: {} },
      { id: 'c', type: 'calculation', label: 'Total', config: {} },
    ],
  };
  const cleared = planSet(app, { id: 'b', config: { action: 'set', clearAll: true } });
  assert.deepEqual(cleared.map(({ field }) => field.label), ['Owner'], 'automatic fields are left alone');
  assert.deepEqual(cleared.map(({ value }) => value), ['']);
});

test('two rows writing one field: the first wins, visibly', () => {
  const app = { fields: [{ id: 'b', type: 'button', config: {} }, { id: 't', type: 'text', label: 'Owner', config: {} }] };
  const plan = planSet(app, { id: 'b', config: { set: [{ field: 't', value: 'first' }, { field: 't', value: 'second' }] } });
  assert.deepEqual(plan.map((row) => row.value), ['first']);
});

test('a set value is turned into what the field really stores', () => {
  const stage = { type: 'status', label: 'Stage', config: { options: [{ id: 'o1', label: 'Won' }] } };
  assert.equal(setValueFor(stage, 'won'), 'o1', 'set by what it says, matched case-insensitively');
  assert.equal(setValueFor(stage, ''), '', 'and cleared by an empty value');
  // A word the field has never heard of writes nothing rather than leaving an invented option
  // behind for ever.
  assert.equal(setValueFor(stage, 'Nonsense'), null);
  assert.deepEqual(setValueFor({ type: 'tags', config: { options: [{ id: 'o1', label: 'A' }] } }, 'a'), ['o1']);
  assert.equal(setValueFor({ type: 'number', config: {} }, '12'), 12);
  assert.equal(setValueFor({ type: 'number', config: {} }, 'twelve'), null, 'letters are not a number');
  assert.equal(setValueFor({ type: 'checkbox', config: {} }, 'yes'), true);
  assert.equal(setValueFor({ type: 'checkbox', config: {} }, ''), false);
  assert.equal(setValueFor({ type: 'text', config: {} }, ' hi '), 'hi');
});

test('pressing a set button in the list writes the record and saves it', async () => {
  const app = {
    id: 'app1',
    name: 'App 1',
    fields: [
      { id: 'b', type: 'button', label: 'Close it', config: { action: 'set', set: [{ field: 't', value: 'Done' }] } },
      { id: 't', type: 'text', label: 'Owner', config: {} },
    ],
    items: [{ id: 'i1', values: { t: 'Abe' } }],
  };
  const saved = [];
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [app] }] }),
    wbSave: (companyId) => saved.push(companyId),
    wbUid: () => 'u',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    state: {},
    wbFind: () => ({ app }),
    wbReadFieldInput: () => undefined,
    activeCompanyId: () => 'co',
  });
  await push.press('b', 'co|ws|app1|i1');
  assert.equal(app.items[0].values.t, 'Done', 'overwritten: a button asked to set a field means it');
  assert.deepEqual(saved, ['co']);
  assert.ok(app.items[0].updatedAt, 'and the record is stamped as changed');
});

// ---- the picker and the palette --------------------------------------------------------

test('every icon offered for a button is one the bundled font has', async () => {
  // No CDN here, so a name the font does not carry renders as a blank square.
  const { WB_ACTION_ICONS } = await import('../src/workspace/icon-sets.js');
  const font = readFileSync(join(root, 'src', 'tabler-icons.css'), 'utf8');
  WB_ACTION_ICONS.forEach((icon) => assert.ok(font.includes(`.${icon}:`), `${icon} is missing from the font`));
  // The ones asked for by name.
  ['ti-arrow-right', 'ti-arrow-left', 'ti-trash', 'ti-device-floppy']
    .forEach((icon) => assert.ok(WB_ACTION_ICONS.includes(icon), `${icon} should be offered`));
});

test('the field palette is searchable, and no longer explains dragging instead', () => {
  const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
  assert.match(main, /data-wb-pal-find/);
  assert.ok(!main.includes('drag one into your app'), 'the sentence it replaced is gone');
  // Filtering hides items rather than rebuilding the palette, so the caret stays in the box.
  assert.match(main, /item\.hidden = !!q && !item\.textContent\.toLowerCase\(\)\.includes\(q\)/);
});

// ---- "I didn't add any condition, why is it still disabled?" --------------------------

test('a Change-fields button with no condition is live the moment it has a field to change', () => {
  // The bug: "ready" meant "has a destination app", which a Change-fields button never has.
  // Every one of them was disabled for ever, including one with no condition at all.
  const setButton = (config) => ({ id: 'b', type: 'button', label: 'Go', config: { action: 'set', ...config } });
  assert.equal(buttonReady(setButton({ set: [{ field: 't', value: 'x' }] })), true, 'one row is enough');
  assert.equal(buttonReady(setButton({ clearAll: true })), true, 'so is clearing everything');
  assert.equal(buttonReady(setButton({ set: [] })), false, 'nothing to change yet');
  assert.equal(buttonReady(setButton({ set: [{ field: '', value: 'x' }] })), false, 'a half-filled row is not a field');
});

test('a Send button still needs somewhere to send to', () => {
  assert.equal(buttonReady({ config: { targetApp: 'app2' } }), true);
  assert.equal(buttonReady({ config: {} }), false);
  assert.equal(buttonReady({ config: { action: 'push', set: [{ field: 't' }] } }), false, 'set rows do not make a Send button ready');
});

test('a button that cannot act says which thing it is missing', () => {
  assert.match(buttonNotReady({ config: { action: 'set' } }), /no fields to change/);
  assert.match(buttonNotReady({ config: {} }), /no destination/);
});

test('in the list, a Change-fields button is enabled on the rows that qualify', () => {
  const app = {
    id: 'app1',
    name: 'App 1',
    fields: [
      { id: 'b', type: 'button', label: 'Close', config: { action: 'set', set: [{ field: 't', value: 'Done' }], when: [{ field: 't', op: 'eq', value: 'Abe' }] } },
      { id: 't', type: 'text', label: 'Owner', config: {} },
    ],
    items: [{ id: 'i1', values: { t: 'Abe' } }, { id: 'i2', values: { t: 'Someone' } }],
  };
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [app] }] }),
    wbSave: () => {},
    wbUid: () => 'u',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    state: {},
    wbFind: () => ({ app }),
    wbReadFieldInput: () => undefined,
    activeCompanyId: () => 'co',
  });
  const button = (itemId) => ({ dataset: { wbPress: 'b', wbPressCtx: `co|ws|app1|${itemId}` }, disabled: true, title: '', closest: () => null });
  const first = button('i1');
  const second = button('i2');
  push.syncButtons({ querySelectorAll: () => [first, second] });
  assert.equal(first.disabled, false, 'no longer stuck disabled just for having no target app');
  assert.equal(second.disabled, true, 'and the condition still decides');
});

// ---- the third action: send it and take it off this app ------------------------------

const movedSetup = () => {
  const app1 = APP1();
  const app2 = APP2();
  app1.items.push({ id: 'i2', values: { 'f-name': 'Stays Put' } });
  const workspace = { id: 'ws', apps: [app1], activity: [] };
  const saved = [];
  const logged = [];
  const push = createButtonPush({
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws2', apps: [app2] }] }),
    wbSave: (companyId) => saved.push(companyId),
    wbUid: () => `u-${++seq}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    state: {},
    wbFind: () => ({ app: app1, workspace }),
    wbReadFieldInput: () => undefined,
    activeCompanyId: () => 'co1',
    wbLogActivity: (ws, entry) => logged.push(entry),
    wbItemTitle: () => 'John Doe',
  });
  const button = { id: 'f-btn', config: { action: 'move', targetCompany: 'co2', targetApp: 'app2' } };
  return { push, app1, app2, button, workspace, saved, logged };
};

test('the record lands in the other app and leaves this one', async () => {
  const { push, app1, app2, button, workspace, saved, logged } = movedSetup();
  await push.pressButton('co1', app1, button, app1.items[0], workspace);
  assert.equal(app2.items.length, 2, 'it arrived');
  assert.deepEqual(app1.items.map((row) => row.id), ['i2'], 'and it is gone from here');
  assert.deepEqual(saved, ['co2', 'co1'], 'target saved first, so a failure there cannot lose it from both');
  assert.match(logged[0].text, /Sent .* and removed it from App 1/, 'the workspace feed says where it went');
});

test('the fields of the app it left are untouched', async () => {
  // "The field set on it still stays; only the item that was sent is gone."
  const { push, app1, button, workspace } = movedSetup();
  const before = app1.fields.map((field) => field.label);
  await push.pressButton('co1', app1, button, app1.items[0], workspace);
  assert.deepEqual(app1.fields.map((field) => field.label), before);
});

test('a plain Send leaves the record where it is', async () => {
  const { push, app1, button, workspace } = movedSetup();
  await push.pressButton('co1', app1, { ...button, config: { ...button.config, action: 'push' } }, app1.items[0], workspace);
  assert.equal(app1.items.length, 2, 'copied, not moved');
});

test('a record that never reached the target is not removed from the source', async () => {
  // Removing it on a failed write would lose it from both apps at once.
  const { app1, button, workspace } = movedSetup();
  const push = createButtonPush({
    can: () => false,
    wbDoc: () => ({ workspaces: [] }),
    wbSave: () => {},
    wbUid: () => 'u',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    state: {},
    wbFind: () => ({ app: app1, workspace }),
    wbReadFieldInput: () => undefined,
    activeCompanyId: () => 'co1',
    wbLogActivity: () => {},
    wbItemTitle: () => 'x',
  });
  await push.pressButton('co1', app1, button, app1.items[0], workspace);
  assert.equal(app1.items.length, 2, 'still here');
});
