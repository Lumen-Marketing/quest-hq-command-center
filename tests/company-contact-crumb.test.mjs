import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The way back from a contact card to the directory.
//
// It is a BUTTON that is still an <a>. That combination is the whole point and it is easy to
// "tidy" away in either direction: made a real <button> it loses middle-click, Cmd-click, open
// in new tab and copy link, which is exactly what somebody stepping through a list of contacts
// reaches for; left as a bare link it does not read as the way out.
//
// renderCard is an inner function of a factory taking ~50 ctx keys, so rather than stub all of
// that, the crumb's own template is cut out of the source and EVALUATED. That is a real render
// of the real markup — a regex over the same text would pass against a <button>.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** The `<div class="cc-crumb">…</div>` template, rendered for one contact. */
function crumb({ canManage = true, name = 'joe smith', arranging = false } = {}) {
  const open = page.indexOf('<div class="cc-crumb">');
  assert.notEqual(open, -1, 'the crumb markup has moved');
  const end = page.indexOf('<header class="cc-profile-head"', open);
  assert.notEqual(end, -1, 'the profile header has moved');
  const slice = page.slice(open, page.lastIndexOf('</div>', end) + '</div>'.length);

  const appHref = (path) => `/app${path}`;
  const companyPath = (section, params, companyId) => `/${companyId}/${section}`;
  const companyId = 'quest';
  const contact = { id: 'c-1', name };
  // eslint-disable-next-line no-eval
  return eval('`' + slice + '`'); // eslint-disable-line prefer-template
}

/** One element's attributes, by tag and class. */
function el(html, selectorClass) {
  const match = new RegExp(`<(\\w+)([^>]*class="[^"]*\\b${selectorClass}\\b[^"]*"[^>]*)>`).exec(html);
  assert.ok(match, `no element carrying .${selectorClass}`);
  const attrs = {};
  // Both forms: `href="…"` and a bare `data-router`. Reading only the first kind made this
  // helper report data-router as missing on an element that carried it.
  for (const [, k, v] of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
    if (k) attrs[k] = v === undefined ? '' : v;
  }
  return { tag: match[1], attrs, raw: match[0] };
}

test('the way back is a button', () => {
  const html = crumb();
  const back = el(html, 'cc-crumb-back');
  assert.match(back.attrs.class, /\bbtn\b/, 'it does not read as a button');
  assert.match(html, /ti-arrow-left/, 'a back control points back');
  assert.match(html, />Company Contacts<\/a>/, 'it says where it goes');
});

test('…and is still a link, so it can be opened in a new tab', () => {
  const back = el(crumb(), 'cc-crumb-back');
  assert.equal(back.tag, 'a', 'a <button> cannot be middle-clicked, Cmd-clicked or copied');
  assert.equal(back.attrs.href, '/app/quest/company-contacts', 'it does not go to the directory');
  assert.ok('data-router' in back.attrs, 'without data-router it reloads the whole app');
  assert.equal(back.attrs['aria-label'], 'Back to Company Contacts');
});

test('the crumb no longer reads as a trail', () => {
  // The "/" separator belonged between two pieces of text. Between a button and a name it is
  // a leftover.
  const html = crumb();
  assert.doesNotMatch(html, /<span>\/<\/span>/, 'the breadcrumb slash is still there');
  assert.match(html, /class="cc-crumb-here">joe smith</, 'the contact still names the page');
});

test('the name is escaped, whatever the contact is called', () => {
  assert.match(crumb({ name: '<img src=x onerror=alert(1)>' }), /&lt;img src=x/);
});

test('the card actions still ride on the same row', () => {
  assert.match(crumb({ canManage: true }), /cc-crumb-actions/);
  assert.doesNotMatch(crumb({ canManage: false }), /cc-crumb-actions/, 'a read-only viewer is offered no editing');
  // …but the way out is not an editing action, so it survives without the permission.
  assert.match(crumb({ canManage: false }), /cc-crumb-back/, 'a read-only viewer is stranded on the card');
});

test('the accent-link rule cannot repaint the button', () => {
  // `.cc-crumb a` (0,1,1) outranks `.btn` (0,1,0), so an unscoped rule paints the label the
  // same colour as the button it sits on — a blank orange slab. Scoping is what stops it.
  const rule = /\.cc-crumb a(:not\(\.btn\))?\s*\{/.exec(css);
  assert.ok(rule, 'the crumb link rule has moved');
  assert.equal(rule[1], ':not(.btn)', 'the crumb link colour is not scoped away from the button');
});
