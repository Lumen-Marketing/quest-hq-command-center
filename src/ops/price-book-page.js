// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createPriceBookPage(ctx) {
  const {
    can, pbCompanyVendors, pbDate, pbIsStale, pbRows, renderPriceBookMaterialsTable, renderPriceBookVendorDetail, renderPriceBookVendorGrid, workspaceHeader, state,
  } = ctx;

  function renderPriceBookPage(route, companyId) {
    const canManage = can('price_book.manage', companyId);
    const rows = pbRows(companyId);
    const vendors = pbCompanyVendors(companyId);
    const stale = rows.filter((row) => pbIsStale(row.updated)).length;
    const onAccount = vendors.filter((vendor) => vendor.on_account).length;
    const lastSynced = vendors.filter((vendor) => vendor.last_synced_at).sort((a, b) => new Date(b.last_synced_at) - new Date(a.last_synced_at))[0];
    const view = state.pricebookVendorId ? 'detail' : state.pricebookTab === 'all' ? 'all' : 'vendors';
    return `
      <section class="tool-page price-book-page">
        ${workspaceHeader('Price Book', 'Vendor cost catalog for estimating. Costs stay here; sell price and margin stay on quotes.', `
          ${canManage ? '<button class="btn" type="button" data-action="pb-import"><i class="ti ti-file-import"></i>Import prices</button>' : ''}
          ${canManage ? '<button class="btn" type="button" data-action="pb-add-material"><i class="ti ti-plus"></i>Add material</button>' : ''}
          ${canManage ? '<button class="btn btn-primary" type="button" data-action="pb-add-vendor"><i class="ti ti-building-store"></i>Add vendor</button>' : ''}
        `)}
        <div class="pb-stats">
          <div class="pb-stat"><span>Vendors</span><strong>${vendors.length}</strong></div>
          <div class="pb-stat"><span>Material prices</span><strong>${rows.length}</strong></div>
          <div class="pb-stat"><span>Last import</span><strong>${lastSynced ? pbDate(lastSynced.last_synced_at) : '-'}</strong></div>
          <div class="pb-stat ${stale ? 'warn' : ''}"><span>Stale prices</span><strong>${stale}</strong></div>
          <div class="pb-stat"><span>On account</span><strong>${onAccount}<em> / ${vendors.length}</em></strong></div>
        </div>
        <div class="pb-tabs">
          <button class="pb-tab ${view !== 'all' ? 'active' : ''}" type="button" data-action="pb-tab" data-tab="vendors">Vendors <span>${vendors.length}</span></button>
          <button class="pb-tab ${view === 'all' ? 'active' : ''}" type="button" data-action="pb-tab" data-tab="all">All materials <span>${rows.length}</span></button>
        </div>
        ${view === 'detail' ? renderPriceBookVendorDetail(companyId, canManage) : view === 'all' ? renderPriceBookMaterialsTable(companyId, canManage) : renderPriceBookVendorGrid(companyId, canManage)}
      </section>
    `;
  }

  return { renderPriceBookPage };
}
