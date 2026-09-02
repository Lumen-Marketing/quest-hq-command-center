import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('both PDF rendering paths disable eval and WebAssembly for the strict CSP', async () => {
  const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  const calls = [...source.matchAll(/getDocument\(\{([^}]+)\}\)/g)].map((match) => match[1]);
  assert.equal(calls.length, 2);
  for (const options of calls) {
    assert.match(options, /isEvalSupported:\s*false/);
    assert.match(options, /useWasm:\s*false/);
  }
});
