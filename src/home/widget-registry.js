// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

import { JOB_TILE_PARTS } from '../jobs/dashboard-model.js';

export function createWidgetRegistry(ctx) {
  const {
    accountName, companyFinanceInvoices, companyTasks, dashboardJobsParts, renderModalShell, dashboardAppWidgets, dashboardAverage, dashboardEmptyNote, dashboardGroupCounts, dashboardGroupSums, dashboardMetricTile, dashboardMonthlyValues, dashboardNeedsDataWidget, daysPastDue, h, invoiceBalance, isoDate, memberName, money, number, renderCallsWidget, renderDashboardDayBars, renderDashboardJobsWidget, renderDashboardHorizontalBars, renderDashboardLeaderboard, resolvePipelineStage, startOfToday, sum, state,
  } = ctx;

  // Which parts the home dashboard's Jobs card shows. Same tick-boxes as the workspace
  // tile, over the same list, so the two cannot drift apart.
  function renderJobsConfigModal(companyId) {
    const chosen = dashboardJobsParts(companyId);
    return renderModalShell('Widget details', 'Jobs', `
      <div class="dash-modal-summary">
        <div><b>What should this widget show?</b><span>Tick any number. Each figure and list is independent, so the card carries only what you watch.</span></div>
      </div>
      <div class="dash-report-picker">
        ${JOB_TILE_PARTS.map(([key, label, why]) => `
          <button type="button" class="dash-report-opt dash-report-check ${chosen.includes(key) ? 'active' : ''}" data-action="dashboard-jobs-widget-part" data-part="${h(key)}">
            <span class="dro-check"><i class="ti ti-check"></i></span>
            <span class="dro-text"><b>${h(label)}</b><small>${h(why)}</small></span>
          </button>`).join('')}
      </div>
      <div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Done</button></div>
    `, 'dashboard-app-widget-modal');
  }

  function dashboardWidgetRegistry(companyId, ctx) {
    const openPipeline = ctx.openDeals.reduce((total, deal) => total + number(deal.value), 0);
    const jobsInProduction = ctx.jobs.filter((job) => /production|material/i.test(String(job.stage || ''))).length;
    const overdueTasks = ctx.openTasks.filter((task) => task.due && new Date(task.due) < startOfToday()).length;
    const periodRevenue = sum(ctx.payments, 'amount') || ctx.wonDeals.reduce((total, deal) => total + number(deal.value), 0);
    const callCount = ctx.activities.filter((activity) => /call/i.test(String(activity.type || activity.subject || ''))).length;
    const proposalCount = ctx.deals.length;
    const leadCount = ctx.contacts.length;
    const wonRevenue = ctx.wonDeals.reduce((total, deal) => total + number(deal.value), 0);
    const avgTicket = dashboardAverage(ctx.jobs.map((job) => number(job.estimate_total || job.invoice_total)).filter(Boolean));
    const residentialJobs = ctx.jobs.filter((job) => /residential|home|roof/i.test(String(job.job_type || job.name || '')) && !/commercial/i.test(String(job.job_type || job.name || '')));
    const commercialJobs = ctx.jobs.filter((job) => /commercial|storage|office|retail/i.test(String(job.job_type || job.name || '')));
    const collectedPct = ctx.fin.invoiced ? Math.round((ctx.fin.collected / ctx.fin.invoiced) * 100) : 0;
    const widgets = {
      calls: {
        title: 'Phones right now',
        group: 'Operations',
        span: true,
        sub: 'Live RingCentral status, and conversations over 60 seconds today.',
        render: () => renderCallsWidget(companyId),
      },
      kpis: {
        title: 'Activity totals',
        group: 'Sales',
        span: true,
        sub: 'Calls, leads, proposals, and won revenue.',
        render: () => `
          <section class="dash-kpis dash-widget-kpis">
            ${dashboardMetricTile('ti-phone', callCount, 'Calls logged', `${ctx.activities.length} activities`)}
            ${dashboardMetricTile('ti-users', leadCount, 'Leads', `${ctx.contacts.length} contacts`)}
            ${dashboardMetricTile('ti-file-text', proposalCount, 'Proposals sent', `avg ${money(dashboardAverage(ctx.deals.map((deal) => number(deal.value)).filter(Boolean)))}`)}
            ${dashboardMetricTile('ti-trophy', money(wonRevenue), 'Won revenue', `${ctx.wonDeals.length} won`)}
          </section>`,
      },
      leaderboard: {
        title: 'Rep leaderboard',
        group: 'Sales',
        span: true,
        sub: 'Revenue and conversion by owner.',
        render: () => renderDashboardLeaderboard(companyId, ctx),
      },
      callsTrend: {
        title: 'Calls logged',
        group: 'Sales',
        sub: 'Activity by day in selected range.',
        render: () => renderDashboardDayBars(ctx.activities.filter((activity) => /call/i.test(String(activity.type || activity.subject || ''))), 'created_at'),
      },
      sources: {
        title: 'Leads by source',
        group: 'Sales',
        render: () => renderDashboardHorizontalBars(dashboardGroupCounts(ctx.contacts, (contact) => contact.source || 'Unknown')),
      },
      funnel: {
        title: 'Sales funnel',
        group: 'Sales',
        sub: 'Lead to won, with conversion.',
        render: () => {
          const rows = [
            ['Leads', leadCount],
            ['Proposals', proposalCount],
            ['Won', ctx.wonDeals.length],
          ];
          return renderDashboardHorizontalBars(rows.map(([name, count]) => ({ name, count, value: count })));
        },
      },
      speed: dashboardNeedsDataWidget('Speed-to-lead', 'Sales', 'Needs first_contact_at timestamps on leads.'),
      // Production, the way the old Jobs dashboard showed it. Which figures and lists appear
      // is per company, chosen through the widget's own settings, so one dashboard can carry
      // draws and another the crew's day without either carrying both.
      jobsProduction: {
        title: 'Jobs',
        group: 'Operations',
        span: true,
        configurable: true,
        sub: 'Working today, draws ready, spend and production health — pick which.',
        render: () => renderDashboardJobsWidget(companyId),
      },
      jobs: {
        title: 'Jobs by stage',
        group: 'Operations',
        sub: 'Active production board.',
        render: () => {
          const rows = dashboardGroupCounts(ctx.jobs, (job) => resolvePipelineStage('jobs', job.stage, companyId) || job.stage || 'Unstaged');
          return `<h3 class="dash-hidden-copy">Jobs in production</h3>${renderDashboardHorizontalBars(rows)}`;
        },
      },
      dispatch: {
        title: "Today's dispatch",
        group: 'Operations',
        sub: 'Due tasks and scheduled work today.',
        render: () => {
          const today = isoDate(0);
          const due = companyTasks(companyId).filter((task) => task.due === today).slice(0, 5);
          return due.length ? `<div class="dash-mini-list">${due.map((task) => `<div><b>${h(task.title)}</b><span>${h(memberName(task.assignee_id) || 'Unassigned')}</span></div>`).join('')}</div>` : dashboardEmptyNote('No dispatch items due today.');
        },
      },
      weather: dashboardNeedsDataWidget('5-day field forecast', 'Operations', 'Needs weather API and company service area.'),
      revenue: {
        title: 'Revenue & Receivables',
        group: 'Finance',
        sub: 'Invoiced vs collected.',
        render: () => `
          <div class="cash-figs">
            <div><span>Invoiced</span><b>${h(money(ctx.fin.invoiced))}</b></div>
            <div><span>Collected</span><b class="pos">${h(money(ctx.fin.collected))}</b></div>
            <div><span>Outstanding</span><b class="warn">${h(money(ctx.fin.outstanding))}</b></div>
          </div>
          <div class="cash-bar"><i style="width:${h(collectedPct)}%"></i></div>
          <p class="cash-note">${h(collectedPct)}% of invoiced has been collected.</p>`,
      },
      reviews: dashboardNeedsDataWidget('Reviews & reputation', 'Reputation', 'Needs Google/GHL review integration.'),
      avgTicket: {
        title: 'Avg ticket',
        group: 'Value drivers',
        sub: 'Average job contract total',
        render: () => `
          <div class="dash-big-metric">
            <strong>${h(money(avgTicket))}</strong>
            <span>Residential ${h(money(dashboardAverage(residentialJobs.map((job) => number(job.estimate_total)).filter(Boolean))))} - Commercial ${h(money(dashboardAverage(commercialJobs.map((job) => number(job.estimate_total)).filter(Boolean))))}</span>
            <div class="dash-spark">${[35, 45, 55, 62, 70, 78].map((height) => `<i style="height:${height}%"></i>`).join('')}</div>
            <small>trailing 6 months</small>
          </div>`,
      },
      grossMargin: dashboardNeedsDataWidget('Gross margin', 'Value drivers', 'Needs actual job cost capture.'),
      ebitda: dashboardNeedsDataWidget('EBITDA', 'Value drivers', 'Needs GL/QBO integration.'),
      revGrowth: {
        title: 'Revenue growth',
        group: 'Value drivers',
        sub: 'Collected revenue in selected range.',
        render: () => `<div class="dash-big-metric"><strong>${h(money(periodRevenue))}</strong><span>${h(ctx.payments.length)} payments in range</span><div class="dash-spark">${dashboardMonthlyValues(ctx.payments, 'received_at', 'amount').map((value) => `<i style="height:${value}%"></i>`).join('')}</div></div>`,
      },
      revPerCrew: dashboardNeedsDataWidget('Revenue per crew', 'Value drivers', 'Needs crew capacity/headcount settings.'),
      marketing: dashboardNeedsDataWidget('Marketing efficiency', 'Value drivers', 'Needs ad spend and lead attribution.'),
      backlog: {
        title: 'Backlog',
        group: 'Value drivers',
        sub: 'Signed/open job value not complete.',
        render: () => {
          const activeJobs = ctx.jobs.filter((job) => !/complete|done|closed/i.test(String(job.stage || job.status || '')));
          return `<div class="dash-big-metric"><strong>${h(money(sum(activeJobs, 'estimate_total')))}</strong><span>${h(activeJobs.length)} active jobs</span></div>`;
        },
      },
      recurring: dashboardNeedsDataWidget('Recurring revenue', 'Value drivers', 'Needs membership/subscription plans.'),
      goalPacing: {
        title: 'Goal pacing',
        group: 'Value drivers',
        sub: 'Revenue pace using current collected revenue.',
        render: () => `<div class="dash-big-metric"><strong>${h(money(periodRevenue))}</strong><span>Set a monthly target to calculate pacing percentage.</span></div>`,
      },
      concentration: {
        title: 'Customer concentration',
        group: 'Value drivers',
        render: () => renderDashboardHorizontalBars(dashboardGroupSums(ctx.invoices, (invoice) => accountName(invoice.account_id) || 'Unknown', 'total').slice(0, 5)),
      },
      pipelineCoverage: {
        title: 'Sales pipeline',
        group: 'Growth',
        sub: 'Open pipeline coverage and quote value.',
        render: () => `<div class="dash-big-metric"><strong>${h(money(openPipeline))}</strong><span>${h(ctx.openDeals.length)} active quotes. Add a sales target for coverage ratio.</span></div>`,
      },
      utilization: dashboardNeedsDataWidget('Crew utilization', 'Capacity', 'Needs schedule and crew capacity.'),
      recruiting: dashboardNeedsDataWidget('Recruiting funnel', 'People', 'Needs hiring pipeline.'),
      turnover: dashboardNeedsDataWidget('Turnover & labor cost', 'People', 'Needs HR/payroll data.'),
      quota: dashboardNeedsDataWidget('Quota attainment', 'People', 'Needs rep quota settings.'),
      cash13: dashboardNeedsDataWidget('13-week cash flow', 'Cash flow', 'Needs cash forecast data.'),
      dso: {
        title: 'Collections (DSO)',
        group: 'Cash flow',
        sub: 'Average days outstanding on unpaid invoices.',
        render: () => {
          const openInvoices = companyFinanceInvoices(companyId).filter((invoice) => invoiceBalance(invoice.id) > 0);
          const avgDays = dashboardAverage(openInvoices.map((invoice) => Math.max(0, daysPastDue(invoice.due_date))));
          return `<div class="dash-big-metric"><strong>${h(Math.round(avgDays))} days</strong><span>${h(openInvoices.length)} invoices with open balance</span></div>`;
        },
      },
      jobCostVariance: dashboardNeedsDataWidget('Job-cost variance', 'Cash flow', 'Needs actual job costing.'),
      ltvCac: dashboardNeedsDataWidget('LTV : CAC', 'Strategy', 'Needs lifetime value and marketing spend model.'),
      ownerScore: dashboardNeedsDataWidget('Owner-dependency score', 'Strategy', 'Needs manual owner-dependency checklist.'),
      serviceMix: {
        title: 'Revenue by service line',
        group: 'Strategy',
        render: () => renderDashboardHorizontalBars(dashboardGroupSums(ctx.jobs, (job) => job.job_type || 'Unclassified', 'estimate_total')),
      },
      rocks: dashboardNeedsDataWidget('Quarterly Rocks', 'EOS', 'Needs EOS rocks table.'),
      scorecard: dashboardNeedsDataWidget('Company scorecard', 'EOS', 'Needs weekly scorecard metrics.'),
      oneYearPlan: dashboardNeedsDataWidget('1-Year Plan', 'EOS', 'Needs VTO / annual plan settings.'),
      l10pulse: dashboardNeedsDataWidget('L10 meeting pulse', 'EOS', 'Needs L10 meeting records.'),
      issues: dashboardNeedsDataWidget('Issues list (IDS)', 'EOS', 'Needs EOS issues table.'),
      todos: dashboardNeedsDataWidget('To-dos (7-day)', 'EOS', 'Needs EOS to-do table.'),
      peopleAnalyzer: dashboardNeedsDataWidget('People Analyzer (GWC)', 'EOS', 'Needs people analyzer records.'),
      eosComponents: dashboardNeedsDataWidget('EOS components checkup', 'EOS', 'Needs EOS checkup survey.'),
      coreValues: dashboardNeedsDataWidget('Core values', 'EOS', 'Needs core values settings.'),
    };
    Object.assign(widgets, dashboardAppWidgets(companyId));
    return widgets;
  }

  return { dashboardWidgetRegistry, renderJobsConfigModal };
}
