// "the form is fixed and cannot be scrolled down"
//
// The public intake page wore `client-portal-public open`. That `open` modifier belongs to the
// client-portal document ANNOTATOR, which is a fixed full-screen shell that scrolls inside
// itself, so it carries position:fixed, inset:0 and overflow:hidden. On a page that is simply a
// long card, those pinned the form to the viewport and discarded everything past the fold: an
// intake form with more than a screenful of fields could not be filled in, because the rest of
// it could not be reached. Every other public page uses the base class, which is an ordinary
// scrolling page.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { renderIntakePage } = await import('../src/intake/public-page.js');
const source = readFileSync(new URL('../src/intake/public-page.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const classesOf = (html) => [...html.matchAll(/<main class="([^"]*)"/g)].map((m) => m[1]);

test('the page is a scrolling document, not the fixed annotator shell', () => {
  const html = renderIntakePage();
  const classes = classesOf(html);
  assert.ok(classes.length, 'the page renders a main element');
  for (const list of classes) {
    assert.ok(list.split(/\s+/).includes('client-portal-public'), 'it keeps the public page base');
    assert.ok(!list.split(/\s+/).includes('open'), 'and must not wear the annotator modifier');
  }
});

test('no render path reaches for the annotator modifier', () => {
  // Four bodies render into this main -- the form, the passcode gate, the thank-you and the
  // failure -- and the fault only showed on the one long enough to overflow.
  assert.ok(!source.includes('client-portal-public open'), 'no variant may add it back');
});

test('the modifier really is the thing that clipped the form', () => {
  // If this shell ever stops being fixed-and-hidden, the test above is guarding nothing and
  // should be revisited rather than quietly passing.
  const at = css.indexOf('.client-portal-public.open {');
  assert.ok(at > -1, 'the annotator shell still exists');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /position: fixed/);
  assert.match(rule, /overflow: hidden/);
});

test('the base page scrolls and fills the window', () => {
  const at = css.indexOf('.client-portal-public {');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /min-height: 100vh/);
  assert.doesNotMatch(rule, /overflow: hidden/);
  assert.doesNotMatch(rule, /position: fixed/);
});
