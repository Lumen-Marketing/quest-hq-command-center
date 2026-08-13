// Reading the copy-across mapping rows off the field config panel.
//
// Separate from ./relationship-pull.js on purpose. main.js reads these rows out of the DOM
// synchronously when the panel is collected, so whatever it imports lands in the entry bundle;
// the compatibility table next door is only ever needed by the lazily-fetched config UI, and
// importing it here would drag the whole thing forward for one twenty-line helper.

/**
 * Normalise the rows, dropping what cannot mean anything.
 *
 * `keepPartial` is for a panel that is still open: a row is half-chosen for as long as it
 * takes to choose the other half, and deleting it there would take the row away from the
 * person filling it in. Saving is where a row stops being in progress -- an unfinished one
 * copies nothing, so it is dropped rather than stored to puzzle over later.
 */
export function readPullRows(rows, { keepPartial = false } = {}) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    const from = String(row?.from || '').trim();
    const to = String(row?.to || '').trim();
    if (keepPartial) {
      if (!from && !to) continue;
      if (to && seen.has(to)) continue;
      if (to) seen.add(to);
      out.push({ from, to });
      continue;
    }
    if (!from || !to) continue;
    // One source per destination. Two rows writing the same field means the second silently
    // wins, which is a rule nobody can see in the UI.
    if (seen.has(to)) continue;
    seen.add(to);
    out.push({ from, to });
  }
  return out;
}
