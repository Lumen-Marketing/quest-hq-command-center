import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "can you make the assign to fields a searchable drop down so i can search for members"
//
// It was a <select>, which is fine for five people and unusable for fifty -- and which of those
// a company is changes without anybody coming back to revisit the field.
//
// Not a new component: the company_contact field three cases further down already solved this,
// and its comment says why ("a company directory runs to hundreds of people and the only way to
// find one in a dropdown is to scroll"). Same three parts, same event wiring, same reasoning.

const ui = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

// Just this case: slicing to the next one over would swallow every field type in between,
// including several that legitimately still use a <select>.
const userCase = (() => {
  const rest = ui.slice(ui.indexOf("case 'user': {"));
  // Cut at the closing brace, not at the next case: the comment introducing the one after it
  // literally reads "A datalist, not a <select>", which a looser slice picks up as source.
  return rest.slice(0, rest.indexOf('\n      }'));
})();

test('the assignee field is a datalist, not a select', () => {
  assert.ok(!userCase.includes('<select'), 'no dropdown to scroll');
  assert.ok(userCase.includes('<datalist id="${h(listId)}">'));
  assert.ok(userCase.includes('data-wb-user-picker'));
});

test('the NAME is visible and the ID is what gets stored', () => {
  // data-f is what the save reads, and it is on the hidden input -- so renaming somebody never
  // breaks an assignment, and a half-typed name cannot be stored as if it were a person.
  assert.ok(userCase.includes('data-wb-user-name value="${h(current ? current.name : \'\')}"'));
  assert.ok(userCase.includes('<input type="hidden" data-f="${h(f.id)}" data-wb-user-id'));
});

test('the email tells two people of the same name apart', () => {
  assert.ok(userCase.includes('label="${h(m.email)}"'));
});

test('a company with no members still says so', () => {
  assert.ok(userCase.includes('No company members to assign.'));
  assert.ok(userCase.includes('if (!members.length) {'), 'and returns before drawing an empty picker');
});

/* ---- reading the typed name back --------------------------------------------------------- */

const sync = main.slice(main.indexOf('function syncUserPicker(input) {'), main.indexOf('function syncCompanyContactPicker(input) {'));

test('what was typed resolves to a member id', () => {
  assert.ok(sync.includes("closest?.('[data-wb-user-picker]')"));
  assert.ok(sync.includes('wbMembers(activeCompanyId())'));
  assert.ok(sync.includes('idField.value = match ? match.id : \'\';'));
});

test('an email resolves too, because the list offers one', () => {
  // Refusing an address the control had just shown beside the name would read as the picker
  // failing to find somebody it was offering.
  assert.ok(sync.includes("String(m.email || '').trim().toLowerCase() === typed"));
});

test('an empty box is unassigned rather than a stale id', () => {
  assert.ok(sync.includes('const match = typed'), 'nothing is matched against an empty string');
});

test('both events are wired, for both browsers', () => {
  // Typing fires input; picking from a datalist fires input in Chromium and change in Firefox.
  // The contact picker beside it learned this the hard way and the comment is already there.
  const wired = main.split("if (event.target.matches('[data-wb-user-name]')) syncUserPicker(event.target);").length - 1;
  assert.equal(wired, 2, 'the input path and the change path');
});
