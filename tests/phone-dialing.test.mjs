import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Evaluate the shipped function rather than reimplementing it — a test that carries its
// own copy passes just as happily when the real one breaks.
const telHref = (() => {
  const start = main.indexOf('function telHref(');
  const source = main.slice(start, main.indexOf('\n}\n', start) + 2);
  // eslint-disable-next-line no-new-func
  return new Function(`${source}; return telHref;`)();
})();

test('a plain number becomes a dialable href', () => {
  assert.equal(telHref('602-750-5678'), 'tel:6027505678');
  assert.equal(telHref('(602) 750-5678'), 'tel:6027505678');
  assert.equal(telHref('  480.955.4036  '), 'tel:4809554036');
});

test('an international number keeps its leading plus', () => {
  assert.equal(telHref('+639-551-766487'), 'tel:+639551766487');
  assert.equal(telHref('+1 (480) 277-1540'), 'tel:+14802771540');
});

// The bug this pins: stripping punctuation blindly turned "(602) 750-5678 ext 4" into
// 60275056784 — a real, different, wrong number, dialled with no indication anything was
// off. RFC 3966 carries an extension as a ;ext= parameter.
test('an extension never gets welded onto the number', () => {
  assert.equal(telHref('(602) 750-5678 ext 4'), 'tel:6027505678;ext=4');
  assert.equal(telHref('602-750-5678 x12'), 'tel:6027505678;ext=12');
  assert.equal(telHref('555-0100 #7'), 'tel:5550100;ext=7');
  // The trunk must survive intact in every case.
  for (const written of ['(602) 750-5678 ext 4', '602-750-5678 x12']) {
    assert.match(telHref(written), /^tel:6027505678(;ext=\d+)?$/);
  }
});

test('anything undialable yields no link at all', () => {
  // Better a plain string than an anchor that goes nowhere.
  for (const junk of ['', '   ', 'n/a', 'call the office', 'ext 5', null, undefined]) {
    assert.equal(telHref(junk), '', `${JSON.stringify(junk)} should not be dialable`);
  }
});

test('the phone field renders as a link, matching how email already does', () => {
  const start = main.indexOf("case 'phone': {");
  assert.notEqual(start, -1, 'the phone case should exist');
  const block = main.slice(start, main.indexOf('\n    }', start));
  assert.match(block, /const tel = telHref\(value\)/);
  assert.match(block, /<a class="wb-tel-cell" href="\$\{h\(tel\)\}"/);
  // Display keeps the human formatting; only the href is normalised.
  assert.match(block, /formatPhoneNumber\(value\)/);
  // No link when there is nothing to dial.
  assert.match(block, /: h\(shown\)/);
});

test('tapping the number calls instead of opening the record', () => {
  // The row's own click handler opens the item. It already skips anchors, which is what
  // keeps a phone link from doing both things at once.
  // Anchored on the guard itself rather than a fixed byte window: comments explaining why
  // the bail list has grown pushed it past the old 400-character slice.
  const guard = main.slice(main.indexOf("document.querySelectorAll('#wbItemsList [data-item]')"));
  const bail = guard.match(/e\.target\.closest\('([^']+)'\)/)[1];
  assert.ok(bail.split(', ').includes('a'), `anchors dropped from the row-click bail list: ${bail}`);
});

test('the cell is styled as an action and takes visible focus', () => {
  assert.match(css, /\.wb-tel-cell \{[^}]*display: inline-flex;/s);
  assert.match(css, /\.wb-tel-cell:focus-visible \{[^}]*outline: 2px solid var\(--orange\)/s);
  // Wrapping a phone number mid-digits makes it unreadable.
  assert.match(css, /\.wb-tel-cell \{[^}]*white-space: nowrap;/s);
});
