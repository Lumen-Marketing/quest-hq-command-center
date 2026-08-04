import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CO_STEP_ORDER, LINE_KINDS, groupLines, impliedStep, lineAmount, linesCost,
  marginFromPrice, methodLabel, nextStep, priceFromMargin, pricingSummary, unpricedSince,
} from '../src/jobs/change-order-model.js';

// The worked example from the v1 design, which is the reference for every number here:
//   2 guys x $280/day x 1.5 days      = $840
//   1 lead x $350/day x 1.5 days      = $525
//   14 x 2x6x16 DF @ $12.40           = $173.60
//   38 x 2x4 studs @ $4.15            = $157.70
//   6  x OSB 7/16  @ $16.30           = $97.80
//   hardware                          = $180
//   ------------------------------------------
//   cost $1,974.10 -- shown as $1,975 -- at 45% margin -> $3,590
const LINES = [
  { kind: 'labor', label: '2 guys', qty: 2, days: 1.5, unit_cost: 280 },
  { kind: 'labor', label: '1 lead', qty: 1, days: 1.5, unit_cost: 350 },
  { kind: 'material', label: '2x6x16 DF', qty: 14, unit_cost: 12.4 },
  { kind: 'material', label: '2x4 studs', qty: 38, unit_cost: 4.15 },
  { kind: 'material', label: 'OSB 7/16', qty: 6, unit_cost: 16.3 },
  { kind: 'hardware', label: 'Hangers etc', qty: 1, unit_cost: 180 },
];

test('a labour line is guys x days x day rate', () => {
  assert.equal(lineAmount({ kind: 'labor', qty: 2, days: 1.5, unit_cost: 280 }), 840);
  assert.equal(lineAmount({ kind: 'labor', qty: 1, days: 1.5, unit_cost: 350 }), 525);
});

// Money stays in floats here and is rounded once, at the point it is displayed. Rounding
// inside the model instead would round every line and then sum the errors.
const cents = (n) => Math.round(n * 100);

test('a material line is a quantity at a unit price', () => {
  // days defaults to 1, so the same formula covers both without a second code path.
  assert.equal(cents(lineAmount({ kind: 'material', qty: 14, unit_cost: 12.4 })), 17360);
  assert.equal(cents(lineAmount({ kind: 'material', qty: 6, unit_cost: 16.3 })), 9780);
});

test('the whole worked example totals to the design figure', () => {
  assert.equal(Math.round(linesCost(LINES)), 1974);
});

test('margin is taken on the price, not marked up on the cost', () => {
  // This is the one that silently loses money if it is wrong: 1975 marked UP 45% is $2,864,
  // but the design says $3,590. Margin on price is the trade convention.
  assert.equal(Math.round(priceFromMargin(1975, 45)), 3591);
  assert.notEqual(Math.round(priceFromMargin(1975, 45)), Math.round(1975 * 1.45));
});

test('zero margin prices at cost, and the inverse round-trips', () => {
  assert.equal(priceFromMargin(1000, 0), 1000);
  assert.equal(Math.round(marginFromPrice(1975, 3591)), 45);
  assert.equal(marginFromPrice(1000, 0), 0, 'a zero price must not divide by zero');
});

test('an impossible margin is clamped rather than rendered as Infinity', () => {
  // 100% margin is a divide by zero. "$Infinity" in the wizard is worse than a big number.
  assert.ok(Number.isFinite(priceFromMargin(1000, 100)));
  assert.ok(Number.isFinite(priceFromMargin(1000, 140)));
  assert.equal(priceFromMargin(0, 100), 0);
});

test('negative inputs cannot sneak a discount into a cost line', () => {
  // A discount belongs in the margin where it is visible, not buried in a quantity.
  assert.equal(lineAmount({ kind: 'material', qty: -5, unit_cost: 10 }), 0);
  assert.equal(lineAmount({ kind: 'material', qty: 5, unit_cost: -10 }), 0);
});

test('junk values fall back instead of poisoning the total with NaN', () => {
  assert.equal(lineAmount({ kind: 'material', qty: 'abc', unit_cost: 10 }), 10, 'qty falls back to 1');
  assert.equal(linesCost([{ kind: 'material', qty: 2, unit_cost: undefined }]), 0);
});

test('lines group by kind, costed, in the order the wizard asks for them', () => {
  const groups = groupLines(LINES);
  assert.deepEqual(groups.map((g) => g.kind), ['labor', 'material', 'hardware']);
  assert.equal(groups[0].cost, 1365);
  assert.equal(Math.round(groups[1].cost), 429);
  // Equipment had no lines, so it is absent rather than an empty heading.
  assert.ok(!groups.some((g) => g.kind === 'equipment'));
  assert.deepEqual(LINE_KINDS, ['labor', 'material', 'hardware', 'equipment']);
});

test('the summary carries cost, price, margin and profit together', () => {
  const s = pricingSummary(LINES, 45);
  assert.equal(Math.round(s.cost), 1974);
  assert.equal(Math.round(s.price), 3589);
  assert.equal(Math.round(s.profit), 1615);
  assert.equal(s.underwater, false);
});

test('a flat price back-computes its own margin', () => {
  // Some work is quoted as a number rather than built up, so flat is a first-class method
  // and still has to report what margin it actually lands on.
  const s = pricingSummary(LINES, 0, 3590, 'flat');
  assert.equal(s.price, 3590);
  assert.equal(Math.round(s.margin), 45);
});

test('pricing at or below cost is flagged rather than passed silently', () => {
  assert.equal(pricingSummary(LINES, 0, 1500, 'flat').underwater, true);
  assert.equal(pricingSummary([], 0, 0, 'flat').underwater, false, 'an empty draft is not underwater');
});

test('the steps advance in the recorded order and stop at the end', () => {
  assert.deepEqual(CO_STEP_ORDER, ['requested', 'priced', 'sent', 'accepted', 'acknowledged']);
  assert.equal(nextStep('requested'), 'priced');
  assert.equal(nextStep('accepted'), 'acknowledged');
  assert.equal(nextStep('acknowledged'), '', 'the last step has no next');
  assert.equal(nextStep('nonsense'), '');
});

test('a change order that has been priced is not still "requested"', () => {
  // The dashboard counts stalled change orders by step, so one sitting at requested with a
  // price on it would be chased for work already done.
  assert.equal(impliedStep({ step: 'requested', price: 3590 }), 'priced');
  assert.equal(impliedStep({ step: 'requested', price: 0 }, [{ kind: 'labor' }]), 'priced');
  assert.equal(impliedStep({ step: 'requested', price: 0 }), 'requested');
  // A step further along is never dragged backwards by this.
  assert.equal(impliedStep({ step: 'sent', price: 0 }), 'sent');
});

test('unpriced change orders can be found by age', () => {
  const cos = [
    { id: 'a', price: 0, created_at: '2026-08-01T10:00:00Z' },
    { id: 'b', price: 3590, created_at: '2026-08-01T10:00:00Z' },
    { id: 'c', price: 0, created_at: '2026-08-04T10:00:00Z' },
  ];
  assert.deepEqual(unpricedSince(cos, '2026-08-02').map((c) => c.id), ['a']);
});

test('every stored key has a human label', () => {
  // 'lines' and 'flat' are chips too: without labels they rendered as bare lowercase keys.
  for (const key of ['in_person', 'text', 'email', 'phone', 'docusign', 'on_acceptance', 'after_payment', 'crew_days', 'sub_flat', 'flat_fee', 'labor', 'material', 'hardware', 'equipment', 'lines', 'flat']) {
    assert.notEqual(methodLabel(key), '', `${key} needs a label`);
    assert.ok(!methodLabel(key).includes('_'), `${key} label should be prose, not the key`);
  }
  assert.equal(methodLabel(''), '');
});
