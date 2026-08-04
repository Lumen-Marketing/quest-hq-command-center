// The arithmetic behind the job file.
//
// Every number in Abe's Jobs design is derived from the production records rather than typed
// in: the day count, the streak of good/ok/rough days, the projected net, what is billable.
// Keeping that here means it can be tested against fixtures instead of against a screen.

export const PRODUCTION_RATINGS = ['good', 'ok', 'rough'];
export const BUCKET_STATUSES = ['open', 'final', 'later'];
export const DRAW_STATUSES = ['locked', 'unlocked', 'paid'];
/** In order. The gap between "sent" and "acknowledged" is where change-order money is lost. */
export const CO_STEPS = ['requested', 'priced', 'sent', 'accepted', 'acknowledged'];

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const text = (v) => String(v ?? '').trim();
const list = (v) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);
const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

export function normalizeDaily(row = {}) {
  return {
    id: text(row.id),
    company_id: text(row.company_id),
    job_id: text(row.job_id),
    report_date: text(row.report_date).slice(0, 10),
    crew_label: text(row.crew_label),
    crew_names: list(row.crew_names),
    production: oneOf(text(row.production), PRODUCTION_RATINGS, 'good'),
    production_note: text(row.production_note),
    // Tri-state on purpose: null means the question was never answered, which is different
    // from answering "no". Only the second is worth chasing someone about.
    site_cleaned: row.site_cleaned === null || row.site_cleaned === undefined ? null : !!row.site_cleaned,
    materials_ok: row.materials_ok === null || row.materials_ok === undefined ? null : !!row.materials_ok,
    materials_needed: list(row.materials_needed),
    notes: text(row.notes),
    photo_count: Math.max(0, Math.trunc(num(row.photo_count))),
    created_at: text(row.created_at),
  };
}

export function normalizeCostBucket(row = {}) {
  return {
    id: text(row.id),
    company_id: text(row.company_id),
    job_id: text(row.job_id),
    name: text(row.name) || 'Bucket',
    expected: num(row.expected),
    spent: num(row.spent),
    status: oneOf(text(row.status), BUCKET_STATUSES, 'open'),
    note: text(row.note),
    sort_order: Math.trunc(num(row.sort_order)),
  };
}

export function normalizeDraw(row = {}) {
  return {
    id: text(row.id),
    company_id: text(row.company_id),
    job_id: text(row.job_id),
    label: text(row.label) || 'Draw',
    amount: num(row.amount),
    status: oneOf(text(row.status), DRAW_STATUSES, 'locked'),
    invoiced_at: text(row.invoiced_at),
    paid_at: text(row.paid_at),
    sort_order: Math.trunc(num(row.sort_order)),
  };
}

export function normalizeChangeOrder(row = {}) {
  return {
    id: text(row.id),
    company_id: text(row.company_id),
    job_id: text(row.job_id),
    title: text(row.title) || 'Change order',
    description: text(row.description),
    price: num(row.price),
    cost: num(row.cost),
    step: oneOf(text(row.step), CO_STEPS, 'requested'),
    requested_by: text(row.requested_by),
    asked_via: text(row.asked_via),
    sent_via: text(row.sent_via),
    execute_when: text(row.execute_when) || 'on_acceptance',
    accepted_at: text(row.accepted_at),
    created_at: text(row.created_at),
  };
}

export function normalizePlan(row = {}) {
  return {
    id: text(row.id),
    company_id: text(row.company_id),
    job_id: text(row.job_id),
    name: text(row.name) || 'Plan',
    version: text(row.version) || 'v1',
    is_current: !!row.is_current,
    created_at: text(row.created_at),
  };
}

/** Newest first. Dates are ISO, so a string sort is the date sort. */
export function sortDailies(dailies) {
  return [...dailies].sort((a, b) => (a.report_date < b.report_date ? 1 : a.report_date > b.report_date ? -1 : 0));
}

/**
 * The last `count` days as ratings, oldest first -- the dots in the list and on the overview.
 *
 * By DAY, not by row: two crews on one job is one day of progress, and the worse of the two
 * is the one worth showing. A job that went badly for one crew did not have a good day.
 */
export function dailyStreak(dailies, count = 4) {
  const worstByDay = new Map();
  const rank = { good: 0, ok: 1, rough: 2 };
  for (const daily of dailies) {
    const current = worstByDay.get(daily.report_date);
    if (!current || rank[daily.production] > rank[current]) worstByDay.set(daily.report_date, daily.production);
  }
  return [...worstByDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-count)
    .map(([, rating]) => rating);
}

/** How many days this job has actually been worked, which is what "day 9" means. */
export function daysWorked(dailies) {
  return new Set(dailies.map((d) => d.report_date)).size;
}

/**
 * Two poor days in a row is the signal worth surfacing -- one bad day is weather, two is a
 * problem nobody has raised yet.
 */
export function isStruggling(dailies) {
  const streak = dailyStreak(dailies, 2);
  return streak.length === 2 && streak.every((r) => r !== 'good');
}

/** No daily on the last working day, for a job that is supposed to be running. */
export function missedDaily(dailies, todayIso) {
  if (!dailies.length) return false;
  const latest = sortDailies(dailies)[0].report_date;
  return latest < todayIso;
}

/**
 * What the job is actually going to make.
 *
 * A bucket marked final is a fact and counts at what was spent. One still open is a guess, so
 * it counts at whichever is higher -- what was expected, or what has already gone out the
 * door. Taking the expected figure alone would let an overspent bucket quietly flatter the
 * net until the day it closed.
 */
export function projectedNet(ticket, buckets) {
  const spent = buckets.reduce((sum, b) => sum + b.spent, 0);
  const projected = buckets.reduce(
    (sum, b) => sum + (b.status === 'final' ? b.spent : Math.max(b.expected, b.spent)),
    0,
  );
  const finals = buckets.filter((b) => b.status === 'final').length;
  const net = num(ticket) - projected;
  return {
    spent,
    projected,
    net,
    margin: num(ticket) > 0 ? (net / num(ticket)) * 100 : 0,
    finals,
    total: buckets.length,
    // Every bucket closed means the net is no longer a projection.
    firm: buckets.length > 0 && finals === buckets.length,
  };
}

export function bucketProgress(bucket) {
  const over = bucket.spent > bucket.expected && bucket.expected > 0;
  const pct = bucket.expected > 0
    ? Math.min(100, (bucket.spent / bucket.expected) * 100)
    : (bucket.spent > 0 ? 100 : 0);
  return { over, pct, unbudgeted: bucket.expected === 0 && bucket.spent > 0 };
}

export function drawTotals(draws) {
  const ready = draws.filter((d) => d.status === 'unlocked');
  return {
    ready,
    readyTotal: ready.reduce((sum, d) => sum + d.amount, 0),
    paidTotal: draws.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
    contract: draws.reduce((sum, d) => sum + d.amount, 0),
  };
}

/** Position in CO_STEPS, for the progress pills. -1 for an unknown step. */
export function coStepIndex(step) {
  return CO_STEPS.indexOf(step);
}

/**
 * The change orders that are costing money by sitting still: priced but not sent, or accepted
 * but not acknowledged by the crew, which is the one that gets built wrong.
 */
export function stalledChangeOrders(changeOrders) {
  return changeOrders.filter((co) => co.step === 'priced' || co.step === 'accepted');
}

/** Accepted change orders add to what the job is worth. */
export function ticketWithChangeOrders(job, changeOrders) {
  const accepted = changeOrders.filter((co) => co.step === 'accepted' || co.step === 'acknowledged');
  return num(job?.estimate_total) + accepted.reduce((sum, co) => sum + co.price, 0);
}
