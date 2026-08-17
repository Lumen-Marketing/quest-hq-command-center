import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// `await wbSave(...)` has to actually wait.
//
// It used to start each write and return nothing, so the four callers written as
// `await wbSave(...)` awaited `undefined` and carried straight on. Two of them are the button
// push, where the safety of a MOVE is entirely the ordering — the record leaves this app only
// once the target has been saved. It did not: the removal raced the write. And a record pushed
// just before a realtime refresh could be reloaded away before its save landed, which is what
// made a send take two or three presses to stick.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};

/** wbSave, with its four dependencies stubbed. `writes` records the order things happened. */
function build({ companies = ['co1'], fail = '' } = {}) {
  const order = [];
  let settle = [];
  // eslint-disable-next-line no-unused-vars
  const wbInvalidateAppIndex = () => order.push('invalidate');
  // eslint-disable-next-line no-unused-vars
  const canonicalCompanyId = (id) => id || 'co1';
  // eslint-disable-next-line no-unused-vars
  const wbDoc = () => ({});
  // eslint-disable-next-line no-unused-vars
  const companiesToSave = () => companies;
  // eslint-disable-next-line no-unused-vars
  const saveWorkspaceBuilderDoc = (id) => new Promise((resolve, reject) => {
    order.push(`start:${id}`);
    settle.push(() => {
      order.push(`done:${id}`);
      if (id === fail) reject(new Error('refused')); else resolve();
    });
  });
  // eslint-disable-next-line no-eval
  const wbSave = eval(`(${cut('wbSave')})`);
  return { wbSave, order, flush: () => { const s = settle; settle = []; s.forEach((fn) => fn()); } };
}

test('wbSave returns something awaitable', () => {
  const { wbSave, flush } = build();
  const out = wbSave('co1');
  assert.ok(out && typeof out.then === 'function', 'await wbSave(...) resolves instantly');
  flush();
  return out;
});

test('awaiting it waits for the write to land', async () => {
  const { wbSave, order, flush } = build();
  let after = false;
  const done = wbSave('co1').then(() => { after = true; order.push('caller resumed'); });
  // Nothing has settled yet, so the caller must still be parked.
  await Promise.resolve();
  assert.equal(after, false, 'the caller carried on while the write was still in flight');
  flush();
  await done;
  assert.deepEqual(order, ['invalidate', 'start:co1', 'done:co1', 'caller resumed']);
});

test('it waits for every company it writes, not just the first', async () => {
  // A linked app lives in another company's doc; both are written.
  const { wbSave, order, flush } = build({ companies: ['co1', 'co2'] });
  const done = wbSave('co1');
  flush();
  await done;
  assert.deepEqual(order.filter((x) => x.startsWith('done')), ['done:co1', 'done:co2']);
});

test('a refused write does not become an unhandled rejection', async () => {
  // Every caller but four ignores the return value entirely.
  const { wbSave, flush } = build({ fail: 'co1' });
  const out = wbSave('co1');
  flush();
  await assert.doesNotReject(() => out);
});

test('the push awaits it everywhere the ordering matters', () => {
  // A move removes the record from here only after the target has been saved. That is only
  // true if the save is awaited.
  const push = readFileSync(join(root, 'src', 'workspace', 'button-push.js'), 'utf8');
  const awaited = (push.match(/await wbSave\(/g) || []).length;
  const total = (push.match(/[^.]wbSave\(/g) || []).length;
  assert.equal(awaited, total, `${total - awaited} wbSave call(s) in the push are not awaited`);
});
