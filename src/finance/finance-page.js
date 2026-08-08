// Finance, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createFinancePage(ctx) {
  const {
    appHref, can, compactFinanceRow, companyFinanceExpenses, companyFinanceInvoices,
    companyFinancePayments, companyFinanceVendors, companyName, companyPath, dateDesc,
    emptyState, financeInvoiceById, financeStatusPill, financeSummary, financeVendorName,
    formatDate, h, invoiceBalance, invoicePaid, invoiceStatus, jobById, metricCard,
    money, workspaceHeader,
  } = ctx;

  function renderFinancePage(route, companyId) {
    const summary = financeSummary(companyId);
    const invoices = companyFinanceInvoices(companyId);
    const payments = companyFinancePayments(companyId).slice().sort(dateDesc('received_at')).slice(0, 5);
    const expenses = companyFinanceExpenses(companyId).slice().sort(dateDesc('spent_at')).slice(0, 5);
    const vendors = companyFinanceVendors(companyId).slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 5);
    const canManageFinance = can('finance.manage', companyId);
    return `
      <section class="tool-page finance-page">
        ${workspaceHeader('Finance', 'Invoices, payments, expenses, vendors, and job-linked money in one company view.', `
          ${canManageFinance ? `
            <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
            <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
            <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
            <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
          ` : ''}
          <a class="btn" href="${appHref(companyPath('finance', { report: 'summary' }, companyId))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
        `)}
        <section class="metric-grid finance-metrics">
          ${metricCard('Estimated pipeline', money(summary.pipeline))}
          ${metricCard('Invoiced', money(summary.invoiced))}
          ${metricCard('Collected', money(summary.collected))}
          ${metricCard('Outstanding', money(summary.outstanding))}
          ${metricCard('Expenses', money(summary.expenses))}
          ${metricCard('Net position', money(summary.net))}
        </section>
        <section class="panel finance-aging">
          <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
          <div class="finance-aging-grid">
            ${[
              ['Current', summary.aging.current],
              ['1-30', summary.aging.thirty],
              ['31-60', summary.aging.sixty],
              ['61+', summary.aging.overSixty],
            ].map(([label, value]) => `<div><span>${h(label)}</span><strong>${money(value)}</strong></div>`).join('')}
          </div>
        </section>
        <section class="panel finance-invoice-panel">
          <div class="section-head"><div><h2>Invoices</h2><p>${invoices.length} billing record${invoices.length === 1 ? '' : 's'} for ${h(companyName(companyId))}</p></div></div>
          <div class="data-table finance-invoice-table">
            <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
            ${invoices.map((invoice) => `
              <a class="table-row" href="${appHref(companyPath('finance', { invoice: invoice.id }, companyId))}" data-router>
                <span><strong>${h(invoice.invoice_number)}</strong><small>${h(invoice.client_name || jobById(invoice.job_id)?.client_name || 'No client')}</small></span>
                <span>${financeStatusPill(invoiceStatus(invoice))}</span>
                <span>${h(jobById(invoice.job_id)?.name || 'Company level')}</span>
                <span>${formatDate(invoice.due_date)}</span>
                <span>${money(invoice.total)}</span>
                <span>${money(invoicePaid(invoice.id))}</span>
                <span>${money(invoiceBalance(invoice.id))}</span>
              </a>
            `).join('') || emptyState('No invoices yet. Create one from a job or customer record.')}
          </div>
        </section>
        <section class="finance-secondary-grid">
          <article class="panel">
            <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
            <div class="finance-compact-list">
              ${payments.map((payment) => compactFinanceRow(financeInvoiceById(payment.invoice_id)?.invoice_number || 'Payment', payment.method, money(payment.amount), payment.received_at)).join('') || emptyState('No payments recorded.')}
            </div>
          </article>
          <article class="panel">
            <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
            <div class="finance-compact-list">
              ${expenses.map((expense) => compactFinanceRow(financeVendorName(expense.vendor_id), expense.category, money(expense.amount), expense.spent_at, companyPath('finance', { expense: expense.id }, companyId))).join('') || emptyState('No expenses recorded.')}
            </div>
          </article>
          <article class="panel">
            <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
            <div class="finance-compact-list">
              ${vendors.map((vendor) => compactFinanceRow(vendor.name, vendor.category, vendor.status, vendor.updated_at, companyPath('finance', { vendor: vendor.id }, companyId))).join('') || emptyState('No vendors recorded.')}
            </div>
          </article>
        </section>
        ${!canManageFinance ? `<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>` : ''}
      </section>
    `;
  }

  return { renderFinancePage };
}
