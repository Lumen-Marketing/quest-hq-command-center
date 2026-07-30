// Pure search / filter / paging for the platform-owner company lists (master panel
// and the Quest approval console). Kept free of DOM and app state so the rules are
// testable on their own.

// The subscription statuses that read as "this company is live".
export const ACTIVE_COMPANY_STATUSES = ['active', 'trialing', 'past_due', 'grace'];

// Terminal lifecycle states deliberately remain distinct. `canceled` is reserved
// for Stripe, while platform archiving and approval rejection write their own
// states. All three are inactive in normal company selectors.
export const ARCHIVED_COMPANY_STATUS = 'archived';
export const INACTIVE_COMPANY_STATUSES = ['archived', 'rejected', 'canceled'];

export const COMPANY_STATUS_FILTERS = [
  ['active', 'Active'],
  ['pending_review', 'Pending review'],
  ['suspended', 'Suspended'],
  ['archived', 'Archived'],
  ['rejected', 'Rejected'],
  ['canceled', 'Canceled'],
  ['all', 'All (incl. inactive)'],
];

export const COMPANY_PAGE_SIZE = 25;

function haystack(row) {
  return [
    row.company_name,
    row.company_id,
    row.short_name,
    row.label,
    row.owner_email,
    row.owner_name,
  ].map((value) => String(value == null ? '' : value).toLowerCase()).join(' ');
}

// Every whitespace-separated term must appear somewhere in the row, so typing
// "rom gmail" narrows instead of widening the way a single substring match would.
export function matchesCompanySearch(row, search) {
  const terms = String(search || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const target = haystack(row);
  return terms.every((term) => target.includes(term));
}

export function isArchivedCompany(row) {
  return String(row?.status || '') === ARCHIVED_COMPANY_STATUS;
}

export function isInactiveCompany(row) {
  return INACTIVE_COMPANY_STATUSES.includes(String(row?.status || ''));
}

// status 'all' shows everything including inactive companies; any other value matches that
// status exactly, except 'active' which covers the whole live family (trialing,
// past_due, grace). Terminal rows are hidden unless explicitly requested.
export function filterCompanyRows(rows, { search = '', status = 'active' } = {}) {
  const list = Array.isArray(rows) ? rows : [];
  return list.filter((row) => {
    if (!matchesCompanySearch(row, search)) return false;
    if (status === 'all') return true;
    if (status === 'active') return ACTIVE_COMPANY_STATUSES.includes(String(row?.status || ''));
    return String(row?.status || '') === status;
  });
}

// Clamps the page so deleting/filtering rows out from under a deep page lands on
// the last real page instead of an empty one.
export function paginate(rows, page = 0, size = COMPANY_PAGE_SIZE) {
  const list = Array.isArray(rows) ? rows : [];
  const perPage = Math.max(1, Number(size) || COMPANY_PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(list.length / perPage));
  const current = Math.min(Math.max(0, Number(page) || 0), pageCount - 1);
  const start = current * perPage;
  return {
    rows: list.slice(start, start + perPage),
    page: current,
    pageCount,
    total: list.length,
    from: list.length ? start + 1 : 0,
    to: Math.min(start + perPage, list.length),
    hasPrev: current > 0,
    hasNext: current < pageCount - 1,
  };
}
