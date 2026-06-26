import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('crm navigation uses contacts quotes and production funnels', () => {
  assert.match(source, /\{ id: 'contacts', group: 'Contacts · Top of Funnel', label: 'Contacts'/);
  assert.match(source, /\{ id: 'deals', group: 'Quotes · Bottom of Funnel', label: 'Quotes'/);
  assert.match(source, /\{ id: 'jobs', group: 'Production', label: 'Jobs'/);
  assert.match(source, /\{ label: 'Contacts · Top of Funnel', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Quotes · Bottom of Funnel', ids: \['deals'\] \}/);
});

test('contact and quote funnels match the provided crm model', () => {
  assert.match(source, /const DEFAULT_CONTACT_STAGES = \[\s*\{ name: 'Prospects'/);
  assert.match(source, /\{ name: 'Leads', color:/);
  assert.match(source, /\{ name: 'Nurturing', color:/);
  assert.match(source, /const CRM2_DEAL_STAGES = \[\s*\{ name: 'Underwriting'/);
  assert.match(source, /\{ name: 'Estimate Sent', color:/);
  assert.match(source, /\{ name: 'Contract Sent', color:/);
  assert.match(source, /\{ name: 'Waiting to Sign', color:/);
  assert.match(source, /\{ name: 'Won', color:/);
});

test('crm 1 and crm 2 use separate quote and job stage models', () => {
  assert.match(source, /const CRM1_DEAL_STAGES = \[\s*\{ name: 'Prospect'/);
  assert.match(source, /\{ name: 'Qualified', color:/);
  assert.match(source, /\{ name: 'Proposal sent', color:/);
  assert.match(source, /\{ name: 'Verbal commit', color:/);
  assert.match(source, /\{ name: 'Lost', color:/);
  assert.match(source, /const CRM2_JOB_STAGES = \[\s*\{ name: 'Unscheduled'/);
  assert.match(source, /\{ name: 'Scheduled', color:/);
  assert.match(source, /\{ name: 'Material Ordered', color:/);
  assert.match(source, /\{ name: 'In Production', color:/);
  assert.doesNotMatch(source.match(/const CRM2_JOB_STAGES = \[[\s\S]*?\];/)?.[0] || '', /QC \/ punch list|Invoiced|Paid \/ closed|On hold/);
  assert.match(source, /function activeCrmPluginId\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /function pipelineStages\(kind, companyId = activeCompanyId\(\)\)/);
  assert.match(source, /if \(activeCrmPluginId\(companyId\) === 'crm_2'\)/);
});

test('record detail routes read as contacts and quotes', () => {
  assert.match(source, /All Contacts <span class="sf-tab-kind">\| Contacts<\/span>/);
  assert.match(source, /\$\{h\(contact\.name\)\} <span class="sf-tab-kind">\| Contact<\/span>/);
  assert.match(source, /<div class="sf-record-label">Contact<\/div>/);
  assert.match(source, /All Quotes <span class="sf-tab-kind">\| Quotes<\/span>/);
  assert.match(source, /\$\{h\(deal\.name\)\} <span class="sf-tab-kind">\| Quote<\/span>/);
  assert.match(source, /<div class="sf-record-label">Quote<\/div>/);
  assert.match(source, /Convert to Job/);
});

test('nurturing contact records expose a stage-level graduate to quote action', () => {
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(recordSource, /const canGraduateContactToQuote = resolvePipelineStage\('contacts', contact\.stage, companyId\) === 'Nurturing'/);
  assert.match(recordSource, /canGraduateContactToQuote \? `<button class="sf-mark-btn sf-graduate-btn" type="button" data-action="contact-convert-quote"/);
  assert.match(recordSource, /Graduate to Quote/);
  assert.doesNotMatch(recordSource, /data-action="contact-convert-job"/);
  assert.doesNotMatch(recordSource, /Graduate to Job/);
});

test('contacts graduate into quotes before quotes graduate to unscheduled jobs', () => {
  const contactConverter = source.match(/async function convertContactToQuote\(contactId\) \{[\s\S]*?\n\}/)?.[0] || '';
  const quoteConverter = source.match(/async function convertDealToJob\(dealId\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /async function convertContactToQuote\(contactId\)/);
  assert.doesNotMatch(source, /async function convertContactToJob\(contactId\)/);
  assert.match(source, /data-action="contact-convert-quote"/);
  assert.match(source, /if \(action === 'contact-convert-quote'\)/);
  assert.doesNotMatch(source, /contact-convert-job/);
  assert.match(contactConverter, /stage: pipelineStages\('deals', companyId\)\[0\]\?\.name \|\| dealStageNames\(\)\[0\]/);
  assert.match(contactConverter, /primary_contact_id: contact\.id/);
  assert.match(quoteConverter, /stage: pipelineStages\('jobs', companyId\)\[0\]\?\.name \|\| jobStageNames\(\)\[0\]/);
});

test('graduate action remains visible in compact contact record layouts', () => {
  assert.match(styles, /\.sf-mark-btn \{ display: none; \}/);
  assert.match(styles, /\.sf-graduate-btn \{ display: inline-flex; \}/);
});

test('contact entry formats phone, suggests addresses, links maps, and selects owners from members', () => {
  const editorSource = source.match(/function renderContactEditor\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /function formatPhoneNumber\(value\)/);
  assert.match(source, /phone: formatPhoneNumber\(input\.phone\)/);
  assert.match(source, /if \(key === 'phone'\) value = formatPhoneNumber\(raw\);/);
  assert.match(source, /function contactAddressOptions\(companyId\)/);
  assert.match(source, /function contactOwnerOptions\(companyId, selectedOwner = ''\)/);
  assert.match(source, /function mapsSearchUrl\(address\)/);
  assert.match(editorSource, /autocomplete="tel"/);
  assert.match(editorSource, /list="contact-address-options"/);
  assert.match(editorSource, /<datalist id="contact-address-options">/);
  assert.match(editorSource, /selectField\('Owner', 'owner_name', edit\.owner_name, contactOwnerOptions\(companyId, edit\.owner_name\)\)/);
  assert.match(recordSource, /mapsSearchUrl\(contact\.location\)/);
  assert.match(recordSource, /<i class="ti ti-map-pin"><\/i>Map/);
});

test('contact record pencils edit only the clicked field value', () => {
  const recordSource = source.match(/function renderContactRecord\(companyId, contact\) \{[\s\S]*?\n\}/)?.[0] || '';
  const inlineSource = source.match(/function beginContactInlineEdit\(span\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(recordSource, /data-action="open-contact-form" data-mode="edit" data-contact-id="\$\{h\(contact\.id\)\}" aria-label="Edit \$\{h\(label\)\}"/);
  assert.match(recordSource, /fieldRow\('Phone', ed\('phone'\), 'phone'\)/);
  assert.match(recordSource, /fieldRow\('Email', ed\('email', \{ blue: true \}\), 'email'\)/);
  assert.match(recordSource, /fieldRow\('Location'[\s\S]*'location'\)/);
  assert.match(recordSource, /fieldRow\('Owner', ed\('owner_name', \{ blue: true \}\), 'owner_name'\)/);
  assert.match(recordSource, /fieldRow\('Source', ed\('source'\), 'source'\)/);
  assert.match(recordSource, /fieldRow\('Stage', ed\('stage'\), 'stage'\)/);
  assert.match(recordSource, /fieldRow\('Pay Type', ed\('pay_type'\), 'pay_type'\)/);
  assert.match(recordSource, /fieldRow\('Roof System', ed\('roof_system'\), 'roof_system'\)/);
  ['title', 'value', 'temperature'].forEach((key) => assert.match(recordSource, new RegExp(`data-contact-edit="${key}"`)));
  assert.match(inlineSource, /closest\('\.sf-field'\)/);
  assert.match(inlineSource, /\.sf-field-value \[data-contact-edit\]/);
});

test('contacts list uses a Salesforce-style searchable sortable table view', () => {
  const tableSource = source.match(/function renderContactTable\(companyId\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /contactSort: 'name'/);
  assert.match(source, /const CONTACT_SORT_OPTIONS = \[/);
  assert.match(source, /function sortedContacts\(contacts\)/);
  assert.match(source, /if \(event\.target\.matches\('\[data-contact-search\]'\)\)/);
  assert.match(source, /if \(action === 'set-contact-sort'\)/);
  assert.match(tableSource, /class="panel contact-list-view"/);
  assert.match(tableSource, /All Contacts/);
  assert.match(tableSource, /data-contact-search/);
  assert.match(tableSource, /data-action="set-contact-sort"/);
  assert.match(tableSource, /data-sort="\$\{h\(option\.id\)\}"/);
  assert.match(tableSource, /data-action="open-contact-form" data-mode="new"/);
  assert.match(tableSource, /data-action="open-stage-manager" data-module="contacts"/);
  assert.match(tableSource, /data-action="set-pipeline-view" data-module="contacts" data-view="table"/);
  assert.match(tableSource, /data-action="set-pipeline-view" data-module="contacts" data-view="board"/);
  assert.match(styles, /\.contact-list-view/);
  assert.match(styles, /\.contact-list-sort/);
  assert.match(styles, /\.contact-header-sort/);
});

test('record activity feeds expose a usable filter bar', () => {
  assert.match(source, /ACTIVITY_FILTER_OPTIONS/);
  assert.match(source, /activityFilter: 'all'/);
  assert.match(source, /function renderActivityFilterBar\(totalCount, visibleCount\)/);
  assert.match(source, /function filteredActivitiesFor\(relatedType, relatedId\)/);
  assert.match(source, /data-action="set-activity-filter"/);
  assert.match(source, /data-filter="\$\{h\(filter\.id\)\}"/);
  assert.match(source, /state\.activityFilter = node\.dataset\.filter \|\| 'all'/);
  assert.match(source, /renderActivityFilterBar\(totalFeed\.length, feed\.length\)/);
  assert.doesNotMatch(source, /Filters: Within 2 months/);
  assert.doesNotMatch(source, /Filters: This job - All activities - All types/);
});

test('account record tabs use contacts and quotes language', () => {
  assert.doesNotMatch(source, /\['deals', 'Deals'/);
  assert.match(source, /\['contacts', 'Contacts', contacts\.length\]/);
  assert.match(source, /\['deals', 'Quotes', deals\.length\]/);
});

test('messages remains a visible communication section', () => {
  assert.match(source, /\{ id: 'messages', group: 'Communication', label: 'Messages'/);
  assert.match(source, /\{ label: 'Communication', ids: \['messages', 'calendar'\] \}/);
  assert.doesNotMatch(source, /\{ id: 'messages', group: 'Company', label: 'Inbox'/);
});
