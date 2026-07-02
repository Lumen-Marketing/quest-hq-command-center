import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202607020945_contact_workspace_intake_fields.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';

test('contact workspace uses notes email and activity instead of old action clutter', () => {
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(recordSource, /const workspaceTabs = \[\['Notes', 'ti-note'\], \['Email', 'ti-mail'\], \['Activity', 'ti-activity'\]\]/);
  assert.match(recordSource, /data-action="set-contact-workspace-tab"/);
  assert.match(recordSource, /renderContactWorkspacePanel\(contact, activeWorkspaceTab, totalFeed, feed\)/);
  assert.doesNotMatch(recordSource, /const headerActions = \[\['Follow'/);
  assert.doesNotMatch(recordSource, /New Estimate/);
});

test('contact intake fields have real suggestions and constrained source options', () => {
  const editorSource = source.match(/function renderContactEditor\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  const inlineSource = source.match(/function contactInlineOptions\(contact, key\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /const CONTACT_JOB_TYPE_OPTIONS = \[/);
  assert.match(source, /const CONTACT_ROOF_SYSTEM_OPTIONS = \[/);
  assert.match(source, /const CONTACT_SOURCE_OPTIONS = \[/);
  assert.match(source, /function contactJobTypeOptions\(companyId\)/);
  assert.match(source, /function contactRoofSystemOptions\(companyId\)/);
  assert.match(source, /function contactSourceOptions\(companyId\)/);
  assert.match(editorSource, /list="contact-job-type-options"/);
  assert.match(editorSource, /list="contact-roof-system-options"/);
  assert.match(editorSource, /selectField\('Source', 'source', edit\.source, contactSourceOptions\(companyId\)\)/);
  assert.match(editorSource, /name="has_multiple_roof_systems"/);
  assert.match(editorSource, /field\('Secondary roof system', 'secondary_roof_system'/);
  assert.match(inlineSource, /if \(key === 'source'\) return contactSourceOptions\(contact\.company_id\)/);
});

test('contact locations support google maps autocomplete and pin links', () => {
  const editorSource = source.match(/function renderContactEditor\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  const jobEditorSource = source.match(/function renderJobEditor\(companyId, job\) \{[\s\S]*?\n\}/)?.[0] || '';
  const accountEditorSource = source.match(/function renderAccountEditor\(companyId, account\) \{[\s\S]*?\n\}/)?.[0] || '';
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /function googleMapsPlaceSearchUrl\(address\)/);
  assert.match(source, /function renderAddressLookupField\(label, name, value = '', options = \[\]/);
  assert.match(source, /function beginAddressInlineEdit\(span, value, companyId, commitValue\)/);
  assert.match(source, /data-address-map-link/);
  assert.match(source, /data-address-lookup-input/);
  assert.match(editorSource, /renderAddressLookupField\('Location', 'location', edit\.location/);
  assert.match(jobEditorSource, /renderAddressLookupField\('Site address', 'site_address', edit\.site_address/);
  assert.match(accountEditorSource, /renderAddressLookupField\('Address', 'address', edit\.address/);
  assert.match(source, /beginAddressInlineEdit\(span, contact\.location, contact\.company_id/);
  assert.match(source, /beginAddressInlineEdit\(span, job\.site_address, job\.company_id/);
  assert.match(source, /renderAddressLookupField\('Client address', 'client_address', draft\.client\.address/);
  assert.match(source, /const quoteAddress = job\?\.site_address \|\| account\?\.address \|\| contact\?\.location \|\| ''/);
  assert.match(styles, /\.address-pin-button/);
  assert.match(styles, /\.sf-inline-address-editor/);
  assert.match(recordSource, /googleMapsPlaceSearchUrl\(contact\.location\)/);
  assert.match(recordSource, /Exact pin/);
});

test('contact tasks preserve details time and can be opened for editing', () => {
  const taskRowSource = source.match(/function renderSfTaskRow\(task, options = \{\}\) \{[\s\S]*?\n\}/)?.[0] || '';
  const taskFormSource = source.match(/function renderTaskForm\(companyId, job, task\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(taskRowSource, /data-action="open-contact-task"/);
  assert.match(taskRowSource, /task\.description/);
  assert.match(taskRowSource, /task\.due_time/);
  assert.match(taskRowSource, /data-action="edit-contact-task"/);
  assert.match(taskFormSource, /field\('Due time', 'due_time'/);
  assert.match(source, /async function createContactTask\(contactId, taskInput\)/);
  assert.match(source, /description: clean\.description/);
  assert.match(source, /due_time: clean\.due_time/);
  assert.match(source, /if \(action === 'open-contact-task'\)/);
  assert.match(source, /if \(action === 'edit-contact-task'\)/);
  assert.match(styles, /\.sf-task-meta/);
  assert.match(styles, /\.sf-task-details/);
});

test('native time inputs open their picker when the field is clicked or focused', () => {
  assert.match(source, /queueMicrotask\(bindTimePickerInputs\)/);
  assert.match(source, /function openNativeTimePicker\(input\)/);
  assert.match(source, /function bindTimePickerInputs\(\)/);
  assert.match(source, /input\[type="time"\]:not\(\[data-time-picker-bound\]\)/);
  assert.match(source, /input\.showPicker\(\)/);
  assert.match(source, /addEventListener\('pointerdown'/);
  assert.match(source, /addEventListener\('focus'/);
});

test('supabase contact migration persists crm intake fields', () => {
  assert.match(migration, /alter table public\.contacts/);
  assert.match(migration, /add column if not exists pay_type/);
  assert.match(migration, /add column if not exists roof_system/);
  assert.match(migration, /add column if not exists secondary_roof_system/);
  assert.match(migration, /add column if not exists has_multiple_roof_systems/);
  assert.match(migration, /add column if not exists source/);
});
