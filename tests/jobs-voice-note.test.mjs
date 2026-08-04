import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canRecord, extensionFor, formatElapsed, voiceNoteName } from '../src/jobs/voice-note.js';

const source = readFileSync(new URL('../src/jobs/voice-note.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('it reports honestly that it cannot record in Node', () => {
  // No MediaRecorder here, so the guard has to be a real check rather than an assumption.
  assert.equal(canRecord(), false);
});

test('the microphone is released on every exit path', () => {
  // A live track leaves the browser recording indicator on after the dialog closes, which
  // reads as the app still listening.
  for (const path of ['onerror', 'onstop', 'function cancel', 'function stop']) {
    const at = source.indexOf(path);
    assert.notEqual(at, -1, `${path} should exist`);
    assert.match(source.slice(at, at + 400), /releaseMicrophone\(\)/, `${path} must release the microphone`);
  }
  assert.match(source, /stream\.getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);
});

test('cancelling throws the audio away rather than attaching it', () => {
  const fn = source.slice(source.indexOf('function cancel()'));
  const body = fn.slice(0, fn.indexOf('\n  }'));
  assert.ok(!/onStop\(/.test(body), 'cancel must not deliver a recording');
  assert.match(body, /chunks = \[\]/);
});

test('an empty recording is reported as nothing, not attached as a silent file', () => {
  assert.match(source, /onStop\(blob\.size \? blob : null, elapsed\)/);
});

test('the timer is cleared whenever the microphone is', () => {
  const fn = source.slice(source.indexOf('function releaseMicrophone()'));
  assert.match(fn.slice(0, 260), /clearInterval\(timer\)/);
});

test('elapsed time reads as minutes and seconds', () => {
  assert.equal(formatElapsed(0), '0:00');
  assert.equal(formatElapsed(9000), '0:09');
  assert.equal(formatElapsed(65000), '1:05');
  assert.equal(formatElapsed(-1), '0:00', 'never negative');
});

test('the file name sorts chronologically and carries the real extension', () => {
  assert.equal(voiceNoteName(new Date(2026, 7, 4, 9, 5), 'm4a'), 'job-walk-2026-08-04-0905.m4a');
  assert.equal(extensionFor('audio/mp4'), 'm4a');
  assert.equal(extensionFor('audio/ogg;codecs=opus'), 'ogg');
  assert.equal(extensionFor('audio/webm;codecs=opus'), 'webm');
  assert.equal(extensionFor(''), 'webm', 'an unknown type still gets a usable extension');
});

test('the container is negotiated rather than assumed', () => {
  // Safari has no webm. Hard-coding it records nothing there, silently.
  assert.match(source, /MediaRecorder\.isTypeSupported/);
  assert.match(source, /'audio\/mp4'/);
});

test('it is fetched on demand, not carried by every page', () => {
  assert.match(main, /import\('\.\/jobs\/voice-note\.js'\)/);
  assert.ok(!/^import .*voice-note/m.test(main), 'a static import would defeat the split');
});

test('the UI does not claim a transcript it cannot produce', () => {
  // The design transcribes. Nothing is connected that can, so the module says so rather than
  // implying one is coming.
  assert.match(source, /no transcript is produced/);
});
