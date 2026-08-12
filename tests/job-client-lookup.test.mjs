import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "on creating Job, I want the clients so when I entered a name, if the name exists in the
// Contacts it will fetch its data, its name and contact number, but if the record is not
// existing, I added it manually."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const editor = readFileSync(join(root, 'src', 'jobs', 'job-editor.js'), 'utf8');
const fn = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}', at));
};

test('Client is a searchable list of contacts that still takes a new name', () => {
  // allowCustom stays true: a job is often opened for somebody not in the CRM yet, so the
  // list is a shortcut rather than a constraint.
  assert.match(editor, /const clientField = \(value, companyId\) => renderSearchCombobox\(/);
  assert.match(editor, /jobClientOptions\(companyId\),/);
  assert.match(editor, /allowCustom: true/);
  assert.match(editor, /\$\{clientField\(edit\.client_name, companyId\)\}/);
  assert.match(fn('jobClientOptions'), /companyContacts\(companyId\)\.map\(\(contact\) => contact\.name\)/);
});

test('the match is exact, so a similar name cannot pull the wrong number', () => {
  const body = fn('contactByName');
  assert.match(body, /String\(contact\.name \|\| ''\)\.trim\(\)\.toLowerCase\(\) === wanted/);
  assert.match(body, /if \(!wanted\) return null;/);
});

test('picking a known contact links the record, not just the text', () => {
  // contact_id is what keeps the job attached to the CRM record if the contact is renamed.
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(idField\) idField\.value = contact\.id \|\| '';/);
  assert.match(editor, /<input type="hidden" name="contact_id"[^>]*data-job-contact-id/);
});

test('it fills an empty Contact box and never overwrites a full one', () => {
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(contactField && !contactField\.value\.trim\(\)\)/);
  assert.match(body, /\[contact\.name, phone\]\.filter\(Boolean\)\.join\(' · '\)/);
});

test('a name that matches nothing is left alone, and drops the link', () => {
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(!contact\) \{/);
  assert.match(body, /if \(idField\) idField\.value = '';/);
  // Nothing in the no-match branch touches what was typed.
  const noMatch = body.slice(body.indexOf('if (!contact) {'), body.indexOf('if (idField) idField.value = contact.id'));
  assert.ok(!/contactField\.value =/.test(noMatch), 'a typed name must survive');
});

test('it runs off the combobox change the picker already dispatches', () => {
  assert.match(main, /if \(event\.target\.name === 'client_name'\) fillJobClientFromContact\(event\.target\);/);
});
