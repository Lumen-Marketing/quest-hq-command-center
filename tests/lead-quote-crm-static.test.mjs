import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

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
