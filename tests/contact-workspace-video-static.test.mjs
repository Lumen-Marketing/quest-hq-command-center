import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202607020945_contact_workspace_intake_fields.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const allMigrations = readdirSync(migrationDir)
  .filter((name) => name.endsWith('.sql'))
  .map((name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'))
  .join('\n');

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
  assert.match(editorSource, /list="contact-source-options"/);
  assert.match(editorSource, /name="has_multiple_roof_systems"/);
  assert.match(editorSource, /field\('Secondary roof system', 'secondary_roof_system'/);
  assert.doesNotMatch(inlineSource, /if \(key === 'source'\) return contactSourceOptions\(contact\.company_id\)/);
});

test('contact locations support google maps autocomplete and pin links', () => {
  const editorSource = source.match(/function renderContactEditor\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  const jobEditorSource = source.match(/function renderJobEditor\(companyId, job\) \{[\s\S]*?\n\}/)?.[0] || '';
  const accountEditorSource = source.match(/function renderAccountEditor\(companyId, account\) \{[\s\S]*?\n\}/)?.[0] || '';
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /function googleMapsPlaceSearchUrl\(address\)/);
  assert.match(source, /function renderAddressLookupField\(label, name, value = '', options = \[\]/);
  assert.match(source, /function beginAddressInlineEdit\(span, value, companyId, commitValue, picker = \{\}\)/);
  assert.match(source, /async function refreshAddressSuggestions\(input\)/);
  assert.match(source, /fetch\(`\/api\/address-suggestions\?q=\$\{encodeURIComponent\(query\)\}`\)/);
  assert.match(source, /function renderAddressSuggestionMenu\(input, suggestions, status = ''\)/);
  assert.match(source, /data-address-options="\$\{h\(JSON\.stringify\(options\)\)\}"/);
  assert.match(source, /const CRM_ADDRESS_SUGGESTIONS = \[/);
  assert.match(source, /Arizona, USA/);
  assert.match(source, /Phoenix, AZ/);
  assert.match(source, /data-address-map-link/);
  assert.match(source, /data-address-lookup-input/);
  assert.match(editorSource, /data-contact-address-form/);
  assert.match(editorSource, /id="qc-contact-map"/);
  assert.match(editorSource, /id="qc-country"/);
  assert.match(editorSource, /id="qc-province"/);
  assert.match(editorSource, /id="qc-city"/);
  assert.match(editorSource, /id="qc-lat"/);
  assert.match(editorSource, /id="qc-lng"/);
  assert.match(source, /function qcLoadCountries\(\)/);
  assert.match(source, /function qcLoadProvinces\(country, preselect\)/);
  assert.match(source, /function qcLoadCities\(preselect\)/);
  assert.match(source, /function qcLoadBarangays\(preselect\)/);
  assert.match(source, /function qcInitMap\(\)/);
  assert.match(source, /function qcReverseGeocode\(lat, lng\)/);
  assert.match(source, /queueMicrotask\(initContactAddressForm\)/);
  assert.match(jobEditorSource, /renderAddressLookupField\('Site address', 'site_address', edit\.site_address/);
  assert.match(accountEditorSource, /renderAddressLookupField\('Address', 'address', edit\.address/);
  assert.match(source, /beginAddressInlineEdit\(span, contact\.location, contact\.company_id/);
  assert.match(source, /beginAddressInlineEdit\(span, job\.site_address, job\.company_id/);
  assert.match(source, /renderAddressLookupField\('Client address', 'client_address', draft\.client\.address/);
  assert.match(source, /const quoteAddress = job\?\.site_address \|\| account\?\.address \|\| contact\?\.location \|\| ''/);
  assert.match(source, /\.closest\('\.address-lookup-field, \.sf-inline-address-editor'\)/);
  assert.match(source, /addEventListener\('pointerdown', \(ev\) => \{\s*if \(link\.getAttribute\('aria-disabled'\) !== 'true'\) ev\.preventDefault\(\);/);
  assert.match(styles, /\.address-pin-button/);
  assert.match(styles, /\.address-suggestions-menu/);
  assert.match(styles, /\.address-suggestion-option/);
  assert.match(styles, /\.sf-inline-address-editor/);
  assert.match(styles, /\.contact-editor \.qc-fieldset/);
  assert.match(styles, /\.contact-editor \.qc-map/);
  assert.match(styles, /\.contact-editor \.qc-address-grid/);
  // Contact location opens the exact-pin map picker via the inline editor (kind: 'contact').
  assert.match(source, /kind: 'contact', id: contactId, field: 'location'/);
  assert.match(source, /<i class="ti ti-map-pin"><\/i><span>Map pin<\/span>/);
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

test('supabase contact migrations persist structured address fields', () => {
  assert.match(allMigrations, /alter table public\.contacts[\s\S]*add column if not exists country_code/);
  assert.match(allMigrations, /add column if not exists country text/);
  assert.match(allMigrations, /add column if not exists province text/);
  assert.match(allMigrations, /add column if not exists city text/);
  assert.match(allMigrations, /add column if not exists barangay text/);
  assert.match(allMigrations, /add column if not exists block_no text/);
  assert.match(allMigrations, /add column if not exists lat text/);
  assert.match(allMigrations, /add column if not exists lng text/);
});
