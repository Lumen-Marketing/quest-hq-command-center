import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The dialog moved into its own fetched-on-demand chunk to pay the bundle budget, and
// main.js keeps a loader shim of the same name — so its markup has to be read from both, or
// every assertion below matches the shim and proves nothing.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  + readFileSync(new URL('../src/crm/bulk-modals.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
// The list follows the v1 structure now and lives in its own fetched-on-demand module.
const jobList = readFileSync(new URL('../src/jobs/job-list.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The dialog lives in the module and main.js keeps a shim of the same name, so search the
// module first — indexOf on the concatenation finds the shim and proves nothing.
const bulkModals = readFileSync(new URL('../src/crm/bulk-modals.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const inModule = bulkModals.indexOf(`function ${name}(`);
  if (inModule !== -1) return bulkModals.slice(inModule, bulkModals.indexOf('\n  }\n', inModule));
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};
const handler = (action) => {
  const at = main.indexOf(`if (action === '${action}') {`);
  assert.notEqual(at, -1, `${action} handler should exist`);
  return main.slice(at, main.indexOf('\n    return;\n  }', at));
};

// --- selection ---------------------------------------------------------------------------

test('a selection can never outlive the rows it was made on', () => {
  // Otherwise a filter change leaves ids ticked for jobs that are no longer on screen, and
  // Delete would take records the person cannot see.
  assert.match(fn('selectedJobRows'), /return filteredJobs\(companyId\)\.filter\(\(job\) => picked\.has\(job\.id\)\)/);
});

test('ticking a row does not also open the job', () => {
  // The row itself is a button; without this the checkbox navigates away mid-selection.
  assert.match(handler('toggle-job-select'), /event\.stopPropagation\(\);/);
});

test('select-all covers what is on screen and clears only that', () => {
  const body = handler('toggle-job-select-all');
  assert.match(body, /const rows = filteredJobs\(activeCompanyId\(\)\)/);
  // Unticking under a filter must not discard a selection made in a wider view.
  assert.match(body, /\.filter\(\(id\) => !rows\.some\(\(job\) => job\.id === id\)\)/);
  assert.match(body, /\[\.\.\.new Set\(\[\.\.\.\(state\.selectedJobIds \|\| \[\]\), \.\.\.rows\.map\(\(job\) => job\.id\)\]\)\]/);
});

test('one job or many, the same path handles it', () => {
  // "Delete 1" is as valid as "Delete 12"; nothing gates on a minimum.
  assert.match(jobList, /Delete \$\{selected\.size\}/);
  assert.ok(!/selected\.size > 1/.test(jobList), 'single selection must not be excluded');
});

test('the delete button is hidden from someone who cannot delete', () => {
  assert.match(jobList, /const canManage = can\('jobs\.manage', companyId\)/);
  assert.match(jobList, /\$\{canManage \? `<button[^`]*data-action="jobs-bulk-delete"/);
});

// --- the password gate --------------------------------------------------------------------

test('deleting re-checks the password before anything is removed', () => {
  const body = fn('deleteSelectedJobs');
  assert.match(body, /await confirmAccountPassword\(document\.getElementById\('jobsDeletePw'\)\?\.value \|\| ''\)/);
  assert.ok(
    body.indexOf('!auth.ok') < body.indexOf('recycleDeleteRecord'),
    'the check must gate the deletes, not follow them',
  );
});

test('permission is checked as well as the password, and on both ends', () => {
  // A password proves who you are, not that you may. Checked when opening the dialog and
  // again when it is confirmed, because state can change in between.
  assert.match(handler('jobs-bulk-delete'), /requirePermission\('jobs\.manage'/);
  assert.match(fn('deleteSelectedJobs'), /requirePermission\('jobs\.manage'/);
});

test('the dialog uses the shared re-auth field', () => {
  assert.match(fn('renderJobsBulkDeleteModal'), /reauthPasswordField\('jobsDeletePw'/);
});

// --- what it does -------------------------------------------------------------------------

test('deletes are recoverable, and the dialog says so', () => {
  const body = fn('renderJobsBulkDeleteModal');
  assert.match(body, /Recycle Bin/);
  assert.match(body, /can be restored/);
  assert.match(fn('deleteSelectedJobs'), /recycleDeleteRecord\(\{ type: 'job', id: job\.id, options: \{ silent: true \} \}\)/);
});

test('the dialog names the jobs rather than only counting them', () => {
  const body = fn('renderJobsBulkDeleteModal');
  assert.match(body, /targets\.slice\(0, 8\)/);
  assert.match(body, /…and \$\{n - 8\} more/, 'a truncated list must say it was truncated');
});

test('one failure does not silently swallow the rest', () => {
  const body = fn('deleteSelectedJobs');
  assert.match(body, /if \(ok\) removed \+= 1; else failed\.push\(job\.name\)/);
  assert.match(body, /if \(failed\.length\) showToast\(/);
  assert.match(body, /if \(removed\) showToast\(/);
});

// --- the progress display -------------------------------------------------------------------

test('progress is real, not an indefinite spinner', () => {
  // The deletes run one at a time, so there is an actual count to report.
  const body = fn('renderJobsBulkDeleteModal');
  assert.match(body, /if \(ctx\.busy\) \{/);
  assert.match(body, /const pct = Math\.round\(\(done \/ total\) \* 100\)/);
  assert.match(body, /\$\{done\} of \$\{total\} done/);
  assert.match(body, /role="status" aria-live="polite"/, 'a screen reader should hear the progress too');
});

test('the bar cannot report more done than there were', () => {
  assert.match(fn('renderJobsBulkDeleteModal'), /const done = Math\.min\(ctx\.done \|\| 0, total\);/);
  assert.match(fn('renderJobsBulkDeleteModal'), /const total = ctx\.total \|\| n \|\| 1;/, 'never divide by zero');
});

test('the batch repaints the dialog, not the whole page, on every step', () => {
  // A full render() per job would rebuild the page behind the modal a dozen times while the
  // rows it is drawing are being deleted underneath it.
  const body = fn('deleteSelectedJobs');
  assert.match(body, /updateModalOnly\(\);/);
  assert.ok(!/\n    render\(\);/.test(body.slice(body.indexOf('for (const job of targets)'), body.indexOf('state.selectedJobIds ='))), 'no full render inside the loop');
  assert.match(fn('updateModalOnly'), /overlay\.outerHTML = renderActiveModal\(state\.route, activeSession\(\)\)/);
});

test('the dialog cannot be dismissed midway through', () => {
  // Closing it would leave the batch running with nothing on screen saying so.
  assert.match(fn('renderJobsBulkDeleteModal'), /'wb-modal-sm jobs-delete-busy'/);
  assert.match(css, /\.jobs-delete-busy \.modal-head-actions \{ display: none; \}/);
});

test('the spinner respects the motion preference', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.jobs-delete-spinner \{ animation-duration: 2\.4s; \}/);
});

// --- layout ---------------------------------------------------------------------------------

test('the checkbox column is added to the jobs table without disturbing other tables', () => {
  // `.table-head` is a shared rule; widening it there would shift every table using it.
  assert.match(css, /\.jobs-table \.table-head,\n\.jobs-table \.table-row \{\n  grid-template-columns: 34px minmax\(220px, 1\.3fr\)/);
  const shared = css.slice(css.indexOf('.table-head,\n.jobs-table .table-row {'));
  assert.match(shared.slice(0, 200), /grid-template-columns: minmax\(220px, 1\.3fr\)/, 'the shared rule keeps its seven columns');
});

test('the narrow layout hides one column further along, now the checkbox is first', () => {
  assert.match(css, /\.jobs-table \.table-head span:nth-child\(n\+6\),\n  \.jobs-table \.table-row span:nth-child\(n\+6\) \{ display: none; \}/);
});
