import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "THIS FIELDS i WANT THIS TO BE CUSTOMIZABLE WHERE I CAN CUSTOMIZE THE FIELDS OF COMPANY
// CONTACTS, GET THE BASIC FIELDS ON THE APP BUILDER" — then: "I want this to be fully
// customize where I can build its Fields just like in the app builder."
//
// So it IS the App Builder's field editor, not a lookalike: the same markup, the same drag to
// reorder, the same palette. A second nearly-identical editor would drift from it the first
// time either one changed.

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

test('the editor is the App Builder one, not a copy of it', () => {
  assert.match(page, /wbFieldBuilderMarkup\(companyId, fieldDraft\.fields, canManage, 'cc', CC_PALETTE, fieldConfigPanel\)/);
  // Passed in rather than imported: it reads WB_FIELD_TYPES and half a dozen other main.js
  // bindings, and this page is a lazily-fetched factory.
  // Every one of them, wherever the line happens to wrap.
  ['wbFieldBuilderMarkup', 'wbOptRow', 'wbFileIcon', 'wbFileValues', 'acceptAttr', 'fileTypeKind', 'WB_FIELD_TYPES']
    .forEach((key) => assert.match(main, new RegExp(`\\b${key},`), `${key} must reach the page module`));
});

test('the palette offers what a contact can be, and nothing that needs an app', () => {
  const palette = page.match(/const CC_PALETTE = \[[^\]]*\]/)?.[0] || '';
  ['text', 'textarea', 'number', 'money', 'date', 'category', 'checkbox', 'email', 'phone', 'location', 'file']
    .forEach((type) => assert.match(palette, new RegExp(`'${type}'`), `${type} is one of the basics asked for`));
  // A rollup summarises linked records in another app; a contact has no app to link into.
  ['rollup', 'relationship', 'autonumber', 'calculation', 'status', 'user']
    .forEach((type) => assert.ok(!palette.includes(`'${type}'`), `${type} has no meaning on a contact`));
});

test('every palette type is one the database will accept', () => {
  // The CHECK constraint is the last word. A type the palette offers and the column rejects
  // fails at save, after the person has already designed the field.
  const palette = (page.match(/const CC_PALETTE = \[([^\]]*)\]/)?.[1] || '').match(/'([a-z_]+)'/g) || [];
  const allowed = main.match(/const COMPANY_CONTACT_FIELD_TYPES = \[([^\]]*)\]/)?.[1] || '';
  assert.ok(palette.length >= 11);
  palette.forEach((type) => assert.ok(allowed.includes(type), `${type} is missing from COMPANY_CONTACT_FIELD_TYPES`));
});

test('the config panel has no type picker, the way the App Builder has none', () => {
  // A type is chosen from the palette when the field is added. Changing it afterwards would
  // reinterpret every value already stored under that id -- a money column read as a date.
  const panel = fn('fieldConfigPanel', page);
  assert.ok(!/<select/.test(panel), 'wrong type means delete and drag the right one in');
  assert.match(panel, /Configure \$\{h\(meta\.label\)\} field/);
  // And it is the App Builder's own controls, not a second set: the option row, the switch.
  assert.match(panel, /wbOptRow\(option\)/);
  assert.match(panel, /<label class="wb-switch">/);
  assert.match(panel, /data-cc-add-option/);
});

test('a phone field refuses letters, using the formatter the app already had', () => {
  // type="tel" validates nothing -- the browser accepts anything in it. data-phone-format is
  // what strips it, and it was simply missing here.
  const control = fn('fieldControl', page);
  assert.match(control, /case 'phone':[\s\S]*?data-phone-format/);
  assert.match(main, /if \(event\.target\.matches\('\[data-phone-format\]'\)\) \{/);
  assert.match(main, /Only digits, '\+' and '-' are allowed; strip anything else, then format\./);
  assert.match(main, /const formatted = formatPhoneNumber\(cleaned\);/);
});

test('a file field is the App Builder uploader, not a box to paste a link into', () => {
  // "I want this File fields like the file fields in the app builder where I can upload a
  // file like images, document, pdf, excel, etc."
  const control = fn('fieldControl', page);
  const file = control.slice(control.indexOf("case 'file':"), control.indexOf("case 'location':"));
  assert.match(file, /class="wb-file-field" data-wb-file/);
  assert.match(file, /data-wb-file-input/);
  assert.match(file, /acceptAttr\('document'\)/, 'images, PDFs, spreadsheets and documents');
  assert.match(file, /data-wb-file-progress/);
  // The hidden input carries BOTH: data-f is how the uploader finds it, name is how FormData
  // collects it. Either one alone leaves the file unsaved or the field unbound.
  assert.match(file, /<input type="hidden" name="\$\{h\(name\)\}" data-f="\$\{h\(field\.id\)\}"/);
  assert.ok(!/Paste a file link/.test(page), 'the stopgap is gone rather than left beside it');
});

test('the uploader is bound on the contact form, and only there', () => {
  const body = fn('mountCompanyContactForm');
  assert.match(body, /document\.querySelector\('\[data-company-record-form\]'\)/);
  assert.match(body, /wbMountFileFields\(form\)/, 'scoped to the form, not the document');
  assert.match(main, /queueMicrotask\(mountCompanyContactForm\);/);
});

test('an upload says whose it is, in the toast and in Company Drive', () => {
  // The mirror named its folders from state.builderModal, which is null here -- every
  // contact attachment would have landed under "App / Workspace files / Attached files".
  const mount = fn('wbMountFileFields');
  assert.match(mount, /const scope = zone\.dataset\.wbFileScope \|\| 'Workspaces';/);
  assert.match(mount, /const driveLabels = zone\.dataset\.wbFileDrive \? JSON\.parse\(zone\.dataset\.wbFileDrive\) : null;/);
  assert.match(mount, /wbMirrorFileToDrive\(file, objectPath, companyId, hidden\.getAttribute\('data-f'\), driveLabels\)/);
  assert.match(mount, /guardUpload\(file, isImage \? 'image' : 'document', scope\)/, 'the size and type guard still runs');
  assert.match(page, /data-wb-file-scope="Company Contacts"/);
  assert.match(page, /root: 'Company Contacts', group: '', field: field\.label/);
  // A caller with no middle level gets two folders, not an empty one called "".
  assert.match(fn('wbMirrorFileToDrive'), /groupName \? wbFindOrCreateDriveFolder\(companyId, groupName, appRoot\.id\) : appRoot/);
});

test('a file field can hold several, with the App Builder switch', () => {
  assert.match(fn('fieldConfigPanel', page), /data-cc-field-multiple/);
  assert.match(fn('syncFieldDraft', page), /field\.config = \{ \.\.\.field\.config, multiple: multiple\.checked \}/);
  assert.match(fn('fieldControl', page), /const multiple = field\.config\.multiple === true;/);
});

test('the drop zone does not claim a contact belongs to one workspace', () => {
  assert.match(fn('wbMountFileFields'), /const hint = zone\.dataset\.wbFileHint \|\| 'Uploads to this workspace';/);
  assert.match(page, /data-wb-file-hint="Shared with every workspace"/);
});

test('the directory follows the mockup: phone under the name, company its own column', () => {
  const body = fn('renderDirectory', page);
  // Six columns, in the order the design puts them: Name, Company, Type, Active with us,
  // Open balance, Last touch. Workspace folded into "Active with us", which already reads
  // across every workspace.
  assert.match(body, /<strong>\$\{h\(contact\.name\)\}<\/strong><small class="cc-cell-phone">/);
  assert.match(body, /<span class="cc-cell-company">/);
  assert.ok(!/Workspace<\/span>/.test(body), 'the workspace column is gone');
  // Every column header is whatever the company called that field, not a hard-coded word.
  assert.match(body, /\$\{h\(companyField \? companyField\.label : 'Company'\)\}/);
  assert.match(body, /\$\{h\(chipField \? chipField\.label : 'Type'\)\}/);
});

test('the directory reads its columns off the field list, skipping hidden ones', () => {
  const body = fn('firstFieldOf', page);
  assert.match(body, /field\.type === type && !field\.hidden/);
  assert.match(fn('renderDirectory', page), /const companyField = firstFieldOf\(companyId, 'text'\);/);
  assert.match(fn('renderDirectory', page), /const phoneField = firstFieldOf\(companyId, 'phone'\);/);
});

test('the card shows an attachment as a link, never as its JSON', () => {
  // {"name":"quote.pdf","url":"https://…"} printed raw is what somebody reads instead of
  // the quote they came for.
  assert.match(fn('displayValue', page), /if \(field\.type === 'file'\) \{[\s\S]*?wbFileValues\(value\)/);
  assert.match(fn('renderCard', page), /cc-detail-files/);
  assert.match(fn('renderCard', page), /wbFileIcon\(fileTypeKind\(\{ file_name: file\.name \}\)\)/);
});

test('Save sits in the header beside Close, and there is no second one below', () => {
  // A Cancel at the bottom of a list that scrolls is a button nobody finds without scrolling
  // to look for it. Close already cancels.
  assert.match(main, /renderModalShell\('Company Contacts', 'Edit fields',[\s\S]*?data-action="save-company-contact-fields"/);
  assert.ok(!/form-actions/.test(fn('renderCompanyContactFieldsEditor', page)));
  assert.match(fn('renderModalShell'), /\$\{headerActions\}\s*\r?\n\s*<button class="btn" type="button" data-action="close-modal">Close<\/button>/);
});

test('renaming a choice survives adding another one', () => {
  // The option rows are edited in place, so they are read back in place. Without this the
  // rename is in the DOM and the draft still has the old label when render() rebuilds it.
  const body = fn('syncFieldDraft', page);
  assert.match(body, /panel\.querySelectorAll\('\.wb-opt-item'\)/);
  assert.match(body, /row\.querySelector\('\.wb-opt-label'\)\?\.value\.trim\(\)/);
  assert.match(body, /row\.querySelector\('\.wb-dot-pick'\)\?\.value/);
});

test('nothing is written until Save, and Save renumbers the order', () => {
  const body = fn('saveCompanyContactFields', page);
  // Dragging a field to the top and having it come back third is the bug that makes
  // reordering not worth using.
  assert.match(body, /normalizeCompanyContactField\(\{ \.\.\.field, position: index \+ 1 \}\)/);
  assert.match(body, /requirePermission\('company_contacts\.manage', companyId\)/);
  assert.match(body, /\.delete\(\)\.in\('id', fieldDraft\.removed\)/);
  // Adding a field then changing your mind must cost nothing: only fields that were really
  // stored are queued for deletion.
  const remove = fn('removeCompanyContactField', page);
  assert.match(remove, /companyContactFieldsFor\(fieldDraft\.companyId\)\.some\(\(field\) => field\.id === fieldId\)/);
});

test('a structural change reads the open config panel first', () => {
  // render() rebuilds the DOM, so a label typed but not yet in the draft is gone. Every
  // action that re-renders syncs first.
  ['addCompanyContactField', 'removeCompanyContactField', 'moveCompanyContactField', 'toggleCompanyContactFieldHidden']
    .forEach((name) => assert.match(fn(name, page), /syncFieldDraft\(\);/, `${name} must not discard a half-typed label`));
});

test('the mount binds the shared markup, and cannot fight the App Builder for it', () => {
  const body = fn('mountCompanyContactFields');
  assert.match(body, /document\.querySelector\('\[data-cc-field-builder\]'\)/);
  // Scoped to that root: bind() here is root.querySelectorAll, not document's.
  assert.match(body, /root\.querySelectorAll\(selector\)/);
  ['data-add-type', 'data-edit-field', 'data-hide-field', 'data-del-field']
    .forEach((sel) => assert.match(body, new RegExp(`\\[${sel}\\]`), `${sel} is inert without a handler`));
  // The App Builder binds the same selectors, but only inside its own section.
  const builder = fn('mountWorkspaceBuilder');
  assert.match(builder, /if \(state\.route\?\.section === 'workspaces' && !state\.builderModal\) \{/);
});

test('a palette type dropped on the app field list actually lands', () => {
  // The dropzone attribute was inside single quotes, so `${h(scope)}` was emitted literally:
  // wbAddFieldInstant then looked for a sub-item list by that name, found none, and added
  // nothing. Dropping onto a ROW worked, which is why it read as fussy rather than broken.
  const markup = fn('wbFieldBuilderMarkup');
  assert.match(markup, /canManage \? `data-wb-field-dropzone="\$\{h\(scope\)\}"` : ''/);
  assert.ok(!/'data-wb-field-dropzone="\$\{h\(scope\)\}"'/.test(markup));
});

test('hidden means off the directory, not off the record', () => {
  assert.match(fn('normalizeCompanyContactField'), /hidden: input\.hidden === true,/);
  assert.match(main, /const COMPANY_CONTACT_FIELD_COLS = \['id', 'company_id', 'label', 'type', 'config', 'required', 'hidden', 'position'\];/);
  // The card and the directory subline skip it; the form does not.
  assert.match(fn('renderCard', page), /!field\.hidden && companyContactValue/);
  // The form maps over the whole list with no hidden filter, which is the point: hidden takes
  // a field off the readouts, it does not stop it being filled in.
  assert.match(fn('renderCompanyContactEditor', page), /\$\{fields\.map\(\(field\) => fieldControl\(companyId, field, edit\.field_values\?\.\[field\.id\] \?\? ''\)\)\.join\(''\)\}/);
});

test('the values live under the field id, and the column is not called values', () => {
  // VALUES is a reserved SQL word: every raw-SQL reference would need quoting, and one
  // forgotten pair parses as something else entirely.
  const dir = join(root, 'supabase', 'migrations');
  const sql = readdirSync(dir).filter((n) => n.endsWith('.sql')).map((n) => readFileSync(join(dir, n), 'utf8')).join('\n');
  assert.match(sql, /add column if not exists field_values jsonb/);
  assert.match(sql, /add column if not exists hidden boolean not null default false/);
  assert.match(fn('companyContactValue'), /contact\?\.field_values\?\.\[field\.id\] \?\? ''/);
  assert.match(fn('saveCompanyContactForm', page), /fieldValues\[field\.id\] = value/);
});

test('a field the company deleted stops being collected, values and all', () => {
  // Read against the field list, not the form: a stale input for a field somebody removed
  // mid-edit must not write a value nothing can display again.
  const body = fn('saveCompanyContactForm', page);
  assert.match(body, /const fields = companyContactFieldsFor\(companyId\);/);
  assert.match(body, /fields\.forEach\(\(field\) => \{/);
  assert.ok(body.indexOf('const fields = companyContactFieldsFor') < body.indexOf('fieldValues[field.id]'));
});

test('name stays a real column, because it is the title', () => {
  // Making it a custom field would let somebody delete the only thing identifying a row.
  assert.match(fn('renderCompanyContactEditor', page), /<input name="name"[^>]*required/);
  assert.match(main, /const COMPANY_CONTACT_COLS = \['id', 'company_id', 'name', 'field_values'/);
});
