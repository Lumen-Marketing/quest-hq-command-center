import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "on this app checklist in board view I want the inner card is not clickable to go to item
// card dashboard, but it will just check the checklist -- when I click the checklist outside
// on the circle, it goes to inside of this Item record."
//
// A card is one big click target that opens the record. The checklist sits inside it, so
// only the parts that were <button> -- the circle and the X -- were protected. A click on a
// step's label navigated away instead of ticking it, which is the one thing anybody is
// trying to do there.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

test('the whole step row toggles, not just the circle', () => {
  const at = main.indexOf('function wbCardFieldHtml(');
  const body = main.slice(at, main.indexOf('\n}', at));
  // The <li> carries the toggle, so the label and the gap beside it tick the step.
  assert.match(body, /<li class="wb-cl-item \$\{it\.done \? 'done' : ''\}" \$\{canManage \? `data-wb-cl-card="toggle:\$\{h\(item\.id\)\}:\$\{h\(field\.id\)\}:\$\{h\(it\.id\)\}"` : ''\}>/);
  // And the circle keeps its own, so keyboard users still have a real control.
  assert.match(body, /class="wb-cl-check"[^>]*data-wb-cl-card="toggle:/);
  assert.match(body, /class="wb-cl-del" data-wb-cl-card="remove:/);
});

test('only the button carries the checkbox role, so a step is announced once', () => {
  const at = main.indexOf('function wbCardFieldHtml(');
  const body = main.slice(at, main.indexOf('\n}', at));
  const li = body.slice(body.indexOf('<li class="wb-cl-item'), body.indexOf('<button type="button" class="wb-cl-check"'));
  assert.ok(!/role=/.test(li), 'a role on the row would announce two checkboxes per step');
});

test('a viewer who cannot manage gets no toggle at all', () => {
  const at = main.indexOf('function wbCardFieldHtml(');
  const body = main.slice(at, main.indexOf('\n}', at));
  // canManage gates the row attribute the same way it gates the circle and the X.
  assert.match(body, /<li class="wb-cl-item[^>]*\$\{canManage \? `data-wb-cl-card="toggle:/);
});

test('nothing inside the checklist panel opens the record', () => {
  // The row toggle stops propagation, but a read-only card has no toggle to stop it -- so
  // the panel itself is in the bail list rather than relying on the handler being there.
  const bail = main.match(/if \(e\.target\.closest\('([^']+)'\)\) return;/)[1];
  assert.ok(bail.includes('.wb-card-cl-panel'), `panel not exempt from card navigation: ${bail}`);
  // The controls that already worked must stay exempt.
  for (const part of ['button', 'input', 'a', 'label']) assert.ok(bail.includes(part), `${part} dropped from the bail list`);
});

test('the toggle handler stops the click reaching the card', () => {
  const at = main.indexOf("bind('[data-wb-cl-card]'");
  assert.notEqual(at, -1);
  assert.match(main.slice(at, at + 220), /\(el, e\) => \{ e\.stopPropagation\(\);/,
    'without this the circle would tick the step AND open the record');
});

test('a row that acts like a control looks like one', () => {
  assert.match(styles, /\.wb-card-cl-panel \.wb-cl-item\[data-wb-cl-card\] \{ cursor: pointer;/);
  // Text that toggles on click must not select on click, or dragging over it fights the tap.
  assert.match(styles, /\.wb-card-cl-panel \.wb-cl-item\[data-wb-cl-card\] \.wb-cl-label \{ user-select: none; \}/);
});

test('the record modal checklist is untouched', () => {
  // That one is not inside a click-to-open card, so its rows stay plain and its own handler
  // keeps working. Changing it here would be scope creep with a regression attached.
  const at = main.indexOf('function wbChecklistBodyHtml(');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /<li class="wb-cl-item \$\{it\.done \? 'done' : ''\}" data-cid="\$\{h\(it\.id\)\}">/);
  assert.ok(!/data-wb-cl-card/.test(body), 'the modal list uses data-wb-cl-toggle, not the card action');
});
