import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('messages page renders the simplified chat mockup shell', () => {
  assert.match(source, /data-route="\$\{h\(route\.name\)\}" data-section="\$\{h\(route\.section \|\| ''\)\}"/);
  assert.match(source, /<header class="message-command-bar">/);
  assert.match(source, /<section class="message-simple-workspace">/);
  assert.match(source, /<aside class="message-simple-sidebar card">/);
  assert.match(source, /<main class="message-simple-main card">/);
  assert.doesNotMatch(source, /renderMessageDetailsRail\(companyId, selected\)/);
});

test('messages composer uses icon attach and send controls around the input', () => {
  assert.match(source, /<form class="message-composer"/);
  assert.match(source, /class="icon-button message-attach-button"/);
  assert.match(source, /<input name="body" placeholder="Message \$\{h\(conversation\.title\)\}"/);
  assert.match(source, /<button class="icon-button btn-primary" type="submit" title="Send">/);
});

test('new group modal supports solo and team states from the mockup', () => {
  assert.match(source, /class="message-modal-solo"/);
  assert.match(source, /It's just you so far/);
  assert.match(source, /class="message-modal-team"/);
  assert.match(source, /data-message-access-filter/);
  assert.match(source, /data-message-role-toggle/);
});

test('message member flow uses workspace members instead of the generic invite-code modal', () => {
  assert.match(source, /function renderMessageWorkspaceMembersModal\(companyId\)/);
  assert.match(source, /state\.modal === 'message-workspace-members'/);
  assert.match(source, /data-action="open-message-workspace-members"/);
  assert.match(source, /data-action="message-direct-member"/);
  assert.doesNotMatch(source, /data-action="new-invite-from-message"/);
  assert.doesNotMatch(source, /if \(action === 'new-invite-from-message'\)/);
});

test('simplified chat styling matches the provided responsive mockup', () => {
  assert.match(styles, /\/\* Simplified chat mockup replacement \*\//);
  assert.match(styles, /\.message-simple-workspace \{\s*flex: 1;\s*display: grid;\s*grid-template-columns: 340px minmax\(0, 1fr\);/);
  assert.match(styles, /\.message-simple-sidebar \{\s*display: flex;\s*flex-direction: column;/);
  assert.match(styles, /\.message-simple-main \{\s*display: grid;/);
  assert.match(styles, /\.message-modal-solo \{\s*text-align: center;/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.message-simple-workspace \{\s*grid-template-columns: 1fr;/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.message-simple-main:not\(\.has-thread\) \{\s*display: none;/);
});
