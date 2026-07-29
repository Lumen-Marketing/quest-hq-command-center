import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const persist = source.match(/async function persistConversation\([\s\S]*?\n\}/)[0];

// Creating a conversation used to fail with "new row violates row-level security
// policy for table message_conversations" for every user, including owners.
//
// The INSERT itself was always allowed. The failure came from reading the row back:
// .select() makes PostgREST emit INSERT ... RETURNING, and Postgres applies the
// SELECT policy (can_access_message_conversation) to the returned row. The
// message_conversation_access rows that make a conversation visible are written on
// the next statement, so at RETURNING time the row is invisible and the whole
// statement is rejected — with an error that reads like a WITH CHECK failure.
test('the conversation insert does not read the row back', () => {
  const insertLine = persist.match(/\.from\('message_conversations'\)\.insert\([^\n]*/)[0];
  assert.doesNotMatch(insertLine, /\.select\(\)/, `insert must not use .select(): ${insertLine}`);
  assert.doesNotMatch(insertLine, /\.single\(\)/, `insert must not use .single(): ${insertLine}`);
});

test('the update path still reads back, and the row is only replaced when it did', () => {
  // Updating an existing conversation is safe: its access rows already exist.
  assert.match(persist, /\.from\('message_conversations'\)\.update\([^\n]*\.select\(\)\.single\(\)/);
  // Guarded, because the insert branch now returns no data.
  assert.match(persist, /if \(conversationResult\.data\) conversation = normalizeMessageConversation\(conversationResult\.data\);/);
});

test('access rows are still written immediately after the conversation', () => {
  // This is what makes the conversation visible; without it the creator could not
  // read back what they just created.
  const convAt = persist.indexOf("from('message_conversations')");
  const accessAt = persist.indexOf("from('message_conversation_access')");
  assert.ok(convAt !== -1 && accessAt !== -1, 'expected both writes in persistConversation');
  assert.ok(accessAt > convAt, 'access rows must be written after the conversation row');
});
