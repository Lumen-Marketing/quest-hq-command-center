// The row under the list that adds things up.
//
// A list of records answers "which ones"; it does not answer "how many, how much, how big on
// average". Every spreadsheet has a total row and this did not, so the answer was export to CSV
// and total it somewhere else -- which is also how the number stops matching the list.
//
// PURE. Values in, one answer out. The awkward parts are the edge cases, not the arithmetic:
// what an empty column averages to, what the mode of nothing is, whether a blank counts. Those
// are worth stating in tests rather than discovering in a table.

/** Fields whose values are numbers, and so can be summed rather than merely counted. */
export const NUMERIC_FIELD_TYPES = new Set([
  'number', 'money', 'duration', 'rating', 'progress', 'calculation', 'rollup', 'autonumber',
]);

/** Fields that carry a fixed list of options, so "count if" can offer the options themselves. */
export const OPTION_FIELD_TYPES = new Set(['category', 'status', 'tags']);

// `mean` is not offered separately: it is the same number as `average`, and two controls that
// compute one thing is a question the reader has to answer before they can use either.
export const SUMMARY_FUNCTIONS = [
  { id: 'none', label: 'None', kind: 'any' },
  { id: 'count', label: 'Count of records', kind: 'any' },
  { id: 'filled', label: 'Filled', kind: 'any' },
  { id: 'empty', label: 'Empty', kind: 'any' },
  { id: 'unique', label: 'Unique values', kind: 'any' },
  { id: 'countIf', label: 'Count if…', kind: 'any', needsValue: true },
  { id: 'sum', label: 'Sum', kind: 'numeric' },
  { id: 'average', label: 'Average', kind: 'numeric' },
  { id: 'median', label: 'Median', kind: 'numeric' },
  { id: 'mode', label: 'Mode', kind: 'numeric' },
  { id: 'min', label: 'Minimum', kind: 'numeric' },
  { id: 'max', label: 'Maximum', kind: 'numeric' },
  { id: 'range', label: 'Range', kind: 'numeric' },
  { id: 'variance', label: 'Variance', kind: 'numeric' },
  { id: 'stdev', label: 'Std deviation', kind: 'numeric' },
];

/**
 * What may be asked of a field.
 *
 * A text column cannot be summed, so offering Sum there is an invitation to a blank answer. It
 * can always be counted, which is why every field gets the `any` set -- that is the whole point
 * of the "for other fields, count the records" half of this.
 */
export function functionsForType(type) {
  const numeric = NUMERIC_FIELD_TYPES.has(type);
  return SUMMARY_FUNCTIONS.filter((fn) => fn.kind === 'any' || numeric);
}

export function isNumericType(type) {
  return NUMERIC_FIELD_TYPES.has(type);
}

const isBlank = (value) => value === null || value === undefined || value === ''
  || (Array.isArray(value) && value.length === 0);

/** Numbers only, blanks dropped. A blank is not a zero: averaging it in would move the answer. */
function numbersIn(values) {
  const out = [];
  for (const value of values) {
    if (isBlank(value)) continue;
    const n = typeof value === 'number' ? value : Number(String(value).replace(/[, ]/g, ''));
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/** Comparison text for "count if": trimmed and case-folded, because nobody types to match. */
const compareKey = (value) => String(value ?? '').trim().toLowerCase();

function modeOf(numbers) {
  const seen = new Map();
  let best = null;
  let bestCount = 0;
  for (const n of numbers) {
    const next = (seen.get(n) || 0) + 1;
    seen.set(n, next);
    // First past the post on a tie: a stable answer beats an arbitrary one, and picking the
    // larger or the later would be just as arbitrary while looking deliberate.
    if (next > bestCount) { best = n; bestCount = next; }
  }
  return { value: best, count: bestCount };
}

function medianOf(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * One answer for one column.
 *
 * `values` are the raw cell values of the rows being summarised -- the SELECTED rows when there
 * is a selection, which is what makes the row worth having: tick four and the total is those
 * four. `display` maps a raw value to what the reader sees, so "count if" can be asked in the
 * words on screen rather than an option id nobody has seen.
 *
 * Returns null when there is nothing to say, which the caller renders as a dash. That is
 * different from 0: no rows is not the same answer as rows that add to nothing.
 */
export function computeSummary(config, values, options = {}) {
  const fn = String(config?.fn || 'none');
  const rows = Array.isArray(values) ? values : [];
  if (fn === 'none') return null;
  if (fn === 'count') return rows.length;

  const filled = rows.filter((value) => !isBlank(value));
  if (fn === 'filled') return filled.length;
  if (fn === 'empty') return rows.length - filled.length;

  const display = typeof options.display === 'function' ? options.display : ((value) => value);

  if (fn === 'unique') {
    return new Set(filled.map((value) => compareKey(display(value)))).size;
  }

  if (fn === 'countIf') {
    const want = compareKey(config?.value);
    if (!want) return null;
    return filled.filter((value) => {
      // A tags field holds several at once, and "count if Roofing" should find a row that is
      // tagged Roofing and two other things.
      const shown = display(value);
      if (Array.isArray(shown)) return shown.some((one) => compareKey(one) === want);
      return compareKey(shown) === want;
    }).length;
  }

  const numbers = numbersIn(rows);
  if (!numbers.length) return null;

  switch (fn) {
    case 'sum': return numbers.reduce((total, n) => total + n, 0);
    case 'average': return numbers.reduce((total, n) => total + n, 0) / numbers.length;
    case 'median': return medianOf(numbers);
    case 'mode': return modeOf(numbers).value;
    case 'min': return Math.min(...numbers);
    case 'max': return Math.max(...numbers);
    case 'range': return Math.max(...numbers) - Math.min(...numbers);
    case 'variance':
    case 'stdev': {
      // Population variance, not sample: the rows on screen ARE the population being described.
      // A sample estimate would be answering a question nobody asked of a list they can see.
      if (numbers.length < 2) return 0;
      const mean = numbers.reduce((total, n) => total + n, 0) / numbers.length;
      const spread = numbers.reduce((total, n) => total + ((n - mean) ** 2), 0) / numbers.length;
      return fn === 'stdev' ? Math.sqrt(spread) : spread;
    }
    default: return null;
  }
}

/** Whole numbers stay whole; the rest are trimmed to something a person reads. */
export function formatSummary(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number') return String(value);
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

/** The label under the number: "Sum", or "Count if Male" so the answer says what it counted. */
export function summaryLabel(config) {
  const fn = SUMMARY_FUNCTIONS.find((item) => item.id === String(config?.fn || 'none'));
  if (!fn || fn.id === 'none') return '';
  if (fn.needsValue) {
    const value = String(config?.value ?? '').trim();
    return value ? `Count if ${value}` : 'Count if…';
  }
  return fn.label;
}

/** Only the columns that were actually asked a question, in the field order of the app. */
export function activeSummaries(fields, summary) {
  const config = summary && typeof summary === 'object' ? summary : {};
  return (Array.isArray(fields) ? fields : [])
    .map((field) => ({ field, config: config[field.id] }))
    .filter(({ config: one }) => one && one.fn && one.fn !== 'none');
}
