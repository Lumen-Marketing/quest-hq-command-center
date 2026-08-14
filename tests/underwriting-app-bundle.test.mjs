import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { TAKEOFF_MEASUREMENTS, calculateTakeoff, defaultTakeoffConfig } from '../src/underwriting/takeoff.js';

// "Use the underwriter calculator we made — that is the structure I want in the app builder."
//
// The installable app is generated from the SAME line list as the built-in Takeoff card
// (scripts/build-underwriting-app.mjs), so the two cannot drift. This checks that it still is:
// every line present, every price the same, and the totals landing on the spreadsheet's own
// numbers when the app is filled in the way an estimator would fill it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { app } = JSON.parse(readFileSync(join(root, 'docs', 'apps', 'Underwriting Calculator.questapp.json'), 'utf8'));
const config = defaultTakeoffConfig();
const field = (label) => app.fields.find((item) => item.label === label);

const SHEET = {
  total_sq: 65, rakes: 162, valleys: 44, drip_edge: 642,
  eaves: 480, ridges: 95, low_slope: 188, leak_barrier: 924,
};

/** The app's own grammar: {Label} refs, and nothing but arithmetic afterwards. */
function evaluate(formula, values) {
  const src = formula.replace(/\{([^}]+)\}/g, (_, name) => {
    const key = name.trim().toLowerCase();
    assert.ok(key in values, `formula refers to "${name}", which is not a field`);
    return String(values[key]);
  });
  assert.match(src, /^[-+*/(). 0-9]+$/, `"${formula}" uses something wbCalcRaw cannot parse`);
  // eslint-disable-next-line no-new-func
  return Function(`return ${src}`)();
}

/** The app filled in as an estimator would: the report, the rates, the worked-out quantities. */
function filled() {
  const priced = calculateTakeoff(config, SHEET);
  const values = { 'waste %': 10, 'tax %': 8.5 };
  TAKEOFF_MEASUREMENTS.forEach((item) => { values[item.label.toLowerCase()] = SHEET[item.key]; });
  priced.lines.forEach((line, index) => {
    values[app.fields.find((f) => f.id === `q-${index}`).label.toLowerCase()] = line.quantity;
    values[app.fields.find((f) => f.id === `p-${index}`).label.toLowerCase()] = line.price;
  });
  return values;
}

const round = (value) => Math.round(value * 100) / 100;

test('every line of the calculator is in the app, with its price', () => {
  config.lines.forEach((line, index) => {
    const qty = app.fields.find((item) => item.id === `q-${index}`);
    const price = app.fields.find((item) => item.id === `p-${index}`);
    const total = app.fields.find((item) => item.id === `t-${index}`);
    assert.ok(qty && price && total, `${line.name} is missing a field`);
    assert.ok(qty.label.startsWith(line.name) || qty.label.includes(line.name), `${line.name} lost its name`);
    assert.equal(price.type, 'money');
    assert.equal(total.type, 'calculation');
  });
  // 26 lines × 3, plus the 8 measurements and their 8 waste figures, plus the header and totals.
  assert.equal(app.fields.filter((item) => item.id.startsWith('q-')).length, config.lines.length);
});

test('the eight measurements each carry their own waste allowance', () => {
  const values = filled();
  TAKEOFF_MEASUREMENTS.forEach((item) => {
    const waste = field(`${item.label} + waste`);
    assert.ok(waste, `${item.label} has no waste figure`);
    assert.equal(round(evaluate(waste.config.formula, values)), round(SHEET[item.key] * 1.1));
  });
});

test('the totals land on the spreadsheet, to the cent', () => {
  const values = filled();
  const totals = {
    'Labor total': 8600,
    'Material total': 9202,
    'Material with tax': 9984.17,
    'Total labor & material': 18584.17,
    'Total for client': 29250,
    Profit: 10665.83,
    'Margin %': 36.46,
  };
  Object.entries(totals).forEach(([label, expected]) => {
    assert.equal(round(evaluate(field(label).config.formula, values)), expected, label);
  });
});

test('a line total is its own quantity times its own price', () => {
  const values = filled();
  assert.equal(round(evaluate(field('Eagle tile total').config.formula, values)), 960);
  assert.equal(round(evaluate(field('Dump & gas total').config.formula, values)), 800);
});

test('no total is built out of another calculation', () => {
  // A calculation's value is never stored, so a formula referring to one silently reads 0.
  // That is why the totals multiply the stored fields out in full instead of adding the line
  // totals sitting right beside them.
  const calculated = new Set(app.fields.filter((item) => item.type === 'calculation').map((item) => item.label.toLowerCase()));
  app.fields.filter((item) => item.type === 'calculation').forEach((item) => {
    [...item.config.formula.matchAll(/\{([^}]+)\}/g)].forEach(([, name]) => {
      assert.ok(!calculated.has(name.trim().toLowerCase()), `"${item.label}" reads "${name}", which is itself a calculation and would be 0`);
    });
  });
});

test('a quantity the app cannot work out shows the working instead', () => {
  // wbCalcRaw has no ROUNDUP, so those are typed -- but nobody should have to remember
  // "ROUNDUP(Total SQ + waste / 10)" to fill one in.
  const eagle = app.fields.find((item) => item.label === 'Eagle tile qty');
  assert.match(eagle.config.placeholder, /ROUNDUP/);
  const dump = app.fields.find((item) => item.label === 'Dump & gas qty');
  assert.equal(dump.config.placeholder, undefined, 'a line with no formula has no working to show');
});

test('the two lines that share a name are told apart', () => {
  // "Solar panels un-install & re-install" is both a labor line and a client price, and two
  // fields cannot share a label.
  const solar = app.fields.filter((item) => item.label.startsWith('Solar panels'));
  assert.ok(solar.length >= 6, 'both lines are there');
  const labels = solar.map((item) => item.label);
  assert.equal(new Set(labels).size, labels.length, 'and every one is distinct');
});
