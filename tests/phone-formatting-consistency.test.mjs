import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "when I'm typing out the phone numbers, it's not automatically making the dashes or the
// hyphens in between the phone number."

// The dashes only ever appear at 10 digits, so typing fewer shows nothing -- that part is
// correct. What was actually reported is that the same number was formatted on some screens and
// raw on others: the vendor phone, the job's Contact box, the account phone and the draft phone
// stored exactly what was typed, while the newer workspace and contact forms formatted live.
// A marker attribute is what separated them, and four boxes never got the marker.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

const between = (start, end) => {
  const at = main.indexOf(start);
  assert.notEqual(at, -1, `${start} not found`);
  const to = main.indexOf(end, at);
  assert.notEqual(to, -1, `${end} not found after ${start}`);
  return main.slice(at, to);
};

// The formatter itself is unchanged behaviour: 10 digits, or 11 starting with 1, and anything
// else is left alone because there is no number to reformat.
const format = (value) => {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
};

test('dashes appear only once there are ten digits to split', () => {
  assert.equal(format('602'), '602', 'nothing to reformat yet');
  assert.equal(format('602555'), '602555', 'still short');
  assert.equal(format('6025550198'), '602-555-0198');
  assert.equal(format('16025550198'), '602-555-0198', 'a leading 1 is dropped');
  assert.equal(format('(602) 555-0198'), '602-555-0198', 'parentheses are normalized away');
});

test('extensions and international numbers are left exactly as typed', () => {
  // Reformatting these would break them, which is why formatPhoneNumber returns the input
  // unchanged rather than forcing a US shape onto everything.
  assert.equal(format('602-555-0198 x214'), '602-555-0198 x214');
  assert.equal(format('+639171234567'), '+639171234567');
  assert.equal(format('555-0198'), '555-0198', 'too short to be a number yet');
  assert.equal(format('call the office'), 'call the office', 'not a number at all');
});

test('the four phone boxes that never formatted are now covered by shape, not by a marker', () => {
  // Each of these renders a phone input that carries no data-phone-format attribute, which is
  // exactly why they stored the number raw.
  const untagged = [
    { where: "job Contact box", marker: '<input type="hidden" name="contact_id"' },
    { where: 'vendor phone', marker: "field('Phone', 'phone', edit.phone)" },
    { where: 'account phone', marker: "field('Phone', 'phone', edit.phone)" },
    { where: 'draft phone', marker: '<input type="tel" name="phone" value="${h(draft.phone)}" autocomplete="off" />' },
    { where: 'quick-add tile phone', marker: 'data-wb-contactadd-phone type="tel"' },
  ];
  for (const { where, marker } of untagged) {
    assert.ok(main.includes(marker), `${where} should still be here: ${marker}`);
  }

  // ...and the delegated listener reaches them by looking at the field, not the attribute.
  const guard = between('function isPhoneInput(el)', 'function onDocumentFocusOut');
  assert.match(guard, /el\.type === 'tel'/, 'the draft phone is type=tel');
  assert.match(guard, /el\.name === 'phone'/, 'the job, vendor and account phone boxes');
  assert.match(guard, /el\.dataset\?\.wbContactaddPhone !== undefined/, 'the quick-add tile');
});

test('formatting happens on blur, so the caret is not moved mid-typing', () => {
  // A dash appearing three characters ahead of the caret shifts everything after it, which is
  // what made live formatting feel like the field was fighting the typist.
  assert.match(main, /document\.addEventListener\('focusout', onDocumentFocusOut\);/);
  const handler = between('function onDocumentFocusOut(event)', 'function mapsSearchUrl');
  assert.match(handler, /if \(!isPhoneInput\(el\)\) return;/, 'only phone boxes are touched');
  assert.match(handler, /if \(formatted !== raw\) el\.value = formatted;/, 'no write when nothing changed');
});

test('letters and other junk are stripped, because that is what breaks number matching', () => {
  // type="tel" validates nothing at the browser level, so a pasted number can carry anything.
  // Leaving it in is what stops the same number being recognised as a phone number later.
  const handler = between('function onDocumentFocusOut(event)', 'function mapsSearchUrl');
  assert.match(handler, /raw\.replace\(\/\[\^0-9\+\\-\]\/g, ''\)/);
  assert.equal(format('602-555-0198 (mobile)'), '602-555-0198', 'the junk is not in the dash form');
});
