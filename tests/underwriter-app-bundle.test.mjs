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

test('the file is the shape the importer accepts', () => {
  // The whole validation is `bundle.app` with an array of fields — but the rest still has to
  // survive normalisation rather than being silently rewritten.
  assert.equal(bundle.format, 'quest-hq-app');
  assert.ok(Array.isArray(app.fields) && app.fields.length > 0);
  assert.match(app.icon, /^ti-[a-z0-9-]+$/, 'a bad icon is silently reset to ti-address-book');
  assert.match(app.color, /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  app.fields.forEach((field) => {
    assert.ok(WB_FIELD_TYPES[field.type], `"${field.label}" has type ${field.type}, which imports as plain text`);
  });
});

test('nothing points at an id that install cannot remap', () => {
  // relationship/rollup targets and progress `link:` sources are NOT remapped on install, so
  // they would arrive pointing at nothing in a fresh workspace.
  app.fields.forEach((field) => {
    ['targetApp', 'targetCompany', 'relField', 'targetField', 'fixedItem', 'displayField', 'identifyField']
      .forEach((key) => assert.ok(!field.config?.[key], `"${field.label}" carries config.${key}, which would dangle`));
  });
  // These ARE remapped, so they must resolve inside the bundle.
  const ids = new Set(app.fields.map((f) => f.id));
  (app.cardFields || []).forEach((id) => assert.ok(ids.has(id), `cardFields references ${id}`));
  (app.dashboard || []).forEach((w) => {
    if (w.config?.fieldId) assert.ok(ids.has(w.config.fieldId), `widget ${w.id} references ${w.config.fieldId}`);
  });
  (app.views || []).forEach((view) => {
    assert.equal(view.scope, 'team', 'a private view is dropped on install');
    assert.ok(['status', 'category'].includes(fieldByLabel(app.fields.find((f) => f.id === view.fieldId)?.label)?.type));
  });
});

test('every formula is flattened to stored fields only', () => {
  // wbCalcRaw substitutes `Number(values[id] || 0)`, and a calculation's value is never
  // written to values — so a formula that references another calculation silently reads 0.
  // This is the single mistake that would make the app look right and compute wrong.
  const stored = new Set(app.fields.filter((f) => ['number', 'money'].includes(f.type)).map((f) => f.label.toLowerCase()));
  app.fields.filter((f) => f.type === 'calculation').forEach((field) => {
    [...field.config.formula.matchAll(/\{([^}]+)\}/g)].forEach(([, ref]) => {
      assert.ok(stored.has(ref.trim().toLowerCase()), `"${field.label}" references {${ref}}, which is not a stored number`);
    });
  });
});

test('every formula survives the grammar after substitution', () => {
  // Operators are + - * / ( ) and digits. Anything else — a function name, a comma, a % —
  // fails the whitelist and the field renders a warning triangle instead of a number.
  app.fields.filter((f) => f.type === 'calculation').forEach((field) => {
    const expr = field.config.formula.replace(/\{[^}]+\}/g, '1');
    assert.match(expr, /^[-+*/(). 0-9]+$/, `"${field.label}" has illegal characters: ${expr}`);
  });
});

test('no two fields share a label, because formulas reference by label', () => {
  // find() takes the first match, so a duplicate silently redirects a formula.
  const seen = new Set();
  app.fields.forEach((field) => {
    const key = field.label.toLowerCase();
    assert.ok(!seen.has(key), `duplicate label: ${field.label}`);
    seen.add(key);
  });
});

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
