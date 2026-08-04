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

test('Edit is hidden from someone who cannot manage the app', () => {
  assert.match(slice('wbViewItemPage'), /\$\{canManage \? `<button class="btn btn-primary"[^`]*data-wb-record-edit/);
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
  for (const attr of ['data-wb-add-comment', 'data-wb-comment-edit', 'data-wb-comment-save', 'data-wb-comment-del', 'data-wb-record-edit']) {
    assert.match(main, new RegExp(`bind\\('\\[${attr}\\]'`), `${attr} is unbound on the page`);
  }
});

test('the record page reads on a phone', () => {
  assert.match(styles, /\.wb-record-body \{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(0, 1fr\)/);
  assert.match(styles, /@media \(max-width: 900px\) \{ \.wb-record-body \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
});
