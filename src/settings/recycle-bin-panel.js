// Settings > Recycle Bin, fetched on first use. It is a tab inside Settings; nothing that
// paints before that click needs it.
//
// A factory, because the stores, the type registry and the formatting helpers all belong to
// main.js and stay there.

export function createRecycleBinPanel(ctx) {
  const {
    RECYCLE_BIN_TYPES, emptyState, formatDateTime, h, recycleBinItemsForCompany,
    recycleDaysLeft, recycleTypeConfig, state, titleCase,
  } = ctx;

  function renderRecycleBinSettings(companyId) {
    const items = recycleBinItemsForCompany(companyId);
    const filters = state.recycleFilters || { type: 'all', status: 'active' };
    const typeOptions = Object.values(RECYCLE_BIN_TYPES).map((config) => [config.type, config.label]).sort((a, b) => a[1].localeCompare(b[1]));
    const filtered = items.filter((item) => {
      const days = recycleDaysLeft(item);
      const statusMatch = filters.status === 'all'
        || (filters.status === 'active' && days >= 0)
        || (filters.status === 'expiring' && days >= 0 && days <= 7)
        || (filters.status === 'expired' && days < 0);
      const typeMatch = filters.type === 'all' || item.source_type === filters.type;
      return statusMatch && typeMatch;
    });
    const counts = [
      ['Items', String(items.length)],
      ['Expiring soon', String(items.filter((item) => recycleDaysLeft(item) >= 0 && recycleDaysLeft(item) <= 7).length)],
      ['Expired', String(items.filter((item) => recycleDaysLeft(item) < 0).length)],
    ];
    const expiredCount = items.filter((item) => recycleDaysLeft(item) < 0).length;
    return `
      <article class="panel span-3 recycle-bin-panel">
        <div class="section-head">
          <div>
            <h2>Recycle Bin</h2>
            <p>Deleted workspace items stay recoverable for 30 days before permanent cleanup.</p>
          </div>
          <div class="backup-record-counts">${counts.map(([label, value]) => `<span>${h(label)}: ${h(value)}</span>`).join('')}</div>
        </div>
        <div class="recycle-toolbar">
          <label><span>Type</span><select data-recycle-filter="type">
            <option value="all" ${filters.type === 'all' ? 'selected' : ''}>All types</option>
            ${typeOptions.map(([value, label]) => `<option value="${h(value)}" ${filters.type === value ? 'selected' : ''}>${h(label)}</option>`).join('')}
          </select></label>
          <label><span>Status</span><select data-recycle-filter="status">
            ${[
              ['active', 'Active'],
              ['expiring', 'Expiring soon'],
              ['expired', 'Expired'],
              ['all', 'All'],
            ].map(([value, label]) => `<option value="${value}" ${filters.status === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select></label>
          <button class="btn danger" type="button" data-action="open-empty-expired-recycle-bin" ${expiredCount ? '' : 'disabled'}>
            <i class="ti ti-trash-x"></i>Empty expired items${expiredCount ? ` (${expiredCount})` : ''}
          </button>
        </div>
        <div class="recycle-list">
          ${filtered.map(renderRecycleBinRow).join('') || emptyState('Recycle Bin is empty. Deleted items will appear here.')}
        </div>
      </article>
    `;
  }

  function renderRecycleBinRow(item) {
    const typeConfig = recycleTypeConfig(item.source_type);
    const days = recycleDaysLeft(item);
    const dayLabel = days < 0 ? `${Math.abs(days)}d expired` : `${days}d left`;
    const statusClass = days < 0 ? 'danger' : days <= 7 ? 'warning' : 'active';
    return `
      <article class="recycle-row ${statusClass}">
        <div class="recycle-icon"><i class="ti ti-recycle"></i></div>
        <div>
          <strong>${h(item.item_label)}</strong>
          <small>${h(typeConfig?.label || titleCase(item.source_type))} / Deleted by ${h(item.deleted_by_label || 'Unknown')} / ${formatDateTime(item.deleted_at)}</small>
        </div>
        <b class="status-pill ${statusClass}">${h(dayLabel)}</b>
        <div class="recycle-actions">
          <button class="btn" type="button" data-action="restore-recycle-item" data-recycle-id="${h(item.id)}" ${days < 0 ? 'disabled title="Restore window expired"' : ''}><i class="ti ti-restore"></i>Restore</button>
          <button class="btn danger" type="button" data-action="open-permanent-delete-recycle-item" data-recycle-id="${h(item.id)}"><i class="ti ti-trash"></i>Delete forever</button>
        </div>
      </article>
    `;
  }

  return { renderRecycleBinSettings };
}
