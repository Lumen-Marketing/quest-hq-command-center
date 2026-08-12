// The job file: one job, eight tabs, and the quick-create rail beside them.
//
// Fetched on demand -- you have to open a job to see it, and every other Jobs screen paints
// without it.
//
// Structure follows the v1 design: what needs doing, what happened, what it costs, what the
// client owes, what changed, what to build to. The arithmetic lives in ./production-model.js
// so this file only decides how it looks.

import {
  CO_STEPS, bucketProgress, coStepIndex, dailyStreak, daysWorked, drawTotals,
  isStruggling, projectedNet, sortDailies, ticketWithChangeOrders, tradeColor,
} from './production-model.js';
import { groupLines, lineAmount, methodLabel } from './change-order-model.js';
import {
  ISSUE_CATEGORY, categoryLabel, filterByCategory, photosByDay, undatedCount, usedCategories,
} from './photo-model.js';

export const JOB_FILE_TABS = [
  ['overview', 'Overview'],
  ['dailies', 'Dailies'],
  ['photos', 'Photos'],
  ['numbers', 'Numbers'],
  ['contract', 'Contract'],
  ['changes', 'Change Orders'],
  ['plans', 'Plans'],
  ['emails', 'Emails'],
  // The existing activity feed, tasks and record history. The v1 structure has no home for
  // them yet, and dropping working features to make room for stubs would be a downgrade, so
  // they keep a tab until the design says otherwise.
  ['activity', 'Activity'],
];

export function createJobFile(ctx) {
  const {
    h, can, money, emptyState, appHref, companyPath, formatDate,
    pipelineStageColor, resolvePipelineStage, contactById, contactByName,
  } = ctx;

  /**
   * The client's name, as a link to their contact record where there is one.
   *
   * contact_id is preferred over the name: it survives a rename, which a name search does
   * not. A job whose client was typed before that link existed falls back to matching the
   * name, and a client nobody can resolve stays plain text rather than becoming a link that
   * lands on an empty search.
   */
  const clientLink = (job, companyId) => {
    const name = job.client_name || '';
    if (!name) return h('No client on this job');
    if (!can('crm.view', companyId)) return h(name);
    const contact = (job.contact_id && contactById(job.contact_id)) || contactByName(companyId, name);
    if (!contact) return h(name);
    const href = appHref(companyPath('contacts', { contact_id: contact.id }, companyId));
    return `<a class="link-button" href="${h(href)}" data-router>${h(name)}</a>`;
  };

  const RATING = {
    good: ['Good', '#15803d', '#e7f8ec'],
    ok: ['OK', '#92600a', '#fdf3df'],
    rough: ['Rough', '#b91c1c', '#fdecec'],
  };

  /** The run of days as dots. Empty reads as a dash rather than nothing at all. */
  function streakDots(dailies) {
    const streak = dailyStreak(dailies, 4);
    if (!streak.length) return '<span class="jf-dots jf-dots-none">—</span>';
    return `<span class="jf-dots" aria-label="Last ${streak.length} worked days">${streak
      .map((r) => `<i class="jf-dot jf-dot-${h(r)}" title="${h(RATING[r][0])}"></i>`)
      .join('')}</span>`;
  }

  function ratingChip(rating) {
    const [label, colour, bg] = RATING[rating] || RATING.good;
    return `<span class="jf-chip" style="color:${colour};background:${bg}">${h(label)}</span>`;
  }

  function tabCount(key, data) {
    const counts = {
      dailies: data.dailies.length,
      changes: data.changeOrders.length,
      plans: data.plans.length,
      // The real files, not the count a foreman typed into a daily. Those two disagreed the
      // moment anybody uploaded from the drive instead of from the daily form.
      photos: (data.photos || []).length,
    };
    const n = counts[key];
    if (!n) return '';
    return `<span class="jf-badge">${n}</span>`;
  }

  // ---- tabs ---------------------------------------------------------------------------

  /**
   * Needs attention: what is outstanding on this job, each line owned by somebody.
   *
   * These are real tasks with a job_id, which is what makes the design's "synced to My Queue"
   * true rather than a label -- ticking one here clears it in the assignee's queue, because
   * it is the same row. A separate job-only checklist would have been a second list of work
   * that nobody looks at, which is the problem this panel exists to solve.
   */
  function attentionCard(job, data, companyId) {
    const open = (data.tasks || []).filter((t) => t.status !== 'done');
    const canManage = can('jobs.manage', companyId);
    return `
      <article class="jf-card jf-attention">
        <h3><i class="ti ti-flame jf-attn-flame" aria-hidden="true"></i>Needs attention
          <span class="jf-sub jf-attn-sync"><i class="ti ti-refresh" aria-hidden="true"></i>synced to My Queue</span>
          ${canManage ? `<button class="btn btn-sm" type="button" data-action="job-attention-new" data-job-id="${h(job.id)}"><i class="ti ti-plus"></i>Add</button>` : ''}
        </h3>
        ${open.length ? `<ul class="jf-attn">${open.map((task) => `
          <li class="jf-attn-row ${task.overdue ? 'overdue' : ''}">
            <button type="button" class="jf-attn-tick" role="checkbox" aria-checked="false"
                    aria-label="Mark done: ${h(task.title)}"
                    data-action="job-attention-done" data-task-id="${h(task.id)}"${canManage ? '' : ' disabled'}>
              <i class="ti ti-check"></i>
            </button>
            <span class="jf-attn-title">${h(task.title)}</span>
            ${task.due ? `<span class="jf-attn-due">${h(formatDate(task.due))}</span>` : ''}
            <span class="jf-attn-who">${h(ctx.memberName(task.assignee_id) || 'Unassigned')}</span>
          </li>`).join('')}</ul>`
    : `<p class="jf-sub">Nothing outstanding.</p>
           <!-- The pipeline prompt still has a home: with no explicit items, the next action is
                the most useful thing this card can say. -->
           ${ctx.renderPipelineNextAction('job', job, { compact: true })}`}
      </article>`;
  }

  function overviewTab(job, data, companyId) {
    const stage = resolvePipelineStage('jobs', job.stage, companyId);
    const struggling = isStruggling(data.dailies);
    const latest = sortDailies(data.dailies)[0];
    return `
      ${attentionCard(job, data, companyId)}
      <div class="jf-cards">
        <article class="jf-card">
          <h3>Client</h3>
          <p>${clientLink(job, companyId)}</p>
          ${job.contact_name ? `<p class="jf-sub">${h(job.contact_name)}</p>` : ''}
          ${job.site_address ? `<p class="jf-sub">${h(job.site_address)}</p>` : ''}
        </article>
        <article class="jf-card">
          <h3>How it is going</h3>
          <p>${streakDots(data.dailies)} <span class="jf-sub">${daysWorked(data.dailies)} day${daysWorked(data.dailies) === 1 ? '' : 's'} worked</span></p>
          ${struggling ? '<p class="jf-warn">Two tough days in a row — worth a call before it becomes three.</p>' : ''}
          ${latest ? `<p class="jf-sub">Last daily ${h(formatDate(latest.report_date))} · ${h(latest.crew_label || 'crew')}</p>`
    : '<p class="jf-sub">No daily submitted yet.</p>'}
        </article>
      </div>
      ${job.scope ? `<article class="jf-card"><h3>Scope</h3><p>${h(job.scope)}</p></article>` : ''}
      ${job.notes ? `<article class="jf-card jf-pin"><h3>Site notes</h3><p>${h(job.notes)}</p></article>` : ''}
      <article class="jf-card">
        <h3>Stage</h3>
        <p><span class="jf-stage-dot" style="background:${h(pipelineStageColor('jobs', stage, companyId))}"></span>${h(stage)}</p>
      </article>`;
  }

  function dailiesTab(job, data, companyId) {
    if (!data.dailies.length) {
      return emptyState('No daily reports yet. Submit one from Quick create — it is what drives the day count, the streak and the dashboard flag.');
    }
    return sortDailies(data.dailies).map((d) => `
      <article class="jf-card jf-daily">
        <div class="jf-daily-head">
          <b>${h(formatDate(d.report_date))}</b>
          <span class="jf-sub">${h(d.crew_label || 'Crew')}</span>
          ${ratingChip(d.production)}
          ${d.site_cleaned === true ? '<span class="jf-chip jf-chip-ok">Site cleaned</span>' : ''}
          ${d.site_cleaned === false ? '<span class="jf-chip jf-chip-warn">Not cleaned</span>' : ''}
          ${d.materials_ok === false ? `<span class="jf-chip jf-chip-warn">Needs ${h(d.materials_needed.join(', ') || 'materials')}</span>` : ''}
        </div>
        ${d.production_note ? `<p class="jf-sub">${h(d.production_note)}</p>` : ''}
        <p>${h(d.notes || 'No notes.')}</p>
        ${d.crew_names.length ? `<p class="jf-sub">On site: ${h(d.crew_names.join(', '))}</p>` : ''}
        ${d.photo_count ? `<p class="jf-sub">${d.photo_count} photo${d.photo_count === 1 ? '' : 's'}</p>` : ''}
      </article>`).join('');
  }

  /**
   * Photos, by the day they were taken, with that day's daily beside them.
   *
   * Capture and upload already existed as a modal reachable from the jobs board; this tab is
   * where the design puts them, so the button opens the same one rather than a second
   * uploader that would drift from it.
   */
  function photosTab(job, data, companyId) {
    const all = data.photos || [];
    const canManage = can('files.manage', companyId);
    const filter = ctx.photoFilter() || 'All';
    const shown = filterByCategory(all, filter);
    const cats = usedCategories(all);
    const orphans = undatedCount(all);

    const capture = canManage
      ? `<button class="btn btn-primary" type="button" data-action="open-job-photos" data-job-id="${h(job.id)}"><i class="ti ti-camera"></i>Add photos</button>`
      : '';

    if (!all.length) {
      return `<div class="jf-photo-head">${capture}</div>
        ${emptyState('No photos on this job yet. They attach to the day they were taken, so the day\'s report and its evidence stay together.')}`;
    }

    const groups = photosByDay(shown, data.dailies);
    return `
      <div class="jf-photo-head">
        <div class="jf-photo-chips" role="group" aria-label="Photo type">
          <button class="jf-photo-chip ${filter === 'All' ? 'on' : ''}" type="button"
                  data-action="job-photo-filter" data-category="All">All <span>${all.length}</span></button>
          ${cats.map((c) => `
            <button class="jf-photo-chip ${filter === c.value ? 'on' : ''}" type="button"
                    data-action="job-photo-filter" data-category="${h(c.value)}">${h(c.label)} <span>${c.count}</span></button>`).join('')}
        </div>
        ${capture}
      </div>
      ${groups.length ? groups.map((group) => `
        <section class="jf-photo-day">
          <p class="jf-photo-day-head">
            <b>${h(formatDate(group.day))}</b>
            <span class="jf-sub">${group.photos.length} photo${group.photos.length === 1 ? '' : 's'}</span>
            ${group.daily
    ? `<span class="jf-chip jf-chip-ok">Attached to that day's daily</span>`
    : '<span class="jf-sub">No daily for this day</span>'}
          </p>
          <div class="jf-photo-grid">
            ${group.photos.map((photo) => `
              <button type="button" class="jf-photo" data-action="select-file" data-file-id="${h(photo.id)}"
                      title="${h(photo.notes || photo.file_name || 'Photo')}">
                ${ctx.fileThumb(photo)}
                ${photo.category === ISSUE_CATEGORY ? '<span class="jf-photo-flag">Issue</span>' : ''}
                ${photo.notes ? `<span class="jf-photo-cap">${h(photo.notes)}</span>` : ''}
              </button>`).join('')}
          </div>
        </section>`).join('')
    : emptyState(`No ${h(categoryLabel(filter).toLowerCase())} photos. Pick another type above.`)}
      ${orphans ? `<p class="jf-sub">${orphans} photo${orphans === 1 ? '' : 's'} have no date recorded and are not shown above.</p>` : ''}`;
  }

  function numbersTab(job, data) {
    const ticket = ticketWithChangeOrders(job, data.changeOrders);
    const net = projectedNet(ticket, data.buckets);
    return `
      <div class="jf-figures">
        <div class="jf-figure">
          <span class="jf-label">Ticket — this scope</span>
          <strong>${h(money(ticket))}</strong>
          <span class="jf-sub">spent to date ${h(money(net.spent))}</span>
        </div>
        <div class="jf-figure ${net.net >= 0 ? 'jf-good' : 'jf-bad'}">
          <span class="jf-label">${net.firm ? 'Net' : 'Projected net'}</span>
          <strong>${h(money(net.net))}${ticket > 0 ? ` · ${net.margin.toFixed(1)}%` : ''}</strong>
          <span class="jf-sub">${net.firm
    ? 'every bucket closed — this is the real number'
    : `${net.finals} of ${net.total} bucket${net.total === 1 ? '' : 's'} final`}</span>
        </div>
      </div>
      ${data.buckets.length ? `<div class="jf-buckets">${data.buckets.map((b) => {
    const { over, pct, unbudgeted } = bucketProgress(b);
    const label = b.status === 'final' ? 'All purchased — final'
      : b.status === 'later' ? 'Not started' : 'In progress';
    return `
        <article class="jf-bucket">
          <div class="jf-bucket-head">
            <b>${h(b.name)}</b>
            <span class="jf-chip jf-chip-${h(b.status)}">${h(label)}</span>
            <span class="jf-bucket-money">${h(money(b.spent))} / <b>${h(money(b.expected))}</b></span>
            ${b.status === 'open' && can('jobs.manage', job.company_id)
    ? `<button class="btn btn-sm" type="button" data-action="job-bucket-final" data-bucket-id="${h(b.id)}">Done buying</button>` : ''}
          </div>
          <div class="jf-bar ${over || unbudgeted ? 'jf-bar-over' : ''}"><span style="width:${pct}%"></span></div>
          ${b.note ? `<p class="jf-sub ${over ? 'jf-warn' : ''}">${h(b.note)}</p>` : ''}
          ${unbudgeted ? '<p class="jf-warn">Nothing was budgeted here — it comes straight off the net.</p>' : ''}
        </article>`;
  }).join('')}</div>` : emptyState('No cost buckets yet. They are what turn a ticket into a projected net.')}`;
  }

  function contractTab(job, data) {
    if (!data.draws.length) return emptyState('No draw schedule yet. Draws are what say when the client owes you.');
    const totals = drawTotals(data.draws);
    return `
      <p class="jf-sub jf-contract-sum">Contract ${h(money(totals.contract))} · paid ${h(money(totals.paidTotal))}${totals.readyTotal ? ` · <b>${h(money(totals.readyTotal))} ready to invoice</b>` : ''}</p>
      <div class="jf-draws">${data.draws.map((d) => `
        <div class="jf-draw">
          <span class="jf-draw-mark jf-draw-${h(d.status)}"></span>
          <span class="jf-draw-label">${h(d.label)}</span>
          <b class="jf-draw-amount">${h(money(d.amount))}</b>
          ${d.status === 'paid' ? '<span class="jf-chip jf-chip-ok">Paid</span>'
    : d.status === 'unlocked'
      ? (can('jobs.manage', job.company_id)
        ? `<button class="btn btn-sm btn-primary" type="button" data-action="job-draw-invoice" data-draw-id="${h(d.id)}">Request invoice</button>`
        : '<span class="jf-chip jf-chip-warn">Ready</span>')
      : '<span class="jf-chip">Locked</span>'}
        </div>`).join('')}</div>`;
  }

  /**
   * The working behind the price: what it was costed from, and what margin that left.
   *
   * Collapsed by default. The price is the answer most of the time; the lines matter when
   * somebody asks how it was arrived at, which is usually months later in an argument.
   */
  function pricingBreakdown(co, data) {
    const lines = (data.changeOrderLines || []).filter((l) => l.change_order_id === co.id);
    if (!lines.length) {
      // A flat-priced change order is legitimate, but it should say so rather than look like
      // one whose lines failed to load.
      return co.pricing_method === 'flat' && co.price > 0
        ? '<p class="jf-sub jf-co-flat">Priced as a flat fee.</p>' : '';
    }
    const groups = groupLines(lines);
    const margin = Number(co.margin_pct) || 0;
    return `
      <details class="jf-co-lines">
        <summary>Cost ${h(money(co.cost))}${margin ? ` · margin ${margin.toFixed(1)}%` : ''} — how this was priced</summary>
        ${groups.map((group) => `
          <div class="jf-co-group">
            <p class="jf-label">${h(methodLabel(group.kind))}<span>${h(money(group.cost))}</span></p>
            ${group.lines.map((line) => `
              <div class="jf-co-line">
                <span>${h(line.label)}</span>
                <span class="jf-sub">${line.kind === 'labor'
    ? `${h(line.qty)} × ${h(line.days)} day${line.days === 1 ? '' : 's'} × ${h(money(line.unitCost))}`
    : `${h(line.qty)} × ${h(money(line.unitCost))}`}</span>
                <b>${h(money(lineAmount(line)))}</b>
              </div>`).join('')}
          </div>`).join('')}
      </details>`;
  }

  function changesTab(job, data) {
    const canManage = can('jobs.manage', job.company_id);
    const newButton = canManage
      ? '<button class="btn btn-primary" type="button" data-action="job-change-order-new">New change order</button>'
      : '';
    if (!data.changeOrders.length) {
      return `${emptyState('No change orders. Anything the client asks for after signing belongs here — that is where the money leaks.')}${newButton}`;
    }
    return `${data.changeOrders.map((co) => {
      const at = coStepIndex(co.step);
      const next = { requested: 'priced', priced: 'sent', sent: 'accepted', accepted: 'acknowledged' }[co.step];
      const nextLabel = { priced: 'Mark priced', sent: 'Mark sent', accepted: 'Mark accepted', acknowledged: 'Crew acknowledged' }[next];
      return `
      <article class="jf-card jf-co">
        <div class="jf-co-head"><b>${h(co.title)}</b><b class="jf-co-price">${h(money(co.price))}</b></div>
        ${co.description ? `<p class="jf-sub">${h(co.description)}</p>` : ''}
        ${pricingBreakdown(co, data)}
        <div class="jf-steps">${CO_STEPS.map((step, i) => `
          <span class="jf-step ${i < at ? 'jf-step-done' : i === at ? 'jf-step-now' : ''}">${h(step)}</span>`).join('')}</div>
        ${co.requested_by ? `<p class="jf-sub">Asked by ${h(co.requested_by)}</p>` : ''}
        ${next && canManage
    ? `<button class="btn btn-sm" type="button" data-action="job-change-order-step" data-co-id="${h(co.id)}" data-co-step="${h(next)}">${h(nextLabel)}</button>`
    : ''}
        ${co.step === 'acknowledged' ? '<p class="jf-ok">Complete — crew has acknowledged and is building to it.</p>' : ''}
      </article>`;
    }).join('')}${newButton}`;
  }

  function plansTab(job, data) {
    if (!data.plans.length) return emptyState('No plans uploaded. The current set is what the crew builds to.');
    return `<div class="jf-plans">${data.plans.map((p) => `
      <div class="jf-plan">
        <span class="jf-plan-name"><b>${h(p.name)}</b> <span class="jf-sub">${h(p.version)}</span></span>
        ${p.is_current
    ? '<span class="jf-chip jf-chip-ok">Current — build to this</span>'
    : '<span class="jf-chip">Superseded</span>'}
      </div>`).join('')}</div>`;
  }

  function renderJobFile(companyId, job, tab) {
    const data = ctx.productionFor(job.id);
    const active = JOB_FILE_TABS.some(([k]) => k === tab) ? tab : 'overview';
    const stage = resolvePipelineStage('jobs', job.stage, companyId);
    const worked = daysWorked(data.dailies);
    const canManage = can('jobs.manage', companyId);
    // Activity brings its own Quick Create panel, so the rail would be a second one on the
    // same screen -- two lists of the same idea, overlapping, with different contents. The
    // tab that already has the control keeps it.
    const showRail = canManage && active !== 'activity';

    const body = active === 'overview' ? overviewTab(job, data, companyId)
      : active === 'dailies' ? dailiesTab(job, data, companyId)
        : active === 'numbers' ? numbersTab(job, data)
          : active === 'contract' ? contractTab(job, data)
            : active === 'changes' ? changesTab(job, data)
              : active === 'plans' ? plansTab(job, data)
                : active === 'activity' ? ctx.renderJobRecord(companyId, job)
                  : active === 'photos' ? photosTab(job, data, companyId)
                    : emptyState('Email threads for this job land with the next phase.');

    return `
      <section class="jf">
        <header class="jf-head">
          <!-- The trade badge: the design leads with the trade, because on a board of jobs the
               trade is what you scan for before the address. -->
          <span class="jf-trade" style="background:${h(tradeColor(job.job_type))}" aria-hidden="true">${h((job.job_type || '?').trim().charAt(0).toUpperCase())}</span>
          <div class="jf-head-main">
            <p class="jf-eyebrow">${h([job.client_name, job.site_address].filter(Boolean).join(' · ') || 'Job')}</p>
            <h1>${h(job.name)}
              <!-- Stage and day sit ON the title line in the design, as one chip, rather than
                   on a line of their own -- it is the job's state, not a separate fact. -->
              <span class="jf-stage-chip" style="color:${h(pipelineStageColor('jobs', stage, companyId))};background:${h(pipelineStageColor('jobs', stage, companyId))}1f">${h(stage)}${worked ? ` · day ${worked}` : ''}</span>
            </h1>
          </div>
          <div class="jf-head-actions">
            <a class="btn" href="${appHref(companyPath('jobs', { tab: 'list' }, companyId))}" data-router>All jobs</a>
            ${canManage ? `<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(job.id)}">Edit job</button>` : ''}
          </div>
        </header>

        <nav class="jf-tabs" aria-label="Job sections">
          ${JOB_FILE_TABS.map(([key, label]) => `
            <a class="${key === active ? 'active' : ''}"
               href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id, jt: key }, companyId))}"
               data-router>${h(label)}${tabCount(key, data)}</a>`).join('')}
        </nav>

        <div class="jf-body ${showRail ? '' : 'jf-body-wide'}">
          <div class="jf-main">${body}</div>
          ${showRail ? `
            <aside class="jf-rail" aria-label="Quick create">
              <p class="jf-label">Quick create</p>
              <button class="jf-quick" type="button" data-action="job-daily-new"><i class="ti ti-clipboard-text" aria-hidden="true"></i><span>Daily report</span></button>
              <button class="jf-quick" type="button" data-action="open-job-photos" data-job-id="${h(job.id)}"><i class="ti ti-camera" aria-hidden="true"></i><span>Photos</span></button>
              <button class="jf-quick" type="button" data-action="job-change-order-new"><i class="ti ti-file-diff" aria-hidden="true"></i><span>Change order</span></button>
              <button class="jf-quick" type="button" data-action="job-bucket-new"><i class="ti ti-wallet" aria-hidden="true"></i><span>Cost bucket</span></button>
              <button class="jf-quick" type="button" data-action="job-draw-new"><i class="ti ti-cash" aria-hidden="true"></i><span>Draw</span></button>
              <button class="jf-quick" type="button" data-action="job-expense-new" data-job-id="${h(job.id)}"><i class="ti ti-receipt" aria-hidden="true"></i><span>Expense</span></button>
              <button class="jf-quick" type="button" data-action="job-walk-new" data-job-id="${h(job.id)}"><i class="ti ti-microphone" aria-hidden="true"></i><span>Job walk</span></button>
            </aside>` : ''}
        </div>
      </section>`;
  }

  return { renderJobFile };
}
