import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createDataIO } from '../src/workspace/data-io.js';

// Print, CSV export/import and Download were moved into this module, and four of the
// things they use — clone, downloadText, guardUpload, activeSession — were left out of the
// context object. Download threw a ReferenceError on every click.
//
// Static checks cannot see that: every name is spelled correctly and looks defined. So
// this test CALLS each entry point. A missing binding fails here as a ReferenceError,
// which is the only way to know the context is complete.
//
// The same gap shipped once before, in the Master panel. Both were extractions where the
// context list was written by hand from the code that was moved.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const app = () => ({
  id: 'app-1',
  name: 'Roof Inspections',
  description: 'Sample',
  icon: 'ti-home',
  color: '#e0552d',
  fields: [
    { id: 'f1', label: 'Address', type: 'text', config: {} },
    { id: 'f2', label: 'Stage', type: 'status', config: { options: [{ id: 's1', label: 'New', color: '#f00' }] } },
  ],
  items: [{ id: 'i1', values: { f1: '1 Main St', f2: 's1' }, createdAt: '2026-08-01' }],
  automations: [],
});

// A context that behaves, so anything thrown comes from a missing binding rather than a
// stub returning the wrong shape.
const stubContext = (calls = {}) => ({
  h: (v) => String(v ?? ''),
  showToast: (...args) => { (calls.toasts ||= []).push(args); },
  render: () => {},
  companyName: (id) => String(id),
  wbFind: () => ({ workspace: { id: 'ws-1', name: 'Sales', activity: [] }, app: app() }),
  wbPlainVal: (companyId, workspace, a, field, value) => String(value ?? ''),
  wbSave: () => { calls.saved = true; },
  wbUid: () => 'generated-id',
  wbLogActivity: () => {},
  wbMembers: () => [{ id: 'p1', name: 'Rom' }],
  wbReportContext: () => ({ memberById: () => null, canManage: true }),
  wbLoadReports: () => Promise.resolve({ renderReports: () => '<div>charts</div>' }),
  wbAssignAutoNumbers: () => {},
  clone: (value) => JSON.parse(JSON.stringify(value)),
  downloadText: (filename, text) => { (calls.downloads ||= []).push({ filename, length: text.length }); },
  guardUpload: () => Promise.resolve(true),
  activeSession: () => ({ profile: { id: 'p1', full_name: 'Rom' } }),
});

test('downloading an app produces a file rather than throwing', () => {
  // The reported bug: the button did nothing because the module threw before it got here.
  const calls = {};
  createDataIO(stubContext(calls)).wbDownloadApp('acme', 'ws-1', 'app-1');
  assert.equal(calls.downloads?.length, 1, 'expected exactly one download');
  assert.match(calls.downloads[0].filename, /\.questapp\.json$/);
  assert.ok(calls.downloads[0].length > 50, 'the file should carry the app');
});

test('the downloaded file carries fields, records and automations', () => {
  let captured = '';
  const ctx = stubContext();
  ctx.downloadText = (_name, text) => { captured = text; };
  createDataIO(ctx).wbDownloadApp('acme', 'ws-1', 'app-1');
  const parsed = JSON.parse(captured);
  const payload = parsed.app || parsed;
  assert.ok(JSON.stringify(payload).includes('Address'), 'fields should be included');
  assert.ok(JSON.stringify(payload).includes('1 Main St'), 'records should be included');
});

test('exporting to CSV produces a file', () => {
  const calls = {};
  createDataIO(stubContext(calls)).wbExportCsv('acme', 'ws-1', 'app-1');
  assert.equal(calls.downloads?.length, 1);
  assert.match(calls.downloads[0].filename, /\.csv$/);
});

test('every entry point runs without a missing binding', () => {
  // Import builds a file input, so it needs a document. The point of this test is that no
  // call dies on a name the context never supplied, so the DOM is stubbed just far enough
  // to get past that — a ReferenceError for `document` would be Node, not a real defect.
  const noop = () => {};
  const element = () => ({
    click: noop, remove: noop, addEventListener: noop, setAttribute: noop,
    style: {}, files: [], value: '',
  });
  globalThis.document = { createElement: element, body: { appendChild: noop, removeChild: noop } };
  try {
    const io = createDataIO(stubContext());
    for (const name of ['wbDownloadApp', 'wbExportCsv', 'wbImportCsvPrompt']) {
      try {
        io[name]('acme', 'ws-1', 'app-1');
      } catch (error) {
        assert.notEqual(error.name, 'ReferenceError', `${name} is missing a binding: ${error.message}`);
      }
    }
  } finally {
    delete globalThis.document;
  }
});

test('the module exports everything main.js delegates to', () => {
  const io = createDataIO(stubContext());
  const delegated = [...main.matchAll(/wbDataIO\('([a-zA-Z]+)'/g)].map((m) => m[1]);
  assert.ok(delegated.length >= 5, `expected the delegators, found ${delegated.length}`);
  for (const name of delegated) {
    assert.equal(typeof io[name], 'function', `${name} is delegated but not exported`);
  }
});

test('main.js passes everything the module destructures', () => {
  // Belt and braces beside the calls above: catches a binding added to the module's
  // context list without a matching addition on the main.js side.
  const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const wanted = [...io.slice(io.indexOf('const {'), io.indexOf('} = ctx;')).matchAll(/([A-Za-z_$][\w$]*),/g)].map((m) => m[1]);
  assert.ok(wanted.length >= 15, `expected the context list, parsed ${wanted.length}`);

  const at = main.indexOf('wbDataIOModule = mod.createDataIO({');
  assert.notEqual(at, -1, 'main.js should build the data-io context');
  const passed = main.slice(at, main.indexOf('});', at));
  const missing = wanted.filter((key) => !new RegExp(`\\b${key}\\b`).test(passed));
  assert.deepEqual(missing, [], `main.js does not pass: ${missing.join(', ')} — these throw on use`);
});
