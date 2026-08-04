import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ISSUE_CATEGORY, PHOTO_CATEGORIES, categoryCounts, categoryLabel, filterByCategory,
  photoDay, photosByDay, undatedCount, usedCategories,
} from '../src/jobs/photo-model.js';

const at = (day, hour = 12) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`).toISOString();

const PHOTOS = [
  { id: 'a', category: 'Progress', created_at: at('2026-08-04', 9) },
  { id: 'b', category: 'Damage', created_at: at('2026-08-04', 15) },
  { id: 'c', category: 'Progress', created_at: at('2026-08-03', 10) },
  { id: 'd', category: 'Before', created_at: at('2026-07-28', 8) },
];
const DAILIES = [
  { id: 'd1', report_date: '2026-08-04', notes: 'Stood garage walls' },
  { id: 'd2', report_date: '2026-07-28', notes: 'Set headers' },
];

test('a photo lands on its LOCAL day, not a UTC one', () => {
  // toISOString would report the next day from an afternoon in Arizona, which silently files
  // the afternoon's photos under tomorrow. This bug has already shipped twice in this repo.
  const evening = new Date('2026-08-04T18:30:00');
  assert.equal(photoDay(evening.toISOString()), '2026-08-04');
  const model = readFileSync(new URL('../src/jobs/photo-model.js', import.meta.url), 'utf8');
  assert.ok(!/toISOString\(\)\.slice/.test(model), 'the day must be built from local parts');
});

test('a missing or unparseable timestamp yields no day rather than a wrong one', () => {
  assert.equal(photoDay(''), '');
  assert.equal(photoDay(undefined), '');
  assert.equal(photoDay('not a date'), '');
});

test('photos group by day, newest day first', () => {
  const groups = photosByDay(PHOTOS, DAILIES);
  assert.deepEqual(groups.map((g) => g.day), ['2026-08-04', '2026-08-03', '2026-07-28']);
  assert.deepEqual(groups[0].photos.map((p) => p.id), ['b', 'a'], 'newest first inside the day too');
});

test('each day carries its daily report, and days without one say null', () => {
  // The pairing is the point: a day's photos and the day's write-up are the same event.
  const groups = photosByDay(PHOTOS, DAILIES);
  assert.equal(groups[0].daily.id, 'd1');
  assert.equal(groups[1].daily, null, '2026-08-03 has photos but no daily');
  assert.equal(groups[2].daily.id, 'd2');
});

test('undated photos are counted rather than silently dropped', () => {
  const withOrphan = [...PHOTOS, { id: 'x', category: 'Other', created_at: '' }];
  assert.equal(photosByDay(withOrphan, DAILIES).reduce((n, g) => n + g.photos.length, 0), 4);
  assert.equal(undatedCount(withOrphan), 1);
  assert.equal(undatedCount(PHOTOS), 0);
});

test('counts are per stored category, defaulting to Other', () => {
  const counts = categoryCounts([...PHOTOS, { id: 'e', created_at: at('2026-08-04') }]);
  assert.equal(counts.get('Progress'), 2);
  assert.equal(counts.get('Damage'), 1);
  assert.equal(counts.get('Other'), 1, 'a photo with no category is Other, not undefined');
});

test('only categories actually present get a chip, in the declared order', () => {
  const used = usedCategories(PHOTOS);
  assert.deepEqual(used.map((c) => c.value), ['Before', 'Progress', 'Damage']);
  assert.deepEqual(used.map((c) => c.count), [1, 2, 1]);
});

test('a category nobody declared still gets a chip rather than disappearing', () => {
  // Old rows carry whatever was written at the time; hiding them would hide the photos.
  const used = usedCategories([...PHOTOS, { id: 'z', category: 'Legacy', created_at: at('2026-08-01') }]);
  assert.ok(used.some((c) => c.value === 'Legacy'), 'unknown categories must still be reachable');
  assert.equal(used[used.length - 1].value, 'Legacy', 'and sort after the known ones');
});

test('the stored vocabulary is not renamed to match the design wording', () => {
  // job_files already holds these values. Renaming them would orphan every existing row, so
  // the design's wording is a LABEL over the stored value.
  assert.equal(categoryLabel('Before'), 'Pre-job');
  assert.equal(categoryLabel('Damage'), 'Issues');
  assert.equal(categoryLabel('Delivery'), 'Deliveries');
  assert.ok(PHOTO_CATEGORIES.every((c) => c.value && c.label));
  assert.equal(categoryLabel('Whatever'), 'Whatever', 'an unknown value labels as itself');
});

test('filtering by category, with All meaning no filter', () => {
  assert.equal(filterByCategory(PHOTOS, 'Progress').length, 2);
  assert.equal(filterByCategory(PHOTOS, 'All').length, 4);
  assert.equal(filterByCategory(PHOTOS, '').length, 4);
  assert.equal(filterByCategory(PHOTOS, 'Nothing').length, 0);
});

test('the issue badge keys on a real stored category', () => {
  assert.ok(PHOTO_CATEGORIES.some((c) => c.value === ISSUE_CATEGORY));
  assert.equal(categoryLabel(ISSUE_CATEGORY), 'Issues');
});

test('empty input never throws', () => {
  assert.deepEqual(photosByDay(), []);
  assert.deepEqual(usedCategories(), []);
  assert.deepEqual(filterByCategory(), []);
  assert.equal(undatedCount(), 0);
});
