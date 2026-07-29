import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const picker = source.match(/function renderRolePermissionPicker\([\s\S]*?\n\}/)[0];

test('every messages permission is offered in the catalog', () => {
  const catalog = source.match(/const PERMISSION_KEYS = \[[\s\S]*?\n\];/)[0];
  for (const key of [
    'messages.view', 'messages.send', 'messages.attach_files',
    'messages.create_group', 'messages.manage_groups',
    'messages.delete_own', 'messages.delete_any',
  ]) {
    assert.ok(catalog.includes(`'${key}'`), `expected ${key} in PERMISSION_KEYS`);
  }
});

test('permissions are grouped so a module cannot read as missing when it is just below the fold', () => {
  assert.match(source, /const PERMISSION_GROUP_LABELS = \{[\s\S]*?messages: 'Messages',/);
  assert.match(picker, /const prefix = key\.split\('\.'\)\[0\];/);
  assert.match(picker, /<legend>/);
});

// save_company_role replaces the whole permission set and only rendered checkboxes
// submit, so a filtered view must resubmit the selections it is hiding. Without this,
// typing a filter and saving deletes every permission the filter happened to hide.
test('filtered-out selections are resubmitted as hidden inputs', () => {
  assert.match(
    picker,
    /\.filter\(\(\[key\]\) => selectedPermissions\.has\(key\) && !matches\.some\(\(\[matchKey\]\) => matchKey === key\)\)/,
    'expected selected-but-hidden permissions to be preserved',
  );
  assert.match(picker, /<input type="hidden" name="permissions" value="\$\{h\(key\)\}" \/>/);
});

test('the save path still replaces the full set, which is why the guard above matters', () => {
  assert.match(source, /const permissions = data\.getAll\('permissions'\)/);
  assert.match(source, /client\.rpc\('save_company_role', \{ p_role: role, p_permissions: permissions \}\)/);
});

test('the filter resets when either role modal opens', () => {
  // A stale filter would hide most permissions the next time the modal is opened.
  const resets = source.match(/state\.rolePermissionQuery = '';/g) || [];
  assert.ok(resets.length >= 2, `expected a reset for both role modals, found ${resets.length}`);
});

test('plugin gating still applies to the grouped list', () => {
  assert.match(picker, /permissionAvailableForCompany\(key, companyId\)/);
});
