const MONEY_FIELDS = [
  'contractPrice',
  'materialCost',
  'laborCost',
  'permitCost',
  'disposalCost',
  'otherCost',
];

const PERCENT_FIELDS = [
  'overheadPercent',
  'commissionPercent',
  'contingencyPercent',
  'targetMarginPercent',
];

const finiteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, finiteNumber(value)));
const roundMoney = (value) => Math.round((finiteNumber(value) + Number.EPSILON) * 100) / 100;
const roundPercent = (value) => Math.round((finiteNumber(value) + Number.EPSILON) * 100) / 100;

export function normalizeUnderwritingInput(input = {}) {
  const normalized = {};
  MONEY_FIELDS.forEach((key) => { normalized[key] = Math.max(0, finiteNumber(input[key])); });
  PERCENT_FIELDS.forEach((key) => { normalized[key] = clamp(input[key], 0, 100); });
  return normalized;
}
export function calculateUnderwriting(input = {}) {
  const values = normalizeUnderwritingInput(input);
  const directCost = values.materialCost
    + values.laborCost
    + values.permitCost
    + values.disposalCost
    + values.otherCost;
  const variableRate = (
    values.overheadPercent
    + values.commissionPercent
    + values.contingencyPercent
  ) / 100;
  const percentageCost = values.contractPrice * variableRate;
  const totalCost = directCost + percentageCost;
  const grossProfit = values.contractPrice - totalCost;
  const grossMarginPercent = values.contractPrice > 0
    ? (grossProfit / values.contractPrice) * 100
    : 0;
  const targetRate = values.targetMarginPercent / 100;
  const maxDirectCost = Math.max(0, values.contractPrice * (1 - variableRate - targetRate));
  const directCostHeadroom = maxDirectCost - directCost;
  const breakEvenDenominator = 1 - variableRate;
  const breakEvenPrice = breakEvenDenominator > 0 ? directCost / breakEvenDenominator : 0;
  const gap = grossMarginPercent - values.targetMarginPercent;
  const decision = values.contractPrice <= 0
    ? 'incomplete'
    : gap >= 0
      ? 'approve'
      : gap >= -3
        ? 'review'
        : 'decline';

  return {
    ...values,
    directCost: roundMoney(directCost),
    percentageCost: roundMoney(percentageCost),
    totalCost: roundMoney(totalCost),
    grossProfit: roundMoney(grossProfit),
    grossMarginPercent: roundPercent(grossMarginPercent),
    maxDirectCost: roundMoney(maxDirectCost),
    directCostHeadroom: roundMoney(directCostHeadroom),
    breakEvenPrice: roundMoney(breakEvenPrice),
    decision,
  };
}
