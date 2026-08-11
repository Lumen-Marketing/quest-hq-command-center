import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Copy and QR on a url field did nothing on the record PAGE. wbUrlControl renders them
// anywhere a url field is shown, but the handlers were bound inside the record MODAL only and
// scoped to its overlay -- so on the page both buttons drew correctly and were inert.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const recordPage = readFileSync(join(root, 'src', 'workspace', 'record-page.js'), 'utf8');

test('the binding is a function of the root it searches, not of the modal', () => {
  const at = main.indexOf('function wbBindUrlControls(root)');
  assert.notEqual(at, -1, 'the handlers should not live inline in the modal mount');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /root\.querySelectorAll\('\[data-wb-url-copy\]'\)/);
  assert.match(body, /root\.querySelectorAll\('\[data-wb-url-qr\]'\)/);
  assert.match(body, /if \(!root\) return;/);
});

test('both surfaces bind it', () => {
  // The modal, scoped to its overlay...
  assert.match(main, /wbBindUrlControls\(overlay\);/);
  // ...and every workspace paint, which is what the record page needed.
  assert.match(main, /wbBindUrlControls\(document\);/);
  // The page really does render the control, so this is not a theoretical fix.
  assert.match(recordPage, /f\.type === 'url' \? wbUrlControl\(item\.values\[f\.id\]\)/);
});

test('copy reports both outcomes', () => {
  const at = main.indexOf('function wbBindUrlControls(root)');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /await navigator\.clipboard\.writeText\(url\);/);
  assert.match(body, /Link copied to clipboard\./);
  // Clipboard access can be refused; silence would look identical to the bug just fixed.
  assert.match(body, /Could not copy — select and copy manually\./);
});

test('the QR toggle keeps its accessible state in step', () => {
  const at = main.indexOf('function wbBindUrlControls(root)');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /button\.setAttribute\('aria-expanded', show \? 'true' : 'false'\);/);
  assert.match(main, /data-wb-url-qr aria-expanded="false"/, 'and starts collapsed');
});
