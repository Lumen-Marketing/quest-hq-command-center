import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Opening a record from an app's list navigates to a page rather than raising a modal, so
// the record has a URL, can be linked or bookmarked, and browser-back returns to the list.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
// The record page is its own fetched-on-demand module now, so slicing `main` for it would
// match the loader shim, whose body fetches rather than renders.
const recordPage = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const slice = (name) => (name === 'wbViewItemPage' ? recordPage : main)
  .match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0] || '';

test('clicking a row navigates instead of opening a modal', () => {
  const source = main.match(/el\.addEventListener\('click', \(e\) => \{[\s\S]*?\n {6}\}\);/)?.[0] || '';
  assert.match(source, /navigate\(companyPath\('workspaces', \{/);
  assert.match(source, /item_id: el\.dataset\.item/);
  assert.ok(!/openWbItemModal\(companyId, workspaceId, appId, el\.dataset\.item\)/.test(source));
});

test('the record route renders a page, not the app list', () => {
  assert.match(main, /const itemId = route\.params\.get\('item_id'\) \|\| '';/);
  assert.match(main, /wbViewItemPage\(route, companyId, workspace, app, item\)/);
});

test('the back button names the app', () => {
  // "All Jobs", not "Back" -- it says where it goes, so it reads the same as the deck row.
  assert.match(slice('wbViewItemPage'), /<i class="ti ti-arrow-left"><\/i>All \$\{h\(app\.name\)\}/);
});

test('back returns to the list you left, filters intact', () => {
  const source = slice('wbViewItemPage');
  assert.match(source, /const stage = route\.params\.get\('stage'\) \|\| '';/);
  assert.match(source, /\.\.\.\(stage \? \{ stage \} : \{\}\)/);
  // And the row carries it forward on the way in, or there would be nothing to come back to.
  assert.match(main, /const stage = state\.route\?\.params\?\.get\('stage'\) \|\| '';/);
});

test('a deleted record explains itself instead of rendering blank', () => {
  assert.match(main, /wbRecordMissing\(companyId, app\)/);
  const source = slice('wbRecordMissing');
  assert.match(source, /This record is gone/);
  assert.match(source, /All \$\{h\(app\.name\)\}/, 'the way out must still be there');
});

// --- editing happens on the record, not in a form over it -----------------------------------
//
// "remove the edit button and make it directly edit on the item, so when I click the data
// I'm on edit mode and when I click somewhere else or go back it saves."

test('there is no Edit button, because the value is the control', () => {
  const page = slice('wbViewItemPage');
  assert.ok(!/data-wb-record-edit/.test(page), 'the Edit button must be gone');
  assert.ok(!/openWbItemModal/.test(page), 'and it must not reopen the record as a modal');
  assert.ok(!/data-wb-record-edit/.test(main), 'nothing may still bind it either');
  assert.match(page, /data-wb-inline="\$\{h\(f\.id\)\}"/);
});

test('only somebody who can manage gets an editable cell', () => {
  assert.match(
    slice('wbViewItemPage'),
    /if \(!canManage \|\| !wbFieldIsEditable\(f\)\) return `<span class="wb-view-val">/,
  );
});

test('a generated field is not offered as editable', () => {
  // There is no input behind these, and wbReadFieldInput returns undefined for exactly this
  // set -- so a click would promise an edit that could never be saved.
  assert.match(main, /function wbFieldIsEditable\(field\) \{\n\s*return !!field && !WB_AUTO_FIELD_TYPES\.has\(field\.type\);/);
  assert.match(main, /const WB_AUTO_FIELD_TYPES = new Set\(\['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time'\]\);/);
});

test('the inline editor is the modal\'s own input and reader', () => {
  // Reusing both is what makes every field type editable inline with no per-type code, and
  // what makes a type added later work here without being taught to.
  const open = slice('wbBindInlineEdits');
  assert.match(open, /wbRenderFieldInput\(companyId, workspaceId, field, item\.values\[field\.id\]\)/);
  assert.match(slice('wbSaveInlineValue'), /const value = wbReadFieldInput\(field\);/);
  // The same binders the modal runs over its own markup.
  for (const binder of ['wbMountFileFields(cell)', 'wbBindUrlControls(cell)', 'wbBindRelationshipPickers(cell)']) {
    assert.ok(open.includes(binder), `${binder} is not run over the inline input`);
  }
});

test('clicking away saves, and Escape puts it back', () => {
  const open = slice('wbBindInlineEdits');
  assert.match(open, /cell\.addEventListener\('focusout'/);
  // Deferred a tick: at focusout time the new target is not focused yet, so a click on this
  // cell's own dropdown is indistinguishable from leaving it.
  assert.match(open, /setTimeout\(\(\) => \{[\s\S]*?if \(cell\.contains\(document\.activeElement\)\) return;/);
  assert.match(open, /if \(!document\.hasFocus\(\) \|\| cell\.querySelector\('\[data-wb-file\]'\)\) return;/);
  assert.match(open, /if \(event\.key === 'Escape'\)[\s\S]*?close\(false\)/);
  // Enter saves, except where a newline is part of the value.
  assert.match(open, /field\.type !== 'textarea' && field\.type !== 'checklist'/);
});

test('an inline save is a real save, not a quieter one', () => {
  // A change made here must not skip what the modal did, or there are two ways to edit a
  // record and they drift.
  const save = slice('wbSaveInlineValue');
  assert.match(save, /wbLogActivity\(workspace, \{/);
  assert.match(save, /wbNotifyItem\(companyId, workspace, app, item/);
  assert.match(save, /wbRunAutomations\(companyId, workspace, app, item, 'updated', prev\)/);
  assert.match(save, /wbSave\(companyId\);/);
  assert.match(save, /item\.updatedAt = stamp;/);
});

test('it refuses what the form refused, and puts the value back', () => {
  const save = slice('wbSaveInlineValue');
  assert.match(save, /if \(field\.required && emptied\)/);
  assert.match(save, /isValidEmail\(String\(value\)\.trim\(\)\)/);
  assert.match(save, /const restore = \(\) => \{ cell\.innerHTML = cell\.dataset\.was;/);
});

test('opening a value and leaving it alone changes nothing', () => {
  // Clicking a value and clicking away is a normal thing to do. It must not stamp the record
  // as edited, log activity, or fire automations at everybody.
  assert.match(
    slice('wbSaveInlineValue'),
    /if \(JSON\.stringify\(before \?\? ''\) === JSON\.stringify\(value \?\? ''\)\) \{ restore\(\); return; \}/,
  );
});

// --- comments work in both places ---------------------------------------------------------

test('the comment actions resolve their record from the page as well as the modal', () => {
  const source = slice('wbCommentContext');
  assert.match(source, /const m = state\.builderModal;/, 'the modal wins when both are open');
  assert.match(source, /route\.params\?\.get\('item_id'\)/);
  // Shaped like the modal so wbPersistCommentChange, which already took it, is unchanged.
  assert.match(source, /return \{ companyId, workspaceId, appId: route\.params\.get\('app_id'\) \|\| '', editId \};/);
  for (const fn of ['wbAddItemComment', 'wbSaveEditedComment', 'wbDeleteItemComment']) {
    assert.match(slice(fn), /const m = wbCommentContext\(\);/, `${fn} must not read the modal directly`);
  }
});

test('the page route resolves a workspace id rather than handing wbFind an empty one', () => {
  // wbFind returns a null app for an unknown workspace, which would silently drop every
  // comment action on the page.
  assert.match(slice('wbCommentContext'), /wbCompanyWorkspace\(companyId\)\?\.id \|\| ''/);
});

test('which comment is being edited is not stored on the modal', () => {
  assert.match(main, /wbEditingCommentId: null,/);
  assert.ok(!/editingCommentId(?!:)/.test(main.replace(/wbEditingCommentId/g, '')), 'no modal-scoped copy may remain');
  assert.match(main, /const editingId = state\.wbEditingCommentId \|\| null;/);
});

test('the page binds its own comment handlers', () => {
  for (const attr of ['data-wb-add-comment', 'data-wb-comment-edit', 'data-wb-comment-save', 'data-wb-comment-del']) {
    assert.match(main, new RegExp(`bind\\('\\[${attr}\\]'`), `${attr} is unbound on the page`);
  }
});

test('the record page reads on a phone', () => {
  assert.match(styles, /\.wb-record-body \{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(0, 1fr\)/);
  assert.match(styles, /@media \(max-width: 900px\) \{ \.wb-record-body \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
});
