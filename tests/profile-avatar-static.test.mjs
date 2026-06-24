import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('profile modal supports avatar crop and zoom before save', () => {
  assert.match(source, /data-profile-cropper/);
  assert.match(source, /data-profile-crop-canvas/);
  assert.match(source, /data-profile-crop-zoom/);
  assert.match(source, /data-profile-crop-x/);
  assert.match(source, /data-profile-crop-y/);
  assert.match(source, /function prepareProfileAvatarCrop\(formNode\)/);
  assert.match(source, /function updateProfileAvatarCrop\(formNode\)/);
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
  assert.match(styles, /background: #fff;/);
  assert.match(styles, /\.profile-cropper \{/);
});

test('profile modal close removes the account route query so it stays closed', () => {
  assert.match(source, /function closeActiveModal\(\)/);
  assert.match(source, /route\.params\?\.get\('account'\) === 'profile'/);
  assert.match(source, /params\.delete\('account'\)/);
  assert.match(source, /navigate\(`\$\{route\.path\}\$\{search \? `\?\$\{search\}` : ''\}`,\s*\{ replace: true \}\)/);
});
