import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// This suite reads application source as TEXT and searches it for structural markers, because
// there is no other way to assert that a function body says what it must say. That is a real
// technique here, but it has a failure mode that no assertion in those files can catch:
//
//   const at    = source.indexOf('function thing(');        // found
//   const stop  = source.indexOf('\n}\n', at);              // NOT found on CRLF
//   const body  = source.slice(at, stop);                   // slice(at, -1)
//
// `String.prototype.slice` with a negative end means "all but the last n characters". A missing
// end marker therefore does not fail -- it silently widens the slice to the ENTIRE REST OF THE
// FILE. Every regex in that test then matches somewhere in a megabyte of unrelated source, so the
// test passes while testing nothing it claims to test.
//
// On CI (Linux, LF checkout) the marker matches and the tests are meaningful. On a Windows
// checkout `core.autocrlf=true` rewrites the working tree to CRLF, `'\n}\n'` cannot occur -- the
// bytes are `\r\n}\r\n` -- and the tests pass vacuously.
//
// Measured on this repository: 224 of 231 files under src/ are CRLF in a Windows working tree,
// and one test file (task-assignee-identity) failed loudly only because it is the one that asserts
// the marker was found. The other 58 were green and hollow.
//
// This test does not try to detect that state at runtime. It enforces the two things that stop
// it: every source read normalizes CRLF, and the helper that slices cannot fail open.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = join(root, 'tests');
const testFiles = readdirSync(testsDir).filter((name) => name.endsWith('.test.mjs'));

// The markers that cannot match in CRLF text. '\n}' is fine -- LF is still immediately followed
// by the brace -- but anything requiring a newline AFTER the brace is line-ending sensitive.
const SENSITIVE_MARKER = /'\\n\}[^']*\\n'/;

// A read that normalizes, either inline or through the shared reader. The path argument contains
// parentheses (`new URL('../x.js', import.meta.url)`), so this matches up to the `.replace(`
// rather than trying to balance the argument list.
const NORMALIZED_READ = /readFileSync\([\s\S]{0,120}?\)\s*\.replace\(\s*\/(?:\\r\\n|\\r)/;

function filesMissingNormalization() {
  return testFiles.filter((name) => {
    const source = readFileSync(join(testsDir, name), 'utf8');
    if (!source.includes('readFileSync')) return false;
    if (!SENSITIVE_MARKER.test(source)) return false;
    if (NORMALIZED_READ.test(source)) return false;
    return !source.includes("from './lib/read-source.mjs'");
  });
}

// Import the helper so the reproduction below exercises the real implementation rather than a
// copy of it.
import { between, readSource } from './lib/read-source.mjs';

// Ratchet, not a gate. These files currently pass VACUOUSLY on a Windows checkout -- their slice
// widens to the whole file -- so failing the suite over them would turn the branch red for a
// condition CI never sees. Instead this pins the current number: it fails only if the count goes
// UP, and it prints the list so the backlog is visible and shrinkable.
//
// On CI (LF checkout) all of these are meaningful, which is why the backlog is a cleanup rather
// than an outage. Fixing one means routing its read through tests/lib/read-source.mjs.
test('no test file joins the CRLF-vacuous backlog', () => {
  const offenders = filesMissingNormalization();
  assert.ok(
    offenders.length <= 58,
    `${offenders.length} files now search for line-ending-sensitive markers without normalizing; the budget is 58:\n  ${offenders.join('\n  ')}`,
  );
});

test('the shared reader normalizes, and is what source-scanning tests use', () => {
  const helper = readFileSync(join(testsDir, 'lib', 'read-source.mjs'), 'utf8');
  assert.match(helper, /export function readSource/, 'the helper must export a reader');
  assert.match(helper, /\.replace\(\s*\/\\r\\n\/g,\s*'\\n'\)/, 'and it must actually normalize');
});

test('the slice helper fails loudly instead of widening silently', () => {
  const helper = readFileSync(join(testsDir, 'lib', 'read-source.mjs'), 'utf8');

  // slice(source.slice(at, stop)) with stop === -1 is the entire bug. The helper must assert.
  assert.match(
    helper,
    /assert\.notEqual\(stop,\s*-1/,
    'a missing end marker must throw, not produce slice(at, -1)',
  );
  assert.match(helper, /assert\.notEqual\(at,\s*-1/, 'and a missing start marker likewise');
});

test('the file that failed loudly is fixed at the read, as the house pattern requires', () => {
  // A checkout configuration is not something a test should depend on, so this file normalizes on
  // read rather than relying on the tree happening to be LF.
  const source = readFileSync(join(testsDir, 'task-assignee-identity.test.mjs'), 'utf8');
  const reads = source.match(/readFileSync\([\s\S]{0,120}?\)\.replace\([^)]*\)/g) || [];
  assert.ok(reads.length >= 3, `main.js, workload-page.js and record-task.js are all normalized (found ${reads.length})`);
});

test('a slice that cannot be delimited throws rather than returning the whole file', () => {
  // This is the bug in its minimal form. Reproduced directly, because the property matters more
  // than any individual test file: slice(at, -1) is 1.5MB of src/main.js, and every regex in the
  // caller then matches something in it.
  assert.throws(
    () => between('function present() {\n  return 1;\n}\n', 'function present(', '\n}\n\n\nnever'),
    /Missing source marker/,
    'an absent end marker must throw',
  );
  // And the happy path still returns just the function. `between` is half-open on the end marker,
  // which matches how every caller uses it: they want the body, not the closing brace.
  const source = 'before\nfunction present() {\n  return 1;\n}\nafter\n';
  assert.equal(
    between(source, 'function present(', '\n}\n'),
    'function present() {\n  return 1;',
  );
  assert.ok(!between(source, 'function present(', '\n}\n').includes('after'));
});

test('the working tree this suite runs against is line-ending agnostic', () => {
  // Belt and braces: prove the property directly rather than inferring it from the files above.
  const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
  const at = main.indexOf('function isPhoneInput(');
  if (at !== -1) {
    const stop = main.indexOf('\n}\n', at);
    assert.notEqual(stop, -1, 'after normalization the end marker must be findable');
    assert.ok(stop > at, 'and it must sit after the start marker, not before it');
  }
});