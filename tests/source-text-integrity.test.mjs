import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('JavaScript source files contain no literal NUL bytes', () => {
  for (const relative of ['../src/main.js']) {
    const bytes = readFileSync(new URL(relative, import.meta.url));
    assert.equal(bytes.includes(0), false, `${relative} contains a literal NUL byte`);
  }
});
