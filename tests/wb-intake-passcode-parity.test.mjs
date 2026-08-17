import assert from 'node:assert/strict';
import test from 'node:test';
import * as server from '../api/_lib/intake.js';
import * as client from '../src/intake/passcode.js';

// The client derives the hash; the server verifies it. Nothing in the application can notice
// them drifting apart -- a mismatch reads to the user as "that passcode is not right", on every
// attempt, for ever. So the two are pinned against each other here.
//
// Node 20+ has webcrypto on globalThis.crypto, which is the same API the browser module uses,
// so src/intake/passcode.js runs unmodified under the test runner.

test('the browser and the server agree on the parameters', () => {
  assert.equal(client.PASSCODE_ITERATIONS, server.PASSCODE_ITERATIONS);
  assert.equal(client.PASSCODE_ALPHABET, server.PASSCODE_ALPHABET);
  assert.equal(client.PASSCODE_LENGTH, server.PASSCODE_LENGTH);
});

test('they normalize a typed passcode identically', () => {
  for (const input of [' ab2-cd3 ', 'AB2CD3', 'a b 2 c d 3', 'Ab2Cd3!!']) {
    assert.equal(client.normalizePasscode(input), server.normalizePasscode(input), `differed on "${input}"`);
  }
});

test('a hash made in the browser verifies on the server', async () => {
  const salt = client.makePasscodeSalt();
  const passcode = client.generatePasscode();
  const hash = await client.hashPasscode(passcode, salt);

  assert.equal(hash, server.hashPasscode(passcode, salt), 'the two implementations disagree');
  assert.ok(server.verifyPasscode(passcode, salt, hash), 'the server rejected a browser-made hash');
  // And the case-insensitivity survives the round trip, which is the whole point of normalizing.
  assert.ok(server.verifyPasscode(passcode.toLowerCase(), salt, hash));
  assert.ok(!server.verifyPasscode(server.generatePasscode(), salt, hash));
});

test('a server salt and a browser salt are the same shape', () => {
  assert.match(client.makePasscodeSalt(), /^[0-9a-f]{32}$/);
  assert.match(server.makePasscodeSalt(), /^[0-9a-f]{32}$/);
});

test('a browser token is the same shape as a server one', () => {
  for (const token of [client.generateToken(), server.generateToken()]) {
    assert.match(token, /^[A-Za-z0-9_-]+$/);
    assert.ok(token.length >= 40, 'a short token is a guessable token');
  }
  assert.notEqual(client.generateToken(), client.generateToken());
});

test('both halves offer the same fillable field types', async () => {
  // The config panel says "N of this app's fields" and lists them; the server decides which
  // ones actually cross. A type offered here but refused there produces a link whose fields
  // silently never appear, which reads as the app being broken.
  const manage = await import('../src/intake/manage.js');
  assert.deepEqual(
    [...manage.INTAKE_FIELD_TYPES].sort(),
    [...server.INTAKE_FIELD_TYPES].sort(),
    'the config panel and the server disagree about what a stranger may fill',
  );
});

test('the count the panel promises is the count the server would send', async () => {
  const manage = await import('../src/intake/manage.js');
  const app = {
    fields: [
      { id: 'a', label: 'Name', type: 'text' },
      { id: 'b', label: 'Contact', type: 'company_contact' },
      { id: 'c', label: 'Total', type: 'calculation' },
      { id: 'd', label: 'Secret', type: 'text', hidden: true },
      { id: 'e', label: 'When', type: 'date' },
    ],
  };
  assert.deepEqual(
    manage.fillableFields(app).map((f) => f.id),
    server.publicFields(app).map((f) => f.id),
  );
});

test('the browser passcode uses the same unbiased alphabet', () => {
  const counts = new Map();
  for (let i = 0; i < 2000; i += 1) {
    for (const ch of client.generatePasscode()) counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  assert.equal(counts.size, client.PASSCODE_ALPHABET.length, 'some characters never appear');
  const expected = (2000 * client.PASSCODE_LENGTH) / client.PASSCODE_ALPHABET.length;
  assert.ok(Math.max(...counts.values()) < expected * 1.4);
  assert.ok(Math.min(...counts.values()) > expected * 0.6);
});
