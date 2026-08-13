import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "adding a new contact, so for easy accessing the address it allows user to click the
// location pin icon to open a map to search place, drop a pin or use current location."
//
// The picker takes over state.modal, which is the same slot the form is in -- so opening the
// map unmounts the form. Save then wrote the address into a form that was no longer on the
// page, and everything else typed into it was gone. That was already true of the Job,
// Account and Proposal forms, which all carry this same pin; fixing the shared mechanism
// rather than adding a second one is what makes it work for Company Contacts too.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');

const fn = (name, source = main) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = source.lastIndexOf('\n', at) + 1;
  return source.slice(start, source.indexOf('\n}', at) + 2);
};

test('opening the map remembers the modal it borrowed and what was typed', () => {
  const body = fn('openLocationPicker');
  assert.match(body, /returnModal: kind === 'input' \? \(state\.modal \|\| ''\) : '',/);
  assert.match(body, /formValues: kind === 'input' && form \? Object\.fromEntries\(new FormData\(form\)\.entries\(\)\) : null,/);
  // Only the input kind: the contact/deal/job kinds write straight to their record and have
  // no form to hand back.
  assert.match(body, /const form = node\.closest\('form'\);/);
});

test('saving hands the modal back before writing the address into it', () => {
  const body = fn('saveLocationPicker');
  const branch = body.slice(body.indexOf("picker.kind === 'input'"), body.indexOf("picker.kind === 'contact'"));
  assert.match(branch, /if \(picker\.returnModal\) \{\s*\n\s*returnFromLocationPicker\(picker, address\);/);
  // The old in-place path stays for a pin on a page that was never in a modal.
  assert.match(branch, /\[data-address-lookup-input\]/);
});

test('cancel gives the form back rather than throwing the entry away', () => {
  const body = fn('closeActiveModal');
  assert.match(body, /if \(state\.modal === 'location-picker' && state\.locationPicker\?\.returnModal\) \{/);
  assert.match(body, /returnFromLocationPicker\(state\.locationPicker\);/);
  // Before the generic teardown, or state.modal is cleared and there is nothing to restore.
  assert.ok(body.indexOf('returnFromLocationPicker') < body.indexOf("state.modal = ''"));
});

test('restoring skips file inputs and leaves unchanged fields alone', () => {
  const body = fn('restoreCapturedForm');
  // FormData hands back a File object for a file input; assigning it throws in every browser.
  assert.match(body, /if \(typeof value !== 'string'\) return;/);
  assert.match(body, /field\.type !== 'file'/);
  assert.match(body, /field\.value !== value/, 'writing an identical value would move the caret for nothing');
  assert.match(body, /CSS\.escape\(name\)/, 'a field named with a colon or bracket would break the selector');
});

test('the return path repaints before it touches the form', () => {
  // The form does not exist until render() puts it back, so querying first finds nothing.
  const body = fn('returnFromLocationPicker');
  assert.ok(body.indexOf('render();') < body.indexOf('document.querySelector'));
  assert.match(body, /resetLocationPickerMap\(\);/, 'the Leaflet handles belong to a node that is gone');
  // Cancel passes no address, so the field keeps whatever was already in it.
  assert.match(body, /if \(input && address !== null\)/);
});

test('a location field carries the pin, wired to the shared picker', () => {
  // The form is customer-defined now, so the pin belongs to the location CASE rather than to
  // a field called "location" -- a company that renames it to "Job site" keeps the map.
  const body = page.slice(page.indexOf("case 'location':"), page.indexOf('default:', page.indexOf("case 'location':")));
  assert.match(body, /<input name="\$\{h\(name\)\}"[^>]*data-address-lookup-input/);
  assert.match(body, /data-action="open-location-picker" data-location-kind="input" data-location-field="\$\{h\(name\)\}"/);
  assert.match(body, /aria-label="Find \$\{h\(field\.label\)\} on a map"/);
  // Inside a .address-lookup-control, which is what openLocationPicker looks up to find the
  // input the pin belongs to.
  assert.ok(body.indexOf('class="address-lookup-control"') < body.indexOf('data-action="open-location-picker"'));
});

test('the map it opens still offers all three ways in', () => {
  const modal = readFileSync(join(root, 'src', 'crm', 'location-picker-modal.js'), 'utf8');
  assert.match(modal, /data-action="location-picker-search"/);
  assert.match(modal, /data-action="location-picker-current"/);
  assert.match(modal, /data-location-map/);
});
