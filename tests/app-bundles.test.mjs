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
      // remapApp remaps `collectionId` and ONLY that. `collectionIds` — which the editor
      // writes and record-page.js:206 PREFERS whenever it is a non-empty array — travels
      // verbatim, so it would arrive naming the bundle's own ids and the card would render
      // empty while looking configured. Singular only in a bundle.
      assert.ok(!Array.isArray(block.config?.collectionIds),
        'a layout block ships collectionIds, which install does not remap and record-page prefers');
    });
  });

  test(`${name}: a record layout shows every field`, () => {
    // `fieldIds: null` means "whatever fields exist", but an explicit list is honoured
    // EXACTLY (record-layout.js blockFields). So a field the author forgot to place is not
    // merely out of order — it is invisible on the record page, with nothing to say why.
    const layout = app.recordLayout || [];
    if (!layout.length) return;
    const groups = layout.filter((b) => b.type === 'fields');
    if (groups.some((b) => b.config?.fieldIds == null)) return;
    const placed = groups.flatMap((b) => b.config.fieldIds);
    const seen = new Set();
    placed.forEach((id) => {
      assert.ok(app.fields.some((f) => f.id === id), `the layout places ${id}, which is not a field`);
      assert.ok(!seen.has(id), `${id} is placed in two groups, so it renders twice`);
      seen.add(id);
    });
    app.fields.forEach((field) => {
      assert.ok(seen.has(field.id), `"${field.label}" is in no layout group, so the record page never shows it`);
    });
    layout.forEach((block) => {
      assert.ok(['fields', 'comments', 'meta', 'note', 'collection'].includes(block.type),
        `layout block ${block.id} has type ${block.type}, which normalizes to a field group`);
      assert.ok(block.size >= 1 && block.size <= 4, `layout block ${block.id} has size ${block.size}, which is clamped`);
    });
  });

  test(`${name}: a progress field fills from a checklist in this app`, () => {
    // config.source is the ONE field-config key wbBuildInstalledApp remaps (main.js), and it
    // only remaps a same-app id. A `link:<rel>:<field>` source is not remapped at all, and a
    // relationship cannot be in a bundle anyway, so it would install pointing at nothing.
    app.fields.filter((f) => f.type === 'progress' && f.config?.source).forEach((field) => {
      const source = String(field.config.source);
      assert.ok(!source.startsWith('link:'), `"${field.label}" fills from a linked record, which install cannot remap`);
      const target = app.fields.find((f) => f.id === source);
      assert.ok(target, `"${field.label}" fills from ${source}, which is not a field here`);
      assert.equal(target.type, 'checklist', `"${field.label}" fills from "${target.label}", which is not a checklist`);
    });
  });

  test(`${name}: a button carries nothing install would leave dangling`, () => {
    // Field ids are reminted on install and NOTHING inside a button's config is remapped —
    // not `when[].field`, not `set[].field`. A condition shipped in a bundle would compare a
    // field that no longer exists, which reads as "always false" and locks the button shut;
    // a set row would write to nothing. Both look configured and do nothing.
    app.fields.filter((f) => f.type === 'button').forEach((field) => {
      const config = field.config || {};
      assert.ok(!Array.isArray(config.when) || !config.when.length,
        `"${field.label}" ships conditions, whose field ids install cannot remap`);
      assert.ok(!Array.isArray(config.set) || !config.set.length,
        `"${field.label}" ships field changes, whose field ids install cannot remap`);
      assert.ok(!Array.isArray(config.fields) || !config.fields.length,
        `"${field.label}" ships a chosen field list, whose ids install cannot remap`);
      // A record button's `link` action is only implemented on the Company Contacts card
      // (button-push.js press() has no link branch for a record seat), so one here installs
      // enabled and does nothing when pressed.
      assert.ok(['push', 'move'].includes(config.action || 'push'),
        `"${field.label}" uses the ${config.action} action, which a record button cannot run`);
    });
  });

  test(`${name}: every automation resolves after install`, () => {
    // Automation field ids ARE remapped (trigger.fieldId and each action's fieldId), and
    // option ids are preserved — so these travel. Member ids do not.
    const byId = new Map(app.fields.map((f) => [f.id, f]));
    (app.automations || []).forEach((auto) => {
      assert.ok(auto.id && auto.name, 'an automation needs an id and a name');
      const trigger = auto.trigger || {};
      assert.ok(['created', 'updated', 'stage_moves', 'field_is'].includes(trigger.event),
        `"${auto.name}" has trigger ${trigger.event}, which falls back to "created"`);
      if (trigger.event === 'stage_moves') {
        const field = byId.get(trigger.fieldId);
        assert.equal(field?.type, 'status', `"${auto.name}" moves stages on a field that is not a status`);
        [trigger.from, trigger.to].filter(Boolean).forEach((id) => {
          assert.ok(field.config.options.some((o) => o.id === id), `"${auto.name}" names stage ${id}, which does not exist`);
        });
      }
      if (trigger.event === 'field_is') {
        const field = byId.get(trigger.fieldId);
        assert.ok(field, `"${auto.name}" triggers on ${trigger.fieldId}, which is not a field here`);
        assert.ok(!['file', 'image'].includes(field.type), `"${auto.name}" triggers on a ${field.type}, which has no comparable value`);
        // A sourced progress field is derived, not stored, so item.values holds nothing for
        // the numeric comparison to read and the rule never fires.
        assert.notEqual(field.type, 'progress', `"${auto.name}" triggers on a progress field, whose value is derived rather than stored`);
        if (['status', 'category'].includes(field.type)) {
          assert.ok(field.config.options.some((o) => o.id === trigger.value), `"${auto.name}" matches ${trigger.value}, which is not an option`);
        }
        if (field.type === 'checkbox') assert.match(String(trigger.value), /^(true|false)$/);
      }
      assert.ok((auto.actions || []).length, `"${auto.name}" does nothing`);
      auto.actions.forEach((action) => {
        assert.ok(['notify', 'set_field'].includes(action.type),
          `"${auto.name}" uses the ${action.type} action — "assign" names a member id, which is company-specific and cannot travel`);
        if (action.type === 'notify') { assert.ok(String(action.message || '').trim(), `"${auto.name}" posts an empty notification`); return; }
        const field = byId.get(action.fieldId);
        assert.ok(field, `"${auto.name}" sets ${action.fieldId}, which is not a field here`);
        const SETTABLE = ['text', 'textarea', 'status', 'category', 'date', 'number', 'money', 'email', 'phone', 'checkbox', 'location', 'duration', 'progress'];
        assert.ok(SETTABLE.includes(field.type), `"${auto.name}" sets "${field.label}", a ${field.type}, which the editor cannot set`);
        if (['status', 'category'].includes(field.type)) {
          assert.ok(field.config.options.some((o) => o.id === action.value), `"${auto.name}" sets "${field.label}" to ${action.value}, which is not an option`);
        }
      });
    });
  });

  test(`${name}: every dashboard widget has what it needs`, () => {
    const byId = new Map(app.fields.map((f) => [f.id, f]));
    (app.dashboard || []).forEach((widget) => {
      const cfg = widget.config || {};
      assert.ok(widget.size >= 1 && widget.size <= 4, `widget ${widget.id} has size ${widget.size}, which is clamped`);
      // `needs` in dashboard-widgets.js: a stages card without an option field, or a calendar
      // without a date field, renders empty rather than saying anything.
      if (widget.type === 'stages') {
        assert.ok(['status', 'category', 'user', 'checkbox'].includes(byId.get(cfg.fieldId)?.type), `widget ${widget.id} bars a field that has no options`);
      }
      if (widget.type === 'calendar') assert.equal(byId.get(cfg.fieldId)?.type, 'date', `widget ${widget.id} is a calendar over a non-date field`);
      if (widget.type === 'metric' && cfg.metric === 'sum') {
        // A sub-item total is addressed `col:<collectionId>:<fieldId>`, and remapConfig maps
        // fieldId through fieldIdMap — which holds no such key — so it installs as '' and the
        // card silently becomes a count of records. The figure is only reachable by adding the
        // widget after install, where the ids are real.
        assert.ok(!String(cfg.fieldId || '').startsWith('col:'),
          `widget ${widget.id} totals a sub-item field, which install wipes to ''`);
        assert.ok(['money', 'number'].includes(byId.get(cfg.fieldId)?.type), `widget ${widget.id} totals a field that holds no number`);
      }
      if (widget.type === 'note') assert.ok(String(cfg.text || '').trim(), `note widget ${widget.id} is blank`);
      // A records card narrowed to one option: the id is preserved on install, but only if it
      // is really one of that field's options.
      if (widget.type === 'records' && cfg.value) {
        assert.ok((byId.get(cfg.fieldId)?.config?.options || []).some((o) => o.id === cfg.value),
          `widget ${widget.id} filters to ${cfg.value}, which is not an option of that field`);
      }
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

const funnel = (prefix) => bundles.find(([name]) => name.startsWith(prefix))[1].app;
const labelled = (app, label) => app.fields.find((f) => f.label === label);

// --- the Underwriting Sheet prices a job the way Estimating does ------------------------------

test('labor is guys x days, not a typed number', () => {
  // "Calculating internal costs, including labor (guys x days) and line items." The existing
  // Underwriter app has a flat Labor money field; this is the one that derives it, so changing
  // the crew or the days moves every figure below.
  const app = funnel('Underwriting Sheet');
  ['Crew size', 'Days', 'Hours per day'].forEach((label) => assert.equal(labelled(app, label).type, 'number'));
  assert.equal(labelled(app, 'Labor rate').type, 'money');
  assert.equal(labelled(app, 'Man-hours').config.formula, '{Crew size} * {Days} * {Hours per day}');
  assert.equal(labelled(app, 'Labor cost').type, 'calculation');
});

test('the whole sheet prices out, from the takeoff to the price at target', () => {
  const app = funnel('Underwriting Sheet');
  const values = {};
  const set = (label, value) => { values[labelled(app, label).id] = value; };
  const read = (label) => wbCalcRaw(app, labelled(app, label), values);
  set('Line items total', 20000); set('Tax %', 8.6);
  set('Crew size', 4); set('Days', 3); set('Hours per day', 8); set('Labor rate', 45);
  set('Overhead %', 10); set('Commission %', 5); set('Contingency %', 3);
  set('Target margin %', 35); set('Quote price', 48000);

  assert.equal(read('Man-hours'), 96, 'four guys, three days, eight hours');
  assert.equal(read('Labor cost'), 4320, '96 man-hours at 45');
  assert.equal(read('Direct cost'), 26040, '20,000 + 8.6% tax + 4,320 labor');
  assert.equal(read('Overhead, commission & contingency'), 4687.2, '18% of direct');
  assert.equal(read('Total cost'), 30727.2);
  assert.equal(read('Gross profit'), 17272.8);
  assert.equal(read('Live margin %'), 35.99);
  // Each formula rounds once, on its own, so this is 35.985 - 35 rather than 35.99 - 35.
  assert.equal(read('Margin vs target'), 0.98, 'just under the 35% tier');
  assert.equal(read('Price at target margin'), 47272.62, 'what it would have to sell for to hit 35%');
});

test('a sheet with no price yet shows no margin, and a 100% target no price', () => {
  // Both denominators can legitimately be zero while somebody is still filling the sheet in.
  // Neither may render a number that looks like an answer.
  const app = funnel('Underwriting Sheet');
  const bare = { [labelled(app, 'Line items total').id]: 1000 };
  assert.equal(wbCalcRaw(app, labelled(app, 'Live margin %'), bare), null);
  const impossible = { [labelled(app, 'Quote price').id]: 48000, [labelled(app, 'Target margin %').id]: 100 };
  assert.equal(wbCalcRaw(app, labelled(app, 'Price at target margin'), impossible), null);
});

test('the Underwriting Sheet runs the four steps and hands off to the Closer', () => {
  const app = funnel('Underwriting Sheet');
  const stages = labelled(app, 'Stage').config.options.map((o) => o.label);
  assert.deepEqual(stages.slice(0, 4), ['Scope & takeoff', 'Underwriting sheet', 'Quote built', 'Handed to the Closer']);
  assert.ok(stages.includes('On hold'), 'a sheet that stalls has somewhere to go');
  assert.equal(labelled(app, 'Estimator').type, 'user', 'Owner: Estimating');
  // The takeoff is the spreadsheet field, laid out once so every record starts from it.
  assert.equal(labelled(app, 'Takeoff').type, 'sheet');
  assert.equal(labelled(app, 'Takeoff').config.sheet.cells.A1, 'Measurement');
  // Vendor pricing lives on the line it prices, rather than as one field on the record.
  const lines = app.collections.find((c) => c.name === 'Line items');
  assert.ok(lines.fields.some((f) => f.label === 'Vendor'));
  assert.ok(lines.fields.some((f) => f.label === 'Unit price' && f.type === 'money'));
  // Margin tier is the policy; Target margin % is the number the arithmetic can actually use.
  assert.equal(labelled(app, 'Margin tier').type, 'category');
  assert.equal(labelled(app, 'Target margin %').type, 'number');
});

test('the Underwriting Sheet takeoff survives the sheet normalizer', async () => {
  // A hand-authored grid that the normalizer rewrites would install as a different sheet than
  // the one written here — or, with a bad shape, as an empty one.
  const { normalizeSheetFull } = await import('../src/sheet/sheet-format.js');
  const authored = funnel('Underwriting Sheet').fields.find((f) => f.type === 'sheet').config.sheet;
  const normalized = normalizeSheetFull(authored);
  assert.equal(normalized.rows, authored.rows);
  assert.equal(normalized.cols, authored.cols);
  assert.equal(normalized.headerRow, true);
  assert.deepEqual(normalized.cells, authored.cells, 'the normalizer dropped or rewrote a cell');
  assert.match(normalized.cells.E2, /^=/, 'the waste column is a formula');
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
