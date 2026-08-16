import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createComboboxMenu } from '../src/ui/combobox-menu.js';
import { createFieldInput } from '../src/workspace/field-config-ui.js';

// "In the field Category can you make it just blank? So when I click it the items in the
// dropdown will just display, and when I type it matches on the list, but when the data I type
// does not match on the list and I just use it, it will automatically add to the category list."
//
// A <select> can do none of that. The field still STORES an option id — everything that reads
// it is unchanged — but what you see and type is the label.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const fieldUi = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');

const h = (v) => String(v ?? '');

// A DOM-free stand-in for the two inputs the combobox drives.
const makeCombo = (fieldId) => {
  const hidden = { value: '', getAttribute: () => fieldId, type: 'hidden' };
  const input = {
    value: '',
    dataset: { jobTypeOptions: '[]' },
    closest: () => ({ querySelector: () => hidden }),
  };
  return { hidden, input };
};

const stageField = () => ({
  id: 'f-stage',
  type: 'status',
  label: 'Stage',
  config: { options: [{ id: 'o1', label: 'Lead', color: '#378ADD' }, { id: 'o2', label: 'Nurturing', color: '#16a34a' }] },
});

const build = (field, { canManage = true } = {}) => {
  const app = { id: 'a', name: 'Lead Gen', fields: [field], collections: [] };
  const saves = [];
  const toasts = [];
  let n = 0;
  const menu = createComboboxMenu({
    h,
    wbDoc: () => ({ workspaces: [{ id: 'w', name: 'W', apps: [app] }] }),
    wbSave: (id) => saves.push(id),
    wbUid: () => `wb-new-${(n += 1)}`,
    can: () => canManage,
    showToast: (message) => toasts.push(message),
    activeCompanyId: () => 'co',
    WB_PALETTE: ['#e0552d', '#2563eb'],
  });
  return { menu, app, field, saves, toasts };
};

test('a label that is already an option resolves to its id', () => {
  const field = stageField();
  const { menu } = build(field);
  const { hidden, input } = makeCombo('f-stage');
  input.value = 'Nurturing';
  menu.wbCommitOptionChoice(input);
  assert.equal(hidden.value, 'o2', 'the field stores the id, as it always did');
  assert.equal(field.config.options.length, 2, 'nothing was added');
});

test('a value nobody has used joins the list, and the app is saved', () => {
  const field = stageField();
  const { menu, saves, toasts } = build(field);
  const { hidden, input } = makeCombo('f-stage');
  input.value = 'Site visit booked';
  menu.wbCommitOptionChoice(input);

  const added = field.config.options.find((o) => o.label === 'Site visit booked');
  assert.ok(added, 'the typed value became an option');
  assert.equal(hidden.value, added.id, 'and the record points at it');
  assert.deepEqual(saves, ['co'], 'the app is written once');
  assert.match(toasts[0], /Added "Site visit booked" to Stage/);
  // The menu reads its list off the input, so the new value is offered without a reload.
  assert.ok(JSON.parse(input.dataset.jobTypeOptions).includes('Site visit booked'));
});

test('a different spelling of the same word is the same option', () => {
  // Otherwise "roofing" and "Roofing" become two chips that mean one thing.
  const field = stageField();
  const { menu } = build(field);
  const { hidden, input } = makeCombo('f-stage');
  input.value = '  nurturing ';
  menu.wbCommitOptionChoice(input);
  assert.equal(hidden.value, 'o2');
  assert.equal(input.value, 'Nurturing', 'snapped to the stored spelling');
  assert.equal(field.config.options.length, 2);
});

test('clearing the box clears the stored value', () => {
  const field = stageField();
  const { menu } = build(field);
  const { hidden, input } = makeCombo('f-stage');
  hidden.value = 'o1';
  input.value = '';
  menu.wbCommitOptionChoice(input);
  assert.equal(hidden.value, '');
  assert.equal(field.config.options.length, 2, 'clearing a record does not edit the app');
});

test('somebody who cannot edit the app cannot add an option by typing', () => {
  // Their typing stays on screen; it just does not become a choice for the whole company.
  const field = stageField();
  const { menu, saves } = build(field, { canManage: false });
  const { hidden, input } = makeCombo('f-stage');
  input.value = 'Made up stage';
  menu.wbCommitOptionChoice(input);
  assert.equal(field.config.options.length, 2);
  assert.deepEqual(saves, []);
  assert.equal(hidden.value, '', 'and no id is invented for it');
});

test('a category on a sub-item list resolves the same way', () => {
  // wbFieldOwner searches collections too, or a daily report's category could never resolve.
  const field = { id: 'c-cat', type: 'category', label: 'Weather', config: { options: [{ id: 'w1', label: 'Rain', color: '#2563eb' }] } };
  const app = { id: 'a', name: 'Jobs', fields: [], collections: [{ id: 'c1', name: 'Daily reports', fields: [field] }] };
  const menu = createComboboxMenu({
    h,
    wbDoc: () => ({ workspaces: [{ id: 'w', name: 'W', apps: [app] }] }),
    wbSave: () => {},
    wbUid: () => 'wb-new-1',
    can: () => true,
    showToast: () => {},
    activeCompanyId: () => 'co',
    WB_PALETTE: ['#e0552d'],
  });
  const { hidden, input } = makeCombo('c-cat');
  input.value = 'Rain';
  menu.wbCommitOptionChoice(input);
  assert.equal(hidden.value, 'w1');
});

test('the field renders as a combobox, and the record still stores an id', () => {
  const markup = fieldUi.slice(fieldUi.indexOf("case 'category': case 'status': {"), fieldUi.indexOf("case 'user': {"));
  assert.match(markup, /data-wb-option-combo/);
  assert.match(markup, /<input type="hidden" data-f="\$\{h\(f\.id\)\}"/, 'the id is what gets read and saved');
  assert.match(markup, /data-job-type-input/, 'so the existing type-ahead menu drives it');
  assert.match(markup, /data-job-type-allow-custom="true"/);
  assert.ok(!/— Select —/.test(markup), 'blank, not a placeholder option');
});

test('both ways of choosing commit the value', () => {
  // Picking from the menu, and typing then clicking away.
  assert.match(main, /if \(input\.hasAttribute\('data-wb-option-input'\)\) wbCommitOptionChoice\(input\);/);
  assert.match(main, /if \(event\.target\.matches\?\.\('\[data-wb-option-input\]'\)\) wbCommitOptionChoice\(event\.target\);/);
});

// ---- the other display style: choice chips --------------------------------------------------
//
// "Can you make a 2 option? The dropdown and the choice chips" -- then "make the status field
// to have a choice chips too aside from drop down".

const OPTIONS = [{ id: 'o1', label: 'Lead', color: '#378ADD' }, { id: 'o2', label: 'Nurturing', color: '#16a34a' }];

const renderInput = (field, value = '') => createFieldInput({
  h,
  WB_FIELD_TYPES: { category: { label: 'Category / Dropdown' }, status: { label: 'Status' } },
  companyContactOptions: () => [],
  wbMembers: () => [],
  wbRelTargetApp: () => null,
  wbDoc: () => ({ workspaces: [] }),
  wbRelLabel: () => '',
  wbProgressColor: () => '#000',
  wbProgressDisplayHtml: () => '',
  wbChecklistValue: () => ({ steps: [] }),
  wbChecklistBodyHtml: () => '',
  wbRatingStars: () => '',
  wbAutoNumberText: () => '',
  companyContactFieldsFor: () => [],
})('co', 'ws', field, value);

for (const type of ['category', 'status']) {
  test(`a ${type} set to chips draws one per option, and still stores the id`, () => {
    const html = renderInput({ id: 'f1', type, label: 'Stage', required: false, config: { display: 'chips', options: OPTIONS } }, 'o2');
    assert.match(html, /data-wb-chip-pick/);
    assert.ok(!/data-wb-option-combo/.test(html), 'the dropdown is not also drawn');
    // The id lives in the same hidden input the dropdown writes, so every reader is unchanged.
    assert.match(html, /<input type="hidden" data-f="f1" value="o2"/);
    assert.match(html, /data-wb-chip="o1"[^>]*aria-pressed="false"/);
    assert.match(html, /data-wb-chip="o2"[^>]*aria-pressed="true"/);
    assert.match(html, /--chip:#16a34a/, 'each chip carries its own option colour');
    // The chips' answer to typing an unknown value into the dropdown.
    assert.match(html, /data-wb-chip-other/);
  });

  test(`a ${type} left on the dropdown is unchanged`, () => {
    const html = renderInput({ id: 'f1', type, label: 'Stage', required: false, config: { options: OPTIONS } }, 'o2');
    assert.match(html, /data-wb-option-combo/);
    assert.ok(!/data-wb-chip-pick/.test(html), 'chips are opt-in');
  });
}

test('chips with no options fall back to the dropdown, which at least accepts a typed value', () => {
  const html = renderInput({ id: 'f1', type: 'category', label: 'Type', required: false, config: { display: 'chips', options: [] } });
  assert.match(html, /data-wb-option-combo/);
  assert.ok(!/data-wb-chip-pick/.test(html), 'an empty chip row would be a dead end');
});

test('a field on a record is labelled by its name alone, not by its type', () => {
  // "Contact Company Contact", "Type Category / Dropdown" -- the type is builder vocabulary,
  // and printed beside the label it reads as part of it, so the label itself looks wrong.
  const html = renderInput({ id: 'f1', type: 'category', label: 'Type', required: true, config: { options: OPTIONS } });
  assert.match(html, /<label>Type<span class="wb-req">\*<\/span><\/label>/);
  assert.ok(!/Category \/ Dropdown/.test(html), 'the type name is gone from the record form');
});
