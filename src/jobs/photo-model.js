// Job photos, arranged the way the v1 design reads them: by the day they were taken, with
// the day's daily report sitting beside them.
//
// Pure. It is handed the job's photo files and its dailies and returns groups; it does no
// fetching, no signing and no DOM.
//
// Photos are ordinary rows in job_files -- the same table, bucket and upload path the drive
// uses. A separate photos table would have meant two things to keep in step for no gain,
// and the drive would have stopped showing job photos the day it shipped.

/**
 * The stored category vocabulary. These are the values already written to job_files, so they
 * are not renamed to match the design's wording -- renaming would orphan every existing row.
 * `label` is what the design calls them; `value` is what is in the database.
 */
export const PHOTO_CATEGORIES = [
  { value: 'Before', label: 'Pre-job' },
  { value: 'Progress', label: 'Progress' },
  { value: 'Damage', label: 'Issues' },
  { value: 'Delivery', label: 'Deliveries' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'After', label: 'Closeout' },
  { value: 'Other', label: 'Other' },
];

/** Damage is the one that means "look at this now", so it is the one that gets a badge. */
export const ISSUE_CATEGORY = 'Damage';

export const categoryLabel = (value) => PHOTO_CATEGORIES.find((c) => c.value === value)?.label || String(value || 'Other');

/** The local calendar day a photo belongs to. Never toISOString -- that is UTC, and from an
 *  afternoon in Arizona it reports tomorrow. */
export function photoDay(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function categoryCounts(photos = []) {
  const counts = new Map();
  photos.forEach((p) => {
    const key = p.category || 'Other';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

/** Only the categories actually present, in the declared order, plus their counts. */
export function usedCategories(photos = []) {
  const counts = categoryCounts(photos);
  const known = new Set(PHOTO_CATEGORIES.map((c) => c.value));
  const extras = [...counts.keys()].filter((k) => !known.has(k)).sort()
    .map((value) => ({ value, label: categoryLabel(value) }));
  return [...PHOTO_CATEGORIES, ...extras]
    .filter((c) => counts.has(c.value))
    .map((c) => ({ ...c, count: counts.get(c.value) }));
}

export const filterByCategory = (photos = [], category = '') => (
  !category || category === 'All' ? photos : photos.filter((p) => (p.category || 'Other') === category)
);

/**
 * Photos grouped by day, newest first, each carrying the daily report for that day if there
 * is one. That pairing is the point of the screen: a day's photos and the day's write-up are
 * the same event, and looking at one without the other is how disputes start.
 */
export function photosByDay(photos = [], dailies = []) {
  const byDay = new Map();
  photos.forEach((photo) => {
    const day = photoDay(photo.created_at);
    if (!day) return;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(photo);
  });
  const dailyByDay = new Map();
  dailies.forEach((d) => {
    const day = String(d.report_date || '').slice(0, 10);
    if (day && !dailyByDay.has(day)) dailyByDay.set(day, d);
  });
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, list]) => ({
      day,
      daily: dailyByDay.get(day) || null,
      // Newest first within the day, matching the order they arrive in.
      photos: list.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
    }));
}

/** Photos with no usable timestamp would vanish from a by-day view, so they are counted. */
export const undatedCount = (photos = []) => photos.filter((p) => !photoDay(p.created_at)).length;
