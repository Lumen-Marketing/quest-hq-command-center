import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// renderAvatar's second argument is a list of CSS CLASSES. The Cards and Tags views passed a
// pixel number instead, so the span came out as class="34": it matched no rule, had no width,
// and the <img> inside it rendered at its natural size -- a 400px photograph where a 34px
// circle belonged. Anyone without a photo fared no better, getting bare initials with no
// circle at all, because .avatar was never applied either.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8').replace(/\r\n/g, '\n');
const main = read('src', 'main.js');
const styles = read('src', 'styles.css');

const sources = [
  ['src/main.js', main],
  ['src/team/users-page.js', read('src', 'team', 'users-page.js')],
  ['src/team/access-row.js', read('src', 'team', 'access-row.js')],
  ['src/messaging/chat-modals.js', read('src', 'messaging', 'chat-modals.js')],
  ['src/home/company-dashboard.js', read('src', 'home', 'company-dashboard.js')],
  ['src/platform/master-panel.js', read('src', 'platform', 'master-panel.js')],
  ['src/settings/settings-surfaces.js', read('src', 'settings', 'settings-surfaces.js')],
];

test('no caller hands renderAvatar a size where a class belongs', () => {
  for (const [name, source] of sources) {
    for (const call of source.match(/renderAvatar\([^)]*\)/g) || []) {
      if (/^renderAvatar\(profile, className/.test(call)) continue; // the definition itself
      assert.doesNotMatch(
        call,
        /,\s*\d+\s*[,)]/,
        `${name}: ${call} passes a number — renderAvatar takes CSS classes, not a pixel size`,
      );
    }
  }
});

test('the two member summary views ask for a sized avatar class', () => {
  const usersPage = sources.find(([name]) => name.endsWith('users-page.js'))[1];
  assert.match(usersPage, /renderAvatar\(user, 'avatar member-tag-avatar'\)/);
  assert.match(usersPage, /renderAvatar\(user, 'avatar member-card-avatar'\)/);
});

test('and the stylesheet actually sizes them', () => {
  // Without these the classes are just as inert as class="34" was.
  assert.match(styles, /\.avatar\.member-card-avatar \{ width: 34px; height: 34px;[^}]*\}/);
  assert.match(styles, /\.avatar\.member-tag-avatar \{ width: 24px; height: 24px;[^}]*\}/);
  // Both sit in a flex row next to a name that can be long. flex-shrink would squash the
  // circle into an oval before the text gave up any width.
  assert.match(styles, /\.avatar\.member-card-avatar \{[^}]*flex: none;/);
  assert.match(styles, /\.avatar\.member-tag-avatar \{[^}]*flex: none;/);
  // The size rules only do anything because .avatar img is what constrains the image.
  assert.match(styles, /\.avatar img \{ width: 100%; height: 100%; object-fit: cover; \}/);
});

test('renderAvatar guarantees the base class, so a bad caller cannot blow up a layout again', () => {
  const fn = main.slice(main.indexOf('function renderAvatar(profile, className'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /const requested = String\(className \?\? ''\)\.trim\(\);/);
  assert.match(body, /\/\(\^\|\\s\)avatar\(\\s\|\$\)\/\.test\(requested\)/);
  assert.match(body, /: `avatar \$\{requested\}`\.trim\(\)/, 'a class list without avatar gains it');
});

test('every avatar still resolves to a rule that gives it a width', () => {
  // The guard means the worst case is now the 42px default rather than an unsized span, so
  // the base rule has to keep carrying a width.
  assert.match(styles, /\.avatar \{[^}]*width: 42px;[^}]*height: 42px;[^}]*\}/);
});
