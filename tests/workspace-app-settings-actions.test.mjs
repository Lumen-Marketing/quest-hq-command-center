import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../src/workspace/app-settings.js', import.meta.url), 'utf8');
const css = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8'));

const view = main.match(/function wbViewApp\(route, companyId, workspace, app, appLinked = false\)[\s\S]*?\n\}/)[0];
const block = view.match(/if \(tab === 'settings' && !appLinked\) \{[\s\S]*?\n {2}\}/)[0];

// "In the settings in App, I want to see this buttons on top in line with the menu nav:
// Download app, Delete App, Share App, Save."

test('all four sit in the tab row, in the order asked for', () => {
  const order = [...block.matchAll(/data-(wb-download-app|del-app|wb-share-app|save-app)/g)].map((m) => m[1]);
  assert.deepEqual(order, ['wb-download-app', 'del-app', 'wb-share-app', 'save-app']);
});

test('they are the SAME actions, not new ones bound to nothing', () => {
  // Every one of these already had a handler further down the page. Moving the markup and
  // leaving the wiring behind would have drawn four buttons that do nothing.
  for (const attr of ['[data-wb-download-app]', '[data-del-app]', '[data-wb-share-app]', '[data-save-app]']) {
    assert.match(main, new RegExp(`bind\\('\\${attr}'`.replace('\\[', '\\[')), `${attr} lost its binding`);
  }
});

test('nothing is left behind in the body to press twice', () => {
  for (const attr of ['data-wb-download-app', 'data-del-app', 'data-wb-share-app', 'data-save-app']) {
    assert.doesNotMatch(settings, new RegExp(attr), `${attr} is still in the settings body as well`);
  }
});

test('the prose still points at the buttons, now that they are elsewhere', () => {
  // The copy explaining what downloading and sharing DO is worth keeping; it just has to say
  // where the button went, or it reads as a description of a control that is not there.
  assert.match(settings, /<b>Download app<\/b>, above,/);
  assert.match(settings, /<b>Share app<\/b>, above,/);
  assert.match(settings, /<b>App shared<\/b> above to stop sharing it/);
});

test('Save and Delete need permission; Download does not', () => {
  // Downloading is reading, and every role can already read the app.
  const download = block.slice(0, block.indexOf('if (canManage)'));
  assert.match(download, /data-wb-download-app/);
  const gated = block.slice(block.indexOf('if (canManage)'));
  for (const attr of ['data-del-app', 'data-wb-share-app', 'data-save-app']) {
    assert.match(gated, new RegExp(attr));
  }
});

test('a linked app gets none of them', () => {
  // Its name, icon and fields belong to the workspace it came from. There is nothing here to
  // save, share or delete, and offering the buttons would promise an edit that cannot happen.
  assert.match(view, /if \(tab === 'settings' && !appLinked\) \{/);
});

test('Share says which state it is in, so pressing it is not a guess', () => {
  assert.match(block, /\$\{app\.shared \? 'App shared' : 'Share app'\}/);
  assert.match(block, /ti-\$\{app\.shared \? 'circle-check' : 'share'\}/);
});

test('Delete gets air on both sides of it', () => {
  // The asked-for order puts a destructive button between two harmless ones. The order stands;
  // the spacing is what stops a mis-click.
  assert.match(block, /class="btn danger wb-tab-danger"/);
  assert.match(css, /\.wb-tab-actions \.wb-tab-danger \{ margin: 0 6px; \}/);
});

test('the dead rule under the old footer went with it', () => {
  assert.doesNotMatch(css, /\.wb-settings-save/);
  assert.doesNotMatch(settings, /wb-settings-save/);
});
