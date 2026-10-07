// Read application source for tests that scan it as text.
//
// Every test in this suite that searches source for a structural marker goes through here, for
// two reasons that are related but not the same.
//
// 1. Line endings. A Windows checkout with `core.autocrlf=true` has a CRLF working tree, so the
//    bytes around a closing brace are `\r\n}\r\n`. A marker written as `'\n}\n'` cannot occur in
//    that text. Normalizing on read makes the tests behave identically on every platform and
//    every checkout configuration.
//
// 2. Failing loudly. This is the part that matters more, and it is not about line endings.
//
//    The idiom across this suite is:
//
//        const at   = source.indexOf('function thing(');   // found
//        const stop = source.indexOf('\n}\n', at);        // may NOT be found
//        const body = source.slice(at, stop);             // slice(at, -1) when stop is -1
//
//    `slice` with a negative end means "all but the last n characters". So a missing end marker
//    does not fail -- it silently widens the slice to the entire rest of the file, every regex in
//    the test then matches somewhere in unrelated source, and the test passes while asserting
//    nothing. On a CRLF working tree that is the state 58 of these tests were in.
//
//    So the reader, and `between` below, throw instead. A marker that cannot be found is a broken
//    assertion and should stop the run.
//
// `readSource` normalizes and nothing else. `between` additionally refuses to return a slice it
// could not delimit.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Read a file as LF-normalized text.
 * @param {string} path
 * @returns {string}
 */
export function readSource(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

/**
 * The text between two markers, inclusive of `start`.
 *
 * Throws when either marker is absent. That is the whole point: a caller that cannot find its
 * boundaries must not receive a slice of the wrong size.
 *
 * @param {string} source already normalized, e.g. from readSource
 * @param {string} start
 * @param {string} end
 * @returns {string}
 */
export function between(source, start, end) {
  const at = source.indexOf(start);
  assert.notEqual(at, -1, `Missing source marker: ${start}`);
  const stop = source.indexOf(end, at + start.length);
  assert.notEqual(stop, -1, `Missing source marker: ${end}`);
  return source.slice(at, stop);
}