import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function functionSource(name, nextName) {
  const start = main.indexOf(`async function ${name}(`);
  const end = nextName ? main.indexOf(`function ${nextName}(`, start + 1) : -1;
  assert.ok(start >= 0, `${name} must exist`);
  assert.ok(end > start, `${name} must end before ${nextName}`);
  return main.slice(start, end);
}

test('live automation saves update local state only after the server confirms the row', () => {
  const source = functionSource('saveAutomation', 'toggleAutomation');
  const write = source.indexOf("await client.from('automations').upsert(");
  const localCommit = source.indexOf('upsertAutomation(savedRule);');

  assert.ok(write >= 0, 'save must await the live upsert');
  assert.ok(localCommit > write, 'local automation state must be committed after the live upsert');
  assert.match(source, /if \(!result\.data\) throw new Error\('Automation save returned no record\.'\)/);
});

test('live automation deletes verify a returned row before removing local state', () => {
  const source = functionSource('deleteAutomation', 'renderKnowledgeArticleForm');
  const write = source.indexOf("await client.from('automations').delete()");
  const localCommit = source.indexOf('state.automations = state.automations.filter');

  assert.ok(write >= 0, 'delete must await the live request');
  assert.match(source, /\.eq\('company_id', companyId\)\.select\('id'\)\.single\(\)/);
  assert.ok(localCommit > write, 'local automation state must be removed after the live delete');
  assert.match(source, /result\.data\?\.id/);
});
