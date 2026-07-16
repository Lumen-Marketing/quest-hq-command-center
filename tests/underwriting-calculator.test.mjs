import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateUnderwriting,
  normalizeUnderwritingInput,
} from '../src/underwriting/calculator.js';

test('underwriting calculator totals fixed and percentage costs', () => {
  const result = calculateUnderwriting({
    contractPrice: 30_000,
    materialCost: 8_000,
    laborCost: 6_000,
    permitCost: 500,
    disposalCost: 1_000,
    otherCost: 500,
    overheadPercent: 10,
    commissionPercent: 5,
    contingencyPercent: 2,
    targetMarginPercent: 25,
  });

  assert.equal(result.directCost, 16_000);
  assert.equal(result.percentageCost, 5_100);
  assert.equal(result.totalCost, 21_100);
  assert.equal(result.grossProfit, 8_900);
  assert.equal(result.grossMarginPercent, 29.67);
  assert.equal(result.maxDirectCost, 17_400);
  assert.equal(result.directCostHeadroom, 1_400);
  assert.equal(result.decision, 'approve');
});
test('underwriting calculator flags near-target and below-target margins', () => {
  const review = calculateUnderwriting({
    contractPrice: 20_000,
    materialCost: 9_000,
    laborCost: 5_000,
    overheadPercent: 8,
    commissionPercent: 4,
    contingencyPercent: 2,
    targetMarginPercent: 18,
  });
  const decline = calculateUnderwriting({
    contractPrice: 20_000,
    materialCost: 11_000,
    laborCost: 5_000,
    overheadPercent: 8,
    commissionPercent: 4,
    contingencyPercent: 2,
    targetMarginPercent: 18,
  });

  assert.equal(review.decision, 'review');
  assert.equal(decline.decision, 'decline');
  assert.ok(decline.directCostHeadroom < 0);
});

test('underwriting inputs are finite, non-negative, and percentage capped', () => {
  const normalized = normalizeUnderwritingInput({
    contractPrice: '-12',
    materialCost: 'not-a-number',
    laborCost: Infinity,
    overheadPercent: 140,
    commissionPercent: -5,
    contingencyPercent: 4.5,
    targetMarginPercent: 101,
  });

  assert.equal(normalized.contractPrice, 0);
  assert.equal(normalized.materialCost, 0);
  assert.equal(normalized.laborCost, 0);
  assert.equal(normalized.overheadPercent, 100);
  assert.equal(normalized.commissionPercent, 0);
  assert.equal(normalized.contingencyPercent, 4.5);
  assert.equal(normalized.targetMarginPercent, 100);
});

test('zero revenue returns a stable empty decision instead of NaN or Infinity', () => {
  const result = calculateUnderwriting({ contractPrice: 0, materialCost: 500 });

  assert.equal(result.grossMarginPercent, 0);
  assert.equal(result.breakEvenPrice, 500);
  assert.equal(result.decision, 'incomplete');
  assert.ok(Object.values(result).every((value) => typeof value !== 'number' || Number.isFinite(value)));
});
