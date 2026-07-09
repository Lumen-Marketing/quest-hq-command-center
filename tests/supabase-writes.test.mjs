import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const createJobTaskSource = source.slice(source.indexOf('async function createJobTask'), source.indexOf('function jobQuickCreate'));

test('contact saves and task toggles roll back returned Supabase errors', () => {
  assert.match(source, /async function persistContact\(contact\)[\s\S]*const previous = contactById\(contact\.id\)/);
  assert.match(source, /async function persistContact\(contact\)[\s\S]*if \(result\.error\)[\s\S]*upsertContact\(previous\)/);
  assert.match(source, /async function toggleContactTask\(taskId\)[\s\S]*if \(result\.error\)[\s\S]*upsertTask\(task\)/);
});

test('quote conversion never navigates or inserts local data after a failed write', () => {
  assert.match(source, /const \{ ok, data, error \} = await supabaseWrite\('deals', row\);/);
  assert.match(source, /if \(!ok\)[\s\S]*return false;/);
  assert.match(source, /const savedDeal = normalizeDeal\(data \|\| deal\);[\s\S]*upsertDeal\(savedDeal\)/);
});

test('job task creation requires a real authenticated creator and checks insert errors', () => {
  assert.doesNotMatch(createJobTaskSource, /['"]abraham['"]/);
  assert.match(source, /const creatorId = activeSession\(\)\.profile\.member_id \|\| activeSession\(\)\.profile\.id/);
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
