// End-of-day report surface, loaded on demand.
//
// This lives behind a dynamic import because it is a whole page of markup that most
// sessions never open, and the entry chunk is at its budget ceiling. A statically
// imported module would still be bundled into the same chunk, so the import in
// src/main.js must stay dynamic for this to be worth anything.
//
// Kept pure: every helper it needs is passed in, so it never imports from main.js and
// cannot create a circular dependency.

export const EOD_TEAM_MEMBERS = ['Alkeith', 'Jesus', 'Manny', 'Mackenzie'];
export const EOD_STATUSES = [['draft', 'Draft'], ['submitted', 'Submitted'], ['reviewed', 'Reviewed']];
// Abraham's format tracks a weekly quotes target alongside the daily number.
export const EOD_WEEKLY_QUOTE_TARGET = 3;

// Local calendar date. Never toISOString() here: that converts to UTC, so anywhere east
// of Greenwich a local midnight lands on the previous UTC day and every week boundary
// (and "today") slips by one.
export function localDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Monday-based week containing `date`, matching how the team talks about a "weekly total".
export function eodWeekStart(dateish) {
  const date = new Date(`${String(dateish).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return localDate(date);
}

// Rows arrive raw from Supabase; coercing here keeps the shell free of this code.
export function normalizeEodReport(input) {
  const number = (value) => Math.min(100000, Math.max(0, Math.round(Number(value) || 0)));
  return {
    id: String(input.id || ''),
    company_id: String(input.company_id || ''),
    report_date: String(input.report_date || '').slice(0, 10),
    team_member: String(input.team_member || '').trim(),
    calls_made: number(input.calls_made),
    quotes_sent: number(input.quotes_sent),
    appointments_set: number(input.appointments_set),
    follow_ups_completed: number(input.follow_ups_completed),
    hot_leads: String(input.hot_leads || ''),
    blockers: String(input.blockers || ''),
    status: ['draft', 'submitted', 'reviewed'].includes(input.status) ? input.status : 'submitted',
  };
}

export function renderEodPage({
  companyLabel,
  rows,
  canManage,
  h,
  metricCard,
  emptyState,
  titleCase,
}) {
  const today = localDate();
  const reports = (rows || [])
    .map(normalizeEodReport)
    .sort((a, b) => (a.report_date < b.report_date ? 1 : a.report_date > b.report_date ? -1 : 0));
  const weekStart = eodWeekStart(today);
  const thisWeek = reports.filter((report) => eodWeekStart(report.report_date) === weekStart);
  const total = (key) => thisWeek.reduce((sum, report) => sum + report[key], 0);
  const perMember = EOD_TEAM_MEMBERS.map((name) => {
    const rows = thisWeek.filter((report) => report.team_member === name);
    return { name, quotes: rows.reduce((sum, r) => sum + r.quotes_sent, 0), reports: rows.length };
  });
  const columns = canManage ? 10 : 9;
  return `
    <section class="tool-page eod-page">
      <div class="workspace-head">
        <div><h1>EOD reports</h1><p>End-of-day numbers for ${h(companyLabel)}. Week of ${h(weekStart || today)}.</p></div>
      </div>
      <section class="metric-grid">
        ${metricCard('Calls this week', String(total('calls_made')))}
        ${metricCard('Quotes this week', String(total('quotes_sent')))}
        ${metricCard('Appointments', String(total('appointments_set')))}
        ${metricCard('Follow-ups', String(total('follow_ups_completed')))}
      </section>
      <div class="eod-grid">
        <article class="panel eod-form-panel">
          <div class="section-head"><div><h2>File a report</h2><p>One per person per day.</p></div></div>
          <form class="eod-form" data-eod-form>
            <label>Report date<input type="date" name="report_date" value="${h(today)}" required /></label>
            <label>Team member
              <input name="team_member" list="eod-team-members" placeholder="Name" required />
              <datalist id="eod-team-members">${EOD_TEAM_MEMBERS.map((name) => `<option value="${h(name)}"></option>`).join('')}</datalist>
            </label>
            <label>Calls made<input type="number" name="calls_made" min="0" max="100000" value="0" required /></label>
            <label>Quotes sent<input type="number" name="quotes_sent" min="0" max="100000" value="0" required /></label>
            <label>Appointments set<input type="number" name="appointments_set" min="0" max="100000" value="0" required /></label>
            <label>Follow-ups completed<input type="number" name="follow_ups_completed" min="0" max="100000" value="0" required /></label>
            <label class="eod-wide">Hot leads / jobs pending<textarea name="hot_leads" rows="2" placeholder="Name + quick note"></textarea></label>
            <label class="eod-wide">Blockers / anything you need<textarea name="blockers" rows="2"></textarea></label>
            <label>Status<select name="status">${EOD_STATUSES.map(([value, label]) => `<option value="${h(value)}" ${value === 'submitted' ? 'selected' : ''}>${h(label)}</option>`).join('')}</select></label>
            <div class="form-actions eod-wide">
              <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Submit report</button>
            </div>
          </form>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Quotes this week</h2><p>Target is ${EOD_WEEKLY_QUOTE_TARGET} per person.</p></div></div>
          <div class="contract-rows">
            ${perMember.map((row) => `
              <div>
                <span>${h(row.name)}${row.reports ? '' : ' — no reports yet'}</span>
                <strong class="${row.quotes >= EOD_WEEKLY_QUOTE_TARGET ? 'eod-ok' : 'eod-under'}">${row.quotes} / ${EOD_WEEKLY_QUOTE_TARGET}</strong>
              </div>
            `).join('')}
          </div>
        </article>
      </div>
      <article class="panel">
        <div class="section-head"><div><h2>Recent reports</h2><p>${reports.length} report${reports.length === 1 ? '' : 's'} on file.</p></div></div>
        <div class="table-wrap">
          <table class="data-table eod-table">
            <thead><tr><th>Date</th><th>Member</th><th>Calls</th><th>Quotes</th><th>Appts</th><th>Follow-ups</th><th>Hot leads</th><th>Blockers</th><th>Status</th>${canManage ? '<th></th>' : ''}</tr></thead>
            <tbody>
              ${reports.slice(0, 60).map((report) => `
                <tr>
                  <td>${h(report.report_date)}</td>
                  <td><strong>${h(report.team_member || '—')}</strong></td>
                  <td>${report.calls_made}</td>
                  <td>${report.quotes_sent}</td>
                  <td>${report.appointments_set}</td>
                  <td>${report.follow_ups_completed}</td>
                  <td class="eod-note">${h(report.hot_leads || '—')}</td>
                  <td class="eod-note">${h(report.blockers || '—')}</td>
                  <td><b class="status-pill ${report.status === 'reviewed' ? 'active' : report.status === 'draft' ? 'muted' : 'pending'}">${h(titleCase(report.status))}</b></td>
                  ${canManage ? `<td><button class="btn btn-sm" type="button" data-action="review-eod-report" data-report-id="${h(report.id)}" ${report.status === 'reviewed' ? 'disabled' : ''}>Mark reviewed</button></td>` : ''}
                </tr>
              `).join('') || `<tr><td colspan="${columns}">${emptyState('No EOD reports yet. File the first one on the left.')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;
}

// Persistence lives here too, so none of it sits in the entry chunk. `ctx` carries the
// few shell capabilities this needs, which keeps the module free of app imports.
export async function saveEodReport(ctx, formNode) {
  if (!ctx.can('eod.view')) return ctx.toast('Your role cannot file EOD reports.', 'local', 'EOD');
  if (ctx.readOnly) return ctx.toast('Demo is read-only.', 'local', 'EOD');
  const data = new FormData(formNode);
  const count = (name) => Math.min(100000, Math.max(0, Math.round(Number(data.get(name)) || 0)));
  const text = (name, max) => String(data.get(name) || '').trim().slice(0, max);
  const row = {
    id: ctx.uuid(),
    company_id: ctx.companyId,
    workspace_id: ctx.workspaceId,
    report_date: String(data.get('report_date') || '').slice(0, 10),
    team_member: text('team_member', 120),
    calls_made: count('calls_made'),
    quotes_sent: count('quotes_sent'),
    appointments_set: count('appointments_set'),
    follow_ups_completed: count('follow_ups_completed'),
    hot_leads: text('hot_leads', 4000),
    blockers: text('blockers', 4000),
    status: ['draft', 'submitted', 'reviewed'].includes(data.get('status')) ? String(data.get('status')) : 'submitted',
    created_by: ctx.profileId,
  };
  if (!row.report_date || !row.team_member) return ctx.toast('Pick a date and a team member.', 'local', 'EOD');
  if (ctx.live && ctx.client) {
    // No .select(): the row is only readable through the eod.view policy, and reading it
    // back adds nothing the locally built row does not already have.
    const result = await ctx.client.from('eod_reports').insert(row);
    if (result.error) return ctx.toast(result.error.message || 'Could not save that report.', 'error', 'EOD');
  }
  ctx.push(row);
  ctx.toast('EOD report filed.', ctx.live ? 'live' : 'local', 'EOD');
  ctx.render();
  return undefined;
}

export async function reviewEodReport(ctx, reportId) {
  if (!ctx.can('eod.manage')) return ctx.toast('Your role cannot review EOD reports.', 'local', 'EOD');
  if (ctx.live && ctx.client) {
    const result = await ctx.client.from('eod_reports').update({ status: 'reviewed' }).eq('id', reportId);
    if (result.error) return ctx.toast(result.error.message || 'Could not update that report.', 'error', 'EOD');
  }
  ctx.patch(reportId, { status: 'reviewed' });
  ctx.render();
  return undefined;
}
