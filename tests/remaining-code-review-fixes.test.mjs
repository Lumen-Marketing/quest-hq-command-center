import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const main = read('src/main.js');
const history = read('src/messaging/history-loader.js');
const lazySurfaceError = read('src/ui/lazy-surface-error.js');
const migration = read('supabase/migrations/20260908174615_harden_public_form_submissions.sql');

test('opening a chat pages the complete selected conversation and offers retry', () => {
  assert.match(main, /ensureConversationHistory\(selected\.id\)/);
  assert.match(history, /loadPaginatedDataQuery\([\s\S]*?from\('messages'\)[\s\S]*?eq\('conversation_id', id\)/);
  assert.match(main, /data-action="retry-message-history"/);
  assert.match(main, /state\.messageHistoryLoaded = new Set\(\)/);
});

test('route imports replace failed skeletons with one visible retry path', () => {
  assert.match(main, /function reportLazySurfaceFailure\(/);
  assert.match(lazySurfaceError, /data-action="retry-lazy-surface"/);
  assert.doesNotMatch(main, /\.then\(\(\) => render\(\)\)\.catch\(\(error\) => console\.error\(/);
});

test('public form file intents are private and claimed with the response transaction', () => {
  assert.match(migration, /create table if not exists public\.form_upload_intents/);
  assert.match(migration, /revoke all on table public\.form_upload_intents from public, anon, authenticated/);
  assert.match(migration, /create or replace function public\.submit_public_form_response/);
  assert.match(migration, /insert into public\.form_responses[\s\S]*update public\.form_upload_intents/,
    'the response must exist before its foreign-key-backed intent claim');
  assert.match(migration, /grant execute on function public\.submit_public_form_response[\s\S]*to service_role/);
});
