import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANY_PAGE_SIZE,
  filterCompanyRows,
  isArchivedCompany,
  matchesCompanySearch,
  paginate,
} from '../src/platform-directory.js';

const ROWS = [
  { company_id: 'lumen', company_name: 'Lumen Marketing', owner_email: 'info@lumenmarketingusa.com', status: 'active' },
  { company_id: 'rom', company_name: 'Rom', owner_email: 'eugenioiromanjuan@gmail.com', status: 'trialing' },
  { company_id: 'esscore', company_name: 'ESSCORE', owner_email: 'meromero0013@gmail.com', status: 'active' },
  { company_id: '111', company_name: '111', owner_email: 'info@lumenmarketingusa.com', status: 'canceled' },
  { company_id: 'test-2', company_name: 'test 2', owner_email: 'info@lumenmarketingusa.com', status: 'pending_review' },
  { company_id: 'laptop', company_name: 'laptop', owner_email: 'azgrid07@gmail.com', status: 'suspended' },
];

test('archived companies are hidden by default', () => {
  const visible = filterCompanyRows(ROWS, { status: 'active' });
  assert.equal(visible.some(isArchivedCompany), false);
  assert.deepEqual(visible.map((r) => r.company_id), ['lumen', 'rom', 'esscore']);
});

test('the active filter covers the whole live family, not just the literal status', () => {
  // trialing/past_due/grace are all "live" — filtering to Active must not drop them.
  const ids = filterCompanyRows(ROWS, { status: 'active' }).map((r) => r.company_id);
  assert.ok(ids.includes('rom'), 'expected the trialing company to count as active');
});

test('archived companies are reachable through the Archived filter', () => {
  const archived = filterCompanyRows(ROWS, { status: 'canceled' });
  assert.deepEqual(archived.map((r) => r.company_id), ['111']);
});

test('the all filter includes archived rows', () => {
  assert.equal(filterCompanyRows(ROWS, { status: 'all' }).length, ROWS.length);
});

test('search matches name, id and owner email', () => {
  assert.deepEqual(filterCompanyRows(ROWS, { status: 'all', search: 'esscore' }).map((r) => r.company_id), ['esscore']);
  assert.deepEqual(filterCompanyRows(ROWS, { status: 'all', search: 'azgrid07' }).map((r) => r.company_id), ['laptop']);
  assert.deepEqual(filterCompanyRows(ROWS, { status: 'all', search: 'test-2' }).map((r) => r.company_id), ['test-2']);
});

test('search is case-insensitive and every term must match', () => {
  assert.equal(matchesCompanySearch(ROWS[0], 'LUMEN marketing'), true);
  // Both terms present in different fields (name + owner email) still matches...
  assert.equal(matchesCompanySearch(ROWS[1], 'rom gmail'), true);
  // ...but a term that appears nowhere narrows it away.
  assert.equal(matchesCompanySearch(ROWS[1], 'rom nonsense'), false);
});

test('search combines with the status filter rather than overriding it', () => {
  // "lumen" also matches the archived 111 row via its owner email — the default
  // status filter must still keep that one hidden.
  const hits = filterCompanyRows(ROWS, { status: 'active', search: 'lumen' });
  assert.equal(hits.some(isArchivedCompany), false);
});

test('paginate caps a page at 25 rows and reports its window', () => {
  const many = Array.from({ length: 60 }, (_, i) => ({ company_id: `c${i}`, status: 'active' }));
  const first = paginate(many, 0);
  assert.equal(first.rows.length, COMPANY_PAGE_SIZE);
  assert.deepEqual([first.from, first.to, first.total, first.pageCount], [1, 25, 60, 3]);
  assert.equal(first.hasPrev, false);
  assert.equal(first.hasNext, true);

  const last = paginate(many, 2);
  assert.equal(last.rows.length, 10);
  assert.deepEqual([last.from, last.to], [51, 60]);
  assert.equal(last.hasNext, false);
});

test('a page beyond the end clamps to the last real page instead of showing nothing', () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ company_id: `c${i}`, status: 'active' }));
  const clamped = paginate(many, 99);
  assert.equal(clamped.page, 1);
  assert.equal(clamped.rows.length, 5);
});

test('paginate handles an empty list without producing a negative window', () => {
  const empty = paginate([], 3);
  assert.deepEqual([empty.rows.length, empty.page, empty.pageCount, empty.from, empty.to], [0, 0, 1, 0, 0]);
  assert.equal(empty.hasPrev, false);
  assert.equal(empty.hasNext, false);
});
