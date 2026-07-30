import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const contactToQuoteSource = readFileSync(new URL('../src/crm/contact-to-quote.js', import.meta.url), 'utf8');
const createJobTaskSource = source.slice(source.indexOf('async function createJobTask'), source.indexOf('function jobQuickCreate'));

test('contact saves and task toggles roll back returned Supabase errors', () => {
  assert.match(source, /async function persistContact\(contact\)[\s\S]*const previous = contactById\(contact\.id\)/);
  assert.match(source, /async function persistContact\(contact\)[\s\S]*if \(result\.error\)[\s\S]*upsertContact\(previous\)/);
  assert.match(source, /async function toggleContactTask\(taskId\)[\s\S]*if \(result\.error\)[\s\S]*upsertTask\(task\)/);
});

test('live contact-to-quote conversion stops before local updates when the atomic RPC fails', () => {
  const start = contactToQuoteSource.indexOf('export async function runContactToQuote');
  const body = contactToQuoteSource.slice(start);

  assert.match(body, /client\.rpc\('convert_contact_to_quote'/);
  assert.match(body, /if \(result\.error\) \{[\s\S]*notifySyncFailure\(result\.error, 'Quote conversion'\);[\s\S]*return false;[\s\S]*\}/);
  assert.ok(body.indexOf('if (result.error)') < body.indexOf('upsertDeal(savedDeal)'));
  assert.ok(body.indexOf('if (result.error)') < body.indexOf("navigate(companyPath('deals'"));
});

test('job task creation requires a real authenticated creator and checks insert errors', () => {
  assert.doesNotMatch(createJobTaskSource, /['"]abraham['"]/);
  assert.match(createJobTaskSource, /const creatorId = activeTaskCreatorId\(job\.company_id\)/);
  assert.match(source, /if \(!creatorId\)[\s\S]*return false;/);
  assert.match(source, /async function createJobTask[\s\S]*if \(result\.error\)[\s\S]*state\.tasks = previousTasks/);
});

test('file transfers only update local state after the database result succeeds', () => {
  assert.match(source, /async function performFilesTransfer\(\)[\s\S]*const result = isCopy[\s\S]*if \(result\.error\)[\s\S]*continue;/);
});

test('background writes are observed and optimistic notification state can roll back', () => {
  assert.match(source, /settleObserved\([\s\S]*message_reads/);
  assert.match(source, /async function markAllNotificationsRead[\s\S]*const previous = state\.notifications/);
  assert.match(source, /async function openNotification[\s\S]*const previous = state\.notifications/);
});

test('viewer-only workspace comment RPC failures roll back optimistic comments', () => {
  assert.match(source, /async function wbAddItemComment\(\)/);
  assert.match(source, /if \(result\.error\)[\s\S]*item\.comments = item\.comments\.filter/);
  assert.match(source, /async function wbPersistCommentChange/);
});

test('CRM helper writes do not update local state after a rejected live write', () => {
  for (const name of ['saveAccount', 'saveDeal', 'persistDeal', 'persistProposal', 'logActivity', 'persistCrmSite']) {
    const start = source.indexOf(`async function ${name}`);
    const end = source.indexOf('\nasync function ', start + 1);
    const body = source.slice(start, end === -1 ? source.length : end);
    assert.match(body, /if \(!ok\) return false;/, `${name} must stop after a failed write`);
  }
});

test('job persistence rolls back its optimistic state after a rejected write', () => {
  assert.match(source, /async function persistJob\(job[\s\S]*const previous = jobById\(payload\.id\)/);
  assert.match(source, /async function persistJob\(job[\s\S]*if \(!ok\)[\s\S]*upsertJob\(previous\)/);
});

test('job and task forms keep live failures open instead of saving local fallbacks', () => {
  for (const name of ['saveJob', 'saveTask']) {
    const start = source.indexOf(`async function ${name}`);
    const end = source.indexOf('\nasync function ', start + 1);
    const body = source.slice(start, end === -1 ? source.length : end);
    assert.match(body, /if \(isLiveSupabaseSession\(\)\)[\s\S]*notifySyncFailure[\s\S]*return false;/, `${name} must stop on a live failure`);
  }
});

test('contact, quote, and form task creation reject live insert errors', () => {
  for (const name of ['createContactTask', 'createDealTask', 'createTaskFromFormResponse']) {
    const start = source.indexOf(`async function ${name}`);
    const end = source.indexOf('\nasync function ', start + 1);
    const body = source.slice(start, end === -1 ? source.length : end);
    assert.doesNotMatch(body, /['"]abraham['"]/, `${name} must not use a seeded creator`);
    assert.match(body, /if \(result\.error\)[\s\S]*notifySyncFailure[\s\S]*return false;/, `${name} must stop on insert failure`);
  }
});

test('activity form does not close or announce success when its write fails', () => {
  const start = source.indexOf('async function saveActivityForm');
  const end = source.indexOf('\nasync function ', start + 1);
  const body = source.slice(start, end);
  assert.match(body, /const activity = await logActivity/);
  assert.match(body, /if \(!activity\) return false;/);
  assert.ok(body.indexOf('if (!activity) return false;') < body.indexOf("state.modal = '';"));
});

test('quote conversion creates the job and links the deal through one idempotent RPC', () => {
  const start = source.indexOf('async function convertDealToJob');
  const end = source.indexOf('\nfunction ', start + 1);
  const body = source.slice(start, end);
  assert.match(body, /client\.rpc\('convert_deal_to_job'/);
  assert.doesNotMatch(body, /supabaseWrite\('jobs'/);
  assert.doesNotMatch(body, /supabaseWrite\('deals'/);
  assert.match(body, /result\.data\?\.job/);
  assert.match(body, /result\.data\?\.deal/);
  assert.match(body, /conversionCreated = result\.data\?\.created !== false/);
});
