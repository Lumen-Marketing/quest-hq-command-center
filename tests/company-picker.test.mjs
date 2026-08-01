import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const fn = (name) => {
  const start = main.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  return main.slice(start, main.indexOf('\n}\n', start) + 2);
};

test('the sidebar control is a button, not an invisible select overlay', () => {
  const header = main.slice(main.indexOf('class="company-account-header"'));
  const block = header.slice(0, header.indexOf('</div>'));
  assert.ok(!/<select data-company-switch/.test(block), 'the overlay select should be gone');
  assert.match(block, /<button class="company-account-switcher" type="button" data-action="open-company-picker"/);
  // A control that opens a dialog should say so, and name the account it will switch from.
  assert.match(block, /aria-haspopup="dialog"/);
  assert.match(block, /aria-label="Switch company account — currently \$\{h\(companyLabel\(current\)\)\}"/);
});

test('the picker is built on the shared modal shell, so it inherits dialog behaviour', () => {
  const body = fn('renderCompanyPickerModal');
  // renderModalShell supplies role="dialog", the accessible name, the focus trap, focus
  // restoration and Escape. Hand-rolling the markup would silently drop all of it.
  assert.match(body, /return renderModalShell\('Company account', 'Switch company', content, 'company-picker-modal'\)/);
  assert.match(main, /if \(state\.modal === 'company-picker'\) return renderCompanyPickerModal\(\);/);
});

test('the current account is shown first and is not offered as an action', () => {
  const body = fn('renderCompanyPickerModal');
  assert.match(body, /matches\.filter\(\(c\) => c\.id === currentId\)\.concat\(matches\.filter\(\(c\) => c\.id !== currentId\)\)/);
  assert.match(body, /aria-current="true"/);
  assert.match(css, /\.company-pick\.current \{[^}]*cursor: default;/s);
});

test('each row carries enough to tell the accounts apart', () => {
  const body = fn('renderCompanyPickerModal');
  assert.match(body, /workspaceIconMarkup\(company, 'company-pick-icon'\)/);
  assert.match(body, /companyLabel\(company\)/);
  // A bare list of names is the problem the native select already had.
  assert.match(body, /workspace\$\{count === 1 \? '' : 's'\}/);
});

test('search appears only when the list stops fitting', () => {
  const body = fn('renderCompanyPickerModal');
  assert.match(body, /const searchable = companies\.length > 6;/);
  assert.match(body, /\$\{searchable \?/);
});

test('the search filters as you type, not on blur', () => {
  // `change` fires on blur or Enter; a search box that does nothing until you leave it
  // reads as broken. The handler has to live on the input listener.
  const input = fn('onDocumentInput');
  assert.match(input, /data-company-picker-search/);
  const change = fn('onDocumentChange');
  assert.ok(!/data-company-picker-search/.test(change), 'filtering on change means typing appears to do nothing');
});

test('re-rendering on each keystroke does not lose the caret', () => {
  const input = fn('onDocumentInput');
  assert.match(input, /getElementById\('companyPickerSearch'\)/);
  assert.match(input, /setSelectionRange\(field\.value\.length, field\.value\.length\)/);
});

test('opening clears any previous search', () => {
  const open = main.slice(main.indexOf("if (action === 'open-company-picker')"));
  const body = open.slice(0, open.indexOf('\n  }'));
  assert.match(body, /state\.companyPickerQuery = '';/, 'a stale filter would hide the account being looked for');
  assert.match(body, /state\.modal = 'company-picker';/);
});

test('picking closes the dialog before the new company renders', () => {
  const pick = main.slice(main.indexOf("if (action === 'pick-company')"));
  const body = pick.slice(0, pick.indexOf('\n  }'));
  const closeAt = body.indexOf("state.modal = ''");
  const switchAt = body.indexOf('setActiveCompany(');
  assert.ok(closeAt !== -1 && switchAt !== -1);
  assert.ok(closeAt < switchAt, 'closing after switching leaves the dialog blinking over the new screen');
  // Re-selecting the current account should not re-run the whole route resolution.
  assert.match(body, /nextCompanyId !== activeCompanyId\(\)/);
});

test('the picker state is declared and the button has a visible focus ring', () => {
  assert.match(main, /companyPickerQuery: '',/);
  assert.match(css, /\.company-account-switcher:focus-visible \{[^}]*outline: 2px solid var\(--accent\)/s);
  assert.match(css, /\.company-pick:focus-visible \{[^}]*outline: 2px solid var\(--accent\)/s);
});
