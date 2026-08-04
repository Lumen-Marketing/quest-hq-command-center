import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const jobFile = readFileSync(new URL('../src/jobs/job-file.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('the photos tab is no longer a stub', () => {
  assert.ok(!/Photo upload lands with the next phase/.test(jobFile), 'the placeholder must be gone');
  assert.match(jobFile, /active === 'photos' \? photosTab\(job, data, companyId\)/);
});

test('photos come from job_files, not a second table', () => {
  // One table, one bucket, one upload path -- so a photo added from the drive and one added
  // from the job show up in both places.
  assert.match(main, /photos: jobPhotosFor\(id\),/);
  assert.match(main, /function jobPhotosFor\(jobId/);
});

test('the tab badge counts real files, not the number a foreman typed', () => {
  // data.photoCount is what somebody entered on a daily. It legitimately differs from the
  // files uploaded, so the tab counts the files and the daily keeps its own number.
  assert.match(jobFile, /photos: \(data\.photos \|\| \[\]\)\.length,/);
  assert.match(main, /photoCount: dailies\.reduce/, 'the daily figure still exists');
});

test('capture reuses the existing uploader rather than a second one', () => {
  // There was already a working camera/device modal reachable from the jobs board. A second
  // uploader here would drift from it.
  assert.match(jobFile, /data-action="open-job-photos" data-job-id="\$\{h\(job\.id\)\}"/);
  assert.match(main, /if \(action === 'open-job-photos'\)/);
});

test('the tab filter is independent of the uploader filter', () => {
  // Narrowing the tab to Issues should not silently narrow what the uploader shows next time.
  assert.match(main, /jobFilePhotoCategory: 'All',/);
  assert.match(main, /state\.jobFilePhotoCategory = node\.dataset\.category \|\| 'All';/);
  assert.match(main, /photoFilter: \(\) => state\.jobFilePhotoCategory,/);
  assert.match(main, /jobPhotoCategory/, 'the modal keeps its own');
});

test('Delivery was added to the stored vocabulary, and nothing was renamed', () => {
  // job_files already holds the other six values; renaming would orphan every existing row.
  assert.match(main, /const JOB_PHOTO_CATEGORIES = \['Before', 'Inspection', 'Damage', 'Delivery', 'Progress', 'After', 'Other'\];/);
});

test('a day says whether it has a daily, either way', () => {
  assert.match(jobFile, /Attached to that day's daily/);
  assert.match(jobFile, /No daily for this day/);
});

test('an issue photo is badged', () => {
  assert.match(jobFile, /photo\.category === ISSUE_CATEGORY \? '<span class="jf-photo-flag">Issue<\/span>' : ''/);
});

test('photos with no date are reported rather than silently dropped', () => {
  assert.match(jobFile, /have no date recorded and are not shown above/);
});

test('a viewer gets no capture button', () => {
  assert.match(jobFile, /const canManage = can\('files\.manage', companyId\);/);
  assert.match(jobFile, /const capture = canManage/);
});

test('the tab has styles for everything it renders', () => {
  for (const cls of ['jf-photo-chip', 'jf-photo-grid', 'jf-photo-flag', 'jf-photo-cap', 'jf-photo-day']) {
    assert.ok(css.includes(`.${cls}`), `.${cls} is rendered but unstyled`);
  }
  // The shared thumbnail helper wraps its image, so the wrapper has to fill the tile or every
  // photo renders as a tiny image in the corner of a grey square.
  assert.match(css, /\.jf-photo > span:first-child \{[^}]*height: 100%/);
});
