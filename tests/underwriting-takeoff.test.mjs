import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_TAX_PERCENT,
  TAKEOFF_MEASUREMENTS,
  calculateTakeoff,
  defaultTakeoffConfig,
  evaluateFormula,
  normalizeTakeoffConfig,
} from '../src/underwriting/takeoff.js';

// The spreadsheet the defaults came from, with its own numbers in it. Every figure asserted
// below was read off Underwriting_Calculator.xlsx, so if a default price, quantity or formula
// is ever changed by accident, this says so in the terms the estimator would notice.
const SHEET = {
  total_sq: 65, rakes: 162, valleys: 44, drip_edge: 642,
  eaves: 480, ridges: 95, low_slope: 188, leak_barrier: 924,
};

const run = (config = defaultTakeoffConfig(), measurements = SHEET) => calculateTakeoff(config, measurements);
const line = (result, name) => result.lines.find((item) => item.name === name);

test('the waste column matches the spreadsheet', () => {
  const { measurements } = run();
  const withWaste = Object.fromEntries(measurements.map((item) => [item.key, item.withWaste]));
  assert.deepEqual(withWaste, {
    total_sq: 71.5, rakes: 178.2, valleys: 48.4, drip_edge: 706.2,
    eaves: 528, ridges: 104.5, low_slope: 206.8, leak_barrier: 1016.4,
  });
});

test('every default quantity works out to the number in the sheet', () => {
  const result = run();
  const quantities = {
    'Tile install labor per square': 65,
    'Dump & gas': 1,
    'Eagle tile': 8, // ROUNDUP(71.5 / 10)
    'Tile trim': 36, // ROUNDUP(178.2 / 5)
    'Ply40 Westlake Royal underlayment': 65,
    'Furring strips': 66,
    'Valley metals': 5, // ROUNDUP(48.4 / 10)
    'Drip edge 2x2 10ft': 71, // ROUNDUP(706.2 / 10)
    'Birdstop / eave riser': 66, // ROUND(528 / 8)
    'Pipejacks': 10,
    'Plastic cap nails': 5, // ROUNDUP(65 / 15)
    'Nails': 3, // ROUNDUP(65 / 22)
    'Base sheet 2sq': 2, // ROUNDUP(206.8 / 200)
    'Cap sheet 1sq': 4, // twice the base sheet
    'Ice and water barrier': 6, // ROUNDUP(1016.4 / 200)
    'Whole roof shingle replacement (underlayment, drip edge)': 65,
  };
  Object.entries(quantities).forEach(([name, expected]) => {
    assert.equal(line(result, name).quantity, expected, name);
  });
  assert.deepEqual(result.errors, [], 'no default formula fails to evaluate');
});

test('the totals match the spreadsheet to the cent', () => {
  const result = run();
  assert.equal(result.laborTotal, 8600);
  assert.equal(result.materialTotal, 9202);
  assert.equal(result.materialWithTax, 9984.17); // 9202 * 1.085
  assert.equal(result.costTotal, 18584.17);
  assert.equal(result.clientTotal, 29250);
  assert.equal(result.profit, 10665.83);
  assert.equal(result.marginPercent, 36.46);
});

test('a rounding boundary lands where the spreadsheet lands', () => {
  // 528 / 8 is exactly 66, but in binary floating point it is 65.99999999999999, and a naive
  // Math.ceil answers 67 -- a whole extra box of birdstop on every tile job.
  assert.equal(evaluateFormula('ROUNDUP(528 / 8)', () => 0).value, 66);
  assert.equal(evaluateFormula('ROUNDUP(206.8 / 200)', () => 0).value, 2);
  assert.equal(evaluateFormula('ROUNDUP(65 / 15)', () => 0).value, 5);
});

test('an empty report prices at zero rather than failing', () => {
  const result = calculateTakeoff(defaultTakeoffConfig(), {});
  assert.equal(result.clientTotal, 0);
  assert.equal(result.marginPercent, 0, 'no dividing by a client total of nothing');
  assert.equal(result.laborTotal, 800, 'the hand-typed quantities still stand');
  assert.deepEqual(result.errors, []);
});

// ---- the formulas are defaults, not rules -------------------------------------------------

test('an edited formula is what gets used', () => {
  const config = defaultTakeoffConfig();
  const eagle = config.lines.find((item) => item.name === 'Eagle tile');
  eagle.formula = 'ROUNDUP({Total SQ + waste} / 8)';
  const result = run(config);
  assert.equal(line(result, 'Eagle tile').quantity, 9); // ROUNDUP(71.5 / 8)
});

test('an edited waste allowance flows through every formula that uses it', () => {
  const config = { ...defaultTakeoffConfig(), waste_percent: 15 };
  const result = run(config);
  assert.equal(result.measurements.find((item) => item.key === 'total_sq').withWaste, 74.75);
  assert.equal(line(result, 'Eagle tile').quantity, 8); // ROUNDUP(74.75 / 10)
  assert.equal(line(result, 'Ply40 Westlake Royal underlayment').quantity, 65, 'raw refs keep the reported figure');
});

test('an edited tax rate changes the cost, and zero tax is not treated as missing', () => {
  assert.equal(run({ ...defaultTakeoffConfig(), tax_percent: 0 }).materialWithTax, 9202);
  assert.equal(normalizeTakeoffConfig({ tax_percent: 0 }).tax_percent, 0);
  assert.equal(normalizeTakeoffConfig({}).tax_percent, DEFAULT_TAX_PERCENT, 'absent still means the default');
});

test('a line added by hand prices like any other', () => {
  const config = defaultTakeoffConfig();
  config.lines.push({ id: 'ln-new', group: 'material', name: 'Ridge vent', formula: '{Ridges + waste} / 4', qty: 0, price: 22 });
  const result = run(config);
  assert.equal(line(result, 'Ridge vent').quantity, 26.125); // 104.5 / 4
  assert.equal(line(result, 'Ridge vent').total, 574.75);
  assert.equal(result.materialTotal, 9776.75);
});

test('a measurement no default formula touches is still available to one', () => {
  // Ridges is measured and carried through the waste column, but nothing prices off it until
  // somebody writes a formula that does. Capturing it was the point.
  assert.ok(TAKEOFF_MEASUREMENTS.some((item) => item.key === 'ridges'));
  assert.ok(!defaultTakeoffConfig().lines.some((item) => /ridges/i.test(item.formula)));
});

// ---- what happens when a formula is wrong -------------------------------------------------

test('a broken formula is reported against its own line, and the rest still prices', () => {
  const config = defaultTakeoffConfig();
  config.lines.find((item) => item.name === 'Eagle tile').formula = 'ROUNDUP({Total SQ + waste} / )';
  const result = run(config);
  assert.match(line(result, 'Eagle tile').error, /A value is missing/);
  assert.equal(line(result, 'Eagle tile').quantity, 0);
  assert.equal(line(result, 'Tile trim').total, 180, 'its neighbours are unaffected');
  assert.equal(result.errors.length, 1);
});

test('an unclosed bracket says which way it is wrong', () => {
  // The likeliest typo of all, and the message has to be readable by an estimator, not a parser.
  assert.match(evaluateFormula('ROUNDUP(65 / 10', () => 0).error, /A bracket is never closed/);
});

test('a name that is not there says so instead of quietly reading zero', () => {
  const config = defaultTakeoffConfig();
  config.lines[0].formula = '{Total SQFT}';
  assert.match(line(run(config), 'Tile install labor per square').error, /Nothing here is called "Total SQFT"/);
});

test('two lines that refer to each other are caught, not left spinning', () => {
  const config = defaultTakeoffConfig();
  config.lines.find((item) => item.name === 'Base sheet 2sq').formula = '{Cap sheet 1sq} / 2';
  const result = run(config);
  assert.ok(result.errors.length >= 1);
  assert.ok(result.errors.some((message) => /refers back to itself/.test(message)));
  assert.equal(result.materialTotal, 8422, 'the two lines drop to zero; nothing else moves');
});

test('a formula cannot reach outside the arithmetic it is allowed', () => {
  // It is a text box on a page anyone in the company can edit, so it is parsed, never run.
  ['constructor', 'this', 'process.exit(1)', '[].map', '1;alert(1)', 'window'].forEach((source) => {
    const { value, error } = evaluateFormula(source, () => 1);
    assert.equal(value, 0, source);
    assert.ok(error, `${source} should be refused`);
  });
});

test('names are matched however they are typed', () => {
  const config = defaultTakeoffConfig();
  config.lines[0].formula = '{  total sq  } + {TOTAL SQ}';
  assert.equal(line(run(config), 'Tile install labor per square').quantity, 130);
});

test('division by zero is refused rather than answering Infinity', () => {
  const { value, error } = evaluateFormula('10 / 0', () => 0);
  assert.equal(value, 0);
  assert.match(error, /Division by zero/);
});

test('a config saved from an older version still opens', () => {
  const result = calculateTakeoff({ lines: [{ name: 'Just this', formula: '{Total SQ}', price: 10 }] }, SHEET);
  assert.equal(result.lines.length, 1);
  assert.equal(result.lines[0].group, 'material', 'an unknown group is not a crash');
  assert.equal(result.materialTotal, 650);
  assert.equal(result.wastePercent, 10);
});
