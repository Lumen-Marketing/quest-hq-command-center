import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { calculateUnderwriting } from '../src/underwriting/calculator.js';

// docs/apps/Underwriter.questapp.json rebuilds the Underwriting calculator as an App Builder
// app somebody can install into a workspace. It is a hand-authored file with nine calculated
// fields, so the thing that can rot is the arithmetic drifting from the calculator it copies.
//
// These tests run the app's real formulas through the App Builder's real evaluator and check
// them against calculateUnderwriting on the same inputs. If either side changes, this fails.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const bundle = JSON.parse(readFileSync(join(root, 'docs', 'apps', 'Underwriter.questapp.json'), 'utf8'));
const app = bundle.app;

// The evaluator itself, lifted rather than reimplemented: a copy would pass against a parser
// the app no longer uses.
const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};
const typesAt = main.indexOf('const WB_FIELD_TYPES = {');
// eslint-disable-next-line no-eval
const WB_FIELD_TYPES = eval(`(${main.slice(typesAt + 'const WB_FIELD_TYPES = '.length, main.indexOf('\n};', typesAt) + 2)})`);
const wbChecklistStats = () => ({ pct: 0 });
// eslint-disable-next-line no-eval, no-unused-vars
const wbCalcRaw = eval(`(${cut('wbCalcRaw')})`);

const fieldByLabel = (label) => app.fields.find((f) => f.label === label);
const valuesFrom = (input) => {
  const values = {};
  Object.entries(input).forEach(([label, value]) => {
    const field = fieldByLabel(label);
    assert.ok(field, `no field labelled ${label}`);
    values[field.id] = value;
  });
  return values;
};
const evaluate = (label, values) => wbCalcRaw(app, fieldByLabel(label), values);

const GOLDEN = {
  'Contract price': 30000,
  Material: 8000,
  Labor: 6000,
  'Permits and fees': 500,
  Disposal: 1000,
  'Other direct cost': 500,
  'Overhead %': 10,
  'Commission %': 5,
  'Contingency %': 2,
  'Target margin %': 25,
};

// The import rules -- field types, dangling ids, the formula grammar, duplicate labels -- are
// checked for EVERY app in docs/apps by tests/app-bundles.test.mjs. What is left here is the
// one thing only this app can be checked for: that its arithmetic still agrees with the
// calculator it was built from.

test('the app computes what the shipped calculator computes', () => {
  const values = valuesFrom(GOLDEN);
  const expected = calculateUnderwriting({
    contractPrice: GOLDEN['Contract price'],
    materialCost: GOLDEN.Material,
    laborCost: GOLDEN.Labor,
    permitCost: GOLDEN['Permits and fees'],
    disposalCost: GOLDEN.Disposal,
    otherCost: GOLDEN['Other direct cost'],
    overheadPercent: GOLDEN['Overhead %'],
    commissionPercent: GOLDEN['Commission %'],
    contingencyPercent: GOLDEN['Contingency %'],
    targetMarginPercent: GOLDEN['Target margin %'],
  });

  assert.equal(evaluate('Direct costs', values), expected.directCost);
  assert.equal(evaluate('Overhead, commission, contingency', values), expected.percentageCost);
  assert.equal(evaluate('Total cost', values), expected.totalCost);
  assert.equal(evaluate('Gross profit', values), expected.grossProfit);
  assert.equal(evaluate('Gross margin %', values), expected.grossMarginPercent);
  assert.equal(evaluate('Max direct cost at target', values), expected.maxDirectCost);
  assert.equal(evaluate('Direct cost headroom', values), expected.directCostHeadroom);
  assert.equal(evaluate('Break-even price', values), expected.breakEvenPrice);
  // The gap the Decision status has to be read off by hand, since the grammar has no
  // conditional. Positive means the shipped calculator would say "Ready to price".
  // Rounded on both sides: the evaluator rounds to 2dp, and 29.67 - 25 in raw floating point
  // is 4.670000000000002.
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  assert.equal(evaluate('Margin gap', values), round2(expected.grossMarginPercent - expected.targetMarginPercent));
});

test('the two places a formula cannot match the calculator are known and documented', () => {
  // Recorded rather than fixed: the grammar has no Math.max and no guard against divide by
  // zero. Both are called out in the app description and in .ai/current-state.md.
  const zero = valuesFrom({ ...GOLDEN, 'Contract price': 0 });
  assert.equal(evaluate('Gross margin %', zero), null, 'renders as an em dash; the calculator says 0');
  assert.equal(calculateUnderwriting({ contractPrice: 0, materialCost: 8000 }).grossMarginPercent, 0);

  const overTarget = valuesFrom({ ...GOLDEN, 'Target margin %': 90 });
  assert.ok(evaluate('Max direct cost at target', overTarget) < 0, 'goes negative; the calculator clamps to 0');
  assert.equal(calculateUnderwriting({ contractPrice: 30000, targetMarginPercent: 90, overheadPercent: 10, commissionPercent: 5, contingencyPercent: 2 }).maxDirectCost, 0);
});
