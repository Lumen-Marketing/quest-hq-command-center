import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createComboboxMenu, renderSearchCombobox } from '../src/ui/combobox-menu.js';

// "I want the type selection dropdown to be customize like I can Add new type and delete a
// Type, same with the Company... if the item I typed does not exist and still I use it it
// will be added to the dropdown list."
//
// Type shipped as a <select> over its own table, then grew a `kind` so Company could share
// it. Both are now ordinary customer-defined fields, and a category field carries its own
// option list in its config -- so the behaviour survived the move but the store did not.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');

const fn = (name, source = main) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = source.lastIndexOf('\n', at) + 1;
  const close = source === main ? '\n}' : '\n  }';
  return source.slice(start, source.indexOf(close, at) + close.length);
};

const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

test('the field carries its list, and only a stored list is prunable', () => {
  const stored = renderSearchCombobox(h, 'Type', 'contact_type', 'Client', ['Client', 'GC'], { removeKind: 'type' });
  assert.match(stored, /data-job-type-remove="type"/);
  // A derived list must not offer removal: there is no row to delete, only records to edit.
  const derived = renderSearchCombobox(h, 'Owner', 'owner', '', ['Ana'], {});
  assert.ok(!/data-job-type-remove=/.test(derived));
  assert.match(stored, /data-job-type-options="\[&quot;Client&quot;,&quot;GC&quot;\]"/);
});

test('a value that is not on the list offers to join it', () => {
  // This is the "add automatically" half: type something new, use it, and it is offered to
  // the next person instead of being re-invented with a different spelling.
  const menu = createComboboxMenu({ h });
  const input = fakeInput(['Client', 'GC', 'Sub', 'Vendor'], 'Architect', 'type');
  menu.renderJobTypeSuggestions(input);
  // The quotes around the value are literal in the label; only the value itself is escaped.
  assert.match(input.menuHtml, /data-job-type-option="Architect"[^>]*><i class="ti ti-plus"><\/i><span>Use "Architect"<\/span>/);
});

test('an exact match is never offered as a new value', () => {
  const menu = createComboboxMenu({ h });
  const input = fakeInput(['Client', 'GC'], 'Client', 'type');
  menu.renderJobTypeSuggestions(input);
  assert.ok(!/Use "/.test(input.menuHtml), 'that would add a second "Client" to the list');
});

test('typing narrows the list, and still offers the fragment as a new value', () => {
  // "su" matches Sub AND is a legal new label -- somebody naming a type "SU" is not wrong.
  const menu = createComboboxMenu({ h });
  const input = fakeInput(['Client', 'GC', 'Sub', 'Vendor'], 'su', 'type');
  menu.renderJobTypeSuggestions(input);
  const options = [...input.menuHtml.matchAll(/data-job-type-option="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(options, ['su', 'Sub']);
});

test('the remove control is a sibling of the option, never a child', () => {
  const menu = createComboboxMenu({ h });
  const input = fakeInput(['Client', 'GC'], '', 'type');
  menu.renderJobTypeSuggestions(input, true);
  // A <button> inside a <button> is invalid and browsers disagree about which one a click
  // belongs to -- picking the value and deleting it would fight.
  assert.match(input.menuHtml, /<span class="job-type-suggestion-row"><button[^>]*data-job-type-option="Client"[^>]*>.*?<\/button><button[^>]*data-job-type-remove-option="Client"/);
  assert.match(input.menuHtml, /data-job-type-remove-kind="type"/);
});

test('a list with no removeKind renders no remove controls at all', () => {
  const menu = createComboboxMenu({ h });
  const input = fakeInput(['Ana', 'Ben'], '', '');
  menu.renderJobTypeSuggestions(input, true);
  assert.ok(!/data-job-type-remove-option/.test(input.menuHtml));
  assert.equal([...input.menuHtml.matchAll(/data-job-type-option=/g)].length, 2);
});

test('using a new value adds it to its list before the contact is saved', () => {
  const body = fn('saveCompanyContactForm', page);
  assert.match(body, /await ensureCompanyContactFieldOption\(companyId, field, value\);/);
  assert.match(body, /fields\.filter\(\(item\) => item\.type === 'category' \|\| item\.type === 'status'\)/);
  assert.ok(
    body.indexOf('ensureCompanyContactFieldOption') < body.indexOf('persistCompanyContact'),
    'a contact must not end up referring to a label nobody can choose again',
  );
});

test('matching a label is case-insensitive, so the list does not split in two', () => {
  const body = fn('ensureCompanyContactFieldOption', page);
  assert.match(body, /String\(option\.label\)\.toLowerCase\(\) === clean\.toLowerCase\(\)/);
  assert.match(body, /if \(!clean \|\|/, 'an empty field is not a list entry');
});

test('removing a label leaves the contacts that already carry it alone', () => {
  // Clearing it from every contact would be a silent bulk edit nobody asked for. The value
  // stays on the record and simply stops being offered.
  const body = fn('removeCompanyContactFieldOption', page);
  assert.ok(!/companyContacts\b/.test(body), 'removal must not touch contact records');
  assert.match(body, /requirePermission\('company_contacts\.manage'/);
  assert.match(body, /options: \(field\.config\.options \|\| \[\]\)\.filter/);
});

test('the X prunes the field it belongs to, not a company-wide list', () => {
  // removeKind carries the field id now: two category fields keep their own vocabularies,
  // so "Client" removed from Type must not disappear from Trade as well.
  assert.match(page, /removeKind: field\.id/);
  assert.match(main, /removeCompanyContactFieldOption\(removeOption\.dataset\.jobTypeRemoveKind, label\)/);
});

test('pruning the list does not re-render the form under it', () => {
  // The menu is open over a half-filled contact. A render() here throws away every value
  // typed so far, which is a worse bug than the stale list it would fix.
  const at = main.indexOf("const removeOption = event.target.closest('[data-job-type-remove-option]')");
  // Comments stripped first: the one explaining why there is no render() here contains the
  // word, and an assertion that matches its own justification proves nothing.
  const block = main.slice(at, main.indexOf('const jobTypeOption', at)).replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/\brender\(\)/.test(block), 'patch the DOM instead');
  assert.match(block, /input\.dataset\.jobTypeOptions = JSON\.stringify\(kept\)/);
  assert.match(block, /removeOption\.closest\('\.job-type-suggestion-row'\)\?\.remove\(\)/);
});

test('the category field renders as a combobox, never a select', () => {
  assert.match(page, /case 'category': \{[\s\S]*?renderSearchCombobox\(h, field\.label, name, value, options/);
  assert.ok(!/<select name="contact_type"/.test(page), 'a select can neither add nor prune');
});

test('the two lists are one table, told apart by kind', () => {
  // Read across every migration: the table was introduced, given its `kind`, and later
  // renamed with the module, so no single file tells the whole story any more.
  const dir = join(root, 'supabase', 'migrations');
  const sql = readdirSync(dir).filter((n) => n.endsWith('.sql')).map((n) => readFileSync(join(dir, n), 'utf8')).join(String.fromCharCode(10));
  assert.match(sql, /rename to company_contact_options/);
  assert.match(sql, /check \(kind in \('type', 'organization'\)\)/);
  // Unique per kind and case-insensitive, or "Client" and "client" both live in the list.
  // The index was created before the table followed the module's rename, and migration files
  // are history -- so this targets the guarantee, not the name it was created under.
  assert.match(sql, /create unique index if not exists company_\w+_options_unique[\s\S]{0,120}\(company_id, kind, lower\(label\)\)/);
  // Organizations are backfilled from contacts that already have one, so the list starts out
  // agreeing with the data rather than looking empty beside populated records.
  // Written before the table followed the module's rename, so the backfill names the table
  // as it stood that day.
  assert.match(sql, /from public\.company_contacts c/);
});

test('the field row is stored and read back with its type', () => {
  // The shared company_contact_options table is no longer read: a category field carries its
  // choices in its own config, which is what lets two of them hold different vocabularies.
  // The table and its rows stay for now, so the revert is a code change.
  assert.match(fn('normalizeCompanyContactField'), /COMPANY_CONTACT_FIELD_TYPES\.includes\(input\.type\) \? input\.type : 'text',/);
  assert.match(main, /const COMPANY_CONTACT_FIELD_COLS = \['id', 'company_id', 'label', 'type', 'config', 'required', 'hidden', 'position'\];/);
  assert.match(fn('companyContactFieldsFor'), /field\.company_id === target/);
  assert.ok(!/state\.companyContactOptions/.test(main), 'the dead store must not linger in the entry bundle');
});

test('the remove click is caught before the option it sits beside', () => {
  const at = main.indexOf("const removeOption = event.target.closest('[data-job-type-remove-option]')");
  const optionAt = main.indexOf("const jobTypeOption = event.target.closest('[data-job-type-option]')");
  assert.notEqual(at, -1);
  assert.ok(at < optionAt, 'otherwise clicking the X picks the value instead of deleting it');
  // And the menu must not close on pointerdown, or the input blurs and the click lands on
  // nothing. That guard moved into the module along with the menu it builds.
  const combobox = readFileSync(join(root, 'src', 'ui', 'combobox-menu.js'), 'utf8');
  assert.match(combobox, /\[data-job-type-option\], \[data-job-type-remove-option\]/);
});

// A stand-in for the combobox input: the module only reads dataset/value and writes the
// menu's innerHTML, so this exercises the real matching without a DOM.
function fakeInput(options, value, removeKind) {
  const menuNode = { innerHTML: '', hidden: true, dataset: { jobTypeBound: 'true' }, addEventListener() {} };
  const host = { querySelector: () => menuNode, appendChild() {} };
  const input = {
    value,
    dataset: { jobTypeOptions: JSON.stringify(options), jobTypeAllowCustom: 'true', ...(removeKind ? { jobTypeRemove: removeKind } : {}) },
    closest: () => host,
  };
  Object.defineProperty(input, 'menuHtml', { get: () => menuNode.innerHTML });
  return input;
}
