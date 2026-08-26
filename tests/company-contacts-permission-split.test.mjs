import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// company_contacts.manage bundled four powers under one checkbox: file a contact, edit one,
// delete one, and restructure the directory's FIELDS. Deleting a field is a hard delete with
// no recycle bin that has already cost a company its whole field set, while filing a contact
// is what an ordinary worker does whenever a Workspace button sends a lead across. Sharing a
// key meant the only way to let a worker file a lead was to also let them destroy the schema
// -- which is why a Worker role pressing "Lead" got "could not be filed in Company Contacts".

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8').replace(/\r\n/g, '\n');
const main = read('src', 'main.js');
const contacts = read('src', 'company-contacts', 'page.js');
const buttonPush = read('src', 'workspace', 'button-push.js');
const migration = read('supabase', 'migrations', '20260826090000_company_contacts_permission_split.sql');

const NEW_KEYS = [
  'company_contacts.create',
  'company_contacts.edit',
  'company_contacts.delete',
  'company_contacts.fields.manage',
];

test('each new power is grantable from the Roles editor', () => {
  // PERMISSION_KEYS is the only list the picker reads, so a key missing from it is a
  // permission that exists and can never be granted -- the bug team.view had.
  for (const key of NEW_KEYS) {
    assert.match(main, new RegExp(`\\['${key.replace(/\./g, '\\.')}', '[^']+'\\]`), `${key} needs a label`);
  }
  assert.match(main, /\['company_contacts\.manage', 'Full company contacts access \(all of the above\)'\]/);
});

test('the legacy key still satisfies every power it used to bundle', () => {
  // Existing roles must not lose access on deploy, and no assignment should need rewriting.
  for (const key of NEW_KEYS) {
    assert.match(
      main,
      new RegExp(`'${key.replace(/\./g, '\\.')}': \\['company_contacts\\.manage'\\]`),
      `${key} must alias back to the old key`,
    );
  }
});

test('the browser and the database agree on that fallback', () => {
  // If the alias existed only in the browser, the UI would offer actions RLS then refused --
  // the exact over-promise the comment in can() warns about. Put the aliases in the shared
  // permission resolver so policies and server actions (including Recycle Bin) agree too.
  assert.match(migration, /create or replace function app_private\.has_company_permission/);
  for (const key of NEW_KEYS) {
    assert.match(
      migration,
      new RegExp(`when permission = '${key.replace(/\./g, '\\.')}' then 'company_contacts\\.manage'`),
      `${key} needs a database alias`,
    );
  }
  const policies = migration.match(/create policy[\s\S]*?;/g) || [];
  assert.ok(policies.length >= 5, 'every write policy is rewritten');
  assert.doesNotMatch(policies.join('\n'), /or app_private\.has_company_permission\([^\n]+company_contacts\.manage/);
});

test('the schema half is separated from the data half server-side', () => {
  const contactRows = migration.slice(migration.indexOf('on public.company_contacts'));
  assert.match(contactRows, /for insert with check \(\s*app_private\.has_company_permission\(company_id, 'company_contacts\.create'\)/);
  assert.match(contactRows, /for update using \(\s*app_private\.has_company_permission\(company_id, 'company_contacts\.edit'\)/);
  assert.match(contactRows, /for delete using \(\s*app_private\.has_company_permission\(company_id, 'company_contacts\.delete'\)/);
  // Fields and the retained option catalogue are both schema, so they share the schema key.
  const fields = migration.slice(migration.indexOf('on public.company_contact_fields'));
  assert.match(fields, /company_contacts\.fields\.manage/);
  const options = migration.slice(migration.indexOf('on public.company_contact_options'));
  assert.match(options, /company_contacts\.fields\.manage/);
  assert.doesNotMatch(migration, /on public\.company_contact_types/);
});

test('the existing permission resolver is updated without adding a new privileged surface', () => {
  // Replacing the one reviewed resolver keeps plugin gating, deny handling and elevated roles
  // in one place. No second SECURITY DEFINER function or one-off permission bypass is added.
  const sql = migration.split('\n').filter((line) => !line.trimStart().startsWith('--')).join('\n');
  assert.equal((sql.match(/create or replace function/gi) || []).length, 1);
  assert.match(sql, /create or replace function app_private\.has_company_permission/);
  assert.match(sql, /security definer/i);
});

test('reading the directory is still open to any member', () => {
  // The split is about writes. Narrowing reads here would silently empty the directory for
  // everyone whose role predates this change.
  assert.doesNotMatch(migration, /company contacts read/);
});

test('filing a lead needs create, not the power to restructure the directory', () => {
  const fn = contacts.slice(contacts.indexOf('async function receiveContactFromApp('));
  const body = fn.slice(0, fn.indexOf('\n  }\n'));
  assert.match(body, /const needed = existing \? 'company_contacts\.edit' : 'company_contacts\.create';/);
  assert.doesNotMatch(body, /company_contacts\.manage/);
  // Reusing somebody already on file, with nothing left to fill in, is a lookup rather than a
  // write -- so it needs neither permission and does not bump their timestamp.
  assert.match(body, /if \(existing && !landed\) return \{ ok: true, landed: 0, reused: true, contact: existing \};/);
});

test('the form asks for the permission that matches what it is doing', () => {
  assert.match(contacts, /requirePermission\(existing \? 'company_contacts\.edit' : 'company_contacts\.create', companyId\)/);
  assert.match(main, /requirePermission\(editing \? 'company_contacts\.edit' : 'company_contacts\.create', activeCompanyId\(\)\)/);
  // The gear opens the field list and card layout, which is schema.
  assert.match(main, /open-company-contact-fields[\s\S]{0,220}requirePermission\('company_contacts\.fields\.manage'/);
});

test('the directory toolbar no longer hides three powers behind one flag', () => {
  assert.match(contacts, /const canDelete = can\('company_contacts\.delete', companyId\);/);
  assert.match(contacts, /const canCreate = can\('company_contacts\.create', companyId\);/);
  assert.match(contacts, /const canFields = can\('company_contacts\.fields\.manage', companyId\);/);
  // Bulk select exists in order to delete; New contact files somebody; the gear is schema.
  assert.match(contacts, /const selecting = canDelete && !!state\.companyContactSelecting;/);
  assert.match(contacts, /\$\{canCreate \? `[\s\S]{0,160}data-mode="new"/);
  assert.match(contacts, /\$\{canFields \? `[\s\S]{0,160}open-company-contact-fields/);
});

test('the module gate matches the one the database applies', () => {
  // The SQL has mapped company_contacts.% onto its plugin since 20260813180000; the browser
  // copy never did, so an uninstalled module still looked available in the UI.
  const fn = main.slice(main.indexOf('function permissionPluginIds('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(clean\.startsWith\('company_contacts\.'\)\) return \['company_contacts'\];/);
});

test('a refused filing says why', () => {
  // Three different refusals -- no permission, no readable name, a failed save -- all used to
  // render as the same sentence, which is what turned a one-line answer into a support ticket.
  assert.match(buttonPush, /failures\.push\(\{ label: pair\.to\.label, reason: filed\?\.error \|\| '' \}\)/);
  assert.match(buttonPush, /const reasons = \[\.\.\.new Set\(failures\.map\(\(failure\) => failure\.reason\)\.filter\(Boolean\)\)\]/);
  assert.match(buttonPush, /\$\{reasons\.length \? ` \$\{reasons\.join\(' '\)\}` : ''\}/);
  // And the intake gives it something worth reporting.
  assert.match(contacts, /'Your role cannot add company contacts\.'/);
  assert.match(contacts, /'Your role cannot edit company contacts\.'/);
});
