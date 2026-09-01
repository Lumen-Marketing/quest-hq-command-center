import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('assistant instruction parsers stay out of the startup bundle', () => {
  assert.doesNotMatch(source, /^import .*assistant\/(task|contact)-parser\.js/m);
  assert.match(source, /import\('\.\/assistant\/task-parser\.js'\)/);
  assert.match(source, /import\('\.\/assistant\/contact-parser\.js'\)/);
});

test('the command palette waits for and uses the deferred parser modules', () => {
  assert.match(source, /taskInstructionModule = taskInstructions/);
  assert.match(source, /contactInstructionModule = contactInstructions/);
  assert.match(source, /taskInstructionModule\.parseTaskInstruction/);
  assert.match(source, /contactInstructionModule\.parseContactInstruction/);
  assert.match(source, /contactInstructionModule\?\.looksLikeContactInstruction/);
});
