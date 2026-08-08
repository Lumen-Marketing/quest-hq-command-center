import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('profile modal supports avatar crop and zoom before save', () => {
  assert.match(source, /data-profile-cropper/);
  assert.match(source, /data-profile-avatar-crop-modal/);
  assert.match(source, /data-profile-crop-canvas/);
  assert.match(source, /data-profile-crop-stage/);
  assert.match(source, /data-profile-crop-zoom/);
  assert.match(source, /data-profile-crop-x/);
  assert.match(source, /data-profile-crop-y/);
  assert.match(source, /data-action="apply-profile-avatar-crop"/);
  assert.match(source, /data-action="cancel-profile-avatar-crop"/);
  assert.match(source, /function prepareProfileAvatarCrop\(formNode\)/);
  assert.match(source, /function updateProfileAvatarCrop\(formNode/);
  assert.match(source, /function bindProfileAvatarCropper\(formNode\)/);
  assert.match(source, /function moveProfileAvatarCrop\(formNode, deltaX, deltaY\)/);
  assert.match(source, /\.addEventListener\('pointerdown'/);
  assert.match(source, /\.addEventListener\('pointermove'/);
  assert.match(source, /canvas\.toDataURL\('image\/png'\)/);
});

test('profile save uploads the cropped avatar instead of raw file when present', () => {
  assert.match(source, /const croppedUrl = String\(data\.get\('avatar_cropped_url'\)/);
  assert.match(source, /if \(croppedUrl\.startsWith\('data:image\/'\)\) \{/);
  assert.match(source, /const croppedFile = dataUrlToFile\(croppedUrl, `avatar-\$\{Date\.now\(\)\}\.png`\);/);
  assert.match(source, /function dataUrlToFile\(dataUrl, fileName\)/);
});

test('image avatars do not use the fallback yellow initials background', () => {
  assert.match(source, /class="\$\{h\(`\$\{className\} has-image`\)\}"/);
  assert.match(styles, /\.avatar\.has-image \{/);
  assert.match(styles, /background: var\(--surface\);/);
  assert.match(styles, /\.profile-cropper \{/);
});

test('profile modal close removes the account route query so it stays closed', () => {
  assert.match(source, /function closeActiveModal\(\)/);
  assert.match(source, /route\.params\?\.get\('account'\) === 'profile'/);
  assert.match(source, /params\.delete\('account'\)/);
  assert.match(source, /navigate\(`\$\{route\.path\}\$\{search \? `\?\$\{search\}` : ''\}`,\s*\{ replace: true \}\)/);
});

// "Add loading animation while saving profile and also close this modal once profile is
// saved." The save could upload and compress a photo before writing a row, so the button sat
// doing nothing; and state.modal was cleared without a repaint, so the dialog stayed on screen
// with its own "Profile saved." toast in front of it.

test('saving a profile says it is working, and only once', () => {
  const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const fn = source.slice(source.indexOf('async function saveProfile(formNode)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const done = beginSubmitting\(formNode, 'Saving…'\);/);
  // Null means the button is already disabled -- a second submit while the first is in flight.
  assert.match(body, /if \(!done\) return;/);
  // Released on every path, or a refused save leaves a permanently disabled button.
  assert.match(body, /\} finally \{\s*[\r\n]+[\s\S]{0,200}?done\(\);/);
});

test('a saved profile closes its dialog', () => {
  const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const fn = source.slice(source.indexOf('async function saveProfileFields(formNode)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /state\.modal = '';/);
  // Clearing state without repainting is what left the dialog up.
  assert.ok(
    body.indexOf('state.modal') < body.lastIndexOf('render();'),
    'the repaint has to come after the modal is cleared',
  );
});

test('the bell is called Notifications, not Inbox', () => {
  const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const head = source.slice(source.indexOf('<div class="notification-head">'));
  assert.match(head.slice(0, 400), /<strong>Notifications<\/strong>/);
  // Inbox is the Messages nav label; borrowing it sent people looking for their chats.
  assert.match(source, /^\s{2}messages: 'Inbox',$/m);
});
