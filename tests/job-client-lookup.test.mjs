import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "on creating Job, I want the clients so when I entered a name, if the name exists in the
// Contacts it will fetch its data, its name and contact number, but if the record is not
// existing, I added it manually."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const editor = readFileSync(join(root, 'src', 'jobs', 'job-editor.js'), 'utf8');
const fn = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}', at));
};

test('Client is a searchable list of contacts that still takes a new name', () => {
  // allowCustom stays true: a job is often opened for somebody not in the CRM yet, so the
  // list is a shortcut rather than a constraint.
  assert.match(editor, /const clientField = \(value, companyId\) => renderSearchCombobox\(/);
  assert.match(editor, /jobClientOptions\(companyId\),/);
  assert.match(editor, /allowCustom: true/);
  assert.match(editor, /\$\{clientField\(edit\.client_name, companyId\)\}/);
  assert.match(fn('jobClientOptions'), /companyContacts\(companyId\)\.map\(\(contact\) => contact\.name\)/);
});

test('the match is exact, so a similar name cannot pull the wrong number', () => {
  const body = fn('contactByName');
  assert.match(body, /String\(contact\.name \|\| ''\)\.trim\(\)\.toLowerCase\(\) === wanted/);
  assert.match(body, /if \(!wanted\) return null;/);
});

test('picking a known contact links the record, not just the text', () => {
  // contact_id is what keeps the job attached to the CRM record if the contact is renamed.
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(idField\) idField\.value = contact\.id \|\| '';/);
  assert.match(editor, /<input type="hidden" name="contact_id"[^>]*data-job-contact-id/);
});

test('it fills an empty Contact box with the number, and never overwrites a full one', () => {
  // The number, not the name: the name is already in the Client box right beside it, and the
  // number is the detail somebody actually needs off a job.
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(contactField && !contactField\.value\.trim\(\)\)/);
  assert.match(body, /contactField\.value = formatPhoneNumber\(contact\.phone \|\| ''\);/);
});

test('a job for somebody new creates the contact', () => {
  // Typing a client the CRM does not have is how a real job starts, and the contact record
  // is the thing nobody goes back to make.
  const body = fn('ensureJobClientContact');
  assert.match(body, /if \(!name \|\| payload\.contact_id\) return payload;/, 'never on an already-linked job');
  assert.match(body, /const existing = contactByName\(payload\.company_id, name\);/);
  assert.match(body, /if \(existing\) return \{ \.\.\.payload, contact_id: existing\.id \};/, 'a matching name links, it does not duplicate');
  assert.match(body, /await persistContact\(contact\);/);
  // The number typed beside the name is the one that gets saved.
  assert.match(body, /form\?\.querySelector\('\[name="contact_name"\]'\)\?\.value/);
  // A failed convenience write must not cost somebody the job they were saving.
  assert.match(body, /catch \(error\) \{[\s\S]*?return payload;/);
});

test('the contact is only created once the job is allowed to save', () => {
  // Somebody who cannot save a job must not leave a contact behind as a side effect.
  const body = fn('saveJob');
  assert.ok(
    body.indexOf("requirePermission('jobs.manage'") < body.indexOf('await ensureJobClientContact(payload, form)'),
    'the permission check has to come first',
  );
});

test('a name that matches nothing is left alone, and drops the link', () => {
  const body = fn('fillJobClientFromContact');
  assert.match(body, /if \(!contact\) \{/);
  assert.match(body, /if \(idField\) idField\.value = '';/);
  // Nothing in the no-match branch touches what was typed.
  const noMatch = body.slice(body.indexOf('if (!contact) {'), body.indexOf('if (idField) idField.value = contact.id'));
  assert.ok(!/contactField\.value =/.test(noMatch), 'a typed name must survive');
});

test('it runs on BOTH the typing path and the picking path', () => {
  // The suggestion menu dispatches CHANGE, not input. Wiring only onDocumentInput meant
  // typing a full name worked and clicking the very name the menu offered did nothing --
  // the one case the feature exists for.
  const input = main.indexOf('function onDocumentInput(');
  const change = main.indexOf('function onDocumentChange(');
  assert.notEqual(input, -1);
  assert.notEqual(change, -1);
  const nextFn = (from) => main.indexOf(`${'\n'}function `, from + 10);
  const inputBody = main.slice(input, nextFn(input));
  const changeBody = main.slice(change, nextFn(change));
  assert.match(inputBody, /fillJobClientFromContact\(event\.target\)/, 'typing path');
  assert.match(changeBody, /fillJobClientFromContact\(event\.target\)/, 'picking path');
  // And the pick handler is what dispatches that change.
  assert.match(main, /input\.dispatchEvent\(new Event\('change', \{ bubbles: true \}\)\);/);
});

test('the wheel pans anything that scrolls sideways, and gives the page back', () => {
  // "when my mouse is on the stages cards I want to use the mouse scroll to scroll it
  // horizontally", and the same for the contacts table whose columns run off the edge.
  const body = fn('onPipeBoardWheel');
  assert.match(body, /const board = horizontalScrollerUnder\(event\.target\);/);
  assert.match(body, /board\.scrollLeft \+= event\.deltaY;/);
  // Claimed only when it actually moved; at either end the page scrolls instead.
  assert.match(body, /if \(board\.scrollLeft !== before\) event\.preventDefault\(\);/);
  // A trackpad's sideways swipe is already horizontal and is left to the browser.
  assert.match(body, /if \(Math\.abs\(event\.deltaY\) <= Math\.abs\(event\.deltaX\)\) return;/);
  assert.match(main, /document\.addEventListener\('wheel', onPipeBoardWheel, \{ passive: false \}\);/);
});

test('the scroller is measured, not named, and a vertical one wins', () => {
  // A list of class names would need extending for every wide table and would silently miss
  // the next one. And a long list inside a wide container must still scroll DOWN.
  const body = fn('horizontalScrollerUnder');
  // Yields only to a box that can ACTUALLY scroll down -- overflowing is not enough. A
  // quote column full of cards is taller than its board, whose overflow-y is hidden, so
  // testing the overflow alone made the board look vertical and the wheel did nothing.
  assert.match(body, /if \(style\.overflowY && scrollable\(style\.overflowY\) && node\.scrollHeight > node\.clientHeight \+ 1\) return null;/);
  assert.match(body, /if \(node\.scrollWidth > node\.clientWidth \+ 1 && scrollable\(style\.overflowX\)\) return node;/);
  assert.match(body, /const scrollable = \(overflow\) => overflow === 'auto' \|\| overflow === 'scroll';/);
  assert.ok(!/pipe-board/.test(body), 'no hard-coded class names');
});

test('the contacts table is actually allowed to scroll sideways', () => {
  // .contacts-table asked for overflow-x: auto, but .data-table sets `overflow: hidden` for
  // its rounded corners and, being the later rule, won on BOTH axes. The row overflowed its
  // panel with no way to reach the far columns, and the wheel handler rightly declined to
  // touch a box whose computed overflow-x said it does not scroll.
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(styles, /\.contacts-table \{\n  overflow-x: auto;\n  overflow-y: hidden;\n\}/);
  // Later than the .data-table rule it has to beat, or it loses again.
  assert.ok(
    styles.lastIndexOf('.contacts-table {\n  overflow-x: auto;') > styles.lastIndexOf('.data-table { gap: 0;'),
    'source order is what decides this',
  );
  // The rows are what overflow; without the min-width there is nothing to scroll.
  assert.match(styles, /\.contacts-table \.table-head,\n\.contacts-table \.table-row \{[\s\S]*?min-width: 1160px;/);
});

test('a job card can be deleted from the board, like a quote card', () => {
  // Same control, same route: through the recycle bin rather than destroying from a board,
  // because a job carries tasks, files and forms with it.
  assert.match(main, /data-action="delete-job" data-job-id="\$\{h\(job\.id\)\}"/);
  assert.match(main, /can\('jobs\.manage', job\.company_id\) \?/, 'offered only to someone who may delete');
  const at = main.indexOf("action === 'delete-job'");
  assert.notEqual(at, -1, 'the button is rendered but never handled');
  assert.match(main.slice(at, at + 600), /openRecycleDeleteModal\(\{ type: 'job', id: node\.dataset\.jobId \}\)/);

  // The shared rules are keyed to .pipe-card; a job board card is .job-card, so without
  // these the button lands in the wrong place and never becomes visible.
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(styles, /\.job-card \{ position: relative; \}/);
  assert.match(styles, /\.job-card:hover \.pipe-card-delete,/);
});
