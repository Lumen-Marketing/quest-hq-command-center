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
// Normalized to LF, as tests/extracted-module-references.test.mjs does. src/main.js is stored
// CRLF, so an assertion written with a bare \n silently never matches — and reads as the code
// being wrong rather than the file having different line endings.
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8').replace(/\r\n/g, '\n');

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
  ['wbFieldBuilderMarkup', 'wbFileIcon', 'wbFileValues', 'acceptAttr', 'fileTypeKind', 'WB_FIELD_TYPES']
    .forEach((key) => assert.match(main, new RegExp(`\\b${key},`), `${key} must reach the page module`));
});

// "Can you copy all of the available fields we have in the workspaces app, so I can fully
// connect the company contacts on the workspace app." The palette used to be eleven types on
// the grounds that a contact is a simpler thing than a record. It is not: a sub has a rating,
// a client has a photo and an account manager, a supplier has a price sheet.

test('the palette is the App Builder palette, minus what does not fit a person', () => {
  const allowed = main.match(/const COMPANY_CONTACT_FIELD_TYPES = \[([\s\S]*?)\];/)?.[1] || '';
  const order = main.match(/const WB_FIELD_ORDER = \[([^\]]*)\]/)?.[1] || '';
  const every = (order.match(/'([a-z_]+)'/g) || []).map((quoted) => quoted.replace(/'/g, ''));
  assert.ok(every.length >= 29, 'the App Builder list itself was found');

  // Three exclusions, three DIFFERENT reasons. They were once described as one, and collapsing
  // them is exactly what kept a workable field type off the list: button was filed with the two
  // that genuinely cannot resolve, and inherited a limitation it never had.
  //
  //   relationship / rollup -- resolve IMPLICITLY against the app they live in. A contact has no
  //     such app, so "which app" has no answer. Genuinely impossible.
  //   company_contact -- circular. A contact pointing at another contact says nothing about a
  //     person. It stays in the APP palette, which is how an app points at a contact.
  const impossible = ['relationship', 'rollup'];
  const circular = ['company_contact'];
  // A button is not a field at all: it holds no value, has no place on the add/edit form, and
  // can never be filled in. It lives on the CARD, in contactCard.buttons on the builder doc.
  const notAValue = ['button'];
  // A form is a document ABOUT a record -- a work order, a punch list. The directory's field list
  // is one shape shared by every contact in the company, and the database CHECK constraint on
  // company_contact_fields.type does not accept it either, so offering it would fail at save
  // after somebody had already designed the form.
  const aboutARecord = ['form'];
  [...impossible, ...circular, ...notAValue, ...aboutARecord].forEach((type) => assert.ok(
    !allowed.includes(`'${type}'`),
    `${type} must not be offered on a contact`,
  ));

  every.filter((type) => ![...impossible, ...circular, ...notAValue, ...aboutARecord].includes(type))
    .forEach((type) => assert.ok(allowed.includes(`'${type}'`), `${type} is in the App Builder but not offered on a contact`));

  // The one that must NOT follow the removal: apps still point at contacts with this type, and
  // the whole contact card is built from scanning for it.
  assert.match(main, /const WB_FIELD_ORDER = \[[^\]]*'company_contact'/, 'apps keep the Company Contact field');

  // And the palette IS that list, rather than a second one kept in step by hand.
  assert.match(page, /const CC_PALETTE = COMPANY_CONTACT_FIELD_TYPES;/);
});

test('every palette type is one the database will accept', () => {
  // The CHECK constraint is the last word. A type the palette offers and the column rejects
  // fails at save, after the person has already designed the field.
  const allowed = (main.match(/const COMPANY_CONTACT_FIELD_TYPES = \[([\s\S]*?)\];/)?.[1] || '')
    .match(/'([a-z_]+)'/g)?.map((quoted) => quoted.replace(/'/g, '')) || [];
  // 25: the App Builder's palette minus relationship, rollup, company_contact and button.
  assert.ok(allowed.length >= 25, `expected the widened list, got ${allowed.length}`);

  // The live constraint is whichever migration touched it last.
  const dir = join(root, 'supabase', 'migrations');
  const constraintFile = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort().reverse()
    .find((name) => readFileSync(join(dir, name), 'utf8').includes('company_contact_fields_type_check')
      || /create table if not exists public\.company_contact_fields/.test(readFileSync(join(dir, name), 'utf8')));
  assert.ok(constraintFile, 'no migration defines the type constraint');
  const sql = readFileSync(join(dir, constraintFile), 'utf8');
  const check = sql.slice(sql.indexOf('check (type in ('));
  allowed.forEach((type) => assert.ok(check.includes(`'${type}'`), `${type} would be rejected by ${constraintFile}`));
});

test('the borrowed types are drawn by the App Builder, not copied into the contacts page', () => {
  // Fifteen types arriving with no new markup is the whole point: one renderer, one config
  // panel, one set of stored shapes. A second copy would drift the first time either changed.
  assert.match(page, /if \(COMPANY_CONTACT_WB_TYPES\.has\(field\.type\)\) \{[\s\S]*?wbRenderFieldInput\(companyId, '', field, wbValueFor\(field, value\)\)/);
  assert.match(page, /COMPANY_CONTACT_WB_TYPES\.has\(field\.type\) \? wbFieldConfigUI\(field, contactsAsApp\(fieldDraft\.companyId\)\) : ''/);
  // Read back by the module that drew it, for the same reason.
  assert.match(fn('syncFieldDraft', page), /wbCollectFieldConfig\(field\.type, next, fieldDraft\.companyId\)/);
});

test('an App Builder input is given the name this form saves by', () => {
  // The record modal reads [data-f] at save time; this is a real <form> read with FormData, and
  // its recovery draft restores through form.elements. Both key off `name`.
  const body = fn('wbNameContactFieldInputs');
  assert.match(body, /el\.name = `field:\$\{el\.dataset\.f\}`/);
  assert.match(body, /if \(el\.name \|\| !el\.dataset\.f\) return;/, 'a field that already has one is left alone');
  // Auto fields are display boxes. A name on one would post a stale value over the computed one.
  assert.match(body, /wb-auto-readonly, \.wb-calc-display/);
  assert.match(fn('mountCompanyContactForm'), /wbNameContactFieldInputs\(form\)/);
});

test('the zones the borrowed fields need are bound on the contact form', () => {
  const body = fn('mountCompanyContactForm');
  ['wbMountFileFields', 'wbMountDurationFields', 'wbMountProgressFields', 'wbMountChecklistFields', 'wbMountTagFields']
    .forEach((binder) => assert.match(body, new RegExp(`${binder}\\(form\\)`), `${binder} is not bound`));
  // Named BEFORE the binders run: they fire input events as they paint, and a draft written
  // from one of those has to carry the field's name or it restores nothing.
  assert.ok(body.indexOf('wbNameContactFieldInputs') < body.indexOf('wbMountFileFields'));
});

test('multi-select is chips over one hidden value, not a native multi-select', () => {
  // FormData keeps only the last value of a <select multiple>, and a recovery draft restores
  // only one option -- so the App Builder's own control cannot be borrowed for this one.
  const control = fn('fieldControl', page);
  const tags = control.slice(control.indexOf("case 'tags': {"), control.indexOf('default:'));
  assert.ok(tags, 'the tags case was not found');
  assert.match(tags, /data-wb-tagpick/);
  assert.ok(!/<select/.test(tags), 'a native multi-select would lose all but one');
  assert.match(fn('wbMountTagFields'), /hidden\.value = next\.length \? JSON\.stringify\(next\) : ''/);
});

test('what is worked out is not also stored', () => {
  // Created / Last modified read the contact's own timestamps and a calculation is derived on
  // the way out. A stored copy would outlive whatever it was copied from.
  assert.match(page, /const CC_DERIVED_TYPES = new Set\(\['created_time', 'updated_time', 'calculation'\]\);/);
  assert.match(fn('saveCompanyContactForm', page), /if \(CC_DERIVED_TYPES\.has\(field\.type\)\) return;/);
  // An auto-number is the exception: computed once, then it belongs to the contact.
  assert.ok(!/CC_DERIVED_TYPES = new Set\(\[[^\]]*'autonumber'/.test(page));
  assert.match(fn('saveCompanyContactForm', page), /held !== undefined && held !== '' && held !== null\s*\?\s*held/);
});

test('a contact auto-number counts contacts, including deleted ones', () => {
  const body = fn('wbNextContactAutoNumber');
  assert.match(body, /for \(const contact of state\.companyContacts \|\| \[\]\)/);
  assert.match(body, /contact\.field_values\?\.\[field\.id\]/);
  // Reissuing a number a quote already quotes is worse than a gap in the sequence.
  assert.ok(!/deleted_at/.test(body), 'a soft-deleted contact still holds its number');
});

// --- Settings: a gear, two tabs -------------------------------------------------------------
// "Make an icon Settings where when you click it you can see the field there where you can
// customize, also inside setting you can customize how the contacts looks in the contact card."

test('the directory opens settings from a gear, not a button called Fields', () => {
  assert.match(page, /data-action="open-company-contact-fields"[^>]*aria-label="Company Contacts settings"/);
  assert.match(page, /<i class="ti ti-settings"><\/i>/);
  assert.ok(!/ti-adjustments"><\/i>Fields</.test(page), 'the old labelled button is gone, not left beside it');
});

test('settings is one dialog with a Fields tab and a Contact card tab', () => {
  const shell = main.slice(main.indexOf("state.modal === 'company-contact-fields'"), main.indexOf("state.modal === 'company-record-form'"));
  assert.match(shell, /\['fields', 'ti-list-details', 'Fields'\], \['card', 'ti-id-badge-2', 'Contact card'\]/);
  assert.match(shell, /renderCompanyContactCardSettings\(/);
  assert.match(shell, /renderCompanyContactFieldsEditor\(/);
  // One Save for the dialog, not one per tab.
  assert.match(shell, /data-action="save-company-contact-fields"/);
  assert.equal((shell.match(/data-action="save-company-contact-fields"/g) || []).length, 1);
});

test('switching tab banks the panel being left', () => {
  // Both drafts, both ways: switching to the card tab and back used to be how you lost the
  // label you had just typed, and switching away from it how you lost the placement.
  const handler = main.slice(main.indexOf("action === 'set-company-contact-settings-tab'"), main.indexOf("action === 'configure-company-contact-field'"));
  assert.match(handler, /page\?\.syncFieldDraftNow\(\);/);
  assert.match(handler, /page\?\.syncCardDraft\(\);/);
  assert.ok(handler.indexOf('syncCardDraft') < handler.indexOf('state.ccSettingsTab ='), 'read before the DOM is rebuilt');
  // The gear always lands on Fields, so it does not do something different each time.
  assert.match(main, /state\.ccSettingsTab = 'fields';\n\s*state\.modal = 'company-contact-fields';/);
});

test('the card tab decides where a field lands, and what badges the contact', () => {
  const panel = fn('renderCompanyContactCardSettings', page);
  // The shelves themselves live in card-layout.js now, so the settings tab and the card build
  // their picture from one list rather than from two that have to be kept in step.
  assert.match(page, /from '\.\/card-layout\.js'/);
  assert.match(panel, /regionsFor\(element\)/, 'each row is offered only the shelves its kind can sit on');
  // Keyed by element key -- `field:<id>` or `tile:<id>` -- because a tile is not a field and
  // both are arranged in one list.
  assert.match(panel, /data-cc-card-place="\$\{h\(element\.key\)\}"/);
  assert.match(panel, /data-cc-card-badge/);
  // Only an option list can badge: the pill takes the chosen option's colour.
  assert.match(panel, /field\.type === 'category' \|\| field\.type === 'status'/);
  assert.match(panel, /leaves it on the record/);
});

test('the card tab can resize, reorder and place a button by hand', () => {
  const panel = fn('renderCompanyContactCardSettings', page);
  // Sizing reuses the App Builder's own width control rather than inventing a second one.
  assert.match(panel, /wb-w-sizes/);
  assert.match(panel, /data-action="cc-card-span"/);
  // Arrows as well as drag: a drag-only reorder is unusable on a keyboard and on touch.
  assert.match(panel, /data-action="cc-card-move"/);
  assert.match(panel, /draggable="\$\{canManage && !locked \? 'true' : 'false'\}"/);
  // The 3x3 pad is the no-drag path to placing a button.
  assert.match(panel, /data-action="cc-pin-preset"/);
  assert.match(panel, /data-cc-pin-anchor/);
  assert.match(panel, /data-cc-pin-x/);
  assert.match(panel, /data-cc-pin-y/);
  // Tiles live on the builder doc, which needs a different permission from contacts.
  assert.match(panel, /can\('workspaces\.manage', companyId\)/);
});

test('exactly one field claims the badge', () => {
  // Written to every candidate, not only the chosen one -- otherwise the previous badge field
  // keeps its flag and companyContactChipField finds two.
  const body = fn('syncCardDraft', page);
  assert.match(body, /field\.config = \{ \.\.\.field\.config, badge: field\.id === badge\.value \};/);
  // And the reader falls back, so a company that never opened the panel looks unchanged.
  const chip = fn('companyContactChipField');
  assert.match(chip, /field\.config\?\.badge === true && badgeable\(field\)/);
  assert.match(chip, /\|\| fields\.find\(badgeable\)/);
});

test('card placement has a default, so an existing card is not blanked by the new setting', () => {
  // The default moved into card-layout.js as cardRegionOf, and the behaviour is unchanged:
  // long text keeps its own panel, everything else reads on the summary line. Asserted against
  // the module rather than the page, because that is where it now lives -- and it is covered
  // behaviourally in tests/company-contact-card-layout.test.mjs.
  const layout = readFileSync(join(root, 'src', 'company-contacts', 'card-layout.js'), 'utf8');
  assert.match(layout, /return field\?\.type === 'textarea' \? 'detail' : 'summary';/);
  // A button opens beside Edit info, so a new one is useful before anybody drags anything.
  // Keyed off `kind`, not `type`: a button is a card object rather than a field.
  assert.match(layout, /if \(field\?\.kind === 'button'\) return 'header';/);
  // And Save writes both tabs, so choosing a placement is not lost by never opening Fields.
  assert.match(fn('saveCompanyContactFields', page), /syncFieldDraft\(\);\s*\n\s*syncCardDraft\(\);/);
  // ...including the tile half, which is written to a different store entirely.
  assert.match(fn('saveCompanyContactFields', page), /saveContactCardTiles\(companyId\)/);
});

test('the config panel has no type picker, the way the App Builder has none', () => {
  // A type is chosen from the palette when the field is added. Changing it afterwards would
  // reinterpret every value already stored under that id -- a money column read as a date.
  const panel = fn('fieldConfigPanel', page);
  assert.ok(!/<select/.test(panel), 'wrong type means delete and drag the right one in');
  assert.match(panel, /Configure \$\{h\(meta\.label\)\} field/);
  // And it is the App Builder's own controls, not a second set: the option row, the switch.
  // The option row is now ONE shared module both editors import, rather than a helper main.js
  // hands to each through ctx -- same "not a copy of it" rule, enforced by the import instead.
  assert.match(panel, /optionRow\(h, option\)/);
  assert.match(page, /import \{ optionRow \} from '\.\.\/workspace\/option-row\.js';/);
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
  assert.ok(mount.includes("guardUpload(rawFile, photo || isImage ? 'image' : 'document', scope)"), 'the size and type guard still runs');
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


test('the card shows an attachment as a link, never as its JSON', () => {
  // {"name":"quote.pdf","url":"https://…"} printed raw is what somebody reads instead of
  // the quote they came for.
  // An image is the same stored shape and gets the same treatment.
  assert.match(fn('displayValue', page), /if \(field\.type === 'file' \|\| field\.type === 'image'\) \{[\s\S]*?wbFileValues\(value\)/);
  // The details box moved into elementHtml when the card became layout-driven -- one renderer
  // per kind of element, rather than one function that knew every shelf.
  assert.match(fn('elementHtml', page), /cc-detail-files/);
  assert.match(fn('elementHtml', page), /wbFileIcon\(fileTypeKind\(\{ file_name: file\.name \}\)\)/);
});

test('Save sits in the header beside Close, and there is no second one below', () => {
  // A Cancel at the bottom of a list that scrolls is a button nobody finds without scrolling
  // to look for it. Close already cancels.
  assert.match(main, /renderModalShell\('Company Contacts', 'Settings',[\s\S]*?data-action="save-company-contact-fields"/);
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
  // The wiring moved into ./company-contacts/page.js, beside the markup it binds. It is
  // contacts-only and that module is lazily fetched, so in main.js it was entry-chunk weight
  // every session paid for and most never used -- and bundle-budget-lib.mjs records that only
  // lazy-loading reduces the entry chunk, not tidiness.
  assert.match(fn('mountCompanyContactFields'), /companyContactWrites\(\)\?\.mountFieldsEditor\(\)/);
  const body = fn('mountFieldsEditor', page);
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

test('hiding the phone column does not blank the number under the name', () => {
  // Hiding is a COLUMN setting. Taking Phone out of the table is reasonable — it is already
  // under the name — and doing so must not remove it from under the name as well.
  assert.match(fn('firstFieldOf', page), /\.find\(\(field\) => field\.type === type\) \|\| null;/);
  assert.ok(!/field\.type === type && !field\.hidden/.test(page), 'the sub-line is not a column');
  const body = fn('renderDirectory', page);
  assert.match(body, /const phoneField = firstFieldOf\(companyId, 'phone'\);/);
  assert.match(body, /<small class="cc-cell-phone">\$\{h\(phone \|\| '—'\)\}<\/small>/);
});

test('the job form builds without throwing', () => {
  // renderSearchCombobox takes `h` as its FIRST argument. ownerField was not passing it, so
  // `h` was the string 'Account owner', calling it threw, and the exception escaped while the
  // form was being built -- clicking Add job rendered nothing at all.
  const editor = readFileSync(join(root, 'src', 'jobs', 'job-editor.js'), 'utf8');
  const calls = [...editor.matchAll(/renderSearchCombobox\(\s*([A-Za-z_$][\w$]*|')/g)].map((m) => m[1]);
  assert.ok(calls.length >= 2, 'expected the owner and client comboboxes');
  calls.forEach((first) => assert.equal(first, 'h', 'every call must pass h first'));
});

test('both save buttons say they are working', () => {
  // A save that writes several rows and then re-renders looks like nothing happened until it
  // finishes. The button disables, spins and announces itself.
  assert.match(main, /const done = beginSubmitting\(node, 'Saving…'\);[\s\S]{0,220}saveCompanyContactFields\(\)/);
  assert.match(main, /const done = beginSubmitting\(event\.target, 'Saving…'\);[\s\S]{0,200}saveCompanyContactForm\(event\.target\)/);
  // Restored whatever happened, or a failed save leaves a button nobody can press again.
  assert.equal((main.match(/\.finally\(\(\) => done\?\.\(\)\)/g) || []).length, 2);
});

test('the busy helper works for a button that is not in a form', () => {
  // The field editor saves from a button in the modal header, nowhere near a <form>.
  const body = fn('beginSubmitting');
  assert.match(body, /formNode\?\.matches\?\.\('button'\) \? formNode : formNode\?\.querySelector\?\.\('button\[type="submit"\]'\)/);
  assert.match(body, /button\.setAttribute\('aria-busy', 'true'\)/, 'a spinner alone says nothing to a screen reader');
  assert.match(body, /btn-spinner/);
});

test('hidden means off the directory, not off the record', () => {
  assert.match(fn('normalizeCompanyContactField'), /hidden: input\.hidden === true,/);
  assert.match(main, /const COMPANY_CONTACT_FIELD_COLS = \['id', 'company_id', 'label', 'type', 'config', 'required', 'hidden', 'position'\];/);
  // The table drops it; the card and the form keep it. Hiding is a column setting, and a card
  // that quietly omitted details would be a card you cannot trust.
  assert.match(fn('renderDirectory', page), /\.filter\(\(field\) => !field\.hidden\)/);
  // Renamed from `filled` to `placeable`: a button holds no value and computes none, so the
  // old "has something in it" rule dropped every button before it could ever be placed.
  assert.match(fn('renderCard', page), /const placeable = fields\.filter\(\(field\) => field !== chipField/);
  assert.ok(!/placeable = fields\.filter\([^;]*field\.hidden/.test(page), 'hiding is a column setting, not a card one');
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

test('the directory keeps its four built-ins and a column per visible field', () => {
  const body = fn('renderDirectory', page);
  // Name, Active with us, Open balance and Last touch are this view's own -- no field of
  // theirs produces them. Between them sits one column per field they have not hidden.
  assert.match(body, /<strong>\$\{h\(contact\.name\)\}<\/strong><small class="cc-cell-phone">/);
  assert.match(body, /const columns = companyContactFieldsFor\(companyId\)\.filter\(\(field\) => !field\.hidden\);/);
  assert.match(body, /columns\.map\(\(field\) => `<span class="cc-cell-field">\$\{fieldCell/);
  assert.ok(!/Workspace<\/span>/.test(body), 'the workspace column is gone');
});

test('the grid is built from the column count, and can still collapse', () => {
  // A fixed six-track rule mis-aligned every row the moment a seventh column appeared.
  const body = fn('renderDirectory', page);
  assert.match(body, /--cc-cols:\$\{tracks\};--cc-min:\$\{minWidth\}px/);
  // Custom properties, not the properties themselves: an inline grid-template-columns would
  // beat the narrow-screen rule that collapses the row to a single column.
  //
  // A leading track is allowed before the name column -- the tick-box column that Select turns
  // on lives there. What matters is that the rest is still derived from the column COUNT, which
  // is the fixed-six-track bug this guards. That the head and the rows then agree on how many
  // columns there are is checked by rendering both, in company-contact-bulk-select.test.mjs.
  assert.match(body, /const tracks = \[.*'minmax\(200px, 1\.4fr\)', \.\.\.columns\.map/);
});