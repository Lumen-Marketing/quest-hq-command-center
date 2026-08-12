import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { contactUsesRoofFields } from '../src/crm/contact-field-visibility.js';
import { formatCurrencyDraft, parseCurrencyAmount } from '../src/ui/currency-input.js';
import { locationCacheKey, visitorLocation } from '../api/address-suggestions.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8').replace(/\r\n/g, '\n');
const main = read('src', 'main.js');
const jobList = read('src', 'jobs', 'job-list.js');
const jobRecord = read('src', 'crm', 'job-record.js');
const jobEditor = read('src', 'jobs', 'job-editor.js');
const stageManager = read('src', 'pipeline', 'stage-manager-view.js');
const contactEditor = read('src', 'crm', 'contact-editor.js');
const contactRecord = read('src', 'crm', 'contact-record.js');
const platformPanel = read('src', 'platform', 'master-panel.js');
const addressApi = read('api', 'address-suggestions.js');

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} must exist`);
  const tail = source.slice(start + 1);
  const nextMatch = /\n(?:async\s+)?function\s+/.exec(tail);
  const next = nextMatch ? start + 1 + nextMatch.index : source.length;
  return source.slice(start, next);
}

test('required setup opens over the workspace instead of the Setup settings page', () => {
  for (const name of ['registerWorkspace', 'createWorkspaceForCurrentUser']) {
    const body = functionBody(main, name);
    assert.match(body, /openWorkspaceSetupModal\([^)]*required:\s*true/);
    assert.match(body, /companyPath\('workspaces'/);
    assert.doesNotMatch(body, /companyPath\('settings', \{ tab: 'setup' \}/);
  }
});

test('applying survey setup refreshes both plugin layers directly', () => {
  const body = functionBody(main, 'loadCompanySetupPanel');
  assert.match(body, /client\.from\('company_plugins'\).*\.eq\('company_id', companyId\)/s);
  assert.match(body, /client\.from\('workspace_plugins'\).*\.eq\('workspace_id', workspaceId\)/s);
  assert.match(body, /state\.workspacePlugins = mergeWorkspacePlugins\(state\.workspacePlugins\.concat\(workspacePlugins\.data \|\| \[\]\)\)/);
});

test('job client, trade, and stage labels navigate instead of remaining dead text', () => {
  assert.match(jobList, /data-action="jobs-trade-filter"/);
  assert.match(jobList, /contact_id/);
  assert.match(jobList, /tab:\s*'pipeline'.*stage:/s);
  assert.match(jobRecord, /contactById/);
  assert.match(jobRecord, /tab:\s*'list'.*trade:/s);
  assert.match(jobRecord, /tab:\s*'pipeline'.*stage:/s);
  assert.match(jobList, /showCrm && contact\?\.company_id === companyId/);
  assert.match(jobList, /showCrm && account\?\.company_id === companyId/);
  assert.match(jobRecord, /linkedContact\?\.company_id === companyId/);
  assert.match(jobRecord, /linkedAccount\?\.company_id === companyId/);
  assert.match(jobList, /companyPath\('contacts', \{ q: job\.client_name \}/);
  assert.match(jobRecord, /companyPath\('contacts', \{ q: job\.client_name \}/);
  assert.match(functionBody(main, 'renderContactsPage'), /state\.contactQuery = queryParam/);
  assert.match(functionBody(main, 'renderJobBoard'), /companyPath\('jobs', \{ tab: 'pipeline', stage: stage\.name \}/);
  assert.doesNotMatch(functionBody(main, 'renderContactBoard'), /companyPath\('jobs'/);
});

test('pipeline manager exposes an accessible persisted reorder action', () => {
  assert.match(stageManager, /data-action="move-stage"/);
  assert.match(main, /function movePipelineStage\(/);
  assert.match(functionBody(main, 'handleAction'), /action === 'move-stage'/);
});

test('job owner searches known users and money fields use a decimal currency mask', () => {
  assert.match(jobEditor, /ownerField\(edit\.owner_name, companyId\)/);
  assert.match(jobEditor, /currencyField\('Estimate total'/);
  assert.match(jobEditor, /currencyField\('Invoice total'/);
  assert.match(jobEditor, /data-currency-input/);
  assert.match(main, /parseCurrencyAmount/);
});

test('address suggestions use viewer geolocation and do not share a cross-region cache', () => {
  assert.match(addressApi, /x-vercel-ip-latitude/i);
  assert.match(addressApi, /x-vercel-ip-longitude/i);
  assert.match(addressApi, /locationBias/);
  assert.match(addressApi, /viewbox/);
  assert.match(addressApi, /private, max-age=/);
  assert.match(addressApi, /locationCacheKey/);
});

test('roof-only contact fields are conditional on roofing work', () => {
  assert.match(contactEditor, /contactUsesRoofFields/);
  assert.match(contactEditor, /data-contact-roof-fields/);
  assert.match(contactRecord, /contactUsesRoofFields/);
});

test('every approved company gets the green master-account indicator', () => {
  assert.match(platformPanel, /platform-company-card \$\{active \? 'approved'/);
  assert.match(platformPanel, /company-dot \$\{active \? 'approved'/);
});

test('currency mask keeps decimals valid while adding currency and thousands separators', () => {
  assert.equal(formatCurrencyDraft('12000.75'), '$12,000.75');
  assert.equal(formatCurrencyDraft('$1,234.'), '$1,234.');
  assert.equal(parseCurrencyAmount('$12,000.75'), 12000.75);
  assert.equal(parseCurrencyAmount('12.3.4'), 12.34);
});

test('roof fields follow work type but never hide existing roof data', () => {
  assert.equal(contactUsesRoofFields({ title: 'Roofing repair' }), true);
  assert.equal(contactUsesRoofFields({ title: 'Commercial cleaning' }), false);
  assert.equal(contactUsesRoofFields({ title: 'Plumbing', roof_system: 'Tile' }), true);
});

test('location parsing keeps US visitor bias and drops overseas coordinates', () => {
  assert.deepEqual(visitorLocation({ headers: {} }), { city: '', region: '', country: 'us' });
  const phoenix = visitorLocation({ headers: {
    'x-vercel-ip-latitude': '33.4484',
    'x-vercel-ip-longitude': '-112.0740',
    'x-vercel-ip-city': 'Phoenix',
    'x-vercel-ip-country': 'US',
  } });
  assert.equal(phoenix.latitude, 33.4484);
  assert.notEqual(locationCacheKey('Main St', phoenix), locationCacheKey('Main St', { ...phoenix, latitude: 40.71 }));

  assert.deepEqual(visitorLocation({ headers: {
    'x-vercel-ip-latitude': '14.5995',
    'x-vercel-ip-longitude': '120.9842',
    'x-vercel-ip-city': 'Manila',
    'x-vercel-ip-country-region': '00',
    'x-vercel-ip-country': 'PH',
  } }), { city: '', region: '', country: 'us' });
});
