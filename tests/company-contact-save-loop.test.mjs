import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "When I try to save it, it's hanging, it's freezing."
//
// Saving a record in any app with a Company Contact field re-submitted itself for ever.
//
//   if (document.querySelector('[data-wb-cc-picker] [data-wb-cc-name]')) {
//     wbCreateMissingContacts(companyId).then((made) => { if (made) wbSubmitModal(); })
//
// The guard asked "is a contact picker on screen", which is true whenever the app has such a
// field — not "is there a contact still to create". And createMissingContacts answers `true`
// whatever happens, deliberately, so that a record whose contact could not be created still
// saves. Put together, every save called itself again, for ever, and locked the tab.
//
// Every test of that code matched source TEXT, including one asserting the exact `.then((made)
// => { if (made) wbSubmitModal(); })` line. Nothing ran it, so nothing noticed it never stops.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const slice = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};

// The real reader, over a DOM of contact pickers.
const buildReader = (pickers) => {
  const document = {
    querySelectorAll: () => pickers.map((picker) => ({
      querySelector: (selector) => (selector === '[data-wb-cc-id]'
        ? { value: picker.id }
        : { value: picker.name }),
    })),
  };
  return Function('document', `${slice('wbPendingContactNames')} return wbPendingContactNames;`)(document);
};

test('a picker that already resolved to a contact is not pending', () => {
  assert.equal(buildReader([{ name: 'Kevin Henderson', id: 'cc-1' }])(), '');
  assert.equal(buildReader([])(), '');
  assert.equal(buildReader([{ name: '   ', id: '' }])(), '', 'a blank box is nothing to create');
});

test('a name with no contact behind it is pending', () => {
  assert.equal(buildReader([{ name: 'Kevin Henderson', id: '' }])(), 'Kevin Henderson');
});

test('the key does not depend on the order the pickers happen to be in', () => {
  const a = buildReader([{ name: 'Ana Reyes', id: '' }, { name: 'Ben Cruz', id: '' }])();
  const b = buildReader([{ name: 'Ben Cruz', id: '' }, { name: 'Ana Reyes', id: '' }])();
  assert.equal(a, b, 'otherwise the same pending set looks new and tries again');
});

// ---- the loop itself, run rather than read ------------------------------------------------

/**
 * The submit guard exactly as main.js writes it, over a fake form.
 *
 * `creates` decides whether the contact can actually be made — the case that used to spin for
 * ever is the one where it cannot.
 */
function runSubmit({ creates }) {
  const picker = { name: 'Kevin Henderson', id: '' };
  const modal = {};
  const pending = buildReader([picker]);
  let passes = 0;
  let saved = false;

  const submit = () => {
    passes += 1;
    assert.ok(passes < 50, 'wbSubmitModal never stopped calling itself');
    const pendingContacts = pending();
    if (pendingContacts && modal.contactPass !== pendingContacts) {
      modal.contactPass = pendingContacts;
      // createMissingContacts answers true whatever happens; main.js no longer reads it.
      if (creates) picker.id = 'cc-1';
      submit();
      return;
    }
    saved = true;
  };

  submit();
  return { passes, saved, linked: picker.id };
}

test('the contact is created, then the record saves — two passes, not infinitely many', () => {
  const result = runSubmit({ creates: true });
  assert.equal(result.passes, 2);
  assert.equal(result.saved, true);
  assert.equal(result.linked, 'cc-1', 'and the record saves with the link filled in');
});

test('a contact that could NOT be created still lets the record save', () => {
  // No permission, or the write was refused. This is the case that froze the tab: the name
  // stays pending for ever, so a guard that only asks "is anything pending" never terminates.
  const result = runSubmit({ creates: false });
  assert.equal(result.passes, 2);
  assert.equal(result.saved, true);
  assert.equal(result.linked, '', 'the link is empty, which is the honest outcome');
});

test('the guard it replaced really does spin for ever', () => {
  // Proving this harness would have caught it. The old condition — a picker exists, and
  // createMissingContacts said true — never stops, even when the contact IS created, because
  // the picker is still on screen on the way back through.
  const picker = { name: 'Kevin Henderson', id: '' };
  let passes = 0;
  const oldSubmit = () => {
    passes += 1;
    if (passes > 200) throw new Error('did not terminate');
    const aPickerExists = true; // document.querySelector('[data-wb-cc-picker] [data-wb-cc-name]')
    if (aPickerExists) {
      picker.id = 'cc-1'; // createMissingContacts succeeded...
      const made = true; // ...and answers true whatever happens
      if (made) oldSubmit();
      return;
    }
  };
  assert.throws(oldSubmit, /did not terminate/);
});

test('the old guard is gone', () => {
  // Two things made it loop, and both had to go: a guard true for any app with a contact
  // field, and re-submitting on an answer that is always true.
  assert.ok(!/if \(document\.querySelector\('\[data-wb-cc-picker\] \[data-wb-cc-name\]'\)\) \{/.test(main));
  assert.ok(!/\.then\(\(made\) => \{ if \(made\) wbSubmitModal\(\); \}\)/.test(main));
  assert.match(main, /const pendingContacts = wbPendingContactNames\(\);/);
  assert.match(main, /if \(pendingContacts && m\.contactPass !== pendingContacts\) \{/);
  assert.match(main, /m\.contactPass = pendingContacts;/);
});

test('the module is only fetched when there is actually something to create', () => {
  // The cheap synchronous read stays in the entry bundle so an app with no pending contact
  // never pays for the module that does the creating.
  const at = main.indexOf('const pendingContacts = wbPendingContactNames();');
  const branch = main.slice(at, at + 600);
  assert.ok(branch.indexOf('wbCreateMissingContacts') > branch.indexOf('if (pendingContacts'));
});
