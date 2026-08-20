import { COMPANY_STATUS_FILTERS } from '../platform-directory.js';

export function createCompanyDirectoryView({ emptyState, h }) {
  function renderCompanyDirectoryToolbar(scope, filters, view) {
    return `
      <div class="company-directory-toolbar">
        <label class="company-directory-search">
          <i class="ti ti-search" aria-hidden="true"></i>
          <input type="search" value="${h(filters.search || '')}" placeholder="Search name, ID, or owner email"
            data-company-directory-search="${h(scope)}" aria-label="Search companies" />
        </label>
        <label class="company-directory-status">
          <span>Status</span>
          <select data-company-directory-status="${h(scope)}">
            ${COMPANY_STATUS_FILTERS.map(([value, label]) => `<option value="${h(value)}" ${filters.status === value ? 'selected' : ''}>${h(label)}</option>`).join('')}
          </select>
        </label>
        <span class="company-directory-count">${view.total ? `${view.from}-${view.to} of ${view.total}` : 'No matches'}</span>
      </div>
    `;
  }

  function renderCompanyDirectoryPager(scope, view) {
    if (view.pageCount <= 1) return '';
    return `
      <div class="company-directory-pager">
        <button class="btn" type="button" data-action="company-directory-page" data-scope="${h(scope)}" data-page="${view.page - 1}" ${view.hasPrev ? '' : 'disabled'}><i class="ti ti-chevron-left"></i>Previous</button>
        <span>Page ${view.page + 1} of ${view.pageCount}</span>
        <button class="btn" type="button" data-action="company-directory-page" data-scope="${h(scope)}" data-page="${view.page + 1}" ${view.hasNext ? '' : 'disabled'}>Next<i class="ti ti-chevron-right"></i></button>
      </div>
    `;
  }

  function companyDirectoryEmptyState(filters) {
    if (filters.search) return emptyState(`No companies match "${filters.search}".`);
    if (filters.status === 'archived') return emptyState('No archived companies.');
    if (filters.status === 'rejected') return emptyState('No rejected companies.');
    if (filters.status === 'canceled') return emptyState('No canceled companies.');
    return emptyState('No companies found for platform review.');
  }

  return { companyDirectoryEmptyState, renderCompanyDirectoryPager, renderCompanyDirectoryToolbar };
}
