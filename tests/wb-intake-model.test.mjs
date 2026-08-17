import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INTAKE_FIELD_TYPES,
  IntakeValueError,
  PASSCODE_ALPHABET,
  PASSCODE_LENGTH,
  cleanIntakeValues,
  generatePasscode,
  generateToken,
  hashPasscode,
  linkUnavailableReason,
  lockedReason,
  makePasscodeSalt,
  normalizePasscode,
  publicFields,
  verifyPasscode,
} from '../api/_lib/intake.js';

// ---- the secret ------------------------------------------------------------------------------

test('a passcode is six characters a human can read off a screen', () => {
  const code = generatePasscode();
  assert.equal(code.length, PASSCODE_LENGTH);
  assert.match(code, new RegExp(`^[${PASSCODE_ALPHABET}]+$`));
  // The five characters that get mistyped when somebody reads a code aloud.
  for (const ambiguous of ['0', 'O', '1', 'I', 'L']) {
    assert.ok(!PASSCODE_ALPHABET.includes(ambiguous), `${ambiguous} is in the alphabet`);
  }
});

test('the passcode alphabet is not biased by the sampling', () => {
  // `randomByte % 31` would make the first few letters ~13% more likely than the last.
  // 4,000 codes is enough to see that at a glance if it were happening.
  const counts = new Map();
  for (let i = 0; i < 4000; i += 1) {
    for (const ch of generatePasscode()) counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  assert.equal(counts.size, PASSCODE_ALPHABET.length, 'some characters never appear');
  const values = [...counts.values()];
  const expected = (4000 * PASSCODE_LENGTH) / PASSCODE_ALPHABET.length;
  assert.ok(Math.max(...values) < expected * 1.35, 'one character is over-represented');
  assert.ok(Math.min(...values) > expected * 0.65, 'one character is under-represented');
});

test('a token is long, unique and safe in a URL', () => {
  const a = generateToken();
  assert.ok(a.length >= 40, 'a short token is a guessable token');
  assert.match(a, /^[A-Za-z0-9_-]+$/, 'must survive being pasted into a text message');
  assert.notEqual(a, generateToken());
});

test('a passcode is checked case- and space-insensitively, because it is typed by hand', () => {
  const salt = makePasscodeSalt();
  const hash = hashPasscode('AB2CD3', salt);
  assert.ok(verifyPasscode('ab2cd3', salt, hash));
  assert.ok(verifyPasscode(' AB2 CD3 ', salt, hash));
  assert.ok(!verifyPasscode('AB2CD4', salt, hash));
  assert.equal(normalizePasscode(' ab2-cd3 '), 'AB2CD3');
});

test('the passcode itself is never recoverable, and a corrupt hash refuses rather than throws', () => {
  const salt = makePasscodeSalt();
  const hash = hashPasscode('AB2CD3', salt);
  assert.ok(!hash.includes('AB2CD3'));
  assert.notEqual(hash, hashPasscode('AB2CD3', makePasscodeSalt()), 'the salt must matter');
  // A truncated, empty or non-hex stored hash reads as "wrong", never as a 500 and never as true.
  for (const broken of ['', 'not-hex', 'ab', null, undefined]) {
    assert.equal(verifyPasscode('AB2CD3', salt, broken), false, `${broken} should refuse`);
  }
});

// ---- which fields cross ------------------------------------------------------------------------

const app = {
  name: 'Prospects',
  fields: [
    { id: 'f1', label: 'Prospect', type: 'text', required: true, config: { placeholder: '58th Pl' } },
    { id: 'f2', label: 'Phone', type: 'phone', config: {} },
    { id: 'f3', label: 'Source', type: 'category', config: { options: [{ id: 'o1', label: 'Referral', color: '#16a34a' }] } },
    { id: 'f4', label: 'Contact', type: 'company_contact', config: {} },
    { id: 'f5', label: 'Drip progress', type: 'progress', config: { source: 'f9' } },
    { id: 'f6', label: 'Promote', type: 'button', config: { action: 'move' } },
    { id: 'f7', label: 'Created', type: 'created_time', config: {} },
    { id: 'f8', label: 'Hidden note', type: 'text', hidden: true, config: {} },
    { id: 'f9', label: 'Something to bid', type: 'checkbox', config: {} },
  ],
};

test('only field types a stranger can meaningfully fill are offered', () => {
  const ids = publicFields(app).map((f) => f.id);
  assert.deepEqual(ids, ['f1', 'f2', 'f3', 'f9']);
  // Each exclusion for its own reason, and each one matters:
  assert.ok(!ids.includes('f4'), 'company_contact would let a stranger write the company directory');
  assert.ok(!ids.includes('f5'), 'a sourced progress value is overwritten on the next render');
  assert.ok(!ids.includes('f6'), 'a button is an action, not a value');
  assert.ok(!ids.includes('f7'), 'an automatic field discards whatever is written to it');
  assert.ok(!ids.includes('f8'), 'a hidden field is hidden');
  for (const type of ['calculation', 'rollup', 'autonumber', 'updated_time', 'file', 'image', 'sheet', 'user', 'relationship', 'checklist']) {
    assert.ok(!INTAKE_FIELD_TYPES.has(type), `${type} must not be fillable by the public`);
  }
});

test('a link can expose a subset, and an unknown id in that subset adds nothing', () => {
  assert.deepEqual(publicFields(app, ['f1', 'f3']).map((f) => f.id), ['f1', 'f3']);
  assert.deepEqual(publicFields(app, ['f1', 'nope']).map((f) => f.id), ['f1']);
  assert.deepEqual(publicFields(app, []).map((f) => f.id), ['f1', 'f2', 'f3', 'f9'], 'empty means every fillable field');
});

test('a field crosses as a projection, not as itself', () => {
  // config carries copy rules, sources and other internals. A stranger gets the label, the
  // type and the choices, and nothing else.
  const source = publicFields(app).find((f) => f.id === 'f3');
  assert.deepEqual(Object.keys(source).sort(), ['currency', 'id', 'label', 'options', 'placeholder', 'required', 'type', 'unit']);
  assert.deepEqual(source.options, [{ id: 'o1', label: 'Referral', color: '#16a34a' }]);
  const progressLeak = publicFields(app).find((f) => f.config);
  assert.equal(progressLeak, undefined, 'no field carries its raw config across');
});

// ---- what comes back ---------------------------------------------------------------------------

const fields = publicFields(app);
const clean = (values) => cleanIntakeValues(values, fields);

test('a good submission is kept as typed', () => {
  assert.deepEqual(clean({ f1: 'Henderson', f2: '555 123 4567', f3: 'o1', f9: true }), {
    f1: 'Henderson', f2: '555 123 4567', f3: 'o1', f9: true,
  });
});

test('a required field cannot be left out, and false is a real answer', () => {
  assert.throws(() => clean({ f2: '555' }), IntakeValueError);
  assert.throws(() => clean({ f1: '   ' }), IntakeValueError, 'whitespace is not an answer');
  // `false` is falsy but it is what an unticked box MEANS, so it must survive the empty check.
  assert.deepEqual(clean({ f1: 'x', f9: false }), { f1: 'x', f9: false });
});

test('a field the link does not expose is refused, not silently dropped', () => {
  // Silently dropping it hides the interesting case: somebody probing for the fields that were
  // deliberately withheld.
  assert.throws(() => clean({ f1: 'x', f4: 'contact-1' }), IntakeValueError);
  assert.throws(() => clean({ f1: 'x', 'constructor': 'x' }), IntakeValueError);
  assert.throws(() => cleanIntakeValues({ f2: 'x' }, publicFields(app, ['f1'])), IntakeValueError);
});

test('a choice must be one this field already offers', () => {
  // Otherwise one anonymous submission mints an option every member of the workspace is then
  // stuck with in that dropdown for ever.
  assert.throws(() => clean({ f1: 'x', f3: 'o-invented' }), IntakeValueError);
  assert.throws(() => clean({ f1: 'x', f3: 'Referral' }), IntakeValueError, 'the label is not the id');
});

test('numbers, dates, emails and ratings are checked rather than stored as typed', () => {
  const numeric = publicFields({ fields: [
    { id: 'n', label: 'Est. value', type: 'money', config: {} },
    { id: 'd', label: 'Revisit on', type: 'date', config: {} },
    { id: 'e', label: 'Email', type: 'email', config: {} },
    { id: 'r', label: 'Interest', type: 'rating', config: {} },
  ] });
  const run = (v) => cleanIntakeValues(v, numeric);
  assert.deepEqual(run({ n: '65,000' }), { n: 65000 }, 'a typed thousands separator is not a failure');
  assert.throws(() => run({ n: 'lots' }), IntakeValueError);
  assert.deepEqual(run({ d: '2026-08-17' }), { d: '2026-08-17' });
  assert.throws(() => run({ d: '17/08/2026' }), IntakeValueError);
  assert.throws(() => run({ d: '2026-13-45' }), IntakeValueError);
  assert.deepEqual(run({ e: 'a@b.co' }), { e: 'a@b.co' });
  assert.throws(() => run({ e: 'not-an-email' }), IntakeValueError);
  assert.throws(() => run({ r: 9 }), IntakeValueError, 'a rating is 0-5');
});

test('long input is cut rather than stored whole', () => {
  const long = publicFields({ fields: [
    { id: 't', label: 'Notes', type: 'textarea', config: {} },
    { id: 's', label: 'Name', type: 'text', config: {} },
  ] });
  assert.equal(cleanIntakeValues({ t: 'x'.repeat(50000) }, long).t.length, 10000);
  assert.equal(cleanIntakeValues({ s: 'x'.repeat(5000) }, long).s.length, 1000);
});

// ---- whether the link works at all ---------------------------------------------------------------

test('a link stops working when it is meant to', () => {
  const base = { status: 'active', submission_count: 0, max_submissions: null, expires_at: null };
  const now = new Date('2026-08-17T12:00:00Z');
  assert.equal(linkUnavailableReason(base, now), '');
  assert.match(linkUnavailableReason(null, now), /not found/);
  assert.match(linkUnavailableReason({ ...base, status: 'paused' }, now), /paused/);
  assert.match(linkUnavailableReason({ ...base, expires_at: '2026-08-16T12:00:00Z' }, now), /expired/);
  assert.equal(linkUnavailableReason({ ...base, expires_at: '2026-08-18T12:00:00Z' }, now), '');
  assert.match(linkUnavailableReason({ ...base, max_submissions: 1, submission_count: 1 }, now), /already/);
  assert.equal(linkUnavailableReason({ ...base, max_submissions: 2, submission_count: 1 }, now), '');
});

test('a lockout expires rather than being permanent', () => {
  const now = new Date('2026-08-17T12:00:00Z');
  assert.match(lockedReason({ locked_until: '2026-08-17T12:05:00Z' }, now), /Too many/);
  assert.equal(lockedReason({ locked_until: '2026-08-17T11:55:00Z' }, now), '');
  assert.equal(lockedReason({ locked_until: null }, now), '');
});
