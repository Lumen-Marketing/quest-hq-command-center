import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { HANDOFF_CHECKS, findHandoffIssues } from '../src/crm/handoff-review.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/settings-surfaces.js', import.meta.url), 'utf8');

const FIXTURE = {
  contacts: [{ id: 'c1', name: 'Jane Smith' }, { id: 'c2', name: 'Bob Jones' }],
  deals: [
    { id: 'd1', name: 'Q1', primary_contact_id: 'c1', account_id: 'a1' },
    { id: 'd2', name: 'Q2', primary_contact_id: 'c1', account_id: null },
    { id: 'd3', name: 'Q3', primary_contact_id: null, account_id: 'a1' },
  ],
  jobs: [
    { id: 'j1', name: 'Job1', deal_id: null, contact_id: 'c2' },
    { id: 'j2', name: 'Job2', deal_id: 'd1', contact_id: null, contact_name: 'Walk-in' },
  ],
};

const byId = (findings) => Object.fromEntries(findings.map((g) => [g.id, g.items]));

test('one contact holding several quotes is reported once, not once per quote', () => {
  const groups = byId(findHandoffIssues(FIXTURE));
  assert.equal(groups['duplicate-quotes'].length, 1);
  assert.equal(groups['duplicate-quotes'][0].title, 'Jane Smith');
  assert.match(groups['duplicate-quotes'][0].note, /2 quotes/);
});

test('each missing link is detected independently', () => {
  const groups = byId(findHandoffIssues(FIXTURE));
  assert.deepEqual(groups['quote-missing-account'].map((i) => i.title), ['Q2']);
  assert.deepEqual(groups['quote-missing-contact'].map((i) => i.title), ['Q3']);
  assert.deepEqual(groups['job-missing-quote'].map((i) => i.title), ['Job1']);
  assert.deepEqual(groups['job-missing-contact'].map((i) => i.title), ['Job2']);
});

test('a job carrying only a typed-in name still counts as missing a contact', () => {
  // The name is not a link, so nothing joins the job to a real contact record.
  const groups = byId(findHandoffIssues(FIXTURE));
  assert.match(groups['job-missing-contact'][0].note, /Only a name: Walk-in/);
});

test('clean data produces no findings', () => {
  const groups = findHandoffIssues({
    contacts: [{ id: 'c1', name: 'Jane' }],
    deals: [{ id: 'd1', name: 'Q1', primary_contact_id: 'c1', account_id: 'a1' }],
    jobs: [{ id: 'j1', name: 'J1', deal_id: 'd1', contact_id: 'c1' }],
  });
  assert.equal(groups.reduce((sum, g) => sum + g.items.length, 0), 0);
});

test('missing or empty inputs do not throw', () => {
  assert.equal(findHandoffIssues().length, HANDOFF_CHECKS.length);
  assert.equal(findHandoffIssues({}).reduce((s, g) => s + g.items.length, 0), 0);
});

test('the screen reports only — it never repairs', () => {
  const page = readFileSync(new URL('../src/crm/handoff-review.js', import.meta.url), 'utf8');
  // The checklist requires repair only after human review, so there is deliberately no
  // bulk action: no write, no RPC, no fix-all control.
  assert.doesNotMatch(page, /\.update\(|\.insert\(|\.delete\(|\.rpc\(/);
  assert.doesNotMatch(page, /data-action="[^"]*(repair|fix|merge)/i);
  assert.match(page, /Nothing here is changed automatically/);
});

test('the panel is admin-gated and lazily loaded', () => {
  assert.match(main, /tab === 'handoffs' \? \(can\('crm\.manage', companyId\) \? renderHandoffReviewPanel\(companyId\)/);
  assert.match(main, /import\('\.\/crm\/handoff-review\.js'\)/);
  assert.doesNotMatch(main, /^import .*crm\/handoff-review/m);
});

test('findings link straight to the offending record', () => {
  assert.match(main, /hrefFor: \(item\) => \{/);
  for (const kind of ['contact', 'deal', 'job']) {
    assert.ok(main.includes(`item.kind === '${kind}'`), `expected a link for ${kind}`);
  }
});
