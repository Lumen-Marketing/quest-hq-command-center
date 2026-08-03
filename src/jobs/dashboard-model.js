// What the Jobs dashboard shows, as pure functions over the job list.
//
// Every figure here is derived from data that already exists on a job: its stage, its owner,
// its estimate and invoice totals, and when it was last touched. Nothing is invented, and
// nothing is labelled as something it is not -- there is no cost ledger, draw schedule or
// daily report in this product yet, so this file does not pretend to compute them.

/** Stages that mean work is live: not a lead, not finished, not paused. */
export const ACTIVE_STAGES = ['Scheduled', 'Material ordered', 'Material Ordered', 'In production', 'In Production', 'QC / punch list'];
export const BILLING_STAGES = ['Invoiced'];
export const CLOSED_STAGES = ['Paid / closed', 'On hold'];

const money = (n) => Number(n) || 0;

/** Where a job sits in its pipeline, as a fraction, for the progress dots. */
export function stageProgress(stageName, stages) {
  const names = stages.map((s) => s.name);
  const at = names.indexOf(stageName);
  if (at === -1 || names.length < 2) return { step: 0, total: names.length || 1 };
  return { step: at + 1, total: names.length };
}

/**
 * Days since a job was last touched. Used for the attention flag, because a job nobody has
 * updated is the closest honest signal this data supports to "no daily report came in".
 */
export function daysSince(iso, now) {
  const then = new Date(iso).getTime();
  if (!iso || Number.isNaN(then)) return null;
  return Math.floor((now - then) / 86400000);
}

export function activeJobs(jobs, resolveStage) {
  return jobs.filter((job) => ACTIVE_STAGES.includes(resolveStage(job)));
}

/**
 * Jobs that have gone quiet. `staleDays` is deliberately a parameter rather than a constant:
 * a roofing crew and an estimating desk do not go quiet at the same rate.
 */
export function needsAttention(jobs, resolveStage, now, staleDays = 3) {
  return activeJobs(jobs, resolveStage)
    .map((job) => ({ job, idle: daysSince(job.updated_at, now) }))
    .filter((row) => row.idle !== null && row.idle >= staleDays)
    .sort((a, b) => b.idle - a.idle);
}

/** The four headline figures. Each carries its own caption so the view cannot mislabel it. */
export function dashboardTiles(jobs, resolveStage, now, staleDays = 3) {
  const active = activeJobs(jobs, resolveStage);
  const owned = active.filter((job) => String(job.owner_name || '').trim()).length;
  const billing = jobs.filter((job) => BILLING_STAGES.includes(resolveStage(job)));
  const billingTotal = billing.reduce((sum, job) => sum + money(job.invoice_total || job.estimate_total), 0);
  const activeValue = active.reduce((sum, job) => sum + money(job.estimate_total), 0);
  const flags = needsAttention(jobs, resolveStage, now, staleDays);

  return [
    {
      id: 'working',
      label: 'Working now',
      value: `${active.length} job${active.length === 1 ? '' : 's'}`,
      caption: active.length
        ? `${owned} assigned · ${active.length - owned} unassigned`
        : 'nothing in production',
      tone: 'plain',
    },
    {
      id: 'billing',
      label: 'Ready to invoice',
      value: billingTotal,
      money: true,
      caption: `${billing.length} job${billing.length === 1 ? '' : 's'} at invoicing`,
      tone: billingTotal > 0 ? 'good' : 'plain',
    },
    {
      id: 'value',
      label: 'Active value',
      value: activeValue,
      money: true,
      caption: `across ${active.length} live job${active.length === 1 ? '' : 's'}`,
      tone: 'plain',
    },
    {
      id: 'health',
      label: 'Needs attention',
      value: `${flags.length} flag${flags.length === 1 ? '' : 's'}`,
      caption: flags.length
        ? `no update in ${staleDays}+ days`
        : 'every live job is current',
      tone: flags.length ? 'warn' : 'good',
    },
  ];
}
