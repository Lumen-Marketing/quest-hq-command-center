import assert from 'node:assert/strict';
import test from 'node:test';
import { HELP_TOPICS, searchHelp } from '../src/assistant/help-index.js';

test('every topic has an id, title, keywords and a non-empty answer', () => {
  const ids = new Set();
  for (const t of HELP_TOPICS) {
    assert.ok(t.id && !ids.has(t.id), `duplicate or missing id: ${t.id}`);
    ids.add(t.id);
    assert.ok(t.title && t.keywords && t.answer);
    assert.ok(t.answer.length > 20, `answer too short for ${t.id}`);
  }
});

test('finds topics by natural phrasing (title or keywords)', () => {
  assert.equal(searchHelp('how do i create a task')[0].id, 'create-task');
  assert.equal(searchHelp('upload a photo')[0].id, 'files');
  assert.equal(searchHelp('clock in')[0].id, 'time');
  assert.equal(searchHelp('send a proposal to sign')[0].id, 'proposals');
  assert.equal(searchHelp('invoice')[0].id, 'finance');
});

test('matches on keywords the title does not contain', () => {
  // "estimate" is only in the quotes topic's keywords, not its title.
  assert.equal(searchHelp('estimate')[0].id, 'quotes');
  // "no-code" only appears in the workspaces keywords.
  assert.equal(searchHelp('no-code app')[0].id, 'workspaces');
});

test('an empty query returns every topic in listed order', () => {
  const all = searchHelp('');
  assert.equal(all.length, HELP_TOPICS.length);
  assert.equal(all[0].id, HELP_TOPICS[0].id);
});

test('a nonsense query returns nothing rather than everything', () => {
  assert.deepEqual(searchHelp('zzzqqq'), []);
});
