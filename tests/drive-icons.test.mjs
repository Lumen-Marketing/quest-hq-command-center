import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function driveIconRenderers() {
  const start = main.indexOf('function folderIconAsset(');
  const end = main.indexOf('\nfunction titleCase(', start);
  assert.ok(start >= 0 && end > start, 'Drive icon renderers must remain discoverable');
  const source = main.slice(start, end);
  const h = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const fileTypeKind = () => 'pdf';
  const wbFileIcon = (kind) => kind === 'pdf' ? 'ti-file-type-pdf' : 'ti-file';
  return new Function('h', 'fileTypeKind', 'wbFileIcon', `${source}\nreturn { folderIconAsset, fileIconAsset };`)(h, fileTypeKind, wbFileIcon);
}

test('Drive icons render from the bundled icon font instead of a CSP-blocked network image', () => {
  const { folderIconAsset, fileIconAsset } = driveIconRenderers();
  const folder = folderIconAsset({ icon: 'ti-folder-share' }, 'Shared');
  const file = fileIconAsset({ file_name: 'proposal.pdf' }, 'PDF');

  assert.match(folder, /class="ti ti-folder-share asset-icon"/);
  assert.match(file, /class="ti ti-file-type-pdf asset-icon"/);
  assert.doesNotMatch(`${folder}${file}`, /<img|https?:\/\//);
});

test('Drive folder icons reject an invalid class and keep an accessible adjacent-label contract', () => {
  const { folderIconAsset } = driveIconRenderers();
  const markup = folderIconAsset({ icon: 'ti-folder onmouseover=alert(1)' }, 'Shared');

  assert.match(markup, /class="ti ti-folder asset-icon"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.doesNotMatch(markup, /onmouseover|alt=/);
});
