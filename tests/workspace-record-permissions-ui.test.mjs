import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Each affordance follows its own permission. They used to share one flag, so granting somebody
// "edit records" also handed them the bin, and a role granted only "add records" saw no button
// to add one -- a permission that could be granted and not used.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const items = readFileSync(new URL('../src/workspace/items-view.js', import.meta.url), 'utf8');

test('the pencil and the bin are separate conditions, not one shared flag', () => {
  const actions = main.slice(main.indexOf('function wbItemActions'));
  const body = actions.slice(0, actions.indexOf('\n}'));
  assert.match(body, /canEdit \? `<button[^`]*data-edit-item/);
  assert.match(body, /canDelete \? `<button[^`]*data-del-item/);
  // The old shape gated both on one flag; that must not come back.
  assert.doesNotMatch(body, /canManage \? `<button[^`]*data-edit-item[\s\S]*data-del-item/);
});

test('every list view passes the delete permission through to the actions cell', () => {
  for (const view of ['Table', 'Cards', 'Board', 'Badges', 'Activity']) {
    assert.ok(
      main.includes(`function wbRenderItems${view}(companyId, workspace, app, rows, cols, ui, selectable, canManage, canDelete`),
      `${view} must receive canDelete`,
    );
    assert.ok(
      items.includes(`wbRenderItems${view}(companyId, workspace, app, rows, cols, ui, selectable, canWriteRecords, canDeleteRecords)`),
      `${view} must be called with the delete permission`,
    );
  }
  assert.doesNotMatch(main, /wbItemActions\(item, canManage\)/, 'no actions cell may drop canDelete');
});

test('adding a record follows create, not the app-building permission', () => {
  // Otherwise a role granted only "Add app records" would never see the button that adds one.
  assert.match(main, /can\('workspaces\.records\.create', companyId\) && tab === 'items' && app\.fields\.length\) headBtn \+= `<button class="btn btn-primary" data-add-item/);
  // Importing a CSV moved onto its own key once export/import became permissions of their own;
  // importing FIELDS changes the app and stays with manage.
  assert.match(main, /can\('workspaces\.records\.import', companyId\) && tab === 'items' && app\.fields\.length\) headBtn \+= `<button class="btn" data-wb-import>/);
  assert.match(main, /canManage && tab === 'fields'\) headBtn \+= `<button class="btn" data-wb-import-fields/);
});

test('card and board configuration stay with the app-building permission', () => {
  // The toolbar flag gates card-field and board setup, which change the app for everyone --
  // not something the create permission should carry.
  assert.match(items, /wbItemsToolbar\(companyId, app, ui, canManage\)/);
});

test('bulk delete is offered and accepted only with the delete permission', () => {
  assert.match(items, /canDeleteRecords \? '<button class="btn btn-sm danger" type="button" data-wb-del-sel/);
  // The gate, not its punctuation: the binding grew a hidden-row count and became several
  // lines, and pinning the one-line form made a correctness fix look like a permission
  // regression. What matters is that the press is refused before anything is selected.
  const delSel = main.slice(main.indexOf("data-wb-del-sel]'"));
  assert.match(delSel.slice(0, 400), /if \(!can\('workspaces\.records\.delete', companyId\)\) return refuseRecord\('delete'\);/);
  // Selecting rows is useful to anyone who can act on them either way.
  assert.match(items, /const selectable = canWriteRecords \|\| canDeleteRecords;/);
});

test('the press is checked as well as the paint', () => {
  assert.match(main, /data-add-item\]', \(\) => \{[\s\S]{0,80}if \(!can\('workspaces\.records\.create', companyId\)\) return refuseRecord\('add'\);/);
  assert.match(main, /data-del-item\]'[\s\S]{0,300}if \(!can\('workspaces\.records\.delete', companyId\)\) return refuseRecord\('delete'\);/);
});

test('without edit, a record still opens read-only rather than refusing', () => {
  // Refusing outright would hide a record the viewer is allowed to see.
  assert.match(main, /const mode = can\('workspaces\.records\.edit', companyId\) \? 'edit' : 'view';/);
});

test('the record keys are not aliased to the broad workspace keys', () => {
  // Reported from production: a worker with "Delete app records" unticked deleted a record
  // anyway, because "Create/edit workspace apps" was still ticked and the alias made it imply
  // all four. Compatibility is data now -- 20260828040000 granted the specific keys once --
  // so the checkboxes are what the database consults.
  const aliases = main.slice(main.indexOf('const PERMISSION_ALIASES'));
  const block = aliases.slice(0, aliases.indexOf('\n};'));
  for (const key of ['view', 'create', 'edit', 'delete']) {
    assert.doesNotMatch(
      block,
      new RegExp(`'workspaces\\.records\\.${key}':`),
      `workspaces.records.${key} must not be aliased`,
    );
  }
  // The settings key keeps its alias: nothing about it was reported wrong.
  assert.match(block, /'workspaces\.settings\.manage': \['settings\.manage'\]/);
});

test('a refused write is reported as a failure, not swallowed', () => {
  // saveWorkspaceBuilderDoc used to return nothing, so a refused write was toasted and then
  // forgotten while the caller announced success.
  const save = main.slice(main.indexOf('async function saveWorkspaceBuilderDoc'));
  const body = save.slice(0, save.indexOf('\n// Link resolution'));
  assert.match(body, /if \(!doc\) return false;/);
  assert.match(body, /showToast\(message, 'local', 'Workspaces'\);\s*\n\s*return false;/, 'a refused record change aborts the save');
  assert.match(body, /return true;/);
  assert.doesNotMatch(body, /\n\s*return;\n/, 'no exit may leave the outcome unstated');
});

test('wbSave answers for every target it wrote', () => {
  const wbSave = main.slice(main.indexOf('function wbSave(companyId)'));
  assert.match(wbSave.slice(0, 600), /\.then\(\(results\) => results\.every\(Boolean\)\)/);
  // The per-write catch stays, so an ignored return still cannot become an unhandled rejection.
  assert.match(wbSave.slice(0, 600), /\.catch\(\(\) => false\)/);
});

test('a delete that did not save puts the record back', () => {
  // sendToTrashAndSave restores app.items and app.trash when its save throws. Nothing threw
  // before, so the list stayed emptied and the user was told "Deleted."
  const trash = main.slice(main.indexOf('async function wbTrashItems'));
  assert.match(trash.slice(0, 900), /if \(!\(await wbSave\(companyId\)\)\) throw new Error/);
  const fields = main.slice(main.indexOf('async function wbTrashFields'));
  assert.match(fields.slice(0, 700), /if \(moved && !\(await wbSave\(companyId\)\)\) throw new Error/);
});
