// What the Jobs dashboard shows, as pure functions over the job list and its production
// records.
//
// Every figure here is derived from something that exists: a job's stage and owner, its
// dailies, its cost buckets, its draws. Nothing is invented, and nothing is labelled as
// something it is not -- see `spend` below for the one place that matters.

import { dailyStreak, missedDaily, sortDailies } from './production-model.js';

/** Stages that mean work is live: not a lead, not finished, not paused. */
export const ACTIVE_STAGES = ['Scheduled', 'Material ordered', 'Material Ordered', 'In production', 'In Production', 'QC / punch list'];
export const BILLING_STAGES = ['Invoiced'];
export const CLOSED_STAGES = ['Paid / closed', 'On hold'];

const money = (n) => Number(n) || 0;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Where a job sits in its pipeline, as a fraction, for the progress dots. */
export function stageProgress(stageName, stages) {
  const names = stages.map((s) => s.name);
  const at = names.indexOf(stageName);
  if (at === -1 || names.length < 2) return { step: 0, total: names.length || 1 };
  return { step: at + 1, total: names.length };
}

/**
 * Days since a job was last touched. Still used as a fallback flag for a job that has no
 * dailies at all, where "nobody has submitted anything" is the only signal available.
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
 * Whether a crew label reads as a subcontractor rather than our own crew.
 *
 * This is a guess off a free-text field, which is why the caption says "sub" and not
 * something more confident. It exists because "who is actually mine today" is the first
 * thing you want off this screen, and the alternative is not answering at all.
 */
export function looksLikeSub(ownerName) {
  return /\bsub(s|contractor)?\b/i.test(String(ownerName || ''));
}

/** Split the live jobs by who is running them. */
export function crewSplit(active) {
  let own = 0;
  let sub = 0;
  let unassigned = 0;
  active.forEach((job) => {
    const owner = String(job.owner_name || '').trim();
    if (!owner) unassigned += 1;
    else if (looksLikeSub(owner)) sub += 1;
    else own += 1;
  });
  return { own, sub, unassigned };
}

/**
 * Every unlocked draw across the given jobs, richest first.
 *
 * "Unlocked" means the milestone is met and nobody has billed it yet, so this is money the
 * business is owed and has not asked for -- which is why it gets a tile and a button.
 */
export function drawsReady(jobs, production) {
  const rows = [];
  jobs.forEach((job) => {
    (production(job.id).draws || []).forEach((draw) => {
      if (draw.status === 'unlocked') rows.push({ job, draw, amount: money(draw.amount) });
    });
  });
  return rows.sort((a, b) => b.amount - a.amount);
}

/** Spend recorded against the given jobs, from the cost buckets. */
export function spendToDate(jobs, production) {
  return jobs.reduce((sum, job) => sum
    + (production(job.id).buckets || []).reduce((n, bucket) => n + money(bucket.spent), 0), 0);
}

/**
 * Live jobs that need somebody today, worst first.
 *
 * A missing daily outranks a quiet job: it means a crew was on site and nothing came back,
 * where "quiet" only means nobody opened the record.
 */
export function productionFlags(jobs, resolveStage, production, todayIso, now, staleDays = 3) {
  const flags = [];
  activeJobs(jobs, resolveStage).forEach((job) => {
    const dailies = sortDailies(production(job.id).dailies || []);
    if (dailies.length && missedDaily(dailies, todayIso)) {
      flags.push({ job, kind: 'missing-daily', label: 'no daily submitted', rank: 0 });
      return;
    }
    if (!dailies.length) {
      const idle = daysSince(job.updated_at, now);
      if (idle !== null && idle >= staleDays) {
        flags.push({ job, kind: 'stale', label: `no update in ${plural(idle, 'day')}`, idle, rank: 1 });
      }
    }
  });
  return flags.sort((a, b) => a.rank - b.rank || (b.idle || 0) - (a.idle || 0));
}

/** Kept for the Needs-attention list and its tests: live jobs nobody has touched. */
export function needsAttention(jobs, resolveStage, now, staleDays = 3) {
  return activeJobs(jobs, resolveStage)
    .map((job) => ({ job, idle: daysSince(job.updated_at, now) }))
    .filter((row) => row.idle !== null && row.idle >= staleDays)
    .sort((a, b) => b.idle - a.idle);
}

/** The last four days of production for a job, for the streak dots. */
export function jobStreak(job, production) {
  return dailyStreak(sortDailies(production(job.id).dailies || []));
}

/**
 * The four headline figures. Each carries its own caption so the view cannot mislabel it.
 *
 * On the third tile: Abe's design says "spent this week", but spend is recorded on cost
 * buckets, which carry a running total and no date -- there is no dated expense ledger to
 * take a week out of. Reporting a running total under a weekly label would be a wrong
 * number in a confident font, so the label matches what the figure actually is.
 */
export function dashboardTiles(jobs, resolveStage, production, todayIso, now, staleDays = 3) {
  const active = activeJobs(jobs, resolveStage);
  const { own, sub, unassigned } = crewSplit(active);
  const ready = drawsReady(jobs, production);
  const readyTotal = ready.reduce((sum, row) => sum + row.amount, 0);
  const spent = spendToDate(active, production);
  const flags = productionFlags(jobs, resolveStage, production, todayIso, now, staleDays);
  const missing = flags.filter((f) => f.kind === 'missing-daily');

  const crewCaption = [
    own ? `${own} own crew` : '',
    sub ? `${sub} sub` : '',
    unassigned ? `${unassigned} unassigned` : '',
  ].filter(Boolean).join(' · ') || 'nothing in production';

  const shortName = (job) => String(job.name || '').split(/\s+[—-]\s+/)[0].trim() || job.name;

  return [
    {
      id: 'working',
      label: 'Working today',
      value: plural(active.length, 'job'),
      caption: crewCaption,
      tone: 'plain',
    },
    {
      id: 'draws',
      label: 'Draws ready',
      value: readyTotal,
      money: true,
      caption: ready.length ? `${plural(ready.length, 'draw')} unlocked` : 'nothing unlocked',
      tone: readyTotal > 0 ? 'good' : 'plain',
    },
    {
      id: 'spend',
      label: 'Spent to date',
      value: spent,
      money: true,
      caption: `across ${plural(active.length, 'live job')}`,
      tone: 'plain',
    },
    {
      id: 'health',
      label: 'Production health',
      value: plural(flags.length, 'flag'),
      caption: missing.length
        ? `missing daily · ${missing.map((f) => shortName(f.job)).slice(0, 2).join(', ')}`
        : (flags.length ? `no update in ${staleDays}+ days` : 'every live job is current'),
      tone: flags.length ? 'warn' : 'good',
    },
  ];
}
