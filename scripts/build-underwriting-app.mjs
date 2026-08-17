// Builds docs/apps/Underwriting Calculator.questapp.json from the SAME line list the built-in
// Takeoff calculator uses, so the installable app and the card on the Underwriter page cannot
// drift apart. Run it after changing the defaults in src/underwriting/takeoff.js:
//
//   node scripts/build-underwriting-app.mjs
//
// What the App Builder cannot express, and why this file looks the way it does:
//
//   * wbCalcRaw has no ROUNDUP. Quantities that round up to whole boxes and rolls are typed
//     here instead of derived, with the working printed on the field so nobody has to guess.
//   * A calculation that references another calculation reads 0 -- calculation values are
//     never stored. So every total multiplies the stored qty and price fields out in full
//     rather than adding up the line totals beside it, however long that makes the formula.
//   * A sub-item list cannot hold a calculation at all: {Label} resolves against the APP's
//     fields, not the list's.

import { writeFileSync } from 'node:fs';
import { defaultTakeoffConfig, TAKEOFF_MEASUREMENTS } from '../src/underwriting/takeoff.js';

const config = defaultTakeoffConfig();
const fields = [];
const add = (field) => { fields.push({ required: false, hidden: false, config: {}, ...field }); };

add({ id: 'f-job', label: 'Job', type: 'text', required: true, config: { placeholder: '300-12444 — Re-roof' } });
add({ id: 'f-contact', label: 'Contact', type: 'company_contact' });
add({ id: 'f-priced', label: 'Priced on', type: 'date' });
add({ id: 'f-waste', label: 'Waste %', type: 'number', config: { unit: '%' } });
add({ id: 'f-tax', label: 'Tax %', type: 'number', config: { unit: '%' } });

// ---- the GAF report, and what it becomes with the waste allowance ----
TAKEOFF_MEASUREMENTS.forEach((item, index) => {
  add({ id: `m-${index}`, label: item.label, type: 'number', config: { unit: item.unit } });
});
TAKEOFF_MEASUREMENTS.forEach((item, index) => {
  add({
    id: `mw-${index}`,
    label: `${item.label} + waste`,
    type: 'calculation',
    config: { formula: `{${item.label}} + ({${item.label}} * {Waste %} / 100)` },
  });
});

// ---- every line, as it is bought ----
// Two lines share a name across groups ("Solar panels un-install & re-install" is labor AND a
// client price), and two fields cannot share a label, so the group breaks the tie.
const counts = new Map();
config.lines.forEach((line) => counts.set(line.name, (counts.get(line.name) || 0) + 1));
const GROUP = { labor: 'Labor', material: 'Material', client: 'Client' };

const named = config.lines.map((line, index) => ({
  ...line,
  index,
  base: counts.get(line.name) > 1 ? `${line.name} (${GROUP[line.group]})` : line.name,
}));

named.forEach((line) => {
  // The formula the built-in calculator uses, printed where the number is typed. It cannot be
  // evaluated here, but somebody working the sheet by hand should not have to remember it.
  const working = line.formula ? { placeholder: line.formula } : {};
  add({ id: `q-${line.index}`, label: `${line.base} qty`, type: 'number', config: working });
  add({ id: `p-${line.index}`, label: `${line.base} price`, type: 'money', config: { currency: '$' } });
  add({
    id: `t-${line.index}`,
    label: `${line.base} total`,
    type: 'calculation',
    config: { formula: `{${line.base} qty} * {${line.base} price}` },
  });
});

/** Every line of a group multiplied out from its STORED fields. */
const sumOf = (group) => named
  .filter((line) => line.group === group)
  .map((line) => `{${line.base} qty} * {${line.base} price}`)
  .join(' + ');

const labor = sumOf('labor');
const material = sumOf('material');
const client = sumOf('client');
const withTax = `(${material}) + ((${material}) * {Tax %} / 100)`;
const cost = `(${labor}) + ${withTax}`;

add({ id: 'f-labor', label: 'Labor total', type: 'calculation', config: { formula: labor } });
add({ id: 'f-material', label: 'Material total', type: 'calculation', config: { formula: material } });
add({ id: 'f-material-tax', label: 'Material with tax', type: 'calculation', config: { formula: withTax } });
add({ id: 'f-cost', label: 'Total labor & material', type: 'calculation', config: { formula: cost } });
add({ id: 'f-client', label: 'Total for client', type: 'calculation', config: { formula: client } });
add({ id: 'f-profit', label: 'Profit', type: 'calculation', config: { formula: `(${client}) - (${cost})` } });
add({
  id: 'f-margin',
  label: 'Margin %',
  type: 'calculation',
  config: { formula: `((${client}) - (${cost})) * 100 / (${client})` },
});
add({ id: 'f-notes', label: 'Notes', type: 'textarea' });
add({ id: 'f-created', label: 'Created', type: 'created_time', hidden: true });

const labels = fields.map((field) => field.label.toLowerCase());
const clash = labels.find((label, at) => labels.indexOf(label) !== at);
if (clash) throw new Error(`two fields share the label "${clash}"`);

const bundle = {
  format: 'quest-hq-app',
  version: 1,
  exported_at: '2026-08-14T00:00:00.000Z',
  app: {
    name: 'Underwriting Calculator',
    recordName: 'Takeoff',
    type: 'Underwriting',
    icon: 'ti-calculator',
    color: '#D4541F',
    description: 'The tile takeoff from Underwriting_Calculator.xlsx, as an app. Eight GAF measurements each carry their own waste allowance, every labor, material and client line has its quantity, unit price and total, and the totals work out the cost, the price and the margin. Quantities that round up to whole boxes and rolls are typed rather than derived — the App Builder\'s formulas have no ROUNDUP — and each of those fields shows the working it came from. The Takeoff calculator on the Underwriter page and on every quote does that rounding for you and is the quicker tool for pricing; this app is for keeping a takeoff as a record.',
    fields,
    collections: [],
    cardFields: ['f-job', TAKEOFF_MEASUREMENTS[0] ? 'm-0' : 'f-job', 'f-cost', 'f-client', 'f-margin'],
    items: [],
    automations: [],
    views: [],
    // No card totals the money, and none can: a sum widget reads item.values[fieldId], and
    // every figure in this app is a calculation, whose value is never stored. `w-client` used
    // to total "Total for client" and therefore showed $0.00 however many roofs were priced —
    // the same trap the header warns about, walked into one section further down. There is no
    // stored money field standing for the price either; the `price` fields are per-line unit
    // costs, and adding those across records means nothing.
    dashboard: [
      { id: 'w-count', type: 'metric', size: 1, config: { metric: 'count' } },
      { id: 'w-added', type: 'metric', size: 1, config: { metric: 'added' } },
      { id: 'w-recent', type: 'recent', size: 2, config: { limit: 5 } },
    ],
  },
};

const out = new URL('../docs/apps/Underwriting Calculator.questapp.json', import.meta.url);
writeFileSync(out, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(`${fields.length} fields, ${config.lines.length} lines`);
