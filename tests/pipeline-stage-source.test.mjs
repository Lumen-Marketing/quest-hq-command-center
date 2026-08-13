import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "On the quotes I can't click these, only the Underwriting and Won."
//
// The stage rail drew pipelineStages('deals'), which returns the CRM 2 set for a company
// running that plugin — Underwriting / Estimate Sent / Negotiating / Contract Sent / Waiting
// to Sign / Won. resolveDealStage validated against dealStageNames(), which read DEAL_STAGES:
// the CRM 1 defaults, straight from the database — Prospect / Qualified / Proposal sent /
// Negotiation / Verbal commit / Won / Lost.
//
// So clicking a stage that existed in only one list wrote it, had it rewritten back to the
// first stage, and looked like nothing happened. Won worked because it is in both lists;
// Underwriting looked fine only because it was already the current stage, so the click
// returned early without writing anything.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};
const oneLiner = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n', at));
};

const CRM2_DEALS = ['Underwriting', 'Estimate Sent', 'Negotiating', 'Contract Sent', 'Waiting to Sign', 'Won'];
const CRM1_DEALS = ['Prospect', 'Qualified', 'Proposal sent', 'Negotiation', 'Verbal commit', 'Won', 'Lost'];

// The real resolvers, over a stubbed pipelineStages — which is exactly the seam that was wrong.
const build = (names) => Function(`
  const activeCompanyId = () => 'co';
  const pipelineStages = () => ${JSON.stringify(names.map((name) => ({ name })))};
  ${oneLiner('dealStageNames')}
  ${oneLiner('jobStageNames')}
  const LEGACY_JOB_STAGE_MAP = {};
  ${cut('resolveDealStage')}
  ${cut('resolveJobStage')}
  return { resolveDealStage, resolveJobStage, dealStageNames };
`)();

test('the stage helpers read from pipelineStages, not the CRM 1 defaults', () => {
  // One source of truth. pipelineStages is the only function that knows about the plugin.
  assert.match(oneLiner('dealStageNames'), /pipelineStages\('deals', companyId\)/);
  assert.match(oneLiner('jobStageNames'), /pipelineStages\('jobs', companyId\)/);
  // jobStageColor / dealStageColor were removed: nothing called them, and the minifier had
  // already been dropping them from the bundle.
  assert.ok(!/function (job|deal)StageColor\(/.test(main), 'unused stage colour helpers are gone');
  // And they no longer read the raw arrays, which are the CRM 1 defaults.
  assert.ok(!/function dealStageNames\([^)]*\) \{ return DEAL_STAGES/.test(main));
  assert.ok(!/function jobStageNames\([^)]*\) \{ return JOB_STAGES/.test(main));
});

test('every stage the CRM 2 rail offers survives being saved', () => {
  // This is the bug, stated plainly: the rail drew these, and four of six were thrown away.
  const { resolveDealStage } = build(CRM2_DEALS);
  CRM2_DEALS.forEach((stage) => {
    assert.equal(resolveDealStage(stage, 'co'), stage, `"${stage}" was rewritten on save`);
  });
});

test('a CRM 1 company still keeps its own stages', () => {
  const { resolveDealStage } = build(CRM1_DEALS);
  CRM1_DEALS.forEach((stage) => assert.equal(resolveDealStage(stage, 'co'), stage));
});

test('the legacy names still migrate to the set in use', () => {
  // A deal saved under CRM 1 and opened under CRM 2 should land on the matching stage rather
  // than on whatever happens to be first.
  const { resolveDealStage } = build(CRM2_DEALS);
  assert.equal(resolveDealStage('Proposal sent', 'co'), 'Estimate Sent');
  assert.equal(resolveDealStage('Negotiation', 'co'), 'Negotiating');
  assert.equal(resolveDealStage('Verbal commit', 'co'), 'Waiting to Sign');
  assert.equal(resolveDealStage('Prospect', 'co'), 'Underwriting');
});

test('an unrecognised stage is kept, not rewritten to the first one', () => {
  // Snapping it back is precisely what made a click look like it had done nothing. Keeping it
  // is visible and recoverable; rewriting it is silent and destroys the choice.
  const { resolveDealStage, resolveJobStage } = build(CRM2_DEALS);
  assert.equal(resolveDealStage('Something else', 'co'), 'Something else');
  assert.equal(resolveJobStage('Something else', 'co'), 'Something else');
});

test('a blank stage still falls back to the first one', () => {
  // A new record needs somewhere to start.
  const { resolveDealStage, resolveJobStage } = build(CRM2_DEALS);
  assert.equal(resolveDealStage('', 'co'), 'Underwriting');
  assert.equal(resolveDealStage(undefined, 'co'), 'Underwriting');
  assert.equal(resolveJobStage('', 'co'), 'Underwriting');
});

test('the normalizers resolve against the row’s own company', () => {
  // Not the company you happen to be looking at: a bootstrap loads rows for every company the
  // user belongs to, and they do not all run the same CRM plugin.
  assert.match(main, /stage: resolveDealStage\(input\.stage, input\.company_id\),/);
  assert.match(main, /stage: resolveJobStage\(input\.stage, input\.company_id\),/);
});
