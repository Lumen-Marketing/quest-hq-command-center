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

test('contact inline editor uses selects for constrained fields', () => {
  const helperSource = source.match(/function contactInlineOptions\(contact, key\) \{[\s\S]*?\n\}/)?.[0] || '';
  const inlineSource = source.match(/function beginContactInlineEdit\(span\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /function contactInlineOptions\(contact, key\)/);
  assert.match(helperSource, /if \(key === 'stage'\) return contactStageNames\(\)\.map/);
  assert.match(helperSource, /if \(key === 'temperature'\) return TEMPERATURES\.map/);
  assert.match(helperSource, /if \(key === 'owner_name'\) return contactOwnerOptions\(contact\.company_id, contact\.owner_name\)/);
  assert.match(inlineSource, /const options = contactInlineOptions\(contact, key\)/);
  assert.match(inlineSource, /document\.createElement\(options\.length \? 'select' : 'input'\)/);
  assert.match(inlineSource, /option\.value = value/);
  assert.match(inlineSource, /input\.addEventListener\('change', commit\)/);
});

test('contacts list uses a Salesforce-style searchable filterable table view', () => {
  const tableSource = source.match(/function renderContactTable\(companyId\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /contactSort: 'name'/);
  assert.match(source, /const CONTACT_SORT_OPTIONS = \[/);
  assert.match(source, /const CONTACT_FILTER_DEFAULTS = /);
  assert.match(source, /function renderContactFilterBar\(companyId\)/);
  assert.match(source, /function contactFilterOptions\(companyId\)/);
  assert.match(source, /function activeContactFilters\(\)/);
  assert.match(source, /function sortedContacts\(contacts\)/);
  assert.match(source, /if \(event\.target\.matches\('\[data-contact-search\]'\)\)/);
  assert.match(source, /if \(event\.target\.matches\('\[data-contact-filter\]'\)\)/);
  assert.match(source, /if \(action === 'set-contact-sort'\)/);
  assert.match(source, /if \(action === 'clear-contact-filters'\)/);
  assert.match(source, /if \(action === 'remove-contact-filter'\)/);
  assert.match(tableSource, /class="panel contact-list-view"/);
  assert.match(tableSource, /All Contacts/);
  assert.match(tableSource, /data-contact-search/);
  assert.match(tableSource, /renderContactFilterBar\(companyId\)/);
  assert.match(tableSource, /data-action="open-contact-form" data-mode="new"/);
  assert.match(tableSource, /data-action="open-stage-manager" data-module="contacts"/);
  assert.match(tableSource, /data-action="set-pipeline-view" data-module="contacts" data-view="table"/);
  assert.match(tableSource, /data-action="set-pipeline-view" data-module="contacts" data-view="board"/);
  assert.match(styles, /\.contact-list-view/);
  assert.match(styles, /\.contact-filter-bar/);
  assert.match(styles, /\.contact-filter-select/);
  assert.match(styles, /\.contact-filter-select\.primed/);
  assert.match(styles, /\.contact-filter-chips/);
  assert.match(styles, /\.contact-header-sort/);
  assert.match(styles, /\.contact-filter-wrap \{[\s\S]*?width: fit-content;/);
  assert.match(styles, /\.contact-filter-select \{[\s\S]*?flex: 0 0 auto;[\s\S]*?max-width: 190px;/);
  assert.match(styles, /@media \(max-width: 720px\) \{[\s\S]*?\.contact-filter-wrap,[\s\S]*?\.contact-filter-bar,[\s\S]*?\.contact-filter-select \{[\s\S]*?width: 100%;/);
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

test('record activity buttons open docked Salesforce-style composer windows', () => {
  assert.match(source, /dockedActivityComposers: \[\]/);
  assert.match(source, /ACTIVITY_COMPOSER_CONFIG/);
  assert.match(source, /function openDockedActivityComposer\(relatedType, relatedId, kind\)/);
  assert.match(source, /function renderDockedActivityComposers\(\)/);
  assert.match(source, /renderDockedActivityComposers\(\)/);
  assert.match(source, /data-action="open-docked-activity"/);
  assert.match(source, /data-action="minimize-docked-activity"/);
  assert.match(source, /data-action="close-docked-activity"/);
  assert.match(source, /data-docked-activity-form/);
  assert.match(source, /submitDockedActivityComposer\(event\.target\)/);
  assert.match(source, /openDockedActivityComposer\(node\.dataset\.relatedType, node\.dataset\.relatedId, node\.dataset\.kind \|\| node\.dataset\.tab\)/);
  assert.match(source, /data-related-type="contact" data-related-id="\$\{h\(contact\.id\)\}"/);
  assert.match(source, /data-related-type="job" data-related-id="\$\{h\(job\.id\)\}"/);
  assert.match(source, /data-related-type="deal" data-related-id="\$\{h\(deal\.id\)\}"/);
  assert.match(styles, /\.activity-dock \{/);
  assert.match(styles, /\.activity-dock-window/);
});

test('record quick create tiles open real workflows instead of placeholder toasts', () => {
  assert.match(source, /const ROOF_ESTIMATE_SYSTEMS = \{/);
  assert.match(source, /function renderEstimateBuilderModal\(companyId\)/);
  assert.match(source, /function openEstimateBuilder\(type, id\)/);
  assert.match(source, /async function saveBuiltEstimate\(form\)/);
  assert.match(source, /data-estimate-builder-form/);
  assert.match(source, /calculateEstimateTotals\(draft\)/);
  assert.match(source, /await persistJob\(\{ \.\.\.job, estimate_total: quoteTotal \}/);
  assert.match(source, /await persistDeal\(\{ \.\.\.deal, value: quoteTotal/);
  assert.match(source, /await persistContact\(\{ \.\.\.contact, value: quoteTotal/);
  assert.doesNotMatch(source, /roofUnderwriterUrl|ROOF_UNDERWRITER_URL|window\.open\(estimateUrl/);
  assert.match(source, /const PROPOSAL_TEMPLATES = \[/);
  assert.match(source, /function renderProposalBuilderModal\(companyId\)/);
  assert.match(source, /function openProposalBuilder\(type, id\)/);
  assert.match(source, /async function saveBuiltProposal\(form\)/);
  assert.match(source, /data-proposal-builder-form/);
  assert.match(source, /await persistDeal\(\{ \.\.\.deal, value: total/);
  assert.match(source, /if \(kind === 'Task' \|\| kind === 'New Task'\) return openDockedActivityComposer\('contact', contactId, 'New Task'\)/);
  assert.match(source, /if \(kind === 'Estimate' \|\| kind === 'New Estimate'\) return openEstimateBuilder\('contact', contactId\)/);
  assert.match(source, /if \(kind === 'Proposal'\) return openProposalBuilder\('contact', contactId\)/);
  assert.match(source, /if \(kind === 'Task' \|\| kind === 'New Task'\) return openDockedActivityComposer\('deal', dealId, 'New Task'\)/);
  assert.match(source, /if \(kind === 'Estimate' \|\| kind === 'New Estimate'\) return openEstimateBuilder\('deal', dealId\)/);
  assert.match(source, /if \(kind === 'Proposal'\) return openProposalBuilder\('deal', dealId\)/);
});

test('docked activity composers use distinct salesforce-style forms by action', () => {
  assert.match(source, /function renderDockedActivityFields\(composer, record, config\)/);
  assert.match(source, /function serializeDockedActivityBody\(composer, formData\)/);
  assert.match(source, /activity-dock-email/);
  assert.match(source, /activity-dock-task/);
  assert.match(source, /activity-dock-event/);
  assert.match(source, /activity-dock-call/);
  assert.match(source, /name="email_to"/);
  assert.match(source, /name="email_body"/);
  assert.match(source, /name="due_date"/);
  assert.match(source, /name="priority"/);
  assert.match(source, /name="event_date"/);
  assert.match(source, /name="start_time"/);
  assert.match(source, /name="call_outcome"/);
  assert.match(source, /name="follow_up"/);
  assert.match(source, /Email body/);
  assert.match(source, /Task details/);
  assert.match(source, /Event notes/);
  assert.match(source, /Call notes/);
  assert.match(styles, /\.activity-dock-grid/);
  assert.match(styles, /\.activity-dock-toolbar/);
  assert.match(styles, /\.activity-dock-checkbox/);
});

test('record open task rows expose an inline delete action', () => {
  assert.match(source, /function renderSfTaskRow\(task, options = \{\}\)/);
  assert.match(source, /data-action="delete-task"/);
  assert.match(source, /data-task-return="\$\{h\(returnMode\)\}"/);
  assert.match(source, /aria-label="Delete task"/);
  assert.match(source, /deleteTask\(node\.dataset\.taskId, \{ stayOnPage: node\.dataset\.taskReturn === 'record' \}\)/);
  assert.match(source, /async function deleteTask\(id, options = \{\}\)/);
  assert.match(source, /if \(options\.stayOnPage\) render\(\);/);
  assert.match(source, /renderSfTaskRow\(t/);
  assert.match(source, /renderSfTaskRow\(task/);
  assert.match(styles, /\.sf-task-delete/);
  assert.match(styles, /\.sf-task-row:hover \.sf-task-delete/);
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
