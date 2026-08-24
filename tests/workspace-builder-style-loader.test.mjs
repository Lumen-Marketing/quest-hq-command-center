import assert from 'node:assert/strict';
import test from 'node:test';

import { createBuilderStyleLoader } from '../src/workspace/builder-style-loader.js';

test('builder styles load once and become ready only after the stylesheet resolves', async () => {
  let resolveStyles;
  let loads = 0;
  const loader = createBuilderStyleLoader(() => {
    loads += 1;
    return new Promise((resolve) => { resolveStyles = resolve; });
  });

  const first = loader.load();
  const second = loader.load();

  assert.equal(loader.ready, false);
  assert.equal(loads, 1);
  assert.equal(first, second, 'concurrent renders must share the same stylesheet request');

  resolveStyles();
  await first;

  assert.equal(loader.ready, true);
  assert.equal(loader.error, null);
  await loader.load();
  assert.equal(loads, 1, 'a ready route must not request the stylesheet again');
});

test('a failed stylesheet request reports a terminal error and can be retried', async () => {
  const failure = new Error('asset unavailable');
  let loads = 0;
  const loader = createBuilderStyleLoader(() => {
    loads += 1;
    return loads === 1 ? Promise.reject(failure) : Promise.resolve();
  });

  await assert.rejects(loader.load(), failure);
  assert.equal(loader.ready, false);
  assert.equal(loader.error, failure);

  await loader.load();
  assert.equal(loader.ready, true);
  assert.equal(loader.error, null);
  assert.equal(loads, 2);
});
