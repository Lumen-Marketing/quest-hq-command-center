import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Every hand-authored .questapp.json in docs/apps, checked against the rules the importer
// actually applies and the evaluator that actually runs the formulas.
//
// These files are written by hand, so the failure mode is silent: an unknown field type
// imports as plain text, a private view is dropped, a formula that references another
// calculation reads 0 rather than erroring. All of it looks fine until somebody uses it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const appsDir = join(root, 'docs', 'apps');

const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};
const typesAt = main.indexOf('const WB_FIELD_TYPES = {');
// eslint-disable-next-line no-eval
const WB_FIELD_TYPES = eval(`(${main.slice(typesAt + 'const WB_FIELD_TYPES = '.length, main.indexOf('\n};', typesAt) + 2)})`);
// eslint-disable-next-line no-unused-vars
const wbChecklistStats = () => ({ pct: 0 });
// eslint-disable-next-line no-eval
const wbCalcRaw = eval(`(${cut('wbCalcRaw')})`);

const WIDGET_TYPES = ['metric', 'stages', 'records', 'recent', 'calendar', 'clock', 'note'];
// Not remapped on install: they name ids in the workspace the app was exported from, so a
// hand-authored file carrying one arrives pointing at nothing.
const UNREMAPPED = ['targetApp', 'targetCompany', 'relField', 'targetField', 'fixedItem', 'displayField', 'identifyField'];

const bundles = readdirSync(appsDir)
  .filter((name) => name.endsWith('.questapp.json'))
  .map((name) => [name, JSON.parse(readFileSync(join(appsDir, name), 'utf8'))]);

test('there is at least one app to check', () => {
  assert.ok(bundles.length > 0, 'docs/apps has no .questapp.json files');
});

for (const [name, bundle] of bundles) {
  const app = bundle.app;

  test(`${name}: imports without anything being silently rewritten`, () => {
    assert.equal(bundle.format, 'quest-hq-app');
    // The importer's whole validation is bundle.app with an array of fields.
    assert.ok(Array.isArray(app.fields) && app.fields.length > 0);
    assert.match(app.icon, /^ti-[a-z0-9-]+$/, 'a bad icon is silently reset to ti-address-book');
    assert.match(app.color, /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
    app.fields.forEach((field) => {
      assert.ok(WB_FIELD_TYPES[field.type], `"${field.label}" has type ${field.type}, which imports as plain text`);
    });
  });

  test(`${name}: nothing points at an id install cannot remap`, () => {
    app.fields.forEach((field) => {
      UNREMAPPED.forEach((key) => assert.ok(!field.config?.[key], `"${field.label}" carries config.${key}, which would dangle`));
    });
    const ids = new Set(app.fields.map((f) => f.id));
    (app.cardFields || []).forEach((id) => assert.ok(ids.has(id), `cardFields references ${id}`));
    (app.dashboard || []).forEach((w) => {
      assert.ok(WIDGET_TYPES.includes(w.type), `widget ${w.type} would become a metric`);
      if (w.config?.fieldId) assert.ok(ids.has(w.config.fieldId), `widget ${w.id} references ${w.config.fieldId}`);
    });
    (app.views || []).forEach((view) => {
      assert.equal(view.scope, 'team', 'a private view is dropped on install');
      const target = app.fields.find((f) => f.id === view.fieldId);
      assert.ok(target && ['status', 'category'].includes(target.type), `view "${view.title}" needs a status/category field`);
    });
  });

  test(`${name}: every formula is flattened to stored fields`, () => {
    // wbCalcRaw substitutes Number(values[id] || 0), and a calculation's value is never
    // written to values — so a formula referencing another calculation silently reads 0. This
    // is the one mistake that makes an app look right and compute wrong.
    const stored = new Set(app.fields.filter((f) => ['number', 'money'].includes(f.type)).map((f) => f.label.toLowerCase()));
    app.fields.filter((f) => f.type === 'calculation').forEach((field) => {
      [...field.config.formula.matchAll(/\{([^}]+)\}/g)].forEach(([, ref]) => {
        assert.ok(stored.has(ref.trim().toLowerCase()), `"${field.label}" references {${ref}}, which is not a stored number`);
      });
    });
  });

  test(`${name}: every formula survives the grammar`, () => {
    // Operators are + - * / ( ) and digits. Anything else — a function name, a comma, a % —
    // fails the whitelist and renders a warning triangle instead of a number.
    app.fields.filter((f) => f.type === 'calculation').forEach((field) => {
      const expr = field.config.formula.replace(/\{[^}]+\}/g, '1');
      assert.match(expr, /^[-+*/(). 0-9]+$/, `"${field.label}" has illegal characters: ${expr}`);
    });
  });

  test(`${name}: no two fields share a label`, () => {
    // Formulas reference by label and find() takes the first match, so a duplicate silently
    // redirects one of them.
    const seen = new Set();
    app.fields.forEach((field) => {
      const key = field.label.toLowerCase();
      assert.ok(!seen.has(key), `duplicate label: ${field.label}`);
      seen.add(key);
    });
  });

  test(`${name}: every category and status offers choices`, () => {
    // A category with no options cannot be filled in at all.
    app.fields.filter((f) => ['status', 'category'].includes(f.type)).forEach((field) => {
      const opts = field.config?.options || [];
      assert.ok(opts.length > 0, `"${field.label}" has no options`);
      opts.forEach((o) => {
        assert.ok(o.id && o.label, `"${field.label}" has an option with no id or label`);
        assert.match(o.color, /^#[0-9a-f]{6}$/i, `"${field.label}" option "${o.label}" has a colour that would be rewritten`);
      });
      const ids = new Set(opts.map((o) => o.id));
      assert.equal(ids.size, opts.length, `"${field.label}" has duplicate option ids`);
    });
  });

  test(`${name}: every sub-item list is importable too`, () => {
    (app.collections || []).forEach((collection) => {
      assert.ok(collection.id && collection.name, 'a sub-item list needs an id and a name');
      assert.ok(Array.isArray(collection.fields) && collection.fields.length, `${collection.name} has no fields`);
      const seen = new Set();
      collection.fields.forEach((field) => {
        assert.ok(WB_FIELD_TYPES[field.type], `${collection.name}: "${field.label}" imports as plain text`);
        // A sub-item calculation resolves {Label} against the APP's fields, not the list's, so
        // it reads the wrong field or zero. There is no way to write a correct one.
        assert.notEqual(field.type, 'calculation', `${collection.name}: "${field.label}" cannot be a calculation`);
        UNREMAPPED.forEach((key) => assert.ok(!field.config?.[key], `${collection.name}: "${field.label}" carries config.${key}`));
        const key = field.label.toLowerCase();
        assert.ok(!seen.has(key), `${collection.name}: duplicate label ${field.label}`);
        seen.add(key);
        if (['status', 'category'].includes(field.type)) {
          assert.ok((field.config?.options || []).length, `${collection.name}: "${field.label}" has no options`);
        }
      });
    });
    // A record-layout block naming a list that does not exist is deleted on install.
    (app.recordLayout || []).filter((b) => b.type === 'collection').forEach((block) => {
      assert.ok((app.collections || []).some((c) => c.id === block.config?.collectionId),
        `a layout block points at a sub-item list that is not in the file`);
    });
  });
}

// --- the Sales pipeline follows the reference flow -------------------------------------------

test('Sales Pipeline carries the five stages the flow names, and a way to lose', () => {
  const [, bundle] = bundles.find(([name]) => name.startsWith('Sales Pipeline'));
  const stage = bundle.app.fields.find((f) => f.label === 'Stage');
  const labels = stage.config.options.map((o) => o.label);
  assert.deepEqual(labels, ['Estimate sent', 'Negotiating', 'Contract sent', 'Waiting to sign', 'Won', 'Lost']);
});

test('Sales Pipeline is one deal per trade per address, grouped under a Project', () => {
  const [, bundle] = bundles.find(([name]) => name.startsWith('Sales Pipeline'));
  const byLabel = (label) => bundle.app.fields.find((f) => f.label === label);
  assert.equal(byLabel('Trade').type, 'category');
  assert.equal(byLabel('Trade').required, true, 'a deal with no trade cannot become its own job');
  assert.equal(byLabel('Address').type, 'location');
  assert.equal(byLabel('Project').type, 'text');
  assert.equal(byLabel('Contact').type, 'company_contact', 'the hub link — everything points at contact_id');
  assert.equal(byLabel('Contact').required, true);
  // "58th Pl — Roofing" is the record name, and a text field is what the contact card titles a
  // row by, so it has to be there and come first.
  assert.equal(bundle.app.fields[0].label, 'Deal');
  assert.equal(bundle.app.fields[0].type, 'text');
});

test('Sales Pipeline shows the draw schedule and its total', () => {
  // "draw schedule must total 100%" — the grammar has no conditional, so the total is shown
  // and read, not enforced.
  const [, bundle] = bundles.find(([name]) => name.startsWith('Sales Pipeline'));
  const app = bundle.app;
  const total = app.fields.find((f) => f.label === 'Draw total %');
  assert.equal(total.config.formula, '({Draw 1 %} + {Draw 2 %} + {Draw 3 %})');

  const values = {};
  const set = (label, value) => { values[app.fields.find((f) => f.label === label).id] = value; };
  set('Draw 1 %', 40); set('Draw 2 %', 40); set('Draw 3 %', 20); set('Contract price', 65000); set('Cost', 41000);
  const read = (label) => wbCalcRaw(app, app.fields.find((f) => f.label === label), values);

  assert.equal(read('Draw total %'), 100);
  assert.equal(read('Draw 1 amount'), 26000);
  assert.equal(read('Draw 3 amount'), 13000);
  // The signed contract from the reference card: $65,000.
  assert.equal(read('Gross profit'), 24000);
  assert.equal(read('Gross margin %'), 36.92);
});

test('Sales Pipeline margin survives a deal with no price yet', () => {
  // A deal is created before it is priced. Dividing by zero must not render a number that
  // looks like a margin.
  const [, bundle] = bundles.find(([name]) => name.startsWith('Sales Pipeline'));
  const app = bundle.app;
  const values = {};
  values[app.fields.find((f) => f.label === 'Cost').id] = 1000;
  const margin = wbCalcRaw(app, app.fields.find((f) => f.label === 'Gross margin %'), values);
  assert.equal(margin, null, 'renders an em dash, not a figure');
});

test('Jobs runs Unscheduled to Paid/closed, one job per trade', () => {
  const [, bundle] = bundles.find(([name]) => name.startsWith('Jobs'));
  const app = bundle.app;
  const status = app.fields.find((f) => f.label === 'Status');
  const labels = status.config.options.map((o) => o.label);
  // The flow names the two ends; the middle is what a trade passes through on the way.
  assert.equal(labels[0], 'Unscheduled');
  assert.ok(labels.includes('Paid / closed'));
  assert.ok(labels.includes('On hold'), 'a job that stops has somewhere to go');
  assert.equal(app.fields.find((f) => f.label === 'Trade').required, true);
  assert.equal(app.fields.find((f) => f.label === 'Contact').required, true);
  assert.equal(app.fields[0].label, 'Job', 'the text field the contact card titles a row by');
});

test('Jobs carries dailies and the change-order loop as sub-item lists', () => {
  // A job has one budget and many days, so these are lists rather than fields.
  const [, bundle] = bundles.find(([name]) => name.startsWith('Jobs'));
  const names = bundle.app.collections.map((c) => c.name);
  assert.deepEqual(names, ['Daily reports', 'Change orders']);
  const co = bundle.app.collections.find((c) => c.name === 'Change orders');
  const stages = co.fields.find((f) => f.label === 'Status').config.options.map((o) => o.label);
  // Born in Production, priced in Underwriting, sent through Sales, and back.
  assert.deepEqual(stages, ['Raised', 'Pricing', 'Sent', 'Accepted', 'Rejected']);
});

test('the Jobs money adds up the way a PM would check it', () => {
  const [, bundle] = bundles.find(([name]) => name.startsWith('Jobs'));
  const app = bundle.app;
  const values = {};
  const set = (label, value) => { values[app.fields.find((f) => f.label === label).id] = value; };
  const read = (label) => wbCalcRaw(app, app.fields.find((f) => f.label === label), values);
  set('Contract value', 65000); set('Budget', 41000); set('Cost to date', 38500);
  set('Invoiced to date', 39000); set('Collected to date', 26000);

  assert.equal(read('Budget variance'), 2500, 'under budget by 2,500');
  assert.equal(read('Gross profit'), 26500);
  assert.equal(read('Gross margin %'), 40.77);
  assert.equal(read('Outstanding'), 13000, 'invoiced but not collected');
  assert.equal(read('Left to invoice'), 26000);
});
